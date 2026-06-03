import { template, use, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, createEffect, createComponent, For, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { InnerFrame } from '../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { RingMeter } from '../../../core/ui-next/components/ring-meter.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { LayoutModel } from '../../../core/ui-next/utilities/layout-utilities.js';
import { GovtScreenModel } from './model-government.js';
import { PoliciesModel } from './model-policies.js';
import { activeTraditionCards, activePolicyCards, activeCrisisCards, setActiveTraditionCards, setActivePolicyCards, setActiveCrisisCards, calculateGovtCardHeights, maxGovtCardHeight } from './policies-support.js';
import { DisplayPolicyCard } from './policy-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row mr-1 w-full"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative font-body-base text-accent-2 p-6 my-px flex flex-col items-center"><div class="policies__overview-government-divider w-128 h-1 mt-3 mb-2"></div><div class="policies__overview-gov-bonuses relative flex flex-col items-center"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="policies__overview-happiness-meter-circle bg-no-repeat bg-center bg-cover size-22 flex items-center justify-center"><div class="policies__overview-happiness-meter-image bg-no-repeat bg-center bg-cover size-12"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex items-center relative w-full pr-18 pl-10 justify-between"><div class="flex items-center"><div class="flex flex-col pointer-events-auto"><div class="policies__overview-turns-left-number font-body-sm"></div></div></div><div class=mr-7><div class="flex flex-col items-center pointer-events-auto"><div data-l10n-id=LOC_ATTR_YIELD_INCOME class="font-title-sm tracking-100"></div><div class="font-title-sm tracking-150 max-w-60"></div></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex w-full flex-col "></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col items-center flex-1"><div class="policies__overview-crisis-section flex flex-col items-center mt-7"><div class="flex-auto mx-3"><div class="policies__overview-crisis-container flex flex-wrap items-center justify-center"data-navrule-up=escape></div></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-auto flex-col w-full"><div class="flex top-0 min-h-1\\/2 relative flex-auto flex-col"><div class="flex flex-wrap p-2 justify-center"></div></div><div class="flex relative flex-auto flex-col"><div class="flex flex-wrap p-2 justify-center"></div></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex-auto flex text-center flex-col px-2 pb-4"><div class="p-3 flex-auto flex flex-row w-full"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="w-full text-accent-3"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div><div class="flex flex-row flex-auto text-xs font-bold "></div></div>`);
const GovernmentOverview = () => {
  let root;
  const policyModel = PoliciesModel.get();
  const govModel = GovtScreenModel.get();
  const layout = LayoutModel.get();
  const displayPolicies = createMemo(() => [...activeTraditionCards, ...activePolicyCards].slice(0, 4));
  const displayCrisis = createMemo(() => [...activeCrisisCards].slice(0, 2));
  const newCardsThisTurn = policyModel.newCards;
  onMount(() => {
    policyModel.clearArrays();
    setActiveTraditionCards(policyModel.activeTraditions);
    setActivePolicyCards(policyModel.activePolicies);
    setActiveCrisisCards(policyModel.activeCrisisPolicies);
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
      var _el$ = _tmpl$8(), _el$2 = _el$.firstChild;
      var _ref$ = root;
      typeof _ref$ === "function" ? use(_ref$, _el$) : root = _el$;
      insert(_el$2, createComponent(InnerFrame, {
        "class": "py-3 px-6 flex-1 h-full mx-2",
        get children() {
          return [_tmpl$(), createComponent(ScrollArea, {
            "class": "flex-auto h-full",
            useProxy: true,
            get children() {
              return [(() => {
                var _el$4 = _tmpl$5();
                insert(_el$4, createComponent(FiligreeTitle.H4, {
                  text: "LOC_UI_POLICIES_CURRENT_GOVERNMENT",
                  "filigree-style": "h4",
                  "class": "mt-4 mb-5"
                }), null);
                insert(_el$4, createComponent(InnerFrame, {
                  "class": "flex flex-col items-center relative px-2",
                  get children() {
                    var _el$5 = _tmpl$2(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
                    insert(_el$5, createComponent(L10n.Stylize, {
                      get text() {
                        return govModel.data.governmentName;
                      },
                      "class": "policies__overview-gov-name relative font-bold font-title-xl"
                    }), _el$6);
                    insert(_el$5, createComponent(L10n.Stylize, {
                      get text() {
                        return govModel.data.governmentDescription;
                      },
                      "class": "policies__overview-gov-desc relative text-accent-4 my-4"
                    }), _el$7);
                    insert(_el$7, createComponent(For, {
                      get each() {
                        return govModel.data.celebrationBonusItems;
                      },
                      children: (item) => createComponent(CelebrationItem, {
                        get description() {
                          return item.description ?? "";
                        },
                        get image() {
                          return item.image ?? "";
                        }
                      })
                    }));
                    return _el$5;
                  }
                }), null);
                insert(_el$4, createComponent(FiligreeTitle.H4, {
                  text: "LOC_TAG_CONSTRUCTIBLE_HAPPINESS",
                  "filigree-style": "h4",
                  "class": "mt-4 mb-5"
                }), null);
                insert(_el$4, createComponent(InnerFrame, {
                  "class": "flex items-center relative",
                  get children() {
                    var _el$8 = _tmpl$4(), _el$9 = _el$8.firstChild, _el$11 = _el$9.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$9.nextSibling, _el$14 = _el$13.firstChild, _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
                    insert(_el$9, createComponent(RingMeter, {
                      get value() {
                        return govModel.data.happinessRing;
                      },
                      min: 0,
                      max: 100,
                      ringImage: "url(blp:govt_happ_circle_rad)",
                      "class": "policies__overview-happiness-meter size-28 flex items-center justify-center",
                      get children() {
                        return _tmpl$3();
                      }
                    }), _el$11);
                    insert(_el$11, createComponent(L10n.Stylize, {
                      "class": "font-body-sm",
                      get text() {
                        return govModel.data.celebrationTurnsLeft;
                      }
                    }), null);
                    insert(_el$16, createComponent(L10n.Stylize, {
                      get text() {
                        return govModel.data.happinessPerTurn;
                      }
                    }));
                    return _el$8;
                  }
                }), null);
                return _el$4;
              })(), _tmpl$6()];
            }
          })];
        }
      }), null);
      insert(_el$2, createComponent(InnerFrame, {
        "class": "p-3 h-full flex-1 mx-2",
        get children() {
          return createComponent(ScrollArea, {
            "class": "flex-auto h-full",
            useProxy: true,
            get children() {
              var _el$18 = _tmpl$7(), _el$19 = _el$18.firstChild, _el$20 = _el$19.firstChild, _el$21 = _el$19.nextSibling, _el$22 = _el$21.firstChild;
              insert(_el$19, createComponent(FiligreeTitle.H4, {
                text: "LOC_UI_POLICIES_POLICIES_ACTIVE",
                "filigree-style": "h4",
                "class": "mt-4 mb-5"
              }), _el$20);
              insert(_el$20, createComponent(For, {
                get each() {
                  return displayPolicies();
                },
                children: (item) => createComponent(DisplayPolicyCard, {
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
                  get tradSlot() {
                    return activeTraditionCards.includes(item);
                  },
                  get isTradition() {
                    return item.CultureSlotType == "TRADITION_CULTURE_SLOT";
                  },
                  get isNewCard() {
                    return newCardsThisTurn.includes(item);
                  },
                  onMouseEnter: () => {
                    useAudio("PolicyCard/Assigned")("focus");
                  }
                })
              }));
              insert(_el$19, createComponent(PolicyDisplayPlacard, {
                "class": "absolute right-3 -bottom-1 z-1",
                get amountActive() {
                  return Locale.compose("LOC_UI_X_OVER_Y", displayPolicies().length, activePolicyCards.length + activeTraditionCards.length);
                }
              }), null);
              insert(_el$21, createComponent(FiligreeTitle.H4, {
                text: "LOC_UI_POLICIES_YOUR_CRISIS_POLICIES",
                "filigree-style": "h4",
                "class": "mt-4 mb-5"
              }), _el$22);
              insert(_el$22, createComponent(For, {
                get each() {
                  return displayCrisis();
                },
                children: (item) => createComponent(DisplayPolicyCard, {
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
              insert(_el$21, createComponent(Show, {
                get when() {
                  return displayCrisis.length > 0;
                },
                get children() {
                  return createComponent(PolicyDisplayPlacard, {
                    "class": "absolute right-3 -bottom-1 z-1",
                    get amountActive() {
                      return Locale.compose("LOC_UI_X_OVER_Y", displayCrisis().length, activeCrisisCards.length);
                    }
                  });
                }
              }), null);
              return _el$18;
            }
          });
        }
      }), null);
      return _el$;
    }
  });
};
const CelebrationItem = (props) => {
  return (() => {
    var _el$23 = _tmpl$9();
    insert(_el$23, createComponent(Icon, {
      "class": "size-8",
      get name() {
        return props.image;
      },
      isUrl: true
    }), null);
    insert(_el$23, createComponent(L10n.Stylize, {
      get text() {
        return props.description;
      }
    }), null);
    return _el$23;
  })();
};
const PolicyDisplayPlacard = (props) => {
  return (() => {
    var _el$24 = _tmpl$10(), _el$25 = _el$24.firstChild;
    insert(_el$25, createComponent(L10n.Stylize, {
      get text() {
        return props.amountActive;
      },
      "class": "mr-1 text-accent-1"
    }), null);
    insert(_el$25, createComponent(L10n.Stylize, {
      "class": "text-accent-3",
      text: "LOC_UI_SHOWN"
    }), null);
    createRenderEffect(() => className(_el$24, `flex flex-auto policies__overview-xy-container p-2 ${props.class}`));
    return _el$24;
  })();
};

export { GovernmentOverview };
//# sourceMappingURL=government-overview.js.map
