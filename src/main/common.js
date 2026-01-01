export class Style {
    name= 'NONE';
    tag = 'X';
    pointStyle = 'red';
    lineStyle = 'blue';
    fillStyle = 'purple';

    constructor(pointStyle, lineStyle, fillStyle, name, tag) {
        this.pointStyle = pointStyle;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
        this.name = name;
        this.tag = tag;
    }
}

export const globalStyle = new Style('black', 'black', 'darkgray', 'NONE', 'X');

export const redStyle = new Style('black', 'black', 'red', 'RED', 'R');
export const yellowStyle = new Style('black', 'black', 'yellow', 'YELLOW', 'Y');
export const blueStyle = new Style('black', 'black', 'blue', 'BLUE', 'B');
export const whiteStyle = new Style('black', 'black', 'white', 'WHITE', 'W');
export const greenStyle = new Style('black', 'black', 'green', 'GREEN', 'G');
export const orangeStyle = new Style('black', 'black', 'orange', 'ORANGE', 'O');

export const SideType = {
    UP: "U", DOWN: "D", FRONT: "F", BACK: "B", LEFT: "L", RIGHT: "R"
};

export const sideStyles = new Map([
    [SideType.FRONT, blueStyle],[SideType.BACK, greenStyle],
    [SideType.LEFT, orangeStyle],[SideType.RIGHT, redStyle],
    [SideType.UP, yellowStyle],[SideType.DOWN, whiteStyle]]);

export function styleSide(style) {
    return sideStyles.entries().filter(e => e[1].name === style.name).toArray()[0][0];
}

export const MoveDirection = { CLOCKWISE: 1, COUNTERCLOCKWISE: 2 };

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
export const sideDistances2 = new Map([
    [SideType.UP, [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT]],
    [SideType.DOWN, [SideType.FRONT, SideType.LEFT, SideType.BACK, SideType.RIGHT]],
    [SideType.FRONT, [SideType.UP, SideType.LEFT, SideType.DOWN, SideType.RIGHT]],
    [SideType.BACK, [SideType.UP, SideType.LEFT, SideType.DOWN, SideType.RIGHT]],
    [SideType.LEFT, [SideType.UP, SideType.BACK, SideType.DOWN, SideType.FRONT]],
    [SideType.RIGHT, [SideType.UP, SideType.BACK, SideType.DOWN, SideType.FRONT]]
]);

export function sideDistance2(turn, source, target) {
    if(source === target) return [];
    const sideOrder = sideDistances2.get(turn);

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
