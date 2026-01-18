class UpdateGate {
  /** Tracks the request id from the last requestAnimationFrame calls to prevent duplicate calls */
  updateEventHandle = void 0;
  /** Store the strings passed into call(caller: string) so we can track who requested updates most recently */
  callers = [];
  /** Function that will be called at the end of the frame when calls are queued */
  updateFunction;
  /** What triggered this update. */
  get callTriggers() {
    return this.callers.toString();
  }
  /**
   * @param updateFunction Actually perform update against any queued calls.
   */
  constructor(updateFunction) {
    this.updateFunction = updateFunction;
  }
  onEndFrame() {
    const p = UI.beginProfiling(`UpdateGate-${this.callers.toString()}`);
    this.updateFunction();
    UI.endProfiling(p);
    this.updateEventHandle?.clear();
    this.updateEventHandle = void 0;
    this.callers = [];
  }
  /**
   * Queue a request to call the update function during the next animation frame
   * @param caller A string used to identify where this call request is coming from. Ideally unique between call locations.
   */
  call(caller) {
    if (caller != "") {
      this.callers.push(caller);
    } else {
      console.error("utilities-update-gate: Invalid/empty caller string passed into call()!");
      return;
    }
    if (!this.updateEventHandle) {
      this.updateEventHandle = engine.on("EndFrame", this.onEndFrame, this);
    }
  }
}

export { UpdateGate as U };
//# sourceMappingURL=utilities-update-gate.chunk.js.map
