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
    TOP: "top", BOTTOM: "bottom", FRONT: "front", BACK: "back", LEFT: "left", RIGHT: "right"
};

export const MoveDirection = { CLOCKWISE: 1, COUNTERCLOCKWISE: 2 };

export function reverseDirection(direction) {
    if (direction === MoveDirection.CLOCKWISE) return MoveDirection.COUNTERCLOCKWISE
    else return MoveDirection.CLOCKWISE;
}

export const Axis = { X: "x", Y: "y", Z: "z" }

export const sideAxis = new Map([
    [SideType.TOP, Axis.Y], [SideType.BOTTOM, Axis.Y], [SideType.FRONT, Axis.Z], [SideType.BACK, Axis.Z],
    [SideType.LEFT, Axis.X], [SideType.RIGHT, Axis.X]]);

// NOTE: these directions are arbitrary - they depend on observer's point of view and are a result of trial and error
export const planeOrientation = new Map([
    [SideType.TOP, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.FRONT], [MoveDirection.COUNTERCLOCKWISE, SideType.BACK]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.RIGHT], [MoveDirection.COUNTERCLOCKWISE, SideType.LEFT]])]
    ])],
    [SideType.BOTTOM, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.BACK], [MoveDirection.COUNTERCLOCKWISE, SideType.FRONT]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.LEFT], [MoveDirection.COUNTERCLOCKWISE, SideType.RIGHT]])]
    ])],
    [SideType.FRONT, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.BOTTOM], [MoveDirection.COUNTERCLOCKWISE, SideType.TOP]])],
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.LEFT], [MoveDirection.COUNTERCLOCKWISE, SideType.RIGHT]])]
    ])],
    [SideType.BACK, new Map([
        [Axis.X, new Map([[MoveDirection.CLOCKWISE, SideType.TOP], [MoveDirection.COUNTERCLOCKWISE, SideType.BOTTOM]])],
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.RIGHT], [MoveDirection.COUNTERCLOCKWISE, SideType.LEFT]])]
    ])],
    [SideType.LEFT, new Map([
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.BACK], [MoveDirection.COUNTERCLOCKWISE, SideType.FRONT]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.TOP], [MoveDirection.COUNTERCLOCKWISE, SideType.BOTTOM]])]
    ])],
    [SideType.RIGHT, new Map([
        [Axis.Y, new Map([[MoveDirection.CLOCKWISE, SideType.FRONT], [MoveDirection.COUNTERCLOCKWISE, SideType.BACK]])],
        [Axis.Z, new Map([[MoveDirection.CLOCKWISE, SideType.BOTTOM], [MoveDirection.COUNTERCLOCKWISE, SideType.TOP]])]
    ])]
]);