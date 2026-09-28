import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import PillageBaseInterfaceMode from './interface-mode-pillage-base.js';

class PillageRouteInterfaceMode extends PillageBaseInterfaceMode {
  initialize() {
    this.operationName = "UNITOPERATION_PILLAGE_ROUTE";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_PILLAGE_ROUTE", new PillageRouteInterfaceMode());
//# sourceMappingURL=interface-mode-pillage-route.js.map
