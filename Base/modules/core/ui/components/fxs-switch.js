import { ActionActivateEvent } from './fxs-activatable.js';

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

export { FxsSwitch };
//# sourceMappingURL=fxs-switch.js.map
