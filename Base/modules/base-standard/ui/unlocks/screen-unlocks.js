import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import PopupSequencer from '../popup-sequencer/popup-sequencer.js';
import PlayerUnlocks from './model-unlocks.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';

const content = "<div class=\"player-unlocks-background-container fixed inset-0 w-full h-full\">\r\n\t<div class=\"main-background-image fixed w-full h-full bg-cover\"></div>\r\n\t<div class=\"main-background-gradient fixed w-full h-full\"></div>\r\n\t<div class=\"player-unlocks-gradient-overlay fixed w-full h-full opacity-85\"></div>\r\n</div>\r\n<div class=\"ageless-background-container fixed inset-0 w-full h-full hidden\">\r\n\t<div class=\"ageless-background-image fixed w-full h-full bg-cover\"></div>\r\n\t<div class=\"ageless-background-gradient fixed w-full h-full\"></div>\r\n</div>\r\n<fxs-frame\r\n\tclass=\"player-unlock\"\r\n\toverride-styling=\"relative flex max-w-full max-h-full pt-8 px-10\"\r\n>\r\n\t<div class=\"primary-window flow-column flex-auto items-center mx-24\"></div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/unlocks/screen-unlocks.css";

class ScreenUnlocks extends Panel {
  closeButtonListener = this.askForClose.bind(this);
  playerUnlockChangedListener = this.onPlayerUnlockChanged.bind(this);
  playerUnlockProgressChangedListener = this.onPlayerUnlockProgressChanged.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  tabBarListener = this.onTabBarSelected.bind(this);
  civShowDetailsListener = this.onShowDetailActivate.bind(this);
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  refreshHandle = 0;
  refreshCallback = () => {
    this.onRefresh();
  };
  playerUnlockContent = document.createElement("fxs-slot-group");
  civUnlockScrollSlots = null;
  showAllRequirements = false;
  extraRequirements = [];
  showAllRequirementsCheckbox = document.createElement("fxs-checkbox");
  showDetailsText = document.createElement("h3");
  agelessBackgroundImage = null;
  agelessBackgroundContainer = null;
  availableUnlockItems = [];
  ageChronology = /* @__PURE__ */ new Map();
  curAgeChrono;
  lastAgeChrono;
  lastAgeTabItems = [
    { label: "LOC_UI_PLAYER_UNLOCKS_CIVILIZATIONS", id: "civilizations", disabled: true },
    { label: "LOC_VICTORY_PROGRESS_REWARDS", id: "rewards", disabled: true },
    { label: "LOC_UI_PLAYER_UNLOCKS_AGELESS", id: "ageless" }
  ];
  tabItems = [
    { label: "LOC_UI_PLAYER_UNLOCKS_CIVILIZATIONS", id: "civilizations" },
    { label: "LOC_VICTORY_PROGRESS_REWARDS", id: "rewards" },
    { label: "LOC_UI_PLAYER_UNLOCKS_AGELESS", id: "ageless" }
  ];
  tabBar = document.createElement("fxs-tab-bar");
  constructor(root) {
    super(root);
    let maxAgeChrono = -1;
    for (const e of GameInfo.Ages) {
      this.ageChronology.set(e.AgeType, e.ChronologyIndex);
      if (e.ChronologyIndex > maxAgeChrono) {
        maxAgeChrono = e.ChronologyIndex;
      }
    }
    this.curAgeChrono = GameInfo.Ages.lookup(Game.age)?.ChronologyIndex ?? -1;
    this.lastAgeChrono = maxAgeChrono;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    const primaryWindow = MustGetElement(".primary-window", this.Root);
    if (!primaryWindow) {
      console.error("screen-unlocks: buildHeader(): Failed to find primary-window");
      return;
    }
    const agelessBackgroundImageURL = this.getAgelessPageBackground();
    this.agelessBackgroundContainer = MustGetElement(".ageless-background-container", this.Root);
    this.agelessBackgroundImage = MustGetElement(".ageless-background-image", this.Root);
    this.agelessBackgroundImage.style.backgroundImage = `url(${agelessBackgroundImageURL})`;
    this.playerUnlockContent.classList.add("unlock-content-wrapper", "flow-column", "h-full", "w-full", "shrink");
    const civUnlocksPage = this.buildCivUnlocksPage();
    this.playerUnlockContent.appendChild(civUnlocksPage);
    const panelPlayerRewards = document.createElement("panel-player-rewards");
    panelPlayerRewards.id = "rewards";
    this.playerUnlockContent.appendChild(panelPlayerRewards);
    const agelessPage = this.buildAgelessPage();
    this.playerUnlockContent.appendChild(agelessPage);
    primaryWindow.appendChild(this.buildHeader());
    primaryWindow.appendChild(this.playerUnlockContent);
    engine.on("PlayerUnlockChanged", this.playerUnlockChangedListener);
    engine.on("PlayerUnlockProgressChanged", this.playerUnlockProgressChangedListener);
    const uiViewExperience = UI.getViewExperience();
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    const closeButton = document.createElement("fxs-close-button");
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    closeButton.classList.add("top-1", "right-1");
    if (uiViewExperience == UIViewExperience.Mobile) {
      frame.appendChild(closeButton);
    } else {
      this.Root.appendChild(closeButton);
    }
    Databind.classToggle(this.showAllRequirementsCheckbox, "hidden", `g_NavTray.isTrayRequired`);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
  }
  onDetach() {
    engine.off("PlayerUnlockChanged", this.playerUnlockChangedListener);
    engine.off("PlayerUnlockProgressChanged", this.playerUnlockProgressChangedListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    const selectedSlot = this.playerUnlockContent.getAttribute("selected-slot");
    switch (selectedSlot) {
      case "civilizations":
        FocusManager.setFocus(MustGetElement(".screen-unlocks-content-root", this.Root));
        break;
      case "rewards":
        FocusManager.setFocus(MustGetElement("panel-player-rewards", this.Root));
        break;
      case "ageless":
        FocusManager.setFocus(MustGetElement(".ageless-scrollable-content", this.Root));
        break;
      default:
        break;
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  setPanelOptions(options) {
    if (this.tabBar) {
      const pageToShowIndex = this.tabItems.findIndex((tab) => tab.id == options.navigateToPage);
      if (pageToShowIndex != -1) {
        this.tabBar.setAttribute("selected-tab-index", `${pageToShowIndex}`);
      }
    } else {
      console.error("screen-advanced-start: couldn't find adv-start__header-title and/or adv-start__subtext");
    }
  }
  clearList(root) {
    let child = null;
    while (child = root.lastChild) {
      root.removeChild(child);
    }
  }
  buildHeader() {
    const progressionHeader = document.createElement("div");
    progressionHeader.classList.add("unlocks_header-wrapper", "w-full", "flow-column", "items-center", "pb-7");
    const progressionTitle = document.createElement("p");
    progressionTitle.classList.add(
      "font-title",
      "uppercase",
      "text-2xl",
      "font-bold",
      "text-center",
      "fxs-header",
      "p-2\\.5",
      "tracking-100"
    );
    progressionTitle.setAttribute("data-l10n-id", "LOC_UI_PLAYER_UNLOCKS_TITLE");
    const isLastAge = this.curAgeChrono === this.lastAgeChrono;
    const tabIndex = isLastAge ? 2 : 0;
    const tabItems = isLastAge ? this.lastAgeTabItems : this.tabItems;
    const tabId = tabItems[tabIndex].id;
    this.tabBar.classList.add("unlock__nav", "w-200");
    this.tabBar.setAttribute("tab-items", JSON.stringify(tabItems));
    this.tabBar.setAttribute("selected-tab-index", tabIndex.toString());
    this.tabBar.setAttribute("data-audio-group-ref", "audio-screen-unlocks");
    this.tabBar.setAttribute("data-audio-tab-selected", "unlocks-tab-select");
    this.tabBar.setAttribute("data-audio-focus-ref", "none");
    this.tabBar.addEventListener("tab-selected", this.tabBarListener);
    this.playerUnlockContent.setAttribute("selected-slot", tabId);
    progressionHeader.appendChild(progressionTitle);
    progressionHeader.appendChild(this.tabBar);
    return progressionHeader;
  }
  buildCivUnlocksPage() {
    const civUnlockPage = document.createElement("fxs-vslot");
    civUnlockPage.classList.add("unlock__civilizations-content", "flow-column", "w-full", "h-full", "items-center");
    civUnlockPage.id = "civilizations";
    const civUnlockText = document.createElement("p");
    civUnlockText.classList.add("text-base", "font-body", "w-full", "text-center", "mb-2");
    civUnlockText.innerHTML = Locale.compose("LOC_UI_PLAYER_UNLOCKS_COMPLETE_LISTED_REQUIREMENTS_CIVILIZATIONS");
    const showRequirementsWrapper = document.createElement("div");
    showRequirementsWrapper.classList.add(
      "unlock__show-requirements-wrapper",
      "flow-row",
      "items-center",
      "justify-end",
      "w-full"
    );
    this.showAllRequirementsCheckbox.setAttribute("selected", `${this.showAllRequirements}`);
    this.showAllRequirementsCheckbox.classList.add("unlock__checkbox", "ml-4");
    this.showAllRequirementsCheckbox.addEventListener("action-activate", this.civShowDetailsListener);
    this.showDetailsText.classList.add("font-body-sm", "uppercase", "tracking-150", "pointer-events-auto");
    this.showDetailsText.setAttribute("data-l10n-id", "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS");
    showRequirementsWrapper.appendChild(this.showDetailsText);
    showRequirementsWrapper.appendChild(this.showAllRequirementsCheckbox);
    const showRequirementsNavHelp = document.createElement("fxs-nav-help");
    showRequirementsNavHelp.setAttribute("action-key", "inline-shell-action-2");
    showRequirementsNavHelp.classList.add("ml-1");
    showRequirementsWrapper.appendChild(showRequirementsNavHelp);
    const civUnlockScrollable = document.createElement("fxs-scrollable");
    civUnlockScrollable.setAttribute("handle-gamepad-pan", "true");
    civUnlockScrollable.classList.add("screen-unlock-civilizations-scrollable", "w-full", "shrink", "px-4", "py-6");
    this.civUnlockScrollSlots = document.createElement("fxs-vslot");
    this.civUnlockScrollSlots.classList.add("screen-unlocks-content-root", "flex", "flow-column");
    this.populateCivList(this.civUnlockScrollSlots);
    civUnlockScrollable.appendChild(this.civUnlockScrollSlots);
    civUnlockPage.appendChild(civUnlockText);
    civUnlockPage.appendChild(showRequirementsWrapper);
    civUnlockPage.appendChild(civUnlockScrollable);
    return civUnlockPage;
  }
  buildAgelessPage() {
    const uiViewExperience = UI.getViewExperience();
    const agelessPage = document.createElement("fxs-vslot");
    agelessPage.classList.add("unlock__ageless-content", "flow-column", "h-full");
    agelessPage.id = "ageless";
    const agelessDescription = document.createElement("p");
    agelessDescription.classList.add("text-base", "font-body", "w-full", "text-center", "mb-6");
    agelessDescription.innerHTML = Locale.compose("LOC_UI_PLAYER_UNLOCKS_VIEW_AGELESS_ITEMS");
    const agelessContentWrapper = document.createElement("div");
    agelessContentWrapper.classList.add("w-full", "flow-row", "shrink");
    const leftSideScrollable = document.createElement("div");
    leftSideScrollable.classList.add("ageless-scrollable-wrapper");
    leftSideScrollable.classList.toggle("pb-3", uiViewExperience == UIViewExperience.Mobile);
    const agelessScrollable = document.createElement("fxs-scrollable");
    agelessScrollable.setAttribute("handle-gamepad-pan", "true");
    const agelessScrollSlot = document.createElement("fxs-vslot");
    agelessScrollSlot.classList.add("ageless-scrollable-content", "mr-12", "pt-13");
    this.populateAgeless(agelessScrollSlot);
    agelessScrollable.appendChild(agelessScrollSlot);
    leftSideScrollable.appendChild(agelessScrollable);
    const rightSideDetails = document.createElement("div");
    agelessContentWrapper.appendChild(leftSideScrollable);
    agelessContentWrapper.appendChild(rightSideDetails);
    agelessPage.appendChild(agelessDescription);
    agelessPage.appendChild(agelessContentWrapper);
    return agelessPage;
  }
  getAgelessPageBackground() {
    const gameConfig = Configuration.getGame();
    const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
    if (!gameConfig || !playerConfig) {
      return "";
    }
    const civTypeName = playerConfig.civilizationTypeName;
    if (civTypeName) {
      const civilizationInfos = GameInfo.LoadingInfo_Civilizations.filter((info) => {
        return info.CivilizationType == civTypeName;
      });
      if (civilizationInfos.length > 0) {
        const civilizationImagePath = window.innerWidth >= Layout.pixelsToScreenPixels(1080) ? civilizationInfos[0].BackgroundImageHigh : civilizationInfos[0].BackgroundImageLow;
        if (civilizationImagePath) {
          return civilizationImagePath;
        }
        return "";
      }
    }
    return "";
  }
  populateCivList(root) {
    this.clearList(root);
    this.extraRequirements = [];
    const civUnlocks = GameInfo.UnlockRewards.filter((reward) => reward.UnlockRewardKind == "KIND_CIVILIZATION");
    civUnlocks.sort((a, b) => Locale.compare(a.Description ?? "", b.Description ?? ""));
    for (const reward of civUnlocks) {
      if (reward.UnlockRewardType == null) {
        continue;
      }
      const civId = reward.UnlockRewardType;
      const civAge = GameInfo.LegacyCivilizations.find((c) => c.CivilizationType == civId)?.Age ?? "";
      const civChrono = this.ageChronology.get(civAge) ?? this.lastAgeChrono;
      if (this.curAgeChrono >= civChrono) {
        continue;
      }
      const state = Game.Unlocks.getProgressForPlayer(reward.UnlockType, GameContext.localPlayerID);
      const fragment = document.createDocumentFragment();
      const uiViewExperience = UI.getViewExperience();
      const unlocksItem = document.createElement("fxs-activatable");
      unlocksItem.classList.add(
        "screen-unlocks__item",
        "flow-row",
        "flex-auto",
        "min-h-32",
        "w-full",
        "my-1",
        "bg-primary",
        "justify-between",
        "bg-center",
        "relative",
        "bg-cover",
        "group"
      );
      unlocksItem.setAttribute("data-audio-group-ref", "audio-screen-unlocks");
      unlocksItem.setAttribute("data-audio-activate-ref", "data-audio-activate");
      unlocksItem.setAttribute("tabindex", "-1");
      this.availableUnlockItems.push(unlocksItem);
      const unlockDetailWrapper = document.createElement("div");
      unlockDetailWrapper.classList.add("icon-text-container", "flex", "w-1\\/2", "items-center");
      const unlockIcon = document.createElement("img");
      unlockIcon.classList.add("civilization-icon");
      unlockIcon.classList.toggle("p-5", uiViewExperience != UIViewExperience.Mobile);
      unlockIcon.classList.toggle("p-2", uiViewExperience == UIViewExperience.Mobile);
      unlockIcon.classList.toggle("size-32", uiViewExperience == UIViewExperience.Mobile);
      if (reward.Icon && UI.getIconURL(reward.Icon)) {
        unlockIcon.src = UI.getIconURL(reward.Icon);
      } else {
        unlockIcon.src = "fs://game/icon_unlock.png";
      }
      if (reward.Icon) {
        unlocksItem.style.backgroundImage = UI.getIconCSS(reward.Icon, "BACKGROUND");
      }
      const backgroundOverlay = document.createElement("div");
      backgroundOverlay.classList.add("unlock-frame", "absolute", "w-full", "h-full", "opacity-70");
      unlocksItem.appendChild(backgroundOverlay);
      const backgroundOverlayHover = document.createElement("div");
      backgroundOverlayHover.classList.add(
        "unlock-frame-hover",
        "absolute",
        "w-full",
        "h-full",
        "opacity-0",
        "group-hover\\:opacity-100",
        "group-focus\\:opacity-100"
      );
      backgroundOverlayHover.setAttribute("tabindex", "-1");
      unlocksItem.appendChild(backgroundOverlayHover);
      const contentWrapper = document.createElement("fxs-hslot");
      contentWrapper.classList.add("unlock-content-wrapper", "w-full", "h-full", "justify-between");
      unlocksItem.appendChild(contentWrapper);
      const unlocksItemTitle = document.createElement("div");
      unlocksItemTitle.classList.add("font-title", "text-lg");
      unlocksItemTitle.setAttribute("data-l10n-id", reward.Name);
      const unlockItemDescription = document.createElement("div");
      unlockItemDescription.classList.add("font-body", "text-base");
      unlockItemDescription.setAttribute("data-l10n-id", reward.Description || "");
      const unlockTextWrapper = document.createElement("div");
      unlockTextWrapper.classList.add("unlock-item-text-wrapper", "flow-column", "items-start", "shrink");
      unlockTextWrapper.appendChild(unlocksItemTitle);
      unlockTextWrapper.appendChild(unlockItemDescription);
      unlockDetailWrapper.appendChild(unlockIcon);
      unlockDetailWrapper.appendChild(unlockTextWrapper);
      contentWrapper.appendChild(unlockDetailWrapper);
      const requirements = GameInfo.UnlockRequirements.filter((req) => req.UnlockType == reward.UnlockType);
      const noCivUnlocks = Configuration.getGame().isNoCivilizationUnlocks;
      if (noCivUnlocks || requirements.length > 0) {
        const unlocksItemRequirements = document.createElement("fxs-vslot");
        unlocksItemRequirements.classList.add(
          "unlock-requirements",
          "justify-center",
          "font-body",
          "text-sm",
          "items-end",
          "w-1\\/2",
          "p-2"
        );
        if (noCivUnlocks) {
          const requirementTextContainer = document.createElement("fxs-hslot");
          requirementTextContainer.classList.add(
            "requirement-text-container",
            "items-center",
            "justify-end",
            "w-full"
          );
          requirementTextContainer.setAttribute("data-l10n-id", "LOC_UNLOCK_NO_CIVILIZATION_UNLOCKS");
          const completedCheck = document.createElement("img");
          completedCheck.classList.add("size-6", "ml-1");
          completedCheck.setAttribute("src", "shell_circle-checkmark");
          requirementTextContainer.appendChild(completedCheck);
          unlocksItemRequirements.appendChild(requirementTextContainer);
        }
        requirements.forEach((r) => {
          if (r.Description) {
            const requirementTextContainer = document.createElement("fxs-hslot");
            requirementTextContainer.classList.add(
              "requirement-text-container",
              "items-center",
              "justify-end",
              "w-full"
            );
            const p = state?.progress.find((p2) => p2.requirementSetId == r.RequirementSetId);
            if (p && (p.state == RequirementState.AlwaysMet || p.state == RequirementState.Met)) {
              requirementTextContainer.innerHTML = Locale.stylize(r.Description);
              const completedCheck = document.createElement("img");
              completedCheck.classList.add("size-6", "ml-1");
              completedCheck.setAttribute("src", "shell_circle-checkmark");
              requirementTextContainer.appendChild(completedCheck);
              unlocksItemRequirements.appendChild(requirementTextContainer);
            } else if (p && p.state == RequirementState.NeverMet) {
              requirementTextContainer.classList.add("extra-requirement", "hidden");
              requirementTextContainer.innerHTML = Locale.stylize(r.Description);
              unlocksItemRequirements.appendChild(requirementTextContainer);
              const completedCheck = document.createElement("img");
              completedCheck.classList.add("size-6", "ml-1", "opacity-0");
              completedCheck.setAttribute("src", "shell_circle-checkmark");
              requirementTextContainer.appendChild(completedCheck);
              unlocksItemRequirements.appendChild(requirementTextContainer);
              this.extraRequirements.push(requirementTextContainer);
            } else {
              requirementTextContainer.innerHTML = Locale.stylize(r.Description);
              unlocksItemRequirements.appendChild(requirementTextContainer);
              const completedCheck = document.createElement("img");
              completedCheck.classList.add("size-6", "ml-1", "opacity-0");
              completedCheck.setAttribute("src", "shell_circle-checkmark");
              requirementTextContainer.appendChild(completedCheck);
              unlocksItemRequirements.appendChild(requirementTextContainer);
            }
          }
        });
        contentWrapper.appendChild(unlocksItemRequirements);
      }
      fragment.appendChild(unlocksItem);
      root.appendChild(fragment);
    }
  }
  buildAgelessHeader(loc, collapseItems) {
    const headerContainer = document.createElement("div");
    headerContainer.classList.value = "screen-unlock__ageless-header flex flex-col relative items-center mb-4 pointer-events-none";
    const headerTextContainer = document.createElement("div");
    headerTextContainer.classList.value = "ageless-item-header-text-container flex flex-col items-center grow";
    const headerText = document.createElement("p");
    headerText.classList.value = "ageless-item-header-text fxs-header font-title text-base uppercase";
    headerText.innerHTML = loc;
    const filigree = document.createElement("img");
    filigree.src = "fs://game/shell_small-filigree.png";
    filigree.classList.add("h-4", "w-84", "mt-1");
    headerTextContainer.appendChild(headerText);
    headerTextContainer.appendChild(filigree);
    const textMinusPlusContainer = document.createElement("div");
    textMinusPlusContainer.classList.value = "text-minus-plus-container w-full flex items-center";
    textMinusPlusContainer.appendChild(headerTextContainer);
    const toggle = document.createElement("fxs-minus-plus");
    toggle.setAttribute("type", "minus");
    toggle.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
    toggle.setAttribute("tabindex", "-1");
    toggle.addEventListener("action-activate", () => {
      this.collapseAgelessSection(toggle, collapseItems);
    });
    textMinusPlusContainer.appendChild(toggle);
    headerContainer.appendChild(textMinusPlusContainer);
    return headerContainer;
  }
  buildAgelessItem(name, description, icon, type, tooltipStyle) {
    const unlocksItem = document.createElement("div");
    unlocksItem.role = "paragraph";
    unlocksItem.classList.add("screen-unlocks__ageless-item", "flex", "mb-6", "relative", "pointer-events-auto");
    this.availableUnlockItems.push(unlocksItem);
    const unlocksItemTitle = document.createElement("p");
    unlocksItemTitle.classList.add(
      "screen-unlocks__ageless-item-title",
      "font-title",
      "text-base",
      "uppercase",
      "pl-2",
      "relative",
      "shrink",
      "grow"
    );
    const unlocksItemNameContainer = document.createElement("div");
    unlocksItemNameContainer.classList.add("screen-unlocks__ageless-item-name-container", "flex", "flex-row");
    unlocksItemTitle.appendChild(unlocksItemNameContainer);
    const unlocksItemName = document.createElement("p");
    unlocksItemName.classList.add("screen-unlocks__ageless-item-name", "flex", "grow");
    unlocksItemName.innerHTML = `${Locale.compose(name)}`;
    unlocksItemNameContainer.appendChild(unlocksItemName);
    if (type) {
      unlocksItem.setAttribute("data-type", type);
    }
    if (tooltipStyle) {
      unlocksItem.setAttribute("data-tooltip-style", tooltipStyle);
    }
    if (description) {
      const unlockItemDescription = document.createElement("div");
      unlockItemDescription.classList.add("font-body", "text-xs", "normal-case", "mr-8");
      unlockItemDescription.innerHTML = `${Locale.stylize(description)}`;
      unlocksItemTitle.appendChild(unlockItemDescription);
    }
    const unlockItemIcon = document.createElement("fxs-icon");
    unlockItemIcon.classList.add("size-16", "bg-no-repeat", "bg-center", "bg-cover");
    unlockItemIcon.setAttribute("data-icon-id", icon);
    unlocksItem.appendChild(unlockItemIcon);
    unlocksItem.appendChild(unlocksItemTitle);
    return unlocksItem;
  }
  populateAgeless(root) {
    const commanderWrapper = document.createElement("div");
    commanderWrapper.classList.add(
      "overflow-hidden",
      "transition-all",
      "duration-100",
      "scale-y-100",
      "origin-top"
    );
    const commanderHeader = this.buildAgelessHeader(
      Locale.compose("LOC_UI_PLAYER_UNLOCKS_COMMANDER_HEADER"),
      commanderWrapper
    );
    root.appendChild(commanderHeader);
    const commanders = PlayerUnlocks.getAgelessCommanderItems();
    for (const commander of commanders) {
      const desc = Locale.compose("LOC_END_GAME_ADD_LEVEL", commander.level);
      const item = this.buildAgelessItem(commander.unitTypeName, desc, commander.type);
      commanderWrapper.appendChild(item);
    }
    root.appendChild(commanderWrapper);
    const traditionsWrapper = document.createElement("fxs-vslot");
    traditionsWrapper.classList.add(
      "overflow-hidden",
      "transition-all",
      "duration-100",
      "scale-y-100",
      "origin-top"
    );
    const traditionsHeader = this.buildAgelessHeader(
      Locale.compose("LOC_UI_PLAYER_UNLOCKS_TRADITIONS_HEADER"),
      traditionsWrapper
    );
    root.appendChild(traditionsHeader);
    const traditions = PlayerUnlocks.getAgelessTraditions();
    for (const tradition of traditions) {
      const item = this.buildAgelessItem(
        tradition.Name,
        tradition.Description ?? "",
        tradition.TraitType.replace("TRAIT_", "CIVILIZATION_")
      );
      traditionsWrapper.appendChild(item);
    }
    root.appendChild(traditionsWrapper);
    const wondersWrapper = document.createElement("fxs-vslot");
    wondersWrapper.classList.add("overflow-hidden", "transition-all", "duration-100", "scale-y-100", "origin-top");
    const wondersHeader = this.buildAgelessHeader(
      Locale.compose("LOC_UI_PLAYER_UNLOCKS_WONDERS_HEADER"),
      wondersWrapper
    );
    root.appendChild(wondersHeader);
    const wonders = PlayerUnlocks.getAgelessWonders();
    for (const wonder of wonders) {
      const item = this.buildAgelessItem(
        wonder.Name,
        wonder.Description ?? "",
        wonder.ConstructibleType,
        wonder.ConstructibleType,
        "ageless-construction-tooltip"
      );
      wondersWrapper.appendChild(item);
    }
    root.appendChild(wondersWrapper);
    const buildingWrapper = document.createElement("fxs-vslot");
    buildingWrapper.classList.add("overflow-hidden", "transition-all", "duration-100", "scale-y-100", "origin-top");
    const buildingHeader = this.buildAgelessHeader(
      Locale.compose("LOC_UI_PLAYER_UNLOCKS_BUILDING_AND_IMPROVEMENTS"),
      buildingWrapper
    );
    root.appendChild(buildingHeader);
    const buildingsAndImprovements = PlayerUnlocks.getAgelessConstructsAndImprovements();
    for (const building of buildingsAndImprovements) {
      let isRedundant = false;
      for (const wonder of wonders) {
        if (wonder.ConstructibleType == building.type) {
          isRedundant = true;
          break;
        }
      }
      const item = this.buildAgelessItem(
        building.name,
        building.description,
        building.type,
        building.type,
        "ageless-construction-tooltip"
      );
      const title = MustGetElement(".screen-unlocks__ageless-item-name-container", item);
      if (building.quantity > 1) {
        const multiple = document.createElement("div");
        multiple.classList.add("font-body", "text-base", "flex", "justify-end", "normal-case");
        multiple.innerHTML = `x${building.quantity}`;
        title.appendChild(multiple);
      }
      if (!isRedundant) buildingWrapper.appendChild(item);
    }
    root.appendChild(buildingWrapper);
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(_navigationEvent) {
    return true;
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.askForClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    const slotGroup = MustGetElement(".unlock-content-wrapper", this.Root);
    if (inputEvent.detail.name == "shell-action-2" && slotGroup.getAttribute("selected-slot") == "civilizations") {
      this.showAllRequirements = !this.showAllRequirements;
      this.showAllRequirementsCheckbox.setAttribute("selected", this.showAllRequirements.toString());
      this.toggleExtraRequirements();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      Audio.playSound("data-audio-checkbox-press");
    }
  }
  onActiveDeviceChange(event) {
    if (!event.detail.gamepadActive) {
      this.showDetailsText.setAttribute("data-l10n-id", "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS");
    } else {
      if (this.showAllRequirements) {
        this.showDetailsText.setAttribute("data-l10n-id", "LOC_UI_PLAYER_UNLOCKS_HIDE_ALL_REQUIREMENTS");
      } else {
        this.showDetailsText.setAttribute("data-l10n-id", "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS");
      }
    }
  }
  queueRefresh() {
    if (this.refreshHandle == 0) {
      this.refreshHandle = requestAnimationFrame(this.refreshCallback);
    }
  }
  onPlayerUnlockChanged(data) {
    if (data.player == GameContext.localPlayerID) {
      this.queueRefresh();
    }
  }
  onPlayerUnlockProgressChanged(data) {
    if (data.player == GameContext.localPlayerID) {
      this.queueRefresh();
    }
  }
  onRefresh() {
    this.refreshHandle = 0;
    if (this.Root.isConnected && this.civUnlockScrollSlots) {
      this.populateCivList(this.civUnlockScrollSlots);
    }
  }
  // TODO: Add back when unlock requirements tracking system is supported fully
  // private onButtonActivated(event: CustomEvent) {
  // 	// create quest item based on item clicked
  // 	if (event.target instanceof HTMLElement) {
  // 		const buttonIndex = this.availableUnlockItems.indexOf(event.target);
  // 		// TODO: Implement progress when design is updated.
  // 		const questToCheck: QuestItem = {
  // 			id: GameInfo.UnlockRewards[buttonIndex].Name,
  // 			system: "ageless",
  // 			title: Locale.compose(GameInfo.UnlockRewards[buttonIndex].Name),
  // 			description: Locale.compose(GameInfo.UnlockRewards[buttonIndex].Description ?? ""),
  // 			// to calc
  // 			getCurrentProgress: () => { return "" },
  // 			progressType: ""
  // 		}
  // 		if (QuestTracker.has(questToCheck.id, questToCheck.system)) {
  // 			QuestTracker.remove(questToCheck.id, "ageless");
  // 		}
  // 		else {
  // 			QuestTracker.add(questToCheck);
  // 		}
  // 	}
  // }
  onTabBarSelected(event) {
    const selectedID = event.detail.selectedItem.id;
    this.agelessBackgroundContainer?.classList.toggle("hidden", selectedID != "ageless");
    this.playerUnlockContent.setAttribute("selected-slot", selectedID);
  }
  onShowDetailActivate(event) {
    if (event.target instanceof HTMLElement) {
      const isCurrentlyTracked = event.target.getAttribute("selected");
      this.showAllRequirements = isCurrentlyTracked === "true" ? true : false;
      this.toggleExtraRequirements();
    }
  }
  toggleExtraRequirements() {
    for (const extraRequirement of this.extraRequirements) {
      if (this.showAllRequirements) {
        extraRequirement.classList.remove("hidden");
      } else {
        extraRequirement.classList.add("hidden");
      }
      if (ActionHandler.isGamepadActive) {
        this.showDetailsText.setAttribute(
          "data-l10n-id",
          this.showAllRequirements ? "LOC_UI_PLAYER_UNLOCKS_HIDE_ALL_REQUIREMENTS" : "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS"
        );
      }
    }
  }
  collapseAgelessSection(collapseButton, agelessSection) {
    const type = collapseButton.getAttribute("type");
    if (type == "minus") {
      collapseButton.setAttribute("type", "plus");
      agelessSection.classList.add("hidden");
      collapseButton.setAttribute("data-audio-activate-ref", "data-audio-dropdown-open");
    } else {
      collapseButton.setAttribute("type", "minus");
      agelessSection.classList.remove("hidden");
      collapseButton.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
    }
  }
  askForClose() {
    PopupSequencer.closePopup("screen-unlocks");
  }
  close() {
    super.close();
  }
}
Controls.define("screen-unlocks", {
  createInstance: ScreenUnlocks,
  description: "Dialog to show various player-driven unlocks.",
  classNames: ["screen-unlocks--popup-medium", "w-full", "h-full"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-unlocks.js.map
