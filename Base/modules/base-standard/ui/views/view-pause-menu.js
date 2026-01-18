import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

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
      FocusManager.setFocus(pauseMenu);
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
      { name: "plot-tooltips", type: UISystem.World, visible: "false" },
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
