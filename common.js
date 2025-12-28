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

export const canvas = document.getElementById('drawing');
export const ctx = canvas.getContext('2d');

export const globalStyle = new Style('black', 'black', null);
