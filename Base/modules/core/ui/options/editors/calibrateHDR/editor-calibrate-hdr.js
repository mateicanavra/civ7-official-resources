import ContextManager from '../../../context-manager/context-manager.js';
import { DialogBoxManager } from '../../../dialog-box/manager-dialog-box.js';
import NavTray from '../../../navigation-tray/model-navigation-tray.js';
import { Options } from '../../model-options.js';
import Panel from '../../../panel-support.js';
import { FocusManager } from '../../../../ui-next/services/focus-manager.js';
import content from './editor-calibrate-hdr.html.js';
import styles from './editor-calibrate-hdr.scss.js';
import { DialogBoxAction } from '../../../dialog-box/model-dialog-box.js';

const EditorCalibrateHDROpenedEventName = "editor-calibrate-hdr-opened";
class EditorCalibrateHDROpenedEvent extends CustomEvent {
  constructor() {
    super(EditorCalibrateHDROpenedEventName, { bubbles: false, cancelable: true });
  }
}
const EditorCalibrateHDRClosedEventName = "editor-calibrate-hdr-closed";
class EditorCalibrateHDRClosedEvent extends CustomEvent {
  constructor() {
    super(EditorCalibrateHDRClosedEventName, { bubbles: false, cancelable: true });
  }
}
class EditorCalibrateHDR extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  confirmButtonListener = this.close.bind(this);
  hdrSliderChangedListener = this.onHdrOptionChanged.bind(this);
  contrastBar = document.createElement("fxs-slider");
  brightness3dBar = document.createElement("fxs-slider");
  uiBrightnessBar = document.createElement("fxs-slider");
  CalibrateHDRSceneModels = null;
  isClosing = false;
  onInitialize() {
  }
  onAttach() {
    super.onAttach();
    const hdrOptionPage = this.Root.querySelector(".editor-calibrate-hdr_main-content");
    if (!hdrOptionPage) {
      console.error("editor-calibrate-hrd: Error: no main-content element found");
      return;
    }
    window.dispatchEvent(new EditorCalibrateHDROpenedEvent());
    ContextManager.pop("screen-options");
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add(
      "w-full",
      "flex",
      "flex-col",
      "absolute",
      "bottom-5",
      "items-center",
      "self-center"
    );
    const centerBars = document.createElement("fxs-inner-frame");
    centerBars.classList.add(
      "sliders-container",
      "flow-column",
      "justify-center",
      "items-center",
      "relative",
      "p-4",
      "mb-6"
    );
    const settingContrast = document.createElement("div");
    settingContrast.classList.add("flex", "editor-calibrate-hdr__row");
    const contrastTitle = document.createElement("div");
    contrastTitle.setAttribute("data-l10n-id", "LOC_OPTIONS_HDR_CONSTRAST");
    contrastTitle.classList.add("uppercase", "font-title", "text-lg", "w-56");
    this.contrastBar = document.createElement("fxs-slider");
    this.contrastBar.id = "contrast-slider";
    this.contrastBar.classList.add("w-194", "ml-10", "editor-calibrate-hdr__slider");
    const contrastValue = Options.graphicsOptions.hdrContrast;
    this.contrastBar.setAttribute("option", "contrast");
    this.contrastBar.setAttribute("min", "0.1");
    this.contrastBar.setAttribute("max", "5");
    this.contrastBar.setAttribute("value", contrastValue.toString());
    this.contrastBar.addEventListener(ComponentValueChangeEventName, this.hdrSliderChangedListener);
    settingContrast.appendChild(contrastTitle);
    settingContrast.appendChild(this.contrastBar);
    const setting3dBrightness = document.createElement("div");
    setting3dBrightness.classList.add("flex", "editor-calibrate-hdr__row");
    const brightness3dTitle = document.createElement("div");
    brightness3dTitle.setAttribute("data-l10n-id", "LOC_OPTIONS_HDR_3D_BRIGHTNESS");
    brightness3dTitle.classList.add("uppercase", "font-title", "text-lg", "mr-10", "w-56");
    this.brightness3dBar = document.createElement("fxs-slider");
    this.brightness3dBar.id = "brightness-3d-slider";
    this.brightness3dBar.classList.add("w-194", "editor-calibrate-hdr__slider");
    const brightness3DValue = GraphicsOptions.linearToPq(Options.graphicsOptions.hdrWhitePoint3D);
    this.brightness3dBar.setAttribute("option", "3dBrightness");
    this.brightness3dBar.setAttribute("min", "0.25");
    this.brightness3dBar.setAttribute("max", "1");
    this.brightness3dBar.setAttribute("value", brightness3DValue.toString());
    this.brightness3dBar.addEventListener(ComponentValueChangeEventName, this.hdrSliderChangedListener);
    setting3dBrightness.appendChild(brightness3dTitle);
    setting3dBrightness.appendChild(this.brightness3dBar);
    const settingUiBrightness = document.createElement("div");
    settingUiBrightness.classList.add("flex", "editor-calibrate-hdr__row");
    const uiBrightnessTitle = document.createElement("div");
    uiBrightnessTitle.setAttribute("data-l10n-id", "LOC_OPTIONS_HDR_UI_BRIGHTNESS");
    uiBrightnessTitle.classList.add("uppercase", "font-title", "text-lg", "mr-10", "w-56");
    this.uiBrightnessBar.id = "brightness-ui-slider";
    this.uiBrightnessBar.classList.add("w-194", "editor-calibrate-hdr__slider");
    const brightnessUIValue = GraphicsOptions.linearToPq(Options.graphicsOptions.hdrWhitePointUI);
    this.uiBrightnessBar.setAttribute("option", "UiBrightness");
    this.uiBrightnessBar.setAttribute("min", "0.25");
    this.uiBrightnessBar.setAttribute("max", "1");
    this.uiBrightnessBar.setAttribute("value", brightnessUIValue.toString());
    this.uiBrightnessBar.addEventListener(ComponentValueChangeEventName, this.hdrSliderChangedListener);
    settingUiBrightness.appendChild(uiBrightnessTitle);
    settingUiBrightness.appendChild(this.uiBrightnessBar);
    centerBars.appendChild(settingContrast);
    centerBars.appendChild(setting3dBrightness);
    centerBars.appendChild(settingUiBrightness);
    const buttonContainer = document.createElement("fxs-hslot");
    buttonContainer.classList.add("buttons-container", "w-full", "shrink", "justify-center");
    buttonContainer.setAttribute("data-bind-class-toggle", "hidden:{{g_NavTray.isTrayRequired}}");
    const saveChangesButton = document.createElement("fxs-button");
    saveChangesButton.setAttribute("caption", "LOC_OPTIONS_HDR_CONFIRM");
    saveChangesButton.addEventListener("action-activate", this.confirmButtonListener);
    const resetChangesButton = document.createElement("fxs-button");
    resetChangesButton.classList.add("mx-10");
    resetChangesButton.setAttribute("caption", "LOC_OPTIONS_RESET_TO_DEFAULTS");
    resetChangesButton.addEventListener("action-activate", this.onReset);
    const discardChangesButton = document.createElement("fxs-button");
    discardChangesButton.setAttribute("caption", "LOC_GENERIC_BACK");
    discardChangesButton.addEventListener("action-activate", this.onDiscard);
    buttonContainer.appendChild(discardChangesButton);
    buttonContainer.appendChild(resetChangesButton);
    buttonContainer.appendChild(saveChangesButton);
    bottomContainer.appendChild(centerBars);
    bottomContainer.appendChild(buttonContainer);
    hdrOptionPage.appendChild(bottomContainer);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.isClosing = false;
    this.build3DScene();
  }
  onReset() {
    const defaultContrast = 0.799;
    const defaultBrightness3D = 330;
    const defaultBrightnessUI = 330;
    const contrastBar = document.getElementById("contrast-slider");
    const brightness3dBar = document.getElementById("brightness-3d-slider");
    const brightnessUIBar = document.getElementById("brightness-ui-slider");
    contrastBar?.setAttribute("value", defaultContrast.toString());
    brightness3dBar?.setAttribute("value", GraphicsOptions.linearToPq(defaultBrightness3D).toString());
    brightnessUIBar?.setAttribute("value", GraphicsOptions.linearToPq(defaultBrightnessUI).toString());
    Options.graphicsOptions.hdrContrast = defaultContrast;
    Options.graphicsOptions.hdrWhitePoint3D = defaultBrightness3D;
    Options.graphicsOptions.hdrWhitePointUI = defaultBrightnessUI;
    Options.commitOptions("graphics");
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    NavTray.clear();
    super.onDetach();
  }
  onReceiveFocus() {
    FocusManager.get().setFocus(this.contrastBar);
    NavTray.clear();
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateShellAction1("LOC_OPTIONS_CONFIRM_CHANGES");
  }
  onLoseFocus() {
    NavTray.clear();
  }
  close() {
    this.isClosing = true;
    this.clear3DScene();
    window.dispatchEvent(new EditorCalibrateHDRClosedEvent());
    super.close();
  }
  onDiscard = () => {
    const cancelCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Options.restore("graphics");
        this.close();
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_OPTIONS_REVERT_DESCRIPTION",
      title: "LOC_OPTIONS_CANCEL_CHANGES",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: cancelCallback
    });
  };
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.onDiscard();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    switch (inputEvent.detail.name) {
      case "shell-action-1":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onHdrOptionChanged(sliderEvent) {
    if (!(sliderEvent.target instanceof HTMLElement)) {
      return;
    }
    const option = sliderEvent.target.getAttribute("option");
    if (!option) {
      return;
    }
    switch (option) {
      case "contrast":
        Options.graphicsOptions.hdrContrast = sliderEvent.detail.value;
        break;
      case "3dBrightness":
        Options.graphicsOptions.hdrWhitePoint3D = GraphicsOptions.pqToLinear(
          Math.max(0.1, sliderEvent.detail.value)
        );
        break;
      case "UiBrightness":
        Options.graphicsOptions.hdrWhitePointUI = GraphicsOptions.pqToLinear(
          Math.max(0.1, sliderEvent.detail.value)
        );
        break;
      default:
        break;
    }
    Options.commitOptions("graphics");
  }
  build3DScene() {
    waitForLayout(() => {
      if (!this.isClosing) {
        Camera.pushCamera({ x: 285, y: 80, z: 255 }, { x: 0, y: -95, z: -20 });
        this.CalibrateHDRSceneModels = WorldUI.createModelGroup("HDRCalibrationScene");
        this.CalibrateHDRSceneModels.addModelAtPos(
          "Calibration_Scene",
          { x: 0, y: -95, z: 0 },
          { initialState: "IDLE", angle: -225, scale: 2.5 }
        );
      }
    });
  }
  clear3DScene() {
    if (this.CalibrateHDRSceneModels) {
      this.CalibrateHDRSceneModels.destroy();
      this.CalibrateHDRSceneModels = null;
      Camera.popCamera();
    }
  }
}
const EditorCalibrateHDRTagName = "editor-calibrate-hdr";
Controls.define(EditorCalibrateHDRTagName, {
  createInstance: EditorCalibrateHDR,
  description: "Displays and sets the HDR options",
  classNames: ["editor-calibrate-hdr", "flex-auto", "w-full", "h-full", "absolute"],
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});

export { EditorCalibrateHDRClosedEventName, EditorCalibrateHDROpenedEventName };
//# sourceMappingURL=editor-calibrate-hdr.js.map
