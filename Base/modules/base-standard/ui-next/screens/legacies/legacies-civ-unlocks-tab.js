import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, createSignal, createMemo, onMount, onCleanup, createEffect, on, createComponent, Show, For, createRenderEffect, mergeProps } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { CheckBox } from '../../../../core/ui-next/components/check-box.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { SearchBar } from '../../../../core/ui-next/components/search-bar.js';
import { SpatialSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { NestedTooltipContext } from '../../../../core/ui-next/components/tooltip-compat.js';
import { AgeSelectModel, AgeSelectModelContext } from '../../../../core/ui-next/screens/create-game/age-select-model.js';
import { CivCard } from '../../../../core/ui-next/screens/create-game/civ-card.js';
import { CivDetailsBase } from '../../../../core/ui-next/screens/create-game/civ-details.js';
import { CivSelectModelContext } from '../../../../core/ui-next/screens/create-game/civ-select-model.js';
import { CreateGameHRule } from '../../../../core/ui-next/screens/create-game/create-game-components.js';
import { CivUnlocksModel } from '../../../../core/ui-next/screens/unlocks/civ-unlocks-model.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ViewExperience } from '../../../../core/ui-next/services/view-experience.js';
import { useIsSmallScreen } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useLegaciesScreenContext } from './legacies-model.js';
import style from './legacies-civ-unlocks-tab.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full text-center text-accent-2 text-sm"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute h-6 -top-0\\.5 -left-1\\.5 -right-1\\.5"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row w-full mt-1\\.5 mb-2 relative"><div><div class="uppercase mr-2"></div><div></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap w-full"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex-auto relative w-full flex flex-row"><div class="flex flex-col items-center h-full px-10 w-84"><div class="flex flex-col items-center relative civ-select-age-banner"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div><div class="flex items-center justify-center size-36 relative m-4"></div></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="mt-2 flex flex-col flex-auto items-center mx-8 mb-5 pl-8 pr-8 pt-2 relative"><div class="absolute h-6 -bottom-0\\.5 -left-1\\.5 -right-1\\.5 -scale-y-100"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="mt-2 flex flex-col flex-auto items-center justify-center mx-8 mb-5 pl-8 pr-8 pt-2 relative"><div class="absolute h-6 -top-0\\.5 -left-1\\.5 -right-1\\.5"></div><div class="text-xl uppercase font-title flex-wrap"></div><div class="absolute h-6 -bottom-0\\.5 -left-1\\.5 -right-1\\.5 -scale-y-100"></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div></div>`);
const LegaciesUnlocksTabComponent = () => {
  const unlocksModel = CivUnlocksModel.get();
  const ageSelectModel = AgeSelectModel.get();
  const legaciesModel = useLegaciesScreenContext();
  const isSmallScreen = useIsSmallScreen();
  const hotkeyContext = useContext(HotkeyContext);
  const attributeFilters = ["LOC_LEGACIES_FILTER_ALL_ATTRIBUTES"];
  Database.query("config", "SELECT * FROM Tags WHERE TagCategoryType = 'TAG_CATEGORY_TRAIT' AND TagType IN (SELECT DISTINCT TagType FROM CivilizationTags)")?.forEach((tag) => {
    if (tag.Name) attributeFilters.push(tag.Name);
  });
  const [textFilter, setTextFilter] = createSignal("");
  const [shouldShowAllRequirements, setShouldShowAllRequirements] = createSignal(false);
  const [attributeFilter, setAttributeFilter] = createSignal("LOC_LEGACIES_FILTER_ALL_ATTRIBUTES");
  const [viewCiv, setViewCiv] = createSignal();
  const initialSelectedCiv = unlocksModel.civInfo.find((civ) => civ.civID == unlocksModel.currentCivType) ?? unlocksModel.civInfo[0];
  const [selectedUnlocksCiv, setSelectedUnlocksCiv] = createSignal(initialSelectedCiv);
  const civDetailsContextModel = {
    civs: unlocksModel.civInfo,
    randomCiv: unlocksModel.civInfo.find((c) => c.civID == "RANDOM") ?? unlocksModel.civInfo[0],
    previousCiv: () => void 0,
    selectedCiv: () => selectedUnlocksCiv() ?? unlocksModel.civInfo[0],
    setSelectedCiv: (civ) => setSelectedUnlocksCiv(civ),
    viewCiv,
    setViewCiv,
    selectNext: () => {
      const selected = selectedUnlocksCiv() ?? unlocksModel.civInfo[0];
      const index = unlocksModel.civInfo.findIndex((c) => c.civID == selected.civID);
      if (index < 0 || unlocksModel.civInfo.length == 0) {
        return;
      }
      const nextIndex = (index + 1) % unlocksModel.civInfo.length;
      setSelectedUnlocksCiv(unlocksModel.civInfo[nextIndex]);
    },
    selectPrev: () => {
      const selected = selectedUnlocksCiv() ?? unlocksModel.civInfo[0];
      const index = unlocksModel.civInfo.findIndex((c) => c.civID == selected.civID);
      if (index < 0 || unlocksModel.civInfo.length == 0) {
        return;
      }
      const prevIndex = (index - 1 + unlocksModel.civInfo.length) % unlocksModel.civInfo.length;
      setSelectedUnlocksCiv(unlocksModel.civInfo[prevIndex]);
    },
    fulltextSearch: (text) => {
      const normalized = text.trim().toLowerCase();
      if (!normalized) {
        return new Set(unlocksModel.civInfo.map((civ) => civ.civID));
      }
      return new Set(unlocksModel.civInfo.filter((civ) => civ.fulltext.includes(normalized)).map((civ) => civ.civID));
    }
  };
  const enableTextFilter = createMemo(() => ViewExperience() == UIViewExperience.Desktop);
  const ageFilters = Array.from(GameInfo.Ages).map((ageDef) => ({
    ageType: ageDef.AgeType,
    ageName: ageDef.Name
  }));
  const audio = useAudio("LegaciesCiv");
  onMount(() => {
    audio("popup-open");
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("nav-shell-next");
    hotkeyContext.unregisterNavtray("shell-action-2");
    hotkeyContext.unregisterNavtray("shell-action-1");
  });
  createEffect(on(() => legaciesModel.isShowingDetails(), (isShowing) => {
    if (isShowing) {
      hotkeyContext.unregisterNavtray("nav-shell-next");
      hotkeyContext.unregisterNavtray("shell-action-2");
      hotkeyContext.unregisterNavtray("shell-action-1");
    } else {
      hotkeyContext.registerNavtray("nav-shell-next", "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS");
      hotkeyContext.registerNavtray("shell-action-1", "LOC_LEGACIES_FILTER_ATTRIBUTES");
      hotkeyContext.registerNavtray("shell-action-2", "LOC_LEGACIES_FILTER_AGES");
    }
  }));
  ageFilters.unshift({
    ageName: "LOC_UI_CREATE_GAME_FILTER_ALL_AGES"
  });
  let initialSelectedAge = {
    ageName: "LOC_UI_CREATE_GAME_FILTER_ALL_AGES"
  };
  let nextAgeName = "";
  let hasNextAge = false;
  const ageSuccessor = GameInfo.AgeSuccessors.lookup(Game.age);
  if (ageSuccessor) {
    const nextAgeDef = GameInfo.Ages.find((a) => a.AgeType == ageSuccessor.SuccessorAgeType);
    if (nextAgeDef) {
      nextAgeName = nextAgeDef.Name;
      initialSelectedAge = {
        ageType: nextAgeDef.AgeType,
        ageName: nextAgeDef.Name
      };
      hasNextAge = true;
    }
  } else {
    const currentAgeDef = GameInfo.Ages.find((a) => a.$hash == Game.age);
    if (currentAgeDef) {
      nextAgeName = currentAgeDef.Name;
      initialSelectedAge = {
        ageType: currentAgeDef.AgeType,
        ageName: currentAgeDef.Name
      };
    }
  }
  const [selectedAgeFilter, setSelectedAgeFilter] = createSignal(initialSelectedAge);
  const normalizedText = createMemo(() => textFilter().trim().toLowerCase());
  const showSearch = createMemo(() => ViewExperience() == UIViewExperience.Desktop && !IsControllerActive());
  const selectedCivId = createMemo(() => selectedUnlocksCiv()?.civID ?? "");
  const filteredCivs = createMemo(() => {
    const selectedAge = selectedAgeFilter().ageType;
    const selectedAttribute = attributeFilter();
    const searchText = normalizedText();
    const shouldFilterText = enableTextFilter();
    const filtered = unlocksModel.civInfo.filter((civ) => {
      const matchAge = civ.apexAge == selectedAge || !selectedAge;
      const matchAttribute = selectedAttribute == "LOC_LEGACIES_FILTER_ALL_ATTRIBUTES" || civ.traits.some((t) => t == selectedAttribute);
      const matchText = !shouldFilterText || civ.fulltext.includes(searchText);
      return matchAge && matchAttribute && matchText;
    });
    return filtered;
  });
  createEffect(() => {
    if (legaciesModel.isShowingDetails()) {
      setViewCiv(selectedUnlocksCiv());
    }
  });
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      return createComponent(AudioContextProvider, {
        segment: "LegaciesCiv",
        get children() {
          return createComponent(Show, {
            when: hasNextAge,
            get fallback() {
              return (() => {
                var _el$19 = _tmpl$7(), _el$20 = _el$19.firstChild, _el$21 = _el$20.nextSibling, _el$22 = _el$21.nextSibling;
                _el$19.style.setProperty("background-image", "linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.7), rgba(20, 20, 20, 0.8))");
                _el$20.style.setProperty("border-image-source", "url(blp:hud_section-line)");
                _el$20.style.setProperty("border-image-slice", "4 32 0 32 fill");
                _el$20.style.setProperty("border-image-width", "auto");
                insert(_el$21, createComponent(L10n.Compose, {
                  text: "LOC_LEGACIES_UNLOCKS_FINAL_AGE"
                }));
                _el$22.style.setProperty("border-image-source", "url(blp:hud_section-line)");
                _el$22.style.setProperty("border-image-slice", "4 32 0 32 fill");
                _el$22.style.setProperty("border-image-width", "auto");
                return _el$19;
              })();
            },
            get children() {
              return createComponent(AgeSelectModelContext.Provider, {
                value: ageSelectModel,
                get children() {
                  return [(() => {
                    var _el$ = _tmpl$();
                    insert(_el$, createComponent(L10n.Compose, {
                      text: "LOC_UI_PLAYER_UNLOCKS_COMPLETE_LISTED_REQUIREMENTS_CIVILIZATIONS"
                    }));
                    return _el$;
                  })(), (() => {
                    var _el$2 = _tmpl$6(), _el$18 = _el$2.firstChild;
                    _el$2.style.setProperty("background-image", "linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.7), rgba(20, 20, 20, 0.8))");
                    insert(_el$2, createComponent(Show, {
                      get when() {
                        return !legaciesModel.isShowingDetails();
                      },
                      get children() {
                        return [(() => {
                          var _el$3 = _tmpl$2();
                          _el$3.style.setProperty("border-image-source", "url(blp:hud_section-line)");
                          _el$3.style.setProperty("border-image-slice", "4 32 0 32 fill");
                          _el$3.style.setProperty("border-image-width", "auto");
                          return _el$3;
                        })(), (() => {
                          var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
                          insert(_el$4, createComponent(Show, {
                            get when() {
                              return showSearch();
                            },
                            get children() {
                              return createComponent(SearchBar, {
                                hotkeyAction: "nav-shell-previous",
                                value: textFilter,
                                setValue: setTextFilter,
                                "class": `unlocks-search-bar mr-2 font-fit-shrink`
                              });
                            }
                          }), _el$5);
                          insert(_el$6, createComponent(L10n.Compose, {
                            text: "LOC_UI_PLAYER_UNLOCKS_SHOW_ALL_REQUIREMENTS"
                          }));
                          insert(_el$5, createComponent(CheckBox, {
                            disableFocus: true,
                            "class": "size-6",
                            get isChecked() {
                              return shouldShowAllRequirements();
                            },
                            hotkeyAction: "nav-shell-next",
                            onActivate: () => {
                              setShouldShowAllRequirements((shouldShow) => !shouldShow);
                            }
                          }), _el$7);
                          insert(_el$7, createComponent(L10n.Compose, {
                            text: "LOC_LEGACIES_UNLOCKS_NUM_CIVS",
                            get args() {
                              return [filteredCivs().length.toString()];
                            }
                          }));
                          insert(_el$5, createComponent(Dropdown, {
                            disableFocus: true,
                            get defaultValue() {
                              return selectedAgeFilter();
                            },
                            selectedItemTemplate: (ageItem) => (() => {
                              var _el$23 = _tmpl$8();
                              insert(_el$23, createComponent(L10n.Stylize, {
                                text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
                                get args() {
                                  return [Locale.compose(ageItem.ageName)];
                                }
                              }));
                              createRenderEffect(() => className(_el$23, `flex grow min-w-0 truncate font-fit-shrink ${isSmallScreen() ? "text-xs" : ""}`));
                              return _el$23;
                            })(),
                            hotkey: "shell-action-2",
                            onItemSelected: (ageItem) => {
                              setSelectedAgeFilter(ageItem);
                            },
                            "class": "mr-2 unlocks-filter font-fit-shrink",
                            get children() {
                              return createComponent(For, {
                                each: ageFilters,
                                children: (ageItem) => createComponent(DropdownItem, {
                                  value: ageItem,
                                  get children() {
                                    return Locale.compose(ageItem.ageName);
                                  }
                                })
                              });
                            }
                          }), null);
                          insert(_el$5, createComponent(Dropdown, {
                            get defaultValue() {
                              return attributeFilter();
                            },
                            disableFocus: true,
                            selectedItemTemplate: (item) => (() => {
                              var _el$24 = _tmpl$8();
                              insert(_el$24, createComponent(L10n.Stylize, {
                                text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
                                get args() {
                                  return [Locale.compose(item)];
                                }
                              }));
                              createRenderEffect(() => className(_el$24, `flex grow min-w-0 truncate font-fit-shrink ${isSmallScreen() ? "text-xs" : ""}`));
                              return _el$24;
                            })(),
                            hotkey: "shell-action-1",
                            onItemSelected: (item) => {
                              setAttributeFilter(item);
                            },
                            "class": "unlocks-filter font-fit-shrink",
                            get children() {
                              return createComponent(For, {
                                get each() {
                                  return Object.values(attributeFilters);
                                },
                                children: (item) => createComponent(DropdownItem, {
                                  value: item,
                                  get children() {
                                    return Locale.toUpper(Locale.compose(item));
                                  }
                                })
                              });
                            }
                          }), null);
                          createRenderEffect((_p$) => {
                            var _v$ = `items-end justify-end grow flex flex-row font-fit-shrink ${isSmallScreen() ? "text-xs" : "text-base"}`, _v$2 = `uppercase ${isSmallScreen() ? "ml-2 mr-2" : "ml-12 mr-6"}`;
                            _v$ !== _p$.e && className(_el$5, _p$.e = _v$);
                            _v$2 !== _p$.t && className(_el$7, _p$.t = _v$2);
                            return _p$;
                          }, {
                            e: void 0,
                            t: void 0
                          });
                          return _el$4;
                        })(), (() => {
                          var _el$8 = _tmpl$5(), _el$9 = _el$8.firstChild, _el$10 = _el$9.firstChild, _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$12.nextSibling, _el$14 = _el$13.nextSibling, _el$15 = _el$14.nextSibling, _el$16 = _el$15.nextSibling;
                          insert(_el$9, createComponent(L10n.Stylize, {
                            text: !hasNextAge ? "LOC_LEGACIES_CURRENT_AGE" : "LOC_LEGACIES_UPCOMING_AGE",
                            "class": "text-base uppercase font-title"
                          }), _el$10);
                          insert(_el$9, createComponent(L10n.Stylize, {
                            text: nextAgeName,
                            "class": "font-title text-tertiary-1 font-black uppercase text-white text-xl mb-2"
                          }), _el$10);
                          _el$12.style.setProperty("background-position", "center center");
                          _el$12.style.setProperty("background-size", "cover");
                          _el$16.style.setProperty("background-image", "url(blp:hud_sub_circle_dis_128x128)");
                          _el$16.style.setProperty("background-repeat", "no-repeat");
                          _el$16.style.setProperty("background-size", "cover");
                          insert(_el$16, createComponent(Icon, {
                            get name() {
                              return ageSelectModel.selectedAge.icon;
                            },
                            "class": "size-24 -bottom-px relative",
                            isUrl: true
                          }));
                          insert(_el$8, createComponent(ScrollArea, {
                            "class": "flex-auto",
                            get children() {
                              return createComponent(SpatialSlot, {
                                name: "civ-unlocks-scrollable",
                                get children() {
                                  return [(() => {
                                    var _el$17 = _tmpl$4();
                                    insert(_el$17, createComponent(For, {
                                      get each() {
                                        return filteredCivs();
                                      },
                                      children: (civ) => createComponent(Tab.Trigger, {
                                        name: "civ-details",
                                        get children() {
                                          return createComponent(AudioContextProvider, {
                                            segment: "CivCard",
                                            get children() {
                                              return createComponent(CivCard, mergeProps({
                                                "class": "is-unlocks"
                                              }, civ, {
                                                get isSelected() {
                                                  return civ.civID == selectedCivId();
                                                },
                                                get isApexAgeSelected() {
                                                  return ageSelectModel.nextAge.type == civ.apexAge;
                                                },
                                                get leaderIcon() {
                                                  return unlocksModel.leaderIcon;
                                                },
                                                isRecommended: false,
                                                isUnlocks: true,
                                                get showAllUnlocks() {
                                                  return shouldShowAllRequirements();
                                                },
                                                onSelect: () => {
                                                  setSelectedUnlocksCiv(civ);
                                                  setViewCiv(civ);
                                                  legaciesModel.setIsShowingDetails(true);
                                                }
                                              }));
                                            }
                                          });
                                        }
                                      })
                                    }));
                                    return _el$17;
                                  })(), createComponent(CreateGameHRule, {
                                    "class": "my-2"
                                  })];
                                }
                              });
                            }
                          }), null);
                          createRenderEffect((_p$) => {
                            var _v$3 = `url('${ageSelectModel.selectedAge.bgImage}')`, _v$4 = Layout.pixels(132), _v$5 = Layout.pixels(132);
                            _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$12.style.setProperty("background-image", _v$3) : _el$12.style.removeProperty("background-image"));
                            _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$16.style.setProperty("width", _v$4) : _el$16.style.removeProperty("width"));
                            _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$16.style.setProperty("height", _v$5) : _el$16.style.removeProperty("height"));
                            return _p$;
                          }, {
                            e: void 0,
                            t: void 0,
                            a: void 0
                          });
                          return _el$8;
                        })()];
                      }
                    }), _el$18);
                    insert(_el$2, createComponent(AudioContextProvider, {
                      segment: "LegaciesCivShowing",
                      get children() {
                        return createComponent(Show, {
                          get when() {
                            return legaciesModel.isShowingDetails();
                          },
                          get children() {
                            return [createComponent(CivSelectModelContext.Provider, {
                              value: civDetailsContextModel,
                              get children() {
                                return createComponent(CivDetailsBase, {});
                              }
                            }), createComponent(Activatable, {
                              "class": "size-10 absolute top-10 left-10 bg-center bg-no-repeat bg-contain",
                              onActivate: () => {
                                setViewCiv(void 0);
                                legaciesModel.setIsShowingDetails(false);
                              },
                              hotkeyAction: "cancel",
                              style: {
                                "background-image": "url(blp:shell_back-button-focus)"
                              }
                            })];
                          }
                        });
                      }
                    }), _el$18);
                    _el$18.style.setProperty("border-image-source", "url(blp:hud_section-line)");
                    _el$18.style.setProperty("border-image-slice", "4 32 0 32 fill");
                    _el$18.style.setProperty("border-image-width", "auto");
                    return _el$2;
                  })()];
                }
              });
            }
          });
        }
      });
    }
  });
};
const LegaciesUnlocksTab = ComponentRegistry.register({
  name: "LegaciesUnlocksTab",
  styles: [style],
  createInstance: LegaciesUnlocksTabComponent
});

export { LegaciesUnlocksTab, LegaciesUnlocksTabComponent };
//# sourceMappingURL=legacies-civ-unlocks-tab.js.map
