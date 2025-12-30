import {Point3D} from "../main/geometry.js";
import {Scene} from "../main/scene.js";
import {assertEqualCoords, assertEqualMatrices, assertEqualsRounded, runTest} from "./common-test.js";
import {CubeCoords} from "../main/cube.js";

function testPoint3DRotation() {
    const point = new Point3D(1, 2, 3);
    const rotationMatrixX90 = Scene.rotationMatrixX(Math.PI / 2);
    const rotationMatrixY90 = Scene.rotationMatrixY(Math.PI / 2);
    const rotationMatrixZ90 = Scene.rotationMatrixZ(Math.PI / 2);

    const rotationCenter = new Point3D(0, 0, 0);

    const pointX90 = point.clone().rotate(rotationMatrixX90, rotationCenter);
    assertEqualCoords(pointX90, { x: 1, y: -3, z: 2 }, 2,
        'X should not change, Y should have a value of -Z, Z should should have a value of Y');

    const pointY90 = point.clone().rotate(rotationMatrixY90, rotationCenter);
    assertEqualCoords(pointY90, { x: 3, y: 2, z: -1 }, 2,
        'X should have a value of Z, Y should not change, Z should should have a value of -X');

    const pointZ90 = point.clone().rotate(rotationMatrixZ90, rotationCenter);
    assertEqualCoords(pointZ90, { x: -2, y: 1, z: 3 }, 2,
        'X should have a value of -Y, Y should have a value of X, Z should not change');
}

function testSceneRotation() {
    const scene = new Scene();

    assertEqualMatrices(scene.rotationMatrix, [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ], 5, 'Initial rotation matrix with 1s on diagonal');
    scene.rotate(90 ,90, 90);
    assertEqualMatrices(scene.rotationMatrix, [ [ 0, 0, 1 ], [ 0, 1, 0 ], [ -1, 0, 0 ] ], 'Axis are switched after rotation');
}

function testCubeCoordsRotation() {
    const cubeCoords = new CubeCoords(1,1,1);
}

runTest(testPoint3DRotation);
runTest(testSceneRotation);