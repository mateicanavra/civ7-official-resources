import TooltipManager from './tooltip-manager.js';
import '../input/action-handler.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../input/focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import '../input/input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../input/plot-cursor.js';
import '../context-manager/context-manager.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../utilities/utilities-dom.chunk.js';
import '../utilities/utilities-layout.chunk.js';

class EmptyTooltipType {
  // Flip this bool to see the debugging tooltip information as you move the cursor around
  showDebugInformation = false;
  dummyElement = document.createElement("fxs-tooltip");
  getHTML() {
    return this.dummyElement;
  }
  reset() {
  }
  isUpdateNeeded(_target) {
    return false;
  }
  update() {
  }
  isBlank() {
    return true;
  }
}
TooltipManager.registerType("default", new EmptyTooltipType());
//# sourceMappingURL=default-tooltip.js.map
