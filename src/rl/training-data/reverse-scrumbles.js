import {RubikCube} from "../../main/cube.js";
import {RubikSolver} from "../../main/solver.js";

const SCRAMBLE_MOVES = 5;

function getScrambled() {
    const cube = RubikCube.create();
    console.log(cube.getState());

    cube.shuffle(SCRAMBLE_MOVES);
    cube.history.forEach(h => console.log(`${h.toCode()}`));

    console.log(cube.getState());

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

    const state = cube.getState();
    console.log(state);

    console.log(cube.getTextState());
}

generateWhiteCrossScramble();