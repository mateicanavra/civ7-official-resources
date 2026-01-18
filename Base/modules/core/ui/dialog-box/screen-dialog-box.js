import '../components/fxs-button-group.chunk.js';
import { A as Audio } from '../audio-base/audio-support.chunk.js';
import { F as FxsNavHelp } from '../components/fxs-nav-help.chunk.js';
import { a as DialogBoxManager, D as DialogBoxAction } from './manager-dialog-box.chunk.js';
import FocusManager from '../input/focus-manager.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';
import { P as Panel, A as AnchorType } from '../panel-support.chunk.js';
import { MustGetElement } from '../utilities/utilities-dom.chunk.js';
import '../input/action-handler.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../views/view-manager.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../utilities/utilities-image.chunk.js';
import '../utilities/utilities-component-id.chunk.js';
import '../utilities/utilities-layout.chunk.js';
import '../context-manager/display-queue-manager.js';

const screenDialogBoxStyles = "fs://game/core/ui/dialog-box/screen-dialog-box.css";

const panelDiplomacyDeclareWarStyles = "fs://game/base-standard/ui/diplomacy-declare-war/panel-diplomacy-declare-war.css";

class ScreenDialogBox extends Panel {
  dialogId = 0;
  canClose = true;
  header = document.createElement("fxs-header");
  extensions = [];
  extensionsContainer = null;
  buttonContainer = null;
  closeButtonListener = () => {
    this.requestClose();
  };
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  valueChangeListener = this.onValueChange.bind(this);
  textboxKeyupListener = this.onTextboxKeyup.bind(this);
  textBoxTextEditStopListener = this.onTextboxEditStop.bind(this);
  closing = false;
  options = [];
  customOptions = [];
  useChooserItem = false;
  customDialog = null;
  isBodyCentered = false;
  buttonAudioGroup = "audio-base";
  buttonAudioPress = "data-audio-primary-button-press";
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToTop;
  }
  onAttach() {
    super.onAttach();
    const customDialog = this.Root.getAttribute("custom");
    const frame = document.createElement("fxs-modal-frame");
    if (customDialog != "true") {
      this.header.setAttribute("filigree-style", "h2");
      this.header.setAttribute("title", this.Root.getAttribute("title") ?? "");
      this.header.classList.add("font-title-xl");
      frame.appendChild(this.header);
    }
    frame.classList.add("screen-dialog-box__dialog-wrapper");
    const componentName = this.Root.getAttribute("name");
    const frag = document.createDocumentFragment();
    if (componentName != null) {
      if (componentName == "declare-war") {
        frame.classList.add("declare-war");
      }
    }
    if (customDialog != "true") {
      frame.appendChild(this.header);
    }
    const bodyAttribute = this.Root.getAttribute("body") ?? "";
    if (customDialog != "true") {
      if (bodyAttribute != "") {
        const body = document.createElement("div");
        body.role = "paragraph";
        body.classList.add("font-body", "text-base", "text-center", "py-3\\.5", "pointer-events-auto");
        body.innerHTML = Locale.stylize(bodyAttribute);
        frag.appendChild(body);
      }
      if ((this.Root.getAttribute("displayHourGlass") ?? "") == "true") {
        const hourGlass = document.createElement("fxs-flipbook");
        hourGlass.classList.add("self-center", "my-4");
        const atlas = [
          {
            src: "fs://game/hourglasses01.png",
            spriteWidth: 128,
            spriteHeight: 128,
            size: 512
          },
          {
            src: "fs://game/hourglasses02.png",
            spriteWidth: 128,
            spriteHeight: 128,
            size: 512
          },
          {
            src: "fs://game/hourglasses03.png",
            spriteWidth: 128,
            spriteHeight: 128,
            size: 1024,
            nFrames: 13
          }
        ];
        const flipbookDefinition = {
          fps: 30,
          preload: true,
          atlas
        };
        hourGlass.setAttribute("data-flipbook-definition", JSON.stringify(flipbookDefinition));
        frag.appendChild(hourGlass);
      }
    }
    if (customDialog != "true") {
      this.extensionsContainer = document.createElement("fxs-vslot");
      const extensionValue = this.Root.getAttribute("extensions");
      if (extensionValue && extensionValue != "undefined") {
        const extensions = JSON.parse(extensionValue);
        if (extensions.steppers) {
          for (const stepperData of extensions.steppers) {
            const stepper = document.createElement("fxs-stepper");
            stepper.classList.add("dialog-stepper");
            stepper.setAttribute("value", stepperData.stepperValue ?? "0");
            stepper.setAttribute("min-value", stepperData.stepperMinValue ?? "0");
            stepper.setAttribute("max-value", stepperData.stepperMaxValue ?? "1");
            stepper.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            this.extensionsContainer?.appendChild(stepper);
            this.extensions.push({ id: stepperData.id, element: stepper });
          }
        }
        if (extensions.dropdowns) {
          for (const dropdownData of extensions.dropdowns) {
            const container = document.createElement("div");
            container.classList.add("flow-row", "p-4", "items-center");
            container.classList.toggle("justify-center", true);
            const label = document.createElement("div");
            label.classList.add(
              "font-body",
              "text-left",
              "text-lg",
              "leading-9",
              "max-w-174",
              "-mx-px",
              "-my-0\\.5",
              "mr-6"
            );
            label.innerHTML = Locale.stylize(dropdownData.label ?? "");
            const dropdown = document.createElement("fxs-dropdown");
            dropdown.setAttribute("id", dropdownData.id);
            dropdown.setAttribute("dropdown-items", dropdownData.dropdownItems ?? "[]");
            dropdown.setAttribute("selected-item-index", dropdownData.selectedIndex ?? "0");
            dropdown.setAttribute("disabled", dropdownData.disabled ?? "");
            dropdown.setAttribute("action-key", dropdownData.actionKey ?? "");
            dropdown.setAttribute("selection-caption", dropdownData.selectionCaption ?? "");
            dropdown.setAttribute("no-selection-caption", dropdownData.noSelectionCaption ?? "");
            dropdown.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            container.appendChild(label);
            container.appendChild(dropdown);
            this.extensionsContainer?.appendChild(container);
            this.extensions.push({ id: dropdownData.id, element: dropdown });
          }
        }
        if (extensions.textboxes) {
          for (const textboxData of extensions.textboxes) {
            const container = document.createElement("div");
            container.classList.add("flow-row", "p-4", "items-center");
            container.classList.toggle("justify-center", true);
            const label = document.createElement("div");
            label.classList.add(
              "font-body",
              "text-left",
              "text-lg",
              "leading-9",
              "max-w-174",
              "-mx-px",
              "-my-0\\.5",
              "mr-6"
            );
            label.innerHTML = Locale.stylize(textboxData.label ?? "");
            const textbox = document.createElement("fxs-textbox");
            textbox.className = textboxData.classname ?? "";
            textbox.classList.add("fxs-textbox", "max-w-96");
            textbox.setAttribute("id", textboxData.id);
            textbox.setAttribute("placeholder", textboxData.placeholder ?? "");
            textbox.setAttribute("show-keyboard-on-activate", textboxData.showKeyboardOnActivate ?? "true");
            textbox.setAttribute("enabled", textboxData.enabled ?? "true");
            textbox.setAttribute("max-length", textboxData.maxLength ?? "");
            textbox.setAttribute("value", textboxData.value ?? "");
            textbox.setAttribute("case-mode", textboxData.caseMode ?? "");
            textbox.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            textbox.addEventListener("keyup", this.textboxKeyupListener);
            if (textboxData.editStopClose) {
              textbox.addEventListener("text-edit-stop", this.textBoxTextEditStopListener);
            }
            container.appendChild(label);
            container.appendChild(textbox);
            this.extensionsContainer?.appendChild(container);
            this.extensions.push({ id: textboxData.id, element: textbox });
          }
        }
      }
      this.buttonContainer = document.createElement("fxs-button-group");
      this.buttonContainer.classList.add("px-8");
      this.canClose = (this.Root.getAttribute("canClose") ?? "") == "true";
      if (this.canClose) {
        const closeButton = document.createElement("fxs-close-button");
        closeButton.classList.add("top-1", "right-1");
        closeButton.addEventListener("action-activate", this.closeButtonListener);
        waitForLayout(() => frame.appendChild(closeButton));
      }
      this.extensionsContainer.appendChild(this.buttonContainer);
      frag.appendChild(this.extensionsContainer);
    }
    frame.appendChild(frag);
    this.Root.appendChild(frame);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    UI.sendAudioEvent("popup-open-generic");
  }
  onDetach() {
    UI.sendAudioEvent("popup-close-generic");
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    DialogBoxManager.closeDialogBox(this.dialogId);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    if (this.extensions.length != 0 && this.extensionsContainer) {
      FocusManager.setFocus(this.extensionsContainer);
    } else {
      FocusManager.setFocus(this.Root);
    }
  }
  setDialogId(dialogId) {
    this.dialogId = dialogId;
  }
  setOptions(definition, options, customOptions) {
    this.customDialog = this.Root.getAttribute("custom");
    if (this.customDialog == "true") {
      this.options = options;
      this.customOptions = customOptions;
      this.useChooserItem = false;
      this.isBodyCentered = this.Root.getAttribute("isBodyCentered") == "true";
      const customDialogWrapper = MustGetElement(".screen-dialog-box__dialog-wrapper", this.Root);
      if (this.customDialog == "true" && this.customOptions.length > 0) {
        const body = document.createElement("fxs-hslot");
        body.classList.add("pb-4");
        for (let i = 0; i < this.customOptions.length; i++) {
          const customOption = this.customOptions[i];
          const dialogText = customOption.layoutBodyWrapper;
          const dialogImage = customOption.layoutImageWrapper;
          if (customOption.useChooserItem) {
            this.useChooserItem = customOption.useChooserItem;
          }
          if (dialogText || dialogImage) {
            if (dialogImage) {
              body.appendChild(dialogImage);
            }
            if (dialogText) {
              body.appendChild(dialogText);
            }
            customDialogWrapper.appendChild(body);
          }
        }
      }
      this.extensionsContainer = document.createElement("fxs-vslot");
      const extensionValue = this.Root.getAttribute("extensions");
      if (extensionValue && extensionValue != "undefined") {
        const extensions = JSON.parse(extensionValue);
        if (extensions.steppers) {
          for (const stepperData of extensions.steppers) {
            const stepper = document.createElement("fxs-stepper");
            stepper.classList.add("dialog-stepper");
            stepper.setAttribute("value", stepperData.stepperValue ?? "0");
            stepper.setAttribute("min-value", stepperData.stepperMinValue ?? "0");
            stepper.setAttribute("max-value", stepperData.stepperMaxValue ?? "1");
            stepper.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            this.extensionsContainer?.appendChild(stepper);
            this.extensions.push({ id: stepperData.id, element: stepper });
          }
        }
        if (extensions.dropdowns) {
          for (const dropdownData of extensions.dropdowns) {
            const container = document.createElement("div");
            container.classList.add("flow-row", "p-4", "items-center");
            container.classList.toggle("justify-center", this.isBodyCentered);
            const label = document.createElement("div");
            label.classList.add(
              "font-body",
              "text-left",
              "text-lg",
              "leading-9",
              "max-w-174",
              "-mx-px",
              "-my-0\\.5",
              "mr-6"
            );
            label.innerHTML = Locale.stylize(dropdownData.label ?? "");
            const dropdown = document.createElement("fxs-dropdown");
            dropdown.setAttribute("id", dropdownData.id);
            dropdown.setAttribute("dropdown-items", dropdownData.dropdownItems ?? "[]");
            dropdown.setAttribute("selected-item-index", dropdownData.selectedIndex ?? "0");
            dropdown.setAttribute("disabled", dropdownData.disabled ?? "");
            dropdown.setAttribute("action-key", dropdownData.actionKey ?? "");
            dropdown.setAttribute("selection-caption", dropdownData.selectionCaption ?? "");
            dropdown.setAttribute("no-selection-caption", dropdownData.noSelectionCaption ?? "");
            dropdown.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            container.appendChild(label);
            container.appendChild(dropdown);
            this.extensionsContainer?.appendChild(container);
            this.extensions.push({ id: dropdownData.id, element: dropdown });
          }
        }
        if (extensions.textboxes) {
          for (const textboxData of extensions.textboxes) {
            const container = document.createElement("div");
            container.classList.add("flow-row", "p-4", "items-center");
            container.classList.toggle("justify-center", this.isBodyCentered);
            const label = document.createElement("div");
            label.classList.add(
              "font-body",
              "text-left",
              "text-lg",
              "leading-9",
              "max-w-174",
              "-mx-px",
              "-my-0\\.5",
              "mr-6"
            );
            label.innerHTML = Locale.stylize(textboxData.label ?? "");
            const textbox = document.createElement("fxs-textbox");
            textbox.className = textboxData.classname ?? "";
            textbox.classList.add("fxs-textbox", "max-w-96");
            textbox.setAttribute("id", textboxData.id);
            textbox.setAttribute("placeholder", textboxData.placeholder ?? "");
            textbox.setAttribute("show-keyboard-on-activate", textboxData.showKeyboardOnActivate ?? "true");
            textbox.setAttribute("enabled", textboxData.enabled ?? "true");
            textbox.setAttribute("max-length", textboxData.maxLength ?? "");
            textbox.setAttribute("value", textboxData.value ?? "");
            textbox.addEventListener(ComponentValueChangeEventName, this.valueChangeListener);
            textbox.addEventListener("keyup", this.textboxKeyupListener);
            if (textboxData.editStopClose) {
              textbox.addEventListener("text-edit-stop", this.textBoxTextEditStopListener);
            }
            container.appendChild(label);
            container.appendChild(textbox);
            this.extensionsContainer?.appendChild(container);
            this.extensions.push({ id: textboxData.id, element: textbox });
          }
        }
      }
      if (this.useChooserItem != true) {
        this.buttonContainer = document.createElement("fxs-button-group");
      } else {
        this.buttonContainer = document.createElement("div");
      }
      this.extensionsContainer.classList.add("pl-40");
      this.buttonContainer.classList.add("self-center");
      this.canClose = (this.Root.getAttribute("canClose") ?? "") == "true";
      if (this.canClose) {
        const declareWarFrame = MustGetElement(".screen-dialog-box__dialog-wrapper", this.Root);
        const closeButton = document.createElement("fxs-close-button");
        closeButton.addEventListener("action-activate", this.closeButtonListener);
        closeButton.classList.add("top-1", "right-1");
        declareWarFrame.appendChild(closeButton);
      }
      this.extensionsContainer.appendChild(this.buttonContainer);
      if (this.extensionsContainer) {
        customDialogWrapper.appendChild(this.extensionsContainer);
      }
      if (this.useChooserItem == false) {
        for (let i = 0; i < this.options.length; i++) {
          const option = this.options[i];
          const optionButton = document.createElement("fxs-button");
          optionButton.setAttribute("type", "big");
          optionButton.setAttribute("caption", option.label);
          optionButton.setAttribute("caption-nol10n", option.label);
          for (let j = 0; j < this.options[i].actions.length; j++) {
            const actionKey = `inline-${option.actions[j]}`;
            if (FxsNavHelp.getGamepadActionName(actionKey)) {
              optionButton.setAttribute("action-key", actionKey);
              break;
            }
          }
          if (option.disabled) {
            optionButton.setAttribute("disabled", "true");
          }
          if (option.tooltip) {
            optionButton.setAttribute("data-tooltip-content", option.tooltip);
          }
          waitForLayout(() => optionButton.removeAttribute("tabindex"));
          optionButton.addEventListener("action-activate", () => {
            this.onOption(option);
          });
          this.buttonContainer?.appendChild(optionButton);
        }
      } else {
        const chooserItemsWrapper = document.createElement("fxs-hslot");
        chooserItemsWrapper.classList.add("w-full", "justify-center");
        customDialogWrapper.appendChild(chooserItemsWrapper);
        for (let i = 0; i < this.customOptions.length; i++) {
          const customOption = this.customOptions[i];
          const chooserItemElement = customOption.chooserInfo;
          if (chooserItemElement) {
            const newElement = chooserItemElement;
            chooserItemsWrapper.appendChild(newElement);
          }
          if (customOption.cancelChooser == true) {
            const cancelButton = document.createElement("chooser-item");
            cancelButton.classList.add(
              "panel-diplomacy-declare-war__button-cancel",
              "chooser-item_unlocked",
              "w-1\\/2",
              "min-h-16",
              "h-full",
              "flow-row",
              "py-2",
              "items-center"
            );
            cancelButton.setAttribute("disabled", "false");
            cancelButton.setAttribute("tabindex", "-1");
            cancelButton.addEventListener("action-activate", this.closeButtonListener);
            const radialBG = document.createElement("div");
            radialBG.classList.add(
              "panel-diplomacy-declare-war__radial-bg",
              "absolute",
              "bg-cover",
              "size-16",
              "group-focus\\:opacity-0",
              "group-hover\\:opacity-0",
              "group-active\\:opacity-0",
              "opacity-1"
            );
            const radialBGHover = document.createElement("div");
            radialBGHover.classList.add(
              "panel-diplomacy-declare-war__radial-bg-hover",
              "absolute",
              "opacity-0",
              "bg-cover",
              "size-16",
              "group-focus\\:opacity-100",
              "group-hover\\:opacity-100",
              "group-active\\:opacity-100"
            );
            cancelButton.appendChild(radialBG);
            cancelButton.appendChild(radialBGHover);
            const cancelIconWrapper = document.createElement("div");
            cancelIconWrapper.classList.add(
              "absolute",
              "size-16",
              "bg-cover",
              "panel-diplomacy-declare-war__war-icon-wrapper"
            );
            const cancelIcon = document.createElement("img");
            cancelIcon.classList.add("flex", "mt-2", "ml-2", "size-12");
            cancelIcon.setAttribute("src", UI.getIconURL("DIPLOMACY_CANCEL_DEAL_ICON"));
            cancelIconWrapper.appendChild(cancelIcon);
            cancelButton.appendChild(cancelIconWrapper);
            const cancelDescription = document.createElement("div");
            cancelDescription.classList.add(
              "absolute",
              "ml-18",
              "self-center",
              "font-title",
              "uppercase",
              "font-normal",
              "tracking-100"
            );
            cancelDescription.setAttribute("data-l10n-id", "LOC_DIPLOMACY_DEAL_CANCEL");
            cancelButton.appendChild(cancelDescription);
            chooserItemsWrapper.appendChild(cancelButton);
          }
        }
        for (let i = 0; i < this.options.length; i++) {
          const option = this.options[i];
          const theChooserButton = MustGetElement(
            ".panel-diplomacy-declare-war__button-declare-war",
            this.Root
          );
          theChooserButton.addEventListener("action-activate", () => {
            this.onOption(option);
          });
        }
        const firstSlot = MustGetElement(".panel-diplomacy-declare-war__button-declare-war", this.Root);
        FocusManager.setFocus(firstSlot);
      }
    } else {
      this.options = options;
      const verticalLayout = definition.layout == "vertical";
      if (verticalLayout) {
        this.buttonContainer = document.createElement("div");
        this.buttonContainer.classList.add("flex flex-col mx-2");
        this.extensionsContainer?.appendChild(this.buttonContainer);
      } else if (this.options.length > 2) {
        this.buttonContainer?.classList.add("multi-button-container");
      }
      for (let i = 0; i < this.options.length; i++) {
        const option = this.options[i];
        const optionButton = document.createElement("fxs-button");
        optionButton.setAttribute("type", "big");
        optionButton.setAttribute("caption", option.label);
        optionButton.setAttribute("caption-nol10n", option.label);
        if (verticalLayout) {
          optionButton.classList.add("mb-2");
        } else if (i < this.options.length - 1) {
          optionButton.classList.add("mr-4");
        }
        for (let j = 0; j < this.options[i].actions.length; j++) {
          const actionKey = `inline-${option.actions[j]}`;
          if (FxsNavHelp.getGamepadActionName(actionKey)) {
            optionButton.setAttribute("action-key", actionKey);
            break;
          }
        }
        if (option.disabled) {
          optionButton.setAttribute("disabled", "true");
        }
        if (option.tooltip) {
          optionButton.setAttribute("data-tooltip-content", option.tooltip);
        }
        waitForLayout(() => optionButton.removeAttribute("tabindex"));
        optionButton.addEventListener("action-activate", () => {
          this.onOption(option);
        });
        this.buttonContainer?.appendChild(optionButton);
      }
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.START && inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    for (let i = 0; i < this.options.length; i++) {
      const button = this.buttonContainer?.querySelector(`fxs-button[caption-nol10n="${this.options[i].label}"]`);
      const isDisabled = button?.getAttribute("disabled") == "true";
      if (!isDisabled) {
        for (let j = 0; j < this.options[i].actions.length; j++) {
          if (this.options[i].actions[j] == inputEvent.detail.name) {
            if (inputEvent.detail.status == InputActionStatuses.FINISH) {
              this.onOption(this.options[i], inputEvent);
              return;
            } else {
              Audio.playSound(this.buttonAudioPress, this.buttonAudioGroup);
            }
          }
        }
      }
    }
    if (inputEvent.isCancelInput()) {
      if (this.canClose) {
        this.requestClose(inputEvent);
      }
    }
  }
  onNavigateInput(navigationEvent) {
    navigationEvent.preventDefault();
    navigationEvent.stopImmediatePropagation();
  }
  requestClose(inputEvent) {
    if (this.canClose) {
      inputEvent?.stopPropagation();
      inputEvent?.preventDefault();
      this.close();
    } else {
      console.error("screen-dialog-box, requestClose(): Incoherence: canClose is false!");
    }
  }
  onValueChange({ detail: { value }, target }) {
    this.options.forEach(({ valueChangeCallback, label }) => {
      if (valueChangeCallback) {
        valueChangeCallback(
          target.id,
          value,
          this.buttonContainer?.querySelector(`fxs-button[caption='${label}']`) || void 0
        );
      }
    });
  }
  onOption(option, inputEvent) {
    if (this.closing) {
      return;
    }
    inputEvent?.stopPropagation();
    inputEvent?.preventDefault();
    this.extensions?.forEach((extension) => {
      const extensionValue = extension.element.getAttribute("value") || extension.element.getAttribute("selected-item-index");
      if (extensionValue && option.valueCallback) {
        option.valueCallback(extension.id, extensionValue);
      }
    });
    if (option.callback) {
      option.callback(DialogBoxAction.Confirm);
    }
    this.close();
  }
  close() {
    if (!this.closing) {
      this.closing = true;
      super.close();
    }
  }
  onTextboxKeyup({ code }) {
    if (code == "Enter") {
      for (const option of this.options) {
        if (option.actions.includes("keyboard-enter")) {
          this.onOption(option);
          return;
        }
      }
    }
  }
  onTextboxEditStop({ detail }) {
    if (!detail.confirmed) this.close();
  }
  //TODO: do we need to update data and refresh visuals on attributes changed?
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "title":
        this.header?.setAttribute("title", newValue);
        break;
    }
  }
}
Controls.define("screen-dialog-box", {
  createInstance: ScreenDialogBox,
  description: "Generic dialog box pop up.",
  classNames: ["screen-dialog-box", "fullscreen"],
  styles: [screenDialogBoxStyles, panelDiplomacyDeclareWarStyles],
  images: ["fs://game/HourGlass.png"],
  attributes: [
    {
      name: "title"
    },
    {
      name: "subtitle"
    },
    {
      name: "canClose"
    }
  ],
  tabIndex: -1
});

export { ScreenDialogBox };
//# sourceMappingURL=screen-dialog-box.js.map
