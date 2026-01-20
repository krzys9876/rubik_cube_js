export class Style {
    name= 'NONE';
    tag = 'X';
    pointStyle = 'red';
    lineStyle = 'blue';
    lineStyleSelected = 'pink';
    fillStyle = 'purple';

    constructor(pointStyle, lineStyle, lineStyleSelected, fillStyle, name, tag) {
        this.pointStyle = pointStyle;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
        this.lineStyleSelected = lineStyleSelected;
        this.name = name;
        this.tag = tag;
    }
}

export const globalStyle = new Style('pink', 'black', 'pink', 'darkgray', 'NONE', 'X');

export const redStyle = new Style('black', 'black', 'pink', 'red', 'RED', 'R');
export const yellowStyle = new Style('black', 'black', 'pink', 'yellow', 'YELLOW', 'Y');
export const blueStyle = new Style('black', 'black', 'pink', 'blue', 'BLUE', 'B');
export const whiteStyle = new Style('black', 'black', 'pink', 'white', 'WHITE', 'W');
export const greenStyle = new Style('black', 'black', 'pink', 'green', 'GREEN', 'G');
export const orangeStyle = new Style('black', 'black', 'pink', 'orange', 'ORANGE', 'O');

// Updates all style objects from CSS custom properties (for theme switching)
export function updateStylesFromCSS() {
    const styles = getComputedStyle(document.documentElement);
    const getCSSVar = (name) => styles.getPropertyValue(name).trim();

    const lineColor = getCSSVar('--cube-line-color') || 'black';
    const lineSelected = getCSSVar('--cube-line-selected') || 'pink';

    // Update line colors for all styles
    const allStyles = [globalStyle, redStyle, yellowStyle, blueStyle, whiteStyle, greenStyle, orangeStyle];
    allStyles.forEach(style => {
        style.lineStyle = lineColor;
        style.lineStyleSelected = lineSelected;
    });

    // Update face colors
    redStyle.fillStyle = getCSSVar('--cube-face-red') || 'red';
    yellowStyle.fillStyle = getCSSVar('--cube-face-yellow') || 'yellow';
    blueStyle.fillStyle = getCSSVar('--cube-face-blue') || 'blue';
    whiteStyle.fillStyle = getCSSVar('--cube-face-white') || 'white';
    greenStyle.fillStyle = getCSSVar('--cube-face-green') || 'green';
    orangeStyle.fillStyle = getCSSVar('--cube-face-orange') || 'orange';
}

export const SideType = {
    UP: "U", DOWN: "D", FRONT: "F", BACK: "B", LEFT: "L", RIGHT: "R"
};


const sideOrder = [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT, SideType.UP, SideType.DOWN]
export function nextStyle(style) {
    const side = styleSide(style);
    const nextSide = sideOrder[(sideOrder.indexOf(side) + 1) % sideOrder.length];
    return sideStyles.get(nextSide);
}


export const sideStyles = new Map([
    [SideType.FRONT, blueStyle],[SideType.BACK, greenStyle],
    [SideType.LEFT, orangeStyle],[SideType.RIGHT, redStyle],
    [SideType.UP, yellowStyle],[SideType.DOWN, whiteStyle]]);

export function styleSide(style) {
    return sideStyles.entries().filter(e => e[1].name === style.name).toArray()[0][0];
}

export const MoveDirection = { CLOCKWISE: 1, COUNTERCLOCKWISE: 2 };

export const MoveType = { MANUAL: 1, SOLVING: 2, REVERSE: 3};

export function reverseDirection(direction) {
    if (direction === MoveDirection.CLOCKWISE) return MoveDirection.COUNTERCLOCKWISE
    else return MoveDirection.CLOCKWISE;
}

export const Axis = { X: "x", Y: "y", Z: "z" }

export const sideAxis = new Map([
    [SideType.UP, Axis.Y], [SideType.DOWN, Axis.Y], [SideType.FRONT, Axis.Z], [SideType.BACK, Axis.Z],
    [SideType.LEFT, Axis.X], [SideType.RIGHT, Axis.X]]);

// NOTE: these directions are arbitrary - they depend on observer's point of view and are a result of trial and error
export const planeOrientation = new Map([
    [SideType.UP, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.FRONT], [MoveDirection.COUNTERCLOCKWISE, SideType.BACK]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.RIGHT], [MoveDirection.COUNTERCLOCKWISE, SideType.LEFT]])]
    ])],
    [SideType.DOWN, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.BACK], [MoveDirection.COUNTERCLOCKWISE, SideType.FRONT]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.LEFT], [MoveDirection.COUNTERCLOCKWISE, SideType.RIGHT]])]
    ])],
    [SideType.FRONT, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.DOWN], [MoveDirection.COUNTERCLOCKWISE, SideType.UP]])],
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.LEFT], [MoveDirection.COUNTERCLOCKWISE, SideType.RIGHT]])]
    ])],
    [SideType.BACK, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.UP], [MoveDirection.COUNTERCLOCKWISE, SideType.DOWN]])],
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.RIGHT], [MoveDirection.COUNTERCLOCKWISE, SideType.LEFT]])]
    ])],
    [SideType.LEFT, new Map([
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.BACK], [MoveDirection.COUNTERCLOCKWISE, SideType.FRONT]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.UP], [MoveDirection.COUNTERCLOCKWISE, SideType.DOWN]])]
    ])],
    [SideType.RIGHT, new Map([
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.FRONT], [MoveDirection.COUNTERCLOCKWISE, SideType.BACK]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.DOWN], [MoveDirection.COUNTERCLOCKWISE, SideType.UP]])]
    ])]
]);

// (0) Which side to turn, (1) which side to become (2) which
// For each side all other sides are order clockwise
const sideDistances = new Map([
    [SideType.UP, [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT]],
    [SideType.DOWN, [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT]],
    [SideType.FRONT, [SideType.UP, SideType.LEFT, SideType.DOWN, SideType.RIGHT]],
    [SideType.BACK, [SideType.UP, SideType.LEFT, SideType.DOWN, SideType.RIGHT]],
    [SideType.LEFT, [SideType.UP, SideType.BACK, SideType.DOWN, SideType.FRONT]],
    [SideType.RIGHT, [SideType.UP, SideType.BACK, SideType.DOWN, SideType.FRONT]]
]);

export const opposideSides = new Map([
    [SideType.FRONT, SideType.BACK], [SideType.BACK, SideType.FRONT],
    [SideType.UP, SideType.DOWN], [SideType.DOWN, SideType.UP],
    [SideType.LEFT, SideType.RIGHT], [SideType.RIGHT, SideType.LEFT]
]);

export function sideDistance(turn, source, target) {
    if(source === target) return [];
    const sideOrder = sideDistances.get(turn);

    const sourceIndex = sideOrder.indexOf(source);
    const targetIndex = sideOrder.indexOf(target);

    let distance = (targetIndex - sourceIndex) % sideOrder.length;
    if(distance<0) distance += sideOrder.length;

    switch (distance) {
        case 1: return [MoveDirection.CLOCKWISE];
        case 2: return [MoveDirection.CLOCKWISE, MoveDirection.CLOCKWISE];
        case 3: return [MoveDirection.COUNTERCLOCKWISE];
    }
    return [];
}

export function nextSide(turn, source, moveDirection) {
    const sideOrder = sideDistances.get(turn);
    const sourceIndex = sideOrder.indexOf(source);
    let targetIndex = moveDirection === MoveDirection.CLOCKWISE ? sourceIndex + 1 : sourceIndex - 1;
    if(targetIndex <0) targetIndex += 4;

    return sideOrder[targetIndex % 4];
}

// Speed labels
export const speedLabels = new Map([[1, "slowest"], [2, "slow"], [3, "moderate"], [4, "fast"], [5, "fastest"]]);
