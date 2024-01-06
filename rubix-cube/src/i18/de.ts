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
   solver: {
      buttons: {
         solve: "Lösen",
         scan: "Deinen Würfel scannen",
         goBack: "Zurück",
      },
      algorithm: "Algorithmus",
      explanation: {
         heading: "Was muss ich tun?",
         p1: "Hier eine kurze Schritt für Schritt Anleitung, das meiste erklärt sich von selbst:",
         steps: {
            s1: `Drücke auf den Knopf "Deinen Würfel scannen"`,
            s2: "Lass die Webseite auf deine Kamera zugreifen",
            s3: "Folge den Anweisungen während des Scannens",
            s4: "Wähle einen Algorithmus zum lösen des Würfels aus",
            s5: "Drücke auf Lösen",
            s6: "Mit den Knöpfen « und » oder den Pfeiltasten kannst du dir nun Schritt für Schritt die Lösung anzeigen lassen",
         },
      },
   },
   landing: {
      header1: "ZAUBER",
      header2: "WÜRFEL",
      headingFull: "ZAUBERWÜRFEL",
      p1: "Mit Hilfe dieser Webseite kannst du deinen Zauberwürfel einscannen und auf verschiedene Arten lösen lassen.",
      action: "Würfel lösen lassen",
   },
   nav: {
      solve: "Lösen",
      play: "Spielen",
      learn: "Lernen",
   },
};
