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
   solver: {
      buttons: {
         solve: "Solve",
         scan: "Scan your cube",
         goBack: "Go back",
      },
      algorithm: "Algorithm",
      explanation: {
         heading: "Step-by-step",
         p1: "Here is a short step by step guide, most of it is self explanatory:",
         steps: {
            s1: `Press the button "Scan your cube"`,
            s2: "Allow the website to access your camera",
            s3: "Follow the instructions while scanning",
            s4: "Choose an algorithm to solve the cube",
            s5: "Press Solve",
            s6: "With the buttons « and » or the arrow keys you can now display the solution step by step",
         },
      },
   },
   landing: {
      header1: "RUBIX",
      header2: "CUBES",
      headingFull: "RUBIXCUBES",
      p1: "This website allows you to scan your cube and solve it step by step with differnt algorithms.",
      action: "Solve your cube",
   },

   nav: {
      solve: "Solve",
      play: "Play",
      learn: "Learn",
   },

   playground: {
      mode: {
         rotate: "Rotate",
         move: "Move",
         mode: "Mode",
      },
   },
};
