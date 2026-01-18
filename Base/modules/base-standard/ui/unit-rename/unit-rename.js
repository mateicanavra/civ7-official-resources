import { a as TextBoxTextChangedEventName, c as TextBoxTextEditStopEventName } from '../../../core/ui/components/fxs-textbox.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

const content = "<div\r\n\tclass=\"unit-rename__container flex flex-col items-center size-full justify-around\"\r\n\tframe-style=\"simple\"\r\n\toverride-styling=\"relative flex flex-col p-1\"\r\n>\r\n\t<fxs-nav-help\r\n\t\taction-key=\"inline-cancel\"\r\n\t\tclass=\"absolute -top-3 -right-3\"\r\n\t></fxs-nav-help>\r\n\t<fxs-close-button></fxs-close-button>\r\n\t<fxs-header\r\n\t\tclass=\"mt-1\"\r\n\t\ttitle=\"LOC_UNIT_RENAME_UNIT\"\r\n\t\tfiligree-style=\"none\"\r\n\t></fxs-header>\r\n\t<div class=\"h-10 w-96\">\r\n\t\t<fxs-textbox\r\n\t\t\tclass=\"unit-rename__textbox\"\r\n\t\t\thas-background=\"false\"\r\n\t\t></fxs-textbox>\r\n\t</div>\r\n\t<div class=\"relative\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"unit-rename__confirm mb-1\"\r\n\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\tdisabled=\"true\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/unit-rename/unit-rename.css";

const UnitRenameConfirmEventName = "unit-rename-confirm";
class UnitRenameConfirmEvent extends CustomEvent {
  constructor(newName) {
    super(UnitRenameConfirmEventName, { bubbles: false, cancelable: true, detail: { newName } });
  }
}
const UnitRenameHideStatusToggledEventName = "unit-rename-hide-status-toggle";
class UnitRenameHideStatusToggledEvent extends CustomEvent {
  constructor(isHidden) {
    super(UnitRenameHideStatusToggledEventName, { bubbles: false, cancelable: true, detail: { isHidden } });
  }
}
class UnitRename extends Panel {
  nameEditConfirmButton;
  nameEditTextBox;
  nameEditCloseButton;
  onCommanderNameConfirmedListener = this.onNameConfirmed.bind(this);
  onTextBoxTextChangedListener = this.onTextBoxTextChanged.bind(this);
  onTextBoxEditingStoppedListener = this.onTextBoxEditingStopped.bind(this);
  onCloseButtonListener = this.onCloseButton.bind(this);
  onEngineInputListener = this.onEngineInput.bind(this);
  textboxMaxLength = 32;
  onInitialize() {
    this.Root.classList.add("absolute", "w-128", "h-60", "trigger-nav-help");
    this.nameEditConfirmButton = MustGetElement(".unit-rename__confirm", this.Root);
    this.nameEditTextBox = MustGetElement(".unit-rename__textbox", this.Root);
    this.nameEditCloseButton = MustGetElement("fxs-close-button", this.Root);
  }
  onAttach() {
    super.onAttach();
    this.nameEditConfirmButton.addEventListener("action-activate", this.onCommanderNameConfirmedListener);
    this.nameEditConfirmButton.setAttribute("action-key", "inline-swap-plot-selection");
    this.nameEditTextBox.addEventListener(TextBoxTextChangedEventName, this.onTextBoxTextChangedListener);
    this.nameEditCloseButton.addEventListener("action-activate", this.onCloseButtonListener);
    this.nameEditTextBox.addEventListener(TextBoxTextEditStopEventName, this.onTextBoxEditingStoppedListener);
    this.Root.addEventListener(InputEngineEventName, this.onEngineInputListener);
    this.nameEditTextBox.setAttribute("max-length", this.textboxMaxLength.toString());
  }
  onDetach() {
    this.nameEditConfirmButton.removeEventListener("action-activate", this.onCommanderNameConfirmedListener);
    this.nameEditTextBox.removeEventListener(TextBoxTextChangedEventName, this.onTextBoxTextChangedListener);
    this.nameEditTextBox.removeEventListener(TextBoxTextEditStopEventName, this.onTextBoxEditingStoppedListener);
    this.nameEditCloseButton.removeEventListener("action-activate", this.onCloseButtonListener);
    this.Root.removeEventListener(InputEngineEventName, this.onEngineInputListener);
    super.onDetach();
  }
  //Handle confirmation of the unit's name
  onNameConfirmed() {
    const textBoxValue = this.nameEditTextBox.getAttribute("value");
    if (textBoxValue == null) {
      console.error("unit-rename: onNameConfirmed - confirming null name.");
      return;
    }
    if (textBoxValue.length == 0) {
      console.warn("unit-rename: onNameConfirmed - confirming empty name. This is probably not intentional.");
    }
    this.Root.dispatchEvent(new UnitRenameConfirmEvent(textBoxValue));
  }
  //handle changing text in the text box. Don't let people input empty names
  onTextBoxTextChanged(event) {
    const newString = event.detail.newStr;
    const shouldDisabledConfirm = newString.length == 0;
    this.nameEditConfirmButton.setAttribute("disabled", shouldDisabledConfirm.toString());
  }
  //event handler for textbox's TextBoxTextEditStopEvent. Handle cancel/confirming text input
  onTextBoxEditingStopped(event) {
    if (UI.canDisplayKeyboard()) {
      if (event.detail.confirmed) {
        this.onNameConfirmed();
      }
      this.onCloseButton();
    } else {
      if (event.detail.confirmed) {
        if (event.detail.inputEventName != "accept") {
          this.onNameConfirmed();
        }
      } else {
        this.onCloseButton();
      }
    }
  }
  //handle input
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || event.detail.name == "camera-pan") {
      return;
    }
    if (event.detail.name == "swap-plot-selection") {
      this.onNameConfirmed();
    } else if (event.isCancelInput()) {
      this.onCloseButton();
    }
    event.stopPropagation();
    event.preventDefault();
  }
  //handle clicking the close button/hitting the gamepad cancel button
  onCloseButton() {
    this.Root.setAttribute("active", "true");
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "active":
        const shouldHide = newValue == "true";
        this.Root.classList.toggle("hidden", shouldHide || UI.canDisplayKeyboard());
        if (shouldHide) {
          this.nameEditTextBox.setAttribute("value", "");
          this.nameEditTextBox.setAttribute("enabled", "false");
        } else {
          if (UI.canDisplayKeyboard()) {
            this.nameEditTextBox.setAttribute("activated", "true");
          } else {
            this.nameEditTextBox.setAttribute("enabled", "true");
          }
        }
        this.Root.dispatchEvent(new UnitRenameHideStatusToggledEvent(shouldHide));
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
}
Controls.define("unit-rename", {
  createInstance: UnitRename,
  description: "Unit Renaming Panel",
  innerHTML: [content],
  styles: [styles],
  attributes: [
    {
      name: "active",
      description: "If the rename panel is showing or not"
    }
  ]
});

export { UnitRenameConfirmEvent, UnitRenameConfirmEventName, UnitRenameHideStatusToggledEvent, UnitRenameHideStatusToggledEventName };
//# sourceMappingURL=unit-rename.js.map
