import { template, insert, className, spread } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, splitProps, mergeProps, For, Switch, Match } from '../../../core/vendor/solid-js/dist/solid.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { Pill } from './pills.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex items-center justify-center w-11 h-6 mb-2 text-sm"><div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex items-center"></div>`);
var YieldBarEntryStyle = /* @__PURE__ */ ((YieldBarEntryStyle2) => {
  YieldBarEntryStyle2[YieldBarEntryStyle2["NONE"] = 0] = "NONE";
  YieldBarEntryStyle2[YieldBarEntryStyle2["GAIN"] = 1] = "GAIN";
  YieldBarEntryStyle2[YieldBarEntryStyle2["LOSS"] = 2] = "LOSS";
  return YieldBarEntryStyle2;
})(YieldBarEntryStyle || {});
const getEntryContainerClass = (style) => {
  switch (style) {
    case 1 /* GAIN */:
      return "img-yield-container-positive";
    case 2 /* LOSS */:
      return "img-yield-container-negative";
    case 0 /* NONE */:
      return "img-yield-container-neutral";
    default:
      style;
      return "img-yield-container-neutral";
  }
};
const formatYieldValue = (value) => value > 100 ? Math.trunc(value) : Math.trunc(value * 10) / 10;
const hasDeltaValue = (delta) => {
  return delta !== void 0 && delta.value !== 0;
};
const getDeltaTextClass = (style) => {
  switch (style) {
    case 1 /* GAIN */:
      return "text-positive-light";
    case 2 /* LOSS */:
      return "text-negative-light";
    case 0 /* NONE */:
    default:
      return "";
  }
};
const DefaultYieldEntry = (props) => [createComponent(Show, {
  get when() {
    return hasDeltaValue(props.delta);
  },
  get children() {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    _el$.style.setProperty("background-color", "rgba(0,0,0,0.51)");
    _el$.style.setProperty("border-radius", "5px");
    _el$2.style.setProperty("letter-spacing", "-0.5px");
    insert(_el$2, createComponent(L10n.Compose, {
      text: "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL",
      get args() {
        return [props.delta.value];
      }
    }));
    createRenderEffect(() => className(_el$2, getDeltaTextClass(props.delta.style)));
    return _el$;
  }
}), (() => {
  var _el$3 = _tmpl$2();
  insert(_el$3, createComponent(Icon, {
    "class": "mt-2 size-8 self-center",
    get name() {
      return props.entry.type;
    },
    get context() {
      return props.entry.iconContext;
    }
  }), null);
  insert(_el$3, createComponent(L10n.Stylize, {
    "class": "mb-2 text-sm text-center font-fit-shrink",
    style: {
      "letter-spacing": "-0.5px"
    },
    text: "LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS",
    get args() {
      return [formatYieldValue(props.entry.value)];
    }
  }), null);
  createRenderEffect(() => className(_el$3, `w-11 h-20 flex flex-col items-center justify-center self-end ${getEntryContainerClass(props.entry.style)}`));
  return _el$3;
})()];
const CompactYieldEntry = (props) => [createComponent(Show, {
  get when() {
    return hasDeltaValue(props.delta);
  },
  get children() {
    var _el$4 = _tmpl$2();
    _el$4.style.setProperty("letter-spacing", "-0.5px");
    insert(_el$4, createComponent(L10n.Compose, {
      text: "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL",
      get args() {
        return [props.delta.value];
      }
    }));
    createRenderEffect(() => className(_el$4, `flex items-center justify-center text-xs ${getDeltaTextClass(props.delta.style)}`));
    return _el$4;
  }
}), createComponent(Pill, {
  "class": "text-sm",
  small: true,
  get children() {
    var _el$5 = _tmpl$3();
    insert(_el$5, createComponent(Icon, {
      "class": "size-6 -ml-0\\.5",
      get name() {
        return props.entry.type;
      },
      get context() {
        return props.entry.iconContext;
      }
    }), null);
    insert(_el$5, createComponent(L10n.Stylize, {
      "class": "text-sm font-fit-shrink",
      style: {
        "letter-spacing": "-0.5px"
      },
      text: "LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS",
      get args() {
        return [formatYieldValue(props.entry.value)];
      }
    }), null);
    return _el$5;
  }
})];
const YieldBarComponent = (props) => {
  const [local, other] = splitProps(props, ["yieldBarData", "yieldBarDeltas", "variant", "class"]);
  const variant = () => local.variant ?? "default";
  return (() => {
    var _el$6 = _tmpl$2();
    spread(_el$6, mergeProps({
      get ["class"]() {
        return `flex justify-between items-center gap-2 ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$6, createComponent(For, {
      get each() {
        return local.yieldBarData;
      },
      children: (entry, index) => {
        const delta = () => local.yieldBarDeltas?.[index()];
        return createComponent(Switch, {
          get children() {
            return [createComponent(Match, {
              get when() {
                return variant() === "compact";
              },
              get children() {
                return createComponent(CompactYieldEntry, {
                  entry,
                  get delta() {
                    return delta();
                  }
                });
              }
            }), createComponent(Match, {
              get when() {
                return variant() === "default";
              },
              get children() {
                return createComponent(DefaultYieldEntry, {
                  entry,
                  get delta() {
                    return delta();
                  }
                });
              }
            })];
          }
        });
      }
    }));
    return _el$6;
  })();
};
const YieldBar = ComponentRegistry.register("YieldBar", YieldBarComponent);

export { YieldBar, YieldBarEntryStyle };
//# sourceMappingURL=yield-bar.js.map
