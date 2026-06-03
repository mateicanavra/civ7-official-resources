import { displayRequestUniqueId } from '../context-manager/display-handler.js';
import { DisplayQueueManager } from '../context-manager/display-queue-manager.js';
import { Framework } from '../framework.js';
import { LegalDocsPlacementAcceptName } from '../shell/mp-legal/mp-legal.js';
import { abandonStrToErrorBody, abandonStrToErrorTitle } from './utilities-network-constants.js';

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
  function isAccessAllowed(permissionType) {
    const blockInfo = Network.getBlockedAccessInfo(permissionType);
    return blockInfo.reason === BlockedAccessReason.NONE;
  }
  NetworkUtilities2.isAccessAllowed = isAccessAllowed;
  function requiresAccountValidation(blockReason) {
    return blockReason === BlockedAccessReason.ACCOUNT_NOT_LINKED || blockReason === BlockedAccessReason.ACCOUNT_INCOMPLETE || blockReason === BlockedAccessReason.NOT_LOGGED_IN;
  }
  NetworkUtilities2.requiresAccountValidation = requiresAccountValidation;
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
    const blockInfo = Network.getBlockedAccessInfo(DNAPermissionType.PLAY_ONLINE);
    if (!isConnectedToNetwork || blockInfo.reason !== BlockedAccessReason.NONE) {
      if (DisplayQueueManager.findAll(socialPanelErrorDialogId).length < 1) {
        Framework.ContextManager.push("screen-mp-account-permissions", {
          singleton: true,
          createMouseGuard: true,
          attributes: {
            "loc-key": blockInfo.locKey,
            "block-reason": blockInfo.reason
          }
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
