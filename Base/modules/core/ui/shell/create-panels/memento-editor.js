import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import { F as FxsActivatable } from '../../components/fxs-activatable.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { CreateGameModel } from './create-game-model.js';
import { a as getMementoData } from './leader-select-model.chunk.js';
import { D as Databind } from '../../utilities/utilities-core-databinding.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../utilities/utilities-dom.chunk.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';
import './age-civ-select-model.chunk.js';
import '../live-event-logic/live-event-logic.chunk.js';
import '../../utilities/utilities-data.chunk.js';

const styles = "fs://game/core/ui/shell/create-panels/memento-editor.css";

class Memento extends FxsActivatable {
  _mementoData;
  iconEle = document.createElement("div");
  focusRing = document.createElement("div");
  selectionRing = document.createElement("div");
  _selected = false;
  set mementoData(value) {
    this._mementoData = value;
    this.updateData();
  }
  get mementoData() {
    return this._mementoData;
  }
  set selected(value) {
    this._selected = value;
    this.selectionRing.classList.toggle("img-circle-selected", value);
  }
  get selected() {
    return this._selected;
  }
  constructor(root) {
    super(root);
    this.Root.classList.add("w-19", "h-19", "m-1\\.25", "relative", "group");
    this.iconEle.classList.add("absolute", "bg-cover", "inset-1");
    this.Root.appendChild(this.iconEle);
    this.selectionRing.classList.add("absolute", "-inset-1");
    this.Root.appendChild(this.selectionRing);
    this.focusRing.classList.add(
      "absolute",
      "inset-1",
      "memento-circle-focus",
      "opacity-0",
      "group-focus\\:opacity-100",
      "group-hover\\:opacity-100",
      "group-pressed\\:opacity-100"
    );
    this.Root.appendChild(this.focusRing);
    this.Root.setAttribute("data-audio-group-ref", "memento-item");
    this.Root.setAttribute("data-audio-activate-ref", "data-audio-memento-selected");
  }
  setHidden(isHidden) {
    this.Root.classList.toggle("hidden", isHidden);
  }
  setAvailable(isAvailable) {
    this.Root.classList.toggle("opacity-50", !isAvailable);
    this.shouldPlayErrorSound = !isAvailable;
  }
  updateData() {
    if (this._mementoData) {
      if (this._mementoData.mementoIcon) {
        this.iconEle.style.backgroundImage = `url("fs://game/${this._mementoData.mementoIcon}")`;
      } else {
        this.iconEle.style.backgroundImage = `url("fs://game/mem_min_leader.png")`;
      }
      const name = Locale.stylize(this._mementoData.mementoName);
      const desc = Locale.compose(this._mementoData.functionalTextDesc);
      const flavor = Locale.stylize(this._mementoData.flavorTextDesc);
      const unlock = Locale.stylize(this._mementoData.unlockReason);
      if (this._mementoData.displayType == DisplayType.DISPLAY_LOCKED) {
        this.Root.setAttribute(
          "data-tooltip-content",
          `[n][style:font-title-lg]${name}[/style][n][style:font-body-base]${desc}[/style][n][style:font-body-sm]${flavor}[/style][n][style:font-body-sm]${unlock}[/style]`
        );
      } else if (this._mementoData.displayType == DisplayType.DISPLAY_UNLOCKED) {
        this.Root.setAttribute(
          "data-tooltip-content",
          `[n][style:font-title-lg]${name}[/style][n][style:font-body-base]${desc}[/style][n][style:font-body-sm]${flavor}[/style]`
        );
      } else {
      }
    }
  }
}
Controls.define("memento-item", {
  createInstance: Memento,
  description: "A selectable mementos",
  tabIndex: -1
});
class MementoEditor extends Panel {
  isMobileExperience = UI.getViewExperience() == UIViewExperience.Mobile;
  outerSlot;
  headerText = document.createElement("fxs-header");
  mementoSlotEles = [];
  activeSlot;
  mementosData;
  mementoEles = [];
  confirmButton = document.createElement("fxs-button");
  cancelButton = document.createElement("fxs-button");
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  constructor(root) {
    super(root);
    this.mementosData = Online.Metaprogression.getMementosData();
    this.sortMementos();
    this.Root.classList.add("absolute", "fullscreen", "flex", "flex-col", "justify-center", "items-center");
    const fragment = document.createDocumentFragment();
    const outerFrame = document.createElement(this.isMobileExperience ? "fxs-modal-frame" : "fxs-frame");
    outerFrame.setAttribute("frame-style", this.isMobileExperience ? "" : "f2");
    outerFrame.setAttribute("data-content-class", "items-center");
    outerFrame.classList.add("memento-editor-frame", "w-200", "my-16", "flex-auto");
    fragment.appendChild(outerFrame);
    this.outerSlot = document.createElement("fxs-vslot");
    this.outerSlot.classList.add("items-center", "h-full");
    outerFrame.appendChild(this.outerSlot);
    this.headerText.classList.add("uppercase", "font-title-xl", "leading-loose", "-mt-5", "mb-5");
    this.headerText.setAttribute("filigree-style", "h2");
    this.outerSlot.appendChild(this.headerText);
    const mementoSlotsContainer = document.createElement("fxs-hslot");
    mementoSlotsContainer.classList.add("flex", "flex-row", "items-start");
    this.outerSlot.appendChild(mementoSlotsContainer);
    const leftNav = document.createElement("fxs-nav-help");
    leftNav.classList.add("self-center");
    leftNav.setAttribute("action-key", "inline-cycle-prev");
    mementoSlotsContainer.appendChild(leftNav);
    let allSlotsAreLocked = true;
    for (const mementoSlotData of getMementoData()) {
      const mementoSlot = document.createElement("memento-slot");
      mementoSlot.whenComponentCreated((component) => {
        component.slotData = mementoSlotData;
      });
      mementoSlot.addEventListener("action-activate", this.handleSlotSelected.bind(this, mementoSlot));
      mementoSlot.addEventListener("focus", this.handleSlotSelected.bind(this, mementoSlot));
      this.mementoSlotEles.push(mementoSlot);
      mementoSlotsContainer.appendChild(mementoSlot);
      if (!mementoSlotData.isLocked) {
        allSlotsAreLocked = false;
      }
    }
    const rightNav = document.createElement("fxs-nav-help");
    rightNav.setAttribute("action-key", "inline-cycle-next");
    rightNav.classList.add("self-center");
    mementoSlotsContainer.appendChild(rightNav);
    if (allSlotsAreLocked) {
      mementoSlotsContainer.removeChild(leftNav);
      mementoSlotsContainer.removeChild(rightNav);
    }
    const dividerFiligree = document.createElement("div");
    dividerFiligree.classList.add("memento-shell-line-divider", "h-2", "my-4");
    this.outerSlot.appendChild(dividerFiligree);
    const innerFrame = document.createElement("fxs-inner-frame");
    innerFrame.setAttribute("data-content-class", "items-center");
    innerFrame.classList.add("w-174", "flex-auto", "relative");
    this.outerSlot.appendChild(innerFrame);
    const middleDecor = document.createElement("div");
    middleDecor.classList.add("absolute", "-top-1\\.5", "img-popup-middle-decor");
    innerFrame.appendChild(middleDecor);
    const scrollbar = document.createElement("fxs-scrollable");
    scrollbar.classList.add("memento-editor-scrollable", "ml-6", "mr-4", "absolute", "inset-0");
    innerFrame.appendChild(scrollbar);
    const mementosContainer = document.createElement("fxs-spatial-slot");
    mementosContainer.classList.add("flex", "flex-row", "flex-wrap");
    scrollbar.appendChild(mementosContainer);
    for (const mementoData of this.mementosData) {
      const memento = document.createElement("memento-item");
      memento.whenComponentCreated((component) => {
        component.mementoData = mementoData;
      });
      memento.addEventListener("action-activate", this.handleMementoSelected.bind(this, memento));
      this.mementoEles.push(memento);
      mementosContainer.appendChild(memento);
    }
    const bottomControls = document.createElement("div");
    bottomControls.classList.add("flex", "flex-row", "mt-6");
    this.outerSlot.appendChild(bottomControls);
    this.confirmButton.classList.add("mx-4", "min-w-100");
    this.confirmButton.setAttribute("caption", "LOC_EDIT_MEMENTOS_CONFIRM");
    this.confirmButton.addEventListener("action-activate", this.confirmSelections.bind(this));
    Databind.classToggle(this.confirmButton, "hidden", "{{g_NavTray.isTrayRequired}}");
    bottomControls.appendChild(this.confirmButton);
    this.cancelButton.classList.add("mx-4", "min-w-100");
    this.cancelButton.setAttribute("caption", "LOC_EDIT_MEMENTOS_CANCEL");
    this.cancelButton.setAttribute("action-key", "inline-cancel");
    this.cancelButton.addEventListener("action-activate", this.cancelSelections.bind(this));
    Databind.classToggle(this.cancelButton, "hidden", "{{g_NavTray.isTrayRequired}}");
    bottomControls.appendChild(this.cancelButton);
    this.Root.appendChild(fragment);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "memento-editor");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const leaderName = CreateGameModel.selectedLeader?.name ?? "";
    this.headerText.setAttribute("title", Locale.stylize("LOC_EDIT_MEMENTOS_TITLE", leaderName));
    const closeButton = document.createElement("fxs-close-button");
    closeButton.classList.add("top-1", "right-1");
    closeButton.addEventListener("action-activate", () => {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      this.close();
    });
    waitForLayout(() => {
      this.filterMementos();
      this.applySelections();
    });
    if (UI.getViewExperience() != UIViewExperience.Mobile) {
      this.outerSlot.appendChild(closeButton);
    }
  }
  onDetach() {
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateShellAction1("LOC_EDIT_MEMENTOS_CONFIRM");
    this.handleSlotSelected(this.mementoSlotEles[0]);
    FocusManager.setFocus(this.mementoEles[0]);
  }
  setPanelOptions(_panelOptions) {
    waitForLayout(() => {
      const slotIndex = _panelOptions.slotIndex;
      if (slotIndex > 0 && slotIndex < this.mementoSlotEles.length) {
        this.handleSlotSelected(this.mementoSlotEles[slotIndex]);
      }
    });
  }
  sortMementos() {
    this.mementosData.sort((a, b) => a.displayType - b.displayType);
  }
  applySelections() {
    for (const slot of this.mementoSlotEles) {
      const slotMemento = slot.component.slotData?.currentMemento.value;
      if (slotMemento) {
        const matchingMemento = this.mementoEles.find(
          (e) => e.component.mementoData?.mementoTypeId == slotMemento
        );
        if (matchingMemento) {
          matchingMemento.component.selected = true;
        }
      }
    }
  }
  selectNextSlot() {
    this.selectSlotOffset(1);
  }
  selectPreviousSlot() {
    this.selectSlotOffset(-1);
  }
  selectSlotOffset(offset) {
    if (this.activeSlot) {
      const offsetIndex = this.mementoSlotEles.indexOf(this.activeSlot) + offset;
      if (offsetIndex >= 0 && offset <= this.mementoSlotEles.length - 1) {
        this.handleSlotSelected(this.mementoSlotEles[offsetIndex]);
      }
    }
  }
  handleSlotSelected(slot) {
    if (slot.component.slotData?.isLocked || slot == this.activeSlot) {
      return;
    }
    if (this.activeSlot) {
      this.activeSlot.component.selected = false;
    }
    this.activeSlot = slot;
    this.activeSlot.component.selected = true;
    this.filterMementos();
  }
  handleMementoSelected(memento) {
    if (memento.component.selected) {
      memento.component.selected = false;
      const mementoSlot = this.mementoSlotEles.find(
        (s) => s.component.slotData?.currentMemento.value == memento.component.mementoData?.mementoTypeId
      );
      mementoSlot?.component.setActiveMemento("NONE");
      if (mementoSlot?.component.selected) {
        return;
      }
    }
    const mementoData = memento.maybeComponent?.mementoData;
    const selectedSlot = this.activeSlot?.maybeComponent;
    if (mementoData && selectedSlot) {
      const oldMemento = this.mementoEles.find(
        (m) => m.component.mementoData?.mementoTypeId === selectedSlot.slotData?.currentMemento.value
      );
      if (selectedSlot.setActiveMemento(mementoData.mementoTypeId)) {
        if (oldMemento) {
          oldMemento.component.selected = false;
        }
        memento.component.selected = true;
      }
    }
  }
  filterMementos() {
    const activeSlotData = this.activeSlot?.maybeComponent?.slotData;
    const availableMementos = /* @__PURE__ */ new Set();
    if (activeSlotData) {
      for (const memento of activeSlotData.availableMementos) {
        if (memento.value) {
          availableMementos.add(memento.value);
        }
      }
    }
    for (const memento of this.mementoEles) {
      const mementoComponent = memento.maybeComponent;
      const memData = mementoComponent?.mementoData;
      const isHidden = memData?.displayType == DisplayType.DISPLAY_HIDDEN;
      mementoComponent?.setHidden(isHidden);
      mementoComponent?.setAvailable(
        memData?.displayType == DisplayType.DISPLAY_UNLOCKED && availableMementos.has(memData?.mementoTypeId ?? "")
      );
    }
  }
  confirmSelections() {
    for (const slot of this.mementoSlotEles) {
      const gameParameter = slot.component.slotData.gameParameter;
      const selectedMemento = slot.component.slotData.currentMemento;
      GameSetup.setPlayerParameterValue(GameContext.localPlayerID, gameParameter, selectedMemento.value);
    }
    ContextManager.pop(this.Root.tagName);
  }
  cancelSelections() {
    ContextManager.pop(this.Root.tagName);
  }
  onNavigateInput(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const direction = navigationEvent.getDirection();
    if (direction == InputNavigationAction.PREVIOUS) {
      this.selectPreviousSlot();
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
      Audio.playSound("data-audio-press", "memento-slot");
    } else if (direction == InputNavigationAction.NEXT && !CreateGameModel.nextActionStartsGame) {
      this.selectNextSlot();
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
      Audio.playSound("data-audio-press", "memento-slot");
    }
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (event.detail.name) {
      case "cancel":
      case "keyboard-escape":
        this.cancelSelections();
        event.preventDefault();
        event.stopPropagation();
        break;
      case "shell-action-1":
        this.confirmSelections();
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }
}
Controls.define("memento-editor", {
  createInstance: MementoEditor,
  description: "Allows selection of mementos",
  styles: [styles]
});

export { Memento, MementoEditor };
//# sourceMappingURL=memento-editor.js.map
