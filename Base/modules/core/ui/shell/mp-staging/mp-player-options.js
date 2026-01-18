import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { abuseReasonToName } from '../../utilities/utilities-online.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame class=\"mp-player-options-frame\">\r\n\t<fxs-vslot class=\"main-container\">\r\n\t\t<div class=\"leader-portrait\"></div>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"add-Plat-Friend\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_ADD_PLAT_FRIEND\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"add-2K-Friend\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_ADD_T2GP_FRIEND\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"report\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_REPORT\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"block\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_BLOCK\"\r\n\t\t></fxs-button>\r\n\t</fxs-vslot>\r\n\t<fxs-close-button></fxs-close-button>\r\n</fxs-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-player-options.css";

class PanelMPPlayerOptions extends Panel {
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  closeButtonListener = (_event) => {
    this.onClose();
  };
  reportButtonListener = (_event) => {
    this.onReport();
  };
  blockButtonListener = (_event) => {
    this.onBlock();
  };
  reportButton = null;
  blockButton = null;
  networkFriendID = "";
  t2gpFriendID = "";
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  onAttach() {
    super.onAttach();
    const frame = MustGetElement(".mp-player-options-frame", this.Root);
    const mainContainer = MustGetElement(".main-container", frame);
    const leaderPortrait = MustGetElement(".leader-portrait", mainContainer);
    this.reportButton = MustGetElement(".report", mainContainer);
    this.blockButton = MustGetElement(".block", mainContainer);
    const addPlatFriendButton = MustGetElement(".add-Plat-Friend", mainContainer);
    const add2KFriendButton = MustGetElement(".add-2K-Friend", mainContainer);
    const closeButton = MustGetElement("fxs-close-button", frame);
    const playerIdAttribute = this.Root.getAttribute("playerId");
    if (!playerIdAttribute) {
      console.error("mp-player-options: onAttach(): Missing 'playerId' attribute");
      return;
    }
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const playerID = parseInt(playerIdAttribute);
    const playerConfig = Configuration.getPlayer(playerID);
    frame.setAttribute("title", playerConfig.slotName);
    this.networkFriendID = Online.Social.getPlayerFriendID_Network(playerID);
    this.t2gpFriendID = Online.Social.getPlayerFriendID_T2GP(playerID);
    const localPlatform = Network.getLocalHostingPlatform();
    const playerPlatform = Network.getPlayerHostingPlatform(playerID);
    if (this.networkFriendID == "" || localPlatform != playerPlatform || Online.Social.isUserFriend(this.networkFriendID)) {
      addPlatFriendButton.classList.add("hidden");
    } else {
      addPlatFriendButton.addEventListener("action-activate", () => {
        this.onAddFriend(this.networkFriendID);
      });
    }
    if (this.t2gpFriendID == "" || Online.Social.isUserFriend(this.t2gpFriendID)) {
      add2KFriendButton.classList.add("hidden");
    } else {
      add2KFriendButton.addEventListener("action-activate", () => {
        this.onAddFriend(this.t2gpFriendID);
      });
    }
    if (this.t2gpFriendID == "") {
      this.reportButton.classList.add("hidden");
      this.blockButton.classList.add("hidden");
    } else {
      this.reportButton.addEventListener("action-activate", this.reportButtonListener);
      this.blockButton.addEventListener("action-activate", this.blockButtonListener);
    }
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    if (Online.Social.isPlayerBlocked(playerID)) {
      this.blockButton.setAttribute("caption", Locale.compose("LOC_UI_MP_PLAYER_OPTIONS_UNBLOCK"));
    }
    let leaderPortraitURL = "";
    if (playerConfig.leaderTypeName) {
      leaderPortraitURL = UI.getIconURL(
        playerConfig.leaderTypeName != "RANDOM" ? playerConfig.leaderTypeName : "UNKNOWN_LEADER"
      );
    }
    leaderPortrait.style.backgroundImage = `url(${leaderPortraitURL})`;
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    FocusManager.setFocus(this.reportButton);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
        this.onClose(inputEvent);
        break;
    }
  }
  onClose(inputEvent) {
    this.close();
    if (inputEvent) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onAddFriend(friendID) {
    Online.Social.sendFriendRequest(friendID);
    this.close();
  }
  onReport() {
    const playerIdAttribute = this.Root.getAttribute("playerId");
    if (playerIdAttribute) {
      const playerID = parseInt(playerIdAttribute);
      const reasons = Online.Social.getReportingReasonsPlayer(playerID);
      const reasonOptions = [];
      for (let reasonNum = 0; reasonNum < reasons.length; reasonNum++) {
        const abuseReasonName = abuseReasonToName.get(reasons[reasonNum]);
        if (abuseReasonName != void 0) {
          const newReasonOption = {
            actions: ["accept"],
            label: Locale.compose(abuseReasonName),
            callback: () => {
              this.createReportDialog(reasons[reasonNum]);
            }
          };
          reasonOptions.push(newReasonOption);
        }
      }
      const cancelOption = {
        actions: ["cancel", "keyboard-escape"],
        label: "LOC_GENERIC_CANCEL"
      };
      reasonOptions.push(cancelOption);
      DialogBoxManager.createDialog_MultiOption({
        title: "LOC_UI_MP_REPORT_PLAYER_TITLE",
        body: "LOC_UI_MP_REPORT_PLAYER_BODY",
        options: reasonOptions
      });
    }
  }
  onBlock() {
    const playerIdAttribute = this.Root.getAttribute("playerId");
    if (playerIdAttribute) {
      const playerID = parseInt(playerIdAttribute);
      if (Online.Social.isPlayerBlocked(playerID)) {
        Online.Social.unblockPlayer(playerID);
        this.close();
      } else {
        Online.Social.blockPlayer(playerID);
        this.close();
      }
    }
  }
  createReportDialog(reason) {
    ContextManager.push("screen-mp-report", {
      singleton: true,
      createMouseGuard: true,
      attributes: { blackOut: true, reportUserId: this.t2gpFriendID, reportReason: reason }
    });
  }
}
Controls.define("screen-mp-player-options", {
  createInstance: PanelMPPlayerOptions,
  description: "Create popup for Multiplayer Lobby Player Options.",
  classNames: ["mp-player-options"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "playerId"
    }
  ]
});
//# sourceMappingURL=mp-player-options.js.map
