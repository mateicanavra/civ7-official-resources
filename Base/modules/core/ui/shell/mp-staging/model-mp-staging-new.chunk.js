import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import { D as DialogBoxAction, a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { G as GetCivilizationData } from '../create-panels/age-civ-select-model.chunk.js';
import { g as getLeaderData } from '../create-panels/leader-select-model.chunk.js';
import { L as LiveEventManager } from '../live-event-logic/live-event-logic.chunk.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { getPlayerCardInfo } from '../../utilities/utilities-liveops.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';

var MPLobbyDropdownType = /* @__PURE__ */ ((MPLobbyDropdownType2) => {
  MPLobbyDropdownType2["TEAM"] = "DROPDOWN_TYPE_TEAM";
  MPLobbyDropdownType2["PLAYER_PARAM"] = "DROPDOWN_TYPE_PLAYER_PARAM";
  MPLobbyDropdownType2["SLOT_ACTION"] = "DROPDOWN_TYPE_SLOT_ACTION";
  return MPLobbyDropdownType2;
})(MPLobbyDropdownType || {});
var MPLobbySlotActionType = /* @__PURE__ */ ((MPLobbySlotActionType2) => {
  MPLobbySlotActionType2["NONE"] = "SLOT_ACTION_TYPE_NONE";
  MPLobbySlotActionType2["OPEN"] = "SLOT_ACTION_TYPE_OPEN";
  MPLobbySlotActionType2["CLOSE"] = "SLOT_ACTION_TYPE_CLOSE";
  MPLobbySlotActionType2["AI"] = "SLOT_ACTION_TYPE_AI";
  MPLobbySlotActionType2["SWAP"] = "SLOT_ACTION_TYPE_SWAP";
  MPLobbySlotActionType2["VIEW"] = "SLOT_ACTION_TYPE_VIEW";
  return MPLobbySlotActionType2;
})(MPLobbySlotActionType || {});
var MPLobbyReadyStatus = /* @__PURE__ */ ((MPLobbyReadyStatus2) => {
  MPLobbyReadyStatus2["INIT"] = "INIT";
  MPLobbyReadyStatus2["NOT_READY"] = "NOT_READY";
  MPLobbyReadyStatus2["WAITING_FOR_OTHERS"] = "WAITING_FOR_OTHERS";
  MPLobbyReadyStatus2["STARTING_GAME"] = "STARTING_GAME";
  MPLobbyReadyStatus2["WAITING_FOR_HOST"] = "WAITING_FOR_HOST";
  return MPLobbyReadyStatus2;
})(MPLobbyReadyStatus || {});
var PlayerParamDropdownTypes = /* @__PURE__ */ ((PlayerParamDropdownTypes2) => {
  PlayerParamDropdownTypes2["PLAYER_SLOT_ACTION"] = "PLAYER_SLOT_ACTION";
  PlayerParamDropdownTypes2["PLAYER_TEAM"] = "PLAYER_TEAM";
  PlayerParamDropdownTypes2["PLAYER_CIV"] = "PLAYER_CIV";
  PlayerParamDropdownTypes2["PLAYER_LEADER"] = "PLAYER_LEADER";
  PlayerParamDropdownTypes2["PLAYER_MEMENTO"] = "PLAYER_MEMENTO";
  return PlayerParamDropdownTypes2;
})(PlayerParamDropdownTypes || {});
var MPLobbyPlayerConnectionStatus = /* @__PURE__ */ ((MPLobbyPlayerConnectionStatus2) => {
  MPLobbyPlayerConnectionStatus2[MPLobbyPlayerConnectionStatus2["CONNECTED"] = 0] = "CONNECTED";
  MPLobbyPlayerConnectionStatus2[MPLobbyPlayerConnectionStatus2["DISCONNECTED"] = 1] = "DISCONNECTED";
  return MPLobbyPlayerConnectionStatus2;
})(MPLobbyPlayerConnectionStatus || {});
class MPLobbyDropdownOptionData {
  id = "";
  //UNIQUE id
  type = "PLAYER_SLOT_ACTION" /* PLAYER_SLOT_ACTION */;
  label = "";
  description;
  isDisabled;
  iconURL;
  showLabelOnSelectedItem;
  selectedItemIndex;
  // Key to the selection in the itemList
  selectedItemTooltip;
  // Tooltip to the selection in the itemList
  itemList;
  dropdownType;
  playerParamName;
  //[optional] the name of the player parameter being manipulated in this dropdown.
  tooltip;
  //tooltip for the dropdown itself
  get serializedItemList() {
    if (this.itemList == void 0) return "[]";
    return JSON.stringify(this.itemList);
  }
}
const LobbyUpdateEventName = "model-mp-staging-update";
class LobbyUpdateEvent extends CustomEvent {
  constructor() {
    super("model-mp-staging-update", { bubbles: false, cancelable: true });
  }
}
const SMALL_SCREEN_MODE_MAX_HEIGHT = 900;
const SMALL_SCREEN_MODE_MAX_WIDTH = 1700;
class MPLobbyDataModel {
  onUpdate;
  playersData = [];
  localPlayerData;
  allReadyCountdownRemainingSeconds = 0;
  allReadyCountdownRemainingPercentage = 0;
  readyButtonCaption = "";
  static ALL_READY_COUNTDOWN = 10 * 1e3;
  // milli seconds before starting the game after all players are ready
  static ALL_READY_COUNTDOWN_STEP = 1 * 1e3;
  // milli seconds between two updates of the All Ready countdown
  readyStatus = "INIT" /* INIT */;
  allReadyCountdownIntervalHandle = 0;
  startGameRemainingTime = MPLobbyDataModel.ALL_READY_COUNTDOWN;
  onUserProfileUpdatedEventListener = this.update.bind(this);
  /* Cache the participating player count on each update() to avoid hammering 
  the calculation every time we call canChangeSlotStatus(). */
  participatingCount = 0;
  kickTimerListener = this.kickTimerExpired.bind(this);
  kickTimerReference = 0;
  kickVoteLockout = false;
  // The matchmaker generates full or partial games atomically so all players are coming into the match
  // at the same time.  We still need a bit of slop to account for some players taking longer to join
  // the match than others.  We also want this timer to be reasonably short to keep the game moving along.
  static GLOBAL_COUNTDOWN = 2 * 60 * 1e3;
  // milli seconds before forcing starting the All Ready countdown (the players being really ready or not)
  static GLOBAL_COUNTDOWN_STEP = 1 * 1e3;
  // milli seconds between two updates of the Global countdown
  static KICK_VOTE_COOLDOWN = 30 * 1e3;
  // milli seconds enforced between kick vote starts
  globalCountdownRemainingSeconds = 0;
  globalCountdownIntervalHandle = 0;
  PlayerLeaderStringHandle = GameSetup.makeString("PlayerLeader");
  PlayerCivilizationStringHandle = GameSetup.makeString("PlayerCivilization");
  PlayerTeamStringHandle = GameSetup.makeString("PlayerTeam");
  MapSizeStringHandle = GameSetup.makeString("MapSize");
  GameSpeedsStringHandle = GameSetup.makeString("GameSpeeds");
  RulesetStringHandle = GameSetup.makeString("Ruleset");
  AgeStringHandle = GameSetup.makeString("Age");
  PlayerMementoMajorSlotStringHandle = GameSetup.makeString("PlayerMementoMajorSlot");
  PlayerMementoMinorSlot1StringHandle = GameSetup.makeString("PlayerMementoMinorSlot1");
  // Memoize leader civilization bias data.
  cacheLeaderCivilizationBias = /* @__PURE__ */ new Map();
  // Memoize the parameters rather than fetch them from C++ each time (which duplicates data).
  playerParameterCache = /* @__PURE__ */ new Map();
  gameParameterCache = /* @__PURE__ */ new Map();
  // Cache tooltip strings.  In the case of civilization tooltips, just cache a fragment that will be combined with leader bias.
  cachedCivilizationTooltipFragments = /* @__PURE__ */ new Map();
  cachedLeaderTooltips = /* @__PURE__ */ new Map();
  dropdownCallbacks = /* @__PURE__ */ new Map([
    ["DROPDOWN_TYPE_TEAM" /* TEAM */, this.onTeamDropdown.bind(this)],
    ["DROPDOWN_TYPE_PLAYER_PARAM" /* PLAYER_PARAM */, this.onPlayerParamDropdown.bind(this)],
    ["DROPDOWN_TYPE_SLOT_ACTION" /* SLOT_ACTION */, this.onSlotActionDropdown.bind(this)]
  ]);
  voteDialogBoxIDPerKickPlayerID = /* @__PURE__ */ new Map();
  changeSlotStatusShowCheckCallback = (playerID, actionOption) => {
    return this.canChangeSlotStatus(playerID, actionOption);
  };
  swapShowCheckCallback = (playerID, _actionOption) => {
    return this.canSwap(playerID);
  };
  viewProfileCheckCallback = (playerID, _actionOption) => {
    return Online.Social.canViewProfileWithLobbyPlayerId(playerID);
  };
  slotActionsData = /* @__PURE__ */ new Map([
    [
      "SLOT_ACTION_TYPE_VIEW" /* VIEW */,
      {
        actionType: "SLOT_ACTION_TYPE_VIEW" /* VIEW */,
        displayName: Locale.compose("LOC_UI_MP_PLAYER_OPTIONS_VIEW_PROFILE"),
        showCheckCallback: this.viewProfileCheckCallback
      }
    ],
    [
      "SLOT_ACTION_TYPE_OPEN" /* OPEN */,
      {
        actionType: "SLOT_ACTION_TYPE_OPEN" /* OPEN */,
        displayName: Locale.compose("LOC_SLOT_ACTION_OPEN"),
        showCheckCallback: this.changeSlotStatusShowCheckCallback,
        slotStatus: SlotStatus.SS_OPEN
      }
    ],
    [
      "SLOT_ACTION_TYPE_CLOSE" /* CLOSE */,
      {
        actionType: "SLOT_ACTION_TYPE_CLOSE" /* CLOSE */,
        displayName: Locale.compose("LOC_SLOT_ACTION_CLOSE"),
        showCheckCallback: this.changeSlotStatusShowCheckCallback,
        slotStatus: SlotStatus.SS_CLOSED
      }
    ],
    [
      "SLOT_ACTION_TYPE_AI" /* AI */,
      {
        actionType: "SLOT_ACTION_TYPE_AI" /* AI */,
        displayName: Locale.compose("LOC_SLOT_ACTION_AI"),
        showCheckCallback: this.changeSlotStatusShowCheckCallback,
        slotStatus: SlotStatus.SS_COMPUTER
      }
    ],
    [
      "SLOT_ACTION_TYPE_SWAP" /* SWAP */,
      {
        actionType: "SLOT_ACTION_TYPE_SWAP" /* SWAP */,
        displayName: Locale.compose("LOC_SLOT_ACTION_SWAP_REQUEST"),
        showCheckCallback: this.swapShowCheckCallback
      }
    ]
  ]);
  isActive = false;
  /**
   * Returns whether or not the model is active.
   */
  get active() {
    return this.isActive;
  }
  /**
   * Startup the model, putting it in an active state.
   */
  startup() {
    if (!this.isActive) {
      engine.on("DNAUserProfileCacheReady", this.update, this);
      engine.on("KickVoteComplete", this.onKickVoteComplete, this);
      engine.on("KickVoteStarted", this.onKickVoteStarted, this);
      engine.on("MultiplayerHostMigrated", this.onMultiplayerHostMigrated, this);
      engine.on("MultiplayerJoinGameComplete", this.update, this);
      engine.on("PlayerInfoChanged", this.update, this);
      engine.on("PlayerStartReadyChanged", this.update, this);
      engine.on("staging-mute-changed", this.update, this);
      engine.on("UserProfilesUpdated", this.update, this);
      window.addEventListener("user-profile-updated", this.onUserProfileUpdatedEventListener);
      this.isActive = true;
      this.update();
    }
  }
  /**
   * Shutdown the model, putting it in an inactive state.
   */
  shutdown() {
    if (this.isActive) {
      engine.off("DNAUserProfileCacheReady", this.update, this);
      engine.off("KickVoteComplete", this.onKickVoteComplete, this);
      engine.off("KickVoteStarted", this.onKickVoteStarted, this);
      engine.off("MultiplayerHostMigrated", this.onMultiplayerHostMigrated, this);
      engine.off("MultiplayerJoinGameComplete", this.update, this);
      engine.off("PlayerInfoChanged", this.update, this);
      engine.off("PlayerStartReadyChanged", this.update, this);
      engine.off("staging-mute-changed", this.update, this);
      engine.off("UserProfilesUpdated", this.update, this);
      window.removeEventListener("user-profile-updated", this.onUserProfileUpdatedEventListener);
      this.isActive = false;
    }
  }
  get gameName() {
    const gameConfig = Configuration.getGame();
    return gameConfig.gameName ?? "DBG Missing Name of game";
  }
  get joinCode() {
    return Network.getJoinCode();
  }
  get timeRemainingTimer() {
    return `${this.formatDateToMinutes(this.globalCountdownRemainingSeconds)} ${Locale.compose("LOC_UI_MP_LOBBY_TIME_REMAINING")}`;
  }
  get canToggleReady() {
    if (this.isUsingGlobalCountdown && this.globalCountdownRemainingSeconds <= 0 || this.readyStatus == "WAITING_FOR_HOST" /* WAITING_FOR_HOST */) {
      return false;
    }
    return true;
  }
  get isLocalPlayerReady() {
    return Network.isPlayerStartReady(GameContext.localPlayerID);
  }
  get canEditMementos() {
    return !this.isLocalPlayerReady && MPLobbyDataModel.isNewGame;
  }
  get summaryMapSize() {
    const mapSizeName = this.findGameParameter(this.MapSizeStringHandle)?.value.name;
    const mapSize = mapSizeName != void 0 ? GameSetup.resolveString(mapSizeName) : null;
    return mapSize ?? "DBG Missing Map size";
  }
  get summarySpeed() {
    const speedName = this.findGameParameter(this.GameSpeedsStringHandle)?.value.name;
    const speed = speedName != void 0 ? GameSetup.resolveString(speedName) : null;
    return speed ?? "DBG Missing Speed name";
  }
  get summaryMapType() {
    const mapConfig = Configuration.getMap();
    return mapConfig.mapName ?? "DBG Missing Map type";
  }
  get summaryMapRuleSet() {
    const ruleSetName = this.findGameParameter(this.RulesetStringHandle)?.value.name;
    const ruleSet = ruleSetName != void 0 ? GameSetup.resolveString(ruleSetName) : null;
    return ruleSet ?? "DBG Missing Rule set";
  }
  get ageBannerSrc() {
    let bannerSrc = "Skyline_Sm";
    const ageParameter = this.findGameParameter(this.AgeStringHandle);
    if (ageParameter) {
      const bannerName = GameSetup.findString("Banner");
      if (bannerName != GAMESETUP_INVALID_STRING) {
        const currentAgeBanner = ageParameter.value.additionalProperties?.find(
          (additionalProperty) => additionalProperty.name == bannerName
        )?.value;
        if (typeof currentAgeBanner == "string") {
          bannerSrc = currentAgeBanner;
        } else {
          console.warn(
            "model-mp-staging-new: ageBannerSrc(): the 'Banner' additional property is not a string!"
          );
        }
      } else {
        console.warn("model-mp-staging-new: ageBannerSrc(): no 'Banner' are declared in game setup!");
      }
    } else {
      console.warn("model-mp-staging-new: ageBannerSrc(): ageParameter is null!");
    }
    return `fs://game/${bannerSrc}`;
  }
  get difficulty() {
    const gameConfig = Configuration.getGame();
    return gameConfig.difficultyName ?? "?";
  }
  get playerCounters() {
    const { humanPlayerCount, maxJoinablePlayerCount } = Configuration.getGame();
    return Locale.compose("LOC_UI_MP_LOBBY_PLAYERS", `${humanPlayerCount}`, `${maxJoinablePlayerCount}`);
  }
  get isUsingGlobalCountdown() {
    if (Network.isPlayerHotJoining(GameContext.localPlayerID)) {
      return false;
    }
    const gameConfig = Configuration.getGame();
    if (!gameConfig.isMatchMaking) {
      return false;
    }
    return true;
  }
  get isKickOptionHidden() {
    return !Configuration.getGame().isKickVoting && Network.getHostPlayerId() != GameContext.localPlayerID;
  }
  get lobbyPlayersData() {
    return this.playersData;
  }
  addVoteDialogBox(kickPlayerID, dialogBoxID) {
    if (this.voteDialogBoxIDPerKickPlayerID.has(kickPlayerID)) {
      console.error(
        "model-mp-staging-new: addVoteDialogBox(): There is already a Vote dialog box for that player! " + kickPlayerID
      );
      return;
    }
    this.voteDialogBoxIDPerKickPlayerID.set(kickPlayerID, dialogBoxID);
  }
  removeVoteDialogBox(kickPlayerID) {
    if (!this.voteDialogBoxIDPerKickPlayerID.has(kickPlayerID)) {
      console.warn(
        "model-mp-staging-new: removeVoteDialogBox(): There is none Vote dialog box for that player. " + kickPlayerID
      );
      return;
    }
    this.voteDialogBoxIDPerKickPlayerID.delete(kickPlayerID);
  }
  kick(kickPlayerID) {
    const gameConfig = Configuration.getGame();
    const isKickVote = gameConfig.isKickVoting;
    const dialogCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        if (isKickVote) {
          const yesVote = true;
          Network.kickVotePlayer(kickPlayerID, yesVote, KickVoteReasonType.KICKVOTE_NONE);
          this.kickTimerReference = window.setTimeout(
            this.kickTimerListener,
            MPLobbyDataModel.KICK_VOTE_COOLDOWN
          );
          this.kickVoteLockout = true;
        } else {
          Network.directKickPlayer(kickPlayerID);
        }
      }
    };
    if (this.kickVoteLockout) {
      DialogBoxManager.createDialog_Confirm({
        body: "LOC_KICK_DIALOG_TIMEOUT",
        title: "LOC_KICK_DIALOG_TITLE"
      });
    } else {
      const kickPlayerConfig = Configuration.getPlayer(kickPlayerID);
      const kickPlayerName = Locale.compose(kickPlayerConfig.slotName);
      const dialogBoxID = DialogBoxManager.createDialog_ConfirmCancel({
        body: Locale.compose(
          isKickVote ? "LOC_KICK_VOTE_CONFIRM_DIALOG" : "LOC_DIRECT_KICK_CONFIRM_DIALOG",
          kickPlayerName
        ),
        title: "LOC_KICK_DIALOG_TITLE",
        callback: dialogCallback
      });
      this.addVoteDialogBox(kickPlayerID, dialogBoxID);
    }
  }
  mute(mutePlayerID, mute) {
    Network.setPlayerMuted(mutePlayerID, mute);
    engine.trigger("staging-mute-changed");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  /**
   * isHostPlayer
   * @param playerId
   * @returns if a given player is the host
   */
  static isHostPlayer(playerId) {
    return playerId == Network.getHostPlayerId();
  }
  /**
   * isLocalPlayer
   * @param playerId
   * @returns if a given player is local
   */
  static isLocalPlayer(playerId) {
    return playerId == GameContext.localPlayerID;
  }
  /**
   * isLocalHostPlayer
   * @returns if our own player is the (local) host
   */
  static isLocalHostPlayer() {
    return Network.getHostPlayerId() == GameContext.localPlayerID;
  }
  static get isNewGame() {
    const gameConfig = Configuration.getGame();
    return gameConfig.gameState == GameStateTypes.GAMESTATE_PREGAME;
  }
  civIconURLGetter = (id, showLockIcon) => {
    if (showLockIcon) {
      return "fs://game/core/mp_locked.png";
    }
    const civId = id.value;
    return UI.getIconURL(civId == "RANDOM" ? "CIVILIZATION_RANDOM" : civId, "");
  };
  leaderIconURLGetter = (id, showLockIcon) => {
    if (showLockIcon) {
      return "fs://game/core/mp_locked.png";
    }
    const leaderId = GameSetup.resolveString(id.icon) ?? "";
    const iconURL = UI.getIconURL(leaderId, "CIRCLE_MASK");
    return iconURL;
  };
  findPlayerParameter(player, paramName) {
    let cache = this.playerParameterCache.get(player);
    if (cache == null) {
      cache = /* @__PURE__ */ new Map();
      this.playerParameterCache.set(player, cache);
    }
    const param = cache.get(paramName);
    if (param) {
      return param;
    } else {
      const p = GameSetup.findPlayerParameter(player, paramName);
      if (p) {
        cache.set(paramName, p);
        return p;
      }
    }
    return null;
  }
  findGameParameter(paramName) {
    const param = this.gameParameterCache.get(paramName);
    if (param) {
      return param;
    } else {
      const p = GameSetup.findGameParameter(paramName);
      if (p) {
        this.gameParameterCache.set(paramName, p);
        return p;
      }
    }
    return null;
  }
  update() {
    if (!this.isActive) {
      console.error("Attempting to update the MPLobbyDataModel while it is inactive.");
      return;
    }
    this.playersData.length = 0;
    this.localPlayerData = void 0;
    this.playerParameterCache.clear();
    this.gameParameterCache.clear();
    const civBiasData = Database.query(
      "config",
      "SELECT CivilizationType, LeaderType, ReasonType FROM LeaderCivilizationBias"
    );
    if (civBiasData) {
      this.cacheLeaderCivilizationBias.clear();
      for (const row of civBiasData) {
        const civilizationType = row[0];
        const leaderType = row[1];
        const reason = row[2];
        let leaderCache = this.cacheLeaderCivilizationBias.get(leaderType);
        if (leaderCache == null) {
          leaderCache = /* @__PURE__ */ new Map();
          this.cacheLeaderCivilizationBias.set(leaderType, leaderCache);
        }
        leaderCache.set(civilizationType, reason);
      }
    }
    const localPlatform = Network.getLocalHostingPlatform();
    if (MultiplayerShellManager.unitTestMP) {
      this.pushDummyPlayersData();
    } else {
      const numPlayers = Configuration.getMap().maxMajorPlayers;
      const gameConfig = Configuration.getGame();
      const bFullCivsOnly = true;
      const bAliveCivsOnly = true;
      const bUnlockedCivsOnly = true;
      const bCanBeHumanOnly = true;
      this.participatingCount = gameConfig.getParticipatingPlayerCount(
        bFullCivsOnly,
        !bAliveCivsOnly,
        !bUnlockedCivsOnly,
        bCanBeHumanOnly
      );
      const isKickVote = gameConfig.isKickVoting;
      const canLocalPlayerEverKick = isKickVote && Network.canPlayerEverKickVote(GameContext.localPlayerID) || // Kick Vote conditions
      !isKickVote && Network.canPlayerEverDirectKick(GameContext.localPlayerID);
      for (let curPlayerID = 0; curPlayerID < numPlayers; curPlayerID++) {
        const playerConfig = Configuration.getPlayer(curPlayerID);
        if (!MPLobbyDataModel.isNewGame && playerConfig.isParticipant && playerConfig.civilizationLevelTypeID != CivilizationLevelTypes.CIVILIZATION_LEVEL_FULL_CIV) {
          continue;
        }
        if (playerConfig.isParticipant && !playerConfig.isAlive) {
          continue;
        }
        const isParticipant = playerConfig.isParticipant;
        const isHost = MPLobbyDataModel.isHostPlayer(curPlayerID);
        const isLocal = MPLobbyDataModel.isLocalPlayer(curPlayerID);
        let statusIcon = "none";
        let statusIconTooltip = "";
        if (isHost) {
          statusIcon = "fs://game/core/mpicon_host.png";
          statusIconTooltip = Locale.compose("LOC_UI_MP_HOST");
        } else if (playerConfig.isLocked) {
          statusIcon = "fs://game/core/mp_locked.png";
          statusIconTooltip = Locale.compose("LOC_UI_MP_LOCKED_PLAYER");
        } else if (!playerConfig.canBeHuman) {
          statusIcon = "fs://game/core/mp_locked.png";
          statusIconTooltip = Locale.compose("LOC_UI_MP_CANT_BE_HUMAN");
        } else if (isLocal) {
          statusIcon = "fs://game/core/mpicon_localplayer.png";
          statusIconTooltip = Locale.compose("LOC_UI_MP_LOCAL_PLAYER");
        }
        const isReady = Network.isPlayerStartReady(curPlayerID);
        const isHuman = playerConfig.isHuman || playerConfig.isObserver;
        const isDistantHuman = !isLocal && isHuman;
        let platformIcon = "none";
        let platformIconTooltip = "";
        const curPlatform = Network.getPlayerHostingPlatform(curPlayerID);
        if (isHuman) {
          const tempIcon = NetworkUtilities.getHostingTypeURL(curPlatform);
          if (tempIcon) {
            platformIcon = tempIcon;
          }
          const tempTooltip = NetworkUtilities.getHostingTypeTooltip(curPlatform);
          if (tempTooltip) {
            platformIconTooltip = tempTooltip;
          }
        }
        let leaderPortrait = "";
        if (playerConfig.isParticipant && playerConfig.leaderTypeName) {
          leaderPortrait = playerConfig.leaderTypeName != "RANDOM" ? playerConfig.leaderTypeName : "UNKNOWN_LEADER";
        }
        let leaderName = "";
        let civName = "";
        if (playerConfig.isParticipant && playerConfig.leaderTypeName && playerConfig.civilizationTypeName) {
          leaderName = playerConfig.leaderTypeName;
          civName = playerConfig.civilizationTypeName;
        }
        let playerInfoDropdown = null;
        let civilizationDropdown = null;
        let teamDropdown = null;
        let leaderDropdown = null;
        let mementos = [];
        const localPlayerReady = Network.isPlayerStartReady(GameContext.localPlayerID);
        const isLocalPlayerHost = MPLobbyDataModel.isHostPlayer(GameContext.localPlayerID);
        const gamertag = Locale.stylize(playerConfig.slotName);
        const twoKName = playerConfig.nickName_T2GP;
        const firstPartyName = playerConfig.nickName_1P;
        const isPlayerInfoSlotDisabled = localPlayerReady || !isLocalPlayerHost && [SlotStatus.SS_CLOSED, SlotStatus.SS_OPEN].includes(playerConfig.slotStatus) || isLocal;
        const lobbyPlayerConnectionStatus = this.GetMPLobbyPlayerConnectionStatus(playerConfig);
        playerInfoDropdown = this.createSlotActionsDropdown(
          curPlayerID,
          gamertag,
          isPlayerInfoSlotDisabled,
          lobbyPlayerConnectionStatus
        );
        if (playerConfig.isParticipant) {
          const canEditSlot = !localPlayerReady && // no more edition allowed when ready
          (isLocal || // we can edit our own slot...
          playerConfig.isAI && MPLobbyDataModel.isLocalHostPlayer());
          const canEditSlot_PreGame = canEditSlot && MPLobbyDataModel.isNewGame;
          const canEditSlot_AgeTrans = canEditSlot && (Modding.getTransitionInProgress() == TransitionType.Age || MPLobbyDataModel.isNewGame);
          civilizationDropdown = this.createPlayerParamDropdown(
            curPlayerID,
            "civ_selector_0",
            "PLAYER_CIV" /* PLAYER_CIV */,
            "PLAYER_CIV" /* PLAYER_CIV */,
            Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
            this.PlayerCivilizationStringHandle,
            !canEditSlot_AgeTrans,
            false,
            this.civIconURLGetter
          );
          teamDropdown = this.createTeamParamDropdown(
            curPlayerID,
            "team_selector_0",
            "PLAYER_TEAM" /* PLAYER_TEAM */,
            "PLAYER_TEAM" /* PLAYER_TEAM */,
            Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
            this.PlayerTeamStringHandle,
            !canEditSlot_AgeTrans,
            true
          );
          leaderDropdown = this.createPlayerParamDropdown(
            curPlayerID,
            "leader_selector_0",
            "PLAYER_LEADER" /* PLAYER_LEADER */,
            "PLAYER_LEADER" /* PLAYER_LEADER */,
            Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
            this.PlayerLeaderStringHandle,
            !canEditSlot_PreGame,
            true,
            this.leaderIconURLGetter
          );
          if (gameConfig.isMementosEnabled && isHuman) {
            mementos = [
              this.findPlayerParameter(curPlayerID, this.PlayerMementoMajorSlotStringHandle)?.value.value,
              this.findPlayerParameter(curPlayerID, this.PlayerMementoMinorSlot1StringHandle)?.value.value
            ];
          }
        }
        const isConnected = Network.isPlayerConnected(curPlayerID);
        const isKickVoteTarget = isKickVote && Network.isKickVoteTarget(curPlayerID);
        const canEverBeKicked = canLocalPlayerEverKick && Network.canEverKickPlayer(curPlayerID);
        const canBeKickedNow = canEverBeKicked && (isKickVote && Network.canKickVotePlayerNow(curPlayerID) && !isKickVoteTarget || // Kick Vote conditions
        !isKickVote && Network.canDirectKickPlayerNow(curPlayerID));
        const kickTooltip = canEverBeKicked ? Locale.compose(
          canBeKickedNow ? "LOC_SLOT_ACTION_KICK_PLAYER" : "LOC_SLOT_ACTION_KICK_PLAYER_DISABLED"
        ) : "";
        const isMuted = Network.isPlayerMuted(curPlayerID);
        const muteTooltip = isDistantHuman ? Locale.compose(isMuted ? "LOC_SLOT_ACTION_UNMUTE" : "LOC_SLOT_ACTION_MUTE") : "";
        const curFriendId = Network.supportsSSO() ? Online.Social.getPlayerFriendID_T2GP(curPlayerID) : Online.Social.getPlayerFriendID_Network(curPlayerID);
        const playerInfo = curFriendId ? getPlayerCardInfo(isLocal ? void 0 : curFriendId, isLocal ? void 0 : twoKName, true) : void 0;
        let backgroundURL = "";
        let badgeURL = "";
        let foundationLevel = 0;
        let playerTitle = "";
        if (playerInfo) {
          backgroundURL = playerInfo.BackgroundURL;
          badgeURL = playerInfo.BadgeURL;
          foundationLevel = playerInfo.FoundationLevel;
          playerTitle = playerInfo.playerTitle;
        }
        const samePlatformAsLocalPlayer = curPlatform == localPlatform;
        const playerData = {
          playerID: curPlayerID.toString(),
          isParticipant,
          isHost,
          isLocal,
          statusIcon,
          statusIconTooltip,
          isReady,
          platformIcon,
          platformIconTooltip,
          leaderPortrait,
          leaderName,
          foundationLevel,
          badgeURL,
          backgroundURL,
          playerTitle,
          civName,
          gamertag,
          firstPartyName,
          twoKName,
          playerInfoDropdown,
          civilizationDropdown,
          teamDropdown,
          leaderDropdown,
          mementos,
          isHuman,
          isDistantHuman,
          isConnected,
          canEverBeKicked,
          canBeKickedNow,
          kickTooltip,
          isKickVoteTarget,
          isMuted,
          muteTooltip,
          samePlatformAsLocalPlayer
        };
        this.playersData.push(playerData);
      }
      this.localPlayerData = this.playersData.find(({ isLocal }) => isLocal);
    }
    this.updateReadyButtonData(GameContext.localPlayerID);
    if (this.onUpdate) {
      this.onUpdate(this);
    }
    window.dispatchEvent(new LobbyUpdateEvent());
  }
  stringify(player) {
    return JSON.stringify(player);
  }
  GetMPLobbyPlayerConnectionStatus(playerConfig) {
    return !Network.isPlayerConnected(playerConfig.id) && !playerConfig.isAI ? 1 /* DISCONNECTED */ : 0 /* CONNECTED */;
  }
  formatDateToMinutes(seconds) {
    const date = new Date(seconds * 1e3);
    return ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
  }
  getTooltip(paramNameHandle, paramID, playerID) {
    switch (paramNameHandle) {
      case this.PlayerCivilizationStringHandle:
        return this.getCivilizationTooltip(paramID, playerID);
      case this.PlayerLeaderStringHandle:
        return this.getLeaderTooltip(paramID);
    }
    return;
  }
  getCivilizationTooltip(civilizationType, playerID) {
    let tt = this.cachedCivilizationTooltipFragments.get(civilizationType);
    if (tt == null) {
      const civilizationsData = GetCivilizationData(false);
      const civData = civilizationsData.find((data) => {
        return data.civID == civilizationType;
      });
      if (!civData) {
        console.error(`model-map-staging-new: Failed to find civData for ${civilizationType}`);
        return;
      }
      tt = `
			[STYLE:text-secondary][STYLE:font-title-lg]${Locale.compose(civData.name)}[/S][/S][N]
			${civData.tags && civData.tags.length > 0 ? `[N][B]${Locale.compose(civData.tags.join(", "))}[/B]` : ""}
			${civData.abilityText && civData.abilityText != "" ? `[N]${Locale.compose(civData.abilityText)}` : ""}
			${civData.bonuses && civData.bonuses.length > 0 ? `[N][STYLE:text-secondary][STYLE:font-title-base]${Locale.compose("LOC_CREATE_CIV_UNIQUE_BONUSES_SUBTITLE")}[/S][/S]
				[N]${civData.bonuses.map((bonus) => {
        return `[STYLE:text-secondary][B]${Locale.compose(bonus.title)}[/B][/S][N]${Locale.compose(bonus.description)}`;
      }).join("[N]")}` : ""}
			`;
      this.cachedCivilizationTooltipFragments.set(civilizationType, tt);
    }
    let civLeaderReasonType = "";
    const leaderParam = this.findPlayerParameter(playerID, this.PlayerLeaderStringHandle);
    if (leaderParam) {
      const leaderType = leaderParam.value.value;
      const leaderCache = this.cacheLeaderCivilizationBias.get(leaderType);
      if (leaderCache) {
        const reason = leaderCache.get(civilizationType);
        if (reason) {
          civLeaderReasonType = `[N]${Locale.compose(reason)}`;
        }
      }
    } else {
      console.error(`model-map-staging-new: Couldn't find Leader Parameters for player with ID: ${playerID}`);
    }
    return tt + civLeaderReasonType;
  }
  getLeaderTooltip(leaderType) {
    const leadersData = getLeaderData(false);
    let tt = this.cachedLeaderTooltips.get(leaderType);
    if (tt == null) {
      const leaderData = leadersData.find((data) => {
        return data.leaderID == leaderType;
      });
      if (!leaderData) {
        console.error(`model-map-staging-new: Failed to find leaderData for ${leaderType}`);
        return;
      }
      tt = `
			[STYLE:text-secondary][STYLE:font-title-lg]${Locale.compose(leaderData.name)}[/S][/S]
			${leaderData.tags ? `[N]${leaderData.tags.map((tag) => `[B]${Locale.compose(tag)}[/B]`).join(", ")}` : ""}
			${leaderData.description ? `[N]${Locale.compose(leaderData.description)}` : ""}
			`;
      this.cachedLeaderTooltips.set(leaderType, tt);
    }
    return tt;
  }
  updateStartingGameReadyButtonData(totalCountdown, remainingTime, skipUpdate = false) {
    this.allReadyCountdownRemainingSeconds = Math.round(remainingTime / 1e3);
    this.allReadyCountdownRemainingPercentage = remainingTime / totalCountdown * 100;
    this.readyButtonCaption = Locale.compose("LOC_UI_MP_LOBBY_READY_BUTTON_STARTING_GAME");
    if (!skipUpdate && this.onUpdate) {
      this.onUpdate(this);
    }
  }
  updateGlobalCountdownRemainingSecondsData(remainingTime, skipUpdate = false) {
    this.globalCountdownRemainingSeconds = Math.round(remainingTime / 1e3);
    if (!skipUpdate && this.onUpdate) {
      this.onUpdate(this);
    }
  }
  getRemainingGlobalCountdown() {
    return MPLobbyDataModel.GLOBAL_COUNTDOWN - Network.getSecondsSinceSessionCreation() * 1e3;
  }
  cancelGlobalCountdown() {
    clearInterval(this.globalCountdownIntervalHandle);
    clearInterval(this.allReadyCountdownIntervalHandle);
    this.globalCountdownRemainingSeconds = 0;
  }
  updateGlobalCountdownData() {
    clearInterval(this.globalCountdownIntervalHandle);
    this.globalCountdownRemainingSeconds = 0;
    if (!this.isUsingGlobalCountdown) {
      return;
    }
    const skipUpdate = true;
    this.updateGlobalCountdownRemainingSecondsData(this.getRemainingGlobalCountdown(), skipUpdate);
    this.globalCountdownIntervalHandle = setInterval(() => {
      const remainingTime = this.getRemainingGlobalCountdown();
      if (remainingTime <= 0) {
        this.updateGlobalCountdownRemainingSecondsData(0);
        clearInterval(this.globalCountdownIntervalHandle);
        if (!Network.isPlayerStartReady(GameContext.localPlayerID)) {
          Network.toggleLocalPlayerStartReady();
        }
        Audio.playSound("data-audio-timer-final-tick", "multiplayer-lobby");
        this.updateReadyButtonData(GameContext.localPlayerID, "STARTING_GAME" /* STARTING_GAME */);
      } else {
        if (this.globalCountdownRemainingSeconds <= 10) {
          Audio.playSound("data-audio-timer-tick", "multiplayer-lobby");
        }
        this.updateGlobalCountdownRemainingSecondsData(remainingTime);
      }
    }, MPLobbyDataModel.GLOBAL_COUNTDOWN_STEP);
  }
  areAllPlayersReady() {
    let allReady = true;
    this.playersData.forEach((playerData) => {
      if (playerData.isHuman && (!Network.isPlayerStartReady(parseInt(playerData.playerID)) || !Network.isPlayerModReady(parseInt(playerData.playerID)))) {
        allReady = false;
        return;
      }
    });
    return allReady;
  }
  getReadyStatus(localPlayerId) {
    let readyStatus = "NOT_READY" /* NOT_READY */;
    if (Network.isPlayerStartReady(localPlayerId)) {
      const allReady = this.areAllPlayersReady();
      if (Network.isPlayerHotJoining(GameContext.localPlayerID) && allReady) {
        return "WAITING_FOR_HOST" /* WAITING_FOR_HOST */;
      }
      if (allReady) {
        if (this.startGameRemainingTime <= 0 && !MPLobbyDataModel.isLocalHostPlayer()) {
          readyStatus = "WAITING_FOR_HOST" /* WAITING_FOR_HOST */;
        } else {
          readyStatus = "STARTING_GAME" /* STARTING_GAME */;
        }
      } else {
        readyStatus = "WAITING_FOR_OTHERS" /* WAITING_FOR_OTHERS */;
      }
    }
    return readyStatus;
  }
  updateReadyButtonData(localPlayerId, forcedStatus) {
    const newReadyStatus = forcedStatus ?? this.getReadyStatus(localPlayerId);
    if (this.readyStatus === newReadyStatus) {
      return;
    }
    this.readyStatus = newReadyStatus;
    clearInterval(this.allReadyCountdownIntervalHandle);
    if (!["WAITING_FOR_HOST" /* WAITING_FOR_HOST */, "STARTING_GAME" /* STARTING_GAME */].includes(this.readyStatus)) {
      this.allReadyCountdownRemainingSeconds = 0;
      this.allReadyCountdownRemainingPercentage = 0;
      this.startGameRemainingTime = MPLobbyDataModel.ALL_READY_COUNTDOWN;
    }
    switch (this.readyStatus) {
      case "NOT_READY" /* NOT_READY */:
        if (window.innerHeight <= SMALL_SCREEN_MODE_MAX_HEIGHT && UI.getViewExperience() == UIViewExperience.Mobile) {
          this.readyButtonCaption = "";
        } else {
          this.readyButtonCaption = Locale.compose("LOC_UI_MP_LOBBY_READY_BUTTON_NOT_READY");
        }
        break;
      case "WAITING_FOR_OTHERS" /* WAITING_FOR_OTHERS */:
        this.readyButtonCaption = Locale.compose("LOC_UI_MP_LOBBY_READY_BUTTON_WAITING_FOR_OTHERS");
        break;
      case "STARTING_GAME" /* STARTING_GAME */: {
        const skipUpdate = true;
        this.updateStartingGameReadyButtonData(
          MPLobbyDataModel.ALL_READY_COUNTDOWN,
          this.startGameRemainingTime,
          skipUpdate
        );
        this.allReadyCountdownIntervalHandle = setInterval(() => {
          this.startGameRemainingTime -= MPLobbyDataModel.ALL_READY_COUNTDOWN_STEP;
          if (this.startGameRemainingTime <= 0) {
            this.updateStartingGameReadyButtonData(MPLobbyDataModel.ALL_READY_COUNTDOWN, 0);
            clearInterval(this.allReadyCountdownIntervalHandle);
            if (MPLobbyDataModel.isLocalHostPlayer()) {
              Network.startGame();
            }
            setTimeout(() => {
              this.updateReadyButtonData(GameContext.localPlayerID, "WAITING_FOR_HOST" /* WAITING_FOR_HOST */);
              if (this.onUpdate) {
                this.onUpdate(this);
              }
            }, 1e3);
            Audio.playSound("data-audio-timer-final-tick", "multiplayer-lobby");
          } else {
            this.updateStartingGameReadyButtonData(
              MPLobbyDataModel.ALL_READY_COUNTDOWN,
              this.startGameRemainingTime
            );
            Audio.playSound("data-audio-timer-tick", "multiplayer-lobby");
          }
        }, MPLobbyDataModel.ALL_READY_COUNTDOWN_STEP);
        break;
      }
      case "WAITING_FOR_HOST" /* WAITING_FOR_HOST */:
        this.readyButtonCaption = Locale.compose("LOC_MP_JOINING_GAME_BODY");
        break;
      default:
        console.error("model-mp-staging-new: updateReadyButtonData(): Invalid this.readyStatus");
        break;
    }
  }
  createPlayerParamDropdown(playerID, dropID, type, dropLabel, dropDesc, paramNameHandle, isDisabled, showLabelOnSelectedItem, getIconURLFunc) {
    const dropdownData = new MPLobbyDropdownOptionData();
    dropdownData.dropdownType = "DROPDOWN_TYPE_PLAYER_PARAM" /* PLAYER_PARAM */;
    dropdownData.id = dropID;
    dropdownData.type = type;
    dropdownData.label = dropLabel;
    dropdownData.description = dropDesc;
    dropdownData.isDisabled = isDisabled;
    dropdownData.showLabelOnSelectedItem = showLabelOnSelectedItem;
    dropdownData.playerParamName = GameSetup.resolveString(paramNameHandle) ?? void 0;
    const playerParamsData = [];
    const playerParameter = this.findPlayerParameter(playerID, paramNameHandle);
    if (playerParameter) {
      playerParameter.domain.possibleValues?.forEach((v) => {
        if (v.invalidReason != GameSetupDomainValueInvalidReason.NotValid) {
          const paramID = v.value?.toString();
          const nameKey = GameSetup.resolveString(v.name);
          const locked = v.invalidReason != GameSetupDomainValueInvalidReason.Valid;
          const notOwned = v.invalidReason == GameSetupDomainValueInvalidReason.NotValidOwnership;
          const showLockIcon = v.invalidReason == GameSetupDomainValueInvalidReason.NotValidOwnership && (MPLobbyDataModel.isLocalPlayer(playerID) || MPLobbyDataModel.isLocalHostPlayer() && Configuration.getPlayer(playerID).isAI);
          const iconURL = getIconURLFunc ? getIconURLFunc(v, showLockIcon) : "";
          if (LiveEventManager.restrictToPreferredCivs()) {
            if (paramNameHandle == this.PlayerLeaderStringHandle && paramID == "RANDOM") {
              return;
            }
            if (paramNameHandle == this.PlayerCivilizationStringHandle) {
              const currentLeaderID = this.findPlayerParameter(playerID, this.PlayerLeaderStringHandle)?.value?.value;
              const civLeaderPairingData = Database.query("config", "select * from LeaderCivParings") ?? [];
              const civFixed = civLeaderPairingData.find((row) => row.LeaderType == currentLeaderID);
              const civID = civFixed?.CivilizationType ?? "";
              if (paramID != civID) {
                return;
              }
            }
          }
          if (paramID != null && nameKey != null) {
            const showUnownedContent = Configuration.getUser().showUnownedContent;
            if (showUnownedContent || !notOwned) {
              playerParamsData.push({
                label: Locale.compose(nameKey),
                paramID,
                iconURL,
                tooltip: this.getTooltip(paramNameHandle, paramID, playerID),
                disabled: locked
              });
            }
          }
        }
      });
      playerParamsData.sort(
        (a, b) => a.paramID == "RANDOM" ? -1 : b.paramID == "RANDOM" ? 1 : Locale.compare(a.label, b.label)
      );
      if (typeof playerParameter.value.value == "string") {
        dropdownData.selectedItemIndex = playerParamsData.findIndex(
          ({ paramID }) => paramID === playerParameter.value.value
        );
        dropdownData.selectedItemTooltip = playerParamsData.find(
          ({ paramID }) => paramID === playerParameter.value.value
        )?.tooltip;
      }
    } else {
      console.error(
        "model-mp-staging-new: createPlayerParamDropdown(): Failed to find the paramName: " + GameSetup.resolveString(paramNameHandle) + " for playerID: " + playerID
      );
    }
    dropdownData.itemList = playerParamsData;
    return dropdownData;
  }
  createTeamParamDropdown(playerID, dropID, type, dropLabel, dropDesc, paramNameHandle, isDisabled, showLabelOnSelectedItem) {
    const dropdownData = new MPLobbyDropdownOptionData();
    dropdownData.dropdownType = "DROPDOWN_TYPE_TEAM" /* TEAM */;
    dropdownData.id = dropID;
    dropdownData.type = type;
    dropdownData.label = dropLabel;
    dropdownData.description = dropDesc;
    dropdownData.isDisabled = isDisabled;
    dropdownData.showLabelOnSelectedItem = showLabelOnSelectedItem;
    dropdownData.playerParamName = GameSetup.resolveString(paramNameHandle) ?? void 0;
    const playerParamsData = [];
    playerParamsData.push({
      label: "",
      teamID: -1,
      tooltip: "LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC",
      disabled: false
    });
    for (let i = 0; i < 8; i++) {
      playerParamsData.push({
        label: Locale.compose("LOC_UI_MP_LOBBY_TEAM", i + 1),
        teamID: i,
        tooltip: "LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC",
        disabled: false
      });
    }
    const playerConfig = Configuration.getPlayer(playerID);
    dropdownData.selectedItemIndex = playerConfig.team + 1;
    dropdownData.itemList = playerParamsData;
    return dropdownData;
  }
  createSlotActionsDropdown(playerID, gamertag, isDisabled, lobbyPlayerConnectionStatus) {
    const slotActionsData = [
      { label: gamertag, slotActionType: "SLOT_ACTION_TYPE_NONE" /* NONE */ }
    ];
    for (const [_actionKey, actionOption] of this.slotActionsData) {
      if (actionOption.showCheckCallback(playerID, actionOption)) {
        slotActionsData.push({ label: actionOption.displayName, slotActionType: actionOption.actionType });
      }
    }
    const dropdownData = new MPLobbyDropdownOptionData();
    dropdownData.dropdownType = "DROPDOWN_TYPE_SLOT_ACTION" /* SLOT_ACTION */;
    dropdownData.id = "action_selector_0";
    dropdownData.type = "PLAYER_SLOT_ACTION" /* PLAYER_SLOT_ACTION */;
    dropdownData.label = "PLAYER_SLOT_ACTION" /* PLAYER_SLOT_ACTION */;
    dropdownData.description = Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_ACTION_DESC");
    dropdownData.itemList = slotActionsData;
    dropdownData.selectedItemIndex = 0;
    dropdownData.isDisabled = isDisabled;
    dropdownData.tooltip = lobbyPlayerConnectionStatus == 1 /* DISCONNECTED */ ? Locale.compose("LOC_UI_MP_NOT_CONNECTED_TO_LOBBY") : void 0;
    return dropdownData;
  }
  onGameReady() {
    Network.toggleLocalPlayerStartReady();
  }
  onKickVoteStarted(data) {
    this.update();
    if (MPLobbyDataModel.isLocalPlayer(data.kickPlayerID) || MPLobbyDataModel.isLocalPlayer(data.kickerPlayerID)) {
      return;
    }
    const dialogCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm || eAction == DialogBoxAction.Cancel || eAction == DialogBoxAction.Close) {
        Network.kickVotePlayer(data.kickPlayerID, eAction == DialogBoxAction.Confirm, data.kickReason);
      } else {
        console.error("model-mp-staging-new: onKickVoteStarted(): Invalid dialog action (" + eAction + ")");
      }
    };
    const kickPlayerConfig = Configuration.getPlayer(data.kickPlayerID);
    const kickPlayerName = Locale.compose(kickPlayerConfig.slotName);
    const kickerPlayerConfig = Configuration.getPlayer(data.kickerPlayerID);
    const kickerPlayerName = Locale.compose(kickerPlayerConfig.slotName);
    const dialogBoxID = DialogBoxManager.createDialog_ConfirmCancel({
      body: Locale.compose("LOC_KICK_VOTE_CHOICE_DIALOG", kickPlayerName, kickerPlayerName),
      title: "LOC_KICK_DIALOG_TITLE",
      callback: dialogCallback
    });
    this.addVoteDialogBox(data.kickPlayerID, dialogBoxID);
  }
  onMultiplayerHostMigrated(_data) {
    if (this.startGameRemainingTime <= 0 && MPLobbyDataModel.isLocalHostPlayer()) {
      Network.startGame();
    }
  }
  onKickVoteComplete(data) {
    if (data.kickResult == KickVoteResultType.KICKVOTERESULT_PENDING) {
      console.log("model-mp-staging-new: onKickVoteComplete(): Vote in progress, not everyone voted yet...");
      return;
    }
    let voteWasCancelled = false;
    switch (data.kickResult) {
      case KickVoteResultType.KICKVOTERESULT_NOT_ENOUGH_PLAYERS:
      case KickVoteResultType.KICKVOTERESULT_TARGET_INVALID:
      case KickVoteResultType.KICKVOTERESULT_TIME_ELAPSED:
        voteWasCancelled = true;
        break;
      case KickVoteResultType.KICKVOTERESULT_VOTE_PASSED:
      case KickVoteResultType.KICKVOTERESULT_VOTED_NO_KICK:
        break;
      //case KickVoteResultType.KICKVOTERESULT_PENDING is already handled
      default:
        console.error("model-mp-staging-new: onKickVoteComplete(): Unhandled result type: " + data.kickResult);
        break;
    }
    if (voteWasCancelled) {
      const dialogBoxID = this.voteDialogBoxIDPerKickPlayerID.get(data.kickPlayerID);
      if (!dialogBoxID) {
        console.error(
          "model-mp-staging-new: onKickVoteComplete(): No dialog box found for kick vote player ID: " + data.kickPlayerID
        );
      } else {
        DialogBoxManager.closeDialogBox(dialogBoxID);
      }
    }
    this.removeVoteDialogBox(data.kickPlayerID);
    this.update();
  }
  kickTimerExpired() {
    window.clearTimeout(this.kickTimerReference);
    this.kickVoteLockout = false;
  }
  pushDummyPlayersData() {
    const kickTooltip = Locale.compose("LOC_SLOT_ACTION_KICK_PLAYER");
    const muteTooltip = Locale.compose("LOC_SLOT_ACTION_MUTE");
    const unmuteTooltip = Locale.compose("LOC_SLOT_ACTION_UNMUTE");
    const hostPlayerId = 0;
    const isLocalHost = true;
    const isKickVote = true;
    this.updateReadyButtonData(hostPlayerId, "NOT_READY" /* NOT_READY */);
    const canLocalPlayerEverKick = isKickVote || isLocalHost;
    const gamertag1 = "Catpcha";
    this.playersData.push({
      playerID: hostPlayerId.toString(),
      isParticipant: true,
      isHost: true,
      isLocal: isLocalHost,
      statusIcon: "fs://game/core/mpicon_host.png",
      statusIconTooltip: Locale.compose("LOC_UI_MP_HOST"),
      isReady: false,
      isConnected: true,
      platformIcon: "fs://game/core/mp_console_pc.png",
      platformIconTooltip: Locale.compose("LOC_PLATFORM_ICON_GENERIC_CROSSPLAY"),
      leaderPortrait: "LEADER_AMINA",
      leaderName: "Amina",
      foundationLevel: 99,
      badgeURL: "fs://game/ba_default.png",
      backgroundURL: "fs://game/bn_lafayette.png",
      playerTitle: "",
      civName: "Aksum",
      gamertag: gamertag1,
      firstPartyName: gamertag1,
      twoKName: gamertag1,
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        0,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        0,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        0,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: true,
      isDistantHuman: !isLocalHost,
      canEverBeKicked: canLocalPlayerEverKick && !isLocalHost,
      // simplified to: canLocalPlayerEverKick AND isDistantHuman
      canBeKickedNow: canLocalPlayerEverKick && !isLocalHost,
      // idem
      kickTooltip,
      isKickVoteTarget: false,
      isMuted: false,
      muteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: true
    });
    const gamertag2 = "Civ_King45";
    this.playersData.push({
      playerID: "1",
      isParticipant: true,
      isHost: false,
      isLocal: !isLocalHost,
      statusIcon: !isLocalHost ? "fs://game/core/mpicon_localplayer.png" : "none",
      statusIconTooltip: !isLocalHost ? Locale.compose("LOC_UI_MP_LOCAL_PLAYER") : "",
      isReady: false,
      isConnected: true,
      platformIcon: "fs://game/mp_console_xbox.png",
      platformIconTooltip: Locale.compose("LOC_PLATFORM_ICON_GENERIC_CROSSPLAY"),
      leaderPortrait: "LEADER_CHARLEMAGNE",
      leaderName: "Charlemagne",
      foundationLevel: 99,
      badgeURL: "fs://game/ba_default.png",
      backgroundURL: "fs://game/bn_lafayette.png",
      playerTitle: "",
      civName: "RANDOM",
      gamertag: gamertag2,
      firstPartyName: gamertag2,
      twoKName: gamertag2,
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        1,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        1,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        1,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: true,
      isDistantHuman: isLocalHost,
      canEverBeKicked: canLocalPlayerEverKick && isLocalHost,
      canBeKickedNow: canLocalPlayerEverKick && isLocalHost,
      kickTooltip,
      isKickVoteTarget: false,
      isMuted: false,
      muteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: true
    });
    const gamertag3 = "CoffeeAnt";
    this.playersData.push({
      playerID: "2",
      isParticipant: true,
      isHost: false,
      isLocal: false,
      statusIcon: "none",
      statusIconTooltip: "",
      isReady: true,
      isConnected: true,
      platformIcon: "fs://game/mp_console_switch.png",
      platformIconTooltip: Locale.compose("LOC_PLATFORM_ICON_GENERIC_CROSSPLAY"),
      leaderPortrait: "LEADER_AUGUSTUS",
      leaderName: "Augustus",
      foundationLevel: 99,
      badgeURL: "fs://game/ba_default.png",
      backgroundURL: "fs://game/bn_lafayette.png",
      playerTitle: "",
      civName: "Khan",
      gamertag: gamertag3,
      firstPartyName: gamertag3,
      twoKName: gamertag3,
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        2,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        2,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        2,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: true,
      isDistantHuman: true,
      canEverBeKicked: canLocalPlayerEverKick,
      canBeKickedNow: false,
      // intentionally NOT equal to canEverBeKicked
      kickTooltip,
      isKickVoteTarget: false,
      isMuted: false,
      muteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: false
    });
    const gamertag4 = "OrionBird";
    this.playersData.push({
      playerID: "3",
      isParticipant: true,
      isHost: false,
      isLocal: false,
      statusIcon: "fs://game/core/mp_locked.png",
      statusIconTooltip: Locale.compose("LOC_UI_MP_LOCKED_PLAYER"),
      isReady: true,
      isConnected: true,
      platformIcon: "fs://game/mp_console_playstation.png",
      platformIconTooltip: Locale.compose("LOC_PLATFORM_ICON_GENERIC_CROSSPLAY"),
      leaderPortrait: "UNKNOWN_LEADER",
      leaderName: "RANDOM",
      foundationLevel: 99,
      badgeURL: "fs://game/ba_default.png",
      backgroundURL: "fs://game/bn_lafayette.png",
      playerTitle: "",
      civName: "RANDOM",
      gamertag: gamertag4,
      firstPartyName: gamertag4,
      twoKName: gamertag4,
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        3,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        3,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        3,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: true,
      isDistantHuman: true,
      canEverBeKicked: canLocalPlayerEverKick,
      canBeKickedNow: !isKickVote,
      // opposed to isKickVoteTarget
      kickTooltip,
      isKickVoteTarget: isKickVote,
      isMuted: true,
      muteTooltip: unmuteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: true
    });
    const gamertagRandom = "Random Leader";
    this.playersData.push({
      playerID: "4",
      isParticipant: true,
      isHost: false,
      isLocal: false,
      statusIcon: "none",
      statusIconTooltip: "",
      isReady: true,
      isConnected: true,
      platformIcon: "none",
      platformIconTooltip: "",
      leaderPortrait: "UNKNOWN_LEADER",
      leaderName: "RANDOM",
      foundationLevel: 99,
      badgeURL: "fs://game/ba_default.png",
      backgroundURL: "fs://game/bn_lafayette.png",
      playerTitle: "",
      civName: "RANDOM",
      gamertag: gamertagRandom,
      twoKName: gamertagRandom,
      firstPartyName: "",
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        4,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        4,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        4,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: false,
      isDistantHuman: false,
      canEverBeKicked: false,
      canBeKickedNow: false,
      kickTooltip,
      isKickVoteTarget: false,
      isMuted: false,
      muteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: false
    });
    const gamertagClose = "Closed";
    this.playersData.push({
      playerID: "5",
      isParticipant: false,
      isHost: false,
      isLocal: false,
      statusIcon: "none",
      statusIconTooltip: "",
      isReady: false,
      isConnected: true,
      platformIcon: "none",
      platformIconTooltip: "",
      leaderPortrait: "",
      leaderName: "",
      foundationLevel: -1,
      badgeURL: "",
      backgroundURL: "",
      playerTitle: "",
      civName: "RANDOM",
      gamertag: gamertagClose,
      twoKName: gamertagClose,
      firstPartyName: "",
      playerInfoDropdown: this.createSlotActionsDropdown(
        0,
        gamertag1,
        false,
        0 /* CONNECTED */
      ),
      civilizationDropdown: this.createPlayerParamDropdown(
        5,
        "civ_selector_0",
        "PLAYER_CIV" /* PLAYER_CIV */,
        "PLAYER_CIV" /* PLAYER_CIV */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_CIV_DESC"),
        this.PlayerCivilizationStringHandle,
        false,
        false,
        this.civIconURLGetter
      ),
      teamDropdown: this.createTeamParamDropdown(
        5,
        "team_selector_0",
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        "PLAYER_TEAM" /* PLAYER_TEAM */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_TEAM_DESC"),
        this.PlayerTeamStringHandle,
        false,
        false
      ),
      leaderDropdown: this.createPlayerParamDropdown(
        5,
        "leader_selector_0",
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        "PLAYER_LEADER" /* PLAYER_LEADER */,
        Locale.compose("LOC_UI_MP_LOBBY_DROPDOWN_LEADER_DESC"),
        this.PlayerLeaderStringHandle,
        false,
        true,
        this.leaderIconURLGetter
      ),
      isHuman: false,
      isDistantHuman: false,
      canEverBeKicked: false,
      canBeKickedNow: false,
      kickTooltip,
      isKickVoteTarget: false,
      isMuted: false,
      muteTooltip,
      mementos: [],
      samePlatformAsLocalPlayer: false
    });
    this.playersData.forEach((playerData) => {
      if (playerData.isLocal && playerData.playerInfoDropdown) playerData.playerInfoDropdown.itemList = [];
    });
  }
  onLobbyDropdown(event) {
    const dropdown = event.target;
    if (!(dropdown instanceof HTMLElement)) {
      return;
    }
    const dropdownTypeAttribute = dropdown.getAttribute("data-dropdown-type");
    if (dropdownTypeAttribute) {
      const dropdownType = dropdownTypeAttribute;
      const dropdownCallback = this.dropdownCallbacks.get(dropdownType);
      if (dropdownCallback) {
        dropdownCallback(event);
      } else {
        console.error(
          `model-mp-staging-new: onLobbyDropdown(): Failed to find callback function for callback name ${dropdownType}`
        );
      }
    }
  }
  onTeamDropdown(event) {
    const dropdown = event.target;
    if (!(dropdown instanceof HTMLElement)) {
      return;
    }
    const { teamID } = event.detail.selectedItem;
    const playerIDStr = dropdown.getAttribute("data-player-id");
    if (playerIDStr) {
      const playerID = parseInt(playerIDStr);
      const playerConfig = Configuration.editPlayer(playerID);
      playerConfig?.setTeam(teamID);
    }
  }
  onPlayerParamDropdown(event) {
    const dropdown = event.target;
    if (!(dropdown instanceof HTMLElement)) {
      return;
    }
    const { paramID } = event.detail.selectedItem;
    const playerIDStr = dropdown.getAttribute("data-player-id");
    const playerParam = dropdown.getAttribute("data-player-param");
    if (paramID && playerIDStr && playerParam) {
      const playerID = parseInt(playerIDStr);
      if (playerParam == "PlayerLeader" && LiveEventManager.restrictToPreferredCivs()) {
        const civLeaderPairingData = Database.query("config", "select * from LeaderCivParings") ?? [];
        const civFixed = civLeaderPairingData.find((row) => row.LeaderType == paramID);
        const civID = civFixed?.CivilizationType ?? "";
        GameSetup.setPlayerParameterValue(playerID, "PlayerCivilization", civID);
      }
      GameSetup.setPlayerParameterValue(playerID, playerParam, paramID);
    }
  }
  onSlotActionDropdown(event) {
    const dropdown = event.target;
    if (!(dropdown instanceof HTMLElement)) {
      return;
    }
    const { slotActionType } = event.detail.selectedItem;
    const playerIDStr = dropdown.getAttribute("data-player-id");
    if (playerIDStr) {
      const playerID = parseInt(playerIDStr);
      switch (slotActionType) {
        case "SLOT_ACTION_TYPE_CLOSE" /* CLOSE */:
        case "SLOT_ACTION_TYPE_OPEN" /* OPEN */:
        case "SLOT_ACTION_TYPE_AI" /* AI */:
          {
            const slotActionData = this.slotActionsData.get(slotActionType);
            if (slotActionData && slotActionData.slotStatus != void 0) {
              const playerConfig = Configuration.editPlayer(playerID);
              if (playerConfig) {
                playerConfig.setSlotStatus(slotActionData.slotStatus);
              } else {
                console.warn(
                  "model-mp-staging-new: onSlotActionDropdown(): No playerConfig found for this playerID: " + playerID
                );
              }
            } else {
              console.warn(
                "model-mp-staging-new: onSlotActionDropdown(): No valid slotActionData found for this slotActionType: " + slotActionType
              );
            }
          }
          break;
        case "SLOT_ACTION_TYPE_SWAP" /* SWAP */:
          Network.requestSlotSwap(playerID);
          break;
        case "SLOT_ACTION_TYPE_VIEW" /* VIEW */:
          const nativeId = Online.Social.getPlayerFriendID_Network(playerID);
          const t2gpId = Online.Social.getPlayerFriendID_T2GP(playerID);
          Online.Social.viewProfile(nativeId, t2gpId);
          this.update();
          break;
      }
    }
  }
  canChangeSlotStatus(targetPlayerID, slotActionData) {
    if (slotActionData.slotStatus == void 0) {
      return false;
    }
    if (!MPLobbyDataModel.isLocalHostPlayer()) {
      return false;
    }
    if (!MPLobbyDataModel.isNewGame && slotActionData.actionType != "SLOT_ACTION_TYPE_SWAP" /* SWAP */) {
      return false;
    }
    const newStatus = slotActionData.slotStatus;
    const targetPlayerConfig = Configuration.getPlayer(targetPlayerID);
    if (!targetPlayerConfig.canBeHuman && slotActionData.actionType != "SLOT_ACTION_TYPE_CLOSE" /* CLOSE */ && slotActionData.actionType != "SLOT_ACTION_TYPE_AI" /* AI */) {
      return false;
    }
    if (targetPlayerConfig.isParticipant && targetPlayerConfig.canBeHuman && (slotActionData.actionType == "SLOT_ACTION_TYPE_CLOSE" /* CLOSE */ || slotActionData.actionType == "SLOT_ACTION_TYPE_OPEN" /* OPEN */)) {
      const mapConfig = Configuration.getMap();
      if (mapConfig) {
        if (this.participatingCount <= mapConfig.minMajorPlayers) {
          return false;
        }
      }
    }
    return !targetPlayerConfig.isHuman && // can only change a slot status where there is no human player yet
    targetPlayerConfig.slotStatus != newStatus;
  }
  canSwap(targetPlayerID) {
    if (MPLobbyDataModel.isLocalPlayer(targetPlayerID)) {
      return false;
    }
    const targetPlayerConfig = Configuration.getPlayer(targetPlayerID);
    return !targetPlayerConfig.isLocked && targetPlayerConfig.canBeHuman && targetPlayerConfig.slotStatus != SlotStatus.SS_CLOSED;
  }
}
const instance = new MPLobbyDataModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(instance);
  };
  engine.createJSModel("g_MPLobbyModel", instance);
  instance.updateCallback = updateModel;
});
const observerFinalizationRegistry = new FinalizationRegistry((_handle) => {
  MPLobbyDataModelProxy.instanceRefCount--;
  if (MPLobbyDataModelProxy.instanceRefCount == 0) {
    instance.shutdown();
  }
});
class MPLobbyDataModelProxy {
  static instanceRefCount = 0;
  static instanceRefHandle = 0;
  handle = 0;
  disconnect() {
    if (this.handle != 0) {
      if (!observerFinalizationRegistry.unregister(this)) {
        console.error(
          "There was an error unregistering the MPLobbyDataModelProxy from the finalization registry!"
        );
      }
      this.handle = 0;
      MPLobbyDataModelProxy.instanceRefCount--;
      if (MPLobbyDataModelProxy.instanceRefCount == 0) {
        instance.shutdown();
      }
    }
  }
  connect() {
    if (this.handle == 0) {
      this.handle = ++MPLobbyDataModelProxy.instanceRefHandle;
      observerFinalizationRegistry.register(this, this.handle, this);
      if (MPLobbyDataModelProxy.instanceRefCount == 0) {
        instance.startup();
      }
      MPLobbyDataModelProxy.instanceRefCount++;
    }
  }
  access() {
    if (this.handle != 0) {
      return instance;
    } else {
      throw new Error("Attempted to access model prior to observing it.");
    }
  }
}

export { LobbyUpdateEventName as L, MPLobbyDataModelProxy as M, SMALL_SCREEN_MODE_MAX_HEIGHT as S, SMALL_SCREEN_MODE_MAX_WIDTH as a, instance as i };
//# sourceMappingURL=model-mp-staging-new.chunk.js.map
