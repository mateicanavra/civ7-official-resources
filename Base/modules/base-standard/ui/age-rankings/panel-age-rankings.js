import FocusManager from '../../../core/ui/input/focus-manager.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { g as getPlayerColorValues } from '../../../core/ui/utilities/utilities-color.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import AgeRankings from './model-age-rankings.js';
import AgeSummary from '../age-summary/model-age-summary-hub.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../victory-manager/victory-manager.chunk.js';

const styles = "fs://game/base-standard/ui/age-rankings/panel-age-rankings.css";

class PanelAgeRankings extends Panel {
  selectedAgeType = "";
  boundOnSelectedAgeChanged = this.onSelectedAgeChanged.bind(this);
  ageRankScrollable;
  onAttach() {
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (!currentAge) {
      console.error(`panel-age-rankings: Failed to get current age for hash ${Game.age}`);
      return;
    }
    this.selectedAgeType = currentAge.AgeType;
    AgeSummary.selectedAgeChangedEvent.on(this.boundOnSelectedAgeChanged);
    this.render();
    super.onAttach();
    this.Root.addEventListener("focus", this.onFocus);
  }
  onDetach() {
    AgeSummary.selectedAgeChangedEvent.off(this.boundOnSelectedAgeChanged);
    this.Root.removeEventListener("focus", this.onFocus);
    super.onDetach();
  }
  onFocus = () => {
    FocusManager.setFocus(this.ageRankScrollable);
  };
  render() {
    while (this.Root.lastChild) {
      this.Root.removeChild(this.Root.lastChild);
    }
    this.ageRankScrollable = document.createElement("fxs-scrollable");
    this.ageRankScrollable.classList.add("w-full");
    this.ageRankScrollable.setAttribute("tabindex", "-1");
    this.ageRankScrollable.setAttribute("handle-gamepad-pan", "true");
    const ageRankWrapper = document.createElement("fxs-vslot");
    ageRankWrapper.classList.add("w-full", "flow-column");
    const victoryData = AgeRankings.victoryData.get(this.selectedAgeType);
    if (!victoryData) {
      console.error("panel-age-rankings: Failed to get the victory data for the desired age");
      return;
    }
    const enabledLegacyPaths = Players.get(GameContext.localPlayerID)?.LegacyPaths?.getEnabledLegacyPaths();
    const victoryIconTitlesContainer = document.createElement("div");
    victoryIconTitlesContainer.classList.add("flow-row");
    const victoryDescriptionsContainer = document.createElement("div");
    victoryDescriptionsContainer.classList.add("flow-row", "mb-4");
    const victoryProgressesContainer = document.createElement("div");
    victoryProgressesContainer.classList.add("flow-row");
    for (const victory of victoryData) {
      const legacyPath = enabledLegacyPaths?.find((lPath) => lPath.legacyPath == Database.makeHash(victory.Type));
      if (!legacyPath) {
        continue;
      }
      const victoryIconTitleContainer = document.createElement("div");
      victoryIconTitleContainer.classList.add("flow-column", "ml-8", "mr-8", "flex-1");
      const victoryIcon = document.createElement("div");
      victoryIcon.classList.add(
        "age-rankings_icon",
        "size-52",
        "bg-contain",
        "bg-no-repeat",
        "self-center",
        "-mb-10",
        "-mt-6"
      );
      victoryIcon.style.backgroundImage = `url('${victory.Icon}')`;
      victoryIconTitleContainer.appendChild(victoryIcon);
      const victoryName = document.createElement("div");
      victoryName.classList.add(
        "age-rankings_title",
        "self-center",
        "font-title-lg",
        "uppercase",
        "tracking-150",
        "mb-2",
        "text-center",
        "font-fit-shrink",
        "h-16"
      );
      victoryName.setAttribute("data-l10n-id", victory.Name);
      victoryIconTitleContainer.appendChild(victoryName);
      victoryIconTitlesContainer.appendChild(victoryIconTitleContainer);
      const victoryDescriptionContainer = document.createElement("div");
      victoryDescriptionContainer.classList.add("flow-column", "ml-8", "mr-8", "flex-1");
      const victoryDescription = document.createElement("div");
      victoryDescription.classList.add("age-rankings__item-description", "self-center", "font-body-sm");
      victoryDescription.setAttribute("data-l10n-id", victory.Description);
      victoryDescriptionContainer.appendChild(victoryDescription);
      victoryDescriptionsContainer.appendChild(victoryDescriptionContainer);
      const victoryProgressContainer = document.createElement("div");
      victoryProgressContainer.classList.add("flow-column", "ml-8", "mr-8", "flex-1");
      const ageProgressWrapper = document.createElement("div");
      ageProgressWrapper.classList.add(
        "flow-row",
        "font-title-xs",
        "uppercase",
        "tracking-100",
        "justify-center",
        "break-words"
      );
      const ageProgressTitle = document.createElement("div");
      ageProgressTitle.setAttribute("data-l10n-id", "LOC_VICTORY_AGE_PROGRESS_TALLY");
      ageProgressTitle.classList.add("mr-3");
      const ageProgressTotal = document.createElement("div");
      ageProgressTotal.innerHTML = Locale.compose(
        "LOC_UI_AGE_RANKINGS_POINTS",
        AgeRankings.getMilestonesCompleted(victory.Type),
        AgeRankings.getMaxMilestoneProgressionTotal(victory.Type)
      );
      ageProgressWrapper.appendChild(ageProgressTitle);
      ageProgressWrapper.appendChild(ageProgressTotal);
      victoryProgressContainer.appendChild(ageProgressWrapper);
      let hasShownLocalPlayer = false;
      const firstPlace = victory.playerData[0];
      if (firstPlace) {
        victoryProgressContainer.appendChild(this.renderPlayer(firstPlace, victory.ClassType));
        hasShownLocalPlayer = hasShownLocalPlayer == false ? firstPlace.isLocalPlayer : true;
      }
      const secondPlace = victory.playerData[1];
      if (secondPlace) {
        victoryProgressContainer.appendChild(this.renderPlayer(secondPlace, victory.ClassType));
        hasShownLocalPlayer = hasShownLocalPlayer == false ? secondPlace.isLocalPlayer : true;
      }
      const thirdPlace = victory.playerData[2];
      if (thirdPlace) {
        victoryProgressContainer.appendChild(this.renderPlayer(thirdPlace, victory.ClassType));
        hasShownLocalPlayer = hasShownLocalPlayer == false ? thirdPlace.isLocalPlayer : true;
      }
      if (!hasShownLocalPlayer) {
        const localPlayerData = victory.playerData.find((playerData) => {
          return playerData.isLocalPlayer;
        });
        if (localPlayerData) {
          victoryProgressContainer.appendChild(this.renderPlayer(localPlayerData, victory.ClassType));
        }
      }
      victoryProgressesContainer.appendChild(victoryProgressContainer);
    }
    ageRankWrapper.appendChild(victoryIconTitlesContainer);
    ageRankWrapper.appendChild(victoryDescriptionsContainer);
    ageRankWrapper.appendChild(victoryProgressesContainer);
    this.ageRankScrollable.appendChild(ageRankWrapper);
    this.Root.appendChild(this.ageRankScrollable);
  }
  renderPlayer(player, victoryType) {
    const fragment = document.createDocumentFragment();
    const playerContainer = document.createElement("div");
    playerContainer.classList.add("self-center", "flex", "flex-row", "pointer-events-auto", "mt-6");
    Databind.tooltip(playerContainer, player.playerName);
    playerContainer.setAttribute("style", getPlayerColorValues(player.playerID));
    const civLeader = document.createElement("div");
    civLeader.classList.add("size-20", "relative");
    const civLeaderHexBGShadow = document.createElement("div");
    civLeaderHexBGShadow.classList.value = "diplo-ribbon__portrait-hex-bg-shadow bg-contain bg-center bg-no-repeat inset-0 absolute";
    civLeader.appendChild(civLeaderHexBGShadow);
    const civLeaderHexBG = document.createElement("div");
    civLeaderHexBG.classList.value = "diplo-ribbon__portrait-hex-bg bg-contain bg-center bg-no-repeat inset-0 absolute";
    civLeader.appendChild(civLeaderHexBG);
    const civLeaderHexBGFrame = document.createElement("div");
    civLeaderHexBGFrame.classList.value = "diplo-ribbon__portrait-hex-bg-frame bg-contain bg-center bg-no-repeat inset-0 absolute";
    civLeader.appendChild(civLeaderHexBGFrame);
    const portrait = document.createElement("div");
    portrait.classList.add(
      "diplo-ribbon__portrait-image",
      "absolute",
      "inset-0",
      "bg-contain",
      "bg-no-repeat",
      "bg-bottom"
    );
    portrait.style.backgroundImage = `url('${player.leaderPortrait}')`;
    civLeader.appendChild(portrait);
    playerContainer.appendChild(civLeader);
    const scoreContainer = document.createElement("div");
    scoreContainer.classList.add("flex-initial", "self-center");
    playerContainer.appendChild(scoreContainer);
    const scoreTextContainer = document.createElement("div");
    scoreTextContainer.classList.add("self-left", "flex", "flex-row");
    const scoreText = document.createElement("div");
    scoreText.classList.add("self-left", "font-body", "text-lg");
    scoreText.textContent = Locale.compose("LOC_UI_AGE_RANKINGS_POINTS", player.currentScore, player.maxScore);
    scoreTextContainer.appendChild(scoreText);
    if (player.isLocalPlayer) {
      const scoreYouText = document.createElement("div");
      scoreYouText.classList.add("self-left", "font-body", "text-lg", "ml-4");
      scoreYouText.setAttribute("data-l10n-id", "LOC_AGE_SCORE_YOU_TEXT");
      scoreTextContainer.appendChild(scoreYouText);
    }
    scoreContainer.appendChild(scoreTextContainer);
    const progressBacking = document.createElement("div");
    progressBacking.classList.add("self-center", "h-6", "w-40", "border-2", "border-primary-1", "relative");
    scoreContainer.appendChild(progressBacking);
    const progressBar = document.createElement("div");
    progressBar.classList.add("self-center", "h-5", "w-full", "bg-primary");
    progressBar.style.transformOrigin = "left";
    const ratio = Math.min(1, player.maxScore != 0 ? player.currentScore / player.maxScore : 0);
    progressBar.style.transform = `scaleX(${ratio})`;
    progressBacking.appendChild(progressBar);
    const mileStonesPercents = AgeRankings.getMilestoneBarPercentages(victoryType);
    for (const percent of mileStonesPercents) {
      const line = document.createElement("div");
      line.classList.add("w-px", "h-5", "absolute", "bg-primary-1");
      line.attributeStyleMap.set("left", CSS.percent(percent * 100));
      progressBacking.appendChild(line);
    }
    fragment.appendChild(playerContainer);
    return fragment;
  }
  onSelectedAgeChanged(ageType) {
    this.selectedAgeType = ageType;
    this.render();
  }
}
Controls.define("panel-age-rankings", {
  createInstance: PanelAgeRankings,
  description: "Panel which displays the victory rankings for a selected age",
  classNames: ["panel-age-rankings", "flex-auto"],
  styles: [styles],
  tabIndex: -1
});
//# sourceMappingURL=panel-age-rankings.js.map
