import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class UnitPromotionView {
  getName() {
    return "UnitPromotion";
  }
  getInputContext() {
    return InputContext.Dual;
  }
  getHarnessTemplate() {
    return "unit-promotion";
  }
  enterView() {
    SetIsPlotTooltipVisible(false);
  }
  exitView() {
    SetIsPlotTooltipVisible(true);
  }
  handleReceiveFocus() {
    const promotionPanel = document.querySelector("panel-unit-promotion");
    if (promotionPanel) {
      promotionPanel.dispatchEvent(new CustomEvent("view-receive-focus"));
    }
  }
  handleLoseFocus() {
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "false" },
      { name: "district-health-bars", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "false" },
      { name: "plot-vfx", type: UISystem.World, visible: "true" },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "unit-info-panel", type: UISystem.World, visible: "true" },
      { name: "world", type: UISystem.Events, selectable: false }
    ];
  }
}
ViewManager.addHandler(new UnitPromotionView());

export { UnitPromotionView };
//# sourceMappingURL=view-unit-promotion.js.map
