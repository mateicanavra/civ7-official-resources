import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { c as QuickSaveDoneEventName } from '../../../core/ui/save-load/model-save-load.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

const styles = "fs://game/base-standard/ui/quick-save-indicator/quick-save-indicator.css";

class QuickSaveIndicator extends Panel {
  onQuickSave = this.createQuickSaveIndicator.bind(this);
  onAttach() {
    super.onAttach();
    window.addEventListener(QuickSaveDoneEventName, this.onQuickSave);
  }
  onDetach() {
    window.removeEventListener(QuickSaveDoneEventName, this.onQuickSave);
    super.onDetach();
  }
  createQuickSaveIndicator() {
    const previousQuickSaveIndicator = this.Root.querySelector(".save-container");
    if (previousQuickSaveIndicator) {
      this.Root.removeChild(previousQuickSaveIndicator);
    }
    const itemContainer = document.createElement("div");
    itemContainer.classList.add("save-container", "save-animation");
    const itemElement = document.createElement("div");
    itemElement.classList.add("save-item");
    itemContainer.appendChild(itemElement);
    const itemIcon = document.createElement("div");
    itemIcon.classList.add("save-icon");
    itemElement.appendChild(itemIcon);
    const itemInfo = document.createElement("div");
    itemInfo.classList.add("save-info");
    itemElement.appendChild(itemInfo);
    const itemTitle = document.createElement("div");
    itemTitle.classList.add("save-title");
    itemTitle.innerHTML = Locale.compose("LOC_QUICK_SAVE_INDICATOR_TITLE");
    itemInfo.appendChild(itemTitle);
    const itemDescription = document.createElement("div");
    itemDescription.classList.add("save-description");
    itemDescription.innerHTML = Locale.compose("LOC_QUICK_SAVE_INDICATOR_DESCRIPTION", "LOC_QUICK_SAVE_NAME");
    itemInfo.appendChild(itemDescription);
    this.Root.appendChild(itemContainer);
  }
}
Controls.define("quick-save-indicator", {
  createInstance: QuickSaveIndicator,
  description: "Indicator when a quick save happens",
  classNames: ["quick-save"],
  styles: [styles]
});
//# sourceMappingURL=quick-save-indicator.js.map
