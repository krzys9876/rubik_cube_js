import {MoveDirection, SideType, Axis, updateStylesFromCSS} from './common.js';
import { canvas, ctx } from './common-dom.js';
import {Movement, SideAnimation} from './cube.js';
import {Scene} from './scene.js';
import {RubikSolver} from "./solver.js";
import {FlagController, Task} from "./task.js";
import {State} from "./state.js";

console.log("START");

const params = new URLSearchParams(window.location.search);
for(let p of params.entries()) console.log(p);

// Create state
const scene = new Scene();
const state = new State(scene);

// initialize controls
setStepByStep(false);
// Set initial point of view
scene.rotate(-15,30,-5);

function drawLoop() {
    // Let's not redraw the screen if nothing changed
    const isAutoMoving = state.isAutoMoving();
    const clickEvent = state.isClickEvent();
    let shouldRefresh = state.forceRefresh || state.counter === 0 || state.rotate.isActive() ||
        isAutoMoving || clickEvent || state.tasks.length > 0;

    state.startNextTaskIfReady();

    if(state.solve.active && !isAutoMoving) {
        // Let's protect fron infinite solving loop (e.g. when colors are not properly set)
        if(state.currentMoveNo > 500) {
            console.log("Something went wrong, too many moves!");
            updateSolve(false);
        } else {
            const solver = new RubikSolver(state.cube, true);
            const solvingMoves = solver.solveLBL();
            planMoves(solvingMoves);
            updateSolve(solvingMoves.length > 0);
        }
    }

    if(state.shuffle.active && !state.cube.animation.ongoing) {
        state.cube.shuffle(shuffleNumber());
        shouldRefresh = true;
    }

    if(state.revertLast) {
        state.cube.revertOneMove();
        state.revertLast = false;
        shouldRefresh = true;
        if(state.stepByStep) state.runNextStep = true;
    }

    if(shouldRefresh) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        scene.rotate(state.rotate.get(Axis.X), state.rotate.get(Axis.Y), state.rotate.get(Axis.Z));

        state.redrawCube(canvas, ctx);
        if(clickEvent) {
            // Redraw full cube if selection or color changed (this happens only once, we can't redraw only selection)
            if (state.cubeClicked()) state.redrawCube(canvas, ctx);
            state.clearClick();
        }

        if(state.cube.hasPlannedMoves() && !state.cube.animation.ongoing &&
            (!state.solve || !state.stepByStep || state.runNextStep)) {
            state.cube.startMoveSide();
            const code = state.cube.getCurrentMove().toCode();
            console.log("Current move: "+code);
            logMove(`${state.currentMoveNo} ${code}`);
            state.currentMoveNo+=1;
            state.runNextStep = false;
        }

        state.forceRefresh = false;
    }

    state.finalizeActiveTask();

    state.counter ++;
    if(state.counter < 10000000000000) setTimeout(drawLoop, 1000 / 60);
    else console.log("END (drawLoop)");
}

function clearRotation() {
    setRotation(Axis.Y, 0);
    setRotation(Axis.X, 0);
    setRotation(Axis.Z, 0);
}

function setRotation(axis, value) {
    state.rotate.set(axis, value);
    setSliderValue(axis, value);
}

function setSliderValue(axis, value) { getSlider(axis).value = value; }

document.addEventListener('keydown', (event) => {
    // Keys should work only when canvas is selected so we should skip if any form control is focused
    const activeEl = document.activeElement;
    if (activeEl && activeEl.matches('input, button, select, textarea, [contenteditable]')) return;

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
    if (event.key === 'z') state.tasks.push(FlagController.createTask(state.shuffle));
    if (event.key === 'x') if(isSolved()) state.tasks.push(new Task(startSolving, () => false, isSolved))
    if (event.key === 'c') state.revertLast = true;
});

document.getElementById('processButton').addEventListener('click', () => {
    const input = document.getElementById('textMovements');
    const text = input.value;
    if(!text) return;

    console.log("Processing: ", text);
    const toProcess = Movement.fromText(text);
    planMoves(toProcess);
    //input.value='';
});

document.getElementById('shuffleButton').addEventListener('click', () => {
    state.tasks.push(FlagController.createTask(state.shuffle));
});

function shuffleNumber() {
    return parseInt(document.getElementById('shuffleNumber').value);
}

document.getElementById('solveButton').addEventListener('click', () => {
    if(isSolved()) state.tasks.push(new Task(startSolving, () => false, isSolved));
    else if(state.stepByStep) startSolving();
});

document.getElementById('revertButton').addEventListener('click', () => {
    state.revertLast = true;
});

document.getElementById('resetButton').addEventListener('click', () => {
    state.cube.reset();
    state.forceRefresh = true;
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
    if(state.solve.active === newSolve) return;

    if(newSolve) state.solve.start(); else state.solve.stop();
    console.log(`Solve changed to: ${state.solve.active}`);

    // Update buttons
    const button = document.getElementById('solveButton');
    button.classList.toggle('solving', state.solve.active);
    document.querySelectorAll('.side-movement-button').forEach(btn => btn.disabled = state.solve.active);
}

function isSolved() { return !state.solve.active; }

function startSolving() {
    if(state.solve.active && !state.stepByStep) return;
    state.cube.deselectPlanes();
    if(state.cube.isSolved()) {
        console.log("Already solved")
        return;
    }

    state.runNextStep = state.stepByStep; // This is only important when stepByStep is enabled
    if(!state.solve.active) {
        state.currentMoveNo = 1;
        clearMoveLog();
        state.cube.clearHistory();
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
    console.log(`Animation speed set to: ${speed} (step: ${`SideAnimation`.animationStep})`);
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

    state.doubleClicked = { x: x, y: y};
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    state.singleClicked = {x: x, y: y};
});

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseDragging = true;
    state.dragStart = {x: event.clientX - rect.left, y: event.clientY - rect.top};
});

canvas.addEventListener('mousemove', (event) => {
    if (!state.mouseDragging) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const deltaX = currentX - state.dragStart.x;
    const deltaY = currentY - state.dragStart.y;

    // Update drag start position for next move event
    state.dragStart = { x: currentX, y: currentY};

    state.rotate.rotateOneAxisWhenDragging(deltaX, Axis.Y, 2);
    // ctrl - Z axis
    if(event.ctrlKey) state.rotate.rotateOneAxisWhenDragging(deltaY, Axis.Z, 4);
    else state.rotate.rotateOneAxisWhenDragging(deltaY, Axis.X, 2);
});

canvas.addEventListener('mouseup', () => {
    if (state.mouseDragging) stopDragging();
});

canvas.addEventListener('mouseleave', () => {
    if (state.mouseDragging) stopDragging();
});

function stopDragging() {
    state.mouseDragging = false;
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
    state.stepByStep = newStepByStep;
    document.getElementById('revertButton').disabled = !state.stepByStep;
    console.log(`Step-by-step: ${state.stepByStep}`);
}

function planMoveTask(m) {
    state.tasks.push(new Task(() => planMoves([m]), () => false, noMoreMoves));
}
function planMoves(m) {
    state.cube.planMoves(m);
    updateSolve(false);
}

function noMoreMoves() {
    return !state.cube.hasPlannedMoves();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function resizeCanvas() {
    const canvas = document.getElementById('drawing');

    // Minimum size: 100, rectangular
    const availableWidth = Math.max(window.innerWidth * 0.8, 100);
    const availableHeight = Math.max(window.innerHeight * 0.55, 100);
    const size = Math.min(availableWidth, availableHeight)
    canvas.width = size;
    canvas.height = size;
    document.getElementById('moveLogList').style.height = size + 'px';

    state.forceRefresh = true;
}

if(params.has("moves")) {
    planMoves(Movement.fromText(params.get("moves")));
    document.getElementById('textMovements').value =
        params.get("moves")
            .replaceAll("+"," ")
            .replaceAll("%27","\'");
}
if(params.has("solve") && params.get("solve") === "1") updateSolve(true);
if(params.has("speed") && params.get("speed") >= "1" && params.get("speed") <= "5") {
    const slider = document.getElementById('speedSlider');
    slider.value = params.get("speed");
    SideAnimation.setSpeed(parseInt(slider.value));
}

// Theme switching
function setTheme(themeName) {
    const themeLink = document.getElementById('theme-css');
    themeLink.href = `themes/theme-${themeName}.css`;
    localStorage.setItem('rubik-theme', themeName);

    // Update cube colors after CSS loads
    themeLink.onload = () => {
        updateStylesFromCSS();
        state.forceRefresh = true;
    };
}

document.getElementById('themeSelector').addEventListener('change', (event) => {
    setTheme(event.target.value);
});

// Load saved theme on startup
const savedTheme = localStorage.getItem('rubik-theme');
if (savedTheme) {
    setTheme(savedTheme);
    document.getElementById('themeSelector').value = savedTheme;
}

// Initialize cube colors from CSS (for initial theme)
updateStylesFromCSS();

console.log("END (init)");

drawLoop();

// sample URL parameters:
// ?moves=B%20R%27%20B%20L%27%20R%27%20D%27%20L%20R%20F%20R2%20U%27%20B%20D%20F2%20D2%20F%27%20D2%20B%27%20D%27%20L2%20D%27%20B%27%20R%20D%27%20B&solve=1&speed=5
// A sequence found by Claude Code and launched by MCP Server
// http://localhost:8000/rubik.html?speed=1&moves=D%2527%2B2R%2BD%2B2B%2BU%2527%2B2L%2B2B%2B2R%2B2D%2BR%2BB%2527%2BD%2527%2B2F%2BD%2527%2B2L%2BR%2BF%2527&solve=1