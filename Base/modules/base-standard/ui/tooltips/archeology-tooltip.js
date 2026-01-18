import ActionHandler from '../../../core/ui/input/action-handler.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import TooltipManager, { PlotTooltipPriority } from '../../../core/ui/tooltips/tooltip-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';

class ArcheologyTooltipType {
  hoveredX = -1;
  hoveredY = -1;
  shownByPlot = false;
  constructibleInfo;
  isNaturalWonder = false;
  titleText = "";
  descriptionText = "";
  tooltip = document.createElement("fxs-tooltip");
  titleRow = document.createElement("div");
  descriptionColumn = document.createElement("div");
  constructor() {
    const container = document.createElement("div");
    container.classList.value = "flex flex-col text-accent-2 max-w-96";
    this.tooltip.appendChild(container);
    this.titleRow.classList.value = "flex flex-row justify-left text-sm font-bold tooltip-title";
    container.appendChild(this.titleRow);
    this.descriptionColumn.classList.value = "flex flex-col justify-around text-sm";
    container.appendChild(this.descriptionColumn);
  }
  getHTML() {
    return this.tooltip;
  }
  reset() {
    this.titleRow.innerHTML = "";
    this.descriptionColumn.innerHTML = "";
  }
  getCoordsFromTarget(target) {
    if (target instanceof HTMLElement) {
      const xAttr = target.getAttribute("x");
      const yAttr = target.getAttribute("y");
      if (xAttr !== null && yAttr !== null) {
        return {
          x: parseInt(xAttr),
          y: parseInt(yAttr)
        };
      } else {
        return { x: -1, y: -1 };
      }
    } else {
      return target;
    }
  }
  getInfoFromConstructible(construct) {
    let info = void 0;
    const instance2 = Constructibles.getByComponentID(construct);
    if (instance2) {
      info = GameInfo.Constructibles.lookup(instance2.type) || void 0;
    }
    return info;
  }
  isUpdateNeeded(target) {
    this.shownByPlot = !(target instanceof HTMLElement);
    const { x, y } = this.getCoordsFromTarget(target);
    if (x != this.hoveredX || y != this.hoveredY) {
      this.constructibleInfo = void 0;
      this.isNaturalWonder = false;
      this.hoveredX = x;
      this.hoveredY = y;
      const constructibles = MapConstructibles.getConstructibles(this.hoveredX, this.hoveredY);
      const filteredConstructibles = constructibles.filter(
        (construct) => ["IMPROVEMENT_RUINS", "BUILDING_MUSEUM", "BUILDING_UNIVERSITY"].includes(
          this.getInfoFromConstructible(construct)?.ConstructibleType ?? ""
        )
      );
      filteredConstructibles.forEach((construct) => {
        this.constructibleInfo = this.getInfoFromConstructible(construct);
      });
      this.isNaturalWonder = GameplayMap.isNaturalWonder(this.hoveredX, this.hoveredY);
      return true;
    }
    return false;
  }
  update() {
    if (!this.constructibleInfo) {
      return;
    }
    this.setTipText();
    const titleElement = document.createElement("span");
    titleElement.setAttribute("data-l10n-id", this.titleText);
    this.titleRow.appendChild(titleElement);
    if (this.descriptionText) {
      const descriptionElement = document.createElement("span");
      descriptionElement.setAttribute("data-l10n-id", this.descriptionText);
      this.descriptionColumn.appendChild(descriptionElement);
    }
  }
  isBlank() {
    return !this.constructibleInfo && !this.isNaturalWonder || this.shownByPlot && !ActionHandler.isGamepadActive || LensManager.getActiveLens() !== "fxs-continent-lens";
  }
  setTipText() {
    const research = Players.get(GameContext.localPlayerID)?.Culture?.getContinentResearchStatus(
      GameplayMap.getContinentType(this.hoveredX, this.hoveredY)
    );
    this.descriptionText = research ? research : "";
    if (this.constructibleInfo?.ConstructibleType == "IMPROVEMENT_RUINS") {
      this.titleText = "LOC_PLOT_TOOLTIP_EXCAVATE_TITLE";
      this.descriptionText = "LOC_PLOT_TOOLTIP_EXCAVATE_RUINS_DESCRIPTION";
    } else if (this.isNaturalWonder) {
      this.titleText = "LOC_PLOT_TOOLTIP_STUDY_NATURAL_WONDER";
      this.descriptionText = "LOC_PLOT_TOOLTIP_NATURAL_WONDER_RESEARCH_DESCRIPTION";
    } else {
      const research2 = Players.get(GameContext.localPlayerID)?.Culture?.getContinentResearchStatus(
        GameplayMap.getContinentType(this.hoveredX, this.hoveredY)
      );
      if (this.constructibleInfo?.ConstructibleType == "BUILDING_MUSEUM") {
        this.titleText = "LOC_PLOT_TOOLTIP_RESEARCH_TITLE";
        this.descriptionText = research2 ?? "";
      } else if (this.constructibleInfo?.ConstructibleType == "BUILDING_UNIVERSITY") {
        this.titleText = "LOC_PLOT_TOOLTIP_RESEARCH_TITLE";
        this.descriptionText = research2 ?? "";
      }
    }
  }
}
const instance = new ArcheologyTooltipType();
TooltipManager.registerType("archeology", instance);
TooltipManager.registerPlotType("archeology", PlotTooltipPriority.HIGH, instance);
//# sourceMappingURL=archeology-tooltip.js.map
