export class Task {
    startCall;
    stopCall;
    endCall;
    running = false;
    constructor(startCall, stopCall, endCall) {
        this.startCall = startCall;
        this.stopCall = stopCall;
        this.endCall = endCall;
    }

    start() {
        this.running = true;
        this.startCall();
    }

    stop() {
        this.stopCall();
    }

    tryEnd() {
        if(this.endCall()) this.running = false;
    }
}

export class FlagController {
    active = false;
    start() { this.active = true; }
    stop() { this.active = false; }
    end() { return !this.active; }

    static createTask(flag) {
        return new Task(() => flag.start(), () => flag.stop(), () => flag.end());
    }
}
