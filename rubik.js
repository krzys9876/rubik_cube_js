console.log("START");

const canvas = document.getElementById('drawing');
const ctx = canvas.getContext('2d');

class Point2D {
    static size = 5;
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(style = 'red') {
        let restoreStyle = ctx.fillStyle;
        ctx.fillStyle = style;
        // 3D point's X and Y are in range -1 to 1, so point 0.0 is in the middle of the screen
        // and axis grow up and right
        let actualX = (this.x + 1) * canvas.width / 2;
        let actualY = (1 - this.y) * canvas.height /2;

        //console.log("draw: ",actualX, actualY);

        ctx.fillRect(actualX, actualY, Point2D.size, Point2D.size);
        ctx.fillStyle = restoreStyle;
    }
}

class Point3D {
    static scaleZ = 10;

    x = 0;
    y = 0;
    z = 0;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    project() {
        // Close Z makes point with infinite X and Y, very far Z makes point of X=0 and Y=0
        let projectedX = this.x * canvas.width;
        let projectedY = this.y * canvas.height;
        //console.log("projected: ", this.x, this.y,this.z, " to: ",projectedX, projectedY);
        return new Point2D(this.x / (this.z * Point3D.scaleZ), this.y / (this.z * Point3D.scaleZ));
    }

    rotateZ(angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        //console.log("angle: ",angle / deg2rad, " sin: ",sin, " cos: ", cos, " x, y: ", this.x, this.y);
        let tmpX = this.x
        this.x = this.x * cos - this.y * sin;
        this.y = tmpX * sin + this.y * cos;
        //console.log("new x, y: ",this.x, this.y);
        return this;
    }
}


points = []
for (let i = 0; i < 30; i++) {
    points.push(new Point3D(1.0, 1.0, i / 20));
}
const deg2rad = Math.PI / 180;
let counter = 0;
const step = 3;

const bkStyle = 'blue';

function drawLoop() {

    ctx.fillStyle = bkStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let point of points) {
        point.rotateZ(step * deg2rad).project().draw();
    }

    counter ++;

    if(counter < 1000) {
        setTimeout(drawLoop, 1000 / 60);
    }
}

drawLoop();

console.log("END");
