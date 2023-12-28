/** @format */

import { TileColor } from "../../cube/colors";
import { RotationCommand } from "../../cube/commands";
import { CubeFace, FacePosition, RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { getCornerTiles, getCorners, mapLocalToGlobalRotation } from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";

export function solveYellowFace(cube: RubixCube) {
   const yellowCorners = getCorners(cube.top).filter((tile) => tile.color === TileColor.yellow);

   if (yellowCorners.length === 4) return;

   if (tryApplySune(cube)) return;

   solveWithoutSune(cube);
}

function solveWithoutSune(cube: RubixCube) {
   while (true) {
      if (cube.top.findManyTiles(TileColor.yellow).length === 9) break;

      const topRightCorner = getCornerTiles(cube.front, cube.front.neighbours.right.face, cube.top);
      const isSolvedCorner = topRightCorner.some((tile) => tile.color === TileColor.yellow && tile.face.facePosition === FacePosition.top);

      if (isSolvedCorner) {
         cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
         continue;
      }

      cube.rotateMultipleTimes([
         mapLocalToGlobalRotation(cube.front, LocalRelation.down, 2),
         mapLocalToGlobalRotation(cube.front, LocalRelation.left, 2),
         mapLocalToGlobalRotation(cube.front, LocalRelation.up, 2),
         mapLocalToGlobalRotation(cube.front, LocalRelation.right, 2),
      ]);
   }
}

function tryApplySune(cube: RubixCube): boolean {
   const yellowCorners = getCorners(cube.top).filter((tile) => tile.color === TileColor.yellow);
   if (yellowCorners.length !== 1) return false;

   for (const neighbour of cube.top.neighbourList) {
      const face = neighbour.relation.face;
      const cornerTiles = getCornerTiles(face, face.neighbours.left.face, cube.top);
      const isCornerWithTopYellow =
         cornerTiles.find((tile) => tile.color === TileColor.yellow && tile.face.facePosition === FacePosition.top) !== undefined;

      if (!isCornerWithTopYellow) continue;

      if (face.getCell(0, 2) === TileColor.yellow) {
         applySune(cube, face);
         return true;
      }

      if (face.neighbours.right.face.getCell(0, 0) === TileColor.yellow) {
         applyAntiSune(cube, face);
         return true;
      }

      return false;
   }
   return false;
}

function applySune(cube: RubixCube, frontFace: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
   ]);
}

function applyAntiSune(cube: RubixCube, frontFace: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2),
   ]);
}
