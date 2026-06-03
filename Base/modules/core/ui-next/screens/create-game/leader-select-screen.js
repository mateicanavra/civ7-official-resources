import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createSelector, createSignal, createComponent, Show, For, createRenderEffect, createEffect, on } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { getRewardType, UnlockableRewardType } from '../../../ui/utilities/utilities-liveops.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Dropdown, DropdownItem } from '../../components/dropdown.js';
import { Header } from '../../components/header.js';
import { HeroButton2 } from '../../components/hero-button.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { Scene3d, ModelGroup3d, Model3d, Camera3d } from '../../components/scene-3d.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { SearchBar } from '../../components/search-bar.js';
import { SpatialSlot } from '../../components/slot.js';
import { Tab } from '../../components/tab.js';
import { Tooltip } from '../../components/tooltip.js';
import { AttributeIcon } from './attribute-icon.js';
import { CreateGameTabPips } from './create-game-components.js';
import { CreateGameStage, CreateGameStageHeader } from './create-game-stage.js';
import { LeaderSelectButton } from './leader-select-button.js';
import { LeaderSelectModel } from './leader-select-model.js';
import { TicketBox } from './ticket-box.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { FocusManager } from '../../services/focus-manager.js';
import { IsControllerActive } from '../../services/input.js';
import { ViewExperience } from '../../services/view-experience.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import { createDebouncedSignal } from '../../utilities/solid-utilities.js';
import style from './leader-select-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="filigree-h4-left mt-3"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="filigree-h4-right mt-3"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=leader-select-decoration-bar><div class="img-unit-panelbox mt-3 mb-4 mx-4 pt-3 pb-4 relative flex flex-row justify-center items-center"><div class="leader-select-corner-filigree top-left"></div><div class="leader-select-corner-filigree top-right"></div><div class="leader-select-corner-filigree bottom-left"></div><div class="leader-select-corner-filigree bottom-right"></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="leader-select-leaders-panel img-unit-panelbox flex flex-col relative justify-center"><div class="leader-select-corner-filigree inner-top-left"></div><div class="leader-select-corner-filigree inner-top-right"></div><div class="absolute right-0 -top-32 pointer-events-none opacity-50"></div><div class="mx-5 mb-1 mt-4 flex leader-select-filters-container"></div><div class="leader-select-line-divider my-2"></div><div class="absolute top-0 w-full flex items-center justify-center"><div class=leader-select-leaders-panel-filigree></div></div><div class="absolute bottom-0 w-full flex items-center justify-center"><div class="leader-select-leaders-panel-filigree -scale-y-100"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<span class=m-2></span>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="leader-select-divider my-2"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex uppercase leader-select-details-page1"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="leader-select-divider my-3"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex flex-col uppercase text-tertiary-1 font-title font-bold"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="text-sm mb-2 uppercase"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="font-sm mr-7 flex flex-row items-center "><div class="font-fit-shrink max-w-48"></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="font-title text-tertiary-1 uppercase"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-row"><div class="font-title text-tertiary-1 uppercase flex flex-row">:</div><div class="text-accent-2 ml-1 flex flex-row uppercase"></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="img-tag-locked absolute left-0 top-5 flex flex-row items-start justify-start"><div class="img-lock2 size-8 mt-0\\.5 ml-0\\.5"></div></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="flex flex-col items-center justify-center"></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="bg-primary-2 w-full -mr-2 h-0\\.5"></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto ml-2"><div class="uppercase text-accent-5 font-title text-base"></div></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="flex flex-row create-game-markup"><span class=indent-1></span></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="leader-select-leader-details flex flex-col mt-8 flex-auto w-full text-primary-1"><div class=h-fit></div></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div data-name=subtitles class="create-game-subtitles absolute bottom-2 text-xl text-accent-2 font-title font-black p-2"></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="size-full relative"></div>`);
const LeaderSelectLeadersPanel = () => {
  const leaderModel = LeaderSelectModel.get();
  const flowContext = useScreenFlowContext();
  const isDesktop = createMemo(() => ViewExperience() == UIViewExperience.Desktop);
  const isSmallScreen = useIsSmallScreen();
  const showSearch = createMemo(() => !IsControllerActive() && isDesktop());
  const selectedLeaderId = createMemo(() => leaderModel.selectedLeader().leaderID);
  const isSelected = createSelector(selectedLeaderId);
  const filterItems = ["LOC_LEGACIES_FILTER_ALL_ATTRIBUTES"];
  Database.query("config", "SELECT * FROM Tags WHERE TagCategoryType = 'TAG_CATEGORY_TRAIT'")?.forEach((tag) => {
    if (tag.Name) filterItems.push(tag.Name);
  });
  const [selectedFilter, setSelectedFilter] = createSignal("LOC_LEGACIES_FILTER_ALL_ATTRIBUTES");
  const [textFilter, setTextFilter] = createSignal("");
  let filterRef;
  const searchResults = createMemo(() => textFilter() ? leaderModel.fulltextSearch(textFilter()) : /* @__PURE__ */ new Set());
  function filter(leader) {
    const hasText = !isDesktop() || !textFilter() || searchResults().has(leader.leaderID);
    const hasDropdown = selectedFilter() == "LOC_LEGACIES_FILTER_ALL_ATTRIBUTES" || leader.tags.some((t) => t == selectedFilter());
    return hasText && hasDropdown;
  }
  function handleLeaderSelect(leader) {
    if (IsControllerActive()) {
      flowContext.activateNext();
    } else {
      leaderModel.setSelectedLeader(leader);
    }
  }
  function handleLeaderFocus(leader) {
    if (IsControllerActive()) {
      leaderModel.setSelectedLeader(leader);
    }
  }
  const allLeaders = createMemo(() => leaderModel.leaders.filter(filter));
  return (() => {
    var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling, _el$12 = _el$6.nextSibling, _el$13 = _el$12.nextSibling;
    insert(_el$, createComponent(Hotkeys, {
      hotkeys: [{
        hotkeyAction: "accept",
        navTrayText: "LOC_GENERIC_SELECT",
        onActivate: () => flowContext.activateNext()
      }, {
        hotkeyAction: "cancel",
        navTrayText: "LOC_GENERIC_BACK",
        onActivate: () => {
          flowContext.activatePrev();
          useAudio("CreateGameBackButton")("activate");
        }
      }, {
        hotkeyAction: "shell-action-2",
        navTrayText: "LOC_UI_FILTER_SORT_FILTERS",
        onActivate: () => FocusManager.get().setFocus(filterRef)
      }]
    }), _el$2);
    _el$4.style.setProperty("background-image", "url('blp:popup_icon_glow')");
    _el$4.style.setProperty("background-size", "100% 100%");
    insert(_el$5, createComponent(Show, {
      get when() {
        return showSearch();
      },
      get children() {
        return createComponent(AudioContextProvider, {
          segment: "LeaderSelectScreen",
          get children() {
            return createComponent(SearchBar, {
              value: textFilter,
              setValue: setTextFilter,
              "class": "ml-2 leader-select-filter-search"
            });
          }
        });
      }
    }), null);
    insert(_el$5, createComponent(AudioContextProvider, {
      segment: "LeaderSelectFilter",
      get children() {
        return createComponent(Dropdown, {
          selectedItemTemplate: (item) => (() => {
            var _el$14 = _tmpl$5();
            insert(_el$14, createComponent(L10n.Compose, {
              text: "LOC_UI_CREATE_GAME_FILTER_ITEM",
              get args() {
                return [Locale.toUpper(Locale.compose(item))];
              }
            }));
            return _el$14;
          })(),
          hotkey: "shell-action-2",
          get defaultValue() {
            return filterItems[0];
          },
          onItemSelected: (item) => setSelectedFilter(item),
          disableFocus: true,
          "class": "mx-2 leader-select-filter-dropdown",
          ref(r$) {
            var _ref$ = filterRef;
            typeof _ref$ === "function" ? _ref$(r$) : filterRef = r$;
          },
          get children() {
            return createComponent(For, {
              each: filterItems,
              children: (item) => createComponent(DropdownItem, {
                value: item,
                get children() {
                  return Locale.toUpper(Locale.compose(item));
                }
              })
            });
          }
        });
      }
    }), null);
    insert(_el$, createComponent(ScrollArea, {
      "class": "flex-auto m-2",
      allowGamepadPan: false,
      get children() {
        return createComponent(SpatialSlot, {
          name: "leader-list",
          "class": "flex-auto flex flex-row flex-wrap pl-4 -mr-2",
          get children() {
            return createComponent(For, {
              get each() {
                return allLeaders();
              },
              children: (leader) => createComponent(Tooltip.Text, {
                bodyClass: "flex flex-row justify-center",
                get text() {
                  return leader.name;
                },
                get children() {
                  return createComponent(LeaderSelectButton, {
                    leaderInfo: leader,
                    get isSelected() {
                      return isSelected(leader.leaderID);
                    },
                    get autoFocus() {
                      return isSelected(leader.leaderID);
                    },
                    onActivate: () => handleLeaderSelect(leader),
                    onFocus: () => handleLeaderFocus(leader)
                  });
                }
              })
            });
          }
        });
      }
    }), _el$12);
    insert(_el$, createComponent(Show, {
      get when() {
        return !IsControllerActive();
      },
      get children() {
        var _el$7 = _tmpl$3(), _el$8 = _el$7.firstChild, _el$11 = _el$8.firstChild;
        insert(_el$8, createComponent(Show, {
          get when() {
            return !isSmallScreen();
          },
          get children() {
            return _tmpl$();
          }
        }), _el$11);
        insert(_el$8, createComponent(AudioContextProvider, {
          segment: "LeaderSelectContinue",
          get children() {
            return createComponent(HeroButton2, {
              get ["class"]() {
                return `flex-auto min-w-auto ${isSmallScreen() ? "mx-4" : ""}`;
              },
              onActivate: () => flowContext.activateNext(),
              get children() {
                return createComponent(L10n.Compose, {
                  text: "LOC_GENERIC_SELECT"
                });
              }
            });
          }
        }), _el$11);
        insert(_el$8, createComponent(Show, {
          get when() {
            return !isSmallScreen();
          },
          get children() {
            return _tmpl$2();
          }
        }), _el$11);
        return _el$7;
      }
    }), _el$12);
    insert(_el$, createComponent(Scene3d, {
      name: "leaderLighting",
      get children() {
        return createComponent(ModelGroup3d, {
          name: "CivDetails3dLightingModelGroup",
          get children() {
            return createComponent(Model3d, {
              model: "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET"
            });
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = Layout.pixels(565), _v$2 = Layout.pixels(400);
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$4.style.setProperty("width", _v$) : _el$4.style.removeProperty("width"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$4.style.setProperty("height", _v$2) : _el$4.style.removeProperty("height"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const LeaderSelectDetailsPage1 = () => {
  const leaderModel = LeaderSelectModel.get();
  const leader = createMemo(() => leaderModel.selectedLeader());
  return [_tmpl$6(), (() => {
    var _el$16 = _tmpl$7();
    insert(_el$16, createComponent(For, {
      get each() {
        return leader().tags;
      },
      children: (attribute) => (() => {
        var _el$21 = _tmpl$11(), _el$22 = _el$21.firstChild;
        insert(_el$21, createComponent(AttributeIcon, {
          "class": "size-8 mr-2",
          attribute
        }), _el$22);
        insert(_el$22, createComponent(L10n.Compose, {
          text: attribute
        }));
        return _el$21;
      })()
    }));
    return _el$16;
  })(), _tmpl$6(), createComponent(Show, {
    get when() {
      return leader().introText;
    },
    get children() {
      return createComponent(L10n.Stylize, {
        get text() {
          return leader().introText;
        }
      });
    }
  }), _tmpl$8(), (() => {
    var _el$19 = _tmpl$9();
    insert(_el$19, createComponent(L10n.Compose, {
      get text() {
        return leader().abilityTitle;
      }
    }));
    return _el$19;
  })(), (() => {
    var _el$20 = _tmpl$10();
    insert(_el$20, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_LEADER_ABILITY"
    }));
    return _el$20;
  })(), createComponent(L10n.Stylize, {
    "class": "w-full create-game-markup mb-2",
    get text() {
      return leader().abilityText;
    }
  })];
};
const LeaderSelectDetailsPage2 = () => {
  const leaderModel = LeaderSelectModel.get();
  const leader = createMemo(() => leaderModel.selectedLeader());
  const rewardDesc = createMemo(() => {
    const reward = leader().nextReward;
    if (!reward) {
      return void 0;
    }
    const rewardType = getRewardType(reward.gameItemID);
    return rewardType == UnlockableRewardType.Memento ? `LOC_${reward.gameItemID}_FUNCTIONAL_DESCRIPTION` : void 0;
  });
  return [_tmpl$6(), (() => {
    var _el$24 = _tmpl$12();
    insert(_el$24, createComponent(L10n.Compose, {
      text: "LOC_CREATE_GAME_AGE_UNLOCK_TITLE"
    }));
    return _el$24;
  })(), createComponent(For, {
    get each() {
      return leader().ageUnlocks;
    },
    children: (unlock) => (() => {
      var _el$35 = _tmpl$18(), _el$36 = _el$35.firstChild;
      insert(_el$35, createComponent(L10n.Stylize, {
        text: unlock
      }), null);
      return _el$35;
    })()
  }), createComponent(Show, {
    get when() {
      return leader().nextReward;
    },
    get children() {
      return [_tmpl$8(), (() => {
        var _el$26 = _tmpl$13(), _el$27 = _el$26.firstChild, _el$28 = _el$27.firstChild, _el$29 = _el$27.nextSibling;
        insert(_el$27, createComponent(L10n.Compose, {
          text: "LOC_UI_RADIAL_MENU_DETAILS_UNLOCK_NEXT"
        }), _el$28);
        insert(_el$29, createComponent(L10n.Compose, {
          text: "LOC_END_GAME_ADD_LEVEL",
          get args() {
            return [leader().nextReward?.level ?? ""];
          }
        }));
        return _el$26;
      })(), createComponent(TicketBox, {
        "class": "flex-auto flex flex-row relative mt-1 overflow-hidden",
        get children() {
          return [_tmpl$14(), (() => {
            var _el$31 = _tmpl$15();
            insert(_el$31, createComponent(Icon, {
              "class": "size-19 m-4",
              get name() {
                return `url('${leader().nextReward?.reward}')`;
              },
              isUrl: true
            }));
            return _el$31;
          })(), (() => {
            var _el$32 = _tmpl$17(), _el$33 = _el$32.firstChild;
            insert(_el$33, createComponent(L10n.Compose, {
              get text() {
                return leader().nextReward?.title ?? "";
              }
            }));
            insert(_el$32, createComponent(L10n.Stylize, {
              "class": "flex-auto create-game-markup",
              get text() {
                return rewardDesc() ?? leader().nextReward?.desc ?? "";
              }
            }), null);
            insert(_el$32, createComponent(Show, {
              get when() {
                return rewardDesc();
              },
              get children() {
                return [_tmpl$16(), createComponent(L10n.Stylize, {
                  "class": "text-accent-5 text-sm my-1",
                  get text() {
                    return leader().nextReward?.desc ?? "";
                  }
                })];
              }
            }), null);
            return _el$32;
          })()];
        }
      })];
    }
  })];
};
const LeaderSelectDetails = () => {
  const leaderModel = LeaderSelectModel.get();
  const leader = createMemo(() => leaderModel.selectedLeader());
  return (() => {
    var _el$37 = _tmpl$19(), _el$38 = _el$37.firstChild;
    insert(_el$38, createComponent(Header, {
      "class": "leader-select-leader-name text-custom font-bold uppercase leading-none",
      get children() {
        return createComponent(L10n.Compose, {
          get text() {
            return leader().name;
          }
        });
      }
    }));
    insert(_el$37, createComponent(Show, {
      get when() {
        return leader().leaderID != "RANDOM";
      },
      get children() {
        return createComponent(Tab, {
          "class": "flex flex-col flex-auto",
          get children() {
            return [createComponent(ScrollArea, {
              "class": "flex-auto",
              useProxy: true,
              get children() {
                return createComponent(Tab.Output, {});
              }
            }), createComponent(CreateGameTabPips, {}), createComponent(Tab.Item, {
              name: "leader-page=1",
              title: () => "Leader Abilities",
              body: () => createComponent(LeaderSelectDetailsPage1, {})
            }), createComponent(Tab.Item, {
              name: "leader-page-2",
              title: () => "Leader Unlocks",
              body: () => createComponent(LeaderSelectDetailsPage2, {})
            })];
          }
        });
      }
    }), null);
    return _el$37;
  })();
};
const TRIGGER_ANIMATION_END = WorldUI.hash("AnimationStateChange");
const LeaderStates = {
  Idle: "IDLE_CharSelect",
  VO: "VO_CharSelect"
};
const LeaderSelectScreenComponent = () => {
  const leaderModel = LeaderSelectModel.get();
  const [debouncedLeader, setLeader, isLeaderChanging] = createDebouncedSignal(200, leaderModel.selectedLeader());
  const [voPlaying, setVoPlaying] = createSignal(false);
  const leaderState = createMemo(() => voPlaying() ? LeaderStates.VO : LeaderStates.Idle);
  let voJustStarted = false;
  const subtitlesVisible = createMemo(() => Sound.getSubtitles() && voPlaying() && leaderModel.selectedLeader().quote != "");
  createEffect(on(() => leaderModel.selectedLeader(), (leader) => {
    setLeader(leader);
    setVoPlaying(false);
  }));
  createEffect(on(() => debouncedLeader(), () => {
    voJustStarted = true;
    setVoPlaying(true);
  }));
  function handleModelTrigger(hash) {
    if (hash == TRIGGER_ANIMATION_END && !isLeaderChanging()) {
      if (voJustStarted) {
        waitForLayout(() => {
          voJustStarted = false;
        });
        return;
      }
      setVoPlaying(false);
    }
  }
  return createComponent(CreateGameStage, {
    addTextBgGradient: true,
    get header() {
      return createComponent(CreateGameStageHeader, {
        get showSteps() {
          return !(ViewExperience() == UIViewExperience.Handheld);
        },
        title: "LOC_UI_CREATE_GAME_LEADER_SELECT"
      });
    },
    get children() {
      var _el$39 = _tmpl$21();
      insert(_el$39, createComponent(LeaderSelectLeadersPanel, {}), null);
      insert(_el$39, createComponent(LeaderSelectDetails, {}), null);
      insert(_el$39, createComponent(Show, {
        get when() {
          return subtitlesVisible();
        },
        get children() {
          var _el$40 = _tmpl$20();
          insert(_el$40, createComponent(L10n.Compose, {
            get text() {
              return leaderModel.selectedLeader().quote;
            }
          }));
          return _el$40;
        }
      }), null);
      insert(_el$39, createComponent(Scene3d, {
        name: "leader",
        get children() {
          return [createComponent(Camera3d, {
            cameraPos: {
              x: -1.834,
              y: -23.0713,
              z: 15.2
            },
            subjectPos: {
              x: -3.7,
              y: -17.4867,
              z: 14.8042
            },
            fov: 43
          }), createComponent(ModelGroup3d, {
            name: "CivDetails3dModelGroup",
            get children() {
              return [createComponent(Model3d, {
                model: "LEADER_SELECTION_PEDESTAL",
                angle: 120,
                scale: 0.9
              }), createComponent(Model3d, {
                get hidden() {
                  return isLeaderChanging();
                },
                get model() {
                  return debouncedLeader().model;
                },
                get state() {
                  return leaderState();
                },
                onTrigger: handleModelTrigger,
                clearTemporalHistoryOnChange: true
              })];
            }
          })];
        }
      }), null);
      return _el$39;
    }
  });
};
const LeaderSelectScreen = ComponentRegistry.register({
  name: "leader-select-screen",
  createInstance: LeaderSelectScreenComponent,
  styles: [style]
});

export { LeaderSelectScreen };
//# sourceMappingURL=leader-select-screen.js.map
