/** @format */

import { RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import { invertRotation } from "../../cube/helper";
import { makeWhiteCross } from "./1_whiteCross";
import { createWhiteCorners } from "./2_whiteCorners";
import { solveMiddleLayerEdges } from "./3_middleLayerEdges";
import { solveYellowCross } from "./4_yellowCross";
import { solveYellowFace } from "./5_yellowCorners";
import { finisher } from "./6_finishing";

export function solveRubixCube(cube: RubixCube) {
   makeWhiteCross(cube);
   createWhiteCorners(cube);
   solveMiddleLayerEdges(cube);
   solveYellowCross(cube);
   solveYellowFace(cube);
   finisher(cube);

   combineRedundantRotations(cube);
}

function combineRedundantRotations(cube: RubixCube) {
   let numberOfEqualRotations = 1;
   let lastRotation: RotationCommand | null = null;
   for (let idx = cube.rotations.length - 1; idx >= 0; idx--) {
      const rotation = cube.rotations[idx];

      if (lastRotation === null) {
         lastRotation = rotation;
         continue;
      }
      if (lastRotation.equals(rotation)) {
         numberOfEqualRotations++;
         continue;
      }

      if (numberOfEqualRotations >= 3) {
         if (numberOfEqualRotations % 4 === 0) {
            cube.rotations.splice(idx + 1, numberOfEqualRotations);
         } else if (numberOfEqualRotations % 4 === 1) {
            cube.rotations.splice(idx + 1, numberOfEqualRotations, lastRotation);
         } else if (numberOfEqualRotations % 4 === 2) {
            cube.rotations.splice(idx + 1, numberOfEqualRotations, lastRotation, lastRotation);
         } else if (numberOfEqualRotations % 4 === 3) {
            cube.rotations.splice(idx + 1, numberOfEqualRotations, invertRotation(lastRotation));
         }
      } else if (lastRotation.equals(invertRotation(rotation))) {
         cube.rotations.splice(idx, 2);
         lastRotation = null;
         continue;
      }

      lastRotation = rotation;
      numberOfEqualRotations = 1;
   }
}
