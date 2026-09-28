import { OrderedMinHeap } from '../utilities/ordered-min-heap.js';

const LoadingStartCurtainRemoveName = "loading-start-curtain-removed";
var DisplayHideReason = /* @__PURE__ */ ((DisplayHideReason2) => {
  DisplayHideReason2[DisplayHideReason2["Close"] = 0] = "Close";
  DisplayHideReason2[DisplayHideReason2["Reshuffle"] = 1] = "Reshuffle";
  DisplayHideReason2[DisplayHideReason2["Suspend"] = 2] = "Suspend";
  return DisplayHideReason2;
})(DisplayHideReason || {});
const DEFAULT_DEBOUNCE_STALL = 20;
const MAX_DEBOUNCE_STALL = 30;
function requestLessThan(item1, item2) {
  return item1.priority === item2.priority ? (item1.subpriority ?? 0) < (item2.subpriority ?? 0) : (item1.priority ?? 0) < (item2.priority ?? 0);
}
class DisplayQueueManagerImpl {
  updatePending = false;
  _isSuspended = false;
  debounceStallLeft = 0;
  curDebounceStall = 0;
  registeredHandlers = /* @__PURE__ */ new Map();
  activeRequests = [];
  suspendedRequests = [];
  queue = new OrderedMinHeap(requestLessThan);
  loadingStartCurtainRemoveListener = () => {
    this.onLoadingStartCurtainRemove();
  };
  /**
   * Gets the topmost active display request
   */
  get topDisplay() {
    return this.activeRequests.length > 0 ? this.activeRequests[this.activeRequests.length - 1] : void 0;
  }
  /**
   * Gets all active displays
   */
  get activeDisplays() {
    return this.activeRequests;
  }
  /**
   * Constructs a new DisplayQueueManagerImpl
   */
  constructor() {
    if (UI.isInGame() || UI.isInLoading()) {
      window.addEventListener(LoadingStartCurtainRemoveName, this.loadingStartCurtainRemoveListener, {
        once: true
      });
    } else {
      engine.on("UpdateFrame", this.update, this);
    }
  }
  /**
   * Now safe to start processing the display queue, as the loading curtain has been removed.
   * Doing it before now has shown that it is possible for a popup to appear and immediately
   * be removed by the hardnesss change by the view manager.
   */
  onLoadingStartCurtainRemove() {
    engine.on("UpdateFrame", this.update, this);
  }
  /**
   * Registers a display request handler with the queue
   * @param handler The handler to register
   */
  registerHandler(handler) {
    this.registeredHandlers.set(handler.getCategory(), handler);
  }
  /**
   * Gets a handler registered with the queue
   * @param queueCategory The category of the handler
   * @returns The found handler or undefined if none was found
   */
  getHandler(queueCategory) {
    return this.registeredHandlers.get(queueCategory);
  }
  /**
   * Adds a display request to the queue
   * @param request The display request to add
   */
  add(request) {
    this.debounceStallLeft = DEFAULT_DEBOUNCE_STALL;
    const requestHandler = this.registeredHandlers.get(request.category);
    if (requestHandler) {
      requestHandler.setRequestIdAndPriority(request);
      if (this._isSuspended && !request.forceShow) {
        this.suspendedRequests.push(request);
      } else {
        if (!this.queue.contains((queueItem) => queueItem.id == request.id)) {
          this.queue.insert(request);
          this.updatePending = true;
        }
      }
    }
  }
  /**
   * Removes a display request from active, pending, or suspended requeusts
   * @param request The request to remove. If none is specified, the topmost request will be removed.
   * @returns True if the display request was sucessfully removed
   */
  close(request) {
    if (!request && this.activeRequests.length > 0) {
      request = this.topDisplay;
    }
    if (!request) {
      console.error(`Display Queue Manager - Attempting to close display when none exists!`);
      return false;
    }
    const requestHandler = this.registeredHandlers.get(request.category);
    if (!requestHandler) {
      console.error(
        `Display Queue Manager - Attempting to close display with an invalid category - ${request.category}!`
      );
      return false;
    }
    const foundIndex = this.activeRequests.indexOf(request);
    if (foundIndex >= 0) {
      if (requestHandler.canHide(request, this.activeRequests)) {
        this.activeRequests.splice(foundIndex, 1);
        requestHandler.hide(request, { reason: 0 /* Close */ });
      } else {
        return false;
      }
    } else {
      if (!this.queue.remove(request)) {
        const suspendIndex = this.suspendedRequests.indexOf(request);
        if (suspendIndex >= 0) {
          this.suspendedRequests.splice(suspendIndex, 1);
        } else {
          console.error(
            `Display Queue Manager - Attempting to close display which was not in queue - ${request.category}!`
          );
        }
      } else {
        requestHandler.hide(request, { reason: 0 /* Close */ });
      }
    }
    this.updatePending = true;
    return true;
  }
  /**
   * Removes matching active, pending and suspended display requests for a given criteria
   * @param criteria A category, request id, or selector function to match items
   * @returns A list of displays that were hidden
   */
  closeMatching(criteria) {
    const resolvedCriteria = this.resolveCriteria(criteria);
    const removed = this.queue.removeAll(resolvedCriteria);
    removed.push(...this.closeActive(resolvedCriteria));
    removed.push(...this.suspendedRequests.filter(resolvedCriteria));
    this.suspendedRequests = this.suspendedRequests.filter((r) => !resolvedCriteria(r));
    if (removed.length > 0) {
      this.updatePending = true;
    }
    return removed;
  }
  /**
   * Removes matching active requests for a given criteria
   * @param criteria A category, request id, or selector function to match items
   * @returns A list of display requests that were removed
   */
  closeActive(criteria) {
    const removed = [];
    const resolvedCriteria = this.resolveCriteria(criteria);
    for (let i = this.activeRequests.length - 1; i >= 0; --i) {
      const activeRequest = this.activeRequests[i];
      const requestHandler = this.registeredHandlers.get(activeRequest.category);
      if (resolvedCriteria(activeRequest) && requestHandler?.canHide(activeRequest, this.activeRequests)) {
        removed.push(activeRequest);
        this.activeRequests.splice(i, 1);
        requestHandler.hide(activeRequest, { reason: 0 /* Close */ });
      }
    }
    if (removed.length > 0) {
      this.updatePending = true;
    }
    return removed;
  }
  /**
   * Removes the topmost active request for a given criteria
   * @param criteria A category, request id, or selector function to match items
   * @returns True if an active request was removed and false otherwise
   */
  closeTopmost(criteria) {
    const resolvedCriteria = this.resolveCriteria(criteria);
    for (let i = this.activeRequests.length - 1; i >= 0; --i) {
      const activeRequest = this.activeRequests[i];
      const requestHandler = this.registeredHandlers.get(activeRequest.category);
      if (resolvedCriteria(activeRequest) && requestHandler?.canHide(activeRequest, this.activeRequests)) {
        this.activeRequests.splice(i, 1);
        requestHandler.hide(activeRequest, { reason: 0 /* Close */ });
        this.updatePending = true;
        return true;
      }
    }
    return false;
  }
  /**
   * Finds matching active requests for a given criteria
   * @param criteria A category, request id, or selector function to match items
   * @returns A list of found display requests
   */
  findAll(criteria) {
    const resolvedCriteria = this.resolveCriteria(criteria);
    const found = this.queue.findAll(resolvedCriteria);
    for (const activeRequest of this.activeRequests) {
      if (resolvedCriteria(activeRequest)) {
        found.push(activeRequest);
      }
    }
    return found;
  }
  isSuspended() {
    return this._isSuspended;
  }
  /**
   * Hides all active displays, and prevents new displays from being displayed
   * @returns True if all displays were suspended
   */
  suspend() {
    if (this._isSuspended) {
      return;
    }
    this._isSuspended = true;
    for (let i = this.activeRequests.length - 1; i >= 0; --i) {
      const activeRequest = this.activeRequests[i];
      if (this.trySuspend(activeRequest)) {
        this.suspendedRequests.push(activeRequest);
        this.activeRequests.splice(i, 1);
        this.updatePending = true;
      }
    }
    const stillVisibleRequests = [];
    while (!this.queue.isEmpty()) {
      const request = this.queue.pop();
      const targetQueue = request.forceShow ? stillVisibleRequests : this.suspendedRequests;
      targetQueue.push(request);
      this.updatePending = true;
    }
    for (const request of stillVisibleRequests) {
      this.queue.insert(request);
    }
  }
  resolveCriteria(criteria) {
    const type = typeof criteria;
    switch (type) {
      case "string":
        return (request) => request.category === criteria;
      case "number":
        return (request) => request.id === criteria;
      default:
        return criteria;
    }
  }
  trySuspend(request) {
    const handler = this.registeredHandlers.get(request.category);
    if (handler && !request.forceShow) {
      handler.hide(request, { reason: 2 /* Suspend */ });
      return true;
    }
    return false;
  }
  resume() {
    if (!this._isSuspended) {
      console.error("Display Queue Manager: resume was called even though it was not suspened");
      return;
    }
    this._isSuspended = false;
    if (this.suspendedRequests.length > 0) {
      for (const suspendedRequest of this.suspendedRequests) {
        this.queue.insert(suspendedRequest);
      }
      this.suspendedRequests.length = 0;
    }
    this.updatePending = true;
  }
  update() {
    if (!this.updatePending) {
      return;
    }
    if (this.debounceStallLeft > 0 && this.curDebounceStall < MAX_DEBOUNCE_STALL) {
      this.debounceStallLeft--;
      this.curDebounceStall++;
      return;
    }
    this.curDebounceStall = 0;
    this.updatePending = false;
    while (!this.queue.isEmpty()) {
      this.tryReshuffle();
      if (!this.tryShowNextQueueItem()) {
        break;
      }
    }
  }
  tryReshuffle() {
    if (this.queue.isEmpty() || this.activeRequests.length == 0) {
      return;
    }
    for (let i = this.activeRequests.length - 1; i >= 0; --i) {
      const activeRequest = this.activeRequests[i];
      if (requestLessThan(this.queue.peek(), activeRequest)) {
        const handler = this.registeredHandlers.get(activeRequest.category);
        if (handler && handler.canHide(activeRequest, this.activeRequests)) {
          this.activeRequests.splice(i, 1);
          handler.hide(activeRequest, { reason: 1 /* Reshuffle */ });
          this.queue.insert(activeRequest);
        }
      }
    }
  }
  tryShowNextQueueItem() {
    const nextItem = this.queue.peek();
    const handler = this.registeredHandlers.get(nextItem.category);
    if (!handler) {
      console.error(`Display Queue Manager - Item in queue does not have a handler - ${nextItem.category}!`);
    } else if (handler.canShow(nextItem, this.activeRequests)) {
      this.activeRequests.push(this.queue.pop());
      handler.show(nextItem);
      return true;
    }
    return false;
  }
}
const DisplayQueueManager = new DisplayQueueManagerImpl();

export { DisplayHideReason, DisplayQueueManager };
//# sourceMappingURL=display-queue-manager.js.map
