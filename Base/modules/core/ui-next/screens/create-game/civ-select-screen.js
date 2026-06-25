import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, onMount, createComponent, Show, For, createRenderEffect, mergeProps } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Dropdown, DropdownItem } from '../../components/dropdown.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { NavHelp } from '../../components/nav-help.js';
import { Popup } from '../../components/popup.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { SearchBar } from '../../components/search-bar.js';
import { HSlot, SpatialSlot } from '../../components/slot.js';
import { Tab } from '../../components/tab.js';
import { Tooltip } from '../../components/tooltip.js';
import { useAgeSelectModelContext } from './age-select-model.js';
import { CivCard } from './civ-card.js';
import { useCivSelectModelContext, createAgeFilterModel, attrFilter } from './civ-select-model.js';
import { CreateGameHRule } from './create-game-components.js';
import { CreateGameStage, CreateGameStageMode, CreateGameStageHeader } from './create-game-stage.js';
import { LeaderSelectButtonBase } from './leader-select-button.js';
import { useLeaderSelectModelContext } from './leader-select-model.js';
import { useRecommendedChoiceModelContext } from './recommended-choice-model.js';
import { CivUnlocksModel } from '../unlocks/civ-unlocks-model.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { IsControllerActive } from '../../services/input.js';
import { ViewExperience } from '../../services/view-experience.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import style from './civ-select-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col items-center justify-end group"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div><div class="flex items-center justify-center size-36 relative mb-4"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row ml-6 mr-1\\.25 mt-1 mb-2 uppercase accent-2 font-bold"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col size-full civ-age-select-body flex-auto"><div class="flex flex-col ml-10 mr-8"><div class="flex flex-row mt-4 mb-2 items-center"><div class=flex-auto></div><span class="mr-3 text-accent-2 uppercase"></span></div></div><div class="flex flex-row flex-auto"><div class="flex flex-col items-center h-full w-52"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="mx-2 w-full font-fit-shrink"></div>`);
const CivSelectScreenComponent = () => {
  const model = useCivSelectModelContext();
  const ageModel = useAgeSelectModelContext();
  const leaderModel = useLeaderSelectModelContext();
  const recModel = useRecommendedChoiceModelContext();
  const screenFlow = useScreenFlowContext();
  const ageFilter = createAgeFilterModel();
  const [filtersFocused, setFiltersFocused] = createSignal(false);
  const attributeFilters = ["LOC_LEGACIES_FILTER_ALL_ATTRIBUTES"];
  Database.query("config", "SELECT * FROM Tags WHERE TagCategoryType = 'TAG_CATEGORY_TRAIT' AND TagType IN (SELECT DISTINCT TagType FROM CivilizationTags)")?.forEach((tag) => {
    if (tag.Name) attributeFilters.push(tag.Name);
  });
  const isAgeTransition = createMemo(() => UI.isInGame());
  const [textFilter, setTextFilter] = createSignal("");
  const enableTextFilter = createMemo(() => ViewExperience() == UIViewExperience.Desktop && !IsControllerActive());
  const isSmallScreen = useIsSmallScreen();
  const showSearch = createMemo(() => !isSmallScreen() && enableTextFilter());
  const searchResults = createMemo(() => textFilter() ? model.fulltextSearch(textFilter()) : /* @__PURE__ */ new Set());
  function shouldShowCiv(civ) {
    const matchAge = civ.civID != "RANDOM" && ageFilter.isMatch(civ.apexAge);
    const isPreviousCiv = isAgeTransition() ? civ.civID == model.previousCiv()?.civID : false;
    const matchAttribute = civ.civID != "RANDOM" && (attrFilter.getFilter() == "LOC_LEGACIES_FILTER_ALL_ATTRIBUTES" || !attrFilter.getFilter() || civ.traits.some((t) => t == attrFilter.getFilter()));
    const matchText = !enableTextFilter() || !textFilter() || searchResults().has(civ.civID);
    return matchAge && matchAttribute && matchText && !isPreviousCiv;
  }
  function sortCiv(a, b) {
    const invalidSort = (a.isLocked ? 1 : 0) - (b.isLocked ? 1 : 0);
    if (invalidSort == 0) {
      const ageSort = a.ageSortIndex - b.ageSortIndex;
      return ageSort == 0 ? Locale.compare(a.name, b.name) : ageSort;
    }
    return invalidSort;
  }
  function sortCivWithBias(a, b) {
    const civA = recModel.forLeader().get(a.civID);
    const civB = recModel.forLeader().get(b.civID);
    if (!civA || !civB) return sortCiv(a, b);
    const biasSort = civB.bias - civA.bias;
    return biasSort == 0 ? sortCiv(a, b) : biasSort;
  }
  function isRecommended(civType) {
    if (!isAgeTransition()) return true;
    return [...recModel.historicalCivs(), ...recModel.recommendedCivs()].filter((c) => GameInfo.Civilizations.lookup(c.civID)?.CivilizationType == civType).length > 0;
  }
  const filteredHistoricalCivs = createMemo(() => {
    let civs = recModel.historicalCivs().filter(shouldShowCiv).sort(sortCivWithBias);
    if (isAgeTransition()) {
      const previousCivType = model.previousCiv()?.civID;
      const previousCivInfo = model.civs.filter((c) => GameInfo.Civilizations.lookup(c.civID)?.CivilizationType == previousCivType);
      if (previousCivInfo && previousCivInfo[0]) {
        civs = [previousCivInfo[0], ...civs];
      }
    }
    return civs;
  });
  const filteredRecommendedCivs = createMemo(() => recModel.recommendedCivs().filter(shouldShowCiv).sort(sortCivWithBias));
  const filteredUnrecommendedCivs = createMemo(() => recModel.unrecommendedCivs().filter(shouldShowCiv).sort(sortCiv));
  const groupedCivs = createMemo(() => {
    const ages = {
      AGE_ANTIQUITY: [],
      AGE_EXPLORATION: [],
      AGE_MODERN: []
    };
    filteredUnrecommendedCivs().forEach((civ) => {
      if (ages[civ.apexAge]) {
        ages[civ.apexAge].push(civ);
      }
    });
    return ages;
  });
  const antiquityCivs = createMemo(() => groupedCivs().AGE_ANTIQUITY);
  const explorationCivs = createMemo(() => groupedCivs().AGE_EXPLORATION);
  const modernCivs = createMemo(() => groupedCivs().AGE_MODERN);
  const numCivs = createMemo(() => {
    return Locale.toNumber(filteredRecommendedCivs().length + filteredUnrecommendedCivs().length);
  });
  function selectCiv(civ) {
    if (!civ.isLocked) {
      model.setSelectedCiv(civ);
    }
    model.setViewCiv(civ);
    useAudio("AgeTransition/SelectCiv")("activate");
  }
  function civNameShort(civInfo) {
    let civName = civInfo?.civID.replaceAll("_", "-").toLowerCase();
    civName = civName.replace("civilization-", "");
    return civName;
  }
  const inGameUnlocksModel = isAgeTransition() ? CivUnlocksModel.get() : void 0;
  function getCivInfo(civInfo) {
    return inGameUnlocksModel?.civInfo.find((c) => c.civID == civInfo.civID) ?? civInfo;
  }
  function toggleFiltersFocused() {
    setFiltersFocused((focused) => !focused);
  }
  function updateAgeFilter(item) {
    ageFilter.setSelected(item);
    setFiltersFocused(false);
  }
  function updateAttrFilter(item) {
    attrFilter.setFilter(item);
    setFiltersFocused(false);
  }
  const audio = useAudio("CivSelectScreen");
  onMount(() => {
    audio("popup-open");
  });
  return createComponent(CreateGameStage, {
    get header() {
      return createComponent(CreateGameStageHeader, {
        get showSteps() {
          return createMemo(() => !!!(ViewExperience() == UIViewExperience.Handheld))() && !UI.isInGame();
        },
        title: "LOC_UI_CREATE_GAME_CIVILIZATION_SELECT",
        get hideButtonText() {
          return isAgeTransition() ? "LOC_UI_AGE_TRANSITION_VIEW_MAP" : void 0;
        },
        onBack: () => {
          screenFlow.activatePrev();
          ageFilter.reset();
          attrFilter.reset();
        }
      });
    },
    get mode() {
      return isAgeTransition() ? CreateGameStageMode.StageOnly : CreateGameStageMode.Full;
    },
    get children() {
      return [createComponent(Hotkeys, {
        hotkeys: [{
          hotkeyAction: "accept",
          navTrayText: "LOC_GENERIC_SELECT"
        }, {
          hotkeyAction: "cancel",
          navTrayText: "LOC_GENERIC_BACK",
          onActivate: () => {
            screenFlow.activatePrev();
            useAudio("CreateGameBackButton")("activate");
            ageFilter.reset();
            attrFilter.reset();
          }
        }, {
          hotkeyAction: "shell-action-2",
          navTrayText: "LOC_UI_FILTER_SORT_FILTERS",
          onActivate: () => toggleFiltersFocused()
        }]
      }), createComponent(AudioContextProvider, {
        segment: "CivSelectScreen",
        get children() {
          var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling, _el$6 = _el$2.nextSibling, _el$7 = _el$6.firstChild;
          insert(_el$3, createComponent(Show, {
            get when() {
              return showSearch();
            },
            get children() {
              return createComponent(SearchBar, {
                value: textFilter,
                setValue: setTextFilter,
                "class": "w-84"
              });
            }
          }), _el$4);
          insert(_el$5, createComponent(L10n.Compose, {
            text: "LOC_UI_CREATE_GAME_CIVILIZATIONS_NUMBER",
            get args() {
              return [numCivs()];
            }
          }));
          insert(_el$3, createComponent(HSlot, {
            get disableFocus() {
              return !filtersFocused();
            },
            get autoFocus() {
              return filtersFocused();
            },
            get children() {
              return createComponent(AudioContextProvider, {
                segment: "Filters",
                get children() {
                  return [createComponent(Dropdown, {
                    get defaultValue() {
                      return ageFilter.selected();
                    },
                    selectedItemTemplate: (item) => (() => {
                      var _el$25 = _tmpl$5();
                      insert(_el$25, createComponent(L10n.Compose, {
                        text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
                        get args() {
                          return [item.name];
                        }
                      }));
                      return _el$25;
                    })(),
                    onItemSelected: (item) => updateAgeFilter(item),
                    "class": "mr-2 min-w-76",
                    get children() {
                      return createComponent(For, {
                        get each() {
                          return ageFilter.options;
                        },
                        children: (item) => createComponent(DropdownItem, {
                          value: item,
                          get children() {
                            return item.name;
                          }
                        })
                      });
                    }
                  }), createComponent(Dropdown, {
                    get defaultValue() {
                      return attrFilter.getFilter();
                    },
                    selectedItemTemplate: (item) => (() => {
                      var _el$26 = _tmpl$5();
                      insert(_el$26, createComponent(L10n.Compose, {
                        text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
                        get args() {
                          return [Locale.toUpper(Locale.compose(item))];
                        }
                      }));
                      return _el$26;
                    })(),
                    onItemSelected: (item) => updateAttrFilter(item),
                    "class": "min-w-76",
                    get children() {
                      return createComponent(For, {
                        each: attributeFilters,
                        children: (item) => createComponent(DropdownItem, {
                          value: item,
                          get children() {
                            return Locale.toUpper(Locale.compose(item));
                          }
                        })
                      });
                    }
                  })];
                }
              });
            }
          }), null);
          insert(_el$2, createComponent(CreateGameHRule, {
            "class": "w-full my-2 "
          }), null);
          insert(_el$7, createComponent(Tooltip.Text, {
            get text() {
              return Locale.compose("LOC_UI_CREATE_GAME_RANDOM");
            },
            get children() {
              return createComponent(AudioContextProvider, {
                segment: "RandomCivButton",
                get children() {
                  return createComponent(LeaderSelectButtonBase, {
                    isLocked: false,
                    isSelected: false,
                    disableFocus: true,
                    hotkeyAction: "shell-action-1",
                    "class": "civ-select-leader-button-base self-center",
                    onActivate: () => {
                      selectCiv(model.randomCiv);
                      screenFlow.activate(isAgeTransition() ? "memento-select" : screenFlow.wasHubVisited() ? "create-game-hub" : "game-setup");
                    },
                    get children() {
                      return [createComponent(Icon, {
                        name: "LEADER_RANDOM",
                        "class": "civ-select-leader-button-icon"
                      }), createComponent(NavHelp, {
                        "class": "absolute bottom-0 right-0"
                      })];
                    }
                  });
                }
              });
            }
          }), null);
          insert(_el$7, createComponent(L10n.Stylize, {
            text: "LOC_UI_CREATE_GAME_STARTING_AGE",
            "class": "font-title uppercase civ-select-age-text"
          }), null);
          insert(_el$7, createComponent(L10n.Stylize, {
            get text() {
              return ageModel.getAgeName(ageModel.selectedAge.type) || "";
            },
            "class": "font-title uppercase font-black mb-2 civ-select-age-type-text font-fit-shrink"
          }), null);
          insert(_el$7, createComponent(Popup.Trigger, {
            name: "age-select",
            get children() {
              return createComponent(AudioContextProvider, {
                segment: "AgeSelectPopup",
                get children() {
                  return createComponent(Activatable, {
                    "class": "civ-select-age-banner relative",
                    get disabled() {
                      return isAgeTransition();
                    },
                    disableFocus: true,
                    hotkeyAction: "shell-action-3",
                    get children() {
                      var _el$8 = _tmpl$(), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling, _el$11 = _el$10.nextSibling, _el$12 = _el$11.nextSibling, _el$13 = _el$12.nextSibling, _el$14 = _el$13.nextSibling;
                      _el$10.style.setProperty("background-position", "center center");
                      _el$10.style.setProperty("background-size", "cover");
                      _el$14.style.setProperty("background-image", "url(blp:hud_sub_circle_dis_128x128)");
                      _el$14.style.setProperty("background-repeat", "no-repeat");
                      _el$14.style.setProperty("background-size", "cover");
                      insert(_el$14, createComponent(Icon, {
                        get name() {
                          return ageModel.selectedAge.icon;
                        },
                        "class": "size-24 -bottom-px relative"
                      }));
                      insert(_el$8, createComponent(NavHelp, {
                        "class": "absolute bottom-2 right-2"
                      }), null);
                      createRenderEffect((_p$) => {
                        var _v$ = `url(${UI.getIconBLP(ageModel.selectedAge.type, "BACKGROUND_VERT")})`, _v$2 = Layout.pixels(132), _v$3 = Layout.pixels(132);
                        _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$10.style.setProperty("background-image", _v$) : _el$10.style.removeProperty("background-image"));
                        _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$14.style.setProperty("width", _v$2) : _el$14.style.removeProperty("width"));
                        _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$14.style.setProperty("height", _v$3) : _el$14.style.removeProperty("height"));
                        return _p$;
                      }, {
                        e: void 0,
                        t: void 0,
                        a: void 0
                      });
                      return _el$8;
                    }
                  });
                }
              });
            }
          }), null);
          insert(_el$6, createComponent(ScrollArea, {
            "class": "flex-auto",
            get children() {
              return createComponent(SpatialSlot, {
                name: "civ-select-grid",
                get disableFocus() {
                  return filtersFocused();
                },
                get autoFocus() {
                  return !filtersFocused();
                },
                "class": "civ-select-right-content",
                get children() {
                  return [createComponent(Show, {
                    get when() {
                      return createMemo(() => leaderModel.selectedLeader().leaderID != "RANDOM")() && filteredHistoricalCivs().length > 0;
                    },
                    get children() {
                      return [(() => {
                        var _el$15 = _tmpl$2();
                        insert(_el$15, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_HYSTORICAL_CIVILIZATIONS_FOR",
                          get args() {
                            return [leaderModel.selectedLeader().rawName];
                          }
                        }));
                        return _el$15;
                      })(), (() => {
                        var _el$16 = _tmpl$3();
                        insert(_el$16, createComponent(For, {
                          get each() {
                            return filteredHistoricalCivs();
                          },
                          children: (civ) => createComponent(Tab.Trigger, {
                            name: "civ-details",
                            get children() {
                              return createComponent(AudioContextProvider, {
                                segment: "CivSelectCard",
                                get vars() {
                                  return {
                                    civType: civNameShort(civ)
                                  };
                                },
                                get children() {
                                  return createComponent(CivCard, mergeProps(() => getCivInfo(civ), {
                                    get isSelected() {
                                      return civ.civID == model.selectedCiv().civID;
                                    },
                                    get isApexAgeSelected() {
                                      return ageModel.selectedAge.type == civ.apexAge;
                                    },
                                    get leaderIcon() {
                                      return leaderModel.selectedLeader().icon;
                                    },
                                    get isRecommended() {
                                      return isRecommended(civ.civID);
                                    },
                                    isCivSelect: true,
                                    get isUnlocks() {
                                      return isAgeTransition() && civ.isLocked;
                                    },
                                    onSelect: () => selectCiv(civ)
                                  }));
                                }
                              });
                            }
                          })
                        }));
                        return _el$16;
                      })(), createComponent(CreateGameHRule, {
                        "class": "my-2"
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return createMemo(() => leaderModel.selectedLeader().leaderID != "RANDOM")() && filteredRecommendedCivs().length > 0;
                    },
                    get children() {
                      return [(() => {
                        var _el$17 = _tmpl$2();
                        insert(_el$17, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_INFLUENTIAL_CIVILIZATIONS_FOR",
                          get args() {
                            return [leaderModel.selectedLeader().rawName];
                          }
                        }));
                        return _el$17;
                      })(), (() => {
                        var _el$18 = _tmpl$3();
                        insert(_el$18, createComponent(For, {
                          get each() {
                            return filteredRecommendedCivs();
                          },
                          children: (civ) => createComponent(Tab.Trigger, {
                            name: "civ-details",
                            get children() {
                              return createComponent(AudioContextProvider, {
                                segment: "CivSelectCard",
                                get vars() {
                                  return {
                                    civType: civNameShort(civ)
                                  };
                                },
                                get children() {
                                  return createComponent(CivCard, mergeProps(() => getCivInfo(civ), {
                                    get isSelected() {
                                      return civ.civID == model.selectedCiv().civID;
                                    },
                                    get isApexAgeSelected() {
                                      return ageModel.selectedAge.type == civ.apexAge;
                                    },
                                    get leaderIcon() {
                                      return leaderModel.selectedLeader().icon;
                                    },
                                    isRecommended: true,
                                    isCivSelect: true,
                                    get isUnlocks() {
                                      return isAgeTransition() && civ.isLocked;
                                    },
                                    onSelect: () => selectCiv(civ)
                                  }));
                                }
                              });
                            }
                          })
                        }));
                        return _el$18;
                      })(), createComponent(CreateGameHRule, {
                        "class": "my-2"
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return antiquityCivs().length > 0;
                    },
                    get children() {
                      return [(() => {
                        var _el$19 = _tmpl$2();
                        insert(_el$19, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_ANTIQUITY_AGE_CIVILIZATIONS",
                          get args() {
                            return [leaderModel.selectedLeader().rawName];
                          }
                        }));
                        return _el$19;
                      })(), (() => {
                        var _el$20 = _tmpl$3();
                        insert(_el$20, createComponent(For, {
                          get each() {
                            return antiquityCivs();
                          },
                          children: (civ) => createComponent(Tab.Trigger, {
                            name: "civ-details",
                            get children() {
                              return createComponent(AudioContextProvider, {
                                segment: "CivSelectCard",
                                get vars() {
                                  return {
                                    civType: civNameShort(civ)
                                  };
                                },
                                get children() {
                                  return createComponent(CivCard, mergeProps(() => getCivInfo(civ), {
                                    get isSelected() {
                                      return civ.civID == model.selectedCiv().civID;
                                    },
                                    get isApexAgeSelected() {
                                      return ageModel.selectedAge.type == civ.apexAge;
                                    },
                                    get leaderIcon() {
                                      return leaderModel.selectedLeader().icon;
                                    },
                                    isRecommended: false,
                                    isCivSelect: true,
                                    get isUnlocks() {
                                      return isAgeTransition() && civ.isLocked;
                                    },
                                    onSelect: () => selectCiv(civ)
                                  }));
                                }
                              });
                            }
                          })
                        }));
                        return _el$20;
                      })(), createComponent(CreateGameHRule, {
                        "class": "my-2"
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return explorationCivs().length > 0;
                    },
                    get children() {
                      return [(() => {
                        var _el$21 = _tmpl$2();
                        insert(_el$21, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_EXPLORATION_AGE_CIVILIZATIONS",
                          get args() {
                            return [leaderModel.selectedLeader().rawName];
                          }
                        }));
                        return _el$21;
                      })(), (() => {
                        var _el$22 = _tmpl$3();
                        insert(_el$22, createComponent(For, {
                          get each() {
                            return explorationCivs();
                          },
                          children: (civ) => createComponent(Tab.Trigger, {
                            name: "civ-details",
                            get children() {
                              return createComponent(AudioContextProvider, {
                                segment: "CivSelectCard",
                                get vars() {
                                  return {
                                    civType: civNameShort(civ)
                                  };
                                },
                                get children() {
                                  return createComponent(CivCard, mergeProps(() => getCivInfo(civ), {
                                    get isSelected() {
                                      return civ.civID == model.selectedCiv().civID;
                                    },
                                    get isApexAgeSelected() {
                                      return ageModel.selectedAge.type == civ.apexAge;
                                    },
                                    get leaderIcon() {
                                      return leaderModel.selectedLeader().icon;
                                    },
                                    isRecommended: false,
                                    isCivSelect: true,
                                    get isUnlocks() {
                                      return isAgeTransition() && civ.isLocked;
                                    },
                                    onSelect: () => selectCiv(civ)
                                  }));
                                }
                              });
                            }
                          })
                        }));
                        return _el$22;
                      })(), createComponent(CreateGameHRule, {
                        "class": "my-2"
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return modernCivs().length > 0;
                    },
                    get children() {
                      return [(() => {
                        var _el$23 = _tmpl$2();
                        insert(_el$23, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_MODERN_AGE_CIVILIZATIONS",
                          get args() {
                            return [leaderModel.selectedLeader().rawName];
                          }
                        }));
                        return _el$23;
                      })(), (() => {
                        var _el$24 = _tmpl$3();
                        insert(_el$24, createComponent(For, {
                          get each() {
                            return modernCivs();
                          },
                          children: (civ) => createComponent(Tab.Trigger, {
                            name: "civ-details",
                            get children() {
                              return createComponent(AudioContextProvider, {
                                segment: "CivSelectCard",
                                get vars() {
                                  return {
                                    civType: civNameShort(civ)
                                  };
                                },
                                get children() {
                                  return createComponent(CivCard, mergeProps(() => getCivInfo(civ), {
                                    get isSelected() {
                                      return civ.civID == model.selectedCiv().civID;
                                    },
                                    get isApexAgeSelected() {
                                      return ageModel.selectedAge.type == civ.apexAge;
                                    },
                                    get leaderIcon() {
                                      return leaderModel.selectedLeader().icon;
                                    },
                                    isRecommended: false,
                                    isCivSelect: true,
                                    get isUnlocks() {
                                      return isAgeTransition() && civ.isLocked;
                                    },
                                    onSelect: () => selectCiv(civ)
                                  }));
                                }
                              });
                            }
                          })
                        }));
                        return _el$24;
                      })()];
                    }
                  })];
                }
              });
            }
          }), null);
          return _el$;
        }
      })];
    }
  });
};
const CivSelectScreen = ComponentRegistry.register({
  name: "CivSelectScreen",
  createInstance: CivSelectScreenComponent,
  styles: [style]
});

export { CivSelectScreen };
//# sourceMappingURL=civ-select-screen.js.map
