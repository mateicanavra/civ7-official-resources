import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { DisplayHandlerBase } from '../../../../core/ui/context-manager/display-handler.js';
import { DisplayQueueManager } from '../../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { createTriumphData } from './legacies-model.js';
import { getTriumphTrackingManager } from './triumph-tracking-manager.js';

class TriumphCompleteQueueManagerClass extends DisplayHandlerBase {
  static instance = null;
  currentTriumphData = null;
  constructor() {
    super("TrimpuhCompletePopup", 8010);
    if (TriumphCompleteQueueManagerClass.instance) {
      console.error(
        "triumph-complete-queue-manager: Only one instance of the manager class can exist at a time!"
      );
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
        "triumph-complete-queue-manager: Unable to find triumph definition for triumph of type: " + event.legacy
      );
      return;
    }
    if (event.player != GameContext.localPlayerID) {
      if (legacyDef.FirstPlayerOnly) {
        getTriumphTrackingManager().unTrackTriumph(legacyDef);
      }
      return;
    }
    if (Configuration.getGame().isHotseat && legacyDef.FirstPlayerOnly) {
      getTriumphTrackingManager().setTriumphToUntrack(legacyDef);
    }
    getTriumphTrackingManager().unTrackTriumph(legacyDef);
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

export { TriumphCompleteQueueManager };
//# sourceMappingURL=triumph-complete-queue-manager.js.map
