import { D as DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager, D as DialogBoxAction } from '../../dialog-box/manager-dialog-box.chunk.js';
import { F as Focus } from '../../input/focus-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { a as MPFriendsModel } from './model-mp-friends.chunk.js';
import { TabNames, TabNameTypes } from './mp-friends.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { abuseReasonToName, abuseReasonToTooltip } from '../../utilities/utilities-online.js';
import '../../audio-base/audio-support.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-manager.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../social-notifications/social-notifications-manager.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';
import '../../events/shell-events.chunk.js';
import '../../utilities/utilities-network-constants.chunk.js';

const content = "<fxs-frame class=\"mp-friends-options-frame\">\r\n\t<fxs-vslot class=\"main-container\">\r\n\t\t<div class=\"leader-portrait\"></div>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"view-profile\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_VIEW_PROFILE\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"invite-to-join\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_INVITE_FRIEND\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"add-friend\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_ADD_T2GP_FRIEND\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"cancel-friend-request\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_CANCEL_T2GP_FRIEND_REQUEST\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"accept-friend-request\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_ACCEPT_T2GP_FRIEND_REQUEST\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"decline-friend-request\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_DECLINE_T2GP_FRIEND_REQUEST\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"accept-game-invite\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_ACCEPT_T2GP_GAME_INVITE_REQUEST\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"decline-game-invite\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_DECLINE_T2GP_GAME_INVITE_REQUEST\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"block\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_BLOCK\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"unblock\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_UNBLOCK\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"remove-friend\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_REMOVE_FRIEND\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"report\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_REPORT\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"kick\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_KICK\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"mute\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_MUTE\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"unmute\"\r\n\t\t\tcaption=\"LOC_UI_MP_PLAYER_OPTIONS_UNMUTE\"\r\n\t\t></fxs-button>\r\n\t</fxs-vslot>\r\n\t<fxs-close-button></fxs-close-button>\r\n</fxs-frame>\r\n<fxs-model-frame\r\n\tclass=\"mp-options-popup absolute flex flex-col max-w-full max-h-full min-w-187 pointer-events-auto img-modal-frame p-8 self-center hidden\"\r\n>\r\n\t<div class=\"absolute top-2 left-2 bottom-0 w-1\\/2 img-frame-filigree pointer-events-none\"></div>\r\n\t<div class=\"absolute top-2 right-2 bottom-0 w-1\\/2 rotate-y-180 img-frame-filigree pointer-events-none\"></div>\r\n\t<fxs-vslot class=\"items-center\">\r\n\t\t<div\r\n\t\t\tclass=\"font-title text-secondary text-2xl\"\r\n\t\t\tdata-l10n-id=\"LOC_UI_MP_REPORT_PLAYER_TITLE\"\r\n\t\t></div>\r\n\t\t<div class=\"filigree-divider-h2 w-64 h-8\"></div>\r\n\t\t<div\r\n\t\t\tclass=\"font-body text-primary-1 text mb-12\"\r\n\t\t\tdata-l10n-id=\"LOC_UI_MP_REPORT_PLAYER_BODY\"\r\n\t\t></div>\r\n\t\t<fxs-vslot class=\"mp-options-popup-button-container\"> </fxs-vslot>\r\n\t</fxs-vslot>\r\n</fxs-model-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-friends-options.css";

var SocialButtonTypes = /* @__PURE__ */ ((SocialButtonTypes2) => {
  SocialButtonTypes2[SocialButtonTypes2["VIEW_PROFILE"] = 0] = "VIEW_PROFILE";
  SocialButtonTypes2[SocialButtonTypes2["INVITE_TO_JOIN"] = 1] = "INVITE_TO_JOIN";
  SocialButtonTypes2[SocialButtonTypes2["ADD_FRIEND_REQUEST"] = 2] = "ADD_FRIEND_REQUEST";
  SocialButtonTypes2[SocialButtonTypes2["ACCEPT_FRIEND_ADD_REQUEST"] = 3] = "ACCEPT_FRIEND_ADD_REQUEST";
  SocialButtonTypes2[SocialButtonTypes2["CANCEL_FRIEND_ADD_REQUEST"] = 4] = "CANCEL_FRIEND_ADD_REQUEST";
  SocialButtonTypes2[SocialButtonTypes2["DECLINE_FRIEND_ADD_REQUEST"] = 5] = "DECLINE_FRIEND_ADD_REQUEST";
  SocialButtonTypes2[SocialButtonTypes2["ACCEPT_GAME_INVITE"] = 6] = "ACCEPT_GAME_INVITE";
  SocialButtonTypes2[SocialButtonTypes2["DECLINE_GAME_INVITE"] = 7] = "DECLINE_GAME_INVITE";
  SocialButtonTypes2[SocialButtonTypes2["BLOCK"] = 8] = "BLOCK";
  SocialButtonTypes2[SocialButtonTypes2["UNBLOCK"] = 9] = "UNBLOCK";
  SocialButtonTypes2[SocialButtonTypes2["REMOVE_FRIEND"] = 10] = "REMOVE_FRIEND";
  SocialButtonTypes2[SocialButtonTypes2["REPORT"] = 11] = "REPORT";
  SocialButtonTypes2[SocialButtonTypes2["KICK"] = 12] = "KICK";
  SocialButtonTypes2[SocialButtonTypes2["MUTE"] = 13] = "MUTE";
  SocialButtonTypes2[SocialButtonTypes2["UNMUTE"] = 14] = "UNMUTE";
  SocialButtonTypes2[SocialButtonTypes2["NUM_SOCIAL_BUTTON_TYPES"] = 15] = "NUM_SOCIAL_BUTTON_TYPES";
  return SocialButtonTypes2;
})(SocialButtonTypes || {});
class PanelMPFriendOptions extends Panel {
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  closeButtonListener = (_event) => {
    this.onClose();
  };
  socialButtonListener = [
    this.onViewProfile.bind(this),
    this.onInviteToJoin.bind(this),
    this.onAddFriend.bind(this),
    this.onAcceptRequest.bind(this),
    this.onCancelRequest.bind(this),
    this.onDeclineRequest.bind(this),
    this.onAcceptGameInvite.bind(this),
    this.onDeclineGameInvite.bind(this),
    this.onBlock.bind(this),
    this.onUnBlock.bind(this),
    this.onRemoveFriend.bind(this),
    this.onReport.bind(this),
    this.onKick.bind(this),
    this.onMute.bind(this),
    this.onUnMute.bind(this)
  ];
  buttonElements = [
    ".view-profile",
    ".invite-to-join",
    ".add-friend",
    ".accept-friend-request",
    ".cancel-friend-request",
    ".decline-friend-request",
    ".accept-game-invite",
    ".decline-game-invite",
    ".block",
    ".unblock",
    ".remove-friend",
    ".report",
    ".kick",
    ".mute",
    ".unmute"
  ];
  supportConfirmation = [
    false,
    // view profile
    false,
    // invite to join
    false,
    // add friend
    false,
    // accept friend request
    true,
    // cancel friend request
    false,
    // decline friend request
    false,
    // accept game invite request
    false,
    // decline game invite request
    true,
    // block
    true,
    // unblock
    true,
    // remove friend
    false,
    // report
    true,
    // kick
    false,
    // mute
    false
    // unmute
  ];
  mainContainer;
  socialButtons = [];
  friendId1p = "";
  friendIdT2gp = "";
  playerIdT2gp = "";
  gamertag1p = "";
  gamertagT2gp = "";
  lobbyPlayerId = -1;
  platform = HostingType.HOSTING_TYPE_UNKNOWN;
  is1stParty = false;
  isT2GP = false;
  isGameInvite = false;
  reportDropdownItems = [];
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
    this.mainContainer = MustGetElement(".main-container", this.Root);
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-friends-popups");
  }
  onAttach() {
    super.onAttach();
    const frame = MustGetElement(".mp-friends-options-frame", this.Root);
    const closeButton = MustGetElement("fxs-close-button", frame);
    closeButton.setAttribute("data-audio-group-ref", "audio-mp-friends-popups");
    const friendId1pAttribute = this.Root.getAttribute("friendId1p");
    if (friendId1pAttribute) {
      this.friendId1p = friendId1pAttribute;
    }
    const friendIdT2gpAttribute = this.Root.getAttribute("friendIdT2gp");
    if (friendIdT2gpAttribute) {
      this.friendIdT2gp = friendIdT2gpAttribute;
    }
    const playerIdT2gpAttribute = this.Root.getAttribute("playerIdT2gp");
    if (playerIdT2gpAttribute) {
      this.playerIdT2gp = playerIdT2gpAttribute;
    }
    const gametag1pAttribute = this.Root.getAttribute("gamertag1p");
    if (gametag1pAttribute) {
      this.gamertag1p = gametag1pAttribute;
    }
    const gametagT2gpAttribute = this.Root.getAttribute("gamertagT2gp");
    if (gametagT2gpAttribute) {
      this.gamertagT2gp = gametagT2gpAttribute;
    }
    if (gametagT2gpAttribute) {
      this.gamertagT2gp = gametagT2gpAttribute;
    }
    const lobbyPlayerIdAttribute = this.Root.getAttribute("playerIdLobby");
    if (lobbyPlayerIdAttribute) {
      this.lobbyPlayerId = Number(lobbyPlayerIdAttribute);
    }
    const platformAttribute = this.Root.getAttribute("platform");
    if (platformAttribute) {
      this.platform = Number(platformAttribute);
    }
    const gameInviteAttribute = this.Root.getAttribute("isGameInvite");
    if (gameInviteAttribute) {
      this.isGameInvite = gameInviteAttribute == "true";
    }
    const currentTab = this.Root.getAttribute("currentTab");
    frame.setAttribute("title", this.gamertagT2gp);
    const localHostPlatform = Network.getLocalHostingPlatform();
    const playerHostPlatform = Number.isNaN(this.lobbyPlayerId) ? HostingType.HOSTING_TYPE_UNKNOWN : Network.getPlayerHostingPlatform(this.lobbyPlayerId);
    for (let i = 0; i < 15 /* NUM_SOCIAL_BUTTON_TYPES */; i++) {
      this.socialButtons[i] = MustGetElement(this.buttonElements[i], this.mainContainer);
      this.setButtonActivate(i, false);
    }
    this.is1stParty = this.friendId1p && this.friendId1p != "" && this.platform == localHostPlatform ? true : false;
    this.isT2GP = this.friendIdT2gp && this.friendIdT2gp != "" && this.platform != localHostPlatform ? true : false;
    const gameConfig = Configuration.getGame();
    const screenCheck = !ContextManager.hasInstanceOf("main-menu");
    const lobbyCheck = ContextManager.hasInstanceOf("screen-mp-lobby");
    engine.on("MultiplayerPostPlayerDisconnected", this.onPlayerDisconnected, this);
    if (this.isT2GP) {
      if (playerHostPlatform != localHostPlatform) {
        if (!Online.Social.isUserBlocked(this.friendIdT2gp, true)) {
          this.setButtonActivate(8 /* BLOCK */, true);
        } else {
          this.setButtonActivate(9 /* UNBLOCK */, true);
        }
      }
      this.setButtonActivate(11 /* REPORT */, true);
      if (currentTab == TabNames[TabNameTypes.FriendsListTab]) {
        if ((screenCheck || lobbyCheck) && gameConfig.isInternetMultiplayer) {
          this.setButtonActivate(1 /* INVITE_TO_JOIN */, true);
        }
        this.addFriendInviteButtons(this.friendIdT2gp);
      } else if (currentTab == TabNames[TabNameTypes.BlockTab]) {
      } else if (currentTab == TabNames[TabNameTypes.RecentlyMetTab]) {
        this.addFriendInviteButtons(this.friendIdT2gp);
      } else if (currentTab == TabNames[TabNameTypes.SearchResutsTab]) {
        this.addFriendInviteButtons(this.friendIdT2gp);
      } else if (currentTab == TabNames[TabNameTypes.NotificationsTab]) {
        if (this.isGameInvite) {
          this.setButtonActivate(6 /* ACCEPT_GAME_INVITE */, true);
          this.setButtonActivate(7 /* DECLINE_GAME_INVITE */, true);
        } else {
          if (Online.Social.hasFriendInviteFromUser(this.friendIdT2gp)) {
            this.setButtonActivate(3 /* ACCEPT_FRIEND_ADD_REQUEST */, true);
            this.setButtonActivate(5 /* DECLINE_FRIEND_ADD_REQUEST */, true);
          } else {
            this.setButtonActivate(4 /* CANCEL_FRIEND_ADD_REQUEST */, true);
          }
        }
      } else if (currentTab == TabNames[TabNameTypes.LobbyTab]) {
        this.addFriendInviteButtons(this.friendIdT2gp);
        if (lobbyCheck || gameConfig.isInternetMultiplayer) {
          const gameConfig2 = Configuration.getGame();
          const isKickVote = gameConfig2.isKickVoting;
          if (isKickVote || Network.getHostPlayerId() == GameContext.localPlayerID) {
            this.setButtonActivate(12 /* KICK */, true);
          }
          if (this.lobbyPlayerId != -1) {
            if (Network.isPlayerMuted(this.lobbyPlayerId)) {
              this.setButtonActivate(14 /* UNMUTE */, true);
            } else {
              this.setButtonActivate(13 /* MUTE */, true);
            }
          }
        }
      }
    } else if (this.is1stParty) {
      if (currentTab == TabNames[TabNameTypes.FriendsListTab]) {
        if ((screenCheck || lobbyCheck) && gameConfig.isInternetMultiplayer) {
          this.setButtonActivate(1 /* INVITE_TO_JOIN */, true);
        }
        if (this.playerIdT2gp) {
          this.addFriendInviteButtons(this.playerIdT2gp);
        }
      } else if (currentTab == TabNames[TabNameTypes.LobbyTab]) {
        this.addFriendInviteButtons(this.playerIdT2gp);
        if (lobbyCheck || gameConfig.isInternetMultiplayer) {
          const gameConfig2 = Configuration.getGame();
          const isKickVote = gameConfig2.isKickVoting;
          if (isKickVote || Network.getHostPlayerId() == GameContext.localPlayerID) {
            this.setButtonActivate(12 /* KICK */, true);
          }
          if (this.lobbyPlayerId != -1) {
            if (Network.isPlayerMuted(this.lobbyPlayerId)) {
              this.setButtonActivate(14 /* UNMUTE */, true);
            } else {
              this.setButtonActivate(13 /* MUTE */, true);
            }
          }
        }
      }
    }
    if (Online.Social.canViewProfileWithFriendId(this.friendId1p, this.friendIdT2gp)) {
      this.setButtonActivate(0 /* VIEW_PROFILE */, true);
    }
    this.Root.addEventListener("engine-input", this.engineInputListener);
    closeButton.addEventListener("action-activate", this.closeButtonListener);
  }
  addFriendInviteButtons(friendId) {
    if (Online.Social.isUserPendingFriend(friendId)) {
      if (Online.Social.hasFriendInviteFromUser(friendId)) {
        this.setButtonActivate(3 /* ACCEPT_FRIEND_ADD_REQUEST */, true);
        this.setButtonActivate(5 /* DECLINE_FRIEND_ADD_REQUEST */, true);
      } else {
        this.setButtonActivate(4 /* CANCEL_FRIEND_ADD_REQUEST */, true);
      }
    } else if (!Online.Social.isUserFriend(friendId)) {
      if (!Online.Social.isUserBlocked(friendId, false)) {
        this.setButtonActivate(2 /* ADD_FRIEND_REQUEST */, true);
      }
    } else {
      this.setButtonActivate(10 /* REMOVE_FRIEND */, true);
    }
  }
  setButtonActivate(buttonType, buttonActive) {
    if (buttonActive) {
      this.socialButtons[buttonType].classList.remove("disabled");
      this.socialButtons[buttonType].classList.remove("hidden");
      this.socialButtons[buttonType].addEventListener("action-activate", this.socialButtonListener[buttonType]);
    } else {
      this.socialButtons[buttonType].classList.add("disabled");
      this.socialButtons[buttonType].classList.add("hidden");
      this.socialButtons[buttonType].removeEventListener(
        "action-activate",
        this.socialButtonListener[buttonType]
      );
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("MultiplayerPostPlayerDisconnected", this.onPlayerDisconnected, this);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    const popupOuter = MustGetElement(".mp-options-popup", this.Root);
    if (popupOuter.classList.contains("hidden")) {
      Focus.setContextAwareFocus(this.mainContainer, this.Root);
    } else {
      const popupButtonContainer = MustGetElement(".mp-options-popup-button-container", this.Root);
      Focus.setContextAwareFocus(popupButtonContainer, this.Root);
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      const popupTop = MustGetElement(".mp-friends-options-frame", this.Root);
      const popupOuter = MustGetElement(".mp-options-popup", this.Root);
      if (popupOuter.classList.contains("hidden")) {
        this.onClose(inputEvent);
      } else {
        popupOuter.classList.add("hidden");
        popupTop.classList.remove("hidden");
        Focus.setContextAwareFocus(this.mainContainer, this.Root);
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onClose(inputEvent) {
    this.close();
    if (inputEvent) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  // Only first party functionality we want to provide
  onViewProfile() {
    if (this.supportConfirmation[0 /* VIEW_PROFILE */]) {
    } else {
      Online.Social.viewProfile(this.friendId1p, this.friendIdT2gp);
      this.close();
    }
  }
  onInviteToJoin() {
    if (this.supportConfirmation[1 /* INVITE_TO_JOIN */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_GAME_INVITE_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_GAME_INVITE", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.confirmInviteToJoin();
            this.close();
          }
        }
      });
    } else {
      this.confirmInviteToJoin();
      this.close();
    }
  }
  // T2GP only
  onAddFriend() {
    const twoKId = this.getT2GPFriendId();
    if (this.supportConfirmation[2 /* ADD_FRIEND_REQUEST */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_REQUEST_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_REQUEST", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.confirmAddFriend(twoKId);
            this.close();
          }
        }
      });
    } else {
      this.confirmAddFriend(twoKId);
      this.close();
    }
  }
  getT2GPFriendId() {
    if (this.playerIdT2gp && this.playerIdT2gp != "") return this.playerIdT2gp;
    return this.friendIdT2gp;
  }
  // T2GP only
  onCancelRequest() {
    const twoKId = this.getT2GPFriendId();
    if (this.supportConfirmation[4 /* CANCEL_FRIEND_ADD_REQUEST */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_CANCEL_REQUEST_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_CANCEL_REQUEST", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.rejectFriendRequest(twoKId);
            this.close();
          }
        }
      });
    } else {
      Online.Social.rejectFriendRequest(twoKId);
      this.close();
    }
  }
  // T2GP only
  onAcceptRequest() {
    if (this.supportConfirmation[3 /* ACCEPT_FRIEND_ADD_REQUEST */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_ACCEPT_REQUEST_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_ACCEPT_REQUEST", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.acceptFriendRequest(this.friendIdT2gp);
            this.close();
          }
        }
      });
    } else {
      Online.Social.acceptFriendRequest(this.friendIdT2gp);
      this.close();
    }
  }
  // T2GP only
  onDeclineRequest() {
    if (this.supportConfirmation[5 /* DECLINE_FRIEND_ADD_REQUEST */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_DECLINE_REQUEST_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_DECLINE_REQUEST", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.rejectFriendRequest(this.friendIdT2gp);
            this.close();
          }
        }
      });
    } else {
      Online.Social.rejectFriendRequest(this.friendIdT2gp);
      this.close();
    }
  }
  // T2GP only
  onAcceptGameInvite() {
    if (this.supportConfirmation[6 /* ACCEPT_GAME_INVITE */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_ACCEPT_INVITE_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_ACCEPT_INVITE", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.acceptGameInvite(this.gamertagT2gp);
            this.close();
          }
        }
      });
    } else {
      Online.Social.acceptGameInvite(this.gamertagT2gp);
      this.close();
    }
  }
  // T2GP only
  onDeclineGameInvite() {
    if (this.supportConfirmation[7 /* DECLINE_GAME_INVITE */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_DECLINE_INVITE_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_DECLINE_INVITE", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.declineGameInvite(this.gamertagT2gp);
            this.close();
          }
        }
      });
    } else {
      Online.Social.declineGameInvite(this.gamertagT2gp);
      this.close();
    }
  }
  // T2GP only
  onReport() {
    if (this.supportConfirmation[11 /* REPORT */]) {
    } else {
      const popupTop = MustGetElement(".mp-friends-options-frame", this.Root);
      const popupOuter = MustGetElement(".mp-options-popup", this.Root);
      const popupButtonContainer = MustGetElement(".mp-options-popup-button-container", this.Root);
      while (popupButtonContainer.children.length > 0) {
        popupButtonContainer.removeChild(popupButtonContainer.children[0]);
      }
      this.reportDropdownItems = [];
      const chooseAnOptionItem = {
        key: "",
        label: Locale.compose("LOC_ABUSE_REPORT_SELECT_REASON"),
        disabled: true
      };
      this.reportDropdownItems.push(chooseAnOptionItem);
      this.buildReportReasonsDropdown();
      const dropdown = document.createElement("fxs-dropdown");
      dropdown.addEventListener(DropdownSelectionChangeEventName, this.onReportDropdownSelection.bind(this));
      dropdown.setAttribute("dropdown-items", JSON.stringify(this.reportDropdownItems));
      dropdown.setAttribute("selected-item-index", "0");
      dropdown.classList.add("h-12", "mb-4", "w-128");
      popupButtonContainer.appendChild(dropdown);
      Focus.setContextAwareFocus(popupButtonContainer, this.Root);
      const cancelButton = document.createElement("fxs-button");
      cancelButton.setAttribute("caption", "LOC_GENERIC_CANCEL");
      cancelButton.addEventListener("action-activate", () => {
        popupOuter.classList.add("hidden");
        popupTop.classList.remove("hidden");
        Focus.setContextAwareFocus(this.mainContainer, this.Root);
      });
      popupButtonContainer.appendChild(cancelButton);
      popupOuter.classList.remove("hidden");
      popupTop.classList.add("hidden");
    }
  }
  onReportDropdownSelection(event) {
    const selection = this.reportDropdownItems[event.detail.selectedIndex];
    if (this.reportDropdownItems.find((reportItem) => {
      return reportItem.label == Locale.compose("LOC_ABUSE_REPORT_SELECT_REASON");
    })) {
      this.reportDropdownItems = [];
      this.buildReportReasonsDropdown();
      const dropdown = MustGetElement(".fxs-dropdown", this.Root);
      dropdown.setAttribute("dropdown-items", JSON.stringify(this.reportDropdownItems));
      let indexNum = event.detail.selectedIndex - 1;
      if (indexNum < 0) {
        indexNum = 0;
      }
      event.detail.selectedIndex = indexNum;
      dropdown.setAttribute("selected-item-index", indexNum.toString());
    }
    this.createReportDialog(selection.key);
  }
  buildReportReasonsDropdown() {
    abuseReasonToName.forEach((value, key) => {
      const newItem = {
        key,
        label: value,
        tooltip: abuseReasonToTooltip.get(key)
      };
      this.reportDropdownItems.push(newItem);
    });
  }
  // T2GP only
  onRemoveFriend() {
    if (this.supportConfirmation[10 /* REMOVE_FRIEND */]) {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_REMOVE_FRIEND_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_REMOVE_FRIEND", this.getGamerTag()),
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.removeFriend(this.friendIdT2gp);
            this.close();
          }
        }
      });
    } else {
      Online.Social.removeFriend(this.friendIdT2gp);
      this.close();
    }
  }
  onKick() {
    if (this.lobbyPlayerId != -1) {
      this.kick(this.lobbyPlayerId);
    }
    this.close();
  }
  onMute() {
    if (this.lobbyPlayerId != -1) {
      this.mute(this.lobbyPlayerId, true);
    }
    this.close();
  }
  onUnMute() {
    if (this.lobbyPlayerId != -1) {
      this.mute(this.lobbyPlayerId, false);
    }
    this.close();
  }
  // Reference from: ui\shell\mp-staging\model-mp-staging-new.ts
  kick(kickPlayerID) {
    if (this.supportConfirmation[12 /* KICK */]) {
      const gameConfig = Configuration.getGame();
      const isKickVote = gameConfig.isKickVoting;
      const dialogCallback = (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          if (isKickVote) {
            const yesVote = true;
            Network.kickVotePlayer(kickPlayerID, yesVote, KickVoteReasonType.KICKVOTE_NONE);
          } else {
            Network.directKickPlayer(kickPlayerID);
          }
        }
      };
      const dialogBody = isKickVote ? "LOC_KICK_VOTE_CONFIRM_DIALOG" : "LOC_DIRECT_KICK_CONFIRM_DIALOG";
      const kickPlayerConfig = Configuration.getPlayer(kickPlayerID);
      const kickPlayerName = Locale.compose(kickPlayerConfig.slotName);
      DialogBoxManager.createDialog_ConfirmCancel({
        body: Locale.compose(dialogBody, kickPlayerName),
        title: "LOC_KICK_DIALOG_TITLE",
        callback: dialogCallback
      });
    } else {
      const gameConfig = Configuration.getGame();
      const isKickVote = gameConfig.isKickVoting;
      if (isKickVote) {
        const yesVote = true;
        Network.kickVotePlayer(kickPlayerID, yesVote, KickVoteReasonType.KICKVOTE_NONE);
      } else {
        Network.directKickPlayer(kickPlayerID);
      }
    }
  }
  // Reference from: ui\shell\mp-staging\model-mp-staging-new.ts
  mute(mutePlayerID, mute) {
    if (mute && this.supportConfirmation[13 /* MUTE */] || !mute && this.supportConfirmation[14 /* UNMUTE */]) {
      const dialogCallback = (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          Network.setPlayerMuted(mutePlayerID, mute);
          engine.trigger("staging-mute-changed");
        }
      };
      const mutePlayerConfig = Configuration.getPlayer(mutePlayerID);
      const mutePlayerName = Locale.compose(mutePlayerConfig.slotName);
      DialogBoxManager.createDialog_ConfirmCancel({
        body: Locale.compose(
          mute ? "LOC_DIRECT_MUTE_CONFIRM_DIALOG" : "LOC_DIRECT_UNMUTE_CONFIRM_DIALOG",
          mutePlayerName
        ),
        title: mute ? "LOC_MUTE_DIALOG_TITLE" : "LOC_UNMUTE_DIALOG_TITLE",
        callback: dialogCallback
      });
    } else {
      Network.setPlayerMuted(mutePlayerID, mute);
      engine.trigger("staging-mute-changed");
    }
  }
  onPlayerDisconnected() {
    MPFriendsModel.refreshFriendList();
  }
  getFriendID() {
    if (this.isT2GP) {
      return this.friendIdT2gp;
    } else if (this.is1stParty) {
      return this.friendId1p;
    }
    return "";
  }
  getGamerTag() {
    if (this.gamertagT2gp && this.gamertagT2gp != "") {
      return this.gamertagT2gp;
    } else if (this.gamertag1p && this.gamertag1p != "") {
      return this.gamertag1p;
    }
    return "";
  }
  // T2GP only
  onBlock() {
    const friendID = this.getFriendID();
    const gamerTag = this.getGamerTag();
    if (friendID != "") {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_BLOCK_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_BLOCK", gamerTag),
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.blockUser(friendID);
            DialogBoxManager.createDialog_Confirm({
              title: "LOC_UI_MP_FRIENDS_CONFIRM_BLOCK_TITLE",
              body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_BLOCK", gamerTag)
            });
          }
        }
      });
      this.close();
    } else {
      console.error("mp-friends-options: unblockPlayer(): None valid Friend ID (1P or T2GP) so nothing happened");
    }
  }
  onUnBlock() {
    const friendID = this.getFriendID();
    const gamerTag = this.getGamerTag();
    if (friendID != "") {
      DialogBoxManager.createDialog_ConfirmCancel({
        title: "LOC_UI_MP_FRIENDS_CONFIRM_UNBLOCK_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_CONFIRM_UNBLOCK", gamerTag),
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            Online.Social.unblockUser(friendID);
            DialogBoxManager.createDialog_Confirm({
              title: "LOC_UI_MP_FRIENDS_CONFIRM_UNBLOCK_TITLE",
              body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_UNBLOCK", gamerTag)
            });
          }
        }
      });
    }
    this.close();
  }
  createReportDialog(reason) {
    ContextManager.push("screen-mp-report", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        blackOut: true,
        reportUserId: this.friendIdT2gp,
        reportUserGamertag: this.getGamerTag(),
        reportReason: reason
      }
    });
  }
  confirmInviteToJoin() {
    const friendID = this.getFriendID();
    const friendData = MPFriendsModel.getFriendDataFromID(friendID);
    if (friendID && friendData && !friendData.disabledActionButton) {
      MPFriendsModel.invite(friendID, friendData);
      DialogBoxManager.createDialog_Confirm({
        title: "LOC_UI_MP_FRIENDS_FEEDBACK_INVITE_TO_JOIN_TITLE",
        body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_INVITE_TO_JOIN", this.getGamerTag())
      });
    } else {
      console.error("mp-friends: invitePlayer(): Invalid friendID or friendData");
    }
  }
  confirmAddFriend(friendID) {
    Online.Social.sendFriendRequest(friendID);
    DialogBoxManager.createDialog_Confirm({
      title: "LOC_UI_MP_FRIENDS_FEEDBACK_ADD_FRIEND_TITLE",
      body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_ADD_FRIEND", this.getGamerTag())
    });
  }
}
Controls.define("screen-mp-friends-options", {
  createInstance: PanelMPFriendOptions,
  description: "Create popup for Multiplayer Lobby Player Options.",
  classNames: ["mp-friends-options"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "friendId1p"
    },
    {
      name: "friendIdT2gp"
    }
  ]
});
//# sourceMappingURL=mp-friends-options.js.map
