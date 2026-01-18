import { j as SendCampaignSetupTelemetryEvent } from '../../events/shell-events.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { A as AnchorType } from '../../panel-support.chunk.js';
import { a as AdvancedOptionsBase, s as styles } from '../create-panels/advanced-options-panel.chunk.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { s as serverTypeToGameModeType } from '../../utilities/utilities-network-constants.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../create-panels/create-game-model.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';
import '../create-panels/game-creation-panel-base.chunk.js';
import '../live-event-logic/live-event-logic.chunk.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';

class PanelMPCreateGame extends AdvancedOptionsBase {
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
    this.slotIDs = ["advanced-setup-mp__game", "advanced-setup-mp__legacy", "advanced-setup-mp__advanced"];
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
      {
        category: "LOC_ADVANCED_OPTIONS_LEGACY_PATH_SETTINGS",
        isActive: false,
        eventHandler: this.showLegacyPathSetupPanel.bind(this)
      },
      {
        category: "LOC_GROUPID_ADVANCEDOPTIONS",
        isActive: false,
        eventHandler: this.showAdvancedPanel.bind(this)
      }
    ];
    if (UI.supportsDLC()) {
      this.slotIDs.push("advanced-setup-mp__add-ons");
      this.navControlButtonInfo.push({
        category: "LOC_UI_CONTENT_MGR_SUBTITLE",
        isActive: false,
        eventHandler: this.showAddOnsSetupPanel.bind(this)
      });
    }
  }
  onInitialize() {
    super.onInitialize();
    this.createAdvancedPanel();
    if (UI.supportsDLC()) {
      this.createAddOnsPanel();
    }
    this.frame.setAttribute("override-styling", "advanced-options_mp-frame flex-auto relative pt-14 px-10 pb-4");
    const subheader = document.createElement("fxs-header");
    subheader.setAttribute("title", "LOC_UI_MP_BROWSER_CREATE_GAME_SETTINGS");
    subheader.setAttribute("filigree-style", "none");
    subheader.classList.add("text-sm");
    this.frame.insertBefore(subheader, MustGetElement(".advanced-options__top-nav", this.Root));
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
    this.confirmButton.setAttribute("caption", "LOC_UI_MP_HOST_LOBBY");
    return bottomNav;
  }
  onResetConfirmed() {
    Configuration.editGame()?.reset(serverTypeToGameModeType.get(MultiplayerShellManager.serverType));
    waitForLayout(() => {
      this.refreshGameOptions();
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
      NavTray.addOrUpdateShellAction1("LOC_OPTIONS_MODDING_ENABLE_ALL");
    } else {
      super.setupNavTray();
      NavTray.addOrUpdateShellAction1("LOC_UI_MP_HOST_LOBBY");
    }
  }
  onEngineInput(event) {
    super.onEngineInput(event);
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (event.isCancelInput()) {
      this.close();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  createAdvancedPanel() {
    this.mpAdvancedSetupPanel.classList.add("mp-advanced-setup", "flex", "flex-col");
    this.mpAdvancedSetupPanel.id = this.slotIDs[2];
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
    this.addOnsSetupPanel.id = this.slotIDs[3];
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
