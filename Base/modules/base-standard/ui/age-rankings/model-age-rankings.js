import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as VictoryManager } from '../victory-manager/victory-manager.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

class AgeRankingsModel {
  victoryData = /* @__PURE__ */ new Map();
  onUpdate;
  constructor() {
    VictoryManager.victoryManagerUpdateEvent.on(this.onVictoryManagerUpdate.bind(this));
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    this.victoryData = VictoryManager.processedVictoryData;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  onVictoryManagerUpdate() {
    this.updateGate.call("onVictoryManagerUpdate");
  }
  getMilestonesCompleted(legacyPathType) {
    const progressMileStones = GameInfo.AgeProgressionMilestones.filter(
      (milestone) => milestone.LegacyPathType == legacyPathType
    );
    let mileStonesReached = 0;
    for (const milestone of progressMileStones) {
      mileStonesReached = Game.AgeProgressManager.isMilestoneComplete(milestone.AgeProgressionMilestoneType) ? mileStonesReached + Game.AgeProgressManager.getMilestoneProgressionPoints(milestone.AgeProgressionMilestoneType) : mileStonesReached;
    }
    return mileStonesReached;
  }
  getMaxMilestoneProgressionTotal(legacyPathType) {
    const progressMileStones = GameInfo.AgeProgressionMilestones.filter(
      (milestone) => milestone.LegacyPathType == legacyPathType
    );
    let mileStonesReached = 0;
    for (const milestone of progressMileStones) {
      mileStonesReached = mileStonesReached + Game.AgeProgressManager.getMilestoneProgressionPoints(milestone.AgeProgressionMilestoneType);
    }
    return mileStonesReached;
  }
  getMilestoneBarPercentages(legacyPathType) {
    const progressMileStones = GameInfo.AgeProgressionMilestones.filter(
      (milestone) => milestone.LegacyPathType == legacyPathType
    );
    const mileStonePercentage = [];
    for (const milestone of progressMileStones) {
      const finalMilestone = progressMileStones.find((stone) => stone.FinalMilestone);
      const finalMileStoneRequiredPoints = finalMilestone?.RequiredPathPoints ? finalMilestone?.RequiredPathPoints : milestone.RequiredPathPoints;
      const percent = milestone.RequiredPathPoints / finalMileStoneRequiredPoints;
      mileStonePercentage.push(percent);
    }
    return mileStonePercentage;
  }
}
const AgeRankings = new AgeRankingsModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AgeRankings);
  };
  engine.createJSModel("g_AgeRankingsModel", AgeRankings);
  AgeRankings.updateCallback = updateModel;
});

export { AgeRankings as default };
//# sourceMappingURL=model-age-rankings.js.map
