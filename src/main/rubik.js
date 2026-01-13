import {MoveDirection, SideType, Axis} from './common.js';
import { canvas, ctx } from './common-dom.js';
import {Point3D, Vector3D} from './geometry.js';
import {Movement, Rotation, RubikCube, SideAnimation} from './cube.js';
import { scene } from './scene.js';
import {RubikSolver} from "./solver.js";

console.log("START");

class Task {
    startCall;
    stopCall;
    endCall;
    running = false;
    constructor(startCall, stopCall, endCall) {
        this.startCall = startCall;
        this.stopCall = stopCall;
        this.endCall = endCall;
    }

    start() {
        this.running = true;
        this.startCall();
    }

    stop() {
        this.stopCall();
    }

    tryEnd() {
        if(this.endCall()) this.running = false;
    }
}

class FlagController {
    active = false;
    start() { this.active = true; }
    stop() { this.active = false; }
    end() { return !this.active; }

    static createTask(flag) {
        return new Task(flag.start.bind(flag), flag.stop.bind(flag), flag.end.bind(flag));
    }
}

const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,-Point3D.focalLength);
const cubeCenter = rotationCenter.clone().moveBy(new Vector3D(0, 0, 0));

const cube = new RubikCube(cubeCenter, 1.6);

let counter = 0;

const shuffle = new FlagController();
const solve = new FlagController();

const rotate = new Rotation(9);

function clearRotation() {
    setRotation(Axis.Y, 0);
    setRotation(Axis.X, 0);
    setRotation(Axis.Z, 0);
}

function setRotation(axis, value) {
    rotate.set(axis, value);
    setSliderValue(axis, value);
}

function setSliderValue(axis, value) { getSlider(axis).value = value; }

let stepByStep;
setStepByStep(false);
let runNextStep = false;
let revertLast = false;
let doubleClicked = {x: -1, y: -1};
let singleClicked = {x: -1, y: -1};
let dragStart = {x: -1, y: -1}
let mouseDragging = false;
let forceRefresh = false;

const tasks = [];

const bkStyle = 'lightgray';

let currentMoveNo = 1;
// Set initial point of view
scene.rotate(-15,30,-5);

function drawLoop() {
    // Let's not redraw the screen if nothing changed
    let isAutoMoving = cube.hasPlannedMoves() || cube.animation.ongoing;
    let clickEvent = doubleClicked.x > -1 || singleClicked.x > -1;
    let shouldRefresh = forceRefresh || counter === 0 || rotate.isActive() || isAutoMoving || clickEvent || tasks.length > 0;

    if(tasks.length > 0 && !tasks[0].running) tasks[0].start();

    if(solve.active && !isAutoMoving) {
        // Let's protect fron infinite solving loop (e.g. when colors are not properly set)
        if(currentMoveNo > 500) {
            console.log("Something went wrong, too many moves!");
            updateSolve(false);
        } else {
            const solver = new RubikSolver(cube, true);
            const solvingMoves = solver.solveLBL();
            planMoves(solvingMoves);
            //cube.planMoves(solvingMoves);
            updateSolve(solvingMoves.length > 0);
            //shouldRefresh = true;
        }
    }

    if(shuffle.active && !cube.animation.ongoing) {
        cube.shuffle(shuffleNumber());
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

        scene.rotate(rotate.get(Axis.X), rotate.get(Axis.Y), rotate.get(Axis.Z));

        cube.draw(canvas, ctx, observer, rotationCenter);
        if(clickEvent) {
            // Redraw full cube if selection or color changed (this happens only once, we can't redraw only selection)
            if (cube.analyzeSelection(doubleClicked, singleClicked)) cube.draw(canvas, ctx, observer, rotationCenter);
            doubleClicked.x = -1;
            doubleClicked.y = -1;
            singleClicked.x = -1;
            singleClicked.y = -1;
        }

        if(cube.hasPlannedMoves() && !cube.animation.ongoing &&
            (!solve || !stepByStep || runNextStep)) {
            cube.startMoveSide();
            const code = cube.getCurrentMove().toCode();
            console.log("Current move: "+code);
            logMove(`${currentMoveNo} ${code}`);
            currentMoveNo+=1;
            runNextStep = false;
        }

        forceRefresh = false;
    }

    if(tasks.length > 0) {
        tasks[0].stop();
        tasks[0].tryEnd();
        if(!tasks[0].running) tasks.splice(0, 1);
    }

    counter ++;
    if(counter < 10000000000000) setTimeout(drawLoop, 1000 / 60);
    else console.log("END (drawLoop)");
}

document.addEventListener('keydown', (event) => {
    if (document.activeElement.id === 'textMovements' ||
        document.activeElement.id === 'speedSlider' ||
        document.activeElement.id === 'ySlider' ||
        document.activeElement.id === 'xSlider' ||
        document.activeElement.id === 'zSlider') return;

    if (event.key === 'ArrowLeft') addRotation(Axis.Y, -1);
    if (event.key === 'ArrowRight') addRotation(Axis.Y, 1);
    if (event.key === 'ArrowUp') addRotation(Axis.X, 1);
    if (event.key === 'ArrowDown') addRotation(Axis.X, -1);
    if (event.key === ',') addRotation(Axis.Z, -1);
    if (event.key === '.') addRotation(Axis.Z, 1);
    if (event.key === " ") clearRotation();
    if (event.key === 'q') planMoveTask(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
    if (event.key === 'w') planMoveTask(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 'a') planMoveTask(new Movement(SideType.DOWN, MoveDirection.CLOCKWISE));
    if (event.key === 's') planMoveTask(new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 'e') planMoveTask(new Movement(SideType.FRONT, MoveDirection.CLOCKWISE));
    if (event.key === 'r') planMoveTask(new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 'd') planMoveTask(new Movement(SideType.BACK, MoveDirection.CLOCKWISE));
    if (event.key === 'f') planMoveTask(new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 't') planMoveTask(new Movement(SideType.LEFT, MoveDirection.CLOCKWISE));
    if (event.key === 'g') planMoveTask(new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 'y') planMoveTask(new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE));
    if (event.key === 'h') planMoveTask(new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE));
    if (event.key === 'z') tasks.push(FlagController.createTask(shuffle));
    if (event.key === 'x') if(isSolved()) tasks.push(new Task(startSolving, () => false, isSolved))
    if (event.key === 'c') revertLast = true;
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
    tasks.push(FlagController.createTask(shuffle));
});

function shuffleNumber() {
    return parseInt(document.getElementById('shuffleNumber').value);
}

document.getElementById('solveButton').addEventListener('click', () => {
    if(isSolved()) tasks.push(new Task(startSolving, () => false, isSolved))
});

document.getElementById('revertButton').addEventListener('click', () => {
    revertLast = true;
});

document.getElementById('resetButton').addEventListener('click', () => {
    cube.reset();
    forceRefresh = true;
});

document.getElementById('fButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('f1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.FRONT, MoveDirection.CLOCKWISE));
});
document.getElementById('bButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.BACK, MoveDirection.CLOCKWISE));
});
document.getElementById('b1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('rButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE));
});
document.getElementById('r1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('lButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('l1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.LEFT, MoveDirection.CLOCKWISE));
});
document.getElementById('uButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
});
document.getElementById('u1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('dButton').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE));
});
document.getElementById('d1Button').addEventListener('click', () => {
    planMoveTask(new Movement(SideType.DOWN, MoveDirection.CLOCKWISE));
});

function updateSolve(newSolve) {
    if(solve.active === newSolve) return;

    if(newSolve) solve.start(); else solve.stop();
    console.log(`Solve changed to: ${solve.active}`);

    // Update buttons
    const button = document.getElementById('solveButton');
    button.classList.toggle('solving', solve.active);
    document.querySelectorAll('.side-movement-button').forEach(btn => btn.disabled = solve.active);
}

function isSolved() { return !solve.active; }

function startSolving() {
    if(solve.active && !stepByStep) return;
    cube.deselectPlanes();
    if(cube.isSolved()) {
        console.log("Already solved")
        return;
    }

    runNextStep = stepByStep; // This is only important when stepByStep is enabled
    if(!solve.active) {
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

document.getElementById('ySlider').addEventListener('input', (event) => {
    setRotation(Axis.Y, parseInt(event.target.value));
});
document.getElementById('xSlider').addEventListener('input', (event) => {
    setRotation(Axis.X, parseInt(event.target.value));
});
document.getElementById('zSlider').addEventListener('input', (event) => {
    setRotation(Axis.Z, parseInt(event.target.value));
});

function addRotation(axis, step) {
    const slider = getSlider(axis);
    const newValue = parseInt(slider.value) + step;
    slider.value = newValue;
    setRotation(axis, newValue);
}

function getSlider(axis) {
    switch(axis) {
        case Axis.Y: return document.getElementById('ySlider');
        case Axis.X: return document.getElementById('xSlider');
        case Axis.Z: return document.getElementById('zSlider');
    }
}

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

    rotate.rotateOneAxisWhenDragging(deltaX, Axis.Y, 2);
    // ctrl - Z axis
    if(event.ctrlKey) rotate.rotateOneAxisWhenDragging(deltaY, Axis.Z, 4);
    else rotate.rotateOneAxisWhenDragging(deltaY, Axis.X, 2);
});

canvas.addEventListener('mouseup', () => {
    if (mouseDragging) stopDragging();
});

canvas.addEventListener('mouseleave', () => {
    if (mouseDragging) stopDragging();
});

function stopDragging() {
    mouseDragging = false;
    clearRotation();
}

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

function planMoveTask(m) {
    tasks.push(new Task(() => planMoves([m]), () => false, noMoreMoves));
}
function planMoves(m) {
    cube.planMoves(m);
    updateSolve(false);
}

function noMoreMoves() {
    return !cube.hasPlannedMoves();
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