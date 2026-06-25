import { template, use, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { InnerFrame } from '../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { RingMeter } from '../../../core/ui-next/components/ring-meter.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { TicketBox } from '../../../core/ui-next/screens/create-game/ticket-box.js';
import { GovtScreenModel } from './model-government.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative font-body-base text-accent-2 p-6 my-px flex flex-col items-center"><div class="policies__overview-government-divider w-128 h-px mt-3 mb-2"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex w-full flex-col "></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="policies__overview-government-divider w-128 h-px mt-3"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="relative font-body-base px-8 py-4 my-px flex flex-col items-center"><div class="relative flex flex-col items-start"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="relative font-body-base px-8 py-4 my-px flex flex-col w-full items-center"><div class="relative flex flex-col items-start w-full"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="p-5 w-full"><div class="text-accent-2 font-title uppercase tracking-100 bg-primary-4 w-full p-3"></div><div class="w-full mx-8 mb-12 bg-primary-5 "></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="policies__overview-happiness-meter-circle bg-no-repeat bg-center bg-cover size-22 flex items-center justify-center"><div class="policies__overview-happiness-meter-image bg-no-repeat bg-center bg-cover size-12"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex items-center relative w-full pr-18 pl-10 justify-between"><div class="flex items-center"><div class="flex flex-col pointer-events-auto"><div class="policies__overview-turns-left-number font-body-sm"></div></div></div><div class=mr-7><div class="flex flex-col text-accent-2 items-center pointer-events-auto"><div data-l10n-id=LOC_ATTR_YIELD_INCOME class="font-title-xs uppercase text-accent-3 tracking-100"></div><div class="font-body tracking-100 max-w-60 mb-3"></div></div></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex-auto flex text-center flex-col px-2 pb-4"><div class="p-3 flex-auto flex flex-row w-full"><div class="gov-outer-container py-3 px-6 flex-1 h-full mx-2"><div class="flex flex-row mr-1 w-full"></div></div><div class="gov-outer-container p-3 h-full flex-1 mx-2 w-full"></div></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-auto flex-col w-full"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="w-full text-accent-3 flex items-center flex-row mb-4"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="w-full text-accent-3 flex items-center flex-row mb-2"><div class="flex flex-col ml-1 flex-auto text-left"></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div><div class="flex flex-row w-full justify-between"><div class="flex flex-row items-center"></div><span class=font-bold></span></div></div>`);
const GovernmentOverview = () => {
  let root;
  const govModel = GovtScreenModel.get();
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      var _el$ = _tmpl$10(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$15 = _el$3.nextSibling;
      var _ref$ = root;
      typeof _ref$ === "function" ? use(_ref$, _el$) : root = _el$;
      insert(_el$3, createComponent(ScrollArea, {
        "class": "flex-auto h-full",
        useProxy: true,
        get children() {
          return [(() => {
            var _el$5 = _tmpl$2();
            insert(_el$5, createComponent(FiligreeTitle.H4, {
              text: "LOC_UI_POLICIES_CURRENT_GOVERNMENT",
              "filigree-style": "h4",
              "class": "mt-4 mb-3"
            }), null);
            insert(_el$5, createComponent(InnerFrame, {
              "class": "flex flex-col items-center relative px-2",
              get children() {
                return createComponent(Show, {
                  get when() {
                    return govModel.data.hasGovtBeenChosen;
                  },
                  get fallback() {
                    return createComponent(L10n.Stylize, {
                      "class": "py-9 text-accent-4",
                      text: "LOC_UI_NO_GOVERNMENT_CHOSEN"
                    });
                  },
                  get children() {
                    var _el$6 = _tmpl$(), _el$7 = _el$6.firstChild;
                    insert(_el$6, createComponent(L10n.Stylize, {
                      get text() {
                        return govModel.data.governmentName;
                      },
                      "class": "uppercase relative font-bold tracking-150 font-title-2xl"
                    }), _el$7);
                    insert(_el$6, createComponent(L10n.Stylize, {
                      text: "LOC_UI_GOVERNMENT_ABILITY",
                      "class": "uppercase relative text-accent-4 font-title-sm tracking-100 mt-5 mb-2"
                    }), null);
                    insert(_el$6, createComponent(L10n.Stylize, {
                      get text() {
                        return govModel.data.governmentAbilityDescription;
                      },
                      "class": "relative text-accent-3 mb-4"
                    }), null);
                    return _el$6;
                  }
                });
              }
            }), null);
            return _el$5;
          })(), (() => {
            var _el$8 = _tmpl$2();
            insert(_el$8, createComponent(FiligreeTitle.H4, {
              text: "LOC_UI_CELEBRATION_OPTIONS",
              "filigree-style": "h4",
              "class": "mt-4 mb-3"
            }), null);
            insert(_el$8, createComponent(InnerFrame, {
              "class": "flex flex-col items-center relative px-2",
              get children() {
                return createComponent(Show, {
                  get when() {
                    return govModel.data.hasGovtBeenChosen;
                  },
                  get fallback() {
                    return createComponent(L10n.Stylize, {
                      "class": "py-9 text-accent-4",
                      text: "LOC_UI_NO_GOVERNMENT_CHOSEN"
                    });
                  },
                  get children() {
                    return [(() => {
                      var _el$9 = _tmpl$3();
                      insert(_el$9, createComponent(L10n.Stylize, {
                        get text() {
                          return govModel.data.governmentDescription;
                        },
                        "class": "relative text-accent-4 font-sm mt-4"
                      }));
                      return _el$9;
                    })(), _tmpl$4(), (() => {
                      var _el$11 = _tmpl$5(), _el$12 = _el$11.firstChild;
                      insert(_el$12, createComponent(For, {
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
                      return _el$11;
                    })()];
                  }
                });
              }
            }), null);
            insert(_el$8, createComponent(FiligreeTitle.H4, {
              text: "LOC_UI_TRADITIONS_TITLE",
              "filigree-style": "h4",
              "class": "mt-4 mb-3"
            }), null);
            insert(_el$8, createComponent(InnerFrame, {
              "class": "flex flex-col items-center relative px-2",
              get children() {
                return createComponent(Show, {
                  get when() {
                    return govModel.data.hasGovtBeenChosen;
                  },
                  get fallback() {
                    return createComponent(L10n.Stylize, {
                      "class": "py-9 text-accent-4",
                      text: "LOC_UI_NO_GOVERNMENT_CHOSEN"
                    });
                  },
                  get children() {
                    var _el$13 = _tmpl$6(), _el$14 = _el$13.firstChild;
                    insert(_el$14, createComponent(For, {
                      get each() {
                        return govModel.data.govtTraditions;
                      },
                      children: (item) => (() => {
                        var _el$28 = _tmpl$11();
                        insert(_el$28, createComponent(TraditionItem, {
                          get itemName() {
                            return item.Name;
                          },
                          get description() {
                            return item.Description ?? "";
                          },
                          image: `url(blp:unlock_tradition)`
                        }), null);
                        insert(_el$28, createComponent(Show, {
                          get when() {
                            return item != govModel.data.govtTraditions[govModel.data.govtTraditions.length - 1];
                          },
                          get children() {
                            return createComponent(Divider, {});
                          }
                        }), null);
                        return _el$28;
                      })()
                    }));
                    return _el$13;
                  }
                });
              }
            }), null);
            return _el$8;
          })()];
        }
      }), null);
      insert(_el$15, createComponent(ScrollArea, {
        "class": "flex-auto h-full",
        useProxy: true,
        get children() {
          return [createComponent(FiligreeTitle.H4, {
            text: "LOC_TAG_CONSTRUCTIBLE_HAPPINESS",
            "filigree-style": "h4",
            "class": "mt-4 mb-3"
          }), createComponent(InnerFrame, {
            "class": "p-2 flex flex-auto w-full",
            get children() {
              return [(() => {
                var _el$16 = _tmpl$7(), _el$17 = _el$16.firstChild, _el$18 = _el$17.nextSibling;
                insert(_el$17, createComponent(L10n.Stylize, {
                  text: "LOC_UI_SETTLEMENT_HAPPINESS"
                }));
                insert(_el$18, createComponent(For, {
                  get each() {
                    return govModel.data.settlementHappiness();
                  },
                  children: (item, index) => createComponent(HappinessRow, {
                    get index() {
                      return index();
                    },
                    get happinessRange() {
                      return item.happinessRange;
                    },
                    get iconName() {
                      return item.icon;
                    },
                    get rowName() {
                      return item.stageName;
                    },
                    get amount() {
                      return item.settlements;
                    },
                    get ["class"]() {
                      return item.textColor;
                    }
                  })
                }));
                return _el$16;
              })(), createComponent(TicketBox, {
                "class": "flex items-center relative",
                get children() {
                  var _el$19 = _tmpl$9(), _el$20 = _el$19.firstChild, _el$22 = _el$20.firstChild, _el$23 = _el$22.firstChild, _el$24 = _el$20.nextSibling, _el$25 = _el$24.firstChild, _el$26 = _el$25.firstChild, _el$27 = _el$26.nextSibling;
                  insert(_el$20, createComponent(RingMeter, {
                    get value() {
                      return govModel.data.happinessRing;
                    },
                    min: 0,
                    max: 100,
                    ringImage: "url(blp:govt_happ_circle_rad)",
                    "class": "policies__overview-happiness-meter size-28 flex items-center justify-center",
                    get children() {
                      return _tmpl$8();
                    }
                  }), _el$22);
                  insert(_el$22, createComponent(L10n.Stylize, {
                    "class": "font-body-sm",
                    get text() {
                      return govModel.data.celebrationTurnsLeft;
                    }
                  }), null);
                  insert(_el$27, createComponent(L10n.Stylize, {
                    get text() {
                      return govModel.data.happinessPerTurn;
                    }
                  }));
                  insert(_el$25, createComponent(L10n.Stylize, {
                    "class": "text-accent-3 font-title-xs tracking-100 uppercase",
                    text: "LOC_UI_HAPPINESS_NEEDED"
                  }), null);
                  insert(_el$25, () => govModel.data.happinessNeeded + "/" + govModel.data.happinessNextCelebrationThreshold, null);
                  return _el$19;
                }
              }), createComponent(L10n.Stylize, {
                "class": "p-6 text-accent-4",
                text: "LOC_GOVERNMENT_HAPPINESS_REMINDER_TEXT"
              })];
            }
          })];
        }
      }));
      return _el$;
    }
  });
};
const CelebrationItem = (props) => {
  return (() => {
    var _el$29 = _tmpl$12();
    insert(_el$29, createComponent(Icon, {
      "class": "size-10",
      get name() {
        return props.image;
      },
      isUrl: true
    }), null);
    insert(_el$29, createComponent(L10n.Stylize, {
      "class": "ml-1 flex flex-auto text-left",
      get text() {
        return props.description;
      }
    }), null);
    return _el$29;
  })();
};
const TraditionItem = (props) => {
  return (() => {
    var _el$30 = _tmpl$13(), _el$31 = _el$30.firstChild;
    insert(_el$30, createComponent(Icon, {
      "class": "size-10",
      get name() {
        return props.image;
      },
      isUrl: true
    }), _el$31);
    insert(_el$30, createComponent(Divider, {
      vertical: true
    }), _el$31);
    insert(_el$31, createComponent(L10n.Stylize, {
      "class": "text-secondary uppercase tracking-100 font-title",
      get text() {
        return props.itemName ?? "";
      }
    }), null);
    insert(_el$31, createComponent(L10n.Stylize, {
      get text() {
        return props.description;
      }
    }), null);
    return _el$30;
  })();
};
const Divider = (props) => {
  return (() => {
    var _el$32 = _tmpl$14();
    createRenderEffect(() => className(_el$32, `${props.vertical ? "h-full w-px mx-2" : "w-full h-px my-2"} flex bg-primary-3`));
    return _el$32;
  })();
};
const HappinessRow = (props) => {
  return (() => {
    var _el$33 = _tmpl$15(), _el$34 = _el$33.firstChild, _el$35 = _el$34.firstChild, _el$36 = _el$35.nextSibling;
    insert(_el$33, createComponent(Icon, {
      "class": "size-8",
      get name() {
        return props.iconName;
      }
    }), _el$34);
    insert(_el$35, createComponent(L10n.Stylize, {
      "class": "uppercase",
      get text() {
        return props.rowName ?? "";
      }
    }), null);
    insert(_el$35, createComponent(L10n.Stylize, {
      "class": "ml-4 text-accent-4 text-xs",
      get text() {
        return props.happinessRange;
      }
    }), null);
    insert(_el$36, () => props.amount);
    createRenderEffect(() => className(_el$33, `py-2 pl-2 pr-12 items-center flex flex-auto ${props.class} ${props.index % 2 === 0 ? "overview-happiness-row-1" : ".overview-happiness-row-2"} border-primary-3 border w-full justify-between`));
    return _el$33;
  })();
};

export { GovernmentOverview };
//# sourceMappingURL=government-overview.js.map
