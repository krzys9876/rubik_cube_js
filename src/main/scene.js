import {Axis} from "./common.js";

export class Scene {
    static deg2rad = Math.PI / 180;

    // Rotation matrix (3x3) representing the current scene rotation
    // Initially identity matrix (no rotation, hence 1s on diagonal)
    // see: e.g. https://en.wikipedia.org/wiki/Rotation_matrix#Basic_3D_rotations
    rotationMatrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    static rotationMatrix(axis, angleRad) {
        let c = Math.cos(angleRad);
        let s = Math.sin(angleRad);

        switch (axis) {
            case Axis.X: return [
                [1, 0, 0],
                [0, c, -s],
                [0, s, c]];
            case Axis.Y: return [
                [c, 0, s],
                [0, 1, 0],
                [-s, 0, c]];
            case Axis.Z: return [
                [c, -s, 0],
                [s, c, 0],
                [0, 0, 1]];
        }
    }

    // Multiply two 3x3 matrices
    static multiplyMatrices(a, b) {
        let result = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }

    // Rotate the scene by incremental angles (in degrees) around observer's axes
    rotate(angleX, angleY, angleZ) {
        // Convert degrees to radians
        let radX = angleX * Scene.deg2rad;
        let radY = angleY * Scene.deg2rad;
        let radZ = angleZ * Scene.deg2rad;

        // Create rotation matrices for the incremental rotations
        // These represent rotations around the CURRENT (observer's) axes
        let rotX = Scene.rotationMatrix(Axis.X, radX);
        let rotY = Scene.rotationMatrix(Axis.Y, radY);
        let rotZ = Scene.rotationMatrix(Axis.Z, radZ);

        // Compose the incremental rotations (order matters!)
        // Z * Y * X means: rotate X first, then Y, then Z
        let incrementalRotation = Scene.multiplyMatrices(rotZ, Scene.multiplyMatrices(rotY, rotX));

        // Apply the incremental rotation to the current rotation
        // New rotation = incremental * current
        this.rotationMatrix = Scene.multiplyMatrices(incrementalRotation, this.rotationMatrix);
    }

    // Apply the rotation matrix to a point
    applyRotation(point) {
        let x = this.rotationMatrix[0][0] * point.x + this.rotationMatrix[0][1] * point.y + this.rotationMatrix[0][2] * point.z;
        let y = this.rotationMatrix[1][0] * point.x + this.rotationMatrix[1][1] * point.y + this.rotationMatrix[1][2] * point.z;
        let z = this.rotationMatrix[2][0] * point.x + this.rotationMatrix[2][1] * point.y + this.rotationMatrix[2][2] * point.z;
        return { x, y, z };
    }
}

export const scene = new Scene();