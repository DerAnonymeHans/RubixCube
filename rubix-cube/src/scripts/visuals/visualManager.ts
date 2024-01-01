/** @format */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { RubixCube } from "../cube/cube";
import { VisualRubixCube } from "./visualCube";
import { CameraOptions, RubixCubeCamera } from "./camera";
import { MAX_SPEED, SCALE, SPEED } from "../settings";
import { facePositionToIdentifier, invertRotation } from "../cube/helper";
import { VisualizationOptions } from "./visualizationOptions";
import { Plane, PlaneIdentifier, RotationCommand } from "../cube/commands";
import { sleep } from "../helper";
import { FacePosition } from "../cube/types";

export class VisualManager {
   private rubixCube: RubixCube;
   private visualCube: VisualRubixCube;
   private stepIdx: number = 0;
   private renderer: THREE.WebGLRenderer;
   private scene: THREE.Scene;
   private camera: RubixCubeCamera;
   public options: VisualizationOptions;
   private speed: number;
   private canvasEl: HTMLCanvasElement | null = null;
   private controls: OrbitControls;
   private onStepChanged: (() => void) | null = null;

   public isRendering = false;

   public get _stepIdx(): number {
      return this.stepIdx;
   }
   public get StepWithoutShufflesIdx(): number {
      return this.stepIdx - this.rubixCube.shuffles.length;
   }

   private set _stepIdx(stepIdx: number) {
      this.stepIdx = stepIdx;
      if (this.onStepChanged !== null) this.onStepChanged();
   }

   private get spedUpSpeed(): number {
      return Math.min(Math.max(15, 2 * this.speed), MAX_SPEED);
   }

   constructor(
      cube: RubixCube,
      options: VisualizationOptions,
      onStepChanged: (() => void) | null = null
   ) {
      this.rubixCube = cube;
      this.visualCube = new VisualRubixCube(this.rubixCube);
      this.renderer = null!;
      this.scene = null!;
      this.camera = null!;
      this.speed = options.speed ?? SPEED;
      this.controls = null!;
      this.options = options;
      this.onStepChanged = onStepChanged;
   }

   public startRendering(canvasEl: HTMLCanvasElement) {
      this.canvasEl = canvasEl;
      this.renderer = new THREE.WebGLRenderer({
         antialias: true,
         canvas: canvasEl,
      });
      this.renderer.setClearColor(0xffffff, 0);
      this.scene = new THREE.Scene();
      this.camera = new RubixCubeCamera(this.options.cameraOptions ?? ({} as CameraOptions));

      const bBox = canvasEl.getBoundingClientRect();
      this.renderer.setSize(bBox.width, bBox.height);

      if (this.options.enableCameraMovement) {
         this.controls = new OrbitControls(this.camera, this.canvasEl);
         this.controls.enableZoom = false;
         this.controls.enablePan = false;
         this.setupCameraMovement();
      }
      if (this.options.enableRotationShortcuts) {
         this.setupRotationShortcuts();
      }

      this.updateCube();
      this.setStyle("cinematic");
      this.handleResize();

      this.isRendering = true;
   }

   public render() {
      this.renderer.render(this.scene, this.camera);
   }

   public updateCube() {
      const cube = new RubixCube();
      cube.setFaces(this.rubixCube.startFaces);
      this.removeFromScene();
      this.visualCube = new VisualRubixCube(cube);
      this.addToScene();
   }

   public handleResize() {
      if (this.canvasEl === null) throw new Error("Canvas el is null.");
      const bBox = this.canvasEl.getBoundingClientRect();
      this.camera.aspect = bBox.width / bBox.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(bBox.width, bBox.height);
   }

   public reset() {
      this.rubixCube.resetToStartingFaces();
      this._stepIdx = 0;
      this.updateCube();
   }

   private addToScene() {
      this.removeFromScene();
      this.scene.add(...this.visualCube.meshes);
   }
   private removeFromScene() {
      this.scene.remove(...this.visualCube.meshes);
   }

   public skipShuffles(skip = true) {
      if (skip && this.stepIdx < this.rubixCube.shuffles.length) {
         this._stepIdx = this.rubixCube.shuffles.length;
      }
   }

   public async gotoStep(idx: number, speed: number | null = null): Promise<boolean> {
      const idxDelta = idx - this.stepIdx;
      const stepFunc = idxDelta > 0 ? this.next : this.previous;
      let i = 0;
      while (true) {
         if (i === Math.abs(idxDelta)) {
            if (!this.visualCube.isRotating) break;
            await sleep(400);
            continue;
         }
         if (stepFunc.apply(this, [speed])) {
            i++;
            continue;
         }
         await sleep(400);
      }
      return true;
   }

   public async jumptoStep(idx: number): Promise<boolean> {
      return await this.gotoStep(idx, this.spedUpSpeed);
   }

   public next(speed: number | null = null): boolean {
      if (this.stepIdx >= this.rubixCube.allRotations.length) return false;

      if (this.visualCube.isRotating) return false;

      const rotation = this.rubixCube.allRotations[this.stepIdx];

      if (rotation.msg) console.log(rotation.msg);

      const succesfull = this.visualCube.rotate(rotation, this.scene, speed ?? this.speed);
      if (succesfull) {
         this._stepIdx++;
      }
      return true;
   }

   public previous(speed: number | null = null): boolean {
      if (this.stepIdx <= 0) return false;

      if (this.visualCube.isRotating) return false;

      const rotation = this.rubixCube.allRotations[this.stepIdx - 1];
      const succesfull = this.visualCube.rotate(
         invertRotation(rotation),
         this.scene,
         speed ?? this.speed
      );
      if (succesfull) {
         this._stepIdx--;
      }
      return true;
   }

   public async orientCube(rotations: RotationCommand[], speed: number | null = null) {
      let i = 0;
      while (i < rotations.length) {
         if (this.visualCube.isRotating) {
            await sleep(10);
            continue;
         }
         this.visualCube.rotate(rotations[i], this.scene, speed ?? this.speed);
         i++;
      }
   }

   public lookAtFace(facePosition: FacePosition, speed: number | null = null) {
      this.camera.viewFace(facePositionToIdentifier(facePosition), speed);
   }

   private setupCameraMovement() {
      window.addEventListener("keypress", (e) => {
         if (e.key === "t") this.camera.viewFace(new PlaneIdentifier(Plane.yPlane, 2));
         else if (e.key === "b") this.camera.viewFace(new PlaneIdentifier(Plane.yPlane, 0));
         else if (e.key === "l") this.camera.viewFace(new PlaneIdentifier(Plane.xPlane, 0));
         else if (e.key === "r") this.camera.viewFace(new PlaneIdentifier(Plane.xPlane, 2));
         else if (e.key === "f") this.camera.viewFace(new PlaneIdentifier(Plane.zPlane, 2));
         else if (e.key === "k") this.camera.viewFace(new PlaneIdentifier(Plane.zPlane, 0));
         else if (e.key === "d") this.camera.moveCamera(Math.PI * 0.25, 0);
         else if (e.key === "a") this.camera.moveCamera(-Math.PI * 0.25, 0);
         else if (e.key === "w") this.camera.moveCamera(0, -Math.PI * 0.1);
         else if (e.key === "s") this.camera.moveCamera(0, Math.PI * 0.1);

         this.controls.update();
      });
   }

   private setupRotationShortcuts() {
      window.addEventListener("keypress", (e) => {
         if (e.code === "Space") {
            this.next();
         }
      });
      window.addEventListener("keydown", (e) => {
         if (e.key === "ArrowRight") {
            this.next();
         }
         if (e.key === "ArrowLeft") {
            this.previous();
         }
         if (e.key === "ArrowUp") {
            setInterval(() => {
               this.next();
            }, 1400);
         }
      });
   }

   private setStyle(style: "cinematic") {
      if (style === "cinematic") {
         // const light1 = new THREE.PointLight(0xffaaff, 10);
         // light1.position.set(5 * SCALE, 0, 0);

         // const light2 = new THREE.PointLight(0xffaaff, 5);
         // light2.position.set(0, 5 * SCALE, 0);
         const light1 = new THREE.DirectionalLight(0xffeeff, 3);
         light1.position.set(-1, -1, 1).normalize();

         const light2 = new THREE.DirectionalLight(0xeeaaff, 8);
         light2.position.set(-1, 1, -1).normalize();

         const light3 = new THREE.DirectionalLight(0xeeaaff, 6);
         light3.position.set(1, -1, -1).normalize();

         const ambientLight = new THREE.AmbientLight(0xffaaff, 1.5);

         this.scene.add(light1, light2, light3, ambientLight);

         this.speed = 7;
      }
   }
}
