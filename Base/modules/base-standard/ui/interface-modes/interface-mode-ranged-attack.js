import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { HighlightColors } from '../../../core/ui/utilities/utilities-color.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';

class RangedAttackInterfaceMode extends ChoosePlotInterfaceMode {
  validPlots = /* @__PURE__ */ new Set();
  initialize() {
    const context = this.Context;
    const args = {};
    const result = Game.UnitOperations.canStart(context.UnitID, UnitOperationTypes.RANGE_ATTACK, args, false);
    if (result.Success == false) {
      return false;
    }
    const unit = Units.get(this.Context.UnitID);
    if (!unit) {
      console.error("Failed to find unit for range attack interface mode");
      return false;
    }
    const unitMovement = unit.Movement;
    if (unitMovement && unitMovement.movementMovesRemaining > 0) {
      const unitCombat = unit.Combat;
      let isShowingTarget = false;
      if (unitCombat && unitCombat.attacksRemaining > 0) {
        isShowingTarget = true;
      }
      if (isShowingTarget && result.Plots != null && result.Plots.length > 0) {
        if (result.Modifiers != null && result.Modifiers.length == result.Plots.length) {
          const length = result.Plots.length;
          for (let i = 0; i < length; ++i) {
            const modifier = result.Modifiers[i];
            if (modifier != OperationPlotModifiers.NONE) {
              this.validPlots.add(result.Plots[i]);
            }
          }
        }
      }
    }
    if (result.Success) {
      window.dispatchEvent(new CustomEvent("ranged-attack-started"));
    }
    return result.Success == true;
  }
  reset() {
    window.dispatchEvent(new CustomEvent("ranged-attack-finished"));
    this.validPlots.clear();
  }
  decorate(overlayGroup, _modelGroup) {
    const overlay = overlayGroup.addBorderOverlay({
      style: "MovementRange",
      primaryColor: HighlightColors.unitAttack
    });
    let count = 0;
    this.validPlots.forEach((p) => {
      overlay.setPlotGroups(p, count);
      count++;
    });
    Audio.playSound("data-audio-plot-select-overlay", "interact-unit");
  }
  decorateHover(plotCoord, _overlay, modelGroup) {
    modelGroup.clear();
    const plotIndex = GameplayMap.getIndexFromLocation(plotCoord);
    const unit = Units.get(this.Context.UnitID);
    if (unit) {
      const target_position = WorldUI.getPlotLocation(plotCoord, { x: 0, y: 0, z: 0 }, PlacementMode.TERRAIN);
      const source_position = WorldUI.getPlotLocation(unit.location, { x: 0, y: 0, z: 0 }, PlacementMode.TERRAIN);
      if (this.validPlots.has(plotIndex)) {
        modelGroup.addVFXAtPlot(
          "VFX_3DUI_Ranged_Attack_Preview",
          { i: plotCoord.x, j: plotCoord.y },
          { x: 0, y: 0, z: 0 },
          {
            angle: 0,
            constants: {
              target_position: [target_position.x, target_position.y, target_position.z],
              source_position: [source_position.x, source_position.y, source_position.z]
            }
          }
        );
      }
    }
  }
  proposePlot(_plot, accept, _reject) {
    accept();
  }
  commitPlot(plot) {
    const context = this.Context;
    const args = {};
    args.X = plot.x;
    args.Y = plot.y;
    Game.UnitOperations.sendRequest(context.UnitID, UnitOperationTypes.RANGE_ATTACK, args);
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit"));
    window.dispatchEvent(new CustomEvent("ranged-attack-finished"));
  }
}
InterfaceMode.addHandler("INTERFACEMODE_RANGE_ATTACK", new RangedAttackInterfaceMode());
//# sourceMappingURL=interface-mode-ranged-attack.js.map
