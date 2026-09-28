import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { hasWonders, shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 0;
adviceAddItem({
  id: "ADVICE_ANTIQUITY_CULTURE_CULTURAL_VICTORY",
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddItem({
  id: "ADVICE_ANTIQUITY_CULTURE_WONDERS",
  // obsolete if player has less than 3 Wonders
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  },
  onObsolete: () => {
    return hasWonders(3);
  }
});
adviceAddItem({
  id: "ADVICE_ANTIQUITY_CULTURE_7_WONDERS",
  // player has more than 3 but less than 6 Wonders
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return hasWonders(3);
  },
  onObsolete: () => {
    return hasWonders(6);
  }
});
adviceAddBundle({
  id: "cultureMisc01",
  type: AdvisorTypes.CULTURE,
  pages: [
    "ADVICE_ANTIQUITY_CULTURE_UNIQUE_CIVICS",
    "ADVICE_ANTIQUITY_CULTURE_INCREASE_PRODUCTION",
    "ADVICE_ANTIQUITY_CULTURE_TOWNS_CITIES",
    "ADVICE_ANTIQUITY_CULTURE_NATURAL_WONDERS",
    "ADVICE_ANTIQUITY_CULTURE_UNIQUE_IMPROVEMENTS",
    "ADVICE_ANTIQUITY_CULTURE_CELEBRATIONS",
    "ADVICE_ANTIQUITY_CULTURE_VICTORY_SCORING",
    "ADVICE_ANTIQUITY_CULTURE_CULTURAL_ENDEAVORS"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  },
  onObsolete: () => {
    const turn = Game.turn;
    return turn > 90;
  }
});
//# sourceMappingURL=advice-items-antiquity-culture.js.map
