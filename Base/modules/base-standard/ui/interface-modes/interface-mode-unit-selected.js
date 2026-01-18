import { PlotCursorUpdatedEventName } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UnitMapDecorationSupport } from './support-unit-map-decoration.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

const autoExploreUnits = [];
GameInfo.TypeTags.forEach((tag) => {
  if (tag.Tag == "UNIT_CLASS_AUTOEXPLORE") {
    autoExploreUnits.push(tag.Type);
  }
});
if (GameInfo.Ages.lookup(Game.age).AgeType == "AGE_EXPLORATION") {
  GameInfo.Units.forEach((row) => {
    if (row.FormationClass == "FORMATION_CLASS_NAVAL") {
      autoExploreUnits.push(row.UnitType);
    }
  });
}
class UnitSelectedInterfaceMode {
  unitSelectionChangedListener = this.onUnitSelectionChanged.bind(this);
  playerTurnActivatedListener = this.onPlayerTurnActivated.bind(this);
  plotCursorCoordsUpdatedListener = this.onPlotCursorCoordsUpdated.bind(this);
  /** @interface Handler */
  transitionTo(_oldMode, _newMode, context) {
    UnitMapDecorationSupport.manager.deactivate();
    const unitSelectedContext = context;
    if (unitSelectedContext == void 0) {
      console.error("Failed to pass context object into the UnitSelectedInterfaceMode context!");
      return;
    }
    if (unitSelectedContext.UnitID == void 0) {
      console.error("Failed to pass UnitID into the UnitSelectedInterfaceMode context!");
      return;
    }
    const unit = Units.get(unitSelectedContext.UnitID);
    if (!unit) {
      console.error(
        `UnitSelectedInterfaceMode: transitionTo failed to find unit (${ComponentID.toLogString(unitSelectedContext.UnitID)})!`
      );
      return;
    }
    UnitMapDecorationSupport.manager.activate(unitSelectedContext.UnitID, UnitMapDecorationSupport.Mode.both);
    this.setUnitLens(unitSelectedContext.UnitID);
    engine.on("UnitSelectionChanged", this.unitSelectionChangedListener);
    engine.on("PlayerTurnActivated", this.playerTurnActivatedListener);
    window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
    waitForLayout(() => {
      const unitInfoPanel = document.querySelector("unit-actions");
      if (unitInfoPanel) {
        unitInfoPanel.dispatchEvent(new CustomEvent("view-received-focus"));
      }
    });
  }
  /** @interface Handler */
  transitionFrom(_oldMode, _newMode) {
    let shouldChangeLens = true;
    const unitID = UI.Player.getHeadSelectedUnit();
    if (unitID) {
      const unit = Units.get(unitID);
      if (unit) {
        const unitDef = GameInfo.Units.lookup(unit.type);
        if (unitDef) {
          const activeLens = LensManager.getActiveLens();
          const isSettlerLens = !unitDef.FoundCity && activeLens == "fxs-settler-lens";
          const isTradeLens = !unitDef.MakeTradeRoute && activeLens == "fxs-trade-lens";
          shouldChangeLens = (isSettlerLens || isTradeLens) && _newMode == "INTERFACEMODE_MOVE_TO";
        }
      } else {
        console.warn(
          `UnitSelectedInterfaceMode: transitionFrom looking for unit but failed to find unit (${ComponentID.toLogString(unitID)})!`
        );
      }
    } else {
      console.warn(
        `UnitSelectedInterfaceMode: transitionFrom looking for unitID but failed to find head selected unit id!`
      );
    }
    if (shouldChangeLens) {
      LensManager.setActiveLens("fxs-default-lens");
    }
    UnitMapDecorationSupport.manager.deactivate();
    engine.off("UnitSelectionChanged", this.unitSelectionChangedListener);
    engine.off("PlayerTurnActivated", this.playerTurnActivatedListener);
    window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
  }
  /** @interface Handler  */
  canEnterMode(parameters) {
    const unitID = parameters?.UnitID;
    return unitID && ComponentID.isValid(unitID);
  }
  /** @interface Handler  */
  canLeaveMode(_newMode) {
    return true;
  }
  // When the mode is active, it will handle any selection changed messages
  onUnitSelectionChanged(data) {
    if (!data.selected) {
      UnitMapDecorationSupport.manager.deactivate();
    } else {
      UnitMapDecorationSupport.manager.activate(data.unit, UnitMapDecorationSupport.Mode.both);
      this.setUnitLens(data.unit);
    }
  }
  setUnitLens(unitID) {
    const unit = Units.get(unitID);
    if (!unit) {
      console.error(
        `UnitSelectedInterfaceMode: setUnitLens failed to find unit (${ComponentID.toLogString(unitID)})!`
      );
      return;
    }
    const unitDef = GameInfo.Units.lookup(unit.type);
    if (unitDef) {
      if (unitDef.FoundCity) {
        switch (unitDef.UnitType) {
          case "UNIT_FOUNDER":
            LensManager.setActiveLens("fxs-founder-lens");
            break;
          default:
            LensManager.setActiveLens("fxs-settler-lens");
            break;
        }
      } else if (unitDef.MakeTradeRoute) {
        LensManager.setActiveLens("fxs-trade-lens");
      } else if (unitDef.ExtractsArtifacts && GameInfo.Ages.lookup(Game.age).AgeType == "AGE_MODERN") {
        LensManager.setActiveLens("fxs-continent-lens");
      } else if (autoExploreUnits.includes(unitDef.UnitType)) {
        LensManager.setActiveLens("fxs-discovery-lens");
      } else {
        LensManager.setActiveLens("fxs-default-lens");
      }
    }
  }
  // Since this listener only occurs if in unit selection mode, it means a unit was already selected and
  // now a new turn is beginning; update that unit's decoration.
  onPlayerTurnActivated(data) {
    if (GameContext.localPlayerID === data.player) {
      const selectedUnitID = UI.Player.getHeadSelectedUnit();
      if (ComponentID.isValid(selectedUnitID)) {
        UnitMapDecorationSupport.manager.activate(selectedUnitID, UnitMapDecorationSupport.Mode.both);
      } else {
        console.error("Player's turn started while in unit seleted mode but there is no head selected unit!");
        InterfaceMode.switchToDefault();
      }
    }
  }
  onPlotCursorCoordsUpdated(event) {
    if (event.detail.plotCoords) {
      UnitMapDecorationSupport.manager.update({ x: event.detail.plotCoords.x, y: event.detail.plotCoords.y });
    }
  }
  allowsHotKeys() {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_UNIT_SELECTED", new UnitSelectedInterfaceMode());
//# sourceMappingURL=interface-mode-unit-selected.js.map
