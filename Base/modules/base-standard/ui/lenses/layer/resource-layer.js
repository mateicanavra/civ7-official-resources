import LensManager from '../../../../core/ui/lenses/lens-manager.js';

const SPRITE_PLOT_POSITION = { x: 0, y: 25, z: 5 };
const RESOURCE_SIZE = 42;
const TYPE_SIZE = 20;
const TYPE_OFFSET = { x: 0, y: -16 };
class ResourceLensLayer {
  static instance = new ResourceLensLayer();
  resourceSpriteGrid = WorldUI.createSpriteGrid(
    "AllResources_SpriteGroup",
    SpriteMode.FixedBillboard
  );
  resourceTypeSpriteGrid = WorldUI.createSpriteGrid(
    "AllResourcesClassType_SpriteGroup",
    SpriteMode.FixedBillboard
  );
  suppressedPlots = /* @__PURE__ */ new Set();
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
          this.addResourceSprites({
            location: { x, y },
            resource: resourceDefinition.ResourceType,
            class: resourceDefinition.ResourceClassType,
            isDistantLands: player.isDistantLands({ x, y })
          });
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
    const isTreasureFleet = entry.class == "RESOURCECLASS_TREASURE" && entry.isDistantLands;
    const typeAsset = UI.getIconBLP(isTreasureFleet ? "RESOURCECLASS_TREASURE_FLEET" : entry.class);
    const typeAssetFow = UI.getIconBLP(isTreasureFleet ? "RESOURCECLASS_TREASURE_FLEET" : entry.class, "FOW");
    this.resourceTypeSpriteGrid.addSpriteFOW(entry.location, typeAsset, typeAssetFow, SPRITE_PLOT_POSITION, {
      scale: TYPE_SIZE,
      offset: TYPE_OFFSET
    });
  }
  suppressPlots(plots) {
    if (this.suppressedPlots.size > 0) {
      console.log("resource-layer: suppressPlots() called multiple times without clearing\n");
      this.clearSuppressedPlots();
    }
    for (const plot of plots) {
      this.clearResourceSpritesFromPlot(plot);
      this.suppressedPlots.add(plot);
    }
  }
  clearSuppressedPlots() {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.log(`resource-layer: initLayer() Failed to find player for ${GameContext.localPlayerID}`);
      return;
    } else {
      for (const plot of this.suppressedPlots) {
        const location = GameplayMap.getLocationFromIndex(plot);
        const resource = GameplayMap.getResourceType(location.x, location.y);
        if (resource == ResourceTypes.NO_RESOURCE) {
          continue;
        }
        const resourceDefinition = GameInfo.Resources.lookup(resource);
        if (resourceDefinition) {
          this.addResourceSprites({
            location,
            resource: resourceDefinition.ResourceType,
            class: resourceDefinition.ResourceClassType,
            isDistantLands: player.isDistantLands(location)
          });
        }
      }
    }
    this.suppressedPlots.clear();
  }
  updateIconScaling() {
    const scale = Math.max(GlobalScaling.getCurrentScale() / 100, 1);
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
      this.addResourceSprites({
        location: data.location,
        resource: resourceDefinition.ResourceType,
        class: resourceDefinition.ResourceClassType,
        isDistantLands: player.isDistantLands(data.location)
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
      LensManager.toggleLayer("fxs-resource-layer", { serialize: true });
    }
  }
}
LensManager.registerLensLayer("fxs-resource-layer", ResourceLensLayer.instance);

export { ResourceLensLayer };
//# sourceMappingURL=resource-layer.js.map
