import { render } from '../../../core/vendor/solid-js/web/dist/web.js';
import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import Panel from '../../../core/ui/panel-support.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import Databind from '../../../core/ui/utilities/utilities-core-databinding.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import { TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../core/ui-next/components/tooltip.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import CityDetails, { UpdateCityDetailsEventName } from './model-city-details.js';
import { GetPrevCityID, GetNextCityID } from '../production-chooser/production-chooser-helpers.js';
import { OVERLAY_PRIORITY } from '../utilities/utilities-overlay.js';
import { ProductionTooltip } from '../../ui-next/tooltips/production-tooltip.js';
import { WarehouseBreakdownTooltip } from '../../ui-next/tooltips/warehouse-breakdown-tooltip.js';
import styles from './panel-city-details.scss.js';

const ShowCityDetailsEventName = "show-city-details";
class ShowCityDetailsEvent extends CustomEvent {
  constructor(detail) {
    super(ShowCityDetailsEventName, { bubbles: false, detail });
  }
}
const CityDetailsClosedEventName = "city-details-closed";
class CityDetailsClosedEvent extends CustomEvent {
  constructor() {
    super(CityDetailsClosedEventName, { bubbles: false });
  }
}
var cityDetailTabID = /* @__PURE__ */ ((cityDetailTabID2) => {
  cityDetailTabID2["growth"] = "city-details-tab-growth";
  cityDetailTabID2["buildings"] = "city-details-tab-buildings";
  cityDetailTabID2["yields"] = "city-details-tab-yields";
  return cityDetailTabID2;
})(cityDetailTabID || {});
const happinessStages = [];
GameInfo.HappinessStages.forEach((row) => {
  happinessStages.push({
    happinessStage: row.HappinessStageType,
    name: row.HappinessStageType.replace("HAPPINESS_STAGE_", "LOC_UI_CITY_DETAILS_"),
    icon: row.HappinessStageType.replace("HAPPINESS_STAGE_", "YIELD_"),
    textColor: row.HappinessStageType.replace("HAPPINESS_STAGE_", "").toLowerCase() + "-text",
    min: row.StageMinThreshold ?? -Infinity,
    max: row.StageMaxThreshold ?? Infinity
  });
});
const cityDetailTabItems = [
  {
    id: "city-details-tab-growth" /* growth */,
    icon: {
      default: UI.getIconBLP("CITY_CITIZENS"),
      hover: UI.getIconBLP("CITY_CITIZENS_HI"),
      focus: UI.getIconBLP("CITY_CITIZENS_HI"),
      pressed: UI.getIconBLP("CITY_CITIZENS_HI")
    },
    iconClass: "size-16",
    headerText: "LOC_UI_CITY_DETAILS_GROWTH_TAB"
  },
  {
    id: "city-details-tab-buildings" /* buildings */,
    icon: {
      default: UI.getIconBLP("CITY_BUILDINGS"),
      hover: UI.getIconBLP("CITY_BUILDINGS_HI"),
      focus: UI.getIconBLP("CITY_BUILDINGS_HI"),
      pressed: UI.getIconBLP("CITY_BUILDINGS_HI")
    },
    iconClass: "size-16",
    headerText: "LOC_UI_CITY_DETAILS_BUILDINGS_TAB"
  },
  {
    id: "city-details-tab-yields" /* yields */,
    icon: {
      default: UI.getIconBLP("CITY_YIELDS"),
      hover: UI.getIconBLP("CITY_YIELDS_HI"),
      focus: UI.getIconBLP("CITY_YIELDS_HI"),
      pressed: UI.getIconBLP("CITY_YIELDS_HI")
    },
    iconClass: "size-16",
    headerText: "LOC_UI_CITY_DETAILS_YIELDS_TAB"
  }
];
class PanelCityDetails extends Panel {
  // #region Element References
  frame = document.createElement("fxs-subsystem-frame");
  headerElement = document.createElement("fxs-header");
  tabHeaderElement = document.createElement("fxs-header");
  tabBar = document.createElement("fxs-tab-bar");
  slotGroup = document.createElement("fxs-slot-group");
  prevCityButton = document.createElement("fxs-activatable");
  nextCityButton = document.createElement("fxs-activatable");
  growthSlot;
  growthBarContainer;
  growthBarNext;
  growthBarCurrent;
  growthTurnsText;
  growthBreakdown;
  urbanPopCount;
  ruralPopCount;
  specialistCount;
  specialistContainer;
  specialistText;
  currentCitizenCount;
  happinessStatusText;
  happinessBoundaryText;
  happinessIcon;
  happinessPerTurn;
  foodPerTurn;
  foodNeededToGrow;
  connectedToContainer;
  connectionsSubtitle;
  connectionsExport;
  connectionsList;
  constructibleSlot;
  buildingsCategory;
  buildingsList;
  improvementsCategory;
  improvementsList;
  improvementsCollapseAllContainter;
  improvementsCollapseAll;
  improvementsCollapseAllText;
  improvementsHeader;
  improvementsWarehouseIcon;
  wondersCategory;
  wondersList;
  yieldsSlot;
  yieldsContainer;
  beingRazedContainer;
  razedTurnsText;
  treasureFleetContainer;
  treasureFleetText;
  // #endregion
  LANDMARK_BORDER_STYLE = {
    style: "CultureBorder_Closed",
    primaryColor: { x: 1, y: 1, z: 1, w: 5 },
    secondaryColor: { x: 1, y: 1, z: 1, w: 5 }
  };
  HIGHLIGHT_BORDER_STYLE = {
    style: "CultureBorder_Closed",
    primaryColor: { x: 1, y: 1, z: 1, w: 1 },
    secondaryColor: { x: 0, y: 0, z: 0, w: 0 }
  };
  landmarkOverlayGroup = WorldUI.createOverlayGroup("landmarkOverlayGroup", OVERLAY_PRIORITY.PLOT_HIGHLIGHT);
  landmarkOverlay = this.landmarkOverlayGroup.addLandmarkOverlay();
  highlightOverlay = this.landmarkOverlayGroup.addBorderOverlay(this.HIGHLIGHT_BORDER_STYLE);
  engineInputListener = this.onEngineInput.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  updateCityDetailersListener = this.update.bind(this);
  onNextCityButtonListener = this.onNextCityButton.bind(this);
  onPrevCityButtonListener = this.onPrevCityButton.bind(this);
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(ShowCityDetailsEventName, this.onShowCityDetailsEvent);
    window.addEventListener(UpdateCityDetailsEventName, this.updateCityDetailersListener);
    this.frame.addEventListener("subsystem-frame-close", this.requestClose);
    this.tabBar.addEventListener("tab-selected", this.onTabSelected);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    engine.on("InputContextChanged", this.inputContextChangedListener);
    this.Root.addEventListener("focus", this.onFocus);
    this.nextCityButton.addEventListener("action-activate", this.onNextCityButtonListener);
    this.prevCityButton.addEventListener("action-activate", this.onPrevCityButtonListener);
    this.growthSlot = MustGetElement(`#${"city-details-tab-growth" /* growth */}`, this.Root);
    this.growthBarContainer = MustGetElement(".growth-bar-container", this.Root);
    this.growthBarNext = MustGetElement(".growth-bar-next", this.Root);
    this.growthBarCurrent = MustGetElement(".growth-bar-cur", this.Root);
    this.growthTurnsText = MustGetElement(".growth-turns", this.Root);
    this.growthBreakdown = MustGetElement(".growth-breakdown", this.Root);
    this.urbanPopCount = MustGetElement(".urban-count", this.Root);
    this.ruralPopCount = MustGetElement(".rural-count", this.Root);
    this.specialistCount = MustGetElement(".specialist-count", this.Root);
    this.specialistContainer = MustGetElement(".specialist-container", this.Root);
    this.specialistText = MustGetElement(".specialist-text", this.Root);
    this.currentCitizenCount = MustGetElement(".current-citizens-count", this.Root);
    this.happinessStatusText = MustGetElement(".happiness-status-text", this.Root);
    this.happinessBoundaryText = MustGetElement(".happiness-boundary-text", this.Root);
    this.happinessIcon = MustGetElement(".happiness-icon", this.Root);
    this.happinessPerTurn = MustGetElement(".happiness-per-turn", this.Root);
    this.foodPerTurn = MustGetElement(".food-per-turn", this.Root);
    this.foodNeededToGrow = MustGetElement(".food-needed-to-grow", this.Root);
    this.connectedToContainer = MustGetElement(".connected-to-container", this.Root);
    this.connectionsSubtitle = MustGetElement(".connections-subtitle", this.Root);
    this.connectionsExport = MustGetElement(".connections-export", this.Root);
    this.connectionsList = MustGetElement(".connections-list", this.Root);
    this.constructibleSlot = MustGetElement(`#${"city-details-tab-buildings" /* buildings */}`, this.Root);
    this.buildingsCategory = MustGetElement(".buildings-category", this.Root);
    this.buildingsList = MustGetElement(".buildings-list", this.Root);
    this.improvementsCategory = MustGetElement(".improvements-category", this.Root);
    this.improvementsList = MustGetElement(".improvements-list", this.Root);
    this.improvementsCollapseAllContainter = MustGetElement(".improvements-collapse-all", this.Root);
    this.improvementsCollapseAll = MustGetElement(".improvements-collapse-all-minus-plus", this.Root);
    this.improvementsCollapseAllText = MustGetElement(".improvements-collapse-all-text", this.Root);
    this.improvementsHeader = MustGetElement(".improvements-header", this.Root);
    this.improvementsWarehouseIcon = MustGetElement(".improvements-breakdown-icon", this.Root);
    this.wondersCategory = MustGetElement(".wonders-category", this.Root);
    this.wondersList = MustGetElement(".wonders-list", this.Root);
    this.yieldsSlot = MustGetElement(`#${"city-details-tab-yields" /* yields */}`, this.Root);
    this.yieldsContainer = MustGetElement(".yields-container", this.Root);
    this.beingRazedContainer = MustGetElement(".being-razed-container", this.Root);
    this.razedTurnsText = MustGetElement(".razed-turns-text", this.Root);
    this.treasureFleetContainer = MustGetElement(".treasure-fleet-container", this.Root);
    this.treasureFleetText = MustGetElement(".treasure-fleet-text", this.Root);
    this.disposeTooltips.forEach((dispose) => dispose());
    this.disposeTooltips = [];
    this.update();
  }
  onDetach() {
    window.removeEventListener(ShowCityDetailsEventName, this.onShowCityDetailsEvent);
    window.removeEventListener(UpdateCityDetailsEventName, this.updateCityDetailersListener);
    this.frame.removeEventListener("subsystem-frame-close", this.requestClose);
    this.tabBar.removeEventListener("tab-selected", this.onTabSelected);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("InputContextChanged", this.inputContextChangedListener);
    this.Root.removeEventListener("focus", this.onFocus);
    this.nextCityButton.removeEventListener("action-activate", this.onNextCityButtonListener);
    this.prevCityButton.removeEventListener("action-activate", this.onPrevCityButtonListener);
    this.removeBuildingHighlight();
    this.disposeTooltips.forEach((dispose) => dispose());
    this.disposeTooltips = [];
    super.onDetach();
  }
  onPrevCityButton() {
    this.selectPrevCity();
  }
  onNextCityButton() {
    this.selectNextCity();
  }
  onTabSelected = (e) => {
    this.slotGroup.setAttribute("selected-slot", e.detail.selectedItem.id);
    this.tabHeaderElement.setAttribute("title", e.detail.selectedItem.headerText);
  };
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
      return !(name === "camera-zoom-in" || name === "camera-zoom-out");
    }
    switch (inputEvent.detail.name) {
      case "nav-shell-prev":
      case "camera-zoom-out":
        this.selectPrevCity();
        return false;
      case "nav-shell-next":
      case "camera-zoom-in":
        this.selectNextCity();
        return false;
      case "cancel":
        this.toggleClose(true);
        return false;
      case "accept":
        return false;
    }
    return true;
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
  selectPrevCity() {
    const selectedCity = UI.Player.getHeadSelectedCity();
    if (!selectedCity) {
      console.error(`panel-city-details: selectPrevCity() failed to get head selected city!`);
      return;
    }
    const prevCityId = GetPrevCityID(selectedCity);
    if (ComponentID.isValid(prevCityId)) {
      UI.Player.selectCity(prevCityId);
    }
  }
  selectNextCity() {
    const selectedCity = UI.Player.getHeadSelectedCity();
    if (!selectedCity) {
      console.error(`panel-city-details: selectNextCity() failed to get head selected city!`);
      return;
    }
    const nextCityId = GetNextCityID(selectedCity);
    if (ComponentID.isValid(nextCityId)) {
      UI.Player.selectCity(nextCityId);
    }
  }
  onFocus = () => {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    this.tabBar.setAttribute("selected-tab-index", "0");
    this.slotGroup.setAttribute("selected-slot", "city-details-tab-growth" /* growth */);
    const growthSlot = this.Root.querySelector(`#${"city-details-tab-growth" /* growth */}`);
    if (growthSlot) {
      FocusManager.get().setFocus(growthSlot);
    }
  };
  onShowCityDetailsEvent = (event) => {
    if (event.detail.shouldShow == "toggle") {
      this.toggleClose();
    } else {
      this.toggleClose(!event.detail.shouldShow);
    }
  };
  requestClose = () => {
    this.toggleClose(true);
  };
  toggleClose(force) {
    const hidden = force == void 0 ? !this.Root.classList.contains("hidden") : force;
    this.setHidden(hidden);
    if (hidden) {
      window.dispatchEvent(new CityDetailsClosedEvent());
    }
  }
  setHidden(hidden) {
    this.Root.classList.toggle("hidden", hidden);
    const audioEvent = hidden ? "data-audio-city-details-exit" : "data-audio-city-details-enter";
    UI.sendAudioEvent(Audio.getSoundTag(audioEvent, "city-actions"));
  }
  render() {
    this.Root.classList.add("flex-col");
    const headerWrapper = document.createElement("div");
    headerWrapper.classList.add("flex", "items-center", "justify-center", "px-10");
    headerWrapper.dataset.slot = "header";
    this.prevCityButton.classList.add("flex", "flex-row", "items-center");
    this.prevCityButton.setAttribute("action-key", "inline-prev-city");
    const prevCityButtonArrow = document.createElement("div");
    prevCityButtonArrow.classList.add("img-arrow", "w-8", "h-12");
    Databind.classToggle(prevCityButtonArrow, "hidden", "{{g_NavTray.isTrayRequired}}");
    this.prevCityButton.appendChild(prevCityButtonArrow);
    headerWrapper.appendChild(this.prevCityButton);
    this.headerElement.classList.add("px-4", "uppercase", "tracking-100");
    this.headerElement.setAttribute("title", "LOC_UI_CITY_DETAILS_HEADER");
    headerWrapper.appendChild(this.headerElement);
    this.nextCityButton.classList.add("flex", "flex-row-reverse", "items-center");
    this.nextCityButton.setAttribute("action-key", "inline-next-city");
    const nextCityButtonArrow = document.createElement("div");
    nextCityButtonArrow.classList.add("img-arrow", "w-8", "h-12", "-scale-x-100");
    Databind.classToggle(nextCityButtonArrow, "hidden", "{{g_NavTray.isTrayRequired}}");
    this.nextCityButton.appendChild(nextCityButtonArrow);
    headerWrapper.appendChild(this.nextCityButton);
    this.frame.appendChild(headerWrapper);
    const tabHeaderWrapper = document.createElement("div");
    tabHeaderWrapper.classList.add("flex", "items-center", "justify-center", "mb-2");
    this.frame.appendChild(tabHeaderWrapper);
    this.tabHeaderElement.classList.add("px-3", "uppercase", "tracking-100");
    this.tabHeaderElement.setAttribute("filigree-style", "none");
    this.tabHeaderElement.setAttribute("font-fit-mode", "shrink");
    this.tabHeaderElement.setAttribute("title", cityDetailTabItems[0].headerText);
    tabHeaderWrapper.appendChild(this.tabHeaderElement);
    this.tabBar.classList.add("px-2");
    this.tabBar.setAttribute("tab-for", "fxs-subsystem-frame");
    this.tabBar.setAttribute("rect-render", "true");
    this.tabBar.setAttribute("data-audio-group-ref", "city-actions");
    this.tabBar.setAttribute("nav-help-left-class", "pl-2");
    this.tabBar.setAttribute("nav-help-right-class", "pr-2");
    this.tabBar.setAttribute("tab-items", JSON.stringify(cityDetailTabItems));
    this.frame.appendChild(this.tabBar);
    this.renderGrowthSlot();
    this.renderBuildingSlot();
    this.renderYieldsSlot();
    this.frame.classList.add("flex-auto");
    this.frame.setAttribute("no-scroll", "true");
    this.frame.dataset.headerClass = "px-3 mx-0\\.5";
    this.frame.dataset.footerClass = "px-5 mx-0\\.5";
    this.frame.insertAdjacentHTML(
      "beforeend",
      `
				<div class="flex self-stretch justify-center px-3 pb-1" data-slot="header">
				</div>
		`
    );
    Databind.classToggle(this.frame, "mb-16", "{{g_NavTray.isTrayRequired}}");
    this.tabBar.addEventListener("tab-selected", (e) => {
      this.slotGroup.setAttribute("selected-slot", e.detail.selectedItem.id);
    });
    this.slotGroup.classList.add("flex", "flex-auto", "flex-col");
    this.frame.appendChild(this.slotGroup);
    this.Root.appendChild(this.frame);
  }
  renderGrowthSlot() {
    const slot = document.createElement("fxs-vslot");
    slot.classList.add("mt-3", "pr-4");
    slot.setAttribute("data-navrule-left", "stop");
    slot.setAttribute("data-navrule-right", "stop");
    slot.id = "city-details-tab-growth" /* growth */;
    slot.innerHTML = `
		<fxs-scrollable class="flex-auto">
			<div class="being-razed-container flex flex-col m-1 w-full">
				<div class="font-title uppercase self-center text-negative text-xl" data-l10n-id="LOC_UI_CITY_DETAILS_CITY_BEING_RAZED"></div>
				<div class="razed-turns-text self-center text-negative text-large" data-l10n-id="LOC_UI_CITY_DETAILS_CITY_BEING_RAZED"></div>
				<div class="flex w-96 self-center">
					<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
					<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
				</div>
			</div>
			<div class="specialist-container flex flex-col m-1">
				<p class="specialist-text self-center mt-1 mb-1 ml-8 mr-8 text-accent-4 text-sm"></p>
			</div>
			<div class="growth-entry flex justify-between m-1" tabindex="-1">
				<div class="flex">
					<fxs-icon class="size-12 m-1" data-icon-id="CITY_CITIZENS_LIST"></fxs-icon>
					<div role="paragraph" class="flex-col self-center ml-2 pointer-evetns-auto">
						<div class="current-citizens-count"></div>
						<div class="font-title text-gradient-secondary uppercase" data-l10n-id="LOC_UI_CITY_DETAILS_CITIZENS"></div>
					</div>
				</div>
			</div>
			<div class="growth-bar-container self-center w-80 flex flex-col mb-2">
				<div class="progress-bar-background w-full h-4 relative">
					<div class="growth-bar-next growth-bar-animation absolute progress-bar-tracker h-full"></div>
					<div class="growth-bar-cur absolute progress-bar-tracker h-full"></div>
					<div class="absolute progress-bar-border w-full h-full"></div>
				</div>
				<div class="w-full relative mt-2 flex flex-row flex-wrap items-center justify-between">
					<div class="growth-breakdown text-xs text-accent-4"></div>
					<div class="flex flex-row gap-1 items-center">
						<div class="growth-turns text-xs text-accent-4"></div>
						<div class="growth-timer size-4"></div>
					</div>
				</div>
			</div>
			<div class="flex flex-row ml-4 mr-1">
				<div class="grow h-px" style="background: rgba(77, 83, 102, 0.30);"></div>
			</div>
			<div role="paragraph" class="growth-entry items-center flex justify-between py-0\\.5 ml-4 mr-1 pointer-events-auto" tabindex="-1" data-tooltip-content="LOC_UI_CITY_DETAILS_URBAN_POPULATION_TOOLTIP" data-tooltip-anchor="left" >
				<div class="flex flex-row gap-1 items-center indented-growth-item">
					<fxs-icon class="size-4 mx-1" data-icon-id="CITY_URBAN"></fxs-icon>
					<div data-l10n-id="LOC_UI_CITY_STATUS_URBAN_POPULATION"></div>
				</div>
				<div class="urban-count mr-4">0</div>
			</div>
			<div class="flex flex-row ml-4 mr-1">
				<div class="grow h-px" style="background: rgba(77, 83, 102, 0.30);"></div>
			</div>
			<div role="paragraph" class="growth-entry items-center flex justify-between py-0\\.5 ml-4 mr-1 pointer-events-auto" tabindex="-1" data-tooltip-content="LOC_UI_CITY_DETAILS_RURAL_POPULATION_TOOLTIP" data-tooltip-anchor="left" >
				<div class="flex flex-row gap-1 items-center indented-growth-item">
					<fxs-icon class="size-4 mx-1" data-icon-id="CITY_RURAL"></fxs-icon>
					<div data-l10n-id="LOC_UI_CITY_STATUS_RURAL_POPULATION"></div>
				</div>
				<div class="rural-count mr-4">0</div>
			</div>
			<div class="flex flex-row ml-4 mr-1">
				<div class="grow h-px" style="background: rgba(77, 83, 102, 0.30);"></div>
			</div>
			<div role="paragraph" class="growth-entry items-center flex justify-between py-0\\.5 ml-4 mr-1 pointer-events-auto" tabindex="-1" data-tooltip-content="LOC_UI_CITY_DETAILS_SPECIALIST_POPULATION_TOOLTIP" data-tooltip-anchor="left" >
				<div class="flex flex-row gap-1 items-center indented-growth-item">
					<fxs-icon class="size-6" data-icon-id="SPECIALIST"></fxs-icon>
					<div data-l10n-id="LOC_WORKERS_TITLE"></div>
				</div>
				<div class="specialist-count mr-4">0</div>
			</div>
			<div class="flex w-96 self-center">
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
			</div>
			<div class="flex m-1">
				<fxs-icon class="happiness-icon size-12 m-1" data-icon-context="YIELD" data-icon-id="YIELD_HAPPINESS"></fxs-icon>
				<div class="flex-col self-center">
					<div class="flex flex-row">
						<div class="happiness-status-text font-title ml-2 uppercase"></div>
						<div class="happiness-boundary-text font-body text-sm text-accent-4 ml-2"></div>
					</div>
					<p class="font-title ml-2 uppercase text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_HAPPINESS_STATUS"></p>
				</div>
			</div>
			<div role="paragraph" class="growth-entry flex justify-between m-1 pointer-events-auto" tabindex="-1">
				<div class="ml-4 indented-growth-item" data-l10n-id="LOC_UI_CITY_DETAILS_HAPPINESS_PER_TURN"></div>
				<div class="happiness-per-turn mr-4"></div>
			</div>
			<div class="flex w-96 self-center">
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
			</div>
			<div class="flex m-1">
				<fxs-icon class="size-12 m-1" data-icon-id="CITY_FOOD_LIST"></fxs-icon>
				<p class="self-center font-title ml-2 uppercase text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_FOOD"></p>
			</div>
			<div role="paragraph" class="growth-entry flex justify-between m-1 pointer-events-auto" tabindex="-1">
				<div class="ml-4 indented-growth-item" data-l10n-id="LOC_UI_CITY_DETAILS_FOOD_PER_TURN"></div>
				<div class="food-per-turn mr-4"></div>
			</div>
			<div class="connected-to-container">
			</div>
			<div role="paragraph" class="growth-entry flex justify-between m-1 pointer-events-auto" tabindex="-1">
				<div class="ml-4 indented-growth-item" data-l10n-id="LOC_UI_CITY_DETAILS_FOOD_NEEDED_TO_GROW"></div>
				<div class="food-needed-to-grow mr-4"></div>
			</div>
			<div class="flex w-96 self-center">
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
			</div>
			<div class="connections-container flex flex-col m-1">
				<p class="font-title ml-4 uppercase text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_CONNECTIONS"></p>
				<div role="paragraph" class="connections-subtitle ml-4 mr-4 mb-2 pointer-events-auto text-sm"></div>
				<div role="paragraph" class="connections-export ml-4 mr-4 mb-3 hidden pointer-events-auto text-accent-4 text-sm"></div>
				<div class="connections-list flex flex-col ml-4 mr-4"></div>
			</div>
			<div class="flex w-96 self-center">
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
				<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
			</div>
			<div class="treasure-fleet-container flex flex-col m-1">
				<p class="font-title ml-4 mb-2 uppercase text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_TREASURE_FLEET"></p>
				<div role="paragraph" class="treasure-fleet-text ml-4 pointer-events-auto"></div>
				<div class="flex w-96 self-center">
					<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
					<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
				</div>
			</div>
		</fxs-scrollable>
		`;
    this.slotGroup.appendChild(slot);
  }
  renderBuildingSlot() {
    const slot = document.createElement("fxs-vslot");
    slot.classList.add("pr-4");
    slot.setAttribute("data-navrule-left", "stop");
    slot.setAttribute("data-navrule-right", "stop");
    slot.id = "city-details-tab-buildings" /* buildings */;
    slot.innerHTML = `
		<fxs-scrollable>
			<div class="flex flex-col w-full">
				<div class="buildings-category flex m-1">
					<fxs-icon class="size-16 m-1" data-icon-id="CITY_BUILDINGS_LIST"></fxs-icon>
					<div class="self-center font-title text-lg uppercase ml-2 text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_BUILDINGS"></div>
				</div>
				<div class="buildings-list flex-col m-1"></div>
				<div class="improvements-category flex m-1 flex-row items-center">
					<fxs-icon class="size-16 m-1" data-icon-id="CITY_IMPROVEMENTS_LIST"></fxs-icon>
					<div class="flex-col flex grow">
						<div class="improvements-header flex-row flex ml-2 justify-between self-stretch items-center">
							<div class="self-center font-title text-lg uppercase text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_IMPROVEMENTS"></div>
							<div class="constructible-entry improvements-breakdown-icon flex flex-row items-center justify-center mr-5 relative" tabindex="-1">
								<div class="constructible-entry-highlight flex-row flex items-center justify-between relative -top-1 -right-1">
									<div class="size-6 m-1 bg-center bg-contain bg-no-repeat" style="background-image: url('blp:icon_info.png')">
									</div>
								</div>
							</div>
						</div>
						<fxs-activatable class="improvements-collapse-all pointer-events-auto constructible-entry flex-row flex ml-2 self-stretch items-center" tabindex="-1">
							<div class="constructible-entry-highlight flex-row flex items-center justify-between">
								<div class="improvements-collapse-all-text" data-l10n-id="LOC_GLOBAL_YIELDS_COLLAPSE_ALL"></div>
								<fxs-minus-plus type="minus" class="improvements-collapse-all-minus-plus ml-2"></fxs-minus-plus>
							</div>
						</fxs-activatable>
					</div>
				</div>
				<div class="improvements-list flex-col m-1"></div>
				<div class="wonders-category flex m-1">
					<fxs-icon class="size-16 m-1" data-icon-id="CITY_WONDERS_LIST"></fxs-icon>
					<div class="self-center font-title text-lg uppercase ml-2 text-gradient-secondary" data-l10n-id="LOC_UI_CITY_DETAILS_WONDERS"></div>
				</div>
				<div class="wonders-list flex-col m-1"></div>
			</div>
		</fxs-scrollable>
		`;
    this.slotGroup.appendChild(slot);
  }
  renderYieldsSlot() {
    const slot = document.createElement("fxs-vslot");
    slot.classList.add("pr-4");
    slot.setAttribute("data-navrule-left", "stop");
    slot.setAttribute("data-navrule-right", "stop");
    slot.id = "city-details-tab-yields" /* yields */;
    slot.innerHTML = `
			<fxs-scrollable class="yields-scrollable">
				<div class="yields-container w-full"></div>
			</div>
		`;
    this.slotGroup.appendChild(slot);
  }
  update() {
    if (CityDetails.isTown) {
      this.headerElement.setAttribute("title", "LOC_UI_TOWN_DETAILS_HEADER");
    } else {
      this.headerElement.setAttribute("title", "LOC_UI_CITY_DETAILS_HEADER");
    }
    const growthHasFocus = this.growthSlot.contains(FocusManager.get().currentFocus());
    if (CityDetails.isTown) {
      if (CityDetails.hasTownFocus) {
        this.specialistContainer.classList.remove("hidden");
        this.specialistText.innerHTML = Locale.stylize("LOC_UI_CITY_DETAILS_TOWN_NO_GROWTH");
      } else {
        this.specialistContainer.classList.add("hidden");
      }
    } else {
      this.specialistContainer.classList.remove("hidden");
      this.specialistText.innerHTML = Locale.stylize(
        "LOC_UI_CITY_DETAILS_SPECIALIST_PER_TILE",
        CityDetails.specialistPerTile
      );
    }
    this.currentCitizenCount.textContent = CityDetails.currentCitizens.toString();
    this.urbanPopCount.textContent = CityDetails.urbanPopulation.toString();
    this.ruralPopCount.textContent = CityDetails.ruralPopulation.toString();
    this.specialistCount.textContent = CityDetails.specialistCount.toString();
    if (CityDetails.foodToGrow > 0) {
      this.growthBarContainer.classList.toggle("hidden", false);
      this.growthBarCurrent.style.width = CityDetails.foodCurrent / CityDetails.foodToGrow * 100 + "%";
      this.growthBarNext.style.width = Math.min(1, (CityDetails.foodCurrent + CityDetails.foodPerTurn) / CityDetails.foodToGrow) * 100 + "%";
      const isGrowing = CityDetails.foodPerTurn > 0;
      this.growthTurnsText.textContent = isGrowing ? CityDetails.turnsToNextCitizen.toString() : Locale.compose("LOC_OPTIONS_SYMBOL_INFINITY");
      this.growthTurnsText.classList.toggle("text-xs", isGrowing);
      this.growthTurnsText.classList.toggle("text-base", !isGrowing);
      this.growthBreakdown.innerHTML = Locale.stylize(
        "LOC_UI_CITY_DETAILS_GROWTH_BREAKDOWN",
        CityDetails.foodCurrent,
        CityDetails.foodToGrow,
        CityDetails.foodPerTurn
      );
    } else {
      this.growthBarContainer.classList.toggle("hidden", true);
    }
    this.foodPerTurn.textContent = Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", CityDetails.foodPerTurn);
    this.foodNeededToGrow.textContent = Locale.compose("LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS", CityDetails.foodToGrow);
    this.connectedToContainer.innerHTML = "";
    for (const settlementData of CityDetails.connectedSettlementFood) {
      this.addConnectedToEntry(settlementData.name, settlementData.amount);
    }
    for (const stage of happinessStages) {
      this.happinessStatusText.classList.remove(stage.textColor);
      this.happinessStatusText.classList.remove("text-negative");
    }
    if (CityDetails.hasUnrest) {
      this.happinessStatusText.textContent = Locale.compose("LOC_CITY_UNREST");
      this.happinessStatusText.classList.add("text-negative");
      this.happinessIcon.setAttribute("data-icon-id", "YIELD_ANGRY");
      this.happinessBoundaryText.classList.toggle("hidden", true);
    } else {
      for (const stage of happinessStages) {
        if (CityDetails.happinessPerTurn >= stage.min && CityDetails.happinessPerTurn < stage.max) {
          this.happinessStatusText.textContent = Locale.compose(stage.name);
          this.happinessStatusText.classList.add(stage.textColor);
          this.happinessIcon.setAttribute("data-icon-id", stage.icon);
          this.happinessBoundaryText.classList.toggle("hidden", false);
          if (stage.min == -Infinity) {
            this.happinessBoundaryText.innerHTML = Locale.stylize(
              "LOC_UI_CITY_DETAILS_HAPPINESS_STAGE_DETAIL_NO_MIN",
              stage.max
            );
          } else if (stage.max == Infinity) {
            this.happinessBoundaryText.innerHTML = Locale.stylize(
              "LOC_UI_CITY_DETAILS_HAPPINESS_STAGE_DETAIL_NO_MAX",
              stage.min
            );
          } else {
            this.happinessBoundaryText.innerHTML = Locale.stylize(
              "LOC_UI_CITY_DETAILS_HAPPINESS_STAGE_DETAIL",
              stage.min,
              stage.max
            );
          }
          break;
        }
      }
    }
    this.happinessPerTurn.textContent = Locale.compose(
      "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL",
      CityDetails.happinessPerTurn
    );
    if (growthHasFocus) {
      FocusManager.get().setFocus(this.growthSlot);
    }
    const numConnections = CityDetails.connectedSettlements.length;
    const hasConnections = numConnections > 0;
    this.connectionsSubtitle.innerHTML = hasConnections ? Locale.stylize("LOC_UI_CITY_DETAILS_NUMBER_OF_CONNECTIONS", CityDetails.name, numConnections) : Locale.stylize("LOC_UI_CITY_DETAILS_NO_CONNECTIONS");
    this.connectionsList.innerHTML = "";
    if (hasConnections) {
      const noExportProject = CityDetails.nonExportingProjects.includes(CityDetails.currentTownFocus);
      for (const settlement of CityDetails.connectedSettlements) {
        const projectIcon = settlement.isTown ? settlement.projectType || "PROJECT_GROWTH" : "YIELD_CITIES";
        const projectName = settlement.isTown ? settlement.projectName || "LOC_UI_FOOD_CHOOSER_FOCUS_GROWTH" : "LOC_CAPITAL_SELECT_PROMOTION_CITY";
        const dividerCont = document.createElement("div");
        const divider = document.createElement("div");
        dividerCont.setAttribute("class", "flex flex-row");
        divider.setAttribute("class", "grow h-px");
        divider.style.background = "rgba(77, 83, 102, 0.30)";
        dividerCont.appendChild(divider);
        this.connectionsList.appendChild(dividerCont);
        const connectedToEntry = document.createElement("div");
        connectedToEntry.classList.add(
          "growth-entry",
          "pointer-events-auto",
          "flex",
          "flex-row",
          "flex-nowrap",
          "items-center",
          "gap-1",
          "py-0//.5"
        );
        connectedToEntry.setAttribute("tabindex", "-1");
        connectedToEntry.setAttribute("role", "paragraph");
        connectedToEntry.setAttribute("data-tooltip-anchor", "right");
        const connectedIcon = document.createElement("fxs-icon");
        connectedIcon.classList.value = "size-6";
        if (!settlement.isTown) {
          connectedIcon.setAttribute("data-icon-id", "YIELD_CITIES");
        } else {
          if (settlement.projectType) {
            connectedIcon.setAttribute("data-icon-id", settlement.projectType);
          } else {
            connectedIcon.setAttribute("data-icon-id", "PROJECT_GROWTH");
          }
        }
        connectedToEntry.appendChild(connectedIcon);
        const connectedName = document.createElement("div");
        connectedName.innerHTML = Locale.stylize(settlement.name);
        connectedToEntry.appendChild(connectedName);
        const spacer = document.createElement("div");
        spacer.classList.value = "grow";
        connectedToEntry.append(spacer);
        if (CityDetails.isTown && CityDetails.foodExported <= 0 && CityDetails.foodExportPotential > 0) {
          this.connectionsExport.classList.toggle("hidden", false);
          if (CityDetails.nonExportingProjects.includes(CityDetails.currentTownFocus)) {
            this.connectionsExport.innerHTML = Locale.stylize(
              "LOC_UI_CITY_DETAILS_NO_EXPORTING_FOOD_POTENTIAL"
            );
          } else {
            this.connectionsExport.innerHTML = Locale.stylize(
              "LOC_UI_CITY_DETAILS_EXPORTING_FOOD_POTENTIAL",
              CityDetails.name,
              CityDetails.foodExportPotential
            );
          }
        } else {
          this.connectionsExport.classList.toggle("hidden", true);
        }
        if (CityDetails.foodExported > 0 && CityDetails.isTown != settlement.isTown) {
          const foodIcon = document.createElement("fxs-icon");
          foodIcon.classList.value = "size-6";
          foodIcon.setAttribute("data-icon-id", "YIELD_FOOD");
          connectedToEntry.append(foodIcon);
          const arrowIcon = document.createElement("div");
          arrowIcon.classList.value = "size-4 bg-contain bg-center bg-no-repeat";
          arrowIcon.style.backgroundImage = `url('blp:reinforcementArrow')`;
          connectedToEntry.append(arrowIcon);
          connectedToEntry.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              "LOC_UI_CITY_DETAILS_EXPORTING_FOOD_TO",
              CityDetails.foodExported,
              settlement.name
            )
          );
        } else if (!CityDetails.isTown && settlement.foodExport > 0) {
          const arrowIcon = document.createElement("div");
          arrowIcon.classList.value = "size-4 bg-contain bg-center bg-no-repeat rotate-180";
          arrowIcon.style.backgroundImage = `url('blp:reinforcementArrow')`;
          connectedToEntry.append(arrowIcon);
          const foodIcon = document.createElement("fxs-icon");
          foodIcon.classList.value = "size-6";
          foodIcon.setAttribute("data-icon-id", "YIELD_FOOD");
          connectedToEntry.append(foodIcon);
          connectedToEntry.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              "LOC_UI_CITY_DETAILS_IMPORTING_FOOD_FROM",
              settlement.foodExport,
              settlement.name,
              `[icon:${settlement.projectType ?? ""}]`,
              settlement.projectName ?? ""
            )
          );
        } else if (!CityDetails.isTown && settlement.isTown) {
          const foodIcon = document.createElement("fxs-icon");
          foodIcon.classList.value = "size-6 opacity-40";
          foodIcon.setAttribute("data-icon-id", "YIELD_FOOD");
          connectedToEntry.append(foodIcon);
          if (CityDetails.nonExportingProjects.includes(settlement.projectType ?? "")) {
            connectedToEntry.setAttribute(
              "data-tooltip-content",
              Locale.stylize(
                "LOC_UI_CITY_DETAILS_NO_IMPORTING_FOOD_POTENTIAL",
                settlement.name,
                `[icon:${projectIcon ?? ""}]`,
                projectName
              )
            );
          } else {
            connectedToEntry.setAttribute(
              "data-tooltip-content",
              Locale.stylize(
                "LOC_UI_CITY_DETAILS_IMPORTING_FOOD_POTENTIAL",
                settlement.foodExportPotential,
                settlement.name,
                `[icon:${projectIcon ?? ""}]`,
                projectName
              )
            );
          }
        } else {
          if (CityDetails.isTown && !noExportProject && !settlement.isTown) {
            const foodIcon = document.createElement("fxs-icon");
            foodIcon.classList.value = "size-6 opacity-40";
            foodIcon.setAttribute("data-icon-id", "YIELD_FOOD");
            connectedToEntry.append(foodIcon);
          }
          connectedToEntry.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              "LOC_UI_CITY_DETAILS_CONNECTED",
              settlement.name,
              `[icon:${projectIcon ?? ""}]`,
              projectName,
              CityDetails.isTown ? 1 : 0
            )
          );
        }
        this.connectionsList.appendChild(connectedToEntry);
      }
    }
    this.connectionsSubtitle.classList.toggle("mb-2", hasConnections);
    this.connectionsSubtitle.classList.toggle("mt-2", !hasConnections);
    const constructiblesHaveFocus = this.constructibleSlot.contains(FocusManager.get().currentFocus());
    const shouldShowBuildings = CityDetails.buildings.length > 0;
    this.buildingsCategory.classList.toggle("hidden", !shouldShowBuildings);
    this.buildingsList.innerHTML = "";
    for (const building of CityDetails.buildings) {
      this.buildingsList.appendChild(this.addDistrictData(building));
      this.buildingsList.appendChild(this.createDivider());
    }
    const shouldShowImprovements = CityDetails.improvements.length > 0;
    this.improvementsCategory.classList.toggle("hidden", !shouldShowImprovements);
    this.improvementsCollapseAllContainter.addEventListener("action-activate", () => {
      this.onCollapseAllSection(
        this.improvementsCollapseAll,
        this.improvementsCollapseAllText,
        this.improvementsList
      );
    });
    this.improvementsCollapseAll.addEventListener("action-activate", () => {
      this.onCollapseAllSection(
        this.improvementsCollapseAll,
        this.improvementsCollapseAllText,
        this.improvementsList
      );
    });
    this.addWarehouseBreakdownTooltip(this.improvementsHeader, this.improvementsWarehouseIcon);
    this.improvementsList.innerHTML = "";
    let currentImprovement = "";
    let currentImprovementList;
    for (const improvement of CityDetails.improvements) {
      let improvementEntry;
      if (currentImprovement != improvement.name) {
        currentImprovement = improvement.name;
        [improvementEntry, currentImprovementList] = this.addImprovementEntry(improvement);
        this.improvementsList.appendChild(improvementEntry);
        this.improvementsList.appendChild(this.createDivider());
      }
      if (currentImprovementList) {
        this.addImprovementPlotEntry(improvement, currentImprovementList);
      }
    }
    const shouldShowWonders = CityDetails.wonders.length > 0;
    this.wondersCategory.classList.toggle("hidden", !shouldShowWonders);
    this.wondersList.innerHTML = "";
    for (const wonder of CityDetails.wonders) {
      const wonderEntry = this.addConstructibleData(wonder);
      this.addProductionTooltip(this.wondersList, wonderEntry, wonder);
      this.wondersList.appendChild(this.createDivider());
    }
    if (constructiblesHaveFocus) {
      FocusManager.get().setFocus(this.constructibleSlot);
    }
    const yieldsHaveFocus = this.yieldsSlot.contains(FocusManager.get().currentFocus());
    this.updateYields();
    if (yieldsHaveFocus) {
      FocusManager.get().setFocus(this.yieldsSlot);
    }
    this.beingRazedContainer.classList.toggle("hidden", !CityDetails.isBeingRazed);
    this.razedTurnsText.textContent = Locale.compose(
      "LOC_UI_CITY_DETAILS_CITY_TURNS_TILL_RAZED",
      CityDetails.getTurnsUntilRazed
    );
    if (CityDetails.treasureFleetText != "") {
      this.treasureFleetContainer.classList.remove("hidden");
      this.treasureFleetText.textContent = CityDetails.treasureFleetText;
    } else {
      this.treasureFleetContainer.classList.add("hidden");
    }
  }
  addConnectedToEntry(cityName, amount) {
    const connectedToEntry = document.createElement("div");
    connectedToEntry.classList.add(
      "growth-entry",
      "flex",
      "justify-between",
      "ml-4",
      "mr-1",
      "pointer-events-auto"
    );
    connectedToEntry.setAttribute("tabindex", "-1");
    connectedToEntry.setAttribute("role", "paragraph");
    const connectedToCityName = document.createElement("div");
    connectedToCityName.classList.add("ml-4");
    connectedToCityName.textContent = Locale.compose(cityName);
    connectedToEntry.appendChild(connectedToCityName);
    const connectedToAmount = document.createElement("div");
    connectedToAmount.classList.add("mr-4");
    connectedToAmount.textContent = Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", amount);
    connectedToEntry.appendChild(connectedToAmount);
    this.connectedToContainer.appendChild(connectedToEntry);
  }
  updateYields() {
    this.yieldsContainer.innerHTML = ``;
    for (const currentYield of CityDetails.yields) {
      this.addTopYieldButton(this.yieldsContainer, currentYield);
    }
  }
  getValueFormat(format) {
    switch (format) {
      case GameValueDisplayTypes.FLAT:
        return "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL";
      case GameValueDisplayTypes.FLAT_NO_SIGN:
        return "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL_NO_PLUS";
      case GameValueDisplayTypes.PERCENTAGE:
        return "LOC_UI_CITY_DETAILS_YIELD_PERCENT_ONE_DECIMAL";
      case GameValueDisplayTypes.PERCENTAGE_NO_SIGN:
        return "LOC_UI_CITY_DETAILS_YIELD_PERCENT_ONE_DECIMAL_NO_PLUS";
      case GameValueDisplayTypes.MULTIPLIER:
        return "LOC_UI_CITY_DETAILS_YIELD_MULTIPLIER_ONE_DECIMAL";
      case GameValueDisplayTypes.MULTIPLIER_NO_SIGN:
        return "LOC_UI_CITY_DETAILS_YIELD_MULTIPLIER_ONE_DECIMAL_NO_PLUS";
      default:
        return "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL";
    }
  }
  addTopYieldButton(parent, yieldData) {
    const yieldButton = document.createElement("fxs-activatable");
    yieldButton.classList.add("yield-button", "h-16", "flex", "flex-auto", "hud_sidepanel_list-bg", "mr-1");
    yieldButton.setAttribute("tabindex", "-1");
    const columnContainer = document.createElement("div");
    columnContainer.classList.add(
      "yield-button-highlight",
      "flex",
      "flex-auto",
      "flex-col",
      "justify-center",
      "hud_sidepanel_list-bg-no-fill"
    );
    const rowContainer = document.createElement("div");
    rowContainer.classList.add("flex", "justify-between");
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("flex", "items-center");
    rowContainer.appendChild(leftContainer);
    if (yieldData.icon && yieldData.iconContext) {
      const yieldIcon = document.createElement("fxs-icon");
      yieldIcon.setAttribute("data-icon-context", yieldData.iconContext);
      yieldIcon.setAttribute("data-icon-id", yieldData.icon);
      yieldIcon.classList.add("ml-2", "size-12");
      leftContainer.appendChild(yieldIcon);
    }
    const yieldName = document.createElement("div");
    yieldName.innerHTML = yieldData.name;
    yieldName.classList.add("ml-2", "self-center", "font-title", "uppercase");
    leftContainer.appendChild(yieldName);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("flex", "mr-4");
    rowContainer.appendChild(rightContainer);
    const yieldValue = document.createElement("div");
    yieldValue.textContent = Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", yieldData.value);
    yieldValue.classList.add("self-center");
    rightContainer.appendChild(yieldValue);
    const arrowImg = document.createElement("div");
    arrowImg.classList.add("img-arrow", "-rotate-90", "ml-2", "hidden");
    rightContainer.appendChild(arrowImg);
    columnContainer.appendChild(rowContainer);
    yieldButton.appendChild(columnContainer);
    parent.appendChild(yieldButton);
    if (yieldData.children.length > 0) {
      arrowImg.classList.remove("hidden");
      const childrenContainer = document.createElement("div");
      childrenContainer.classList.add("flex-col", "ml-4", "hidden");
      for (const childYield of yieldData.children) {
        this.addChildYieldButton(childrenContainer, childYield);
      }
      yieldButton.addEventListener("action-activate", () => {
        arrowImg.classList.toggle("-rotate-90");
        arrowImg.classList.toggle("rotate-90");
        const hidden = childrenContainer.classList.toggle("hidden");
        const audioId = hidden ? "data-audio-dropdown-close" : "data-audio-dropdown-open";
        Audio.playSound(audioId);
      });
      parent.appendChild(childrenContainer);
    }
  }
  addChildYieldButton(parent, yieldData) {
    const yieldButton = document.createElement("fxs-activatable");
    yieldButton.classList.add("yield-button", "min-h-16", "flex", "flex-auto", "mr-1");
    yieldButton.setAttribute("tabindex", "-1");
    const columnContainer = document.createElement("div");
    columnContainer.classList.add("yield-button-highlight", "flex", "flex-auto", "flex-col", "justify-center");
    const rowContainer = document.createElement("div");
    rowContainer.classList.add("flex", "justify-between");
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("flex", "items-center", "indented-yield-item");
    rowContainer.appendChild(leftContainer);
    if (yieldData.tooltip) {
      rowContainer.setAttribute("data-tooltip-content", Locale.compose(yieldData.tooltip));
    }
    if (yieldData.sourceContext) {
      rowContainer.classList.add("pointer-events-none");
      columnContainer.setAttribute("data-constructible-data", JSON.stringify(yieldData.sourceContext));
      columnContainer.addEventListener("mouseover", this.mouseOverBuildingListener);
      columnContainer.addEventListener("mouseout", this.mouseOutBuildingListener);
      columnContainer.addEventListener("focus", this.focusBuildingListener);
      columnContainer.addEventListener("focusout", this.focusOutBuildingListener);
    }
    if (yieldData.icon && yieldData.iconContext) {
      const yieldIcon = document.createElement("fxs-icon");
      yieldIcon.setAttribute("data-icon-context", yieldData.iconContext);
      yieldIcon.setAttribute("data-icon-id", yieldData.icon);
      yieldIcon.classList.add("ml-2", "size-12");
      leftContainer.appendChild(yieldIcon);
    }
    const yieldName = document.createElement("div");
    yieldName.innerHTML = yieldData.name;
    yieldName.classList.add("ml-2", "self-center");
    leftContainer.appendChild(yieldName);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("flex", "mr-4");
    rowContainer.appendChild(rightContainer);
    const yieldValue = document.createElement("div");
    yieldValue.textContent = Locale.compose(this.getValueFormat(yieldData.valueType), yieldData.value);
    yieldValue.classList.add("self-center");
    rightContainer.appendChild(yieldValue);
    const arrowImg = document.createElement("div");
    arrowImg.classList.add("img-arrow", "-rotate-90", "ml-2", "hidden", "self-center");
    rightContainer.appendChild(arrowImg);
    columnContainer.appendChild(rowContainer);
    yieldButton.appendChild(columnContainer);
    parent.appendChild(yieldButton);
    if (yieldData.children.length > 0) {
      arrowImg.classList.remove("hidden");
      const childrenContainer = document.createElement("div");
      childrenContainer.classList.add("flex-col", "ml-4", "hidden");
      for (const childYield of yieldData.children) {
        this.addChildYieldButton(childrenContainer, childYield);
      }
      yieldButton.addEventListener("action-activate", () => {
        arrowImg.classList.toggle("-rotate-90");
        arrowImg.classList.toggle("rotate-90");
        const hidden = childrenContainer.classList.toggle("hidden");
        const audioId = hidden ? "data-audio-dropdown-close" : "data-audio-dropdown-open";
        Audio.playSound(audioId);
      });
      parent.appendChild(childrenContainer);
    }
  }
  disposeTooltips = [];
  addProductionTooltip(parent, child, data) {
    const isSmallScreen = window.innerHeight <= Layout.pixelsToScreenPixels(900) || window.innerWidth <= Layout.pixelsToScreenPixels(1700);
    const dispose = render(
      () => ProductionTooltip({
        children: child,
        name: data.name,
        type: data.type,
        initialHPosition: isSmallScreen ? TooltipHorizontalPosition.RIGHT : TooltipHorizontalPosition.LEFT,
        initialVPosition: TooltipVerticalPosition.CENTER
      }),
      parent
    );
    this.disposeTooltips.push(dispose);
    return dispose;
  }
  addWarehouseBreakdownTooltip(parent, child) {
    const isSmallScreen = window.innerHeight <= Layout.pixelsToScreenPixels(900) || window.innerWidth <= Layout.pixelsToScreenPixels(1700);
    const dispose = render(
      () => WarehouseBreakdownTooltip({
        children: child,
        initialHPosition: isSmallScreen ? TooltipHorizontalPosition.RIGHT : TooltipHorizontalPosition.LEFT,
        initialVPosition: TooltipVerticalPosition.CENTER,
        warehouseCounts: CityDetails.warehouseCounts
      }),
      parent
    );
    this.disposeTooltips.push(dispose);
    return dispose;
  }
  addDistrictData(districtData) {
    const mainDiv = document.createElement("div");
    mainDiv.classList.add("flex", "flex-col", "ml-4");
    if (districtData.name && districtData.description) {
      const uniqueQuarterContainer = document.createElement("div");
      uniqueQuarterContainer.classList.add("flex", "pl-6");
      mainDiv.appendChild(uniqueQuarterContainer);
      const uniqueQuarterIcon = document.createElement("fxs-icon");
      uniqueQuarterIcon.classList.add("size-12", "mr-2");
      uniqueQuarterIcon.setAttribute("data-icon-context", "DEFAULT");
      uniqueQuarterIcon.setAttribute("data-icon-id", "CITY_UNIQUE_QUARTER");
      uniqueQuarterContainer.appendChild(uniqueQuarterIcon);
      const uniqueQuarterTextContainer = document.createElement("div");
      uniqueQuarterTextContainer.classList.add("flex", "flex-col", "flex-auto", "pr-1");
      uniqueQuarterContainer.appendChild(uniqueQuarterTextContainer);
      const districtName = document.createElement("div");
      districtName.classList.add("mb-1", "font-title", "uppercase");
      districtName.innerHTML = districtData.name;
      uniqueQuarterTextContainer.appendChild(districtName);
      const districtDescription = document.createElement("div");
      districtDescription.classList.add("mb-1");
      districtDescription.innerHTML = districtData.description;
      uniqueQuarterTextContainer.appendChild(districtDescription);
    }
    for (const constructibleData of districtData.constructibleData) {
      const constructibleEntry = this.addConstructibleData(constructibleData);
      this.addProductionTooltip(mainDiv, constructibleEntry, constructibleData);
    }
    return mainDiv;
  }
  updateCollapseAll(collapseButton, collapseText, sectionCollapse) {
    let type = "plus";
    const buttons = sectionCollapse.getElementsByTagName("fxs-minus-plus");
    for (const e of buttons) {
      if (e.getAttribute("type") !== type) {
        type = "minus";
        break;
      }
    }
    collapseButton.setAttribute("type", type);
    collapseText.setAttribute(
      "data-l10n-id",
      type === "plus" ? "LOC_UI_QUEUE_FILTER_SHOW_ALL" : "LOC_GLOBAL_YIELDS_COLLAPSE_ALL"
    );
  }
  onCollapseAllSection(collapseButton, collapseText, sectionCollapse) {
    const type = collapseButton.getAttribute("type") === "plus" ? "minus" : "plus";
    collapseButton.setAttribute("type", type);
    if (type == "minus") {
      Audio.playSound("data-audio-dropdown-open");
      collapseText.setAttribute("data-l10n-id", "LOC_GLOBAL_YIELDS_COLLAPSE_ALL");
    } else {
      Audio.playSound("data-audio-dropdown-close");
      collapseText.setAttribute("data-l10n-id", "LOC_UI_QUEUE_FILTER_SHOW_ALL");
    }
    const buttons = sectionCollapse.getElementsByTagName("fxs-minus-plus");
    for (const e of buttons) {
      if (e.getAttribute("type") !== type) {
        e.dispatchEvent(new CustomEvent("on-collapse-all"));
      }
    }
  }
  onCollapseImprovementSection(collapseButton, listContainer, collapseAllButton, collapseAllText, sectionCollapse, playSound = true) {
    const type = collapseButton.getAttribute("type");
    if (type == "minus") {
      collapseButton.setAttribute("type", "plus");
      listContainer.classList.add("hidden");
      if (playSound) Audio.playSound("data-audio-dropdown-close");
    } else {
      collapseButton.setAttribute("type", "minus");
      listContainer.classList.remove("hidden");
      if (playSound) Audio.playSound("data-audio-dropdown-open");
    }
    this.updateCollapseAll(collapseAllButton, collapseAllText, sectionCollapse);
  }
  addImprovementEntry(constructibleData) {
    const wrapDiv = document.createElement("div");
    wrapDiv.classList.add("relative");
    const collapseButton = document.createElement("fxs-minus-plus");
    collapseButton.classList.add("absolute", "top-1", "right-5");
    collapseButton.setAttribute("type", "minus");
    wrapDiv.appendChild(collapseButton);
    const childList = document.createElement("div");
    childList.classList.value = "pl-4";
    const mainDiv = document.createElement("fxs-activatable");
    mainDiv.classList.add("constructible-entry", "flex", "flex-col");
    mainDiv.setAttribute("tabindex", "-1");
    mainDiv.setAttribute("data-type", constructibleData.type);
    collapseButton.addEventListener("on-collapse-all", () => {
      this.onCollapseImprovementSection(
        collapseButton,
        childList,
        this.improvementsCollapseAll,
        this.improvementsCollapseAllText,
        this.improvementsList,
        false
      );
    });
    collapseButton.addEventListener("action-activate", () => {
      this.onCollapseImprovementSection(
        collapseButton,
        childList,
        this.improvementsCollapseAll,
        this.improvementsCollapseAllText,
        this.improvementsList
      );
    });
    mainDiv.addEventListener("action-activate", () => {
      this.onCollapseImprovementSection(
        collapseButton,
        childList,
        this.improvementsCollapseAll,
        this.improvementsCollapseAllText,
        this.improvementsList
      );
    });
    const topDiv = document.createElement("div");
    topDiv.classList.add("constructible-entry-highlight", "flex", "ml-6", "mt-1", "mb-1", "pointer-events-none");
    const icon = document.createElement("fxs-icon");
    icon.classList.add("size-12");
    icon.setAttribute("data-icon-context", constructibleData.iconContext);
    icon.setAttribute("data-icon-id", constructibleData.icon);
    topDiv.appendChild(icon);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("flex", "flex-col");
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("flex", "ml-2", "center", "flex-col");
    rightContainer.appendChild(nameContainer);
    const name = document.createElement("div");
    name.classList.add("mr-2", "font-title", "uppercase");
    name.textContent = Locale.compose(constructibleData.name);
    nameContainer.appendChild(name);
    const countText = document.createElement("div");
    countText.classList.add("ml-2", "text-sm");
    countText.textContent = Locale.compose(
      "LOC_UI_CITY_DETAILS_IMPROVEMENTS_COUNT",
      CityDetails.constructibleCounts.get(constructibleData.name) ?? 0
    );
    rightContainer.appendChild(countText);
    topDiv.appendChild(rightContainer);
    mainDiv.appendChild(topDiv);
    const improvementDef = GameInfo.Constructibles.lookup(constructibleData.type);
    if (improvementDef && improvementDef.Tooltip) {
      this.addProductionTooltip(wrapDiv, mainDiv, constructibleData);
    } else {
      wrapDiv.appendChild(mainDiv);
    }
    wrapDiv.appendChild(childList);
    return [wrapDiv, childList];
  }
  addImprovementPlotEntry(constructibleData, listContainer) {
    const mainDiv = document.createElement("fxs-activatable");
    mainDiv.classList.add("constructible-entry", "flex", "flex-col");
    mainDiv.setAttribute("tabindex", "-1");
    mainDiv.setAttribute("data-type", constructibleData.type);
    mainDiv.setAttribute("data-tooltip-style", "production-constructible-tooltip");
    const topDiv = document.createElement("div");
    topDiv.classList.add("constructible-entry-highlight", "flex", "flex-col", "ml-6", "pointer-events-none");
    const divider = document.createElement("div");
    divider.setAttribute("class", "grow h-px");
    divider.style.background = "rgba(77, 83, 102, 0.30)";
    topDiv.appendChild(divider);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("flex", "flex-col", "py-1");
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("flex", "ml-2", "center", "flex-col");
    rightContainer.appendChild(nameContainer);
    if (constructibleData.damaged) {
      const damagedText = document.createElement("div");
      damagedText.classList.add("uppercase", "text-negative", "text-xs");
      damagedText.textContent = "LOC_UI_CITY_DETAILS_BUILDING_DAMAGED";
      nameContainer.appendChild(damagedText);
    }
    if (constructibleData.yieldMap) {
      const yieldContainer = document.createElement("div");
      yieldContainer.classList.add("flex", "flex-wrap", "max-w-96");
      for (const [_yieldType, yieldData] of constructibleData.yieldMap) {
        if (yieldData.icon && yieldData.iconContext) {
          const yieldEntry = document.createElement("div");
          yieldEntry.classList.add("flex");
          yieldContainer.appendChild(yieldEntry);
          const yieldIcon = document.createElement("fxs-icon");
          yieldIcon.setAttribute("data-icon-context", yieldData.iconContext);
          yieldIcon.setAttribute("data-icon-id", yieldData.icon);
          yieldIcon.classList.add("ml-2", "size-6");
          yieldEntry.appendChild(yieldIcon);
          const yieldValue = document.createElement("div");
          yieldValue.classList.add("text-xs", "self-center");
          yieldValue.textContent = Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", yieldData.value);
          yieldEntry.appendChild(yieldValue);
        }
      }
      rightContainer.appendChild(yieldContainer);
    }
    if (constructibleData.maintenanceMap) {
      const maintenanceContainer = document.createElement("div");
      maintenanceContainer.classList.add("flex", "pl-2");
      const maintenanceText = document.createElement("div");
      maintenanceText.textContent = Locale.compose("LOC_UI_PRODUCTION_BUILDING_MAINTENANCE");
      maintenanceContainer.appendChild(maintenanceText);
      for (const [_maintenanceType, maintenanceData] of constructibleData.maintenanceMap) {
        if (maintenanceData.icon && maintenanceData.iconContext) {
          const maintenanceEntry = document.createElement("div");
          maintenanceEntry.classList.add("flex");
          maintenanceContainer.appendChild(maintenanceEntry);
          const maintenanceIcon = document.createElement("fxs-icon");
          maintenanceIcon.setAttribute("data-icon-context", maintenanceData.iconContext);
          maintenanceIcon.setAttribute("data-icon-id", maintenanceData.icon);
          maintenanceIcon.classList.add("ml-2", "size-6");
          maintenanceEntry.appendChild(maintenanceIcon);
          const maintenanceValue = document.createElement("div");
          maintenanceValue.classList.add("text-xs", "self-center", "text-negative-light");
          maintenanceValue.textContent = Locale.compose(
            "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL",
            maintenanceData.value
          );
          maintenanceEntry.appendChild(maintenanceValue);
        }
      }
      rightContainer.appendChild(maintenanceContainer);
    }
    mainDiv.setAttribute("data-constructible-data", JSON.stringify(constructibleData));
    mainDiv.addEventListener("mouseover", this.mouseOverBuildingListener);
    mainDiv.addEventListener("mouseout", this.mouseOutBuildingListener);
    mainDiv.addEventListener("focus", this.focusBuildingListener);
    mainDiv.addEventListener("focusout", this.focusOutBuildingListener);
    mainDiv.addEventListener("action-activate", this.activateBuildingListener);
    topDiv.appendChild(rightContainer);
    mainDiv.appendChild(topDiv);
    listContainer.appendChild(mainDiv);
    return mainDiv;
  }
  addConstructibleData(constructibleData) {
    const mainDiv = document.createElement("fxs-activatable");
    mainDiv.classList.add("constructible-entry", "flex", "flex-col");
    mainDiv.setAttribute("tabindex", "-1");
    mainDiv.setAttribute("data-type", constructibleData.type);
    mainDiv.setAttribute("data-tooltip-style", "production-constructible-tooltip");
    const topDiv = document.createElement("div");
    topDiv.classList.add("constructible-entry-highlight", "flex", "ml-6", "mt-1", "mb-1", "pointer-events-none");
    const icon = document.createElement("fxs-icon");
    icon.classList.add("size-12");
    icon.setAttribute("data-icon-context", constructibleData.iconContext);
    icon.setAttribute("data-icon-id", constructibleData.icon);
    topDiv.appendChild(icon);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("flex", "flex-col");
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("flex", "ml-2", "center", "flex-col");
    rightContainer.appendChild(nameContainer);
    const name = document.createElement("div");
    name.classList.add("mr-2", "font-title", "uppercase");
    name.textContent = Locale.compose(constructibleData.name);
    nameContainer.appendChild(name);
    if (constructibleData.damaged) {
      const damagedText = document.createElement("div");
      damagedText.classList.add("uppercase", "text-negative");
      damagedText.textContent = "LOC_UI_CITY_DETAILS_BUILDING_DAMAGED";
      nameContainer.appendChild(damagedText);
    }
    if (constructibleData.yieldMap) {
      const yieldContainer = document.createElement("div");
      yieldContainer.classList.add("flex", "flex-wrap", "max-w-96");
      for (const [_yieldType, yieldData] of constructibleData.yieldMap) {
        if (yieldData.icon && yieldData.iconContext) {
          const yieldEntry = document.createElement("div");
          yieldEntry.classList.add("flex");
          yieldContainer.appendChild(yieldEntry);
          const yieldIcon = document.createElement("fxs-icon");
          yieldIcon.setAttribute("data-icon-context", yieldData.iconContext);
          yieldIcon.setAttribute("data-icon-id", yieldData.icon);
          yieldIcon.classList.add("ml-2", "size-6");
          yieldEntry.appendChild(yieldIcon);
          const yieldValue = document.createElement("div");
          yieldValue.classList.add("text-sm", "self-center");
          yieldValue.textContent = Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", yieldData.value);
          yieldEntry.appendChild(yieldValue);
        }
      }
      rightContainer.appendChild(yieldContainer);
    }
    if (constructibleData.maintenanceMap) {
      const maintenanceContainer = document.createElement("div");
      maintenanceContainer.classList.add("flex", "pl-2");
      const maintenanceText = document.createElement("div");
      maintenanceText.textContent = Locale.compose("LOC_UI_PRODUCTION_BUILDING_MAINTENANCE");
      maintenanceContainer.appendChild(maintenanceText);
      for (const [_maintenanceType, maintenanceData] of constructibleData.maintenanceMap) {
        if (maintenanceData.icon && maintenanceData.iconContext) {
          const maintenanceEntry = document.createElement("div");
          maintenanceEntry.classList.add("flex");
          maintenanceContainer.appendChild(maintenanceEntry);
          const maintenanceIcon = document.createElement("fxs-icon");
          maintenanceIcon.setAttribute("data-icon-context", maintenanceData.iconContext);
          maintenanceIcon.setAttribute("data-icon-id", maintenanceData.icon);
          maintenanceIcon.classList.add("ml-2", "size-6");
          maintenanceEntry.appendChild(maintenanceIcon);
          const maintenanceValue = document.createElement("div");
          maintenanceValue.classList.add("text-sm", "self-center", "text-negative-light");
          maintenanceValue.textContent = Locale.compose(
            "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL",
            maintenanceData.value
          );
          maintenanceEntry.appendChild(maintenanceValue);
        }
      }
      rightContainer.appendChild(maintenanceContainer);
    }
    mainDiv.setAttribute("data-constructible-data", JSON.stringify(constructibleData));
    mainDiv.addEventListener("mouseover", this.mouseOverBuildingListener);
    mainDiv.addEventListener("mouseout", this.mouseOutBuildingListener);
    mainDiv.addEventListener("focus", this.focusBuildingListener);
    mainDiv.addEventListener("focusout", this.focusOutBuildingListener);
    mainDiv.addEventListener("action-activate", this.activateBuildingListener);
    topDiv.appendChild(rightContainer);
    mainDiv.appendChild(topDiv);
    return mainDiv;
  }
  mouseOverBuildingListener = this.onMouseOverBuilding.bind(this);
  mouseOutBuildingListener = this.onMouseOutBuilding.bind(this);
  focusBuildingListener = this.onFocusBuilding.bind(this);
  focusOutBuildingListener = this.onFocusOutBuilding.bind(this);
  activateBuildingListener = this.activateBuilding.bind(this);
  onMouseOverBuilding(event) {
    this.addBuildingHighlight(event);
  }
  onMouseOutBuilding(_event) {
    this.removeBuildingHighlight();
  }
  onFocusBuilding(event) {
    this.addBuildingHighlight(event);
  }
  onFocusOutBuilding() {
    this.removeBuildingHighlight();
  }
  activateBuilding(event) {
    if (event.target instanceof HTMLElement) {
      const constructibleDataAttribute = event.target.getAttribute("data-constructible-data");
      if (constructibleDataAttribute) {
        const constructibleData = JSON.parse(constructibleDataAttribute);
        Camera.lookAtPlot(constructibleData.location);
        if (ActionHandler.isTouchActive) {
          this.removeBuildingHighlight();
          this.addBuildingHighlight(event);
        }
      }
    }
  }
  addBuildingHighlight(event) {
    if (event.target instanceof HTMLElement) {
      const constructibleDataAttribute = event.target.getAttribute("data-constructible-data");
      if (constructibleDataAttribute) {
        const constructibleData = JSON.parse(constructibleDataAttribute);
        this.landmarkOverlay.clear();
        this.landmarkOverlay.addLandmark(
          constructibleData.location,
          this.LANDMARK_BORDER_STYLE,
          constructibleData.id.id
        );
        this.highlightOverlay.clear();
        this.highlightOverlay.setPlotGroups(constructibleData.location, 0);
      }
    }
  }
  removeBuildingHighlight() {
    this.landmarkOverlay.clear();
    this.highlightOverlay.clear();
  }
  createDivider() {
    const dividerDiv = document.createElement("div");
    dividerDiv.classList.add("flex", "w-96", "self-center");
    dividerDiv.innerHTML = `
			<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider"></div>
			<div class="w-1\\/2 h-5 bg-cover bg-no-repeat city-details-half-divider -scale-x-100"></div>
		`;
    return dividerDiv;
  }
}
Controls.define("panel-city-details", {
  createInstance: PanelCityDetails,
  description: "Panel which displays the detailed breakdown of city information",
  classNames: ["panel-city-details", "font-body", "text-base", "pointer-events-none", "trigger-nav-help", "h-full"],
  styles: [styles],
  tabIndex: -1
});

export { CityDetailsClosedEvent, CityDetailsClosedEventName, PanelCityDetails, ShowCityDetailsEvent, ShowCityDetailsEventName };
//# sourceMappingURL=panel-city-details.js.map
