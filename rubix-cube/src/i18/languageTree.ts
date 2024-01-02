/** @format */

import { TileColor } from "@/scripts/cube/colors";

export interface LanguageTree {
   color: {
      blue: string;
      red: string;
      green: string;
      yellow: string;
      white: string;
      orange: string;
      unspecified: string;
   };
   algo: {
      beginners: string;
      advanced: string;
      twoPhase: string;
   };
}
