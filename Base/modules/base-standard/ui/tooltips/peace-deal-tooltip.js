import TooltipManager from '../../../core/ui/tooltips/tooltip-manager.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { C as CityYields } from '../utilities/utilities-city-yields.chunk.js';
import '../../../core/ui/input/action-handler.js';
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

function databindComponentID(target, baseComponentID, verbose) {
  Databind.attribute(target, "componentid", `${baseComponentID}`, verbose);
}
function databindRetrieveComponentID(target) {
  const foundID = target.getAttribute("componentid");
  if (foundID == null || foundID == "") {
    return ComponentID.getInvalidID();
  } else {
    return ComponentID.fromString(foundID);
  }
}
function databindRetrieveComponentIDSerial(target) {
  const foundID = target.getAttribute("componentid");
  return foundID ?? "";
}

class PeaceDealTooltipType {
  hoveredNodeID = null;
  hoveredElement = document.createElement("div");
  occupied = null;
  container = document.createElement("fxs-tooltip");
  headerContainer = document.createElement("div");
  settlementName = document.createElement("div");
  settlementNameWrapper = document.createElement("div");
  settlementIcon = document.createElement("div");
  occupiedWrapper = document.createElement("div");
  occupiedIcon = document.createElement("div");
  occupiedText = document.createElement("div");
  populationWrapper = document.createElement("div");
  populationValueWrapper = document.createElement("div");
  yieldsTitleWrapper = document.createElement("div");
  mainYieldWrapper = document.createElement("div");
  resourcesTitleWrapper = document.createElement("div");
  resourcesWrapper = document.createElement("div");
  wondersTitleWrapper = document.createElement("div");
  wondersWrapper = document.createElement("div");
  constructor() {
    this.headerContainer.classList.add(
      "peace-deal-tooltip__header-container",
      "justify-center",
      "items-center",
      "flex",
      "flex-row"
    );
    this.settlementNameWrapper.classList.add("flex", "flex-row", "justify-center", "items-center");
    this.settlementIcon.classList.add("size-8", "bg-contain");
    this.settlementName.classList.add(
      "fxs-header",
      "text-secondary",
      "justify-center",
      "text-center",
      "align-center",
      "text-lg"
    );
    this.settlementNameWrapper.appendChild(this.settlementIcon);
    this.settlementNameWrapper.appendChild(this.settlementName);
    this.headerContainer.appendChild(this.settlementNameWrapper);
    this.container.appendChild(this.headerContainer);
    this.occupiedWrapper.classList.add("justify-center", "items-center", "mt-4", "flex", "flex-row", "hidden");
    this.occupiedIcon.classList.add("size-8", "bg-contain", "justify-center");
    this.occupiedIcon.style.backgroundImage = `url(fs://game/dip_icon_conquered.png)`;
    this.occupiedWrapper.appendChild(this.occupiedIcon);
    this.occupiedText.classList.add(
      "font-body",
      "text-negative",
      "text-sm",
      "justify-center",
      "items-center",
      "ml-2"
    );
    this.occupiedText.setAttribute("data-l10n-id", "LOC_DIPLOMACY_PEACE_DEAL_CITY_OCCUPIED");
    this.occupiedWrapper.appendChild(this.occupiedText);
    this.container.appendChild(this.occupiedWrapper);
    this.populationWrapper.classList.add("justify-center", "mt-3");
    this.populationValueWrapper.classList.add(
      "text-center",
      "justify-center",
      "text-center",
      "align-center",
      "font-body",
      "text-sm"
    );
    this.populationWrapper.appendChild(this.populationValueWrapper);
    this.container.appendChild(this.populationWrapper);
    this.yieldsTitleWrapper.classList.add(
      "font-title",
      "text-sm",
      "uppercase",
      "mt-4",
      "justify-center",
      "text-center",
      "align-center"
    );
    this.yieldsTitleWrapper.setAttribute("data-l10n-id", "LOC_DIPLOMACY_OPTIONS_YIELDS");
    this.container.appendChild(this.yieldsTitleWrapper);
    this.mainYieldWrapper.classList.add("hidden", "flex", "fex-row");
    this.container.appendChild(this.mainYieldWrapper);
    this.resourcesTitleWrapper.classList.add(
      "font-title",
      "text-sm",
      "uppercase",
      "mt-4",
      "justify-center",
      "text-center",
      "align-center",
      "hidden"
    );
    this.resourcesTitleWrapper.setAttribute("data-l10n-id", "LOC_UI_RESOURCE_ALLOCATION_TITLE");
    this.resourcesWrapper.classList.add("justify-center", "flex", "flex-row");
    this.container.appendChild(this.resourcesTitleWrapper);
    this.container.appendChild(this.resourcesWrapper);
    this.wondersTitleWrapper.classList.add(
      "font-title",
      "text-sm",
      "uppercase",
      "mt-4",
      "justify-center",
      "text-center",
      "align-center",
      "hidden"
    );
    this.wondersTitleWrapper.setAttribute("data-l10n-id", "LOC_UI_CITY_DETAILS_WONDERS");
    this.container.appendChild(this.wondersTitleWrapper);
    this.container.appendChild(this.wondersWrapper);
    this.wondersWrapper.classList.add("justify-center", "flex", "flex-row");
  }
  getHTML() {
    return this.container;
  }
  reset() {
  }
  isUpdateNeeded(target) {
    const nodeIDString = target.getAttribute("node-id");
    if (target.parentElement) {
      this.occupied = target?.getAttribute("occupied");
    }
    this.hoveredElement = target;
    if (!nodeIDString) {
      this.hoveredNodeID = null;
      if (!this.container) {
        return true;
      }
      return false;
    }
    if (nodeIDString != this.hoveredNodeID || nodeIDString == this.hoveredNodeID && !this.container) {
      this.hoveredNodeID = nodeIDString;
      return true;
    }
    return false;
  }
  update() {
    if (!this.hoveredNodeID) {
      console.error(
        "peace-deal-tooltip: Attempting to update Peace Deal info tooltip, but unable to get selected node"
      );
      return;
    }
    const myCityID = databindRetrieveComponentID(this.hoveredElement);
    const myCity = Cities.get(myCityID);
    if (myCity) {
      this.settlementName.setAttribute("data-l10n-id", myCity.name);
      if (myCity.isTown) {
        this.settlementIcon.style.backgroundImage = `url(blp:Yield_Towns)`;
      } else {
        this.settlementIcon.style.backgroundImage = `url(blp:Yield_Cities)`;
      }
      this.occupiedWrapper.classList.add("hidden");
      if (this.occupied == "true") {
        this.occupiedWrapper.classList.remove("hidden");
      }
      this.populationValueWrapper.innerHTML = Locale.compose("LOC_UI_CITY_STATUS_POPULATION_TITLE") + ": " + myCity.population;
      const cityYields = CityYields.getCityYieldDetails(myCity.id);
      this.mainYieldWrapper.classList.add("hidden");
      this.mainYieldWrapper.innerHTML = "";
      if (cityYields != null) {
        this.mainYieldWrapper.classList.remove("hidden");
        for (const yieldEntry of cityYields) {
          if (!yieldEntry.type) {
            continue;
          }
          const yieldWrapper = document.createElement("div");
          const yieldIconWrapper = document.createElement("div");
          const yieldIcon = document.createElement("fxs-icon");
          const yieldText = document.createElement("div");
          yieldWrapper.classList.add("flex", "flex-col");
          yieldIconWrapper.classList.add("flex", "flex-col", "mx-2");
          yieldIcon.classList.add("size-8");
          yieldIconWrapper.appendChild(yieldIcon);
          yieldWrapper.appendChild(yieldIconWrapper);
          yieldText.classList.add("self-center");
          yieldWrapper.appendChild(yieldText);
          this.mainYieldWrapper.appendChild(yieldWrapper);
          yieldIcon.setAttribute("data-icon-id", yieldEntry.type);
          yieldText.innerHTML = Locale.compose("LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS", yieldEntry.valueNum);
        }
      }
      const city = Cities.get(myCityID);
      const theResources = city?.Resources;
      if (!theResources) {
        console.error(`peace-deal-tooltips: Failed to get city.Yields for ID ${myCityID}`);
        return;
      }
      const cityResources = theResources.getAssignedResources();
      this.resourcesWrapper.innerHTML = "";
      this.resourcesTitleWrapper.classList.add("hidden");
      if (cityResources.length > 0) {
        this.resourcesTitleWrapper.classList.remove("hidden");
      }
      for (const resourceEntry of cityResources) {
        const resourceItemWrapper = document.createElement("fxs-vslot");
        const resourceIconWrapper = document.createElement("div");
        resourceItemWrapper.appendChild(resourceIconWrapper);
        const resourceDefinition = GameInfo.Resources.lookup(
          resourceEntry.uniqueResource.resource
        );
        if (resourceDefinition) {
          const theResourceIcon = resourceDefinition.ResourceType;
          const resourceIcon = document.createElement("fxs-icon");
          resourceIcon.classList.add("resource-icon", "size-13", "mr-1", "relative");
          resourceIcon.setAttribute("data-icon-context", "RESOURCE");
          if (theResourceIcon) {
            resourceIcon.setAttribute("data-icon-id", theResourceIcon);
          }
          resourceIconWrapper.appendChild(resourceIcon);
          this.resourcesWrapper.appendChild(resourceItemWrapper);
        }
      }
      this.wondersTitleWrapper.classList.add("hidden");
      this.wondersWrapper.innerHTML = "";
      if (myCity.Constructibles?.getNumWonders()) {
        if (myCity.Constructibles?.getNumWonders() > 0) {
          const constructibles = city.Constructibles;
          this.wondersTitleWrapper.classList.remove("hidden");
          if (constructibles) {
            for (const constructibleID of constructibles.getIds()) {
              const constructible = Constructibles.getByComponentID(constructibleID);
              if (!constructible) {
                return;
              }
              const constructibleDefinition = GameInfo.Constructibles.lookup(constructible.type);
              if (!constructibleDefinition) {
                return;
              }
              const constructibleData = {
                id: constructibleID,
                location: constructible.location,
                type: constructibleDefinition.ConstructibleType,
                name: constructibleDefinition.Name,
                damaged: constructible.damaged,
                icon: constructibleDefinition.ConstructibleType,
                iconContext: constructibleDefinition.ConstructibleClass
              };
              if (constructibleDefinition.ConstructibleClass == "WONDER") {
                const wonderItem = document.createElement("div");
                const wonderIconValue = constructibleData.icon;
                const wonderItemIcon = document.createElement("fxs-icon");
                wonderItemIcon.classList.add("wonder-icon", "size-13", "mr-1", "relative");
                wonderItemIcon.setAttribute("data-icon-context", "WONDER");
                wonderItemIcon.setAttribute("data-icon-id", wonderIconValue);
                wonderItem.appendChild(wonderItemIcon);
                this.wondersWrapper.appendChild(wonderItem);
              }
            }
          }
        }
      }
    }
  }
  isBlank() {
    return false;
  }
}
TooltipManager.registerType("peaceDeal", new PeaceDealTooltipType());
//# sourceMappingURL=peace-deal-tooltip.js.map
