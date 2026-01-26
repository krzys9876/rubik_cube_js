import {RubikCube} from "../../main/cube.js";
import {RubikSolver} from "../../main/solver.js";

const SCRAMBLE_MOVES = 50;

function getScrambled() {
    const cube = RubikCube.create();
    console.log(cube.getConsoleState());

    cube.shuffle(SCRAMBLE_MOVES);
    cube.history.forEach(h => console.log(`${h.toCode()}`));

    console.log(cube.getConsoleState());

    cube.clearHistory();
    return cube;
}

function generateWhiteCrossScramble() {
    const cube = getScrambled();
    const initialState = cube.getCompactState();
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

    const solvedState = cube.getCompactState();

    console.log(cube.getConsoleState());
    console.log(cube.getConsoleState());

    return { scrambledState: initialState, solvedState: solvedState, solvingMoves: solvingMoves.map(m => m.toCode()), reversedMoves: reversed.map(m => m.toCode()) };
}

const res = generateWhiteCrossScramble();
console.log(res);