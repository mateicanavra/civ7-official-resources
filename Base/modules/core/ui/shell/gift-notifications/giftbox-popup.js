import FocusManager from '../../input/focus-manager.js';
import { I as InputEngineEvent } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { R as RewardsNotificationsManager } from '../../rewards-notifications/rewards-notification-manager.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-vslot class=\"giftbox-notification-frame-container shrink grow w-full\">\r\n\t<fxs-frame\r\n\t\tframe-style=\"simple\"\r\n\t\tclass=\"giftbox-notification fxs-frame flex flex-auto min-w-128\"\r\n\t>\r\n\t\t<fxs-vslot class=\"rules-container flex flex-auto\">\r\n\t\t\t<div class=\"flex relative flex-col items-center\">\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"font-title -mt-8 text-l text-secondary text-gradient-secondary uppercase\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_REWARD_RECEIVED\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"img-radial-glow self-center -mt-10 w-64 h-16\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"rewards-scrollable-container relative mt-4 flex flex-auto h-1\\/2 justify-center\">\r\n\t\t\t\t<fxs-vslot\r\n\t\t\t\t\tclass=\"main-menu-slot opacity-100\"\r\n\t\t\t\t\tid=\"GiftBoxSlot\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tclass=\"rewards-scrollable mb-4 pt-2\"\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</fxs-vslot>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"relative button-container justify-center mt-4\">\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"continue\"\r\n\t\t\t\t\tcaption=\"LOC_GENERIC_CONTINUE\"\r\n\t\t\t\t\taction-key=\"inline-accept\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</div>\r\n\t\t</fxs-vslot>\r\n\t</fxs-frame>\r\n\t<fxs-hslot class=\"decoration w-full justify-center absolute -top-9\">\r\n\t\t<div class=\"img-top-filigree-left grow\"></div>\r\n\t\t<div class=\"img-top-filigree-center\"></div>\r\n\t\t<div class=\"img-top-filigree-right grow\"></div>\r\n\t</fxs-hslot>\r\n</fxs-vslot>\r\n";

const styles = "fs://game/core/ui/shell/gift-notifications/giftbox-popup.css";

class GiftboxPopup extends Panel {
  continueButtonListener = () => {
    this.ClosePopup();
  };
  engineInputListener = this.onEngineInput.bind(this);
  rewardsScrollable;
  inputHandler = this.Root;
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "gift-box");
  }
  onAttach() {
    super.onAttach();
    this.inputHandler.addEventListener("engine-input", this.engineInputListener);
    const continueButton = this.Root.querySelector(".continue");
    if (continueButton) {
      continueButton.addEventListener("action-activate", this.continueButtonListener);
      continueButton.setAttribute("data-audio-group-ref", "collections");
      continueButton.setAttribute("data-audio-activate-ref", "data-audio-popup-cancel-activate");
      this.rewardsScrollable.whenComponentCreated((c) => c.setEngineInputProxy(continueButton));
    }
    this.displayRewards();
  }
  onInitialize() {
    this.rewardsScrollable = MustGetElement(".rewards-scrollable", this.Root);
    this.rewardsScrollable.setAttribute("tabindex", "-1");
  }
  onDetach() {
    const continueButtonListener = this.Root.querySelector(".continue");
    continueButtonListener?.removeEventListener("action-activate", this.continueButtonListener);
    this.inputHandler.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.rewardsScrollable);
    this.generalNavTrayUpdate();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  generalNavTrayUpdate() {
    NavTray.clear();
  }
  displayRewards() {
    const allRewards = Online.UserProfile.getRewardEntries();
    const newItems = Online.UserProfile.getNewlyUnlockedItems();
    if (newItems.length > 0) {
      this.rewardsScrollable?.setAttribute("handle-gamepad-pan", "true");
      const rewardsScrollableBox = document.createElement("div");
      rewardsScrollableBox.classList.add(
        "rewards-scrollable-inner-box",
        "relative",
        "min-h-1\\/2",
        "flow-column",
        "grow"
      );
      const rewardsScrollableBoxBG = document.createElement("div");
      rewardsScrollableBoxBG.classList.add(
        "giftbox-scrollable-bg",
        "absolute",
        "w-full",
        "h-full",
        "inset-0",
        "bg-cover",
        "bg-no-repeat",
        "pointer-events-none"
      );
      rewardsScrollableBox.appendChild(rewardsScrollableBoxBG);
      newItems.forEach((dnaItemID) => {
        const item = allRewards.find((r) => r.dnaItemID === dnaItemID);
        if (item && !item.disableNotification) {
          const rewardContainer = document.createElement("fxs-vslot");
          rewardContainer.classList.add("flex-auto", "items-center");
          const rewardDisplay = document.createElement("fxs-activatable");
          rewardDisplay.classList.add(
            "flex",
            "flex-auto",
            "reward-display",
            "items-center",
            "h-auto",
            "w-full",
            "px-3",
            "pt-3",
            "pb-3"
          );
          let iconURL = "fs://game/" + item.iconName;
          if (Online.UserProfile.getUnlockableRewardTypeIDString(item.type) == "UNLOCKABLEREWARD_TYPE_BANNER") {
            iconURL = "fs://game/prof_banner.png";
          }
          const rewardIcon = document.createElement("div");
          rewardIcon.classList.add(
            "reward-display__reward-icon",
            "h-18",
            "w-18",
            "inset-0",
            "bg-cover",
            "bg-no-repeat",
            "pointer-events-none"
          );
          rewardIcon.style.setProperty("background-image", `url(${iconURL})`);
          rewardDisplay.appendChild(rewardIcon);
          const rewardText = document.createElement("fxs-vslot");
          rewardText.classList.add(
            "reward-display__reward-text-container",
            "flex",
            "flex-auto",
            "w-full",
            "px-2",
            "justify-top"
          );
          const rewardName = document.createElement("div");
          rewardName.classList.add(
            "reward-display__reward-text-name",
            "text-base",
            "font-title",
            "text-accent-3",
            "tracking-100",
            "text-2xs",
            "uppercase",
            "text-left",
            "mb-2"
          );
          rewardName.innerHTML = Locale.stylize(item.name);
          rewardText.appendChild(rewardName);
          const rewardDescription = document.createElement("div");
          rewardDescription.classList.add(
            "reward-display__reward-text-description",
            "text-base",
            "font-body",
            "text-accent-3",
            "tracking-100",
            "text-2xs",
            "text-left",
            "mb-2"
          );
          rewardDescription.innerHTML = Locale.stylize(item.description);
          rewardText.appendChild(rewardDescription);
          const rewardFunctionalDescription = document.createElement("div");
          rewardFunctionalDescription.classList.add(
            "reward-display__reward-text-functional-description",
            "text-base",
            "font-body",
            "text-accent-3",
            "tracking-100",
            "text-2xs",
            "text-left",
            "mb-2"
          );
          rewardFunctionalDescription.innerHTML = Locale.stylize(item.functionalDescription);
          rewardText.appendChild(rewardFunctionalDescription);
          rewardDisplay.appendChild(rewardText);
          const RewardDivider = document.createElement("div");
          RewardDivider.classList.add("filigree-divider-inner-frame", "w-full", "mt-2", "mb-2");
          rewardContainer.appendChild(rewardDisplay);
          rewardContainer.appendChild(RewardDivider);
          rewardsScrollableBox?.appendChild(rewardContainer);
        }
      });
      this.rewardsScrollable?.appendChild(rewardsScrollableBox);
    }
  }
  onEngineInput(inputEvent) {
    if (this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan") {
      this.rewardsScrollable?.dispatchEvent(InputEngineEvent.CreateNewEvent(inputEvent));
      return false;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    if (inputEvent.detail.name == "accept" || inputEvent.isCancelInput()) {
      this.ClosePopup();
      return true;
    }
    return false;
  }
  ClosePopup() {
    Online.UserProfile.clearNewlyUnlockedItems();
    RewardsNotificationsManager.setNotificationVisibility(Online.UserProfile.getNewlyUnlockedItems().length > 0);
    this.close();
  }
}
Controls.define("screen-giftbox-popup", {
  createInstance: GiftboxPopup,
  description: "Handles giftbox notifications.",
  classNames: ["giftbox-popup"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=giftbox-popup.js.map
