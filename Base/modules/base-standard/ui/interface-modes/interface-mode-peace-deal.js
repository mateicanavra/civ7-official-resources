import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';

class PeaceDealInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    ContextManager.clear();
    LensManager.setActiveLens("fxs-diplomacy-lens");
  }
  transitionFrom(_oldMode, _newMode) {
  }
  canLeaveMode(_newMode) {
    if (DisplayQueueManager.isSuspended() || DiplomacyManager.currentDiplomacyDealData == null) {
      return true;
    }
    return false;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_PEACE_DEAL", new PeaceDealInterfaceMode());
//# sourceMappingURL=interface-mode-peace-deal.js.map
