import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

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
  }
  exitView() {
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
      { name: "plot-tooltips", type: UISystem.World, visible: "false" },
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
