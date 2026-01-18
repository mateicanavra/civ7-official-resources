import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { VictoryQuestState } from '../quest-tracker/quest-item.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import QuestTracker from '../quest-tracker/quest-tracker.js';
import { V as VictoryManager } from '../victory-manager/victory-manager.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const AdvisorLegacyPathClasses = /* @__PURE__ */ new Map();
AdvisorLegacyPathClasses.set(AdvisorTypes.SCIENCE, "LEGACY_PATH_CLASS_SCIENCE");
AdvisorLegacyPathClasses.set(AdvisorTypes.MILITARY, "LEGACY_PATH_CLASS_MILITARY");
AdvisorLegacyPathClasses.set(AdvisorTypes.CULTURE, "LEGACY_PATH_CLASS_CULTURE");
AdvisorLegacyPathClasses.set(AdvisorTypes.ECONOMIC, "LEGACY_PATH_CLASS_ECONOMIC");
const AgeStrings = /* @__PURE__ */ new Map();
AgeStrings.set("AGE_ANTIQUITY", "ANTIQUITY");
AgeStrings.set("AGE_EXPLORATION", "EXPLORATION");
AgeStrings.set("AGE_MODERN", "MODERN");
class AdvisorProgressModel {
  victoryData = /* @__PURE__ */ new Map();
  playerData = null;
  questData = [];
  mileStoneData = [];
  advisorType = "";
  onUpdate;
  //TODO: This should be moved to the database for maintainability. If we store all the data by advisor type we can pull out more of the switch cases.
  ageInfoList = [
    {
      age: "AGE_ANTIQUITY",
      pediaPageIds: { cultural: "AGES_24", economic: "AGES_27", military: "AGES_25", scientific: "AGES_26" }
    },
    {
      age: "AGE_EXPLORATION",
      pediaPageIds: { cultural: "AGES_28", economic: "AGES_29", military: "AGES_30", scientific: "AGES_31" }
    },
    {
      age: "AGE_MODERN",
      pediaPageIds: { cultural: "AGES_35", economic: "AGES_32", military: "AGES_33", scientific: "AGES_34" }
    }
  ];
  constructor() {
    VictoryManager.victoryManagerUpdateEvent.on(this.onVictoryManagerUpdate.bind(this));
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    this.victoryData = VictoryManager.processedVictoryData;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  onVictoryManagerUpdate() {
    this.updateGate.call("onVictoryManagerUpdate");
  }
  getActiveQuest(advisorType) {
    const quests = this.getQuestsByAdvisor(advisorType);
    for (const quest of quests) {
      const memoryState = QuestTracker.readQuestVictory(quest.id).state;
      if (memoryState != VictoryQuestState.QUEST_COMPLETED) {
        return quest;
      }
    }
    return void 0;
  }
  /**
   * @param {AdvisorType} type Category to filter Victory Quests.
   * @returns An ordered list of quests by advisor
   */
  getQuestsByAdvisor(type) {
    const items = Array.from(QuestTracker.getItems());
    const advisorItems = items.filter((item) => item.victory && item.victory.type == type);
    const orderedItems = advisorItems.sort((itemA, itemB) => {
      if (itemA.victory && itemB.victory) {
        return itemA.victory.order - itemB.victory.order;
      }
      return 0;
    });
    return orderedItems;
  }
  isQuestTracked(quest) {
    if (!quest) {
      return false;
    }
    const isQuestTracked = QuestTracker.isQuestVictoryInProgress(quest.id);
    if (isQuestTracked) {
      QuestTracker.updateQuestList(quest.id);
    }
    return isQuestTracked;
  }
  updateQuestTracking(quest, isTracked) {
    if (!quest) {
      return;
    }
    const tutorialData = {
      FtueEvent: "Tutorial Quest Tracking",
      TutorialDefinitionId: "",
      AdvisorType: "",
      AdvisorWarningType: "",
      QuestLine: quest.id,
      IsTracked: isTracked
    };
    Telemetry.sendTutorial(tutorialData);
    if (isTracked) {
      QuestTracker.setQuestVictoryState(quest, VictoryQuestState.QUEST_IN_PROGRESS);
    } else {
      QuestTracker.setQuestVictoryState(quest, VictoryQuestState.QUEST_UNSTARTED);
      if (quest.victory) {
        QuestTracker.setPathTracked(false, quest.victory.type);
      }
    }
    QuestTracker.writeQuestVictory(quest);
  }
  getLegacyPathClassTypeByAdvisorType(advisorType) {
    return AdvisorLegacyPathClasses.get(advisorType);
  }
  getAdvisorStringByAdvisorType(advisorType) {
    switch (advisorType) {
      case AdvisorTypes.SCIENCE:
        return "ADVISOR_SCIENCE";
      case AdvisorTypes.MILITARY:
        return "ADVISOR_MILITARY";
      case AdvisorTypes.CULTURE:
        return "ADVISOR_CULTURE";
      case AdvisorTypes.ECONOMIC:
        return "ADVISOR_ECONOMIC";
      default:
        return "";
    }
  }
  getAdvisorVictoryLoc(advisorType) {
    switch (advisorType) {
      case AdvisorTypes.SCIENCE:
        return "LOC_UI_CINEMATIC_FIRST_SPACE_FLIGHT";
      case AdvisorTypes.MILITARY:
        return "LOC_UI_CINEMATIC_OPERATION_IVY_TITLE";
      case AdvisorTypes.CULTURE:
        return "LOC_UI_CINEMATIC_WORLDS_FAIR";
      case AdvisorTypes.ECONOMIC:
        return "LOC_UI_CINEMATIC_WORLD_BANK";
      default:
        return "";
    }
  }
  getCivilopediaVictorySearchByAdvisor(advisorType) {
    const definition = GameInfo.Ages.lookup(Game.age);
    if (!definition) {
      console.error(`ERROR: No age definition found for ${Game.age} in model-advisor-victory.ts`);
    }
    const ageData = this.ageInfoList.find((ageInfo) => {
      return definition?.AgeType == ageInfo.age;
    });
    if (!ageData) {
      console.error(
        `ERROR - getCivilopediaVictorySearchByAdvisor(advisorType: AdvisorType) - No ageData found while looking up advisorType (${advisorType}) for civilopedia page id!`
      );
      return "";
    }
    switch (advisorType) {
      case AdvisorTypes.CULTURE:
        return ageData.pediaPageIds.cultural;
      case AdvisorTypes.ECONOMIC:
        return ageData.pediaPageIds.economic;
      case AdvisorTypes.MILITARY:
        return ageData.pediaPageIds.military;
      case AdvisorTypes.SCIENCE:
        return ageData.pediaPageIds.scientific;
      default:
        return "";
    }
  }
  getAdvisorPortrait(advisorType) {
    return UI.getIconURL(this.getAdvisorStringByAdvisorType(advisorType), "ADVISOR");
  }
  getAdvisorProgressBar(advisorType) {
    const iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_BAR";
    return UI.getIconURL(iconString, "ADVISOR");
  }
  getAdvisorVictoryIcon(advisorType) {
    let iconString = "";
    if (Game.AgeProgressManager.isFinalAge) {
      iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_VICTORY";
    } else {
      iconString = this.getAdvisorStringByAdvisorType(advisorType) + "_GOLDEN_AGE";
    }
    return UI.getIconURL(iconString, "ADVISOR");
  }
  getRewardGrantIcon(rewardType) {
    return UI.getIconURL(rewardType || "");
  }
  getPlayerProgress(advisor, currentAge) {
    const progressData = this.victoryData.get(currentAge);
    if (progressData) {
      const progress = progressData.find(
        (victory) => victory.ClassType == AdvisorProgress.getLegacyPathClassTypeByAdvisorType(advisor)
      );
      if (progress) {
        for (const [_index, player] of progress.playerData.entries()) {
          if (player.isLocalPlayer) {
            return player;
          }
        }
      }
    }
    return null;
  }
  getLegacyPathFromAdvisor(advisorType) {
    const classType = AdvisorProgress.getLegacyPathClassTypeByAdvisorType(advisorType);
    for (const legacyPath of GameInfo.LegacyPaths) {
      if (legacyPath.LegacyPathClassType == classType && legacyPath.EnabledByDefault) {
        return legacyPath;
      }
    }
    return null;
  }
  getAdvisorMileStones(advisorType) {
    const definition = GameInfo.Ages.lookup(Game.age);
    if (!definition) {
      console.warn("model-advisor-victory: getAdvisorMileStones(): No current definition for Age: " + Game.age);
    }
    const legacyPath = this.getLegacyPathFromAdvisor(advisorType);
    if (legacyPath) {
      const progressMileStones = GameInfo.AgeProgressionMilestones.filter(
        (milestone) => milestone.LegacyPathType == legacyPath.LegacyPathType
      );
      return progressMileStones;
    } else {
      return [];
    }
  }
  getAgeStringByType(ageType) {
    return AgeStrings.get(ageType);
  }
  getMaxScoreForAdvisorType(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      if (stone.FinalMilestone) {
        return stone.RequiredPathPoints;
      }
    }
    return 0;
  }
  getDarkAgeIcon(advisor, playerProgress, darkAgeIcon) {
    const availbleIconToUse = darkAgeIcon ? darkAgeIcon : "fs://game/leg_pro_darka_available.png";
    const milestones = this.getAdvisorMileStones(advisor);
    if (milestones[0] && milestones[0].RequiredPathPoints <= playerProgress) {
      return "fs://game/leg_pro_darka_locked.png";
    } else {
      return availbleIconToUse;
    }
  }
  getDarkAgeBarPercent(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    const maxScore = this.getMaxScoreForAdvisorType(advisor);
    if (milestones[0] && milestones[0].RequiredPathPoints) {
      const offSet = window.innerHeight > Layout.pixelsToScreenPixels(1e3) ? 0.04 : 0;
      return milestones[0].RequiredPathPoints / maxScore + offSet;
    } else {
      return 0;
    }
  }
  isRewardMileStone(advisor, pip) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      if (stone.RequiredPathPoints === pip) {
        return true;
      }
    }
    return false;
  }
  isMilestoneComplete(advisor) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      return Game.AgeProgressManager.isMilestoneComplete(stone.AgeProgressionMilestoneType);
    }
    return false;
  }
  /**
   * Determine the milestone progress amount given for an advisor
   * @param advisor Which advisor this is for
   * @param milestoneRewardNum The milestone reward number this represents
   * @returns The associate reward amount with the milestone or 0 if one can't be found.
   */
  getMilestoneProgressAmount(advisor, milestoneRewardNum) {
    const milestones = this.getAdvisorMileStones(advisor);
    for (const stone of milestones) {
      const index = stone.AgeProgressionMilestoneType.lastIndexOf("_");
      if (index == -1) {
        console.warn(
          `Unable to determine the # for a milestone reward.  AgeProgressionMilestone table entry is: ${stone.AgeProgressionMilestoneType}`
        );
        continue;
      }
      const num = stone.AgeProgressionMilestoneType.substring(index + 1);
      if (Number(num) == milestoneRewardNum) {
        return Game.AgeProgressManager.getMilestoneProgressionPoints(stone.AgeProgressionMilestoneType);
      }
    }
    return 0;
  }
  getDarkAgeReward(advisor) {
    const legacyPath = this.getLegacyPathFromAdvisor(advisor);
    if (legacyPath) {
      return GameInfo.AgeProgressionDarkAgeRewardInfos.find(
        (reward) => reward.LegacyPathType == legacyPath.LegacyPathType
      );
    }
    return void 0;
  }
}
const AdvisorProgress = new AdvisorProgressModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AdvisorProgress);
  };
  engine.createJSModel("g_AdvisorProgressModel", AdvisorProgress);
  AdvisorProgress.updateCallback = updateModel;
});

const styles = "fs://game/base-standard/ui/victory-progress/panel-advisor-victory.css";

const CIVILOPEDIA_VICTORY_PLACEHOLDER = "CIVILOPEDIA_VICTORY_PLACEHOLDER";
const MAX_NUMBER_OF_TICKS = 100;
const TICK_COMPRESSION_MODIFIER = 25;
class PanelAdvisorVictory extends Panel {
  trackVictoryActivateListener = this.onTrackVictoryActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  civilopediaListener = this.onCivilopediaButtonInput.bind(this);
  onRadioButtonListener = this.onRadioButtonInput.bind(this);
  carousel = null;
  carouselIndex = 0;
  selectedAgeType = "";
  selectedAdvisor = null;
  playerData = null;
  activeQuest = void 0;
  victoryQuests = [];
  radioButtons = [];
  isTopFocused = true;
  selectedRewardIndex = 0;
  rewardElemends = [];
  showVictoryDetailsLink = false;
  isTracked = false;
  onAttach() {
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (!currentAge) {
      console.error(`panel-advisor-victory: Failed to get current age for hash ${Game.age}`);
      return;
    }
    this.selectedAgeType = currentAge.AgeType;
    this.showVictoryDetailsLink = this.selectedAgeType === "AGE_MODERN" ? true : false;
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.render();
    super.onAttach();
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    super.onDetach();
  }
  render() {
    while (this.Root.lastChild) {
      this.Root.removeChild(this.Root.lastChild);
    }
    const advisor = this.Root.getAttribute("advisor-type");
    if (!advisor) {
      console.error("panel-advisor-victory: Failed to get advisor type");
      return;
    }
    const advisorType = +advisor;
    this.selectedAdvisor = advisorType;
    const victoryData = AdvisorProgress.victoryData.get(this.selectedAgeType);
    this.activeQuest = AdvisorProgress.getActiveQuest(this.selectedAdvisor);
    if (!victoryData) {
      console.error("panel-advisor-victory: Failed to get the victory data for the desired age");
      return;
    }
    this.playerData = AdvisorProgress.getPlayerProgress(this.selectedAdvisor, this.selectedAgeType);
    if (!this.playerData) {
      console.error("panel-advisor-victory: No local player was found");
      return;
    }
    if (this.activeQuest) {
      this.isTracked = AdvisorProgress.isQuestTracked(this.activeQuest);
    }
    this.victoryQuests = AdvisorProgress.getQuestsByAdvisor(this.selectedAdvisor);
    const chosenVictory = victoryData.find(
      (victory) => victory.ClassType == AdvisorProgress.getLegacyPathClassTypeByAdvisorType(advisorType)
    );
    if (!chosenVictory) {
      console.error("panel-advisor-victory: render - Failed to get victoryData");
      return;
    }
    const advisorPanel = document.createElement("div");
    advisorPanel.classList.add("advisor-panal_wrapper", "w-full", "flow-column", "justify-center", "flex-auto");
    advisorPanel.appendChild(this.renderTopPanel(chosenVictory, advisorType));
    advisorPanel.appendChild(this.renderBottomPanel(advisorType));
    this.Root.appendChild(advisorPanel);
  }
  createVictoryCivilopediaLink() {
    const victoryLinkWrapper = document.createElement("div");
    victoryLinkWrapper.classList.add("advisor-panel_civilopedia-link");
    const victoryTitleContainer = document.createElement("div");
    const victoryTextContainer = document.createElement("fxs-activatable");
    victoryTitleContainer.classList.value = "font-title text-base justify-center uppercase relative items-center flex-col flex-nowrap text-center text-gradient-secondary font-bold tracking-150";
    const victoryTitle = document.createElement("div");
    victoryTitle.setAttribute("data-l10n-id", "LOC_VICTORY_VICTORY");
    const filigree = document.createElement("img");
    filigree.src = "blp:shell_small-filigree";
    filigree.classList.add("h-4", "w-84", "mt-1");
    victoryTitleContainer.appendChild(victoryTitle);
    victoryTitleContainer.appendChild(filigree);
    victoryTextContainer.classList.value = "text-xs font-body pointer-events-auto";
    const victoryText = this.createCivilopediaText();
    victoryTextContainer.appendChild(victoryText);
    victoryTextContainer.addEventListener("action-activate", this.civilopediaListener);
    victoryLinkWrapper.appendChild(victoryTitleContainer);
    victoryLinkWrapper.appendChild(victoryTextContainer);
    return victoryLinkWrapper;
  }
  createCivilopediaText() {
    const victoryText = document.createElement("div");
    victoryText.classList.add("flex");
    const victoryTypeTitle = Locale.compose(AdvisorProgress.getAdvisorVictoryLoc(this.selectedAdvisor || ""));
    const victoryCivilopediaLinkText = `<span class="font-body text-secondary">${victoryTypeTitle}</span>`;
    const text = Locale.stylize(
      "LOC_LEGACY_PATH_VICTORY_CONDITION",
      CIVILOPEDIA_VICTORY_PLACEHOLDER,
      "ADVISOR_CIVILOPEDIA"
    );
    const updatedText = text.replace(CIVILOPEDIA_VICTORY_PLACEHOLDER, victoryCivilopediaLinkText);
    victoryText.innerHTML = updatedText;
    return victoryText;
  }
  createQuestCarousel() {
    const carouselWrapper = document.createElement("fxs-inner-frame");
    carouselWrapper.classList.add(
      "advisor-victory-carousel",
      "flow-column",
      "items-center",
      "justify-start",
      "mb-16",
      "relative"
    );
    if (this.victoryQuests.length <= 0) {
      return carouselWrapper;
    }
    const middleDecor = document.createElement("div");
    middleDecor.classList.add("absolute", "-top-2", "h-4", "w-16", "bg-center", "bg-no-repeat", "bg-contain");
    middleDecor.style.backgroundImage = `url("blp:popup_middle_decor")`;
    const topBorder = document.createElement("div");
    topBorder.classList.add("advisor-carousel__border-bar", "absolute", "top-0", "h-6", "w-full");
    const bottomBorder = document.createElement("div");
    bottomBorder.classList.add(
      "advisor-carousel__border-bar",
      "bottom",
      "-scale-y-100",
      "absolute",
      "bottom-0",
      "h-6",
      "w-full"
    );
    const carouselTitle = document.createElement("p");
    carouselTitle.classList.add(
      "advisor-panel_next-step",
      "w-full",
      "font-title",
      "text-xl",
      "uppercase",
      "text-center",
      "mt-5",
      "mb-2",
      "fxs-header",
      "tracking-150"
    );
    carouselTitle.setAttribute("data-l10n-id", "LOC_VICTORY_PROGRESS_NEXT_STEP");
    const carouselContentContainer = document.createElement("fxs-scrollable");
    carouselContentContainer.classList.add(
      "advisor-carousel__content-container",
      "flow-row",
      "items-start",
      "justify-center",
      "w-full",
      "h-3\\/4",
      "pl-16",
      "pr-12",
      "mr-10"
    );
    carouselContentContainer.setAttribute("handle-gamepad-pan", "true");
    carouselContentContainer.setAttribute("tabindex", "-1");
    carouselContentContainer.whenComponentCreated((scrollable) => scrollable.setEngineInputProxy(this.Root));
    const carouselTextContainer = document.createElement("div");
    carouselTextContainer.classList.add("flow-column", "items-start", "justify-center", "w-full");
    const advisorTextWrapper = document.createElement("div");
    advisorTextWrapper.classList.add(
      "advisor-carousel__advisor-text-bg",
      "font-body",
      "text-sm",
      "text-center",
      "text-accent-2",
      "flex-auto",
      "min-w-128",
      "relative",
      "mt-5",
      "mb-10",
      "w-full"
    );
    const advisorText = document.createElement("div");
    advisorText.classList.add("advisor-text", "px-6", "py-8", "flow-column", "justify-center", "items-center");
    const advisorTextTopBorder = document.createElement("div");
    advisorTextTopBorder.classList.add("advisor-carousel__border-bar", "absolute", "top-0", "h-6", "w-full");
    const advisorTextBottomBorder = document.createElement("div");
    advisorTextBottomBorder.classList.add(
      "advisor-carousel__border-bar",
      "bottom",
      "-scale-y-100",
      "absolute",
      "bottom-0",
      "h-6",
      "w-full"
    );
    advisorTextWrapper.appendChild(advisorTextTopBorder);
    advisorTextWrapper.appendChild(advisorTextBottomBorder);
    advisorTextWrapper.appendChild(advisorText);
    const bodyText = document.createElement("div");
    bodyText.classList.add(
      "body-text",
      "font-body",
      "text-sm",
      "text-left",
      "px-4",
      "py-1",
      "flex-auto",
      "min-w-128"
    );
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("flow-column", "p-3", "font-body", "text-sm", "flex-auto", "w-full");
    const carouselText = document.createElement("div");
    carouselText.classList.add("carousel-text");
    const currentQuest = this.getCurrentQuest();
    if (currentQuest) {
      const questDescription = currentQuest.getDescriptionLocParams ? Locale.stylize(currentQuest.description, ...currentQuest.getDescriptionLocParams()) : currentQuest.description;
      carouselText.setAttribute("data-l10n-id", questDescription);
      progressContainer.appendChild(carouselText);
      if (currentQuest.victory) {
        const progressDescription = this.getStateString(currentQuest.victory.state);
        if (progressDescription != "") {
          const progressText = document.createElement("p");
          progressText.classList.add(
            "progress-text",
            "font-body",
            "text-sm",
            "text-left",
            "pr-5",
            "py-5",
            "flex-auto",
            "min-w-128",
            "flex",
            "justify-end",
            "self-end"
          );
          progressText.setAttribute("data-l10n-id", progressDescription);
          progressContainer.appendChild(progressText);
        }
        if (currentQuest.victory.content) {
          const { advisor, body } = currentQuest.victory.content;
          if (advisor) {
            const advisorContent = advisor.getLocParams != void 0 ? Locale.stylize(advisor.text, ...advisor.getLocParams(currentQuest)) : advisor.text;
            advisorText.setAttribute("data-l10n-id", advisorContent);
          }
          if (body) {
            const bodyContent = body.getLocParams != void 0 ? Locale.stylize(body.text, ...body.getLocParams(currentQuest)) : body.text;
            bodyText.setAttribute("data-l10n-id", bodyContent);
          }
        }
      }
    }
    carouselTextContainer.appendChild(advisorTextWrapper);
    carouselTextContainer.appendChild(bodyText);
    carouselTextContainer.appendChild(progressContainer);
    carouselContentContainer.appendChild(carouselTextContainer);
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    const radioWrapper = document.createElement("div");
    radioWrapper.classList.add("flow-row", "mt-6", "absolute");
    radioWrapper.classList.toggle("-bottom-8", !isMobile);
    radioWrapper.classList.toggle("-bottom-10", isMobile);
    for (let i = 0; i < this.victoryQuests.length; i++) {
      const radioButton = document.createElement("fxs-radio-button");
      radioButton.setAttribute("value", i.toString());
      radioButton.addEventListener("action-activate", this.onRadioButtonListener);
      radioButton.setAttribute("tabindex", "-1");
      this.radioButtons.push(radioButton);
      if (i == this.carouselIndex) {
        radioButton.setAttribute("selected", "true");
      }
      radioWrapper.appendChild(radioButton);
    }
    carouselWrapper.appendChild(middleDecor);
    carouselWrapper.appendChild(topBorder);
    carouselWrapper.appendChild(bottomBorder);
    carouselWrapper.appendChild(carouselTitle);
    carouselWrapper.appendChild(carouselContentContainer);
    carouselWrapper.appendChild(radioWrapper);
    return carouselWrapper;
  }
  getStateString(state) {
    switch (state) {
      case VictoryQuestState.QUEST_IN_PROGRESS:
        return "LOC_VICTORY_PROGRESS_STATE_IN_PROGRESS";
      case VictoryQuestState.QUEST_COMPLETED:
        return "LOC_VICTORY_PROGRESS_STATE_COMPLETED";
      default:
        return "";
    }
  }
  onCarouselLeft() {
    this.carouselAction(true);
  }
  onCarouselRight() {
    this.carouselAction();
  }
  updateRadioButton(prevIndex, currentIndex) {
    if (!this.radioButtons[prevIndex] || !this.radioButtons[currentIndex]) {
      return;
    }
    this.radioButtons[prevIndex].setAttribute("selected", "false");
    this.radioButtons[currentIndex].setAttribute("selected", "true");
    FocusManager.setFocus(this.radioButtons[currentIndex]);
  }
  /**
   * Very basic carousel movement.
   * May want to check out the fxs-carousel component and adapt it for this (not used anywhere else)
   * @param moveBack Used for back index movement, default is forward
   */
  carouselAction(moveBack) {
    const prevIndex = this.carouselIndex;
    if (moveBack) {
      this.carouselIndex--;
    } else {
      this.carouselIndex++;
    }
    if (this.carouselIndex < 0) {
      this.carouselIndex = 0;
    }
    if (this.carouselIndex > this.victoryQuests.length - 1) {
      this.carouselIndex = this.victoryQuests.length - 1;
    }
    this.updateRadioButton(prevIndex, this.carouselIndex);
    this.updateVictoryQuests();
  }
  updateVictoryQuests() {
    if (!this.carousel) {
      console.error("panel-advisor-victory: updateVictoryQuests(): No carousel component available");
      return;
    }
    const advisorText = MustGetElement(".advisor-text", this.carousel);
    const bodyText = MustGetElement(".body-text", this.carousel);
    const carouselText = MustGetElement(".carousel-text", this.carousel);
    const currentQuest = this.victoryQuests[this.carouselIndex];
    if (!currentQuest) {
      console.error("panel-advisor-victory: updateVictoryQuests(): No quest found in victoryQuests");
      return;
    }
    const progressText = this.carousel.querySelector(".progress-text");
    const questDescription = currentQuest.getDescriptionLocParams ? Locale.stylize(currentQuest.description, ...currentQuest.getDescriptionLocParams()) : currentQuest.description;
    carouselText.setAttribute("data-l10n-id", questDescription);
    if (currentQuest.victory) {
      const progressDescription = this.getStateString(currentQuest.victory.state);
      progressText?.setAttribute("data-l10n-id", progressDescription);
      if (currentQuest.victory.content) {
        const { advisor, body } = currentQuest.victory.content;
        if (advisor) {
          const advisorContent = advisor.getLocParams != void 0 ? Locale.stylize(advisor.text, ...advisor.getLocParams(currentQuest)) : advisor.text;
          advisorText.setAttribute("data-l10n-id", advisorContent);
        }
        if (body) {
          const bodyContent = body.getLocParams != void 0 ? Locale.stylize(body.text, ...body.getLocParams(currentQuest)) : body.text;
          bodyText.setAttribute("data-l10n-id", bodyContent);
        }
      }
    }
  }
  getCurrentQuest() {
    if (this.activeQuest) {
      const activeQuestId = this.activeQuest.id;
      const activeIndex = this.victoryQuests.findIndex((item) => item.id == activeQuestId);
      this.carouselIndex = activeIndex;
      return this.activeQuest;
    } else {
      return this.victoryQuests[this.carouselIndex];
    }
  }
  onAttributeChanged(_name, _oldValue, newValue) {
    if (!newValue) {
      return;
    }
    this.selectedAdvisor = +newValue;
  }
  renderTopPanel(chosenVictory, chosenAdvisor) {
    const topPanel = document.createElement("div");
    topPanel.classList.add(
      "advisor-panel_top",
      "mt-9",
      "flow-row",
      "flex-auto",
      "w-full",
      "h-1\\/2",
      "pointer-events-none"
    );
    const titleContainer = document.createElement("div");
    titleContainer.classList.add(
      "advisor-panel__title",
      "flow-column",
      "w-128",
      "items-center",
      "-ml-13",
      "mr-6",
      "justify-center"
    );
    const iconsWrapper = document.createElement("div");
    iconsWrapper.classList.add("advisor-panel__victory-icon-wrapper", "flow-row", "w-128");
    const advisorPortraitWrapper = document.createElement("div");
    advisorPortraitWrapper.classList.add("advisor-pane__portrait-wrapper", "relative", "flex");
    const advisorBorder = document.createElement("div");
    advisorBorder.classList.add("advisor-panel__icon-border", "absolute", "inset-0", "bg-cover", "bg-no-repeat");
    advisorPortraitWrapper.appendChild(advisorBorder);
    const advisorIcon = document.createElement("div");
    advisorIcon.classList.add("advisor-panel__portrait", "absolute", "inset-0", "bg-cover", "bg-no-repeat");
    advisorIcon.style.backgroundImage = UI.getIconCSS(
      AdvisorProgress.getAdvisorStringByAdvisorType(chosenAdvisor),
      "CIRCLE_MASK"
    );
    advisorPortraitWrapper.appendChild(advisorIcon);
    const advisorTypeIconBg = document.createElement("div");
    advisorTypeIconBg.classList.add(
      "advisor-panel__type-icon-bg",
      "absolute",
      "inset-0",
      "bg-cover",
      "bg-no-repeat"
    );
    advisorPortraitWrapper.appendChild(advisorTypeIconBg);
    const advisorTypeIcon = document.createElement("div");
    advisorTypeIcon.classList.add("advisor-panel__type-icon", "absolute", "inset-0", "bg-cover", "bg-no-repeat");
    advisorTypeIcon.style.backgroundImage = UI.getIconCSS(
      AdvisorProgress.getAdvisorStringByAdvisorType(chosenAdvisor),
      "BADGE"
    );
    advisorPortraitWrapper.appendChild(advisorTypeIcon);
    const victoryIcon = document.createElement("div");
    victoryIcon.classList.add(
      "advisor-panel__advisor-icon",
      "relative",
      "size-84",
      "bg-center",
      "bg-cover",
      "bg-no-repeat",
      "-mb-25",
      "-mt-26",
      "-mr-22"
    );
    victoryIcon.style.backgroundImage = `url('${chosenVictory.Icon}')`;
    iconsWrapper.appendChild(victoryIcon);
    iconsWrapper.appendChild(advisorPortraitWrapper);
    const victoryTextContainer = document.createElement("div");
    victoryTextContainer.classList.add("advisor-panel_victory-text", "mt-6", "text-center");
    const victoryName = document.createElement("p");
    victoryName.classList.add(
      "advisor-panel_victory-title",
      "font-title",
      "text-lg",
      "mb-2",
      "uppercase",
      "flow-row",
      "font-bold",
      "tracking-150",
      "justify-center",
      "text-center",
      "fxs-header"
    );
    victoryName.classList.toggle("text-xl", window.innerHeight > Layout.pixelsToScreenPixels(1e3));
    victoryName.setAttribute("data-l10n-id", chosenVictory.Name);
    const civilopedieaLinkWrapper = document.createElement("div");
    civilopedieaLinkWrapper.classList.add("w-96", "text-center");
    const victoryDescription = document.createElement("p");
    victoryDescription.classList.add(
      "advisor-panel_victory-description",
      "self-center",
      "font-body",
      "text-sm",
      "mb-2",
      "font-normal",
      "text-center",
      "font-fit-shrink",
      "max-h-25"
    );
    victoryDescription.classList.toggle("text-base", window.innerHeight > Layout.pixelsToScreenPixels(1e3));
    victoryDescription.setAttribute("data-l10n-id", chosenVictory.Description);
    victoryTextContainer.appendChild(victoryName);
    victoryTextContainer.appendChild(victoryDescription);
    victoryTextContainer.appendChild(civilopedieaLinkWrapper);
    const trackQuestWrapper = this.renderTrackVictoryCheckBox();
    titleContainer.appendChild(iconsWrapper);
    titleContainer.appendChild(victoryTextContainer);
    titleContainer.appendChild(trackQuestWrapper);
    if (this.showVictoryDetailsLink) {
      titleContainer.appendChild(this.createVictoryCivilopediaLink());
      const activatableContainer = document.createElement("fxs-activatable");
      activatableContainer.classList.value = "text-xs font-body pointer-events-auto";
      activatableContainer.addEventListener("action-activate", this.civilopediaListener);
      activatableContainer.classList.add("advisor-panel__civilopedia");
      civilopedieaLinkWrapper.appendChild(activatableContainer);
      const civilopediaLink = this.createCivilopediaText();
      civilopediaLink.classList.add("text-sm", "text-center", "flex");
      activatableContainer.appendChild(civilopediaLink);
    }
    this.carousel = this.createQuestCarousel();
    topPanel.appendChild(titleContainer);
    topPanel.appendChild(this.carousel);
    return topPanel;
  }
  renderRewardPip(milestone, advisor, milestoneRewards, ageProgressRewardAmt) {
    const rewardWrapper = document.createElement("div");
    rewardWrapper.classList.add("advisor-panel__reward-wrapper", "relative", "flow-row", "pointer-events-auto");
    if (milestone.FinalMilestone) {
      rewardWrapper.classList.add("advisor-panel__last-reward");
    }
    rewardWrapper.role = "tooltip";
    const rewardIconHolder = document.createElement("img");
    rewardIconHolder.src = "blp:leg_pro_milestone_icon_holder";
    rewardIconHolder.classList.add("advisor-panel__reward-holder", "relative");
    let tooltipString = "";
    const rewardIcon = document.createElement("div");
    rewardIcon.classList.add("bg-contain", "bg-no-repeat");
    if (milestone.FinalMilestone) {
      rewardIcon.style.backgroundImage = `url("${AdvisorProgress.getAdvisorVictoryIcon(advisor)}")`;
      if (Game.AgeProgressManager.isFinalAge) {
        rewardIcon.classList.add("advisor-panel__victory-icon", "absolute", "self-center", "bottom-1");
      } else {
        rewardIcon.classList.add("advisor-panel__golden-age-icon", "absolute", "self-center");
      }
    } else {
      rewardIcon.style.backgroundImage = `url("${UI.getIconURL(milestoneRewards[0].Icon || "")}")`;
      rewardIcon.classList.add("advisor-panel__reward-icon", "absolute", "size-18", "top-0\\.5", "left-0\\.5");
    }
    rewardIconHolder.appendChild(rewardIcon);
    rewardWrapper.appendChild(rewardIconHolder);
    const iconRewards = this.getIconRewards(milestoneRewards.slice(1));
    if (iconRewards.size > 0) {
      const minorRewardWrapper = document.createElement("div");
      minorRewardWrapper.classList.add(
        "advisor-panel__additional-rewards",
        "flow-column",
        "absolute",
        "left-full",
        "pl-4"
      );
      for (const [key, value] of iconRewards.entries()) {
        const minorReward = document.createElement("div");
        minorReward.classList.add("flow-row", "font-body-sm");
        minorReward.innerHTML = Locale.stylize("LOC_VICTORY_ADDITIONAL_REWARDS", value, key);
        minorRewardWrapper.appendChild(minorReward);
      }
      rewardWrapper.appendChild(minorRewardWrapper);
    }
    for (const milestoneReward of milestoneRewards) {
      const tipName = Locale.compose(milestoneReward.Name || "");
      let tipDescription = Locale.compose(milestoneReward.Description || "");
      if (Game.AgeProgressManager.isFinalAge && milestoneReward.DescriptionFinalAge) {
        tipDescription = Locale.compose(milestoneReward.DescriptionFinalAge || "");
      }
      tooltipString = tooltipString + `[B]${tipName}[/B][N]${tipDescription}[N]`;
    }
    tooltipString = tooltipString + Locale.stylize("LOC_VICTORY_AGE_PROGRESS_TOOLTIP", ageProgressRewardAmt);
    this.setupRewardTooltipPosition(rewardWrapper, ActionHandler.isGamepadActive);
    rewardWrapper.setAttribute("data-tooltip-content", tooltipString);
    return rewardWrapper;
  }
  renderBottomPanel(chosenAdvisor) {
    const bottomPanel = document.createElement("div");
    bottomPanel.classList.add(
      "advisor-panel_bottom",
      "flow-row",
      "items-center",
      "flex-auto",
      "justify-start",
      "pt-22"
    );
    const progressBarWrapper = document.createElement("div");
    progressBarWrapper.classList.add("advisor-panel__progress-bar-wrapper", "flow-column", "flex-auto", "mr-24");
    const upperTickContainer = document.createElement("div");
    upperTickContainer.classList.add("relative", "w-full");
    progressBarWrapper.appendChild(upperTickContainer);
    const progressBar = document.createElement("div");
    progressBar.classList.add(
      "advisor-panel__progress-bar",
      "h-8",
      "bg-cover",
      "bg-center",
      "bg-no-repeat",
      "relative"
    );
    if (!this.playerData) {
      return bottomPanel;
    }
    progressBarWrapper.appendChild(progressBar);
    const lowerTickContainer = document.createElement("div");
    lowerTickContainer.classList.add("relative", "w-full");
    progressBarWrapper.appendChild(lowerTickContainer);
    const legendReward = document.createElement("p");
    legendReward.classList.add(
      "advisor-panel__progress-rewards",
      "text-accent-4",
      "tracking-150",
      "font-title",
      "text-sm",
      "uppercase",
      "mr-2"
    );
    legendReward.setAttribute("data-l10n-id", "LOC_VICTORY_PROGRESS_REWARD");
    progressBar.appendChild(legendReward);
    const darkAgeReward = AdvisorProgress.getDarkAgeReward(chosenAdvisor);
    if (!Game.AgeProgressManager.isFinalAge && darkAgeReward) {
      const darkAgeIcon = document.createElement("img");
      const darkAgeIconUrl = UI.getIconURL(darkAgeReward.Icon || "");
      darkAgeIcon.src = AdvisorProgress.getDarkAgeIcon(
        chosenAdvisor,
        this.playerData.currentScore,
        darkAgeIconUrl
      );
      darkAgeIcon.classList.add("advisor-panel__darkage-icon", "absolute", "-left-20", "size-18");
      progressBar.appendChild(darkAgeIcon);
      const darkAgeBar = document.createElement("img");
      darkAgeBar.src = "blp:leg_pro_darka_line";
      darkAgeBar.classList.add(
        "advisor-panel__darkage-bar",
        "absolute",
        "h-14",
        "-top-14",
        "origin-left",
        "w-full"
      );
      darkAgeBar.style.transform = `scaleX(${AdvisorProgress.getDarkAgeBarPercent(chosenAdvisor)})`;
      const darkAgeToolTipCondition = Locale.compose("LOC_AGE_REWARD_DARK_AGE_EARNED");
      const darkAgeToolTipName = Locale.compose(darkAgeReward.Name || "");
      const darkAgeToolTipDescription = Locale.compose(darkAgeReward.Description || "");
      const darkAgeToolTip = `${darkAgeToolTipCondition}[N][B]${darkAgeToolTipName}[/B][N]${darkAgeToolTipDescription}[N]`;
      this.setupRewardTooltipPosition(darkAgeIcon, ActionHandler.isGamepadActive);
      darkAgeIcon.setAttribute("data-tooltip-content", darkAgeToolTip);
      darkAgeIcon.setAttribute("tabindex", "-1");
      this.rewardElemends.push(darkAgeIcon);
      progressBar.appendChild(darkAgeBar);
    }
    const maxScore = this.playerData.maxScore;
    const numTicks = maxScore > MAX_NUMBER_OF_TICKS ? maxScore / TICK_COMPRESSION_MODIFIER : maxScore;
    const milestones = AdvisorProgress.getAdvisorMileStones(chosenAdvisor);
    for (const [index, milestone] of milestones.entries()) {
      const leftStylePercent = milestone.RequiredPathPoints / maxScore * 100;
      const milestoneRewards = GameInfo.AgeProgressionMilestoneRewards.filter(
        (reward) => reward.AgeProgressionMilestoneType === milestone.AgeProgressionMilestoneType
      );
      const rewards = [];
      for (const reward of milestoneRewards) {
        const ageReward = GameInfo.AgeProgressionRewards.lookup(reward.AgeProgressionRewardType);
        if (ageReward) {
          rewards.push(ageReward);
        }
      }
      const isScoreMet = Game.AgeProgressManager.isMilestoneComplete(
        milestone.AgeProgressionMilestoneType
      );
      const checkedLineContainer = document.createElement("div");
      checkedLineContainer.classList.add("w-px", "h-3", "absolute", "flex", "justify-center");
      checkedLineContainer.style.leftPERCENT = leftStylePercent;
      lowerTickContainer.appendChild(checkedLineContainer);
      const checkedLine = document.createElement("div");
      if (isScoreMet) {
        checkedLine.classList.add("advisor-panel__reward-pip-icon-done");
      } else {
        checkedLine.classList.add("advisor-panel__reward-pip-icon-empty");
      }
      checkedLine.classList.add("h-7", "w-4", "advisor-panel__reward-pip");
      checkedLineContainer.appendChild(checkedLine);
      const ageProgressRewardAmt = AdvisorProgress.getMilestoneProgressAmount(chosenAdvisor, index);
      const rewardWrapperPlacementElement = document.createElement("div");
      rewardWrapperPlacementElement.classList.add(
        "w-px",
        "h-0",
        "absolute",
        "flex",
        "justify-center",
        "items-end"
      );
      rewardWrapperPlacementElement.style.leftPERCENT = leftStylePercent;
      upperTickContainer.appendChild(rewardWrapperPlacementElement);
      const rewardWrapper = this.renderRewardPip(milestone, chosenAdvisor, rewards, ageProgressRewardAmt);
      rewardWrapper.setAttribute("tabindex", "-1");
      if (milestone.FinalMilestone) {
        rewardWrapper.classList.add("mr-1");
        checkedLine.classList.add("mr-1");
      }
      this.rewardElemends.push(rewardWrapper);
      rewardWrapperPlacementElement.appendChild(rewardWrapper);
      if (milestone.FinalMilestone) {
        const victoryText = document.createElement("div");
        victoryText.classList.add(
          "advisor-panel__victory-desc",
          "font-title-base",
          "uppercase",
          "text-gradient-secondary",
          "absolute",
          "-top-44",
          "self-center",
          "whitespace-nowrap",
          "font-fit-shrink"
        );
        if (Game.AgeProgressManager.isFinalAge) {
          victoryText.setAttribute("data-l10n-id", "LOC_VICTORY_VICTORY");
        } else {
          victoryText.setAttribute("data-l10n-id", "LOC_VICTORY_GOLDEN_AGE");
        }
        rewardWrapperPlacementElement.appendChild(victoryText);
      }
      const ageProgression = document.createElement("div");
      ageProgression.role = "paragraph";
      ageProgression.classList.add(
        "advisor-panel__age-progress",
        "absolute",
        "text-2xs",
        "pointer-events-auto",
        "-bottom-14",
        "w-128",
        "text-center"
      );
      const ageProgressRewardLabel = Locale.compose("LOC_VICTORY_AGE_PROGRESS", ageProgressRewardAmt);
      ageProgression.setAttribute("data-l10n-id", ageProgressRewardLabel);
      if (isScoreMet) {
        ageProgression.classList.add("opacity-20");
      }
      checkedLineContainer.appendChild(ageProgression);
    }
    for (let i = 0; i < numTicks; i++) {
      const tickScore = maxScore > MAX_NUMBER_OF_TICKS ? i * TICK_COMPRESSION_MODIFIER : i;
      if (!AdvisorProgress.isRewardMileStone(chosenAdvisor, tickScore)) {
        const line = document.createElement("div");
        line.classList.add("advisor-panel__pip", "w-px", "h-3", "absolute", "bg-primary-1");
        line.style.leftPERCENT = i / numTicks * 100;
        lowerTickContainer.appendChild(line);
      }
    }
    const progressMask = document.createElement("div");
    progressMask.classList.add(
      "advisor-panel__progress-mask",
      "bg-cover",
      "bg-center",
      "bg-no-repeat",
      "absolute",
      "w-full",
      "h-8",
      "top-0",
      "origin-left",
      "border-2",
      "border-secondary-2"
    );
    progressMask.style.backgroundImage = `url("${AdvisorProgress.getAdvisorProgressBar(chosenAdvisor)}")`;
    let ratio = this.playerData.maxScore > 0 ? this.playerData.currentScore / this.playerData.maxScore : 0;
    ratio = ratio > 1 ? 1 : ratio;
    progressMask.style.transform = `scaleX(${ratio})`;
    progressBar.appendChild(progressMask);
    bottomPanel.appendChild(legendReward);
    bottomPanel.appendChild(progressBarWrapper);
    return bottomPanel;
  }
  renderTrackVictoryCheckBox() {
    const trackQuestWrapper = document.createElement("div");
    trackQuestWrapper.classList.add(
      "flow-row",
      "text-base",
      "font-title",
      "uppercase",
      "flex-auto",
      "font-bold",
      "tracking-150",
      "relative"
    );
    const isTrackerVisible = this.activeQuest && !Online.Metaprogression.isPlayingActiveEvent() ? true : false;
    trackQuestWrapper.classList.toggle("hidden", !isTrackerVisible);
    const checkBox = document.createElement("fxs-checkbox");
    checkBox.setAttribute("selected", `${this.isTracked}`);
    checkBox.setAttribute("tabindex", "-1");
    checkBox.classList.add("advisor-victory_tracker", "size-7", "mr-4");
    checkBox.addEventListener("action-activate", this.trackVictoryActivateListener);
    const navHelper = document.createElement("fxs-nav-help");
    navHelper.classList.add("absolute", "-left-9");
    navHelper.setAttribute("action-key", "inline-shell-action-3");
    const trackerText = document.createElement("p");
    trackerText.classList.add("font-title-sm", "leading-loose", "text-gradient-secondary");
    trackerText.setAttribute("data-l10n-id", "LOC_VICTORY_PROGRESS_TRACK_VICTORY");
    trackQuestWrapper.appendChild(navHelper);
    trackQuestWrapper.appendChild(checkBox);
    trackQuestWrapper.appendChild(trackerText);
    return trackQuestWrapper;
  }
  getIconRewards(finalReward) {
    const returnRewards = /* @__PURE__ */ new Map();
    for (const reward of finalReward) {
      if (reward.AgeProgressionRewardType.includes("GOLDEN_AGE")) {
        continue;
      }
      if (reward.Icon == void 0) {
        console.error(
          `panel-advisor-victory: getIconRewards - no Icon found for reward of index ${reward.$index}`
        );
        continue;
      }
      returnRewards.set(reward.Icon, (returnRewards.get(reward.Icon) ?? 0) + 1);
    }
    return returnRewards;
  }
  onTrackVictoryActivate(event) {
    if (event.target instanceof HTMLElement) {
      const isCurrentlyTracked = event.target.getAttribute("selected");
      if (!this.activeQuest) {
        return;
      }
      const trackQuest = isCurrentlyTracked === "true" ? true : false;
      AdvisorProgress.updateQuestTracking(this.activeQuest, trackQuest);
      this.updateVictoryQuests();
    }
  }
  toggleCheckBox() {
    const checkBox = this.Root.querySelector(".advisor-victory_tracker");
    if (!checkBox || !this.activeQuest) {
      console.error(
        "panel-advisor-victory: toggleCheckBox(): Failed to find advisor-victory_tracker or activeQuest"
      );
      return;
    }
    this.isTracked = !this.isTracked;
    AdvisorProgress.updateQuestTracking(this.activeQuest, this.isTracked);
    checkBox.setAttribute("selected", `${this.isTracked}`);
  }
  onRadioButtonInput(event) {
    if (event.target instanceof HTMLElement) {
      const targetActivateIndex = event.target.getAttribute("value");
      if (targetActivateIndex) {
        const prevIndex = this.carouselIndex;
        this.carouselIndex = +targetActivateIndex;
        this.updateRadioButton(prevIndex, this.carouselIndex);
        this.updateVictoryQuests();
      }
    }
  }
  onEngineInput(inputEvent) {
    if (this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    if (inputEvent.detail.name == "shell-action-2" && this.selectedAdvisor) {
      engine.trigger(
        "open-civilopedia",
        AdvisorProgress.getCivilopediaVictorySearchByAdvisor(this.selectedAdvisor)
      );
      return true;
    }
    if (inputEvent.detail.name == "shell-action-3") {
      this.toggleCheckBox();
      Audio.playSound("data-audio-checkbox-press");
      return true;
    }
    return false;
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
    }
  }
  onCivilopediaButtonInput(_event) {
    if (!this.selectedAdvisor || !AdvisorProgress.getCivilopediaVictorySearchByAdvisor(this.selectedAdvisor)) {
      console.error("panel-advisor-victory: onCivilopediaButtonInput, error finding advisor or search");
      return;
    }
    engine.trigger("open-civilopedia", AdvisorProgress.getCivilopediaVictorySearchByAdvisor(this.selectedAdvisor));
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (!this.carousel || this.radioButtons.length <= 0 || !this.radioButtons[this.carouselIndex]) {
      console.error("screen-victory-progress: handleNavigation(): Failed to find carousel or radioButtons");
      return false;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.LEFT: {
        if (this.isTopFocused) {
          this.onCarouselLeft();
          Audio.playSound("data-audio-radio-press");
        } else {
          if (this.selectedRewardIndex > 0) {
            this.selectedRewardIndex--;
          }
          FocusManager.setFocus(this.rewardElemends[this.selectedRewardIndex]);
        }
        live = false;
        break;
      }
      case InputNavigationAction.RIGHT: {
        if (this.isTopFocused) {
          this.onCarouselRight();
          Audio.playSound("data-audio-radio-press");
        } else {
          if (this.selectedRewardIndex < this.rewardElemends.length - 1) {
            this.selectedRewardIndex++;
          }
          FocusManager.setFocus(this.rewardElemends[this.selectedRewardIndex]);
        }
        live = false;
        break;
      }
      case InputNavigationAction.UP: {
        if (!this.isTopFocused) {
          this.isTopFocused = !this.isTopFocused;
          FocusManager.setFocus(this.radioButtons[this.carouselIndex]);
        }
        live = false;
        break;
      }
      case InputNavigationAction.DOWN: {
        if (this.isTopFocused) {
          this.isTopFocused = !this.isTopFocused;
          FocusManager.setFocus(this.rewardElemends[this.selectedRewardIndex]);
        }
        live = false;
        break;
      }
    }
    return live;
  }
  setupRewardTooltipPosition(reward, isGamepadActive) {
    if (isGamepadActive) {
      reward.setAttribute("data-tooltip-anchor", "top");
      reward.setAttribute("data-tooltip-anchor-offset", "10");
    } else {
      reward.removeAttribute("data-tooltip-anchor");
      reward.removeAttribute("data-tooltip-anchor-offset");
    }
  }
}
Controls.define("panel-advisor-victory", {
  createInstance: PanelAdvisorVictory,
  attributes: [{ name: "advisor-type" }],
  description: "Panel which displays a specific advisor quest for victory and current ranking",
  classNames: ["panel-advisor-victory", "flex-auto", "h-auto"],
  styles: [styles]
});
//# sourceMappingURL=panel-advisor-victory.js.map
