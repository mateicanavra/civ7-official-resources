import { TutorialAnchorPosition } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';

const _calloutBegin = {
  callback: () => {
    return;
  },
  text: "LOC_TUTORIAL_CALLOUT_BEGIN",
  actionKey: "inline-accept",
  closes: true
};
const calloutClose = {
  callback: () => {
    return;
  },
  text: "LOC_TUTORIAL_CALLOUT_CLOSE",
  actionKey: "inline-cancel",
  closes: true
};
const _calloutContinue = {
  callback: () => {
    return;
  },
  text: "LOC_TUTORIAL_CALLOUT_CONTINUE",
  actionKey: "inline-accept",
  closes: true
};
TutorialManager.add({
  ID: "tutorial_syncretism_available",
  filterPlayers: [],
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleRight,
    title: "LOC_TUTORIAL_SYNCRETISM_AVAILABLE_TITLE",
    body: {
      text: "LOC_TUTORIAL_SYNCRETISM_AVAILABLE_BODY"
    },
    option1: calloutClose
  },
  activationCustomEvents: ["OnContextManagerOpen_screen-culture-tree-chooser"],
  onActivateCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (player) {
      const civInfo = GameInfo.Civilizations.lookup(player.civilizationType);
      if (civInfo?.ApexAge != null) {
        const apexAge = GameInfo.Ages.lookup(civInfo.ApexAge);
        if (apexAge == currentAge) {
          return false;
        } else {
          let syncretismNode = null;
          if (currentAge?.AgeType == "AGE_ANTIQUITY") {
            syncretismNode = Game.ProgressionTrees.getNode(player.id, "NODE_CIVIC_AQ_SYNCRETISM_CHOICE");
          } else if (currentAge?.AgeType == "AGE_EXPLORATION") {
            syncretismNode = Game.ProgressionTrees.getNode(player.id, "NODE_CIVIC_EX_SYNCRETISM_CHOICE");
          } else {
            syncretismNode = Game.ProgressionTrees.getNode(player.id, "NODE_CIVIC_MO_SYNCRETISM_CHOICE");
          }
          const playerCulture = player.Culture;
          if (playerCulture != null && syncretismNode != null) {
            const availableNodes = playerCulture.getAllAvailableNodeTypes();
            if (availableNodes.length != 0) {
              for (const node of availableNodes) {
                const thisNode = Game.ProgressionTrees.getNode(player.id, node);
                if (thisNode?.nodeType == syncretismNode.nodeType) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  },
  completionEngineEvents: ["CultureTreeChanged", "OnContextManagerClose", "CultureTargetChanged"]
});
TutorialManager.add({
  ID: "tutorial_syncretism_screen",
  filterPlayers: [],
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleCenter,
    title: "LOC_TUTORIAL_SYNCRETISM_SCREEN_TITLE",
    body: {
      text: "LOC_TUTORIAL_SYNCRETISM_SCREEN_BODY"
    },
    option1: calloutClose
  },
  activationCustomEvents: ["OnContextManagerOpen_screen-syncretism"],
  completionCustomEvents: ["interface-mode-changed", "OnContextManagerClose"]
});
TutorialManager.add({
  ID: "tutorial_apex_age",
  filterPlayers: [],
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleRight,
    title: "LOC_TUTORIAL_APEX_AGE_TITLE",
    body: {
      text: "LOC_TUTORIAL_APEX_AGE_BODY",
      getLocParams: (_item) => {
        let futureAgeInfo = "ERROR NO STRING FOUND";
        if (Game.AgeProgressManager.isFinalAge) {
          futureAgeInfo = "LOC_TUTORIAL_APEX_AGE_BODY_NEXT_AGE_UNAVAILABLE";
        } else {
          futureAgeInfo = "LOC_TUTORIAL_APEX_AGE_BODY_NEXT_AGE_AVAILABLE";
        }
        return [futureAgeInfo];
      }
    },
    option1: calloutClose
  },
  activationCustomEvents: ["OnContextManagerOpen_screen-culture-tree-chooser"],
  onActivateCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (player) {
      const civInfo = GameInfo.Civilizations.lookup(player.civilizationType);
      if (civInfo?.ApexAge != null) {
        const apexAge = GameInfo.Ages.lookup(civInfo.ApexAge);
        if (apexAge != currentAge) {
          return false;
        } else {
          if (currentAge?.AgeType != "AGE_ANTIQUITY") {
            return true;
          } else if (Game.turn > 20) {
            return true;
          }
        }
      }
    }
    return false;
  },
  completionEngineEvents: ["CultureTreeChanged", "OnContextManagerClose", "CultureTargetChanged"]
});
TutorialManager.add({
  ID: "tutorial_apex_age",
  filterPlayers: [],
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleRight,
    title: "LOC_TUTORIAL_TIME_TESTED_AGE_TITLE",
    body: {
      text: "LOC_TUTORIAL_TIME_TESTED_AGE_BODY",
      getLocParams: (_item) => {
        let futureAgeInfo = "ERROR NO STRING FOUND";
        if (Game.AgeProgressManager.isFinalAge) {
          futureAgeInfo = "LOC_TUTORIAL_TIME_TESTED_AGE_BODY_NEXT_AGE_UNAVAILABLE";
        } else {
          futureAgeInfo = "LOC_TUTORIAL_TIME_TESTED_AGE_BODY_NEXT_AGE_AVAILABLE";
        }
        return [futureAgeInfo];
      }
    },
    option1: calloutClose
  },
  activationCustomEvents: ["OnContextManagerOpen_screen-culture-tree-chooser"],
  onActivateCheck: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (player) {
      const civInfo = GameInfo.Civilizations.lookup(player.civilizationType);
      if (civInfo?.ApexAge != null) {
        const apexAge = GameInfo.Ages.lookup(civInfo.ApexAge);
        if (apexAge == currentAge) {
          return false;
        } else {
          if (currentAge?.AgeType != "AGE_ANTIQUITY") {
            return true;
          } else if (Game.turn > 20) {
            return true;
          }
        }
      }
    }
    return false;
  },
  completionEngineEvents: ["CultureTreeChanged", "OnContextManagerClose", "CultureTargetChanged"]
});
//# sourceMappingURL=tutorial-items-all-ages.js.map
