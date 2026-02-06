import {RubikCube} from "../../main/cube.js";
import {RubikSolver} from "../../main/solver.js";
import fs from "fs";

const SCRAMBLE_MOVES = 50;

function getScrambled() {
    const cube = RubikCube.create();
    //console.log(cube.getConsoleState());
    cube.shuffle(SCRAMBLE_MOVES);
    //console.log(cube.getConsoleState());
    return cube;
}

function generateWhiteCrossScramble() {
    const cube = getScrambled();
    const initialState = cube.getCompactState();
    const scrambleMoves = cube.history.map(m => m.toCode());
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
    //console.log(`--- Solved in ${solvingMoves.length} moves`);
    //solvingMoves.forEach(move => console.log(`${move.toCode()} / ${move.reverse().toCode()}`));
    //console.log(`--- reversed:`);
    solvingMoves.reverse();
    const reversed = solvingMoves.map(move => move.reverse());
    //reversed.forEach(move => console.log(`${move.toCode()} / ${move.reverse().toCode()}`));

    const solvedState = cube.getCompactState();

    //console.log(cube.getConsoleState());
    //console.log(cube.getConsoleState());

    return { scrambleMoves: scrambleMoves, scrambledState: initialState, solvedState: solvedState,
        solvingMoves: solvingMoves.map(m => m.toCode()), reversedMoves: reversed.map(m => m.toCode()) };
}

function generateWhiteCrossScrambles(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateWhiteCrossScramble());
        if(i % 1000 === 0) console.log(i);
    }
    fs.writeFileSync('whiteCrossInput.json', JSON.stringify(res/*, null, 2*/));
}

function solveOneStage(cube, solveStage) {
    let solved = false
    const solvingMoves = [];
    while(!solved) {
        const moves = solveStage();
        moves.forEach(move => {
            solvingMoves.push(move)
            cube.oneMove(move)
        });
        solved = moves.length === 0;
    }
    return solvingMoves;
}

function generateYellowCrossSolution() {
    const cube = getScrambled();
    const scrambleMoves = cube.history.map(m => m.toCode());

    const solverInit = new RubikSolver(cube, false);
    solveOneStage(cube, () => solverInit.solveWhiteCross());
    solveOneStage(cube, () => solverInit.solveWhiteCorners());
    solveOneStage(cube, () => solverInit.solveMidLayer());
    const initialState = cube.getCompactState();

    const solver = new RubikSolver(cube, false);
    const solvingMoves = solveOneStage(cube, () => solver.solveYellowCross());
    const solvedState = cube.getCompactState();

    return { scrambleMoves: scrambleMoves.join(" "), scrambledState: initialState, solvedState: solvedState,
        solvingMoves: solvingMoves.map(m => m.toCode()).join(" ") };
}


function generateYellowCrossSolutions(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateYellowCrossSolution());
        if(i % 1000 === 0) console.log(i);
    }
    const resTxt = res.filter(r => r.solvingMoves.length > 0).map(r => r.scrambledState+"|"+r.solvingMoves+"|"+r.solvedState).join("\n");
    fs.writeFileSync('yellowCrossInput.txt', resTxt);
}


function generateYellowLayerSolution() {
    const cube = getScrambled();
    const scrambleMoves = cube.history.map(m => m.toCode());

    const solverInit = new RubikSolver(cube, false);
    solveOneStage(cube, () => solverInit.solveWhiteCross());
    solveOneStage(cube, () => solverInit.solveWhiteCorners());
    solveOneStage(cube, () => solverInit.solveMidLayer());
    const initialState = cube.getCompactState();

    const solver = new RubikSolver(cube, false);
    const solvingMoves1 = solveOneStage(cube, () => solver.solveYellowCross());
    const solvingMoves2 = solveOneStage(cube, () => solver.solveYellowLayer());
    const solvedState = cube.getCompactState();

    return { scrambleMoves: scrambleMoves.join(" "), scrambledState: initialState, solvedState: solvedState,
        solvingMoves: (solvingMoves1.concat(solvingMoves2)).map(m => m.toCode()).join(" ") };
}

function generateYellowLayerSolutions(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateYellowLayerSolution());
        if(i % 1000 === 0) console.log(i);
    }
    const resTxt = res.filter(r => r.solvingMoves.length > 0).map(r => r.scrambledState+"|"+r.solvingMoves+"|"+r.solvedState).join("\n");
    fs.writeFileSync('yellowLayerInput.txt', resTxt);
}

//generateYellowCrossSolutions(10000);
generateYellowLayerSolutions(10000);