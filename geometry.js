import { canvas, ctx, globalStyle } from './common.js';

export class Point2D {
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

export class Point3D {
    static focalLength = 7;
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
        let zRatio = Point3D.focalLength / (this.z + Point3D.focalLength);
        return new Point2D(this.x * zRatio, this.y * zRatio, this.style);
    }

    // Apply a 3x3 rotation matrix to this point
    rotate(matrix, center, reverse = false) {
        this.moveBy(center, true);

        // Store original values before calculating new ones
        let oldX = this.x;
        let oldY = this.y;
        let oldZ = this.z;

        if(reverse) {
            // For reverse rotation, we need to transpose the matrix (inverse for rotation matrices)
            this.x = matrix[0][0] * oldX + matrix[1][0] * oldY + matrix[2][0] * oldZ;
            this.y = matrix[0][1] * oldX + matrix[1][1] * oldY + matrix[2][1] * oldZ;
            this.z = matrix[0][2] * oldX + matrix[1][2] * oldY + matrix[2][2] * oldZ;
        } else {
            this.x = matrix[0][0] * oldX + matrix[0][1] * oldY + matrix[0][2] * oldZ;
            this.y = matrix[1][0] * oldX + matrix[1][1] * oldY + matrix[1][2] * oldZ;
            this.z = matrix[2][0] * oldX + matrix[2][1] * oldY + matrix[2][2] * oldZ;
        }

        this.moveBy(center, false);
        return this;
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

export class Line2D {
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

export class Line3D {
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

    rotate(matrix, center, reverse = false) {
        this.lineStart.rotate(matrix, center, reverse);
        this.lineEnd.rotate(matrix, center, reverse);
        return this;
    }

    isFacing(point) {
        let vectorToStart = Vector3D.fromPoints(point, this.lineStart).length();
        let vectorToEnd = Vector3D.fromPoints(point, this.lineEnd).length();
        let vectorBetween = Vector3D.fromPoints(this.lineStart, this.lineEnd).length();

        //console.log(point, this.lineStart, this.lineEnd, vectorToStart.length(), vectorToEnd.length());

        return (vectorToEnd * vectorToEnd) > (vectorToStart * vectorToStart + vectorBetween * vectorBetween);

        /*

                let vectorToStart = Vector3D.fromPoints(point, this.lineStart).length();
        let vectorToEnd = Vector3D.fromPoints(point, this.lineEnd).length();
        let vectorBetween = Vector3D.fromPoints(vectorToStart, vectorToEnd).length();

        // We want to assess if the agle: point - start - end is accute (<90) or obtuse (>90),
        // It is acute if |point-end vector|^2 < [point-start]^2 + |start-end|^2 (Pythagoras' theorem)

        return vectorToEnd*vectorToEnd < vectorBetween * vectorToStart + vectorBetween * vectorToEnd;

         */
    }
}

export class Vector3D {
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

export class Plane2D {
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

export class Plane3D {
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

        //console.log(w1, w2, x, y, z);

        return new Vector3D(x, y, z);
    }

    #calculateCenter() {
        if(this.points.length < 3) return null;
        let x = this.points.map(point => point.x).reduce((a, b) => a + b) / this.points.length;
        let y = this.points.map(point => point.y).reduce((a, b) => a + b) / this.points.length;
        let z = this.points.map(point => point.z).reduce((a, b) => a + b) / this.points.length;

        //console.log(x, y, z);

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

    rotate(matrix, center, reverse = false) {
        for(let point of this.points) {
            point.rotate(matrix, center, reverse);
        }
        if(this.center) {
            this.center.rotate(matrix, center, reverse);
        }
        if(this.normalLine) {
            this.normalLine.rotate(matrix, center, reverse);
        }
        return this;
    }
}

export class Cube {
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

    rotate(matrix, center, reverse = false) {
        for (let plane of this.planes) plane.rotate(matrix, center, reverse)
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
