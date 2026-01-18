import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../utilities/utilities-overlay.chunk.js';
import '../world-input/world-input.js';
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

class ReBaseInterfaceMode extends ChoosePlotInterfaceMode {
  _OperationResult = null;
  validPlots = /* @__PURE__ */ new Set();
  initialize() {
    const context = this.Context;
    const args = {};
    const result = Game.UnitOperations.canStart(context.UnitID, "UNITOPERATION_REBASE", args, false);
    this._OperationResult = result;
    result.Plots?.forEach((p) => this.validPlots.add(p));
    return this.validPlots.size > 0;
  }
  reset() {
    this._OperationResult = null;
    this.validPlots.clear();
  }
  decorate(overlay) {
    const result = this._OperationResult;
    if (result == null) {
      throw new ReferenceError("OperationResult is null");
    } else {
      const GREEN_TRANSPARENT_LINEAR = { x: 0, y: 1, z: 0, w: 0.5 };
      if (result.Plots) {
        const plotOverlay = overlay.addPlotOverlay();
        plotOverlay?.addPlots(result.Plots, { fillColor: GREEN_TRANSPARENT_LINEAR });
        Audio.playSound("data-audio-plot-select-overlay", "interact-unit");
      }
    }
  }
  proposePlot(plot, accept, reject) {
    const plotIndex = GameplayMap.getIndexFromLocation(plot);
    if (this.validPlots.has(plotIndex)) {
      accept();
    } else {
      reject();
    }
  }
  commitPlot(plot) {
    const context = this.Context;
    const unitID = context.UnitID;
    const args = {};
    args.X = plot.x;
    args.Y = plot.y;
    Game.UnitOperations.sendRequest(unitID, "UNITOPERATION_REBASE", args);
  }
}
InterfaceMode.addHandler("INTERFACEMODE_REBASE", new ReBaseInterfaceMode());
//# sourceMappingURL=interface-mode-rebase.js.map
