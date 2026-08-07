import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, createComponent, mergeProps, For, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { useIsSmallScreen } from '../../../core/ui-next/utilities/layout-utilities.js';
import { TicketSection, EntryDivider } from './plot-tooltip/components/utility.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col items-stretch"><div class="flex flex-col gap-2 items-center"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="h-px flex-auto my-0\\.5 bg-accent-2 opacity-20"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row items-center"><div class="flex flex-col grow"><div class="flex flex-row items-center"><div class=grow></div></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row items-center grow text-xs text-accent-3"><div class=mr-2>•</div><div class="flex flex-row items-center grow"><div class=grow></div></div></div>`);
const WarehouseBreakdownTooltipComponent = (props) => {
  const isSmallScreen = useIsSmallScreen();
  const [local, other] = splitProps(props, ["children", "class", "warehouseCounts"]);
  const BULLET_CHAR = String.fromCodePoint(8226);
  const getWarehouseImprovements = createMemo(() => {
    const data = [];
    for (const improvementType of local.warehouseCounts) {
      const entry = improvementType[1];
      const showBreakdown = entry.breakdown && entry.breakdown.size > 1;
      const breakdownEntries = [];
      let allReplaced = true;
      if (entry.breakdown) {
        for (const childImprovementType of entry.breakdown) {
          const childEntry = childImprovementType[1];
          const isReplacing = childEntry.name != entry.name;
          if (!isReplacing) allReplaced = false;
          breakdownEntries.push([childEntry.name, childEntry.icon, childEntry.total, isReplacing]);
        }
      }
      data.push([entry.name, entry.icon, entry.total, showBreakdown || allReplaced, breakdownEntries]);
    }
    return data;
  });
  return createComponent(Tooltip, mergeProps(other, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get ["class"]() {
          return local.class;
        },
        get children() {
          return createComponent(Tooltip.Frame, {
            get ["class"]() {
              return isSmallScreen() ? "max-w-128" : "max-w-96";
            },
            get children() {
              var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
              insert(_el$2, createComponent(L10n.Stylize, {
                "class": "font-title uppercase text-gradient-secondary",
                text: "LOC_UI_CITY_DETAILS_WAREHOUSE_BREAKDOWN_HEADER"
              }), null);
              insert(_el$2, createComponent(L10n.Stylize, {
                "class": "text-xs font-body px-2",
                text: "LOC_UI_CITY_DETAILS_WAREHOUSE_BREAKDOWN_DESCRIPTION"
              }), null);
              insert(_el$, createComponent(TicketSection, {
                "class": "mt-1 p-3 flex flex-col",
                get children() {
                  return createComponent(For, {
                    get each() {
                      return getWarehouseImprovements();
                    },
                    children: (improvement, index) => [createComponent(Show, {
                      get when() {
                        return index() > 0;
                      },
                      get children() {
                        return createComponent(EntryDivider, {
                          get ["class"]() {
                            return isSmallScreen() ? "" : "my-2";
                          }
                        });
                      }
                    }), (() => {
                      var _el$3 = _tmpl$3(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild;
                      insert(_el$3, createComponent(Icon, {
                        "class": "size-8 mr-3",
                        get name() {
                          return improvement[1];
                        }
                      }), _el$4);
                      insert(_el$5, createComponent(L10n.Stylize, {
                        "class": "text-secondary font-title uppercase tracking-100",
                        get text() {
                          return improvement[0];
                        }
                      }), _el$6);
                      insert(_el$5, createComponent(L10n.Stylize, {
                        "class": "ml-8 uppercase tracking-100",
                        text: "LOC_UI_CITY_DETAILS_WAREHOUSE_BREAKDOWN_COUNT",
                        get args() {
                          return [improvement[2]];
                        }
                      }), null);
                      insert(_el$4, createComponent(Show, {
                        get when() {
                          return improvement[3];
                        },
                        get children() {
                          return [_tmpl$2(), createComponent(For, {
                            get each() {
                              return improvement[4];
                            },
                            children: (childImprovement) => (() => {
                              var _el$8 = _tmpl$4(), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling, _el$11 = _el$10.firstChild;
                              insert(_el$10, createComponent(L10n.Stylize, {
                                get text() {
                                  return childImprovement[0];
                                }
                              }), _el$11);
                              insert(_el$10, createComponent(L10n.Stylize, {
                                "class": "ml-6",
                                text: "LOC_UI_CITY_DETAILS_WAREHOUSE_BREAKDOWN_COUNT",
                                get classList() {
                                  return {
                                    "opacity-60": isSmallScreen()
                                  };
                                },
                                get args() {
                                  return [childImprovement[2]];
                                }
                              }), null);
                              return _el$8;
                            })()
                          })];
                        }
                      }), null);
                      createRenderEffect((_p$) => {
                        var _v$ = !isSmallScreen(), _v$2 = !!isSmallScreen();
                        _v$ !== _p$.e && _el$5.classList.toggle("text-sm", _p$.e = _v$);
                        _v$2 !== _p$.t && _el$5.classList.toggle("text-xs", _p$.t = _v$2);
                        return _p$;
                      }, {
                        e: void 0,
                        t: void 0
                      });
                      return _el$3;
                    })()]
                  });
                }
              }), null);
              return _el$;
            }
          });
        }
      })];
    }
  }));
};
const WarehouseBreakdownTooltip = ComponentRegistry.register({
  name: "WarehouseBreakdownTooltip",
  createInstance: WarehouseBreakdownTooltipComponent,
  images: ["blp:base_ticket-bg", "blp:shell_line-divider"]
});

export { WarehouseBreakdownTooltip, WarehouseBreakdownTooltipComponent };
//# sourceMappingURL=warehouse-breakdown-tooltip.js.map
