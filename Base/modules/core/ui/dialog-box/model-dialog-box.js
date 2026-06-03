import { DisplayHandlerBase } from '../context-manager/display-handler.js';
import { DisplayQueueManager } from '../context-manager/display-queue-manager.js';
import { Framework } from '../framework.js';

var DialogBoxAction = /* @__PURE__ */ ((DialogBoxAction2) => {
  DialogBoxAction2[DialogBoxAction2["Invalid"] = -1] = "Invalid";
  DialogBoxAction2[DialogBoxAction2["Error"] = 0] = "Error";
  DialogBoxAction2[DialogBoxAction2["Confirm"] = 1] = "Confirm";
  DialogBoxAction2[DialogBoxAction2["Cancel"] = 2] = "Cancel";
  DialogBoxAction2[DialogBoxAction2["Close"] = 3] = "Close";
  return DialogBoxAction2;
})(DialogBoxAction || {});
var DialogSource = /* @__PURE__ */ ((DialogSource2) => {
  DialogSource2["Game"] = "Game";
  DialogSource2["Shell"] = "Shell";
  return DialogSource2;
})(DialogSource || {});
class DialogBoxDisplayHandler extends DisplayHandlerBase {
  constructor(source, priority, isInactive) {
    super(`${source}DialogBox`, priority);
    this.source = source;
    this.isInactive = isInactive;
  }
  inactiveRequests = [];
  isInactive;
  addDisplayRequest(dialogData) {
    if (this.isInactive) {
      const request = Object.assign({ category: this.getCategory() }, dialogData);
      this.inactiveRequests.push(request);
      return request;
    } else {
      return super.addDisplayRequest(dialogData, this.source == "Shell" /* Shell */);
    }
  }
  show(request) {
    const dilaogBoxRoot = Framework.ContextManager.push("screen-dialog-box", {
      singleton: true,
      createMouseGuard: true,
      attributes: request.data
    });
    dilaogBoxRoot.whenComponentCreated((component) => {
      component.setDialogId(request.id);
      component.setOptions(request.data, request.options ?? [], request.customOptions ?? []);
    });
  }
  hide(_request, _options) {
    const dialog = Framework.ContextManager.getTarget("screen-dialog-box");
    if (dialog) {
      dialog.maybeComponent?.close();
    }
  }
  setInactive() {
    this.isInactive = true;
    this.inactiveRequests = DisplayQueueManager.closeMatching(this.getCategory());
  }
  clear() {
    DisplayQueueManager.closeMatching(this.getCategory());
  }
  setActive() {
    this.isInactive = false;
    for (const request of this.inactiveRequests) {
      DisplayQueueManager.add(request);
    }
    this.inactiveRequests.length = 0;
  }
  // Allow dialog boxes to have their priorities be set by other display handlers
  setRequestIdAndPriority(request) {
    request.addToFront = request.data.addToFront;
    const targetQueue = request.data.displayQueue ?? request.category;
    if (targetQueue !== this.getCategory()) {
      const handler = DisplayQueueManager.getHandler(request.data.displayQueue ?? this.getCategory());
      handler?.setRequestIdAndPriority(request);
    } else {
      super.setRequestIdAndPriority(request);
    }
  }
}
class DialogBoxModelImpl {
  source = "Game" /* Game */;
  _shellHandler = new DialogBoxDisplayHandler("Shell" /* Shell */, 1e3, true);
  _gameHandler = new DialogBoxDisplayHandler("Game" /* Game */, 2e3, false);
  get isDialogBoxOpen() {
    return DisplayQueueManager.activeDisplays.some((p) => p.category.includes("DialogBox"));
  }
  get activeHandler() {
    return this.getHandler(this.source);
  }
  get inactiveHandler() {
    return this.source === "Game" /* Game */ ? this._shellHandler : this._gameHandler;
  }
  get shellHandler() {
    return this._shellHandler;
  }
  get gameHandler() {
    return this._gameHandler;
  }
  getHandler(source) {
    return source === "Game" /* Game */ ? this._gameHandler : this._shellHandler;
  }
  clear() {
    this.activeHandler.clear();
  }
  showDialogBox(definition, options, customOptions) {
    return this.getHandler(definition.source ?? this.source).addDisplayRequest({
      data: definition,
      options,
      customOptions,
      id: definition.id
    });
  }
  /**
   * Close (if already displayed) or cancel (from the pending list) the dialog box which the DialogBoxID is given.
   * @param dialogBoxID The id of the dialog box to close
   */
  closeDialogBox(dialogBoxID) {
    if (dialogBoxID === void 0) {
      Framework.ContextManager.pop("screen-dialog-box");
    } else {
      const removed = DisplayQueueManager.closeMatching(dialogBoxID);
      if (removed.length == 0) {
        console.warn(
          "model-dialog-box: closeDialogBox(): The given dialog box ID (" + dialogBoxID + ") is neither the currently displayed one nor one of the pending dialog boxes!"
        );
      }
    }
  }
  setSource(source) {
    this.source = source;
    this.activeHandler.setActive();
    this.inactiveHandler.setInactive();
  }
}
const DialogBoxModel = new DialogBoxModelImpl();
DisplayQueueManager.registerHandler(DialogBoxModel.shellHandler);
DisplayQueueManager.registerHandler(DialogBoxModel.gameHandler);

export { DialogBoxAction, DialogBoxDisplayHandler, DialogBoxModel, DialogBoxModelImpl, DialogSource, DialogBoxModel as default };
//# sourceMappingURL=model-dialog-box.js.map
