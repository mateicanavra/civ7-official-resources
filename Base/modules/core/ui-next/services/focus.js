import { createSignal, createMemo, onCleanup, createContext, useContext, createEffect, on } from '../../vendor/solid-js/dist/solid.js';
import { IsControllerActive } from './input.js';
import { createArraySignal } from '../utilities/solid-utilities.js';

const [solidFocus, setSolidFocus] = createSignal(null, {
  // Always trigger a signal update
  equals: false
});
const currentSolidFocus = solidFocus;
function buildFocusChain(element, target = document.body) {
  const chain = [];
  while (element && element != target) {
    if (element.hasAttribute("tabindex")) {
      chain.push(new WeakRef(element));
    }
    element = element.parentElement;
  }
  chain.push(new WeakRef(target));
  return chain;
}
function isFocusableAFocusContext(focusable) {
  return focusable instanceof FocusContextProvider;
}
function getFocusableElement(focusable) {
  return isFocusableAFocusContext(focusable) ? focusable.element : focusable;
}
function getTabIndex(element) {
  return Number(getFocusableElement(element)?.getAttribute("tabindex") ?? 0);
}
const FocusSortOrders = {
  /**
   * The default way to sort focusbles, which sorts by tabIndex.
   * If tabIndex is set to -1, it will be reassigned based on the insertion order into the navigation tree.
   * This should be used for any place where order is relatively static or can be easily calculated
   * @param children The children to sort
   */
  byIndex: (children) => {
    children.sort((a, b) => getTabIndex(a) - getTabIndex(b));
  },
  /**
   * Sorts children by DOM order - this is useful for controls which dynamically add/remove/move child components
   * This is a more expensive operation than index sorting, so it should only be used in dynamic contexts.
   * @param children The children to sort
   */
  byDomOrder: (children) => {
    children.sort((a, b) => {
      const ae = getFocusableElement(a);
      const be = getFocusableElement(b);
      if (!ae || !be) {
        console.warn("FocusSortOrders.byDomOrder failed - no element was associated with a focus context.");
        return 0;
      }
      if (ae === be) {
        return 0;
      }
      const position = ae.compareDocumentPosition(be);
      if (position & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY)) {
        return -1;
      } else if (position & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS)) {
        return 1;
      }
      return 0;
    });
  }
};
const DefaultNavigationRules = {
  /**
   * Navigates based on up/down input
   */
  vertical: /* @__PURE__ */ new Map([
    [InputNavigationAction.UP, (context) => context.focusPrevious()],
    [InputNavigationAction.DOWN, (context) => context.focusNext()],
    [InputNavigationAction.NONE, (context) => context.focusCurrent()]
  ]),
  verticalReversed: /* @__PURE__ */ new Map([
    [InputNavigationAction.UP, (context) => context.focusNext()],
    [InputNavigationAction.DOWN, (context) => context.focusPrevious()],
    [InputNavigationAction.NONE, (context) => context.focusCurrent()]
  ]),
  /**
   * Navigates based on left/right input
   */
  horizontal: /* @__PURE__ */ new Map([
    [InputNavigationAction.LEFT, (context) => context.focusPrevious()],
    [InputNavigationAction.RIGHT, (context) => context.focusNext()],
    [InputNavigationAction.NONE, (context) => context.focusCurrent()]
  ]),
  horizontalReversed: /* @__PURE__ */ new Map([
    [InputNavigationAction.LEFT, (context) => context.focusNext()],
    [InputNavigationAction.RIGHT, (context) => context.focusPrevious()],
    [InputNavigationAction.NONE, (context) => context.focusCurrent()]
  ])
};
const ENABLE_DEBUG_LOGGING = false;
const logDebug = (...args) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.debug(...args);
  }
};
const focusableToString = (focusable) => {
  if (focusable instanceof HTMLElement) {
    return `HTMLElement(${focusable.dataset.name || focusable.id || focusable.className})`;
  } else {
    return `FocusContextProvider(${focusable.contextName})[${focusable.currentFocusIndex()}]`;
  }
};
class FocusContextProvider {
  /**
   *
   * @param _element Constructs a focus context provider
   * @param navigationHandler
   * @param sortChildren
   */
  constructor(_element, navigationHandler, _contextName, sortChildren = FocusSortOrders.byIndex) {
    this._element = _element;
    this.navigationHandler = navigationHandler;
    this._contextName = _contextName;
    this.sortChildren = sortChildren;
    const parent = useFocusContext();
    const [currentFocusIndex, setCurrrentFocusIndex] = createSignal(-1);
    this._currentFocusIndex = currentFocusIndex;
    this._setCurrentFocusIndex = setCurrrentFocusIndex;
    const [children, mutateChildren] = createArraySignal([]);
    this._children = children;
    this._mutateChildren = mutateChildren;
    this._hasChildren = createMemo(() => this._children().length > 0);
    this._currentFocus = createMemo(() => this._children()[this._currentFocusIndex()]);
    if (parent && parent != this) {
      parent.register(this);
    }
    onCleanup(() => parent?.unregister(this));
  }
  _currentFocusIndex;
  _setCurrentFocusIndex;
  _children;
  _mutateChildren;
  _hasChildren;
  _currentFocus;
  /**
   * True if this context has children and false otherwise
   */
  get hasChildren() {
    return this._hasChildren;
  }
  /**
   * The sorted, registered children of this component.
   */
  get children() {
    return this._children;
  }
  /**
   * Gets the current index in children that this context is targeting
   * Use tryApplyFocus or trySetFocus to set the current focus index
   */
  get currentFocusIndex() {
    return this._currentFocusIndex;
  }
  /**
   * The current focused element that this context is targeting
   */
  get currentFocus() {
    return this._currentFocus;
  }
  /**
   * Gets the host element
   */
  get element() {
    return this._element();
  }
  get contextName() {
    return this._contextName;
  }
  /**
   * Registers a focusable as a child of this context
   * Elements which are later disabled, hidden or othewise become not available should be unregistered.
   * @param focusable
   * @returns
   */
  register(focusable) {
    if (!focusable) {
      return;
    }
    const foundindex = this._children().indexOf(focusable);
    if (foundindex >= 0) {
      const element = getFocusableElement(focusable);
      logDebug(
        `Component tried to register as focusable multiple times - ${element?.dataset.name}|${element?.className}`
      );
      return;
    }
    logDebug(`FocusContextProvider.register ${focusableToString(this)} -> ${focusableToString(focusable)}`);
    this._mutateChildren((children) => {
      children.push(focusable);
      this.sortChildren(children);
    });
    if (this._children().length > 1 && document.activeElement == this._element()) {
      this.focusCurrentOrDefault();
    }
  }
  /**
   * Unregisteres a focusable as a child of this context
   * @param focusable
   * @returns
   */
  unregister(focusable) {
    if (!focusable) {
      return;
    }
    const foundindex = this._children().indexOf(focusable);
    if (foundindex < 0) {
      return;
    }
    const activeFocusRemoved = this._currentFocusIndex() == foundindex;
    this._mutateChildren((children) => {
      children.splice(foundindex, 1);
    });
    if (this._currentFocusIndex() >= foundindex || this._currentFocusIndex() >= this._children().length) {
      this._setCurrentFocusIndex((i) => i - 1);
    }
    if (activeFocusRemoved && getFocusableElement(focusable) == document.activeElement) {
      this.focusCurrent();
    }
  }
  /**
   * Propagates navigation events to the registered handler
   * How this is handled is dependent on the component's rules
   * @param action
   * @returns
   */
  navigate(action) {
    logDebug(`FocusContextProvider.navigate called on ${focusableToString(this)}`);
    return this.navigationHandler(this, action);
  }
  trySetFocus(index) {
    if (index >= this._children().length || index < 0) {
      logDebug(`FocusContextProvider.trySetFocus failed - index out of range (${index})`);
      return false;
    }
    logDebug(`FocusContextProvider.trySetFocus ${focusableToString(this)} to index ${index}`);
    logDebug(`	New focus: ${focusableToString(this._children()[index])}`);
    this._setCurrentFocusIndex(index);
    return true;
  }
  /**
   * Tries to set focus to a specific index, the applies DOM focus to the element
   * @param index
   * @returns true if the focus application was successful
   */
  tryApplyFocus(index, applyDomFocus = true) {
    if (this.trySetFocus(index)) {
      if (IsControllerActive()) {
        const focusable = this._children()[index];
        const focusableElement = getFocusableElement(focusable);
        if (focusableElement && applyDomFocus) {
          setSolidFocus(focusableElement);
        }
      }
      return true;
    }
    return false;
  }
  /**
   * Reapplies focus to the currently focused child
   * @returns
   */
  focusCurrent() {
    return this.tryApplyFocus(this._currentFocusIndex());
  }
  /**
   * Reapplies focus to the currently focused child
   * @returns
   */
  focusCurrentOrDefault() {
    if (this._currentFocusIndex() < 0 && this._hasChildren()) {
      this._setCurrentFocusIndex(0);
    }
    return this.tryApplyFocus(this._currentFocusIndex());
  }
  /**
   * Attempts to applies focus to the next element
   * @returns true if the focus update was sucessful and false otherwise
   */
  focusNext() {
    for (let curIndex = this._currentFocusIndex() + 1; curIndex < this._children().length; curIndex++) {
      if (this.tryApplyFocus(curIndex)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Attempts to applies focus to the previous element
   * @returns true if the focus update was sucessful and false otherwise
   */
  focusPrevious() {
    for (let curIndex = this._currentFocusIndex() - 1; curIndex >= 0; curIndex--) {
      if (this.tryApplyFocus(curIndex)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Manually focus a specific child focusable
   *
   * The element or context MUST be a registered child of this context or this will fail.
   *
   * @param focusable The focusable to set focus to, must be a registered child of this context
   * @returns true if the focus update was successful and false otherwise
   */
  focusChild(focusable, applyDomFocus = true) {
    if (!focusable) {
      return false;
    }
    const index = this.children().indexOf(focusable);
    logDebug(
      `FocusContextProvider.focusChild called for ${focusableToString(this)} -> ${focusableToString(focusable)}`
    );
    if (index < 0) {
      console.error(
        "FocusContextProvider.focusChild was called with a focusable that is not a child of this context."
      );
      return false;
    }
    return this.tryApplyFocus(index, applyDomFocus);
  }
  /**
   * Manually focus a specific child descendant
   *
   * The element or context MUST be a registered descendant of this context or this will fail.
   *
   * @param focusable The focusable to set focus to, must be a registered child of this context
   * @returns true if the focus update was successful and false otherwise
   */
  focusDescendant(focusable, applyDomFocus = true) {
    if (!focusable) {
      return false;
    }
    const element = getFocusableElement(focusable);
    if (!element) {
      return false;
    }
    let treeContext = this;
    let hasContext = true;
    while (hasContext) {
      hasContext = false;
      for (const child of treeContext.children()) {
        if (getFocusableElement(child) == element) {
          treeContext.focusChild(child, applyDomFocus);
          return true;
        } else if (isFocusableAFocusContext(child) && getFocusableElement(child)?.contains(element)) {
          hasContext = true;
          treeContext = child;
        }
      }
    }
    return false;
  }
  getFocuableChildren() {
    return this._children().map((c) => getFocusableElement(c)).filter((c) => c);
  }
}
const rootFocus = new FocusContextProvider(
  () => document.body,
  () => false,
  "root",
  () => false
);
const FocusContext = createContext(rootFocus);
function useFocusContext() {
  try {
    const context = useContext(FocusContext);
    if (!context) {
      throw new Error("Unable to resolve FocusContextProvider");
    }
    return context;
  } catch {
    return void 0;
  }
}
function isFocusable(element, isFocusable2) {
  const focusContext = useContext(FocusContext);
  element.setAttribute("data-focus-context-name", focusContext.contextName);
  createEffect(
    on(
      () => isFocusable2(),
      ([isFocusable3, autoFocus]) => {
        if (element.isConnected && isFocusable3) {
          if (!element.hasAttribute("tabindex")) {
            element.setAttribute("tabindex", "-1");
          }
          focusContext.register(element);
        } else {
          focusContext.unregister(element);
          element.removeAttribute("tabindex");
        }
        if (autoFocus && isFocusable3 && focusContext.hasChildren()) {
          focusContext.focusDescendant(element, true);
        }
      }
    )
  );
  onCleanup(() => focusContext.unregister(element));
}
function isContextFocusable(element, args) {
  const parentContext = useContext(FocusContext);
  createEffect(
    on(args, ([context, isFocusable2, autoFocus]) => {
      if (element.isConnected && isFocusable2) {
        parentContext.register(context);
      } else {
        parentContext.unregister(context);
      }
      if (autoFocus && isFocusable2 && parentContext.hasChildren()) {
        rootFocus.focusDescendant(element, true);
      }
    })
  );
  onCleanup(() => {
    const [context] = args();
    parentContext.unregister(context);
  });
}

export { DefaultNavigationRules, FocusContext, FocusContextProvider, FocusSortOrders, buildFocusChain, currentSolidFocus, focusableToString, getFocusableElement, isContextFocusable, isFocusable, isFocusableAFocusContext, rootFocus, useFocusContext };
//# sourceMappingURL=focus.js.map
