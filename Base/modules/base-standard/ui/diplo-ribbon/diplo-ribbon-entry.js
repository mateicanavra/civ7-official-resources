import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { isMobile } from '../../../core/ui-next/services/view-experience.js';
import { createComponent } from '../../../core/vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flow-column flex-auto justify-center yield-label"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="yield-value"></div>`);
const DiploRibbonEntryComponent = (props) => {
  return createComponent(Tooltip.LegacyText, {
    get text() {
      return props.tooltip;
    },
    get children() {
      return createComponent(Activatable, {
        "class": "yield-item flow-row items-center pointer-events-auto",
        get classList() {
          return {
            "font-title-sm": isMobile(),
            "font-title-base": !isMobile(),
            "tint-bg": props.entryIndex % 2 === 0
          };
        },
        get children() {
          return [(() => {
            var _el$ = _tmpl$();
            insert(_el$, createComponent(Icon, {
              "class": "size-6",
              get name() {
                return props.icon;
              },
              isUrl: true
            }));
            return _el$;
          })(), (() => {
            var _el$2 = _tmpl$2();
            insert(_el$2, () => props.value);
            return _el$2;
          })()];
        }
      });
    }
  });
};
const DiploRibbonEntry = ComponentRegistry.register({
  name: "DiploRibbonEntry",
  createInstance: DiploRibbonEntryComponent
});

export { DiploRibbonEntry };
//# sourceMappingURL=diplo-ribbon-entry.js.map
