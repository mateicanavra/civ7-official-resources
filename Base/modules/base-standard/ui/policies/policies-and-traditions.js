import { template, use, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { onMount, createEffect, on, createMemo, createComponent, Show, onCleanup, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { Filigree } from '../../../core/ui-next/components/filigree.js';
import { InnerFrame } from '../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { HSlot, SpatialSlot } from '../../../core/ui-next/components/slot.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { useFocusContext } from '../../../core/ui-next/services/focus.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { LayoutModel } from '../../../core/ui-next/utilities/layout-utilities.js';
import { createLayoutComplete } from '../../../core/ui-next/utilities/solid-utilities.js';
import { PoliciesModel } from './model-policies.js';
import { setActivePolicyCards, setAvailablePolicyCards, setActiveTraditionCards, setAvailableTraditionCards, calculateGovtCardHeights, activeTraditionCards, activePolicyCards, availablePolicyCards, availableTraditionCards, maxGovtCardHeight } from './policies-support.js';
import { PolicyCard, CardSlot } from './policy-card.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex pt-4 pb-2 justify-center"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row w-full pr-5"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex relative flex-1 flex-col items-center justify-start"><div class="flex flex-auto w-full flex-col items-center"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row mr-1 w-full"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-auto policies-2-col self-center"><div class="relative flex top-0 relative flex-wrap items-center w-full justify-start"><div class="absolute top-0 flex pointer-events-none flex-wrap w-full items-center justify-start"></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="flex flex-row"><div class="text-accent-1 font-bold mr-2"></div></div></div>`);
const PoliciesAndTraditions = () => {
  let root;
  const policyModel = PoliciesModel.get();
  const layout = LayoutModel.get();
  const layoutComplete = createLayoutComplete();
  onMount(() => {
    policyModel.clearArrays();
    setActivePolicyCards(policyModel.activePolicies);
    setAvailablePolicyCards(policyModel.availablePolicies);
    setActiveTraditionCards(policyModel.activeTraditions);
    setAvailableTraditionCards(policyModel.availableTraditions);
    createEffect(on(layoutComplete, () => {
      if (layoutComplete()) {
        policyModel.getAvailablePolicyFocus()?.focusCurrentOrDefault();
      }
    }));
    if (root) {
      createEffect(() => {
        calculateGovtCardHeights(root);
      });
    }
  });
  const activeTraditionsWithEmpties = createMemo(() => {
    return Array(policyModel.tradSlots - activeTraditionCards.length).fill(0);
  });
  const allActive = createMemo(() => [...activeTraditionCards, ...activeTraditionsWithEmpties(), ...activePolicyCards]);
  createEffect(() => {
    layout.screenWidth();
    layout.screenHeight();
    if (root) {
      calculateGovtCardHeights(root);
    }
  });
  const newCardsThisTurn = policyModel.newCards;
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      var _el$ = _tmpl$5(), _el$9 = _el$.firstChild;
      var _ref$ = root;
      typeof _ref$ === "function" ? use(_ref$, _el$) : root = _el$;
      insert(_el$, createComponent(Show, {
        get when() {
          return !policyModel.isSmallScreen();
        },
        get children() {
          var _el$2 = _tmpl$();
          insert(_el$2, createComponent(L10n.Stylize, {
            text: "LOC_UI_POLICIES_DESCRIPTION"
          }));
          return _el$2;
        }
      }), _el$9);
      insert(_el$, createComponent(HSlot, {
        name: "policies-traditions",
        "class": "p-3 flex-auto flex flex-row w-full",
        get children() {
          return [createComponent(InnerFrame, {
            get ["class"]() {
              return `py-3 px-5 h-full ${policyModel.isSmallScreen() ? "flex-2" : "flex-1"} mr-2`;
            },
            get children() {
              return [(() => {
                var _el$3 = _tmpl$2();
                insert(_el$3, createComponent(PoliciesCountSubHeader, {
                  text: "LOC_UI_POLICIES_AVAILABLE",
                  isPolicy: true,
                  get count() {
                    return availablePolicyCards.length.toString();
                  }
                }), null);
                insert(_el$3, createComponent(PoliciesCountSubHeader, {
                  text: "LOC_UI_TRADITIONS_AVAILABLE",
                  get count() {
                    return availableTraditionCards.length.toString();
                  }
                }), null);
                return _el$3;
              })(), createComponent(ScrollArea, {
                "class": "flex-auto",
                reserveSpace: true,
                get children() {
                  return createComponent(SpatialSlot, {
                    name: "inactive-policies",
                    "class": "flex w-full",
                    tabIndex: 1,
                    get children() {
                      return [(() => {
                        var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild;
                        insert(_el$5, () => {
                          onMount(() => {
                            const focusContext = useFocusContext();
                            policyModel.setAvailablePolicyFocus(focusContext);
                          });
                          onCleanup(() => {
                            policyModel.setAvailablePolicyFocus(null);
                          });
                          return createComponent(For, {
                            each: availablePolicyCards,
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
                              },
                              get autoFocus() {
                                return policyModel.autoFocusCard == item.$index;
                              }
                            })
                          });
                        });
                        return _el$4;
                      })(), (() => {
                        var _el$6 = _tmpl$3(), _el$7 = _el$6.firstChild;
                        insert(_el$7, () => {
                          onMount(() => {
                            const focusContext = useFocusContext();
                            policyModel.setAvailableTraditionFocus(focusContext);
                          });
                          onCleanup(() => {
                            policyModel.setAvailableTraditionFocus(null);
                          });
                          return createComponent(For, {
                            each: availableTraditionCards,
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
                              },
                              get autoFocus() {
                                return policyModel.autoFocusCard == item.$index;
                              }
                            })
                          });
                        });
                        return _el$6;
                      })()];
                    }
                  });
                }
              })];
            }
          }), createComponent(InnerFrame, {
            "class": `py-3 px-5 h-full flex-1 ml-2`,
            get children() {
              return [(() => {
                var _el$8 = _tmpl$4();
                insert(_el$8, createComponent(PoliciesCountSubHeader, {
                  get text() {
                    return policyModel.isSmallScreen() ? "LOC_UI_QUEUE_ACTIVE" : "LOC_UI_POLICIES_POLICIES_ACTIVE";
                  },
                  get count() {
                    return activePolicyCards.length + activeTraditionCards.length + " / " + (policyModel.policySlots + policyModel.tradSlots);
                  }
                }));
                return _el$8;
              })(), createComponent(ScrollArea, {
                "class": "flex-auto",
                reserveSpace: true,
                get children() {
                  return createComponent(SpatialSlot, {
                    name: "active-policies",
                    "class": "active-policies-traditions",
                    tabIndex: 2,
                    children: () => {
                      onMount(() => {
                        const focusContext = useFocusContext();
                        policyModel.setActiveFocus(focusContext);
                      });
                      onCleanup(() => {
                        policyModel.setActiveFocus(null);
                      });
                      return (() => {
                        var _el$10 = _tmpl$6(), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild;
                        insert(_el$12, createComponent(For, {
                          get each() {
                            return Array(policyModel.tradSlots).fill(0);
                          },
                          children: () => createComponent(CardSlot, {
                            slotType: "TRADITION_CULTURE_SLOT",
                            get style() {
                              return {
                                height: `${maxGovtCardHeight()}`
                              };
                            }
                          })
                        }), null);
                        insert(_el$12, createComponent(For, {
                          get each() {
                            return Array(policyModel.policySlots).fill(0);
                          },
                          children: () => createComponent(CardSlot, {
                            slotType: "POLICY_CULTURE_SLOT",
                            get style() {
                              return {
                                height: `${maxGovtCardHeight()}`
                              };
                            }
                          })
                        }), null);
                        insert(_el$11, createComponent(For, {
                          get each() {
                            return allActive();
                          },
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
                            get tradSlot() {
                              return activeTraditionCards.includes(item);
                            },
                            get isTradition() {
                              return item.CultureSlotType == "TRADITION_CULTURE_SLOT";
                            },
                            get isNewCard() {
                              return newCardsThisTurn.includes(item.TraditionType);
                            },
                            get autoFocus() {
                              return policyModel.autoFocusCard == item.$index;
                            }
                          })
                        }), null);
                        return _el$10;
                      })();
                    }
                  });
                }
              })];
            }
          })];
        }
      }), _el$9);
      insert(_el$9, createComponent(Show, {
        get when() {
          return policyModel.canSwapPolicies;
        },
        get children() {
          return createComponent(AudioContextProvider, {
            segment: "PolicyConfirmButton",
            get children() {
              return createComponent(Button, {
                "class": `flex w-72 mr-6 `,
                get onActivate() {
                  return policyModel.onConfirmClick;
                },
                get disabled() {
                  return policyModel.confirmDisable;
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
      insert(_el$9, createComponent(Button, {
        "class": "flex w-72",
        get onActivate() {
          return policyModel.onCloseClick;
        },
        get disabled() {
          return policyModel.confirmDisable;
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
      createRenderEffect((_p$) => {
        var _v$ = `flex-auto flex flex-col px-1 ${IsControllerActive() ? "" : "pb-4"}`, _v$2 = `${policyModel.canSwapPolicies ? "" : "hidden"} ${IsControllerActive() ? "" : "my-4"} flex flex-row justify-center`;
        _v$ !== _p$.e && className(_el$, _p$.e = _v$);
        _v$2 !== _p$.t && className(_el$9, _p$.t = _v$2);
        return _p$;
      }, {
        e: void 0,
        t: void 0
      });
      return _el$;
    }
  });
};
const PoliciesCountSubHeader = (props) => {
  return (() => {
    var _el$13 = _tmpl$7(), _el$14 = _el$13.firstChild, _el$15 = _el$14.firstChild;
    insert(_el$15, () => props.count ?? "");
    insert(_el$14, createComponent(L10n.Stylize, {
      get text() {
        return props.text;
      }
    }), null);
    insert(_el$13, createComponent(Filigree.Small, {}), null);
    createRenderEffect(() => className(_el$13, `flex flex-auto flex-col items-center font-title tracking-100 w-full uppercase justify-center ${props.isPolicy ? "policies-text-color" : "text-secondary pb-3 pt-2"}`));
    return _el$13;
  })();
};

export { PoliciesAndTraditions };
//# sourceMappingURL=policies-and-traditions.js.map
