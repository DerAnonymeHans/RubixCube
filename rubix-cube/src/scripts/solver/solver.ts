import { RubixCube } from "../cube/cube";
import { solveRubixCubeAdvanced } from "./advanced/0_solver";
import { solveRubixCubeBeginners } from "./beginners/0_solver";
import { SolvingAlgorithm } from "./types";

export function solveRubixCube(cube: RubixCube, method: SolvingAlgorithm) {
   if (method === "beginners") {
      return solveRubixCubeBeginners(cube);
   } else if (method === "advanced") {
      return solveRubixCubeAdvanced(cube);
   }
}
