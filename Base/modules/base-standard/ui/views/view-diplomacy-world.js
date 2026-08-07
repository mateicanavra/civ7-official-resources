import LensManager from '../../../core/ui/lenses/lens-manager.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class DiplomacyWorldView {
  canPlayExitSound = true;
  getName() {
    return "DiplomacyWorld";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "";
  }
  enterView() {
    this.canPlayExitSound = true;
    SetIsPlotTooltipVisible(true);
    window.dispatchEvent(new CustomEvent("ui-disable-city-banners"));
    LensManager.enableLayer("fxs-culture-borders-layer");
  }
  exitView() {
    SetIsPlotTooltipVisible(false);
    window.dispatchEvent(new CustomEvent("ui-enable-city-banners"));
    LensManager.disableLayer("fxs-culture-borders-layer");
    if (LensManager.isLayerEnabled("fxs-yields-layer")) {
      LensManager.toggleLayer("fxs-yields-layer", { serialize: false });
    }
    if (LensManager.isLayerEnabled("fxs-resource-layer")) {
      LensManager.toggleLayer("fxs-resource-layer", { serialize: false });
    }
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  readInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
      case "mousebutton-right":
        window.dispatchEvent(new CustomEvent("back-to-peace-deal"));
        return false;
    }
    return true;
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: false },
      { name: "unit-flags", type: UISystem.World, visible: "true" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: false },
      { name: "world-input", type: UISystem.World, selectable: true },
      { name: "district-health-bars", type: UISystem.World, visible: "true" },
      { name: "cities", type: UISystem.Events, selectable: false }
    ];
  }
}
ViewManager.addHandler(new DiplomacyWorldView());

export { DiplomacyWorldView };
//# sourceMappingURL=view-diplomacy-world.js.map
