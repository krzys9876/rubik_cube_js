import { MoveDirection, SideType, Axis } from './common.js';
import { canvas, ctx } from './common-dom.js';
import { Point3D, Vector3D } from './geometry.js';
import {Movement, RubikCube, SideAnimation} from './cube.js';
import { scene } from './scene.js';
import {RubikSolver} from "./solver.js";

console.log("START");

const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,-Point3D.focalLength);
const cubeCenter = rotationCenter.clone().moveBy(new Vector3D(0, 0, 0));

const cube = new RubikCube(cubeCenter, 1);

let counter = 0;

const step = new Map([[Axis.X, 3 / 5], [Axis.Y, 3 / 5], [Axis.Z, 3 / 5]]);

const rotate = new Map();

let moveSide = null;
let moveDirection = null;

let globalKeyDown = false;

let shuffle = false;

let solve = false;

document.addEventListener('keydown', (event) => {
    if (document.activeElement.id === 'textMovements' ||
        document.activeElement.id === 'speedSlider') return;

    if (event.key === 'ArrowLeft') rotate.set(Axis.Y, step.get(Axis.Y));
    if (event.key === 'ArrowRight') rotate.set(Axis.Y, -step.get(Axis.Y));
    if (event.key === 'ArrowUp') rotate.set(Axis.X, step.get(Axis.X));
    if (event.key === 'ArrowDown') rotate.set(Axis.X, -step.get(Axis.X));
    if (event.key === ',') rotate.set(Axis.Z, step.get(Axis.Z));
    if (event.key === '.') rotate.set(Axis.Z, -step.get(Axis.Z));
    if (event.key === 'q') { moveSide = SideType.UP; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'w') { moveSide = SideType.UP; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'a') { moveSide = SideType.DOWN; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 's') { moveSide = SideType.DOWN; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'e') { moveSide = SideType.FRONT; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'r') { moveSide = SideType.FRONT; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'd') { moveSide = SideType.BACK; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'f') { moveSide = SideType.BACK; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 't') { moveSide = SideType.LEFT; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'g') { moveSide = SideType.LEFT; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'y') { moveSide = SideType.RIGHT; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'h') { moveSide = SideType.RIGHT; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'z') shuffle = true;
    if (event.key === 'x') startSolving();

    globalKeyDown = true;
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

    globalKeyDown = false;
});

const bkStyle = 'lightgray';

const movements = []
let currentMoveNo = 1;
// Set initial point of view
scene.rotate(-15,30,-5);

function drawLoop() {
    // Let's not redraw the screen if nothing changed
    let isAutoMoving = movements.length > 0 || cube.animation.ongoing || moveSide !== null || moveDirection !== null ;
    let shouldRefresh = counter === 0 || rotate.size > 0 || isAutoMoving;

    if(solve && !isAutoMoving) {
        const solver = new RubikSolver(cube);
        const solvingMoves = solver.solveLBL();
        solvingMoves.forEach(m => movements.push(m));
        solve = solvingMoves.length > 0; // uninterrupted solving
        // solve = false; // step-by-step solving
        shouldRefresh = true;
    }

    if(shuffle) {
        cube.shuffle(1);
        shuffle = false;
        shouldRefresh = true;
    }

    if(shouldRefresh) {
        ctx.fillStyle = bkStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        scene.rotate(
            rotate.has(Axis.X) ? rotate.get(Axis.X) : 0,
            rotate.has(Axis.Y) ? rotate.get(Axis.Y) : 0,
            rotate.has(Axis.Z) ? rotate.get(Axis.Z) : 0);

        cube.draw(observer, rotationCenter);

        if(moveSide !== null && moveDirection !== null) {
            const movement = new Movement(moveSide, moveDirection);
            const code = movement.toCode();
            cube.startMoveSide(movement);
            console.log("Current move: "+code);
            logMove(`${currentMoveNo} ${code}`);
            currentMoveNo+=1;
            moveSide = null;
            moveDirection = null;
        }

        if(movements.length > 0 && !cube.animation.ongoing) {
            moveSide = movements[0].side;
            moveDirection = movements[0].direction;
            movements.splice(0, 1);
        }
    }

    counter ++;
    if(counter < 10000000000000) setTimeout(drawLoop, 1000 / 60);
    else console.log("END (drawLoop)");
}

document.getElementById('processButton').addEventListener('click', () => {
    const input = document.getElementById('textMovements');
    const text = input.value;
    if(!text) return;

    const codes = text.split(" ");

    console.log("Processing: ", codes);

    codes.forEach(code => {
        const movement = Movement.from(code);
        if (movement) movements.push(Movement.from(code));
    });

    input.value='';
});

document.getElementById('shuffleButton').addEventListener('click', () => {
    const input = document.getElementById('shuffleNumber');
    const moves = parseInt(input.value);

    console.log("Shuffling moves: ", moves);

    cube.shuffle(moves - 1);
    shuffle = true;
});

document.getElementById('solveButton').addEventListener('click', () => {
    console.log("Start solving");
    startSolving();
});

function startSolving() {
    if(solve) return;

    solve = true;
    currentMoveNo = 1;
    const logBox = document.getElementById('moveLogText');
    logBox.value = '';
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

function logMove(message) {
    const logBox = document.getElementById('moveLogText');
    logBox.value += message + '\n';
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll to bottom
}

drawLoop();

console.log("END (init)");

