import { LOD } from "three";
import { Plane, PlaneIdentifier, RotationCommand, RotationDirection } from "../../cube/commands";
import { CubeFace, FacePosition, RubixCube } from "../../cube/cube";
import { identifierToFacePosition, invertRotation } from "../../cube/helper";
import { mapLocalToGlobalRotation } from "../helper";
import { LocalRelation } from "../types";
import { TileColor } from "../../cube/colors";

export function orientLastLayer(cube: RubixCube) {
   applyAlgorithm(cube);
}

function applyAlgorithm(cube: RubixCube) {
   let unecessaryRotationsEndIdx = cube.rotations.length;
   let front = cube.front;

   for (let i = 0; i < 4; i++) {
      const R = RotationCommand.fromFacePosition(front.neighbours.right.face.facePosition, RotationDirection.right);
      const R_ = RotationCommand.fromFacePosition(front.neighbours.right.face.facePosition, RotationDirection.left);

      const U = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right);
      const U_ = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.left);

      const F = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.right);
      const F_ = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.left);

      const L = RotationCommand.fromFacePosition(front.neighbours.left.face.facePosition, RotationDirection.right);
      const L_ = RotationCommand.fromFacePosition(front.neighbours.left.face.facePosition, RotationDirection.left);

      const D = RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.right);
      const D_ = RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.left);

      const B = RotationCommand.fromFacePosition(front.oppositeFace.facePosition, RotationDirection.right);
      const B_ = RotationCommand.fromFacePosition(front.oppositeFace.facePosition, RotationDirection.left);

      const M = RotationCommand.fromLocalRotation(front, LocalRelation.down, 1);
      const M_ = RotationCommand.fromLocalRotation(front, LocalRelation.up, 1);

      const r = [R, RotationCommand.fromLocalRotation(front, LocalRelation.up, 1)];
      const r_ = [R_, RotationCommand.fromLocalRotation(front, LocalRelation.down, 1)];

      front = front.neighbours.right.face;

      // Crosses
      {
         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 0, 1],
               [0, 1, 1, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 0, 0],
            ],
            [R_, U, U, R, U, R_, U, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 1, 0, 1],
               [0, 1, 0, 0, 0],
            ],
            [R, U, U, R_, U_, R, U_, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 1, 1, 0, 0],
               [0, 0, 0, 1, 0],
            ],
            //  F is U        U is U
            [F_, L, F, R_, F_, L_, F, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 1, 1, 0],
               [0, 1, 0, 0, 0],
            ],
            [L, F, R_, F_, L_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [1, 0, 1, 0, 0],
               [0, 1, 1, 1, 0],
               [1, 0, 1, 0, 0],
               [0, 0, 0, 1, 0],
            ],
            [R, U, U, R_, R_, U_, R, R, U_, R_, R_, U, U, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [0, 1, 1, 1, 0],
               [1, 0, 1, 0, 1],
               [0, 0, 0, 0, 0],
            ],
            [R, U, R_, U, R, U_, R_, U, R, U, U, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [0, 1, 1, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 1, 0, 0],
               [0, 1, 0, 1, 0],
            ],
            [R, R, D, R_, U, U, R, D_, R_, U, U, R_]
         );
      }

      // Dots
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 0, 1],
               [1, 0, 1, 0, 1],
               [1, 0, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [R, U, U, R_, R_, F, R, F_, U, U, R_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [1, 0, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [F, R, U, R_, U_, F_, B, U, L, U_, L_, B_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 1, 0],
               [1, 0, 1, 0, 1],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 0, 0],
            ],
            [B, U, L, U_, L_, B_, U, F, R, U, R_, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 0, 1],
               [1, 0, 1, 0, 1],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [B, U, L, U_, L_, B_, U_, F, R, U, R_, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 1, 0],
               [1, 0, 1, 0, 1],
               [1, 0, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [M, U, R, U, R_, U_, M_, R_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 1, 0],
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [F, R, U, R_, U, F_, U, U, F_, L, F, L_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [0, 1, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R, U, R_, U, R_, F, R, F_, U, U, R_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 1, 0],
               [1, 0, 1, 0, 1],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [M, U, R, U, R_, U_, M, M, U, R, U_, ...r_]
         );
      }

      // All corners
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R, U, R_, U_, M_, U, R, U_, ...r_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 1, 0],
               [0, 1, 1, 0, 1],
               [0, 1, 1, 1, 0],
               [0, 0, 0, 0, 0],
            ],
            [M_, U_, M, U_, U_, M_, U_, M]
         );
      }

      // Lines
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [1, 0, 1, 0, 1],
               [1, 0, 1, 0, 1],
               [0, 0, 0, 0, 0],
            ],
            [R, U, U, R, R, U_, R, U_, R_, U, U, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 0, 1],
               [1, 0, 1, 0, 1],
               [0, 0, 1, 0, 1],
               [0, 1, 0, 0, 0],
            ],
            [R, U, R_, U, R, U_, B, U_, B_, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [0, 1, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [B, U, L, U_, L_, U, L, U_, L_, B_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 0, 1],
               [0, 1, 1, 1, 0],
               [1, 0, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [F, R, U, R_, U_, R, F_, L, F, R_, F_, L_]
         );
      }

      // Ts
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 1, 0],
               [0, 1, 1, 1, 0],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [F, R, U, R_, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [R, U, R_, U_, R_, F, R, F_]
         );
      }

      // Zs
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [0, 1, 0, 0, 0],
               [0, 1, 1, 1, 0],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R_, F, R, U, R_, U_, F_, U, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 1, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [L, F_, L_, U_, L, U, F, U_, L_]
         );
      }

      // Big Ls
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [R_, F, R, U, R_, F_, R, F, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 1, 0],
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [F, U, R, U_, R, R, F_, R, U, R, U_, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 1, 0],
               [0, 1, 1, 1, 0],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 0, 0],
            ],
            [L, F, L_, R, U, R_, U_, L, F_, L_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 0, 1],
               [0, 1, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [R_, F_, R, L_, U_, L, U, R_, F, R]
         );
      }

      // Cs
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [0, 1, 1, 0, 1],
               [1, 0, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 0, 0],
            ],
            [R_, U_, R_, F, R, F_, U, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 0, 1],
               [0, 1, 1, 1, 0],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R, U, R_, U_, B_, R_, F, R, F_, B]
         );
      }

      // Ws
      {
         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
               [0, 1, 1, 0, 1],
               [0, 1, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [R, U, R_, U, R, U_, R_, U_, R_, F, R, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
               [1, 0, 1, 1, 0],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [L_, U_, L, U_, L_, U, L, U, L, F_, L_, F]
         );
      }

      // Ps
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 1, 0],
               [1, 0, 1, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 0, 0],
            ],
            [B, U, L, U_, L_, B_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 0, 0],
            ],
            [B_, U_, R_, U, R, B]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [R_, U_, F, U, R, U_, R_, F_, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
               [0, 1, 1, 0, 1],
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [F, U, R, U_, F_, L, F, R_, F_, L_]
         );
      }

      // Sqaures
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 0, 1],
               [1, 0, 1, 1, 0],
               [0, 0, 1, 1, 0],
               [0, 1, 0, 0, 0],
            ],
            [R, U, U, R_, R_, F, R, F_, R, U, U, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [0, 1, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [F, R_, F_, R, U, R, U_, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 0, 1],
               [1, 0, 1, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 0, 0],
            ],
            [L_, B, B, R, B, R_, B, L]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 0, 0],
            ],
            [L, F, F, R_, F_, R, F_, L_]
         );
      }

      // Little Ls
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [1, 0, 1, 0, 0],
               [0, 1, 1, 0, 1],
               [1, 0, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [F, R, U, R_, U_, R, U, R_, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 0, 1],
               [1, 0, 1, 1, 0],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 0, 0],
            ],
            [F_, L_, U_, L, U, L_, U_, L, U, F]
         );

         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 0, 1],
               [0, 1, 1, 0, 0],
            ],
            [R_, F, R, R, B_, R_, R_, F_, R, R, B, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [1, 0, 1, 0, 0],
               [1, 0, 1, 1, 0],
               [1, 0, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [R_, F, R_, F_, R, R, U, U, B_, R, B, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [1, 0, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [R_, F_, L, F_, L_, F, L, F_, L_, F, F, R]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [1, 0, 1, 1, 0],
               [1, 0, 0, 0, 1],
               [0, 0, 1, 0, 0],
            ],
            [L, F, R_, F, R, F_, R_, F, R, F_, F_, L_]
         );
      }

      // Other shapes
      {
         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [0, 1, 0, 0, 1],
               [0, 1, 1, 0, 1],
               [1, 0, 1, 0, 0],
               [0, 0, 0, 1, 0],
            ],
            [F_, L_, U_, L, U, F, /*y*/ R, B, U, B_, U_, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 0, 0],
               [1, 0, 0, 1, 0],
               [1, 0, 1, 1, 0],
               [0, 0, 1, 0, 1],
               [0, 1, 0, 0, 0],
            ],
            [F, R, U, R_, U_, F_, U, F, R, U, R_, U_, F_]
         );

         // 7
         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
            ],
            [L, F, R_, F, R, F, F, L_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 1, 1, 0],
               [0, 1, 0, 0, 0],
               [0, 1, 1, 0, 1],
               [0, 0, 1, 0, 1],
               [0, 1, 0, 0, 0],
            ],
            [L_, B_, R, B_, R_, B, B, L]
         );

         // 10
         executeOnMatch(
            cube,
            [
               [0, 1, 1, 0, 0],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 1],
               [1, 0, 1, 0, 0],
               [0, 0, 0, 1, 0],
            ],
            [R, U, R_, U, R_, F, R, F_, R, U, U, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 1, 0],
               [1, 0, 1, 0, 0],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [R, U, R_, U_, R_, F, R, R, U, R_, U_, F_]
         );

         // 29
         executeOnMatch(
            cube,
            [
               [0, 1, 0, 0, 0],
               [0, 0, 1, 1, 0],
               [0, 1, 1, 0, 1],
               [0, 0, 0, 1, 0],
               [0, 1, 1, 0, 0],
            ],
            [R, U, R_, U_, R, U_, R_, F_, U_, F, R, U, R_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 1, 0],
               [0, 1, 1, 0, 1],
               [1, 0, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R_, F, R, F_, R_, F, R, F_, R, U, R_, U_, R, U, R_]
         );

         // 41
         executeOnMatch(
            cube,
            [
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
               [0, 1, 1, 0, 1],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [R, U, R_, U, R, U, U, R_, F, R, U, R_, U_, F_]
         );

         executeOnMatch(
            cube,
            [
               [0, 0, 0, 0, 0],
               [1, 0, 1, 0, 1],
               [0, 1, 1, 0, 1],
               [0, 1, 0, 1, 0],
               [0, 0, 1, 0, 0],
            ],
            [L, F_, L_, F, L_, U, U, L, U, F, U, F_]
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

      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right, "__unecessary__"));
      unecessaryRotationsEndIdx += 1;
   }
}

function executeOnMatch(cube: RubixCube, pattern: number[][], commands: RotationCommand[]) {
   if (!isPatternMatching(cube, pattern)) return;
   const unecessaryRotationsStartIdx = cube.rotations.findIndex(
      (x) => x.plane === Plane.yPlane && x.idx === 2 && x.msg === "__unecessary__"
   );
   if (unecessaryRotationsStartIdx !== -1) {
      // unrotate the unecessary rotations
      cube.rotateMultipleTimes(cube.rotations.slice(unecessaryRotationsStartIdx).map((x) => invertRotation(x)));
      cube.rotations.splice(unecessaryRotationsStartIdx, Infinity);
   }
   cube.rotateMultipleTimes(commands);
}

function isPatternMatching(cube: RubixCube, pattern: number[][]): boolean {
   // compare top face
   for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
         if (!matches(cube.top.matrix[i][j], pattern[i + 1][j + 1])) return false;
      }
   }

   // compare touching arrays
   if (!matches(cube.front.getCell(0, 0), pattern[4][1])) return false;
   if (!matches(cube.front.getCell(0, 1), pattern[4][2])) return false;
   if (!matches(cube.front.getCell(0, 2), pattern[4][3])) return false;

   if (!matches(cube.back.getCell(0, 2), pattern[0][1])) return false;
   if (!matches(cube.back.getCell(0, 1), pattern[0][2])) return false;
   if (!matches(cube.back.getCell(0, 0), pattern[0][3])) return false;

   if (!matches(cube.left.getCell(0, 0), pattern[1][0])) return false;
   if (!matches(cube.left.getCell(0, 1), pattern[2][0])) return false;
   if (!matches(cube.left.getCell(0, 2), pattern[3][0])) return false;

   if (!matches(cube.right.getCell(0, 2), pattern[1][4])) return false;
   if (!matches(cube.right.getCell(0, 1), pattern[2][4])) return false;
   if (!matches(cube.right.getCell(0, 0), pattern[3][4])) return false;

   return true;
}

function matches(tile: TileColor, pattern: number) {
   if (tile !== TileColor.yellow && pattern === 1) return false;
   if (tile === TileColor.yellow && pattern !== 1) return false;
   return true;
}
