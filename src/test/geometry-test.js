import {Point3D} from "../main/geometry.js";
import {Scene} from "../main/scene.js";
import {assertEqualsRounded, runTest} from "./common-test.js";

function testPoint3DRotation() {
    const point = new Point3D(1, 2, 3);
    const rotationMatrixX90 = Scene.rotationMatrixX(Math.PI / 2);
    const rotationMatrixY90 = Scene.rotationMatrixY(Math.PI / 2);
    const rotationMatrixZ90 = Scene.rotationMatrixZ(Math.PI / 2);

    const rotationCenter = new Point3D(0, 0, 0);

    const pointX90 = point.clone().rotate(rotationMatrixX90, rotationCenter);
    assertEqualsRounded(pointX90.x, 1, 2, 'X should not change');
    assertEqualsRounded(pointX90.y, -3, 2, 'Y should have a value of -Z');
    assertEqualsRounded(pointX90.z, 2, 2, 'Z should should have a value of Y');

    const pointY90 = point.clone().rotate(rotationMatrixY90, rotationCenter);
    assertEqualsRounded(pointY90.x, 3, 2, 'X should have a value of Z');
    assertEqualsRounded(pointY90.y, 2, 2, 'Y should not change');
    assertEqualsRounded(pointY90.z, -1, 2, 'Z should should have a value of -X');

    const pointZ90 = point.clone().rotate(rotationMatrixZ90, rotationCenter);
    assertEqualsRounded(pointZ90.x, -2, 2, 'X should have a value of -Y');
    assertEqualsRounded(pointZ90.y, 1, 2, 'X should have a value of X');
    assertEqualsRounded(pointZ90.z, 3, 2, 'Z should not change');
}

runTest(testPoint3DRotation);