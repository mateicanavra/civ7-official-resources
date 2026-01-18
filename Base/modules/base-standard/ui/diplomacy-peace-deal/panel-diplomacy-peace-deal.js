import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { a as DialogBoxManager, D as DialogBoxAction } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import DiplomacyManager, { DiplomacyInputPanel, DiplomacyDealProposalResponseEventName, L as LeaderModelManager } from '../diplomacy/diplomacy-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../world-input/world-input.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

const content = "<fxs-hslot\r\n\tclass=\"peace-deal__main-container w-full h-full self-center\"\r\n\tdata-audio-focus=\"generic-button-focus\"\r\n\tdata-navrule-up=\"stop\"\r\n>\r\n\t<fxs-vslot class=\"peace-deal__deal-container w-2\\/3 min-w-192 mt-12 mr-10 ml-10\">\r\n\t\t<div class=\"flex flex-row pb-6\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"local-player-leader-civ peace-deal__leader-civ-name-container relative pointer-events-none flex flex-1 flex-row justify-center w-1\\/3 pt-5\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"peace-deal__portrait mt-4 relative pointer-events-none size-16\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"peace-deal__portrait-image absolute self-center size-22 -mt-3\\.5 pointer-events-none bg-no-repeat bg-contain\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"peace-deal__civ-icon mt-4 ml-2 relative pointer-events-none\">\r\n\t\t\t\t\t<div class=\"peace-deal__civ-icon-image size-16 bg-no-repeat\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"peace-deal__title-card w-1\\/3 flex flex-col mt-8\">\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"peace-deal__title fxs-header font-title text-lg uppercase text-center tracking-150\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"peace-deal__to-end fxs-header self-center font-title text-xxs uppercase text-center tracking-150\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"peace-deal__war-name fxs-header self-center font-title text-lg uppercase text-center tracking-150\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"peace-deal__select-settlements self-center font-body text-xs text-accent-2 mt-3\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"other-player-leader-civ peace-deal__leader-civ-name-container relative pointer-events-none flex flex-1 flex-row justify-center w-1\\/3 pt-5\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"peace-deal__civ-icon mt-4 mr-2 relative pointer-events-none\">\r\n\t\t\t\t\t<div class=\"peace-deal__civ-icon-image size-16\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"peace-deal__portrait mt-4 relative pointer-events-none size-16 flex flex-col\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"peace-deal__portrait-image absolute self-center size-22 -mt-3\\.5 pointer-events-none bg-no-repeat bg-contain\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"flex flex-1 flex-col\">\r\n\t\t\t<div class=\"flex flex-row w-full px-5 mt-2 min-h-12 max-h-18\">\r\n\t\t\t\t<div class=\"local-player-leader-name flex flex-col flex-end w-1\\/3\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"player-info__leader-name-text fxs-header font-title text-base uppercase text-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"peace-deal__playername-bar filigree-shell-small bottom-bar h-6 w-3\\/4 self-center bg-no-repeat bg-contain bg-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"player-info__outside-bar\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<fxs-inner-frame class=\"peace-deal__offer-header-wrapper flex flex-row w-1\\/3 justify-center -mt-4\">\r\n\t\t\t\t\t<div class=\"flex flex-row items-center justify-center items-center h-1\\/3\">\r\n\t\t\t\t\t\t<div class=\"filigree-h4-left items-center\"></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"peace-deal__offer-header font-title uppercase text-lg fxs-header text-center justify-center\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div class=\"filigree-h4-right items-center\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-inner-frame>\r\n\t\t\t\t<div class=\"other-player-leader-name flex flex-col flex-end w-1\\/3\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"player-info__leader-name-text fxs-header font-title text-lg uppercase text-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"peace-deal__playername-bar filigree-shell-small bottom-bar h-4 w-3\\/4 self-center bg-no-repeat bg-contain bg-center\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"player-info__outside-bar\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<fxs-scrollable class=\"peace-deal__settlement-scrollable flex-1\">\r\n\t\t\t\t<fxs-hslot\r\n\t\t\t\t\tclass=\"pl-5 pr-5 mb-0 -mt-4 h-full flex flex-row flex-wrap peace-deal__navigation-container\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<fxs-vslot class=\"local-player-deal-container local-player-settlements w-1\\/3 flex flex-col px-3\">\r\n\t\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\t\tclass=\"peace-deal__deal-items flex flex-col\"\r\n\t\t\t\t\t\t\tdata-audio-focus=\"generic-button-focus\"\r\n\t\t\t\t\t\t></fxs-vslot>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t\t<fxs-vslot class=\"peace-deal__offer-container w-1\\/3 -mt-6 relative flex flex-col h-full\">\r\n\t\t\t\t\t\t<div class=\"peace-deal__local-player-receives-container w-full flex flex-col justify-start p-3\">\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"peace-deal__local-player-receives-title-wrapper hidden relative flex flex-row justify-center min-h-0 max-h-full\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t<div class=\"peace-deal__local-player-receives-title-bg absolute size-full\"></div>\r\n\t\t\t\t\t\t\t\t<div class=\"peace-deal__local-player-receives-icon-wrapper relative mr-1 -mt-1\"></div>\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"peace-deal__local-player-receives-title flex font-fit-shrink font-title text-xs text-accent-1 uppercase text-center justify-center items-center relative\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"peace-deal__local-player-receives-settlements\"></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"peace-deal__other-player-receives-container w-full flex flex-col justify-start p-3 grow\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"peace-deal__other-player-receives-title-wrapper hidden relative flex flex-row justify-center min-h-0 max-h-full\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t<div class=\"peace-deal__other-player-receives-title-bg absolute size-full\"></div>\r\n\t\t\t\t\t\t\t\t<div class=\"peace-deal__other-player-receives-icon-wrapper relative mr-1 -mt-1\"></div>\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"peace-deal__other-player-receives-title flex font-fit-shrink font-title text-xs text-accent-1 uppercase text-center justify-center items-center relative\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<div class=\"peace-deal__other-player-receives-settlements\"></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\tclass=\"other-player-deal-container other-player-settlements flex-1 flex flex-col px-3 w-1\\/3\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\t\tclass=\"peace-deal__deal-items flex flex-col\"\r\n\t\t\t\t\t\t\tdata-audio-focus=\"generic-button-focus\"\r\n\t\t\t\t\t\t></fxs-vslot>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t</fxs-hslot>\r\n\t\t\t</fxs-scrollable>\r\n\t\t\t<div class=\"w-full flex flex-col justify-center items-center\">\r\n\t\t\t\t<div class=\"filigree-inner-frame-bottom w-1\\/3 -mt-3\"></div>\r\n\t\t\t</div>\r\n\t\t\t<fxs-hslot class=\"peace-deal__button-container mt-0 pt-5 pb-3 justify-center w-full flex flex-nowrap\">\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"peace-deal__propose-deal-button h-10 w-32 mr-4 ml-4\"\r\n\t\t\t\t\taction-key=\"inline-shell-action-1\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"peace-deal__reject-deal-button h-10 w-32 mr-4 ml-4\"\r\n\t\t\t\t\taction-key=\"inline-cancel\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</fxs-hslot>\r\n\t\t\t<fxs-hslot class=\"panel-diplomacy-peace-deal__inspect-wrapper justify-center pb-2\"></fxs-hslot>\r\n\t\t</div>\r\n\t\t<fxs-close-button class=\"top-1 right-1\"></fxs-close-button>\r\n\t</fxs-vslot>\r\n</fxs-hslot>\r\n";

const styles = "fs://game/base-standard/ui/diplomacy-peace-deal/panel-diplomacy-peace-deal.css";

class DiplomacyPeaceDealPanel extends DiplomacyInputPanel {
  interfaceModeChangedListener = this.onInterfaceModeChanged.bind(this);
  diplomacyDialogRequestCloseListener = () => {
    this.onRequestClose();
  };
  diplomacyDealProposalResponseListener = (eventData) => {
    this.onDealProposalResponse(eventData.detail);
  };
  viewReceiveFocusListener = this.onViewReceiveFocus.bind(this);
  onResizeEventListener = this.resizeFonts.bind(this);
  closeButton = null;
  ourLeaderAndCivContainer = null;
  ourLeaderNameContainer = null;
  theirLeaderAndCivContainer = null;
  theirLeaderNameContainer = null;
  ourLeaderNameText = null;
  ourCivNameText = null;
  theirLeaderNameText = null;
  theirCivNameText = null;
  ourPlayerPortrait = null;
  theirPlayerPortrait = null;
  ourPlayerCivIcon = null;
  theirPlayerCivIcon = null;
  ourYourDealItemsContainer = null;
  ourTheirDealItemsContainer = null;
  theirTheirDealItemsContainer = null;
  theirYourDealItemsContainer = null;
  localPlayerDealContainer = null;
  otherPlayerDealContainer = null;
  peaceDealNavigationContainer = null;
  peaceDealOfferContainer = null;
  peaceDealOfferHeader = null;
  localPlayerReceivesTitleWrapper = null;
  otherPlayerReceivesTitleWrapper = null;
  localPlayerReceivesTitle = null;
  otherPlayerReceivesTitle = null;
  proposeButton = null;
  rejectButton = null;
  warHeader = null;
  isNewDeal = false;
  isAI = false;
  isWaitingForStatement = false;
  currentWorkingDealID = null;
  needsUpdate = false;
  positiveReactionPlayed = false;
  negativeReactionPlayed = false;
  pendingDealAdditions = [];
  pendingDealRemovals = [];
  dealHasBeenModified = false;
  dealSessionID;
  onAttach() {
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.addEventListener("diplomacy-dialog-request-close", this.diplomacyDialogRequestCloseListener);
    window.addEventListener(DiplomacyDealProposalResponseEventName, this.diplomacyDealProposalResponseListener);
    window.addEventListener("resize", this.onResizeEventListener);
    this.Root.addEventListener("view-receive-focus", this.viewReceiveFocusListener);
    this.closeButton = this.Root.querySelector("fxs-close-button");
    if (!this.closeButton) {
      console.error("panel-diplomacy-peace-deal: Unable to find element: fxs-close-button");
    } else {
      this.closeButton?.addEventListener("action-activate", this.closeDealWithoutResponse.bind(this));
    }
    this.ourLeaderAndCivContainer = this.Root.querySelector(".local-player-leader-civ");
    if (!this.ourLeaderAndCivContainer) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class: local-player-leader-civ");
      return;
    }
    this.ourLeaderNameContainer = this.Root.querySelector(".local-player-leader-name");
    if (!this.ourLeaderNameContainer) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class: local-player-leader-name");
      return;
    }
    this.theirLeaderAndCivContainer = this.Root.querySelector(".other-player-leader-civ");
    if (!this.theirLeaderAndCivContainer) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class: other-player-leader-civ");
      return;
    }
    this.theirLeaderNameContainer = this.Root.querySelector(".other-player-leader-name");
    if (!this.theirLeaderNameContainer) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class: other-player-leader-name");
      return;
    }
    this.ourLeaderNameText = this.ourLeaderNameContainer.querySelector(".player-info__leader-name-text");
    this.ourCivNameText = this.ourLeaderAndCivContainer.querySelector(".peace-deal__civ-name-text");
    this.theirLeaderNameText = this.theirLeaderNameContainer.querySelector(".player-info__leader-name-text");
    this.theirCivNameText = this.theirLeaderAndCivContainer.querySelector(".peace-deal__civ-name-text");
    this.ourPlayerPortrait = this.ourLeaderAndCivContainer.querySelector(".peace-deal__portrait-image");
    this.theirPlayerPortrait = this.theirLeaderAndCivContainer.querySelector(".peace-deal__portrait-image");
    this.ourPlayerCivIcon = this.ourLeaderAndCivContainer.querySelector(".peace-deal__civ-icon-image");
    this.theirPlayerCivIcon = this.theirLeaderAndCivContainer.querySelector(".peace-deal__civ-icon-image");
    this.localPlayerReceivesTitleWrapper = this.Root.querySelector(
      ".peace-deal__local-player-receives-title-wrapper"
    );
    this.otherPlayerReceivesTitleWrapper = this.Root.querySelector(
      ".peace-deal__other-player-receives-title-wrapper"
    );
    const peaceDealTitle = this.Root.querySelector(".peace-deal__title");
    if (!peaceDealTitle) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class .peace-deal__title");
      return;
    }
    peaceDealTitle.innerHTML = Locale.compose("LOC_DIPLOMACY_DEAL_PEACE_TITLE");
    const peaceDealToEndText = this.Root.querySelector(".peace-deal__to-end");
    if (!peaceDealToEndText) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class .peace-deal__to-end");
      return;
    }
    peaceDealToEndText.innerHTML = Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_TO_END");
    this.proposeButton = this.Root.querySelector(".peace-deal__propose-deal-button");
    this.rejectButton = this.Root.querySelector(".peace-deal__reject-deal-button");
    this.proposeButton?.addEventListener("action-activate", () => {
      this.clickProposeButton();
    });
    this.proposeButton?.setAttribute("data-audio-activate-ref", "none");
    this.rejectButton?.addEventListener("action-activate", () => {
      this.clickRejectButton();
    });
    this.peaceDealNavigationContainer = this.Root.querySelector(".peace-deal__navigation-container");
    if (!this.peaceDealNavigationContainer) {
      console.error("navigationcontainer couldn't be found");
      return;
    }
    this.localPlayerDealContainer = this.peaceDealNavigationContainer.querySelector(".local-player-deal-container");
    this.otherPlayerDealContainer = this.peaceDealNavigationContainer.querySelector(".other-player-deal-container");
    if (!this.otherPlayerDealContainer || !this.localPlayerDealContainer) {
      console.error("panel-diplomacy-peace-deal: Unable to find one or more player settlement containers!");
      return;
    }
    this.peaceDealOfferContainer = MustGetElement(
      ".peace-deal__offer-container",
      this.peaceDealNavigationContainer
    );
    this.peaceDealOfferHeader = MustGetElement(".peace-deal__offer-header", this.Root);
    this.peaceDealOfferHeader.innerHTML = Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_OFFER");
    this.localPlayerReceivesTitle = MustGetElement(
      ".peace-deal__local-player-receives-title",
      this.peaceDealOfferContainer
    );
    const localPlayerLibrary = Players.get(GameContext.localPlayerID);
    if (!localPlayerLibrary) {
      console.error("panel-diplomacy-peace-deal: No valid PlayerLibrary for local player!");
      return;
    }
    const ourPlayer = Configuration.getPlayer(localPlayerLibrary.id);
    if (!ourPlayer.leaderTypeName) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player leader icon, but no valid leaderTypeName!"
      );
      return;
    }
    const ourReceivesIcon = document.createElement("leader-icon");
    ourReceivesIcon.classList.add("w-8", "h-8", "pointer-events-auto");
    ourReceivesIcon.setAttribute("leader", ourPlayer.leaderTypeName);
    ourReceivesIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(localPlayerLibrary.id));
    ourReceivesIcon.setAttribute("fg-color", "white");
    const localPlayerReceivesTitleWrapper = MustGetElement(
      ".peace-deal__local-player-receives-title-wrapper",
      this.Root
    );
    const localPlayerReceivesIconWrapper = MustGetElement(
      ".peace-deal__local-player-receives-icon-wrapper",
      this.Root
    );
    localPlayerReceivesTitleWrapper.style.setProperty(
      "--local-player-color",
      UI.Player.getPrimaryColorValueAsString(localPlayerLibrary.id)
    );
    this.localPlayerReceivesTitle.innerHTML = Locale.compose(localPlayerLibrary.leaderName) + " " + Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_RECEIVES");
    localPlayerReceivesIconWrapper.appendChild(ourReceivesIcon);
    this.ourYourDealItemsContainer = MustGetElement(".peace-deal__deal-items", this.localPlayerDealContainer);
    this.theirTheirDealItemsContainer = MustGetElement(".peace-deal__deal-items", this.otherPlayerDealContainer);
    this.ourTheirDealItemsContainer = MustGetElement(
      ".peace-deal__local-player-receives-settlements",
      this.peaceDealOfferContainer
    );
    this.theirYourDealItemsContainer = MustGetElement(
      ".peace-deal__other-player-receives-settlements",
      this.peaceDealOfferContainer
    );
    if (!this.checkShouldShowPanel()) {
      return;
    }
    this.queueUpdate();
  }
  onDetach() {
    window.removeEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.removeEventListener("diplomacy-dialog-request-close", this.diplomacyDialogRequestCloseListener);
    window.removeEventListener(DiplomacyDealProposalResponseEventName, this.diplomacyDealProposalResponseListener);
    window.removeEventListener("resize", this.onResizeEventListener);
    this.Root.removeEventListener("view-receive-focus", this.viewReceiveFocusListener);
  }
  onRequestClose() {
    this.closeCurrentDeal();
  }
  onViewReceiveFocus() {
    this.realizeInitialFocus();
  }
  resizeFonts() {
    if (this.ourLeaderNameText) {
      this.ourLeaderNameText.classList.toggle("text-lg", window.innerHeight > Layout.pixelsToScreenPixels(1e3));
      this.ourLeaderNameText.classList.toggle(
        "text-base",
        window.innerHeight < Layout.pixelsToScreenPixels(1e3)
      );
    }
    if (this.theirLeaderNameText) {
      this.theirLeaderNameText.classList.toggle(
        "text-lg",
        window.innerHeight > Layout.pixelsToScreenPixels(1e3)
      );
      this.theirLeaderNameText.classList.toggle(
        "text-base",
        window.innerHeight < Layout.pixelsToScreenPixels(1e3)
      );
    }
    const warNameText = this.Root.querySelector(".peace-deal__war-name");
    if (!warNameText) {
      console.error("panel-diplomacy-peace-deal: Can not find element with class .peace-deal__war-name");
      return;
    }
    warNameText.classList.toggle("text-base", window.innerHeight < Layout.pixelsToScreenPixels(1e3));
    warNameText.classList.toggle("text-lg", window.innerHeight > Layout.pixelsToScreenPixels(1e3));
    const peaceDealItems = this.Root.querySelectorAll(".peace-deal__deal-item-settlement-info");
    if (!peaceDealItems) {
      console.error(
        "panel-diplomacy-peace-deal: Can not find element with class .peace-deal__deal-item-settlement-info"
      );
      return;
    }
    peaceDealItems.forEach((dealItem) => {
      dealItem.classList.toggle("text-xs", window.innerHeight < Layout.pixelsToScreenPixels(1e3));
      dealItem.classList.toggle("text-sm", window.innerHeight > Layout.pixelsToScreenPixels(1e3));
    });
    if (this.peaceDealOfferHeader) {
      this.peaceDealOfferHeader.classList.toggle(
        "text-base",
        window.innerHeight < Layout.pixelsToScreenPixels(1e3)
      );
      this.peaceDealOfferHeader.classList.toggle(
        "text-lg",
        window.innerHeight > Layout.pixelsToScreenPixels(1e3)
      );
    }
    const peaceDealTitle = this.Root.querySelector(".peace-deal__title");
    if (!peaceDealTitle) {
      console.error("panel-diplomacy-peace-deal: Unable to find element with class .peace-deal__title");
      return;
    }
    peaceDealTitle.classList.toggle("text-base", window.innerHeight < Layout.pixelsToScreenPixels(1e3));
  }
  onDealProposalResponse(detail) {
    if (detail) {
      if (this.isNewDeal) {
        this.dealSessionID = detail.sessionId;
      }
      const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
      const otherPlayerLibrary = Players.get(otherPlayerID);
      const forced = true;
      const posNegTimerOtherAlreadyPlayed = 500;
      const posNegTimerOtherHasntPlayed = 100;
      if (detail.values?.RespondingToDealAction == DiplomacyDealProposalActions.INSPECT && otherPlayerLibrary) {
        if (detail.values?.DealAction == DiplomacyDealProposalActions.ACCEPTED) {
          if (!this.isNewDeal) {
            this.updateButtonStates();
          }
          if (this.positiveReactionPlayed == false) {
            if (this.negativeReactionPlayed == true) {
              setTimeout(() => {
                LeaderModelManager.beginAcknowledgePositiveOtherSequence(forced);
              }, posNegTimerOtherAlreadyPlayed);
            } else {
              setTimeout(() => {
                LeaderModelManager.beginAcknowledgePositiveOtherSequence(forced);
              }, posNegTimerOtherHasntPlayed);
            }
            this.negativeReactionPlayed = false;
            this.positiveReactionPlayed = true;
          }
          const inspectWrapper = MustGetElement(".panel-diplomacy-peace-deal__inspect-wrapper", this.Root);
          inspectWrapper.innerHTML = "";
          const inspectPosNegImgWrapper = document.createElement("div");
          inspectPosNegImgWrapper.classList.value = "peace-deal__radial-bg flex bg-cover size-9";
          const inspectPosNegImg = document.createElement("img");
          inspectPosNegImg.classList.add(
            "justify-center",
            "panel-diplomacy-peace-deal__pos-neg-preview-image",
            "size-8",
            "ml-0\\.5",
            "mt-0\\.5"
          );
          inspectPosNegImg.src = "fs://game/dip_esp_success_icon.png";
          inspectPosNegImgWrapper.appendChild(inspectPosNegImg);
          inspectWrapper.appendChild(inspectPosNegImgWrapper);
          const inspectPosNegTextWrapper = document.createElement("div");
          inspectPosNegTextWrapper.classList.value = "justify-center items-center flex text-base";
          const inspectPosNegText = Locale.stylize(
            "LOC_DIPLOMACY_PEACE_DEAL_WILL_ACCEPT",
            otherPlayerLibrary.name
          );
          inspectPosNegTextWrapper.innerHTML = inspectPosNegText;
          inspectWrapper.appendChild(inspectPosNegTextWrapper);
          this.pendingDealAdditions = [];
          this.pendingDealRemovals = [];
        } else {
          if (this.negativeReactionPlayed == false) {
            if (this.positiveReactionPlayed == true) {
              setTimeout(() => {
                LeaderModelManager.beginAcknowledgeNegativeOtherSequence(forced);
              }, posNegTimerOtherAlreadyPlayed);
            } else {
              setTimeout(() => {
                LeaderModelManager.beginAcknowledgeNegativeOtherSequence(forced);
              }, posNegTimerOtherHasntPlayed);
            }
            this.negativeReactionPlayed = true;
            this.positiveReactionPlayed = false;
          }
          const inspectWrapper = MustGetElement(".panel-diplomacy-peace-deal__inspect-wrapper", this.Root);
          inspectWrapper.innerHTML = "";
          const inspectPosNegImgWrapper = document.createElement("div");
          inspectPosNegImgWrapper.classList.value = "peace-deal__radial-bg flex bg-cover size-9";
          const inspectPosNegImg = document.createElement("img");
          inspectPosNegImg.classList.add(
            "justify-center",
            "panel-diplomacy-peace-deal__pos-neg-preview-image",
            "size-8",
            "ml-0\\.5",
            "mt-0\\.5"
          );
          inspectPosNegImg.src = "fs://game/dip_esp_fail_icon.png";
          inspectPosNegImgWrapper.appendChild(inspectPosNegImg);
          inspectWrapper.appendChild(inspectPosNegImgWrapper);
          const inspectPosNegTextWrapper = document.createElement("div");
          inspectPosNegTextWrapper.classList.value = "justify-center items-center flex text-base";
          const inspectPosNegText = Locale.stylize(
            "LOC_DIPLOMACY_PEACE_DEAL_WILL_REJECT",
            otherPlayerLibrary.name
          );
          inspectPosNegTextWrapper.innerHTML = inspectPosNegText;
          inspectWrapper.appendChild(inspectPosNegTextWrapper);
          this.pendingDealAdditions = [];
          this.pendingDealRemovals = [];
        }
      }
    }
  }
  queueUpdate() {
    if (!this.needsUpdate) {
      this.needsUpdate = true;
      requestAnimationFrame(() => {
        this.populatePeaceDeal();
        this.needsUpdate = false;
      });
    }
  }
  populatePeaceDeal() {
    this.otherPlayerReceivesTitle = MustGetElement(".peace-deal__other-player-receives-title", this.Root);
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    const otherPlayerLibrary = Players.get(otherPlayerID);
    if (!otherPlayerLibrary) {
      console.error("panel-diplomacy-peace-deal: No valid PlayerLibrary for other player!");
      return;
    }
    const theirPlayer = Configuration.getPlayer(otherPlayerLibrary.id);
    if (!theirPlayer.leaderTypeName) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player leader icon, but no valid leaderTypeName!"
      );
      return;
    }
    const otherPlayerReceivesIconWrapper = MustGetElement(
      ".peace-deal__other-player-receives-icon-wrapper",
      this.Root
    );
    while (otherPlayerReceivesIconWrapper.hasChildNodes()) {
      otherPlayerReceivesIconWrapper.removeChild(otherPlayerReceivesIconWrapper.lastChild);
    }
    const otherPlayerReceivesTitleWrapper = MustGetElement(
      ".peace-deal__other-player-receives-title-wrapper",
      this.Root
    );
    const theirReceivesIcon = document.createElement("leader-icon");
    theirReceivesIcon.classList.add("w-8", "h-8", "pointer-events-auto");
    theirReceivesIcon.setAttribute("leader", theirPlayer.leaderTypeName);
    theirReceivesIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(otherPlayerLibrary.id));
    theirReceivesIcon.setAttribute("fg-color", "white");
    otherPlayerReceivesTitleWrapper.style.setProperty(
      "--other-player-color",
      UI.Player.getPrimaryColorValueAsString(otherPlayerLibrary.id)
    );
    this.otherPlayerReceivesTitle.innerHTML = Locale.compose(otherPlayerLibrary.leaderName) + " " + Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_RECEIVES");
    otherPlayerReceivesIconWrapper.appendChild(theirReceivesIcon);
    this.proposeButton?.classList.remove("disabled");
    this.rejectButton?.classList.remove("disabled");
    while (this.ourYourDealItemsContainer?.hasChildNodes()) {
      this.ourYourDealItemsContainer.removeChild(this.ourYourDealItemsContainer.lastChild);
    }
    while (this.theirTheirDealItemsContainer?.hasChildNodes()) {
      this.theirTheirDealItemsContainer.removeChild(this.theirTheirDealItemsContainer.lastChild);
    }
    while (this.ourTheirDealItemsContainer?.hasChildNodes()) {
      this.ourTheirDealItemsContainer.removeChild(this.ourTheirDealItemsContainer.lastChild);
    }
    while (this.theirYourDealItemsContainer?.hasChildNodes()) {
      this.theirYourDealItemsContainer.removeChild(this.theirYourDealItemsContainer.lastChild);
    }
    const localPlayerLibrary = Players.get(GameContext.localPlayerID);
    if (!localPlayerLibrary) {
      console.error("panel-diplomacy-peace-deal: No valid PlayerLibrary for local player!");
      return;
    }
    this.realizePlayerVisuals(localPlayerLibrary, otherPlayerLibrary);
    const acceptRejectWrapper = MustGetElement(".panel-diplomacy-peace-deal__inspect-wrapper", this.Root);
    if (!document.querySelector(".panel-diplomacy-peace-deal__accept-reject-status")) {
      const acceptRejectValues = document.createElement("div");
      acceptRejectValues.classList.value = "text-center flow-row";
      const acceptRejectIcon = document.createElement("div");
      acceptRejectIcon.classList.value = "size-12";
      acceptRejectValues.appendChild(acceptRejectIcon);
      const acceptRejectText = document.createElement("div");
      acceptRejectText.classList.value = "font-body text-xs";
      const acceptRejectLeader = document.createElement("div");
      acceptRejectLeader.classList.value = "panel-diplomacy-peace-deal_accept-reject-leader justify-center";
      acceptRejectText.appendChild(acceptRejectLeader);
      const acceptRejectStatus = document.createElement("div");
      acceptRejectStatus.classList.value = "panel-diplomacy-peace-deal__accept-reject-status";
      acceptRejectText.appendChild(acceptRejectStatus);
      acceptRejectValues.appendChild(acceptRejectText);
      acceptRejectWrapper.appendChild(acceptRejectValues);
    }
    const jointEvents = Game.Diplomacy.getJointEvents(
      GameContext.localPlayerID,
      otherPlayerID,
      false
    );
    if (jointEvents.length > 0) {
      jointEvents.forEach((jointEvent) => {
        if (jointEvent.actionTypeName == "DIPLOMACY_ACTION_DECLARE_WAR") {
          this.warHeader = jointEvent;
        }
      });
    }
    if (this.warHeader === null) {
      console.error(
        "panel-diplomacy-peace-deal: Can not populate peace deal as there is no war between local player and player with ID: " + otherPlayerID
      );
      return;
    }
    const warData = Game.Diplomacy.getWarData(this.warHeader.uniqueID, GameContext.localPlayerID);
    const warUIData = Game.Diplomacy.getProjectDataForUI(
      this.warHeader.initialPlayer,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
      DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
    ).find((project) => project.actionID == this.warHeader?.uniqueID);
    if (warUIData == void 0) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to get war data, but there is no valid DiplomaticProjectUIData for the war diplomatic event"
      );
      return;
    }
    const warNameText = this.Root.querySelector(".peace-deal__war-name");
    if (!warNameText) {
      console.error("panel-diplomacy-peace-deal: Can not find element with class .peace-deal__war-name");
      return;
    }
    warNameText.innerHTML = warData.warName;
    const selectSettlementText = this.Root.querySelector(".peace-deal__select-settlements");
    if (!selectSettlementText) {
      console.error(
        "panel-diplomacy-peace-deal: Can not find element with class .peace-deal__select-settlements"
      );
    }
    selectSettlementText?.setAttribute("data-l10n-id", "LOC_DIPLOMACY_PEACE_DEAL_SELECT_SETTLEMENTS");
    const workingDealId = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.WorkingDealID : {
      direction: DiplomacyDealDirection.OUTGOING,
      player1: GameContext.localPlayerID,
      player2: DiplomacyManager.selectedPlayerID
    };
    this.setWorkingDealID(workingDealId);
    if (!DiplomacyManager.currentDiplomacyDealData) {
      this.isNewDeal = true;
      Game.DiplomacyDeals.clearWorkingDeal(workingDealId);
      const initialPeaceDealItem = {
        type: DiplomacyDealItemTypes.AGREEMENTS,
        agreementType: DiplomacyDealItemAgreementTypes.MAKE_PEACE
      };
      Game.DiplomacyDeals.addItemToWorkingDeal(workingDealId, initialPeaceDealItem);
      this.proposeButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_PROPOSE"));
      this.rejectButton?.setAttribute("caption", Locale.compose("LOC_GENERIC_CANCEL"));
    } else {
      this.proposeButton?.setAttribute("caption", Locale.compose("LOC_GENERIC_ACCEPT"));
      this.rejectButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_REJECT"));
    }
    const workingDeal = Game.DiplomacyDeals.getWorkingDeal(workingDealId);
    if (!workingDeal) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to get the working deal between local player: " + GameContext.localPlayerID + " and other player: " + DiplomacyManager.selectedPlayerID
      );
      return;
    }
    workingDeal?.itemIds.forEach((itemID) => {
      const dealItem = Game.DiplomacyDeals.getWorkingDealItem(workingDealId, itemID);
      if (!dealItem || !dealItem.cityId || dealItem.cityId.id == -1) {
        console.warn(`panel-diplomacy-peace-deal: No city-based items for deal item ${itemID}`);
        return;
      }
      const city = Cities.get(dealItem.cityId);
      if (!city) {
        console.error(
          `panel-diplomacy-peace-deal: Unable to get deal item ${dealItem} city with ID: ${dealItem.cityId.id}`
        );
        return;
      }
      const cityDealItemElement = this.createCityDealItem(city, dealItem.cityTransferType);
      cityDealItemElement.addEventListener("action-activate", () => {
        this.moveDealItem(dealItem, dealItem.to, true, cityDealItemElement);
      });
      let ownerIsLocalPlayer = city.owner == GameContext.localPlayerID;
      if (dealItem.subType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
        ownerIsLocalPlayer = !ownerIsLocalPlayer;
      }
      if (ownerIsLocalPlayer) {
        this.theirYourDealItemsContainer?.appendChild(cityDealItemElement);
        this.otherPlayerReceivesTitleWrapper?.classList.remove("hidden");
      } else {
        this.ourTheirDealItemsContainer?.appendChild(cityDealItemElement);
        this.localPlayerReceivesTitleWrapper?.classList.remove("hidden");
      }
    });
    const citiesFromLocalPlayer = Game.DiplomacyDeals.getPossibleWorkingDealItems(
      workingDealId,
      GameContext.localPlayerID,
      DiplomacyDealItemTypes.CITIES
    );
    citiesFromLocalPlayer.forEach((dealItem) => {
      if (!dealItem.cityId) {
        return;
      }
      if (dealItem.subType != DiplomacyDealItemCityTransferTypes.OFFER) {
        return;
      }
      let alreadyInDeal = false;
      workingDeal?.itemIds.forEach((itemID) => {
        const workingDealItem = Game.DiplomacyDeals.getWorkingDealItem(
          workingDealId,
          itemID
        );
        if (workingDealItem?.cityId?.id == dealItem.cityId?.id) {
          alreadyInDeal = true;
          return;
        }
      });
      if (alreadyInDeal) {
        return;
      }
      const city = Cities.get(dealItem.cityId);
      if (!city) {
        console.error(
          "screen-diplomacy-peace-deal: onAttach(): Unable to get City with ID: " + dealItem.cityId.id
        );
        return;
      }
      if (city.originalOwner == GameContext.localPlayerID && city.owner != GameContext.localPlayerID) {
        return;
      }
      const cityDealItemElement = this.createCityDealItem(city);
      cityDealItemElement.addEventListener("action-activate", () => {
        this.moveDealItem(dealItem, GameContext.localPlayerID, false, cityDealItemElement);
      });
      this.ourYourDealItemsContainer?.appendChild(cityDealItemElement);
    });
    const citiesFromOtherPlayer = Game.DiplomacyDeals.getPossibleWorkingDealItems(
      workingDealId,
      otherPlayerID,
      DiplomacyDealItemTypes.CITIES
    );
    citiesFromOtherPlayer.forEach((dealItem) => {
      if (!dealItem.cityId) {
        return;
      }
      if (dealItem.subType != DiplomacyDealItemCityTransferTypes.OFFER) {
        return;
      }
      let alreadyInDeal = false;
      workingDeal?.itemIds.forEach((itemID) => {
        const workingDealItem = Game.DiplomacyDeals.getWorkingDealItem(
          workingDealId,
          itemID
        );
        if (workingDealItem?.cityId?.id == dealItem.cityId?.id) {
          alreadyInDeal = true;
          return;
        }
      });
      if (alreadyInDeal) {
        return;
      }
      const city = Cities.get(dealItem.cityId);
      if (!city) {
        console.error(
          "screen-diplomacy-peace-deal: onAttach(): Unable to get City with ID: " + dealItem.cityId.id
        );
        return;
      }
      if (city.originalOwner == otherPlayerID && city.owner != otherPlayerID) {
        return;
      }
      const cityDealItemElement = this.createCityDealItem(city);
      cityDealItemElement.addEventListener("action-activate", () => {
        this.moveDealItem(dealItem, otherPlayerID, false, cityDealItemElement);
      });
      this.theirTheirDealItemsContainer?.appendChild(cityDealItemElement);
    });
    this.updateButtonStates();
    this.showLeaderModel();
    const isOtherPlayerHuman = otherPlayerLibrary?.isHuman;
    if (this.isNewDeal || this.pendingDealAdditions.length > 0 || this.pendingDealRemovals.length > 0) {
      this.inspectCurrentDeal(isOtherPlayerHuman);
    }
    if (!this.ourTheirDealItemsContainer?.hasChildNodes()) {
      this.localPlayerReceivesTitleWrapper?.classList.add("hidden");
    }
    if (!this.theirYourDealItemsContainer?.hasChildNodes()) {
      this.otherPlayerReceivesTitleWrapper?.classList.add("hidden");
    }
  }
  createCityDealItem(city, transferType) {
    const dealItem = document.createElement("chooser-item");
    const theCityID = city.id.owner.toString() + ";" + city.id.id.toString() + ";" + city.id.type.toString() + ";";
    dealItem.classList.add(
      "peace-deal__deal-item",
      "chooser-item_unlocked",
      "relative",
      "w-full",
      "min-h-22",
      "flex",
      "flex-row",
      "pointer-events-auto",
      "mt-2"
    );
    dealItem.setAttribute("tabindex", "-1");
    dealItem.setAttribute("action-key", "inline-confirm");
    dealItem.setAttribute("data-tooltip-style", "peaceDeal");
    dealItem.setAttribute("componentid", theCityID);
    dealItem.setAttribute("node-id", city.name);
    dealItem.setAttribute("data-audio-group-ref", "peace-deal-item");
    const isCede = transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED;
    dealItem.setAttribute("occupied", isCede ? "true" : "false");
    const owner = Players.get(city.owner);
    if (!owner) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to get player library for owner of city! City ID: " + city.id + "  Owner ID: " + city.owner
      );
      return dealItem;
    }
    const settlementIconBGOuter = document.createElement("div");
    settlementIconBGOuter.classList.add(
      "peace-deal__settlement-icon-bg-outer",
      "relative",
      "size-25",
      "self-center",
      "pointer-events-none",
      "bg-contain",
      "bg-no-repeat",
      "ml-0"
    );
    settlementIconBGOuter.style.setProperty(
      "--owner-color-primary",
      UI.Player.getPrimaryColorValueAsString(city.originalOwner)
    );
    const settlementIconBGInner = document.createElement("div");
    settlementIconBGInner.classList.add(
      "peace-deal__settlement-icon-bg-inner",
      "size-18",
      "self-center",
      "pointer-events-none",
      "bg-contain",
      "bg-no-repeat",
      "ml-0"
    );
    settlementIconBGInner.style.setProperty(
      "--owner-color-primary",
      UI.Player.getPrimaryColorValueAsString(city.originalOwner)
    );
    settlementIconBGInner.style.setProperty(
      "--owner-color-secondary",
      UI.Player.getSecondaryColorValueAsString(city.originalOwner)
    );
    const settlementIconBG = document.createElement("div");
    settlementIconBG.classList.add(
      "peace-deal__settlement-icon-bg",
      "h-18",
      "w-18",
      "relative",
      "self-center",
      "pointer-events-none",
      "bg-contain",
      "bg-no-repeat",
      "ml-0",
      "mt-3"
    );
    settlementIconBG.style.setProperty(
      "--owner-color-primary",
      UI.Player.getPrimaryColorValueAsString(city.originalOwner)
    );
    const settlementIcon = document.createElement("div");
    settlementIcon.classList.add(
      "peace-deal__settlement-icon-image",
      "size-16",
      "-mt-18",
      "bg-center",
      "bg-no-repeat",
      "bg-contain",
      "self-center",
      "relative"
    );
    if (city.isTown) {
      settlementIcon.style.backgroundImage = `url(blp:Yield_Towns)`;
    } else {
      settlementIcon.style.backgroundImage = `url(blp:Yield_Cities)`;
    }
    const populationBackground = document.createElement("div");
    populationBackground.classList.value = "peace-deal__settlement-population-bg self-end h-10 w-20 -left-0\\.5 top-2\\/3 relative opacity-50";
    const settlementPopulation = document.createElement("div");
    settlementPopulation.classList.add(
      "self-center",
      "font-title",
      "text-sm",
      "text-center",
      "w-7",
      "peace-deal__deal-item-settlement-population",
      "relative",
      "mt-1"
    );
    settlementIconBGOuter.appendChild(settlementIconBG);
    settlementIconBGOuter.appendChild(settlementIconBGInner);
    settlementIconBGOuter.appendChild(settlementIcon);
    settlementIcon.appendChild(populationBackground);
    settlementIcon.appendChild(settlementPopulation);
    settlementPopulation.setAttribute("data-l10n-id", city.population.toString());
    dealItem.appendChild(settlementIconBGOuter);
    let numberWondersCount = 0;
    if (city.Constructibles?.getNumWonders()) {
      if (city.Constructibles?.getNumWonders() > 0) {
        numberWondersCount = city.Constructibles?.getNumWonders();
      }
    }
    const settlementInfoWrapper = document.createElement("div");
    settlementInfoWrapper.classList.add("flex", "flex-col", "justify-center", "relative");
    const settlementInfo = document.createElement("div");
    settlementInfo.classList.add(
      "peace-deal__deal-item-settlement-info",
      "flex",
      "flex-col",
      "justify-center",
      "font-base",
      "text-sm"
    );
    if (city.owner != city.originalOwner && (city.originalOwner == GameContext.localPlayerID || city.originalOwner == DiplomacyManager.currentDiplomacyDealData?.OtherPlayer || city.originalOwner == DiplomacyManager.selectedPlayerID) || transferType) {
      settlementInfo.classList.add("pl-0", "max-w-32");
    } else {
      settlementInfo.classList.add("max-w-48");
    }
    if (transferType == DiplomacyDealItemCityTransferTypes.OFFER) {
      settlementInfo.innerHTML = Locale.compose(city.name) + " " + Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_CITY_NEW");
    } else if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
      settlementInfo.setAttribute("data-l10n-id", city.name);
    } else {
      settlementInfo.setAttribute("data-l10n-id", city.name);
    }
    settlementInfoWrapper.appendChild(settlementInfo);
    dealItem.appendChild(settlementInfoWrapper);
    settlementInfoWrapper.setAttribute("node-id", city.name);
    settlementInfoWrapper.setAttribute("componentid", theCityID);
    if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
      settlementInfoWrapper.setAttribute("occupied", "true");
    } else {
      settlementInfoWrapper.setAttribute("occupied", "false");
    }
    const settlementStatusWonders = document.createElement("div");
    if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED || numberWondersCount > 0) {
      settlementStatusWonders.classList.add("flex", "flex-row", "pb-1");
      if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
        const settlementStatus = document.createElement("div");
        settlementStatus.classList.add("size-8", "bg-contain");
        settlementStatus.style.backgroundImage = `url(fs://game/dip_icon_conquered.png)`;
        settlementStatusWonders.appendChild(settlementStatus);
      }
      if (numberWondersCount > 0) {
        const settlementWonders = document.createElement("div");
        settlementWonders.classList.add("size-8", "bg-contain");
        settlementWonders.style.backgroundImage = `url(fs://game/city_wonders_hi.png)`;
        settlementStatusWonders.appendChild(settlementWonders);
      }
      settlementInfoWrapper.appendChild(settlementStatusWonders);
    }
    return dealItem;
  }
  setWorkingDealID(workingDealId) {
    this.currentWorkingDealID = workingDealId;
    this.isAI = Configuration.getPlayer(this.currentWorkingDealID.player1).isAI || Configuration.getPlayer(this.currentWorkingDealID.player2).isAI;
    this.isWaitingForStatement = false;
  }
  checkShouldShowPanel() {
    if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL")) {
      this.Root.classList.remove("hidden");
      delayByFrame(() => {
        this.realizeInitialFocus();
      }, 1);
      return true;
    }
    this.Root.classList.add("hidden");
    return false;
  }
  realizePlayerVisuals(localPlayerLibrary, otherPlayerLibrary) {
    this.ourLeaderNameText?.setAttribute("data-l10n-id", Locale.compose(localPlayerLibrary.leaderName));
    this.ourCivNameText?.setAttribute(
      "data-l10n-id",
      Locale.compose("LOC_DIPLOMACY_CIV_NAME", localPlayerLibrary.civilizationAdjective)
    );
    this.theirLeaderNameText?.setAttribute("data-l10n-id", Locale.compose(otherPlayerLibrary.leaderName));
    this.theirCivNameText?.setAttribute(
      "data-l10n-id",
      Locale.compose("LOC_DIPLOMACY_CIV_NAME", otherPlayerLibrary.civilizationAdjective)
    );
    const localPlayerColorPrimary = UI.Player.getPrimaryColorValueAsString(localPlayerLibrary.id);
    const localPlayerColorSecondary = UI.Player.getSecondaryColorValueAsString(localPlayerLibrary.id);
    this.ourLeaderAndCivContainer?.style.setProperty("--player-color-primary", localPlayerColorPrimary);
    this.ourLeaderAndCivContainer?.style.setProperty("--player-color-secondary", localPlayerColorSecondary);
    this.ourLeaderAndCivContainer?.style.setProperty(
      "--player-pattern",
      Icon.getCivLineCSSFromCivilizationType(localPlayerLibrary.civilizationType)
    );
    this.ourLeaderAndCivContainer?.style.setProperty(
      "--player-symbol",
      Icon.getCivSymbolCSSFromCivilizationType(localPlayerLibrary.civilizationType)
    );
    const otherPlayerColorPrimary = UI.Player.getPrimaryColorValueAsString(otherPlayerLibrary.id);
    const otherPlayerColorSecondary = UI.Player.getSecondaryColorValueAsString(otherPlayerLibrary.id);
    this.theirLeaderAndCivContainer?.style.setProperty("--player-color-primary", otherPlayerColorPrimary);
    this.theirLeaderAndCivContainer?.style.setProperty("--player-color-secondary", otherPlayerColorSecondary);
    this.theirLeaderAndCivContainer?.style.setProperty(
      "--player-pattern",
      Icon.getCivLineCSSFromCivilizationType(otherPlayerLibrary.civilizationType)
    );
    this.theirLeaderAndCivContainer?.style.setProperty(
      "--player-symbol",
      Icon.getCivSymbolCSSFromCivilizationType(otherPlayerLibrary.civilizationType)
    );
    if (!this.ourPlayerPortrait || !this.theirPlayerPortrait) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player portraits but unable to find appropriate HTMLElements!"
      );
      return;
    }
    const ourPlayer = Configuration.getPlayer(localPlayerLibrary.id);
    if (!ourPlayer.leaderTypeName) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player leader icon, but no valid leaderTypeName!"
      );
      return;
    }
    this.ourPlayerPortrait.innerHTML = "";
    const ourIcon = document.createElement("leader-icon");
    ourIcon.classList.add("mx-2", "w-16", "h-16", "my-3", "pointer-events-auto");
    ourIcon.setAttribute("leader", ourPlayer.leaderTypeName);
    ourIcon.setAttribute(
      "civ-icon-url",
      Icon.getCivSymbolFromCivilizationType(localPlayerLibrary.civilizationType)
    );
    ourIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(localPlayerLibrary.id));
    ourIcon.setAttribute("fg-color", "white");
    ourIcon.setAttribute("horizontal-banner-right", "true");
    this.ourPlayerPortrait.appendChild(ourIcon);
    const theirPlayer = Configuration.getPlayer(otherPlayerLibrary.id);
    if (!theirPlayer.leaderTypeName) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player leader icon, but no valid leaderTypeName!"
      );
      return;
    }
    this.theirPlayerPortrait.innerHTML = "";
    const theirIcon = document.createElement("leader-icon");
    theirIcon.classList.add("mx-2", "w-16", "h-16", "my-3", "pointer-events-auto");
    theirIcon.setAttribute("leader", theirPlayer.leaderTypeName);
    theirIcon.setAttribute(
      "civ-icon-url",
      Icon.getCivSymbolFromCivilizationType(otherPlayerLibrary.civilizationType)
    );
    theirIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(otherPlayerLibrary.id));
    theirIcon.setAttribute("fg-color", "white");
    theirIcon.setAttribute("horizontal-banner-left", "true");
    this.theirPlayerPortrait.appendChild(theirIcon);
    if (!this.ourPlayerCivIcon || !this.theirPlayerCivIcon) {
      console.error(
        "panel-diplomacy-peace-deal: Attempting to assign player civ icons but unable to find appropriate HTMLElements!"
      );
      return;
    }
  }
  proposeCurrentDeal() {
    if (!this.currentWorkingDealID) {
      console.error(
        "screen-diplomacy-peace-deal: proposeCurrentDeal(): Trying to propose a deal with no valid currentWorkingDealID"
      );
      return;
    }
    if (this.isNewDeal) {
      Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.PROPOSED);
    } else {
      Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.ADJUSTED);
    }
    this.isWaitingForStatement = this.isAI;
    this.closeCurrentDeal();
  }
  // Populate the working deal, with an optional request for inspecting to the AI
  inspectCurrentDeal(isOtherPlayerHuman, dealElement) {
    if (!this.currentWorkingDealID) {
      console.error(
        "screen-diplomacy-peace-deal: proposeCurrentDeal(): Trying to propose a deal with no valid currentWorkingDealID"
      );
      return;
    }
    this.pendingDealAdditions.forEach((dealItem) => {
      const workingDealItemID = Game.DiplomacyDeals.addItemToWorkingDeal(this.currentWorkingDealID, dealItem);
      dealItem.id = workingDealItemID;
      if (dealElement) {
        dealElement.classList.add("bg-positive");
        dealElement.addEventListener("action-activate", () => {
          this.moveDealItem(dealItem, GameContext.localPlayerID, true, dealElement);
        });
      }
    });
    this.pendingDealRemovals.forEach((dealItem) => {
      Game.DiplomacyDeals.removeItemFromWorkingDeal(this.currentWorkingDealID, dealItem.id);
      if (dealElement) {
        dealItem.id = 0;
        dealElement.addEventListener("action-activate", () => {
          this.moveDealItem(dealItem, GameContext.localPlayerID, false, dealElement);
        });
      }
    });
    if (isOtherPlayerHuman == false) {
      if (this.isNewDeal) {
        Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.INSPECT);
      } else {
        Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.INSPECT);
      }
    }
  }
  acceptDeal() {
    if (!this.currentWorkingDealID) {
      console.error(
        "screen-diplomacy-peace-deal: acceptDeal(): Trying to propose a deal with no valid currentWorkingDealID"
      );
      return;
    }
    if (this.pendingDealAdditions.length > 0 || this.pendingDealRemovals.length > 0) {
      this.proposeCurrentDeal();
      return;
    }
    Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.ACCEPTED);
    this.closeCurrentDeal();
  }
  rejectDeal() {
    if (!this.currentWorkingDealID) {
      console.error(
        "screen-diplomacy-peace-deal: rejectDeal(): Trying to propose a deal with no valid currentWorkingDealID"
      );
      return;
    }
    Game.DiplomacyDeals.sendWorkingDeal(this.currentWorkingDealID, DiplomacyDealProposalActions.REJECTED);
    if (Configuration.getXR()) {
      XR.Gameplay.transitBackToGame();
    }
    this.closeCurrentDeal();
  }
  cancelDeal() {
    if (!this.currentWorkingDealID) {
      console.error(
        "screen-diplomacy-peace-deal: cancelDeal(): Trying to cancel a deal with no valid currentWorkingDealID"
      );
      return;
    }
    if (this.isNewDeal) {
      Game.DiplomacyDeals.clearWorkingDeal(this.currentWorkingDealID);
      this.closeCurrentDeal();
    }
  }
  closeDealWithoutResponse() {
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    const otherPlayerLibrary = Players.get(otherPlayerID);
    const isOtherPlayerHuman = otherPlayerLibrary?.isHuman;
    if (!this.isNewDeal && !isOtherPlayerHuman) {
      DialogBoxManager.createDialog_ConfirmCancel({
        body: "LOC_DIPLOMACY_PEACE_DEAL_CLOSE_WILL_REJECT",
        title: "LOC_DIPLOMACY_CLOSE_PEACE_DEAL",
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.rejectDeal();
          }
        },
        canClose: false
      });
    } else {
      this.closeCurrentDeal();
    }
  }
  closeCurrentDeal() {
    if (this.dealSessionID) {
      DiplomacyManager.closeCurrentDiplomacyDeal(this.isWaitingForStatement == false, this.dealSessionID);
    } else {
      DiplomacyManager.closeCurrentDiplomacyDeal(this.isWaitingForStatement == false);
    }
    if (this.isNewDeal) {
      InterfaceMode.switchTo("INTERFACEMODE_DIPLOMACY_HUB");
    } else {
      InterfaceMode.switchTo("INTERFACEMODE_DEFAULT");
    }
  }
  onInterfaceModeChanged() {
    if (this.checkShouldShowPanel()) {
      this.queueUpdate();
    }
  }
  moveDealItem(dealItem, dealOwner, inDeal, target) {
    if (!dealItem.cityId) {
      console.error("panel-diplomacy-peace-deal: No cityID attached to dealItem!");
      return;
    }
    const city = Cities.get(dealItem.cityId);
    if (!city) {
      console.error("panel-diplomacy-peace-deal: Unable to get city from cityID attached to dealITem!");
      return;
    }
    if (inDeal) {
      const dealItemIndex = this.pendingDealAdditions.indexOf(dealItem);
      if (dealItemIndex > -1) {
        this.pendingDealAdditions.splice(dealItemIndex, 1);
      } else {
        this.pendingDealRemovals.push(dealItem);
      }
    } else {
      const dealItemIndex = this.pendingDealRemovals.indexOf(dealItem);
      if (dealItemIndex > -1) {
        this.pendingDealRemovals.splice(dealItemIndex, 1);
      } else {
        this.pendingDealAdditions.push(dealItem);
      }
    }
    let targetContainer = null;
    let dealType = DiplomacyDealItemCityTransferTypes.NONE;
    let newDealOwner = PlayerIds.NO_PLAYER;
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    if (dealOwner == GameContext.localPlayerID) {
      if (city.owner == GameContext.localPlayerID) {
        targetContainer = this.theirYourDealItemsContainer;
        if (city.originalOwner != otherPlayerID) {
          dealType = DiplomacyDealItemCityTransferTypes.OFFER;
        } else {
          dealType = DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED;
        }
      } else {
        targetContainer = this.theirTheirDealItemsContainer;
        if (city.originalOwner != GameContext.localPlayerID) {
          dealType = DiplomacyDealItemCityTransferTypes.NONE;
        } else {
          dealType = DiplomacyDealItemCityTransferTypes.OFFER;
        }
      }
      newDealOwner = otherPlayerID;
    } else {
      if (city.owner == GameContext.localPlayerID) {
        targetContainer = this.ourYourDealItemsContainer;
        if (city.originalOwner != otherPlayerID) {
          dealType = DiplomacyDealItemCityTransferTypes.NONE;
        } else {
          dealType = DiplomacyDealItemCityTransferTypes.OFFER;
        }
      } else {
        targetContainer = this.ourTheirDealItemsContainer;
        if (city.originalOwner != GameContext.localPlayerID) {
          dealType = DiplomacyDealItemCityTransferTypes.OFFER;
        } else {
          dealType = DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED;
        }
      }
      newDealOwner = GameContext.localPlayerID;
    }
    target.parentElement?.removeChild(target);
    let isFocusSet = false;
    if (dealOwner == GameContext.localPlayerID) {
      if (target.parentElement != this.localPlayerDealContainer && this.peaceDealNavigationContainer && this.peaceDealNavigationContainer.childElementCount > 0) {
        FocusManager.setFocus(this.peaceDealNavigationContainer);
        isFocusSet = true;
      }
    } else {
      if (target.parentElement != this.otherPlayerDealContainer && this.peaceDealNavigationContainer && this.peaceDealNavigationContainer.childElementCount > 0) {
        FocusManager.setFocus(this.peaceDealNavigationContainer);
        isFocusSet = true;
      }
    }
    const dealItemElement = this.createCityDealItem(city, dealType);
    dealItemElement.addEventListener("action-activate", () => {
      this.moveDealItem(dealItem, newDealOwner, !inDeal, dealItemElement);
    });
    if (targetContainer?.hasChildNodes()) {
      targetContainer?.insertBefore(dealItemElement, targetContainer?.firstChild);
    } else {
      targetContainer?.appendChild(dealItemElement);
    }
    if (!isFocusSet) {
      this.realizeInitialFocus();
    }
    this.updateButtonStates();
    const otherPlayerLibrary = Players.get(otherPlayerID);
    const isOtherPlayerHuman = otherPlayerLibrary ? otherPlayerLibrary.isHuman : false;
    this.inspectCurrentDeal(isOtherPlayerHuman, target);
    this.dealHasBeenModified = true;
    if (!this.ourTheirDealItemsContainer?.hasChildNodes()) {
      this.localPlayerReceivesTitleWrapper?.classList.add("hidden");
    } else {
      this.localPlayerReceivesTitleWrapper?.classList.remove("hidden");
    }
    if (!this.theirYourDealItemsContainer?.hasChildNodes()) {
      this.otherPlayerReceivesTitleWrapper?.classList.add("hidden");
    } else {
      this.otherPlayerReceivesTitleWrapper?.classList.remove("hidden");
    }
  }
  panToCity(location) {
    Camera.lookAtPlot(location, { zoom: 0.8 });
  }
  updateButtonStates() {
    if (this.pendingDealAdditions.length <= 0 && this.pendingDealRemovals.length <= 0) {
      if (!this.isNewDeal && this.currentWorkingDealID?.direction != DiplomacyDealDirection.OUTGOING) {
        this.proposeButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_ACCEPT"));
        const inspectWrapper = MustGetElement(".panel-diplomacy-peace-deal__inspect-wrapper", this.Root);
        inspectWrapper.innerHTML = "";
      }
    } else {
      if (!this.isNewDeal) {
        this.proposeButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_PROPOSE"));
      }
    }
  }
  clickProposeButton() {
    if (this.proposeButton?.classList.contains("disabled")) {
      return;
    }
    this.proposeButton?.classList.add("disabled");
    this.rejectButton?.classList.add("disabled");
    if (this.isNewDeal || this.dealHasBeenModified) {
      const workingDeal = Game.DiplomacyDeals.getWorkingDeal(this.currentWorkingDealID);
      workingDeal?.itemIds.forEach((itemID) => {
        const dealItem = Game.DiplomacyDeals.getWorkingDealItem(
          this.currentWorkingDealID,
          itemID
        );
        if (dealItem) {
          if (dealItem.type == DiplomacyDealItemTypes.AGREEMENTS && dealItem.subType == DiplomacyDealItemAgreementTypes.MAKE_PEACE) {
            Game.DiplomacyDeals.removeItemFromWorkingDeal(this.currentWorkingDealID, dealItem.id);
            const initialPeaceDealItem = {
              type: DiplomacyDealItemTypes.AGREEMENTS,
              agreementType: DiplomacyDealItemAgreementTypes.MAKE_PEACE
            };
            Game.DiplomacyDeals.addItemToWorkingDeal(this.currentWorkingDealID, initialPeaceDealItem);
          }
        }
      });
      this.proposeCurrentDeal();
    } else {
      this.acceptDeal();
    }
  }
  clickRejectButton() {
    if (this.rejectButton?.classList.contains("disabled")) {
      return;
    }
    this.proposeButton?.classList.add("disabled");
    this.rejectButton?.classList.add("disabled");
    if (this.isNewDeal) {
      this.cancelDeal();
    } else {
      this.rejectDeal();
    }
  }
  realizeInitialFocus() {
    const localPlayerDealContainer = this.Root.querySelector(".local-player-deal-container");
    if (!localPlayerDealContainer) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to find element with class: local-player-deal-container during initial focus!"
      );
      return;
    }
    const otherPlayerDealContainer = this.Root.querySelector(".other-player-deal-container");
    if (!otherPlayerDealContainer) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to find element with class: other-player-deal-container during initial focus"
      );
      return;
    }
    const buttonContainer = this.Root.querySelector(".peace-deal__button-container");
    if (!buttonContainer) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to find element with class: peace-deal__button-container during initial focus"
      );
      return;
    }
    if (this.ourYourDealItemsContainer && this.ourYourDealItemsContainer.childElementCount > 0) {
      FocusManager.setFocus(localPlayerDealContainer);
    } else if (this.theirTheirDealItemsContainer && this.theirTheirDealItemsContainer.childElementCount > 0) {
      FocusManager.setFocus(otherPlayerDealContainer);
    } else {
      FocusManager.setFocus(buttonContainer);
    }
    NavTray.clear();
  }
  showLeaderModel() {
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    const playerEntry = Players.get(otherPlayerID);
    if (playerEntry == null) {
      console.error("Player is not valid, not displaying a 3d model");
      return;
    } else {
      if (!this.isNewDeal) {
        LeaderModelManager.showRightLeaderModel(otherPlayerID);
      }
    }
  }
  handleInput(inputEvent) {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL") || ContextManager.getCurrentTarget()) {
      return true;
    }
    const inputEventName = inputEvent.detail.name;
    switch (inputEventName) {
      case "cancel":
        this.closeButton?.dispatchEvent(new CustomEvent("action-activate"));
        return false;
      case "shell-action-1":
        this.proposeButton?.dispatchEvent(new CustomEvent("action-activate"));
        return false;
      case "keyboard-escape":
      case "mousebutton-right":
        if (ContextManager.getCurrentTarget()) {
          return false;
        }
        this.closeButton?.dispatchEvent(new CustomEvent("action-activate"));
        return false;
      case "shell-action-2":
        if (FocusManager.getFocus() && FocusManager.getFocus().hasAttribute("city-location-x")) {
          const locationXString = FocusManager.getFocus().getAttribute("city-location-x");
          const locationYString = FocusManager.getFocus().getAttribute("city-location-y");
          if (!locationXString || !locationYString) {
            console.error(
              "panel-diplomacy-peace-deal: Unable to get a valid location for focused cityDealItemElement!"
            );
            return false;
          }
          const location = { x: parseFloat(locationXString), y: parseFloat(locationYString) };
          this.panToCity(location);
        }
        return false;
    }
    return true;
  }
}
Controls.define("panel-diplomacy-peace-deal", {
  createInstance: DiplomacyPeaceDealPanel,
  description: "Area for modifying and sending peace deals",
  styles: [styles],
  innerHTML: [content],
  classNames: ["panel-diplomacy-peace-deal", "trigger-nav-help"]
});
//# sourceMappingURL=panel-diplomacy-peace-deal.js.map
