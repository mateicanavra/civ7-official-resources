import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { InputEngineEventName } from '../input/input-support.js';
import NavTray from '../navigation-tray/model-navigation-tray.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';

function MakeDraggable(root, selector) {
  let prevX;
  let prevY;
  let draggable;
  let dragArea;
  requestAnimationFrame(() => {
    dragArea = root.querySelector(selector);
    if (!dragArea) {
      console.error("MakeDraggable cannot grab class of passed in, even after animation frame.", selector);
    } else {
      dragArea.style.pointerEvents = "auto";
      updateNavTray();
    }
  });
  const updateNavTray = () => {
    NavTray.clear();
    NavTray.addOrUpdateToggleTooltip(draggable ? "LOC_UI_DRAG_STOP" : "LOC_UI_DRAG_START");
  };
  const onMouseDown = (event) => {
    if (event.target instanceof HTMLElement) {
      draggable = dragArea === event.target;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const endDrag = () => {
    draggable = false;
    updateNavTray();
  };
  const onInputAction = (name, status, x, y) => {
    if (name.substr(0, 4) == "nav-" && draggable) {
      const rect = root.getBoundingClientRect();
      const startLeft = rect.left;
      const startTop = rect.top;
      const PX_FACTOR = 120;
      if (!prevX) {
        prevX = startLeft;
        prevY = startTop;
      } else {
        const newX = -(x * PX_FACTOR);
        const newY = y * PX_FACTOR;
        root.style.leftPX = startLeft - newX;
        prevX = newX;
        root.style.topPX = startTop - newY;
        prevY = newY;
        if (root.style.right != "initial") {
          root.style.right = "initial";
        }
      }
    }
    if (name != "mousebutton-right" || status != InputActionStatuses.DRAG || !draggable) {
      return;
    }
    if (!prevX) {
      prevX = x;
      prevY = y;
    } else {
      const newX = prevX - x;
      const newY = prevY - y;
      const rect = root.getBoundingClientRect();
      root.style.leftPX = rect.left - newX;
      prevX = x;
      root.style.topPX = rect.top - newY;
      prevY = y;
      if (root.style.right != "initial") {
        root.style.right = "initial";
      }
    }
  };
  const toggleFocus = () => {
    const focusManager = FocusManager.get();
    if (draggable) {
      root.setAttribute("tabindex", "-1");
      focusManager.setFocus(root);
    } else {
      focusManager.clearFocus();
    }
    updateNavTray();
  };
  const onEngineInput = (inputEvent) => {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-right" && dragArea === inputEvent.target) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
    if (inputEvent.detail.name == "toggle-tooltip") {
      draggable = !draggable;
      toggleFocus();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  engine.on("InputAction", onInputAction);
  root.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", endDrag, true);
  window.addEventListener(ActiveDeviceTypeChangedEventName, endDrag);
  window.addEventListener(InputEngineEventName, onEngineInput);
  return () => {
    engine.off("InputAction", onInputAction);
    root.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, endDrag);
    window.removeEventListener(InputEngineEventName, onEngineInput);
  };
}
function MakeResizeable(root) {
  let prevX;
  let prevY;
  let draggable;
  let dx;
  let dy;
  const resizer = document.createElement("div");
  resizer.classList.add("resizer");
  root.appendChild(resizer);
  const onMouseDown = (event) => {
    prevX = null;
    prevY = null;
    if (event.target instanceof HTMLElement) {
      draggable = event.target.classList.contains("resizer");
    }
  };
  root.addEventListener("mousedown", onMouseDown);
  engine.on("InputAction", (name, status, x, y) => {
    if (name != "mousebutton-right" || status != InputActionStatuses.DRAG || !draggable || root.querySelector(".minimized-frame")) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    if (prevX && prevY) {
      dx = x - prevX;
      dy = y - prevY;
    } else {
      dx = 0;
      dy = 0;
    }
    root.style.width = `${startWidth + dx}px`;
    root.style.height = `${startHeight + dy}px`;
    prevX = x;
    prevY = y;
  });
  return () => {
    root.removeEventListener("mousedown", onMouseDown);
  };
}

export { MakeDraggable, MakeResizeable };
//# sourceMappingURL=utilities-frame.js.map
