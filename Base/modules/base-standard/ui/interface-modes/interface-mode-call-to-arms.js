import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';

class CallToArmsInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    LensManager.setActiveLens("fxs-diplomacy-lens");
  }
  transitionFrom(_oldMode, _newMode) {
  }
  canLeaveMode(_newMode) {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CALL_TO_ARMS", new CallToArmsInterfaceMode());
//# sourceMappingURL=interface-mode-call-to-arms.js.map
