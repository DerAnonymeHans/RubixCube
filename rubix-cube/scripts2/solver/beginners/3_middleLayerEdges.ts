/** @format */

import { TileColor } from "../../cube/colors";
import { Plane, RotationCommand, RotationDirection } from "../../cube/commands";
import { CubeFace, FacePosition, RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import { mapLocalToGlobalRotation } from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";

function canEdgeBeSwappedWithYellowEdge(face: CubeFace, col: number, neighbour: CubeFace) {
   return (
      (face.getCell(1, col) !== face.getCell(1, 1) || neighbour.getCell(1, 2 - col) !== neighbour.getCell(1, 1)) &&
      face.getCell(1, col) !== TileColor.yellow &&
      neighbour.getCell(1, col) !== TileColor.yellow
   );
}

export function solveMiddleLayerEdges(cube: RubixCube) {
   flipWhiteFaceToTheBottom(cube);

   let i = 0;
   let allowSwitchingWithYellowEdges = false;
   while (true) {
      i++;
      if (i === 100) {
         break;
      }

      let numberOfSolvedFaces = 0;
      let numberOfNothingDone = 0;
      for (const neighbour of cube.top.neighbourList) {
         const face = neighbour.relation.face;
         const center = face.getCell(1, 1);
         const edgeTop = face.neighbours.top.getTouchingArrayUnaligned()[1];
         const edge = face.getCell(0, 1);

         const wouldTopEdgeSolveRight = edge === center && edgeTop === face.neighbours.right.face.getCell(1, 1);
         const wouldTopEdgeSolveLeft = edge === center && edgeTop === face.neighbours.left.face.getCell(1, 1);

         if (face.getCell(1, 0) === center && face.getCell(1, 2) === center && !wouldTopEdgeSolveRight && !wouldTopEdgeSolveLeft) {
            numberOfSolvedFaces++;
            continue;
         }

         if (allowSwitchingWithYellowEdges) {
            const canRightEdgeBeSwapped = canEdgeBeSwappedWithYellowEdge(face, 2, face.neighbours.right.face);
            if (canRightEdgeBeSwapped) {
               bringEdgeToTheRight(cube, face);
               allowSwitchingWithYellowEdges = false;
               continue;
            }

            const canLeftEdgeBeSwapped = canEdgeBeSwappedWithYellowEdge(face, 0, face.neighbours.left.face);
            if (canLeftEdgeBeSwapped) {
               bringEdgeToTheLeft(cube, face);
               allowSwitchingWithYellowEdges = false;
               continue;
            }
         }

         if (edge !== center) {
            numberOfNothingDone++;
            continue;
         }

         if (wouldTopEdgeSolveRight) {
            bringEdgeToTheRight(cube, face);
            continue;
         }

         if (wouldTopEdgeSolveLeft) {
            bringEdgeToTheLeft(cube, face);
            continue;
         }

         numberOfNothingDone++;
      }

      if (numberOfSolvedFaces === 4) break;
      if (numberOfNothingDone + numberOfSolvedFaces !== 4) continue;

      if (!allowSwitchingWithYellowEdges) {
         // Check if all of the edges in the top layer have a yellow face
         let numberOfYellowEdges = 0;
         for (const neighbour of cube.top.neighbourList) {
            const isYellowEdge =
               neighbour.relation.face.getCell(0, 1) === TileColor.yellow ||
               neighbour.relation.face.neighbours.top.getTouchingArrayUnaligned()[1] === TileColor.yellow;

            if (isYellowEdge) {
               numberOfYellowEdges++;
            }
         }

         if (numberOfYellowEdges === 4) {
            allowSwitchingWithYellowEdges = true;
            continue;
         }
      }

      cube.rotate(RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION));

      // break;
   }
   return;

   // let i = 0;
   // let numberOfYellowEdgesInTopLayer = 0;
   // while (true) {
   //     i++;
   //     if (i > 50) break;

   //     let doesAnyEdgeMatchCenter = false;

   //     let numberOfFacesWithSolvedMiddleEdges = 0;
   //     for (const neighbour of cube.top.neighbourList) {
   //         const face = neighbour.relation.face;
   //         const center = face.getCell(1, 1);
   //         const topFaceOfEdge = face.neighbours.top.getTouchingArrayUnaligned()[1];
   //         const edge = face.getCell(0, 1);

   //         if (face.getCell(1, 0) === center && face.getCell(1, 2) == center) {
   //             if (topFaceOfEdge !== TileColor.yellow && edge === center) {
   //                 if (topFaceOfEdge === face.neighbours.right.face.getCell(1, 1)) {
   //                     bringEdgeToTheRight(cube, face);
   //                 } else {
   //                     bringEdgeToTheLeft(cube, face);
   //                 }
   //                 continue;
   //             }

   //             numberOfFacesWithSolvedMiddleEdges++;
   //             continue;
   //         }

   //         if (edge !== center) {
   //             continue;
   //         }

   //         // if all the edges on the side are yellow then the cube is either solved (in that case the loop will have broken) or, in this case, there a edges at the wrong face
   //         // when that is the case these will have to be temporarily replaces with yellow edges - then the wrong edge gets to the top and can be rotated to its correct spot
   //         if (numberOfYellowEdgesInTopLayer === 4) {
   //             if (face.getCell(0, 1) !== center) {
   //                 numberOfYellowEdgesInTopLayer = 0;
   //                 bringEdgeToTheLeft(cube, face);
   //             } else if (face.getCell(1, 2) !== center) {
   //                 numberOfYellowEdgesInTopLayer = 0;
   //                 bringEdgeToTheRight(cube, face);
   //             }
   //             continue;
   //         }
   //         doesAnyEdgeMatchCenter = true;

   //         // in rare cases there will only be yellow edges on the top layer facing to the side
   //         if (edge === TileColor.yellow || topFaceOfEdge === TileColor.yellow) {
   //             numberOfYellowEdgesInTopLayer++;
   //             continue;
   //         }

   //         numberOfYellowEdgesInTopLayer--;

   //         if (face.getCell(1, 0) !== center) {
   //             bringEdgeToTheLeft(cube, face);
   //         } else {
   //             bringEdgeToTheRight(cube, face);
   //         }
   //     }

   //     if (numberOfFacesWithSolvedMiddleEdges === 4) break;

   //     if (!doesAnyEdgeMatchCenter) {
   //         cube.rotate(new RotationCommand(Plane.yPlane, 2, DEFAULT_ROTATION));
   //     }
   // }
}

function bringEdgeToTheLeft(cube: RubixCube, face: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(face, LocalRelation.right, 0),
      mapLocalToGlobalRotation(face, LocalRelation.up, 0),
      mapLocalToGlobalRotation(face, LocalRelation.left, 0),
      mapLocalToGlobalRotation(face, LocalRelation.down, 0),
      mapLocalToGlobalRotation(face, LocalRelation.left, 0),
      mapLocalToGlobalRotation(face.neighbours.right.face, LocalRelation.down, 0),
      mapLocalToGlobalRotation(face, LocalRelation.right, 0),
      mapLocalToGlobalRotation(face.neighbours.right.face, LocalRelation.up, 0),
   ]);
}

function bringEdgeToTheRight(cube: RubixCube, face: CubeFace) {
   cube.rotateMultipleTimes([
      mapLocalToGlobalRotation(face, LocalRelation.left, 0),
      mapLocalToGlobalRotation(face, LocalRelation.up, 2),
      mapLocalToGlobalRotation(face, LocalRelation.right, 0),
      mapLocalToGlobalRotation(face, LocalRelation.down, 2),
      mapLocalToGlobalRotation(face, LocalRelation.right, 0),
      mapLocalToGlobalRotation(face.neighbours.right.face, LocalRelation.up, 0),
      mapLocalToGlobalRotation(face, LocalRelation.left, 0),
      mapLocalToGlobalRotation(face.neighbours.right.face, LocalRelation.down, 0),
   ]);
}

function flipWhiteFaceToTheBottom(cube: RubixCube) {
   cube.rotateMultipleTimes([
      new RotationCommand(Plane.xPlane, 0, RotationDirection.right),
      new RotationCommand(Plane.xPlane, 0, RotationDirection.right),

      new RotationCommand(Plane.xPlane, 1, RotationDirection.left),
      new RotationCommand(Plane.xPlane, 1, RotationDirection.left),

      new RotationCommand(Plane.xPlane, 2, RotationDirection.left),
      new RotationCommand(Plane.xPlane, 2, RotationDirection.left),
   ]);
}
