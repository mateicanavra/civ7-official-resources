import TooltipManager from '../tooltips/tooltip-manager.js';
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

class TtsManagerTooltipExtension {
  getActiveTooltip(self, addText) {
    const curTooltip = TooltipManager.currentTooltip;
    if (curTooltip) {
      addText(self.getElementInnerText(curTooltip));
      return true;
    }
    return false;
  }
  checkGlobal(self, addText) {
    return this.getActiveTooltip(self, addText);
  }
  checkElement(self, element, addText) {
    if (element.hasAttribute("data-tooltip-style")) {
      return this.getActiveTooltip(self, addText);
    }
    return false;
  }
}

export { TtsManagerTooltipExtension };
//# sourceMappingURL=tts-manager-tooltip-extension.chunk.js.map
