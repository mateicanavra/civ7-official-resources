import { createSignal, createContext, useContext } from '../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../core/vendor/solid-js/store/dist/store.js';
import { utils } from '../../../core/ui/graph-layout/utils.js';
import { ModelRegistry, ModelLifecycle } from '../../../core/ui-next/services/model-registry.js';

const [activePolicyTab, setActivePolicyTab] = createSignal("gov-overview");
function createGovtScreenModel() {
  let bgSrc = "";
  let govName = "";
  let govDescription = "";
  let happPer = "";
  let crisisProgressText = "";
  let crisisProgressBarWidth = "";
  let happinessRingMeter = 0;
  let celebrationTurnsLeftNumber = "";
  let celebrationTurnsLeftDesc = "";
  const celebrationChoices = [];
  const crisisEventMarkers = [
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_BEGINS",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_BEGINS_RANGE",
      eventName: "LOC_UI_POLICIES_CRISIS_BEGINS",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 0) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_INTENSIFIES",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_INTENSIFIES_RANGE",
      eventName: "LOC_UI_POLICIES_CRISIS_INTENSIFIES",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 1) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_CULMINATES",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_CULMINATES_RANGE",
      eventName: "LOC_UI_POLICIES_CRISIS_CULMINATES",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 2) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_ENDS",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_ENDS_RANGE",
      eventName: "LOC_UI_POLICIES_CRISIS_ENDS",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 3) / 100
    }
  ];
  const localPlayer = Players.get(GameContext.localPlayerID);
  if (localPlayer != null) {
    const civDefinition = GameInfo.Civilizations.lookup(localPlayer.civilizationType);
    if (civDefinition) {
      const civInfo = GameInfo.LoadingInfo_Civilizations.lookup(civDefinition?.CivilizationType);
      const civImagePath = window.innerWidth >= 1080 ? civInfo?.BackgroundImageHigh : civInfo?.BackgroundImageLow;
      const civImage = civImagePath ? `url(${civImagePath})` : "";
      bgSrc = civImage;
    }
  }
  const localPlayerHappiness = localPlayer?.Happiness;
  if (localPlayerHappiness === void 0) {
    console.error("model-government: Local player happiness is undefined!");
  }
  const localPlayerStats = localPlayer?.Stats;
  if (localPlayerStats === void 0) {
    console.error("model-government: Local player stats is undefined!");
  }
  const localPlayerCulture = localPlayer?.Culture;
  if (!localPlayerCulture) {
    console.error("model-government:No player culture!");
  }
  const localPlayerGovernmentType = localPlayerCulture.getGovernmentType() ?? null;
  if (localPlayerGovernmentType) {
    const currentGovernment = GameInfo.Governments.lookup(localPlayerGovernmentType);
    govName = currentGovernment?.Name ?? "";
    govDescription = currentGovernment?.Description ?? "";
  }
  const choices = localPlayerCulture?.getGoldenAgeChoices() ?? "";
  if (localPlayerStats) {
    if (localPlayerHappiness) {
      const happinessPerTurn = localPlayerStats?.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
      happPer = Locale.stylize(
        "LOC_UI_POLICIES_HAPPINESS_PER_TURN",
        `${happinessPerTurn >= 0 ? "+" : "-"}${Math.round(happinessPerTurn)}`
      );
      for (const choice of choices) {
        const celebrationItemDef = GameInfo.GoldenAges.lookup(choice);
        if (!celebrationItemDef) {
          console.error(
            `screen-policies: buildOverviewWindow() - No golden age definition found for ${choice}!`
          );
        }
        const description = Locale.stylize(
          celebrationItemDef?.Description ?? "",
          localPlayerHappiness.getGoldenAgeDuration()
        );
        if (celebrationItemDef) {
          const item = {
            image: `url("${UI.getIconURL(celebrationItemDef.GoldenAgeType)}")`,
            description
          };
          celebrationChoices.push(item);
        }
      }
      celebrationTurnsLeftDesc = localPlayerHappiness.isInGoldenAge() ? "LOC_UI_CURRENT_CELEBRATION" : "LOC_UI_NEXT_CELEBRATION";
      if (localPlayerHappiness.isInGoldenAge()) {
        celebrationTurnsLeftNumber = Locale.compose(
          "LOC_UI_X_TURNS_LEFT",
          localPlayerHappiness.getGoldenAgeTurnsLeft()
        );
        happinessRingMeter = localPlayerHappiness.getGoldenAgeTurnsLeft() / localPlayerHappiness.getGoldenAgeDuration() * 100;
      } else {
        const happinessPerTurn2 = localPlayerStats.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
        const nextCelebrationThreshold = localPlayerHappiness.nextGoldenAgeThreshold;
        const happinessTotal = Math.ceil(localPlayerStats.getLifetimeYield(YieldTypes.YIELD_HAPPINESS)) ?? -1;
        const turnsToNextCelebration = Math.max(
          Math.ceil((nextCelebrationThreshold - happinessTotal) / happinessPerTurn2),
          1
        );
        celebrationTurnsLeftNumber = Locale.compose("LOC_UI_X_TURNS_LEFT", turnsToNextCelebration);
        happinessRingMeter = 100 * happinessTotal / nextCelebrationThreshold;
      }
    }
  }
  const crisisStage = Game.CrisisManager.getCurrentCrisisStage(0);
  const nextCrisisStage = Math.max(0, crisisStage + 1);
  let showCrisisText = false;
  if (Game.CrisisManager.isCrisisEnabled(0) && nextCrisisStage < crisisEventMarkers.length) {
    const { progressLabelStr, progressLabelStrRange } = crisisEventMarkers[nextCrisisStage];
    const minTurns = Game.CrisisManager.getMinimumTurnsRemainingInCurrentCrisis(0, crisisStage);
    const maxTurns = Game.CrisisManager.getMaximumTurnsRemainingInCurrentCrisis(0, crisisStage);
    if (minTurns != -1) {
      if (minTurns < 1) {
        crisisProgressText = Locale.stylize(progressLabelStr, maxTurns);
        showCrisisText = true;
      } else if (maxTurns < minTurns) {
        crisisProgressText = Locale.stylize(progressLabelStr, minTurns);
        showCrisisText = true;
      } else {
        crisisProgressText = Locale.stylize(progressLabelStrRange, minTurns, maxTurns);
        showCrisisText = true;
      }
    }
  }
  const currentAgeProgression = Game.AgeProgressManager.getCurrentAgeProgressionPoints();
  const maxAgeProgression = Game.AgeProgressManager.getMaxAgeProgressionPoints();
  const ageProgressionPercent = currentAgeProgression / maxAgeProgression;
  crisisProgressBarWidth = `${utils.clamp(ageProgressionPercent * 100, 0, 100)}%`;
  for (const crisis of crisisEventMarkers) {
    if (ageProgressionPercent < crisis.timelinePlacement) break;
  }
  function showCrisisTab() {
    if (Game.CrisisManager.getCrisisStageTriggerPercent(0, 1) == -1 || Game.age == Database.makeHash("AGE_MODERN")) {
      return false;
    } else {
      return true;
    }
  }
  function populateData() {
    const ornatePanelData = {
      topIconSrc: "url(blp:fi_celebration_128)",
      topIconTint: "",
      topIconBackgroundTint: "#dba33d",
      backgroundImageSrc: bgSrc,
      name: "Government Screen",
      id: "policies-screen"
    };
    const govtScreenData = {
      ornatePanelData,
      governmentDescription: govDescription,
      governmentName: govName,
      happinessPerTurn: happPer,
      celebrationBonusItems: celebrationChoices,
      crisisProgress: crisisProgressText,
      showCrisisText,
      crisisBarWdith: crisisProgressBarWidth,
      crisisEventMarkers,
      celebrationTurnsLeftDesc,
      celebrationTurnsLeft: celebrationTurnsLeftNumber,
      happinessRing: happinessRingMeter,
      displayCrisisTab: showCrisisTab
    };
    return govtScreenData;
  }
  const model = createMutable({
    data: populateData()
  });
  return model;
}
const GovtScreenModel = ModelRegistry.register(
  "GovtScreenModel",
  ModelLifecycle.SharedInstance,
  createGovtScreenModel
);
const GovtScreenModelContext = createContext();
function usePoliciesModelContext() {
  const context = useContext(GovtScreenModelContext);
  if (!context) {
    throw new Error("useGovtModelContext: Cannot find context!");
  }
  return context;
}

export { GovtScreenModel, GovtScreenModelContext, activePolicyTab, createGovtScreenModel, setActivePolicyTab, usePoliciesModelContext };
//# sourceMappingURL=model-government.js.map
