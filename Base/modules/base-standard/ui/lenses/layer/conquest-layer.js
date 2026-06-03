import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

const DEFAULT_STYLE = {
  style: "ConquestBorder",
  primaryColor: 4281545523,
  secondaryColor: 4291624959
};
class ConquestLayer {
  overlayGroup = WorldUI.createOverlayGroup("conquestLens", OVERLAY_PRIORITY.PLOT_HIGHLIGHT);
  borderOverlay = this.overlayGroup.addBorderOverlay(DEFAULT_STYLE);
  onPlotOrConstructibleChanged(data) {
    this.updatePlot(data.location);
  }
  initLayer() {
    const alivePlayers = Players.getAlive();
    alivePlayers.forEach((player) => {
      const style = "ConquestBorder";
      const primaryColor = UI.Player.getPrimaryColorValueAsHex(player.id);
      const secondaryColor = UI.Player.getSecondaryColorValueAsHex(player.id);
      this.borderOverlay.setGroupStyle(player.id, {
        style,
        primaryColor,
        secondaryColor
      });
    });
  }
  applyLayer() {
    engine.on("PlotVisibilityChanged", this.onPlotOrConstructibleChanged, this);
    engine.on("ConstructibleAddedToMap", this.onPlotOrConstructibleChanged, this);
    engine.on("ConstructibleBuildCompleted", this.onPlotOrConstructibleChanged, this);
    engine.on("ConstructibleRemovedFromMap", this.resetOverlay, this);
    engine.on("DistrictControlChanged", this.resetOverlay, this);
    this.resetOverlay();
  }
  resetOverlay() {
    this.overlayGroup.clearAll();
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
    engine.off("PlotVisibilityChanged", this.onPlotOrConstructibleChanged, this);
    engine.off("ConstructibleAddedToMap", this.onPlotOrConstructibleChanged, this);
    engine.off("ConstructibleBuildCompleted", this.onPlotOrConstructibleChanged, this);
    engine.off("ConstructibleRemovedFromMap", this.resetOverlay, this);
    engine.off("DistrictControlChanged", this.resetOverlay, this);
  }
  updatePlot(plotCoord) {
    const plot = GameplayMap.getIndexFromLocation(plotCoord);
    const player = GameContext.localPlayerID;
    check: {
      const revealedState = GameplayMap.getRevealedState(player, plotCoord.x, plotCoord.y);
      if (revealedState == RevealedStates.HIDDEN) break check;
      const district = Districts.getAtLocation(plot);
      if (!district || !district.isDefensible) break check;
      this.borderOverlay.setPlotGroups(plot, district.controllingPlayer);
      return;
    }
    this.borderOverlay.clearPlotGroups(plot);
  }
}
LensManager.registerLensLayer("fxs-conquest-layer", new ConquestLayer());

export { ConquestLayer };
//# sourceMappingURL=conquest-layer.js.map
