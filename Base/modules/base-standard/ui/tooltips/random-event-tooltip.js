import LensManager from '../../../core/ui/lenses/lens-manager.js';
import TooltipManager from '../../../core/ui/tooltips/tooltip-manager.js';
import { RandomEventsLayer } from '../lenses/layer/random-events-layer.js';

class RandomEventTooltipType {
  hoveredX = -1;
  hoveredY = -1;
  randomEvent;
  eventData = null;
  tooltip = document.createElement("fxs-tooltip");
  eventDescription = document.createElement("div");
  constructor() {
    const container = document.createElement("div");
    container.classList.value = "flex flex-row text-accent-2";
    this.tooltip.appendChild(container);
    this.eventDescription.classList.value = "flex text-sm";
    container.appendChild(this.eventDescription);
  }
  getHTML() {
    return this.tooltip;
  }
  reset() {
    this.eventDescription.innerHTML = "";
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
  isUpdateNeeded(target) {
    const { x, y } = this.getCoordsFromTarget(target);
    if (x != this.hoveredX || y != this.hoveredY) {
      this.hoveredX = x;
      this.hoveredY = y;
      this.randomEvent = RandomEventsLayer.instance.getRandomEventResult(this.hoveredX, this.hoveredY);
      this.eventData = null;
      if (this.randomEvent) {
        if (this.randomEvent.tooltipKey !== "CLASS_FLOOD_VOLCANO") {
          this.eventData = GameInfo.RandomEventUI.lookup(this.randomEvent.eventClass);
          return true;
        }
        const floodEvent = GameInfo.RandomEventUI.lookup("CLASS_FLOOD");
        const volcanoEvent = GameInfo.RandomEventUI.lookup("CLASS_VOLCANO");
        if (floodEvent !== null && volcanoEvent !== null) {
          this.eventData = {
            ...floodEvent,
            Tooltip: "LOC_UI_RANDOM_EVENT_FLOOD_VOLCANO_TOOLTIP"
          };
        }
      }
      return true;
    }
    return false;
  }
  update() {
    if (!this.randomEvent || !this.eventData) {
      return;
    }
    const descriptionElement = document.createElement("span");
    descriptionElement.setAttribute("data-l10n-id", this.eventData.Tooltip);
    this.eventDescription.appendChild(descriptionElement);
  }
  isBlank() {
    return !this.randomEvent || !this.eventData || LensManager.getActiveLens() !== "fxs-settler-lens";
  }
}
const instance = new RandomEventTooltipType();
TooltipManager.registerType("random-event", instance);
//# sourceMappingURL=random-event-tooltip.js.map
