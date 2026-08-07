import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { MetalCardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { NavHelp } from '../../../../core/ui-next/components/nav-help.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative font-title text-center uppercase text-secondary mb-1"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0 metal-card-frame-bg-hover"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="size-8 absolute bg-contain bg-center bg-no-repeat"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class="relative overflow-hidden w-full min-h-32 p-3 flex flex-col items-center text-xs"><div class="absolute inset-0"></div><div class="flex relative flex-auto items-center font-fit-shrink text-center overflow-hidden"></div></div></div>`);
const DedicationCardContents = (props) => {
  return (() => {
    var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling;
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.title != void 0;
      },
      get children() {
        var _el$4 = _tmpl$();
        insert(_el$4, createComponent(L10n.Stylize, {
          get text() {
            return props.title || "";
          }
        }));
        return _el$4;
      }
    }), _el$5);
    insert(_el$5, createComponent(Show, {
      get when() {
        return IsControllerActive() || !props.isDisplayOnly;
      },
      get fallback() {
        return createComponent(L10n.Stylize, {
          get text() {
            return props.description;
          }
        });
      },
      get children() {
        return createComponent(L10n.Stylize, {
          get text() {
            return props.description;
          },
          disableTooltips: true,
          get ["class"]() {
            return `${!props.isDisplayOnly ? "dedication-card-no-tooltip" : ""}`;
          }
        });
      }
    }));
    insert(_el$, createComponent(MetalCardFrame, {
      get onMouseEnter() {
        return props.isDisplayOnly ? void 0 : props.onHover;
      },
      get onMouseLeave() {
        return props.isDisplayOnly ? void 0 : props.onDehover;
      },
      get ["class"]() {
        return `absolute -inset-1 flex justify-center items-center relative ${props.isDisplayOnly ? "pointer-events-none" : ""}`;
      },
      get children() {
        var _el$6 = _tmpl$2();
        createRenderEffect(() => _el$6.classList.toggle("invisible", !(props.isHover?.() || props.isDragging?.())));
        return _el$6;
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.icon != void 0;
      },
      get children() {
        var _el$7 = _tmpl$3();
        _el$7.style.setProperty("top", "-1rem");
        createRenderEffect((_$p) => (_$p = props.icon || "") != null ? _el$7.style.setProperty("background-image", _$p) : _el$7.style.removeProperty("background-image"));
        return _el$7;
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.isHover?.();
      },
      get children() {
        return createComponent(NavHelp, {
          "class": "absolute -top-5 translate-x-full"
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `relative flex justify-center w-72 min-h-32 ${props.contentClass || ""}`, _v$2 = props.background || "", _v$3 = props.isHover?.() || props.isDragging?.() ? "brightness(1.5)" : "brightness(1.0)";
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$3.style.setProperty("background-image", _v$2) : _el$3.style.removeProperty("background-image"));
      _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$3.style.setProperty("filter", _v$3) : _el$3.style.removeProperty("filter"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};

export { DedicationCardContents };
//# sourceMappingURL=dedication-card-contents.js.map
