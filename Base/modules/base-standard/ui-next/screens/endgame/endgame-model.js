import { createContext, useContext } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createStore } from '../../../../core/vendor/solid-js/store/dist/store.js';

var VictoryScreenTabs = /* @__PURE__ */ ((VictoryScreenTabs2) => {
  VictoryScreenTabs2["Military"] = "military";
  VictoryScreenTabs2["Science"] = "scientific";
  VictoryScreenTabs2["Culture"] = "cultural";
  VictoryScreenTabs2["Economic"] = "economic";
  VictoryScreenTabs2["Default"] = "";
  return VictoryScreenTabs2;
})(VictoryScreenTabs || {});
const GENERIC_WIN_VICTORY_BG = "url('blp:endScreen_banner_victory.png')";
function createEndGameContextModel() {
  function getVictoryData() {
    const playerList = Players.getEverAlive();
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = playerList[localPlayerID];
    const args = {};
    const allowedOneMoreTurn = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.EXTEND_GAME, args, false).Success && !Configuration.getGame().isAnyMultiplayer;
    const endgameData2 = {
      playerId: -1,
      leader: "",
      leaderName: "",
      leaderQuote: "",
      leaderQuoteAudioKey: "",
      victoryClassType: "",
      victoryName: "",
      victoryDescription: "",
      victoryIconUrl: "",
      victoryBgUrl: GENERIC_WIN_VICTORY_BG,
      movieType: "",
      isDefeated: false,
      victoryTab: "",
      isAlive: true,
      victorySound: "",
      allowOneMoreTurn: allowedOneMoreTurn,
      showNextTurnButton: false
      // will be set to the correct value below
    };
    if (localPlayer) {
      const leaderDef = GameInfo.Leaders.lookup(localPlayer.leaderType);
      const leader = leaderDef?.LeaderType.replace("_ALT", "") || "";
      endgameData2.playerId = localPlayerID;
      endgameData2.leader = leader;
      endgameData2.leaderName = Locale.compose(localPlayer.leaderName);
      endgameData2.leaderQuote = `LOC_VICTORY_${leader}`;
      endgameData2.leaderQuoteAudioKey = `VICTORY_${leader}`;
    }
    const victoryManager = Game.VictoryManager;
    const claimedVictories = victoryManager.getVictories();
    const victory = claimedVictories.find((v) => v.team == localPlayer.team && v.place >= 1);
    if (victory) {
      const definition = GameInfo.Victories.lookup(victory.victory);
      if (definition) {
        const victoryType = definition.VictoryClassType;
        const victoryDesctiption = definition.Description;
        endgameData2.victoryName = getVictoryLoc(victoryType);
        endgameData2.victoryClassType = victoryType;
        endgameData2.victoryDescription = victoryDesctiption || "";
        endgameData2.victoryBgUrl = UI.getIconCSS(victoryType, "BACKGROUND");
        endgameData2.victoryIconUrl = UI.getIconCSS(victoryType, "BADGE");
        endgameData2.movieType = `MOVIE_VICTORY_${endgameData2.leader}`;
        endgameData2.victoryTab = getVictoryScreenTab(victoryType);
        endgameData2.victorySound = definition.VictorySound || "";
      }
    } else {
      const defeatType = victoryManager.getLatestPlayerDefeat(localPlayerID);
      const defeatDefinition = GameInfo.Defeats.lookup(defeatType);
      if (defeatDefinition?.DefeatType !== DefeatTypes.NO_DEFEAT) {
        endgameData2.victoryName = getVictoryLoc("VICTORY_CLASS_DEFEAT");
        endgameData2.victoryBgUrl = UI.getIconCSS("VICTORY_CLASS_DEFEAT", "BACKGROUND");
        endgameData2.movieType = chooseDefeatMovie(defeatDefinition?.DefeatType || "", localPlayer);
        endgameData2.isDefeated = true;
        endgameData2.isAlive = localPlayer.isAlive;
        endgameData2.victorySound = "Victory_Defeat";
        endgameData2.allowOneMoreTurn = allowOneMoreTurn(defeatDefinition);
        endgameData2.showNextTurnButton = Configuration.getGame().isHotseat && Players.getNumAliveHumans() > 0;
      }
    }
    return endgameData2;
  }
  function getVictoryLoc(victoryType) {
    switch (victoryType) {
      case "VICTORY_CLASS_CULTURE":
        return Locale.compose("LOC_VICTORY_CULTURE_NAME");
      case "VICTORY_CLASS_ECONOMIC":
        return Locale.compose("LOC_VICTORY_ECONMIC_NAME");
      case "VICTORY_CLASS_MILITARY":
        return Locale.compose("LOC_VICTORY_MILITARY_NAME");
      case "VICTORY_CLASS_SCIENCE":
        return Locale.compose("LOC_VICTORY_SCIENCE_NAME");
      case "VICTORY_CLASS_DOMINATION":
        return Locale.compose("LOC_VICTORY_DOMINATION_NAME");
      case "VICTORY_CLASS_DEFEAT":
        return Locale.compose("LOC_VICTORY_DEFEAT_NAME");
      default:
        return Locale.compose("LOC_VICTORY_SCORE_VICTORY_NAME");
    }
  }
  function getVictoryScreenTab(victoryType) {
    switch (victoryType) {
      case "VICTORY_CLASS_CULTURE":
        return "cultural" /* Culture */;
      case "VICTORY_CLASS_ECONOMIC":
        return "economic" /* Economic */;
      case "VICTORY_CLASS_MILITARY":
      case "VICTORY_CLASS_DOMINATION":
        return "military" /* Military */;
      case "VICTORY_CLASS_SCIENCE":
        return "scientific" /* Science */;
      default:
        return "" /* Default */;
    }
  }
  function allowOneMoreTurn(defeatDefinition) {
    const args = {};
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.EXTEND_GAME,
      args,
      false
    );
    if (Configuration.getGame().isAnyMultiplayer) return false;
    else if (result) return result.Success;
    else if (!defeatDefinition) return true;
    else if (defeatDefinition) return defeatDefinition.AllowOneMoreTurn;
    else return true;
  }
  function chooseDefeatMovie(defeatType, player) {
    const defeatTypeToUse = defeatType ? defeatType : "DEFEAT_DEFAULT";
    const civilizationDefinition = GameInfo.Civilizations.lookup(player.civilizationType);
    if (!civilizationDefinition) {
      console.error(`screen-endgame: Could not find definition for player leader - ${player.civilizationType}.`);
      return "";
    }
    const endGameMovies = GameInfo.EndGameMovies.filter((egm) => {
      if (!egm.CivilizationType && egm.DefeatType && egm.DefeatType == defeatTypeToUse) {
        return true;
      } else if (egm.CivilizationType && egm.CivilizationType == civilizationDefinition.CivilizationType && egm.DefeatType && egm.DefeatType == defeatTypeToUse) {
        return true;
      } else {
        return false;
      }
    });
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (civilizationDefinition.ApexAge != currentAge?.AgeType) {
      endGameMovies.sort((a, b) => {
        return a.Priority - b.Priority;
      });
    } else {
      endGameMovies.sort((a, b) => {
        return b.Priority - a.Priority;
      });
    }
    const movieToShow = endGameMovies[0];
    if (movieToShow) {
      return movieToShow.MovieType;
    } else return "";
  }
  const [endgameData, setEndgameData] = createStore(getVictoryData());
  function refreshEndgameData() {
    setEndgameData(getVictoryData());
  }
  return {
    endgameData,
    refreshEndgameData
  };
}
const EndGameScreenContext = createContext();
function useEndGameContext() {
  const context = useContext(EndGameScreenContext);
  if (!context) {
    throw new Error("Unable to get endgame screen context!");
  }
  return context;
}

export { EndGameScreenContext, createEndGameContextModel, useEndGameContext };
//# sourceMappingURL=endgame-model.js.map
