const navRepeatInterval = 150;
class FxsSlider extends ChangeNotificationComponent {
  leftArrow = document.createElement("fxs-activatable");
  rightArrow = document.createElement("fxs-activatable");
  bar = document.createElement("div");
  fill = document.createElement("div");
  thumb = document.createElement("div");
  dragInProgress = false;
  _percent = 0;
  min = 0;
  max = 1;
  steps = 0;
  // Number of steps between values (0 for no step)
  intervalHandle = 0;
  intervalActive = false;
  // true if the interval timer is active
  intervalLeft = false;
  // true if the interval timer is active for a left press-and-hold, false for right
  navigateInputListener = this.onNavigateInput.bind(this);
  intervalHandler = this.onInterval.bind(this);
  thumbMouseDownListener = this.onDragStart.bind(this);
  blurListener = this.onBlur.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  engineInputCaptureListener = this.onEngineInputCapture.bind(this);
  dragStopEventListener = this.onDragStop.bind(this);
  dragMoveEventListener = this.onDragMove.bind(this);
  onRightArrowActivateListener = this.updateValueAttribute.bind(this, false);
  onLeftArrowActivateListener = this.updateValueAttribute.bind(this, true);
  resizeObserver = new ResizeObserver(this.realizeThumb.bind(this));
  get range() {
    return this.max - this.min;
  }
  /** return the real, internal value between 0-1 of the slider */
  get percent() {
    return this._percent;
  }
  /** Get the current value of the slider based on the min/max range and any steps that have been set */
  get value() {
    if (this.steps <= 0) {
      const rangedValue = this.min + this.range * this._percent;
      return rangedValue;
    }
    return this.getStepValue();
  }
  onInitialize() {
    super.onInitialize();
    const value = this.getHTMLAttributeNumber("value", this.value);
    const min = this.getHTMLAttributeNumber("min", this.min);
    const max = this.getHTMLAttributeNumber("max", this.max);
    const steps = this.getHTMLAttributeNumber("steps", this.steps);
    this.setRange(min, max);
    this.setSteps(steps);
    this.setValue(value);
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.resizeObserver.observe(this.Root);
    this.bar.addEventListener("mousedown", this.thumbMouseDownListener, false);
    this.Root.addEventListener("blur", this.blurListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.leftArrow.addEventListener("action-activate", this.onLeftArrowActivateListener);
    this.leftArrow.setAttribute("data-audio-press-ref", "data-audio-checkbox-press");
    this.rightArrow.addEventListener("action-activate", this.onRightArrowActivateListener);
    this.rightArrow.setAttribute("data-audio-press-ref", "data-audio-checkbox-press");
    this.realizeThumb();
  }
  onDetach() {
    this.leftArrow.removeEventListener("action-activate", this.onLeftArrowActivateListener);
    this.rightArrow.removeEventListener("action-activate", this.onRightArrowActivateListener);
    this.bar.removeEventListener("mousedown", this.thumbMouseDownListener, false);
    window.removeEventListener("mousemove", this.dragMoveEventListener, false);
    window.removeEventListener("mouseup", this.dragStopEventListener, false);
    this.Root.removeEventListener("blur", this.blurListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.resizeObserver.disconnect();
    if (this.dragInProgress) {
      this.stopDrag();
    }
    super.onDetach();
  }
  onBlur() {
    if (this.intervalActive) {
      clearInterval(this.intervalHandle);
      this.intervalActive = false;
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "touch-touch") {
      this.dragInProgress = true;
      const useCapture = true;
      window.addEventListener("engine-input", this.engineInputCaptureListener, useCapture);
    }
  }
  onEngineInputCapture(inputEvent) {
    if (!this.dragInProgress) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "touch-pan":
        this.onTouchPan(inputEvent);
        break;
      case "touch-complete":
        this.stopDrag();
    }
  }
  onTouchPan(inputEvent) {
    if (this.dragInProgress && inputEvent.detail.status != InputActionStatuses.FINISH) {
      const value = this.computeValueFromCursor(inputEvent.detail.x);
      if (value != this.value) {
        this.playChangeSound();
      }
      this.Root.setAttribute("value", value.toString());
      inputEvent.stopImmediatePropagation();
      inputEvent.preventDefault();
    }
  }
  stopDrag() {
    const useCapture = true;
    window.removeEventListener("engine-input", this.engineInputCaptureListener, useCapture);
    this.dragInProgress = false;
  }
  updateValueAttribute(decrease) {
    const stepSize = this.steps ? 1 / this.steps * this.range : (
      // if no step size is set, divide the slider into 100 segments.
      (this.max - this.min) / 100
    );
    if (decrease) {
      const value = this.value - stepSize;
      if (value >= this.min) {
        this.playChangeSound();
        this.Root.setAttribute("value", value.toString());
      }
    } else {
      const value = this.value + stepSize;
      if (value <= this.max) {
        this.playChangeSound();
        this.Root.setAttribute("value", value.toString());
      }
    }
  }
  onInterval() {
    this.updateValueAttribute(this.intervalLeft);
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  playChangeSound() {
    this.playSound("data-audio-slider-changed");
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH && navigationEvent.detail.status != InputActionStatuses.START) {
      return true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.LEFT:
        switch (navigationEvent.detail.status) {
          case InputActionStatuses.START:
            clearInterval(this.intervalHandle);
            this.intervalHandle = setInterval(this.intervalHandler, navRepeatInterval);
            this.intervalActive = true;
            this.intervalLeft = true;
            break;
          case InputActionStatuses.FINISH:
            clearInterval(this.intervalHandle);
            this.intervalActive = false;
            this.updateValueAttribute(true);
            break;
        }
        live = false;
        break;
      case InputNavigationAction.RIGHT:
        switch (navigationEvent.detail.status) {
          case InputActionStatuses.START:
            clearInterval(this.intervalHandle);
            this.intervalHandle = setInterval(this.intervalHandler, navRepeatInterval);
            this.intervalActive = true;
            this.intervalLeft = false;
            break;
          case InputActionStatuses.FINISH:
            clearInterval(this.intervalHandle);
            this.intervalActive = false;
            this.updateValueAttribute(false);
            break;
        }
        live = false;
        break;
    }
    return live;
  }
  getHTMLAttributeNumber(attribute, defaultValue) {
    const value = this.Root.getAttribute(attribute);
    if (!value) {
      return defaultValue;
    }
    const num = parseFloat(value);
    if (Number.isNaN(num)) {
      console.warn("fxs-slider: The fxs-slider attribute '" + attribute + "' could not be parsed as an int.");
      return defaultValue;
    }
    return num;
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (name == "value") {
      const value = parseFloat(newValue || "0");
      this.setValue(value);
      this.realizeThumb();
      this.leftArrow.setAttribute("disabled", value <= this.min ? "true" : "false");
      this.rightArrow.setAttribute("disabled", value >= this.max ? "true" : "false");
    }
  }
  realizeThumb() {
    let percent = (this.value - this.min) / this.range;
    percent = Math.min(100, Math.max(0, percent));
    const barWidth = this.bar.offsetWidth;
    let thumbLeftOffset = percent * 100;
    if (barWidth > 0) {
      const thumbWidth = this.thumb.offsetWidth;
      thumbLeftOffset -= thumbWidth / barWidth * percent * 100;
    }
    this.thumb.attributeStyleMap.set("left", CSS.percent(thumbLeftOffset));
    this.fill.attributeStyleMap.set("transform", new CSSTransformValue([new CSSScale(percent, 1)]));
  }
  onDragStart(_event) {
    this.dragInProgress = true;
    window.removeEventListener("mousemove", this.dragMoveEventListener, false);
    window.removeEventListener("mouseup", this.dragStopEventListener, true);
    window.addEventListener("mousemove", this.dragMoveEventListener, false);
    window.addEventListener("mouseup", this.dragStopEventListener, true);
  }
  onDragMove(event) {
    if (!this.dragInProgress) {
      return;
    }
    const value = this.computeValueFromCursor(event.clientX);
    const oldValue = this.Root.getAttribute("value");
    const oldNumber = oldValue !== null ? parseFloat(oldValue) : NaN;
    if (!isNaN(oldNumber) && oldNumber != value && oldNumber >= this.min && oldNumber <= this.max) {
      this.playChangeSound();
    }
    this.Root.setAttribute("value", value.toString());
  }
  onDragStop(event) {
    if (!this.dragInProgress || !event.target) {
      return;
    }
    this.dragInProgress = false;
    const value = this.computeValueFromCursor(event.clientX);
    if (value != this.value) {
      this.playChangeSound();
    }
    this.Root.setAttribute("value", value.toString());
    window.removeEventListener("mousemove", this.dragMoveEventListener, false);
    window.removeEventListener("mouseup", this.dragStopEventListener, true);
  }
  /**
   * Determine the ranged value on the slider based on a cursor's X position relative to the screen.
   * @param {number} cursorX The X position (in pixels) of the cursor
   * @returns {number} A value in the slider's range.
   */
  computeValueFromCursor(cursorX) {
    const rect = this.bar.getBoundingClientRect();
    const ratio = (cursorX - rect.x) / rect.width;
    if (!this.steps) {
      const value = Math.min(this.max, Math.max(this.min, this.range * ratio + this.min));
      return value;
    } else {
      const stepSize = 1 / this.steps * this.range;
      const value = this.min + Math.round(ratio * this.steps) * stepSize;
      return value;
    }
  }
  /**
   * For a given value, obtain the equivalent step value.  (If step is 0, the value is the same.)
   * @param value A values
   * @returns value when placed within steps
   */
  getStepValue() {
    const stepSize = 1 / this.steps * this.range;
    return this.min + Math.round(this._percent * this.steps) * stepSize;
  }
  /**
   * Set the range of values that can be returned from this slider.
   * @param min The minimum boundary of the range.
   * @param max The maximum boundary of the range.
   */
  setRange(min = 0, max = 1) {
    if (min > max) {
      console.error(
        "fxs-slider: Setting slider '" + this.Root.id + "' range where the min '" + min.toString() + "' is greater than the max '" + max.toString() + "'"
      );
      min = min ^ max;
      max = max ^ min;
      min = min ^ max;
    }
    this.min = min;
    this.max = max;
  }
  setSteps(steps = 0) {
    this.steps = steps;
  }
  setValue(value) {
    if (value < this.min) {
      value = this.min;
    } else if (value > this.max) {
      value = this.max;
    }
    this._percent = (value - this.min) / this.range;
    this.sendValueChange(
      new ComponentValueChangeEvent({
        percent: this._percent,
        value: this.value,
        min: this.min,
        max: this.max,
        steps: this.steps
      })
    );
  }
  render() {
    this.Root.classList.add("relative", "w-60", "h-8", "flex", "flex-row", "items-center", "pointer-events-auto");
    this.leftArrow.classList.add("w-8", "h-12", "bg-no-repeat", "bg-contain", "img-arrow");
    this.leftArrow.setAttribute("disabled-cursor-allowed", "false");
    this.Root.appendChild(this.leftArrow);
    this.bar.classList.add(
      "relative",
      "flex",
      "items-center",
      "flex-1",
      "h-3",
      "cursor-pointer",
      "fxs-slider__bar"
    );
    this.fill.classList.add("absolute", "top-0", "left-0", "h-full", "w-full", "origin-left", "fxs-slider__fill");
    this.bar.appendChild(this.fill);
    this.thumb.classList.add(
      "absolute",
      "left-0",
      "w-2\\.5",
      "flex",
      "justify-center",
      "h-5",
      "py-px",
      "cursor-pointer",
      "transition-left",
      "duration-0"
    );
    const thumbInner = document.createElement("div");
    thumbInner.classList.add(
      "w-6",
      "h-8",
      "pointer-events-none",
      "fxs-slider__thumb",
      "bg-contain",
      "bg-no-repeat"
    );
    this.thumb.appendChild(thumbInner);
    this.bar.appendChild(this.thumb);
    this.Root.appendChild(this.bar);
    this.rightArrow.classList.add("w-8", "h-12", "bg-no-repeat", "bg-contain", "img-arrow", "rotate-180");
    this.rightArrow.setAttribute("disabled-cursor-allowed", "false");
    this.Root.appendChild(this.rightArrow);
  }
}
Controls.define("fxs-slider", {
  createInstance: FxsSlider,
  description: "A UI slider control primitive for selecting a smooth or stepped value between a range.",
  classNames: ["fxs-slider"],
  attributes: [{ name: "value" }],
  tabIndex: -1
});

export { FxsSlider as F };
//# sourceMappingURL=fxs-slider.chunk.js.map
