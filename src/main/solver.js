import {MoveDirection, sideDistance, sideStyles, SideType, styleSide } from "./common.js";
import {Movement} from "./cube.js";

export class RubikSolver {
    cube;

    constructor(cube) {
        this.cube = cube;
    }

    // LBL method (layer by layer)
    solveLBL() {
        let movements = [];
        const whiteCrossMovements = this.solveWhiteCross();
        movements = movements.concat(whiteCrossMovements);
        return movements;
    }

    solveWhiteCross() {
        const movements = [];
        const edges = this.cube.getEdgeCubes();

        /**
         * We have the following cases to address:
         * 1. Correct white edges (white on bottom and correct side) - we skip these cubes
         * 2. White edges with white on bottom and other color on the side
         * 3. White edges with white on upper side
         * TBC
          */


        // Case 1
        const bottomEdges = edges.filter(e => e.metadata.coords.y === -1 && !e.isInPlace());
        if(bottomEdges.length === 0) return [];

        // Case 2
        const whiteBottomEdges = bottomEdges.filter(e => e.hasSideInPlace(SideType.DOWN));
        if(whiteBottomEdges.length > 0) {
            const edge = whiteBottomEdges[0];
            // NOTE: the ther side must exist, hence [0]
            const otherSide = edge.getSides().filter(e => e.metadata.orientation !== SideType.DOWN)[0];
            const targetSide = styleSide(otherSide.metadata.style);
            const distance = sideDistance(otherSide.metadata.orientation,targetSide);
            movements.push(new Movement(otherSide.metadata.orientation, MoveDirection.CLOCKWISE));
            movements.push(new Movement(otherSide.metadata.orientation, MoveDirection.CLOCKWISE));
            distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            return movements;
        }

        // Case 3
        const whiteUpperEdges = edges.filter(e => e.metadata.coords.y === 1 && e.hasSide(SideType.UP, sideStyles.get(SideType.DOWN)));
        if(whiteUpperEdges.length > 0) {
            const edge = whiteUpperEdges[0];
            const otherSide = edge.getSides().filter(e => e.metadata.orientation !== SideType.UP)[0];
            const targetSide = styleSide(otherSide.metadata.style);
            const distance = sideDistance(otherSide.metadata.orientation,targetSide);
            distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            return movements;
        }


        return [];
    }
}