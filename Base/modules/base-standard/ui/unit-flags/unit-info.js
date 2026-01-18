import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';

var PipColors = /* @__PURE__ */ ((PipColors2) => {
  PipColors2[PipColors2["normal"] = 4283826175] = "normal";
  return PipColors2;
})(PipColors || {});
class Unit3DInfo {
  componentID;
  movementModelGroup = WorldUI.createModelGroup("movementPips");
  /// Is 3D information turned off?
  _enabled = false;
  set enabled(isEnabled) {
    if (isEnabled == this._enabled) {
      return;
    }
    this._enabled = isEnabled;
    if (this._enabled) {
      this.movementModelGroup = WorldUI.createModelGroup("movementPips");
    } else {
      this.movementModelGroup.destroy();
    }
  }
  constructor(componentID) {
    this.componentID = componentID;
  }
  Destroy() {
    this.movementModelGroup.destroy();
  }
  /**
   * Place pips on the hex based on remaining movement.
   * @param movesRemaining
   */
  setMoves(movesRemaining) {
    if (!this._enabled) {
      return;
    }
    const PipHexPlacement = [
      { x: 0, y: -0.45, z: 0 },
      { x: -0.2, y: -0.37, z: 0 },
      { x: 0.2, y: -0.37, z: 0 },
      { x: -0.4, y: -0.25, z: 0 },
      { x: 0.4, y: -0.25, z: 0 }
    ];
    if (movesRemaining > PipHexPlacement.length) {
      console.log(`Warning: movesRemaining is higher than expected ${movesRemaining}`);
      movesRemaining = PipHexPlacement.length;
    }
    const unit = this.unit;
    const plot = { i: unit.location.x, j: unit.location.y };
    const parameters = { followTerrain: true, angle: 0, alpha: 0.7, color: 4283826175 /* normal */ };
    this.movementModelGroup.clear();
    for (let pipIndex = 0; pipIndex < movesRemaining; pipIndex++) {
      this.movementModelGroup.addModelAtPlot("UI_Movement_Pip", plot, PipHexPlacement[pipIndex], parameters);
    }
    let max = unit.Movement?.formationMaxMoves;
    if (max != void 0) {
      if (max > PipHexPlacement.length) {
        console.log(`unit.Movement?.formationMaxMoves (${max}) is higher than expected.`);
        max = PipHexPlacement.length;
      }
      for (let pipIndex = movesRemaining; pipIndex < max; pipIndex++) {
        this.movementModelGroup.addModelAtPlot(
          "UI_Movement_Pip_Empty",
          plot,
          PipHexPlacement[pipIndex],
          parameters
        );
      }
    }
  }
  get unit() {
    const unit = Units.get(this.componentID);
    if (!unit) {
      console.error("Failed attempt to get a unit for unit 3D info: ", ComponentID.toLogString(this.componentID));
    }
    return unit;
  }
}

export { Unit3DInfo as default };
//# sourceMappingURL=unit-info.js.map
