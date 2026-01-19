import {Axis, updateStylesFromCSS} from './common.js';
import { canvas, ctx } from './common-dom.js';
import {Movement, SideAnimation} from './cube.js';
import {Scene} from './scene.js';
import {RubikSolver} from "./solver.js";
import {State} from "./state.js";
import {
    planMoves,
    setUIHandlers, shuffleNumber,
    updateSolve
} from "./ui-handlers.js";

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
            updateSolve(false, state);
        } else {
            const solver = new RubikSolver(state.cube, true);
            const solvingMoves = solver.solveLBL();
            planMoves(solvingMoves, state);
            updateSolve(solvingMoves.length > 0, state);
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


function logMove(message) {
    const logBox = document.getElementById('moveLogList');
    const option = document.createElement('option');
    option.text = message;
    logBox.add(option);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll to bottom
}

document.getElementById('stepByStepCheckbox').addEventListener('change', (event) => {
    setStepByStep(event.target.checked);
});

function setStepByStep(newStepByStep) {
    state.stepByStep = newStepByStep;
    document.getElementById('revertButton').disabled = !state.stepByStep;
    console.log(`Step-by-step: ${state.stepByStep}`);
}

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

function processAppParams() {
    if(params.has("moves")) {
        planMoves(Movement.fromText(params.get("moves")), state);
        document.getElementById('textMovements').value =
            params.get("moves")
                .replaceAll("+"," ")
                .replaceAll("%27","\'");
    }
    if(params.has("solve") && params.get("solve") === "1") updateSolve(true, state);
    if(params.has("speed") && params.get("speed") >= "1" && params.get("speed") <= "5") {
        const slider = document.getElementById('speedSlider');
        slider.value = params.get("speed");
        SideAnimation.setSpeed(parseInt(slider.value));
    }

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

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
processAppParams();
setUIHandlers(state);

// Load saved theme on startup
const savedTheme = localStorage.getItem('rubik-theme');
if (savedTheme) {
    setTheme(savedTheme);
    document.getElementById('themeSelector').value = savedTheme;
} else {
    // Initialize cube colors from CSS (for initial theme)
    updateStylesFromCSS();
}

console.log("END (init)");

drawLoop();

// sample URL parameters:
// ?moves=B%20R%27%20B%20L%27%20R%27%20D%27%20L%20R%20F%20R2%20U%27%20B%20D%20F2%20D2%20F%27%20D2%20B%27%20D%27%20L2%20D%27%20B%27%20R%20D%27%20B&solve=1&speed=5
// A sequence found by Claude Code and launched by MCP Server
// http://localhost:8000/rubik.html?speed=1&moves=D%2527%2B2R%2BD%2B2B%2BU%2527%2B2L%2B2B%2B2R%2B2D%2BR%2BB%2527%2BD%2527%2B2F%2BD%2527%2B2L%2BR%2BF%2527&solve=1