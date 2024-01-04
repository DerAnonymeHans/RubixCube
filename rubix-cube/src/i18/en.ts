/** @format */

import { LanguageTree } from "./languageTree";

export const english: LanguageTree = {
   color: {
      blue: "Blue",
      red: "Red",
      green: "Green",
      yellow: "Yellow",
      white: "White",
      orange: "Orange",
      unspecified: "Unspecified",
   },
   algo: {
      beginners: "Beginners",
      advanced: "Advanced",
      twoPhase: "Expert",
   },
   scanner: {
      phases: {
         front: "Front",
         back: "Back",
         left: "Left",
         right: "Right",
         top: "Top",
         bottom: "Bottom",
      },
      buttons: {
         restart: "Restart",
         solve: "Save cube",
         colorsMatch: "Colors match and continue",
         scan: "Scan",
         goBack: "Go back",
      },
      messages: {
         checkColors: "Check if the scanned colors match",
         placingExplanation:
            "Place the cube in the purple bordered area and press Scan. You can edit the colors afterwards.",
         rotateInstruction: "Rotate the cube as shown in the animation and press Scan",
      },
   },
};
