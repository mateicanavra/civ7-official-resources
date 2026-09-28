import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { ResourceLensLayer } from './resource-layer.js';
import { PlacePopulation } from '../../place-population/model-place-population.js';

class CityGrowthImprovementsLensLayer {
  spriteOffset = { x: 0, y: 15, z: 5 };
  spriteScale = 1;
  resourceXOffset = 10;
  improvementSpriteGrid = WorldUI.createSpriteGrid("CityGrowthImprovements", SpriteMode.Billboard);
  resourceTypeSpriteGrid = WorldUI.createSpriteGrid("CityGrowthImprovementsTop", SpriteMode.Billboard);
  suppressedResources = [];
  expandPlotDataUpdatedEventListener = this.updateImprovementIcons.bind(this);
  initLayer() {
    this.improvementSpriteGrid.setVisible(false);
    this.resourceTypeSpriteGrid.setVisible(false);
  }
  applyLayer() {
    this.updateImprovementIcons(PlacePopulation.getExpandPlots());
    PlacePopulation.ExpandPlotDataUpdatedEvent.on(this.expandPlotDataUpdatedEventListener);
    this.improvementSpriteGrid.setVisible(true);
    this.resourceTypeSpriteGrid.setVisible(true);
  }
  removeLayer() {
    PlacePopulation.ExpandPlotDataUpdatedEvent.off(this.expandPlotDataUpdatedEventListener);
    this.improvementSpriteGrid.clear();
    this.improvementSpriteGrid.setVisible(false);
    this.resourceTypeSpriteGrid.clear();
    this.resourceTypeSpriteGrid.setVisible(false);
    ResourceLensLayer.instance.clearSuppressedPlots();
    this.suppressedResources = [];
  }
  addResourceIcon(plot) {
    const location = GameplayMap.getLocationFromIndex(plot);
    const resource = GameplayMap.getResourceType(location.x, location.y);
    if (resource == ResourceTypes.NO_RESOURCE) {
      return false;
    }
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.log(`resource-layer: initLayer() Failed to find player for ${GameContext.localPlayerID}`);
      return false;
    }
    const def = GameInfo.Resources.lookup(resource);
    if (!def) {
      return false;
    }
    const asset = UI.getIconBLP(def.ResourceType);
    const treasureFleet = def.ResourceClassType == "RESOURCECLASS_TREASURE" && player.isDistantLands(location);
    const typeAsset = UI.getIconBLP(treasureFleet ? "RESOURCECLASS_TREASURE_FLEET" : def.ResourceClassType);
    const PX_SCALE = 16 / 42;
    this.improvementSpriteGrid.addSprite(plot, asset, this.spriteOffset, {
      offset: { x: this.resourceXOffset, y: 0 }
    });
    this.resourceTypeSpriteGrid.addSprite(plot, typeAsset, this.spriteOffset, {
      scale: 1.25 * PX_SCALE,
      offset: { x: this.resourceXOffset, y: -16 * PX_SCALE }
    });
    return true;
  }
  updateImprovementIcons(data) {
    this.improvementSpriteGrid.clear();
    this.resourceTypeSpriteGrid.clear();
    ResourceLensLayer.instance.clearSuppressedPlots();
    this.suppressedResources = [];
    for (const entry of data) {
      if (entry.constructibleType) {
        const constructibleDefinition = GameInfo.Constructibles.lookup(entry.constructibleType);
        if (constructibleDefinition) {
          const params = { scale: this.spriteScale };
          if (this.addResourceIcon(entry.plotIndex)) {
            params.offset = { x: -this.resourceXOffset, y: 0 };
          }
          const icon = UI.getIconBLP(constructibleDefinition.ConstructibleType, "BUILDING");
          this.improvementSpriteGrid.addSprite(entry.plotIndex, icon, this.spriteOffset, params);
          this.suppressedResources.push(entry.plotIndex);
        }
      }
    }
    ResourceLensLayer.instance.suppressPlots(this.suppressedResources);
  }
}
LensManager.registerLensLayer("fxs-city-growth-improvements-layer", new CityGrowthImprovementsLensLayer());
//# sourceMappingURL=city-growth-improvements-layer.js.map
