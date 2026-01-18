import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import AdvancedStart from '../advanced-start/model-advanced-start.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class AdvancedStartInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
  canEnterMode(_parameters) {
    if (!AdvancedStart.advancedStartClosed) {
      return true;
    }
    return false;
  }
  canLeaveMode(newMode) {
    if (newMode == "INTERFACEMODE_CINEMATIC" || newMode == "INTERFACEMODE_BONUS_PLACEMENT") {
      return true;
    }
    if (AdvancedStart.advancedStartClosed) {
      return true;
    }
    return false;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_ADVANCED_START", new AdvancedStartInterfaceMode());
//# sourceMappingURL=interface-mode-advanced-start.js.map
