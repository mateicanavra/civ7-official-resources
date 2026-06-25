import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { ComponentUtilities } from '../../../core/ui-next/utilities/component-utilities.js';
import { UpdateDiploRibbonEvent } from '../diplo-ribbon/model-diplo-ribbon.js';
import { RaiseDiplomacyEvent } from '../diplomacy/diplomacy-events.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';
import LeaderModelManager from '../diplomacy/leader-model-manager.js';
import { DiplomacyActionPanel } from './panel-diplomacy-actions.js';
import styles from './panel-diplomacy-actions.scss.js';

class PlayerDiplomacyActionPanel extends DiplomacyActionPanel {
  onAttach() {
    super.onAttach();
    const horizontalContainer = MustGetElement("#panel-diplomacy-actions__horizontal-container", this.Root);
    horizontalContainer.classList.add("right-0", "flex-row-reverse");
    const relationshipHeader = MustGetElement("#panel-diplomacy-actions__other-relationships-header", this.Root);
    relationshipHeader.classList.add("hidden");
    const otherRelationsContainer = MustGetElement(
      "#panel-diplomacy-actions__other-relationships-frame",
      this.Root
    );
    otherRelationsContainer.classList.add("hidden");
    if (!this.checkShouldShowPanel()) {
      return;
    }
  }
  checkShouldShowPanel() {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB") || DiplomacyManager.selectedPlayerID != GameContext.localPlayerID) {
      if (!this.Root.classList.contains("hidden")) {
        this.Root.classList.add("hidden");
      }
      return false;
    }
    this.Root.classList.remove("hidden");
    return true;
  }
  populateOngoingProjects() {
  }
  populateActionsPanel() {
    const availableProjectsSlot = MustGetElement("#available-projects-slot", this.Root);
    while (availableProjectsSlot.hasChildNodes()) {
      availableProjectsSlot.removeChild(availableProjectsSlot.lastChild);
    }
    const wars = [];
    const localPlayerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    Players.getAliveIds().forEach((playerID) => {
      const otherPlayer = Players.get(playerID);
      if (localPlayerDiplomacy?.hasMet(playerID) && otherPlayer != null && otherPlayer.isMajor) {
        const theirWars = Game.Diplomacy.getPlayerEvents(playerID).filter((action) => {
          return action.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR;
        });
        theirWars.forEach((war) => {
          if ((localPlayerDiplomacy?.hasMet(war.targetPlayer) && localPlayerDiplomacy.hasMet(war.initialPlayer) || war.targetPlayer == GameContext.localPlayerID || war.initialPlayer == GameContext.localPlayerID) && !wars.find((w) => war.uniqueID == w.uniqueID)) {
            wars.push(war);
          }
        });
      }
    });
    if (wars.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_WARS_HEADER");
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
    const recentlyCompletedActions = Game.Diplomacy.getRecentlyEndedDiplomaticEvents(
      GameContext.localPlayerID
    ).filter((action) => {
      return action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE;
    });
    if (recentlyCompletedActions.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_RECENTLY_ENDED");
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
        "h-auto",
        "w-auto",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      recentlyCompletedActions.forEach((project) => {
        const projectUIData = Game.Diplomacy.getProjectDataForUI(
          GameContext.localPlayerID,
          project.playerTarget,
          DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
          DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
          -1,
          DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
        ).find((p) => p.actionType == project.actionType);
        if (!projectUIData) {
          if (project.playerTarget != -1 && project.playerTarget2 != -1 && project.independentTarget != -1) {
            console.error(
              "panel-diplomacy-actions: Unable to get DiplomaticProjectUIData for recently completed project of type: " + project.actionType
            );
          }
          return;
        }
        const newItem = this.createStartActionListItem(projectUIData, project);
        newItem.setAttribute("disabled", "true");
        const targetButton = newItem.querySelector("fxs-button");
        const influenceCost = newItem.querySelector(".panel-diplomacy-actions__influence-container");
        if (targetButton) {
          targetButton.setAttribute("disabled", "true");
        }
        if (influenceCost) {
          influenceCost.classList.add("hidden");
        }
        actionsContainer.appendChild(newItem);
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    let ongoingActions = Game.Diplomacy.getPlayerEvents(DiplomacyManager.selectedPlayerID);
    ongoingActions = ongoingActions.filter((action) => {
      return (action.initialPlayer == GameContext.localPlayerID || action.targetPlayer == GameContext.localPlayerID && action.revealed) && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_FORM_ALLIANCE;
    });
    if (ongoingActions.length > 0) {
      ongoingActions.sort(
        (a, b) => Game.Diplomacy.getCompletionData(a.uniqueID) && Game.Diplomacy.getCompletionData(b.uniqueID) && Game.Diplomacy.getCompletionData(a.uniqueID).turnsToCompletion > Game.Diplomacy.getCompletionData(b.uniqueID).turnsToCompletion ? 1 : -1
      );
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_ONGOING");
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
        "h-auto",
        "w-auto",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      ongoingActions.forEach((action) => {
        actionsContainer.appendChild(this.createOngoingActionListItem(action));
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, actionsContainer);
      });
      availableProjectsSlot.appendChild(actionsContainer);
    }
    if (!availableProjectsSlot.hasChildNodes()) {
      const emptyActionDescription = document.createElement("div");
      emptyActionDescription.role = "paragraph";
      emptyActionDescription.classList.value = "font-body text-sm flex flex-col pointer-events-auto items-center";
      emptyActionDescription.innerHTML = Locale.stylize("LOC_UI_DIPLOMACY_ALL_ACTIONS_EMPTY");
      availableProjectsSlot.appendChild(emptyActionDescription);
    }
  }
  createOngoingActionListItem(action) {
    const ongoingActionElement = document.createElement("fxs-chooser-item");
    ongoingActionElement.classList.add("flex", "flex-row", "justify-start", "items-center", "mb-2");
    ongoingActionElement.setAttribute("tabindex", "-1");
    ongoingActionElement.setAttribute("data-tooltip-content", Locale.compose(action.description));
    ongoingActionElement.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
    ongoingActionElement.setAttribute("data-audio-activate-ref", "data-audio-leader-response");
    const ongoingActionContentContainer = document.createElement("div");
    ongoingActionContentContainer.classList.add("flex", "items-center", "size-full");
    ongoingActionElement.appendChild(ongoingActionContentContainer);
    const iconContainer = document.createElement("div");
    iconContainer.classList.value = "size-19 flex self-center items-center justify-center pointer-events-none relative";
    ongoingActionContentContainer.appendChild(iconContainer);
    const iconImage = document.createElement("div");
    iconImage.classList.value = "size-16 -top-px bg-center relative flex flex-col items-center bg-cover justify-center";
    iconContainer.appendChild(iconImage);
    const iconFront = document.createElement("div");
    iconFront.classList.value = "absolute img-civics-icon-frame size-19 flex self-center items-center justify-center pointer-events-none relative";
    iconContainer.appendChild(iconFront);
    const projectDefinition = GameInfo.DiplomacyActions.lookup(action.actionType);
    if (projectDefinition && action.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_COUNTER_SPY) {
      const stage1MaxTurns = Game.Diplomacy.modifyByGameSpeed(projectDefinition.BaseDuration) - Game.Diplomacy.modifyByGameSpeed(action.lastStageDuration);
      const stage1MinTurns = stage1MaxTurns - Game.Diplomacy.modifyByGameSpeed(projectDefinition.RandomInitialProgress);
      ongoingActionElement.setAttribute(
        "data-tooltip-content",
        Locale.stylize(
          Locale.compose(action.description) + "[N]" + Locale.stylize(
            "LOC_DIPLOMACY_ACTION_ESPIONAGE_ONGOING",
            stage1MinTurns,
            stage1MaxTurns,
            Game.turn - action.gameTurnStart
          ) + "[N]" + Locale.compose("LOC_DIPLOMACY_SUCCESS_CHANCE", projectDefinition.SuccessChance) + "[N]" + Locale.compose("LOC_DIPLOMACY_REVEAL_CHANCE", projectDefinition.RevealChance)
        )
      );
    }
    if (action.targetPlayer != DiplomacyManager.selectedPlayerID) {
      const target = Configuration.getPlayer(action.targetPlayer);
      if (target.leaderTypeName) {
        const targetIcon = document.createElement("leader-icon");
        targetIcon.classList.add("mr-2", "w-16", "h-16");
        targetIcon.setAttribute("leader", target.leaderTypeName);
        targetIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(action.targetPlayer));
        ongoingActionContentContainer.appendChild(targetIcon);
      }
    } else {
      const initial = Configuration.getPlayer(action.initialPlayer);
      if (initial.leaderTypeName) {
        const initialIcon = document.createElement("leader-icon");
        initialIcon.classList.add("mr-2", "w-16", "h-16");
        initialIcon.setAttribute("leader", initial.leaderTypeName);
        initialIcon.setAttribute("bg-color", UI.Player.getPrimaryColorValueAsString(action.initialPlayer));
        ongoingActionContentContainer.appendChild(initialIcon);
      }
    }
    const actionDef = GameInfo.DiplomacyActions.lookup(action.actionType);
    if (!actionDef) {
      console.error(
        "panel-diplomacy-actions: Unable to get definition for diplomacy action with type: " + action.actionTypeName
      );
      iconImage.style.backgroundImage = `url("blp:yield_influence")`;
    } else {
      iconImage.style.backgroundImage = `url("${actionDef.UIIconPath}")`;
    }
    const actionName = document.createElement("div");
    actionName.classList.value = "font-title text-sm mb-1 pointer-events-none font-fit-shrink flex-auto relative";
    if (action.actionTypeName == "DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN") {
      actionName.innerHTML = Locale.compose("LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_START_ACTION_NAME");
    } else {
      actionName.innerHTML = Locale.compose(action.name);
    }
    ongoingActionContentContainer.appendChild(actionName);
    const actionData = Game.Diplomacy.getProjectDataForUI(
      action.initialPlayer,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET,
      DiplomacyActionGroups.NO_DIPLOMACY_ACTION_GROUP,
      -1,
      DiplomacyActionTargetTypes.NO_DIPLOMACY_TARGET
    ).find((project) => project.actionID == action.uniqueID);
    if (actionData !== void 0) {
      const targetPlayer = this.getTargetPlayerFromTargetList(actionData);
      if (targetPlayer?.isIndependent) {
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
        IPName.classList.add("font-title", "text-sm", "mb-1", "mt-1", "pointer-events-none", "font-fit-shrink");
        IPName.innerHTML = Locale.stylize(targetPlayer.civilizationFullName);
        IPNameContainer.appendChild(IPName);
        ongoingActionContentContainer.appendChild(IPNameContainer);
      }
    }
    const turnContainer = document.createElement("div");
    turnContainer.classList.value = "panel-diplomacy-actions__ongoing-action-turn-container relative flex items-center pr-2";
    ongoingActionContentContainer.appendChild(turnContainer);
    const turnTimer = document.createElement("div");
    turnTimer.classList.add("panel-diplomacy-actions__ongoing-action-turn-timer");
    turnContainer.appendChild(turnTimer);
    const turnCount = document.createElement("div");
    turnCount.classList.value = "text-sm font-body pr-1";
    if (actionData && actionData.actionGroup == DiplomacyActionGroups.DIPLOMACY_ACTION_GROUP_ESPIONAGE && action.actionType != DiplomacyActionTypes.DIPLOMACY_ACTION_COUNTER_SPY) {
      const stage1MaxTurns = action.completionScore - action.lastStageDuration;
      turnCount.innerHTML = (Game.turn - action.gameTurnStart).toString() + "/" + stage1MaxTurns.toString();
    } else {
      turnCount.innerHTML = Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion.toString();
    }
    turnContainer.appendChild(turnCount);
    if (action.targetPlayer == DiplomacyManager.selectedPlayerID) {
      ongoingActionElement.addEventListener("action-activate", () => {
        window.dispatchEvent(new RaiseDiplomacyEvent(action.initialPlayer));
        window.dispatchEvent(new UpdateDiploRibbonEvent());
      });
    } else {
      ongoingActionElement.addEventListener("action-activate", () => {
        window.dispatchEvent(new RaiseDiplomacyEvent(action.targetPlayer));
        window.dispatchEvent(new UpdateDiploRibbonEvent());
      });
    }
    return ongoingActionElement;
  }
  populateAvailableActions() {
    while (this.majorActionsSlot?.hasChildNodes()) {
      if (this.majorActionsSlot?.lastChild != null) {
        this.majorActionsSlot?.removeChild(this.majorActionsSlot?.lastChild);
      }
    }
    const attributesButton = document.createElement("fxs-hero-button");
    attributesButton.setAttribute("caption", Locale.stylize("LOC_DIPLOMACY_ATTRIBUTES_BUTTON_NAME"));
    attributesButton.classList.add("panel-diplomacy-actions__attribute-button", "mt-2");
    attributesButton.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
    const localPlayerIdentity = Players.get(GameContext.localPlayerID)?.Identity;
    if (!localPlayerIdentity) {
      console.error("panel-diplomacy-actions: No valid PlayerIdentity for local player");
      return;
    }
    let numAvailableAttributes = 0;
    for (const attributeDef of GameInfo.Attributes) {
      numAvailableAttributes += localPlayerIdentity.getAvailableAttributePoints(attributeDef.AttributeType);
    }
    if (numAvailableAttributes > 0) {
      waitForLayout(() => {
        const attributePointsElement = document.createElement("div");
        attributePointsElement.classList.value = "panel-diplomacy-actions__attribute-button-icon -top-4 -right-3 bottom-3 h-10 absolute flex items-center justify-center";
        attributesButton.appendChild(attributePointsElement);
        const attributePointsText = document.createElement("div");
        attributePointsText.classList.value = "font-body text-sm mt-2 px-4";
        attributePointsText.innerHTML = numAvailableAttributes.toString();
        attributePointsElement.appendChild(attributePointsText);
      });
    }
    this.majorActionsSlot?.appendChild(attributesButton);
    attributesButton.addEventListener("action-activate", () => {
      ContextManager.push("screen-attribute-trees", { createMouseGuard: true, singleton: true });
    });
  }
  /**
   * Handler for updates in response to a support change.
   * @param actionData
   * @returns true if updates occurred, false if nothing changed.
   */
  supportChangedHandler(actionData) {
    if (!this.initialLoadComplete) {
      return false;
    }
    const isIndependent = Players.get(actionData.initialPlayer)?.isIndependent || Players.get(actionData.targetPlayer)?.isIndependent;
    if (isIndependent) {
      return false;
    }
    let bRefreshData = false;
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_PROJECT_REACTION")) {
      if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB")) {
        bRefreshData = true;
      } else {
        if ((actionData.initialPlayer == DiplomacyManager.selectedPlayerID || actionData.targetPlayer == DiplomacyManager.selectedPlayerID) && this.checkShouldShowPanel()) {
          bRefreshData = true;
        }
      }
    }
    if (bRefreshData) {
      this.populateOngoingProjects();
      this.populateRelationshipInfo();
      waitForLayout(() => {
        if (DiplomacyManager.selectedActionID == null) {
          this.realizeInitialFocus();
        }
      });
    }
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_PROJECT_REACTION")) {
      this.showBefriendIndependentDetails();
    }
    return bRefreshData;
  }
  populateRelationshipInfo() {
    const localPlayerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error(
        "panel-diplomacy-actions: Attempting to populate citystate/independent relationships, but no player diplomacy object for local player."
      );
      return;
    }
    const relationshipContainer = MustGetElement(
      "#panel-diplomacy-actions__relationship-event-container",
      this.Root
    );
    while (relationshipContainer.hasChildNodes()) {
      relationshipContainer.removeChild(relationshipContainer.lastChild);
    }
    const relationshipHeader = document.createElement("div");
    relationshipHeader.classList.add("flex", "flex-col", "justify-center", "items-center");
    const relationshipTitle = document.createElement("fxs-header");
    relationshipTitle.classList.add("text-secondary", "uppercase", "mb-2", "font-title", "text-base");
    relationshipTitle.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_RELATIONSHIPS_HEADER");
    relationshipTitle.setAttribute("filigree-style", "h4");
    relationshipHeader.appendChild(relationshipTitle);
    const relationshipName = document.createElement("div");
    relationshipName.classList.add("font-title", "text-base");
    relationshipName.innerHTML = Locale.stylize("LOC_DIPLOMACY_ACTIONS_INDEPENDENTS_AND_CITY_STATES");
    relationshipHeader.appendChild(relationshipName);
    const metCityStates = [];
    const metIndependents = [];
    Players.getAlive().forEach((player) => {
      if (player.isIndependent && localPlayerDiplomacy.hasMet(player.id)) {
        if (!Players.get(player.id)?.Diplomacy?.hasBeenDispersed()) {
          metIndependents.push(player);
        }
      } else if (player.isMinor && localPlayerDiplomacy.hasMet(player.id)) {
        metCityStates.push(player);
      }
    });
    metCityStates.sort((a, b) => {
      const suzerainIdA = a.Influence ? a.Influence.getSuzerain() : -1;
      const suzerainIdB = b.Influence ? b.Influence.getSuzerain() : -1;
      const hasMetA = suzerainIdA !== -1 && (suzerainIdA == GameContext.localPlayerID || localPlayerDiplomacy.hasMet(suzerainIdA));
      const hasMetB = suzerainIdB !== -1 && (suzerainIdB == GameContext.localPlayerID || localPlayerDiplomacy.hasMet(suzerainIdB));
      if (hasMetA && !hasMetB) return -1;
      if (!hasMetA && hasMetB) return 1;
      return suzerainIdA - suzerainIdB;
    });
    if (metCityStates.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_UI_CITYSTATE_BONUS_CHOOSER_SUBTITLE");
      header.setAttribute("filigree-style", "h3");
      relationshipContainer.appendChild(header);
      const headerTextElem = header.children[0].children[0];
      if (headerTextElem) {
        headerTextElem.classList.add("flex");
        const headerIcon = document.createElement("fxs-icon");
        headerIcon.classList.add("relative", "size-8", "-top-1");
        headerIcon.setAttribute("data-icon-id", "CITYSTATE");
        headerTextElem.insertBefore(headerIcon, headerTextElem.childNodes[0]);
        headerTextElem.appendChild(headerIcon.cloneNode());
      }
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const itemContainer = document.createElement("fxs-vslot");
      itemContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      metCityStates.forEach((player) => {
        itemContainer.appendChild(this.createMinorPlayerListItem(player));
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, itemContainer);
      });
      relationshipContainer.appendChild(itemContainer);
    }
    if (metIndependents.length > 0) {
      const header = document.createElement("fxs-header");
      header.classList.add("relative");
      header.setAttribute("title", "LOC_DIPLOMACY_ACTIONS_INDEPENDENTS_HEADER");
      header.setAttribute("filigree-style", "h3");
      relationshipContainer.appendChild(header);
      const headerTextElem = header.children[0].children[0];
      if (headerTextElem) {
        headerTextElem.classList.add("flex");
        const headerIcon = document.createElement("fxs-icon");
        headerIcon.classList.add("relative", "size-8", "-top-1");
        headerIcon.setAttribute("data-icon-id", "INDEPENDENT_POWER");
        headerTextElem.insertBefore(headerIcon, headerTextElem.childNodes[0]);
        headerTextElem.appendChild(headerIcon.cloneNode());
      }
      const collapseButton = document.createElement("fxs-minus-plus");
      collapseButton.classList.add("absolute", "top-1", "right-5");
      collapseButton.setAttribute("type", "minus");
      collapseButton.setAttribute("tabindex", "-1");
      header.appendChild(collapseButton);
      if (this.firstFocusSection == null) {
        this.firstFocusSection = collapseButton;
      }
      const itemContainer = document.createElement("fxs-vslot");
      itemContainer.classList.add(
        "overflow-hidden",
        "transition-all",
        "duration-100",
        "scale-y-100",
        "origin-top"
      );
      metIndependents.forEach((player) => {
        itemContainer.appendChild(this.createMinorPlayerListItem(player));
      });
      collapseButton.addEventListener("action-activate", () => {
        this.onCollapseActionSection(collapseButton, itemContainer);
      });
      relationshipContainer.appendChild(itemContainer);
    }
    if (!relationshipContainer.hasChildNodes()) {
      const emptyRelationshipDescription = document.createElement("div");
      emptyRelationshipDescription.role = "paragraph";
      emptyRelationshipDescription.classList.value = "font-body text-sm flex flex-col pointer-events-auto items-center";
      emptyRelationshipDescription.innerHTML = Locale.stylize("LOC_UI_DIPLOMACY_MINOR_POWERS_EMPTY");
      relationshipContainer.appendChild(emptyRelationshipDescription);
    }
  }
  createMinorPlayerListItem(player) {
    const playerListItem = document.createElement("fxs-chooser-item");
    playerListItem.classList.add("flex", "grow", "flex-row", "justify-start", "items-center", "mb-2", "w-136");
    playerListItem.setAttribute("tabindex", "-1");
    playerListItem.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
    playerListItem.setAttribute("data-audio-activate-ref", "data-audio-leader-response");
    const playerListItemContentContainer = document.createElement("div");
    playerListItemContentContainer.classList.add("flex", "items-center", "size-full");
    playerListItem.appendChild(playerListItemContentContainer);
    const iconContainer = document.createElement("div");
    iconContainer.classList.value = "size-19 flex self-center items-center justify-center relative";
    playerListItemContentContainer.appendChild(iconContainer);
    const iconImage = document.createElement("div");
    iconImage.classList.value = "size-14 -top-px bg-center rounded-full relative flex flex-col items-center bg-cover justify-center";
    iconContainer.appendChild(iconImage);
    const iconFront = document.createElement("div");
    iconFront.classList.value = "absolute img-civics-icon-frame size-19 flex self-center items-center justify-center pointer-events-none relative";
    iconContainer.appendChild(iconFront);
    const independentType = GameInfo.CityStateTypes.lookup(player.getCityStateCityStateType());
    const iconSrc = independentType?.CityStateType ? UI.getIconURL(`CITY_STATE_${independentType?.CityStateType}`) : "blp:leader_portrait_independent";
    iconImage.style.backgroundImage = `url(${iconSrc})`;
    if (independentType && iconSrc) {
      iconContainer.setAttribute("data-tooltip-content", Locale.compose(independentType.Name));
    }
    const getMinorLocation = (playerId) => {
      const player2 = Players.get(playerId);
      if (player2 && player2.Districts) {
        const playerDistricts = player2.Districts.getDistricts();
        if (playerDistricts[0]) {
          const location2 = playerDistricts[0].location;
          const visibility = GameplayMap.getRevealedState(
            GameContext.localObserverID,
            location2.x,
            location2.y
          );
          if (visibility != RevealedStates.HIDDEN) {
            return location2;
          }
        }
      }
    };
    const location = getMinorLocation(player.id);
    if (!location) {
      const unmetIcon = document.createElement("fxs-icon");
      unmetIcon.classList.value = "size-7 absolute bottom-1 left-1 pointer-events-auto";
      unmetIcon.style.backgroundImage = "url(blp:action_explorevariant)";
      unmetIcon.setAttribute("data-tooltip-content", "LOC_DIPLOMACY_ACTION_FAILURE_NO_VISION");
      iconContainer.appendChild(unmetIcon);
    }
    const setUpLeaderIcon = (leaderIcon, playerId) => {
      const localPlayerDiplomacy2 = Players.get(GameContext.localPlayerID)?.Diplomacy;
      if (!localPlayerDiplomacy2) {
        console.error(
          "panel-diplomacy-actions: Attempting to set up a leader icon, but no Diplomacy library for local player!"
        );
        return;
      }
      const hasMet = localPlayerDiplomacy2.hasMet(playerId) || GameContext.localPlayerID == playerId;
      const player2 = Configuration.getPlayer(playerId);
      const leaderType = hasMet ? player2.leaderTypeName : "UNKNOWN_LEADER";
      const leaderColor = UI.Player.getPrimaryColorValueAsString(playerId);
      leaderIcon.setAttribute("leader", leaderType ?? "UNKNOWN_LEADER");
      leaderIcon.setAttribute("bg-color", leaderColor);
    };
    const localPlayerDiplomacy = Players.get(GameContext.localPlayerID)?.Diplomacy;
    if (player.Influence && player.Influence.getSuzerain() != -1) {
      const suzerain = Configuration.getPlayer(player.Influence.getSuzerain());
      if (suzerain.leaderTypeName) {
        if (!localPlayerDiplomacy) {
          console.error(
            "panel-diplomacy-actions: Attempting to create a suzerain icon, but no Diplomacy library for local player!"
          );
          return playerListItem;
        }
        const suzerainIcon = document.createElement("leader-icon");
        suzerainIcon.classList.add("mr-2", "size-13");
        if (localPlayerDiplomacy.hasMet(suzerain.id) || GameContext.localPlayerID == suzerain.id) {
          suzerainIcon.setAttribute("leader", suzerain.leaderTypeName);
          suzerainIcon.setAttribute(
            "bg-color",
            UI.Player.getPrimaryColorValueAsString(player.Influence.getSuzerain())
          );
          if (GameContext.localPlayerID == suzerain.id) {
            suzerainIcon.setAttribute("data-tooltip-content", "LOC_DIPLOMACY_SUZERAIN_YOU");
          } else {
            const suzerainTooltip = Locale.compose(
              "LOC_DIPLOMACY_SUZERAIN_OTHER",
              suzerain.leaderName ?? ""
            );
            suzerainIcon.setAttribute("data-tooltip-content", suzerainTooltip);
          }
        } else {
          suzerainIcon.setAttribute("leader", "UNKNOWN_LEADER");
          const suzerainTooltip = Locale.compose("LOC_DIPLOMACY_SUZERAIN_OTHER", "LOC_UI_UNMET_PLAYER_NAME");
          suzerainIcon.setAttribute("data-tooltip-content", suzerainTooltip);
        }
        playerListItemContentContainer.appendChild(suzerainIcon);
      }
    }
    const independentLabels = document.createElement("div");
    independentLabels.classList.add("font-title", "text-sm", "flex", "flex-col", "items-start", "justify-center");
    playerListItemContentContainer.appendChild(independentLabels);
    const independentNameContainer = document.createElement("div");
    independentNameContainer.classList.value = "flex flex-row gap-1 items-center";
    independentLabels.appendChild(independentNameContainer);
    const independentName = document.createElement("div");
    independentName.classList.add("pointer-events-none", "font-fit-shrink", "relative");
    independentName.innerHTML = Locale.stylize(player.civilizationFullName);
    independentNameContainer.appendChild(independentName);
    const relationship = localPlayerDiplomacy?.isAtWarWith(player.id);
    if (relationship) {
      const warIcon = document.createElement("fxs-icon");
      warIcon.classList.add("size-5");
      warIcon.setAttribute("data-icon-id", "WAR");
      independentNameContainer.append(warIcon);
      const independentRelation = document.createElement("div");
      independentRelation.classList.value = "font-body text-sm text-accent-3";
      independentRelation.innerHTML = Locale.stylize("LOC_INDEPENDENT_RELATIONSHIP_HOSTILE");
      independentNameContainer.append(independentRelation);
    }
    let hasTooltip = false;
    let bonusDefinition;
    if (player.isMinor) {
      const bonusType = Game.CityStates.getBonusType(player.id);
      bonusDefinition = GameInfo.CityStateBonuses.find((t) => t.$hash == bonusType);
      if (bonusDefinition) {
        const independentBonus = document.createElement("div");
        independentBonus.classList.add("pointer-events-none", "font-fit-shrink", "relative");
        independentBonus.innerHTML = Locale.stylize(bonusDefinition.Name);
        independentLabels.appendChild(independentBonus);
        hasTooltip = true;
      }
    }
    const befriendActions = Game.Diplomacy.getPlayerEvents(player.id).filter((event) => event.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN).sort((a, b) => {
      const actionA = Game.Diplomacy.getCompletionData(a.uniqueID).turnsToCompletion;
      const actionB = Game.Diplomacy.getCompletionData(b.uniqueID).turnsToCompletion;
      return actionA - actionB;
    });
    const isPlayerBefriending = befriendActions.some((event) => event.initialPlayer == GameContext.localPlayerID);
    if (befriendActions.length > 0) {
      const turnContainer = document.createElement("div");
      turnContainer.classList.value = "absolute flex flex-row-reverse items-center pr-3 right-0 gap-1";
      playerListItemContentContainer.appendChild(turnContainer);
      const leadingAction = befriendActions[0];
      const leaderIconContainer = document.createElement("div");
      leaderIconContainer.classList.value = "relative";
      const leadingIcon = document.createElement("leader-icon");
      leadingIcon.classList.add("size-10");
      setUpLeaderIcon(leadingIcon, leadingAction.initialPlayer);
      leaderIconContainer.appendChild(leadingIcon);
      turnContainer.appendChild(leaderIconContainer);
      if (isPlayerBefriending) {
        if (GameContext.localPlayerID != leadingAction.initialPlayer) {
          const warningIcon = document.createElement("fxs-icon");
          warningIcon.classList.value = "size-8";
          warningIcon.style.backgroundImage = "url(blp:dipaction_befriend_negative)";
          turnContainer.appendChild(warningIcon);
          turnContainer.setAttribute(
            "data-tooltip-content",
            "LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_LOSING"
          );
        } else {
          turnContainer.setAttribute(
            "data-tooltip-content",
            "LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_WINNING"
          );
        }
      }
      const turnTimer = document.createElement("div");
      turnTimer.classList.add("panel-diplomacy-actions__ongoing-action-turn-timer");
      turnContainer.appendChild(turnTimer);
      const turnCount = document.createElement("div");
      turnCount.classList.value = "text-sm font-body";
      turnCount.innerHTML = Game.Diplomacy.getCompletionData(
        befriendActions[0].uniqueID
      ).turnsToCompletion.toString();
      turnContainer.appendChild(turnCount);
      hasTooltip = true;
    }
    if (hasTooltip) {
      const filigreeClasses = [
        "absolute -top-2 -left-2 rotate-180 size-4 bg-contain opacity-30",
        "absolute -top-2 -right-2 -rotate-90 size-4 bg-contain opacity-30",
        "absolute -bottom-2 -left-2 rotate-90 size-4 bg-contain opacity-30",
        "absolute -bottom-2 -right-2 size-4 bg-contain opacity-30"
      ];
      const preloadImages = ["blp:mp_player_detail", "blp:base_ticket-bg"];
      ComponentUtilities.preloadImages(...preloadImages).finally(() => {
        const tooltipDiv = document.createElement("div");
        for (const classString of filigreeClasses) {
          const filigree = document.createElement("div");
          filigree.setAttribute("class", classString);
          filigree.style.backgroundImage = "url(blp:mp_player_detail)";
          tooltipDiv.appendChild(filigree);
        }
        const tooltipContainer = document.createElement("div");
        tooltipContainer.setAttribute("class", "flex flex-col items-center justify-center m-1");
        tooltipDiv.appendChild(tooltipContainer);
        const tooltipName = document.createElement("div");
        tooltipName.setAttribute("class", "text-secondary text-sm font-title uppercase tracking-100");
        tooltipName.innerHTML = Locale.stylize(player.civilizationFullName);
        tooltipContainer.appendChild(tooltipName);
        const ticketClass = "mt-1 p-3 px-6 pb-0 img-base-ticket-bg flex flex-col gap-2";
        if (bonusDefinition) {
          const tooltipHeader = document.createElement("div");
          tooltipHeader.setAttribute("class", "text-sm uppercase");
          tooltipHeader.innerHTML = Locale.stylize("LOC_DIPLOMACY_CHOSEN_BONUS_TITLE");
          tooltipContainer.appendChild(tooltipHeader);
          const tooltipTicket = document.createElement("div");
          tooltipTicket.setAttribute("class", ticketClass);
          const tooltipBonusTitle = document.createElement("div");
          tooltipBonusTitle.setAttribute("class", "text-secondary text-sm font-title uppercase tracking-100");
          tooltipBonusTitle.innerHTML = Locale.stylize(bonusDefinition.Name);
          tooltipTicket.appendChild(tooltipBonusTitle);
          const tooltipBonusDesc = document.createElement("div");
          tooltipBonusDesc.setAttribute("class", "flex flex-col gap-2 -mb-3");
          tooltipBonusDesc.innerHTML = Locale.stylize(bonusDefinition.Description);
          tooltipTicket.appendChild(tooltipBonusDesc);
          tooltipContainer.appendChild(tooltipTicket);
        }
        const localPlayerDiplomacy2 = Players.get(GameContext.localPlayerID)?.Diplomacy;
        if (befriendActions.length > 0 && localPlayerDiplomacy2) {
          const tooltipHeader = document.createElement("div");
          tooltipHeader.setAttribute("class", "text-sm uppercase");
          tooltipHeader.innerHTML = Locale.stylize("LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_PROJECT_NAME");
          tooltipContainer.appendChild(tooltipHeader);
          const tooltipTicket = document.createElement("div");
          tooltipTicket.setAttribute("class", ticketClass);
          tooltipContainer.appendChild(tooltipTicket);
          for (let index = 0; index < befriendActions.length; index++) {
            const action = befriendActions[index];
            const playerEntry = document.createElement("div");
            playerEntry.setAttribute("class", "flex flex-row");
            const playerPlace = document.createElement("div");
            playerPlace.innerHTML = `${index + 1}. `;
            playerEntry.appendChild(playerPlace);
            const playerNameContainer = document.createElement("div");
            const actionPlayer = Configuration.getPlayer(action.initialPlayer);
            const playerString = action.initialPlayer == GameContext.localPlayerID ? "LOC_VICTORY_LEADER_NAME_YOU" : "LOC_VICTORY_LEADER_NAME";
            const playerName = localPlayerDiplomacy2.hasMet(action.initialPlayer) || GameContext.localPlayerID == action.initialPlayer ? actionPlayer.leaderName ?? "LOC_UI_UNMET_PLAYER_NAME" : "LOC_UI_UNMET_PLAYER_NAME";
            playerNameContainer.innerHTML = Locale.compose(playerString, playerName);
            playerEntry.appendChild(playerNameContainer);
            playerEntry.classList.add(
              action.initialPlayer == GameContext.localPlayerID ? "" : "opacity-60"
            );
            const spacer = document.createElement("div");
            spacer.setAttribute("class", "min-w-10 grow");
            playerEntry.appendChild(spacer);
            const turnsLeft = Game.Diplomacy.getCompletionData(action.uniqueID).turnsToCompletion;
            const turnsContainer = document.createElement("div");
            turnsContainer.innerHTML = Locale.compose("LOC_NARRATIVE_TURN_TIMER", turnsLeft);
            playerEntry.appendChild(turnsContainer);
            if (index != 0) {
              const dividerCont = document.createElement("div");
              const divider = document.createElement("div");
              dividerCont.setAttribute("class", "flex flex-row");
              divider.setAttribute("class", "grow h-px");
              divider.style.background = "rgba(77, 83, 102, 0.70)";
              dividerCont.appendChild(divider);
              tooltipTicket.appendChild(dividerCont);
            }
            tooltipTicket.appendChild(playerEntry);
          }
          const leadingAction = befriendActions[0];
          if (isPlayerBefriending && GameContext.localPlayerID != leadingAction.initialPlayer) {
            const warningDiv = document.createElement("div");
            warningDiv.classList.value = "-mx-2 mt-2 p-2 flex flex-col text-negative";
            warningDiv.style.backgroundColor = "rgba(0,0,0,0.4)";
            warningDiv.innerHTML = Locale.compose("LOC_DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN_LOSING");
            tooltipTicket.appendChild(warningDiv);
          } else {
            const lastChild = tooltipTicket.lastChild;
            lastChild?.classList.add("-mb-2");
          }
        }
        playerListItem.setAttribute("data-tooltip-content", tooltipDiv.outerHTML);
        playerListItem.setAttribute("data-tooltip-anchor", "left");
        playerListItem.setAttribute("data-tooltip-anchor-offset", "10");
      });
    }
    playerListItem.addEventListener("action-activate", () => {
      window.dispatchEvent(new RaiseDiplomacyEvent(player.id));
      window.dispatchEvent(new UpdateDiploRibbonEvent());
      const location2 = getMinorLocation(player.id);
      if (location2) {
        Camera.lookAtPlot(location2);
      }
    });
    return playerListItem;
  }
  showLeaderModel() {
    LeaderModelManager.showLeftLeaderModel(DiplomacyManager.selectedPlayerID);
  }
}
Controls.define("panel-player-diplomacy-actions", {
  createInstance: PlayerDiplomacyActionPanel,
  description: "Area for ongoing and completed diplomacy actions for the player",
  styles: [styles],
  images: ["blp:dip_panel_bg", "blp:dip_panel_tint_this.png"],
  classNames: ["panel-diplomacy-actions", "player-panel"]
});
//# sourceMappingURL=panel-player-diplomacy.js.map
