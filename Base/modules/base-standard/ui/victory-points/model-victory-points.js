import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as VictoryManager } from '../victory-manager/victory-manager.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

class VictoryPointsModel {
  scoreData = [];
  highestScore = 1;
  onUpdate;
  constructor() {
    VictoryManager.victoryManagerUpdateEvent.on(this.onVictoryManagerUpdate.bind(this));
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    this.scoreData = VictoryManager.processedScoreData;
    this.scoreData.sort((a, b) => {
      return b.totalAgeScore - a.totalAgeScore;
    });
    this.highestScore = VictoryManager.getHighestAmountOfLegacyEarned();
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  onVictoryManagerUpdate() {
    this.updateGate.call("onVictoryManagerUpdate");
  }
  legacyTypeToBgColor(legacyType) {
    switch (legacyType) {
      case CardCategories.CARD_CATEGORY_SCIENTIFIC:
        return "bg-victory-science";
      case CardCategories.CARD_CATEGORY_CULTURAL:
        return "bg-victory-culture";
      case CardCategories.CARD_CATEGORY_MILITARISTIC:
        return "bg-victory-military";
      case CardCategories.CARD_CATEGORY_ECONOMIC:
        return "bg-victory-economic";
      default:
        return "";
    }
  }
  legacyTypeToVictoryType(legacyType) {
    switch (legacyType) {
      case CardCategories.CARD_CATEGORY_SCIENTIFIC:
        return "VICTORY_CLASS_SCIENCE";
      case CardCategories.CARD_CATEGORY_CULTURAL:
        return "VICTORY_CLASS_CULTURE";
      case CardCategories.CARD_CATEGORY_MILITARISTIC:
        return "VICTORY_CLASS_MILITARY";
      case CardCategories.CARD_CATEGORY_ECONOMIC:
        return "VICTORY_CLASS_ECONOMIC";
      default:
        return "";
    }
  }
  scoreDataByTeam() {
    const grouped = this.scoreData.reduce((acc, player) => {
      acc[player.team] = acc[player.team] || [];
      acc[player.team].push(player);
      return acc;
    }, {});
    return Object.entries(grouped).map(([team, members]) => ({
      teamId: team,
      totalScore: members.reduce((sum, p) => sum + p.totalAgeScore, 0),
      members
    })).sort((a, b) => b.totalScore - a.totalScore);
  }
}
const VictoryPoints = new VictoryPointsModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(VictoryPoints);
  };
  engine.createJSModel("g_VictoryPoints", VictoryPoints);
  VictoryPoints.updateCallback = updateModel;
});

export { VictoryPoints as default };
//# sourceMappingURL=model-victory-points.js.map
