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
import { LocalRelation, SolvingAlgorithm, TilePosition } from "../solver/types";
import { solveRubixCube } from "../solver/solver";
import { CubeFace, FaceRelation, FaceRelationType, InvertOn } from "./cubeFace";
import { FacePosition } from "./types";

export class RubixCube {
   public faces: CubeFace[];
   public rotations: RotationCommand[] = [];
   public shuffles: RotationCommand[] = [];
   public startFaces: CubeFace[] = [];
   private solutionCache: Record<SolvingAlgorithm, RotationCommand[] | null> = {
      advanced: null,
      beginners: null,
      twoPhase: null,
   };

   constructor() {
      const createMatrix = (color: TileColor) => [
         new Array(3).fill(color),
         new Array(3).fill(color),
         new Array(3).fill(color),
      ];
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
      this.startFaces = this.faces;
   }

   public get allRotations(): RotationCommand[] {
      return [...this.shuffles, ...this.rotations];
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

   public rotate(command: RotationCommand, isShuffle = false) {
      if (isShuffle) this.shuffles.push(command);
      else this.rotations.push(command);

      for (let i = 0; i < command.count; i++) {
         if (command.idx === 1) {
            this.rotateMiddle(command);
         } else if (command.idx === 3) {
         } else {
            this.rotateFace(command);
         }
      }
   }

   public rotateMultipleTimes(commands: RotationCommand[], isShuffle = false) {
      for (const command of commands) {
         this.rotate(command, isShuffle);
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

   private rotateCube(command: RotationCommand) {
      throw new Error("Not implemented");
   }

   private rotateFace(command: RotationCommand) {
      const face = this.identifierToFace(PlaneIdentifier.fromRotation(command));

      face.rotate(command.direction);

      if (face.neighbours === undefined) throw new Error("Neighbours undefined");

      const saved = face.neighbours.top.getTouchingArray(command.direction);

      if (command.direction === RotationDirection.left) {
         face.neighbours.top.setTouchingArray(
            face.neighbours.right.getTouchingArray(command.direction)
         );
         face.neighbours.right.setTouchingArray(
            face.neighbours.bottom.getTouchingArray(command.direction)
         );
         face.neighbours.bottom.setTouchingArray(
            face.neighbours.left.getTouchingArray(command.direction)
         );
         face.neighbours.left.setTouchingArray(saved);
      } else {
         face.neighbours.top.setTouchingArray(
            face.neighbours.left.getTouchingArray(command.direction)
         );
         face.neighbours.left.setTouchingArray(
            face.neighbours.bottom.getTouchingArray(command.direction)
         );
         face.neighbours.bottom.setTouchingArray(
            face.neighbours.right.getTouchingArray(command.direction)
         );
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

   private setCurrentFacesAsStartingFaces() {
      const cube = new RubixCube();
      cube.setFaces(this.faces);
      this.startFaces = cube.faces;
   }

   public resetToStartingFaces() {
      this.setFaces(this.startFaces, false);
      this.clearCache();
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

   public printShuffles() {
      console.log("Shuffles:");
      console.log(this.shuffles.map((r) => r.toString()).join(",\n"));
   }

   private clearCache() {
      for (const algoKey in this.solutionCache) {
         this.solutionCache[algoKey as keyof typeof this.solutionCache] = null;
      }
   }

   public setFaces(faces: CubeFace[], clearCache = true) {
      for (const face of faces) {
         const thisFace = this.identifierToFace(facePositionToIdentifier(face.facePosition));

         for (let i = 0; i < 3; i++) {
            thisFace.setRow(i, face.getRow(i));
         }
      }
      if (clearCache) {
         this.clearCache();
      }
   }

   public static shuffled(salt: number = 10) {
      const cube = new RubixCube();
      cube.shuffle(salt);
      return cube;
   }

   public shuffle(salt: number) {
      for (let i = 0; i < salt; i++) {
         const command = randomRotation();
         this.rotate(command, true);
      }
      this.clearCache();
   }

   public async solve(method: SolvingAlgorithm): Promise<void> {
      // if (this.solutionCache[method] !== null) {
      //    this.rotations = [...this.solutionCache[method]!];
      //    return;
      // }
      this.setCurrentFacesAsStartingFaces();
      this.rotations.splice(0, Infinity);
      await solveRubixCube(this, method);
      this.solutionCache[method] = [...this.rotations];
   }
}
