import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

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
    SetIsPlotTooltipVisible(false);
  }
  exitView() {
    WorldUI.popFilter();
    Input.setClipCursorPaused(false);
    DisplayQueueManager.resume();
    SetIsPlotTooltipVisible(true);
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
  readInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "sys-menu":
      case "keyboard-escape":
      case "mousebutton-right":
      case "cancel":
        if (!DialogBoxManager.isDialogBoxOpen) {
          InterfaceMode.switchToDefault();
        } else {
          return true;
        }
        break;
    }
    return false;
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
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: false },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: false },
      { name: "world-input", type: UISystem.World, selectable: false },
      { name: "district-health-bars", type: UISystem.World, visible: "false" }
    ];
  }
}
ViewManager.addHandler(new PauseMenuView());

export { PauseMenuView };
//# sourceMappingURL=view-pause-menu.js.map
