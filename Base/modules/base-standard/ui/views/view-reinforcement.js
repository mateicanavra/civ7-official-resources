import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class ReinforcementView {
  /// IGameView
  getName() {
    return "Reinforcement";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "";
  }
  /// IGameView
  enterView() {
    SetIsPlotTooltipVisible(false);
  }
  /// IGameView
  exitView() {
    SetIsPlotTooltipVisible(true);
  }
  /// IGameView
  addEnterCallback(_func) {
  }
  /// IGameView
  addExitCallback(_func) {
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "false" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "district-health-bars", type: UISystem.World, visible: "true" },
      { name: "plot-icons", type: UISystem.World, visible: "false" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "unit-flags", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: true }
    ];
  }
}
ViewManager.addHandler(new ReinforcementView());

export { ReinforcementView };
//# sourceMappingURL=view-reinforcement.js.map
