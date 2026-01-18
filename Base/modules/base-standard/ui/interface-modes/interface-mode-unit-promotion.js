import { I as InputEngineEvent } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { U as UnitPromotion } from '../unit-promotion/model-unit-promotion.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/graph-layout/layout.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class UnitPromotionInterfaceMode {
  canLeaveMode() {
    return UnitPromotion.isClosing;
  }
  canEnterMode() {
    const selectedUnitID = UI.Player.getHeadSelectedUnit();
    if (!selectedUnitID) {
      console.error(
        "interface-mode-unit-promotion: canEnterMode(): No selected unit ID! Cannot transition to unit promotion interface mode!"
      );
      return false;
    }
    const selectedUnit = Units.get(selectedUnitID);
    if (!selectedUnit) {
      console.error(
        "interface-mode-unit-promotion: canEnterMode(): Unable to retrieve selected unit object! Cannot transition to unit promotion interface mode!"
      );
      return false;
    }
    return true;
  }
  transitionTo(_oldMode, _newMode, _context) {
    const selectedUnitID = UI.Player.getHeadSelectedUnit();
    if (!selectedUnitID) {
      console.error(
        "interface-mode-unit-promotion: transitionTo(): No selected unit ID! Cannot transition to unit promotion interface mode!"
      );
      return;
    }
    const selectedUnit = Units.get(selectedUnitID);
    if (!selectedUnit) {
      console.error(
        "interface-mode-unit-promotion: transitionTo(): Unable to retrieve selected unit object! Cannot transition to unit promotion interface mode!"
      );
      return;
    }
    let newCoord = GameplayMap.getAdjacentPlotLocation(
      selectedUnit.location,
      DirectionTypes.DIRECTION_WEST
    );
    newCoord = GameplayMap.getAdjacentPlotLocation(newCoord, DirectionTypes.NO_DIRECTION);
    Camera.saveCameraZoom();
    const params = { zoom: 0.01 };
    Camera.lookAtPlot(newCoord, params);
  }
  transitionFrom(_oldMode, _newMode) {
    Camera.restoreCameraZoom();
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      const promotionPanel = document.querySelector("panel-unit-promotion");
      if (promotionPanel) {
        const promotionBackEvent = InputEngineEvent.CreateNewEvent(inputEvent);
        promotionPanel.dispatchEvent(promotionBackEvent);
      }
      return false;
    }
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_UNIT_PROMOTION", new UnitPromotionInterfaceMode());
//# sourceMappingURL=interface-mode-unit-promotion.js.map
