import { U as UISystem, V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

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
  }
  /// IGameView
  exitView() {
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
      { name: "plot-tooltips", type: UISystem.World, visible: "false" },
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
