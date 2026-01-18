import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame>\r\n\t<div class=\"primary-window\">\r\n\t\t<fxs-scrollable>\r\n\t\t\t<fxs-vslot class=\"gen-chooser-content\"> </fxs-vslot>\r\n\t\t</fxs-scrollable>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/general-chooser/screen-general-chooser.css";

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
      FocusManager.setFocus(this.defaultFocus);
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
