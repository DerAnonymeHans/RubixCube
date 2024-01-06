<!-- @format -->

<script lang="ts" setup>
// @ts-expect-error
import { useMq } from "vue3-mq";
import { RubixCube } from "@/scripts/cube/cube";
import { VisualManager } from "@/scripts/visuals/visualManager";
import { VisualizationOptions } from "@/scripts/visuals/visualizationOptions";
import { StyleValue, computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";

import { randomRotation } from "@/scripts/cube/helper";
import { SolvingAlgorithm } from "@/scripts/solver/types";

const ALGOS: SolvingAlgorithm[] = ["beginners", "advanced", "twoPhase"];

interface Props {
   type: "random" | "normal";
   rubixCube: RubixCube;
   showControls: boolean;
}

const props = defineProps<Props>();
defineEmits<{
   (e: "scan-cube"): void;
}>();

const mq = useMq();
const randomRotationsRunning = ref(false);
const algo = ref<SolvingAlgorithm>("twoPhase");

const randomIntervalId = ref<number | undefined>(undefined);
const rotationIntervalId = ref<number | undefined>(undefined);

const stepIdx = ref(0);

const rubixCube = ref<RubixCube>(props.rubixCube);
let visualManager = createVisualManager();

const canvasRef = ref<HTMLCanvasElement>(null!);

onMounted(() => {
   visualManager.startRendering(canvasRef.value);
   render();
});

onBeforeUnmount(() => {
   clearInterval(randomIntervalId.value);
});

watch(
   () => props.rubixCube,
   (newCube) => {
      rubixCube.value = newCube;
      visualManager = createVisualManager();
   }
);

watch(
   () => props.type,
   (updated, old) => {
      if (updated === "normal") {
         clearRandomRotations();
         rubixCube.value.shuffles.push(...rubixCube.value.rotations);
         rubixCube.value.rotations.splice(0, Infinity);
         visualManager.skipShuffles();
         stepIdx.value = 0;
      }
      if (updated === "random") {
         startRandomRotations();
         rubixCube.value.shuffle(20);
         rubixCube.value.printShuffles();
      }
   },
   {
      immediate: true,
   }
);

function createVisualManager() {
   return new VisualManager(
      rubixCube.value as RubixCube,
      {
         enableCameraMovement: true,
         enableEditing: false,
         enableRotationShortcuts: false,
         cameraOptions: {
            distance: 6,
            defaultPosition: new THREE.Vector3(1, 1, 1),
         },
      } as VisualizationOptions,
      updateStepIdx
   );
}

function startRandomRotations() {
   if (randomRotationsRunning.value) return;
   randomRotationsRunning.value = true;

   randomIntervalId.value = setInterval(doRandomRotation, 4000);
}
function clearRandomRotations() {
   randomRotationsRunning.value = false;
   clearInterval(randomIntervalId.value);
}

function doRandomRotation() {
   setTimeout(() => {
      if (!randomRotationsRunning.value) return;
      visualManager.skipShuffles();
      rubixCube.value.rotate(randomRotation());
      visualManager.next();
   }, Math.random() * 1000);
}

function render() {
   requestAnimationFrame(render);
   visualManager.render();
}

function solve() {
   reset();
   rubixCube.value.solve(algo.value);
}

function updateStepIdx() {
   stepIdx.value = visualManager.StepWithoutShufflesIdx;
}

function reset() {
   visualManager.reset();
   visualManager.skipShuffles();
}
function next() {
   if (stepIdx.value >= rubixCube.value.rotations.length) return false;
   visualManager.next();
}
function previous() {
   if (stepIdx.value <= 0) return false;
   visualManager.previous();
}

function startAutoRotation(direction: "previous" | "next") {
   rotationIntervalId.value = setInterval(() => {
      if (direction === "previous") previous();
      else next();
   }, 100);
}
function stopAutoRotation() {
   clearInterval(rotationIntervalId.value);
}

window.addEventListener("resize", (e) => {
   visualManager.handleResize();
});
window.addEventListener("touchend", () => {
   stopAutoRotation();
});

window.addEventListener("keypress", (e) => {
   if (e.code === "Space") {
      next();
   }
});
window.addEventListener("keydown", (e) => {
   if (e.key === "ArrowRight") {
      next();
   }
   if (e.key === "ArrowLeft") {
      previous();
   }
});
</script>

<template>
   <div class="solving-wrapper">
      <Transition name="fade-later">
         <div v-if="showControls && mq.mdMinus">
            <div
               class="mobile-step-control backwards"
               :class="mq.current"
               v-on:click="previous"
               v-on:touchstart="() => startAutoRotation('previous')"
            >
               «
            </div>
            <div
               class="mobile-step-control forwards"
               :class="mq.current"
               v-on:click="next"
               v-on:touchstart="() => startAutoRotation('next')"
            >
               »
            </div>
         </div>
      </Transition>
      <Transition name="fade">
         <div v-if="showControls" class="bar upper-solving-bar" :class="mq.current">
            <div class="row">
               <div>
                  <label for="algoSelect">{{ $t("solver.algorithm") }}: </label>
                  <select id="algoSelect" v-model="algo">
                     <option v-for="algo in ALGOS" :value="algo">{{ $t(`algo.${algo}`) }}</option>
                  </select>
               </div>
               <p id="stepDisplay" class="step-display">
                  {{ stepIdx }} /
                  {{ rubixCube.rotations.length }}
               </p>
            </div>
            <div class="row">
               <div class="step-controls">
                  <button v-on:click="previous" class="control"><div>«</div></button>
                  <button v-on:click="next" class="control"><div>»</div></button>
                  <button v-on:click="reset"><div>↺</div></button>
               </div>
            </div>
         </div>
      </Transition>
      <canvas ref="canvasRef" :class="mq.current"></canvas>
      <Transition name="fade-later">
         <div v-if="showControls" class="bar lower-solving-bar" :class="mq.current">
            <button v-on:click="() => solve()">{{ $t("solver.buttons.solve") }}</button>
            <button v-on:click="$emit('scan-cube')">{{ $t("solver.buttons.scan") }}</button>
         </div>
      </Transition>
   </div>
</template>

<style lang="scss" scoped>
$dark-bg: #1c4557;

label {
   margin-right: 0.5em;
}

select {
   border: none;
   background-color: white;
   border-radius: 1em;
   padding: 0.5em;
   color: #21292c;
   font-family: "Rubik", sans-serif;
   font-size: medium;
   cursor: pointer;

   &:hover {
      background-color: #acd7e9;
      transition: 300ms;
   }
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

.solving-wrapper {
   position: relative;
   width: 100%;
   color: white;
   display: flex;
   justify-content: center;

   .mobile-step-control {
      position: absolute;
      top: 50%;
      background-color: #1c455773;
      border-radius: 50%;
      padding: 0.2em;
      font-size: 4em;
      line-height: 2em;
      transform: translateY(-50%);
      user-select: none;

      &.forwards {
         right: -27vw;
         padding-right: 1em;
      }

      &.backwards {
         left: -27vw;
         padding-left: 1em;
      }

      &.sm,
      &.md {
         padding: 0.8em;
      }
   }

   canvas {
      width: 80vw;
      aspect-ratio: 1;

      &.sm {
         width: 50vw;
      }

      &.md {
         width: 40vw;
      }

      &.lg {
         width: 30vw;
      }

      &.xl,
      &.xxl {
         width: 20vw;
      }
   }

   .bar {
      position: absolute;
      width: 100vw;
      box-sizing: border-box;
      padding-inline: 5%;
      left: 50%;

      &.md,
      &.lg {
         width: 150%;
      }

      &.xl,
      &.xxl {
         width: 100%;
      }
   }

   .upper-solving-bar {
      top: -100%;
      transform: translate(-50%, 105%);

      &.md,
      &.lg {
         top: 0%;
         transform: translate(-50%, -150%);
      }

      &.xl,
      &.xxl {
         top: 0%;
         transform: translate(-50%, -130%);
      }

      .row {
         display: flex;
         align-items: center;
      }

      .step-display {
         margin-left: auto;
         background-color: $dark-bg;
         padding: 0.5em;
         border-radius: 0.3em;
      }

      .step-controls {
         margin: auto;

         button {
            padding: 0;
            background-color: $dark-bg;

            justify-items: center;
            align-items: center;

            width: 1.7em;
            height: 1.7em;

            border-radius: 0.3em;
            border: none;
            color: white;

            font-size: larger;
            vertical-align: middle;
            text-align: center;
            line-height: 0;

            margin-inline: 0.25em;

            cursor: pointer;
            transition: all 0.3s ease-out;

            &:hover,
            &:focus {
               background: lighten($dark-bg, 10%);
            }
         }
      }
   }

   .lower-solving-bar {
      top: 100%;
      // bottom: -100%;
      transform: translate(-50%, 100%);

      button {
         margin-inline: 0.25em;
      }

      &.md,
      &.lg {
         transform: translate(-50%, 100%);
      }

      &.xl,
      &.xxl {
         transform: translate(-50%, 100%);
      }
   }

   // .upper-solving-bar {
   //    transform: translate(-50%, -120%);
   //    left: 50%;

   //    .row {
   //       display: flex;
   //       align-items: center;
   //    }

   //    .step-display {
   //       margin-left: auto;
   //       background-color: $dark-bg;
   //       padding: 0.5em;
   //       border-radius: 0.3em;
   //    }

   //    .step-controls {
   //       margin: auto;

   //       button {
   //          background-color: $dark-bg;
   //          padding: 0.3em 0.5em;
   //          border-radius: 0.3em;
   //          border: none;
   //          color: white;
   //          font-size: larger;
   //          margin-inline: 0.25em;
   //          cursor: pointer;
   //          transition: all 0.3s ease-out;

   //          &:hover,
   //          &:focus {
   //             background: lighten($dark-bg, 10%);
   //          }
   //       }
   //    }
   // }
}
</style>
