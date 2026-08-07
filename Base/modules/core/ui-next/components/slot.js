import { template, use, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, mergeProps, createComponent, onCleanup } from '../../vendor/solid-js/dist/solid.js';
import SpatialWrap from '../../ui/external/js-spatial-navigation/spatial-wrapper.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { isContextFocusable, isFocusableAFocusContext, FocusContextProvider, FocusContext, DefaultNavigationRules } from '../services/focus.js';
import { createPropsRefSignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const PROTECTED_IMPORTS = [isContextFocusable];
const SlotComponent = (props) => {
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const navigationHandler = (context, action) => {
    if (props.disabled || props.disableFocus) {
      return false;
    }
    const curFocus = context.currentFocus();
    if (isFocusableAFocusContext(curFocus)) {
      if (curFocus.navigate(action)) {
        return true;
      }
    }
    if (props.navRules.get(action)?.(context)) {
      return true;
    }
    if (props.lockNavigation) {
      return true;
    }
    return false;
  };
  const focusContext = new FocusContextProvider(root, navigationHandler, props.name ?? "Slot", props.sortOrder);
  const isFocusable = createMemo(() => !props.disabled && !props.disableFocus && focusContext.hasChildren());
  onMount(() => props.setFocusContext?.(focusContext));
  return (() => {
    var _el$ = _tmpl$();
    use(isContextFocusable, _el$, () => [focusContext, isFocusable(), props.autoFocus]);
    use(setRoot, _el$);
    spread(_el$, mergeProps(props, {
      get classList() {
        return {
          ...props.classList,
          disabled: props.disabled
        };
      },
      get ["data-name"]() {
        return props.name ?? "Slot";
      },
      get tabIndex() {
        return props.tabIndex ?? -1;
      },
      "on:focus": () => focusContext.focusCurrentOrDefault()
    }), false, true);
    insert(_el$, createComponent(FocusContext.Provider, {
      value: focusContext,
      get children() {
        return props.children;
      }
    }));
    return _el$;
  })();
};
const Slot = ComponentRegistry.register("Slot", SlotComponent);
const VSlotComponent = (props) => {
  return createComponent(Slot, mergeProps(props, {
    get navRules() {
      return props.isNavigationReversed ? DefaultNavigationRules.verticalReversed : DefaultNavigationRules.vertical;
    },
    get ["class"]() {
      return `flex flex-col ${props.class ?? ""}`;
    },
    get name() {
      return props.name ? `${props.name}(VSlot)` : "VSlot";
    }
  }));
};
const VSlot = ComponentRegistry.register("VSlot", VSlotComponent);
const HSlotComponent = (props) => {
  return createComponent(Slot, mergeProps(props, {
    get navRules() {
      return props.isNavigationReversed ? DefaultNavigationRules.horizontalReversed : DefaultNavigationRules.horizontal;
    },
    get ["class"]() {
      return `flex flex-row ${props.class ?? ""}`;
    },
    get name() {
      return props.name ? `${props.name}(HSlot)` : "HSlot";
    }
  }));
};
const HSlot = ComponentRegistry.register("HSlot", HSlotComponent);
const SpatialSlotComponent = (props) => {
  let ref;
  let focusContext = void 0;
  function spatialNavigate(direction, context) {
    if (!focusContext) {
      focusContext = context;
    }
    const lastFocus = document.activeElement;
    SpatialWrap.navigate(props.name, context.getFocuableChildren(), direction);
    const navSucceeded = lastFocus != document.activeElement;
    return navSucceeded;
  }
  const spatialNavigationRules = /* @__PURE__ */ new Map([[InputNavigationAction.UP, (context) => spatialNavigate("up", context)], [InputNavigationAction.DOWN, (context) => spatialNavigate("down", context)], [InputNavigationAction.LEFT, (context) => spatialNavigate("left", context)], [InputNavigationAction.RIGHT, (context) => spatialNavigate("right", context)], [InputNavigationAction.NONE, (context) => context.focusCurrent()]]);
  function onElementUnfocused(event) {
    if (!event.detail.native && event.detail.nextElement) {
      const target = event.detail.nextElement;
      focusContext?.focusChild(target);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  onMount(() => {
    ref.setAttribute("sectionId", props.name);
    ref.addEventListener("sn:willunfocus", onElementUnfocused);
  });
  onCleanup(() => {
    ref.removeEventListener("sn:willunfocus", onElementUnfocused);
  });
  return createComponent(Slot, mergeProps(props, {
    ref: (e) => {
      ref = e;
    },
    get name() {
      return `${props.name}(SpatialSlot)`;
    },
    navRules: spatialNavigationRules,
    get autoFocus() {
      return props.autoFocus;
    }
  }));
};
const SpatialSlot = ComponentRegistry.register("SpatialSlot", SpatialSlotComponent);

export { HSlot, PROTECTED_IMPORTS, Slot, SpatialSlot, VSlot };
//# sourceMappingURL=slot.js.map
