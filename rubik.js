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
    static #scaleZ = 2;

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
        return new Point2D(this.x / (this.z * Point3D.#scaleZ), this.y / (this.z * Point3D.#scaleZ));
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
}

class Plane2D {
    points = [];

    constructor(points) {
        this.points = points;
    }

    draw(pointStyle, lineStyle, fillStyle, drawPoints = false, drawLines = false, fill = true) {
        if(drawLines) {
            for(let i=0; i<this.points.length; i++) {
                let endPointIndex = (i+1) % this.points.length;
                new Line2D(this.points[i], this.points[endPointIndex]).draw(lineStyle, pointStyle, drawPoints);
            }
        }
        if(!drawLines && drawPoints) {
            for(let point of this.points) {
                point.draw(pointStyle);
            }
        }
        if(fill && points.length > 0) {
            ctx.fillStyle = fillStyle;
            ctx.beginPath();
            ctx.moveTo(this.points[0].actualX(), this.points[0].actualY());
            for(let i=1; i<this.points.length; i++) {
                ctx.lineTo(this.points[i].actualX(), this.points[i].actualY());
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

class Plane3D {
    points = [];

    constructor(points) {
        this.points = points;
    }

    project() {
        return new Plane2D(this.points.map((point) => point.project()));
    }

    rotate(angleX, angleY, angleZ, center) {
        for(let point of this.points) {
            point.rotate(angleX, angleY, angleZ, center);
        }
        return this;
    }
}

points = []
/*for (let i = 0; i < 2; i++) {
    points.push(new Point3D(0.5, 0.5, 0.1 + i / 20));
}*/

points.push(new Point3D(0.5,0.5, 2));
points.push(new Point3D(-0.5,0.5, 2));
points.push(new Point3D(-0.5,-0.5, 2));
points.push(new Point3D(0.5,-0.5, 2));

//let line = new Line3D(points[0], points[1]);

let plane = new Plane3D(points);

const deg2rad = Math.PI / 180;
let counter = 0;
const stepZ = 4;
const stepX = 1;
const stepY = 5;

const rotationCenter = new Point3D(0,0,3);

const bkStyle = 'lightgray';
const pointStyle = 'red';
const lineStyle = 'blue';
const fillStyle = 'purple';

function drawLoop() {

    ctx.fillStyle = bkStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    plane.rotate(stepX * deg2rad, stepY * deg2rad, stepZ * deg2rad, rotationCenter)
        .project().draw(pointStyle, lineStyle, fillStyle, true, true, true);

    /*for (let point of points) {
        point
            .rotate(stepX * deg2rad, stepY * deg2rad, stepZ * deg2rad)
            .project().draw();
    }*/


    counter ++;

    if(counter < 1000) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        console.log("END (drawLoop)");
    }
}

drawLoop();

console.log("END (init)");
