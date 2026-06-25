import { onMount, on } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../../core/vendor/solid-js/store/dist/store.js';
import { Audio } from '../../../../core/ui/audio-base/audio-support.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { displayRequestUniqueId } from '../../../../core/ui/context-manager/display-handler.js';
import { DisplayQueueManager } from '../../../../core/ui/context-manager/display-queue-manager.js';
import { DialogBoxManager } from '../../../../core/ui/dialog-box/manager-dialog-box.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import SaveLoadData from '../../../../core/ui/save-load/model-save-load.js';
import { getPlayerCardInfo } from '../../../../core/ui/utilities/utilities-liveops.js';
import { NetworkUtilities } from '../../../../core/ui/utilities/utilities-network.js';
import { createEngineEvent } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { getLeaderLoadingInfo } from '../load-screen/load-screen-model.js';
import { DialogSource, DialogBoxAction } from '../../../../core/ui/dialog-box/model-dialog-box.js';

function createPauseMenuModel() {
  const dialogId = displayRequestUniqueId();
  DialogBoxManager.setSource(DialogSource.Shell);
  function handleClickProgression() {
    if (Network.isLoggedIn() || Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER) {
      ContextManager.push("screen-profile-page", {
        singleton: true,
        createMouseGuard: true,
        panelOptions: { onlyChallenges: false, onlyLeaderboards: false, noCustomize: true }
      });
    } else {
      DialogBoxManager.createDialog_Confirm({
        dialogId,
        body: Locale.compose("LOC_UI_ACCOUNT_LOGIN_PROMPT"),
        title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE")
      });
    }
  }
  function handleClickResume() {
    InterfaceMode.switchToDefault();
  }
  function handleClickQuickSave() {
    SaveLoadData.handleQuickSave();
    InterfaceMode.switchToDefault();
  }
  function handleClickSave() {
    const configSaveType = GameStateStorage.getGameConfigurationSaveType();
    const configServerType = Network.getServerType();
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: { "menu-type": "save", "server-type": configServerType, "save-type": configSaveType }
    });
  }
  function handleClickLoad() {
    const configSaveType = GameStateStorage.getGameConfigurationSaveType();
    const configServerType = Network.getServerType();
    const liveEventGame = Network.supportsSSO() && Online.LiveEvent.getLiveEventGameFlag();
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "load",
        "server-type": configServerType,
        "save-type": configSaveType,
        "from-event": liveEventGame
      }
    });
  }
  function handleClickRestart() {
    DialogBoxManager.createDialog_ConfirmCancel({
      dialogId,
      body: "LOC_PAUSE_MENU_CONFIRM_RESTART_GAME",
      title: "LOC_PAUSE_MENU_RESTART",
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          Network.restartGame();
        }
      }
    });
  }
  function retireFromGame() {
    GameContext.sendRetireRequest();
    InterfaceMode.switchToDefault();
    //! TEMPORARY - The game really should be paused from within GameCore and not reactively by the UI.
    //! This kludge will either become part of the end-game sequence OR be removed when properly handled in GameCore.
    GameContext.sendPauseRequest(true);
  }
  function handleClickRetire() {
    const victoryManager = Game.VictoryManager;
    const playerDefeated = victoryManager.getLatestPlayerDefeat(GameContext.localPlayerID) != DefeatTypes.NO_DEFEAT;
    if (Game.AgeProgressManager.isAgeOver || playerDefeated) {
      if (Locale.keyExists("LOC_PAUSE_MENU_CONFIRM_NOMORETURNS") && Locale.keyExists("LOC_PAUSE_MENU_NOMORETURNS")) {
        DialogBoxManager.createDialog_ConfirmCancel({
          dialogId,
          body: "LOC_PAUSE_MENU_CONFIRM_NOMORETURNS",
          title: "LOC_PAUSE_MENU_NOMORETURNS",
          callback: (eAction) => {
            if (eAction == DialogBoxAction.Confirm) {
              InterfaceMode.switchToDefault();
              ContextManager.push("endgame-screen", {
                singleton: true,
                createMouseGuard: true,
                attributes: { shouldDarken: false }
              });
              DisplayQueueManager.add({ category: "EndgameScreen" });
            }
          }
        });
      } else {
        InterfaceMode.switchToDefault();
        ContextManager.push("endgame-screen", {
          singleton: true,
          createMouseGuard: true,
          attributes: { shouldDarken: false }
        });
        DisplayQueueManager.add({ category: "EndgameScreen" });
      }
    } else {
      DialogBoxManager.createDialog_ConfirmCancel({
        dialogId,
        body: "LOC_PAUSE_MENU_CONFIRM_RETIRE",
        title: "LOC_PAUSE_MENU_RETIRE",
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            retireFromGame();
          }
        }
      });
    }
  }
  function handleClickOptions() {
    ContextManager.push("screen-options", { singleton: true, createMouseGuard: true });
  }
  function handleClickExitToMain() {
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_PAUSE_MENU_CONFIRM_QUIT_TO_MENU",
      title: "LOC_END_GAME_EXIT",
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          if (Network.supportsSSO() && Online.LiveEvent.getLiveEventGameFlag()) {
            Online.LiveEvent.clearLiveEventGameFlag();
            Online.LiveEvent.clearLiveEventConfigKeys();
          }
          engine.call("exitToMainMenu");
        }
      }
    });
  }
  function handleClickExitToDesktop() {
    DialogBoxManager.createDialog_ConfirmCancel({
      dialogId,
      body: "LOC_PAUSE_MENU_CONFIRM_QUIT_TO_DESKTOP",
      title: "LOC_PAUSE_MENU_QUIT_TO_DESKTOP",
      callback: (eAction) => {
        if (eAction == DialogBoxAction.Confirm) {
          engine.call("exitToDesktop");
        }
      }
    });
  }
  function showClipboardIndicator(copiedText) {
    const clipBoardContainer = document.querySelector("#clipboard-container");
    while (clipBoardContainer?.hasChildNodes()) {
      clipBoardContainer.removeChild(clipBoardContainer.lastChild);
    }
    const indicator = document.createElement("div");
    indicator.classList.value = "absolute w-80 h-auto flex flex-row items-center p-4 text-shadow left-0 bot-0 opacity-0 pause-menu-clipboard-indicator";
    indicator.style.animationName = "clipboard-indicator";
    indicator.style.animationDuration = "4s";
    const clipboardIcon = document.createElement("div");
    clipboardIcon.classList.value = "size-10 bg-contain bg-center mt-4";
    clipboardIcon.style.backgroundImage = "url('blp:copy_icon')";
    indicator.appendChild(clipboardIcon);
    const indicatorTextContainer = document.createElement("div");
    indicatorTextContainer.classList.value = "w-62 flex flex-col ml-2";
    indicator.appendChild(indicatorTextContainer);
    const indicatorTextTitle = document.createElement("div");
    indicatorTextTitle.classList.value = "mb-2 text-xs font-fit-shrink";
    indicatorTextTitle.setAttribute("data-l10n-id", "LOC_PAUSE_MENU_CLIPBOARD_TITLE");
    indicatorTextContainer.appendChild(indicatorTextTitle);
    const indicatorTextBody = document.createElement("div");
    indicatorTextBody.classList.value = "text-xs font-fit-shrink";
    indicatorTextBody.setAttribute("data-l10n-id", copiedText);
    indicatorTextContainer.appendChild(indicatorTextBody);
    clipBoardContainer?.appendChild(indicator);
  }
  function handleClickAdvancedOptions() {
    ContextManager.push("advanced-options-panel", { singleton: true, createMouseGuard: true });
  }
  function handleClickSocialPanel() {
    if (Network.isLoggedIn()) {
      if (NetworkUtilities.isAccessAllowed(DNAPermissionType.PLAY_ONLINE)) {
        ContextManager.push("screen-mp-friends", { singleton: true, createMouseGuard: true });
      } else {
        ContextManager.push("screen-mp-account-permissions", {
          singleton: true,
          createMouseGuard: true,
          attributes: {
            "loc-key": Network.getBlockedAccessInfo(DNAPermissionType.PLAY_ONLINE).locKey
          }
        });
      }
    } else {
      DialogBoxManager.createDialog_Confirm({
        dialogId,
        body: Locale.compose("LOC_UI_ACCOUNT_LOGIN_PROMPT"),
        title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE")
      });
    }
  }
  function handleClickCollapseAddons() {
    model.isAddonCollapsed = !model.isAddonCollapsed;
    if (model.isAddonCollapsed) {
      Audio.playSound("data-audio-dropdown-close");
    } else {
      Audio.playSound("data-audio-dropdown-open");
    }
  }
  function handleClickCollapseMods() {
    model.isModsCollapsed = !model.isModsCollapsed;
    if (model.isModsCollapsed) {
      Audio.playSound("data-audio-dropdown-close");
    } else {
      Audio.playSound("data-audio-dropdown-open");
    }
  }
  const leaderInfo = getLeaderLoadingInfo();
  let currentLevel = 0;
  if (leaderInfo) {
    const legendsPaths = Online.Metaprogression.getLegendPathsData();
    const legendData = legendsPaths.find(
      (item) => item.legendPathName == `${leaderInfo.LeaderType.replace("LEADER_", "LEGEND_PATH_")}`
    );
    currentLevel = legendData?.currentLevel ?? 0;
  }
  const playerInfo = getPlayerCardInfo();
  let firstPartyLogo = null;
  if (playerInfo.firstPartyType != HostingType.HOSTING_TYPE_UNKNOWN) {
    if (playerInfo.firstPartyType == HostingType.HOSTING_TYPE_T2GP) {
      firstPartyLogo = NetworkUtilities.getHostingTypeURL(Network.getLocalHostingPlatform()) ?? null;
    } else {
      firstPartyLogo = NetworkUtilities.getHostingTypeURL(playerInfo.firstPartyType) ?? null;
    }
  }
  const progressionProps = {
    twoKName: playerInfo.twoKName ? playerInfo.twoKName : "",
    firstPartyName: playerInfo.firstPartyName ? playerInfo.firstPartyName : "",
    firstPartyIcon: firstPartyLogo ? firstPartyLogo : "",
    playerTitle: playerInfo.playerTitle ? playerInfo.playerTitle : "",
    foundationLevel: playerInfo.FoundationLevel ? playerInfo.FoundationLevel.toString() : "0",
    backgroundImage: playerInfo.BackgroundURL ? playerInfo.BackgroundURL : "",
    badgeIcon: playerInfo.BadgeURL ? playerInfo.BadgeURL : ""
  };
  const leaderData = {
    leaderImage: `url(${leaderInfo?.LeaderImage})`,
    progressionBadgeProps: progressionProps
  };
  const { startAgeType, difficultyType, gameSpeedType } = Configuration.getGame();
  const ageName = GameInfo.Ages.lookup(startAgeType)?.Name;
  const difficultyName = GameInfo.Difficulties.lookup(difficultyType)?.Name;
  const gameSpeedName = GameInfo.GameSpeeds.lookup(gameSpeedType)?.Name;
  const mapConfig = Configuration.getMap();
  const mapName = Locale.compose(mapConfig.mapName ?? "LOC_MAP_SCRIPT");
  const mapSize = Locale.compose(mapConfig.mapSizeName ?? "LOC_MAP_SIZE");
  const gameInfoString = Locale.compose("LOC_ACTION_PANEL_CURRENT_TURN", Game.turn) + " | " + (ageName ? Locale.compose(ageName) : "") + " | " + (gameSpeedName ? Locale.compose(gameSpeedName) : "") + " | " + (difficultyName ? Locale.compose(difficultyName) : "") + " | " + Locale.compose("LOC_PAUSE_MENU_PLAYER_COUNT", Players.getWasEverAliveMajorIds().length.toString()) + " | " + mapName + " | " + mapSize;
  const gameInfo = {
    gameInfoString,
    mapSeed: " " + Configuration.getMap().mapSeed.toString(),
    gameSeed: " " + Configuration.getGame().gameSeed.toString(),
    buildInfo: Locale.compose("LOC_PAUSE_MENU_BUILD_INFO", BuildInfo.version.display)
  };
  function handleClickMapSeed() {
    UI.setClipboardText(Configuration.getMap().mapSeed.toString());
    showClipboardIndicator(Locale.compose("LOC_MAPSEED_NAME") + ": " + Configuration.getMap().mapSeed.toString());
  }
  function handleClickGameSeed() {
    UI.setClipboardText(Configuration.getGame().gameSeed.toString());
    showClipboardIndicator(
      Locale.compose("LOC_GAMESEED_NAME") + ": " + Configuration.getGame().gameSeed.toString()
    );
  }
  function handleClickJoinCode() {
    if (UI.isClipboardAvailable()) {
      UI.setClipboardText(Network.getJoinCode());
      showClipboardIndicator(model.joinCodeString);
    }
  }
  const modsToExclude = Modding.getModulesToExclude();
  let activeContent = Modding.getActiveMods().map((m) => Modding.getModInfo(m));
  activeContent = activeContent.filter((m) => !modsToExclude.includes(m.id));
  let activeDLC = activeContent.filter((m) => m.subscriptionType == "OfficialContent" || m.official);
  const activeMods = activeContent.filter((m) => m.subscriptionType != "OfficialContent" && !m.official);
  activeDLC = activeDLC.filter((m) => {
    const showInBrowser = Modding.getModProperty(m.handle, "ShowInBrowser");
    return showInBrowser != "0";
  });
  activeDLC.sort((a, b) => Locale.compare(a.name, b.name));
  activeMods.sort((a, b) => Locale.compare(a.name, b.name));
  let leaderName = null;
  let civName = null;
  if (GameContext.localPlayerID != PlayerIds.NO_PLAYER) {
    const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
    leaderName = playerConfig.leaderName;
    civName = playerConfig.civilizationName;
  }
  const addonInfoData = {
    activeDLC,
    activeMods,
    leaderName: leaderName ?? "",
    level: currentLevel.toString(),
    civName: civName ?? "",
    hasActiveDLC: activeDLC.length > 0,
    hasActiveMods: activeMods.length > 0,
    progressionBadgeProps: progressionProps
  };
  function getRetireButtonCaption() {
    const victoryManager = Game.VictoryManager;
    const playerDefeated = victoryManager.getLatestPlayerDefeat(GameContext.localPlayerID) != DefeatTypes.NO_DEFEAT;
    if (Game.AgeProgressManager.isAgeOver || playerDefeated) {
      return "LOC_PAUSE_MENU_NOMORETURNS";
    } else {
      return "LOC_PAUSE_MENU_RETIRE";
    }
  }
  const retireButtonString = getRetireButtonCaption();
  let restartButtonDisabledReason = null;
  const gameConfiguration = Configuration.getGame();
  const mapConfiguration = Configuration.getMap();
  if (gameConfiguration.previousAgeCount > 0) {
    restartButtonDisabledReason = "LOC_RESTART_DISABLED_REASON_START_AGE";
  } else if (mapConfiguration.script.toLowerCase().endsWith("civ7map")) {
    restartButtonDisabledReason = "LOC_RESTART_DISABLED_REASON_WORLDBUILDER_MAP";
  } else if (gameConfiguration.isNetworkMultiplayer) {
    restartButtonDisabledReason = "LOC_RESTART_DISABLED_REASON_NETWORK_MULTIPLAYER";
  } else if (gameConfiguration.isSavedGame) {
    restartButtonDisabledReason = "LOC_RESTART_DISABLED_REASON_SAVED_GAME";
  }
  const model = createMutable({
    data: {
      addonInfoSectionProps: addonInfoData,
      leaderInfo: leaderData,
      gameInfo,
      canExitToDesktop: UI.canExitToDesktop(),
      retireButtonString,
      canRestart: restartButtonDisabledReason == null,
      restartButtonDisabledReason
    },
    onClickProgression: handleClickProgression,
    onClickResume: handleClickResume,
    onClickQuickSave: handleClickQuickSave,
    onClickSave: handleClickSave,
    onClickLoad: handleClickLoad,
    onClickRestart: handleClickRestart,
    onClickRetire: handleClickRetire,
    onClickJoinCode: handleClickJoinCode,
    onClickOptions: handleClickOptions,
    onClickExitToMain: handleClickExitToMain,
    onClickExitToDesktop: handleClickExitToDesktop,
    onClickAdvancedOptions: handleClickAdvancedOptions,
    onClickMapSeed: handleClickMapSeed,
    onClickGameSeed: handleClickGameSeed,
    onClickSocialPanel: handleClickSocialPanel,
    onClickCollapseAddons: handleClickCollapseAddons,
    onClickCollapseMods: handleClickCollapseMods,
    isAddonCollapsed: false,
    isModsCollapsed: false,
    isMultiplayer: UI.isMultiplayer(),
    supportsSSO: Network.supportsSSO(),
    shouldShowJoinCode: !Configuration.getGame().isHotseat && (Network.supportsSSO() || Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER && !UI.isGameCenterNetworkBuild()),
    joinCodeString: Locale.compose("LOC_PAUSE_MENU_COPY_JOIN_CODE", Network.getJoinCode()),
    isClipboardSupported: UI.isClipboardAvailable()
  });
  function updateRetireButton() {
    model.data.retireButtonString = getRetireButtonCaption();
  }
  onMount(() => {
    const playerDefeat = createEngineEvent("PlayerDefeat");
    const gameAgeEnded = createEngineEvent("GameAgeEnded");
    on([playerDefeat, gameAgeEnded], updateRetireButton, { defer: true });
  });
  return model;
}

export { createPauseMenuModel };
//# sourceMappingURL=pause-menu-model.js.map
