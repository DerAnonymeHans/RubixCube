/** @format */

import { TileColor } from "../../cube/colors";
import { RotationCommand, RotationDirection } from "../../cube/commands";
import { CubeFace, FacePosition, RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { mapLocalToGlobalRotation, rotateSideFace } from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";

export function finisher(cube: RubixCube) {
   if (cube.isSolved()) return;
   headLights(cube);
   rotateTopSoCornersMatchCenters(cube);
   uPermutation(cube);
   // startVisualRotationHere(cube);
}

function headLights(cube: RubixCube) {
   let headLightFace: CubeFace | null = null;
   let numberOfHeadLights = 0;
   for (const neighbour of cube.top.neighbourList) {
      const face = neighbour.relation.face;
      if (face.getCell(0, 0) === face.getCell(0, 2)) {
         headLightFace = face;
         numberOfHeadLights++;
      }
   }

   if (numberOfHeadLights === 4) return;

   if (numberOfHeadLights === 0) {
      applyHeadLightsAlgorithm(cube, cube.front);
      headLights(cube);
      return;
   }

   const oppositeFace = headLightFace!.neighbours.right.face.neighbours.right.face;
   applyHeadLightsAlgorithm(cube, oppositeFace);
}

function applyHeadLightsAlgorithm(cube: RubixCube, frontFace: CubeFace) {
   const backFace = frontFace.neighbours.right.face.neighbours.right.face;
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      rotateSideFace(frontFace, RotationDirection.right),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      rotateSideFace(backFace, RotationDirection.right),
      rotateSideFace(backFace, RotationDirection.right),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      rotateSideFace(frontFace, RotationDirection.left),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      rotateSideFace(backFace, RotationDirection.right),
      rotateSideFace(backFace, RotationDirection.right),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
   ]);
}

function rotateTopSoCornersMatchCenters(cube: RubixCube) {
   for (let i = 0; i < 3; i++) {
      if (cube.front.getCell(0, 0) === cube.front.getCell(1, 1)) break;

      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
   }
}

function uPermutation(cube: RubixCube): void {
   if (cube.isSolved()) return;

   let solvedBarFace: CubeFace | null = cube.back;
   for (const neighbour of cube.top.neighbourList) {
      const face = neighbour.relation.face;
      if (face.getRow(0).every((tile) => tile === face.getCell(1, 1))) {
         solvedBarFace = face;
         break;
      }
   }

   const oppositeFace = solvedBarFace.neighbours.right.face.neighbours.right.face;
   applyUPermutationAlgorithm(cube, oppositeFace);

   return uPermutation(cube);
}

function applyUPermutationAlgorithm(cube: RubixCube, frontFace: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
   ]);
}
