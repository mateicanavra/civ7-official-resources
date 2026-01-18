import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

var ReinforcementMapDecorationSupport;
((ReinforcementMapDecorationSupport2) => {
  class Instance {
    // Map of plot indexes to parameters to track which path VFX need to be updated or removed
    movePathModelMap = /* @__PURE__ */ new Map();
    turnCounterModelMap = /* @__PURE__ */ new Map();
    reinforcementPathColor = [1.1, 1.1, 1.1];
    updateVisualization(results) {
      this.clearVisualizations();
      this.visualizeMovePath(results);
      this.visualizeTurnCounter(results);
    }
    clearVisualizations() {
      this.turnCounterModelMap.forEach((params) => {
        if (params.modelGroup) {
          params.modelGroup.clear();
        }
      });
      this.turnCounterModelMap.clear();
      this.movePathModelMap.forEach((params) => {
        if (params.modelGroup) {
          params.modelGroup.clear();
        }
      });
      this.movePathModelMap.clear();
    }
    visualizeTurnCounter(results) {
      const maxTurn = Math.max(...results.turns, 0);
      const centerPlot = Math.floor(results.plots.length / 2);
      const plotIndex = results.plots[centerPlot];
      this.addTurnCounterVFX(plotIndex, maxTurn);
    }
    addTurnCounterVFX(plotIndex, turn) {
      const plotIndexesToRemove = [];
      this.turnCounterModelMap.forEach((params2) => {
        if (params2.plotTurn == turn) {
          plotIndexesToRemove.push(params2.plotIndex);
          return;
        }
      });
      plotIndexesToRemove.forEach((plotIndex2) => {
        this.removeTurnCounterVFX(plotIndex2);
      });
      const params = {
        plotIndex,
        plotTurn: turn,
        modelGroup: WorldUI.createModelGroup(`TurnCounter_${plotIndex}`)
      };
      const counterScale = 1;
      params.modelGroup.addVFXAtPlot(
        "VFX_3dUI_TurnCount_01",
        plotIndex,
        { x: 0, y: 0, z: 0.1 },
        { constants: { turn, scale: counterScale } }
      );
      this.turnCounterModelMap.set(plotIndex, params);
    }
    removeTurnCounterVFX(plotIndex) {
      const params = this.turnCounterModelMap.get(plotIndex);
      if (!params) {
        console.error(`support-unit-map-decoration: removeTurnCounterVFX failed to find index ${plotIndex}`);
        return;
      }
      if (params.modelGroup) {
        params.modelGroup.clear();
      }
      this.turnCounterModelMap.delete(plotIndex);
    }
    getDirectionsFromPath(results, fromPlotIndex) {
      const resultIndex = results.plots.findIndex((plotIndex) => plotIndex == fromPlotIndex);
      if (resultIndex == -1) {
        console.error(
          `support-unit-map-decoration: getDirectionsFromPath failed to plotIndex ${fromPlotIndex}`
        );
        return [-1, -1];
      }
      const previousPlot = results.plots[resultIndex - 1];
      const nextPlot = results.plots[resultIndex + 1];
      let prevDirection = 0;
      let nextDirection = 0;
      const thisPlotCoord = GameplayMap.getLocationFromIndex(fromPlotIndex);
      if (previousPlot != void 0) {
        const prevPlotCoord = GameplayMap.getLocationFromIndex(previousPlot);
        prevDirection = this.getDirectionNumberFromDirectionType(
          GameplayMap.getDirectionToPlot(thisPlotCoord, prevPlotCoord)
        );
      }
      if (nextPlot != void 0) {
        const nextPlotCoord = GameplayMap.getLocationFromIndex(nextPlot);
        nextDirection = this.getDirectionNumberFromDirectionType(
          GameplayMap.getDirectionToPlot(thisPlotCoord, nextPlotCoord)
        );
      }
      return [prevDirection, nextDirection];
    }
    visualizeMovePath(results) {
      const plotIndexesToRemove = [];
      this.movePathModelMap.forEach((params) => {
        const resultIndex = results.plots.findIndex((plotIndex) => plotIndex == params.plotIndex);
        if (resultIndex == -1) {
          plotIndexesToRemove.push(params.plotIndex);
          return;
        }
        const directions = this.getDirectionsFromPath(results, params.plotIndex);
        if (directions[0] != params.start || directions[1] != params.end) {
          plotIndexesToRemove.push(params.plotIndex);
          return;
        }
      });
      plotIndexesToRemove.forEach((plotIndex) => {
        this.removeMovePathVFX(plotIndex);
      });
      results.plots.forEach((plotIndex) => {
        if (this.movePathModelMap.has(plotIndex)) {
          return;
        }
        const directions = this.getDirectionsFromPath(results, plotIndex);
        this.addMovePathVFX(plotIndex, directions[0], directions[1]);
      });
    }
    addMovePathVFX(plotIndex, start, end) {
      const params = {
        plotIndex,
        start,
        end,
        modelGroup: WorldUI.createModelGroup(`MovePath_${plotIndex}`)
      };
      params.modelGroup.addVFXAtPlot(
        this.getPathVFXforPlot(),
        plotIndex,
        { x: 0, y: 0, z: 0 },
        { constants: { start, end, Color3: this.reinforcementPathColor } }
      );
      this.movePathModelMap.set(plotIndex, params);
    }
    removeMovePathVFX(plotIndex) {
      const params = this.movePathModelMap.get(plotIndex);
      if (!params) {
        console.error(`support-unit-map-decoration: removeMovePathVFX failed to find index ${plotIndex}`);
        return;
      }
      if (params.modelGroup) {
        params.modelGroup.clear();
      }
      this.movePathModelMap.delete(plotIndex);
    }
    getDirectionNumberFromDirectionType(direction) {
      switch (direction) {
        case DirectionTypes.DIRECTION_EAST:
          return 1;
        case DirectionTypes.DIRECTION_SOUTHEAST:
          return 2;
        case DirectionTypes.DIRECTION_SOUTHWEST:
          return 3;
        case DirectionTypes.DIRECTION_WEST:
          return 4;
        case DirectionTypes.DIRECTION_NORTHWEST:
          return 5;
        case DirectionTypes.DIRECTION_NORTHEAST:
          return 6;
      }
      return 0;
    }
    getPathVFXforPlot() {
      return "VFX_3dUI_Reinforcement_Arrow";
    }
    deactivate() {
      this.clearVisualizations();
    }
  }
  ReinforcementMapDecorationSupport2.manager = new Instance();
})(ReinforcementMapDecorationSupport || (ReinforcementMapDecorationSupport = {}));

class CommanderReinforcementInterfaceMode {
  transitionTo(_oldMode, _newMode) {
  }
  static updateDisplay(unitID, path) {
    if (ComponentID.isValid(unitID) && path) {
      ReinforcementMapDecorationSupport.manager.updateVisualization(path);
    } else {
      console.error("Failed find a unit or path in CommanderReinforcementInterfaceMode.updateDisplay().");
    }
  }
  transitionFrom(_oldMode, _newMode) {
    ReinforcementMapDecorationSupport.manager.deactivate();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_COMMANDER_REINFORCEMENT", new CommanderReinforcementInterfaceMode());

export { CommanderReinforcementInterfaceMode };
//# sourceMappingURL=interface-mode-commander-reinforcement.js.map
