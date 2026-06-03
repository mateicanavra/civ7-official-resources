import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';

class AgeTransitionInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
  }
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_AGE_TRANSITION", new AgeTransitionInterfaceMode());
//# sourceMappingURL=interface-mode-age-transition.js.map
