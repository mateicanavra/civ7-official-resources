import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { CursorUpdatedEventName } from '../../../core/ui/input/cursor.js';
import { Focus } from '../../../core/ui/input/focus-support.js';
import { PlotCursor, PlotCursorUpdatedEventName } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { City } from '../city-selection/city-selection.js';
import { CityZoomer } from '../city-zoomer/city-zoomer.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';
import { PlaceBuildingV2 } from '../place-building/model-place-building-v2.js';
import { ProductionChooserScreen } from '../production-chooser/panel-production-chooser.js';

const TogglePlacementMinMaxEventName = "toggle-placement-min-max";
class TogglePlacementMinMaxEvent extends CustomEvent {
  constructor() {
    super(TogglePlacementMinMaxEventName);
  }
}
var HighlightColors = /* @__PURE__ */ ((HighlightColors2) => {
  HighlightColors2[HighlightColors2["okay"] = 3355505406] = "okay";
  HighlightColors2[HighlightColors2["good"] = 3357402549] = "good";
  HighlightColors2[HighlightColors2["best"] = 3360534819] = "best";
  return HighlightColors2;
})(HighlightColors || {});
class PlaceBuildingInterfaceMode extends ChoosePlotInterfaceMode {
  isPurchasing = false;
  plotOverlay = null;
  lastHoveredPlot = -1;
  mapFocused = true;
  uniqueQuarterModelGroup = WorldUI.createModelGroup("UniqueQuarterModelGroup");
  OUTER_REGION_OVERLAY_FILTER = { saturation: 0.1, brightness: 0.3 };
  //Semi-opaque dark grey to darken plots outside of the city
  cursorUpdateListener = this.onCursorUpdated.bind(this);
  plotCursorUpdatedListener = this.onPlotCursorUpdated.bind(this);
  initialize() {
    const context = this.Context;
    this.isPurchasing = context.IsPurchasing;
    const city = Cities.get(context.CityID);
    if (!city) {
      console.error(
        "interface-mode-place-building: Unable to find city with CityID: " + ComponentID.toLogString(context.CityID)
      );
      return false;
    }
    PlotCursor.plotCursorCoords = city.location;
    let result;
    if (this.isPurchasing) {
      result = Game.CityCommands.canStart(
        context.CityID,
        CityCommandTypes.PURCHASE,
        context.OperationArguments,
        false
      );
    } else {
      result = Game.CityOperations.canStart(
        context.CityID,
        CityOperationTypes.BUILD,
        context.OperationArguments,
        false
      );
    }
    const constructible = GameInfo.Constructibles.lookup(
      context.OperationArguments.ConstructibleType
    );
    if (!constructible) {
      console.error(
        "interface-mode-place-building: No valid ConstructibleDefinition from ConstructibleType: " + context.OperationArguments.ConstructibleType
      );
      InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: context.CityID });
      return false;
    }
    BuildingPlacementManager.initializePlacementData(context.CityID);
    BuildingPlacementManager.selectPlacementData(context.CityID, result, constructible);
    LensManager.setActiveLens("fxs-building-placement-lens");
    return true;
  }
  transitionTo(oldMode, newMode, context) {
    super.transitionTo(oldMode, newMode, context);
    ProductionChooserScreen.shouldReturnToPurchase = this.isPurchasing;
    UI.setCursorByType(UIHTMLCursorTypes.Place);
    this.lastHoveredPlot = -1;
    window.addEventListener(CursorUpdatedEventName, this.cursorUpdateListener);
    window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
    WorldUI.setUnitVisibility(false);
    waitForLayout(() => this.setMapFocused(true));
  }
  transitionFrom(oldMode, newMode) {
    WorldUI.popFilter();
    CityZoomer.resetZoom();
    if (this.plotOverlay) {
      this.plotOverlay.clear();
    }
    if (this.uniqueQuarterModelGroup) {
      this.uniqueQuarterModelGroup.clear();
    }
    window.removeEventListener(CursorUpdatedEventName, this.cursorUpdateListener);
    window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
    WorldUI.setUnitVisibility(true);
    LensManager.setActiveLens("fxs-default-lens");
    super.transitionFrom(oldMode, newMode);
  }
  /** @interface Handler  */
  canEnterMode(parameters) {
    const context = parameters;
    return context && context.IsPurchasing != void 0 && ComponentID.isValid(context.CityID);
  }
  reset() {
    BuildingPlacementManager.reset();
  }
  selectPlot(plot, _previousPlot) {
    if (BuildingPlacementManager.selectedPlotIndex == null || BuildingPlacementManager.selectedPlotIndex != GameplayMap.getIndexFromLocation(plot)) {
      BuildingPlacementManager.selectedPlotIndex = GameplayMap.getIndexFromLocation(plot);
      Audio.playSound("data-audio-error-press");
    } else {
      if (this.isPlotProposed) {
        throw new Error("A plot is already being proposed.");
      }
      this.isPlotProposed = true;
      this.proposePlot(
        plot,
        () => {
          this.acceptProposePlotCallback(plot);
        },
        () => this.isPlotProposed = false
      );
    }
    return false;
  }
  decorate(overlay) {
    const context = this.Context;
    const selectedCity = Cities.get(context.CityID);
    if (!selectedCity) {
      console.error(
        "interface-mode-place-building: Unable to retrieve city with CityID: " + ComponentID.toLogString(context.CityID)
      );
      return;
    }
    CityZoomer.zoomToCity(selectedCity);
    WorldUI.pushRegionColorFilter(selectedCity.getPurchasedPlots(), {}, this.OUTER_REGION_OVERLAY_FILTER);
    this.plotOverlay = overlay.addPlotOverlay();
    this.plotOverlay.addPlots(BuildingPlacementManager.urbanPlots, { fillColor: 3360534819 /* best */ });
    this.plotOverlay.addPlots(BuildingPlacementManager.developedPlots, { fillColor: 3355505406 /* okay */ });
    this.plotOverlay.addPlots(BuildingPlacementManager.expandablePlots, { fillColor: 3357402549 /* good */ });
    if (!BuildingPlacementManager.isRepairing) {
      for (const plotIndex of BuildingPlacementManager.uniqueQuarterPlots) {
        this.uniqueQuarterModelGroup.addVFXAtPlot(
          "VFX_3dUI_Hex_Highlight_01",
          plotIndex,
          { x: 0, y: 0, z: 0 },
          { angle: 0, constants: { Color3: [1, 0.992, 0.62], Alpha1: 1 } }
        );
      }
    }
  }
  undecorate(_overlay, _modelGroup) {
    this.plotOverlay = null;
  }
  onPlotCursorUpdated(event) {
    this.onPlotUpdated(event.detail.plotCoords);
  }
  onCursorUpdated(event) {
    this.onPlotUpdated(event.detail.plot);
  }
  /**
   * @override
   */
  decorateHover(plotCoord, cursorOverlay, cursorModelGroup) {
    cursorOverlay.clearAll();
    cursorModelGroup.clear();
    cursorModelGroup.addVFXAtPlot("VFX_3dUI_PlotCursor_City_Picker", plotCoord, { x: 0, y: 0, z: 0 });
  }
  onPlotUpdated(plot) {
    if (plot) {
      const plotIndex = GameplayMap.getIndexFromLocation(plot);
      if (plotIndex != this.lastHoveredPlot) {
        this.lastHoveredPlot = plotIndex;
        if (BuildingPlacementManager.isValidPlacementPlot(plotIndex)) {
          UI.setCursorByType(UIHTMLCursorTypes.Place);
        } else {
          UI.setCursorByType(UIHTMLCursorTypes.Default);
        }
        if (plotIndex != BuildingPlacementManager.hoveredPlotIndex) {
          BuildingPlacementManager.hoveredPlotIndex = plotIndex;
          BuildingPlacementManager.selectedPlotIndex = plotIndex;
        }
        Audio.playSound("data-audio-city-production-placement-focus", "city-actions");
      }
    } else {
      if (UI.getCursorType() != UIHTMLCursorTypes.Default) {
        UI.setCursorByType(UIHTMLCursorTypes.Default);
      }
      BuildingPlacementManager.hoveredPlotIndex = null;
      BuildingPlacementManager.selectedPlotIndex = null;
    }
  }
  acceptProposePlotCallback(plot) {
    this.commitPlot(plot);
    const context = this.Context;
    const constructible = GameInfo.Constructibles.lookup(
      context.OperationArguments.ConstructibleType
    );
    const constructibleType = constructible ? "-" + constructible.ConstructibleType : "";
    const selectedCityID = UI.Player.getHeadSelectedCity();
    if (selectedCityID && ComponentID.isValid(selectedCityID)) {
      const isEmptyQueue = City.isQueueEmpty(selectedCityID);
      if (isEmptyQueue || this.isPurchasing) {
        UI.sendAudioEvent("placement-activate" + constructibleType);
      } else {
        UI.sendAudioEvent("placement-queue" + constructibleType);
      }
      if (!this.isPurchasing && isEmptyQueue && !Configuration.getUser().isProductionPanelStayOpen) {
        UI.Player.deselectAllCities();
        InterfaceMode.switchToDefault();
      } else {
        InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: selectedCityID });
      }
    } else {
      console.warn(
        "Attempt to jump back to the city product (hopefully that was the previous UI mode) but no city is selected!"
      );
      InterfaceMode.switchToDefault();
    }
  }
  proposePlot(plot, accept, reject) {
    const plotIndex = GameplayMap.getIndexFromLocation(plot);
    if (!BuildingPlacementManager.currentConstructible?.ExistingDistrictOnly && (BuildingPlacementManager.uniqueQuarterPlots.length > 0 && !BuildingPlacementManager.uniqueQuarterPlots.includes(plotIndex) || BuildingPlacementManager.uniqueQuarterPlots.length <= 0 && BuildingPlacementManager.potentialUniqueQuarterPlots.map((a) => a.plotID).includes(plotIndex))) {
      const acceptCallback = () => {
        accept();
      };
      const cancelCallback = () => {
        this.setMapFocused(true);
        reject();
      };
      const okOption = {
        actions: ["accept"],
        label: "LOC_GENERIC_OK",
        callback: acceptCallback
      };
      const cancelOption = {
        actions: ["cancel", "keyboard-escape", "mousebutton-right"],
        label: "LOC_GENERIC_CANCEL",
        callback: cancelCallback
      };
      if (!BuildingPlacementManager.currentConstructible) {
        console.error(
          "interface-mode-place-building: No valid currentConstructible variable in BuildingPlacementManager!"
        );
        reject();
        return;
      }
      let currentQuarterDef = BuildingPlacementManager.currentQuarter ?? void 0;
      if (!currentQuarterDef) {
        currentQuarterDef = BuildingPlacementManager.potentialUniqueQuarterPlots.find(
          (a) => a.plotID == plotIndex
        )?.uniqueQuarterDef;
      }
      if (!currentQuarterDef) {
        console.error(
          "interface-mode-place-building: No valid current Quarter definition found! But one is expected!"
        );
        reject();
        return;
      }
      const body = Locale.stylize(
        "LOC_BUILDING_PLACEMENT_UNIQUE_QUARTER_BLOCKER_BODY",
        BuildingPlacementManager.currentConstructible.Name,
        currentQuarterDef.Name
      );
      const options = [okOption, cancelOption];
      NavTray.clear();
      DialogBoxManager.createDialog_MultiOption({
        body,
        title: "LOC_BUILDING_PLACEMENT_UNIQUE_QUARTER_BLOCKER",
        options,
        canClose: false
      });
    } else if (BuildingPlacementManager.urbanPlots.find((p) => p == plotIndex) || BuildingPlacementManager.expandablePlots.find((p) => p == plotIndex)) {
      accept();
    } else if (BuildingPlacementManager.developedPlots.find((p) => p == plotIndex)) {
      const acceptCallback = () => {
        accept();
      };
      const cancelCallback = () => {
        this.setMapFocused(true);
        reject();
      };
      if (!BuildingPlacementManager.currentConstructible) {
        console.error(
          "interface-mode-place-building: No valid currentConstructible variable in BuildingPlacementManager!"
        );
        reject();
        return;
      }
      const oldImprovementNameKey = this.getImprovementNameKey(plot);
      const okOption = {
        actions: ["accept"],
        label: "LOC_GENERIC_OK",
        callback: acceptCallback
      };
      const cancelOption = {
        actions: ["cancel", "keyboard-escape", "mousebutton-right"],
        label: "LOC_GENERIC_CANCEL",
        callback: cancelCallback
      };
      const options = [okOption, cancelOption];
      if (BuildingPlacementManager.currentConstructible.ConstructibleClass == "WONDER") {
        const body = oldImprovementNameKey != "" ? Locale.compose(
          "LOC_BUILDING_PLACEMENT_REMOVE_IMPOVEMENT_BODY",
          oldImprovementNameKey,
          BuildingPlacementManager.currentConstructible.Name
        ) : Locale.compose(
          "LOC_BUILDING_PLACEMENT_REMOVE_GENERIC_IMPOVEMENT_BODY",
          BuildingPlacementManager.currentConstructible.Name
        );
        NavTray.clear();
        DialogBoxManager.createDialog_MultiOption({
          body,
          title: "LOC_BUILDING_PLACEMENT_REMOVE_IMPOVEMENT",
          options,
          canClose: false
        });
      } else {
        const replacedConstructibleType = MapConstructibles.getReplaceableConstructible(plot.x, plot.y);
        if (replacedConstructibleType == -1) {
          const body = oldImprovementNameKey != "" ? Locale.compose(
            "LOC_BUILDING_PLACEMENT_CREATE_URBAN_TILE_REMOVE_IMPROVEMENT",
            oldImprovementNameKey,
            BuildingPlacementManager.currentConstructible.Name
          ) : Locale.compose(
            "LOC_BUILDING_PLACEMENT_CREATE_URBAN_TILE_BODY",
            BuildingPlacementManager.currentConstructible.Name
          );
          NavTray.clear();
          DialogBoxManager.createDialog_MultiOption({
            body,
            title: "LOC_BUILDING_PLACEMENT_CREATE_URBAN_TILE",
            options,
            canClose: false
          });
        } else {
          const body = Locale.compose(
            "LOC_BUILDING_PLACEMENT_REPLACE_BUILDING_BODY",
            BuildingPlacementManager.currentConstructible.Name
          );
          NavTray.clear();
          DialogBoxManager.createDialog_MultiOption({
            body,
            title: "LOC_BUILDING_PLACEMENT_REPLACE_BUILDING",
            options,
            canClose: false
          });
        }
      }
    } else {
      this.isPlotProposed = false;
    }
  }
  getImprovementNameKey(plotCoord) {
    const constructibles = MapConstructibles.getConstructibles(plotCoord.x, plotCoord.y);
    for (const constructible of constructibles) {
      const instance = Constructibles.getByComponentID(constructible);
      if (instance) {
        const info = GameInfo.Constructibles.lookup(instance.type);
        if (info && info.ConstructibleClass == "IMPROVEMENT") {
          return info.Name;
        }
      }
    }
    console.error(
      `interface-mode-place-building: Failed to find improvement where one should exist at ${plotCoord}`
    );
    return "";
  }
  commitPlot(plot) {
    const context = this.Context;
    const cityID = context.CityID;
    const operationArgs = context.OperationArguments;
    operationArgs.X = plot.x;
    operationArgs.Y = plot.y;
    let result = null;
    if (this.isPurchasing) {
      result = Game.CityCommands.canStart(cityID, CityCommandTypes.PURCHASE, operationArgs, false);
      if (result.Success) {
        Game.CityCommands.sendRequest(cityID, CityCommandTypes.PURCHASE, operationArgs);
      } else {
        this.isPlotProposed = false;
      }
    } else {
      result = Game.CityOperations.canStart(cityID, CityOperationTypes.BUILD, operationArgs, false);
      if (result.Success) {
        Game.CityOperations.sendRequest(cityID, CityOperationTypes.BUILD, operationArgs);
      } else {
        this.isPlotProposed = false;
      }
    }
    if (result.Success) {
      engine.trigger("CommitPlotBuildingPlacement");
    }
  }
  updateNavTray() {
    NavTray.clear();
    if (this.mapFocused) {
      if (PlaceBuildingV2.showExpandedView) {
        NavTray.addOrUpdateNotification("LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      } else {
        NavTray.addOrUpdateNotification("LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      }
      NavTray.addOrUpdateNextAction("LOC_UI_FOCUS_WORLD");
    } else {
      NavTray.addOrUpdateShellAction2("LOC_UI_FOCUS_PLACEMENT_INFO");
    }
    NavTray.addOrUpdateGenericCancel();
  }
  setMapFocused(isMapFocused) {
    this.mapFocused = isMapFocused;
    this.updateNavTray();
    if (this.mapFocused) {
      Input.setActiveContext(InputContext.World);
      Audio.playSound("data-audio-hero-press");
    } else {
      Input.setActiveContext(InputContext.Shell);
      const placeBuildingPanel = MustGetElement("panel-place-building-v2", document);
      Audio.playSound("data-audio-hero-press");
      if (placeBuildingPanel) {
        Focus.setContextAwareFocus(placeBuildingPanel, placeBuildingPanel);
      }
    }
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      const selectedCityID = UI.Player.getHeadSelectedCity();
      if (selectedCityID && ComponentID.isValid(selectedCityID)) {
        InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: selectedCityID });
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return false;
      }
    }
    const eventToLookFor = this.mapFocused ? "next-action" : "shell-action-2";
    if (inputEvent.detail.name == eventToLookFor) {
      this.setMapFocused(!this.mapFocused);
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return false;
    }
    if (inputEvent.detail.name == "unit-skip-turn" || inputEvent.detail.name == "notification") {
      window.dispatchEvent(new TogglePlacementMinMaxEvent());
      this.updateNavTray();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return false;
    }
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_PLACE_BUILDING", new PlaceBuildingInterfaceMode());

export { TogglePlacementMinMaxEvent, TogglePlacementMinMaxEventName };
//# sourceMappingURL=interface-mode-place-building.js.map
