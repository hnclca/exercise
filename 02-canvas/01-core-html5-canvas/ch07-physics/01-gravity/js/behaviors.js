class MoveBall {
    GRAVIT_FORCE = 9.81;
    PLATFORM_HEIGHT_IN_METERS = 10;

    constructor(inital_left, inital_top, max_distance,  
            platformHeight, pushTimer, fallingTimer) {
        this.inital_left = inital_left;
        this.inital_top = inital_top;
        this.max_distance = max_distance;
        this.platformHeight = platformHeight;
        this.pushTimer = pushTimer;
        this.fallingTimer = fallingTimer;

        this.lastTime = undefined;
        this.pixelsPerMeter = platformHeight / this.PLATFORM_HEIGHT_IN_METERS;
    }

    isBallOnLedge(sprite) {
        return (sprite.left > this.inital_left + sprite.width/2 - this.max_distance) &&
                (sprite.left < this.inital_left + sprite.width/2 + this.max_distance/2)
    }

    resetBall(sprite) {
        sprite.left = this.inital_left;
        sprite.top = this.inital_top;
        sprite.velocityY = 0;
    }

    execute(sprite, context, time) {
        if (this.lastTime === undefined) {
            this.lastTime = time;
            return;
        }
    
        var frameElapsed = time - this.lastTime;
        if (this.pushTimer.isRunning()) {
            sprite.left -= sprite.velocityX * (frameElapsed/1000);

            if (this.isBallOnLedge(sprite)) {
                if (this.pushTimer.isOver()) {
                    this.pushTimer.stop();
                }
            } else if (!this.fallingTimer.isRunning()) {
                this.fallingTimer.start();
                sprite.velocityY = 0;
                frameElapsed = 0;
            }
        }

        if (this.fallingTimer.isRunning()) {
            var fallingTimerElapsed = this.fallingTimer.getElapsedTime();
            sprite.top += sprite.velocityY * (frameElapsed/1000);

            sprite.velocityY = this.GRAVIT_FORCE * (fallingTimerElapsed/1000) *
                this.pixelsPerMeter;
            
            if (sprite.top - sprite.height > this.platformHeight ) {
                this.fallingTimer.stop();
                this.pushTimer.stop()
                this.resetBall(sprite);
            }
        }
        this.lastTime = time;
    }
}