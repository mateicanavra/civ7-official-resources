import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

const UPSCALE_START = 1080;
const SPRITE_PLOT_POSITION = { x: 0, y: 25, z: 5 };
const RESOURCE_SIZE = 42;
const TYPE_SIZE = 20;
const TYPE_OFFSET = { x: -12, y: -12 };
const TREASURE_FLEET_TYPE_SIZE = 42;
const TREASURE_FLEET_TYPE_OFFSET = { x: -5, y: -12 };
class ResourceLensLayer {
  resourceSpriteGrid = WorldUI.createSpriteGrid(
    "AllResources_SpriteGroup",
    SpriteMode.FixedBillboard
  );
  resourceTypeSpriteGrid = WorldUI.createSpriteGrid(
    "AllResourcesClassType_SpriteGroup",
    SpriteMode.FixedBillboard
  );
  resourceAddedToMapListener = (data) => {
    this.onResourceAddedToMap(data);
  };
  resourceRemovedFromMapListener = (data) => {
    this.onResourceRemovedFromMap(data);
  };
  onLayerHotkeyListener = this.onLayerHotkey.bind(this);
  onResizeListener = this.updateIconScaling.bind(this);
  /**
   * @implements ILensLayer
   */
  initLayer() {
    engine.on("ResourceAddedToMap", this.resourceAddedToMapListener);
    engine.on("ResourceRemovedFromMap", this.resourceRemovedFromMapListener);
    this.updateIconScaling();
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.log(`resource-layer: initLayer() Failed to find player for ${GameContext.localPlayerID}`);
      return;
    }
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const resource = GameplayMap.getResourceType(x, y);
        if (resource == ResourceTypes.NO_RESOURCE) {
          continue;
        }
        const resourceDefinition = GameInfo.Resources.lookup(resource);
        if (resourceDefinition) {
          if (resourceDefinition.ResourceClassType == "RESOURCECLASS_TREASURE" && player.isDistantLands({ x, y })) {
            this.addResourceSprites({
              location: { x, y },
              resource: resourceDefinition.ResourceType,
              class: resourceDefinition.ResourceClassType,
              canCreatetreasureFleet: true
            });
          } else {
            this.addResourceSprites({
              location: { x, y },
              resource: resourceDefinition.ResourceType,
              class: resourceDefinition.ResourceClassType,
              canCreatetreasureFleet: false
            });
          }
        } else {
          console.error(`Could not find resource with type ${resource}.`);
        }
      }
    }
    this.setResourceSpritesVisible(false);
    window.addEventListener("layer-hotkey", this.onLayerHotkeyListener);
    window.addEventListener("resize", this.onResizeListener);
  }
  applyLayer() {
    this.setResourceSpritesVisible(true);
  }
  removeLayer() {
    this.setResourceSpritesVisible(false);
  }
  getOptionName() {
    return "ShowMapResources";
  }
  addResourceSprites(entry) {
    const asset = UI.getIconBLP(entry.resource);
    const assetFow = UI.getIconBLP(entry.resource, "FOW");
    this.resourceSpriteGrid.addSpriteFOW(entry.location, asset, assetFow, SPRITE_PLOT_POSITION, {
      scale: RESOURCE_SIZE
    });
    if (entry.canCreatetreasureFleet) {
      const typeasset = UI.getIconBLP("RESOURCECLASS_TREASURE_FLEET");
      const typeassetFow = UI.getIconBLP("RESOURCECLASS_TREASURE_FLEET", "FOW");
      this.resourceTypeSpriteGrid.addSpriteFOW(entry.location, typeasset, typeassetFow, SPRITE_PLOT_POSITION, {
        scale: TREASURE_FLEET_TYPE_SIZE,
        offset: TREASURE_FLEET_TYPE_OFFSET
      });
    } else {
      const typeasset = UI.getIconBLP(entry.class);
      const typeassetFow = UI.getIconBLP(entry.class, "FOW");
      this.resourceTypeSpriteGrid.addSpriteFOW(entry.location, typeasset, typeassetFow, SPRITE_PLOT_POSITION, {
        scale: TYPE_SIZE,
        offset: TYPE_OFFSET
      });
    }
  }
  updateIconScaling() {
    const scale = Math.max(window.innerHeight / UPSCALE_START, 1);
    this.resourceSpriteGrid.setScale(scale);
    this.resourceTypeSpriteGrid.setScale(scale);
  }
  setResourceSpritesVisible(visible) {
    this.resourceSpriteGrid.setVisible(visible);
    this.resourceTypeSpriteGrid.setVisible(visible);
  }
  clearResourceSpritesFromPlot(plot) {
    this.resourceSpriteGrid.clearPlot(plot);
    this.resourceTypeSpriteGrid.clearPlot(plot);
  }
  onResourceAddedToMap(data) {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.log(
        `resource-layer: onResourceAddedToMap() Failed to find player for ${GameContext.localPlayerID}`
      );
      return;
    }
    const resourceDefinition = GameInfo.Resources.lookup(data.resourceType);
    if (resourceDefinition) {
      this.clearResourceSpritesFromPlot(data.location);
      const isTreasureFleetCreatable = resourceDefinition.ResourceClassType == "RESOURCECLASS_TREASURE" && player.isDistantLands({ x: data.location.x, y: data.location.y });
      this.addResourceSprites({
        location: data.location,
        resource: resourceDefinition.ResourceType,
        class: resourceDefinition.ResourceClassType,
        canCreatetreasureFleet: isTreasureFleetCreatable
      });
    } else {
      console.error(`Could not find resource with type ${data.resourceType}.`);
    }
  }
  onResourceRemovedFromMap(data) {
    this.clearResourceSpritesFromPlot(data.location);
  }
  onLayerHotkey(hotkey) {
    if (hotkey.detail.name == "toggle-resources-layer") {
      LensManager.toggleLayer("fxs-resource-layer");
    }
  }
}
LensManager.registerLensLayer("fxs-resource-layer", new ResourceLensLayer());
//# sourceMappingURL=resource-layer.js.map
