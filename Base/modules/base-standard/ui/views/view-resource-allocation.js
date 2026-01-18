import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class ResourceAllocationView {
  /// IGameView
  getName() {
    return "ResourceAllocation";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "resource-allocation";
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
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "district-health-bars", type: UISystem.World, visible: "true" },
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
    const screen = document.querySelector("screen-resource-allocation");
    if (screen) {
      screen.dispatchEvent(new CustomEvent("view-receive-focus"));
    } else {
      console.error(
        "view-resource-allocation: View received focus but failed to find screen-resource-allocation!"
      );
    }
  }
  handleLoseFocus() {
    const screen = document.querySelector("screen-resource-allocation");
    if (screen) {
      screen.dispatchEvent(new CustomEvent("view-lose-focus"));
    } else {
      console.error("view-resource-allocation: View lost focus but failed to find screen-resource-allocation!");
    }
  }
}
ViewManager.addHandler(new ResourceAllocationView());

export { ResourceAllocationView };
//# sourceMappingURL=view-resource-allocation.js.map
