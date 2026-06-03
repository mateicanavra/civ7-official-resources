import { template, insert, classList } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, createComponent, mergeProps, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import style from '../components/styles/line-through.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full flex items-center mb-1"><div class=relativetracking-100></div></div>`);
const TradeRouteCriteriaTooltipComponent = (props) => {
  const [local, other] = splitProps(props, ["text", "args", "children", "header", "isNegative", "appliesToCurrentCiv"]);
  const isNegativeOrDoesNotApply = createMemo(() => local.isNegative || !local.appliesToCurrentCiv);
  return createComponent(Tooltip, mergeProps(other, {
    showFiligrees: false,
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": `relative flex flex-col pb-1 w-128`,
            get children() {
              return [createComponent(Show, {
                get when() {
                  return local.header;
                },
                children: (header) => (() => {
                  var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
                  insert(_el$, createComponent(Icon, {
                    "class": "size-6 mr-1",
                    get name() {
                      return isNegativeOrDoesNotApply() ? "url('blp:dip_esp_fail_icon')" : "url('blp:dip_esp_success_icon')";
                    },
                    isUrl: true
                  }), _el$2);
                  insert(_el$2, createComponent(L10n.Compose, {
                    get text() {
                      return header();
                    }
                  }));
                  createRenderEffect((_$p) => classList(_el$2, {
                    "text-negative decoration-negative": isNegativeOrDoesNotApply(),
                    "decoration-accent-2": !isNegativeOrDoesNotApply(),
                    "line-through": !local.appliesToCurrentCiv
                  }, _$p));
                  return _el$;
                })()
              }), createComponent(L10n.Stylize, {
                get text() {
                  return local.text;
                },
                get args() {
                  return local.args;
                },
                "class": "relative"
              })];
            }
          });
        }
      })];
    }
  }));
};
const TradeRouteCriteriaTooltip = ComponentRegistry.register({
  name: "TradeRouteCriteriaTooltip",
  createInstance: TradeRouteCriteriaTooltipComponent,
  styles: [style],
  images: ["blp:dip_esp_fail_icon", "blp:dip_esp_success_icon"]
});

export { TradeRouteCriteriaTooltip };
//# sourceMappingURL=trade-route-criteria-tooltip.js.map
