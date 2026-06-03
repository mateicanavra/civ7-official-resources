import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';

class DiplomacyHubInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    LensManager.setActiveLens("fxs-diplomacy-lens");
    PlotCursor.hideCursor();
  }
  transitionFrom(_oldMode, _newMode) {
    PlotCursor.showCursor();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DIPLOMACY_HUB", new DiplomacyHubInterfaceMode());
//# sourceMappingURL=interface-mode-diplomacy-hub.js.map
