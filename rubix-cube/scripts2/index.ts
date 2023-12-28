import { RotationCommand, Plane, RotationDirection } from "./cube/commands";
import * as THREE from "three";
import { RubixCubeCamera } from "./cube/camera";
import { animate, setupScene } from "./cube/rendering";
import { CubeManager } from "./cube/cubeManager";
import { STATE } from "./state";

window.addEventListener("DOMContentLoaded", () => {
    setupScene();
    const shuffleRotations: RotationCommand[] = [
        new RotationCommand(Plane.xPlane, 1, RotationDirection.left),
        new RotationCommand(Plane.zPlane, 2, RotationDirection.left),
        new RotationCommand(Plane.xPlane, 2, RotationDirection.left),
        new RotationCommand(Plane.yPlane, 1, RotationDirection.right),
        new RotationCommand(Plane.zPlane, 1, RotationDirection.right),
        new RotationCommand(Plane.xPlane, 0, RotationDirection.right),
        new RotationCommand(Plane.zPlane, 2, RotationDirection.left),
        new RotationCommand(Plane.xPlane, 0, RotationDirection.left),
        new RotationCommand(Plane.xPlane, 0, RotationDirection.left),
        new RotationCommand(Plane.zPlane, 0, RotationDirection.left),
    ];

    if (shuffleRotations.length === 0) {
        STATE.cubeManager = CubeManager.create("shuffled");
    } else {
        STATE.cubeManager.setShuffle(shuffleRotations);
    }
    console.log("Shuffles:");
    console.log(shuffleRotations.map((r) => r.toString()).join(",\n"));

    STATE.cubeManager.findSolution("beginners");

    STATE.cubeManager.addToScene();
    animate();
});

window.addEventListener("keypress", (e) => {
    if (e.code !== "Space" || STATE.cubeManager.visualCube.isRotating) return;

    STATE.cubeManager.next();
});

document.getElementById("goBackButton")!.onclick = () => {
    STATE.cubeManager.previous();
};

document.getElementById("goForwardsButton")!.onclick = () => {
    STATE.cubeManager.next();
};
