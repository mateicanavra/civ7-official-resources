import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { O as OptionsBase, A as AdvancedOptionsParameter, a as AdvancedOptionsBase, s as styles } from './advanced-options-panel.chunk.js';
import { G as GetCivilizationData } from './age-civ-select-model.chunk.js';
import { CreateGameModel } from './create-game-model.js';
import { g as getLeaderData } from './leader-select-model.chunk.js';
import { L as LeaderSelectModelManager } from '../leader-select/leader-select-model-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../utilities/utilities-dom.chunk.js';
import './game-creation-panel-base.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../live-event-logic/live-event-logic.chunk.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-data.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-metaprogression.chunk.js';

let cachedDatabaseChanges = -1;
let cachedCivData = [];
let cachedLeaderData = [];
const civilizationTooltips = /* @__PURE__ */ new Map();
const leaderTooltips = /* @__PURE__ */ new Map();
function checkDatabaseCache() {
  const changes = Database.changes("config");
  if (changes != cachedDatabaseChanges) {
    cachedCivData = GetCivilizationData(false);
    cachedLeaderData = getLeaderData(false);
    civilizationTooltips.clear();
    leaderTooltips.clear();
    cachedDatabaseChanges = changes;
  }
}
function getCachedCivData() {
  checkDatabaseCache();
  return cachedCivData;
}
function getCachedLeaderData() {
  checkDatabaseCache();
  return cachedLeaderData;
}
function GetCivilizationTooltip(civType) {
  checkDatabaseCache();
  let tooltip = civilizationTooltips.get(civType);
  if (tooltip == null) {
    const civilization = cachedCivData.find((d) => d.civID == civType);
    if (civilization) {
      const useExperimentalStyle = false;
      if (!useExperimentalStyle) {
        tooltip = `[STYLE:text-secondary][STYLE:font-title-lg]${Locale.compose(civilization.name)}[/S][/S][N]
				${civilization.tags ? `[N][B]${Locale.compose(civilization.tags.join(", "))}[/B]` : ""}
				${civilization.abilityText ? `[N]${Locale.compose(civilization.abilityText)}` : ""}
				${civilization.bonuses ? `[N][STYLE:text-secondary][STYLE:font-title-base]${Locale.compose("LOC_CREATE_CIV_UNIQUE_BONUSES_SUBTITLE")}[/S][/S]
					[N]${civilization.bonuses.map((bonus) => `[B]${Locale.compose(bonus.title)}[/B] ${Locale.compose(bonus.description)}`).join("[N]")}` : ""}`;
      } else {
        tooltip = `[STYLE:text-secondary][STYLE:font-title-lg]${Locale.compose(civilization.name)}[/S][/S][N]
				${civilization.tags ? `[N][B]${Locale.compose(civilization.tags.join(", "))}[/B]` : ""}
				${civilization.abilityText ? `[N]${Locale.compose(civilization.abilityText)}` : ""}
				${civilization.bonuses ? `[N][STYLE:text-secondary][STYLE:font-title-base]${Locale.compose("LOC_CREATE_CIV_UNIQUE_BONUSES_SUBTITLE")}[/S][/S]
					[BLIST]${civilization.bonuses.map((bonus) => `[LI] ${bonus.title}`).join("")}[/BLIST]` : ""}`;
      }
      civilizationTooltips.set(civilization.civID, tooltip);
    }
  }
  return tooltip;
}
function GetLeaderTooltip(leaderType) {
  checkDatabaseCache();
  const tooltip = leaderTooltips.get(leaderType);
  if (tooltip == null) {
    const leader = cachedLeaderData.find((l) => l.leaderID == leaderType);
    if (leader) {
      const tooltip2 = `[STYLE:text-secondary][STYLE:font-title-lg]${Locale.compose(leader.name)}[/S][/S]
				${leader.tags ? `[N]${leader.tags.map((tag) => `[B]${Locale.compose(tag)}[/B]`).join(", ")}` : ""}
				${leader.abilityText ? `[N]${Locale.compose(leader.abilityText)}` : ""}`;
      leaderTooltips.set(leader.leaderID, tooltip2);
    }
  }
  return tooltip;
}
class PlayerLeaderOrCivOption extends OptionsBase {
  playerID;
  parameterID = GAMESETUP_INVALID_STRING;
  possibleValues = [];
  root = null;
  create(setupParam) {
    this.parameterID = setupParam.ID;
    this.playerID = setupParam.playerID;
    this.rebuildPossibleValues(setupParam);
    const component = document.createElement("icon-dropdown");
    component.classList.add("advanced-options__player-select", "mx-2", "w-1\\/2");
    component.setAttribute("show-label-on-selected-item", "true");
    component.setAttribute("show-icon-on-list-item", "true");
    component.whenComponentCreated((dropdown) => dropdown.updateDropdownItems(this.possibleValues));
    component.setAttribute(
      "selected-item-index",
      this.possibleValues.findIndex((l) => l.id == setupParam.value.value).toString()
    );
    component.addEventListener("dropdown-selection-change", (event) => {
      this.handleSelection(event);
    });
    this.root = component;
    return component;
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      const shouldDisable = setupParam.readOnly || setupParam.domain.possibleValues?.length == 1;
      if (shouldDisable) {
        this.root?.setAttribute("disabled", "true");
      } else {
        this.root?.removeAttribute("disabled");
      }
    }
    if (change.possibleValuesChanged) {
      this.rebuildPossibleValues(setupParam);
      this.root?.whenComponentCreated((dropdown) => {
        dropdown.updateDropdownItems(this.possibleValues);
        let selectedIndex = this.possibleValues.findIndex((l) => l.id == setupParam.value.value);
        if (selectedIndex == -1) {
          console.error(
            `Selected Value - ${setupParam.value.value} not found in list of possible values for parameter - ${GameSetup.resolveString(setupParam.ID)}.`
          );
          selectedIndex = 0;
        }
        dropdown.Root.setAttribute("selected-item-index", selectedIndex.toString());
      });
    } else if (change.valueChanged) {
      let selectedIndex = this.possibleValues.findIndex((l) => l.id == setupParam.value.value);
      if (selectedIndex == -1) {
        console.error(
          `Selected Value - ${setupParam.value.value} not found in list of possible values for parameter - ${GameSetup.resolveString(setupParam.ID)}.`
        );
        selectedIndex = 0;
      }
      this.root?.setAttribute("selected-item-index", selectedIndex.toString());
    }
  }
  handleSelection(event) {
    const pv = this.possibleValues[event.detail.selectedIndex];
    if (this.playerID != null && pv) {
      GameSetup.setPlayerParameterValue(this.playerID, this.parameterID, pv.id);
    }
  }
  rebuildPossibleValues(setupParam) {
    const strPlayerLeader = GameSetup.makeString("PlayerLeader");
    const strPlayerCivilization = GameSetup.makeString("PlayerCivilization");
    this.possibleValues = [];
    if (setupParam.domain.possibleValues) {
      for (const pv of setupParam.domain.possibleValues) {
        let iconURL = "";
        if (pv.icon != GAMESETUP_INVALID_STRING) {
          const icon = GameSetup.resolveString(pv.icon);
          if (icon) {
            iconURL = UI.getIconURL(icon);
          }
        }
        if (!iconURL) {
          iconURL = UI.getIconURL(pv.value);
        }
        if (!iconURL && setupParam.ID == strPlayerCivilization && pv.icon != GAMESETUP_INVALID_STRING) {
          const s = GameSetup.resolveString(pv.icon);
          if (s) {
            iconURL = s;
          }
        }
        let tooltip = "";
        if (setupParam.ID == strPlayerCivilization) {
          tooltip = GetCivilizationTooltip(pv.value) ?? "";
        } else if (setupParam.ID == strPlayerLeader) {
          tooltip = GetLeaderTooltip(pv.value) ?? "";
        }
        this.possibleValues.push({
          id: pv.value,
          label: GameSetup.resolveString(pv.name) ?? pv.value,
          iconURL,
          tooltip
        });
      }
    }
  }
}
class SPAdvancedOptionsParameter extends AdvancedOptionsParameter {
  constructor(setupParameter) {
    super(setupParameter);
    const strPlayerLeader = GameSetup.makeString("PlayerLeader");
    const strPlayerCivilization = GameSetup.makeString("PlayerCivilization");
    if (setupParameter.ID == strPlayerCivilization) {
      this.option = new PlayerLeaderOrCivOption();
      this.rootElement = this.option.create(setupParameter);
    } else if (setupParameter.ID == strPlayerLeader) {
      this.option = new PlayerLeaderOrCivOption();
      this.rootElement = this.option.create(setupParameter);
    }
  }
}
class AdvancedOptionsPanel extends AdvancedOptionsBase {
  gameSetupRevision = 0;
  addPlayerListener = this.addPlayer.bind(this);
  playerConfigContainer = document.createElement("fxs-spatial-slot");
  playerSetupPanel = document.createElement("fxs-vslot");
  leaderOptions = [];
  civilizationOptions = [];
  groupNamesConfigChanges = -1;
  activePlayerParameters = /* @__PURE__ */ new Map();
  constructor(root) {
    super(root);
    this.slotIDs = ["advanced-setup__game", "advanced-setup__legacy"];
    if (!UI.isInGame()) {
      this.slotIDs.push("advanced-setup__player");
    }
    this.saveConfigAttributes = {
      "menu-type": "save_config",
      "server-type": ServerType.SERVER_TYPE_NONE,
      "save-type": SaveTypes.SINGLE_PLAYER
    };
    this.loadConfigAttributes = {
      "menu-type": "load_config",
      "server-type": ServerType.SERVER_TYPE_NONE,
      "save-type": SaveTypes.SINGLE_PLAYER
    };
    this.headerText = "LOC_ADVANCED_OPTIONS_ADVANCED";
    this.navControlButtonInfo = [
      {
        category: "LOC_ADVANCED_OPTIONS_GAME_SETTINGS",
        isActive: true,
        eventHandler: this.showGameSetupPanel.bind(this)
      },
      {
        category: "LOC_ADVANCED_OPTIONS_LEGACY_PATH_SETTINGS",
        isActive: false,
        eventHandler: this.showLegacyPathSetupPanel.bind(this)
      }
    ];
    if (!UI.isInGame()) {
      this.navControlButtonInfo.push({
        category: "LOC_ADVANCED_OPTIONS_PLAYER_SETTINGS",
        isActive: false,
        eventHandler: this.showPlayerSetupPanel.bind(this)
      });
    }
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-advanced-options");
  }
  onInitialize() {
    super.onInitialize();
    this.createPlayerSetupPanel();
    this.frame.setAttribute("override-styling", "advanced-options_sp-frame flex-auto relative pt-14 px-10 pb-4");
  }
  onUpdate() {
    const strPlayerLeader = GameSetup.makeString("PlayerLeader");
    const strPlayerCivilization = GameSetup.makeString("PlayerCivilization");
    const strAge = GameSetup.makeString("Age");
    const strMapSize = GameSetup.makeString("MapSize");
    if (GameSetup.currentRevision != this.gameSetupRevision) {
      const configChanges = Database.changes("config");
      if (this.groupNamesConfigChanges != configChanges) {
        this.groupNames.clear();
        const q = Database.query("config", "SELECT GroupID, Name from ParameterGroups");
        if (q) {
          for (const r of q) {
            if (typeof r.GroupID == "string" && typeof r.Name == "string") {
              this.groupNames.set(r.GroupID, r.Name);
            }
          }
        }
        this.groupNamesConfigChanges = configChanges;
      }
      let shouldRefreshCachedData = false;
      let shouldRefreshGameOptions = false;
      let shouldRefreshPlayerOptions = false;
      const changes = GameSetup.getParameterChanges(this.gameSetupRevision);
      if (changes) {
        for (const c of changes) {
          if (c.created || c.destroyed) {
            if (c.playerID !== null && c.playerID !== void 0) {
              shouldRefreshCachedData = true;
              shouldRefreshPlayerOptions = true;
              break;
            } else {
              shouldRefreshGameOptions = true;
            }
          }
          if (c.parameterID == strMapSize) {
            shouldRefreshPlayerOptions = true;
          }
        }
      } else {
        shouldRefreshCachedData = true;
        shouldRefreshGameOptions = true;
        shouldRefreshPlayerOptions = true;
      }
      if (shouldRefreshGameOptions) {
        const lastChangedParameter = FocusManager.getFocus().id;
        this.refreshGameOptions();
        if (lastChangedParameter != "") {
          const newFocus = this.Root.querySelector(`#${lastChangedParameter}`);
          if (newFocus) {
            FocusManager.setFocus(newFocus);
          }
        } else {
          this.updateFocus();
        }
      } else {
        if (changes) {
          for (const c of changes) {
            if (c.playerID == null) {
              const options = this.activeGameParameters.get(c.parameterID);
              if (options) {
                for (const option of options) {
                  option.processChange(c);
                }
              }
            }
          }
        }
      }
      if (shouldRefreshPlayerOptions) {
        this.refreshPlayerOptions();
      } else {
        if (changes) {
          for (const c of changes) {
            if (c.playerID != null) {
              const playerParameters = this.activePlayerParameters.get(c.playerID);
              if (playerParameters) {
                if (c.playerID == GameContext.localPlayerID && (c.parameterID == strPlayerCivilization || c.parameterID == strPlayerLeader)) {
                  if (c.detailsChanged || c.possibleValuesChanged) {
                    shouldRefreshCachedData = true;
                  }
                }
                const options = playerParameters.get(c.parameterID);
                if (options) {
                  for (const option of options) {
                    option.processChange(c);
                  }
                }
              }
            }
          }
        }
      }
      let shouldRefreshAgeSelection = false;
      let shouldRefreshLeaderSelection = false;
      let shouldRefreshCivilizationSelection = false;
      if (changes) {
        const localPlayerId = GameContext.localPlayerID;
        for (const c of changes) {
          if (c.playerID != null) {
            if (c.playerID == localPlayerId) {
              if (c.parameterID == strPlayerLeader) {
                shouldRefreshLeaderSelection = true;
              } else if (c.parameterID == strPlayerCivilization) {
                shouldRefreshCivilizationSelection = true;
              }
            }
          } else if (c.parameterID == strAge) {
            shouldRefreshAgeSelection = true;
          }
        }
      } else {
        shouldRefreshAgeSelection = true;
        shouldRefreshLeaderSelection = true;
        shouldRefreshCivilizationSelection = true;
      }
      if (shouldRefreshCachedData) {
        cachedDatabaseChanges = -1;
      }
      if (shouldRefreshAgeSelection) {
        const ageParam = GameSetup.findGameParameter(strAge);
        if (ageParam && ageParam.value.value) {
          const value = ageParam.value;
          const ageType = value.value;
          const name = GameSetup.resolveString(ageParam.value.name);
          const domain = GameSetup.resolveString(ageParam.value.originDomain);
          if (ageType && name && domain) {
            const ageData = {
              type: ageType,
              name,
              domain
            };
            CreateGameModel.selectedAge = ageData;
          }
        }
      }
      if (!UI.isInGame()) {
        if (shouldRefreshLeaderSelection) {
          const playerLeaderParam = GameSetup.findPlayerParameter(GameContext.localPlayerID, strPlayerLeader);
          if (playerLeaderParam && playerLeaderParam.value.value) {
            const leaderId = playerLeaderParam.value.value;
            LeaderSelectModelManager.showLeaderModels(leaderId);
            const leaderData = getCachedLeaderData();
            const selectedLeader = leaderData.find((ld) => ld.leaderID == leaderId);
            if (selectedLeader) {
              CreateGameModel.selectedLeader = selectedLeader;
            } else {
              CreateGameModel.selectedLeader = leaderData[0];
            }
          }
        }
        if (shouldRefreshCivilizationSelection) {
          const playerCivParam = GameSetup.findPlayerParameter(
            GameContext.localPlayerID,
            strPlayerCivilization
          );
          if (playerCivParam && playerCivParam.value.value) {
            const civId = playerCivParam.value.value;
            const civData = getCachedCivData();
            const selectedCiv = civData.find((ld) => ld.civID == civId);
            if (selectedCiv) {
              CreateGameModel.selectedCiv = selectedCiv;
            } else {
              CreateGameModel.selectedCiv = civData[0];
            }
          }
        }
      }
      this.gameSetupRevision = GameSetup.currentRevision;
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    if (!UI.isInGame()) {
      NavTray.addOrUpdateShellAction1(
        CreateGameModel.nextActionStartsGame ? "LOC_UI_SETUP_START_GAME" : "LOC_GENERIC_CONTINUE"
      );
    }
  }
  onConfirmButtonPressed() {
    CreateGameModel.startGame();
  }
  onResetConfirmed() {
    GameSetup.resetSavedCreateGameSettings();
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    waitForLayout(() => {
      this.refreshGameOptions();
      this.refreshPlayerOptions();
    });
  }
  removePlayer(playerId) {
    const playerConfig = Configuration.editPlayer(playerId);
    if (playerConfig) {
      playerConfig.setSlotStatus(SlotStatus.SS_CLOSED);
      this.refreshPlayerOptions();
      waitForLayout(() => this.updateFocus());
    }
  }
  addPlayer() {
    const maxPlayers = Configuration.getMap().maxMajorPlayers;
    let unusedId = -1;
    for (let playerId = 0; playerId < maxPlayers; ++playerId) {
      const playerConfig = Configuration.getPlayer(playerId);
      if (playerConfig.slotStatus === SlotStatus.SS_CLOSED) {
        unusedId = playerId;
        break;
      }
    }
    if (unusedId !== -1) {
      const newPlayer = Configuration.editPlayer(unusedId);
      if (newPlayer) {
        newPlayer.setSlotStatus(SlotStatus.SS_COMPUTER);
        newPlayer.setAsMajorCiv();
      }
      this.refreshPlayerOptions();
    }
    waitForLayout(() => this.updateFocus());
  }
  showPlayerSetupPanel() {
    this.goToNewPanel(this.playerSetupPanel);
  }
  createBottomNav() {
    const bottomNav = super.createBottomNav();
    this.confirmButton.setAttribute("caption", "LOC_UI_SETUP_START_GAME");
    return bottomNav;
  }
  onEngineInput(event) {
    super.onEngineInput(event);
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (event.isCancelInput()) {
      if (UI.isInGame()) {
        event.stopPropagation();
        event.preventDefault();
        this.close();
      }
      CreateGameModel.showPreviousPanel();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  generateLeaderInfo() {
    this.leaderOptions.length = 0;
    const leaderData = getCachedLeaderData();
    for (const leader of leaderData) {
      if (!leader.isLocked && leader.isOwned) {
        const tooltip = GetLeaderTooltip(leader.leaderID);
        this.leaderOptions.push({
          id: leader.leaderID,
          label: leader.name,
          iconURL: UI.getIconURL(leader.icon),
          tooltip
        });
      }
    }
  }
  generateCivInfo() {
    this.civilizationOptions.length = 0;
    const civData = getCachedCivData();
    for (const civilization of civData) {
      if (!civilization.isLocked && civilization.isOwned) {
        const tooltip = GetCivilizationTooltip(civilization.civID);
        this.civilizationOptions.push({
          id: civilization.civID,
          label: civilization.name,
          iconURL: civilization.icon,
          tooltip
        });
      }
    }
  }
  refreshPlayerOptions() {
    this.generateCivInfo();
    while (this.playerConfigContainer.hasChildNodes()) {
      this.playerConfigContainer.removeChild(this.playerConfigContainer.childNodes[0]);
    }
    const playerSettingsSubheader = document.createElement("div");
    playerSettingsSubheader.setAttribute("data-l10n-id", "LOC_ADVANCED_OPTIONS_PLAYER_SETTINGS_SUBHEADER");
    playerSettingsSubheader.classList.add(
      "font-title",
      "my-1",
      "uppercase",
      "tracking-150",
      "self-center",
      "pointer-events-auto"
    );
    playerSettingsSubheader.setAttribute("role", "heading");
    this.playerConfigContainer.appendChild(playerSettingsSubheader);
    const columnHeaders = document.createElement("div");
    columnHeaders.classList.add("flex", "mt-3", "ml-18", "mr-10");
    this.playerConfigContainer.appendChild(columnHeaders);
    const leftHeader = document.createElement("div");
    leftHeader.setAttribute("data-l10n-id", "LOC_GENERIC_LEADER");
    leftHeader.classList.add("font-title", "uppercase", "tracking-150", "w-1\\/2", "pointer-events-auto");
    leftHeader.setAttribute("role", "columnheader");
    columnHeaders.appendChild(leftHeader);
    const rightHeader = document.createElement("div");
    rightHeader.setAttribute("data-l10n-id", "LOC_GENERIC_CIVILIZATION");
    rightHeader.classList.add("font-title", "uppercase", "tracking-150", "w-1\\/2", "pointer-events-auto");
    rightHeader.setAttribute("role", "columnheader");
    columnHeaders.appendChild(rightHeader);
    const maxPlayers = Configuration.getMap().maxMajorPlayers;
    const activePlayers = [];
    for (let playerId = 0; playerId < maxPlayers; ++playerId) {
      const playerConfig = Configuration.getPlayer(playerId);
      if (playerConfig.slotStatus !== SlotStatus.SS_CLOSED) {
        activePlayers.push(playerConfig);
      }
    }
    for (const [_index, playerConfig] of activePlayers.entries()) {
      const playerOptions = this.createPlayerOptions(playerConfig, activePlayers.length > 2, _index);
      this.playerConfigContainer.appendChild(playerOptions);
    }
    const addPlayerButton = document.createElement("fxs-chooser-item");
    addPlayerButton.setAttribute("disabled", (activePlayers.length == maxPlayers).toString());
    addPlayerButton.classList.add("my-4", "w-full", "self-center");
    addPlayerButton.addEventListener("action-activate", this.addPlayerListener);
    this.playerConfigContainer.appendChild(addPlayerButton);
    const addPlayerButtonContent = document.createElement("div");
    addPlayerButtonContent.classList.add("size-full", "flex", "items-center");
    addPlayerButton.appendChild(addPlayerButtonContent);
    const addPlayerButtonImage = document.createElement("div");
    addPlayerButtonImage.classList.add(
      "advanced-options_add-player-plus",
      "relative",
      "bg-no-repeat",
      "bg-contain",
      "size-24",
      "m-3"
    );
    addPlayerButtonContent.appendChild(addPlayerButtonImage);
    const addPlayerButtonText = document.createElement("div");
    addPlayerButtonText.setAttribute("data-l10n-id", "LOC_ADVANCED_OPTIONS_ADD_PLAYER");
    addPlayerButtonText.classList.add("self-center", "relative");
    addPlayerButtonContent.appendChild(addPlayerButtonText);
  }
  createPlayerOptions(playerConfig, includeDeleteButton, playerIndex) {
    const playerOptions = document.createElement("div");
    playerOptions.setAttribute("ignore-prior-focus", "true");
    playerOptions.classList.add(
      "items-center",
      "my-1",
      "py-2",
      "bg-primary-5",
      "flex",
      "relative",
      "pointer-events-none",
      "flex-nowrap"
    );
    const playerId = document.createElement("div");
    playerId.innerHTML = Locale.toNumber(playerIndex + 1);
    playerId.classList.add("w-12", "m-2", "text-center", "text-base", "font-title");
    playerOptions.appendChild(playerId);
    const selections = document.createElement("div");
    selections.classList.add("flex", "flex-row", "flex-auto");
    playerOptions.appendChild(selections);
    const playerLeaderParameter = GameSetup.findPlayerParameter(playerConfig.id, "PlayerLeader");
    if (playerLeaderParameter) {
      const option = new SPAdvancedOptionsParameter(playerLeaderParameter);
      let activeParameters = this.activePlayerParameters.get(playerConfig.id);
      if (activeParameters == null) {
        activeParameters = /* @__PURE__ */ new Map();
        this.activePlayerParameters.set(playerConfig.id, activeParameters);
      }
      const activeParameterOptions = activeParameters.get(playerLeaderParameter.ID);
      if (activeParameterOptions) {
        activeParameterOptions.push(option);
      } else {
        activeParameters.set(playerLeaderParameter.ID, [option]);
      }
      selections.appendChild(option.render());
    }
    const playerCivParameter = GameSetup.findPlayerParameter(playerConfig.id, "PlayerCivilization");
    if (playerCivParameter) {
      const option = new SPAdvancedOptionsParameter(playerCivParameter);
      let activeParameters = this.activePlayerParameters.get(playerConfig.id);
      if (activeParameters == null) {
        activeParameters = /* @__PURE__ */ new Map();
        this.activePlayerParameters.set(playerConfig.id, activeParameters);
      }
      const activeParameterOptions = activeParameters.get(playerCivParameter.ID);
      if (activeParameterOptions) {
        activeParameterOptions.push(option);
      } else {
        activeParameters.set(playerCivParameter.ID, [option]);
      }
      selections.appendChild(option.render());
    }
    const deleteIcon = document.createElement("fxs-activatable");
    deleteIcon.setAttribute("tabindex", "-1");
    deleteIcon.classList.add("close-button__bg", "group", "relative", "m-2", "w-8", "h-8");
    deleteIcon.classList.toggle("invisible", playerConfig.id === GameContext.localPlayerID || !includeDeleteButton);
    deleteIcon.addEventListener("action-activate", () => this.removePlayer(playerConfig.id));
    playerOptions.appendChild(deleteIcon);
    const border = document.createElement("div");
    border.classList.add(
      "absolute",
      "inset-0\\.5",
      "img-dropdown-box-focus",
      "opacity-0",
      "transition-opacity",
      "group-hover\\:opacity-100",
      "group-focus\\:opacity-100"
    );
    deleteIcon.appendChild(border);
    return playerOptions;
  }
  createPlayerSetupPanel() {
    this.playerSetupPanel.classList.add("player-setup", "flex", "flex-col", "items-center");
    this.playerSetupPanel.id = this.slotIDs[2];
    this.playerConfigContainer.classList.add("mx-6");
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.playerSetupPanel.appendChild(scrollableContent);
    scrollableContent.appendChild(this.playerConfigContainer);
    this.generateLeaderInfo();
    this.refreshPlayerOptions();
    this.setupSlotGroup.appendChild(this.playerSetupPanel);
  }
  getOptionFromParam(param) {
    return new SPAdvancedOptionsParameter(param);
  }
}
Controls.define("advanced-options-panel", {
  createInstance: AdvancedOptionsPanel,
  description: "Displays advanced game options and player setup",
  styles: [styles],
  images: [
    "blp:shell_advanced-options_subheader",
    "blp:hud_unit-panel_divider-center",
    "blp:set_save_config",
    "blp:set_save_config-focus",
    "blp:set_load_config",
    "blp:set_load_config-focus"
  ],
  classNames: ["fullscreen", "flex", "justify-center"],
  tabIndex: -1
});

export { PlayerLeaderOrCivOption };
//# sourceMappingURL=advanced-options-panel.js.map
