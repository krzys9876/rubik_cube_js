import { SideType} from "./common.js";

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
        const edges = this.cube.getEdgeCubes();
        // Leave edges in place unchanged
        const bottomEdges = edges.filter(e => e.metadata.coords.y === -1 && !e.isInPlace());
        const whiteBottomEdges = bottomEdges.filter(e => e.hasSideInPlace(SideType.DOWN));

        console.log(whiteBottomEdges);

        if(whiteBottomEdges.length > 0) {
            const edge = whiteBottomEdges[0];
            edge.select();
            //const otherSide = edge.
        }

        return [];
    }
}