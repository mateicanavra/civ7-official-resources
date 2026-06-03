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

export { Navigation, NavigationRule };
//# sourceMappingURL=navigation-support.js.map
