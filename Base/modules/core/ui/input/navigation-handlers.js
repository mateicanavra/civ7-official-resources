import { Navigation } from './navigation-support.js';
import Spatial from '../spatial/spatial-manager.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';

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
      FocusManager.get().setFocus(sibling);
      return false;
    }
    return true;
  }
  NavigationHandlers2.handlerEscapeNext = handlerEscapeNext;
  function handlerStopNext(focusElement, props) {
    const sibling = Navigation.getNextFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.get().setFocus(sibling);
    }
    return false;
  }
  NavigationHandlers2.handlerStopNext = handlerStopNext;
  function handlerWrapNext(focusElement, props) {
    const sibling = Navigation.getNextFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.get().setFocus(sibling);
      return false;
    }
    const parentSlot = Navigation.getParentSlot(focusElement);
    if (!parentSlot) {
      console.error("navigation-support: handlerWrapNext(): no parent slot was found");
      return false;
    }
    const wrapSibling = Navigation.getFirstFocusableElement(parentSlot, props);
    if (wrapSibling != null) {
      FocusManager.get().setFocus(wrapSibling);
    }
    return false;
  }
  NavigationHandlers2.handlerWrapNext = handlerWrapNext;
  function handlerEscapePrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.get().setFocus(sibling);
      return false;
    }
    return true;
  }
  NavigationHandlers2.handlerEscapePrevious = handlerEscapePrevious;
  function handlerStopPrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.get().setFocus(sibling);
    }
    return false;
  }
  NavigationHandlers2.handlerStopPrevious = handlerStopPrevious;
  function handlerWrapPrevious(focusElement, props) {
    const sibling = Navigation.getPreviousFocusableElement(focusElement, props);
    if (sibling != null) {
      FocusManager.get().setFocus(sibling);
      return false;
    }
    const parentSlot = Navigation.getParentSlot(focusElement);
    if (!parentSlot) {
      console.error("navigation-support: handlerWrapPrevious(): no parent slot was found");
      return false;
    }
    const wrapSibling = Navigation.getLastFocusableElement(parentSlot, props);
    if (wrapSibling != null) {
      FocusManager.get().setFocus(wrapSibling);
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

export { NavigationHandlers };
//# sourceMappingURL=navigation-handlers.js.map
