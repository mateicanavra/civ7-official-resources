import { InputEngineEventName } from '../../input/input-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel, { AnchorType } from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-additional-content.html.js';
import styles from './mp-additional-content.scss.js';

var AdditionalContentType = /* @__PURE__ */ ((AdditionalContentType2) => {
  AdditionalContentType2[AdditionalContentType2["ADDONS"] = 0] = "ADDONS";
  AdditionalContentType2[AdditionalContentType2["DISABLEDCONTENT"] = 1] = "DISABLEDCONTENT";
  return AdditionalContentType2;
})(AdditionalContentType || {});
class PanelMPAdditionalContent extends Panel {
  panelOptions = null;
  titleText;
  descriptionText;
  closeButton;
  slotDiv;
  frame;
  closeButtonListener = this.onClose.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  onInitialize() {
    this.titleText = MustGetElement(".font-title", this.Root);
    this.frame = MustGetElement("fxs-modal-frame", this.Root);
    this.descriptionText = MustGetElement(".additional-content-list", this.Root);
    this.closeButton = MustGetElement(".mp-additional-content__close-button", this.Root);
    this.slotDiv = MustGetElement(".additional-content-list", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-additional-content");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.closeButton.addEventListener("action-activate", this.closeButtonListener);
    const closeButton = document.createElement("fxs-close-button");
    closeButton.classList.add("top-1", "right-1");
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    waitForLayout(() => this.frame.appendChild(closeButton));
  }
  setPanelOptions(options) {
    if (this.panelOptions) {
      return;
    }
    this.panelOptions = options;
    this.titleText.setAttribute("title", this.panelOptions?.title);
    if (this.panelOptions?.type == 0 /* ADDONS */) {
      (this.panelOptions?.content).forEach((mod) => {
        this.appendToModalContent(
          Locale.stylize(`[STYLE:text-accent-3][STYLE:font-body-sm]${mod.name}[/S][/S][N]`)
        );
      });
    }
    if (this.panelOptions?.type == 1 /* DISABLEDCONTENT */) {
      (this.panelOptions?.content).forEach((mod) => {
        this.appendToModalContent(
          Locale.stylize(`[STYLE:text-accent-3][STYLE:font-body-sm]${mod.name}[/S][/S][N]`)
        );
      });
    }
  }
  appendToModalContent(content2) {
    const el = document.createElement("div");
    el.innerHTML = content2;
    this.descriptionText.appendChild(el);
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    FocusManager.get().setFocus(this.slotDiv);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onClose() {
    this.close();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
}
Controls.define("screen-mp-additional-content", {
  createInstance: PanelMPAdditionalContent,
  description: "Multiplayer additional content screen.",
  classNames: ["screen-mp-additional-content"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});

export { AdditionalContentType };
//# sourceMappingURL=mp-additional-content.js.map
