import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';

class DefaultInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    UI.Player.deselectAllUnits();
    UI.Player.deselectAllCities();
    LensManager.setActiveLens("fxs-default-lens");
    FocusManager.get().clearFocus();
  }
  transitionFrom(_oldMode, _newMode) {
  }
  allowsHotKeys() {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DEFAULT", new DefaultInterfaceMode());
//# sourceMappingURL=interface-mode-default.js.map
