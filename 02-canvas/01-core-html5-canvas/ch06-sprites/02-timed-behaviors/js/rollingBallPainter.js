class RollingBallPainter {

    paint(sprite, context) {
        context.save();
        context.beginPath();
        context.arc(sprite.left + sprite.width/2, sprite.top + sprite.height/2,
            sprite.width/2, 0, Math.PI*2, false);
        context.clip();

        context.shadowColor = 'rgb(0,0,255)';
        context.shadowOffsetX = -4;
        context.shadowOffsetY = -4;
        context.shadowBlur = 8;

        context.lineWidth = 2;
        context.strokeStyle = 'rgb(100,100,195)';
        context.stroke();

        context.beginPath();
        context.arc(sprite.left + sprite.width/2, sprite.top + sprite.height/2,
            sprite.width/4, 0, Math.PI*2, false);
        context.clip();

        context.shadowColor = 'rgb(255,255,0)';
        context.shadowOffsetX = -4;
        context.shadowOffsetY = -4;
        context.shadowBlur = 8;
        context.stroke();

        context.restore();
    }
}