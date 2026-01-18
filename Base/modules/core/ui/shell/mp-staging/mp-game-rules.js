import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { i as instance } from './model-mp-staging-new.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../create-panels/age-civ-select-model.chunk.js';
import '../live-event-logic/live-event-logic.chunk.js';
import '../../utilities/utilities-data.chunk.js';
import '../create-panels/leader-select-model.chunk.js';
import '../mp-shell-logic/mp-shell-logic.chunk.js';
import '../../context-manager/context-manager.js';
import '../../events/shell-events.chunk.js';
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
import '../mp-legal/mp-legal.js';

const content = "<div class=\"mp-game-rules-frame-container h-full max-h-174 max-w-256 py-8 flow-column items-center justify-center\">\r\n\t<fxs-modal-frame\r\n\t\tclass=\"mp-game-rules-frame shrink flow-column w-full px-20\"\r\n\t\tdata-modal-style=\"generic\"\r\n\t>\r\n\t\t<div class=\"flex items-center justify-center h-16 absolute left-4 -right-36 -top-8 pb-1\">\r\n\t\t\t<div class=\"grow img-top-filigree-left\"></div>\r\n\t\t\t<div class=\"img-top-filigree-center\"></div>\r\n\t\t\t<div class=\"grow img-top-filigree-right\"></div>\r\n\t\t</div>\r\n\t\t<div class=\"flow-column items-center flex-auto\">\r\n\t\t\t<div class=\"rules-container mb-8 flow-column justify-center items-center\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_GAME_RULES_TITLE\"\r\n\t\t\t\t\tclass=\"mb-6 uppercase mp-game-rules-header\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"mp-game-rules__host\"></div>\r\n\t\t\t\t<div class=\"mp-game-rules__rules max-w-192 flow-row-wrap\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"mods-container flex-auto flow-column\">\r\n\t\t\t\t<div class=\"mb-2\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"font-title-base text-center text-gradient-secondary -mb-3 uppercase\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_EXTRA_CONTENT\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"flow-row justify-center\">\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\tclass=\"flex-auto mp-game-rules__mods-scrollable\"\r\n\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"mp-game-rules__mods flow-column items-center px-4\"></div>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<fxs-close-button class=\"-right-38 top-2\"></fxs-close-button>\r\n\t</fxs-modal-frame>\r\n</div>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-game-rules.css";

class PanelMPPlayerOptions extends Panel {
  rules = [];
  rulesContainer;
  hostElement;
  scrollableMods;
  modsContainer;
  engineInputListener = this.onEngineInput.bind(this);
  closeButtonListener = this.onClose.bind(this);
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    this.modsContainer = MustGetElement(".mods-container", this.Root);
    this.scrollableMods = MustGetElement(".mp-game-rules__mods-scrollable", this.Root);
    this.rulesContainer = MustGetElement(".mp-game-rules__rules", this.Root);
    this.hostElement = MustGetElement(".mp-game-rules__host", this.Root);
    const mods = MustGetElement(".mp-game-rules__mods", this.Root);
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    this.modsContainer.classList.toggle("hidden", !UI.supportsDLC());
    this.Root.addEventListener("engine-input", this.engineInputListener);
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    const gameConfig = Configuration.getGame();
    if (!UI.supportsDLC()) {
      const header = MustGetElement(".mp-game-rules-header", this.Root);
      header.setAttribute("title", Locale.compose("LOC_UI_MP_GAME_RULES_NO_MODS_TITLE"));
    }
    const hostPlayerID = Network.getHostPlayerId();
    const hostPlayerConfig = Configuration.getPlayer(hostPlayerID);
    const localPlatform = Network.getLocalHostingPlatform();
    let curPlatform = Network.getPlayerHostingPlatform(hostPlayerID);
    if (localPlatform != curPlatform) {
      curPlatform = HostingType.HOSTING_TYPE_UNKNOWN;
    }
    let platformIcon = "none";
    const tempIcon = NetworkUtilities.getHostingTypeURL(curPlatform);
    if (tempIcon) {
      platformIcon = tempIcon;
    }
    const hostGamertag = Locale.compose(hostPlayerConfig.slotName);
    const hostGamertagRule = this.addRule(
      this.hostElement,
      Locale.compose("LOC_UI_MP_GAME_RULE_HOST"),
      hostGamertag,
      platformIcon == "none" ? void 0 : `url('${platformIcon}')`
    );
    hostGamertagRule?.classList.remove("max-w-96");
    const playerCountRule = this.addRule(
      this.rulesContainer,
      Locale.compose("LOC_UI_MP_GAME_RULE_HUMAN_PLAYER_COUNT"),
      `${gameConfig.humanPlayerCount}/${gameConfig.maxJoinablePlayerCount}`
    );
    if (playerCountRule) {
      this.rules.push(playerCountRule);
    }
    const aiPlayerCount = gameConfig.maxJoinablePlayerCount - gameConfig.humanPlayerCount;
    const aiPlayerCountRule = this.addRule(
      this.rulesContainer,
      Locale.compose("LOC_UI_MP_GAME_RULE_AI_PLAYER_COUNT"),
      aiPlayerCount.toString()
    );
    if (aiPlayerCountRule) {
      this.rules.push(aiPlayerCountRule);
    }
    const isPrivate = gameConfig.isPrivateGame;
    const isPrivateRule = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_GAME_RULE_PRIVATE_GAME",
      isPrivate ? "LOC_GENERIC_YES" : "LOC_GENERIC_NO"
    );
    if (isPrivateRule) {
      this.rules.push(isPrivateRule);
    }
    const difficultyNameRule = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_LOBBY_DIFFICULTY",
      instance.difficulty ?? "?"
    );
    if (difficultyNameRule) {
      this.rules.push(difficultyNameRule);
    }
    const mapRuleSet = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_LOBBY_RULE_SET",
      instance.summaryMapRuleSet ?? "?"
    );
    if (mapRuleSet) {
      this.rules.push(mapRuleSet);
    }
    const mapType = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_LOBBY_MAP_TYPE",
      instance.summaryMapType ?? "?"
    );
    if (mapType) {
      this.rules.push(mapType);
    }
    const mapSize = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_LOBBY_MAP_SIZE",
      instance.summaryMapSize ?? "?"
    );
    if (mapSize) {
      this.rules.push(mapSize);
    }
    const gameSpeed = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_LOBBY_GAME_SPEED",
      instance.summarySpeed ?? "?"
    );
    if (gameSpeed) {
      this.rules.push(gameSpeed);
    }
    const turnTimerType = gameConfig.turnTimerType;
    let ruleTurnTimerText = "DBG Invalid Turn Timer enum value";
    switch (turnTimerType) {
      case TurnTimerType.TURNTIMER_NONE:
        ruleTurnTimerText = "LOC_UI_MP_GAME_RULE_TURN_TIMER_NONE";
        break;
      case TurnTimerType.TURNTIMER_STANDARD:
        ruleTurnTimerText = "LOC_UI_MP_GAME_RULE_TURN_TIMER_STANDARD";
        break;
      case TurnTimerType.TURNTIMER_DYNAMIC:
        ruleTurnTimerText = "LOC_UI_MP_GAME_RULE_TURN_TIMER_DYNAMIC";
        break;
      default:
        console.error("mp-game-rules: onAttach(): Invalid Turn Timer enum value (" + turnTimerType + ")");
        ruleTurnTimerText += " (" + turnTimerType + ")";
        break;
    }
    const ruleTurnTimerRule = this.addRule(
      this.rulesContainer,
      Locale.compose("LOC_UI_MP_GAME_RULE_TURN_TIMER"),
      Locale.compose(ruleTurnTimerText)
    );
    if (ruleTurnTimerRule) {
      this.rules.push(ruleTurnTimerRule);
    }
    const turnTimerTime = gameConfig.turnTimerTime;
    if (turnTimerType == TurnTimerType.TURNTIMER_STANDARD) {
      const ruleTurnTime = this.addRule(
        this.rulesContainer,
        Locale.compose("LOC_UI_MP_GAME_RULE_TURN_TIME"),
        `${turnTimerTime}`
      );
      if (ruleTurnTime) {
        this.rules.push(ruleTurnTime);
      }
    }
    const turnPhaseType = gameConfig.turnPhaseType;
    let ruleTurnPhaseText = "DBG Invalid Turn Phase enum value";
    switch (turnPhaseType) {
      case TurnPhaseType.NO_TURN_PHASE:
        ruleTurnPhaseText = "LOC_UI_MP_GAME_RULE_TURN_MODE_NONE";
        break;
      case TurnPhaseType.TURNPHASE_SINGLEPLAYER:
        ruleTurnPhaseText = "LOC_UI_MP_GAME_RULE_TURN_MODE_SINGLEPLAYER";
        break;
      case TurnPhaseType.TURNPHASE_SIMULTANEOUS:
        ruleTurnPhaseText = "LOC_UI_MP_GAME_RULE_TURN_MODE_SIMULTANEOUS";
        break;
      default:
        console.error("mp-game-rules: onAttach(): Invalid Turn Phase enum value (" + turnPhaseType + ")");
        ruleTurnPhaseText += " (" + turnPhaseType + ")";
        break;
    }
    const ruleTurnPhaseRule = this.addRule(
      this.rulesContainer,
      Locale.compose("LOC_UI_MP_GAME_RULE_TURN_MODE"),
      Locale.compose(ruleTurnPhaseText)
    );
    if (ruleTurnPhaseRule) {
      this.rules.push(ruleTurnPhaseRule);
    }
    const startAgeName = gameConfig.startAgeName;
    if (startAgeName == null) {
      console.error("mp-game-rules: onAttach(): Missing start age name");
    }
    const startAgeNameRule = this.addRule(
      this.rulesContainer,
      Locale.compose("LOC_UI_MP_GAME_RULE_STARTING_AGE"),
      startAgeName ?? "DBG Missing start age name"
    );
    if (startAgeNameRule) {
      this.rules.push(startAgeNameRule);
    }
    const isKickVoting = gameConfig.isKickVoting;
    const isKickVotingRule = this.addRule(
      this.rulesContainer,
      "LOC_UI_MP_GAME_RULE_KICK_VOTING",
      isKickVoting ? "LOC_GENERIC_YES" : "LOC_GENERIC_NO"
    );
    if (isKickVotingRule) {
      this.rules.push(isKickVotingRule);
    }
    const modsFragment = document.createDocumentFragment();
    const modsToExclude = new Set(Modding.getModulesToExclude());
    const modTitlesToList = [];
    const enabledModCount = gameConfig.enabledModCount;
    for (let modIndex = 0; modIndex < enabledModCount; ++modIndex) {
      const modId = gameConfig.getEnabledModId(modIndex);
      if (modId && !modsToExclude.has(modId)) {
        const bundle = gameConfig.getEnabledModTitle(modIndex);
        if (bundle) {
          modTitlesToList.push(Locale.unpack(bundle));
        }
      }
    }
    modTitlesToList.sort((a, b) => Locale.compare(a, b));
    for (const title of modTitlesToList) {
      const mod = document.createElement("div");
      mod.classList.add("font-body-base", "text-accent-2");
      mod.innerHTML = title;
      modsFragment.appendChild(mod);
    }
    mods.appendChild(modsFragment);
    waitForLayout(() => this.updateRules());
  }
  addRule(parent, ruleLabelTxt, ruleValueTxt, ruleIcon = void 0) {
    if (!parent) {
      console.error("mp-game-rules: addRule(): Invalid parent");
      return;
    }
    const ruleRow = document.createElement("div");
    ruleRow.classList.add(
      "mp-game-rules__rule-row",
      "flex",
      "flow-row",
      "items-center",
      "min-w-60",
      "max-w-96",
      "px-2"
    );
    const ruleLabel = document.createElement("div");
    ruleLabel.classList.add("font-bold", "font-body-base", "mr-2");
    ruleLabel.setAttribute("data-l10n-id", ruleLabelTxt);
    ruleRow.appendChild(ruleLabel);
    if (ruleIcon) {
      const icon = document.createElement("div");
      icon.classList.add("w-7", "h-7", "mb-2", "mr-2", "bg-cover", "bg-no-repeat");
      icon.style.backgroundImage = ruleIcon;
      ruleRow.appendChild(icon);
    }
    const ruleValue = document.createElement("div");
    ruleValue.classList.add("font-body-base", "text-accent-3", "flex-auto", "font-fit-shrink", "whitespace-nowrap");
    ruleValue.setAttribute("data-l10n-id", ruleValueTxt);
    ruleRow.appendChild(ruleValue);
    parent.appendChild(ruleRow);
    return ruleRow;
  }
  updateRules() {
    const maxWidth = this.rules.reduce(
      (prevRule, currRule) => currRule.getBoundingClientRect().width > prevRule.getBoundingClientRect().width ? currRule : prevRule
    ).getBoundingClientRect().width;
    this.rules.forEach((rule) => rule.style.setProperty("width", `${maxWidth}px`));
    this.rulesContainer.style.setProperty("width", `${maxWidth * 2}px`);
    this.hostElement.style.setProperty("width", `${maxWidth * 2}px`);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    FocusManager.setFocus(this.scrollableMods);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
        this.onClose();
        return true;
    }
    return false;
  }
  onClose() {
    this.close();
  }
}
Controls.define("screen-mp-game-rules", {
  createInstance: PanelMPPlayerOptions,
  description: "Create popup for Multiplayer Lobby Player Options.",
  classNames: ["mp-game-rules", "fullscreen", "flow-row", "justify-center", "items-center"],
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});
//# sourceMappingURL=mp-game-rules.js.map
