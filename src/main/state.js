import {FlagController} from "./task.js";
import {Rotation, RubikCube} from "./cube.js";
import {Point3D, Vector3D} from "./geometry.js";

export function createState(scene) {
    const rotationCenter = new Point3D(0,0,3);
    const observer = new Point3D(0,0,-Point3D.focalLength);
    const cubeCenter = rotationCenter.clone().moveBy(new Vector3D(0, 0, 0));
    const cube = new RubikCube(cubeCenter, 1.6);

    return {
        scene,
        cube,
        observer,
        rotationCenter,
        counter: 0,
        shuffle: new FlagController(),
        solve: new FlagController(),
        rotate: new Rotation(9),
        stepByStep: false,
        runNextStep: false,
        revertLast: false,
        forceRefresh: false,
        doubleClicked: {x: -1, y: -1},
        singleClicked: {x: -1, y: -1},
        dragStart: {x: -1, y: -1},
        mouseDragging: false,
        tasks: [],
        currentMoveNo: 1
    }
}