import { Catalog } from '../../../core/ui/utilities/utility-serialize.js';
import { VictoryQuestState } from './quest-item.js';

const QuestListUpdatedEventName = "quest-list-update";
class QuestListUpdatedEvent extends CustomEvent {
  constructor(name) {
    super(QuestListUpdatedEventName, { bubbles: false, detail: { name } });
  }
}
const QuestCompletedEventName = "quest-completed";
class QuestCompletedEvent extends CustomEvent {
  constructor(name) {
    super(QuestCompletedEventName, { bubbles: false, detail: { name } });
  }
}
const QuestTrackerRefreshRequestName = "quest-tracker-refresh-request";
class QuestTrackerRefreshRequest extends CustomEvent {
  constructor() {
    super(QuestTrackerRefreshRequestName, { bubbles: false });
  }
}
class QuestTracker {
  items = /* @__PURE__ */ new Map();
  trackerItemAddedLiteEvent = new LiteEvent();
  trackerItemRemovedLiteEvent = new LiteEvent();
  questCatalogName = "QuestTrackerCatalog";
  catalog;
  _listSelectedQuest = "";
  _isDrawerOut = true;
  set selectedQuest(value) {
    this._listSelectedQuest = value;
  }
  get selectedQuest() {
    return this._listSelectedQuest;
  }
  set isDrawerOut(value) {
    this._isDrawerOut = value;
  }
  get isDrawerOut() {
    return this._isDrawerOut;
  }
  /**
   * CTOR
   * @param playerId, ID of the player this tracker belongs to.
   */
  constructor(playerId) {
    const player = Players.get(playerId);
    this.catalog = new Catalog({
      name: this.questCatalogName,
      version: 1,
      player
    });
  }
  get AddEvent() {
    return this.trackerItemAddedLiteEvent.expose();
  }
  get RemoveEvent() {
    return this.trackerItemRemovedLiteEvent.expose();
  }
  /**
   * Items should not be manipulated when handed out.
   */
  getItems() {
    return this.items.values();
  }
  /**
   * Check if the tracker has a specific item.
   * @param id The id of the item to check for.
   * @param system An optional parameter to match against
   */
  has(id, system) {
    const item = this.items.get(id);
    return item !== void 0 && (system === void 0 || item.system === system);
  }
  /**
   * Check if the tracker is empty.
   */
  get empty() {
    return this.items.size === 0;
  }
  /**
   * Get a specific item from the tracker.
   * @param id The id of the item to get.
   */
  get(id) {
    return this.items.get(id);
  }
  /**
   * Add (or update) an item to the quest tracker.
   */
  add(item) {
    const existing = this.items.get(item.id);
    if (existing) {
      if ((item.getCurrentProgress == void 0 || existing.progress == item.getCurrentProgress()) && item.getCurrentProgress && existing.progress == item.progress) {
        console.warn(`Quest tracker item '${existing.id}' update occurred but nothing changed!`);
        return;
      }
      if (item.getCurrentProgress != void 0) {
        existing.progress = item.getCurrentProgress();
      } else {
        existing.progress = item.progress;
      }
      if ((item.getCurrentGoal == void 0 || existing.goal == item.getCurrentGoal()) && item.getCurrentGoal && existing.goal == item.goal) {
        console.warn(`Quest tracker item '${existing.id}' update occurred but nothing changed!`);
        return;
      }
      if (item.getCurrentGoal != void 0) {
        existing.goal = item.getCurrentGoal();
      } else {
        existing.goal = item.goal;
      }
    } else {
      if (item.progress == null && item.getCurrentProgress != null) {
        item.progress = item.getCurrentProgress();
      }
      if (item.goal == null && item.getCurrentGoal != null) {
        item.goal = item.getCurrentGoal();
      }
      this.items.set(item.id, item);
    }
    this.trackerItemAddedLiteEvent.trigger(item);
  }
  /**
   * Remove item from quest tracker.
   * @param {string} id The item ID to remove.
   * @param {string} system The system the item belongs to.
   * @param {object} params.force If not used, the tracker makes Legacy Quests to appear as completed instead of removed.
   */
  remove(id, system, params) {
    const existing = this.items.get(id);
    if (!existing || existing.system != system) {
      console.error(
        `Attempt to remove quest tracked item '${id}' origin '${system}' but it doesn't exist in tracker.`
      );
      return;
    }
    if (params && params.forceRemove) {
      this.items.delete(id);
      this.trackerItemRemovedLiteEvent.trigger(existing);
      return;
    }
    if (existing.victory) {
      this.setQuestVictoryState(existing, VictoryQuestState.QUEST_COMPLETED);
      this.writeQuestVictory(existing);
      window.dispatchEvent(new QuestCompletedEvent(id));
    } else {
      this.items.delete(id);
      this.trackerItemRemovedLiteEvent.trigger(existing);
    }
  }
  /**
   * Writes a Quest's Victory in memory
   */
  writeQuestVictory(quest) {
    if (!quest.victory) {
      console.error("quest-tracker: writeQuestVictory(): Passing a quest with no victory definition");
      return;
    }
    const { content: _, ...victoryWithoutContent } = quest.victory;
    const victoryEntries = Object.entries(victoryWithoutContent);
    const object = this.catalog.getObject(quest.id);
    for (const [key, value] of victoryEntries) {
      object.write(key, value);
    }
    this.updateQuestList(quest.id);
  }
  /**
   * Reads a Quest's Victory from memory
   */
  readQuestVictory(id) {
    const object = this.catalog.getObject(id);
    const victoryQuest = {};
    for (const key of object.getKeys()) {
      const value = object.read(key);
      victoryQuest[key] = value;
    }
    return victoryQuest;
  }
  /**
   * Sets state for a quest object
   * @returns true if the state was set
   */
  setQuestVictoryState(quest, state) {
    if (!quest.victory) {
      console.error(
        "quest-tracker: setQuestVictoryState(): Passing a quest with no victory definition. Quest id: " + quest.id
      );
      return false;
    }
    quest.victory.state = state;
    if (quest.victory.state == VictoryQuestState.QUEST_IN_PROGRESS) {
      this.setPathTracked(true, quest.victory.type);
    }
    return true;
  }
  setQuestVictoryStateById(id, state) {
    const trackedQuest = this.get(id);
    if (!trackedQuest) {
      console.error(
        "quest-tracker: setQuestVictoryState: No tracked quest available for activation with id: " + id
      );
      return false;
    }
    const canWrite = this.setQuestVictoryState(trackedQuest, state);
    if (canWrite) {
      this.writeQuestVictory(trackedQuest);
      return true;
    }
    return false;
  }
  isQuestVictoryUnstarted(id) {
    return this.readQuestVictory(id).state == VictoryQuestState.QUEST_UNSTARTED;
  }
  isQuestVictoryInProgress(id) {
    return this.readQuestVictory(id).state == VictoryQuestState.QUEST_IN_PROGRESS;
  }
  isQuestVictoryCompleted(id) {
    return this.readQuestVictory(id).state == VictoryQuestState.QUEST_COMPLETED;
  }
  setPathTracked(isTracked, pathType) {
    const object = this.catalog.getObject(`path-${pathType}`);
    object.write("tracked", isTracked);
  }
  isPathTracked(pathType) {
    const object = this.catalog.getObject(`path-${pathType}`);
    return object.read("tracked");
  }
  /**
   * Handy utility to update quest-list
   */
  updateQuestList(questName) {
    window.dispatchEvent(new QuestListUpdatedEvent(questName));
  }
}
const instances = [];
function getQuestTracker() {
  if (!UI.isInGame()) {
    throw new Error("quest-tracker: should only be accessed in-game.");
  }
  const playerId = GameContext.localObserverID;
  if (playerId > 999) {
    throw new Error(`quest-tracker: Player ID of "${playerId}" exceeds maximum supported value of 999.`);
  }
  if (!instances[playerId]) {
    instances[playerId] = new QuestTracker(playerId);
  }
  return instances[playerId];
}
if (Configuration.getGame().isHotseat) {
  let onLocalPlayerChanged = function() {
    console.log("quest-tracker: Requesting info for local player: " + GameContext.localObserverID);
    window.dispatchEvent(new QuestTrackerRefreshRequest());
  };
  engine.on("LocalPlayerChanged", onLocalPlayerChanged);
}

export { QuestCompletedEvent, QuestCompletedEventName, QuestListUpdatedEvent, QuestListUpdatedEventName, QuestTrackerRefreshRequest, QuestTrackerRefreshRequestName, getQuestTracker };
//# sourceMappingURL=quest-tracker.js.map
