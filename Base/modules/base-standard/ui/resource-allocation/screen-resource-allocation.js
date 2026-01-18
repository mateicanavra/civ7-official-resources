import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as Navigation } from '../../../core/ui/views/view-manager.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { R as ResourceAllocation } from './model-resource-allocation.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../utilities/utilities-city-yields.chunk.js';

const content = "<div class=\"resource-root h-full w-full flex flex-col\">\r\n\t<div class=\"resource-allocation-parent-slot flex flex-col flex-auto w-full mt-8 mb-16\">\r\n\t\t<div\r\n\t\t\tclass=\"wait-turn img-modal-frame absolute flex p-4\"\r\n\t\t\tdata-bind-if=\"{{g_ResourceAllocationModel.isResourceAssignmentLocked}}\"\r\n\t\t>\r\n\t\t\t<div class=\"img-city-ageless relative size-12 mr-1\"></div>\r\n\t\t\t<div class=\"relative flex flex-col flex-auto\">\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"font-title text-xs uppercase\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_UNAVAILABLE\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"font-body text-xs\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_RESOURCE_SLOT_REQUIRED\"\r\n\t\t\t\t></div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"resource-civ-symbol relative bg-center bg-contain self-center size-20\"></div>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"civilization-name relative font-title text-base uppercase text-shadow\"\r\n\t\t\tfiligree-style=\"none\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"resource-header relative font-title text-xl uppercase text-shadow\"\r\n\t\t\tfiligree-style=\"none\"\r\n\t\t\ttitle=\"LOC_UI_RESOURCE_ALLOCATION_RESOURCES\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-vslot class=\"border-frame-container shrink grow w-full\">\r\n\t\t\t<fxs-frame\r\n\t\t\t\tframe-style=\"f2\"\r\n\t\t\t\tclass=\"resource-allocation-inner-frame grow\"\r\n\t\t\t\toverride-styling=\"items-center pt-5 relative flex max-w-full max-h-full px-10 pb-10\"\r\n\t\t\t\tfiligree-class=\"hidden\"\r\n\t\t\t\ttop-border-style=\"none\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"empire-resources mx-4 mb-6\">\r\n\t\t\t\t\t<div class=\"empire-resource-box relative items-center\">\r\n\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\tclass=\"empire-resource-list flex items-center justify-center flex-wrap max-w-full\"\r\n\t\t\t\t\t\t></fxs-spatial-slot>\r\n\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\tclass=\"resource-column-header relative flex justify-center font-title text-2xs uppercase text-secondary\"\r\n\t\t\t\t\t\t\ttitle=\"LOC_UI_RESOURCE_ALLOCATION_EMPIRE_RESOURCES\"\r\n\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"city-header-filter-container mb-2 flow-row\">\r\n\t\t\t\t\t<div class=\"available-resources-header-container mb-2 mx-4 w-1\\/4\">\r\n\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\tclass=\"resource-column-header relative flex justify-start font-title text-base uppercase text-secondary\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_RESOURCES\"\r\n\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\tclass=\"box-header flex justify-start font-body text-xs\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_ALLOCATE_RESOURCE_SETTLEMENT\"\r\n\t\t\t\t\t\t></p>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"flow-row mx-8 flex-auto\">\r\n\t\t\t\t\t\t<div class=\"city-header-container grow h-full\">\r\n\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\tclass=\"city-column-header relative flex justify-start font-title text-base uppercase text-secondary\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_SETTLEMENTS\"\r\n\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\tclass=\"box-header flex justify-start font-body text-xs\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_SELECT_SETTLEMENT\"\r\n\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<fxs-hslot class=\"city-filter-container grow h-full justify-end items-end\">\r\n\t\t\t\t\t\t\t<div class=\"relative flex items-end mr-3\">\r\n\t\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body text-xs mb-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_SHOW_YIELDS\"\r\n\t\t\t\t\t\t\t\t\tselected=\"true\"\r\n\t\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t\t<fxs-checkbox class=\"show-yields\"></fxs-checkbox>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"relative flex items-end mr-3\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body text-xs mb-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_SHOW_TOWNS\"\r\n\t\t\t\t\t\t\t\t\tselected=\"true\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<fxs-checkbox class=\"show-cities\"></fxs-checkbox>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"relative flex items-end show-factories-container\">\r\n\t\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body text-xs mb-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_ALLOCATION_SHOW_FACTORIES\"\r\n\t\t\t\t\t\t\t\t\tselected=\"true\"\r\n\t\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t\t<fxs-checkbox class=\"show-factories\"></fxs-checkbox>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</fxs-hslot>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<fxs-hslot\r\n\t\t\t\t\tclass=\"resources-columns grow shrink w-full mb-4\"\r\n\t\t\t\t\tfocus-rule=\"last\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\tclass=\"available-resources-column w-1\\/4 mx-4 max-h-full\"\r\n\t\t\t\t\t\tignore-prior-focus=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<fxs-inner-frame class=\"resource-box relative items-stretch flex-auto\">\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"no-resources-overlay flex flex-col items-center justify-center absolute w-full h-full\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body text-base\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_NO_RESOURCES_AVAILABLE\"\r\n\t\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body text-sm\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_RESOURCE_RESOURCE_ALLOCATION_UNAVAILABLE\"\r\n\t\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"available-resources-wrapper flex flex-col max-h-full grow m-2\">\r\n\t\t\t\t\t\t\t\t<div class=\"available-city-resources-container flex-auto max-h-1\\/3\">\r\n\t\t\t\t\t\t\t\t\t<div class=\"flex p-3\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-city-resources-header flex justify-start font-title text-sm uppercase text-secondary\"\r\n\t\t\t\t\t\t\t\t\t\t\ttitle=\"LOC_UI_RESOURCE_CITY\"\r\n\t\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t</fxs-header>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t<fxs-scrollable class=\"available-city-resources-scrollable flex-auto pr-4 w-full\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-city-resource-list flex w-full mb-8 flex-wrap flex-auto justify-start items-start\"\r\n\t\t\t\t\t\t\t\t\t\t\tignore-prior-focus=\"true\"\r\n\t\t\t\t\t\t\t\t\t\t></fxs-spatial-slot>\r\n\t\t\t\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t<div class=\"available-bonus-resources-container flex-auto max-h-1\\/3\">\r\n\t\t\t\t\t\t\t\t\t<div class=\"flex p-3\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-bonus-resources-header flex justify-start font-title text-sm uppercase text-secondary\"\r\n\t\t\t\t\t\t\t\t\t\t\ttitle=\"LOC_UI_RESOURCE_BONUS\"\r\n\t\t\t\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t<fxs-scrollable class=\"available-bonus-resources-scrollable flex-auto pr-4 w-full\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-bonus-resource-list flex w-full mb-8 flex-wrap flex-auto justify-start items-start\"\r\n\t\t\t\t\t\t\t\t\t\t\tignore-prior-focus=\"true\"\r\n\t\t\t\t\t\t\t\t\t\t></fxs-spatial-slot>\r\n\t\t\t\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t<div class=\"available-factory-resources-container flex-auto max-h-1\\/3\">\r\n\t\t\t\t\t\t\t\t\t<div class=\"flex p-3\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-factory-resources-header flex justify-start font-title text-sm uppercase text-secondary\"\r\n\t\t\t\t\t\t\t\t\t\t\ttitle=\"LOC_UI_RESOURCE_FACTORY\"\r\n\t\t\t\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\t\t\t\t\tclass=\"available-factory-resources-scrollable flex-auto pr-4 w-full\"\r\n\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"available-factory-resource-list flex w-full mb-8 flex-wrap flex-auto justify-start items-start\"\r\n\t\t\t\t\t\t\t\t\t\t\tignore-prior-focus=\"true\"\r\n\t\t\t\t\t\t\t\t\t\t></fxs-spatial-slot>\r\n\t\t\t\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</fxs-inner-frame>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t\t<div class=\"city-column flow-column flex-auto mx-2 relative\">\r\n\t\t\t\t\t\t<fxs-inner-frame class=\"absolute inset-0 city-inner-frame inset-x-6\"></fxs-inner-frame>\r\n\t\t\t\t\t\t<fxs-scrollable class=\"resource-allocation-scrollable my-4 flex-auto w-full\">\r\n\t\t\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\t\t\tclass=\"city-list flex flex-col items-stretch\"\r\n\t\t\t\t\t\t\t\tignore-prior-focus=\"true\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t></fxs-vslot>\r\n\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-hslot>\r\n\t\t\t\t<fxs-close-button\r\n\t\t\t\t\tdata-audio-group-ref=\"audio-screen-resource-allocation\"\r\n\t\t\t\t\tdata-audio-close-selected=\"resource-alloc-close-selected\"\r\n\t\t\t\t></fxs-close-button>\r\n\t\t\t</fxs-frame>\r\n\t\t</fxs-vslot>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/resource-allocation/screen-resource-allocation.css";

var PanelType = /* @__PURE__ */ ((PanelType2) => {
  PanelType2[PanelType2["None"] = 0] = "None";
  PanelType2[PanelType2["AvailableResources"] = 1] = "AvailableResources";
  PanelType2[PanelType2["EmpireResources"] = 2] = "EmpireResources";
  PanelType2[PanelType2["Cities"] = 3] = "Cities";
  PanelType2[PanelType2["SelectedCity"] = 4] = "SelectedCity";
  return PanelType2;
})(PanelType || {});
class ScreenResourceAllocation extends Panel {
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  cityEngineInputListener = this.onCityEngineInput.bind(this);
  assignedResourceEngineInputListener = this.onAssignedResourceEngineInput.bind(this);
  availableResourceFocusListener = this.onAvailableResourceFocus.bind(this);
  cityFocusListener = this.onCityFocus.bind(this);
  cityUnfocusListener = this.onCityUnfocus.bind(this);
  empireResourceFocusListener = this.onEmpireResourceFocus.bind(this);
  assignedResourceFocusListener = this.onAssignedResourceFocus.bind(this);
  emptyResourceFocusListener = this.onEmptyResourceFocus.bind(this);
  cityResourceContainerFocusListener = this.onCityResourceContainerFocus.bind(this);
  availableResourceActivateListener = this.onAvailableResourceActivate.bind(this);
  assignedResourceActivateListener = this.onAssignedResourceActivate.bind(this);
  cityActivateListener = this.onCityActivate.bind(this);
  resourceMovedListener = this.onResourceMoved.bind(this);
  unassignActivateListener = this.onUnassignActivated.bind(this);
  onResourceListFocusedListener = this.onResourceListFocused.bind(this);
  onBonusResourceListFocusedListener = this.onBonusResourceListFocused.bind(this);
  onFactoryResourceListFocusedListener = this.onFactoryResourceListFocused.bind(this);
  onCityListFocusedListener = this.onCityListFocused.bind(this);
  onfilterContainerFocusedListener = this.onfilterContainerFocused.bind(this);
  closeListener = this.close.bind(this);
  buttonContainer = null;
  focusedPanel = 0 /* None */;
  parentSlot;
  filterContainer;
  cityList;
  availableResourceCol;
  availableResourceList;
  availableBonusResourceList;
  availableFactoryResourceList;
  cityListScrollable;
  availableResourceListScrollable;
  availableBonusResourceListScrollable;
  availableFactoryResourceListScrollable;
  gamepadWasActive = ActionHandler.isGamepadActive;
  onInitialize() {
    const playerObject = Players.get(GameContext.localPlayerID);
    if (!playerObject) {
      console.error("screen-resource-allocation: onInitialize: Failed to get local player!");
      return;
    }
    const civSymbol = MustGetElement(".resource-civ-symbol", this.Root);
    const civName = MustGetElement(".civilization-name", this.Root);
    civSymbol.style.backgroundImage = `url("${Icon.getCivIconForDiplomacyHeader(playerObject.civilizationType)}")`;
    civName.setAttribute("title", playerObject.civilizationName);
    const showYields = MustGetElement(".show-yields", this.Root);
    showYields.setAttribute("selected", "true");
    showYields.addEventListener(ComponentValueChangeEventName, this.onShowYieldsChanged);
    const showCities = MustGetElement(".show-cities", this.Root);
    showCities.setAttribute("selected", "true");
    showCities.addEventListener(ComponentValueChangeEventName, this.onShowTownsChanged);
    const showFactories = MustGetElement(".show-factories", this.Root);
    showFactories.setAttribute("selected", "true");
    showFactories.addEventListener(ComponentValueChangeEventName, this.onShowFactoriesChanged);
    if (Game.age != Game.getHash("AGE_MODERN")) {
      const availableFactoryResourcesContainer = MustGetElement(
        ".available-factory-resources-container",
        this.Root
      );
      availableFactoryResourcesContainer.classList.add("hidden");
      const showFactoriesCheckboxContainer = MustGetElement(".show-factories-container", this.Root);
      showFactoriesCheckboxContainer.classList.add("hidden");
      const availableCityResourcesContainer = MustGetElement(".available-city-resources-container", this.Root);
      availableCityResourcesContainer.classList.add("max-h-1\\/2");
      const availableBonusResourcesContainer = MustGetElement(".available-bonus-resources-container", this.Root);
      availableBonusResourcesContainer.classList.add("max-h-1\\/2");
    }
    this.parentSlot = MustGetElement(".border-frame-container", this.Root);
    this.filterContainer = MustGetElement(".city-filter-container", this.Root);
    this.cityList = MustGetElement(".city-list", this.Root);
    this.availableResourceCol = MustGetElement(".available-resources-column", this.Root);
    this.availableResourceList = MustGetElement(".available-city-resource-list", this.Root);
    this.availableBonusResourceList = MustGetElement(".available-bonus-resource-list", this.Root);
    this.availableFactoryResourceList = MustGetElement(".available-factory-resource-list", this.Root);
    this.cityListScrollable = MustGetElement(".resource-allocation-scrollable", this.Root);
    this.availableResourceListScrollable = MustGetElement(".available-city-resources-scrollable", this.Root);
    this.availableBonusResourceListScrollable = MustGetElement(".available-bonus-resources-scrollable", this.Root);
    this.availableFactoryResourceListScrollable = MustGetElement(
      ".available-factory-resources-scrollable",
      this.Root
    );
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    const empireResourceList = MustGetElement(".empire-resource-list", this.Root);
    this.filterContainer.addEventListener("focusin", this.onfilterContainerFocusedListener);
    this.cityList.addEventListener("focusin", this.onCityListFocusedListener);
    this.availableResourceList.addEventListener("focusin", this.onResourceListFocusedListener);
    this.availableBonusResourceList.addEventListener("focusin", this.onBonusResourceListFocusedListener);
    this.availableFactoryResourceList.addEventListener("focusin", this.onFactoryResourceListFocusedListener);
    engine.on("ResourceAssigned", this.resourceMovedListener);
    engine.on("ResourceUnassigned", this.resourceMovedListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.addEventListener("action-activate", this.closeListener);
    this.buildEmpireResources("g_ResourceAllocationModel.uniqueEmpireResources", empireResourceList);
    this.buildTreasureResources("g_ResourceAllocationModel.uniqueTreasureResources", empireResourceList);
    this.buildAvailableResources(
      this.availableResourceList,
      "g_ResourceAllocationModel.availableResources",
      "RESOURCECLASS_CITY"
    );
    this.buildAvailableResources(
      this.availableBonusResourceList,
      "g_ResourceAllocationModel.availableBonusResources",
      "RESOURCECLASS_BONUS"
    );
    this.buildAvailableResources(
      this.availableFactoryResourceList,
      "g_ResourceAllocationModel.availableFactoryResources",
      "RESOURCECLASS_FACTORY"
    );
    const cityOuterDiv = document.createElement("div");
    Databind.for(cityOuterDiv, "g_ResourceAllocationModel.availableCities", "entry");
    {
      const cityOuterContainer = document.createElement("fxs-hslot");
      cityOuterContainer.classList.add("city-outer", "relative", "flex", "pointer-events-auto", "mx-9", "mb-6");
      const idleOverlay = document.createElement("div");
      idleOverlay.classList.add("absolute", "w-full", "h-full", "flex", "flex-col");
      const idleImage = document.createElement("div");
      idleImage.classList.value = "city-idle-overlay relative grow";
      idleImage.classList.add(
        "group-hover\\:bg-secondary",
        "group-focus\\:bg-secondary",
        "group-pressed\\:bg-secondary"
      );
      idleOverlay.appendChild(idleImage);
      const idleSpacer = document.createElement("div");
      idleSpacer.classList.value = "relative h-8";
      idleOverlay.appendChild(idleSpacer);
      const cityActivatableResourcesContainer = document.createElement("fxs-vslot");
      cityActivatableResourcesContainer.classList.add(
        "city-activatable-resources-container",
        "flex",
        "flex-col",
        "grow"
      );
      cityOuterContainer.appendChild(cityActivatableResourcesContainer);
      const cityEntry = document.createElement("fxs-activatable");
      cityEntry.classList.add("city-entry", "group", "relative", "flex", "flex-col");
      cityEntry.setAttribute("data-audio-press-ref", "data-audio-select-press");
      cityActivatableResourcesContainer.appendChild(cityEntry);
      cityEntry.setAttribute("tabindex", "-1");
      Databind.attribute(cityOuterContainer, "settlement-type", "entry.settlementType");
      cityEntry.addEventListener("focus", this.cityFocusListener);
      cityEntry.addEventListener("focusout", this.cityUnfocusListener);
      cityEntry.addEventListener("action-activate", this.cityActivateListener);
      cityEntry.addEventListener(InputEngineEventName, this.cityEngineInputListener);
      Databind.attribute(cityEntry, "city-name", "entry.name");
      cityEntry.setAttribute("data-bind-attr-data-city-id", "{{entry.id.id}}");
      const cityInnerContainer = document.createElement("div");
      cityInnerContainer.classList.add(
        "city-entry-internal",
        "flex",
        "flex-col",
        "items-start",
        "relative",
        "grow",
        "mx-0.5",
        "m-1",
        "p-1"
      );
      const cityTopContainer = document.createElement("div");
      cityTopContainer.classList.add("city-top-container", "flex", "items-center", "mb-2");
      const settlementIcon = document.createElement("img");
      Databind.attribute(settlementIcon, "src", "entry.settlementIcon");
      settlementIcon.classList.add("relative", "size-8", "mx-1");
      cityTopContainer.appendChild(settlementIcon);
      const entryName = document.createElement("p");
      entryName.classList.add("settlement-name-text", "font-title", "text-sm", "uppercase");
      Databind.locText(entryName, "entry.name");
      cityTopContainer.appendChild(entryName);
      const settlementTypeName = document.createElement("p");
      settlementTypeName.classList.add("settlement-type-text", "font-title", "text-sm", "uppercase", "ml-1");
      settlementTypeName.setAttribute("data-bind-attr-data-l10n-id", "{{entry.settlementTypeName}}");
      cityTopContainer.appendChild(settlementTypeName);
      const inTradeNetworkWarning = document.createElement("div");
      inTradeNetworkWarning.classList.add("trade-warning-text", "font-title", "text-xs", "ml-1");
      inTradeNetworkWarning.innerHTML = Locale.stylize(
        `- [STYLE: text-negative]${Locale.compose("LOC_UI_RESOURCE_ALLOCATION_SETTLEMENT_DISCONNECTED")}[/STYLE]`
      );
      cityTopContainer.appendChild(inTradeNetworkWarning);
      Databind.classToggle(inTradeNetworkWarning, "hidden", "entry.isInTradeNetwork");
      cityInnerContainer.appendChild(cityTopContainer);
      const yieldBarRow = document.createElement("div");
      yieldBarRow.classList.add("city-yield-bar", "flex", "justify-center", "-mt-2");
      Databind.attribute(yieldBarRow, "city-name", "entry.name");
      cityInnerContainer.appendChild(yieldBarRow);
      yieldBarRow.insertAdjacentHTML(
        "beforeend",
        `
				<div role="paragraph" class="flex items-center m-1 pointer-events-auto" data-bind-for="stat:{{entry.yields}}">
					<fxs-icon class="size-8 bg-no-repeat bg-center" data-bind-attr-data-icon-id="{{stat.type}}" data-icon-context="YIELD" data-bind-attr-aria-label="{{stat.value}}+{{stat.label}}"></fxs-icon>
					<div class="font-body text-xs" data-bind-value="{{stat.value}}"></div>
				</div>
			`
      );
      const cityResourceContainer = document.createElement("fxs-spatial-slot");
      cityResourceContainer.classList.add("city-resource-container", "flex", "flex-row", "flex-wrap", "z-1");
      this.buildCityResources("entry.currentResources", "current-resource", cityResourceContainer);
      this.buildCityResources("entry.queuedResources", "queued-resource", cityResourceContainer);
      this.buildEmptySlots("entry.emptySlots", cityResourceContainer, "entry.id.id", "entry.name");
      cityResourceContainer.setAttribute("data-bind-attr-data-city-id", "{{entry.id.id}}");
      cityResourceContainer.setAttribute("ignore-prior-focus", "true");
      cityResourceContainer.addEventListener("focus", this.cityResourceContainerFocusListener);
      if (Game.age == Game.getHash("AGE_EXPLORATION")) {
        const cityTreasureContainerOuter = document.createElement("fxs-vslot");
        cityTreasureContainerOuter.classList.add(
          "city-treasure-resource-container",
          "absolute",
          "right-2",
          "top-2"
        );
        Databind.if(cityTreasureContainerOuter, "entry.hasTreasureResources");
        const cityTreasureContainer = document.createElement("fxs-hslot");
        cityTreasureContainerOuter.appendChild(cityTreasureContainer);
        cityTreasureContainer.classList.add(
          "city-treasure-resource-container-inner",
          "flex-wrap",
          "flex-row-reverse",
          "items-center",
          "grow"
        );
        const turnsUntilTreasureGenerated = document.createElement("div");
        turnsUntilTreasureGenerated.classList.add(
          "treasure-turn-count",
          "relative",
          "font-body",
          "text-xs",
          "flex",
          "self-end"
        );
        Databind.locText(turnsUntilTreasureGenerated, "entry.turnsUntilTreasureGenerated");
        cityTreasureContainerOuter.appendChild(turnsUntilTreasureGenerated);
        const treasureVictoryPointsContainer = document.createElement("fxs-hslot");
        treasureVictoryPointsContainer.classList.add(
          "treasure-victory-points-container",
          "size-14",
          "items-center",
          "justify-center"
        );
        const victoryPoints = document.createElement("div");
        victoryPoints.classList.add("relative", "font-body", "text-base");
        Databind.locText(victoryPoints, "entry.treasureVictoryPoints");
        treasureVictoryPointsContainer.appendChild(victoryPoints);
        const victoryPointsIcon = document.createElement("img");
        victoryPointsIcon.setAttribute("src", "popup_gold_laurels");
        victoryPointsIcon.classList.add("absolute", "size-14");
        treasureVictoryPointsContainer.appendChild(victoryPointsIcon);
        cityTreasureContainer.appendChild(treasureVictoryPointsContainer);
        cityInnerContainer.appendChild(cityTreasureContainerOuter);
      }
      if (Game.age == Game.getHash("AGE_MODERN")) {
        const cityFactoryResourceContainer = document.createElement("div");
        cityFactoryResourceContainer.classList.add(
          "city-factory-resource-container",
          "hud_sidepanel_list-bg_no-border",
          "flex-row-reverse",
          "items-start",
          "flex",
          "flex-row",
          "p-3",
          "mb-8"
        );
        const factoryIcon = document.createElement("img");
        factoryIcon.setAttribute("src", "res_factory");
        factoryIcon.classList.add("relative", "size-16", "m-1");
        Databind.if(cityFactoryResourceContainer, "entry.hasFactory");
        Databind.attribute(cityOuterContainer, "has-factory", "entry.hasFactory");
        const availableFactoryResourceSlot = document.createElement("fxs-activatable");
        availableFactoryResourceSlot.classList.add(
          "img-add-slot",
          "size-16",
          "m-1",
          "pointer-events-auto",
          "hover\\:bg-secondary",
          "focus\\:bg-secondary",
          "pressed\\:bg-secondary"
        );
        cityFactoryResourceContainer.appendChild(factoryIcon);
        cityFactoryResourceContainer.appendChild(availableFactoryResourceSlot);
        availableFactoryResourceSlot.setAttribute("data-bind-attr-data-city-id", "{{entry.id.id}}");
        availableFactoryResourceSlot.addEventListener("action-activate", this.cityActivateListener);
        Databind.if(availableFactoryResourceSlot, "entry.hasFactorySlot");
        this.buildCityResources("entry.factoryResources", "factory-resource", cityFactoryResourceContainer);
        cityFactoryResourceContainer.setAttribute("data-bind-attr-data-city-id", "{{entry.id.id}}");
        cityOuterContainer.appendChild(cityFactoryResourceContainer);
      }
      cityEntry.appendChild(idleOverlay);
      cityEntry.appendChild(cityInnerContainer);
      cityEntry.appendChild(cityResourceContainer);
      const razedOverlay = document.createElement("div");
      razedOverlay.classList.value = "razed-overlay img-modal-frame z-1 absolute flex flex-col w-full h-39 justify-center items-center pointer-events-none";
      const razedCityName = document.createElement("div");
      razedCityName.classList.value = "relative flex font-title text-base uppercase items-center justify-center";
      Databind.locText(razedCityName, "entry.name");
      const razedText = document.createElement("div");
      razedText.innerHTML = `
			<p class="relative flex font-title text-base uppercase text-negative items-center justify-center" data-l10n-id="LOC_UI_CITY_DETAILS_CITY_BEING_RAZED"></p>
			`;
      razedOverlay.appendChild(razedCityName);
      razedOverlay.appendChild(razedText);
      Databind.if(razedOverlay, "entry.isBeingRazed");
      cityOuterContainer.appendChild(razedOverlay);
      cityOuterDiv.appendChild(cityOuterContainer);
    }
    this.cityList.appendChild(cityOuterDiv);
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      frame.setAttribute("frame-style", "f1");
      frame.setAttribute("top-border-style", "");
      frame.setAttribute("filigree-class", "mt-1");
      frame.setAttribute("override-styling", "pt-5 relative flex size-full px-10 pb-10");
      const headerResource = MustGetElement(".resource-header", this.Root);
      if (frame.children.length > 0) {
        frame.insertBefore(headerResource, frame.children[0]);
      } else {
        frame.appendChild(headerResource);
      }
      const headerCivName = MustGetElement(".civilization-name", this.Root);
      frame.insertBefore(headerCivName, frame.children[0]);
      const headerCivIcon = MustGetElement(".resource-civ-symbol", this.Root);
      frame.insertBefore(headerCivIcon, frame.children[0]);
      const waitTurn = MustGetElement(".wait-turn", this.Root);
      frame.insertBefore(waitTurn, frame.children[0]);
    }
    engine.synchronizeModels();
    this.setButtonContainerVisible(!ActionHandler.isGamepadActive);
    const availableResourcesWrapper = MustGetElement(".available-resources-wrapper", this.Root);
    const noResourcesOverlay = MustGetElement(".no-resources-overlay", this.Root);
    Databind.classToggle(
      availableResourcesWrapper,
      "hidden",
      `!{{g_ResourceAllocationModel.shouldShowAvailableResources}}`
    );
    Databind.classToggle(
      noResourcesOverlay,
      "hidden",
      `{{g_ResourceAllocationModel.shouldShowAvailableResources}}`
    );
    ResourceAllocation.updateResources();
    this.updateNavTrayEntries();
    waitForLayout(() => {
      this.updateCityEntriesDisabledState();
    });
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.determineInitialFocus();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onCityListFocused() {
    this.updateAllScrollbarHandleGamepad();
  }
  onfilterContainerFocused() {
    this.updateAllScrollbarHandleGamepad();
    this.updateNavTrayEntries();
  }
  onResourceListFocused() {
    this.updateAllScrollbarHandleGamepad();
  }
  onBonusResourceListFocused() {
    this.updateAllScrollbarHandleGamepad();
  }
  onFactoryResourceListFocused() {
    this.updateAllScrollbarHandleGamepad();
  }
  buildEmpireResources(data, parent) {
    const resourceEntry = document.createElement("div");
    Databind.for(resourceEntry, data, "resource");
    {
      resourceEntry.classList.add("resource-allocation-resource-container");
      const resourceActivatable = document.createElement("fxs-activatable");
      resourceActivatable.setAttribute("data-audio-press-ref", "data-audio-select-press");
      resourceActivatable.classList.add("empire-resource", "relative");
      Databind.classToggle(resourceActivatable, "selected", "resource.selected");
      resourceActivatable.setAttribute("tabindex", "-1");
      resourceActivatable.classList.add(
        "city-resource",
        "mr-px",
        "hover\\:bg-secondary",
        "focus\\:bg-secondary",
        "pressed\\:bg-secondary"
      );
      resourceActivatable.setAttribute("data-bind-attr-data-resource-value", "{{resource.value}}");
      resourceActivatable.addEventListener("focus", this.empireResourceFocusListener);
      const icon = document.createElement("fxs-icon");
      icon.classList.add("resource-allocation-icon", "size-12");
      icon.setAttribute("data-icon-context", "RESOURCE");
      icon.setAttribute("data-bind-attr-data-icon-id", "{{resource.type}}");
      resourceActivatable.appendChild(icon);
      const resourceTypeIcon = document.createElement("img");
      resourceTypeIcon.setAttribute("data-bind-attr-src", "{{resource.classTypeIcon}}");
      resourceTypeIcon.classList.add("size-6", "absolute", "bottom-0", "left-0");
      resourceActivatable.appendChild(resourceTypeIcon);
      Databind.tooltip(resourceActivatable, "resource.bonus");
      resourceEntry.appendChild(resourceActivatable);
      const resourceCount = document.createElement("div");
      resourceCount.classList.add(
        "resource-count",
        "size-4",
        "absolute",
        "bottom-0",
        "right-0",
        "font-body",
        "text-xs",
        "flex",
        "justify-center",
        "items-center"
      );
      Databind.locText(resourceCount, "resource.count");
      resourceActivatable.appendChild(resourceCount);
      resourceCount.setAttribute("count", "resource.count");
    }
    parent.appendChild(resourceEntry);
  }
  buildTreasureResources(data, parent) {
    const resourceEntry = document.createElement("div");
    Databind.for(resourceEntry, data, "resource");
    {
      resourceEntry.classList.add("resource-allocation-resource-container");
      const resourceActivatable = document.createElement("fxs-activatable");
      resourceActivatable.setAttribute("data-audio-press-ref", "data-audio-select-press");
      resourceActivatable.classList.add("empire-resource", "relative");
      Databind.classToggle(resourceActivatable, "selected", "resource.selected");
      resourceActivatable.setAttribute("tabindex", "-1");
      resourceActivatable.classList.add(
        "city-resource",
        "mr-px",
        "hover\\:bg-secondary",
        "focus\\:bg-secondary",
        "pressed\\:bg-secondary"
      );
      resourceActivatable.setAttribute("data-bind-attr-data-resource-value", "{{resource.value}}");
      resourceActivatable.addEventListener("focus", this.empireResourceFocusListener);
      const icon = document.createElement("fxs-icon");
      icon.classList.add("resource-allocation-icon", "size-12");
      icon.setAttribute("data-icon-context", "RESOURCE");
      icon.setAttribute("data-bind-attr-data-icon-id", "{{resource.type}}");
      resourceActivatable.appendChild(icon);
      const resourceTypeIcon = document.createElement("img");
      resourceTypeIcon.setAttribute("data-bind-attr-src", "{{resource.classTypeIcon}}");
      resourceTypeIcon.classList.add("absolute", "bottom-0", "left-0");
      Databind.classToggle(resourceTypeIcon, "size-6", "!{{resource.canSpawnTreasureFleet}}");
      Databind.classToggle(resourceTypeIcon, "bottom-0", "!{{resource.canSpawnTreasureFleet}}");
      Databind.classToggle(resourceTypeIcon, "left-0", "!{{resource.canSpawnTreasureFleet}}");
      Databind.classToggle(resourceTypeIcon, "size-12", "{{resource.canSpawnTreasureFleet}}");
      Databind.classToggle(resourceTypeIcon, "-bottom-4", "{{resource.canSpawnTreasureFleet}}");
      Databind.classToggle(resourceTypeIcon, "-left-0", "{{resource.canSpawnTreasureFleet}}");
      resourceActivatable.appendChild(resourceTypeIcon);
      Databind.tooltip(resourceActivatable, "resource.bonus");
      resourceEntry.appendChild(resourceActivatable);
      const resourceCount = document.createElement("div");
      resourceCount.classList.add(
        "resource-count",
        "size-4",
        "absolute",
        "bottom-0",
        "right-0",
        "font-body",
        "text-xs",
        "flex",
        "justify-center",
        "items-center"
      );
      Databind.locText(resourceCount, "resource.count");
      resourceActivatable.appendChild(resourceCount);
      resourceCount.setAttribute("count", "resource.count");
    }
    parent.appendChild(resourceEntry);
  }
  buildCityResources(data, iconClass, parent) {
    const resourceDiv = document.createElement("div");
    Databind.for(resourceDiv, data, "resource");
    {
      const resourceActivatable = document.createElement("fxs-activatable");
      resourceActivatable.classList.add(
        "city-resource",
        "relative",
        "flex",
        "size-16",
        "items-center",
        "justify-center",
        "mr-0.5",
        "focus\\:bg-secondary"
      );
      resourceActivatable.setAttribute("tabindex", "-1");
      resourceActivatable.setAttribute("data-bind-attr-disabled", "{{resource.disabled}}");
      resourceActivatable.setAttribute(
        "data-bind-class-toggle",
        "selected:{{resource.selected}};hover-enabled:(!{{g_ResourceAllocationModel.selectedResourceClass}}||{{g_ResourceAllocationModel.selectedResource}}=={{resource.value}});opacity-70:(!!{{g_ResourceAllocationModel.selectedResourceClass}}&&{{g_ResourceAllocationModel.selectedResource}}!={{resource.value}})"
      );
      resourceActivatable.setAttribute("data-audio-press-ref", "none");
      resourceActivatable.setAttribute("disabled-cursor-allowed", "true");
      resourceActivatable.setAttribute("data-bind-attr-data-resource-value", "{{resource.value}}");
      resourceActivatable.setAttribute("data-bind-attr-data-resource-class", "{{resource.classType}}");
      resourceActivatable.setAttribute(
        "data-bind-attr-data-assignment-locked",
        "{{g_ResourceAllocationModel.isResourceAssignmentLocked}}"
      );
      resourceActivatable.setAttribute("data-bind-attr-data-in-trade-network", "{{resource.isInTradeNetwork}}");
      resourceActivatable.setAttribute("data-bind-attr-data-city-id", "{{entry.id.id}}");
      resourceActivatable.addEventListener("focus", this.assignedResourceFocusListener);
      resourceActivatable.addEventListener(InputEngineEventName, this.assignedResourceEngineInputListener);
      resourceActivatable.addEventListener("action-activate", this.assignedResourceActivateListener);
      const icon = document.createElement("fxs-icon");
      icon.classList.add(iconClass);
      icon.classList.add("resource-allocation-icon", "size-16", "m-1", "relative");
      icon.setAttribute("data-icon-context", "RESOURCE");
      icon.setAttribute("data-bind-attr-data-icon-id", "{{resource.type}}");
      resourceActivatable.appendChild(icon);
      const resourceTypeIcon = document.createElement("img");
      resourceTypeIcon.setAttribute("data-bind-attr-src", "{{resource.classTypeIcon}}");
      resourceTypeIcon.classList.add("size-6", "absolute", "bottom-0", "left-0");
      resourceActivatable.appendChild(resourceTypeIcon);
      Databind.tooltip(resourceActivatable, "resource.bonus");
      resourceDiv.appendChild(resourceActivatable);
    }
    parent.appendChild(resourceDiv);
  }
  buildEmptySlots(data, parent, cityIdData, cityNameData) {
    const resourceDiv = document.createElement("div");
    Databind.for(resourceDiv, data, "resource");
    {
      const resourceEntry = document.createElement("fxs-activatable");
      resourceEntry.setAttribute("tabindex", "-1");
      resourceEntry.setAttribute(
        "data-bind-attr-disabled",
        `!{{g_ResourceAllocationModel}}.canMakeResourceAssignmentRequest({{${cityIdData}}})?'true':'false'`
      );
      resourceEntry.setAttribute(
        "data-bind-class-toggle",
        `hover-enabled:{{g_ResourceAllocationModel}}.canMakeResourceAssignmentRequest({{${cityIdData}}});bg-accent-4:{{g_ResourceAllocationModel}}.canMakeResourceAssignmentRequest({{${cityIdData}}});opacity-70:(!!{{g_ResourceAllocationModel.selectedResourceClass}}&&!{{g_ResourceAllocationModel}}.canMakeResourceAssignmentRequest({{${cityIdData}}}))`
      );
      resourceEntry.setAttribute("disabled-cursor-allowed", "false");
      resourceEntry.setAttribute("data-bind-attr-data-city-id", `{{${cityIdData}}}`);
      resourceEntry.setAttribute("data-bind-attr-city-name", `{{${cityNameData}}}`);
      resourceEntry.setAttribute("data-audio-press-ref", "none");
      resourceEntry.addEventListener("action-activate", this.cityActivateListener);
      resourceEntry.addEventListener(InputEngineEventName, this.assignedResourceEngineInputListener);
      resourceEntry.addEventListener("focus", this.emptyResourceFocusListener);
      resourceEntry.classList.add(
        "city-resource",
        "img-add-slot",
        "size-16",
        "mr-px",
        "pointer-events-auto",
        "focus\\:bg-secondary",
        "pressed\\:bg-secondary"
      );
      Databind.tooltip(resourceEntry, "resource.tooltip");
      resourceDiv.appendChild(resourceEntry);
    }
    parent.appendChild(resourceDiv);
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    engine.off("ResourceAssigned", this.resourceMovedListener);
    engine.off("ResourceUnassigned", this.resourceMovedListener);
    this.onViewLoseFocus();
    super.onDetach();
  }
  onViewLoseFocus() {
    NavTray.clear();
  }
  close() {
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.CONSIDER_ASSIGN_RESOURCE,
      {},
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.CONSIDER_ASSIGN_RESOURCE,
        {}
      );
    }
    ResourceAllocation.clearSelectedResource();
    super.close();
  }
  onActiveDeviceTypeChanged(event) {
    if (event.detail && event.detail.gamepadActive != this.gamepadWasActive) {
      this.gamepadWasActive = event.detail.gamepadActive;
      this.setButtonContainerVisible(!event.detail?.gamepadActive);
      ResourceAllocation.clearSelectedResource();
      this.updateAllUnassignActivatable();
      this.updateAvailableResourceColDisabledState();
      this.updateCityEntriesDisabledState();
      waitForLayout(() => this.determineInitialFocus());
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.onCancel(inputEvent);
    }
  }
  onCityEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
  }
  onCancel(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (ResourceAllocation.selectedResourceClass) {
      ResourceAllocation.clearSelectedResource();
      this.updateAllUnassignActivatable();
      this.updateAvailableResourceColDisabledState();
      this.updateCityEntriesDisabledState();
      waitForLayout(() => this.determineInitialFocus());
    } else {
      this.close();
    }
  }
  onShowYieldsChanged = (e) => {
    const showYields = e.detail.value;
    this.Root.querySelectorAll(".city-yield-bar").forEach((yieldContainer) => {
      yieldContainer.classList.toggle("hidden", !showYields);
    });
  };
  onShowTownsChanged = (e) => {
    const showCities = e.detail.value;
    this.Root.querySelectorAll(".city-outer").forEach((cityEntry) => {
      const settlementType = cityEntry.getAttribute("settlement-type");
      const isCity = settlementType == "City" || settlementType == "Capital";
      cityEntry.classList.toggle("hidden", !showCities && !isCity);
    });
  };
  onShowFactoriesChanged = (e) => {
    const showFactories = e.detail.value;
    this.Root.querySelectorAll(".city-factory-resource-container").forEach((factoryContainer) => {
      factoryContainer.classList.toggle("hidden", !showFactories);
    });
  };
  onResourceMoved() {
    this.updateAllUnassignActivatable();
    this.updateAvailableResourceColDisabledState();
    this.updateCityEntriesDisabledState();
    waitForLayout(() => this.determineInitialFocus());
    this.playSound("data-audio-resource-assign");
  }
  onUnassignActivated(event) {
    const target = event.target;
    if (target == null) {
      console.error(
        "screen-resource-allocation: onUnassignActivated(): Invalid event target. It should be an HTMLElement"
      );
      return;
    }
    const selectedResource = ResourceAllocation.selectedResource;
    if (selectedResource == -1) {
      return;
    }
    ResourceAllocation.unassignResource(selectedResource);
    this.onResourceMoved();
  }
  onAvailableResourceFocus() {
    if (this.focusedPanel == 1 /* AvailableResources */) {
      return;
    }
    this.focusedPanel = 1 /* AvailableResources */;
    this.updateNavTrayEntries();
  }
  onCityFocus(event) {
    this.focusedPanel = 3 /* Cities */;
    const target = event.target;
    if (target == null) {
      console.error("panel-build-queue: onCityFocus(): Invalid event target. It should be an HTMLElement");
      return;
    }
    if (target.parentElement == null) {
      console.error(
        "panel-build-queue: onCityFocus(): Invalid event target.parentElement. It should be an HTMLElement"
      );
      return;
    }
    const parent = target.parentElement;
    const idleOverlay = parent?.previousSibling;
    if (idleOverlay) {
      idleOverlay.classList.add("bg-secondary");
    }
    if (ResourceAllocation.hasSelectedResource()) {
      const cityName = target.getAttribute("city-name");
      if (cityName == null) {
        console.error("panel-build-queue: onCityFocus(): Invalid city-name attribute");
        return;
      }
    }
    const cityIDAttribute = target.getAttribute("data-city-id");
    if (!cityIDAttribute) {
      console.error(
        "screen-resource-allocation: onCityFocus(): Failed to find data-city-id for city when activating more info!"
      );
      return;
    }
    const cityID = parseInt(cityIDAttribute);
    ResourceAllocation.focusCity(cityID);
    const cityResourceContainer = MustGetElement(".city-resource-container", target.parentElement);
    const focusableResources = cityResourceContainer.querySelectorAll("fxs-activatable[disabled='false']");
    if (focusableResources.length) {
      FocusManager.setFocus(cityResourceContainer);
    }
    this.updateNavTrayEntries();
  }
  onCityUnfocus(event) {
    const target = event.target;
    if (target == null) {
      console.error("panel-build-queue: onCityFocus(): Invalid event target. It should be an HTMLElement");
      return;
    }
    const parent = target.parentElement;
    const idleOverlay = parent?.previousSibling;
    if (idleOverlay) {
      idleOverlay.classList.remove("bg-secondary");
    }
  }
  onEmpireResourceFocus() {
    this.focusedPanel = 2 /* EmpireResources */;
  }
  onAvailableResourceActivate(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const resourceValueAttribute = event.target.getAttribute("data-resource-value");
    const resourceClassAttribute = event.target.getAttribute("data-resource-class");
    const isInTradeNetwork = event.target.getAttribute("data-in-trade-network");
    const assignmentLocked = event.target.getAttribute("data-assignment-locked");
    if (!resourceValueAttribute || !resourceClassAttribute || !assignmentLocked || !isInTradeNetwork) {
      console.error(
        "screen-resource-allocation: onAvailableResourceActivate(): Failed to get attributes for resource!"
      );
      return;
    }
    if (assignmentLocked == "true" || isInTradeNetwork != "true") {
      return;
    }
    const resourceValue = parseInt(resourceValueAttribute);
    ResourceAllocation.selectAvailableResource(resourceValue, resourceClassAttribute);
    this.updateCityEntriesDisabledState();
    this.updateAvailableResourceColDisabledState();
    this.updateAllUnassignActivatable();
    waitForLayout(() => this.determineInitialFocus());
  }
  onAssignedResourceActivate(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    if (ActionHandler.isGamepadActive) {
      return;
    }
    const resourceValueAttribute = event.target.getAttribute("data-resource-value");
    const resourceClassAttribute = event.target.getAttribute("data-resource-class");
    const assignmentLocked = event.target.getAttribute("data-assignment-locked");
    const isInTradeNetwork = event.target.getAttribute("data-in-trade-network");
    if (!resourceValueAttribute || !resourceClassAttribute || !assignmentLocked || !isInTradeNetwork) {
      console.error(
        "screen-resource-allocation: onAssignedResourceActivate(): Failed to get attributes for resource!"
      );
      return;
    }
    if (assignmentLocked == "true" || isInTradeNetwork != "true") {
      return;
    }
    const resourceValue = parseInt(resourceValueAttribute);
    ResourceAllocation.selectAssignedResource(resourceValue, resourceClassAttribute);
    this.updateCityEntriesDisabledState();
    this.updateAvailableResourceColDisabledState();
    this.updateAllUnassignActivatable();
    this.focusCityList();
  }
  onCityActivate(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    this.selectCityAndTryAllocateSelectedResource(event.target);
  }
  buildAvailableResources(parent, data, resourceClass) {
    const resourceDiv = document.createElement("div");
    Databind.for(resourceDiv, data, "entry");
    {
      const resourceEntry = document.createElement("fxs-activatable");
      resourceEntry.classList.add(
        "resource-entry",
        "flex",
        "relative",
        "hover\\:bg-secondary",
        "focus\\:bg-secondary",
        "pressed\\:bg-secondary"
      );
      resourceEntry.setAttribute("data-bind-attr-disabled", "entry.disabled");
      resourceEntry.setAttribute("data-bind-attr-data-resource-value", "{{entry.value}}");
      resourceEntry.setAttribute("disabled-cursor-allowed", "false");
      resourceEntry.setAttribute("data-resource-class", resourceClass);
      resourceEntry.setAttribute(
        "data-bind-attr-data-assignment-locked",
        "{{g_ResourceAllocationModel.isResourceAssignmentLocked}}"
      );
      resourceEntry.setAttribute("data-audio-press-ref", "data-audio-select-press");
      Databind.classToggle(resourceEntry, "selected", "{{entry.selected}}");
      Databind.classToggle(resourceEntry, "opacity-30", "!{{entry.isInTradeNetwork}}");
      const icon = document.createElement("fxs-icon");
      icon.classList.add("resource-allocation-icon", "size-16", "mr-1", "relative");
      icon.setAttribute("data-icon-context", "RESOURCE");
      icon.setAttribute("data-bind-attr-data-icon-id", "{{entry.type}}");
      resourceEntry.appendChild(icon);
      Databind.tooltip(resourceEntry, "entry.bonus");
      resourceEntry.setAttribute("tabindex", "-1");
      resourceEntry.addEventListener("focus", this.availableResourceFocusListener);
      resourceEntry.addEventListener("action-activate", this.availableResourceActivateListener);
      resourceEntry.setAttribute("data-bind-attr-data-in-trade-network", "{{entry.isInTradeNetwork}}");
      const resourceTypeIcon = document.createElement("img");
      resourceTypeIcon.setAttribute("data-bind-attr-src", "{{entry.classTypeIcon}}");
      resourceTypeIcon.classList.add("size-6", "absolute", "bottom-0", "left-0");
      resourceEntry.appendChild(resourceTypeIcon);
      resourceDiv.appendChild(resourceEntry);
    }
    parent.appendChild(resourceDiv);
    const unassignActivatable = document.createElement("fxs-activatable");
    unassignActivatable.classList.add("unassign-activatable", "hidden");
    unassignActivatable.setAttribute("resource-class", resourceClass);
    unassignActivatable.setAttribute("data-audio-press-ref", "data-audio-select-press");
    unassignActivatable.addEventListener("action-activate", this.unassignActivateListener);
    const emptySlotHoverOverlay = document.createElement("div");
    emptySlotHoverOverlay.classList.add(
      "img-add-slot",
      "size-16",
      "m-1",
      "pointer-events-auto",
      "bg-accent-4",
      "hover\\:bg-secondary",
      "focus\\:bg-secondary",
      "pressed\\:bg-secondary"
    );
    unassignActivatable.appendChild(emptySlotHoverOverlay);
    parent.appendChild(unassignActivatable);
  }
  setButtonContainerVisible(isVisible) {
    if (!this.buttonContainer) {
      return;
    }
    this.buttonContainer.classList.toggle("hidden", !isVisible);
  }
  updateNavTrayEntries() {
    NavTray.clear();
    const currentFocus = FocusManager.getFocus();
    if (currentFocus.classList.contains("city-resource")) {
      NavTray.addOrUpdateGenericBack();
      NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_UNASSIGN");
    } else if (currentFocus.classList.contains("img-add-slot")) {
      NavTray.addOrUpdateCancel("LOC_GENERIC_CANCEL");
      NavTray.addOrUpdateAccept(
        Locale.compose("LOC_UI_RESOURCE_ALLOCATION_ALLOCATE", currentFocus.getAttribute("city-name") ?? "")
      );
    } else if (currentFocus.classList.contains("resource-entry")) {
      if (ResourceAllocation.selectedResourceClass) {
        NavTray.addOrUpdateCancel("LOC_GENERIC_CANCEL");
      } else {
        NavTray.addOrUpdateGenericBack();
      }
    } else {
      if (ResourceAllocation.selectedResourceClass) {
        NavTray.addOrUpdateCancel("LOC_GENERIC_CANCEL");
      } else {
        NavTray.addOrUpdateGenericBack();
      }
    }
  }
  determineInitialFocus() {
    const hasAvailableResources = ResourceAllocation.availableResources.length || ResourceAllocation.availableFactoryResources.length || ResourceAllocation.availableBonusResources.length;
    if (hasAvailableResources && !ResourceAllocation.selectedResourceClass) {
      if (ResourceAllocation.availableResources.length) {
        Focus.setContextAwareFocus(this.availableResourceList, this.Root);
      } else if (ResourceAllocation.availableBonusResources.length) {
        Focus.setContextAwareFocus(this.availableBonusResourceList, this.Root);
      } else if (ResourceAllocation.availableFactoryResources.length) {
        Focus.setContextAwareFocus(this.availableFactoryResourceList, this.Root);
      }
    } else if (ResourceAllocation.availableCities.length > 0) {
      this.focusCityList();
    } else {
      FocusManager.setFocus(this.parentSlot);
    }
  }
  focusCityList() {
    const cityEntries = this.cityList.querySelectorAll(".city-entry");
    for (const city of cityEntries) {
      if (Navigation.isFocusable(city)) {
        this.cityList.maybeComponent?.setInitialFocus(city);
        const resourceContainer = city.querySelector(".city-resource-container");
        const resourceEntries = resourceContainer?.children ?? [];
        for (const resource of resourceEntries) {
          if (Navigation.isFocusable(resource)) {
            resourceContainer?.maybeComponent?.setInitialFocus(resource);
            break;
          }
        }
        break;
      }
    }
    FocusManager.setFocus(this.cityList);
  }
  selectCityAndTryAllocateSelectedResource(cityEntry) {
    const cityIDAttribute = cityEntry.getAttribute("data-city-id");
    if (!cityIDAttribute) {
      console.error(
        "screen-resource-allocation: selectCityAndTryAllocateSelectedResource(): Failed to find data-city-id for city when activating more info!"
      );
      return false;
    }
    const hadSelectedResource = ResourceAllocation.hasSelectedResource();
    const cityID = parseInt(cityIDAttribute);
    ResourceAllocation.selectCity(cityID);
    if (hadSelectedResource) {
      this.updateCityEntriesDisabledState();
      this.updateAvailableResourceColDisabledState();
      this.updateAllUnassignActivatable();
      waitForLayout(() => this.determineInitialFocus());
    }
    return true;
  }
  onAssignedResourceEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (!(event.target instanceof HTMLElement)) {
      console.error("screen-resource-allocation: onAssignedResourceEngineInput invalid target!");
      return;
    }
    if (event.detail.name == "shell-action-1") {
      const resourceValueAttribute = event.target.getAttribute("data-resource-value");
      if (!resourceValueAttribute) {
        console.error(
          "screen-resource-allocation: onAssignedResourceEngineInput(): Failed to find data-resource-value for resource!"
        );
        return;
      }
      const assignmentLocked = event.target.getAttribute("data-assignment-locked");
      const isInTradeNetwork = event.target.getAttribute("data-in-trade-network");
      if (assignmentLocked == "true" || isInTradeNetwork != "true") {
        return;
      }
      const resourceValue = parseInt(resourceValueAttribute);
      ResourceAllocation.unassignResource(resourceValue);
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onAssignedResourceFocus(event) {
    const target = event.target;
    if (target == null) {
      console.error(
        "screen-resource-allocation: onAssignedResourceFocus(): Invalid event target. It should be an HTMLElement"
      );
      return;
    }
    const cityIDAttribute = target.getAttribute("data-city-id");
    if (!cityIDAttribute) {
      console.error("screen-resource-allocation: onAssignedResourceFocus(): Invalid City ID");
      return;
    }
    const cityID = parseInt(cityIDAttribute);
    ResourceAllocation.focusCity(cityID);
    this.updateNavTrayEntries();
  }
  onEmptyResourceFocus(event) {
    const target = event.target;
    if (target == null) {
      console.error(
        "screen-resource-allocation: onAssignedResourceFocus(): Invalid event target. It should be an HTMLElement"
      );
      return;
    }
    const cityIDAttribute = target.getAttribute("data-city-id");
    if (!cityIDAttribute) {
      console.error("screen-resource-allocation: onAssignedResourceFocus(): Invalid City ID");
      return;
    }
    const cityID = parseInt(cityIDAttribute);
    ResourceAllocation.focusCity(cityID);
    const cityEntries = this.cityList.querySelectorAll(".city-entry");
    if (cityEntries && ResourceAllocation.selectedResource == -1) {
      for (const city of cityEntries) {
        if (city.getAttribute("data-city-id") == cityIDAttribute) {
          FocusManager.setFocus(city);
          break;
        }
      }
    }
    this.updateNavTrayEntries();
  }
  onCityResourceContainerFocus(event) {
    if (!(event.target instanceof HTMLElement)) return;
    const focusableResources = event.target.querySelectorAll("fxs-activatable[disabled='false']");
    const cityActivatable = event.target.parentElement;
    if (!focusableResources.length && ResourceAllocation.selectedResource == -1 && cityActivatable) {
      FocusManager.setFocus(cityActivatable);
    }
  }
  updateCityEntriesDisabledState() {
    const cityEntries = this.cityList.querySelectorAll(".city-entry");
    cityEntries.forEach((cityEntry) => {
      const cityEntryId = Number.parseInt(cityEntry.getAttribute("data-city-id") ?? "0");
      const isDisabled = ResourceAllocation.isCityEntryDisabled(cityEntryId);
      cityEntry.setAttribute("disabled", isDisabled ? "true" : "false");
      cityEntry.querySelector(".city-idle-overlay")?.classList.toggle("opacity-50", isDisabled);
      cityEntry.querySelector(".city-entry-internal")?.classList.toggle("opacity-50", isDisabled);
    });
  }
  updateAvailableResourceColDisabledState() {
    this.availableResourceCol.classList.toggle(
      "disabled",
      !!ResourceAllocation.selectedResourceClass && ActionHandler.isGamepadActive
    );
  }
  updateAllUnassignActivatable() {
    const unassignActivatables = this.Root.getElementsByClassName("unassign-activatable");
    for (const unassignSlot of unassignActivatables) {
      const resourceClass = unassignSlot.getAttribute("resource-class");
      unassignSlot.classList.toggle(
        "hidden",
        resourceClass != ResourceAllocation.selectedResourceClass || ActionHandler.isGamepadActive || !ResourceAllocation.hasSelectedAssignedResource
      );
    }
  }
  updateAllScrollbarHandleGamepad() {
    const currentFocus = FocusManager.getFocus();
    this.availableResourceListScrollable.setAttribute(
      "handle-gamepad-pan",
      this.availableResourceList.contains(currentFocus) ? "true" : "false"
    );
    this.availableBonusResourceListScrollable.setAttribute(
      "handle-gamepad-pan",
      this.availableBonusResourceList.contains(currentFocus) ? "true" : "false"
    );
    this.availableFactoryResourceListScrollable.setAttribute(
      "handle-gamepad-pan",
      this.availableFactoryResourceList.contains(currentFocus) ? "true" : "false"
    );
    this.cityListScrollable.setAttribute(
      "handle-gamepad-pan",
      this.cityList.contains(currentFocus) ? "true" : "false"
    );
  }
}
Controls.define("screen-resource-allocation", {
  createInstance: ScreenResourceAllocation,
  description: "Resource Allocation screen.",
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  classNames: ["trigger-nav-help", "w-full", "h-full"]
});
//# sourceMappingURL=screen-resource-allocation.js.map
