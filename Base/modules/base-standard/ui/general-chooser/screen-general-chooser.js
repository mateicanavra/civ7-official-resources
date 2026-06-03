import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { InputEngineEventName } from '../../../core/ui/input/input-support.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import Panel from '../../../core/ui/panel-support.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import content from './screen-general-chooser.html.js';
import styles from './screen-general-chooser.scss.js';

class ScreenGeneralChooser extends Panel {
  defaultFocus = null;
  createCloseButton = true;
  closeButtonListener = () => this.close();
  entryListener = this.onActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.inputContext = InputContext.Dual;
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    if (this.createCloseButton) {
      const closebutton = document.createElement("fxs-close-button");
      closebutton.addEventListener("action-activate", this.closeButtonListener);
      this.Root.appendChild(closebutton);
    }
    const entryContainer = this.Root.querySelector(".gen-chooser-content");
    if (entryContainer) {
      this.defaultFocus = entryContainer;
      this.createEntries(entryContainer);
    }
    if (ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    if (this.defaultFocus != null) {
      FocusManager.get().setFocus(this.defaultFocus);
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onActivate(event) {
    if (event.target instanceof HTMLElement) {
      if (event.target.classList.contains("gen-chooser-item")) {
        this.entrySelected(event.target);
      }
    }
  }
  /**
   * Performs the boilerplate for each entry to work properly with the general chooser framework.
   * Each screen will need to add whatever attribute it wants to identify the entry when it's chosen.
   * @param {element} entry - The HTML element for the entry.
   */
  tagEntry(entry) {
    entry.addEventListener("action-activate", this.entryListener);
    entry.classList.add("gen-chooser-item");
    entry.setAttribute("tabindex", "-1");
  }
  /**
   * Creates the list of entries in the chooser list. Override this in your derived chooser.
   * @param {element} entryContainer - The HTML element that's the parent of all of the entries.
   */
  createEntries(entryContainer) {
    let i = 0;
    for (i = 0; i < 25; i++) {
      const newEntry = document.createElement("fxs-activatable");
      this.tagEntry(newEntry);
      newEntry.innerHTML = i.toString();
      entryContainer.appendChild(newEntry);
    }
  }
  /**
   * Called when the user chooses an item in the list.  Override this in your derived chooser.
   * @param {element} entryElement - The HTML element chosen.
   */
  entrySelected(_entryElement) {
  }
}
Controls.define("screen-general-chooser", {
  createInstance: ScreenGeneralChooser,
  description: "General Chooser screen.",
  classNames: ["screen-general-chooser"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});

export { ScreenGeneralChooser };
//# sourceMappingURL=screen-general-chooser.js.map
