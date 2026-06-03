import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import FocusedAttackBaseInterfaceMode from './interface-mode-focused-attack-base.js';

class FocusedAttackAirToLandInterfaceMode extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_AIR_TO_LAND";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_AIR_TO_LAND", new FocusedAttackAirToLandInterfaceMode());
//# sourceMappingURL=interface-mode-focused-attack-air-to-land.js.map
