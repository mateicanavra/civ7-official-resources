import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import FocusedAttackBaseInterfaceMode from './interface-mode-focused-attack-base.js';

class FocusedAttackLandRanged extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_LAND_RANGED";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_LAND_RANGED", new FocusedAttackLandRanged());
//# sourceMappingURL=interface-mode-focused-attack-land-ranged.js.map
