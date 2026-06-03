import AdviceManager from '../../../base-standard/ui/advice/advice-manager.js';
import { shouldSelect, isAtWar, amountConqueredSettlements } from '../../../base-standard/ui/advice/advice-support.js';

const TURN_WAIT = 20;
const TURN_START = 10;
const TURN_OFFSET = 12;
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_MILITARY_VICTORY",
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return Game.turn == 1;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_INDEPENDENT_POWERS",
  // obsolete if player has dispersed at least 1 Independent
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  },
  onObsolete: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const stats = player.Stats;
      if (stats) {
        return stats.getNumIndependentsDispersed() > 0;
      }
    }
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_SETTLING",
  // can train a settler unit and capital has more than 5 population
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      let bCanTrain = false;
      let bHasPop = false;
      const playerCities = player.Cities;
      if (playerCities) {
        const capital = playerCities.getCapital();
        if (capital) {
          if (capital.population >= 5) {
            bHasPop = true;
          }
          GameInfo.Units.forEach((u) => {
            if (u.FoundCity == true) {
              let result = null;
              result = Game.CityOperations.canStart(
                capital.id,
                CityOperationTypes.BUILD,
                { UnitType: u.$index },
                false
              );
              if (result.Success) {
                bCanTrain = true;
              }
            }
          });
        }
      }
      if (bCanTrain && bHasPop) {
        return true;
      }
    }
    return false;
  },
  onObsolete: () => {
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_ALLIANCES",
  // have a Helpful relationship with a major civ
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerDiplomacy = player.Diplomacy;
      if (playerDiplomacy) {
        Players.getAliveMajorIds().forEach((playerId) => {
          const relationshipType = playerDiplomacy.getRelationshipEnum(playerId);
          if (relationshipType == DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HELPFUL) {
            return true;
          }
        });
      }
    }
    return false;
  },
  onObsolete: () => {
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_DECLARING_WAR",
  // At Peace and have a Hostile relationship with a major civ
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerDiplomacy = player.Diplomacy;
      if (playerDiplomacy) {
        if (playerDiplomacy.isAtWarWithAnyMajorCiv() == false) {
          const isHostile = Players.getAliveMajorIds().some((playerId) => {
            const relationshipType = playerDiplomacy.getRelationshipEnum(playerId);
            return relationshipType == DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE;
          });
          return isHostile;
        }
      }
    }
    return false;
  },
  onObsolete: () => {
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_CAPTURING_SETTLEMENTS",
  // At war with any major civ
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return isAtWar();
  },
  onObsolete: () => {
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_TERRAIN_TACTICS",
  // At war with any major civ
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return isAtWar();
  },
  onObsolete: () => {
    return false;
  }
});
AdviceManager.addItem({
  id: "ADVICE_ANTIQUITY_MILITARY_VICTORY_SCORE",
  // Between 1 and 5 captured settlements
  type: AdvisorTypes.MILITARY,
  onSelect: () => {
    return amountConqueredSettlements() > 0;
  },
  onObsolete: () => {
    return amountConqueredSettlements() > 5;
  }
});
AdviceManager.addBundle({
  id: "miliatryMisc01",
  type: AdvisorTypes.MILITARY,
  pages: [
    "ADVICE_ANTIQUITY_MILITARY_TRAINING_UNITS",
    "ADVICE_ANTIQUITY_MILITARY_ARMY_COMMANDERS",
    "ADVICE_ANTIQUITY_MILITARY_COMBAT_STRENGTH",
    "ADVICE_ANTIQUITY_MILITARY_VICTORY_SCORE",
    "ADVICE_ANTIQUITY_MILITARY_TRIUMPH",
    "ADVICE_ANTIQUITY_MILITARY_SCOUTING",
    "ADVICE_AGELESS_MILITARY_SETTLEMENT_LIMIT",
    "ADVICE_AGELESS_MILITARY_WAR_SUPPORT",
    "ADVICE_AGELESS_MILITARY_ALLIANCES",
    "ADVICE_AGELESS_MILITARY_RELATIONSHIPS"
  ],
  delivery: "random",
  onSelect: () => {
    return shouldSelect(TURN_START, TURN_WAIT, TURN_OFFSET);
  }
});
//# sourceMappingURL=advice-items-antiquity-military.js.map
