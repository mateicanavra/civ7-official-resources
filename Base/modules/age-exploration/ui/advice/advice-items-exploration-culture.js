import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { playerHasReligion, shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 0;
adviceAddItem({
  id: "ADVICE_EXPLORATION_CULTURE_CULTURAL_VICTORY",
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddItem({
  id: "ADVICE_EXPLORATION_CULTURE_FOUNDING_RELIGION",
  // Player has not yet created a religion
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return playerHasReligion() == false;
  },
  onObsolete: () => {
    return playerHasReligion() == true;
  }
});
adviceAddItem({
  id: "ADVICE_EXPLORATION_CULTURE_MISSIONARIES",
  // Player has already created a religion
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return playerHasReligion();
  }
});
adviceAddItem({
  id: "ADVICE_EXPLORATION_CULTURE_TRIUMPH",
  // Player has between 4 and 12 Relics slotted
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (!player || !player.Stats) {
      return false;
    }
    return player.Stats.getTotalGreatWorksSlotted() >= 4;
  },
  onObsolete: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (!player || !player.Stats) {
      return false;
    }
    return player.Stats.getTotalGreatWorksSlotted() > 11;
  }
});
adviceAddBundle({
  id: "ADVICE_EXPLORATION_CULTURE_MISC",
  type: AdvisorTypes.CULTURE,
  pages: [
    "ADVICE_EXPLORATION_CULTURE_VICTORY_COUNTERPLAY",
    "ADVICE_EXPLORATION_CULTURE_RELICS",
    "ADVICE_EXPLORATION_CULTURE_ADVANCED_PRODUCTION"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-exploration-culture.js.map
