class Stopwatch {
    constructor(x, y, radius, strokeStyle, fillStyle, textFillStyle) {
        this.x = x;
        this.y = y;
        this.radius = radius < 100 ? 100 : radius;
        this.strokeStyle = strokeStyle || "rgba(100, 140, 230, 0.9)";
        this.fillStyle = fillStyle || "rgba(100, 140, 230, 0.3)";
        this.textFillStyle = textFillStyle || "rgba(0, 0, 230, 0.9)";

        this.baseWidth = 10;
    }

    drawDial(context, loc) {
        context.save();

        context.strokeStyle = this.strokeStyle;
        context.fillStyle = this.fillStyle;

        context.font = "12px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";

        this._drawCentroid(context);
        this.drawCentroidGuidewire(context, loc);
        this._drawRing(context);
        this._drawTickInnerCircle(context);
        this._drawTicks(context);
        this._drawAnnotations(context);

        context.restore();
    }
    
    _drawCentroid(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.baseWidth,
            0, Math.PI*2);
        context.fill();
        context.stroke();
    }
    
    drawCentroidGuidewire(context, angle) {
        var endpoint = {};
    
        // if (loc.x >= this.x) {
            endpoint = {
                x: this.x + this.radius * Math.cos(angle),
                y: this.y + this.radius * Math.sin(angle)
            };
        // } else {
        //     endpoint = {
        //         x: this.x - this.radius * Math.cos(angle),
        //         y: this.y - this.radius * Math.sin(angle)
        //     };
        // }
    
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(endpoint.x, endpoint.y);
        context.fill();
        context.stroke();
    
        context.beginPath();
        context.arc(endpoint.x, endpoint.y, this.baseWidth/2, 0, Math.PI*2);
        context.fill();
        context.stroke();
    }
    
    _drawRing(context) {
        context.save();

        context.shadowColor = "rgba(0, 0, 0, 0.7)",
        context.shadowOffsetX = 3,
        context.shadowOffsetY = 3,
        context.shadowBlur = 6;
    
        context.beginPath();
        context.arc(this.x, this.y, this.radius,
            0, Math.PI*2, false);
        context.stroke();
    
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.arc(this.x, this.y, this.radius - this.baseWidth*2,
            0, Math.PI*2, true);
        context.stroke();
        context.fill();

        context.restore();
    }
    
    _drawTickInnerCircle(context) {
        context.save();
    
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.beginPath();
        context.arc(this.x, this.y, this.radius - this.baseWidth * 3,
            0, Math.PI*2, false);
        context.stroke();
    
        context.restore();
    }
    
    _drawTicks(context) {
        var deltaAngle = Math.PI/30;
        var radius = this.radius - this.baseWidth*2;
    
        for(var i = 0; i < 60; i++) {
            this._drawTick(context, i*deltaAngle, radius, i);
        }
    }
    
    _drawTick(context, angle, radius, cnt) {
        var tickWidth;
        if (cnt % 5 === 0) {
            tickWidth = this.baseWidth;
        } else {
            tickWidth = this.baseWidth / 2;
        }
    
        context.beginPath();
        context.moveTo(
            this.x + Math.cos(angle) * (radius - tickWidth),
            this.y + Math.sin(angle) * (radius - tickWidth)
        );
        context.lineTo(
            this.x + Math.cos(angle) * radius,
            this.y + Math.sin(angle) * radius
        );
        context.stroke();
    }
    
    _drawAnnotations(context) {
        var radius = this.radius - this.baseWidth*2;
        var deltaAngle = Math.PI / 6;
    
        context.save();
    
        // 刻度文字阴影。
        context.shadowColor = "rgba(0, 0, 0, 0.4)";
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowBlur = 4;
    
        context.fillStyle = this.textFillStyle;
    
        for(var angle=Math.PI/2; angle<Math.PI*2.5; angle+=deltaAngle) {
            context.beginPath();
            context.fillText(
                (Math.abs(angle * 30 / Math.PI-15)).toFixed(0),
                this.x + Math.cos(angle) * (radius - this.baseWidth*2),
                this.y - Math.sin(angle) * (radius - this.baseWidth*2)
            );
        }
    
        context.restore();
    }
}