import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class CinematicView {
  getName() {
    return "Cinematic";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "cinematic";
  }
  enterView() {
    WorldUI.setUnitVisibility(false);
  }
  exitView() {
    WorldUI.setUnitVisibility(true);
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "false" },
      { name: "city-banners", type: UISystem.World, visible: "false" },
      { name: "district-health-bars", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "false" },
      { name: "plot-tooltips", type: UISystem.World, visible: "false" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: true },
      { name: "cities", type: UISystem.Events, selectable: false }
    ];
  }
}
ViewManager.addHandler(new CinematicView());

export { CinematicView };
//# sourceMappingURL=view-cinematic.js.map
