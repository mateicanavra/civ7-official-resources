import { createMemo, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { DatabaseCache } from '../../../ui/utilities/utilities-data.js';
import { CivSelectModel } from './civ-select-model.js';
import { LeaderSelectModel } from './leader-select-model.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';

function createRecommendedChoiceModel() {
  const dbCache = new DatabaseCache("config");
  const leaderCivBiasData = dbCache.query("select * from LeaderCivilizationBias").filter((row) => row.ReasonType != "LOC_REASON_LIVE_EVENT_DESCRIPTION");
  const civModel = CivSelectModel.get();
  const leaderModel = LeaderSelectModel.get();
  const hightlightBiasThreshold = 2;
  const leadersForCiv = createMemo(() => {
    const civ = civModel.selectedCiv();
    const leaderMap = /* @__PURE__ */ new Map();
    if (!civ) {
      return leaderMap;
    }
    const leaders = leaderCivBiasData.filter((row) => row.CivilizationType == civ.civID);
    for (const leader of leaders) {
      const info = {
        leaderId: leader.LeaderType,
        choice: leader.ChoiceType,
        reason: leader.ReasonType,
        bias: leader.Bias
      };
      leaderMap.set(leader.LeaderType, info);
    }
    return leaderMap;
  });
  const civsForLeader = createMemo(() => {
    const leader = leaderModel.selectedLeader();
    const civs = leaderCivBiasData.filter((row) => row.LeaderType == leader.leaderID);
    const civMap = /* @__PURE__ */ new Map();
    for (const civ of civs) {
      const info = {
        civId: civ.CivilizationType,
        choice: civ.ChoiceType,
        reason: civ.ReasonType,
        bias: civ.Bias
      };
      civMap.set(civ.CivilizationType, info);
    }
    return civMap;
  });
  const historicalLeaders = createMemo(() => {
    const leaders = leadersForCiv();
    return leaderModel.leaders.filter(
      (l) => leaders.get(l.leaderID)?.choice == "LOC_CREATE_GAME_HISTORICAL_CHOICE"
    );
  });
  const historicalCivs = createMemo(() => {
    const civs = civsForLeader();
    let maxBias = Number.NEGATIVE_INFINITY;
    for (const [_, civ] of civs) {
      const bias = civ.bias;
      if (bias > maxBias) {
        maxBias = bias;
      }
    }
    return civModel.civs.filter(
      (c) => civs.has(c.civID) && (civs.get(c.civID)?.bias ?? 0) > hightlightBiasThreshold && civs.get(c.civID)?.bias == maxBias
    );
  });
  const recommendedLeaders = createMemo(() => {
    const leaders = leadersForCiv();
    return leaderModel.leaders.filter(
      (l) => leaders.has(l.leaderID) && leaders.get(l.leaderID)?.choice != "LOC_CREATE_GAME_HISTORICAL_CHOICE"
    );
  });
  const recommendedCivs = createMemo(() => {
    const civs = civsForLeader();
    let maxBias = Number.NEGATIVE_INFINITY;
    for (const [_, civ] of civs) {
      const bias = civ.bias;
      if (bias > maxBias) {
        maxBias = bias;
      }
    }
    return civModel.civs.filter(
      (c) => civs.has(c.civID) && ((civs.get(c.civID)?.bias ?? 0) <= hightlightBiasThreshold || civs.get(c.civID)?.bias != maxBias)
    );
  });
  const unrecommendedLeaders = createMemo(() => {
    const leaders = leadersForCiv();
    return leaderModel.leaders.filter((l) => !leaders.has(l.leaderID));
  });
  const unrecommendedCivs = createMemo(() => {
    const civs = civsForLeader();
    return civModel.civs.filter((c) => !civs.has(c.civID));
  });
  return {
    forCiv: leadersForCiv,
    forLeader: civsForLeader,
    historicalCivs,
    historicalLeaders,
    recommendedCivs,
    recommendedLeaders,
    unrecommendedCivs,
    unrecommendedLeaders
  };
}
const RecommendedChoiceModel = ModelRegistry.register(
  "RecommendedChoiceModel",
  ModelLifecycle.SharedInstance,
  createRecommendedChoiceModel
);
const RecommendedChoiceModelContext = createContext();
function useRecommendedChoiceModelContext() {
  const context = useContext(RecommendedChoiceModelContext);
  if (!context) {
    throw new Error("useRecommendedChoiceModel: Cannot find context!");
  }
  return context;
}

export { RecommendedChoiceModel, RecommendedChoiceModelContext, useRecommendedChoiceModelContext };
//# sourceMappingURL=recommended-choice-model.js.map
