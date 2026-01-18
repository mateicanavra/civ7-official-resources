import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';

class FocusedAttackBaseInterfaceMode extends ChoosePlotInterfaceMode {
  operationResult = null;
  validPlots = /* @__PURE__ */ new Set();
  commandName = "";
  initialize() {
    if (this.commandName === "") return false;
    const context = this.Context;
    const args = {};
    const result = Game.UnitCommands.canStart(context.UnitID, this.commandName, args, false);
    this.operationResult = result;
    result.Plots?.forEach((p) => this.validPlots.add(p));
    return this.validPlots.size > 0;
  }
  reset() {
    this.operationResult = null;
    this.validPlots.clear();
  }
  decorate(overlay) {
    const result = this.operationResult;
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
    Game.UnitCommands.sendRequest(unitID, this.commandName, args);
  }
}

export { FocusedAttackBaseInterfaceMode as F };
//# sourceMappingURL=interface-mode-focused-attack-base.chunk.js.map
