import {assertEquals, runTest} from "./common-test.js";
import {Movement, RubikCube, SideAnimation} from "../main/cube.js";
import {Point3D} from "../main/geometry.js";
import {MoveType} from "../main/common.js";

function testSimpleHistory() {
    const movesToTest = [];
    for(let i=0; i<100; i++) movesToTest.push(Movement.random());

    SideAnimation.animationStep = 90; // no animation
    const cube = new RubikCube(new Point3D(0,0,0), 1);
    applyMoves(cube, movesToTest);

    const history = cube.history;
    assertEquals(history.length, movesToTest.length, "There should be the same number of moves in history");
    for (let i = 0; i < history.length; i++) {
        assertEquals(history[i], movesToTest[i], "History should reflect the same moves");
    }
}

function applyMoves(cube, moves) {
    moves.forEach( m => {
        cube.startMoveSide(m);
        while(cube.animation.ongoing) cube.animate();
    });
}

runTest(testSimpleHistory);
