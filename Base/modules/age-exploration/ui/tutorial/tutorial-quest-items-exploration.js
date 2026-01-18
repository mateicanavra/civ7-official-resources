import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { VictoryQuestState } from '../../../base-standard/ui/quest-tracker/quest-item.js';
import QuestTracker, { QuestCompletedEventName } from '../../../base-standard/ui/quest-tracker/quest-tracker.js';
import { TutorialAdvisorType, TutorialAnchorPosition } from '../../../base-standard/ui/tutorial/tutorial-item.js';
import TutorialManager from '../../../base-standard/ui/tutorial/tutorial-manager.js';
import { a as activateNextTrackedQuest, c as canQuestActivate } from '../../../base-standard/ui/tutorial/tutorial-support.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../../../base-standard/ui/tutorial/tutorial-events.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';

const calloutClose = {
  callback: () => {
  },
  text: "LOC_TUTORIAL_CALLOUT_CLOSE",
  actionKey: "inline-cancel",
  closes: true
};
const calloutBegin = {
  callback: () => {
  },
  text: "LOC_TUTORIAL_CALLOUT_BEGIN",
  actionKey: "inline-accept",
  closes: true
};
const calloutDeclineQuest = {
  callback: () => {
  },
  text: "LOC_TUTORIAL_CALLOUT_DECLINE_QUEST",
  actionKey: "inline-cancel",
  closes: true
};
const isLiveEventPlayer = (() => {
  return Online.Metaprogression.isPlayingActiveEvent();
})();
const isNotLiveEventPlayer = (_item) => {
  return !isLiveEventPlayer;
};
TutorialManager.add({
  ID: "advisor_quest_panel",
  questPanel: {
    title: "LOC_TUTORIAL_QUEST_SELECTION_TITLE",
    description: {
      text: "LOC_TUTORIAL_QUEST_SELECTION_BODY",
      getLocParams: (_item) => {
        let civAdj = "null";
        const player = Players.get(GameContext.localPlayerID);
        if (player) {
          civAdj = player.civilizationAdjective;
        }
        return [civAdj];
      }
    },
    altNoAdvisorsDescription: {
      text: "LOC_TUTORIAL_QUEST_SELECTION_BODY_NO_ADVISORS"
    },
    advisors: [
      //! No 'nextID' elements chained to buttons need a 'activationCustomEvents'
      {
        type: AdvisorTypes.ECONOMIC,
        quote: "LOC_TUTORIAL_QUEST_QUOTE_ECONOMIC",
        button: {
          callback: () => {
          },
          text: "LOC_ADVISOR_ECONOMIC_NAME",
          pathDesc: "LOC_TUTORIAL_LEGACY_PATH_ECONOMIC_DESCRIPTION",
          closes: true,
          actionKey: "",
          nextID: "economic_victory_quest_1_start",
          questID: "economic_victory_quest_1_tracking"
        },
        legacyPathClassType: "LEGACY_PATH_CLASS_ECONOMIC"
      },
      {
        type: AdvisorTypes.MILITARY,
        quote: "LOC_TUTORIAL_QUEST_QUOTE_MILITARY",
        button: {
          callback: () => {
          },
          text: "LOC_ADVISOR_MILITARY_NAME",
          pathDesc: "LOC_TUTORIAL_LEGACY_PATH_MILITARY_DESCRIPTION",
          closes: true,
          actionKey: "",
          nextID: "military_victory_quest_1_start",
          questID: "military_victory_quest_1_tracking"
        },
        legacyPathClassType: "LEGACY_PATH_CLASS_MILITARY"
      },
      {
        type: AdvisorTypes.CULTURE,
        quote: "LOC_TUTORIAL_QUEST_QUOTE_CULTURE",
        button: {
          callback: () => {
          },
          text: "LOC_ADVISOR_CULTURE_NAME",
          pathDesc: "LOC_TUTORIAL_LEGACY_PATH_CULTURE_DESCRIPTION",
          closes: true,
          actionKey: "",
          nextID: "culture_victory_quest_1_start",
          questID: "culture_victory_quest_1_tracking"
        },
        legacyPathClassType: "LEGACY_PATH_CLASS_CULTURE"
      },
      {
        type: AdvisorTypes.SCIENCE,
        quote: "LOC_TUTORIAL_QUEST_QUOTE_SCIENCE",
        button: {
          callback: () => {
          },
          text: "LOC_ADVISOR_SCIENCE_NAME",
          pathDesc: "LOC_TUTORIAL_LEGACY_PATH_SCIENCE_DESCRIPTION",
          closes: true,
          actionKey: "",
          nextID: "science_victory_quest_1_start",
          questID: "science_victory_quest_1_tracking"
        },
        legacyPathClassType: "LEGACY_PATH_CLASS_SCIENCE"
      }
    ]
  },
  activationEngineEvents: ["PlayerTurnActivated"],
  onObsoleteCheck: (item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    if (!item.questPanel) {
      return false;
    }
    const trackedPaths = [];
    item.questPanel.advisors.forEach((advisor) => {
      const advisorPath = QuestTracker.readQuestVictory(advisor.button.questID);
      if (advisorPath.state == VictoryQuestState.QUEST_IN_PROGRESS || advisorPath.state == VictoryQuestState.QUEST_COMPLETED) {
        trackedPaths.push(true);
      } else {
        trackedPaths.push(false);
      }
    });
    return trackedPaths.every((path) => path);
  },
  hiders: [".tut-action-button", ".tut-action-text"],
  inputFilters: [{ inputName: "next-action" }]
});
const militaryVictoryContent1 = {
  title: "LOC_TUTORIAL_MILITARY_QUEST_1_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_1_ADVISOR_BODY",
    getLocParams: () => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_1_ADVISOR_BODY_MONGOLIA_PATH";
        } else {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_1_ADVISOR_BODY_GENERIC_PATH";
        }
      }
      return [playerPathText];
    }
  },
  body: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_1_BODY",
    getLocParams: () => {
      let playerPathText = "";
      let commanderIcon = "";
      let commanderName = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          const fleetCommander = player.Units.getBuildUnit("UNIT_ARMY_COMMANDER");
          const commanderDef = GameInfo.Units.lookup(fleetCommander);
          if (commanderDef) {
            commanderIcon = "[icon:" + commanderDef.UnitType + "]";
            commanderName = commanderDef.Name;
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_1_BODY_MONGOLIA_PATH",
            commanderIcon,
            commanderName
          );
        } else {
          const fleetCommander = player.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
          const commanderDef = GameInfo.Units.lookup(fleetCommander);
          if (commanderDef) {
            commanderIcon = "[icon:" + commanderDef.UnitType + "]";
            commanderName = commanderDef.Name;
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_1_BODY_GENERIC_PATH",
            commanderIcon,
            commanderName
          );
        }
      }
      return [playerPathText];
    }
  }
};
TutorialManager.add({
  ID: "military_victory_quest_1_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Military,
    ...militaryVictoryContent1,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "military_victory_quest_1_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("military_victory_quest_1_tracking");
  },
  hiders: [".tut-action-button", ".tut-action-text"],
  inputFilters: [{ inputName: "next-action" }]
});
TutorialManager.add({
  ID: "military_victory_quest_1_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_1_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_MILITARY_QUEST_1_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.MILITARY,
      order: 1,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: militaryVictoryContent1
    },
    getDescriptionLocParams: () => {
      let playerPathText = "";
      let cartographyResearched = "[icon:QUEST_ITEM_OPEN]";
      let astronomyResearched = "[icon:QUEST_ITEM_OPEN]";
      let settlementCaptured = 0;
      const settlementGoal = 1;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          const playerCities = player.Cities?.getCities();
          if (player.Units && playerCities) {
            for (let i = 0; i < playerCities.length; ++i) {
              const city = playerCities[i];
              if (city != null) {
                if (city.originalOwner != player.id) {
                  settlementCaptured++;
                }
              }
            }
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_1_TRACKING_BODY_MONGOLIA_PATH",
            settlementCaptured,
            settlementGoal
          );
        } else {
          if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_CARTOGRAPHY")) {
            cartographyResearched = "[icon:QUEST_ITEM_COMPLETED]";
          }
          if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_ASTRONOMY")) {
            astronomyResearched = "[icon:QUEST_ITEM_COMPLETED]";
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_1_TRACKING_BODY_GENERIC_PATH",
            cartographyResearched,
            astronomyResearched
          );
        }
      }
      return [playerPathText];
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["TechNodeCompleted", "UnitAddedToArmy", "UnitRemovedFromArmy", "CityAddedToMap"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let settlementCaptured = 0;
    if (player) {
      const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
      if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city != null) {
              if (city.originalOwner != player.id) {
                settlementCaptured++;
              }
            }
          }
        }
        if (settlementCaptured > 0) {
          return true;
        }
      } else {
        if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_CARTOGRAPHY") && player.Techs?.isNodeUnlocked("NODE_TECH_EX_ASTRONOMY")) {
          return true;
        }
      }
    }
    return false;
  }
});
const militaryVictoryContent2 = {
  title: "LOC_TUTORIAL_MILITARY_QUEST_2_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_2_ADVISOR_BODY",
    getLocParams: (_item) => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_2_ADVISOR_BODY_MONGOLIA_PATH";
        } else {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_2_ADVISOR_BODY_GENERIC_PATH";
        }
      }
      return [playerPathText];
    }
  },
  body: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_2_BODY",
    getLocParams: () => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_2_BODY_MONGOLIA_PATH";
        } else {
          let commanderIcon = "";
          let commanderName = "";
          const player2 = Players.get(GameContext.localPlayerID);
          if (player2 && player2.Units) {
            const fleetCommander = player2.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
            const commanderDef = GameInfo.Units.lookup(fleetCommander);
            if (commanderDef) {
              commanderIcon = "[icon:" + commanderDef.UnitType + "]";
              commanderName = commanderDef.Name;
            }
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_2_BODY_GENERIC_PATH",
            commanderIcon,
            commanderName
          );
        }
      }
      return [playerPathText];
    }
  }
};
TutorialManager.add({
  ID: "military_victory_quest_2_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Military,
    ...militaryVictoryContent2,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "military_victory_quest_2_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "military_victory_quest_1_tracking",
      "military_victory_quest_2_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("military_victory_quest_2_tracking");
  }
});
TutorialManager.add({
  ID: "military_victory_quest_2_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_2_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_MILITARY_QUEST_2_TRACKING_BODY",
    getDescriptionLocParams: () => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      let settlementCaptured = 0;
      const settlementGoal = 2;
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          const playerCities = player.Cities?.getCities();
          if (player.Units && playerCities) {
            for (let i = 0; i < playerCities.length; ++i) {
              const city = playerCities[i];
              if (city != null) {
                if (city.originalOwner != player.id) {
                  settlementCaptured++;
                }
              }
            }
            playerPathText = Locale.compose(
              "LOC_TUTORIAL_MILITARY_QUEST_2_TRACKING_BODY_MONGOLIA_PATH",
              settlementCaptured,
              settlementGoal
            );
          }
        } else {
          let commanderIcon = "";
          let commanderName = "";
          let settlementInDistantLands = "[icon:QUEST_ITEM_OPEN]";
          if (player.Units) {
            const playerCities = player.Cities?.getCities();
            if (playerCities) {
              for (let i = 0; i < playerCities.length; ++i) {
                const city = playerCities[i];
                if (city != null && city.isDistantLands) {
                  settlementInDistantLands = "[icon:QUEST_ITEM_COMPLETED]";
                }
              }
            }
            const fleetCommander = player.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
            const commanderDef = GameInfo.Units.lookup(fleetCommander);
            if (commanderDef) {
              commanderIcon = "[icon:" + commanderDef.UnitType + "]";
              commanderName = commanderDef.Name;
            }
          }
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_2_TRACKING_BODY_GENERIC_PATH",
            settlementInDistantLands,
            commanderIcon,
            commanderName
          );
        }
      }
      return [playerPathText];
    },
    cancelable: true,
    victory: {
      type: AdvisorTypes.MILITARY,
      order: 2,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: militaryVictoryContent2
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["CityAddedToMap"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    let bQuestComplete = false;
    let iCitiesCaptured = 0;
    const player = Players.get(GameContext.localPlayerID);
    if (player && player.Cities) {
      const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
      if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
        const playerCities = player.Cities.getCities();
        for (const city of playerCities) {
          if (city.originalOwner != player.id) {
            iCitiesCaptured++;
          }
        }
        if (iCitiesCaptured >= 2) {
          bQuestComplete = true;
        }
      } else {
        const playerCities = player.Cities.getCities();
        for (const city of playerCities) {
          if (city.isDistantLands) {
            bQuestComplete = true;
            break;
          }
        }
      }
    }
    return bQuestComplete;
  }
});
const militaryVictoryContent3 = {
  title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_3_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_3_ADVISOR_BODY",
    getLocParams: (_item) => {
      let civAdj = "";
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        civAdj = player.civilizationAdjective;
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_3_ADVISOR_BODY_MONGOLIA_PATH", civAdj);
        } else {
          playerPathText = "LOC_TUTORIAL_MILITARY_QUEST_3_ADVISOR_BODY_GENERIC_PATH";
        }
      }
      return [playerPathText];
    }
  },
  body: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_3_BODY",
    getLocParams: (_item) => {
      let playerPathText = "";
      const pointGoal = MILITARY_QUEST_3_PTS_REQUIRED;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_3_BODY_MONGOLIA_PATH", pointGoal);
        } else {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_3_BODY_GENERIC_PATH", pointGoal);
        }
      }
      return [playerPathText];
    }
  }
};
const MILITARY_QUEST_3_PTS_REQUIRED = 4;
TutorialManager.add({
  ID: "military_victory_quest_3_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Military,
    ...militaryVictoryContent3,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "military_victory_quest_3_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "military_victory_quest_2_tracking",
      "military_victory_quest_3_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("military_victory_quest_3_tracking");
  }
});
TutorialManager.add({
  ID: "military_victory_quest_3_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_3_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_MILITARY_QUEST_3_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.MILITARY,
      order: 3,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: militaryVictoryContent3
    },
    getDescriptionLocParams: () => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      let iPointsCurrent = 0;
      const iPointsGoal = MILITARY_QUEST_3_PTS_REQUIRED;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
        if (score) {
          iPointsCurrent = score;
        }
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_3_TRACKING_BODY_MONGOLIA_PATH",
            iPointsCurrent,
            iPointsGoal
          );
        } else {
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_3_TRACKING_BODY_GENERIC_PATH",
            iPointsCurrent,
            iPointsGoal
          );
        }
      }
      return [playerPathText];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["VPChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let iPointsCurrent = 0;
    const iPointsGoal = MILITARY_QUEST_3_PTS_REQUIRED;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
      if (score) {
        iPointsCurrent = score;
      }
    }
    if (iPointsCurrent >= iPointsGoal) {
      return true;
    }
    return false;
  }
});
const militaryVictoryContent4 = {
  title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_4_ADVISOR_BODY",
    getLocParams: (_item) => {
      let civAdj = "";
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        civAdj = player.civilizationAdjective;
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_ADVISOR_BODY_MONGOLIA_PATH", civAdj);
        } else {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_ADVISOR_BODY_GENERIC_PATH", civAdj);
        }
      }
      return [playerPathText];
    }
  },
  body: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_4_BODY",
    getLocParams: (_item) => {
      let playerPathText = "";
      const pointGoal = MILITARY_QUEST_4_PTS_REQUIRED;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_BODY_MONGOLIA_PATH", pointGoal);
        } else {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_BODY_GENERIC_PATH", pointGoal);
        }
      }
      return [playerPathText];
    }
  }
};
const MILITARY_QUEST_4_PTS_REQUIRED = 8;
TutorialManager.add({
  ID: "military_victory_quest_4_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Military,
    ...militaryVictoryContent4,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "military_victory_quest_4_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "military_victory_quest_3_tracking",
      "military_victory_quest_4_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("military_victory_quest_4_tracking");
  }
});
TutorialManager.add({
  ID: "military_victory_quest_4_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_4_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_MILITARY_QUEST_4_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.MILITARY,
      order: 4,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: militaryVictoryContent4
    },
    getDescriptionLocParams: () => {
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      let iPointsCurrent = 0;
      const iPointsGoal = MILITARY_QUEST_4_PTS_REQUIRED;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
        if (score) {
          iPointsCurrent = score;
        }
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_4_TRACKING_BODY_MONGOLIA_PATH",
            iPointsCurrent,
            iPointsGoal
          );
        } else {
          playerPathText = Locale.compose(
            "LOC_TUTORIAL_MILITARY_QUEST_4_TRACKING_BODY_GENERIC_PATH",
            iPointsCurrent,
            iPointsGoal
          );
        }
      }
      return [playerPathText];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["VPChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let iPointsCurrent = 0;
    const iPointsGoal = MILITARY_QUEST_4_PTS_REQUIRED;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
      if (score) {
        iPointsCurrent = score;
      }
    }
    if (iPointsCurrent >= iPointsGoal) {
      return true;
    }
    return false;
  }
});
const militaryVictoryContent5 = {
  title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_5_ADVISOR_BODY",
    getLocParams: (_item) => {
      let civAdj = "";
      let playerPathText = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        civAdj = player.civilizationAdjective;
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_ADVISOR_BODY_MONGOLIA_PATH", civAdj);
        } else {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_ADVISOR_BODY_GENERIC_PATH", civAdj);
        }
      }
      return [playerPathText];
    }
  },
  body: {
    text: "LOC_TUTORIAL_MILITARY_QUEST_5_BODY",
    getLocParams: (_item) => {
      let playerPathText = "";
      const pointGoal = MILITARY_QUEST_5_PTS_REQUIRED;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
        if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_BODY_MONGOLIA_PATH", pointGoal);
        } else {
          playerPathText = Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_BODY_GENERIC_PATH", pointGoal);
        }
      }
      return [playerPathText];
    }
  }
};
const MILITARY_QUEST_5_PTS_REQUIRED = 12;
TutorialManager.add(
  {
    ID: "military_victory_quest_5_start",
    callout: {
      anchorPosition: TutorialAnchorPosition.MiddleCenter,
      advisorType: TutorialAdvisorType.Military,
      ...militaryVictoryContent5,
      option1: {
        callback: () => {
          QuestTracker.setQuestVictoryStateById(
            "military_victory_quest_5_tracking",
            VictoryQuestState.QUEST_IN_PROGRESS
          );
        },
        text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
        actionKey: "inline-accept",
        closes: true
      },
      option2: calloutDeclineQuest
    },
    activationCustomEvents: [QuestCompletedEventName],
    onActivateCheck: (_item) => {
      return canQuestActivate(
        "military_victory_quest_4_tracking",
        "military_victory_quest_5_tracking"
      );
    },
    onObsoleteCheck: (_item) => {
      if (Online.Metaprogression.isPlayingActiveEvent()) {
        return true;
      }
      return QuestTracker.isQuestVictoryInProgress("military_victory_quest_5_tracking");
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
TutorialManager.add(
  {
    ID: "military_victory_quest_5_tracking",
    quest: {
      title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_5_TRACKING_TITLE"),
      description: "LOC_TUTORIAL_MILITARY_QUEST_5_TRACKING_BODY",
      victory: {
        type: AdvisorTypes.MILITARY,
        order: 5,
        state: VictoryQuestState.QUEST_UNSTARTED,
        content: militaryVictoryContent5
      },
      getDescriptionLocParams: () => {
        let playerPathText = "";
        const player = Players.get(GameContext.localPlayerID);
        let iPointsCurrent = 0;
        const iPointsGoal = MILITARY_QUEST_5_PTS_REQUIRED;
        if (player) {
          const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
          if (score) {
            iPointsCurrent = score;
          }
          const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
          if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
            playerPathText = Locale.compose(
              "LOC_TUTORIAL_MILITARY_QUEST_5_TRACKING_BODY_MONGOLIA_PATH",
              iPointsCurrent,
              iPointsGoal
            );
          } else {
            playerPathText = Locale.compose(
              "LOC_TUTORIAL_MILITARY_QUEST_5_TRACKING_BODY_GENERIC_PATH",
              iPointsCurrent,
              iPointsGoal
            );
          }
        }
        return [playerPathText];
      }
    },
    runAllTurns: true,
    activationCustomEvents: ["user-interface-loaded-and-ready"],
    completionEngineEvents: ["VPChanged"],
    onCleanUp: (item) => {
      activateNextTrackedQuest(item);
    },
    onCompleteCheck: (_item) => {
      const player = Players.get(GameContext.localPlayerID);
      let iPointsCurrent = 0;
      const iPointsGoal = MILITARY_QUEST_5_PTS_REQUIRED;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_MILITARY");
        if (score) {
          iPointsCurrent = score;
        }
      }
      if (iPointsCurrent >= iPointsGoal) {
        return true;
      }
      return false;
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
TutorialManager.add({
  ID: "military_victory_quest_line_completed",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Military,
    title: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_LINE_COMPLETE_TITLE"),
    advisor: {
      text: "LOC_TUTORIAL_MILITARY_QUEST_LINE_COMPLETE_ADVISOR_BODY",
      getLocParams: (_item) => {
        let civAdj = "";
        let playerPathText = "";
        const player = Players.get(GameContext.localPlayerID);
        if (player) {
          civAdj = player.civilizationAdjective;
          const playercivDef = GameInfo.Civilizations.lookup(player.civilizationType);
          if (playercivDef != null && playercivDef.CivilizationType == "CIVILIZATION_MONGOLIA") {
            playerPathText = Locale.compose(
              "LOC_TUTORIAL_MILITARY_QUEST_LINE_COMPLETE_ADVISOR_BODY_GENERIC_PATH",
              civAdj
            );
          } else {
            playerPathText = Locale.compose(
              "LOC_TUTORIAL_MILITARY_QUEST_LINE_COMPLETE_ADVISOR_BODY_MONGOLIA_PATH",
              civAdj
            );
          }
        }
        return [playerPathText];
      }
    },
    body: {
      text: Locale.compose("LOC_TUTORIAL_MILITARY_QUEST_LINE_COMPLETE_BODY")
    },
    option1: calloutClose,
    option2: {
      callback: () => {
        ContextManager.push("screen-victory-progress", { singleton: true, createMouseGuard: true });
      },
      text: "LOC_TUTORIAL_CALLOUT_VICTORIES",
      actionKey: "inline-accept",
      closes: true
    }
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return QuestTracker.isQuestVictoryCompleted("military_victory_quest_5_tracking");
  }
});
const TARGET_NUM_SPECIALISTS = 4;
const scienceVictoryContent1 = {
  title: "LOC_TUTORIAL_SCIENCE_QUEST_1_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_SCIENCE_QUEST_1_ADVISOR_BODY"
  },
  body: {
    text: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_1_BODY", TARGET_NUM_SPECIALISTS)
  }
};
TutorialManager.add({
  ID: "science_victory_quest_1_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    ...scienceVictoryContent1,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "science_victory_quest_1_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("science_victory_quest_1_tracking");
  },
  hiders: [".tut-action-button", ".tut-action-text"],
  inputFilters: [{ inputName: "next-action" }]
});
const SCIENCE_QUEST_1_SPECIALISTS_NEEDED = 4;
TutorialManager.add({
  ID: "science_victory_quest_1_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_1_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_SCIENCE_QUEST_1_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.SCIENCE,
      order: 1,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: scienceVictoryContent1
    },
    getDescriptionLocParams: () => {
      let educationIcon = "[icon:QUEST_ITEM_OPEN]";
      let specialistsIcon = "[icon:QUEST_ITEM_OPEN]";
      let iSpecialistsCurrent = 0;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerTechs = player.Techs;
        if (playerTechs) {
          if (playerTechs?.isNodeUnlocked("NODE_TECH_EX_EDUCATION")) {
            educationIcon = "[icon:QUEST_ITEM_COMPLETED]";
          }
        }
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city) {
              if (city.Workers) {
                iSpecialistsCurrent += city.Workers.getNumWorkers(true);
              }
            }
          }
          if (iSpecialistsCurrent >= SCIENCE_QUEST_1_SPECIALISTS_NEEDED) {
            specialistsIcon = "[icon:QUEST_ITEM_COMPLETED]";
          }
        }
      }
      return [educationIcon, iSpecialistsCurrent, SCIENCE_QUEST_1_SPECIALISTS_NEEDED, specialistsIcon];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["TechNodeCompleted", "WorkerAdded", "WorkerRemoved"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    let bHasTech = false;
    let bHasSpecialists = false;
    let iSpecialistsCurrent = 0;
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerTechs = player.Techs;
      if (playerTechs) {
        if (playerTechs?.isNodeUnlocked("NODE_TECH_EX_EDUCATION")) {
          bHasTech = true;
        }
      }
      const playerCities = player.Cities?.getCities();
      if (playerCities) {
        for (let i = 0; i < playerCities.length; ++i) {
          const city = playerCities[i];
          if (city) {
            if (city.Workers) {
              iSpecialistsCurrent += city.Workers.getNumWorkers(true);
            }
          }
        }
        if (iSpecialistsCurrent >= SCIENCE_QUEST_1_SPECIALISTS_NEEDED) {
          bHasSpecialists = true;
        }
      }
    }
    if (bHasTech && bHasSpecialists) {
      return true;
    }
    return false;
  }
});
const SCIENCE_QUEST_2_SPECIALISTS_NEEDED = 2;
const SCIENCE_QUEST_2_YIELD_NEEDED = 20;
const scienceVictoryContent2 = {
  title: "LOC_TUTORIAL_SCIENCE_QUEST_2_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_SCIENCE_QUEST_2_ADVISOR_BODY"
  },
  body: {
    text: Locale.compose(
      "LOC_TUTORIAL_SCIENCE_QUEST_2_BODY",
      SCIENCE_QUEST_2_YIELD_NEEDED,
      SCIENCE_QUEST_2_SPECIALISTS_NEEDED
    )
  }
};
TutorialManager.add({
  ID: "science_victory_quest_2_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    ...scienceVictoryContent2,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "science_victory_quest_2_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("science_victory_quest_1_tracking", "science_victory_quest_2_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("science_victory_quest_2_tracking");
  }
});
TutorialManager.add({
  ID: "science_victory_quest_2_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_2_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_SCIENCE_QUEST_2_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.SCIENCE,
      order: 2,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: scienceVictoryContent2
    },
    getDescriptionLocParams: () => {
      let iCurrentYield = 0;
      let yieldNeededIcon = "[icon:QUEST_ITEM_OPEN]";
      let specialistsIcon = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerStats = player?.Stats;
        if (playerStats) {
          iCurrentYield = playerStats.getHighestDistrictYield(DistrictTypes.URBAN);
          if (iCurrentYield >= SCIENCE_QUEST_2_YIELD_NEEDED) {
            yieldNeededIcon = "[icon:QUEST_ITEM_COMPLETED]";
          }
        }
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city && city.Workers) {
              const cityplots = city.getPurchasedPlots();
              for (let i2 = 0; i2 < cityplots.length; ++i2) {
                if (city.Workers.getNumWorkersAtPlot(cityplots[i2]) >= SCIENCE_QUEST_2_SPECIALISTS_NEEDED) {
                  specialistsIcon = "[icon:QUEST_ITEM_COMPLETED]";
                }
              }
            }
          }
        }
      }
      return [
        iCurrentYield,
        SCIENCE_QUEST_2_YIELD_NEEDED,
        yieldNeededIcon,
        SCIENCE_QUEST_2_SPECIALISTS_NEEDED,
        specialistsIcon
      ];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["PlayerTurnActivated", "WorkerAdded", "WorkerRemoved"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    let bHasYield = false;
    let bHasSpecialists = false;
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerStats = player?.Stats;
      if (playerStats) {
        if (playerStats.getNumDistrictWithXValue(SCIENCE_QUEST_2_YIELD_NEEDED, DistrictTypes.URBAN) >= 1) {
          bHasYield = true;
        }
      }
      const playerCities = player.Cities?.getCities();
      if (playerCities) {
        for (let i = 0; i < playerCities.length; ++i) {
          const city = playerCities[i];
          if (city && city.Workers) {
            const cityplots = city.getPurchasedPlots();
            for (let i2 = 0; i2 < cityplots.length; ++i2) {
              if (city.Workers.getNumWorkersAtPlot(cityplots[i2]) >= SCIENCE_QUEST_2_SPECIALISTS_NEEDED) {
                bHasSpecialists = true;
              }
            }
          }
        }
      }
    }
    if (bHasYield && bHasSpecialists) {
      return true;
    }
    return false;
  }
});
const SCIENCE_QUEST_3_YIELD_NEEDED = 40;
const scienceVictoryContent3 = {
  title: "LOC_TUTORIAL_SCIENCE_QUEST_3_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_SCIENCE_QUEST_3_ADVISOR_BODY"
  },
  body: {
    text: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_3_BODY", SCIENCE_QUEST_3_YIELD_NEEDED)
  }
};
TutorialManager.add({
  ID: "science_victory_quest_3_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    ...scienceVictoryContent3,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "science_victory_quest_3_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("science_victory_quest_2_tracking", "science_victory_quest_3_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("science_victory_quest_3_tracking");
  }
});
TutorialManager.add({
  ID: "science_victory_quest_3_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_3_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_SCIENCE_QUEST_3_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.SCIENCE,
      order: 3,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: scienceVictoryContent3
    },
    getDescriptionLocParams: () => {
      let iYieldCurrent = 0;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerStats = player?.Stats;
        if (playerStats) {
          iYieldCurrent = playerStats.getHighestDistrictYield(DistrictTypes.URBAN);
        }
      }
      return [iYieldCurrent, SCIENCE_QUEST_3_YIELD_NEEDED];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["PlayerTurnActivated", "WorkerAdded", "WorkerRemoved"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    let iYieldCurrent = 0;
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerStats = player?.Stats;
      if (playerStats) {
        iYieldCurrent = playerStats.getHighestDistrictYield(DistrictTypes.URBAN);
      }
    }
    if (iYieldCurrent >= SCIENCE_QUEST_3_YIELD_NEEDED) {
      return true;
    }
    return false;
  }
});
const SCIENCE_QUEST_4_YIELD_NEEDED = 40;
const SCIENCE_QUEST_4_TILES_NEEDED = 3;
const scienceVictoryContent4 = {
  title: "LOC_TUTORIAL_SCIENCE_QUEST_4_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_SCIENCE_QUEST_4_ADVISOR_BODY"
  },
  body: {
    text: Locale.compose(
      "LOC_TUTORIAL_SCIENCE_QUEST_4_BODY",
      SCIENCE_QUEST_4_YIELD_NEEDED,
      SCIENCE_QUEST_4_TILES_NEEDED
    )
  }
};
TutorialManager.add({
  ID: "science_victory_quest_4_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    ...scienceVictoryContent4,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "science_victory_quest_4_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("science_victory_quest_3_tracking", "science_victory_quest_4_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("science_victory_quest_4_tracking");
  }
});
TutorialManager.add({
  ID: "science_victory_quest_4_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_4_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_SCIENCE_QUEST_4_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.SCIENCE,
      order: 4,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: scienceVictoryContent4
    },
    getDescriptionLocParams: () => {
      let iNumCurrentTiles = 0;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerStats = player?.Stats;
        if (playerStats) {
          iNumCurrentTiles = playerStats.getNumDistrictWithXValue(
            SCIENCE_QUEST_4_YIELD_NEEDED,
            DistrictTypes.URBAN
          );
        }
      }
      return [SCIENCE_QUEST_4_YIELD_NEEDED, iNumCurrentTiles, SCIENCE_QUEST_4_TILES_NEEDED];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["PlayerTurnActivated", "WorkerAdded", "WorkerRemoved"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerStats = player?.Stats;
      if (playerStats) {
        if (playerStats.getNumDistrictWithXValue(SCIENCE_QUEST_4_YIELD_NEEDED, DistrictTypes.URBAN) >= SCIENCE_QUEST_4_TILES_NEEDED) {
          return true;
        }
      }
    }
    return false;
  }
});
const SCIENCE_QUEST_5_YIELD_NEEDED = 40;
const SCIENCE_QUEST_5_TILES_NEEDED = 5;
const scienceVictoryContent5 = {
  title: "LOC_TUTORIAL_SCIENCE_QUEST_5_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_SCIENCE_QUEST_5_ADVISOR_BODY"
  },
  body: {
    text: Locale.compose(
      "LOC_TUTORIAL_SCIENCE_QUEST_5_BODY",
      SCIENCE_QUEST_5_YIELD_NEEDED,
      SCIENCE_QUEST_5_TILES_NEEDED
    )
  }
};
TutorialManager.add({
  ID: "science_victory_quest_5_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    ...scienceVictoryContent5,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "science_victory_quest_5_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("science_victory_quest_4_tracking", "science_victory_quest_5_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("science_victory_quest_5_tracking");
  }
});
TutorialManager.add({
  ID: "science_victory_quest_5_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_SCIENCE_QUEST_5_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_SCIENCE_QUEST_5_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.SCIENCE,
      order: 5,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: scienceVictoryContent5
    },
    getDescriptionLocParams: () => {
      let iNumCurrentTiles = 0;
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerStats = player?.Stats;
        if (playerStats) {
          iNumCurrentTiles = playerStats.getNumDistrictWithXValue(
            SCIENCE_QUEST_5_YIELD_NEEDED,
            DistrictTypes.URBAN
          );
        }
      }
      return [SCIENCE_QUEST_5_YIELD_NEEDED, iNumCurrentTiles, SCIENCE_QUEST_5_TILES_NEEDED];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["PlayerTurnActivated", "WorkerAdded", "WorkerRemoved"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerStats = player?.Stats;
      if (playerStats) {
        if (playerStats.getNumDistrictWithXValue(SCIENCE_QUEST_5_YIELD_NEEDED, DistrictTypes.URBAN) >= SCIENCE_QUEST_5_TILES_NEEDED) {
          return true;
        }
      }
    }
    return false;
  }
});
TutorialManager.add({
  ID: "science_victory_quest_line_completed",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Science,
    title: "LOC_TUTORIAL_SCIENCE_QUEST_LINE_COMPLETED_TITLE",
    advisor: {
      text: "LOC_TUTORIAL_SCIENCE_QUEST_LINE_COMPLETED_ADVISOR_BODY",
      getLocParams: (_item) => {
        let civAdj = "";
        const player = Players.get(GameContext.localPlayerID);
        if (player) {
          civAdj = player.civilizationAdjective;
        }
        return [civAdj];
      }
    },
    body: {
      text: "LOC_TUTORIAL_SCIENCE_QUEST_LINE_COMPLETED_BODY"
    },
    option1: calloutClose,
    option2: {
      callback: () => {
        ContextManager.push("screen-victory-progress", { singleton: true, createMouseGuard: true });
      },
      text: "LOC_TUTORIAL_CALLOUT_VICTORIES",
      actionKey: "inline-accept",
      closes: true
    }
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return QuestTracker.isQuestVictoryCompleted("science_victory_quest_5_tracking");
  }
});
const cultureVictoryContent1 = {
  title: "LOC_TUTORIAL_CULTURE_QUEST_1_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_1_ADVISOR_BODY",
    getLocParams: (_item) => {
      let civAdj = "null";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        civAdj = player.civilizationAdjective;
      }
      return [civAdj];
    }
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_1_BODY"
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_1_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent1,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_1_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_1_tracking");
  },
  hiders: [".tut-action-button", ".tut-action-text"],
  inputFilters: [{ inputName: "next-action" }]
});
TutorialManager.add({
  ID: "culture_victory_quest_1_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_1_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_1_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 1,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent1
    },
    getDescriptionLocParams: () => {
      let pietyStudied = "[icon:QUEST_ITEM_OPEN]";
      let templeComplete = "[icon:QUEST_ITEM_OPEN]";
      let religionFounded = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city) {
              if (city.Constructibles?.hasConstructible("BUILDING_TEMPLE", false)) {
                templeComplete = "[icon:QUEST_ITEM_COMPLETED]";
                break;
              }
            }
          }
        }
        if (player.Culture?.isNodeUnlocked("NODE_CIVIC_EX_MAIN_PIETY")) {
          pietyStudied = "[icon:QUEST_ITEM_COMPLETED]";
        }
        const playerReligion = player.Religion;
        if (playerReligion != void 0 && playerReligion.hasCreatedReligion() == true) {
          religionFounded = "[icon:QUEST_ITEM_COMPLETED]";
        }
      }
      return [pietyStudied, templeComplete, religionFounded];
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: [
    "ConstructibleBuildCompleted",
    "ConstructibleAddedtoMap",
    "ReligionFounded",
    "CultureNodeCompleted"
  ],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    if (TutorialManager.activatingEventName == "ReligionFounded") {
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        const playerReligion = player.Religion;
        if (playerReligion != void 0) {
          return true;
        }
      }
    }
    return false;
  }
});
const cultureVictoryContent2 = {
  title: "LOC_TUTORIAL_CULTURE_QUEST_2_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_2_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_2_BODY",
    getLocParams: () => {
      let missionaryName = "NO_UNIT";
      let missionaryIcon = "NO_ICON";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const missionary = player.Units.getBuildUnit("UNIT_MISSIONARY");
        const missionaryDef = GameInfo.Units.lookup(missionary);
        if (missionaryDef) {
          missionaryIcon = "[icon:" + missionaryDef.UnitType + "]";
          missionaryName = missionaryDef.Name;
        }
      }
      return [missionaryIcon, missionaryName];
    }
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_2_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent2,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_2_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("culture_victory_quest_1_tracking", "culture_victory_quest_2_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_2_tracking");
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_2_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_2_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_2_TRACKING_BODY",
    getDescriptionLocParams: () => {
      let missionaryName = "";
      let missionaryIcon = "";
      let missionaryTrained = "[icon:QUEST_ITEM_OPEN]";
      let settlementConverted = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const missionary = player.Units.getBuildUnit("UNIT_MISSIONARY");
        const missionaryDef = GameInfo.Units.lookup(missionary);
        if (missionaryDef) {
          missionaryIcon = "[icon:" + missionaryDef.UnitType + "]";
          missionaryName = missionaryDef.Name;
          const missionaryCount = player.Units.getNumUnitsOfType(missionaryDef.UnitType);
          if (missionaryCount > 0) {
            missionaryTrained = "[icon:QUEST_ITEM_COMPLETED]";
          }
        }
        if (QuestTracker.isQuestVictoryCompleted("culture_victory_quest_2_tracking")) {
          settlementConverted = "[icon:QUEST_ITEM_COMPLETED]";
        }
      }
      return [missionaryIcon, missionaryName, missionaryTrained, settlementConverted];
    },
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 2,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent2
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["UnitAddedToMap", "CityReligionChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player && TutorialManager.activatingEventName == "CityReligionChanged") {
      const activationEventData = TutorialManager.activatingEvent;
      if (activationEventData) {
        const thisCity = Cities.get(activationEventData.cityID);
        if (thisCity?.Religion?.majorityReligion == player.Religion?.getReligionType() && thisCity?.owner != player.id) {
          return true;
        }
      }
    }
    return false;
  }
});
const CULTURE_QUEST_3_RELIC_GOAL = 1;
const cultureVictoryContent3 = {
  title: "LOC_TUTORIAL_CULTURE_QUEST_3_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_3_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_3_BODY",
    getLocParams: (_item) => {
      return [CULTURE_QUEST_3_RELIC_GOAL];
    }
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_3_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent3,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_3_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("culture_victory_quest_2_tracking", "culture_victory_quest_3_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_3_tracking");
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_3_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_3_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_3_TRACKING_BODY",
    getDescriptionLocParams: () => {
      let theologyStudied = "[icon:QUEST_ITEM_OPEN]";
      let hasEnhancerBelief = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        if (player.Culture?.isNodeUnlocked("NODE_CIVIC_EX_BRANCH_THEOLOGY")) {
          theologyStudied = "[icon:QUEST_ITEM_COMPLETED]";
        }
        const playerBeliefs = player.Religion?.getBeliefs();
        if (playerBeliefs) {
          for (const belief of playerBeliefs) {
            const beliefDef = GameInfo.Beliefs.lookup(belief);
            if (beliefDef?.BeliefClassType == "BELIEF_CLASS_ENHANCER") {
              hasEnhancerBelief = "[icon:QUEST_ITEM_COMPLETED]";
              break;
            }
          }
        }
      }
      return [theologyStudied, hasEnhancerBelief];
    },
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 3,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent3
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["CultureNodeCompleted", "interface-mode-changed", "OnContextManagerClose"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerBeliefs = player.Religion?.getBeliefs();
      if (playerBeliefs) {
        for (const belief of playerBeliefs) {
          const beliefDef = GameInfo.Beliefs.lookup(belief);
          if (beliefDef?.BeliefClassType == "BELIEF_CLASS_ENHANCER") {
            return true;
          }
        }
      }
    }
    return false;
  }
});
const CULTURE_QUEST_4_RELIC_GOAL = 6;
const cultureVictoryContent4 = {
  title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_4_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_4_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_4_BODY"
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_4_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent4,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_4_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("culture_victory_quest_3_tracking", "culture_victory_quest_4_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_4_tracking");
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_4_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_4_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_4_TRACKING_BODY",
    getDescriptionLocParams: () => {
      const player = Players.get(GameContext.localPlayerID);
      let iRelicCurrent = 0;
      const iRelicGoal = CULTURE_QUEST_4_RELIC_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
        if (score) {
          iRelicCurrent = score;
        }
      }
      return [iRelicCurrent, iRelicGoal];
    },
    cancelable: true,
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 4,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent4
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["GreatWorkMoved", "GreatWorkCreated", "VPChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let questMet = false;
    let iRelicCurrent = 0;
    const iRelicGoal = CULTURE_QUEST_4_RELIC_GOAL;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
      if (score) {
        iRelicCurrent = score;
      }
    }
    if (iRelicCurrent >= iRelicGoal) {
      questMet = true;
    }
    return questMet;
  }
});
const CULTURE_QUEST_5_RELIC_GOAL = 9;
const cultureVictoryContent5 = {
  title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_5_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_5_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_5_BODY"
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_5_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent5,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_5_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("culture_victory_quest_4_tracking", "culture_victory_quest_5_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_5_tracking");
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_5_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_5_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_5_TRACKING_BODY",
    cancelable: true,
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 5,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent5
    },
    getDescriptionLocParams: () => {
      const player = Players.get(GameContext.localPlayerID);
      let iRelicCurrent = 0;
      const iRelicGoal = CULTURE_QUEST_5_RELIC_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
        if (score) {
          iRelicCurrent = score;
        }
      }
      return [iRelicCurrent, iRelicGoal];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["GreatWorkMoved", "GreatWorkCreated"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let questMet = false;
    let iRelicCurrent = 0;
    const iRelicGoal = CULTURE_QUEST_5_RELIC_GOAL;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
      if (score) {
        iRelicCurrent = score;
      }
    }
    if (iRelicCurrent >= iRelicGoal) {
      questMet = true;
    }
    return questMet;
  }
});
const CULTURE_QUEST_6_RELIC_GOAL = 12;
const cultureVictoryContent6 = {
  title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_6_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_6_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_CULTURE_QUEST_6_BODY"
  }
};
TutorialManager.add({
  ID: "culture_victory_quest_6_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...cultureVictoryContent6,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "culture_victory_quest_6_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate("culture_victory_quest_5_tracking", "culture_victory_quest_6_tracking");
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("culture_victory_quest_6_tracking");
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_6_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_CULTURE_QUEST_6_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_CULTURE_QUEST_6_TRACKING_BODY",
    cancelable: true,
    victory: {
      type: AdvisorTypes.CULTURE,
      order: 6,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: cultureVictoryContent6
    },
    getDescriptionLocParams: () => {
      const player = Players.get(GameContext.localPlayerID);
      let iRelicCurrent = 0;
      const iRelicGoal = CULTURE_QUEST_6_RELIC_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
        if (score) {
          iRelicCurrent = score;
        }
      }
      return [iRelicCurrent, iRelicGoal];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["GreatWorkMoved", "GreatWorkCreated"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let questMet = false;
    let iRelicCurrent = 0;
    const iRelicGoal = CULTURE_QUEST_6_RELIC_GOAL;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_CULTURE");
      if (score) {
        iRelicCurrent = score;
      }
    }
    if (iRelicCurrent >= iRelicGoal) {
      questMet = true;
    }
    return questMet;
  }
});
TutorialManager.add({
  ID: "culture_victory_quest_line_completed",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    title: "LOC_TUTORIAL_CULTURE_QUEST_LINE_COMPLETED_TITLE",
    advisor: {
      text: "LOC_TUTORIAL_CULTURE_QUEST_LINE_COMPLETED_ADVISOR_BODY"
    },
    body: {
      text: "LOC_TUTORIAL_CULTURE_QUEST_LINE_COMPLETED_BODY"
    },
    option1: calloutClose,
    option2: {
      callback: () => {
        ContextManager.push("screen-victory-progress", { singleton: true, createMouseGuard: true });
      },
      text: "LOC_TUTORIAL_CALLOUT_VICTORIES",
      actionKey: "inline-accept",
      closes: true
    }
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return QuestTracker.isQuestVictoryCompleted("culture_victory_quest_6_tracking");
  }
});
const economicVictoryContent1 = {
  title: "LOC_TUTORIAL_ECONOMIC_QUEST_1_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_1_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_1_BODY",
    getLocParams: () => {
      let commanderIcon = "";
      let commanderName = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const fleetCommander = player.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
        const commanderDef = GameInfo.Units.lookup(fleetCommander);
        if (commanderDef) {
          commanderIcon = "[icon:" + commanderDef.UnitType + "]";
          commanderName = commanderDef.Name;
        }
      }
      return [commanderIcon, commanderName];
    }
  }
};
TutorialManager.add({
  ID: "economic_victory_quest_1_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Economic,
    ...economicVictoryContent1,
    option1: {
      callback: () => {
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true,
      nextID: "economic_victory_quest_1_tracking"
    },
    option2: calloutDeclineQuest
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_1_tracking");
  },
  onCleanUp: () => {
    QuestTracker.setQuestVictoryStateById("economic_victory_quest_1_tracking", VictoryQuestState.QUEST_IN_PROGRESS);
  },
  hiders: [".tut-action-button", ".tut-action-text"],
  inputFilters: [{ inputName: "next-action" }]
});
TutorialManager.add({
  ID: "economic_victory_quest_1_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_1_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_ECONOMIC_QUEST_1_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.ECONOMIC,
      order: 1,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: economicVictoryContent1
    },
    getDescriptionLocParams: () => {
      let cartographyResearched = "[icon:QUEST_ITEM_OPEN]";
      let astronomyResearched = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player) {
        if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_CARTOGRAPHY")) {
          cartographyResearched = "[icon:QUEST_ITEM_COMPLETED]";
        }
        if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_ASTRONOMY")) {
          astronomyResearched = "[icon:QUEST_ITEM_COMPLETED]";
        }
      }
      return [cartographyResearched, astronomyResearched];
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["TechNodeCompleted"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      if (player.Techs?.isNodeUnlocked("NODE_TECH_EX_CARTOGRAPHY") && player.Techs?.isNodeUnlocked("NODE_TECH_EX_ASTRONOMY")) {
        return true;
      }
    }
    return false;
  }
});
const economicVictoryContent2 = {
  title: "LOC_TUTORIAL_ECONOMIC_QUEST_2_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_2_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_2_BODY",
    getLocParams: () => {
      let commanderIcon = "";
      let commanderName = "";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const fleetCommander = player.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
        const commanderDef = GameInfo.Units.lookup(fleetCommander);
        if (commanderDef) {
          commanderIcon = "[icon:" + commanderDef.UnitType + "]";
          commanderName = commanderDef.Name;
        }
      }
      return [commanderIcon, commanderName];
    }
  }
};
TutorialManager.add({
  ID: "economic_victory_quest_2_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Economic,
    ...economicVictoryContent2,
    option1: calloutBegin
  },
  onCleanUp: () => {
    QuestTracker.setQuestVictoryStateById("economic_victory_quest_2_tracking", VictoryQuestState.QUEST_IN_PROGRESS);
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "economic_victory_quest_1_tracking",
      "economic_victory_quest_2_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_2_tracking");
  }
});
TutorialManager.add({
  ID: "economic_victory_quest_2_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_2_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_ECONOMIC_QUEST_2_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.ECONOMIC,
      order: 2,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: economicVictoryContent2
    },
    getDescriptionLocParams: () => {
      let commanderIcon = "";
      let commanderName = "";
      let settlementInDistantLands = "[icon:QUEST_ITEM_OPEN]";
      let treasureResource = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city != null && city.isDistantLands) {
              settlementInDistantLands = "[icon:QUEST_ITEM_COMPLETED]";
              if (city.Resources != null) {
                if (city.Resources.getNumTreasureFleetResources(false) > 0) {
                  treasureResource = "[icon:QUEST_ITEM_COMPLETED]";
                }
              }
            }
          }
        }
        const fleetCommander = player.Units.getBuildUnit("UNIT_FLEET_COMMANDER");
        const commanderDef = GameInfo.Units.lookup(fleetCommander);
        if (commanderDef) {
          commanderIcon = "[icon:" + commanderDef.UnitType + "]";
          commanderName = commanderDef.Name;
        }
      }
      return [settlementInDistantLands, treasureResource, commanderIcon, commanderName];
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["ConstructibleAddedToMap", "CityProductionCompleted", "CityAddedToMap", "UnitPromoted"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const playerCities = player.Cities?.getCities();
      if (playerCities) {
        for (let i = 0; i < playerCities.length; ++i) {
          const city = playerCities[i];
          if (city != null && city.isDistantLands) {
            if (city.Resources != null) {
              if (city.Resources.getNumTreasureFleetResources(false) > 0) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
});
const economicVictoryContent3 = {
  title: "LOC_TUTORIAL_ECONOMIC_QUEST_3_TITLE",
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_3_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_3_BODY"
  }
};
TutorialManager.add({
  ID: "economic_victory_quest_3_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Economic,
    ...economicVictoryContent3,
    option1: calloutBegin
  },
  onCleanUp: () => {
    QuestTracker.setQuestVictoryStateById("economic_victory_quest_3_tracking", VictoryQuestState.QUEST_IN_PROGRESS);
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "economic_victory_quest_2_tracking",
      "economic_victory_quest_3_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_3_tracking");
  }
});
const ECONOMIC_QUEST_4_RESOURCE_GOAL = 5;
TutorialManager.add({
  ID: "economic_victory_quest_3_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_3_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_ECONOMIC_QUEST_3_TRACKING_BODY",
    victory: {
      type: AdvisorTypes.ECONOMIC,
      order: 3,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: economicVictoryContent3
    },
    getDescriptionLocParams: () => {
      let itreasureResourcesImproved = 0;
      const itreasureResourcesGoal = ECONOMIC_QUEST_4_RESOURCE_GOAL;
      const treasureFleetCreated = "[icon:QUEST_ITEM_OPEN]";
      const player = Players.get(GameContext.localPlayerID);
      if (player && player.Units) {
        const playerCities = player.Cities?.getCities();
        if (playerCities) {
          for (let i = 0; i < playerCities.length; ++i) {
            const city = playerCities[i];
            if (city != null && city.isDistantLands && city.Resources)
              itreasureResourcesImproved += city.Resources.getNumTreasureFleetResources(false);
          }
        }
      }
      return [itreasureResourcesImproved, itreasureResourcesGoal, treasureFleetCreated];
    },
    cancelable: true
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["UnitAddedToMap", "CityTileOwnershipChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    if (player && player.Units) {
      const playerUnits = player.Units.getUnits();
      for (let i = 0; i < playerUnits.length; ++i) {
        const thisUnit = playerUnits[i];
        const unitDefinition = GameInfo.Units.lookup(thisUnit.type);
        if (thisUnit != null && unitDefinition != null && unitDefinition.UnitType == "UNIT_TREASURE_FLEET") {
          return true;
          break;
        }
      }
    }
    return false;
  }
});
const economicVictoryContent4 = {
  title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_4_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_4_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_4_BODY"
  }
};
const ECONOMIC_QUEST_4_TREASURE_GOAL = 10;
TutorialManager.add({
  ID: "economic_victory_quest_4_start",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Culture,
    ...economicVictoryContent4,
    option1: {
      callback: () => {
        QuestTracker.setQuestVictoryStateById(
          "economic_victory_quest_4_tracking",
          VictoryQuestState.QUEST_IN_PROGRESS
        );
      },
      text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
      actionKey: "inline-accept",
      closes: true
    },
    option2: calloutDeclineQuest
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return canQuestActivate(
      "economic_victory_quest_3_tracking",
      "economic_victory_quest_4_tracking"
    );
  },
  onObsoleteCheck: (_item) => {
    if (Online.Metaprogression.isPlayingActiveEvent()) {
      return true;
    }
    return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_4_tracking");
  }
});
TutorialManager.add({
  ID: "economic_victory_quest_4_tracking",
  quest: {
    title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_4_TRACKING_TITLE"),
    description: "LOC_TUTORIAL_ECONOMIC_QUEST_4_TRACKING_BODY",
    getDescriptionLocParams: () => {
      const player = Players.get(GameContext.localPlayerID);
      let iTreasureVPCurrent = 0;
      const iTreasureVPGoal = ECONOMIC_QUEST_4_TREASURE_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
        if (score) {
          iTreasureVPCurrent = score;
        }
      }
      return [iTreasureVPCurrent, iTreasureVPGoal];
    },
    cancelable: true,
    victory: {
      type: AdvisorTypes.ECONOMIC,
      order: 4,
      state: VictoryQuestState.QUEST_UNSTARTED,
      content: economicVictoryContent4
    }
  },
  runAllTurns: true,
  activationCustomEvents: ["user-interface-loaded-and-ready"],
  completionEngineEvents: ["VPChanged"],
  onCleanUp: (item) => {
    activateNextTrackedQuest(item);
  },
  onCompleteCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    let questMet = false;
    let iTreasureVPCurrent = 0;
    const iTreasureVPGoal = ECONOMIC_QUEST_4_TREASURE_GOAL;
    if (player) {
      const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
      if (score) {
        iTreasureVPCurrent = score;
      }
    }
    if (iTreasureVPCurrent >= iTreasureVPGoal) {
      questMet = true;
    }
    return questMet;
  }
});
const ECONOMIC_QUEST_5_TREASURE_GOAL = 20;
const economicVictoryContent5 = {
  title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_5_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_5_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_5_BODY"
  }
};
TutorialManager.add(
  {
    ID: "economic_victory_quest_5_start",
    callout: {
      anchorPosition: TutorialAnchorPosition.MiddleCenter,
      advisorType: TutorialAdvisorType.Culture,
      ...economicVictoryContent5,
      option1: {
        callback: () => {
          QuestTracker.setQuestVictoryStateById(
            "economic_victory_quest_5_tracking",
            VictoryQuestState.QUEST_IN_PROGRESS
          );
        },
        text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
        actionKey: "inline-accept",
        closes: true
      },
      option2: calloutDeclineQuest
    },
    activationCustomEvents: [QuestCompletedEventName],
    onActivateCheck: (_item) => {
      return canQuestActivate(
        "economic_victory_quest_4_tracking",
        "economic_victory_quest_5_tracking"
      );
    },
    onObsoleteCheck: (_item) => {
      if (Online.Metaprogression.isPlayingActiveEvent()) {
        return true;
      }
      return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_5_tracking");
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
TutorialManager.add(
  {
    ID: "economic_victory_quest_5_tracking",
    quest: {
      title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_5_TRACKING_TITLE"),
      description: "LOC_TUTORIAL_ECONOMIC_QUEST_5_TRACKING_BODY",
      cancelable: true,
      victory: {
        type: AdvisorTypes.ECONOMIC,
        order: 5,
        state: VictoryQuestState.QUEST_UNSTARTED,
        content: economicVictoryContent5
      },
      getDescriptionLocParams: () => {
        const player = Players.get(GameContext.localPlayerID);
        let iTreasureVPCurrent = 0;
        const iTreasureVPGoal = ECONOMIC_QUEST_5_TREASURE_GOAL;
        if (player) {
          const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
          if (score) {
            iTreasureVPCurrent = score;
          }
        }
        return [iTreasureVPCurrent, iTreasureVPGoal];
      }
    },
    runAllTurns: true,
    activationCustomEvents: ["user-interface-loaded-and-ready"],
    completionEngineEvents: ["VPChanged"],
    onCleanUp: (item) => {
      activateNextTrackedQuest(item);
    },
    onCompleteCheck: (_item) => {
      const player = Players.get(GameContext.localPlayerID);
      let questMet = false;
      let iTreasureVPCurrent = 0;
      const iTreasureVPGoal = ECONOMIC_QUEST_5_TREASURE_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
        if (score) {
          iTreasureVPCurrent = score;
        }
      }
      if (iTreasureVPCurrent >= iTreasureVPGoal) {
        questMet = true;
      }
      return questMet;
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
const ECONOMIC_QUEST_6_TREASURE_GOAL = 30;
const economicVictoryContent6 = {
  title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_6_TITLE"),
  advisor: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_6_ADVISOR_BODY"
  },
  body: {
    text: "LOC_TUTORIAL_ECONOMIC_QUEST_6_BODY"
  }
};
TutorialManager.add(
  {
    ID: "economic_victory_quest_6_start",
    callout: {
      anchorPosition: TutorialAnchorPosition.MiddleCenter,
      advisorType: TutorialAdvisorType.Culture,
      ...economicVictoryContent6,
      option1: {
        callback: () => {
          QuestTracker.setQuestVictoryStateById(
            "economic_victory_quest_6_tracking",
            VictoryQuestState.QUEST_IN_PROGRESS
          );
        },
        text: "LOC_TUTORIAL_CALLOUT_ACCEPT_QUEST",
        actionKey: "inline-accept",
        closes: true
      },
      option2: calloutDeclineQuest
    },
    activationCustomEvents: [QuestCompletedEventName],
    onActivateCheck: (_item) => {
      return canQuestActivate(
        "economic_victory_quest_5_tracking",
        "economic_victory_quest_6_tracking"
      );
    },
    onObsoleteCheck: (_item) => {
      if (Online.Metaprogression.isPlayingActiveEvent()) {
        return true;
      }
      return QuestTracker.isQuestVictoryInProgress("economic_victory_quest_6_tracking");
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
TutorialManager.add(
  {
    ID: "economic_victory_quest_6_tracking",
    quest: {
      title: Locale.compose("LOC_TUTORIAL_ECONOMIC_QUEST_6_TRACKING_TITLE"),
      description: "LOC_TUTORIAL_ECONOMIC_QUEST_6_TRACKING_BODY",
      cancelable: true,
      victory: {
        type: AdvisorTypes.ECONOMIC,
        order: 6,
        state: VictoryQuestState.QUEST_UNSTARTED,
        content: economicVictoryContent6
      },
      getDescriptionLocParams: () => {
        const player = Players.get(GameContext.localPlayerID);
        let iTreasureVPCurrent = 0;
        const iTreasureVPGoal = ECONOMIC_QUEST_6_TREASURE_GOAL;
        if (player) {
          const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
          if (score) {
            iTreasureVPCurrent = score;
          }
        }
        return [iTreasureVPCurrent, iTreasureVPGoal];
      }
    },
    runAllTurns: true,
    activationCustomEvents: ["user-interface-loaded-and-ready"],
    completionEngineEvents: ["VPChanged"],
    onCleanUp: (item) => {
      activateNextTrackedQuest(item);
    },
    onCompleteCheck: (_item) => {
      const player = Players.get(GameContext.localPlayerID);
      let questMet = false;
      let iTreasureVPCurrent = 0;
      const iTreasureVPGoal = ECONOMIC_QUEST_6_TREASURE_GOAL;
      if (player) {
        const score = player.LegacyPaths?.getScore("LEGACY_PATH_EXPLORATION_ECONOMIC");
        if (score) {
          iTreasureVPCurrent = score;
        }
      }
      if (iTreasureVPCurrent >= iTreasureVPGoal) {
        questMet = true;
      }
      return questMet;
    }
  },
  { version: 0, canDeliver: isNotLiveEventPlayer }
);
TutorialManager.add({
  ID: "economic_victory_quest_line_completed",
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    advisorType: TutorialAdvisorType.Economic,
    title: "LOC_TUTORIAL_ECONOMIC_QUEST_LINE_COMPLETED_TITLE",
    advisor: {
      text: "LOC_TUTORIAL_ECONOMIC_QUEST_LINE_COMPLETED_ADVISOR_BODY"
    },
    body: {
      text: "LOC_TUTORIAL_ECONOMIC_QUEST_LINE_COMPLETED_BODY"
    },
    option1: calloutClose,
    option2: {
      callback: () => {
        ContextManager.push("screen-victory-progress", { singleton: true, createMouseGuard: true });
      },
      text: "LOC_TUTORIAL_CALLOUT_VICTORIES",
      actionKey: "inline-accept",
      closes: true
    }
  },
  activationCustomEvents: [QuestCompletedEventName],
  onActivateCheck: (_item) => {
    return QuestTracker.isQuestVictoryCompleted("economic_victory_quest_6_tracking");
  }
});
TutorialManager.process("exploration quest items");
//# sourceMappingURL=tutorial-quest-items-exploration.js.map
