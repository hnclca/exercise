class AnimationTimer {
    constructor(duration, timeWrap) {
        if (duration !== undefined)
            this.duration = duration;
        else
            this.duration = 1000;
        this.timeWrap = timeWrap;

        this.controller = new StopwatchController();
    }
    
    start() {
        this.controller.start();
    }

    stop() {
        this.controller.stop();
    }

    getRealElapsedTime() {
        return this.controller.getElapsedTime();
    }

    getElapsedTime() {
        var elapsedTime = this.controller.getElapsedTime(),
            percentComplete = elapsedTime / this.duration;
        
        if (!this.controller.isRunning())
            return undefined;
        if (this.timeWrap === undefined)
            return elapsedTime;
        return elapsedTime * (this.timeWrap(percentComplete) / percentComplete);
    }

    isRunning() {
        return this.controller.isRunning();
    }

    reset() {
        this.controller.reset();
    }

    isOver() {
        return this.getElapsedTime() > this.duration;
    }
}