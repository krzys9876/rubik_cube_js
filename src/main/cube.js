import {Coords3D, Plane3D, PlaneMetadata, Point3D, Vector3D} from "./geometry.js";
import {globalStyle, MoveDirection, reverseDirection, sideAxis, sideStyles, SideType} from "./common.js";
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
            new PlaneMetadata(styles[0], orientation[0], this.metadata.toText()))); // front
        this.planes.push(new Plane3D([this.points[7].clone(), this.points[6].clone(), this.points[5].clone(), this.points[4].clone()],
            new PlaneMetadata(styles[1], orientation[1], this.metadata.toText()))); // back
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[5].clone(), this.points[1].clone(), this.points[0].clone()],
            new PlaneMetadata(styles[2], orientation[2], this.metadata.toText()))); // up
        this.planes.push(new Plane3D([this.points[3].clone(), this.points[2].clone(), this.points[6].clone(), this.points[7].clone()],
            new PlaneMetadata(styles[3], orientation[3], this.metadata.toText()))); // down
        this.planes.push(new Plane3D([this.points[1].clone(), this.points[5].clone(), this.points[6].clone(), this.points[2].clone()],
            new PlaneMetadata(styles[4], orientation[4], this.metadata.toText()))); // left
        this.planes.push(new Plane3D([this.points[4].clone(), this.points[0].clone(), this.points[3].clone(), this.points[7].clone()],
            new PlaneMetadata(styles[5], orientation[5], this.metadata.toText()))); // right
    }

    rotate(matrix, center, updateCoords, reverse = false) {
        for (let plane of this.planes) {
            plane.rotate(matrix, center, reverse)
            if(updateCoords) {
                plane.metadata.updateText(this.metadata.toText());
            }
        }
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
        this.metadata.selected = true;
        this.planes.forEach(p => p.select());
    }

    isInPlace() {
        const actualSides = this.getSides();
        const correctSides = actualSides.filter(p => sideStyles.get(p.metadata.orientation).name === p.metadata.style.name);
        return actualSides.length === correctSides.length && actualSides.length > 0;
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
    static step = 45;
    ongoing;
    currentAngle;
    movement;

    constructor() {
        this.stop();
    }

    start(movement) {
        if(this.ongoing) return;

        this.movement = movement;
        this.currentAngle = 0;
        this.ongoing = true;
    }

    continue() {
        if(!this.ongoing) return;
        this.currentAngle = this.currentAngle + SideAnimation.step;
        if(Math.round(this.currentAngle)>=90) this.stop();
    }

    stop() {
        if(!this.ongoing) return;

        this.ongoing = false;
        this.currentAngle = 0;
        this.side = null;
        this.direction = null;
    }
}

export class Movement {
    static #sides = [SideType.FRONT, SideType.BACK, SideType.UP, SideType.DOWN, SideType.LEFT, SideType.RIGHT];
    static #codeToMovement = new Map([
        ["U", new Movement(SideType.UP, MoveDirection.CLOCKWISE)],
        ["U1", new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE)],
        ["D", new Movement(SideType.DOWN, MoveDirection.COUNTERCLOCKWISE)],
        ["D1", new Movement(SideType.DOWN, MoveDirection.CLOCKWISE)],
        ["F", new Movement(SideType.FRONT, MoveDirection.COUNTERCLOCKWISE)],
        ["F1", new Movement(SideType.FRONT, MoveDirection.CLOCKWISE)],
        ["B", new Movement(SideType.BACK, MoveDirection.CLOCKWISE)],
        ["B1", new Movement(SideType.BACK, MoveDirection.COUNTERCLOCKWISE)],
        ["L", new Movement(SideType.LEFT, MoveDirection.COUNTERCLOCKWISE)],
        ["L1", new Movement(SideType.LEFT, MoveDirection.CLOCKWISE)],
        ["R", new Movement(SideType.RIGHT, MoveDirection.CLOCKWISE)],
        ["R1", new Movement(SideType.RIGHT, MoveDirection.COUNTERCLOCKWISE)]
    ]);

    side;
    direction;

    constructor(side, direction) {
        this.side = side;
        this.direction = direction;
    }

    static from(code) {
        if(code === "S") return Movement.random();
        else return Movement.#codeToMovement.has(code) ? Movement.#codeToMovement.get(code) : null;
    }

    static random() {
        const sideIndex = Math.round(Math.random() * Movement.#sides.length) % Movement.#sides.length;
        const side = Movement.#sides[sideIndex];
        const direction = (Math.random() > 0.5) ? MoveDirection.CLOCKWISE : MoveDirection.COUNTERCLOCKWISE;
        return new Movement(side, direction);
    }

    toCode() {
        return Movement.#codeToMovement.entries().filter(e => e[1].side === this.side && e[1].direction === this.direction).toArray()[0][0];
    }

}

export class RubikCube {
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

    startMoveSide(movement) {
        this.animation.start(movement);
    }

    animate() {
        if(!this.animation.ongoing) return;

        this.#moveSide(this.animation.movement, SideAnimation.step);

        this.animation.continue();
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

    }

    shuffle(moves) {
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
}
