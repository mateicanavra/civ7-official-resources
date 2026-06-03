import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { L10n } from './l10n.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="text-secondary self-start mr-3"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex text-secondary self-end"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div data-name=Progress-Bar><div class="flex flex-row w-full mb-2"></div><div class="w-full h-4"><div class="h-3 py-0\\.5 self-start"></div></div></div>`);
const ProgressBar = (props) => {
  return (() => {
    var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$5 = _el$2.nextSibling, _el$6 = _el$5.firstChild;
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.titleText != void 0;
      },
      get children() {
        var _el$3 = _tmpl$();
        insert(_el$3, createComponent(L10n.Compose, {
          get text() {
            return props.titleText;
          }
        }));
        return _el$3;
      }
    }), null);
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.progressString;
      },
      get children() {
        var _el$4 = _tmpl$2();
        insert(_el$4, () => props.progressString);
        return _el$4;
      }
    }), null);
    _el$5.style.setProperty("background-color", "rgba(0,0,0,0.4)");
    _el$5.style.setProperty("border-color", "rgba(64,68,83,1)");
    _el$5.style.setProperty("border-width", "pixels(1)");
    _el$6.style.setProperty("background-color", "rgba(58, 115, 65, 1)");
    createRenderEffect((_p$) => {
      var _v$ = `flex flex-col w-full ${props.class ?? ""}`, _v$2 = props.progressPercent.toString() + "%";
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$6.style.setProperty("width", _v$2) : _el$6.style.removeProperty("width"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};

export { ProgressBar };
//# sourceMappingURL=progress-bar.js.map
