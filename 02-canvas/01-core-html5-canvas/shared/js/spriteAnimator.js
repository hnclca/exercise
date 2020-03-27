class SpriteAnimator {

    constructor(painters, elapsedCallback) {
        this.painters = painters || [];
        this.elapsedCallback = elapsedCallback;
        this.index = 0;
        this.startTime = 0;
    }

    end(sprite, originalPainter) {
        sprite.animating = false;
        if (this.elapsedCallback) {
            this.elapsedCallback(sprite);
        } else {
            sprite.painter = originalPainter;
        }
    }

    start(sprite, duration) {
        var endTime = +new Date() + duration,
            period = duration / this.painters.length,
            originalPainter = sprite.painter,
            animator = this;
        
        this.index = 0;
        sprite.animating = true;
        sprite.painter = this.painters[this.index];
        
        var interval = setInterval(function () {
            if (+new Date() < endTime) {
                sprite.painter = animator.painters[++animator.index];
            } else {
                animator.end(sprite, originalPainter);
                clearInterval(interval);
            }
        }, period);
    }
}