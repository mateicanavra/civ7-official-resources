import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { G as GameCreatorOpenedEvent, M as MainMenuReturnEvent } from '../../events/shell-events.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { b as InputEngineEventName } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/action-handler.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
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
import '../../utilities/utilities-network-constants.chunk.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';

const content = "<fxs-modal-frame>\r\n\t<fxs-header\r\n\t\ttitle=\"LOC_UI_MP_LANDING_TITLE\"\r\n\t\tclass=\"font-title text-xl text-center uppercase tracking-100\"\r\n\t\tfiligree-style=\"h2\"\r\n\t></fxs-header>\r\n\t<fxs-hslot class=\"card-container pt-2 pb-6 px-12 justify-center\">\r\n\t\t<fxs-chooser-item\r\n\t\t\tclass=\"create-game-button w-72 mx-3\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\tdata-audio-activate=\"mp-landing-internet-selected\"\r\n\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t>\r\n\t\t\t<div class=\"flow-column p-3 flex-auto\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_GAME_MODE_CREATE_GAME\"\r\n\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flex-auto flow-column justify-end items-center\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"font-body text-lg text-accent-2 game-mode-description-text text-center\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_GAME_MODE_CREATE_GAME_DESCRIPTION\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\r\n\t\t<fxs-chooser-item\r\n\t\t\tclass=\"automatch-button w-72 mx-3\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\tdata-audio-activate=\"mp-landing-internet-selected\"\r\n\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t>\r\n\t\t\t<div class=\"flow-column p-3 flex-auto\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_GAME_MODE_AUTOMATCH\"\r\n\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flex-auto flow-column justify-end items-center\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"font-body text-lg text-accent-2 game-mode-description-text text-center\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_GAME_MODE_AUTOMATCH_DESCRIPTION\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t</fxs-hslot>\r\n\t<div class=\"flow-row justify-center\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"back-button mr-3\"\r\n\t\t\taction-key=\"inline-cancel\"\r\n\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"load-game-button\"\r\n\t\t\taction-key=\"inline-shell-action-2\"\r\n\t\t\tcaption=\"LOC_UI_MP_BROWSER_LOAD_GAME\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-game-mode/mp-game-mode.css";

class PanelMPGameMode extends Panel {
  backButton;
  loadButton;
  createButton;
  automatchButton;
  cardContainer;
  automatchDialogueBoxId = void 0;
  engineInputListener = this.onEngineInput.bind(this);
  loadGameButtonListener = this.onLoadGame.bind(this);
  backButtonListener = this.onBackButton.bind(this);
  automatchCardListener = this.onAutomatch.bind(this);
  createGameCardListener = this.onCreateGame.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  onInitialize() {
    super.onInitialize();
    this.backButton = MustGetElement(".back-button", this.Root);
    this.loadButton = MustGetElement(".load-game-button", this.Root);
    this.createButton = MustGetElement(".create-game-button", this.Root);
    this.automatchButton = MustGetElement(".automatch-button", this.Root);
    this.cardContainer = MustGetElement(".card-container", this.Root);
    const createButtonBgImg = document.createElement("div");
    createButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-buganda");
    waitForLayout(() => this.createButton.insertAdjacentElement("afterbegin", createButtonBgImg));
    if (UI.supportsAutoMatching()) {
      const automatchButtonBgImg = document.createElement("div");
      automatchButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-aksum");
      waitForLayout(() => this.automatchButton.insertAdjacentElement("afterbegin", automatchButtonBgImg));
    } else {
      this.automatchButton.classList.add("hidden");
    }
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-landing");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.createButton.addEventListener("action-activate", this.createGameCardListener);
    this.automatchButton.addEventListener("action-activate", this.automatchCardListener);
    this.backButton.addEventListener("action-activate", this.backButtonListener);
    this.loadButton.addEventListener("action-activate", this.loadGameButtonListener);
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    FocusManager.setFocus(this.cardContainer);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.name == "shell-action-2") {
      this.onLoadGame();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onCreateGame() {
    ContextManager.push("screen-mp-create-game", { singleton: true, createMouseGuard: true });
    window.dispatchEvent(new GameCreatorOpenedEvent());
  }
  onAutomatch() {
    if (this.automatchDialogueBoxId != void 0) {
      return;
    }
    const gameParameter = GameSetup.findGameParameter("Age");
    if (!gameParameter || !gameParameter.domain.possibleValues) {
      console.error("mp-game-mode.ts couldn't find the age parameter possible values");
      return;
    }
    const quickJoinItemsData = gameParameter.domain.possibleValues.map(({ value, name }) => ({
      label: Locale.compose(GameSetup.resolveString(name) ?? ""),
      type: value?.toString() ?? ""
    }));
    this.automatchDialogueBoxId = DialogBoxManager.createDialog_MultiOption({
      extensions: {
        dropdowns: [
          {
            id: "mp-quick-join__option",
            dropdownItems: JSON.stringify(quickJoinItemsData),
            label: "LOC_UI_MP_QUICK_JOIN_RULE_AGE"
          }
        ]
      },
      title: Locale.compose("LOC_UI_MP_GAME_MODE_AUTOMATCH"),
      options: [
        {
          actions: ["sys-menu"],
          label: "LOC_GENERIC_CONFIRM",
          valueCallback: (_id, newValue) => {
            const selectedOptionIndex = Number.parseInt(newValue);
            const selectedGameType = quickJoinItemsData[selectedOptionIndex]?.type;
            if (selectedGameType) {
              MultiplayerShellManager.onAutomatch(selectedGameType);
              this.automatchDialogueBoxId = void 0;
              this.close();
            }
          }
        },
        {
          actions: ["cancel", "keyboard-escape"],
          label: "LOC_GENERIC_CANCEL",
          callback: () => {
            this.automatchDialogueBoxId = void 0;
          }
        }
      ]
    });
  }
  onBackButton() {
    this.onClose();
  }
  onLoadGame() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "load",
        "server-type": MultiplayerShellManager.serverType,
        "save-type": SaveTypes.NETWORK_MULTIPLAYER
      }
    });
  }
  onClose() {
    this.close();
    window.dispatchEvent(new MainMenuReturnEvent());
  }
}
Controls.define("screen-mp-game-mode", {
  createInstance: PanelMPGameMode,
  description: "Game mode selection screen for Apple Arcade multiplayer.",
  classNames: ["mp-game-mode"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=mp-game-mode.js.map
