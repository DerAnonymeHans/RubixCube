/** @format */

import * as THREE from "three";
import { FacePosition, RubixCube } from "./cube";
import { RotationCommand, planeToAxis, PlaneIdentifier, Plane } from "./commands";
import { facePositionToIdentifier, roundAbout } from "./helper";
import { OFFSET, SCALE, SPEED } from "../settings";
import { TileColor, getColor } from "./colors";

export class VisualRubixCube {
   public tiles: VisualRubixCubeTile[][][];
   public isRotating = false;
   /**
    * [
    *      [
    *          [m, m, m],
    *          [m, m, m],
    *          [m, m, m],
    *      ],
    *      [
    *          [m, m, m],
    *          [m, m, m],
    *          [m, m, m],
    *      ],
    *      [
    *          [m, m, m],
    *          [m, m, m],
    *          [m, m, m],
    *      ],
    * ]
    */

   public get meshes(): VisualRubixCubeTile[] {
      const meshes = [];
      for (let z = 0; z < 3; z++) {
         for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
               meshes.push(this.tiles[z][y][x]);
            }
         }
      }
      return meshes;
   }

   constructor(cube: RubixCube) {
      this.tiles = VisualRubixCube.generateCubeTiles(cube);
   }

   public getFaceMatrix(position: FacePosition): TileColor[][] {
      const meshes = this.getMeshesInPlane(facePositionToIdentifier(position));

      meshes[8].getColor(FacePosition.front);
      return [];
   }

   public rotate(command: RotationCommand, scene: THREE.Scene, onFinished: () => void): boolean {
      if (this.isRotating) return false;
      const rotationGroup = this.getRotationGroup(command);
      scene.remove(...rotationGroup.children);
      scene.add(rotationGroup);

      let axis = planeToAxis(command.plane);

      this.isRotating = true;

      const cleanUp = () => {
         scene.remove(rotationGroup);
         for (const children of rotationGroup.children) {
            let position = new THREE.Vector3();
            children.getWorldPosition(position);
            children.position.copy(position);

            let rotation = new THREE.Quaternion();
            children.getWorldQuaternion(rotation);
            children.rotation.setFromQuaternion(rotation);
         }

         scene.add(...rotationGroup.children);
         this.isRotating = false;
      };

      const ROTATION_SPEED = 0.01 * SPEED;
      const animateRotation = () => {
         let rotationFinished = Math.abs(rotationGroup.rotation[axis]) >= Math.PI / 2;
         if (rotationFinished) {
            cleanUp();
            onFinished();
            return;
         }

         requestAnimationFrame(animateRotation);
         rotationGroup.rotation[axis] += ROTATION_SPEED * command.direction * (command.idx === 0 ? -1 : 1);

         let isLastRotation = roundAbout(Math.abs(rotationGroup.rotation[axis]), Math.PI / 2, ROTATION_SPEED);
         if (isLastRotation) {
            rotationGroup.rotation[axis] = (Math.PI / 2) * Math.sign(rotationGroup.rotation[axis]);
         }

         return;
      };
      animateRotation();

      return true;
   }

   private getRotationGroup(command: RotationCommand) {
      const group = new THREE.Group();
      group.add(...this.getMeshesInPlane(new PlaneIdentifier(command.plane, command.idx)));

      return group;
   }

   private getMeshesInPlane(planeId: PlaneIdentifier): VisualRubixCubeTile[] {
      if (planeId.idx < 0 || planeId.idx > 2) throw new Error("Idx not betweeb 0 and 2");

      const axis = planeToAxis(planeId.plane);
      const meshes: VisualRubixCubeTile[] = [];
      for (const mesh of this.meshes) {
         let position = new THREE.Vector3();
         mesh.getWorldPosition(position);
         if (roundAbout(position[axis], (planeId.idx + OFFSET[axis]) * SCALE, SCALE * 0.1)) {
            meshes.push(mesh);
         }
      }

      return meshes;
   }

   private static generateCubeTiles(cube: RubixCube): VisualRubixCubeTile[][][] {
      const meshes = [];
      for (let z = 0; z < 3; z++) {
         const zPlane: VisualRubixCubeTile[][] = [];
         meshes.push(zPlane);
         for (let y = 0; y < 3; y++) {
            const yPlane: VisualRubixCubeTile[] = [];
            zPlane.push(yPlane);
            for (let x = 0; x < 3; x++) {
               const mesh = this.generateCubeTile();
               mesh.position.set((x + OFFSET.x) * SCALE, (y + OFFSET.y) * SCALE, (z + OFFSET.z) * SCALE);
               yPlane.push(mesh);

               if (x === 0) {
                  mesh.setColor(FacePosition.left, cube.left.getCell(2 - y, z));
               } else if (x === 2) {
                  mesh.setColor(FacePosition.right, cube.right.getCell(2 - y, 2 - z));
               }

               if (y === 0) {
                  mesh.setColor(FacePosition.bottom, cube.bottom.getCell(2 - z, x));
               } else if (y === 2) {
                  mesh.setColor(FacePosition.top, cube.top.getCell(z, x));
               }

               if (z === 0) {
                  mesh.setColor(FacePosition.back, cube.back.getCell(2 - y, 2 - x));
               } else if (z === 2) {
                  mesh.setColor(FacePosition.front, cube.front.getCell(2 - y, x));
               }
            }
         }
      }

      return meshes;
   }

   private static generateCubeTile(): VisualRubixCubeTile {
      const geometry = new THREE.BoxGeometry(SCALE, SCALE, SCALE);

      // const positionAttribute = geometry.getAttribute("position");
      // const colors: number[] = [];
      // for (let i = 0; i < positionAttribute.count; i += 4) {
      //     const color = getColor(i / 4);
      //     for (let j = 0; j < 4; j++) {
      //         colors.push(...color);
      //     }
      // }

      // define the new attribute
      // geometry.setAttribute(
      //     "color",
      //     new THREE.Float32BufferAttribute(colors, 3)
      // );

      return new VisualRubixCubeTile(geometry);

      // wireframe
   }
}

export class VisualRubixCubeTile extends THREE.Mesh {
   constructor(geometry: THREE.BoxGeometry) {
      // const geometry = new THREE.BoxGeometry(SCALE, SCALE, SCALE);
      const material = new THREE.MeshBasicMaterial({ vertexColors: true });
      super(geometry, material);

      let wireframeGeometry = new THREE.EdgesGeometry(geometry);
      let wireframeMaterial = new THREE.LineBasicMaterial({
         color: 0x000000,
         side: THREE.DoubleSide,
         linewidth: 100,
      });

      let wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

      this.add(wireframe);
   }

   private static colorMarkers = [
      FacePosition.right,
      FacePosition.left,
      FacePosition.top,
      FacePosition.bottom,
      FacePosition.front,
      FacePosition.back,
   ];
   private static colorLengthOfFace = 12;

   setColor(position: FacePosition, color: TileColor) {
      // array has a length of 72: 3 (RGB) * 4 (Vertices per Side) * 6 (sides)
      let colorAttribute = this.geometry.getAttribute("color");
      if (colorAttribute === undefined) {
         this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Array(72), 3));
         colorAttribute = this.geometry.getAttribute("color");
      }

      let idx = VisualRubixCubeTile.colorMarkers.findIndex((p) => p === position) * VisualRubixCubeTile.colorLengthOfFace;

      const colorValue = getColor(color);
      for (let i = 0; i < 4; i++) {
         for (let j = 0; j < colorValue.length; j++) {
            if (Number.isNaN(colorValue[j])) debugger;
            colorAttribute.array[idx + 3 * i + j] = colorValue[j];
         }
      }
   }

   getColor(position: FacePosition) {
      const positionAttribute = this.geometry.getAttribute("position");
      let vector: THREE.Vector3;
      if (position === FacePosition.front) vector = new THREE.Vector3(0, 0, 1);
      else if (position === FacePosition.back) vector = new THREE.Vector3(0, 0, -1);
      else if (position === FacePosition.top) vector = new THREE.Vector3(0, 1, 0);
      else if (position === FacePosition.bottom) vector = new THREE.Vector3(0, -1, 0);
      else if (position === FacePosition.left) vector = new THREE.Vector3(-1, 0, 0);
      else vector = new THREE.Vector3(1, 0, 0);

      console.log(positionAttribute);

      let idxOfVertice = 0;
      for (let i = 0; i < positionAttribute.array.length; i += 3) {
         const x = positionAttribute.array[i];
         const y = positionAttribute.array[i + 1];
         const z = positionAttribute.array[i + 2];
      }
   }
}
