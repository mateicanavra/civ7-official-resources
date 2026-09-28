import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';

class ScreenshotInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_SCREENSHOT", new ScreenshotInterfaceMode());
//# sourceMappingURL=interface-mode-screenshot.js.map
