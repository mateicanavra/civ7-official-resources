import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import PillageBaseInterfaceMode from './interface-mode-pillage-base.js';

class PillageLandInterfaceMode extends PillageBaseInterfaceMode {
  initialize() {
    this.operationName = "UNITOPERATION_PILLAGE";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_PILLAGE", new PillageLandInterfaceMode());
//# sourceMappingURL=interface-mode-pillage-land.js.map
