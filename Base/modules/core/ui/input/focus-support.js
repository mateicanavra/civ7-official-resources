import { isSlot } from '../components/fxs-slot.js';
import ContextManager from '../context-manager/context-manager.js';
import { Navigation } from './navigation-support.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';

var Focus;
((Focus2) => {
  function setContextAwareFocus(target, context) {
    if (!target || !context) {
      console.error("FM: Attempt to set focus to an element that doesnt exist.");
      return;
    }
    const focusManager = FocusManager.get();
    if (target.isSameNode(focusManager.currentFocus())) {
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
        focusManager.setFocus(target);
      }
    });
  }
  Focus2.setContextAwareFocus = setContextAwareFocus;
})(Focus || (Focus = {}));

export { Focus };
//# sourceMappingURL=focus-support.js.map
