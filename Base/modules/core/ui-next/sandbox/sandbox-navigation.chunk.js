import { a as createEffect, l as on, I as IsControllerActive } from '../components/panel.chunk.js';
import { N as NavigateInputEvent, a as NavigateInputEventName, I as InputEngineEvent } from '../../ui/input/input-support.chunk.js';

class SandboxNavigation {
  targetElement;
  constructor() {
    engine.on("InputAction", this.onEngineInput.bind(this));
    createEffect(
      on(IsControllerActive, (isControllerActive) => {
        if (isControllerActive) {
          this.targetElement?.focus();
        } else {
          document.activeElement?.blur();
        }
      })
    );
  }
  setFocus(element) {
    this.targetElement = element;
  }
  onEngineInput(name, status, x, y) {
    if (name.startsWith("nav-")) {
      let navigationDirection = InputNavigationAction.NONE;
      switch (name) {
        case "nav-up":
          navigationDirection = InputNavigationAction.UP;
          break;
        case "nav-down":
          navigationDirection = InputNavigationAction.DOWN;
          break;
        case "nav-left":
          navigationDirection = InputNavigationAction.LEFT;
          break;
        case "nav-right":
          navigationDirection = InputNavigationAction.RIGHT;
          break;
        case "nav-next":
          navigationDirection = InputNavigationAction.NEXT;
          break;
        case "nav-previous":
          navigationDirection = InputNavigationAction.PREVIOUS;
          break;
        case "nav-shell-next":
          navigationDirection = InputNavigationAction.SHELL_NEXT;
          break;
        case "nav-shell-previous":
          navigationDirection = InputNavigationAction.SHELL_PREVIOUS;
          break;
      }
      const navigationEvent = new NavigateInputEvent(NavigateInputEventName, {
        bubbles: true,
        cancelable: true,
        detail: { name, status, x, y, navigation: navigationDirection }
      });
      this.targetElement?.dispatchEvent(navigationEvent);
    } else {
      const isTouch = name.substr(0, 6) == "touch-";
      const isMouse = name.substr(0, 12) == "mousebutton-" || name.substr(0, 11) == "mousewheel-";
      const inputEvent = new InputEngineEvent(name, status, x, y, isTouch, isMouse);
      if (document.activeElement?.hasAttribute("data-activatable")) {
        document.activeElement.dispatchEvent(inputEvent);
      }
    }
  }
}

export { SandboxNavigation as S };
//# sourceMappingURL=sandbox-navigation.chunk.js.map
