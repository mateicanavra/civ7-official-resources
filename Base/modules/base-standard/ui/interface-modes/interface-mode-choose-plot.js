import FocusManager from '../../../core/ui/input/focus-manager.js';
import { PlotCursorUpdatedEventName } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { O as OVERLAY_PRIORITY } from '../utilities/utilities-overlay.chunk.js';
import WorldInput from '../world-input/world-input.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
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

class ChoosePlotInterfaceMode {
  placementOverlayGroup = WorldUI.createOverlayGroup(
    "PlacementOverlayGroup",
    OVERLAY_PRIORITY.PLOT_HIGHLIGHT
  );
  placementModelGroup = WorldUI.createModelGroup("PlacementModelGroup");
  placementCursorOverlayGroup = WorldUI.createOverlayGroup(
    "PlacementCursorOverlayGroup",
    OVERLAY_PRIORITY.CURSOR
  );
  placementCursorModelGroup = WorldUI.createModelGroup("PlacementCursorModelGroup");
  //Set this to true to bypass having to select a single highlighted plot manually
  autoSelectSinglePlots = false;
  singlePlotCoord = null;
  _context = null;
  isPlotProposed = false;
  plotSelectionHandler = (plot, previousPlot) => {
    return this.selectPlot(plot, previousPlot);
  };
  plotCursorCoordsUpdatedListener = this.onPlotCursorCoordsUpdated.bind(this);
  get Context() {
    return this._context;
  }
  transitionTo(_oldMode, _newMode, context) {
    this._context = context;
    if (!this.initialize()) {
      InterfaceMode.switchToDefault();
      return;
    }
    if (this.autoSelectSinglePlots == true && this.singlePlotCoord != null) {
      this.commitPlot(this.singlePlotCoord);
    } else {
      this.decorate(this.placementOverlayGroup, this.placementModelGroup);
      window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
      WorldInput.setPlotSelectionHandler(this.plotSelectionHandler);
      FocusManager.SetWorldFocused();
    }
  }
  transitionFrom(_oldMode, _newMode) {
    this.reset();
    this.undecorate(this.placementOverlayGroup, this.placementModelGroup);
    this.placementOverlayGroup?.reset();
    this.placementCursorOverlayGroup?.reset();
    this.placementModelGroup.clear();
    this.placementCursorModelGroup.clear();
    this.isPlotProposed = false;
    this.autoSelectSinglePlots = false;
    this.singlePlotCoord = null;
    WorldInput.useDefaultPlotSelectionHandler();
    window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
  }
  selectPlot(plot, _previousPlot) {
    if (this.isPlotProposed) {
      throw new Error("A plot is already being proposed.");
    }
    this.isPlotProposed = true;
    this.proposePlot(
      plot,
      () => {
        this.commitPlot(plot);
        InterfaceMode.switchToDefault();
      },
      () => this.isPlotProposed = false
    );
    return false;
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH || !ViewManager.isWorldInputAllowed) {
      return true;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      const unitID = UI.Player.getHeadSelectedUnit();
      if (ComponentID.isValid(unitID)) {
        InterfaceMode.switchTo("INTERFACEMODE_UNIT_SELECTED", { UnitID: unitID });
      } else {
        InterfaceMode.switchToDefault();
      }
      return false;
    }
    return true;
  }
  onPlotCursorCoordsUpdated(event) {
    if (event.detail.plotCoords) {
      this.decorateHover(
        { x: event.detail.plotCoords.x, y: event.detail.plotCoords.y },
        this.placementCursorOverlayGroup,
        this.placementCursorModelGroup
      );
    }
  }
  /**
   * Decorate an overlay with details.
   * @param overlay The overlay group managed by the class.
   */
  decorate(_overlay, _modelGroup) {
  }
  /**
   * Decorate an overlay with details.
   * @param overlay The overlay group managed by the class.
   */
  decorateHover(_plotCoord, _overlay, _modelGroup) {
  }
  /**
   * Remove any decoration overlay.
   * @param overlay The overlay group managed by the class.
   */
  undecorate(_overlay, _modelGroup) {
  }
}

export { ChoosePlotInterfaceMode as default };
//# sourceMappingURL=interface-mode-choose-plot.js.map
