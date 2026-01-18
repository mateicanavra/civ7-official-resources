import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { V as VictoryProgress } from './model-victory-progress.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../cinematic/cinematic-manager.chunk.js';
import '../../../core/ui/interface-modes/interface-modes.js';
import '../endgame/screen-endgame.js';
import '../../../core/ui/tooltips/tooltip-manager.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-color.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../end-results/end-results.js';
import '../endgame/model-endgame.js';
import '../victory-manager/victory-manager.chunk.js';

const content = "<div class=\"victory-bg fixed inset-0 bg-no-repeat bg-cover\"></div>\r\n<fxs-frame\r\n\tclass=\"victory-progress h-full\"\r\n\tid=\"victory-progress-frame\"\r\n\tsubtitle=\"LOC_UI_AGE_SCORES_SUBTITLE\"\r\n\ttitle=\"LOC_UI_AGE_SCORES_TITLE\"\r\n>\r\n\t<div class=\"primary-window flow-column flex-auto items-center\"></div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/victory-progress/screen-victory-progress.css";

var VictoryProgressOpenTab = /* @__PURE__ */ ((VictoryProgressOpenTab2) => {
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["None"] = 0] = "None";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["LegacyPathsEconomic"] = 1] = "LegacyPathsEconomic";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["LegacyPathsMilitary"] = 2] = "LegacyPathsMilitary";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["LegacyPathsScience"] = 3] = "LegacyPathsScience";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["LegacyPathsCulture"] = 4] = "LegacyPathsCulture";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["RankingsOverView"] = 5] = "RankingsOverView";
  VictoryProgressOpenTab2[VictoryProgressOpenTab2["RankingsLegacyPoints"] = 6] = "RankingsLegacyPoints";
  return VictoryProgressOpenTab2;
})(VictoryProgressOpenTab || {});
class ScreenVictoryProgress extends Panel {
  closeButtonListener = this.close.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  topTabBarListener = this.onTopTabBarSelected.bind(this);
  victoryBarListener = this.onVictoryBarSelected.bind(this);
  topTabBar = null;
  topTabData = [
    { label: "LOC_VICTORY_PROGRESS_LEGACY_PROGRESS", id: "age-rankings-tab" },
    { label: "LOC_VICTORY_RANKINGS", id: "victory-points-tab" }
  ];
  topTabIndex = 0;
  ageRankTabBar = null;
  ageRankTabItems = [];
  // set onAttach based on which legacy paths are enabled
  ageRankTabIndex = 0;
  victoryTabBar = null;
  victoryTabItems = [
    { label: "LOC_VICTORY_PROGRESS_OVERVIEW", id: "overview" },
    { label: "LOC_VICTORY_PROGRESS_LEGACY_POINTS", id: "legacy-points" }
  ];
  victoryTabIndex = 0;
  goToEndGameOnClose = false;
  bgImageUrl = "";
  bgImageElement = null;
  advisorPanels = [];
  victoryPanels = [];
  onInitialize() {
    super.onInitialize();
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "victory-progress");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    const playerInfo = Configuration.getPlayer(GameContext.localPlayerID);
    const playerCiv = playerInfo.civilizationTypeName;
    const info = GameInfo.LoadingInfo_Civilizations.find((info2) => info2.CivilizationType === playerCiv);
    if (info && info.BackgroundImageHigh) {
      this.bgImageUrl = info.BackgroundImageHigh;
    }
    this.bgImageElement = MustGetElement(".victory-bg", this.Root);
    this.bgImageElement.style.backgroundImage = `url(${this.bgImageUrl})`;
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    frame.setAttribute("filigree-class", "mt-1");
    this.goToEndGameOnClose = false;
    const closeButton = document.createElement("fxs-close-button");
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      frame.appendChild(closeButton);
    } else {
      this.Root.appendChild(closeButton);
    }
    const enabledLegacyPaths = Players.get(GameContext.localPlayerID)?.LegacyPaths?.getEnabledLegacyPaths();
    if (enabledLegacyPaths != null) {
      for (const legacyPath of enabledLegacyPaths) {
        const legacyPathDef = GameInfo.LegacyPaths.lookup(legacyPath.legacyPath);
        switch (legacyPathDef?.LegacyPathClassType) {
          case "LEGACY_PATH_CLASS_SCIENCE":
            this.ageRankTabItems.push({
              label: "LOC_VICTORY_PROGRESS_SCIENCE_VICTORY",
              id: AdvisorTypes.SCIENCE.toString()
            });
            break;
          case "LEGACY_PATH_CLASS_CULTURE":
            this.ageRankTabItems.push({
              label: "LOC_VICTORY_PROGRESS_CULTURE_VICTORY",
              id: AdvisorTypes.CULTURE.toString()
            });
            break;
          case "LEGACY_PATH_CLASS_MILITARY":
            this.ageRankTabItems.push({
              label: "LOC_VICTORY_PROGRESS_MILITARY_VICTORY",
              id: AdvisorTypes.MILITARY.toString()
            });
            break;
          case "LEGACY_PATH_CLASS_ECONOMIC":
            this.ageRankTabItems.push({
              label: "LOC_VICTORY_PROGRESS_ECONOMIC_VICTORY",
              id: AdvisorTypes.ECONOMIC.toString()
            });
            break;
          default:
            break;
        }
      }
    }
    if (enabledLegacyPaths?.length == 0) {
      const primaryWindow = MustGetElement(".primary-window", this.Root);
      primaryWindow.appendChild(this.buildDisabledHTML());
      return;
    }
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.buildVictoryProgress();
    this.refreshScores();
    this.setOpeningTab();
    engine.synchronizeModels();
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.topTabBar?.removeEventListener("tab-selected", this.topTabBarListener);
    this.ageRankTabBar?.removeEventListener("tab-selected", this.onAgeRankingTabBarSelected.bind(this));
    this.victoryTabBar?.removeEventListener("tab-selected", this.victoryBarListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const enabledLegacyPaths = Players.get(GameContext.localPlayerID)?.LegacyPaths?.getEnabledLegacyPaths();
    if (enabledLegacyPaths && enabledLegacyPaths.length > 0) {
      NavTray.clear();
      this.updateNavTray();
      FocusManager.setFocus(this.advisorPanels[this.ageRankTabIndex]);
    } else {
      NavTray.addOrUpdateGenericBack();
      FocusManager.setFocus(MustGetElement(".progression_disabled-container", this.Root));
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  updateNavTray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    if (this.topTabIndex == 0) {
      const viewDetail = Locale.stylize("LOC_LEGACY_PATH_VIEW_DETAILS", "");
      NavTray.addOrUpdateShellAction2(viewDetail);
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  buildVictoryProgress() {
    const primaryWindow = MustGetElement(".primary-window", this.Root);
    const progressionHeader = this.buildHeader();
    const progressionContent = document.createElement("fxs-slot-group");
    progressionContent.classList.add(
      "progression_content-wrapper",
      "flow-column",
      "items-center",
      "flex-auto",
      "w-full"
    );
    const ageRankingContent = this.buildAgeRankingsContent();
    const victoryPointsContent = this.buildVictoryPointsContent();
    progressionContent.appendChild(ageRankingContent);
    progressionContent.appendChild(victoryPointsContent);
    primaryWindow.appendChild(progressionHeader);
    primaryWindow.appendChild(progressionContent);
  }
  buildHeader() {
    const progressionHeader = document.createElement("fxs-vslot");
    progressionHeader.classList.add("progression_header-wrapper", "w-full", "flow-column", "items-center", "pb-7");
    const progressionTitle = document.createElement("p");
    progressionTitle.classList.add(
      "font-title",
      "uppercase",
      "text-2xl",
      "bold",
      "text-center",
      "p-2\\.5",
      "fxs-header",
      "font-bold",
      "tracking-100"
    );
    progressionTitle.setAttribute("data-l10n-id", "LOC_UI_VICTORY_PROGRESS");
    this.topTabBar = document.createElement("fxs-tab-bar");
    this.topTabBar.classList.add("progression_nav", "w-full");
    this.topTabBar.setAttribute("tab-items", JSON.stringify(this.topTabData));
    this.topTabBar.addEventListener("tab-selected", this.topTabBarListener);
    this.topTabBar.setAttribute("tab-for", "fxs-vslot");
    progressionHeader.appendChild(progressionTitle);
    progressionHeader.appendChild(this.topTabBar);
    return progressionHeader;
  }
  buildDisabledHTML() {
    const pathsDisabledContainer = document.createElement("div");
    pathsDisabledContainer.classList.add("progression_disabled-container", "size-full");
    pathsDisabledContainer.setAttribute("tabindex", "-1");
    const progressionHeader = document.createElement("fxs-vslot");
    progressionHeader.classList.add("progression_header-wrapper", "w-full", "flow-column", "items-center", "pb-7");
    const progressionTitle = document.createElement("p");
    progressionTitle.classList.add(
      "font-title",
      "uppercase",
      "text-2xl",
      "bold",
      "text-center",
      "p-2\\.5",
      "fxs-header",
      "text-secondary"
    );
    progressionTitle.setAttribute("data-l10n-id", "LOC_UI_VICTORY_PROGRESS");
    this.topTabBar = document.createElement("fxs-tab-bar");
    this.topTabBar.classList.add("progression_nav", "w-full");
    const tabItems = [];
    tabItems.push({ label: "LOC_VICTORY_PROGRESS_LEGACY_PATHS_DISABLED", id: "(9)" });
    this.topTabBar.setAttribute("tab-items", JSON.stringify(tabItems));
    progressionHeader.appendChild(progressionTitle);
    progressionHeader.appendChild(this.topTabBar);
    const bodyContent = document.createElement("div");
    bodyContent.classList.add("flex-auto", "flex", "items-center", "justify-center");
    const pathsDisabledWarning = document.createElement("div");
    pathsDisabledWarning.classList.add(
      "bg-primary-3",
      "border-2",
      "border-primary",
      "flex",
      "items-center",
      "mb-8",
      "px-2",
      "w-200"
    );
    const pathsDisabledWarningImage = document.createElement("div");
    pathsDisabledWarningImage.classList.add("img-unit-badge-warning", "size-14", "mr-3");
    pathsDisabledWarning.appendChild(pathsDisabledWarningImage);
    const pathsDisabledWarningText = document.createElement("div");
    pathsDisabledWarningText.setAttribute("data-l10n-id", "LOC_VICTORY_PROGRESS_LEGACY_PATHS_DISABLED_INFO");
    pathsDisabledWarningText.classList.add("my-3", "text-center", "flex-auto");
    pathsDisabledWarning.appendChild(pathsDisabledWarningText);
    bodyContent.appendChild(pathsDisabledWarning);
    pathsDisabledContainer.appendChild(progressionHeader);
    pathsDisabledContainer.appendChild(bodyContent);
    return pathsDisabledContainer;
  }
  buildAgeRankingsContent() {
    const ageRankingContent = document.createElement("div");
    ageRankingContent.classList.add("progression_age-ranking-content", "flow-column", "w-full", "flex-auto");
    ageRankingContent.setAttribute("tabindex", "-1");
    ageRankingContent.id = "age-rankings-tab";
    const tabWrapper = document.createElement("fxs-vslot");
    tabWrapper.classList.add("age-rank_tab-wrapper");
    this.ageRankTabBar = document.createElement("fxs-tab-bar");
    this.ageRankTabBar.classList.add("progression_ranking-nav", "font-extralight", "h-12", "w-full", "self-center");
    this.ageRankTabBar.setAttribute("tab-items", JSON.stringify(this.ageRankTabItems));
    this.ageRankTabBar.setAttribute("tab-style", "flat");
    this.ageRankTabBar.setAttribute("alt-controls", "true");
    this.ageRankTabBar.setAttribute("tab-for", "fxs-vslot");
    this.ageRankTabBar.addEventListener("tab-selected", this.onAgeRankingTabBarSelected.bind(this));
    tabWrapper.appendChild(this.ageRankTabBar);
    const ageRankSlot = document.createElement("fxs-slot-group");
    ageRankSlot.classList.add("age-rank-slot", "flow-column", "items-center", "w-full", "flex-auto");
    for (const advisor of this.ageRankTabItems) {
      const panelAgeRanking = document.createElement("panel-advisor-victory");
      panelAgeRanking.setAttribute("tabindex", "-1");
      panelAgeRanking.setAttribute("advisor-type", advisor.id);
      panelAgeRanking.classList.add("flex");
      panelAgeRanking.id = advisor.id;
      this.advisorPanels.push(panelAgeRanking);
      ageRankSlot.appendChild(panelAgeRanking);
    }
    ageRankingContent.appendChild(tabWrapper);
    ageRankingContent.appendChild(ageRankSlot);
    return ageRankingContent;
  }
  buildVictoryPointsContent() {
    const victoryContent = document.createElement("div");
    victoryContent.classList.add("progression__victory-content", "flow-column", "w-full", "flex-auto");
    victoryContent.setAttribute("tabindex", "-1");
    victoryContent.id = "victory-points-tab";
    const tabWrapper = document.createElement("fxs-vslot");
    tabWrapper.classList.add("age-rank_tab-wrapper");
    this.victoryTabBar = document.createElement("fxs-tab-bar");
    this.victoryTabBar.classList.add("progression_ranking-nav", "font-extralight", "h-12", "w-full", "self-center");
    this.victoryTabBar.setAttribute("tab-items", JSON.stringify(this.victoryTabItems));
    this.victoryTabBar.setAttribute("tab-style", "flat");
    this.victoryTabBar.setAttribute("alt-controls", "true");
    this.victoryTabBar.setAttribute("tab-for", "fxs-vslot");
    this.victoryTabBar.addEventListener("tab-selected", this.victoryBarListener);
    tabWrapper.appendChild(this.victoryTabBar);
    const victorySlot = document.createElement("fxs-slot-group");
    victorySlot.classList.add("victory-slot", "flow-column", "items-center", "w-full", "flex-auto");
    const overviewContent = document.createElement("div");
    overviewContent.id = "overview";
    overviewContent.classList.add("overview__tab-wrapper", "flow-column", "justify-center", "w-full");
    overviewContent.setAttribute("tabindex", "-1");
    const overViewMilstoneProgress = document.createElement("panel-age-rankings");
    overViewMilstoneProgress.classList.add("flex", "justify-center", "item-center");
    overviewContent.appendChild(overViewMilstoneProgress);
    this.victoryPanels.push(overViewMilstoneProgress);
    const legacyPointsContent = document.createElement("div");
    legacyPointsContent.classList.add(
      "legacy-points__tab-wrapper",
      "flow-column",
      "justify-center",
      "w-full",
      "mt-18"
    );
    legacyPointsContent.setAttribute("tabindex", "-1");
    legacyPointsContent.id = "legacy-points";
    const legacyPoint = document.createElement("panel-victory-points");
    legacyPointsContent.appendChild(legacyPoint);
    this.victoryPanels.push(legacyPoint);
    victorySlot.appendChild(overviewContent);
    victorySlot.appendChild(legacyPointsContent);
    victoryContent.appendChild(tabWrapper);
    victoryContent.appendChild(victorySlot);
    return victoryContent;
  }
  onTopTabBarSelected(event) {
    const slotGroup = MustGetElement(".progression_content-wrapper", this.Root);
    slotGroup.setAttribute("selected-slot", event.detail.selectedItem.id);
  }
  onAgeRankingTabBarSelected(event) {
    const slotGroup = MustGetElement(".age-rank-slot", this.Root);
    this.setBackgroundImage(event.detail.selectedItem.id);
    slotGroup.setAttribute("selected-slot", event.detail.selectedItem.id);
    VictoryProgress.updateAdvisorVictoryTab = Number(event.detail.selectedItem.id);
  }
  onVictoryBarSelected(event) {
    const slotGroup = MustGetElement(".victory-slot", this.Root);
    slotGroup.setAttribute("selected-slot", event.detail.selectedItem.id);
  }
  setBackgroundImage(advisorType) {
    if (!this.bgImageElement) {
      console.error("screen-victory-progress: failed to find .victory-bg");
      return;
    }
    this.bgImageUrl = VictoryProgress.getBackdropByAdvisorType(advisorType);
    this.bgImageElement.style.backgroundImage = `url(${this.bgImageUrl})`;
  }
  setPanelOptions(options) {
    const traditionsOptions = options;
    if (traditionsOptions.openTab) {
      let slotGroup = void 0;
      switch (traditionsOptions.openTab) {
        case 4 /* LegacyPathsCulture */:
          slotGroup = MustGetElement(".age-rank-slot", this.Root);
          slotGroup.setAttribute("selected-slot", AdvisorTypes.CULTURE.toString());
          MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "3");
          break;
        case 1 /* LegacyPathsEconomic */:
          break;
        case 2 /* LegacyPathsMilitary */:
          slotGroup = MustGetElement(".age-rank-slot", this.Root);
          slotGroup.setAttribute("selected-slot", AdvisorTypes.MILITARY.toString());
          MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "1");
          break;
        case 3 /* LegacyPathsScience */:
          slotGroup = MustGetElement(".age-rank-slot", this.Root);
          slotGroup.setAttribute("selected-slot", AdvisorTypes.SCIENCE.toString());
          MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "2");
          break;
        case 5 /* RankingsOverView */:
          slotGroup = MustGetElement(".progression_content-wrapper", this.Root);
          slotGroup.setAttribute("selected-slot", "victory-points-tab");
          MustGetElement(".progression_nav", this.Root).setAttribute("selected-tab-index", "1");
          this.topTabIndex = 1;
          this.updateNavTray();
          FocusManager.setFocus(this.victoryPanels[0]);
          break;
        default:
          break;
      }
    }
  }
  refreshScores() {
    VictoryProgress.update();
    const victoryFrame = this.Root.querySelector("#victory-progress-frame");
    if (victoryFrame) {
      const ageHash = Game.age;
      const ageObject = GameInfo.Ages.lookup(ageHash);
      if (ageObject) {
        victoryFrame.setAttribute("title", Locale.compose(ageObject.Name));
      }
    }
  }
  close() {
    super.close();
    if (this.goToEndGameOnClose) {
      DisplayQueueManager.add({ category: "EndgameScreen" });
    }
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
      Audio.playSound("data-audio-tab-selected");
    }
  }
  setOpeningTab() {
    let slotGroup = void 0;
    switch (VictoryProgress.advisorVictoryTab) {
      case AdvisorTypes.CULTURE:
        slotGroup = MustGetElement(".age-rank-slot", this.Root);
        slotGroup.setAttribute("selected-slot", AdvisorTypes.CULTURE.toString());
        MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "0");
        this.ageRankTabIndex = 0;
        break;
      case AdvisorTypes.MILITARY:
        slotGroup = MustGetElement(".age-rank-slot", this.Root);
        slotGroup.setAttribute("selected-slot", AdvisorTypes.MILITARY.toString());
        MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "1");
        this.ageRankTabIndex = 1;
        break;
      case AdvisorTypes.SCIENCE:
        slotGroup = MustGetElement(".age-rank-slot", this.Root);
        slotGroup.setAttribute("selected-slot", AdvisorTypes.SCIENCE.toString());
        MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "2");
        this.ageRankTabIndex = 2;
        break;
      case AdvisorTypes.ECONOMIC:
        slotGroup = MustGetElement(".age-rank-slot", this.Root);
        slotGroup.setAttribute("selected-slot", AdvisorTypes.ECONOMIC.toString());
        MustGetElement(".progression_ranking-nav", this.Root).setAttribute("selected-tab-index", "3");
        this.ageRankTabIndex = 3;
        break;
      default:
        break;
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (!this.topTabBar || !this.ageRankTabBar || !this.victoryTabBar) {
      console.error("screen-victory-progress: handleNavigation(): Failed to find topTabBar or ageRankBar");
      return false;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.PREVIOUS:
      case InputNavigationAction.NEXT: {
        let selectedIndex = this.topTabIndex;
        selectedIndex = direction === InputNavigationAction.PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
        if (selectedIndex >= this.topTabData.length) {
          this.topTabIndex = 0;
        } else if (selectedIndex < 0) {
          this.topTabIndex = this.topTabData.length - 1;
        } else {
          this.topTabIndex = selectedIndex;
        }
        this.updateNavTray();
        this.topTabBar.setAttribute("selected-tab-index", `${this.topTabIndex}`);
        if (this.topTabIndex == 1) {
          FocusManager.setFocus(this.victoryPanels[this.victoryTabIndex]);
        }
        if (this.topTabIndex == 0) {
          FocusManager.setFocus(this.advisorPanels[this.ageRankTabIndex]);
        }
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        live = false;
        break;
      }
      case InputNavigationAction.SHELL_NEXT:
      case InputNavigationAction.SHELL_PREVIOUS: {
        if (this.topTabIndex === 0) {
          let selectedIndex = this.ageRankTabIndex;
          selectedIndex = direction === InputNavigationAction.SHELL_PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          if (selectedIndex >= this.ageRankTabItems.length) {
            this.ageRankTabIndex = 0;
          } else if (selectedIndex < 0) {
            this.ageRankTabIndex = this.ageRankTabItems.length - 1;
          } else {
            this.ageRankTabIndex = selectedIndex;
          }
          this.ageRankTabBar.setAttribute("selected-tab-index", `${this.ageRankTabIndex}`);
        } else if (this.topTabIndex === 1) {
          let selectedIndex = this.victoryTabIndex;
          selectedIndex = direction === InputNavigationAction.SHELL_PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          if (selectedIndex >= this.victoryTabItems.length) {
            this.victoryTabIndex = 0;
          } else if (selectedIndex < 0) {
            this.victoryTabIndex = this.victoryTabItems.length - 1;
          } else {
            this.victoryTabIndex = selectedIndex;
          }
          this.updateNavTray();
          this.victoryTabBar.setAttribute("selected-tab-index", `${this.victoryTabIndex}`);
          FocusManager.setFocus(this.victoryPanels[this.victoryTabIndex]);
          navigationEvent.preventDefault();
          navigationEvent.stopImmediatePropagation();
        }
        live = false;
        break;
      }
    }
    return live;
  }
}
Controls.define("screen-victory-progress", {
  createInstance: ScreenVictoryProgress,
  description: "Screen showing the victory progress.",
  classNames: ["screen-victory-progress", "fullscreen", "self-center", "pointer-events-auto"],
  styles: [styles],
  innerHTML: [content]
});

export { VictoryProgressOpenTab };
//# sourceMappingURL=screen-victory-progress.js.map
