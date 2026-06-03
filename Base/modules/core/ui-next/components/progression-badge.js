import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div></div></div>`);
var BadgeSize = /* @__PURE__ */ ((BadgeSize2) => {
  BadgeSize2["BASE"] = "base";
  BadgeSize2["SMALL"] = "small";
  BadgeSize2["MINI"] = "mini";
  BadgeSize2["MICRO"] = "micro";
  BadgeSize2["DEFAULT"] = "default";
  return BadgeSize2;
})(BadgeSize || {});
const STYLES = {
  ["base" /* BASE */]: {
    badge: "w-20 h-20 pl-0.5",
    outerLevel: "relative w-7 h-7 left-6 -bottom-9 flex left-1/2 bottom-8",
    innerLevel: "font-fit-shrink whitespace-nowrap"
  },
  ["small" /* SMALL */]: {
    badge: "w-16 h-16 pl-0.5",
    outerLevel: "relative -bottom-7 flex w-7 h-7 left-4",
    innerLevel: "mx-1\\.25 font-fit-shrink whitespace-nowrap"
  },
  ["mini" /* MINI */]: {
    badge: "w-20 h-20 pl-0.5",
    outerLevel: "relative w-7 h-7 left-6 -bottom-10 left-1/2 bottom-8",
    innerLevel: "font-fit-shrink whitespace-nowrap"
  },
  ["micro" /* MICRO */]: {
    badge: "w-12 h-12 justify-center",
    outerLevel: "relative w-8 h-8 -bottom-9 left-1/2 bottom-8",
    innerLevel: ""
  },
  ["default" /* DEFAULT */]: {
    badge: "w-20 h-20",
    outerLevel: "",
    innerLevel: ""
  }
};
const ProgressionBadge = (props) => {
  const displayLevel = Network.supportsSSO();
  const style = () => STYLES[props.badgeSize] ?? STYLES["default" /* DEFAULT */];
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(Show, {
      when: displayLevel,
      get children() {
        var _el$3 = _tmpl$(), _el$4 = _el$3.firstChild;
        _el$3.style.setProperty("background-image", "url('fs://game/prof_lvl_bk.png')");
        insert(_el$4, () => props.progressionLevel);
        createRenderEffect((_p$) => {
          var _v$ = `relative bg-contain bg-no-repeat self-center flex items-center justify-center ${style().outerLevel}`, _v$2 = `font-body text-normal text-sm self-center ${style().innerLevel}`;
          _v$ !== _p$.e && className(_el$3, _p$.e = _v$);
          _v$2 !== _p$.t && className(_el$4, _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$3;
      }
    }));
    createRenderEffect((_p$) => {
      var _v$3 = `relative flex flex-auto justify-center ${props.class || ""}`, _v$4 = `flex bg-contain bg-no-repeat self-center ${style().badge}`, _v$5 = `url('${props.badgeUrl}')`;
      _v$3 !== _p$.e && className(_el$, _p$.e = _v$3);
      _v$4 !== _p$.t && className(_el$2, _p$.t = _v$4);
      _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$2.style.setProperty("background-image", _v$5) : _el$2.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};

export { BadgeSize, ProgressionBadge };
//# sourceMappingURL=progression-badge.js.map
