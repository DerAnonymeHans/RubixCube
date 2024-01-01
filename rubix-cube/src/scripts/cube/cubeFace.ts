/** @format */

import { LocalRelation, TilePosition } from "../solver/types";
import { TileColor } from "./colors";
import { RotationDirection } from "./commands";
import { FacePosition } from "./types";

type Neigbours = {
   left: FaceRelation;
   right: FaceRelation;
   top: FaceRelation;
   bottom: FaceRelation;
};

export enum FaceRelationType {
   firstRowTouches,
   lastRowTouches,
   firstColTouches,
   lastColTouches,
}

export enum InvertOn {
   never,
   rightRotation,
   leftRotation,
   always,
}

export class CubeFace {
   public static SIZE = 3;

   private _facePosition: FacePosition;
   public get facePosition() {
      return this._facePosition;
   }

   public matrix: TileColor[][];
   public neighbours: Neigbours = null!;

   public get neighbourList(): {
      rotation: LocalRelation;
      relation: FaceRelation;
   }[] {
      return [
         { rotation: LocalRelation.up, relation: this.neighbours!.top },
         { rotation: LocalRelation.left, relation: this.neighbours!.left },
         {
            rotation: LocalRelation.down,
            relation: this.neighbours!.bottom,
         },
         {
            rotation: LocalRelation.right,
            relation: this.neighbours!.right,
         },
      ];
   }

   public get horizontalNeighbours() {
      return this.neighbourList.filter(
         (n) => n.rotation === LocalRelation.left || n.rotation === LocalRelation.right
      );
   }

   public get verticalNeighbours() {
      return this.neighbourList.filter(
         (n) => n.rotation === LocalRelation.up || n.rotation === LocalRelation.down
      );
   }

   public get oppositeFace() {
      return this.neighbours.left.face.neighbours.left.face;
   }

   public get faceColor() {
      return this.getCell(1, 1);
   }

   constructor(matrix: TileColor[][], position: FacePosition) {
      this.matrix = matrix;
      this._facePosition = position;
   }

   getRow(rowIdx: number, reverse = false) {
      if (rowIdx > CubeFace.SIZE - 1) throw new Error("Row idx too large");

      const array = [...this.matrix[rowIdx]];
      if (reverse) array.reverse();
      return array;
   }
   getCol(colIdx: number, reverse = false) {
      if (colIdx > CubeFace.SIZE - 1) throw new Error("Col idx too large");

      const array = this.matrix.map((row) => row[colIdx]);
      if (reverse) array.reverse();
      return array;
   }
   getCell(rowIdx: number, colIdx: number) {
      if (rowIdx > CubeFace.SIZE || colIdx > CubeFace.SIZE)
         throw new Error("ColIdx or row idx too large");

      return this.matrix[rowIdx][colIdx];
   }

   setRow(rowIdx: number, values: TileColor[]) {
      if (rowIdx > CubeFace.SIZE - 1) throw new Error("Row idx too large");

      this.matrix[rowIdx] = values;
   }
   setCol(colIdx: number, values: TileColor[]) {
      if (colIdx > CubeFace.SIZE - 1) throw new Error("Col idx too large");

      for (let i = 0; i < 3; i++) {
         this.matrix[i][colIdx] = values[i];
      }
   }
   setCell(rowIdx: number, colIdx: number, value: TileColor) {
      if (rowIdx > CubeFace.SIZE || colIdx > CubeFace.SIZE)
         throw new Error("ColIdx or row idx too large");

      this.matrix[rowIdx][colIdx] = value;
   }

   findTile(color: TileColor): TilePosition | null {
      return this.tiles().find((tile) => tile.color === color) ?? null;
   }
   findManyTiles(color: TileColor): TilePosition[] {
      return this.tiles().filter((tile) => tile.color === color);
   }

   tiles(): TilePosition[] {
      const tiles: TilePosition[] = [];
      for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
         for (let colIdx = 0; colIdx < 3; colIdx++) {
            tiles.push(new TilePosition(this.getCell(rowIdx, colIdx), this, rowIdx, colIdx));
         }
      }

      return tiles;
   }

   getNeighbour(rotation: LocalRelation) {
      return this.neighbourList.find((n) => n.rotation === rotation)!;
   }

   rotate(direction: RotationDirection) {
      const a = this.matrix[0][0];
      if (direction === RotationDirection.left) {
         const b = this.matrix[0][1];
         this.matrix[0][0] = this.matrix[0][2];
         this.matrix[0][1] = this.matrix[1][2];
         this.matrix[0][2] = this.matrix[2][2];
         this.matrix[1][2] = this.matrix[2][1];
         this.matrix[2][2] = this.matrix[2][0];
         this.matrix[2][1] = this.matrix[1][0];
         this.matrix[2][0] = a;
         this.matrix[1][0] = b;
      } else {
         const b = this.matrix[1][0];
         this.matrix[0][0] = this.matrix[2][0];
         this.matrix[1][0] = this.matrix[2][1];
         this.matrix[2][0] = this.matrix[2][2];
         this.matrix[2][1] = this.matrix[1][2];
         this.matrix[2][2] = this.matrix[0][2];
         this.matrix[1][2] = this.matrix[0][1];
         this.matrix[0][2] = a;
         this.matrix[0][1] = b;
      }
   }
}

export class FaceRelation {
   relationType: FaceRelationType;
   face: CubeFace;
   invert: InvertOn;
   constructor(relationType: FaceRelationType, face: CubeFace, invert: InvertOn = InvertOn.never) {
      this.relationType = relationType;
      this.face = face;
      this.invert = invert;
   }

   getTouchingArrayUnaligned() {
      let array: TileColor[] = [];
      if (this.relationType === FaceRelationType.firstRowTouches) array = this.face.getRow(0);
      else if (this.relationType === FaceRelationType.lastRowTouches) array = this.face.getRow(2);
      else if (this.relationType === FaceRelationType.firstColTouches) array = this.face.getCol(0);
      else array = this.face.getCol(2);

      return array;
   }

   getTouchingArray(rotation: RotationDirection) {
      let array: TileColor[] = [];
      if (this.relationType === FaceRelationType.firstRowTouches) array = this.face.getRow(0);
      else if (this.relationType === FaceRelationType.lastRowTouches) array = this.face.getRow(2);
      else if (this.relationType === FaceRelationType.firstColTouches) array = this.face.getCol(0);
      else array = this.face.getCol(2);

      const isReverse =
         (this.invert === InvertOn.leftRotation && rotation === RotationDirection.left) ||
         (this.invert === InvertOn.rightRotation && rotation === RotationDirection.right) ||
         this.invert === InvertOn.always;

      if (isReverse) {
         array.reverse();
      }
      return array;
   }

   setTouchingArray(values: TileColor[]) {
      if (this.relationType === FaceRelationType.firstRowTouches)
         return this.face.setRow(0, values);

      if (this.relationType === FaceRelationType.lastRowTouches) return this.face.setRow(2, values);

      if (this.relationType === FaceRelationType.firstColTouches)
         return this.face.setCol(0, values);

      return this.face.setCol(2, values);
   }
}
