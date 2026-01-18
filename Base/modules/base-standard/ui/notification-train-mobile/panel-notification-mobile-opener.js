import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { NotificationModel } from '../notification-train/model-notification-train.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const styles = "fs://game/base-standard/ui/notification-train-mobile/panel-notification-mobile-opener.css";

class NotificationPanelOpener extends Panel {
  notificationCount = 0;
  buttonNtfAmt = document.createElement("div");
  navHelpContainer = document.createElement("div");
  button = document.createElement("fxs-activatable");
  needRebuild = true;
  activeDeviceChangedListener = this.onActiveDeviceChanged.bind(this);
  focusNotificationsListener = this.onOpenMobileTrain.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  notificationAddedListener = this.onNotificationAdded.bind(this);
  notificationRemovedListener = this.onNotificationRemoved.bind(this);
  notificationUpdateListener = this.onNotificationUpdated.bind(this);
  notificationRebuildEventListener = this.onNotificationRebuild.bind(this);
  onInitialize() {
    super.onInitialize();
    const notificationTrainDecor = document.createElement("div");
    notificationTrainDecor.classList.add("notification-train__decor");
    this.navHelpContainer.classList.add("notification-train__nav-help-container");
    this.navHelpContainer.classList.toggle("gamepad-active", ActionHandler.isGamepadActive);
    notificationTrainDecor.appendChild(this.navHelpContainer);
    const navHelp = document.createElement("fxs-nav-help");
    navHelp.setAttribute("action-key", "inline-notification");
    navHelp.setAttribute("decoration-mode", "border");
    const navHelpExt = document.createElement("div");
    navHelpExt.classList.add("notification-train__nav-help-ext");
    this.navHelpContainer.append(navHelp, navHelpExt);
    this.Root.append(notificationTrainDecor, this.createButton());
  }
  onAttach() {
    super.onAttach();
    NotificationModel.manager.eventNotificationAdd.on(this.notificationAddedListener);
    NotificationModel.manager.eventNotificationRemove.on(this.notificationRemovedListener);
    NotificationModel.manager.eventNotificationUpdate.on(this.notificationUpdateListener);
    NotificationModel.manager.eventNotificationRebuild.on(this.notificationRebuildEventListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    window.addEventListener("focus-notifications", this.focusNotificationsListener);
    engine.on("InputContextChanged", this.inputContextChangedListener);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    window.removeEventListener("focus-notifications", this.focusNotificationsListener);
    NotificationModel.manager.eventNotificationAdd.off(this.notificationAddedListener);
    NotificationModel.manager.eventNotificationRemove.off(this.notificationRemovedListener);
    NotificationModel.manager.eventNotificationUpdate.off(this.notificationUpdateListener);
    NotificationModel.manager.eventNotificationRebuild.off(this.notificationRebuildEventListener);
    engine.off("InputContextChanged", this.inputContextChangedListener);
    super.onDetach();
  }
  onActiveDeviceChanged() {
    this.navHelpContainer?.classList.toggle("gamepad-active", ActionHandler.isGamepadActive);
  }
  createButton() {
    this.button.classList.add("nmo__button");
    this.button.addEventListener("action-activate", (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.onOpenMobileTrain();
    });
    const buttonBackground = document.createElement("div");
    buttonBackground.classList.add("nmo__button-bk");
    this.button.appendChild(buttonBackground);
    const buttonContent = document.createElement("div");
    buttonContent.classList.add("nmo__button-content");
    this.button.appendChild(buttonContent);
    this.buttonNtfAmt.classList.add("nmo__button-notification-amt");
    this.refreshNotificationAmount();
    buttonContent.appendChild(this.buttonNtfAmt);
    const buttonIcon = document.createElement("div");
    buttonIcon.classList.add("nmo__button-icon");
    buttonContent.appendChild(buttonIcon);
    return this.button;
  }
  onNotificationAdded(notificationId) {
    if (notificationId.owner == GameContext.localPlayerID) {
      this.refreshNotificationAmount();
    }
  }
  onNotificationRemoved(notificationId) {
    if (notificationId.owner == GameContext.localPlayerID) {
      this.refreshNotificationAmount();
    }
  }
  onNotificationRebuild() {
    this.needRebuild = true;
  }
  onNotificationUpdated() {
    if (this.needRebuild) {
      this.refreshNotificationAmount();
    }
  }
  onOpenMobileTrain() {
    if (this.notificationCount > 0) {
      ContextManager.push("notifications-train-mobile", { singleton: true, createMouseGuard: true });
    }
  }
  refreshNotificationAmount() {
    if (this.buttonNtfAmt) {
      while (this.buttonNtfAmt.lastChild) {
        this.buttonNtfAmt.removeChild(this.buttonNtfAmt.lastChild);
      }
      this.notificationCount = NotificationModel.manager.getNotificationCount(GameContext.localObserverID);
      if (this.notificationCount > 0) {
        const text = document.createElement("div");
        text.classList.add(
          "nmo__button-number-text",
          "font-fit-shrink",
          "font-title-sm",
          "text-center",
          "text-secondary"
        );
        text.innerHTML = this.notificationCount.toString();
        this.buttonNtfAmt.appendChild(text);
      }
      const indicatorIsHidden = this.button.classList.contains("hidden");
      if (!indicatorIsHidden && this.notificationCount == 0) {
        setTimeout(() => {
        }, 500);
      }
      this.button.style.visibility = this.notificationCount == 0 ? "hidden" : "visible";
      this.navHelpContainer?.classList.toggle("notification-available", this.notificationCount > 0);
    }
    this.needRebuild = false;
  }
  onInputContextChanged(contextData) {
    if (contextData.newContext != InputContext.Dual) {
      this.navHelpContainer.classList.remove("invisible");
    } else {
      this.navHelpContainer.classList.add("invisible");
    }
  }
}
Controls.define("notification-panel-opener", {
  createInstance: NotificationPanelOpener,
  description: "Button to open the notification panel",
  classNames: ["notification-panel-opener"],
  styles: [styles]
});
//# sourceMappingURL=panel-notification-mobile-opener.js.map
