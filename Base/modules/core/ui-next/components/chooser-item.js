import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, mergeProps, createRenderEffect, Show } from '../../vendor/solid-js/dist/solid.js';
import { ChooserItemSelectedEvent } from '../../ui/components/fxs-chooser-item.js';
import { Activatable } from './activatable.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="fxs-chooser-item-highlight absolute inset-0"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="fxs-chooser-item-selected img-list-focus-frame absolute inset-0"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 opacity-70 pointer-events-none bg-primary-5"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="fxs-chooser-item-lock-image absolute bg-cover"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="relative flex self-center items-center justify-center pointer-events-none size-19"><div class="fxs-chooser-item-icon-image relative flex flex-col items-center"><div class="fxs-chooser-item-lock-bg absolute inset-0"></div></div><div class="fxs-chooser-item-icon-bg absolute"></div></div>`);
const ChooserItemComponent = (props) => {
  const [isSelected, setIsSelected] = createSignal(false);
  let hostRef;
  const canSelect = () => (props.selectableWhenDisabled || !props.disabled) ?? true;
  const dispatchLegacySelectedEvent = () => {
    if (!hostRef) return true;
    return hostRef.dispatchEvent(new ChooserItemSelectedEvent());
  };
  const triggerSelect = () => {
    if (!canSelect()) return;
    if (!isSelected()) {
      setIsSelected(true);
      props.onSelect?.();
    }
  };
  const onFocus = () => {
    props.onFocus?.();
    if (props.selectOnFocus) {
      triggerSelect();
    }
  };
  const onActivate = () => {
    if (props.selectOnActivate) {
      triggerSelect();
      if (!props.onActivate) {
        dispatchLegacySelectedEvent();
        return;
      }
    }
    props.onActivate?.();
  };
  createEffect(() => setIsSelected(!!props.selected));
  const showFrameOnHover = () => props.showFrameOnHover ?? true;
  const showColorBg = () => props.showColorBg ?? true;
  const setRef = (el) => {
    hostRef = el;
    props.ref?.(el);
  };
  return createComponent(Activatable, mergeProps(props, {
    ref: setRef,
    get name() {
      return props.name ?? "ChooserItem";
    },
    onActivate,
    onFocus,
    get ["class"]() {
      return `fxs-chooser-item flex justify-stretch items-stretch relative ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "hud_sidepanel_list-bg": showColorBg()
      };
    },
    get children() {
      return [_tmpl$(), (() => {
        var _el$2 = _tmpl$2();
        createRenderEffect((_p$) => {
          var _v$ = !!isSelected(), _v$2 = !!showFrameOnHover();
          _v$ !== _p$.e && _el$2.classList.toggle("selected", _p$.e = _v$);
          _v$2 !== _p$.t && _el$2.classList.toggle("show-on-hover", _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$2;
      })(), (() => {
        var _el$3 = _tmpl$3();
        insert(_el$3, createComponent(Show, {
          get when() {
            return typeof props.icon === "string" ? props.icon : false;
          },
          children: (value) => (() => {
            var _el$5 = _tmpl$6(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild;
            insert(_el$6, createComponent(Show, {
              get when() {
                return props.iconLocked;
              },
              get children() {
                return _tmpl$5();
              }
            }), null);
            createRenderEffect((_$p) => (_$p = `url(${value()})`) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
            return _el$5;
          })()
        }), null);
        insert(_el$3, createComponent(Show, {
          get when() {
            return typeof props.icon !== "string" ? props.icon : false;
          },
          children: (value) => value()
        }), null);
        insert(_el$3, () => props.children, null);
        createRenderEffect(() => className(_el$3, `hud_sidepanel_list-bg-no-fill relative flex flex-auto ${props.contentClass ?? ""}`));
        return _el$3;
      })(), createComponent(Show, {
        get when() {
          return props.disabled;
        },
        get children() {
          return _tmpl$4();
        }
      })];
    }
  }));
};
const ChooserItem = ComponentRegistry.register({
  name: "ChooserItem",
  createInstance: ChooserItemComponent,
  images: ["blp:hud_sidepanel_list-bg", "blp:hud_list-focus_frame"]
});

export { ChooserItem };
//# sourceMappingURL=chooser-item.js.map
