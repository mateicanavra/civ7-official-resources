import { A as ActionActivateEvent } from './fxs-activatable.chunk.js';

class FxsCheckbox extends ChangeNotificationComponent {
  navHelp;
  navContainer = document.createElement("div");
  idleElement = document.createElement("div");
  highlightElement = document.createElement("div");
  pressedElement = document.createElement("div");
  engineInputListener = this.onEngineInput.bind(this);
  /** Get the current value of the checkbox */
  get value() {
    return this.isChecked;
  }
  get disabled() {
    return this.Root.getAttribute("disabled") === "true";
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value.toString());
  }
  _isChecked = false;
  get isChecked() {
    return this._isChecked;
  }
  set isChecked(value) {
    this._isChecked = value;
    const correctSelectedAttribute = value ? "true" : "false";
    if (this.Root.getAttribute("selected") !== correctSelectedAttribute) {
      this.Root.setAttribute("selected", correctSelectedAttribute);
    }
  }
  toggle(force = void 0) {
    const wasChecked = this.isChecked;
    this.isChecked = force ?? !this.isChecked;
    if (wasChecked === this.isChecked) {
      return;
    }
    if (force == void 0) {
      const id = this.isChecked ? "data-audio-checkbox-enable" : "data-audio-checkbox-disable";
      this.playSound(id);
    }
    const changeEvent = new ComponentValueChangeEvent({
      value: this.isChecked,
      forced: force != void 0
    });
    const cancelled = !this.sendValueChange(changeEvent);
    if (cancelled) {
      this.isChecked = wasChecked;
      return;
    }
    this.updateCheckboxElements();
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.listenForWindowEvent(
      "engine-input",
      (inputEvent) => {
        if (inputEvent.detail.name == "touch-complete" && this.Root.classList.contains("pressed")) {
          this.Root.classList.remove("pressed");
        }
      },
      true
    );
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "touch-touch") {
      this.Root.classList.add("pressed");
      if (this.disabled) {
        this.playSound("data-audio-error-press");
      } else {
        this.playSound("data-audio-checkbox-press");
      }
    }
    if (this.disabled) {
      if (inputEvent.detail.status == InputActionStatuses.START) {
        if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
          this.playSound("data-audio-error-press");
        }
      }
      return;
    }
    if (inputEvent.detail.status == InputActionStatuses.START) {
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        this.playSound("data-audio-checkbox-press");
      }
    } else if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        this.toggle();
        window.dispatchEvent(new ActivatedComponentChangeEvent(null));
        this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "disabled":
        this.updateCheckboxElements();
        break;
      case "selected":
        this.toggle(newValue === "true");
        break;
      case "action-key": {
        this.addOrRemoveNavHelpElement(this.navContainer, newValue);
        break;
      }
    }
  }
  updateCheckboxElements() {
    this.idleElement.classList.toggle("img-checkbox-on", this.isChecked);
    this.idleElement.classList.toggle("img-checkbox-off", !this.isChecked);
    this.highlightElement.classList.toggle("img-checkbox-on-highlight", this.isChecked);
    this.highlightElement.classList.toggle("img-checkbox-off-highlight", !this.isChecked);
    this.pressedElement.classList.toggle("img-checkbox-on-pressed", this.isChecked);
    this.pressedElement.classList.toggle("img-checkbox-off-pressed", !this.isChecked);
    const disabled = this.disabled;
    this.Root.classList.toggle("cursor-not-allowed", disabled);
    this.Root.classList.toggle("cursor-pointer", !disabled);
    this.highlightElement.classList.toggle("hidden", disabled);
    this.pressedElement.classList.toggle("hidden", disabled);
  }
  render() {
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    this.Root.classList.add("group", "relative", "cursor-pointer", "pointer-events-auto");
    this.Root.classList.toggle("size-8", !isMobileViewExperience);
    this.Root.classList.toggle("size-10", isMobileViewExperience);
    this.idleElement.className = "size-full";
    this.highlightElement.className = "absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 transition-opacity";
    this.pressedElement.className = "absolute inset-0 opacity-0 group-active\\:opacity-100 group-pressed\\:opacity-100 transition-opacity";
    this.Root.appendChild(this.idleElement);
    this.Root.appendChild(this.highlightElement);
    this.Root.appendChild(this.pressedElement);
    this.updateCheckboxElements();
    this.navContainer.className = "absolute -left-7 flex flex-col h-full self-center items-center justify-center";
    this.Root.appendChild(this.navContainer);
    this.addOrRemoveNavHelpElement(this.navContainer, this.Root.getAttribute("action-key"));
  }
  addOrRemoveNavHelpElement(parent, value) {
    if (value) {
      this.navHelp ??= document.createElement("fxs-nav-help");
      if (!this.navHelp.parentElement) {
        parent.appendChild(this.navHelp);
      }
      this.navHelp.setAttribute("action-key", value);
    } else if (this.navHelp) {
      this.Root.removeChild(this.navHelp);
    }
  }
}
Controls.define("fxs-checkbox", {
  createInstance: FxsCheckbox,
  description: "A checkbox primitive",
  classNames: ["fxs-checkbox"],
  attributes: [
    {
      name: "disabled"
    },
    {
      name: "selected",
      description: "Whether or not the checkbox is 'checked'."
    },
    {
      name: "action-key",
      description: "The action key for inline nav help."
    }
  ],
  images: ["fs://game/base_checkbox-on.png", "fs://game/base_checkbox-off.png"],
  tabIndex: -1
});

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

class FxsSwitch extends ChangeNotificationComponent {
  isChecked = false;
  navHelp;
  navContainer = document.createElement("div");
  onStateElements = document.createElement("div");
  offStateElements = document.createElement("div");
  ballElement = document.createElement("div");
  leftValue = CSS.px(0);
  resizeObserver = new ResizeObserver(this.updateBallPosition.bind(this));
  onEngineInputListener = this.onEngineInput.bind(this);
  get disabled() {
    return this.Root.getAttribute("disabled") === "true";
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value.toString());
  }
  toggle(force = void 0) {
    const wasChecked = this.isChecked;
    this.isChecked = force ?? !this.isChecked;
    if (wasChecked === this.isChecked) {
      return;
    }
    const changeEvent = new ComponentValueChangeEvent({
      value: this.isChecked,
      forced: force != void 0
    });
    const cancelled = !this.sendValueChange(changeEvent);
    if (cancelled) {
      this.isChecked = wasChecked;
      return;
    }
    this.updateSwitchElements();
    this.updateBallPosition();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      this.toggle();
      window.dispatchEvent(new ActivatedComponentChangeEvent(null));
      this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  addOrRemoveNavHelpElement(parent, value) {
    if (value) {
      this.navHelp ??= document.createElement("fxs-nav-help");
      if (!this.navHelp.parentElement) {
        parent.appendChild(this.navHelp);
      }
      this.navHelp.setAttribute("action-key", value);
    } else if (this.navHelp) {
      this.Root.removeChild(this.navHelp);
    }
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.resizeObserver.observe(this.Root);
    this.Root.addEventListener("engine-input", this.onEngineInputListener);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.onEngineInputListener);
    this.resizeObserver.disconnect();
    super.onDetach();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "disabled":
        super.onAttributeChanged(name, _oldValue, newValue);
        break;
      case "selected":
        this.toggle(newValue === "true");
        break;
      case "action-key": {
        this.addOrRemoveNavHelpElement(this.navContainer, newValue);
        break;
      }
    }
  }
  updateSwitchElements() {
    this.Root.classList.toggle("img-switch-frame-off", !this.isChecked);
    this.Root.classList.toggle("img-switch-frame-on", this.isChecked);
    const disabled = this.disabled;
    this.Root.classList.toggle("group", !disabled);
    this.ballElement.classList.toggle("opacity-40", disabled);
    this.Root.classList.toggle("cursor-pointer", !disabled);
  }
  updateBallPosition() {
    const ballWidth = this.ballElement.offsetWidth;
    const switchWidth = this.Root.offsetWidth;
    this.leftValue.value = this.isChecked ? switchWidth - ballWidth * 2 : 0;
    this.ballElement.attributeStyleMap.set("left", this.leftValue);
  }
  render() {
    this.Root.classList.add("group", "relative", "flex", "items-center", "h-8", "w-20", "px-2", "py-1");
    this.onStateElements.classList.value = "absolute inset-0 transition-opacity";
    this.onStateElements.innerHTML = `
			<div class="absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 img-switch-frame-on-focus transition-opacity"></div>
			<div class="absolute inset-0 opacity-0 group-active\\:opacity-100 img-switch-frame-on-active transition-opacity"></div>
		`;
    this.offStateElements.classList.value = "absolute inset-0 transition-opacity";
    this.offStateElements.innerHTML = `
			<div class="absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 img-switch-frame-off-focus transition-opacity"></div>
			<div class="absolute inset-0 opacity-0 group-active\\:opacity-100 img-switch-frame-off-active transition-opacity"></div>
		`;
    this.Root.appendChild(this.onStateElements);
    this.Root.appendChild(this.offStateElements);
    this.ballElement.classList.value = "relative size-4 img-radio-button-ball transition-all";
    this.Root.appendChild(this.ballElement);
    this.updateSwitchElements();
  }
}
Controls.define("fxs-switch", {
  createInstance: FxsSwitch,
  description: "A switch primitive",
  attributes: [
    {
      name: "disabled"
    },
    {
      name: "selected",
      description: "Whether or not the switch is 'checked'."
    },
    {
      name: "action-key",
      description: "The action key for inline nav help."
    }
  ],
  tabIndex: -1
});

export { FxsCheckbox as F, FxsStepper as a, FxsSwitch as b };
//# sourceMappingURL=fxs-switch.chunk.js.map
