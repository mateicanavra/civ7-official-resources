import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, onMount, onCleanup, createComponent, Show, For, createMemo, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { CollapsibleContainer } from '../../../../core/ui-next/components/collapsible-container.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { Header } from '../../../../core/ui-next/components/header.js';
import { InnerFrame } from '../../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { HSlot, SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { isMobile } from '../../../../core/ui-next/services/view-experience.js';
import { useIsSmallScreen } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { DedicationCard } from './dedication-selection.js';
import { DedicationsModel, DedicationsFilterOptions } from './dedications-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex items-center justify-center text-accent-3 text-base w-full text-center min-h-38"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex justify-center flex-auto flex-wrap p-1"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex my-2"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex items-center"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex w-full justify-end px-6 mt-2 items-center"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex justify-center items-start flex-wrap p-1"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex justify-center text-accent-2 text-base w-full m-6 p-3"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<span class="m-1"></span>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="px-10 pb-2 flex flex-auto flex-col"><div class="text-accent-2 w-full text-center my-1"></div></div>`);
const DedicationTab = () => {
  const dropdownDedicationItems = ["ALL", "DEFAULT", "CULTURAL", "DIPLOMATIC", "ECONOMIC", "EXPANSIONIST", "MILITARISTIC", "SCIENTIFIC", "CRISIS"];
  const model = DedicationsModel.get();
  const hotkeyContext = useContext(HotkeyContext);
  const isSmallScreen = useIsSmallScreen();
  onMount(() => {
    hotkeyContext.registerNavtray("shell-action-2", "LOC_ADVANCED_START_FILTER");
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("shell-action-2");
  });
  const activeLegaciesContainer = () => {
    return createComponent(CollapsibleContainer, {
      get titleText() {
        return GameInfo.Ages.lookup(Game.age)?.AgeType != "AGE_ANTIQUITY" && Configuration.getGame().previousAgeCount == 0 ? "LOC_DEDICATIONS_ACTIVE_LEGACIES" : "LOC_DEDICATIONS_ACTIVE_DEDICATIONS";
      },
      "class": "w-full",
      headerClass: "fxs-header text-gradient-base",
      centerTitle: true,
      get disabled() {
        return !model.isPlacementComplete() || model.state.selectedItems.length <= 0;
      },
      get children() {
        var _el$ = _tmpl$3();
        insert(_el$, createComponent(Show, {
          get when() {
            return !model.isPlacementComplete() || model.state.selectedItems.length <= 0;
          },
          get children() {
            var _el$2 = _tmpl$();
            insert(_el$2, createComponent(L10n.Compose, {
              text: "LOC_DEDICATIONS_EMPTY_DESC"
            }));
            return _el$2;
          }
        }), null);
        insert(_el$, createComponent(Show, {
          get when() {
            return model.isPlacementComplete() && model.state.selectedItems.length > 0;
          },
          get children() {
            var _el$3 = _tmpl$2();
            insert(_el$3, createComponent(For, {
              get each() {
                return model.state.items.filter((item) => model.state.selectedItems.some((selected) => selected.info.id == item.id));
              },
              children: (card) => createComponent(DedicationCard, {
                get id() {
                  return card.id;
                },
                get ["class"]() {
                  return createMemo(() => !!isMobile())() ? `my-4 ${isSmallScreen() ? "mx-4" : "mx-7"}` : "m-3";
                },
                get title() {
                  return card.title;
                },
                get description() {
                  return card.description;
                },
                get background() {
                  return card.descriptionBG;
                },
                get icon() {
                  return card.traitIcon;
                },
                isDisplayOnly: true
              })
            }));
            createRenderEffect(() => _el$3.classList.toggle("items-start", !!(GameInfo.Ages.lookup(Game.age)?.AgeType != "AGE_ANTIQUITY" && Configuration.getGame().previousAgeCount == 0)));
            return _el$3;
          }
        }), null);
        createRenderEffect(() => _el$.classList.toggle("flex-auto", !!(model.isPlacementComplete() && model.state.selectedItems.length > 0)));
        return _el$;
      }
    });
  };
  const availableLegaciesContainer = () => {
    return createComponent(CollapsibleContainer, {
      get titleText() {
        return GameInfo.Ages.lookup(Game.age)?.AgeType != "AGE_ANTIQUITY" && Configuration.getGame().previousAgeCount == 0 ? "LOC_DEDICATIONS_ADVANCED_START_LEGACIES" : "LOC_DEDICATIONS_AVAILABLE_DEDICATIONS";
      },
      "class": "flex flex-col items-center flex-auto w-full mt-4",
      headerClass: "fxs-header text-gradient-base",
      get disabled() {
        return Game.AgeProgressManager.isFinalAge;
      },
      centerTitle: true,
      get children() {
        return createComponent(Show, {
          get when() {
            return !Game.AgeProgressManager.isFinalAge;
          },
          get fallback() {
            return (() => {
              var _el$7 = _tmpl$7();
              _el$7.style.setProperty("border", "1px solid");
              _el$7.style.setProperty("border-image-slice", "1");
              _el$7.style.setProperty("border-width", "1px");
              _el$7.style.setProperty("border-image-source", "linear-gradient(to right, rgba(85, 85, 85, 0), rgba(85, 85, 85, 1), rgba(85, 85, 85, 0))");
              _el$7.style.setProperty("background-image", "linear-gradient(to right, rgba(42, 42, 48, 0), rgba(42, 42, 48, 1), rgba(42, 42, 48, 0))");
              insert(_el$7, createComponent(L10n.Compose, {
                text: "LOC_DEDICATIONS_FINAL_AGE_DESC"
              }));
              return _el$7;
            })();
          },
          get children() {
            return [(() => {
              var _el$4 = _tmpl$5();
              insert(_el$4, createComponent(HSlot, {
                "class": "flex",
                get children() {
                  var _el$5 = _tmpl$4();
                  insert(_el$5, createComponent(Header, {
                    "class": `uppercase text-sm text-secondary font-title`,
                    get children() {
                      return createComponent(L10n.Compose, {
                        text: "LOC_ADVANCED_START_FILTER"
                      });
                    }
                  }), null);
                  insert(_el$5, createComponent(Dropdown, {
                    disableFocus: true,
                    "class": "ml-2 w-60 pointer-events-auto grow-0",
                    selectedItemTemplate: (item) => (() => {
                      var _el$8 = _tmpl$8();
                      insert(_el$8, createComponent(L10n.Stylize, {
                        get text() {
                          return Locale.compose(`LOC_LEGACIES_FILTER_${item}`);
                        }
                      }));
                      return _el$8;
                    })(),
                    get defaultValue() {
                      return DedicationsFilterOptions.ALL;
                    },
                    onItemSelected: (item) => model.setSelectedDedicationFilter(item),
                    hotkey: "shell-action-2",
                    get children() {
                      return createComponent(For, {
                        each: dropdownDedicationItems,
                        children: (item) => createComponent(DropdownItem, {
                          value: item,
                          get children() {
                            return createComponent(L10n.Stylize, {
                              get text() {
                                return Locale.stylize(`LOC_LEGACIES_FILTER_${item}`);
                              }
                            });
                          }
                        })
                      });
                    }
                  }), null);
                  return _el$5;
                }
              }));
              return _el$4;
            })(), createComponent(Divider.Horizontal, {
              "class": "w-full h-0\\\\.5 my-2"
            }), createComponent(ScrollArea, {
              "class": "flex-auto",
              useProxy: true,
              get children() {
                var _el$6 = _tmpl$6();
                insert(_el$6, createComponent(For, {
                  get each() {
                    return model.state.legacies;
                  },
                  children: (card) => createComponent(Show, {
                    get when() {
                      return card.filterOptions?.find((filter) => {
                        return filter == model.selectedDedicationFilter();
                      });
                    },
                    get children() {
                      return createComponent(DedicationCard, {
                        get id() {
                          return card.id;
                        },
                        get ["class"]() {
                          return createMemo(() => !!isMobile())() ? `my-4 ${isSmallScreen() ? "mx-4" : "mx-7"}` : "m-3";
                        },
                        get title() {
                          return card.title;
                        },
                        get description() {
                          return card.description;
                        },
                        get background() {
                          return card.descriptionBG;
                        },
                        get icon() {
                          return card.traitIcon;
                        },
                        get disabled() {
                          return card.isDisabled;
                        },
                        isDisplayOnly: true
                      });
                    }
                  })
                }));
                return _el$6;
              }
            })];
          }
        });
      }
    });
  };
  return (() => {
    var _el$9 = _tmpl$9(), _el$10 = _el$9.firstChild;
    insert(_el$10, createComponent(L10n.Compose, {
      text: "LOC_DEDICATIONS_DESC"
    }));
    insert(_el$9, createComponent(InnerFrame, {
      get ["class"]() {
        return `px-2 py-3 flex-auto ${isMobile() && IsControllerActive() ? "mb-8" : ""}`;
      },
      style: {
        "background-image": "linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.7), rgba(20, 20, 20, 0.8))"
      },
      get children() {
        return createComponent(Show, {
          get when() {
            return isMobile();
          },
          get fallback() {
            return [createMemo(activeLegaciesContainer), createMemo(availableLegaciesContainer)];
          },
          get children() {
            return createComponent(SpatialSlot, {
              name: "DedicationsTabScrollable",
              "class": "flex-auto px-2",
              get children() {
                return createComponent(ScrollArea, {
                  "class": "flex-auto pl-4",
                  get children() {
                    return [createMemo(() => activeLegaciesContainer()), createMemo(() => availableLegaciesContainer())];
                  }
                });
              }
            });
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = !model.isSmallScreen(), _v$2 = !!(model.isSmallScreen() && !isMobile()), _v$3 = !!(model.isSmallScreen() && isMobile()), _v$4 = !isMobile(), _v$5 = !!isMobile();
      _v$ !== _p$.e && _el$9.classList.toggle("px-10", _p$.e = _v$);
      _v$2 !== _p$.t && _el$9.classList.toggle("px-4", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$9.classList.toggle("px-5", _p$.a = _v$3);
      _v$4 !== _p$.o && _el$10.classList.toggle("text-xs", _p$.o = _v$4);
      _v$5 !== _p$.i && _el$10.classList.toggle("text-sm", _p$.i = _v$5);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    });
    return _el$9;
  })();
};

export { DedicationTab };
//# sourceMappingURL=dedication-tab.js.map
