import { FxsNavHelp } from '../../../core/ui/components/fxs-nav-help.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { VictoryQuestState } from '../quest-tracker/quest-item.js';
import { getQuestTracker } from '../quest-tracker/quest-tracker.js';
import { NextItemStatus, TutorialLevel } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';

function accept(params) {
  const text = params ? params.text ?? "LOC_TUTORIAL_CALLOUT_CONTINUE" : "LOC_TUTORIAL_CALLOUT_CONTINUE";
  const nextID = params ? params.nextID : void 0;
  return {
    callback: () => {
    },
    text,
    actionKey: "inline-accept",
    closes: true,
    nextID
  };
}
function cancel(params) {
  const text = params ? params.text ?? "LOC_TUTORIAL_CALLOUT_CLOSE" : "LOC_TUTORIAL_CALLOUT_CLOSE";
  const nextID = params ? params.nextID : void 0;
  return {
    callback: () => {
    },
    text,
    actionKey: "inline-cancel",
    closes: true,
    nextID
  };
}
function calloutAcceptNext(nextID) {
  return accept({ text: "LOC_TUTORIAL_CALLOUT_ACCEPT", nextID });
}
function calloutBeginNext(nextID) {
  return accept({ text: "LOC_TUTORIAL_CALLOUT_BEGIN", nextID });
}
function calloutCloseNext(nextID) {
  return cancel({ text: "LOC_TUTORIAL_CALLOUT_CLOSE", nextID });
}
function calloutContinueNext(nextID) {
  return accept({ text: "LOC_TUTORIAL_CALLOUT_CONTINUE", nextID });
}
function calloutExploreNext(nextID) {
  return accept({ text: "LOC_TUTORIAL_CALLOUT_EXPLORE", nextID });
}
function calloutCancelQuest() {
  return cancel({ text: "LOC_TUTORIAL_CALLOUT_CANCEL_QUEST", nextID: NextItemStatus.Canceled });
}
function ensurePropertiesExist(obj, properties) {
  return properties.every((property) => {
    return obj[property] != void 0;
  });
}
function OpenCivilopediaAt(searchTerm) {
  return engine.trigger("open-civilopedia", searchTerm);
}
function hasAnyWondersUnlocked(_TutorialItem) {
  const playerId = TutorialManager.playerId;
  const player = Players.get(playerId);
  if (!player) {
    console.error("Tutorial's hasAnyWondersUnlocked is unable to get a player object for player: ", playerId);
    return false;
  }
  const isWonderInTreeUnlocksCallback = (progressionNode) => {
    if (progressionNode.state != ProgressionTreeNodeState.NODE_STATE_UNLOCKED && progressionNode.state != ProgressionTreeNodeState.NODE_STATE_FULLY_UNLOCKED) {
      return false;
    }
    for (const i of progressionNode.unlockIndices) {
      const unlockInfo = GameInfo.ProgressionTreeNodeUnlocks[i];
      if (!unlockInfo || unlockInfo.Hidden) {
        continue;
      }
      if (unlockInfo.UnlockDepth != progressionNode.depthUnlocked) {
        continue;
      }
      if (unlockInfo.TargetKind != "KIND_CONSTRUCTIBLE") {
        continue;
      }
      const building = GameInfo.Constructibles.lookup(unlockInfo.TargetType);
      if (!building) {
        console.warn(
          "Tutorial's hasAnyWondersUnlocked failed to get a building for a constructable while looking at tech nodes. Player: ",
          playerId,
          ", target: ",
          unlockInfo.TargetType
        );
        continue;
      }
      if (building.ConstructibleClass == "WONDER") {
        return true;
      }
    }
    return false;
  };
  const techs = player.Techs;
  if (!techs) {
    console.error("Tutorial's hasAnyWondersUnlocked is unable to get a techs object for player: ", playerId);
    return false;
  }
  const techTreeType = techs.getTreeType();
  const techTree = Game.ProgressionTrees.getTree(playerId, techTreeType);
  if (!techTree) {
    console.error(
      "Tutorial's hasAnyWondersUnlocked is unable to get a tech tree for player: ",
      playerId,
      ", techTreeType: ",
      techTreeType
    );
    return false;
  }
  let isWonderUnlocked = techTree.nodes.some(isWonderInTreeUnlocksCallback);
  if (isWonderUnlocked) {
    return true;
  }
  const civics = player.Techs;
  if (!civics) {
    console.error("Tutorial's hasAnyWondersUnlocked is unable to get a civic object for player: ", playerId);
    return false;
  }
  const civicTreeType = civics.getTreeType();
  const civicsTree = Game.ProgressionTrees.getTree(playerId, civicTreeType);
  if (!civicsTree) {
    console.error(
      "Tutorial's hasAnyWondersUnlocked is unable to get a civics tree for player: ",
      playerId,
      ", civicTreeType: ",
      civicTreeType
    );
    return false;
  }
  isWonderUnlocked = civicsTree.nodes.some(isWonderInTreeUnlocksCallback);
  return isWonderUnlocked;
}
function didTechUnlock(node, techName, depth = 1) {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error(
      "Cannot check if tech unlocked as no custom event is set in manager. id: ",
      node.ID,
      ", techName:",
      techName
    );
    return false;
  }
  if (!ensurePropertiesExist(event, ["player", "tree", "activeNode"])) {
    console.warn("Skipping didTechUnlock. id: ", node.ID);
    return false;
  }
  const player = Players.get(event.player);
  if (!player) {
    console.error(
      "Tutorial is unable to get player object for tech unknock. id: ",
      node.ID,
      ", techName: ",
      techName,
      ", player: ",
      event.player
    );
    return false;
  }
  const techs = player.Techs;
  if (!techs) {
    console.error(
      "Tutorial is unable to get tech object for tech unknock. id: ",
      node.ID,
      ", techName: ",
      techName,
      ", player: ",
      event.player
    );
    return false;
  }
  const recentResearchNodeType = techs.getLastCompletedNodeType();
  if (!recentResearchNodeType) {
    console.error(
      "Tutorial is unable to get a tech tree for tech unknock. id: ",
      node.ID,
      ", techName: ",
      techName,
      ", player: ",
      event.player,
      ", techs: ",
      techs
    );
    return false;
  }
  const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(recentResearchNodeType);
  if (!nodeInfo) {
    console.error(
      "Tutorial is unable to get the nodeInfofor tech unknock. id: ",
      node.ID,
      ", techName: ",
      techName,
      ", player: ",
      event.player,
      ", recentResearchNodeType: ",
      recentResearchNodeType
    );
    return false;
  }
  let isMatch = nodeInfo.ProgressionTreeNodeType == techName;
  if (depth != 1 && isMatch) {
    const progressionNode = Game.ProgressionTrees.getNode(
      event.player,
      recentResearchNodeType
    );
    isMatch = progressionNode?.depthUnlocked == depth;
  }
  return isMatch;
}
function didCivicUnlock(node, civicName, depth = 1) {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error(
      "Cannot check if culture unlocked as no custom event is set in manager. id: ",
      node.ID,
      ", civicName:",
      civicName
    );
    return false;
  }
  if (!ensurePropertiesExist(event, ["player", "tree", "activeNode"])) {
    console.warn("Skipping didCultureUnlock. id: ", node.ID);
    return false;
  }
  const player = Players.get(event.player);
  if (!player) {
    console.error(
      "Tutorial is unable to get player object for culture unknock. id: ",
      node.ID,
      ", civicName: ",
      civicName,
      ", player: ",
      event.player
    );
    return false;
  }
  const culture = player.Culture;
  if (!culture) {
    console.error(
      "Tutorial is unable to get culture object for culture unknock. id: ",
      node.ID,
      ", civicName: ",
      civicName,
      ", player: ",
      event.player
    );
    return false;
  }
  const recentResearchNodeType = culture.getLastCompletedNodeType();
  if (!recentResearchNodeType) {
    console.error(
      "Tutorial is unable to get a culture tree for culture unknock. id: ",
      node.ID,
      ", civicName: ",
      civicName,
      ", player: ",
      event.player,
      ", culture: ",
      culture
    );
    return false;
  }
  const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(recentResearchNodeType);
  if (!nodeInfo) {
    console.error(
      "Tutorial is unable to get the nodeInfofor culture unknock. id: ",
      node.ID,
      ", civicName: ",
      civicName,
      ", player: ",
      event.player,
      ", recentResearchNodeType: ",
      recentResearchNodeType
    );
    return false;
  }
  let isMatch = nodeInfo.ProgressionTreeNodeType == civicName;
  if (depth != 1 && isMatch) {
    const progressionNode = Game.ProgressionTrees.getNode(
      event.player,
      recentResearchNodeType
    );
    isMatch = progressionNode?.depthUnlocked == depth;
  }
  return isMatch;
}
function getPlayerAndTreeEvent(errorMsg = "none") {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error("Tutorial helper failed obtaining activating event. msg: ", errorMsg);
    return [null, null];
  }
  if (!ensurePropertiesExist(event, ["player", "tree", "activeNode"])) {
    console.error("Tutorial helper failed to find tree properties on node. msg: ", errorMsg);
    return [null, event];
  }
  return [Players.get(event.player), event];
}
function getUnitFromEvent(errorMsg = "none") {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error("Tutorial helper failed obtaining an event to return player and unit. msg: ", errorMsg);
    return null;
  }
  if (!ensurePropertiesExist(event, ["unit", "unitState", "unitType"])) {
    console.error("Tutorial helper failed to find unit properties on node. msg: ", errorMsg);
    console.log("values: ", Object.values(event));
    return null;
  }
  const unit = Units.get(event.unit);
  if (!unit) {
    console.error("Tutorial helper unable to get unit for componentID: ", ComponentID.toLogString(event.unit));
    return null;
  }
  return unit;
}
function getUnitFromOnly(errorMsg = "none") {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error("Tutorial helper failed obtaining an event to return player and unit. msg: ", errorMsg);
    return null;
  }
  if (!ensurePropertiesExist(event, ["unit"])) {
    console.error("Tutorial helper failed to find unit properties on node. msg: ", errorMsg);
    console.log("values: ", Object.values(event));
    return null;
  }
  const unit = Units.get(event.unit);
  if (!unit) {
    console.error("Tutorial helper unable to get unit for componentID: ", ComponentID.toLogString(event.unit));
    return null;
  }
  return unit;
}
function hasTreeUnlocks(node) {
  const [player, event] = getPlayerAndTreeEvent("hasUnlocks for " + node.ID);
  if (!player || !event) {
    console.warn("Tutorial hasUnlock unable to be determined for id: ", node.ID);
    return false;
  }
  let recentResearchNodeType = void 0;
  if (TutorialManager.activatingEventName == "CultureNodeCompleted") {
    const culture = player.Culture;
    if (!culture) {
      console.error("Tutorial failed getting culture in hasTreeUnlocks. id: ", node.ID);
      return false;
    }
    recentResearchNodeType = culture.getLastCompletedNodeType();
  } else if (TutorialManager.activatingEventName == "TechNodeCompleted") {
    const tech = player.Techs;
    if (!tech) {
      console.error("Tutorial failed getting tech in hasTreeUnlocks. id: ", node.ID);
      return false;
    }
    recentResearchNodeType = tech.getLastCompletedNodeType();
  }
  if (!recentResearchNodeType) {
    console.error("Tutorial hasTreeUnlocks unable to get last researched node. id: ", node.ID);
    return false;
  }
  const progressionNode = Game.ProgressionTrees.getNode(
    event.player,
    recentResearchNodeType
  );
  return progressionNode != void 0 && progressionNode.maxDepth > 1;
}
function isUnitOfType(node, unitTypeNames) {
  const unit = getUnitFromEvent("isUnitOfType");
  if (!unit) {
    console.error("Tutorial unable to get unit for id: ", node.ID, " unitTypeNames: ", unitTypeNames.toString());
    return false;
  }
  const unitDefinition = GameInfo.Units.lookup(unit.type);
  if (!unitDefinition) {
    console.error("Tutorial could not find a unit defintition for unit.type: ", unit.type);
    return false;
  }
  const isMatch = unitTypeNames.some((name) => {
    return name == unitDefinition?.UnitType;
  });
  return isMatch;
}
function isUnitOfDomain(node, domain) {
  const unit = getUnitFromOnly("isUnitOfDomain");
  if (!unit) {
    console.error("Tutorial unable to get unit for id: ", node.ID, " unitTypeNames: ", domain);
    return false;
  }
  const unitDefinition = GameInfo.Units.lookup(unit.type);
  if (!unitDefinition) {
    console.error("Tutorial could not find a unit defintition for unit.type: ", unit.type);
    return false;
  }
  let isMatch = false;
  if (domain == unitDefinition?.Domain) {
    isMatch = true;
  }
  return isMatch;
}
function isTreasureResource(node) {
  const event = TutorialManager.activatingEvent;
  if (!event) {
    console.error("Tutorial helper failed obtaining an event to return player and unit. msg: ");
    return false;
  }
  const resource = GameplayMap.getResourceType(event.location.x, event.location.y);
  const resourceDefinition = GameInfo.Resources.lookup(resource);
  if (!resourceDefinition) {
    console.error("Tutorial could not find a resource defintition for resource ", node.ID);
    return false;
  }
  let isMatch = false;
  if (resourceDefinition?.ResourceClassType == "RESOURCECLASS_TREASURE") {
    isMatch = true;
  }
  return isMatch;
}
function getUnitName() {
  const unit = getUnitFromEvent("isUnitOfType");
  if (!unit) {
    return "NO_UNIT";
  }
  const unitDefinition = GameInfo.Units.lookup(unit.type);
  if (!unitDefinition) {
    return "NO_UNIT";
  }
  return unitDefinition.Name;
}
function getNameOfFirstUnitWithTag(tag) {
  const player = Players.get(GameContext.localPlayerID);
  if (player && player.Units) {
    const units = player.Units.getUnitTypesWithTag(tag);
    if (units.length > 0) {
      const eUnit = units[0];
      const unitDefinition = GameInfo.Units.lookup(eUnit);
      if (unitDefinition) {
        return unitDefinition.Name;
      }
    }
  }
  return "NO_UNIT";
}
function getNameOfFirstUnlockedUnitWithTag(tag) {
  const player = Players.get(GameContext.localPlayerID);
  if (player && player.Units) {
    const units = player.Units.getUnitTypesUnlockedWithTag(tag, false);
    if (units.length > 0) {
      const eUnit = units[0];
      const unitDefinition = GameInfo.Units.lookup(eUnit);
      if (unitDefinition) {
        return unitDefinition.Name;
      }
    }
  }
  return "NO_UNIT";
}
function getTutorialPrompts(actionPrompts) {
  const actionTextPrompts = actionPrompts.map((prompt) => {
    const actionName = (ActionHandler.isGamepadActive ? FxsNavHelp.getGamepadActionName(prompt.actionName ?? "") : prompt.actionName) ?? "";
    let promptText = prompt.kbm;
    if (ActionHandler.isGamepadActive) {
      promptText = prompt.gamepad;
    } else if (ActionHandler.deviceType == InputDeviceType.Touch) {
      promptText = prompt.touch ?? prompt.kbm;
    } else if (ActionHandler.deviceType == InputDeviceType.Hybrid) {
      promptText = prompt.hybrid ?? prompt.kbm;
    }
    return Locale.compose(promptText ?? "", actionName);
  });
  return actionTextPrompts;
}
function getCurrentTurnBlockingNotification(playerID) {
  if (!Players.isValid(playerID)) {
    console.error("tutorial-support: getCurrentTurnBlockingNotification(): Invalid PlayerId: " + playerID);
    return;
  }
  const player = Players.get(playerID);
  if (!player) {
    console.error(
      "tutorial-support: getCurrentTurnBlockingNotification(): No player found with valid id: " + playerID
    );
    return;
  }
  const endTurnBlockingType = Game.Notifications.getEndTurnBlockingType(playerID);
  const endTurnBlockingNotificationId = Game.Notifications.findEndTurnBlocking(
    playerID,
    endTurnBlockingType
  );
  if (!endTurnBlockingNotificationId && endTurnBlockingType == 0) {
    return null;
  }
  if (!endTurnBlockingNotificationId || ComponentID.isInvalid(endTurnBlockingNotificationId)) {
    console.error(
      "tutorial-support: getCurrentTurnBlockingNotification(): No valid notification found with type: " + endTurnBlockingType
    );
    return;
  }
  const endTurnBlockingNotification = Game.Notifications.find(endTurnBlockingNotificationId);
  if (!endTurnBlockingNotification) {
    console.error(
      "tutorial-support: getCurrentTurnBlockingNotification(): No notification found with id: " + endTurnBlockingNotificationId
    );
    return;
  }
  return endTurnBlockingNotification;
}
function setNextItemActivation(item, nextID) {
  if (!nextID) {
    console.warn(`tutorial-support: Next item "${item.nextID}" is canceled by previous "${item.ID}".`);
    item.nextID = NextItemStatus.Canceled;
  }
  if (item.nextID != void 0) {
    console.warn(
      `tutorial-support: Item "${item.ID}" currently has a nextID "${item.nextID}". Are you sure you want to overwrite it with "${nextID}"?`
    );
  }
  item.nextID = nextID;
  return true;
}
function canQuestActivate(prevQuestTracking, currQuestTracking) {
  const questTracker = getQuestTracker();
  const eventDetailName = TutorialManager.activatingEvent.detail.name;
  if (eventDetailName != prevQuestTracking) {
    return false;
  }
  const currentQuest = questTracker.get(currQuestTracking);
  const currentPathType = currentQuest?.victory?.type;
  if (currentPathType == void 0) {
    console.warn("tutorial-support: canQuestActivate(): No advisor type for currentQuest: " + currQuestTracking);
    return false;
  }
  const items = Array.from(questTracker.getItems());
  const firstQuestInPath = items.find(
    (item) => item.victory?.type == currentPathType && item.victory.order == 1
  );
  if (firstQuestInPath == void 0) {
    console.warn("tutorial-support: canQuestActivate(): No path starting item found (order 1)");
    return false;
  }
  const isPathTracked = questTracker.isPathTracked(currentPathType);
  if (!isPathTracked) {
    return false;
  }
  const isTrackedUnstarted = questTracker.isQuestVictoryUnstarted(currQuestTracking);
  const isPreviousCompleted = questTracker.isQuestVictoryCompleted(prevQuestTracking);
  return isTrackedUnstarted && isPreviousCompleted;
}
function activateNextTrackedQuest(item) {
  const questTracker = getQuestTracker();
  const isTutorialDisabled = Online.LiveEvent.getLiveEventGameFlag() || Configuration.getUser().tutorialLevel <= TutorialLevel.WarningsOnly || Configuration.getGame().isAnyMultiplayer;
  if (!isTutorialDisabled) {
    return;
  }
  if (item.quest?.victory == void 0) {
    console.warn(
      "activateNextTrackedQuest(): Cannot activate a next quest for " + item.ID + " as it's not a quest victory"
    );
    return;
  }
  const isCurrentCompleted = questTracker.isQuestVictoryCompleted(item.ID);
  if (!isCurrentCompleted) {
    console.warn(
      "activateNextTrackedQuest(): Trying to activate a next quest when the previous is not tracked!. Previous ID: " + item.ID
    );
    return;
  }
  const currentQuest = questTracker.get(item.ID);
  const currentType = currentQuest?.victory?.type;
  if (currentType == void 0) {
    console.warn("tutorial-support: activateNextTrackedQuest(): No advisor type for currentQuest: " + item.ID);
    return;
  }
  const currentOrder = currentQuest?.victory?.order;
  if (currentOrder == void 0) {
    console.warn("tutorial-support: activateNextTrackedQuest(): No order for currentQuest: " + item.ID);
    return;
  }
  const isPathTracked = questTracker.isPathTracked(currentType);
  if (!isPathTracked) {
    console.warn(
      "tutorial-support: activateNextTrackedQuest(): The path for this quest is not tracked! Item ID: " + item.ID
    );
    return;
  }
  const nextQuestOrder = currentOrder + 1;
  const items = Array.from(questTracker.getItems());
  const nextQuestItem = items.find(
    (item2) => item2.victory?.type == currentType && item2.victory.order == nextQuestOrder
  );
  if (nextQuestItem == void 0) {
    console.warn(
      `tutorial-support: activateNextTrackedQuest(): No next quest found with order: ${nextQuestOrder} in legacy path: ${currentType}`
    );
    return;
  }
  questTracker.setQuestVictoryStateById(nextQuestItem.id, VictoryQuestState.QUEST_IN_PROGRESS);
}

export { OpenCivilopediaAt, activateNextTrackedQuest, calloutAcceptNext, calloutBeginNext, calloutCancelQuest, calloutCloseNext, calloutContinueNext, calloutExploreNext, canQuestActivate, didCivicUnlock, didTechUnlock, ensurePropertiesExist, getCurrentTurnBlockingNotification, getNameOfFirstUnitWithTag, getNameOfFirstUnlockedUnitWithTag, getTutorialPrompts, getUnitFromEvent, getUnitFromOnly, getUnitName, hasAnyWondersUnlocked, hasTreeUnlocks, isTreasureResource, isUnitOfDomain, isUnitOfType, setNextItemActivation };
//# sourceMappingURL=tutorial-support.js.map
