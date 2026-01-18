import { u as utils } from '../graph-layout/utils.chunk.js';
import ActionHandler from '../input/action-handler.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';
import { V as ViewManager } from '../views/view-manager.chunk.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../input/focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../panel-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';

var DragType = /* @__PURE__ */ ((DragType2) => {
  DragType2[DragType2["None"] = 0] = "None";
  DragType2[DragType2["Pan"] = 1] = "Pan";
  DragType2[DragType2["Rotate"] = 2] = "Rotate";
  DragType2[DragType2["Swipe"] = 3] = "Swipe";
  return DragType2;
})(DragType || {});
const cameraSwipeMinimumVelocity = 5;
const zoomRate = 0.3;
const panModifier = 10;
const edgePanDelta = 15;
var PanDirection = /* @__PURE__ */ ((PanDirection2) => {
  PanDirection2[PanDirection2["None"] = 0] = "None";
  PanDirection2[PanDirection2["Up"] = 1] = "Up";
  PanDirection2[PanDirection2["Down"] = 2] = "Down";
  PanDirection2[PanDirection2["Left"] = 4] = "Left";
  PanDirection2[PanDirection2["Right"] = 8] = "Right";
  return PanDirection2;
})(PanDirection || {});
var ZoomType = /* @__PURE__ */ ((ZoomType2) => {
  ZoomType2[ZoomType2["None"] = 0] = "None";
  ZoomType2[ZoomType2["In"] = 1] = "In";
  ZoomType2[ZoomType2["Out"] = 2] = "Out";
  return ZoomType2;
})(ZoomType || {});
class CameraControllerSingleton {
  static instance;
  keyboardPanDirection = 0 /* None */;
  edgePanDirection = 0 /* None */;
  zoomInProgress = 0 /* None */;
  currentDragType = 0 /* None */;
  lastMouseDragPos = { x: 0, y: 0 };
  keyboardCameraModifierActive = false;
  gamepadCameraPan = { x: 0, y: 0 };
  panSpeed = this.getModifiedPanSpeed();
  startingCameraZoom = 0;
  swipeVelocity = { x: 0, y: 0 };
  engineInputListener = this.onEngineInput.bind(this);
  updateFrameListener = this.onUpdateFrame.bind(this);
  userOptionChangedListener = this.onUserOptionChanged.bind(this);
  mouseMoveEventListener = null;
  updateFrameEventHandle = null;
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!CameraControllerSingleton.instance) {
      CameraControllerSingleton.instance = new CameraControllerSingleton();
    }
    return CameraControllerSingleton.instance;
  }
  onReady() {
    window.addEventListener(InputEngineEventName, this.engineInputListener);
    window.addEventListener("camera-drag-mouse", (event) => {
      this.dragMouse(event);
    });
    window.addEventListener("camera-drag-mouse-start", (event) => {
      this.dragMouseStart(event);
    });
    window.addEventListener("camera-drag-mouse-end", () => {
      this.dragMouseEnd();
    });
    window.addEventListener("camera-drag-mouse-swipe", (event) => {
      this.dragMouseSwipe(event);
    });
    engine.on("UI_OptionsChanged", this.userOptionChangedListener);
    this.updateEdgePanningState();
    this.startingCameraZoom = Camera.getState().zoomLevel;
  }
  /**
   * When the user options change check again if we should be processing edge panning
   */
  onUserOptionChanged() {
    this.updateEdgePanningState();
  }
  /**
   * Check the user configuration and see if edge panning should be enabled
   */
  updateEdgePanningState() {
    const edgePanEnabled = Configuration.getUser().edgePan && UI.isMouseAvailable();
    if (edgePanEnabled && this.mouseMoveEventListener == null) {
      this.mouseMoveEventListener = this.onMouseMove.bind(this);
      window.addEventListener("mousemove", this.mouseMoveEventListener, true);
    }
    if (!edgePanEnabled && this.mouseMoveEventListener != null) {
      window.removeEventListener("mousemove", this.mouseMoveEventListener, true);
      this.mouseMoveEventListener = null;
    }
  }
  /**
   * Track mouse position and keep the edge pan direction up to date.
   */
  onMouseMove(event) {
    this.edgePanDirection = 0 /* None */;
    if (event.clientX < edgePanDelta) {
      this.edgePanDirection |= 4 /* Left */;
    } else if (window.innerWidth - event.clientX < edgePanDelta) {
      this.edgePanDirection |= 8 /* Right */;
    }
    if (event.clientY < edgePanDelta) {
      this.edgePanDirection |= 1 /* Up */;
    } else if (window.innerHeight - event.clientY < edgePanDelta) {
      this.edgePanDirection |= 2 /* Down */;
    }
    if (this.edgePanDirection != 0 /* None */) {
      this.startPanning();
    }
  }
  /**
   * Get the configuration pan speed and modify it to an appropriate value
   */
  getModifiedPanSpeed() {
    return Configuration.getUser().cameraPanningSpeed * panModifier;
  }
  /**
   * Starts listening for UpdateFrame so we can start panning
   */
  startPanning() {
    if (this.updateFrameEventHandle) {
      return;
    }
    this.panSpeed = this.getModifiedPanSpeed();
    if (!this.updateFrameEventHandle) {
      this.updateFrameEventHandle = engine.on("UpdateFrame", this.updateFrameListener);
    }
  }
  /**
   * Per frame update as long as pan button is pressed.
   */
  onUpdateFrame(frameDelta) {
    if (!ViewManager.isWorldInputAllowed) {
      this.updateFrameEventHandle?.clear();
      this.updateFrameEventHandle = null;
      return;
    }
    if ((ActionHandler.isGamepadActive || ActionHandler.isTouchActive) && this.edgePanDirection != 0 /* None */) {
      this.edgePanDirection = 0 /* None */;
    }
    const discretePanDirection = this.keyboardPanDirection | this.edgePanDirection;
    if (discretePanDirection != 0 /* None */) {
      const panAmount = { x: 0, y: 0 };
      const panSpeed = this.panSpeed * frameDelta;
      if ((discretePanDirection & 1 /* Up */) == 1 /* Up */) {
        panAmount.y = panAmount.y + panSpeed;
      }
      if ((discretePanDirection & 2 /* Down */) == 2 /* Down */) {
        panAmount.y = panAmount.y - panSpeed;
      }
      if ((discretePanDirection & 4 /* Left */) == 4 /* Left */) {
        panAmount.x = panAmount.x - panSpeed;
      }
      if ((discretePanDirection & 8 /* Right */) == 8 /* Right */) {
        panAmount.x = panAmount.x + panSpeed;
      }
      if (panAmount.x != 0 || panAmount.y != 0) {
        Camera.panFocus(panAmount);
      }
    } else if (this.gamepadCameraPan.x != 0 || this.gamepadCameraPan.y != 0) {
      const panSpeed = this.panSpeed * frameDelta;
      const panAmount = { x: this.gamepadCameraPan.x * panSpeed, y: this.gamepadCameraPan.y * panSpeed };
      Camera.panFocus(panAmount);
    } else if (this.currentDragType == 3 /* Swipe */) {
      this.handleSwipe(frameDelta);
    } else {
      this.updateFrameEventHandle?.clear();
      this.updateFrameEventHandle = null;
    }
  }
  onEngineInput(inputEvent) {
    switch (inputEvent.detail.name) {
      case "keyboard-camera-modifier":
        this.onKeyboardCameraModifier(inputEvent.detail.status);
        break;
    }
  }
  handleSwipe(timeStampDiff) {
    const panAmount = { x: 0, y: 0 };
    panAmount.x = this.swipeVelocity.x != 0 ? this.swipeVelocity.x * timeStampDiff / 1e3 : 0;
    panAmount.y = this.swipeVelocity.y != 0 ? this.swipeVelocity.y * timeStampDiff / 1e3 : 0;
    if (Math.abs(panAmount.x) + Math.abs(panAmount.y) < cameraSwipeMinimumVelocity) {
      this.currentDragType = 0 /* None */;
    } else {
      this.swipeVelocity.x -= panAmount.x;
      this.swipeVelocity.y -= panAmount.y;
      Camera.panFocus(panAmount);
    }
  }
  onKeyboardCameraModifier(status) {
    if (status == InputActionStatuses.START) {
      this.keyboardCameraModifierActive = true;
    } else if (status == InputActionStatuses.FINISH) {
      this.keyboardCameraModifierActive = false;
    }
  }
  onGamepadCameraPan(status, panDir) {
    switch (status) {
      case InputActionStatuses.START:
      case InputActionStatuses.UPDATE:
        this.gamepadCameraPan = panDir;
        this.startPanning();
        break;
      case InputActionStatuses.FINISH:
        this.gamepadCameraPan = { x: 0, y: 0 };
        break;
    }
  }
  setKeyboardPan(event, direction) {
    const status = event.detail.status;
    if (status == InputActionStatuses.START) {
      this.keyboardPanDirection |= direction;
      this.startPanning();
    } else if (status == InputActionStatuses.FINISH) {
      this.keyboardPanDirection ^= direction;
    }
  }
  cameraRotate(status, x) {
    if (!ViewManager.isWorldInputAllowed) {
      return;
    }
    if (status == InputActionStatuses.FINISH) {
      Camera.rotate(0, false);
    } else if (status != InputActionStatuses.START) {
      Camera.rotate(x, true);
    }
  }
  cameraZoomIn(status, x) {
    if (!ViewManager.isWorldInputAllowed || this.zoomInProgress == 2 /* Out */) {
      return;
    }
    this.zoomInProgress = 1 /* In */;
    let zoomValue = x;
    if ((status == InputActionStatuses.START || status == InputActionStatuses.UPDATE) && zoomValue == 0) {
      zoomValue = 1;
    }
    const cameraState = Camera.getState();
    const amount = Math.max(cameraState.zoomLevel - zoomRate * zoomValue, 0);
    Camera.zoom(amount);
    if (status == InputActionStatuses.FINISH) {
      this.zoomInProgress = 0 /* None */;
    }
  }
  cameraZoomOut(status, x) {
    if (!ViewManager.isWorldInputAllowed || this.zoomInProgress == 1 /* In */) {
      return;
    }
    this.zoomInProgress = 2 /* Out */;
    let zoomValue = x;
    if ((status == InputActionStatuses.START || status == InputActionStatuses.UPDATE) && zoomValue == 0) {
      zoomValue = 1;
    }
    const cameraState = Camera.getState();
    const amount = Math.min(cameraState.zoomLevel + zoomRate * zoomValue, 1);
    Camera.zoom(amount);
    if (status == InputActionStatuses.FINISH) {
      this.zoomInProgress = 0 /* None */;
    }
  }
  panToMouse(event) {
    if (event.detail.x && event.detail.y && event.detail.status == InputActionStatuses.FINISH && ViewManager.isWorldInputAllowed) {
      const plotCoords = Camera.pickPlotFromPoint(event.detail.x, event.detail.y);
      if (plotCoords) {
        Camera.lookAtPlot(plotCoords);
      }
    }
  }
  dragMouse(event) {
    if (event.detail.x && event.detail.y) {
      if (this.currentDragType == 1 /* Pan */) {
        const nx = event.detail.x / window.innerWidth;
        const ny = event.detail.y / window.innerHeight;
        const newMouseDragPos = { x: nx, y: ny };
        Camera.dragFocus(this.lastMouseDragPos, newMouseDragPos);
        this.lastMouseDragPos = newMouseDragPos;
      }
    }
  }
  isOnUI(x, y) {
    const target = document.elementFromPoint(x, y);
    return !(target == document.documentElement || target == document.body || target == null || target.hasAttribute("data-pointer-passthrough"));
  }
  dragMouseStart(event) {
    if (event.detail.x && event.detail.y) {
      if (this.isOnUI(event.detail.x, event.detail.y)) {
        return;
      }
      if (this.keyboardCameraModifierActive) {
        this.currentDragType = 2 /* Rotate */;
      } else {
        this.currentDragType = 1 /* Pan */;
        const nx = event.detail.x / window.innerWidth;
        const ny = event.detail.y / window.innerHeight;
        this.lastMouseDragPos = { x: nx, y: ny };
      }
    }
  }
  dragMouseEnd() {
    this.currentDragType = 0 /* None */;
  }
  dragMouseSwipe(event) {
    this.swipeVelocity.x = -event.detail.x;
    this.swipeVelocity.y = event.detail.y;
    this.currentDragType = 3 /* Swipe */;
    this.startPanning();
  }
  handleTouchPan(inputEvent) {
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.dragMouseStart(inputEvent);
        break;
      case InputActionStatuses.DRAG:
        this.dragMouse(inputEvent);
        break;
      case InputActionStatuses.FINISH:
        this.dragMouseEnd();
        break;
      default:
        break;
    }
  }
  /**
   *  @returns true if still live, false if input should stop.
   */
  handleInput(inputEvent) {
    switch (inputEvent.detail.name) {
      case "mousebutton-middle":
        this.panToMouse(inputEvent);
        return false;
      case "keyboard-nav-up":
        this.setKeyboardPan(inputEvent, 1 /* Up */);
        return false;
      case "keyboard-nav-down":
        this.setKeyboardPan(inputEvent, 2 /* Down */);
        return false;
      case "keyboard-nav-right":
        this.setKeyboardPan(inputEvent, 8 /* Right */);
        return false;
      case "keyboard-nav-left":
        this.setKeyboardPan(inputEvent, 4 /* Left */);
        return false;
      case "camera-pan":
        this.onGamepadCameraPan(inputEvent.detail.status, { x: inputEvent.detail.x, y: inputEvent.detail.y });
        return false;
      case "camera-rotate":
        this.cameraRotate(inputEvent.detail.status, inputEvent.detail.x);
        return false;
      case "camera-zoom-in":
      case "touch-pinch-in":
        this.cameraZoomIn(inputEvent.detail.status, inputEvent.detail.x);
        return false;
      case "camera-zoom-out":
      case "touch-pinch-out":
        this.cameraZoomOut(inputEvent.detail.status, inputEvent.detail.x);
        return false;
      case "touch-begin":
        this.startingCameraZoom = Camera.getState().zoomLevel;
        return true;
      case "touch-pinch-direct":
        if (!ViewManager.isWorldInputAllowed) {
          return false;
        }
        {
          let newZoom = 1 - inputEvent.detail.x;
          const startZoom = 1 - inputEvent.detail.y;
          newZoom -= startZoom;
          newZoom += this.startingCameraZoom;
          newZoom = utils.clamp(newZoom, 0, 1);
          Camera.zoom(newZoom);
        }
        return false;
      case "touch-pan":
        this.handleTouchPan(inputEvent);
        return false;
      case "touch-swipe":
        this.dragMouseSwipe(inputEvent);
        return false;
      case "touch-touch":
        this.dragMouseEnd();
        return true;
    }
    return true;
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(_navigationEvent) {
    return true;
  }
}
const CameraController = CameraControllerSingleton.getInstance();

export { CameraController as default };
//# sourceMappingURL=camera-controller.js.map
