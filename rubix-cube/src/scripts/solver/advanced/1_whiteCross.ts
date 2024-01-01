/** @format */

import { TileColor } from "../../cube/colors";
import { RotationCommand, RotationDirection } from "../../cube/commands";
import { RubixCube } from "../../cube/cube";
import {
   bringCenterToDifferentFace,
   doesEdgeMatchItsCenter,
   getRotationForEdgeToDifferentEdgeOnFace,
   mapLocalToGlobalRotation,
} from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";
import { invertRotation } from "../../cube/helper";
import { CubeFace } from "../../cube/cubeFace";
import { FacePosition } from "@/scripts/cube/types";

export function solveWhiteCross(cube: RubixCube) {
   // find the white center
   let faceWithWhiteCenter: CubeFace = cube.top;
   for (const face of cube.faces) {
      if (face.getCell(1, 1) !== TileColor.white) continue;
      faceWithWhiteCenter = face;
      break;
   }
   // bring white center to the top
   cube.rotateMultipleTimes(bringCenterToDifferentFace(faceWithWhiteCenter, FacePosition.bottom));
   orientBottomFaceWhiteEdges(cube);
   bringWhiteEdgesToTheBottomFace(cube);
}

function bringWhiteEdgesToTheBottomFace(cube: RubixCube) {
   let i = 0;
   let allowSuboptimal = false;
   while (i < 50) {
      i++;
      bringTopFaceWhiteEdgesToBottomFace(cube);
      const numberOfRotations = bringSideFaceWhiteEdgesToBottomFace(cube, allowSuboptimal);
      if (numberOfRotations === 0) {
         if (allowSuboptimal) break;
         allowSuboptimal = true;
      } else {
         allowSuboptimal = false;
      }
   }
   bringTopFaceWhiteEdgesToBottomFace(cube);
}

type Rotation = "left" | "right" | "flip" | "none";
function orientBottomFaceWhiteEdges(cube: RubixCube) {
   const rotations = {
      left: 0,
      right: 0,
      flip: 0,
      none: 0,
   };

   if (cube.bottom.getCell(0, 1) === TileColor.white) {
      rotations[getNeededRotation(cube.bottom.neighbours.top.face)]++;
   }
   if (cube.bottom.getCell(1, 2) === TileColor.white) {
      rotations[getNeededRotation(cube.bottom.neighbours.right.face)]++;
   }
   if (cube.bottom.getCell(2, 1) === TileColor.white) {
      rotations[getNeededRotation(cube.bottom.neighbours.bottom.face)]++;
   }
   if (cube.bottom.getCell(1, 0) === TileColor.white) {
      rotations[getNeededRotation(cube.bottom.neighbours.left.face)]++;
   }

   const numberOfWhiteEdges = Object.values(rotations).reduce((prev, curr) => prev + curr, 0);
   if (numberOfWhiteEdges === 4) {
      bringBottomFaceWhiteEdgesToTheirCenters(cube);
      return;
   }

   const bestRotationEntry = Object.entries(rotations).sort((a, b) => b[1] - a[1])[0];
   if (bestRotationEntry[1] === 0) return;
   const bestRotation = bestRotationEntry[0] as Rotation;

   if (bestRotation === "none") return;
   if (bestRotation === "left") {
      cube.rotate(RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.left));
      return;
   }
   if (bestRotation === "right") {
      cube.rotate(RotationCommand.fromFacePosition(FacePosition.bottom, RotationDirection.right));
      return;
   }
   cube.rotateMultipleTimes([
      RotationCommand.fromFacePosition(FacePosition.bottom, DEFAULT_ROTATION),
      RotationCommand.fromFacePosition(FacePosition.bottom, DEFAULT_ROTATION),
   ]);

   function getNeededRotation(face: CubeFace): Rotation {
      const edge = face.getCell(2, 1);
      if (edge === face.getCell(1, 1)) return "none";
      if (edge === face.neighbours.left.face.getCell(1, 1)) return "left";
      if (edge === face.neighbours.right.face.getCell(1, 1)) return "right";
      return "flip";
   }
}

function bringTopFaceWhiteEdgesToBottomFace(cube: RubixCube, allowFaceRotations = false) {
   let numberOfRemainingWhiteEdgesOnBottomLayer = 0;
   let numberOfRotations = 0;
   for (const neighbour of cube.top.neighbourList) {
      const face = neighbour.relation.face;
      const isWhiteEdgeOnTopFace =
         face.neighbours.top.getTouchingArrayUnaligned()[1] === TileColor.white;
      if (!isWhiteEdgeOnTopFace) continue;

      const edgeColor = face.getCell(0, 1);
      const doesEdgeMatchCenter = edgeColor === face.getCell(1, 1);
      let newFace = face;
      if (!doesEdgeMatchCenter) {
         if (!allowFaceRotations) {
            numberOfRemainingWhiteEdgesOnBottomLayer++;
            continue;
         }
         // Rotate top layer so that the edge matches its center
         if (face.neighbours.left.face.getCell(1, 1) === edgeColor) {
            cube.rotate(mapLocalToGlobalRotation(face, LocalRelation.left, 0));
            newFace = face.neighbours.left.face;
         } else if (face.neighbours.right.face.getCell(1, 1) === edgeColor) {
            cube.rotate(mapLocalToGlobalRotation(face, LocalRelation.right, 0));
            newFace = face.neighbours.right.face;
         } else {
            cube.rotateMultipleTimes([
               RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION),
               RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION),
            ]);
            newFace = face.neighbours.left.face.neighbours.left.face;
         }
      }

      cube.rotateMultipleTimes([
         RotationCommand.fromFacePosition(
            newFace.facePosition,
            DEFAULT_ROTATION,
            "bringTopFaceWhiteEdgesToBottomFace - rotate to botom"
         ),
         RotationCommand.fromFacePosition(newFace.facePosition, DEFAULT_ROTATION),
      ]);

      numberOfRotations++;
   }

   if (numberOfRemainingWhiteEdgesOnBottomLayer > 0) bringTopFaceWhiteEdgesToBottomFace(cube, true);
   if (numberOfRotations !== 0) bringTopFaceWhiteEdgesToBottomFace(cube, false);
}

function bringSideFaceWhiteEdgesToBottomFace(cube: RubixCube, allowSuboptimal: boolean): number {
   let numberOfRotations = 0;
   for (const neighbour of cube.bottom.neighbourList) {
      const face = neighbour.relation.face;

      let whiteEdgePosition: LocalRelation | null = null;
      if (face.getCell(1, 0) === TileColor.white) {
         whiteEdgePosition = LocalRelation.left;
      } else if (face.getCell(1, 2) === TileColor.white) {
         whiteEdgePosition = LocalRelation.right;
      } else if (face.getCell(0, 1) === TileColor.white) {
         whiteEdgePosition = LocalRelation.up;
      } else if (face.getCell(2, 1) === TileColor.white) {
         whiteEdgePosition = LocalRelation.down;
      }

      if (whiteEdgePosition === null) continue;

      const center = face.getCell(1, 1);
      const edgeColor = face
         .getNeighbour(whiteEdgePosition)
         .relation.getTouchingArrayUnaligned()[1];

      if (edgeColor === center) {
         solveWhiteEdgeOnCorrectFace(cube, face, whiteEdgePosition);
         numberOfRotations++;
         continue;
      }

      if (!allowSuboptimal) continue;
      numberOfRotations++;

      solveWhiteEdgeOnWrongSideFace(cube, face, whiteEdgePosition, edgeColor);
   }
   return numberOfRotations;
}

function solveWhiteEdgeOnCorrectFace(
   cube: RubixCube,
   face: CubeFace,
   whiteEdgePosition: LocalRelation
) {
   if (whiteEdgePosition === LocalRelation.left) {
      // rotate the white edge to the bottom face
      cube.rotateMultipleTimes([
         mapLocalToGlobalRotation(face, LocalRelation.right, 1),
         RotationCommand.fromFacePosition(
            face.facePosition,
            RotationDirection.right,
            "Solve white edge on correct face. Localrelation left"
         ),
         mapLocalToGlobalRotation(face, LocalRelation.left, 1),
      ]);
   } else {
      // rotate white edge to the right side
      cube.rotateMultipleTimes(
         getRotationForEdgeToDifferentEdgeOnFace(face, whiteEdgePosition, LocalRelation.right)
      );

      // rotate the white edge to the bottom face
      cube.rotateMultipleTimes([
         mapLocalToGlobalRotation(face, LocalRelation.left, 1),
         RotationCommand.fromFacePosition(
            face.facePosition,
            RotationDirection.left,
            "Solve white edge on correct face"
         ),
         mapLocalToGlobalRotation(face, LocalRelation.right, 1),
      ]);
   }
}

function solveWhiteEdgeOnWrongSideFace(
   cube: RubixCube,
   face: CubeFace,
   whiteEdgePosition: LocalRelation,
   edgeColor: TileColor
) {
   const faceAlreadySolved = isFaceSolved(face);
   if (face.neighbours.left.face.getCell(1, 1) === edgeColor) {
      const rotationsToLeftEdge = getRotationForEdgeToDifferentEdgeOnFace(
         face,
         whiteEdgePosition,
         LocalRelation.left
      );
      // after this the colored edge is next to its matching center
      cube.rotateMultipleTimes(rotationsToLeftEdge);
      // after this the white edge is on the bottom face
      cube.rotate(
         RotationCommand.fromFacePosition(
            face.neighbours.left.face.facePosition,
            RotationDirection.right
         )
      );

      if (faceAlreadySolved)
         cube.rotateMultipleTimes(rotationsToLeftEdge.map((x) => invertRotation(x)));
   } else if (face.neighbours.right.face.getCell(1, 1) === edgeColor) {
      const rotationsToRightEdge = getRotationForEdgeToDifferentEdgeOnFace(
         face,
         whiteEdgePosition,
         LocalRelation.right
      );
      // after this the colored edge is next to its matching center
      cube.rotateMultipleTimes(rotationsToRightEdge);
      // after this the white edge is on the bottom face
      cube.rotate(
         RotationCommand.fromFacePosition(
            face.neighbours.right.face.facePosition,
            RotationDirection.left
         )
      );

      if (faceAlreadySolved)
         cube.rotateMultipleTimes(rotationsToRightEdge.map((x) => invertRotation(x)));
   } else {
      // white edge is on the opposite side of the correct face

      // rotate the white edge on the correct face
      let faceToRotate: CubeFace = face.neighbours.right.face;
      let whiteEdgePositionOnOppositeFace = LocalRelation.left;
      const rotationsToInvert: RotationCommand[] = [];
      if (whiteEdgePosition === LocalRelation.left) {
         faceToRotate = face.neighbours.left.face;
         whiteEdgePositionOnOppositeFace = LocalRelation.right;
      } else {
         // when white edge on top or bottom, rotate to the right
         const rotations = getRotationForEdgeToDifferentEdgeOnFace(
            face,
            whiteEdgePosition,
            LocalRelation.right
         );
         if (rotations[0]) rotations[0].msg = "Rotate white edte to right side";
         // rotating back is only necessary when the face is already correct
         if (faceAlreadySolved) rotationsToInvert.push(...rotations);
         cube.rotateMultipleTimes(rotations);
      }

      // rotate the white edge on the correct face
      const rotations = [
         RotationCommand.fromFacePosition(faceToRotate.facePosition, DEFAULT_ROTATION),
         RotationCommand.fromFacePosition(faceToRotate.facePosition, DEFAULT_ROTATION),
      ];
      // rotating back is only necessary when the face is already correct
      if (isFaceSolved(faceToRotate)) rotationsToInvert.push(...rotations);
      cube.rotateMultipleTimes(rotations);

      const oppositeFace = face.neighbours.left.face.neighbours.left.face;
      solveWhiteEdgeOnCorrectFace(cube, oppositeFace, whiteEdgePositionOnOppositeFace);

      cube.rotateMultipleTimes(rotationsToInvert.map((x) => invertRotation(x)));
   }
}

type CorrectFacesRelation = "opposite" | "adjacent" | "allEdgesMatch";
function bringBottomFaceWhiteEdgesToTheirCenters(cube: RubixCube): void {
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
      return bringBottomFaceWhiteEdgesToTheirCenters(cube);
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

function isFaceSolved(face: CubeFace) {
   if (face.neighbours.top.getTouchingArrayUnaligned()[1] !== TileColor.white) return false;
   return face.getCell(0, 1) === face.getCell(1, 1);
}
