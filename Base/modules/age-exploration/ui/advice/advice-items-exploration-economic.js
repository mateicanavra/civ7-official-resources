import AdviceManager from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 8;
AdviceManager.addItem({
  id: "ADVICE_EXPLORATION_ECONOMIC_ECONOMIC_VICTORY",
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    return Game.turn == 1;
  }
});
AdviceManager.addBundle({
  id: "ADVICE_EXPLORATION_ECONOMIC_MISC",
  type: AdvisorTypes.ECONOMIC,
  pages: [
    "ADVICE_EXPLORATION_ECONOMIC_VICTORY_COUNTERPLAY",
    "ADVICE_EXPLORATION_ECONOMIC_TREASURE_RESOURCES",
    "ADVICE_EXPLORATION_ECONOMIC_TREASURE_CONVOYS",
    "ADVICE_EXPLORATION_ECONOMIC_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-exploration-economic.js.map
