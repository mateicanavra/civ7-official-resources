import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class AgeTransitionView {
  getName() {
    return "AgeTransition";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "age-transition";
  }
  enterView() {
    WorldUI.pushGaussianBlurFilter(5);
    Input.setClipCursorPaused(true);
    SetIsPlotTooltipVisible(false);
  }
  exitView() {
    engine.call("setSnapshotEnabled", false);
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
ViewManager.addHandler(new AgeTransitionView());

export { AgeTransitionView };
//# sourceMappingURL=view-age-transition.js.map
