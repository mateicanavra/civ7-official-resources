import { ActionActivateEvent } from './fxs-activatable.js';
import ActionHandler from '../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';

class FxsCloseButton extends Component {
  activateCounter = 0;
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.setVisibility(!ActionHandler.isGamepadActive);
    this.Root.classList.toggle("touch-enabled", UI.isTouchEnabled());
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
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
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    super.onDetach();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status == InputActionStatuses.START) {
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        this.playSound("data-audio-close-press");
      }
    } else if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      if (inputEvent.detail.name == "touch-touch") {
        this.Root.classList.add("pressed");
        this.playSound("data-audio-close-press");
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return;
      }
      if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap") {
        if (this.activateCounter == 0) {
          this.playSound("data-audio-close-selected");
        }
        this.activateCounter = 1;
        window.dispatchEvent(new SetActivatedComponentEvent(null));
        this.Root.dispatchEvent(new ActionActivateEvent(inputEvent.detail.x, inputEvent.detail.y));
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  setVisibility(isVisible) {
    this.Root.classList.toggle("hidden", !isVisible);
  }
  onActiveDeviceTypeChanged(event) {
    this.setVisibility(!event.detail?.gamepadActive);
  }
  render() {
    this.Root.classList.add("size-12", "cursor-pointer", "group");
    this.Root.innerHTML = `
			<div class="close-button__bg absolute inset-0"></div>
			<div class="close-button__bg-hover absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 transition-opacity"></div>
			<div class="close-button__bg-pressed absolute inset-0 opacity-0 group-active\\:opacity-100 group-pressed\\:opacity-100"></div>
		`;
  }
}
Controls.define("fxs-close-button", {
  createInstance: FxsCloseButton,
  description: "A close button primitive",
  classNames: ["fxs-close-button"],
  images: ["fs://game/hud_closebutton.png"]
});

export { FxsCloseButton };
//# sourceMappingURL=fxs-close-button.js.map
