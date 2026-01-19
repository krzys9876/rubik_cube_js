import {Axis, MoveDirection, SideType} from "./common.js";
import {FlagController, Task} from "./task.js";
import {Movement, SideAnimation} from "./cube.js";
import { canvas } from './common-dom.js';

function updateSolveUI(newSolve) {
    // Update buttons
    const button = document.getElementById('solveButton');
    button.classList.toggle('solving', newSolve);
    document.querySelectorAll('.side-movement-button').forEach(btn => btn.disabled = newSolve);
}

export function getSlider(axis) {
    switch(axis) {
        case Axis.Y: return document.getElementById('ySlider');
        case Axis.X: return document.getElementById('xSlider');
        case Axis.Z: return document.getElementById('zSlider');
    }
}

export function addRotation(axis, step, state) {
    const slider = getSlider(axis);
    const newValue = parseInt(slider.value) + step;
    slider.value = newValue;
    setRotation(axis, newValue, state);
}

export function setRotation(axis, value, state) {
    state.rotate.set(axis, value);
    setSliderValue(axis, value);
}

function setSliderValue(axis, value) { getSlider(axis).value = value; }

export function clearRotation(state) {
    setRotation(Axis.Y, 0, state);
    setRotation(Axis.X, 0, state);
    setRotation(Axis.Z, 0, state);
}

export function updateSolve(newSolve, state) {
    if(state.updateSolve(newSolve)) updateSolveUI(newSolve);
}

export function planMoves(m, state) {
    state.cube.planMoves(m);
    updateSolve(false, state);
}

export function planMoveTask(m, state) {
    state.tasks.push(new Task(() => planMoves([m], state), () => false, () => state.noMoreMoves()));
}

function clearMoveLog() {
    const logBox = document.getElementById('moveLogList');
    while (logBox.options.length > 0) logBox.options.remove(logBox.options.length - 1);
}

export function startSolving(state) {
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
        updateSolve(true, state);
    }
}

export function shuffleNumber() {
    return parseInt(document.getElementById('shuffleNumber').value);
}

export function setUIHandlers(state) {
    // Rotation sliders
    document.getElementById('ySlider').addEventListener('input', (event) => {
        setRotation(Axis.Y, parseInt(event.target.value), state);
    });
    document.getElementById('xSlider').addEventListener('input', (event) => {
        setRotation(Axis.X, parseInt(event.target.value), state);
    });
    document.getElementById('zSlider').addEventListener('input', (event) => {
        setRotation(Axis.Z, parseInt(event.target.value), state);
    });
    // Movement buttons
    document.getElementById('fButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('f1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.FRONT, MoveDirection.CLOCKWISE), state);
    });
    document.getElementById('bButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.BACK, MoveDirection.CLOCKWISE), state);
    });
    document.getElementById('b1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('rButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE), state);
    });
    document.getElementById('r1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('lButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('l1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.LEFT, MoveDirection.CLOCKWISE), state);
    });
    document.getElementById('uButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.UP, MoveDirection.CLOCKWISE), state);
    });
    document.getElementById('u1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('dButton').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE), state);
    });
    document.getElementById('d1Button').addEventListener('click', () => {
        planMoveTask(new Movement(SideType.DOWN, MoveDirection.CLOCKWISE), state);
    });
    // Key bindings
    document.addEventListener('keydown', (event) => {
        // Keys should work only when canvas is selected so we should skip if any form control is focused
        const activeEl = document.activeElement;
        if (activeEl && activeEl.matches('input, button, select, textarea, [contenteditable]')) return;

        if (event.key === 'ArrowLeft') addRotation(Axis.Y, -1, state);
        if (event.key === 'ArrowRight') addRotation(Axis.Y, 1, state);
        if (event.key === 'ArrowUp') addRotation(Axis.X, 1, state);
        if (event.key === 'ArrowDown') addRotation(Axis.X, -1, state);
        if (event.key === ',') addRotation(Axis.Z, -1, state);
        if (event.key === '.') addRotation(Axis.Z, 1, state);
        if (event.key === " ") clearRotation(state);
        if (event.key === 'q') planMoveTask(new Movement(SideType.UP, MoveDirection.CLOCKWISE), state);
        if (event.key === 'w') planMoveTask(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 'a') planMoveTask(new Movement(SideType.DOWN, MoveDirection.CLOCKWISE), state);
        if (event.key === 's') planMoveTask(new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 'e') planMoveTask(new Movement(SideType.FRONT, MoveDirection.CLOCKWISE), state);
        if (event.key === 'r') planMoveTask(new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 'd') planMoveTask(new Movement(SideType.BACK, MoveDirection.CLOCKWISE), state);
        if (event.key === 'f') planMoveTask(new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 't') planMoveTask(new Movement(SideType.LEFT, MoveDirection.CLOCKWISE), state);
        if (event.key === 'g') planMoveTask(new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 'y') planMoveTask(new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE), state);
        if (event.key === 'h') planMoveTask(new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE), state);
        if (event.key === 'z') state.tasks.push(FlagController.createTask(state.shuffle));
        if (event.key === 'x') if(state.isSolved()) state.tasks.push(
            new Task(() => startSolving(state), () => false, () => state.isSolved()))
        if (event.key === 'c') state.revertLast = true;
    });
    // ActionButtons
    document.getElementById('shuffleButton').addEventListener('click', () => {
        state.tasks.push(FlagController.createTask(state.shuffle));
    });
    document.getElementById('solveButton').addEventListener('click', () => {
        if(state.isSolved()) state.tasks.push(new Task(() => startSolving(state), () => false, () => state.isSolved()));
        else if(state.stepByStep) startSolving(state);
    });
    document.getElementById('revertButton').addEventListener('click', () => {
        state.revertLast = true;
    });
    document.getElementById('resetButton').addEventListener('click', () => {
        state.cube.reset();
        state.forceRefresh = true;
    });
    // Speed slider
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
    // Process batch moves
    document.getElementById('processButton').addEventListener('click', () => {
        const input = document.getElementById('textMovements');
        const text = input.value;
        if(!text) return;

        console.log("Processing: ", text);
        const toProcess = Movement.fromText(text);
        planMoves(toProcess, state);
    });
    // Mouse events
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
        clearRotation(state);
    }
}