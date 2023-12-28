/** @format */

import { Image } from "image-js";
import * as THREE from "three";
import { TileColor } from "../cube/colors";
import { Color } from "./types";

export function averageLum(image: Image): number {
   // image = image.hsl();
   let sum = 0;
   for (let i = 0; i < image.data.length; i += 4 * 5) {
      sum += image.data[i] + image.data[i + 1] + image.data[i + 2];
   }
   return (5 * sum) / image.data.length;
}

export function inRange(a: number, b: number, delta: number): boolean {
   return Math.abs(a - b) < delta;
}

export function toVec3(vec4: THREE.Vector4): THREE.Vector3 {
   return new THREE.Vector3(vec4.x, vec4.y, vec4.z);
}

export function withLum(rgb: THREE.Vector3): THREE.Vector4 {
   const lum = getLuminance(rgb);
   return new THREE.Vector4(rgb.x, rgb.y, rgb.z, lum);
}

export function getLuminance(rgb: THREE.Vector3): number {
   let max = Math.max(rgb.x, rgb.y, rgb.z);
   let min = Math.min(rgb.x, rgb.y, rgb.z);
   return (max + min) / 2;
}

export function colorToTileColor(color: Color): TileColor {
   return color as any as TileColor;
}

export function getColorDistance(
   rgbL: THREE.Vector4,
   expectedRgbL: THREE.Vector4,
   avgLuminance: number
) {
   const rgb = toVec3(rgbL);
   const luminance = rgbL.w;

   const expectedRgb = toVec3(expectedRgbL);
   const expectedLuminance = expectedRgbL.w * (avgLuminance / 60);

   return rgb.distanceTo(expectedRgb) + Math.abs(luminance - expectedLuminance) * 0.5;
}
