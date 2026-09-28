import { ContextManager } from '../context-manager/context-manager.js';
import { InputHandlerState } from './input-support.js';
import { InterfaceMode } from '../interface-modes/interface-modes.js';
import SaveLoadData from '../save-load/model-save-load.js';
import { IsControllerActive } from '../../ui-next/services/input.js';

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
          return InputHandlerState.Handled;
        case "open-techs":
        case "open-civics":
        case "open-traditions":
        case "open-rankings":
        case "open-attributes":
        case "open-greatworks":
        case "open-civilopedia":
        case "open-advisors":
        case "open-legacies":
        case "open-religion":
        case "open-trade":
          this.sendHotkeyEvent(name);
          return InputHandlerState.Handled;
        case "unit-ranged-attack":
        case "unit-move":
        case "unit-skip-turn":
        case "unit-sleep":
        case "unit-heal":
        case "unit-fortify":
        case "unit-alert":
        case "unit-auto-explore":
          this.sendUnitHotkeyEvent(name);
          return InputHandlerState.Handled;
        case "quick-save":
          this.quickSave();
          return InputHandlerState.Handled;
        case "quick-load":
          this.quickLoad();
          return InputHandlerState.Handled;
        case "next-action":
        case "keyboard-enter":
          this.nextAction();
          return InputHandlerState.Handled;
        case "toggle-grid-layer":
        case "toggle-yields-layer":
        case "toggle-resources-layer":
        case "toggle-radial-measure-layer":
          this.sendLayerHotkeyEvent(name);
          return InputHandlerState.Handled;
        case "cycle-next":
        case "cycle-prev":
          this.sendCycleHotkeyEvent(name);
          return InputHandlerState.Handled;
      }
    }
    return InputHandlerState.Active;
  }
  /**
   * Hotkey manager doesn't handle navigation input events
   */
  handleNavigation() {
    return InputHandlerState.Active;
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
    } else if (!IsControllerActive() && Input.getActiveContext() == InputContext.World) {
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
//# sourceMappingURL=hotkey-manager.js.map
