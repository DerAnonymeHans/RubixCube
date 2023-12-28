/** @format */

import { TileColor } from "../cube/colors";
import { RotationDirection } from "../cube/commands";
import { CubeFace, FacePosition } from "../cube/cube";

export const DEFAULT_ROTATION = 1 as RotationDirection; //RotationDirection.left;

export enum LocalRelation {
   left = 0,
   right = 1,
   up = 2,
   down = 3,
}

export class TilePosition {
   col: number;
   row: number;
   face: CubeFace;
   color: TileColor;

   constructor(color: TileColor, face: CubeFace, row: number, col: number) {
      this.color = color;
      this.face = face;
      this.row = row;
      this.col = col;
   }
}
