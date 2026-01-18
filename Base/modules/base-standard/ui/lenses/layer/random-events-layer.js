import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import PlotIconsManager from '../../../../core/ui/plot-icons/plot-icons-manager.js';

class RandomEventsLayer {
  static instance = new RandomEventsLayer();
  plotRandomEvents = [];
  initLayer() {
  }
  applyLayer() {
    const player = Players.get(GameContext.localPlayerID);
    const playerDiplomacy = player?.Diplomacy;
    if (!playerDiplomacy) {
      console.error("random-events-layer: Unable to find local player diplomacy!");
      return;
    }
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const location = { x, y };
        if (!playerDiplomacy.isValidLandClaimLocation(location, true) || GameplayMap.isWater(x, y)) {
          continue;
        }
        const plotIndex = GameplayMap.getIndexFromXY(x, y);
        const canSufferEruption = MapFeatures.canSufferEruptionAt(plotIndex);
        const featureClassIndex = GameplayMap.getFeatureClassType(x, y);
        const isFloodPlains = GameInfo.FeatureClasses.lookup(featureClassIndex)?.FeatureClassType === "FEATURE_CLASS_FLOODPLAIN";
        if (canSufferEruption || isFloodPlains) {
          let eventClass = "";
          if (canSufferEruption) {
            eventClass = "CLASS_VOLCANO";
          }
          if (isFloodPlains) {
            eventClass = "CLASS_FLOOD";
          }
          const eventTooltip = isFloodPlains && canSufferEruption ? "CLASS_FLOOD_VOLCANO" : eventClass;
          this.plotRandomEvents.push({
            location,
            eventClass,
            tooltipKey: eventTooltip
          });
        }
      }
    }
    this.plotRandomEvents.forEach(({ location, eventClass }) => {
      const attributes = /* @__PURE__ */ new Map([["data-event-class", eventClass]]);
      PlotIconsManager.addPlotIcon("plot-icon-random-event", location, attributes);
    });
  }
  removeLayer() {
    PlotIconsManager.removePlotIcons("plot-icon-random-event");
  }
  getRandomEventResult(x, y) {
    return this.plotRandomEvents.find((event) => event.location.x === x && event.location.y === y);
  }
}
LensManager.registerLensLayer("fxs-random-events-layer", RandomEventsLayer.instance);

export { RandomEventsLayer };
//# sourceMappingURL=random-events-layer.js.map
