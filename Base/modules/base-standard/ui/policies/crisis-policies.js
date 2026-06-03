import { template, use, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { onMount, createEffect, createComponent, For, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { Filigree } from '../../../core/ui-next/components/filigree.js';
import { InnerFrame } from '../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../core/ui-next/components/slot.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { LayoutModel } from '../../../core/ui-next/utilities/layout-utilities.js';
import { GovtScreenModel } from './model-government.js';
import { PoliciesModel } from './model-policies.js';
import { setActiveCrisisCards, setAvailableCrisisCards, calculateGovtCardHeights, maxGovtCardHeight, availableCrisisCards, activeCrisisCards } from './policies-support.js';
import { PolicyCard, CardSlot } from './policy-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-auto policies-2-col self-center"><div class="relative flex top-0 relative flex-wrap items-center w-full justify-start"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-auto policies-2-col self-center"><div class="flex top-0 relative flex-wrap items-center w-full justify-start"><div class="absolute top-0 flex pointer-events-none flex-wrap w-full items-center justify-start"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex-auto flex text-center w-full flex-col px-2 pb-4"><div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col items-center font-title tracking-100 w-full uppercase justify-center crisis-text-color py-4"><div class="flex flex-row"><div class="text-accent-1 font-bold mr-2"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="policies__crisis-progress-bar self-center flex flex-col items-center mt-8 mb-4"><div class=w-full><div class="policies__crisis-progress-bar-outer relative h-4 flex w-full border border-primary"><div class="crisis-bar-pulse absolute h-full"></div><div class="policies__crisis-progress-bar-inner h-full border-primary"></div></div></div><div class="policies__crisis-progress-text self-start mt-2"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="policies__crisis-marker-container mt-14 w-full relative"><div class="w-0\\.5 h-4 bg-primary text-center absolute bottom-0 left-0"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="w-0\\.5 h-4 bg-primary text-center absolute bottom-0"><div class="absolute min-w-20 max-w-25 bottom-4 font-title-2xs font-fit-shrink"></div></div>`);
const CrisisPolicies = () => {
  let root;
  const model = PoliciesModel.get();
  const layout = LayoutModel.get();
  const newCardsThisTurn = model.newCards;
  onMount(() => {
    model.clearArrays();
    setActiveCrisisCards(model.activeCrisisPolicies);
    setAvailableCrisisCards(model.availableCrisisPolicies);
    if (root) {
      createEffect(() => {
        calculateGovtCardHeights(root);
      });
    }
  });
  createEffect(() => {
    layout.screenWidth();
    layout.screenHeight();
    if (root) {
      calculateGovtCardHeights(root);
    }
  });
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      var _el$ = _tmpl$3(), _el$7 = _el$.firstChild;
      var _ref$ = root;
      typeof _ref$ === "function" ? use(_ref$, _el$) : root = _el$;
      insert(_el$, createComponent(CrisisProgressBar, {}), _el$7);
      insert(_el$, createComponent(SpatialSlot, {
        name: "crisis-policies",
        "class": "py-3 px-1 flex-auto flex flex-row w-full",
        get children() {
          return [createComponent(InnerFrame, {
            "class": "py-3 px-2 h-full flex-1 mr-2",
            get children() {
              return [createComponent(PoliciesCountSubHeader, {
                text: "LOC_UI_POLICIES_AVAILABLE",
                isPolicy: true
              }), createComponent(ScrollArea, {
                "class": "flex-auto",
                reserveSpace: true,
                get children() {
                  var _el$2 = _tmpl$(), _el$3 = _el$2.firstChild;
                  insert(_el$3, createComponent(For, {
                    each: availableCrisisCards,
                    children: (item) => createComponent(PolicyCard, {
                      get style() {
                        return {
                          height: `${maxGovtCardHeight()}`
                        };
                      },
                      get name() {
                        return item.Name;
                      },
                      get description() {
                        return item.Description;
                      },
                      card: item,
                      isActive: false,
                      tradSlot: false,
                      get isTradition() {
                        return item.CultureSlotType == "TRADITION_CULTURE_SLOT";
                      },
                      get isNewCard() {
                        return newCardsThisTurn.includes(item);
                      }
                    })
                  }));
                  return _el$2;
                }
              })];
            }
          }), createComponent(InnerFrame, {
            "class": "py-3 px-2 h-full flex-1 ml-2",
            get children() {
              return [createComponent(PoliciesCountSubHeader, {
                text: "LOC_UI_POLICIES_YOUR_CRISIS_POLICIES"
              }), createComponent(ScrollArea, {
                "class": "flex-auto",
                reserveSpace: true,
                get children() {
                  var _el$4 = _tmpl$2(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild;
                  insert(_el$6, createComponent(For, {
                    get each() {
                      return Array(model.crisisSlots).fill(0);
                    },
                    children: () => createComponent(CardSlot, {
                      slotType: "CRISIS_CULTURE_SLOT",
                      get style() {
                        return {
                          height: `${maxGovtCardHeight()}`
                        };
                      }
                    })
                  }));
                  insert(_el$5, createComponent(For, {
                    each: activeCrisisCards,
                    children: (item) => createComponent(PolicyCard, {
                      get style() {
                        return {
                          height: `${maxGovtCardHeight()}`
                        };
                      },
                      get name() {
                        return item.Name;
                      },
                      get description() {
                        return item.Description;
                      },
                      card: item,
                      isActive: true,
                      tradSlot: false,
                      get isTradition() {
                        return item.CultureSlotType == "TRADITION_CULTURE_SLOT";
                      },
                      get isNewCard() {
                        return newCardsThisTurn.includes(item);
                      }
                    })
                  }), null);
                  return _el$4;
                }
              })];
            }
          })];
        }
      }), _el$7);
      insert(_el$7, createComponent(Show, {
        get when() {
          return model.canSwapCrisis;
        },
        get children() {
          return createComponent(AudioContextProvider, {
            segment: "PolicyConfirmButton",
            get children() {
              return createComponent(Button, {
                "class": "flex w-72 mr-6",
                get onActivate() {
                  return model.onConfirmClick;
                },
                get disabled() {
                  return model.confirmDisable;
                },
                get classList() {
                  return {
                    hidden: IsControllerActive()
                  };
                },
                get disableFocus() {
                  return IsControllerActive();
                },
                hotkeyAction: "shell-action-1",
                navTrayText: "LOC_GENERIC_CONFIRM",
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_GENERIC_CONFIRM"
                  });
                }
              });
            }
          });
        }
      }), null);
      insert(_el$7, createComponent(Button, {
        "class": "flex w-72",
        get onActivate() {
          return model.onCloseClick;
        },
        get disabled() {
          return model.confirmDisable;
        },
        get classList() {
          return {
            hidden: IsControllerActive()
          };
        },
        get disableFocus() {
          return IsControllerActive();
        },
        navTrayText: "LOC_GENERIC_BACK",
        hotkeyAction: "cancel",
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_GENERIC_CANCEL"
          });
        }
      }), null);
      createRenderEffect(() => className(_el$7, `${model.canSwapCrisis ? "" : "hidden"} my-4 flex flex-row justify-center`));
      return _el$;
    }
  });
};
const PoliciesCountSubHeader = (props) => {
  return (() => {
    var _el$8 = _tmpl$4(), _el$9 = _el$8.firstChild, _el$10 = _el$9.firstChild;
    insert(_el$10, () => props.count ?? "");
    insert(_el$9, createComponent(L10n.Stylize, {
      get text() {
        return props.text;
      }
    }), null);
    insert(_el$8, createComponent(Filigree.Small, {}), null);
    return _el$8;
  })();
};
const CrisisProgressBar = () => {
  const model = GovtScreenModel.get();
  return (() => {
    var _el$11 = _tmpl$5(), _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling;
    insert(_el$12, createComponent(CrisisMarkerContainer, {
      get data() {
        return model.data.crisisEventMarkers;
      }
    }), _el$13);
    createRenderEffect((_p$) => {
      var _v$ = model.data.crisisBarWdith, _v$2 = model.data.crisisBarWdith;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$14.style.setProperty("width", _v$) : _el$14.style.removeProperty("width"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$15.style.setProperty("width", _v$2) : _el$15.style.removeProperty("width"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$11;
  })();
};
const CrisisMarkerContainer = (props) => {
  return (() => {
    var _el$16 = _tmpl$6(), _el$17 = _el$16.firstChild;
    insert(_el$16, createComponent(For, {
      get each() {
        return props.data;
      },
      children: (item) => createComponent(CrisisMarker, item)
    }), _el$17);
    insert(_el$17, createComponent(L10n.Stylize, {
      "class": "policies__crisis-age-begins absolute min-w-20 max-w-20 bottom-4 font-title-2xs tracking-100",
      text: "LOC_UI_POLICIES_CRISIS_AGE_BEGINS"
    }));
    return _el$16;
  })();
};
const CrisisMarker = (props) => {
  const placement = `${(1 - props.timelinePlacement) * 100}%`;
  return (() => {
    var _el$18 = _tmpl$7(), _el$19 = _el$18.firstChild;
    placement != null ? _el$18.style.setProperty("right", placement) : _el$18.style.removeProperty("right");
    insert(_el$19, createComponent(L10n.Stylize, {
      get text() {
        return props.eventName;
      }
    }));
    return _el$18;
  })();
};

export { CrisisPolicies };
//# sourceMappingURL=crisis-policies.js.map
