import {
    MoveDirection,
    reverseDirection,
    sideDistance,
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

        console.log("White cross stage");
        const whiteCrossMovements = this.solveWhiteCross();
        movements = movements.concat(whiteCrossMovements);
        whiteCrossMovements.forEach(m => console.log(m.toCode()));

        if(whiteCrossMovements.length === 0) {
            console.log("White corners stage");
            const whiteCornersMovements = this.solveWhiteCorners();
            movements = movements.concat(whiteCornersMovements);
            whiteCornersMovements.forEach(m => console.log(m.toCode()));
        }

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
         **/

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
            const distance = sideDistance(SideType.UP, otherSide.metadata.orientation,targetSide);
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
            const distance = sideDistance(SideType.UP, otherSide.metadata.orientation,targetSide);
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
                const distance = sideDistance(otherSide.metadata.orientation, whiteSide.metadata.orientation, SideType.DOWN);
                distance.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, d)));
                return movements;
            } else {
                // Case 5 - do not solve it, rather convert it to case 3 (white on top)
                console.log("case 5");
                const distance1 = sideDistance(otherSide.metadata.orientation, whiteSide.metadata.orientation,SideType.UP);
                //const distance1 = sideDistance(whiteSide.metadata.orientation,SideType.UP);
                distance1.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, d)));
                const targetSide = styleSide(otherSide.metadata.style);
                const distance2 = sideDistance(SideType.UP, otherSide.metadata.orientation,targetSide);
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
            const distance = sideDistance(SideType.UP, whiteSide.metadata.orientation, targetSide);
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

    solveWhiteCorners() {
        const movements = [];
        const corners = this.cube.getCornerCubes();

        /**
         * We have the following cases to address:
         * 1. Correct white corners (white on bottom and correct side) - we skip these cubes
         * 2. White on upper edge on top side of the corner
         * 3. White on upper edge on the left side of the corner
         * 4. White on upper edge on the right side of the corner
         * 5. White on lower edge - convert to other cases
         * TBC
         **/

        // Case 1
        const bottomCorners = corners.filter(c => c.metadata.coords.y === -1 && !c.isInPlace());
        if(bottomCorners.length === 0) {
            console.log("case 1");
            return [];
        }

        // Case 2
        const whiteTopCorners = corners.filter(c => c.metadata.coords.y === 1 && c.hasSide(SideType.UP, sideStyles.get(SideType.DOWN)));
        if(whiteTopCorners.length > 0) {
            console.log("case 2");
            const corner = whiteTopCorners[0];

            const otherSides = corner.getSides().filter(e => e.metadata.style.name !== sideStyles.get(SideType.DOWN).name);
            const otherSide1 = otherSides[0];
            const otherSide2 = otherSides[1];
            const distance1 = sideDistance(SideType.UP, otherSide1.metadata.orientation, styleSide(otherSide1.metadata.style));
            const distance2 = sideDistance(SideType.UP, otherSide2.metadata.orientation, styleSide(otherSide2.metadata.style));
            const distanceBetween = sideDistance(SideType.UP, otherSide1.metadata.orientation, otherSide2.metadata.orientation);

            // order other sides (left and right) to simplify further steps
            const otherSideLeft = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? otherSide1 : otherSide2;
            const otherSideRight = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? otherSide2 : otherSide1;
            const distanceLeft = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? distance1 : distance2;
            const distanceRight = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? distance2 : distance1;

            if(distanceLeft.length === 2) movements.push(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
            else if(distanceRight.length === 2) movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
            else if(distanceLeft[0] === MoveDirection.CLOCKWISE) {
                movements.push(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
                movements.push(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
            }

            // Now we have the corner prepared for a sequence from the guide
            if(movements.length >0 ) return movements;

            // R U U R1 U1 R U R1 where front is the left side
            console.log("algorithm3");
            const directionR = sideDistance(otherSideRight.metadata.orientation, otherSideLeft.metadata.orientation, SideType.UP)[0];
            movements.push(new Movement(otherSideRight.metadata.orientation, directionR));
            movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
            movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
            movements.push(new Movement(otherSideRight.metadata.orientation, reverseDirection(directionR)));
            movements.push(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
            movements.push(new Movement(otherSideRight.metadata.orientation, directionR));
            movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
            movements.push(new Movement(otherSideRight.metadata.orientation, reverseDirection(directionR)));

            return movements
        }

        // case 3, 4
        const sideTopCorners = corners.filter(c => c.metadata.coords.y === 1 &&
            (c.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN))));
        if(sideTopCorners.length > 0) {
            const corner = sideTopCorners[0];

            const whiteSide = corner.getSides().filter(e => e.metadata.style.name === sideStyles.get(SideType.DOWN).name)[0];
            const otherSide = corner.getSides().filter(e => e.metadata.style.name !== sideStyles.get(SideType.DOWN).name &&
                e.metadata.orientation !== SideType.UP)[0];
            const distance = sideDistance(SideType.UP, otherSide.metadata.orientation, styleSide(otherSide.metadata.style));
            // Move the corner in place to prepare for next sequence
            if(distance.length > 0) {
                distance.forEach( d => movements.push(new Movement(SideType.UP, d)));
                return movements;
            }

            // Let's determine which side is white on
            const distanceBetween = sideDistance(SideType.UP, whiteSide.metadata.orientation, otherSide.metadata.orientation);
            if(distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE) {
                // case 3, white on left
                // L1 U1 L, front os other side
                console.log("case 3");
                const directionW = sideDistance(whiteSide.metadata.orientation, otherSide.metadata.orientation, SideType.UP)[0];
                movements.push(new Movement(whiteSide.metadata.orientation, directionW));
                movements.push(new Movement(SideType.UP, MoveDirection.COUNTERCLOCKWISE));
                movements.push(new Movement(whiteSide.metadata.orientation, reverseDirection(directionW)));
            } else {
                console.log("case 4");
                // R U R1, front os other side
                const directionW = sideDistance(whiteSide.metadata.orientation, otherSide.metadata.orientation, SideType.UP)[0];
                movements.push(new Movement(whiteSide.metadata.orientation, directionW));
                movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
                movements.push(new Movement(whiteSide.metadata.orientation, reverseDirection(directionW)));
            }
            return movements;
        }

        // case 5
        const sideDownCorners = corners.filter(c => c.metadata.coords.y === -1 && !c.isInPlace() &&
            (c.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.DOWN, sideStyles.get(SideType.DOWN))));
        if(sideDownCorners.length > 0) {
            console.log("case 5");
            const corner = sideDownCorners[0];

            // Let's determine any side (except for down side) and move the corner to upper side
            const otherSides = corner.getSides().filter(e => e.metadata.orientation !== SideType.DOWN);
            const otherSide1 = otherSides[0];
            const otherSide2 = otherSides[1];
            const directionU = sideDistance(otherSide1.metadata.orientation, otherSide2.metadata.orientation, SideType.UP)[0];
            movements.push(new Movement(otherSide1.metadata.orientation, directionU));
            movements.push(new Movement(SideType.UP, MoveDirection.CLOCKWISE));
            movements.push(new Movement(otherSide1.metadata.orientation, reverseDirection(directionU)));

            return movements;
        }

        return [];
    }
}

// Test sequence for white cross, case 5
// R B1 U1 R1 F1 D F1 U B1 B D B B1 U L B B U L1 F1 B L B1 B1 F1 R1 U B B

// Initial sequence for white corners:
// D R R U F1 F1 L1 L1 U B B L1 U R R L1

// Test sequence for white corners, case 3
// D R R U F1 F1 L1 L1 U B B L1 L1 U R R U1 F U U F1 U1 F U F1 U B U U B1 U1 B U B1

// Test sequence for white corners, case 5
// L R1 L1 L1 F L B L D1 F D1 L B1 R U U R1 L1 L1 F R U B1 U1 B U1 U1 B U U B1 U1 B U B1
