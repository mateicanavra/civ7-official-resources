class LowerCalloutEvent extends CustomEvent {
  constructor(detail) {
    super("LowerCalloutEvent", { bubbles: false, cancelable: true, detail });
  }
}
class LowerQuestPanelEvent extends CustomEvent {
  constructor(detail) {
    super("LowerQuestPanelEvent", { bubbles: false, cancelable: true, detail });
  }
}

export { LowerCalloutEvent as L, LowerQuestPanelEvent as a };
//# sourceMappingURL=tutorial-events.chunk.js.map
