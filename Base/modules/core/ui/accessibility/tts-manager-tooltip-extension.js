import TooltipManager from '../tooltips/tooltip-manager.js';

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
//# sourceMappingURL=tts-manager-tooltip-extension.js.map
