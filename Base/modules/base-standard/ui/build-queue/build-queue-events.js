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

export { RequestBuildQueueCancelItemEvent, RequestBuildQueueMoveItemLastEvent, RequestBuildQueueMoveItemUpEvent };
//# sourceMappingURL=build-queue-events.js.map
