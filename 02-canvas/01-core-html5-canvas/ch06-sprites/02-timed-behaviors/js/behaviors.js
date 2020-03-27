class MoveBall {
    constructor(inital_left, inital_top, direction, max_distance, timer) {
        this.inital_left = inital_left;
        this.inital_top = inital_top;
        this.direction = direction;
        this.max_distance = max_distance;
        this.timer = timer;

        this.lastTime = undefined;
    }

    isBallOnLedge(sprite) {
        return (sprite.left > this.inital_left + sprite.width/2 - this.max_distance) &&
                (sprite.left < this.inital_left + sprite.width/2 + this.max_distance/2)
    }

    resetBall(sprite) {
        sprite.left = this.inital_left;
        sprite.top = this.inital_top;
    }

    calculateFps(time) {
        var fps = 1000 / (time - lastTime);
        lastTime = time;
        return fps; 
    }
     
    execute(sprite, context, time) {
        var frameElapsed;
    
        if (this.timer.isRunning() && this.lastTime !== undefined) {
            frameElapsed = time - this.lastTime;
            
            sprite.left += this.direction.direction * sprite.velocityX * (frameElapsed/1000);

            if ((this.isBallOnLedge(sprite) && this.timer.isOver()) ||
                 !this.isBallOnLedge(sprite)) 
                    this.timer.stop();

            if (!this.isBallOnLedge(sprite))
                this.resetBall(sprite);
        }

        this.lastTime = time;
    }
}