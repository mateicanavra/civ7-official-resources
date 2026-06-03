import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createComponent, mergeProps, Show } from '../../../core/vendor/solid-js/dist/solid.js';
import { Divider } from '../../../core/ui-next/components/divider.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { FramedResource } from '../components/framed-resource.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title text-secondary uppercase mb-2 flex flex-row items-center"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="max-w-full flex flex-row items-center img-base-ticket-bg p-3"><div class="flex flex-col shrink"><div class="font-title text-secondary uppercase"></div><div class="flex flex-col"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=mt-1></div>`);
const ResourceTooltipComponent = (props) => {
  const [local, other] = splitProps(props, ["resourceName", "resourceIcon", "resourceType", "resourceTypeIcon", "tooltipText", "resourceOrigin"]);
  return createComponent(Tooltip, mergeProps({
    showFiligrees: false
  }, other, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "relative flex flex-col items-center bp-1 min-w-64 max-w-96",
            get children() {
              return [(() => {
                var _el$ = _tmpl$();
                insert(_el$, createComponent(Icon, {
                  "class": "size-7 mr-2",
                  get name() {
                    return props.resourceTypeIcon;
                  },
                  isUrl: true
                }), null);
                insert(_el$, createComponent(L10n.Compose, {
                  text: "LOC_RESOURCECLASS_TOOLTIP_NAME",
                  get args() {
                    return [Locale.compose(props.resourceType)];
                  }
                }), null);
                return _el$;
              })(), (() => {
                var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
                insert(_el$2, createComponent(FramedResource, mergeProps({
                  size: 14
                }, local)), _el$3);
                insert(_el$2, createComponent(Divider.Vertical, {
                  margin: 3
                }), _el$3);
                insert(_el$4, createComponent(L10n.Compose, {
                  get text() {
                    return local.resourceName;
                  }
                }));
                insert(_el$3, createComponent(Divider.Horizontal, {
                  margin: 1,
                  useGradient: true
                }), _el$5);
                insert(_el$5, createComponent(L10n.Stylize, {
                  get text() {
                    return props.tooltipText;
                  }
                }), null);
                insert(_el$5, createComponent(Show, {
                  get when() {
                    return props.resourceOrigin;
                  },
                  children: (resourceOrigin) => (() => {
                    var _el$6 = _tmpl$3();
                    insert(_el$6, createComponent(L10n.Stylize, {
                      text: "LOC_COMMERCE_EMPIRE_RESOURCES_ORIGIN_CITY",
                      get args() {
                        return [Locale.compose(resourceOrigin())];
                      }
                    }));
                    return _el$6;
                  })()
                }), null);
                return _el$2;
              })()];
            }
          });
        }
      })];
    }
  }));
};
const ResourceTooltip = ComponentRegistry.register({
  name: "ResourceTooltip",
  createInstance: ResourceTooltipComponent
});

export { ResourceTooltip };
//# sourceMappingURL=resource-tooltip.js.map
