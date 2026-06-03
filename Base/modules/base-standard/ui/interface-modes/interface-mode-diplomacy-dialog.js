import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';

class DiplomacyDialogInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    LensManager.setActiveLens("fxs-diplomacy-lens");
    PlotCursor.hideCursor();
  }
  transitionFrom(_oldMode, _newMode) {
    PlotCursor.showCursor();
  }
  canLeaveMode(_newMode) {
    if (DisplayQueueManager.isSuspended() || DiplomacyManager.isEmpty()) {
      return true;
    }
    return false;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DIPLOMACY_DIALOG", new DiplomacyDialogInterfaceMode());
//# sourceMappingURL=interface-mode-diplomacy-dialog.js.map
