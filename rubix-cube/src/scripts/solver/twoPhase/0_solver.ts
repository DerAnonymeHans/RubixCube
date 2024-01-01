/** @format */

import { RubixCube } from "@/scripts/cube/cube";
import { getCubesPermutationRepresentation } from "../helper";
import { ApiCubeDescriptor, ApiSolvingAlgorithm, fetchSolution } from "../api";

export async function solveRubixCubeTwoPhase(cube: RubixCube) {
   const facelets = getCubesPermutationRepresentation(cube);
   const cubeDescription = new ApiCubeDescriptor(facelets);

   try {
      const res = await fetchSolution({
         algorithm: ApiSolvingAlgorithm.twoPhaseSolver,
         cubeDescription,
      });
      cube.rotateMultipleTimes(res);
   } catch (err) {
      console.error(err);
   }
}
