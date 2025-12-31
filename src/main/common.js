export class Style {
    pointStyle = 'red';
    lineStyle = 'blue';
    fillStyle = 'purple';

    constructor(pointStyle, lineStyle, fillStyle) {
        this.pointStyle = pointStyle;
        this.lineStyle = lineStyle;
        this.fillStyle = fillStyle;
    }
}

export const globalStyle = new Style('black', 'black', 'darkgray');

export const SideType = {
    UP: "U", DOWN: "D", FRONT: "F", BACK: "B", LEFT: "L", RIGHT: "R"
};

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