import {assertEquals, runTest} from "./common-test.js";
import {Movement, RubikCube, SideAnimation} from "../main/cube.js";
import {Point3D} from "../main/geometry.js";

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

    // so: "F D U" after planning reverse is: "U1 U R ..." but after processing U1 we should get: "F D" and planned: "U R ..." (the pair U U1 disappears)
    cube.revertOneMove();
    assertEquals(Movement.toText(cube.history), "F D U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U1 U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube); // Apply reverse move - delete entry from history
    assertEquals(Movement.toText(cube.history), "F D", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "R L D B R F U", "Planned moves contain only moves that have not been processed yet");

    cube.revertOneMove();
    assertEquals(Movement.toText(cube.history), "F D U", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U1 U R L D B R F U", "Planned moves contain only moves that have not been processed yet");

    applyOnePlannedMove(cube); // Apply reverse move - delete entry from history
    assertEquals(Movement.toText(cube.history), "F D", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "U R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "D B R F U", "Planned moves contain only moves that have not been processed yet");
    cube.revertOneMove();
    assertEquals(Movement.toText(cube.history), "F D U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "L1 L D B R F U", "Planned moves contain only moves that have not been processed yet");
    cube.revertOneMove(); // Ignore consecutive reverse
    assertEquals(Movement.toText(cube.history), "F D U R L", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "L1 L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U R", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "L D B R F U", "Planned moves contain only moves that have not been processed yet");
    cube.revertOneMove();
    assertEquals(Movement.toText(cube.history), "F D U R", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "R1 R L D B R F U", "Planned moves contain only moves that have not been processed yet");
    applyOnePlannedMove(cube); // Apply reverse move - delete entry from history
    applyOnePlannedMove(cube); // Apply next 3 moves (R L D)
    applyOnePlannedMove(cube);
    applyOnePlannedMove(cube);
    assertEquals(Movement.toText(cube.history), "F D U R L D", "History should reflect processed moves");
    assertEquals(Movement.toText(cube.planned), "B R F U", "Planned moves contain only moves that have not been processed yet");
}

function applyAllPlannedMoves(cube) {
    while(cube.hasPlannedMoves()) applyOnePlannedMove(cube);
}

function applyOnePlannedMove(cube) {
    cube.startMoveSide();
    while(cube.animation.ongoing) cube.animate();
}

runTest(testSimpleHistory);
runTest(testHistoryWithReverts);
