import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { M as MPRefreshDataFlags, a as MPFriendsModel, b as MPFriendsPlayerData } from './model-mp-friends.chunk.js';
import SocialNotificationsManager, { SocialNotificationIndicatorType } from '../../social-notifications/social-notifications-manager.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { getPlayerCardInfo } from '../../utilities/utilities-liveops.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';
import { U as UpdateGate } from '../../utilities/utilities-update-gate.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../utilities/utilities-layout.chunk.js';
import '../mp-legal/mp-legal.js';
import '../../events/shell-events.chunk.js';
import '../../utilities/utilities-network-constants.chunk.js';

const content = "<fxs-div class=\"mp-friends-frame w-200 h-full self-center\">\r\n\t<div class=\"main-container flex-auto\">\r\n\t\t<fxs-hslot class=\"w-full -mt-6\">\r\n\t\t\t<div class=\"filigree-panel-top-left w-1\\/2\"></div>\r\n\t\t\t<div class=\"filigree-panel-top-right w-1\\/2\"></div>\r\n\t\t</fxs-hslot>\r\n\t\t<div class=\"flex flex-col items-center\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"font-title-2xl text-secondary\"\r\n\t\t\t\tdata-l10n-id=\"LOC_UI_SOCIAL_TITLE\"\r\n\t\t\t></div>\r\n\t\t\t<div class=\"filigree-divider-h3 w-64\"></div>\r\n\t\t</div>\r\n\t\t<fxs-inner-frame class=\"mx-6 my-2\\.5 mt-12\">\r\n\t\t\t<fxs-hslot class=\"w-full justify-center\">\r\n\t\t\t\t<fxs-vslot class=\"h-24 mt-4 w-1\\/2\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"mp-friends-platform-icon w-12 h-12 bg-center bg-contain bg-no-repeat align-center self-center mb-2\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"mp-friends-platform-name text-body font-title-lg font-fit-shrink whitespace-nowrap self-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</fxs-vslot>\r\n\t\t\t\t<fxs-vslot class=\"h-24 ml-3 mt-4 w-1\\/2\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"mp-friends-2k-icon w-12 h-12 bg-contain bg-auto bg-no-repeat align-center self-center mb-2\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"mp-friends-2k-name text-body font-title-lg font-fit-shrink whitespace-nowrap self-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</fxs-vslot>\r\n\t\t\t</fxs-hslot>\r\n\t\t</fxs-inner-frame>\r\n\t\t<fxs-tab-bar\r\n\t\t\tclass=\"mp-friends-tab-bar self-center\"\r\n\t\t\tselected-tab-index=\"2\"\r\n\t\t\ttab-for=\".mp-friends-frame\"\r\n\t\t\ttab-items='[{\"id\":\"lobby-list-tab\",\"icon\":\"fs://game/soc_lobby.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"},\r\n\t\t\t\t\t\t\t\t {\"id\":\"search-results-list-tab\",\"icon\":\"fs://game/soc_search.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"},\r\n\t\t\t\t\t\t\t\t {\"id\":\"friends-list-tab\",\"icon\":\"fs://game/soc_friends.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"},\r\n\t\t\t\t\t\t\t\t {\"id\":\"notifications-list-tab\",\"icon\":\"fs://game/soc_notifications.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"},\r\n\t\t\t\t\t\t\t\t {\"id\":\"recently-met-players-list-tab\",\"icon\":\"fs://game/soc_recent.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"},\r\n\t\t\t\t\t\t\t\t {\"id\":\"blocked-players-list-tab\",\"icon\":\"fs://game/soc_blocked.png\",\"label\":\"\",\"iconClass\":\"grow-0 w-8 h-8 p-0 m-0\"}]'\r\n\t\t\tdata-audio-group-ref=\"audio-mp-friends\"\r\n\t\t></fxs-tab-bar>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"self-center\"\r\n\t\t\tfiligree-style=\"none\"\r\n\t\t\tstyle=\"margin-left: -1rem\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-slot-group class=\"mp-friends-slot-group flex flex-auto w-194 self-center\">\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"lobby-list-tab\"\r\n\t\t\t\tclass=\"lobby-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"lobby-list-scrollable w-187 self-center flex-auto\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"lobby-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"search-results-list-tab\"\r\n\t\t\t\tclass=\"search-results-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"search-results-list-scrollable w-187 self-center flex-auto\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"search-results-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"friends-list-tab\"\r\n\t\t\t\tclass=\"friends-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"friends-list-scrollable w-187 self-center flex-auto\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"friends-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"notifications-list-tab\"\r\n\t\t\t\tclass=\"notifications-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"notifications-list-scrollable w-187 self-center flex-auto\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"notifications-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"recently-met-players-list-tab\"\r\n\t\t\t\tclass=\"recently-met-players-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"recently-met-players-list-scrollable w-187 self-center flex-auto\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"recently-met-players-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tid=\"blocked-players-list-tab\"\r\n\t\t\t\tclass=\"blocked-players-list-tab flex flow-column flex-auto\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"blocked-players-list-scrollable w-187 self-center\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"blocked-players-list\">\r\n\t\t\t\t\t\t<!-- Data driven 'player-row' items -->\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</fxs-vslot>\r\n\t\t</fxs-slot-group>\r\n\t\t<div\r\n\t\t\tclass=\"button-container flex flow-row justify-center mt-8\"\r\n\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t>\r\n\t\t\t<fxs-button\r\n\t\t\t\tclass=\"open-search-button\"\r\n\t\t\t\tcaption=\"LOC_UI_FRIENDS_OPEN_SEARCH\"\r\n\t\t\t\taction-key=\"inline-sys-menu\"\r\n\t\t\t></fxs-button>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"mp-friends-close-div relative left-192\">\r\n\t\t<fxs-close-button\r\n\t\t\tclass=\"mp-friends-close\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-friends\"\r\n\t\t\tdata-audio-close-selected=\"friends-close-selected\"\r\n\t\t></fxs-close-button>\r\n\t</div>\r\n</fxs-div>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-friends.css";

var TabNameTypes = /* @__PURE__ */ ((TabNameTypes2) => {
  TabNameTypes2[TabNameTypes2["LobbyTab"] = 0] = "LobbyTab";
  TabNameTypes2[TabNameTypes2["SearchResutsTab"] = 1] = "SearchResutsTab";
  TabNameTypes2[TabNameTypes2["FriendsListTab"] = 2] = "FriendsListTab";
  TabNameTypes2[TabNameTypes2["NotificationsTab"] = 3] = "NotificationsTab";
  TabNameTypes2[TabNameTypes2["RecentlyMetTab"] = 4] = "RecentlyMetTab";
  TabNameTypes2[TabNameTypes2["BlockTab"] = 5] = "BlockTab";
  return TabNameTypes2;
})(TabNameTypes || {});
const TabNames = [
  "lobby-list-tab",
  "search-results-list-tab",
  "friends-list-tab",
  "notifications-list-tab",
  "recently-met-players-list-tab",
  "blocked-players-list-tab"
];
const SocialPanelOpenEventName = "social-panel-open";
class SocialPanelOpenEvent extends CustomEvent {
  constructor() {
    super(SocialPanelOpenEventName, { bubbles: false, cancelable: true });
  }
}
class PanelMPPlayerOptions extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  closeButtonListener = this.onClose.bind(this);
  friendRowEngineInputListener = this.onFriendRowEngineInput.bind(this);
  blockedPlayerRowEngineInputListener = this.onBlockedPlayerRowEngineInput.bind(this);
  recentlyMetPlayerRowEngineInputListener = this.onRecentlyMetPlayerRowEngineInput.bind(this);
  searchResultsRowEngineInputListener = this.onSearchResultsRowEngineInput.bind(this);
  lobbyRowEngineInputListener = this.onLobbyRowEngineInput.bind(this);
  notificationsInputListener = this.onNotificationsRowEngineInput.bind(this);
  openSearchButtonListener = this.onOpenSearch.bind(this);
  openPlayerActionsButtonListener = this.onOpenPlayerActions.bind(this);
  dataUpdateListener = this.onDataUpdate.bind(this);
  searchingStatusListener = this.onSearchingStatusUpdate.bind(this);
  updateLobbyTabListener = this.updateLobbyTab.bind(this);
  userInfoUpdatedListener = this.onUserInfoUpdated.bind(this);
  searchingCancelDialogBoxId = 0;
  tabInitialized = false;
  defaultTab = 2 /* FriendsListTab */;
  updateGate = new UpdateGate(this.onUpdate.bind(this));
  updateFlags = MPRefreshDataFlags.None;
  frame;
  tabBar;
  header;
  slotGroup;
  currentTab = "";
  pendingAdds = /* @__PURE__ */ new Map();
  pendingUpdates = /* @__PURE__ */ new Map();
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.None;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-friends");
  }
  onAttach() {
    super.onAttach();
    window.dispatchEvent(new SocialPanelOpenEvent());
    engine.on("PlayerInfoChanged", this.updateLobbyTabListener);
    engine.on("UserInfoUpdated", this.userInfoUpdatedListener);
    this.frame = MustGetElement(".mp-friends-frame", this.Root);
    const closeButton = MustGetElement("fxs-close-button", this.frame);
    const mainContainer = MustGetElement(".main-container", this.frame);
    this.tabBar = MustGetElement("fxs-tab-bar", mainContainer);
    this.header = MustGetElement("fxs-header", mainContainer);
    this.slotGroup = MustGetElement("fxs-slot-group", mainContainer);
    this.Root.classList.add("absolute");
    const platformName = MustGetElement(".mp-friends-platform-name", this.Root);
    platformName.setAttribute("data-l10n-id", Network.getLocal1PPlayerName());
    const platformIcon = MustGetElement(".mp-friends-platform-icon", this.Root);
    const iconStr = NetworkUtilities.getHostingTypeURL(Network.getLocalHostingPlatform());
    platformIcon.style.backgroundImage = `url('${iconStr}')`;
    const twoKIcon = MustGetElement(".mp-friends-2k-icon", this.Root);
    const twoKName = MustGetElement(".mp-friends-2k-name", this.Root);
    twoKName.setAttribute("data-l10n-id", Online.UserProfile.getMyDisplayName());
    twoKIcon.style.backgroundImage = `url('fs://game/prof_2k_logo.png')`;
    this.Root.addEventListener("engine-input", this.engineInputListener);
    closeButton.classList.add("-ml-4");
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    this.tabBar.addEventListener("tab-selected", this.onTabBarSelected.bind(this));
    const openSearchButton = this.Root.querySelector(".open-search-button");
    if (openSearchButton) {
      openSearchButton.setAttribute("data-audio-group-ref", "audio-mp-friends");
      openSearchButton.addEventListener("action-activate", this.openSearchButtonListener);
    }
    MPFriendsModel.eventNotificationUpdate.on(this.dataUpdateListener);
    MPFriendsModel.onIsSearchingChange(this.searchingStatusListener);
    this.updateLobbyTab();
    this.updateFlags = MPRefreshDataFlags.All;
    this.onUpdate();
    delayByFrame(() => {
      this.postAttachTabNotification();
    }, 2);
    UI.screenTypeAction(UIScreenAction.OPEN, UIOnlineScreenType.SOCIAL);
  }
  onDetach() {
    engine.off("UserInfoUpdated", this.userInfoUpdatedListener);
    engine.off("PlayerInfoChanged", this.updateLobbyTab);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    UI.screenTypeAction(UIScreenAction.CLOSE, UIOnlineScreenType.SOCIAL);
    MPFriendsModel.eventNotificationUpdate.off(this.dataUpdateListener);
    MPFriendsModel.offIsSearchingChange(this.searchingStatusListener);
    NavTray.clear();
    super.onDetach();
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    if (name == "tab") {
      switch (_newValue) {
        case "notifications-list-tab":
          this.tabBar?.setAttribute("selected-tab-index", 3 /* NotificationsTab */.toString());
          this.tabInitialized = true;
          break;
      }
    }
  }
  updateLobbyTab() {
    const lobbyTabList = MustGetElement(".lobby-list", this.slotGroup);
    this.buildLobbyPlayerRow(
      lobbyTabList,
      this.lobbyRowEngineInputListener,
      this.openPlayerActionsButtonListener,
      "LOC_UI_MP_FRIENDS_LOBBY_LIST"
    );
  }
  onDataUpdate() {
    this.updateFlags |= MPFriendsModel.getUpdatedDataFlag();
    this.updateGate.call("data-update");
  }
  onUpdate() {
    MPFriendsModel.searching(false);
    if ((this.updateFlags & MPRefreshDataFlags.SearchResult) > 0) {
      const searchResultsList = MustGetElement(".search-results-list", this.slotGroup);
      this.cancelPendingAdd(searchResultsList);
      this.buildPlayerRow(
        MPFriendsModel.searchResultsData,
        searchResultsList,
        this.searchResultsRowEngineInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_SEARCH_RESULTS_LIST"
      );
    }
    if ((this.updateFlags & MPRefreshDataFlags.Friends) > 0) {
      const friendsList = MustGetElement(".friends-list", this.slotGroup);
      this.cancelPendingAdd(friendsList);
      this.buildPlayerRow(
        MPFriendsModel.friendsData,
        friendsList,
        this.friendRowEngineInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_FRIENDS_LIST"
      );
    }
    if ((this.updateFlags & MPRefreshDataFlags.Blocked) > 0) {
      const blockedPlayersList = MustGetElement(".blocked-players-list", this.slotGroup);
      this.cancelPendingAdd(blockedPlayersList);
      this.buildPlayerRow(
        MPFriendsModel.blockedPlayersData,
        blockedPlayersList,
        this.blockedPlayerRowEngineInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_UNBLOCK_LIST"
      );
    }
    if ((this.updateFlags & MPRefreshDataFlags.Notifications) > 0) {
      const notificationsList = MustGetElement(".notifications-list", this.slotGroup);
      this.cancelPendingAdd(notificationsList);
      this.buildPlayerRow(
        MPFriendsModel.notificationsData,
        notificationsList,
        this.notificationsInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_NOTIFICATIONS_LIST"
      );
    }
    if ((this.updateFlags & MPRefreshDataFlags.RecentlyMet) > 0) {
      const recentlyMetPlayersList = MustGetElement(".recently-met-players-list", this.slotGroup);
      this.cancelPendingAdd(recentlyMetPlayersList);
      this.buildPlayerRow(
        MPFriendsModel.recentlyMetPlayersData,
        recentlyMetPlayersList,
        this.recentlyMetPlayerRowEngineInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_RECENT_LIST"
      );
    }
    if ((this.updateFlags & MPRefreshDataFlags.UserProfiles) > 0) {
      const friendsList = MustGetElement(".friends-list", this.slotGroup);
      this.cancelPendingUpdate(friendsList);
      this.updateUserProfiles(MPFriendsModel.friendsData, friendsList);
      const recentlyMetPlayersList = MustGetElement(".recently-met-players-list", this.slotGroup);
      this.cancelPendingUpdate(recentlyMetPlayersList);
      this.updateUserProfiles(MPFriendsModel.recentlyMetPlayersData, recentlyMetPlayersList);
      const notificationsList = MustGetElement(".notifications-list", this.slotGroup);
      this.cancelPendingUpdate(notificationsList);
      this.updateUserProfiles(MPFriendsModel.notificationsData, notificationsList);
      this.updateLobbyUserProfiles();
    }
    this.updateFlags = MPRefreshDataFlags.None;
    if (ContextManager.isCurrentClass("screen-mp-friends")) {
      FocusManager.setFocus(this.slotGroup);
    }
  }
  onSearchingStatusUpdate(isSearching) {
    if (isSearching) {
      const searchResultsList = MustGetElement(".search-results-list", this.slotGroup);
      this.buildPlayerRow(
        [],
        searchResultsList,
        this.searchResultsRowEngineInputListener,
        this.openPlayerActionsButtonListener,
        "LOC_UI_MP_FRIENDS_SEARCH_RESULTS_LIST"
      );
      this.searchingCancelDialogBoxId = DialogBoxManager.createDialog_Confirm({
        body: "",
        title: "LOC_UI_MP_FRIENDS_SEARCHING",
        displayHourGlass: true
      });
    } else {
      DialogBoxManager.closeDialogBox(this.searchingCancelDialogBoxId);
    }
  }
  onUserInfoUpdated() {
    const twoKName = MustGetElement(".mp-friends-2k-name", this.Root);
    twoKName.setAttribute("data-l10n-id", Online.UserProfile.getMyDisplayName());
  }
  // fxs-tab-item is not created until postAttach so this is a delayed call
  postAttachTabNotification() {
    MPFriendsModel.postAttachTabNotification(3 /* NotificationsTab */);
  }
  updateLobbyUserProfiles() {
    const gameConfig = Configuration.getGame();
    const screenCheck = !ContextManager.hasInstanceOf("main-menu");
    const lobbyCheck = ContextManager.hasInstanceOf("screen-mp-lobby");
    if (!((screenCheck || lobbyCheck) && gameConfig.isInternetMultiplayer)) {
      return;
    }
    const numPlayers = gameConfig.humanPlayerCount;
    if (numPlayers <= 1) return;
    const localPlatform = Network.getLocalHostingPlatform();
    MPFriendsModel.searching(false);
    const playerData = [];
    for (const playerID of gameConfig.humanPlayerIDs) {
      const playerConfig = Configuration.getPlayer(playerID);
      if (!playerConfig.isHuman || playerConfig.isParticipant && !playerConfig.isAlive || playerID == GameContext.localPlayerID) {
        continue;
      }
      const playerFirstPartyType = Network.getPlayerHostingPlatform(playerID);
      let playerFirstPartyName = "";
      if (localPlatform == playerFirstPartyType) {
        playerFirstPartyName = playerConfig.nickName_1P;
      }
      const firstPartyID = Online.Social.getPlayerFriendID_Network(playerID);
      const t2gpID = Online.Social.getPlayerFriendID_T2GP(playerID);
      const friendData = new MPFriendsPlayerData();
      friendData.friendID1P = firstPartyID;
      friendData.gamertag1P = playerFirstPartyName;
      friendData.friendIDT2gp = t2gpID;
      friendData.gamertagT2gp = playerConfig.nickName_T2GP;
      friendData.platform = playerFirstPartyType;
      friendData.leaderId = playerConfig.leaderTypeName != null && playerConfig.leaderTypeName != "RANDOM" ? playerConfig.leaderTypeName : "UNKNOWN_LEADER";
      playerData.push(friendData);
    }
    const lobbyTabList = MustGetElement(".lobby-list", this.slotGroup);
    this.updateUserProfiles(playerData, lobbyTabList);
  }
  buildLobbyPlayerRow(appendRow, playerRowEventListener, actionButtonListener, listName) {
    appendRow.innerHTML = "";
    const gameConfig = Configuration.getGame();
    const screenCheck = !ContextManager.hasInstanceOf("main-menu");
    const lobbyCheck = ContextManager.hasInstanceOf("screen-mp-lobby");
    if (!((screenCheck || lobbyCheck) && gameConfig.isInternetMultiplayer)) {
      const displayText = "LOC_UI_MP_FRIENDS_LOBBY_MULTIPLYER_REMINDER";
      appendRow.innerHTML = `
				<fxs-vslot class="w-full h-full justify-center align-center">
					<div class="font-body font-normal text-base self-center">${Locale.stylize(displayText, listName)}</div>
				</fxs-vslot>
			`;
      return;
    }
    const localPlatform = Network.getLocalHostingPlatform();
    const numPlayers = Configuration.getMap().maxMajorPlayers;
    let playerFound = false;
    MPFriendsModel.searching(false);
    for (let playerID = 0; playerID < numPlayers; playerID++) {
      if (Network.isPlayerConnected(playerID)) {
        const playerConfig = Configuration.getPlayer(playerID);
        if (!playerConfig.isHuman || playerConfig.isParticipant && !playerConfig.isAlive || playerID == GameContext.localPlayerID) {
          continue;
        }
        playerFound = true;
        const friendItem = document.createElement("progression-header");
        friendItem.setAttribute("player-card-style", "social");
        friendItem.addEventListener("engine-input", playerRowEventListener);
        friendItem.setAttribute("tabindex", "-1");
        const playerFirstPartyType = Network.getPlayerHostingPlatform(playerID);
        let playerFirstPartyName = "";
        if (localPlatform == playerFirstPartyType) {
          playerFirstPartyName = playerConfig.nickName_1P;
        }
        const firstPartyID = Online.Social.getPlayerFriendID_Network(playerID);
        const t2gpID = Online.Social.getPlayerFriendID_T2GP(playerID);
        const friendData = new MPFriendsPlayerData();
        friendData.friendID1P = firstPartyID;
        friendData.gamertag1P = playerFirstPartyName;
        friendData.friendIDT2gp = t2gpID;
        friendData.gamertagT2gp = playerConfig.nickName_T2GP;
        friendData.platform = playerFirstPartyType;
        friendData.leaderId = playerConfig.leaderTypeName != null && playerConfig.leaderTypeName != "RANDOM" ? playerConfig.leaderTypeName : "UNKNOWN_LEADER";
        const userProfileId = this.getUserProfileId(t2gpID, firstPartyID);
        this.updateFriendItem(friendData, friendItem, userProfileId, true);
        friendItem.setAttribute("userProfileId", userProfileId);
        friendItem.setAttribute("data-player-id-lobby", playerID.toString());
        friendItem.setAttribute("caption", "");
        friendItem.addEventListener("action-activate", actionButtonListener);
        appendRow.appendChild(friendItem);
      }
    }
    if (!playerFound) {
      const displayText = "LOC_UI_MP_FRIENDS_NO_RESULTS";
      appendRow.innerHTML = `
				<fxs-vslot class="w-full h-full justify-center align-center">
					<div class="font-body font-normal text-base self-center">${Locale.stylize(displayText, listName)}</div>
				</fxs-vslot>
			`;
    }
  }
  cancelAllPendingAddsAndUpdates() {
    for (const update of this.pendingUpdates.values()) {
      update.isCancelled = true;
    }
    for (const add of this.pendingAdds.values()) {
      add.isCancelled = true;
    }
  }
  cancelPendingAdd(itemList) {
    const cancelToken = this.pendingAdds.get(itemList);
    if (cancelToken) {
      cancelToken.isCancelled = true;
    }
  }
  buildPlayerRow(playerData, appendRow, playerRowEventListener, actionButtonListener, listName, isChunkLoad = false) {
    if (!isChunkLoad) {
      appendRow.innerHTML = "";
    }
    if (playerData.length == 0) {
      let displayText = "LOC_UI_MP_FRIENDS_NO_RESULTS";
      if (MPFriendsModel.isSearching()) {
        displayText = "LOC_UI_MP_FRIENDS_SEARCHING";
      }
      appendRow.innerHTML = `
				<fxs-vslot class="w-full h-full justify-center align-center">
					<div class="font-body font-normal text-base self-center">${Locale.stylize(displayText, listName)}</div>
				</fxs-vslot>
			`;
    } else {
      const MAX_PER_ADD = 20;
      const numberToAdd = Math.min(playerData.length, MAX_PER_ADD);
      const showUserProfile = playerRowEventListener != this.searchResultsRowEngineInputListener && playerRowEventListener != this.blockedPlayerRowEngineInputListener;
      const fragment = document.createDocumentFragment();
      MPFriendsModel.searching(false);
      for (let i = 0; i < numberToAdd; i++) {
        const friendItem = document.createElement("progression-header");
        friendItem.setAttribute("player-card-style", "social");
        friendItem.addEventListener("engine-input", playerRowEventListener);
        friendItem.setAttribute("tabindex", "-1");
        friendItem.setAttribute("data-audio-group-ref", "audio-mp-friends");
        let userProfileId = playerData[i].friendIDT2gp;
        if (userProfileId == "") userProfileId = playerData[i].friendID1P;
        if (showUserProfile) friendItem.setAttribute("userProfileId", userProfileId);
        this.updateFriendItem(playerData[i], friendItem, userProfileId, showUserProfile);
        if (!playerData[i].disabledActionButton) {
          friendItem.addEventListener("action-activate", actionButtonListener);
        }
        fragment.appendChild(friendItem);
      }
      appendRow.appendChild(fragment);
      if (numberToAdd < playerData.length) {
        playerData = playerData.slice(numberToAdd);
        const cancelToken = { isCancelled: false };
        delayByFrame(() => {
          if (!cancelToken.isCancelled) {
            this.buildPlayerRow(
              playerData,
              appendRow,
              playerRowEventListener,
              actionButtonListener,
              listName,
              true
            );
          }
        }, MAX_PER_ADD);
        this.pendingAdds.set(appendRow, cancelToken);
      }
    }
  }
  getUserProfileId(t2gpId, platformId) {
    if (t2gpId && t2gpId != "") return t2gpId;
    return platformId;
  }
  updateFriendItem(playerData, friendItem, userProfileId, showUserProfile) {
    const T2GPStatus = playerData.platform == HostingType.HOSTING_TYPE_T2GP;
    let playerInfo = null;
    if (!showUserProfile) {
      playerInfo = {
        TitleLocKey: "",
        BackgroundURL: "fs://game/bn_default",
        BadgeId: "",
        BadgeURL: "",
        BannerId: "",
        BorderURL: "",
        twoKName: playerData.gamertagT2gp,
        twoKId: "",
        playerTitle: "",
        BackgroundColor: "rgb(0, 0, 0)",
        firstPartyType: playerData.platform,
        firstPartyName: playerData.gamertag1P,
        LeaderID: "",
        Status: T2GPStatus ? playerData.statusDetailsT2gp : playerData.statusDetails1P,
        InfoIconURL: T2GPStatus ? playerData.statusIconT2gp : playerData.statusIcon1P,
        LastSeen: "",
        PortraitBorder: "",
        LeaderLevel: 1,
        FoundationLevel: 1
      };
    } else {
      const cardInfo = getPlayerCardInfo(
        userProfileId,
        userProfileId == playerData.friendIDT2gp ? playerData.gamertagT2gp : playerData.gamertag1P,
        true
      );
      playerInfo = {
        ...cardInfo,
        Status: T2GPStatus ? playerData.statusDetailsT2gp : playerData.statusDetails1P,
        InfoIconURL: T2GPStatus ? playerData.statusIconT2gp : playerData.statusIcon1P,
        twoKName: cardInfo.twoKName || playerData.gamertagT2gp,
        twoKId: cardInfo.twoKId || playerData.friendIDT2gp,
        firstPartyType: playerData.platform,
        firstPartyName: playerData.gamertag1P,
        LastSeen: "",
        BadgeURL: cardInfo.BadgeURL,
        LeaderID: playerData.leaderId
      };
    }
    friendItem.setAttribute("data-friend-id-1p", playerData.friendID1P);
    friendItem.setAttribute("data-friend-id-t2gp", playerData.friendIDT2gp);
    friendItem.setAttribute("data-player-id-t2gp", playerInfo.twoKId);
    friendItem.setAttribute("player-name-1p", playerInfo.firstPartyName);
    friendItem.setAttribute("player-name-t2gp", playerInfo.twoKName);
    friendItem.setAttribute("player-platform", playerInfo.firstPartyType.toString());
    friendItem.setAttribute("player-game-invite", playerData.isGameInvite.toString());
    friendItem.setAttribute("caption", playerData.actionButtonLabel);
    friendItem.setAttribute("data-player-info", JSON.stringify(playerInfo));
  }
  cancelPendingUpdate(itemList) {
    const cancelToken = this.pendingUpdates.get(itemList);
    if (cancelToken) {
      cancelToken.isCancelled = true;
    }
  }
  updateUserProfiles(playerData, itemList) {
    const itemCount = itemList.childElementCount;
    const MAX_PER_UPDATE = 10;
    if (playerData.length <= 0 || itemCount <= 0) return;
    const numberToUpdate = Math.min(playerData.length, MAX_PER_UPDATE);
    for (let i = 0; i < numberToUpdate; i++) {
      for (let k = 0; k < itemCount; k++) {
        const friendItem = itemList.children[k];
        if (friendItem) {
          const userProfileId = this.getUserProfileId(playerData[i].friendIDT2gp, playerData[i].friendID1P);
          const itemProfileId = friendItem.getAttribute("userProfileId");
          if (itemProfileId != userProfileId) continue;
          this.updateFriendItem(playerData[i], friendItem, userProfileId, true);
          break;
        }
      }
    }
    if (numberToUpdate < playerData.length) {
      playerData = playerData.slice(numberToUpdate);
      const cancelToken = { isCancelled: false };
      waitForLayout(() => {
        if (!cancelToken.isCancelled) {
          this.updateUserProfiles(playerData, itemList);
        }
      });
      this.pendingUpdates.set(itemList, cancelToken);
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction2("LOC_UI_FRIENDS_OPEN_SEARCH");
    if (this.currentTab != TabNames[1 /* SearchResutsTab */] && MPFriendsModel.hasSearched()) {
      this.tabBar?.setAttribute("selected-tab-index", 1 /* SearchResutsTab */.toString());
      MPFriendsModel.searched(false);
    } else {
      FocusManager.setFocus(this.slotGroup);
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
    switch (inputEvent.detail.name) {
      case "keyboard-enter":
        this.navigateSearch();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-2":
        Audio.playSound("data-audio-activate", "audio-mp-friends");
        this.createSearchDialog();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "cancel":
      case "keyboard-escape":
      case "mousebutton-right":
        this.onClose();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onClose() {
    this.cancelAllPendingAddsAndUpdates();
    this.close();
  }
  navigateSearch() {
    if (ContextManager.hasInstanceOf("screen-mp-search") && this.currentTab != TabNames[1 /* SearchResutsTab */]) {
      this.tabBar?.setAttribute("selected-tab-index", 1 /* SearchResutsTab */.toString());
    }
  }
  onTabBarSelected(event) {
    event.stopPropagation();
    const { index } = event.detail;
    let tabName = "";
    let label = "";
    switch (index) {
      case 5 /* BlockTab */:
        tabName = TabNames[5 /* BlockTab */];
        label = "LOC_UI_MP_FRIENDS_TAB_UNBLOCK";
        break;
      case 4 /* RecentlyMetTab */:
        tabName = TabNames[4 /* RecentlyMetTab */];
        label = "LOC_UI_MP_FRIENDS_TAB_RECENT";
        break;
      case 1 /* SearchResutsTab */:
        tabName = TabNames[1 /* SearchResutsTab */];
        label = "LOC_UI_MP_FRIENDS_TAB_SEARCH";
        break;
      case 0 /* LobbyTab */:
        tabName = TabNames[0 /* LobbyTab */];
        label = "LOC_UI_MP_FRIENDS_TAB_LOBBY";
        break;
      case 3 /* NotificationsTab */:
        tabName = TabNames[3 /* NotificationsTab */];
        label = "LOC_UI_MP_FRIENDS_TAB_NOTIFICATIONS";
        break;
      case 2 /* FriendsListTab */:
      default:
        label = "LOC_UI_MP_FRIENDS_TAB_INVITE";
        tabName = TabNames[2 /* FriendsListTab */];
        break;
    }
    this.currentTab = tabName;
    if (!this.tabInitialized) {
      const gameConfig = Configuration.getGame();
      const screenCheck = !ContextManager.hasInstanceOf("main-menu");
      const lobbyCheck = ContextManager.hasInstanceOf("screen-mp-lobby");
      if ((screenCheck || lobbyCheck) && gameConfig.isInternetMultiplayer) {
        this.tabBar?.setAttribute("selected-tab-index", 0 /* LobbyTab */.toString());
      } else {
        this.tabBar?.setAttribute("selected-tab-index", this.defaultTab.toString());
      }
      this.tabInitialized = true;
    } else {
      this.tabBar?.setAttribute("selected-tab-index", index.toString());
    }
    if (tabName == TabNames[3 /* NotificationsTab */] && SocialNotificationsManager.isNotificationVisible(SocialNotificationIndicatorType.SOCIALTAB_BADGE)) {
      SocialNotificationsManager.setNotificationVisibility(SocialNotificationIndicatorType.ALL_INDICATORS, false);
    }
    this.slotGroup.setAttribute("selected-slot", tabName);
    this.header.setAttribute("title", label);
    FocusManager.setFocus(this.slotGroup);
  }
  getFriendID1PFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getFriendID1PFromElement(): Invalid target. It should be an HTMLElement");
      return null;
    }
    const friendID = target.getAttribute("data-friend-id-1p");
    if (friendID == null) {
      console.error("mp-friends: getFriendID1PFromElement(): Invalid data-friend-id-1p attribute");
      return null;
    }
    return friendID;
  }
  getFriendIDT2gpFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getFriendIDT2gpFromElement(): Invalid target. It should be an HTMLElement");
      return null;
    }
    const friendID = target.getAttribute("data-friend-id-t2gp");
    if (friendID == null) {
      console.error("mp-friends: getFriendIDT2gpFromElement(): Invalid data-friend-id-t2gp attribute");
      return null;
    }
    return friendID;
  }
  getDisplayName1PFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getDisplayName1PFromElement(): Invalid target. It should be an HTMLElement");
      return null;
    }
    const displayName = target.getAttribute("player-name-1p");
    if (displayName == null) {
      console.error("mp-friends: getDisplayName1PFromElement(): Invalid player-name-1p attribute");
      return null;
    }
    return displayName;
  }
  getDisplayNameT2gpFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getDisplayNameT2gpFromElement(): Invalid target. It should be an HTMLElement");
      return null;
    }
    const displayName = target.getAttribute("player-name-t2gp");
    if (displayName == null) {
      console.error("mp-friends: getDisplayNameT2gpFromElement(): Invalid player-name-t2gp attribute");
      return null;
    }
    return displayName;
  }
  onFriendRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.invitePlayer(button);
    }
  }
  onBlockedPlayerRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.unblockPlayer(button);
    }
  }
  onRecentlyMetPlayerRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.addFriend(button);
    }
  }
  onSearchResultsRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.addFriend(button);
    }
  }
  onLobbyRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.addFriend(button);
    }
  }
  onNotificationsRowEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept") {
      const playerRow = inputEvent.target;
      const button = playerRow.querySelector("fxs-button");
      this.addFriend(button);
    }
  }
  getFriendIDFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getFriendIdFromElement(): Invalid target. It should be an HTMLElement");
      return "";
    }
    return this.getFriendID1PFromElement(target) || this.getFriendIDT2gpFromElement(target) || "";
  }
  getNameFromElement(target) {
    if (target == null) {
      console.error("mp-friends: getNameFromElement(): Invalid target. It should be an HTMLElement");
      return "";
    }
    return this.getDisplayName1PFromElement(target) || this.getDisplayNameT2gpFromElement(target) || "";
  }
  invitePlayer(target) {
    if (target == null) {
      console.error("mp-friends: invitePlayer(): Invalid target. It should be an HTMLElement");
      return;
    }
    const friendID = this.getFriendIDFromElement(target);
    const friendData = MPFriendsModel.getFriendDataFromID(friendID);
    if (friendID && friendData && !friendData.disabledActionButton) {
      MPFriendsModel.invite(friendID, friendData);
    } else {
      console.error("mp-friends: invitePlayer(): Invalid friendID or friendData");
    }
    const playerName = this.getNameFromElement(target);
    DialogBoxManager.createDialog_Confirm({
      title: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_INVITE_TITLE", playerName),
      body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_INVITE", playerName)
    });
  }
  unblockPlayer(target) {
    if (target == null) {
      console.error("mp-friends: unblockPlayer(): Invalid target. It should be an HTMLElement");
      return;
    }
    const friendID1P = this.getFriendID1PFromElement(target);
    const friendIDT2gp = this.getFriendIDT2gpFromElement(target);
    let friendID = "";
    const platSpecific = true;
    if (friendIDT2gp && friendIDT2gp != "" && Online.Social.isUserBlocked(friendIDT2gp, platSpecific)) {
      friendID = friendIDT2gp;
    } else if (friendID1P && friendID1P != "" && Online.Social.isUserBlocked(friendID1P, platSpecific)) {
      friendID = friendID1P;
    }
    if (friendID != "") {
      MPFriendsModel.unblock(friendID);
    } else {
      console.error("mp-friends: unblockPlayer(): None valid Friend ID (1P or T2GP) so nothing happened");
    }
    const playerName = this.getNameFromElement(target);
    DialogBoxManager.createDialog_Confirm({
      title: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_UNBLOCK_TITLE", playerName),
      body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_UNBLOCK", playerName)
    });
  }
  addFriend(target) {
    if (target == null) {
      console.error("mp-friends: addFriend(): Invalid target. It should be an HTMLElement");
      return;
    }
    const friendID = this.getFriendIDFromElement(target);
    const friendData = MPFriendsModel.getRecentlyMetPlayerdDataFromID(friendID);
    if (friendID && friendData && !friendData.disabledActionButton) {
      MPFriendsModel.addFriend(friendID, friendData);
    } else {
      console.error("mp-friends: addFriend(): Invalid friendID or friendData");
    }
    const playerName = this.getNameFromElement(target);
    DialogBoxManager.createDialog_Confirm({
      title: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_ADD_FRIEND_TITLE", playerName),
      body: Locale.compose("LOC_UI_MP_FRIENDS_FEEDBACK_ADD_FRIEND", playerName)
    });
  }
  createSearchDialog() {
    ContextManager.push("screen-mp-search", {
      singleton: true,
      createMouseGuard: true,
      attributes: { blackOut: true }
    });
  }
  onOpenSearch() {
    this.createSearchDialog();
  }
  onOpenPlayerActions(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const friendId1p = event.target.getAttribute("data-friend-id-1p");
    const friendIdT2gp = event.target.getAttribute("data-friend-id-T2gp");
    const playerIdT2gp = event.target.getAttribute("data-player-id-t2gp");
    const gamertag1p = event.target.getAttribute("player-name-1p");
    const gamertagT2gp = event.target.getAttribute("player-name-t2gp");
    const playerIdLobby = event.target.getAttribute("data-player-id-lobby");
    const platform = event.target.getAttribute("player-platform");
    const gameInvite = event.target.getAttribute("player-game-invite");
    if (this.currentTab == "search-results-list-tab") {
      if (friendId1p && Online.Social.isUserFriendOnPlatform(friendId1p, FriendListTypes.Immediate) || friendIdT2gp && (Online.Social.isUserFriendOnPlatform(friendIdT2gp, FriendListTypes.Immediate) || Online.Social.isUserFriendOnPlatform(friendIdT2gp, FriendListTypes.Hidden))) {
        let message = "";
        if (gamertag1p) {
          message = Locale.compose("LOC_UI_ALREADY_FRIEND", gamertag1p);
        } else if (gamertagT2gp) {
          message = Locale.compose("LOC_UI_ALREADY_FRIEND", gamertagT2gp);
        } else {
          message = Locale.compose("LOC_UI_ALREADY_FRIEND");
        }
        DialogBoxManager.createDialog_Confirm({ body: message });
        return;
      }
    }
    if (!friendId1p && !friendIdT2gp) {
      console.error(
        "mp-friends.ts: onOpenPlayerActions(): Failed to find data-friend-id-1p or data-friend-id-T2gp from target!"
      );
      return;
    }
    const data = {
      friendId1p,
      friendIdT2gp,
      gamertag1p,
      gamertagT2gp,
      currentTab: this.currentTab,
      playerIdLobby,
      platform,
      isGameInvite: gameInvite
    };
    if (playerIdT2gp != null) {
      data.playerIdT2gp = playerIdT2gp;
    }
    ContextManager.push("screen-mp-friends-options", { singleton: true, createMouseGuard: true, attributes: data });
  }
}
Controls.define("screen-mp-friends", {
  createInstance: PanelMPPlayerOptions,
  description: "Create popup for Multiplayer Lobby Player Options.",
  classNames: ["mp-friends"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "tab"
    }
  ]
});

export { SocialPanelOpenEventName, TabNameTypes, TabNames };
//# sourceMappingURL=mp-friends.js.map
