import {Line2D, Plane2D, PlaneMetadata, Point2D, Point3D} from "../main/geometry.js";
import {Scene} from "../main/scene.js";
import {assertEqualCoords, assertEqualMatrices, assertEquals, assertFalse, assertTrue, runTest} from "./common-test.js";
import {CubeCoords} from "../main/cube.js";
import {Axis, blueStyle, globalStyle, MoveDirection, SideType} from "../main/common.js";

// Fake canvas for test purposes
const canvas = {width: 100, height: 100};

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
    _doTestCubeCoordsRotation({ side: SideType.UP, coords: [[1,1,1],[1,1,-1],[-1,1,-1],[-1,1,1]] });
    _doTestCubeCoordsRotation({ side: SideType.UP, coords: [[0,1,1],[1,1,0],[0,1,-1],[-1,1,0]] });
    _doTestCubeCoordsRotation({ side: SideType.DOWN, coords: [[1,-1,1],[1,-1,-1],[-1,-1,-1],[-1,-1,1]] });
    _doTestCubeCoordsRotation({ side: SideType.DOWN, coords: [[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]] });
    _doTestCubeCoordsRotation({ side: SideType.FRONT, coords: [[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1]] });
    _doTestCubeCoordsRotation({ side: SideType.FRONT, coords: [[0,1,-1],[1,0,-1],[0,-1,-1],[-1,0,-1]] });
    _doTestCubeCoordsRotation({ side: SideType.BACK, coords: [[-1,1,1],[1,1,1],[1,-1,1],[-1,-1,1]] });
    _doTestCubeCoordsRotation({ side: SideType.BACK, coords: [[0,1,1],[1,0,1],[0,-1,1],[-1,0,1]] });
    _doTestCubeCoordsRotation({ side: SideType.LEFT, coords: [[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,-1,1]] });
    _doTestCubeCoordsRotation({ side: SideType.LEFT, coords: [[-1,1,0],[-1,0,-1],[-1,-1,0],[-1,0,1]] });
    _doTestCubeCoordsRotation({ side: SideType.RIGHT, coords: [[1,1,1],[1,1,-1],[1,-1,-1],[1,-1,1]] });
    _doTestCubeCoordsRotation({ side: SideType.RIGHT, coords: [[1,1,0],[1,0,-1],[1,-1,0],[1,0,1]] });
}

function _doTestPlaneRotation(data) {
    const planeData = new PlaneMetadata(globalStyle, data.sides[0], "");
    for(let i=1; i<=4; i++) {
        planeData.rotateSide(data.moveSide, MoveDirection.CLOCKWISE);
        assertEquals(planeData.orientation, data.sides[i % 4], `Moved side ${data.moveSide}, direction: ${MoveDirection.CLOCKWISE}`);
    }
    for(let i=3; i>=0; i--) {
        planeData.rotateSide(data.moveSide, MoveDirection.COUNTERCLOCKWISE);
        assertEquals(planeData.orientation, data.sides[i], `Moved side ${data.moveSide}, direction: ${MoveDirection.COUNTERCLOCKWISE}`);
    }
}

function testPlaneRotation() {
    // Ignore rotation when orientation is not set (for invisible planes)
    _doTestPlaneRotation({ moveSide: SideType.UP, sides: [null, null, null, null] });

    // NOTE: This is not an exhaustive list of combinations
    _doTestPlaneRotation({ moveSide: SideType.UP, sides: [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT] });
    _doTestPlaneRotation({ moveSide: SideType.DOWN, sides: [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT] });
    _doTestPlaneRotation({ moveSide: SideType.LEFT, sides: [SideType.FRONT, SideType.DOWN, SideType.BACK, SideType.UP] });
    _doTestPlaneRotation( { moveSide: SideType.RIGHT, sides: [SideType.FRONT, SideType.DOWN, SideType.BACK, SideType.UP] });
    _doTestPlaneRotation({ moveSide: SideType.FRONT, sides: [SideType.UP, SideType.RIGHT, SideType.DOWN, SideType.LEFT] });
    _doTestPlaneRotation( { moveSide: SideType.BACK, sides: [SideType.UP, SideType.RIGHT, SideType.DOWN, SideType.LEFT] });

    _doTestPlaneRotation({ moveSide: SideType.FRONT, sides: [SideType.FRONT, SideType.FRONT, SideType.FRONT, SideType.FRONT] });
    _doTestPlaneRotation({ moveSide: SideType.BACK, sides: [SideType.FRONT, SideType.FRONT, SideType.FRONT, SideType.FRONT] });
}

function testPointInsidePlane() {
    // We must ensure that points are ordered counterclockwise (using standard axis, not screen coordinates!)
    // for a plane to be visible
    const point1 = new Point2D(0.4,0.6, globalStyle);
    const point2 = new Point2D(-0.6,0.5, globalStyle);
    const point3 = new Point2D(-0.6,-0.5, globalStyle);
    const point4 = new Point2D(0.6,-0.4, globalStyle);
    const center = new Point2D(0, 0, globalStyle); // irrelevant for testing, just needed as constructor parameter
    const normalEnd = new Point2D(0.1, 0.1, globalStyle); // as above
    const normal = new Line2D(center, normalEnd);
    const plane = new Plane2D([point1, point2, point3, point4], center, normal, true,
        new PlaneMetadata(blueStyle, SideType.FRONT, 'NONE'), canvas);

    // assuming 100x100 pixels
    console.log(point1.actualX(canvas), point1.actualY(canvas));
    console.log(point2.actualX(canvas), point2.actualY(canvas));
    console.log(point3.actualX(canvas), point3.actualY(canvas));
    console.log(point4.actualX(canvas), point4.actualY(canvas));
    assertTrue(plane.isInside(50, 50), "The point is inside the plane");
    assertFalse(plane.isInside(80, 80), "The point is outside the plane");
    assertFalse(plane.isInside(71, 21), "The point is outside the plane");
    assertTrue(plane.isInside(21, 50), "The point is inside the plane");
    assertFalse(plane.isInside(19, 50), "The point is outside plane");
    assertTrue(plane.isInside(50, 72), "The point is inside the plane");
    assertFalse(plane.isInside(50, 22), "The point is outside the plane");

}

runTest(testPoint3DRotation);
runTest(testSceneRotation);
runTest(testCubeCoordsRotation);
runTest(testPlaneRotation);
runTest(testPointInsidePlane);