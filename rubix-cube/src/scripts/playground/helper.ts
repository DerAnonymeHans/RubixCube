/** @format */

import * as THREE from "three";
import { FacePosition } from "../cube/types";
import { LocalRelation } from "../solver/types";
import { SCALE } from "../settings";

// export function globalToCanvasCoordinates(event: MouseEvent, canvasEl: HTMLCanvasElement): {x: number, y: number} {
//    const bBox = canvasEl.getBoundingClientRect();

// }

export interface FaceNormal {
   face: FacePosition;
   normal: THREE.Vector3;
}

const faceNormals: readonly FaceNormal[] = [
   { face: FacePosition.front, normal: new THREE.Vector3(0, 0, 1) },
   { face: FacePosition.back, normal: new THREE.Vector3(0, 0, -1) },
   { face: FacePosition.left, normal: new THREE.Vector3(-1, 0, 0) },
   { face: FacePosition.right, normal: new THREE.Vector3(1, 0, 0) },
   { face: FacePosition.top, normal: new THREE.Vector3(0, 1, 0) },
   { face: FacePosition.bottom, normal: new THREE.Vector3(0, -1, 0) },
] as const;

const faceDirections: { face: FacePosition; top: THREE.Vector3; right: THREE.Vector3 }[] = [
   {
      face: FacePosition.front,
      top: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(1, 0, 0),
   },
   { face: FacePosition.back, top: new THREE.Vector3(0, 1, 0), right: new THREE.Vector3(-1, 0, 0) },
   { face: FacePosition.left, top: new THREE.Vector3(0, 1, 0), right: new THREE.Vector3(0, 0, 1) },
   {
      face: FacePosition.right,
      top: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(0, 0, -1),
   },
   { face: FacePosition.top, top: new THREE.Vector3(0, 0, -1), right: new THREE.Vector3(1, 0, 0) },
   {
      face: FacePosition.bottom,
      top: new THREE.Vector3(0, 0, 1),
      right: new THREE.Vector3(1, 0, 0),
   },
];

export function faceNormalFromVector(vector: THREE.Vector3): FaceNormal {
   // compare the facenormals and return the faceposition of the most similar one
   let maxSimilarity = -1;
   let mostSimilar = faceNormals[0];
   for (const faceNormal of faceNormals) {
      const similarity = faceNormal.normal.dot(vector);
      if (similarity > maxSimilarity) {
         maxSimilarity = similarity;
         mostSimilar = faceNormal;
      }
   }
   return mostSimilar;
}

export interface FaceCoordinates {
   facePosition: FacePosition;
   row: number;
   col: number;
}

export function faceCoordinatesFromPoint(point: THREE.Vector3): FaceCoordinates {
   const normalVector = new THREE.Vector3();
   const x = Math.abs(point.x);
   const y = Math.abs(point.y);
   const z = Math.abs(point.z);
   normalVector.x = x < y || x < z ? 0 : Math.sign(point.x);
   normalVector.y = y < x || y < z ? 0 : Math.sign(point.y);
   normalVector.z = z < x || z < y ? 0 : Math.sign(point.z);
   const facePosition = faceNormalFromVector(normalVector).face;

   let row = 0;
   let col = 0;

   if (facePosition === FacePosition.front) {
      row = Math.floor((point.y - 0.75) * -2);
      col = Math.floor((point.x + 0.75) * 2);
   } else if (facePosition === FacePosition.back) {
      row = Math.floor((point.y - 0.75) * -2);
      col = Math.floor((point.x - 0.75) * -2);
   } else if (facePosition === FacePosition.right) {
      row = Math.floor((point.y - 0.75) * -2);
      col = Math.floor((point.z - 0.75) * -2);
   } else if (facePosition === FacePosition.left) {
      row = Math.floor((point.y - 0.75) * -2);
      col = Math.floor((point.z + 0.75) * 2);
   } else if (facePosition === FacePosition.top) {
      row = Math.floor((point.z + 0.75) * 2);
      col = Math.floor((point.x + 0.75) * 2);
   } else if (facePosition === FacePosition.bottom) {
      row = Math.floor((point.z - 0.75) * -2);
      col = Math.floor((point.x + 0.75) * 2);
   }

   // row = Math.abs(row);
   // col = Math.abs(col);

   return { facePosition, row, col };
}

export function localDirectionFromVector(face: FacePosition, vector: THREE.Vector3): LocalRelation {
   const faceDirection = faceDirections.find((faceTop) => faceTop.face === face)!;

   const angleTop = vector.angleTo(faceDirection.top);
   const angleRight = vector.angleTo(faceDirection.right);

   if (angleTop < Math.PI / 4 || angleTop > (7 * Math.PI) / 4) {
      return LocalRelation.up;
   }
   if (angleTop >= (3 * Math.PI) / 4 && angleTop < (5 * Math.PI) / 4) {
      return LocalRelation.down;
   }

   if (angleRight < Math.PI / 4 || angleRight > (7 * Math.PI) / 4) {
      return LocalRelation.right;
   }
   if (angleRight >= (3 * Math.PI) / 4 && angleRight < (5 * Math.PI) / 4) {
      return LocalRelation.left;
   }
   return LocalRelation.right;
}
