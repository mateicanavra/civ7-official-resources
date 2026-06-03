import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, mergeProps, Show, createRenderEffect, createMemo, createSignal } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { AudioContextProvider } from './audio-context-provider.js';
import { Icon } from './icon.js';
import { L10n } from './l10n.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { IsControllerActive } from '../services/input.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="h-9 w-1\\.5 absolute bg-cover bg-center left-0 -top-1"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="h-9 w-1\\.5 absolute right-0 -top-1 bg-cover bg-center"></div>`);
const CollapsibleHeader = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `w-full h-7 flex flex-row items-center relative group ${props.centerTitle ? "justify-center" : ""}`;
    },
    get style() {
      return {
        "background-color": "rgba(38, 39, 46, 0.55)",
        opacity: props.disabled ? 0.6 : 1
      };
    },
    get onActivate() {
      return props.onActivate;
    },
    name: "Collapsible-Container",
    get children() {
      return [_tmpl$(), (() => {
        var _el$2 = _tmpl$2();
        _el$2.style.setProperty("background-image", "url(blp:base_minitab-endcap)");
        return _el$2;
      })(), createComponent(Show, {
        get when() {
          return props.titleIcon != void 0;
        },
        get children() {
          return createComponent(Icon, {
            "class": "size-6 ml-2 -mr-1 bg-cover bg-center",
            get name() {
              return props.titleIcon;
            }
          });
        }
      }), (() => {
        var _el$3 = _tmpl$3();
        insert(_el$3, createComponent(L10n.Compose, {
          get text() {
            return props.titleText;
          }
        }));
        createRenderEffect(() => className(_el$3, `uppercase text-base text-secondary ml-2 font-title ${props.headerClass}`));
        return _el$3;
      })(), createComponent(Show, {
        get when() {
          return createMemo(() => !!!props.disabled)() && !(props.disableFocus && IsControllerActive());
        },
        get children() {
          var _el$4 = _tmpl$3();
          _el$4.style.setProperty("background-image", "url(blp:base_component-arrow)");
          createRenderEffect(() => className(_el$4, `size-6 absolute right-3 top-0.5 bg-cover bg-center ${!props.isCollapsed() ? "-rotate-90" : ""}`));
          return _el$4;
        }
      }), (() => {
        var _el$5 = _tmpl$4();
        _el$5.style.setProperty("background-image", "url(blp:base_minitab-endcap)");
        return _el$5;
      })()];
    }
  }));
};
function CollapsibleContainerComponent(props) {
  const [isCollapsed, setIsCollapsed] = createSignal(props.initiallyCollapsed ?? false);
  function toggleCollapsed() {
    setIsCollapsed((value) => !value);
  }
  const mergedProps = mergeProps({
    showTitleShadow: true
  }, props);
  return (() => {
    var _el$6 = _tmpl$3();
    insert(_el$6, createComponent(AudioContextProvider, {
      segment: "CollapsibleContainer",
      get vars() {
        return {
          isCollapsed: isCollapsed().toString()
        };
      },
      get children() {
        return createComponent(CollapsibleHeader, mergeProps(() => ({
          isCollapsed,
          titleText: props.titleText,
          titleIcon: props.titleIcon,
          centerTitle: props.centerTitle,
          useShadow: mergedProps.showTitleShadow,
          headerClass: props.headerClass,
          disableFocus: props.disableFocus,
          disabled: props.disabled
        }), {
          get ["class"]() {
            return `relative ${props.class ?? ""}`;
          },
          onActivate: toggleCollapsed
        }));
      }
    }), null);
    insert(_el$6, createComponent(Show, {
      get when() {
        return !isCollapsed();
      },
      get children() {
        return props.children;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `flex flex-col ${props.class ?? ""}`, _v$2 = !!props.disabled;
      _v$ !== _p$.e && className(_el$6, _p$.e = _v$);
      _v$2 !== _p$.t && _el$6.classList.toggle("disabled", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$6;
  })();
}
const CollapsibleContainer = ComponentRegistry.register({
  name: "CollapsibleContainer",
  images: ["blp:base_component-arrow", "blp:base_minitab-endcap"],
  createInstance: CollapsibleContainerComponent
});

export { CollapsibleContainer };
//# sourceMappingURL=collapsible-container.js.map
