/** @format */

import * as THREE from "three";
import { Plane, PlaneIdentifier, planeToAxis } from "../cube/commands";
import { SCALE, SPEED } from "../settings";
import { roundAbout } from "../cube/helper";

export interface CameraOptions {
   distance: number | null;
   defaultPosition: THREE.Vector3 | null;
}

export class RubixCubeCamera extends THREE.PerspectiveCamera {
   public static DISTANCE = 6 * SCALE;
   public static DEFAULT_POSITION = new THREE.Vector3(3, 5, 3);
   public static CUBE_ORIGIN = new THREE.Vector3();
   private static PATH_SEGMENTS_COUNT = 120 / SPEED;

   private distance: number;
   private defaultPosition: THREE.Vector3;

   public isTransforming = false;
   public currentlyFacing: PlaneIdentifier | null = null;

   constructor(options: CameraOptions) {
      super(50, 1.5, 0.1, 2000);

      this.distance = options.distance ?? RubixCubeCamera.DISTANCE;
      this.distance *= SCALE;

      this.defaultPosition = options.defaultPosition ?? RubixCubeCamera.DEFAULT_POSITION;
      this.defaultPosition.normalize().multiplyScalar(this.distance);

      this.position.copy(this.defaultPosition);
      this.lookAt(RubixCubeCamera.CUBE_ORIGIN);
   }

   private animateMovement(endPosition: THREE.Vector3, speed: number | null = null) {
      const cleanUp = () => {
         this.isTransforming = false;
      };

      speed ??= 1;

      const pathSegmentsCount = Math.ceil(RubixCubeCamera.PATH_SEGMENTS_COUNT / speed);

      const path = new THREE.Vector3()
         .subVectors(endPosition, this.position)
         .multiplyScalar(1 / pathSegmentsCount);
      this.isTransforming = true;

      let pathSegmentIdx = 0;

      const animateTransform = () => {
         if (pathSegmentIdx === pathSegmentsCount) {
            this.position.copy(endPosition);
            cleanUp();
            return;
         }
         pathSegmentIdx++;
         requestAnimationFrame(animateTransform);
         this.position.addVectors(this.position, path);
         this.lookAt(RubixCubeCamera.CUBE_ORIGIN);
      };
      animateTransform();
   }

   public viewFace(planeIdentifier: PlaneIdentifier, speed: number | null = null): boolean {
      if (this.isTransforming || this.currentlyFacing?.equals(planeIdentifier)) return false;

      this.currentlyFacing = planeIdentifier;

      const position = this.getPositionForFace(planeIdentifier);
      this.animateMovement(position, speed);
      return true;
   }

   public moveCamera(yAngleDelta: number, phiDelta: number): boolean {
      if (this.isTransforming) return false;
      const yAxis = new THREE.Vector3(0, 1, 0);
      let phiAxis = new THREE.Vector3().crossVectors(yAxis, this.position);

      if (phiAxis.length() < 0.1) phiAxis = new THREE.Vector3(1, 0, 0);

      const newPosition = this.position.clone();
      newPosition.applyAxisAngle(phiAxis, phiDelta);
      newPosition.applyAxisAngle(yAxis, yAngleDelta);

      newPosition.normalize().multiplyScalar(3);

      this.animateMovement(newPosition);
      return true;
   }

   public getPositionForFace(planeIdentifier: PlaneIdentifier): THREE.Vector3 {
      if (planeIdentifier.idx === 1) return this.defaultPosition;

      const axis = planeToAxis(planeIdentifier.plane);
      let vector = new THREE.Vector3(0 * SCALE, 0 * SCALE, 0 * SCALE);
      if (planeIdentifier.plane === Plane.zPlane || planeIdentifier.plane === Plane.xPlane) {
         vector.y = 3 * SCALE;
      } else {
         vector.x = 2 * SCALE;
      }
      vector[axis] = this.distance * (planeIdentifier.idx === 0 ? -1 : 1);

      vector.normalize().multiplyScalar(this.distance);

      return vector;
   }
}
