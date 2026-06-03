import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';

class DiploClaimPlotInterfaceMode extends ChoosePlotInterfaceMode {
  initialize() {
    const currentPlot = PlotCursor.plotCursorCoords;
    const operation = this.getOperationDefinition();
    if (operation) {
      if (currentPlot) {
        const args = {
          Type: operation.$index,
          X: currentPlot.x,
          Y: currentPlot.y
        };
        const result = Game.PlayerOperations.canStart(
          GameContext.localPlayerID,
          PlayerOperationTypes.LAND_CLAIM,
          args,
          false
        );
        this.showFlagAtPlot({ i: currentPlot.x, j: currentPlot.y }, result.Success);
      }
    }
    return true;
  }
  reset() {
  }
  getOperationDefinition() {
    return GameInfo.DiplomacyActions.lookup("DIPLOMACY_ACTION_LAND_CLAIM");
  }
  decorateHover(plot, _overlay, _modelGroup) {
    const operation = this.getOperationDefinition();
    if (operation) {
      const args = {
        Type: operation.$index,
        X: plot.x,
        Y: plot.y
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.LAND_CLAIM,
        args,
        false
      );
      this.showFlagAtPlot({ i: plot.x, j: plot.y }, result.Success);
    }
  }
  showFlagAtPlot(location, valid) {
    this.placementModelGroup.clear();
    if (valid) {
      this.placementModelGroup.addModelAtPlot(
        "UI_Land_Claim_Flag",
        location,
        { x: -0.2, y: 0, z: 0 },
        { angle: 0, alpha: 0.9, tintColor1: 4278255360, tintColor2: 4278255360 }
      );
    } else {
      this.placementModelGroup.addModelAtPlot(
        "UI_Land_Claim_Flag_Negative",
        location,
        { x: -0.2, y: 0, z: 0 },
        { angle: 0, alpha: 0.9, tintColor1: 4278190335, tintColor2: 4278190335 }
      );
    }
  }
  proposePlot(_plot, accept, _reject) {
    accept();
  }
  commitPlot(plot) {
    const operation = this.getOperationDefinition();
    if (operation) {
      const args = {
        Type: operation.$index,
        X: plot.x,
        Y: plot.y
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.LAND_CLAIM,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.LAND_CLAIM, args);
      }
    }
  }
}
InterfaceMode.addHandler("INTERFACEMODE_DIPLO_CLAIM_PLOT", new DiploClaimPlotInterfaceMode());
//# sourceMappingURL=interface-mode-diplo-claim-plot.js.map
