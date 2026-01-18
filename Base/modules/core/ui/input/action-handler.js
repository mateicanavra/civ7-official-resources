import { F as Framework } from '../framework.chunk.js';
import Cursor from './cursor.js';
import { A as AnalogInput, N as NavigateInputEvent, a as NavigateInputEventName, I as InputEngineEvent, b as InputEngineEventName } from './input-support.chunk.js';
import { U as UpdateGate } from '../utilities/utilities-update-gate.chunk.js';
import './focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';

class DebugInputSingleton {
  sendTunerActionA() {
    if (!UI.isInGame()) {
      return true;
    }
    const plotCoords = Camera.pickPlotFromPoint(Cursor.position.x, Cursor.position.y);
    if (plotCoords) {
      return window.dispatchEvent(
        new CustomEvent("tuner-user-action-a", { cancelable: true, detail: { plotCoords } })
      );
    }
    return true;
  }
  sendTunerActionB() {
    if (!UI.isInGame()) {
      return true;
    }
    const plotCoords = Camera.pickPlotFromPoint(Cursor.position.x, Cursor.position.y);
    if (plotCoords) {
      return window.dispatchEvent(
        new CustomEvent("tuner-user-action-b", { cancelable: true, detail: { plotCoords } })
      );
    }
    return true;
  }
}
const DebugInput = new DebugInputSingleton();

const FORCE_GAMEPAD = false;
const ActiveDeviceTypeChangedEventName = "active-device-type-changed";
class ActiveDeviceTypeChangedEvent extends CustomEvent {
  constructor(deviceType, gamepadActive) {
    super(ActiveDeviceTypeChangedEventName, { bubbles: false, detail: { deviceType, gamepadActive } });
  }
}
class MoveSoftCursorEvent extends CustomEvent {
  constructor(status, x, y) {
    super("move-soft-cursor", { detail: { status, x, y } });
  }
}
class ActionHandlerSingleton {
  static Instance;
  // Singleton
  _deviceType = InputDeviceType.Mouse;
  _deviceLayout = InputDeviceLayout.Unknown;
  // Keep track of the last move direction from nav-move so we can send a FINISH event
  lastMoveNavDirection = InputNavigationAction.NONE;
  onUpdate;
  updateGate = new UpdateGate(() => {
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  constructor() {
    engine.on("InputAction", (actionName, status, x, y) => {
      this.onEngineInput(actionName, status, x, y);
    });
    this.deviceType = Input.getActiveDeviceType();
    engine.on("input-source-changed", (deviceType, deviceLayout) => {
      this.onDeviceTypeChanged(deviceType, deviceLayout);
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!ActionHandlerSingleton.Instance) {
      ActionHandlerSingleton.Instance = new ActionHandlerSingleton();
    }
    return ActionHandlerSingleton.Instance;
  }
  /**
   * Try to handle the input in soft cursor mode
   * @param name The action name
   * @param status The status of the input
   * @param x x coordinate
   * @param y y coordinate
   * @returns true if the input was handled false otherwise
   */
  handleSoftCursorInput(name, status, x, y) {
    switch (name) {
      case "nav-move":
        window.dispatchEvent(new MoveSoftCursorEvent(status, x, y));
        return true;
      case "plot-move":
        window.dispatchEvent(new MoveSoftCursorEvent(status, x, y));
        return true;
      case "accept":
        if (status == InputActionStatuses.START) {
          Input.virtualMouseLeft(true, Cursor.position.x, Cursor.position.y);
        } else if (status == InputActionStatuses.FINISH) {
          Input.virtualMouseLeft(false, Cursor.position.x, Cursor.position.y);
        }
        return true;
      case "shell-action-1":
        if (status == InputActionStatuses.START) {
          Input.virtualMouseRight(true, Cursor.position.x, Cursor.position.y);
        } else if (status == InputActionStatuses.FINISH) {
          Input.virtualMouseRight(false, Cursor.position.x, Cursor.position.y);
        }
        return true;
    }
    return false;
  }
  /**
   * Handle the input for tuner action
   * @param name The action name
   * @param status The status of the input
   * @returns true if the tuner did not use the input (same as the cancel status)
   */
  handleTunerAction(name, status) {
    if (status == InputActionStatuses.FINISH) {
      if (name == "accept" || name == "mousebutton-left") {
        return DebugInput.sendTunerActionA();
      } else if (name == "cancel" || name == "mousebutton-right") {
        return DebugInput.sendTunerActionB();
      }
    }
    return true;
  }
  /**
   * Handle an input event that has come from the game engine.
   * Separates event into general input "action" event or a navigation based event.
   * Order of handling starts at specific element and cascades to broader scopes until false returned.
   * 	1. Send to ContextManager (which first try the focused item)
   * 	2. Send to global (window)
   *
   * @param name The "action" name of the event as defined by the engine's Input library (typically in the XML.)
   * @param status Status of the input type.
   * @param x coordinate if relevant.
   * @param y coordinate if relevant
   */
  onEngineInput(name, status, x, y) {
    if (Cursor.softCursorEnabled && this.handleSoftCursorInput(name, status, x, y)) {
      return;
    }
    if (!this.handleTunerAction(name, status)) {
      return;
    }
    const isNavigation = name.substr(0, 4) == "nav-";
    const isTouch = name.substr(0, 6) == "touch-";
    const isMouse = name.substr(0, 12) == "mousebutton-" || name.substr(0, 11) == "mousewheel-";
    if (isNavigation) {
      let navigationDirection = null;
      const hypheonLocation = name.indexOf("nav-");
      const directionName = name.substr(hypheonLocation + 4, name.length - 1).toLowerCase();
      switch (directionName) {
        case "up":
          navigationDirection = InputNavigationAction.UP;
          break;
        case "down":
          navigationDirection = InputNavigationAction.DOWN;
          break;
        case "left":
          navigationDirection = InputNavigationAction.LEFT;
          break;
        case "right":
          navigationDirection = InputNavigationAction.RIGHT;
          break;
        case "next":
          navigationDirection = InputNavigationAction.NEXT;
          break;
        case "previous":
          navigationDirection = InputNavigationAction.PREVIOUS;
          break;
        case "shell-next":
          navigationDirection = InputNavigationAction.SHELL_NEXT;
          break;
        case "shell-previous":
          navigationDirection = InputNavigationAction.SHELL_PREVIOUS;
          break;
        case "move":
          const length = Math.hypot(x, y);
          if (length > AnalogInput.deadzoneThreshold) {
            const angle = Math.atan2(y, x) + Math.PI;
            const fourthPI = Math.PI / 4;
            if (angle >= fourthPI && angle < fourthPI * 3) {
              navigationDirection = InputNavigationAction.DOWN;
            } else if (angle >= fourthPI * 3 && angle < fourthPI * 5) {
              navigationDirection = InputNavigationAction.RIGHT;
            } else if (angle >= fourthPI * 5 && angle < fourthPI * 7) {
              navigationDirection = InputNavigationAction.UP;
            } else {
              navigationDirection = InputNavigationAction.LEFT;
            }
          }
          if (status == InputActionStatuses.FINISH && this.lastMoveNavDirection != InputNavigationAction.NONE && navigationDirection == null) {
            navigationDirection = this.lastMoveNavDirection;
          } else if (navigationDirection) {
            this.lastMoveNavDirection = navigationDirection;
          }
          break;
      }
      const inputName = this.isGamepadActive || Cursor.softCursorEnabled ? name : "refocus";
      navigationDirection = this.isGamepadActive && navigationDirection != null ? navigationDirection : InputNavigationAction.NONE;
      const navigationEvent = new NavigateInputEvent(NavigateInputEventName, {
        bubbles: true,
        cancelable: true,
        detail: { name: inputName, status, x, y, navigation: navigationDirection }
      });
      if (navigationDirection != null) {
        try {
          Framework.ContextManager.handleNavigation(navigationEvent);
        } catch (err) {
        }
      }
    } else {
      const inputEvent = new InputEngineEvent(name, status, x, y, isTouch, isMouse);
      try {
        const live = Framework.ContextManager.handleInput(inputEvent);
        if (live) {
          window.dispatchEvent(inputEvent);
        }
      } catch (err) {
      }
    }
  }
  /**
   * Checks if an input event is for a navigation-based action.
   * @param inputEvent An input event.
   * @returns true if the input event is used for navigating input focus (e.g., switching between menu items)
   */
  isNavigationInput(inputEvent) {
    if (inputEvent.type != InputEngineEventName) {
      console.warn("Attempt to inspect a non-input event to see if it was a navigation input.");
      return false;
    }
    const name = inputEvent.detail.name;
    if (name == void 0 || name == "") {
      return false;
    }
    return name.substr(0, 4) == "nav-";
  }
  onDeviceTypeChanged(deviceType, deviceLayout) {
    if (FORCE_GAMEPAD) {
      if (this.deviceType == InputDeviceType.Controller) {
        return;
      }
      if (deviceType != InputDeviceType.Controller) {
        return;
      }
    }
    this.deviceType = deviceType;
    this.deviceLayout = deviceLayout;
    window.dispatchEvent(new ActiveDeviceTypeChangedEvent(this._deviceType, this.isGamepadActive));
    this.updateGate.call("onDeviceTypeChanged");
  }
  // Mouse+Keyboard are expected to be used simultaneously, switching between them should not trigger UI rebuilds
  // TODO merge mouse+keyboard into one input type, need to verify nothing depends on existing behavior
  get isMouseKeyboardActive() {
    return this._deviceType == InputDeviceType.Mouse || this._deviceType == InputDeviceType.Keyboard;
  }
  get isGamepadActive() {
    return this._deviceType == InputDeviceType.Controller;
  }
  get isTouchActive() {
    return this._deviceType == InputDeviceType.Touch;
  }
  get isHybridActive() {
    return this._deviceType == InputDeviceType.Hybrid;
  }
  get deviceLayout() {
    return this._deviceLayout;
  }
  get deviceType() {
    return this._deviceType;
  }
  isCursorShowing = false;
  set deviceType(inputDeviceType) {
    this._deviceType = inputDeviceType;
    if (this._deviceType != InputDeviceType.Keyboard && this._deviceType != InputDeviceType.Mouse && this._deviceType != InputDeviceType.Hybrid) {
      if (!this.isCursorShowing) {
        console.warn("Attempt to hide cursor when it's already hidden!");
        return;
      }
      this.isCursorShowing = false;
      UI.hideCursor();
    } else {
      if (this.isCursorShowing) {
        console.warn("Attempt to show cursor when it's already shown!");
        return;
      }
      this.isCursorShowing = true;
      UI.showCursor();
    }
  }
  /**
   * For the special case where it's believed an element has moved to
   * or from what is below the cursor and a new check needs to be done
   * for tooltips (and other reasons)?
   */
  forceCursorCheck() {
    if (this.isGamepadActive) {
      console.warn("action-handler: Performing cursor check when using gamepad can result in a loss of focus.");
      console.trace();
      return;
    }
    delayByFrame(() => {
      const x = Cursor.position.x;
      const y = Cursor.position.y;
      window.dispatchEvent(
        new MouseEvent("mousecheck", { clientX: -1, clientY: -1, screenX: -1, screenY: -1 })
      );
      delayByFrame(() => {
        window.dispatchEvent(
          new MouseEvent("mousecheck", { clientX: x, clientY: y, screenX: x, screenY: y })
        );
      }, 10);
    }, 1);
  }
  set deviceLayout(inputDeviceLayout) {
    this._deviceLayout = inputDeviceLayout;
  }
}
const ActionHandler = ActionHandlerSingleton.getInstance();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(ActionHandler);
  };
  engine.createJSModel("g_ActionHandler", ActionHandler);
  ActionHandler.updateCallback = updateModel;
  engine.synchronizeModels();
});

export { ActiveDeviceTypeChangedEvent, ActiveDeviceTypeChangedEventName, MoveSoftCursorEvent, ActionHandler as default };
//# sourceMappingURL=action-handler.js.map
