import './model-tutorial-inspector.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import Databind from '../../../core/ui/utilities/utilities-core-databinding.js';
import { MakeDraggable, MakeResizeable } from '../../../core/ui/utilities/utilities-frame.js';
import { TutorialItemState } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';
import styles from './tutorial-inspector.scss.js';

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
