import { Style, canvas, ctx, globalStyle } from './common.js';
import { Point3D, Vector3D, Cube } from './geometry.js';

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

        generated.push(Cube.generate(this.center,
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,globalStyle]));
        // Front
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, -singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [this.styles[0],globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]]));

        // Back
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,globalStyle,globalStyle,this.styles[5]]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],this.styles[2],globalStyle,globalStyle,this.styles[5]]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, singleCubeSize)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,this.styles[1],globalStyle,this.styles[3],globalStyle,this.styles[5]]));

        // Top
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,this.styles[2],globalStyle,globalStyle,this.styles[5]]));

        // Bottom
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(0, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],this.styles[4],globalStyle]));
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, -singleCubeSize, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,this.styles[3],globalStyle,this.styles[5]]));

        // Left
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(-singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,this.styles[4],globalStyle]));

        // Right
        generated.push(Cube.generate(this.center.clone().moveBy(new Vector3D(singleCubeSize, 0, 0)),
            singleCubeSize,singleCubeSize,singleCubeSize,
            [globalStyle,globalStyle,globalStyle,globalStyle,globalStyle,this.styles[5]]));

        return generated;
    }

    rotate(angleX, angleY, angleZ, center) {
        for (let cube of this.cubes) cube.rotate(angleX, angleY, angleZ, center)
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

const deg2rad = Math.PI / 180;
let counter = 0;
const stepZ = 3 / 5;
const stepX = 3 / 5;
const stepY = 3 / 5;

let rotateZ = 0;
let rotateX = 0;
let rotateY = 0;

let globalKeyDown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') rotateY = stepY;
    if (event.key === 'ArrowRight') rotateY = -stepY;
    if (event.key === 'ArrowUp') rotateX = stepX;
    if (event.key === 'ArrowDown') rotateX = -stepX;
    if (event.key === ',') rotateZ = stepZ;
    if (event.key === '.') rotateZ = -stepZ;

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

    cube.rotate(rotateX * deg2rad, rotateY * deg2rad, rotateZ * deg2rad, rotationCenter);
    cube.draw(observer);


    counter ++;

    if(counter < 10000) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        console.log("END (drawLoop)");
    }
}

drawLoop();

console.log("END (init)");
