/** @format */

import { Face } from "three";
import { RubixCube } from "../cube/cube";
import { FacePosition, SavebleCube } from "../cube/types";
import { Corner, Edge, Phase } from "./types";
import { TileColor } from "../cube/colors";
import { CubeFace } from "../cube/cubeFace";
import { getCornerTiles, getEdgeTiles } from "../solver/helper";

export function saveCubeToSessionStorage(phases: Phase[]) {
   const frontPhase = phases.find((x) => x.key === FacePosition.front);
   const frontFace = phaseColorsToCubeFaceForSaving(FacePosition.front, frontPhase?.colors);

   const leftPhase = phases.find((x) => x.key === FacePosition.left);
   const leftFace = phaseColorsToCubeFaceForSaving(FacePosition.left, leftPhase?.colors);

   const rightPhase = phases.find((x) => x.key === FacePosition.right);
   const rightFace = phaseColorsToCubeFaceForSaving(FacePosition.right, rightPhase?.colors);

   const backPhase = phases.find((x) => x.key === FacePosition.back);
   const backFace = phaseColorsToCubeFaceForSaving(FacePosition.back, backPhase?.colors);

   const topPhase = phases.find((x) => x.key === FacePosition.top);
   const topFace = phaseColorsToCubeFaceForSaving(FacePosition.top, topPhase?.colors);

   const bottomPhase = phases.find((x) => x.key === FacePosition.bottom);
   const bottomFace = phaseColorsToCubeFaceForSaving(FacePosition.bottom, bottomPhase?.colors);

   const saveble: SavebleCube = {
      front: bottomFace.matrix,
      right: rightFace.matrix,
      back: topFace.matrix,
      left: leftFace.matrix,
      top: frontFace.matrix,
      bottom: backFace.matrix,
   };

   sessionStorage.setItem("cube", JSON.stringify(saveble));
}

function phaseColorsToCubeFaceForSaving(
   facePosition: FacePosition,
   colors: TileColor[] | undefined
) {
   let matrix: TileColor[][];
   colors ??= [
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
   ];

   if (facePosition === FacePosition.top) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.right) {
      matrix = [
         [colors[6], colors[3], colors[0]],
         [colors[7], colors[4], colors[1]],
         [colors[8], colors[5], colors[2]],
      ];
   } else if (facePosition === FacePosition.bottom) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.back) {
      matrix = [
         colors.slice(6, 9).reverse(),
         colors.slice(3, 6).reverse(),
         colors.slice(0, 3).reverse(),
      ];
   } else if (facePosition === FacePosition.left) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.front) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   }

   return new CubeFace(matrix!, facePosition);
}

export function phaseColorsToCubeFace(facePosition: FacePosition, colors: TileColor[] | undefined) {
   let matrix: TileColor[][];
   colors ??= [
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
      TileColor.unspecified,
   ];
   if (facePosition === FacePosition.front) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.right) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.back) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   } else if (facePosition === FacePosition.top) {
      matrix = [
         colors.slice(6, 9).reverse(),
         colors.slice(3, 6).reverse(),
         colors.slice(0, 3).reverse(),
      ];
   } else if (facePosition === FacePosition.left) {
      matrix = [
         [colors[6], colors[3], colors[0]],
         [colors[7], colors[4], colors[1]],
         [colors[8], colors[5], colors[2]],
      ];
   } else if (facePosition === FacePosition.bottom) {
      matrix = [colors.slice(0, 3), colors.slice(3, 6), colors.slice(6, 9)];
   }

   return new CubeFace(matrix!, facePosition);
}
