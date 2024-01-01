/** @format */

import { Face } from "three";
import { TileColor } from "../../cube/colors";
import { Plane, PlaneIdentifier, RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import {
   bringCenterToDifferentFace,
   doesEdgeMatchItsCenter,
   getNearestNeigbourForEdge,
   mapLocalToGlobalRotation,
} from "../helper";
import { DEFAULT_ROTATION, LocalRelation, TilePosition } from "../types";
import {
   facePositionToIdentifier,
   identifierToFacePosition,
   startVisualRotationHere,
} from "../../cube/helper";
import { CubeFace, FaceRelation } from "../../cube/cubeFace";
import { FacePosition } from "@/scripts/cube/types";

export function makeWhiteCross(cube: RubixCube) {
   // find the white center
   let faceWithWhiteCenter: CubeFace = cube.top;
   for (const face of cube.faces) {
      if (face.getCell(1, 1) !== TileColor.white) continue;
      faceWithWhiteCenter = face;
      break;
   }

   // bring white center to the top
   cube.rotateMultipleTimes(bringCenterToDifferentFace(faceWithWhiteCenter, FacePosition.top));
   // return;
   bringWhiteEdgesToTheTopLayer(cube);
   bringWhiteEdgesToTheTopFace(cube);

   const numberOfCorrectEdges = bringAtLeastTwoEdgesToTheirCenters(cube);
   if (numberOfCorrectEdges === 4) return;

   bringTheRemainingEdgesToTheirCenters(cube);
}

// #################################################################
// ##### Bring white edges to the top layer ######
// #################################################################

function isEdgeWhite(tileOnThisFace: TileColor, neighbourFace: FaceRelation) {
   return (
      tileOnThisFace === TileColor.white ||
      neighbourFace.getTouchingArrayUnaligned()[1] === TileColor.white
   );
}
function bringWhiteEdgesToTheTopLayer(cube: RubixCube) {
   while (true) {
      let numberOfSolvedFace = 0;
      let numberOfNothingDone = 0;
      for (const neighbour of cube.top.neighbourList) {
         const face = neighbour.relation.face;
         const isTopEdgeInPlace = isEdgeWhite(face.getCell(0, 1), face.neighbours.top);

         if (isTopEdgeInPlace) {
            numberOfSolvedFace++;
            continue;
         }

         const isBottomEdgeWhite = isEdgeWhite(face.getCell(2, 1), face.neighbours.bottom);
         if (isBottomEdgeWhite) {
            cube.rotateMultipleTimes([
               RotationCommand.fromFacePosition(face.facePosition, DEFAULT_ROTATION),
               RotationCommand.fromFacePosition(face.facePosition, DEFAULT_ROTATION),
            ]);
            continue;
         }

         const isRightEdgeWhite = isEdgeWhite(face.getCell(1, 2), face.neighbours.right);
         if (isRightEdgeWhite) {
            cube.rotate(mapLocalToGlobalRotation(face.neighbours.right.face, LocalRelation.up, 0));
            continue;
         }

         const isLeftEdgeWhite = isEdgeWhite(face.getCell(0, 1), face.neighbours.left);
         if (isLeftEdgeWhite) {
            cube.rotate(mapLocalToGlobalRotation(face.neighbours.left.face, LocalRelation.up, 2));
            continue;
         }

         numberOfNothingDone++;
      }

      if (numberOfSolvedFace === 4) break;

      if (numberOfNothingDone + numberOfSolvedFace === 4) {
         cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
      }
   }
}

function getEdgeTilePosition(faces: CubeFace[], preferedFace: FacePosition | null): TilePosition {
   if (preferedFace !== null) {
      faces = rearangeToStartWithPreferedFace(faces, preferedFace);
   }

   for (const face of faces) {
      if (face.facePosition === FacePosition.top) continue;
      const positions = face.findManyTiles(TileColor.white);
      if (positions.length === 0) continue;

      for (const position of positions) {
         const isEdgeTile = position.col === 1 || position.row === 1;
         const isInUpperLayer = position.row === 0 && face.facePosition !== FacePosition.bottom;

         if (isEdgeTile && !isInUpperLayer) {
            return position;
         }
      }
   }

   throw new Error("No white tile found");
}

function rearangeToStartWithPreferedFace(faces: CubeFace[], preferedFace: FacePosition) {
   return [
      faces.find((f) => f.facePosition === preferedFace)!,
      ...faces.filter((f) => f.facePosition !== preferedFace),
   ];
}

function liftWhiteEdgeFromTheBottomLayer(cube: RubixCube, tilePosition: TilePosition) {
   const neighbour = getNearestNeigbourForEdge(tilePosition);

   // check if the face has white tile
   const faceHasWhiteEdgeInPlace = neighbour.relation.face.getCell(0, 1) === TileColor.white;
   // check if the part of the top layer that would also be rotated has a white edge tile
   const topLayerHasEdgeInPlace =
      neighbour.relation.face.neighbours!.top.getTouchingArrayUnaligned()[1] === TileColor.white;

   if (!faceHasWhiteEdgeInPlace && !topLayerHasEdgeInPlace) {
      // rotate the white edge away from the bottom layer
      cube.rotate(
         RotationCommand.fromFacePosition(neighbour.relation.face.facePosition, DEFAULT_ROTATION)
      );
      return;
   }

   // rotate the bottom layer to check the next neighbour in the next iteration
   cube.rotate(RotationCommand.fromFacePosition(FacePosition.bottom, DEFAULT_ROTATION));
}

// #################################################################
// ##### Bring white edges to the top face ######
// #################################################################

function bringWhiteEdgesToTheTopFace(cube: RubixCube) {
   for (let i = 0; i < 5; i++) {
      let face = undefined;
      for (const neighbour of cube.top.neighbourList) {
         if (neighbour.relation.face.getCell(0, 1) === TileColor.white) {
            face = neighbour.relation.face;
         }
      }
      if (face === undefined) return;

      cube.rotateMultipleTimes([
         RotationCommand.fromFacePosition(face.facePosition, RotationDirection.right),
         RotationCommand.fromFacePosition(
            face.neighbours!.right.face.facePosition,
            RotationDirection.left
         ),
         RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.left),
         RotationCommand.fromFacePosition(
            face.neighbours!.right.face.facePosition,
            RotationDirection.right
         ),
         RotationCommand.fromFacePosition(face.facePosition, RotationDirection.right),
         RotationCommand.fromFacePosition(face.facePosition, RotationDirection.right),
      ]);
   }
   throw new Error("Bring white edges to top face failed");
}

// #################################################################
// ##### Orient edges and centers ######
// #################################################################

type NumberOfCorrectEdges = number;
function bringAtLeastTwoEdgesToTheirCenters(cube: RubixCube): NumberOfCorrectEdges {
   let numberOfCorrectEdges = 0;
   for (const neighbour of cube.top.neighbourList) {
      if (doesEdgeMatchItsCenter(neighbour.relation.face, LocalRelation.up)) {
         numberOfCorrectEdges++;
      }
   }
   // it can be 0, 1, 2 or 4
   if (numberOfCorrectEdges >= 2) return numberOfCorrectEdges;

   cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));
   return bringAtLeastTwoEdgesToTheirCenters(cube);
}

type CorrectFacesRelation = "opposite" | "adjacent" | "allEdgesMatch";
function bringTheRemainingEdgesToTheirCenters(cube: RubixCube): void {
   const { frontFace, relation } = getFrontFaceAndCorrectFacesRelation(cube.front);

   // already matched
   if (relation === "allEdgesMatch") return;

   if (relation === "adjacent") {
      // take the solved face that is right to the other solved face - treat it as the front
      // get the index of this face. this face will be 2 places after the last not solved face

      cube.rotateMultipleTimes([
         mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2), // R'
         mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0), // U
         mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2), // R
         mapLocalToGlobalRotation(frontFace, LocalRelation.right, 0), // U'
         mapLocalToGlobalRotation(frontFace, LocalRelation.down, 2), // R'
      ]);
      // now either all edges match their center or the matching edges are opposite of eachother
      return bringTheRemainingEdgesToTheirCenters(cube);
   }

   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2), // 2 R

      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 0), // 2 L

      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.left, 0), // 2 U

      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2),
      mapLocalToGlobalRotation(frontFace, LocalRelation.up, 2), // 2 R

      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 0),
      mapLocalToGlobalRotation(frontFace, LocalRelation.down, 0), // 2 L
   ]);
}

function getFrontFaceAndCorrectFacesRelation(frontFace: CubeFace): {
   frontFace: CubeFace;
   relation: CorrectFacesRelation;
} {
   const doesLeftFaceMatch = doesEdgeMatchItsCenter(
      frontFace.neighbours!.left.face,
      LocalRelation.up
   );
   const doesRightFaceMatch = doesEdgeMatchItsCenter(
      frontFace.neighbours!.right.face,
      LocalRelation.up
   );
   const doesThisFaceMatch = doesEdgeMatchItsCenter(frontFace, LocalRelation.up);

   if (doesLeftFaceMatch && doesRightFaceMatch) {
      if (doesThisFaceMatch) return { frontFace, relation: "allEdgesMatch" };
      return { frontFace, relation: "opposite" };
   }

   if (doesLeftFaceMatch && doesThisFaceMatch) return { frontFace, relation: "adjacent" };

   return getFrontFaceAndCorrectFacesRelation(frontFace.neighbours!.right.face);
}
