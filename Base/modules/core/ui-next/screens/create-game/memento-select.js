import { template, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, mergeProps, createSignal, createMemo, onMount, For } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Button } from '../../components/button.js';
import { Dropdown, DropdownItem } from '../../components/dropdown.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { NavHelp } from '../../components/nav-help.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { SearchBar } from '../../components/search-bar.js';
import { SpatialSlot } from '../../components/slot.js';
import { Tooltip } from '../../components/tooltip.js';
import { CreateGameHRule2 } from './create-game-components.js';
import { CreateGameStage, CreateGameStageMode, CreateGameStageHeader } from './create-game-stage.js';
import { useMementoSelectModelContext } from './memento-select-model.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { IsControllerActive } from '../../services/input.js';
import { ViewExperience } from '../../services/view-experience.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import style from './memento-select.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class=flex-auto></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="uppercase font-title font-black text-tertiary-1"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex items-center justify-center pb-2 font-semibold"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative flex"><div class="flex flex-row items-start justify-start relative"><div class="img-icon-checkmark size-8 absolute mt-0\\.5 ml-0\\.5"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="img-tag-locked flex flex-row items-start justify-start"><div class="img-lock2 size-8 mt-0\\.5 ml-0\\.5"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div class="flex mr-1 w-48 overflow-hidden absolute inset-0 items-center"><div class="absolute left-2\\.5"></div></div><div class="memento-select-corner-filigree top-left"></div><div class="memento-select-corner-filigree top-right"></div><div class="memento-select-corner-filigree bottom-left"></div><div class="memento-select-corner-filigree bottom-right"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div><div class="absolute -left-2 top-4"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-x-0 inset-y-0\\.5 pointer-events-none"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div><div class="flex absolute inset-0 memento-select-slot"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex-auto font-title relative flex flex-col relative"data-name=layout-center><div class="flex flex-row mt-4 mb-2"><div class="w-full flex flex-row items-center justify-center absolute -top-4"><div class="memento-select-text-info overflow-hidden left"></div><div class="flex flex-col img-unit-panelbox py-4"><div class="flex flex-row justify-between px-2"></div></div><div class="memento-select-text-info overflow-hidden right"></div></div></div><div class="flex flex-row my-2 mt-48 justify-between memento-select-filter-bar"><div class="flex flex-row items-center justify-end"></div></div><div class="flex flex-col flex-auto relative"><div class="memento-select-divider-gradient absolute top-2"></div><div class="memento-select-divider-line my-2 relative"></div></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="mx-2 w-full font-fit-shrink font-body text-accent-2"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex-auto p-3 img-base-ticket-bg"></div>`);
const MementoTextInfo = (props) => {
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(L10n.Compose, {
      get text() {
        return props.mementoName;
      }
    }));
    insert(_el$, createComponent(CreateGameHRule2, {
      color: "#646363",
      "class": "my-2"
    }), null);
    insert(_el$, createComponent(L10n.Stylize, {
      "class": "create-game-markup",
      get text() {
        return props.functionalTextDesc;
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.showFlavor;
      },
      get children() {
        return [_tmpl$(), createComponent(CreateGameHRule2, {
          color: "#646363",
          "class": "mb-2"
        }), createComponent(L10n.Stylize, {
          "class": "create-game-markup font-fit-shrink",
          get text() {
            return props.flavorTextDesc;
          }
        })];
      }
    }), null);
    createRenderEffect(() => className(_el$, `flex-auto flex flex-col ${props.class ?? ""}`));
    return _el$;
  })();
};
const MementoCard = (props) => {
  return (() => {
    var _el$4 = _tmpl$6(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$5.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling, _el$11 = _el$10.nextSibling, _el$12 = _el$11.nextSibling;
    insert(_el$5, createComponent(Icon, {
      "class": "absolute -left-16 opacity-5 size-64",
      get name() {
        return `url('blp:${props.mementoIcon ?? ""}')`;
      },
      isUrl: true
    }), _el$6);
    insert(_el$6, createComponent(Icon, {
      "class": "size-32",
      get name() {
        return `url('blp:${props.mementoIcon ?? ""}')`;
      },
      isUrl: true
    }));
    insert(_el$4, createComponent(MementoTextInfo, mergeProps(props, {
      "class": "mb-4 mt-7 mr-5 ml-40"
    })), _el$7);
    insert(_el$12, createComponent(Show, {
      get when() {
        return props.isNewAndUnseenByPlayer && !props.isEquipped && !props.isLocked;
      },
      get children() {
        var _el$13 = _tmpl$3();
        _el$13.style.setProperty("border-image-source", "url('blp:tag_new.png')");
        _el$13.style.setProperty("border-image-slice", "1 20 1 8 fill");
        _el$13.style.setProperty("border-image-repeat", "stretch");
        _el$13.style.setProperty("border-width", "1px 20px 1px 8px");
        _el$13.style.setProperty("border-style", "solid");
        insert(_el$13, createComponent(L10n.Stylize, {
          "class": "uppercase text-sm font-body",
          text: "LOC_UI_CREATE_GAME_NEW"
        }));
        createRenderEffect((_p$) => {
          var _v$ = Layout.pixels(54), _v$2 = Layout.pixels(43);
          _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$13.style.setProperty("min-width", _v$) : _el$13.style.removeProperty("min-width"));
          _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$13.style.setProperty("height", _v$2) : _el$13.style.removeProperty("height"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$13;
      }
    }), null);
    insert(_el$12, createComponent(Show, {
      get when() {
        return props.isEquipped && !props.isLocked;
      },
      get children() {
        var _el$14 = _tmpl$4(), _el$15 = _el$14.firstChild, _el$16 = _el$15.firstChild;
        _el$15.style.setProperty("border-image-source", "url('blp:tag_equipped.png')");
        _el$15.style.setProperty("border-image-slice", "1 6 1 1 fill");
        _el$15.style.setProperty("border-image-repeat", "stretch");
        _el$16.style.setProperty("fxs-background-image-tint", "black");
        createRenderEffect((_p$) => {
          var _v$3 = Layout.pixels(54), _v$4 = Layout.pixels(43);
          _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$15.style.setProperty("width", _v$3) : _el$15.style.removeProperty("width"));
          _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$15.style.setProperty("height", _v$4) : _el$15.style.removeProperty("height"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$14;
      }
    }), null);
    insert(_el$12, createComponent(Show, {
      get when() {
        return props.isLocked;
      },
      get children() {
        return _tmpl$5();
      }
    }), null);
    createRenderEffect(() => className(_el$4, `flex flex-row relative m-3 p-2 img-unit-panelbox memento-select ${props.isLocked ? "memento-select-locked" : ""}`));
    return _el$4;
  })();
};
const MementoSlot = (props) => {
  return (() => {
    var _el$18 = _tmpl$8(), _el$19 = _el$18.firstChild;
    insert(_el$18, createComponent(Icon, {
      name: 'url("blp:memento_slot-base.png")',
      "class": "absolute -top-4\\.5 -left-4\\.5 memento-select-slot-base opacity-60"
    }), _el$19);
    _el$19.style.setProperty("background-image", "url('blp:shell_memento-maj-plus.png')");
    _el$19.style.setProperty("background-repeat", "no-repeat");
    _el$19.style.setProperty("background-position", "center");
    insert(_el$18, createComponent(Icon, {
      get name() {
        return `url('blp:${props.memento?.icon ?? ""}')`;
      },
      isUrl: true,
      "class": "memento-select-slot-icon absolute"
    }), null);
    insert(_el$18, createComponent(Show, {
      get when() {
        return props.isSelected;
      },
      get children() {
        return _tmpl$7();
      }
    }), null);
    createRenderEffect(() => className(_el$18, `flex items-center justify-center py-1 img-unit-panelbox relative group memento-select-slot ${props.class ?? ""}`));
    return _el$18;
  })();
};
const MementoSelectComponent = () => {
  const model = useMementoSelectModelContext();
  const flowContext = useScreenFlowContext();
  const filterItems = [["ALL", "LOC_LEGACIES_FILTER_ALL_ATTRIBUTES"], ["CULTURAL", "LOC_ATTRIBUTE_CULTURAL"], ["ECONOMIC", "LOC_ATTRIBUTE_ECONOMIC"], ["SCIENTIFIC", "LOC_ATTRIBUTE_SCIENTIFIC"], ["MILITARISTIC", "LOC_ATTRIBUTE_MILITARISTIC"], ["EXPANSIONIST", "LOC_ATTRIBUTE_EXPANSIONIST"], ["DIPLOMATIC", "LOC_ATTRIBUTE_POLITICAL"], ["WILDCARD", "LOC_ATTRIBUTE_WILDCARD"]];
  const [selectedFilter, setSelectedFilter] = createSignal(filterItems[0]);
  const [textFilter, setTextFilter] = createSignal("");
  const isSmallScreen = useIsSmallScreen();
  const enableTextFilter = createMemo(() => ViewExperience() == UIViewExperience.Desktop);
  const showSearch = createMemo(() => !isSmallScreen() && enableTextFilter() && !IsControllerActive());
  const searchResults = createMemo(() => textFilter() ? model.fulltextSearch(textFilter()) : /* @__PURE__ */ new Set());
  const selectedFilterLower = createMemo(() => {
    const filter = selectedFilter()[0].toLowerCase();
    return filter === "all" ? null : filter;
  });
  const filteredMementos = createMemo(() => {
    const category = selectedFilterLower();
    const search = textFilter().toLowerCase();
    const textFilterEnabled = enableTextFilter();
    return model.mementos.filter((memento) => {
      const matchesCategory = !category || memento.mementoTags.toLowerCase().includes(category);
      const matchesText = !textFilterEnabled || !search || searchResults().has(memento.mementoTypeId);
      return matchesCategory && matchesText;
    }).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      if (a.displayType !== b.displayType) {
        return a.displayType === DisplayType.DISPLAY_UNLOCKED ? -1 : 1;
      }
      return 0;
    });
  });
  const numMementos = createMemo(() => filteredMementos().length);
  const slot1Memento = createMemo(() => model.mementos.find((m) => m.mementoTypeId == model.slots[0]?.currentMemento.value));
  const slot2Memento = createMemo(() => model.mementos.find((m) => m.mementoTypeId == model.slots[1]?.currentMemento.value));
  const areSlotsFull = createMemo(() => !!(slot1Memento() && slot2Memento()));
  const isAgeTransition = UI.isInGame();
  function handleEquip(memento) {
    if (memento.displayType == DisplayType.DISPLAY_UNLOCKED) {
      model.equipMemento(memento);
    }
  }
  onMount(() => {
    waitForLayout(() => {
      if (Configuration.getGame().isHotseat) {
        flowContext.activateNext();
      }
    });
  });
  return createComponent(CreateGameStage, {
    get header() {
      return createComponent(CreateGameStageHeader, {
        showSteps: false,
        title: "LOC_UI_CREATE_GAME_MEMENTO_SELECT",
        hideButtonText: isAgeTransition ? "LOC_UI_AGE_TRANSITION_VIEW_MAP" : void 0
      });
    },
    get mode() {
      return isAgeTransition ? CreateGameStageMode.StageOnly : CreateGameStageMode.Full;
    },
    get children() {
      return [createComponent(Hotkeys, {
        hotkeys: [{
          hotkeyAction: "shell-action-2",
          navTrayText: "LOC_UI_FILTER_SORT_FILTERS"
        }]
      }), createComponent(AudioContextProvider, {
        segment: "MementoSelect",
        get children() {
          var _el$21 = _tmpl$9(), _el$22 = _el$21.firstChild, _el$23 = _el$22.firstChild, _el$24 = _el$23.firstChild, _el$25 = _el$24.nextSibling, _el$26 = _el$25.firstChild, _el$27 = _el$25.nextSibling, _el$28 = _el$22.nextSibling, _el$29 = _el$28.firstChild, _el$30 = _el$28.nextSibling, _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling;
          insert(_el$24, createComponent(Show, {
            get when() {
              return slot1Memento();
            },
            get children() {
              return createComponent(MementoTextInfo, mergeProps(() => slot1Memento(), {
                "class": "mr-5",
                showFlavor: true
              }));
            }
          }));
          insert(_el$26, createComponent(For, {
            get each() {
              return model.slots;
            },
            children: (slot, index) => createComponent(AudioContextProvider, {
              segment: "MementoSlot",
              get children() {
                return createComponent(Tooltip.Text, {
                  get text() {
                    return slot.currentMemento.name ?? "LOC_UI_CREATE_GAME_EMPTY";
                  },
                  get children() {
                    return createComponent(Activatable, {
                      disableFocus: true,
                      onActivate: () => model.setSelectedSlot(index()),
                      get hotkeyAction() {
                        return slot.hotkey;
                      },
                      "class": "relative",
                      get children() {
                        return [createComponent(MementoSlot, {
                          get memento() {
                            return slot.currentMemento;
                          },
                          get isSelected() {
                            return model.selectedSlot() == index();
                          },
                          "class": "mx-2"
                        }), createComponent(NavHelp, {
                          "class": "absolute bottom-4 right-6"
                        })];
                      }
                    });
                  }
                });
              }
            })
          }));
          insert(_el$25, createComponent(Show, {
            when: isAgeTransition,
            get fallback() {
              return createComponent(Button, {
                "class": "h-12 mx-4 mt-4",
                onActivate: () => flowContext.activatePrev(),
                get autoFocus() {
                  return areSlotsFull();
                },
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_UI_CREATE_GAME_CONFIRM_SELECTIONS"
                  });
                }
              });
            },
            get children() {
              return createComponent(Button, {
                "class": "create-game-setup-button",
                onActivate: () => flowContext.activateNext(),
                get autoFocus() {
                  return areSlotsFull();
                },
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_GENERIC_CONTINUE"
                  });
                }
              });
            }
          }), null);
          insert(_el$27, createComponent(Show, {
            get when() {
              return slot2Memento();
            },
            get children() {
              return createComponent(MementoTextInfo, mergeProps(() => slot2Memento(), {
                "class": "ml-5",
                showFlavor: true
              }));
            }
          }));
          insert(_el$28, createComponent(Show, {
            get when() {
              return showSearch();
            },
            get children() {
              return createComponent(SearchBar, {
                value: textFilter,
                setValue: setTextFilter,
                "class": "w-76"
              });
            }
          }), _el$29);
          insert(_el$29, createComponent(L10n.Stylize, {
            text: "LOC_UI_CREATE_GAME_MEMENTOS_NUM",
            get args() {
              return [numMementos()];
            },
            "class": "ml-3 items-center justify-center font-body text-accent-2 uppercase"
          }), null);
          insert(_el$29, createComponent(AudioContextProvider, {
            segment: "FilterDropdown",
            get children() {
              return createComponent(Dropdown, {
                get defaultValue() {
                  return filterItems[0];
                },
                selectedItemTemplate: (item) => (() => {
                  var _el$33 = _tmpl$10();
                  insert(_el$33, createComponent(L10n.Compose, {
                    text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
                    get args() {
                      return [Locale.toUpper(Locale.compose(item[1]))];
                    }
                  }));
                  return _el$33;
                })(),
                hotkey: "shell-action-2",
                onItemSelected: (item) => setSelectedFilter(item),
                "class": "memento-select-dropdown min-w-76",
                disableFocus: true,
                get children() {
                  return createComponent(For, {
                    each: filterItems,
                    children: (item) => createComponent(DropdownItem, {
                      value: item,
                      get children() {
                        return Locale.toUpper(Locale.compose(item[1]));
                      }
                    })
                  });
                }
              });
            }
          }), null);
          insert(_el$30, createComponent(ScrollArea, {
            "class": "flex-auto ml-8 mr-1\\.5 mb-0\\.5 relative",
            get children() {
              return createComponent(SpatialSlot, {
                name: "create-game-mementos-slot",
                "class": "flex flex-row flex-wrap",
                get autoFocus() {
                  return !areSlotsFull();
                },
                get children() {
                  return createComponent(For, {
                    get each() {
                      return filteredMementos();
                    },
                    children: (memento) => createComponent(Tooltip, {
                      get children() {
                        return createComponent(AudioContextProvider, {
                          segment: "MementoArray",
                          get vars() {
                            return {
                              isEquipped: (slot1Memento() == memento || slot2Memento() == memento).toString()
                            };
                          },
                          get children() {
                            return [createComponent(Tooltip.Trigger, {
                              get children() {
                                return createComponent(Activatable, {
                                  onActivate: () => handleEquip(memento),
                                  "class": "group",
                                  get children() {
                                    return createComponent(MementoCard, mergeProps(memento, {
                                      get isEquipped() {
                                        return slot1Memento() == memento || slot2Memento() == memento;
                                      },
                                      get isLocked() {
                                        return memento.displayType == DisplayType.DISPLAY_LOCKED;
                                      }
                                    }));
                                  }
                                });
                              }
                            }), createComponent(Show, {
                              get when() {
                                return memento.displayType == DisplayType.DISPLAY_LOCKED;
                              },
                              get children() {
                                return createComponent(Tooltip.Content, {
                                  get children() {
                                    return createComponent(Tooltip.Frame, {
                                      "class": "relative flex flex-col pb-1 max-w-128",
                                      get children() {
                                        var _el$34 = _tmpl$11();
                                        insert(_el$34, createComponent(L10n.Stylize, {
                                          get text() {
                                            return memento.unlockReason;
                                          },
                                          "class": "relative"
                                        }));
                                        return _el$34;
                                      }
                                    });
                                  }
                                });
                              }
                            })];
                          }
                        });
                      }
                    })
                  });
                }
              });
            }
          }), null);
          return _el$21;
        }
      })];
    }
  });
};
const MementoSelect = ComponentRegistry.register({
  name: "memento-select",
  createInstance: MementoSelectComponent,
  styles: [style]
});

export { MementoSelect };
//# sourceMappingURL=memento-select.js.map
