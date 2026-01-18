import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import DiplomacyManager, { L as LeaderModelManager } from '../diplomacy/diplomacy-manager.js';
import { DiplomacyActionPanel } from './panel-diplomacy-actions.js';
import { s as styles } from './panel-diplomacy-actions.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';
import '../diplo-ribbon/model-diplo-ribbon.chunk.js';
import '../../../core/ui/utilities/utilities-color.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../victory-progress/model-victory-progress.chunk.js';
import '../cinematic/cinematic-manager.chunk.js';
import '../endgame/screen-endgame.js';
import '../../../core/ui/tooltips/tooltip-manager.js';
import '../end-results/end-results.js';
import '../endgame/model-endgame.js';
import '../victory-manager/victory-manager.chunk.js';
import '../relationship-breakdown/relationship-breakdown.chunk.js';

class OtherPlayerDiplomacyActionPanel extends DiplomacyActionPanel {
  diplomacyWarPeaceListener = (data) => {
    this.onDiplomacyWarPeace(data);
  };
  relationshipChangedListener = (eventData) => {
    this.onRelationShipChanged(eventData);
  };
  onAttach() {
    super.onAttach();
    engine.on("DiplomacyDeclareWar", this.diplomacyWarPeaceListener);
    engine.on("DiplomacyMakePeace", this.diplomacyWarPeaceListener);
    engine.on("DiplomacyRelationshipChanged", this.relationshipChangedListener);
    engine.on("PlayerTurnActivated", this.onPlayerTurnBegin, this);
    engine.on("LocalPlayerTurnEnd", this.onLocalPlayerTurnEnd, this);
    if (!this.checkShouldShowPanel()) {
      return;
    }
    if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
      this.showBefriendIndependentDetails();
    }
  }
  onDetach() {
    engine.off("DiplomacyDeclareWar", this.diplomacyWarPeaceListener);
    engine.off("DiplomacyMakePeace", this.diplomacyWarPeaceListener);
    engine.off("DiplomacyRelationshipChanged", this.relationshipChangedListener);
    engine.off("PlayerTurnActivated", this.onPlayerTurnBegin, this);
    engine.off("LocalPlayerTurnEnd", this.onLocalPlayerTurnEnd, this);
    super.onDetach();
  }
  checkShouldShowPanel() {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_DIPLOMACY_HUB") && !DiplomacyManager.isFirstMeetDiplomacyOpen || DiplomacyManager.selectedPlayerID == GameContext.localPlayerID) {
      if (!this.Root.classList.contains("hidden")) {
        this.Root.classList.add("hidden");
        ContextManager.pop("screen-befriend-independent-details");
      }
      return false;
    }
    this.Root.classList.remove("hidden");
    return true;
  }
  onSelectedPlayerChanged() {
    super.onSelectedPlayerChanged();
    if (this.checkShouldShowPanel()) {
      this.realizeInitialFocus();
      this.showLeaderModel();
      this.showBefriendIndependentDetails();
      if (Players.get(DiplomacyManager.selectedPlayerID)?.isIndependent) {
        this.majorActionsSlot?.classList.add("hidden");
        this.showBefriendIndependentDetails();
      }
    }
  }
  showLeaderModel() {
    const playerEntry = Players.get(DiplomacyManager.selectedPlayerID);
    if (playerEntry == null) {
      console.error("Player is not valid, not displaying a 3d model");
      return;
    }
    if (playerEntry.isMinor || playerEntry.isIndependent || playerEntry.isBarbarian) {
      LeaderModelManager.showRightIndLeaderModel(DiplomacyManager.selectedPlayerID);
    } else {
      LeaderModelManager.showRightLeaderModel(DiplomacyManager.selectedPlayerID);
    }
  }
  populateAvailableActions() {
    if (this.majorActionsSlot) {
      removeAllChildren(this.majorActionsSlot);
    }
    DiplomacyManager.populateDiplomacyActions();
    DiplomacyManager.diplomacyActions.forEach((action, index) => {
      const diplomacyActionButton = document.createElement("fxs-button");
      diplomacyActionButton.setAttribute("caption", action.actionString);
      diplomacyActionButton.setAttribute("tabindex", index.toString());
      diplomacyActionButton.setAttribute("data-audio-group-ref", "audio-diplo-project-reaction");
      if (action.audioString) {
        diplomacyActionButton.setAttribute("data-audio-activate-ref", action.audioString);
      }
      diplomacyActionButton.classList.add("h-9", "mt-2", "mr-4", "w-70");
      const allyPlayer = Players.get(DiplomacyManager.selectedPlayerID);
      if (!allyPlayer) {
        console.error("panel-diplomacy-actions: Failed to get ally player library");
        return;
      }
      if (!action.available) {
        diplomacyActionButton.setAttribute("disabled-focusable", "true");
        diplomacyActionButton.setAttribute("data-tooltip-content", action.disabledTooltip);
        diplomacyActionButton.setAttribute("play-error-sound", "true");
      } else {
        diplomacyActionButton.addEventListener("action-activate", () => {
          action.Callback();
        });
        let enemyString = "";
        if (action.actionString === Locale.compose("LOC_DIPLOMACY_ACTION_FORM_ALLIANCE_NAME")) {
          const localPlayerDiplomacy = Players.get(
            GameContext.localPlayerID
          )?.Diplomacy;
          if (localPlayerDiplomacy) {
            Players.getAliveMajorIds().forEach((playerId) => {
              if (allyPlayer.Diplomacy && allyPlayer.Diplomacy.isAtWarWith(playerId)) {
                const newEnemy = Players.get(playerId);
                if (newEnemy) {
                  enemyString = (enemyString.length > 0 ? enemyString + ", " : enemyString) + Locale.compose(
                    localPlayerDiplomacy.hasMet(playerId) ? newEnemy.name : "LOC_LEADER_UNMET_NAME"
                  );
                }
              }
            });
            if (enemyString !== "") {
              diplomacyActionButton.setAttribute(
                "data-tooltip-content",
                Locale.compose("LOC_DIPLOMACY_FORM_ALLIANCE_TOOL_TIP", enemyString)
              );
            }
          } else {
            console.error(
              `panel-other-diplomacy: populateAvailableActions - no local player diplomacy library found!`
            );
            return;
          }
        }
      }
      this.majorActionsSlot?.appendChild(diplomacyActionButton);
    });
  }
  onDiplomacyWarPeace(data) {
    if ((data.actingPlayer == DiplomacyManager.selectedPlayerID || data.reactingPlayer == DiplomacyManager.selectedPlayerID) && this.checkShouldShowPanel() && this.initialLoadComplete) {
      this.populateAvailableActions();
      this.populateActionsPanel();
      this.populateOngoingProjects();
      this.populatePlayerCivInfo();
      this.populateGovernmentInfo();
      this.populateRelationshipInfo();
      this.realizeInitialFocus();
    }
  }
  onRelationShipChanged(eventData) {
    if ((eventData.player1 == GameContext.localPlayerID || eventData.player2 == GameContext.localPlayerID) && this.initialLoadComplete) {
      this.populateAvailableActions();
      this.populateRelationshipInfo();
    }
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
    const isInvolved = actionData.initialPlayer == DiplomacyManager.selectedPlayerID || actionData.targetPlayer == DiplomacyManager.selectedPlayerID;
    const isWar = actionData.actionType == DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR;
    const isInfluenceBased = actionData.actionTypeName == "DIPLOMACY_ACTION_GIVE_INFLUENCE_TOKEN";
    if (this.checkShouldShowPanel() && (isInvolved || isWar)) {
      if (isInfluenceBased) {
        this.showBefriendIndependentDetails();
        this.populateOngoingProjects();
        this.refreshActionPanel();
      } else {
        DiplomacyManager.queryAvailableProjectData(DiplomacyManager.selectedPlayerID);
        this.populateAvailableActions();
        this.refreshActionPanel();
        this.populateOngoingProjects();
        this.populatePlayerCivInfo();
        this.populateGovernmentInfo();
        this.populateRelationshipInfo();
        this.realizeInitialFocus();
      }
      return true;
    }
    return false;
  }
  onPlayerTurnBegin(data) {
    if (data.player == GameContext.localPlayerID && this.checkShouldShowPanel()) {
      DiplomacyManager.populateDiplomacyActions();
      this.populateActionsPanel();
    }
  }
  onLocalPlayerTurnEnd() {
    if (this.checkShouldShowPanel()) {
      DiplomacyManager.populateDiplomacyActions();
      this.populateActionsPanel();
    }
  }
}
Controls.define("panel-other-player-diplomacy-actions", {
  createInstance: OtherPlayerDiplomacyActionPanel,
  description: "Area for ongoing and completed diplomacy actions for other players",
  styles: [styles],
  images: ["fs://game/dip_panel_bg", "fs://game/dip_panel_tint_this.png"],
  classNames: ["panel-diplomacy-actions", "other-player-panel"]
});
//# sourceMappingURL=panel-other-diplomacy.js.map
