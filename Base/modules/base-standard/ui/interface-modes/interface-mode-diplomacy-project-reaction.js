import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
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
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import './support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

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
