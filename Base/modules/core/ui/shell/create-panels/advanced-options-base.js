import { Audio } from '../../audio-base/audio-support.js';
import ContextManager from '../../context-manager/context-manager.js';
import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import ActionHandler from '../../input/action-handler.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import { CreateGameModel } from './create-game-model.js';
import { SettingsGroupData, AdvancedOptionsParameter } from './game-creation-options.js';
import { GameCreationPanelBase } from './game-creation-panel-base.js';
import LiveEventManager from '../live-event-logic/live-event-logic.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { Layout } from '../../utilities/utilities-layout.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import { DialogBoxAction } from '../../dialog-box/model-dialog-box.js';

class AdvancedOptionsBase extends GameCreationPanelBase {
  static GAME_PANEL_ID = "advanced-setup__game";
  static PLAYER_PANEL_ID = "advanced-setup__player";
  static LEGACY_PATHS_PANEL_ID = "advanced-setup__legacy";
  wasCompact = Layout.isCompact();
  frame = document.createElement("fxs-frame");
  headerText = "";
  setupSlotGroup = document.createElement("fxs-slot-group");
  gameSetupPanel = document.createElement("fxs-vslot");
  legacyPathSetupPanel = document.createElement("fxs-vslot");
  saveConfigAttributes = {
    "menu-type": "save_config",
    "server-type": ServerType.SERVER_TYPE_NONE,
    "save-type": SaveTypes.DEFAULT
  };
  loadConfigAttributes = {
    "menu-type": "load_config",
    "server-type": ServerType.SERVER_TYPE_NONE,
    "save-type": SaveTypes.DEFAULT
  };
  showSaveScreenListener = this.showSaveScreen.bind(this);
  showLoadScreenListener = this.showLoadScreen.bind(this);
  onConfirmButtonPressedListener = this.onConfirmButtonPressed.bind(this);
  onWindowResizeListener = this.onResize.bind(this);
  tooltipElements = [];
  confirmButton = document.createElement("fxs-hero-button");
  gameParamEles = [];
  gameOptionsHeaders = [];
  LegacyPathsParameterID;
  groupContainers = /* @__PURE__ */ new Map();
  activeGameParameters = /* @__PURE__ */ new Map();
  groupNames = /* @__PURE__ */ new Map();
  currentSlotIndex = 0;
  slotIDs = [];
  activePanel = this.gameSetupPanel;
  navControlButtonInfo = [];
  constructor(root) {
    super(root);
    this.slotIDs = [AdvancedOptionsBase.GAME_PANEL_ID, AdvancedOptionsBase.PLAYER_PANEL_ID];
    this.enableCloseSound = true;
    this.LegacyPathsParameterID = GameSetup.makeString("LegacyPaths");
  }
  onInitialize() {
    const fragment = document.createDocumentFragment();
    this.frame.setAttribute("content-class", "mx-4");
    this.frame.setAttribute("outside-safezone-mode", "vertical");
    fragment.appendChild(this.frame);
    const header = document.createElement("fxs-header");
    header.classList.add("font-title", "text-lg", "text-center", "uppercase");
    header.setAttribute("title", this.headerText);
    header.setAttribute("filigree-style", "none");
    this.frame.appendChild(header);
    if (this.navControlButtonInfo.length > 1) {
      this.frame.appendChild(this.createTopNav());
    }
    this.createGameSetupPanel(AdvancedOptionsBase.GAME_PANEL_ID);
    this.createLegacyPathSetupPanel(AdvancedOptionsBase.LEGACY_PATHS_PANEL_ID);
    this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[0]);
    this.setupSlotGroup.classList.add("flex-auto");
    this.frame.appendChild(this.setupSlotGroup);
    this.Root.appendChild(fragment);
    this.Root.setAttribute("data-audio-group-ref", "audio-advanced-options");
    this.Root.listenForEngineEvent("UpdateFrame", this.onUpdate, this);
  }
  onAttach() {
    super.onAttach();
    this.frame.appendChild(this.createBottomNav());
    window.addEventListener("resize", this.onWindowResizeListener);
  }
  onDetach() {
    window.removeEventListener("resize", this.onWindowResizeListener);
    SettingsGroupData.clearCachedHiddenContainerIDs();
    super.onDetach();
  }
  createTopNav() {
    const navControlEle = this.createNavControls(this.navControlButtonInfo);
    navControlEle.classList.add("advanced-options__top-nav", "my-4");
    navControlEle.classList.remove("flex-auto", "my-8");
    return navControlEle;
  }
  createBottomNav() {
    const existingNav = document.querySelector(".advanced-options__bottom-nav");
    if (existingNav) {
      removeAllChildren(existingNav);
    }
    const footerContainer = document.createElement("div");
    footerContainer.classList.add("h-20", "mx-8", "advanced-options__bottom-nav");
    const footerContent = document.createElement("fxs-hslot");
    footerContent.classList.add("advanced-options__footer", "justify-center");
    footerContent.classList.toggle("hidden", ActionHandler.isGamepadActive);
    footerContainer.appendChild(footerContent);
    if (!UI.isInGame()) {
      const backButton = document.createElement("fxs-activatable");
      backButton.classList.add(
        "advanced-options__back-button",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-contain",
        "bg-no-repeat"
      );
      backButton.addEventListener("action-activate", () => CreateGameModel.showPreviousPanel());
      footerContent.appendChild(backButton);
      const resetDefaultsButton = document.createElement("fxs-button");
      resetDefaultsButton.classList.add("mx-2", "mb-2", "mt-6", "reset-button");
      resetDefaultsButton.setAttribute("caption", "LOC_OPTIONS_RESET_TO_DEFAULTS");
      resetDefaultsButton.addEventListener("action-activate", this.resetToDefaults.bind(this));
      footerContent.appendChild(resetDefaultsButton);
      this.confirmButton.classList.add("mx-2", "mb-2", "grow");
      this.confirmButton.addEventListener("action-activate", this.onConfirmButtonPressedListener);
      footerContent.appendChild(this.confirmButton);
      const saveConfigButton = document.createElement("fxs-activatable");
      saveConfigButton.classList.add(
        "advanced-options__save-config",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-no-repeat",
        "bg-contain"
      );
      saveConfigButton.setAttribute("data-tooltip-content", "LOC_UI_SAVE_CONFIG");
      saveConfigButton.addEventListener("action-activate", this.showSaveScreenListener);
      footerContent.appendChild(saveConfigButton);
      const loadConfigButton = document.createElement("fxs-activatable");
      loadConfigButton.classList.add(
        "advanced-options__load-config",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-no-repeat",
        "bg-contain"
      );
      loadConfigButton.setAttribute("data-tooltip-content", "LOC_UI_LOAD_CONFIG");
      loadConfigButton.addEventListener("action-activate", this.showLoadScreenListener);
      footerContent.appendChild(loadConfigButton);
    } else {
      const backButton = document.createElement("fxs-button");
      backButton.classList.add("mb-2", "mt-6");
      backButton.setAttribute("caption", "LOC_GENERIC_BACK");
      backButton.addEventListener("action-activate", () => {
        this.close();
      });
      footerContent.appendChild(backButton);
    }
    return footerContainer;
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    waitForLayout(() => this.updateFocus());
    NavTray.clear();
    this.setupNavTray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  setupNavTray() {
    NavTray.addOrUpdateGenericBack();
    if (UI.isInGame()) {
      return;
    }
    NavTray.addOrUpdateNavShellPrevious("LOC_UI_SAVE_CONFIG");
    NavTray.removeAccept();
    NavTray.addOrUpdateNavShellNext("LOC_UI_LOAD_CONFIG");
    NavTray.addOrUpdateShellAction2("LOC_OPTIONS_RESET_TO_DEFAULTS");
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || UI.isInGame()) {
      return;
    }
    if (event.detail.name === "sys-menu") {
      this.showProgression();
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.detail.name === "shell-action-1") {
      this.onConfirmButtonPressed();
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.detail.name === "shell-action-2") {
      this.resetToDefaults();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onActiveDeviceTypeChanged() {
    MustGetElement(".advanced-options__footer", this.Root).classList.toggle(
      "hidden",
      ActionHandler.isGamepadActive
    );
  }
  createGameSetupPanel(panelId) {
    this.gameSetupPanel.classList.add("game-setup", "flex", "flex-col");
    this.gameSetupPanel.id = panelId;
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.gameSetupPanel.appendChild(scrollableContent);
    const scrollableContentContainer = document.createElement("div");
    scrollableContentContainer.classList.add("advanced-setup__game-options-container", "flex-auto", "mx-8");
    scrollableContent.appendChild(scrollableContentContainer);
    this.setupSlotGroup.appendChild(this.gameSetupPanel);
  }
  createLegacyPathSetupPanel(panelId) {
    this.legacyPathSetupPanel.classList.add("legacy-setup", "flex", "flex-col");
    this.legacyPathSetupPanel.id = panelId;
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.legacyPathSetupPanel.appendChild(scrollableContent);
    const scrollableContentContainer = document.createElement("div");
    scrollableContentContainer.classList.add("advanced-setup__legacy-options-container", "flex-auto", "mx-8");
    scrollableContent.appendChild(scrollableContentContainer);
    this.setupSlotGroup.appendChild(this.legacyPathSetupPanel);
    const legacyPathsDisabledWarning = document.createElement("div");
    legacyPathsDisabledWarning.classList.add(
      "w-full",
      "bg-primary-3",
      "border-2",
      "border-primary",
      "flex",
      "items-center",
      "my-2"
    );
    const legacyPathsWarningIcon = document.createElement("div");
    legacyPathsWarningIcon.classList.add("img-unit-badge-warning", "size-14", "mx-2");
    legacyPathsDisabledWarning.appendChild(legacyPathsWarningIcon);
    const legacyPathsWarningText = document.createElement("div");
    legacyPathsWarningText.setAttribute("data-l10n-id", "LOC_ADVANCED_OPTIONS_LEGACY_PATHS_DISABLED_WARNING");
    legacyPathsWarningText.classList.add("flex-auto", "my-2", "pointer-events-auto");
    legacyPathsWarningText.setAttribute("role", "alert");
    legacyPathsDisabledWarning.appendChild(legacyPathsWarningText);
    scrollableContentContainer.appendChild(legacyPathsDisabledWarning);
  }
  createParamEleLabel(setupParam, paramEle) {
    const container = document.createElement(setupParam.array ? "fxs-spatial-slot" : "fxs-hslot");
    container.classList.add("advanced-options-setting-row", "items-center");
    if (!setupParam.array) {
      container.classList.add("h-14");
      const paramName = GameSetup.resolveString(setupParam.name);
      const label = document.createElement("div");
      label.classList.add("flex", "flex-auto", "justify-start", "font-body-base", "ml-4", "pointer-events-auto");
      label.setAttribute("data-l10n-id", paramName ?? "");
      label.setAttribute("role", "option");
      container.appendChild(label);
    } else {
      container.classList.add("mx-4");
    }
    container.appendChild(paramEle);
    this.gameParamEles.push(container);
    return container;
  }
  goToNewPanel(panel) {
    this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
    this.currentSlotIndex = this.slotIDs.indexOf(panel.id);
    this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
    this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
    this.activePanel = panel;
    this.updateFocus();
  }
  showGameSetupPanel() {
    this.goToNewPanel(this.gameSetupPanel);
  }
  showLegacyPathSetupPanel() {
    this.goToNewPanel(this.legacyPathSetupPanel);
  }
  updateFocus() {
    if (this.activePanel == this.gameSetupPanel && this.gameParamEles.length > 0) {
      FocusManager.get().setFocus(this.gameParamEles[0]);
    } else {
      FocusManager.get().setFocus(this.activePanel);
    }
    this.setupNavTray();
  }
  showSaveScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: this.saveConfigAttributes
    });
  }
  showLoadScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: this.loadConfigAttributes
    });
  }
  onNavigateInput(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.isNavigationEnabled == false) {
      return;
    }
    switch (navigationEvent.getDirection()) {
      case InputNavigationAction.PREVIOUS:
        this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
        this.currentSlotIndex = (this.currentSlotIndex - 1) % this.slotIDs.length;
        if (this.currentSlotIndex < 0) {
          this.currentSlotIndex = this.slotIDs.length - 1;
        }
        this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
        this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
        this.activePanel = MustGetElement(`#${this.slotIDs[this.currentSlotIndex]}`, this.Root);
        Audio.playSound("data-audio-activate", "game-creator");
        this.updateFocus();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.NEXT:
        this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
        this.currentSlotIndex = (this.currentSlotIndex + 1) % this.slotIDs.length;
        this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
        this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
        this.activePanel = MustGetElement(`#${this.slotIDs[this.currentSlotIndex]}`, this.Root);
        Audio.playSound("data-audio-activate", "game-creator");
        this.updateFocus();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.SHELL_NEXT:
        if (UI.isInGame()) {
          break;
        }
        this.showLoadScreen();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.SHELL_PREVIOUS:
        if (UI.isInGame()) {
          break;
        }
        this.showSaveScreen();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
    }
  }
  refreshGameOptions() {
    const refreshGameOptionsProfilingHandle = UI.beginProfiling("refreshGameOptions");
    for (const element of this.gameParamEles) {
      element.remove();
    }
    for (const optionsHeader of this.gameOptionsHeaders) {
      optionsHeader.remove();
    }
    this.gameOptionsHeaders = [];
    for (const groups of this.groupContainers) {
      groups[1].remove();
    }
    this.groupContainers.clear();
    this.gameParamEles.length = 0;
    this.activeGameParameters = /* @__PURE__ */ new Map();
    const parameters = GameSetup.getGameParameters();
    for (const param of parameters) {
      if (!param.hidden && param.invalidReason == GameSetupParameterInvalidReason.Valid) {
        if (param.ID == GameSetup.makeString("Age")) {
          if (Online.Metaprogression.isPlayingActiveEvent() && LiveEventManager.skipAgeSelect()) {
            param.readOnly = true;
          }
        }
        if (Configuration.getGame().isHotseat && param.ID == GameSetup.makeString("MementosEnabled")) {
          param.value.value = false;
          continue;
        }
        const option = this.getOptionFromParam(param);
        let options = this.activeGameParameters.get(param.ID);
        if (options == null) {
          options = [];
          this.activeGameParameters.set(param.ID, options);
        }
        options.push(option);
        const paramEle = option.render();
        paramEle.id = param.ID.toString();
        const resolvedParamGroup = this.resolveParamGroup(param);
        const groupContainer = this.groupContainers.get(resolvedParamGroup);
        if (groupContainer) {
          groupContainer.addOption(this.createParamEleLabel(param, paramEle));
        } else {
          const groupName = GameSetup.resolveString(resolvedParamGroup);
          const newGroupContainer = SettingsGroupData.addNewSettingsGroup(
            this.groupNames.get(groupName) ?? "",
            resolvedParamGroup.toString(),
            this.getTabContainerForParam(param),
            { isCollapsible: groupName != "LegacyOptions" }
          );
          this.groupContainers.set(resolvedParamGroup, newGroupContainer);
          newGroupContainer.addOption(this.createParamEleLabel(param, paramEle));
        }
      }
    }
    UI.endProfiling(refreshGameOptionsProfilingHandle);
  }
  resolveParamGroup(param) {
    return param.group;
  }
  resetToDefaults() {
    const confirmCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        this.onResetConfirmed();
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT",
      title: "LOC_OPTIONS_RESET_TO_DEFAULTS",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: confirmCallback
    });
  }
  onResize() {
    this.updateTooltipPosition();
    this.updateFrame();
  }
  updateTooltipPosition() {
    const isCompact = Layout.isCompact();
    if (isCompact != this.wasCompact) {
      for (const tooltipElement of this.tooltipElements) {
        tooltipElement.setAttribute("data-tooltip-alignment", isCompact ? "top-right" : "");
        tooltipElement.setAttribute("data-tooltip-anchor", isCompact ? "left" : "right");
      }
      this.wasCompact = isCompact;
    }
  }
  updateFrame() {
    this.frame.setAttribute(
      "outside-safezone-mode",
      UI.getViewExperience() == UIViewExperience.Mobile ? "full" : "vertical"
    );
  }
  getOptionFromParam(param) {
    return new AdvancedOptionsParameter(param);
  }
  //function prototypes meant to be overridden
  onResetConfirmed() {
    console.error("Base onResetConfirmed called from advanced-options-base. This should be overridden");
  }
  onConfirmButtonPressed() {
    console.error("Base onConfirmButtonPressed called from advanced-options-base. This should be overridden");
  }
  onUpdate() {
    console.error("Base onUpdate called from advanced-options-base. This should be overridden");
  }
  getTabContainerForParam(param) {
    const groupID = GameSetup.resolveString(param.group);
    const isLegacyOption = groupID == "LegacyOptions";
    return MustGetElement(
      isLegacyOption ? ".advanced-setup__legacy-options-container" : ".advanced-setup__game-options-container",
      this.Root
    );
  }
}

export { AdvancedOptionsBase };
//# sourceMappingURL=advanced-options-base.js.map
