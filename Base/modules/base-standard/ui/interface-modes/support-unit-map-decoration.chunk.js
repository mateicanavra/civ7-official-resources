import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import Cursor from '../../../core/ui/input/cursor.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { O as OVERLAY_PRIORITY } from '../utilities/utilities-overlay.chunk.js';

var UnitMapDecorationSupport;
((UnitMapDecorationSupport2) => {
  let OverlayGroups;
  ((OverlayGroups2) => {
    OverlayGroups2[OverlayGroups2["selected"] = 0] = "selected";
    OverlayGroups2[OverlayGroups2["possibleMovement"] = 1] = "possibleMovement";
    OverlayGroups2[OverlayGroups2["zoc"] = 2] = "zoc";
    OverlayGroups2[OverlayGroups2["commandRadius"] = 3] = "commandRadius";
    OverlayGroups2[OverlayGroups2["attackStart"] = 10] = "attackStart";
  })(OverlayGroups || (OverlayGroups = {}));
  let Mode;
  ((Mode2) => {
    Mode2[Mode2["selection"] = 0] = "selection";
    Mode2[Mode2["movement"] = 1] = "movement";
    Mode2[Mode2["both"] = 2] = "both";
  })(Mode = UnitMapDecorationSupport2.Mode || (UnitMapDecorationSupport2.Mode = {}));
  class Instance {
    unitID = ComponentID.getInvalidID();
    mode = 2 /* both */;
    // The colors need to come from the color manager
    // Note: the MovementRange style asset does not currently use 'secondaryColor'
    unitSelectedOverlayDefaultStyle = {
      style: "MovementRange",
      primaryColor: Color.convertToLinear([0, 253, 229, 255])
    };
    unitSelectedOverlayPossibleMovementStyle = {
      style: "MovementRange",
      primaryColor: Color.convertToLinear([0, 253, 229, 255])
    };
    unitSelectedOverlayZoCStyle = {
      style: "MovementRange",
      primaryColor: { x: 1, y: 0.91, z: 0, w: 1 }
    };
    unitSelectedOverlayAttackStyle = {
      style: "MovementRange",
      primaryColor: { x: 1, y: 0.02, z: 0.08, w: 1 }
    };
    unitSelectedCommandRadiusStyle = {
      style: "CommanderRadius",
      primaryColor: Color.convertToLinear([255, 255, 255, 255])
    };
    unitSelectedOverlayGroup = WorldUI.createOverlayGroup(
      "UnitSelectedOverlayGroup",
      OVERLAY_PRIORITY.UNIT_MOVEMENT_SKIRT,
      { x: 1, y: 1, z: 1 }
    );
    commandRadiusOverlayGroup = WorldUI.createOverlayGroup(
      "commandRadiusOverlayGroup",
      OVERLAY_PRIORITY.UNIT_ABILITY_RADIUS,
      { x: 1, y: 1, z: 1 }
    );
    unitSelectedOverlay = this.unitSelectedOverlayGroup.addBorderOverlay(
      this.unitSelectedOverlayDefaultStyle
    );
    commandRadiusOverlay = this.commandRadiusOverlayGroup.addBorderOverlay(
      this.unitSelectedCommandRadiusStyle
    );
    unitSelectedModelGroup = WorldUI.createModelGroup("UnitSelectedModelGroup");
    // Unit movement model group that only gets setup once when unit pathing is showing
    unitMovementStaticModelGroup = WorldUI.createModelGroup("UnitMovementStaticModelGroup");
    // Unit movement model group that gets updated every time the destination plot is changed when unit pathing is showing
    unitMovementDynamicModelGroup = WorldUI.createModelGroup(
      "UnitMovementDynamicModelGroup"
    );
    // Map of plot indexes to parameters to track which path VFX need to be updated or removed
    movePathModelMap = /* @__PURE__ */ new Map();
    turnCounterModelMap = /* @__PURE__ */ new Map();
    // Color for the movement arrows in linear space
    movementPathColor = [1.3, 0.7, 0.1];
    queuedPathColor = [0.9, 0.8, 0.7];
    movementPathLastVisibleHeight = 0;
    movementCounterLastVisibleHeight = 0;
    desiredDestination = void 0;
    _showDesiredDestination = false;
    set showDesiredDestination(shouldShow) {
      this._showDesiredDestination = shouldShow;
    }
    get showDesiredDestination() {
      return this._showDesiredDestination || ActionHandler.isGamepadActive || ActionHandler.deviceType == InputDeviceType.Touch && !Configuration.getXR();
    }
    activate(unitID, mode) {
      this.commandRadiusOverlay.clear();
      this.unitSelectedOverlay.clear();
      this.clearVisualizations();
      this.unitID = unitID;
      this.mode = mode;
      this.updateRanges();
      engine.on("UnitMoveComplete", this.onUnitMoveComplete, this);
      engine.on("UnitKilledInCombat", this.onUnitKilled, this);
      const plotCoords = Camera.pickPlotFromPoint(Cursor.position.x, Cursor.position.y);
      if (plotCoords && !ActionHandler.isGamepadActive && ActionHandler.deviceType != InputDeviceType.Touch) {
        this.update(plotCoords);
      } else {
        this.update();
      }
    }
    onUnitKilled() {
      this.updateRanges();
    }
    updateRanges() {
      this.commandRadiusOverlay.clear();
      this.unitSelectedOverlay.clear();
      const unit = Units.get(this.unitID);
      if (!unit) {
        console.error(
          `UnitMapDecorationManager: Failed to find unit (${ComponentID.toLogString(this.unitID)}) from activate map!`
        );
        return;
      }
      const unitMovement = unit.Movement;
      const unitCombat = unit.Combat;
      if (unitMovement && unitMovement.movementMovesRemaining > 0) {
        const kAttackPlots = Units.getReachableTargets(unit.id);
        let movePlots = null;
        let zocPlots = null;
        if (unitCombat?.hasMovedIntoZOC == false) {
          movePlots = Units.getReachableMovement(unit.id);
          zocPlots = Units.getReachableZonesOfControl(unit.id, true);
        } else {
          const plotIndex = GameplayMap.getIndexFromLocation(unit.location);
          movePlots = [plotIndex];
        }
        let isShowingTarget = false;
        if (unitCombat && unitCombat.attacksRemaining > 0) {
          isShowingTarget = true;
        }
        if (zocPlots != null && zocPlots.length > 0) {
          this.unitSelectedOverlay.setPlotGroups(zocPlots, 2 /* zoc */);
          this.unitSelectedOverlay.setGroupStyle(2 /* zoc */, this.unitSelectedOverlayZoCStyle);
        }
        if (movePlots != null && movePlots.length > 0) {
          this.unitSelectedOverlay.setPlotGroups(movePlots, 1 /* possibleMovement */);
          this.unitSelectedOverlay.setGroupStyle(
            1 /* possibleMovement */,
            this.unitSelectedOverlayPossibleMovementStyle
          );
        }
        if (isShowingTarget && kAttackPlots != null && kAttackPlots.length > 0) {
          for (const [i, plot] of kAttackPlots.entries()) {
            this.unitSelectedOverlay.setPlotGroups(plot, 10 /* attackStart */ + i);
            this.unitSelectedOverlay.setGroupStyle(
              10 /* attackStart */ + i,
              this.unitSelectedOverlayAttackStyle
            );
          }
        }
      }
      if (unit.isCommanderUnit) {
        let commandRadiusPlots = null;
        commandRadiusPlots = Units.getCommandRadiusPlots(unit.id);
        if (commandRadiusPlots.length > 0) {
          this.commandRadiusOverlay.setPlotGroups(commandRadiusPlots, 3 /* commandRadius */);
          this.commandRadiusOverlay.setGroupStyle(
            3 /* commandRadius */,
            this.unitSelectedCommandRadiusStyle
          );
        }
      }
    }
    setMode(mode) {
      this.mode = mode;
    }
    update(newDestination) {
      if (ComponentID.isInvalid(this.unitID)) {
        console.warn("UnitMapDecorationSupport - Invalid unit ID in update()");
        return;
      }
      const unit = Units.get(this.unitID);
      if (!unit) {
        console.error(
          `UnitMapDecorationManager: Failed to find unit (${ComponentID.toLogString(this.unitID)}) from update map!`
        );
        return;
      }
      this.desiredDestination = newDestination ? newDestination : void 0;
      this.unitMovementDynamicModelGroup.clear();
      const attackPlots = Units.getReachableTargets(unit.id);
      attackPlots.forEach((plotID) => {
        if (this.desiredDestination) {
          const attackingUnitCombat = unit.Combat;
          const unitDef = GameInfo.Units.lookup(unit.type);
          if (attackingUnitCombat && (attackingUnitCombat.rangedStrength > 0 || attackingUnitCombat.bombardStrength > 0) && (attackingUnitCombat.rangedStrength > attackingUnitCombat.getMeleeStrength(false) || attackingUnitCombat.bombardStrength > attackingUnitCombat.getMeleeStrength(false)) || unitDef && attackingUnitCombat && unitDef.Domain == "DOMAIN_AIR" && attackingUnitCombat.rangedStrength > 0) {
            if (GameplayMap.getIndexFromLocation(this.desiredDestination) == plotID) {
              const source_position = WorldUI.getPlotLocation(
                unit.location,
                { x: 0, y: 0, z: 0 },
                PlacementMode.TERRAIN
              );
              const target_position = WorldUI.getPlotLocation(
                this.desiredDestination,
                { x: 0, y: 0, z: 0 },
                PlacementMode.TERRAIN
              );
              this.unitMovementDynamicModelGroup.addVFXAtPlot(
                "VFX_3DUI_Ranged_Attack_Preview",
                { i: this.desiredDestination.x, j: this.desiredDestination.y },
                { x: 0, y: 0, z: 0 },
                {
                  angle: 0,
                  constants: {
                    target_position: [target_position.x, target_position.y, target_position.z],
                    source_position: [source_position.x, source_position.y, source_position.z]
                  }
                }
              );
            }
          }
        }
      });
      if (this.desiredDestination && this.showDesiredDestination) {
        const result = Units.getPathTo(this.unitID, this.desiredDestination);
        this.updateVisualization(result, this.movementPathColor);
        if (result.plots && result.plots.length > 0) {
          const start = result.plots[0];
          const end = result.plots[result.plots.length - 1];
          this.unitMovementDynamicModelGroup.addVFXAtPlot(
            "FX_3dUI_Movement_Marker_01",
            end,
            { x: 0, y: 0, z: this.movementCounterLastVisibleHeight },
            { angle: 0, constants: { Color3: this.movementPathColor }, placement: PlacementMode.FIXED }
          );
          if (this.unitMovementStaticModelGroup.vfxCount == 0) {
            this.unitMovementStaticModelGroup.addVFXAtPlot(
              "VFX_3dUI_Movement_Marker_Start_01",
              start,
              { x: 0, y: 0, z: 0 },
              { angle: 0, constants: { Color3: this.movementPathColor } }
            );
          }
          return;
        }
      } else if (this.mode == 0 /* selection */ || this.mode == 2 /* both */) {
        const destination = Units.getQueuedOperationDestination(this.unitID);
        if (destination) {
          const result = Units.getPathTo(this.unitID, destination);
          if (result.plots && result.plots.length > 0) {
            const end = result.plots[result.plots.length - 1];
            this.updateVisualization(result, this.queuedPathColor);
            if (this.unitSelectedModelGroup.vfxCount == 0) {
              this.unitSelectedModelGroup.addVFXAtPlot(
                "FX_3dUI_Movement_Marker_01",
                end,
                { x: 0, y: 0, z: 0 },
                { angle: 0, constants: { Color3: this.queuedPathColor } }
              );
            }
            return;
          }
        }
      }
      this.clearVisualizations();
    }
    updateVisualization(results, linearColor) {
      this.visualizeMovePath(results, linearColor);
      this.visualizeTurnCounter(results);
    }
    clearVisualizations() {
      this.turnCounterModelMap.forEach((params) => {
        if (params.modelGroup) {
          params.modelGroup.clear();
          params.modelGroup.destroy();
        }
      });
      this.turnCounterModelMap.clear();
      this.movePathModelMap.forEach((params) => {
        if (params.modelGroup) {
          params.modelGroup.clear();
          params.modelGroup.destroy();
        }
      });
      this.movePathModelMap.clear();
    }
    visualizeTurnCounter(results) {
      const plotIndexesToRemove = [];
      this.turnCounterModelMap.forEach((params) => {
        const resultIndex = results.plots.findIndex((plotIndex) => plotIndex == params.plotIndex);
        if (resultIndex == -1) {
          plotIndexesToRemove.push(params.plotIndex);
          return;
        }
        const resultTurn = results.turns[resultIndex];
        if (resultTurn != params.plotTurn) {
          plotIndexesToRemove.push(params.plotIndex);
          return;
        }
      });
      plotIndexesToRemove.forEach((plotIndex) => {
        this.removeTurnCounterVFX(plotIndex);
      });
      results.plots.forEach((plotIndex, i) => {
        const plotLocation = GameplayMap.getLocationFromIndex(plotIndex);
        const isVisible = GameplayMap.getRevealedState(GameContext.localPlayerID, plotLocation.x, plotLocation.y) != RevealedStates.HIDDEN;
        if (isVisible) {
          this.movementCounterLastVisibleHeight = WorldUI.getPlotLocation(
            plotLocation,
            { x: 0, y: 0, z: 0 },
            PlacementMode.WATER
          ).z;
        }
        if (this.turnCounterModelMap.has(plotIndex)) {
          return;
        }
        const thisTurn = results.turns[i];
        const nextTurn = results.turns[i + 1] ? results.turns[i + 1] : -1;
        if (thisTurn != nextTurn) {
          this.addTurnCounterVFX(plotIndex, thisTurn, this.movementCounterLastVisibleHeight);
        }
      });
    }
    addTurnCounterVFX(plotIndex, turn, height) {
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
        { x: 0, y: 0, z: height },
        { constants: { turn, scale: counterScale }, placement: PlacementMode.FIXED }
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
        params.modelGroup.destroy();
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
    visualizeMovePath(results, linearColor) {
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
      UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-move-hovered", "interact-unit"));
      results.plots.forEach((plotIndex) => {
        const plotLocation = GameplayMap.getLocationFromIndex(plotIndex);
        const isVisible = GameplayMap.getRevealedState(GameContext.localPlayerID, plotLocation.x, plotLocation.y) != RevealedStates.HIDDEN;
        if (isVisible) {
          this.movementPathLastVisibleHeight = WorldUI.getPlotLocation(
            plotLocation,
            { x: 0, y: 0, z: 0 },
            PlacementMode.WATER
          ).z;
        }
        if (this.movePathModelMap.has(plotIndex)) {
          return;
        }
        const directions = this.getDirectionsFromPath(results, plotIndex);
        const movementColor = linearColor;
        const arrowHeight = isVisible ? 0 : this.movementPathLastVisibleHeight;
        this.addMovePathVFX(plotIndex, directions[0], directions[1], movementColor, arrowHeight);
      });
    }
    addMovePathVFX(plotIndex, start, end, linearColor, height) {
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
        { constants: { start, end, Color3: linearColor, height } }
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
        params.modelGroup.destroy();
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
      return "VFX_3dUI_MovePip_01";
    }
    onUnitMoveComplete(data) {
      if (ComponentID.isMatch(this.unitID, data.unit)) {
        if (this.unitMovementStaticModelGroup.vfxCount > 0) {
          this.unitMovementStaticModelGroup.clear();
          this.unitMovementStaticModelGroup.addVFXAtPlot(
            "VFX_3dUI_Movement_Marker_Start_01",
            data.location,
            { x: 0, y: 0, z: 0 },
            { angle: 0, constants: { tintColor1: this.movementPathColor } }
          );
          this.updateRanges();
        }
      }
    }
    deactivate() {
      this.unitID = ComponentID.getInvalidID();
      this.commandRadiusOverlay.clear();
      this.unitSelectedOverlay.clear();
      this.unitSelectedModelGroup.clear();
      this.unitMovementStaticModelGroup.clear();
      this.unitMovementDynamicModelGroup.clear();
      this.clearVisualizations();
      this.showDesiredDestination = false;
      engine.off("UnitMoveComplete", this.onUnitMoveComplete, this);
      engine.off("UnitKilledInCombat", this.onUnitKilled, this);
    }
  }
  UnitMapDecorationSupport2.manager = new Instance();
})(UnitMapDecorationSupport || (UnitMapDecorationSupport = {}));

export { UnitMapDecorationSupport as U };
//# sourceMappingURL=support-unit-map-decoration.chunk.js.map
