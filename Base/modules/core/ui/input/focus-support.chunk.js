import { i as isSlot } from '../components/fxs-slot.chunk.js';
import ContextManager from '../context-manager/context-manager.js';
import FocusManager from './focus-manager.js';
import { N as Navigation } from '../views/view-manager.chunk.js';

var Focus;
((Focus2) => {
  function setContextAwareFocus(target, context) {
    if (!target || !context) {
      console.error("FM: Attempt to set focus to an element that doesnt exist.");
      return;
    }
    if (target.isSameNode(FocusManager.getFocus())) {
      return;
    }
    waitForLayout(() => {
      let focusableDescendant = Navigation.isFocusable(target) ? target : null;
      let parent = target.parentElement;
      const curContext = ContextManager.getCurrentTarget();
      const hasContext = !curContext || curContext.contains(target);
      while (parent != null && parent != context) {
        if (focusableDescendant && isSlot(parent)) {
          parent.maybeComponent?.setInitialFocus(focusableDescendant);
        }
        if (Navigation.isFocusable(parent)) {
          focusableDescendant = parent;
        } else if (!Navigation.shouldCheckChildrenFocusable(parent)) {
          focusableDescendant = null;
        }
        parent = parent.parentElement;
      }
      if (hasContext) {
        FocusManager.setFocus(target);
      }
    });
  }
  Focus2.setContextAwareFocus = setContextAwareFocus;
})(Focus || (Focus = {}));

export { Focus as F };
//# sourceMappingURL=focus-support.chunk.js.map
