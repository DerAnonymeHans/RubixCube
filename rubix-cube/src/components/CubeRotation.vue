<!-- @format -->

<script lang="ts" setup>
import { RubixCube } from "@/scripts/cube/cube";
import { VisualManager } from "@/scripts/visuals/visualManager";
import { VisualizationOptions } from "@/scripts/visuals/visualizationOptions";
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";
import { TileColor } from "@/scripts/cube/colors";
import { CubeFace } from "@/scripts/cube/cubeFace";
import { RotationCommand } from "@/scripts/cube/commands";
import { sleep } from "@/scripts/helper";
import { FacePosition } from "@/scripts/cube/types";

interface Props {
   cubeFaces: CubeFace[];
   rotations: RotationCommand[];
   startRotations: RotationCommand[];
}

const props = defineProps<Props>();

const rubixCube = new RubixCube();
grayOutFaces(rubixCube, props.cubeFaces);
let visualManager = createVisualManager();
const canvasRef = ref<HTMLCanvasElement>(null!);

onMounted(async () => {
   visualManager = createVisualManager();
   visualManager.startRendering(canvasRef.value);
   render();

   visualManager.lookAtFace(FacePosition.front, 100);

   rubixCube.rotations.splice(0, Infinity);
   // rubixCube.rotateMultipleTimes(props.startRotations);
   rubixCube.rotations.push(...props.rotations);

   visualManager.orientCube(props.startRotations, 1000);

   doRotation();
});
function render() {
   requestAnimationFrame(render);
   visualManager.render();
}

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

watch(
   () => props.cubeFaces,
   (newFaces) => {
      grayOutFaces(rubixCube, [...newFaces]);
      if (visualManager.isRendering) {
         visualManager.updateCube();
      }
   }
);

async function doRotation() {
   await visualManager.gotoStep(rubixCube.rotations.length, 3);

   await sleep(1000);

   await visualManager.gotoStep(0, 100);

   await sleep(700);

   doRotation();
}

function grayOutFaces(rubixCube: RubixCube, faces: CubeFace[]) {
   const facepositions = [
      FacePosition.top,
      FacePosition.left,
      FacePosition.bottom,
      FacePosition.right,
      FacePosition.front,
      FacePosition.back,
   ];
   for (const position of facepositions) {
      if (faces.find((x) => x.facePosition === position) !== undefined) continue;
      faces.push(
         new CubeFace(
            [
               [TileColor.unspecified, TileColor.unspecified, TileColor.unspecified],
               [TileColor.unspecified, TileColor.unspecified, TileColor.unspecified],
               [TileColor.unspecified, TileColor.unspecified, TileColor.unspecified],
            ],
            position
         )
      );
   }
   rubixCube.setFaces(faces);
}
</script>

<template>
   <div>
      <canvas ref="canvasRef"></canvas>
   </div>
</template>
