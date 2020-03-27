class StopwatchController {
    constructor() {
        // 计时器属性。
        this.startTime = 0;
        this.elapsed = 0;
        this.running = false;
    }
    
    start() {
        this.startTime = +new Date();
        this.elapsed = 0;
        this.running = true;
    }

    stop() {
        this.elapsed = +new Date() - this.startTime;
        this.running = false;
    }

    getElapsedTime() {
        if (this.running) {
            return +new Date() - this.startTime;
        } else {
            return this.elapsed;
        }
    }

    isRunning() {
        return this.running;
    }

    reset() {
        this.elapsed = 0;
    }
}