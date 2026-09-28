import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { hasCivic, goldInRange, shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 8;
adviceAddItem({
  id: "ADVICE_ANTIQUITY_ECONOMIC_ECONOMIC_VICTORY",
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddItem({
  id: "ADVICE_ANTIQUITY_ECONOMIC_TRADE_ROUTES",
  // player has Code of Laws unlocked
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    return hasCivic("NODE_CIVIC_AQ_MAIN_CODE_OF_LAWS");
  }
});
adviceAddItem({
  id: "ADVICE_AGELESS_ECONOMIC_SPENDING_GOLD",
  // Player has more than 500 gold
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    return goldInRange(500, -1);
  }
});
adviceAddItem({
  id: "ADVICE_ANTIQUITY_ECONOMIC_TRIUMPH",
  // Player has between 8 and 24 slotted resources
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerStats = player?.Stats;
      if (playerStats) {
        const slottedResources = playerStats.getTotalAssignedResources();
        return slottedResources >= 8 && slottedResources < 24;
      }
    }
    return false;
  }
});
adviceAddBundle({
  id: "economicMisc01",
  type: AdvisorTypes.ECONOMIC,
  pages: [
    "ADVICE_AGELESS_ECONOMIC_GENERATING_GOLD",
    "ADVICE_AGELESS_ECONOMIC_SPENDING_GOLD",
    "ADVICE_AGELESS_ECONOMIC_HAPPINESS",
    "ADVICE_AGELESS_ECONOMIC_INFLUENCE",
    "ADVICE_ANTIQUITY_ECONOMIC_GROWING_POPULATION",
    "ADVICE_ANTIQUITY_ECONOMIC_WAREHOUSE_BUILDINGS",
    "ADVICE_ANTIQUITY_ECONOMIC_RESOURCES",
    "ADVICE_ANTIQUITY_ECONOMIC_CONNECTED_TOWNS",
    "ADVICE_ANTIQUITY_ECONOMIC_RESOURCE_SLOTS",
    "ADVICE_ANTIQUITY_ECONOMIC_VICTORY_SCORING"
  ],
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-antiquity-economic.js.map
