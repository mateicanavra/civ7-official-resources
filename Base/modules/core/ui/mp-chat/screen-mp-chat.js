import { TtsManager } from '../accessibility/tts-manager.js';
import { A as Audio } from '../audio-base/audio-support.chunk.js';
import ContextManager, { ContextManagerEvents } from '../context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import FocusManager from '../input/focus-manager.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';
import { P as Panel } from '../panel-support.chunk.js';
import { MustGetElement } from '../utilities/utilities-dom.chunk.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../views/view-manager.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';

var NotificationType = /* @__PURE__ */ ((NotificationType2) => {
  NotificationType2["PLAYER"] = "Player";
  NotificationType2["ERROR"] = "Error";
  NotificationType2["HELP"] = "Help";
  return NotificationType2;
})(NotificationType || {});
var NotificationClassNames = /* @__PURE__ */ ((NotificationClassNames2) => {
  NotificationClassNames2["PLAYER"] = "player-message";
  NotificationClassNames2["ERROR"] = "error-message";
  NotificationClassNames2["HELP"] = "help-message";
  return NotificationClassNames2;
})(NotificationClassNames || {});
class ChatCommandManager {
  chatComponent;
  chatCommands = /* @__PURE__ */ new Map();
  chatCommandConfigs = [];
  constructor(component) {
    this.chatComponent = component;
  }
  selectCommand(message) {
    const splitMessage = message.trim().split(" ");
    const firstWord = splitMessage[0];
    const isCommand = firstWord.startsWith("/");
    if (isCommand) {
      const commandPrompt = firstWord.slice(1);
      if (commandPrompt.length > 0) {
        const selectedCommand = this.chatCommands.get(commandPrompt);
        if (selectedCommand == void 0) {
          this.chatComponent.setCommandError(
            Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_UNKNOWN", commandPrompt)
          );
          console.warn(`screen-mp-chat: Unknown command '/${commandPrompt}'`);
          return;
        }
        const selectedCommandConfig = selectedCommand.commandConfig;
        const argumentMessage = splitMessage.slice(1);
        const commandArguments = argumentMessage.slice(
          0,
          selectedCommandConfig.commandArguments.length
        );
        const messageContent = argumentMessage.splice(selectedCommandConfig.commandArguments.length).join(" ");
        selectedCommandConfig.commandHandler(commandArguments, messageContent, this.chatComponent);
      }
    }
  }
  // command definitions to register
  registerCommands() {
    const helpCommandConfig = {
      description: Locale.compose("LOC_UI_CHAT_COMMAND_DESC_HELP"),
      commandArguments: [],
      helpArguments: [],
      commandHandler: this.helpCommandHandler.bind(this)
    };
    const helpCommand = {
      commandPrompts: [
        Locale.compose("LOC_UI_CHAT_PROMPT_HELP_SHORT"),
        Locale.compose("LOC_UI_CHAT_PROMPT_HELP_LONG")
      ],
      commandConfig: helpCommandConfig
    };
    this.registerChatCommand(helpCommand);
    const privateMessageCommandConfig = {
      description: Locale.compose(
        "LOC_UI_CHAT_COMMAND_DESC_PRIVATE",
        Locale.compose("LOC_UI_CHAT_COMMAND_ARG_PLAYER")
      ),
      commandArguments: [Locale.compose("LOC_UI_CHAT_COMMAND_ARG_PLAYER")],
      helpArguments: [
        Locale.compose("LOC_UI_CHAT_COMMAND_ARG_PLAYER"),
        Locale.compose("LOC_UI_CHAT_COMMAND_ARG_MESSAGE")
      ],
      commandHandler: this.privateMessageCommandHandler
    };
    const privateMessageCommand = {
      commandPrompts: [Locale.compose("LOC_UI_CHAT_PROMPT_PRIVATE_SHORT")],
      commandConfig: privateMessageCommandConfig
    };
    this.registerChatCommand(privateMessageCommand);
    const globalChatCommandConfig = {
      description: Locale.compose("LOC_UI_CHAT_COMMAND_DESC_GLOBAL"),
      commandArguments: [],
      helpArguments: [Locale.compose("LOC_UI_CHAT_COMMAND_ARG_MESSAGE")],
      commandHandler: this.globalChatCommandHandler
    };
    const globalChatCommand = {
      commandPrompts: [Locale.compose("LOC_UI_CHAT_PROMPT_GLOBAL_SHORT")],
      commandConfig: globalChatCommandConfig
    };
    this.registerChatCommand(globalChatCommand);
    const localTeamCommandConfig = {
      description: Locale.compose("LOC_UI_CHAT_COMMAND_DESC_TEAM"),
      commandArguments: [],
      helpArguments: [Locale.compose("LOC_UI_CHAT_COMMAND_ARG_MESSAGE")],
      commandHandler: this.localTeamCommandHandler
    };
    const localTeamCommand = {
      commandPrompts: [Locale.compose("LOC_UI_CHAT_PROMPT_TEAM_SHORT")],
      commandConfig: localTeamCommandConfig
    };
    this.registerChatCommand(localTeamCommand);
    const respondCommandConfig = {
      description: Locale.compose("LOC_UI_CHAT_COMMAND_DESC_RESPOND"),
      commandArguments: [],
      helpArguments: [Locale.compose("LOC_UI_CHAT_COMMAND_ARG_MESSAGE")],
      commandHandler: this.respondCommandHandler
    };
    const respondCommand = {
      commandPrompts: [Locale.compose("LOC_UI_CHAT_PROMPT_RESPOND_SHORT")],
      commandConfig: respondCommandConfig
    };
    this.registerChatCommand(respondCommand);
  }
  helpCommandHandler(_commandArguments, _messageContent, context) {
    const commandList = this.stylizeHelpListContent(this.makeCommandList());
    const helpListContent = commandList;
    context.setMarkupMessage("");
    context.attachNodeToScrollable(context.createNotificationMessage(helpListContent, "Help" /* HELP */));
  }
  stylizeHelpListContent(commandList) {
    const initialListToken = "[BLIST]";
    const finalListToken = "[/LIST]";
    const listToken = "[LI]";
    const newLineToken = "[N]";
    const introductionString = Locale.compose("LOC_UI_CHAT_COMMAND_LIST") + newLineToken;
    const listItems = commandList.map((commandLine) => {
      return listToken + commandLine;
    });
    const listItemString = listItems.join("");
    return Locale.stylize(introductionString + initialListToken + listItemString + finalListToken);
  }
  makeCommandList() {
    return this.chatCommandConfigs.map((command) => {
      return this.createCommandHelpLine(command);
    });
  }
  createCommandHelpLine(command) {
    const { description, helpArguments } = command.commandConfig;
    const promptsHelp = this.joinPrompts(command.commandPrompts);
    const styleCommandPredicate = "[STYLE:screen-mp-chat__command-prompt]";
    const styleCommandDescription = "[STYLE:screen-mp-chat__command-description]";
    const predicate = styleCommandPredicate + `${promptsHelp} ${helpArguments.join(" ")}`;
    const commandHelpLine = `${predicate}: ${styleCommandDescription + description}`;
    return commandHelpLine;
  }
  joinPrompts(prompts) {
    let finalString = `/${prompts[0]}`;
    if (prompts.length == 1) {
      return finalString;
    } else {
      for (const prompt of prompts.slice(1).values()) {
        finalString = finalString + `, /${prompt}`;
      }
    }
    return finalString;
  }
  privateMessageCommandHandler(commandArguments, messageContent, context) {
    let playersMatched = context.getCurrentPlayersByName(commandArguments.join(" "));
    const splitMessage = messageContent.split(" ");
    const totalArguments = [...commandArguments];
    let flag = 0;
    while (playersMatched.length > 1) {
      const nextArgument = splitMessage[flag];
      totalArguments.push(nextArgument);
      const argumentString = totalArguments.join(" ");
      playersMatched = context.getCurrentPlayersByName(argumentString);
      flag++;
    }
    if (playersMatched.length != 1) {
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_PLAYER", commandArguments[0]));
      console.warn(
        `screen-mp-chat: No single player found with name ${commandArguments[0]}. Player doesn't exist or there is more than one player with this name. Please write a precise name`
      );
      return;
    }
    messageContent = splitMessage.slice(flag).join(" ");
    if (!messageContent) {
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_BLANK"));
      console.warn("screen-mp-chat: Player attempted to send a blank message");
      return;
    }
    context.setMarkupMessage(messageContent);
    context.setCurrentTarget(playersMatched[0]);
  }
  globalChatCommandHandler(_commandArguments, messageContent, context) {
    const globalTarget = context.getGlobalChatTarget();
    if (!globalTarget) {
      console.error("screen-mp-chat: There is not a global target to select");
      return;
    }
    if (!messageContent) {
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_BLANK"));
      console.warn("screen-mp-chat: Player attempted to send a blank message");
      return;
    }
    context.setMarkupMessage(messageContent);
    context.setCurrentTarget(globalTarget);
  }
  localTeamCommandHandler(_commandArguments, messageContent, context) {
    const localTeamTarget = context.getLocalTeamChatTarget();
    if (!localTeamTarget) {
      console.error("screen-mp-chat: There is not local team target to select");
      return;
    }
    if (!messageContent) {
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_BLANK"));
      console.warn("screen-mp-chat: Player attempted to send a blank message");
      return;
    }
    context.setMarkupMessage(messageContent);
    context.setCurrentTarget(localTeamTarget);
  }
  respondCommandHandler(_commandArguments, messageContent, context) {
    const lastPrivateToLocalTarget = context.lastPrivateToLocalTarget();
    if (!lastPrivateToLocalTarget) {
      console.error("screen-mp-chat: Nobody has sent a private message to the local player");
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_RESPOND"));
      return;
    }
    if (!messageContent) {
      context.setCommandError(Locale.compose("LOC_UI_CHAT_COMMAND_ERROR_BLANK"));
      console.warn("screen-mp-chat: Player attempted to send a blank message");
      return;
    }
    context.setMarkupMessage(messageContent);
    context.setCurrentTarget(lastPrivateToLocalTarget);
  }
  unregisterCommands() {
    this.chatCommands.clear();
  }
  registerChatCommand(command) {
    const commandPrompts = command.commandPrompts;
    for (const prompt of commandPrompts) {
      if (this.chatCommands.get(prompt)) {
        console.error(
          "screen-mp-chat: Command prompt already registered, assign unique string values to prompts"
        );
        return;
      }
      this.chatCommands.set(prompt, command);
    }
    this.chatCommandConfigs.push(command);
  }
}

const styles = "fs://game/core/ui/mp-chat/screen-mp-chat.css";

const mapNotificationTypeToClasses = {
  [NotificationType.PLAYER]: ["font-body-base", "text-accent-3"],
  [NotificationType.ERROR]: ["font-body-base", "text-negative"],
  [NotificationType.HELP]: ["font-body-base", "text-secondary"]
};
var CommonTargetImageClass = /* @__PURE__ */ ((CommonTargetImageClass2) => {
  CommonTargetImageClass2["TEAM"] = "img-team-chat";
  CommonTargetImageClass2["GLOBAL"] = "img-global-chat";
  CommonTargetImageClass2["DIRECT"] = "img-direct-chat";
  return CommonTargetImageClass2;
})(CommonTargetImageClass || {});
const mapChatTargetTypeToImageClass = {
  [ChatTargetTypes.CHATTARGET_ALL]: "img-global-chat" /* GLOBAL */,
  [ChatTargetTypes.CHATTARGET_TEAM]: "img-team-chat" /* TEAM */,
  [ChatTargetTypes.CHATTARGET_PLAYER]: "img-direct-chat" /* DIRECT */,
  [ChatTargetTypes.NO_CHATTARGET]: ""
};
const mapChatTargetTypeToTextboxPlaceholder = {
  [ChatTargetTypes.CHATTARGET_ALL]: "LOC_UI_CHAT_GAMEPAD_INPUT_DESC_GLOBAL",
  [ChatTargetTypes.CHATTARGET_TEAM]: "LOC_UI_CHAT_GAMEPAD_INPUT_DESC_TEAM",
  [ChatTargetTypes.CHATTARGET_PLAYER]: "LOC_UI_CHAT_GAMEPAD_INPUT_DESC_PRIVATE",
  [ChatTargetTypes.NO_CHATTARGET]: ""
};
const mapKickVoteResultTypeToNotificationMessage = {
  [KickVoteResultType.KICKVOTERESULT_NOT_ENOUGH_PLAYERS]: "LOC_UI_CHAT_PANEL_PLAYER_VOTE_NOT_ENOUGH_PLAYERS",
  [KickVoteResultType.KICKVOTERESULT_TARGET_INVALID]: "LOC_UI_CHAT_PANEL_PLAYER_VOTE_TARGET_INVALID",
  [KickVoteResultType.KICKVOTERESULT_TIME_ELAPSED]: "LOC_UI_CHAT_PANEL_PLAYER_VOTE_TIME_ELAPSED",
  [KickVoteResultType.KICKVOTERESULT_VOTE_PASSED]: "LOC_UI_CHAT_PANEL_PLAYER_VOTE_KICK",
  [KickVoteResultType.KICKVOTERESULT_VOTED_NO_KICK]: "LOC_UI_CHAT_PANEL_PLAYER_VOTE_NO_KICK",
  [KickVoteResultType.KICKVOTERESULT_PENDING]: ""
};
const mapKickDirectResultTypeToNotificationMessage = {
  [KickDirectResultType.KICKDIRECTRESULT_SUCCESS]: "LOC_UI_CHAT_PANEL_PLAYER_DIRECT_KICK",
  [KickDirectResultType.KICKDIRECTRESULT_FAILURE]: "LOC_UI_CHAT_PANEL_PLAYER_DIRECT_FAIL"
};
const mapKickReasonToNotificationMessage = {
  [KickReason.KICK_NONE]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_NO_HOST]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_HOST]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_TIMEOUT]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_UNRECOGNIZED]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_UNAUTHORIZED]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_NO_ROOM]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_NO_ROOM",
  [KickReason.KICK_VERSION_MISMATCH]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_VERSION_MISMATCH",
  [KickReason.KICK_MOD_ERROR]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_MOD_ERROR",
  [KickReason.KICK_MOD_MISSING]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_MOD_MISSING",
  [KickReason.KICK_APP_SLEPT]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_LOBBY_CONNECT]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_PLATFORM_MAPSIZE]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_RELAY_FAIL]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_INVALID_SNAPSHOT]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_CROSSPLAY_DISABLED_HOST]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_CROSSPLAY_DISABLED_HOST",
  [KickReason.KICK_CROSSPLAY_DISABLED_CLIENT]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_CROSSPLAY_DISABLED_CLIENT",
  [KickReason.KICK_MATCH_DELETED]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_GAME_STARTED]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.KICK_TOO_MANY_MATCHES]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT",
  [KickReason.NUM_KICKS]: "LOC_UI_CHAT_PANEL_PLAYER_KICKED_DEFAULT"
};
const mapTargetTypeToMessageHeaderPrefix = {
  [ChatTargetTypes.CHATTARGET_ALL]: (_playerFrom) => "",
  [ChatTargetTypes.CHATTARGET_PLAYER]: (playerFrom) => playerFrom.id == GameContext.localPlayerID ? "LOC_UI_CHAT_TO" : "LOC_UI_CHAT_FROM",
  [ChatTargetTypes.CHATTARGET_TEAM]: (_playerFrom) => "LOC_UI_CHAT_TEAM",
  [ChatTargetTypes.NO_CHATTARGET]: (_playerFrom) => ""
};
const mapTargetTypeToMessageHeaderHiddenClass = {
  [ChatTargetTypes.CHATTARGET_ALL]: "hidden",
  [ChatTargetTypes.CHATTARGET_PLAYER]: "",
  [ChatTargetTypes.CHATTARGET_TEAM]: "",
  [ChatTargetTypes.NO_CHATTARGET]: "hidden"
};
const mapTargetTypeToTextClass = {
  [ChatTargetTypes.CHATTARGET_ALL]: "text-secondary",
  [ChatTargetTypes.CHATTARGET_PLAYER]: "text-direct",
  [ChatTargetTypes.CHATTARGET_TEAM]: "text-team",
  [ChatTargetTypes.NO_CHATTARGET]: "text-secondary"
};
const DEFAULT_CHAT_TARGET_ENTRY = {
  targetID: -1,
  targetType: ChatTargetTypes.CHATTARGET_ALL,
  targetName: ""
};
const PRIVATE_SELECT_EVENT_NAME = "private-select-event";
class PrivateSelectEvent extends CustomEvent {
  constructor(currentTarget) {
    super(PRIVATE_SELECT_EVENT_NAME, { bubbles: true, detail: { currentTarget } });
  }
}
const EMOTICON_SELECT_EVENT_NAME = "emoticon-select-event";
class EmoticonSelectEvent extends CustomEvent {
  constructor(iconId) {
    super(EMOTICON_SELECT_EVENT_NAME, { bubbles: true, detail: { iconId } });
  }
}
class ScreenMPChat extends Panel {
  editBox;
  editBoxGamepadText;
  chatList;
  scrollableContainer;
  preview;
  previewText;
  previewTarget;
  previewTargetContainer;
  unreadButton;
  unreadButtonContainer;
  inputContainer;
  sendToButton;
  sendToButtonIcon;
  emoticonButton;
  emoticonButtonIcon;
  sendButton;
  scrollable;
  currentChatTargets = [];
  currentTarget = DEFAULT_CHAT_TARGET_ENTRY;
  stylizedMarkupMessage = "";
  markupMessage = "";
  editBoxObserver;
  commandError = "";
  privateToLocalPlayer = null;
  forcedUnread = false;
  chatCommandManager = new ChatCommandManager(this);
  sendToButtonActivateListener = this.onSendToButtonActivate.bind(this);
  sendButtonActivateListener = this.onSendButtonActivate.bind(this);
  emoticonButtonActivateListener = this.onEmoticonButtonActivate.bind(this);
  privateSelectListener = this.onPrivateSelect.bind(this);
  emoticonSelectListener = this.onEmoticonSelect.bind(this);
  editBoxAttributeMutateListener = this.onEditBoxAttributeMutate.bind(this);
  validateVirtualKeyboardListener = this.onValidateVirtualKeyboard.bind(this);
  editBoxValueChangeListener = this.onEditBoxValueChange.bind(this);
  keyDownListener = this.onKeyDown.bind(this);
  scrollAtBottomListener = this.onScrollAtBottom.bind(this);
  unreadButtonActivateListener = this.onUnreadButtonActivate.bind(this);
  focusListener = this.onFocus.bind(this);
  scrollableBlurListener = this.onScrollableBlur.bind(this);
  scrollableFocusListener = this.onScrollableFocus.bind(this);
  activeDeviceTypeChangedListener = this.onActiveDeviceTypeChanged.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    this.Root.innerHTML = this.getContent();
    this.sendButton = MustGetElement(".mp-chat__send-button", this.Root);
    this.sendToButton = MustGetElement(".mp-chat__send-to-button", this.Root);
    this.sendToButtonIcon = MustGetElement(".mp-chat__send-to-button-icon", this.Root);
    this.emoticonButton = MustGetElement(".mp-chat__emoticon-button", this.Root);
    this.emoticonButtonIcon = MustGetElement(".mp-chat__emoticon-button-icon", this.Root);
    this.editBox = MustGetElement(".mp-chat__textbox", this.Root);
    this.editBoxGamepadText = MustGetElement(".mp-chat__textbox__gamepad-text", this.Root);
    this.scrollable = MustGetElement(".mp-chat__scrollable", this.Root);
    this.chatList = MustGetElement(".mp-chat__list", this.Root);
    this.scrollableContainer = MustGetElement(".mp-chat__list-container", this.Root);
    this.preview = MustGetElement(".mp-chat__preview", this.Root);
    this.previewText = MustGetElement(".mp-chat__preview-text", this.Root);
    this.previewTarget = MustGetElement(".mp-chat__preview-target", this.Root);
    this.previewTargetContainer = MustGetElement(".mp-chat__preview-target-container", this.Root);
    this.unreadButton = MustGetElement(".mp-chat__unread-button", this.Root);
    this.unreadButtonContainer = MustGetElement(".mp-chat__unread-button-container", this.Root);
    this.inputContainer = MustGetElement(".mp-chat__input-container", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "chat");
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeChangedListener);
    engine.on("MultiplayerPlayerConnected", this.onPlayerConnected, this);
    engine.on("MultiplayerPostPlayerDisconnected", this.onPlayerDisconnected, this);
    engine.on("KickVoteComplete", this.onKickVoteComplete, this);
    engine.on("KickDirectComplete", this.onKickDirectComplete, this);
    engine.on("PlayerKicked", this.onPlayerKicked, this);
    engine.on("PlayerInfoChanged", this.onPlayerInfoChanged, this);
    engine.on(ContextManagerEvents.OnClose, this.onContextClose, this);
    this.Root.addEventListener(PRIVATE_SELECT_EVENT_NAME, this.privateSelectListener);
    this.Root.addEventListener(EMOTICON_SELECT_EVENT_NAME, this.emoticonSelectListener);
    this.Root.addEventListener("focus", this.focusListener);
    this.unreadButton.addEventListener("action-activate", this.unreadButtonActivateListener);
    this.unreadButton.setAttribute("data-audio-group-ref", "chat");
    this.sendButton.addEventListener("action-activate", this.sendButtonActivateListener);
    this.sendButton.setAttribute("data-audio-group-ref", "chat");
    this.sendButton.setAttribute("data-audio-press-ref", "none");
    this.sendToButton.addEventListener("action-activate", this.sendToButtonActivateListener);
    this.sendToButton.setAttribute("data-audio-group-ref", "chat");
    this.sendToButton.setAttribute("data-audio-activate-ref", "data-audio-chat-target-activate");
    this.emoticonButton.addEventListener("action-activate", this.emoticonButtonActivateListener);
    this.emoticonButton.setAttribute("data-audio-group-ref", "chat");
    this.emoticonButton.setAttribute("data-audio-activate-ref", "data-audio-emoji-activate");
    this.editBox.addEventListener("fxs-textbox-validate-virtual-keyboard", this.validateVirtualKeyboardListener);
    this.editBox.addEventListener("keydown", this.keyDownListener);
    this.editBox.addEventListener(ComponentValueChangeEventName, this.editBoxValueChangeListener);
    this.editBoxObserver = new MutationObserver(this.editBoxAttributeMutateListener);
    this.editBoxObserver.observe(this.editBox, { attributes: true, childList: false, subtree: false });
    this.scrollable.addEventListener(InputEngineEventName, this.onEngineInput);
    this.scrollable.addEventListener("scroll-at-bottom", this.scrollAtBottomListener);
    this.scrollable.addEventListener("focus", this.scrollableFocusListener);
    this.scrollable.addEventListener("blur", this.scrollableBlurListener);
    this.chatCommandManager.registerCommands();
    this.attachNodeToScrollable(
      this.createNotificationMessage("LOC_UI_CHAT_COMMAND_PROMPT_HELP", NotificationType.HELP)
    );
    this.resetCurrentTarget();
    waitForLayout(() => Network.getChatHistory()?.forEach((data) => this.onMultiplayerChat(data, false)));
    this.updateSendToButton();
    this.updateEmoticonButton();
    this.updateEditBox();
    this.updateSendButton();
    this.updatePreview();
    this.updatePreviewTarget();
    this.updateUnreadButtonContainer();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.Root);
  }
  close() {
    if (ContextManager.hasInstanceOf("send-to-panel")) {
      ContextManager.pop("send-to-panel");
    }
    if (ContextManager.hasInstanceOf("emoticon-panel")) {
      ContextManager.pop("emoticon-panel");
    }
    super.close();
  }
  getContent() {
    return `
			<fxs-inner-frame class="mp-chat__inner-frame fxs-inner-frame-opaque px-3 pb-1\\.5 pt-1 flow-column flex-1">
				<fxs-slot class="mp-chat__list-container flex-1 relative flow-column w-full px-1" data-navrule-up="stop" data-navrule-down="stop" data-navrule-left="stop" data-navrule-right="stop">
					<div class="relative flow-column flex-auto">
						<fxs-scrollable class="flex-auto mp-chat__scrollable hide-nav-help" scroll-on-resize-when-bottom="true" handle-gamepad-pan="true" tabindex="-1">
							<div class="min-h-full flow-column justify-end">
								<div class="mp-chat__list flow-column pb-1 pt-2"></div>
							</div>
						</fxs-scrollable>
						<div class="mp-chat__unread-button-container absolute bottom-1 flow-row w-full justify-center">
							<div class="relative">
								<div class="absolute bg-black top-0\\.5 -bottom-0\\.5 -left-0\\.5 right-0\\.5 opacity-50"></div>
								<fxs-activatable class="mp-chat__unread-button bg-primary-4" data-tooltip-content="LOC_UI_CHAT_NEW_MESSAGE">
									<div class="mp-chat__unread-button-icon w-6 h-6"></div>
								</fxs-activatable>
							</div>
						</div>
					</div>
					<div class="mp-chat__preview w-full max-h-26 min-h-16 flow-column">
						<fxs-ornament3 class="min-h-0 tint-bg-accent-5"></fxs-ornament3>
						<div class="flow-row mb-1 mt-2 justify-between items-center">
							<div class="font-title-sm text-secondary mr-2" data-l10n-id="LOC_UI_CHAT_PREVIEW"></div>
							<div class="flow-row mp-chat__preview-target-container flex-1">
								<div class="mp-chat__preview-target font-title-sm text-secondary uppercase font-fit-shrink whitespace-nowrap"></div>
							</div>
						</div>
						<fxs-scrollable class="mp-chat__preview-scrollable flex-auto" scroll-on-resize-when-bottom="true">
							<div class="mp-chat__preview-text pb-3 pr-3 pl-3 font-body-sm text-accent-1 break-words"></div>
						</fxs-scrollable>
					</div>
				</fxs-slot>
				<fxs-ornament3 class="min-h-0"></fxs-ornament3>
				<div class="mp-chat__input-container flow-row relative items-center w-full hide-nav-help">
					<div class="flow-row">
						<fxs-activatable class="group mp-chat__send-to-button flex flex-row-reverse flex-nowrap items-center" action-key="inline-shell-action-1" data-tooltip-content="LOC_UI_CHAT_PANEL_OPEN_TIP_PRIVATE">
							<div class="mp-chat__send-to-button-icon w-6 h-6 tint-bg-accent-3 group-focus\\:tint-bg-accent-1 group-hover\\:tint-bg-accent-1"></div>
						</fxs-activatable>
					</div>
					<div class="mp-chat__textbox-container h-9 flex-1 mx-2 items-center flow-row justify-center">
						<fxs-textbox 
							data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}" 
							class="mp-chat__textbox flex flex-auto font-body text-sm" 
							maxlength="255" 
							type="text" 
							has-border="false" 
							has-background="false"
						></fxs-textbox>
						<fxs-activatable data-bind-class-toggle="hidden:!{{g_NavTray.isTrayRequired}}" class="mp-chat__textbox__gamepad max-w-full flex flex-row-reverse flex-nowrap items-center" action-key="inline-accept">
							<div class="mp-chat__textbox__gamepad-text font-body text-sm text-accent-4 max-w-full truncate flex-auto"></div>
						</fxs-activatable>
					</div>
					<div class="flow-row items-center">
						<fxs-activatable class="group mp-chat__emoticon-button flex flex-row-reverse flex-nowrap items-center" action-key="inline-shell-action-2" data-tooltip-content="LOC_UI_CHAT_PANEL_OPEN_TIP_ICONS">
							<div class="mp-chat__emoticon-button-icon img-emoticon-chat w-6 h-6 tint-bg-accent-3 group-focus\\:tint-bg-accent-1 group-hover\\:tint-bg-accent-1"></div>
						</fxs-activatable>
						<fxs-activatable data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}" class="w-6 h-8 img-arrow -scale-x-100 mp-chat__send-button tint-bg-accent-1" data-tooltip-content="LOC_UI_CHAT_SEND"></fxs-activatable>
					</div>
				</div>
			</fxs-inner-frame>
		`;
  }
  onEngineInput = (inputEvent) => {
    if (!this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  };
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "shell-action-1":
        this.toggleSendToPanel();
        return false;
      case "shell-action-2":
        this.toggleEmoticonPanel();
        return false;
      case "accept":
        this.editBox.setAttribute("activated", "true");
        return false;
      case "shell-action-3":
        if (Network.getUnreadChatLength() || this.forcedUnread) {
          this.scrollAtBottom();
        }
        return false;
    }
    return true;
  }
  /**
   * Track the content in the real input (editBox) on change.
   */
  onEditBoxAttributeMutate(_mutationList, _observer) {
    const value = this.editBox.getAttribute("value") ?? "";
    const newValue = value.slice(0, ChatGlobalTypes.MAX_CHAT_MESSAGE_SIZE);
    this.markupMessage = newValue;
    this.stylizedMarkupMessage = Locale.stylize(newValue);
    this.updateSendButton();
    this.updatePreview();
    this.updatePreviewText();
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeChangedListener);
    this.editBoxObserver.disconnect();
    engine.off("MultiplayerPlayerConnected", this.onPlayerConnected, this);
    engine.off("MultiplayerPostPlayerDisconnected", this.onPlayerDisconnected, this);
    engine.off("KickVoteComplete", this.onKickVoteComplete, this);
    engine.off("KickDirectComplete", this.onKickDirectComplete, this);
    engine.off("PlayerKicked", this.onPlayerKicked, this);
    engine.off("PlayerInfoChanged", this.onPlayerInfoChanged, this);
    engine.off(ContextManagerEvents.OnClose, this.onContextClose, this);
    this.Root.removeEventListener(PRIVATE_SELECT_EVENT_NAME, this.privateSelectListener);
    this.Root.removeEventListener(EMOTICON_SELECT_EVENT_NAME, this.emoticonSelectListener);
    this.chatCommandManager.unregisterCommands();
    super.onDetach();
  }
  onPlayerConnected({ data }) {
    const { playerName } = Configuration.getPlayer(data);
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    this.attachNodeToScrollable(
      this.createNotificationMessage(
        Locale.stylize("LOC_UI_CHAT_PANEL_PLAYER_CONNECTED", playerName),
        NotificationType.PLAYER
      )
    );
    if (!isScrollAtBottom) {
      this.updateUnreadButtonContainer(true);
    }
    this.resetCurrentTarget();
  }
  // Note: we don't have the player id here because we have no reference to the player that have left the game at this stage
  onPlayerDisconnected({ playerNameT2gp, playerName1Pgp }) {
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    const playerName = playerNameT2gp || playerName1Pgp;
    this.attachNodeToScrollable(
      this.createNotificationMessage(
        Locale.stylize("LOC_UI_CHAT_PANEL_PLAYER_DISCONNECTED", playerName),
        NotificationType.PLAYER
      )
    );
    if (!isScrollAtBottom) {
      this.updateUnreadButtonContainer(true);
    }
    this.resetCurrentTarget();
  }
  onKickVoteComplete({ kickResult, kickPlayerName }) {
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    this.attachNodeToScrollable(
      this.createNotificationMessage(
        Locale.stylize(mapKickVoteResultTypeToNotificationMessage[kickResult], kickPlayerName),
        NotificationType.PLAYER
      )
    );
    if (!isScrollAtBottom) {
      this.updateUnreadButtonContainer(true);
    }
  }
  onKickDirectComplete({ kickPlayerID, kickResult, kickPlayerName }) {
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    const kickedPlayerConfig = Configuration.getPlayer(kickPlayerID);
    const playerName = kickPlayerName != "" ? kickPlayerName : kickedPlayerConfig.nickName_T2GP != "" ? kickedPlayerConfig.nickName_T2GP : kickedPlayerConfig.nickName_1P;
    this.attachNodeToScrollable(
      this.createNotificationMessage(
        Locale.stylize(mapKickDirectResultTypeToNotificationMessage[kickResult], playerName),
        NotificationType.PLAYER
      )
    );
    if (!isScrollAtBottom) {
      this.updateUnreadButtonContainer(true);
    }
  }
  onPlayerKicked({ kickPlayerID, kickReason, kickPlayerName }) {
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    const kickedPlayerConfig = Configuration.getPlayer(kickPlayerID);
    const playerName = kickPlayerName != "" ? kickPlayerName : kickedPlayerConfig.nickName_T2GP != "" ? kickedPlayerConfig.nickName_T2GP : kickedPlayerConfig.nickName_1P;
    this.attachNodeToScrollable(
      this.createNotificationMessage(
        Locale.stylize(mapKickReasonToNotificationMessage[kickReason], playerName),
        NotificationType.PLAYER
      )
    );
    if (!isScrollAtBottom) {
      this.updateUnreadButtonContainer(true);
    }
  }
  onKeyDown({ keyCode }) {
    if (keyCode == 13) {
      this.onSend();
    }
  }
  onFocus(_event) {
    FocusManager.setFocus(this.scrollable);
  }
  onScrollableBlur(_event) {
    this.updateNavHelp();
  }
  onScrollableFocus(_event) {
    this.updateNavHelp();
  }
  onActiveDeviceTypeChanged(_event) {
    this.updateNavHelp();
  }
  onScrollAtBottom(_event) {
    Network.readChat();
    this.forcedUnread = false;
    this.updateUnreadButtonContainer();
  }
  onUnreadButtonActivate(_event) {
    this.scrollable.component.scrollToPercentage(1);
  }
  onSend() {
    this.chatCommandManager.selectCommand(this.markupMessage);
    const { targetType, targetID } = this.currentTarget;
    if (this.commandError) {
      this.attachNodeToScrollable(this.createNotificationMessage(this.commandError, NotificationType.ERROR));
      this.scrollAtBottom();
    } else if (this.markupMessage) {
      Audio.playSound("data-audio-send-message-activate", "chat");
      Network.sendChat(this.markupMessage, targetType, targetID);
    }
    this.editBox.setAttribute("value", "");
    this.commandError = "";
  }
  onContextClose(_event) {
    this.updateSendToButton();
    this.updateEmoticonButton();
  }
  updateSendButton() {
    this.sendButton.classList.toggle("tint-bg-accent-3", !this.markupMessage);
    this.sendButton.classList.toggle("focus\\:tint-bg-white", !!this.markupMessage);
    this.sendButton.classList.toggle("hover\\:tint-bg-white", !!this.markupMessage);
    this.sendButton.setAttribute("disabled", this.markupMessage ? "false" : "true");
  }
  updateSendToButton() {
    const { targetType } = this.currentTarget;
    this.sendToButtonIcon.classList.toggle(
      "img-global-chat" /* GLOBAL */,
      targetType == ChatTargetTypes.CHATTARGET_ALL || targetType == ChatTargetTypes.NO_CHATTARGET
    );
    this.sendToButtonIcon.classList.toggle(
      "img-team-chat" /* TEAM */,
      targetType == ChatTargetTypes.CHATTARGET_TEAM
    );
    this.sendToButtonIcon.classList.toggle(
      "img-direct-chat" /* DIRECT */,
      targetType == ChatTargetTypes.CHATTARGET_PLAYER
    );
    this.sendToButtonIcon.classList.toggle("tint-bg-accent-3", !ContextManager.hasInstanceOf("send-to-panel"));
  }
  updateEmoticonButton() {
    this.emoticonButtonIcon.classList.toggle("tint-bg-accent-3", !ContextManager.hasInstanceOf("emoticon-panel"));
  }
  updateEditBox() {
    const { targetType, targetName } = this.currentTarget;
    const value = this.editBox.getAttribute("value") ?? "";
    this.editBox.setAttribute(
      "placeholder",
      Locale.compose(mapChatTargetTypeToTextboxPlaceholder[targetType], targetName)
    );
    this.editBoxGamepadText.setAttribute(
      "data-l10n-id",
      Locale.compose(mapChatTargetTypeToTextboxPlaceholder[targetType], targetName)
    );
    this.editBox.classList.toggle("text-accent-1", !!value);
    this.editBox.classList.toggle("text-accent-3", !value);
  }
  updatePreview() {
    this.preview.classList.toggle("hidden", !this.markupMessage);
  }
  updatePreviewText() {
    this.previewText.setAttribute("data-l10n-id", this.stylizedMarkupMessage);
  }
  updatePreviewTarget() {
    const { targetName, targetType } = this.currentTarget;
    this.previewTargetContainer.classList.toggle(
      "hidden",
      !targetName || targetType == ChatTargetTypes.CHATTARGET_ALL
    );
    this.previewTarget.classList.toggle("text-team", targetType == ChatTargetTypes.CHATTARGET_TEAM);
    this.previewTarget.classList.toggle("text-direct", targetType == ChatTargetTypes.CHATTARGET_PLAYER);
    this.previewTarget.innerHTML = targetType === ChatTargetTypes.CHATTARGET_PLAYER ? `[${targetName}]` : `[${Locale.compose(targetName)}]`;
  }
  updateUnreadButtonContainer(forced = false) {
    this.forcedUnread = forced;
    this.unreadButtonContainer.classList.toggle("hidden", !Network.getUnreadChatLength() && !this.forcedUnread);
  }
  onMultiplayerChat = (data, playSound = true) => {
    const { fromPlayer, toPlayer, targetType } = data;
    const playerFrom = Configuration.getPlayer(fromPlayer);
    const playerTo = Configuration.getPlayer(toPlayer);
    if (playerFrom && targetType == ChatTargetTypes.CHATTARGET_PLAYER && playerTo.id == GameContext.localPlayerID) {
      this.privateToLocalPlayer = playerFrom;
    }
    const isScrollAtBottom = this.scrollable.component.getIsScrollAtBottom();
    const message = this.createMessage(data);
    this.attachNodeToScrollable(message);
    if (TtsManager.isTextToSpeechOnChatEnabled && playSound) {
      TtsManager.trySpeakElement(message);
    }
    if (playerFrom.id == GameContext.localPlayerID) {
      this.scrollAtBottom();
    } else {
      if (playSound) {
        Audio.playSound("data-audio-chat-received", "chat");
      }
      if (!isScrollAtBottom) {
        this.updateUnreadButtonContainer();
      }
    }
  };
  updateNavHelp() {
    waitForLayout(() => {
      this.scrollable.classList.toggle(
        "hide-nav-help",
        !FocusManager.getFocus().classList.contains("mp-chat__scrollable")
      );
      this.inputContainer.classList.toggle(
        "hide-nav-help",
        !FocusManager.getFocus().classList.contains("mp-chat__scrollable")
      );
    });
  }
  onPlayerInfoChanged({ data }) {
    if (GameContext.localPlayerID != data) {
      return;
    }
    let oldTeamID = void 0;
    const oldTeamTarget = this.currentChatTargets.find(
      (t) => t.targetType == ChatTargetTypes.CHATTARGET_TEAM
    );
    if (oldTeamTarget) {
      oldTeamID = oldTeamTarget.targetID;
    }
    const currentChatTargets = Network.getChatTargets();
    let newTeamID = void 0;
    const newTeamTarget = currentChatTargets.find(
      (t) => t.targetType == ChatTargetTypes.CHATTARGET_TEAM
    );
    if (newTeamTarget) {
      newTeamID = newTeamTarget.targetID;
    }
    if (newTeamID == oldTeamID) {
      return;
    }
    this.resetCurrentTarget();
    this.updateSendButton();
    this.updatePreview();
  }
  onPrivateSelect({ detail: { currentTarget } }) {
    this.currentTarget = currentTarget;
    this.updateEditBox();
    this.updatePreviewTarget();
    this.updateSendToButton();
  }
  onEmoticonSelect({ detail: { iconId } }) {
    const oldMessage = this.editBox.getAttribute("value") ?? "";
    const { selectionStart = oldMessage.length } = this.editBox.querySelector("input") || {};
    const iconMessage = `[icon:${iconId}]`;
    this.markupMessage = `${oldMessage.slice(0, selectionStart)}${iconMessage}${oldMessage.slice(selectionStart, oldMessage.length)}`;
    this.stylizedMarkupMessage = Locale.stylize(this.markupMessage);
    this.editBox.setAttribute("value", this.markupMessage);
    if (ActionHandler.isGamepadActive) {
      this.onSend();
    } else {
      this.setCaretAtPosition(selectionStart + iconMessage.length);
    }
  }
  /**
   * @param {string} playerName: The player to search
   * @returns: A collection of targets with the matching name (substring)
   */
  getCurrentPlayersByName(playerName) {
    const playersMatched = [];
    this.currentChatTargets.forEach((target) => {
      const targetName = target.targetName;
      const isPlayer = target.targetType == ChatTargetTypes.CHATTARGET_PLAYER;
      const isSubstringName = targetName.toLowerCase().includes(playerName.toLowerCase());
      if (isPlayer && isSubstringName) {
        playersMatched.push(target);
      }
    });
    return playersMatched;
  }
  getGlobalChatTarget() {
    return this.currentChatTargets.find((target) => {
      return target.targetType == ChatTargetTypes.CHATTARGET_ALL;
    });
  }
  lastPrivateToLocalTarget() {
    return this.currentChatTargets.find((target) => {
      return target.targetID == this.privateToLocalPlayer?.id;
    });
  }
  getLocalTeamChatTarget() {
    return this.currentChatTargets.find((target) => {
      return target.targetType == ChatTargetTypes.CHATTARGET_TEAM;
    });
  }
  setCurrentTarget(currentTarget) {
    this.currentTarget = currentTarget;
    this.updatePreviewTarget();
    this.updateSendToButton();
    this.updateEditBox();
  }
  setCommandError(error) {
    this.commandError = error;
  }
  setMarkupMessage(message) {
    this.markupMessage = message;
    this.stylizedMarkupMessage = Locale.stylize(message);
  }
  attachNodeToScrollable(msgNode) {
    if (!msgNode) {
      return;
    }
    this.chatList.appendChild(msgNode);
    while (this.chatList.children.length > ChatGlobalTypes.MAX_CHAT_HISTORY) {
      this.chatList.removeChild(this.chatList.firstChild);
    }
  }
  resetCurrentTarget() {
    this.currentChatTargets = Network.getChatTargets();
    if (!this.currentChatTargets.includes(this.currentTarget)) {
      this.setCurrentTarget(DEFAULT_CHAT_TARGET_ENTRY);
    }
  }
  createMessage(data) {
    const { targetType, fromPlayer, toPlayer, text } = data;
    const playerFrom = Configuration.getPlayer(fromPlayer);
    const playerTo = Configuration.getPlayer(toPlayer);
    const container = document.createElement("div");
    container.role = "paragraph";
    container.classList.add("pb-3", "pr-3", "pointer-events-auto");
    container.innerHTML = `
			<div class="flow-row items-center">
				<div class="flow-row pr-1 ${mapTargetTypeToMessageHeaderHiddenClass[targetType]}">
					<div class="font-title-sm uppercase text-secondary ${mapTargetTypeToMessageHeaderHiddenClass[targetType]}">[</div>
					<div class="font-title-sm uppercase ${mapTargetTypeToTextClass[targetType]}" data-l10n-id="${mapTargetTypeToMessageHeaderPrefix[targetType](playerFrom)}"></div>
					<div class="font-title-sm uppercase text-secondary ${mapTargetTypeToMessageHeaderHiddenClass[targetType]}">]</div>
				</div>
				<div class="flex-auto">
					<div class="font-title-sm uppercase text-secondary font-fit-shrink whitespace-nowrap" data-l10n-id="${playerFrom.id == GameContext.localPlayerID && playerTo && targetType === ChatTargetTypes.CHATTARGET_PLAYER ? playerTo.playerName : playerFrom.playerName}"></div>
				</div>
			</div>
			<div class="font-body-sm text-accent-1 pl-3 break-words" data-l10n-id="${text}"></div>
		`;
    return container;
  }
  /**
   * @param {string} content: The content of the message
   * @param {string} classNames: The className to apply the notification styles
   * @returns: The HTML message node
   */
  createNotificationMessage(content, notificationType) {
    if (!content) {
      return;
    }
    const message = document.createElement("div");
    message.role = "paragraph";
    message.classList.add("pb-3", "pr-3", "pointer-events-auto");
    message.classList.add(...mapNotificationTypeToClasses[notificationType]);
    message.setAttribute("data-l10n-id", content);
    const messagefirstchild = message.firstChild;
    if (messagefirstchild instanceof HTMLElement) {
      messagefirstchild.removeAttribute("cohinline");
      messagefirstchild.classList.add("flex-wrap");
    }
    return message;
  }
  onValidateVirtualKeyboard() {
    waitForLayout(() => this.onSend());
  }
  onEditBoxValueChange() {
    this.updateEditBox();
  }
  onSendToButtonActivate(_event) {
    this.toggleSendToPanel();
  }
  onSendButtonActivate(_event) {
    this.onSend();
    this.setCaretAtPosition();
  }
  onEmoticonButtonActivate(_event) {
    this.toggleEmoticonPanel();
  }
  toggleSendToPanel() {
    if (ContextManager.hasInstanceOf("send-to-panel")) {
      ContextManager.pop("send-to-panel");
    } else {
      ContextManager.push("send-to-panel", {
        singleton: true,
        createMouseGuard: false,
        targetParent: this.scrollableContainer
      });
      this.updateSendToButton();
    }
  }
  toggleEmoticonPanel() {
    if (ContextManager.hasInstanceOf("emoticon-panel")) {
      ContextManager.pop("emoticon-panel");
    } else {
      ContextManager.push("emoticon-panel", {
        singleton: true,
        createMouseGuard: false,
        targetParent: this.scrollableContainer
      });
      this.updateEmoticonButton();
    }
  }
  scrollAtBottom() {
    delayByFrame(() => this.scrollable.component.scrollToPercentage(1), 6);
  }
  setCaretAtPosition(position = -1) {
    const input = this.editBox.querySelector("input");
    if (!input) {
      return;
    }
    const elemLength = input.value.length;
    const newPosition = position == -1 ? elemLength : Math.max(Math.min(position, elemLength));
    input.selectionStart = newPosition;
    input.selectionEnd = newPosition;
    input.focus();
  }
}
Controls.define("screen-mp-chat", {
  createInstance: ScreenMPChat,
  description: "Multiplayer Chat screen.",
  classNames: ["screen-mp-chat", "flow-row"],
  styles: [styles],
  attributes: [
    {
      name: "disable-minimize",
      description: "Remove the option to minimize the chat"
    }
  ],
  tabIndex: -1
});

export { EMOTICON_SELECT_EVENT_NAME, EmoticonSelectEvent, PRIVATE_SELECT_EVENT_NAME, PrivateSelectEvent, ScreenMPChat, mapChatTargetTypeToImageClass };
//# sourceMappingURL=screen-mp-chat.js.map
