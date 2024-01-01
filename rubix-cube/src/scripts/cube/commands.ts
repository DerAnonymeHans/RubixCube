/** @format */

import * as THREE from "three";
import { facePositionToIdentifier } from "./helper";
import { LocalRelation } from "../solver/types";
import { CubeFace } from "./cubeFace";
import { FacePosition } from "./types";

export class RotationCommand {
   plane: Plane;
   idx: number;
   direction: RotationDirection;
   count = 1;
   msg: string = "";

   constructor(plane: Plane, idx: number, direction: RotationDirection, msg = "") {
      this.plane = plane;
      this.idx = idx;
      this.direction = direction;
      this.msg = msg;
   }

   public print() {
      console.log(this.toString());
   }
   public toString() {
      return `new RotationCommand(Plane.${Plane[this.plane]}, ${this.idx}, RotationDirection.${
         RotationDirection[this.direction]
      })`;
   }
   public equals(other: RotationCommand): boolean {
      return (
         this.plane === other.plane &&
         this.idx === other.idx &&
         this.direction === other.direction &&
         this.count === other.count
      );
   }

   public clone(): RotationCommand {
      const cmd = new RotationCommand(this.plane, this.idx, this.direction, this.msg);
      cmd.count = this.count;
      return cmd;
   }

   public twice(): RotationCommand {
      this.count = 2;
      return this;
   }

   public static fromIdentifier(
      identifier: PlaneIdentifier,
      direction: RotationDirection,
      msg = ""
   ): RotationCommand {
      return new RotationCommand(identifier.plane, identifier.idx, direction, msg);
   }

   public static fromFacePosition(
      position: FacePosition,
      direction: RotationDirection,
      msg = ""
   ): RotationCommand {
      return RotationCommand.fromIdentifier(facePositionToIdentifier(position), direction, msg);
   }

   public static fromLocalRotation(local: CubeFace, rotation: LocalRelation, idx: number) {
      if (rotation === LocalRelation.left || rotation == LocalRelation.right) {
         const rightIsRight =
            rotation === LocalRelation.right ? RotationDirection.right : RotationDirection.left;

         const leftIsRight =
            rotation === LocalRelation.left ? RotationDirection.right : RotationDirection.left;

         if (local.facePosition === FacePosition.top) {
            return new RotationCommand(Plane.zPlane, idx, idx > 0 ? rightIsRight : leftIsRight);
         }
         if (local.facePosition === FacePosition.bottom) {
            return new RotationCommand(
               Plane.zPlane,
               2 - idx,
               idx === 2 ? rightIsRight : leftIsRight
            );
         }

         if (local.facePosition === FacePosition.right) {
            return new RotationCommand(
               Plane.yPlane,
               2 - idx,
               idx === 2 ? rightIsRight : leftIsRight
            );
         }
         if (local.facePosition === FacePosition.left) {
            return new RotationCommand(Plane.yPlane, 2 - idx, idx < 2 ? leftIsRight : rightIsRight);
         }

         if (local.facePosition === FacePosition.front) {
            return new RotationCommand(
               Plane.yPlane,
               2 - idx,
               idx === 2 ? rightIsRight : leftIsRight
            );
         }
         if (local.facePosition === FacePosition.back) {
            return new RotationCommand(
               Plane.yPlane,
               2 - idx,
               idx === 2 ? rightIsRight : leftIsRight
            );
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
}

export enum Plane {
   xPlane,
   yPlane,
   zPlane,
}

export type Axis = "x" | "y" | "z";
export function planeToAxis(plane: Plane): Axis {
   if (plane === Plane.xPlane) return "x";
   if (plane === Plane.yPlane) return "y";
   return "z";
}

export enum RotationDirection {
   left = 1,
   right = -1,
}

export class PlaneIdentifier {
   plane: Plane;
   idx: number;
   constructor(plane: Plane, idx: number) {
      this.plane = plane;
      this.idx = idx;
   }

   public equals(other: PlaneIdentifier): boolean {
      return this.idx === other.idx && this.plane === other.plane;
   }

   public static fromRotation(command: RotationCommand) {
      return new PlaneIdentifier(command.plane, command.idx);
   }
}
