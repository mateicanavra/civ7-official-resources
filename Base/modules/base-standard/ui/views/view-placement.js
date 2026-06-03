import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';

class PlacementView {
  getName() {
    return "Placement";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "placement";
  }
  enterView() {
    UI.lockCursor(true);
  }
  exitView() {
    UI.lockCursor(false);
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
      { name: "plot-icons", type: UISystem.World, visible: "true" },
      { name: "plot-tooltips", type: UISystem.World, visible: "true" },
      { name: "plot-vfx", type: UISystem.World, visible: "true" },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" }
    ];
  }
}
ViewManager.addHandler(new PlacementView());

export { PlacementView };
//# sourceMappingURL=view-placement.js.map
