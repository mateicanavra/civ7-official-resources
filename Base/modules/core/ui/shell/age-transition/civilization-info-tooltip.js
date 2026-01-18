import TooltipManager from '../../tooltips/tooltip-manager.js';
import { RecursiveGetAttribute } from '../../utilities/utilities-dom.chunk.js';
import '../../input/action-handler.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../input/focus-manager.js';
import '../../audio-base/audio-support.chunk.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../input/plot-cursor.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../utilities/utilities-layout.chunk.js';

class CivilizationInfoTooltipModelImpl {
  _civData = [];
  get civData() {
    return this._civData;
  }
  set civData(value) {
    this._civData = value;
  }
  clear() {
    this._civData = [];
  }
}
class CivilizationInfoTooltip {
  tooltip = document.createElement("fxs-tooltip");
  tooltipContents = document.createElement("div");
  civIndex = "";
  civIcon = document.createElement("div");
  civName = document.createElement("fxs-header");
  civTraits = document.createElement("div");
  historicalReason = document.createElement("div");
  lockedInfo = document.createElement("div");
  constructor() {
    this.tooltip.classList.add("flex", "flex-col", "p-3");
    this.tooltip.appendChild(this.tooltipContents);
    const header = document.createElement("div");
    header.classList.add("flex", "flex-row", "items-center");
    this.tooltip.appendChild(header);
    this.civIcon.classList.add("size-12", "bg-contain", "mr-2");
    header.appendChild(this.civIcon);
    const civInfo = document.createElement("div");
    civInfo.classList.add("flex", "flex-col");
    header.appendChild(civInfo);
    this.civName.setAttribute("filigree-style", "none");
    this.civName.classList.add("font-title-lg", "uppercase");
    civInfo.appendChild(this.civName);
    this.civTraits.classList.add("font-body-base", "text-accent-1");
    civInfo.appendChild(this.civTraits);
    this.historicalReason.classList.add("font-body-base", "text-accent-1", "max-w-72", "mt-2");
    this.tooltip.appendChild(this.historicalReason);
    this.lockedInfo.classList.add("flex", "flex-row", "mt-2", "items-center");
    this.tooltip.appendChild(this.lockedInfo);
    const lockIcon = document.createElement("div");
    lockIcon.classList.add("img-lock", "size-8");
    this.lockedInfo.appendChild(lockIcon);
    const lockText = document.createElement("div");
    lockText.classList.add("font-body-base");
    lockText.setAttribute("data-l10n-id", "LOC_AGE_TRANSITION_CIV_LOCKED");
    this.lockedInfo.appendChild(lockText);
  }
  getHTML() {
    return this.tooltip;
  }
  reset() {
    this.tooltipContents.innerHTML = "";
  }
  isUpdateNeeded(target) {
    const newIndex = RecursiveGetAttribute(target, "data-civ-info-index") ?? "";
    const updateRequired = newIndex != this.civIndex;
    this.civIndex = newIndex;
    return updateRequired;
  }
  update() {
    const civData = CivilizationInfoTooltipModel.civData[Number.parseInt(this.civIndex)];
    if (civData) {
      this.civIcon.style.backgroundImage = `url("${civData.icon}")`;
      this.civName.setAttribute("title", civData.name);
      this.civTraits.innerHTML = civData.tags.join(", ");
      this.historicalReason.classList.toggle("hidden", !civData.isHistoricalChoice);
      this.historicalReason.innerHTML = Locale.stylize(civData.historicalChoiceReason ?? "");
      this.lockedInfo.classList.toggle("hidden", !civData.isLocked);
    }
  }
  isBlank() {
    return false;
  }
}
const CivilizationInfoTooltipModel = new CivilizationInfoTooltipModelImpl();
TooltipManager.registerType("civilization-info", new CivilizationInfoTooltip());

export { CivilizationInfoTooltip, CivilizationInfoTooltipModel, CivilizationInfoTooltipModelImpl };
//# sourceMappingURL=civilization-info-tooltip.js.map
