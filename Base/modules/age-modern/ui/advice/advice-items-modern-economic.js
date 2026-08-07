import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 8;
adviceAddItem({
  id: "ADVICE_MODERN_ECONOMIC_ECONOMIC_VICTORY",
  type: AdvisorTypes.ECONOMIC,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddBundle({
  id: "ADVICE_MODERN_ECONOMIC_MISC",
  type: AdvisorTypes.ECONOMIC,
  pages: [
    "ADVICE_MODERN_ECONOMIC_VICTORY_COUNTERPLAY",
    "ADVICE_MODERN_ECONOMIC_RAIL_STATIONS_PORTS",
    "ADVICE_MODERN_ECONOMIC_FACTORIES",
    "ADVICE_MODERN_ECONOMIC_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-modern-economic.js.map
