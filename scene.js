export class Scene {
    static deg2rad = Math.PI / 180;

    angleDegX = 0;
    angleDegY = 0;
    angleDegZ = 0;

    angleRadX = 0;
    angleRadY = 0;
    angleRadZ = 0;

    rotateX(angleDeg) {
        this.angleDegX += angleDeg;
        this.angleRadX = Scene.deg2rad * this.angleDegX;
    }

    rotateY(angleDeg) {
        this.angleDegY += angleDeg;
        this.angleRadY = Scene.deg2rad * this.angleDegY;
    }

    rotateZ(angleDeg) {
        this.angleDegZ += angleDeg;
        this.angleRadZ = Scene.deg2rad * this.angleDegZ;
    }

    rotate(angleX, angleY, angleZ) {
        this.rotateX(angleX);
        this.rotateY(angleY);
        this.rotateZ(angleZ);
    }
}

export const scene = new Scene();