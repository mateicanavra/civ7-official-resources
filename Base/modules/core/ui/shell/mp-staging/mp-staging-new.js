import { Audio } from '../../audio-base/audio-support.js';
import { ActionActivateEventName } from '../../components/fxs-activatable.js';
import { DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.js';
import ContextManager, { ContextManagerEvents } from '../../context-manager/context-manager.js';
import { StartCampaignEvent, SendCampaignSetupTelemetryEvent } from '../../events/shell-events.js';
import ActionHandler from '../../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../../input/input-events.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel, { AnchorType } from '../../panel-support.js';
import { ProfileAccountLoggedOutEventName } from '../../profile-header/profile-header.js';
import MultiplayerShellManager from '../mp-shell-logic/mp-shell-logic.js';
import { MPLobbyDataModelProxy, LobbyUpdateEventName, SMALL_SCREEN_MODE_MAX_HEIGHT, SMALL_SCREEN_MODE_MAX_WIDTH } from './model-mp-staging-new.js';
import Databind from '../../utilities/utilities-core-databinding.js';
import { MustGetElement, MustGetElements } from '../../utilities/utilities-dom.js';
import { Layout } from '../../utilities/utilities-layout.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-staging-new.html.js';
import styles from './mp-staging-new.scss.js';

var FocusState = /* @__PURE__ */ ((FocusState2) => {
  FocusState2["PLAYER_SLOT"] = "PLAYER_SLOT";
  FocusState2["CHAT"] = "CHAT";
  FocusState2["CHAT_DIALOG"] = "CHAT_DIALOG";
  return FocusState2;
})(FocusState || {});
class PanelMPLobby extends Panel {
  isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
  frame;
  readyButton;
  readyButtonContainer;
  readyDescriptionContainer;
  readyButtonLoadingContainer;
  toggleChatButton;
  backButton;
  chatNavHelp;
  chat;
  multiplayerChatHandle = null;
  chatFrame;
  showJoinCodeButtonTop;
  showJoinCodeButtonBot;
  viewAllRulesButtonTop;
  viewAllRulesButtonBot;
  viewAllRulesButtonFarBot;
  leftSectionTop;
  botSection;
  botSection2;
  leftSectionHeader;
  leftSectionContent;
  playerInfoSlot;
  headerSpacings;
  profileHeader;
  profileHeaderContainer;
  readyHeader = MustGetElement(".mp-staging__ready-header", this.Root);
  kickHeader = MustGetElement(".mp-staging__kick-header", this.Root);
  MPLobbyDataModelProxy = new MPLobbyDataModelProxy();
  joinCodeShown = false;
  shouldShowJoinCode = (Network.supportsSSO() || Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER && !UI.isGameCenterNetworkBuild()) && !Configuration.getGame().isHotseat;
  focusState = "PLAYER_SLOT" /* PLAYER_SLOT */;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  mementosButtonActivateListener = this.onMementosButtonActivate.bind(this);
  resizeListener = this.onResize.bind(this);
  toggleChatActivateListener = this.onToggleChatActivate.bind(this);
  lobbyUpdateListener = this.onLobbyUpdate.bind(this);
  chatFocusListener = this.onChatFocus.bind(this);
  chatEngineInputListener = this.onChatEngineInput.bind(this);
  profileAccountLoggedOutListener = this.onProfileAccountLoggedOut.bind(this);
  activeDeviceTypeChangeListener = this.onActiveDeviceTypeChange.bind(this);
  readyIndicatorActivateListener = this.onReadyIndicatorActivate.bind(this);
  onAttach() {
    this.MPLobbyDataModelProxy.connect();
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "multiplayer-lobby");
    super.onAttach();
    window.addEventListener("resize", this.resizeListener);
    window.addEventListener(LobbyUpdateEventName, this.lobbyUpdateListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeChangeListener);
    engine.on(ContextManagerEvents.OnChanged, this.onContextChange, this);
    this.frame = MustGetElement(".mp-staging__frame", this.Root);
    this.showJoinCodeButtonTop = MustGetElement(".show-join-code-button-top", this.Root);
    this.showJoinCodeButtonTop.setAttribute("data-audio-group-ref", "multiplayer-lobby");
    this.showJoinCodeButtonTop.setAttribute("data-audio-activate-ref", "data-audio-show-code-activate");
    this.showJoinCodeButtonBot = MustGetElement(".show-join-code-button-bot", this.Root);
    this.showJoinCodeButtonBot.setAttribute("data-audio-group-ref", "multiplayer-lobby");
    this.showJoinCodeButtonBot.setAttribute("data-audio-activate-ref", "data-audio-show-code-activate");
    this.leftSectionTop = MustGetElement(".mp-staging__left-section-top", this.Root);
    this.botSection = MustGetElement(".mp-staging__bot-section", this.Root);
    this.botSection2 = MustGetElement(".mp-staging__bot-section2", this.Root);
    this.leftSectionHeader = MustGetElement(".mp-staging__left-section-header", this.Root);
    this.leftSectionContent = MustGetElement(".mp-staging__left-section-content", this.Root);
    this.toggleChatButton = MustGetElement(".mp-staging__toggle-chat", this.Root);
    this.chatFrame = MustGetElement(".mp-staging__chat-frame", this.Root);
    if (Network.hasCommunicationsPrivilege(false) && !Configuration.getGame().isHotseat) {
      this.chat = document.createElement("screen-mp-chat");
      this.chat.classList.add("flex-auto");
      this.chatNavHelp = document.createElement("fxs-nav-help");
      this.chatNavHelp.classList.add("mp-staging__chat-navhelp absolute -top-1 -right-4");
      this.chatFrame.appendChild(this.chat);
      this.chatFrame.appendChild(this.chatNavHelp);
      this.chat.addEventListener("focus", this.chatFocusListener);
      this.chat.addEventListener("engine-input", this.chatEngineInputListener);
    } else {
      this.toggleChatButton.classList.add("hidden");
      this.chatFrame.classList.add("hidden");
    }
    this.headerSpacings = MustGetElements(".mp-staging__header-spacing", this.Root);
    this.profileHeaderContainer = MustGetElement(".mp-staging__profile-header-container", this.Root);
    if (Network.supportsSSO() || Online.Metaprogression.supportsMemento()) {
      this.profileHeader = document.createElement("profile-header");
      this.profileHeader.setAttribute("hide-giftbox", "true");
      this.profileHeader.setAttribute("hide-social", Network.supportsSSO() ? "false" : "true");
      this.profileHeader.classList.add("mp-staging__profile-header", "flow-row", "flex-auto", "trigger-nav-help");
      this.profileHeader.setAttribute("profile-for", "screen-mp-lobby");
      this.profileHeader.addEventListener(ProfileAccountLoggedOutEventName, this.profileAccountLoggedOutListener);
      this.profileHeaderContainer.appendChild(this.profileHeader);
    }
    this.playerInfoSlot = MustGetElement(".player-info-slot", this.Root);
    this.playerInfoSlot.addEventListener("engine-input", this.onPlayerInfoEngineInput.bind(this));
    this.playerInfoSlot.addEventListener("navigate-input", this.onPlayerInfoNavigateInput.bind(this));
    this.playerInfoSlot.addEventListener("focus", this.onPlayerInfoFocus);
    this.backButton = MustGetElement(".back-button", this.Root);
    Databind.if(this.backButton, `!{{g_NavTray.isTrayRequired}}`);
    const mementosButton = MustGetElement(".memento-button", this.Root);
    if (this.isMobileViewExperience) {
      mementosButton.setAttribute("caption", "LOC_LEADER_MEMENTOS_TITLE");
    }
    this.viewAllRulesButtonTop = MustGetElement(".rules-top", this.Root);
    this.viewAllRulesButtonBot = MustGetElement(".rules-bot", this.Root);
    this.viewAllRulesButtonFarBot = MustGetElement(".rules-bot2", this.Root);
    this.readyButton = MustGetElement(".ready-button", this.Root);
    this.readyButtonContainer = MustGetElement(".mp-staging__ready-button-container", this.Root);
    this.readyDescriptionContainer = MustGetElement(".mp-staging__ready-description-container", this.Root);
    this.updateHeaderSpacing();
    this.updateLeftSection();
    this.updateReadyButtonContainer();
    this.updateReadyDescriptionContainer();
    this.updateBotSection();
    this.updateBotSection2();
    this.updateShowJoinCodeButton();
    this.updateViewAllRulesFarBot();
    this.updateViewRuleButton();
    this.updateFrame();
    this.showJoinCodeButtonTop.addEventListener("action-activate", this.onShowJoinCode.bind(this));
    this.showJoinCodeButtonBot.addEventListener("action-activate", this.onShowJoinCode.bind(this));
    this.refreshShowJoinCodeCaption();
    this.toggleChatButton.addEventListener("action-activate", this.toggleChatActivateListener);
    Databind.if(this.toggleChatButton, `!{{g_NavTray.isTrayRequired}}`);
    const playerInfoScrollable = document.createElement("fxs-scrollable");
    playerInfoScrollable.classList.add("mp-staging__player-info-scrollable", "flex-auto", "-ml-2");
    playerInfoScrollable.setAttribute("handle-gamepad-pan", "true");
    waitForLayout(() => playerInfoScrollable.component.setEngineInputProxy(this.playerInfoSlot));
    const playerInfoContainer = document.createElement("div");
    playerInfoContainer.classList.add("flow-column", "-mb-1", "ml-2");
    const playerInfo = document.createElement("div");
    playerInfo.classList.add("mp-staging__slot-row", "flow-row", "w-full", "mb-3");
    Databind.for(playerInfo, "g_MPLobbyModel.playersData", "rowIndex, player");
    {
      const playerInfoFrame = document.createElement("fxs-inner-frame");
      playerInfoFrame.classList.add("items-stretch", "flow-row", "flex-auto", "ml-4");
      const closeRow = document.createElement("div");
      Databind.attribute(closeRow, "index", "rowIndex");
      closeRow.classList.add("mp-staging__focusable-row", "items-center", "w-full", "flow-row");
      const playerRow = document.createElement("div");
      playerRow.classList.add("mp-staging__focusable-row", "player-info", "items-center", "w-full", "flow-row");
      Databind.attribute(playerRow, "index", "rowIndex");
      {
        const closeHeaderDropdownAndDivider = document.createElement("div");
        closeHeaderDropdownAndDivider.classList.add(
          "dropdown-and-divider",
          "flex-3",
          "flow-row",
          "items-stretch",
          "-my-px"
        );
        const closedHeaderDropdown = document.createElement("lobby-playerinfocard-dropdown");
        closedHeaderDropdown.setAttribute("data-tooltip-anchor", "left");
        closedHeaderDropdown.classList.add("mp-staging__focusable-slot", "my-0\\.5", "flex");
        closedHeaderDropdown.setAttribute("container-class", "border-accent-5 border");
        closedHeaderDropdown.setAttribute("bg-class", "bg-primary-5 opacity-50");
        Databind.attribute(closedHeaderDropdown, "optionID", "player.playerInfoDropdown.id");
        Databind.attribute(
          closedHeaderDropdown,
          "dropdown-items",
          "player.playerInfoDropdown.serializedItemList"
        );
        Databind.attribute(
          closedHeaderDropdown,
          "selected-item-index",
          "player.playerInfoDropdown.selectedItemIndex"
        );
        Databind.attribute(
          closedHeaderDropdown,
          "items-tooltips",
          "player.playerInfoDropdown.serializedItemTooltips"
        );
        Databind.attribute(closedHeaderDropdown, "disabled", "player.playerInfoDropdown.isDisabled");
        Databind.attribute(closedHeaderDropdown, "data-player-id", "player.playerID");
        Databind.attribute(
          closedHeaderDropdown,
          "data-dropdown-type",
          "player.playerInfoDropdown.dropdownType"
        );
        Databind.attribute(
          closedHeaderDropdown,
          "data-player-param",
          "player.playerInfoDropdown.playerParamName"
        );
        closedHeaderDropdown.addEventListener(
          DropdownSelectionChangeEventName,
          this.onSlotDropdownSelectionChange.bind(this)
        );
        closeHeaderDropdownAndDivider.appendChild(closedHeaderDropdown);
        closeRow.appendChild(closeHeaderDropdownAndDivider);
      }
      const closeTeamParamSpace = document.createElement("div");
      closeTeamParamSpace.classList.add("flex-1");
      closeRow.appendChild(closeTeamParamSpace);
      const closeCivParamSpace = document.createElement("div");
      closeCivParamSpace.classList.add("flex-1");
      closeRow.appendChild(closeCivParamSpace);
      const closeLeaderParamSpace = document.createElement("div");
      closeLeaderParamSpace.classList.add("flex-2");
      closeRow.appendChild(closeLeaderParamSpace);
      if (!Configuration.getGame().isHotseat) {
        const closeReadySpace = document.createElement("div");
        closeReadySpace.classList.add("mp-staging__ready-slot");
        closeRow.appendChild(closeReadySpace);
        const closeKickSpace = document.createElement("div");
        closeKickSpace.classList.add("mp-staging__kick-slot");
        Databind.classToggle(closeKickSpace, "hidden", "{{g_MPLobbyModel.isKickOptionHidden}}");
        closeRow.appendChild(closeKickSpace);
      }
      {
        const playerInfoDropdownAndDivider = document.createElement("div");
        playerInfoDropdownAndDivider.classList.add(
          "dropdown-and-divider",
          "flex-3",
          "flow-row",
          "items-stretch",
          "-my-px",
          "relative",
          "-ml-4"
        );
        const playerInfoDropdown = document.createElement("lobby-playerinfocard-dropdown");
        playerInfoDropdown.setAttribute("data-tooltip-anchor", "left");
        playerInfoDropdown.setAttribute("has-background", "false");
        playerInfoDropdown.classList.add("mp-staging__focusable-slot", "my-0\\.5", "flex");
        playerInfoDropdown.setAttribute("container-class", "border-accent-5 border");
        Databind.attribute(playerInfoDropdown, "optionID", "player.playerInfoDropdown.id");
        Databind.attribute(
          playerInfoDropdown,
          "dropdown-items",
          "player.playerInfoDropdown.serializedItemList"
        );
        Databind.attribute(
          playerInfoDropdown,
          "selected-item-index",
          "player.playerInfoDropdown.selectedItemIndex"
        );
        Databind.attribute(
          playerInfoDropdown,
          "items-tooltips",
          "player.playerInfoDropdown.serializedItemTooltips"
        );
        Databind.attribute(playerInfoDropdown, "disabled", "player.playerInfoDropdown.isDisabled");
        Databind.attribute(playerInfoDropdown, "data-player-id", "player.playerID");
        Databind.attribute(playerInfoDropdown, "data-dropdown-type", "player.playerInfoDropdown.dropdownType");
        Databind.attribute(
          playerInfoDropdown,
          "data-player-param",
          "player.playerInfoDropdown.playerParamName"
        );
        Databind.attribute(playerInfoDropdown, "is-local", "player.isLocal");
        Databind.attribute(playerInfoDropdown, "tooltip", "player.playerInfoDropdown.tooltip");
        playerInfoDropdown.addEventListener(
          DropdownSelectionChangeEventName,
          this.onSlotDropdownSelectionChange.bind(this)
        );
        playerInfoDropdownAndDivider.appendChild(playerInfoDropdown);
        playerInfoFrame.appendChild(playerInfoDropdownAndDivider);
      }
      {
        const teamDropdownAndDivider = document.createElement("div");
        teamDropdownAndDivider.classList.add(
          "team-dropdown-and-divider",
          "flex-1",
          "flow-row",
          "items-stretch",
          "relative"
        );
        const teamDropdown = document.createElement("team-dropdown");
        teamDropdown.setAttribute("data-tooltip-anchor", "left");
        teamDropdown.setAttribute("has-border", "false");
        teamDropdown.setAttribute("has-background", "false");
        teamDropdown.classList.add("mp-staging__focusable-slot", "my-1", "mx-0\\.5", "flex", "flex-auto");
        teamDropdown.setAttribute("index", "1");
        teamDropdown.setAttribute("no-selection-caption", " ");
        teamDropdown.setAttribute("label-class", "absolute font-body-xl text-white text-shadow");
        Databind.attribute(teamDropdown, "optionID", "player.teamDropdown.id");
        Databind.attribute(teamDropdown, "dropdown-items", "player.teamDropdown.serializedItemList");
        Databind.attribute(teamDropdown, "selected-item-index", "player.teamDropdown.selectedItemIndex");
        Databind.attribute(teamDropdown, "items-tooltips", "player.teamDropdown.serializedItemTooltips");
        Databind.attribute(teamDropdown, "data-tooltip-content", "player.teamDropdown.selectedItemTooltip");
        Databind.attribute(teamDropdown, "disabled", "player.teamDropdown.isDisabled");
        Databind.attribute(teamDropdown, "data-player-id", "player.playerID");
        Databind.attribute(teamDropdown, "data-dropdown-type", "player.teamDropdown.dropdownType");
        Databind.attribute(teamDropdown, "data-player-param", "player.teamDropdown.playerParamName");
        Databind.attribute(
          teamDropdown,
          "show-label-on-selected-item",
          "player.teamDropdown.showLabelOnSelectedItem"
        );
        teamDropdown.addEventListener(
          DropdownSelectionChangeEventName,
          this.onSlotDropdownSelectionChange.bind(this)
        );
        teamDropdownAndDivider.appendChild(teamDropdown);
        this.createDivider(teamDropdownAndDivider);
        playerInfoFrame.appendChild(teamDropdownAndDivider);
      }
      {
        const civilizationDropdownAndDivider = document.createElement("div");
        civilizationDropdownAndDivider.classList.add(
          "civ-dropdown-and-divider",
          "flex-1",
          "flow-row",
          "items-stretch",
          "relative"
        );
        const civilizationDropdown = document.createElement("lobby-dropdown");
        civilizationDropdown.setAttribute("data-tooltip-anchor", "left");
        civilizationDropdown.setAttribute("has-border", "false");
        civilizationDropdown.setAttribute("has-background", "false");
        civilizationDropdown.classList.add(
          "mp-staging__focusable-slot",
          "my-1",
          "mx-0\\.5",
          "flex",
          "flex-auto"
        );
        civilizationDropdown.setAttribute("index", "1");
        civilizationDropdown.setAttribute(
          "icon-container-innerhtml",
          "<div class='img-prof-btn-bg absolute w-16 h-16'></div>"
        );
        Databind.attribute(civilizationDropdown, "optionID", "player.civilizationDropdown.id");
        Databind.attribute(
          civilizationDropdown,
          "dropdown-items",
          "player.civilizationDropdown.serializedItemList"
        );
        Databind.attribute(
          civilizationDropdown,
          "selected-item-index",
          "player.civilizationDropdown.selectedItemIndex"
        );
        Databind.attribute(
          civilizationDropdown,
          "items-tooltips",
          "player.civilizationDropdown.serializedItemTooltips"
        );
        Databind.attribute(
          civilizationDropdown,
          "data-tooltip-content",
          "player.civilizationDropdown.selectedItemTooltip"
        );
        Databind.attribute(civilizationDropdown, "disabled", "player.civilizationDropdown.isDisabled");
        Databind.attribute(civilizationDropdown, "data-player-id", "player.playerID");
        Databind.attribute(
          civilizationDropdown,
          "data-dropdown-type",
          "player.civilizationDropdown.dropdownType"
        );
        Databind.attribute(
          civilizationDropdown,
          "data-player-param",
          "player.civilizationDropdown.playerParamName"
        );
        Databind.attribute(
          civilizationDropdown,
          "show-label-on-selected-item",
          "player.civilizationDropdown.showLabelOnSelectedItem"
        );
        civilizationDropdown.addEventListener(
          DropdownSelectionChangeEventName,
          this.onSlotDropdownSelectionChange.bind(this)
        );
        civilizationDropdownAndDivider.appendChild(civilizationDropdown);
        this.createDivider(civilizationDropdownAndDivider);
        playerInfoFrame.appendChild(civilizationDropdownAndDivider);
      }
      {
        const leaderDropdownAndDivider = document.createElement("div");
        leaderDropdownAndDivider.classList.add(
          "dropdown-and-divider",
          "flex",
          "flow-row",
          "items-stretch",
          "flex-2",
          "relative"
        );
        const leaderDropdown = document.createElement("leader-dropdown");
        leaderDropdown.setAttribute("data-tooltip-anchor", "left");
        leaderDropdown.setAttribute("has-border", "false");
        leaderDropdown.setAttribute("has-background", "false");
        leaderDropdown.classList.add("mp-staging__focusable-slot", "my-1", "mx-0\\.5", "flex", "flex-auto");
        if (Configuration.getGame().isHotseat) {
          leaderDropdown.classList.add("mp-leader-dropdown-hotseat");
        }
        leaderDropdown.setAttribute("index", "2");
        leaderDropdown.setAttribute(
          "icon-container-innerhtml",
          "<div class='img-shell_base-ring-focus absolute w-16 h-16 tint-bg-primary-3'></div><div class='img-shell_leader-xp-ring absolute w-16 h-16 tint-bg-primary-1'></div>"
        );
        Databind.attribute(leaderDropdown, "optionID", "player.leaderDropdown.id");
        Databind.attribute(leaderDropdown, "dropdown-items", "player.leaderDropdown.serializedItemList");
        Databind.attribute(leaderDropdown, "selected-item-index", "player.leaderDropdown.selectedItemIndex");
        Databind.attribute(leaderDropdown, "items-tooltips", "player.leaderDropdown.serializedItemTooltips");
        Databind.attribute(leaderDropdown, "data-tooltip-content", "player.leaderDropdown.selectedItemTooltip");
        Databind.attribute(leaderDropdown, "disabled", "player.leaderDropdown.isDisabled");
        Databind.attribute(leaderDropdown, "data-player-id", "player.playerID");
        Databind.attribute(leaderDropdown, "data-dropdown-type", "player.leaderDropdown.dropdownType");
        Databind.attribute(leaderDropdown, "data-player-param", "player.leaderDropdown.playerParamName");
        Databind.attribute(
          leaderDropdown,
          "show-label-on-selected-item",
          "player.leaderDropdown.showLabelOnSelectedItem"
        );
        Databind.attribute(leaderDropdown, "mementos", "player.mementos");
        Databind.attribute(leaderDropdown, "has-memento", "player.isMementoEnabled");
        leaderDropdown.addEventListener(
          DropdownSelectionChangeEventName,
          this.onSlotDropdownSelectionChange.bind(this)
        );
        leaderDropdownAndDivider.appendChild(leaderDropdown);
        this.createDivider(leaderDropdownAndDivider);
        playerInfoFrame.appendChild(leaderDropdownAndDivider);
      }
      if (!Configuration.getGame().isHotseat) {
        const readyIndicatorContainer = document.createElement("div");
        readyIndicatorContainer.classList.add(
          "flow-row",
          "justify-center",
          "mp-staging__ready-slot",
          "items-center"
        );
        const readyIndicator = document.createElement("fxs-activatable");
        readyIndicator.classList.add("w-12", "h-12", "group", "relative", "mp-staging__focusable-slot");
        readyIndicator.setAttribute("tabindex", "-1");
        readyIndicator.setAttribute(
          "data-bind-attributes",
          "{'disabled':({{player.isLocal}}&&{{g_MPLobbyModel.readyStatus}}!='WAITING_FOR_HOST')?'false':'true'}"
        );
        readyIndicator.addEventListener(ActionActivateEventName, this.readyIndicatorActivateListener);
        const readyIndicatorReady = document.createElement("div");
        readyIndicatorReady.classList.add("img-hud-civic-complete", "absolute", "-inset-1");
        Databind.classToggle(readyIndicatorReady, "hidden", "!{{player.isReady}} && {{player.isHuman}}");
        const readyIndicatorNotReady = document.createElement("div");
        readyIndicatorNotReady.classList.add("img-civics-icon-frame", "absolute", "-inset-1");
        Databind.classToggle(readyIndicatorNotReady, "hidden", "{{player.isReady}} || !{{player.isHuman}}");
        const readyIndicatorNotReadyHover = document.createElement("div");
        readyIndicatorNotReadyHover.classList.add(
          "techtree-icon-empty-highlight",
          "absolute",
          "-inset-0\\.5",
          "transition-opacity",
          "opacity-0",
          "group-hover\\:opacity-100",
          "group-focus\\:opacity-100",
          "group-pressed\\:opacity-100"
        );
        Databind.classToggle(
          readyIndicatorNotReadyHover,
          "hidden",
          "{{player.isReady}} || !{{player.isHuman}}"
        );
        const readyIndicatorContainerHighlight = document.createElement("div");
        readyIndicatorContainerHighlight.classList.add(
          "absolute",
          "-inset-6",
          "pointer-events-none",
          "img-popup_icon_glow",
          "opacity-0",
          "transition-opacity",
          "group-hover\\:opacity-100",
          "group-focus\\:opacity-100",
          "group-pressed\\:opacity-100"
        );
        readyIndicator.appendChild(readyIndicatorContainerHighlight);
        readyIndicator.appendChild(readyIndicatorNotReady);
        readyIndicator.appendChild(readyIndicatorNotReadyHover);
        readyIndicator.appendChild(readyIndicatorReady);
        readyIndicatorContainer.appendChild(readyIndicator);
        playerInfoFrame.appendChild(readyIndicatorContainer);
      }
      playerRow.appendChild(playerInfoFrame);
      const kickButtonContainer = document.createElement("div");
      kickButtonContainer.classList.add("flow-row", "justify-center", "mp-staging__kick-slot");
      const kickButton = document.createElement("fxs-activatable");
      kickButton.classList.add("mp-staging__focusable-slot", "w-8", "h-8", "relative", "group");
      Databind.if(kickButton, "player.canEverBeKicked");
      {
        kickButton.classList.add("kick-button");
        kickButton.setAttribute(
          "data-bind-attributes",
          "{'disabled':{{player.canBeKickedNow}}?'false':'true'}"
        );
        kickButton.setAttribute("tabindex", "-1");
        Databind.attribute(kickButton, "data-player-id", "player.playerID");
        Databind.attribute(kickButton, "is-target", "player.isKickVoteTarget");
        Databind.attribute(kickButton, "data-tooltip-content", "player.kickTooltip");
        kickButton.addEventListener("action-activate", this.onKick.bind(this));
      }
      const kickButtonBg = document.createElement("div");
      kickButtonBg.classList.add("img-close-button", "absolute", "inset-0");
      Databind.classToggle(kickButtonBg, "tint-bg-accent-5", "!{{player.canBeKickedNow}}");
      const kickButtonHighlight = document.createElement("div");
      kickButtonHighlight.classList.add(
        "absolute",
        "inset-0",
        "img-dropdown-box-focus",
        "opacity-0",
        "group-focus\\:opacity-100",
        "group-hover\\:opacity-100",
        "group-pressed\\:opacity-100"
      );
      Databind.if(kickButtonHighlight, "{{g_NavTray.isTrayRequired}} || {{g_ActionHandler.isTouchActive}}");
      Databind.classToggle(kickButtonHighlight, "transition-opacity", "!{{g_ActionHandler.isTouchActive}}");
      kickButton.appendChild(kickButtonBg);
      kickButton.appendChild(kickButtonHighlight);
      kickButtonContainer.appendChild(kickButton);
      playerRow.appendChild(kickButtonContainer);
      Databind.classToggle(kickButtonContainer, "hidden", "{{g_MPLobbyModel.isKickOptionHidden}}");
      playerInfo.appendChild(closeRow);
      Databind.if(closeRow, "!{{player.isParticipant}}");
      playerInfo.appendChild(playerRow);
      Databind.if(playerRow, "player.isParticipant");
    }
    playerInfoContainer.appendChild(playerInfo);
    playerInfoScrollable.appendChild(playerInfoContainer);
    this.playerInfoSlot.appendChild(playerInfoScrollable);
    this.backButton.addEventListener("action-activate", this.close.bind(this));
    const hideMementos = !Configuration.getGame().isMementosEnabled;
    mementosButton.addEventListener("action-activate", this.mementosButtonActivateListener);
    mementosButton.classList.toggle("hidden", hideMementos);
    Databind.if(mementosButton, `!{{g_NavTray.isTrayRequired}}`);
    Databind.classToggle(this.readyHeader, "hidden", "{{g_MPLobbyModel.isReadyOptionHidden}}");
    Databind.classToggle(this.kickHeader, "hidden", "{{g_MPLobbyModel.isKickOptionHidden}}");
    this.viewAllRulesButtonTop.addEventListener("action-activate", this.onViewAllRules.bind(this));
    Databind.if(this.viewAllRulesButtonTop, `!{{g_NavTray.isTrayRequired}}`);
    this.viewAllRulesButtonBot.addEventListener("action-activate", this.onViewAllRules.bind(this));
    Databind.if(this.viewAllRulesButtonFarBot, `!{{g_NavTray.isTrayRequired}}`);
    this.viewAllRulesButtonFarBot.addEventListener("action-activate", this.onViewAllRules.bind(this));
    this.readyButton.addEventListener("action-activate", this.onReady.bind(this));
    this.readyButton.setAttribute("data-audio-group-ref", "multiplayer-lobby");
    this.readyButton.setAttribute("data-audio-press-ref", "data-audio-ready-button-press");
    this.readyButton.setAttribute("data-audio-activate-ref", "data-audio-ready-button-activate");
    this.readyButtonLoadingContainer = MustGetElement(".mp-staging__ring-meter__loading", this.Root);
    this.createLoadingAnimation(this.readyButtonLoadingContainer);
    this.updatePlayerInfoSlot();
    const model = this.MPLobbyDataModelProxy.access();
    model.updateGlobalCountdownData();
    if (ContextManager.hasInstanceOf("screen-save-load")) {
      ContextManager.pop("screen-save-load");
    }
    Network.isMultiplayerLobbyShown(true);
  }
  onDetach() {
    super.onDetach();
    window.removeEventListener("resize", this.resizeListener);
    window.removeEventListener(LobbyUpdateEventName, this.lobbyUpdateListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeChangeListener);
    engine.off(ContextManagerEvents.OnChanged, this.onContextChange, this);
    Network.isMultiplayerLobbyShown(false);
    if (this.multiplayerChatHandle != null) {
      this.multiplayerChatHandle.clear();
      this.multiplayerChatHandle = null;
    }
    this.MPLobbyDataModelProxy.disconnect();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    switch (this.focusState) {
      case "CHAT" /* CHAT */:
        if (this.chat) {
          FocusManager.get().setFocus(this.chat);
        }
        this.updateFocusState();
        break;
      case "PLAYER_SLOT" /* PLAYER_SLOT */:
      case "CHAT_DIALOG" /* CHAT_DIALOG */:
        waitForLayout(() => {
          if (!ContextManager.hasInstanceOf("screen-mp-lobby") || ContextManager.getCurrentTarget() != this.Root) {
            return;
          }
          FocusManager.get().setFocus(this.playerInfoSlot);
          this.updateFocusState();
        });
        break;
    }
    this.updateToggleNavHelp();
    this.updateChatNavHelp();
    this.updateNavTray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  isSmallScreen() {
    return window.innerHeight <= Layout.pixelsToScreenPixels(SMALL_SCREEN_MODE_MAX_HEIGHT) || window.innerWidth <= Layout.pixelsToScreenPixels(SMALL_SCREEN_MODE_MAX_WIDTH);
  }
  onPlayerInfoFocus = () => {
    this.updateFocusState();
    this.updateChatNavHelp();
    this.updateNavTray();
    this.updateToggleNavHelp();
  };
  createDivider(parent) {
    const dividerContainer = document.createElement("div");
    dividerContainer.classList.add("items-center", "flow-row");
    const divider = document.createElement("div");
    divider.classList.add("img-seperator-col-accent-5", "h-0\\.5", "w-10", "-mx-5");
    dividerContainer.appendChild(divider);
    parent.appendChild(dividerContainer);
  }
  createLoadingAnimation(parent) {
    const flipbook = document.createElement("fxs-flipbook");
    flipbook.setAttribute("data-bind-if", "{{g_MPLobbyModel.readyStatus}}=='WAITING_FOR_HOST'");
    const atlas = [
      {
        src: "fs://game/hourglasses01.png",
        spriteWidth: 64,
        spriteHeight: 64,
        size: 256
      },
      {
        src: "fs://game/hourglasses02.png",
        spriteWidth: 64,
        spriteHeight: 64,
        size: 256
      },
      {
        src: "fs://game/hourglasses03.png",
        spriteWidth: 64,
        spriteHeight: 64,
        size: 512,
        nFrames: 13
      }
    ];
    const flipbookDefinition = {
      fps: 30,
      preload: true,
      atlas
    };
    flipbook.setAttribute("data-flipbook-definition", JSON.stringify(flipbookDefinition));
    parent.appendChild(flipbook);
  }
  onPlayerInfoEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const model = this.MPLobbyDataModelProxy.access();
    switch (inputEvent.detail.name) {
      case "cancel":
      case "mousebutton-right":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-1":
        if (model.canEditMementos && !model.isLocalPlayerReady) {
          this.openMementos();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "shell-action-2":
        this.viewAllRules(inputEvent);
        break;
      case "shell-action-3":
        if (Network.hasCommunicationsPrivilege(false) && !Configuration.getGame().isHotseat) {
          if (this.isSmallScreen()) {
            this.openChat();
            inputEvent.stopPropagation();
            inputEvent.preventDefault();
          } else {
            if (this.chat) {
              FocusManager.get().setFocus(this.chat);
            }
            this.updateFocusState();
            this.updateToggleNavHelp();
            inputEvent.stopPropagation();
            inputEvent.preventDefault();
          }
        }
        break;
    }
  }
  onPlayerInfoNavigateInput(navigationEvent) {
    const live = this.handlePlayerInfoNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handlePlayerInfoNavigation(navigationEvent) {
    let live = true;
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return live;
    }
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.SHELL_PREVIOUS:
        if (this.shouldShowJoinCode) {
          this.showJoinCode();
          Audio.playSound("data-audio-show-code-activate", "multiplayer-lobby");
          live = false;
        }
        break;
      case InputNavigationAction.SHELL_NEXT:
        this.updateReadyStatus();
        live = false;
        Audio.playSound("data-audio-ready-button-activate", "multiplayer-lobby");
        break;
    }
    return live;
  }
  refreshShowJoinCodeCaption() {
    const joinCode = this.MPLobbyDataModelProxy.access().joinCode;
    this.showJoinCodeButtonTop.setAttribute(
      "caption",
      this.joinCodeShown ? joinCode : "LOC_UI_MP_LOBBY_SHOW_JOIN_CODE"
    );
    this.showJoinCodeButtonBot.setAttribute(
      "caption",
      this.joinCodeShown ? joinCode : "LOC_UI_MP_LOBBY_SHOW_JOIN_CODE"
    );
  }
  showJoinCode(inputEvent) {
    if (inputEvent) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    this.joinCodeShown = !this.joinCodeShown;
    this.refreshShowJoinCodeCaption();
  }
  onShowJoinCode() {
    this.showJoinCode();
  }
  onSlotDropdownSelectionChange(event) {
    this.MPLobbyDataModelProxy.access().onLobbyDropdown(event);
  }
  onKick(event) {
    const target = event.target;
    if (target == null) {
      console.error("mp-staging-new: onKick(): Invalid event target. It should be an HTMLElement");
      return;
    }
    const kickPlayerIDStr = target.getAttribute("data-player-id");
    if (kickPlayerIDStr == null) {
      console.error("mp-staging-new: onKick(): Invalid data-player-id attribute");
      return;
    }
    const kickPlayerID = parseInt(kickPlayerIDStr);
    this.MPLobbyDataModelProxy.access().kick(kickPlayerID);
  }
  viewAllRules(inputEvent) {
    if (inputEvent) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    ContextManager.push("screen-mp-game-rules", {
      singleton: true,
      createMouseGuard: true,
      attributes: { blackOut: true }
    });
  }
  onViewAllRules() {
    this.viewAllRules();
  }
  updateReadyStatus(inputEvent) {
    if (inputEvent) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    this.MPLobbyDataModelProxy.access().onGameReady();
  }
  onReadyIndicatorActivate(_event) {
    this.onReady();
  }
  onReady() {
    this.updateReadyStatus();
    window.dispatchEvent(new StartCampaignEvent());
  }
  onResize() {
    this.updateHeaderSpacing();
    this.updateLeftSection();
    this.updateNavTray();
    this.updatePlayerInfoSlot();
    this.updateReadyButtonContainer();
    this.updateReadyDescriptionContainer();
    this.updateBotSection();
    this.updateBotSection2();
    this.updateShowJoinCodeButton();
    this.updateViewAllRulesFarBot();
    this.updateViewRuleButton();
    this.updateFrame();
  }
  updateLeftSection() {
    this.leftSectionTop.classList.toggle("hidden", !this.isSmallScreen());
    this.leftSectionHeader.classList.toggle("hidden", this.isSmallScreen());
    this.leftSectionContent.classList.toggle("hidden", this.isSmallScreen());
  }
  updateHeaderSpacing() {
    this.headerSpacings.forEach((headerSpacing) => {
      headerSpacing.classList.toggle("w-84", this.isSmallScreen());
      headerSpacing.classList.toggle("w-128", !this.isSmallScreen());
    });
  }
  updateBotSection() {
    this.botSection.classList.toggle("justify-between", !this.isSmallScreen());
    this.botSection.classList.toggle("justify-start", this.isSmallScreen());
  }
  updateBotSection2() {
    this.botSection2.classList.toggle("flex-auto", this.isSmallScreen());
  }
  updateReadyButtonContainer() {
    this.readyButtonContainer.classList.toggle("justify-center", !this.isSmallScreen());
    this.readyButtonContainer.classList.toggle("justify-end", this.isSmallScreen());
    this.readyButtonContainer.classList.toggle("right-28", this.isSmallScreen());
    this.readyButtonContainer.classList.toggle("-bottom-3", this.isSmallScreen());
    this.readyButtonContainer.classList.toggle("hidden", this.isSmallScreen() && this.isMobileViewExperience);
  }
  updateReadyDescriptionContainer() {
    this.readyDescriptionContainer.classList.toggle(
      "hidden",
      !this.isSmallScreen() || !this.isMobileViewExperience
    );
  }
  updateShowJoinCodeButton() {
    this.showJoinCodeButtonTop.classList.toggle("hidden", !this.isSmallScreen() || !this.shouldShowJoinCode);
    this.showJoinCodeButtonBot.classList.toggle("hidden", this.isSmallScreen() || !this.shouldShowJoinCode);
  }
  updateViewAllRulesFarBot() {
    this.viewAllRulesButtonFarBot.classList.toggle("hidden", !this.isSmallScreen());
  }
  updateFrame() {
    this.frame.setAttribute("outside-safezone-mode", this.isSmallScreen() ? "full" : "vertical");
  }
  onMementosButtonActivate() {
    this.openMementos();
  }
  openMementos() {
    ContextManager.push("memento-editor", {
      singleton: true,
      createMouseGuard: true,
      attributes: { blackOut: true }
    });
  }
  onToggleChatActivate() {
    this.openChat();
  }
  openChat() {
    ContextManager.push("panel-mp-lobby-chat", { singleton: true, createMouseGuard: true });
    this.updateFocusState();
    this.updateToggleNavHelp();
  }
  onLobbyUpdate() {
    waitForLayout(() => {
      this.updateNavTray();
      if (this.focusState != "PLAYER_SLOT" /* PLAYER_SLOT */ || ContextManager.getCurrentTarget() != this.Root) {
        return;
      }
      if (!this.playerInfoSlot.contains(FocusManager.get().currentFocus())) {
        FocusManager.get().setFocus(this.playerInfoSlot);
      }
    });
  }
  onChatFocus(_event) {
    waitForLayout(() => {
      this.updateFocusState();
      this.updateChatNavHelp();
      this.updateNavTray();
      this.updateToggleNavHelp();
    });
  }
  onContextChange(_event) {
    this.updateToggleNavHelp();
  }
  onActiveDeviceTypeChange(_event) {
    this.updatePlayerInfoSlot();
  }
  onProfileAccountLoggedOut(_event) {
    this.close();
  }
  onChatEngineInput(event) {
    if (this.handleChatEngineInput(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  handleChatEngineInput({ detail: { status, name } }) {
    if (status != InputActionStatuses.FINISH) {
      return false;
    }
    switch (name) {
      case "cancel":
        FocusManager.get().setFocus(this.playerInfoSlot);
        this.updateFocusState();
        this.updateToggleNavHelp();
        return true;
    }
    return false;
  }
  updateToggleNavHelp() {
    this.Root.classList.toggle("trigger-nav-help", this.focusState == "PLAYER_SLOT" /* PLAYER_SLOT */);
    this.chatFrame.classList.toggle(
      "trigger-nav-help",
      this.focusState == "CHAT" /* CHAT */ && !ContextManager.hasInstanceOf("send-to-panel") && !ContextManager.hasInstanceOf("emoticon-panel")
    );
  }
  updateChatNavHelp() {
    if (Configuration.getGame().isHotseat) {
      return;
    }
    const currentFocus = FocusManager.get().currentFocus();
    this.chatNavHelp?.setAttribute(
      "action-key",
      this.chat == currentFocus || this.chat?.contains(FocusManager.get().currentFocus()) ? "inline-cancel" : "inline-shell-action-3"
    );
  }
  updatePlayerInfoSlot() {
    this.playerInfoSlot.classList.toggle("mb-28", !this.isSmallScreen() && !ActionHandler.isGamepadActive);
    this.playerInfoSlot.classList.toggle("mb-40", !this.isSmallScreen() && ActionHandler.isGamepadActive);
    this.playerInfoSlot.classList.toggle(
      "mb-36",
      this.isSmallScreen() && ActionHandler.isGamepadActive && !this.isMobileViewExperience
    );
    this.playerInfoSlot.classList.toggle(
      "mb-24",
      this.isSmallScreen() && !ActionHandler.isGamepadActive && !this.isMobileViewExperience
    );
    this.playerInfoSlot.classList.toggle("mb-0", this.isSmallScreen() && this.isMobileViewExperience);
  }
  updateViewRuleButton() {
    this.viewAllRulesButtonTop.classList.toggle("hidden", !this.isSmallScreen() || this.isMobileViewExperience);
    this.viewAllRulesButtonFarBot.classList.toggle("hidden", !this.isSmallScreen() || !this.isMobileViewExperience);
    this.viewAllRulesButtonBot.classList.toggle("hidden", this.isSmallScreen());
    if (this.isMobileViewExperience) {
      this.viewAllRulesButtonTop.setAttribute("caption", "LOC_UI_MP_HEADER_RULES");
      this.viewAllRulesButtonFarBot.setAttribute("caption", "LOC_UI_MP_HEADER_RULES");
      this.viewAllRulesButtonBot.setAttribute("caption", "LOC_UI_MP_HEADER_RULES");
    }
  }
  updateFocusState() {
    if (ContextManager.hasInstanceOf("panel-mp-lobby-chat")) {
      this.focusState = "CHAT_DIALOG" /* CHAT_DIALOG */;
    } else {
      this.focusState = this.chat?.contains(FocusManager.get().currentFocus()) ? "CHAT" /* CHAT */ : "PLAYER_SLOT" /* PLAYER_SLOT */;
    }
  }
  updateNavTray() {
    if (this.Root != ContextManager.getCurrentTarget()) {
      return;
    }
    NavTray.clear();
    if (this.focusState == "CHAT" /* CHAT */) {
      return;
    }
    NavTray.addOrUpdateGenericBack();
    if (this.MPLobbyDataModelProxy.access().canEditMementos) {
      NavTray.addOrUpdateShellAction1("LOC_UI_MP_MEMENTO");
    }
    if (this.isSmallScreen()) {
      NavTray.addOrUpdateShellAction2("LOC_UI_MP_LOBBY_RULES");
      if (Network.hasCommunicationsPrivilege(false) && !Configuration.getGame().isHotseat) {
        NavTray.addOrUpdateShellAction3("LOC_UI_MP_CHAT");
      }
      if (this.isMobileViewExperience) {
        if (this.MPLobbyDataModelProxy.access().isLocalPlayerReady) {
          NavTray.addOrUpdateNavShellNext("LOC_UI_MP_LOBBY_NAVTRAY_UNREADY");
        } else {
          NavTray.addOrUpdateNavShellNext("LOC_UI_MP_LOBBY_NAVTRAY_READY");
        }
      }
    }
  }
  close() {
    this.MPLobbyDataModelProxy.access().cancelGlobalCountdown();
    Network.leaveMultiplayerGame();
    let lastHumanCount = 0;
    let lastParticipantCount = 0;
    this.MPLobbyDataModelProxy.access().lobbyPlayersData.forEach((playerData) => {
      if (playerData.isHuman) {
        lastHumanCount++;
      }
      if (playerData.isParticipant) {
        lastParticipantCount++;
      }
    });
    MultiplayerShellManager.exitMPGame("", "");
    window.dispatchEvent(
      new SendCampaignSetupTelemetryEvent(CampaignSetupType.Abandon, lastHumanCount, lastParticipantCount)
    );
    super.close();
  }
}
Controls.define("screen-mp-lobby", {
  createInstance: PanelMPLobby,
  description: "lobby screen for multiplayer.",
  classNames: ["mp-lobby", "fullscreen", "flow-row", "justify-center", "items-center", "flex-1"],
  innerHTML: [content],
  attributes: []
});
class PanelMPChat extends Panel {
  closeButton;
  chat;
  closeButtonActivateListener = this.onCloseButtonActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
  }
  onInitialize() {
    super.onInitialize();
    this.Root.innerHTML = `
			<div class="flex-auto relative pl-2 pt-3 pb-3 mp-staging__chat-panel w-full h-full" data-bind-class-toggle="pb-16:{{g_NavTray.isTrayRequired}}">
				<screen-mp-chat class="flex-auto"></screen-mp-chat>
				<fxs-close-button></fxs-close-button>
			</div>
		`;
    this.closeButton = MustGetElement("fxs-close-button", this.Root);
    this.closeButton.classList.add("top-3");
    this.chat = MustGetElement("screen-mp-chat", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    this.playAnimateInSound();
    this.closeButton.addEventListener("action-activate", this.closeButtonActivateListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
  }
  onDetach() {
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.get().setFocus(this.chat);
    this.updateNavTray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onCloseButtonActivate() {
    this.close();
  }
  onEngineInput(event) {
    if (this.handleEngineInput(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  handleEngineInput({ detail: { status, name } }) {
    if (status != InputActionStatuses.FINISH) {
      return false;
    }
    switch (name) {
      case "cancel":
      case "keyboard-escape":
        this.close();
        return true;
    }
    return false;
  }
  updateNavTray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
}
Controls.define("panel-mp-lobby-chat", {
  createInstance: PanelMPChat,
  description: "lobby screen for multiplayer.",
  classNames: ["panel-mp-lobby-chat", "fullscreen", "flow-row", "items-start", "flex-1"],
  styles: [styles],
  attributes: [],
  tabIndex: -1
});
//# sourceMappingURL=mp-staging-new.js.map
