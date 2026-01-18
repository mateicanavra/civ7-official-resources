import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { O as OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.chunk.js';

const HexToFloat4 = (hex, alpha = 1) => {
  const r = hex >> 16 & 255;
  const g = hex >> 8 & 255;
  const b = hex & 255;
  return { x: r / 255, y: g / 255, z: b / 255, w: Math.min(1, Math.max(0, alpha)) };
};
const DISCOVERY_BORDER = HexToFloat4(16777215, 1);
const DISCOVERY_FADE = HexToFloat4(3098623, 0.2);
class DiscoveryLayer {
  static instance = new DiscoveryLayer();
  overlayGroup = WorldUI.createOverlayGroup("discoveryLens", OVERLAY_PRIORITY.MAX_PRIORITY);
  plotOverlay = this.overlayGroup.addPlotOverlay();
  borderOverlay = this.overlayGroup.addBorderOverlay({
    style: "CultureBorder_Closed",
    primaryColor: DISCOVERY_BORDER,
    secondaryColor: DISCOVERY_FADE
  });
  onPlotOrConstructibleChanged(data) {
    this.updatePlot(data.location);
  }
  initLayer() {
  }
  applyLayer() {
    engine.on("PlotVisibilityChanged", this.onPlotOrConstructibleChanged, this);
    engine.on("ConstructibleAddedToMap", this.onPlotOrConstructibleChanged, this);
    engine.on("ConstructibleRemovedFromMap", this.resetOverlay, this);
    this.resetOverlay();
  }
  resetOverlay() {
    this.overlayGroup.clearAll();
    this.plotOverlay.clear();
    this.borderOverlay.clear();
    this.borderOverlay.setThicknessScale(0.66);
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const plotCoord = { x, y };
        this.updatePlot(plotCoord);
      }
    }
  }
  removeLayer() {
    this.overlayGroup.clearAll();
    this.plotOverlay.clear();
    this.borderOverlay.clear();
    engine.off("PlotVisibilityChanged", this.onPlotOrConstructibleChanged, this);
    engine.off("ConstructibleAddedToMap", this.onPlotOrConstructibleChanged, this);
    engine.off("ConstructibleRemovedFromMap", this.resetOverlay, this);
  }
  updatePlot(plotCoord) {
    const plot = GameplayMap.getIndexFromLocation(plotCoord);
    check: {
      const revealedState = GameplayMap.getRevealedState(GameContext.localPlayerID, plotCoord.x, plotCoord.y);
      if (revealedState == RevealedStates.HIDDEN) break check;
      const district = Districts.getAtLocation(plot);
      if (!district) break check;
      if (district.type != DistrictTypes.WILDERNESS && district.type != DistrictTypes.RURAL) break check;
      const constructibles = MapConstructibles.getHiddenFilteredConstructibles(plotCoord.x, plotCoord.y);
      for (const constructibleID of constructibles) {
        const constructible = Constructibles.getByComponentID(constructibleID);
        if (!constructible) {
          console.error("discovery-layer: unable to find constructible for ID");
          continue;
        }
        const constructibleInfo = GameInfo.Constructibles.lookup(constructible.type);
        if (!constructibleInfo) {
          console.error("discovery-layer: unable to find constructible definition for constructible");
          continue;
        }
        if (constructibleInfo.Discovery) {
          this.borderOverlay.setPlotGroups(plot, 0);
          this.plotOverlay.addPlots(plot, { fillColor: DISCOVERY_FADE, edgeColor: DISCOVERY_FADE });
          return;
        }
      }
    }
    this.borderOverlay.clearPlotGroups(plot);
  }
}
LensManager.registerLensLayer("fxs-discovery-layer", new DiscoveryLayer());

export { DiscoveryLayer };
//# sourceMappingURL=discovery-layer.js.map
