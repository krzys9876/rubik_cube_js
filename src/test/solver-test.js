import {assertTrue, runTest} from "./common-test.js";
import {RubikCube, SideAnimation} from "../main/cube.js";
import {RubikSolver} from "../main/solver.js";
import {Point3D} from "../main/geometry.js";

function testSolverE2E() {
    const solvedMoves = [];
    const steps = 1000;
    const startTime = new Date().getTime();
    for(let i=0; i<steps; i++) solvedMoves.push(doTestSolverE2EOne(100, 500));
    const endTime = new Date().getTime();
    const diffMs = (endTime - startTime);
    const diffS = diffMs/1000;

    console.log(`Tested ${steps} runs in ${Math.round(diffS*100)/100} s, ${Math.round(diffMs/steps)} ms/run`);
    solvedMoves.sort((a, b) => a - b);
    const minMoves = solvedMoves.reduce((acc,curr) => curr < acc ? curr : acc, 9999);
    const maxMoves = solvedMoves.reduce((acc,curr) => curr > acc ? curr : acc, 0);
    console.log(`Max moves ${maxMoves}, min moves ${minMoves} median ${solvedMoves[Math.round(steps/2)]}`);
    const deciles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for(let d of deciles) {
        const dslice = solvedMoves.slice(d * solvedMoves.length/10, (d+1)*solvedMoves.length/10);
        const dmin = dslice.reduce((acc,curr) => curr < acc ? curr : acc, 9999);
        const dmax = dslice.reduce((acc,curr) => curr > acc ? curr : acc, 0);
        console.log(`Decile ${(d+1)}: min ${dmin} max ${dmax}`);
    }
}

function doTestSolverE2EOne(shuffleMoves, maxMoves) {
    const cube = new RubikCube(new Point3D(0,0,0), 1);
    let moves = 0;
    SideAnimation.animationStep = 90; // no animation
    cube.shuffle(shuffleMoves);
    let solved = false;
    while (moves < maxMoves && !solved) {
        const solver = new RubikSolver(cube, false);
        const nextMoves = solver.solveLBL();
        nextMoves.forEach( m => {
            cube.startMoveSide(m);
            while(cube.animation.ongoing) cube.animate();
            moves++;
        });
        solved = nextMoves.length === 0;
    }
    assertTrue(solved, `Cube should be solved within limit of ${maxMoves} moves`);
    return moves;
}

runTest(testSolverE2E);
