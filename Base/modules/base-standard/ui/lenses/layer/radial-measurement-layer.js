import { CursorUpdatedEventName } from '../../../../core/ui/input/cursor.js';
import { PlotCursor, PlotCursorUpdatedEventName } from '../../../../core/ui/input/plot-cursor.js';
import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { HexToFloat4 } from '../../../../core/ui/utilities/utilities-color.js';
import { ComponentID } from '../../../../core/ui/utilities/utilities-component-id.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

const mapW = GameplayMap.getGridWidth();
const centerPlots = [
  {
    plotOffset: { x: 0, y: 0 },
    offset: { x: 0, y: 0, z: 0 }
  }
];
const border3Plots = [
  {
    plotOffset: { x: 3, y: 0 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -3, y: 0 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -1, y: 3 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -1, y: -3 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: 2, y: 3 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: 2, y: -3 },
    offset: { x: 0, y: 0, z: 0 }
  }
];
const border6Plots = [
  {
    plotOffset: { x: 6, y: 0 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -6, y: 0 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: 3, y: 6 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: 3, y: -6 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -3, y: 6 },
    offset: { x: 0, y: 0, z: 0 }
  },
  {
    plotOffset: { x: -3, y: -6 },
    offset: { x: 0, y: 0, z: 0 }
  }
];
class RadialMeasureLayer {
  radialMeasureModelGroup = WorldUI.createModelGroup("RadialMeasure_ModelGroup");
  radialMeasureSpriteGrid = WorldUI.createSpriteGrid("RadialMeasure_SpriteGroup", true);
  radialMeasureOverlayGroup = WorldUI.createOverlayGroup(
    "RadialMeasureOverlayGroup",
    OVERLAY_PRIORITY.UNIT_ABILITY_RADIUS,
    { x: 1, y: 1, z: 1 }
  );
  radialMeasure_3_Overlay = this.radialMeasureOverlayGroup.addBorderOverlay({
    style: "CombatBorder",
    primaryColor: { x: 1, y: 1, z: 1, w: 1 },
    secondaryColor: { x: 1, y: 1, z: 1, w: 1 }
  });
  radialMeasure_3_OverlayFill = this.radialMeasureOverlayGroup.addPlotOverlay();
  radialMeasure_6_Overlay = this.radialMeasureOverlayGroup.addBorderOverlay({
    style: "CultureBorder_CityState_Open",
    primaryColor: { x: 1, y: 1, z: 1, w: 1 },
    secondaryColor: { x: 1, y: 1, z: 1, w: 1 }
  });
  radialMeasure_6_OverlayFill = this.radialMeasureOverlayGroup.addPlotOverlay();
  lastHoveredPlot = -1;
  cursorUpdateListener = this.onCursorUpdated.bind(this);
  plotCursorUpdatedListener = this.onPlotCursorUpdated.bind(this);
  onLayerHotkeyListener = this.onLayerHotkey.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  onInputContextChanged() {
    if (PlotCursor.plotCursorCoords) {
      this.onPlotUpdated(PlotCursor.plotCursorCoords);
    }
  }
  initLayer() {
    window.addEventListener("layer-hotkey", this.onLayerHotkeyListener);
  }
  applyLayer() {
    this.lastHoveredPlot = -1;
    this.radialMeasureOverlayGroup.clearAll();
    this.radialMeasureSpriteGrid.clear();
    this.radialMeasureModelGroup.clear();
    window.addEventListener(CursorUpdatedEventName, this.cursorUpdateListener);
    window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
    engine.on("InputContextChanged", this.inputContextChangedListener);
    engine.on("UnitSelectionChanged", this.inputContextChangedListener);
    if (PlotCursor.plotCursorCoords) {
      this.onPlotUpdated(PlotCursor.plotCursorCoords);
    }
  }
  removeLayer() {
    this.lastHoveredPlot = -1;
    this.radialMeasureOverlayGroup.clearAll();
    this.radialMeasureSpriteGrid.clear();
    this.radialMeasureModelGroup.clear();
    window.removeEventListener(CursorUpdatedEventName, this.cursorUpdateListener);
    window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
    engine.off("InputContextChanged", this.inputContextChangedListener);
    engine.off("UnitSelectionChanged", this.inputContextChangedListener);
  }
  onPlotCursorUpdated(event) {
    this.onPlotUpdated(event.detail.plotCoords);
  }
  onCursorUpdated(event) {
    this.onPlotUpdated(event.detail.plot);
  }
  onPlotUpdated(plot) {
    if (plot) {
      const plotIndex = GameplayMap.getIndexFromLocation(plot);
      if (plotIndex != this.lastHoveredPlot) {
        this.lastHoveredPlot = plotIndex;
        this.radialMeasureOverlayGroup.clearAll();
        this.radialMeasureSpriteGrid.clear();
        this.radialMeasureModelGroup.clear();
        const radius3 = GameplayMap.getPlotIndicesInRadius(plot.x, plot.y, 3);
        this.radialMeasure_3_Overlay.setPlotGroups(radius3, 0);
        this.radialMeasure_3_Overlay.setThicknessScale(10);
        this.radialMeasure_3_OverlayFill.addPlots(radius3, {
          fillColor: HexToFloat4(16777215, 0.3)
        });
        this.addLabels(plot, border3Plots, 3);
        const radius6 = GameplayMap.getPlotIndicesInRadius(plot.x, plot.y, 6);
        this.radialMeasure_6_Overlay.setPlotGroups(radius6, 0);
        this.radialMeasure_6_Overlay.setThicknessScale(10);
        this.radialMeasure_6_OverlayFill.addPlots(
          radius6.filter((e) => !radius3.includes(e)),
          { fillColor: HexToFloat4(16777215, 0.1) }
        );
        this.addLabels(plot, border6Plots, 6);
        this.addLabels(plot, centerPlots, 0);
        for (const rangePlot of radius6) {
          const plotLoc = GameplayMap.getLocationFromIndex(rangePlot);
          const revealedState = GameplayMap.getRevealedState(GameContext.localPlayerID, plotLoc.x, plotLoc.y);
          if (revealedState == RevealedStates.HIDDEN) continue;
          const city = Cities.getAtLocation(rangePlot);
          if (!city) continue;
          const cityLoc = city.location;
          if (cityLoc.x == plotLoc.x && cityLoc.y == plotLoc.y) {
            this.radialMeasureModelGroup.addVFXAtPlot(
              "VFX_3dUI_Hex_Highlight_01",
              rangePlot,
              { x: 0, y: 0, z: 0 },
              { angle: 0, constants: { Color3: [1, 0.992, 0.62], Alpha1: 1 } }
            );
          }
        }
        if (Input.getActiveContext() === InputContext.Unit && !ComponentID.isValid(UI.Player.getHeadSelectedUnit())) {
          this.radialMeasureModelGroup.addVFXAtPlot("VFX_3dUI_PlotCursor_01", plot, { x: 0, y: 0, z: 0 });
        }
      }
    }
  }
  addLabels(plot, labels, radius) {
    for (const label of labels) {
      const rowOffset = (plot.y & 1) === 0 && (label.plotOffset.y & 1) === 1 ? -1 : 0;
      const y = plot.y + label.plotOffset.y;
      const x = ((plot.x + label.plotOffset.x + rowOffset) % mapW + mapW) % mapW;
      const plotIndex = GameplayMap.getIndexFromXY(x, y);
      if (GameplayMap.isValidIndex(plotIndex)) {
        this.radialMeasureSpriteGrid.addText(plotIndex, radius.toString(), label.offset, {
          fonts: ["TitleFont"],
          placement: PlacementMode.WATER
        });
      }
    }
  }
  onLayerHotkey(hotkey) {
    if (hotkey.detail.name == "toggle-radial-measure-layer") {
      LensManager.toggleLayer("fxs-radial-measure-layer");
    }
  }
}
LensManager.registerLensLayer("fxs-radial-measure-layer", new RadialMeasureLayer());

export { RadialMeasureLayer };
//# sourceMappingURL=radial-measurement-layer.js.map
