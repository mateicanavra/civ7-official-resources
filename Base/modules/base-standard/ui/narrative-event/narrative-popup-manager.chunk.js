import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';

var NarrativePopupTypes = /* @__PURE__ */ ((NarrativePopupTypes2) => {
  NarrativePopupTypes2[NarrativePopupTypes2["REGULAR"] = 0] = "REGULAR";
  NarrativePopupTypes2[NarrativePopupTypes2["MODEL"] = 1] = "MODEL";
  NarrativePopupTypes2[NarrativePopupTypes2["DISCOVERY"] = 2] = "DISCOVERY";
  NarrativePopupTypes2[NarrativePopupTypes2["TRIAL"] = 3] = "TRIAL";
  return NarrativePopupTypes2;
})(NarrativePopupTypes || {});
class NarrativePopupManagerImpl extends DisplayHandlerBase {
  currentNarrativeData = null;
  isNotificationPanelRaised = false;
  notificationID = null;
  static instance = null;
  constructor() {
    super("Narrative", 7500);
    if (NarrativePopupManagerImpl.instance) {
      console.error("Only one instance of the NarrativePopupManager class can exist at a time!");
    }
    NarrativePopupManagerImpl.instance = this;
  }
  raiseNotificationPanel(notificationId, _activatedBy) {
    if (this.isShowing() || this.isNotificationPanelRaised) {
      console.warn(
        "narrative-popup-manager: raiseNotificationPanel(): A blocking notification " + notificationId.id + " cannot be added to the display queue, dismiss the previous before."
      );
      return;
    }
    this.notificationID = notificationId;
    const notification = Game.Notifications.find(notificationId);
    if (!notification) {
      return;
    }
    if (_activatedBy == null) {
      return false;
    }
    const player = Players.get(_activatedBy);
    if (!player) {
      return false;
    }
    let currentStoryType = 0 /* REGULAR */;
    let currentStoryID = 0;
    const playerStories = player?.Stories;
    if (playerStories) {
      const targetStoryId = playerStories?.getFirstPendingMetId();
      if (targetStoryId) {
        const story = playerStories.find(targetStoryId);
        if (story) {
          currentStoryID = story.id;
          const storyDef = GameInfo.NarrativeStories.lookup(story.type);
          if (storyDef) {
            if (storyDef.UIActivation == "LIGHT" || storyDef.UIActivation == "DISCOVERY") {
              currentStoryType = 2 /* DISCOVERY */;
              this.isNotificationPanelRaised = true;
            }
            if (storyDef.UIActivation == "3DPANEL") {
              currentStoryType = 1 /* MODEL */;
              this.isNotificationPanelRaised = true;
            }
            if (storyDef.UIActivation == "TRIAL") {
              currentStoryType = 3 /* TRIAL */;
              this.isNotificationPanelRaised = true;
            }
          }
        }
      }
    }
    this.isNotificationPanelRaised = true;
    const narrativePopupData = {
      type: currentStoryType,
      storyID: currentStoryID,
      playerID: _activatedBy
    };
    this.addDisplayRequest(narrativePopupData);
    return;
  }
  closePopup = () => {
    if (this.currentNarrativeData) {
      DisplayQueueManager.close(this.currentNarrativeData);
      this.isNotificationPanelRaised = false;
    }
  };
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    this.currentNarrativeData = request;
    if (request.type == 1 /* MODEL */) {
      ContextManager.push("graphic-narrative-event", {
        singleton: true,
        createMouseGuard: false,
        viewChangeMethod: UIViewChangeMethod.PlayerInteraction,
        panelOptions: { notificationId: this.notificationID }
      });
    } else if (request.type == 2 /* DISCOVERY */) {
      ContextManager.push("small-narrative-event", {
        singleton: true,
        createMouseGuard: false,
        viewChangeMethod: UIViewChangeMethod.PlayerInteraction,
        panelOptions: { notificationId: this.notificationID }
      });
    } else if (request.type == 0 /* REGULAR */) {
      ContextManager.push("screen-narrative-event", {
        singleton: true,
        createMouseGuard: true,
        viewChangeMethod: UIViewChangeMethod.PlayerInteraction,
        panelOptions: { notificationId: this.notificationID }
      });
    } else if (request.type == 3 /* TRIAL */) {
      ContextManager.push("screen-narrative-trial", {
        singleton: true,
        createMouseGuard: true,
        viewChangeMethod: UIViewChangeMethod.PlayerInteraction,
        panelOptions: { notificationId: this.notificationID }
      });
    } else {
      console.warn("narrative-popup-manager: unhandled narrative " + request.type);
    }
    const narrativeData = {
      PlayerId: request.playerID,
      StoryId: request.storyID
    };
    Telemetry.sendNarrativeOpened(narrativeData);
  }
  isShowing() {
    if (ContextManager.hasInstanceOf("graphic-narrative-event") || ContextManager.hasInstanceOf("small-narrative-event") || ContextManager.hasInstanceOf("screen-narrative-event") || ContextManager.hasInstanceOf("screen-narrative-trial")) {
      return true;
    }
    return false;
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(request, _options) {
    if (request.type == 1 /* MODEL */) {
      ContextManager.pop("graphic-narrative-event");
    } else if (request.type == 2 /* DISCOVERY */) {
      ContextManager.pop("small-narrative-event");
    } else if (request.type == 3 /* TRIAL */) {
      ContextManager.pop("screen-narrative-trial");
    } else if (request.type == 0 /* REGULAR */) {
      ContextManager.pop("screen-narrative-event");
    } else {
      console.warn("narrative-popup-manager: unhandled narrative " + request.type);
    }
    if (this.currentNarrativeData == request) {
      this.currentNarrativeData = null;
    }
    this.isNotificationPanelRaised = false;
  }
}
const NarrativePopupManager = new NarrativePopupManagerImpl();
DisplayQueueManager.registerHandler(NarrativePopupManager);

export { NarrativePopupManager as N };
//# sourceMappingURL=narrative-popup-manager.chunk.js.map
