import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { InputHandlerState } from '../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';

class PauseMenuView {
  getName() {
    return "PauseMenu";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "pause-menu";
  }
  enterView() {
    WorldUI.pushGaussianBlurFilter(10);
    Input.setClipCursorPaused(true);
  }
  exitView() {
    WorldUI.popFilter();
    Input.setClipCursorPaused(false);
    DisplayQueueManager.resume();
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  handleReceiveFocus() {
    UI.toggleGameCenterAccessPoint(true, UIGameCenterAccessPointLocation.BottomLeading);
    const pauseMenu = document.querySelector("#screen-pause-menu");
    if (pauseMenu) {
      FocusManager.get().setFocus(pauseMenu);
    }
    NavTray.clear();
  }
  handleInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return InputHandlerState.Active;
    }
    switch (inputEvent.detail.name) {
      case "sys-menu":
      case "keyboard-escape":
      case "mousebutton-right":
      case "cancel":
        if (!DialogBoxManager.isDialogBoxOpen) {
          InterfaceMode.switchToDefault();
        } else {
          return InputHandlerState.Active;
        }
        break;
    }
    return InputHandlerState.Handled;
  }
  handleLoseFocus() {
    UI.toggleGameCenterAccessPoint(false, UIGameCenterAccessPointLocation.BottomLeading);
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "false" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "false" },
      { name: "plot-tooltips", type: UISystem.World, visible: "false" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: false },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: false },
      { name: "plot-selection", type: UISystem.Events, selectable: false },
      { name: "world-input", type: UISystem.World, selectable: false },
      { name: "district-health-bars", type: UISystem.World, visible: "false" }
    ];
  }
}
ViewManager.addHandler(new PauseMenuView());

export { PauseMenuView };
//# sourceMappingURL=view-pause-menu.js.map
