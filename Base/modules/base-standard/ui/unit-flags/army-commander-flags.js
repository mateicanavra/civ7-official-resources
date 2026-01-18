import { UnitFlagManager, s as styles, UnitFlagFactory } from './unit-flag-manager.js';
import { GenericUnitFlag } from './unit-flags.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';

class ArmyCommanderFlagMaker {
  onUnitCommandStartedListener = this.onUnitCommand.bind(this);
  initialize() {
    engine.on("UnitAddedToArmy", this.onUnitArmyChange, this);
    engine.on("UnitRemovedFromArmy", this.onUnitArmyChange, this);
    engine.on("UnitPromoted", this.onUnitPromoted, this);
    engine.on("UnitCommandStarted", this.onUnitCommandStartedListener, this);
  }
  isMatch(unit, _unitDefinition, _others) {
    if (unit.isCommanderUnit) {
      return true;
    }
    return false;
  }
  getComponentName() {
    return "army-commander-flag";
  }
  /**
   * Handler for events specific for this type (army commander) flags.
   * Obtains the apporpriate instance from the manager and updates based on
   * a unit being added or removed.
   * @param {Unit_Army_EventData} data
   */
  onUnitArmyChange(data) {
    const unitFlag = UnitFlagManager.instance.getFlag(data.initiatingUnit);
    if (unitFlag) {
      window.requestAnimationFrame(() => {
        unitFlag.updateArmy();
      });
    }
  }
  onUnitCommand(data) {
    if (data.command == Database.makeHash("UNITCOMMAND_NAME_UNIT")) {
      const unitFlag = UnitFlagManager.instance.getFlag(
        data.unit
      );
      if (!unitFlag) {
        return;
      }
      unitFlag.updateTooltip();
    }
  }
  isArmyCommanderFlagType(unitFlag) {
    return unitFlag && unitFlag.kind == "armycommanderinterface";
  }
  onUnitPromoted(data) {
    const unitFlag = UnitFlagManager.instance.getFlag(data.unit);
    if (this.isArmyCommanderFlagType(unitFlag)) {
      unitFlag.updatePromotions();
    }
  }
}
class ArmyCommanderFlag extends GenericUnitFlag {
  armyFlags = [];
  kind = "armycommanderinterface";
  // Has some specialized listeners.
  onAttach() {
    super.onAttach();
    this.updateArmy();
  }
  updateArmy() {
    this.realizeArmyInfo();
  }
  updateTooltip() {
    this.realizeTooltip();
  }
  realizeArmyInfo() {
    const unit = this.unit;
    if (unit && unit.armyId) {
      const army = Armies.get(unit.armyId);
      if (army) {
        const unitFlagArmyContainer = this.Root.querySelector(".unit-flag__container");
        if (unitFlagArmyContainer != null) {
          this.armyFlags.forEach((flag) => {
            unitFlagArmyContainer?.removeChild(flag);
          });
          this.armyFlags = [];
          if (army.unitCount > 1) {
            for (let index = 1; index < army.unitCount; index++) {
              const unitFlagInnerShape = document.createElement("div");
              unitFlagInnerShape.classList.add(
                "unit-flag__stack-shape",
                "unit-flag__shape--inner",
                "pointer-events-none",
                "absolute",
                "inset-0",
                "bg-no-repeat"
              );
              unitFlagInnerShape.style.setProperty("--stackOffset", index.toString());
              unitFlagInnerShape.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(
                this.componentID.owner
              );
              unitFlagArmyContainer.insertBefore(unitFlagInnerShape, unitFlagArmyContainer.childNodes[0]);
              this.armyFlags.push(unitFlagInnerShape);
              const unitFlagOutterStackShape = document.createElement("div");
              unitFlagOutterStackShape.classList.add(
                "unit-flag__stack-shape",
                "unit-flag__shape--outer",
                "pointer-events-none",
                "absolute",
                "inset-0",
                "bg-no-repeat"
              );
              unitFlagOutterStackShape.style.setProperty("--stackOffset", index.toString());
              unitFlagOutterStackShape.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);
              unitFlagArmyContainer.insertBefore(
                unitFlagOutterStackShape,
                unitFlagArmyContainer.childNodes[0]
              );
              this.armyFlags.push(unitFlagOutterStackShape);
            }
          }
        }
        let numCivilians = 0;
        const armyUnits = army.getUnitIds();
        for (let i = 1; i < armyUnits.length; i++) {
          const armyUnit = Units.get(armyUnits[i]);
          if (armyUnit) {
            const unitDef = GameInfo.Units.lookup(armyUnit.type);
            if (unitDef) {
              if (unitDef.FormationClass == "FORMATION_CLASS_CIVILIAN") {
                numCivilians++;
              }
            }
          }
        }
        const armyStats = this.Root.querySelector(".unit-flag__army-stats");
        if (armyStats) {
          const unitCount = army.unitCount - 1;
          if (numCivilians > 0) {
            armyStats.textContent = `${unitCount - numCivilians}|${army.combatUnitCapacity} + ${numCivilians}`;
          } else {
            armyStats.textContent = `${unitCount}|${army.combatUnitCapacity}`;
          }
        }
      }
    }
  }
}
Controls.define("army-commander-flag", {
  createInstance: ArmyCommanderFlag,
  description: "Army Commander Unit Flag",
  classNames: ["unit-flag", "allowCameraMovement"],
  styles: [styles]
});
UnitFlagFactory.registerStyle(new ArmyCommanderFlagMaker());
//# sourceMappingURL=army-commander-flags.js.map
