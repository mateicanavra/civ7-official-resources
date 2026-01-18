import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { P as PlotCoord } from '../../../core/ui/utilities/utilities-plotcoord.chunk.js';
import { NotificationModel } from '../notification-train/model-notification-train.js';
import TutorialItem, { TutorialLevel, TutorialCalloutType, TutorialAnchorPosition, TutorialAdvisorType } from '../tutorial/tutorial-item.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

class WatchOutManagerClass extends DisplayHandlerBase {
  static instance = null;
  isNotificationPanelRaised = false;
  currentWatchOutPopupData = null;
  get isManagerActive() {
    return Configuration.getUser().tutorialLevel >= TutorialLevel.WarningsOnly;
  }
  constructor() {
    super("WatchOutManager", 8500);
    if (WatchOutManagerClass.instance) {
      console.error("Only one instance of the WatchOut manager class can exist at a time!");
    }
    WatchOutManagerClass.instance = this;
  }
  isShowing() {
    return ContextManager.hasInstanceOf("screen-watch-out");
  }
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    this.currentWatchOutPopupData = request;
    ContextManager.push("screen-watch-out", { singleton: true });
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(_request, _options) {
    this.currentWatchOutPopupData = null;
    ContextManager.pop("screen-watch-out");
    this.isNotificationPanelRaised = false;
  }
  canShow(_request, _activeRequests) {
    return !ContextManager.hasInstanceOf("screen-watch-out");
  }
  closePopup = () => {
    if (this.currentWatchOutPopupData) {
      DisplayQueueManager.close(this.currentWatchOutPopupData);
      this.isNotificationPanelRaised = false;
    }
  };
  raiseNotificationPanel(notificationId, advisorType, lookAtCallback) {
    if (!this.isManagerActive) {
      NotificationModel.manager.dismiss(notificationId);
      return;
    }
    if (this.isShowing() || this.isNotificationPanelRaised) {
      console.warn(
        "watch-out-manager: raiseNotificationPanel(): A blocking notification " + notificationId.id + " cannot be added to the display queue, dismiss the previous before."
      );
      return;
    }
    const type = Game.Notifications.getType(notificationId);
    if (!type) {
      console.error(
        `Tutorial: Cannot push a notification with an invalid type for notification id: ${notificationId}`
      );
      return;
    }
    const name = Game.Notifications.getTypeName(type) || type.toString();
    const message = Game.Notifications.getMessage(notificationId) || "";
    const summary = Game.Notifications.getSummary(notificationId) || "";
    const notification = Game.Notifications.find(notificationId);
    const location = notification?.Location;
    const calloutDismiss = {
      callback: () => {
        NotificationModel.manager.dismiss(notificationId);
      },
      text: "LOC_TUTORIAL_CALLOUT_DISMISS",
      actionKey: "inline-cancel",
      closes: true
    };
    const calloutTakeMe = {
      callback: () => {
        const notification2 = Game.Notifications.find(notificationId);
        if (lookAtCallback && notification2) {
          lookAtCallback(notificationId);
        } else if (location && PlotCoord.isValid(location)) {
          Camera.lookAtPlot(location);
        }
        NotificationModel.manager.dismiss(notificationId);
      },
      text: "LOC_TUTORIAL_CALLOUT_TAKE_ME",
      actionKey: "inline-accept",
      closes: true
    };
    const hasExtraContent = notification?.Location != void 0 && PlotCoord.isValid(notification?.Location);
    const dialogTutorialDef = {
      ID: name,
      callout: {
        title: message,
        advisor: {
          text: summary
        },
        advisorType: advisorType || TutorialAdvisorType.Default,
        anchorPosition: TutorialAnchorPosition.MiddleRight,
        type: TutorialCalloutType.NOTIFICATION,
        option1: hasExtraContent ? calloutTakeMe : calloutDismiss,
        // TODO: should take us to a point in the map or screen
        option2: hasExtraContent ? calloutDismiss : void 0
      }
    };
    const TutorialData = new TutorialItem(dialogTutorialDef);
    const watchOutPopupData = {
      category: this.getCategory(),
      item: TutorialData
    };
    this.isNotificationPanelRaised = true;
    this.addDisplayRequest(watchOutPopupData);
  }
}
const WatchOutManager = new WatchOutManagerClass();
DisplayQueueManager.registerHandler(WatchOutManager);

export { WatchOutManager as default };
//# sourceMappingURL=watch-out-manager.js.map
