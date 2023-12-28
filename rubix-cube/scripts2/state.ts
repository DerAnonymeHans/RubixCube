import * as THREE from "three";
import { RubixCubeCamera } from "./cube/camera";
import { CubeManager } from "./cube/cubeManager";

export const STATE = {
    cubeManager: CubeManager.create("solved"),

    rendering: {
        scene: new THREE.Scene(),
        camera: new RubixCubeCamera(),
        renderer: new THREE.WebGLRenderer(),
    },
};
