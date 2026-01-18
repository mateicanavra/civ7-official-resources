import { V as ViewManager, U as UISystem } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class UnitView {
  getName() {
    return "Unit";
  }
  getInputContext() {
    return InputContext.Unit;
  }
  getHarnessTemplate() {
    return "world";
  }
  enterView() {
    ViewManager.getHarness()?.querySelector(".action-panel")?.classList.add("trigger-nav-help");
  }
  exitView() {
    ViewManager.getHarness()?.querySelector(".action-panel")?.classList.remove("trigger-nav-help");
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
      { name: "plot-vfx", type: UISystem.World, visible: "true" },
      { name: "unit-flags", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "true" },
      { name: "small-narratives", type: UISystem.World, visible: "true" },
      { name: "radial-selection", type: UISystem.Events, selectable: true }
    ];
  }
  handleReceiveFocus() {
    const unitInfoPanel = document.querySelector("unit-actions");
    if (unitInfoPanel) {
      unitInfoPanel.dispatchEvent(new CustomEvent("view-received-focus"));
    }
  }
}
ViewManager.addHandler(new UnitView());

export { UnitView };
//# sourceMappingURL=view-unit.js.map
