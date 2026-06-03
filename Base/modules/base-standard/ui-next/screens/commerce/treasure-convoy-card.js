import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, For, Show, mergeProps } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { CommerceCriteriaDisplay } from './commerce-criteria-display.js';
import { useCommerceScreenContext } from './commerce-screen-model.js';
import { TreasureConvoyProgressBar } from './treasure-convoy-progress-bar.js';
import { ResourceTooltip } from '../../tooltips/resource-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title text-secondary uppercase"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row items-center mb-2"><div class="flex flex-row mr-3 items-center justify-center size-10 bg-center bg-cover bg-no-repeat"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row w-full flex-wrap my-3"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="text-wrap w-full pr-2 mr-2 flex-auto"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="h-1 my-1 scale-y-50"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="size-9 mt-2 -mb-1 tint-bg-white bg-center bg-contain bg-no-repeat"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute top-0 right-3 w-12 h-20 bg-center bg-no-repeat bg-contain flex flex-col items-center"><p></p></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="relative size-16 mr-1 flex items-center justify-center"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="mt-2 p-4 flex flex-col"></div>`);
const TreasureConvoyCardComponent = (props) => {
  const model = useCommerceScreenContext();
  return createComponent(CardFrame, {
    "class": `w-128 min-h-64 px-6 pt-6 pb-3 flex flex-col mr-6 mb-6 relative`,
    get children() {
      return [(() => {
        var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
        _el$2.style.setProperty("background-image", 'url("blp:banner_hex")');
        insert(_el$2, createComponent(Icon, {
          "class": "size-8",
          get name() {
            return props.fleet.cityIcon;
          }
        }));
        insert(_el$, createComponent(Activatable, {
          onActivate: () => {
            model.clickCityName(props.fleet.cityID);
          },
          get children() {
            var _el$3 = _tmpl$();
            insert(_el$3, () => props.fleet.cityName);
            return _el$3;
          }
        }), null);
        return _el$;
      })(), createComponent(L10n.Compose, {
        text: "LOC_COMMERCE_TREASURE_RESOURCES_TITLE"
      }), (() => {
        var _el$4 = _tmpl$3();
        insert(_el$4, createComponent(For, {
          get each() {
            return props.fleet.resources;
          },
          children: (resource) => createComponent(Show, {
            get when() {
              return resource.resourceProps;
            },
            children: (resProps) => createComponent(Show, {
              get when() {
                return props.inGeneratingConvoysSection && resource.isImproved;
              },
              get fallback() {
                return createComponent(Tooltip.Text, {
                  get text() {
                    return resource.tooltip;
                  },
                  get children() {
                    return createComponent(Activatable, {
                      onActivate: () => {
                        model.clickUnimprovedTreasure(resource.location);
                      },
                      get children() {
                        var _el$10 = _tmpl$8();
                        insert(_el$10, createComponent(Icon, {
                          "class": "w-full h-full opacity-30",
                          get name() {
                            return resProps().resourceIcon;
                          }
                        }), null);
                        insert(_el$10, createComponent(Show, {
                          get when() {
                            return resource.isDamaged;
                          },
                          get children() {
                            return createComponent(Icon, {
                              "class": "size-10 absolute",
                              name: "url(blp:buildicon_warning)",
                              isUrl: true
                            });
                          }
                        }), null);
                        return _el$10;
                      }
                    });
                  }
                });
              },
              get children() {
                return createComponent(ResourceTooltip, mergeProps(resProps, {
                  get children() {
                    return createComponent(Activatable, {
                      onActivate: () => {
                        model.clickUnimprovedTreasure(resource.location);
                      },
                      get children() {
                        return createComponent(Icon, {
                          "class": "size-16 mr-1",
                          get name() {
                            return resProps().resourceIcon;
                          }
                        });
                      }
                    });
                  }
                }));
              }
            })
          })
        }));
        return _el$4;
      })(), createComponent(Show, {
        get when() {
          return props.fleet.resourceValue > 0;
        },
        get fallback() {
          return (() => {
            var _el$11 = _tmpl$9();
            _el$11.style.setProperty("background-color", "rgba(0,0,0, 0.4)");
            insert(_el$11, createComponent(For, {
              get each() {
                return props.fleet.statuses;
              },
              children: (status) => createComponent(CommerceCriteriaDisplay, {
                status
              })
            }));
            return _el$11;
          })();
        },
        get children() {
          return [(() => {
            var _el$5 = _tmpl$4();
            insert(_el$5, () => props.fleet.treasureFleetText);
            return _el$5;
          })(), (() => {
            var _el$6 = _tmpl$5();
            _el$6.style.setProperty("background-image", "linear-gradient(to right, rgba(77, 83, 102, 1), rgba(77, 83, 102, 0))");
            return _el$6;
          })(), createComponent(TreasureConvoyProgressBar, {
            get segmentCount() {
              return props.fleet.progressGoal;
            },
            get currentValue() {
              return props.fleet.progress;
            }
          }), (() => {
            var _el$7 = _tmpl$7(), _el$9 = _el$7.firstChild;
            _el$7.style.setProperty("background-image", 'url("blp:treasure_banner")');
            insert(_el$7, createComponent(Activatable, {
              onActivate: () => {
                model.clickTreasureFleet(props.fleet.cityID);
              },
              get children() {
                var _el$8 = _tmpl$6();
                _el$8.style.setProperty("background-image", "url(blp:unitflag_treasurefleet)");
                return _el$8;
              }
            }), _el$9);
            insert(_el$9, () => props.fleet.resourceValue);
            return _el$7;
          })()];
        }
      })];
    }
  });
};
const TreasureConvoyCard = ComponentRegistry.register({
  name: "TreasureConvoyCard",
  createInstance: TreasureConvoyCardComponent
});

export { TreasureConvoyCard };
//# sourceMappingURL=treasure-convoy-card.js.map
