import {Style, globalStyle, MoveDirection, SideType, sideAxis, reverseDirection, Axis} from './common.js';
import { canvas, ctx } from './common-dom.js';
import { Point3D, Vector3D } from './geometry.js';
import { Cube, SideAnimation } from './cube.js';
import { Scene, scene } from './scene.js';

console.log("START");

class RubikCube {
    center;
    size;
    styles;
    cubes = [];
    animation;

    constructor(center, size, styles) {
        this.center = center;
        this.size = size;
        this.styles = styles;
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
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,globalStyle],
            [SideType.FRONT, null, null, null, null, null], 0, 0, -1));
        // 2
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle],
            [SideType.FRONT, null, SideType.TOP, null, null, null], 0, 1, -1));
        // 3
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle],
            [SideType.FRONT, null, null, SideType.BOTTOM, null, null], 0, -1, -1));
        // 4
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle],
            [SideType.FRONT, null, null, null, SideType.LEFT, null], -1, 0, -1));
        // 5
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]],
            [SideType.FRONT, null, null, null, null, SideType.RIGHT], 1, 0, -1));
        // 6
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle],
            [SideType.FRONT, null, SideType.TOP, null, SideType.LEFT, null],  -1, 1, -1));
        // 7
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]],
            [SideType.FRONT, null, SideType.TOP, null, null, SideType.RIGHT], 1, 1, -1));
        // 8
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle],
            [SideType.FRONT, null, null, SideType.BOTTOM, SideType.LEFT, null], -1, -1, -1));
        // 9
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]],
            [SideType.FRONT, null, null, SideType.BOTTOM, null, SideType.RIGHT], 1, -1, -1));

        // Back
        // 10
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,globalStyle],
            [null, SideType.BACK, null, null, null, null], 0, 0, 1));
        // 11
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,globalStyle],
            [null, SideType.BACK, SideType.TOP, null, null, null], 0, 1, 1));
        // 12
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,globalStyle],
            [null, SideType.BACK, null, SideType.BOTTOM, null, null], 0, -1, 1));
        // 13
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,this.styles[4],globalStyle],
            [null, SideType.BACK, null, null, SideType.LEFT, null], -1, 0, 1));
        // 14
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,this.styles[5]],
            [null, SideType.BACK, null, null, null, SideType.RIGHT], 1, 0, 1));
        // 15
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,this.styles[4],globalStyle],
            [null, SideType.BACK, SideType.TOP, null, SideType.LEFT, null], -1, 1, 1));
        // 16
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,this.styles[5]],
            [null, SideType.BACK, SideType.TOP, null, null, SideType.RIGHT], 1, 1, 1));
        // 17
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],this.styles[4],globalStyle],
            [null, SideType.BACK, null, SideType.BOTTOM, SideType.LEFT, null], -1, -1, 1));
        // 18
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,this.styles[5]],
            [null, SideType.BACK, null, SideType.BOTTOM, null, SideType.RIGHT], 1, -1, 1));

        // Top
        // 19
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle],
            [null, null, SideType.TOP, null, null, null], 0, 1, 0));
        // 20
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle],
            [null, null, SideType.TOP, null, SideType.LEFT, null], -1, 1, 0));
        // 21
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]],
            [null, null, SideType.TOP, null, null, SideType.RIGHT], 1, 1, 0));

        // Bottom
        // 22
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle],
            [null, null, null, SideType.BOTTOM, null, null], 0, -1, 0));
        // 23
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle],
            [null, null, null, SideType.BOTTOM, SideType.LEFT, null], -1, -1, 0));
        // 24
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]],
            [null, null, null, SideType.BOTTOM, null, SideType.RIGHT], 1, -1, 0));

        // Left
        // 25
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle],
            [null, null, null, null, SideType.LEFT, null], -1, 0, 0));

        // Right
        // 26
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]],
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
            case SideType.TOP: return this.cubes.filter(cube => cube.metadata.coords.y === 1);
            case SideType.BOTTOM: return this.cubes.filter(cube => cube.metadata.coords.y === -1);
            case SideType.FRONT: return this.cubes.filter(cube => cube.metadata.coords.z === -1);
            case SideType.BACK: return this.cubes.filter(cube => cube.metadata.coords.z === 1);
            case SideType.LEFT: return this.cubes.filter(cube => cube.metadata.coords.x === -1);
            case SideType.RIGHT: return this.cubes.filter(cube => cube.metadata.coords.x === 1);
        }
    }

    #rotationCenter(side) {
        switch(side) {
            case SideType.TOP: return this.center.clone().moveBy(new Vector3D(0, this.size / 3, 0));
            case SideType.BOTTOM: return this.center.clone().moveBy(new Vector3D(0, -this.size / 3, 0));
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
        if(side === SideType.TOP || side === SideType.BOTTOM) coordsDirection = direction;
        for (let c of this.#sideCubes(side)) c.rotateSide(side, coordsDirection);

    }

    shuffle(moves) {
        const sides = [SideType.FRONT, SideType.BACK, SideType.TOP, SideType.BOTTOM, SideType.LEFT, SideType.RIGHT];
        for(let i = 0; i < moves; i++) {
            const sideIndex = Math.round(Math.random() * sides.length) % sides.length;
            const side = sides[sideIndex];
            const direction = (Math.random() > 0.5) ? MoveDirection.CLOCKWISE : MoveDirection.COUNTERCLOCKWISE;
            this.#moveSide(side, direction, 90);
            this.#finishMoveSide(side, direction);
        }
    }
}

const redStyle = new Style('black', 'black', 'red');
const yellowStyle = new Style('black', 'black', 'yellow');
const blueStyle = new Style('black', 'black', 'blue');
const whiteStyle = new Style('black', 'black', 'white');
const greenStyle = new Style('black', 'black', 'green');
const orangeStyle = new Style('black', 'black', 'orange');

const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,-Point3D.focalLength);

let cubeCenter = rotationCenter.clone().moveBy(new Vector3D(-0.2, 0.3, 0));

let cube = new RubikCube(cubeCenter, 1, [greenStyle, blueStyle, yellowStyle, whiteStyle, orangeStyle, redStyle]);

let counter = 0;

const step = new Map([[Axis.X, 3 / 5], [Axis.Y, 3 / 5], [Axis.Z, 3 / 5]]);

const rotate = new Map();

let moveSide = null;
let moveDirection = null;

let globalKeyDown = false;

let shuffle = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') rotate.set(Axis.Y, step.get(Axis.Y));
    if (event.key === 'ArrowRight') rotate.set(Axis.Y, -step.get(Axis.Y));
    if (event.key === 'ArrowUp') rotate.set(Axis.X, step.get(Axis.X));
    if (event.key === 'ArrowDown') rotate.set(Axis.X, -step.get(Axis.X));
    if (event.key === ',') rotate.set(Axis.Z, step.get(Axis.Z));
    if (event.key === '.') rotate.set(Axis.Z, -step.get(Axis.Z));
    if (event.key === 'q') { moveSide = SideType.TOP; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 'w') { moveSide = SideType.TOP; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
    if (event.key === 'a') { moveSide = SideType.BOTTOM; moveDirection = MoveDirection.CLOCKWISE; }
    if (event.key === 's') { moveSide = SideType.BOTTOM; moveDirection = MoveDirection.COUNTERCLOCKWISE; }
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

function drawLoop() {
    if(counter === 0 || moveSide !== null || moveDirection !== null ||
        cube.animation.ongoing || rotate.size > 0 || shuffle) {
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
    }

    counter ++;
    if(counter < 10000000000000) setTimeout(drawLoop, 1000 / 60);
    else console.log("END (drawLoop)");
}

drawLoop();

console.log("END (init)");
