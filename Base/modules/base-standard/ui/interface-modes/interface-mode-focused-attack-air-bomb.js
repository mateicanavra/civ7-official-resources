import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import FocusedAttackBaseInterfaceMode from './interface-mode-focused-attack-base.js';

class FocusedAttackAirBombInterfaceMode extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_AIR_BOMB";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_AIR_BOMB", new FocusedAttackAirBombInterfaceMode());
//# sourceMappingURL=interface-mode-focused-attack-air-bomb.js.map
