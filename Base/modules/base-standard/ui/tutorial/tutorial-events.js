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
const TutorialCalloutMinimizeEventName = "callout-minimize";
class TutorialCalloutMinimizeEvent extends CustomEvent {
  constructor(bubbles) {
    super(TutorialCalloutMinimizeEventName, { bubbles: false, cancelable: true, detail: { bubbles } });
  }
}
const TutorialCalloutInspectEventName = "callout-inspect";
class TutorialCalloutInspectEvent extends CustomEvent {
  constructor(bubbles) {
    super(TutorialCalloutInspectEventName, { bubbles: false, cancelable: true, detail: { bubbles } });
  }
}

export { LowerCalloutEvent, LowerQuestPanelEvent, TutorialCalloutInspectEvent, TutorialCalloutInspectEventName, TutorialCalloutMinimizeEvent, TutorialCalloutMinimizeEventName };
//# sourceMappingURL=tutorial-events.js.map
