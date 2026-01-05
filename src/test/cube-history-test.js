import {assertEquals, runTest} from "./common-test.js";
import {Movement, RubikCube, SideAnimation} from "../main/cube.js";
import {Point3D} from "../main/geometry.js";
import {MoveType, reverseDirection} from "../main/common.js";

function testSimpleHistory() {
    const movesToTest = [];
    for(let i=0; i<100; i++) movesToTest.push(Movement.random());

    SideAnimation.animationStep = 90; // no animation
    const cube = new RubikCube(new Point3D(0,0,0), 1);
    cube.planMoves(movesToTest);
    applyAllPlannedMoves(cube);

    const history = cube.history;
    assertEquals(history.length, movesToTest.length, "There should be the same number of moves in history");
    for (let i = 0; i < history.length; i++)
        assertEquals(history[i], movesToTest[i], "History should reflect the same moves");
}

function testHistoryWithReverts() {
    const movesToTest = Movement.fromText("F D U R L D B R F U");

    SideAnimation.animationStep = 90; // no animation
    const cube = new RubikCube(new Point3D(0,0,0), 1);
    cube.planMoves(movesToTest);

    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U", "History should reflect processed moves");

    //revertOneMove(cube);
    //revertOneMove(cube);

    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U R", "History should reflect processed moves");
    //revertOneMove(cube);
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U R L D", "History should reflect processed moves");
}

function applyAllPlannedMoves(cube) {
    while(cube.hasPlannedMoves()) applyOnePlannedMove(cube);
}

function applyOnePlannedMove(cube) {
    cube.startMoveSide();
    while(cube.animation.ongoing) cube.animate();
}

function revertOneMove(cube) {
    const lastMove = cube.history[cube.history.length - 1];
    const reverseMove = new Movement(lastMove.side, reverseDirection(lastMove.direction), MoveType.REVERSE);
    // Plan the move again
    cube.planned.splice(0, 0, lastMove);
}

runTest(testSimpleHistory);
runTest(testHistoryWithReverts);
