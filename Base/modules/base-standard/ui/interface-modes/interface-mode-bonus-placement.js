import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../core/ui/lenses/lens-manager.js';
import AdvancedStart from '../advanced-start/model-advanced-start.js';
import WorldInput from '../world-input/world-input.js';

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
