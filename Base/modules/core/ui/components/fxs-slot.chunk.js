import FocusManager from '../input/focus-manager.js';
import { N as Navigation, a as NavigationRule } from '../views/view-manager.chunk.js';
import Spatial from '../spatial/spatial-manager.js';

var NavigationHandlers;
((NavigationHandlers2) => {
  function handlerIgnore() {
    return true;
  }
  NavigationHandlers2.handlerIgnore = handlerIgnore;
  function handlerStop() {
    return false;
  }
  NavigationHandlers2.handlerStop = handlerStop;
  function handlerEscapeNext(focusElement, props) {
    const sibling = Navigation.getNextFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
      return false;
    }
    return true;
  }
  NavigationHandlers2.handlerEscapeNext = handlerEscapeNext;
  function handlerStopNext(focusElement, props) {
    const sibling = Navigation.getNextFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
    }
    return false;
  }
  NavigationHandlers2.handlerStopNext = handlerStopNext;
  function handlerWrapNext(focusElement, props) {
    const sibling = Navigation.getNextFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
      return false;
    }
    const parentSlot = Navigation.getParentSlot(focusElement);
    if (!parentSlot) {
      console.error("navigation-support: handlerWrapNext(): no parent slot was found");
      return false;
    }
    const wrapSibling = Navigation.getFirstFocusableElement(parentSlot, props);
    if (wrapSibling != null) {
      FocusManager.setFocus(wrapSibling);
    }
    return false;
  }
  NavigationHandlers2.handlerWrapNext = handlerWrapNext;
  function handlerEscapePrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
      return false;
    }
    return true;
  }
  NavigationHandlers2.handlerEscapePrevious = handlerEscapePrevious;
  function handlerStopPrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
    }
    return false;
  }
  NavigationHandlers2.handlerStopPrevious = handlerStopPrevious;
  function handlerWrapPrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.setFocus(sibling);
      return false;
    }
    const parentSlot = Navigation.getParentSlot(focusElement);
    if (!parentSlot) {
      console.error("navigation-support: handlerWrapPrevious(): no parent slot was found");
      return false;
    }
    const wrapSibling = Navigation.getLastFocusableElement(parentSlot, props);
    if (wrapSibling != null) {
      FocusManager.setFocus(wrapSibling);
    }
    return false;
  }
  NavigationHandlers2.handlerWrapPrevious = handlerWrapPrevious;
  function handlerEscapeSpatial(focusElement, props) {
    const direction = Spatial.getDirection(props.direction);
    if (direction == void 0) {
      console.error("spatial-manager: handlerSpatial(): Failed to get a valid navigation direction");
      return false;
    }
    const parentSlot = Navigation.getParentSlot(focusElement);
    if (!parentSlot) {
      console.error("spatial-manager: handlerSpatial(): No parent slot was found");
      return false;
    }
    const sectionId = parentSlot.getAttribute("sectionId");
    if (sectionId == null) {
      console.error("spatial-manager: handlerSpatial(): Failed to find sectionId attribute");
      return false;
    }
    const focusableChildren = Navigation.getFocusableChildren(parentSlot, props);
    return Spatial.navigate(sectionId, focusableChildren, direction);
  }
  NavigationHandlers2.handlerEscapeSpatial = handlerEscapeSpatial;
  function handlerWrapSpatial(_focusElement, _props) {
    console.error("navigation-support: No wrap handler has been implemented for spatial slots!");
    return true;
  }
  NavigationHandlers2.handlerWrapSpatial = handlerWrapSpatial;
  function handlerStopSpatial(focusElement, props) {
    handlerEscapeSpatial(focusElement, props);
    return false;
  }
  NavigationHandlers2.handlerStopSpatial = handlerStopSpatial;
})(NavigationHandlers || (NavigationHandlers = {}));

class FxsSlot extends Component {
  static ruleDirectionCallbackMapping = /* @__PURE__ */ new Map([
    [
      InputNavigationAction.NONE,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapNext],
        [NavigationRule.Stop, NavigationHandlers.handlerStopNext],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.UP,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapPrevious],
        [NavigationRule.Stop, NavigationHandlers.handlerStopPrevious],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.DOWN,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapNext],
        [NavigationRule.Stop, NavigationHandlers.handlerStopNext],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.LEFT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapPrevious],
        [NavigationRule.Stop, NavigationHandlers.handlerStopPrevious],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.RIGHT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapNext],
        [NavigationRule.Stop, NavigationHandlers.handlerStopNext],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ]
  ]);
  rules = /* @__PURE__ */ new Map();
  navigateInputListener = this.onNavigateInput.bind(this);
  focusListener = this.onFocus.bind(this);
  focusOutListener = this.onFocusOut.bind(this);
  continuousCheckForInitialFocusHelpCallback = this.continuousCheckForInitialFocusHelper.bind(this);
  observer = new MutationObserver(this.onChildrenChanged.bind(this));
  isDisableFocusAllowed = false;
  // Can a "disabled" item still gain focus (typically a tooltip or some other way of expressing why it's disabled)
  initialFocus = null;
  // Explicitly set initial item to be focued.
  priorFocus = null;
  // Last item to be focused before a blur occurred
  numberOfFramesWithoutChildFocus = 0;
  lastEventTimeStamp = 0;
  repeatThreshold = 0;
  static INITIAL_THRESHOLD = 400;
  static REPEAT_THRESHOLD = 150;
  static NO_FOCUS_FRAMES_WARNING_THRESHOLD = 30;
  onInitialize() {
    super.onInitialize();
    this.Root.setAttribute("slot", "true");
    this.readRules();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("focus", this.focusListener);
    this.Root.addEventListener("focusout", this.focusOutListener);
    const config = { attributes: false, childList: true, subtree: false };
    this.observer.observe(this.Root, config);
  }
  onDetach() {
    this.observer.disconnect();
    this.Root.removeEventListener("focusout", this.focusOutListener);
    this.Root.removeEventListener("focus", this.focusListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    super.onDetach();
  }
  /**
   * Component Callback
   * @param name
   * @param _oldValue
   * @param newValue
   */
  onAttributeChanged(name, _oldValue, value) {
    if (name.substring(0, 12) == "data-navrule") {
      const action = (() => {
        const key = name.substring(13);
        switch (key) {
          case "up":
            return InputNavigationAction.UP;
          case "down":
            return InputNavigationAction.DOWN;
          case "left":
            return InputNavigationAction.LEFT;
          case "right":
            return InputNavigationAction.RIGHT;
          case "previous":
            return InputNavigationAction.PREVIOUS;
          case "next":
            return InputNavigationAction.NEXT;
          case "shell-previous":
            return InputNavigationAction.SHELL_PREVIOUS;
          case "shell-next":
            return InputNavigationAction.SHELL_NEXT;
          default:
            console.error(
              `fxs-slot: Unexpected attribute nav rule ignored '${name}' with value '${value}'`
            );
            break;
        }
        return InputNavigationAction.NONE;
      })();
      const rule = this.ruleNameToRule(value);
      this.rules.set(action, rule);
    } else if (name == "disable-focus-allowed") {
      this.isDisableFocusAllowed = value === "true";
      this.initialFocus = null;
    } else if (name == "focus-rule") {
      this.initialFocus = null;
    }
  }
  /**
   * Set a navigation rule in the slot from code.
   * @param {InputNavigationAction} direction to associate with a new rule (overrides the default rule)
   * @param {NavigationRule} rule to associate with the navigation action
   */
  setRule(direction, rule) {
    if (rule == this.rules.get(direction)) {
      console.warn(`fxs-slot: A slot is having its rule set to the same value for the direction: ${direction}`);
    }
    this.rules.set(direction, rule);
  }
  /**
   * Sets the initial focus of the slot
   * @param focusTarget The target to set as initial focus
   */
  setInitialFocus(focusTarget) {
    this.initialFocus = focusTarget;
  }
  /**
   * Set the default rules for the slot.
   * If an attribute in the HTML or DOM is set, override to use that rule.
   */
  readRules() {
    const upRuleName = this.Root.getAttribute("data-navrule-up") ?? "escape";
    const downRuleName = this.Root.getAttribute("data-navrule-down") ?? "escape";
    const leftRuleName = this.Root.getAttribute("data-navrule-left") ?? "escape";
    const rightRuleName = this.Root.getAttribute("data-navrule-right") ?? "escape";
    const previousRuleName = this.Root.getAttribute("data-navrule-previous") ?? "invalid";
    const nextRuleName = this.Root.getAttribute("data-navrule-next") ?? "invalid";
    this.rules.set(InputNavigationAction.NONE, NavigationRule.Invalid);
    this.rules.set(InputNavigationAction.UP, this.ruleNameToRule(upRuleName));
    this.rules.set(InputNavigationAction.DOWN, this.ruleNameToRule(downRuleName));
    this.rules.set(InputNavigationAction.LEFT, this.ruleNameToRule(leftRuleName));
    this.rules.set(InputNavigationAction.RIGHT, this.ruleNameToRule(rightRuleName));
    this.rules.set(InputNavigationAction.PREVIOUS, this.ruleNameToRule(previousRuleName));
    this.rules.set(InputNavigationAction.NEXT, this.ruleNameToRule(nextRuleName));
    this.rules.set(InputNavigationAction.SHELL_PREVIOUS, this.ruleNameToRule(previousRuleName));
    this.rules.set(InputNavigationAction.SHELL_NEXT, this.ruleNameToRule(nextRuleName));
  }
  /**
   * Helper, convert a rule name to it's enumeration.
   * @param {string} name The rule name, can be case-insensative.
   * @returns {NavigationRule} the associated navigation rule enum for the name.  Unknown names will return the invalid rule.
   */
  ruleNameToRule(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("esc")) {
      return NavigationRule.Escape;
    }
    if (lowerName.includes("wrap")) {
      return NavigationRule.Wrap;
    }
    if (lowerName.includes("stop")) {
      return NavigationRule.Stop;
    }
    if (lowerName.includes("inv")) {
      return NavigationRule.Invalid;
    }
    console.error(
      `fxs-slot: A slot has an unknown 'data-navrule-XXX' defined with value ${name}. Setting to invalid rule`
    );
    return NavigationRule.Invalid;
  }
  /**
   * Set the initial focus on the first or last focusable element
   */
  realizeInitialFocus() {
    const props = {
      isDisableFocusAllowed: this.isDisableFocusAllowed,
      direction: InputNavigationAction.NONE
    };
    if (this.initialFocus && this.initialFocus.isConnected) {
      return;
    }
    if (this.Root.hasAttribute("ignore-focus")) {
      return;
    }
    if (this.Root.getAttribute("focus-rule") == "last") {
      this.initialFocus = Navigation.getLastFocusableElement(this.Root, props);
    } else {
      this.initialFocus = Navigation.getFirstFocusableElement(this.Root, props);
    }
  }
  continuousCheckForInitialFocus() {
    this.numberOfFramesWithoutChildFocus = 0;
    window.requestAnimationFrame(this.continuousCheckForInitialFocusHelpCallback);
  }
  continuousCheckForInitialFocusHelper() {
    if (FocusManager.getFocus() != this.Root) {
      return;
    }
    if (this.numberOfFramesWithoutChildFocus == FxsSlot.NO_FOCUS_FRAMES_WARNING_THRESHOLD) {
      console.warn(
        `fxs-slot: continuousCheckForInitialFocus(): Slot has focus but hasn't been able to pass it on to a child for ${this.numberOfFramesWithoutChildFocus} frames.`
      );
    }
    this.realizeInitialFocus();
    if (this.initialFocus) {
      FocusManager.setFocus(this.initialFocus);
      this.priorFocus = this.initialFocus;
    } else {
      this.numberOfFramesWithoutChildFocus += 1;
      window.requestAnimationFrame(this.continuousCheckForInitialFocusHelpCallback);
    }
  }
  /**
   * Respond to being directly set to focus.
   */
  onFocus() {
    this.lastEventTimeStamp = Date.now();
    this.repeatThreshold = FxsSlot.INITIAL_THRESHOLD;
    if (!this.Root.hasAttribute("ignore-prior-focus") && this.priorFocus != null && this.priorFocus.isConnected) {
      FocusManager.setFocus(this.priorFocus);
    } else if (this.initialFocus != null && this.initialFocus.isConnected && Navigation.isFocusable(this.initialFocus)) {
      FocusManager.setFocus(this.initialFocus);
    } else if (this.Root.hasChildNodes()) {
      this.realizeInitialFocus();
      if (this.initialFocus != null) {
        FocusManager.setFocus(this.initialFocus);
      } else {
        this.continuousCheckForInitialFocus();
      }
    }
  }
  /**
   * Respond to losing focus.
   * Use this over 'blur' as this will occur before the old focus is lost.
   * @param event The focusout bubbles and needs to be stopped.
   */
  onFocusOut(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const currentFocus = FocusManager.getFocus();
    if (this.Root.isSameNode(currentFocus)) {
      return;
    }
    if (!this.Root.contains(currentFocus)) {
      return;
    }
    if (currentFocus.hasAttribute("non-prior-focusable")) {
      return;
    }
    this.priorFocus = currentFocus;
  }
  onChildrenChanged(mutationList, _observer) {
    let findNewFocus = false;
    if (this.initialFocus == null) {
      mutationList.some((mutationRecord) => {
        if (mutationRecord.type == "childList") {
          this.realizeInitialFocus();
          if (this.initialFocus) {
            return true;
          }
        }
        return false;
      });
    } else {
      mutationList.forEach((mutationRecord) => {
        if (mutationRecord.type == "childList") {
          if (mutationRecord.addedNodes.length > 0) {
            const wasFocused = this.initialFocus == FocusManager.getFocus();
            const previousInitialFocus = this.initialFocus;
            this.initialFocus = null;
            this.realizeInitialFocus();
            if (wasFocused && this.initialFocus && previousInitialFocus != this.initialFocus) {
              FocusManager.setFocus(this.initialFocus);
              this.priorFocus = this.initialFocus;
            }
          }
          mutationRecord.removedNodes.forEach((node) => {
            if (node == FocusManager.getFocus()) {
              findNewFocus = true;
              this.priorFocus = null;
            }
            if (node == this.initialFocus) {
              this.initialFocus = null;
              this.realizeInitialFocus();
            }
            if (node == this.priorFocus) {
              this.priorFocus = null;
            }
          });
        }
      });
    }
    if ((FocusManager.getFocus() == this.Root || findNewFocus) && this.initialFocus && this.priorFocus == null) {
      FocusManager.setFocus(this.initialFocus);
      this.priorFocus = this.initialFocus;
    } else if (this.initialFocus == null && this.priorFocus == null) {
      this.continuousCheckForInitialFocus();
    }
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
      this.resetRepeatThreshold();
    }
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  navigate(direction) {
    const rule = this.rules.get(direction);
    if (rule == void 0) {
      console.error(`fxsslot: Unable to get a rule for input direction '${direction}'.`);
      return true;
    }
    if (this.Root.hasAttribute("reverse-navigation")) {
      switch (direction) {
        case InputNavigationAction.DOWN:
          direction = InputNavigationAction.UP;
          break;
        case InputNavigationAction.UP:
          direction = InputNavigationAction.DOWN;
          break;
        case InputNavigationAction.LEFT:
          direction = InputNavigationAction.RIGHT;
          break;
        case InputNavigationAction.RIGHT:
          direction = InputNavigationAction.LEFT;
          break;
        case InputNavigationAction.NEXT:
          direction = InputNavigationAction.PREVIOUS;
          break;
        case InputNavigationAction.PREVIOUS:
          direction = InputNavigationAction.NEXT;
          break;
        case InputNavigationAction.SHELL_NEXT:
          direction = InputNavigationAction.SHELL_PREVIOUS;
          break;
        case InputNavigationAction.SHELL_PREVIOUS:
          direction = InputNavigationAction.SHELL_NEXT;
          break;
      }
    }
    if (this.Root.hasAttribute("ignore-focus")) {
      return true;
    }
    const focus = FocusManager.getFocusChildOf(this.Root);
    if (focus == null) {
      return true;
    }
    if (focus.parentElement == null) {
      console.error(
        `fxsslot: Attempt to navigate focus but the current focus '${FocusManager.toLogString()}' doesn't have a parent element! (Was it disconnected?) rule: '${rule}', direction: '${direction}'`
      );
      return true;
    }
    const callback = this.getNavigationHandler(rule, direction);
    const props = {
      isDisableFocusAllowed: this.isDisableFocusAllowed,
      direction
    };
    return callback(focus, props);
  }
  resetRepeatThreshold() {
    this.lastEventTimeStamp = 0;
    this.repeatThreshold = 0;
  }
  /**
   * Handle an input navigation event but obtain the appropriate focus chain item
   * and apply the rules set to the navigation direction in how the next item
   * receives focus.
   * @param navigationEvent
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.START && navigationEvent.detail.status != InputActionStatuses.UPDATE && navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (this.Root.isSameNode(FocusManager.getFocus())) {
      return true;
    }
    if (!this.Root.contains(FocusManager.getFocus())) {
      return true;
    }
    if (navigationEvent.detail.status == InputActionStatuses.START) {
      this.resetRepeatThreshold();
      return false;
    }
    const currentTime = Date.now();
    if (this.lastEventTimeStamp != 0 && currentTime - this.lastEventTimeStamp < this.repeatThreshold) {
      return false;
    }
    if (!this.navigate(navigationEvent.getDirection())) {
      this.repeatThreshold = this.lastEventTimeStamp == 0 ? FxsSlot.INITIAL_THRESHOLD : FxsSlot.REPEAT_THRESHOLD;
      this.lastEventTimeStamp = currentTime;
      return false;
    }
    return true;
  }
  /**
   * Returns the static list of rule mapping for this type.
   * @returns
   */
  getRulesMap() {
    return FxsSlot.ruleDirectionCallbackMapping;
  }
  /**
   * Look up the associated callback for a give rule and direction.
   * This traverse the map of maps of the callbacks.
   * @param rule
   * @param direction
   * @returns Assigned callback based on the Navigation rule and direction or if unfound, a callback that ignores the input.
   */
  getNavigationHandler(rule, direction) {
    const rules = this.getRulesMap().get(direction);
    if (!rules) {
      console.error(
        `fxs-slot: Unable to find a navigation callback due to unmapped direction. rule: '${rule}', direction: '${direction}'.`
      );
      return NavigationHandlers.handlerIgnore;
    }
    const callback = rules.get(rule);
    if (!callback) {
      console.error(
        `fxs-slot: Unable to find a navigation callback due to unmapped rule. rule: '${rule}', direction: '${direction}'.`
      );
      return NavigationHandlers.handlerIgnore;
    }
    return callback;
  }
}
function isSlot(slot) {
  return slot?.hasAttribute("slot") ?? false;
}
Controls.define("fxs-slot", {
  createInstance: FxsSlot,
  description: "A generic slot element.",
  classNames: ["fxs-slot"],
  attributes: [
    {
      name: "data-navrule-up"
    },
    {
      name: "data-navrule-down"
    },
    {
      name: "data-navrule-left"
    },
    {
      name: "data-navrule-right"
    },
    {
      name: "data-navrule-previous"
    },
    {
      name: "data-navrule-next"
    },
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    },
    {
      name: "focus-rule",
      description: 'Defines whether the "first" or "last" child will be the initial focus when this slot takes focus. Defaults to "first"'
    },
    {
      name: "ignore-prior-focus",
      description: "If set, the slot ignores the prior focus and set the focus to initial focus"
    },
    {
      name: "ignore-focus",
      description: "Ignore everything in this slot, including the slot itself"
    }
  ],
  tabIndex: -1
});
class FxsVSlot extends FxsSlot {
  static ruleDirectionCallbackMapping = /* @__PURE__ */ new Map([
    [
      InputNavigationAction.NONE,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.UP,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapePrevious],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapPrevious],
        [NavigationRule.Stop, NavigationHandlers.handlerStopPrevious],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.DOWN,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeNext],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapNext],
        [NavigationRule.Stop, NavigationHandlers.handlerStopNext],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.LEFT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerStop],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.RIGHT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerStop],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ]
  ]);
  /**
   * Returns the static list of rule mapping for this type.
   * @returns
   */
  getRulesMap() {
    return FxsVSlot.ruleDirectionCallbackMapping;
  }
}
Controls.define("fxs-vslot", {
  createInstance: FxsVSlot,
  description: "A slot element which organizes children in a vertical column.",
  classNames: ["fxs-vslot"],
  attributes: [
    {
      name: "data-navrule-up"
    },
    {
      name: "data-navrule-down"
    },
    {
      name: "data-navrule-left"
    },
    {
      name: "data-navrule-right"
    },
    {
      name: "data-navrule-previous"
    },
    {
      name: "data-navrule-next"
    },
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    },
    {
      name: "focus-rule",
      description: 'Defines whether the "first" or "last" child will be the initial focus when this slot takes focus. Defaults to "first"'
    },
    {
      name: "ignore-prior-focus",
      description: "If set, the slot ignores the prior focus and set the focus to initial focus"
    },
    {
      name: "ignore-focus",
      description: "Ignore everything in this slot, including the slot itself"
    }
  ],
  tabIndex: -1
});
class FxsHSlot extends FxsSlot {
  static ruleDirectionCallbackMapping = /* @__PURE__ */ new Map([
    [
      InputNavigationAction.NONE,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.UP,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerStop],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.DOWN,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerStop],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.LEFT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapePrevious],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapPrevious],
        [NavigationRule.Stop, NavigationHandlers.handlerStopPrevious],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.RIGHT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeNext],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapNext],
        [NavigationRule.Stop, NavigationHandlers.handlerStopNext],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ]
  ]);
  /**
   * Returns the static list of rule mapping for this type.
   * @returns
   */
  getRulesMap() {
    return FxsHSlot.ruleDirectionCallbackMapping;
  }
}
Controls.define("fxs-hslot", {
  createInstance: FxsHSlot,
  description: "A slot element which organizes children in a horizontal row.",
  classNames: ["fxs-hslot"],
  attributes: [
    {
      name: "data-navrule-up"
    },
    {
      name: "data-navrule-down"
    },
    {
      name: "data-navrule-left"
    },
    {
      name: "data-navrule-right"
    },
    {
      name: "data-navrule-previous"
    },
    {
      name: "data-navrule-next"
    },
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    },
    {
      name: "focus-rule",
      description: 'Defines whether the "first" or "last" child will be the initial focus when this slot takes focus. Defaults to "first"'
    },
    {
      name: "ignore-prior-focus",
      description: "If set, the slot ignores the prior focus and set the focus to initial focus"
    },
    {
      name: "ignore-focus",
      description: "Ignore everything in this slot, including the slot itself"
    }
  ],
  tabIndex: -1
});
class FxsSidePanel extends FxsSlot {
  visibleChildren = [];
  onChildHiddenListener = (event) => {
    this.onChildHidden(event);
  };
  onChildShownListener = (event) => {
    this.onChildShown(event);
  };
  onAttach() {
    super.onAttach();
    engine.on("OnContextManagerClose", this.onChildHiddenListener);
    engine.on("OnContextManagerOpen", this.onChildShownListener);
  }
  onDetach() {
    engine.off("OnContextManagerClose", this.onChildHiddenListener);
    engine.off("OnContextManagerOpen", this.onChildShownListener);
  }
  onChildHidden(event) {
    const deactivatedElement = event.detail.deactivatedElement;
    if (deactivatedElement instanceof HTMLElement) {
      const id = `target-slot-${deactivatedElement.tagName.toLowerCase()}`;
      for (let i = 0; i < this.visibleChildren.length; i++) {
        if (this.visibleChildren[i].id == id) {
          this.visibleChildren.splice(i, 1);
          break;
        }
      }
      this.clearModifiers();
      if (this.visibleChildren.length <= 0) {
        this.Root.classList.add("empty");
      }
    } else {
      console.error("fxs-slot: onChildHidden expected reference of side panel child in event.detail!");
      return;
    }
  }
  onChildShown(event) {
    if (!event.detail.activatedElement) {
      console.error("fxs-slot: onChildShown expected reference of side panel child in event.detail!");
      return;
    }
    this.clearModifiers();
    for (let i = 0; i < this.Root.children.length; i++) {
      if (this.Root.children[i].contains(event.detail.activatedElement)) {
        this.visibleChildren.push(this.Root.children[i]);
        if (this.Root.classList.contains("empty")) {
          this.Root.classList.remove("empty");
        }
        break;
      }
    }
    for (let i = 0; i < this.visibleChildren.length; i++) {
      this.visibleChildren[i].style.zIndex = i.toString();
    }
  }
  clearModifiers() {
    this.Root.classList.remove("expanded");
    this.Root.classList.remove("max");
  }
}
Controls.define("fxs-side-panel", {
  createInstance: FxsSidePanel,
  description: "A generic side panel element",
  classNames: ["empty"],
  attributes: [
    {
      name: "data-navrule-up"
    },
    {
      name: "data-navrule-down"
    },
    {
      name: "data-navrule-left"
    },
    {
      name: "data-navrule-right"
    },
    {
      name: "data-navrule-previous"
    },
    {
      name: "data-navrule-next"
    },
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    },
    {
      name: "focus-rule",
      description: 'Defines whether the "first" or "last" child will be the initial focus when this slot takes focus. Defaults to "first"'
    },
    {
      name: "ignore-prior-focus",
      description: "If set, the slot ignores the prior focus and set the focus to initial focus"
    },
    {
      name: "ignore-focus",
      description: "Ignore everything in this slot, including the slot itself"
    }
  ],
  tabIndex: -1
});
class FxsSpatialSlot extends FxsSlot {
  static ruleDirectionCallbackMapping = /* @__PURE__ */ new Map([
    [
      InputNavigationAction.NONE,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.UP,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeSpatial],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapSpatial],
        [NavigationRule.Stop, NavigationHandlers.handlerStopSpatial],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.DOWN,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeSpatial],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapSpatial],
        [NavigationRule.Stop, NavigationHandlers.handlerStopSpatial],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.LEFT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeSpatial],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapSpatial],
        [NavigationRule.Stop, NavigationHandlers.handlerStopSpatial],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.RIGHT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerEscapeSpatial],
        [NavigationRule.Wrap, NavigationHandlers.handlerWrapSpatial],
        [NavigationRule.Stop, NavigationHandlers.handlerStopSpatial],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_PREVIOUS,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ],
    [
      InputNavigationAction.SHELL_NEXT,
      /* @__PURE__ */ new Map([
        [NavigationRule.Escape, NavigationHandlers.handlerIgnore],
        [NavigationRule.Wrap, NavigationHandlers.handlerIgnore],
        [NavigationRule.Stop, NavigationHandlers.handlerIgnore],
        [NavigationRule.Invalid, NavigationHandlers.handlerIgnore]
      ])
    ]
  ]);
  // spatial-navigation.js library has it's own unique section Id generation but
  // it seemed cumbursome without complicated UI and hard to get exposed to
  static sectionCount = 0;
  static sectionIdPrefix = "fxs-spatial-slot-";
  static sectionIdPool = /* @__PURE__ */ new Set();
  snUnfocusedListener = this.onElementUnfocused.bind(this);
  onInitialize() {
    super.onInitialize();
    this.Root.addEventListener("sn:willunfocus", this.snUnfocusedListener);
  }
  onAttach() {
    super.onAttach();
    this.Root.setAttribute("sectionId", FxsSpatialSlot.getSectionIdFromPool());
  }
  onDetach() {
    FxsSpatialSlot.removeSectionIdFromPool(this.Root.getAttribute("sectionId"));
    super.onDetach();
  }
  static getSectionIdFromPool() {
    let newSectionId = "";
    do {
      newSectionId = FxsSpatialSlot.sectionIdPrefix + ++FxsSpatialSlot.sectionCount;
    } while (FxsSpatialSlot.sectionIdPool.has(newSectionId));
    FxsSpatialSlot.sectionIdPool.add(newSectionId);
    return newSectionId;
  }
  static removeSectionIdFromPool(sectionId) {
    if (sectionId == null) {
      console.error("fxs-slot: Spatial slot failed to have a unique sectionId to remove from pool.");
      return;
    }
    FxsSpatialSlot.sectionIdPool.delete(sectionId);
  }
  onElementUnfocused(event) {
    if (!event.detail.native && event.detail.nextElement) {
      FocusManager.setFocus(event.detail.nextElement);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  /**
   * Returns the static list of rule mapping for this type.
   * @returns
   */
  getRulesMap() {
    return FxsSpatialSlot.ruleDirectionCallbackMapping;
  }
}
Controls.define("fxs-spatial-slot", {
  createInstance: FxsSpatialSlot,
  description: "A slot element designed to use spatial navigation.",
  classNames: ["fxs-spatial-slot"],
  attributes: [
    {
      name: "data-navrule-up"
    },
    {
      name: "data-navrule-down"
    },
    {
      name: "data-navrule-left"
    },
    {
      name: "data-navrule-right"
    },
    {
      name: "data-navrule-previous"
    },
    {
      name: "data-navrule-next"
    },
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    },
    {
      name: "focus-rule",
      description: 'Defines whether the "first" or "last" child will be the initial focus when this slot takes focus. Defaults to "first"'
    },
    {
      name: "ignore-prior-focus",
      description: "If set, the slot ignores the prior focus and set the focus to initial focus"
    },
    {
      name: "ignore-slot",
      description: "Ignore everything in this slot, including the slot itself"
    }
  ],
  tabIndex: -1
});
class FxsSlotGroup extends FxsSlot {
  onAttach() {
    super.onAttach();
    if (this.Root.children.length === 0) {
      console.error("fxs-slot-group: Slot group must have at least one child.");
      return;
    }
  }
  onReceiveFocus() {
    if (!this.Root.hasAttribute("selected-slot")) {
      const id = this.Root.children[0].id;
      if (id) {
        this.Root.setAttribute("selected-slot", id);
      }
    }
  }
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    if (name === "selected-slot") {
      const selectedSlotId = newValue;
      const children = this.Root.children;
      let selection = null;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!(child instanceof HTMLElement)) {
          continue;
        }
        if (child.id === selectedSlotId) {
          selection = child;
          child.style.display = "flex";
          FocusManager.setFocus(child);
        } else {
          child.style.display = "none";
        }
      }
      if (!selection) {
        console.error(`fxs-slot-group: Slot with ID '${selectedSlotId}' not found.`);
      }
    }
  }
  onFocus() {
    const selectedSlotId = this.Root.getAttribute("selected-slot");
    const children = this.Root.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      if (child.id === selectedSlotId) {
        FocusManager.setFocus(child);
      }
    }
  }
}
Controls.define("fxs-slot-group", {
  createInstance: FxsSlotGroup,
  attributes: [
    {
      name: "selected-slot"
    }
  ],
  tabIndex: -1
});

export { FxsSlot as F, FxsVSlot as a, FxsHSlot as b, FxsSidePanel as c, FxsSpatialSlot as d, FxsSlotGroup as e, isSlot as i };
//# sourceMappingURL=fxs-slot.chunk.js.map
