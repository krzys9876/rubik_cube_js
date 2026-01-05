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
    assertEquals(Movement.toText(cube.planned), "R L D B R F U", "Planned moves contain only moves that have not been processed yet");

    // TODO: Consider this: when the newly processed move is marked as "reverse" and the last move in history is the opposite move that both these moves are deleted from history
    // so: "F D U" after planning reverse is: "U1 U R ..." but after processing U1 we should get: "F D" and planned: "U R ..." (the pair U U1 disappears)
    revertOneMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U1 U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "R L D B R F U", "Planned moves contain only moves that have not been processed yet");

    revertOneMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U1 U R L D B R F U", "Planned moves contain only moves that have not been processed yet");

    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U U1", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U U1 U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "D B R F U", "Planned moves contain only moves that have not been processed yet");
    revertOneMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U U1 U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "L1 L D B R F U", "Planned moves contain only moves that have not been processed yet");
    revertOneMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U U1 U U1 U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "L1 L D B R F U", "Planned moves contain only moves that have not been processed yet");
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
    cube.planned.splice(0, 0, lastMove.withType(MoveType.REVERSE));
    cube.planned.splice(0, 0, reverseMove);
}

runTest(testSimpleHistory);
runTest(testHistoryWithReverts);
