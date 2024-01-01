/** @format */

import { TileColor } from "./colors";

export interface SavebleCube {
   front: TileColor[][];
   left: TileColor[][];
   right: TileColor[][];
   bottom: TileColor[][];
   top: TileColor[][];
   back: TileColor[][];
}

export enum FacePosition {
   back = 0,
   left = 1,
   bottom = 2,
   right = 3,
   front = 4,
   top = 5,
}
