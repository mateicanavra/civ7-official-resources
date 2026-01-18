import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

const UpdateOperationTargetEventName = "update-operation-target";
class UpdateOperationTargetEvent extends CustomEvent {
  constructor(plots, canStart) {
    super(UpdateOperationTargetEventName, {
      bubbles: false,
      cancelable: false,
      detail: { plots, canStart }
    });
  }
}
const HexToFloat4 = (hex, alpha = 1) => {
  const r = hex >> 16 & 255;
  const g = hex >> 8 & 255;
  const b = hex & 255;
  return { x: r / 255, y: g / 255, z: b / 255, w: Math.min(1, Math.max(0, alpha)) };
};
const EXCLUSION_TEST = HexToFloat4(6883593, 0.6);
const CAN_START = HexToFloat4(2682558, 0.45);
class OperationTargetLensLayer {
  overlayGroup = WorldUI.createOverlayGroup("OperationTargetLensLayer", 1);
  plotOverlay = this.overlayGroup.addPlotOverlay();
  updateOperationTargetListener = this.onUpdateOperationTarget.bind(this);
  unitSelectionChangedListener = this.onUnitSelectionChanged.bind(this);
  initLayer() {
  }
  applyLayer() {
    engine.on("UnitSelectionChanged", this.unitSelectionChangedListener);
    window.addEventListener(UpdateOperationTargetEventName, this.updateOperationTargetListener);
  }
  removeLayer() {
    this.plotOverlay.clear();
    engine.off("UnitSelectionChanged", this.unitSelectionChangedListener);
    window.removeEventListener(UpdateOperationTargetEventName, this.updateOperationTargetListener);
  }
  onUnitSelectionChanged() {
    this.plotOverlay.clear();
  }
  onUpdateOperationTarget(event) {
    this.plotOverlay.clear();
    if (event.detail.plots.length > 0) {
      this.plotOverlay.addPlots(event.detail.plots, {
        fillColor: event.detail.canStart ? CAN_START : EXCLUSION_TEST
      });
    }
  }
}
LensManager.registerLensLayer("fxs-operation-target-layer", new OperationTargetLensLayer());

export { UpdateOperationTargetEvent, UpdateOperationTargetEventName };
//# sourceMappingURL=operation-target-layer.js.map
