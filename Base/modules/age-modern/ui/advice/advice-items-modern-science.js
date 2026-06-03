import AdviceManager from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 4;
AdviceManager.addItem({
  id: "ADVICE_MODERN_SCIENCE_SCIENTIFIC_VICTORY",
  type: AdvisorTypes.SCIENCE,
  onSelect: () => {
    return Game.turn == 1;
  }
});
AdviceManager.addBundle({
  id: "ADVICE_MODERN_SCIENCE_MISC",
  type: AdvisorTypes.SCIENCE,
  pages: [
    "ADVICE_MODERN_SCIENCE_VICTORY_COUNTERPLAY",
    "ADVICE_MODERN_SCIENCE_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-modern-science.js.map
