import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { untrack, createMemo, onMount, onCleanup, createComponent, createRenderEffect, Show, For, mergeProps, splitProps } from '../../../../core/vendor/solid-js/dist/solid.js';
import { DisplayQueueManager } from '../../../../core/ui/context-manager/display-queue-manager.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { InputEngineEventName, NavigateInputEventName } from '../../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { LineGraph } from '../../../../core/ui-next/components/line-graph.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { ProgressBar } from '../../../../core/ui-next/components/progress-bar.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { useIsSmallScreen, LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import TutorialManager from '../../../ui/tutorial/tutorial-manager.js';
import { ScreenFrame } from '../../components/screen-frame.js';
import { CultureVictoryTab } from './culture-victory-tab.js';
import { ScienceVictoryTab } from './science-victory.js';
import { createVictoriesScreenModel, VictoryTabType, VictoriesScreenContext, useVictoriesScreenContext } from './victories-screen-model.js';
import { VictoryRulesTooltip, VictoryHeader, VictoryRow, VictoryTabBase } from './victory-tab-base.js';
import style from './victories-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="absolute inset-0 bottom-0 filigree-inner-frame-top"></div><div class="absolute inset-0 bottom-0 filigree-inner-frame-bottom"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute bottom-10 right-10 flex flow-row"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute left-12 -top-6 victories-header"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full h-full self-center victories-summary-main flex flex-col shrink"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=flex-1></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute -top-14 victories-header"><div class="font-body text-body text-xs self-center"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class=self-center></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-row absolute -mt-6 ml-2 w-full victories-point-goal-line"><div><div role=heading></div></div><div class="victories-military-col-4 flex flex-row"><div class="h-full w-2"></div><div class="font-title text-xl text-white flex-1 self-center"></div></div><div class="victories-military-col-3 font-title text-sm uppercase flex flex-row"><div class="w-full self-center"><div class="self-start ml-2"></div></div></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="w-full h-4"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="absolute inset-0"><div class="ml-2 uppercase fxs-header self-center"></div>//TODO:dropdown here when multiple ages of data are available</div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="w-full h-full relative victories-military-left-line-header"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="shrink mb-2 flex flex-row w-full"><div class="victories-econ-col-3 victories-economic-graph relative"><div class="h-full absolute inset-2"></div><div class="self-center font-body text-body font-sm"></div></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="relative w-full"><div class="absolute inset-0 relative bg-cover bg-no-repeat opacity-30 pointer-events-none"></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class=self-center>-</div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="size-full flex flex-row"><div class="w-full self-center"><div class="ml-2 uppercase fxs-header"></div></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="self-center flex flex-row flex-wrap"></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="victories-military-item-icon font-body text-lg text-body self-center"></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div><div role=heading></div></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class="victories-military-col-4 flex flex-row"></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="victories-military-col-3 font-title text-sm uppercase flex flex-row"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div class="w-full h-full flex flex-row"><div class="w-full self-center"><div class="ml-2 uppercase fxs-header"></div></div></div>`), _tmpl$23 = /* @__PURE__ */ template(`<div class="victories-econ-col-1-and-2-and-4 h-full relative"></div>`), _tmpl$24 = /* @__PURE__ */ template(`<div class="victories-econ-col-3 victories-economic-graph relative"><div class="ml-8 mt-8 font-title-lg"><div class="fxs-header uppercase"></div><div class="font-body-base text-body"></div><div class="fxs-header mt-4 uppercase"></div><div class="font-body-base text-body"></div></div></div>`), _tmpl$25 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="relative w-full"><div class="absolute top-4 bottom-0 left-0 right-0 relative bg-cover bg-no-repeat opacity-20 pointer-events-none"></div><div class="h-full flex flex-col items-center w-full"><div class="w-full h-4"></div><div class="shrink mb-2 flex flex-row w-full"></div></div></div>`), _tmpl$27 = /* @__PURE__ */ template(`<div class="victories-summary-header-lines promotion-header__lines self-center bg-cover bg-no-repeat pointer-events-none flex-auto"></div>`), _tmpl$28 = /* @__PURE__ */ template(`<div class="font-body text-2xs self-center mt-4 mx-6 h-16 opacity-60"><div role=heading></div></div>`), _tmpl$29 = /* @__PURE__ */ template(`<div class="h-16 w-8"></div>`), _tmpl$30 = /* @__PURE__ */ template(`<div class="w-full px-4"></div>`), _tmpl$31 = /* @__PURE__ */ template(`<div class="relative h-7 w-full max-w-128 bg-contain bg-no-repeat pointer-events-none"></div>`), _tmpl$32 = /* @__PURE__ */ template(`<div class="size-10 -ml-1 -mt-12 mb-1 victories-trophy"></div>`), _tmpl$33 = /* @__PURE__ */ template(`<div class="font-title text-2xs text-secondary uppercase victories-countdown-title"role=heading></div>`), _tmpl$34 = /* @__PURE__ */ template(`<div class="font-title text-2xs text-body uppercase"role=heading></div>`), _tmpl$35 = /* @__PURE__ */ template(`<div class="victories-progress-bar relative mt-1"role=heading><div class="absolute -top-2 bottom-0 -ml-4 mt-1"role=heading></div></div>`), _tmpl$36 = /* @__PURE__ */ template(`<div><div class="absolute top-2 left-2 rotate-180 size-4 bg-contain"></div><div class="absolute top-2 right-2 -rotate-90 size-4 bg-contain"></div><div class="absolute bottom-2 left-2 rotate-90 size-4 bg-contain"></div><div class="absolute bottom-2 right-2 size-4 bg-contain"></div><div class="absolute inset-0"></div></div>`), _tmpl$37 = /* @__PURE__ */ template(`<div class="font-title-sm opacity-80 uppercase ml-1"role=heading></div>`), _tmpl$38 = /* @__PURE__ */ template(`<div class="font-body-sm opacity-80"role=heading></div>`), _tmpl$39 = /* @__PURE__ */ template(`<div><div class="victories-point-goal-line w-full justify-center mx-4"></div></div>`), _tmpl$40 = /* @__PURE__ */ template(`<div data-name=Point-Goal-Panel></div>`), _tmpl$41 = /* @__PURE__ */ template(`<div class="font-body text-base"role=heading></div>`), _tmpl$42 = /* @__PURE__ */ template(`<div class="img-popup-middle-decor size-16"></div>`), _tmpl$43 = /* @__PURE__ */ template(`<div class="absolute top-0 bottom-1 left-0 right-0 -ml-6 bg-no-repeat bg-cover"></div>`), _tmpl$44 = /* @__PURE__ */ template(`<div class="mr-2 self-center"></div>`), _tmpl$45 = /* @__PURE__ */ template(`<div class="flex flex-row">. </div>`), _tmpl$46 = /* @__PURE__ */ template(`<div><div class="flex flex-row">/</div></div>`), _tmpl$47 = /* @__PURE__ */ template(`<div class="victories-trophy size-6"></div>`), _tmpl$48 = /* @__PURE__ */ template(`<div role=heading></div>`), _tmpl$49 = /* @__PURE__ */ template(`<div class="absolute inset-0 -top-1 bg-no-repeat bg-cover"></div>`), _tmpl$50 = /* @__PURE__ */ template(`<div class="font-title-sm uppercase fxs-header"></div>`), _tmpl$51 = /* @__PURE__ */ template(`<div class="ml-12 font-body text-sm text-white"></div>`), _tmpl$52 = /* @__PURE__ */ template(`<div class=items-center><div class="font-title-base fxs-header uppercase self-center mb-4"></div></div>`), _tmpl$53 = /* @__PURE__ */ template(`<div class=ml-8></div>`), _tmpl$54 = /* @__PURE__ */ template(`<div class="font-title text-xs text-secondary uppercase self-center mt-2 mb-2"></div>`), _tmpl$55 = /* @__PURE__ */ template(`<div class="font-body text-xs text-white self-center justify-center mb-2 w-128"></div>`), _tmpl$56 = /* @__PURE__ */ template(`<div class=items-center><div class="font-title text-xs text-secondary uppercase self-center mb-4"></div></div>`);
var IdeologyIconTints = /* @__PURE__ */ ((IdeologyIconTints2) => {
  IdeologyIconTints2["SameIdeology"] = "#FFFFFF";
  IdeologyIconTints2["RivalIdeology"] = "#FF9047";
  return IdeologyIconTints2;
})(IdeologyIconTints || {});
const VictoriesScreenComponent = (props) => {
  const isSmallScreen = useIsSmallScreen();
  const endGameScreen = untrack(() => props.endGameScreen);
  const model = createVictoriesScreenModel(endGameScreen);
  const defaultTab = createMemo(() => {
    return props.activeTabId?.() ?? model.data.defaultTab;
  });
  const audio = useAudio("VictoryScreen");
  const onMilitaryFocus = (playerId) => {
    model.focusPlayer(playerId, VictoryTabType.Military);
  };
  const onMilitaryBlur = (playerId) => {
    model.unFocusPlayer(playerId, VictoryTabType.Military);
  };
  onMount(() => {
    audio("popup-open");
    window.addEventListener(InputEngineEventName, handleWindowEngineInput);
    window.addEventListener(NavigateInputEventName, handleWindowEngineInput);
  });
  onCleanup(() => {
    window.removeEventListener(InputEngineEventName, handleWindowEngineInput);
    window.removeEventListener(NavigateInputEventName, handleWindowEngineInput);
  });
  const handleOnClosing = () => {
    if (!props.endGameScreen) {
      audio("popup-close");
    }
  };
  const handleWindowEngineInput = (inputEvent) => {
    if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      switch (inputEvent.detail.name) {
        case "shell-action-1":
          model.onGamepadInspectButton();
          inputEvent.preventDefault();
          inputEvent.stopImmediatePropagation();
          break;
        case "toggle-tooltip":
          if (!TutorialManager.isShowing()) {
            model.onGamepadInfoButton();
          }
          break;
        case "sys-menu":
          if (props.endGameScreen) {
            inputEvent.preventDefault();
            inputEvent.stopImmediatePropagation();
          }
          break;
      }
    }
  };
  const justOneMoreTurn = () => {
    const args = {};
    const result = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.EXTEND_GAME, args, false);
    if (result.Success) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.EXTEND_GAME, args);
      DisplayQueueManager.closeMatching("EndgameScreen");
      InterfaceMode.switchToDefault();
    }
  };
  const layoutModel = LayoutModel.get();
  return createComponent(VictoriesScreenContext.Provider, {
    value: model,
    get children() {
      return createComponent(ScreenFrame, {
        name: "Victories-Screen",
        panelContext: "screen-victory-progress",
        audioContext: "VictoryScreen",
        title: "LOC_UI_VICTORY_PROGRESS",
        get ornatePanelData() {
          return model.data.ornatePanelData;
        },
        onClosing: handleOnClosing,
        get hideClose() {
          return props.endGameScreen;
        },
        addYieldBar: false,
        get children() {
          return [createComponent(Tab, {
            "class": "victories-tab-bar w-full flex flex-col flex-auto pointer-events-auto mx-5",
            get defaultTab() {
              return defaultTab();
            },
            onTabChanged: (tabProps) => {
              if (tabProps) {
                model.tabChanged(tabProps.name);
              }
            },
            get children() {
              return [createComponent(Tab.TabList, {
                "class": "victories-tab-width self-center text-base font-base",
                nextHotkey: "nav-next",
                previousHotkey: "nav-previous",
                get titleClass() {
                  return `${LayoutModel.get().screenWidthDownScaled() < 1600 ? "text-2xs ml-2" : `${LayoutModel.get().screenWidthDownScaled() <= 1920 ? "text-xs ml-2" : ""}`}`;
                }
              }), (() => {
                var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
                insert(_el$, createComponent(Tab.Output, {}), null);
                createRenderEffect(() => className(_el$, `${isSmallScreen() ? "mt-2" : "mt-8"} flex flex-col flex-auto bg-accent-6 items-center mb-5 pl-8 pr-8 pt-8 relative victories-panel-container`));
                return _el$;
              })(), createComponent(Tab.Item, {
                name: "summary",
                title: () => "LOC_PEDIA_PAGE_CHAPTER_SUMMARY_TITLE",
                body: () => (() => {
                  var _el$5 = _tmpl$5();
                  insert(_el$5, createComponent(Show, {
                    get when() {
                      return !isSmallScreen();
                    },
                    get children() {
                      var _el$6 = _tmpl$3();
                      insert(_el$6, createComponent(VSlot, {
                        "class": "font-body text-body text-xs self-center",
                        get children() {
                          return createComponent(Show, {
                            get when() {
                              return Game.AgeProgressManager.isExtendedGame || Game.AgeProgressManager.getMaxAgeProgressionPoints() <= 0;
                            },
                            get fallback() {
                              return createComponent(L10n.Compose, {
                                text: "LOC_VICTORY_SUMMARY_HEADER"
                              });
                            },
                            get children() {
                              return createComponent(L10n.Compose, {
                                text: "LOC_VICTORY_OMT_SUMMARY_HEADER"
                              });
                            }
                          });
                        }
                      }));
                      return _el$6;
                    }
                  }), null);
                  insert(_el$5, createComponent(ScrollArea, {
                    "class": "h-full relative",
                    useProxy: true,
                    get children() {
                      var _el$7 = _tmpl$4();
                      insert(_el$7, createComponent(VSlot, {
                        "class": "relative self-center mx-1 victories-summary-focus flex-1",
                        get children() {
                          return createComponent(HSlot, {
                            "class": "victories-summary-container w-full flex-1",
                            lockNavigation: true,
                            get autoFocus() {
                              return !model.tooltipToggle;
                            },
                            get children() {
                              return createComponent(For, {
                                get each() {
                                  return model.data.panels;
                                },
                                children: (card) => createComponent(SummaryVictoryCard, card)
                              });
                            }
                          });
                        }
                      }));
                      return _el$7;
                    }
                  }), null);
                  return _el$5;
                })()
              }), createComponent(Tab.Item, {
                name: "cultural",
                title: () => "LOC_VICTORY_CULTURE_MODERN_NAME",
                body: () => createComponent(CultureVictoryTab, mergeProps(() => model.data.cultureDetails))
              }), createComponent(Tab.Item, {
                name: "economic",
                title: () => "LOC_VICTORY_ECONOMIC_MODERN_NAME",
                body: () => (() => {
                  var _el$8 = _tmpl$13(), _el$9 = _el$8.firstChild;
                  _el$9.style.setProperty("background-image", "url(bg_victory_economic3)");
                  insert(_el$8, createComponent(VSlot, {
                    name: "Economic",
                    "class": "h-full flex flex-col items-center w-full transition-opacity duration-150 ease-out",
                    get children() {
                      return [createComponent(Show, {
                        get when() {
                          return !isSmallScreen();
                        },
                        get children() {
                          var _el$10 = _tmpl$6(), _el$11 = _el$10.firstChild;
                          insert(_el$11, createComponent(L10n.Compose, {
                            get text() {
                              return model.data.economicDetails.headerText;
                            }
                          }));
                          return _el$10;
                        }
                      }), (() => {
                        var _el$12 = _tmpl$8(), _el$13 = _el$12.firstChild, _el$14 = _el$13.firstChild, _el$15 = _el$13.nextSibling, _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling, _el$19 = _el$15.nextSibling, _el$20 = _el$19.firstChild, _el$21 = _el$20.firstChild;
                        insert(_el$14, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_ECONOMIC_MODERN_NAME"
                        }));
                        insert(_el$17, createComponent(Show, {
                          get when() {
                            return model.data.panels[1].goals.pointGoal != -1;
                          },
                          get fallback() {
                            return createComponent(Tooltip.Text, {
                              get text() {
                                return Locale.stylize("LOC_VICTORY_NOVICTORIES_TOOLTIP");
                              },
                              get children() {
                                return _tmpl$14();
                              }
                            });
                          },
                          get children() {
                            var _el$18 = _tmpl$7();
                            insert(_el$18, () => Locale.toNumber(model.data.panels[1].goals.pointGoal));
                            return _el$18;
                          }
                        }));
                        insert(_el$21, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_GDP_NEEDED_TO_WIN"
                        }));
                        insert(_el$12, createComponent(VictoryRulesTooltip, {
                          get initialHPosition() {
                            return TooltipHorizontalPosition.LEFT;
                          },
                          get initialVPosition() {
                            return TooltipVerticalPosition.TOP;
                          },
                          "class": "self-center",
                          tooltipText: "LOC_VICTORIES_RULES_ECONOMIC",
                          titleText: "LOC_VICTORY_ECONOMIC_MODERN_NAME",
                          get titleClass() {
                            return model.data.panels[1].titleColor;
                          }
                        }), null);
                        createRenderEffect(() => className(_el$13, `victories-military-cols-1-and-2 font-title uppercase font-bold ${model.data.panels[1].titleColor} ${layoutModel.screenWidthDownScaled() < 1784 ? "text-lg" : "text-2xl"}`));
                        return _el$12;
                      })(), _tmpl$9(), createComponent(VictoryHeader, {
                        hideContentColumnDivider: true,
                        get children() {
                          var _el$23 = _tmpl$11();
                          insert(_el$23, createComponent(Show, {
                            when: false,
                            get children() {
                              return _tmpl$10();
                            }
                          }));
                          return _el$23;
                        }
                      }), (() => {
                        var _el$25 = _tmpl$12(), _el$26 = _el$25.firstChild, _el$27 = _el$26.firstChild;
                        insert(_el$25, createComponent(ScrollArea, {
                          "class": "victories-scroll-base w-full victories-econ-cols-1-and-2-and-4",
                          useProxy: true,
                          get children() {
                            return createComponent(VSlot, {
                              get children() {
                                return createComponent(VSlot, {
                                  "class": "relative pointer-events-auto victories-economic-focus transition-opacity duration-150 ease-out flex flex-col",
                                  lockNavigation: true,
                                  get autoFocus() {
                                    return !model.tooltipToggle;
                                  },
                                  get children() {
                                    return createComponent(For, {
                                      get each() {
                                        return model.data.economicDetails.playerDetails;
                                      },
                                      children: (player, index) => createComponent(VictoryRow, {
                                        get rowId() {
                                          return index() + 1;
                                        },
                                        get playerInfo() {
                                          return player.playerInfo;
                                        },
                                        divider: false,
                                        get rowType() {
                                          return VictoryTabType.Economic;
                                        },
                                        skipContentColumn: true,
                                        columnClassOverride: "econ",
                                        omitBottomLine: true,
                                        activateInfo: (playerId) => {
                                          if (ActionHandler.isTouchActive) {
                                            model.focusPlayer(playerId, VictoryTabType.Economic);
                                            model.onGamepadInspectButton();
                                          }
                                        }
                                      })
                                    });
                                  }
                                });
                              }
                            });
                          }
                        }), _el$26);
                        insert(_el$27, createComponent(LineGraph, {
                          "class": `opacity-100`,
                          width: 6,
                          get lines() {
                            return model.data.economicDetails.graphLines;
                          },
                          get maxX() {
                            return model.data.economicDetails.maxTurn;
                          },
                          get maxY() {
                            return model.data.economicDetails.graphTarget;
                          },
                          gridColorX: "rgb(255 255 255 / 30%)",
                          get axisLabelX() {
                            return Locale.compose("LOC_GENERIC_TURN");
                          },
                          get axisLabelY() {
                            return Locale.compose("LOC_VICTORY_ECONOMIC_GRAPH_TITLE");
                          },
                          axisNumberColor: "#b5b5b6",
                          axisLabelColor: "#848486"
                        }));
                        return _el$25;
                      })()];
                    }
                  }), null);
                  return _el$8;
                })()
              }), createComponent(Tab.Item, {
                name: "military",
                title: () => "LOC_VICTORY_MILITARY_MODERN_NAME",
                body: () => createComponent(VictoryTabBase, {
                  get header() {
                    return model.data.militaryDetails.headerText;
                  },
                  get titleColorClass() {
                    return model.data.panels[2].titleColor;
                  },
                  get background() {
                    return model.data.panels[2].background;
                  },
                  get targetScore() {
                    return model.data.militaryDetails.targetScore;
                  },
                  title: "LOC_VICTORY_MILITARY_MODERN_NAME",
                  rules: "LOC_VICTORIES_RULES_MILITARY",
                  pointsNeededText: "LOC_DOMINION_POINTS_NEEDED_TO_WIN",
                  get preScrollContent() {
                    return createComponent(VictoryHeader, {
                      get children() {
                        var _el$29 = _tmpl$15(), _el$30 = _el$29.firstChild, _el$31 = _el$30.firstChild;
                        insert(_el$31, createComponent(L10n.Compose, {
                          text: "LOC_GENERIC_SETTLEMENTS"
                        }));
                        return _el$29;
                      }
                    });
                  },
                  get children() {
                    return createComponent(VSlot, {
                      "class": "victories-military-content victories-military-focus transition-opacity duration-150 ease-out w-full",
                      lockNavigation: true,
                      get autoFocus() {
                        return !model.tooltipToggle;
                      },
                      get children() {
                        return createComponent(For, {
                          get each() {
                            return model.data.militaryDetails.playerDetails;
                          },
                          children: (player, index) => createComponent(VictoryRow, {
                            get rowId() {
                              return index() + 1;
                            },
                            get playerInfo() {
                              return player.playerInfo;
                            },
                            divider: true,
                            get rowType() {
                              return VictoryTabType.Military;
                            },
                            showTooltip: false,
                            activateInfo: (playerId) => {
                              if (ActionHandler.isTouchActive) {
                                model.focusPlayer(playerId, VictoryTabType.Military);
                                model.onGamepadInspectButton();
                              }
                            },
                            get children() {
                              var _el$32 = _tmpl$16();
                              insert(_el$32, createComponent(For, {
                                get each() {
                                  return player.structures;
                                },
                                children: (structure) => createComponent(MilitaryTooltip, mergeProps(structure, {
                                  get children() {
                                    return createComponent(Activatable, {
                                      get ["class"]() {
                                        return `victories-military-item-icon-outer relative ${layoutModel.screenWidthDownScaled() < 1784 ? "size-8" : "size-16"}`;
                                      },
                                      onFocus: () => onMilitaryFocus(player.playerInfo.playerId),
                                      onBlur: () => onMilitaryBlur(player.playerInfo.playerId),
                                      get children() {
                                        return [createComponent(Show, {
                                          get when() {
                                            return player.playerInfo.highlighted();
                                          },
                                          get children() {
                                            var _el$33 = _tmpl$17();
                                            insert(_el$33, () => structure.points.toString());
                                            return _el$33;
                                          }
                                        }), (() => {
                                          var _el$34 = _tmpl$18();
                                          createRenderEffect((_p$) => {
                                            var _v$ = `absolute inset-0 victories-structure-icon bg-contain bg-no-repeat ${structure.iconClass} ${player.playerInfo.highlighted() ? "opacity-20" : "opacity-70"}`, _v$2 = structure.iconURL, _v$3 = `${structure.wasConqueredFromIdeologicalOpponent ? "#FF9047" /* RivalIdeology */ : "#FFFFFF" /* SameIdeology */}`;
                                            _v$ !== _p$.e && className(_el$34, _p$.e = _v$);
                                            _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$34.style.setProperty("background-image", _v$2) : _el$34.style.removeProperty("background-image"));
                                            _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$34.style.setProperty("fxs-background-image-tint", _v$3) : _el$34.style.removeProperty("fxs-background-image-tint"));
                                            return _p$;
                                          }, {
                                            e: void 0,
                                            t: void 0,
                                            a: void 0
                                          });
                                          return _el$34;
                                        })()];
                                      }
                                    });
                                  }
                                }))
                              }));
                              return _el$32;
                            }
                          })
                        });
                      }
                    });
                  }
                })
              }), createComponent(Tab.Item, {
                name: "scientific",
                title: () => "LOC_VICTORY_SCIENCE_MODERN_NAME",
                body: () => createComponent(ScienceVictoryTab, mergeProps(() => model.data.scienceDetails))
              }), createComponent(Tab.Item, {
                name: "score",
                title: () => "LOC_VICTORY_SCORE_NAME",
                body: () => (() => {
                  var _el$35 = _tmpl$26(), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling, _el$44 = _el$37.firstChild, _el$48 = _el$44.nextSibling;
                  _el$36.style.setProperty("background-image", "url(bg-panel-iceland)");
                  insert(_el$37, createComponent(Show, {
                    get when() {
                      return !isSmallScreen();
                    },
                    get children() {
                      var _el$38 = _tmpl$6(), _el$39 = _el$38.firstChild;
                      insert(_el$39, createComponent(L10n.Compose, {
                        get text() {
                          return model.data.scoreDetails.headerText;
                        }
                      }));
                      return _el$38;
                    }
                  }), _el$44);
                  insert(_el$37, createComponent(HSlot, {
                    "class": "absolute -mt-6 ml-2 w-full victories-point-goal-line",
                    get children() {
                      return [(() => {
                        var _el$40 = _tmpl$19(), _el$41 = _el$40.firstChild;
                        insert(_el$41, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_SCORE_NAME"
                        }));
                        createRenderEffect(() => className(_el$40, `victories-military-cols-1-and-2 font-title uppercase font-bold victories-color-score ${layoutModel.screenWidthDownScaled() < 1784 ? "text-lg" : "text-2xl"}`));
                        return _el$40;
                      })(), _tmpl$20(), _tmpl$21()];
                    }
                  }), _el$44);
                  insert(_el$37, createComponent(VictoryHeader, {
                    "class": "w-full",
                    hideContentColumnDivider: true,
                    get children() {
                      var _el$45 = _tmpl$22(), _el$46 = _el$45.firstChild, _el$47 = _el$46.firstChild;
                      insert(_el$47, createComponent(L10n.Compose, {
                        text: "LOC_VICTORY_SCORE_CONTRIBUTORS"
                      }));
                      return _el$45;
                    }
                  }), _el$48);
                  insert(_el$48, createComponent(ScrollArea, {
                    get ["class"]() {
                      return `victories-scroll-base ${layoutModel.screenHeightDownScaled() < 1e3 ? "w-full" : "victories-econ-cols-1-and-2-and-4"}`;
                    },
                    useProxy: true,
                    get children() {
                      var _el$49 = _tmpl$25();
                      insert(_el$49, createComponent(VSlot, {
                        "class": "relative pointer-events-auto victories-economic-focus transition-opacity duration-150 ease-out flex flex-col victories-econ-col-1-and-2-and-4",
                        lockNavigation: true,
                        get autoFocus() {
                          return !model.tooltipToggle;
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return model.data.scoreDetails.playerDetails;
                            },
                            children: (player, index) => createComponent(VictoryRow, {
                              get rowId() {
                                return index() + 1;
                              },
                              get playerInfo() {
                                return player.playerInfo;
                              },
                              divider: false,
                              get rowType() {
                                return VictoryTabType.Score;
                              },
                              skipContentColumn: true,
                              columnClassOverride: "econ",
                              omitBottomLine: true,
                              activateInfo: (playerId) => {
                                if (ActionHandler.isTouchActive) {
                                  model.focusPlayer(playerId, VictoryTabType.Score);
                                  model.onGamepadInspectButton();
                                }
                              }
                            })
                          });
                        }
                      }), null);
                      insert(_el$49, createComponent(Show, {
                        get when() {
                          return layoutModel.screenHeightDownScaled() < 1e3;
                        },
                        get children() {
                          return [_tmpl$23(), (() => {
                            var _el$51 = _tmpl$24(), _el$52 = _el$51.firstChild, _el$53 = _el$52.firstChild, _el$54 = _el$53.nextSibling, _el$55 = _el$54.nextSibling, _el$56 = _el$55.nextSibling;
                            insert(_el$53, createComponent(L10n.Stylize, {
                              text: "LOC_VICTORIES_RULES_SCORE_HEADER_1"
                            }));
                            insert(_el$54, createComponent(L10n.Stylize, {
                              text: "LOC_VICTORIES_RULES_SCORE_BODY_1"
                            }));
                            insert(_el$55, createComponent(L10n.Stylize, {
                              text: "LOC_VICTORIES_RULES_SCORE_HEADER_2"
                            }));
                            insert(_el$56, createComponent(L10n.Stylize, {
                              text: "LOC_VICTORIES_RULES_SCORE_BODY_2"
                            }));
                            return _el$51;
                          })()];
                        }
                      }), null);
                      return _el$49;
                    }
                  }), null);
                  insert(_el$48, createComponent(Show, {
                    get when() {
                      return layoutModel.screenHeightDownScaled() >= 1e3;
                    },
                    get children() {
                      var _el$57 = _tmpl$24(), _el$58 = _el$57.firstChild, _el$59 = _el$58.firstChild, _el$60 = _el$59.nextSibling, _el$61 = _el$60.nextSibling, _el$62 = _el$61.nextSibling;
                      insert(_el$59, createComponent(L10n.Stylize, {
                        text: "LOC_VICTORIES_RULES_SCORE_HEADER_1"
                      }));
                      insert(_el$60, createComponent(L10n.Stylize, {
                        text: "LOC_VICTORIES_RULES_SCORE_BODY_1"
                      }));
                      insert(_el$61, createComponent(L10n.Stylize, {
                        text: "LOC_VICTORIES_RULES_SCORE_HEADER_2"
                      }));
                      insert(_el$62, createComponent(L10n.Stylize, {
                        text: "LOC_VICTORIES_RULES_SCORE_BODY_2"
                      }));
                      return _el$57;
                    }
                  }), null);
                  return _el$35;
                })()
              })];
            }
          }), createComponent(Show, {
            get when() {
              return props.endGameScreen;
            },
            get children() {
              var _el$4 = _tmpl$2();
              insert(_el$4, createComponent(Button, {
                onActivate: () => {
                  justOneMoreTurn();
                },
                hotkeyAction: "nav-shell-previous",
                navTrayText: "LOC_END_GAME_CONTINUE",
                "class": "mr-8",
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_END_GAME_CONTINUE"
                  });
                }
              }), null);
              insert(_el$4, createComponent(Button, {
                onActivate: () => {
                  engine.call("exitToMainMenu");
                },
                hotkeyAction: "nav-shell-next",
                navTrayText: "LOC_END_GAME_EXIT",
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_END_GAME_EXIT"
                  });
                }
              }), null);
              return _el$4;
            }
          })];
        }
      });
    }
  });
};
const SummaryVictoryCard = (props) => {
  const [panelProps] = splitProps(props, ["rules", "titleText", "titleColor", "hasFocus"]);
  const isOneMoreTurn = Game.AgeProgressManager.isExtendedGame || Game.AgeProgressManager.getMaxAgeProgressionPoints() <= 0;
  const model = useVictoriesScreenContext();
  function onActivate() {
    model.data.defaultTab = model.data.currentTab();
    model.data.defaultTab = props.tabId;
    useAudio("VictoryScreen/SummaryCard")("navigate-tab");
  }
  function onFocus() {
    const panel = model.data.panels.find((p) => p.tabId === props.tabId);
    if (panel) {
      panel.hasFocus = true;
    }
  }
  function onBlur() {
    const panel = model.data.panels.find((p) => p.tabId === props.tabId);
    if (panel) {
      panel.hasFocus = false;
    }
  }
  const titleFontSizeClass = LayoutModel.get().screenWidthDownScaled() < 1784 ? "text-lg" : "text-2xl";
  return createComponent(AudioContextProvider, {
    segment: "SummaryCard",
    get children() {
      return createComponent(Activatable, {
        get ["class"]() {
          return `victories-summary-box pointer-events-auto duration-150 ease-out justify-between font-title text-center text-white text-2xl relative flex flex-col ${props.divider === true ? "victories-summary-divider" : ""} `;
        },
        style: {
          "transition-property": "opacity"
        },
        "data-name": "SummaryVictoryCard",
        get name() {
          return Locale.compose(props.titleText);
        },
        tabIndex: -1,
        onActivate,
        onFocus,
        onBlur,
        get children() {
          return [(() => {
            var _el$63 = _tmpl$18();
            createRenderEffect(() => className(_el$63, `victories-summary-bg pointer-events-auto absolute inset-0 bg-no-repeat bg-cover opacity-40 ${props.summaryBg}`));
            return _el$63;
          })(), (() => {
            var _el$64 = _tmpl$18();
            insert(_el$64, createComponent(VSlot, {
              "class": "w-full",
              get children() {
                return [(() => {
                  var _el$65 = _tmpl$19(), _el$66 = _el$65.firstChild;
                  insert(_el$66, createComponent(L10n.Compose, {
                    get text() {
                      return props.titleText;
                    }
                  }));
                  createRenderEffect(() => className(_el$65, `uppercase font-bold ${titleFontSizeClass} mt-6 ${props.titleColor}`));
                  return _el$65;
                })(), _tmpl$27(), (() => {
                  var _el$68 = _tmpl$18();
                  createRenderEffect(() => className(_el$68, `self-center size-8 -mt-6 ${props.victoryLogo}`));
                  return _el$68;
                })(), (() => {
                  var _el$69 = _tmpl$28(), _el$70 = _el$69.firstChild;
                  insert(_el$70, createComponent(L10n.Compose, {
                    get text() {
                      return props.description;
                    }
                  }));
                  return _el$69;
                })(), createComponent(PointGoalPanel, mergeProps(() => props.goals, panelProps))];
              }
            }), null);
            insert(_el$64, createComponent(Show, {
              get when() {
                return props.dominantPlayer.length == 1 && !isOneMoreTurn;
              },
              get children() {
                return _tmpl$29();
              }
            }), null);
            insert(_el$64, createComponent(Show, {
              when: !isOneMoreTurn,
              get children() {
                return createComponent(For, {
                  get each() {
                    return props.dominantPlayer;
                  },
                  children: (player) => (() => {
                    var _el$72 = _tmpl$30();
                    insert(_el$72, createComponent(DominanceCountdownCard, player));
                    return _el$72;
                  })()
                });
              }
            }), null);
            return _el$64;
          })()];
        }
      });
    }
  });
};
const DominanceCountdownCard = (props) => {
  return (() => {
    var _el$73 = _tmpl$36(), _el$74 = _el$73.firstChild, _el$75 = _el$74.nextSibling, _el$76 = _el$75.nextSibling, _el$77 = _el$76.nextSibling, _el$78 = _el$77.nextSibling;
    _el$74.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$75.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$76.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$77.style.setProperty("background-image", "url(blp:mp_player_detail)");
    insert(_el$78, createComponent(VSlot, {
      "class": "w-full items-center",
      get children() {
        return [(() => {
          var _el$79 = _tmpl$31();
          _el$79.style.setProperty("background-image", "url(blp:cPromo_header)");
          return _el$79;
        })(), _tmpl$32(), (() => {
          var _el$81 = _tmpl$33();
          insert(_el$81, createComponent(L10n.Compose, {
            text: "LOC_VICTORY_PROGRESS_COUNTDOWN"
          }));
          return _el$81;
        })(), (() => {
          var _el$82 = _tmpl$34();
          insert(_el$82, createComponent(L10n.Compose, {
            text: "LOC_VICTORY_PROGRESS_TURNS_REMAINING",
            get args() {
              return [props.turns];
            }
          }));
          return _el$82;
        })(), (() => {
          var _el$83 = _tmpl$35(), _el$84 = _el$83.firstChild;
          insert(_el$83, createComponent(ProgressBar, {
            "class": "relative w-full ",
            get progressPercent() {
              return props.percent;
            }
          }), _el$84);
          insert(_el$84, createComponent(Tooltip.Text, {
            get text() {
              return Locale.stylize(props.name);
            },
            get children() {
              return createComponent(PortraitIcon, {
                get playerId() {
                  return props.id;
                },
                size: 10
              });
            }
          }));
          createRenderEffect((_$p) => (_$p = props.percent.toString() + "%") != null ? _el$84.style.setProperty("left", _$p) : _el$84.style.removeProperty("left"));
          return _el$83;
        })()];
      }
    }));
    createRenderEffect(() => className(_el$73, `relative img-base-ticket-bg-container self-center w-full px-4 min-h-32 mb-5 ${props.id == -1 ? "opacity-0" : ""}`));
    return _el$73;
  })();
};
const PointGoalPanel = (props) => {
  return (() => {
    var _el$85 = _tmpl$40();
    insert(_el$85, createComponent(VSlot, {
      "class": "px-4 w-full",
      disableFocus: true,
      get children() {
        return [(() => {
          var _el$86 = _tmpl$39(), _el$89 = _el$86.firstChild;
          insert(_el$86, createComponent(HSlot, {
            "class": "relative w-full",
            get children() {
              return [createComponent(HSlot, {
                "class": "mt-1 ml-3 h-7",
                get children() {
                  return createComponent(VictoryRulesTooltip, {
                    size: 6,
                    get initialHPosition() {
                      return TooltipHorizontalPosition.AUTO;
                    },
                    get initialVPosition() {
                      return TooltipVerticalPosition.AUTO;
                    },
                    "class": "self-center mr-2 opacity-100",
                    get tooltipText() {
                      return props.rules;
                    },
                    get titleText() {
                      return props.titleText;
                    },
                    get titleClass() {
                      return props.titleColor;
                    },
                    get disableFocus() {
                      return !props.hasFocus;
                    }
                  });
                }
              }), createComponent(HSlot, {
                "class": "self-center flex-1 justify-between mx-2",
                get children() {
                  return [(() => {
                    var _el$87 = _tmpl$37();
                    insert(_el$87, createComponent(L10n.Compose, {
                      text: "LOC_VICTORY_PROGRESS_POINT_GOAL"
                    }));
                    return _el$87;
                  })(), createComponent(Show, {
                    get when() {
                      return props.pointGoal != -1;
                    },
                    get fallback() {
                      return (() => {
                        var _el$90 = _tmpl$41();
                        insert(_el$90, createComponent(Tooltip.Text, {
                          get text() {
                            return Locale.stylize("LOC_VICTORY_NOVICTORIES_TOOLTIP");
                          },
                          children: "-"
                        }));
                        return _el$90;
                      })();
                    },
                    get children() {
                      var _el$88 = _tmpl$38();
                      insert(_el$88, () => Locale.toNumber(props.pointGoal));
                      return _el$88;
                    }
                  })];
                }
              })];
            }
          }), _el$89);
          return _el$86;
        })(), createComponent(For, {
          get each() {
            return props.leaderBoard;
          },
          children: (leader, index) => (() => {
            var _el$91 = _tmpl$39(), _el$103 = _el$91.firstChild;
            insert(_el$91, createComponent(Show, {
              get when() {
                return index() == 3;
              },
              get children() {
                return createComponent(HSlot, {
                  "class": "victories-point-goal-line w-full justify-center mx-4",
                  get children() {
                    return _tmpl$42();
                  }
                });
              }
            }), _el$103);
            insert(_el$91, createComponent(HSlot, {
              "class": "relative w-full",
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return leader.winner;
                  },
                  get children() {
                    var _el$93 = _tmpl$43();
                    _el$93.style.setProperty("background-image", "url(blp:victories_gold_banner)");
                    return _el$93;
                  }
                }), createComponent(HSlot, {
                  "class": "justify-between h-14 my-1 w-full",
                  get children() {
                    return createComponent(HSlot, {
                      "class": "w-full",
                      get children() {
                        return [(() => {
                          var _el$94 = _tmpl$44();
                          insert(_el$94, createComponent(PortraitIcon, {
                            get playerId() {
                              return leader.hasMet ? leader.id : PlayerIds.NO_PLAYER;
                            },
                            size: 12
                          }));
                          return _el$94;
                        })(), createComponent(HSlot, {
                          "class": "flex-1 justify-between",
                          get children() {
                            return [createComponent(VSlot, {
                              "class": "self-center",
                              get children() {
                                return [createComponent(HSlot, {
                                  get ["class"]() {
                                    return `victories-name-field font-body text-2xs self-center -ml-2 flex-wrap ${leader.winner || leader.id == GameContext.localPlayerID ? "" : " opacity-60"}`;
                                  },
                                  role: "heading",
                                  get children() {
                                    return [(() => {
                                      var _el$95 = _tmpl$45(), _el$96 = _el$95.firstChild;
                                      insert(_el$95, () => leader.place, _el$96);
                                      return _el$95;
                                    })(), createComponent(L10n.Compose, {
                                      get text() {
                                        return leader.id == GameContext.localPlayerID ? "LOC_VICTORY_LEADER_NAME_YOU" : "LOC_VICTORY_LEADER_NAME";
                                      },
                                      get args() {
                                        return [leader.hasMet ? leader.name : "LOC_UI_UNMET_PLAYER_NAME"];
                                      }
                                    })];
                                  }
                                }), createComponent(Show, {
                                  get when() {
                                    return leader.dominant == true || leader.turnsProgress > 0;
                                  },
                                  get children() {
                                    return createComponent(HSlot, {
                                      "class": "font-body text-xs self-start ml-2",
                                      role: "heading",
                                      get children() {
                                        return [(() => {
                                          var _el$97 = _tmpl$46(), _el$98 = _el$97.firstChild, _el$99 = _el$98.firstChild;
                                          insert(_el$98, () => leader.turnsProgress, _el$99);
                                          insert(_el$98, () => leader.turnsTotal, null);
                                          createRenderEffect(() => className(_el$97, `flex flex-col self-center ${leader.id == GameContext.localPlayerID ? "" : " opacity-60"}`));
                                          return _el$97;
                                        })(), _tmpl$47()];
                                      }
                                    });
                                  }
                                })];
                              }
                            }), (() => {
                              var _el$101 = _tmpl$48();
                              insert(_el$101, () => Locale.toNumber(leader.points));
                              createRenderEffect(() => className(_el$101, `font-body text-2xs self-center mr-2 ${leader.id == GameContext.localPlayerID ? "" : "opacity-60"}`));
                              return _el$101;
                            })()];
                          }
                        })];
                      }
                    });
                  }
                }), createComponent(Show, {
                  get when() {
                    return leader.winner;
                  },
                  get children() {
                    var _el$102 = _tmpl$49();
                    _el$102.style.setProperty("background-image", "url(blp:victories_gold_lines)");
                    return _el$102;
                  }
                })];
              }
            }), _el$103);
            return _el$91;
          })()
        })];
      }
    }));
    createRenderEffect(() => className(_el$85, `${props.class}`));
    return _el$85;
  })();
};
const MilitaryTooltip = (props) => {
  const [local, _other] = splitProps(props, ["children"]);
  return createComponent(Tooltip, {
    get initialHPosition() {
      return TooltipHorizontalPosition.RIGHT;
    },
    get initialVPosition() {
      return TooltipVerticalPosition.CENTER;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              var _el$104 = _tmpl$52(), _el$105 = _el$104.firstChild;
              insert(_el$105, createComponent(L10n.Compose, {
                get text() {
                  return props.hasMet ? props.name : "LOC_LEADER_UNMET_NAME";
                }
              }));
              insert(_el$104, createComponent(CardFrame, {
                "class": "mb-4",
                get children() {
                  return createComponent(For, {
                    get each() {
                      return props.breakdown;
                    },
                    children: (breakdown) => createComponent(HSlot, {
                      "class": "mx-3 my-2 justify-between font-body text-sm text-white ml-4",
                      get children() {
                        return [(() => {
                          var _el$108 = _tmpl$18();
                          insert(_el$108, createComponent(L10n.Compose, {
                            get text() {
                              return breakdown.name;
                            }
                          }));
                          return _el$108;
                        })(), (() => {
                          var _el$109 = _tmpl$53();
                          insert(_el$109, () => Locale.toNumber(breakdown.points));
                          return _el$109;
                        })()];
                      }
                    })
                  });
                }
              }), null);
              insert(_el$104, createComponent(Show, {
                get when() {
                  return props.breakdown.length > 1;
                },
                get children() {
                  return createComponent(CardFrame, {
                    get children() {
                      return createComponent(HSlot, {
                        "class": "mx-3 my-2 justify-between",
                        get children() {
                          return [(() => {
                            var _el$106 = _tmpl$50();
                            insert(_el$106, createComponent(L10n.Compose, {
                              text: "LOC_VICTORIES_TOOLTIP_TOTAL"
                            }));
                            return _el$106;
                          })(), (() => {
                            var _el$107 = _tmpl$51();
                            insert(_el$107, () => Locale.toNumber(props.points));
                            return _el$107;
                          })()];
                        }
                      });
                    }
                  });
                }
              }), null);
              return _el$104;
            }
          });
        }
      })];
    }
  });
};
const VictoryTooltip = (props) => {
  const [local, _other] = splitProps(props, ["children", "class"]);
  return createComponent(Tooltip, {
    get initialHPosition() {
      return TooltipHorizontalPosition.RIGHT;
    },
    get initialVPosition() {
      return TooltipVerticalPosition.CENTER;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get ["class"]() {
          return local.class;
        },
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              var _el$110 = _tmpl$56(), _el$111 = _el$110.firstChild;
              insert(_el$111, createComponent(L10n.Compose, {
                text: "LOC_VICTORY_TOOLTIP_TITLE"
              }));
              insert(_el$110, createComponent(CardFrame, {
                "class": "mb-4",
                get children() {
                  return [(() => {
                    var _el$112 = _tmpl$54();
                    insert(_el$112, createComponent(L10n.Compose, {
                      get text() {
                        return props.descTitle;
                      }
                    }));
                    return _el$112;
                  })(), (() => {
                    var _el$113 = _tmpl$55();
                    insert(_el$113, createComponent(L10n.Compose, {
                      get text() {
                        return props.description;
                      }
                    }));
                    return _el$113;
                  })()];
                }
              }), null);
              insert(_el$110, createComponent(Show, {
                get when() {
                  return props.currentVictoryPercent != -1;
                },
                get children() {
                  return createComponent(CardFrame, {
                    "class": "mb-4",
                    get children() {
                      return [(() => {
                        var _el$114 = _tmpl$54();
                        insert(_el$114, createComponent(L10n.Compose, {
                          get text() {
                            return props.currentVictoryName;
                          }
                        }));
                        return _el$114;
                      })(), (() => {
                        var _el$115 = _tmpl$55();
                        insert(_el$115, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_REQUIREMENTS",
                          get args() {
                            return [props.currentVictoryMult, props.currentVictoryPercent];
                          }
                        }));
                        return _el$115;
                      })()];
                    }
                  });
                }
              }), null);
              insert(_el$110, createComponent(Show, {
                get when() {
                  return props.nextVictoryPercent != -1;
                },
                get children() {
                  return createComponent(CardFrame, {
                    "class": "mb-4",
                    get children() {
                      return [(() => {
                        var _el$116 = _tmpl$54();
                        insert(_el$116, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_NEXT",
                          get args() {
                            return [props.nextVictoryName];
                          }
                        }));
                        return _el$116;
                      })(), (() => {
                        var _el$117 = _tmpl$55();
                        insert(_el$117, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_REQUIREMENTS",
                          get args() {
                            return [props.nextVictoryMult, props.nextVictoryPercent];
                          }
                        }));
                        return _el$117;
                      })()];
                    }
                  });
                }
              }), null);
              return _el$110;
            }
          });
        }
      })];
    }
  });
};
const VictoriesScreen = ComponentRegistry.register({
  name: "VictoriesScreen",
  styles: [style],
  createInstance: VictoriesScreenComponent
});
defineLegacyComponent("screen-victory-progress", {
  classNames: ["fullscreen"],
  attrs: {
    endGameScreen: "false",
    activeTabId: ""
  }
}, (attrs) => {
  Input.setActiveContext(InputContext.Shell);
  const endGameFlag = attrs["endGameScreen"] == "true" ? true : false;
  const activeTabeId = attrs["activeTabId"] || "";
  return createComponent(VictoriesScreen, {
    endGameScreen: endGameFlag,
    activeTabId: () => activeTabeId
  });
});

export { MilitaryTooltip, VictoriesScreen, VictoryTooltip };
//# sourceMappingURL=victories-screen.js.map
