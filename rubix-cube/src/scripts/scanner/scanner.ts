/** @format */

import { GreyAlgorithm, Image } from "image-js";
import { Color, ColorCounter, ColorDescriptor, EXPECTED_COLORS, ImagePoint } from "./types";
import { TileColor } from "../cube/colors";
import * as THREE from "three";
import { averageLum, colorToTileColor, getColorDistance, inRange, toVec3, withLum } from "./helper";

export const SCAN_AREA_WIDTH = 400;
const RELATIVE_PADDING = 0.05;

class Boundary {
   startRow: number;
   endRow: number;
   startCol: number;
   endCol: number;

   constructor(startRow: number, endRow: number, startCol: number, endCol: number) {
      this.startRow = Math.round(startRow);
      this.endRow = Math.round(endRow);
      this.startCol = Math.round(startCol);
      this.endCol = Math.round(endCol);
   }
}

export function analyzeFaceImage(image: Image): TileColor[] {
   const colors: TileColor[] = [];

   const padding = image.height * RELATIVE_PADDING;
   const imgSizeWithoutPadding = image.height - 2 * padding;

   const boundaries = [
      // upper row
      new Boundary(
         padding,
         padding + imgSizeWithoutPadding / 3,
         padding,
         padding + imgSizeWithoutPadding / 3
      ),
      new Boundary(
         padding,
         padding + imgSizeWithoutPadding / 3,
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3
      ),
      new Boundary(
         padding,
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding
      ),

      // middle row
      new Boundary(
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding,
         padding + imgSizeWithoutPadding / 3
      ),
      new Boundary(
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3
      ),
      new Boundary(
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding
      ),

      // lower row
      new Boundary(
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding,
         padding,
         padding + imgSizeWithoutPadding / 3
      ),
      new Boundary(
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding,
         padding + imgSizeWithoutPadding / 3,
         padding + (2 * imgSizeWithoutPadding) / 3
      ),
      new Boundary(
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding,
         padding + (2 * imgSizeWithoutPadding) / 3,
         padding + imgSizeWithoutPadding
      ),
   ];

   const avgLum = averageLum(image);
   for (const bounds of boundaries) {
      const color = analyzeBox(image, bounds, avgLum);
      colors.push(color);
   }

   return colors;
}

function analyzeBox(image: Image, bounds: Boundary, avgLum: number): TileColor {
   const skip = 4;
   const counter = new ColorCounter();
   for (let row = bounds.startRow; row < bounds.endRow; row += skip) {
      for (let col = bounds.startCol; col < bounds.endCol; col += skip) {
         const idx = 4 * (row * image.width + col);
         const rgb = new THREE.Vector3(image.data[idx], image.data[idx + 1], image.data[idx + 2]);
         image.data[idx] = 0;
         image.data[idx + 1] = 0;
         image.data[idx + 2] = 0;
         const color = getColor(rgb, avgLum);
         counter.add(color.color);
      }
   }
   return colorToTileColor(counter.dominantColor());
}

function getColor(rgb: THREE.Vector3, avgLum: number): ColorDescriptor {
   const rgbl = withLum(rgb).normalize();

   let maxAccDescriptor: ColorDescriptor = new ColorDescriptor(Color.unknown, 0);
   for (const color of EXPECTED_COLORS) {
      let accuracy = 1 / getColorDistance(rgbl, color.vec, avgLum);
      if (accuracy > maxAccDescriptor?.accuracy) {
         maxAccDescriptor = new ColorDescriptor(color.c, accuracy);
      }
   }
   return maxAccDescriptor!;
}
