import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

class EndGameModel {
  onUpdate;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  ageOverListener = () => {
    this.onAgeOver();
  };
  cityAddedToMapListener = () => {
    this.onCityAddedToMap();
  };
  cityRemovedRemovedMapListener = () => {
    this.onCityRemovedFromMap();
  };
  teamVictoryListener = () => {
    this.onTeamVictory();
  };
  tradeRouteChangeListener = () => {
    this.onTradeRouteUpdate();
  };
  greatWorkCreatedListener = () => {
    this.onGreatWorkCreated();
  };
  wonderCompletedListener = () => {
    this.onWonderCompleted();
  };
  _playerScores = [];
  get playerScores() {
    return this._playerScores;
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  constructor() {
    engine.on("GameAgeEnded", this.ageOverListener);
    engine.on("CityAddedToMap", this.cityAddedToMapListener);
    engine.on("CityRemovedFromMap", this.cityRemovedRemovedMapListener);
    engine.on("TeamVictory", this.teamVictoryListener);
    engine.on("TradeRouteAddedToMap", this.tradeRouteChangeListener);
    engine.on("TradeRouteChanged", this.tradeRouteChangeListener);
    engine.on("TradeRouteRemovedFromMap", this.tradeRouteChangeListener);
    engine.on("GreatWorkCreated", this.greatWorkCreatedListener);
    engine.on("WonderCompleted", this.wonderCompletedListener);
    this.updateGate.call("constructor");
  }
  getLeaderPortrait(player) {
    if (player.leaderType == -1) {
      if (player.isMinor) {
        return "blp:leader_portrait_unknown.png";
      }
      console.error("model-endgame cannot get leaderPortrait, it's leaderType=-1 but its not isMinor.");
      return "blp:leader_portrait_unknown.png";
    }
    return Icon.getLeaderPortraitIcon(player.leaderType);
  }
  update() {
    const playerList = Players.getEverAlive();
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = playerList[localPlayerID];
    if (!localPlayer) {
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (localPlayerDiplomacy === void 0) {
      console.error("model-endgame: Unable to get local player diplomacy!");
      return;
    }
    const victoryManager = Game.VictoryManager;
    const enabledVictories = victoryManager.getConfiguration().enabledVictories;
    const claimedVictories = victoryManager.getVictories();
    let playerScoreList = [];
    const playerDeadList = [];
    playerList.forEach((player) => {
      if (player.isBarbarian) {
        return;
      }
      const hasMet = localPlayerDiplomacy.hasMet(player.id) || localPlayerID == player.id;
      const leaderName = hasMet ? player.name : "LOC_LEADER_UNMET_NAME";
      const leaderPortrait = hasMet ? this.getLeaderPortrait(player) : "blp:leader_portrait_unknown.png";
      const victories = [];
      enabledVictories.forEach((victoryType) => {
        let claimed = false;
        let place = 0;
        const score = 0;
        claimed = claimedVictories.find((victory2) => victory2.victory == victoryType && victory2.place == 1) ? true : false;
        const victory = claimedVictories.find(
          (victory2) => victory2.team == player.team && victory2.victory == victoryType && victory2.place != 0
        );
        if (victory) {
          place = victory.place;
        }
        victories.push({
          victoryType,
          claimed,
          place,
          score
        });
      });
      const playerScore = {
        id: player.id,
        leaderName,
        leaderPortrait,
        currentAgeScore: 0,
        previousAgesScore: 0,
        totalScore: 0,
        isAlive: Players.isAlive(player.id),
        victories
      };
      if (player.isMajor) {
        if (playerScore.isAlive) {
          playerScoreList.push(playerScore);
        } else {
          playerDeadList.push(playerScore);
        }
      }
    });
    playerScoreList.sort((a, b) => {
      return a.currentAgeScore >= b.currentAgeScore ? -1 : 1;
    });
    playerDeadList.sort((a, b) => {
      return a.currentAgeScore >= b.currentAgeScore ? -1 : 1;
    });
    playerScoreList = playerScoreList.concat(playerDeadList);
    this._playerScores = playerScoreList;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
    window.dispatchEvent(new CustomEvent("model-endgame-rebuild-age-rankings"));
  }
  onAgeOver() {
    this.updateGate.call("onAgeOver");
  }
  onCityAddedToMap() {
    this.updateGate.call("onCityAddedToMap");
  }
  onCityRemovedFromMap() {
    this.updateGate.call("onCityRemoveToMap");
  }
  onTeamVictory() {
    this.updateGate.call("onTeamVictory");
  }
  onTradeRouteUpdate() {
    this.updateGate.call("onTradeRouteUpdate");
  }
  onGreatWorkCreated() {
    this.updateGate.call("onGreatWorkCreated");
  }
  onWonderCompleted() {
    this.updateGate.call("onWonderCompleted");
  }
  getVictoryIconByVictoryClass(victoryType) {
    const definition = GameInfo.Victories.lookup(victoryType);
    if (!definition) {
      console.error("model-endgame: getVictoryIconByVictoryClass(): Failed to find victory definition!");
      return "blp:victory_scientific_icon.png";
    }
    //! TODO Replace hard-coded list of victory classes with definition enumeration.
    //! TODO Replace hard-coded icon strings with use of Icon Manager.
    switch (definition.VictoryClassType) {
      case "VICTORY_CLASS_CULTURE":
        return "blp:victory_cultural_icon.png";
      case "VICTORY_CLASS_ECONOMIC":
        return "blp:victory_economic_icon.png";
      case "VICTORY_CLASS_MILITARY":
        return "blp:victory_militaristic_icon.png";
      case "VICTORY_CLASS_SCIENCE":
        return "blp:victory_scientific_icon.png";
    }
    return "blp:victory_scientific_icon.png";
  }
}
const EndGame = new EndGameModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(EndGame);
  };
  engine.createJSModel("g_EndGameModel", EndGame);
  EndGame.updateCallback = updateModel;
});

export { EndGame as default };
//# sourceMappingURL=model-endgame.js.map
