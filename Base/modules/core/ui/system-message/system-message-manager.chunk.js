import ContextManager from '../context-manager/context-manager.js';
import { b as DisplayHandlerBase, a as DialogBoxManager, D as DialogBoxAction } from '../dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../context-manager/display-queue-manager.js';

class SystemMessageManagerClass extends DisplayHandlerBase {
  showInviteListener = (data) => {
    this.onShowInvite(data);
  };
  OnlineErrorListener = (data) => {
    this.DisplayOnlineError(data);
  };
  LoadLatestSaveGameListener = this.onActivityLoadLastSaveGame.bind(this);
  HostMPGameListener = this.onActivityHostMPGame.bind(this);
  pendingInviteJoinCode = "";
  pendingInviteInviterName = "";
  currentSystemMessage = null;
  errorMessagesCodes = {
    [OnlineErrorType.ONLINE_PROMO_REDEEM_FAILED]: {
      title: "LOC_ONLINE_REDEEM_ERROR_TITLE",
      message: "LOC_ONLINE_REDEEM_ERROR_BODY"
    }
  };
  constructor() {
    super("SystemMessage", 3e3);
    engine.on("ShowInvitePopup", this.showInviteListener);
    engine.on("DNAErrorOccurred", this.OnlineErrorListener);
    engine.on("LaunchToLoadLastSaveGame", this.LoadLatestSaveGameListener);
    engine.on("RequestConfirmHostMPGame", this.HostMPGameListener);
  }
  onShowInvite(data) {
    this.pendingInviteInviterName = data.playerName;
    this.pendingInviteJoinCode = data.inviteId;
    if (UI.isInGame()) {
      return;
    }
    this.showInvitePopup(data.playerName, data.inviteId);
  }
  showInvitePopup(inviterName, joinCode) {
    const joinButtonData = {
      callback: () => {
        if (UI.isInGame()) {
          const okOption = {
            actions: ["accept"],
            label: Locale.compose("LOC_GENERIC_OK"),
            callback: () => {
              const configSaveType = GameStateStorage.getGameConfigurationSaveType();
              const configServerType = Network.getServerType();
              ContextManager.push("screen-save-load", {
                singleton: true,
                createMouseGuard: true,
                attributes: {
                  "menu-type": "save",
                  "server-type": configServerType,
                  "save-type": configSaveType,
                  "from-invite": true
                }
              });
            }
          };
          const cancelOption = {
            actions: ["cancel", "keyboard-escape"],
            label: Locale.compose("LOC_GENERIC_NO"),
            callback: () => {
              Network.acceptInvite(joinCode);
            }
          };
          DialogBoxManager.createDialog_MultiOption({
            body: "LOC_SYSTEM_MESSAGE_GAME_INVITE_SAVE_GAME_CONTENT",
            title: "LOC_SYSTEM_MESSAGE_GAME_INVITE_SAVE_GAME_TITLE",
            options: [okOption, cancelOption]
          });
        } else {
          Network.acceptInvite(joinCode);
        }
      },
      caption: Locale.compose("LOC_SYSTEM_MESSAGE_GAME_INVITE_JOIN")
    };
    const declineButtonData = {
      callback: () => {
        Network.declineInvite(joinCode);
      },
      caption: Locale.compose("LOC_SYSTEM_MESSAGE_GAME_INVITE_DECLINE")
    };
    const systemMessageData = {
      systemMessageTitle: Locale.compose("LOC_SYSTEM_MESSAGE_GAME_INVITE_TITLE", inviterName),
      systemMessageContent: UI.isInGame() ? Locale.compose("LOC_SYSTEM_MESSAGE_GAME_INVITE_CONTENT_IN_GAME", inviterName) : Locale.compose("LOC_SYSTEM_MESSAGE_GAME_INVITE_CONTENT", inviterName),
      buttonData: [joinButtonData, declineButtonData]
    };
    this.addDisplayRequest(systemMessageData, true);
  }
  show() {
    if (DialogBoxManager.isDialogBoxOpen || !this.currentSystemMessage) {
      return;
    }
    ContextManager.push("screen-system-message", { singleton: true, createMouseGuard: true });
  }
  hide() {
    ContextManager.pop("screen-system-message");
  }
  showPendingInvitePopup() {
    this.showInvitePopup(this.pendingInviteInviterName, this.pendingInviteJoinCode);
  }
  acceptInviteAfterSaveComplete() {
    if (this.pendingInviteJoinCode == "") {
      console.error(
        "system-message-manager: Attempting to accept game invite after succesful save but pendingInviteJoinCode is invalid!"
      );
      return;
    }
    Network.acceptInvite(this.pendingInviteJoinCode);
  }
  DisplayOnlineError(data) {
    const translation = this.errorMessagesCodes[data.ErrorType];
    if (translation == void 0) {
      console.log("Missing translation for error: ", data.ErrorType);
      return;
    }
    this.displayMessage(translation.title, translation.message);
  }
  displayMessage(messageTitle, messageBody) {
    if (messageTitle != "" && messageBody == "" || messageTitle == "" && messageBody != "") {
      console.warn(
        "displayError(): error dialog only works with both errorTitle and errorBody being non-empty. errorTitle=${errorTitle}, errorBody=${errorBody}"
      );
    }
    ContextManager.pop("screen-dialog-box");
    if (Network.getLocalHostingPlatform() != HostingType.HOSTING_TYPE_GAMECENTER) {
      ContextManager.popUntil("screen-mp-browser");
    } else {
      ContextManager.clear();
    }
    if (messageTitle != "" && messageBody != "") {
      const gameErrorDialogCallback = () => {
      };
      DialogBoxManager.createDialog_Confirm({
        title: messageTitle,
        body: messageBody,
        callback: gameErrorDialogCallback
      });
    }
  }
  onActivityLoadLastSaveGame() {
    if (UI.isInGame()) {
      const dbCallback = (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          UI.activityLoadLastSaveGameConfirmed();
        }
      };
      DialogBoxManager.createDialog_ConfirmCancel({
        body: "LOC_UI_ACTIVITY_LAST_SAVE_DESC",
        title: UI.isMultiplayer() ? "LOC_UI_ACTIVITY_LEAVE_MP_GAME_TITLE" : "LOC_UI_ACTIVITY_LEAVE_GAME_TITLE",
        displayQueue: "SystemMessage",
        canClose: false,
        callback: dbCallback
      });
    } else {
      UI.activityLoadLastSaveGameConfirmed();
    }
  }
  onActivityHostMPGame() {
    if (UI.isInGame()) {
      const dbCallback = (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          UI.activityHostMPGameConfirmed();
          engine.call("exitToMainMenu");
        }
      };
      DialogBoxManager.createDialog_ConfirmCancel({
        body: "LOC_UI_ACTIVITY_HOST_MP_DESC",
        title: UI.isMultiplayer() ? "LOC_UI_ACTIVITY_LEAVE_MP_GAME_TITLE" : "LOC_UI_ACTIVITY_LEAVE_GAME_TITLE",
        displayQueue: "SystemMessage",
        canClose: false,
        callback: dbCallback
      });
    } else {
      UI.activityHostMPGameConfirmed();
    }
  }
}
const SystemMessageManager = new SystemMessageManagerClass();
DisplayQueueManager.registerHandler(SystemMessageManager);

export { SystemMessageManager as S };
//# sourceMappingURL=system-message-manager.chunk.js.map
