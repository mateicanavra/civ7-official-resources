import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import { a as ActionActivateEventName } from '../../components/fxs-activatable.chunk.js';
import { D as DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.chunk.js';
import ContextManager, { ContextManagerEvents } from '../../context-manager/context-manager.js';
import { d as StartCampaignEvent, j as SendCampaignSetupTelemetryEvent } from '../../events/shell-events.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../input/action-handler.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { ProfileAccountLoggedOutEventName } from '../../profile-header/profile-header.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { M as MPLobbyDataModelProxy, L as LobbyUpdateEventName, S as SMALL_SCREEN_MODE_MAX_HEIGHT, a as SMALL_SCREEN_MODE_MAX_WIDTH } from './model-mp-staging-new.chunk.js';
import { D as Databind } from '../../utilities/utilities-core-databinding.chunk.js';
import { MustGetElement, MustGetElements } from '../../utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../utilities/utilities-layout.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../views/view-manager.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../framework.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../input/cursor.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../rewards-notifications/rewards-notification-manager.chunk.js';
import './model-mp-friends.chunk.js';
import '../../social-notifications/social-notifications-manager.js';
import '../../utilities/utilities-liveops.js';
import '../../profile-page/screen-profile-page.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-metaprogression.chunk.js';
import '../../utilities/utilities-network-constants.chunk.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';
import '../create-panels/age-civ-select-model.chunk.js';
import '../live-event-logic/live-event-logic.chunk.js';
import '../../utilities/utilities-data.chunk.js';
import '../create-panels/leader-select-model.chunk.js';

const content = "<fxs-frame class=\"mp-staging__frame flex-1 flow-column relative w-full h-full\">\r\n\t<div class=\"flex-auto flow-column relative\">\r\n\t\t<div\r\n\t\t\tclass=\"mp-staging__ready-button-container absolute bottom-0 left-0 right-0 flow-row justify-center items-center\"\r\n\t\t>\r\n\t\t\t<div class=\"w-36 h-36 relative flow-row justify-center items-center\">\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"ready-button group absolute top-3 bottom-7 left-5 right-5 flow-row justify-center items-center\"\r\n\t\t\t\t\tdata-bind-attributes=\"{'disabled': !{{g_MPLobbyModel.canToggleReady}}}\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"pointer-events-none absolute img-popup_icon_glow -inset-28 tint-bg-white transition-opacity opacity-0 group-hover\\:opacity-75\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"img-popup_icon_wood_bk absolute inset-0\"></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"absolute inset-0 transition-transform group-active\\:scale-95 flow-row justify-center items-center\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div class=\"absolute inset-0 p-0\\.5\">\r\n\t\t\t\t\t\t\t<div class=\"relative size-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"mp-staging__ready-button__len img-popup_len absolute inset-4 opacity-5 transition-opacity\"\r\n\t\t\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-100:['INIT', 'NOT_READY'].includes({{g_MPLobbyModel.readyStatus}})\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"mp-staging__ready-button__len-selected img-popup_len_selected absolute inset-4 opacity-5 transition-opacity\"\r\n\t\t\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-100:['WAITING_FOR_OTHERS', 'STARTING_GAME', 'WAITING_FOR_HOST'].includes({{g_MPLobbyModel.readyStatus}})\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"absolute inset-1 top-1 bottom-1 right-1\\.25\">\r\n\t\t\t\t\t\t\t<fxs-ring-meter\r\n\t\t\t\t\t\t\t\tmax-value=\"10\"\r\n\t\t\t\t\t\t\t\tmin-value=\"0\"\r\n\t\t\t\t\t\t\t\tclass=\"mp-staging__ring-meter h-full w-full flex self-center align-center items-center -scale-100 transition-opacity opacity-5\"\r\n\t\t\t\t\t\t\t\tring-class=\"img-ring-meter-ring\"\r\n\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'animation-duration': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}} == 10 || {{g_MPLobbyModel.readyStatus}} != 'STARTING_GAME' ? '1' : '1500', 'value': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}}}\"\r\n\t\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-70:{{g_MPLobbyModel.readyStatus}} == 'STARTING_GAME'\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-ring-meter>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"absolute inset-0 pr-0\\.5\">\r\n\t\t\t\t\t\t\t<div class=\"relative size-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"img-ntf_block_hov absolute inset-3 opacity-5 transition-opacity group-hover\\:opacity-100\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"img-ntf_block_active absolute inset-3 opacity-5 transition-opacity group-active\\:opacity-100\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"absolute inset-0 p-0\\.5\">\r\n\t\t\t\t\t\t\t<div class=\"relative size-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"img-popup_checkmark absolute inset-4 opacity-5 transition-opacity\"\r\n\t\t\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-90:{{g_MPLobbyModel.readyStatus}} == 'WAITING_FOR_OTHERS'\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"mp-staging__ring-meter__text font-title-2xl text-secondary w-full text-center center z-1 opacity-5 transition-opacity\"\r\n\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-80:{{g_MPLobbyModel.readyStatus}} == 'STARTING_GAME'\"\r\n\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}}}\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"mp-staging__ring-meter__loading absolute inset-0 z-1 flow-row justify-center items-center opacity-0 transition-opacity\"\r\n\t\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-80:{{g_MPLobbyModel.readyStatus}} == 'WAITING_FOR_HOST'\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-activatable>\r\n\t\t\t\t<div class=\"absolute pointer-events-none -inset-0\\.5 img-popup-laurels\"></div>\r\n\t\t\t\t<div class=\"absolute flow-row -bottom-3 w-96 h-16 flex-row justify-center items-center\">\r\n\t\t\t\t\t<div class=\"img-popup_header_bk absolute inset-0\"></div>\r\n\t\t\t\t\t<fxs-nav-help\r\n\t\t\t\t\t\taction-key=\"inline-nav-shell-next\"\r\n\t\t\t\t\t\tclass=\"absolute right-0\"\r\n\t\t\t\t\t></fxs-nav-help>\r\n\t\t\t\t\t<p\r\n\t\t\t\t\t\tclass=\"mp-staging__ready-button__text font-fit-shrink whitespace-nowrap flex-auto font-title-lg text-accent-1 uppercase tracking-150 z-1 mx-2 text-center\"\r\n\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id': {{g_MPLobbyModel.readyButtonCaption}}}\"\r\n\t\t\t\t\t\tdata-bind-class-toggle=\"mx-12:{{g_NavTray.isTrayRequired}}\"\r\n\t\t\t\t\t></p>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"flow-row\">\r\n\t\t\t<div class=\"mp-staging__header-spacing mr-2\">\r\n\t\t\t\t<div class=\"flex\">\r\n\t\t\t\t\t<fxs-button\r\n\t\t\t\t\t\tclass=\"show-join-code-button-top min-w-auto\"\r\n\t\t\t\t\t\taction-key=\"inline-nav-shell-previous\"\r\n\t\t\t\t\t></fxs-button>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"flex-auto flow-column items-center\">\r\n\t\t\t\t<p\r\n\t\t\t\t\tclass=\"font-title text-2xl text-center uppercase text-gradient-secondary whitespace-nowrap font-fit-shrink max-w-full\"\r\n\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.gameName}}}\"\r\n\t\t\t\t></p>\r\n\t\t\t\t<p\r\n\t\t\t\t\tclass=\"font-title-lg uppercase tracking-100 text-gradient-accent-4\"\r\n\t\t\t\t\tdata-bind-class-toggle=\"hidden:!{{g_MPLobbyModel.isUsingGlobalCountdown}}\"\r\n\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.timeRemainingTimer}}}\"\r\n\t\t\t\t></p>\r\n\t\t\t\t<fxs-ornament3\r\n\t\t\t\t\tclass=\"min-h-0 tint-bg-accent-5 mt-1 w-77\"\r\n\t\t\t\t\tdata-bind-class-toggle=\"hidden:!{{g_MPLobbyModel.isUsingGlobalCountdown}}\"\r\n\t\t\t\t></fxs-ornament3>\r\n\t\t\t</div>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"mp-staging__header-spacing mp-staging__profile-header-container ml-2 relative flow-row justify-end items-center\"\r\n\t\t\t></div>\r\n\t\t</div>\r\n\t\t<div class=\"mb-2 mt-1 mp-staging__content\">\r\n\t\t\t<div class=\"flow-row mp-staging__left-section-top mb-2\">\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"rules-top min-w-auto mr-3\"\r\n\t\t\t\t\tcaption=\"LOC_UI_MP_LOBBY_RULES\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"mp-staging__toggle-chat\"\r\n\t\t\t\t\tcaption=\"LOC_UI_MP_CHAT\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"flow-row items-end justify-center\">\r\n\t\t\t\t<div class=\"mr-4 flex mp-staging__left-section-header\">\r\n\t\t\t\t\t<fxs-button\r\n\t\t\t\t\t\tclass=\"show-join-code-button-bot min-w-auto\"\r\n\t\t\t\t\t\taction-key=\"inline-nav-shell-previous\"\r\n\t\t\t\t\t></fxs-button>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flow-row flex-auto player-info-header-container\">\r\n\t\t\t\t\t<div class=\"flow-row flex-auto items-center\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"pr-1 flex-3 font-body-base text-accent-3 mp-staging__player-header font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_PLAYER\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"pr-1 flex-1 font-body-base text-accent-3 mp-staging__team-header font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_TEAM\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"pr-1 flex-1 font-body-base text-accent-3 mp-staging__civ-header font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_CIV\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"pr-1 flex-2 font-body-base text-accent-3 font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_LEADER\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"px-1 font-body-base text-accent-3 text-center mp-staging__ready-header font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_READY\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"px-1 font-body-base text-accent-3 text-center mp-staging__kick-header font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_HEADER_KICK\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"flex-auto flow-row justify-center\">\r\n\t\t\t<div class=\"flow-column mr-4 mp-staging__left-section-content\">\r\n\t\t\t\t<fxs-inner-frame class=\"flex-auto flow-column mb-8\">\r\n\t\t\t\t\t<div class=\"p-4 w-full flow-column items-center\">\r\n\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\tclass=\"mt-3\"\r\n\t\t\t\t\t\t\ttitle=\"LOC_UI_MP_LOBBY_GAME_OPTION\"\r\n\t\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\trole=\"paragraph\"\r\n\t\t\t\t\t\t\tclass=\"flow-column mb-4 mt-3 items-center pointer-events-auto\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2 max-w-full\"\r\n\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.playerCounters}}}\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div class=\"flow-row items-center max-w-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body-sm text-accent-2 mr-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_LOBBY_DIFFICULTY\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex-auto\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2\"\r\n\t\t\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.difficulty}}}\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"flow-row items-center max-w-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body-sm text-accent-2 mr-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_LOBBY_RULE_SET\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex-auto\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2\"\r\n\t\t\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.summaryMapRuleSet}}}\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"flow-row items-center max-w-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body-sm text-accent-2 mr-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_LOBBY_MAP_TYPE\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex-auto\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2\"\r\n\t\t\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.summaryMapType}}}\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"flow-row items-center max-w-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body-sm text-accent-2 mr-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_LOBBY_MAP_SIZE\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex-auto\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2\"\r\n\t\t\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.summaryMapSize}}}\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"flow-row items-center max-w-full\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"font-body-sm text-accent-2 mr-1\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_MP_LOBBY_GAME_SPEED\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex-auto\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"font-fit-shrink whitespace-nowrap font-body-sm text-accent-2\"\r\n\t\t\t\t\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id':{{g_MPLobbyModel.summarySpeed}}}\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"flex\">\r\n\t\t\t\t\t\t\t<fxs-button\r\n\t\t\t\t\t\t\t\tclass=\"rules-bot\"\r\n\t\t\t\t\t\t\t\tcaption=\"LOC_UI_MP_LOBBY_RULES\"\r\n\t\t\t\t\t\t\t\taction-key=\"inline-shell-action-2\"\r\n\t\t\t\t\t\t\t></fxs-button>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<fxs-inner-frame class=\"mp-staging__chat-frame relative flex-auto w-full\"></fxs-inner-frame>\r\n\t\t\t\t</fxs-inner-frame>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"flow-column mt-1 flex-auto player-info-slot-container\">\r\n\t\t\t\t<div class=\"flex-auto flow-column\">\r\n\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\tdisable-focus-allowed=\"true\"\r\n\t\t\t\t\t\tclass=\"player-info-slot flex-auto flow-column\"\r\n\t\t\t\t\t></fxs-spatial-slot>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"mp-staging__bot-section flow-row justify-between items-end\">\r\n\t\t\t<fxs-button\r\n\t\t\t\tclass=\"back-button mr-3\"\r\n\t\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t\t></fxs-button>\r\n\t\t\t<div class=\"mp-staging__bot-section2 flow-row-wrap flex-auto\">\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"rules-bot2 mr-3 mt-3\"\r\n\t\t\t\t\tcaption=\"LOC_UI_MP_LOBBY_RULES\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"memento-button mt-3\"\r\n\t\t\t\t\tcaption=\"LOC_UI_MP_MEMENTO\"\r\n\t\t\t\t\taction-key=\"inline-shell-action-1\"\r\n\t\t\t\t\tdata-bind-attributes=\"{'disabled': !{{g_MPLobbyModel.canEditMementos}}}\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"mp-staging__ready-description-container flow-row justify-end items-center w-60\">\r\n\t\t\t\t<p\r\n\t\t\t\t\tclass=\"mp-staging__ready-button__text font-fit-shrink whitespace-nowrap flex-auto font-title-lg text-accent-1 text-accent-1 mx-2 text-center text-right opacity-0\"\r\n\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id': {{g_MPLobbyModel.readyButtonCaption}}}\"\r\n\t\t\t\t\tdata-bind-class-toggle=\"opacity-100:['WAITING_FOR_OTHERS', 'STARTING_GAME', 'WAITING_FOR_HOST'].includes({{g_MPLobbyModel.readyStatus}})\"\r\n\t\t\t\t></p>\r\n\t\t\t\t<div class=\"w-14 h-14 flow-row justify-center items-center relative\">\r\n\t\t\t\t\t<fxs-ring-meter\r\n\t\t\t\t\t\tmax-value=\"10\"\r\n\t\t\t\t\t\tmin-value=\"0\"\r\n\t\t\t\t\t\tclass=\"mp-staging__ring-meter absolute inset-0 flex self-center align-center items-center -scale-100 transition-opacity opacity-5\"\r\n\t\t\t\t\t\tring-class=\"img-ring-meter-ring\"\r\n\t\t\t\t\t\tdata-bind-attributes=\"{'animation-duration': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}} == 10 || {{g_MPLobbyModel.readyStatus}} != 'STARTING_GAME' ? '1' : '1500', 'value': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}}}\"\r\n\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-70:{{g_MPLobbyModel.readyStatus}} == 'STARTING_GAME'\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t</fxs-ring-meter>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"mp-staging__ring-meter__text font-title-base text-secondary w-full text-center center z-1 opacity-0 transition-opacity\"\r\n\t\t\t\t\t\tdata-bind-class-toggle=\"opacity-80:{{g_MPLobbyModel.readyStatus}} == 'STARTING_GAME'\"\r\n\t\t\t\t\t\tdata-bind-attributes=\"{'data-l10n-id': {{g_MPLobbyModel.allReadyCountdownRemainingSeconds}}}\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-staging-new.css";

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
  kickHeader = MustGetElement(".mp-staging__kick-header", this.Root);
  MPLobbyDataModelProxy = new MPLobbyDataModelProxy();
  joinCodeShown = false;
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
    if (Network.hasCommunicationsPrivilege(false)) {
      this.chat = document.createElement("screen-mp-chat");
      this.chat.classList.add("flex-auto");
      this.chatNavHelp = document.createElement("fxs-nav-help");
      this.chatNavHelp.classList.add("mp-staging__chat-navhelp absolute -top-1 -right-4");
      this.chatFrame.appendChild(this.chat);
      this.chatFrame.appendChild(this.chatNavHelp);
      this.chat.addEventListener("focus", this.chatFocusListener);
      this.chat.addEventListener("engine-input", this.chatEngineInputListener);
      waitForLayout(() => {
        if (this.multiplayerChatHandle == null && this.chat?.component != null) {
          this.multiplayerChatHandle = engine.on(
            "MultiplayerChat",
            this.chat.component.onMultiplayerChat,
            this
          );
        }
      });
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
      const closeReadySpace = document.createElement("div");
      closeReadySpace.classList.add("mp-staging__ready-slot");
      closeRow.appendChild(closeReadySpace);
      const closeKickSpace = document.createElement("div");
      closeKickSpace.classList.add("mp-staging__kick-slot");
      Databind.classToggle(closeKickSpace, "hidden", "{{g_MPLobbyModel.isKickOptionHidden}}");
      closeRow.appendChild(closeKickSpace);
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
      Databind.classToggle(readyIndicatorNotReadyHover, "hidden", "{{player.isReady}} || !{{player.isHuman}}");
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
    mementosButton.addEventListener("action-activate", this.mementosButtonActivateListener);
    mementosButton.classList.toggle("hidden", !Configuration.getGame().isMementosEnabled);
    Databind.if(mementosButton, `!{{g_NavTray.isTrayRequired}}`);
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
          FocusManager.setFocus(this.chat);
        }
        this.updateFocusState();
        break;
      case "PLAYER_SLOT" /* PLAYER_SLOT */:
      case "CHAT_DIALOG" /* CHAT_DIALOG */:
        waitForLayout(() => {
          if (!ContextManager.hasInstanceOf("screen-mp-lobby") || ContextManager.getCurrentTarget() != this.Root) {
            return;
          }
          FocusManager.setFocus(this.playerInfoSlot);
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
    FocusManager.setFocus(this.playerInfoSlot);
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
    switch (inputEvent.detail.name) {
      case "cancel":
      case "mousebutton-right":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-1":
        if (Configuration.getGame().isMementosEnabled && !this.MPLobbyDataModelProxy.access().isLocalPlayerReady) {
          this.openMementos();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "shell-action-2":
        this.viewAllRules(inputEvent);
        break;
      case "shell-action-3":
        if (Network.hasCommunicationsPrivilege(false)) {
          if (this.isSmallScreen()) {
            this.openChat();
            inputEvent.stopPropagation();
            inputEvent.preventDefault();
          } else {
            if (this.chat) {
              FocusManager.setFocus(this.chat);
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
        if (Network.supportsSSO()) {
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
    this.showJoinCodeButtonTop.classList.toggle("hidden", !this.isSmallScreen() || !Network.supportsSSO());
    this.showJoinCodeButtonBot.classList.toggle("hidden", this.isSmallScreen() || !Network.supportsSSO());
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
      if (!this.playerInfoSlot.contains(FocusManager.getFocus())) {
        FocusManager.setFocus(this.playerInfoSlot);
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
        FocusManager.setFocus(this.playerInfoSlot);
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
    const currentFocus = FocusManager.getFocus();
    this.chatNavHelp?.setAttribute(
      "action-key",
      this.chat == currentFocus || this.chat?.contains(FocusManager.getFocus()) ? "inline-cancel" : "inline-shell-action-3"
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
      this.focusState = this.chat?.contains(FocusManager.getFocus()) ? "CHAT" /* CHAT */ : "PLAYER_SLOT" /* PLAYER_SLOT */;
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
    if (Configuration.getGame().isMementosEnabled) {
      NavTray.addOrUpdateShellAction1("LOC_UI_MP_MEMENTO");
    }
    if (this.isSmallScreen()) {
      NavTray.addOrUpdateShellAction2("LOC_UI_MP_LOBBY_RULES");
      if (Network.hasCommunicationsPrivilege(false)) {
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
    Network.leaveMultiplayerGame();
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
    FocusManager.setFocus(this.chat);
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
