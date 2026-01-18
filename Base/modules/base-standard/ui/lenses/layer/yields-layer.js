import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

var ConstructibleYieldState = /* @__PURE__ */ ((ConstructibleYieldState2) => {
  ConstructibleYieldState2[ConstructibleYieldState2["NOT_PRODUCING"] = 0] = "NOT_PRODUCING";
  ConstructibleYieldState2[ConstructibleYieldState2["PRODUCING"] = 1] = "PRODUCING";
  return ConstructibleYieldState2;
})(ConstructibleYieldState || {});
class YieldsLensLayer {
  yieldSpritePadding = 12;
  yieldSpriteGrid = WorldUI.createSpriteGrid("AllYields_SpriteGroup", true);
  yieldIcons = /* @__PURE__ */ new Map();
  plotStates = [];
  revealedStates = [];
  plotsNeedingUpdate = [];
  constructibleStates = [];
  fontData = { fonts: ["TitleFont"], fontSize: 5, faceCamera: true };
  onLayerHotkeyListener = this.onLayerHotkey.bind(this);
  cacheIcons() {
    for (const y of GameInfo.Yields) {
      const icons = [];
      for (let i = 1; i < 6; ++i) {
        const icon = UI.getIconBLP(`${y.YieldType}_${i}`);
        icons.push(icon);
      }
      this.yieldIcons.set(y.$hash, icons);
    }
  }
  initLayer() {
    this.cacheIcons();
    this.revealedStates = GameplayMap.getRevealedStates(GameContext.localPlayerID);
    const revealedStatesLength = this.revealedStates.length;
    for (let i = 0; i < revealedStatesLength; ++i) {
      this.constructibleStates[i] = this.calculateConstructibleState(i);
      this.plotStates.push({
        revealedState: RevealedStates.HIDDEN,
        yields: /* @__PURE__ */ new Map(),
        constructibleState: 0 /* NOT_PRODUCING */
      });
      this.updatePlotState(i, this.revealedStates[i], this.constructibleStates[i]);
    }
    this.yieldSpriteGrid.setVisible(false);
    engine.on("PlotVisibilityChanged", this.onPlotVisibilityChanged, this);
    engine.on("PlotYieldChanged", this.onPlotYieldChanged, this);
    engine.on("ConstructibleAddedToMap", this.onConstructibleChange, this);
    engine.on("ConstructibleRemovedFromMap", this.onConstructibleChange, this);
    engine.on("DistrictDamageChanged", this.onConstructibleChange, this);
    engine.on("GameCoreEventPlaybackComplete", this.applyYieldChanges, this);
    window.addEventListener("layer-hotkey", this.onLayerHotkeyListener);
  }
  applyLayer() {
    this.yieldSpriteGrid.setVisible(true);
  }
  removeLayer() {
    this.yieldSpriteGrid.setVisible(false);
  }
  getOptionName() {
    return "ShowMapYield";
  }
  calculateConstructibleState(plotIndex) {
    const location = GameplayMap.getLocationFromIndex(plotIndex);
    const constructibles = MapConstructibles.getHiddenFilteredConstructibles(location.x, location.y).map((id) => Constructibles.getByComponentID(id)).filter((c) => c && c.complete && c.owner != PlayerIds.WORLD_PLAYER);
    return constructibles.length > 0 ? 1 /* PRODUCING */ : 0 /* NOT_PRODUCING */;
  }
  onPlotVisibilityChanged(data) {
    const plotIndex = data.location.x + GameplayMap.getGridWidth() * data.location.y;
    this.revealedStates[plotIndex] = data.visibility;
    if (this.plotsNeedingUpdate.indexOf(plotIndex) != null) {
      this.plotsNeedingUpdate.push(plotIndex);
    }
  }
  onPlotYieldChanged(data) {
    const plotIndex = data.location.x + GameplayMap.getGridWidth() * data.location.y;
    if (this.plotsNeedingUpdate.indexOf(plotIndex) != null) {
      this.plotsNeedingUpdate.push(plotIndex);
    }
  }
  onConstructibleChange(data) {
    const plotIndex = data.location.x + GameplayMap.getGridWidth() * data.location.y;
    this.constructibleStates[plotIndex] = this.calculateConstructibleState(plotIndex);
    if (this.plotsNeedingUpdate.indexOf(plotIndex) != null) {
      this.plotsNeedingUpdate.push(plotIndex);
    }
  }
  applyYieldChanges() {
    for (const plotIndex of this.plotsNeedingUpdate) {
      this.updatePlotState(
        plotIndex,
        this.revealedStates[plotIndex],
        this.calculateConstructibleState(plotIndex)
      );
    }
    this.plotsNeedingUpdate.length = 0;
  }
  updatePlotState(plotIndex, revealedState, constructibleState) {
    const state = this.plotStates[plotIndex];
    const oldRevealedState = state.revealedState;
    const oldConstructibleState = state.constructibleState;
    if (!revealedState) {
      revealedState = oldRevealedState;
    }
    if (!constructibleState) {
      constructibleState = oldConstructibleState;
    }
    if (revealedState == RevealedStates.HIDDEN) {
      if (revealedState != oldRevealedState) {
        this.yieldSpriteGrid.clearPlot(plotIndex);
        state.revealedState = revealedState;
        state.yields.clear();
      }
    } else {
      let needsRefresh = false;
      const yields = GameplayMap.getYields(plotIndex, GameContext.localPlayerID);
      if (oldRevealedState != revealedState) {
        needsRefresh = true;
      } else if (oldConstructibleState != constructibleState) {
        needsRefresh = true;
      } else {
        if (state.yields.size != yields.length) {
          needsRefresh = true;
        } else {
          for (const [yieldType, yieldAmount] of yields) {
            if (state.yields.get(yieldType) != yieldAmount) {
              needsRefresh = true;
              break;
            }
          }
        }
      }
      if (needsRefresh) {
        state.yields.clear();
        state.revealedState = revealedState;
        state.constructibleState = constructibleState;
        const position = { x: 0, y: 0, z: 5 };
        const groupWidth = (yields.length - 1) * this.yieldSpritePadding;
        const groupOffset = groupWidth / 2 - groupWidth;
        const scale = constructibleState == 1 /* PRODUCING */ ? 1 : 0.7;
        this.yieldSpriteGrid.clearPlot(plotIndex);
        let count = 0;
        for (const [yieldType, yieldAmount] of yields) {
          state.yields.set(yieldType, yieldAmount);
          const yieldDef = GameInfo.Yields.lookup(yieldType);
          if (yieldDef) {
            position.x = count * this.yieldSpritePadding + groupOffset;
            const icons = this.yieldIcons.get(yieldType);
            if (icons) {
              if (yieldAmount >= 4.5) {
                this.yieldSpriteGrid.addSprite(plotIndex, icons[4], position, { scale });
                this.yieldSpriteGrid.addText(
                  plotIndex,
                  yieldAmount.toString(),
                  position,
                  this.fontData
                );
              } else if (yieldAmount >= 1) {
                const rounded = Math.round(yieldAmount);
                this.yieldSpriteGrid.addSprite(plotIndex, icons[rounded - 1], position, {
                  scale
                });
              } else if (yieldAmount >= 0) {
                this.yieldSpriteGrid.addSprite(plotIndex, icons[0], position, { scale });
              }
              ++count;
            }
          }
        }
      }
    }
  }
  onLayerHotkey(hotkey) {
    if (hotkey.detail.name == "toggle-yields-layer") {
      LensManager.toggleLayer("fxs-yields-layer");
    }
  }
}
LensManager.registerLensLayer("fxs-yields-layer", new YieldsLensLayer());
//# sourceMappingURL=yields-layer.js.map
