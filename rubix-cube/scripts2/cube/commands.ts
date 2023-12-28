/** @format */

import { FacePosition } from "./cube";
import { facePositionToIdentifier } from "./helper";

export class RotationCommand {
   plane: Plane;
   idx: number;
   direction: RotationDirection;

   constructor(plane: Plane, idx: number, direction: RotationDirection) {
      this.plane = plane;
      this.idx = idx;
      this.direction = direction;
   }

   public print() {
      console.log(this.toString());
   }
   public toString() {
      return `new RotationCommand(Plane.${Plane[this.plane]}, ${this.idx}, RotationDirection.${RotationDirection[this.direction]})`;
   }
   public equals(other: RotationCommand): boolean {
      return this.plane === other.plane && this.idx === other.idx && this.direction === other.direction;
   }

   public static fromIdentifier(identifier: PlaneIdentifier, direction: RotationDirection): RotationCommand {
      return new RotationCommand(identifier.plane, identifier.idx, direction);
   }

   public static fromFacePosition(position: FacePosition, direction: RotationDirection): RotationCommand {
      return RotationCommand.fromIdentifier(facePositionToIdentifier(position), direction);
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
