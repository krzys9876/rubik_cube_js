import {globalStyle, planeOrientation, sideAxis, sideStyles} from './common.js';

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

    draw(canvas, ctx) {
        ctx.fillStyle = this.style.pointStyle;
        ctx.fillRect(this.actualX(canvas) - Point2D.#size / 2, this.actualY(canvas) - Point2D.#size / 2, Point2D.#size, Point2D.#size);
    }

    // 3D point's X and Y are in range -1 to 1, so point 0.0 is in the middle of the screen
    // and axis grow up and right
    actualX(canvas) {
        return (this.x + 1) * canvas.width / 2;
    }

    actualY(canvas) {
        return (1 - this.y) * canvas.height /2;
    }
}

export class Coords3D {
    x;
    y;
    z;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
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
}

export class Point3D extends Coords3D {
    static focalLength = 7;
    style;

    constructor(x, y, z, style = globalStyle) {
        super(x, y, z);
        this.style = style;
    }

    project() {
        // Close Z makes point with infinite X and Y, very far Z makes point of X=0 and Y=0
        let zRatio = Point3D.focalLength / (this.z + Point3D.focalLength);
        return new Point2D(this.x * zRatio, this.y * zRatio, this.style);
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

    draw(canvas, ctx, selected, drawPoints = false) {
        if(drawPoints) {
            this.lineStart.draw(canvas, ctx);
            this.lineEnd.draw(canvas, ctx);
        }

        ctx.beginPath();
        ctx.strokeStyle = selected ? this.style.lineStyleSelected : this.style.lineStyle;
        ctx.lineWidth = selected ? 4 : 2;
        ctx.moveTo(this.lineStart.actualX(canvas), this.lineStart.actualY(canvas));
        ctx.lineTo(this.lineEnd.actualX(canvas), this.lineEnd.actualY(canvas));
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

    project(canvas) {
        return new Line2D(this.lineStart.project(), this.lineEnd.project(), this.style, canvas);
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

        // Estimate if the angle: observer - normal start (face center) - normal end  is acute (<90) or obtuse (>90) using Pythagorean theorem
        return (vectorToEnd * vectorToEnd) > (vectorToStart * vectorToStart + vectorBetween * vectorBetween);
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
    metadata;
    functions = [];

    constructor(points, center, normalLine, isVisible, metadata, canvas) {
        this.points = points;
        this.center = center;
        this.normalLine = normalLine;
        this.isVisible = isVisible;
        this.metadata = metadata;
        this.#calculateFunctions(canvas);
    }

    #calculateFunctions(canvas) {
        this.functions = [];
        // We assume that all planes have points ordered in the same direction (counter- or clockwise)
        this.functions.push(new LinearFunction(this.points[0], this.points[1], canvas));
        this.functions.push(new LinearFunction(this.points[1], this.points[2], canvas));
        this.functions.push(new LinearFunction(this.points[2], this.points[3], canvas));
        this.functions.push(new LinearFunction(this.points[3], this.points[0], canvas));
    }

    draw(canvas, ctx, drawPoints, drawLines, fill) {
        if(this.isVisible && fill && this.metadata.style.fillStyle && this.points.length > 0) {
            ctx.fillStyle = this.metadata.style.fillStyle;
            ctx.beginPath();
            ctx.moveTo(this.points[0].actualX(canvas), this.points[0].actualY(canvas));
            for(let i=1; i<this.points.length; i++) {
                ctx.lineTo(this.points[i].actualX(canvas), this.points[i].actualY(canvas));
            }
            ctx.closePath();
            ctx.fill();
        }

        if(drawLines || this.metadata.selected) {
            for(let i=0; i<this.points.length; i++) {
                let endPointIndex = (i+1) % this.points.length;
                new Line2D(this.points[i], this.points[endPointIndex], this.metadata.style).draw(canvas, ctx, this.metadata.selected, drawPoints);
            }
            /*if(this.normalLine != null) {
                this.normalLine.draw(canvas, ctx, lineStyle, pointStyle, drawPoints);
            }*/
        }

        if(!drawLines && drawPoints) {
            for(let point of this.points) {
                point.draw(canvas, ctx);
            }
        }

        if(drawPoints && this.center) {
            this.center.draw(canvas, ctx);
        }
        // print metadata
        /*if(this.isVisible) {
            ctx.lineStyle='black';
            ctx.fillStyle='black';
            ctx.font = "12px arial";
            ctx.fillText(this.metadata.text, this.center.actualX()-20, this.center.actualY());
        }*/
    }

    isInside(x, y) {
        // The point inside a plane should be "below" all lines (below depending on their directions)
        return this.functions.find(f => f.isAboveLineScreen(x, y)) === undefined;

    }
}

export class PlaneMetadata {
    style;
    orientation;
    text;
    cubeCoords;
    origText;
    selected = false;

    constructor(style, orientation, text, cubeCoords) {
        this.style = style;
        this.orientation = orientation;
        this.origText = text;
        this.cubeCoords = cubeCoords;
        this.updateText(this.origText);
    }

    updateText(text) {
        this.origText = text;
        this.text = `${this.selected ? '@' : ''}${this.origText} ${this.orientation}${this.style.tag}`;
    }

    rotateSide(side, direction) {
        if(!this.orientation) return;

        const nextSideInfo = planeOrientation.get(this.orientation).get(sideAxis.get(side));
        if(nextSideInfo !== undefined) {
            const nextOrientation = nextSideInfo.get(direction);
            if(nextOrientation !== undefined) {
                this.orientation = nextOrientation;
                this.updateText(this.origText);
            }
        }
    }

    select() { this.setSelected(true); }
    deselect() { this.setSelected(false); }
    flipSelection() { this.setSelected(!this.selected); }

    setSelected(selected) {
        this.selected = selected;
        this.updateText(this.origText)
    }

    resetStyle() {
        if(this.orientation !== null) {
            this.style = sideStyles.get(this.orientation);
        }
    }
}

export class Plane3D {
    points = [];
    normal = null;
    normalLine = null;
    center = null;
    plane2D = null;
    metadata;

    constructor(points, metadata) {
        this.points = points;
        this.metadata = metadata;
        this.normal = this.#calculateNormal();
        this.center = this.#calculateCenter();
        this.normalLine = this.normal ? this.normal.toLine(this.center) : null;
    }

    #calculateNormal() {
        if(this.points.length < 3) return null;

        // Assume that first 3 points form a flat plane, co we arrange them into two vectors
        let w1 = Vector3D.fromPoints(this.points[0], this.points[1]);
        let w2 = Vector3D.fromPoints(this.points[1], this.points[2]);

        // According to obliczeniowo.com.pl/61
        let x = w1.y * w2.z - w1.z * w2.y;
        let y = w1.z * w2.x - w1.x * w2.z;
        let z = w1.x * w2.y - w1.y * w2.x;

        return new Vector3D(x, y, z);
    }

    #calculateCenter() {
        if(this.points.length < 3) return null;
        let x = this.points.map(point => point.x).reduce((a, b) => a + b) / this.points.length;
        let y = this.points.map(point => point.y).reduce((a, b) => a + b) / this.points.length;
        let z = this.points.map(point => point.z).reduce((a, b) => a + b) / this.points.length;

        return new Point3D(x, y, z, this.metadata.style);
    }

    project(observer, canvas) {
        const isVisible = this.normalLine && this.normalLine.isFacing(observer);

        let points2D = this.points.map((point) => point.project());
        let center2D = this.center ? this.center.project() : null;
        let normal2D = this.normal ? this.normalLine.project() : null;
        this.plane2D = new Plane2D(points2D, center2D, normal2D, isVisible, this.metadata, canvas);
        return this.plane2D;
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

    rotateSide(side, direction) {
        this.metadata.rotateSide(side, direction);
    }

    select() { this.metadata.select(); }
    deselect() { this.metadata.deselect(); }
    flipSelection() { this.metadata.flipSelection(); }
}

class LinearFunction {
    point1;
    point2;
    dx;
    dy;
    a;
    b;
    flip;
    canvas;

    constructor(p1, p2, canvas) {
        this.point1 = p1;
        this.point2 = p2;
        this.canvas = canvas;

        // deduced from Excel prototype
        this.dx = this.point2.actualX(this.canvas) - this.point1.actualX(this.canvas);
        this.dy = this.point2.actualY(this.canvas) - this.point1.actualY(this.canvas);
        this.a = this.dx === 0 ? null : this.dy / this.dx;
        this.b = this.dx === 0 ? null : this.point1.actualY(this.canvas) - this.point1.actualX(this.canvas) * this.a;
        this.flip = this.dx === 0 ? this.point2.actualY(this.canvas) < this.point1.actualY(this.canvas) :  this.point2.actualX(this.canvas) < this.point1.actualX(this.canvas);
    }

    // use screen (canvas) coords
    isAboveLineScreen(x, y) {
        const flag = this.a === null ? x<this.point1.actualX(this.canvas) : x*this.a + this.b < y;
        return flag !== this.flip; // effectively XOR
    }

    // use normal coords
    isAboveLine(point) {
        return this.isAboveLineScreen(point.actualX(this.canvas), point.actualY(this.canvas));
    }
}