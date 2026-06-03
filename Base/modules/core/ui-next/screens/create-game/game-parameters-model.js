import { createMemo, createEffect, on } from '../../../vendor/solid-js/dist/solid.js';
import { createStore, produce } from '../../../vendor/solid-js/store/dist/store.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';
import { createArraySignal, createPolledSignal } from '../../utilities/solid-utilities.js';

const playerDependantGameParamters = /* @__PURE__ */ new Set(["MapSize"]);
function createBaseSetupParameter(getFunc, setFunc) {
  const initialData = getFunc();
  if (!initialData) {
    return null;
  }
  const [parameter, setParameter] = createStore({
    ...initialData,
    destroyed: false,
    update: () => {
      const newData = getFunc();
      if (newData) {
        setParameter(produce((state) => Object.assign(state, newData)));
      }
    },
    setValue: setFunc,
    setDestroyed: (value) => {
      setParameter("destroyed", value);
    }
  });
  return parameter;
}
function createGameSetupParameter(parameterId) {
  const getFunc = () => GameSetup.findGameParameter(parameterId);
  const setFunc = (value) => GameSetup.setGameParameterValue(parameterId, value);
  return createBaseSetupParameter(getFunc, setFunc);
}
function createPlayerSetupParameter(playerId, parameterId) {
  const getFunc = () => GameSetup.findPlayerParameter(playerId, parameterId);
  const setFunc = (value) => GameSetup.setPlayerParameterValue(playerId, parameterId, value);
  const playerParams = createBaseSetupParameter(getFunc, setFunc);
  return playerParams;
}
function createPlayerConfiguration() {
  const [allSlots, mutateAllSlots] = createArraySignal([]);
  const reload = () => {
    const maxPlayers = Configuration.getMap().maxMajorPlayers;
    mutateAllSlots((slots) => {
      if (slots.length > maxPlayers) {
        slots.length = maxPlayers;
      }
      for (let playerId = 0; playerId < maxPlayers; ++playerId) {
        const playerConfig = Configuration.getPlayer(playerId);
        const slotStatus = playerConfig.slotStatus;
        const setSlotStatus = (slotStatus2) => {
          const playerEdit = Configuration.editPlayer(playerId);
          if (playerEdit) {
            playerEdit.setSlotStatus(slotStatus2);
            playerEdit.setAsMajorCiv();
          }
          reload();
        };
        const existingSlot = slots.find((slot) => slot.playerId == playerId);
        if (existingSlot) {
          existingSlot.slotStatus = slotStatus;
        } else {
          const isLocalPlayer = playerId == GameContext.localPlayerID;
          slots.push({
            playerId,
            isLocalPlayer,
            slotStatus,
            setSlotStatus
          });
        }
      }
    });
  };
  const activeSlots = createMemo(() => {
    return allSlots().filter((s) => !(s.slotStatus == SlotStatus.SS_CLOSED || s.slotStatus == SlotStatus.SS_OPEN));
  });
  const openSlots = createMemo(() => {
    return allSlots().filter((s) => s.slotStatus == SlotStatus.SS_CLOSED || s.slotStatus == SlotStatus.SS_OPEN);
  });
  reload();
  return { reload, allSlots, activeSlots, openSlots };
}
function createCombinedSetupModels() {
  let prevGameSetupRevision = 0;
  const [currentId] = createPolledSignal(() => GameSetup.currentRevision, 150);
  const [gameParameters, setGameParameters] = createStore({});
  const groupNames = /* @__PURE__ */ new Map();
  const [groupGameParameters, setGroupGameParameters] = createStore({
    groupNames,
    groups: {}
  });
  const parameterGroups = Database.query("config", "SELECT * FROM ParameterGroups") ?? [];
  for (const row of parameterGroups) {
    const name = Locale.compose(row.Name ?? "");
    const groupId = Locale.compose(row.GroupID ?? "");
    groupNames.set(groupId, name);
  }
  const [playerParameters, setPlayerParameters] = createStore({});
  const playerParametersModel = {
    players: playerParameters,
    configuration: createPlayerConfiguration()
  };
  function addToGroup(groupId, param) {
    const group = GameSetup.resolveString(param.group);
    if (group) {
      if (group == "LegacyOptions") {
        return;
      }
      if (!groupGameParameters.groups[group]) {
        const emptyGroup = { name: groupNames.get(groupId) ?? groupId };
        setGroupGameParameters("groups", group, emptyGroup);
      }
      setGroupGameParameters("groups", group, groupId, param);
    }
  }
  function updateParamValue(change, parameter) {
    if (change.destroyed) {
      parameter.setDestroyed(true);
    } else {
      parameter.update();
      if (change.created) {
        parameter.setDestroyed(false);
      }
    }
  }
  function addPlayerParameter(playerId, paramName) {
    const newParameter = createPlayerSetupParameter(playerId, paramName);
    if (newParameter) {
      if (!playerParameters[playerId]) {
        setPlayerParameters(playerId, {});
      }
      setPlayerParameters(playerId, paramName, newParameter);
    }
  }
  function addGameParameter(paramName) {
    const newParameter = createGameSetupParameter(paramName);
    if (newParameter) {
      setGameParameters(paramName, newParameter);
      addToGroup(paramName, newParameter);
    }
  }
  function updateParameterChanges(changes) {
    let playerParametersUpdated = false;
    for (const change of changes) {
      const paramName = GameSetup.resolveString(change.parameterID);
      if (!paramName) {
        return;
      }
      if (change.playerID !== void 0) {
        const parameter = playerParameters[change.playerID]?.[paramName];
        playerParametersUpdated = true;
        if (parameter) {
          updateParamValue(change, parameter);
        } else if (change.created) {
          addPlayerParameter(change.playerID, paramName);
        }
      } else if (change.teamID === void 0) {
        const parameter = gameParameters[paramName];
        if (playerDependantGameParamters.has(paramName)) {
          playerParametersUpdated = true;
        }
        if (parameter) {
          updateParamValue(change, parameter);
        } else if (change.created) {
          addGameParameter(paramName);
        }
      }
    }
    if (playerParametersUpdated) {
      playerParametersModel.configuration.reload();
    }
  }
  function updatePlayerParamters() {
    let playerParametersUpdated = false;
    for (const playerId of Configuration.getGame().participatingPlayerIDs) {
      const gamePlayerParameters = GameSetup.getPlayerParameters(playerId);
      for (const parameter of gamePlayerParameters) {
        const paramName = GameSetup.resolveString(parameter.ID);
        if (!paramName) {
          break;
        }
        const existingParameter = playerParameters[playerId]?.[paramName];
        if (existingParameter) {
          existingParameter.update();
          playerParametersUpdated = true;
        } else {
          addPlayerParameter(playerId, paramName);
          playerParametersUpdated = true;
        }
      }
    }
    if (playerParametersUpdated) {
      playerParametersModel.configuration.reload();
    }
  }
  function updateGameParameters() {
    for (const parameter of GameSetup.getGameParameters()) {
      const paramName = GameSetup.resolveString(parameter.ID);
      if (!paramName) {
        break;
      }
      const existingParameter = gameParameters[paramName];
      if (existingParameter) {
        existingParameter.update();
      } else {
        addGameParameter(paramName);
      }
    }
  }
  createEffect(
    on(
      currentId,
      (value) => {
        if (value != prevGameSetupRevision) {
          const changes = GameSetup.getParameterChanges(prevGameSetupRevision);
          if (changes == null) {
            updateGameParameters();
            updatePlayerParamters();
          } else if (changes.length > 0) {
            updateParameterChanges(changes);
          }
          prevGameSetupRevision = value;
        }
      },
      { defer: true }
    )
  );
  function resetToDefault() {
    GameSetup.resetSavedCreateGameSettings();
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
  }
  function forceRefresh() {
    updateGameParameters();
    updatePlayerParamters();
    prevGameSetupRevision = GameSetup.currentRevision;
  }
  forceRefresh();
  return {
    gameParametersModel: gameParameters,
    gameParametersByGroupModel: groupGameParameters,
    playerParametersModel,
    forceRefresh,
    resetToDefaults: resetToDefault
  };
}
let combinedSetupModelsInstance = void 0;
const combinedSetupModels = () => {
  combinedSetupModelsInstance ??= createCombinedSetupModels();
  return combinedSetupModelsInstance;
};
const SetupParametersModel = ModelRegistry.register(
  "SetupParametersModel",
  ModelLifecycle.Singleton,
  () => combinedSetupModels()
);
const PlayerSetupParametersModel = ModelRegistry.register(
  "PlayerSetupParametersModel",
  ModelLifecycle.Singleton,
  () => combinedSetupModels().playerParametersModel
);
const GameSetupParametersModel = ModelRegistry.register(
  "GameSetupParametersModel",
  ModelLifecycle.Singleton,
  () => combinedSetupModels().gameParametersModel
);
const GameSetupParameterGroupsModel = ModelRegistry.register(
  "GameSetupParameterGroupsModel",
  ModelLifecycle.Singleton,
  () => combinedSetupModels().gameParametersByGroupModel
);

export { GameSetupParameterGroupsModel, GameSetupParametersModel, PlayerSetupParametersModel, SetupParametersModel };
//# sourceMappingURL=game-parameters-model.js.map
