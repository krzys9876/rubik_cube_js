import {RubikCube} from "../../main/cube.js";
import {RubikSolver} from "../../main/solver.js";
import {assertEquals} from "../../test/common-test.js";

const SCRAMBLE_MOVES = 50;

function getScrambled() {
    const cube = RubikCube.create();
    cube.shuffle(SCRAMBLE_MOVES);
    assertEquals(cube.history.length, SCRAMBLE_MOVES, "history should contain given number of moves");
    //cube.history.forEach(h => console.log(`${h.toCode()}`));
    //console.log("----------------------");
    cube.clearHistory();
    return cube;
}

function generateWhiteCrossScramble() {
    const cube = getScrambled();
    const solvingMoves = []

    const solver = new RubikSolver(cube, false);
    let solved = false;
    let moves = solver.solveWhiteCross();

    while(!solved) {
        moves = solver.solveWhiteCross();
        moves.forEach(move => {
            //console.log(`${move.toCode()} / ${move.reverse().toCode()}`);
            solvingMoves.push(move);
            cube.oneMove(move);
        });
        solved = moves.length === 0;

    }
    console.log(`--- Solved in ${solvingMoves.length} moves`);
    solvingMoves.forEach(move => {
        console.log(`${move.toCode()} / ${move.reverse().toCode()}`);
    })
    console.log(`--- reversed:`);
    solvingMoves.reverse();
    const reversed = solvingMoves.map(move => move.reverse());
    reversed.forEach(move => {
        console.log(`${move.toCode()} / ${move.reverse().toCode()}`);
    })
}

generateWhiteCrossScramble();