/** @format */

import { RotationCommand } from "./commands";
import { CubeFace, RubixCube } from "./cube";
import { invertRotation } from "./helper";
import { solveRubixCube as solveRubixCubeBeginner } from "../solver/beginners/0_solver";
import { STATE } from "../state";
import { VisualRubixCube } from "./visualCube";
import { solveRubixCube as solveRubixCubeAdvanced } from "../solver/advanced/0_solver";

export class CubeManager {
   public rubixCube: RubixCube;
   public visualCube: VisualRubixCube;
   private shuffleRotations: RotationCommand[] | null = null;

   private rotationIdx = 0;
   public rotationIdxOffset = 0;

   constructor(rubixCube: RubixCube, visualCube: VisualRubixCube) {
      this.rubixCube = rubixCube;
      this.visualCube = visualCube;
      this.shuffleRotations = rubixCube.rotations;
   }

   public static create(method: "solved" | "shuffled"): CubeManager {
      const rubixCube = new RubixCube();

      if (method === "shuffled") {
         rubixCube.shuffle(10);
      }

      return new CubeManager(rubixCube, new VisualRubixCube(rubixCube));
   }

   public setFaces(faces: CubeFace[]) {
      this.rubixCube.setFaces(faces);
      this.shuffleRotations = [];
      this.removeFromScene();
      this.visualCube = new VisualRubixCube(this.rubixCube);
   }

   public addToScene() {
      this.removeFromScene();
      STATE.rendering.scene.add(...this.visualCube.meshes);
   }
   public removeFromScene() {
      STATE.rendering.scene.remove(...this.visualCube.meshes);
   }

   public setShuffle(shuffles: RotationCommand[], showShuffle: boolean = false) {
      this.rubixCube = new RubixCube();
      this.rubixCube.rotateMultipleTimes(shuffles, showShuffle);
      this.shuffleRotations = shuffles;

      this.removeFromScene();
      this.visualCube = new VisualRubixCube(this.rubixCube);
   }

   public findSolution(method: "beginners" | "advanced") {
      if (method === "beginners") {
         solveRubixCubeBeginner(this.rubixCube);
      } else if (method === "advanced") {
         solveRubixCubeAdvanced(this.rubixCube);
      }
      console.log("---Solution---", this.rubixCube.rotations.length);
      console.log(this.rubixCube.rotations);
      console.log("-----");
   }

   public next() {
      if (this.rotationIdxOffset + this.rotationIdx >= this.rubixCube.rotations.length) {
         return;
      }

      const rotation = this.rubixCube.rotations[this.rotationIdxOffset + this.rotationIdx];

      const succesfull = this.visualCube.rotate(rotation, STATE.rendering.scene, () => {});
      if (succesfull) {
         this.rotationIdx++;
      }
   }

   public previous() {
      if (this.rotationIdxOffset + this.rotationIdx <= 0) {
         return;
      }

      const rotation = this.rubixCube.rotations[this.rotationIdxOffset + this.rotationIdx - 1];
      const succesfull = this.visualCube.rotate(invertRotation(rotation), STATE.rendering.scene, () => {});
      if (succesfull) {
         this.rotationIdx--;
      }
   }
}
