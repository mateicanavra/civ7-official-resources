import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { V as ViewManager, U as UISystem } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class ScreenshotView {
  getName() {
    return "Screenshot";
  }
  getInputContext() {
    return InputContext.World;
  }
  getHarnessTemplate() {
    return "";
  }
  // TODO add a proper harness template
  enterView() {
    this.populateHarness();
  }
  // TODO: replace with proper view harness swapping
  populateHarness() {
    const harness = ViewManager.getHarness();
    if (harness == null) {
      console.error("View screenshot: Unable to obtain harness!");
      return;
    }
    FocusManager.setFocus(this.addButtonTo(harness, ".top.left", "foo"));
    this.addButtonTo(harness, ".top.center", "bar");
    const quitButton = this.addButtonTo(harness, ".top.right", "Quit");
    quitButton.addEventListener("action-activate", () => {
      InterfaceMode.switchToDefault();
    });
  }
  addButtonTo(harness, classNamesString, caption) {
    const button = document.createElement("fxs-button");
    button.setAttribute("caption", caption);
    const slot = harness.querySelector(classNamesString);
    if (slot) {
      slot.appendChild(button);
    } else {
      console.error("view-screenshot: addButtonTo() : Missing slot with '" + classNamesString + "'");
    }
    return button;
  }
  exitView() {
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
      { name: "small-narratives", type: UISystem.World, visible: "true" }
    ];
  }
}
ViewManager.addHandler(new ScreenshotView());

export { ScreenshotView };
//# sourceMappingURL=view-screenshot.js.map
