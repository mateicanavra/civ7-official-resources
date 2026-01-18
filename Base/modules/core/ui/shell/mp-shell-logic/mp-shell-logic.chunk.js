import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { a as SuspendCloseListenerEvent, M as MainMenuReturnEvent, b as ResumeCloseListenerEvent, G as GameCreatorOpenedEvent } from '../../events/shell-events.chunk.js';
import { ScreenProfilePageExternalStatus } from '../../profile-page/screen-profile-page.js';
import { j as joinGameErrorTypeToErrorBody, l as lobbyErrorTypeToErrorBody } from '../../utilities/utilities-network-constants.chunk.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';

const MultiplayerMatchMakeCompleteEventName = "mp-game-match-make-complete";
class MultiplayerMatchMakeCompleteEvent extends CustomEvent {
  constructor() {
    super("mp-game-match-make-complete", { bubbles: false, cancelable: true });
  }
}
const MultiplayerMatchMakeFailEventName = "mp-game-match-make-fail";
class MultiplayerMatchMakeFailEvent extends CustomEvent {
  constructor() {
    super("mp-game-match-make-fail", { bubbles: false, cancelable: true });
  }
}
const MultiplayerJoinCompleteEventName = "mp-game-join-complete";
class MultiplayerJoinCompleteEvent extends CustomEvent {
  constructor() {
    super("mp-game-join-complete", { bubbles: false, cancelable: true });
  }
}
const MultiplayerJoinFailEventName = "mp-game-join-fail";
class MultiplayerJoinFailEvent extends CustomEvent {
  constructor(error) {
    super("mp-game-join-fail", { bubbles: false, cancelable: true, detail: { error } });
  }
}
const MultiplayerCreateCompleteEventName = "mp-game-create-complete";
class MultiplayerCreateCompleteEvent extends CustomEvent {
  constructor() {
    super("mp-game-create-complete", { bubbles: false, cancelable: true });
  }
}
const MultiplayerCreateFailEventName = "mp-game-create-fail";
class MultiplayerCreateFailEvent extends CustomEvent {
  constructor(result) {
    super("mp-game-create-fail", { bubbles: false, cancelable: true, detail: { result } });
  }
}
const MultiplayerCreateAttemptEventName = "mp-game-create-attempt";
class MultiplayerCreateAttemptEvent extends CustomEvent {
  constructor() {
    super("mp-game-create-attempt", { bubbles: false, cancelable: true });
  }
}
const MultiplayerGameAbandonedEventName = "mp-game-abandoned";
class MultiplayerGameAbandonedEvent extends CustomEvent {
  constructor(reason) {
    super("mp-game-abandoned", { bubbles: false, cancelable: true, detail: { reason } });
  }
}
class MultiplayerShellManagerSingleton {
  static _Instance;
  serverType = ServerType.SERVER_TYPE_NONE;
  skipToGameCreator = false;
  // Landing dialog will select Internet and go straight to Host MP game (Sony activity Flow)
  waitingForParentalPermissions = false;
  needToDisplayExitGameErrorDialog = false;
  canMPDialogShow = true;
  savedErrorTitle = "";
  savedErrorBody = "";
  hostCreatingGameDialogBoxID;
  clientJoiningGameDialogBoxID;
  clientMatchmakingGameDialogBoxId;
  premiumWaitDialogBoxID;
  accountNotLinkedDialogBoxID;
  noPremiumDialogBoxID;
  noChildPermissionDialogBoxID;
  searchTimeoutDialogBoxID;
  exitGameErrorDialogBoxID;
  exitBrowserDialogBoxID;
  multiplayerGameAbandonedListener = (data) => {
    this.onMultiplayerGameAbandoned(data);
  };
  childNoPermissionsDialogListener = () => {
    this.onChildNoPermissionsDialog();
  };
  parentalPermissionListener = this.openChildMultiplayer.bind(this);
  constructor() {
    engine.whenReady.then(() => {
      engine.on("error_unplugged_network_cable_EXAMPLE", (data) => {
        DialogBoxManager.createDialog_Confirm({
          body: data.dialogBody,
          title: data.dialogTitle,
          callback: data.dialogCallback
        });
      });
      engine.on("error_generic_EXAMPLE", (data) => {
        DialogBoxManager.createDialog_Confirm({
          body: data.dialogBody,
          title: data.dialogTitle,
          callback: data.dialogCallback
        });
      });
      engine.on("error_search_is_taking_a_long_time_EXAMPLE", () => {
        this.onError_SearchIsTakingALongTime();
      });
      engine.on("PremiumServiceCheckComplete", (data) => {
        this.onPremiumServiceCheckComplete(data);
      });
      engine.on("MultiplayerJoinRoomAttempt", () => {
        this.onJoiningInProgress();
      });
      engine.on("MultiplayerJoinGameComplete", () => {
        this.onJoinSuccess();
      });
      engine.on("MultiplayerJoinRoomFailed", (data) => {
        this.onMultiplayerJoinRoomFailed(data);
      });
      engine.on("MultiplayerGameAbandoned", this.multiplayerGameAbandonedListener);
      engine.on("MultiplayerLobbyCreated", () => {
        this.onLobbyCreated();
      });
      engine.on("MultiplayerLobbyError", this.onLobbyError);
      engine.on("ChildNoPermissionDialog", this.childNoPermissionsDialogListener);
      engine.on("COPPACheckComplete", this.parentalPermissionListener);
      engine.on("ExitToMainMenu", this.exitToMainMenu, this);
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!MultiplayerShellManagerSingleton._Instance) {
      MultiplayerShellManagerSingleton._Instance = new MultiplayerShellManagerSingleton();
    }
    return MultiplayerShellManagerSingleton._Instance;
  }
  /**
   * Example of a more complicated / customized dialog box.
   */
  onError_SearchIsTakingALongTime() {
    if (this.searchTimeoutDialogBoxID != void 0) {
      return;
    }
    const continueWaitingCallback = () => {
      this.searchTimeoutDialogBoxID = void 0;
    };
    const continueWaitingOption = {
      actions: ["accept"],
      label: "LOC_MP_ERROR_CONTINUE_WAITING",
      //Example doesn't really exist
      callback: continueWaitingCallback
    };
    const returnToLobbyCallback = () => {
      this.searchTimeoutDialogBoxID = void 0;
    };
    const returnToLobbyOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_MP_ERROR_RETURN_TO_LOBBY",
      //Example doesn't really exist
      callback: returnToLobbyCallback
    };
    const options = [continueWaitingOption, returnToLobbyOption];
    this.searchTimeoutDialogBoxID = DialogBoxManager.createDialog_MultiOption({
      body: "LOC_MP_ERROR_SEARCH_TIMEOUT_BODY",
      title: "LOC_MP_ERROR_SEARCH_TIMEOUT_TITLE",
      options
    });
  }
  /**
   * Show a pop up while joining a game, with only a [Cancel] option available.
   */
  onJoiningInProgress() {
    window.dispatchEvent(new SuspendCloseListenerEvent());
    if (this.clientMatchmakingGameDialogBoxId != void 0) {
      DialogBoxManager.closeDialogBox(this.clientMatchmakingGameDialogBoxId);
      this.clientMatchmakingGameDialogBoxId = void 0;
      window.dispatchEvent(new MultiplayerMatchMakeCompleteEvent());
    }
    console.log("=============> MP Shell logic ON JOIN IN PROGRESS");
    this.serverType = Network.getServerType();
    if (!ContextManager.hasInstanceOf("screen-mp-browser")) {
      ContextManager.popUntil("main-menu");
      if (Network.getLocalHostingPlatform() != HostingType.HOSTING_TYPE_GAMECENTER) {
        this.onGameBrowse(this.serverType);
      }
    } else {
      if (!ContextManager.isCurrentClass("screen-mp-browser")) {
        ContextManager.popUntil("screen-mp-browser");
      }
    }
    if (this.clientJoiningGameDialogBoxID != void 0) {
      return;
    }
    const cancelWaitingCallback = () => {
      this.clientJoiningGameDialogBoxID = void 0;
      Network.leaveMultiplayerGame();
      window.dispatchEvent(new MultiplayerJoinFailEvent("cancel"));
      if (Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER) {
        window.dispatchEvent(new MainMenuReturnEvent());
      }
    };
    this.clientJoiningGameDialogBoxID = DialogBoxManager.createDialog_Cancel({
      body: "LOC_MP_JOINING_GAME_BODY",
      title: "LOC_MP_JOINING_GAME_TITLE",
      callback: cancelWaitingCallback
    });
    if (MultiplayerShellManager.unitTestMP) {
      setTimeout(() => {
        this.onJoinSuccess();
      }, 1e3);
    }
  }
  onJoinSuccess() {
    console.log("=============> MP Shell logic ON JOIN SUCCESS");
    if (this.hostCreatingGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.hostCreatingGameDialogBoxID);
      this.hostCreatingGameDialogBoxID = void 0;
    }
    if (this.clientJoiningGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.clientJoiningGameDialogBoxID);
      this.clientJoiningGameDialogBoxID = void 0;
    }
    ContextManager.pop("screen-mp-browser");
    ContextManager.push("screen-mp-lobby", { singleton: true, createMouseGuard: true });
    window.dispatchEvent(new ResumeCloseListenerEvent());
    window.dispatchEvent(new MultiplayerJoinCompleteEvent());
  }
  onMultiplayerJoinRoomFailed(data) {
    let joinErrorStr = "LOC_JOIN_GAME_ROOM_UNKNOWN_ERROR";
    const dataErrorStr = joinGameErrorTypeToErrorBody.get(data.error);
    if (dataErrorStr) {
      joinErrorStr = dataErrorStr;
    }
    this.onJoiningFail(joinErrorStr);
    window.dispatchEvent(new ResumeCloseListenerEvent());
    window.dispatchEvent(new MultiplayerJoinFailEvent(joinErrorStr));
  }
  onJoiningFail(errorMessage) {
    if (this.hostCreatingGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.hostCreatingGameDialogBoxID);
      this.hostCreatingGameDialogBoxID = void 0;
    }
    if (this.clientJoiningGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.clientJoiningGameDialogBoxID);
      this.clientJoiningGameDialogBoxID = void 0;
    }
    this.exitMPGame("LOC_MP_JOINING_ERROR_TITLE", errorMessage);
  }
  onChildNoPermissionsDialog() {
    if (this.noChildPermissionDialogBoxID != void 0) {
      return;
    }
    this.noChildPermissionDialogBoxID = DialogBoxManager.createDialog_Confirm({
      body: Locale.compose("LOC_JOIN_GAME_CHILD_ACCOUNT"),
      title: Locale.compose("LOC_UI_LINK_ACCOUNT_SUBTITLE"),
      callback: this.noChildPermissionDialogBoxID = void 0
    });
  }
  onPremiumServiceCheckComplete(event) {
    if (this.premiumWaitDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.premiumWaitDialogBoxID);
    }
    if (!event.hasPremiumServices) {
      if (this.needToDisplayExitGameErrorDialog && this.savedErrorBody != "" && this.savedErrorBody != "" && this.exitGameErrorDialogBoxID == void 0) {
        this.exitGameErrorDialogBoxID = DialogBoxManager.createDialog_Confirm({
          title: this.savedErrorTitle,
          body: this.savedErrorBody,
          callback: () => {
            this.exitGameErrorDialogBoxID = void 0;
          }
        });
        this.needToDisplayExitGameErrorDialog = false;
      }
      if (this.noPremiumDialogBoxID == void 0) {
        this.noPremiumDialogBoxID = DialogBoxManager.createDialog_Confirm({
          body: event.errorMessage,
          title: "LOC_MP_CANT_PLAY_ONLINE_ERROR_TITLE",
          callback: () => {
            this.noPremiumDialogBoxID = void 0;
            Network.clearPremiumError();
            window.dispatchEvent(new MainMenuReturnEvent());
          }
        });
      }
    } else if (this.premiumWaitDialogBoxID != void 0) {
      if (this.skipToGameCreator) {
        ContextManager.push("screen-mp-create-game", { singleton: true, createMouseGuard: true });
        window.dispatchEvent(new GameCreatorOpenedEvent());
      } else {
        ContextManager.push("screen-mp-browser", {
          singleton: true,
          createMouseGuard: true,
          attributes: { "server-type": this.serverType }
        });
      }
    }
    this.premiumWaitDialogBoxID = void 0;
    if (this.needToDisplayExitGameErrorDialog && this.savedErrorBody != "" && this.savedErrorBody != "" && this.exitGameErrorDialogBoxID == void 0) {
      this.exitGameErrorDialogBoxID = DialogBoxManager.createDialog_Confirm({
        title: this.savedErrorTitle,
        body: this.savedErrorBody,
        callback: () => {
          this.exitGameErrorDialogBoxID = void 0;
        }
      });
      this.needToDisplayExitGameErrorDialog = false;
    }
    window.dispatchEvent(new ResumeCloseListenerEvent());
  }
  onMatchMakingInProgress() {
    if (this.clientMatchmakingGameDialogBoxId != void 0) {
      return;
    }
    const cancelWaitingCallback = () => {
      Network.leaveMultiplayerGame();
      this.clientMatchmakingGameDialogBoxId = void 0;
      window.dispatchEvent(new MultiplayerMatchMakeFailEvent());
    };
    this.clientMatchmakingGameDialogBoxId = DialogBoxManager.createDialog_Cancel({
      body: "",
      title: "LOC_MP_MATCHMAKING_GAME_TITLE",
      displayHourGlass: true,
      callback: cancelWaitingCallback
    });
    if (MultiplayerShellManager.unitTestMP) {
      setTimeout(() => {
        this.onJoiningFail("UnitTestMP Test Error!");
        this.clientMatchmakingGameDialogBoxId = void 0;
      }, 1e3);
    }
  }
  hasSupportForLANLikeServerTypes() {
    const isLANServerTypeSupported = Network.hasCapability(NetworkCapabilityTypes.LANServerType);
    const isWirelessServerTypeSupported = Network.hasCapability(NetworkCapabilityTypes.WirelessServerType);
    return isLANServerTypeSupported || isWirelessServerTypeSupported;
  }
  onGameBrowse(serverType, skipToGameCreator = false) {
    this.serverType = serverType;
    this.skipToGameCreator = skipToGameCreator;
    if (serverType == ServerType.SERVER_TYPE_LAN || serverType == ServerType.SERVER_TYPE_WIRELESS) {
      ContextManager.push("screen-mp-browser", {
        singleton: true,
        createMouseGuard: true,
        attributes: { "server-type": serverType }
      });
      return;
    }
    if (serverType == ServerType.SERVER_TYPE_INTERNET) {
      const isUserInput = true;
      if (!this.ensureInternetConnection(isUserInput)) {
        return;
      }
      const isOnline = Network.isConnectedToSSO() || Network.isAuthenticated();
      if (!isOnline && !Network.isBanned()) {
        Network.tryConnect(true);
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_CONNECTION_FAILED"),
          title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
        });
        this.tellMainMenuWereBack();
        return;
      } else if (Network.isBanned()) {
        const banInfo = Network.getBanInfo();
        if (banInfo != "") {
          DialogBoxManager.createDialog_Confirm({
            body: banInfo,
            //2K will handle localization
            title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
          });
        } else {
          DialogBoxManager.createDialog_Confirm({
            body: Locale.compose("LOC_UI_ACCOUNT_BANNED"),
            title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
          });
        }
        this.tellMainMenuWereBack();
        return;
      }
      if (!this.canMPDialogShow) {
        this.tellMainMenuWereBack();
        return;
      }
      if (!Network.isLoggedIn()) {
        Network.tryConnect(false);
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_ACCOUNT_LOGIN_PROMPT"),
          title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE")
        });
        this.tellMainMenuWereBack();
        return;
      }
      if (Network.isAccountLinked() && !Network.isAccountComplete()) {
        if (Network.canDisplayQRCode()) {
          ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
        }
        this.tellMainMenuWereBack();
        return;
      }
      if (!Network.isFullAccountLinked()) {
        this.canMPDialogShow = false;
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_LINK_ACCOUNT_REQUIRED"),
          title: Locale.compose("LOC_UI_LINK_ACCOUNT_TITLE"),
          callback: () => {
            this.canMPDialogShow = true;
          }
        });
        this.tellMainMenuWereBack();
        return;
      }
      if (Network.isBanned()) {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_JOIN_GAME_BANNED_BODY"),
          title: Locale.compose("LOC_JOIN_GAME_BANNED_TITLE")
        });
        this.tellMainMenuWereBack();
        return;
      }
      if (Network.isChildAccount()) {
        Network.sendParentalStatusQuery();
        this.waitingForParentalPermissions = true;
      } else {
        this.sendPremiumCheckRequest();
      }
    }
  }
  onLanding() {
    ContextManager.push("screen-mp-landing", { singleton: true, createMouseGuard: true });
  }
  tellMainMenuWereBack() {
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  sendPremiumCheckRequest() {
    if (this.premiumWaitDialogBoxID != void 0) {
      return;
    }
    window.dispatchEvent(new SuspendCloseListenerEvent());
    this.premiumWaitDialogBoxID = DialogBoxManager.createDialog_MultiOption({
      body: "LOC_MAIN_MENU_PREMIUM_SERVICES_RETRIEVING_DATA",
      title: "LOC_MAIN_MENU_PREMIUM_SERVICES_RETRIEVING_DATA_TITLE",
      options: [],
      canClose: false,
      displayHourGlass: true
    });
    Network.sendPremiumCheckRequest();
  }
  openChildMultiplayer() {
    if (this.waitingForParentalPermissions) {
      this.waitingForParentalPermissions = false;
      if (Network.isChildOnlinePermissionsGranted()) {
        this.sendPremiumCheckRequest();
      } else {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_MP_JOIN_PARENT_PERMISSIONS_DISABLED"),
          title: Locale.compose("LOC_MP_PARENT_PERMISSIONS_TITLE"),
          callback: () => {
            window.dispatchEvent(new MainMenuReturnEvent());
          }
        });
      }
    }
  }
  onGameMode() {
    const isUserInput = true;
    if (!this.ensureInternetConnection(isUserInput)) {
      return;
    }
    if (Network.isFullAccountLinked()) {
      if (Network.isChildAccount()) {
        Network.sendParentalStatusQuery();
        this.waitingForParentalPermissions = true;
      } else {
        this.serverType = ServerType.SERVER_TYPE_INTERNET;
        ContextManager.push("screen-mp-game-mode", { singleton: true, createMouseGuard: true });
      }
    } else if (this.accountNotLinkedDialogBoxID == void 0) {
      this.accountNotLinkedDialogBoxID = DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_GAME_CENTER_REQUIRED"),
        title: Locale.compose("LOC_UI_GAME_CENTER_TITLE"),
        callback: () => {
          this.accountNotLinkedDialogBoxID = void 0;
          window.dispatchEvent(new MainMenuReturnEvent());
        }
      });
    }
  }
  ensureInternetConnection(isUserInput) {
    const result = Network.triggerNetworkCheck(isUserInput);
    if (result.wasErrorDisplayedOnFirstParty) {
      this.tellMainMenuWereBack();
      return false;
    }
    const isConnectedToInternet = result.networkResult != NetworkResult.NETWORKRESULT_NO_NETWORK;
    if (!isConnectedToInternet) {
      DialogBoxManager.createDialog_Confirm({
        body: "LOC_UI_MP_LANDING_ERROR_NO_CONNECTION",
        title: "LOC_UI_NO_INTERNET_CONNECTION_TITLE"
      });
      this.tellMainMenuWereBack();
      return false;
    }
    return true;
  }
  onAutomatch(matchAgeID) {
    let success = true;
    if (!MultiplayerShellManager.unitTestMP) {
      success = Network.matchMakeMultiplayerGame(MultiplayerShellManager.serverType, matchAgeID);
    }
    if (success) {
      MultiplayerShellManager.onMatchMakingInProgress();
    } else {
      const matchmakeErrMsg = Locale.compose("LOC_UI_MP_LANDING_MATCHMAKE_START_ERROR");
      MultiplayerShellManager.onJoiningFail(matchmakeErrMsg);
    }
  }
  /* Main Menu calls this to transition the user to the staging room for a multiplayer age transition. */
  onAgeTransition() {
    console.log("=============> MP Shell logic ON AGE TRANSITION");
    this.serverType = Network.getServerType();
    ContextManager.push("screen-mp-lobby", { singleton: true, createMouseGuard: true });
  }
  /**
   * Show a pop up when an MP game was abandoned
   */
  onMultiplayerGameAbandoned(data) {
    const abandonPopup = NetworkUtilities.multiplayerAbandonReasonToPopup(
      data.reason
    );
    window.dispatchEvent(new MultiplayerGameAbandonedEvent(abandonPopup));
    this.exitMPGame(abandonPopup.title, abandonPopup.body);
  }
  exitToMainMenu() {
    Network.onExitPremium();
    ContextManager.popUntil("main-menu");
    ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = false;
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  /**
   * We have left a multiplayer game and need to return to the games browser.
   * Display an error popup if errorTitle and errorBody are non-empty.
   */
  exitMPGame(errorTitle, errorBody) {
    if (errorTitle != "" && errorBody == "" || errorTitle == "" && errorBody != "") {
      console.warn(
        "exitMPGame(): error dialog only works with both errorTitle and errorBody being non-empty. errorTitle=${errorTitle}, errorBody=${errorBody}"
      );
    }
    if (this.hostCreatingGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.hostCreatingGameDialogBoxID);
      this.hostCreatingGameDialogBoxID = void 0;
    }
    if (this.clientJoiningGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.clientJoiningGameDialogBoxID);
      this.clientJoiningGameDialogBoxID = void 0;
    }
    if (this.clientMatchmakingGameDialogBoxId != void 0) {
      DialogBoxManager.closeDialogBox(this.clientMatchmakingGameDialogBoxId);
      this.clientMatchmakingGameDialogBoxId = void 0;
    }
    this.returnToBaseToPanel();
    if (errorTitle != "" && errorBody != "" && this.exitGameErrorDialogBoxID == void 0) {
      const gameConfig = Configuration.getGame();
      if (Network.getLocalHostingPlatform() != HostingType.HOSTING_TYPE_GAMECENTER && gameConfig.isInternetMultiplayer && ContextManager.getCurrentTarget()?.tagName != "SCREEN-MP-BROWSER") {
        this.needToDisplayExitGameErrorDialog = true;
        this.savedErrorTitle = errorTitle;
        this.savedErrorBody = errorBody;
      } else {
        this.exitGameErrorDialogBoxID = DialogBoxManager.createDialog_Confirm({
          title: errorTitle,
          body: errorBody,
          callback: () => {
            this.exitGameErrorDialogBoxID = void 0;
          }
        });
        this.needToDisplayExitGameErrorDialog = false;
      }
    }
  }
  /* The games browser needs to exit to the main menu due to an error */
  browserExitError(errorTitle, errorBody) {
    this.exitToMainMenu();
    window.dispatchEvent(new ResumeCloseListenerEvent());
    if (this.exitBrowserDialogBoxID != void 0) {
      return;
    }
    this.exitBrowserDialogBoxID = DialogBoxManager.createDialog_Confirm({
      title: errorTitle,
      body: errorBody,
      callback: () => {
        this.exitBrowserDialogBoxID = void 0;
      }
    });
  }
  hostMultiplayerGame(eServerType) {
    if (this.hostCreatingGameDialogBoxID != void 0) {
      return;
    }
    ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = true;
    window.dispatchEvent(new SuspendCloseListenerEvent());
    window.dispatchEvent(new MultiplayerCreateAttemptEvent());
    const cancelCreateGameCallback = () => {
      this.hostCreatingGameDialogBoxID = void 0;
      Network.leaveMultiplayerGame();
      window.dispatchEvent(new ResumeCloseListenerEvent());
      window.dispatchEvent(new MultiplayerCreateFailEvent(NetworkResult.NETWORKRESULT_NONE));
    };
    this.hostCreatingGameDialogBoxID = DialogBoxManager.createDialog_Cancel({
      body: "LOC_MP_CREATE_GAME_WAITING_BODY",
      title: "LOC_MP_CREATE_GAME_WAITING_TITLE",
      callback: cancelCreateGameCallback
    });
    const result = Network.hostMultiplayerGame(eServerType);
    if (![NetworkResult.NETWORKRESULT_OK, NetworkResult.NETWORKRESULT_PENDING].includes(result)) {
      window.dispatchEvent(new MultiplayerCreateFailEvent(result));
      this.hostCreatingGameDialogBoxID = void 0;
      Network.leaveMultiplayerGame();
    }
  }
  onLobbyCreated() {
    if (this.hostCreatingGameDialogBoxID != void 0) {
      DialogBoxManager.closeDialogBox(this.hostCreatingGameDialogBoxID);
      this.hostCreatingGameDialogBoxID = void 0;
    }
    window.dispatchEvent(new MultiplayerCreateCompleteEvent());
  }
  onLobbyError({ errorCode }) {
    if (ContextManager.hasInstanceOf("screen-mp-browser") || ContextManager.hasInstanceOf("screen-mp-lobby")) {
      this.browserExitError(
        "LOC_LOBBY_ERROR_TITLE",
        lobbyErrorTypeToErrorBody.get(errorCode) ?? "LOC_LOBBY_ERROR_UNKNOWN_ERROR"
      );
    }
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if ((inputEvent.detail.name == "center-plot-cursor" || //TODO: Right stick press placeholder until gamepad can support input combinations
    inputEvent.detail.name == "open-techs") && //TODO: Requires new action for 'R' key on KBM
    Network.supportsSSO() && !document.activeElement?.hasAttribute("data-isInput")) {
      ContextManager.push("screen-mp-friends", { singleton: true, createMouseGuard: true });
      inputEvent.preventDefault();
      inputEvent.stopImmediatePropagation();
      return false;
    }
    return true;
  }
  handleNavigation(navigationEvent) {
    if (navigationEvent) {
    }
    return true;
  }
  get unitTestMP() {
    return Network.unitTestModeEnabled;
  }
  /**
   * Delay executing a function for the given number of frames.
   * TODO: Remove function if Gameface is able to resolve earlier OR move to a global function for all places to call. Cf. also other existing delayByFrame() functions.
   * @param func The function to call
   * @param frames The number of frames to wait for
   */
  delayExecute(func, frames = 2) {
    if (frames == 0) {
      func();
    } else {
      window.requestAnimationFrame(() => {
        this.delayExecute(func, frames - 1);
      });
    }
  }
  /**
   * return to the game browser panel when available, otherwise return to the main menu
   */
  returnToBaseToPanel() {
    ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = false;
    if (Network.getLocalHostingPlatform() != HostingType.HOSTING_TYPE_GAMECENTER) {
      if (ContextManager.getCurrentTarget()?.tagName != "SCREEN-MP-BROWSER") {
        ContextManager.popUntil("main-menu");
        ContextManager.push("screen-mp-browser", {
          singleton: true,
          createMouseGuard: true,
          attributes: { "server-type": this.serverType }
        });
        window.dispatchEvent(new ResumeCloseListenerEvent());
      }
    } else {
      window.dispatchEvent(new MainMenuReturnEvent());
      ContextManager.popUntil("main-menu");
    }
  }
}
const MultiplayerShellManager = MultiplayerShellManagerSingleton.getInstance();

export { MultiplayerShellManager as M, MultiplayerMatchMakeCompleteEventName as a, MultiplayerMatchMakeFailEventName as b, MultiplayerJoinCompleteEventName as c, MultiplayerJoinFailEventName as d, MultiplayerCreateCompleteEventName as e, MultiplayerCreateFailEventName as f, MultiplayerCreateAttemptEventName as g, MultiplayerGameAbandonedEventName as h };
//# sourceMappingURL=mp-shell-logic.chunk.js.map
