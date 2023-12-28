import { RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import { invertRotation } from "../../cube/helper";
import { combineRedundantRotations } from "../helper";
import { makeWhiteCross } from "./1_whiteCross";
import { createWhiteCorners } from "./2_whiteCorners";
import { solveMiddleLayerEdges } from "./3_middleLayerEdges";
import { solveYellowCross } from "./4_yellowCross";
import { solveYellowFace } from "./5_yellowCorners";
import { finisher } from "./6_finishing";

export function solveRubixCubeBeginners(cube: RubixCube) {
   makeWhiteCross(cube);
   createWhiteCorners(cube);
   solveMiddleLayerEdges(cube);
   solveYellowCross(cube);
   solveYellowFace(cube);
   finisher(cube);

   combineRedundantRotations(cube);
}
