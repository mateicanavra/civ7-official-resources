import { template, use, insert, className, Portal } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createSelector, createContext, useContext, onMount, createComponent, createRenderEffect, createMemo, createEffect, on, Show } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { Panel } from './panel.js';
import { TriggerType, createTrigger } from './trigger.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { FocusManager } from '../services/focus-manager.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
class PopupContextProvider {
  _active;
  _setActive;
  _target;
  _setTarget;
  _isActive;
  _output;
  _setOutput;
  get isActive() {
    return this._isActive;
  }
  get target() {
    return this._target;
  }
  get active() {
    return this._active;
  }
  get output() {
    return this._output;
  }
  constructor() {
    const [target, setTarget] = createSignal();
    this._target = target;
    this._setTarget = setTarget;
    const [active, setActive] = createSignal();
    this._active = active;
    this._setActive = setActive;
    const [output, setOutput] = createSignal();
    this._output = output;
    this._setOutput = setOutput;
    this._isActive = createSelector(this._active);
  }
  setOutput(element) {
    this._setOutput(element);
  }
  close(target) {
    if (!target || target == this.active()) {
      this._setActive(void 0);
      this._setTarget(void 0);
    }
  }
  onTrigger(name, type, target) {
    if (type == TriggerType.Activate && target instanceof HTMLElement) {
      const isNewPopup = this._active == void 0 || name && this._active() != name;
      if (this._active != void 0) {
        this.close();
      }
      if (isNewPopup) {
        this._setActive(name);
        this._setTarget(target);
      }
    }
  }
}
const PopupContext = createContext();
function usePopupContext() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopupContext: Cannot find a Popup Context!");
  }
  return context;
}
const PopupComponent = (props) => {
  const popupContext = new PopupContextProvider();
  onMount(() => {
    props.setPopupContext?.(popupContext);
  });
  return createComponent(PopupContext.Provider, {
    value: popupContext,
    get children() {
      return props.children;
    }
  });
};
const PopupOutput = (props) => {
  let root;
  const context = usePopupContext();
  onMount(() => {
    context.setOutput(root);
  });
  return (() => {
    var _el$ = _tmpl$();
    use((ref) => root = ref, _el$);
    insert(_el$, () => props.children);
    createRenderEffect(() => className(_el$, `pointer-events-none ${props.class ?? ""}`));
    return _el$;
  })();
};
const PopupItem = (props) => {
  const context = usePopupContext();
  const popupName = createMemo(() => `popup-${props.name}`);
  let prevFocus;
  createEffect(on(() => context.active(), (prev, cur) => {
    if (prev == props.name) {
      prevFocus = FocusManager.get().currentFocus();
      props.onOpen?.();
    }
    if (cur == props.name) {
      props.onClose?.();
      if (prevFocus) {
        FocusManager.get().setFocus(prevFocus);
        prevFocus = void 0;
      }
    }
  }));
  return createComponent(Portal, {
    get mount() {
      return context.output();
    },
    get children() {
      return createComponent(Show, {
        get when() {
          return context?.isActive(props.name);
        },
        get children() {
          return [createComponent(Activatable, {
            "class": "fixed inset-0 pointer-events-auto",
            style: {
              "background-color": "#00000080"
            },
            name: "modal-backdrop",
            onActivate: () => context.close()
          }), createComponent(Panel, {
            get id() {
              return popupName();
            },
            get name() {
              return popupName();
            },
            autoFocus: true,
            "class": "fullscreen pointer-events-none flex flex-row items-center justify-center",
            onCancelInput: () => context.close(),
            get children() {
              return props.children;
            }
          })];
        }
      });
    }
  });
};
const Popup = ComponentRegistry.register("Popup", PopupComponent);
Popup.Trigger = ComponentRegistry.register("Popup.Trigger", createTrigger(PopupContext));
Popup.Output = ComponentRegistry.register("Popup.Output", PopupOutput);
Popup.Item = ComponentRegistry.register("Popup.Item", PopupItem);

export { Popup, PopupContext, PopupContextProvider, usePopupContext };
//# sourceMappingURL=popup.js.map
