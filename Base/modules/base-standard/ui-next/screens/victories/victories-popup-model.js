import { createSignal, createEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ModelRegistry, ModelLifecycle } from '../../../../core/ui-next/services/model-registry.js';
import { createEngineEvent } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { PopupPriority } from '../../../ui/popup-sequencer/popup-priority.js';
import PopupSequencer from '../../../ui/popup-sequencer/popup-sequencer.js';

function createVictoriesPopupDataModel() {
  const dataModel = {};
  const victoryDominanceChanged = createEngineEvent("VictoryDominanceChanged");
  const victoryCountdownChanged = createEngineEvent("VictoryCountdownChanged");
  const victoryPointsChanged = createEngineEvent("VictoryPointsChanged");
  const playerTurnStart = createEngineEvent("PlayerTurnActivated");
  const victoryThresholdChanged = createEngineEvent("VictoryThresholdChanged");
  const [anyPlayerDominant, setAnyPlayerDominant] = createSignal(false);
  const [extraClass, setExtraClass] = createSignal("");
  const handleStartTimer = () => {
    timeoutId = setTimeout(() => {
      handleIntermediateTimer();
    }, 3e3);
  };
  const handleIntermediateTimer = () => {
    if (timeoutId != INVALID_TIMEOUT) {
      clearTimeout(timeoutId);
      timeoutId = INVALID_TIMEOUT;
    }
    dataModel.setExtraClass("");
    timeoutId = setTimeout(() => {
      handleTimedClose();
    }, 100);
  };
  const handleTimedClose = () => {
    if (timeoutId != INVALID_TIMEOUT) {
      clearTimeout(timeoutId);
      timeoutId = INVALID_TIMEOUT;
    }
    dataModel.setExtraClass("victories-popup__exit");
    timeoutId = setTimeout(() => {
      handleClickClose();
    }, 1900);
  };
  const handleClickClose = () => {
    if (timeoutId != INVALID_TIMEOUT) {
      clearTimeout(timeoutId);
      timeoutId = INVALID_TIMEOUT;
    }
    PopupSequencer.closePopup("screen-victories-popup");
    requestActive = false;
    const wasUnlockBanner = dataModel.victoryUnlockBanner;
    dataModel.victoryUnlockBanner = false;
    if (wasUnlockBanner && dataModel.anyPlayerDominant()) {
      delayByFrame(() => {
        dataModel.setExtraClass("victories-popup__enter");
        const popupData = {
          category: PopupSequencer.getCategory(),
          screenId: "screen-victories-popup",
          properties: {
            singleton: true,
            createMouseGuard: false
          },
          priority: PopupPriority.beforeCinematics
          // between wonder cinematics (which will display before this) and tech/civics completion (which will display after)
        };
        requestActive = true;
        PopupSequencer.addDisplayRequest(popupData);
      }, 2);
    }
  };
  dataModel.anyPlayerDominant = anyPlayerDominant;
  dataModel.setAnyPlayerDominant = setAnyPlayerDominant;
  dataModel.extraClass = extraClass;
  dataModel.setExtraClass = setExtraClass;
  dataModel.clickCloseButton = handleClickClose;
  dataModel.startTimer = handleStartTimer;
  dataModel.players = [];
  function updatePlayer(model, player) {
    player.isCurrentlyDominant = false;
    player.victories.forEach((victory) => {
      const victoryType = GameInfo.VictoryTypes.find((a) => a.$hash == victory.victoryId);
      const victoryDefinition = GameInfo.Victories.find((a) => a.$hash == victory.victoryId);
      if (victoryDefinition && victoryType) {
        const libraryPlayer = Players.get(player.playerId);
        if (libraryPlayer) {
          const countdown = libraryPlayer.Victories?.getVictoryCountdownStatus(victoryDefinition.$hash);
          if (countdown && countdown.isDominant) {
            const numTurnsLeft = victoryType.CountdownDuration - countdown.turns;
            victory.setTurnsLeft(numTurnsLeft);
            player.isCurrentlyDominant = true;
            if (player.turnsToVictory() == -1 || numTurnsLeft < player.turnsToVictory()) {
              player.setTurnsToVictory(numTurnsLeft);
            }
          }
        }
      }
    });
    let anyPlayerDominant2 = false;
    model.players.forEach((modelPlayer) => {
      if (modelPlayer.isCurrentlyDominant) {
        anyPlayerDominant2 = true;
      }
    });
    model.setAnyPlayerDominant(anyPlayerDominant2);
  }
  const INVALID_TIMEOUT = -1;
  let timeoutId = INVALID_TIMEOUT;
  let requestActive = false;
  createEffect(() => {
    const dcEvt = victoryDominanceChanged();
    if (dcEvt) {
      const player = dataModel.players.find((p) => p.playerId == dcEvt.player);
      if (player) {
        updatePlayer(dataModel, player);
      }
    }
    const ccEvt = victoryCountdownChanged();
    if (ccEvt) {
      const player = dataModel.players.find((p) => p.playerId == ccEvt.player);
      if (player) {
        updatePlayer(dataModel, player);
      }
    }
    const vpEvt = victoryPointsChanged();
    if (vpEvt) {
      const player = dataModel.players.find((p) => p.playerId == vpEvt.player);
      if (player) {
        updatePlayer(dataModel, player);
      }
    }
  });
  createEffect(() => {
    const vtChangeEvt = victoryThresholdChanged();
    if (vtChangeEvt) {
      if (!requestActive) {
        const ageProgress = vtChangeEvt.minAgeProgress;
        const ageName = GameInfo.Ages.lookup(Configuration.getGame().campaignStartAgeType)?.AgeType;
        dataModel.victoryUnlockBanner = true;
        dataModel.unlockedVictories = [];
        vtChangeEvt.victoryTypes.forEach((victoryType) => {
          const victory = GameInfo.VictoryTypes.find((a) => a.$hash == victoryType);
          if (victory) {
            const dominationPercentages = [];
            GameInfo.VictoryDominationPercents.forEach((victoryDom) => {
              if (victoryDom.VictoryType == victory.VictoryType && victoryDom.StartingAge == ageName && victoryDom.PreviousAgeCount == Configuration.getGame().previousAgeCount) {
                dominationPercentages.push(victoryDom);
              }
            });
            dominationPercentages.sort((a, b) => b.MinAgeProgressPercent - a.MinAgeProgressPercent);
            let tierName = "";
            let tierPct = 100;
            let tierMult = 1;
            for (let idx = 0; idx < dominationPercentages.length; idx++) {
              const domPct = dominationPercentages[idx];
              if (ageProgress >= domPct.MinAgeProgressPercent) {
                tierName = domPct.Name;
                tierMult = (domPct.DominationPercent + 100) / 100;
                if (idx > 0) {
                  const nextDom = dominationPercentages[idx - 1];
                  tierPct = nextDom.MinAgeProgressPercent;
                } else {
                  tierPct = 100;
                }
                break;
              }
            }
            dataModel.unlockedVictories.push({
              victoryName: victory.Name,
              tierName,
              percentage: tierPct,
              multiplier: tierMult
            });
          } else {
            console.error(`victories-popup-model: Unknown victory type ${victoryType}`);
            dataModel.unlockedVictories.push({
              victoryName: "LOC_VICTORIES_POPUP_UNKNOWN",
              tierName: "LOC_VICTORIES_POPUP_UNKNOWN",
              percentage: 100,
              multiplier: 1
            });
          }
        });
        const seen = /* @__PURE__ */ new Set();
        dataModel.unlockedVictories = dataModel.unlockedVictories.filter((value) => {
          if (seen.has(value.multiplier)) {
            return false;
          }
          seen.add(value.multiplier);
          return true;
        });
        dataModel.setExtraClass("victories-popup__enter");
        const popupData = {
          category: PopupSequencer.getCategory(),
          screenId: "screen-victories-popup",
          properties: {
            singleton: true,
            createMouseGuard: false
          },
          priority: PopupPriority.beforeCinematics
          // between wonder cinematics (which will display before this) and tech/civics completion (which will display after)
        };
        requestActive = true;
        PopupSequencer.addDisplayRequest(popupData);
      }
    }
  });
  createEffect(() => {
    const ptsEvt = playerTurnStart();
    if (ptsEvt) {
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.isTurnActive) {
        const model = VictoriesPopupDataModel.get();
        if (model.anyPlayerDominant() && !requestActive) {
          dataModel.setExtraClass("victories-popup__enter");
          const popupData = {
            category: PopupSequencer.getCategory(),
            screenId: "screen-victories-popup",
            properties: {
              singleton: true,
              createMouseGuard: false
            },
            priority: PopupPriority.beforeCinematics
            // between wonder cinematics (which will display before this) and tech/civics completion (which will display after)
          };
          requestActive = true;
          PopupSequencer.addDisplayRequest(popupData);
        }
      }
    }
  });
  const playerList = Players.getAlive();
  playerList.forEach((player) => {
    if (player.isMajor && player.Victories) {
      const playerRecord = {};
      const [turnsToVictory, setTurnsToVictory] = createSignal(-1);
      playerRecord.turnsToVictory = turnsToVictory;
      playerRecord.setTurnsToVictory = setTurnsToVictory;
      playerRecord.playerId = player.id;
      playerRecord.playerName = player.name;
      playerRecord.victories = [];
      playerRecord.isCurrentlyDominant = false;
      GameInfo.VictoryTypes.forEach((victoryType) => {
        const victoryDefinition = GameInfo.Victories.find((a) => a.VictoryType == victoryType.VictoryType);
        if (victoryDefinition) {
          const victory = {};
          const [turnsLeft, setTurnsLeft] = createSignal(-1);
          victory.turnsLeft = turnsLeft;
          victory.setTurnsLeft = setTurnsLeft;
          victory.victoryId = victoryType.$hash;
          victory.victoryName = victoryType.Name;
          const countdown = player.Victories?.getVictoryCountdownStatus(victoryDefinition.$hash);
          if (countdown && countdown.isDominant) {
            const numTurnsLeft = victoryType.CountdownDuration - countdown.turns;
            victory.setTurnsLeft(numTurnsLeft);
            dataModel.setAnyPlayerDominant(true);
            playerRecord.isCurrentlyDominant = true;
            if (playerRecord.turnsToVictory() == -1 || numTurnsLeft < playerRecord.turnsToVictory()) {
              setTurnsToVictory(numTurnsLeft);
            }
          }
          playerRecord.victories.push(victory);
        }
      });
      dataModel.players.push(playerRecord);
    }
  });
  return dataModel;
}
const VictoriesPopupDataModel = ModelRegistry.register("VictoriesPopupDataModel", ModelLifecycle.Singleton, createVictoriesPopupDataModel);
VictoriesPopupDataModel.get();
function createVictoriesPopupViewModel() {
  const sortPlayers = [];
  const dataModel = VictoriesPopupDataModel.get();
  dataModel.players.forEach((player) => {
    if (player.turnsToVictory() != -1 && player.isCurrentlyDominant) {
      sortPlayers.push(player);
    }
  });
  sortPlayers.sort((a, b) => a.turnsToVictory() - b.turnsToVictory());
  sortPlayers.forEach((playerRecord) => {
    playerRecord.active = [];
    playerRecord.victories.forEach((victory) => {
      const libraryPlayer = Players.get(playerRecord.playerId);
      if (libraryPlayer) {
        const countdown = libraryPlayer.Victories?.getVictoryCountdownStatus(victory.victoryId);
        if (countdown && countdown.isDominant && victory.turnsLeft() != -1) {
          const outRec = {
            victoryId: victory.victoryId,
            victoryName: victory.victoryName,
            turnsLeft: victory.turnsLeft()
          };
          playerRecord.active.push(outRec);
        }
      }
    });
    playerRecord.victories.sort((a, b) => a.turnsLeft() - b.turnsLeft());
  });
  return {
    players: sortPlayers,
    victoryUnlockBanner: dataModel.victoryUnlockBanner,
    unlockedVictories: dataModel.unlockedVictories
  };
}
const VictoriesPopupViewModel = ModelRegistry.register("VictoriesPopupViewModel", ModelLifecycle.PerInstance, createVictoriesPopupViewModel);

export { VictoriesPopupDataModel, VictoriesPopupViewModel };
//# sourceMappingURL=victories-popup-model.js.map
