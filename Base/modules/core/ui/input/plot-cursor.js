import ContextManager from '../context-manager/context-manager.js';
import ActionHandler from './action-handler.js';
import Cursor, { CursorUpdatedEventName } from './cursor.js';
import { V as ViewManager } from '../views/view-manager.chunk.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../framework.chunk.js';
import './focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../panel-support.chunk.js';
import './input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';

const plotCursorModes = [
  {
    // A
    maxSpeed: 10 * 64,
    // 10 hexes per second
    initialDelay: 0.2,
    directional: false,
    analogStickThreshold: 0.35,
    cameraZoomScaling: true,
    panBorderPercentW: 0.2,
    panBorderPercentH: 0.15
  },
  {
    // B - faster and more sensitive
    maxSpeed: 12 * 64,
    // 10 hexes per second
    initialDelay: 0.1,
    directional: false,
    analogStickThreshold: 0.35,
    cameraZoomScaling: true,
    panBorderPercentW: 0,
    panBorderPercentH: 0
  }
];
const PlotCursorUpdatedEventName = "plot-cursor-coords-updated";
class PlotCursorUpdatedEvent extends CustomEvent {
  constructor(plotCoords) {
    super(PlotCursorUpdatedEventName, { bubbles: false, detail: { plotCoords } });
  }
}
class PlotCursorSingleton {
  static Instance;
  init = false;
  plotVFXHidden = false;
  _PlotCursorCoords = null;
  cursorParameters = plotCursorModes[0];
  PAN_MODIFIER = 10;
  // matches camera-controller.ts
  DEFAULT_DELAY = 0.2;
  // default initialDelay in seconds
  frameDelta = 0;
  // Time since previous frame
  controllerCursor;
  // Tracks continuous 2d movement without snapping to hexes
  nudgeDelay = 0;
  lookAtSent = false;
  isMoving = false;
  miniCursorModelGroup = null;
  miniCursorMarker = null;
  origin = { x: 0, y: 0, z: 0 };
  isUnitSelected = false;
  unitLocation = null;
  plotCursorModelGroup = null;
  cursorUpdatedListener = this.onCursorUpdated.bind(this);
  hidePlotVFXListener = this.hidePlotVFX.bind(this);
  showPlotVFXListener = this.showPlotVFX.bind(this);
  constructor() {
    Loading.runWhenLoaded(() => this.initialize());
  }
  initialize() {
    const disablePlotCursor = {
      id: "disablePlotCursor",
      category: "Systems",
      caption: "Disable Plot Cursor",
      domainType: "bool",
      value: false
    };
    UI.Debug.registerWidget(disablePlotCursor);
    const hidePlotVFX = {
      id: "hidePlotVFX",
      category: "Tuning",
      caption: "Hide Plot VFX",
      domainType: "bool",
      value: false
    };
    UI.Debug.registerWidget(hidePlotVFX);
    engine.on("DebugWidgetUpdated", (id, value) => {
      console.log(`DebugWidgetUpdated! ${id} ${value}`);
      if (id == "disablePlotCursor") {
        if (value) {
          this.shutdown();
        } else {
          this.startup();
        }
      } else if (id == "hidePlotVFX") {
        if (value) {
          this.hidePlotVFX();
        } else {
          this.showPlotVFX();
        }
      }
    });
    this.startup();
  }
  startup() {
    if (!this.init) {
      engine.on("BeginFrame", this.onUpdate, this);
      engine.on("plotCursorMode", this.onPlotCursorModeChange, this);
      engine.on("UnitSelectionChanged", this.onUnitSelectionChanged, this);
      engine.on("CameraChanged", this.onCameraChanged, this);
      engine.on("BeforeUnload", this.shutdown, this);
      if (Configuration.getXR()) {
        engine.on("PlotChanged", this.onPlotChanged, this);
      }
      window.addEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
      window.addEventListener("ui-hide-plot-vfx", this.hidePlotVFXListener);
      window.addEventListener("ui-show-plot-vfx", this.showPlotVFXListener);
      this.miniCursorModelGroup = WorldUI.createModelGroup("miniCursorModelGroup");
      this.plotCursorModelGroup = WorldUI.createModelGroup("plotCursorModelGroup");
      this.init = true;
    }
  }
  shutdown() {
    if (this.init) {
      engine.off("BeginFrame", this.onUpdate, this);
      engine.off("plotCursorMode", this.onPlotCursorModeChange, this);
      engine.off("UnitSelectionChanged", this.onUnitSelectionChanged, this);
      engine.off("CameraChanged", this.onCameraChanged, this);
      engine.off("BeforeUnload", this.shutdown, this);
      if (Configuration.getXR()) {
        engine.off("PlotChanged", this.onPlotChanged, this);
      }
      window.removeEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
      window.removeEventListener("ui-hide-plot-vfx", this.hidePlotVFXListener);
      window.removeEventListener("ui-show-plot-vfx", this.showPlotVFXListener);
      WorldUI.releaseMarker(this.miniCursorMarker);
      this.miniCursorMarker = null;
      if (this.miniCursorModelGroup) {
        this.miniCursorModelGroup.destroy();
        this.miniCursorModelGroup = null;
      }
      if (this.plotCursorModelGroup) {
        this.plotCursorModelGroup.destroy();
        this.plotCursorModelGroup = null;
      }
      this.init = false;
    }
  }
  onUpdate(timeDelta) {
    this.frameDelta = timeDelta;
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!PlotCursorSingleton.Instance) {
      PlotCursorSingleton.Instance = new PlotCursorSingleton();
    }
    return PlotCursorSingleton.Instance;
  }
  set plotCursorCoords(coords) {
    if (!Configuration.getXR()) {
      if (!ContextManager.canUseInput("plot-cursor", "set-plot-cursor-coords")) {
        return;
      }
    } else {
      console.warn("disabling canUseInput check due to hitch locking plot selection.");
    }
    if (coords == null && this._PlotCursorCoords == null) {
      return;
    } else if (this._PlotCursorCoords?.x == coords?.x && this._PlotCursorCoords?.y == coords?.y) {
      return;
    }
    this._PlotCursorCoords = coords;
    this.updateVirtualScreenPosition();
    this.realizeFocusedPlot();
    window.dispatchEvent(new PlotCursorUpdatedEvent(this._PlotCursorCoords));
  }
  get plotCursorCoords() {
    return this._PlotCursorCoords;
  }
  updateVirtualScreenPosition() {
    const screenUV = this.plotCursorCoords ? WorldUI.getScreenPlotPos(this.plotCursorCoords) : void 0;
    const pixel = { x: -1, y: -1 };
    if (screenUV) {
      pixel.x = screenUV.x * window.innerWidth;
      pixel.y = screenUV.y * window.innerHeight;
    }
    Cursor.setGamePadScreenPosition(pixel);
  }
  onCameraChanged(_data) {
    this.updateVirtualScreenPosition();
  }
  /// Debug function - used to change parameters of the plot cursor based on signals from the debug console
  onPlotCursorModeChange(mode) {
    if (mode < 0 || mode >= plotCursorModes.length) {
      console.warn(
        "Unable to change plot cursor mode. Out of range. mode: ",
        mode,
        " length: ",
        plotCursorModes.length
      );
      return;
    }
    const parameters = plotCursorModes[mode];
    if (parameters.analogStickThreshold > 0.9) {
      console.warn(
        "Not changing plot cursor mode, stick threshold is crazy big. mode: ",
        mode,
        " analogStickThreshold: ",
        parameters.analogStickThreshold
      );
      return;
    }
    this.cursorParameters = parameters;
    console.warn("Plot Cursor '" + mode + "' parameters are live:");
    console.log("     analogStickThreshold: ", parameters.analogStickThreshold);
    console.log("                 maxSpeed: ", parameters.maxSpeed);
    console.log("        cameraZoomScaling: ", parameters.cameraZoomScaling);
  }
  /// Sets the plot cursor position directly. (for XR)
  onPlotChanged(posX, posY) {
    if (!ViewManager.isWorldInputAllowed) {
      return;
    }
    this.plotCursorCoords = { x: posX, y: posY };
  }
  onCursorUpdated(event) {
    if (!ContextManager.canUseInput("plot-cursor", CursorUpdatedEventName)) {
      return;
    }
    if (ActionHandler.isGamepadActive && event.detail.x == 0 && event.detail.y == 0) {
      return;
    }
    this.plotCursorCoords = event.detail.plot;
  }
  calculateMovementDelta(x, y) {
    const min = this.cursorParameters.analogStickThreshold;
    const length = Math.hypot(x, y);
    let scale = (length - min) / (1 - min);
    scale = scale < 0 ? 0 : scale;
    scale = scale > 1 ? 1 : scale;
    scale = scale * scale;
    if (this.cursorParameters.cameraZoomScaling) {
      scale *= Camera.getMovementMultiplier();
    }
    scale *= this.cursorParameters.maxSpeed * this.frameDelta;
    return { x: x / length * scale, y: y / length * scale };
  }
  onMovePlotCursor(event) {
    if (event.detail.status == void 0 || event.detail.x == void 0 || event.detail.y == void 0) {
      console.error("onMovePlotCursor failed to receive valid detail data.");
      return;
    }
    if (event.detail.status == InputActionStatuses.FINISH) {
      this.controllerCursor = void 0;
      this.frameDelta = 0;
      this.nudgeDelay = 0;
      this.lookAtSent = false;
      this.isMoving = false;
      this.miniCursorModelGroup?.clear();
      WorldUI.releaseMarker(this.miniCursorMarker);
      this.miniCursorMarker = null;
      return;
    }
    if (this.plotCursorCoords == null || !GameplayMap.isValidLocation(this.plotCursorCoords)) {
      const center = Camera.pickPlot(0.5, 0.5);
      if (center == null) return;
      if (center.y < 0) center.y = 0;
      if (center.y > GameplayMap.getGridHeight() - 1) center.y = GameplayMap.getGridHeight() - 1;
      this.plotCursorCoords = center;
    }
    if (!this.controllerCursor) {
      const pos = this.plotCursorCoords ? WorldUI.getPlotLocation(this.plotCursorCoords) : { x: 0, y: 0 };
      this.controllerCursor = { x: pos.x, y: pos.y };
    }
    function constrainMovement(pos, dx, dy, directional) {
      if (directional) {
        const plot = WorldUI.getPlotAt(pos, true);
        if (plot) {
          const anchor = WorldUI.getPlotLocation({ x: plot.i, y: plot.j });
          pos = WorldUI.wrapWorldPosition(pos, { x: anchor.x, y: anchor.y });
          const axis = WorldUI.roundDirectionToHex(dx, dy);
          const distX = pos.x + dx - anchor.x;
          const distY = pos.y + dy - anchor.y;
          const dot = distX * axis.x + distY * axis.y;
          dx = anchor.x + axis.x * dot - pos.x;
          dy = anchor.y + axis.y * dot - pos.y;
        }
      }
      const OFFSET = 16;
      const min = WorldUI.getPlotLocation({ x: 0, y: 0 }).y - OFFSET;
      const max = WorldUI.getPlotLocation({ x: 0, y: GameplayMap.getGridHeight() - 1 }).y + OFFSET;
      if (pos.y + dy < min) {
        dy = min - pos.y;
      }
      if (pos.y + dy > max) {
        dy = max - pos.y;
      }
      return { x: dx, y: dy };
    }
    const updateMiniCursor = (x, y) => {
      if (!this.cursorParameters.directional && this.miniCursorModelGroup) {
        if (this.miniCursorMarker == null) {
          this.miniCursorMarker = WorldUI.createFixedMarker({ x, y, z: 0 });
          if (this.miniCursorMarker != null) {
            this.miniCursorModelGroup.addVFX("VFX_3dUI_PlotCursor_Free", { marker: this.miniCursorMarker }, { scale: 1, placement: PlacementMode.WATER });
          }
        } else {
          WorldUI.moveFixedMarkerImmediate(this.miniCursorMarker, { x, y, z: 0 });
        }
      }
    };
    if (!this.isMoving) {
      const config = Configuration.getUser();
      this.cursorParameters.maxSpeed = config.mapCursorSpeed * this.PAN_MODIFIER;
      this.cursorParameters.initialDelay = this.DEFAULT_DELAY * (200 - config.mapCursorSensitivity) / 100;
      this.cursorParameters.directional = config.mapCursorDirectional;
    }
    let delta = this.calculateMovementDelta(event.detail.x, event.detail.y);
    if (delta.x == 0 && delta.y == 0) {
      if (this.isMoving && this.nudgeDelay < 0) {
        updateMiniCursor(this.controllerCursor.x, this.controllerCursor.y);
      }
      return;
    }
    if (!this.isMoving) {
      this.isMoving = true;
      this.nudgeDelay = this.cursorParameters.initialDelay;
      const direction = WorldUI.getDirection(delta.x, delta.y);
      const plot = GameplayMap.getAdjacentPlotLocation(this.plotCursorCoords, direction);
      const cursor = WorldUI.getPlotLocation(plot);
      delta.x = cursor.x - this.controllerCursor.x;
      delta.y = cursor.y - this.controllerCursor.y;
      delta = constrainMovement(this.controllerCursor, delta.x, delta.y, this.cursorParameters.directional);
      this.controllerCursor.x += delta.x;
      this.controllerCursor.y += delta.y;
    } else if (this.nudgeDelay < 0) {
      delta = constrainMovement(this.controllerCursor, delta.x, delta.y, this.cursorParameters.directional);
      this.controllerCursor.x += delta.x;
      this.controllerCursor.y += delta.y;
      updateMiniCursor(this.controllerCursor.x, this.controllerCursor.y);
    } else {
      this.nudgeDelay -= this.frameDelta;
      this.frameDelta = 0;
      return;
    }
    this.controllerCursor = WorldUI.wrapWorldPosition(this.controllerCursor);
    const position = WorldUI.getScreenPos(this.controllerCursor);
    if (position) {
      const borderX = this.cursorParameters.panBorderPercentW;
      const borderY = this.cursorParameters.panBorderPercentH;
      const pan = { x: 0, y: 0 };
      if (delta.x < 0 && position.x < borderX) {
        pan.x = delta.x;
      } else if (delta.x > 0 && position.x > 1 - borderX) {
        pan.x = delta.x;
      }
      if (delta.y > 0 && position.y < borderY) {
        pan.y = delta.y;
      } else if (delta.y < 0 && position.y > 1 - borderY) {
        pan.y = delta.y;
      }
      if (pan.x != 0 || pan.y != 0) {
        Camera.panFocus(pan, false);
      }
    } else if (this.lookAtSent) {
      Camera.panFocus(delta, false);
    } else {
      Camera.lookAt(this.controllerCursor.x, this.controllerCursor.y);
      this.lookAtSent = true;
    }
    const newPlot = WorldUI.getPlotAt(this.controllerCursor, true);
    if (newPlot) {
      this.plotCursorCoords = { x: newPlot.i, y: newPlot.j };
    }
    this.frameDelta = 0;
  }
  realizeFocusedPlot() {
    if (this.plotCursorModelGroup && !this.plotVFXHidden) {
      this.plotCursorModelGroup.clear();
      if (this._PlotCursorCoords) {
        this.plotCursorModelGroup.addVFXAtPlot("VFX_3dUI_PlotCursor_01", this._PlotCursorCoords, this.origin);
      }
    }
  }
  onCenterPlotCursor(status) {
    if (status == InputActionStatuses.FINISH) {
      const centerPlot = Camera.pickPlot(0.5, 0.5);
      if (centerPlot) {
        this.plotCursorCoords = centerPlot;
      }
    }
  }
  hidePlotVFX() {
    if (!this.plotVFXHidden) {
      if (this.plotCursorModelGroup) {
        this.plotCursorModelGroup.clear();
      }
      this.plotVFXHidden = true;
    }
  }
  showPlotVFX() {
    if (this.plotVFXHidden) {
      this.plotVFXHidden = false;
      this.updateVirtualScreenPosition();
      this.realizeFocusedPlot();
    }
  }
  hideCursor() {
    this.hidePlotVFX();
  }
  showCursor() {
    this.showPlotVFX();
  }
  onUnitSelectionChanged(data) {
    this.isUnitSelected = data.selected;
    this.unitLocation = data.location;
    if (data.selected) {
      const selectedUnit = Units.get(data.unit);
      if (selectedUnit && selectedUnit.isOnMap) {
        if (this.plotCursorCoords) {
          this.plotCursorCoords.x = data.location.i;
          this.plotCursorCoords.y = data.location.j;
          this.updateVirtualScreenPosition();
          this.realizeFocusedPlot();
        } else {
          this.plotCursorCoords = { x: data.location.i, y: data.location.j };
        }
      }
    }
  }
  isOnUI(x, y) {
    const target = document.elementFromPoint(x, y);
    return !(target == document.documentElement || target == document.body || target == null || target.hasAttribute("data-pointer-passthrough"));
  }
  handleTouchTap(inputEvent) {
    if (this.isOnUI(inputEvent.detail.x, inputEvent.detail.y)) {
      return false;
    }
    const newCoords = Camera.pickPlotFromPoint(inputEvent.detail.x, inputEvent.detail.y);
    let live = true;
    if (this.isUnitSelected && (newCoords?.x != this.unitLocation?.i || newCoords?.y != this.unitLocation?.j) && // not the unit location
    (newCoords?.x != this.plotCursorCoords?.x || newCoords?.y != this.plotCursorCoords?.y)) {
      live = false;
    }
    this.plotCursorCoords = newCoords;
    return live;
  }
  handleTouchPress(inputEvent) {
    if (this.isOnUI(inputEvent.detail.x, inputEvent.detail.y)) {
      return true;
    }
    this.plotCursorCoords = Camera.pickPlotFromPoint(inputEvent.detail.x, inputEvent.detail.y);
    return true;
  }
  handleInput(inputEvent) {
    let live = true;
    switch (inputEvent.detail.name) {
      case "center-plot-cursor":
        this.onCenterPlotCursor(inputEvent.detail.status);
        break;
      case "touch-tap":
        live = this.handleTouchTap(inputEvent);
        break;
      case "touch-press":
        live = this.handleTouchPress(inputEvent);
        break;
      case "plot-move":
        this.onMovePlotCursor(inputEvent);
        live = false;
        break;
    }
    return live;
  }
  handleNavigation(_navigationEvent) {
    return false;
  }
}
const PlotCursor = PlotCursorSingleton.getInstance();

export { PlotCursor, PlotCursorUpdatedEvent, PlotCursorUpdatedEventName, PlotCursor as default };
//# sourceMappingURL=plot-cursor.js.map
