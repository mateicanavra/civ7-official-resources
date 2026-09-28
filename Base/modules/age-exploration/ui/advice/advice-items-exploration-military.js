import { adviceAddItem, adviceAddBundle } from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 12;
adviceAddItem({
  id: "ADVICE_EXPLORATION_MILITARY_MILITARY_VICTORY",
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return Game.turn == 1;
  }
});
adviceAddItem({
  id: "ADVICE_EXPLORATION_MILITARY_PEACE_DEALS",
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    let bCanMakePeace = false;
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const PlayerList = Players.getAlive();
      for (const otherPlayer of PlayerList) {
        if (otherPlayer.isMajor && otherPlayer.id != player.id) {
          if (player.Diplomacy?.isAtWarWith(otherPlayer.id)) {
            const peaceQueryResults = player.Diplomacy.canMakePeaceWith(
              otherPlayer.id,
              false
            );
            if (peaceQueryResults.Success) {
              bCanMakePeace = true;
              break;
            }
          }
        }
      }
    }
    return bCanMakePeace;
  }
});
adviceAddBundle({
  id: "ADVICE_EXPLORATION_MILITARY_MISC",
  type: AdvisorTypes.MILITARY,
  pages: [
    "ADVICE_EXPLORATION_MILITARY_VICTORY_COUNTERPLAY",
    "ADVICE_EXPLORATION_MILITARY_NAVAL_UNITS",
    "ADVICE_EXPLORATION_MILITARY_SIEGE_UNITS",
    "ADVICE_EXPLORATION_MILITARY_PILLAGING",
    "ADVICE_EXPLORATION_MILITARY_FORTIFYING",
    "ADVICE_EXPLORATION_MILITARY_REINFORCING",
    "ADVICE_EXPLORATION_MILITARY_DISTANT_LANDS",
    "ADVICE_EXPLORATION_MILITARY_TRIUMPH"
  ],
  priority: 100,
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-exploration-military.js.map
