import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

const FocusCityViewEventName = "focus-city-view";
class FocusCityViewEvent extends CustomEvent {
  constructor(detail) {
    super(FocusCityViewEventName, { bubbles: false, detail });
  }
}
class CityView {
  /// IGameView
  getName() {
    return "City";
  }
  getInputContext() {
    return InputContext.Dual;
  }
  getHarnessTemplate() {
    return "city";
  }
  /// IGameView
  enterView() {
  }
  /// IGameView
  exitView() {
  }
  /// IGameView
  addEnterCallback(_func) {
  }
  /// IGameView
  addExitCallback(_func) {
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  readInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.type != InputEngineEventName) {
      console.warn(
        `VM: Attempt to handle engine input event failed since '${inputEvent.type}' is not '${InputEngineEventName}'.`
      );
      return true;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      InterfaceMode.switchToDefault();
      return false;
    }
    return true;
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "false" },
      { name: "district-health-bars", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-tooltips", type: UISystem.World, visible: "true" },
      { name: "plot-vfx", type: UISystem.World, visible: "true" },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: false }
    ];
  }
  handleReceiveFocus() {
    let panelName = "";
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_CITY_PURCHASE":
      case "INTERFACEMODE_CITY_PRODUCTION":
        const selectedCityID = UI.Player.getHeadSelectedCity();
        if (!selectedCityID) {
          return;
        }
        const city = Cities.get(selectedCityID);
        if (!city) {
          return;
        }
        if (city.isJustConqueredFrom || city.isBeingRazed) {
          panelName = "panel-city-capture-chooser";
        } else {
          panelName = "panel-production-chooser";
        }
        break;
      default:
        console.error("view-city: view received focus but interface mode is not handled");
    }
    if (panelName) {
      const panel = document.querySelector(panelName);
      if (panel) {
        panel.dispatchEvent(new CustomEvent("view-receive-focus"));
      } else {
        console.error(`view-city: handleReceiveFocus could not find panel "${panelName}"`);
      }
    }
  }
  handleLoseFocus() {
    const screen = document.querySelector("panel-production-chooser");
    if (screen) {
      screen.dispatchEvent(new CustomEvent("view-lose-focus"));
    } else {
      console.error("view-city: View lost focus but failed to find panel-production-chooser!");
    }
  }
}
ViewManager.addHandler(new CityView());

export { CityView, FocusCityViewEvent, FocusCityViewEventName };
//# sourceMappingURL=view-city.js.map
