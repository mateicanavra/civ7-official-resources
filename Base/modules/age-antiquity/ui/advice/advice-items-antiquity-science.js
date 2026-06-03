import AdviceManager from '../../../base-standard/ui/advice/advice-manager.js';
import { anyTechUnlocked, shouldSelect } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 4;
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_SCIENCE_SCIENTIFIC_VICTORY",
  type: AdvisorTypes.SCIENCE,
  onSelect: () => {
    return Game.turn == 1;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_SCIENCE_SPECIALISTS",
  // Player can have a specialist in their capital
  type: AdvisorTypes.SCIENCE,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player && player.Cities) {
      const capital = player.Cities.getCapital();
      if (capital && capital.Workers?.getCityWorkerCap) {
        return capital.Workers.getCityWorkerCap() > 0;
      }
    }
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_SCIENCE_TECH_MASTERIES",
  // Player has unlocked the Writing technology
  type: AdvisorTypes.SCIENCE,
  onSelect: () => {
    return anyTechUnlocked(["NODE_TECH_AQ_WRITING"]);
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_SCIENCE_TRIUMPH",
  // Player has researched Currency or Engineering
  type: AdvisorTypes.SCIENCE,
  onSelect: () => {
    return anyTechUnlocked(["NODE_TECH_AQ_CURRENCY", "NODE_TECH_AQ_ENGINEERING"]);
  }
});
AdviceManager.addBundle({
  id: "scienceMisc01",
  type: AdvisorTypes.SCIENCE,
  pages: [
    "ADVICE_AGELESS_SCIENCE_GENERATING_SCIENCE",
    "ADVICE_ANTIQUITY_SCIENCE_ADJACENCY_BONUSES",
    "ADVICE_ANTIQUITY_SCIENCE_CODICES",
    "ADVICE_ANTIQUITY_SCIENCE_PROJECTS",
    "ADVICE_ANTIQUITY_SCIENCE_VICTORY_SCORING"
  ],
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-antiquity-science.js.map
