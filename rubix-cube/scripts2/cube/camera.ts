import * as THREE from "three";
import { Plane, PlaneIdentifier, planeToAxis } from "./commands";
import { SCALE, SPEED } from "../settings";
import { roundAbout } from "./helper";

export class RubixCubeCamera extends THREE.PerspectiveCamera {
    public static DISTANCE = 8 * SCALE;
    public static DEFAULT_POSITION = new THREE.Vector3(3 * SCALE, 5 * SCALE, 3 * SCALE);
    public static CUBE_ORIGIN = new THREE.Vector3();

    public isTransforming = false;
    public currentlyFacing: PlaneIdentifier | null = null;

    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.position.copy(RubixCubeCamera.DEFAULT_POSITION);
        this.lookAt(RubixCubeCamera.CUBE_ORIGIN);
        this.addKeyboardControls();
    }

    public viewFace(planeIdentifier: PlaneIdentifier, onFinished: () => void): boolean {
        if (this.isTransforming || this.currentlyFacing?.equals(planeIdentifier)) return false;

        this.isTransforming = true;
        this.currentlyFacing = planeIdentifier;

        const position = this.getPositionForFace(planeIdentifier);
        const path = new THREE.Vector3().subVectors(position, this.position).multiplyScalar(0.01 * SPEED);

        const cleanUp = () => {
            this.isTransforming = false;
        };

        const animateTransform = () => {
            if (
                roundAbout(this.position.x, position.x, 0.1) &&
                roundAbout(this.position.y, position.y, 0.1) &&
                roundAbout(this.position.z, position.z, 0.1)
            ) {
                cleanUp();
                onFinished();
                return;
            }
            requestAnimationFrame(animateTransform);
            this.position.addVectors(this.position, path);
            this.lookAt(RubixCubeCamera.CUBE_ORIGIN);
        };
        animateTransform();

        return true;
    }

    public getPositionForFace(planeIdentifier: PlaneIdentifier): THREE.Vector3 {
        if (planeIdentifier.idx === 1) return RubixCubeCamera.DEFAULT_POSITION;

        const axis = planeToAxis(planeIdentifier.plane);
        const vector = new THREE.Vector3(3 * SCALE, 3 * SCALE, 3 * SCALE);
        vector[axis] = RubixCubeCamera.DISTANCE * (planeIdentifier.idx === 0 ? -1 : 1);

        return vector;
    }

    public addKeyboardControls() {
        window.addEventListener("keypress", (e) => {
            let planeId: PlaneIdentifier;
            if (e.key === "t") planeId = new PlaneIdentifier(Plane.yPlane, 2);
            else if (e.key === "b") planeId = new PlaneIdentifier(Plane.yPlane, 0);
            else if (e.key === "l") planeId = new PlaneIdentifier(Plane.xPlane, 0);
            else if (e.key === "r") planeId = new PlaneIdentifier(Plane.xPlane, 2);
            else if (e.key === "f") planeId = new PlaneIdentifier(Plane.zPlane, 2);
            else if (e.key === "k") planeId = new PlaneIdentifier(Plane.zPlane, 0);
            else return;

            this.viewFace(planeId, () => {});
        });
    }
}
