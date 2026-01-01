import {
    globalStyle,
    MoveDirection,
    SideType,
    sideAxis,
    reverseDirection,
    Axis, sideStyles
} from './common.js';
import { canvas, ctx } from './common-dom.js';
import { Point3D, Vector3D } from './geometry.js';
import { Cube, SideAnimation, Movement } from './cube.js';
import { Scene, scene } from './scene.js';

console.log("START");

class RubikCube {
    center;
    size;
    cubes = [];
    animation;

    constructor(center, size) {
        this.center = center;
        this.size = size;
        this.cubes = this.#generateCubes();
        this.animation = new SideAnimation();
    }

    #generateCubes() {
        let generated = [];
        let singleCubeSize = this.size / 3;

        // 0
        generated.push(Cube.generate(this.center,
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,globalStyle],
            [null, null, null, null, null, null], 0, 0, 0));
        // Front
        // 1
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,globalStyle,globalStyle,globalStyle],
            [SideType.FRONT, null, null, null, null, null], 0, 0, -1));
        // 2
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,sideStyles.get(SideType.UP),globalStyle,globalStyle,globalStyle],
            [SideType.FRONT, null, SideType.UP, null, null, null], 0, 1, -1));
        // 3
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,sideStyles.get(SideType.DOWN),globalStyle,globalStyle],
            [SideType.FRONT, null, null, SideType.DOWN, null, null], 0, -1, -1));
        // 4
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [SideType.FRONT, null, null, null, SideType.LEFT, null], -1, 0, -1));
        // 5
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [SideType.FRONT, null, null, null, null, SideType.RIGHT], 1, 0, -1));
        // 6
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,sideStyles.get(SideType.UP),globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [SideType.FRONT, null, SideType.UP, null, SideType.LEFT, null],  -1, 1, -1));
        // 7
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,sideStyles.get(SideType.UP),globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [SideType.FRONT, null, SideType.UP, null, null, SideType.RIGHT], 1, 1, -1));
        // 8
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,sideStyles.get(SideType.DOWN),sideStyles.get(SideType.LEFT),globalStyle],
            [SideType.FRONT, null, null, SideType.DOWN, SideType.LEFT, null], -1, -1, -1));
        // 9
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [sideStyles.get(SideType.FRONT),globalStyle,globalStyle,sideStyles.get(SideType.DOWN),globalStyle,sideStyles.get(SideType.RIGHT)],
            [SideType.FRONT, null, null, SideType.DOWN, null, SideType.RIGHT], 1, -1, -1));

        // Back
        // 10
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,globalStyle,globalStyle,globalStyle],
            [null, SideType.BACK, null, null, null, null], 0, 0, 1));
        // 11
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),sideStyles.get(SideType.UP),globalStyle,globalStyle,globalStyle],
            [null, SideType.BACK, SideType.UP, null, null, null], 0, 1, 1));
        // 12
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,sideStyles.get(SideType.DOWN),globalStyle,globalStyle],
            [null, SideType.BACK, null, SideType.DOWN, null, null], 0, -1, 1));
        // 13
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [null, SideType.BACK, null, null, SideType.LEFT, null], -1, 0, 1));
        // 14
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, SideType.BACK, null, null, null, SideType.RIGHT], 1, 0, 1));
        // 15
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),sideStyles.get(SideType.UP),globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [null, SideType.BACK, SideType.UP, null, SideType.LEFT, null], -1, 1, 1));
        // 16
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),sideStyles.get(SideType.UP),globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, SideType.BACK, SideType.UP, null, null, SideType.RIGHT], 1, 1, 1));
        // 17
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,sideStyles.get(SideType.DOWN),sideStyles.get(SideType.LEFT),globalStyle],
            [null, SideType.BACK, null, SideType.DOWN, SideType.LEFT, null], -1, -1, 1));
        // 18
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,sideStyles.get(SideType.BACK),globalStyle,sideStyles.get(SideType.DOWN),globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, SideType.BACK, null, SideType.DOWN, null, SideType.RIGHT], 1, -1, 1));

        // Up
        // 19
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,sideStyles.get(SideType.UP),globalStyle,globalStyle,globalStyle],
            [null, null, SideType.UP, null, null, null], 0, 1, 0));
        // 20
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,sideStyles.get(SideType.UP),globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [null, null, SideType.UP, null, SideType.LEFT, null], -1, 1, 0));
        // 21
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,sideStyles.get(SideType.UP),globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, null, SideType.UP, null, null, SideType.RIGHT], 1, 1, 0));

        // Down
        // 22
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.DOWN),globalStyle,globalStyle],
            [null, null, null, SideType.DOWN, null, null], 0, -1, 0));
        // 23
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.DOWN),sideStyles.get(SideType.LEFT),globalStyle],
            [null, null, null, SideType.DOWN, SideType.LEFT, null], -1, -1, 0));
        // 24
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.DOWN),globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, null, null, SideType.DOWN, null, SideType.RIGHT], 1, -1, 0));

        // Left
        // 25
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.LEFT),globalStyle],
            [null, null, null, null, SideType.LEFT, null], -1, 0, 0));

        // Right
        // 26
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,sideStyles.get(SideType.RIGHT)],
            [null, null, null, null, null, SideType.RIGHT], 1, 0, 0));

        return generated;
    }

    rotate(matrix, center, reverse = false) {
        for (let cube of this.cubes) cube.rotate(matrix, center, false, reverse)
    }

    draw(observer, rotationCenter) {
        this.animate();

        this.rotate(scene.rotationMatrix, rotationCenter, false);
        // Draw all cubes' planes instead of drawing cubes. We must sort planes anyway in order to properly render image.
        let allPlanes = [];
        for (let cube of this.cubes) {
            for (let plane of cube.planes) {
                allPlanes.push(plane);
            }
        }
        allPlanes.sort((a, b) => {
            let distA = Vector3D.fromPoints(observer, a.center).length();
            let distB = Vector3D.fromPoints(observer, b.center).length();
            return distB - distA;
        });

        for (let plane of allPlanes) {
            plane.project(observer).draw(false, true, true);
        }

        this.rotate(scene.rotationMatrix, rotationCenter, true);
    }

    #sideCubes(side) {
        switch(side) {
            case SideType.UP: return this.cubes.filter(cube => cube.metadata.coords.y === 1);
            case SideType.DOWN: return this.cubes.filter(cube => cube.metadata.coords.y === -1);
            case SideType.FRONT: return this.cubes.filter(cube => cube.metadata.coords.z === -1);
            case SideType.BACK: return this.cubes.filter(cube => cube.metadata.coords.z === 1);
            case SideType.LEFT: return this.cubes.filter(cube => cube.metadata.coords.x === -1);
            case SideType.RIGHT: return this.cubes.filter(cube => cube.metadata.coords.x === 1);
        }
    }

    #rotationCenter(side) {
        switch(side) {
            case SideType.UP: return this.center.clone().moveBy(new Vector3D(0, this.size / 3, 0));
            case SideType.DOWN: return this.center.clone().moveBy(new Vector3D(0, -this.size / 3, 0));
            case SideType.FRONT: return this.center.clone().moveBy(new Vector3D(0, 0, -this.size / 3));
            case SideType.BACK: return this.center.clone().moveBy(new Vector3D(0, 0, this.size / 3));
            case SideType.LEFT: return this.center.clone().moveBy(new Vector3D(-this.size / 3, 0, 0));
            case SideType.RIGHT: return this.center.clone().moveBy(new Vector3D(this.size / 3, 0, 0));
        }
    }

    startMoveSide(side, direction) {
        this.animation.start(side, direction);
    }

    animate() {
        if(!this.animation.ongoing) return;

        const side = this.animation.side;
        const direction = this.animation.direction;

        this.#moveSide(side, direction, SideAnimation.step);

        this.animation.continue();
        if(!this.animation.ongoing) {
            // Conclude animation - update cubes' coords
            this.#finishMoveSide(side, direction);
        }
    }

    #moveSide(side, direction, angleDeg) {
        const counterClockwiseFlag = direction === MoveDirection.COUNTERCLOCKWISE;
        const matrix = Scene.rotationMatrix(sideAxis.get(side), angleDeg * Scene.deg2rad);
        for (let c of this.#sideCubes(side)) c.rotate(matrix, this.#rotationCenter(side), true, counterClockwiseFlag);

    }

    #finishMoveSide(side, direction) {
        let coordsDirection = reverseDirection(direction);
        if(side === SideType.UP || side === SideType.DOWN) coordsDirection = direction;
        for (let c of this.#sideCubes(side)) c.rotateSide(side, coordsDirection);

    }

    shuffle(moves) {
        for(let i = 0; i < moves; i++) {
            const movement = Movement.random();
            this.#moveSide(movement.side, movement.direction, 90);
            this.#finishMoveSide(movement.side, movement.direction);
        }
    }
}

const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,-Point3D.focalLength);

let cubeCenter = rotationCenter.clone().moveBy(new Vector3D(-0.2, 0.3, 0));

let cube = new RubikCube(cubeCenter, 1);

let counter = 0;

const step = new Map([[Axis.X, 3 / 5], [Axis.Y, 3 / 5], [Axis.Z, 3 / 5]]);

const rotate = new Map();

let moveSide = null;
let moveDirection = null;

let globalKeyDown = false;

let shuffle = false;

document.addEventListener('keydown', (event) => {
    if (document.activeElement.id === 'textMovements') return;

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

    globalKeyDown = true;
});

document.addEventListener('keyup', (event) => {
    if (document.activeElement.id === 'textMovements') return;

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

function drawLoop() {
    if(counter === 0 || moveSide !== null || moveDirection !== null ||
        cube.animation.ongoing || rotate.size > 0 || shuffle || movements.length > 0) {
        if(shuffle) {
            cube.shuffle(1);
            shuffle = false;
        }

        ctx.fillStyle = bkStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        scene.rotate(
            rotate.has(Axis.X) ? rotate.get(Axis.X) : 0,
            rotate.has(Axis.Y) ? rotate.get(Axis.Y) : 0,
            rotate.has(Axis.Z) ? rotate.get(Axis.Z) : 0);

        cube.draw(observer, rotationCenter);

        if(moveSide !== null && moveDirection !== null) {
            cube.startMoveSide(moveSide, moveDirection);
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

drawLoop();

console.log("END (init)");
