import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import AdvancedStart from '../advanced-start/model-advanced-start.js';
import WorldInput from '../world-input/world-input.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import './support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class BonusPlacementInterfaceMode {
  previousLens = "fxs-default-lens";
  transitionTo(_oldMode, _newMode, _context) {
    this.previousLens = LensManager.getActiveLens();
    LensManager.setActiveLens("fxs-settler-lens");
  }
  transitionFrom(_oldMode, _newMode) {
    WorldInput.useDefaultPlotSelectionHandler();
    LensManager.setActiveLens(this.previousLens);
  }
  canEnterMode(_parameters) {
    if (!AdvancedStart.advancedStartClosed) {
      return true;
    }
    return false;
  }
  canLeaveMode(newMode) {
    if (newMode == "INTERFACEMODE_CINEMATIC" || newMode == "INTERFACEMODE_ADVANCED_START") {
      return true;
    }
    if (AdvancedStart.advancedStartClosed) {
      return true;
    }
    return false;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_BONUS_PLACEMENT", new BonusPlacementInterfaceMode());
//# sourceMappingURL=interface-mode-bonus-placement.js.map
