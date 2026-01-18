import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { HidePlotTooltipEvent, ShowPlotTooltipEvent } from '../../../core/ui/tooltips/tooltip-manager.js';
import { r as realizeCivHeraldry } from '../../../core/ui/utilities/utilities-color.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { EndResultsFinishedEventName } from '../end-results/end-results.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import './model-endgame.js';

const styles = "fs://game/base-standard/ui/endgame/screen-endgame.css";

var TransitionState = /* @__PURE__ */ ((TransitionState2) => {
  TransitionState2[TransitionState2["Banner"] = 0] = "Banner";
  TransitionState2[TransitionState2["Animation"] = 1] = "Animation";
  TransitionState2[TransitionState2["EndResults"] = 2] = "EndResults";
  TransitionState2[TransitionState2["Summary"] = 3] = "Summary";
  return TransitionState2;
})(TransitionState || {});
var ContinueButtonType = /* @__PURE__ */ ((ContinueButtonType2) => {
  ContinueButtonType2[ContinueButtonType2["ContinueGame"] = 0] = "ContinueGame";
  ContinueButtonType2[ContinueButtonType2["ExitToMainMenu"] = 1] = "ExitToMainMenu";
  ContinueButtonType2[ContinueButtonType2["TransitionAge"] = 2] = "TransitionAge";
  return ContinueButtonType2;
})(ContinueButtonType || {});
class EndGameScreen extends Panel {
  isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
  navContainer = null;
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  eventAnimationListener = this.playNextAnimation.bind(this);
  endResultsFinishedListener = this.onEndResultsFinished.bind(this);
  cinemaPanel = null;
  transitionState = 0 /* Banner */;
  continueButtonType = 0 /* ContinueGame */;
  tabBar = null;
  summarySlot = null;
  endGameTabs = [
    { label: "LOC_VICTORY_PROGRESS_REWARDS", id: "rewards" },
    { label: "LOC_END_GAME_OVERALL_SCORE", id: "age-rankings" },
    { label: "LOC_END_GAME_AGE_SCORES", id: "legacy-points" }
    // TODO uncomment when Graphs are working
    // { label: 'LOC_END_GAME_RANKINGS', id: 'graphs' },
  ];
  endGameTabsFinalAge = [
    { label: "LOC_END_GAME_OVERALL_SCORE", id: "age-rankings" },
    { label: "LOC_END_GAME_AGE_SCORES", id: "legacy-points" }
    // TODO uncomment when Graphs are working
    // { label: 'LOC_END_GAME_RANKINGS', id: 'graphs' },
  ];
  /** Cache whether the OMT button is allowed to avoid rechecking. */
  oneMoreTurnAllowed = false;
  constructor(root) {
    super(root);
  }
  buildBackgroundVignette() {
    const bgContainer = document.createElement("div");
    bgContainer.classList.add("age-ending__shading-container", "absolute", "inset-0");
    bgContainer.id = "matte-anim-wrapper";
    bgContainer.innerHTML = `
			<div class="age-ending__painting-color-adjust absolute inset-0"></div>
			<div class="age-ending__painting-marble-overlay absolute inset-0"></div>
			<div class="age-ending__painting-bg-vignette absolute inset-0"></div>
			<div class="age-ending__painting-top-gradient"></div>
			<div class="age-ending__painting-bottom-gradient"></div>
		`;
    return bgContainer;
  }
  /**
   * Shows the summary screen for the end of the age.
   *
   * @param container container to add the summary screen to.
   * @param ageOver if the age is over or not.
   * @param playerDefeat if/how the player was defeated
   */
  buildAgeEndTransitionSummaryScreen(playerDefeat) {
    const summaryFragment = document.createDocumentFragment();
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("age-summary__container", "absolute", "inset-0", "flex", "hidden");
    mainContainer.id = "age-summary-container";
    const pastCivAnimColorAdjustment = document.createElement("div");
    pastCivAnimColorAdjustment.classList.add(
      "screen-endgame__painting-color-adjust",
      "fullscreen-outside-safezone"
    );
    summaryFragment.appendChild(pastCivAnimColorAdjustment);
    const pastCivAnimMarbleOverlay = document.createElement("div");
    pastCivAnimMarbleOverlay.classList.add(
      "screen-endgame__painting-marble-overlay",
      "fullscreen-outside-safezone"
    );
    summaryFragment.appendChild(pastCivAnimMarbleOverlay);
    const pastCivAnimVignette = document.createElement("div");
    pastCivAnimVignette.classList.add("screen-endgame__painting-bg-vignette", "fullscreen-outside-safezone");
    summaryFragment.appendChild(pastCivAnimVignette);
    const pastCivAnimTopGradient = document.createElement("div");
    pastCivAnimTopGradient.classList.add(
      "screen-endgame__painting-top-gradient",
      "fullscreen-outside-safezone-x-top"
    );
    summaryFragment.appendChild(pastCivAnimTopGradient);
    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("screen-endgame__title-wrapper");
    summaryFragment.appendChild(titleWrapper);
    const gameSummaryTitleText = document.createElement("div");
    gameSummaryTitleText.classList.add("screen-endgame__title-text", "font-title");
    gameSummaryTitleText.innerHTML = Locale.compose("LOC_END_GAME_OVERALL_SCORE");
    titleWrapper.appendChild(gameSummaryTitleText);
    const winTypeTitleHorizontalRule = document.createElement("div");
    winTypeTitleHorizontalRule.classList.add("screen-endgame__title-horizontal-rule");
    titleWrapper.appendChild(winTypeTitleHorizontalRule);
    const gameSummaryPanelWrapper = document.createElement("fxs-frame");
    if (this.isMobileViewExperience) {
      gameSummaryPanelWrapper.setAttribute("outside-safezone-mode", "full");
    }
    gameSummaryPanelWrapper.classList.add(
      "screen-endgame__panel-wrapper",
      "size-full",
      "absolute",
      "flow-column",
      "justify-center",
      "items-center"
    );
    summaryFragment.appendChild(gameSummaryPanelWrapper);
    const gameSummaryPanelContainer = document.createElement("div");
    gameSummaryPanelContainer.classList.add(
      "screen-endgame__panel-container",
      "relative",
      "h-full",
      "max-w-full",
      "min-w-full"
    );
    gameSummaryPanelWrapper.appendChild(gameSummaryPanelContainer);
    const gameSummaryPanelBase = document.createElement("div");
    gameSummaryPanelBase.classList.add("relative", "flow-column", "h-full");
    gameSummaryPanelContainer.appendChild(gameSummaryPanelBase);
    const gameSummaryPanelButtonContainer = document.createElement("div");
    gameSummaryPanelButtonContainer.classList.add(
      "screen-endgame__panel-button-container",
      "flow-row",
      "justify-end"
    );
    const gameSummaryPanelButtonContainerFrame = document.createElement("div");
    gameSummaryPanelButtonContainerFrame.classList.add("screen-endgame__panel-button-container-frame");
    gameSummaryPanelButtonContainer.appendChild(gameSummaryPanelButtonContainerFrame);
    const movieType = this.chooseTransitionMovie();
    if (movieType) {
      const gameSummaryPanelReplayAnimationButtonWrapper = document.createElement("div");
      gameSummaryPanelReplayAnimationButtonWrapper.classList.add(
        "screen-endgame__panel-button-replay-anim-wrapper",
        "mr-4"
      );
      gameSummaryPanelButtonContainer.appendChild(gameSummaryPanelReplayAnimationButtonWrapper);
      const gameSummaryReplayAnimButton = document.createElement("fxs-button");
      gameSummaryReplayAnimButton.setAttribute("caption", "LOC_END_GAME_REPLAY");
      gameSummaryReplayAnimButton.setAttribute("action-key", "inline-shell-action-1");
      gameSummaryReplayAnimButton.addEventListener("action-activate", () => {
        this.replayAnimation();
        if (this.tabBar) {
          FocusManager.setFocus(this.tabBar);
        }
      });
      gameSummaryPanelReplayAnimationButtonWrapper.appendChild(gameSummaryReplayAnimButton);
    }
    const gameSummaryPanelOMTButtonWrapper = document.createElement("div");
    gameSummaryPanelOMTButtonWrapper.classList.add("screen-endgame__panel-button-omt-wrapper", "mr-4");
    gameSummaryPanelButtonContainer.appendChild(gameSummaryPanelOMTButtonWrapper);
    this.oneMoreTurnAllowed = false;
    if (Players.isAlive(GameContext.localPlayerID)) {
      if (playerDefeat == DefeatTypes.NO_DEFEAT || GameInfo.Defeats.lookup(playerDefeat)?.AllowOneMoreTurn) {
        const args = {};
        const result = Game.PlayerOperations.canStart(
          GameContext.localPlayerID,
          PlayerOperationTypes.EXTEND_GAME,
          args,
          false
        );
        if (result.Success) {
          this.oneMoreTurnAllowed = true;
          const continueButton = document.createElement("fxs-button");
          this.continueButtonType = 0 /* ContinueGame */;
          continueButton.setAttribute("caption", "LOC_END_GAME_CONTINUE");
          continueButton.setAttribute("action-key", "inline-shell-action-2");
          continueButton.addEventListener("action-activate", () => {
            this.justOneMoreTurn();
          });
          gameSummaryPanelOMTButtonWrapper.appendChild(continueButton);
        }
      }
    }
    const gameSummaryPanelContinueButtonWrapper = document.createElement("div");
    gameSummaryPanelContinueButtonWrapper.classList.add("screen-endgame__panel-button-continue-wrapper");
    gameSummaryPanelButtonContainer.appendChild(gameSummaryPanelContinueButtonWrapper);
    const canTransition = Game.AgeProgressManager.canTransitionToNextAge(GameContext.localPlayerID);
    if (canTransition) {
      this.continueButtonType = 2 /* TransitionAge */;
      const gameSummaryContinueButton = document.createElement("fxs-button");
      if (Network.supportsSSO() && Network.isMetagamingAvailable()) {
        gameSummaryContinueButton.setAttribute("caption", "LOC_END_GAME_LEGENDS");
      } else {
        gameSummaryContinueButton.setAttribute("caption", "LOC_END_GAME_TRANSITION");
      }
      gameSummaryContinueButton.setAttribute("action-key", "inline-sys-menu");
      gameSummaryContinueButton.addEventListener("action-activate", () => {
        Telemetry.sendAgeTransitionStart();
        this.transitionToNextAge();
      });
      gameSummaryPanelContinueButtonWrapper.appendChild(gameSummaryContinueButton);
    } else {
      this.continueButtonType = 1 /* ExitToMainMenu */;
      const gameSummaryContinueButton = document.createElement("fxs-button");
      if (Network.supportsSSO() && Network.isMetagamingAvailable()) {
        gameSummaryContinueButton.setAttribute("caption", "LOC_END_GAME_LEGENDS");
      } else {
        gameSummaryContinueButton.setAttribute("caption", "LOC_END_GAME_EXIT");
      }
      gameSummaryContinueButton.setAttribute("action-key", "inline-sys-menu");
      gameSummaryContinueButton.addEventListener("action-activate", () => {
        this.exitToMainMenu();
      });
      gameSummaryPanelContinueButtonWrapper.appendChild(gameSummaryContinueButton);
    }
    this.tabBar = document.createElement("fxs-tab-bar");
    this.tabBar.classList.add("screen-endgame__tab-bar", "self-center", "w-full");
    this.tabBar.setAttribute(
      "tab-items",
      JSON.stringify(Game.AgeProgressManager.isFinalAge ? this.endGameTabsFinalAge : this.endGameTabs)
    );
    this.tabBar.setAttribute("tab-item-class", "px-5");
    this.tabBar.addEventListener("tab-selected", this.onGameSummaryTabBarSelected.bind(this));
    gameSummaryPanelBase.appendChild(this.tabBar);
    this.summarySlot = document.createElement("fxs-slot-group");
    this.summarySlot.classList.add("summary-slot", "flow-column", "items-center", "flex-auto", "mx-10");
    gameSummaryPanelBase.appendChild(this.summarySlot);
    const gameSummaryRewards = document.createElement("panel-player-rewards");
    gameSummaryRewards.classList.add("mb-2", "mt-10");
    gameSummaryRewards.id = "rewards";
    this.summarySlot.appendChild(gameSummaryRewards);
    const gameSummaryAgeRank = document.createElement("panel-age-rankings");
    gameSummaryAgeRank.classList.add("flex", "justify-center", "item-center", "mt-10", "mb-2");
    gameSummaryAgeRank.id = "age-rankings";
    this.summarySlot.appendChild(gameSummaryAgeRank);
    const gameSummaryLegacyPoints = document.createElement("panel-victory-points");
    gameSummaryLegacyPoints.classList.add(
      "summary__legacy-points",
      "flow-column",
      "justify-start",
      "w-full",
      "mt-16",
      "mb-2"
    );
    gameSummaryLegacyPoints.id = "legacy-points";
    this.summarySlot.appendChild(gameSummaryLegacyPoints);
    const gameSummaryGraphs = document.createElement("panel-end-result-graphs");
    gameSummaryGraphs.classList.add("flow-column", "justify-center", "w-full", "mt-10", "mb-2");
    gameSummaryGraphs.id = "graphs";
    this.summarySlot.appendChild(gameSummaryGraphs);
    gameSummaryPanelBase.appendChild(gameSummaryPanelButtonContainer);
    mainContainer.appendChild(summaryFragment);
    return mainContainer;
  }
  onGameSummaryTabBarSelected(event) {
    const slotGroup = MustGetElement(".summary-slot", this.Root);
    slotGroup.setAttribute("selected-slot", event.detail.selectedItem.id);
  }
  chooseTransitionMovie() {
    const localPlayer = GameContext.localPlayerID;
    if (localPlayer == PlayerIds.NO_PLAYER || localPlayer == PlayerIds.OBSERVER_ID) {
      return null;
    }
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error(
        `screen-endgame: chooseTransitionMovie(): Failed to find PlayerLibrary for ${GameContext.localPlayerID}`
      );
      return null;
    }
    const ageDefinition = GameInfo.Ages.lookup(Game.age);
    if (!ageDefinition) {
      console.error("screen-endgame: current age definition lookup failed");
      return null;
    }
    const civilizationDefinition = GameInfo.Civilizations.lookup(player.civilizationType);
    if (!civilizationDefinition) {
      console.error(`screen-endgame: Could not find definition for player leader - ${player.civilizationType}.`);
      return null;
    }
    const leaderDefinition = GameInfo.Leaders.lookup(player.leaderType);
    if (!leaderDefinition) {
      console.error(`screen-endgame: Could not find definition for player leader - ${player.leaderType}.`);
      return null;
    }
    const ageType = ageDefinition.AgeType;
    const civilizationType = civilizationDefinition.CivilizationType;
    const leaderType = leaderDefinition.LeaderType;
    const firstPlaceVictories = /* @__PURE__ */ new Set();
    let firstFirstPlaceVictoryType = null;
    let defeatType = null;
    const playerDefeat = Game.VictoryManager.getLatestPlayerDefeat(localPlayer);
    if (playerDefeat != DefeatTypes.NO_DEFEAT) {
      const defeatDefinition = GameInfo.Defeats.lookup(playerDefeat);
      if (defeatDefinition) {
        defeatType = defeatDefinition.DefeatType;
      }
    } else {
      const victories = Game.VictoryManager.getVictories();
      for (const value of victories) {
        if (player.team != value.team) {
          continue;
        }
        if (value.place != 1) {
          continue;
        }
        const victoryDefinition = GameInfo.Victories.lookup(value.victory);
        if (!victoryDefinition) {
          console.error("screen-endgame: chooseTransitionMovie(): Failed to find victory definition!");
          continue;
        }
        if (!firstFirstPlaceVictoryType) {
          firstFirstPlaceVictoryType = victoryDefinition.VictoryType;
        }
        firstPlaceVictories.add(victoryDefinition.VictoryType);
      }
    }
    const isFinalAge = Game.AgeProgressManager.isFinalAge;
    const completedLegacyPaths = /* @__PURE__ */ new Set();
    let lastCompletedLegacyPath = "";
    const playerCompletedLegacyPaths = player.LegacyPaths?.getCompletedLegacyPaths();
    if (playerCompletedLegacyPaths) {
      for (const path of playerCompletedLegacyPaths) {
        const legacyPath = GameInfo.LegacyPaths.lookup(path);
        if (legacyPath) {
          completedLegacyPaths.add(legacyPath.LegacyPathType);
          lastCompletedLegacyPath = legacyPath.LegacyPathType;
        }
      }
    }
    const gameUnlocks = Game.Unlocks;
    const endGameMovies = GameInfo.EndGameMovies.filter((egm) => {
      if (egm.AgeType && egm.AgeType != ageType) {
        return false;
      } else if (egm.CivilizationType && egm.CivilizationType != civilizationType) {
        return false;
      } else if (egm.LeaderType && egm.LeaderType != leaderType) {
        return false;
      } else if (egm.DefeatType && egm.DefeatType != defeatType) {
        return false;
      } else if (egm.IsFinalAge != null && egm.IsFinalAge != isFinalAge) {
        return false;
      } else if (egm.CompletedLegacyPath != null && !completedLegacyPaths.has(egm.CompletedLegacyPath)) {
        return false;
      } else if (egm.LastCompletedLegacyPath != null && egm.LastCompletedLegacyPath != lastCompletedLegacyPath) {
        return false;
      } else if (egm.VictoryType && egm.VictoryType != firstFirstPlaceVictoryType) {
        return false;
      } else if (egm.VictoryType && !firstPlaceVictories.has(egm.VictoryType)) {
        return false;
      } else if (egm.UnlockType && gameUnlocks.isUnlockedForPlayer(egm.UnlockType, localPlayer)) {
        return false;
      } else {
        return true;
      }
    });
    if (endGameMovies.length == 0) {
      console.debug("No end-game movies meet the necessary criteria.");
      return null;
    }
    endGameMovies.sort((a, b) => {
      return b.Priority - a.Priority;
    });
    const movieToShow = endGameMovies[0];
    if (movieToShow) {
      console.debug("Picking the first end-game movie in the following list:");
      for (const movie of endGameMovies) {
        console.debug(` * ${movie.MovieType}`);
      }
      return movieToShow.MovieType;
    } else {
      return null;
    }
  }
  playNextAnimation(event) {
    switch (event.animationName) {
      case "age-ending-end-part-1":
        this.playTransitionPart1();
        break;
    }
  }
  replayAnimation() {
    const movieName = this.chooseTransitionMovie();
    if (movieName) {
      this.transitionState = 1 /* Animation */;
      const summaryContainer = this.Root.querySelector("#age-summary-container");
      summaryContainer?.classList.remove("age-summary_container--active");
      summaryContainer?.classList.add("hidden");
      const ageEndingContainer = this.Root.querySelector("#age-ending-container");
      ageEndingContainer?.classList.remove("age-ending__container--fade-in-vignette");
      if (this.cinemaPanel) {
        this.cinemaPanel.style.display = "";
        this.cinemaPanel.setAttribute("data-movie-id", "");
        this.cinemaPanel.setAttribute("data-movie-id", movieName);
      }
    }
  }
  justOneMoreTurn() {
    if (this.oneMoreTurnAllowed) {
      const args = {};
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.EXTEND_GAME,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.EXTEND_GAME, args);
        DisplayQueueManager.closeMatching(EndGameScreenCategory);
      }
    }
  }
  playTransitionPart1() {
    const ageEndingPanel = this.Root.querySelector("#age-ending-panel");
    ageEndingPanel?.classList.add("age-ending__panel--fade-out-banner");
    ageEndingPanel?.classList.add("age-ending__panel--fade-out");
    this.transitionState = 0 /* Banner */;
  }
  onBannerFadedOut() {
    const el = this.Root.querySelector("age-transition-banner");
    if (el) {
      el.remove();
    }
    if (this.cinemaPanel) {
      const movieName = this.chooseTransitionMovie();
      if (movieName && !Game.AgeProgressManager.isExtendedGame) {
        this.cinemaPanel.style.display = "";
        this.cinemaPanel.setAttribute("data-movie-id", movieName);
      } else {
        this.showEndResultsScreen();
      }
    } else {
      this.showEndResultsScreen();
    }
  }
  onMovieEnded() {
    if (this.cinemaPanel) {
      this.cinemaPanel.style.display = "none";
    }
    this.showEndResultsScreen();
  }
  showEndResultsScreen() {
    const localPlayerId = GameContext.localPlayerID;
    const canTransition = Game.AgeProgressManager.canTransitionToNextAge(localPlayerId);
    if (canTransition) {
      this.showEndGameScreen();
      return;
    } else {
      ContextManager.push("screen-end-results", { singleton: true, createMouseGuard: true });
      this.transitionState = 2 /* EndResults */;
    }
  }
  onEndResultsFinished() {
    this.showEndGameScreen();
  }
  showEndGameScreen() {
    const summaryContainer = this.Root.querySelector("#age-summary-container");
    const ageEndingContainer = this.Root.querySelector("#age-ending-container");
    ageEndingContainer?.classList.add("age-ending__container--fade-in-vignette");
    summaryContainer?.classList.add("age-summary_container--active");
    summaryContainer?.classList.remove("hidden");
    UI.sendAudioEvent("age-end-summary");
    Audio.playSound("data-audio-stop-banner-sound", "age-transition");
    if (this.summarySlot) {
      FocusManager.setFocus(this.summarySlot);
    }
    this.transitionState = 3 /* Summary */;
  }
  onAttach() {
    super.onAttach();
    window.dispatchEvent(new HidePlotTooltipEvent());
    InterfaceMode.switchToDefault();
    if (Autoplay.isActive && !Game.AgeProgressManager.isFinalAge) {
      this.transitionToNextAge();
    }
    const playerDefeat = Game.VictoryManager.getLatestPlayerDefeat(GameContext.localPlayerID);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const fragment = document.createDocumentFragment();
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("flex", "flow-column", "flex", "flex-auto");
    realizeCivHeraldry(this.Root, GameContext.localPlayerID);
    const ageEndingContainer = document.createElement("div");
    ageEndingContainer.id = "age-ending-container";
    {
      ageEndingContainer.classList.add("age-ending__container");
      const bgContainer = this.buildBackgroundVignette();
      ageEndingContainer.appendChild(bgContainer);
      this.cinemaPanel = document.createElement("fxs-movie");
      this.cinemaPanel.classList.add("absolute", "inset-0");
      this.cinemaPanel.style.display = "none";
      this.cinemaPanel.addEventListener("movie-ended", this.onMovieEnded.bind(this));
      ageEndingContainer.appendChild(this.cinemaPanel);
      const agePanel = document.createElement("age-transition-banner");
      agePanel.classList.add("age-ending__panel--pause-animations");
      ageEndingContainer.appendChild(agePanel);
      agePanel.addEventListener("age-transition-banner-faded-out", () => {
        this.onBannerFadedOut();
      });
    }
    contentContainer.appendChild(ageEndingContainer);
    const summaryContainer = this.buildAgeEndTransitionSummaryScreen(playerDefeat);
    contentContainer.appendChild(summaryContainer);
    this.Root.addEventListener("animationend", this.eventAnimationListener);
    fragment.appendChild(contentContainer);
    this.Root.appendChild(fragment);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.addEventListener(EndResultsFinishedEventName, this.endResultsFinishedListener);
    if (ContextManager.noUserInput()) {
      this.exitToMainMenu();
    }
  }
  transitionToNextAge() {
    if (Network.isConnectedToSSO() && !Autoplay.isActive) {
      ContextManager.push("screen-legends-report", { createMouseGuard: true, singleton: true });
    } else {
      engine.call("transitionToNextAge");
    }
  }
  exitToMainMenu() {
    if (Network.isConnectedToSSO()) {
      ContextManager.push("screen-legends-report", { createMouseGuard: true, singleton: true });
    } else {
      UI.sendAudioEvent(Audio.getSoundTag("data-audio-age-end-closed"));
      engine.call("exitToMainMenu");
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.removeEventListener(EndResultsFinishedEventName, this.endResultsFinishedListener);
    this.Root.removeEventListener("animationend", this.eventAnimationListener);
    if (this.tabBar) {
      this.tabBar.removeEventListener("tab-selected", this.onGameSummaryTabBarSelected.bind(this));
    }
    super.onDetach();
    window.dispatchEvent(new ShowPlotTooltipEvent());
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    if (this.tabBar) {
      FocusManager.setFocus(this.tabBar);
    }
  }
  onLoseFocus() {
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "accept":
      case "cancel":
      case "keyboard-escape":
        if (this.transitionState == 1 /* Animation */ || this.transitionState == 0 /* Banner */) {
          const el = this.Root.querySelector("age-transition-banner");
          if (el) {
            el.remove();
          }
          if (this.cinemaPanel) {
            this.cinemaPanel.setAttribute("data-movie-id", "");
          }
          this.showEndResultsScreen();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "sys-menu":
        if (this.transitionState == 3 /* Summary */) {
          switch (this.continueButtonType) {
            case 0 /* ContinueGame */:
              DisplayQueueManager.closeMatching(EndGameScreenCategory);
              break;
            case 1 /* ExitToMainMenu */:
              this.exitToMainMenu();
              break;
            case 2 /* TransitionAge */:
              this.transitionToNextAge();
              break;
          }
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-1":
        if (this.transitionState == 3 /* Summary */) {
          this.replayAnimation();
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-2":
        if (this.oneMoreTurnAllowed) {
          if (this.transitionState == 3 /* Summary */) {
            this.justOneMoreTurn();
          }
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "shell-action-3":
        const slotGroup = MustGetElement(".summary-slot", this.Root);
        const currentTab = slotGroup.getAttribute("selected-slot");
        if (currentTab && currentTab == "graphs") {
          const dropdown = this.Root.querySelector(".graph-dropdown");
          if (dropdown) {
            dropdown.dispatchEvent(new CustomEvent("action-activate"));
          }
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "open-civilopedia":
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onActiveDeviceTypeChanged(event) {
    this.navContainer?.classList.toggle("hidden", event.detail.gamepadActive);
  }
}
const EndGameScreenCategory = "EndgameScreen";
class EndGameScreenManager extends DisplayHandlerBase {
  endGameScreenElement = null;
  /** Track if we've already shown the end game screen to prevent redundant calls from edge cases
   *  For Example: Player gets defeated in MP but then the Age Ends for other players before they've transitioned out of the game
   */
  hasShownEndGameScreen = false;
  constructor() {
    super(EndGameScreenCategory, 4e3);
  }
  show(_request) {
    if (this.hasShownEndGameScreen == true) {
      console.warn(
        "screen-endgame: Attempted to push 'screen-endgame' element after it's already been pushed once"
      );
      return;
    }
    ContextManager.clear();
    this.endGameScreenElement ??= ContextManager.push("screen-endgame", {
      singleton: true,
      createMouseGuard: true,
      attributes: { shouldDarken: false }
    });
    this.hasShownEndGameScreen = true;
  }
  hide(_request, _options) {
    ContextManager.pop("screen-endgame");
    this.endGameScreenElement = null;
    this.hasShownEndGameScreen = false;
  }
}
Controls.define("screen-endgame", {
  createInstance: EndGameScreen,
  description: "End-game sequence",
  classNames: [
    "fullscreen",
    "flex",
    "flow-column",
    "justify-end",
    "items-stretch",
    "pointer-events-auto",
    "screen-endgame"
  ],
  styles: [styles]
});
const EndGameScreenManagerInstance = new EndGameScreenManager();
DisplayQueueManager.registerHandler(EndGameScreenManagerInstance);

export { EndGameScreenCategory, EndGameScreenManagerInstance as default };
//# sourceMappingURL=screen-endgame.js.map
