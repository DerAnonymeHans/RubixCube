/** @format */

import * as THREE from "three";
import { TileColor } from "../cube/colors";
import { Plane, RotationCommand, RotationDirection } from "../cube/commands";
import { FacePosition, RubixCube } from "../cube/cube";
import { DEFAULT_ROTATION, LocalRelation, TilePosition } from "./types";
import { invertRotation } from "../cube/helper";
import { CubeFace } from "../cube/cubeFace";

export function bringCenterToDifferentFace(from: CubeFace, to: FacePosition): RotationCommand[] {
   if (from.facePosition === to) return [];

   const commands: RotationCommand[] = [];
   for (const neighbour of from.neighbourList) {
      if (neighbour.relation.face.facePosition !== to) continue;
      commands.push(mapLocalToGlobalRotation(from, neighbour.rotation, 1));
      break;
   }
   if (commands.length === 0) {
      const neighbour = from.neighbourList[0];
      commands.push(mapLocalToGlobalRotation(from, neighbour.rotation, 1));
      commands.push(...bringCenterToDifferentFace(neighbour.relation.face, to));
   }

   return commands;
}

export function bringEdgeToDifferentFace(from: TilePosition, to: FacePosition): RotationCommand[] {
   if (from.face.facePosition === to) return [];

   const commands: RotationCommand[] = [];
   for (const neighbour of from.face.neighbourList) {
      if (neighbour.relation.face.facePosition !== to) continue;
      commands.push(mapLocalToGlobalRotation(from.face, neighbour.rotation, 1));
      break;
   }

   if (commands.length === 0) {
      const neighbour = from.face.neighbourList[0];
      commands.push(mapLocalToGlobalRotation(from.face, neighbour.rotation, 1));
      commands.push(...bringCenterToDifferentFace(neighbour.relation.face, to));
   }

   return commands;
}

export function mapLocalToGlobalRotation(
   local: CubeFace,
   rotation: LocalRelation,
   idx: number
): RotationCommand {
   if (rotation === LocalRelation.left || rotation == LocalRelation.right) {
      const rightIsRight =
         rotation === LocalRelation.right ? RotationDirection.right : RotationDirection.left;

      const leftIsRight =
         rotation === LocalRelation.left ? RotationDirection.right : RotationDirection.left;

      if (local.facePosition === FacePosition.top) {
         return new RotationCommand(Plane.zPlane, idx, idx > 0 ? rightIsRight : leftIsRight);
      }
      if (local.facePosition === FacePosition.bottom) {
         return new RotationCommand(Plane.zPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
      }

      if (local.facePosition === FacePosition.right) {
         return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
      }
      if (local.facePosition === FacePosition.left) {
         return new RotationCommand(Plane.yPlane, 2 - idx, idx < 2 ? leftIsRight : rightIsRight);
      }

      if (local.facePosition === FacePosition.front) {
         return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
      }
      if (local.facePosition === FacePosition.back) {
         return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
      }
   }

   const topIsRight =
      rotation === LocalRelation.up ? RotationDirection.right : RotationDirection.left;

   const topIsLeft =
      rotation === LocalRelation.up ? RotationDirection.left : RotationDirection.right;

   if (local.facePosition === FacePosition.right) {
      return new RotationCommand(Plane.zPlane, 2 - idx, idx < 2 ? topIsLeft : topIsRight);
   }
   if (local.facePosition === FacePosition.left) {
      return new RotationCommand(Plane.zPlane, idx, idx === 0 ? topIsLeft : topIsRight);
   }

   if (local.facePosition === FacePosition.front) {
      return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
   }
   if (local.facePosition === FacePosition.back) {
      return new RotationCommand(Plane.xPlane, 2 - idx, idx === 2 ? topIsRight : topIsLeft);
   }

   if (local.facePosition === FacePosition.top) {
      return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
   }
   if (local.facePosition === FacePosition.bottom) {
      return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
   }

   throw new Error("Cannot map local to global rotation");
}

// works for front, right, back and left
export function rotateSideFace(sideFace: CubeFace, direction: RotationDirection): RotationCommand {
   return mapLocalToGlobalRotation(
      sideFace.neighbours.right.face,
      direction === RotationDirection.left ? LocalRelation.up : LocalRelation.down,
      0
   );
}

export function getNearestNeigbourForEdge(position: TilePosition) {
   if (position.col !== 1 && position.row !== 1) throw new Error("Not an edge tile");

   if (position.col === 1 && position.row === 0)
      return position.face.getNeighbour(LocalRelation.up);
   if (position.col === 1 && position.row === 2)
      return position.face.getNeighbour(LocalRelation.down);
   if (position.row === 1 && position.col === 0)
      return position.face.getNeighbour(LocalRelation.left);

   return position.face.getNeighbour(LocalRelation.right);
}

export function doesEdgeMatchItsCenter(face: CubeFace, edgePosition: LocalRelation) {
   const center = face.getCell(1, 1);
   let edge: TileColor;
   if (edgePosition === LocalRelation.up) edge = face.getCell(0, 1);
   else if (edgePosition === LocalRelation.left) edge = face.getCell(1, 0);
   else if (edgePosition === LocalRelation.right) edge = face.getCell(1, 2);
   else edge = face.getCell(2, 1);

   return center === edge;
}

export function getCorners(face: CubeFace) {
   return face
      .tiles()
      .filter((tile) => (tile.col === 0 || tile.col === 2) && (tile.row === 0 || tile.row === 2));
}

export function getEdges(face: CubeFace) {
   return face
      .tiles()
      .filter((tile) => (tile.row !== 1 && tile.col === 1) || (tile.row === 1 && tile.col !== 1));
}

export type CornerTile = {
   face: CubeFace;
   color: TileColor;
};

// tiles are ordered by the input (corner tile of face 1 is at idx 0 and so on)
export function getCornerTiles(face1: CubeFace, face2: CubeFace, face3: CubeFace): CornerTile[] {
   const getCornerTile = (
      face: CubeFace,
      neighbours: CubeFace[],
      tiles: CornerTile[]
   ): CornerTile[] => {
      if (tiles.length === 3) return tiles;
      let tile: CornerTile = {
         face: face,
         color: null!,
      };
      if (
         neighbours.includes(face.neighbours.right.face) &&
         neighbours.includes(face.neighbours.top.face)
      ) {
         tile.color = face.getCell(0, 2);
      } else if (
         neighbours.includes(face.neighbours.right.face) &&
         neighbours.includes(face.neighbours.bottom.face)
      ) {
         tile.color = face.getCell(2, 2);
      } else if (
         neighbours.includes(face.neighbours.bottom.face) &&
         neighbours.includes(face.neighbours.left.face)
      ) {
         tile.color = face.getCell(2, 0);
      } else if (
         neighbours.includes(face.neighbours.left.face) &&
         neighbours.includes(face.neighbours.top.face)
      ) {
         tile.color = face.getCell(0, 0);
      }

      if (tile.color === null) throw new Error("Cannot get corner tile. Tile is null");
      return getCornerTile(neighbours[0], [neighbours[1], face], [...tiles, tile]);
   };

   const cornerTiles = getCornerTile(face1, [face2, face3], []);
   const tile1 = cornerTiles.find((x) => x.face === face1)!;
   const tile2 = cornerTiles.find((x) => x.face === face2)!;
   const tile3 = cornerTiles.find((x) => x.face === face3)!;
   return [tile1, tile2, tile3];
}

export function getEdgeTiles(face1: CubeFace, face2: CubeFace) {
   const relation = face1.neighbourList.find((x) => x.relation.face === face2)!;
   if (relation.rotation === LocalRelation.up) {
      return [face1.getCell(0, 1), face1.neighbours.top.getTouchingArrayUnaligned()[1]];
   }
   if (relation.rotation === LocalRelation.down) {
      return [face1.getCell(2, 1), face1.neighbours.bottom.getTouchingArrayUnaligned()[1]];
   }
   if (relation.rotation === LocalRelation.left) {
      return [face1.getCell(1, 0), face1.neighbours.left.getTouchingArrayUnaligned()[1]];
   }
   return [face1.getCell(1, 2), face1.neighbours.right.getTouchingArrayUnaligned()[1]];
}

export function getRotationForEdgeToDifferentEdgeOnFace(
   face: CubeFace,
   startLocation: LocalRelation,
   endLocation: LocalRelation
): RotationCommand[] {
   if (startLocation === endLocation) return [];

   if (Math.abs(startLocation - endLocation) == 2)
      return [
         RotationCommand.fromFacePosition(face.facePosition, DEFAULT_ROTATION),
         RotationCommand.fromFacePosition(face.facePosition, DEFAULT_ROTATION),
      ];

   const isRightRotation =
      endLocation > startLocation ||
      (startLocation === LocalRelation.down && endLocation === LocalRelation.left);

   if (isRightRotation)
      return [RotationCommand.fromFacePosition(face.facePosition, RotationDirection.right)];

   return [RotationCommand.fromFacePosition(face.facePosition, RotationDirection.left)];
}

export function combineRedundantRotations(cube: RubixCube) {
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
         lastRotation = cube.rotations.length - 1 >= idx + 1 ? cube.rotations[idx + 1] : null;
      } else if (lastRotation.equals(invertRotation(rotation))) {
         cube.rotations.splice(idx, 2);
         lastRotation = cube.rotations.length - 1 >= idx ? cube.rotations[idx] : null;
         continue;
      }

      lastRotation = rotation;
      numberOfEqualRotations = 1;
   }
}
