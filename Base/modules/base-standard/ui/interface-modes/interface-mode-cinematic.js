import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { C as CinematicManager } from '../cinematic/cinematic-manager.chunk.js';
import { instance } from '../civilopedia/model-civilopedia.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../endgame/screen-endgame.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/tooltips/tooltip-manager.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-color.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../end-results/end-results.js';
import '../endgame/model-endgame.js';

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
