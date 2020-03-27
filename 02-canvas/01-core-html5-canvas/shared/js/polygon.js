class Polygon {
    constructor(centerX, centerY, radius, sides, startAngle, strokeStyle, fillStyle, filled) {
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
        this.sides = sides;
        this.startAngle = startAngle;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.filled = filled;
    }

    getPoints() {
        var points = [],
            angle = this.startAngle || 0,
            deltaAngle = 2 * Math.PI / this.sides;

        for(var i = 0; i < this.sides; i++) {
            points.push(new Point(
                this.x + Math.cos(angle) * this.radius,
                this.y + Math.sin(angle) * this.radius
            ));
            angle += deltaAngle;
        }

        return points;
    }

    createPath(context) {
        var points = this.getPoints();

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        } 
        context.closePath();
    }

    stroke(context) {
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    }

    draw(context) {
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();

        if (this.filled) {
            context.fillStyle = this.fillStyle;
            context.fill();
        }

        context.restore();
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}