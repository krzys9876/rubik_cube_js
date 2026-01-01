import {
    MoveDirection,
    reverseDirection,
    sideDistance2,
    sideStyles,
    SideType,
    styleSide
} from "./common.js";
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
        console.log("Generated: ");
        movements.forEach(m => console.log(m.toCode()));
        return movements;
    }

    solveWhiteCross() {
        const movements = [];
        const edges = this.cube.getEdgeCubes();

        /**
         * We have the following cases to address:
         * 1. Correct white edges (white on bottom and correct side) - we skip these cubes
         * 2. White on bottom and other color on the side
         * 3. White on upper side
         * 4. White on the vertical edge and the other side of the cube is correct
         * 5. White on the vertical edge and the other side of the cube is incorrect - convert to case 3
         * 6. White on vertical side of upper edges - convert to case 4/5
         * 7. White on vertical side of down edges - convert to case 4/5
         * TBC
          */


        // Case 1
        const bottomEdges = edges.filter(e => e.metadata.coords.y === -1 && !e.isInPlace());
        if(bottomEdges.length === 0) {
            console.log("case 1");
            return [];
        }

        // Case 2
        const whiteBottomEdges = bottomEdges.filter(e => e.hasSideInPlace(SideType.DOWN));
        if(whiteBottomEdges.length > 0) {
            console.log("case 2");
            const edge = whiteBottomEdges[0];
            // NOTE: the ther side must exist, hence [0]
            const otherSide = edge.getSides().filter(e => e.metadata.orientation !== SideType.DOWN)[0];
            const targetSide = styleSide(otherSide.metadata.style);
            movements.push(new Movement(otherSide.metadata.orientation, MoveDirection.CLOCKWISE));
            movements.push(new Movement(otherSide.metadata.orientation, MoveDirection.CLOCKWISE));
            const distance = sideDistance2(SideType.UP, otherSide.metadata.orientation,targetSide);
            distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            return movements;
        }

        // Case 3
        const whiteUpperEdges = edges.filter(e => e.metadata.coords.y === 1 && e.hasSide(SideType.UP, sideStyles.get(SideType.DOWN)));
        if(whiteUpperEdges.length > 0) {
            console.log("case 3");
            const edge = whiteUpperEdges[0];
            const otherSide = edge.getSides().filter(e => e.metadata.orientation !== SideType.UP)[0];
            const targetSide = styleSide(otherSide.metadata.style);
            const distance = sideDistance2(SideType.UP, otherSide.metadata.orientation,targetSide);
            distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            return movements;
        }

        // Case 4, 5
        const whiteSideEdges = edges.filter(e => e.metadata.coords.y === 0 &&
            (e.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN))));

        if(whiteSideEdges.length > 0) {
            const edge = whiteSideEdges[0];
            const whiteSide = edge.getSides().filter(e => e.metadata.style.name === sideStyles.get(SideType.DOWN).name)[0];
            const otherSide = edge.getSides().filter(e => e.metadata.style.name !== sideStyles.get(SideType.DOWN).name)[0];

            if(otherSide.metadata.style.name === sideStyles.get(otherSide.metadata.orientation).name) {
                // Case 4
                console.log("case 4");
                const distance = sideDistance2(otherSide.metadata.orientation, whiteSide.metadata.orientation, SideType.DOWN);
                distance.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, d)));
                return movements;
            } else {
                // Case 5 - do not solve it, rather convert it to case 3 (white on top)
                console.log("case 5");
                const distance1 = sideDistance2(otherSide.metadata.orientation, whiteSide.metadata.orientation,SideType.UP);
                //const distance1 = sideDistance(whiteSide.metadata.orientation,SideType.UP);
                distance1.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, d)));
                const targetSide = styleSide(otherSide.metadata.style);
                const distance2 = sideDistance2(SideType.UP, otherSide.metadata.orientation,targetSide);
                distance2.forEach(d => movements.push(new Movement(SideType.UP, d)));
                distance1.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, reverseDirection(d))));
                return movements;
            }
        }

        // Case 6
        const whiteUpperSideEdges = edges.filter(e => e.metadata.coords.y === 1 &&
            (e.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN))));

        if(whiteUpperSideEdges.length > 0) {
            console.log("case 6");
            const edge = whiteUpperSideEdges[0];
            const whiteSide = edge.getSides().filter(e => e.metadata.style.name === sideStyles.get(SideType.DOWN).name)[0];
            const otherSide = edge.getSides().filter(e => e.metadata.style.name !== sideStyles.get(SideType.DOWN).name)[0];

            const targetSide = styleSide(otherSide.metadata.style);
            const distance = sideDistance2(SideType.UP, whiteSide.metadata.orientation, targetSide);
            distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
            movements.push(new Movement(targetSide, MoveDirection.CLOCKWISE));
            return movements;
        }

        // Case 7
        const whiteDownSideEdges = edges.filter(e => e.metadata.coords.y === -1 &&
            (e.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                e.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN))));

        if(whiteDownSideEdges.length > 0) {
            console.log("case 7");
            const edge = whiteDownSideEdges[0];
            const whiteSide = edge.getSides().filter(e => e.metadata.style.name === sideStyles.get(SideType.DOWN).name)[0];
            movements.push(new Movement(whiteSide.metadata.orientation, MoveDirection.CLOCKWISE));
            return movements;
        }
        return [];
    }
}

// Test sequence for case 5
// R B1 U1 R1 F1 D F1 U B1 B D B B1 U L B B U L1 F1 B L B1 B1 F1 R1 U B B