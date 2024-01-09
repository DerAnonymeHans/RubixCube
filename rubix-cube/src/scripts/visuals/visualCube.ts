/** @format */

import * as THREE from "three";
import { RubixCube } from "../cube/cube";
import { RotationCommand, planeToAxis, PlaneIdentifier, Plane } from "../cube/commands";
import { facePositionToIdentifier, roundAbout } from "../cube/helper";
import { OFFSET, SCALE, SPEED } from "../settings";
import { TileColor, getColor } from "../cube/colors";
import { RoundedBoxGeometry } from "./roundedBoxGeometry";
import { FacePosition } from "../cube/types";

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

   public rotate(command: RotationCommand, scene: THREE.Scene, speed: number, i = 1): boolean {
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

            children.updateMatrix();
         }

         scene.add(...rotationGroup.children);
         this.isRotating = false;

         if (i < command.count) this.rotate(command, scene, speed, i + 1);
      };

      const ROTATION_SPEED = 0.01 * speed;
      const animateRotation = () => {
         let rotationFinished = Math.abs(rotationGroup.rotation[axis]) >= Math.PI / 2;
         if (rotationFinished) {
            cleanUp();
            return;
         }

         requestAnimationFrame(animateRotation);
         rotationGroup.rotation[axis] +=
            ROTATION_SPEED * command.direction * (command.idx === 0 ? -1 : 1);

         let isLastRotation = roundAbout(
            Math.abs(rotationGroup.rotation[axis]),
            Math.PI / 2,
            ROTATION_SPEED
         );
         if (isLastRotation) {
            rotationGroup.rotation[axis] = (Math.PI / 2) * Math.sign(rotationGroup.rotation[axis]);
         }

         return;
      };
      animateRotation();

      return true;
   }

   private getRotationGroup(command: RotationCommand) {
      const affectedMeshes = this.getMeshesInPlane(new PlaneIdentifier(command.plane, command.idx));

      var group = new THREE.Group();
      group.add(...affectedMeshes);

      return group;
   }

   private getMeshesInPlane(planeId: PlaneIdentifier): VisualRubixCubeTile[] {
      if (planeId.idx < 0 || planeId.idx > 3) throw new Error("Idx not between 0 and 2");

      if (planeId.idx === 3) return this.meshes;

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
               mesh.position.set(
                  (x + OFFSET.x) * SCALE,
                  (y + OFFSET.y) * SCALE,
                  (z + OFFSET.z) * SCALE
               );
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
      // const geometry = new THREE.BoxGeometry(SCALE, SCALE, SCALE);
      const geometry = new RoundedBoxGeometry(SCALE, SCALE, SCALE, 2, 0.03);

      return new VisualRubixCubeTile(geometry);
   }
}

export class VisualRubixCubeTile extends THREE.Mesh {
   constructor(geometry: RoundedBoxGeometry) {
      const material = new THREE.MeshPhongMaterial({
         vertexColors: true,
         shininess: 50,
      });
      super(geometry, material);
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
      // ---BOX-Geometry---: array has a length of 72: 3 (RGB) * 4 (Vertices per Side) * 6 (sides)

      // array has a length of 2700 (if 2 is set for the number of segments for the RoundedBoxGeometry): 3 (RGB) * 150 (Vertices per side) * 6 (sides)
      let colorAttribute = this.geometry.getAttribute("color");
      const VERTICES_PER_FACE = 150;

      if (colorAttribute === undefined) {
         this.geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(new Array(3 * VERTICES_PER_FACE * 6), 3)
         );
         colorAttribute = this.geometry.getAttribute("color");
      }

      let idx =
         VisualRubixCubeTile.colorMarkers.findIndex((p) => p === position) * VERTICES_PER_FACE * 3;

      const colorValue = getColor(color);

      for (let i = 0; i < VERTICES_PER_FACE; i++) {
         for (let j = 0; j < colorValue.length; j++) {
            colorAttribute.array[idx + 3 * i + j] = colorValue[j];
         }
      }
   }
}
