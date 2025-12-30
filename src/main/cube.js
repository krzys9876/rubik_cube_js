import {Coords3D, Plane3D, Point3D, Vector3D} from "./geometry.js";
import {MoveDirection, sideAxis, SideType} from "./common.js";
import {Scene} from "./scene.js";

// Using Coords3D may be an overkill (floating point operations for simple 1/-1 coords) but performance-wise it is irrelevant.
// All we need are roundings
export class CubeCoords extends Coords3D {
    static rotationCenter = new Coords3D(0, 0, 0);

    rotateSide(sideType, direction) {
        let deg90 = Math.PI / 2;

        switch (sideType) {
            case SideType.FRONT: deg90 = -deg90; break;
            case SideType.BACK: deg90 = -deg90; break;
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
    // TODO: add colors facing each side and maintain colors when cube is rotated

    constructor(coords) {
        this.coords = coords;
    }

    static create(x, y, z) {
        return new CubeMetadata(new CubeCoords(x, y, z));
    }
}

export class Cube {
    points = [];
    styles = [];
    planes = [];
    metadata;

    constructor(points, styles, metadata) {
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

    static generate(center, sizeX, sizeY, sizeZ, styles, x, y, z) {
        let points = []

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z - sizeZ / 2));

        points.push(new Point3D(center.x + sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y + sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x - sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));
        points.push(new Point3D(center.x + sizeX / 2,center.y - sizeY / 2, center.z + sizeZ / 2));

        return new Cube(points, styles, CubeMetadata.create(x, y, z));
    }
}
