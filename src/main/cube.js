import {Coords3D, Plane3D, PlaneMetadata, Point3D, Vector3D} from "./geometry.js";
import {
    globalStyle,
    MoveDirection,
    nextSide,
    reverseDirection,
    sideAxis,
    sideDistance,
    opposideSides,
    sideStyles,
    SideType, MoveType, nextStyle, Axis
} from "./common.js";
import {scene, Scene} from "./scene.js";

// Using Coords3D may be an overkill (floating point operations for simple 1/-1 coords) but performance-wise it is irrelevant.
// All we need are roundings
export class CubeCoords extends Coords3D {
    static rotationCenter = new Coords3D(0, 0, 0);

    rotateSide(sideType, direction) {
        let deg90 = - Math.PI / 2;

        switch (sideType) {
            case SideType.UP: deg90 = -deg90; break;
            case SideType.DOWN: deg90 = -deg90; break;
        }

        let matrix = Scene.rotationMatrix(sideAxis.get(sideType), deg90);

        this.rotate(matrix, CubeCoords.rotationCenter, direction === MoveDirection.COUNTERCLOCKWISE);
        this.#roundCoords();
    }

    #roundCoords() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
    }

    isCenter() {
        return (this.y === 0 && this.z === 0 && (this.x === -1 || this.x === 1)) ||
            (this.x === 0 && this.z === 0 && (this.y === -1 || this.y === 1)) ||
            (this.y === 0 && this.x === 0 && (this.z === -1 || this.z === 1));
    }
}

export class CubeMetadata {
    coords;
    selected = false;

    constructor(coords) {
        this.coords = coords;
    }

    static create(x, y, z) {
        return new CubeMetadata(new CubeCoords(x, y, z));
    }

    toText() {
        return `${this.coords.x},${this.coords.y},${this.coords.z}`;
    }

    select() { this.selected = true; }
    deselect() { this.selected = false; }
}

export class Cube {
    points = [];
    styles = [];
    planes = [];
    metadata;

    constructor(points, styles, orientation, metadata) {
        if(points.length !== 8 || styles.length !== 6) throw new Error("Cube requires exactly 8 points and 6 styles");

        this.points = points;
        this.styles = styles;
        this.metadata = metadata;

        /* The points should be arranged in the following order:
            1---------0
            |\       /|
            | 5-----4 |
            | |     | |
            | 6-----7 |
            |/       \|
            2---------3
         */

        this.planes.push(new Plane3D([this.points[0].clone(), this.points[1].clone(), this.points[2].clone(), this.points[3].clone()],
            new PlaneMetadata(styles[0], orientation[0], this.metadata.toText(), this.metadata.coords))); // front
        this.planes.push(new Plane3D([this.points[7].clone(), this.points[6].clone(), this.points[5].clone(), this.points[4].clone()],
            new PlaneMetadata(styles[1], orientation[1], this.metadata.toText(), this.metadata.coords))); // back
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[5].clone(), this.points[1].clone(), this.points[0].clone()],
            new PlaneMetadata(styles[2], orientation[2], this.metadata.toText(), this.metadata.coords))); // up
        this.planes.push(new Plane3D([this.points[3].clone(), this.points[2].clone(), this.points[6].clone(), this.points[7].clone()],
            new PlaneMetadata(styles[3], orientation[3], this.metadata.toText(), this.metadata.coords))); // down
        this.planes.push(new Plane3D([this.points[1].clone(), this.points[5].clone(), this.points[6].clone(), this.points[2].clone()],
            new PlaneMetadata(styles[4], orientation[4], this.metadata.toText(), this.metadata.coords))); // left
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[0].clone(), this.points[3].clone(), this.points[7].clone()],
            new PlaneMetadata(styles[5], orientation[5], this.metadata.toText(), this.metadata.coords))); // right
    }

    rotate(matrix, center, updateCoords, reverse = false) {
        for (let plane of this.planes) {
            plane.rotate(matrix, center, reverse)
            if(updateCoords) {
                plane.metadata.updateText(this.metadata.toText());
            }
        }
    }

    draw(canvas, ctx, observer) {
        this.planes.sort((a, b) => {
            let distA = Vector3D.fromPoints(observer, a.center).length();
            let distB = Vector3D.fromPoints(observer, b.center).length();
            return distB - distA;
        });

        for (let plane of this.planes) {
            plane.project(observer, canvas).draw(canvas, ctx, false, true, true);
        }
    }

    rotateSide(side, direction) {
        this.metadata.coords.rotateSide(side, direction);
        for (let plane of this.planes) {
            plane.rotateSide(side, direction);
            plane.metadata.updateText(this.metadata.toText());
        }
    }

    static generate(center, sizeX, sizeY, sizeZ, styles, orientation, x, y, z) {
        let points = []

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));

        return new Cube(points, styles, orientation, CubeMetadata.create(x, y, z));
    }

    select() {
        this.metadata.select();
        this.planes.forEach(p => p.select());
    }

    deselect() {
        this.metadata.deselect();
        this.planes.forEach(p => p.deselect());
    }

        isInPlace() {
        const actualSides = this.getSides();
        const correctSides = actualSides.filter(p => sideStyles.get(p.metadata.orientation).name === p.metadata.style.name);
        // NOTE: this will always be true for inner cube (0,0,0)
        return actualSides.length === correctSides.length;
    }

    hasSideInPlace(side) {
        const actualSide = this.getSide(side);
        return actualSide && actualSide.metadata.style.name === sideStyles.get(side).name;
    }

    getSides() {
        return this.planes.filter(p => p.metadata.style !== globalStyle);
    }

    getSide(side) {
        const actualSides = this.getSides();
        const sidesOfSide = actualSides.filter(p => p.metadata.orientation === side);
        if(sidesOfSide.length === 1) return sidesOfSide[0];
        else return null;
    }

    hasSide(side, style) {
        const actualSides = this.getSides().filter(p => p.metadata.orientation === side && p.metadata.style.name === style.name);
        return actualSides.length > 0;
    }
}

export class SideAnimation {
    static animationStep = 15;
    step = 15;
    ongoing;
    currentAngle;
    movedAngle;
    movement;

    constructor() {
        this.stop();
    }

    start(movement) {
        if(this.ongoing) return;

        this.movement = movement;
        this.currentAngle = 0;
        this.movedAngle = 0;
        this.step = SideAnimation.animationStep;
        this.ongoing = true;
    }

    continue() {
        if(!this.ongoing) return;
        const prevAngle = this.currentAngle;
        this.currentAngle = Math.min(this.currentAngle + this.step, 90);
        this.movedAngle = this.currentAngle - prevAngle;
        if(Math.round(this.currentAngle)>=90) this.stop();
    }

    stop() {
        if(!this.ongoing) return;

        this.ongoing = false;
        this.currentAngle = 0;
        this.side = null;
        this.direction = null;
    }

    static setSpeed(code) {
        switch(code) {
            case 1: SideAnimation.animationStep = 5; break;
            case 2: SideAnimation.animationStep = 10; break;
            case 3: SideAnimation.animationStep = 15; break;
            case 4: SideAnimation.animationStep = 30; break;
            case 5: SideAnimation.animationStep = 90; break;
        }
    }
}

export class Movement {
    static #sides = [SideType.FRONT, SideType.BACK, SideType.UP, SideType.DOWN, SideType.LEFT, SideType.RIGHT];
    static #codeToMovement = new Map([
        ["U", new Movement(SideType.UP, MoveDirection.CLOCKWISE)],
        ["U\'", new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE)],
        ["D", new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE)],
        ["D\'", new Movement(SideType.DOWN, MoveDirection.CLOCKWISE)],
        ["F", new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE)],
        ["F\'", new Movement(SideType.FRONT, MoveDirection.CLOCKWISE)],
        ["B", new Movement(SideType.BACK, MoveDirection.CLOCKWISE)],
        ["B\'", new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE)],
        ["L", new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE)],
        ["L\'", new Movement(SideType.LEFT, MoveDirection.CLOCKWISE)],
        ["R", new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE)],
        ["R\'", new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE)]
    ]);

    side;
    direction;
    type;

    constructor(side, direction, type = MoveType.MANUAL) {
        this.side = side;
        this.direction = direction;
        this.type = type;
    }

    static from(code, type = MoveType.MANUAL) {
        if(code === "S") return Movement.random(type);
        else return Movement.#codeToMovement.has(code) ? Movement.#codeToMovement.get(code).withType(type) : null;
    }

    static replaceDoubles(codes) {
        // NOTE: this actually makes the solving process longer by a few ms per each dry run (w/o display), from ~7ms to ~10ms
        // but this is not important when comparing to time needed to draw the cube. It makes solver a little more elegant
        // and also allows using scrumble sequences from the internet.
        return codes
            .replaceAll("F2","F F")
            .replaceAll("R2","R R")
            .replaceAll("B2","B B")
            .replaceAll("L2","L L")
            .replaceAll("U2","U U")
            .replaceAll("D2","D D")
    }

    static fromText(codes, type = MoveType.MANUAL) {
        codes = Movement.replaceDoubles(codes)
        const movements = [];
        codes.split(" ").forEach(code => {
            const movement = Movement.from(code);
            if (movement) movements.push(movement.withType(type))
        });
        return movements;
    }

    static toText(moves) {
        let text = "";
        moves.forEach(m => text += m.toCode() + " ");
        return text.trim();
    }

    static random(type = MoveType.MANUAL) {
        const sideIndex = Math.round(Math.random() * Movement.#sides.length) % Movement.#sides.length;
        const side = Movement.#sides[sideIndex];
        const direction = (Math.random() > 0.5) ? MoveDirection.CLOCKWISE : MoveDirection.COUNTERCLOCKWISE;
        return new Movement(side, direction, type);
    }

    toCode() {
        return Movement.#codeToMovement.entries().filter(e => e[1].side === this.side && e[1].direction === this.direction).toArray()[0][0];
    }

    // The whole function could be just a lookup table
    // We want to know the movement after the cube os rotated so that an arbitrarily selected side becomes a front side
    translate(frontSide) {
        if(this.side === SideType.UP || this.side === SideType.DOWN) return this;

        // Assess side orientation - we should get either UP or DOWN and after translation this should be the same result
        const rightSideBefore = nextSide(SideType.UP, this.side, MoveDirection.CLOCKWISE);
        const nextSideBefore = nextSide(this.side, rightSideBefore, this.direction);

        const distance = sideDistance(SideType.UP, SideType.FRONT, frontSide);
        let translatedSide;
        switch (distance.length) {
            case 2: translatedSide = opposideSides.get(this.side); break;
            case 0: translatedSide = this.side; break;
            case 1: translatedSide = nextSide(SideType.UP, this.side, distance[0]); break;
        }
        // Now verify the direction, if the result is not the same we should flip it
        const rightSideAfter = nextSide(SideType.UP, translatedSide, MoveDirection.CLOCKWISE);
        const nextSideAfter = nextSide(translatedSide, rightSideAfter, this.direction);
        const translatedDirection = nextSideBefore === nextSideAfter ? this.direction : reverseDirection(this.direction);

        return new Movement(translatedSide, translatedDirection, this.type);
    }

    reverse() {
        return new Movement(this.side, reverseDirection(this.direction), this.type);
    }

    isReverseOf(other) {
        return this.side === other.side && this.direction === reverseDirection(other.direction);
    }

    withType(type) {
        this.type = type;
        return this;
    }
}

export class RubikCube {
    center;
    size;
    cubes = [];
    animation;
    history = [];
    planned = [];
    planes = [];

    constructor(center, size) {
        this.center = center;
        this.size = size;
        this.cubes = this.#generateCubes();
        this.animation = new SideAnimation();
        this.history = [];
        this.planes = [];
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

    #preparePlanes(observer) {
        this.planes = [];
        for (let cube of this.cubes) {
            for (let plane of cube.planes) {
                this.planes.push(plane);
            }
        }
        this.planes.sort((a, b) => {
            let distA = Vector3D.fromPoints(observer, a.center).length();
            let distB = Vector3D.fromPoints(observer, b.center).length();
            return distB - distA;
        });
    }

    draw(canvas, ctx, observer, rotationCenter) {
        this.animate();

        this.rotate(scene.rotationMatrix, rotationCenter, false);
        // Draw all cubes' planes instead of drawing cubes. We must sort planes anyway in order to properly render image.
        this.#preparePlanes(observer);
        this.planes.forEach(plane => plane.project(observer, canvas).draw(canvas, ctx, false, true, true));
        this.drawSelection(canvas, ctx);
        this.rotate(scene.rotationMatrix, rotationCenter, true);
    }

    drawSelection(canvas, ctx) {
        // Show border of all selected frames even if not visible
        this.planes
            .filter(p => p.metadata.selected)
            .forEach(p => p.plane2D.draw(canvas, ctx, false, true, false));
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

    startMoveSide(movement = null) {
        let nextMove = null;
        if(movement) nextMove = movement;
        else if(this.planned.length > 0) {
            nextMove = this.planned[0];
            this.planned.splice(0, 1);
        }
        if(nextMove) this.animation.start(nextMove);
    }

    getCurrentMove() {
        return this.animation.movement;
    }

    animate() {
        if(!this.animation.ongoing) return;

        this.animation.continue();
        this.#moveSide(this.animation.movement, this.animation.movedAngle);

        if(!this.animation.ongoing) {
            // Conclude animation - update cubes' coords
            this.#finishMoveSide(this.animation.movement);
        }
    }

    #moveSide(movement, angleDeg) {
        const counterClockwiseFlag = movement.direction === MoveDirection.COUNTERCLOCKWISE;
        const matrix = Scene.rotationMatrix(sideAxis.get(movement.side), angleDeg * Scene.deg2rad);
        for (let c of this.#sideCubes(movement.side)) c.rotate(matrix, this.#rotationCenter(movement.side), true, counterClockwiseFlag);

    }

    #finishMoveSide(movement) {
        let coordsDirection = reverseDirection(movement.direction);
        if(movement.side === SideType.UP || movement.side === SideType.DOWN) coordsDirection = movement.direction;
        for (let c of this.#sideCubes(movement.side)) c.rotateSide(movement.side, coordsDirection);
        const lastMove = this.history.length > 0 ? this.history[this.history.length - 1] : null;
        // If last movement is reversed we do not want to put the pair of moves into history
        if(lastMove && movement.isReverseOf(lastMove) && lastMove.type === MoveType.REVERSE && movement.type === MoveType.REVERSE) {
            console.log("removing reverse history entries");
            this.history.splice(this.history.length - 1, 1);
        } else {
            this.history.push(movement);
        }
    }

    shuffle(moves) {
        this.deselectPlanes();
        for(let i = 0; i < moves; i++) {
            const movement = Movement.random();
            this.#moveSide(movement, 90);
            this.#finishMoveSide(movement);
        }
    }

    getEdgeCubes() {
        const edges = [];
        for(let c of this.cubes) {
            if(
                (c.metadata.coords.x === 0 && c.metadata.coords.y !== 0 && c.metadata.coords.z !== 0) ||
                (c.metadata.coords.x !== 0 && c.metadata.coords.y === 0 && c.metadata.coords.z !== 0) ||
                (c.metadata.coords.x !== 0 && c.metadata.coords.y !== 0 && c.metadata.coords.z === 0))
                edges.push(c);
        }
        return edges;
    }

    getCornerCubes() {
        const corners = [];
        for(let c of this.cubes) {
            if((c.metadata.coords.x !== 0 && c.metadata.coords.y !== 0 && c.metadata.coords.z !== 0))
                corners.push(c);
        }
        return corners;
    }

    clearHistory() {
        this.history = [];
    }

    isSolved() {
        const notSolved = this.cubes.find(c => !c.isInPlace());
        return notSolved === undefined;
    }

    planMoves(moves) {
        moves.forEach(m => this.planned.push(m));
    }

    hasPlannedMoves(length = 1) {
        return this.planned.length > (length - 1);
    }

    revertOneMove() {
        const lastMove = this.history.length > 0 ? this.history[this.history.length - 1] : null;
        const reverseMove = lastMove ? lastMove.reverse().withType(MoveType.REVERSE) : null;
        const firstPlanned = this.hasPlannedMoves() ? this.planned[0] : null;
        const secondPlanned = this.hasPlannedMoves(2) ? this.planned[1] : null;
        const consecutiveReverse = lastMove && firstPlanned && secondPlanned &&
            firstPlanned.type === MoveType.REVERSE && secondPlanned.type === MoveType.REVERSE &&
            firstPlanned.isReverseOf(secondPlanned) && lastMove.isReverseOf(firstPlanned);
        if(!consecutiveReverse && lastMove) {
            // Plan the move again
            this.planned.splice(0, 0, lastMove.withType(MoveType.REVERSE));
            this.planned.splice(0, 0, reverseMove);
        }
    }

    deselectPlanes() {
        this.cubes.forEach(c => c.planes.forEach(p => p.deselect()));
    }

    analyzeSelection(selectionPoint, colorChangePoint) {
        let shouldRefresh = false;
        const selectionFlag = selectionPoint.x > -1;
        const colorChangeFlag = colorChangePoint.x > -1;
        const invisibleSelectedPlanes = this.planes.filter(p => p.metadata.selected && !p.plane2D.isVisible);
        invisibleSelectedPlanes.forEach(p => p.deselect());
        // NOTE: we do NOT want to select or change center cubes
        const visiblePlanes = this.planes
            .filter(p => p.plane2D.isVisible && p.metadata.orientation !== null && !p.metadata.cubeCoords.isCenter());
        for(let p of visiblePlanes) {
            const planeToAnalyze = p.plane2D;
            // In case first selection event occurs simultaneously with color change, only the selection should be done
            if(colorChangeFlag && p.metadata.selected) {
                const isInsideColorChange = planeToAnalyze.isInside(colorChangePoint.x, colorChangePoint.y);
                if(isInsideColorChange) {
                    p.metadata.style = nextStyle(p.metadata.style);
                    shouldRefresh = true;
                }
            }
            if(selectionFlag) {
                const isInsideSelect = planeToAnalyze.isInside(selectionPoint.x, selectionPoint.y);
                const prevSelected = p.metadata.selected;
                if(isInsideSelect) p.select();
                else p.deselect();
                shouldRefresh = shouldRefresh || p.metadata.selected !== prevSelected;
            }
        }
        return shouldRefresh;
    }

    reset() {
        this.cubes.forEach(c => c.planes.forEach(p => p.metadata.resetStyle()));
    }
}

export class Rotation {
    speed = new Map();
    step = new Map();
    minRotate;
    maxRotate;
    rotateRange;
    rotateScale;

    constructor(range) {
        this.rotateRange = range;
        this.maxRotate = Math.trunc(this.rotateRange/2);
        this.minRotate = -this.maxRotate;
        this.rotateScale = 2 / this.rotateRange; // set-up experimentally
        this.step.set(Axis.X, this.rotateScale);
        this.step.set(Axis.Y, this.rotateScale);
        this.step.set(Axis.Z, this.rotateScale);
    }

    set(axis, value) {
        if(value < this.minRotate || value > this.maxRotate) return;

        const reverseFlag = axis === Axis.X ? 1 : -1;
        this.speed.set(axis, reverseFlag * value * this.step.get(axis));
    }

    isActive() { return this.speed.entries().find(p => p[1] !== 0) !== undefined;}
    has(axis) { return this.speed.has(axis); }
    get(axis) { return this.has(axis) ? this.speed.get(axis) : 0; }

    rotateOneAxisWhenDragging(delta, axis, axisMultiplier = 1) {
        const multiplier = Math.abs(delta) > 4 ? 2 : Math.abs(delta) >= 1 ? 1 : 0;
        if (delta > 1) this.speed.set(axis, -this.step.get(axis) * multiplier * axisMultiplier)
        else if (delta < -1) this.speed.set(axis, this.step.get(axis) * multiplier * axisMultiplier)
        else this.speed.delete(axis);
    }

    clear() {
        this.speed.clear();
    }
}