import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';

class ChatInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CHAT", new ChatInterfaceMode());
//# sourceMappingURL=interface-mode-chat.js.map
