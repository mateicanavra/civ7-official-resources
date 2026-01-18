import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/interface-modes/interface-modes.js';
import '../diplomacy/diplomacy-events.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

const content = "<fxs-vslot class=\"diplomacy-action-details-root-vslot min-w-200\">\r\n\t<fxs-frame\r\n\t\tclass=\"title-progress-bar-frame\"\r\n\t\tframe-style=\"f2\"\r\n\t\toverride-styling=\"relative flex max-w-full max-h-full p-8\"\r\n\t\tfiligree-class=\"hidden\"\r\n\t>\r\n\t\t<fxs-vslot class=\"title-progress-bar-container items-center\"></fxs-vslot>\r\n\t</fxs-frame>\r\n\t<fxs-frame\r\n\t\tclass=\"action-content-frame\"\r\n\t\tframe-style=\"f2\"\r\n\t\toverride-styling=\"relative flex max-w-full max-h-full p-8 -mt-6\"\r\n\t\tfiligree-class=\" hidden\"\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"uppercase\"\r\n\t\t\ttitle=\"LOC_DIPLOMACY_ACTIONS\"\r\n\t\t\tfiligree-style=\"h4\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-hslot class=\"diplomacy-yield-container justify-center mb-2\">\r\n\t\t\t<img\r\n\t\t\t\tsrc=\"fs://game/yield_influence\"\r\n\t\t\t\tclass=\"relative size-8\"\r\n\t\t\t/>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"screen-diplomacy-action-details__accumulated-influence relative flex items-center font-title text-base\"\r\n\t\t\t></div>\r\n\t\t</fxs-hslot>\r\n\t\t<fxs-hslot class=\"your-war-content-container\"></fxs-hslot>\r\n\t\t<fxs-hslot class=\"support-war-content-container hidden justify-between\"></fxs-hslot>\r\n\t</fxs-frame>\r\n\t<fxs-close-button class=\"absolute right-1 top-1\"></fxs-close-button>\r\n</fxs-vslot>\r\n";

const styles = "fs://game/base-standard/ui/diplomacy-action-details/screen-diplomacy-action-details.css";

class DiplomacyActionDetailsScreen extends Panel {
  supportChangedListener = (data) => {
    this.onSupportChanged(data);
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  yourWarContentContainer = null;
  supportWarContentContainer = null;
  actionContentColumn = null;
  titleProgressBarContainer = null;
  mainPledgeContainer = null;
  leftPledgeButton = null;
  rightPledgeButton = null;
  supportYourselfButton = null;
  leftPledgePlayers = [];
  rightPledgePlayers = [];
  focusableElements = [];
  leftSupportCostDescriptions = null;
  rightSupportCostDescriptions = null;
  onAttach() {
    this.Root.setAttribute("data-audio-group-ref", "war-support-panel");
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.animateInType = AnchorType.RelativeToBottom;
    this.animateOutType = this.animateInType;
    super.onAttach();
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.addEventListener("action-activate", () => {
      this.onClose();
    });
    window.addEventListener(InputEngineEventName, this.engineInputListener);
    engine.on("DiplomacyEventSupportChanged", this.supportChangedListener);
    this.populateActionDetails();
  }
  onDetach() {
    window.removeEventListener(InputEngineEventName, this.engineInputListener);
    engine.off("DiplomacyEventSupportChanged", this.supportChangedListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.realizeFocus();
    this.realizeNavtray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
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
      case "keyboard-escape":
      case "sys-menu":
        this.closeFromPauseSignal();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  createPledgeButton(params) {
    const responseButton = document.createElement("fxs-activatable");
    responseButton.setAttribute("action-key", "inline-confirm");
    responseButton.setAttribute("nav-help-class", "absolute left-9");
    responseButton.setAttribute("tabindex", "-1");
    responseButton.classList.remove("font-title-base", "font-bold");
    responseButton.classList.add(
      "pledge-support-button",
      "text-sm",
      "min-h-56",
      "w-56",
      "mx-12",
      "relative",
      "pb-3",
      "group",
      "flow-col",
      "justify-start"
    );
    const buttonIdleOverlay = document.createElement("div");
    buttonIdleOverlay.classList.add(
      "panel-diplomacy-project-reaction__response-item-bg",
      "min-h-56",
      "pb-3",
      "grow",
      "flow-col",
      "justify-start",
      "absolute",
      "group-focus\\:opacity-0",
      "group-hover\\:opacity-0",
      "group-active\\:opacity-0",
      "group-pressed\\:opacity-0",
      "z-0",
      "flex",
      "w-full",
      "text-sm",
      "group",
      "ml-0",
      "inset-0"
    );
    responseButton.appendChild(buttonIdleOverlay);
    const buttonHoverOverlay = document.createElement("div");
    buttonHoverOverlay.classList.add(
      "panel-diplomacy-project-reaction__response-item-hovered",
      "min-h-56",
      "pb-3",
      "grow",
      "flow-col",
      "justify-start",
      "absolute",
      "inset-0",
      "group-focus\\:opacity-100",
      "group-hover\\:opacity-100",
      "group-active\\:opacity-100",
      "group-pressed\\:opacity-100",
      "group",
      "opacity-0",
      "-mt-0\\.5",
      "w-full",
      "text-sm",
      "flex",
      "-z-1"
    );
    responseButton.appendChild(buttonHoverOverlay);
    const buttonContentOverlay = document.createElement("div");
    buttonContentOverlay.classList.add(
      "support-war-button-content",
      "pointer-events-none",
      "min-h-56",
      "pb-3",
      "grow",
      "flex",
      "flex-col",
      "justify-start",
      "relative",
      "inset-0"
    );
    responseButton.appendChild(buttonContentOverlay);
    const cardTopWrapper = document.createElement("div");
    cardTopWrapper.classList.add("flex", "flex-row");
    const responseDescription = document.createElement("div");
    responseDescription.classList.add(
      "panel-diplomacy-project-reaction__response-description",
      "flex",
      "items-center",
      "justify-center",
      "grow",
      "min-h-36",
      "w-full",
      "font-body",
      "text-xs",
      "mb-2",
      "px-2",
      "self-center",
      "text-center",
      "break-words"
    );
    const relationshipIconContainer = document.createElement("div");
    relationshipIconContainer.classList.add("flex", "flex-row");
    const supportWarIcon = document.createElement("div");
    supportWarIcon.classList.add("panel-diplomacy-project-reaction__icon-container", "bg-contain", "bg-no-repeat");
    relationshipIconContainer.appendChild(supportWarIcon);
    const supportYourselfIcon = document.createElement("div");
    supportYourselfIcon.classList.add(
      "panel-diplomacy-project-reaction__support-yourself",
      "-mt-2",
      "size-13",
      "bg-cover"
    );
    relationshipIconContainer.appendChild(supportYourselfIcon);
    cardTopWrapper.appendChild(relationshipIconContainer);
    const costWrapper = document.createElement("div");
    costWrapper.classList.add("flow-row", "grow", "justify-center", "mb-4");
    const influenceIconWrapper = document.createElement("div");
    influenceIconWrapper.classList.add("self-end");
    const influenceIcon = document.createElement("img");
    influenceIcon.classList.add("w-8", "h-8");
    influenceIcon.src = "fs://game/yield_influence";
    influenceIconWrapper.appendChild(influenceIcon);
    costWrapper.appendChild(influenceIconWrapper);
    const actionData = Game.Diplomacy.getDiplomaticEventData(
      DiplomacyManager.selectedActionID
    );
    const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
      actionData.uniqueID,
      GameContext.localPlayerID,
      params.isInitial
    );
    const costDescription = document.createElement("div");
    costDescription.id = "#support-war-cost";
    costDescription.setAttribute("data-l10n-id", influenceCost.toString());
    costDescription.classList.add("self-end", "mb-1");
    costWrapper.appendChild(costDescription);
    if (params.isLeft) {
      this.leftSupportCostDescriptions = costDescription;
    } else {
      this.rightSupportCostDescriptions = costDescription;
    }
    cardTopWrapper.appendChild(costWrapper);
    buttonContentOverlay.appendChild(cardTopWrapper);
    const responseTitle = document.createElement("div");
    responseTitle.classList.add(
      "panel-diplomacy-project-reaction__card-title",
      "pledge-button-caption",
      "w-52",
      "font-title",
      "text-xs",
      "text-secondary",
      "uppercase",
      "pb-2",
      "mt-2",
      "text-center",
      "tracking-100"
    );
    responseTitle.setAttribute("data-l10n-id", "LOC_SUPPORT_WAR_SELF");
    responseDescription.appendChild(responseTitle);
    buttonContentOverlay.appendChild(responseDescription);
    buttonContentOverlay.classList.add("font-title", "text-sm");
    return responseButton;
  }
  createPledgeGroup() {
    const pledgeGroup = document.createElement("div");
    pledgeGroup.classList.add("diplomacy-action-details__pledge-group");
    const pledgeGroupFrame = document.createElement("div");
    pledgeGroupFrame.classList.add("diplomacy-action-details__pledge-group-frame");
    pledgeGroup.appendChild(pledgeGroupFrame);
    const pledgeTotal = document.createElement("div");
    pledgeTotal.classList.add("diplomacy-action-details__pledge-total-bg");
    pledgeGroup.appendChild(pledgeTotal);
    return pledgeGroup;
  }
  createPledgeGroupValues(value) {
    const pledgeTotalNumber = document.createElement("fxs-hslot");
    if (value <= 0) {
      return pledgeTotalNumber;
    }
    pledgeTotalNumber.classList.add(
      "diplomacy-action-details__pledge-total-number",
      "justify-center",
      "font-title",
      "text-xl"
    );
    const pledgeTotalPrefix = document.createElement("div");
    pledgeTotalPrefix.classList.add("diplomacy-action-details__pledge-total-prefix");
    const pledgeTotalSpan = document.createElement("span");
    pledgeTotalSpan.textContent = Math.abs(value).toString();
    pledgeTotalPrefix.textContent = value == 0 ? "" : value > 0 ? "+" : "-";
    pledgeTotalNumber.appendChild(pledgeTotalPrefix);
    pledgeTotalNumber.appendChild(pledgeTotalSpan);
    return pledgeTotalNumber;
  }
  createPledgeGroupLocalTotal(value) {
    const pledgeSlots = value;
    const remainingSlots = 20 - pledgeSlots;
    const totalSlotsContainer = document.createElement("fxs-hslot");
    totalSlotsContainer.classList.add("total-slots-container", "grow");
    if (pledgeSlots > 0) {
      const pledgeSlotContainer = document.createElement("fxs-hslot");
      pledgeSlotContainer.classList.add("pledge-slots-container", "grow");
      totalSlotsContainer.appendChild(pledgeSlotContainer);
      for (let i = 1; i <= pledgeSlots; i++) {
        const pledgeSlot = document.createElement("fxs-hslot");
        pledgeSlot.classList.add("pledge-slot", "h-5", "w-5", "grow");
        pledgeSlotContainer.appendChild(pledgeSlot);
      }
    }
    const remainingSlotContainer = document.createElement("fxs-hslot");
    remainingSlotContainer.classList.add("remaining-slots-container", "grow");
    totalSlotsContainer.appendChild(remainingSlotContainer);
    for (let i = 1; i <= remainingSlots; i++) {
      const remainingSlot = document.createElement("fxs-hslot");
      remainingSlot.classList.add("remaining-slot", "h-5", "w-5", "grow");
      remainingSlotContainer.appendChild(remainingSlot);
    }
    const pledgeGroupTotal = document.createElement("fxs-hslot");
    pledgeGroupTotal.classList.add("diplomacy-action-details__pledge-group-total");
    pledgeGroupTotal.textContent = value.toString();
    const slotsDivider = document.createElement("div");
    slotsDivider.classList.add("absolute", "right-1\\/2", "w-0\\.5", "h-full", "bg-primary-2");
    totalSlotsContainer.appendChild(slotsDivider);
    return totalSlotsContainer;
  }
  createPledgeGroupStatus(actionData) {
    const pledgeStatus = document.createElement("div");
    pledgeStatus.classList.add("diplomacy-action-details__pledge-status");
    pledgeStatus.setAttribute("data-l10n-id", this.determinePledgeStatus(actionData, pledgeStatus));
    return pledgeStatus;
  }
  determinePledgeStatus(actionData, target) {
    let locString = "";
    if (actionData.completionScore > 0) {
      const completionData = Game.Diplomacy.getCompletionData(
        DiplomacyManager.selectedActionID
      );
      if (completionData) {
        if (completionData.bWillComplete) {
          locString = Locale.compose(
            "LOC_DIPLOMACY_ACTION_TURNS_UNTIL_COMPLETION",
            completionData.turnsToCompletion
          );
        } else if (completionData.turnsToNextStage >= 0) {
          locString = Locale.compose(
            "LOC_DIPLOMACY_ACTION_TURNS_UNTIL_NEXT_STAGE",
            completionData.turnsToNextStage
          );
        } else if (completionData.bWillCancel) {
          locString = Locale.compose(
            "LOC_DIPLOMACY_ACTION_TURNS_UNTIL_CANCELED",
            completionData.turnsToCompletion
          );
          target.classList.add("status-reverse");
        } else if (completionData.progressPerTurn == 0) {
          locString = Locale.compose("LOC_DIPLOMACY_ACTION_HAS_STALLED", completionData.turnsToCompletion);
          target.classList.add("status-stalled");
        } else {
          locString = Locale.compose("LOC_DIPLOMACY_ACTION_AT_RISK");
          target.classList.add("status-reverse");
        }
      } else {
        console.error(
          "screen-diplomacy-action-details: Unable to retrieve DiplomacyEventCompletionData for selected action with ID: " + DiplomacyManager.selectedActionID
        );
        const turnsToCompletion = Math.max(
          Math.ceil((actionData.completionScore - actionData.progressScore) / actionData.support),
          1
        );
        locString = Locale.compose("LOC_DIPLOMACY_ACTION_TURNS_UNTIL_COMPLETION", turnsToCompletion);
      }
    }
    return locString;
  }
  determineLeftPlayer(actionData) {
    return actionData.targetPlayer == GameContext.localPlayerID ? actionData.targetPlayer : actionData.initialPlayer;
  }
  determineRightPlayer(actionData) {
    return actionData.targetPlayer == GameContext.localPlayerID ? actionData.initialPlayer : actionData.targetPlayer;
  }
  determineLocalPlayerSupport(actionData) {
    this.leftPledgePlayers = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(actionData.uniqueID);
    this.rightPledgePlayers = Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(actionData.uniqueID);
    return this.leftPledgePlayers.filter((id) => id == GameContext.localPlayerID).length - this.rightPledgePlayers.filter((id) => id == GameContext.localPlayerID).length;
  }
  updatePlayerGroups(actionData, leftPlayer) {
    if (actionData.initialPlayer == leftPlayer) {
      this.leftPledgePlayers = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(actionData.uniqueID);
      this.rightPledgePlayers = Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(actionData.uniqueID);
    } else {
      this.leftPledgePlayers = Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(actionData.uniqueID);
      this.rightPledgePlayers = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(actionData.uniqueID);
    }
  }
  createPledgeGroups(actionData, completionData, localPlayerDiplomacy) {
    const leftPlayer = this.determineLeftPlayer(actionData);
    const rightPlayer = this.determineRightPlayer(actionData);
    this.updatePlayerGroups(actionData, leftPlayer);
    const leftPledgeGroup = document.createElement("fxs-hslot");
    const rightPledgeGroup = document.createElement("fxs-hslot");
    if (leftPlayer != PlayerIds.NO_PLAYER && rightPlayer != PlayerIds.NO_PLAYER) {
      leftPledgeGroup.classList.add("is-player");
      rightPledgeGroup.classList.add("is-player");
    }
    let opposingPledgeGroup;
    let supportPledgeGroup;
    if (actionData.initialPlayer == leftPlayer) {
      opposingPledgeGroup = rightPledgeGroup;
      supportPledgeGroup = leftPledgeGroup;
    } else {
      opposingPledgeGroup = leftPledgeGroup;
      supportPledgeGroup = rightPledgeGroup;
    }
    if (!this.mainPledgeContainer) {
      this.mainPledgeContainer = document.createElement("fxs-vslot");
      this.mainPledgeContainer.classList.add("main-pledge-container", "w-full");
      this.titleProgressBarContainer?.appendChild(this.mainPledgeContainer);
    }
    removeAllChildren(this.mainPledgeContainer);
    const pledgeBarContainer = document.createElement("fxs-hslot");
    pledgeBarContainer.classList.add("pledge-bar-container", "grow", "justify-center", "mt-3");
    this.mainPledgeContainer.appendChild(pledgeBarContainer);
    const leftSupport = this.leftPledgePlayers.length;
    const rightSupport = this.rightPledgePlayers.length;
    let leftValue = 0;
    let rightValue = 0;
    if (leftSupport > rightSupport) {
      leftValue = leftSupport - rightSupport;
    } else {
      rightValue = rightSupport - leftSupport;
    }
    const leftPledgeLocalTotal = this.createPledgeGroupLocalTotal(leftValue);
    leftPledgeLocalTotal.classList.add("-scale-x-100");
    pledgeBarContainer.appendChild(leftPledgeLocalTotal);
    const rightPledgeLocalTotal = this.createPledgeGroupLocalTotal(rightValue);
    pledgeBarContainer.appendChild(rightPledgeLocalTotal);
    const rightPledgeRemainingSlotsContainer = MustGetElement(
      ".remaining-slots-container",
      rightPledgeLocalTotal
    );
    const rightPledgeBottomBar = document.createElement("div");
    rightPledgeBottomBar.classList.add("w-full", "absolute", "h-1", "bg-negative", "bottom-0");
    rightPledgeRemainingSlotsContainer.appendChild(rightPledgeBottomBar);
    const pledgeValuesContainer = document.createElement("fxs-hslot");
    pledgeValuesContainer.classList.add("pledge-values-container", "w-full");
    this.mainPledgeContainer.appendChild(pledgeValuesContainer);
    const leftPledgeTotal = this.createPledgeGroupValues(leftValue);
    if (leftPledgeTotal) {
      leftPledgeTotal.classList.add("grow");
      pledgeValuesContainer.appendChild(leftPledgeTotal);
    }
    const rightPledgeTotal = this.createPledgeGroupValues(rightValue);
    if (rightPledgeTotal) {
      rightPledgeTotal.classList.add("grow");
      pledgeValuesContainer.appendChild(rightPledgeTotal);
    }
    const uiViewExperience = UI.getViewExperience();
    const leadersContainer = document.createElement("fxs-hslot");
    if (uiViewExperience != UIViewExperience.Mobile) {
      leadersContainer.classList.add("leaders-container", "grow", "justify-between");
      this.mainPledgeContainer.appendChild(leadersContainer);
    }
    leftPledgeGroup.classList.add("left-pledge-group", "grow", "flex-wrap", "max-w-1\\/2");
    if (uiViewExperience == UIViewExperience.Mobile) {
      leftPledgeGroup.classList.add("justify-center");
      if (pledgeBarContainer.children.length > 0) {
        pledgeBarContainer.insertBefore(leftPledgeGroup, pledgeBarContainer.children[0]);
      } else {
        pledgeBarContainer.appendChild(leftPledgeGroup);
      }
    } else {
      leadersContainer.appendChild(leftPledgeGroup);
    }
    const leftPledgeTotals = [];
    this.leftPledgePlayers.forEach((playerID) => {
      const index = leftPledgeTotals.findIndex((pledge) => playerID == pledge.playerID);
      if (index == -1) {
        leftPledgeTotals.push({ numVotes: 1, playerID });
      } else {
        leftPledgeTotals[index].numVotes++;
      }
    });
    leftPledgeTotals.forEach((total) => {
      const pledgeLeaderIcon = this.createPledgeLeaderIcon(
        total.playerID,
        localPlayerDiplomacy
      );
      if (!pledgeLeaderIcon) {
        return;
      }
      leftPledgeGroup.appendChild(pledgeLeaderIcon);
      waitForLayout(() => {
        if (total.numVotes > 1) {
          const numVotesElement = document.createElement("div");
          numVotesElement.classList.value = "absolute self-center -bottom-2 rounded-xl size-6 text-base font-base bg-primary-3 text-secondary text-center";
          numVotesElement.setAttribute("data-l10n-id", total.numVotes.toString());
          pledgeLeaderIcon.appendChild(numVotesElement);
        }
      });
    });
    rightPledgeGroup.classList.add("right-pledge-group", "grow", "flex-wrap", "max-w-1\\/2");
    rightPledgeGroup.classList.toggle("justify-end", uiViewExperience != UIViewExperience.Mobile);
    if (uiViewExperience == UIViewExperience.Mobile) {
      rightPledgeGroup.classList.add("justify-center");
      pledgeBarContainer.appendChild(rightPledgeGroup);
    } else {
      leadersContainer.appendChild(rightPledgeGroup);
    }
    const rightPledgeTotals = [];
    this.rightPledgePlayers.forEach((playerID) => {
      const index = rightPledgeTotals.findIndex((pledge) => playerID == pledge.playerID);
      if (index == -1) {
        rightPledgeTotals.push({ numVotes: 1, playerID });
      } else {
        rightPledgeTotals[index].numVotes++;
      }
    });
    rightPledgeTotals.forEach((total) => {
      const pledgeLeaderIcon = this.createPledgeLeaderIcon(
        total.playerID,
        localPlayerDiplomacy
      );
      if (!pledgeLeaderIcon) {
        return;
      }
      rightPledgeGroup.appendChild(pledgeLeaderIcon);
      waitForLayout(() => {
        if (total.numVotes > 1) {
          const numVotesElement = document.createElement("div");
          numVotesElement.classList.value = "absolute self-center -bottom-2 rounded-xl size-6 text-base font-base bg-primary-3 text-secondary text-center";
          numVotesElement.setAttribute("data-l10n-id", total.numVotes.toString());
          pledgeLeaderIcon.appendChild(numVotesElement);
        }
      });
    });
    opposingPledgeGroup.classList.add("is-negative");
    supportPledgeGroup.classList.add("is-positive");
    opposingPledgeGroup.classList.toggle("lower-group", completionData.progressPerTurn > 0);
    opposingPledgeGroup.classList.toggle("neutral", completionData.progressPerTurn == 0);
    supportPledgeGroup.classList.toggle("lower-group", completionData.progressPerTurn < 0);
    supportPledgeGroup.classList.toggle("neutral", completionData.progressPerTurn == 0);
  }
  createSupportWarItem(actionData) {
    if (this.supportWarContentContainer) {
      removeAllChildren(this.supportWarContentContainer);
    }
    const leftPlayerLibrary = Players.get(this.determineLeftPlayer(actionData));
    const rightPlayerLibrary = Players.get(this.determineRightPlayer(actionData));
    if (!leftPlayerLibrary || !rightPlayerLibrary) {
      console.error("screen-diplomacy-action-details: failed to determine left and right players");
      this.close();
    } else {
      if (leftPlayerLibrary.id == actionData.initialPlayer) {
        this.leftPledgeButton = this.createPledgeButton({ isInitial: true, isLeft: true });
      } else {
        this.leftPledgeButton = this.createPledgeButton({ isInitial: false, isLeft: true });
      }
      this.leftPledgeButton.classList.add("pledge-left-button");
      this.leftPledgeButton.setAttribute("has-diploaction-focus-priority", "true");
      this.leftPledgeButton.setAttribute("action-key", "inline-cycle-prev");
      this.leftPledgeButton.setAttribute("data-audio-group-ref", "support-other-war-button");
      if (rightPlayerLibrary.id == actionData.initialPlayer) {
        this.rightPledgeButton = this.createPledgeButton({ isInitial: true, isLeft: true });
      } else {
        this.rightPledgeButton = this.createPledgeButton({ isInitial: false, isLeft: false });
      }
      this.rightPledgeButton.classList.add("pledge-right-button");
      this.rightPledgeButton.setAttribute("has-diploaction-focus-priority", "true");
      this.rightPledgeButton.setAttribute("action-key", "inline-cycle-next");
      this.rightPledgeButton.setAttribute("data-audio-group-ref", "support-other-war-button");
    }
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error("screen-diplomacy-action-details: failed to determine local player");
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error("screen-diplomacy-action-details: failed to determine local player diplomacy");
      return;
    }
    if (!leftPlayerLibrary || !rightPlayerLibrary) {
      console.error("screen-diplomacy-action-details: failed to determine left and right players");
      this.close();
    } else {
      if (this.leftPledgeButton && this.rightPledgeButton) {
        this.changeSupportWarButton(
          this.leftPledgeButton,
          Locale.compose("LOC_DIPLOMACY_ACTIONS_SUPPORT_CAPTION") + " " + Locale.compose(leftPlayerLibrary.name),
          this.determineLeftPlayer(actionData),
          localPlayerDiplomacy
        );
        this.changeSupportWarButton(
          this.rightPledgeButton,
          Locale.compose("LOC_DIPLOMACY_ACTIONS_SUPPORT_CAPTION") + " " + Locale.compose(rightPlayerLibrary.name),
          this.determineRightPlayer(actionData),
          localPlayerDiplomacy
        );
        this.leftPledgeButton.addEventListener("action-activate", () => {
          this.addLeftSupport(actionData);
        });
        this.rightPledgeButton.addEventListener("action-activate", () => {
          this.addRightSupport(actionData);
        });
        if (!this.supportWarContentContainer) {
          console.error("screen-diplomacy-action-details: no support-war-content-container found!");
          return;
        }
        this.supportWarContentContainer.appendChild(this.leftPledgeButton);
        const pledgeStatus = this.createPledgeGroupStatus(actionData);
        this.supportWarContentContainer.appendChild(pledgeStatus);
        this.supportWarContentContainer.appendChild(this.rightPledgeButton);
      } else {
        console.error("screen-diplomacy-action-details: no left or right pledge button found");
        return;
      }
    }
  }
  createSupportYourselfItem(actionData) {
    const responseItem = document.createElement("fxs-vslot");
    responseItem.classList.add(
      "panel-diplomacy-project-reaction__response-item",
      "h-full",
      "flex",
      "w-56",
      "flex",
      "flex-col",
      "self-center"
    );
    const responseButton = document.createElement("fxs-activatable");
    responseButton.setAttribute("data-audio-group-ref", "support-your-war-button");
    responseButton.setAttribute("action-key", "inline-confirm");
    responseButton.setAttribute("nav-help-class", "absolute left-9");
    responseButton.setAttribute("tabindex", "-1");
    responseButton.classList.remove("font-title-base", "font-bold");
    responseButton.classList.add(
      "support-your-war-button",
      "panel-diplomacy-project-reaction__response-item-bg",
      "z-0",
      "relative",
      "flex",
      "flex-col",
      "justify-start",
      "grow",
      "min-h-56",
      "w-full",
      "text-sm",
      "pb-3",
      "group-focus\\:opacity-0",
      "group-hover\\:opacity-0",
      "group-active\\:opacity-0",
      "group-pressed\\:opacity-0",
      "group"
    );
    const hoveredResponseButtonBg = document.createElement("div");
    hoveredResponseButtonBg.classList.add(
      "panel-diplomacy-project-reaction__response-item-hovered",
      "-z-1",
      "absolute",
      "inset-0",
      "flex",
      "flex-col",
      "justify-start",
      "min-h-56",
      "w-full",
      "grow",
      "text-sm",
      "pb-3",
      "opacity-0",
      "-mt-0\\.5",
      "group-focus\\:opacity-100",
      "group-hover\\:opacity-100",
      "group-active\\:opacity-100",
      "group-pressed\\:opacity-100",
      "transition-opacity"
    );
    const cardTopWrapper = document.createElement("div");
    cardTopWrapper.classList.add("flex", "flex-row");
    const responseDescription = document.createElement("div");
    responseDescription.classList.add(
      "panel-diplomacy-project-reaction__response-description",
      "grow",
      "min-h-36",
      "w-full",
      "font-body",
      "text-xs",
      "mb-2",
      "px-2",
      "self-center",
      "text-center",
      "break-words"
    );
    const relationshipIconContainer = document.createElement("div");
    relationshipIconContainer.classList.add("flex", "flex-row");
    const supportYourselfIcon = document.createElement("div");
    supportYourselfIcon.classList.add(
      "panel-diplomacy-project-reaction__support-yourself",
      "-mt-2",
      "size-13",
      "bg-cover"
    );
    relationshipIconContainer.appendChild(supportYourselfIcon);
    cardTopWrapper.appendChild(relationshipIconContainer);
    const responseTitle = document.createElement("div");
    responseTitle.classList.add(
      "panel-diplomacy-project-reaction__card-title",
      "w-52",
      "font-title",
      "text-xs",
      "text-secondary",
      "uppercase",
      "pb-2",
      "mt-2",
      "text-center",
      "tracking-100"
    );
    responseTitle.setAttribute("data-l10n-id", "LOC_SUPPORT_WAR_SELF");
    responseButton.appendChild(cardTopWrapper);
    const responseText = document.createElement("div");
    responseText.classList.add("panel-diplomacy-project-reaction__card-subtitle", "text-center", "w-52");
    responseText.setAttribute("data-l10n-id", "LOC_DIPLOMACY_SEND_ENVOY");
    const descriptionText = document.createElement("div");
    descriptionText.classList.add("p-2", "break-words");
    descriptionText.setAttribute("data-l10n-id", "LOC_DIPLOMACY_ACTION_WAR_DETAILS_LIGHT_WW");
    responseDescription.appendChild(responseTitle);
    responseDescription.appendChild(responseText);
    responseDescription.appendChild(descriptionText);
    responseButton.appendChild(responseDescription);
    const costWrapper = document.createElement("div");
    costWrapper.classList.add("flow-row", "grow", "justify-center", "mb-4");
    const influenceIconWrapper = document.createElement("div");
    influenceIconWrapper.classList.add("self-end");
    const influenceIcon = document.createElement("img");
    influenceIcon.classList.add("w-8", "h-8");
    influenceIcon.src = "fs://game/yield_influence";
    influenceIconWrapper.appendChild(influenceIcon);
    costWrapper.appendChild(influenceIconWrapper);
    if (actionData.initialPlayer != GameContext.localPlayerID && actionData.targetPlayer != GameContext.localPlayerID) {
      const leftPlayerLibrary = Players.get(this.determineLeftPlayer(actionData));
      if (!leftPlayerLibrary) {
        console.error("screen-diplomacy-action-details: failed to determine left and right players");
        this.close();
      }
      const rightPlayerLibrary = Players.get(this.determineRightPlayer(actionData));
      if (!rightPlayerLibrary) {
        console.error("screen-diplomacy-action-details: failed to determine left and right players");
        this.close();
      }
      if (leftPlayerLibrary && rightPlayerLibrary) {
        if (this.leftPledgePlayers.includes(GameContext.localPlayerID)) {
          if (leftPlayerLibrary.id == actionData.targetPlayer) {
            const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
              actionData.uniqueID,
              GameContext.localPlayerID,
              false
            );
            const costDescription = document.createElement("div");
            costDescription.id = "support-war-cost";
            costDescription.setAttribute("data-l10n-id", influenceCost.toString());
            costDescription.classList.add("self-end", "mb-1");
            costWrapper.appendChild(costDescription);
          } else {
            const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
              actionData.uniqueID,
              GameContext.localPlayerID,
              true
            );
            const costDescription = document.createElement("div");
            costDescription.id = "support-war-cost";
            costDescription.setAttribute("data-l10n-id", influenceCost.toString());
            costDescription.classList.add("self-end", "mb-1");
            costWrapper.appendChild(costDescription);
          }
        } else {
          if (this.rightPledgePlayers.includes(GameContext.localPlayerID)) {
            if (rightPlayerLibrary.id == actionData.targetPlayer) {
              const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
                actionData.uniqueID,
                GameContext.localPlayerID,
                false
              );
              const costDescription = document.createElement("div");
              costDescription.id = "support-war-cost";
              costDescription.setAttribute("data-l10n-id", influenceCost.toString());
              costDescription.classList.add("self-end", "mb-1");
              costWrapper.appendChild(costDescription);
            } else {
              const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
                actionData.uniqueID,
                GameContext.localPlayerID,
                true
              );
              const costDescription = document.createElement("div");
              costDescription.id = "support-war-cost";
              costDescription.setAttribute("data-l10n-id", influenceCost.toString());
              costDescription.classList.add("self-end", "mb-1");
              costWrapper.appendChild(costDescription);
            }
          }
        }
      }
    } else {
      const influenceCost = Game.Diplomacy.getInfluenceForNextSupport(
        actionData.uniqueID,
        GameContext.localPlayerID,
        actionData.initialPlayer == GameContext.localPlayerID
      );
      const costDescription = document.createElement("div");
      costDescription.id = "support-war-cost";
      costDescription.setAttribute("data-l10n-id", influenceCost.toString());
      costDescription.classList.add("self-end", "mb-1");
      costWrapper.appendChild(costDescription);
    }
    cardTopWrapper.appendChild(costWrapper);
    responseButton.appendChild(hoveredResponseButtonBg);
    responseItem.appendChild(responseButton);
    const yourWarActionsContainer = document.createElement("fxs-hslot");
    yourWarActionsContainer.classList.add("your-war-actions-container", "justify-between", "grow");
    yourWarActionsContainer.appendChild(responseItem);
    const optionLimitedByWarColumn = document.createElement("fxs-vslot");
    optionLimitedByWarColumn.classList.add("option-limited-by-war-column", "justify-center", "w-56", "h-64");
    const optionLimitedByWarBackground = document.createElement("div");
    optionLimitedByWarBackground.classList.add(
      "option-limited-by-war-bg",
      "absolute",
      "w-full",
      "h-full",
      "bg-cover",
      "bg-center",
      "opacity-20"
    );
    optionLimitedByWarColumn.appendChild(optionLimitedByWarBackground);
    const optionLimitedByWarText = document.createElement("fxs-vslot");
    optionLimitedByWarText.classList.add("option-limited-by-war-text", "justify-center", "items-center");
    optionLimitedByWarText.setAttribute("data-l10n-id", "LOC_DIPLOMACY_OPTION_LIMITED_BY_WAR");
    optionLimitedByWarColumn.appendChild(optionLimitedByWarText);
    yourWarActionsContainer.appendChild(optionLimitedByWarColumn);
    yourWarActionsContainer.appendChild(optionLimitedByWarColumn.cloneNode(true));
    return yourWarActionsContainer;
  }
  updateButtonsAndEditor(actionData) {
    if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR) {
      const initialPlayer = Players.get(actionData.initialPlayer);
      const targetPlayer = Players.get(actionData.targetPlayer);
      if (!initialPlayer || !targetPlayer) {
        console.error("screen-diplomacy-action-details: unable to get player structures for involved players!");
        this.close();
        return;
      }
      this.yourWarContentContainer = MustGetElement(".your-war-content-container", this.Root);
      this.supportWarContentContainer = MustGetElement(".support-war-content-container", this.Root);
      const localPlayer = Players.get(GameContext.localPlayerID);
      if (!localPlayer) {
        console.error("screen-diplomacy-action-details: updateButtonsAndEditor(): No local player!");
        return;
      }
      let availableDiplomacyYield = 0;
      if (localPlayer.DiplomacyTreasury) {
        availableDiplomacyYield = localPlayer.DiplomacyTreasury?.diplomacyBalance;
      }
      const diplomacyBalance = MustGetElement(
        ".screen-diplomacy-action-details__accumulated-influence",
        this.Root
      );
      diplomacyBalance.textContent = Math.floor(availableDiplomacyYield).toString();
      removeAllChildren(this.yourWarContentContainer);
      const yourWarContent = this.createSupportYourselfItem(actionData);
      yourWarContent.setAttribute("has-diploaction-focus-priority", "true");
      yourWarContent.setAttribute("action-key", "inline-cycle-next");
      this.yourWarContentContainer.appendChild(yourWarContent);
      const supportWarButton = MustGetElement(".support-your-war-button", yourWarContent);
      this.createSupportWarItem(actionData);
      if (this.leftPledgeButton == null || this.rightPledgeButton == null) {
        console.error("screen-diplomacy-action-details: failed to source pledge buttons for war!");
        this.close();
        return;
      }
      if (this.leftPledgePlayers.includes(GameContext.localPlayerID) || this.rightPledgePlayers.includes(GameContext.localPlayerID) || this.determineRightPlayer(actionData) == GameContext.localPlayerID || this.determineLeftPlayer(actionData) == GameContext.localPlayerID) {
        this.supportWarContentContainer.classList.add("hidden");
        if (Game.Diplomacy.getOpposingPlayers(actionData.uniqueID).includes(GameContext.localPlayerID) || actionData.targetPlayer == GameContext.localPlayerID) {
          let supportButtonString = "";
          if (actionData.targetPlayer == GameContext.localPlayerID) {
            supportButtonString = Locale.compose("LOC_SUPPORT_WAR_SELF");
          } else {
            const playerName = Players.get(actionData.targetPlayer)?.name;
            if (!playerName) {
              return;
            }
            supportButtonString = Locale.compose("LOC_SUPPORT_WAR_BUTTON", Locale.compose(playerName));
          }
          if (!localPlayer.Diplomacy) {
            return;
          }
          this.changeSupportWarButton(
            supportWarButton,
            supportButtonString,
            actionData.targetPlayer,
            localPlayer.Diplomacy
          );
          const supportArgs = {
            ID: DiplomacyManager.selectedActionID,
            Type: DiplomacyTokenTypes.DIPLOMACY_TOKEN_GLOBAL,
            Amount: 1,
            SubType: false
            // TRUE: INITIAL. FALSE: TARGET
          };
          const supportResult = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
            supportArgs,
            false
          );
          if (supportResult.Success) {
            supportWarButton.setAttribute("disabled", "false");
            supportWarButton.addEventListener("action-activate", () => {
              Game.PlayerOperations.sendRequest(
                GameContext.localPlayerID,
                PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
                supportArgs
              );
            });
          } else {
            supportWarButton.setAttribute("disabled", "true");
            const influenceText = MustGetElement("#support-war-cost", supportWarButton);
            influenceText.classList.add("text-negative");
          }
        } else {
          let supportButtonString = "";
          if (actionData.initialPlayer == GameContext.localPlayerID) {
            supportButtonString = Locale.compose("LOC_SUPPORT_WAR_SELF");
          } else {
            const playerName = Players.get(actionData.initialPlayer)?.name;
            if (!playerName) {
              return;
            }
            supportButtonString = Locale.compose("LOC_SUPPORT_WAR_BUTTON", Locale.compose(playerName));
          }
          if (!localPlayer.Diplomacy) {
            return;
          }
          this.changeSupportWarButton(
            supportWarButton,
            supportButtonString,
            actionData.initialPlayer,
            localPlayer.Diplomacy
          );
          const supportArgs = {
            ID: DiplomacyManager.selectedActionID,
            Type: DiplomacyTokenTypes.DIPLOMACY_TOKEN_GLOBAL,
            Amount: 1,
            SubType: true
            // TRUE: INITIAL. FALSE: TARGET
          };
          const supportResult = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
            supportArgs,
            false
          );
          if (supportResult.Success) {
            supportWarButton.setAttribute("disabled", "false");
            supportWarButton.addEventListener("action-activate", () => {
              Game.PlayerOperations.sendRequest(
                GameContext.localPlayerID,
                PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
                supportArgs
              );
              this.updateButtonsAndEditor(actionData);
            });
          } else {
            supportWarButton.setAttribute("disabled", "true");
            const influenceText = MustGetElement("#support-war-cost", supportWarButton);
            influenceText.classList.add("text-negative");
            let failureReasonsString = "";
            if (supportResult.FailureReasons) {
              supportResult.FailureReasons.forEach((reason) => {
                failureReasonsString += Locale.stylize(reason);
              });
              supportWarButton.setAttribute("data-tooltip-content", failureReasonsString);
            }
          }
        }
      } else {
        if (!this.yourWarContentContainer) {
          console.error(
            "screen-diplomacy-action-details.ts at updateButtonsAndEditor: No your-war-content-container was found!"
          );
          return;
        }
        this.yourWarContentContainer.classList.add("hidden");
        this.supportWarContentContainer.classList.remove("hidden");
        if (!this.canSupportSide(true)) {
          this.leftPledgeButton.setAttribute("disabled", "true");
          if (this.leftSupportCostDescriptions != null) {
            this.leftSupportCostDescriptions.classList.add("text-negative");
          }
        }
        if (!this.canSupportSide(false)) {
          this.rightPledgeButton.setAttribute("disabled", "true");
          if (this.rightSupportCostDescriptions != null) {
            this.rightSupportCostDescriptions.classList.add("text-negative");
          }
        }
      }
    } else {
      if (this.leftPledgeButton && this.rightPledgeButton) {
        this.supportWarContentContainer?.classList.add("hidden");
      }
    }
  }
  changeSupportWarButton(supportWarButton, supportPlayerString, playerID, localPlayerDiplomacy) {
    if (playerID == GameContext.localPlayerID) {
      return;
    }
    const supportWarButtonTitle = MustGetElement(".panel-diplomacy-project-reaction__card-title", supportWarButton);
    const supportWarButtonIconContainer = supportWarButton.querySelector(
      ".panel-diplomacy-project-reaction__icon-container"
    );
    const supportWarButtonIcon = MustGetElement(
      ".panel-diplomacy-project-reaction__support-yourself",
      supportWarButton
    );
    supportWarButtonTitle.setAttribute("data-l10n-id", supportPlayerString);
    const supportLeaderIcon = this.createPledgeLeaderIcon(
      playerID,
      localPlayerDiplomacy,
      supportWarButtonIconContainer != null
    );
    if (!supportWarButtonIconContainer || !supportLeaderIcon) {
      return;
    }
    supportWarButtonIcon.classList.add("opacity-0");
    supportLeaderIcon.classList.add("-left-0\\.5", "-top-2", "absolute");
    supportWarButtonIconContainer.appendChild(supportLeaderIcon);
  }
  //Initial setup of screen
  populateActionDetails() {
    if (Game.Diplomacy.isProjectCanceled(DiplomacyManager.selectedActionID)) {
      this.close();
      return;
    }
    const actionData = Game.Diplomacy.getDiplomaticEventData(
      DiplomacyManager.selectedActionID
    );
    if (!actionData) {
      console.error(
        "screen-diplomacy-action-details: Unable to retrieve DiplomaticEventHeader for selected action with ID: " + DiplomacyManager.selectedActionID
      );
      this.close();
      return;
    }
    if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN && actionData.targetPlayer == DiplomacyManager.selectedPlayerID) {
      this.Root.classList.add("befriend-independant");
    }
    const completionData = Game.Diplomacy.getCompletionData(
      DiplomacyManager.selectedActionID
    );
    if (!completionData) {
      console.error(
        "screen-diplomacy-action-details: Unable to retrieve DiplomacyEventCompletionData for selected action with ID: " + DiplomacyManager.selectedActionID
      );
      this.close();
      return;
    }
    this.titleProgressBarContainer = MustGetElement(".title-progress-bar-container", this.Root);
    this.yourWarContentContainer = MustGetElement(".your-war-content-container", this.Root);
    removeAllChildren(this.yourWarContentContainer);
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error("screen-diplomacy-action-details: Unable to get player object for local player!");
      this.close();
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error("screen-diplomacy-action-details: Unable to find local player diplomacy!");
      this.close();
      return;
    }
    const leftPlayer = this.determineLeftPlayer(actionData);
    const actionName = document.createElement("fxs-header");
    actionName.classList.add("action-name", "uppercase", "font-title", "text-base");
    actionName.setAttribute("filigree-style", "h4");
    if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR) {
      actionName.classList.add("war");
      const warData = Game.Diplomacy.getWarData(actionData.uniqueID, GameContext.localPlayerID);
      actionName.setAttribute("title", warData.warName);
    } else if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN) {
      const village = Players.get(actionData.targetPlayer);
      if (village != null) {
        actionName.setAttribute("title", Locale.compose(actionData.name, village.name));
      } else {
        actionName.setAttribute("title", "LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_PROJECT_NAME");
      }
      this.yourWarContentContainer.classList.add("not-war");
    } else {
      actionName.setAttribute("title", actionData.name);
      this.yourWarContentContainer.classList.add("not-war");
    }
    this.titleProgressBarContainer.appendChild(actionName);
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("diplomacy-action-details__details-container");
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("diplomacy-action-details__progress-container");
    detailsContainer.appendChild(progressContainer);
    if (this.actionContentColumn) {
      this.actionContentColumn.appendChild(detailsContainer);
    }
    if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN) {
      const supportContainer = document.createElement("div");
      supportContainer.classList.add("diplomacy-action-details__support-container");
      const supportGroupContainer = document.createElement("div");
      supportGroupContainer.classList.add("diplomacy-action-details__pledge-group-container");
      this.titleProgressBarContainer.appendChild(supportGroupContainer);
      const pledgeContainer = this.createPledgeGroup();
      pledgeContainer.classList.add("left-pledge-group");
      pledgeContainer.classList.add("is-positive");
      pledgeContainer.classList.add("befriend-group-left");
      supportGroupContainer.appendChild(pledgeContainer);
      const pledgeContainerRight = this.createPledgeGroup();
      pledgeContainerRight.classList.add("right-pledge-group");
      pledgeContainerRight.classList.add("is-negative");
      pledgeContainerRight.classList.add("befriend-group-right");
      supportGroupContainer.appendChild(pledgeContainerRight);
      const pledgeIconContainer = document.createElement("div");
      pledgeIconContainer.classList.add("diplomacy-action-details__pledge-group-icon-container");
      pledgeContainer.appendChild(pledgeIconContainer);
      this.updatePlayerGroups(actionData, leftPlayer);
      this.leftPledgePlayers.forEach((playerID) => {
        const pledgeLeaderIcon = this.createPledgeLeaderIcon(
          playerID,
          localPlayerDiplomacy
        );
        if (!pledgeLeaderIcon) {
          return;
        }
        pledgeIconContainer.appendChild(pledgeLeaderIcon);
      });
      const pledgeContainerTitle = this.createPledgeGroupValues(
        Math.abs(this.determineLocalPlayerSupport(actionData))
      );
      if (pledgeContainerTitle) {
        pledgeContainer.appendChild(pledgeContainerTitle);
      }
      progressContainer.appendChild(supportContainer);
      detailsContainer.classList.add("is-befriend-independent");
    }
    const projectData = Game.Diplomacy.getProjectDataForUI(
      actionData.initialPlayer,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
      DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
    ).find((project) => project.actionID == DiplomacyManager.selectedActionID);
    if (projectData && (projectData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_PROJECT || projectData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ENDEAVOR || projectData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_SANCTION) && projectData.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN) {
      const projectDescriptionContainer = document.createElement("div");
      projectDescriptionContainer.classList.add("diplomacy-action-details__project-description-container");
      projectDescriptionContainer.setAttribute("data-l10n-id", projectData.projectDescription);
      detailsContainer.appendChild(projectDescriptionContainer);
    }
    if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR) {
      this.createPledgeGroups(actionData, completionData, localPlayerDiplomacy);
    }
    this.updateButtonsAndEditor(actionData);
  }
  updateActionDetails() {
    if (Game.Diplomacy.isProjectCanceled(DiplomacyManager.selectedActionID)) {
      this.close();
      return;
    }
    const actionData = Game.Diplomacy.getDiplomaticEventData(
      DiplomacyManager.selectedActionID
    );
    if (!actionData) {
      console.error(
        "screen-diplomacy-action-details: Unable to retrieve DiplomaticEventHeader for selected action with ID: " + DiplomacyManager.selectedActionID
      );
      this.close();
      return;
    }
    const leftPlayer = this.determineLeftPlayer(actionData);
    this.updatePlayerGroups(actionData, leftPlayer);
    const completionData = Game.Diplomacy.getCompletionData(
      DiplomacyManager.selectedActionID
    );
    if (!completionData) {
      console.error(
        "screen-diplomacy-action-details: Unable to retrieve DiplomacyEventCompletionData for selected action with ID: " + DiplomacyManager.selectedActionID
      );
      this.close();
      return;
    }
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error("screen-diplomacy-action-details: Unable to get player object for local player!");
      this.close();
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error("screen-diplomacy-action-details: Unable to find local player diplomacy!");
      this.close();
      return;
    }
    if (this.yourWarContentContainer) {
      const oldSupportContainer = this.yourWarContentContainer.querySelector(
        ".diplomacy-action-details__support-container"
      );
      if (oldSupportContainer) {
        this.yourWarContentContainer.removeChild(oldSupportContainer);
      }
      if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR) {
        this.createPledgeGroups(actionData, completionData, localPlayerDiplomacy);
      }
      this.updateButtonsAndEditor(actionData);
    }
  }
  disablePledgeButtons() {
    if (this.leftPledgeButton && this.rightPledgeButton) {
      this.leftPledgeButton.classList.add("disabled");
      this.rightPledgeButton.classList.add("disabled");
    }
  }
  supportSide(initial) {
    const globalOpposeArgs = {
      ID: DiplomacyManager.selectedActionID,
      Type: DiplomacyTokenTypes.DIPLOMACY_TOKEN_GLOBAL,
      Amount: 1,
      SubType: initial
      // TRUE: INITIAL. FALSE: TARGET
    };
    const globalOpposeResults = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
      globalOpposeArgs,
      false
    );
    if (Game.Diplomacy.isProjectCanceled(DiplomacyManager.selectedActionID)) {
      return false;
    }
    const actionData = Game.Diplomacy.getDiplomaticEventData(
      DiplomacyManager.selectedActionID
    );
    if (!actionData) {
      console.error(
        "screen-diplomacy-action-details: Unable to retrieve DiplomaticEventHeader for selected action with ID: " + DiplomacyManager.selectedActionID
      );
      return false;
    }
    if (globalOpposeResults.Success) {
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
        globalOpposeArgs
      );
      this.disablePledgeButtons();
      return true;
    } else {
      return false;
    }
  }
  addLeftSupport(actionData) {
    const leftPlayer = this.determineLeftPlayer(actionData);
    this.updateButtonsAndEditor(actionData);
    return this.supportSide(leftPlayer == actionData.initialPlayer);
  }
  addRightSupport(actionData) {
    const leftPlayer = this.determineLeftPlayer(actionData);
    this.updateButtonsAndEditor(actionData);
    return this.supportSide(leftPlayer != actionData.initialPlayer);
  }
  canSupportSide(initial) {
    const supportArgs = {
      ID: DiplomacyManager.selectedActionID,
      Type: DiplomacyTokenTypes.DIPLOMACY_TOKEN_GLOBAL,
      Amount: 1,
      SubType: initial
      // TRUE: INITIAL. FALSE: TARGET.
    };
    const results = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
      supportArgs,
      false
    );
    if (!results.FailureReasons) {
      return results.Success;
    }
    if (results.FailureReasons.length <= 0) {
      return results.Success;
    }
    if (!this.leftPledgeButton || !this.rightPledgeButton) {
      return results.Success;
    }
    const tooltipTargetButton = initial ? this.leftPledgeButton : this.rightPledgeButton;
    if (!tooltipTargetButton) {
      return results.Success;
    }
    let failureReasonsString = "";
    results.FailureReasons.forEach((reason) => {
      failureReasonsString += Locale.stylize(reason);
    });
    tooltipTargetButton.setAttribute("data-tooltip-content", failureReasonsString);
    return results.Success;
  }
  createPledgeLeaderIcon(playerID, localPlayerDiplomacy, hasSupportWarButtonIconContainer = false) {
    const target = Configuration.getPlayer(playerID);
    if (target?.leaderTypeName) {
      const targetIcon = document.createElement("leader-icon");
      targetIcon.classList.add("mr-2", "mt-1", "w-16", "h-16", "relative", "pointer-events-auto");
      if (hasSupportWarButtonIconContainer) {
        targetIcon.classList.add("panel-diplomacy-project-support-leader-icon");
      }
      if (playerID == GameContext.localPlayerID || localPlayerDiplomacy.hasMet(playerID)) {
        const player = Players.get(playerID);
        if (!player) {
          console.error(
            "screen-diplomacy-action-details: Unable to get player object for player with id: " + playerID
          );
          return null;
        }
        targetIcon.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_DIPLOMACY_ACTIONS_SUPPORTING_TOKEN_FROM_PLAYER", Locale.compose(player.name))
        );
        targetIcon.setAttribute("leader", target.leaderTypeName);
        targetIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(playerID));
      } else {
        targetIcon.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_DIPLOMACY_ACTIONS_SUPPORTING_TOKEN_FROM_UNMET_PLAYER")
        );
      }
      return targetIcon;
    }
    return null;
  }
  onSupportChanged(data) {
    if (data.actionID == DiplomacyManager.selectedActionID) {
      this.updateActionDetails();
      waitUntilValue(() => this.Root.querySelector(".pledge-right-button")).then(() => {
        this.realizeFocus();
        this.realizeNavtray();
      });
      if (Game.Diplomacy.isProjectCanceled(DiplomacyManager.selectedActionID)) {
        this.close();
      }
    }
  }
  onClose() {
    this.close();
  }
  closeFromPauseSignal() {
    DiplomacyManager.shouldQuickClose = false;
    this.close();
  }
  close() {
    DiplomacyManager.selectedActionID = -1;
    if (DiplomacyManager.shouldQuickClose) {
      DiplomacyManager.shouldQuickClose = false;
      DiplomacyManager.lowerDiplomacyHub();
    }
    window.dispatchEvent(new CustomEvent("diplomacy-action-details-closed"));
    super.close();
  }
  realizeNavtray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
  realizeFocus() {
    if (this.supportWarContentContainer?.classList.contains("hidden")) {
      this.focusableElements = [this.supportYourselfButton];
    } else {
      this.focusableElements = [this.leftPledgeButton, this.rightPledgeButton];
    }
    const availableElements = this.focusableElements.filter(
      (element) => element?.getAttribute("has-diploaction-focus-priority") == "true"
    );
    const focusElement = availableElements.find((element) => !element?.classList.contains("disabled")) ?? availableElements.find(() => true);
    if (focusElement) {
      FocusManager.setFocus(focusElement);
    } else {
      if (this.yourWarContentContainer) {
        FocusManager.setFocus(this.yourWarContentContainer);
      }
    }
  }
}
Controls.define("screen-diplomacy-action-details", {
  createInstance: DiplomacyActionDetailsScreen,
  description: "Diplomacy Action Details screen.",
  styles: [styles],
  innerHTML: [content],
  classNames: ["screen-diplomacy-action-details", "w-full", "h-full", "flex", "justify-center", "items-center"],
  attributes: []
});
//# sourceMappingURL=screen-diplomacy-action-details.js.map
