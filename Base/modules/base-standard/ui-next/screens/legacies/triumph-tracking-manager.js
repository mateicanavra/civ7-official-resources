import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { DisplayHandlerBase } from '../../../../core/ui/context-manager/display-handler.js';
import { DisplayQueueManager } from '../../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { Catalog } from '../../../../core/ui/utilities/utility-serialize.js';
import { getQuestTracker } from '../../../ui/quest-tracker/quest-tracker.js';
import { createTriumphData } from './legacies-model.js';

const VERSION = 2;
const TRACKED_TRIUMPH_OBJECT_NAME = "tracked-triumphs";
const TRACKED_TRIUMPH_KEY_NAME = "ids";
class TriumphTrackingManagerClass {
  triumphCatalogName = "TriumphTrackerCatalog";
  catalog;
  constructor() {
    const localPlayerId = GameContext.localObserverID;
    this.catalog = new Catalog({
      name: this.triumphCatalogName,
      version: VERSION,
      player: Players.get(localPlayerId)
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
    if (event.player != GameContext.localPlayerID) {
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
    const localPlayerLegacies = Players.get(GameContext.localPlayerID)?.Legacies;
    if (!localPlayerLegacies) {
      console.error("triumph-tracking-manager: unable to get legacies object for local player");
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
const TriumphTrackingManager = new TriumphTrackingManagerClass();
class TriumphCompleteQueueManagerClass extends DisplayHandlerBase {
  static instance = null;
  currentTriumphData = null;
  constructor() {
    super("TrimpuhCompletePopup", 8010);
    if (TriumphCompleteQueueManagerClass.instance) {
      console.error("Only one instance of the TechCivicPopup manager class can exist at a time!");
    }
    TriumphCompleteQueueManagerClass.instance = this;
    this.initializeListeners();
  }
  initializeListeners() {
    engine.on("PlayerLegacyCompleted", this.onLegacyCompleted, this);
  }
  onLegacyCompleted(event) {
    const legacyDef = GameInfo.Legacies.lookup(event.legacy);
    if (!legacyDef) {
      console.error(
        "triumph-tracking-manager.ts: Unable to find triumph definition for triumph of type: " + event.legacy
      );
      return;
    }
    if (event.player != GameContext.localPlayerID) {
      if (legacyDef.FirstPlayerOnly) {
        TriumphTrackingManager.unTrackTriumph(legacyDef);
      }
      return;
    }
    TriumphTrackingManager.unTrackTriumph(legacyDef);
    if (ContextManager.shouldShowPopup(event.player)) {
      this.addDisplayRequest({ triumphData: createTriumphData(legacyDef) });
    }
  }
  show(request) {
    this.currentTriumphData = request;
    InterfaceMode.switchToDefault();
    ContextManager.push("triumph-complete-popup", { createMouseGuard: true, singleton: true });
  }
  hide() {
    ContextManager.pop("triumph-complete-popup");
    this.currentTriumphData = null;
  }
  closePopup = () => {
    if (this.currentTriumphData) {
      DisplayQueueManager.close(this.currentTriumphData);
    }
  };
  isShowing() {
    return ContextManager.hasInstanceOf("triumph-complete-popup");
  }
}
const TriumphCompleteQueueManager = new TriumphCompleteQueueManagerClass();
DisplayQueueManager.registerHandler(TriumphCompleteQueueManager);

export { TriumphCompleteQueueManager, TriumphTrackingManager, TriumphTrackingManagerClass };
//# sourceMappingURL=triumph-tracking-manager.js.map
