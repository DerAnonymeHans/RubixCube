/** @format */

import { FacePosition } from "@/scripts/cube/types";
import { RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { combineRedundantRotations } from "../helper";
import { DEFAULT_ROTATION } from "../types";
import { solveWhiteCross } from "./1_whiteCross";
import { solveFirstTwoLayers } from "./2_firstTwoLayers";
import { orientLastLayer } from "./3_orientLastLayer";
import { permutateLastLayer } from "./4_permutateLastLayer";

export function solveRubixCubeAdvanced(cube: RubixCube) {
   solveWhiteCross(cube);
   solveFirstTwoLayers(cube);
   orientLastLayer(cube);
   permutateLastLayer(cube);
   rotateTopLayer(cube);
   // startVisualRotationHere(cube);

   combineRedundantRotations(cube);
}

function rotateTopLayer(cube: RubixCube) {
   for (let i = 0; i < 4 && !cube.isSolved(); i++) {
      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
   }
}
