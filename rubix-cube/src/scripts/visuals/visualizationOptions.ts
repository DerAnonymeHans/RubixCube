/** @format */

import { CameraOptions } from "./camera";

export interface VisualizationOptions {
   enableCameraMovement: boolean;
   enableEditing: boolean;
   enableRotationShortcuts: boolean;
   cameraOptions: CameraOptions | null;
   speed: number;
}
