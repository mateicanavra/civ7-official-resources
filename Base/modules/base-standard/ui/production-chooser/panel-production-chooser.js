import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { b as FxsFrame, E as EditableHeaderTextChangedEventName, e as EditableHeaderExitEditEventName } from '../../../core/ui/components/fxs-editable-header.chunk.js';
import { a as DialogBoxManager, D as DialogBoxAction } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceModeChangedEventName, InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement, IsElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { BuildQueue } from '../build-queue/model-build-queue.js';
import { BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { CityDetailsClosedEventName } from '../city-details/panel-city-details.js';
import { b as GetTownFocusItems, P as ProductionPanelCategory, c as GetTownFocusBlp, U as UpdateCityDetailsEventName, d as GetLastProductionData, e as GetCityBuildReccomendations, f as GetUniqueQuarterForPlayer, g as GetProductionItems, R as RepairConstruct, S as SetTownFocus, G as GetPrevCityID, a as GetNextCityID, h as Construct, i as CreateProductionChooserItem, j as GetNumUniqueQuarterBuildingsCompleted, k as GetCurrentTownFocus } from './production-chooser-helpers.chunk.js';
import { FocusCityViewEventName } from '../views/view-city.js';
import { F as Framework } from '../../../core/ui/framework.chunk.js';
import { F as FxsChooserItem } from '../../../core/ui/components/fxs-chooser-item.chunk.js';
import { A as AdvisorUtilities } from '../tutorial/tutorial-support.chunk.js';
import { c as composeTagString } from '../utilities/utilities-tags.chunk.js';
import '../yield-bar-base/yield-bar-base.js';
import { a as FxsVSlot } from '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../utilities/utilities-overlay.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-item.js';
import '../tutorial/tutorial-manager.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../tutorial/tutorial-events.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';

const CanUpgradeToCity = (townID) => {
  const result = Game.CityCommands.canStart(
    townID,
    CityCommandTypes.PURCHASE,
    { Directive: OrderTypes.ORDER_TOWN_UPGRADE },
    false
  );
  return result.Success;
};
const CanCityConstruct = (cityID, constructible, isPurchase) => {
  if (isPurchase) {
    return Game.CityCommands.canStart(
      cityID,
      CityCommandTypes.PURCHASE,
      { ConstructibleType: constructible.$index },
      false
    );
  } else {
    return Game.CityOperations.canStart(
      cityID,
      CityOperationTypes.BUILD,
      { ConstructibleType: constructible.$index },
      false
    );
  }
};
const CanConvertToCity = (townID) => {
  return Game.CityCommands.canStart(
    townID,
    CityCommandTypes.PURCHASE,
    { Directive: OrderTypes.ORDER_TOWN_UPGRADE },
    false
  );
};
const ConvertToCity = (townID) => {
  const result = CanConvertToCity(townID);
  if (result.Success) {
    Game.CityCommands.sendRequest(townID, CityCommandTypes.PURCHASE, { Directive: OrderTypes.ORDER_TOWN_UPGRADE });
    UI.sendAudioEvent("city-upgrade-confirm");
    return true;
  }
  return false;
};

class UniqueQuarter {
  root = document.createElement("div");
  uqInfoCols = document.createElement("div");
  nameElement = document.createElement("div");
  completionStatusText = document.createElement("div");
  buildingContainer = document.createElement("div");
  buildingElementOne = void 0;
  buildingElementTwo = void 0;
  set definition(value) {
    this.nameElement.setAttribute("data-l10n-id", value.Name);
    this.uqInfoCols.setAttribute("data-tooltip-content", value.Description);
  }
  set numCompleted(value) {
    this.completionStatusText.textContent = Locale.compose("LOC_UI_PRODUCTION_QUARTER_BUILDINGS_COMPLETED", value);
  }
  constructor() {
    this.root.className = "production-chooser__unique-quarter relative flex flex-col pointer-events-auto";
    this.uqInfoCols.className = "production-chooser-item flex items-stretch mb-2 ml-2 hover\\:text-accent-1 focus\\:text-accent-1";
    this.uqInfoCols.setAttribute("data-tooltip-anchor-offset", "20");
    this.uqInfoCols.setAttribute("tabindex", "-1");
    const uqCol1 = document.createElement("fxs-icon");
    uqCol1.className = "size-10 mr-2";
    uqCol1.setAttribute("data-icon-id", "CITY_UNIQUE_QUARTER");
    uqCol1.setAttribute("data-icon-context", "DEFAULT");
    const uqNameLabelContainer = document.createElement("div");
    uqNameLabelContainer.className = "flex-auto flex flex-col";
    this.nameElement.className = "font-title text-base tracking-100 uppercase transition-color";
    const labelElement = document.createElement("div");
    labelElement.className = "font-body text-sm transition-color";
    labelElement.setAttribute("data-l10n-id", "LOC_UI_PRODUCTION_UNIQUE_QUARTER");
    uqNameLabelContainer.append(this.nameElement, labelElement);
    this.completionStatusText.className = "font-body text-sm self-end transition-color";
    this.uqInfoCols.append(uqCol1, uqNameLabelContainer, this.completionStatusText);
    this.buildingContainer.className = "flex flex-col";
    const uqBarDecor = document.createElement("div");
    uqBarDecor.className = "absolute -left-px h-full w-1\\.5 img-city-tab-line-vert";
    const uqDivider = document.createElement("div");
    uqDivider.className = "production-chooser__unique-quarter-divider";
    this.root.append(this.uqInfoCols, this.buildingContainer, uqBarDecor, uqDivider);
  }
  setBuildings(chooserItemOne, chooserItemTwo) {
    if (this.buildingElementOne == chooserItemOne && this.buildingElementTwo == chooserItemTwo) {
      return;
    }
    this.buildingContainer.innerHTML = "";
    this.buildingElementOne = chooserItemOne;
    this.buildingElementTwo = chooserItemTwo;
    this.buildingContainer.append(this.buildingElementOne, this.buildingElementTwo);
  }
  containsBuilding(item) {
    return this.buildingElementOne == item || this.buildingElementTwo == item;
  }
}

const styles = "fs://game/base-standard/ui/production-chooser/panel-production-chooser.css";

const TownFocusRefreshEventName = "panel-town-focus-refresh";
class TownFocusRefreshEvent extends CustomEvent {
  constructor() {
    super(TownFocusRefreshEventName, { bubbles: false, cancelable: true });
  }
}
class PanelTownFocus extends FxsFrame {
  _cityID = null;
  get cityID() {
    return this._cityID;
  }
  set cityID(value) {
    if (ComponentID.isMatch(value, this._cityID)) {
      return;
    }
    if (value === null) {
      this.focusItems = [];
      this._cityID = null;
      return;
    }
    const city = Cities.get(value);
    if (!city) {
      this.focusItems = [];
      console.error(`panel-production-chooser: Failed to get city with ID: ${ComponentID.toLogString(value)}`);
      return;
    }
    this.focusItems = GetTownFocusItems(city.id);
    this._cityID = value;
  }
  set focusItems(items) {
    this.focusItemListElement.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
      const { name, description, tooltipDescription, growthType, projectType } = items[i];
      const itemElement = document.createElement("town-focus-chooser-item");
      itemElement.classList.add("w-full");
      itemElement.dataset.name = name;
      itemElement.dataset.description = description;
      if (tooltipDescription) {
        itemElement.dataset.tooltipDescription = tooltipDescription;
      } else {
        itemElement.removeAttribute("data-tooltip-description");
      }
      itemElement.dataset.growthType = growthType.toString();
      itemElement.dataset.projectType = projectType.toString();
      this.focusItemListElement.appendChild(itemElement);
    }
  }
  // #region Element References
  headerElement = document.createElement("fxs-header");
  focusItemListElement = document.createElement("fxs-vslot");
  // #endregion
  onInitialize() {
    this.Root.setAttribute(
      "override-styling",
      "relative flex max-w-full max-h-full pt-3\\.5 px-3\\.5 pb-6 pointer-events-auto"
    );
    this.Root.setAttribute("frame-style", "simple");
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("focus", this.onFocus);
    engine.on("CitySelectionChanged", this.onCitySelectionChanged);
    engine.on("CityGrowthModeChanged", this.onCityGrowthModeChanged);
    this.Root.addEventListener(TownFocusRefreshEventName, this.onRefreshFocusList);
    this.cityID = UI.Player.getHeadSelectedCity();
  }
  onDetach() {
    this.Root.removeEventListener(TownFocusRefreshEventName, this.onRefreshFocusList);
    engine.off("CityGrowthModeChanged", this.onCityGrowthModeChanged);
    engine.off("CitySelectionChanged", this.onCitySelectionChanged);
    this.Root.removeEventListener("focus", this.onFocus);
    super.onDetach();
  }
  onCitySelectionChanged = ({ selected, cityID }) => {
    if (selected) {
      this.cityID = cityID;
    }
  };
  onCityGrowthModeChanged = ({ cityID }) => {
    if (this._cityID && ComponentID.isMatch(this._cityID, cityID)) {
      this.cityID = cityID;
    }
  };
  onRefreshFocusList = () => {
    const oldCityID = this._cityID;
    this.cityID = null;
    this.cityID = oldCityID;
  };
  onFocus = () => {
    if (this.cityID) {
      Game.CityOperations.sendRequest(this.cityID, CityOperationTypes.CONSIDER_TOWN_PROJECT, {});
    }
    Framework.FocusManager.setFocus(this.focusItemListElement);
  };
  render() {
    this.content.classList.add("flex", "flex-col");
    this.headerElement.classList.add("uppercase", "tracking-100");
    this.headerElement.setAttribute("title", "LOC_UI_TOWN_FOCUS");
    this.content.appendChild(this.headerElement);
    this.content.insertAdjacentHTML(
      "beforeend",
      `<div class="flex flex-col items-center justify-center mb-2 font-body text-xs text-accent-2" data-l10n-id="LOC_UI_TOWN_FOCUS_CTA"></div>`
    );
    const scrollable = document.createElement("fxs-scrollable");
    scrollable.classList.add("flex-auto", "px-3\\.5", "mr-1");
    this.focusItemListElement.setAttribute("data-navrule-up", "stop");
    this.focusItemListElement.setAttribute("data-navrule-down", "stop");
    this.focusItemListElement.setAttribute("data-navrule-left", "stop");
    this.focusItemListElement.setAttribute("data-navrule-right", "stop");
    scrollable.appendChild(this.focusItemListElement);
    this.content.appendChild(scrollable);
  }
}
Controls.define("panel-town-focus", {
  createInstance: PanelTownFocus,
  tabIndex: -1
});

const ProductionChooserAccordionSectionToggleEventName = "production-chooser-accordion-section-toggle";
class ProductionChooserAccordionSectionToggleEvent extends CustomEvent {
  constructor(detail) {
    super(ProductionChooserAccordionSectionToggleEventName, { detail, bubbles: true });
  }
}
class ProductionChooserAccordionSection {
  constructor(id, title, isOpen) {
    this.id = id;
    this.title = title;
    this.root = document.createElement("div");
    this.root.id = id;
    this.root.classList.add("production-category", "mb-2", "ml-4");
    this.header = document.createElement("fxs-activatable");
    this.header.classList.value = "relative flex items-center group h-10 mb-2 hud_sidepanel_list-bg cursor-pointer";
    this.header.setAttribute("tabindex", "-1");
    this.sectionHeaderFocus = document.createElement("div");
    this.sectionHeaderFocus.classList.value = "absolute inset-0 img-list-focus-frame opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity";
    this.header.appendChild(this.sectionHeaderFocus);
    const sectionTitleWrapper = document.createElement("div");
    sectionTitleWrapper.classList.value = "relative flex-auto flex items-center justify-center";
    const sectionTitle = document.createElement("div");
    sectionTitle.classList.value = "font-title uppercase text-xs text-accent-2 tracking-100";
    sectionTitle.setAttribute("data-l10n-id", title);
    sectionTitleWrapper.appendChild(sectionTitle);
    this.header.appendChild(sectionTitleWrapper);
    this.arrowIcon = document.createElement("div");
    this.arrowIcon.classList.value = "w-12 h-8 img-arrow bg-center bg-no-repeat bg-contain transition-transform";
    this.header.appendChild(this.arrowIcon);
    this.root.appendChild(this.header);
    this.slot = document.createElement("div");
    this.slot.classList.add("flex", "flex-col", "shrink-0");
    this.slotWrapper = document.createElement("div");
    this.slotWrapper.classList.add("flex", "flex-col", "overflow-hidden", "transition-height", "ease-out");
    this.slotWrapper.append(this.slot);
    this.root.appendChild(this.slotWrapper);
    this.resizeObserver = new ResizeObserver((_entries) => {
      this.updateHeight(this.slot.clientHeight);
    });
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        for (const node of mutation.addedNodes) {
          this.applyTabIndexPolicyForNode(node);
        }
      }
    });
    this.mutationObserver.observe(this.slot, { childList: true, subtree: false });
    this.header.addEventListener("action-activate", () => {
      this.toggle();
      this.root.dispatchEvent(new ProductionChooserAccordionSectionToggleEvent({ isOpen: this.isOpen }));
    });
    this.isOpen = isOpen;
    this.toggle(isOpen);
  }
  root;
  slot;
  slotWrapper;
  header;
  arrowIcon;
  sectionHeaderFocus;
  resizeObserver;
  mutationObserver;
  #isOpen;
  get isOpen() {
    return this.#isOpen;
  }
  set isOpen(_) {
    this.#isOpen = _;
  }
  /** Track changes to the size while open */
  observe() {
    this.resizeObserver.observe(this.slot, { box: "border-box" });
  }
  /**
   * Stop tracking size changes
   *
   * We do this because Gameface needs to check all elements that changed size to see if a particular resize observer matches,
   * so even if the element is not changing size, there is a performance cost
   *
   * NOTE: The mutation observer is not here because we need to always watch for new items to apply focus policy
   */
  unobserve() {
    this.resizeObserver.unobserve(this.slot);
  }
  /**
   * Completely stop observing changes for cleanup
   */
  disconnect() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
  }
  updateHeight(height) {
    const currentHeight = this.slotWrapper.clientHeight;
    const heightDiffAbs = Math.abs(height - currentHeight);
    const shouldAnimate = this.slotWrapper.attributeStyleMap.has("height");
    if (shouldAnimate) {
      const transitionDurationSeconds = Math.max(0.15, Math.min(1, heightDiffAbs / (2 * screen.height)));
      this.slotWrapper.style.transitionDuration = `${transitionDurationSeconds}s`;
    } else {
      this.slotWrapper.style.transitionDuration = "";
    }
    this.slotWrapper.attributeStyleMap.set("height", CSS.px(height));
  }
  // Ensure any newly added elements respect the current open/closed focus policy
  applyTabIndexPolicyForNode(node) {
    if (!(node instanceof Element)) return;
    const affected = [];
    if (node instanceof HTMLElement && node.matches(".production-chooser-item")) {
      affected.push(node);
    } else {
      node.querySelectorAll(".production-chooser-item").forEach((el) => affected.push(el));
    }
    if (affected.length === 0) return;
    if (!this.isOpen) {
      for (const el of affected) {
        el.removeAttribute("tabindex");
      }
    } else {
      for (const el of affected) {
        el.setAttribute("tabindex", "-1");
      }
    }
  }
  toggle(force = void 0) {
    const shouldOpen = force ?? !this.isOpen;
    if (shouldOpen) {
      this.open();
      this.header.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
    } else {
      this.close();
      this.header.setAttribute("data-audio-activate-ref", "data-audio-dropdown-open");
    }
  }
  open() {
    this.arrowIcon.classList.add("-rotate-90");
    this.isOpen = true;
    this.slot.classList.remove("disabled");
    const selectableChildren = this.slot.querySelectorAll(".production-chooser-item");
    for (const child of selectableChildren) {
      child.setAttribute("tabindex", "-1");
    }
    this.observe();
  }
  close() {
    this.arrowIcon.classList.remove("-rotate-90");
    this.isOpen = false;
    const selectableChildren = this.slot.querySelectorAll(".production-chooser-item");
    for (const child of selectableChildren) {
      child.removeAttribute("tabindex");
    }
    this.updateHeight(0);
    this.unobserve();
  }
}

const categoryTooltipStyleMap = {
  [ProductionPanelCategory.BUILDINGS]: "production-constructible-tooltip",
  [ProductionPanelCategory.UNITS]: "production-unit-tooltip",
  [ProductionPanelCategory.WONDERS]: "production-constructible-tooltip",
  [ProductionPanelCategory.PROJECTS]: "production-project-tooltip"
};
const UpdateProductionChooserItem = (element, data, isPurchase) => {
  element.dataset.name = data.name;
  element.dataset.type = data.type;
  element.dataset.category = data.category;
  element.dataset.isPurchase = isPurchase.toString();
  element.dataset.isAgeless = data.ageless ? "true" : "false";
  element.dataset.infoDisplayType = data.infoDisplayType;
  if (data.secondaryDetails && (!data.infoDisplayType || data.infoDisplayType == "yield-preview")) {
    element.dataset.secondaryDetails = data.secondaryDetails;
  } else {
    element.removeAttribute("data-secondary-details");
  }
  if (data.tags && (!data.infoDisplayType || data.infoDisplayType == "base-yield")) {
    element.dataset.tags = composeTagString(data.tags);
  } else {
    element.removeAttribute("data-tags");
  }
  if (data.baseYields && data.baseYields.length && (!data.infoDisplayType || data.infoDisplayType == "base-yield")) {
    element.dataset.baseYields = JSON.stringify(data.baseYields);
  } else {
    element.removeAttribute("data-base-yields");
  }
  const cost = isPurchase ? data.cost : data.turns;
  element.dataset.cost = cost.toString();
  element.setAttribute("disabled", (!!data.disabled).toString());
  if (data.error) {
    element.dataset.error = data.error;
  } else {
    element.removeAttribute("data-error");
  }
  if (data.description) {
    element.dataset.description = data.description;
  } else {
    element.removeAttribute("data-description");
  }
  if (data.canGetWarehouseBonuses) {
    element.dataset.canGetWarehouse = "true";
    element.dataset.warehouseCount = data.warehouseCount ? data.warehouseCount.toString() : "0";
  } else {
    element.removeAttribute("data-can-get-warehouse");
    element.removeAttribute("data-warehouse-count");
  }
  if (data.canGetAdjacencyBonuses) {
    element.dataset.canGetAdjacency = "true";
    element.dataset.highestAdjacency = data.highestAdjacency ? data.highestAdjacency.toString() : "0";
  } else {
    element.removeAttribute("data-can-get-adjacency");
    element.removeAttribute("data-highest-adjacency");
  }
  if (data.recommendations && data.recommendations.length > 0) {
    element.dataset.recommendations = JSON.stringify(data.recommendations);
  } else {
    element.removeAttribute("data-recommendations");
  }
  if (data.type == "IMPROVEMENT_REPAIR_ALL") {
    element.setAttribute("data-repair-all", "true");
  }
  if (isPurchase) {
    element.setAttribute("data-audio-activate-ref", "data-audio-city-purchase-activate");
  } else {
    element.setAttribute("data-audio-activate-ref", "none");
  }
  element.setAttribute("data-tooltip-style", categoryTooltipStyleMap[data.category]);
};
class ProductionChooserItem extends FxsChooserItem {
  // #region Element References
  iconElement = document.createElement("fxs-icon");
  itemNameElement = document.createElement("span");
  itemBaseYieldsElement = document.createElement("div");
  secondaryDetailsElement = document.createElement("div");
  alternateYieldElement = document.createElement("div");
  errorTextElement = document.createElement("span");
  costContainer = document.createElement("div");
  costIconElement = document.createElement("span");
  recommendationsContainer = document.createElement("div");
  alternateRecommendationsContainer = document.createElement("div");
  costAmountElement = document.createElement("span");
  agelessContainer = document.createElement("div");
  warehouseCountContainer = document.createElement("div");
  warehouseCountValue = document.createElement("div");
  adjacencyBonusContainer = document.createElement("div");
  adjacencyBonusValue = document.createElement("div");
  // #endregion
  get isPurchase() {
    return this.Root.getAttribute("data-is-purchase") === "true";
  }
  onInitialize() {
    super.onInitialize();
    this.selectOnActivate = true;
    this.render();
  }
  render() {
    this.Root.classList.add("text-base", "production-chooser-item");
    this.container.classList.add("p-2", "tracking-100");
    this.iconElement.classList.add("size-16", "bg-contain", "bg-center", "bg-no-repeat", "mr-2");
    this.container.appendChild(this.iconElement);
    const infoContainer = document.createElement("div");
    infoContainer.classList.value = "relative flex flex-col flex-auto justify-between pt-2 pb-1\\.5";
    this.itemNameElement.classList.value = "font-title text-accent-2 uppercase";
    infoContainer.appendChild(this.itemNameElement);
    this.errorTextElement.classList.value = "font-body text-negative-light z-1 pointer-events-none";
    infoContainer.appendChild(this.errorTextElement);
    this.secondaryDetailsElement.classList.value = "hidden flex text-sm";
    infoContainer.appendChild(this.secondaryDetailsElement);
    this.alternateYieldElement.classList.value = "hidden flex items-center text-sm production-chooser__font-icon-positioning";
    infoContainer.appendChild(this.alternateYieldElement);
    this.itemBaseYieldsElement.classList.value = "flex items-center";
    this.alternateYieldElement.appendChild(this.itemBaseYieldsElement);
    this.warehouseCountContainer.classList.add("hidden", "flex", "items-end");
    this.alternateYieldElement.appendChild(this.warehouseCountContainer);
    const warehouseDivider = document.createElement("div");
    warehouseDivider.classList.add("mx-2");
    warehouseDivider.textContent = "|";
    this.warehouseCountContainer.appendChild(warehouseDivider);
    this.warehouseCountValue.className = "mx-1";
    this.warehouseCountContainer.appendChild(this.warehouseCountValue);
    const warehouseIcon = document.createElement("fxs-font-icon");
    warehouseIcon.setAttribute("data-icon-id", "YIELD_WAREHOUSE");
    this.warehouseCountContainer.appendChild(warehouseIcon);
    this.adjacencyBonusContainer.classList.add("hidden", "flex", "items-end");
    this.alternateYieldElement.appendChild(this.adjacencyBonusContainer);
    const adjacencyDivider = document.createElement("div");
    adjacencyDivider.classList.add("mx-2");
    adjacencyDivider.textContent = "|";
    this.adjacencyBonusContainer.appendChild(adjacencyDivider);
    this.adjacencyBonusValue.className = "mx-1";
    this.adjacencyBonusContainer.appendChild(this.adjacencyBonusValue);
    const adjacencyIcon = document.createElement("fxs-font-icon");
    adjacencyIcon.setAttribute("data-icon-id", "YIELD_ADJACENCY");
    this.adjacencyBonusContainer.appendChild(adjacencyIcon);
    this.container.appendChild(infoContainer);
    const rightColumn = document.createElement("div");
    rightColumn.classList.value = "flex flex-col justify-end";
    const rightColumnTop = document.createElement("div");
    rightColumnTop.classList.value = "self-end";
    rightColumn.appendChild(rightColumnTop);
    const rightColumnBottom = document.createElement("div");
    rightColumnBottom.classList.value = "flex flex-auto self-end";
    rightColumn.appendChild(rightColumnBottom);
    this.agelessContainer.classList.value = "hidden flex items-center";
    this.agelessContainer.innerHTML = `
			<div class="img-hud-production-pill flex text-sm items-center">
                <div class="px-2 uppercase leading-none" data-l10n-id="LOC_UI_PRODUCTION_AGELESS"></div>
            </div>
		`;
    rightColumnTop.appendChild(this.agelessContainer);
    this.recommendationsContainer.classList.value = "flex items-center justify-center mr-2";
    this.costContainer.appendChild(this.recommendationsContainer);
    this.costContainer.classList.value = "flex flex-row items-center self-end";
    this.costContainer.appendChild(this.costAmountElement);
    this.costIconElement.classList.value = "size-8 bg-contain bg-center bg-no-repeat mr-1";
    this.costContainer.appendChild(this.costIconElement);
    this.alternateRecommendationsContainer.classList.value = "flex items-center justify-center mr-2";
    rightColumnTop.appendChild(this.alternateRecommendationsContainer);
    rightColumnBottom.appendChild(this.costContainer);
    this.container.appendChild(rightColumn);
  }
  updateCostIconElement() {
    const costIcon = this.isPurchase ? "Yield_Gold" : "hud_turn-timer";
    this.costIconElement.style.setProperty("background-image", `url(${costIcon})`);
    const altText = Locale.compose(this.isPurchase ? "LOC_YIELD_GOLD" : "LOC_UI_CITY_INSPECTOR_TURNS");
    this.costIconElement.ariaLabel = altText;
  }
  updateRecommendation() {
    if (this.Root.dataset.recommendations) {
      this.createRecommendationElements(this.Root.dataset.recommendations);
      this.recommendationsContainer.classList.remove("hidden");
      this.alternateRecommendationsContainer.classList.add("hidden");
    } else {
      this.alternateRecommendationsContainer.classList.add("hidden");
      this.recommendationsContainer.classList.add("hidden");
    }
  }
  createRecommendationElements(recommendationList) {
    this.recommendationsContainer.innerHTML = "";
    const recommendations = JSON.parse(recommendationList);
    const advisorList = recommendations.map((rec) => rec.class);
    const advisorRecommendations = AdvisorUtilities.createAdvisorRecommendation(advisorList);
    this.recommendationsContainer.appendChild(advisorRecommendations);
  }
  createAlternateRecommendationElements(recommendationList) {
    this.alternateRecommendationsContainer.innerHTML = "";
    const recommendations = JSON.parse(recommendationList);
    const advisorList = recommendations.map((rec) => rec.class);
    const advisorRecommendations = AdvisorUtilities.createAdvisorRecommendation(advisorList);
    this.alternateRecommendationsContainer.appendChild(advisorRecommendations);
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "data-name":
        if (newValue) {
          this.itemNameElement.dataset.l10nId = newValue;
        }
        break;
      case "data-type": {
        if (newValue) {
          this.iconElement.setAttribute("data-icon-id", newValue);
        } else {
          this.iconElement.removeAttribute("data-icon-id");
        }
        const isUnit = !!newValue && GameInfo.Units.lookup(newValue) != void 0;
        this.secondaryDetailsElement.classList.toggle("-ml-1\\.5", isUnit);
        break;
      }
      case "data-is-purchase":
        this.updateCostIconElement();
        break;
      case "data-cost":
        {
          const cost = newValue ? parseInt(newValue) : 0;
          const showCost = isNaN(cost) || cost < 0;
          this.costContainer.classList.toggle("hidden", showCost);
          this.costAmountElement.textContent = newValue;
        }
        break;
      case "data-error":
        if (newValue) {
          this.errorTextElement.setAttribute("data-l10n-id", newValue);
          this.errorTextElement.classList.remove("hidden");
        } else {
          this.errorTextElement.removeAttribute("data-l10n-id");
          this.errorTextElement.classList.add("hidden");
        }
        break;
      case "data-is-ageless": {
        const isAgeless = newValue === "true";
        this.agelessContainer.classList.toggle("hidden", !isAgeless);
        break;
      }
      case "data-secondary-details": {
        if (newValue) {
          this.secondaryDetailsElement.innerHTML = newValue;
          this.secondaryDetailsElement.classList.remove("hidden");
        } else {
          this.secondaryDetailsElement.classList.add("hidden");
        }
        break;
      }
      case "data-recommendations": {
        this.updateRecommendation();
        break;
      }
      case "data-warehouse-count": {
        if (newValue) {
          this.warehouseCountValue.textContent = newValue;
          this.warehouseCountContainer.classList.remove("hidden");
        } else {
          this.warehouseCountContainer.classList.add("hidden");
        }
        break;
      }
      case "data-highest-adjacency": {
        if (newValue) {
          this.adjacencyBonusValue.textContent = newValue;
          this.adjacencyBonusContainer.classList.remove("hidden");
        } else {
          this.adjacencyBonusContainer.classList.add("hidden");
        }
        break;
      }
      case "data-base-yields": {
        if (newValue) {
          this.itemBaseYieldsElement.innerHTML = "";
          const baseYields = JSON.parse(newValue);
          for (let i = 0; i < baseYields.length; i++) {
            const yieldData = baseYields[i];
            const baseYield = document.createElement("div");
            baseYield.className = "flex items-center";
            if (i > 0) {
              baseYield.classList.add("ml-1");
            }
            baseYield.innerHTML = Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_ICON_ONLY",
              yieldData.value,
              yieldData.yieldType
            );
            this.itemBaseYieldsElement.appendChild(baseYield);
          }
          this.itemBaseYieldsElement.classList.remove("hidden");
        } else {
          this.itemBaseYieldsElement.classList.add("hidden");
        }
        break;
      }
      case "data-info-display-type": {
        this.updateRecommendation();
        if (newValue === "base-yield") {
          this.alternateYieldElement.classList.remove("hidden");
        } else {
          this.alternateYieldElement.classList.add("hidden");
        }
        break;
      }
      default:
        super.onAttributeChanged(name, _oldValue, newValue);
        break;
    }
  }
}
Controls.define("production-chooser-item", {
  createInstance: ProductionChooserItem,
  attributes: [
    { name: "disabled" },
    { name: "data-category" },
    { name: "data-name" },
    { name: "data-type" },
    { name: "data-cost" },
    { name: "data-prereq" },
    { name: "data-description" },
    { name: "data-error" },
    { name: "data-is-purchase" },
    { name: "data-is-ageless" },
    { name: "data-secondary-details" },
    { name: "data-recommendations" },
    { name: "data-tags" },
    { name: "data-base-yields" },
    { name: "data-can-get-warehouse" },
    { name: "data-info-display-type" },
    { name: "data-warehouse-count" },
    { name: "data-can-get-adjacency" },
    { name: "data-highest-adjacency" }
  ]
});

class TownFocusChooserItem extends FxsChooserItem {
  // #region Element References
  nameElement = document.createElement("div");
  descriptionElement = document.createElement("div");
  projectIconElement = document.createElement("div");
  // #endregion
  onInitialize() {
    super.onInitialize();
    this.render();
    this.selectOnActivate = true;
  }
  updateIcon() {
    const projectTypeAttr = this.Root.getAttribute("data-project-type");
    const growthTypeAttr = this.Root.getAttribute("data-growth-type");
    const projectType = projectTypeAttr ? parseInt(projectTypeAttr) : null;
    const growthType = growthTypeAttr ? parseInt(growthTypeAttr) : null;
    const iconBlp = GetTownFocusBlp(growthType, projectType);
    this.projectIconElement.style.backgroundImage = `url(${iconBlp})`;
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-project-type":
      case "data-growth-type":
        this.updateIcon();
        break;
      case "data-name":
        if (newValue) {
          this.nameElement.setAttribute("data-l10n-id", newValue);
        }
        break;
      case "data-description":
        if (newValue) {
          this.descriptionElement.setAttribute("data-l10n-id", newValue);
        }
        this.container.classList.toggle("p-3", !!newValue);
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  render() {
    this.Root.dataset.tooltipStyle = "production-project-tooltip";
    this.container.classList.add("flex", "flex-row", "flex-auto");
    this.projectIconElement.classList.add("size-16", "bg-contain", "bg-center", "bg-no-repeat", "mr-2");
    this.container.appendChild(this.projectIconElement);
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("flex", "flex-col", "flex-initial", "justify-center");
    this.nameElement.classList.add("mb-1", "font-title", "uppercase", "text-xs", "tracking-100");
    this.descriptionElement.classList.add("font-body", "text-sm");
    infoContainer.append(this.nameElement, this.descriptionElement);
    this.container.appendChild(infoContainer);
  }
}
Controls.define("town-focus-chooser-item", {
  createInstance: TownFocusChooserItem,
  attributes: [
    { name: "disabled" },
    { name: "selected", description: "Is this chooser item selected? (Default: false)" },
    { name: "show-frame-on-hover", description: "Shows the selection frame on hover" },
    {
      name: "data-project-type"
    },
    {
      name: "data-growth-type"
    },
    {
      name: "data-name"
    },
    {
      name: "data-description"
    },
    {
      name: "selected"
    }
  ]
});
class TownFocusSection extends FxsVSlot {
  // #region Element References
  townFocusItem = document.createElement("town-focus-chooser-item");
  defaultLabelElement = document.createElement("div");
  // #endregion
  // #region Lifecycle
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-disabled":
        if (newValue !== null) {
          this.townFocusItem.setAttribute("disabled", newValue);
        } else {
          this.townFocusItem.removeAttribute("disabled");
        }
        break;
      case "data-growth-type":
      case "data-project-type":
      case "data-name":
      case "data-description":
      case "data-tooltip-name":
      case "data-tooltip-description":
        if (newValue) {
          this.townFocusItem.setAttribute(name, newValue);
        } else {
          this.townFocusItem.removeAttribute(name);
        }
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  // #endregion
  render() {
    this.Root.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "px-14",
      "py-2",
      "production-chooser__town-focus-gradient"
    );
    this.Root.insertAdjacentHTML(
      "beforeend",
      '<div class="font-title uppercase text-xs text-secondary-2 text-gradient-secondary" data-l10n-id="LOC_UI_TOWN_FOCUS"></div>'
    );
    this.townFocusItem.classList.add("flex-auto", "mx-5", "my-2");
    this.Root.appendChild(this.townFocusItem);
    this.defaultLabelElement.classList.value = "production-chooser__town-focus__default-label font-body text-xs text-accent-2";
    this.defaultLabelElement.setAttribute("data-l10n-id", "LOC_UI_TOWN_FOCUS_DEFAULT_LABEL");
    this.Root.appendChild(this.defaultLabelElement);
  }
}
Controls.define("town-focus-section", {
  createInstance: TownFocusSection,
  attributes: [
    {
      name: "data-type"
    },
    {
      name: "data-growth-type"
    },
    {
      name: "data-project-type"
    },
    {
      name: "data-disabled"
    },
    {
      name: "data-name"
    },
    {
      name: "data-description"
    },
    {
      name: "data-tooltip-name"
    },
    {
      name: "data-tooltip-description"
    },
    {
      name: "data-show-default-label"
    }
  ],
  tabIndex: -1
});

class TownUnrestDisplay extends Component {
  // #region Component State
  get highestActiveUnrestDuration() {
    const attr = this.Root.getAttribute("data-highest-active-unrest-duration");
    return attr ? parseInt(attr) : 0;
  }
  get turnsOfUnrest() {
    const attr = this.Root.getAttribute("data-turns-of-unrest");
    return attr ? parseInt(attr) : 0;
  }
  // #endregion
  // #region Element References
  sliderFillElement = document.createElement("div");
  remainingTurnsElement = document.createElement("div");
  // #endregion
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    switch (name) {
      case "data-turns-of-unrest":
      case "data-highest-active-unrest-duration":
        this.updateUnrestDisplay(this.turnsOfUnrest, this.highestActiveUnrestDuration);
        break;
      default:
        break;
    }
  }
  updateUnrestDisplay(turnsOfUnrest, highestActiveUnrestDuration) {
    if (highestActiveUnrestDuration != 0) {
      const pct = Math.max(0, Math.min(1, turnsOfUnrest / highestActiveUnrestDuration));
      this.sliderFillElement.style.transform = `scaleX(${pct})`;
    } else {
      this.sliderFillElement.style.transform = `none`;
    }
    const turnsRemaining = Math.max(0, turnsOfUnrest);
    this.remainingTurnsElement.textContent = Locale.compose(
      "LOC_UI_PRODUCTION_UNREST_TURNS_REMAINING",
      turnsRemaining
    );
  }
  render() {
    this.Root.classList.add("flex", "flex-col", "items-center", "justify-center", "px-2");
    this.Root.innerHTML = `
			<div class="font-title font-bold text-lg mt-2 uppercase pulse-warn" data-l10n-id="LOC_UI_PRODUCTION_UNREST"></div>
		`;
    const slider = document.createElement("div");
    slider.classList.add("w-full", "h-1\\.5", "mb-2", "mt-2", "town-unrest-bg");
    this.sliderFillElement.classList.add("size-full", "origin-left", "town-unrest-fill", "transition-transform");
    slider.appendChild(this.sliderFillElement);
    this.Root.append(slider, this.remainingTurnsElement);
  }
}
Controls.define("town-unrest-display", {
  createInstance: TownUnrestDisplay,
  attributes: [{ name: "data-turns-of-unrest" }, { name: "data-highest-active-unrest-duration" }]
});

class LastProductionSection extends Component {
  cityID = null;
  updateCityDetailsListener = this.onUpdateCityDetails.bind(this);
  nameElement = document.createElement("div");
  iconElement = document.createElement("fxs-icon");
  yieldDiv = document.createElement("div");
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(UpdateCityDetailsEventName, this.updateCityDetailsListener);
  }
  onDetach() {
    this.cityID = null;
    window.removeEventListener(UpdateCityDetailsEventName, this.updateCityDetailsListener);
    super.onDetach();
  }
  render() {
    this.Root.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "px-14",
      "py-2",
      "pointer-events-auto"
    );
    this.Root.insertAdjacentHTML(
      "beforeend",
      '<div class="font-title uppercase text-sm text-secondary-2 text-gradient-secondary mb-1" data-l10n-id="LOC_UI_JUST_COMPLETED"></div>'
    );
    const frame = document.createElement("fxs-inner-frame");
    frame.classList.add("min-w-96", "items-start", "last-production-frame");
    const container = document.createElement("div");
    container.classList.add("flex", "items-center", "my-4", "ml-8");
    this.iconElement.classList.add("size-16");
    container.appendChild(this.iconElement);
    const details = document.createElement("div");
    details.classList.add("flex-col", "ml-4");
    this.nameElement.classList.add("font-title", "text-xs", "text-accent-2", "uppercase");
    details.appendChild(this.nameElement);
    this.yieldDiv.classList.add("flex");
    details.appendChild(this.yieldDiv);
    container.appendChild(details);
    const checkmarkBG = document.createElement("div");
    checkmarkBG.style.backgroundImage = 'url("fs://game/techtree-icon-empty")';
    checkmarkBG.classList.value = "check-icon flex absolute size-6 bg-no-repeat bg-center bg-contain -right-2 -top-2 justify-center items-center";
    frame.appendChild(checkmarkBG);
    const checkmark = document.createElement("div");
    checkmark.classList.value = "size-4 bg-center bg-contain bg-no-repeat";
    checkmark.style.backgroundImage = 'url("fs://game/techtree_icon-checkmark")';
    checkmarkBG.appendChild(checkmark);
    frame.appendChild(container);
    this.Root.appendChild(frame);
  }
  updateGate = new UpdateGate(() => {
    if (!this.cityID || ComponentID.isInvalid(this.cityID)) {
      return;
    }
    const lastProductionData = GetLastProductionData(this.cityID);
    if (!lastProductionData) {
      this.Root.classList.add("hidden");
      return;
    }
    this.nameElement.setAttribute("data-l10n-id", lastProductionData.name);
    this.iconElement.setAttribute("data-icon-id", lastProductionData.type);
    this.yieldDiv.innerHTML = "";
    for (const detailData of lastProductionData.details) {
      const yieldEntry = document.createElement("div");
      yieldEntry.classList.add("flex", "items-center", "pr-4");
      const yieldIcon = document.createElement("fxs-icon");
      yieldIcon.classList.add("size-8");
      if (lastProductionData.isUnit) {
        yieldIcon.style.backgroundImage = `url('blp:${detailData.icon}')`;
      } else {
        yieldIcon.setAttribute("data-icon-id", detailData.icon);
      }
      yieldEntry.appendChild(yieldIcon);
      const yieldValue = document.createElement("div");
      yieldValue.textContent = detailData.value;
      yieldEntry.appendChild(yieldValue);
      this.yieldDiv.appendChild(yieldEntry);
    }
    this.Root.setAttribute("data-type", lastProductionData.type);
    if (lastProductionData.isUnit) {
      this.Root.setAttribute("data-tooltip-style", "production-unit-tooltip");
    } else {
      this.Root.setAttribute("data-tooltip-style", "production-constructible-tooltip");
    }
    this.Root.classList.remove("hidden");
  });
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-cityid":
        this.cityID = JSON.parse(newValue);
        this.updateGate.call("onAttributeChanged");
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  onUpdateCityDetails() {
    this.updateGate.call("onUpdateCityDetails");
  }
}
Controls.define("last-production-section", {
  createInstance: LastProductionSection,
  tabIndex: -1,
  attributes: [
    {
      name: "data-cityid"
    }
  ]
});

const categoryLocalizationMap = {
  [ProductionPanelCategory.BUILDINGS]: "LOC_UI_PRODUCTION_BUILDINGS",
  [ProductionPanelCategory.UNITS]: "LOC_UI_PRODUCTION_UNITS",
  [ProductionPanelCategory.WONDERS]: "LOC_UI_PRODUCTION_WONDERS",
  [ProductionPanelCategory.PROJECTS]: "LOC_UI_PRODUCTION_PROJECTS"
};
const productionAccordionCategoryStates = {
  "production-category-buildings": true,
  "production-category-units": true,
  "production-category-wonders": true,
  "production-category-projects": true
};
class ProductionChooserScreen extends Panel {
  SMALL_SCREEN_MODE_MAX_HEIGHT = 900;
  SMALL_SCREEN_MODE_MAX_WIDTH = 1700;
  // Used as a flag to tell the chooser to go back to purchase mode if we were just placing a purchased contructible
  static shouldReturnToPurchase = false;
  // #region Bindings
  focusInListener = this.onFocusIn.bind(this);
  focusOutListener = this.onFocusOut.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  frameEngineInputListener = this.onFrameEngineInput.bind(this);
  requestCloseListener = this.requestClose.bind(this);
  onUpgradeToCityButtonListener = this.onUpgradeToCityButton.bind(this);
  viewFocusListener = this.onViewReceiveFocus.bind(this);
  viewLoseFocusListener = this.onViewLoseFocus.bind(this);
  onNextCityButtonListener = this.onNextCityButton.bind(this);
  onPrevCityButtonListener = this.onPrevCityButton.bind(this);
  onCityDetailsClosedListener = this.onCityDetailsClosed.bind(this);
  onSettlementNameChangedListener = this.onSettlementNameChanged.bind(this);
  onSettlementNameExitListener = this.onSettlementNameExit.bind(this);
  cityYieldBar = document.createElement("yield-bar-base");
  updateCityYieldBar() {
    if (!this._cityID) {
      return;
    }
    const city = Cities.get(this._cityID);
    const cityYields = city?.Yields;
    if (!city || !cityYields) {
      return;
    }
    const yields = cityYields.getYields();
    if (!yields) {
      return;
    }
    const data = [];
    for (const [index, attribute] of yields.entries()) {
      const def = GameInfo.Yields[index];
      if (!def) continue;
      data.push({ type: def.YieldType, value: attribute.value, style: 0 });
    }
    this.cityYieldBar.setAttribute("data-yield-bar", JSON.stringify(data));
  }
  // #endregion
  // #region Component State
  isInitialLoadComplete = false;
  wasQueueInitiallyEmpty = false;
  lastFocusedPanel = null;
  _isPurchase = false;
  set isPurchase(value) {
    if (value === this._isPurchase || !value && this.city.isTown) {
      return;
    }
    this._isPurchase = value;
    this.productionPurchaseTabBar.setAttribute("selected-tab-index", value ? "1" : "0");
    this.updateItems.call("isPurchase");
  }
  get isPurchase() {
    return this._isPurchase;
  }
  _cityID = null;
  set cityID(value) {
    if (value === null || ComponentID.isMatch(value, this._cityID)) {
      return;
    }
    const city = Cities.get(value);
    if (!city) {
      console.error(`panel-production-chooser: Failed to get city with ID: ${ComponentID.toLogString(value)}`);
      return;
    }
    const hasUnrest = city.Happiness?.hasUnrest ?? false;
    const turnsOfUnrest = city.Happiness?.turnsOfUnrest ?? -1;
    const highestActiveUnrestDuration = city.Happiness?.highestActiveUnrestDuration ?? -1;
    const isTown = city.isTown;
    const growthType = city.Growth?.growthType;
    const projectType = city.Growth?.projectType;
    const canPurchaseDuringUnrest = city.Gold?.canPurchaseWhileInUnrest ?? true;
    this._cityID = value;
    this._recommendations = GetCityBuildReccomendations(city);
    this.uqInfo = GetUniqueQuarterForPlayer(city.owner);
    this._isPurchase = city.isTown || ProductionChooserScreen.shouldReturnToPurchase;
    ProductionChooserScreen.shouldReturnToPurchase = false;
    this.productionPurchaseTabBar.setAttribute("selected-tab-index", this._isPurchase ? "1" : "0");
    BuildingPlacementManager.initializePlacementData(this._cityID);
    BuildQueue.cityID = this._cityID;
    this.updateCityName(city);
    this.updateItems.call("cityID");
    const upgradeCost = city.Gold?.getTownUpgradeCost() ?? -1;
    this.updateUpgradeToCityButton(upgradeCost, city.isTown, city.id);
    this.updateCityStatus(city.isBeingRazed, hasUnrest);
    this.updateProductionPurchaseBar(isTown);
    this.updateTownFocusSection(city.id, isTown, hasUnrest, growthType, projectType);
    this.updateUnrestUi({ hasUnrest, turnsOfUnrest, canPurchaseDuringUnrest, highestActiveUnrestDuration });
    const playerCities = Players.get(city.owner)?.Cities?.getCities();
    const hasMultipleCities = playerCities && playerCities?.length > 1;
    this.nextCityButton.classList.toggle("hidden", !hasMultipleCities);
    this.prevCityButton.classList.toggle("hidden", !hasMultipleCities);
    Camera.lookAtPlot(city.location);
    this.lastProductionSection.dataset.cityid = JSON.stringify(this._cityID);
    this.updateCityYieldBar();
  }
  get cityID() {
    if (!this._cityID) {
      this.cityID = UI.Player.getHeadSelectedCity();
    }
    if (!this._cityID || ComponentID.isInvalid(this._cityID)) {
      throw new Error("panel-production-chooser: City ID is invalid or not set");
    }
    return this._cityID;
  }
  get city() {
    return Cities.get(this.cityID);
  }
  _recommendations;
  get recommendations() {
    this._recommendations ??= GetCityBuildReccomendations(this.city);
    return this._recommendations;
  }
  _playerGoldBalance = -1;
  set playerGoldBalance(value) {
    this._playerGoldBalance = value;
    this.updateItems.call("playerGoldBalance");
  }
  get playerGoldBalance() {
    if (this._playerGoldBalance === -1) {
      const value = Players.Treasury.get(GameContext.localPlayerID)?.goldBalance;
      if (value === void 0) {
        console.error(`panel-production-chooser: Failed to get player gold balance`);
        this._playerGoldBalance = -1;
      } else {
        this._playerGoldBalance = value;
      }
    }
    return this._playerGoldBalance;
  }
  itemElementMap = /* @__PURE__ */ new Map();
  _items;
  set items(value) {
    this._items = value;
    this.updateCategories(value);
  }
  get items() {
    this._items ??= GetProductionItems(
      this.city,
      this.recommendations,
      this.playerGoldBalance,
      this.isPurchase,
      this.viewHidden,
      this.uqInfo
    );
    return this._items;
  }
  get viewHiddenActionText() {
    return this.viewHidden ? "LOC_UI_PRODUCTION_HIDE_HIDDEN" : "LOC_UI_PRODUCTION_VIEW_HIDDEN";
  }
  _viewHidden = false;
  get viewHidden() {
    return this._viewHidden;
  }
  set viewHidden(value) {
    this.viewHiddenCheckbox.setAttribute("selected", value.toString());
    if (value === this._viewHidden) {
      return;
    }
    this._viewHidden = value;
    this.updateItems.call("viewHidden");
  }
  uqInfo = null;
  // #endregion
  // #region Element References
  frame = document.createElement("fxs-subsystem-frame");
  cityNameElement = document.createElement(
    Network.hasAccessUGCPrivilege(false) ? "fxs-editable-header" : "fxs-header"
  );
  cityStatusContainerElement = document.createElement("div");
  cityStatusIconElement = document.createElement("img");
  cityStatusTextElement = document.createElement("div");
  subPanelContainer = document.createElement("div");
  townFocusPanel = document.createElement("panel-town-focus");
  townFocusPanelCloseButton = document.createElement("fxs-close-button");
  buildQueue = document.createElement("panel-build-queue");
  prevCityButton = document.createElement("fxs-activatable");
  nextCityButton = document.createElement("fxs-activatable");
  productionPurchaseContainer = document.createElement("div");
  productionPurchaseTabBar = document.createElement("fxs-tab-bar");
  showCityDetailsButton = document.createElement("fxs-activatable");
  townFocusSection = document.createElement("town-focus-section");
  lastProductionSection = document.createElement("last-production-section");
  townUnrestDisplay = document.createElement("town-unrest-display");
  /* townPurchaseLabel replaces the production/purchase tab bar when the settlement is a town */
  townPurchaseLabel = document.createElement("div");
  viewHiddenCheckbox = document.createElement("fxs-checkbox");
  productionAccordion = document.createElement("fxs-vslot");
  productionCategorySlots = Object.values(ProductionPanelCategory).reduce(
    (acc, category) => {
      const id = `production-category-${category}`;
      const isOpen = productionAccordionCategoryStates[id];
      acc[category] = new ProductionChooserAccordionSection(id, categoryLocalizationMap[category], isOpen);
      return acc;
    },
    {}
  );
  upgradeToCityButton;
  upgradeToCityButtonCostElement;
  cityDetailsSlot;
  panelProductionSlot;
  uniqueQuarter = null;
  // #endregion
  // #region Component Lifecycle
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    const [upgradeToCityButton, costElement] = this.renderUpgradeToCityButton();
    this.upgradeToCityButton = upgradeToCityButton;
    this.upgradeToCityButtonCostElement = costElement;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    if (!this.Root.hasAttribute("data-show-town-focus")) {
      this.Root.setAttribute("data-show-town-focus", "false");
    }
    this.cityID = UI.Player.getHeadSelectedCity();
    this.townUnrestDisplay.setAttribute("data-slot", "header");
    this.wasQueueInitiallyEmpty = this.city.BuildQueue?.getQueue().length === 0;
    this.cityNameElement.classList.add("trigger-nav-help");
    this.cityNameElement.setAttribute("header-bg-glow", "true");
    this.productionAccordion.addEventListener(
      ProductionChooserAccordionSectionToggleEventName,
      this.onAccordionSectionToggle
    );
  }
  onAttach() {
    super.onAttach();
    this.cityDetailsSlot = MustGetElement(".panel-city-details-slot", document);
    this.panelProductionSlot = MustGetElement(".panel-production-slot", document);
    for (const [, section] of Object.entries(this.productionCategorySlots)) {
      const isOpen = productionAccordionCategoryStates[section.id];
      section.toggle(isOpen);
    }
    delayByFrame(() => {
      this.isInitialLoadComplete = true;
      engine.on("CityGovernmentLevelChanged", this.onCityGovernmentLevelChanged, this);
      engine.on("CityNameChanged", this.onCityNameChanged, this);
      engine.on("CityMadePurchase", this.onCityMadePurchase, this);
      engine.on("CityGrowthModeChanged", this.onCityGrowthModeChanged, this);
      engine.on("CityProductionQueueChanged", this.onCityProductionQueueChanged, this);
      engine.on("CitySelectionChanged", this.onCitySelectionChanged, this);
      engine.on("CityYieldChanged", this.onCityYieldChanged, this);
      engine.on("CityPopulationChanged", this.onCityPopulationChanged, this);
      engine.on("ConstructibleAddedToMap", this.onConstructibleAddedToMap, this);
      engine.on("InputContextChanged", this.inputContextChangedListener);
      engine.on("TreasuryChanged", this.onPlayerTreasuryChanged, this);
      window.addEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
      window.addEventListener(CityDetailsClosedEventName, this.onCityDetailsClosedListener);
      window.addEventListener(FocusCityViewEventName, this.onFocusCityViewEvent);
      this.Root.addEventListener("focusin", this.focusInListener);
      this.Root.addEventListener("focusout", this.focusOutListener);
      this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
      this.Root.addEventListener("view-receive-focus", this.viewFocusListener);
      this.Root.addEventListener("view-lose-focus", this.viewLoseFocusListener);
      this.frame.addEventListener("subsystem-frame-close", this.requestCloseListener);
      this.frame.addEventListener(InputEngineEventName, this.frameEngineInputListener);
      this.townFocusPanel.addEventListener("chooser-item-selected", this.onTownFocusItemSelected);
      this.viewHiddenCheckbox.addEventListener(ComponentValueChangeEventName, this.onViewHiddenChanged);
      this.productionPurchaseTabBar.addEventListener("tab-selected", this.onProductionPurchaseTabSelected);
      this.nextCityButton.addEventListener("action-activate", this.onNextCityButtonListener);
      this.prevCityButton.addEventListener("action-activate", this.onPrevCityButtonListener);
      this.upgradeToCityButton.addEventListener("action-activate", this.onUpgradeToCityButtonListener);
      this.showCityDetailsButton.addEventListener("action-activate", this.onCityDetailsActivated);
      this.townFocusSection.addEventListener("chooser-item-selected", this.onCurrentFocusItemSelected);
      this.townFocusPanelCloseButton.addEventListener("action-activate", this.onCloseTownFocusPanel);
      this.productionAccordion.addEventListener("chooser-item-selected", this.onChooserItemSelected);
      this.cityNameElement.addEventListener(
        EditableHeaderTextChangedEventName,
        this.onSettlementNameChangedListener
      );
      this.cityNameElement.addEventListener(EditableHeaderExitEditEventName, this.onSettlementNameExitListener);
      this.onInterfaceModeChanged();
      this.updateItems.call("onAttach");
      if (this.city?.isTown) {
        Game.CityOperations.sendRequest(this.cityID, CityOperationTypes.CONSIDER_TOWN_PROJECT, {});
      }
    }, 3);
  }
  onDetach() {
    engine.off("CityGovernmentLevelChanged", this.onCityGovernmentLevelChanged, this);
    engine.off("CityNameChanged", this.onCityNameChanged, this);
    engine.off("CityMadePurchase", this.onCityMadePurchase, this);
    engine.off("CityGrowthModeChanged", this.onCityGrowthModeChanged, this);
    engine.off("CityProductionQueueChanged", this.onCityProductionQueueChanged, this);
    engine.off("CitySelectionChanged", this.onCitySelectionChanged, this);
    engine.off("CityYieldChanged", this.onCityYieldChanged, this);
    engine.off("CityPopulationChanged", this.onCityPopulationChanged, this);
    engine.off("ConstructibleAddedToMap", this.onConstructibleAddedToMap, this);
    engine.off("InputContextChanged", this.inputContextChangedListener);
    engine.off("TreasuryChanged", this.onPlayerTreasuryChanged, this);
    window.removeEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    window.removeEventListener(CityDetailsClosedEventName, this.onCityDetailsClosedListener);
    window.removeEventListener(FocusCityViewEventName, this.onFocusCityViewEvent);
    this.frame.removeEventListener(InputEngineEventName, this.frameEngineInputListener);
    this.frame.removeEventListener("subsystem-frame-close", this.requestCloseListener);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener("focusin", this.focusInListener);
    this.Root.removeEventListener("focusout", this.focusOutListener);
    this.Root.removeEventListener("view-receive-focus", this.viewFocusListener);
    this.Root.removeEventListener("view-receive-focus", this.viewFocusListener);
    this.townFocusPanel.removeEventListener("chooser-item-selected", this.onTownFocusItemSelected);
    this.townFocusPanelCloseButton.removeEventListener("action-activate", this.onCloseTownFocusPanel);
    this.viewHiddenCheckbox.removeEventListener(ComponentValueChangeEventName, this.onViewHiddenChanged);
    this.productionPurchaseTabBar.removeEventListener("tab-selected", this.onProductionPurchaseTabSelected);
    this.nextCityButton.removeEventListener("action-activate", this.onNextCityButtonListener);
    this.prevCityButton.removeEventListener("action-activate", this.onPrevCityButtonListener);
    this.upgradeToCityButton.removeEventListener("action-activate", this.onUpgradeToCityButtonListener);
    this.showCityDetailsButton.removeEventListener("action-activate", this.onCityDetailsActivated);
    this.townFocusSection.removeEventListener("chooser-item-selected", this.onCurrentFocusItemSelected);
    this.productionAccordion.removeEventListener("chooser-item-selected", this.onChooserItemSelected);
    this.cityNameElement.removeEventListener(
      EditableHeaderTextChangedEventName,
      this.onSettlementNameChangedListener
    );
    this.cityNameElement.removeEventListener(EditableHeaderExitEditEventName, this.onSettlementNameExitListener);
    Object.values(this.productionCategorySlots).forEach((slot) => slot.disconnect());
    if (ActionHandler.deviceType == InputDeviceType.Mouse) {
      ActionHandler.forceCursorCheck();
    }
    super.onDetach();
  }
  // #endregion
  // #region Engine Events
  onCitySelectionChanged(data) {
    if (!data.selected) {
      return;
    }
    const c = Cities.get(data.cityID);
    if (!c || c.owner != GameContext.localPlayerID) {
      return;
    } else if (c.isJustConqueredFrom) {
      this.setHidden(true);
      this.cityID = data.cityID;
    } else {
      NavTray.clear();
      NavTray.addOrUpdateGenericBack();
      this.playAnimateInSound();
      this.cityID = data.cityID;
      this.playAnimateOutSound();
      this.setHidden(false);
      this.realizeProductionFocus();
    }
    this.updateNavTray();
  }
  onPlayerTreasuryChanged(data) {
    if (data.player != GameContext.localPlayerID) {
      return;
    }
    this._playerGoldBalance = data.goldBalance;
    const upgradeCost = this.city.Gold?.getTownUpgradeCost() ?? -1;
    const isTown = this.city.isTown;
    this.updateUpgradeToCityButton(upgradeCost, isTown, this.cityID);
  }
  onCityYieldChanged(data) {
    if (ComponentID.isMatch(this._cityID, data.cityID)) {
      this.updateCityYieldBar();
    }
  }
  onCityPopulationChanged(data) {
    if (ComponentID.isMatch(this._cityID, data.cityID)) {
      this.updateCityYieldBar();
    }
  }
  onConstructibleAddedToMap(data) {
    const owningCityID = GameplayMap.getOwningCityFromXY(data.location.x, data.location.y);
    if (owningCityID && ComponentID.isMatch(this.cityID, owningCityID)) {
      this.updateItems.call("onConstructibleAddedToMap");
    }
  }
  onCityProductionQueueChanged({ cityID }) {
    if (ComponentID.isMatch(this.cityID, cityID)) {
      BuildingPlacementManager.initializePlacementData(cityID);
      this.updateItems.call("onCityProductionQueueChanged");
    }
  }
  // #endregion
  // #region DOM Events
  onAccordionSectionToggle = (event) => {
    const { isOpen } = event.detail;
    const target = event.target;
    if (target instanceof HTMLElement) {
      productionAccordionCategoryStates[target.id] = isOpen;
    }
  };
  onChooserItemSelected = (event) => {
    if (IsElement(event.target, "production-chooser-item") && event.target.hasAttribute("data-repair-all")) {
      Audio.playSound("data-audio-repair-all", "audio-production-chooser");
      this.items.buildings.forEach((item) => {
        item.interfaceMode = "";
        if (item.repairDamaged) {
          RepairConstruct(this.city, item, this.isPurchase);
        }
      });
    } else if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_PLACE_BUILDING") && IsElement(event.target, "production-chooser-item")) {
      const category = event.target.dataset.category;
      const type = event.target.dataset.type;
      if (category && type) {
        this.doOrConfirmConstruction(category, type);
      }
    }
  };
  onTownFocusItemSelected = (event) => {
    if (IsElement(event.target, "town-focus-chooser-item")) {
      const { growthType, projectType } = event.target.dataset;
      if (growthType && projectType) {
        const showConfirmationDialog = parseInt(growthType) !== GrowthTypes.EXPAND;
        if (showConfirmationDialog) {
          DialogBoxManager.createDialog_ConfirmCancel({
            body: "LOC_TOWN_SET_FOCUS_DIALOG_BODY",
            title: "LOC_TOWN_SET_FOCUS_DIALOG_TITLE",
            callback: (eAction) => {
              if (eAction == DialogBoxAction.Confirm) {
                SetTownFocus(this.cityID, growthType, projectType);
                return;
              }
              FocusManager.setFocus(this.townFocusPanel);
            }
          });
        } else {
          SetTownFocus(this.cityID, growthType, projectType);
        }
      } else {
        console.error(
          `panel-production-chooser: onTownFocusItemSelected: Failed to get valid growthType or projectType`
        );
      }
      event.stopPropagation();
      event.preventDefault();
    }
  };
  onCloseTownFocusPanel = () => {
    this.Root.dataset.showTownFocus = "false";
  };
  onSettlementNameExit() {
    this.realizeProductionFocus();
  }
  onSettlementNameChanged(event) {
    const args = {
      Name: Locale.toUpper(event.detail.newStr)
    };
    if (!this._cityID) {
      console.error(
        `panel-production-chooser: onSettlementNameChanged - cityID was null during name change operation!`
      );
      this.realizeProductionFocus();
      return;
    }
    if (event.detail.newStr.trim().length == 0) {
      const city = Cities.get(this._cityID);
      if (city) {
        this.cityNameElement.setAttribute("title", city.name);
      }
      return;
    }
    const locName = Locale.compose(this.city.name);
    if (event.detail.newStr == locName) {
      return;
    }
    const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.NAME_CITY, args, false);
    if (result.Success) {
      Game.CityCommands.sendRequest(this._cityID, CityCommandTypes.NAME_CITY, args);
    } else {
      console.error(
        "panel-production-chooser: onSettlementNameChanged - city name change operation failed!",
        result.FailureReasons
      );
    }
  }
  onCityGrowthModeChanged({ cityID }) {
    const city = this.city;
    if (city && ComponentID.isMatch(this.cityID, cityID)) {
      this.updateTownFocusSection(
        city.id,
        city.isTown,
        city.Happiness?.hasUnrest,
        city.Growth?.growthType,
        city.Growth?.projectType
      );
      this.Root.dataset.showTownFocus = "false";
      FocusManager.setFocus(this.townFocusSection);
      this.updateItems.call("townFocus");
      this.townFocusPanel.dispatchEvent(new TownFocusRefreshEvent());
    }
  }
  onCityGovernmentLevelChanged({ cityID, governmentlevel }) {
    const city = Cities.get(cityID);
    if (city && ComponentID.isMatch(this.cityID, cityID)) {
      const isTown = governmentlevel === CityGovernmentLevels.TOWN;
      BuildingPlacementManager.initializePlacementData(cityID);
      this.updateProductionPurchaseBar(isTown);
      this.updateTownFocusSection(
        this.cityID,
        isTown,
        city.Happiness?.hasUnrest,
        city.Growth?.growthType,
        city.Growth?.projectType
      );
      this.updateUpgradeToCityButton(city.Gold?.getTownUpgradeCost() ?? -1, isTown, this.cityID);
      this.updateItems.call("onCityGovernmentLevelChanged");
    }
  }
  onCityNameChanged(data) {
    const city = Cities.get(data.cityID);
    if (city) {
      this.updateCityName(city);
    }
  }
  onCityMadePurchase({ cityID }) {
    const city = Cities.get(cityID);
    if (city && ComponentID.isMatch(this.cityID, cityID)) {
      BuildingPlacementManager.initializePlacementData(cityID);
      this.updateItems.call("onCityModePurchase");
    }
  }
  onCurrentFocusItemSelected = (event) => {
    this.Root.dataset.showTownFocus = "true";
    event.stopPropagation();
    event.preventDefault();
  };
  onViewHiddenChanged = (e) => {
    this.viewHidden = e.detail.value;
  };
  onPrevCityButton() {
    const prevCityId = GetPrevCityID(this.cityID);
    if (ComponentID.isValid(prevCityId)) {
      UI.Player.selectCity(prevCityId);
      const city = Cities.get(prevCityId);
      if (city) {
        PlotCursor.plotCursorCoords = city.location;
      }
    }
  }
  onCityDetailsClosed() {
    this.panelProductionSlot.classList.remove("hidden");
    this.frame.classList.add("trigger-nav-help");
    this.cityNameElement.classList.add("trigger-nav-help");
    FocusManager.setFocus(this.productionAccordion);
  }
  onNextCityButton() {
    const nextCityId = GetNextCityID(this.cityID);
    if (ComponentID.isValid(nextCityId)) {
      UI.Player.selectCity(nextCityId);
      const city = Cities.get(nextCityId);
      if (city) {
        PlotCursor.plotCursorCoords = city.location;
      }
    }
  }
  isSmallScreen() {
    return window.innerHeight <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_HEIGHT) || window.innerWidth <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_WIDTH);
  }
  onCityDetailsActivated = () => {
    this.panelProductionSlot.classList.toggle("hidden", this.isSmallScreen());
    this.frame.classList.remove("trigger-nav-help");
    this.showCityDetails();
  };
  onFocusIn(event) {
    const focusedPanel = event.target instanceof HTMLElement ? this.getElementParentPanel(event.target) : null;
    if (focusedPanel !== this.lastFocusedPanel) {
      this.lastFocusedPanel?.classList.remove("trigger-nav-help");
      focusedPanel?.classList.add("trigger-nav-help");
      this.lastFocusedPanel = focusedPanel;
      if (focusedPanel === this.frame) {
        this.updateNavTray();
      }
    }
  }
  onFocusOut(event) {
    const relatedTarget = event.relatedTarget;
    if (!(relatedTarget instanceof HTMLElement)) return;
    if (!this.Root.contains(relatedTarget)) {
      this.lastFocusedPanel?.classList.remove("trigger-nav-help");
      this.lastFocusedPanel = null;
    }
  }
  onUpgradeToCityButton() {
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_PROJECT_TOWN_UPGRADE_DIALOG_BODY",
      title: "LOC_PROJECT_TOWN_UPGRADE_DIALOG_TITLE",
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          const success = ConvertToCity(this.cityID);
          if (!success) {
          }
        }
        this.updateNavTray();
      }
    });
  }
  onFocusCityViewEvent = (event) => {
    if (event.detail.destination != "left") {
      return;
    }
    FocusManager.setFocus(this.productionAccordion);
  };
  // #endregion
  showCityDetails() {
    const cityDetailsPanel = this.cityDetailsSlot.querySelector(".panel-city-details");
    if (cityDetailsPanel) {
      cityDetailsPanel.maybeComponent?.update();
      cityDetailsPanel.classList.toggle("hidden");
      if (!cityDetailsPanel.classList.contains("hidden")) {
        FocusManager.setFocus(cityDetailsPanel);
        Audio.playSound("data-audio-city-details-enter", "city-actions");
      } else {
        Audio.playSound("data-audio-city-details-exit", "city-actions");
      }
    } else {
      const newCityDetailsPanel = document.createElement("panel-city-details");
      this.cityDetailsSlot.appendChild(newCityDetailsPanel);
      FocusManager.setFocus(newCityDetailsPanel);
      Audio.playSound("data-audio-city-details-enter", "city-actions");
    }
    this.cityNameElement.classList.remove("trigger-nav-help");
    this.lastFocusedPanel?.classList.remove("trigger-nav-help");
    this.lastFocusedPanel = null;
  }
  getElementParentPanel(element) {
    if (this.frame.contains(element)) {
      return this.frame;
    } else if (this.townFocusPanel.contains(element)) {
      return this.townFocusPanel;
    } else if (this.buildQueue.contains(element)) {
      return this.buildQueue;
    } else {
      return null;
    }
  }
  requestPlaceBuildingClose(inputEvent) {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_PLACE_BUILDING")) {
      return;
    }
    inputEvent?.stopPropagation();
    inputEvent?.preventDefault();
    this.playSound("data-audio-activate");
  }
  doOrConfirmConstruction(category, type, animationConfirmCallback) {
    const city = this.city;
    if (!city) {
      console.error(`panel-production-chooser: confirmSelection: Failed to get a valid city!`);
      return;
    }
    const item = this.items[category].find((item2) => item2.type === type);
    if (!item) {
      console.error(`panel-production-chooser: confirmSelection: Failed to get a valid item!`);
      return;
    }
    const queueLengthBeforeAdd = BuildQueue.items.length;
    const bSuccess = Construct(city, item, this.isPurchase);
    if (bSuccess) {
      if (queueLengthBeforeAdd > 0) {
        Audio.playSound("data-audio-queue-item", "audio-production-chooser");
      }
      animationConfirmCallback?.();
      if (this.wasQueueInitiallyEmpty && !this.isPurchase && !Configuration.getUser().isProductionPanelStayOpen) {
        UI.Player.deselectAllCities();
        InterfaceMode.switchToDefault();
        this.requestPlaceBuildingClose();
      }
    }
    if (queueLengthBeforeAdd == 0) {
      Audio.playSound("data-audio-city-production-activate", "city-actions");
    }
  }
  onProductionPurchaseTabSelected = (e) => {
    const isPurchase = e.detail.selectedItem.id === "production-chooser-tab-purchase";
    if (isPurchase === this.isPurchase) {
      return;
    }
    this.isPurchase = isPurchase;
    if (this.isPurchase) {
      Audio.playSound("data-audio-city-production-purchase-mode", "city-actions");
    }
  };
  requestClose() {
    const selectedCityID = UI.Player.getHeadSelectedCity();
    if (!selectedCityID && InterfaceMode.isInInterfaceMode("INTERFACEMODE_DEFAULT")) {
      ViewManager.setCurrentByName("World");
    }
    UI.Player.deselectAllCities();
    super.close();
  }
  updateItemElementMap(items) {
    for (const item of items) {
      let chooserItem = this.itemElementMap.get(item.type);
      if (!chooserItem) {
        chooserItem = CreateProductionChooserItem();
        this.itemElementMap.set(item.type, chooserItem);
      }
      UpdateProductionChooserItem(chooserItem, item, this.isPurchase);
    }
  }
  realizeCategory(category, items) {
    const { slot } = this.productionCategorySlots[category];
    for (const item of items) {
      let element = this.itemElementMap.get(item.type);
      if (!element) {
        element = CreateProductionChooserItem();
        this.itemElementMap.set(item.type, element);
        UpdateProductionChooserItem(element, item, this.isPurchase);
      }
      if (!this.uniqueQuarter?.containsBuilding(element)) {
        slot.appendChild(element);
      }
    }
  }
  updateCategories(items) {
    for (const category of Object.values(ProductionPanelCategory)) {
      this.updateItemElementMap(items[category]);
    }
    const city = this.city;
    const uq = GetUniqueQuarterForPlayer(city.owner);
    const buildingSlot = this.productionCategorySlots[ProductionPanelCategory.BUILDINGS].slot;
    if (uq) {
      const buildingOneChooserItem = this.itemElementMap.get(uq.uniqueQuarterDef.BuildingType1);
      const buildingTwoChooserItem = this.itemElementMap.get(uq.uniqueQuarterDef.BuildingType2);
      if (buildingOneChooserItem && buildingTwoChooserItem) {
        this.uniqueQuarter ??= new UniqueQuarter();
        this.uniqueQuarter.definition = uq.uniqueQuarterDef;
        this.uniqueQuarter.numCompleted = GetNumUniqueQuarterBuildingsCompleted(city, uq.uniqueQuarterDef);
        this.uniqueQuarter.setBuildings(buildingOneChooserItem, buildingTwoChooserItem);
        buildingSlot.insertAdjacentElement("afterbegin", this.uniqueQuarter.root);
      } else {
        this.uniqueQuarter?.root.remove();
        this.uniqueQuarter = null;
      }
    }
    for (const category of Object.values(ProductionPanelCategory)) {
      this.realizeCategory(category, items[category]);
    }
  }
  updateItems = new UpdateGate(() => {
    if (!this.isInitialLoadComplete) {
      return;
    }
    const city = this.city;
    const items = GetProductionItems(
      city,
      this.recommendations,
      this.playerGoldBalance,
      this.isPurchase,
      this.viewHidden,
      this.uqInfo
    );
    const newItems = Object.values(ProductionPanelCategory).flatMap(
      (category) => items[category].map((item) => item.type)
    );
    const newItemsSet = new Set(newItems);
    let resetFocus = false;
    const currentFocus = FocusManager.getFocus();
    for (const [type, item] of this.itemElementMap) {
      if (!newItemsSet.has(type)) {
        resetFocus ||= currentFocus === item;
        item.remove();
        this.itemElementMap.delete(type);
      }
    }
    this.items = items;
    if (resetFocus || this.Root.contains(currentFocus) && !this.buildQueue.contains(currentFocus)) {
      FocusManager.setFocus(this.productionAccordion);
    }
  });
  updateCityName(city) {
    this.cityNameElement.setAttribute("title", city.name);
  }
  updateUpgradeToCityButton(upgradeCost, isTown, cityID) {
    const result = CanConvertToCity(cityID);
    this.upgradeToCityButton.setAttribute("disabled", result.Success ? "false" : "true");
    this.upgradeToCityButton.classList.toggle("hidden", !isTown);
    this.upgradeToCityButtonCostElement.textContent = upgradeCost.toString();
    if (result.FailureReasons) {
      const failureTooltip = result.FailureReasons.join("\n");
      this.upgradeToCityButton.setAttribute("data-tooltip-content", failureTooltip);
    } else {
      this.upgradeToCityButton.removeAttribute("data-tooltip-content");
    }
  }
  onFrameEngineInput(inputEvent) {
    const live = this.handleFrameEngineInput(inputEvent);
    if (!live) {
      inputEvent.preventDefault();
      inputEvent.stopImmediatePropagation();
    }
  }
  onInputContextChanged(contextData) {
    if (contextData.newContext != InputContext.Dual) {
      this.prevCityButton.classList.add("hidden");
      this.nextCityButton.classList.add("hidden");
    } else {
      this.prevCityButton.classList.remove("hidden");
      this.nextCityButton.classList.remove("hidden");
    }
  }
  handleFrameEngineInput(inputEvent) {
    const { name, status } = inputEvent.detail;
    if (status != InputActionStatuses.FINISH) {
      return !(name === "camera-zoom-in" || name === "camera-zoom-out");
    }
    let live = false;
    switch (name) {
      case "shell-action-1":
        if (this.city?.isTown && CanConvertToCity(this.cityID).Success) {
          this.onUpgradeToCityButton();
          Audio.playSound("data-audio-tab-selected");
          if (this.isPurchase) {
            Audio.playSound("data-audio-city-production-purchase-mode", "city-actions");
          }
          live = true;
        }
        break;
      case "shell-action-2":
        this.viewHidden = !this.viewHidden;
        Audio.playSound("data-audio-checkbox-press");
        break;
      case "camera-zoom-out":
        this.onPrevCityButton();
        break;
      case "camera-zoom-in":
        this.onNextCityButton();
        break;
      case "accept":
        live = false;
        break;
      default:
        live = true;
        break;
    }
    if (!live) {
      this.updateNavTray();
    }
    return live;
  }
  onEngineInput(inputEvent) {
    const live = this.handleEngineInput(inputEvent);
    if (!live) {
      inputEvent.preventDefault();
      inputEvent.stopImmediatePropagation();
    }
  }
  handleEngineInput(inputEvent) {
    const { name, status } = inputEvent.detail;
    if (status != InputActionStatuses.FINISH) {
      return !(name === "camera-zoom-in" || name === "camera-zoom-out" || name == "accept");
    }
    let live = false;
    switch (name) {
      case "cancel":
        if (this.Root.dataset.showTownFocus === "true") {
          this.Root.dataset.showTownFocus = "false";
          FocusManager.setFocus(this.townFocusSection);
        } else {
          live = true;
        }
        break;
      case "accept":
        live = false;
        break;
      default:
        live = true;
        break;
    }
    if (!live) {
      this.updateNavTray();
    }
    return live;
  }
  updateNavTray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    const currentFocus = FocusManager.getFocus();
    if (currentFocus?.closest("panel-build-queue") || currentFocus?.closest("panel-town-focus")) {
      return;
    }
    NavTray.addOrUpdateShellAction2(this.viewHiddenActionText);
  }
  onInterfaceModeChanged = () => {
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_CITY_PRODUCTION":
        if (!this.city.isJustConqueredFrom) {
          FocusManager.setFocus(this.productionAccordion);
          this.updateNavTray();
          this.setHidden(false);
        } else {
          this.setHidden(true);
        }
        break;
      default:
        this.setHidden(true);
        break;
    }
  };
  setHidden(hidden) {
    this.Root.classList.toggle("hidden", hidden);
    this.buildQueue?.classList.toggle("collapsed", hidden);
  }
  /**
   * City View receives focus
   */
  onViewReceiveFocus() {
    this.realizeProductionFocus();
  }
  onViewLoseFocus() {
    NavTray.clear();
  }
  realizeProductionFocus() {
    const cityDetailsPanel = this.cityDetailsSlot.querySelector(".panel-city-details");
    if (this.Root.dataset.showTownFocus === "true" || cityDetailsPanel && !cityDetailsPanel.classList.contains("hidden")) {
      return;
    }
    FocusManager.setFocus(this.productionAccordion);
    this.updateNavTray();
    if (this.city?.isTown) {
      Game.CityOperations.sendRequest(this.cityID, CityOperationTypes.CONSIDER_TOWN_PROJECT, {});
    }
  }
  updateCityStatus(isBeingRazed, hasUnrest) {
    let hideStatus = false;
    if (isBeingRazed) {
      this.cityStatusTextElement.setAttribute("data-l10n-id", "LOC_ATTR_RAZED_CITY_UNHAPPINESS");
    } else if (hasUnrest) {
      this.cityStatusTextElement.setAttribute("data-l10n-id", "LOC_CITY_UNREST");
    } else {
      hideStatus = true;
    }
    this.cityStatusContainerElement.classList.toggle("hidden", hideStatus);
  }
  updateTownFocusSection(cityID, isTown, hasUnrest, currentGrowthType, currentProjectType) {
    if (isTown) {
      const currentFocusProject = GetCurrentTownFocus(cityID, currentGrowthType, currentProjectType);
      if (!currentFocusProject) {
        return;
      }
      const { name, description, tooltipDescription, growthType, projectType } = currentFocusProject;
      const showDefaultLabel = growthType === GrowthTypes.EXPAND && projectType === ProjectTypes.NO_PROJECT;
      this.townFocusSection.dataset.growthType = growthType.toString();
      this.townFocusSection.dataset.projectType = projectType.toString();
      this.townFocusSection.dataset.name = name;
      if (window.innerHeight < Layout.pixelsToScreenPixels(768)) {
        this.townFocusSection.dataset.description = "";
      } else {
        this.townFocusSection.dataset.description = description;
      }
      if (tooltipDescription) {
        this.townFocusSection.dataset.tooltipDescription = window.innerHeight < Layout.pixelsToScreenPixels(768) ? `${Locale.compose(description)}[N]${Locale.compose(tooltipDescription)}` : tooltipDescription;
      } else {
        this.townFocusSection.removeAttribute("data-tooltip-description");
      }
      this.townFocusSection.dataset.disabled = hasUnrest ? "true" : "false";
      this.townFocusSection.dataset.showDefaultLabel = showDefaultLabel.toString();
      if (window.innerHeight < Layout.pixelsToScreenPixels(768)) {
        this.townFocusSection.classList.toggle("hidden", hasUnrest);
      } else {
        this.townFocusSection.classList.remove("hidden");
      }
    } else {
      this.townFocusSection.classList.add("hidden");
      this.Root.dataset.showTownFocus = "false";
    }
  }
  updateUnrestUi({
    hasUnrest,
    turnsOfUnrest,
    canPurchaseDuringUnrest,
    highestActiveUnrestDuration
  }) {
    this.townFocusSection.dataset.disabled = hasUnrest ? "true" : "false";
    this.townUnrestDisplay.classList.toggle("hidden", !hasUnrest);
    this.productionPurchaseContainer.classList.toggle("hidden", hasUnrest && !canPurchaseDuringUnrest);
    if (hasUnrest) {
      this.townUnrestDisplay.dataset.turnsOfUnrest = turnsOfUnrest.toString();
    }
    this.townUnrestDisplay.dataset.highestActiveUnrestDuration = highestActiveUnrestDuration.toString();
  }
  updateProductionPurchaseBar(isTown) {
    this.productionPurchaseTabBar.classList.toggle("hidden", isTown);
    this.townPurchaseLabel.classList.toggle("hidden", !isTown);
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-show-town-focus":
        this.townFocusPanel.classList.toggle("hidden", newValue !== "true");
        if (oldValue === "false" && newValue === "true") {
          Audio.playSound("data-audio-showing", "town-specialization-panel");
        } else if (oldValue === "true" && newValue === "false") {
          Audio.playSound("data-audio-hiding", "town-specialization-panel");
        }
        FocusManager.setFocus(this.townFocusPanel);
        this.updateNavTray();
        break;
    }
  }
  renderUpgradeToCityButton() {
    const upgradeToCityButton = document.createElement("chooser-item");
    upgradeToCityButton.setAttribute("hover-only-trigger", "false");
    upgradeToCityButton.setAttribute("action-key", "inline-shell-action-1");
    waitForLayout(() => upgradeToCityButton.removeAttribute("tabindex"));
    upgradeToCityButton.classList.add(
      "flex-row-reverse",
      "flex",
      "text-accent-2",
      "font-title",
      "uppercase",
      "p-2"
    );
    upgradeToCityButton.dataset.slot = "footer";
    const upgradeToCityButtonContent = document.createElement("div");
    upgradeToCityButtonContent.classList.add("flex-auto", "relative", "flex", "items-center");
    const upgradeToCityButtonLabel = document.createElement("div");
    upgradeToCityButtonLabel.classList.add("ml-1", "flex-auto", "text-base");
    upgradeToCityButtonLabel.setAttribute("data-l10n-id", "LOC_UI_CONVERT_TO_CITY");
    const costWrapper = document.createElement("div");
    costWrapper.className = "flex items-center";
    const costElement = document.createElement("div");
    costElement.className = "text-sm font-body tracking-25";
    const fxsIcon = document.createElement("fxs-icon");
    fxsIcon.className = "size-8 bg-no-repeat bg-center bg-contain";
    fxsIcon.ariaLabel = Locale.compose("LOC_YIELD_GOLD");
    fxsIcon.setAttribute("data-icon-context", "YIELD");
    fxsIcon.setAttribute("data-icon-id", "YIELD_GOLD");
    costWrapper.appendChild(costElement);
    costWrapper.appendChild(fxsIcon);
    upgradeToCityButtonContent.appendChild(upgradeToCityButtonLabel);
    upgradeToCityButtonContent.appendChild(costWrapper);
    upgradeToCityButton.appendChild(upgradeToCityButtonContent);
    return [upgradeToCityButton, costElement];
  }
  render() {
    this.Root.classList.add("panel-production-chooser", "relative", "z-0", "flex", "flex-col", "flex-auto");
    this.Root.setAttribute("data-tooltip-anchor", "right");
    this.cityStatusContainerElement.classList.add(
      "hidden",
      "min-h-6",
      "flex",
      "items-center",
      "justify-center",
      "mb-1"
    );
    this.cityStatusContainerElement.dataset.slot = "header";
    this.cityStatusIconElement.src = "fs://game/yield_angry.png";
    this.cityStatusIconElement.classList.value = "size-6 bg-contain bg-center bg-no-repeat mr-1";
    this.cityStatusContainerElement.appendChild(this.cityStatusIconElement);
    this.cityStatusTextElement.classList.value = "font-title text-base text-negative-light tracking-100 uppercase";
    this.cityStatusContainerElement.appendChild(this.cityStatusTextElement);
    this.frame.appendChild(this.cityStatusContainerElement);
    const cityNameWrapper = document.createElement("div");
    cityNameWrapper.classList.add("flex", "items-start", "justify-between");
    Databind.classToggle(cityNameWrapper, "mx-14", "!{{g_NavTray.isTrayRequired}}");
    Databind.classToggle(cityNameWrapper, "mx-2", "{{g_NavTray.isTrayRequired}}");
    cityNameWrapper.classList.toggle("px-6", UI.getViewExperience() == UIViewExperience.Mobile);
    cityNameWrapper.dataset.slot = "header";
    this.prevCityButton.classList.add("flex", "flex-row", "items-center");
    this.prevCityButton.setAttribute("action-key", "inline-prev-city");
    const prevCityButtonArrow = document.createElement("div");
    prevCityButtonArrow.classList.add("img-arrow", "w-8", "h-12", "-mt-2");
    Databind.classToggle(prevCityButtonArrow, "hidden", "{{g_NavTray.isTrayRequired}}");
    this.prevCityButton.appendChild(prevCityButtonArrow);
    cityNameWrapper.appendChild(this.prevCityButton);
    const cityNameContainer = document.createElement("div");
    cityNameContainer.classList.add("flex", "flex-col", "max-w-full", "flex-auto", "px-6");
    cityNameContainer.appendChild(this.cityStatusContainerElement);
    this.cityNameElement.classList.add(
      "flex-auto",
      "px-4",
      "text-lg",
      "text-center",
      "font-title",
      "uppercase",
      "tracking-100"
    );
    this.cityNameElement.classList.toggle("mx-8", UI.getViewExperience() == UIViewExperience.Mobile);
    this.cityNameElement.setAttribute("header-bg-glow", "true");
    this.cityNameElement.setAttribute("font-fit-mode", "shrink");
    this.cityNameElement.setAttribute("filigree-style", "small");
    this.cityNameElement.setAttribute("wrap", "nowrap");
    this.cityNameElement.setAttribute("tab-for", "panel-production-chooser");
    cityNameContainer.appendChild(this.cityNameElement);
    cityNameWrapper.appendChild(cityNameContainer);
    this.nextCityButton.classList.add("flex", "flex-row-reverse", "items-center");
    this.nextCityButton.setAttribute("action-key", "inline-next-city");
    const nextCityButtonArrow = document.createElement("div");
    nextCityButtonArrow.classList.add("img-arrow", "w-8", "h-12", "-mt-2", "-scale-x-100");
    Databind.classToggle(nextCityButtonArrow, "hidden", "{{g_NavTray.isTrayRequired}}");
    this.nextCityButton.appendChild(nextCityButtonArrow);
    cityNameWrapper.appendChild(this.nextCityButton);
    this.frame.appendChild(cityNameWrapper);
    this.frame.classList.add("shrink", "pointer-events-auto", "panel-production__frame");
    Databind.classToggle(this.frame, "mb-16", "{{g_NavTray.isTrayRequired}}");
    this.frame.dataset.headerClass = "flex flex-col flex-initial px-3 mx-0\\.5";
    this.frame.dataset.footerClass = "px-5 pb-2 mx-0\\.5";
    const yieldBarRow = document.createElement("div");
    yieldBarRow.classList.value = "flex self-center justify-center items-center";
    yieldBarRow.dataset.slot = "header";
    this.frame.appendChild(yieldBarRow);
    this.showCityDetailsButton.classList.value = "relative flex items-center justify-center production-chooser__city-details-button mr-2";
    this.showCityDetailsButton.setAttribute("tabindex", "-1");
    const buttonHighlight = document.createElement("div");
    buttonHighlight.classList.add("absolute", "inset-0", "city-details-highlight");
    this.showCityDetailsButton.appendChild(buttonHighlight);
    const showCityDetailsIcon = document.createElement("div");
    showCityDetailsIcon.classList.value = "img-city-details relative";
    this.showCityDetailsButton.appendChild(showCityDetailsIcon);
    this.showCityDetailsButton.setAttribute("data-audio-press-ref", "data-audio-select-press");
    this.showCityDetailsButton.setAttribute("data-audio-activate-ref", "none");
    yieldBarRow.appendChild(this.showCityDetailsButton);
    this.cityYieldBar.classList.add("flex", "self-center");
    yieldBarRow.appendChild(this.cityYieldBar);
    this.updateCityYieldBar();
    this.townFocusSection.dataset.slot = "header";
    this.frame.appendChild(this.townFocusSection);
    this.lastProductionSection.dataset.slot = "header";
    this.frame.appendChild(this.lastProductionSection);
    const viewHiddenCheckboxLabel = document.createElement("p");
    viewHiddenCheckboxLabel.classList.value = "text-xs";
    viewHiddenCheckboxLabel.setAttribute("data-l10n-id", "LOC_UI_PRODUCTION_VIEW_HIDDEN");
    const viewHiddenContainer = document.createElement("div");
    Databind.classToggle(viewHiddenContainer, "hidden", "{{g_NavTray.isTrayRequired}}");
    viewHiddenContainer.classList.value = "flex items-center self-end pr-7 pb-3";
    viewHiddenContainer.appendChild(this.viewHiddenCheckbox);
    viewHiddenContainer.appendChild(viewHiddenCheckboxLabel);
    viewHiddenContainer.dataset.slot = "header";
    this.frame.appendChild(viewHiddenContainer);
    this.productionPurchaseContainer.classList.value = "flex items-center";
    this.productionPurchaseContainer.setAttribute("data-slot", "header");
    this.townPurchaseLabel.classList.value = "flex flex-auto items-center justify-center";
    this.townPurchaseLabel.insertAdjacentHTML(
      "beforeend",
      `
		 	<div class="text-secondary-2 text-gradient-secondary text-xs font-title uppercase" data-l10n-id="LOC_UI_PURCHASE_TAB"></div>
		`
    );
    this.productionPurchaseContainer.appendChild(this.townPurchaseLabel);
    const productionPurchaseTabBarTabs = [
      {
        id: "production-chooser-tab-production",
        label: "LOC_UI_PRODUCTION_TAB",
        className: "px-2"
      },
      {
        id: "production-chooser-tab-purchase",
        label: "LOC_UI_PURCHASE_TAB",
        className: "px-2"
      }
    ];
    this.productionPurchaseTabBar.classList.add("flex-auto", "max-h-12", "mb-1", "mx-6");
    this.productionPurchaseTabBar.setAttribute("tab-style", "flat");
    this.productionPurchaseTabBar.setAttribute("nav-help-left-class", "pl-2");
    this.productionPurchaseTabBar.setAttribute("nav-help-right-class", "pr-2");
    this.productionPurchaseTabBar.setAttribute("tab-items", JSON.stringify(productionPurchaseTabBarTabs));
    this.productionPurchaseTabBar.setAttribute("data-slot", "header");
    this.productionPurchaseTabBar.setAttribute("tab-for", ".panel-production__frame");
    this.productionPurchaseTabBar.setAttribute("alt-controls", "false");
    this.productionPurchaseTabBar.setAttribute("data-audio-group-ref", "city-actions");
    this.productionPurchaseTabBar.setAttribute("data-audio-tab-selected", "none");
    this.productionPurchaseContainer.appendChild(this.productionPurchaseTabBar);
    this.frame.appendChild(this.productionPurchaseContainer);
    this.upgradeToCityButton.dataset.slot = "footer";
    this.upgradeToCityButton.setAttribute("caption", "LOC_PROJECT_TOWN_PROMOTION_NAME");
    this.upgradeToCityButton.setAttribute("data-audio-group-ref", "city-actions");
    this.upgradeToCityButton.setAttribute("data-audio-activate-ref", "data-audio-city-production-upgrade");
    this.upgradeToCityButton.setAttribute("tabindex", "-1");
    this.frame.appendChild(this.upgradeToCityButton);
    this.frame.appendChild(this.townUnrestDisplay);
    this.productionAccordion.classList.add("relative");
    this.productionAccordion.setAttribute("disable-focus-allowed", "true");
    for (const category of Object.values(ProductionPanelCategory)) {
      const section = this.productionCategorySlots[category];
      this.productionAccordion.appendChild(section.root);
    }
    this.frame.appendChild(this.productionAccordion);
    this.subPanelContainer.classList.add("-z-1", "mt-32", "mb-12", "-ml-10", "relative", "shrink");
    this.buildQueue.classList.add("absolute", "left-3", "h-full");
    this.subPanelContainer.appendChild(this.buildQueue);
    this.townFocusPanelCloseButton.classList.add("absolute", "top-0", "right-0");
    this.townFocusPanel.appendChild(this.townFocusPanelCloseButton);
    this.subPanelContainer.appendChild(this.townFocusPanel);
    const productionChooserHSlot = document.createElement("fxs-hslot");
    productionChooserHSlot.classList.add("flex-auto");
    productionChooserHSlot.appendChild(this.frame);
    productionChooserHSlot.appendChild(this.subPanelContainer);
    this.Root.appendChild(productionChooserHSlot);
  }
}
Controls.define("panel-production-chooser", {
  createInstance: ProductionChooserScreen,
  description: "",
  attributes: [{ name: "data-show-town-focus" }],
  styles: [styles]
});

export { ProductionChooserScreen };
//# sourceMappingURL=panel-production-chooser.js.map
