class RoundArrow {
    constructor(centerX, centerY, width, height, radius, strokeStyle, fillStyle, filled) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.filled = filled;
    }

    getEndPoints() {
        var endPoints = [
            {
                x: this.width - this.radius,
                y: 0
            },
            {
                x: this.width,
                y: this.radius
            },
            {
                x: this.width,
                y: this.height - this.radius
            },
            {
                x: this.width - this.radius,
                y: this.height
            },
            {
                x: this.radius/3,
                y: this.height/2 + this.radius/2
            },
            {
                x: this.radius/3,
                y: this.height/2 - this.radius/2
            }
        ]

        return endPoints;
    }

    getControlPoints() {
        var controlPoints = [
            {
                x: this.width,
                y: 0
            },
            {
                x: this.width,
                y: this.height
            },
            {
                x: 0,
                y: this.height/2
            }
        ]

        return controlPoints;
    }

    createPath(context) {
        var endPoints = this.getEndPoints(),
            controlPoints = this.getControlPoints();

        context.beginPath();
        context.moveTo(endPoints[0].x, endPoints[0].y);
        for(var i = 0; i < controlPoints.length; i++) {
            context.quadraticCurveTo(controlPoints[i].x, controlPoints[i].y, 
                endPoints[2*i+1].x, endPoints[2*i+1].y);
            if (2*(i+1) < endPoints.length) {
                context.lineTo(endPoints[2*(i+1)].x, endPoints[2*(i+1)].y);
            }
        } 
        context.closePath();
    }

    draw(context) {
        context.save();

        context.translate(this.centerX, this.centerY);

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