import { ActionActivateEvent } from './fxs-activatable.js';

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
    this.Root.addEventListener("mouseenter", (mevent) => {
      this.playSound("data-audio-focus", "data-audio-focus-ref");
      mevent.stopImmediatePropagation();
    });
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
    this.Root.classList.add("no-pan");
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

export { FxsCheckbox };
//# sourceMappingURL=fxs-checkbox.js.map
