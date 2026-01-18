import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import { Icon } from '../utilities/utilities-image.chunk.js';
import { L as Layout } from '../utilities/utilities-layout.chunk.js';
import { U as UpdateGate } from '../utilities/utilities-update-gate.chunk.js';

const actionButtonMap = /* @__PURE__ */ new Map([
  ["inline-confirm", "accept"],
  ["inline-accept", "accept"],
  ["confirm", "accept"],
  ["cancel", "cancel"],
  ["inline-cancel", "cancel"],
  ["back", "cancel"],
  ["exit", "cancel"],
  ["inline-next-action", "next-action"],
  ["inline-shell-action-1", "shell-action-1"],
  ["inline-shell-action-2", "shell-action-2"],
  ["inline-shell-action-3", "shell-action-3"],
  ["inline-toggle-tooltip", "toggle-tooltip"],
  ["inline-shell-action-5", "shell-action-5"],
  ["inline-swap-plot-selection", "swap-plot-selection"],
  ["inline-notification", "notification"],
  ["pause", "sys-menu"],
  ["sys-menu", "sys-menu"],
  ["inline-sys-menu", "sys-menu"],
  ["inline-nav-shell-previous", "nav-shell-previous"],
  ["inline-nav-shell-next", "nav-shell-next"],
  ["cycle-next", "nav-next"],
  ["inline-cycle-next", "nav-next"],
  ["inline-nav-next", "nav-next"],
  ["cycle-prev", "nav-previous"],
  ["cycle-previous", "nav-previous"],
  ["inline-cycle-prev", "nav-previous"],
  ["inline-cycle-previous", "nav-previous"],
  ["inline-nav-previous", "nav-previous"],
  ["unit-city-list", "nav-right"],
  ["inline-unit-city-list", "nav-right"],
  ["diplomacy-panel", "nav-left"],
  ["inline-diplomacy-panel", "nav-left"],
  ["inline-nav-down", "nav-down"],
  ["zoom", "camera-zoom-out"],
  ["inline-next-city", "camera-zoom-in"],
  ["inline-prev-city", "camera-zoom-out"],
  ["inline-zoom", "camera-zoom-out"],
  ["inline-nav-move", "nav-move"],
  ["inline-camera-pan", "camera-pan"],
  ["inline-scroll-pan", "scroll-pan"],
  ["inline-center-plot-cursor", "center-plot-cursor"],
  ["inline-toggle-diplo", "toggle-diplo"],
  ["inline-nav-up", "nav-up"],
  ["inline-toggle-chat", "toggle-chat"],
  ["inline-open-lens-panel", "open-lens-panel"],
  ["inline-toggle-quest", "toggle-quest"],
  ["inline-toggle-radial-menu", "toggle-radial-menu"],
  ["inline-navigate-yields", "navigate-yields"],
  ["inline-nav-left", "nav-left"],
  ["inline-nav-right", "nav-right"]
]);
var DecorationMode = /* @__PURE__ */ ((DecorationMode2) => {
  DecorationMode2["NONE"] = "none";
  DecorationMode2["BORDER"] = "border";
  return DecorationMode2;
})(DecorationMode || {});
const getTextHelpForAction = (queryAction) => {
  let buttonIcon = "";
  switch (queryAction.toUpperCase()) {
    case "CONFIRM":
      buttonIcon = "[ENTER]";
      break;
    case "CANCEL":
    case "BACK":
    case "EXIT":
      buttonIcon = "[ESC]";
      break;
    case "CYCLE-NEXT":
      buttonIcon = "[TAB]";
      break;
    case "CYCLE-PREV":
    case "CYCLE-PREVIOUS":
      buttonIcon = "[CTRL]+[TAB]";
      break;
    case "ZOOM":
      buttonIcon = "[MOUSEWHEEL]";
      break;
  }
  return buttonIcon;
};
const ICON_SIZE = Layout.pixels(32);
const BORDER_IMAGE_SIZE = Layout.pixels(42);
const BORDER_POS_X = Layout.pixels((52 - 42) / -2 + 1);
const BORDER_POS_Y = Layout.pixels((52 - 42) / -2 - 2);
const BORDER_SIZE = Layout.pixels(52);
const PS4_OPTIONS_TEXT = "OPTIONS";
const PS4_SHARE_TEXT = "SHARE";
const mapIconToText = {
  ps4_icon_start: PS4_OPTIONS_TEXT,
  ps4_icon_share: PS4_SHARE_TEXT
};
class FxsNavHelp extends Component {
  textHelp;
  label = document.createElement("div");
  iconStartText;
  iconElement;
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  actionKey = "";
  altActionKey = "";
  decorationMode = "none" /* NONE */;
  caption = "";
  // possibly add more properties here to avoid setting styles to the same values in update
  prevState = {
    isGamepadActive: ActionHandler.isGamepadActive
  };
  updateGate = new UpdateGate(this.onUpdate.bind(this));
  /**
   * Get the matching Gamepad action name of an Input action name
   * @param actionKey Input action name
   */
  static getGamepadActionName(actionKey) {
    return actionButtonMap.get(actionKey.toLowerCase());
  }
  onInitialize() {
    if (this.actionKey == "") {
      const attr = this.Root.getAttribute("action-key");
      this.actionKey = attr ? attr : "";
    }
    if (this.altActionKey == "") {
      const attr = this.Root.getAttribute("alt-action-key");
      this.altActionKey = attr ? attr : "";
    }
    if (this.caption == "") {
      const attr = this.Root.getAttribute("caption");
      this.caption = attr ? attr : "";
    }
    const hasHoverOnlyTriggerParent = this.Root.closest('[hover-only-trigger="true"]') != null;
    this.Root.classList.toggle("hover-only-display", hasHoverOnlyTriggerParent);
    this.Root.classList.add("hidden", "flex-row", "items-center", "justify-center", "pointer-events-none");
    this.label.classList.add("mx-1");
    this.iconStartText = document.createElement("div");
    this.iconStartText.classList.add("text-accent-1", "text-shadow", "text-2xs");
    this.refreshContainers();
  }
  onAttach() {
    super.onAttach();
    this.updateGate.call("onAttach");
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    engine.on("InputContextChanged", this.onActiveContextChanged, this);
    engine.on("InputActionBinded", this.onInputActionBinded, this);
    engine.on("InputPreferencesLoaded", this.onPreferencesLoaded, this);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    engine.off("InputContextChanged", this.onActiveContextChanged, this);
    engine.off("InputActionBinded", this.onInputActionBinded, this);
    engine.off("InputPreferencesLoaded", this.onPreferencesLoaded, this);
    super.onDetach();
  }
  onActiveContextChanged() {
    this.updateGate.call("onActiveContextChanged");
  }
  onInputActionBinded() {
    this.updateGate.call("onInputActionBinded");
  }
  onPreferencesLoaded() {
    this.updateGate.call("onPreferencesLoaded");
  }
  onActiveDeviceTypeChanged() {
    this.updateGate.call("onActiveDeviceTypeChanged");
  }
  refreshContainers() {
    while (this.Root.hasChildNodes()) {
      this.Root.removeChild(this.Root.lastChild);
    }
    this.iconElement = void 0;
    this.textHelp = void 0;
    if (ActionHandler.isGamepadActive) {
      this.iconElement = document.createElement("div");
      this.iconElement.classList.add("relative");
      this.label.classList.add("mx-1");
      this.Root.append(this.iconElement, this.label, this.iconStartText);
    } else {
      this.textHelp = document.createElement("div");
      this.textHelp.classList.add("self-stretch", "mx-1");
      this.Root.append(this.textHelp, this.label);
    }
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (name == "action-key") {
      if (newValue != this.actionKey) {
        this.actionKey = newValue;
        this.updateGate.call("onAttributeChanged");
      }
    } else if (name = "decoration-mode") {
      if (newValue != this.decorationMode && ["none" /* NONE */, "border" /* BORDER */].includes(newValue)) {
        this.decorationMode = newValue;
        this.updateGate.call("onAttributeChanged");
      }
    } else if (name == "alt-action-key") {
      if (newValue != this.altActionKey) {
        this.altActionKey = newValue;
      }
    } else if (this.label && name == "caption") {
      if (newValue) {
        this.label.setAttribute("data-l10n-id", newValue);
      } else {
        this.label.removeAttribute("data-l10n-id");
      }
      this.updateGate.call("onAttributeChanged");
    }
  }
  onUpdate() {
    const prevState = this.prevState;
    const actionName = FxsNavHelp.getGamepadActionName(this.actionKey);
    const actionId = actionName ? Input.getActionIdByName(actionName) : null;
    const isAllowed = actionId != null && Input.isActionAllowed(actionId, Input.getActiveContext());
    const isIconTextSpace = this.Root.getAttribute("is-icon-text-space") == "true";
    if (this.Root.getAttribute("hide-if-not-allowed") == "true" && !isAllowed) {
      this.Root.style.display = "none";
    } else {
      this.Root.style.display = "";
    }
    if (prevState.isGamepadActive != ActionHandler.isGamepadActive) {
      prevState.isGamepadActive = ActionHandler.isGamepadActive;
      this.refreshContainers();
    }
    let imagePath = "";
    let textHelp = "";
    if (this.actionKey != "") {
      if (ActionHandler.isGamepadActive) {
        imagePath = Icon.getIconFromActionName(FxsNavHelp.getGamepadActionName(this.actionKey)) ?? "";
      } else {
        textHelp = getTextHelpForAction(this.actionKey);
      }
    }
    if ((imagePath == "" || imagePath.includes("icon_mapping_unknown")) && this.altActionKey != "") {
      if (ActionHandler.isGamepadActive) {
        imagePath = Icon.getIconFromActionName(FxsNavHelp.getGamepadActionName(this.altActionKey)) ?? "";
      }
    }
    if (this.iconElement) {
      if (imagePath != "") {
        if (this.decorationMode === "border" /* BORDER */) {
          this.iconElement.style.backgroundImage = `url(${imagePath}), url("fs://game/hud_navhelp_bk.png")`;
          this.iconElement.style.backgroundRepeat = "no-repeat, no-repeat";
          this.iconElement.style.backgroundSize = `${ICON_SIZE} auto, ${BORDER_SIZE} auto`;
          this.iconElement.style.backgroundPosition = `center, ${BORDER_POS_X} ${BORDER_POS_Y}`;
          this.iconElement.style.width = BORDER_IMAGE_SIZE;
          this.iconElement.style.height = BORDER_IMAGE_SIZE;
        } else {
          this.iconElement.style.backgroundImage = `url(${imagePath})`;
          this.iconElement.classList.add("size-8", "bg-no-repeat", "bg-contain", "bg-center");
        }
        this.iconElement.classList.add("justify-center");
        this.iconElement.style.display = "flex";
        this.iconStartText.innerHTML = mapIconToText[imagePath] ?? "";
        this.iconStartText.classList.toggle(
          "hidden",
          !["ps4_icon_start", "ps4_icon_share"].includes(imagePath)
        );
        this.iconStartText.classList.toggle("bottom-7", !isIconTextSpace);
        this.iconStartText.classList.toggle("absolute", !isIconTextSpace);
        this.iconStartText.classList.toggle("-mb-2\\.5", isIconTextSpace);
        this.iconStartText.classList.toggle("relative", isIconTextSpace);
        this.Root.classList.toggle(
          "flex-col-reverse",
          ["ps4_icon_start", "ps4_icon_share"].includes(imagePath) && isIconTextSpace
        );
      } else {
        this.iconElement.style.display = "none";
      }
    }
    if (this.textHelp) {
      if (textHelp != "" && this.label) {
        this.textHelp.innerHTML = textHelp;
        this.textHelp.style.display = "flex";
      } else {
        this.textHelp.style.display = "none";
      }
    }
    if (imagePath != "" && this.caption != "") {
      this.label.setAttribute("data-l10n-id", this.caption);
      this.label.classList.remove("hidden");
    } else {
      this.label.removeAttribute("data-l10n-id");
      this.label.classList.add("hidden");
    }
  }
}
Controls.define("fxs-nav-help", {
  createInstance: FxsNavHelp,
  description: "A container that fills with navigation button icon ",
  classNames: ["fxs-nav-help", "relative"],
  attributes: [
    {
      name: "action-key",
      description: "The string key that will be converted to platform-specific button image. "
    },
    {
      name: "alt-action-key",
      description: "Backup if the action-key is not valid in the current context"
    },
    {
      name: "decoration-mode",
      description: "none | border"
    },
    {
      name: "caption"
    },
    {
      name: "is-icon-text-space",
      description: "is the icon text going to extend the width & height of the nav help"
    }
  ]
});

export { FxsNavHelp as F };
//# sourceMappingURL=fxs-nav-help.chunk.js.map
