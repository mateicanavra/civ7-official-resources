import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class DefaultInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    UI.Player.deselectAllUnits();
    UI.Player.deselectAllCities();
    LensManager.setActiveLens("fxs-default-lens");
    FocusManager.SetWorldFocused();
  }
  transitionFrom(_oldMode, _newMode) {
  }
  allowsHotKeys() {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DEFAULT", new DefaultInterfaceMode());
//# sourceMappingURL=interface-mode-default.js.map
