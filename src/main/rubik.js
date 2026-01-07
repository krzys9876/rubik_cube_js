import {MoveDirection, SideType, Axis} from './common.js';
import { canvas, ctx } from './common-dom.js';
import {Point3D, Vector3D} from './geometry.js';
import {Movement, RubikCube, SideAnimation} from './cube.js';
import { scene } from './scene.js';
import {RubikSolver} from "./solver.js";

console.log("START");

const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,-Point3D.focalLength);
const cubeCenter = rotationCenter.clone().moveBy(new Vector3D(0, 0, 0));

const cube = new RubikCube(cubeCenter, 1.6);

let counter = 0;

const step = new Map([[Axis.X, 3 / 5], [Axis.Y, 3 / 5], [Axis.Z, 3 / 5]]);
const rotate = new Map();

let movement = null;
let shuffle = false;
let solve = false;
let stepByStep;
setStepByStep(false);
let runNextStep = false;
let revertLast = false;
let doubleClicked = {x: -1, y: -1};
let singleClicked = {x: -1, y: -1};
let dragStart = {x: -1, y: -1}
let mouseDragging = false;
let forceRefresh = false;

const bkStyle = 'lightgray';

let currentMoveNo = 1;
// Set initial point of view
scene.rotate(-15,30,-5);

function drawLoop() {
    // Let's not redraw the screen if nothing changed
    let isAutoMoving = cube.hasPlannedMoves() || cube.animation.ongoing || movement !== null ;
    let clickEvent = doubleClicked.x > -1 || singleClicked.x > -1;
    let shouldRefresh = forceRefresh || counter === 0 || rotate.size > 0 || isAutoMoving || clickEvent

    if(solve && !isAutoMoving) {
        // Let's protect fron infinite solving loop (e.g. when colors are not properly set)
        if(currentMoveNo > 500) {
            console.log("Something went wrong, too many moves!");
            updateSolve(false);
        } else {
            const solver = new RubikSolver(cube, true);
            const solvingMoves = solver.solveLBL();
            cube.planMoves(solvingMoves);
            updateSolve(solvingMoves.length > 0);
            shouldRefresh = true;
        }
    }

    if(shuffle && !cube.animation.ongoing) {
        cube.shuffle(shuffleNumber());
        shuffle = false;
        shouldRefresh = true;
    }

    if(revertLast) {
        cube.revertOneMove();
        revertLast = false;
        shouldRefresh = true;
        if(stepByStep) runNextStep = true;
    }

    if(shouldRefresh) {
        ctx.fillStyle = bkStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        scene.rotate(
            rotate.has(Axis.X) ? rotate.get(Axis.X) : 0,
            rotate.has(Axis.Y) ? rotate.get(Axis.Y) : 0,
            rotate.has(Axis.Z) ? rotate.get(Axis.Z) : 0);

        cube.draw(canvas, ctx, observer, rotationCenter);
        if(clickEvent) {
            // Redraw full cube if selection or color changed (this happens only once, we can't redraw only selection)
            if (cube.analyzeSelection(doubleClicked, singleClicked)) cube.draw(canvas, ctx, observer, rotationCenter);
            doubleClicked.x = -1;
            doubleClicked.y = -1;
            singleClicked.x = -1;
            singleClicked.y = -1;
        }

        if(movement !== null) {
            cube.planMoves([movement]);
            movement = null;
        }

        if(cube.hasPlannedMoves() && !cube.animation.ongoing &&
            (!solve || !stepByStep || runNextStep)) {
            cube.startMoveSide(movement);
            const code = cube.getCurrentMove().toCode();
            console.log("Current move: "+code);
            logMove(`${currentMoveNo} ${code}`);
            currentMoveNo+=1;
            runNextStep = false;
        }

        forceRefresh = false;
    }

    counter ++;
    if(counter < 10000000000000) setTimeout(drawLoop, 1000 / 60);
    else console.log("END (drawLoop)");
}

document.addEventListener('keydown', (event) => {
    if (document.activeElement.id === 'textMovements' ||
        document.activeElement.id === 'speedSlider') return;

    if (event.key === 'ArrowLeft') rotate.set(Axis.Y, step.get(Axis.Y));
    if (event.key === 'ArrowRight') rotate.set(Axis.Y, -step.get(Axis.Y));
    if (event.key === 'ArrowUp') rotate.set(Axis.X, step.get(Axis.X));
    if (event.key === 'ArrowDown') rotate.set(Axis.X, -step.get(Axis.X));
    if (event.key === ',') rotate.set(Axis.Z, step.get(Axis.Z));
    if (event.key === '.') rotate.set(Axis.Z, -step.get(Axis.Z));
    if (event.key === 'q') { manualMove(new Movement(SideType.UP, MoveDirection.CLOCKWISE)); }
    if (event.key === 'w') { manualMove(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 'a') { manualMove(new Movement(SideType.DOWN, MoveDirection.CLOCKWISE)); }
    if (event.key === 's') { manualMove(new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 'e') { manualMove(new Movement(SideType.FRONT, MoveDirection.CLOCKWISE)); }
    if (event.key === 'r') { manualMove(new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 'd') { manualMove(new Movement(SideType.BACK, MoveDirection.CLOCKWISE)); }
    if (event.key === 'f') { manualMove(new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 't') { manualMove(new Movement(SideType.LEFT, MoveDirection.CLOCKWISE)); }
    if (event.key === 'g') { manualMove(new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 'y') { manualMove(new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE)); }
    if (event.key === 'h') { manualMove(new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE)); }
    if (event.key === 'z') shuffle = true;
    if (event.key === 'x') startSolving();
    if (event.key === 'c') revertLast = true;
});

document.addEventListener('keyup', (event) => {
    if (document.activeElement.id === 'textMovements' ||
        document.activeElement.id === 'speedSlider') return;

    if (event.key === 'ArrowLeft') rotate.delete(Axis.Y);
    if (event.key === 'ArrowRight') rotate.delete(Axis.Y);
    if (event.key === 'ArrowUp') rotate.delete(Axis.X);
    if (event.key === 'ArrowDown') rotate.delete(Axis.X);
    if (event.key === ',') rotate.delete(Axis.Z);
    if (event.key === '.') rotate.delete(Axis.Z);
    if (event.key === 'z') shuffle = false;
});

document.getElementById('processButton').addEventListener('click', () => {
    const input = document.getElementById('textMovements');
    const text = input.value;
    if(!text) return;

    console.log("Processing: ", text);
    const toProcess = Movement.fromText(text);
    cube.planMoves(toProcess)
    input.value='';
});

document.getElementById('shuffleButton').addEventListener('click', () => {
    shuffle = true;
});

function shuffleNumber() {
    return parseInt(document.getElementById('shuffleNumber').value);
}

document.getElementById('solveButton').addEventListener('click', () => {
    startSolving();
});

document.getElementById('revertButton').addEventListener('click', () => {
    revertLast = true;
});

document.getElementById('resetButton').addEventListener('click', () => {
    cube.reset();
    forceRefresh = true;
});

function updateSolve(newSolve) {
    if(solve === newSolve) return;

    solve = newSolve;
    console.log(`Solve changed to: ${solve}`);
    const button = document.getElementById('solveButton');
    button.classList.toggle('solving', solve);
}

function startSolving() {
    if(solve && !stepByStep) return;
    cube.deselectPlanes();
    if(cube.isSolved()) {
        console.log("Already solved")
        return;
    }

    runNextStep = stepByStep; // This is only important when stepByStep is enabled
    if(!solve) {
        currentMoveNo = 1;
        clearMoveLog();
        cube.clearHistory();
        updateSolve(true);
    }
}

document.getElementById('speedSlider').addEventListener('input', (event) => {
    const speed = parseInt(event.target.value);
    const speedDisplay = document.getElementById('speedValue');
    switch(speed) {
        case 1:
            speedDisplay.textContent = "slowest";
            break;
        case 2:
            speedDisplay.textContent = "slow";
            break;
        case 3:
            speedDisplay.textContent = "moderate";
            break;
        case 4:
            speedDisplay.textContent = "fast";
            break;
        case 5:
            speedDisplay.textContent = "fastest";
            break;
    }
    SideAnimation.setSpeed(speed);
    console.log(`Animation speed set to: ${speed} (step: ${SideAnimation.animationStep})`);
});

canvas.addEventListener('dblclick', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    doubleClicked.x = x;
    doubleClicked.y = y;
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    singleClicked.x = x;
    singleClicked.y = y;
});

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseDragging = true;
    dragStart.x = event.clientX - rect.left;
    dragStart.y = event.clientY - rect.top;
});

canvas.addEventListener('mousemove', (event) => {
    if (!mouseDragging) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    // Update drag start position for next move event
    dragStart.x = currentX;
    dragStart.y = currentY;

    rotateOneAxisWhenDragging(deltaX, Axis.Y, 2);
    // ctrl - Z axis
    if(event.ctrlKey) rotateOneAxisWhenDragging(deltaY, Axis.Z, 4);
    else rotateOneAxisWhenDragging(deltaY, Axis.X, 2);
});

function rotateOneAxisWhenDragging(delta, axis, axisMultipier = 1) {
    const multiplier = Math.abs(delta) > 4 ? 2 :
        Math.abs(delta) >= 1 ? 1 : 0;
    if (delta > 1) rotate.set(axis, -step.get(axis) * multiplier * axisMultipier)
    else if (delta < -1) rotate.set(axis, step.get(axis) * multiplier * axisMultipier)
    else rotate.delete(axis);
}

canvas.addEventListener('mouseup', (event) => {
    if (mouseDragging) {
        mouseDragging = false;
        rotate.clear();
    }
});

canvas.addEventListener('mouseleave', (event) => {
    if (mouseDragging) {
        mouseDragging = false;
        rotate.clear();
    }
});

function logMove(message) {
    const logBox = document.getElementById('moveLogList');
    const option = document.createElement('option');
    option.text = message;
    logBox.add(option);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll to bottom
}

function clearMoveLog() {
    const logBox = document.getElementById('moveLogList');
    while (logBox.options.length > 0) logBox.options.remove(logBox.options.length - 1);
}

document.getElementById('stepByStepCheckbox').addEventListener('change', (event) => {
    setStepByStep(event.target.checked);
});

function setStepByStep(newStepByStep) {
    stepByStep = newStepByStep;
    document.getElementById('revertButton').disabled = !stepByStep;
    console.log(`Step-by-step: ${stepByStep}`);
}

function manualMove(m) {
    movement = m;
    updateSolve(false);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function resizeCanvas() {
    const canvas = document.getElementById('drawing');

    // Minimum size: 100, rectangular
    const availableWidth = Math.max(window.innerWidth * 0.9, 100);
    const availableHeight = Math.max(window.innerHeight * 0.7, 100);
    const size = Math.min(availableWidth, availableHeight)
    canvas.width = size;
    canvas.height = size;
    document.getElementById('moveLogList').style.height = size + 'px';

    forceRefresh = true;
}

drawLoop();

console.log("END (init)");

