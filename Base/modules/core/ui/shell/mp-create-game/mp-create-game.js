import ContextManager from '../../context-manager/context-manager.js';
import { SendCampaignSetupTelemetryEvent } from '../../events/shell-events.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import { AnchorType } from '../../panel-support.js';
import { AdvancedOptionsBase } from '../create-panels/advanced-options-base.js';
import { CreateGameModel } from '../create-panels/create-game-model.js';
import MultiplayerShellManager from '../mp-shell-logic/mp-shell-logic.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { serverTypeToGameModeType } from '../../utilities/utilities-network-constants.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import styles from '../create-panels/advanced-options-panel.scss.js';

class PanelMPCreateGame extends AdvancedOptionsBase {
  static ADVANCED_PANEL_ID = "advanced-setup-mp__advanced";
  static ADDONS_PANEL_ID = "advanced-setup-mp__add-ons";
  gameSetupRevision = 0;
  groupNamesConfigChanges = -1;
  enteredAdditionalContent = false;
  createGameConfirmed = false;
  // Have we confirmed that we want to create a game?
  mpAdvancedSetupPanel = document.createElement("fxs-vslot");
  addOnsSetupPanel = document.createElement("fxs-vslot");
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
    this.enableOpenSound = true;
    this.Root.setAttribute("data-audio-group-ref", "multiplayer-create-game");
    this.slotIDs = [
      AdvancedOptionsBase.GAME_PANEL_ID,
      // Removing for 1.4.0 - PTR 1 with legacy path updates.
      //AdvancedOptionsBase.LEGACY_PATHS_PANEL_ID,
      PanelMPCreateGame.ADVANCED_PANEL_ID
      //"PanelMPCreateGame.ADDONS_PANEL_ID" is added dynamically
    ];
    this.saveConfigAttributes = {
      "menu-type": "save_config",
      "server-type": MultiplayerShellManager.serverType,
      "save-type": SaveTypes.NETWORK_MULTIPLAYER
    };
    this.loadConfigAttributes = {
      "menu-type": "load_config",
      "server-type": MultiplayerShellManager.serverType,
      "save-type": SaveTypes.NETWORK_MULTIPLAYER
    };
    this.headerText = "LOC_UI_MP_BROWSER_CREATE_GAME";
    this.navControlButtonInfo = [
      {
        category: "LOC_ADVANCED_OPTIONS_GAME_SETTINGS",
        isActive: true,
        eventHandler: this.showGameSetupPanel.bind(this)
      },
      // Removing for 1.4.0 - PTR 1 with legacy path updates.
      // TODO: If reimplemented, be sure to adjust the panel id in createAdvancedPanel() and createAddOnsPanel()
      /*{
      	category: "LOC_ADVANCED_OPTIONS_LEGACY_PATH_SETTINGS",
      	isActive: false,
      	eventHandler: this.showLegacyPathSetupPanel.bind(this),
      },*/
      {
        category: "LOC_GROUPID_ADVANCEDOPTIONS",
        isActive: false,
        eventHandler: this.showAdvancedPanel.bind(this)
      }
    ];
    if (UI.supportsDLC()) {
      this.slotIDs.push(PanelMPCreateGame.ADDONS_PANEL_ID);
      this.navControlButtonInfo.push({
        category: "LOC_UI_CONTENT_MGR_SUBTITLE",
        isActive: false,
        eventHandler: () => {
          this.showAddOnsSetupPanel();
          this.enteredAdditionalContent = true;
        }
      });
    }
  }
  onInitialize() {
    super.onInitialize();
    this.createAdvancedPanel();
    if (UI.supportsDLC()) {
      this.createAddOnsPanel();
    }
    const subheader = document.createElement("fxs-header");
    subheader.setAttribute("title", "LOC_UI_MP_BROWSER_CREATE_GAME_SETTINGS");
    subheader.setAttribute("filigree-style", "none");
    subheader.classList.add("text-sm");
    this.frame.setAttribute("override-styling", "advanced-options_mp-frame flex-auto relative pt-14 px-10 pb-4");
    const topNav = MustGetElement(".advanced-options__top-nav", this.Root);
    topNav.insertAdjacentElement("afterend", subheader);
  }
  onAttach() {
    const gameMode = serverTypeToGameModeType.get(MultiplayerShellManager.serverType);
    if (gameMode) {
      Configuration.editGame()?.reset(gameMode);
    } else {
      console.warn(
        "Couldn't find gameMode for serverType=${MultiplayerShellManager.serverType} in mp-create-game.ts. Default to INTERNET."
      );
      Configuration.editGame()?.reset(GameModeTypes.INTERNET);
    }
    super.onAttach();
    this.enteredAdditionalContent = false;
    this.createGameConfirmed = false;
  }
  onUpdate() {
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
      let shouldRefreshGameOptions = false;
      const changes = GameSetup.getParameterChanges(this.gameSetupRevision);
      if (changes) {
        for (const c of changes) {
          if (c.created || c.destroyed) {
            if (c.playerID !== null && c.playerID !== void 0) {
              break;
            } else {
              shouldRefreshGameOptions = true;
            }
          }
        }
      } else {
        shouldRefreshGameOptions = true;
      }
      if (shouldRefreshGameOptions) {
        const focusManager = FocusManager.get();
        const lastChangedParameter = focusManager.currentFocus().id;
        this.refreshGameOptions();
        if (lastChangedParameter != "") {
          const newFocus = this.Root.querySelector(`#${lastChangedParameter}`);
          if (newFocus) {
            focusManager.setFocus(newFocus);
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
      this.gameSetupRevision = GameSetup.currentRevision;
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.addOrUpdateShellAction1("LOC_UI_MP_HOST_LOBBY");
  }
  close() {
    if (!this.createGameConfirmed) {
      window.dispatchEvent(new SendCampaignSetupTelemetryEvent(CampaignSetupType.Abandon));
    }
    super.close();
  }
  createBottomNav() {
    const bottomNav = super.createBottomNav();
    if (Configuration.getGame().isHotseat) {
      const loadGameButton = document.createElement("fxs-button");
      loadGameButton.classList.add("mx-2", "mb-2", "mt-6");
      loadGameButton.setAttribute("caption", "LOC_SAVE_LOAD_TITLE_LOAD");
      loadGameButton.addEventListener("action-activate", this.onLoadPressed.bind(this));
      const item = bottomNav.querySelector(".reset-button");
      item?.insertAdjacentElement("afterend", loadGameButton);
    }
    this.confirmButton.setAttribute("caption", "LOC_UI_MP_HOST_LOBBY");
    return bottomNav;
  }
  onResetConfirmed() {
    Configuration.editGame()?.reset(serverTypeToGameModeType.get(MultiplayerShellManager.serverType));
    waitForLayout(() => {
      this.refreshGameOptions();
    });
  }
  onLoadPressed() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "load",
        "server-type": ServerType.SERVER_TYPE_HOTSEAT,
        "save-type": SaveTypes.HOTSEAT,
        "from-event": false
      }
    });
  }
  onConfirmButtonPressed() {
    this.createGameConfirmed = true;
    this.close();
    if (this.enteredAdditionalContent) {
      Configuration.editGame()?.refreshEnabledMods();
    }
    MultiplayerShellManager.hostMultiplayerGame(MultiplayerShellManager.serverType);
  }
  setupNavTray() {
    if (this.activePanel == this.addOnsSetupPanel) {
      NavTray.addOrUpdateNavShellPrevious("LOC_UI_SAVE_CONFIG");
      NavTray.addOrUpdateNavShellNext("LOC_UI_LOAD_CONFIG");
      NavTray.addOrUpdateShellAction1("LOC_OPTIONS_MODDING_ENABLE_ALL");
    } else {
      super.setupNavTray();
      NavTray.addOrUpdateShellAction1("LOC_UI_MP_HOST_LOBBY");
      NavTray.addOrUpdateShellAction3("LOC_UI_MP_BROWSER_LOAD_NAVTRAY");
    }
  }
  onEngineInput(event) {
    super.onEngineInput(event);
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (event.isCancelInput()) {
      CreateGameModel.showPreviousPanel();
      this.close();
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.detail.name === "shell-action-3") {
      this.onLoadPressed();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  createAdvancedPanel() {
    this.mpAdvancedSetupPanel.classList.add("mp-advanced-setup", "flex", "flex-col");
    this.mpAdvancedSetupPanel.id = this.slotIDs[1];
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.mpAdvancedSetupPanel.appendChild(scrollableContent);
    const scrollableContentContainer = document.createElement("div");
    scrollableContentContainer.classList.add("advanced-setup__mp-advanced-options-container", "flex-auto", "mx-8");
    scrollableContent.appendChild(scrollableContentContainer);
    this.setupSlotGroup.appendChild(this.mpAdvancedSetupPanel);
  }
  createAddOnsPanel() {
    this.addOnsSetupPanel.classList.add("addons-setup", "shrink");
    this.addOnsSetupPanel.id = this.slotIDs[2];
    const modsContent = document.createElement("mods-content");
    modsContent.classList.add("flex-auto");
    this.addOnsSetupPanel.appendChild(modsContent);
    this.setupSlotGroup.appendChild(this.addOnsSetupPanel);
  }
  showAdvancedPanel() {
    this.goToNewPanel(this.mpAdvancedSetupPanel);
  }
  showAddOnsSetupPanel() {
    this.goToNewPanel(this.addOnsSetupPanel);
  }
  resolveParamGroup(param) {
    return param.groupMultiplayer != 0 ? param.groupMultiplayer : param.group;
  }
  getTabContainerForParam(param) {
    const groupID_MP = GameSetup.resolveString(param.groupMultiplayer);
    if (groupID_MP) {
      if (groupID_MP.includes("MPAdvanced")) {
        return MustGetElement(".advanced-setup__mp-advanced-options-container", this.Root);
      }
    }
    const groupID = GameSetup.resolveString(param.group);
    const isLegacyOption = groupID == "LegacyOptions";
    if (isLegacyOption) {
      return MustGetElement(".advanced-setup__legacy-options-container", this.Root);
    } else return MustGetElement(".advanced-setup__game-options-container", this.Root);
  }
}
Controls.define("screen-mp-create-game", {
  createInstance: PanelMPCreateGame,
  description: "Create game screen for multiplayer.",
  classNames: ["fullscreen", "flex", "justify-center"],
  styles: [styles],
  attributes: []
});
//# sourceMappingURL=mp-create-game.js.map
