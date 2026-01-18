import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class ChatInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CHAT", new ChatInterfaceMode());
//# sourceMappingURL=interface-mode-chat.js.map
