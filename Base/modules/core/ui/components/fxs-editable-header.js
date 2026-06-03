import { FxsHeader } from './fxs-header.js';
import ActionHandler from '../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { InputEngineEventName } from '../input/input-support.js';

const EditableHeaderTextChangedEventName = "editable-header-text-changed";
class EditableHeaderTextChangedEvent extends CustomEvent {
  constructor(newStr) {
    super(EditableHeaderTextChangedEventName, { bubbles: false, cancelable: true, detail: { newStr } });
  }
}
const EditableHeaderExitEditEventName = "editable-header-exit-edit";
class EditableHeaderExitEditEvent extends CustomEvent {
  constructor() {
    super(EditableHeaderExitEditEventName, { bubbles: false, cancelable: true });
  }
}
class FxsEditableHeader extends FxsHeader {
  inputHandler = this.Root;
  editableTextBox = document.createElement("fxs-textbox");
  staticText = document.createElement("div");
  textEditToggleButton = document.createElement("fxs-edit-button");
  textEditToggleNavHelp = document.createElement("fxs-nav-help");
  disable = false;
  onEditToggleActivatedListener = this.onEditToggleActivated.bind(this);
  onTextEditStoppedListener = this.onTextEditStopped.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  bPreventRecursion = false;
  textboxMaxLength = 32;
  onAttach() {
    const tabForSelector = this.Root.getAttribute("tab-for") ?? "fxs-frame";
    if (tabForSelector !== "") {
      const inputHandler = this.Root.closest(tabForSelector);
      if (!inputHandler) {
        console.error(`fxs-editable-header: onAttach - no valid input handler found!`);
      } else {
        this.inputHandler = inputHandler;
      }
    }
    this.textEditToggleNavHelp.setAttribute("action-key", "inline-shell-action-3");
    this.textEditToggleNavHelp.classList.add("absolute", "left-0");
    this.inputHandler.addEventListener(InputEngineEventName, this.engineInputListener);
    this.staticText.classList.add(
      "font-fit-shrink",
      "max-w-84",
      "text-center",
      "truncate",
      "relative",
      this.bgGlow ? "text-shadow-subtle" : ""
    );
    this.editableTextBox.setAttribute("has-background", "false");
    this.editableTextBox.setAttribute("has-border", "false");
    this.editableTextBox.setAttribute("enabled", "false");
    this.editableTextBox.setAttribute("max-length", this.textboxMaxLength.toString());
    this.editableTextBox.addEventListener("text-edit-stop", this.onTextEditStoppedListener);
    this.editableTextBox.classList.add("max-w-84", "relative");
    this.textEditToggleButton.classList.add("size-8", "bg-contain", "bg-no-repeat", "absolute", "right-0");
    this.textEditToggleButton.addEventListener("action-activate", this.onEditToggleActivatedListener);
    this.textEditToggleButton.classList.toggle("hidden", ActionHandler.isGamepadActive);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onAttach();
  }
  onDetach() {
    this.inputHandler.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.textEditToggleButton.removeEventListener("action-activate", this.onEditToggleActivatedListener);
    this.editableTextBox.removeEventListener("text-edit-stop", this.onTextEditStoppedListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onDetach();
  }
  render() {
    this.renderQueued = false;
    while (this.Root.firstChild) {
      this.Root.removeChild(this.Root.firstChild);
    }
    this.editableTextBox.classList.add("hidden");
    this.staticText.setAttribute("data-l10n-id", this.titleText ?? "");
    this.editableTextBox.setAttribute("value", this.titleText ?? "");
    const outerDiv = document.createElement("div");
    if (this.bgGlow) {
      this.Root.insertAdjacentHTML("afterbegin", this.generateGlow(true));
    }
    switch (this.filigreeStyle) {
      case "none":
        outerDiv.append(this.editableTextBox);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h1":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h1"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h2":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h2"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h3":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h3"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h4":
        outerDiv.classList.add("flex", "justify-center", "max-w-full", "items-center");
        const leftDiv = document.createElement("div");
        leftDiv.classList.add("filigree-h4-left");
        outerDiv.appendChild(leftDiv);
        const midDiv = document.createElement("div");
        midDiv.classList.add("flow-row");
        midDiv.appendChild(this.editableTextBox);
        outerDiv.appendChild(midDiv);
        const rightDiv = document.createElement("div");
        rightDiv.classList.add("filigree-h4-right");
        outerDiv.appendChild(rightDiv);
        break;
      case "small":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.insertAdjacentHTML("afterbegin", `<div class="filigree-shell-small mt-2\\.5"></div>`);
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      default:
        console.warn(`fxs-editable-header - Invalid header style`);
    }
    this.Root.appendChild(outerDiv);
    this.Root.appendChild(this.textEditToggleButton);
    this.Root.appendChild(this.textEditToggleNavHelp);
  }
  onActiveDeviceChange(event) {
    this.textEditToggleButton.classList.toggle("hidden", event.detail.gamepadActive);
  }
  onTextEditStopped(event) {
    if (event.detail.confirmed) {
      this.textEditEnd();
    } else {
      this.onCancelEdit();
      this.Root.dispatchEvent(new EditableHeaderExitEditEvent());
    }
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || this.disable) {
      return;
    }
    if (event.detail.name == "shell-action-3" || event.detail.name == "accept") {
      this.onEditToggleActivated();
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onCancelEdit() {
    this.bPreventRecursion = true;
    this.editableTextBox.classList.add("hidden");
    this.staticText.classList.remove("hidden");
    this.editableTextBox.setAttribute("value", this.staticText.innerHTML);
    this.editableTextBox.setAttribute("enabled", "false");
    this.textEditToggleButton.setAttribute("is-confirm", "false");
    this.bPreventRecursion = false;
  }
  onEditToggleActivated() {
    const shouldEnable = this.editableTextBox.getAttribute("enabled") != "true";
    if (shouldEnable) {
      this.textEditBegin();
    } else {
      this.textEditEnd();
    }
  }
  textEditBegin() {
    this.editableTextBox.classList.remove("hidden");
    this.editableTextBox.setAttribute("value", this.staticText.innerHTML);
    this.staticText.classList.add("hidden");
    if (UI.canDisplayKeyboard()) {
      this.editableTextBox.setAttribute("activated", "true");
    } else {
      this.editableTextBox.setAttribute("enabled", "true");
    }
    this.textEditToggleButton.setAttribute("is-confirm", "true");
  }
  textEditEnd() {
    this.bPreventRecursion = true;
    this.editableTextBox.setAttribute("enabled", "false");
    const textboxValue = this.editableTextBox.getAttribute("value") ?? "";
    if (textboxValue.trim().length != 0) {
      this.Root.setAttribute("title", Locale.fromUGC("LOC_CITY_CUSTOM_NAME", textboxValue));
      this.Root.dispatchEvent(new EditableHeaderTextChangedEvent(textboxValue));
      this.Root.dispatchEvent(new EditableHeaderExitEditEvent());
      this.textEditToggleButton.setAttribute("is-confirm", "false");
      this.bPreventRecursion = false;
    } else {
      this.textEditBegin();
    }
  }
  onAttributeChanged(_name, _oldValue, _newValue) {
    switch (_name) {
      case "title":
        if (!this.bPreventRecursion) {
          this.onCancelEdit();
        }
        this.staticText.setAttribute("data-l10n-id", _newValue);
        break;
      case "disable":
        this.disable = _newValue == "true" ? true : false;
        break;
      default:
        super.onAttributeChanged(_name, _oldValue, _newValue);
    }
  }
}
Controls.define("fxs-editable-header", {
  createInstance: FxsEditableHeader,
  description: "An editable header",
  skipPostOnAttach: true,
  classNames: ["fxs-editable-header", "relative"],
  attributes: [
    {
      name: "title"
    },
    {
      name: "filigree-style",
      description: "The style of the title from the following list: none, h1, h2, h3, h4, small. Default value: h3"
    },
    {
      name: "font-fit-mode",
      description: "Whether to grow or shrink the text to fit the header."
    },
    {
      name: "font-min-size",
      description: "overwrite the text min shrink size (default: 14px)"
    },
    {
      name: "text-edit-enabled",
      description: "toggle if text is being edited or not"
    },
    {
      name: "disable"
    }
  ],
  images: [
    "fs://game/header_filigree.png",
    "fs://game/hud_divider-h2.png",
    "fs://game/hud_sidepanel_divider.png",
    "fs://game/hud_fleur.png",
    "fs://game/shell_small-filigree.png",
    "fs://game/hud_paneltop-simple.png"
  ]
});

export { EditableHeaderExitEditEvent, EditableHeaderExitEditEventName, EditableHeaderTextChangedEvent, EditableHeaderTextChangedEventName, FxsEditableHeader };
//# sourceMappingURL=fxs-editable-header.js.map
