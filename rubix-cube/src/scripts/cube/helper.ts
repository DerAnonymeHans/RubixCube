/** @format */

import { Plane, PlaneIdentifier, RotationCommand, RotationDirection } from "./commands";
import { RubixCube } from "./cube";
import { FacePosition } from "./types";

export function copyObject<T extends object>(t: T): T {
   return JSON.parse(JSON.stringify(t));
}

export function roundAbout(from: number, to: number, maxDistance: number) {
   return Math.abs(from - to) < maxDistance;
}

export class CircleArray<T> {
   items: T[];
   constructor(items: T[] = []) {
      this.items = items;
   }

   public push(item: T) {
      this.items.push(item);
   }

   public at(idx: number): T {
      return this.items[idx % this.items.length];
   }
}

export function facePositionToIdentifier(position: FacePosition): PlaneIdentifier {
   if (position === FacePosition.back) return new PlaneIdentifier(Plane.zPlane, 0);
   else if (position === FacePosition.front) return new PlaneIdentifier(Plane.zPlane, 2);
   else if (position === FacePosition.left) return new PlaneIdentifier(Plane.xPlane, 0);
   else if (position === FacePosition.right) return new PlaneIdentifier(Plane.xPlane, 2);
   else if (position === FacePosition.bottom) return new PlaneIdentifier(Plane.yPlane, 0);
   else return new PlaneIdentifier(Plane.yPlane, 2);
}

export function identifierToFacePosition(identifier: PlaneIdentifier): FacePosition {
   if (identifier.plane === Plane.zPlane) {
      if (identifier.idx === 0) {
         return FacePosition.back;
      } else if (identifier.idx === 2) {
         return FacePosition.front;
      }
   } else if (identifier.plane === Plane.xPlane) {
      if (identifier.idx === 0) {
         return FacePosition.left;
      } else if (identifier.idx === 2) {
         return FacePosition.right;
      }
   } else if (identifier.plane === Plane.yPlane) {
      if (identifier.idx === 0) {
         return FacePosition.bottom;
      } else if (identifier.idx === 2) {
         return FacePosition.top;
      }
   }

   // Handle any other cases or invalid inputs as needed
   throw new Error("Invalid PlaneIdentifier");
}

export function startVisualRotationHere(cube: RubixCube) {
   (window as any).startRotationAt = cube.rotations.length;
}

export function idxWhenToStartVisualRotation(idx: number | null = null) {
   return idx ?? (window as any).startRotationAt ?? 0;
}

export function invertRotation(command: RotationCommand) {
   let cmd = new RotationCommand(command.plane, command.idx, command.direction * -1);
   cmd.count = command.count;
   return cmd;
}

export function randomRotation() {
   // const idx = Math.random() < 0.5 ? 0 : 2;
   const idx = Math.floor(Math.random() * 3);
   const direction = Math.random() < 0.5 ? RotationDirection.left : RotationDirection.right;
   const plane = [Plane.xPlane, Plane.yPlane, Plane.zPlane][Math.floor(Math.random() * 3)];

   return new RotationCommand(plane, idx, direction);
}
