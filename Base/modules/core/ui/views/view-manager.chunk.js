import FocusManager from '../input/focus-manager.js';
import { A as AnchorType } from '../panel-support.chunk.js';

var NavigationRule = /* @__PURE__ */ ((NavigationRule2) => {
  NavigationRule2[NavigationRule2["Escape"] = 0] = "Escape";
  NavigationRule2[NavigationRule2["Wrap"] = 1] = "Wrap";
  NavigationRule2[NavigationRule2["Stop"] = 2] = "Stop";
  NavigationRule2[NavigationRule2["Invalid"] = 3] = "Invalid";
  return NavigationRule2;
})(NavigationRule || {});
var Navigation;
((Navigation2) => {
  class Properties {
    /// Can a "disabled" item still gain focus (typically a tooltip or some other way of expressing why it's disabled).
    isDisableFocusAllowed = false;
    direction = InputNavigationAction.NONE;
  }
  Navigation2.Properties = Properties;
  function isFocusable(element, props = new Properties()) {
    if (!element.hasAttribute("tabindex")) {
      return false;
    }
    if (!props.isDisableFocusAllowed && (element.classList.contains("disabled") || element.getAttribute("disabled") == "true")) {
      return false;
    }
    if (isHidden(element)) {
      return false;
    }
    if (element.hasAttribute("slot")) {
      const slotProps = {
        isDisableFocusAllowed: element.getAttribute("disable-focus-allowed") == "true",
        direction: props.direction
      };
      if (getFirstFocusableElement(element, slotProps) == null) {
        return false;
      }
    }
    return true;
  }
  Navigation2.isFocusable = isFocusable;
  function isHidden(element) {
    let isHidden2 = false;
    if (element.classList.contains("hidden") || element.classList.contains("invisible") || element.classList.contains("opactity-0")) {
      isHidden2 = true;
    } else if (element instanceof HTMLElement) {
      const style = window.getComputedStyle(element);
      isHidden2 = style.display == "none" || parseFloat(style.opacity) === 0 || style.visibility == "hidden";
    }
    return isHidden2;
  }
  function shouldCheckChildrenFocusable(element) {
    return !element.hasAttribute("tabindex") && !isHidden(element);
  }
  Navigation2.shouldCheckChildrenFocusable = shouldCheckChildrenFocusable;
  function getNextFocusableElementRecursive(element, props) {
    if (element == null) {
      return null;
    }
    if (isFocusable(element, props)) {
      return element;
    } else if (shouldCheckChildrenFocusable(element)) {
      const childFocusableElement = getFirstFocusableElement(element, props);
      if (childFocusableElement != null) {
        return childFocusableElement;
      }
    }
    return getNextFocusableElementRecursive(element.nextElementSibling, props);
  }
  function getNextFocusableElement(element, props) {
    let nextFocusableElement = null;
    let currentElement = element;
    do {
      nextFocusableElement = getNextFocusableElementRecursive(currentElement.nextElementSibling, props);
      currentElement = currentElement.parentElement;
    } while (nextFocusableElement == null && currentElement != null && !currentElement.hasAttribute("tabindex"));
    return nextFocusableElement;
  }
  Navigation2.getNextFocusableElement = getNextFocusableElement;
  function getPreviousFocusableElementRecursive(element, props) {
    if (element == null) {
      return null;
    }
    if (isFocusable(element, props)) {
      return element;
    } else if (shouldCheckChildrenFocusable(element)) {
      const childFocusableElement = getPreviousFocusableElementRecursive(
        element.lastElementChild,
        props
      );
      if (childFocusableElement) {
        return childFocusableElement;
      }
    }
    return getPreviousFocusableElementRecursive(element.previousElementSibling, props);
  }
  function getPreviousFocusableElement(element, props) {
    let previousFocusableElement = null;
    let currentElement = element;
    do {
      previousFocusableElement = getPreviousFocusableElementRecursive(
        currentElement.previousElementSibling,
        props
      );
      currentElement = currentElement.parentElement;
    } while (previousFocusableElement == null && currentElement != null && !currentElement.hasAttribute("tabindex"));
    return previousFocusableElement;
  }
  Navigation2.getPreviousFocusableElement = getPreviousFocusableElement;
  function getFirstFocusableElement(parent, props) {
    return getNextFocusableElementRecursive(parent.firstElementChild, props);
  }
  Navigation2.getFirstFocusableElement = getFirstFocusableElement;
  function getLastFocusableElement(parent, props) {
    return getPreviousFocusableElementRecursive(parent.lastElementChild, props);
  }
  Navigation2.getLastFocusableElement = getLastFocusableElement;
  function getParentSlot(child) {
    let parentSlot = child.parentElement;
    while (parentSlot && !parentSlot.hasAttribute("tabindex")) {
      parentSlot = parentSlot.parentElement;
    }
    return parentSlot;
  }
  Navigation2.getParentSlot = getParentSlot;
  function getFocusableChildrenRecursive(parent, element, props) {
    if (element == null) {
      return [];
    }
    let focusableChildren = [];
    if (element != parent && isFocusable(element, props)) {
      focusableChildren.push(element);
    } else if (element == parent || shouldCheckChildrenFocusable(element)) {
      for (let i = 0; i < element.children.length; ++i) {
        focusableChildren = focusableChildren.concat(
          getFocusableChildrenRecursive(parent, element.children[i], props)
        );
      }
    }
    return focusableChildren;
  }
  function getFocusableChildren(parent, props) {
    return getFocusableChildrenRecursive(parent, parent, props);
  }
  Navigation2.getFocusableChildren = getFocusableChildren;
})(Navigation || (Navigation = {}));

var UISystem = /* @__PURE__ */ ((UISystem2) => {
  UISystem2[UISystem2["HUD"] = 0] = "HUD";
  UISystem2[UISystem2["World"] = 1] = "World";
  UISystem2[UISystem2["Lens"] = 2] = "Lens";
  UISystem2[UISystem2["Events"] = 3] = "Events";
  UISystem2[UISystem2["Unset"] = 4] = "Unset";
  return UISystem2;
})(UISystem || {});
var SwitchViewResult = /* @__PURE__ */ ((SwitchViewResult2) => {
  SwitchViewResult2[SwitchViewResult2["Error"] = 0] = "Error";
  SwitchViewResult2[SwitchViewResult2["NothingChanged"] = 1] = "NothingChanged";
  SwitchViewResult2[SwitchViewResult2["ChangesApplied"] = 2] = "ChangesApplied";
  return SwitchViewResult2;
})(SwitchViewResult || {});
class UnsetView {
  getName() {
    return "Unset";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "empty";
  }
  enterView() {
    console.error("Attempt to enter the UnsetView!");
  }
  exitView() {
  }
  addEnterCallback(_func) {
    console.error("Attempt to set the enter callback the UnsetView!");
  }
  addExitCallback(_func) {
    console.error("Attempt to set the exit callback the UnsetView!");
  }
  getRules() {
    return [];
  }
}
class ViewManagerSingleton {
  _current = new UnsetView();
  _last = new UnsetView();
  views = /* @__PURE__ */ new Map();
  isHarnessHidden = false;
  ruleStates = [];
  //private previousViewID: string = "";
  currentViewID = "";
  //Is world input like panning, rotating, or zooming allowed. Separate variable from view rule to allow context-manager to toggle this rule
  _isWorldInputAllowed = true;
  // Is the view blocked by an external popup (tutorial, notification, etc)?
  _isViewInputAllowed = true;
  harness = null;
  //Does the current view has focus
  get viewHasFocus() {
    const harness = this.getHarness();
    return FocusManager.isWorldFocused() || harness != null && FocusManager.getFocusChildOf(harness) != null;
  }
  /**
   * Set the current view either by object interface.
   */
  set current(view) {
    if (view == this._current) {
      return;
    }
    if (this.viewHasFocus) {
      this.handleLoseFocus();
    }
    this._current.exitView();
    this._last = this._current;
    this._current = view;
    this.applyRules();
    this.switchView(view.getHarnessTemplate());
    view.enterView();
  }
  get current() {
    return this._current;
  }
  // current view
  get last() {
    return this._last;
  }
  // last view that was set
  observerCallback = (multationList, observer) => {
    this.onChildrenChanged(multationList, observer);
  };
  observer = null;
  constructor() {
    const config = { attributes: false, childList: true, subtree: false };
    this.observer = new MutationObserver(this.observerCallback);
    const harness = this.getHarness();
    if (harness) {
      this.observer.observe(harness, config);
    } else {
      if (UI.isInShell()) {
        console.warn("VM: Unable to find harness.  The ViewManager should not be loaded in the shell.");
      } else {
        console.error("VM: Unable to find harness during CTOR and not in Shell.");
      }
    }
    this.addHandler(new UnsetView());
  }
  /**
   * Track if children are added (and removed) so a signal can be sent out
   * when a new DOM is loaded.
   */
  onChildrenChanged(mutationList, _observer) {
    const isHarnessAdded = mutationList.some((mutationRecord) => {
      return mutationRecord.addedNodes.length > 0;
    });
    if (isHarnessAdded) {
      window.dispatchEvent(new CustomEvent("view-changed"));
    }
  }
  applyRules() {
    this._current.getRules().forEach((rule) => {
      switch (rule.type) {
        case 0 /* HUD */:
          switch (rule.name) {
            case "harness":
              if (rule.visible == "false") {
                this.hideHarness();
              } else {
                this.showHarness();
              }
              break;
            default:
              console.error(`VM: Unknown HUD view rule name ${rule.name}`);
              break;
          }
          break;
        case 1 /* World */:
          const state = this.ruleStates.find((t) => t.name == rule.name);
          const newVis = rule.visible == "true";
          const newSelectable = rule.selectable;
          const INVALID_STATE_INDEX = -1;
          let stateIndex = INVALID_STATE_INDEX;
          if (state == void 0) {
            this.ruleStates.push({ name: rule.name, visible: !newVis, selectable: newSelectable });
            stateIndex = this.ruleStates.length - 1;
          } else {
            stateIndex = this.ruleStates.indexOf(state);
          }
          if (stateIndex != INVALID_STATE_INDEX) {
            if (newVis != this.ruleStates[stateIndex].visible) {
              this.ruleStates[stateIndex].visible = newVis;
              const eventName = (newVis ? "ui-show-" : "ui-hide-") + rule.name;
              window.dispatchEvent(new CustomEvent(eventName, { bubbles: false }));
            }
            if (newSelectable !== this.ruleStates[stateIndex].selectable) {
              this.ruleStates[stateIndex].selectable = newSelectable;
              const eventName = (newSelectable ? "ui-enable-" : "ui-disable-") + rule.name;
              window.dispatchEvent(new CustomEvent(eventName, { bubbles: false }));
            }
          } else {
            console.error(`VM: couldn't find ${rule.name} in tracking info and couldn't add it`);
          }
          break;
        case 2 /* Lens */:
          console.warn(`VM: TODO: implement lens toggling via view manager.`);
          break;
        case 3 /* Events */:
          break;
        default:
          console.error(`VM: Unknown UISystem value '${rule.type}' when parsing view rules.`);
          break;
      }
    });
  }
  /**
   * Help API to set the current view by view name in the pool.
   * @param {string} viewName The name of view that has been added to the pool.
   * @returns true if successful.
   */
  setCurrentByName(viewName) {
    const view = this.views.get(viewName);
    if (view == void 0) {
      console.error("VM: Unable to setCurrent view '" + viewName + "', none exists with that name.");
      return false;
    }
    this.current = view;
    return true;
  }
  /**
   * Add a view to the pool.
   * @param {IGameView} view The view to add to the pool.
   */
  addHandler(view) {
    if (this.views.has(view.getName())) {
      console.error("VM: Attempt to add view '" + view.getName() + "' but it already exists in the view pool.");
      return;
    }
    this.views.set(view.getName(), view);
  }
  /// Confirm a view is valid.
  isValid(view) {
    return !(view instanceof UnsetView);
  }
  /**
   * Obtain a rule (within the view) for a given name.
   * @param name of the rule
   * @param last optional flag to search in the last set view
   */
  getRule(name) {
    let matchingRule = null;
    this.current.getRules().some((rule) => {
      if (rule.name == name) {
        matchingRule = rule;
        return true;
      }
      return false;
    });
    return matchingRule;
  }
  /**
   * Should unit selection be listened to in this view?
   * @returns true if should, false otherwise
   */
  get isUnitSelectingAllowed() {
    const rule = this.getRule("units");
    if (!rule) {
      return true;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Should city selection be listened to in this view?
   * @returns true if should, false otherwise
   */
  get isCitySelectingAllowed() {
    const rule = this.getRule("cities");
    if (!rule) {
      return true;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Should world selection be listened to in this view?
   * @returns true if should, false otherwise
   */
  get isWorldSelectingAllowed() {
    const rule = this.getRule("world");
    if (!rule) {
      return true;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Should other world input (zooming, panning, rotating) be listened to in this view or context?
   * @returns true if should, false otherwise
   */
  get isWorldInputAllowed() {
    if (!this._isWorldInputAllowed) {
      return false;
    }
    const rule = this.getRule("world-input");
    if (!rule) {
      return true;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Turns on/off selection, camera panning and camera zoom.
   */
  set isWorldInputAllowed(state) {
    this._isWorldInputAllowed = state;
    Camera.setPreventMouseCameraMovement(!state);
    Input.setClipCursorPaused(!state);
  }
  /**
   * Should view input (focus, navigation) be listened to in this view?
   * @returns true if should, false otherwise
   */
  get isViewInputAllowed() {
    if (!this._isViewInputAllowed) {
      return false;
    }
    if (FocusManager.isFocusLocked) {
      return false;
    }
    const rule = this.getRule("view-input");
    if (!rule) {
      return true;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Turns on/off focus in view.
   */
  set isViewInputAllowed(state) {
    this._isViewInputAllowed = state;
  }
  /**
   * Turns on/off just zoom.
   */
  set isWorldZoomAllowed(state) {
    Camera.setPreventMouseCameraZoom(!state);
  }
  /**
   * Should radial selection be allowed in this view?
   * @returns true if should, false otherwise
   */
  get isRadialSelectionAllowed() {
    const rule = this.getRule("radial-selection");
    if (!rule) {
      return false;
    }
    return rule.selectable != void 0 && rule.selectable;
  }
  /**
   * Should small narratives be allowed in this view?
   * @returns true if should, false otherwise
   */
  get areSmallNarrativesAllowed() {
    const rule = this.getRule("small-narratives");
    if (!rule) {
      return true;
    }
    return rule.visible != void 0 && rule.visible == "true";
  }
  /**
   * If the current view handles input, let it inspect an engine input event.
   * @param {InputEngineEvent} inputEvent An input event
   * @returns true if the input is still "live" and not yet cancelled.
   */
  handleInput(inputEvent) {
    if (inputEvent.type != "engine-input") {
      console.warn(`VM: Attempt to dispatch a non engine-input event '${inputEvent.type}' to the current view.`);
      return true;
    }
    if (!this.isViewInputAllowed) {
      return true;
    }
    if (!this.current.readInputEvent) {
      return true;
    }
    const live = this.current.readInputEvent(inputEvent);
    return live;
  }
  /**
   * Obtain the active view's harness DOM element.
   * @returns the HTMLElement for the harness element or null if unable to be found.
   */
  getHarness() {
    if (!this.harness || !this.harness.isConnected) {
      this.harness = document.querySelector(".harness");
    }
    return this.harness;
  }
  /**
   * Handle navigation input.
   * @param {NavigateInputEvent} navigationEvent
   * @returns true if still live, false if input should stop.
   * @implements NavigateInputEvent
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (navigationEvent.type != "navigate-input") {
      console.warn(
        `VM: Attempt to handle navigation event failed since '${navigationEvent.type}' is not 'navigate-input'.`
      );
      return true;
    }
    if (!this.isViewInputAllowed) {
      return true;
    }
    let live = true;
    if (this.current.handleNavigation) {
      live = this.current.handleNavigation(navigationEvent);
    }
    const direction = navigationEvent.getDirection();
    if (live && !FocusManager.isWorldFocused() && !(direction & (InputNavigationAction.NEXT | InputNavigationAction.PREVIOUS))) {
      const harness = this.getHarness();
      if (harness == null) {
        console.error(
          "VM: View is unable to find the harness for navigation handling; this should never happen!"
        );
        return true;
      }
      const focusedSlot = FocusManager.getFocusChildOf(harness);
      if (focusedSlot == null) {
        return true;
      }
      let anchor = this.classesToAnchor(focusedSlot.classList);
      if (anchor == AnchorType.None) {
        console.error(
          "VM: Unable to determine an anchor type from the focus element's classes: ",
          focusedSlot.classList.toString()
        );
        return true;
      }
      let nextAnchor = AnchorType.None;
      do {
        nextAnchor = this.getNextAnchorFromDirection(direction, anchor);
        if (nextAnchor == AnchorType.None) {
          console.error(
            "VM: Unable to find the next harness anchor; result is none.  direction: ",
            direction
          );
          break;
        }
        if (nextAnchor == anchor) {
          break;
        }
        const newSlot = this.getSlotByAnchors(harness, nextAnchor);
        if (newSlot == null) {
          console.error(
            "VM: Unable to find the next harness slot from the anchor: ",
            anchor,
            ", direction: ",
            direction
          );
          break;
        }
        const props = {
          isDisableFocusAllowed: false,
          direction: InputNavigationAction.NONE
        };
        if (Navigation.isFocusable(newSlot, props)) {
          FocusManager.setFocus(newSlot);
          live = false;
          break;
        }
        anchor = nextAnchor;
      } while (true);
    }
    return live;
  }
  // Let the current view know it received the focus
  handleReceiveFocus() {
    Input.setActiveContext(this.current.getInputContext());
    if (this.current.handleReceiveFocus) {
      this.current.handleReceiveFocus();
    }
  }
  // Let the current view know it lost the focus
  handleLoseFocus() {
    if (this.current.handleLoseFocus) {
      this.current.handleLoseFocus();
    }
  }
  getSlotByAnchors(harness, anchor) {
    switch (anchor) {
      case AnchorType.RelativeToTopLeft:
        return harness.querySelector(".top.left");
      case AnchorType.RelativeToTopRight:
        return harness.querySelector(".top.right");
      case AnchorType.RelativeToTop:
        return harness.querySelector(".top.center");
      case AnchorType.RelativeToBottomLeft:
        return harness.querySelector(".bottom.left");
      case AnchorType.RelativeToBottomRight:
        return harness.querySelector(".bottom.right");
      case AnchorType.RelativeToBottom:
        return harness.querySelector(".bottom.center");
      case AnchorType.RelativeToLeft:
        return harness.querySelector(".middle.left");
      case AnchorType.RelativeToCenter:
        return harness.querySelector(".middle.center");
      case AnchorType.RelativeToRight:
        return harness.querySelector(".middle.right");
      case AnchorType.SidePanelLeft:
        return harness.querySelector(".sidepanel.left_panel");
      case AnchorType.SidePanelRight:
        return harness.querySelector(".sidepanel.right_panel");
    }
    console.error("VM: Unable to query for slot element by classes.  anchor: ", anchor);
    return null;
  }
  /**
   * Obtains an anchor in the harness based on the current anchor an a navigation direction.
   * @param {InputNavigationAction} navigationAction The direction of navigation
   * @param {AnchorType} currentAnchor The current anchor
   * @returns {AnchorType} New anchor (or AnchorType.None if invalid)
   */
  getNextAnchorFromDirection(navigationAction, currentAnchor) {
    const navigationChains = /* @__PURE__ */ new Map([
      [
        InputNavigationAction.LEFT,
        [
          [
            AnchorType.SidePanelRight,
            AnchorType.RelativeToTopRight,
            AnchorType.RelativeToTop,
            AnchorType.RelativeToTopLeft,
            AnchorType.SidePanelLeft
          ],
          [
            AnchorType.RelativeToRight,
            AnchorType.RelativeToCenter,
            AnchorType.RelativeToLeft,
            AnchorType.SidePanelLeft
          ],
          [
            AnchorType.RelativeToBottomRight,
            AnchorType.RelativeToBottom,
            AnchorType.RelativeToBottomLeft,
            AnchorType.SidePanelLeft
          ]
        ]
      ],
      [
        InputNavigationAction.RIGHT,
        [
          [
            AnchorType.SidePanelLeft,
            AnchorType.RelativeToTopLeft,
            AnchorType.RelativeToTop,
            AnchorType.RelativeToTopRight,
            AnchorType.SidePanelRight
          ],
          [
            AnchorType.RelativeToLeft,
            AnchorType.RelativeToCenter,
            AnchorType.RelativeToRight,
            AnchorType.SidePanelRight
          ],
          [
            AnchorType.RelativeToBottomLeft,
            AnchorType.RelativeToBottom,
            AnchorType.RelativeToBottomRight,
            AnchorType.SidePanelRight
          ]
        ]
      ],
      [
        InputNavigationAction.UP,
        [
          [AnchorType.RelativeToBottomRight, AnchorType.RelativeToRight, AnchorType.RelativeToTopRight],
          [AnchorType.RelativeToBottom, AnchorType.RelativeToCenter, AnchorType.RelativeToTop],
          [AnchorType.RelativeToBottomLeft, AnchorType.RelativeToLeft, AnchorType.RelativeToTopLeft]
        ]
      ],
      [
        InputNavigationAction.DOWN,
        [
          [AnchorType.RelativeToTopRight, AnchorType.RelativeToRight, AnchorType.RelativeToBottomRight],
          [AnchorType.RelativeToTop, AnchorType.RelativeToCenter, AnchorType.RelativeToBottom],
          [AnchorType.RelativeToTopLeft, AnchorType.RelativeToLeft, AnchorType.RelativeToBottomLeft]
        ]
      ]
    ]);
    const chains = navigationChains.get(navigationAction);
    if (chains == void 0) {
      console.error(
        "VM: getNextSlot was unable to find a chain based on the navigation action: ",
        navigationAction
      );
      return AnchorType.None;
    }
    let anchor = AnchorType.None;
    chains.some((chain) => {
      for (let i = 0; i < chain.length; i++) {
        if (chain[i] == currentAnchor) {
          if (i < chain.length - 1) {
            anchor = chain[i + 1];
          } else {
            anchor = chain[i];
          }
          return true;
        }
      }
      return false;
    });
    return anchor;
  }
  /**
   * Find the anchorType based on classes.
   * @param classes list of classes used on a DOM Token
   * @returns The appropriate AnchorType based on the classes list or None if it cannot be determined.
   */
  classesToAnchor(classes) {
    if (classes.contains("top")) {
      if (classes.contains("left")) {
        return AnchorType.RelativeToTopLeft;
      } else if (classes.contains("center")) {
        return AnchorType.RelativeToTop;
      } else if (classes.contains("right")) {
        return AnchorType.RelativeToTopRight;
      }
    } else if (classes.contains("middle")) {
      if (classes.contains("left")) {
        return AnchorType.RelativeToLeft;
      } else if (classes.contains("center")) {
        return AnchorType.RelativeToCenter;
      } else if (classes.contains("right")) {
        return AnchorType.RelativeToRight;
      }
    } else if (classes.contains("bottom")) {
      if (classes.contains("left")) {
        return AnchorType.RelativeToBottomLeft;
      } else if (classes.contains("center")) {
        return AnchorType.RelativeToBottom;
      } else if (classes.contains("right")) {
        return AnchorType.RelativeToBottomRight;
      }
    }
    return AnchorType.None;
  }
  /**
   * Hides the 2D harness if it isn't hidden.
   */
  hideHarness() {
    if (!this.isHarnessHidden) {
      const harnessElements = document.querySelectorAll(".harness");
      harnessElements.forEach((harness) => {
        harness.style.display = "none";
      });
      this.isHarnessHidden = true;
    }
  }
  /**
   * Shows the 2D harness if it isn't visible.
   */
  showHarness() {
    if (this.isHarnessHidden) {
      const harnessElements = document.querySelectorAll(".harness");
      harnessElements.forEach((harness) => {
        harness.style.display = "flex";
      });
      this.isHarnessHidden = false;
    }
  }
  /**
   * Replaces the existing view with the one provided by the template.
   * @param viewID The new view ID being switched.
   * @param template A template element on the DOM
   * @returns true if the layout has been changed
   */
  loadViewTemplate(viewID, template) {
    const harness = ViewManager.getHarness();
    if (harness == null) {
      console.error(`view-manager: Failed finding layout harness to attach layout to from ID. view: '${viewID}'`);
      return false;
    }
    const view = harness.parentElement;
    if (view == null || !view.classList.contains("screen")) {
      console.error(`view-manager: Can not find view element for given ID. view: '${viewID}'`);
      return false;
    }
    document.dispatchEvent(new CustomEvent("close-panel"));
    this.currentViewID = viewID;
    harness.innerHTML = "";
    harness.appendChild(template.content.cloneNode(true));
    view.setAttribute("id", viewID);
    return true;
  }
  /**
   * Switch to another view
   * @param viewID which view to switch to
   * Simple helper function to switch to the active layout in the requested view
   * ***Should only be called from view files***
   */
  switchView(viewID, selector) {
    if (viewID == "" || this.currentViewID == viewID) {
      window.dispatchEvent(new CustomEvent("view-changed"));
      return 1 /* NothingChanged */;
    }
    const experience = UI.getViewExperience();
    let experienceSelector = ".desktop";
    switch (experience) {
      case UIViewExperience.Console:
        experienceSelector = ".console";
        break;
      case UIViewExperience.Handheld:
        experienceSelector = ".handheld";
        break;
      case UIViewExperience.Mobile:
        experienceSelector = ".mobile";
        break;
      case UIViewExperience.VR:
        experienceSelector = ".xr";
        break;
      case UIViewExperience.Desktop:
      default:
        break;
    }
    if (!selector) {
      selector = `.${viewID}`;
    }
    const template = document.querySelector(`template${selector}${experienceSelector}`) ?? document.querySelector(`template${selector}`);
    if (template && this.loadViewTemplate(viewID, template)) {
      UI.viewChanged(viewID);
      return 2 /* ChangesApplied */;
    }
    return 0 /* Error */;
  }
  /**
   * Switch to the empty layout.
   */
  switchToEmptyView() {
    return this.switchView("empty");
  }
}
const ViewManager = new ViewManagerSingleton();

const viewManager = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SwitchViewResult,
	UISystem,
	default: ViewManager
}, Symbol.toStringTag, { value: 'Module' }));

export { Navigation as N, UISystem as U, ViewManager as V, NavigationRule as a, viewManager as v };
//# sourceMappingURL=view-manager.chunk.js.map
