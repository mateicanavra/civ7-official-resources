import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';

class DiplomacyProjectReactionInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    LensManager.setActiveLens("fxs-diplomacy-lens");
    PlotCursor.hideCursor();
  }
  transitionFrom(_oldMode, _newMode) {
    if (!DisplayQueueManager.isSuspended()) {
      DiplomacyManager.currentProjectReactionData = null;
    }
    PlotCursor.showCursor();
  }
  canLeaveMode(_newMode) {
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DIPLOMACY_PROJECT_REACTION", new DiplomacyProjectReactionInterfaceMode());
//# sourceMappingURL=interface-mode-diplomacy-project-reaction.js.map
