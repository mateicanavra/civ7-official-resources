import { TtsManager } from '../../accessibility/tts-manager.js';
import { ActionActivateEventName } from '../../components/fxs-activatable.js';
import { FxsChooserItem } from '../../components/fxs-chooser-item.js';
import ContextManager from '../../context-manager/context-manager.js';
import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import ActionHandler from '../../input/action-handler.js';
import { Focus } from '../../input/focus-support.js';
import { ActiveDeviceTypeChangedEventName } from '../../input/input-events.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement, MustGetElements } from '../../utilities/utilities-dom.js';
import { Icon } from '../../utilities/utilities-image.js';
import { Layout } from '../../utilities/utilities-layout.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import editorControllerMappingStyles from './editor-controller-mapping.scss.js';
import styles from '../../../../base-standard/ui/chooser-item/chooser-item.scss.js';
import { DialogBoxAction } from '../../dialog-box/model-dialog-box.js';

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
					<div class="editor-controller-mapping__content flow-row flex-auto px-5 pb-14 size-full">
						<fxs-vslot class="editor-controller-mapping__action-list-container flex-2" data-bind-class-toggle="mb-2:!{{g_NavTray.isTrayRequired}}">
							<fxs-scrollable class="editor-controller-mapping__scrollable" handle-gamepad-pan="true">
								<div class="editor-controller-mapping__scrollable-content"></div>
							</fxs-scrollable>
						</fxs-vslot>
						<div class="editor-controller-mapping__controller-section flex-3 h-full flow-row justify-center items-center pointer-events-none">
							<div class="editor-controller-mapping__controller-content flex-auto relative flow-row w-full h-1\\/2">
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
    FocusManager.get().setFocus(this.actionListContainer);
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
    FocusManager.get().setFocus(this.Root);
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
  styles: [styles],
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
  styles: [styles],
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

export { ControllerMapActionElement, EditorControllerChooserItem, EditorControllerReadOnlyItem };
//# sourceMappingURL=editor-controller-mapping.js.map
