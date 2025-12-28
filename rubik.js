console.log("START");

const canvas = document.getElementById('drawing');
const ctx = canvas.getContext('2d');

class Point2D {
    static #size = 5;
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(pointStyle) {
        ctx.fillStyle = pointStyle;
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

    x = 0;
    y = 0;
    z = 0;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    project() {
        // Close Z makes point with infinite X and Y, very far Z makes point of X=0 and Y=0
        let zRatio = Point3D.#focalLength / (this.z + Point3D.#focalLength);
        return new Point2D(this.x * zRatio, this.y * zRatio);
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
        return new Point3D(this.x, this.y, this.z);
    }
}

class Line2D {
    lineStart = null;
    lineEnd = null;

    constructor(lineStart, lineEnd) {
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }

    draw(lineStyle, pointStyle, drawPoints = false) {
        if(drawPoints) {
            this.lineStart.draw(pointStyle);
            this.lineEnd.draw(pointStyle);
        }

        ctx.beginPath();
        ctx.strokeStyle = lineStyle;
        ctx.lineWidth = 2;
        ctx.moveTo(this.lineStart.actualX(), this.lineStart.actualY());
        ctx.lineTo(this.lineEnd.actualX(), this.lineEnd.actualY());
        ctx.stroke();
    }
}

class Line3D {
    lineStart = null;
    lineEnd = null;

    constructor(lineStart, lineEnd) {
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }

    project() {
        return new Line2D(this.lineStart.project(), this.lineEnd.project());
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

    constructor(points, center, normalLine, isVisible) {
        this.points = points;
        this.center = center;
        this.normalLine = normalLine;
        this.isVisible = isVisible;
    }

    draw(pointStyle, lineStyle, fillStyle, drawPoints = false, drawLines = false, fill = true) {
        if(this.isVisible && fill && this.points.length > 0) {
            ctx.fillStyle = fillStyle;
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
                new Line2D(this.points[i], this.points[endPointIndex]).draw(lineStyle, pointStyle, drawPoints);
            }
            if(this.normalLine != null) {
                this.normalLine.draw(lineStyle, pointStyle, drawPoints);
            }
        }

        if(!drawLines && drawPoints) {
            for(let point of this.points) {
                point.draw(pointStyle);
            }
        }

        if(drawPoints && this.center != null) {
            this.center.draw(pointStyle);
        }
    }
}

class Plane3D {
    points = [];
    normal = null;
    normalLine = null;
    center = null;

    constructor(points) {
        this.points = points;
        this.normal = this.#calculateNormal();
        this.center = this.#calculateCenter();
        this.normalLine = this.normal != null ? this.normal.toLine(this.center) : null;
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

        return new Point3D(x, y, z);
    }

    project(observer) {
        let isVisible = this.normalLine != null && this.normalLine.isFacing(observer);

        //console.log(this.normalLine);

        let points2D = this.points.map((point) => point.project());
        let center2D = this.center != null ? this.center.project() : null;
        let normal2D = this.normal != null ? this.normalLine.project() : null;
        return new Plane2D(points2D, center2D, normal2D, isVisible);
    }

    rotate(angleX, angleY, angleZ, center) {
        for(let point of this.points) {
            point.rotate(angleX, angleY, angleZ, center);
        }
        if(this.center != null) {
            this.center.rotate(angleX, angleY, angleZ, center);
        }
        if(this.normalLine != null) {
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
        if(startPoint == null) return null;

        return new Line3D(startPoint.clone(), new Point3D(startPoint.x + this.x, startPoint.y + this.y, startPoint.z + this.z));
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

let points = []
/*for (let i = 0; i < 2; i++) {
    points.push(new Point3D(0.5, 0.5, 0.1 + i / 20));
}*/

points.push(new Point3D(0.5,0.5, 2.5));
points.push(new Point3D(-0.7,0.5, 2.5));
points.push(new Point3D(-0.7,-0.7, 2.5));
points.push(new Point3D(0.5,-0.7, 2.5));

points.push(new Point3D(0.5,0.5, 3.5));
points.push(new Point3D(-0.7,0.5, 3.5));
points.push(new Point3D(-0.7,-0.7, 3.5));
points.push(new Point3D(0.5,-0.7, 3.5));

//let line = new Line3D(points[0], points[1]);

let planes = [];


planes.push(new Plane3D([points[7].clone(), points[6].clone(), points[5].clone(), points[4].clone()])); // back
planes.push(new Plane3D([points[4].clone(), points[5].clone(), points[1].clone(), points[0].clone()])); // top
planes.push(new Plane3D([points[3].clone(), points[2].clone(), points[6].clone(), points[7].clone()])); // bottom
planes.push(new Plane3D([points[1].clone(), points[5].clone(), points[6].clone(), points[2].clone()])); // left
planes.push(new Plane3D([points[4].clone(), points[0].clone(), points[3].clone(), points[7].clone()])); // right
planes.push(new Plane3D([points[0].clone(), points[1].clone(), points[2].clone(), points[3].clone()])); // front

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


const rotationCenter = new Point3D(0,0,3);
const observer = new Point3D(0,0,0);

const bkStyle = 'lightgray';
const pointStyle = 'red';
const lineStyle = 'blue';
const fillStyle = 'purple';

function drawLoop() {

    ctx.fillStyle = bkStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let plane of planes) {
        plane.rotate(rotateX * deg2rad, rotateY * deg2rad, rotateZ * deg2rad, rotationCenter)
            .project(observer).draw(pointStyle, lineStyle, fillStyle, true, true, true);

        /*if (globalKeyDown) {
            console.log("start: ",
                Math.round(plane.normalLine.lineStart.x * 1000) / 1000,
                Math.round(plane.normalLine.lineStart.y * 1000) / 1000,
                Math.round(plane.normalLine.lineStart.z * 1000) / 1000,
                "end: " +
                Math.round(plane.normalLine.lineEnd.x * 1000) / 1000,
                Math.round(plane.normalLine.lineEnd.y * 1000) / 1000,
                Math.round(plane.normalLine.lineEnd.z * 1000) / 1000);
        }*/

    }

    /*for (let point of points) {
        point
            .rotate(stepX * deg2rad, stepY * deg2rad, stepZ * deg2rad)
            .project().draw();
    }*/


    counter ++;

    if(counter < 10000) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        console.log("END (drawLoop)");
    }
}

drawLoop();

console.log("END (init)");
