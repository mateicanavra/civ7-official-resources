import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { F as FxsNavHelp } from '../../../core/ui/components/fxs-nav-help.chunk.js';
import { ContextManagerEvents } from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { L as LowerCalloutEvent } from './tutorial-events.chunk.js';
import { TutorialCalloutType } from './tutorial-item.js';
import TutorialManager, { TutorialCalloutMinimizeEventName } from './tutorial-manager.js';
import { g as getTutorialPrompts } from './tutorial-support.chunk.js';
import WatchOutManager from '../watch-out/watch-out-manager.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import '../../../core/ui/utilities/utilities-plotcoord.chunk.js';
import '../notification-train/model-notification-train.js';

const content = "<div class=\"tutorial-callout-content absolute flex flex-col w-auto top-0 pointer-events-auto\">\r\n\t<div class=\"tutorial-callout-bg\"></div>\r\n\t<div class=\"tutorial-callout-body-advisor-topper absolute inset-0\">\r\n\t\t<div class=\"relative w-full h-full\">\r\n\t\t\t<fxs-hslot class=\"absolute\">\r\n\t\t\t\t<div class=\"tutorial-callout-body-advisor-wrapper w-1\\\\/2 self-center\"></div>\r\n\t\t\t\t<div class=\"tutorial-callout-body-advisor-wrapper w-1\\\\/2 self-center -scale-x-100\"></div>\r\n\t\t\t</fxs-hslot>\r\n\t\t\t<fxs-hslot class=\"absolute self-center tutorial-callout-body-advisor-image-container\">\r\n\t\t\t\t<div class=\"relative\">\r\n\t\t\t\t\t<div class=\"tutorial-callout-body-advisor-bg bg-cover bg-no-repeat size-38\"></div>\r\n\t\t\t\t\t<div class=\"tutorial-callout-body-advisor-image absolute inset-0\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-hslot>\r\n\t\t</div>\r\n\t</div>\r\n\t<fxs-minus-plus class=\"absolute top-1 right-1\"></fxs-minus-plus>\r\n\t<fxs-nav-help\r\n\t\tclass=\"callout-minimize__navhelp absolute top-2 right-0\"\r\n\t\talt-action-key=\"inline-shell-action-3\"\r\n\t\taction-key=\"inline-center-plot-cursor\"\r\n\t>\r\n\t</fxs-nav-help>\r\n\t<div class=\"tutorial-callout-title-container\">\r\n\t\t<fxs-hslot class=\"items-center\">\r\n\t\t\t<div class=\"tutorial-callout-title-decoration mr-2 -scale-x-100 w-4 h-4 bg-contain bg-no-repeat\"></div>\r\n\t\t\t<div\r\n\t\t\t\trole=\"paragraph\"\r\n\t\t\t\tclass=\"tutorial-callout-title fxs-header font-title-xl pointer-events-auto\"\r\n\t\t\t></div>\r\n\t\t\t<div class=\"tutorial-callout-title-decoration ml-2 w-4 h-4 bg-contain bg-no-repeat\"></div>\r\n\t\t</fxs-hslot>\r\n\t</div>\r\n\t<div class=\"tutorial-callout-body\">\r\n\t\t<fxs-hslot class=\"tutorial-callout-body-advisor-container items-center\">\r\n\t\t\t<fxs-inner-frame class=\"tutorial-callout-advisor-text relative ml-6 mr-4\">\r\n\t\t\t\t<div class=\"advisor-text__content relative text-base text-primary-1 mt-3 mb-3 ml-6 mr-4\"></div>\r\n\t\t\t</fxs-inner-frame>\r\n\t\t</fxs-hslot>\r\n\t\t<div\r\n\t\t\trole=\"paragraph\"\r\n\t\t\tclass=\"tutorial-callout-body-text text-base mt-3 mb-3 ml-6 mr-4 pointer-events-auto\"\r\n\t\t></div>\r\n\t</div>\r\n\t<div class=\"tutorial-callout-buttons relative flex flex-row justify-center -ml-3 -mr-3 flex-wrap\">\r\n\t\t<fxs-button class=\"tutorial-callout-option1 p-6\"></fxs-button>\r\n\t\t<fxs-button class=\"tutorial-callout-option2 p-6\"></fxs-button>\r\n\t\t<fxs-button class=\"tutorial-callout-option3 p-6\"></fxs-button>\r\n\t</div>\r\n\t<!-- TODO: Reactivate after User Test April 2024 -->\r\n\t<!-- <div class=\"tutorial-callout-check-container trigger-nav-help\">\r\n\t\t<fxs-checkbox class=\"checkbox--right-close\" caption=\"LOC_TUTORIAL_DEACTIVATE_ALL\"></fxs-checkbox>\r\n\t</div> -->\r\n\t<div class=\"tutorial-callout-overlay\"></div>\r\n\t<div class=\"tutorial-callout-minimized flex-col items-center\">\r\n\t\t<div class=\"tutorial-callout-min__advisor-image\"></div>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"tutorial-callout-min__button mb-2\"\r\n\t\t\tnav-help-alt-action-key=\"inline-shell-action-3\"\r\n\t\t\taction-key=\"inline-center-plot-cursor\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/tutorial/tutorial-callout.css";

var CalloutContentType = /* @__PURE__ */ ((CalloutContentType2) => {
  CalloutContentType2[CalloutContentType2["TITLE"] = 0] = "TITLE";
  CalloutContentType2[CalloutContentType2["BASE"] = 1] = "BASE";
  CalloutContentType2[CalloutContentType2["ADVISOR"] = 2] = "ADVISOR";
  return CalloutContentType2;
})(CalloutContentType || {});
class TutorialCallout extends Component {
  itemID = "";
  isClosed = true;
  // Is this in a closed stated?
  option1;
  option2;
  option3;
  selectedOptionNum = -1;
  focusSet = false;
  // Has a focus lock been requested?
  nextID;
  isMinimized = false;
  calloutMinimizeButton;
  calloutMinimizeNavHelp;
  calloutMaximizeButton;
  calloutContainer = null;
  engineInputListener = this.onEngineInput.bind(this);
  contextChangedInputListener = this.onContextChanged.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceType.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  get isMinimizeDisabled() {
    return this.Root.getAttribute("minimize-disabled") == "true";
  }
  get hasOptions() {
    return this.option1 != void 0 || this.option2 != void 0 || this.option3 != void 0;
  }
  constructor(root) {
    super(root);
  }
  onAttach() {
    super.onAttach();
    if (!this.isClosed) {
      console.error(
        "tutorial-callout: onAttach(): Attempting to load tutorial callout content when it's not marked as 'closed'. id: ",
        this.itemID
      );
      return;
    }
    this.itemID = this.Root.getAttribute("itemID") ?? "";
    if (this.itemID == "") {
      console.warn(
        "tutorial-callout: onAttach(): Loading a tutorial callout but no associated item ID was passed in."
      );
    }
    const calloutDataSerialized = this.Root.getAttribute("value");
    if (!calloutDataSerialized) {
      console.error(
        "tutorial-callout: onAttach(): Could not raise tutorial callout because no data was passed in. id: ",
        this.itemID
      );
      return;
    }
    const data = JSON.parse(calloutDataSerialized);
    if (data == null) {
      console.error(
        "tutorial-callout: onAttach(): Could not raise tutorial callout because data provided wasn't a valid definition. id: ",
        this.itemID
      );
      console.log("tutorial-callout: onAttach(): Callout data: ", calloutDataSerialized);
      return;
    }
    if (data.type == TutorialCalloutType.NOTIFICATION) {
      this.Root.classList.add("type--notification");
    }
    this.calloutMinimizeButton = MustGetElement("fxs-minus-plus", this.Root);
    this.calloutMinimizeNavHelp = MustGetElement(".callout-minimize__navhelp", this.Root);
    this.calloutMinimizeButton.addEventListener("action-activate", this.onCalloutMinimizeToggle);
    this.calloutMinimizeButton.dataset.type = "minus";
    this.calloutMinimizeButton.setAttribute("data-audio-group-ref", "tutorial-popup");
    this.calloutMinimizeButton.setAttribute("data-audio-activate-ref", "none");
    this.calloutMinimizeButton.setAttribute("data-audio-press-ref", "none");
    this.calloutMaximizeButton = MustGetElement(".tutorial-callout-min__button", this.Root);
    this.calloutMaximizeButton.addEventListener("action-activate", this.onCalloutMinimizeToggle);
    this.calloutMaximizeButton.setAttribute("data-audio-group-ref", "tutorial-popup");
    this.calloutMaximizeButton.setAttribute("data-audio-activate-ref", "none");
    this.calloutContainer = MustGetElement(".tutorial-callout-content", this.Root);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    window.addEventListener(TutorialCalloutMinimizeEventName, this.onCalloutMinimizeToggle);
    engine.on(ContextManagerEvents.OnChanged, this.contextChangedInputListener);
    engine.on("InputContextChanged", this.inputContextChangedListener, this);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    if (data.title) {
      this.Root.classList.toggle("show-title", data.title != "");
      const title = Locale.compose(data.title);
      this.setHTMLInDivClass(title, "tutorial-callout-title", 0 /* TITLE */);
    }
    this.setAdvisor(data.advisorType);
    this.Root.classList.toggle("handheld", UI.getViewExperience() == UIViewExperience.Handheld);
    this.selectedOptionNum = -1;
    this.focusSet = false;
    this.nextID = void 0;
    this.option1 = data.option1;
    this.option2 = data.option2;
    this.option3 = data.option3;
    this.setupOption(1, this.option1);
    this.setupOption(2, this.option2);
    this.setupOption(3, this.option3);
    this.isClosed = false;
    this.render();
    this.Root.setAttribute("data-audio-group-ref", "tutorial-popup");
    this.playSound("data-audio-popup-open", "tutorial-popup");
    engine.trigger("TutorialCallout");
  }
  onDetach() {
    window.removeEventListener(TutorialCalloutMinimizeEventName, this.onCalloutMinimizeToggle);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    engine.off(ContextManagerEvents.OnChanged, this.contextChangedInputListener);
    engine.off("InputContextChanged", this.inputContextChangedListener, this);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.playSound("data-audio-close-selected");
    engine.trigger("TutorialCallout");
    super.onDetach();
  }
  getContentData(type = 1 /* BASE */) {
    const item = TutorialManager.getCalloutItem(this.itemID) || WatchOutManager.currentWatchOutPopupData?.item;
    if (!item) {
      console.error(
        "tutorial-callout: getContentData(): Attempting to get tutorial item but not found, id: ",
        this.itemID
      );
      return;
    }
    const calloutDefine = item.callout;
    if (!calloutDefine) {
      console.error(
        "tutorial-callout: getContentData(): Tutorial: Callout data missing; cannot raise. id: ",
        this.itemID
      );
      return;
    }
    try {
      switch (type) {
        case 1 /* BASE */: {
          let content2 = "";
          if (calloutDefine.body) {
            content2 = calloutDefine.body.text;
          }
          if (calloutDefine.body?.getLocParams) {
            TutorialManager.calloutBodyParams = calloutDefine.body.getLocParams(item);
          }
          let prompts = [];
          if (calloutDefine.actionPrompts) {
            prompts = getTutorialPrompts(calloutDefine.actionPrompts);
          }
          return Locale.stylize(content2, ...TutorialManager.calloutBodyParams, ...prompts);
        }
        case 2 /* ADVISOR */: {
          let content2 = "";
          if (calloutDefine.advisor?.text) {
            content2 = calloutDefine.advisor.text;
          }
          if (TutorialManager.calloutAdvisorParams.length <= 0 && calloutDefine.advisor?.getLocParams) {
            TutorialManager.calloutAdvisorParams = calloutDefine.advisor.getLocParams(item).filter(Boolean);
          }
          return Locale.stylize(content2, ...TutorialManager.calloutAdvisorParams);
        }
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error("Tutorial Callout: " + this.itemID + ": " + errorMessage);
    }
    return "";
  }
  /// Helper
  setHTMLInDivClass(innerHTML, cssClassName, contentType) {
    const element = this.Root.querySelector(`.${cssClassName}`);
    if (!element) {
      console.warn("tutorial-callout: setStringInDivClass(): Missing element with '." + cssClassName + "'");
      return;
    }
    if (innerHTML.length == 0) {
      let elementHidden = element;
      if (contentType == 2 /* ADVISOR */) {
        const parent = element.parentElement;
        if (parent) {
          elementHidden = parent;
        }
      }
      elementHidden.classList.add("empty");
    }
    element.innerHTML = Locale.stylize(innerHTML);
  }
  setAdvisor(advisorType) {
    const advisorTopContainer = MustGetElement(".tutorial-callout-body-advisor-topper", this.Root);
    const advisorTitleContainer = MustGetElement(".tutorial-callout-title-container", this.Root);
    const advisorImageElement = MustGetElement(".tutorial-callout-body-advisor-image", this.Root);
    let url = "";
    if (advisorType) {
      switch (advisorType) {
        case "advisor-military":
          url = UI.getIcon("ADVISOR_MILITARY", "CIRCLE_MASK");
          break;
        case "advisor-culture":
          url = UI.getIcon("ADVISOR_CULTURE", "CIRCLE_MASK");
          break;
        case "advisor-science":
          url = UI.getIcon("ADVISOR_SCIENCE", "CIRCLE_MASK");
          break;
        case "advisor-economic":
          url = UI.getIcon("ADVISOR_ECONOMIC", "CIRCLE_MASK");
          break;
      }
    }
    if (url != "") {
      const cssUrl = `url('fs://game/${url}')`;
      advisorImageElement.style.backgroundImage = cssUrl;
      this.Root.classList.remove("empty-advisor");
      advisorTopContainer.classList.remove("hidden");
      advisorTitleContainer.classList.add("mt-8");
      const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
      if (isMobile) {
        this.calloutContainer?.classList.add("tutorial-callout_has-advisor");
      }
    } else {
      this.Root.classList.add("empty-advisor");
      advisorImageElement.classList.add("no-advisor");
      advisorTopContainer.classList.add("hidden");
      advisorTitleContainer.classList.remove("mt-8");
    }
  }
  /// Helper
  setupOption(optionNum, calloutOptionDef) {
    const cssClassName = `tutorial-callout-option${optionNum}`;
    const element = this.Root.querySelector(`.${cssClassName}`);
    if (!element) {
      console.warn("tutorial-callout: setupOption(): Missing element with '." + cssClassName + "'");
      return;
    }
    element.classList.add("relative", "leading-none", "break-words", "max-h-14", "max-w-80", "mx-3", "mb-2");
    if (calloutOptionDef) {
      const caption = Locale.compose(calloutOptionDef.text);
      if (caption == void 0 || caption == null) {
        console.error("tutorial-callout: setupOption(): Missing caption");
        return;
      }
      if (FxsNavHelp.getGamepadActionName(calloutOptionDef.actionKey.toLowerCase()) == "shell-action-1") {
        console.error(
          "tutorial-callout: setupOption(): invalid actionKey inline-shell-action-1 (used for the deactivate tutorial checkbox)"
        );
        return;
      }
      element.setAttribute("caption", caption);
      element.setAttribute("data-audio-activate-ref", "none");
      element.setAttribute("action-key", calloutOptionDef.actionKey);
      element.addEventListener("action-activate", () => {
        if (calloutOptionDef.closes && !this.isClosed) {
          this.selectedOptionNum = optionNum;
          this.nextID = calloutOptionDef.nextID;
          this.close();
        }
      });
      if (calloutOptionDef.actionKey.length > 0) {
        this.Root.classList.add("trigger-nav-help");
        if (!this.focusSet) {
          this.focusSet = FocusManager.lockFocus(
            this.Root,
            "tutorial-callout",
            "Tutorial callout contains buttons."
          );
          ViewManager.getHarness()?.classList.remove("trigger-nav-help");
        }
      }
    } else {
      element.style.display = "none";
    }
  }
  onContextChanged() {
    if (this.focusSet) {
      ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    }
  }
  tryHandleInput(optionNum, calloutOptionDef, inputEvent) {
    if (calloutOptionDef) {
      const gamepadActionName = FxsNavHelp.getGamepadActionName(
        calloutOptionDef.actionKey.toLowerCase()
      );
      if (gamepadActionName != void 0 && inputEvent.detail.name == gamepadActionName) {
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        if (calloutOptionDef.closes && !this.isClosed) {
          this.selectedOptionNum = optionNum;
          this.nextID = calloutOptionDef.nextID;
          this.close();
        }
        return true;
      }
    }
    return false;
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const eventName = inputEvent.detail.name;
    if (eventName.startsWith("camera")) {
      return;
    } else if (eventName == "sys-menu") {
      this.Root.classList.remove("trigger-nav-help");
      if (this.focusSet) {
        this.focusSet = !FocusManager.unlockFocus(this.Root, "tutorial-callout");
        return;
      }
    } else if (eventName == "shell-action-1" || eventName == "shell-action-3" || eventName == "center-plot-cursor") {
      return;
    }
    if (!this.hasOptions) {
      if (ActionHandler.isGamepadActive) {
        console.error(
          `tutorial-callout: Attempt to handle input ${inputEvent.detail.name} but callout doesn't take input.`
        );
      }
      return;
    }
    if (this.isMinimized) {
      return;
    }
    if (this.tryHandleInput(1, this.option1, inputEvent)) {
      return;
    }
    if (this.tryHandleInput(2, this.option2, inputEvent)) {
      return;
    }
    if (this.tryHandleInput(3, this.option3, inputEvent)) {
      return;
    }
    inputEvent.stopPropagation();
    inputEvent.preventDefault();
  }
  onCalloutMinimizeToggle = () => {
    const wasMinimized = this.isMinimized;
    if (this.isMinimizeDisabled) {
      this.isMinimized = false;
    } else {
      this.isMinimized = !this.isMinimized;
    }
    if (this.isMinimized) {
      if (this.focusSet) {
        this.focusSet = !FocusManager.unlockFocus(this.Root, "tutorial-callout");
        ViewManager.getHarness()?.classList.add("trigger-nav-help");
      }
      if (!wasMinimized) {
        Audio.playSound("data-audio-minus-press", "tutorial-popup");
      }
    } else {
      if (this.hasOptions) {
        if (!this.focusSet) {
          this.focusSet = FocusManager.lockFocus(
            this.Root,
            "tutorial-callout",
            "Tutorial callout contains buttons."
          );
          ViewManager.getHarness()?.classList.remove("trigger-nav-help");
        }
      }
      if (wasMinimized) {
        this.playSound("data-audio-popup-open", "tutorial-popup");
      }
    }
    this.updateCalloutMinimizedState();
  };
  updateCalloutMinimizedState() {
    this.Root.classList.toggle("minimized", this.isMinimized);
    let maximizeCaption = "LOC_TUTORIAL_REOPEN_KBM";
    switch (ActionHandler.deviceType) {
      case InputDeviceType.Controller:
        maximizeCaption = "LOC_TUTORIAL_REOPEN_GAMEPAD";
        break;
      case InputDeviceType.Touch:
      case InputDeviceType.XR:
        maximizeCaption = "LOC_TUTORIAL_REOPEN_TOUCH";
        break;
      default:
        break;
    }
    this.calloutMaximizeButton.setAttribute("caption", maximizeCaption);
    this.calloutMinimizeButton.classList.toggle("hidden", ActionHandler.isGamepadActive || this.isMinimizeDisabled);
    this.calloutMinimizeNavHelp.classList.toggle("invisible", this.isMinimizeDisabled);
    this.Root.classList.toggle("trigger-nav-help", ActionHandler.isGamepadActive && !this.isMinimizeDisabled);
  }
  /**
   * An input device changed
   * @param _event Information about the device.
   */
  onActiveDeviceType(_event) {
    this.render();
  }
  /**
   * Engine has changed the input context.
   * @param _contextData Contains old (existing) context and new one.
   */
  onInputContextChanged(_contextData) {
    this.render();
  }
  render() {
    this.updateCalloutMinimizedState();
    this.setHTMLInDivClass(
      Locale.compose(this.getContentData() || ""),
      "tutorial-callout-body-text",
      1 /* BASE */
    );
    this.setHTMLInDivClass(
      Locale.compose(this.getContentData(2 /* ADVISOR */) || ""),
      "advisor-text__content",
      2 /* ADVISOR */
    );
  }
  close() {
    if (this.isClosed) {
      console.error(
        "tutorial-callout: close(): Tutorial callout being closed when already marked closed. id: ",
        this.itemID
      );
    }
    const nextID = this.nextID;
    window.dispatchEvent(
      new LowerCalloutEvent({
        itemID: this.itemID,
        optionNum: this.selectedOptionNum,
        nextID,
        closed: true
      })
    );
    this.isClosed = true;
    this.focusSet = false;
    this.option1 = void 0;
    this.option2 = void 0;
    this.option3 = void 0;
  }
}
Controls.define("tutorial-callout", {
  createInstance: TutorialCallout,
  description: "Box to point out an event that occurred.",
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});
//# sourceMappingURL=tutorial-callout.js.map
