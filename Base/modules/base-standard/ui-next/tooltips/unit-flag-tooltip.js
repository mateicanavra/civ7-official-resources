import '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createComponent, mergeProps } from '../../../core/vendor/solid-js/dist/solid.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { UnitInfoSection } from './plot-tooltip/plot-tooltip.js';

const UnitFlagTooltipComponent = (props) => {
  const [local, other] = splitProps(props, ["class", "unitInfo", "delegateEventsTo", "delegateEventsFrom"]);
  return createComponent(Tooltip, mergeProps(other, {
    get delegatedTrigger() {
      return local.delegateEventsTo && local.delegateEventsFrom instanceof HTMLElement ? {
        root: local.delegateEventsTo,
        element: local.delegateEventsFrom
      } : void 0;
    },
    get children() {
      return createComponent(Tooltip.Content, {
        get ["class"]() {
          return local.class;
        },
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              return createComponent(UnitInfoSection, mergeProps(() => local.unitInfo));
            }
          });
        }
      });
    }
  }));
};
const UnitFlagTooltip = ComponentRegistry.register({
  name: "UnitFlagTooltip",
  createInstance: UnitFlagTooltipComponent,
  images: ["blp:base_ticket-bg", "blp:shell_line-divider"]
});

export { UnitFlagTooltip, UnitFlagTooltipComponent };
//# sourceMappingURL=unit-flag-tooltip.js.map
