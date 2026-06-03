import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import { VictoryQuestState } from '../quest-tracker/quest-item.js';
import { getQuestTracker } from '../quest-tracker/quest-tracker.js';
import VictoryManager from '../victory-manager/victory-manager.js';

const AdvisorLegacyPathClasses = /* @__PURE__ */ new Map();
AdvisorLegacyPathClasses.set(AdvisorTypes.SCIENCE, "LEGACY_PATH_CLASS_SCIENCE");
AdvisorLegacyPathClasses.set(AdvisorTypes.MILITARY, "LEGACY_PATH_CLASS_MILITARY");
AdvisorLegacyPathClasses.set(AdvisorTypes.CULTURE, "LEGACY_PATH_CLASS_CULTURE");
AdvisorLegacyPathClasses.set(AdvisorTypes.ECONOMIC, "LEGACY_PATH_CLASS_ECONOMIC");
const AgeStrings = /* @__PURE__ */ new Map();
AgeStrings.set("AGE_ANTIQUITY", "ANTIQUITY");
AgeStrings.set("AGE_EXPLORATION", "EXPLORATION");
AgeStrings.set("AGE_MODERN", "MODERN");
class AdvisorProgressModel {
  victoryData = /* @__PURE__ */ new Map();
  playerData = null;
  questData = [];
  mileStoneData = [];
  advisorType = "";
  onUpdate;
  //TODO: This should be moved to the database for maintainability. If we store all the data by advisor type we can pull out more of the switch cases.
  ageInfoList = [
    {
      age: "AGE_ANTIQUITY",
      pediaPageIds: { cultural: "AGES_24", economic: "AGES_27", military: "AGES_25", scientific: "AGES_26" }
    },
    {
      age: "AGE_EXPLORATION",
      pediaPageIds: { cultural: "AGES_28", economic: "AGES_29", military: "AGES_30", scientific: "AGES_31" }
    },
    {
      age: "AGE_MODERN",
      pediaPageIds: { cultural: "AGES_35", economic: "AGES_32", military: "AGES_33", scientific: "AGES_34" }
    }
  ];
  constructor() {
    VictoryManager.victoryManagerUpdateEvent.on(this.onVictoryManagerUpdate.bind(this));
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    this.victoryData = VictoryManager.processedVictoryData;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  onVictoryManagerUpdate() {
    this.updateGate.call("onVictoryManagerUpdate");
  }
  getActiveQuest(advisorType) {
    const questTracker = getQuestTracker();
    const quests = this.getQuestsByAdvisor(advisorType);
    for (const quest of quests) {
      const memoryState = questTracker.readQuestVictory(quest.id).state;
      if (memoryState != VictoryQuestState.QUEST_COMPLETED) {
        return quest;
      }
    }
    return void 0;
  }
  /**
   * @param {AdvisorType} type Category to filter Victory Quests.
   * @returns An ordered list of quests by advisor
   */
  getQuestsByAdvisor(type) {
    const questTracker = getQuestTracker();
    const items = Array.from(questTracker.getItems());
    const advisorItems = items.filter((item) => item.victory && item.victory.type == type);
    const orderedItems = advisorItems.sort((itemA, itemB) => {
      if (itemA.victory && itemB.victory) {
        return itemA.victory.order - itemB.victory.order;
      }
      return 0;
    });
    return orderedItems;
  }
  isQuestTracked(quest) {
    if (!quest) {
      return false;
    }
    const questTracker = getQuestTracker();
    const isQuestTracked = questTracker.isQuestVictoryInProgress(quest.id);
    if (isQuestTracked) {
      questTracker.updateQuestList(quest.id);
    }
    return isQuestTracked;
  }
  updateQuestTracking(quest, isTracked) {
    if (!quest) {
      return;
    }
    const tutorialData = {
      FtueEvent: "Tutorial Quest Tracking",
      TutorialDefinitionId: "",
      AdvisorType: "",
      AdvisorWarningType: "",
      QuestLine: quest.id,
      IsTracked: isTracked
    };
    Telemetry.sendTutorial(tutorialData);
    const questTracker = getQuestTracker();
    if (isTracked) {
      questTracker.setQuestVictoryState(quest, VictoryQuestState.QUEST_IN_PROGRESS);
    } else {
      questTracker.setQuestVictoryState(quest, VictoryQuestState.QUEST_UNSTARTED);
      if (quest.victory) {
        questTracker.setPathTracked(false, quest.victory.type);
      }
    }
    questTracker.writeQuestVictory(quest);
  }
  getLegacyPathClassTypeByAdvisorType(advisorType) {
    return AdvisorLegacyPathClasses.get(advisorType);
  }
  getAdvisorStringByAdvisorType(advisorType) {
    switch (advisorType) {
      case AdvisorTypes.SCIENCE:
        return "ADVISOR_SCIENCE";
      case AdvisorTypes.MILITARY:
        return "ADVISOR_MILITARY";
      case AdvisorTypes.CULTURE:
        return "ADVISOR_CULTURE";
      case AdvisorTypes.ECONOMIC:
        return "ADVISOR_ECONOMIC";
      default:
        return "";
    }
  }
  getAdvisorVictoryLoc(advisorType) {
    switch (advisorType) {
      case AdvisorTypes.SCIENCE:
        return "LOC_UI_CINEMATIC_FIRST_SPACE_FLIGHT";
      case AdvisorTypes.MILITARY:
        return "LOC_UI_CINEMATIC_OPERATION_IVY_TITLE";
      case AdvisorTypes.CULTURE:
        return "LOC_UI_CINEMATIC_WORLDS_FAIR";
      case AdvisorTypes.ECONOMIC:
        return "LOC_UI_CINEMATIC_WORLD_BANK";
      default:
        return "";
    }
  }
  getCivilopediaVictorySearchByAdvisor(advisorType) {
    const definition = GameInfo.Ages.lookup(Game.age);
    if (!definition) {
      console.error(`ERROR: No age definition found for ${Game.age} in model-advisor-victory.ts`);
    }
    const ageData = this.ageInfoList.find((ageInfo) => {
      return definition?.AgeType == ageInfo.age;
    });
    if (!ageData) {
      console.error(
        `ERROR - getCivilopediaVictorySearchByAdvisor(advisorType: AdvisorType) - No ageData found while looking up advisorType (${advisorType}) for civilopedia page id!`
      );
      return "";
    }
    switch (advisorType) {
      case AdvisorTypes.CULTURE:
        return ageData.pediaPageIds.cultural;
      case AdvisorTypes.ECONOMIC:
        return ageData.pediaPageIds.economic;
      case AdvisorTypes.MILITARY:
        return ageData.pediaPageIds.military;
      case AdvisorTypes.SCIENCE:
        return ageData.pediaPageIds.scientific;
      default:
        return "";
    }
  }
  getAdvisorPortrait(advisorType) {
    return UI.getIconURL(this.getAdvisorStringByAdvisorType(advisorType), "ADVISOR");
  }
  getAdvisorProgressBar(advisorType) {
    const iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_BAR";
    return UI.getIconURL(iconString, "ADVISOR");
  }
  getAdvisorVictoryIcon(advisorType) {
    let iconString = "";
    if (Game.AgeProgressManager.isFinalAge) {
      iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_VICTORY";
    } else {
      iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_GOLDEN_AGE";
    }
    return UI.getIconURL(iconString, "ADVISOR");
  }
  getRewardGrantIcon(rewardType) {
    return UI.getIconURL(rewardType || "");
  }
  getPlayerProgress(advisor, currentAge) {
    const progressData = this.victoryData.get(currentAge);
    if (progressData) {
      const progress = progressData.find(
        (victory) => victory.ClassType == AdvisorProgress.getLegacyPathClassTypeByAdvisorType(advisor)
      );
      if (progress) {
        for (const [_index, player] of progress.playerData.entries()) {
          if (player.isLocalPlayer) {
            return player;
          }
        }
      }
    }
    return null;
  }
  getLegacyPathFromAdvisor(advisorType) {
    const classType = AdvisorProgress.getLegacyPathClassTypeByAdvisorType(advisorType);
    for (const legacyPath of GameInfo.LegacyPaths) {
      if (legacyPath.LegacyPathClassType == classType && legacyPath.EnabledByDefault) {
        return legacyPath;
      }
    }
    return null;
  }
  getAdvisorMileStones(advisorType) {
    const definition = GameInfo.Ages.lookup(Game.age);
    if (!definition) {
      console.warn("model-advisor-victory: getAdvisorMileStones(): No current definition for Age: " + Game.age);
    }
    const legacyPath = this.getLegacyPathFromAdvisor(advisorType);
    if (legacyPath) {
      const progressMileStones = GameInfo.AgeProgressionMilestones.filter(
        (milestone) => milestone.LegacyPathType == legacyPath.LegacyPathType
      );
      return progressMileStones;
    } else {
      return [];
    }
  }
  getAgeStringByType(ageType) {
    return AgeStrings.get(ageType);
  }
  getMaxScoreForAdvisorType(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      if (stone.FinalMilestone) {
        return stone.RequiredPathPoints;
      }
    }
    return 0;
  }
  getDarkAgeIcon(advisor, playerProgress, darkAgeIcon) {
    const availbleIconToUse = darkAgeIcon ? darkAgeIcon : "fs://game/leg_pro_darka_available.png";
    const milestones = this.getAdvisorMileStones(advisor);
    if (milestones[0] && milestones[0].RequiredPathPoints <= playerProgress) {
      return "fs://game/leg_pro_darka_locked.png";
    } else {
      return availbleIconToUse;
    }
  }
  getDarkAgeBarPercent(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    const maxScore = this.getMaxScoreForAdvisorType(advisor);
    if (milestones[0] && milestones[0].RequiredPathPoints) {
      const offSet = window.innerHeight > Layout.pixelsToScreenPixels(1e3) ? 0.04 : 0;
      return milestones[0].RequiredPathPoints / maxScore + offSet;
    } else {
      return 0;
    }
  }
  isRewardMileStone(advisor, pip) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      if (stone.RequiredPathPoints === pip) {
        return true;
      }
    }
    return false;
  }
  isMilestoneComplete(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      return Game.AgeProgressManager.isMilestoneComplete(stone.AgeProgressionMilestoneType);
    }
    return false;
  }
  /**
   * Determine the milestone progress amount given for an advisor
   * @param advisor Which advisor this is for
   * @param milestoneRewardNum The milestone reward number this represents
   * @returns The associate reward amount with the milestone or 0 if one can't be found.
   */
  getMilestoneProgressAmount(advisor, milestoneRewardNum) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      const index = stone.AgeProgressionMilestoneType.lastIndexOf("_");
      if (index == -1) {
        console.warn(
          `Unable to determine the # for a milestone reward.  AgeProgressionMilestone table entry is: ${stone.AgeProgressionMilestoneType}`
        );
        continue;
      }
      const num = stone.AgeProgressionMilestoneType.substring(index + 1);
      if (Number(num) == milestoneRewardNum) {
        return Game.AgeProgressManager.getMilestoneProgressionPoints(stone.AgeProgressionMilestoneType);
      }
    }
    return 0;
  }
  getDarkAgeReward(advisor) {
    const legacyPath = this.getLegacyPathFromAdvisor(advisor);
    if (legacyPath) {
      return GameInfo.AgeProgressionDarkAgeRewardInfos.find(
        (reward) => reward.LegacyPathType == legacyPath.LegacyPathType
      );
    }
    return void 0;
  }
}
const AdvisorProgress = new AdvisorProgressModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AdvisorProgress);
  };
  engine.createJSModel("g_AdvisorProgressModel", AdvisorProgress);
  AdvisorProgress.updateCallback = updateModel;
});

export { AdvisorProgress as default };
//# sourceMappingURL=model-advisor-victory.js.map
