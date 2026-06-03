import { FxsActivatable } from './fxs-activatable.js';

class FxsRewardButton extends FxsActivatable {
  mainText = document.createElement("div");
  actionText = document.createElement("div");
  navContainer = null;
  storyType = "";
  leaderCivChoice = "";
  rewardText = "";
  //tooltip text
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.storyType = this.Root.getAttribute("story-type") ?? "DEFAULT";
    this.leaderCivChoice = this.Root.getAttribute("leader-civ") ?? "NONE";
    this.rewardText = this.Root.getAttribute("reward") ?? "";
    this.Root.classList.add(
      "relative",
      "flex",
      "flex-row-reverse",
      "w-full",
      "items-center",
      this.storyType == "LIGHT" ? "mb-4" : "mb-8"
    );
    const iconsStored = this.Root.getAttribute("icons");
    let icons = [];
    if (iconsStored) {
      icons = JSON.parse(iconsStored);
    } else {
      icons = [];
    }
    this.render({ icons });
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "action-key": {
        if (this.navContainer) {
          this.addOrRemoveNavHelpElement(this.navContainer, newValue);
        }
        break;
      }
      case "main-text": {
        if (newValue) {
          this.mainText.setAttribute("data-l10n-id", newValue);
        } else {
          this.mainText.removeAttribute("data-l10n-id");
        }
        break;
      }
      case "action-text": {
        if (newValue) {
          this.actionText.setAttribute("data-l10n-id", newValue);
        } else {
          this.actionText.removeAttribute("data-l10n-id");
        }
        break;
      }
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  render({ icons }) {
    const frag = document.createDocumentFragment();
    const allTextContainer = document.createElement("div");
    allTextContainer.classList.add(
      "fxs-reward-button__text-container",
      "w-full",
      "flex",
      "flex-1",
      "flex-col",
      "text-center",
      "justify-center",
      "align-items",
      "min-h-16"
    );
    this.mainText.classList.add(
      "fxs-reward-button__main-text",
      "w-full",
      "justify-center",
      "font-body-sm",
      "pl-2",
      "pr-6",
      this.storyType == "LIGHT" ? "py-0.5" : "py-2"
    );
    allTextContainer.appendChild(this.mainText);
    if (this.Root.getAttribute("action-text") !== "") {
      const subtextContainer = document.createElement("div");
      subtextContainer.classList.add(
        "fxs-reward-button__action",
        "w-full",
        "pr-4",
        "pl-1",
        this.storyType == "LIGHT" ? "py-0.5" : "py-2"
      );
      this.actionText.classList.add("fxs-reward-button__action-text", "font-body-xs", "mt-1", "text-accent-3");
      subtextContainer.appendChild(this.actionText);
      allTextContainer.appendChild(subtextContainer);
    }
    if (this.leaderCivChoice == "LEADERCIV") {
      const civLeaderChoiceIndicator = document.createElement("div");
      civLeaderChoiceIndicator.classList.add(
        "fxs-reward__civ-leader-option",
        "absolute",
        "w-full",
        "h-full",
        "opacity-15",
        this.storyType == "LIGHT" ? "left-14" : "left-16"
      );
      allTextContainer.appendChild(civLeaderChoiceIndicator);
      this.rewardText = this.rewardText + Locale.stylize("LOC_UI_NARRATIVE_LEADER_CIV_CHOICE");
    }
    frag.appendChild(allTextContainer);
    this.Root.appendChild(frag);
    if (icons.length == 0) {
      this.Root.setAttribute("data-tooltip-content", this.rewardText);
      return;
    }
    this.navContainer = this.Root.querySelector(".fxs-button__nav");
    this.addOrRemoveNavHelpElement(this.navContainer, this.Root.getAttribute("action-key"));
    const rewardHolder = document.createElement("div");
    rewardHolder.classList.add("fxs-reward-button__reward-holder", "justify-center", "align-center");
    rewardHolder.classList.add("h-18", "w-18");
    let warningBarAdded = false;
    let iconCounter = 0;
    let iconsLength = icons.length;
    const rewardIconArrange = document.createElement("div");
    rewardIconArrange.classList.add(
      "reward-icons-arrange",
      "w-18",
      "h-full",
      "flex",
      "flex-row",
      "flex-wrap",
      "justify-center",
      "content-center"
    );
    if (icons && iconsLength > 0) {
      icons.forEach((icon) => {
        if (icon.RewardIconType == "QUEST") {
          const quest = document.createElement("div");
          quest.classList.value = "absolute w-8 h-full -left-9 flex flex-col justify-center";
          const questIcon = document.createElement("div");
          questIcon.classList.add("fxs-reward__quest-icon");
          quest.appendChild(questIcon);
          this.Root.appendChild(quest);
          this.rewardText = this.rewardText + Locale.stylize("LOC_UI_NARRATIVE_QUEST_INDICATOR");
          iconsLength = iconsLength - 1;
          if (iconsLength == 0) {
            rewardHolder.classList.add("hidden");
          }
          return;
        }
        iconCounter++;
        const rewardIconContainer = document.createElement("div");
        rewardIconContainer.classList.add("reward-icon-individual", "self-center");
        const rewardIcon = document.createElement("div");
        rewardIcon.classList.add("fxs-reward-button__icon", "w-full", "h-full", "pointer-events-none");
        let targetIconPrefix = "NAR_REW_";
        if (icon.Negative) {
          const warning = document.createElement("div");
          if (!warningBarAdded) {
            warning.classList.add(
              "reward-warning",
              "absolute",
              "w-full",
              "h-2",
              "-mb-px",
              "ml-18",
              "bottom-0"
            );
            this.Root.appendChild(warning);
            allTextContainer.classList.add("mb-2");
            warningBarAdded = true;
          }
          targetIconPrefix = targetIconPrefix + "NEG_";
        }
        const iconPath = UI.getIconCSS(targetIconPrefix + icon.RewardIconType, "DEFAULT");
        if (iconPath != "") {
          rewardIcon.style.backgroundImage = iconPath;
        } else {
          const iconCSS = UI.getIconCSS(icon.RewardIconType, "DEFAULT");
          rewardIcon.style.backgroundImage = iconCSS;
        }
        rewardIconContainer.appendChild(rewardIcon);
        if (iconsLength == 1) {
          rewardIconContainer.classList.add("w-12", "h-12");
        }
        if (iconsLength == 2) {
          rewardIconContainer.classList.add("w-9", "h-9");
          if (iconCounter == 2) {
            rewardIconContainer.classList.add("-ml-3");
          }
        }
        if (iconsLength > 2) {
          rewardIconContainer.classList.add("w-7", "h-7");
          if (iconCounter > 2) {
            rewardIconContainer.classList.add("-mt-2");
          }
          if (iconCounter == 2 || iconCounter == 4) {
            rewardIconContainer.classList.add("-ml-2");
          }
        }
        rewardIconArrange.appendChild(rewardIconContainer);
        rewardHolder.appendChild(rewardIconArrange);
      });
      rewardIconArrange.classList.add(iconsLength > 2 ? "p-3" : "p-1");
    }
    this.Root.setAttribute("data-tooltip-content", this.rewardText);
    this.Root.appendChild(rewardHolder);
  }
}
Controls.define("fxs-reward-button", {
  createInstance: FxsRewardButton,
  description: "A button to display narrative multiple reward icons and various indicators of story status",
  classNames: ["fxs-reward-button"],
  attributes: [
    {
      name: "main-text",
      description: "The main text / description on the button. StoryTextTypes.OPTION"
    },
    {
      name: "action-text",
      description: "Optional additional text that is more instructive than descriptive. StoryTextTypes.IMPERATIVE"
    },
    {
      name: "reward",
      description: "The text label of the button. StoryTextTypes.REWARD"
    },
    {
      name: "icon",
      description: "Reward button can display up to 4 icons + a quest icon"
    },
    {
      name: "leaderCiv",
      description: "Indicates if option is available because of Leader or Civilization choice"
    },
    {
      name: "action-key",
      description: "The action key for inline nav help, usually translated to a button icon."
    }
  ],
  images: [
    "fs://game/hud_sidepanel_list-bg.png",
    "fs://game/hud_list-focus_frame.png",
    "fs://game/nar_reg_negative.png",
    "fs://game/hud_civics-icon_frame",
    "fs://game/popup_silver_laurels",
    "fs://game/nar_quest_indicator.png"
  ],
  tabIndex: -1
});

export { FxsRewardButton };
//# sourceMappingURL=fxs-reward-button.js.map
