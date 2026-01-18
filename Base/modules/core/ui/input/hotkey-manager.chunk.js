import ContextManager from '../context-manager/context-manager.js';
import ActionHandler from './action-handler.js';
import { InterfaceMode } from '../interface-modes/interface-modes.js';
import { S as SaveLoadData } from '../save-load/model-save-load.chunk.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../framework.chunk.js';
import './cursor.js';
import './focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import './input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';

class UnitHotkeyEvent extends CustomEvent {
  constructor(eventName) {
    super("unit-hotkey", { detail: { name: eventName }, bubbles: false });
  }
}
class LayerHotkeyEvent extends CustomEvent {
  constructor(eventName) {
    super("layer-hotkey", { detail: { name: eventName }, bubbles: false });
  }
}
class HotkeyManagerSingleton {
  static Instance;
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!HotkeyManagerSingleton.Instance) {
      HotkeyManagerSingleton.Instance = new HotkeyManagerSingleton();
    }
    return HotkeyManagerSingleton.Instance;
  }
  /**
   * Handles touch inputs
   * @param {InputEngineEvent} inputEvent An input event
   * @returns true if the input is still "live" and not yet cancelled.
   * @implements InputEngineEvent
   */
  handleInput(inputEvent) {
    const status = inputEvent.detail.status;
    if (status == InputActionStatuses.FINISH) {
      const name = inputEvent.detail.name;
      switch (name) {
        case "toggle-frame-stats":
          Input.toggleFrameStats();
          return false;
        case "open-techs":
        case "open-civics":
        case "open-traditions":
        case "open-rankings":
        case "open-attributes":
        case "open-greatworks":
        case "open-civilopedia":
          this.sendHotkeyEvent(name);
          return false;
        case "unit-ranged-attack":
        case "unit-move":
        case "unit-skip-turn":
        case "unit-sleep":
        case "unit-heal":
        case "unit-fortify":
        case "unit-alert":
        case "unit-auto-explore":
          this.sendUnitHotkeyEvent(name);
          return false;
        case "quick-save":
          this.quickSave();
          return false;
        case "quick-load":
          this.quickLoad();
          return false;
        case "next-action":
        case "keyboard-enter":
          this.nextAction();
          return false;
        case "toggle-grid-layer":
        case "toggle-yields-layer":
        case "toggle-resources-layer":
          this.sendLayerHotkeyEvent(name);
          return false;
        case "cycle-next":
        case "cycle-prev":
          this.sendCycleHotkeyEvent(name);
          return false;
      }
    }
    return true;
  }
  /**
   * Hotkey manager doesn't handle navigation input events
   */
  handleNavigation() {
    return true;
  }
  /**
   * Sends out an event to window in the style of 'hotkey-{input action name}'
   * @param {String} inputActionName Name of the input action to be appended to 'hotkey-'
   */
  sendHotkeyEvent(inputActionName) {
    if (InterfaceMode.allowsHotKeys()) {
      window.dispatchEvent(new CustomEvent("hotkey-" + inputActionName));
    }
  }
  /**
   * Sends out an event to window for unit interaction hotkeys
   * @param {UnitHotkeyEventName} inputActionName Name of the unit interaction hotkey send through the detail parameter
   */
  sendUnitHotkeyEvent(inputActionName) {
    window.dispatchEvent(new UnitHotkeyEvent(inputActionName));
  }
  /**
   * Sends a cycle hotkey event out based on input context
   * @param inputActionName
   */
  sendCycleHotkeyEvent(inputActionName) {
    if (Input.getActiveContext() == InputContext.Unit) {
      this.sendUnitHotkeyEvent(inputActionName);
    } else if (InterfaceMode.getCurrent() == "INTERFACEMODE_CITY_PRODUCTION") {
      window.dispatchEvent(new CustomEvent(`hotkey-${inputActionName}-city`));
    } else if (!ActionHandler.isGamepadActive && Input.getActiveContext() == InputContext.World) {
      this.sendUnitHotkeyEvent(inputActionName);
    }
  }
  /**
   * Saves a locally store quick save using basic params
   */
  quickSave() {
    if (ContextManager.canSaveGame() && !ContextManager.hasInstanceOf("screen-save-load")) {
      SaveLoadData.handleQuickSave();
    }
  }
  /**
   * Loads the locally store quick save using basic params
   */
  quickLoad() {
    if (ContextManager.canLoadGame() && !UI.isMultiplayer() && !ContextManager.hasInstanceOf("screen-save-load")) {
      SaveLoadData.handleQuickLoad();
    }
  }
  nextAction() {
    if (InterfaceMode.allowsHotKeys() && !ContextManager.getTarget("mouse-guard"))
      window.dispatchEvent(new CustomEvent("hotkey-next-action"));
  }
  sendLayerHotkeyEvent(inputActionName) {
    window.dispatchEvent(new LayerHotkeyEvent(inputActionName));
  }
}
const HotkeyManager = HotkeyManagerSingleton.getInstance();

export { LayerHotkeyEvent, UnitHotkeyEvent, HotkeyManager as default };
//# sourceMappingURL=hotkey-manager.chunk.js.map
