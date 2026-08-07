import ActionHandler from '../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { Icon } from '../utilities/utilities-image.js';
import UpdateGate from '../utilities/utilities-update-gate.js';

var NavigationTrayOrientation = /* @__PURE__ */ ((NavigationTrayOrientation2) => {
  NavigationTrayOrientation2[NavigationTrayOrientation2["Column"] = 0] = "Column";
  NavigationTrayOrientation2[NavigationTrayOrientation2["Row"] = 1] = "Row";
  return NavigationTrayOrientation2;
})(NavigationTrayOrientation || {});
const PS4_OPTIONS_TEXT = "OPTIONS";
const PS4_SHARE_TEXT = "SHARE";
const mapIconToText = {
  ps4_icon_start: PS4_OPTIONS_TEXT,
  ps4_icon_share: PS4_SHARE_TEXT
};
const gameActionTrayPosition = {
  accept: 0,
  // bottom face button
  "camera-pan": 0,
  "camera-zoom-out": 0,
  "camera-zoom-in": 0,
  cancel: -1,
  // cancel (right face button) should always be at the left
  "center-plot-cursor": 0,
  "focus-plot-cursor": 0,
  "nav-beam": 0,
  "nav-down": 0,
  "nav-left": 0,
  "nav-move": 0,
  "nav-next": 0,
  "nav-previous": 0,
  "nav-right": 0,
  "nav-shell-previous": 0,
  "nav-shell-next": 0,
  "nav-up": 0,
  "navigate-yields": 0,
  "next-action": 0,
  notification: 0,
  "open-lens-panel": 0,
  "scroll-pan": 0,
  "shell-action-1": 1,
  // left face button
  "shell-action-2": 2,
  // top face button
  "shell-action-3": 0,
  "shell-action-5": 0,
  "swap-plot-selection": 0,
  "sys-menu": 0,
  "toggle-chat": 0,
  "toggle-diplo": 0,
  "toggle-quest": 0,
  "toggle-radial-menu": 0,
  "toggle-tooltip": 0
};
class NavigationTrayModel {
  // Will be connected to the input system.
  isGamepadActive = false;
  inputContextWorld = false;
  activeDeviceTypeListener = (event) => {
    this.onActiveDeviceTypeChanged(event);
  };
  /** List of actions keyed by the input action with a list of loc keys to display, most recently added is displayed */
  actionStacks = [];
  /**
   * Persistent entries that are not cleared by {@link clear}.
   * Regular entries in actionStacks take priority over persistent ones for the same action.
   */
  persistentActionStacks = [];
  entries = [];
  // Acts as a map with NavigationTrayEntry.icon as unique keys
  onUpdate;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  constructor() {
    engine.whenReady.then(() => {
      this.isGamepadActive = ActionHandler.isGamepadActive;
      window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
      engine.on("InputContextChanged", this.onActiveContextChanged, this);
      engine.on("InputActionBinded", this.onInputActionBinded, this);
      engine.on("InputContextChanged", this.onInputContextChanged, this);
    });
  }
  get isTrayRequired() {
    return this.isGamepadActive;
  }
  get isTrayActive() {
    return this.isTrayRequired && !this.isEmpty();
  }
  get isInputWorld() {
    return this.inputContextWorld;
  }
  isEmpty() {
    return this.entries.length == 0;
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  addOrUpdateGenericAccept() {
    this.addOrUpdateAccept("LOC_GENERIC_ACCEPT");
  }
  removeGenericAccept() {
    this.removeAccept();
  }
  addOrUpdateGenericOK() {
    this.addOrUpdateAccept("LOC_GENERIC_OK");
  }
  removeGenericOK() {
    this.removeAccept();
  }
  addOrUpdateGenericSelect() {
    this.addOrUpdateAccept("LOC_GENERIC_SELECT");
  }
  addOrUpdateGenericDeselect() {
    this.addOrUpdateAccept("LOC_GENERIC_DESELECT");
  }
  removeGenericSelect() {
    this.removeAccept();
  }
  addOrUpdateGenericBack() {
    this.addOrUpdateCancel("LOC_GENERIC_BACK");
  }
  removeGenericBack() {
    this.removeCancel();
  }
  addOrUpdateGenericCancel() {
    this.addOrUpdateCancel("LOC_GENERIC_CANCEL");
  }
  removeGenericCancel() {
    this.removeCancel();
  }
  addOrUpdateGenericClose() {
    this.addOrUpdateCancel("LOC_GENERIC_CLOSE");
  }
  removeGenericClose() {
    this.removeCancel();
  }
  //---
  addOrUpdateAccept(key) {
    this.addOrUpdateEntry(key, "accept");
  }
  removeAccept() {
    this.removeEntry("accept");
  }
  addOrUpdateCancel(key) {
    this.addOrUpdateEntry(key, "cancel");
  }
  removeCancel() {
    this.removeEntry("cancel");
  }
  addOrUpdateShellAction1(key) {
    this.addOrUpdateEntry(key, "shell-action-1");
  }
  removeShellAction1() {
    this.removeEntry("shell-action-1");
  }
  addOrUpdateShellAction2(key) {
    this.addOrUpdateEntry(key, "shell-action-2");
  }
  removeShellAction2() {
    this.removeEntry("shell-action-2");
  }
  addOrUpdateShellAction3(key) {
    this.addOrUpdateEntry(key, "shell-action-3");
  }
  removeShellAction3() {
    this.removeEntry("shell-action-3");
  }
  addOrUpdateNextAction(key) {
    this.addOrUpdateEntry(key, "next-action");
  }
  removeNextAction() {
    this.removeEntry("next-action");
  }
  addOrUpdateNavPrevious(key) {
    this.addOrUpdateEntry(key, "nav-previous");
  }
  removeNavPrevious() {
    this.removeEntry("nav-previous");
  }
  addOrUpdateNavNext(key) {
    this.addOrUpdateEntry(key, "nav-next");
  }
  removeNavNext() {
    this.removeEntry("nav-next");
  }
  addOrUpdateNavShellPrevious(key) {
    this.addOrUpdateEntry(key, "nav-shell-previous");
  }
  removeNavShellPrevious() {
    this.removeEntry("nav-shell-previous");
  }
  addOrUpdateNavShellNext(key) {
    this.addOrUpdateEntry(key, "nav-shell-next");
  }
  removeNavShellNext() {
    this.removeEntry("nav-shell-next");
  }
  addOrUpdateNavMove(key) {
    this.addOrUpdateEntry(key, "nav-move");
  }
  removeNavMove() {
    this.removeEntry("nav-move");
  }
  addOrUpdateNavBeam(key) {
    this.addOrUpdateEntry(key, "nav-beam");
  }
  removeNavBeam() {
    this.removeEntry("nav-beam");
  }
  addOrUpdateToggleTooltip(key) {
    this.addOrUpdateEntry(key, "toggle-tooltip");
  }
  removeToggleTooltip() {
    this.removeEntry("toggle-tooltip");
  }
  /**
   * Add or update a persistent entry that survives {@link clear} calls.
   * Regular entries added via {@link addOrUpdateEntry} take priority over persistent entries for the same action.
   */
  addPersistentEntry(key, action) {
    const { actionStack } = this.getPersistentActionStack(action);
    if (actionStack) {
      actionStack.locKeys.push(key);
    } else {
      this.persistentActionStacks.push({ action, locKeys: [key] });
    }
    this.updateGate.call("addPersistentEntry");
  }
  /**
   * Remove the most recently added persistent entry for the given action.
   * If no persistent entries remain for the action, it is removed from the persistent list.
   */
  removePersistentEntry(action) {
    const { actionStack, actionStackIndex } = this.getPersistentActionStack(action);
    if (actionStack) {
      actionStack.locKeys.pop();
      if (actionStack.locKeys.length === 0) {
        this.persistentActionStacks.splice(actionStackIndex, 1);
      }
    }
    this.updateGate.call("removePersistentEntry");
  }
  addOrUpdateCameraPan(key) {
    this.addOrUpdateEntry(key, "camera-pan");
  }
  removeCameraPan() {
    this.removeEntry("camera-pan");
  }
  addOrUpdateSysMenu(key) {
    this.addOrUpdateEntry(key, "sys-menu");
  }
  addOrUpdateCenterPlotCursor(key) {
    this.addOrUpdateEntry(key, "center-plot-cursor");
  }
  addOrUpdateNotification(key) {
    this.addOrUpdateEntry(key, "notification");
  }
  removeSysMenu() {
    this.removeEntry("sys-menu");
  }
  getActionStack(action) {
    const stackIndex = this.actionStacks.findIndex((stack) => stack.action === action);
    if (stackIndex === -1) {
      return { actionStackIndex: -1 };
    }
    return { actionStack: this.actionStacks[stackIndex], actionStackIndex: stackIndex };
  }
  getPersistentActionStack(action) {
    const stackIndex = this.persistentActionStacks.findIndex((stack) => stack.action === action);
    if (stackIndex === -1) {
      return { actionStackIndex: -1 };
    }
    return { actionStack: this.persistentActionStacks[stackIndex], actionStackIndex: stackIndex };
  }
  addOrUpdateEntry(key, action) {
    const { actionStack } = this.getActionStack(action);
    if (actionStack) {
      actionStack.locKeys.push(key);
    } else {
      this.actionStacks.push({ action, locKeys: [key] });
    }
    this.updateGate.call("addOrUpdateEntry");
  }
  removeEntry(action) {
    const { actionStack, actionStackIndex } = this.getActionStack(action);
    if (actionStack) {
      actionStack.locKeys.pop();
      if (actionStack.locKeys.length === 0) {
        this.actionStacks.splice(actionStackIndex, 1);
      }
    }
    this.updateGate.call("removeEntry");
  }
  clear() {
    this.actionStacks = [];
    this.updateGate.call("clear");
  }
  update() {
    const combinedStacks = [...this.persistentActionStacks];
    for (const stack of this.actionStacks) {
      const existingIdx = combinedStacks.findIndex((s) => s.action === stack.action);
      if (existingIdx >= 0) {
        combinedStacks[existingIdx] = stack;
      } else {
        combinedStacks.push(stack);
      }
    }
    combinedStacks.sort((stackA, stackB) => {
      const priorityA = gameActionTrayPosition[stackA.action];
      const priorityB = gameActionTrayPosition[stackB.action];
      if (priorityA - priorityB === 0) {
        return Locale.compare(stackB.action, stackA.action);
      }
      return priorityA - priorityB;
    });
    this.entries = [];
    for (const actionStack of combinedStacks) {
      const icon = Icon.getIconFromActionName(actionStack.action, InputDeviceType.Controller);
      if (!icon) {
        console.error(
          "model-navigation-tray: update(): Invalid icon to add this entry (action: " + actionStack.action + ")"
        );
        continue;
      }
      let text = "";
      if (["ps4_icon_start", "ps4_icon_share"].includes(icon)) {
        text = mapIconToText[icon] ?? "";
      }
      this.entries.push({
        description: Locale.compose(actionStack.locKeys[actionStack.locKeys.length - 1]),
        icon,
        text,
        action: actionStack.action
      });
    }
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  onActiveDeviceTypeChanged(event) {
    this.isGamepadActive = event.detail?.gamepadActive;
    this.updateGate.call("onActiveDeviceTypeChanged");
  }
  onActiveContextChanged() {
    this.updateGate.call("onActiveContextChanged");
  }
  onInputActionBinded() {
    this.updateGate.call("onInputActionBinded");
  }
  onInputContextChanged(contextData) {
    this.inputContextWorld = contextData.newContext == InputContext.World;
  }
}
const NavTray = new NavigationTrayModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(NavTray);
  };
  engine.createJSModel("g_NavTray", NavTray);
  NavTray.updateCallback = updateModel;
  engine.synchronizeModels();
});

export { NavigationTrayOrientation, NavTray as default };
//# sourceMappingURL=model-navigation-tray.js.map
