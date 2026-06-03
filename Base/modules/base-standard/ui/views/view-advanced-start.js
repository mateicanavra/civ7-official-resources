import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class AdvancedStartView {
  getName() {
    return "AdvancedStart";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "";
  }
  enterView() {
    SetIsPlotTooltipVisible(false);
  }
  exitView() {
    SetIsPlotTooltipVisible(true);
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "false" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "district-health-bars", type: UISystem.World, visible: "true" },
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "unit-flags", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: false },
      { name: "cities", type: UISystem.Events, selectable: false }
    ];
  }
}
ViewManager.addHandler(new AdvancedStartView());

export { AdvancedStartView };
//# sourceMappingURL=view-advanced-start.js.map
