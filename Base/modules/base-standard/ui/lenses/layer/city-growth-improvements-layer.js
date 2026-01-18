import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { PlacePopulation } from '../../place-population/model-place-population.js';
import '../../../../core/ui/input/plot-cursor.js';
import '../../../../core/ui/context-manager/context-manager.js';
import '../../../../core/ui/context-manager/display-queue-manager.js';
import '../../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../../core/ui/framework.chunk.js';
import '../../../../core/ui/input/cursor.js';
import '../../../../core/ui/input/focus-manager.js';
import '../../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../../core/ui/views/view-manager.chunk.js';
import '../../../../core/ui/panel-support.chunk.js';
import '../../../../core/ui/input/action-handler.js';
import '../../../../core/ui/input/input-support.chunk.js';
import '../../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../../core/ui/interface-modes/interface-modes.js';
import '../../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../building-placement/building-placement-manager.js';
import '../../placement-city-banner/placement-city-banner.js';
import '../../plot-workers/plot-workers-manager.js';
import '../../utilities/utilities-city-yields.chunk.js';
import '../../yield-bar-base/yield-bar-base.js';

class CityGrowthImprovementsLensLayer {
  spriteOffset = { x: 0, y: 15, z: 5 };
  spriteScale = 1;
  improvementSpriteGrid = WorldUI.createSpriteGrid(
    "CityGrowthImprovements_SpriteGroup",
    true
  );
  expandPlotDataUpdatedEventListener = this.updateImprovementIcons.bind(this);
  initLayer() {
    this.improvementSpriteGrid.setVisible(false);
  }
  applyLayer() {
    this.updateImprovementIcons(PlacePopulation.getExpandPlots());
    PlacePopulation.ExpandPlotDataUpdatedEvent.on(this.expandPlotDataUpdatedEventListener);
    this.improvementSpriteGrid.setVisible(true);
  }
  removeLayer() {
    PlacePopulation.ExpandPlotDataUpdatedEvent.off(this.expandPlotDataUpdatedEventListener);
    this.improvementSpriteGrid.clear();
    this.improvementSpriteGrid.setVisible(false);
  }
  updateImprovementIcons(data) {
    this.improvementSpriteGrid.clear();
    for (const entry of data) {
      if (entry.constructibleType) {
        const constructibleDefinition = GameInfo.Constructibles.lookup(entry.constructibleType);
        if (constructibleDefinition) {
          const icon = UI.getIconBLP(constructibleDefinition.ConstructibleType, "BUILDING");
          this.improvementSpriteGrid.addSprite(entry.plotIndex, icon, this.spriteOffset, {
            scale: this.spriteScale
          });
        }
      }
    }
  }
}
LensManager.registerLensLayer("fxs-city-growth-improvements-layer", new CityGrowthImprovementsLensLayer());
//# sourceMappingURL=city-growth-improvements-layer.js.map
