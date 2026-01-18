import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class RadialSelectionInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    ContextManager.push("panel-radial-menu", { singleton: true, createMouseGuard: false });
  }
  transitionFrom(_oldMode, _newMode) {
    ContextManager.pop("panel-radial-menu");
  }
}
InterfaceMode.addHandler("INTERFACEMODE_RADIAL_SELECTION", new RadialSelectionInterfaceMode());
//# sourceMappingURL=interface-mode-radial-selection.js.map
