/** @format */

import { TileColor } from "../cube/colors";
import { RotationCommand, RotationDirection } from "../cube/commands";
import { FacePosition } from "../cube/types";

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
export async function fetchSolution(request: ApiSolvingRequest): Promise<RotationCommand[]> {
   const faceletsParam = request.cubeDescription.facelets.join("&facelets=");
   const response = (await fetch(
      `${apiBaseUrl}Solve?algorithm=${encodeURIComponent(
         request.algorithm
      )}&facelets=${faceletsParam}`
   ).then((res) => res.json())) as ApiSolvingSolution;

   return convertApiMovesToRotations(response.moves);
}

export enum ApiSolvingAlgorithm {
   twoPhaseSolver = 0,
}

export class ApiCubeDescriptor {
   facelets: number[];

   constructor(facelets: number[]) {
      this.facelets = facelets;
   }
}

export interface ApiSolvingRequest {
   algorithm: ApiSolvingAlgorithm;
   cubeDescription: ApiCubeDescriptor;
}

export interface ApiSolvingSolution {
   moves: number[];
}

const moveToRotationMap = [
   // top
   RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right),
   RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right).twice(),
   RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.left),

   // right
   RotationCommand.fromFacePosition(FacePosition.right, RotationDirection.right),
   RotationCommand.fromFacePosition(FacePosition.right, RotationDirection.right).twice(),

   RotationCommand.fromFacePosition(FacePosition.right, RotationDirection.left),

   // front
   RotationCommand.fromFacePosition(FacePosition.front, RotationDirection.right),
   RotationCommand.fromFacePosition(FacePosition.front, RotationDirection.right).twice(),
   RotationCommand.fromFacePosition(FacePosition.front, RotationDirection.left),

   // bottom
   RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.right),
   RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.right).twice(),
   RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.left),

   // left
   RotationCommand.fromFacePosition(FacePosition.left, RotationDirection.right),

   RotationCommand.fromFacePosition(FacePosition.left, RotationDirection.right).twice(),
   RotationCommand.fromFacePosition(FacePosition.left, RotationDirection.left),

   // back
   RotationCommand.fromFacePosition(FacePosition.back, RotationDirection.right),

   RotationCommand.fromFacePosition(FacePosition.back, RotationDirection.right).twice(),
   RotationCommand.fromFacePosition(FacePosition.back, RotationDirection.left),
];
function convertApiMovesToRotations(moves: number[]) {
   const rotations: RotationCommand[] = [];
   for (const move of moves) {
      rotations.push(moveToRotationMap[move]);
   }
   return rotations;
}
