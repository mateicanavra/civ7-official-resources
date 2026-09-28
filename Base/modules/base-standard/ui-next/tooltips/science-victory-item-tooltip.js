import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { CardFrame } from '../../../core/ui-next/components/card-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { createComponent } from '../../../core/vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="uppercase text-secondary font-title"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="uppercase mb-3"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row"><div class="flex-auto font-body mr-2 self-center"></div><div class="text-white self-center"></div></div>`);
const ScienceVictoryItemTooltipComponent = (props) => {
  return createComponent(Tooltip, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "relative flex flex-col items-center min-w-64 max-w-96",
            get children() {
              return [(() => {
                var _el$ = _tmpl$();
                insert(_el$, createComponent(L10n.Compose, {
                  text: "LOC_VICTORIES_ITEM_TOOLTIP_AGE",
                  get args() {
                    return [props.ageName];
                  }
                }));
                return _el$;
              })(), (() => {
                var _el$2 = _tmpl$2();
                insert(_el$2, createComponent(L10n.Stylize, {
                  text: "LOC_VICTORIES_ITEM_TOOLTIP_TURN",
                  get args() {
                    return [props.turn];
                  }
                }));
                return _el$2;
              })(), createComponent(CardFrame, {
                "class": "w-full p-4",
                get children() {
                  var _el$3 = _tmpl$3(), _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
                  insert(_el$4, createComponent(L10n.Compose, {
                    get text() {
                      return props.description;
                    }
                  }));
                  insert(_el$5, () => props.pointsValue);
                  return _el$3;
                }
              })];
            }
          });
        }
      })];
    }
  });
};
const ScienceVictoryItemTooltip = ComponentRegistry.register({
  name: "ScienceVictoryItemTooltip",
  createInstance: ScienceVictoryItemTooltipComponent
});

export { ScienceVictoryItemTooltip };
//# sourceMappingURL=science-victory-item-tooltip.js.map
