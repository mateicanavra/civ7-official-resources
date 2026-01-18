import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class ResourceAllocationInterfaceMode {
  /** @interface Handler */
  transitionTo(_oldMode, _newMode, _context) {
  }
  /** @interface Handler */
  transitionFrom(_oldMode, _newMode) {
  }
  /** @interface Handler  */
  canEnterMode(_parameters) {
    return true;
  }
  /** @interface Handler  */
  canLeaveMode(_newMode) {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_RESOURCE_ALLOCATION", new ResourceAllocationInterfaceMode());
//# sourceMappingURL=interface-mode-resource-allocation.js.map
