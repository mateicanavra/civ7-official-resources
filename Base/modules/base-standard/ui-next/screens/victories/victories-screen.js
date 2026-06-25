import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { untrack, createMemo, onMount, onCleanup, createComponent, createRenderEffect, mergeProps, Show, splitProps, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { DisplayQueueManager } from '../../../../core/ui/context-manager/display-queue-manager.js';
import { InputEngineEventName, NavigateInputEventName } from '../../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { useIsSmallScreen, LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import TutorialManager from '../../../ui/tutorial/tutorial-manager.js';
import { ScreenFrame } from '../../components/screen-frame.js';
import { CultureVictoryTab } from './culture-victory-tab.js';
import { EconomicVictoryTab } from './economic-victory-tab.js';
import { MilitaryVictoryTab } from './military-victory-tab.js';
import { ScienceVictoryTab } from './science-victory-tab.js';
import { ScoreVictoryTab } from './score-victory-tab.js';
import { VictoriesSummary } from './summary-victory-tab.js';
import { createVictoriesScreenModel, VictoriesScreenContext } from './victories-screen-model.js';
import style from './victories-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="absolute inset-0 bottom-0 filigree-inner-frame-top"></div><div class="absolute inset-0 bottom-0 filigree-inner-frame-bottom"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute bottom-10 right-10 flex flow-row"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="font-title-sm uppercase fxs-header"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="ml-12 font-body text-sm text-white"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=items-center><div class="font-title-base fxs-header uppercase self-center mb-4"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class=ml-8></div>`);
const VictoriesScreenComponent = (props) => {
  const isSmallScreen = useIsSmallScreen();
  const endGameScreen = untrack(() => props.endGameScreen);
  const allowOneMoreTurn = untrack(() => props.allowOneMoreTurn);
  const showNextTurnButton = untrack(() => props.showNextTurnButton);
  const model = createVictoriesScreenModel(endGameScreen, allowOneMoreTurn, showNextTurnButton);
  const defaultTab = createMemo(() => {
    return props.activeTabId?.() ?? void 0;
  });
  const audio = useAudio("VictoryScreen");
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
        case "shell-action-3":
          if (!TutorialManager.isShowing()) {
            model.onGamepadInfoButton();
          }
          break;
        case "sys-menu":
        case "accept":
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
  const advanceToNextPlayer = () => {
    GameContext.sendTurnComplete();
    DisplayQueueManager.closeMatching("EndgameScreen");
    InterfaceMode.switchToDefault();
  };
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
              return createMemo(() => !!defaultTab())() ? defaultTab() : model.data.defaultTab;
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
                body: () => createComponent(VictoriesSummary, {})
              }), createComponent(Tab.Item, {
                name: "cultural",
                title: () => "LOC_VICTORY_CULTURE_MODERN_NAME",
                body: () => createComponent(CultureVictoryTab, mergeProps(() => model.data.cultureDetails))
              }), createComponent(Tab.Item, {
                name: "economic",
                title: () => "LOC_VICTORY_ECONOMIC_MODERN_NAME",
                body: () => createComponent(EconomicVictoryTab, {})
              }), createComponent(Tab.Item, {
                name: "military",
                title: () => "LOC_VICTORY_MILITARY_MODERN_NAME",
                body: () => createComponent(MilitaryVictoryTab, {})
              }), createComponent(Tab.Item, {
                name: "scientific",
                title: () => "LOC_VICTORY_SCIENCE_MODERN_NAME",
                body: () => createComponent(ScienceVictoryTab, mergeProps(() => model.data.scienceDetails))
              }), createComponent(Tab.Item, {
                name: "score",
                title: () => "LOC_VICTORY_SCORE_NAME",
                body: () => createComponent(ScoreVictoryTab, {})
              })];
            }
          }), createComponent(Show, {
            get when() {
              return props.endGameScreen;
            },
            get children() {
              var _el$4 = _tmpl$2();
              insert(_el$4, createComponent(Show, {
                get when() {
                  return props.allowOneMoreTurn;
                },
                get children() {
                  return createComponent(Button, {
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
                  });
                }
              }), null);
              insert(_el$4, createComponent(Show, {
                get when() {
                  return !props.showNextTurnButton;
                },
                get children() {
                  return createComponent(Button, {
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
                  });
                }
              }), null);
              insert(_el$4, createComponent(Show, {
                get when() {
                  return props.showNextTurnButton;
                },
                get children() {
                  return createComponent(Button, {
                    onActivate: () => {
                      advanceToNextPlayer();
                    },
                    hotkeyAction: "nav-shell-next",
                    navTrayText: "LOC_ACTION_PANEL_NEXT_TURN",
                    get children() {
                      return createComponent(L10n.Compose, {
                        text: "LOC_ACTION_PANEL_NEXT_TURN"
                      });
                    }
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
              var _el$5 = _tmpl$5(), _el$6 = _el$5.firstChild;
              insert(_el$6, createComponent(L10n.Compose, {
                get text() {
                  return props.hasMet ? props.name : "LOC_LEADER_UNMET_NAME";
                }
              }));
              insert(_el$5, createComponent(CardFrame, {
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
                          var _el$9 = _tmpl$6();
                          insert(_el$9, createComponent(L10n.Compose, {
                            get text() {
                              return breakdown.name;
                            }
                          }));
                          return _el$9;
                        })(), (() => {
                          var _el$10 = _tmpl$7();
                          insert(_el$10, () => Locale.toNumber(breakdown.points));
                          return _el$10;
                        })()];
                      }
                    })
                  });
                }
              }), null);
              insert(_el$5, createComponent(Show, {
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
                            var _el$7 = _tmpl$3();
                            insert(_el$7, createComponent(L10n.Compose, {
                              text: "LOC_VICTORIES_TOOLTIP_TOTAL"
                            }));
                            return _el$7;
                          })(), (() => {
                            var _el$8 = _tmpl$4();
                            insert(_el$8, () => Locale.toNumber(props.points));
                            return _el$8;
                          })()];
                        }
                      });
                    }
                  });
                }
              }), null);
              return _el$5;
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
    activeTabId: "",
    allowOneMoreTurn: "true",
    showNextTurnButton: "false"
  }
}, (attrs) => {
  Input.setActiveContext(InputContext.Shell);
  const endGameFlag = attrs["endGameScreen"] == "true" ? true : false;
  const activeTabeId = attrs["activeTabId"] || "";
  const allowOneMoreTurn = attrs["allowOneMoreTurn"] == "true" ? true : false;
  const showNextTurnButton = attrs["showNextTurnButton"] == "true" ? true : false;
  return createComponent(VictoriesScreen, {
    endGameScreen: endGameFlag,
    allowOneMoreTurn,
    showNextTurnButton,
    activeTabId: () => activeTabeId
  });
});

export { MilitaryTooltip, VictoriesScreen };
//# sourceMappingURL=victories-screen.js.map
