/** @format */

import { Face } from "three";
import { FacePosition, RubixCube } from "../cube/cube";
import { SavebleCube } from "../cube/types";
import { Corner, Edge, Phase } from "./types";
import { TileColor } from "../cube/colors";
import { CubeFace } from "../cube/cubeFace";
import { getCornerTiles, getEdgeTiles } from "../solver/helper";

export function saveCubeToSessionStorage(phases: Phase[]) {
   const frontPhase = phases.find((x) => x.key === FacePosition.front);
   const frontFace = phaseColorsToCubeFace(FacePosition.front, frontPhase?.colors);

   const leftPhase = phases.find((x) => x.key === FacePosition.left);
   const leftFace = phaseColorsToCubeFace(FacePosition.left, leftPhase?.colors);

   const rightPhase = phases.find((x) => x.key === FacePosition.right);
   const rightFace = phaseColorsToCubeFace(FacePosition.right, rightPhase?.colors);

   const backPhase = phases.find((x) => x.key === FacePosition.back);
   const backFace = phaseColorsToCubeFace(FacePosition.back, backPhase?.colors);

   const topPhase = phases.find((x) => x.key === FacePosition.top);
   const topFace = phaseColorsToCubeFace(FacePosition.top, topPhase?.colors);

   const bottomPhase = phases.find((x) => x.key === FacePosition.bottom);
   const bottomFace = phaseColorsToCubeFace(FacePosition.bottom, bottomPhase?.colors);

   const saveble: SavebleCube = {
      front: frontFace.matrix,
      right: rightFace.matrix,
      back: backFace.matrix,
      left: leftFace.matrix,
      top: topFace.matrix,
      bottom: bottomFace.matrix,
   };

   sessionStorage.setItem("cube", JSON.stringify(saveble));
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

const w = TileColor.white;
const b = TileColor.blue;
const g = TileColor.green;
const r = TileColor.red;
const y = TileColor.yellow;
const o = TileColor.orange;

const centerColors = [
   TileColor.white,
   TileColor.blue,
   TileColor.green,
   TileColor.orange,
   TileColor.red,
   TileColor.yellow,
];

const edges = [
   new Edge(w, g),
   new Edge(o, g),
   new Edge(y, g),
   new Edge(r, g),

   new Edge(w, b),
   new Edge(o, b),
   new Edge(y, b),
   new Edge(r, b),

   new Edge(y, r),
   new Edge(w, r),

   new Edge(y, o),
   new Edge(w, o),
];

const corners = [
   new Corner(g, o, y),
   new Corner(g, o, w),
   new Corner(g, r, y),
   new Corner(g, r, w),

   new Corner(b, o, y),
   new Corner(b, o, w),
   new Corner(b, r, y),
   new Corner(b, r, w),
];

function determineBottomFace(cube: RubixCube) {
   debugger;
   determineCenter(cube);
   determineCorners(cube);
   determineEdges(cube);
}

function determineCenter(cube: RubixCube) {
   const face = cube.bottom;
   const possibleCenterColor = centerColors.find(
      (centerColor) => cube.faces.find((face) => face.faceColor === centerColor) === undefined
   );
   if (possibleCenterColor === undefined) {
      alert("Centers not possible");
      return;
   }

   face.setCell(1, 1, possibleCenterColor);
}

function determineCorners(cube: RubixCube) {
   const possibleCorners = corners.filter((corner) => {
      for (const neighbour of cube.top.neighbourList) {
         const front = neighbour.relation.face;
         const cornerTiles = getCornerTiles(front, cube.top, front.neighbours.right.face);
         if (corner.equals(cornerTiles)) return false;
      }
      return true;
   });

   const cornerInformation: { row: number; col: number }[] = [
      { row: 0, col: 2 },
      { row: 0, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 2 },
   ];

   let i = 0;
   for (const neighbour of cube.bottom.neighbourList) {
      const face = neighbour.relation.face;
      const cornerInfo = cornerInformation[i];

      const cornerTiles = getCornerTiles(cube.bottom, face, face.neighbours.right.face);
      let corner = possibleCorners.find((x) => x.specifiedColorsEqual(cornerTiles));
      if (corner === undefined) {
         alert("Corner not found");
         return;
      }
      cube.bottom.setCell(cornerInfo.row, cornerInfo.col, corner.getUnspecifiedColor(cornerTiles));

      i++;
   }
}

function determineEdges(cube: RubixCube) {
   const possibleEdges = edges.filter((edge) => {
      for (const neighbour of cube.top.neighbourList) {
         const front = neighbour.relation.face;
         const topCornerTiles = getEdgeTiles(front, cube.top);
         const rightCornerTiles = getEdgeTiles(front, front.neighbours.right.face);

         if (edge.equals(topCornerTiles) || edge.equals(rightCornerTiles)) return false;
      }
      return true;
   });

   const edgeInformation: { row: number; col: number }[] = [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 2, col: 1 },
      { row: 1, col: 2 },
   ];

   let i = 0;
   for (const neighbour of cube.bottom.neighbourList) {
      const face = neighbour.relation.face;
      const edgeInfo = edgeInformation[i];

      const edgeTiles = getEdgeTiles(cube.bottom, face);
      let edge = possibleEdges.find((x) => x.specifiedColorsEqual(edgeTiles));
      if (edge === undefined) {
         alert("Corner not found");
         return;
      }
      cube.bottom.setCell(edgeInfo.row, edgeInfo.col, edge.getUnspecifiedColor(edgeTiles));

      i++;
   }
}
