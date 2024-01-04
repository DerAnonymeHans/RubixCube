/** @format */

import { TileColor } from "@/scripts/cube/colors";
import { LanguageTree } from "./languageTree";

export const german: LanguageTree = {
   color: {
      blue: "Blau",
      red: "Rot",
      green: "Grün",
      yellow: "Gelb",
      white: "Weiß",
      orange: "Orange",
      unspecified: "Unbestimmt",
   },
   algo: {
      beginners: "Anfänger",
      advanced: "Fortgeschritten",
      twoPhase: "Experte",
   },
   scanner: {
      phases: {
         front: "Vorne",
         back: "Hinten",
         left: "Links",
         right: "Rechts",
         top: "Oben",
         bottom: "Unten",
      },
      buttons: {
         restart: "Neu starten",
         solve: "Würfel speichern",
         colorsMatch: "Farben stimmen und weiter",
         scan: "Scannen",
         goBack: "Zurück",
      },
      messages: {
         checkColors: "Überprüfe ob die gescannten Farben stimmen",
         placingExplanation:
            "Positioniere den Würfel im lila umrahmten Bereich und drücke dann auf Scannen. Du kannst die Farben anschließend noch bearbeiten.",
         rotateInstruction: "Drehe den Würfel wie in der Animation und drücke dann auf Scannen",
      },
   },
};
