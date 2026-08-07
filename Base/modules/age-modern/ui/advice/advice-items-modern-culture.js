import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 0;
adviceAddItem({
  id: "ADVICE_MODERN_CULTURE_CULTURAL_VICTORY",
  type: AdvisorTypes.CULTURE,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddBundle({
  id: "ADVICE_MODERN_CULTURE_MISC",
  type: AdvisorTypes.CULTURE,
  pages: [
    "ADVICE_MODERN_CULTURE_VICTORY_COUNTERPLAY",
    "ADVICE_MODERN_CULTURE_EXPLORERS_ARTIFACTS",
    "ADVICE_MODERN_CULTURE_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-modern-culture.js.map
