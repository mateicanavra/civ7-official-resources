import { t as template, W as isContextFocusable, J as createPropsRefSignal, X as isFocusableAFocusContext, y as useContext, Q as FocusContext, Y as FocusContextProvider, h as createMemo, u as use, k as spread, m as mergeProps, i as insert, e as createComponent, C as ComponentRegistry, Z as DefaultNavigationRules, o as onMount, d as onCleanup } from './panel.chunk.js';
import { S as SpatialWrap } from '../../ui/spatial/spatial-manager.js';
import FocusManager from '../../ui/input/focus-manager.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const PROTECTED_IMPORTS = [isContextFocusable];
const SlotComponent = (props) => {
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const navigationHandler = (context, action) => {
    if (props.disabled || props.disableFocus) {
      return false;
    }
    const curFocus = context.currentFocus;
    if (isFocusableAFocusContext(curFocus)) {
      if (curFocus.navigate(action)) {
        return true;
      }
    }
    if (props.navRules.get(action)?.(context)) {
      return true;
    }
    return false;
  };
  const parentContext = useContext(FocusContext);
  const focusContext = new FocusContextProvider(root, navigationHandler, parentContext.contextName, props.sortOrder);
  const isFocusable = createMemo(() => !props.disabled && !props.disableFocus && focusContext.hasChildren());
  return (() => {
    var _el$ = _tmpl$();
    use(isContextFocusable, _el$, () => [focusContext, isFocusable()]);
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
    name: "VSlot"
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
    name: "HSlot"
  }));
};
const HSlot = ComponentRegistry.register("HSlot", HSlotComponent);
const SpatialSlotComponent = (props) => {
  const ref = void 0;
  function spatialNavigate(direction) {
    return (context) => SpatialWrap.navigate(props.name, context.getFocuableChildren(), direction);
  }
  const spatialNavigationRules = /* @__PURE__ */ new Map([[InputNavigationAction.UP, spatialNavigate("up")], [InputNavigationAction.DOWN, spatialNavigate("down")], [InputNavigationAction.LEFT, spatialNavigate("left")], [InputNavigationAction.RIGHT, spatialNavigate("right")], [InputNavigationAction.NONE, (context) => context.focusCurrent()]]);
  function onElementUnfocused(event) {
    if (!event.detail.native && event.detail.nextElement) {
      FocusManager.setFocus(event.detail.nextElement);
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
    name: "SpatialSlot",
    navRules: spatialNavigationRules
  }));
};
const SpatialSlot = ComponentRegistry.register("SpatialSlot", SpatialSlotComponent);

export { HSlot as H, VSlot as V };
//# sourceMappingURL=slot.chunk.js.map
