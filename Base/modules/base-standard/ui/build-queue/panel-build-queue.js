import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { a as ActionActivateEventName } from '../../../core/ui/components/fxs-activatable.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { BuildQueue } from './model-build-queue.js';
import { FocusCityViewEventName, FocusCityViewEvent } from '../views/view-city.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const styles = "fs://game/base-standard/ui/build-queue/panel-build-queue.css";

class RequestBuildQueueMoveItemUpEvent extends CustomEvent {
  constructor(index) {
    super("request-build-queue-move-item-up", {
      bubbles: true,
      detail: { index }
    });
  }
}
class RequestBuildQueueMoveItemLastEvent extends CustomEvent {
  constructor(index) {
    super("request-build-queue-move-item-last", {
      bubbles: true,
      detail: { index }
    });
  }
}
class RequestBuildQueueCancelItemEvent extends CustomEvent {
  constructor(index) {
    super("request-build-queue-cancel-item", {
      bubbles: true,
      detail: { index }
    });
  }
}
class PanelBuildQueue extends Component {
  focusInListener = this.onFocusIn.bind(this);
  focusOutListener = this.onFocusOut.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  itemEngineInputListener = this.onItemEngineInput.bind(this);
  itemFocusListener = this.onItemFocus.bind(this);
  itemActivateListener = this.onItemActivate.bind(this);
  activeDeviceChangeListener = this.onActiveDeviceChange.bind(this);
  deleteButtonListener = this.requestDelete.bind(this);
  upButtonListener = this.requestMoveUp.bind(this);
  firstFocus = true;
  onAttach() {
    super.onAttach();
    window.addEventListener(FocusCityViewEventName, this.onFocusCityViewEvent);
    this.Root.listenForWindowEvent(ActiveDeviceTypeChangedEventName, this.activeDeviceChangeListener);
    this.Root.addEventListener("focusin", this.focusInListener);
    this.Root.addEventListener("focusout", this.focusOutListener, true);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    const activeTitle = document.createElement("div");
    activeTitle.classList.add(
      "active-title",
      "flex",
      "justify-center",
      "font-title",
      "uppercase",
      "text-sm",
      "py-2"
    );
    activeTitle.setAttribute("data-l10n-id", "LOC_UI_QUEUE_ACTIVE");
    const queuedTitle = document.createElement("div");
    queuedTitle.classList.add(
      "queued-title",
      "flex",
      "justify-center",
      "font-title",
      "uppercase",
      "text-sm",
      "py-2",
      "mt-5"
    );
    queuedTitle.setAttribute("data-l10n-id", "LOC_UI_QUEUE_QUEUED");
    const scrollableContainer = document.createElement("fxs-scrollable");
    scrollableContainer.classList.add("build-queue-scrollable-root", "max-h-128", "pr-2");
    const containerQueued = document.createElement("fxs-vslot");
    scrollableContainer.appendChild(containerQueued);
    this.Root.appendChild(scrollableContainer);
    containerQueued.classList.add("build-queue__item-container-queued", "relative", "mr-2\\.5", "grow");
    containerQueued.setAttribute("data-bind-if", "{{g_BuildQueue.isTrackingCity}}");
    const itemContainerDiv = document.createElement("div");
    Databind.for(itemContainerDiv, "g_BuildQueue.items", "item");
    {
      const itemContainerOuter = document.createElement("fxs-vslot");
      itemContainerOuter.classList.add("build-queue__item-container-outer");
      const itemContainer = document.createElement("fxs-activatable");
      itemContainer.classList.add(
        "build-queue__item-container",
        "items-center",
        "justify-center",
        "flex",
        "flex-row",
        "relative"
      );
      itemContainer.setAttribute("tabindex", "-1");
      itemContainer.setAttribute("data-audio-press-ref", "none");
      const itemContainerHover = document.createElement("div");
      itemContainerHover.classList.add(
        "build-queue__item-container-hover",
        "absolute",
        "size-full",
        "pointer-events-auto",
        "opacity-0",
        "hover\\:opacity-100",
        "focus\\:opacity-100",
        "selected\\:opacity-100",
        "active\\:opacity-100"
      );
      const itemContainerTouch = document.createElement("div");
      itemContainerTouch.classList.add(
        "build-queue__item-container-touch",
        "absolute",
        "size-full",
        "pointer-events-auto",
        "opacity-0"
      );
      itemContainerTouch.classList.toggle("opacity-0", !ActionHandler.isTouchActive);
      const item = document.createElement("div");
      item.classList.add(
        "build-queue__item",
        "relative",
        "flex",
        "justify-center",
        "items-center",
        "m-1",
        "grow"
      );
      Databind.attribute(itemContainerOuter, "innerHTML", "item.name");
      Databind.attribute(itemContainerOuter, "data-tooltip-content", "item.name");
      Databind.attribute(itemContainerOuter, "item-type", "item.type");
      Databind.attribute(itemContainerOuter, "item-index", "item.index");
      Databind.attribute(itemContainer, "item-index", "item.index");
      Databind.attribute(itemContainer, "item-type", "item.type");
      itemContainerOuter.setAttribute("tabindex", "-1");
      itemContainerOuter.setAttribute("hover-only-trigger", "true");
      itemContainer.addEventListener("engine-input", this.itemEngineInputListener);
      itemContainer.addEventListener("focus", this.itemFocusListener);
      itemContainer.addEventListener("hover", this.itemFocusListener);
      itemContainer.addEventListener(ActionActivateEventName, this.itemActivateListener);
      const moveUpButton = document.createElement("fxs-activatable");
      moveUpButton.classList.add("build-queue__item-button--move-up", "size-6", "bg-contain", "absolute", "z-1");
      Databind.attribute(moveUpButton, "item-type", "item.type");
      Databind.attribute(moveUpButton, "item-index", "item.index");
      Databind.if(activeTitle, `{{item.index}} == 0`);
      {
        itemContainerOuter.appendChild(activeTitle);
      }
      Databind.if(queuedTitle, `{{item.index}} == 1`);
      {
        itemContainerOuter.appendChild(queuedTitle);
      }
      moveUpButton.addEventListener("action-activate", this.upButtonListener);
      moveUpButton.setAttribute("data-audio-group-ref", "audio-production-chooser");
      moveUpButton.setAttribute("data-audio-press-ref", "data-audio-move-press");
      moveUpButton.setAttribute("data-audio-activate-ref", "none");
      const moveUpIcon = document.createElement("div");
      moveUpIcon.classList.add("build-queue__item-button--move-up", "size-6", "bg-contain", "absolute", "z-1");
      Databind.if(moveUpButton, "{{item.index}} > 0");
      {
        itemContainerHover.appendChild(moveUpButton);
        itemContainerTouch.appendChild(moveUpIcon);
      }
      const primaryIcon = document.createElement("div");
      primaryIcon.classList.add(
        "build-queue__item-icon",
        "size-16",
        "bg-contain",
        "relative",
        "pointer-events-none"
      );
      Databind.classToggle(primaryIcon, "unit-icon", "{{item.isUnit}}");
      primaryIcon.setAttribute("data-bind-style-background-image-url", `{{item.icon}}`);
      item.appendChild(primaryIcon);
      const deleteButton = document.createElement("fxs-activatable");
      deleteButton.classList.add(
        "build-queue__close-button",
        "size-6",
        "absolute",
        "-right-2",
        "-top-2",
        "bg-contain"
      );
      Databind.attribute(deleteButton, "item-type", "item.type");
      Databind.attribute(deleteButton, "item-index", "item.index");
      Databind.classToggle(deleteButton, "hidden", "{{g_NavTray.isTrayRequired}}");
      deleteButton.addEventListener("action-activate", this.deleteButtonListener);
      const deleteButtonNavHelp = document.createElement("fxs-nav-help");
      deleteButtonNavHelp.classList.add("cancel");
      deleteButton.appendChild(deleteButtonNavHelp);
      const progressTurnsContainer = document.createElement("div");
      progressTurnsContainer.classList.add(
        "progress-turns-container",
        "relative",
        "flex",
        "flex-col",
        "grow",
        "justify-center",
        "items-center",
        "min-w-16",
        "m-1"
      );
      const progressBar = document.createElement("div");
      Databind.if(progressBar, `{{item.percentComplete}} > -1`);
      {
        progressBar.classList.add(
          "build-queue__item-progress-bar",
          "relative",
          "p-0\\.5",
          "flex",
          "flex-col-reverse",
          "h-10",
          "w-4"
        );
        const progressBarFill = document.createElement("div");
        progressBarFill.classList.add("build-queue__progress-bar-fill", "relative", "bg-contain", "w-3");
        Databind.style(progressBarFill, "height", "{{item.percentComplete}}+'%'");
        progressBar.appendChild(progressBarFill);
      }
      progressTurnsContainer.appendChild(progressBar);
      const turns = document.createElement("div");
      turns.classList.add("build-queue__turn", "relative", "bottom-0", "right-0", "flex", "items-center");
      const turnsClockIcon = document.createElement("div");
      turnsClockIcon.classList.add("build-queue__turn-icon", "size-8", "relative");
      turns.appendChild(turnsClockIcon);
      const turnLabel = document.createElement("div");
      turnLabel.classList.add("build-queue__turn-value", "relative", "text-base");
      turnLabel.setAttribute("data-bind-value", "{{item.turns}}");
      turns.appendChild(turnLabel);
      progressTurnsContainer.appendChild(turns);
      itemContainer.appendChild(itemContainerHover);
      itemContainer.appendChild(itemContainerTouch);
      itemContainer.appendChild(progressTurnsContainer);
      itemContainer.appendChild(item);
      itemContainer.appendChild(deleteButton);
      itemContainerOuter.appendChild(itemContainer);
      itemContainerDiv.appendChild(itemContainerOuter);
    }
    containerQueued.appendChild(itemContainerDiv);
  }
  onDetach() {
    this.Root.removeEventListener("focusin", this.focusInListener);
    const captureMode = true;
    this.Root.removeEventListener("focusout", this.focusOutListener, captureMode);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    window.removeEventListener(FocusCityViewEventName, this.onFocusCityViewEvent);
    super.onDetach();
  }
  onFocusCityViewEvent = (event) => {
    if (event.detail.destination != "left-queue") {
      return;
    }
    if (!BuildQueue.isEmpty && InterfaceMode.isInInterfaceMode("INTERFACEMODE_CITY_PRODUCTION")) {
      const vSlot = this.Root.querySelector(".build-queue__item-container");
      if (vSlot == null) {
        console.error("panel-build-queue: onFocusCityViewEvent(): Missing vSlot with '.fxs-vslot'");
        return;
      }
      FocusManager.setFocus(vSlot);
    }
  };
  onFocusIn() {
    if (!this.firstFocus) {
      return;
    }
    this.firstFocus = false;
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateAccept("LOC_UI_QUEUE_MOVE_UP");
    NavTray.addOrUpdateShellAction1("LOC_UI_QUEUE_DELETE_ITEM");
  }
  onFocusOut({ relatedTarget }) {
    if (relatedTarget instanceof Node && this.Root.contains(relatedTarget)) {
      return;
    }
    this.firstFocus = true;
    NavTray.clear();
  }
  onItemEngineInput(inputEvent) {
    if (inputEvent.detail.name == "accept" && inputEvent.detail.status == InputActionStatuses.START) {
      Audio.playSound("data-audio-move-press", "audio-production-chooser");
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "shell-action-1" || inputEvent.detail.name == "mousebutton-right") {
      this.requestDelete(inputEvent);
    } else if (inputEvent.detail.name == "keyboard-enter" || inputEvent.detail.name == "accept") {
      this.requestMoveUp(inputEvent);
    }
  }
  requestDelete(event) {
    const targetElement = event.target;
    if (targetElement instanceof HTMLElement) {
      const itemType = targetElement.getAttribute("item-type");
      const index = targetElement.getAttribute("item-index");
      const parsedIndex = parseInt(index ?? "0");
      if (itemType && index) {
        Audio.playSound("data-audio-dequeue-item", "audio-production-chooser");
        if (BuildQueue.items.length == 1) {
          window.dispatchEvent(new FocusCityViewEvent({ source: "right", destination: "left" }));
        } else {
          let newFocusElement;
          if (parsedIndex == BuildQueue.items.length - 1) {
            newFocusElement = this.Root.querySelector(
              `.build-queue__item-container[item-index="${parsedIndex - 1}"]`
            );
          } else {
            newFocusElement = this.Root.querySelector(
              `.build-queue__item-container[item-index="${parsedIndex}"]`
            );
          }
          if (newFocusElement) {
            FocusManager.setFocus(newFocusElement);
          } else {
            window.dispatchEvent(new FocusCityViewEvent({ source: "right", destination: "left" }));
          }
        }
        window.dispatchEvent(new RequestBuildQueueCancelItemEvent(index));
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }
  requestMoveUp(event) {
    const targetElement = event.target;
    if (targetElement instanceof HTMLElement) {
      const itemType = targetElement.getAttribute("item-type");
      const index = targetElement.getAttribute("item-index");
      if (itemType && index) {
        let moveIndex;
        if (index == "0") {
          moveIndex = parseInt(index) - 1;
          window.dispatchEvent(new RequestBuildQueueMoveItemLastEvent(index));
        } else {
          moveIndex = parseInt(index) - 1;
          window.dispatchEvent(new RequestBuildQueueMoveItemUpEvent(index));
        }
        const newFocusElement = this.Root.querySelector(
          `.build-queue__item-container[item-index="${moveIndex}"]`
        );
        if (newFocusElement) {
          FocusManager.setFocus(newFocusElement);
        }
        event.stopPropagation();
      }
    }
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH && navigationEvent.detail.status != InputActionStatuses.UPDATE) {
      return true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.LEFT:
        window.dispatchEvent(new FocusCityViewEvent({ source: "right", destination: "left" }));
        live = false;
        break;
    }
    return live;
  }
  onItemFocus(event) {
    const target = event.target;
    if (target == null) {
      console.error("panel-build-queue: onItemFocus(): Invalid event target. It should be an HTMLElement");
      return;
    }
    const itemIndexStr = target.getAttribute("item-index");
    if (itemIndexStr == null) {
      console.error("panel-build-queue: onItemFocus(): Invalid item-index attribute");
      return;
    }
  }
  onItemActivate(event) {
    const itemIndex = Number.parseInt(event.target.getAttribute("item-index") ?? "0");
    if (ActionHandler.isTouchActive && itemIndex > 0) {
      this.requestMoveUp(event);
    }
  }
  onActiveDeviceChange(_event) {
    this.updateItemsContainerHover();
  }
  updateItemsContainerHover() {
    this.Root.querySelectorAll(".build-queue__item-container-touch").forEach(
      (elem) => elem.classList.toggle("opacity-0", !ActionHandler.isTouchActive)
    );
  }
}
Controls.define("panel-build-queue", {
  createInstance: PanelBuildQueue,
  description: "Area for production build queue information.",
  styles: [styles]
});
//# sourceMappingURL=panel-build-queue.js.map
