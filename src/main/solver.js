import {Movement} from "./cube.js";
import {MoveDirection, SideType} from "./common.js";

export class RubikSolver {
    cube;

    constructor(cube) {
        this.cube = cube;
    }

    // LBL method (?layer by layer)
    solveLBL() {
        const movements = [];
        movements.push(this.solveWhiteCross());
        return movements;
    }

    solveWhiteCross() {
        return [new Movement(SideType.LEFT, MoveDirection.CLOCKWISE)];
    }
}