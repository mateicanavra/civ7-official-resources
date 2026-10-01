import { ContextManager } from '../../../core/ui/context-manager/context-manager.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/input-events.js';
import { InputHandlerState } from '../../../core/ui/input/input-support.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { IsMouseKeyboardActive, IsControllerActive } from '../../../core/ui-next/services/input.js';
import { RibbonStatsToggleStatus, DiploRibbonData, UpdateDiploRibbonEvent } from '../diplo-ribbon/model-diplo-ribbon.js';

class WorldView {
  deviceTypeChangedListener = this.onDeviceTypeChanged.bind(this);
  wasMouseKeyboard = IsMouseKeyboardActive();
  getName() {
    return "World";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "world";
  }
  enterView() {
    ViewManager.getHarness()?.classList.add("trigger-nav-help");
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.deviceTypeChangedListener);
  }
  exitView() {
    ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.deviceTypeChangedListener);
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "district-health-bars", type: UISystem.World, visible: "true" },
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-tooltips", type: UISystem.World, visible: "true" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "unit-flags", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "true" },
      { name: "small-narratives", type: UISystem.World, visible: "true" },
      { name: "world-anchor-texts", type: UISystem.World, visible: "true" },
      { name: "units", type: UISystem.Events, selectable: true },
      { name: "cities", type: UISystem.Events, selectable: true },
      { name: "radial-selection", type: UISystem.Events, selectable: true },
      { name: "plot-selection", type: UISystem.Events, selectable: true },
      { name: "world-input", type: UISystem.World, selectable: true }
    ];
  }
  handleLoseFocus() {
    ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    if (IsControllerActive()) {
      window.dispatchEvent(new CustomEvent("ui-hide-plot-vfx", { bubbles: false }));
    }
  }
  handleReceiveFocus() {
    NavTray.clear();
    FocusManager.get().clearFocus();
    ViewManager.getHarness()?.classList.add("trigger-nav-help");
    window.dispatchEvent(new CustomEvent("ui-show-plot-vfx", { bubbles: false }));
  }
  handleInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return InputHandlerState.Active;
    }
    if (!ContextManager.isEmpty) {
      return InputHandlerState.Active;
    }
    switch (inputEvent.detail.name) {
      case "toggle-diplo":
        DiploRibbonData.userDiploRibbonsToggled = DiploRibbonData.userDiploRibbonsToggled == RibbonStatsToggleStatus.RibbonStatsShowing ? RibbonStatsToggleStatus.RibbonStatsHidden : RibbonStatsToggleStatus.RibbonStatsShowing;
        window.dispatchEvent(new UpdateDiploRibbonEvent());
        return InputHandlerState.Handled;
      case "toggle-quest":
        const questList = document.querySelector("quest-list");
        questList?.component.listVisibilityToggle();
        return InputHandlerState.Handled;
      case "toggle-chat":
        const miniMap = document.querySelector(".mini-map");
        miniMap?.component.toggleChatPanel();
        return InputHandlerState.Handled;
      case "open-lens-panel":
        const miniMapComponent = document.querySelector(".mini-map");
        miniMapComponent?.component.toggleLensPanel();
        return InputHandlerState.Handled;
      case "navigate-yields":
        ContextManager.push("player-yields-report-screen", { singleton: true, createMouseGuard: true });
        return InputHandlerState.Handled;
      case "notification":
        window.dispatchEvent(new Event("focus-notifications"));
        return InputHandlerState.Handled;
    }
    return InputHandlerState.Active;
  }
  onDeviceTypeChanged(event) {
    if (!this.wasMouseKeyboard || !IsMouseKeyboardActive()) {
      if (event.detail.gamepadActive && !ContextManager.isEmpty) {
        window.dispatchEvent(new CustomEvent("ui-hide-plot-vfx"));
      } else {
        window.dispatchEvent(new CustomEvent("ui-show-plot-vfx"));
      }
      if (!event.detail.gamepadActive) {
        DiploRibbonData.userDiploRibbonsToggled = RibbonStatsToggleStatus.RibbonStatsHidden;
        window.dispatchEvent(new UpdateDiploRibbonEvent());
      }
    }
    this.wasMouseKeyboard = IsMouseKeyboardActive();
  }
}
ViewManager.addHandler(new WorldView());

export { WorldView };
//# sourceMappingURL=view-world.js.map
