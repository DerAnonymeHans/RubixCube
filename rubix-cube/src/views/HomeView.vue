<!-- @format -->

<script setup lang="ts">
// @ts-expect-error
import { useMq } from "vue3-mq";
import CubeVisualization from "@/components/CubeVisualization.vue";
import { ref, watch } from "vue";
import { RubixCube } from "@/scripts/cube/cube";
import Scanner from "@/components/Scanner.vue";
import { CubeFace } from "@/scripts/cube/cubeFace";
import { FacePosition, SavebleCube } from "@/scripts/cube/types";
import { STATE } from "@/scripts/state";
import Navigation from "@/components/Navigation.vue";

const mq = useMq();
const rubixCube = ref<RubixCube>(new RubixCube());
const view = ref<"landing" | "solve" | "scan">("landing");

function loadCube() {
   const saved = sessionStorage.getItem("cube");
   if (typeof saved !== "string") return false;

   let newRubixCube = new RubixCube();
   try {
      const savedFaces = JSON.parse(saved) as SavebleCube;
      newRubixCube.setFaces([
         new CubeFace(savedFaces.front, FacePosition.front),
         new CubeFace(savedFaces.back, FacePosition.back),
         new CubeFace(savedFaces.left, FacePosition.left),
         new CubeFace(savedFaces.right, FacePosition.right),
         new CubeFace(savedFaces.top, FacePosition.top),
         new CubeFace(savedFaces.bottom, FacePosition.bottom),
      ]);
   } catch {
      return;
   }

   rubixCube.value = newRubixCube;

   return true;
}
</script>

<template>
   <Transition name="slide-up">
      <Navigation v-if="view === 'landing'" />
   </Transition>
   <Transition name="slide-left">
      <div v-if="view === 'scan'" class="scanner" :class="mq.current">
         <Scanner @finished="() => (view = 'solve')" @saved-cube="loadCube" />
      </div>
      <div v-else class="home" :class="mq.current">
         <section class="welcome" :class="`${mq.current} ${view}`">
            <Transition name="slide-left">
               <div v-if="view === 'landing'" class="text">
                  <template v-if="mq.xs">
                     <h1 style="line-height: 1em">{{ $t("landing.header1") }}</h1>
                     <h1 style="text-align: right; margin-right: 20%">{{ $t("landing.header2") }}</h1>
                  </template>
                  <h1 v-else>{{ $t("landing.headingFull") }}</h1>

                  <h2>
                     {{ $t("landing.p1") }}
                  </h2>

                  <button v-on:click="() => (view = 'solve')">{{ $t("landing.action") }}</button>
               </div>
            </Transition>
            <div class="cube">
               <CubeVisualization
                  :type="view === 'landing' ? 'random' : 'normal'"
                  :rubix-cube="(rubixCube as RubixCube)"
                  :skip-shuffles="true"
                  :show-controls="view === 'solve'"
                  @scan-cube="() => (view = 'scan')"
               />
            </div>
         </section>
         <Transition name="slide-left-later">
            <section v-if="view === 'solve'" class="description" :class="mq.current">
               <button class="back-to-landing" v-on:click="() => (view = 'landing')">{{ $t("solver.buttons.goBack") }}</button>
               <div>
                  <h1>{{ $t("solver.explanation.heading") }}</h1>
                  <p>{{ $t("solver.explanation.p1") }}
                     <ol>
                        <li>{{ $t("solver.explanation.steps.s1") }}</li>
                        <li>{{ $t("solver.explanation.steps.s2") }}</li>
                        <li>{{ $t("solver.explanation.steps.s3") }}</li>
                        <li>{{ $t("solver.explanation.steps.s4") }}</li>
                        <li>{{ $t("solver.explanation.steps.s5") }}</li>
                        <li>{{ $t("solver.explanation.steps.s6") }}</li>
                     </ol>
                  </p>
               </div>
            </section>
         </Transition>
      </div>
   </Transition>
</template>

<style lang="scss" scoped>
$dark-bg: #1c4557;

.home {
   margin: auto;
   padding-top: 10vh;
   font-family: "Rubik", sans-serif;
   padding-bottom: 5vh;

   &.md,
   &.lg,
   &.xl,
   &.xxl {
      padding-top: 30vh;
   }
}

button {
   border: none;
   color: white;
   border-radius: 1em;
   padding: 0.8em;
   background-color: #8db0be;
   font-family: "Rubik", sans-serif;
   font-size: medium;
   cursor: pointer;

   &:hover {
      background-color: #81a2af;
      transition: 300ms;
   }
}

.home {
   position: relative;
   overflow: hidden;
   &.xxl,
   &.xl,
   &.lg,
   &.md {
      button {
         padding: 1em;

         &.control {
            padding: 0.5em;
         }
      }
   }
}

section {
   width: 90%;
   margin-left: 5%;
   box-sizing: border-box;
   color: white;
   font-family: "Rubik", sans-serif;

   &.xxl {
      margin-left: 15%;
      width: 70%;
   }
   &.xl {
      margin-left: 10%;
      width: 80%;
   }
}

h1 {
   font-family: "Bungee", sans-serif;
   font-size: 3em;
   line-height: 2em;
   margin: 0 0;
   text-decoration: underline #d007eb;
}

h2 {
   font-size: 1.3em;
}

p {
   font-size: 1.1em;
   text-align: left;
   line-height: 1.5em;
}

.welcome {
   display: flex;
   flex-direction: column-reverse;
   gap: 1em;
   align-items: center;

   .text {
      text-align: left;

      button {
         display: block;
         margin: auto;
      }
   }

   .cube {
      display: flex;
      justify-content: center;
      margin-bottom: 3em;
      transition: all 0.7s 0.1s ease-in-out;
      // width: 150%;
   }

   &.solve {
      .cube {
         transform: translateY(50%);
      }
   }

   &.xxl,
   &.xl,
   &.lg,
   &.md {
      flex-direction: row;

      h2 {
         font-size: 1.5em;
      }

      .text {
         width: 66%;
      }

      .cube {
         margin-bottom: 0.5em;
         width: 33%;
         margin-left: auto;
      }

      &.solve {
         .cube {
            transform: translateX(-100%);
         }
      }

      button {
         display: inline-block;
      }
   }

   &.xxl {
      gap: 2em;

      h1 {
         font-size: 4.5em;
      }
   }
   &.xl {
      h1 {
         font-size: 4em;
      }
   }

   &.md,
   &.lg {
      h1 {
         font-size: 3em;
      }
      h2 {
         font-size: 1.3em;
      }
   }
}

.description {
   margin-top: 80%;
   background-color: rgba($dark-bg, 0.8);
   border-radius: 1em;
   padding: 1.5em;

   // hr {
   //    border: 2px solid $dark-bg;
   // }

   &.sm {
      margin-top: 50%;
   }

   &.md,
   &.lg {
      margin-top: 18%;
      padding: 2em;
   }

   &.xl,
   &.xxl {
      margin-top: 10%;
      padding: 2.5em;
   }
}
</style>
