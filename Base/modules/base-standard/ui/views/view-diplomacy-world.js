import { InputHandlerState } from '../../../core/ui/input/input-support.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import { TooltipModel } from '../../../core/ui-next/components/tooltip-model.js';
import { setCityBannersDisabled } from '../../ui-next/screens/city-banners/city-banner-data.js';

class DiplomacyWorldView {
  canPlayExitSound = true;
  tooltipModel = TooltipModel.get();
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
    setCityBannersDisabled(true);
    LensManager.enableLayer("fxs-culture-borders-layer");
  }
  exitView() {
    setCityBannersDisabled(false);
    LensManager.disableLayer("fxs-culture-borders-layer");
    if (LensManager.isLayerEnabled("fxs-yields-layer")) {
      LensManager.toggleLayer("fxs-yields-layer", { serialize: false });
    }
    if (LensManager.isLayerEnabled("fxs-resource-layer")) {
      LensManager.toggleLayer("fxs-resource-layer", { serialize: false });
    }
    if (LensManager.isLayerEnabled("fxs-radial-measure-layer")) {
      LensManager.toggleLayer("fxs-radial-measure-layer", { serialize: false });
    }
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  handleInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return InputHandlerState.Active;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
      case "mousebutton-right":
        if (this.tooltipModel.locked()) {
          this.tooltipModel.unlockAll();
        }
        window.dispatchEvent(new CustomEvent("back-to-peace-deal"));
        return InputHandlerState.Handled;
      case "sys-menu":
        return InputHandlerState.Handled;
    }
    return InputHandlerState.Active;
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "true" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-tooltips", type: UISystem.World, visible: "true" },
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
