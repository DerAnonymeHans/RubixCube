import { TileColor } from "../../cube/colors";
import { Plane, RotationCommand, RotationDirection } from "../../cube/commands";
import { FacePosition, RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { CornerTile, getCornerTiles, getCorners, mapLocalToGlobalRotation } from "../helper";
import { DEFAULT_ROTATION, LocalRelation, TilePosition } from "../types";
import { CubeFace } from "../../cube/cubeFace";

export function createWhiteCorners(cube: RubixCube) {
   let i = 0;
   while (true) {
      i++;
      if (i === 50) break;
      let numberOfSolvedFaces = 0;
      for (const neighbour of cube.bottom.neighbourList) {
         const solved = trySolveFace(cube, neighbour.relation.face);
         if (solved) {
            numberOfSolvedFaces++;
         }
      }

      if (numberOfSolvedFaces === 4) break;

      cube.rotate(new RotationCommand(Plane.yPlane, 0, DEFAULT_ROTATION));
   }
}

function trySolveFace(cube: RubixCube, face: CubeFace): boolean {
   let i = 0;
   while (true) {
      i++;
      if (i === 50) return false;

      const bottomRightCorner = getCornerTiles(face, cube.bottom, face.neighbours.right.face);
      const topRightCorner = getCornerTiles(face, cube.top, face.neighbours.right.face);

      const topRightCornerSolved = isTopRightCornerSolved(topRightCorner, face);

      if (topRightCornerSolved) return true;

      if (isWhiteCorner(topRightCorner) && !isWhiteCorner(bottomRightCorner)) {
         bringTopCornerToBottom(cube, face);
         continue;
      }

      if (isCorrectTopRightCorner(topRightCorner, face)) {
         bringTopCornerToBottom(cube, face);
         continue;
      }

      if (isCorrectTopRightCorner(bottomRightCorner, face)) {
         bringBottomCornerToTop(cube, face);
         continue;
      }

      return false;
   }
}

function applyAlgorithm(cube: RubixCube, face: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(face, LocalRelation.down, 2),
      mapLocalToGlobalRotation(face, LocalRelation.left, 2),
      mapLocalToGlobalRotation(face, LocalRelation.up, 2),
      mapLocalToGlobalRotation(face, LocalRelation.right, 2),
   ]);
}

function bringTopCornerToBottom(cube: RubixCube, face: CubeFace) {
   applyAlgorithm(cube, face);
}

function bringBottomCornerToTop(cube: RubixCube, face: CubeFace) {
   applyAlgorithm(cube, face);
}

function isTopRightCornerSolved(topRightCorner: CornerTile[], face: CubeFace) {
   return (
      topRightCorner.find((tile) => tile.color === TileColor.white && tile.face.facePosition === FacePosition.top) !==
         undefined &&
      topRightCorner.every(
         (tile) =>
            tile.color === TileColor.white ||
            tile.color === face.getCell(1, 1) ||
            tile.color === face.neighbours.right.face.getCell(1, 1)
      )
   );
}

function isCorrectTopRightCorner(corner: CornerTile[], face: CubeFace) {
   return corner.every(
      (tile) =>
         tile.color === TileColor.white ||
         tile.color === face.getCell(1, 1) ||
         tile.color === face.neighbours.right.face.getCell(1, 1)
   );
}

function isWhiteCorner(corner: CornerTile[]) {
   return corner.find((tile) => tile.color === TileColor.white) !== undefined;
}
