<!-- @format -->

<script lang="ts" setup>
import { RubixCube } from "@/scripts/cube/cube";
import { VisualManager } from "@/scripts/visuals/visualManager";
import { VisualizationOptions } from "@/scripts/visuals/visualizationOptions";
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";
//@ts-expect-error
import { useMq } from "vue3-mq";
import {
   faceCoordinatesFromPoint,
   faceNormalFromVector,
   localDirectionFromVector,
} from "@/scripts/playground/helper";
import { RotationCommand } from "@/scripts/cube/commands";
import { FacePosition } from "@/scripts/cube/types";
import { VisualRubixCubeTile } from "@/scripts/visuals/visualCube";
import { LocalRelation } from "@/scripts/solver/types";
import { registerRuntimeCompiler } from "vue";

interface Props {
   rambazamba?: null;
}

const props = defineProps<Props>();

const rubixCube = new RubixCube();
let visualManager = createVisualManager();
const canvasRef = ref<HTMLCanvasElement>(null!);

const mode = ref<"move" | "rotate">("rotate");
const mq = useMq();

const moveStartingPoint = ref<{
   mesh: THREE.Mesh;
   faceNormal: THREE.Vector3;
   point: THREE.Vector3;
} | null>(null);

onMounted(async () => {
   visualManager = createVisualManager();
   visualManager.startRendering(canvasRef.value);
   canvasRef.value.addEventListener("mousedown", onMoveStart);
   canvasRef.value.addEventListener("mouseup", onMoveEnd);
   canvasRef.value.addEventListener("touchstart", (e) => onMoveStart(e as any));
   canvasRef.value.addEventListener("mouseup", (e) => onMoveEnd(e as any));
   render();
});
function render() {
   requestAnimationFrame(render);
   visualManager.render();
}

watch(
   () => mode.value,
   (newMode) => {
      // debugger;
      visualManager.setCameraMovement(newMode === "rotate");
   }
);

function createVisualManager() {
   return new VisualManager(rubixCube, {
      enableCameraMovement: true,
      enableEditing: false,
      enableRotationShortcuts: true,
      cameraOptions: {
         distance: 6,
         defaultPosition: new THREE.Vector3(1, 1, 1),
      },
   } as VisualizationOptions);
}

function toggleMode() {
   mode.value = mode.value === "move" ? "rotate" : "move";
}

function onMoveStart(e: MouseEvent) {
   if (mode.value !== "move") return;

   const intersects = visualManager.raycastFromClick(e);

   if (intersects.length === 0) {
      moveStartingPoint.value = null;
      return;
   }

   moveStartingPoint.value = {
      mesh: intersects[0].object as THREE.Mesh,
      point: intersects[0].point,
      faceNormal: intersects[0].face!.normal,
   };
}

function onMoveEnd(e: MouseEvent) {
   if (mode.value !== "move") return;
   if (moveStartingPoint.value === null) return;
   const intersects = visualManager.raycastFromClick(e);
   if (intersects.length === 0) {
      moveStartingPoint.value = null;
      return;
   }

   const moveVec = new THREE.Vector3().subVectors(
      intersects[0].point,
      moveStartingPoint.value.point
   );

   // 1. get face
   const { facePosition: face, row, col } = faceCoordinatesFromPoint(moveStartingPoint.value.point);

   // 2. get local direction
   const localDirection = localDirectionFromVector(face, moveVec);

   // 3. get idx
   const idx =
      localDirection === LocalRelation.left || localDirection === LocalRelation.right ? row : col;
   rubixCube.rotations.push(
      RotationCommand.fromLocalRotation(rubixCube.getFace(face), localDirection, idx)
   );
   visualManager.next();

   moveStartingPoint.value = null;
}
</script>

<template>
   <section :class="mq.current">
      <div>
         <canvas ref="canvasRef"></canvas>
      </div>
      <div class="control-section">
         <button class="mode-btn" :class="mode" v-on:click="toggleMode">
            <span>{{ $t(`playground.mode.${mode}`) }}<br />{{ $t("playground.mode.mode") }}</span>
         </button>
      </div>
   </section>
</template>

<style lang="scss" scoped>
$dark-bg: #1c4557;
section {
   margin: auto;
   display: grid;
   width: 100vw;
   gap: 1em;
   padding-top: 5em;

   &.xl,
   &.xxl {
      width: 40vw;
      grid-template-columns: 3fr 1fr;
      padding-top: 20vh;
   }

   &.md,
   &.lg {
      width: 40vw;
      padding-top: 5em;
   }

   &.sm {
      width: 60vw;
      padding-top: 5em;
   }

   canvas {
      width: 90%;
      aspect-ratio: 1;
   }

   .control-section {
      display: flex;
      align-items: center;
      justify-content: center;

      .mode-btn {
         position: relative;
         aspect-ratio: 1;
         border: none;
         border-radius: 2em;
         background-color: #8db0be;
         color: white;
         cursor: pointer;
         padding: 1.5em;
         font-size: large;
         box-shadow: 0em 0em 1.5em rgba($dark-bg, 0.8);
         transition: all 0.2s ease-in-out;
         overflow: hidden;
         width: 8em;

         span {
            z-index: 10;
            position: relative;
         }

         &::before {
            content: "";
            position: absolute;
            inset: 0;
            background-color: #ff7456;
            transition: all 0.2s ease-in-out;
         }

         &.move {
            &::before {
               transform: translateX(100%);
            }
         }

         &:target,
         // &:hover,
         &:active {
            box-shadow: 0em 0em 0.5em rgba($dark-bg, 0.8);
         }
      }
   }
}
</style>
