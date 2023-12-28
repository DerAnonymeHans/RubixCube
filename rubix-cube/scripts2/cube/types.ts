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
