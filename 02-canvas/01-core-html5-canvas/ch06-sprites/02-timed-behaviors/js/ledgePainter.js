class LedgePainter {

    paint(sprite, context) {
        context.save();
        context.shadowColor = 'rgba(0,0,0,0.8)';
        context.shadowBlur = 8;
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;

        context.fillStyle = 'rgba(255,255,0,0.6)';
        context.fillRect(sprite.left,sprite.top,
                         sprite.width,sprite.height);
        context.restore();
    }
}