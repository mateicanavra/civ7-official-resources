import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import FocusedAttackBaseInterfaceMode from './interface-mode-focused-attack-base.js';

class FocusedAttackAirToAirInterfaceMode extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_AIR_TO_AIR";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_AIR_TO_AIR", new FocusedAttackAirToAirInterfaceMode());
//# sourceMappingURL=interface-mode-focused-attack-air-to-air.js.map
