import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InputEngineEventName } from '../../../core/ui/input/input-support.js';
import { Navigation } from '../../../core/ui/input/navigation-support.js';
import Panel from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { RaiseDiplomacyEvent } from '../diplomacy/diplomacy-events.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';
import PopupSequencer from '../popup-sequencer/popup-sequencer.js';
import styles from './screen-espionage-details.scss.js';

class EspionageDetailsScreen extends Panel {
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  screenId = "screen-espionage-details";
  render() {
    this.Root.innerHTML = `
			<div class="espionage-details-frame-container relative">
				<fxs-modal-frame class="w-full espionage-details-bg">
					<div class="flex flex-col w-full h-auto pl-60 items-start">
						<fxs-header class="mb-6 font-title text-2xl text-secondary" filigree-style="small" title="LOC_DIPLOMACY_ESPIONAGE_DETAILS_HEADER"></fxs-header>
						<div id="espionage-status-container" class="flex flex-col mb-3"></div>
						<fxs-inner-frame id="espionage-details-container" class="min-h-40 mr-6 w-full p-2"></fxs-inner-frame>
					</div>
					<fxs-hslot id="espionage-details-button-container" class="flex flex-row w-full h-auto justify-around mt-10"></fxs-vslot>
				</fxs-modal-frame>
				<img class="espionage-details-icon absolute -top-16" src="blp:dip_esp_image.png">
				<fxs-close-button class="right-2 top-1"></fxs-close-button>
			</div>
		`;
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    this.Root.classList.toggle("mt-10", isMobile);
    const frameContainer = MustGetElement(".espionage-details-frame-container", this.Root);
    frameContainer.classList.toggle("w-194", !isMobile);
    frameContainer.classList.toggle("w-200", isMobile);
    const detailsIcon = MustGetElement(".espionage-details-icon", this.Root);
    detailsIcon.classList.add(isMobile ? "-left-24" : "-left-32");
    const buttonContainer = MustGetElement("#espionage-details-button-container", this.Root);
    const acknowledgeButton = document.createElement("chooser-item");
    acknowledgeButton.classList.add("chooser-item_unlocked", "h-16", "flex", "flex-row", "w-76");
    acknowledgeButton.addEventListener("action-activate", () => {
      PopupSequencer.closePopup(this.screenId);
    });
    const acknowledgeIconContainer = document.createElement("div");
    acknowledgeIconContainer.classList.value = "chooser-item__icon flex self-center items-center justify-center pointer-events-none relative";
    acknowledgeButton.appendChild(acknowledgeIconContainer);
    const acknowledgeIconImage = document.createElement("div");
    acknowledgeIconImage.classList.value = "chooser-item__icon-image relative flex flex-col items-center justify-center espionage-details-acknowledge-icon";
    acknowledgeIconContainer.appendChild(acknowledgeIconImage);
    const acknowledgeString = document.createElement("div");
    acknowledgeString.classList.add(
      "font-title",
      "text-lg",
      "mb-1",
      "pointer-events-none",
      "font-fit-shrink",
      "self-center",
      "relative",
      "flex-1",
      "p-px"
    );
    acknowledgeString.innerHTML = Locale.compose("LOC_DIPLOMACY_ESPIONAGE_DETAILS_ACKNOWLEDGE");
    acknowledgeButton.appendChild(acknowledgeString);
    buttonContainer.appendChild(acknowledgeButton);
    const diplomacyButton = document.createElement("chooser-item");
    diplomacyButton.classList.add("chooser-item_unlocked", "h-16", "flex", "flex-row", "w-76");
    diplomacyButton.addEventListener("action-activate", () => {
      PopupSequencer.closePopup(this.screenId);
      const playerID = DiplomacyManager.currentEspionageData?.Header.targetPlayer ? DiplomacyManager.currentEspionageData?.Header.targetPlayer : GameContext.localPlayerID;
      window.dispatchEvent(new RaiseDiplomacyEvent(playerID));
    });
    const diplomacyIconContainer = document.createElement("div");
    diplomacyIconContainer.classList.value = "chooser-item__icon flex self-center items-center justify-center pointer-events-none relative";
    diplomacyButton.appendChild(diplomacyIconContainer);
    const diplomacyIconImage = document.createElement("div");
    diplomacyIconImage.classList.value = "chooser-item__icon-image relative flex flex-col items-center justify-center espionage-details-diplomacy-icon";
    diplomacyIconContainer.appendChild(diplomacyIconImage);
    const diplomacyString = document.createElement("div");
    diplomacyString.classList.add(
      "font-title",
      "text-lg",
      "mb-1",
      "pointer-events-none",
      "font-fit-shrink",
      "self-center",
      "relative",
      "flex-1",
      "p-px"
    );
    diplomacyString.innerHTML = Locale.compose("LOC_DIPLOMACY_OPEN_DIPLOMACY");
    diplomacyButton.appendChild(diplomacyString);
    buttonContainer.appendChild(diplomacyButton);
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.addEventListener("action-activate", () => {
      PopupSequencer.closePopup(this.screenId);
    });
  }
  onAttach() {
    super.onAttach();
    this.enableCloseSound = true;
    let audioGroup = "audio-base";
    if (DiplomacyManager.currentEspionageData) {
      if (DiplomacyManager.currentEspionageData.Header.failed) {
        audioGroup = "failed-espionage";
      } else {
        audioGroup = "successful-espionage";
      }
      this.Root.setAttribute("data-audio-group-ref", audioGroup);
    }
    Audio.playSound("data-audio-showing", audioGroup);
    this.render();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.populateEspionageDetails();
  }
  onDetach() {
    this.playAnimateOutSound();
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
  }
  onReceiveFocus() {
    const focusableElement = Navigation.getFirstFocusableElement(this.Root, {
      isDisableFocusAllowed: true,
      direction: InputNavigationAction.NONE
    });
    if (focusableElement) {
      FocusManager.get().setFocus(focusableElement);
    } else {
      FocusManager.get().setFocus(this.Root);
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      PopupSequencer.closePopup(this.screenId);
    }
  }
  populateEspionageDetails() {
    if (!DiplomacyManager.currentEspionageData) {
      console.error(
        "screen-espionage-details: Attempting to populate espionage details but no valid espionage data!"
      );
      return;
    }
    const statusContainer = MustGetElement("#espionage-status-container", this.Root);
    if (!DiplomacyManager.currentEspionageData.Header.failed) {
      statusContainer.appendChild(
        this.createEspionageStatusRow(
          "blp:dip_esp_reveal_icon.png",
          Locale.compose("LOC_DIPLOMACY_ESPIONAGE_DETAILS_SUCCESS")
        )
      );
    } else {
      statusContainer.appendChild(
        this.createEspionageStatusRow(
          "blp:dip_esp_noreveal_icon.png",
          Locale.compose("LOC_DIPLOMACY_ESPIONAGE_DETAILS_FAILED")
        )
      );
    }
    if (!DiplomacyManager.currentEspionageData.Header.revealed) {
      statusContainer.appendChild(
        this.createEspionageStatusRow(
          "blp:dip_esp_reveal_icon.png",
          Locale.compose("LOC_DIPLOMACY_ESPIONAGE_DETAILS_HIDDEN")
        )
      );
    } else {
      statusContainer.appendChild(
        this.createEspionageStatusRow(
          "blp:dip_esp_noreveal_icon.png",
          Locale.compose("LOC_DIPLOMACY_ESPIONAGE_DETAILS_REVEALED")
        )
      );
    }
    const detailsContainer = MustGetElement("#espionage-details-container", this.Root);
    const detailsElement = document.createElement("div");
    detailsElement.classList.value = "w-full font-body text-base font-fit-shrink";
    detailsElement.innerHTML = Locale.stylize(DiplomacyManager.currentEspionageData.DetailsString);
    detailsContainer.appendChild(detailsElement);
  }
  createEspionageStatusRow(imageSource, statusString) {
    const statusrow = document.createElement("div");
    statusrow.classList.value = "flex flex-row items-center";
    const statusIcon = document.createElement("img");
    statusIcon.classList.value = "mr-2";
    statusIcon.src = imageSource;
    statusrow.appendChild(statusIcon);
    const statusStringElement = document.createElement("div");
    statusStringElement.classList.value = "font-title text-lg uppercase font-fit-shrink grow";
    statusStringElement.innerHTML = statusString;
    statusrow.appendChild(statusStringElement);
    return statusrow;
  }
}
Controls.define("screen-espionage-details", {
  createInstance: EspionageDetailsScreen,
  description: "Espionage Details Screen.",
  styles: [styles],
  classNames: ["screen-espionage-details"],
  attributes: []
});
//# sourceMappingURL=screen-espionage-details.js.map
