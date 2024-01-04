<!-- @format -->
<script setup lang="ts">
// @ts-expect-error
import { useMq } from "vue3-mq";
import { computed, onMounted, ref } from "vue";
import { Image, ThresholdAlgorithm } from "image-js";
import { TileColor, getColorString, tileColors } from "@/scripts/cube/colors";
import router from "@/router";
import { analyzeFaceImage } from "@/scripts/scanner/scanner";
import { FacePosition, SavebleCube } from "@/scripts/cube/types";
import CubeRotation from "./CubeRotation.vue";
import {
   Plane,
   RotationCommand,
   RotationDirection,
   RotationDirection as RotDir,
} from "@/scripts/cube/commands";
import { Phase } from "@/scripts/scanner/types";
import { saveCubeToSessionStorage, phaseColorsToCubeFace } from "@/scripts/scanner/saving";
import { CubeFace } from "@/scripts/cube/cubeFace";

const emit = defineEmits<{
   (e: "finished"): void;
   (e: "saved-cube"): void;
}>();

const phase = ref(0);
const phases = ref<Phase[]>([
   new Phase(FacePosition.front, [new RotationCommand(Plane.yPlane, 3, RotationDirection.right)]),
   new Phase(FacePosition.right, [new RotationCommand(Plane.yPlane, 3, RotationDirection.right)]),
   new Phase(FacePosition.back, [new RotationCommand(Plane.yPlane, 3, RotationDirection.right)]),
   new Phase(FacePosition.top, [new RotationCommand(Plane.xPlane, 3, RotationDirection.left)]),
   new Phase(FacePosition.left, [new RotationCommand(Plane.yPlane, 3, RotationDirection.right)]),
   new Phase(FacePosition.bottom, [new RotationCommand(Plane.yPlane, 3, RotationDirection.right)]),
]);
const cubeFaces = ref<CubeFace[]>([]);
const playing = ref(false);
const constraints = ref<MediaStreamConstraints>({
   audio: false,
   video: {
      width: {
         ideal: 1920,
      },
      height: {
         ideal: 1080,
      },
      facingMode: "environment",
   },
});
const mq = useMq();
const devices = ref<MediaDeviceInfo[]>([]);
const selectedDevice = ref<string | null>(null);
const selectedColors = ref<TileColor[]>([]);
const isColorSelection = ref(false);

const videoEl = ref<HTMLVideoElement>(null!);
const deviceSelectorEl = ref<HTMLSelectElement>(null!);
const canvasEl = ref<HTMLCanvasElement>(null!);
const screenshotImgEl = ref<HTMLImageElement>(null!);
const cameraFocusAreaEl = ref<HTMLDivElement>(null!);

onMounted(async () => {
   await startStream();
   await getDevices();
   selectedDevice.value = devices.value[0]?.deviceId;

   setInterval(() => {
      if (isColorSelection.value) return;
      try {
         analyze();
      } catch {}
   }, 400);
});

async function startStream() {
   const stream = await navigator.mediaDevices.getUserMedia(constraints.value);

   videoEl.value.srcObject = stream;
   videoEl.value.play();
   playing.value = true;
}
async function getDevices() {
   devices.value = (await navigator.mediaDevices.enumerateDevices()).filter(
      (x) => x.kind === "videoinput"
   );
}
function onDeviceChange() {
   selectedDevice.value = deviceSelectorEl.value.value;
   (constraints.value as any).deviceId = {
      exact: deviceSelectorEl.value.value,
   };
   startStream();
}
function play() {
   if (playing.value) return;
   videoEl.value.play();
   playing.value = true;
}
function pause() {
   if (!playing.value) return;
   videoEl.value.pause();
   playing.value = false;
}
function togglePlay() {
   if (playing.value) pause();
   else play();
}
function scan() {
   pause();
   analyze();
   isColorSelection.value = true;
}
function analyze() {
   const image = getCroppedImage();
   selectedColors.value = analyzeFaceImage(image);
   // screenshotImgEl.value.src = image.toDataURL();
}
function getCroppedImage(): Image {
   canvasEl.value.width = videoEl.value.videoWidth;
   canvasEl.value.height = videoEl.value.videoHeight;
   const ctx = canvasEl.value.getContext("2d")!;
   const box = cameraFocusAreaEl.value.getBoundingClientRect();
   ctx.drawImage(videoEl.value, 0, 0);

   let image = Image.fromCanvas(canvasEl.value);

   const imagePixelPerScreenPixel = Math.min(
      image.width / window.innerWidth,
      image.height / window.innerHeight
   );

   const invisibleLeft = (image.width / imagePixelPerScreenPixel - window.innerWidth) / 2;
   const invisibleTop = (image.height / imagePixelPerScreenPixel - window.innerHeight) / 2;

   image = image.crop({
      x: (invisibleLeft + box.left) * imagePixelPerScreenPixel,
      y: (invisibleTop + box.top) * imagePixelPerScreenPixel,
      width: box.width * imagePixelPerScreenPixel,
      height: box.height * imagePixelPerScreenPixel,
   });

   return image;
}
function selectDifferentColor(idx: number, color: TileColor) {
   const newSelectedColors = [...selectedColors.value];
   newSelectedColors[idx] = color;
   selectedColors.value = newSelectedColors;
}
function nextFace() {
   phases.value[phase.value].colors = [...selectedColors.value];
   cubeFaces.value.push(
      phaseColorsToCubeFace(phases.value[phase.value].key, phases.value[phase.value].colors)
   );

   if (phase.value === phases.value.length - 1) {
      saveCube();
      emit("finished");
      return;
   }

   phase.value++;
   isColorSelection.value = false;
   play();
}
function saveCube() {
   saveCubeToSessionStorage(phases.value);
   emit("saved-cube");
}
function restart() {
   phase.value = 0;
   isColorSelection.value = false;
   cubeFaces.value = [];
   play();
}

const previousRotations = computed<RotationCommand[]>(
   () =>
      phases.value
         .slice(1, phase.value)
         .map((x) => x.rotationsForwards)
         .flat() ?? []
);
</script>

<template>
   <div class="wrapper">
      <div class="upper-controls controls">
         <div>
            <select
               class="device-select"
               ref="deviceSelectorEl"
               :value="selectedDevice"
               v-on:change="onDeviceChange"
            >
               <option v-for="device in devices" :value="device.deviceId" :key="device.deviceId">
                  {{ device.label }}
               </option>
            </select>
            <p class="phase">{{ $t(`scanner.phases.${FacePosition[phases[phase].key]}`) }}</p>
         </div>
      </div>

      <p class="check-msg msg">
         <template v-if="isColorSelection"> {{ $t("scanner.messages.checkColors") }} </template>
         <template v-if="!isColorSelection && phase === 0">
            {{ $t("scanner.messages.placingExplanation") }}
         </template>
      </p>

      <div class="camera-focus-container">
         <div ref="cameraFocusAreaEl" class="camera-focus-area">
            <div class="camera-focus focus-one"></div>
            <div class="camera-focus focus-two"></div>

            <div class="color-selectors" v-if="selectedColors.length > 0">
               <select
                  v-for="(selectedColor, idx) in selectedColors"
                  :value="selectedColor"
                  :style="`background-color: ${getColorString(selectedColor)}; color: #0000`"
                  v-on:change="e => selectDifferentColor(idx, parseInt((e.target as any).value))"
                  :disabled="!isColorSelection"
               >
                  <option
                     v-for="tileColor in tileColors"
                     :key="tileColor"
                     :value="tileColor"
                     :style="
                        mq.lgPlus
                           ? `background-color: ${getColorString(tileColor)}; color: #000`
                           : `background-color: gray; color: ${getColorString(tileColor)}`
                     "
                  >
                     {{ $t(`color.${TileColor[tileColor]}`) }}
                  </option>
               </select>
            </div>
            <p class="rotate-msg msg" v-if="!isColorSelection && phase > 0">
               {{ $t("scanner.messages.rotateInstruction") }}
            </p>
            <button v-if="isColorSelection" v-on:click="nextFace" class="focus-area-button">
               🗸
               {{
                  phase < phases.length - 1
                     ? $t("scanner.buttons.colorsMatch")
                     : $t("scanner.buttons.solve")
               }}
            </button>
            <button v-else v-on:click="scan" class="scan-button focus-area-button">
               {{ $t("scanner.buttons.scan") }}
            </button>
         </div>
      </div>

      <div class="rotation-arrow-container" v-if="!isColorSelection && phase > 0">
         <CubeRotation
            :cube-faces="(cubeFaces as CubeFace[])"
            :rotations="phases[phase].rotationsForwards"
            :start-rotations="previousRotations"
         />
      </div>

      <img ref="screenshotImgEl" style="position: absolute; max-width: 90vw; top: 30px" />

      <div class="lower-controls controls">
         <button v-on:click="$emit('finished')">{{ $t("scanner.buttons.goBack") }}</button>
         <button v-on:click="restart" class="restart">{{ $t("scanner.buttons.restart") }}</button>
      </div>

      <video width="100%" height="auto" ref="videoEl"></video>
      <canvas
         ref="canvasEl"
         style="display: none; opacity: 0; position: absolute; top: 0; pointer-events: none"
      ></canvas>
   </div>
</template>

<style lang="scss" scoped>
.wrapper {
   position: absolute;
   inset: 0;
   overflow: hidden;
}

video {
   width: 100%;
   height: 100%;
   object-fit: cover;
   pointer-events: none;
}

button {
   border: none;
   color: white;
   border-radius: 1em;
   padding: 0.8em;
   background-color: #8db0be;
   font-family: "Rubik", sans-serif;
   font-size: medium;
   cursor: pointer;

   &:hover {
      background-color: #81a2af;
      transition: 300ms;
   }
}

.msg {
   color: white;
   font-family: "Rubik", sans-serif;
   position: absolute;
   text-align: center;
   left: 50%;
   transform: translateX(-50%);
   text-shadow: rgb(0, 0, 0) 0px 0px 5px;

   font-size: large;
   width: 75%;
}

.check-msg {
   top: 2em;
}

.rotate-msg {
   bottom: -7.5em;
}

.controls {
   position: absolute;
   z-index: 2;
   width: 100%;
   padding: 0.5em;
   box-sizing: border-box;
}
.upper-controls {
   > div {
      max-width: 400px;
      margin: auto;
      display: grid;
      grid-template-columns: 2fr 1fr;
      column-gap: 1em;

      .device-select {
         width: 100%;
         border-radius: 0.5em;
         padding: 3px;
         border: none;
      }

      .phase {
         font-weight: bold;
         background-color: white;
         padding: 3px;
         border-radius: 0.5em;
         color: black;
         margin: 0;
      }
   }
}
.lower-controls {
   bottom: 0;
   display: flex;

   .restart {
      margin-left: auto;
      font-size: medium;
   }
}

.rotation-arrow-container {
   position: absolute;
   width: 100%;
   align-items: center;
   top: 3em;

   .rotation-arrow {
      width: 4em;
      height: 6em;
      display: flex;
      margin: auto;

      p {
         color: red;
         font-size: xx-large;
         translate: -2em;
         text-shadow: 2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff,
            1px -1px #fff, -1px 1px #fff;
      }
   }
}

.camera-focus-container {
   position: absolute;
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   z-index: 5;
   pointer-events: none;
   top: 0;

   > div {
      margin: auto;
   }

   .focus-area-button {
      position: absolute;
      bottom: 0;
      transform: translate(-50%, 150%);
      background-color: #d007eb;
      color: white;
      width: max-content;
   }

   .camera-focus-area {
      margin: auto;
      position: relative;
      width: min(80vw, 400px);
      aspect-ratio: 1;

      pointer-events: all;

      .color-selectors {
         width: 100%;
         height: 100%;
         display: grid;
         grid-template-columns: 1fr 1fr 1fr;
         z-index: 2;
         justify-items: center;
         align-items: center;

         select {
            width: 3em;
            height: 3em;
            border-radius: 50%;
            border: 2px solid white;
         }
      }

      .camera-focus {
         width: 100%;
         height: 50%;
         margin: auto;
         position: absolute;
         z-index: 1;
         pointer-events: none;

         &::after,
         &::before {
            content: "";
            border-color: #d007eb;
            border-width: 0.3em;
            width: 20%;
            aspect-ratio: 1;
            position: absolute;
         }

         &.focus-one {
            top: 0;
            &::after {
               border-left-style: solid;
               border-top-style: solid;
               border-top-left-radius: 0.5em;
               left: 0;
               top: 0;
            }

            &::before {
               border-right-style: solid;
               border-top-style: solid;
               border-top-right-radius: 0.5em;
               right: 0;
               top: 0;
            }
         }

         &.focus-two {
            bottom: 0;
            &::after {
               border-left-style: solid;
               border-bottom-style: solid;
               border-bottom-left-radius: 0.5em;
               left: 0;
               bottom: 0;
            }

            &::before {
               border-right-style: solid;
               border-bottom-style: solid;
               border-bottom-right-radius: 0.5em;
               right: 0;
               bottom: 0;
            }
         }
      }
   }
}
</style>
