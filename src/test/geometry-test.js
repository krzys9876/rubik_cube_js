import {Point3D} from "../main/geometry.js";
import {Scene} from "../main/scene.js";
import {assertEqualCoords, assertEqualMatrices, assertEqualsRounded, runTest} from "./common-test.js";
import {CubeCoords} from "../main/cube.js";
import {Axis, MoveDirection, SideType} from "../main/common.js";

function testPoint3DRotation() {
    const point = new Point3D(1, 2, 3);
    const rotationMatrixX90 = Scene.rotationMatrix(Axis.X, Math.PI / 2);
    const rotationMatrixY90 = Scene.rotationMatrix(Axis.Y, Math.PI / 2);
    const rotationMatrixZ90 = Scene.rotationMatrix(Axis.Z, Math.PI / 2);

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

function _makeCoords(arr) {
    return {x: arr[0], y: arr[1], z: arr[2]};
}

function _doTestCubeCoordsRotation(data) {
    const initCoords = _makeCoords(data.coords[0]);
    const coords = new CubeCoords(initCoords.x, initCoords.y, initCoords.z);
    for(let i=1; i<=4; i++) {
        coords.rotateSide(data.side, MoveDirection.CLOCKWISE);
        const c = _makeCoords(data.coords[i % 4]);
        assertEqualCoords(coords, _makeCoords(data.coords[i % 4]), 0, `Moved ${data.side}, direction ${MoveDirection.CLOCKWISE}`);
    }
    for(let i=3; i>=0; i--) {
        coords.rotateSide(data.side, MoveDirection.COUNTERCLOCKWISE);
        assertEqualCoords(coords, _makeCoords(data.coords[i]), 0, `Moved ${data.side}, direction ${MoveDirection.COUNTERCLOCKWISE}`);
    }
    assertEqualCoords(coords, _makeCoords(data.coords[0]), 0, `After 4 moves in both directions coords should be the same as initial`);
}

function testCubeCoordsRotation() {
    // coords array contains coords for 4 consecutive clockwise moves
    const dataTopCorner = { side: SideType.TOP, coords: [[1,1,1],[1,1,-1],[-1,1,-1],[-1,1,1]] };
    _doTestCubeCoordsRotation(dataTopCorner);
    const dataTopMiddle = { side: SideType.TOP, coords: [[0,1,1],[1,1,0],[0,1,-1],[-1,1,0]] };
    _doTestCubeCoordsRotation(dataTopMiddle);
    const dataBottomCorner = { side: SideType.BOTTOM, coords: [[1,-1,1],[1,-1,-1],[-1,-1,-1],[-1,-1,1]] };
    _doTestCubeCoordsRotation(dataBottomCorner);
    const dataBottomMiddle = { side: SideType.BOTTOM, coords: [[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]] };
    _doTestCubeCoordsRotation(dataBottomMiddle);
    const dataFrontCorner = { side: SideType.FRONT, coords: [[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1]] };
    _doTestCubeCoordsRotation(dataFrontCorner);
    const dataFrontMiddle = { side: SideType.FRONT, coords: [[0,1,-1],[1,0,-1],[0,-1,-1],[-1,0,-1]] };
    _doTestCubeCoordsRotation(dataFrontMiddle);
    const dataBackCorner = { side: SideType.BACK, coords: [[-1,1,1],[1,1,1],[1,-1,1],[-1,-1,1]] };
    _doTestCubeCoordsRotation(dataBackCorner);
    const dataBackMiddle = { side: SideType.BACK, coords: [[0,1,1],[1,0,1],[0,-1,1],[-1,0,1]] };
    _doTestCubeCoordsRotation(dataBackMiddle);
    const dataLeftCorner = { side: SideType.LEFT, coords: [[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,-1,1]] };
    _doTestCubeCoordsRotation(dataLeftCorner);
    const dataLeftMiddle = { side: SideType.LEFT, coords: [[-1,1,0],[-1,0,-1],[-1,-1,0],[-1,0,1]] };
    _doTestCubeCoordsRotation(dataLeftMiddle);
    const dataRightCorner = { side: SideType.RIGHT, coords: [[1,1,1],[1,1,-1],[1,-1,-1],[1,-1,1]] };
    _doTestCubeCoordsRotation(dataRightCorner);
    const dataRightMiddle = { side: SideType.RIGHT, coords: [[1,1,0],[1,0,-1],[1,-1,0],[1,0,1]] };
    _doTestCubeCoordsRotation(dataRightMiddle);
}

runTest(testPoint3DRotation);
runTest(testSceneRotation);
runTest(testCubeCoordsRotation);