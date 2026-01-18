import { VictoryQuestState } from './quest-item.js';

class SerialBase {
  id;
  scope;
  hashPreamble;
  childrenIDs = /* @__PURE__ */ new Set();
  /**
   * CTOR
   * @param id is the identifier of this object in the catalog
   * @param scope the parent scope
   */
  constructor(id, scope) {
    this.id = id;
    this.scope = scope;
    this.hashPreamble = "_" + scope + "_" + id + "_";
    this.readIDs();
  }
  /**
   * Consistent way to make a hash from a value using the preamble
   * @param key Value to hash (along with the preamble.)
   * @returns hash value
   */
  makeHash(key) {
    const hash = Database.makeHash(this.hashPreamble + key);
    return hash;
  }
  /**
   * Read in the list of ids (keys) for the values this scopes.
   * @returns the number of IDs read or -1 if they don't exist
   */
  readIDs() {
    const hash = this.makeHash("KEYS");
    const ids = GameTutorial.getProperty(hash);
    if (ids) {
      if (typeof ids === "string") {
        this.childrenIDs = new Set(ids.split(","));
        return this.childrenIDs.size;
      }
    }
    return -1;
  }
  /**
   * Write out the list of ids (keys) for the values this scopes.
   */
  writeIDs() {
    const hash = this.makeHash("KEYS");
    const ids = Array.from(this.childrenIDs).join(",");
    GameTutorial.setProperty(hash, ids);
  }
  /**
   * Get collection of IDs maintained by this object.
   * @returns a set of IDs
   */
  getKeys() {
    return this.childrenIDs;
  }
  /**
   * Debug Helper
   * @returns a comma separated string of IDs maintained by this object
   */
  getKeysAsString() {
    return [...this.childrenIDs].join(", ");
  }
}
class SerialObject extends SerialBase {
  /**
   * Read a single value
   * @param key of value to read
   * @returns a type supported for serialization
   */
  read(key) {
    const hash = this.makeHash(key);
    const value = GameTutorial.getProperty(hash);
    return value;
  }
  /**
   * Write a single key,value
   * @param key the key to associate with this value
   * @param value to save out
   */
  write(key, value) {
    const hash = this.makeHash(key);
    GameTutorial.setProperty(hash, value);
    if (!this.childrenIDs.has(key)) {
      this.childrenIDs.add(key);
      this.writeIDs();
    }
  }
}
class Catalog extends SerialBase {
  /**
   * CTOR
   * @description Tracks object with values in array kept in key: _DEFAULT__KEYS
   * @param scope, optional parameter for what named "catalog" objects will be a part of
   */
  constructor(scope = "DEFAULT") {
    super("", scope);
  }
  /**
   * Return an object associated with this catalog; creates one if it doesn't exist.
   * @param id Identifier of the object.
   * @returns {SerialObject}
   */
  getObject(id) {
    if (!this.exists(id)) {
      this.childrenIDs.add(id);
      this.writeIDs();
    }
    return new SerialObject(id, this.scope + "_OBJ");
  }
  /**
   * Does an object exist in this catalog?
   * @param id Identifier of the object.
   * @returns true if object exists.
   */
  exists(id) {
    return this.childrenIDs.has(id);
  }
}

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
class QuestTrackerClass {
  static instance = null;
  items = /* @__PURE__ */ new Map();
  trackerItemAddedLiteEvent = new LiteEvent();
  trackerItemRemovedLiteEvent = new LiteEvent();
  questCatalogName = "QuestTrackerCatalog";
  catalog;
  _listSelectedQuest = "";
  set selectedQuest(value) {
    this._listSelectedQuest = value;
  }
  get selectedQuest() {
    return this._listSelectedQuest;
  }
  constructor() {
    if (QuestTrackerClass.instance) {
      console.error("Attempt to create more than one quest manager class; ignoring call.");
    } else {
      QuestTrackerClass.instance = this;
    }
    this.catalog = new Catalog(this.questCatalogName);
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
    for (const [key, value] of victoryEntries) {
      const object = this.catalog.getObject(quest.id);
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
const QuestTracker = new QuestTrackerClass();

export { QuestCompletedEvent, QuestCompletedEventName, QuestListUpdatedEvent, QuestListUpdatedEventName, QuestTracker as default };
//# sourceMappingURL=quest-tracker.js.map
