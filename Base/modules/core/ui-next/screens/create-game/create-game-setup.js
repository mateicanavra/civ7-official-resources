import { template, insert, setAttribute } from '../../../vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, createComponent, mergeProps, Show, createRenderEffect, For, onMount } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { ArrowButton } from '../../components/arrow-button.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { HeroButton2 } from '../../components/hero-button.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { NavHelp } from '../../components/nav-help.js';
import { Popup } from '../../components/popup.js';
import { RadioButton, RadioButtonSize } from '../../components/radio-button.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { SelectorSmall } from '../../components/selector-small.js';
import { SpatialSlot } from '../../components/slot.js';
import { useTabContext } from '../../components/tab.js';
import { Tooltip, TooltipHorizontalPosition, TooltipVerticalPosition } from '../../components/tooltip.js';
import { useCivSelectModelContext } from './civ-select-model.js';
import { CreateGameHRule2 } from './create-game-components.js';
import { useGameSetupModelContext } from './create-game-setup-model.js';
import { CreateGameStage, CreateGameStageHeader } from './create-game-stage.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { ViewExperience } from '../../services/view-experience.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import style from './create-game-setup.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-y-1\\.5 inset-x-1 overflow-hidden"><img alt=Background class="absolute create-game-setup-box-bg"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="create-game-setup-bottom-gradient absolute left-1 right-1 bottom-1\\.5"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row uppercase font-body text-accent-2 text-sm font-fit-shrink max-w-80"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative flex-auto flex flex-col"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0 flex flex-col"><div class="flex-auto flex flex-col justify-center items-center text-center create-game-setup-box-selector-content"><div class="uppercase text-xl font-title font-black text-tertiary-1 font-fit-shrink max-w-80"></div></div><div class="create-game-setup-box-pips-area flex flex-row items-center justify-center p-1 m-0\\.5 mb-1 relative"><div class="create-game-setup-gradient absolute inset-0"></div><div class="flex-auto flex flex-row justify-center items-center"><div class=w-3\\.5></div><div class=w-3\\.5></div></div></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute inset-y-1\\.5 inset-x-1 overflow-hidden"><img alt=Background class="absolute create-game-setup-box-button-bg"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-row uppercase font-body text-accent-2 text-sm "></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="uppercase text-xl font-title font-black text-tertiary-1 mx-4 text-center font-fit-shrink"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex-auto flex flex-col justify-center items-center"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="create-game-setup-divider-line mb-4 mt-8"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="flex flex-col create-game-setup-container-column h-full"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex flex-1 flex-col justify-center"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class=create-game-setup-divider-line></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="flex flex-col create-game-setup-selections"><div class="flex flex-row items-center justify-center"><div class="flex flex-col mx-4 mt-2 items-center"><div class="font-base uppercase text-tertiary-1 font-black"></div></div><div class="civ-select-v-divider w-0\\.5 mx-4 my-2 self-stretch"></div><div class="flex flex-col mx-4 mt-2 items-center"><div class="font-base uppercase text-tertiary-1 font-black"></div></div></div><div class=create-game-setup-divider-line></div></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="flex flex-row mb-5 items-center justify-center create-game-setup-buttons-area"><div class="filigree-h4-left mt-3"></div><div class="filigree-h4-right mt-3"></div></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="font-title relative flex flex-col flex-auto"data-name=layout-center><div class="flex flex-row flex-auto create-game-setup-container"><div class="flex flex-col"></div></div></div>`);
function BoxSelector(props) {
  const [local, other] = splitProps(props, ["class", "icon", "title", "items", "selectedValue", "setSelectedValue", "bgImage", "bgImagePositionX", "bgImagePositionY"]);
  const selectedItem = createMemo(() => local.items.find((i) => i.value == local.selectedValue()) ?? local.items[0]);
  const selectedIndex = createMemo(() => local.items.findIndex((i) => i.value == local.selectedValue()));
  const audioTrigger = useAudio("RadioItem");
  function selectNext() {
    let newIndex = selectedIndex() + 1;
    if (newIndex >= local.items.length) {
      newIndex = 0;
    }
    local.setSelectedValue(local.items[newIndex].value);
    audioTrigger("tab-nav-next");
  }
  function selectPrevious() {
    let newIndex = selectedIndex() - 1;
    if (newIndex < 0) {
      newIndex = local.items.length - 1;
    }
    local.setSelectedValue(local.items[newIndex].value);
    audioTrigger("tab-nav-previous");
  }
  function onNavigate(navigationEvent) {
    if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
      if (navigationEvent.detail.name == "nav-previous") {
        selectPrevious();
        navigationEvent.preventDefault();
        navigationEvent.stopPropagation();
      } else if (navigationEvent.detail.name == "nav-next") {
        selectNext();
        navigationEvent.preventDefault();
        navigationEvent.stopPropagation();
      }
    }
  }
  return createComponent(Activatable, mergeProps(other, {
    actionKey: "none",
    get ["class"]() {
      return `create-game-setup-box m-2 relative group ${props.class ?? ""}`;
    },
    "on:navigate-input": onNavigate,
    get children() {
      return [(() => {
        var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$6 = _el$2.nextSibling, _el$7 = _el$6.firstChild, _el$9 = _el$7.firstChild, _el$10 = _el$7.nextSibling, _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling;
        insert(_el$, createComponent(Show, {
          get when() {
            return local.bgImage;
          },
          get children() {
            return [(() => {
              var _el$3 = _tmpl$(), _el$4 = _el$3.firstChild;
              createRenderEffect((_p$) => {
                var _v$ = local.bgImage, _v$2 = (local.bgImagePositionX || 0) + "px", _v$3 = (local.bgImagePositionY || 0) + "px";
                _v$ !== _p$.e && setAttribute(_el$4, "src", _p$.e = _v$);
                _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$4.style.setProperty("left", _v$2) : _el$4.style.removeProperty("left"));
                _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$4.style.setProperty("top", _v$3) : _el$4.style.removeProperty("top"));
                return _p$;
              }, {
                e: void 0,
                t: void 0,
                a: void 0
              });
              return _el$3;
            })(), _tmpl$2()];
          }
        }), _el$6);
        insert(_el$7, createComponent(Show, {
          get when() {
            return local.icon;
          },
          get children() {
            return createComponent(Icon, {
              get name() {
                return local.icon;
              },
              isUrl: true,
              "class": "create-game-setup-box-selector-icon"
            });
          }
        }), _el$9);
        insert(_el$7, createComponent(Show, {
          get when() {
            return local.title;
          },
          get children() {
            var _el$8 = _tmpl$3();
            insert(_el$8, createComponent(L10n.Compose, {
              get text() {
                return local.title;
              }
            }));
            return _el$8;
          }
        }), _el$9);
        insert(_el$9, createComponent(L10n.Compose, {
          get text() {
            return selectedItem().name;
          }
        }));
        insert(_el$7, createComponent(CreateGameHRule2, {
          color: "#85878C",
          "class": "w-full mx-8 my-2 mx-4 opacity-35 h-0\\.5"
        }), null);
        insert(_el$7, createComponent(L10n.Stylize, {
          get text() {
            return selectedItem().description;
          },
          "class": "font-body text-accent-2 text-sm font-fit-shrink max-w-80"
        }), null);
        insert(_el$12, createComponent(ArrowButton, {
          right: false,
          disableFocus: true,
          onActivate: selectPrevious,
          "class": "w-6 h-8"
        }), _el$13);
        insert(_el$12, createComponent(NavHelp, {
          actionName: "nav-previous",
          "class": "-ml-3 mr-1 opacity-0 group-focus\\:opacity-100"
        }), _el$14);
        insert(_el$12, createComponent(For, {
          get each() {
            return local.items;
          },
          children: (item) => createComponent(Tooltip.Text, {
            bodyClass: "flex flex-row justify-center",
            get text() {
              return item.name;
            },
            get children() {
              return createComponent(RadioButton, {
                get size() {
                  return RadioButtonSize.SMALL;
                },
                get isChecked() {
                  return selectedItem().value == item.value;
                },
                disableFocus: true,
                onActivate: () => {
                  local.setSelectedValue(item.value);
                }
              });
            }
          })
        }), _el$14);
        insert(_el$12, createComponent(NavHelp, {
          actionName: "nav-next",
          "class": "-mr-3 ml-1 opacity-0 group-focus\\:opacity-100"
        }), _el$14);
        insert(_el$12, createComponent(ArrowButton, {
          right: true,
          disableFocus: true,
          onActivate: selectNext,
          "class": "w-6 h-8"
        }), null);
        return _el$;
      })(), _tmpl$5()];
    }
  }));
}
function BoxSelectorButton(props) {
  return createComponent(Activatable, {
    get onActivate() {
      return props.onActivate;
    },
    get ["class"]() {
      return props.class ?? "create-game-setup-box m-2 relative group";
    },
    get children() {
      return [_tmpl$6(), createComponent(Show, {
        get when() {
          return props.bgImage;
        },
        get children() {
          return [(() => {
            var _el$17 = _tmpl$7(), _el$18 = _el$17.firstChild;
            createRenderEffect((_p$) => {
              var _v$4 = props.bgImage, _v$5 = (props.bgImagePositionX || 0) + "px", _v$6 = (props.bgImagePositionY || 0) + "px";
              _v$4 !== _p$.e && setAttribute(_el$18, "src", _p$.e = _v$4);
              _v$5 !== _p$.t && ((_p$.t = _v$5) != null ? _el$18.style.setProperty("left", _v$5) : _el$18.style.removeProperty("left"));
              _v$6 !== _p$.a && ((_p$.a = _v$6) != null ? _el$18.style.setProperty("top", _v$6) : _el$18.style.removeProperty("top"));
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0
            });
            return _el$17;
          })(), _tmpl$2()];
        }
      }), (() => {
        var _el$20 = _tmpl$10();
        insert(_el$20, createComponent(Icon, {
          get name() {
            return props.icon;
          },
          isUrl: true,
          get ["class"]() {
            return props.description ? "create-game-setup-box-selector-icon" : "size-18";
          }
        }), null);
        insert(_el$20, createComponent(Show, {
          get when() {
            return props.title;
          },
          get children() {
            var _el$21 = _tmpl$8();
            insert(_el$21, createComponent(L10n.Compose, {
              get text() {
                return props.title;
              }
            }));
            return _el$21;
          }
        }), null);
        insert(_el$20, createComponent(Show, {
          get when() {
            return props.name;
          },
          get children() {
            var _el$22 = _tmpl$9();
            insert(_el$22, createComponent(L10n.Compose, {
              get text() {
                return props.name;
              }
            }));
            createRenderEffect((_$p) => (_$p = Layout.pixels(366)) != null ? _el$22.style.setProperty("max-width", _$p) : _el$22.style.removeProperty("max-width"));
            return _el$22;
          }
        }), null);
        insert(_el$20, createComponent(Show, {
          get when() {
            return props.description;
          },
          get children() {
            return [createComponent(CreateGameHRule2, {
              color: "#85878C",
              "class": "w-full mx-8 my-2 mx-4 opacity-35 h-0\\.5"
            }), createComponent(ScrollArea, {
              "class": "flex-auto",
              get children() {
                return createComponent(L10n.Stylize, {
                  get text() {
                    return props.description;
                  },
                  "class": "font-body text-accent-2 text-sm"
                });
              }
            })];
          }
        }), null);
        return _el$20;
      })(), _tmpl$5()];
    }
  });
}
const CreateGameSetupComponent = () => {
  const gameSetupModel = useGameSetupModelContext();
  const isSmallScreen = useIsSmallScreen();
  const isDesktop = createMemo(() => ViewExperience() == UIViewExperience.Desktop);
  const selectedMap = createMemo(() => gameSetupModel.Map.selectedOption);
  const flowContext = useScreenFlowContext();
  const tabContext = useTabContext();
  const civMode = gameSetupModel.GameStartCivSelectionMode;
  const leaderMode = gameSetupModel.LeaderAssociatedCivSelectionMode;
  const boxesBg = {
    Difficulty: {
      positionX: -1026,
      image: "sett_difficulty_desat.png"
    },
    MapSelection: {
      positionX: -826,
      image: "sett_type_desat.png"
    },
    Speed: {
      positionX: -950,
      image: "sett_speed_desat.png"
    },
    MapSize: {
      positionX: -678,
      image: "sett_size_desat.png"
    },
    AgeTransitionImpact: {
      positionX: -1129,
      image: "sett_ageimpact_desat.png"
    }
  };
  const model = useCivSelectModelContext();
  const audio = useAudio("GameSetupOptions");
  onMount(() => {
    audio("popup-open");
  });
  return createComponent(CreateGameStage, {
    get header() {
      return createComponent(CreateGameStageHeader, {
        get showSteps() {
          return isDesktop();
        },
        title: "LOC_UI_CREATE_GAME_GAME_SETUP",
        onBack: () => {
          if (flowContext.wasHubVisited()) {
            flowContext.activatePrev();
          } else if (model.selectedCiv().civID != "RANDOM") {
            flowContext.activatePrev();
            tabContext.activate("civ-details");
          } else {
            tabContext.activate("civ-select");
          }
        }
      });
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
            if (model.selectedCiv().civID != "RANDOM") {
              flowContext.activatePrev();
            } else {
              tabContext.activate("civ-select");
            }
            useAudio("CreateGameBackButton")("activate");
          }
        }]
      }), (() => {
        var _el$24 = _tmpl$18(), _el$25 = _el$24.firstChild, _el$26 = _el$25.firstChild;
        insert(_el$26, createComponent(SpatialSlot, {
          name: "game-setup-options",
          "class": "flex flex-col flex-auto",
          get children() {
            return [(() => {
              var _el$27 = _tmpl$14();
              insert(_el$27, createComponent(Show, {
                get when() {
                  return !isSmallScreen();
                },
                get children() {
                  return _tmpl$11();
                }
              }), null);
              insert(_el$27, createComponent(ScrollArea, {
                "class": "flex-auto create-game-setup-scroll-area",
                reserveSpace: true,
                get children() {
                  var _el$29 = _tmpl$13();
                  insert(_el$29, createComponent(AudioContextProvider, {
                    segment: "GameSetupOptions",
                    get children() {
                      return [(() => {
                        var _el$30 = _tmpl$12();
                        insert(_el$30, createComponent(BoxSelector, {
                          id: "difficulty",
                          get title() {
                            return gameSetupModel.Difficulty.name;
                          },
                          get items() {
                            return gameSetupModel.Difficulty.options;
                          },
                          selectedValue: () => gameSetupModel.Difficulty.value,
                          get setSelectedValue() {
                            return gameSetupModel.Difficulty.setValue;
                          },
                          get bgImage() {
                            return "blp:" + boxesBg.Difficulty.image;
                          },
                          get bgImagePositionX() {
                            return boxesBg.Difficulty.positionX;
                          }
                        }), null);
                        insert(_el$30, createComponent(AudioContextProvider, {
                          segment: "MapSelectButton",
                          get children() {
                            return createComponent(Tooltip.Text, {
                              get header() {
                                return selectedMap()?.name ?? "";
                              },
                              get text() {
                                return selectedMap()?.description ?? "";
                              },
                              get initialVPosition() {
                                return TooltipVerticalPosition.CENTER;
                              },
                              get initialHPosition() {
                                return TooltipHorizontalPosition.RIGHT;
                              },
                              allowFlip: true,
                              get children() {
                                return createComponent(Popup.Trigger, {
                                  name: "map-select",
                                  get children() {
                                    return createComponent(BoxSelectorButton, {
                                      id: "map-selection",
                                      get title() {
                                        return gameSetupModel.Map.name;
                                      },
                                      get name() {
                                        return selectedMap()?.name ?? "";
                                      },
                                      get icon() {
                                        return selectedMap()?.icon ?? "";
                                      },
                                      get bgImage() {
                                        return "blp:" + boxesBg.MapSelection.image;
                                      },
                                      get bgImagePositionX() {
                                        return boxesBg.MapSelection.positionX;
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        }), null);
                        return _el$30;
                      })(), (() => {
                        var _el$31 = _tmpl$12();
                        insert(_el$31, createComponent(BoxSelector, {
                          id: "speed",
                          get title() {
                            return gameSetupModel.GameSpeeds.name;
                          },
                          get items() {
                            return gameSetupModel.GameSpeeds.options;
                          },
                          selectedValue: () => gameSetupModel.GameSpeeds.value,
                          get setSelectedValue() {
                            return gameSetupModel.GameSpeeds.setValue;
                          },
                          get bgImage() {
                            return "blp:" + boxesBg.Speed.image;
                          },
                          get bgImagePositionX() {
                            return boxesBg.Speed.positionX;
                          }
                        }), null);
                        insert(_el$31, createComponent(BoxSelector, {
                          id: "map-size",
                          get title() {
                            return gameSetupModel.MapSize.name;
                          },
                          get items() {
                            return gameSetupModel.MapSize.options;
                          },
                          selectedValue: () => gameSetupModel.MapSize.value,
                          get setSelectedValue() {
                            return gameSetupModel.MapSize.setValue;
                          },
                          get bgImage() {
                            return "blp:" + boxesBg.MapSize.image;
                          },
                          get bgImagePositionX() {
                            return boxesBg.MapSize.positionX;
                          }
                        }), null);
                        return _el$31;
                      })(), (() => {
                        var _el$32 = _tmpl$12();
                        insert(_el$32, createComponent(BoxSelector, {
                          id: "age-transition-impact",
                          get title() {
                            return gameSetupModel.AgeTransitionSetting.name;
                          },
                          get items() {
                            return gameSetupModel.AgeTransitionSetting.options;
                          },
                          selectedValue: () => gameSetupModel.AgeTransitionSetting.value,
                          get setSelectedValue() {
                            return gameSetupModel.AgeTransitionSetting.setValue;
                          },
                          get bgImage() {
                            return "blp:" + boxesBg.AgeTransitionImpact.image;
                          },
                          get bgImagePositionX() {
                            return boxesBg.AgeTransitionImpact.positionX;
                          }
                        }), null);
                        insert(_el$32, createComponent(AudioContextProvider, {
                          segment: "AdvancedSettingsButton",
                          get children() {
                            return createComponent(Popup.Trigger, {
                              name: "advanced-options",
                              get children() {
                                return createComponent(BoxSelectorButton, {
                                  id: "advanced-settings",
                                  name: "LOC_UI_CREATE_GAME_ADVANCED_SETTINGS",
                                  icon: "url('blp:settings_adv_option_100x100')"
                                });
                              }
                            });
                          }
                        }), null);
                        return _el$32;
                      })()];
                    }
                  }));
                  return _el$29;
                }
              }), null);
              return _el$27;
            })(), (() => {
              var _el$33 = _tmpl$16(), _el$35 = _el$33.firstChild, _el$36 = _el$35.firstChild, _el$37 = _el$36.firstChild, _el$38 = _el$36.nextSibling, _el$39 = _el$38.nextSibling, _el$40 = _el$39.firstChild;
              insert(_el$33, createComponent(Show, {
                get when() {
                  return !isSmallScreen();
                },
                get children() {
                  return _tmpl$15();
                }
              }), _el$35);
              insert(_el$37, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_GAME_START_CIV_SELECTION"
              }));
              insert(_el$36, createComponent(SelectorSmall, {
                "class": "m-1 create-game-setup-selection-carousel accent-2 uppercase text-sm font-black font-body",
                get items() {
                  return civMode.options;
                },
                setSelectedValue: (value) => civMode.setValue(value),
                selectedValue: () => civMode.selectedOption?.value,
                arrowClass: "w-6 h-8"
              }), null);
              insert(_el$40, createComponent(L10n.Compose, {
                text: "LOC_UI_CREATE_GAME_ASSOCIATED_CIV_SELECTION"
              }));
              insert(_el$39, createComponent(SelectorSmall, {
                "class": "m-1 create-game-setup-selection-carousel accent-2 uppercase text-sm font-black font-body",
                get items() {
                  return leaderMode.options;
                },
                setSelectedValue: (value) => leaderMode.setValue(value),
                selectedValue: () => leaderMode.selectedOption?.value,
                arrowClass: "w-6 h-8"
              }), null);
              return _el$33;
            })(), (() => {
              var _el$41 = _tmpl$17(), _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling;
              insert(_el$41, createComponent(HeroButton2, {
                "class": "flex items-center justify-center create-game-setup-continue-button",
                onActivate: () => flowContext.activateNext(),
                autoFocus: true,
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_GENERIC_CONTINUE"
                  });
                }
              }), _el$43);
              return _el$41;
            })()];
          }
        }));
        return _el$24;
      })()];
    }
  });
};
const CreateGameSetup = ComponentRegistry.register({
  name: "create-game-setup",
  createInstance: CreateGameSetupComponent,
  styles: [style]
});

export { BoxSelectorButton, CreateGameSetup };
//# sourceMappingURL=create-game-setup.js.map
