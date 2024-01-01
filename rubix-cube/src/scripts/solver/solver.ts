/** @format */

import { RubixCube } from "../cube/cube";
import { solveRubixCubeAdvanced } from "./advanced/0_solver";
import { solveRubixCubeBeginners } from "./beginners/0_solver";
import { solveRubixCubeTwoPhase } from "./twoPhase/0_solver";
import { SolvingAlgorithm } from "./types";

export async function solveRubixCube(cube: RubixCube, method: SolvingAlgorithm): Promise<void> {
   if (method === "beginners") {
      return solveRubixCubeBeginners(cube);
   } else if (method === "advanced") {
      return solveRubixCubeAdvanced(cube);
   } else if (method === "twoPhase") {
      return await solveRubixCubeTwoPhase(cube);
   }
}
