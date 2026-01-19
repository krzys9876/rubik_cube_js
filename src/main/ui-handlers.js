import {Axis} from "./common.js";

export function updateSolveUI(newSolve) {
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

export function setUIHandlers(state) {
    document.getElementById('ySlider').addEventListener('input', (event) => {
        setRotation(Axis.Y, parseInt(event.target.value), state);
    });
    document.getElementById('xSlider').addEventListener('input', (event) => {
        setRotation(Axis.X, parseInt(event.target.value), state);
    });
    document.getElementById('zSlider').addEventListener('input', (event) => {
        setRotation(Axis.Z, parseInt(event.target.value), state);
    });
}