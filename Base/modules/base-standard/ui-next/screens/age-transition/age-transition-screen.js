import '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createComponent } from '../../../../core/vendor/solid-js/dist/solid.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { Popup } from '../../../../core/ui-next/components/popup.js';
import { ScreenFlowTab } from '../../../../core/ui-next/components/screen-flow.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { NestedTooltipContext } from '../../../../core/ui-next/components/tooltip-compat.js';
import { AgeSelectModel, AgeSelectModelContext } from '../../../../core/ui-next/screens/create-game/age-select-model.js';
import { CivDetails } from '../../../../core/ui-next/screens/create-game/civ-details.js';
import { CivSelectModel, CivSelectModelContext } from '../../../../core/ui-next/screens/create-game/civ-select-model.js';
import { CivSelectScreen } from '../../../../core/ui-next/screens/create-game/civ-select-screen.js';
import { GameSetupModel, GameSetupModelContext } from '../../../../core/ui-next/screens/create-game/create-game-setup-model.js';
import { LeaderSelectModel, LeaderSelectModelContext } from '../../../../core/ui-next/screens/create-game/leader-select-model.js';
import { MementoSelectModel, MementoSelectModelContext } from '../../../../core/ui-next/screens/create-game/memento-select-model.js';
import { MementoSelect } from '../../../../core/ui-next/screens/create-game/memento-select.js';
import { RecommendedChoiceModel, RecommendedChoiceModelContext } from '../../../../core/ui-next/screens/create-game/recommended-choice-model.js';
import { TotModel, TotModelContext } from '../../../../core/ui-next/screens/create-game/tot-model.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { AgeTransitionCivChoiceScreen } from './civ-choice-screen.js';

const ageTransitionStatic = {
  lastScreen: void 0,
  viewCiv: void 0
};
const AgeTransitionScreenComponent = (props) => {
  const ageSelectModel = AgeSelectModel.get();
  const civSelectModel = CivSelectModel.get();
  const leaderSelectModel = LeaderSelectModel.get();
  const gameSetupModel = GameSetupModel.get();
  const totModel = TotModel.get();
  const mementoModel = MementoSelectModel.get();
  const choiceModel = RecommendedChoiceModel.get();
  const audioTrigger = useAudio("AgeTransitionPopup");
  const [popupContext, setPopupContext] = createSignal();
  let flowContextRef;
  function closeScreen(screen) {
    ageTransitionStatic.lastScreen = screen;
    ageTransitionStatic.viewCiv = civSelectModel.viewCiv();
    InterfaceMode.switchToDefault();
  }
  function handleCancelInput() {
    if (popupContext()?.active()) {
      popupContext()?.close();
    } else {
      flowContextRef?.activatePrev();
    }
  }
  function doCompleteChoices(screen) {
    sendFinishedMakingAgeTransitionChoices();
    closeScreen(screen);
  }
  function sendFinishedMakingAgeTransitionChoices() {
    const args = {
      Finished: true
    };
    const result = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.SET_AGE_TRANSITION_DATA, args, false);
    if (result.Success) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.SET_AGE_TRANSITION_DATA, args);
    }
    return result.Success;
  }
  onMount(() => {
    if (ageTransitionStatic.lastScreen == "civ-details") {
      civSelectModel.setViewCiv(ageTransitionStatic.viewCiv);
    }
    audioTrigger("popup-open");
  });
  onCleanup(() => {
    audioTrigger("popup-close");
  });
  return createComponent(Panel, {
    id: "age-transition-screen",
    name: "age-transition-screen",
    "class": "fullscreen",
    onCancelInput: () => {
      handleCancelInput();
    },
    get children() {
      return createComponent(GameSetupModelContext.Provider, {
        value: gameSetupModel,
        get children() {
          return createComponent(AgeSelectModelContext.Provider, {
            value: ageSelectModel,
            get children() {
              return createComponent(CivSelectModelContext.Provider, {
                value: civSelectModel,
                get children() {
                  return createComponent(LeaderSelectModelContext.Provider, {
                    value: leaderSelectModel,
                    get children() {
                      return createComponent(TotModelContext.Provider, {
                        value: totModel,
                        get children() {
                          return createComponent(MementoSelectModelContext.Provider, {
                            value: mementoModel,
                            get children() {
                              return createComponent(NestedTooltipContext.Provider, {
                                value: {
                                  disabled: true
                                },
                                get children() {
                                  return createComponent(RecommendedChoiceModelContext.Provider, {
                                    value: choiceModel,
                                    get children() {
                                      return createComponent(Popup, {
                                        setPopupContext,
                                        get children() {
                                          return [createComponent(ScreenFlowTab, {
                                            "class": "fullscreen",
                                            get defaultTab() {
                                              return ageTransitionStatic.lastScreen ?? props.screens[0].name;
                                            },
                                            get screens() {
                                              return props.screens;
                                            },
                                            onClose: (screen) => closeScreen(screen),
                                            onStart: (screen) => doCompleteChoices(screen),
                                            contextRef: (ref) => {
                                              flowContextRef = ref;
                                            },
                                            get children() {
                                              return [createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                                                name: "civ-choice",
                                                title: () => null,
                                                body: () => createComponent(AgeTransitionCivChoiceScreen, {})
                                              }), createComponent(Tab.Item, {
                                                name: "civ-select",
                                                title: () => null,
                                                body: () => createComponent(CivSelectScreen, {})
                                              }), createComponent(Tab.Item, {
                                                name: "civ-details",
                                                title: () => null,
                                                body: () => createComponent(CivDetails, {})
                                              }), createComponent(Tab.Item, {
                                                name: "memento-select",
                                                title: () => null,
                                                body: () => createComponent(MementoSelect, {})
                                              })];
                                            }
                                          }), createComponent(Popup.Output, {
                                            "class": "fullscreen child-fullscreen"
                                          })];
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};
const AgeTransitionScreen = ComponentRegistry.register({
  name: "AgeTransitionScreen",
  createInstance: AgeTransitionScreenComponent
});
engine.whenReady.then(() => {
  engine.on("BeforeAgeTransition", () => {
    WorldUI.pushGaussianBlurFilter(5);
    engine.call("setSnapshotEnabled", true);
  });
  engine.on("LocalPlayerChanged", () => {
    ageTransitionStatic.lastScreen = void 0;
    ageTransitionStatic.viewCiv = void 0;
  });
});

export { AgeTransitionScreen, AgeTransitionScreenComponent };
//# sourceMappingURL=age-transition-screen.js.map
