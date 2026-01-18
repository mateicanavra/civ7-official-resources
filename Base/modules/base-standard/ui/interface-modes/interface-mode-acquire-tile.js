import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { C as CityZoomer } from '../city-zoomer/city-zoomer.chunk.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';
import { PlacePopulation } from '../place-population/model-place-population.js';
import PlotWorkersManager, { PlotWorkersUpdatedEventName } from '../plot-workers/plot-workers-manager.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../utilities/utilities-overlay.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import './support-unit-map-decoration.chunk.js';
import '../placement-city-banner/placement-city-banner.js';
import '../utilities/utilities-city-yields.chunk.js';
import '../yield-bar-base/yield-bar-base.js';

const ToggleGrowthMinMaxEventName = "toggle-growth-min-max";
class ToggleGrowthMinMaxEvent extends CustomEvent {
  constructor() {
    super(ToggleGrowthMinMaxEventName);
  }
}
class AcquireTileInterfaceMode extends ChoosePlotInterfaceMode {
  validPlots = [];
  previousLens = "fxs-default-lens";
  plotOverlay = null;
  cityID = ComponentID.getInvalidID();
  lastHoveredPlot = -1;
  mapFocused = true;
  OUTER_REGION_OVERLAY_FILTER = { saturation: 0.1, brightness: 0.3 };
  //Semi-opaque dark grey to darken plots outside of the city
  districtAddedToMapHandle;
  plotWorkerUpdatedListener = this.onPlotWorkerUpdate.bind(this);
  /**
   * Initializes the interface mode.
   *
   * @override
   */
  initialize() {
    this.districtAddedToMapHandle = engine.on("DistrictAddedToMap", this.onDistrictAddedToMap);
    window.addEventListener(PlotWorkersUpdatedEventName, this.plotWorkerUpdatedListener);
    const context = this.Context;
    if (context.UnitID && ComponentID.isValid(context.UnitID)) {
      context.CityID = this.getUnitCityID(context.UnitID);
      this.updateValidPlotsFromUnitID(context.UnitID);
    } else if (context.CityID) {
      this.updateValidPlotsFromCityID(context.CityID);
    }
    if (this.validPlots.length == 0) {
      console.warn("Cannot start interface mode. No valid plots!");
    }
    if (this.validPlots.length > 0 || PlotWorkersManager.workablePlotIndexes.length > 0) {
      const city = Cities.get(this.cityID);
      if (city?.location) {
        PlotCursor.plotCursorCoords = city?.location;
      }
      return true;
    }
    return false;
  }
  updateValidPlotsFromUnitID(id) {
    this.validPlots = [];
    this.cityID = this.getUnitCityID(id);
    PlacePopulation.updateExpandPlotsForResettle(id);
    this.validPlots = PlacePopulation.getExpandPlotsIndexes();
    PlotWorkersManager.reset();
  }
  updateValidPlotsFromCityID(id) {
    this.validPlots = [];
    this.cityID = id;
    PlacePopulation.updateExpandPlots(id);
    this.validPlots = PlacePopulation.getExpandPlotsIndexes();
    PlotWorkersManager.initializeWorkersData(this.cityID);
  }
  /**
   * @override
   */
  selectPlot(plot, _previousPlot) {
    if (this.isPlotProposed) {
      throw new Error("A plot is already being proposed.");
    }
    this.isPlotProposed = true;
    this.proposePlot(
      plot,
      () => {
        this.commitPlot(plot);
      },
      () => this.isPlotProposed = false
    );
    return false;
  }
  /**
   * @interface Handler
   * @override
   */
  transitionTo(oldMode, newMode, context) {
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-city-growth-enter", "city-growth"));
    const aquireTileContext = context;
    if (aquireTileContext.CityID) {
      BuildingPlacementManager.initializePlacementData(aquireTileContext.CityID);
    } else if (aquireTileContext.UnitID) {
      BuildingPlacementManager.initializePlacementData(this.getUnitCityID(aquireTileContext.UnitID));
    }
    super.transitionTo(oldMode, newMode, context);
    this.previousLens = LensManager.getActiveLens();
    LensManager.setActiveLens("fxs-acquire-tile-lens");
    this.lastHoveredPlot = -1;
    if (PlotCursor?.plotCursorCoords) {
      this.hoverNewPlot(PlotCursor.plotCursorCoords.x, PlotCursor.plotCursorCoords.y);
    }
    WorldUI.setUnitVisibility(false);
    waitForLayout(() => this.setMapFocused(true));
  }
  setMapFocused(isMapFocused) {
    this.mapFocused = isMapFocused;
    this.updateNavTray();
    if (this.mapFocused) {
      Input.setActiveContext(InputContext.World);
    } else {
      Input.setActiveContext(InputContext.Shell);
      const placePopulationPanel = MustGetElement("panel-place-population", document);
      if (placePopulationPanel) {
        Focus.setContextAwareFocus(placePopulationPanel, placePopulationPanel);
      }
    }
  }
  /**
   * @interface Handler
   * @override
   */
  transitionFrom(oldMode, newMode) {
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-city-growth-exit", "city-growth"));
    this.plotOverlay?.clear();
    WorldUI.popFilter();
    CityZoomer.resetZoom();
    LensManager.setActiveLens(this.previousLens);
    super.transitionFrom(oldMode, newMode);
    UI.setCursorByType(UIHTMLCursorTypes.Default);
    WorldUI.setUnitVisibility(true);
  }
  /**
   * @interface Handler
   * @override
   */
  canEnterMode(parameters) {
    const cityID = parameters?.CityID;
    const unitID = parameters?.UnitID;
    return cityID && ComponentID.isValid(cityID) || unitID && ComponentID.isValid(unitID);
  }
  /**
   * @interface Handler
   * @override
   */
  canLeaveMode(_newMode) {
    return true;
  }
  getUnitCityID(unitID) {
    const unit = Units.get(unitID);
    if (unit) {
      const location = unit.location;
      if (location.x != -1 && location.y != -1) {
        return MapCities.getCity(unit.location.x, unit.location.y) ?? ComponentID.getInvalidID();
      }
      console.error(
        "Mode acquire tile has valid unit but invalid (-1,-1) location. cid:",
        ComponentID.toLogString(unit.id)
      );
    }
    return ComponentID.getInvalidID();
  }
  /**
   * @interface Handler
   * @override
   */
  reset() {
    this.validPlots = [];
    this.districtAddedToMapHandle?.clear();
    window.removeEventListener(PlotWorkersUpdatedEventName, this.plotWorkerUpdatedListener);
  }
  /**
   * @override
   */
  decorate(overlay) {
    const selectedCity = Cities.get(this.cityID);
    if (!selectedCity) {
      console.error(
        "interface-mode-acquire-tile: Unable to retrieve city with CityID: " + ComponentID.toLogString(this.cityID)
      );
      return;
    }
    CityZoomer.zoomToCity(selectedCity);
    const validPlots = /* @__PURE__ */ new Set([...this.validPlots, ...selectedCity.getPurchasedPlots()]);
    WorldUI.pushRegionColorFilter([...validPlots], {}, this.OUTER_REGION_OVERLAY_FILTER);
    const CITY_TILE_GRAY_COLOR = { x: 0, y: 0, z: 0, w: 0.1 };
    const EXPAND_CITY_COLOR_LINEAR = { x: 0.8, y: 1, z: 0, w: 0.6 };
    const EXPAND_CITY_BORDER_COLOR_LINEAR = { x: 0.2, y: 0.3, z: 0, w: 1 };
    const ADD_SPECIALIST_COLOR = { x: 0.05, y: 0, z: 0.4, w: 0.9 };
    const ADD_SPECIALIST_BORDER_COLOR = { x: 0.1, y: 0, z: 0.1, w: 1 };
    this.plotOverlay = overlay.addPlotOverlay();
    this.plotOverlay.addPlots([...validPlots], { fillColor: CITY_TILE_GRAY_COLOR });
    this.plotOverlay.addPlots(this.validPlots, {
      fillColor: EXPAND_CITY_COLOR_LINEAR,
      edgeColor: EXPAND_CITY_BORDER_COLOR_LINEAR
    });
    this.plotOverlay.addPlots(PlotWorkersManager.workablePlotIndexes, {
      fillColor: ADD_SPECIALIST_COLOR,
      edgeColor: ADD_SPECIALIST_BORDER_COLOR
    });
    WorldUI.setUnitVisibility(false);
  }
  /**
   * @override
   */
  undecorate(_overlay, _modelGroup) {
    this.plotOverlay = null;
  }
  /**
   * @override
   */
  decorateHover(plotCoord, cursorOverlay, cursorModelGroup) {
    cursorOverlay.clearAll();
    cursorModelGroup.clear();
    cursorModelGroup.addVFXAtPlot("VFX_3dUI_PlotCursor_City_Picker", plotCoord, { x: 0, y: 0, z: 0 });
  }
  onPlotCursorCoordsUpdated(event) {
    super.onPlotCursorCoordsUpdated(event);
    if (event.detail.plotCoords) {
      this.hoverNewPlot(event.detail.plotCoords.x, event.detail.plotCoords.y);
    }
  }
  hoverNewPlot(x, y) {
    const plot = { x, y };
    const plotIndex = GameplayMap.getIndexFromLocation(plot);
    if (plotIndex != this.lastHoveredPlot) {
      this.lastHoveredPlot = plotIndex;
      PlotWorkersManager.hoveredPlotIndex = this.lastHoveredPlot;
      if (PlotWorkersManager.workablePlotIndexes.find((e) => e == plotIndex)) {
        UI.setCursorByType(UIHTMLCursorTypes.Place);
      } else if (this.validPlots.find((e) => e == plotIndex)) {
        UI.setCursorByType(UIHTMLCursorTypes.Place);
      } else {
        UI.setCursorByType(UIHTMLCursorTypes.Default);
      }
      UI.sendAudioEvent(Audio.getSoundTag("data-audio-city-growth-focus", "city-growth"));
    }
  }
  proposePlot(plot, accept, reject) {
    const plotIndex = GameplayMap.getIndexFromLocation(plot);
    if (this.validPlots.find((e) => e == plotIndex) || PlotWorkersManager.workablePlotIndexes.find((e) => e == plotIndex)) {
      accept();
    } else {
      Audio.playSound("data-audio-error-press");
      reject();
    }
  }
  commitPlot(plot) {
    const context = this.Context;
    const args = {};
    args.X = plot.x;
    args.Y = plot.y;
    let improvementEvent = "placement-activate";
    if (PlacePopulation.addImprovementType != "") {
      improvementEvent = "placement-activate-" + PlacePopulation.addImprovementType;
    }
    if (context.UnitID) {
      UI.sendAudioEvent(improvementEvent);
      Game.UnitCommands.sendRequest(context.UnitID, "UNITCOMMAND_RESETTLE", args);
    } else if (context.CityID) {
      const plotIndex = GameplayMap.getIndexFromLocation(plot);
      if (PlotWorkersManager.workablePlotIndexes.find((e) => e == plotIndex)) {
        const workerArgs = {
          Location: plotIndex,
          Amount: 1
        };
        const result = Game.PlayerOperations.canStart(
          GameContext.localPlayerID,
          PlayerOperationTypes.ASSIGN_WORKER,
          workerArgs,
          false
        );
        if (result.Success) {
          Audio.playSound("data-audio-worker-activate", "city-growth");
          Game.PlayerOperations.sendRequest(
            GameContext.localPlayerID,
            PlayerOperationTypes.ASSIGN_WORKER,
            workerArgs
          );
        } else {
          console.error(
            "interface-mode-acquire-tile: Unable to start ASSIGN_WORKER player operation on a valid workable tile."
          );
        }
      } else {
        Game.CityCommands.sendRequest(context.CityID, CityCommandTypes.EXPAND, args);
        UI.sendAudioEvent(improvementEvent);
      }
    }
  }
  updatePlotOverlay = () => {
    this.updateValidPlotsFromCityID(this.cityID);
    const city = Cities.get(this.cityID);
    const context = this.Context;
    if (city?.Growth?.isReadyToPlacePopulation && context.CityID) {
      this.placementOverlayGroup?.clearAll();
      WorldUI.popFilter();
      this.decorate(this.placementOverlayGroup);
      this.isPlotProposed = false;
      context.UnitID = void 0;
    } else {
      InterfaceMode.switchToDefault();
    }
  };
  onDistrictAddedToMap = (payload) => {
    if (ComponentID.isMatch(payload.cityID, this.cityID)) {
      this.updatePlotOverlay();
    }
  };
  onPlotWorkerUpdate() {
    this.updatePlotOverlay();
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      InterfaceMode.switchToDefault();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return false;
    }
    const eventToLookFor = this.mapFocused ? "next-action" : "shell-action-2";
    if (inputEvent.detail.name == eventToLookFor) {
      this.setMapFocused(!this.mapFocused);
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return false;
    }
    if (inputEvent.detail.name == "unit-skip-turn" || inputEvent.detail.name == "notification") {
      window.dispatchEvent(new ToggleGrowthMinMaxEvent());
      this.updateNavTray();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return false;
    }
    return true;
  }
  updateNavTray() {
    NavTray.clear();
    if (this.mapFocused) {
      if (PlacePopulation.showExpandedView) {
        NavTray.addOrUpdateNotification("LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      } else {
        NavTray.addOrUpdateNotification("LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      }
      NavTray.addOrUpdateNextAction("LOC_UI_FOCUS_PLACEMENT_INFO");
    } else {
      NavTray.addOrUpdateShellAction2("LOC_UI_FOCUS_WORLD");
    }
    NavTray.addOrUpdateGenericCancel();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_ACQUIRE_TILE", new AcquireTileInterfaceMode());

export { ToggleGrowthMinMaxEvent, ToggleGrowthMinMaxEventName };
//# sourceMappingURL=interface-mode-acquire-tile.js.map
