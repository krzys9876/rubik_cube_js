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

export const MoveDirection = {
    CLOCKWISE: 0, COUNTERCLOCKWISE: 1,
}