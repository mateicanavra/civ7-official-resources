import FocusManager from '../input/focus-manager.js';
import { N as NavTray } from '../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../panel-support.chunk.js';
import { S as SystemMessageManager } from './system-message-manager.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../framework.chunk.js';
import '../input/action-handler.js';
import '../input/cursor.js';
import '../views/view-manager.chunk.js';
import '../input/input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../utilities/utilities-image.chunk.js';
import '../utilities/utilities-component-id.chunk.js';
import '../context-manager/context-manager.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';

class ScreenSystemManager extends Panel {
  constructor(root) {
    super(root);
    this.populateSystemMessageContent();
  }
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add("flex", "items-center", "justify-center", "absolute", "inset-0");
  }
  populateSystemMessageContent() {
    if (!SystemMessageManager.currentSystemMessage) {
      console.error("screen-tech-civic-complete: invalid currentTechCivicPopupData, closing!");
      return;
    }
    const frame = document.createElement("fxs-modal-frame");
    frame.classList.add("w-1\\/2");
    const header = document.createElement("fxs-header");
    header.setAttribute("title", SystemMessageManager.currentSystemMessage.systemMessageTitle);
    header.setAttribute("filigree-style", "h2");
    const body = document.createElement("p");
    body.classList.add("text-accent-1", "font-body", "text-lg", "leading-9", "mt-3\\.5", "mb-5");
    body.textContent = SystemMessageManager.currentSystemMessage.systemMessageContent;
    const buttonContainer = document.createElement("fxs-hslot");
    buttonContainer.classList.add("justify-center");
    frame.append(header, body, buttonContainer);
    SystemMessageManager.currentSystemMessage.buttonData.forEach((buttonData, index) => {
      const button = document.createElement("fxs-button");
      button.setAttribute("caption", buttonData.caption);
      button.addEventListener("action-activate", buttonData.callback);
      buttonContainer.appendChild(button);
      if (index === 0) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            FocusManager.setFocus(button);
          });
        });
      } else {
        button.classList.add("ml-12");
      }
    });
    this.Root.appendChild(frame);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericSelect();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
}
Controls.define("screen-system-message", {
  createInstance: ScreenSystemManager,
  description: "Screen for displaying info for important system messages.",
  attributes: []
});
//# sourceMappingURL=screen-system-message.js.map
