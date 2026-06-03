class FxsStepper extends ChangeNotificationComponent {
  minValue = 1;
  _value = 3;
  maxValue = 5;
  caption = null;
  leftArrow = null;
  rightArrow = null;
  stepperSteps = null;
  captionsList = null;
  navigateInputEventListener = this.onNavigateInput.bind(this);
  leftArrowClickEventListener = this.onLeftArrowClick.bind(this);
  rightArrowClickEventListener = this.onRightArrowClick.bind(this);
  get value() {
    return this._value;
  }
  get captionText() {
    return this.captionsList ? this.captionsList[this.value] : this.value.toString();
  }
  addEventListeners() {
    this.Root.addEventListener("navigate-input", this.navigateInputEventListener);
    this.leftArrow?.addEventListener("click", this.leftArrowClickEventListener);
    this.rightArrow?.addEventListener("click", this.rightArrowClickEventListener);
  }
  removeEventListeners() {
    this.Root.removeEventListener("navigate-input", this.navigateInputEventListener);
    this.leftArrow?.removeEventListener("click", this.leftArrowClickEventListener);
    this.rightArrow?.removeEventListener("click", this.rightArrowClickEventListener);
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopPropagation();
    }
  }
  onLeftArrowClick() {
    if (this._value > this.minValue) {
      this._value--;
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      this.setNewValue(this._value);
    }
  }
  onRightArrowClick() {
    if (this._value < this.maxValue) {
      this._value++;
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      this.setNewValue(this._value);
    }
  }
  updateStepperSteps() {
    const value = this.value;
    const count = this.stepperSteps?.length ?? 0;
    for (let i = 0; i < count; i++) {
      const step = this.stepperSteps?.item(i);
      if (step) {
        step.classList.toggle("selected", i + 1 === value);
      }
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.LEFT:
      case InputNavigationAction.RIGHT: {
        let value = this.value;
        value = direction == InputNavigationAction.LEFT ? value - 1 : value + 1;
        if (value >= this.minValue && value <= this.maxValue) {
          this.setNewValue(value);
        }
        live = false;
        break;
      }
    }
    return live;
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.addEventListeners();
  }
  onDetach() {
    this.removeEventListeners();
    super.onDetach();
  }
  onAttributeChanged(attributeName, _oldValue, newValue) {
    switch (attributeName) {
      case "captions-list": {
        if (newValue) {
          this.captionsList = JSON.parse(newValue);
        } else {
          this.captionsList = null;
        }
        if (this.caption) {
          this.caption.innerHTML = this.captionText;
        }
        break;
      }
    }
  }
  setNewValue(newValue) {
    this.Root.setAttribute("value", newValue.toString());
    this.updateStepperSteps();
    if (this.caption) {
      this.caption.innerHTML = this.captionText;
    }
    this.sendValueChange(
      new ComponentValueChangeEvent({
        value: newValue
      })
    );
  }
  render() {
    this.minValue = parseInt(this.Root.getAttribute("min-value") || "1");
    this.maxValue = parseInt(this.Root.getAttribute("max-value") || "5");
    const parsedValue = parseInt(this.Root.getAttribute("value") || "3");
    this._value = Math.min(Math.max(parsedValue, this.minValue), this.maxValue);
    let stepItems = "";
    for (let i = this.minValue; i <= this.maxValue; i++) {
      const classList = i === this.value ? "fxs-stepper-step selected" : "fxs-stepper-step";
      stepItems += `<div class="${classList}" step="${i}"></div>`;
    }
    this.Root.innerHTML = `
			<div class="fxs-stepper-left fxs-stepper-arrow">
				<div class="fxs-stepper-arrow stepper-left-arrow-shadow"></div>
				<div class="fxs-stepper-arrow stepper-left-arrow-shape"></div>
				<div class="fxs-stepper-arrow stepper-left-arrow-overlay"></div>
			</div>
			<div class="fxs-stepper-center-container">
				<div class="fxs-stepper-caption">${this.captionText}</div>
				<div class="fxs-stepper-step-container">${stepItems}</div>
			</div>
			<div class="fxs-stepper-right fxs-stepper-arrow">
				<div class="fxs-stepper-arrow stepper-right-arrow-shadow"></div>
				<div class="fxs-stepper-arrow stepper-right-arrow-shape"></div>
				<div class="fxs-stepper-arrow stepper-right-arrow-overlay"></div>
			</div>
		`;
    this.caption = this.Root.querySelector(".fxs-stepper-caption");
    this.leftArrow = this.Root.querySelector(".fxs-stepper-left");
    this.rightArrow = this.Root.querySelector(".fxs-stepper-right");
    this.stepperSteps = this.Root.querySelectorAll(".fxs-stepper-step");
  }
}
Controls.define("fxs-stepper", {
  createInstance: FxsStepper,
  description: "A stepper primitive",
  classNames: ["fxs-stepper"],
  attributes: [
    {
      name: "value",
      description: "The current value of the stepper"
    }
  ],
  tabIndex: -1
});

export { FxsStepper };
//# sourceMappingURL=fxs-stepper.js.map
