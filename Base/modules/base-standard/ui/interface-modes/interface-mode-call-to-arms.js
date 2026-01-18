import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

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
