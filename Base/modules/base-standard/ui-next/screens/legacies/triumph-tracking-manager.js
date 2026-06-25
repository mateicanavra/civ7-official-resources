import { Catalog } from '../../../../core/ui/utilities/utility-serialize.js';
import { getQuestTracker, QuestTrackerRefreshRequestName } from '../../../ui/quest-tracker/quest-tracker.js';

const VERSION = 2;
const TRACKED_TRIUMPH_OBJECT_NAME = "tracked-triumphs";
const TRACKED_TRIUMPH_KEY_NAME = "ids";
class TriumphTrackingManagerClass {
  triumphCatalogName = "TriumphTrackerCatalog";
  catalog;
  playerId;
  constructor(playerId) {
    this.playerId = playerId;
    this.catalog = new Catalog({
      name: this.triumphCatalogName,
      version: VERSION,
      player: Players.get(playerId)
    });
    if (!this.catalog.justCreated) {
      this.readTrackedTriumphs();
    }
    engine.on("BeforeUnload", this.beforeUnload, this);
    engine.on("PlayerLegacyProgress", this.onLegacyProgress, this);
  }
  beforeUnload() {
    engine.off("BeforeUnload", this.beforeUnload, this);
    engine.off("PlayerLegacyProgress", this.onLegacyProgress, this);
  }
  onLegacyProgress(event) {
    if (event.player != this.playerId) {
      return;
    }
    const legacyDef = GameInfo.Legacies.lookup(event.legacy);
    if (!legacyDef) {
      console.error("triumph-tracking-manager.ts: ");
      return;
    }
    const questTracker = getQuestTracker();
    if (questTracker.has(legacyDef.LegacyType, "triumph")) {
      this.addTriumphToQuestTracker(legacyDef);
    }
  }
  /**
   * Public exposure for tracked triumphs to be (re-)sent to quest tracker.
   * Required for hotseat when switching players.
   */
  refreshQuestTracker() {
    this.readTrackedTriumphs();
  }
  // Parse the tracked triumphs from disk and add them to the quest tracker
  readTrackedTriumphs() {
    const serializedTriumphIDs = this.catalog.getObject(TRACKED_TRIUMPH_OBJECT_NAME).read(TRACKED_TRIUMPH_KEY_NAME);
    if (!serializedTriumphIDs || serializedTriumphIDs == "") {
      return;
    }
    const unserializedTriumphIDs = serializedTriumphIDs.split("|");
    unserializedTriumphIDs.forEach((triumphID) => {
      const legacyDefinition = GameInfo.Legacies.lookup(triumphID);
      if (legacyDefinition == null) {
        console.error(
          "triumph-tracking-manager: unable to find legacy definition for triumph of type: " + triumphID
        );
        return;
      }
      this.addTriumphToQuestTracker(legacyDefinition);
    });
  }
  //Do the actual adding the triumph to the quest tracker
  addTriumphToQuestTracker(triumph) {
    const localPlayerLegacies = Players.get(this.playerId)?.Legacies;
    if (!localPlayerLegacies) {
      console.error("triumph-tracking-manager: unable to get legacies object for local player: " + this.playerId);
      return;
    }
    const triumphQuestItem = {
      id: triumph.LegacyType,
      title: Locale.compose(triumph.Name),
      description: triumph.TriggerDescription,
      getCurrentProgress: () => {
        const progress = localPlayerLegacies.getProgress(triumph.LegacyType)?.progress;
        if (!progress || !progress[0].current) {
          return "0";
        }
        return progress[0].current.toString();
      },
      getCurrentGoal: () => {
        const progress = localPlayerLegacies.getProgress(triumph.LegacyType)?.progress;
        if (!progress || !progress[0].total) {
          console.error(
            "triumph-tracking-manager: unable to get total progress of triumph of type: " + triumph.LegacyType
          );
          return "0";
        }
        return progress[0].total.toString();
      },
      system: "triumph",
      progressType: ""
    };
    const questTracker = getQuestTracker();
    questTracker.add(triumphQuestItem);
  }
  //Add triumph to quest tracker and write the new list of tracked triumphs to disk
  trackTriumph(triumph) {
    this.addTriumphToQuestTracker(triumph);
    this.writeTrackedLegacies();
  }
  //Remove triumph from the quest tracker and write the new list to disk
  unTrackTriumph(triumph) {
    const questTracker = getQuestTracker();
    if (questTracker.has(triumph.LegacyType, "triumph")) {
      questTracker.remove(triumph.LegacyType, "triumph");
    }
    this.writeTrackedLegacies();
  }
  onClickTrackTriumph(legacyType) {
    const legacy = GameInfo.Legacies.lookup(legacyType);
    if (!legacy) {
      console.error("legacies-model: unable to get legacy definition of legacy of type: " + legacyType);
      return;
    }
    const questTracker = getQuestTracker();
    if (questTracker.has(legacyType, "triumph")) {
      this.unTrackTriumph(legacy);
    } else {
      this.trackTriumph(legacy);
    }
  }
  //Do the actual serialization and writing to disk
  writeTrackedLegacies() {
    let serializedTriumphIDs = "";
    const questTracker = getQuestTracker();
    const allQuestitems = Array.from(questTracker.getItems());
    allQuestitems.forEach((questItem) => {
      if (questItem.system != "triumph") {
        return;
      }
      if (serializedTriumphIDs == "") {
        serializedTriumphIDs = questItem.id;
        return;
      }
      serializedTriumphIDs += "|" + questItem.id;
    });
    this.catalog.getObject(TRACKED_TRIUMPH_OBJECT_NAME).write(TRACKED_TRIUMPH_KEY_NAME, serializedTriumphIDs);
  }
}
const instances = [];
function getTriumphTrackingManager() {
  const playerId = GameContext.localObserverID;
  if (playerId > 999) {
    throw new Error(`triumph-tracker-manager: Player ID of "${playerId}" exceeds maximum supported value of 999.`);
  }
  if (!instances[playerId]) {
    instances[playerId] = new TriumphTrackingManagerClass(playerId);
  }
  return instances[playerId];
}
window.addEventListener(QuestTrackerRefreshRequestName, () => {
  getTriumphTrackingManager().refreshQuestTracker();
});
getTriumphTrackingManager();

export { TriumphTrackingManagerClass, getTriumphTrackingManager };
//# sourceMappingURL=triumph-tracking-manager.js.map
