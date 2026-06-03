import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/input-events.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import { AnchorType } from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import DiplomacyManager, { DiplomacyInputPanel } from '../diplomacy/diplomacy-manager.js';
import LeaderModelManager from '../diplomacy/leader-model-manager.js';
import content from './panel-diplomacy-hub.html.js';
import styles from './panel-diplomacy-hub.scss.js';

const FirstMeetOpenReactions = new CustomEvent("diplomacy-first-meet-open-reactions");
class DiplomacyHubPanel extends DiplomacyInputPanel {
  interfaceModeChangedListener = () => {
    this.onInterfaceModeChanged();
  };
  diplomacyDialogNextListener = () => {
    this.onNextDiplomacyDialog();
  };
  diplomacyDialogUpdateResponseListener = () => {
    this.onUpdateResponse();
  };
  diplomacyAnimationFinishedListener = (event) => {
    this.onDiplomacyAnimationFinished(event);
  };
  viewReceiveFocusListener = () => {
    this.onViewReceiveFocus();
  };
  diplomacyEventResponseListener = (eventData) => {
    this.onDiplomacyEventResponse(eventData);
  };
  isSkipAllowed = false;
  hasSkipped = false;
  isShowingActionResponse = false;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToBottom;
  }
  onAttach() {
    super.onAttach();
    window.addEventListener("diplomacy-dialog-next", this.diplomacyDialogNextListener);
    window.addEventListener("diplomacy-dialog-update-response", this.diplomacyDialogUpdateResponseListener);
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.updateSkipLabel);
    this.Root.addEventListener("view-receive-focus", this.viewReceiveFocusListener);
    engine.on("DiplomacyEventResponse", this.diplomacyEventResponseListener);
    if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_DIALOG")) {
      this.populateDialog();
    } else {
      this.Root.classList.add("hidden");
    }
    this.isSkipAllowed = false;
  }
  onDetach() {
    window.removeEventListener("diplomacy-dialog-next", this.diplomacyDialogNextListener);
    window.removeEventListener("diplomacy-dialog-update-response", this.diplomacyDialogUpdateResponseListener);
    window.removeEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.updateSkipLabel);
    this.Root.removeEventListener("view-receive-focus", this.viewReceiveFocusListener);
    engine.off("DiplomacyEventResponse", this.diplomacyEventResponseListener);
    NavTray.clear();
    super.onDetach();
  }
  onViewReceiveFocus() {
    const acceptButtons = this.Root.querySelector(".panel-diplomacy-hub__button-acknowledge");
    if (acceptButtons) {
      FocusManager.get().setFocus(acceptButtons);
    }
    this.populateNavTray();
  }
  populateNavTray() {
    NavTray.clear();
    if (this.Root.classList.contains("initial-subtitles") && this.isSkipAllowed) {
      NavTray.addOrUpdateCancel("LOC_DIPLOMACY_SKIP_DIALOG");
      return;
    }
  }
  // ------------------------------------------------------------------------
  // Populate the leader dialog, based on the the data in
  // DiplomacyManager.currentDiplomacyDialogData
  populateDialog() {
    if (!DiplomacyManager.currentDiplomacyDialogData) {
      console.error(
        "panel-diplomacy-dialog: populateDialog(): Invalid currentDiplomacyDialogData, closing current dialog!"
      );
      DiplomacyManager.closeCurrentDiplomacyDialog();
      return;
    }
    this.isShowingActionResponse = false;
    this.Root.classList.remove("action-response");
    this.Root.classList.remove("fade-action-response");
    this.Root.classList.remove("hidden");
    this.Root.classList.add("initial-subtitles");
    const dialogTextElement = this.Root.querySelector(".dialog-text");
    if (!dialogTextElement) {
      console.error("panel-diplomacy-hub: populateDialog(): Missing dialogTextElement with '.dialog-text'");
      DiplomacyManager.closeCurrentDiplomacyDialog();
      return;
    }
    const dialogOptionsContainer = this.Root.querySelector(".diplomacy-options");
    if (!dialogOptionsContainer) {
      console.error(
        "panel-diplomacy-hub: populateDialog(): Missing dialogOptionsContainer with '.diplomacy-options'"
      );
      DiplomacyManager.closeCurrentDiplomacyDialog();
      return;
    }
    while (dialogOptionsContainer.hasChildNodes()) {
      dialogOptionsContainer.removeChild(dialogOptionsContainer.lastChild);
    }
    let focusLocation;
    const focusUnit = Units.get(DiplomacyManager.currentDiplomacyDialogData.FocusID);
    if (focusUnit) {
      focusLocation = focusUnit.location;
    }
    if (DiplomacyManager.currentDiplomacyDialogData.StatementTypeDef) {
      const params = {
        sequenceType: DiplomacyManager.currentDiplomacyDialogData.StatementTypeDef.GroupType,
        sequenceSubType: "",
        player1: GameContext.localPlayerID,
        player2: DiplomacyManager.currentDiplomacyDialogData.OtherPlayerID,
        initiatingPlayer: DiplomacyManager.currentDiplomacyDialogData.InitiatingPlayerID,
        focusID: DiplomacyManager.currentDiplomacyDialogData.FocusID,
        focusLocation
      };
      if (DiplomacyManager.currentDiplomacyDialogData.DealAction) {
        if (DiplomacyManager.currentDiplomacyDialogData.DealAction == DiplomacyDealProposalActions.ACCEPTED) {
          params.sequenceType = "ACCEPT_PEACE";
        } else if (DiplomacyManager.currentDiplomacyDialogData.DealAction == DiplomacyDealProposalActions.REJECTED) {
          params.sequenceType = "REJECT_PEACE";
        }
      }
      if (LeaderModelManager.showLeaderSequence(params)) {
        window.addEventListener("diplomacy-animation-finished", this.diplomacyAnimationFinishedListener);
      } else {
        console.error(
          "panel-diplomacy-hub: populateDialog(): Unknown Statement Group, unable to determine what leader scene to show"
        );
        DiplomacyManager.closeCurrentDiplomacyDialog();
        return;
      }
    }
    dialogTextElement.innerHTML = DiplomacyManager.currentDiplomacyDialogData.Message;
    dialogTextElement.classList.add("font-body", "text-base", "text-center");
    const diploDialogWrapper = MustGetElement(".diplomacy-dialog-content", this.Root);
    diploDialogWrapper.classList.add("panel-diplomacy-hub__dialog-declare-war");
    const postDeclareWarOptions = MustGetElement(".diplomacy-options", this.Root);
    const postDeclareWarWrapper = document.createElement("fxs-hslot");
    postDeclareWarOptions.appendChild(postDeclareWarWrapper);
    if (DiplomacyManager.isDeclareWarDiplomacyOpen || DiplomacyManager.currentDiplomacyDialogData.StatementTypeDef?.GroupType == "WAR") {
      DiplomacyManager.currentDiplomacyDialogData.Choices.forEach((dialogOption, index) => {
        if (dialogOption.ChoiceType == "CHOICE_EXIT") {
          const ackButton = document.createElement("chooser-item");
          ackButton.addEventListener("action-activate", () => {
            const otherButtons = dialogOptionsContainer.querySelectorAll("chooser-item");
            otherButtons.forEach((dialogButton) => {
              dialogButton.classList.add("disabled");
              dialogButton.setAttribute("disabled", "true");
            });
            dialogOption.Callback();
          });
          ackButton.classList.add(
            "panel-diplomacy-hub__button-acknowledge",
            "chooser-item_unlocked",
            "font-title",
            "uppercase",
            "tracking-150",
            "text-secondary-1",
            "text-xs",
            "self-center",
            "min-h-16",
            "w-72",
            "p-4",
            "ml-4",
            "flow-row"
          );
          postDeclareWarWrapper.appendChild(ackButton);
          const radialBG = document.createElement("div");
          radialBG.classList.add(
            "panel-diplomacy-hub__radial-bg",
            "absolute",
            "self-center",
            "bg-cover",
            "size-16",
            "group-focus\\:opacity-0",
            "group-hover\\:opacity-0",
            "group-active\\:opacity-0",
            "opacity-1"
          );
          const radialBGHover = document.createElement("div");
          radialBGHover.classList.add(
            "panel-diplomacy-hub__radial-bg-hover",
            "absolute",
            "self-center",
            "opacity-0",
            "bg-cover",
            "size-16",
            "group-focus\\:opacity-100",
            "group-hover\\:opacity-100",
            "group-active\\:opacity-100"
          );
          const closeDealButton = MustGetElement(".panel-diplomacy-hub__button-acknowledge", this.Root);
          closeDealButton.appendChild(radialBG);
          closeDealButton.appendChild(radialBGHover);
          const closeDealIconWrapper = document.createElement("div");
          closeDealIconWrapper.classList.add(
            "absolute",
            "size-16",
            "self-center",
            "bg-cover",
            "panel-diplomacy-project-reaction__close-icon"
          );
          const acknowledgeIcon = document.createElement("img");
          acknowledgeIcon.classList.add("flex", "self-center", "mt-4", "size-9");
          acknowledgeIcon.setAttribute("src", UI.getIconURL("DIPLOMACY_ESP_SUCCESS"));
          closeDealIconWrapper.appendChild(acknowledgeIcon);
          closeDealButton.appendChild(closeDealIconWrapper);
          const closeDealDescription = document.createElement("div");
          closeDealDescription.classList.add("relative", "ml-18", "self-center", "max-w-56");
          closeDealDescription.setAttribute("data-l10n-id", dialogOption.ChoiceString);
          ackButton.setAttribute("tabindex", index.toString());
          closeDealButton.appendChild(closeDealDescription);
        } else {
          const warDetailsButton = document.createElement("chooser-item");
          warDetailsButton.addEventListener("action-activate", () => {
            const otherButtons = dialogOptionsContainer.querySelectorAll("chooser-item");
            otherButtons.forEach((dialogButton) => {
              dialogButton.classList.add("disabled");
              dialogButton.setAttribute("disabled", "true");
            });
            dialogOption.Callback();
          });
          warDetailsButton.classList.add(
            "panel-diplomacy-hub__button-open-war",
            "chooser-item_unlocked",
            "font-title",
            "uppercase",
            "tracking-150",
            "text-secondary-1",
            "text-xs",
            "self-center",
            "min-h-16",
            "w-72",
            "p-4",
            "mx-4",
            "flow-row"
          );
          postDeclareWarWrapper.appendChild(warDetailsButton);
          const radialBGWar = document.createElement("div");
          radialBGWar.classList.add(
            "panel-diplomacy-hub__radial-bg",
            "absolute",
            "self-center",
            "bg-cover",
            "size-16",
            "group-focus\\:opacity-0",
            "group-hover\\:opacity-0",
            "group-active\\:opacity-0",
            "opacity-1"
          );
          const radialBGWarHover = document.createElement("div");
          radialBGWarHover.classList.add(
            "panel-diplomacy-hub__radial-bg-hover",
            "absolute",
            "self-center",
            "opacity-0",
            "bg-cover",
            "size-16",
            "group-focus\\:opacity-100",
            "group-hover\\:opacity-100",
            "group-active\\:opacity-100"
          );
          const diplomacyOptions = MustGetElement(".panel-diplomacy-hub__button-open-war", this.Root);
          diplomacyOptions.appendChild(radialBGWar);
          diplomacyOptions.appendChild(radialBGWarHover);
          const openDiploIconWrapper = document.createElement("div");
          openDiploIconWrapper.classList.add("absolute", "size-16", "self-center");
          const diploIcon = document.createElement("img");
          diploIcon.classList.add(
            "flex",
            "self-center",
            "mt-2",
            "size-12",
            "panel-diplomacy-hub__diplo-icon"
          );
          const diploPath = UI.getIconURL("NOTIFICATION_DIPLOMATIC_ACTION");
          diploIcon.setAttribute("src", diploPath);
          openDiploIconWrapper.appendChild(diploIcon);
          diplomacyOptions.appendChild(openDiploIconWrapper);
          const openDiploDescription = document.createElement("div");
          openDiploDescription.classList.add("relative", "ml-18", "max-w-56", "self-center");
          openDiploDescription.innerHTML = Locale.compose(dialogOption.ChoiceString);
          diplomacyOptions.appendChild(openDiploDescription);
        }
      });
    } else {
      dialogTextElement.classList.remove("font-title");
      DiplomacyManager.currentDiplomacyDialogData.Choices.forEach((dialogOption, index) => {
        const dialogOptionButton = document.createElement("fxs-button");
        dialogOptionButton.classList.add("mb-2");
        dialogOptionButton.setAttribute("caption", dialogOption.ChoiceString);
        dialogOptionButton.setAttribute("tabindex", index.toString());
        dialogOptionButton.addEventListener("action-activate", () => {
          const otherButtons = dialogOptionsContainer.querySelectorAll("fxs-button");
          otherButtons.forEach((dialogButton) => {
            dialogButton.classList.add("disabled");
            dialogButton.setAttribute("disabled", "true");
          });
          dialogOption.Callback();
        });
        dialogOptionsContainer.appendChild(dialogOptionButton);
      });
    }
    setTimeout(() => {
      this.allowSkip();
    }, 0);
    FocusManager.get().setFocus(dialogTextElement);
    NavTray.clear();
    if (Configuration.getXR()) {
      this.skipDialog();
    }
  }
  // ------------------------------------------------------------------------
  onNextDiplomacyDialog() {
    this.Root.classList.remove("hidden");
    LeaderModelManager.exitLeaderScene();
    this.hasSkipped = false;
    this.isSkipAllowed = false;
    setTimeout(() => {
      this.allowSkip();
    }, 0);
    const dialogContainer = MustGetElement(".panel-diplomacy-project-reaction__project-dialog-container", document);
    const reactionContainer = MustGetElement(".panel-diplomacy-project-reaction__main-container", document);
    dialogContainer.classList.add("hidden");
    reactionContainer.classList.add("hidden");
    this.populateDialog();
  }
  // ------------------------------------------------------------------------
  onUpdateResponse() {
    this.populateDialog();
  }
  // ------------------------------------------------------------------------
  onInterfaceModeChanged() {
    if (InterfaceMode.getCurrent() == "INTERFACEMODE_DIPLOMACY_DIALOG") {
      this.hasSkipped = false;
      this.isSkipAllowed = false;
      setTimeout(() => {
        this.allowSkip();
      }, 0);
      this.populateDialog();
    }
  }
  handleInput(inputEvent) {
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "touch-tap") {
      if (this.isSkipAllowed && !this.hasSkipped) {
        this.skipDialog();
      }
      return false;
    }
    return true;
  }
  // ------------------------------------------------------------------------
  skipDialog() {
    window.removeEventListener("diplomacy-animation-finished", this.diplomacyAnimationFinishedListener);
    this.Root.classList.remove("initial-subtitles");
    this.populateNavTray();
    const skipDialogText = this.Root.querySelector(".skip-dialog-text");
    if (!skipDialogText) {
      console.error("panel-diplomacy-hub: Unable to find skip-dialog-text element!");
      return;
    }
    this.hasSkipped = true;
    skipDialogText.classList.remove("skippable");
    this.isSkipAllowed = false;
    const dialogOptionsContainer = this.Root.querySelector(".diplomacy-options");
    if (!dialogOptionsContainer) {
      console.error("panel-diplomacy-hub: Unable to find dialog-options element!");
      return;
    }
    FocusManager.get().setFocus(dialogOptionsContainer);
    if (DiplomacyManager.currentDiplomacyDialogData?.StatementTypeDef?.GroupType == "MEET") {
      const dialogContainer = MustGetElement(
        ".panel-diplomacy-project-reaction__project-dialog-container",
        document
      );
      const reactionContainer = MustGetElement(".panel-diplomacy-project-reaction__main-container", document);
      dialogContainer.classList.add("hidden");
      reactionContainer.classList.add("hidden");
      window.dispatchEvent(FirstMeetOpenReactions);
      this.Root.classList.add("hidden");
    }
  }
  // ------------------------------------------------------------------------
  onDiplomacyAnimationFinished(event) {
    if (event.detail?.isVO == true) {
      if (this.Root.classList.contains("initial-subtitles")) {
        this.Root.classList.remove("initial-subtitles");
        this.populateNavTray();
      }
    }
    const skipDialogText = this.Root.querySelector(".skip-dialog-text");
    if (!skipDialogText) {
      console.error("panel-diplomacy-hub: Unable to find skip-dialog-text element!");
      return;
    }
    this.hasSkipped = true;
    this.isSkipAllowed = false;
    skipDialogText.classList.remove("skippable");
    const dialogOptionsContainer = this.Root.querySelector(".diplomacy-options");
    if (!dialogOptionsContainer) {
      console.error("panel-diplomacy-hub: Unable to find dialog-options element!");
      return;
    }
    if (ContextManager.isEmpty) {
      FocusManager.get().setFocus(dialogOptionsContainer);
    }
    window.removeEventListener("diplomacy-animation-finished", this.diplomacyAnimationFinishedListener);
    if (DiplomacyManager.currentDiplomacyDialogData?.StatementTypeDef?.GroupType == "MEET") {
      window.dispatchEvent(FirstMeetOpenReactions);
      this.Root.classList.add("hidden");
    }
  }
  // ------------------------------------------------------------------------
  allowSkip() {
    this.isSkipAllowed = true;
    this.populateNavTray();
    this.updateSkipLabelText(ActionHandler.deviceType);
  }
  onDiplomacyEventResponse(eventData) {
    if (eventData.targetPlayer == GameContext.localPlayerID) {
      return;
    }
    const actionData = Game.Diplomacy.getDiplomaticEventData(eventData.actionID);
    if (actionData.initialPlayer != GameContext.localPlayerID && actionData.targetPlayer != GameContext.localPlayerID) {
      return;
    }
    this.isShowingActionResponse = true;
    this.Root.classList.remove("hidden");
    this.Root.classList.add("action-response");
    const dialogTextElement = MustGetElement(".dialog-text", this.Root);
    const cooldown = Game.Diplomacy.modifyByGameSpeed(10);
    switch (eventData.response) {
      case DiplomaticResponseTypes.DIPLOMACY_RESPONSE_REJECT:
        if (actionData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_SANCTION) {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_SANCTION_RESPONSE_REJECT",
            actionData.name
          );
        } else if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE) {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_ALLIANCE_RESPONSE_REJECT",
            actionData.name,
            cooldown
          );
        } else if (actionData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_TREATY) {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_TREATY_RESPONSE_REJECT",
            actionData.name,
            cooldown
          );
        } else {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_ACTION_RESPONSE_REJECT",
            actionData.name,
            cooldown
          );
        }
        LeaderModelManager.beginAcknowledgeNegativeOtherSequence();
        break;
      case DiplomaticResponseTypes.DIPLOMACY_RESPONSE_SUPPORT:
        dialogTextElement.innerHTML = Locale.stylize("LOC_DIPLOMACY_ACTION_RESPONSE_SUPPORT", actionData.name);
        LeaderModelManager.beginAcknowledgePositiveOtherSequence();
        break;
      default:
        if (actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_SEND_DELEGATION) {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_ACTION_RESPONSE_ACCEPT",
            actionData.name
          );
          LeaderModelManager.beginAcknowledgePositiveOtherSequence();
        } else if (actionData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_SANCTION) {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_SANCTION_RESPONSE_ACCEPT",
            actionData.name
          );
          LeaderModelManager.beginAcknowledgeNegativeOtherSequence();
        } else {
          dialogTextElement.innerHTML = Locale.stylize(
            "LOC_DIPLOMACY_ACTION_RESPONSE_ACCEPT",
            actionData.name
          );
          LeaderModelManager.beginAcknowledgeOtherSequence();
        }
    }
    setTimeout(() => {
      if (this.isShowingActionResponse) {
        this.Root.classList.add("fade-action-response");
        setTimeout(() => {
          if (this.isShowingActionResponse) {
            this.isShowingActionResponse = false;
            this.Root.classList.add("hidden");
            this.Root.classList.remove("action-response");
            this.Root.classList.remove("fade-action-response");
          }
        }, 1e3);
      }
    }, 3500);
  }
  updateSkipLabel = (event) => {
    if (!this.isSkipAllowed) {
      return;
    }
    this.updateSkipLabelText(event.detail.deviceType);
  };
  updateSkipLabelText(deviceType) {
    if (!this.isSkipAllowed) {
      return;
    }
    const skipDialogText = this.Root.querySelector(".skip-dialog-text");
    if (!skipDialogText) {
      console.error("panel-diplomacy-hub: Unable to find skip-dialog-text element!");
      return;
    }
    const deviceTypeTodialogText = {
      [InputDeviceType.Mouse]: "LOC_DIPLOMACY_SKIP_DIALOG_INSTRUCTIONS",
      [InputDeviceType.Keyboard]: "LOC_DIPLOMACY_SKIP_DIALOG_INSTRUCTIONS",
      [InputDeviceType.Hybrid]: "LOC_DIPLOMACY_SKIP_DIALOG_INSTRUCTIONS",
      [InputDeviceType.Touch]: "LOC_DIPLOMACY_SKIP_DIALOG_INSTRUCTIONS_TOUCH",
      [InputDeviceType.Controller]: "",
      [InputDeviceType.XR]: ""
    };
    const dialogText = deviceTypeTodialogText[deviceType];
    skipDialogText.innerHTML = Locale.compose(dialogText);
    skipDialogText.classList.toggle("skippable", !!dialogText);
  }
}
Controls.define("panel-diplomacy-hub", {
  createInstance: DiplomacyHubPanel,
  description: "Area for dialog and dialog options during diplomacy",
  classNames: [
    "diplomacy-container",
    "trigger-nav-help",
    "max-height-80",
    "h-auto",
    "flex",
    "flex-col",
    "min-w-84",
    "space-between"
  ],
  styles: [styles],
  innerHTML: [content],
  tabIndex: -1
});
//# sourceMappingURL=panel-diplomacy-hub.js.map
