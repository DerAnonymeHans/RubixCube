/** @format */

import { TileColor } from "../cube/colors";
import { RotationDirection } from "../cube/commands";
import { CubeFace } from "../cube/cubeFace";

export enum LocalRelation {
   left = 0,
   up = 1,
   right = 2,
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

export type SolvingAlgorithm = "beginners" | "advanced" | "twoPhase";

export const DEFAULT_ROTATION = 1 as RotationDirection.left;
