/** @format */

import { FacePosition } from "@/scripts/cube/types";
import { TileColor } from "../../cube/colors";
import { RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { getEdges, mapLocalToGlobalRotation, rotateSideFace } from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";

export function solveYellowCross(cube: RubixCube) {
   // startVisualRotationHere(cube);
   const yellowEdges = getEdges(cube.top).filter((tile) => tile.color === TileColor.yellow);
   if (yellowEdges.length === 4) return;

   solveSingleYellowDot(cube);
   solveYellowL(cube);
   solveYellowLine(cube);
}

function solveSingleYellowDot(cube: RubixCube) {
   const yellowEdges = getEdges(cube.top).filter((tile) => tile.color === TileColor.yellow);
   if (yellowEdges.length !== 0) return;
   cube.rotateMultipleTimes([
      rotateSideFace(cube.front, RotationDirection.right),
      mapLocalToGlobalRotation(cube.front, LocalRelation.left, 0),
      mapLocalToGlobalRotation(cube.front, LocalRelation.up, 2),
      mapLocalToGlobalRotation(cube.front, LocalRelation.right, 0),
      mapLocalToGlobalRotation(cube.front, LocalRelation.down, 2),
      rotateSideFace(cube.front, RotationDirection.left),
   ]);
}

function solveYellowL(cube: RubixCube): void {
   const yellowEdges = getEdges(cube.top).filter((tile) => tile.color === TileColor.yellow);
   if (yellowEdges.length !== 2) return;
   const areYellowEdgesInLine =
      yellowEdges[0].row === yellowEdges[1].row || yellowEdges[0].col === yellowEdges[1].col;
   if (areYellowEdgesInLine) return;

   // yellow L is not correctly positioned
   if (cube.top.getCell(0, 1) !== TileColor.yellow || cube.top.getCell(1, 0) !== TileColor.yellow) {
      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
      return solveYellowL(cube);
   }

   cube.rotateMultipleTimes([
      rotateSideFace(cube.front, RotationDirection.right),
      mapLocalToGlobalRotation(cube.front, LocalRelation.left, 0),
      mapLocalToGlobalRotation(cube.front, LocalRelation.up, 2),
      mapLocalToGlobalRotation(cube.front, LocalRelation.right, 0),
      mapLocalToGlobalRotation(cube.front, LocalRelation.down, 2),
      rotateSideFace(cube.front, RotationDirection.left),
   ]);

   return;
}

function solveYellowLine(cube: RubixCube) {
   const yellowEdges = getEdges(cube.top).filter((tile) => tile.color === TileColor.yellow);
   if (yellowEdges.length !== 2) return;

   // yellow line is not correctly positioned
   if (cube.top.getCell(1, 0) !== TileColor.yellow) {
      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
   }

   cube.rotateMultipleTimes([
      rotateSideFace(cube.front, RotationDirection.right),
      mapLocalToGlobalRotation(cube.front, LocalRelation.up, 2),
      mapLocalToGlobalRotation(cube.front, LocalRelation.left, 0),
      mapLocalToGlobalRotation(cube.front, LocalRelation.down, 2),
      mapLocalToGlobalRotation(cube.front, LocalRelation.right, 0),
      rotateSideFace(cube.front, RotationDirection.left),
   ]);
}
