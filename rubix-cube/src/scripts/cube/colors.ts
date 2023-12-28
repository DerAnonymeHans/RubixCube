/** @format */

import * as THREE from "three";

export enum TileColor {
   red,
   blue,
   yellow,
   green,
   orange,
   white,

   unspecified,
}

export const tileColors = [
   TileColor.red,
   TileColor.blue,
   TileColor.yellow,
   TileColor.green,
   TileColor.orange,
   TileColor.white,
];

function getThreeColor(tileColor: TileColor): THREE.Color {
   const color = new THREE.Color();
   if (tileColor === TileColor.red) color.setHex(0xb80000);
   else if (tileColor === TileColor.blue) color.setHex(0x193bff);
   else if (tileColor === TileColor.green) color.setHex(0x00a85b);
   else if (tileColor === TileColor.orange) color.setHex(0xfe6a00);
   else if (tileColor === TileColor.white) color.setHex(0xffffff);
   else if (tileColor === TileColor.yellow) color.setHex(0xfee734);
   else color.setHex(0x888888);
   return color;
}

export function getColor(tileColor: TileColor): number[] {
   const color = getThreeColor(tileColor);

   return [color.r, color.g, color.b];
}

export function getColorString(tileColor: TileColor): string {
   return `#${getThreeColor(tileColor).getHexString()}`;
}
