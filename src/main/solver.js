import {
    MoveDirection, nextSide,
    reverseDirection,
    sideDistance,
    sideStyles,
    SideType,
    styleSide
} from "./common.js";
import {Movement} from "./cube.js";

export class RubikSolver {
    cube;
    debug;

    constructor(cube, debug) {
        this.cube = cube;
        this.debug = debug;
    }

    // LBL method (layer by layer)
    solveLBL() {
        if(this.debug) console.log("White cross stage");
        const whiteCrossMovements = this.solveWhiteCross();
        if(whiteCrossMovements.length > 0) return whiteCrossMovements;

        if(this.debug) console.log("White corners stage");
        const whiteCornersMovements = this.solveWhiteCorners();
        if(whiteCornersMovements.length > 0) return whiteCornersMovements;

        if(this.debug) console.log("Middle layer stage");
        const midLayerMovements = this.solveMidLayer();
        if(midLayerMovements.length > 0) return midLayerMovements;

        if(this.debug) console.log("Yellow cross stage");
        const yellowCrossMovements = this.solveYellowCross();
        if(yellowCrossMovements.length > 0) return yellowCrossMovements;

        if(this.debug) console.log("Yellow layer stage");
        const yellowLayerMovements = this.solveYellowLayer();
        if(yellowLayerMovements.length > 0) return yellowLayerMovements;

        if(this.debug) console.log("Yellow corners stage");
        const yellowCornersMovements = this.solveYellowCorners();
        if(yellowCornersMovements.length > 0) return yellowCornersMovements;

        if(this.debug) console.log("Yellow edges stage");
        const yellowEdgesMovements = this.solveYellowEdges();
        if(yellowEdgesMovements.length > 0) return yellowEdgesMovements;

        return [];
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
            if(this.debug) console.log("case 1");
            return [];
        }

        // Case 2
        const whiteBottomEdges = bottomEdges.filter(e => e.hasSideInPlace(SideType.DOWN));
        if(whiteBottomEdges.length > 0) {
            if(this.debug) console.log("case 2");
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
            if(this.debug) console.log("case 3");
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
                if(this.debug) console.log("case 4");
                const distance = sideDistance(otherSide.metadata.orientation, whiteSide.metadata.orientation, SideType.DOWN);
                distance.forEach(d => movements.push(new Movement(otherSide.metadata.orientation, d)));
                return movements;
            } else {
                // Case 5 - do not solve it, rather convert it to case 3 (white on top)
                if(this.debug) console.log("case 5");
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
            if(this.debug) console.log("case 6");
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
            if(this.debug) console.log("case 7");
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
         **/

        // Case 1
        const bottomCorners = corners.filter(c => c.metadata.coords.y === -1 && !c.isInPlace());
        if(bottomCorners.length === 0) {
            if(this.debug) console.log("case 1");
            return [];
        }

        // Case 2
        const whiteTopCorners = corners.filter(c => c.metadata.coords.y === 1 && c.hasSide(SideType.UP, sideStyles.get(SideType.DOWN)));
        if(whiteTopCorners.length > 0) {
            if(this.debug) console.log("case 2");
            const corner = whiteTopCorners[0];

            const otherSides = corner.getSides().filter(e => e.metadata.style.name !== sideStyles.get(SideType.DOWN).name);
            const otherSide1 = otherSides[0];
            const otherSide2 = otherSides[1];
            const distance1 = sideDistance(SideType.UP, otherSide1.metadata.orientation, styleSide(otherSide1.metadata.style));
            const distance2 = sideDistance(SideType.UP, otherSide2.metadata.orientation, styleSide(otherSide2.metadata.style));
            const distanceBetween = sideDistance(SideType.UP, otherSide1.metadata.orientation, otherSide2.metadata.orientation);

            // order other sides (left and right) to simplify further steps
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
            const frontSide = nextSide(SideType.UP, otherSideRight.metadata.orientation, MoveDirection.CLOCKWISE);
            return this.#translateSequence("R U U R1 U1 R U R1", frontSide);
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
                if(this.debug) console.log("case 3");
                return this.#translateSequence("L1 U1 L", otherSide.metadata.orientation);
            } else {
                if(this.debug) console.log("case 4");
                // R U R1, front os other side
                return this.#translateSequence("R U R1", otherSide.metadata.orientation);
            }
        }

        // case 5
        const sideDownCorners = corners.filter(c => c.metadata.coords.y === -1 && !c.isInPlace() &&
            (c.hasSide(SideType.LEFT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.RIGHT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.FRONT, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.BACK, sideStyles.get(SideType.DOWN)) ||
                c.hasSide(SideType.DOWN, sideStyles.get(SideType.DOWN))));
        if(sideDownCorners.length > 0) {
            if(this.debug) console.log("case 5");
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

    #solveMidLayerCase2(frontSide) {
        // move to the left, use the sequence from the guide:
        // U1 L1 U L U F U1 F1 front is determined by corner orientation
        return this.#translateSequence("U1 L1 U L U F U1 F1", frontSide);
    }

    #solveMidLayerCase3(frontSide) {
        // move to the right, use the sequence from the guide:
        // U R U1 R1 U1 F1 U F front is determined by corner orientation
        return this.#translateSequence("U R U1 R1 U1 F1 U F", frontSide);
    }

    solveMidLayer() {
        const movements = [];
        const edges = this.cube.getEdgeCubes();

        /**
         * We have the following cases to address:
         * 1. Correct middle edges - we skip these cubes
         * 2. Middle edge is on top and should be moved to the left
         * 3. Middle edge is on top and should be moved to the right
         * 4. Middle edge is in the middle layer but in incorrect position
         **/

        // Case 1
        const midEdges = edges.filter(c => c.metadata.coords.y === 0 && !c.isInPlace());
        if(midEdges.length === 0) {
            if(this.debug) console.log("case 1");
            return [];
        }

        // Case 2, 3
        const topEdges = edges.filter(c => c.metadata.coords.y === 1 && !c.isInPlace() &&
            !c.hasSide(SideType.UP, sideStyles.get(SideType.UP)) &&
            !c.hasSide(SideType.LEFT, sideStyles.get(SideType.UP)) &&
            !c.hasSide(SideType.RIGHT, sideStyles.get(SideType.UP)) &&
            !c.hasSide(SideType.FRONT, sideStyles.get(SideType.UP)) &&
            !c.hasSide(SideType.BACK, sideStyles.get(SideType.UP)));
        if(topEdges.length > 0) {
            if(this.debug) console.log("case 2, 3");
            const edge = topEdges[0];
            const frontSide = edge.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
            const topSide = edge.getSides().filter(s => s.metadata.orientation === SideType.UP)[0];

            // Move upper side so the front side is in place and prepare for the next sequence
            const distanceU = sideDistance(SideType.UP, frontSide.metadata.orientation, styleSide(frontSide.metadata.style));
            if(distanceU.length > 0) {
                distanceU.forEach( d => movements.push(new Movement(SideType.UP, d)));
                return movements;
            }

            // Determine if the top side should be moved right/down or left/down
            const direction = sideDistance(SideType.UP, frontSide.metadata.orientation, styleSide(topSide.metadata.style))[0];
            if(direction === MoveDirection.CLOCKWISE) {
                if(this.debug) console.log("case 2");
                this.#solveMidLayerCase2(frontSide.metadata.orientation).forEach( m => movements.push(m));
            } else {
                if(this.debug) console.log("case 3");
                this.#solveMidLayerCase3(frontSide.metadata.orientation).forEach( m => movements.push(m));
            }
            return movements;
        }

        // case 4
        const midEdgesWrong = edges.filter(c => c.metadata.coords.y === 0 && !c.isInPlace());
        if(midEdgesWrong.length > 0) {
            if(this.debug) console.log("case 4");
            const edge = midEdgesWrong[0];
            const sides = edge.getSides().filter(s => s.metadata.orientation !== SideType.UP);
            const side1 = sides[0];
            const side2 = sides[1];
            const distanceBetween = sideDistance(SideType.UP, side1.metadata.orientation, side2.metadata.orientation);
            const rightSide = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? side2 : side1;

            // We must determine the top edge with which we will flip the cube - choose arbitrary the right side,
            // so we will then move the selected cube to the left - case 2
            const topEdgeToReplace = edges.filter(e => {
                const isTop = e.metadata.coords.y === 1;
                const sides = e.getSides();
                const isRight = sides.filter(s => s.metadata.orientation === rightSide.metadata.orientation).length > 0;
                return isTop && isRight;
            })[0];
            // Use the sequence for case 2 - we will replace the edges and will be able to convert case 4 to case 2 or 3
            const frontSide = topEdgeToReplace.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
            this.#solveMidLayerCase2(frontSide.metadata.orientation).forEach( m => movements.push(m));
            return movements;
        }
        return [];
    }

    solveYellowCross() {
        const movements = [];
        const edges = this.cube.getEdgeCubes();

        /**
         * We have the following cases to address:
         * 1. Complete yellow cross
         * 2. Straight line of yellow edges (this includes 3 yellow cubes, but the line is important)
         * 3. Two yellow edges but not forming a line
         * 4. No yellow edges
         **/

        // case 1
        const topEdges = edges.filter(c => c.metadata.coords.y === 1 && !c.isInPlace());
        if(topEdges.length === 0) {
            if(this.debug) console.log("case 1");
            return [];
        }

        // For each case we follow the sequence from the guide:
        // F R U R1 U1 F1, front is determined by top yellow pattern

        // case 2, 3
        const topEdgesYellow = edges.filter(c => c.metadata.coords.y === 1 && c.hasSide(SideType.UP, sideStyles.get(SideType.UP)));
        if(topEdgesYellow.length === 2) {
            // 2 yellow on top
            // Check if there are two yellow edges on opposite sides
            const edge1Other = topEdgesYellow[0].getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
            const edge2Other = topEdgesYellow[1].getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
            const distanceBetween = sideDistance(SideType.UP, edge1Other.metadata.orientation, edge2Other.metadata.orientation);
            if(distanceBetween.length === 2) {
                if(this.debug) console.log("case 3");
                // let's choose any side between opposite sides as front for the sequence
                const frontSideForSequence = nextSide(SideType.UP, edge1Other.metadata.orientation, MoveDirection.CLOCKWISE);
                this.#solveYellowCross(frontSideForSequence).forEach( m => movements.push(m));
                return movements;
            } else {
                if(this.debug) console.log("case 2");
                // choose proper front side (According to the guide)
                const frontSideForSequence = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ?
                    nextSide(SideType.UP, edge2Other.metadata.orientation, MoveDirection.COUNTERCLOCKWISE) :
                    nextSide(SideType.UP, edge1Other.metadata.orientation, MoveDirection.COUNTERCLOCKWISE);
                this.#solveYellowCross(frontSideForSequence).forEach( m => movements.push(m));
                return movements;
            }
        }

        // case 4
        // In this case it does not matter which side is front
        const topEdgesNoYellow = edges.filter(c => c.metadata.coords.y === 1 && !c.hasSide(SideType.UP, sideStyles.get(SideType.UP)));
        if(topEdgesNoYellow.length >= 3) {
            if(this.debug) console.log("case 4");
            this.#solveYellowCross(SideType.FRONT).forEach( m => movements.push(m));
            return movements;
        }

        return [];
    }

    #solveYellowCross(frontSide) {
        // F R U R1 U1 F1, front is determined by top yellow pattern
        return this.#translateSequence("F R U R1 U1 F1", frontSide);
    }

    solveYellowLayer() {
        const movements = [];
        const corners = this.cube.getCornerCubes();

        /**
         * We have the following cases to address:
         * 1. Complete yellow layer
         * 2. Two or three yellow corners
         * 3. One yellow corner
         * 4. No yellow corners
         **/

        // case 1
        const topCorners = corners.filter(c => c.metadata.coords.y === 1 && !c.hasSide(SideType.UP, sideStyles.get(SideType.UP)));
        if(topCorners.length === 0) {
            if(this.debug) console.log("case 1");
            return [];
        }

        // For each case we follow the sequence from the guide:
        // R U R1 U R U U R1, front is determined by top yellow pattern

        // case 2
        const topCornersYellow = corners.filter(c => c.metadata.coords.y === 1 && c.hasSide(SideType.UP, sideStyles.get(SideType.UP)));
        const otherCorners = corners.filter(c => c.metadata.coords.y === 1 && !c.hasSide(SideType.UP, sideStyles.get(SideType.UP)));
        if(topCornersYellow.length >= 2) {
            if(this.debug) console.log("case 2");
            // We take any corner without yellow on top and select yellow side as front side for the sequence
            const otherCorner = otherCorners[0];
            const yellowSide = otherCorner.getSides().filter(s =>
                s.metadata.orientation !== SideType.UP && s.metadata.style.name === sideStyles.get(SideType.UP).name)[0];
            this.#solveYellowLayer(yellowSide.metadata.orientation).forEach( m => movements.push(m));
            return movements;
        } else if(topCornersYellow.length === 1) {
            if(this.debug) console.log("case 3");
            // We take the yellow corner and select its tight side as front side for the sequence
            const yellowCorner = topCornersYellow[0];
            const otherSides = yellowCorner.getSides().filter(s => s.metadata.orientation !== SideType.UP);
            const otherSide1 = otherSides[0];
            const otherSide2 = otherSides[1];
            const distanceBetween = sideDistance(SideType.UP, otherSide1.metadata.orientation, otherSide2.metadata.orientation);
            const frontSideForSequence = distanceBetween[0] === MoveDirection.COUNTERCLOCKWISE ? otherSide2 : otherSide1;
            this.#solveYellowLayer(frontSideForSequence.metadata.orientation).forEach( m => movements.push(m));
            return movements;
        } else if(topCornersYellow.length === 0) {
            if(this.debug) console.log("case 4");
            // We take any corner without yellow on top and select yellow side as front side for the sequence
            const otherCorner = otherCorners[0];
            const otherSide = otherCorner.getSides().filter(s =>
                s.metadata.orientation !== SideType.UP && s.metadata.style.name !== sideStyles.get(SideType.UP).name)[0];
            this.#solveYellowLayer(otherSide.metadata.orientation).forEach( m => movements.push(m));
            return movements;
        }

        return [];
    }

    #solveYellowLayer(frontSide) {
        // R U R1 U R U U R1, front is determined by top yellow pattern
        return this.#translateSequence("R U R1 U R U U R1", frontSide);
    }

    solveYellowCorners() {
        const movements = [];
        const corners = this.cube.getCornerCubes();

        /**
         * We have the following cases to address:
         * 1. Complete yellow corners
         * 2. Two (incorrect) corners have the same color on the same side
         * 3. No two (incorrect) corners have the same color on the same side
         **/

        // case 1
        const topCornersIncorrect = corners.filter(c => c.metadata.coords.y === 1 && !c.isInPlace());
        if(topCornersIncorrect.length === 0) {
            if(this.debug) console.log("case 1");
            return [];
        }

        // For each case we follow the sequence from the guide:
        // R B1 R F F R1 B R F F R R, front is determined by corners layout

        // case 2
        // Try to find a pair with the same color
        const topCorners = corners.filter(c => c.metadata.coords.y === 1);
        for(let side of [SideType.FRONT, SideType.BACK, SideType.LEFT, SideType.RIGHT]) {
            const corners = topCorners.filter(c => {
                const sides = c.getSides().filter(s => s.metadata.orientation === side);
                return sides.length === 1;
            });
            // NOTE: we analyze only incorrect sides so there may be only one cube on the side
            if (corners.length === 2) {
                const corner1Side = corners[0].getSides().filter(s => s.metadata.orientation === side)[0];
                const corner2Side = corners[1].getSides().filter(s => s.metadata.orientation === side)[0];
                if (corner1Side.metadata.style.name === corner2Side.metadata.style.name) {
                    if(this.debug) console.log("case 2");
                    // We found the pair, but we must first move the pair to the native side
                    const distance = sideDistance(SideType.UP, corner1Side.metadata.orientation, styleSide(corner1Side.metadata.style));
                    if (distance.length > 0) {
                        distance.forEach(d => movements.push(new Movement(SideType.UP, d)));
                        return movements;
                    }
                    // Now let's run the sequence
                    this.#solveYellowCorners(side).forEach(m => movements.push(m));
                    return movements;
                }
            }
        }
        // Apparently we have not found the pair so we may run the sequence for any side with incorrect cube
        if(this.debug) console.log("case 3");
        const corner = topCornersIncorrect[0];
        const side = corner.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
        this.#solveYellowCorners(side.metadata.orientation).forEach(m => movements.push(m));
        return movements;

    }

    #solveYellowCorners(frontSide) {
        // R B1 R F F R1 B R F F R R, front is determined by corners layout
        return this.#translateSequence("R B1 R F F R1 B R F F R R", frontSide);
    }

    solveYellowEdges() {
        const movements = [];
        const edges = this.cube.getEdgeCubes();

        /**
         * We have the following cases to address:
         * 1. Complete yellow edges
         * 2. Edges to be moved around to the right between opposite sides
         * 3. Edges to be moved around to the left between opposite sides
         **/

        // case 1
        const incorrectEdges = edges.filter(e => e.metadata.coords.y === 1 && !e.isInPlace());
        if(incorrectEdges.length === 0) {
            if(this.debug) console.log("case 1 (finished)");
            return [];
        }
        if(incorrectEdges.length < 3) {
            console.error("Error in cube layout");
            return [];
        }
        const edge1 = incorrectEdges[0];
        const edge2 = incorrectEdges[1];
        const edge3 = incorrectEdges[2];
        const otherSide1= edge1.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
        const otherSide2 = edge2.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
        const otherSide3 = edge3.getSides().filter(s => s.metadata.orientation !== SideType.UP)[0];
        // We must determine edges layout (a triangle with top side with correct edge)
        const distance12 = sideDistance(SideType.UP, otherSide1.metadata.orientation, otherSide2.metadata.orientation);
        const distance23 = sideDistance(SideType.UP, otherSide2.metadata.orientation, otherSide3.metadata.orientation);

        let oppositeSide1, oppositeSide2, remainingSide, leftSide, rightSide;
        if(distance12.length === 2) {
            oppositeSide1 = otherSide1;
            oppositeSide2 = otherSide2;
            remainingSide = otherSide3;
        } else if(distance23.length === 2) {
            oppositeSide1 = otherSide2;
            oppositeSide2 = otherSide3;
            remainingSide = otherSide1;
        } else {
            oppositeSide1 = otherSide1;
            oppositeSide2 = otherSide3;
            remainingSide = otherSide2;
        }
        const distanceOpposite1ToRemaining = sideDistance(SideType.UP, oppositeSide1.metadata.orientation, remainingSide.metadata.orientation);
        if(distanceOpposite1ToRemaining[0] === MoveDirection.COUNTERCLOCKWISE) {
            leftSide = oppositeSide1;
            rightSide = oppositeSide2;
        } else {
            leftSide = oppositeSide2;
            rightSide = oppositeSide1;
        }
        // Now me must determine rotation direction
        const rotateRight = leftSide.metadata.style.name === sideStyles.get(rightSide.metadata.orientation).name;
        if(rotateRight) if(this.debug) console.log("case 2");
        else if(this.debug) console.log("case 3");
        this.#solveYellowEdges(remainingSide.metadata.orientation, rotateRight).forEach(m => movements.push(m));
        return movements;
    }

    #solveYellowEdges(frontSide, moveRight) {
        // F F U/U1 L R1 F F L1 R U/U1 F F, front is determined by edges layout
        const sequence = moveRight ? "F F U L R1 F F L1 R U F F" : "F F U1 L R1 F F L1 R U1 F F";
        return this.#translateSequence(sequence, frontSide);
    }

    #translateSequence(sequence, frontSide) {
        const movements = [];
        sequence.split(" ").forEach(code => movements.push(Movement.from(code).translate(frontSide)));

        return movements;
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

// Test sequence for middle layer, case 4
// R B R D1 R1 D1 U1 B B D D L D1 D1 U1 L1 F D1 B1 L U U B B B U B1 R R U1 F1 L1 U1 L F1 F1 U1 L1 B1 U1 B L1 L1 U1 L U L1 F1 U F U F U U F1 U1 F U F1 U R U R1 R1 U R B U B1 U U U1 L1 U L U F U1 F1 U U1 B1 U B U L U1 L1 U U B U1 B1 U1 R1 U R

// Test sequence for yellow layer, case 4
// D1 U1 B1 R1 L U1 F F R D R L1 F1 L1 B D R1 U1 F D1 R R1 B1 F1 F F F1 F1 U U1 U1 F1 U1 L1 L1 R1 U1 R B B U U R B U B1 R R F1 R U R1 F1 F1 U F U U F1 U1 F U F1 U1 U1 R U U R1 U1 R U R1 U1 L U L1 R1 U R B U U B1 U1 B U B1 U U1 R1 U R U B U1 B1 U R U1 R1 U1 F1 U F U U U1 L1 U L U F U1 F1 U1 B1 U B U L U1 L1 U U U1 B1 U B U L U1 L1 F R U R1 U1 F1 B L U L1 U1 B1 B L U L1 U1 B1

