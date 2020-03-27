class RunInPlace {
    constructor(lastAdvance, interval) {
        this.lastAdvance = lastAdvance;
        this.interval = interval;
    }

    execute(sprite, context, time) {
        if (time - this.lastAdvance > this.interval) {
			sprite.painter.advance();
			this.lastAdvance = time;
		}
    }
}

class MoveToLeft {
    constructor(lastMove) {
        this.lastMove = lastMove;
    }

    execute(sprite, context, time) {
        if (this.lastMove !== 0) {
            sprite.left -= (time - this.lastMove) / 1000 * sprite.velocityX;
            if (sprite.left < 0) {
                sprite.left = context.canvas.width;
            }
        }
        this.lastMove = time;
    }
}