/**
 * 0
 *  1  2  3
 *     4
 *     5
 *
 * @format
 */

import { Vector3 } from "three";
import { TileColor } from "./colors";
import { Plane, PlaneIdentifier, RotationCommand, RotationDirection } from "./commands";
import { CircleArray, copyObject, facePositionToIdentifier, randomRotation } from "./helper";
import { LocalRelation, TilePosition } from "../solver/types";

export enum FacePosition {
   back = 0,
   left = 1,
   bottom = 2,
   right = 3,
   front = 4,
   top = 5,
}

export class RubixCube {
   public faces: CubeFace[];
   public rotations: RotationCommand[] = [];

   constructor() {
      const createMatrix = (color: TileColor) => [new Array(3).fill(color), new Array(3).fill(color), new Array(3).fill(color)];
      // const createMatrix = (color: TileColor) => {
      //     const array = [new Array(3).fill(color), new Array(3).fill(color), new Array(3).fill(color)];
      //     array[0][0] = TileColor.red;
      //     array[0][2] = TileColor.blue;
      //     array[2][0] = TileColor.white;
      //     array[2][2] = TileColor.green;
      //     array[0][1] = TileColor.blue;

      //     // array[1][0] = TileColor.orange;
      //     // array[0][1] = TileColor.blue;
      //     // array[1][2] = TileColor.white;
      //     // array[2][1] = TileColor.green;

      //     return array;
      // };

      let back = new CubeFace(createMatrix(TileColor.red), FacePosition.back);
      let front = new CubeFace(createMatrix(TileColor.orange), FacePosition.front);

      let bottom = new CubeFace(createMatrix(TileColor.yellow), FacePosition.bottom);
      let top = new CubeFace(createMatrix(TileColor.white), FacePosition.top);

      let right = new CubeFace(createMatrix(TileColor.green), FacePosition.right);
      let left = new CubeFace(createMatrix(TileColor.blue), FacePosition.left);

      back.neighbours = {
         top: new FaceRelation(FaceRelationType.firstRowTouches, top, InvertOn.rightRotation),
         left: new FaceRelation(FaceRelationType.lastColTouches, right, InvertOn.leftRotation),
         bottom: new FaceRelation(FaceRelationType.lastRowTouches, bottom, InvertOn.rightRotation),
         right: new FaceRelation(FaceRelationType.firstColTouches, left, InvertOn.leftRotation),
      };
      front.neighbours = {
         top: new FaceRelation(FaceRelationType.lastRowTouches, top, InvertOn.leftRotation),
         left: new FaceRelation(FaceRelationType.lastColTouches, left, InvertOn.rightRotation),
         bottom: new FaceRelation(FaceRelationType.firstRowTouches, bottom, InvertOn.leftRotation),
         right: new FaceRelation(FaceRelationType.firstColTouches, right, InvertOn.rightRotation),
      };

      left.neighbours = {
         top: new FaceRelation(FaceRelationType.firstColTouches, top, InvertOn.leftRotation),
         left: new FaceRelation(FaceRelationType.lastColTouches, back, InvertOn.always),
         bottom: new FaceRelation(FaceRelationType.firstColTouches, bottom, InvertOn.rightRotation),
         right: new FaceRelation(FaceRelationType.firstColTouches, front),
      };
      right.neighbours = {
         top: new FaceRelation(FaceRelationType.lastColTouches, top, InvertOn.rightRotation),
         left: new FaceRelation(FaceRelationType.lastColTouches, front),
         bottom: new FaceRelation(FaceRelationType.lastColTouches, bottom, InvertOn.leftRotation),
         right: new FaceRelation(FaceRelationType.firstColTouches, back, InvertOn.always),
      };

      bottom.neighbours = {
         top: new FaceRelation(FaceRelationType.lastRowTouches, front),
         left: new FaceRelation(FaceRelationType.lastRowTouches, left),
         bottom: new FaceRelation(FaceRelationType.lastRowTouches, back),
         right: new FaceRelation(FaceRelationType.lastRowTouches, right),
      };
      top.neighbours = {
         top: new FaceRelation(FaceRelationType.firstRowTouches, back),
         left: new FaceRelation(FaceRelationType.firstRowTouches, left),
         bottom: new FaceRelation(FaceRelationType.firstRowTouches, front),
         right: new FaceRelation(FaceRelationType.firstRowTouches, right),
      };

      this.faces = [back, left, bottom, right, front, top];
   }

   public isSolved(): boolean {
      for (const face of this.faces) {
         if (face.findManyTiles(face.getCell(1, 1)).length !== 9) {
            return false;
         }
      }
      return true;
   }

   public get bottom() {
      return this.faces[FacePosition.bottom];
   }
   public get top() {
      return this.faces[FacePosition.top];
   }
   public get back() {
      return this.faces[FacePosition.back];
   }
   public get left() {
      return this.faces[FacePosition.left];
   }
   public get right() {
      return this.faces[FacePosition.right];
   }
   public get front() {
      return this.faces[FacePosition.front];
   }

   public getFace(position: FacePosition) {
      return this.faces[position];
   }

   public rotate(command: RotationCommand, saveRotation = true) {
      if (saveRotation) this.rotations.push(command);
      if (command.idx === 1) {
         this.rotateMiddle(command);
      } else {
         this.rotateFace(command);
      }
   }

   public rotateMultipleTimes(commands: RotationCommand[], saveRotation = true) {
      for (const command of commands) {
         this.rotate(command, saveRotation);
      }
   }

   private rotateMiddle(command: RotationCommand) {
      if (command.plane === Plane.yPlane) {
         const saved = this.front.getRow(1);
         if (command.direction === RotationDirection.right) {
            this.front.setRow(1, this.right.getRow(1));
            this.right.setRow(1, this.back.getRow(1));
            this.back.setRow(1, this.left.getRow(1));
            this.left.setRow(1, saved);
         } else {
            this.front.setRow(1, this.left.getRow(1));
            this.left.setRow(1, this.back.getRow(1));
            this.back.setRow(1, this.right.getRow(1));
            this.right.setRow(1, saved);
         }
      } else if (command.plane === Plane.xPlane) {
         const saved = this.front.getCol(1);
         if (command.direction === RotationDirection.right) {
            this.front.setCol(1, this.bottom.getCol(1));
            this.bottom.setCol(1, this.back.getCol(1).reverse());
            this.back.setCol(1, this.top.getCol(1).reverse());
            this.top.setCol(1, saved);
         } else {
            this.front.setCol(1, this.top.getCol(1));
            this.top.setCol(1, this.back.getCol(1).reverse());
            this.back.setCol(1, this.bottom.getCol(1).reverse());
            this.bottom.setCol(1, saved);
         }
      } else {
         const saved = this.top.getRow(1);
         if (command.direction === RotationDirection.right) {
            this.top.setRow(1, this.left.getCol(1).reverse());
            this.left.setCol(1, this.bottom.getRow(1));
            this.bottom.setRow(1, this.right.getCol(1).reverse());
            this.right.setCol(1, saved);
         } else {
            this.top.setRow(1, this.right.getCol(1));
            this.right.setCol(1, this.bottom.getRow(1).reverse());
            this.bottom.setRow(1, this.left.getCol(1));
            this.left.setCol(1, saved.reverse());
         }
      }
   }

   private rotateFace(command: RotationCommand) {
      const face = this.identifierToFace(PlaneIdentifier.fromRotation(command));

      face.rotate(command.direction);

      if (face.neighbours === undefined) throw new Error("Neighbours undefined");

      const saved = face.neighbours.top.getTouchingArray(command.direction);

      if (command.direction === RotationDirection.left) {
         face.neighbours.top.setTouchingArray(face.neighbours.right.getTouchingArray(command.direction));
         face.neighbours.right.setTouchingArray(face.neighbours.bottom.getTouchingArray(command.direction));
         face.neighbours.bottom.setTouchingArray(face.neighbours.left.getTouchingArray(command.direction));
         face.neighbours.left.setTouchingArray(saved);
      } else {
         face.neighbours.top.setTouchingArray(face.neighbours.left.getTouchingArray(command.direction));
         face.neighbours.left.setTouchingArray(face.neighbours.bottom.getTouchingArray(command.direction));
         face.neighbours.bottom.setTouchingArray(face.neighbours.right.getTouchingArray(command.direction));
         face.neighbours.right.setTouchingArray(saved);
      }
   }

   private identifierToFace(identifier: PlaneIdentifier): CubeFace {
      if (identifier.plane === Plane.xPlane) {
         if (identifier.idx === 0) return this.left;
         return this.right;
      }
      if (identifier.plane === Plane.zPlane) {
         if (identifier.idx === 0) return this.back;
         return this.front;
      }
      if (identifier.idx === 0) return this.bottom;
      return this.top;
   }

   public printSnapshot() {
      console.log({
         back: copyObject(this.back.matrix),
         bottom: copyObject(this.bottom.matrix),
         front: copyObject(this.front.matrix),
         left: copyObject(this.left.matrix),
         right: copyObject(this.right.matrix),
         top: copyObject(this.top.matrix),
      });
   }

   public setFaces(faces: CubeFace[]) {
      for (const face of faces) {
         const thisFace = this.identifierToFace(facePositionToIdentifier(face.facePosition));

         for (let i = 0; i < 3; i++) {
            thisFace.setRow(i, face.getRow(i));
         }
      }
   }

   public shuffle(salt: number) {
      for (let i = 0; i < salt; i++) {
         const command = randomRotation();
         this.rotate(command, false);
      }
   }
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
      return this.neighbourList.filter((n) => n.rotation === LocalRelation.left || n.rotation === LocalRelation.right);
   }

   public get verticalNeighbours() {
      return this.neighbourList.filter((n) => n.rotation === LocalRelation.up || n.rotation === LocalRelation.down);
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
      if (rowIdx > CubeFace.SIZE || colIdx > CubeFace.SIZE) throw new Error("ColIdx or row idx too large");

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
      if (rowIdx > CubeFace.SIZE || colIdx > CubeFace.SIZE) throw new Error("ColIdx or row idx too large");

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

type Neigbours = {
   left: FaceRelation;
   right: FaceRelation;
   top: FaceRelation;
   bottom: FaceRelation;
};

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
      if (this.relationType === FaceRelationType.firstRowTouches) return this.face.setRow(0, values);

      if (this.relationType === FaceRelationType.lastRowTouches) return this.face.setRow(2, values);

      if (this.relationType === FaceRelationType.firstColTouches) return this.face.setCol(0, values);

      return this.face.setCol(2, values);
   }
}

enum FaceRelationType {
   firstRowTouches,
   lastRowTouches,
   firstColTouches,
   lastColTouches,
}

enum InvertOn {
   never,
   rightRotation,
   leftRotation,
   always,
}
