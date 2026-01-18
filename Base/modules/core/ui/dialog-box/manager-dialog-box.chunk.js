import { DisplayQueueManager, DisplayHideReason } from '../context-manager/display-queue-manager.js';
import { F as Framework, b as setDialogManager } from '../framework.chunk.js';

let currentDisplayRequestId = 1;
function displayRequestUniqueId() {
  return currentDisplayRequestId++;
}
class DisplayHandlerBase {
  /**
   *
   * @param _category The category of this display handlers
   * @param defaultPriority The priority of this display handler
   */
  constructor(_category, defaultPriority) {
    this._category = _category;
    if (UI.isInGame()) {
      const dbPriority = GameInfo.DisplayQueuePriorities.find((entry) => entry.Category === _category);
      this.updateHandlerPriority(dbPriority ? dbPriority.Priority : defaultPriority);
    } else {
      this.updateHandlerPriority(defaultPriority);
    }
  }
  _frontSubcategoryPriority = 0;
  _backSubcategoryPriority = 0;
  _categoryPriority = 0;
  /**
   * Updates the category priority of this handler
   * Note: Existing display requests will not have their priorities updated
   * @param priority The new priority
   */
  updateHandlerPriority(priority) {
    this._categoryPriority = priority;
  }
  /**
   * The category the display handler gets registered as
   */
  getCategory() {
    return this._category;
  }
  /**
   * Sets priority and id for a given request, whenever a request is added to the queue.
   * May be called by other handlers to position elements nearby in the queue
   * @param request The request to set id and priority on
   */
  setRequestIdAndPriority(request) {
    request.id ??= displayRequestUniqueId();
    if (!request.priority) {
      request.priority = this._categoryPriority;
    }
    if (!request.subpriority) {
      if (request.addToFront) {
        request.subpriority = --this._frontSubcategoryPriority;
      } else {
        request.subpriority = ++this._backSubcategoryPriority;
      }
    }
  }
  /**
   * Can the given request be shown?
   * @param _request The request to check
   * @param _activeRequests The currently displayed requests
   * @returns
   */
  canShow(_request, activeRequests) {
    return activeRequests.length == 0;
  }
  /**
   * Can the given request be closed?
   * @param _request The request to check
   * @param _activeRequests The currently displayed requests
   * @returns
   */
  canHide(_request, _activeRequests) {
    return true;
  }
  /**
   * Generates a new display request and adds it to the Display Queue
   * @param requestInfo The information used to generate the request
   * @returns The created request
   */
  addDisplayRequest(requestInfo = { addToFront: false }, forceShow = false) {
    const request = Object.assign(
      { category: this.getCategory(), forceShow },
      requestInfo
    );
    DisplayQueueManager.add(request);
    return request;
  }
}

const displayHandler = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	DisplayHandlerBase,
	DisplayHideReason,
	displayRequestUniqueId
}, Symbol.toStringTag, { value: 'Module' }));

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

class DialogBoxManagerImpl {
  /**
   * Helper function for creating simple boolean choice dialog, where the payload is constructed for you.
   * The Cancel option has no callback
   */
  createDialog_ConfirmCancel(params) {
    const confirmOption = {
      actions: ["accept"],
      label: "LOC_GENERIC_OK",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const cancelCallback = () => {
      if (params.callback) {
        params.callback(DialogBoxAction.Cancel);
      }
    };
    const cancelOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_GENERIC_CANCEL",
      callback: cancelCallback
    };
    const options = [confirmOption, cancelOption];
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose: params.canClose,
      extensions: params.extensions,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating simple confirmation dialog, where the payload is constructed for you.
   */
  createDialog_Confirm(params) {
    const confirmOption = {
      actions: ["accept"],
      label: "LOC_GENERIC_OK",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const options = [confirmOption];
    const canClose = params.canClose != void 0 ? params.canClose : false;
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose,
      extensions: params.extensions,
      displayHourGlass: params.displayHourGlass,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating simple cancel dialog, where the payload is constructed for you.
   */
  createDialog_Cancel(params) {
    const cancelOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_GENERIC_CANCEL",
      callback: params.callback,
      valueCallback: params.valueCallback
    };
    const options = [cancelOption];
    const canClose = params.canClose != void 0 ? params.canClose : false;
    return this.createDialog_MultiOption({
      body: params.body,
      title: params.title,
      shouldDarken: params.shouldDarken,
      options,
      canClose,
      extensions: params.extensions,
      displayHourGlass: params.displayHourGlass,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      dialogId: params.dialogId
    });
  }
  /**
   * Helper function for creating a multi-option dialog with user-defined payloads for each option.
   */
  createDialog_MultiOption(params) {
    const data = {
      id: params.dialogId,
      title: params.title ?? "",
      body: params.body ?? "",
      canClose: params.canClose ?? false,
      shouldDarken: params.shouldDarken ?? true,
      extensions: void 0,
      displayHourGlass: params.displayHourGlass,
      source: params.dialogSource,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      layout: params.layout
    };
    if (params.extensions) {
      data.extensions = JSON.stringify(params.extensions);
    }
    return DialogBoxModel.showDialogBox(data, params.options).id;
  }
  /**
   * Helper function for creation a custom option dialog with user-defined payloads for each option
   */
  createDialog_CustomOptions(params) {
    const data = {
      title: params.title ?? "",
      body: params.body ?? "",
      canClose: params.canClose ?? false,
      shouldDarken: params.shouldDarken ?? true,
      extensions: void 0,
      displayHourGlass: params.displayHourGlass,
      source: params.dialogSource,
      displayQueue: params.displayQueue,
      addToFront: params.addToFront,
      custom: params.custom ?? false,
      styles: params.styles ?? false,
      name: params.name
    };
    if (params.extensions) {
      data.extensions = JSON.stringify(params.extensions);
    }
    return DialogBoxModel.showDialogBox(data, params.options, params.customOptions).id;
  }
  /**
   * Clear all dialog box in the queue
   */
  clear() {
    DialogBoxModel.clear();
  }
  get isDialogBoxOpen() {
    return DialogBoxModel.isDialogBoxOpen;
  }
  closeDialogBox(dialogBoxID) {
    DialogBoxModel.closeDialogBox(dialogBoxID);
  }
  setSource(source) {
    DialogBoxModel.setSource(source);
  }
}
const DialogBoxManager = new DialogBoxManagerImpl();
setDialogManager(DialogBoxManager);

const managerDialogBox = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	DialogBoxAction,
	DialogBoxManager,
	DialogSource,
	default: DialogBoxManager
}, Symbol.toStringTag, { value: 'Module' }));

export { DialogBoxAction as D, DialogBoxManager as a, DisplayHandlerBase as b, DialogSource as c, displayRequestUniqueId as d, displayHandler as e, managerDialogBox as m };
//# sourceMappingURL=manager-dialog-box.chunk.js.map
