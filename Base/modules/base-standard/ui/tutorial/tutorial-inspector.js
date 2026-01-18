import { TutorialItemState } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import './tutorial-events.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

class TutorialInspectorModel {
  items = [];
  _OnUpdate;
  constructor() {
    engine.whenReady.then(() => {
      waitUntilValue(() => {
        return TutorialManager;
      }).then(() => {
        TutorialManager.statusChanged.on(() => {
          this.update();
        });
        this.update();
      });
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  /**
   * Create a list of activating events as a string
   * @param {TutorailItem} item
   * @returns {string} Comma separated list of events that will activate this tutorial item.
   */
  activatingEventsToString(item) {
    let events = "";
    item.activationEngineEvents.forEach((event) => {
      if (events.length > 0) events += ",";
      events += event;
    });
    item.activationCustomEvents.forEach((event) => {
      if (events.length > 0) events += ",";
      events += event;
    });
    return events;
  }
  update() {
    this.items = [];
    TutorialManager.items.forEach((item) => {
      this.items.push({
        ID: item.skip ? `(${item.ID})` : item.ID,
        // place in () if skipped
        eState: item.eState,
        isActive: item.isActive,
        isCompleted: item.isCompleted,
        status: TutorialItemState[item.eState],
        hasEventListeners: item.activationEngineEvents.length > 0,
        activateLabel: Locale.compose(this.activatingEventsToString(item)),
        index: this.items.length
      });
    });
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
}
const TutorialData = new TutorialInspectorModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(TutorialData);
  };
  engine.createJSModel("g_TutorialInspector", TutorialData);
  TutorialData.updateCallback = updateModel;
});

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
    if (draggable) {
      root.setAttribute("tabindex", "-1");
      FocusManager.setFocus(root);
    } else {
      FocusManager.SetWorldFocused();
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

const styles = "fs://game/base-standard/ui/tutorial/tutorial-inspector.css";

class TutorialInspector extends Component {
  removeDraggable;
  removeResizeable;
  constructor(root) {
    super(root);
  }
  onAttach() {
    super.onAttach();
    const frame = document.createElement("fxs-frame");
    frame.addEventListener("action-activate", (event) => {
      const targetElement = event.target;
      if (targetElement) {
        const itemType = targetElement.getAttribute("item-type");
        if (itemType) {
          this.playSound("data-audio-activate", "data-audio-activate-ref");
          engine.trigger("TutorialBegin");
        }
      }
    });
    const scrollable = document.createElement("fxs-scrollable");
    const container = document.createElement("div");
    container.classList.add("flow-column");
    container.classList.add("container-list");
    container.setAttribute("tabindex", "-1");
    const itemDiv = document.createElement("div");
    Databind.for(itemDiv, "g_TutorialInspector.items", "item");
    {
      const item = document.createElement("div");
      item.classList.add("tutorial-inspector-item");
      Databind.classToggle(item, "tintbg", "{{item.index}} % 2 == 0");
      const itemBG = document.createElement("div");
      itemBG.classList.add("bg-container");
      item.appendChild(itemBG);
      const caption = document.createElement("div");
      caption.classList.add("caption");
      caption.classList.add("ti__item-id");
      Databind.locText(caption, "item.ID");
      item.appendChild(caption);
      const itemState = document.createElement("div");
      itemState.classList.add("caption");
      itemState.classList.add("ti__item-status");
      Databind.locText(itemState, "item.status");
      item.appendChild(itemState);
      const activateButton = document.createElement("fxs-activatable");
      activateButton.classList.add("ti__button");
      activateButton.innerHTML = Locale.compose("LOC_UI_TUT_ACTIVATE");
      Databind.classToggle(activateButton, "disabled", "item.isDisabled");
      Databind.classToggle(activateButton, "hidden", "!{{item.hasEventListeners}}");
      Databind.attribute(activateButton, "nodeID", "item.ID");
      Databind.tooltip(activateButton, "item.activateLabel");
      activateButton.addEventListener("action-activate", (event) => {
        const targetElement = event.target;
        if (targetElement) {
          const nodeID = targetElement.getAttribute("nodeID");
          if (nodeID) {
            if (TutorialManager.forceActivation(nodeID)) {
              this.playSound("data-audio-activate", "data-audio-activate-ref");
            }
          }
        }
      });
      item.appendChild(activateButton);
      const stateButton = document.createElement("fxs-activatable");
      stateButton.classList.add("ti__item-state_button");
      Databind.attribute(stateButton, "nodeID", "item.ID");
      Databind.attribute(stateButton, "status", "item.status");
      Databind.tooltip(stateButton, "item.eState");
      Databind.locText(stateButton, "item.eState");
      stateButton.addEventListener("action-activate", (event) => {
        const targetElement = event.target;
        if (targetElement) {
          const status = targetElement.getAttribute("status");
          const nodeID = targetElement.getAttribute("nodeID");
          if (nodeID && status) {
            this.playSound("data-audio-activate", "data-audio-activate-ref");
            this.forceNextItemState(status, nodeID);
          }
        }
      });
      item.appendChild(stateButton);
      itemDiv.appendChild(item);
    }
    container.appendChild(itemDiv);
    scrollable.appendChild(container);
    frame.appendChild(scrollable);
    this.Root.appendChild(frame);
    const toggleButton = document.createElement("fxs-button");
    toggleButton.setAttribute("caption", Locale.compose("LOC_UI_TOGGLE_TUT_INSPECTOR"));
    toggleButton.addEventListener("action-activate", () => {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      this.Root.classList.toggle("collapsed");
    });
    toggleButton.classList.add("mb-2");
    const resetButton = document.createElement("fxs-button");
    resetButton.setAttribute("caption", Locale.compose("LOC_UI_RESET_TUT_MANAGER"));
    resetButton.addEventListener("action-activate", () => {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      TutorialManager.reset();
    });
    const logButton = document.createElement("fxs-button");
    logButton.setAttribute("caption", Locale.compose("LOC_UI_LOG_TUT_MANAGER"));
    logButton.addEventListener("action-activate", () => {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      const logLines = TutorialManager.getDebugLogOutput();
      logLines.forEach((line) => {
        console.log(line);
      });
    });
    const close = document.createElement("fxs-button");
    Databind.if(close, "g_NavTray.isTrayActive");
    close.setAttribute("caption", "LOC_GENERIC_CLOSE");
    close.addEventListener("action-activate", () => {
      UI.sendAudioEvent("generic-panel-hiding");
      this.close();
    });
    frame.appendChild(toggleButton);
    frame.appendChild(resetButton);
    frame.appendChild(logButton);
    frame.appendChild(close);
    const closeButton = document.createElement("fxs-close-button");
    closeButton.addEventListener("action-activate", () => {
      UI.sendAudioEvent("generic-panel-hiding");
      this.close();
    });
    this.Root.appendChild(closeButton);
    const minimizeButton = document.createElement("fxs-minimize-button");
    this.Root.appendChild(minimizeButton);
    this.removeDraggable = MakeDraggable(this.Root, ".header");
    this.removeResizeable = MakeResizeable(this.Root);
  }
  onDetach() {
    if (this.removeDraggable && this.removeResizeable) {
      this.removeDraggable();
      this.removeResizeable();
    }
  }
  forceNextItemState(currentStatus, nodeID) {
    switch (currentStatus) {
      case TutorialItemState[TutorialItemState.Unseen]:
        TutorialManager.forceActivate(nodeID);
        break;
      case TutorialItemState[TutorialItemState.Active]:
      case TutorialItemState[TutorialItemState.Persistent]:
        TutorialManager.forceComplete(nodeID);
        break;
      case TutorialItemState[TutorialItemState.Completed]:
        TutorialManager.unsee(nodeID);
        break;
      default:
        break;
    }
  }
  close() {
    ContextManager.popIncluding(this.Root.tagName);
  }
}
Controls.define("panel-tutorial-inspector", {
  createInstance: TutorialInspector,
  description: "",
  classNames: ["tutorial-inspector"],
  styles: [styles],
  attributes: []
});
//# sourceMappingURL=tutorial-inspector.js.map
