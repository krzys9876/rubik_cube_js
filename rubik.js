import { Style, canvas, ctx, globalStyle } from './common.js';
import { Point3D, Vector3D } from './geometry.js';
import { Cube } from './cube.js';
import { Scene, scene } from './scene.js';

console.log("START");

class RubikCube {
    center;
    size;
    styles;
    cubes = [];

    constructor(center, size, styles) {
        this.center = center;
        this.size = size;
        this.styles = styles;
        this.cubes = this.#generateCubes();
    }

    #generateCubes() {
        let generated = [];
        let singleCubeSize = this.size / 3;

        // 0
        generated.push(Cube.generate(this.center,
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,globalStyle], 0, 0, 0));
        // Front
        // 1
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,globalStyle], 0, 0, -1));
        // 2
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle], 0, 1, -1));
        // 3
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle], 0, -1, -1));
        // 4
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle], -1, 0, -1));
        // 5
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]], 1, 0, -1));
        // 6
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle], -1, 1, -1));
        // 7
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]], 1, 1, -1));
        // 8
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle], -1, -1, -1));
        // 9
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]], 1, -1, -1));

        // Back
        // 10
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,globalStyle], 0, 0, 1));
        // 11
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,globalStyle], 0, 1, 1));
        // 12
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,globalStyle], 0, -1, 1));
        // 13
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,this.styles[4],globalStyle], -1, 0, 1));
        // 14
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,this.styles[5]], 1, 0, 1));
        // 15
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,this.styles[4],globalStyle], -1, 1, 1));
        // 16
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,this.styles[5]], 1, 1, 1));
        // 17
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],this.styles[4],globalStyle], -1, -1, 1));
        // 18
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,this.styles[5]], 1, -1, 1));

        // Top
        // 19
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle], 0, 1, 0));
        // 20
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle], -1, 1, 0));
        // 21
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]], 1, 1, 0));

        // Bottom
        // 22
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle], 0, -1, 0));
        // 23
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle], -1, -1, 0));
        // 24
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]], 1, -1, 0));

        // Left
        // 25
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle], -1, 0, 0));

        // Right
        // 26
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]], 1, 0, 0));

        return generated;
    }

    rotate(angleX, angleY, angleZ, center, reverse) {
        for (let cube of this.cubes) cube.rotate(angleX, angleY, angleZ, center, reverse)
    }

    rotate(matrix, center, reverse = false) {
        for (let cube of this.cubes) cube.rotate(matrix, center, reverse)
    }

    draw(observer) {
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
    }

    //TODO: change coordinates when moving sides
    topSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.y === 1); }
    bottomSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.y === -1); }
    frontSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.z === -1); }
    backSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.z === 1); }
    leftSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.x === -1); }
    rightSideCubes() { return this.cubes.filter(cube => cube.metadata.coords.x === 1); }

    moveTop(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(0, this.size / 3, 0));
        let rotationMatrix = Scene.rotationMatrixY(90 * Scene.deg2rad);
        this.#moveSide(this.topSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    moveBottom(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(0, -this.size / 3, 0));
        let rotationMatrix = Scene.rotationMatrixY(90 * Scene.deg2rad);
        this.#moveSide(this.bottomSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    moveFront(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(0, 0, -this.size / 3));
        let rotationMatrix = Scene.rotationMatrixZ(90 * Scene.deg2rad);
        this.#moveSide(this.frontSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    moveBack(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(0, 0, -this.size / 3));
        let rotationMatrix = Scene.rotationMatrixZ(90 * Scene.deg2rad);
        this.#moveSide(this.backSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    moveLeft(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(-this.size / 3, 0, 0));
        let rotationMatrix = Scene.rotationMatrixX(90 * Scene.deg2rad);
        this.#moveSide(this.leftSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    moveRight(counterClockwise) {
        let rotationCenter = this.center.clone().moveBy(new Vector3D(this.size / 3, 0, 0));
        let rotationMatrix = Scene.rotationMatrixX(90 * Scene.deg2rad);
        this.#moveSide(this.rightSideCubes(), rotationMatrix, rotationCenter, counterClockwise);
    }

    #moveSide(sideCubes, matrix, center, counterClockwise) {
        for (let c of sideCubes) {
            c.rotate(matrix, center, counterClockwise);
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

let cube = new RubikCube(cubeCenter, 1, [redStyle, yellowStyle, blueStyle, whiteStyle, greenStyle, orangeStyle]);

let counter = 0;
const stepZ = 3 / 5;
const stepX = 3 / 5;
const stepY = 3 / 5;

let rotateZ = 0;
let rotateX = 0;
let rotateY = 0;
let moveTop = 0;
let moveBottom = 0;
let moveFront = 0;
let moveBack = 0;
let moveLeft = 0;
let moveRight = 0;

let globalKeyDown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') rotateY = stepY;
    if (event.key === 'ArrowRight') rotateY = -stepY;
    if (event.key === 'ArrowUp') rotateX = stepX;
    if (event.key === 'ArrowDown') rotateX = -stepX;
    if (event.key === ',') rotateZ = stepZ;
    if (event.key === '.') rotateZ = -stepZ;
    if (event.key === 'q') moveTop = -1;
    if (event.key === 'w') moveTop = 1;
    if (event.key === 'a') moveBottom = -1;
    if (event.key === 's') moveBottom = 1;
    if (event.key === 'e') moveFront = -1;
    if (event.key === 'r') moveFront = 1;
    if (event.key === 'd') moveBack = -1;
    if (event.key === 'f') moveBack = 1;
    if (event.key === 't') moveLeft = -1;
    if (event.key === 'g') moveLeft = 1;
    if (event.key === 'y') moveRight = -1;
    if (event.key === 'h') moveRight = 1;

    globalKeyDown = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') rotateY = 0;
    if (event.key === 'ArrowRight') rotateY = 0;
    if (event.key === 'ArrowUp') rotateX = 0;
    if (event.key === 'ArrowDown') rotateX = 0;
    if (event.key === ',') rotateZ = 0;
    if (event.key === '.') rotateZ = 0;

    globalKeyDown = false;
});



const bkStyle = 'lightgray';

function drawLoop() {

    ctx.fillStyle = bkStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    scene.rotate(rotateX, rotateY, rotateZ);

    cube.rotate(scene.rotationMatrix, rotationCenter, false);
    cube.draw(observer);
    cube.rotate(scene.rotationMatrix, rotationCenter, true);

    if(moveTop !== 0) {
        cube.moveTop(moveTop > 0);
        moveTop = 0;
    }

    if(moveBottom !== 0) {
        cube.moveBottom(moveBottom > 0);
        moveBottom = 0;
    }

    if(moveFront !== 0) {
        cube.moveFront(moveFront > 0);
        moveFront = 0;
    }

    if(moveBack !== 0) {
        cube.moveBack(moveBack > 0);
        moveBack = 0;
    }

    if(moveLeft !== 0) {
        cube.moveLeft(moveLeft > 0);
        moveLeft = 0;
    }

    if(moveRight !== 0) {
        cube.moveRight(moveRight > 0);
        moveRight = 0;
    }

    counter ++;

    if(counter < 10000) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        console.log("END (drawLoop)");
    }
}

drawLoop();

console.log("END (init)");
