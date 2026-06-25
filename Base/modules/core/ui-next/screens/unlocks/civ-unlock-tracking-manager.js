import { Catalog } from '../../../ui/utilities/utility-serialize.js';
import { getQuestTracker } from '../../../../base-standard/ui/quest-tracker/quest-tracker.js';

const VERSION = 1;
const TRACKED_CIV_UNLOCK_OBJECT_NAME = "tracked-civ-unlocks";
const TRACKED_CIV_UNLOCK_KEY_NAME = "ids";
const CIV_UNLOCK_CATALOG_NAME = "CivUnlockTrackerCatalog";
const QUEST_TRACKER_SYSTEM_NAME = "civ-unlock";
const REQUIREMENT_QUEST_ID_SEPARATOR = "::";
class CivUnlockTrackingManager {
  catalog;
  playerId;
  constructor(playerId) {
    this.playerId = playerId;
    this.catalog = new Catalog({
      name: CIV_UNLOCK_CATALOG_NAME,
      version: VERSION,
      player: Players.get(playerId)
    });
    if (!this.catalog.justCreated) {
      this.readTrackedCivUnlocks();
    }
    engine.on("BeforeUnload", this.beforeUnload, this);
    engine.on("PlayerUnlockChanged", this.onPlayerUnlockChanged, this);
    engine.on("PlayerUnlockProgressChanged", this.onPlayerUnlockProgressChanged, this);
  }
  beforeUnload() {
    engine.off("BeforeUnload", this.beforeUnload, this);
    engine.off("PlayerUnlockChanged", this.onPlayerUnlockChanged, this);
    engine.off("PlayerUnlockProgressChanged", this.onPlayerUnlockProgressChanged, this);
  }
  onPlayerUnlockChanged(event) {
    this.refreshTrackedCivUnlocks(event.player, event.unlock);
  }
  onPlayerUnlockProgressChanged(event) {
    this.refreshTrackedCivUnlocks(event.player, event.unlock);
  }
  refreshTrackedCivUnlocks(playerId, _unlockType) {
    if (playerId != this.playerId) {
      return;
    }
    const trackedCivTypes = this.getTrackedCivTypes();
    trackedCivTypes.forEach((civType) => {
      if (!this.canTrack(civType)) {
        this.removeTrackedQuestItemsForCiv(civType);
        return;
      }
      this.addCivUnlockToQuestTracker(civType);
    });
    this.writeTrackedCivUnlocks();
  }
  getCivUnlockReward(civType) {
    return GameInfo.UnlockRewards.find(
      (reward) => reward.UnlockRewardKind == "KIND_CIVILIZATION" && reward.UnlockRewardType == civType
    );
  }
  getGameplayUnlockRequirements(unlockType) {
    return GameInfo.UnlockRequirements.filter(
      (requirement) => requirement.UnlockType == unlockType && requirement.GameplayUnlock && typeof requirement.Description == "string" && requirement.Description.length > 0
    );
  }
  makeRequirementQuestId(civType, requirementSetId) {
    return `${civType}${REQUIREMENT_QUEST_ID_SEPARATOR}${requirementSetId}`;
  }
  getCivTypeForQuestId(questId) {
    const separatorIndex = questId.indexOf(REQUIREMENT_QUEST_ID_SEPARATOR);
    if (separatorIndex < 0) {
      return questId;
    }
    return questId.substring(0, separatorIndex);
  }
  getTrackedCivTypes() {
    const questTracker = getQuestTracker();
    const civTypes = /* @__PURE__ */ new Set();
    Array.from(questTracker.getItems()).filter((questItem) => questItem.system == QUEST_TRACKER_SYSTEM_NAME).forEach((questItem) => {
      civTypes.add(this.getCivTypeForQuestId(questItem.id));
    });
    return Array.from(civTypes);
  }
  removeTrackedQuestItemsForCiv(civType) {
    const questTracker = getQuestTracker();
    Array.from(questTracker.getItems()).filter(
      (questItem) => questItem.system == QUEST_TRACKER_SYSTEM_NAME && this.getCivTypeForQuestId(questItem.id) == civType
    ).forEach((questItem) => {
      questTracker.remove(questItem.id, QUEST_TRACKER_SYSTEM_NAME);
    });
  }
  getRequirementProgressForCiv(civType, requirementSetId) {
    const reward = this.getCivUnlockReward(civType);
    if (!reward) {
      return { current: 0, total: 0 };
    }
    const progress = Game.Unlocks.getProgressForPlayer(reward.UnlockType, this.playerId);
    const progressEntry = progress?.progress.find((entry) => entry.requirementSetId == requirementSetId);
    return {
      current: progressEntry?.current ?? 0,
      total: progressEntry?.total ?? 0
    };
  }
  getGameplayUnlockRequirementStatuses(civType) {
    const reward = this.getCivUnlockReward(civType);
    if (!reward) {
      console.error("civ-unlock-tracking-manager: unable to find unlock reward for civ type: " + civType);
      return [];
    }
    const requirements = this.getGameplayUnlockRequirements(reward.UnlockType);
    const progressByRequirementSetId = /* @__PURE__ */ new Map();
    const progress = Game.Unlocks.getProgressForPlayer(reward.UnlockType, this.playerId);
    progress?.progress.forEach((entry) => {
      progressByRequirementSetId.set(entry.requirementSetId, {
        state: entry.state,
        current: entry.current,
        total: entry.total
      });
    });
    return requirements.map((requirement) => {
      const progressEntry = progressByRequirementSetId.get(requirement.RequirementSetId);
      return {
        requirementSetId: requirement.RequirementSetId,
        description: Locale.compose(requirement.Description ?? ""),
        isMet: progressEntry?.state == RequirementState.AlwaysMet || progressEntry?.state == RequirementState.Met,
        current: progressEntry?.current ?? 0,
        total: progressEntry?.total ?? 0
      };
    }).filter((status) => status.description.length > 0);
  }
  readTrackedCivUnlocks() {
    const serializedCivIDs = this.catalog.getObject(TRACKED_CIV_UNLOCK_OBJECT_NAME).read(TRACKED_CIV_UNLOCK_KEY_NAME);
    if (!serializedCivIDs) {
      return;
    }
    serializedCivIDs.split("|").forEach((civType) => {
      if (!civType || !this.canTrack(civType)) {
        return;
      }
      this.addCivUnlockToQuestTracker(civType);
    });
  }
  addCivUnlockToQuestTracker(civType) {
    const civDef = GameInfo.Civilizations.lookup(civType);
    if (!civDef) {
      console.error("civ-unlock-tracking-manager: unable to find civ definition for civ type: " + civType);
      return;
    }
    const requirementStatuses = this.getGameplayUnlockRequirementStatuses(civType);
    if (requirementStatuses.length <= 0) {
      console.error(
        "civ-unlock-tracking-manager: no gameplay unlock requirements found for civ type: " + civType
      );
      return;
    }
    requirementStatuses.forEach((status) => {
      const civUnlockQuestItem = {
        id: this.makeRequirementQuestId(civType, status.requirementSetId),
        title: Locale.compose("LOC_LEGACIES_UNLOCKS_TOOLTIP_TITLE", civDef.Name),
        description: status.description,
        getCurrentProgress: () => {
          return this.getRequirementProgressForCiv(civType, status.requirementSetId).current.toString();
        },
        getCurrentGoal: () => {
          const total = this.getRequirementProgressForCiv(civType, status.requirementSetId).total;
          return total > 0 ? total.toString() : "";
        },
        system: QUEST_TRACKER_SYSTEM_NAME,
        progressType: ""
      };
      const questTracker = getQuestTracker();
      questTracker.add(civUnlockQuestItem);
    });
  }
  isTracked(civType) {
    const questTracker = getQuestTracker();
    return Array.from(questTracker.getItems()).some(
      (questItem) => questItem.system == QUEST_TRACKER_SYSTEM_NAME && this.getCivTypeForQuestId(questItem.id) == civType
    );
  }
  canTrack(civType) {
    const reward = this.getCivUnlockReward(civType);
    if (!reward) {
      return false;
    }
    if (Game.Unlocks.isUnlockedForPlayer(reward.UnlockType, this.playerId)) {
      return false;
    }
    return this.getGameplayUnlockRequirements(reward.UnlockType).length > 0;
  }
  trackCivUnlock(civType) {
    if (!this.canTrack(civType)) {
      return;
    }
    this.addCivUnlockToQuestTracker(civType);
    this.writeTrackedCivUnlocks();
  }
  untrackCivUnlock(civType) {
    this.removeTrackedQuestItemsForCiv(civType);
    this.writeTrackedCivUnlocks();
  }
  writeTrackedCivUnlocks() {
    const serializedCivIDs = this.getTrackedCivTypes().join("|");
    this.catalog.getObject(TRACKED_CIV_UNLOCK_OBJECT_NAME).write(TRACKED_CIV_UNLOCK_KEY_NAME, serializedCivIDs);
  }
}
const instances = [];
function getCivUnlockTrackingManager() {
  const playerId = GameContext.localObserverID;
  if (playerId > 999) {
    throw new Error(`CivUnlockTrackingManager: Player ID of "${playerId}" exceeds maximum supported value of 999.`);
  }
  if (!instances[playerId]) {
    instances[playerId] = new CivUnlockTrackingManager(playerId);
  }
  return instances[playerId];
}

export { CivUnlockTrackingManager, getCivUnlockTrackingManager };
//# sourceMappingURL=civ-unlock-tracking-manager.js.map
