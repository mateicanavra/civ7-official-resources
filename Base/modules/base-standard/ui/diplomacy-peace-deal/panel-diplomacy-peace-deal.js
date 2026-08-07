import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import { MustGetElement, MustGetElements } from '../../../core/ui/utilities/utilities-dom.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.js';
import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import ViewManager from '../../../core/ui/views/view-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import DiplomacyManager, { DiplomacyInputPanel, DiplomacyDealProposalResponseEventName } from '../diplomacy/diplomacy-manager.js';
import LeaderModelManager from '../diplomacy/leader-model-manager.js';
import content from './panel-diplomacy-peace-deal.html.js';
import styles from './panel-diplomacy-peace-deal.scss.js';
import { DialogBoxAction } from '../../../core/ui/dialog-box/model-dialog-box.js';

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
  backToDealListener = this.backToDeal.bind(this);
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
  yourPeaceDealGold = null;
  yourPeaceDealInfluence = null;
  theirPeaceDealGold = null;
  theirPeaceDealInfluence = null;
  selectSettlementText = null;
  localPlayerReceives = null;
  otherPlayerReceives = null;
  proposeButton = null;
  backToMapButton = null;
  rejectButton = null;
  backToDealButton = null;
  mainContainer = null;
  warHeader = null;
  isNewDeal = false;
  isAI = false;
  isWaitingForStatement = false;
  currentWorkingDealID = null;
  needsUpdate = false;
  positiveReactionPlayed = false;
  negativeReactionPlayed = false;
  goingToMap = false;
  pendingDealAdditions = [];
  pendingDealRemovals = [];
  dealHasBeenModified = false;
  dealSessionID;
  onAttach() {
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.addEventListener("diplomacy-dialog-request-close", this.diplomacyDialogRequestCloseListener);
    window.addEventListener(DiplomacyDealProposalResponseEventName, this.diplomacyDealProposalResponseListener);
    window.addEventListener("resize", this.onResizeEventListener);
    window.addEventListener("back-to-peace-deal", this.backToDealListener);
    this.Root.addEventListener("view-receive-focus", this.viewReceiveFocusListener);
    this.mainContainer = MustGetElement(".peace-deal__deal-container", this.Root);
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
    this.yourPeaceDealGold = MustGetElement(".your-current-peace-deal-gold", this.Root);
    this.yourPeaceDealInfluence = MustGetElement(".your-current-peace-deal-influence", this.Root);
    this.theirPeaceDealGold = MustGetElement(".their-current-peace-deal-gold", this.Root);
    this.theirPeaceDealInfluence = MustGetElement(".their-current-peace-deal-influence", this.Root);
    this.localPlayerReceives = MustGetElement(".peace-deal__local-player-receives-container", this.Root);
    this.otherPlayerReceives = MustGetElement(".peace-deal__other-player-receives-container", this.Root);
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
    this.backToMapButton = this.Root.querySelector(".peace-deal__back-to-map");
    this.rejectButton = this.Root.querySelector(".peace-deal__reject-deal-button");
    this.proposeButton?.addEventListener("action-activate", () => {
      this.clickProposeButton();
    });
    this.proposeButton?.setAttribute("data-audio-activate-ref", "none");
    this.rejectButton?.addEventListener("action-activate", () => {
      this.clickRejectButton();
    });
    this.backToMapButton?.setAttribute("data-audio-activate-ref", "none");
    this.backToMapButton?.addEventListener("action-activate", () => {
      this.clickBackToMap();
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
    window.removeEventListener("back-to-peace-deal", this.backToDealListener);
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
          inspectPosNegImg.src = "blp:dip_esp_success_icon";
          inspectPosNegImgWrapper.appendChild(inspectPosNegImg);
          inspectWrapper.appendChild(inspectPosNegImgWrapper);
          const inspectPosNegTextWrapper = document.createElement("div");
          inspectPosNegTextWrapper.classList.value = "justify-center items-center flex text-sm";
          const inspectPosNegText = Locale.stylize(
            "LOC_DIPLOMACY_PEACE_DEAL_WILL_ACCEPT",
            otherPlayerLibrary.name
          );
          inspectPosNegTextWrapper.innerHTML = inspectPosNegText;
          inspectWrapper.classList.remove("peace-deal__reject-color");
          inspectWrapper.classList.add("peace-deal__accept-color");
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
          inspectPosNegImg.src = "blp:dip_esp_fail_icon";
          inspectPosNegImgWrapper.appendChild(inspectPosNegImg);
          inspectWrapper.appendChild(inspectPosNegImgWrapper);
          const inspectPosNegTextWrapper = document.createElement("div");
          inspectPosNegTextWrapper.classList.value = "justify-center items-center flex text-sm";
          const inspectPosNegText = Locale.stylize(
            "LOC_DIPLOMACY_PEACE_DEAL_WILL_REJECT",
            otherPlayerLibrary.name
          );
          inspectPosNegTextWrapper.innerHTML = inspectPosNegText;
          inspectWrapper.classList.remove("peace-deal__accept-color");
          inspectWrapper.classList.add("peace-deal__reject-color");
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
      acceptRejectText.classList.value = "font-title-xs tracking-50 uppercase";
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
    this.selectSettlementText = this.Root.querySelector(".peace-deal__select-settlements");
    if (!this.selectSettlementText) {
      console.error(
        "panel-diplomacy-peace-deal: Can not find element with class .peace-deal__select-settlements"
      );
    }
    this.selectSettlementText?.setAttribute("data-l10n-id", "LOC_DIPLOMACY_PEACE_DEAL_SELECT_SETTLEMENTS");
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
    this.populateGoldInfluenceItems(
      workingDealId,
      workingDeal,
      GameContext.localPlayerID,
      this.ourYourDealItemsContainer
    );
    this.populateGoldInfluenceItems(workingDealId, workingDeal, otherPlayerID, this.theirTheirDealItemsContainer);
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
    this.showLeaderModel(false);
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
      "min-h-14",
      "flex",
      "flex-row",
      "pointer-events-auto",
      "mt-2"
    );
    const primary = UI.Player.getPrimaryColorValueAsString(city.id.owner);
    const bottomBorderColor = document.createElement("div");
    bottomBorderColor.classList.value = "flex flex-auto h-1 absolute peace-deal__item-lower-border left-px right-px bottom-px";
    bottomBorderColor.style.background = `linear-gradient(90deg, ${primary} 0%, rgba(0,0,0,0) 90%)`;
    dealItem.appendChild(bottomBorderColor);
    dealItem.setAttribute("tabindex", "-1");
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
      "flex",
      "relative",
      "size-14",
      "self-center",
      "items-center",
      "justify-center",
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
      "size-11",
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
      "h-11",
      "w-11",
      "relative",
      "pointer-events-none",
      "bg-contain",
      "bg-no-repeat",
      "ml-0",
      "absolute"
    );
    settlementIconBG.style.setProperty(
      "--owner-color-primary",
      UI.Player.getPrimaryColorValueAsString(city.originalOwner)
    );
    const settlementIcon = document.createElement("div");
    settlementIcon.classList.add(
      "peace-deal__settlement-icon-image",
      "size-9",
      "bg-center",
      "bg-no-repeat",
      "bg-contain",
      "absolute",
      "relative"
    );
    if (city.isTown) {
      settlementIcon.style.backgroundImage = `url(blp:Yield_Towns)`;
    } else {
      settlementIcon.style.backgroundImage = `url(blp:Yield_Cities)`;
    }
    const populationBackground = document.createElement("div");
    populationBackground.classList.value = "peace-deal__settlement-population-bg self-end w-12 bottom-0 absolute opacity-50";
    const settlementPopulation = document.createElement("div");
    settlementPopulation.classList.add(
      "self-center",
      "font-body",
      "text-xs",
      "text-center",
      "w-7",
      "peace-deal__deal-item-settlement-population",
      "absolute",
      "bottom-0",
      "font-bold",
      "text-shadow",
      "text-accent-2",
      "tracking-none"
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
    settlementInfoWrapper.classList.add("flex", "flex-row", "justify-start", "relative", "flex-auto");
    const settlementInfo = document.createElement("div");
    settlementInfo.classList.add(
      "peace-deal__deal-item-settlement-info",
      "flex",
      "flex-row",
      "flex-auto",
      "justify-start",
      "items-center",
      "font-title-sm",
      "tracking-50",
      "flex-auto",
      "font-fit-shrink"
    );
    if (transferType == DiplomacyDealItemCityTransferTypes.OFFER) {
      settlementInfo.innerHTML = Locale.compose(city.name) + " " + Locale.compose("LOC_DIPLOMACY_PEACE_DEAL_CITY_NEW");
    } else if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
      settlementInfo.setAttribute("data-l10n-id", city.name);
    } else {
      settlementInfo.setAttribute("data-l10n-id", city.name);
    }
    settlementInfoWrapper.appendChild(settlementInfo);
    dealItem.appendChild(settlementInfoWrapper);
    settlementInfo.setAttribute("node-id", city.name);
    settlementInfo.setAttribute("componentid", theCityID);
    if (transferType == DiplomacyDealItemCityTransferTypes.CEDE_OCCUPIED) {
      settlementInfoWrapper.setAttribute("occupied", "true");
    } else {
      settlementInfoWrapper.setAttribute("occupied", "false");
    }
    const settlementStatusWonders = document.createElement("div");
    if (numberWondersCount > 0) {
      settlementStatusWonders.classList.add("flex", "flex-row", "items-center", "p-1");
      if (numberWondersCount > 0) {
        const settlementWonders = document.createElement("div");
        settlementWonders.classList.add("size-6", "bg-contain");
        settlementWonders.style.backgroundImage = `url(blp:city_wonders_hi)`;
        settlementStatusWonders.appendChild(settlementWonders);
      }
      settlementInfoWrapper.appendChild(settlementStatusWonders);
      settlementInfo.appendChild(settlementInfoWrapper);
    }
    return dealItem;
  }
  populateGoldInfluenceItems(workingDealId, workingDeal, fromPlayer, container) {
    if (!container) {
      return;
    }
    const isLocalPlayer = fromPlayer == GameContext.localPlayerID;
    const goldItems = Game.DiplomacyDeals.getPossibleWorkingDealItems(
      workingDealId,
      fromPlayer,
      DiplomacyDealItemTypes.GOLD
    );
    goldItems.forEach((dealItem) => {
      let alreadyInDeal = false;
      workingDeal?.itemIds.forEach((itemID) => {
        const workingDealItem = Game.DiplomacyDeals.getWorkingDealItem(
          workingDealId,
          itemID
        );
        if (workingDealItem?.type == DiplomacyDealItemTypes.GOLD && workingDealItem?.subType == dealItem.subType && workingDealItem?.from == fromPlayer) {
          alreadyInDeal = true;
        }
      });
      if (alreadyInDeal) {
        return;
      }
      const element = this.createGoldInfluenceDealItem(dealItem, "YIELD_GOLD");
      if (dealItem.isValid === false) {
        element.classList.add("opacity-30");
        element.setAttribute("lump-sum-disable-ignore", "true");
        element.setAttribute("disabled", "true");
        element.setAttribute("data-tooltip-content", Locale.compose("LOC_DEAL_ITEM_INSUFFICIENT_GOLD"));
        element.setAttribute("data-audio-activate-ref", "none");
        element.setAttribute("data-audio-press-ref", "data-audio-error-press");
      } else {
        element.addEventListener("action-activate", () => {
          this.moveGoldInfluenceDealItem(dealItem, fromPlayer, false, element);
        });
      }
      container.appendChild(element);
    });
    const influenceItems = Game.DiplomacyDeals.getPossibleWorkingDealItems(
      workingDealId,
      fromPlayer,
      DiplomacyDealItemTypes.INFLUENCE
    );
    influenceItems.forEach((dealItem) => {
      let alreadyInDeal = false;
      workingDeal?.itemIds.forEach((itemID) => {
        const workingDealItem = Game.DiplomacyDeals.getWorkingDealItem(
          workingDealId,
          itemID
        );
        if (workingDealItem?.type == DiplomacyDealItemTypes.INFLUENCE && workingDealItem?.subType == dealItem.subType && workingDealItem?.from == fromPlayer) {
          alreadyInDeal = true;
        }
      });
      if (alreadyInDeal) {
        return;
      }
      const element = this.createGoldInfluenceDealItem(dealItem, "YIELD_DIPLOMACY");
      if (dealItem.isValid === false) {
        element.classList.add("opacity-30");
        element.setAttribute("data-tooltip-content", Locale.compose("LOC_DEAL_ITEM_INSUFFICIENT_INFLUENCE"));
        element.setAttribute("data-audio-activate-ref", "none");
        element.setAttribute("lump-sum-disable-ignore", "true");
        element.setAttribute("disabled", "true");
        element.setAttribute("data-audio-press-ref", "data-audio-error-press");
      } else {
        element.addEventListener("action-activate", () => {
          this.moveGoldInfluenceDealItem(dealItem, fromPlayer, false, element);
        });
      }
      container.appendChild(element);
    });
    workingDeal?.itemIds.forEach((itemID) => {
      const existingItem = Game.DiplomacyDeals.getWorkingDealItem(
        workingDealId,
        itemID
      );
      if (!existingItem || existingItem.from != fromPlayer) {
        return;
      }
      if (existingItem.type == DiplomacyDealItemTypes.GOLD) {
        const element = this.createGoldInfluenceDealItem(existingItem, "YIELD_GOLD");
        element.classList.add("bg-positive");
        element.addEventListener("action-activate", () => {
          this.moveGoldInfluenceDealItem(existingItem, fromPlayer, true, element);
        });
        const targetContainer = isLocalPlayer ? this.theirYourDealItemsContainer : this.ourTheirDealItemsContainer;
        targetContainer?.appendChild(element);
        if (targetContainer == this.theirYourDealItemsContainer) {
          this.otherPlayerReceivesTitleWrapper?.classList.remove("hidden");
        } else {
          this.localPlayerReceivesTitleWrapper?.classList.remove("hidden");
        }
      } else if (existingItem.type == DiplomacyDealItemTypes.INFLUENCE) {
        const element = this.createGoldInfluenceDealItem(existingItem, "YIELD_DIPLOMACY");
        element.addEventListener("action-activate", () => {
          this.moveGoldInfluenceDealItem(existingItem, fromPlayer, true, element);
        });
        const targetContainer = isLocalPlayer ? this.theirYourDealItemsContainer : this.ourTheirDealItemsContainer;
        targetContainer?.appendChild(element);
        if (targetContainer == this.theirYourDealItemsContainer) {
          this.otherPlayerReceivesTitleWrapper?.classList.remove("hidden");
        } else {
          this.localPlayerReceivesTitleWrapper?.classList.remove("hidden");
        }
      }
    });
  }
  createGoldInfluenceDealItem(dealItem, yieldIcon) {
    const element = document.createElement("chooser-item");
    let subTypeName;
    const amount = dealItem.amount ?? 0;
    if (dealItem.type == DiplomacyDealItemTypes.GOLD) {
      subTypeName = dealItem.subType == DiplomacyDealItemGoldSubTypes.SMALL_LUMP ? "LOC_DEAL_ITEM_GOLD_SMALL_LUMP_NAME" : "LOC_DEAL_ITEM_GOLD_LARGE_LUMP_NAME";
    } else {
      subTypeName = dealItem.subType == DiplomacyDealItemInfluenceSubTypes.SMALL_LUMP ? "LOC_DEAL_ITEM_INFLUENCE_SMALL_LUMP_NAME" : "LOC_DEAL_ITEM_INFLUENCE_LARGE_LUMP_NAME";
    }
    element.classList.add(
      "peace-deal__deal-item",
      "chooser-item_unlocked",
      dealItem.type == DiplomacyDealItemTypes.GOLD ? "peace-deal__gold-item" : "peace-deal__influence-item",
      "relative",
      "w-full",
      "min-h-11",
      "flex",
      "flex-row",
      "pointer-events-auto",
      "mt-2",
      "border"
    );
    element.setAttribute("tabindex", "-1");
    element.setAttribute("data-audio-group-ref", "peace-deal-item");
    element.setAttribute(
      "data-audio-activate-ref",
      dealItem.type == DiplomacyDealItemTypes.GOLD ? "data-audio-peace-gold" : "data-audio-peace-influence"
    );
    const iconWrapper = document.createElement("div");
    iconWrapper.classList.add(
      "relative",
      "size-8",
      "self-center",
      "bg-center",
      "bg-no-repeat",
      "bg-contain",
      "ml-2"
    );
    iconWrapper.style.backgroundImage = `url(${Icon.getYieldIcon(yieldIcon)})`;
    element.appendChild(iconWrapper);
    const infoWrapper = document.createElement("div");
    infoWrapper.classList.add("flex", "flex-col", "flex-auto", "justify-center", "ml-2", "relative");
    const nameText = document.createElement("div");
    nameText.classList.add("font-title-sm", "tracking-50");
    nameText.innerHTML = Locale.stylize(subTypeName, amount);
    infoWrapper.appendChild(nameText);
    element.appendChild(infoWrapper);
    return element;
  }
  moveGoldInfluenceDealItem(dealItem, dealOwner, inDeal, target) {
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
    target.parentElement?.removeChild(target);
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    const yieldIcon = dealItem.type == DiplomacyDealItemTypes.GOLD ? "YIELD_GOLD" : "YIELD_DIPLOMACY";
    const newElement = this.createGoldInfluenceDealItem(dealItem, yieldIcon);
    let targetContainer = null;
    if (!inDeal) {
      targetContainer = dealOwner == GameContext.localPlayerID ? this.theirYourDealItemsContainer : this.ourTheirDealItemsContainer;
      targetContainer?.appendChild(newElement);
      newElement.addEventListener("action-activate", () => {
        this.moveGoldInfluenceDealItem(dealItem, dealOwner, true, newElement);
      });
      if (dealOwner == GameContext.localPlayerID) {
        this.otherPlayerReceivesTitleWrapper?.classList.remove("hidden");
      } else {
        this.localPlayerReceivesTitleWrapper?.classList.remove("hidden");
      }
    } else {
      targetContainer = dealOwner == GameContext.localPlayerID ? this.ourYourDealItemsContainer : this.theirTheirDealItemsContainer;
      if (targetContainer?.hasChildNodes()) {
        targetContainer?.insertBefore(newElement, targetContainer?.firstChild);
      } else {
        targetContainer?.appendChild(newElement);
      }
      newElement.addEventListener("action-activate", () => {
        this.moveGoldInfluenceDealItem(dealItem, dealOwner, false, newElement);
      });
    }
    this.updateButtonStates();
    const otherPlayerLibrary = Players.get(otherPlayerID);
    const isOtherPlayerHuman = otherPlayerLibrary ? otherPlayerLibrary.isHuman : false;
    this.inspectCurrentDeal(isOtherPlayerHuman, target);
    this.dealHasBeenModified = true;
    if (!this.ourTheirDealItemsContainer?.hasChildNodes()) {
      this.localPlayerReceivesTitleWrapper?.classList.add("hidden");
    }
    if (!this.theirYourDealItemsContainer?.hasChildNodes()) {
      this.otherPlayerReceivesTitleWrapper?.classList.add("hidden");
    }
    this.setFocusAfterItemMove(targetContainer, dealOwner);
  }
  setWorkingDealID(workingDealId) {
    this.currentWorkingDealID = workingDealId;
    this.isAI = Configuration.getPlayer(this.currentWorkingDealID.player1).isAI || Configuration.getPlayer(this.currentWorkingDealID.player2).isAI;
    this.isWaitingForStatement = false;
  }
  checkShouldShowPanel() {
    if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL")) {
      this.Root.classList.remove("hidden");
      waitForLayout(() => {
        this.realizeInitialFocus();
      });
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
    const yourCivName = GameInfo.Civilizations.lookup(localPlayerLibrary?.civilizationType ?? "")?.CivilizationType;
    const theirCivName = GameInfo.Civilizations.lookup(
      otherPlayerLibrary?.civilizationType ?? ""
    )?.CivilizationType;
    const yourGold = Math.floor(localPlayerLibrary.Treasury?.goldBalance ?? 0).toString();
    const yourInfluence = Math.floor(localPlayerLibrary.DiplomacyTreasury?.diplomacyBalance ?? 0).toString();
    const theirGold = Math.floor(otherPlayerLibrary.Treasury?.goldBalance ?? 0).toString();
    const theirInfluence = Math.floor(otherPlayerLibrary.DiplomacyTreasury?.diplomacyBalance ?? 0).toString();
    if (this.yourPeaceDealGold) this.yourPeaceDealGold.innerHTML = yourGold;
    if (this.yourPeaceDealInfluence) this.yourPeaceDealInfluence.innerHTML = yourInfluence;
    if (this.theirPeaceDealGold) this.theirPeaceDealGold.innerHTML = theirGold;
    if (this.theirPeaceDealInfluence) this.theirPeaceDealInfluence.innerHTML = theirInfluence;
    const yourBgContainer = MustGetElement(".local-player-deal-container-bg", this.Root);
    yourBgContainer.style.backgroundImage = `url("blp:bg-panel-${yourCivName.replace("CIVILIZATION_", "").toLowerCase()}")`;
    const theirBgContainer = MustGetElement(".other-player-deal-container-bg", this.Root);
    theirBgContainer.style.backgroundImage = `url("blp:bg-panel-${theirCivName.replace("CIVILIZATION_", "").toLowerCase()}")`;
    const localPlayerColorPrimary = UI.Player.getPrimaryColorValueAsString(localPlayerLibrary.id);
    const localPlayerColorSecondary = UI.Player.getSecondaryColorValueAsString(localPlayerLibrary.id);
    this.ourLeaderAndCivContainer?.style.setProperty("--player-color-primary", localPlayerColorPrimary);
    this.ourLeaderAndCivContainer?.style.setProperty("--player-color-secondary", localPlayerColorSecondary);
    const receivesContainer = MustGetElement(".peace-deal__local-player-receives-settlements", this.Root);
    receivesContainer.style.borderColor = localPlayerColorPrimary;
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
    const theyReceiveContainer = MustGetElement(".peace-deal__other-player-receives-settlements", this.Root);
    theyReceiveContainer.style.borderColor = otherPlayerColorPrimary;
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
  updateLumpSumStatus() {
    const localPlayerDeals = MustGetElement(".local-player-deal-container", this.Root);
    const otherPlayerDeals = MustGetElement(".other-player-deal-container", this.Root);
    const localPlayerInfluenceItems = MustGetElements(".peace-deal__influence-item", localPlayerDeals);
    const otherPlayerInfluenceItems = MustGetElements(".peace-deal__influence-item", otherPlayerDeals);
    const localPlayerGoldItems = MustGetElements(".peace-deal__gold-item", localPlayerDeals);
    const otherPlayerGoldItems = MustGetElements(".peace-deal__gold-item", otherPlayerDeals);
    if (this.localPlayerReceives.querySelector(".peace-deal__influence-item") || this.otherPlayerReceives.querySelector(".peace-deal__influence-item")) {
      localPlayerInfluenceItems.forEach((item) => this.toggleLumpSumItem(item, true));
      otherPlayerInfluenceItems.forEach((item) => this.toggleLumpSumItem(item, true));
    } else {
      localPlayerInfluenceItems.forEach((item) => this.toggleLumpSumItem(item, false));
      otherPlayerInfluenceItems.forEach((item) => this.toggleLumpSumItem(item, false));
    }
    if (this.localPlayerReceives.querySelector(".peace-deal__gold-item") || this.otherPlayerReceives.querySelector(".peace-deal__gold-item")) {
      otherPlayerGoldItems.forEach((item) => this.toggleLumpSumItem(item, true));
      localPlayerGoldItems.forEach((item) => this.toggleLumpSumItem(item, true));
    } else {
      otherPlayerGoldItems.forEach((item) => this.toggleLumpSumItem(item, false));
      localPlayerGoldItems.forEach((item) => this.toggleLumpSumItem(item, false));
    }
  }
  toggleLumpSumItem(item, setAsAlreadyUsed) {
    if (!item) return;
    if (setAsAlreadyUsed) {
      if (item.getAttribute("disabled") != "true") {
        item.setAttribute("disabled", "true");
        item.classList.add("opacity-30");
        if (!item.getAttribute("data-tooltip-content")) {
          item.setAttribute("data-tooltip-content", Locale.compose("LOC_DEAL_ITEM_ALREADY_USED"));
        }
      }
    } else {
      if (item.getAttribute("lump-sum-disable-ignore") != "true") {
        item.setAttribute("lump-sum-used", "false");
        item.setAttribute("disabled", "false");
        item.classList.remove("opacity-30");
        item.removeAttribute("data-tooltip-content");
      }
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
    this.pendingDealAdditions = [];
    this.pendingDealRemovals = [];
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
      Audio.playSound("data-audio-close", "peace-deal-item");
    } else {
      DiplomacyManager.closeCurrentDiplomacyDeal(this.isWaitingForStatement == false);
      Audio.playSound("data-audio-close", "peace-deal-item");
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
    const dealItemElement = this.createCityDealItem(city, dealType);
    dealItemElement.addEventListener("action-activate", () => {
      this.moveDealItem(dealItem, newDealOwner, !inDeal, dealItemElement);
    });
    if (targetContainer?.hasChildNodes()) {
      targetContainer?.insertBefore(dealItemElement, targetContainer?.firstChild);
    } else {
      targetContainer?.appendChild(dealItemElement);
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
    this.setFocusAfterItemMove(targetContainer, dealOwner);
  }
  setFocusAfterItemMove(targetContainer, dealOwner) {
    const theirFirstItem = this.hasActiveChildren(this.theirTheirDealItemsContainer);
    const yourFirstItem = this.hasActiveChildren(this.ourYourDealItemsContainer);
    waitForLayout(() => {
      if (targetContainer) {
        if (dealOwner == GameContext.localPlayerID) {
          if (yourFirstItem) {
            if (targetContainer != this.localPlayerDealContainer || targetContainer != this.localPlayerReceives) {
              FocusManager.get().setFocus(yourFirstItem);
              return;
            }
          }
        } else {
          if (theirFirstItem) {
            if (targetContainer != this.otherPlayerDealContainer || targetContainer != this.otherPlayerReceives) {
              FocusManager.get().setFocus(theirFirstItem);
              return;
            }
          }
        }
      }
      this.realizeInitialFocus();
    });
  }
  updateButtonStates() {
    this.updateLumpSumStatus();
    const inspectWrapper = MustGetElement(".panel-diplomacy-peace-deal__inspect-wrapper", this.Root);
    if (this.pendingDealAdditions.length <= 0 && this.pendingDealRemovals.length <= 0) {
      if (!this.isNewDeal && this.currentWorkingDealID?.direction != DiplomacyDealDirection.OUTGOING) {
        this.proposeButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_ACCEPT"));
        inspectWrapper.innerHTML = "";
      }
    } else {
      if (!this.isNewDeal) {
        this.proposeButton?.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_DEAL_PROPOSE"));
      }
    }
    const offerContainer = MustGetElement(".peace-deal__offer-container", this.Root);
    const peaceDealItems = offerContainer.querySelectorAll(".peace-deal__deal-item");
    if (peaceDealItems.length > 0) {
      this.selectSettlementText?.classList.add("hidden");
    } else {
      this.selectSettlementText?.classList.remove("hidden");
    }
    const theyReceiveContainer = MustGetElement(".peace-deal__other-player-receives-container", this.Root);
    const theyReceiveItems = theyReceiveContainer.querySelectorAll(".peace-deal__deal-item");
    if (theyReceiveItems.length < 1) {
      theyReceiveContainer.classList.add("hidden");
    } else {
      theyReceiveContainer.classList.remove("hidden");
    }
    const youReceiveContainer = MustGetElement(".peace-deal__local-player-receives-container", this.Root);
    const youReceiveItems = youReceiveContainer.querySelectorAll(".peace-deal__deal-item");
    if (youReceiveItems.length < 1) {
      youReceiveContainer.classList.add("hidden");
    } else {
      youReceiveContainer.classList.remove("hidden");
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
  clickBackToMap() {
    FocusManager.get().clearFocus();
    LeaderModelManager.exitLeaderScene();
    Audio.playSound("data-audio-leader-exit");
    this.mainContainer?.classList.toggle("hidden");
    this.goingToMap = true;
    setTimeout(() => {
      this.goingToMap = false;
      this.backToDealButton = document.createElement("fxs-button");
      this.backToDealButton.classList.value = "peace-deal__back-to-deal-button self-center bottom-12 absolute leading-none min-w-32 mr-4 ml-4";
      this.backToDealButton?.setAttribute("data-audio-activate-ref", "none");
      this.backToDealButton?.setAttribute("caption", "LOC_DIPLOMACY_BACK_TO_DEAL");
      this.backToDealButton?.setAttribute("action-key", "inline-cancel");
      this.backToDealButton?.addEventListener("action-activate", () => {
        this.backToDeal();
      });
      this.Root.appendChild(this.backToDealButton);
      ViewManager.setCurrentByName("DiplomacyWorld");
    }, LeaderModelManager.MAX_LENGTH_OF_ANIMATION_EXIT);
  }
  backToDeal() {
    ViewManager.setCurrentByName("Diplomacy");
    this.mainContainer?.classList.toggle("hidden");
    this.backToDealButton?.classList.toggle("hidden");
    this.showLeaderModel(true);
    this.realizeInitialFocus();
  }
  realizeInitialFocus() {
    if (!this.ourYourDealItemsContainer) {
      console.error(
        "panel-diplomacy-peace-deal: Unable to find element with class: local-player-deal-container during initial focus!"
      );
      return;
    }
    if (!this.theirTheirDealItemsContainer) {
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
    const theirFirstItem = this.hasActiveChildren(this.theirTheirDealItemsContainer);
    const yourFirstItem = this.hasActiveChildren(this.ourYourDealItemsContainer);
    if (yourFirstItem) {
      FocusManager.get().setFocus(yourFirstItem);
    } else if (theirFirstItem) {
      FocusManager.get().setFocus(theirFirstItem);
    } else {
      FocusManager.get().setFocus(buttonContainer);
    }
    NavTray.clear();
  }
  hasActiveChildren(parent) {
    const children = Array.from(parent.children);
    const active = children.find((child) => child.getAttribute("disabled") != "true");
    return active ?? null;
  }
  showLeaderModel(comingBackFromMap) {
    const otherPlayerID = DiplomacyManager.currentDiplomacyDealData ? DiplomacyManager.currentDiplomacyDealData.OtherPlayer : DiplomacyManager.selectedPlayerID;
    const playerEntry = Players.get(otherPlayerID);
    if (playerEntry == null) {
      console.error("Player is not valid, not displaying a 3d model");
      return;
    } else {
      if (!this.isNewDeal || comingBackFromMap) {
        LeaderModelManager.showRightLeaderModel(otherPlayerID);
      }
    }
  }
  handleInput(inputEvent) {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_PEACE_DEAL") || ContextManager.getCurrentTarget()) {
      return true;
    }
    if (this.goingToMap) {
      return false;
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
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return false;
      case "shell-action-2":
        {
          this.backToMapButton?.dispatchEvent(new CustomEvent("action-activate"));
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
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
