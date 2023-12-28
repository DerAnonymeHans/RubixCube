/** @format */

import { TileColor } from "../../cube/colors";
import { RotationCommand, RotationDirection } from "../../cube/commands";
import { FacePosition, RubixCube } from "../../cube/cube";
import { startVisualRotationHere } from "../../cube/helper";
import {
   CornerTile,
   getCornerTiles,
   getEdgeTiles,
   getEdges,
   mapLocalToGlobalRotation,
} from "../helper";
import { DEFAULT_ROTATION, LocalRelation } from "../types";

// I am so sorry.
// This seems to work on thousands of tries. Do NOT change this

// https://solvethecube.com/algorithms
export function solveFirstTwoLayers(cube: RubixCube) {
   let numberOfSolvedEdges = 0;
   let i = 0;
   while (numberOfSolvedEdges < 4) {
      i++;
      if (i > 50) break;
      for (let j = 0; j < 4; j++) {
         const delta = solveCurrentFirstTwoLayers(cube);
         if (delta === 1) {
            const lastRotation = cube.rotations[cube.rotations.length - 1];
            cube.rotations[cube.rotations.length - 1] = new RotationCommand(
               lastRotation.plane,
               lastRotation.idx,
               lastRotation.direction,
               "Corner solved"
            );
         }
         numberOfSolvedEdges += delta;

         if (numberOfSolvedEdges === 4) break;
         // unnecessary get deleted at the end
         cube.rotate(
            RotationCommand.fromFacePosition(FacePosition.top, DEFAULT_ROTATION, "Rotate top")
         );
      }
      const cornerLifted = liftWrongCorner(cube);
      if (!cornerLifted) liftWrongEdge(cube);
      startVisualRotationHere(cube);
   }
}

function liftWrongEdge(cube: RubixCube) {
   for (const neighbour of cube.top.neighbourList) {
      const front = neighbour.relation.face;
      const right = front.neighbours.right.face;

      const [frontTile, rightTile, bottomTile] = getCornerTiles(front, right, cube.bottom);
      const isBottomRightCornerSolved =
         frontTile.color === front.faceColor &&
         rightTile.color === right.faceColor &&
         bottomTile.color === cube.bottom.faceColor;

      const rightEdgeTiles = getEdgeTiles(front, right);
      const [edgeFront, edgeRight] = rightEdgeTiles;
      const isRightEdgeSolved = edgeFront === front.faceColor && edgeRight === right.faceColor;

      const isRightSideSolved = isBottomRightCornerSolved && isRightEdgeSolved;
      if (isRightSideSolved) continue;

      cube.rotate(
         RotationCommand.fromFacePosition(
            right.facePosition,
            RotationDirection.right,
            "Lift wrong edge"
         )
      );

      const topLeftCorner = getCornerTiles(front, front.neighbours.left.face, cube.top);
      const doesTopLeftCornerMatchEdge = getNonWhiteCornerColors(topLeftCorner).every((x) =>
         rightEdgeTiles.includes(x)
      );

      const topRotationDirection = doesTopLeftCornerMatchEdge
         ? RotationDirection.right
         : RotationDirection.left;
      cube.rotateMultipleTimes([
         RotationCommand.fromFacePosition(FacePosition.top, topRotationDirection),
         RotationCommand.fromFacePosition(right.facePosition, RotationDirection.left),
      ]);
      return;
   }
}

function checkIfEdgeIsOnValidPosition(
   cube: RubixCube,
   color1: TileColor,
   color2: TileColor
): boolean {
   for (const neighbour of cube.top.neighbourList) {
      const front = neighbour.relation.face;
      const right = front.neighbours.right.face;

      const rightEdge = getEdgeTiles(front, right);
      if (rightEdge.every((x) => x === color1 || x === color2)) {
         const [frontTile, rightTile] = rightEdge;
         return frontTile === front.faceColor && rightTile === right.faceColor;
      }

      const topEdge = getEdgeTiles(front, cube.top);
      if (topEdge.every((x) => x === color1 || x === color2)) {
         return true;
      }
   }
   throw new Error("edge not found");
}

function getNonWhiteCornerColors(cornerTiles: CornerTile[]) {
   return cornerTiles.map((x) => x.color).filter((x) => x !== TileColor.white);
}

function liftWrongCorner(cube: RubixCube): boolean {
   for (const neighbour of cube.top.neighbourList) {
      const front = neighbour.relation.face;
      const right = front.neighbours.right.face;
      const bottomRightCorner = getCornerTiles(front, right, cube.bottom);

      const [frontTile, rightTile, bottomTile] = bottomRightCorner;

      const cornerSolved =
         frontTile.color === front.faceColor &&
         rightTile.color === rightTile.face.faceColor &&
         bottomTile.color === bottomTile.face.faceColor;

      const isBottomRightCornerWhite = bottomRightCorner.find((x) => x.color === TileColor.white);

      if (cornerSolved || !isBottomRightCornerWhite) continue;

      const cornerColors = getNonWhiteCornerColors(bottomRightCorner);
      if (!checkIfEdgeIsOnValidPosition(cube, cornerColors[0], cornerColors[1])) continue;
      cube.rotate(
         RotationCommand.fromFacePosition(
            right.facePosition,
            RotationDirection.right,
            "Lift wrong corner"
         )
      );

      const isTopLeftCornerWhite =
         getCornerTiles(front, front.neighbours.left.face, cube.top).find(
            (x) => x.color === TileColor.white
         ) !== undefined;

      const bottomRightCornerColors = getNonWhiteCornerColors(bottomRightCorner);
      const isMatchingEdgeAtFront = getEdgeTiles(front, cube.top).every((x) =>
         bottomRightCornerColors.includes(x)
      );
      const isMatchingEdgeAtBack = getEdgeTiles(front.oppositeFace, cube.top).every((x) =>
         bottomRightCornerColors.includes(x)
      );

      let topRotationDirection = isMatchingEdgeAtFront
         ? RotationDirection.right
         : RotationDirection.left;
      if (!isMatchingEdgeAtBack && !isMatchingEdgeAtFront) {
         topRotationDirection = isTopLeftCornerWhite
            ? RotationDirection.right
            : RotationDirection.left;
      }

      cube.rotateMultipleTimes([
         RotationCommand.fromFacePosition(FacePosition.top, topRotationDirection),
         RotationCommand.fromFacePosition(right.facePosition, RotationDirection.left),
      ]);
      return true;
   }
   return false;
}

function solveCurrentFirstTwoLayers(cube: RubixCube): number {
   let i = 0;
   for (const neighbour of cube.top.neighbourList) {
      const front = neighbour.relation.face;
      const right = front.neighbours.right.face;
      const [top_frontTile, top_rightTile, topTile] = getCornerTiles(
         front,
         front.neighbours.right.face,
         cube.top
      );
      const [bottom_frontTile, bottom_rightTile, bottomTile] = getCornerTiles(
         front,
         front.neighbours.right.face,
         cube.bottom
      );

      const U = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.right);
      const U_ = RotationCommand.fromFacePosition(FacePosition.top, RotationDirection.left);

      const R = RotationCommand.fromFacePosition(right.facePosition, RotationDirection.right);
      const R_ = RotationCommand.fromFacePosition(right.facePosition, RotationDirection.left);

      const F = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.right);
      const F_ = RotationCommand.fromFacePosition(front.facePosition, RotationDirection.left);

      // outcome same as rotating the top face to the left but then i would have to modify the algorithm because the corner would move
      const d = [
         RotationCommand.fromLocalRotation(front, LocalRelation.right, 1),
         RotationCommand.fromLocalRotation(front, LocalRelation.right, 2),
      ];
      const d_ = [
         RotationCommand.fromLocalRotation(front, LocalRelation.left, 1),
         RotationCommand.fromLocalRotation(front, LocalRelation.left, 2),
      ];

      const topMatchesRightFrontMatchesFront =
         top_frontTile.color === front.faceColor &&
         top_rightTile.color === TileColor.white &&
         topTile.color === right.faceColor;

      const topMatchesFrontRightMatchesRight =
         top_frontTile.color === TileColor.white &&
         top_rightTile.color === right.faceColor &&
         topTile.color === front.faceColor;

      const top_frontMatchesRightRightMatchesFront =
         top_frontTile.color === right.faceColor &&
         top_rightTile.color === front.faceColor &&
         topTile.color === TileColor.white;

      const top_frontMatchesFrontRightMatchesRight =
         top_frontTile.color === front.faceColor &&
         top_rightTile.color === right.faceColor &&
         topTile.color === TileColor.white;

      const bottomMatchesFrontFrontMatchesRight =
         bottom_frontTile.color === right.faceColor &&
         bottom_rightTile.color === TileColor.white &&
         bottomTile.color === front.faceColor;

      const bottomMatchesRightRightMatchesFront =
         bottom_frontTile.color === TileColor.white &&
         bottom_rightTile.color === front.faceColor &&
         bottomTile.color === right.faceColor;

      const bottomInPlace =
         bottom_frontTile.color === front.faceColor &&
         bottom_rightTile.color === right.faceColor &&
         bottomTile.color === TileColor.white;

      // Basic cases
      {
         if (
            topMatchesRightFrontMatchesFront &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor &&
            front.oppositeFace.getCell(0, 1) === right.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, R_]);
            continue;
         }
         if (
            topMatchesFrontRightMatchesRight &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor &&
            right.oppositeFace.getCell(0, 1) === front.faceColor
         ) {
            cube.rotateMultipleTimes([F_, U_, F]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U, R, U_, R_]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U_, F_, U, F]);
            continue;
         }
      }

      // corners and edge in top
      {
         if (
            topMatchesRightFrontMatchesFront &&
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U_, R_, U, R, U, R_]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U, F, U_, F_, U_, F]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            right.oppositeFace.getCell(0, 1) === right.faceColor &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, R_, U, R, U, R_]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.oppositeFace.getCell(0, 1) === front.faceColor &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U_, F, U_, F_, U_, F]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            front.getCell(0, 1) === right.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([...d, R_, U, U, R, ...d_, R, U, R_]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            right.getCell(0, 1) === front.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, U, R_, ...d, R_, U_, R]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            right.getCell(0, 1) === front.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, U, ...d, R_, U_, R]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.getCell(0, 1) === right.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, U, R_, ...d, R_, U_, R]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            front.oppositeFace.getCell(0, 1) === front.faceColor &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U, U, F, U, F_, U, U, F]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            right.oppositeFace.getCell(0, 1) === right.faceColor &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, U, R_, U_, R, U, U, R_]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            right.oppositeFace.getCell(0, 1) === front.faceColor &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U_, F, U, F_, U, U, F]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.oppositeFace.getCell(0, 1) === right.faceColor &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, R_, U_, R, U, U, R_]);
            continue;
         }
      }

      // Corner pointing up, edge in top
      if (top_frontMatchesRightRightMatchesFront) {
         if (
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, U, R_, U_, R, U, R_]);
            continue;
         }

         if (
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([F_, U, U, F, U, F_, U_, F]);
            continue;
         }

         if (
            front.oppositeFace.getCell(0, 1) === right.faceColor &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U, R, U, U, R_, U, R, U_, R_]);
            continue;
         }

         if (
            right.oppositeFace.getCell(0, 1) === front.faceColor &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U_, F_, U, U, F, U_, F_, U, F]);
            continue;
         }

         if (
            right.oppositeFace.getCell(0, 1) === right.faceColor &&
            right.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U, U, R, U, R_, U, R, U_, R_]);
            continue;
         }

         if (
            front.oppositeFace.getCell(0, 1) === front.faceColor &&
            front.oppositeFace.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, U, F_, U_, F, U_, F_, U, F]);
            continue;
         }

         if (
            front.getCell(0, 1) === right.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, R_, U_, U_, R, U, R_, U_, R, U, R_]);
            continue;
         }

         if (
            right.getCell(0, 1) === front.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            // TODO: May not work (y = whole cube rotation)
            cube.rotateMultipleTimes([F_, U_, F, U, U, F_, U_, F, U, F_, U_, F]);
            continue;
         }
      }

      // corner in top, edge in middle
      {
         if (
            topMatchesRightFrontMatchesFront &&
            front.getCell(1, 2) === front.faceColor &&
            right.getCell(1, 0) === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U, F, U, F_, U, U, F]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.getCell(1, 2) === front.faceColor &&
            right.getCell(1, 0) === right.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U_, R_, U_, R, U, U, R_]);
            continue;
         }

         if (
            topMatchesRightFrontMatchesFront &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([U, F_, U_, F, ...d_, F, U, F_]);
            continue;
         }

         if (
            topMatchesFrontRightMatchesRight &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, R, U, R_, ...d, R_, U_, R]);
            continue;
         }

         if (
            top_frontMatchesRightRightMatchesFront &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, ...d, R_, U, R]);
            continue;
         }

         if (
            top_frontMatchesRightRightMatchesFront &&
            front.getCell(1, 2) === front.faceColor &&
            right.getCell(1, 0) === right.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, R_, U_, R, U, R_, U_, R, U, R_]);
            continue;
         }
      }

      // corner in bottom, edge in top
      {
         if (
            bottomInPlace &&
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([U, R, U_, R_, U_, F_, U, F]);
            continue;
         }

         if (
            bottomInPlace &&
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([U_, F_, U, F, U, R, U_, R_]);
            continue;
         }

         if (
            bottomMatchesFrontFrontMatchesRight &&
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([F_, U, F, U_, F_, U, F]);
            continue;
         }

         if (
            bottomMatchesRightRightMatchesFront &&
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, U, R, U_, R_]);
            continue;
         }

         if (
            bottomMatchesFrontFrontMatchesRight &&
            right.getCell(0, 1) === right.faceColor &&
            right.neighbours.top.getTouchingArrayUnaligned()[1] === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, R_, U_, R, U, R_]);
            continue;
         }

         if (
            bottomMatchesRightRightMatchesFront &&
            front.getCell(0, 1) === front.faceColor &&
            front.neighbours.top.getTouchingArrayUnaligned()[1] === right.faceColor
         ) {
            cube.rotateMultipleTimes([F_, U_, F, U, F_, U_, F]);
            continue;
         }
      }

      // corner in bottom, edge in middle
      {
         if (
            bottomMatchesFrontFrontMatchesRight &&
            front.getCell(1, 2) === front.faceColor &&
            right.getCell(1, 0) === right.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, U, R, U, U, R_, U, R, U_, R_]);
            continue;
         }

         if (
            bottomMatchesRightRightMatchesFront &&
            front.getCell(1, 2) === front.faceColor &&
            right.getCell(1, 0) === right.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, U_, R, U, R_, U_, R, U, U, R_]);
            continue;
         }

         if (
            bottomMatchesFrontFrontMatchesRight &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U, R_, U_, R, U_, R_, U, ...d, R_, U_, R]);
            continue;
         }

         if (
            bottomMatchesRightRightMatchesFront &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, ...d, R_, U_, R, U_, R_, U_, R]);
            continue;
         }

         if (
            bottomInPlace &&
            front.getCell(1, 2) === right.faceColor &&
            right.getCell(1, 0) === front.faceColor
         ) {
            cube.rotateMultipleTimes([R, U_, R_, ...d, R_, U, U, R, U, R_, U, U, R]);
            continue;
         }
      }

      i++;
   }

   return 4 - i;
}
