import TooltipManager from './tooltip-manager.js';

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
