import { TutorialItemState } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';

class TutorialInspectorModel {
  items = [];
  _OnUpdate;
  constructor() {
    engine.whenReady.then(() => {
      waitUntilValue(() => {
        return TutorialManager;
      }).then(() => {
        TutorialManager.statusChanged.on(() => {
          this.update();
        });
        this.update();
      });
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  /**
   * Create a list of activating events as a string
   * @param {TutorailItem} item
   * @returns {string} Comma separated list of events that will activate this tutorial item.
   */
  activatingEventsToString(item) {
    let events = "";
    item.activationEngineEvents.forEach((event) => {
      if (events.length > 0) events += ",";
      events += event;
    });
    item.activationCustomEvents.forEach((event) => {
      if (events.length > 0) events += ",";
      events += event;
    });
    return events;
  }
  update() {
    this.items = [];
    TutorialManager.items.forEach((item) => {
      this.items.push({
        ID: item.skip ? `(${item.ID})` : item.ID,
        // place in () if skipped
        eState: item.eState,
        isActive: item.isActive,
        isCompleted: item.isCompleted,
        status: TutorialItemState[item.eState],
        hasEventListeners: item.activationEngineEvents.length > 0,
        activateLabel: Locale.compose(this.activatingEventsToString(item)),
        index: this.items.length
      });
    });
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
}
const TutorialData = new TutorialInspectorModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(TutorialData);
  };
  engine.createJSModel("g_TutorialInspector", TutorialData);
  TutorialData.updateCallback = updateModel;
});

export { TutorialData as default };
//# sourceMappingURL=model-tutorial-inspector.js.map
