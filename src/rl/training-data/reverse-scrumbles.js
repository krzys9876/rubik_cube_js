import {RubikCube} from "../../main/cube.js";
import {RubikSolver} from "../../main/solver.js";
import fs from "fs";

const SCRAMBLE_MOVES = 50;

function getScrambled() {
    const cube = RubikCube.create();
    cube.shuffle(SCRAMBLE_MOVES);
    return cube;
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

function generateWhiteLayerSolution() {
    const cube = getScrambled();
    const scrambleMoves = cube.history.map(m => m.toCode());

    const initialState = cube.getCompactState();

    const solver = new RubikSolver(cube, false);
    const solvingMoves1 = solveOneStage(cube, () => solver.solveWhiteCross());
    const solvingMoves2 = solveOneStage(cube, () => solver.solveWhiteCorners());
    const solvingMoves = solvingMoves1.concat(solvingMoves2)
    const solvedState = cube.getCompactState();

    return { scrambleMoves: scrambleMoves.join(" "), scrambledState: initialState, solvedState: solvedState,
        solvingMoves: solvingMoves.map(m => m.toCode()).join(" ") };
}


function generateWhiteLayerSolutions(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateWhiteLayerSolution());
        if(i % 1000 === 0) console.log(i);
    }
    const resTxt = res.filter(r => r.solvingMoves.length > 0).map(r => r.scrambledState+"|"+r.solvingMoves+"|"+r.solvedState).join("\n");
    fs.writeFileSync('whiteLayerInput.txt', resTxt);
}

function generateWhiteCornersSolution() {
    const cube = getScrambled();
    const scrambleMoves = cube.history.map(m => m.toCode());

    const solverInit = new RubikSolver(cube, false);
    solveOneStage(cube, () => solverInit.solveWhiteCross());
    const initialState = cube.getCompactState();

    const solver = new RubikSolver(cube, false);
    const solvingMoves = solveOneStage(cube, () => solver.solveWhiteCorners());
    const solvedState = cube.getCompactState();

    return { scrambleMoves: scrambleMoves.join(" "), scrambledState: initialState, solvedState: solvedState,
        solvingMoves: solvingMoves.map(m => m.toCode()).join(" ") };
}


function generateWhiteCornersSolutions(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateWhiteCornersSolution());
        if(i % 1000 === 0) console.log(i);
    }
    const resTxt = res.filter(r => r.solvingMoves.length > 0).map(r => r.scrambledState+"|"+r.solvingMoves+"|"+r.solvedState).join("\n");
    fs.writeFileSync('whiteCornersInput.txt', resTxt);
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

function generateUpperLayerSolution() {
    const cube = getScrambled();
    const scrambleMoves = cube.history.map(m => m.toCode());

    const solverInit = new RubikSolver(cube, false);
    solveOneStage(cube, () => solverInit.solveWhiteCross());
    solveOneStage(cube, () => solverInit.solveWhiteCorners());
    solveOneStage(cube, () => solverInit.solveMidLayer());
    solveOneStage(cube, () => solverInit.solveYellowCross());
    solveOneStage(cube, () => solverInit.solveYellowLayer());
    const initialState = cube.getCompactState();

    const solver = new RubikSolver(cube, false);
    const solvingMoves1 = solveOneStage(cube, () => solver.solveYellowCorners());
    const solvingMoves2 = solveOneStage(cube, () => solver.solveYellowEdges());
    const solvedState = cube.getCompactState();

    return { scrambleMoves: scrambleMoves.join(" "), scrambledState: initialState, solvedState: solvedState,
        solvingMoves: (solvingMoves1.concat(solvingMoves2)).map(m => m.toCode()).join(" ") };
}

function generateUpperLayerSolutions(num) {
    const res = [];
    for(let i=0; i<num; i++) {
        res.push(generateUpperLayerSolution());
        if(i % 1000 === 0) console.log(i);
    }
    const resTxt = res.filter(r => r.solvingMoves.length > 0).map(r => r.scrambledState+"|"+r.solvingMoves+"|"+r.solvedState).join("\n");
    fs.writeFileSync('upperLayerInput.txt', resTxt);
}

//generateWhiteLayerSolutions(100000) // too complex for monte carlo
//generateWhiteCornersSolutions(100000)
//generateYellowCrossSolutions(10000);
//generateYellowLayerSolutions(100000);
generateUpperLayerSolutions(100000);