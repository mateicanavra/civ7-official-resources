import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import { CinematicManager } from '../cinematic/cinematic-manager.js';
import { instance } from '../civilopedia/model-civilopedia.js';

class CinematicInterfaceMode {
  transitionTo(_oldMode, _newMode, _context) {
    LensManager.setActiveLens("fxs-cinematic-lens");
    PlotCursor.hideCursor();
  }
  transitionFrom(_oldMode, _newMode) {
    PlotCursor.showCursor();
  }
  canLeaveMode(_newMode) {
    if (CinematicManager.isMovieInProgress()) {
      return false;
    }
    if (instance.isOpen && ContextManager.hasInstanceOf("screen-civilopedia")) {
      return false;
    }
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CINEMATIC", new CinematicInterfaceMode());
//# sourceMappingURL=interface-mode-cinematic.js.map
