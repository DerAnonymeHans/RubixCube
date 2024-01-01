/** @format */

import { LOD } from "three";
import { Plane, PlaneIdentifier, RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import { identifierToFacePosition, invertRotation } from "../../cube/helper";
import { mapLocalToGlobalRotation } from "../helper";
import { LocalRelation } from "../types";
import { TileColor } from "../../cube/colors";
import { FacePosition } from "@/scripts/cube/types";

export function permutateLastLayer(cube: RubixCube) {
   applyAlgorithm(cube);
}

function applyAlgorithm(cube: RubixCube) {
   let unecessaryRotationsEndIdx = cube.rotations.length;
   let front = cube.front;
   const gr = 0;
   const bl = 1;
   const re = 2;
   const or = 3;

   for (let i = 0; i < 4; i++) {
      const R = RotationCommand.fromFacePosition(
         front.neighbours.right.face.facePosition,
         RotationDirection.right
      );
      const R_ = RotationCommand.fromFacePosition(
         front.neighbours.right.face.facePosition,
         RotationDirection.left
      );

      const U = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right);
      const U_ = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.left);

      const F = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.right);
      const F_ = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.left);

      const L = RotationCommand.fromFacePosition(
         front.neighbours.left.face.facePosition,
         RotationDirection.right
      );
      const L_ = RotationCommand.fromFacePosition(
         front.neighbours.left.face.facePosition,
         RotationDirection.left
      );

      const D = RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.right);
      const D_ = RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.left);

      const B = RotationCommand.fromFacePosition(
         front.oppositeFace.facePosition,
         RotationDirection.right
      );
      const B_ = RotationCommand.fromFacePosition(
         front.oppositeFace.facePosition,
         RotationDirection.left
      );

      const M = RotationCommand.fromLocalRotation(front, LocalRelation.down, 1);
      const M_ = RotationCommand.fromLocalRotation(front, LocalRelation.up, 1);

      const r = [R, RotationCommand.fromLocalRotation(front, LocalRelation.up, 1)];
      const r_ = [R_, RotationCommand.fromLocalRotation(front, LocalRelation.down, 1)];

      front = front.neighbours.right.face;

      // edges only
      {
         executeOnMatch(
            cube,
            [or, re, or, bl, gr, bl, re, or, re, gr, bl, gr],
            [M, M, U, M, M, U, U, M, M, U, M, M]
         );

         executeOnMatch(
            cube,
            [or, gr, or, bl, re, bl, re, bl, re, gr, or, gr],
            [R_, U_, R, R, U, R, U, R_, U_, R, U, R, U_, R, U_, R_, U, U]
         );

         executeOnMatch(
            cube,
            [or, re, or, bl, bl, bl, re, gr, re, gr, or, gr],
            [R, R, U_, R_, U_, R, U, R, U, R, U_, R]
         );

         executeOnMatch(
            cube,
            [or, gr, or, bl, bl, bl, re, or, re, gr, re, gr],
            [R_, U, R_, U_, R_, U_, R_, U, R, U, R, R]
         );
      }

      // Corners only
      {
         executeOnMatch(
            cube,
            [gr, or, or, bl, bl, gr, or, re, bl, re, gr, re],
            [/*R2*/ B, B, /*U2*/ R, R, /*R_*/ B_, /*D_*/ L_, /*R*/ B, R, R, B_, L, B_]
         );

         executeOnMatch(
            cube,
            [re, or, or, bl, bl, re, gr, re, gr, or, gr, bl],
            [R, R, B, B, R, F, R_, B, B, R, F_, R]
         );

         executeOnMatch(
            cube,
            [gr, or, bl, re, bl, or, bl, re, gr, or, gr, re],
            [R, R, U, R_, U_, B, U, B_, U_, B, U, B_, U_, B, U, B_, R, U_, R_, R_]
         );
      }

      // Edges and corners
      {
         // T
         executeOnMatch(
            cube,
            [or, re, or, bl, bl, re, gr, or, bl, re, gr, gr],
            [R, U, R_, U_, R_, F, R, R, U_, R_, U_, R, U, R_, F_]
         );

         // Y
         executeOnMatch(
            cube,
            [re, gr, or, bl, bl, gr, or, re, re, gr, or, bl],
            [F, R, U_, R_, U_, R, U, R_, F_, R, U, R_, U_, R_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [or, or, or, bl, gr, re, gr, re, bl, re, bl, gr],
            [U_, R_, U, R, U_, R, R, F_, U_, F, U, R, F, R_, F_, R, R]
         );

         // V
         executeOnMatch(
            cube,
            [re, or, or, bl, bl, gr, or, gr, re, gr, re, bl],
            [R_, U, R_, U_, B_, D, B_, D_, B, B, R_, B_, R, B, R]
         );

         // Ja
         executeOnMatch(
            cube,
            [bl, bl, gr, or, or, bl, re, re, re, gr, gr, or],
            [L_, U_, L, F, L_, U_, L, U, L, F_, L, L, U, L, U]
         );

         executeOnMatch(
            cube,
            [or, or, or, bl, re, re, gr, bl, bl, re, gr, gr],
            [R, U, R_, F_, R, U, R_, U_, R_, F, R, R, U_, R_, U_]
         );

         // Ra
         executeOnMatch(
            cube,
            [gr, bl, or, bl, or, bl, re, re, gr, or, gr, re],
            [L, U, U, L_, U, U, L, F_, L_, U_, L, U, L, F, L, L, U]
         );

         executeOnMatch(
            cube,
            [gr, or, or, bl, re, bl, re, bl, gr, or, gr, re],
            [R_, U, U, R, U, U, R_, F, R, U, R_, U_, R_, F_, R, R, U_]
         );

         // Na
         executeOnMatch(
            cube,
            [or, re, re, gr, bl, bl, re, or, or, bl, gr, gr],
            [R, U, R_, U, R, U, R_, F_, R, U, R_, U_, R_, F, R, R, U_, R_, U, U, R, U_, R_]
         );

         executeOnMatch(
            cube,
            [re, re, or, bl, bl, gr, or, or, re, gr, gr, bl],
            [R_, U, R, U_, R_, F_, U_, F, R, U, R_, F, R_, F_, R, U_, R]
         );

         // Ga
         executeOnMatch(
            cube,
            [re, bl, gr, or, gr, or, bl, re, re, gr, or, bl],
            [B_, B_, D, L_, U, L_, U_, L, D_, B, B, R_, U, R]
         );

         executeOnMatch(
            cube,
            [or, re, or, bl, gr, re, gr, bl, bl, re, or, gr],
            [R_, U_, R, B, B, D, L_, U, L, U_, L, D_, B, B, U]
         );

         // Gc
         executeOnMatch(
            cube,
            [re, re, gr, or, bl, or, bl, gr, re, gr, or, bl],
            [F, F, L, L, F, U, U, F, U, U, F_, L, F, U, F_, U_, F_, L, F, F, U, U]
         );

         executeOnMatch(
            cube,
            [gr, gr, bl, re, bl, gr, or, re, or, bl, or, re],
            // R U R' U' D R2        U' R  U'  R'  U  R'   U R2 D'
            [L, U, L_, U_, D, L, L, U_, L, U_, L_, U, L_, U, L, L, D_, U, U]
         );
      }

      // executeOnMatch(
      //    cube,
      //    [
      //       [0, 0, 0, 0, 0],
      //       [0, 0, 0, 0, 0],
      //       [0, 0, 0, 0, 0],
      //       [0, 0, 0, 0, 0],
      //       [0, 0, 0, 0, 0],
      //    ],
      //    []
      // );

      if (cube.rotations.length !== unecessaryRotationsEndIdx) break;

      // rotate whole cube to check for patterns in a different direction
      cube.rotate(new RotationCommand(Plane.yPlane, 2, RotationDirection.right, "__unecessary__"));

      unecessaryRotationsEndIdx++;
   }
}

function executeOnMatch(cube: RubixCube, pattern: number[], commands: RotationCommand[]) {
   if (!isPatternMatching(cube, pattern)) return [];
   const unecessaryRotationsStartIdx = cube.rotations.findIndex(
      (x) => x.plane === Plane.yPlane && x.idx === 2 && x.msg === "__unecessary__"
   );
   if (unecessaryRotationsStartIdx !== -1) {
      // unrotate the unecessary rotations
      cube.rotateMultipleTimes(
         cube.rotations.slice(unecessaryRotationsStartIdx).map((x) => invertRotation(x))
      );
      cube.rotations.splice(unecessaryRotationsStartIdx, Infinity);
   }
   cube.rotateMultipleTimes(commands);
}

function isPatternMatching(cube: RubixCube, pattern: number[]): boolean {
   const sideUpperBand = [
      ...cube.left.getRow(0),
      ...cube.front.getRow(0),
      ...cube.right.getRow(0),
      ...cube.back.getRow(0),
   ];
   const numberColorMap: Record<number, TileColor | null> = {
      0: null,
      1: null,
      2: null,
      3: null,
   };

   // patterns is an array of numbers between 0 and 3 (0, 1, 2, 3)
   for (let i = 0; i < pattern.length; i++) {
      const patternTile = pattern[i];
      const cubeTile = sideUpperBand[i];

      if (numberColorMap[patternTile] === null) {
         numberColorMap[patternTile] = cubeTile;
         continue;
      }

      if (numberColorMap[patternTile] !== cubeTile) return false;
   }

   return true;
}
