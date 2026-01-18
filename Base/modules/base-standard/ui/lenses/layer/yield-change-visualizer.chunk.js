class YieldChangeVisualizer {
  BASE_TEXT_PARAMS = { fonts: ["TitleFont"], stroke: 0, fontSize: 4, faceCamera: true };
  POSITIVE_ICON_PARAMS = { background: "yield_arrow_positive", iconOffsetY: 1.5, textOffsetY: -3.6 };
  NEGATIVE_ICON_PARAMS = { background: "yield_arrow_negative", iconOffsetY: -1.5, textOffsetY: 3.6 };
  PILL_SCALE = 0.9;
  ICON_SCALE = 0.35;
  isDestroyed = false;
  backgroundSpriteGrid;
  foregroundSpriteGrid;
  constructor(name) {
    this.backgroundSpriteGrid = WorldUI.createSpriteGrid(name + "_Background", true);
    this.foregroundSpriteGrid = WorldUI.createSpriteGrid(name + "_Foreground", true);
  }
  // If creating/destroying this class dynamically, must be called before the instance gets GC'd to avoid leaks
  // Recommended, but not necessary, on shutdown, WorldUI will clean up objects associated with the script context
  // TODO use FinalizationRegistry to ensure the WorldUI elements get released
  release() {
    this.backgroundSpriteGrid.destroy();
    this.foregroundSpriteGrid.destroy();
    this.isDestroyed = true;
  }
  clear() {
    console.assert(!this.isDestroyed);
    this.backgroundSpriteGrid.clear();
    this.foregroundSpriteGrid.clear();
  }
  clearPlot(plot) {
    console.assert(!this.isDestroyed);
    this.backgroundSpriteGrid.clearPlot(plot);
    this.foregroundSpriteGrid.clearPlot(plot);
  }
  setVisible(visible) {
    console.assert(!this.isDestroyed);
    this.backgroundSpriteGrid.setVisible(visible);
    this.foregroundSpriteGrid.setVisible(visible);
  }
  addSprite(plot, asset, offset, params) {
    console.assert(!this.isDestroyed);
    this.foregroundSpriteGrid.addSprite(plot, asset, offset, params);
  }
  addText(plot, text, offset, params) {
    console.assert(!this.isDestroyed);
    this.foregroundSpriteGrid.addText(plot, text, offset, params);
  }
  addYieldChange(data, location, offset, color, plotOffset) {
    console.assert(!this.isDestroyed);
    const params = data.yieldDelta < 0 ? this.NEGATIVE_ICON_PARAMS : this.POSITIVE_ICON_PARAMS;
    plotOffset = plotOffset ?? { x: 0, y: 0, z: 0 };
    this.backgroundSpriteGrid.addSprite(location, params.background, plotOffset, {
      offset,
      scale: this.PILL_SCALE
    });
    this.foregroundSpriteGrid.addSprite(location, UI.getIconBLP(data.yieldType.toString()), plotOffset, {
      offset: { x: offset.x, y: offset.y + params.iconOffsetY },
      scale: this.ICON_SCALE
    });
    this.foregroundSpriteGrid.addText(location, Math.abs(data.yieldDelta).toString(), plotOffset, {
      ...this.BASE_TEXT_PARAMS,
      offset: { x: offset.x, y: offset.y + params.textOffsetY },
      fill: color,
      stroke: 0
      // disable default black stroke, already has black background
    });
  }
}

export { YieldChangeVisualizer as Y };
//# sourceMappingURL=yield-change-visualizer.chunk.js.map
