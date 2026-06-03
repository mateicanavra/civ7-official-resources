import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';
import { UnitMapDecorationSupport } from './support-unit-map-decoration.js';
import WorldInput from '../world-input/world-input.js';

class MoveToInterfaceMode extends ChoosePlotInterfaceMode {
  attackPlots = [];
  unitID = ComponentID.getInvalidID();
  initialize() {
    const context = this.Context;
    this.unitID = context.UnitID;
    const args = {
      Modifiers: UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION
      // Human players can click out into the fog
    };
    const result = Game.UnitOperations.canStart(this.unitID, UnitOperationTypes.MOVE_TO, args, false);
    this.attackPlots = Units.getReachableTargets(this.unitID);
    return result.Success == true;
  }
  reset() {
  }
  decorate(_overlayGroup, _modelGroup) {
    const unit = Units.get(this.unitID);
    if (!unit) {
      console.error("Move To Interface Mode failed to visualize possible move to plots");
      return;
    }
    UnitMapDecorationSupport.manager.showDesiredDestination = true;
    UnitMapDecorationSupport.manager.activate(this.unitID, UnitMapDecorationSupport.Mode.movement);
  }
  decorateHover(plotCoord, _overlay, modelGroup) {
    modelGroup.clear();
    this.attackPlots.forEach((plotID) => {
      if (GameplayMap.getIndexFromLocation(plotCoord) == plotID) {
        const selectedUnit = Units.get(this.unitID);
        if (selectedUnit) {
          const attackingUnitCombat = selectedUnit.Combat;
          if (attackingUnitCombat) {
            const args = {
              X: plotCoord.x,
              Y: plotCoord.y
            };
            if ((attackingUnitCombat.rangedStrength > 0 || attackingUnitCombat.bombardStrength > 0) && (attackingUnitCombat.rangedStrength > attackingUnitCombat.getMeleeStrength(false) || attackingUnitCombat.bombardStrength > attackingUnitCombat.getMeleeStrength(false))) {
              const results = Game.UnitOperations.canStart(
                this.unitID,
                UnitOperationTypes.RANGE_ATTACK,
                args,
                false
              );
              if (results.Success) {
                modelGroup.addModelAtPlot(
                  "UI_Prototype_Sword_Single_01",
                  { i: plotCoord.x, j: plotCoord.y },
                  { x: 0, y: 0, z: 0 },
                  { angle: 0, alpha: 0.6, tintColor1: 4289114931 }
                );
                return;
              }
            } else if (attackingUnitCombat.getMeleeStrength(false) > 0) {
              args.Modifiers = UnitOperationMoveModifiers.ATTACK;
              const results = Game.UnitOperations.canStart(
                this.unitID,
                UnitOperationTypes.MOVE_TO,
                args,
                false
              );
              if (results.Success) {
                modelGroup.addModelAtPlot(
                  "UI_Prototype_Sword_Crossed_01",
                  { i: plotCoord.x, j: plotCoord.y },
                  { x: 0, y: 0, z: 0 },
                  { angle: 0, alpha: 0.6, tintColor1: 4289114931 }
                );
                return;
              }
            }
            UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-action-combat-hovered", "interact-unit"));
          }
        }
      }
    });
    UnitMapDecorationSupport.manager.showDesiredDestination = true;
    UnitMapDecorationSupport.manager.update(plotCoord);
  }
  undecorate(_overlayGroup, _modelGroup) {
    UnitMapDecorationSupport.manager.deactivate();
  }
  proposePlot(_plot, accept, _reject) {
    accept();
  }
  commitPlot(plot) {
    const args = {
      X: plot.x,
      Y: plot.y
    };
    WorldInput.requestMoveOperation(this.unitID, args);
  }
}
InterfaceMode.addHandler("INTERFACEMODE_MOVE_TO", new MoveToInterfaceMode());
//# sourceMappingURL=interface-mode-move-to.js.map
