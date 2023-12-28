/** @format */

// import { RotationCommand, Plane, RotationDirection } from "./cube/commands";
// import * as THREE from "three";
// import { RubixCubeCamera } from "./visuals/camera";
// import { STATE } from "./state";
// import { idxWhenToStartVisualRotation } from "./cube/helper";
// import { FacePosition, RubixCube } from "./cube/cube";
// import { TileColor } from "./cube/colors";
// import { LocalRelation } from "./solver/types";
// import { VisualManager } from "./visuals/visualManager";

// const rubixCube = new RubixCube();
// const visualManager = new VisualManager(rubixCube, {
//    enableCameraMovement: true,
//    enableEditing: true,
//    enableRotationShortcuts: true,
// });

// window.addEventListener("DOMContentLoaded", () => {
//    const canvas = document.querySelector("canvas")!;
//    let shuffleRotations: RotationCommand[] = [
//       new RotationCommand(Plane.yPlane, 1, RotationDirection.right),
//       new RotationCommand(Plane.xPlane, 2, RotationDirection.left),
//       new RotationCommand(Plane.zPlane, 1, RotationDirection.right),
//       new RotationCommand(Plane.zPlane, 1, RotationDirection.left),
//       new RotationCommand(Plane.zPlane, 2, RotationDirection.left),
//       new RotationCommand(Plane.yPlane, 2, RotationDirection.left),
//       new RotationCommand(Plane.xPlane, 1, RotationDirection.left),
//       new RotationCommand(Plane.xPlane, 0, RotationDirection.right),
//       new RotationCommand(Plane.yPlane, 1, RotationDirection.left),
//       new RotationCommand(Plane.zPlane, 1, RotationDirection.right),
//    ];

//    if (shuffleRotations.length === 0) {
//       rubixCube.shuffle(10);
//    } else {
//       rubixCube.rotateMultipleTimes(shuffleRotations, true);
//    }
//    rubixCube.solve("advanced");
//    // rubixCube.printSnapshot();

//    console.log("Shuffles:");
//    console.log(rubixCube.shuffles.map((r) => r.toString()).join(",\n"));

//    visualManager.skipShuffles(true);
//    visualManager.startRendering(canvas);

//    animate(visualManager);
// });

// function animate(visualManager: VisualManager) {
//    requestAnimationFrame(() => animate(visualManager));
//    visualManager.render();
// }

// document.getElementById("goBackButton")!.onclick = () => {
//    visualManager.previous();
// };

// document.getElementById("goForwardsButton")!.onclick = () => {
//    visualManager.next();
// };
