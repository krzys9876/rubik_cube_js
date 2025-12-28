console.log("START");

const canvas = document.getElementById('drawing');
const ctx = canvas.getContext('2d');

class Style {
    pointStyle = 'red';
    lineStyle = 'blue';
    fillStyle = 'purple';

    constructor(pointStyle, lineStyle, fillStyle) {
        this.pointStyle = pointStyle;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
    }
}

const globalStyle = new Style('black', 'black', null);

class Point2D {
    static #size = 5;
    x;
    y;
    style;

    constructor(x, y, style) {
        this.x = x;
        this.y = y;
        this.style = style;
    }

    draw() {
        ctx.fillStyle = this.style.pointStyle;
        ctx.fillRect(this.actualX() - Point2D.#size / 2, this.actualY() - Point2D.#size / 2, Point2D.#size, Point2D.#size);
    }


    // 3D point's X and Y are in range -1 to 1, so point 0.0 is in the middle of the screen
    // and axis grow up and right
    actualX() {
        return (this.x + 1) * canvas.width / 2;
    }

    actualY() {
        return (1 - this.y) * canvas.height /2;
    }
}

class Point3D {
    static #focalLength = 7;
    x;
    y;
    z;
    style;

    constructor(x, y, z, style = globalStyle) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.style = style;
    }

    project() {
        // Close Z makes point with infinite X and Y, very far Z makes point of X=0 and Y=0
        let zRatio = Point3D.#focalLength / (this.z + Point3D.#focalLength);
        return new Point2D(this.x * zRatio, this.y * zRatio, this.style);
    }

    #rotateZ(angle) {
        let rotated = Point3D.rotateOne({a: this.x, b: this.y}, angle)
        this.x = rotated.a;
        this.y = rotated.b;
        return this;
    }

    #rotateX(angle) {
        let rotated = Point3D.rotateOne({a: this.y, b: this.z}, angle)
        this.y = rotated.a;
        this.z = rotated.b;
        return this;
    }

    #rotateY(angle) {
        let rotated = Point3D.rotateOne({a: this.z, b: this.x}, angle)
        this.z = rotated.a;
        this.x = rotated.b;
        return this;
    }

    rotate(angleX, angleY, angleZ, center) {
        this.moveBy(center, true);
        this.#rotateX(angleX).#rotateY(angleY).#rotateZ(angleZ);
        this.moveBy(center, false);
        return this;
    }

    static rotateOne({a, b}, angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let rotatedA = a * cos - b * sin;
        let rotatedB = a * sin + b * cos;
        return {a: rotatedA, b: rotatedB};
    }

    moveBy(vector, reverse = false) {
        if(reverse) {
            this.x -= vector.x;
            this.y -= vector.y;
            this.z -= vector.z;
        } else {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
        }
        return this;
    }

    clone() {
        return new Point3D(this.x, this.y, this.z, this.style);
    }
}

class Line2D {
    lineStart;
    lineEnd;
    style;

    constructor(lineStart, lineEnd, style) {
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.style = style;
    }

    draw(drawPoints = false) {
        if(drawPoints) {
            this.lineStart.draw();
            this.lineEnd.draw();
        }

        ctx.beginPath();
        ctx.strokeStyle = this.style.lineStyle;
        ctx.lineWidth = 2;
        ctx.moveTo(this.lineStart.actualX(), this.lineStart.actualY());
        ctx.lineTo(this.lineEnd.actualX(), this.lineEnd.actualY());
        ctx.stroke();
    }
}

class Line3D {
    lineStart;
    lineEnd;
    style;

    constructor(lineStart, lineEnd, style) {
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.style = style;
    }

    project() {
        return new Line2D(this.lineStart.project(), this.lineEnd.project(), this.style);
    }

    rotate(angleX, angleY, angleZ, center) {
        this.lineStart.rotate(angleX, angleY, angleZ, center);
        this.lineEnd.rotate(angleX, angleY, angleZ, center);
        return this;
    }

    isFacing(point) {
        let vectorToStart = Vector3D.fromPoints(point, this.lineStart);
        let vectorToEnd = Vector3D.fromPoints(point, this.lineEnd);

        //console.log(point, this.lineStart, this.lineEnd, vectorToStart.length(), vectorToEnd.length());

        return vectorToStart.length() <= vectorToEnd.length();
    }
}

class Plane2D {
    points = [];
    center = null;
    normalLine = null;
    isVisible = true;
    style;

    constructor(points, center, normalLine, isVisible, style) {
        this.points = points;
        this.center = center;
        this.normalLine = normalLine;
        this.isVisible = isVisible;
        this.style = style;
    }

    draw(drawPoints = false, drawLines = false, fill = true) {
        if(this.isVisible && fill && this.style.fillStyle && this.points.length > 0) {
            ctx.fillStyle = this.style.fillStyle;
            ctx.beginPath();
            ctx.moveTo(this.points[0].actualX(), this.points[0].actualY());
            for(let i=1; i<this.points.length; i++) {
                ctx.lineTo(this.points[i].actualX(), this.points[i].actualY());
            }
            ctx.closePath();
            ctx.fill();
        }

        if(drawLines) {
            for(let i=0; i<this.points.length; i++) {
                let endPointIndex = (i+1) % this.points.length;
                new Line2D(this.points[i], this.points[endPointIndex], this.style).draw(drawPoints);
            }
            /*if(this.normalLine != null) {
                this.normalLine.draw(lineStyle, pointStyle, drawPoints);
            }*/
        }

        if(!drawLines && drawPoints) {
            for(let point of this.points) {
                point.draw();
            }
        }

        if(drawPoints && this.center) {
            this.center.draw();
        }
    }
}

class Plane3D {
    points = [];
    normal = null;
    normalLine = null;
    center = null;
    style;

    constructor(points, style) {
        this.points = points;
        this.style = style;
        this.normal = this.#calculateNormal();
        this.center = this.#calculateCenter();
        this.normalLine = this.normal ? this.normal.toLine(this.center) : null;
    }

    #calculateNormal() {
        if(this.points.length < 3) return null;

        // Assume that first 3 points form a flat plane, co we carrange them into two vectors
        let w1 = Vector3D.fromPoints(this.points[0], this.points[1]);
        let w2 = Vector3D.fromPoints(this.points[1], this.points[2]);

        // According to obliczeniowo.com.pl/61
        let x = w1.y * w2.z - w1.z * w2.y;
        let y = w1.z * w2.x - w1.x * w2.z;
        let z = w1.x * w2.y - w1.y * w2.x;

        console.log(w1, w2, x, y, z);

        return new Vector3D(x, y, z);
    }

    #calculateCenter() {
        if(this.points.length < 3) return null;
        let x = this.points.map(point => point.x).reduce((a, b) => a + b) / this.points.length;
        let y = this.points.map(point => point.y).reduce((a, b) => a + b) / this.points.length;
        let z = this.points.map(point => point.z).reduce((a, b) => a + b) / this.points.length;

        console.log(x, y, z);

        return new Point3D(x, y, z, this.style);
    }

    project(observer) {
        let isVisible = this.normalLine && this.normalLine.isFacing(observer);

        //console.log(this.normalLine);

        let points2D = this.points.map((point) => point.project());
        let center2D = this.center ? this.center.project() : null;
        let normal2D = this.normal ? this.normalLine.project() : null;
        return new Plane2D(points2D, center2D, normal2D, isVisible, this.style);
    }

    rotate(angleX, angleY, angleZ, center) {
        for(let point of this.points) {
            point.rotate(angleX, angleY, angleZ, center);
        }
        if(this.center) {
            this.center.rotate(angleX, angleY, angleZ, center);
        }
        if(this.normalLine) {
            this.normalLine.rotate(angleX, angleY, angleZ, center);
        }
        return this;
    }
}

class Vector3D {
    x = 0;
    y = 0;
    z = 0;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromPoints(p1, p2) {
        return new Vector3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    }

    toLine(startPoint) {
        if(!startPoint) return null;

        return new Line3D(startPoint.clone(), new Point3D(startPoint.x + this.x, startPoint.y + this.y, startPoint.z + this.z), startPoint.style);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

class Cube {
    points = [];
    styles = [];
    planes = [];

    constructor(points, styles) {
        if(points.length !== 8 || styles.length !== 6) throw new Error("Cube requires exactly 8 points and 6 styles");

        this.points = points;
        this.styles = styles;

        /* The points should be arranged in the following order:
            1---------0
            |\       /|
            | 5-----4 |
            | |     | |
            | 6-----7 |
            |/       \|
            2---------3
         */

        this.planes.push(new Plane3D([this.points[0].clone(), this.points[1].clone(), this.points[2].clone(), this.points[3].clone()], styles[0])); // front
        this.planes.push(new Plane3D([this.points[7].clone(), this.points[6].clone(), this.points[5].clone(), this.points[4].clone()], styles[1])); // back
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[5].clone(), this.points[1].clone(), this.points[0].clone()], styles[2])); // top
        this.planes.push(new Plane3D([this.points[3].clone(), this.points[2].clone(), this.points[6].clone(), this.points[7].clone()], styles[3])); // bottom
        this.planes.push(new Plane3D([this.points[1].clone(), this.points[5].clone(), this.points[6].clone(), this.points[2].clone()], styles[4])); // left
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[0].clone(), this.points[3].clone(), this.points[7].clone()], styles[5])); // right
    }

    rotate(angleX, angleY, angleZ, center) {
        for (let plane of this.planes) plane.rotate(angleX, angleY, angleZ, center)
    }

    draw(observer) {
        this.planes.sort((a, b) => {
            let distA = Vector3D.fromPoints(observer, a.center).length();
            let distB = Vector3D.fromPoints(observer, b.center).length();
            return distB - distA;
        });

        for (let plane of this.planes) {
            plane.project(observer).draw(false, true, true);
        }
    }

    static generate(center, sizeX, sizeY, sizeZ, styles) {
        let points = []

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));

        return new Cube(points, styles);
    }
}

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
const observer = new Point3D(0,0,0);

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
