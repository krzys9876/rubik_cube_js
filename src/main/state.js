import {FlagController} from "./task.js";
import {Rotation, RubikCube} from "./cube.js";
import {Point3D, Vector3D} from "./geometry.js";

export class State {
    counter = 0;
    shuffle = new FlagController();
    solve = new FlagController();
    rotate = new Rotation(9);
    stepByStep = false;
    runNextStep = false;
    revertLast = false;
    forceRefresh = false;
    doubleClicked = {x: -1, y: -1};
    singleClicked = {x: -1, y: -1};
    dragStart = {x: -1, y: -1};
    mouseDragging = false;
    tasks = [];
    currentMoveNo = 1;

    constructor(scene) {
        this.scene = scene;
        this.rotationCenter = new Point3D(0,0,3);
        const cubeCenter = this.rotationCenter.clone().moveBy(new Vector3D(0, 0, 0));
        this.cube = new RubikCube(cubeCenter, 1.6);
        this.observer = new Point3D(0,0,-Point3D.focalLength);
    }

    isAutoMoving() {
        return this.cube.hasPlannedMoves() || this.cube.animation.ongoing;
    }

    isClickEvent() {
        return this.doubleClicked.x > -1 || this.singleClicked.x > -1;
    }

    taskReady() {
        return this.tasks.length > 0 && !this.tasks[0].running
    }

    startNextTaskIfReady() {
        if(this.taskReady()) this.tasks[0].start();
    }

    cubeClicked() {
        return this.cube.analyzeSelection(this.doubleClicked, this.singleClicked);
    }

    clearClick() {
        this.doubleClicked = {x: -1, y: -1};
        this.singleClicked = {x: -1, y: -1};
    }

    redrawCube(canvas, ctx) {
        this.cube.draw(canvas, ctx, this.scene, this.observer, this.rotationCenter);
    }

    finalizeActiveTask() {
        if(this.tasks.length > 0) {
            this.tasks[0].stop();
            this.tasks[0].tryEnd();
            if(!this.tasks[0].running) this.tasks.splice(0, 1);
        }
    }

    noMoreMoves() {
        return !this.cube.hasPlannedMoves();
    }

    updateSolve(newSolve) {
        if(this.solve.active === newSolve) return false;

        if(newSolve) this.solve.start();
        else this.solve.stop();

        return true;
    }

    isSolved() { return !this.solve.active; }
}