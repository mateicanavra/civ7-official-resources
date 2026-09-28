import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';

class PauseMenuInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_PAUSE_MENU", new PauseMenuInterfaceMode());
//# sourceMappingURL=interface-mode-pause-menu.js.map
