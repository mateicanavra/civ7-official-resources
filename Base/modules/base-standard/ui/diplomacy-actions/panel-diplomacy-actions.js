import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as Navigation } from '../../../core/ui/views/view-manager.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { D as DiploRibbonData, a as RibbonStatsToggleStatus } from '../diplo-ribbon/model-diplo-ribbon.chunk.js';
import DiplomacyManager, { DiplomacyInputPanel, L as LeaderModelManager } from '../diplomacy/diplomacy-manager.js';
import { R as RelationshipBreakdown } from '../relationship-breakdown/relationship-breakdown.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-color.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../victory-progress/model-victory-progress.chunk.js';
import '../cinematic/cinematic-manager.chunk.js';
import '../endgame/screen-endgame.js';
import '../../../core/ui/tooltips/tooltip-manager.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../end-results/end-results.js';
import '../endgame/model-endgame.js';
import '../victory-manager/victory-manager.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class DiplomacyActionPanel extends DiplomacyInputPanel {
  interfaceModeChangedListener = this.onInterfaceModeChanged.bind(this);
  selectedPlayerChangedListener = this.onSelectedPlayerChanged.bind(this);
  supportChangedListener = this.onSupportChanged.bind(this);
  viewReceiveFocusListener = this.onViewReceiveFocus.bind(this);
  actionCanceledListener = this.onActionCanceled.bind(this);
  diplomacyQueueChangedListener = this.onDiplomacyQueueChanged.bind(this);
  gameCoreEventPlaybackCompleteListener = this.onGameCoreEventPlaybackCompleteListener.bind(this);
  populateInitialDataTimerListener = this.onPopulateInitialDataTimerFinished.bind(this);
  onHandleWarSupportClosedListener = this.onHandleWarSupportClosed.bind(this);
  majorActionsSlot;
  leaderNameElement;
  mementosHeaderElement;
  civSymbol;
  diploTint;
  tabBar;
  panels = [];
  slotGroup;
  initialLoadComplete = false;
  firstFocusSection = null;
  ongoingActionPageNumber = 0;
  diplomacyQueueChanged = false;
  infoTabIndex = 3;
  actionTabIndex = 0;
  previousPlayer = -1;
  initDataPopulationTimerHandle = 0;
  render() {
    this.Root.classList.add("flex-1");
    this.Root.innerHTML = `
		<fxs-hslot id="panel-diplomacy-actions__horizontal-container" data-navrule-left="wrap" class="-top-1 -bottom-8 absolute actions-horizontal-container">
			<fxs-vslot>
				<fxs-subsystem-frame box-style="b3" class="flex-auto">
					<fxs-header id="panel-diplomacy-actions__leader-name-header" filigree-style="none" data-slot="header" class="panel-diplomacy__leader-name-header leading-none flex uppercase self-center items-end font-bold text-center min-h-18 mt-6 pb-3 justify-center font-title text-2xl px-2 w-full" title="LOC_DIPLOMACY_SELECT_TARGET"></fxs-header>
					<fxs-header id="panel-diplomacy-actions__civ-name-header" font-fit-mode="shrink" wrap="nowrap" filigree-style="none" data-slot="header" class="panel-diplomacy__civ-name-header flex min-h-11 items-top self-center font-title text-sm text-secondary max-w-full" title="LOC_DIPLOMACY_SELECT_TARGET"></fxs-header>
					<div id="panel-diplomacy-actions__civ-symbol" data-slot="header" class="panel-diplomacy-actions__civ-icon absolute bg-center bg-contain self-center size-24"></div>
					<fxs-tab-bar alt-controls="false" rect-render="true" data-slot="header" class="mx-5 mt-16 mb-3 pb-1 bg-primary-4 border-primary-2 border-t-2" data-audio-group-ref="audio-diplo-project-reaction" data-audio-tab-selected="leader-tab-activate" tab-for="fxs-subsystem-frame"></fxs-tab-bar>
					<fxs-hslot data-slot="footer" id="panel-diplomacy-actions__major-action-buttons" class="relative justify-around self-center pb-3 w-145"></fxs-hslot>
					<fxs-slot-group>
						<fxs-vslot id="diplomacy-tab-actions" class="flex-auto">
								<fxs-vslot id="available-projects-slot" disable-focus-allowed="true"></fxs-vslot>
						</fxs-vslot>
						<fxs-vslot id="diplomacy-tab-relationship" class="flex-auto">
							<fxs-vslot id="panel-diplomacy-actions__relationship-event-container"></fxs-vslot>
							<div class="flex flex-col mt-20 mb-4">
								<div id="panel-diplomacy-actions__other-relationships-header-name" class="font-title text-base text-center uppercase pointer-events-auto"></div>
								<fxs-header id="panel-diplomacy-actions__other-relationships-header" class="text-secondary uppercase font-title text-base" title="LOC_DIPLOMACY_ACTIONS_RELATIONSHIPS_HEADER" filigree-style="h4"></fxs-header>
							</div>
							<fxs-inner-frame id="panel-diplomacy-actions__other-relationships-frame" class="w-128 self-center">
								<div id="panel-diplomacy-actions__other-relationships-container"class="flex flex-col w-full"></div>
							</fxs-inner-frame>
						</fxs-vslot>
						<fxs-vslot id="diplomacy-tab-government" class="flex-auto">
							<fxs-vslot id="panel-diplomacy-actions__government-container" class="text-center"></fxs-vslot>
						</fxs-vslot>
						<fxs-vslot id="diplomacy-tab-info" class="flex-auto">
							<fxs-vslot id="panel-diplomacy-actions__info-container"></fxs-vslot>
						</fxs-vslot>
					</fxs-slot-group><fxs-hslot data-slot="footer" id="panel-diplomacy-actions__major-action-buttons" class="relative justify-around self-stretch pb-3"></fxs-hslot>
				</fxs-subsystem-frame>
			</fxs-vslot>
			<fxs-vslot class="panel-diplomacy-actions__ongoing-actions-list hidden">
				<fxs-scrollable class="w-40 h-0 -left-8 panel-diplomacy-actions__ongoing-actions-scrollable" handle-gamepad-pan="true" attached-scrollbar="true">
				<fxs-vslot id="panel-diplomacy-actions__ongoing-actions-container" class="absolute h-auto w-auto">
				</fxs-vslot>
				</fxs-scrollable>
			</fxs-vslot>
		</fxs-hslot>
		`;
    const subsystemPanel = MustGetElement("fxs-subsystem-frame", this.Root);
    subsystemPanel.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    subsystemPanel.setAttribute("data-audio-close-group-ref", "leader-panel");
    this.leaderNameElement = MustGetElement("#panel-diplomacy-actions__leader-name-header", this.Root);
    this.mementosHeaderElement = MustGetElement("#panel-diplomacy-actions__civ-name-header", this.Root);
    this.civSymbol = MustGetElement("#panel-diplomacy-actions__civ-symbol", this.Root);
    this.majorActionsSlot = MustGetElement("#panel-diplomacy-actions__major-action-buttons", this.Root);
    if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
      this.majorActionsSlot.classList.add("hidden");
    }
    this.tabBar = MustGetElement("fxs-tab-bar", this.Root);
    this.slotGroup = MustGetElement("fxs-slot-group", this.Root);
    const actionsPanel = MustGetElement("#diplomacy-tab-actions", this.Root);
    this.panels.push(actionsPanel);
    const playerObject = Players.get(DiplomacyManager.selectedPlayerID);
    if (!playerObject) {
      console.error("panel-diplomacy-actions: Unable to get player object for selected player!");
      return;
    }
    if (playerObject.isMajor) {
      this.leaderNameElement?.setAttribute("title", Locale.compose(playerObject.leaderName));
      this.mementosHeaderElement?.setAttribute(
        "title",
        Locale.compose("LOC_DIPLOMACY_CIV_NAME", playerObject.civilizationAdjective)
      );
    } else {
      this.leaderNameElement?.setAttribute("title", Locale.compose(playerObject.civilizationAdjective));
      if (playerObject.civilizationAdjective != playerObject.name) {
        this.mementosHeaderElement?.setAttribute(
          "title",
          Locale.compose("LOC_DIPLOMACY_INDEPENDENT_CIV_NAME", playerObject.name)
        );
      } else {
        this.mementosHeaderElement?.setAttribute("title", Locale.compose(""));
      }
    }
    this.civSymbol.style.backgroundImage = `url("${Icon.getCivIconForDiplomacyHeader(playerObject.civilizationType)}")`;
    this.previousPlayer = DiplomacyManager.selectedPlayerID;
    this.Root.classList.toggle("independent", !playerObject.isMajor);
    this.refreshTabItems(playerObject);
    this.tabBar.addEventListener("tab-selected", this.onOptionsTabSelected.bind(this));
    if (playerObject.id == GameContext.localPlayerID) {
      this.tabBar?.setAttribute("selected-tab-index", `${this.infoTabIndex}`);
    } else {
      this.slotGroup.setAttribute("selected-slot", "diplomacy-tab-actions");
    }
    waitForLayout(() => {
      this.diploTint = MustGetElement(".subsystem-frame__diplo-tint", this.Root);
      this.diploTint?.style.setProperty(
        "fxs-background-image-tint",
        UI.Player.getPrimaryColorValueAsString(playerObject.id)
      );
    });
  }
  populateInitialData() {
    this.refreshFullData();
    if (DiplomacyManager.selectedActionID != -1) {
      const actionData = Game.Diplomacy.getDiplomaticEventData(
        DiplomacyManager.selectedActionID
      );
      if (!actionData) {
        console.log(
          "panel-diplomacy-actions: Unable to get action data for action with ID: " + DiplomacyManager.selectedActionID
        );
        return;
      }
      DiplomacyManager.shouldQuickClose = true;
      if (!(actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN && DiplomacyManager.selectedPlayerID == actionData.targetPlayer)) {
        this.showBefriendIndependentDetails();
      } else {
        const infIndepData = Game.Diplomacy.getInfluenceIndependentData(
          actionData.uniqueID
        );
        Camera.lookAtPlot(infIndepData.location);
      }
    }
    this.initialLoadComplete = true;
  }
  /**
   * Refresh all data (warning: VERY expensive!)
   */
  refreshFullData() {
    this.refreshPartialData();
    this.populateGovernmentInfo();
    this.populatePlayerCivInfo();
    this.showLeaderModel();
    this.populateAvailableActions();
    waitForLayout(() => this.realizeInitialFocus());
  }
  /**
   * Refresh dynamic data (expensive!)
   */
  refreshPartialData() {
    this.populateOngoingProjects();
    this.populateActionsPanel();
    this.populateRelationshipInfo();
  }
  onAttach() {
    super.onAttach();
    this.render();
    this.Root.addEventListener("view-receive-focus", this.viewReceiveFocusListener);
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.addEventListener("diplomacy-selected-player-changed", this.selectedPlayerChangedListener);
    engine.on("DiplomacyEventSupportChanged", this.supportChangedListener);
    engine.on("DiplomacyEventCanceled", this.actionCanceledListener);
    engine.on("DiplomacyQueueChanged", this.diplomacyQueueChangedListener);
    engine.on("GameCoreEventPlaybackComplete", this.gameCoreEventPlaybackCompleteListener);
    if (this.checkShouldShowPanel()) {
      this.initDataPopulationTimerHandle = setTimeout(this.populateInitialDataTimerListener, 83);
    } else {
      this.initialLoadComplete = true;
    }
  }
  onDetach() {
    super.onDetach();
    this.Root.removeEventListener("view-receive-focus", this.viewReceiveFocusListener);
    window.removeEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    window.removeEventListener("diplomacy-selected-player-changed", this.selectedPlayerChangedListener);
    engine.off("DiplomacyEventSupportChanged", this.supportChangedListener);
    engine.off("DiplomacyEventCanceled", this.actionCanceledListener);
    engine.off("DiplomacyQueueChanged", this.diplomacyQueueChangedListener);
    engine.off("GameCoreEventPlaybackComplete", this.gameCoreEventPlaybackCompleteListener);
    if (this.initDataPopulationTimerHandle != 0) {
      clearTimeout(this.initDataPopulationTimerHandle);
      this.initDataPopulationTimerHandle = 0;
    }
  }
  onPopulateInitialDataTimerFinished() {
    this.populateInitialData();
    if (this.initDataPopulationTimerHandle != 0) {
      clearTimeout(this.initDataPopulationTimerHandle);
      this.initDataPopulationTimerHandle = 0;
    }
  }
  handleInput(inputEvent) {
    const currentTarget = ContextManager.getCurrentTarget();
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB") && !DiplomacyManager.isFirstMeetDiplomacyOpen || currentTarget != void 0 && currentTarget.nodeName != "SCREEN-BEFRIEND-INDEPENDENT-DETAILS") {
      return false;
    }
    if (!this.checkShouldShowPanel()) {
      return true;
    }
    const inputEventName = inputEvent.detail.name;
    switch (inputEventName) {
      case "cancel":
      case "keyboard-escape":
      case "mousebutton-right":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return false;
      case "shell-action-2":
        this.trySupportBefriendIndependent();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        return false;
    }
    return true;
  }
  trySupportBefriendIndependent() {
    const ongoingActions = Game.Diplomacy.getPlayerEvents(
      DiplomacyManager.selectedPlayerID
    ).filter((action) => {
      return action.initialPlayer == GameContext.localPlayerID && action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN;
    });
    if (ongoingActions.length == 0) {
      return;
    }
    const supportArgs = {
      ID: ongoingActions[0].uniqueID,
      Type: DiplomacyTokenTypes.DIPLOMACY_TOKEN_GLOBAL,
      Amount: 1,
      SubType: true
    };
    const supportResult = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
      supportArgs,
      false
    );
    if (!supportResult.Success) {
      return;
    }
    Game.PlayerOperations.sendRequest(
      GameContext.localPlayerID,
      PlayerOperationTypes.SUPPORT_DIPLOMATIC_ACTION,
      supportArgs
    );
    Audio.playSound("data-audio-activate", "befriend-independent-details");
  }
  handleNavigation(navigateInput) {
    const currentTarget = ContextManager.getCurrentTarget();
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB") && !DiplomacyManager.isFirstMeetDiplomacyOpen || currentTarget != void 0 && currentTarget.nodeName != "SCREEN-BEFRIEND-INDEPENDENT-DETAILS") {
      return false;
    }
    if (!this.checkShouldShowPanel()) {
      return true;
    }
    const direction = navigateInput.getDirection();
    switch (direction) {
      case InputNavigationAction.SHELL_PREVIOUS:
      case InputNavigationAction.SHELL_NEXT:
        if (DiplomacyManager.isFirstMeetDiplomacyOpen) {
          return false;
        }
        const diploRibbon = document.querySelector(".diplo-ribbon");
        diploRibbon?.dispatchEvent(navigateInput);
        navigateInput.stopPropagation();
        navigateInput.preventDefault();
        return false;
      case InputNavigationAction.PREVIOUS:
      case InputNavigationAction.NEXT:
        this.tabBar?.dispatchEvent(navigateInput);
        return false;
      case InputNavigationAction.LEFT:
      case InputNavigationAction.RIGHT:
        navigateInput.stopPropagation();
        navigateInput.preventDefault();
        return false;
    }
    return true;
  }
  onViewReceiveFocus() {
    if (!this.checkShouldShowPanel()) {
      return;
    }
    if (DiplomacyManager.selectedActionID != -1 || DiplomacyManager.currentDiplomacyDealData != null) {
      return;
    }
    this.populateAvailableActions();
    this.realizeInitialFocus();
    this.realizeNavTray();
  }
  realizeNavTray() {
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    const player = Players.get(DiplomacyManager.selectedPlayerID);
    if (player && player.isIndependent) {
      const ongoingActions = Game.Diplomacy.getPlayerEvents(
        DiplomacyManager.selectedPlayerID
      ).filter((action) => {
        return action.initialPlayer == GameContext.localPlayerID && action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN;
      });
      if (ongoingActions.length != 0) {
        NavTray.addOrUpdateShellAction1(Locale.compose("LOC_DIPLOMACY_SUPPORT_INDEPENDENT"));
      }
    }
  }
  populateOngoingProjects() {
    const ongoingProjectContainer = MustGetElement(
      "#panel-diplomacy-actions__ongoing-actions-container",
      this.Root
    );
    removeAllChildren(ongoingProjectContainer);
    let ongoingActions = Game.Diplomacy.getPlayerEvents(DiplomacyManager.selectedPlayerID);
    ongoingActions = ongoingActions.filter((action) => {
      return action.initialPlayer == GameContext.localPlayerID || action.targetPlayer == GameContext.localPlayerID && action.revealed;
    });
    ongoingActions.sort(
      (a, b) => Game.Diplomacy.getCompletionData(a.uniqueID) && Game.Diplomacy.getCompletionData(b.uniqueID) && Game.Diplomacy.getCompletionData(a.uniqueID).turnsToCompletion > Game.Diplomacy.getCompletionData(b.uniqueID).turnsToCompletion ? 1 : -1
    );
    const myActions = ongoingActions.filter((action) => {
      return action.initialPlayer == GameContext.localPlayerID && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE;
    });
    const theirActions = ongoingActions.filter((action) => {
      return action.initialPlayer != GameContext.localPlayerID && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE;
    });
    if (myActions.length > 0) {
      const myActionsHeader = document.createElement("div");
      myActionsHeader.classList.value = "queued-title flex justify-center font-title uppercase text-xs mt-5 py-2";
      myActionsHeader.innerHTML = Locale.compose("LOC_DIPLOMACY_MY_ACTIONS_HEADER");
      ongoingProjectContainer.appendChild(myActionsHeader);
    }
    myActions.forEach((myAction) => {
      const ongoingActionItem = this.createOngoingActionItem(myAction);
      if (ongoingActionItem) {
        ongoingProjectContainer.appendChild(ongoingActionItem);
      }
    });
    if (theirActions.length > 0) {
      const theirActionsHeader = document.createElement("div");
      theirActionsHeader.classList.value = "queued-title flex justify-center font-title uppercase text-xs mt-5 py-2";
      theirActionsHeader.innerHTML = Locale.compose("LOC_DIPLOMACY_THEIR_ACTIONS_HEADER");
      ongoingProjectContainer.appendChild(theirActionsHeader);
    }
    theirActions.forEach((theirAction) => {
      const ongoingActionItem = this.createOngoingActionItem(theirAction);
      if (ongoingActionItem) {
        ongoingProjectContainer.appendChild(ongoingActionItem);
      }
    });
    this.setOngoingActionsScrollablePosition();
    const actionsList = MustGetElement(".panel-diplomacy-actions__ongoing-actions-list", this.Root);
    actionsList.classList.toggle("hidden", ongoingProjectContainer.children.length == 0);
  }
  createOngoingActionItem(action) {
    const actionData = Game.Diplomacy.getProjectDataForUI(
      action.initialPlayer,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
      DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
    ).find((project) => project.actionID == action.uniqueID);
    if (action.hidden && !action.revealed && action.initialPlayer != GameContext.localPlayerID && actionData?.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE) {
      return null;
    }
    const ongoingActionItem = document.createElement("fxs-chooser-item");
    ongoingActionItem.classList.add("w-36", "flex", "flex-row", "pointer-events-auto");
    ongoingActionItem.setAttribute("tabindex", "-1");
    const actionDef = GameInfo.DiplomacyActions.lookup(action.actionType);
    if (!actionDef) {
      console.error(
        "panel-diplomacy-actions: Unable to get definition for diplomacy action with type: " + action.actionTypeName
      );
      return null;
    }
    let progressPercent = 0;
    let progressString = "";
    const progressTurnsContainer = document.createElement("div");
    progressTurnsContainer.classList.add(
      "relative",
      "flex",
      "flex-col",
      "grow",
      "justify-center",
      "items-center",
      "min-w-16",
      "m-1"
    );
    const progressBar = document.createElement("div");
    progressBar.classList.add(
      "build-queue__item-progress-bar",
      "relative",
      "p-0\\.5",
      "flex",
      "flex-col-reverse",
      "h-10",
      "w-4"
    );
    const progressBarFill = document.createElement("div");
    progressBarFill.classList.add("build-queue__progress-bar-fill", "relative", "bg-contain", "w-3");
    progressTurnsContainer.appendChild(progressBar);
    ongoingActionItem.appendChild(progressTurnsContainer);
    const actionDetailsContainer = document.createElement("div");
    actionDetailsContainer.classList.add("grow", "relative");
    ongoingActionItem.appendChild(actionDetailsContainer);
    const iconContainer = document.createElement("div");
    iconContainer.classList.value = "size-19 flex self-center items-center justify-center pointer-events-none relative";
    ongoingActionItem.appendChild(iconContainer);
    const iconImage = document.createElement("div");
    iconImage.classList.value = "size-16 -top-px bg-center relative flex flex-col items-center bg-cover justify-center";
    iconContainer.appendChild(iconImage);
    const iconFront = document.createElement("div");
    iconFront.classList.value = "absolute img-civics-icon-frame size-19 flex self-center items-center justify-center pointer-events-none relative";
    iconContainer.appendChild(iconFront);
    const completionData = Game.Diplomacy.getCompletionData(action.uniqueID);
    progressBar.appendChild(progressBarFill);
    if (actionData?.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN) {
      ongoingActionItem.addEventListener("action-activate", () => {
        this.showBefriendIndependentDetails();
      });
      const infIndepData = Game.Diplomacy.getInfluenceIndependentData(action.uniqueID);
      const villageID = infIndepData.independentPlayerID;
      let villageName = "";
      const locVillageName = Game.IndependentPowers.independentName(villageID)?.toString();
      if (locVillageName != void 0) {
        villageName = Locale.compose(locVillageName);
      }
      ongoingActionItem.setAttribute("data-tooltip-content", Locale.compose(action.name, villageName));
      const currentProgress = (completionData.requiredProgress - completionData.turnsToCompletion * completionData.progressPerTurn) / completionData.requiredProgress;
      progressPercent = currentProgress * 100;
      progressString = Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString();
    } else if (actionData?.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE && actionData.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_COUNTER_SPY) {
      const stageData = Game.Diplomacy.getActiveStage(action.uniqueID);
      const stages = Game.Diplomacy.getStages(action.uniqueID);
      if (stageData.stageType == stages[0].stageType) {
        const projectDefinition = GameInfo.DiplomacyActions.lookup(
          actionData.actionType
        );
        if (!projectDefinition) {
          console.error(
            "panel-diplomacy-actions: Unable to get project definition for project of type " + actionData.actionTypeName
          );
          return null;
        }
        const stage1MaxTurns = action.completionScore - action.lastStageDuration;
        const stage1MinTurns = stage1MaxTurns - Game.Diplomacy.modifyByGameSpeed(projectDefinition.RandomInitialProgress);
        ongoingActionItem.setAttribute(
          "data-tooltip-content",
          Locale.stylize(
            Locale.compose(action.name) + "[N]" + Locale.compose(action.description) + "[N]" + Locale.stylize(
              "LOC_DIPLOMACY_ACTION_ESPIONAGE_ONGOING",
              stage1MinTurns,
              stage1MaxTurns,
              Game.turn - action.gameTurnStart
            ) + "[N]" + Locale.compose("LOC_DIPLOMACY_SUCCESS_CHANCE", actionDef.SuccessChance) + "[N]" + Locale.compose("LOC_DIPLOMACY_REVEAL_CHANCE", actionDef.RevealChance)
          )
        );
        progressString = (Game.turn - action.gameTurnStart).toString() + "/" + stage1MaxTurns.toString();
        progressPercent = (Game.turn - action.gameTurnStart) / stage1MaxTurns * 100;
      } else {
        if (!action.hidden && DiplomacyManager.selectedPlayerID == GameContext.localPlayerID && action.targetPlayer == GameContext.localPlayerID) {
          ongoingActionItem.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              Locale.compose(action.name) + "[N]" + Locale.compose(action.description + "_TARGET", "LOC_DIPLOMACY_UNKNOWN_PLAYER") + "[N]" + Locale.compose(
                "LOC_DIPLOMACY_ACTION_ACTIVE_FOR_TURNS",
                Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString()
              )
            )
          );
        } else if (action.revealed && action.targetPlayer == GameContext.localPlayerID) {
          ongoingActionItem.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              Locale.compose(action.name) + "[N]" + Locale.compose(action.description + "_TARGET", "LOC_DIPLOMACY_UNKNOWN_PLAYER") + "[N]" + Locale.compose(
                "LOC_DIPLOMACY_ACTION_ACTIVE_FOR_TURNS",
                Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString()
              )
            )
          );
        } else {
          ongoingActionItem.setAttribute(
            "data-tooltip-content",
            Locale.stylize(
              Locale.compose(action.name) + "[N]" + Locale.compose(action.description) + "[N]" + Locale.compose(
                "LOC_DIPLOMACY_ACTION_ACTIVE_FOR_TURNS",
                Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString()
              )
            )
          );
        }
        const currentProgress = (completionData.requiredProgress - completionData.turnsToCompletion * completionData.progressPerTurn) / completionData.requiredProgress;
        progressPercent = currentProgress * 100;
        progressString = Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString();
      }
    } else {
      const currentProgress = (completionData.requiredProgress - completionData.turnsToCompletion * completionData.progressPerTurn) / completionData.requiredProgress;
      ongoingActionItem.setAttribute(
        "data-tooltip-content",
        Locale.stylize(
          Locale.compose(action.name) + "[N]" + Locale.compose(action.description) + "[N]" + Locale.compose(
            "LOC_DIPLOMACY_ACTION_ACTIVE_FOR_TURNS",
            Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString()
          )
        )
      );
      progressPercent = currentProgress * 100;
      progressString = Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString();
    }
    if (progressPercent > 99) {
      progressPercent = 100;
      progressBarFill.classList.add("build-queue__progress-bar-fill-negative");
    }
    progressBarFill.style.height = progressPercent.toString() + "%";
    iconImage.style.backgroundImage = `url("${actionDef.UIIconPath}")`;
    const turns = document.createElement("div");
    turns.classList.add("build-queue__turn", "relative", "bottom-0", "right-0", "flex", "items-center");
    const turnsClockIcon = document.createElement("div");
    turnsClockIcon.classList.add("build-queue__turn-icon", "size-8", "relative");
    turns.appendChild(turnsClockIcon);
    const turnLabel = document.createElement("div");
    turnLabel.classList.add("build-queue__turn-value", "relative", "text-base", "font-fit-shrink", "w-9");
    turnLabel.innerHTML = progressString;
    turns.appendChild(turnLabel);
    progressTurnsContainer.appendChild(turns);
    return ongoingActionItem;
  }
  /**
   * This says "action", (at base game) the only actions are war support.
   * @param actionID
   */
  clickOngoingAction(actionID) {
    DiplomacyManager.selectedActionID = actionID;
    ContextManager.push("screen-diplomacy-action-details", { createMouseGuard: true, singleton: true });
    window.addEventListener("diplomacy-action-details-closed", this.onHandleWarSupportClosedListener);
  }
  /**
   * Signaled when the war support popup dialog has been dismissed.
   */
  onHandleWarSupportClosed() {
    window.removeEventListener("diplomacy-action-details-closed", this.onHandleWarSupportClosedListener);
    this.populateActionsPanel();
  }
  refreshTabItems(playerObject) {
    if (!this.tabBar) {
      console.error(`panel-diplomacy-actions: refreshTabItems - no tab bar to refresh!`);
      return;
    }
    if (!playerObject.isMajor) {
      this.tabBar.setAttribute(
        "tab-items",
        JSON.stringify([
          {
            id: "diplomacy-tab-actions",
            icon: "blp:projects_normal-tab-button",
            iconClass: "size-13",
            highlight: true
          }
        ])
      );
    } else {
      const playerDiplomacy = playerObject.Diplomacy;
      if (!playerDiplomacy) {
        console.error(
          `panel-diplomacy-actions: refreshTabItems - playerObject with playerID ${playerObject.id} has no diplomacy library!`
        );
        return;
      }
      const tabItems = [];
      tabItems.push({
        id: "diplomacy-tab-actions",
        icon: "blp:projects_normal-tab-button",
        className: "",
        iconClass: "size-13",
        highlight: true
      });
      tabItems.push({
        id: "diplomacy-tab-relationship",
        icon: "blp:relationships_normal-tab-button",
        className: "",
        iconClass: "size-13",
        highlight: true
      });
      tabItems.push({
        id: "diplomacy-tab-government",
        icon: "blp:govtreligion_normal-tab-button",
        className: "",
        iconClass: "size-13",
        highlight: true
      });
      tabItems.push({
        id: "diplomacy-tab-info",
        icon: "blp:lore_normal-tab-button",
        className: "",
        iconClass: "size-13",
        highlight: true
      });
      this.tabBar.setAttribute("tab-items", JSON.stringify(tabItems));
      this.infoTabIndex = tabItems.findIndex((tab) => tab.id == "diplomacy-tab-info");
      this.actionTabIndex = tabItems.findIndex((tab) => tab.id == "diplomacy-tab-actions");
      const { playerId, section } = DiploRibbonData.sectionSelected;
      if (isNaN(playerId) || playerId == PlayerIds.NO_PLAYER) {
        return;
      }
      if (section == "relationship") {
        const tabIndex = tabItems.findIndex((tab) => tab.id == "diplomacy-tab-relationship");
        if (tabIndex != -1) {
          this.tabBar.setAttribute("selected-tab-index", `${tabIndex}`);
        }
      }
      DiploRibbonData.sectionSelected = {
        playerId: PlayerIds.NO_PLAYER,
        section: "unset"
      };
    }
  }
  populatePlayerCivInfo() {
    if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
      return;
    }
    const infoContainer = MustGetElement("#panel-diplomacy-actions__info-container", this.Root);
    removeAllChildren(infoContainer);
    const playerObject = Players.get(DiplomacyManager.selectedPlayerID);
    if (!playerObject) {
      console.error(
        "panel-diplomacy-actions: Unable to get player object for selected player while trying to show civ and leader info!"
      );
      return;
    }
    const leaderDefinition = GameInfo.Leaders.lookup(playerObject.leaderType);
    if (!leaderDefinition) {
      console.error("panel-diplomacy-actions: Unable to get leader definition for selected player");
      return;
    }
    const leaderAbilitiesTitle = document.createElement("fxs-header");
    leaderAbilitiesTitle.classList.add("uppercase", "mb-4", "text-secondary", "font-title", "text-base");
    leaderAbilitiesTitle.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_LEADER_ABILITIES_TITLE");
    leaderAbilitiesTitle.setAttribute("filigree-style", "h4");
    infoContainer.appendChild(leaderAbilitiesTitle);
    const leaderBonusItems = Database.query(
      "config",
      "select * from LeaderItems order by SortIndex"
    )?.filter((item) => item.LeaderType == leaderDefinition.LeaderType);
    const leaderTrait = leaderBonusItems?.find(
      (item) => item.Kind == "KIND_TRAIT"
    );
    const leaderAbilityName = leaderTrait?.Name;
    const leaderAbilityDescription = leaderTrait?.Description;
    const leaderAbilityItem = document.createElement("div");
    leaderAbilityItem.classList.value = "flex flex-row items-center";
    infoContainer.appendChild(leaderAbilityItem);
    const leaderPortrait = this.createBorderedIcon(Icon.getLeaderPortraitIcon(playerObject.leaderType));
    leaderAbilityItem.appendChild(leaderPortrait);
    const leaderAbilityText = document.createElement("div");
    leaderAbilityText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start";
    leaderAbilityItem.appendChild(leaderAbilityText);
    const leaderAbilityNameElement = document.createElement("div");
    leaderAbilityNameElement.role = "paragraph";
    leaderAbilityNameElement.classList.value = "font-title text-base uppercase pointer-events-auto";
    leaderAbilityNameElement.innerHTML = Locale.stylize(leaderAbilityName);
    leaderAbilityText.appendChild(leaderAbilityNameElement);
    const divider = document.createElement("div");
    divider.classList.value = "w-72 filigree-divider-inner-frame my-2";
    leaderAbilityText.appendChild(divider);
    const leaderAbilityDescriptionElement = document.createElement("div");
    leaderAbilityNameElement.role = "paragraph";
    leaderAbilityDescriptionElement.classList.value = "font-body text-sm w-full pointer-events-auto";
    leaderAbilityDescriptionElement.innerHTML = Locale.stylize(leaderAbilityDescription);
    leaderAbilityText.appendChild(leaderAbilityDescriptionElement);
    const civDefinition = GameInfo.Civilizations.lookup(
      playerObject.civilizationType
    );
    if (!civDefinition) {
      console.error("panel-diplomacy-actions: Unable to get civilization definition for selected player");
      return;
    }
    const player = Players.get(DiplomacyManager.selectedPlayerID);
    if (player?.Culture != null) {
      const playerIdeology = player.Culture.getChosenIdeology();
      if (playerIdeology != -1) {
        const ideologyDef = GameInfo.Ideologies.find((item) => {
          return Database.makeHash(item.IdeologyType) == playerIdeology;
        });
        if (ideologyDef != null) {
          const ideologyTitle = document.createElement("fxs-header");
          ideologyTitle.classList.add(
            "uppercase",
            "mt-12",
            "mb-4",
            "text-secondary",
            "font-title",
            "text-base"
          );
          ideologyTitle.setAttribute("title", "LOC_IDEOLOGY");
          ideologyTitle.setAttribute("filigree-style", "h4");
          infoContainer.appendChild(ideologyTitle);
          const ideologyItem = document.createElement("div");
          ideologyItem.classList.value = "flex flex-row items-center";
          infoContainer.appendChild(ideologyItem);
          const leaderPortrait2 = this.createBorderedIcon(Icon.getLeaderPortraitIcon(playerObject.leaderType));
          ideologyItem.appendChild(leaderPortrait2);
          const ideologyText = document.createElement("div");
          ideologyText.role = "paragraph";
          ideologyText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start pointer-events-auto";
          ideologyItem.appendChild(ideologyText);
          const ideologyName = document.createElement("div");
          ideologyName.classList.value = "font-title text-sm uppercase";
          ideologyName.innerHTML = Locale.stylize(ideologyDef.Name);
          ideologyText.appendChild(ideologyName);
          const divider2 = document.createElement("div");
          divider2.classList.value = "w-72 filigree-divider-inner-frame my-2";
          ideologyText.appendChild(divider2);
        }
      }
    }
    const agendaNames = Game.Diplomacy.getAgendaNames(DiplomacyManager.selectedPlayerID);
    if (player != null && player.isAI && agendaNames.length > 0) {
      const agendaDescs = Game.Diplomacy.getAgendaDescriptions(DiplomacyManager.selectedPlayerID);
      const agendaTitle = document.createElement("fxs-header");
      agendaTitle.classList.add("uppercase", "mt-12", "mb-4", "text-secondary", "font-title", "text-base");
      agendaTitle.setAttribute("title", "LOC_DIPLOMACY_AGENDA_TITLE");
      agendaTitle.setAttribute("filigree-style", "h4");
      infoContainer.appendChild(agendaTitle);
      const leaderAgendaItem = document.createElement("div");
      leaderAgendaItem.classList.value = "flex flex-row items-center";
      infoContainer.appendChild(leaderAgendaItem);
      const leaderPortrait2 = this.createBorderedIcon(Icon.getLeaderPortraitIcon(playerObject.leaderType));
      leaderAgendaItem.appendChild(leaderPortrait2);
      const agendaText = document.createElement("div");
      agendaText.role = "paragraph";
      agendaText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start pointer-events-auto";
      leaderAgendaItem.appendChild(agendaText);
      for (let i = 0; i < agendaNames.length && i < agendaDescs.length; i++) {
        const agendaName = document.createElement("div");
        agendaName.classList.value = "font-title text-sm  uppercase";
        if (i > 0) {
          agendaName.classList.value += " mt-6";
        }
        agendaName.innerHTML = Locale.stylize(agendaNames[i]);
        agendaText.appendChild(agendaName);
        const divider2 = document.createElement("div");
        divider2.classList.value = "w-72 filigree-divider-inner-frame my-2";
        agendaText.appendChild(divider2);
        const agendaDesc = document.createElement("div");
        agendaDesc.classList.value = "font-body text-sm ";
        agendaDesc.innerHTML = Locale.stylize(agendaDescs[i]);
        agendaText.appendChild(agendaDesc);
      }
    }
    const mementosHeader = document.createElement("fxs-header");
    mementosHeader.classList.add("uppercase", "mt-12", "mb-4", "text-secondary", "font-title", "text-base");
    mementosHeader.setAttribute("title", civDefinition.FullName);
    mementosHeader.setAttribute("filigree-style", "h4");
    infoContainer.appendChild(mementosHeader);
    const civBonusItems = Database.query(
      "config",
      "select * from CivilizationItems order by SortIndex"
    )?.filter((item) => item.CivilizationType == civDefinition.CivilizationType);
    const civTrait = civBonusItems?.find(
      (item) => item.Kind == "KIND_TRAIT"
    );
    const civAbilityName = civTrait?.Name;
    const civAbilityDescription = civTrait?.Description;
    const civUniqueItems = civBonusItems?.filter(
      (item) => item.Kind == "KIND_BUILDING" || item.Kind == "KIND_IMPROVEMENT" || item.Kind == "KIND_UNIT" || item.Kind == "KIND_QUARTER"
    );
    const civLegacyTrait = GameInfo.LegacyCivilizationTraits.lookup(civDefinition.CivilizationType);
    if (civLegacyTrait) {
      const civTraditions = Database.query(
        "gameplay",
        `SELECT *, TraditionType as Type, "KIND_TRADITION" AS Kind FROM Traditions`
      )?.filter((item) => item.TraitType == civLegacyTrait?.TraitType && !item.IsCrisis);
      if (civTraditions) {
        civUniqueItems?.push(...civTraditions);
      }
    }
    const uniqueTypes = `${civUniqueItems?.map((item) => {
      return `"${item.Type}"`;
    }).join(",")}`;
    const unlockNodes = Database.query(
      "gameplay",
      `SELECT ProgressionTreeNodes.ProgressionTreeNodeType, ProgressionTreeNodeUnlocks.TargetType, ProgressionTreeNodes.Name FROM ProgressionTreeNodeUnlocks JOIN ProgressionTreeNodes ON ProgressionTreeNodes.ProgressionTreeNodeType == ProgressionTreeNodeUnlocks.ProgressionTreeNodeType WHERE ProgressionTreeNodeUnlocks.TargetType IN (${uniqueTypes});`
    );
    const civBonusItem = document.createElement("div");
    civBonusItem.classList.value = "flex flex-row items-center mb-4";
    infoContainer.appendChild(civBonusItem);
    const civBonusIcon = document.createElement("fxs-icon");
    civBonusIcon.classList.add("size-12");
    civBonusIcon.setAttribute("data-icon-context", "DEFAULT");
    civBonusIcon.setAttribute("data-icon-id", civDefinition.CivilizationType);
    civBonusItem.appendChild(civBonusIcon);
    const civBonusText = document.createElement("div");
    civBonusText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start";
    civBonusItem.appendChild(civBonusText);
    const abilityNameElement = document.createElement("div");
    abilityNameElement.classList.value = "font-title text-sm  uppercase";
    abilityNameElement.innerHTML = Locale.stylize(civAbilityName);
    civBonusText.appendChild(abilityNameElement);
    civBonusText.appendChild(divider.cloneNode());
    const abilityDescriptionElement = document.createElement("div");
    abilityDescriptionElement.classList.value = "font-body text-sm w-full";
    abilityDescriptionElement.innerHTML = Locale.stylize(civAbilityDescription);
    civBonusText.appendChild(abilityDescriptionElement);
    civUniqueItems?.forEach((uniqueItem) => {
      const civBonusItem2 = document.createElement("div");
      civBonusItem2.classList.value = "flex flex-row items-center mb-4";
      infoContainer.appendChild(civBonusItem2);
      let iconName = "";
      let typeName = "";
      switch (uniqueItem.Kind) {
        case "KIND_UNIT":
          iconName = uniqueItem.Type;
          typeName = Locale.compose("LOC_UNIT_UNIQUE_TITLE");
          break;
        case "KIND_IMPROVEMENT":
          iconName = uniqueItem.Type;
          typeName = Locale.compose("LOC_BUILDING_UNIQUE_TITLE");
          break;
        case "KIND_BUILDING":
          iconName = uniqueItem.Type;
          typeName = Locale.compose("LOC_BUILDING_UNIQUE_TITLE");
          break;
        case "KIND_QUARTER":
          typeName = Locale.compose("LOC_UI_PRODUCTION_UNIQUE_QUARTER");
          iconName = "CITY_UNIQUE_QUARTER";
          break;
        case "KIND_TRADITION":
          typeName = Locale.compose("LOC_UI_TRADITION_TITLE");
          iconName = "KIND_TRADITION_UNLOCK";
          break;
        default:
          break;
      }
      const itemIcon = document.createElement("fxs-icon");
      itemIcon.classList.add("size-12");
      itemIcon.setAttribute("data-icon-context", "DEFAULT");
      itemIcon.setAttribute("data-icon-id", iconName);
      civBonusItem2.appendChild(itemIcon);
      const itemText = document.createElement("div");
      itemText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start";
      const itemName = document.createElement("div");
      itemName.role = "paragraph";
      itemName.classList.value = "font-title text-sm mt-4 uppercase pointer-events-auto";
      itemName.innerHTML = Locale.stylize(uniqueItem.Name);
      itemText.appendChild(itemName);
      itemText.appendChild(divider.cloneNode(true));
      const itemTypeName = document.createElement("div");
      itemTypeName.role = "paragraph";
      itemTypeName.classList.value = "font-body font-bold pointer-events-auto";
      itemTypeName.innerHTML = typeName;
      itemText.appendChild(itemTypeName);
      const unlockNode = unlockNodes?.filter((item) => item.TargetType == uniqueItem.Type);
      if (unlockNode && unlockNode.length > 0) {
        const itemUnlock = document.createElement("div");
        itemUnlock.role = "paragraph";
        itemUnlock.classList.value = "font-body text-accent-3 text-sm w-full pointer-events-auto";
        itemUnlock.innerHTML = Locale.stylize(
          `{LOC_LOADING_TRADITION_UNLOCKED_WITH} [B]{${unlockNode[0].Name}}[/B]`
        );
        itemText.appendChild(itemUnlock);
      }
      const itemDescription = document.createElement("div");
      itemDescription.role = "paragraph";
      itemDescription.classList.value = "font-body text-sm w-full pointer-events-auto";
      itemDescription.innerHTML = Locale.stylize(uniqueItem.Description);
      itemText.appendChild(itemDescription);
      civBonusItem2.appendChild(itemText);
      infoContainer.appendChild(civBonusItem2);
    });
    const mementosData = Online.Metaprogression.getEquippedMementos(DiplomacyManager.selectedPlayerID);
    if (mementosData.length > 0) {
      const mementosHeader2 = document.createElement("fxs-header");
      mementosHeader2.classList.add("uppercase", "mt-12", "mb-4", "text-secondary", "font-title", "text-base");
      mementosHeader2.setAttribute("title", "LOC_LEADER_MEMENTOS_TITLE");
      mementosHeader2.setAttribute("filigree-style", "h4");
      infoContainer.appendChild(mementosHeader2);
      mementosData.forEach((memento) => {
        const mementoItem = document.createElement("div");
        mementoItem.role = "paragraph";
        mementoItem.classList.value = "flex flex-row items-center mb-4 pointer-events-auto";
        infoContainer.appendChild(mementoItem);
        const itemIcon = document.createElement("div");
        itemIcon.classList.value = "relative size-18 bg-center bg-contain bg-no-repeat";
        itemIcon.style.backgroundImage = `url("blp:${memento.isMajorTier ? "mem_maj_leader" : "mem_min_leader"}")`;
        mementoItem.appendChild(itemIcon);
        const itemText = document.createElement("div");
        itemText.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start";
        const itemName = document.createElement("div");
        itemName.classList.value = "font-title text-sm mt-4  uppercase";
        itemName.innerHTML = Locale.stylize(memento.mementoName);
        itemText.appendChild(itemName);
        itemText.appendChild(divider.cloneNode(true));
        const itemDescription = document.createElement("div");
        itemDescription.classList.value = "font-body text-sm w-full";
        itemDescription.innerHTML = Locale.stylize(memento.functionalTextDesc);
        itemText.appendChild(itemDescription);
        mementoItem.appendChild(itemText);
        infoContainer.appendChild(mementoItem);
      });
    }
  }
  populateGovernmentInfo() {
    if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
      return;
    }
    const governmentContainer = MustGetElement("#panel-diplomacy-actions__government-container", this.Root);
    removeAllChildren(governmentContainer);
    const playerObject = Players.get(DiplomacyManager.selectedPlayerID);
    if (!playerObject) {
      console.error(
        "panel-diplomacy-actions: Unable to get player object for selected player while trying to government info!"
      );
      return;
    }
    if (!playerObject.Culture) {
      console.error("panel-diplomacy-actions: No valid culture object attached to selected player!");
      return;
    }
    const governmentDefinition = GameInfo.Governments.lookup(
      playerObject.Culture.getGovernmentType()
    );
    if (governmentDefinition) {
      const governmentTitle = document.createElement("fxs-header");
      governmentTitle.classList.add("uppercase", "mb-4", "font-title", "text-base", "text-secondary");
      governmentTitle.setAttribute("title", governmentDefinition.Name);
      governmentTitle.setAttribute("filigree-style", "h4");
      governmentContainer.appendChild(governmentTitle);
      if (!governmentDefinition.Description) {
        console.error(
          "panel-diplomacy-actions: No description for government: " + governmentDefinition.GovernmentType
        );
        return;
      }
      const governmentDescription = document.createElement("p");
      governmentDescription.classList.add("font-body", "text-sm", "mb-2");
      governmentDescription.innerHTML = Locale.compose(governmentDefinition.Description);
      governmentContainer.appendChild(governmentDescription);
      const governmentCelebrationTypes = Game.Culture.GetCelebrationTypesForGovernment(
        governmentDefinition.GovernmentType
      );
      const playerHappiness = playerObject.Happiness;
      if (playerHappiness != void 0) {
        for (const celebrationChoice of governmentCelebrationTypes) {
          const celebrationItemDef = GameInfo.GoldenAges.lookup(celebrationChoice);
          if (!celebrationItemDef) {
            console.error(
              `screen-government-picker: render - No golden age definition found for ${celebrationChoice}!`
            );
            continue;
          }
          const celebrationChoiceContainer = document.createElement("div");
          celebrationChoiceContainer.classList.value = "flex items-center mb-3 max-w-3\\/4 text-sm";
          const celebrationItemImage = document.createElement("div");
          celebrationItemImage.classList.value = "bg-no-repeat bg-center bg-contain size-8 mr-3";
          celebrationItemImage.style.backgroundImage = `url(${UI.getIconURL(celebrationItemDef.GoldenAgeType)})`;
          celebrationChoiceContainer.appendChild(celebrationItemImage);
          const celebrationItemDesc = document.createElement("div");
          celebrationItemDesc.classList.value = "font-body text-sm";
          celebrationItemDesc.innerHTML = Locale.stylize(
            celebrationItemDef.Description,
            playerHappiness.getGoldenAgeDuration()
          );
          celebrationChoiceContainer.appendChild(celebrationItemDesc);
          governmentContainer.appendChild(celebrationChoiceContainer);
        }
      }
    }
    if (!playerObject.Religion) {
      console.error("panel-diplomacy-actionss: no valid PlayerReligion attached to player!");
      return;
    }
    const playerPantheons = playerObject.Religion.getPantheons();
    if (playerPantheons.length > 0) {
      let religionTitleText = playerObject.Religion.getReligionName();
      if (religionTitleText == "") {
        religionTitleText = "LOC_TUTORIAL_PANTHEON_UNLOCKED_TITLE";
      }
      const religionTitle = document.createElement("fxs-header");
      religionTitle.classList.add("uppercase", "mt-6", "mb-1", "font-title", "text-base", "text-secondary");
      religionTitle.setAttribute("title", religionTitleText);
      religionTitle.setAttribute("filigree-style", "h4");
      governmentContainer.appendChild(religionTitle);
    }
    playerPantheons.forEach((pantheon, index) => {
      const pantheonDef = GameInfo.Beliefs.lookup(pantheon);
      if (!pantheonDef) {
        console.error(
          `screen-diplomacy-actions: populateGovernmentInfo - No belief def found for type ${pantheon}`
        );
        return;
      }
      if (index > 0) {
        const divider = document.createElement("div");
        divider.classList.add("w-60", "filigree-divider-inner-frame", "self-center", "mb-2");
        governmentContainer.appendChild(divider);
      }
      const pantheonItem = document.createElement("div");
      pantheonItem.classList.value = "flex flex-row items-center";
      const pantheonIconContainer = document.createElement("img");
      pantheonIconContainer.classList.value = "size-19 flex items-center justify-center pointer-events-none relative";
      pantheonItem.appendChild(pantheonIconContainer);
      const pantheonIcon = document.createElement("img");
      pantheonIcon.classList.value = "relative flex flex-col items-center size-14 -top-px bg-center";
      pantheonIcon.src = UI.getIcon(pantheonDef.BeliefType, "PANTHEONS");
      pantheonIconContainer.appendChild(pantheonIcon);
      const iconFront = document.createElement("div");
      iconFront.classList.value = "absolute img-civics-icon-frame size-19 flex self-center items-center justify-center pointer-events-none relative";
      pantheonIconContainer.appendChild(iconFront);
      const pantheonInfoContainer = document.createElement("div");
      pantheonInfoContainer.classList.value = "flex flex-col flex-auto ml-1 justify-center items-start";
      pantheonItem.appendChild(pantheonInfoContainer);
      const pantheonTitle = document.createElement("div");
      pantheonTitle.role = "paragraph";
      pantheonTitle.classList.value = "font-title text-base pointer-events-auto";
      pantheonTitle.innerHTML = Locale.stylize(pantheonDef.Name);
      pantheonInfoContainer.appendChild(pantheonTitle);
      const pantheonDescription = document.createElement("div");
      pantheonDescription.role = "paragraph";
      pantheonDescription.classList.value = "font-body text-sm flex flex-col pointer-events-auto";
      pantheonDescription.innerHTML = Locale.stylize(pantheonDef.Description);
      pantheonInfoContainer.appendChild(pantheonDescription);
      governmentContainer.appendChild(pantheonItem);
    });
  }
  populateRelationshipInfo() {
    if (!this.checkShouldShowPanel()) {
      return;
    }
    const relationshipEventContainer = MustGetElement(
      "#panel-diplomacy-actions__relationship-event-container",
      this.Root
    );
    removeAllChildren(relationshipEventContainer);
    const playerLibrary = Players.get(DiplomacyManager.selectedPlayerID);
    if (!playerLibrary) {
      console.error(
        "panel-diplomacy-actions: Unable to get player library for player with id: " + DiplomacyManager.selectedPlayerID
      );
      return;
    }
    const playerDiplomacy = playerLibrary.Diplomacy;
    if (playerDiplomacy === void 0) {
      console.error(
        "panel-diplomacy-actions: Attempting to update relationship info screen, but unable to get selected player diplomacy library"
      );
      return;
    }
    const relationshipBreakdown = new RelationshipBreakdown(
      DiplomacyManager.selectedPlayerID,
      GameContext.localPlayerID
    );
    relationshipBreakdown.root.classList.add("w-128", "self-center");
    relationshipEventContainer.appendChild(relationshipBreakdown.root);
    relationshipBreakdown.update(DiplomacyManager.selectedPlayerID, GameContext.localPlayerID);
    const localPlayerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error("panel-diplomacy-actions: Unable to get PlayerLibrary for local player!");
      return;
    }
    const otherRelationships = [];
    for (const id of Players.getAliveIds()) {
      const playerLibrary2 = Players.get(id);
      if (!playerLibrary2 || !playerLibrary2.isMajor || id != GameContext.localPlayerID && !playerDiplomacy.hasMet(id)) {
        continue;
      }
      const otherRelationshipData = {
        leaderID: id,
        relationshipLevel: playerDiplomacy.getRelationshipEnum(id),
        portraitIcon: localPlayerDiplomacy.hasMet(id) || GameContext.localPlayerID == id ? Icon.getLeaderPortraitIcon(playerLibrary2.leaderType) : "blp:leader_portrait_unknown"
      };
      if (playerDiplomacy.isAtWarWith(id)) {
        otherRelationshipData.atWar = true;
      } else if (playerDiplomacy.hasAllied(id)) {
        otherRelationshipData.allied = true;
      }
      otherRelationships.push(otherRelationshipData);
    }
    const otherRelationshipsHeader = MustGetElement(
      "#panel-diplomacy-actions__other-relationships-header-name",
      this.Root
    );
    otherRelationshipsHeader.role = "header";
    otherRelationshipsHeader.innerHTML = Locale.compose(playerLibrary.leaderName);
    const otherRelationshipsContainer = MustGetElement(
      "#panel-diplomacy-actions__other-relationships-container",
      this.Root
    );
    removeAllChildren(otherRelationshipsContainer);
    otherRelationships.forEach((relationship) => {
      const row = this.getRelationshipRow(relationship);
      if (!row) {
        console.error(
          "Panel-diplomacy-actions: Unable to find relationship row for relationship type: " + relationship.relationshipLevel
        );
        return;
      }
      const iconRow = MustGetElement("#relationship-icon-row", row);
      iconRow.appendChild(this.createBorderedIcon(relationship.portraitIcon, relationship.leaderID));
      otherRelationshipsContainer.appendChild(row);
    });
    const relationshipAmountValue = playerDiplomacy.getRelationshipLevel(GameContext.localPlayerID);
    waitForLayout(() => {
      const relationshipButton = this.Root.querySelector("#diplomacy-tab-relationship-tab-item");
      if (relationshipButton) {
        let relationshipButtonNumber = relationshipButton.querySelector("#relationship-button-number");
        if (!relationshipButtonNumber) {
          const relationshipButtonImg = MustGetElement("fxs-stateful-icon", relationshipButton);
          relationshipButtonImg.classList.add("flex", "justify-center");
          relationshipButtonNumber = document.createElement("div");
          relationshipButtonNumber.setAttribute("id", "relationship-button-number");
          relationshipButtonNumber.classList.value = "font-title text-xs text-center self-center font-bold absolute";
          relationshipButtonImg.appendChild(relationshipButtonNumber);
        }
        let relationshipAmountString = relationshipAmountValue.toString();
        if (relationshipAmountValue < 0) {
          relationshipAmountString = (relationshipAmountValue * -1).toString();
        }
        relationshipButtonNumber.innerHTML = relationshipAmountString;
        relationshipButtonNumber.classList.toggle("text-positive-dark", relationshipAmountValue > 0);
        relationshipButtonNumber.classList.toggle("text-negative-dark", relationshipAmountValue < 0);
      }
    });
  }
  createBorderedIcon(iconURL, leaderID) {
    const portrait = document.createElement("div");
    portrait.classList.add("panel-diplomacy-actions__ongoing-action-portrait", "pointer-events-auto");
    const portraitBG = document.createElement("div");
    portraitBG.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-bg");
    portrait.appendChild(portraitBG);
    const portraitBGInner = document.createElement("div");
    portraitBGInner.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-bg-inner");
    portrait.appendChild(portraitBGInner);
    const portraitIcon = document.createElement("div");
    portraitIcon.classList.add("panel-diplomacy-actions__ongoing-actions-portrait-image");
    portraitIcon.style.backgroundImage = `url(${iconURL})`;
    portrait.appendChild(portraitIcon);
    if (leaderID != void 0) {
      const otherLeaderLibrary = Players.get(leaderID);
      if (!otherLeaderLibrary) {
        console.error(
          `panel-diplomacy-action: createBorderedIcon - no player library found for player ID ${leaderID}`
        );
        return portrait;
      }
      const localPlayer = Players.get(GameContext.localPlayerID);
      if (!localPlayer) {
        console.error(`panel-diplomacy-action: createBorderedIcon - no local player library found!`);
        return portrait;
      }
      const localPlayerDiplomacy = localPlayer.Diplomacy;
      if (!localPlayerDiplomacy) {
        console.error(`panel-diplomacy-action: createBorderedIcon - no local player diplomacy library found!`);
        return portrait;
      }
      if (localPlayerDiplomacy.hasMet(leaderID) || GameContext.localPlayerID == leaderID) {
        portrait.setAttribute("data-tooltip-content", Locale.compose(otherLeaderLibrary.name));
      } else {
        portrait.setAttribute("data-tooltip-content", Locale.compose("LOC_LEADER_UNMET_NAME"));
      }
    }
    return portrait;
  }
  getRelationshipRow(relationship) {
    if (relationship.atWar) {
      return this.findOrCreateRelationshipRow("at-war", "LOC_PLAYER_RELATIONSHIP_AT_WAR");
    } else if (relationship.allied) {
      return this.findOrCreateRelationshipRow("allied", "LOC_PLAYER_RELATIONSHIP_ALLIANCE");
    } else {
      switch (relationship.relationshipLevel) {
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_FRIENDLY:
          return this.findOrCreateRelationshipRow(
            DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_FRIENDLY.toString(),
            "LOC_PLAYER_RELATIONSHIP_FRIENDLY"
          );
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HELPFUL:
          return this.findOrCreateRelationshipRow(
            DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HELPFUL.toString(),
            "LOC_PLAYER_RELATIONSHIP_HELPFUL"
          );
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE:
          return this.findOrCreateRelationshipRow(
            DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_HOSTILE.toString(),
            "LOC_PLAYER_RELATIONSHIP_HOSTILE"
          );
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNFRIENDLY:
          return this.findOrCreateRelationshipRow(
            DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNFRIENDLY.toString(),
            "LOC_PLAYER_RELATIONSHIP_UNFRIENDLY"
          );
        case DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_NEUTRAL:
          return this.findOrCreateRelationshipRow(
            DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_NEUTRAL.toString(),
            "LOC_PLAYER_RELATIONSHIP_NEUTRAL"
          );
        default:
          return null;
      }
    }
  }
  findOrCreateRelationshipRow(id, titleString) {
    let relatioshipRowWrapper = this.Root.querySelector(
      `#panel-diplomacy-actions__relationship-row-${id}`
    );
    if (!relatioshipRowWrapper) {
      relatioshipRowWrapper = document.createElement("div");
      relatioshipRowWrapper.setAttribute("id", `panel-diplomacy-actions__relationship-row-${id}`);
      const relationshipRow = document.createElement("div");
      relationshipRow.role = "paragraph";
      relationshipRow.classList.add(
        "flex",
        "flex-row",
        "h-15",
        "items-center",
        "mt-2",
        "border-b-accent",
        "pointer-events-auto"
      );
      const title = document.createElement("div");
      title.classList.value = "font-body text-sm ml-2 w-24 font-fit-shrink";
      title.innerHTML = Locale.compose(titleString);
      const iconRow = document.createElement("div");
      iconRow.classList.value = "flex-wrap flex flex-auto relative flex-row";
      iconRow.setAttribute("id", "relationship-icon-row");
      relationshipRow.appendChild(title);
      relationshipRow.appendChild(iconRow);
      relatioshipRowWrapper.appendChild(relationshipRow);
      const divider = document.createElement("div");
      divider.classList.add("w-60", "filigree-divider-inner-frame", "self-center");
      relatioshipRowWrapper.appendChild(divider);
    }
    return relatioshipRowWrapper;
  }
  setOngoingActionsScrollablePosition() {
    const ongoingActionsScrollable = MustGetElement(
      ".panel-diplomacy-actions__ongoing-actions-scrollable",
      this.Root
    );
    const ribbonStats = Configuration.getUser().getValue("RibbonStats");
    if (ribbonStats == RibbonStatsToggleStatus.RibbonStatsShowing) {
      ongoingActionsScrollable.classList.add("panel-diplomacy-actions__ribbons-showing");
      ongoingActionsScrollable.classList.remove("panel-diplomacy-actions__ribbons-not-showing");
    } else {
      ongoingActionsScrollable.classList.add("panel-diplomacy-actions__ribbons-not-showing");
      ongoingActionsScrollable.classList.remove("panel-diplomacy-actions__ribbons-showing");
    }
  }
  onCollapseActionSection(collapseButton, actionsContainer) {
    const type = collapseButton.getAttribute("type");
    if (type == "minus") {
      collapseButton.setAttribute("type", "plus");
      actionsContainer.classList.add("hidden");
      Audio.playSound("data-audio-dropdown-close");
    } else {
      collapseButton.setAttribute("type", "minus");
      actionsContainer.classList.remove("hidden");
      Audio.playSound("data-audio-dropdown-open");
    }
  }
  populateActionsPanel() {
    if (!this.checkShouldShowPanel()) {
      return;
    }
    if (DiplomacyManager.selectedPlayerID == PlayerIds.NO_PLAYER) {
      console.error(
        "panel-diplomacy-actions: Trying to view ongoing diplomatic actions without a valid player selected!"
      );
      this.close();
      return;
    }
    const availableProjectsSlot = MustGetElement("#available-projects-slot", this.Root);
    removeAllChildren(availableProjectsSlot);
    const wars = [];
    const otherPlayer = Players.get(DiplomacyManager.selectedPlayerID);
    if (otherPlayer != null && otherPlayer.isMajor) {
      const theirWars = Game.Diplomacy.getPlayerEvents(
        DiplomacyManager.selectedPlayerID
      ).filter((action) => {
        return action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR;
      });
      theirWars.forEach((war) => {
        if ((war.targetPlayer == GameContext.localPlayerID || war.initialPlayer == GameContext.localPlayerID) && (war.targetPlayer == DiplomacyManager.selectedPlayerID || war.initialPlayer == DiplomacyManager.selectedPlayerID) && !wars.find((w) => war.uniqueID == w.uniqueID)) {
          wars.push(war);
        }
      });
    }
    this.firstFocusSection = null;
    if (wars.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_WAR_HEADER");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      this.firstFocusSection = collapseButton;
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "h-auto",
        "w-auto",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      wars.forEach((war) => {
        const warChooserItem = this.createWarInfoElement(war);
        actionsContainer.appendChild(warChooserItem);
        warChooserItem.addEventListener("action-activate", () => {
          this.clickOngoingAction(war.uniqueID);
        });
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    DiplomacyManager.queryAvailableProjectData(DiplomacyManager.selectedPlayerID);
    let hasAvailableProjects = false;
    if (DiplomacyManager.availableTreaties.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_AVAILABLE_TREATIES");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      DiplomacyManager.availableTreaties.forEach((project) => {
        const newItem = this.createStartActionListItem(project);
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (DiplomacyManager.availableProjects.length > 0) {
      hasAvailableProjects = true;
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_AVAILABLE_PROJECTS");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      DiplomacyManager.availableProjects.forEach((project) => {
        const newItem = this.createStartActionListItem(project);
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (DiplomacyManager.availableEndeavors.length > 0) {
      hasAvailableProjects = true;
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_AVAILABLE_ENDEAVORS");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      DiplomacyManager.availableEndeavors.forEach((project) => {
        const newItem = this.createStartActionListItem(project);
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (DiplomacyManager.availableSanctions.length > 0) {
      hasAvailableProjects = true;
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_AVAILABLE_SANCTIONS");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      DiplomacyManager.availableSanctions.forEach((project) => {
        const newItem = this.createStartActionListItem(project);
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (DiplomacyManager.availableEspionage.length > 0) {
      hasAvailableProjects = true;
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_AVAILABLE_ESPIONAGE");
      header.setAttribute("filigree-style", "h3");
      availableProjectsSlot.appendChild(header);
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-4");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const actionsContainer = document.createElement("fxs-vslot");
      actionsContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      DiplomacyManager.availableEspionage.forEach((project) => {
        const newItem = this.createStartActionListItem(project);
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (!hasAvailableProjects) {
      const noAvailableProjectsElement = document.createElement("p");
      noAvailableProjectsElement.classList.value = "mt-16 font-title text-2xl text-center";
      noAvailableProjectsElement.innerHTML = Locale.compose("LOC_DIPLOMACY_NO_AVAILABLE_PROJECTS");
      availableProjectsSlot.appendChild(noAvailableProjectsElement);
    }
  }
  createWarInfoElement(war) {
    const warElement = document.createElement("fxs-chooser-item");
    warElement.setAttribute("show-frame-on-hover", "false");
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer?.Diplomacy) {
      console.error("panel-diplomacy-actions: createWarInfoElement - No valid PlayerDiplomacy for localPlayer");
      return warElement;
    }
    warElement.classList.add(
      "panel-diplomacy-actions__war-item",
      "text-accent-2",
      "w-136",
      "flex",
      "flex-row",
      "mb-2",
      "grow",
      "justify-between"
    );
    const bg = document.createElement("div");
    bg.classList.value = "panel-diplomacy-actions__war-item-bg absolute size-full";
    warElement.appendChild(bg);
    const border = document.createElement("div");
    border.classList.value = "panel-diplomacy-actions__war-item-border absolute size-full";
    warElement.appendChild(border);
    const initiator = Configuration.getPlayer(war.initialPlayer);
    if (!initiator.leaderTypeName) {
      console.error(
        "panel-diplomacy-actions: createWarInfoElement - Attempting to assign initiator leader icon, but no valid leaderTypeName!"
      );
      return warElement;
    }
    const initiatorIcon = document.createElement("leader-icon");
    initiatorIcon.classList.add("mx-2", "w-16", "h-16", "my-3", "pointer-events-auto");
    initiatorIcon.setAttribute("leader", initiator.leaderTypeName);
    initiatorIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(war.initialPlayer));
    if (initiator.leaderName) {
      initiatorIcon.setAttribute("data-tooltip-content", Locale.compose(initiator.leaderName));
    }
    warElement.appendChild(initiatorIcon);
    const warDetailsContainer = document.createElement("div");
    warDetailsContainer.classList.value = "flex flex-col grow mt-2 relative";
    const warData = Game.Diplomacy.getWarData(war.uniqueID, GameContext.localPlayerID);
    const warNameElement = document.createElement("div");
    warNameElement.classList.value = "font-title text-sm uppercase text-center mb-2";
    warNameElement.innerHTML = warData.warName;
    warDetailsContainer.appendChild(warNameElement);
    const supportBar = document.createElement("div");
    supportBar.classList.value = "panel-diplomacy-actions__war-item-support-tracker flex-auto h-5 relative";
    warDetailsContainer.appendChild(supportBar);
    let supportDelta = 0;
    if (war.initialPlayer == GameContext.localPlayerID || localPlayer.Diplomacy.hasAllied(war.initialPlayer) || Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(war.uniqueID).includes(GameContext.localPlayerID)) {
      bg.classList.add("-scale-x-100");
      supportDelta = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(war.uniqueID).length - Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(war.uniqueID).length;
    } else if (war.targetPlayer != GameContext.localPlayerID && !localPlayer.Diplomacy.hasAllied(war.targetPlayer) && !Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(war.uniqueID).includes(GameContext.localPlayerID)) {
      bg.classList.add("hidden");
      supportDelta = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(war.uniqueID).length - Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(war.uniqueID).length;
    } else {
      supportBar.classList.add("-scale-x-100");
      supportDelta = Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(war.uniqueID).length - Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(war.uniqueID).length;
    }
    const supportBarBorder = document.createElement("div");
    supportBarBorder.classList.value = "panel-diplomacy-actions__war-item-support-border size-full";
    supportBar.appendChild(supportBarBorder);
    const supportTracker = document.createElement("div");
    supportTracker.classList.value = "pledge-slots-container h-full absolute";
    let cappedDelta = supportDelta;
    if (cappedDelta > 20) {
      cappedDelta = 20;
    }
    if (cappedDelta < -20) {
      cappedDelta = -20;
    }
    const normalizedDelta = cappedDelta * 50 / 20;
    if (normalizedDelta > 0) {
      supportTracker.style.right = "50%";
    } else {
      supportTracker.style.left = "50%";
    }
    supportTracker.style.width = Math.abs(normalizedDelta).toString() + "%";
    supportBar.appendChild(supportTracker);
    const supportDeltaElement = document.createElement("div");
    supportDeltaElement.classList.value = "font-title text-sm text-center";
    supportDeltaElement.innerHTML = supportDelta > 0 ? "+" + supportDelta : supportDelta.toString();
    warDetailsContainer.appendChild(supportDeltaElement);
    warElement.appendChild(warDetailsContainer);
    const target = Configuration.getPlayer(war.targetPlayer);
    if (!target.leaderTypeName) {
      console.error(
        "panel-diplomacy-actions: createWarInfoElement - Attempting to assign target leader icon, but no valid leaderTypeName!"
      );
      return warElement;
    }
    const targetIcon = document.createElement("leader-icon");
    targetIcon.classList.add("mx-2", "w-16", "h-16", "my-3");
    targetIcon.setAttribute("leader", target.leaderTypeName);
    targetIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(war.targetPlayer));
    if (target.leaderName) {
      targetIcon.setAttribute("data-tooltip-content", Locale.compose(target.leaderName));
    }
    warElement.appendChild(targetIcon);
    return warElement;
  }
  onOptionsTabSelected(e) {
    e.stopPropagation();
    const player = Players.get(DiplomacyManager.selectedPlayerID);
    if (player?.isMajor && DiplomacyManager.selectedPlayerID != GameContext.localPlayerID) {
      this.majorActionsSlot?.classList.toggle("hidden", e.detail.selectedItem.id != "diplomacy-tab-actions");
    }
    this.slotGroup?.setAttribute("selected-slot", e.detail.selectedItem.id);
  }
  onInterfaceModeChanged() {
    if (this.checkShouldShowPanel() && InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB")) {
      this.checkRefesh();
      this.realizeInitialFocus();
    }
  }
  onSelectedPlayerChanged() {
    Audio.playSound("data-audio-showing", "leader-panel");
    if (this.checkShouldShowPanel()) {
      const playerObject = Players.get(DiplomacyManager.selectedPlayerID);
      if (!playerObject) {
        console.error("panel-diplomacy-actions: Unable to get player object for selected player!");
        return;
      }
      if (playerObject.isMajor) {
        this.leaderNameElement?.setAttribute("title", Locale.compose(playerObject.leaderName));
        this.mementosHeaderElement?.setAttribute(
          "title",
          Locale.compose("LOC_DIPLOMACY_CIV_NAME", playerObject.civilizationAdjective)
        );
      } else {
        this.leaderNameElement?.setAttribute("title", Locale.compose(playerObject.civilizationAdjective));
        if (playerObject.civilizationAdjective != playerObject.name) {
          this.mementosHeaderElement?.setAttribute(
            "title",
            Locale.compose("LOC_DIPLOMACY_INDEPENDENT_CIV_NAME", playerObject.name)
          );
        } else {
          this.mementosHeaderElement?.setAttribute("title", Locale.compose(""));
        }
      }
      this.civSymbol.style.backgroundImage = `url("${Icon.getCivIconForDiplomacyHeader(playerObject.civilizationType)}")`;
      this.diploTint?.style.setProperty(
        "fxs-background-image-tint",
        UI.Player.getPrimaryColorValueAsString(playerObject.id)
      );
      this.Root.classList.toggle("independent", !playerObject.isMajor);
      this.refreshTabItems(playerObject);
      const isLocalPlayer = DiplomacyManager.selectedPlayerID == GameContext.localPlayerID;
      if (playerObject.isMajor) {
        if (isLocalPlayer) {
          this.tabBar?.setAttribute("selected-tab-index", `${this.infoTabIndex}`);
        } else if (this.previousPlayer == GameContext.localPlayerID && this.previousPlayer != DiplomacyManager.selectedPlayerID) {
          this.tabBar?.setAttribute("selected-tab-index", `${this.actionTabIndex}`);
        }
      }
      if (this.initialLoadComplete) {
        this.refreshFullData();
      }
      this.realizeNavTray();
    }
    this.previousPlayer = DiplomacyManager.selectedPlayerID;
  }
  realizeInitialFocus() {
    const props = { isDisableFocusAllowed: false, direction: InputNavigationAction.NONE };
    if (this.firstFocusSection) {
      FocusManager.setFocus(this.firstFocusSection);
    } else {
      const focusableElement = Navigation.getLastFocusableElement(this.Root, props);
      if (focusableElement) {
        FocusManager.setFocus(focusableElement);
      }
    }
  }
  onActionCanceled(data) {
    const actionData = Game.Diplomacy.getDiplomaticEventData(data.actionID);
    if ((actionData.initialPlayer == DiplomacyManager.selectedPlayerID || actionData.targetPlayer == DiplomacyManager.selectedPlayerID) && this.checkShouldShowPanel() && this.initialLoadComplete) {
      this.refreshPartialData();
    }
  }
  /**
   * Handler to be overrdien in child classes for updates in response to a support change.
   * @param _actionData
   * @returns true if updates occurred, false if nothing changed.
   */
  supportChangedHandler(_actionData) {
    return false;
  }
  /**
   * Support has changed from the players.
   * @param event Gamecore event data
   */
  onSupportChanged(event) {
    const actionData = Game.Diplomacy.getDiplomaticEventData(event.actionID);
    this.supportChangedHandler(actionData);
  }
  // ------------------------------------------------------------------------
  // Handle diplomacy queue changed event
  onDiplomacyQueueChanged(data) {
    if (data.player1 == GameContext.localPlayerID || data.player2 == GameContext.localPlayerID) {
      this.diplomacyQueueChanged = true;
    }
  }
  // ------------------------------------------------------------------------
  // Handle the event stream completing
  onGameCoreEventPlaybackCompleteListener() {
    this.checkRefesh();
  }
  // ------------------------------------------------------------------------
  // Check to see if anything needs a refresh
  checkRefesh() {
    if (this.diplomacyQueueChanged) {
      this.diplomacyQueueChanged = false;
      DiplomacyManager.populateDiplomacyActions();
      this.populateActionsPanel();
      this.populateAvailableActions();
    }
  }
  /**
   * Check if we are in the proper state to show this panel
   * @returns true if panel should be shown, false otherwise.
   */
  checkShouldShowPanel() {
    return true;
  }
  showLeaderModel() {
  }
  getCostFromTargetList(projectData) {
    let cost = -1;
    projectData.targetList1.forEach((targetData) => {
      if (targetData.targetID == DiplomacyManager.selectedPlayerID) {
        cost = targetData.costYieldD;
      }
    });
    return cost;
  }
  getTargetPlayerFromTargetList(projectData) {
    const targetID = projectData.targetList1.find((targetData) => targetData.targetID)?.targetID;
    if (targetID !== void 0) {
      const targetPlayer = Players.get(targetID);
      return targetPlayer;
    } else {
      return null;
    }
  }
  refreshActionPanel() {
    const projectActionButtons = Array.from(
      this.Root.querySelectorAll(".diplomacy-projects__action-button")
    );
    DiplomacyManager.queryAvailableProjectData(DiplomacyManager.selectedPlayerID);
    for (const actionButton of projectActionButtons) {
      const actionType = actionButton.getAttribute("action-type");
      if (!actionType) {
        console.error(
          "panel-diplomacy-actions: refreshActionPanel - action button did not have an action-type attribute!"
        );
        continue;
      }
      const availableProject = DiplomacyManager.allAvailableActions.find(
        (project) => project.actionTypeName == actionType
      );
      if (!availableProject) {
        continue;
      }
      if (availableProject.projectStatus != DiplomacyProjectStatus.PROJECT_AVAILABLE && actionButton.getAttribute("disabled") != "true") {
        const replacedButton = this.createStartActionListItem(availableProject);
        actionButton.parentElement?.insertBefore(replacedButton, actionButton);
        actionButton.remove();
      }
    }
  }
  createStartActionListItem(projectData, recentlyCompletedData) {
    const startActionItem = document.createElement("fxs-chooser-item");
    startActionItem.classList.add(
      "diplomacy-projects__action-button",
      "min-h-19",
      "w-full",
      "flex",
      "flex-row",
      "justify-start",
      "items-start",
      "mb-2"
    );
    startActionItem.setAttribute("tabindex", "-1");
    startActionItem.setAttribute("data-tooltip-content", Locale.compose(projectData.projectDescription));
    startActionItem.setAttribute("action-type", projectData.actionTypeName);
    startActionItem.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
    const iconContainer = document.createElement("div");
    iconContainer.classList.value = "size-19 flex self-center items-center justify-center pointer-events-none relative";
    startActionItem.appendChild(iconContainer);
    const iconImage = document.createElement("div");
    iconImage.classList.value = "size-16 -top-px bg-center relative flex flex-col items-center bg-cover  justify-center";
    iconContainer.appendChild(iconImage);
    const iconFront = document.createElement("div");
    iconFront.classList.value = "absolute img-civics-icon-frame size-19 flex self-center items-center justify-center pointer-events-none relative";
    iconContainer.appendChild(iconFront);
    let targetPlayerId = PlayerIds.NO_PLAYER;
    if (recentlyCompletedData) {
      switch (projectData.target1Type) {
        case DiplomacyActionTargetTypes.DIPLOMACY_TARGET_INDEPENDENT:
          targetPlayerId = recentlyCompletedData.independentTarget;
          break;
        case DiplomacyActionTargetTypes.DIPLOMACY_TARGET_PLAYER:
          targetPlayerId = recentlyCompletedData.playerTarget;
          break;
      }
      const repeatIcon = document.createElement("img");
      repeatIcon.src = "blp:dip_renew_project";
      iconImage.appendChild(repeatIcon);
      const target2 = Configuration.getPlayer(targetPlayerId);
      if (target2?.leaderTypeName) {
        const targetIcon = document.createElement("leader-icon");
        targetIcon.classList.add("mr-2", "mt-1", "w-16", "h-16", "relative");
        targetIcon.setAttribute("leader", target2.leaderTypeName);
        targetIcon.setAttribute(
          "bg-color",
          UI.Player.getPrimaryColorValueAsString(recentlyCompletedData.playerTarget)
        );
        startActionItem.appendChild(targetIcon);
      }
    }
    const actionDef = GameInfo.DiplomacyActions.lookup(projectData.actionType);
    if (!actionDef) {
      console.error(
        "panel-diplomacy-actions: Unable to get definition for diplomacy action with type: " + projectData.actionTypeName
      );
      iconImage.style.backgroundImage = `url("blp:yield_influence")`;
    } else {
      iconImage.style.backgroundImage = `url("${actionDef.UIIconPath}")`;
    }
    const actionDetailsContainer = document.createElement("div");
    actionDetailsContainer.classList.add(
      "flex-auto",
      "flex",
      "flex-col",
      "justify-between",
      "items-start",
      "self-center",
      "relative"
    );
    const actionName = document.createElement("div");
    actionName.classList.add("font-title", "text-sm", "mb-1", "mt-1", "pointer-events-none", "font-fit-shrink");
    if (projectData.actionTypeName == "DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN") {
      actionName.innerHTML = Locale.compose("LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_START_ACTION_NAME");
    } else {
      actionName.innerHTML = Locale.compose(projectData.actionDisplayName);
    }
    actionDetailsContainer.appendChild(actionName);
    startActionItem.appendChild(actionDetailsContainer);
    let targetPlayer = null;
    if (recentlyCompletedData && targetPlayerId != PlayerIds.NO_PLAYER) {
      targetPlayer = Players.get(targetPlayerId);
    } else {
      targetPlayer = this.getTargetPlayerFromTargetList(projectData);
    }
    if (targetPlayer && (targetPlayer.isIndependent || targetPlayer.isMinor)) {
      const IPNameContainer = document.createElement("div");
      IPNameContainer.classList.add(
        "flex-auto",
        "flex",
        "flex-col",
        "justify-between",
        "items-start",
        "self-center",
        "relative"
      );
      const IPName = document.createElement("div");
      IPName.classList.add(
        "font-title",
        "text-sm",
        "mb-1",
        "mt-1",
        "mr-12",
        "pointer-events-none",
        "font-fit-shrink"
      );
      IPName.innerHTML = Locale.stylize(targetPlayer.civilizationFullName);
      IPNameContainer.appendChild(IPName);
      startActionItem.appendChild(IPNameContainer);
    }
    const target = recentlyCompletedData ? targetPlayerId : DiplomacyManager.selectedPlayerID;
    const relationshipDeltas = Game.Diplomacy.getActionRelationshipDelta(target, projectData.actionType);
    if (projectData.projectStatus != DiplomacyProjectStatus.PROJECT_AVAILABLE) {
      const turnsToComplete = Game.Diplomacy.getBaseDiplomaticActionDuration(projectData.actionType);
      let tooltip = Locale.stylize(
        projectData.projectDescription + "[N]" + (turnsToComplete > 0 ? Locale.compose("LOC_DIPLOMACY_ACTION_LASTS_FOR_TURNS", turnsToComplete) : "")
      );
      if (relationshipDeltas[0] != 0) {
        const acceptedRelationshipTooltip = Locale.compose(
          "LOC_DIPLOMACY_RELATIONSHIP_CHANGE_ACCEPTED",
          relationshipDeltas[0]
        );
        tooltip = tooltip + Locale.stylize("[N]" + acceptedRelationshipTooltip);
      }
      if (relationshipDeltas[1] != 0) {
        const supportedRelationshipTooltip = Locale.compose(
          "LOC_DIPLOMACY_RELATIONSHIP_CHANGE_SUPPORTED",
          relationshipDeltas[1]
        );
        tooltip = tooltip + Locale.stylize("[N]" + supportedRelationshipTooltip);
      }
      startActionItem.setAttribute("data-tooltip-content", tooltip);
      startActionItem.setAttribute("disabled", "true");
      const disabledReason = document.createElement("div");
      disabledReason.classList.add("font-body", "text-2xs", "mb-1", "text-negative", "z-1");
      let failureString = "";
      projectData.resultData.FailureReasons?.forEach((reason, index) => {
        if (index > 0) {
          failureString += "[N]";
        }
        failureString += reason;
      });
      disabledReason.innerHTML = Locale.stylize(failureString);
      actionDetailsContainer.appendChild(disabledReason);
    } else {
      const turnsToComplete = Game.Diplomacy.getBaseDiplomaticActionDuration(projectData.actionType);
      let tooltip = Locale.stylize(
        projectData.projectDescription + "[N]" + (turnsToComplete > 0 ? Locale.compose("LOC_DIPLOMACY_ACTION_LASTS_FOR_TURNS", turnsToComplete) : "")
      );
      if (relationshipDeltas[0] != 0) {
        const acceptedRelationshipTooltip = Locale.stylize(
          "LOC_DIPLOMACY_RELATIONSHIP_CHANGE_ACCEPTED",
          relationshipDeltas[0]
        );
        tooltip = tooltip + Locale.stylize("[N]" + acceptedRelationshipTooltip);
      }
      if (relationshipDeltas[1] != 0) {
        const supportedRelationshipTooltip = Locale.stylize(
          "LOC_DIPLOMACY_RELATIONSHIP_CHANGE_SUPPORTED",
          relationshipDeltas[1]
        );
        tooltip = tooltip + Locale.stylize("[N]" + supportedRelationshipTooltip);
      }
      startActionItem.setAttribute("data-tooltip-content", tooltip);
    }
    if (projectData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE && projectData.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_COUNTER_SPY) {
      const projectDefinition = GameInfo.DiplomacyActions.lookup(
        projectData.actionType
      );
      if (!projectDefinition) {
        console.error(
          `panel-diplomacy-actions: createStartActionListItem - no project definition found for ${projectData.actionType}`
        );
        return startActionItem;
      }
      const chanceContainer = document.createElement("div");
      chanceContainer.classList.add("flex", "flex-row");
      actionDetailsContainer.appendChild(chanceContainer);
      const successChance = document.createElement("div");
      successChance.classList.add("font-body", "text-2xs", "mr-3", "font-bold");
      successChance.innerHTML = Locale.compose(
        "LOC_DIPLOMACY_SUCCESS_REVEAL_CHANCE",
        projectDefinition.SuccessChance,
        projectDefinition.RevealChance
      );
      chanceContainer.appendChild(successChance);
      const penalty = Game.Diplomacy.getEspionagePenaltyForReveal(
        projectData.actionType,
        GameContext.localPlayerID
      );
      if (penalty.influence != 0) {
        const penaltyContainer = document.createElement("div");
        penaltyContainer.classList.add("flex", "flex-row");
        actionDetailsContainer.appendChild(penaltyContainer);
        const influencePenalty = document.createElement("div");
        influencePenalty.classList.add("font-body", "mb-1", "text-2xs", "font-bold");
        influencePenalty.innerHTML = Locale.stylize(
          "LOC_DIPLOMACY_ESPIONAGE_PENALTY",
          penalty.influence,
          penalty.turns
        );
        penaltyContainer.appendChild(influencePenalty);
      }
      const stage1MaxTurns = Game.Diplomacy.modifyByGameSpeed(projectDefinition.BaseDuration) - projectData.lastStageDuration;
      const stage1MinTurns = stage1MaxTurns - Game.Diplomacy.modifyByGameSpeed(projectDefinition.RandomInitialProgress);
      let additionalDescriptionString = "";
      if (projectData.lastStageDuration > 0) {
        additionalDescriptionString = Locale.compose(
          "LOC_DIPLOMACY_ACTION_ESPIONAGE_TURNS_AND_DURATION",
          stage1MinTurns,
          stage1MaxTurns,
          projectData.lastStageDuration
        );
      } else {
        additionalDescriptionString = Locale.compose(
          "LOC_DIPLOMACY_ACTION_ESPIONAGE_TURNS",
          stage1MinTurns,
          stage1MaxTurns
        );
      }
      startActionItem.setAttribute(
        "data-tooltip-content",
        Locale.stylize(projectData.projectDescription + "[N]" + additionalDescriptionString)
      );
    }
    if (projectData.targetList2.length > 0 && !recentlyCompletedData) {
      startActionItem.addEventListener("action-activate", () => {
        this.clickStartActionItem(projectData);
      });
      const selectTargetButton = document.createElement("fxs-button");
      selectTargetButton.classList.add("min-w-16", "self-center", "mr-3", "relative");
      selectTargetButton.removeAttribute("tabindex");
      selectTargetButton.setAttribute("caption", Locale.compose("LOC_DIPLOMACY_SELECT_TARGET"));
      selectTargetButton.addEventListener("action-activate", () => {
        this.clickStartActionItem(projectData);
      });
      selectTargetButton.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
      if (projectData.projectStatus != DiplomacyProjectStatus.PROJECT_AVAILABLE) {
        selectTargetButton.setAttribute("disabled", "true");
      }
      startActionItem.appendChild(selectTargetButton);
    } else {
      const soundTuple = DiplomacyManager.getAudioIdForDiploAction(projectData);
      startActionItem.setAttribute(soundTuple[0], soundTuple[1]);
      if (recentlyCompletedData) {
        const actionOperationArguments = {
          Amount: 1,
          Player1: GameContext.localPlayerID,
          Type: projectData.actionType
        };
        if (recentlyCompletedData.independentTarget != -1) {
          actionOperationArguments.ID = recentlyCompletedData.independentTarget;
        }
        if (recentlyCompletedData.playerTarget != -1) {
          actionOperationArguments.Player2 = recentlyCompletedData.playerTarget;
        }
        if (recentlyCompletedData.playerTarget2 != -1) {
          actionOperationArguments.Player3 = recentlyCompletedData.playerTarget2;
        }
        if (recentlyCompletedData.targetSettlement != -1) {
          actionOperationArguments.City = recentlyCompletedData.targetSettlement;
        }
        if (recentlyCompletedData.targetUnit != -1) {
          actionOperationArguments.Unit = recentlyCompletedData.targetUnit;
        }
        startActionItem.addEventListener("action-activate", () => {
          this.clickQuickStartActionItem(projectData, recentlyCompletedData);
        });
        const results = Game.PlayerOperations.canStart(
          GameContext.localPlayerID,
          projectData.operationType,
          actionOperationArguments,
          false
        );
        if (!results.Success) {
          startActionItem.classList.add("disabled");
        }
      } else {
        startActionItem.addEventListener("action-activate", () => {
          this.clickQuickStartActionItem(projectData);
        });
      }
      const influenceContainer = document.createElement("div");
      influenceContainer.classList.add(
        "flex",
        "flex-row",
        "self-center",
        "panel-diplomacy-actions__influence-container",
        "pointer-events-none",
        "pr-3",
        "relative"
      );
      const influenceIcon = document.createElement("img");
      influenceIcon.classList.add("w-8", "h-8");
      influenceIcon.src = "blp:yield_influence";
      influenceContainer.appendChild(influenceIcon);
      const influenceCostText = document.createElement("div");
      influenceCostText.classList.add("font-body", "text-sm", "self-center");
      if (projectData.projectStatus != DiplomacyProjectStatus.PROJECT_AVAILABLE) {
        influenceCostText.classList.add("text-negative", "z-1");
      }
      influenceCostText.innerHTML = this.getCostFromTargetList(projectData).toString();
      influenceContainer.appendChild(influenceCostText);
      const navHelp = document.createElement("fxs-nav-help");
      navHelp.setAttribute("action-key", "inline-accept");
      influenceContainer.appendChild(navHelp);
      startActionItem.appendChild(influenceContainer);
    }
    return startActionItem;
  }
  clickStartActionItem(projectData) {
    DiplomacyManager.clickStartProject(projectData);
  }
  clickQuickStartActionItem(projectData, recentlyCompletedData) {
    const actionOperationArguments = {
      Amount: 1,
      Player1: GameContext.localPlayerID,
      Type: projectData.actionType
    };
    if (recentlyCompletedData) {
      if (recentlyCompletedData.independentTarget != -1) {
        actionOperationArguments.ID = recentlyCompletedData.independentTarget;
      }
      if (recentlyCompletedData.playerTarget != -1) {
        actionOperationArguments.Player2 = recentlyCompletedData.playerTarget;
      }
      if (recentlyCompletedData.playerTarget2 != -1) {
        actionOperationArguments.Player3 = recentlyCompletedData.playerTarget2;
      }
      if (recentlyCompletedData.targetSettlement != -1) {
        actionOperationArguments.City = recentlyCompletedData.targetSettlement;
      }
      if (recentlyCompletedData.targetUnit != -1) {
        actionOperationArguments.Unit = recentlyCompletedData.targetUnit;
      }
    } else if (DiplomacyManager.selectedPlayerID != GameContext.localPlayerID) {
      actionOperationArguments.Player2 = DiplomacyManager.selectedPlayerID;
      actionOperationArguments.ID = DiplomacyManager.selectedPlayerID;
    }
    const results = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      projectData.operationType,
      actionOperationArguments,
      false
    );
    if (results.Success) {
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        projectData.operationType,
        actionOperationArguments
      );
    }
  }
  populateAvailableActions() {
  }
  close() {
    if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB")) {
      DiplomacyManager.selectedActionID = -1;
      if (DiplomacyManager.currentProjectReactionRequest) {
        const closeToDiploHub = false;
        DiplomacyManager.closeCurrentDiplomacyProject(closeToDiploHub);
      }
      DiplomacyManager.lowerDiplomacyHub();
    } else {
      LeaderModelManager.clear();
    }
    if (this.initDataPopulationTimerHandle != 0) {
      clearTimeout(this.initDataPopulationTimerHandle);
      this.initDataPopulationTimerHandle = 0;
    }
  }
  showBefriendIndependentDetails() {
    if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
      const ourActions = Game.Diplomacy.getPlayerEvents(
        DiplomacyManager.selectedPlayerID
      ).filter((action) => {
        return action.initialPlayer == GameContext.localPlayerID && action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN;
      });
      let befriendIndependentActionID = -1;
      if (ourActions.length > 0) {
        befriendIndependentActionID = ourActions[0].uniqueID;
      }
      if (befriendIndependentActionID == -1) {
        const otherActions = Game.Diplomacy.getPlayerEvents(
          DiplomacyManager.selectedPlayerID
        ).filter((action) => {
          return action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN;
        });
        if (otherActions.length > 0) {
          befriendIndependentActionID = otherActions[0].uniqueID;
        }
      }
      if (befriendIndependentActionID == -1) {
        return;
      }
      DiplomacyManager.selectedActionID = befriendIndependentActionID;
      ContextManager.push("screen-befriend-independent-details", { singleton: true });
      if (this.checkShouldShowPanel()) {
        waitForLayout(() => {
          this.realizeInitialFocus();
        });
      }
    } else {
      ContextManager.pop("screen-befriend-independent-details");
    }
  }
}

export { DiplomacyActionPanel };
//# sourceMappingURL=panel-diplomacy-actions.js.map
