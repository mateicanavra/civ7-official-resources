import { d as displayRequestUniqueId } from '../dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../context-manager/display-queue-manager.js';
import { F as Framework } from '../framework.chunk.js';
import { LegalDocsPlacementAcceptName } from '../shell/mp-legal/mp-legal.js';
import { a as abandonStrToErrorBody, b as abandonStrToErrorTitle } from './utilities-network-constants.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../context-manager/context-manager.js';
import '../input/cursor.js';
import '../input/focus-manager.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import '../events/shell-events.chunk.js';
import '../navigation-tray/model-navigation-tray.chunk.js';
import '../input/action-handler.js';
import '../input/input-support.chunk.js';
import './utilities-update-gate.chunk.js';
import './utilities-image.chunk.js';
import './utilities-component-id.chunk.js';
import './utilities-dom.chunk.js';
import './utilities-liveops.js';

const socialPanelErrorDialogId = displayRequestUniqueId();
var NetworkUtilities;
((NetworkUtilities2) => {
  const platformIcons = /* @__PURE__ */ new Map([
    [HostingType.HOSTING_TYPE_UNKNOWN, "blp:mp_console_crossplay"],
    [HostingType.HOSTING_TYPE_STEAM, "blp:mp_console_steam"],
    [HostingType.HOSTING_TYPE_EOS, "blp:mp_console_epic"],
    [HostingType.HOSTING_TYPE_T2GP, "blp:prof_2k_logo"],
    [HostingType.HOSTING_TYPE_GAMECENTER, "blp:mp_console_mac"],
    [HostingType.HOSTING_TYPE_NX, "blp:mp_console_switch"],
    [HostingType.HOSTING_TYPE_XBOX, "blp:mp_console_xbox"],
    [HostingType.HOSTING_TYPE_PLAYSTATION, "blp:mp_console_playstation"]
  ]);
  const platformTooltips = /* @__PURE__ */ new Map([
    [HostingType.HOSTING_TYPE_UNKNOWN, Locale.compose("LOC_PLATFORM_ICON_GENERIC_CROSSPLAY")],
    [HostingType.HOSTING_TYPE_STEAM, Locale.compose("LOC_PLATFORM_ICON_STEAM")],
    [HostingType.HOSTING_TYPE_EOS, Locale.compose("LOC_PLATFORM_ICON_EOS")],
    [HostingType.HOSTING_TYPE_T2GP, Locale.compose("LOC_PLATFORM_ICON_T2GP")],
    [HostingType.HOSTING_TYPE_GAMECENTER, Locale.compose("LOC_PLATFORM_ICON_GAMECENTER")],
    [HostingType.HOSTING_TYPE_NX, Locale.compose("LOC_PLATFORM_ICON_NX")],
    [HostingType.HOSTING_TYPE_XBOX, Locale.compose("LOC_PLATFORM_ICON_XBOX")],
    [HostingType.HOSTING_TYPE_PLAYSTATION, Locale.compose("LOC_PLATFORM_ICON_PLAYSTATION")]
  ]);
  function getHostingTypeURL(hostType) {
    const localPlatform = Network.getLocalHostingPlatform();
    if (localPlatform != hostType) {
      hostType = HostingType.HOSTING_TYPE_UNKNOWN;
    }
    return platformIcons.get(hostType);
  }
  NetworkUtilities2.getHostingTypeURL = getHostingTypeURL;
  function getHostingTypeTooltip(hostType) {
    const localPlatform = Network.getLocalHostingPlatform();
    if (localPlatform != hostType) {
      hostType = HostingType.HOSTING_TYPE_UNKNOWN;
    }
    return platformTooltips.get(hostType);
  }
  NetworkUtilities2.getHostingTypeTooltip = getHostingTypeTooltip;
  function areLegalDocumentsConfirmed(unconfirmedCallback) {
    const legalDocuments = Network.getLegalDocuments(LegalDocsPlacementAcceptName);
    if (legalDocuments && legalDocuments.length > 0) {
      if (!Network.areAllLegalDocumentsConfirmed()) {
        unconfirmedCallback();
        return false;
      }
    }
    return true;
  }
  NetworkUtilities2.areLegalDocumentsConfirmed = areLegalDocumentsConfirmed;
  function multiplayerAbandonReasonToPopup(reason) {
    const returnPopup = {
      title: "LOC_GAME_ABANDONED_CONNECTION_LOST_TITLE",
      body: "LOC_GAME_ABANDONED_CONNECTION_LOST"
    };
    let errorBodyLoc = abandonStrToErrorBody.get(reason);
    const errorTitleLoc = abandonStrToErrorTitle.get(reason);
    if (errorBodyLoc == "LOC_GAME_ABANDONED_VERSION_MISMATCH") {
      const myVersion = Network.networkVersion;
      const remoteVersion = Network.lastMismatchVersion;
      errorBodyLoc = Locale.compose(errorBodyLoc, myVersion, remoteVersion);
    } else if (errorBodyLoc == "LOC_GAME_ABANDONED_MOD_MISSING") {
      const lastError = Modding.getLastErrorString();
      if (lastError) {
        errorBodyLoc = lastError;
      }
    }
    if (errorBodyLoc) {
      returnPopup.body = errorBodyLoc;
    }
    if (errorTitleLoc) {
      returnPopup.title = errorTitleLoc;
    }
    return returnPopup;
  }
  NetworkUtilities2.multiplayerAbandonReasonToPopup = multiplayerAbandonReasonToPopup;
  function openSocialPanel(initialTab) {
    const isUserInput = true;
    const result = Network.triggerNetworkCheck(isUserInput);
    const isConnectedToNetwork = result.networkResult != NetworkResult.NETWORKRESULT_NO_NETWORK;
    const connectedToNetwork = Network.isConnectedToNetwork();
    const loggedIn = Network.isLoggedIn();
    const fullyLinked = Network.isFullAccountLinked();
    const childAccount = Network.isChildAccount();
    const childPermissions = Network.isChildOnlinePermissionsGranted();
    if (!isConnectedToNetwork || !connectedToNetwork) {
      if (DisplayQueueManager.findAll(socialPanelErrorDialogId).length < 1) {
        Framework.DialogManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_NO_INTERNET_CONNECTION_TITLE"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE"),
          dialogId: socialPanelErrorDialogId
        });
      }
    } else if (!loggedIn) {
      if (DisplayQueueManager.findAll(socialPanelErrorDialogId).length < 1) {
        Framework.DialogManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_BODY"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE"),
          dialogId: socialPanelErrorDialogId
        });
      }
    } else if (!fullyLinked) {
      if (DisplayQueueManager.findAll(socialPanelErrorDialogId).length < 1) {
        Framework.DialogManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_LINK_ACCOUNT_REQUIRED"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE"),
          dialogId: socialPanelErrorDialogId
        });
      }
    } else if (childAccount && !childPermissions) {
      if (DisplayQueueManager.findAll(socialPanelErrorDialogId).length < 1) {
        Framework.DialogManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_PARENT_PERMISSION_REQUIRED"),
          title: Locale.compose("LOC_UI_ACCOUNT_TITLE"),
          dialogId: socialPanelErrorDialogId
        });
      }
    } else {
      Framework.ContextManager.push("screen-mp-friends", {
        singleton: true,
        createMouseGuard: true,
        attributes: { tab: initialTab ?? "" }
      });
    }
  }
  NetworkUtilities2.openSocialPanel = openSocialPanel;
})(NetworkUtilities || (NetworkUtilities = {}));

export { NetworkUtilities };
//# sourceMappingURL=utilities-network.js.map
