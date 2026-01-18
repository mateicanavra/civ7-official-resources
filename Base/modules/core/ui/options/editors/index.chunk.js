import { TtsManager } from '../../accessibility/tts-manager.js';
import { a as ActionActivateEventName } from '../../components/fxs-activatable.chunk.js';
import { F as FxsChooserItem } from '../../components/fxs-chooser-item.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager, D as DialogBoxAction } from '../../dialog-box/manager-dialog-box.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../input/action-handler.js';
import FocusManager from '../../input/focus-manager.js';
import { F as Focus } from '../../input/focus-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement, MustGetElements } from '../../utilities/utilities-dom.chunk.js';
import { Icon } from '../../utilities/utilities-image.chunk.js';
import { L as Layout } from '../../utilities/utilities-layout.chunk.js';
import { c as chooserItemStyles } from '../../../../base-standard/ui/chooser-item/chooser-item.chunk.js';
import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import { F as FxsButton } from '../../components/fxs-button.chunk.js';
import { D as Databind } from '../../utilities/utilities-core-databinding.chunk.js';
import { b as InputEngineEventName } from '../../input/input-support.chunk.js';

var OptionType = /* @__PURE__ */ ((OptionType2) => {
  OptionType2[OptionType2["Editor"] = 0] = "Editor";
  OptionType2[OptionType2["Checkbox"] = 1] = "Checkbox";
  OptionType2[OptionType2["Dropdown"] = 2] = "Dropdown";
  OptionType2[OptionType2["Slider"] = 3] = "Slider";
  OptionType2[OptionType2["Stepper"] = 4] = "Stepper";
  OptionType2[OptionType2["Switch"] = 5] = "Switch";
  return OptionType2;
})(OptionType || {});
class OptionsModel {
  /** Backing data and callback for all the options across all the sections.  */
  Options = /* @__PURE__ */ new Map();
  /** Pending options, can be modified and applied externally */
  graphicsOptions = GraphicsOptions.getCurrentOptions();
  supportedOptions = GraphicsOptions.getSupportedOptions();
  // Consider removing these counts and tracking separately in each Option instance
  /** Reference count of options that have changed and aren't back to their original value */
  changeRefCount = 0;
  /** Reference count of options that need a reload and aren't back to their original value */
  needReloadRefCount = 0;
  /** Reference count of options that need a reload and aren't back to their original value */
  needRestartRefCount = 0;
  /** Track if changing options means explicit input refresh needs to occur.  (Different meanings on the C++ side based on platform.) */
  inputRefreshRequired = false;
  optionsInitCallbacks = [];
  optionsReInitCallbacks = [];
  optionsChangedCallbacks = [];
  constructor() {
    engine.whenReady.then(() => {
      const playerProfileChangedListener = () => {
      };
      engine.on("PlayerProfileChanged", playerProfileChangedListener);
      engine.on("GraphicsOptionsChanged", () => {
        this.graphicsOptions = GraphicsOptions.getCurrentOptions();
        this.supportedOptions = GraphicsOptions.getSupportedOptions();
        this.reInitOptions();
      });
    });
  }
  get data() {
    return this.Options;
  }
  get supportsGraphicOptions() {
    return this.supportedOptions.profiles.length != 0;
  }
  get showAdvancedGraphicsOptions() {
    return this.supportedOptions.canShowAdvancedGraphicsOptions;
  }
  get canUseMetalFx() {
    return this.supportedOptions.canUseMetalFx;
  }
  get showCustomGraphicsProfile() {
    return this.supportedOptions.canShowCustomGraphicsProfile;
  }
  incRefCount() {
    return this.changeRefCount++;
  }
  init() {
    this.optionsInitCallbacks.forEach((callback) => callback());
    this.optionsInitCallbacks = [];
    this.updateHiddenOptions();
  }
  /**
   * Adds a callback to be executed when the options are initialized.
   *
   * an init callback is a function that adds options to the model (i.e., calls addOption)
   */
  addInitCallback(callback) {
    if (this.optionsReInitCallbacks.length && !this.optionsInitCallbacks.length) {
      throw new Error("Options already initialized, cannot add init callback");
    }
    this.optionsInitCallbacks.push(callback);
    this.optionsReInitCallbacks.push(callback);
  }
  /**
   * Adds a callback to be executed when the options are changed by the engine.
   */
  addChangedCallback(callback) {
    this.optionsChangedCallbacks.push(callback);
  }
  /**
   * Removes all options changed callbacks.
   */
  clearChangedCallbacks() {
    this.optionsChangedCallbacks = [];
  }
  /**
   * Set up to make the options screen rebuild from the engine data next time it opens.
   */
  reInitOptions() {
    this.Options.clear();
    this.optionsInitCallbacks = this.optionsReInitCallbacks;
    this.optionsChangedCallbacks.forEach((callback) => callback());
    this.optionsChangedCallbacks = [];
  }
  /**
   * Add a new option to the options screen.
   */
  addOption(info) {
    switch (info.type) {
      case 4 /* Stepper */:
        info.currentValue ??= 0;
        info.min ??= 0;
        info.max ??= 100;
        break;
      case 2 /* Dropdown */:
        break;
      case 1 /* Checkbox */:
        info.currentValue ??= false;
        break;
      case 3 /* Slider */:
        info.min ??= 0;
        info.max ??= 1;
        info.steps ??= 0;
        break;
      case 0 /* Editor */:
        break;
    }
    this.Options.set(info.id, info);
    info.initListener?.(info);
  }
  /**
   * Create a checkpoint for sound and configuration options
   */
  saveCheckpoints() {
    Configuration.getUser().saveCheckpoint();
    Sound.volumeSetCheckpoint();
  }
  /**
   * Save all categories to disk
   */
  commitOptions(category) {
    switch (category) {
      case "sound":
        Sound.volumeWriteSettings();
        break;
      case "graphics":
        GraphicsOptions.applyOptions(this.graphicsOptions);
        break;
      case "application":
        UI.commitApplicationOptions();
        break;
      case "network":
        UI.commitNetworkOptions();
        break;
      case "configuration":
        Configuration.getUser().saveCheckpoint();
        break;
      default:
        Sound.volumeWriteSettings();
        GraphicsOptions.applyOptions(this.graphicsOptions);
        UI.commitApplicationOptions();
        UI.commitNetworkOptions();
        Configuration.getUser().saveCheckpoint();
    }
    if (UI.isInGame()) {
      if (this.isUIReloadRequired()) {
        UI.refreshPlayerColors();
        UI.reloadUI();
      }
    }
    this.changeRefCount = 0;
    this.needReloadRefCount = 0;
    this.needRestartRefCount = 0;
  }
  /**
   * default restores most settings to their engine-defined default values.
   */
  resetOptionsToDefault() {
    UI.defaultApplicationOptions();
    UI.defaultAudioOptions();
    UI.defaultUserOptions();
    UI.defaultTutorialOptions();
    if (!UI.isInGame()) {
      this.graphicsOptions = GraphicsOptions.getDefaultOptions();
      GraphicsOptions.applyOptions(this.graphicsOptions);
    }
    Sound.volumeSetMaster(Sound.volumeGetMaster());
    Sound.volumeSetMusic(Sound.volumeGetMusic());
    Sound.volumeSetSFX(Sound.volumeGetSFX());
    Sound.volumeSetUI(Sound.volumeGetUI());
    Sound.volumeSetCinematics(Sound.volumeGetCinematics());
    Sound.volumeSetVoice(Sound.volumeGetVoice());
    Sound.volumeWriteSettings();
    UI.commitApplicationOptions();
    UI.commitNetworkOptions();
    if (UI.isInGame()) {
      if (this.isUIReloadRequired()) {
        UI.refreshPlayerColors();
        UI.reloadUI();
      }
    }
    this.changeRefCount = 0;
    this.needReloadRefCount = 0;
    this.needRestartRefCount = 0;
  }
  /**
   * restore resets all categories to their on disk values
   */
  restore(category) {
    switch (category) {
      case "sound":
        Sound.volumeRestoreCheckpoint();
        break;
      case "graphics":
        this.graphicsOptions = GraphicsOptions.getCurrentOptions();
        break;
      case "application":
        UI.revertApplicationOptions();
        break;
      case "network":
        UI.revertNetworkOptions();
        break;
      case "configuration":
        Configuration.getUser().restoreCheckpoint();
        break;
      default:
        Sound.volumeRestoreCheckpoint();
        UI.revertApplicationOptions();
        UI.revertNetworkOptions();
        Configuration.getUser().restoreCheckpoint();
        this.graphicsOptions = GraphicsOptions.getCurrentOptions();
        ContextManager.updateClickDuration();
    }
    this.changeRefCount = 0;
    this.needReloadRefCount = 0;
    this.needRestartRefCount = 0;
    for (const option of this.Options.values()) {
      option.restoreListener?.(option);
      option.initListener?.(option);
    }
  }
  hasChanges() {
    return this.changeRefCount > 0;
  }
  /**
   * Check if the changed options will cause the UI to reload.
   * @returns true if applying the options changes will reload the UI, false otherwise
   */
  isUIReloadRequired() {
    return this.needReloadRefCount > 0;
  }
  /**
   * Check if the pending options require a restart.
   * @returns true if applying the pending options will require a restart, false otherwise
   */
  isRestartRequired() {
    if (this.needRestartRefCount > 0) return true;
    const currentOptions = GraphicsOptions.getCurrentOptions();
    return this.graphicsOptions.deviceID != currentOptions.deviceID || this.graphicsOptions.hdr != currentOptions.hdr;
  }
  /**
   * Does some explicit refresh of the UI input system need to occur?
   */
  isInputRefreshRequired() {
    return this.inputRefreshRequired;
  }
  updateHiddenOptions() {
    const crossplayOption = this.Options.get("option-crossplay");
    if (crossplayOption != void 0) {
      crossplayOption.isHidden = !Network.hasCrossPlayPrivilege();
    }
  }
}
const Options = new OptionsModel();

var CategoryType = /* @__PURE__ */ ((CategoryType2) => {
  CategoryType2["Accessibility"] = "accessibility";
  CategoryType2["Audio"] = "audio";
  CategoryType2["Game"] = "game";
  CategoryType2["Graphics"] = "graphics";
  CategoryType2["Input"] = "input";
  CategoryType2["System"] = "system";
  CategoryType2["Interface"] = "interface";
  return CategoryType2;
})(CategoryType || {});
const createOptionComponentInternal = (optionInfo) => {
  switch (optionInfo.type) {
    case OptionType.Editor: {
      const btn = document.createElement("fxs-button");
      btn.setAttribute("data-audio-group-ref", "options");
      switch (optionInfo.id) {
        case "option-language-select":
          btn.setAttribute("data-audio-activate", "options-select-language");
          break;
        case "option-remap-kbm":
        case "option-remap-controller":
          btn.setAttribute("data-audio-activate", "options-configure-controller");
          break;
        default:
          break;
      }
      btn.setAttribute("optionID", optionInfo.id);
      if (optionInfo.caption) {
        btn.setAttribute("caption", Locale.compose(optionInfo.caption));
      }
      return btn;
    }
    case OptionType.Checkbox: {
      const cb = document.createElement("fxs-checkbox");
      cb.setAttribute("data-audio-group-ref", "options");
      cb.setAttribute("optionID", optionInfo.id);
      cb.setAttribute("selected", `${optionInfo.currentValue}`);
      return cb;
    }
    case OptionType.Dropdown: {
      const dd = document.createElement("fxs-dropdown");
      dd.classList.add("w-80");
      dd.setAttribute("optionID", optionInfo.id);
      dd.setAttribute("dropdown-items", JSON.stringify(optionInfo.dropdownItems));
      if (optionInfo.dropdownItems?.length) {
        dd.setAttribute("selected-item-index", optionInfo.selectedItemIndex?.toString() ?? "0");
      } else {
        console.error(
          `options-helpers: createOptionComponentInternal(): cannot select item index ${optionInfo.selectedItemIndex?.toString() ?? "0"} on empty dropdownItems array of option id: ${optionInfo.id}, label: ${optionInfo.label}`
        );
      }
      return dd;
    }
    case OptionType.Slider: {
      const slider = document.createElement("fxs-slider");
      slider.setAttribute("optionID", optionInfo.id);
      slider.setAttribute("value", `${optionInfo.currentValue ?? 0}`);
      slider.setAttribute("min", `${optionInfo.min ?? 0}`);
      slider.setAttribute("max", `${optionInfo.max ?? 1}`);
      slider.setAttribute("steps", `${optionInfo.steps ?? 0}`);
      return slider;
    }
    case OptionType.Stepper: {
      const st = document.createElement("fxs-stepper");
      st.setAttribute("optionID", optionInfo.id);
      st.setAttribute("value", `${optionInfo.currentValue ?? 0}`);
      st.setAttribute("min-value", `${optionInfo.min ?? 0}`);
      st.setAttribute("max-value", `${optionInfo.max ?? 0}`);
      return st;
    }
    case OptionType.Switch: {
      const sw = document.createElement("fxs-switch");
      sw.setAttribute("optionID", optionInfo.id);
      sw.setAttribute("selected", optionInfo.currentValue ? "true" : "false");
      return sw;
    }
    default:
      throw new Error(`Unhandled option type: ${optionInfo}`);
  }
};
const CreateOptionComponent = (option) => {
  const element = createOptionComponentInternal(option);
  element.setAttribute("data-audio-group-ref", "options");
  switch (option.type) {
    case OptionType.Checkbox:
      break;
    case OptionType.Editor:
      break;
    default:
      break;
  }
  element.setAttribute("disabled", option.isDisabled ? "true" : "false");
  if (!ActionHandler.isGamepadActive) {
    element.setAttribute("data-audio-focus-ref", "none");
  } else {
    element.setAttribute("data-audio-focus-ref", "data-audio-focus");
  }
  return element;
};
const CategoryData = {
  ["accessibility" /* Accessibility */]: {
    title: "LOC_OPTIONS_CATEGORY_ACCESSIBILITY",
    description: "LOC_OPTIONS_CATEGORY_ACCESSIBILITY_DESCRIPTION"
  },
  ["audio" /* Audio */]: {
    title: "LOC_OPTIONS_CATEGORY_AUDIO",
    description: "LOC_OPTIONS_CATEGORY_AUDIO_DESCRIPTION"
  },
  ["game" /* Game */]: {
    title: "LOC_OPTIONS_CATEGORY_GAME",
    description: "LOC_OPTIONS_CATEGORY_GAME_DESCRIPTION"
  },
  ["graphics" /* Graphics */]: {
    title: "LOC_OPTIONS_CATEGORY_GRAPHICS",
    description: "LOC_OPTIONS_CATEGORY_GRAPHICS_DESCRIPTION"
  },
  ["input" /* Input */]: {
    title: "LOC_OPTIONS_CATEGORY_INPUT",
    description: "LOC_OPTIONS_CATEGORY_INPUT_DESCRIPTION"
  },
  ["system" /* System */]: {
    title: "LOC_OPTIONS_CATEGORY_SYSTEM",
    description: "LOC_OPTIONS_CATEGORY_SYSTEM_DESCRIPTION"
  },
  ["interface" /* Interface */]: {
    title: "LOC_OPTIONS_CATEGORY_INTERFACE",
    description: "LOC_OPTIONS_CATEGORY_INTERFACE_DESCRIPTION"
  }
};
const GetGroupLocKey = (group) => {
  if (group == "extras") {
    return `LOC_MAIN_MENU_EXTRAS`;
  }
  const suffix = group.toUpperCase();
  return `LOC_OPTIONS_GROUP_${suffix}`;
};
const ShowReloadUIPrompt = (closeCallback, restoreCategory) => {
  const acceptCallback = () => {
    Options.commitOptions();
    closeCallback?.();
  };
  const acceptOption = {
    actions: ["accept"],
    label: "LOC_OPTIONS_RELOAD_WARN_CONTINUE",
    callback: acceptCallback
  };
  const cancelCallback = () => {
    Options.restore(restoreCategory);
    closeCallback?.();
  };
  const cancelOption = {
    actions: ["cancel", "keyboard-escape"],
    label: "LOC_OPTIONS_RELOAD_WARN_ABANDON_CHANGES",
    callback: cancelCallback
  };
  DialogBoxManager.createDialog_MultiOption({
    body: "LOC_OPTIONS_RELOAD_WARN_BODY",
    title: "LOC_OPTIONS_RELOAD_WARN_TITLE",
    options: [cancelOption, acceptOption],
    canClose: false
  });
};
const ShowRestartGamePrompt = (closeCallback) => {
  DialogBoxManager.createDialog_Confirm({
    title: "LOC_OPTIONS_RESTART_TITLE",
    body: "LOC_OPTIONS_RESTART_BODY",
    callback: () => {
      Options.commitOptions();
      closeCallback?.();
    }
  });
};

const editorControllerMappingStyles = "fs://game/core/ui/options/editors/editor-controller-mapping.css";

const GESTURE_KEYS = [
  InputKeys.PAD_A,
  InputKeys.PAD_B,
  InputKeys.PAD_X,
  InputKeys.PAD_Y,
  InputKeys.PAD_RSHOULDER,
  InputKeys.PAD_LSHOULDER,
  InputKeys.PAD_RTRIGGER,
  InputKeys.PAD_LTRIGGER,
  InputKeys.PAD_DPAD_UP,
  InputKeys.PAD_DPAD_DOWN,
  InputKeys.PAD_DPAD_LEFT,
  InputKeys.PAD_DPAD_RIGHT,
  InputKeys.PAD_START,
  InputKeys.PAD_BACK,
  InputKeys.PAD_LTHUMB_PRESS,
  InputKeys.PAD_RTHUMB_PRESS,
  InputKeys.PAD_LTHUMB_AXIS,
  InputKeys.PAD_RTHUMB_AXIS
];
const DEVICE_TYPE_TO_EXCLUDED_GESTURES = {
  [InputDeviceType.Controller]: [],
  [InputDeviceType.Hybrid]: [InputKeys.PAD_RTHUMB_PRESS],
  [InputDeviceType.Keyboard]: [],
  [InputDeviceType.Mouse]: [],
  [InputDeviceType.Touch]: [],
  [InputDeviceType.XR]: []
};
const HYBRID_ACTIONS = [
  "mousebutton-left",
  "mousebutton-right",
  "open-attributes",
  "open-civics",
  "open-greatworks",
  "open-rankings",
  "open-techs",
  "open-traditions",
  "open-civilopedia",
  "quick-load",
  "quick-save",
  "toggle-grid-layer",
  "toggle-yields-layer",
  "toggle-resources-layer",
  "cycle-next",
  "cycle-prev",
  "unit-move",
  "unit-ranged-attack",
  "unit-skip-turn",
  "unit-sleep",
  "unit-heal",
  "unit-fortify",
  "unit-alert",
  "unit-auto-explore",
  "next-action",
  "camera-pan",
  "scroll-pan",
  "notification",
  "sys-menu",
  "shell-action-5",
  "camera-zoom-in",
  "camera-zoom-out",
  "cancel"
];
if (TtsManager.isTtsSupported) {
  HYBRID_ACTIONS.push("text-to-speech-keyboard");
}
const INPUT_LAYOUT_TO_CLASS = {
  [InputDeviceLayout.Generic]: "hidden",
  [InputDeviceLayout.Nintendo]: "switch",
  [InputDeviceLayout.Ounce]: "ounce",
  [InputDeviceLayout.PlayStation4]: "playstation-4",
  [InputDeviceLayout.PlayStation5]: "playstation-5",
  [InputDeviceLayout.Stadia]: "hidden",
  [InputDeviceLayout.Steam]: "hidden",
  [InputDeviceLayout.Unknown]: "hidden",
  [InputDeviceLayout.XBox]: "xbox"
};
const DEVICE_TYPE_TO_ACTIONS = {
  [InputDeviceType.Controller]: void 0,
  [InputDeviceType.Hybrid]: HYBRID_ACTIONS,
  [InputDeviceType.Keyboard]: void 0,
  [InputDeviceType.Mouse]: void 0,
  [InputDeviceType.Touch]: void 0,
  [InputDeviceType.XR]: void 0
};
var StickActionName = /* @__PURE__ */ ((StickActionName2) => {
  StickActionName2["MOVE_CURSOR"] = "LOC_MOVE_CURSOR";
  StickActionName2["PLOT_MOVE"] = "LOC_PLOT_MOVE";
  StickActionName2["CAMERA_PAN"] = "LOC_CAMERA_PAN";
  StickActionName2["SCROLL_PAN"] = "LOC_SCROLL_PAN";
  return StickActionName2;
})(StickActionName || {});
var UnbindableActionName = /* @__PURE__ */ ((UnbindableActionName2) => {
  UnbindableActionName2["MOUSE_BUTTON_LEFT"] = "LOC_MOUSE_BUTTON_LEFT";
  UnbindableActionName2["MOUSE_BUTTON_RIGHT"] = "LOC_MOUSE_BUTTON_RIGHT";
  UnbindableActionName2["SCROLL_PAN"] = "LOC_SCROLL_PAN";
  UnbindableActionName2["CAMERA_PAN"] = "LOC_CAMERA_PAN";
  return UnbindableActionName2;
})(UnbindableActionName || {});
const STICK_ACTION_NAMES = [
  "LOC_MOVE_CURSOR" /* MOVE_CURSOR */,
  "LOC_PLOT_MOVE" /* PLOT_MOVE */,
  "LOC_CAMERA_PAN" /* CAMERA_PAN */,
  "LOC_SCROLL_PAN" /* SCROLL_PAN */
];
const UNBINDABLE_ACTION_NAMES = [
  "LOC_MOUSE_BUTTON_LEFT" /* MOUSE_BUTTON_LEFT */,
  "LOC_MOUSE_BUTTON_RIGHT" /* MOUSE_BUTTON_RIGHT */,
  "LOC_SCROLL_PAN" /* SCROLL_PAN */,
  "LOC_CAMERA_PAN" /* CAMERA_PAN */
];
const PS4_OPTIONS_TEXT = "OPTIONS";
const PS4_SHARE_TEXT = "SHARE";
const mapIconToText = {
  ps4_icon_start: PS4_OPTIONS_TEXT,
  ps4_icon_share: PS4_SHARE_TEXT
};
class EditorControllerMapping extends Panel {
  controlList = [];
  prevContext = InputContext.Shell;
  currentContext = InputContext.Shell;
  prevActionID = -2;
  // -1 -> invert joystick, 0 -> context, x -> action
  currentActionID = -2;
  // -1 -> invert joystick, 0 -> context, x -> action
  inputDeviceLayout = InputDeviceLayout.Unknown;
  inputControllerIcon = "";
  inputDeviceType = InputDeviceType.Keyboard;
  isDeviceTypeToActionsDefined = false;
  // in the case where we have defined actions, we are in the mode of context ALL
  isReadOnly = false;
  actionListDivs = null;
  actionVisDivs = null;
  expandButtons = null;
  controllerContainer;
  actionListContainer;
  controllerActionDiv;
  actionList;
  invertCheckbox;
  actionDescriptionDivs = null;
  controllerSection;
  backButton;
  restoreButton;
  saveButton;
  title;
  selectedAction = null;
  expandButtonActivateListener = this.onExpandButtonActivate.bind(this);
  chooserItemFocusListener = this.onChooserItemFocus.bind(this);
  chooserItemHoverListener = this.onChooserItemHover.bind(this);
  chooserItemBlurListener = this.onChooserItemBlur.bind(this);
  chooserItemActivateListener = this.onChooserItemActivate.bind(this);
  expandButtonFocusListener = this.onExpandButtonFocus.bind(this);
  expandButtonHoverListener = this.onExpandButtonHover.bind(this);
  backButtonActivateListener = this.onBackButtonActivate.bind(this);
  restoreButtonActivateListener = this.onRestoreDefaultActivate.bind(this);
  saveButtonActivateListener = this.onConfirmChangeActivate.bind(this);
  invertCheckboxFocusListener = this.onInvertCheckboxFocus.bind(this);
  invertCheckboxHoverListener = this.onInvertCheckboxHover.bind(this);
  invertCheckboxActivateListener = this.onInvertCheckboxActivate.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  resizeListener = this.onResize.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  onInitialize() {
    super.onInitialize();
    this.Root.innerHTML = this.getContent();
    this.actionList = MustGetElement(".editor-controller-mapping__scrollable-content", this.Root);
    this.actionListContainer = MustGetElement(".editor-controller-mapping__action-list-container", this.Root);
    this.controllerContainer = MustGetElement(".editor-controller-mapping__controller-content", this.Root);
    this.controllerActionDiv = MustGetElement(".editor-controller-mapping__controller", this.Root);
    this.controllerSection = MustGetElement(".editor-controller-mapping__controller-section", this.Root);
    this.backButton = MustGetElement("fxs-close-button", this.Root);
    this.restoreButton = MustGetElement(".editor-controller-mapping__option-restore", this.Root);
    this.saveButton = MustGetElement(".editor-controller-mapping__option-save", this.Root);
    this.title = MustGetElement(".editor-controller-mapping__title", this.Root);
    this.isReadOnly = UI.useReadOnlyInputMappingScreen();
    const subtitle = MustGetElement(".editor-controller-mapping__subtitle", this.Root);
    const optionsContainer = MustGetElement(".editor-controller-mapping__options", this.Root);
    if (this.isReadOnly) {
      optionsContainer.classList.add("hidden");
      subtitle.setAttribute("data-l10n-id", "LOC_OPTIONS_REMAP_VIEW_ONLY_DESCRIPTION");
    } else {
      optionsContainer.setAttribute("data-bind-class-toggle", "hidden:{{g_NavTray.isTrayRequired}}");
      subtitle.setAttribute("data-l10n-id", "LOC_UI_CONTROLLER_MAPPING_SUBTITLE");
    }
  }
  getContent() {
    return `
			<fxs-frame class="flex-1 flow-column w-full h-full">
				<fxs-header title="LOC_UI_CONTROLLER_MAPPING_TITLE" class="editor-controller-mapping__title font-title text-xl text-center uppercase tracking-100" filigree-style="none"></fxs-header>
				<div class="editor-controller-mapping__subtitle font-body text-base text-accent-3 text-center"></div>
				<div class="flex-auto flow-column items-center">
					<div class="editor-controller-mapping__content flow-row flex-auto px-5 pb-14">
						<fxs-vslot class="editor-controller-mapping__action-list-container flex-2" data-bind-class-toggle="mb-2:!{{g_NavTray.isTrayRequired}}">
							<fxs-scrollable class="editor-controller-mapping__scrollable" handle-gamepad-pan="true">
								<div class="editor-controller-mapping__scrollable-content"></div>
							</fxs-scrollable>
						</fxs-vslot>
						<div class="editor-controller-mapping__controller-section flex-3 h-full flow-row justify-center items-center pointer-events-none">
							<div class="editor-controller-mapping__controller-content flex-auto relative flow-row">
								<div class="editor-controller-mapping__controller flex-auto relative flow-row"></div>
							</div>
						</div>
					</div>
					<div class="flow-row justify-between editor-controller-mapping__options w-full pl-11">
						<fxs-button class="editor-controller-mapping__option-restore" caption="LOC_UI_CONTROLLER_MAPPING_RESTORE_DEFAULT"></fxs-button>
						<fxs-button class="mr-3 editor-controller-mapping__option-save" caption="LOC_UI_CONTROLLER_MAPPING_CONFIRM_CHANGE_TITLE"></fxs-button>
					</div>
				</div>
				<fxs-close-button class="top-4 right-4" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}"></fxs-close-button>
			</fxs-frame>
		`;
  }
  getControllerMapActionElement(node) {
    const elem = document.createElement("controller-map-action-element");
    elem.setAttribute("node", JSON.stringify(node));
    return elem;
  }
  getEditorControllerChooserItem(node, list, index) {
    const chooserItemContainer = document.createElement("div");
    chooserItemContainer.classList.toggle("pb-2", index < list.length - 1);
    chooserItemContainer.classList.add("pointer-events-auto");
    chooserItemContainer.setAttribute("index", `${index}`);
    const elem = document.createElement(
      this.isReadOnly ? "editor-controller-read-only-item" : "editor-controller-chooser-item"
    );
    elem.classList.add("min-h-8");
    elem.setAttribute("index", `${index}`);
    elem.setAttribute("tabindex", "-1");
    elem.setAttribute("select-highlight", "true");
    elem.setAttribute("data-bind-attributes", "{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}");
    elem.setAttribute("data-audio-group-ref", "controller-mapping");
    elem.setAttribute("node", JSON.stringify(node));
    chooserItemContainer.appendChild(elem);
    return chooserItemContainer;
  }
  generateControlList(actionNames) {
    this.isDeviceTypeToActionsDefined = !!actionNames;
    if (actionNames) {
      this.controlList = [
        {
          name: "",
          id: InputContext.ALL,
          actionsDictionary: {},
          actions: actionNames.map((name) => {
            const id = Input.getActionIdByName(name) ?? 0;
            return {
              name: Input.getActionName(id),
              gestureKey: Input.getGestureKey(id, 0, this.inputDeviceType, InputContext.ALL),
              id,
              sortIndex: Input.getActionSortIndex(id),
              description: Input.getActionDescription(id)
            };
          }).filter(({ name }) => !name.startsWith("text-to-speech") || TtsManager.isTtsSupported).sort(
            ({ id: aID }, { id: bID }) => parseInt(Input.getActionSortIndex(aID) || "0") - parseInt(Input.getActionSortIndex(bID) || "0")
          )
        }
      ];
    } else {
      this.controlList = [...Array(Input.getNumContexts()).keys()].map((i) => {
        const context = Input.getContext(i);
        return {
          name: Input.getContextName(i),
          id: context,
          actionsDictionary: {},
          actions: [...Array(Input.getActionCount()).keys()].map((j) => {
            const id = Input.getActionIdByIndex(j) ?? 0;
            return {
              name: Input.getActionName(id),
              gestureKey: Input.getGestureKey(id, 0, this.inputDeviceType, i),
              id,
              sortIndex: Input.getActionSortIndex(id),
              description: Input.getActionDescription(id)
            };
          }).filter(
            ({ id, name }) => Input.isActionAllowed(id, context) && Input.getActionDeviceType(id) == this.inputDeviceType && // TODO this should probably be moved to the backend and done via configuration instead of by name
            (!name.startsWith("text-to-speech") || TtsManager.isTtsSupported)
          ).sort(
            ({ id: aID }, { id: bID }) => parseInt(Input.getActionSortIndex(aID) || "0") - parseInt(Input.getActionSortIndex(bID) || "0")
          )
        };
      });
    }
    this.controlList.forEach((control) => {
      control.actions.forEach(({ id, gestureKey, name, description }) => {
        control.actionsDictionary[`${id}`] = { name, gestureKey, description };
      });
      control.actionsDictionary["0"] = { name: "", gestureKey: 0, description: control.name };
      control.actionsDictionary["-1"] = { name: "", gestureKey: 0, description: control.name };
    });
  }
  onAttach() {
    super.onAttach();
    window.addEventListener("resize", this.resizeListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    engine.on("InputActionBinded", this.onInputActionBinded, this);
    this.backButton.addEventListener("action-activate", this.backButtonActivateListener);
    this.restoreButton.addEventListener("action-activate", this.restoreButtonActivateListener);
    this.saveButton.addEventListener("action-activate", this.saveButtonActivateListener);
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      frame.setAttribute("frame-style", "f1");
      frame.setAttribute("filigree-class", "mt-3");
    }
    this.updateInputDeviceType();
  }
  onDetach() {
    window.removeEventListener("resize", this.resizeListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    engine.off("InputActionBinded", this.onInputActionBinded, this);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.actionListContainer);
    this.updateNavTray();
  }
  updateActionList() {
    this.actionList.innerHTML = `
			${this.controlList.map(
      ({ name }, i) => `
				<div class="mt-7 mx-6">
					<div class="flow-row items-center relative ${this.isDeviceTypeToActionsDefined ? "hidden" : ""}">
						<fxs-header title="${name}" class="flex-auto uppercase text-center font-title text-base tracking-100" filigree-style="none"></fxs-header>
						<fxs-minus-plus class="editor-controller-mapping__expand absolute right-2" type="minus" index="${i}" tabindex="-1"></fxs-minus-plus>
					</div>
					<div class="flow-row justify-center -mt-3 mb-3 ${this.isDeviceTypeToActionsDefined ? "hidden" : ""}">
						<div class="img-unit-panel-divider -scale-y-100"></div>
						<div class="img-unit-panel-divider -scale-100"></div>
					</div>
					<div class="editor-controller-mapping__action-list editor-controller-mapping__action-list-${i}" index="${i}"></div>
				</div>
			`
    ).join("")}
		`;
    if (Input.isInvertStickActionsAllowed() && !this.isReadOnly) {
      const invertStickRow = document.createElement("div");
      invertStickRow.classList.add("flow-row", "mx-6", "items-center");
      const invertStickLabel = document.createElement("div");
      invertStickLabel.classList.add(
        "font-body",
        "text-base",
        "text-accent-3",
        "flex-auto",
        "font-fit-shrink",
        "whitespace-nowrap"
      );
      invertStickLabel.setAttribute("data-l10n-id", "LOC_UI_CONTROLLER_MAPPING_INVERT_STICK");
      this.invertCheckbox = document.createElement("fxs-checkbox");
      invertStickRow.appendChild(invertStickLabel);
      invertStickRow.appendChild(this.invertCheckbox);
      this.actionList.insertAdjacentElement("afterbegin", invertStickRow);
    }
    this.invertCheckbox?.addEventListener("focus", this.invertCheckboxFocusListener);
    this.invertCheckbox?.addEventListener("mouseover", this.invertCheckboxHoverListener);
    this.invertCheckbox?.addEventListener("action-activate", this.invertCheckboxActivateListener);
    this.expandButtons = MustGetElements(".editor-controller-mapping__expand", this.Root);
    this.expandButtons?.forEach((expandButton) => {
      expandButton.addEventListener(ActionActivateEventName, this.expandButtonActivateListener);
      expandButton.addEventListener("focus", this.expandButtonFocusListener);
      expandButton.addEventListener("mouseover", this.expandButtonHoverListener);
    });
    this.actionListDivs = MustGetElements(".editor-controller-mapping__action-list", this.Root);
    this.actionListDivs.forEach((actionListDiv) => {
      const i = parseInt(actionListDiv.getAttribute("index") ?? "0");
      const { id: context } = this.controlList[i];
      const actions = this.controlList[i].actions.filter(({ id }) => Input.getActionSortIndex(id) != "");
      actions.forEach(({ name: actionName, id: actionID }, j) => {
        const chooserItem = this.getEditorControllerChooserItem(
          {
            context,
            actionName,
            actionID
          },
          this.controlList[i].actions,
          j
        );
        chooserItem.firstChild?.addEventListener("focus", this.chooserItemFocusListener);
        chooserItem.addEventListener("mouseenter", this.chooserItemHoverListener);
        chooserItem.addEventListener("mouseleave", this.chooserItemBlurListener);
        chooserItem.firstChild?.addEventListener("action-activate", this.chooserItemActivateListener);
        actionListDiv.appendChild(chooserItem);
        this.controlList[i].actionsDictionary[`${actionID}`].actionChooserItem = chooserItem;
      });
    });
  }
  updateControllerActionDiv() {
    this.controllerActionDiv.innerHTML = `
			<div class="editor-controller-mapping__controller-icon absolute inset-0 bg-contain bg-no-repeat bg-center" style="background-image: url('${this.inputControllerIcon}')"></div>
			${this.controlList.map(
      (_value, i) => `
				<div class="editor-controller-mapping__action-description text-center font-body text-base text-accent-3 h-32 w-full absolute" index="${i}"></div>
				<div class="absolute inset-0 editor-controller-mapping__action-vis hidden" index="${i}"></div>
			`
    ).join("")}
		`;
    this.actionVisDivs = MustGetElements(".editor-controller-mapping__action-vis", this.Root);
    this.actionVisDivs.forEach((actionVisDiv) => {
      const i = parseInt(actionVisDiv.getAttribute("index") ?? "0");
      const { id: context } = this.controlList[i];
      this.controlList[i].actions.forEach(({ name: actionName, id: actionID }) => {
        const mapActionElement = this.getControllerMapActionElement({
          context,
          actionName,
          actionID
        });
        actionVisDiv.appendChild(mapActionElement);
        this.controlList[i].actionsDictionary[`${actionID}`].actionMapElement = mapActionElement;
      });
      GESTURE_KEYS.filter((key) => !DEVICE_TYPE_TO_EXCLUDED_GESTURES[this.inputDeviceType].includes(key)).forEach(
        (key) => {
          const mapActionElement = this.getControllerMapActionElement({
            context,
            actionName: "",
            actionID: -3,
            gestureKey: key
          });
          actionVisDiv.appendChild(mapActionElement);
        }
      );
    });
    this.actionDescriptionDivs = MustGetElements(".editor-controller-mapping__action-description", this.Root);
    this.actionDescriptionDivs.forEach((actionDescriptionDiv) => {
      const i = parseInt(actionDescriptionDiv.getAttribute("index") ?? "0");
      this.controlList[i].actions.forEach(({ id: actionID, description }) => {
        const actionDescription = document.createElement("div");
        actionDescription.classList.add(
          "text-center",
          "font-body",
          "text-base",
          "text-accent-3",
          "h-32",
          "editor-controller-mapping__description-width",
          "invisible",
          "absolute"
        );
        actionDescription.setAttribute("data-l10n-id", description);
        actionDescriptionDiv.appendChild(actionDescription);
        this.controlList[i].actionsDictionary[`${actionID}`].descriptionElement = actionDescription;
      });
      const contextDescription = document.createElement("div");
      contextDescription.classList.add(
        "text-center",
        "font-body",
        "text-base",
        "text-accent-3",
        "font-fit-shrink",
        "whitespace-nowrap",
        "w-full",
        "invisible",
        "absolute"
      );
      contextDescription.setAttribute("data-l10n-id", this.controlList[i].name ?? "");
      actionDescriptionDiv.appendChild(contextDescription);
      this.controlList[i].actionsDictionary["0"].descriptionElement = contextDescription;
      const swapStickDescription = document.createElement("div");
      swapStickDescription.classList.add(
        "text-center",
        "font-body",
        "text-base",
        "text-accent-3",
        "font-fit-shrink",
        "whitespace-nowrap",
        "w-full",
        "invisible",
        "absolute"
      );
      swapStickDescription.setAttribute("data-l10n-id", "LOC_GESTURE_THUMB_AXIS");
      actionDescriptionDiv.appendChild(swapStickDescription);
      this.controlList[i].actionsDictionary["-1"].descriptionElement = swapStickDescription;
    });
  }
  updateNavTray() {
    NavTray.clear();
    if (this.isReadOnly) {
      NavTray.addOrUpdateGenericBack();
      return;
    }
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateShellAction1("LOC_UI_CONTROLLER_MAPPING_CONFIRM_CHANGE_TITLE");
    NavTray.addOrUpdateShellAction2("LOC_UI_CONTROLLER_MAPPING_RESTORE_DEFAULT");
  }
  updateInvertCheckbox() {
    const i = this.controlList.findIndex(({ id }) => id == InputContext.Shell);
    const { id: actionId = 0 } = this.controlList[i]?.actions.find(({ name }) => name == "LOC_MOVE_CURSOR") ?? {};
    this.invertCheckbox?.setAttribute(
      "selected",
      Input.getGestureKey(actionId, 0, this.inputDeviceType, InputContext.Shell) == InputKeys.PAD_RTHUMB_AXIS ? "true" : "false"
    );
  }
  updateActionVisDivs() {
    this.actionVisDivs?.forEach((actionVisDiv) => {
      const i = parseInt(actionVisDiv.getAttribute("index") ?? "0");
      const { id } = this.controlList[i];
      actionVisDiv.classList.toggle("hidden", this.currentContext != id);
    });
  }
  updateTitle() {
    if (this.inputDeviceType == InputDeviceType.Hybrid) {
      const gestureIconUrl = `${Input.getPrefix(this.inputDeviceType)}${Icon.getIconFromActionID(Input.getActionIdByName("mousebutton-left") || 0, this.inputDeviceType, InputContext.ALL, false) || ""}`;
      const iconClass = gestureIconUrl.split("_").slice(2).join("-");
      this.title.setAttribute(
        "title",
        Locale.compose(
          "LOC_UI_CONTROLLER_MAPPING_TITLE_HYBRID",
          Locale.compose(
            iconClass == "right-bumper" ? "LOC_UI_CONTROLLER_MAPPING_RIGHT" : "LOC_UI_CONTROLLER_MAPPING_LEFT"
          )
        )
      );
    } else {
      this.title.setAttribute("title", "LOC_UI_CONTROLLER_MAPPING_TITLE");
    }
  }
  updateControllerContainer() {
    const { width } = this.controllerContainer.getBoundingClientRect();
    this.controllerContainer.style.setProperty("height", `${width * 710 / 1100}px`);
  }
  updateMapActionElements() {
    const toggleStickActions = (value) => {
      const actionDic = this.controlList.find(({ id }) => id == this.currentContext)?.actionsDictionary;
      Object.keys(actionDic ?? {}).forEach((actionID) => {
        const { name, actionMapElement } = actionDic?.[actionID] ?? {};
        if (STICK_ACTION_NAMES.includes(name)) {
          actionMapElement?.setAttribute("highlight", value ? "true" : "false");
        }
      });
    };
    if (this.prevActionID == -1) {
      toggleStickActions(false);
    }
    this.controlList.find(({ id }) => id == this.currentContext)?.actionsDictionary[this.prevActionID]?.actionMapElement?.setAttribute("highlight", "false");
    if (this.currentActionID == -1) {
      toggleStickActions(true);
    }
    this.controlList.find(({ id }) => id == this.currentContext)?.actionsDictionary[this.currentActionID]?.actionMapElement?.setAttribute("highlight", "true");
  }
  updateControllerSection() {
    this.controllerSection.classList.toggle("hidden", this.inputDeviceLayout == InputDeviceLayout.Unknown);
    this.controllerSection.classList.toggle("ounce", this.inputDeviceLayout == InputDeviceLayout.Ounce);
    this.controllerSection.classList.toggle("switch", this.inputDeviceLayout == InputDeviceLayout.Nintendo);
    this.controllerSection.classList.toggle("xbox", this.inputDeviceLayout == InputDeviceLayout.XBox);
    this.controllerSection.classList.toggle(
      "playstation-4",
      this.inputDeviceLayout == InputDeviceLayout.PlayStation4
    );
    this.controllerSection.classList.toggle(
      "playstation-5",
      this.inputDeviceLayout == InputDeviceLayout.PlayStation5
    );
  }
  updateActionDescriptionDiv() {
    const prevContextControl = this.controlList.find(({ id }) => id == this.prevContext);
    const currentContextControl = this.controlList.find(({ id }) => id == this.currentContext);
    currentContextControl?.actionsDictionary[this.currentActionID]?.descriptionElement?.classList.toggle(
      "invisible",
      false
    );
    prevContextControl?.actionsDictionary[this.prevActionID]?.descriptionElement?.classList.toggle(
      "invisible",
      true
    );
    if (this.currentActionID != this.prevActionID) {
      currentContextControl?.actionsDictionary[this.prevActionID]?.descriptionElement?.classList.toggle(
        "invisible",
        true
      );
    }
    this.actionDescriptionDivs?.forEach((actionDescriptionDiv) => {
      actionDescriptionDiv.classList.toggle("ounce", this.inputDeviceLayout == InputDeviceLayout.Ounce);
      actionDescriptionDiv.classList.toggle("switch", this.inputDeviceLayout == InputDeviceLayout.Nintendo);
      actionDescriptionDiv.classList.toggle("xbox", this.inputDeviceLayout == InputDeviceLayout.XBox);
      actionDescriptionDiv.classList.toggle(
        "playstation-4",
        this.inputDeviceLayout == InputDeviceLayout.PlayStation4
      );
      actionDescriptionDiv.classList.toggle(
        "playstation-5",
        this.inputDeviceLayout == InputDeviceLayout.PlayStation5
      );
    });
  }
  updateInputDeviceLayout() {
    const inputDeviceLayout = Input.getInputDeviceLayout(this.inputDeviceType) || this.inputDeviceLayout;
    if (inputDeviceLayout != this.inputDeviceLayout) {
      this.inputDeviceLayout = inputDeviceLayout;
      this.updateControllerSection();
      this.updateActionDescriptionDiv();
    }
  }
  updateInputDeviceType() {
    let inputDeviceType = InputDeviceType.Controller;
    if (ActionHandler.isHybridActive) {
      inputDeviceType = InputDeviceType.Hybrid;
    }
    const activeControllerIcon = Input.getControllerIcon() || this.inputControllerIcon;
    const isNewControllerType = inputDeviceType == InputDeviceType.Controller && activeControllerIcon !== this.inputControllerIcon;
    if (inputDeviceType != this.inputDeviceType || isNewControllerType) {
      this.inputDeviceType = inputDeviceType;
      const actions = DEVICE_TYPE_TO_ACTIONS[this.inputDeviceType];
      this.prevContext = this.currentContext;
      this.currentContext = actions ? InputContext.ALL : InputContext.Shell;
      this.inputControllerIcon = activeControllerIcon;
      this.prevActionID = this.currentActionID;
      this.currentActionID = -2;
      this.generateControlList(actions);
      this.updateActionList();
      this.updateControllerActionDiv();
      this.updateActionVisDivs();
      this.updateMapActionElements();
      this.updateActionDescriptionDiv();
      this.updateInvertCheckbox();
      waitForLayout(this.updateControllerContainer.bind(this));
      Focus.setContextAwareFocus(this.Root, this.Root);
      Focus.setContextAwareFocus(this.actionListContainer, this.Root);
    }
    this.updateTitle();
    this.updateInputDeviceLayout();
  }
  updateTargetedAction(target) {
    const { context = InputContext.INVALID, actionID = 0 } = JSON.parse(target?.getAttribute("node") ?? "") ?? {};
    this.prevContext = this.currentContext;
    this.currentContext = context;
    this.prevActionID = this.currentActionID;
    this.currentActionID = actionID;
    this.updateActionVisDivs();
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onEngineInput(inputEvent) {
    if (!this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
        Input.loadPreferences();
        this.close();
        return false;
    }
    if (this.isReadOnly) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "shell-action-1":
        this.onConfirmChangeActivate();
        return false;
      case "shell-action-2":
        this.onRestoreDefaultActivate();
        return false;
    }
    return true;
  }
  onInputActionBinded({ actionId }) {
    const i = this.controlList.findIndex(({ id }) => id == InputContext.Shell);
    if ((this.controlList[i].actions.find(({ id }) => id == actionId)?.name ?? "") == "LOC_MOVE_CURSOR") {
      this.updateInvertCheckbox();
    }
  }
  onExpandButtonActivate({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const index = parseInt(target.getAttribute("index") ?? "0");
    const type = target.getAttribute("type");
    target.setAttribute("type", type == "minus" ? "plus" : "minus");
    this.actionListDivs?.[index].classList.toggle("hidden", type == "minus");
  }
  onChooserItemFocus({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    this.updateTargetedAction(target);
  }
  onChooserItemHover({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    this.updateTargetedAction(target.firstChild);
  }
  onChooserItemBlur(_event) {
    this.prevActionID = this.currentActionID;
    this.currentActionID = -2;
    this.updateActionVisDivs();
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onChooserItemActivate({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (this.isReadOnly) {
      if (Input.getActiveDeviceType() != InputDeviceType.Touch || target == this.selectedAction) {
        return;
      }
      this.selectedAction?.classList.toggle("selected", false);
      this.selectedAction = target;
      this.selectedAction.classList.toggle("selected", true);
      this.updateTargetedAction(target);
      return;
    }
    const {
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0
    } = JSON.parse(target.getAttribute("node") ?? "") ?? {};
    const node = {
      contextName: this.controlList.find(({ id }) => id == context)?.name,
      context,
      actionName,
      actionID
    };
    ContextManager.push("editor-input-binding-panel", {
      singleton: true,
      attributes: { node: JSON.stringify(node), darker: true }
    });
  }
  onInvertCheckboxFocus(_event) {
    this.prevActionID = this.currentActionID;
    this.currentActionID = -1;
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onInvertCheckboxHover(_event) {
    this.prevActionID = this.currentActionID;
    this.currentActionID = -1;
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onActiveDeviceTypeChanged(_event) {
    this.updateInputDeviceType();
  }
  onInvertCheckboxActivate({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const isChecked = target.getAttribute("selected") == "true";
    Input.swapThumbAxis(isChecked);
  }
  onExpandButtonFocus({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const { id } = this.controlList[parseInt(target.parentElement?.parentElement?.getAttribute("index") ?? "0")];
    this.prevContext = this.currentContext;
    this.currentContext = id;
    this.prevActionID = this.currentActionID;
    this.currentActionID = 0;
    this.updateActionVisDivs();
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onExpandButtonHover({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const { id } = this.controlList[parseInt(target.parentElement?.parentElement?.getAttribute("index") ?? "0")];
    this.prevContext = this.currentContext;
    this.currentContext = id;
    this.prevActionID = this.currentActionID;
    this.currentActionID = 0;
    this.updateActionVisDivs();
    this.updateMapActionElements();
    this.updateActionDescriptionDiv();
  }
  onBackButtonActivate() {
    Input.loadPreferences();
    this.close();
  }
  onRestoreDefaultActivate() {
    NavTray.clear();
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_UI_CONTROLLER_MAPPING_RESET_DEFAULT_BODY",
      title: "LOC_UI_CONTROLLER_MAPPING_RESET_DEFAULT_TITLE",
      canClose: false,
      callback: (eAction) => eAction == DialogBoxAction.Confirm && Input.restoreDefault()
    });
  }
  onConfirmChangeActivate() {
    NavTray.clear();
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_UI_CONTROLLER_MAPPING_CONFIRM_CHANGE_BODY",
      title: "LOC_UI_CONTROLLER_MAPPING_CONFIRM_CHANGE_TITLE",
      canClose: false,
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          Input.savePreferences();
          this.close();
        }
      }
    });
  }
  onResize() {
    waitForLayout(this.updateControllerContainer.bind(this));
  }
}
const EditorControllerMappingTagName = "editor-controller-mapping";
Controls.define(EditorControllerMappingTagName, {
  createInstance: EditorControllerMapping,
  description: "Screen for changing the controller mapping.",
  classNames: ["editor-controller-mapping", "fullscreen", "flow-row", "justify-center", "items-center"],
  styles: [editorControllerMappingStyles],
  tabIndex: -1
});
class EditorInputBindingPanel extends Panel {
  _node;
  get editorInputBindingPanelNode() {
    return this._node;
  }
  set editorInputBindingPanelNode(value) {
    this._node = value;
  }
  contextNameDiv;
  actionNameDiv;
  gestureIcon;
  gestureIconText;
  inputDeviceType = InputDeviceType.Controller;
  recordingDeviceTypes = [InputDeviceType.Controller];
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onInitialize() {
    this.Root.innerHTML = this.getContent();
    this.inputDeviceType = ActionHandler.isHybridActive ? InputDeviceType.Hybrid : InputDeviceType.Controller;
    this.recordingDeviceTypes = ActionHandler.isHybridActive ? [InputDeviceType.Hybrid] : [InputDeviceType.Controller];
    this.contextNameDiv = MustGetElement(".editor-input-binding-panel__context-name", this.Root);
    this.actionNameDiv = MustGetElement(".editor-input-binding-panel__action-name", this.Root);
    this.gestureIcon = MustGetElement(".editor-input-binding-panel__gesture-icon", this.Root);
    this.gestureIconText = MustGetElement(".editor-input-binding-panel__gesture-text", this.Root);
  }
  onAttach() {
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    engine.on("InputGestureRecorded", this.onInputGestureRecorded, this);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    Input.beginRecordingGestures(this.recordingDeviceTypes, true);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    engine.off("InputGestureRecorded", this.onInputGestureRecorded, this);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    Input.stopRecordingGestures();
  }
  updateData() {
    const {
      contextName = "",
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0
    } = this.editorInputBindingPanelNode ?? {};
    const gestureIconUrl = `${Input.getPrefix(this.inputDeviceType)}${Icon.getIconFromActionID(actionID, this.inputDeviceType, context, false)}`;
    this.contextNameDiv.setAttribute("title", contextName);
    this.actionNameDiv.setAttribute("data-l10n-id", actionName);
    this.gestureIcon.style.setProperty("background-image", `url(${gestureIconUrl})`);
    this.gestureIconText.innerHTML = mapIconToText[gestureIconUrl] ?? "";
    this.gestureIconText.classList.toggle("hidden", !["ps4_icon_start", "ps4_icon_share"].includes(gestureIconUrl));
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "node":
        this.editorInputBindingPanelNode = newValue ? JSON.parse(newValue) : null;
        this.updateData();
        break;
    }
  }
  onReceiveFocus() {
    FocusManager.setFocus(this.Root);
    NavTray.clear();
  }
  onInputGestureRecorded({ index }) {
    const { context = InputContext.INVALID, actionID = 0 } = this.editorInputBindingPanelNode ?? {};
    Input.bindAction(actionID, 0, index, context);
    this.close();
  }
  onActiveDeviceTypeChanged(event) {
    if (event.detail.deviceType != this.inputDeviceType && [InputDeviceType.Controller, InputDeviceType.Hybrid].includes(event.detail.deviceType)) {
      this.close();
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status == InputActionStatuses.FINISH && (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "keyboard-escape")) {
      this.close();
    }
  }
  getContent() {
    const { contextName = "", actionName = "" } = this.editorInputBindingPanelNode ?? {};
    return `
			<div class="w-full h-full flow-column justify-center items-center">
				<fxs-header title="LOC_UI_CONTROLLER_MAPPING_BIND_TITLE" class="font-title text-xl text-center uppercase tracking-100" filigree-style="none"></fxs-header>
				<fxs-header title="${contextName}" class="editor-input-binding-panel__context-name uppercase text-center font-title text-base tracking-100 mt-8" filigree-style="none"></fxs-header>
				<div class="flow-row justify-center -mt-3 mb-3">
					<div class="img-unit-panel-divider -scale-y-100"></div>
					<div class="img-unit-panel-divider -scale-100"></div>
				</div>
				<div class="flow-row items-center">
					<div class="editor-input-binding-panel__action-name flex-auto whitespace-nowrap font-fit-shrink font-title text-base text-accent-3 uppercase mr-2" data-l10n-id="${actionName}"></div>
					<div class="editor-input-binding-panel__gesture-container relative w-8 h-8 flex justify-center z-1">
						<div class="editor-input-binding-panel__gesture-icon absolute inset-0 bg-center bg-contain bg-no-repeat"></div>
						<div class="editor-input-binding-panel__gesture-text absolute bottom-7 text-accent-1 text-shadow text-2xs"></div>
					</div>
				</div>
				<div class="font-title text-lg text-accent-2 uppercase text-center mt-6" data-l10n-id="LOC_UI_CONTROLLER_MAPPING_BIND_GESTURE"></div>
			</div>
		`;
  }
}
const EditorInputBindingPanelTagName = "editor-input-binding-panel";
Controls.define(EditorInputBindingPanelTagName, {
  createInstance: EditorInputBindingPanel,
  description: "Panel to bind a new gesture to an action.",
  classNames: [
    "editor-input-binding-panel",
    "fullscreen",
    "flow-row",
    "justify-center",
    "items-center",
    "pointer-events-auto"
  ],
  attributes: [{ name: "node" }],
  tabIndex: -1
});
class EditorControllerChooserItem extends FxsChooserItem {
  _chooserNode;
  get editorControllerChooserNode() {
    return this._chooserNode;
  }
  set editorControllerChooserNode(value) {
    this._chooserNode = value;
  }
  actionNameDiv;
  gestureIcon;
  gestureIconText;
  inputDeviceType = InputDeviceType.Controller;
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onInitialize() {
    super.onInitialize();
    this.renderChooserItem();
    this.actionNameDiv = MustGetElement(`.${this.Root.typeName}__action-name`, this.Root);
    this.gestureIcon = MustGetElement(`.${this.Root.typeName}__gesture-icon`, this.Root);
    this.gestureIconText = MustGetElement(`.${this.Root.typeName}__gesture-text`, this.Root);
  }
  onAttach() {
    super.onAttach();
    this.updateInputDeviceType();
    engine.on("InputActionBinded", this.onInputActionBinded, this);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
  }
  onDetach() {
    engine.off("InputActionBinded", this.onInputActionBinded, this);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    super.onDetach();
  }
  renderChooserItem() {
    this.Root.innerHTML = "";
    super.renderChooserItem();
    const { actionName = "" } = this.editorControllerChooserNode ?? {};
    const content = document.createElement("div");
    content.classList.add("flow-row", "p-2", "pl-3", "relative", "items-center", "flex-auto");
    content.innerHTML = `
			<div class="${this.Root.typeName}__action-name flex-auto whitespace-nowrap font-fit-shrink font-title text-base text-accent-2 uppercase mr-2" data-l10n-id="${actionName}"></div>
			<div class="${this.Root.typeName}__gesture-container relative w-8 h-8 flex justify-center z-1">
				<div class="${this.Root.typeName}__gesture-icon absolute inset-0 bg-center bg-contain bg-no-repeat"></div>
				<div class="${this.Root.typeName}__gesture-text absolute bottom-7 text-accent-1 text-shadow text-2xs"></div>
			</div>
		`;
    this.Root.appendChild(content);
  }
  updateData() {
    const {
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0
    } = this.editorControllerChooserNode ?? {};
    const gestureIconUrl = `${Input.getPrefix(this.inputDeviceType)}${Icon.getIconFromActionID(actionID, this.inputDeviceType, context, false)}`;
    this.actionNameDiv.setAttribute("data-l10n-id", actionName);
    this.gestureIcon.style.setProperty("background-image", `url(${gestureIconUrl})`);
    this.gestureIconText.innerHTML = mapIconToText[gestureIconUrl] ?? "";
    this.gestureIconText.classList.toggle("hidden", !["ps4_icon_start", "ps4_icon_share"].includes(gestureIconUrl));
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "node":
        this.editorControllerChooserNode = newValue ? JSON.parse(newValue) : null;
        this.updateData();
        break;
    }
  }
  onInputActionBinded({ context: bindedContext, actionId: bindedActionID }) {
    const { context = InputContext.INVALID, actionID = 0 } = this.editorControllerChooserNode ?? {};
    if (context == InputContext.ALL && actionID == bindedActionID || context == bindedContext && actionID == bindedActionID) {
      this.updateData();
    }
  }
  onActiveDeviceTypeChanged(_event) {
    this.updateInputDeviceType();
  }
  // TODO: update only on layout change (ounce-right, ounce-left) as this should be the only time the component stays alive and update
  updateInputDeviceType() {
    if (ActionHandler.isHybridActive) {
      this.inputDeviceType = InputDeviceType.Hybrid;
    } else if (ActionHandler.isGamepadActive) {
      this.inputDeviceType = InputDeviceType.Controller;
    }
    this.updateData();
  }
}
Controls.define("editor-controller-chooser-item", {
  createInstance: EditorControllerChooserItem,
  description: "A chooser item to be used with the editor controller screen",
  classNames: ["editor-controller-chooser-item", "chooser-item_unlocked"],
  styles: [chooserItemStyles],
  attributes: [
    { name: "node" },
    { name: "disabled" },
    { name: "index" },
    { name: "selected" },
    { name: "select-highlight" }
  ]
});
class EditorControllerReadOnlyItem extends EditorControllerChooserItem {
  onAttach() {
    super.onAttach();
    this.renderChooserItem();
    this.actionNameDiv = MustGetElement(`.${this.Root.typeName}__action-name`, this.Root);
    this.gestureIcon = MustGetElement(`.${this.Root.typeName}__gesture-icon`, this.Root);
    this.gestureIconText = MustGetElement(`.${this.Root.typeName}__gesture-text`, this.Root);
  }
  renderChooserItem() {
    this.Root.innerHTML = "";
    const { actionName = "" } = this.editorControllerChooserNode ?? {};
    const content = document.createElement("div");
    content.classList.add("flow-row", "p-2", "pl-3", "relative", "items-center", "flex-auto", "cursor-not-allowed");
    content.innerHTML = `
			<div class="absolute inset-0 hud_sidepanel_list-bg opacity-40"></div>
			<div class="absolute inset-0 img-list-focus-frame opacity-0 group-focus\\:opacity-40 selected-highlight"></div>
			<div class="${this.Root.typeName}__action-name flex-auto whitespace-nowrap font-fit-shrink font-title text-base text-accent-2 uppercase mr-2" data-l10n-id="${actionName}"></div>
			<div class="${this.Root.typeName}__gesture-container relative w-8 h-8 flex justify-center z-1">
				<div class="${this.Root.typeName}__gesture-icon absolute inset-0 bg-center bg-contain bg-no-repeat"></div>
				<div class="${this.Root.typeName}__gesture-text absolute bottom-7 text-accent-1 text-shadow text-2xs"></div>
			</div>
		`;
    this.Root.appendChild(content);
  }
}
Controls.define("editor-controller-read-only-item", {
  createInstance: EditorControllerReadOnlyItem,
  description: "A read-only item to be used with the editor controller screen",
  classNames: ["editor-controller-read-only-item", "group"],
  styles: [chooserItemStyles],
  attributes: [{ name: "node" }]
});
class ControllerMapActionElement extends Component {
  _node;
  highlight = false;
  get controllerMapActionElementNode() {
    return this._node;
  }
  set controllerMapActionElementNode(value) {
    this._node = value;
  }
  actionNameDiv;
  gestureIconContainer;
  gestureIcon;
  gestureIconText;
  highlightDiv;
  handleResize = this.onResize.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  inputDeviceLayout = InputDeviceLayout.Unknown;
  inputDeviceType = InputDeviceType.Controller;
  onInitialize() {
    super.onInitialize();
    this.render();
    this.actionNameDiv = MustGetElement(".controller-map-action-element__action-name", this.Root);
    this.gestureIconContainer = MustGetElement(".controller-map-action-element__gesture-container", this.Root);
    this.gestureIcon = MustGetElement(".controller-map-action-element__gesture-icon", this.Root);
    this.gestureIconText = MustGetElement(".controller-map-action-element__gesture-text", this.Root);
    this.highlightDiv = MustGetElement(".controller-map-action-element__highlight", this.Root);
  }
  onAttach() {
    super.onAttach();
    engine.on("InputActionBinded", this.onInputActionBinded, this);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.addEventListener("resize", this.handleResize);
    this.updateInputDeviceType();
    this.updateHighlight();
    this.updateActionNameDiv();
    this.updateGestureIconContainer();
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.removeEventListener("resize", this.handleResize);
    engine.off("InputActionBinded", this.onInputActionBinded, this);
    super.onDetach();
  }
  render() {
    const { actionName = "" } = this.controllerMapActionElementNode ?? {};
    this.Root.innerHTML = `
			<div class="relative flow-row items-center">
				<div class="controller-map-action-element__highlight img-popup_icon_glow absolute bg-full -inset-y-8 -inset-x-14 opacity-0 transition-opacity"></div>
				<div class="controller-map-action-element__action-name font-body text-base text-accent-2 mx-1 max-w-50 whitespace-nowrap font-fit-shrink" data-l10n-id="${actionName}" style="coh-font-fit-min-size:12px;"></div>
				<div class="controller-map-action-element__gesture-container relative flex justify-center z-1">
					<div class="controller-map-action-element__gesture-icon absolute inset-0 bg-center bg-contain bg-no-repeat"></div>
					<div class="controller-map-action-element__gesture-text absolute bottom-7 text-accent-1 text-shadow text-2xs"></div>
				</div>
			</div>
		`;
  }
  updateData() {
    const {
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0,
      gestureKey
    } = this.controllerMapActionElementNode ?? {};
    const gestureIconUrl = `${Input.getPrefix(this.inputDeviceType)}${!gestureKey ? Icon.getIconFromActionID(actionID, this.inputDeviceType, context, false) : Input.getKeyIcon(gestureKey, false)}`;
    this.actionNameDiv.setAttribute("data-l10n-id", actionName);
    this.actionNameDiv.classList.toggle(
      "text-accent-3",
      this.inputDeviceType == InputDeviceType.Hybrid && UNBINDABLE_ACTION_NAMES.includes(actionName)
    );
    this.actionNameDiv.classList.toggle(
      "text-accent-2",
      !UNBINDABLE_ACTION_NAMES.includes(actionName)
    );
    this.gestureIcon.style.setProperty("background-image", `url(${gestureIconUrl})`);
    this.gestureIconText.innerHTML = mapIconToText[gestureIconUrl] ?? "";
    this.gestureIconText.classList.toggle("hidden", !["ps4_icon_start", "ps4_icon_share"].includes(gestureIconUrl));
    const iconClass = gestureIconUrl.split("_").slice(2).join("-");
    this.Root.classList.value = `controller-map-action-element ${INPUT_LAYOUT_TO_CLASS[this.inputDeviceLayout]} ${iconClass}`;
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "node":
        this.controllerMapActionElementNode = newValue ? JSON.parse(newValue) : void 0;
        this.updateData();
        break;
      case "highlight":
        this.highlight = newValue == "true";
        this.updateHighlight();
    }
  }
  onActiveDeviceTypeChanged(_event) {
    this.updateInputDeviceType();
  }
  onResize() {
    waitForLayout(() => {
      this.updateActionNameDiv();
      this.updateGestureIconContainer();
    });
  }
  onInputActionBinded({ context: bindedContext, actionId: bindedActionID }) {
    const { context = InputContext.INVALID, actionID = 0 } = this.controllerMapActionElementNode ?? {};
    if (context == InputContext.ALL && actionID == bindedActionID || context == bindedContext && actionID == bindedActionID) {
      this.updateData();
    }
  }
  updateActionNameDiv() {
    let mode = "xs";
    if (window.innerHeight > Layout.pixelsToScreenPixels(900) && window.innerWidth > Layout.pixelsToScreenPixels(1488)) {
      mode = "base";
    } else if (window.innerHeight > Layout.pixelsToScreenPixels(768) && window.innerWidth > Layout.pixelsToScreenPixels(1366)) {
      mode = "sm";
    }
    this.actionNameDiv.classList.toggle("text-base", mode == "base");
    this.actionNameDiv.classList.toggle("text-sm", mode == "sm");
    this.actionNameDiv.classList.toggle("text-xs", mode == "xs");
    this.actionNameDiv.classList.toggle("max-w-40", mode == "base");
    this.actionNameDiv.classList.toggle("max-w-32", mode == "sm" || mode == "xs");
  }
  updateGestureIconContainer() {
    let mode = "xs";
    if (window.innerHeight > Layout.pixelsToScreenPixels(900) && window.innerWidth > Layout.pixelsToScreenPixels(1488)) {
      mode = "base";
    } else if (window.innerHeight > Layout.pixelsToScreenPixels(768) && window.innerWidth > Layout.pixelsToScreenPixels(1366)) {
      mode = "sm";
    }
    this.gestureIconContainer.classList.toggle("w-8", mode == "base");
    this.gestureIconContainer.classList.toggle("h-8", mode == "base");
    this.gestureIconContainer.classList.toggle("w-7", mode == "sm");
    this.gestureIconContainer.classList.toggle("h-7", mode == "sm");
    this.gestureIconContainer.classList.toggle("w-6", mode == "xs");
    this.gestureIconContainer.classList.toggle("h-6", mode == "xs");
  }
  updateHighlight() {
    this.highlightDiv.classList.toggle("opacity-0", !this.highlight);
  }
  updateInputDeviceLayout() {
    const inputDeviceLayout = Input.getInputDeviceLayout(this.inputDeviceType) || this.inputDeviceLayout;
    if (inputDeviceLayout != this.inputDeviceLayout) {
      this.inputDeviceLayout = inputDeviceLayout;
    }
  }
  // TODO: update only on layout change (ounce-right, ounce-left) as this should be the only time the component stays alive and update
  updateInputDeviceType() {
    if (ActionHandler.isHybridActive) {
      this.inputDeviceType = InputDeviceType.Hybrid;
    } else if (ActionHandler.isGamepadActive) {
      this.inputDeviceType = InputDeviceType.Controller;
    }
    this.updateInputDeviceLayout();
    this.updateData();
  }
}
Controls.define("controller-map-action-element", {
  createInstance: ControllerMapActionElement,
  description: "An action placed within the controller icon",
  classNames: ["controller-map-action-element"],
  attributes: [{ name: "node" }, { name: "highlight" }]
});

const KEYS_TO_ADD = [
  "keyboard-nav-down",
  "keyboard-nav-up",
  "keyboard-nav-left",
  "keyboard-nav-right",
  "keyboard-enter",
  "cycle-next",
  "cycle-prev",
  "force-end-turn",
  "open-attributes",
  "open-civics",
  "open-greatworks",
  "open-rankings",
  "open-techs",
  "open-traditions",
  "open-civilopedia",
  "quick-load",
  "quick-save",
  "toggle-grid-layer",
  "toggle-yields-layer",
  "toggle-resources-layer",
  "unit-move",
  "unit-ranged-attack",
  "unit-skip-turn",
  "unit-sleep",
  "unit-heal",
  "unit-fortify",
  "unit-alert",
  "unit-auto-explore"
];
if (TtsManager.isTtsSupported) {
  KEYS_TO_ADD.push("text-to-speech-keyboard");
}
const STARTING_INNER_HTML = `
<div class="w-full h-full py-4 px-32">
	<fxs-frame class="w-full h-full" frame-style="simple">
		<div class="flex items-center justify-end font-title uppercase text-secondary font-fit-shrink mb-2">
			<div class="flex-auto" data-l10n-id="LOC_UI_KBM_MAPPING_ACTIONS"></div>
			<div class="flex w-64 justify-center mx-4" data-l10n-id="LOC_UI_KBM_MAPPING_PRIMARY_KEY"></div>
			<div class="flex w-64 justify-center mx-4" data-l10n-id="LOC_UI_KBM_MAPPING_SECONDARY_KEY"></div>
		</div>
		<fxs-vslot class="flex-auto">
			<fxs-scrollable>
				<fxs-spatial-slot class="action-container flex-auto" tabIndex="-1"></fxs-spatial-slot>
			</fxs-scrollable>
		</fxs-vslot>
		<fxs-hslot class="keyboard-mapping_confirm-reset-container flex flex-row justify-between items-end mt-6">
			<fxs-button id="options-revert" class="ml-2"
						data-audio-group-ref="options" data-audio-activate="options-default-selected"
						caption="LOC_OPTIONS_RESET_TO_DEFAULTS"></fxs-button>
			<fxs-hero-button id="options-confirm" class="ml-2"
						caption="LOC_OPTIONS_CONFIRM_CHANGES" data-audio-group-ref="options"
						data-audio-activate-ref="data-audio-options-confirm"></fxs-button>
		</fxs-hslot>
		<fxs-close-button></fxs-close-button>
	</fxs-frame>
</div>`;
class EditorKeyboardMapping extends Panel {
  closeButton;
  revertButton;
  confirmButton;
  actionContainer;
  mappingDataMap = /* @__PURE__ */ new Map();
  isReadOnly = false;
  engineInputListener = this.onEngineInput.bind(this);
  closeButtonListener = this.onCloseButton.bind(this);
  revertButtonListener = this.onRevertButton.bind(this);
  confirmButtonListener = this.onConfirmButton.bind(this);
  onInitialize() {
    super.onInitialize();
    this.isReadOnly = UI.useReadOnlyInputMappingScreen();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.closeButton.addEventListener("action-activate", this.closeButtonListener);
    this.revertButton.addEventListener("action-activate", this.revertButtonListener);
    this.confirmButton.addEventListener("action-activate", this.confirmButtonListener);
    Audio.playSound("data-audio-window-overlay-open");
    const confirmResetContainer = MustGetElement(
      ".keyboard-mapping_confirm-reset-container",
      this.Root
    );
    if (this.isReadOnly) {
      confirmResetContainer.classList.add("hidden");
    } else {
      Databind.classToggle(confirmResetContainer, "hidden", `g_NavTray.isTrayRequired`);
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.closeButton.removeEventListener("action-activate", this.closeButtonListener);
    this.revertButton.removeEventListener("action-activate", this.revertButtonListener);
    this.confirmButton.removeEventListener("action-activate", this.confirmButtonListener);
    super.onDetach();
    Audio.playSound("data-audio-window-overlay-close");
  }
  render() {
    this.Root.innerHTML = STARTING_INNER_HTML;
    this.closeButton = MustGetElement("fxs-close-button", this.Root);
    this.revertButton = MustGetElement("#options-revert", this.Root);
    this.confirmButton = MustGetElement("#options-confirm", this.Root);
    this.actionContainer = MustGetElement(".action-container", this.Root);
    this.addActionsForContext(InputContext.ALL);
    for (let i = 0; i < Input.getNumContexts(); i++) {
      const context = Input.getContext(i);
      this.addActionsForContext(context);
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(MustGetElement(".action-container", this.Root));
    if (this.isReadOnly) {
      NavTray.addOrUpdateGenericBack();
      return;
    }
    NavTray.addOrUpdateShellAction1("LOC_UI_KBM_MAPPING_CONFIRM_CHANGE_TITLE");
    NavTray.addOrUpdateShellAction2("LOC_OPTIONS_RESET_TO_DEFAULTS");
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  addActionsForContext(inputContext) {
    for (const actionIdString of KEYS_TO_ADD) {
      const actionId = Input.getActionIdByName(actionIdString);
      if (!actionId) {
        console.error(`editor-keyboard-mapping: getActionIdByName failed for ${actionIdString}`);
        continue;
      }
      if (this.mappingDataMap.has(actionId)) {
        continue;
      }
      this.actionContainer.appendChild(this.createActionEntry(actionId, inputContext));
    }
  }
  createActionEntry(actionId, inputContext) {
    const actionName = Input.getActionName(actionId);
    const actionDescription = Input.getActionDescription(actionId);
    const entry = document.createElement("div");
    entry.classList.add("flex", "items-center", "justify-end", "my-2");
    const nameElement = document.createElement("div");
    nameElement.classList.add("flex-auto", "font-fit-shrink");
    nameElement.setAttribute("data-l10n-id", actionName);
    entry.appendChild(nameElement);
    const slotOneButton = document.createElement("editor-keyboard-button");
    const slotOneNode = {
      context: inputContext,
      actionName,
      actionID: actionId,
      gestureIndex: 0
    };
    slotOneButton.setAttribute("node", JSON.stringify(slotOneNode));
    slotOneButton.setAttribute("disabled", this.isReadOnly.toString());
    entry.appendChild(slotOneButton);
    const slotTwoButton = document.createElement("editor-keyboard-button");
    const slotTwoNode = {
      context: inputContext,
      actionName,
      actionID: actionId,
      gestureIndex: 1
    };
    slotTwoButton.setAttribute("node", JSON.stringify(slotTwoNode));
    slotTwoButton.setAttribute("disabled", this.isReadOnly.toString());
    entry.appendChild(slotTwoButton);
    const mappingData = {
      name: actionName,
      description: actionDescription,
      context: inputContext,
      buttonElements: [slotOneButton, slotTwoButton]
    };
    this.mappingDataMap.set(actionId, mappingData);
    return entry;
  }
  onCloseButton() {
    this.close();
  }
  onRevertButton() {
    const defaultCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Input.restoreDefault();
        this.close();
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT",
      title: "LOC_OPTIONS_DEFAULT",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: defaultCallback
    });
  }
  onConfirmButton() {
    NavTray.clear();
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_UI_KBM_MAPPING_CONFIRM_CHANGE_BODY",
      title: "LOC_UI_KBM_MAPPING_CONFIRM_CHANGE_TITLE",
      canClose: false,
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          Input.savePreferences();
          this.close();
        }
      }
    });
  }
  onEngineInput(inputEvent) {
    if (!this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.isCancelInput()) {
      Input.loadPreferences();
      this.close();
      return false;
    }
    if (this.isReadOnly) return true;
    if (inputEvent.detail.name == "shell-action-1") {
      this.onConfirmButton();
      return false;
    }
    if (inputEvent.detail.name == "shell-action-2") {
      this.onRevertButton();
      return false;
    }
    return true;
  }
}
const EditorKeyboardMappingTagName = "editor-keyboard-mapping";
Controls.define(EditorKeyboardMappingTagName, {
  createInstance: EditorKeyboardMapping,
  description: "Screen for changing the keyboard mapping.",
  classNames: ["editor-keyboard-mapping", "fullscreen", "flow-row", "justify-center", "items-center"]
});
class EditorKeyboardBindingPanel extends Panel {
  _node;
  get editorKeybardBindingPanelNode() {
    return this._node;
  }
  set editorKeybardBindingPanelNode(value) {
    this._node = value;
  }
  contextNameDiv;
  actionNameDiv;
  gestureString;
  engineInputListener = this.onEngineInput.bind(this);
  onInitialize() {
    this.Root.innerHTML = this.getContent();
    this.contextNameDiv = MustGetElement(".editor-keyboard-binding-panel__context-name", this.Root);
    this.actionNameDiv = MustGetElement(".editor-keyboard-binding-panel__action-name", this.Root);
    this.gestureString = MustGetElement(".editor-keyboard-binding-panel__gesture-string", this.Root);
    this.Root.style.backgroundColor = "rgba(14, 14, 14, 0.86)";
  }
  onAttach() {
    engine.on("InputGestureRecorded", this.onInputGestureRecorded, this);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    Input.beginRecordingGestures([InputDeviceType.Keyboard, InputDeviceType.Mouse], true);
    Audio.playSound("data-audio-window-overlay-open");
  }
  onDetach() {
    engine.off("InputGestureRecorded", this.onInputGestureRecorded, this);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    Audio.playSound("data-audio-window-overlay-close");
  }
  updateData() {
    const {
      contextName = "",
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0
    } = this.editorKeybardBindingPanelNode ?? {};
    this.contextNameDiv.setAttribute("title", contextName);
    this.actionNameDiv.setAttribute("data-l10n-id", actionName);
    let gestureString = Input.getGestureDisplayString(actionID, 0, InputDeviceType.Keyboard, context);
    if (!gestureString) {
      gestureString = Input.getGestureDisplayString(actionID, 0, InputDeviceType.Mouse, context);
    }
    this.gestureString.setAttribute("data-l10n-id", gestureString ?? "");
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "node":
        this.editorKeybardBindingPanelNode = newValue ? JSON.parse(newValue) : null;
        this.updateData();
        break;
    }
  }
  onReceiveFocus() {
    FocusManager.setFocus(this.Root);
    NavTray.clear();
  }
  onInputGestureRecorded({ index }) {
    const { actionID = 0, gestureIndex = 0 } = this.editorKeybardBindingPanelNode ?? {};
    Input.bindAction(actionID, gestureIndex, index, InputContext.ALL);
    this.close();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status == InputActionStatuses.FINISH && (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "mousebutton-right" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "keyboard-escape" || inputEvent.isCancelInput())) {
      this.close();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  }
  getContent() {
    const { contextName = "", actionName = "" } = this.editorKeybardBindingPanelNode ?? {};
    return `
			<div class="w-full h-full flow-column justify-center items-center">
				<fxs-header title="LOC_UI_CONTROLLER_MAPPING_BIND_TITLE" class="font-title text-xl text-center uppercase tracking-100" filigree-style="none"></fxs-header>
				<fxs-header title="${contextName}" class="editor-keyboard-binding-panel__context-name uppercase text-center font-title text-base tracking-100 mt-8" filigree-style="none"></fxs-header>
				<div class="flow-row justify-center -mt-3 mb-3">
					<div class="img-unit-panel-divider -scale-y-100"></div>
					<div class="img-unit-panel-divider -scale-100"></div>
				</div>
				<div class="flow-row items-center">
					<div class="editor-keyboard-binding-panel__action-name flex-auto whitespace-nowrap font-fit-shrink font-title text-base text-accent-3 uppercase mr-16" data-l10n-id="${actionName}"></div>
					<div class="editor-keyboard-binding-panel__gesture-string font-base text-lg"></div>
				</div>
				<div class="font-title text-lg text-accent-2 uppercase text-center mt-6" data-l10n-id="LOC_UI_CONTROLLER_MAPPING_BIND_GESTURE"></div>
			</div>
		`;
  }
}
const EditorKeyboardBindingPanelTagName = "editor-keyboard-binding-panel";
Controls.define(EditorKeyboardBindingPanelTagName, {
  createInstance: EditorKeyboardBindingPanel,
  description: "Panel to bind a new gesture to an action.",
  classNames: [
    "editor-keyboard-binding-panel",
    "fullscreen",
    "flow-row",
    "justify-center",
    "items-center",
    "pointer-events-auto",
    "bg-black"
  ],
  attributes: [{ name: "node" }],
  tabIndex: -1
});
class EditorKeyboardButton extends FxsButton {
  _buttonNode;
  get editorControllerChooserNode() {
    return this._buttonNode;
  }
  set editorControllerChooserNode(value) {
    this._buttonNode = value;
  }
  isReadOnly = false;
  activateListener = this.onActivate.bind(this);
  onInitialize() {
    super.onInitialize();
    this.isReadOnly = UI.useReadOnlyInputMappingScreen();
    this.Root.classList.add("w-64", "mx-4");
  }
  onAttach() {
    super.onAttach();
    if (!this.isReadOnly) {
      engine.on("InputActionBinded", this.onInputActionBinded, this);
      this.Root.addEventListener(ActionActivateEventName, this.activateListener);
    }
  }
  onDetach() {
    if (!this.isReadOnly) {
      engine.off("InputActionBinded", this.onInputActionBinded, this);
      this.Root.removeEventListener(ActionActivateEventName, this.activateListener);
    }
    super.onDetach();
  }
  updateData() {
    const {
      context = InputContext.INVALID,
      actionID = 0,
      gestureIndex = 0
    } = this.editorControllerChooserNode ?? {};
    const actionDescription = Input.getActionDescription(actionID);
    let gestureString = Input.getGestureDisplayString(actionID, gestureIndex, InputDeviceType.Keyboard, context);
    if (!gestureString) {
      gestureString = Input.getGestureDisplayString(actionID, gestureIndex, InputDeviceType.Mouse, context);
    }
    this.Root.setAttribute("caption", gestureString ?? "");
    this.Root.setAttribute("data-tooltip-content", actionDescription);
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "node":
        this.editorControllerChooserNode = newValue ? JSON.parse(newValue) : null;
        this.updateData();
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
    }
  }
  onInputActionBinded({ context: bindedContext, actionId: bindedActionID }) {
    const { context = InputContext.INVALID, actionID = 0 } = this.editorControllerChooserNode ?? {};
    if ((context == InputContext.ALL || context == bindedContext) && actionID == bindedActionID) {
      this.updateData();
    }
  }
  onActivate({ target }) {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const {
      context = InputContext.INVALID,
      actionName = "",
      actionID = 0,
      gestureIndex = 0
    } = JSON.parse(target.getAttribute("node") ?? "") ?? {};
    const node = {
      context,
      actionName,
      actionID,
      gestureIndex
    };
    ContextManager.push("editor-keyboard-binding-panel", {
      singleton: true,
      attributes: { node: JSON.stringify(node), darker: true }
    });
  }
}
Controls.define("editor-keyboard-button", {
  createInstance: EditorKeyboardButton,
  description: "A button to be used with the editor keyboard screen",
  classNames: ["editor-keyboard-button", "fxs-button"],
  attributes: [
    { name: "node" },
    { name: "caption" },
    { name: "disabled" },
    { name: "index" },
    { name: "selected" },
    { name: "select-highlight" }
  ],
  tabIndex: -1
});

class EditorLanguageSelect extends Panel {
  displayList;
  audioList;
  acceptBtn;
  cancelBtn;
  closeBtn;
  mainSlot;
  /**
   * currentAudioIdx is the index of the audio language option that was selected when the screen was opened.
   */
  currentAudioIdx = Locale.getCurrentAudioLanguageOption();
  /**
   * currentDisplayIdx is the index of the display language option that was selected when the screen was opened.
   */
  currentDisplayIdx = Locale.getCurrentDisplayLanguageOption();
  selectedAudioIdx = this.currentAudioIdx;
  selectedDisplayIdx = this.currentDisplayIdx;
  get didChangeLanguage() {
    return this.selectedAudioIdx !== this.currentAudioIdx || this.selectedDisplayIdx !== this.currentDisplayIdx;
  }
  commitOnApply = this.Root.getAttribute("editor-commit-on-apply") === "true";
  engineInputListener = this.onEngineInput.bind(this);
  onInitialize() {
    this.render();
    super.onInitialize();
    this.Root.classList.add("absolute");
  }
  onAttach() {
    super.onAttach();
    this.acceptBtn.addEventListener("action-activate", this.onAcceptChanges);
    this.cancelBtn.addEventListener("action-activate", this.onCancelChanges);
    this.closeBtn.addEventListener("action-activate", this.onCancelChanges);
    this.displayList.addEventListener(ComponentValueChangeEventName, this.onDisplayLanguageChange);
    this.audioList.addEventListener(ComponentValueChangeEventName, this.onAudioLanguageChange);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
  }
  onDetach() {
    this.acceptBtn.removeEventListener("action-activate", this.onAcceptChanges);
    this.cancelBtn.removeEventListener("action-activate", this.onCancelChanges);
    this.closeBtn.removeEventListener("action-activate", this.onCancelChanges);
    this.displayList.removeEventListener(ComponentValueChangeEventName, this.onDisplayLanguageChange);
    this.audioList.removeEventListener(ComponentValueChangeEventName, this.onAudioLanguageChange);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.mainSlot);
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateSysMenu("LOC_GENERIC_ACCEPT");
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    let live = true;
    switch (event.detail.name) {
      case "cancel":
        this.close();
        live = false;
        break;
      case "sys-menu":
        this.applyChanges();
        live = false;
        break;
    }
    if (!live) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onAudioLanguageChange = (event) => {
    if (event.detail.isChecked) {
      this.selectedAudioIdx = parseInt(event.detail.value);
    }
  };
  onDisplayLanguageChange = (event) => {
    if (event.detail.isChecked) {
      this.selectedDisplayIdx = parseInt(event.detail.value);
    }
  };
  onAcceptChanges = (_event) => {
    this.applyChanges();
  };
  applyChanges() {
    const audioResult = Locale.changeAudioLanguageOption(this.selectedAudioIdx);
    const displayResult = Locale.changeDisplayLanguageOption(this.selectedDisplayIdx);
    const didChangeLanguage = this.selectedAudioIdx !== this.currentAudioIdx || this.selectedDisplayIdx !== this.currentDisplayIdx;
    let action = LanguageChangeFollowupAction.NoAction;
    switch (true) {
      case ((audioResult === LanguageChangeFollowupAction.RestartGame || displayResult === LanguageChangeFollowupAction.RestartGame) && didChangeLanguage):
        action = LanguageChangeFollowupAction.RestartGame;
        break;
      case ((audioResult === LanguageChangeFollowupAction.ReloadUI || displayResult === LanguageChangeFollowupAction.ReloadUI) && didChangeLanguage):
        action = LanguageChangeFollowupAction.ReloadUI;
        break;
      default:
        action = LanguageChangeFollowupAction.NoAction;
    }
    const closeCallback = () => ContextManager.pop(this.Root);
    switch (action) {
      case LanguageChangeFollowupAction.NoAction:
        closeCallback();
        break;
      case LanguageChangeFollowupAction.RestartGame:
        if (this.commitOnApply) {
          UI.commitApplicationOptions();
          ShowRestartGamePrompt(closeCallback);
        } else {
          Options.needRestartRefCount += 1;
          closeCallback();
        }
        break;
      case LanguageChangeFollowupAction.ReloadUI:
        if (this.commitOnApply) {
          UI.commitApplicationOptions();
          ShowReloadUIPrompt(closeCallback);
        } else {
          Options.needReloadRefCount += 1;
          closeCallback();
        }
        break;
    }
  }
  onCancelChanges = (_event) => {
    this.close();
  };
  renderLanguageOption(language, index, selected, group) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("flex", "flex-col");
    const option = document.createElement("div");
    option.className = "flex flex-row items-center justify-between";
    wrapper.appendChild(option);
    const optionLabel = document.createElement("div");
    optionLabel.className = "flex mr-4 font-body text-base";
    optionLabel.setAttribute("data-l10n-id", language);
    option.appendChild(optionLabel);
    const optionRadio = document.createElement("fxs-radio-button");
    optionRadio.setAttribute("data-audio-group-ref", "options");
    optionRadio.setAttribute("data-audio-activate-ref", "data-audio-language-radiobutton");
    optionRadio.setAttribute("value", index.toString());
    optionRadio.setAttribute("selected", selected.toString());
    optionRadio.setAttribute("group-tag", group);
    optionRadio.setAttribute("tabindex", "-1");
    option.appendChild(optionRadio);
    return wrapper;
  }
  render() {
    const audioLanguages = Locale.getAudioLanguageOptionNames();
    const displayLanguages = Locale.getDisplayLanguageOptionNames();
    const currentAudioLanguage = audioLanguages[this.currentAudioIdx];
    const currentDisplayLanguage = displayLanguages[this.currentDisplayIdx];
    this.Root.innerHTML = `
			<fxs-frame title="LOC_OPTIONS_LANGUAGE" subtitle="${CategoryData[CategoryType.Interface].title}">
				<fxs-hslot class="flex flex-row flex-auto mb-6 justify-center px-6 editor-language-select__section-container">
					<div class="flex flex-col flex-auto pr-14 ml-8">
						<div class="flex flex-row font-title mb-6 justify-center">
							<p class="flex font-title text-lg" data-l10n-id="LOC_OPTIONS_LANGUAGE_DISPLAY"></p>
							&nbsp;
							<p class="flex font-title text-lg" data-l10n-id="${currentDisplayLanguage}"></p>
						</div>
						<fxs-scrollable>
							<fxs-vslot class="pl-2 pr-6" language-list="display"></fxs-vslot>
						</fxs-scrollable>
					</div>
					<div class="flex flex-col flex-auto pr-14 ml-8">
						<div class="flex flex-row font-title mb-6 justify-center">
							<p class="flex font-title text-lg" data-l10n-id="LOC_OPTIONS_LANGUAGE_AUDIO"></p>
							&nbsp;
							<p class="flex font-title text-lg" data-l10n-id="${currentAudioLanguage}"></p>
						</div>
						<fxs-scrollable>
							<fxs-vslot class="pl-2 pr-6" language-list="audio"></fxs-vslot>
						</fxs-scrollable>
					</div>
				</fxs-hslot>
				<fxs-button-group class="mt-4" data-bind-if="!{{g_NavTray.isTrayRequired}}">
					<fxs-button id="editor-language-select__accept-button" caption="LOC_OPTIONS_ACCEPT" data-audio-group-ref="options" data-audio-activate="options-language-accept"></fxs-button>
					<fxs-button id="editor-language-select__cancel-button" caption="LOC_OPTIONS_CANCEL" data-audio-group-ref="options" data-audio-activate="options-language-cancel"></fxs-button>
				</fxs-button-group>
				<fxs-close-button></fxs-close-button>
			</fxs-frame>
		`;
    this.displayList = MustGetElement('[language-list="display"]', this.Root);
    this.audioList = MustGetElement('[language-list="audio"]', this.Root);
    this.acceptBtn = MustGetElement("#editor-language-select__accept-button", this.Root);
    this.cancelBtn = MustGetElement("#editor-language-select__cancel-button", this.Root);
    this.mainSlot = MustGetElement(".editor-language-select__section-container", this.Root);
    this.closeBtn = MustGetElement("fxs-close-button", this.Root);
    for (const [index, language] of displayLanguages.entries()) {
      const option = this.renderLanguageOption(language, index, index === this.selectedDisplayIdx, "display");
      this.displayList.appendChild(option);
    }
    for (const [index, language] of audioLanguages.entries()) {
      const option = this.renderLanguageOption(language, index, index === this.selectedAudioIdx, "audio");
      this.audioList.appendChild(option);
    }
  }
}
const EditorLanguageSelectTagName = "editor-language-select";
Controls.define(EditorLanguageSelectTagName, {
  createInstance: EditorLanguageSelect,
  attributes: [{ name: "title" }, { name: "subtitle" }]
});

const content = "<fxs-vslot class=\"editor-calibrate-hdr_main-content w-full h-full p-10 pt-14 items-center flex flex-col\">\r\n\t<div class=\"top-container flex w-full flex-row items-end justify-end\">\r\n\t\t<div class=\"editor-calibrate-hdr-ui-panel flex p-8 items-center\">\r\n\t\t\t<fxs-frame\r\n\t\t\t\tframe-style=\"f2\"\r\n\t\t\t\tclass=\"editor-calibrate-hdr_frame grow justify-center items-center\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-header title=\"LOC_OPTIONS_UI_HDR\"></fxs-header>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"relative flex flex-wrap font-body font-lg\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_OPTIONS_UI_HDR_DESCRIPTION\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"img-unit-panelbox relative flex my-5 p-3\">\r\n\t\t\t\t\t<div class=\"relative flex grow justify-center items-center mx-2\">\r\n\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\tclass=\"size-18 mr-4 relative\"\r\n\t\t\t\t\t\t\tdata-icon-id=\"NOTIFICATION_TECH_DISCOVERED\"\r\n\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t<div class=\"relative flex flex-col grow\">\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"relative flex font-title text-base uppercase\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UNIT_EXPLORER_NAME\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div class=\"relative flex\">\r\n\t\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\t\tclass=\"size-10 relative\"\r\n\t\t\t\t\t\t\t\t\tdata-icon-id=\"BUILDING_ACADEMY\"\r\n\t\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\t\tclass=\"size-10 relative\"\r\n\t\t\t\t\t\t\t\t\tdata-icon-id=\"IMPROVEMENT_PLANTATION\"\r\n\t\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"relative flex\">\r\n\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\tclass=\"size-4 relative\"\r\n\t\t\t\t\t\t\t\tdata-icon-id=\"YIELD_DIPLOMACY\"\r\n\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t<div class=\"font-title text-sm\">00</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"editor-calibrate-hdr-2nd-item img-unit-panelbox relative flex my-5 p-3 opacity-70\">\r\n\t\t\t\t\t<div class=\"relative flex grow justify-center items-center mx-2\">\r\n\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\tclass=\"size-18 mr-4 relative\"\r\n\t\t\t\t\t\t\tdata-icon-id=\"NOTIFICATION_TECH_DISCOVERED\"\r\n\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t<div class=\"relative flex flex-col grow\">\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"relative flex font-title text-base uppercase\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UNIT_EXPLORER_NAME\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div class=\"relative flex\">\r\n\t\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\t\tclass=\"size-10 relative\"\r\n\t\t\t\t\t\t\t\t\tdata-icon-id=\"BUILDING_ACADEMY\"\r\n\t\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\t\tclass=\"size-10 relative\"\r\n\t\t\t\t\t\t\t\t\tdata-icon-id=\"IMPROVEMENT_PLANTATION\"\r\n\t\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"relative flex\">\r\n\t\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\t\tclass=\"size-4 relative\"\r\n\t\t\t\t\t\t\t\tdata-icon-id=\"YIELD_DIPLOMACY\"\r\n\t\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t\t<div class=\"font-title text-sm\">00</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-frame>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"flex-auto\"></div>\r\n</fxs-vslot>\r\n";

const styles = "fs://game/core/ui/options/editors/calibrateHDR/editor-calibrate-hdr.css";

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
    hdrOptionPage.appendChild(centerBars);
    hdrOptionPage.appendChild(buttonContainer);
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
    ContextManager.push("screen-options", {
      singleton: true,
      createMouseGuard: true,
      attributes: { "selected-tab": "3" }
    });
    super.onDetach();
  }
  onReceiveFocus() {
    FocusManager.setFocus(this.contrastBar);
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

export { CategoryType as C, EditorCalibrateHDROpenedEventName as E, GetGroupLocKey as G, Options as O, ShowReloadUIPrompt as S, OptionType as a, CreateOptionComponent as b, ShowRestartGamePrompt as c, CategoryData as d, EditorCalibrateHDRClosedEventName as e };
//# sourceMappingURL=index.chunk.js.map
