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
   scanner: {
      phases: {
         front: string;
         back: string;
         left: string;
         right: string;
         top: string;
         bottom: string;
      };
      buttons: {
         restart: string;
         solve: string;
         colorsMatch: string;
         scan: string;
         goBack: string;
      };
      messages: {
         checkColors: string;
         placingExplanation: string;
         rotateInstruction: string;
      };
   };
}
