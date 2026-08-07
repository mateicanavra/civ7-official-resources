import { template, use, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createMemo, createSignal, onMount, onCleanup, createEffect, on, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../ui/context-manager/context-manager.js';
import { InputEngineEvent } from '../../ui/input/input-support.js';
import { SolidAdapterContext } from './fxs-solid-component.js';
import { TooltipModel } from './tooltip-model.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { FocusManager } from '../services/focus-manager.js';
import { DefaultNavigationRules, isFocusableAFocusContext, FocusContextProvider, isContextFocusable, FocusContext } from '../services/focus.js';
import { HotkeyContextProvider, useHotkeyContext, HotkeyContext } from '../services/hotkey.js';
import { EngineInputProxyProvider, ActiveInputDevice, EngineInputProxyContext } from '../services/input.js';
import { createPropsRefSignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
class PanelStackContextProvider {
  constructor(onChildClosed) {
    this.onChildClosed = onChildClosed;
  }
  triggerChildClosed() {
    this.onChildClosed();
  }
}
const PanelStackContext = createContext();
const NAV_REPEAT_INITIAL_THRESHOLD = 400;
const NAV_REPEAT_THRESHOLD = 150;
const PanelComponent = (props) => {
  const adapterContext = useContext(SolidAdapterContext);
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const hotkeyProvider = new HotkeyContextProvider(useHotkeyContext());
  const engineInputProxyProvider = new EngineInputProxyProvider();
  const resolvedNavRules = createMemo(() => props.navRules ?? DefaultNavigationRules.vertical);
  const useAutoFocus = createMemo(() => props.autoFocus ?? true);
  const [isActiveContext, setIsActiveContext] = createSignal(false);
  let navRepeatThreshold = 0;
  let navRepeatTimestamp = 0;
  const onClosePanel = () => {
    ContextManager.pop(props.id);
  };
  const parentStackContext = useContext(PanelStackContext);
  function handleContextChanged(args) {
    const isActive = args.detail.activatedElement == adapterContext?.rootElement;
    setIsActiveContext(isActive);
    if (props.onContextChanged) {
      props.onContextChanged(args.detail.activatedElement, args.detail.deactivatedElement);
    }
  }
  const stackProvider = new PanelStackContextProvider(applyContext);
  onMount(() => {
    document.addEventListener("close-panel", onClosePanel);
    engine.on("OnContextManagerChanged", handleContextChanged);
    hotkeyProvider.mount();
    applyContext(false);
  });
  onCleanup(() => {
    document.removeEventListener("close-panel", onClosePanel);
    engine.off("OnContextManagerChanged", handleContextChanged);
    hotkeyProvider.cleanup();
    parentStackContext?.triggerChildClosed();
  });
  const navigationHandler = (context, action) => {
    const curFocus = context.currentFocus();
    if (isFocusableAFocusContext(curFocus)) {
      if (curFocus.navigate(action)) {
        return true;
      }
    }
    if (resolvedNavRules().get(action)?.(context)) {
      return true;
    }
    context.focusCurrentOrDefault();
    return true;
  };
  const focusProvider = new FocusContextProvider(root, navigationHandler, props.name);
  createEffect(on(() => [ActiveInputDevice(), focusProvider.hasChildren(), isActiveContext()], ([device, hasChildren], prev) => {
    const isController = device == InputDeviceType.Controller;
    if (isController && hasChildren) {
      const sameDevice = device == prev?.[0];
      const curFocus = FocusManager.get().currentFocus();
      const isCurFocusSolidFocus = curFocus?.hasAttribute("data-focus-context-name");
      const isBodyFocus = curFocus == document.body;
      if (sameDevice || !curFocus || isCurFocusSolidFocus || isBodyFocus) {
        hotkeyProvider.refresh();
        focusProvider.focusCurrentOrDefault();
      }
    }
  }));
  function applyContext(applyFocus = true) {
    if (applyFocus) {
      focusProvider.focusCurrentOrDefault();
    }
    if (props.inputContext) {
      Input.setActiveContext(props.inputContext);
    }
    if (adapterContext?.rootElement) {
      adapterContext.rootElement.dispatchEvent = (e) => root()?.dispatchEvent(e) ?? false;
    }
  }
  function onNavigate(navigationEvent) {
    if (hotkeyProvider.onInput(navigationEvent)) {
      return;
    }
    if (navigationEvent.detail.status == InputActionStatuses.START) {
      navRepeatThreshold = NAV_REPEAT_INITIAL_THRESHOLD;
      navRepeatTimestamp = Date.now();
      return;
    } else if (navigationEvent.detail.status == InputActionStatuses.UPDATE) {
      const now = Date.now();
      if (navRepeatThreshold > 0 && now >= navRepeatTimestamp + navRepeatThreshold) {
        navRepeatThreshold = NAV_REPEAT_THRESHOLD;
        navRepeatTimestamp = now;
      } else {
        return;
      }
    } else if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
      navRepeatThreshold = 0;
      navRepeatTimestamp = 0;
    } else {
      return;
    }
    if (focusProvider.navigate(navigationEvent.detail.navigation)) {
      navigationEvent.preventDefault();
      navigationEvent.stopPropagation();
    }
  }
  function onEngineInput(event) {
    if (hotkeyProvider.onInput(event)) {
      return;
    }
    if ((event.isCancelInput() || event.detail.name == "keyboard-escape") && event.detail.status == InputActionStatuses.FINISH) {
      const tooltipModel = TooltipModel.get();
      if (tooltipModel.locked()) {
        tooltipModel.unlockAll();
      } else if (props.onCancelInput) {
        props.onCancelInput();
      } else {
        ContextManager.pop(ContextManager.getCurrentTarget());
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const activeElement = document.activeElement;
    const isControllerEvent = !(event.detail.isMouse || event.detail.isTouch);
    let proxyEvent = event;
    if (isControllerEvent) {
      if (activeElement?.getAttribute("data-focus-context-name") == props.name) {
        proxyEvent = InputEngineEvent.CreateNewEvent(event, false);
        activeElement.dispatchEvent(proxyEvent);
      }
    }
    if (!event.defaultPrevented) {
      engineInputProxyProvider.triggerEngineInput(event);
    }
  }
  return (() => {
    var _el$ = _tmpl$();
    use(isContextFocusable, _el$, () => [focusProvider, true, useAutoFocus()]);
    use(setRoot, _el$);
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `pointer-events-auto ${props.class}`;
      },
      get ["data-name"]() {
        return props.name;
      },
      "tabIndex": -1,
      "on:navigate-input": onNavigate,
      "on:engine-input": onEngineInput,
      "onFocus": () => applyContext()
    }), false, true);
    insert(_el$, createComponent(PanelStackContext.Provider, {
      value: stackProvider,
      get children() {
        return createComponent(FocusContext.Provider, {
          value: focusProvider,
          get children() {
            return createComponent(EngineInputProxyContext.Provider, {
              value: engineInputProxyProvider,
              get children() {
                return createComponent(HotkeyContext.Provider, {
                  value: hotkeyProvider,
                  get children() {
                    return props.children;
                  }
                });
              }
            });
          }
        });
      }
    }));
    return _el$;
  })();
};
const Panel = ComponentRegistry.register("Panel", PanelComponent);

export { Panel, PanelStackContext, PanelStackContextProvider };
//# sourceMappingURL=panel.js.map
