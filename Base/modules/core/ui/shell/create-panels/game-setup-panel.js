import { D as DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { CreateGameModel } from './create-game-model.js';
import { G as GameCreationPanelBase } from './game-creation-panel-base.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/action-handler.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../utilities/utilities-dom.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';

const styles = "fs://game/core/ui/shell/create-panels/game-setup-panel.css";

const STANDARD_PARAMETERS = [
  {
    parameterId: GameSetup.makeString("Difficulty"),
    background: "blp:sett_difficulty_full"
  },
  {
    parameterId: GameSetup.makeString("GameSpeeds"),
    background: "blp:sett_speed_full"
  },
  {
    parameterId: GameSetup.makeString("Map"),
    background: "blp:sett_type_full"
  },
  {
    parameterId: GameSetup.makeString("MapSize"),
    background: "blp:sett_size_full"
  },
  {
    parameterId: GameSetup.makeString("AgeTransitionSetting"),
    background: "blp:sett_age_full"
  }
];
class GameSetupComponentPanel extends GameCreationPanelBase {
  gameSetupRevision = 0;
  gameParamContainer = document.createElement("fxs-vslot");
  gameParamEles = [];
  // We cache the last changed parameter in case we need to refocus that parameter after rebuilding options
  lastChangedParameter = "";
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    const fragment = this.createLayoutFragment(true);
    const configHeader = document.createElement("fxs-header");
    configHeader.setAttribute("title", "LOC_GAME_SETUP_TITLE");
    configHeader.classList.add("mt-4");
    this.mainContent.appendChild(configHeader);
    const paramListScroll = document.createElement("fxs-scrollable");
    paramListScroll.setAttribute("attached-scrollbar", "true");
    paramListScroll.classList.add("flex", "flex-auto", "mr-3");
    paramListScroll.setAttribute("allow-mouse-panning", "true");
    this.mainContent.appendChild(paramListScroll);
    this.gameParamContainer.classList.add("flex", "flex-col", "flex-auto");
    paramListScroll.appendChild(this.gameParamContainer);
    this.mainContent.appendChild(this.buildBottomNavBar());
    fragment.appendChild(this.buildLeaderBox());
    this.updateLeaderBox();
    this.Root.appendChild(fragment);
  }
  onAttach() {
    super.onAttach();
    const checkGameSetup = () => {
      if (this.Root.isConnected) {
        if (GameSetup.currentRevision != this.gameSetupRevision) {
          this.refreshGameOptions();
          this.gameSetupRevision = GameSetup.currentRevision;
        }
        window.requestAnimationFrame(checkGameSetup);
      }
    };
    window.requestAnimationFrame(checkGameSetup);
  }
  onDetach() {
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.gameParamContainer);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction1(
      CreateGameModel.nextActionStartsGame ? "LOC_UI_SETUP_START_GAME" : "LOC_GENERIC_CONTINUE"
    );
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(event) {
    super.onEngineInput(event);
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (event.detail.name === "shell-action-1") {
      CreateGameModel.showNextPanel();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  refreshGameOptions() {
    for (const element of this.gameParamEles) {
      element.remove();
    }
    this.gameParamEles.length = 0;
    const parameters = GameSetup.getGameParameters();
    const options = [];
    for (const [, setupParam] of parameters.entries()) {
      if (!setupParam.hidden && setupParam.invalidReason == GameSetupParameterInvalidReason.Valid) {
        const idx = STANDARD_PARAMETERS.findIndex((sp) => sp.parameterId == setupParam.ID);
        if (idx != -1) {
          options.push({ param: setupParam, background: STANDARD_PARAMETERS[idx].background, index: idx });
        }
      }
    }
    options.sort((a, b) => a.index - b.index);
    const fragment = document.createDocumentFragment();
    for (const p of options) {
      this.createOption(fragment, p.param, p.background, p.index + 1);
    }
    if ((!Network.supportsSSO() || !Online.LiveEvent.getLiveEventGameFlag()) && !CreateGameModel.isLastPanel) {
      const advancedOptionsButton = document.createElement("fxs-button");
      advancedOptionsButton.setAttribute("caption", "LOC_ADVANCED_OPTIONS_ADVANCED");
      advancedOptionsButton.setAttribute("data-audio-group-ref", "main-menu-audio");
      advancedOptionsButton.setAttribute("data-audio-activate-ref", "data-audio-advanced-options-activate");
      advancedOptionsButton.classList.add("mx-5", "my-3");
      advancedOptionsButton.addEventListener(
        "action-activate",
        () => CreateGameModel.showPanelByName("advanced-options-panel")
      );
      fragment.appendChild(advancedOptionsButton);
      this.gameParamEles.push(advancedOptionsButton);
    }
    this.gameParamContainer.appendChild(fragment);
    this.refocusLastChangedParameter();
  }
  refocusLastChangedParameter() {
    if (this.lastChangedParameter != "") {
      for (const element of this.gameParamEles) {
        if (element.getAttribute("data-parameter-id") == this.lastChangedParameter) {
          FocusManager.setFocus(element);
        }
      }
    }
  }
  createOption(frag, setupParam, backgroundImageCSS, tabIndex) {
    if (setupParam.domain.type == GameSetupDomainType.Select) {
      const selector = document.createElement("fxs-selector-ornate");
      selector.classList.add("game-setup-selector");
      selector.setAttribute("tabindex", tabIndex.toString());
      this.gameParamEles.push(selector);
      const parameterID = GameSetup.resolveString(setupParam.ID);
      const paramName = GameSetup.resolveString(setupParam.name);
      selector.setAttribute("label", paramName ?? "");
      selector.setAttribute("default-image", `url(${backgroundImageCSS})`);
      selector.setAttribute("data-parameter-id", parameterID);
      selector.setAttribute("data-audio-activate-ref", "none");
      const description = GameSetup.resolveString(setupParam.description);
      selector.addEventListener(DropdownSelectionChangeEventName, (event) => {
        const targetElement = event.target;
        const parameterID2 = targetElement.getAttribute("data-parameter-id");
        if (parameterID2) {
          const index = event.detail.selectedIndex;
          const parameter = GameSetup.findGameParameter(parameterID2);
          if (parameter && parameter.domain.possibleValues && parameter.domain.possibleValues.length > index) {
            const value = parameter.domain.possibleValues[index];
            this.lastChangedParameter = parameterID2;
            GameSetup.setGameParameterValue(parameterID2, value.value);
            let tooltip2 = "";
            if (description) {
              tooltip2 = Locale.compose(description);
            }
            const thisParamName = GameSetup.resolveString(value.name);
            if (thisParamName) {
              tooltip2 = tooltip2 + "[N] [N]" + Locale.compose(thisParamName);
            }
            const paramDescription = GameSetup.resolveString(value.description);
            if (paramDescription) {
              tooltip2 = tooltip2 + "[N] [N]" + Locale.compose(paramDescription);
            }
            const warning = GameSetup.resolveString(value.warning);
            if (warning) {
              tooltip2 = tooltip2 + "[N] [ICON:attention]" + Locale.compose(warning);
            }
            selector.setAttribute("data-tooltip-content", tooltip2);
          }
        }
      });
      let tooltip = "";
      if (description) {
        tooltip = Locale.compose(description);
      }
      const actionsList = [];
      if (setupParam.domain.possibleValues) {
        for (const [index, pv] of setupParam.domain.possibleValues.entries()) {
          let valueName = GameSetup.resolveString(pv.name);
          if (!valueName) {
            console.error(`game-setup.ts - Failed to resolve string for game option: ${pv.name}`);
            return;
          }
          if (setupParam.value.value == pv.value) {
            selector.setAttribute("selected-item-index", index.toString());
            tooltip = tooltip + "[N] [N]" + Locale.compose(valueName);
            const paramDescription = GameSetup.resolveString(pv.description);
            if (paramDescription) {
              tooltip = tooltip + "[N] [N]" + Locale.compose(paramDescription);
            }
            const warning = GameSetup.resolveString(pv.warning);
            if (warning) {
              tooltip = tooltip + "[N] [ICON:attention]" + Locale.compose(warning);
              valueName = "[ICON:attention]" + valueName;
            }
          }
          actionsList.push({ label: Locale.compose(valueName) });
        }
      }
      selector.setAttribute("data-tooltip-content", tooltip);
      selector.setAttribute("dropdown-items", JSON.stringify(actionsList));
      frag.appendChild(selector);
    } else {
      const parameterID = GameSetup.resolveString(setupParam.ID);
      const paramName = GameSetup.resolveString(setupParam.name);
      const valueName = setupParam.value.name ? GameSetup.resolveString(setupParam.value.name) : setupParam.value.value?.toString();
      if (valueName) {
        if (paramName) {
          const parent = document.createElement("div");
          parent.classList.add("flow-row", "flex", "items-center");
          this.gameParamEles.push(parent);
          const label = document.createElement("div");
          label.classList.add("flex", "flex-auto", "justify-end", "flow-row-reverse", "font-body-base");
          label.setAttribute("data-l10n-id", `{${paramName}}:`);
          parent.appendChild(label);
          const description = GameSetup.resolveString(setupParam.description);
          if (description) {
            parent.setAttribute("data-tooltip-content", description);
          }
          if (setupParam.domain.type == GameSetupDomainType.Boolean) {
            if (setupParam.readOnly) {
              const value = document.createElement("div");
              value.classList.add("display-flex", "font-body-base");
              value.setAttribute("data-l10n-id", valueName);
              parent.appendChild(value);
            } else {
              const value = document.createElement("fxs-checkbox");
              value.classList.add("display-flex", "font-body-base");
              value.setAttribute("tabindex", tabIndex.toString());
              value.setAttribute("selected", valueName);
              value.addEventListener("component-value-changed", (event) => {
                const newValue = event.detail.value;
                const parameter = GameSetup.findGameParameter(parameterID);
                if (parameter) {
                  GameSetup.setGameParameterValue(parameterID, newValue);
                }
              });
              parent.appendChild(value);
            }
          } else {
            if (setupParam.readOnly) {
              const value = document.createElement("div");
              value.classList.add("display-flex", "font-body-base");
              value.setAttribute("data-l10n-id", valueName);
              parent.appendChild(value);
            } else {
              const value = document.createElement("fxs-textbox");
              value.setAttribute("tabindex", tabIndex.toString());
              value.classList.add("display-flex", "font-body-base");
              value.setAttribute("value", valueName);
              value.addEventListener("component-value-changed", (event) => {
                const newValue = event.detail.value.toString();
                const parameter = GameSetup.findGameParameter(parameterID);
                if (parameter) {
                  if (parameter.domain.type != GameSetupDomainType.Text) {
                    const numericValue = Number.parseInt(newValue);
                    if (numericValue) {
                      GameSetup.setGameParameterValue(parameterID, numericValue);
                    }
                  } else {
                    GameSetup.setGameParameterValue(parameterID, newValue);
                  }
                }
              });
              parent.appendChild(value);
            }
          }
          frag.appendChild(parent);
        } else {
          const value = document.createElement("div");
          value.classList.add("font-body-base");
          value.setAttribute("data-l10n-id", valueName);
          frag.appendChild(value);
        }
      }
    }
  }
}
function getStandardParameterBackgrounds() {
  return STANDARD_PARAMETERS.map((sp) => sp.background);
}
Controls.define("game-setup-panel", {
  createInstance: GameSetupComponentPanel,
  description: "Configure game options",
  classNames: ["size-full", "relative", "flex", "flex-col"],
  styles: [styles],
  images: getStandardParameterBackgrounds(),
  tabIndex: -1
});
//# sourceMappingURL=game-setup-panel.js.map
