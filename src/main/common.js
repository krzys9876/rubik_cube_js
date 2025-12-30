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

export const deg2rad = Math.PI / 180;

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
