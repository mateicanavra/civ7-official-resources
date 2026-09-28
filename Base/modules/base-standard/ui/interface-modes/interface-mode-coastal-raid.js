import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import PillageBaseInterfaceMode from './interface-mode-pillage-base.js';

class CoastalRaidInterfaceMode extends PillageBaseInterfaceMode {
  initialize() {
    this.operationName = "UNITOPERATION_COASTAL_RAID";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_COASTAL_RAID", new CoastalRaidInterfaceMode());
//# sourceMappingURL=interface-mode-coastal-raid.js.map
