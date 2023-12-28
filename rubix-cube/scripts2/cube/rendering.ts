import { STATE } from "../state";

export function setupScene() {
    STATE.rendering.renderer.setSize(window.innerWidth, window.innerHeight);

    if (document.body.querySelector("canvas") === null) {
        document.getElementById("canvasContainer")!.appendChild(STATE.rendering.renderer.domElement);
    }
}

export function animate() {
    requestAnimationFrame(animate);

    STATE.rendering.renderer.render(STATE.rendering.scene, STATE.rendering.camera);
}
