/** @format */

import * as THREE from "three";
import { TileColor } from "../cube/colors";

export class ImagePoint {
   x: number;
   y: number;
   color: TileColor | null;

   constructor(x: number, y: number, color: TileColor) {
      this.x = x;
      this.y = y;
      this.color = color;
   }
}

export enum Color {
   red,
   blue,
   yellow,
   green,
   orange,
   white,
   black,
   unknown,
}

export class ColorCounter {
   colors: { color: Color; count: number }[] = [
      { color: Color.red, count: 0 },
      { color: Color.green, count: 0 },
      { color: Color.yellow, count: 0 },
      { color: Color.blue, count: 0 },
      { color: Color.orange, count: 0 },
      { color: Color.white, count: 0 },
   ];

   public add(color: Color | TileColor) {
      if (color === Color.unknown || color === Color.black) return;
      this.colors.find((x) => x.color === color)!.count += 1;
   }

   public dominantColor(): Color {
      return this.colors.sort((a, b) => b.count - a.count)[0].color;
   }
}

export class ColorDescriptor {
   color: Color;
   accuracy: number;
   constructor(color: Color, accuracy: number) {
      this.color = color;
      this.accuracy = accuracy;
   }
}

const RED = new THREE.Vector4(180, 50, 50, 30).normalize();
const GREEN = new THREE.Vector4(90, 160, 100, 50).normalize();
const YELLOW = new THREE.Vector4(240, 220, 100, 60).normalize();
const BLUE = new THREE.Vector4(100, 110, 200, 40).normalize();
const ORANGE = new THREE.Vector4(200, 110, 0, 40).normalize();
const WHITE = new THREE.Vector4(255, 255, 255, 100).normalize();
const BLACK = new THREE.Vector4(255, 255, 255, 0).normalize();

export const EXPECTED_COLORS: { c: Color; vec: THREE.Vector4; min: number }[] = [
   { c: Color.red, vec: RED, min: 1.8 },
   { c: Color.green, vec: GREEN, min: 2 },
   { c: Color.yellow, vec: YELLOW, min: 2 },
   { c: Color.blue, vec: BLUE, min: 1.3 },
   { c: Color.orange, vec: ORANGE, min: 1.7 },
   { c: Color.white, vec: WHITE, min: 2 },
   { c: Color.black, vec: BLACK, min: 1 },
];
