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
   solver: {
      buttons: {
         solve: string;
         scan: string;
         goBack: string;
      };
      algorithm: string;

      explanation: {
         heading: string;
         p1: string;
         steps: {
            s1: string;
            s2: string;
            s3: string;
            s4: string;
            s5: string;
            s6: string;
         };
      };
   };
   landing: {
      header1: string;
      header2: string;
      headingFull: string;
      p1: string;
      action: string;
   };
   nav: {
      solve: string;
      play: string;
      learn: string;
   };
}
