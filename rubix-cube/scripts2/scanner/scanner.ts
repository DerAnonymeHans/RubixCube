/** @format */

import { GreyAlgorithm, Image } from "image-js";
import { Color, ColorCounter, ColorDescriptor, EXPECTED_COLORS, ImagePoint } from "./types";
import { TileColor } from "../cube/colors";
import * as THREE from "three";
import { averageBrightness, colorToTileColor, getColorDistance, inRange, toVec3, withLum } from "./helper";

export const SCAN_AREA_WIDTH = 400;
const RELATIVE_PADDING = 0.05;

export function analyzeFaceImage(image: Image): TileColor[] {
   maskImage(image);

   const colors: TileColor[] = [];

   const padding = image.height * RELATIVE_PADDING;
   const startRows = [padding, image.height / 3, (image.height * 2) / 3, image.height - padding];

   for (let i = 0; i < 3; i++) {
      const startRow = Math.floor(startRows[i]);
      const endRow = Math.floor(startRows[i + 1]);
      const stripColors = analyzeStrip(image, startRow, endRow - startRow);
      colors.push(...stripColors);
   }

   return colors;
}

function maskImage(image: Image) {
   const avgBrightness = averageBrightness(image);
   const blackMask = getBlackMask(image.clone(), avgBrightness);
   image.multiply(blackMask);
}

function analyzeStrip(image: Image, startRow: number, rowCount: number): TileColor[] {
   const skip = 2;
   const counters = [new ColorCounter(), new ColorCounter(), new ColorCounter()];

   for (let i = 0; i < rowCount; i += 1 + skip) {
      const rowIdx = startRow + i;
      const dominantColors = analyzeRow(image, rowIdx);

      counters[0].add(dominantColors[0]);
      counters[1].add(dominantColors[1]);
      counters[2].add(dominantColors[2]);
   }

   return counters.map((counter) => colorToTileColor(counter.dominantColor()));
}

function analyzeRow(image: Image, row: number): TileColor[] {
   const rowStart = image.width * row * 4;

   const counters = [new ColorCounter(), new ColorCounter(), new ColorCounter()];
   let tileIdx = 0;

   const skip = 3;
   const padding = Math.floor(image.width * RELATIVE_PADDING);

   for (let i = padding; i < image.width - padding; i += 1 + skip) {
      const idx = rowStart + i * 4;
      const rgb = new THREE.Vector3(image.data[idx], image.data[idx + 1], image.data[idx + 2]);

      image.data[idx] = 0;
      image.data[idx + 1] = 0;
      image.data[idx + 2] = 0;

      const descriptor = getColor(rgb);
      counters[tileIdx].add(descriptor.color);

      if (inRange(Math.floor(image.width / 3) * (tileIdx + 1), i, skip * 0.5)) {
         tileIdx++;
      }
   }

   return counters.map((counter) => colorToTileColor(counter.dominantColor()));
}

function getColor(rgb: THREE.Vector3): ColorDescriptor {
   const rgbl = withLum(rgb.normalize());

   let maxAccDescriptor: ColorDescriptor = new ColorDescriptor(Color.unknown, 0);
   for (const color of EXPECTED_COLORS) {
      let accuracy = 1 / getColorDistance(rgbl, color.vec);
      if (accuracy > maxAccDescriptor?.accuracy && accuracy >= color.min) {
         maxAccDescriptor = new ColorDescriptor(color.c, accuracy);
      }
   }
   return maxAccDescriptor!;
}

function getBlackMask(image: Image, averageBrightness: number): Image {
   for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i];
      const g = image.data[i + 1];
      const b = image.data[i + 2];

      const isGray = inRange(r, g, 23) && inRange(r, b, 23) && inRange(b, g, 23);
      const isDark = r + b + g < 0.05 * averageBrightness ** 1.8;

      const value = isGray && isDark ? 0 : 1;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
   }
   return image;
}
