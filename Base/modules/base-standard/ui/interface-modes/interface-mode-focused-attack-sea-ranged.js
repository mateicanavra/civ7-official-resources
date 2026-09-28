import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import FocusedAttackBaseInterfaceMode from './interface-mode-focused-attack-base.js';

class FocusedAttackSeaRangedInterfaceMode extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_SEA_RANGED";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_SEA_RANGED", new FocusedAttackSeaRangedInterfaceMode());
//# sourceMappingURL=interface-mode-focused-attack-sea-ranged.js.map
