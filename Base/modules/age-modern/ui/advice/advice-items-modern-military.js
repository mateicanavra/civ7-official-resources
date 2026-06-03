import AdviceManager from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 12;
AdviceManager.addItem({
  id: "ADVICE_MODERN_MILITARY_MILITARY_VICTORY",
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return Game.turn == 1;
  }
});
AdviceManager.addBundle({
  id: "ADVICE_MODERN_MILITARY_MISC",
  type: AdvisorTypes.MILITARY,
  pages: [
    "ADVICE_MODERN_MILITARY_VICTORY_COUNTERPLAY",
    "ADVICE_MODERN_MILITARY_IDEOLOGIES",
    "ADVICE_MODERN_MILITARY_AIR_COMBAT",
    "ADVICE_MODERN_MILITARY_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-modern-military.js.map
