import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show, createSignal } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../../ui/context-manager/context-manager.js';
import { GameCreatorClosedEvent, StartCampaignEvent } from '../../../ui/events/shell-events.js';
import { defineLegacyComponent } from '../../components/fxs-solid-component.js';
import { Panel } from '../../components/panel.js';
import { Popup } from '../../components/popup.js';
import { useScreenFlowContext, ScreenFlowTab, ScreenFlowStepType } from '../../components/screen-flow.js';
import { Tab } from '../../components/tab.js';
import { NestedTooltipContext } from '../../components/tooltip-compat.js';
import { AdvancedOptionsScreen } from './advanced-options.js';
import { AgeSelectModel, AgeSelectModelContext } from './age-select-model.js';
import { AgeSelectPopup } from './age-select-popup.js';
import { CivDetails } from './civ-details.js';
import { CivSelectModel, CivSelectModelContext } from './civ-select-model.js';
import { CivSelectScreen } from './civ-select-screen.js';
import { CreateGameHub } from './create-game-hub.js';
import { GameSetupModel, GameSetupModelContext } from './create-game-setup-model.js';
import { CreateGameSetup } from './create-game-setup.js';
import { LeaderPedestalBanner3d } from './leader-banner-3d.js';
import { LeaderSelectModel, LeaderSelectModelContext } from './leader-select-model.js';
import { LeaderSelectScreen } from './leader-select-screen.js';
import { MapSelect } from './map-select.js';
import { MementoSelectModel, MementoSelectModelContext } from './memento-select-model.js';
import { MementoSelect } from './memento-select.js';
import { RecommendedChoiceModel, RecommendedChoiceModelContext } from './recommended-choice-model.js';
import { TotModel, TotModelContext } from './tot-model.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { LayoutModel } from '../../utilities/layout-utilities.js';

const PersistentPedestalBanner = () => {
  const flow = useScreenFlowContext();
  const layout = LayoutModel.get();
  const visible = createMemo(() => {
    const active = flow.active()?.name;
    if (active === "create-game-hub") return true;
    if (active === "game-setup") return !(layout.screenHeight() <= 1e3 && layout.screenWidth() < 1600);
    return false;
  });
  return createComponent(Show, {
    get when() {
      return visible();
    },
    get children() {
      return createComponent(LeaderPedestalBanner3d, {});
    }
  });
};
const CreateGameScreenComponent = (props) => {
  const ageSelectModel = AgeSelectModel.get();
  const civSelectModel = CivSelectModel.get();
  const leaderSelectModel = LeaderSelectModel.get();
  const gameSetupModel = GameSetupModel.get();
  const totModel = TotModel.get();
  const mementoModel = MementoSelectModel.get();
  const choiceModel = RecommendedChoiceModel.get();
  const [popupContext, setPopupContext] = createSignal();
  let flowContextRef;
  function closeScreen() {
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new GameCreatorClosedEvent());
  }
  function handleCancelInput() {
    if (popupContext()?.active()) {
      popupContext()?.close();
    } else {
      if (flowContextRef?.active()?.name == "create-game-hub") {
        flowContextRef?.clearHub();
      }
      if (flowContextRef?.active()?.name == "game-setup" && civSelectModel.selectedCiv().civID == "RANDOM") {
        flowContextRef?.activate("civ-select");
      } else {
        flowContextRef?.activatePrev();
      }
    }
    useAudio("CreateGameBackButton")("activate");
  }
  function launchGame() {
    window.dispatchEvent(new StartCampaignEvent());
    engine.call("startGame");
  }
  return createComponent(Panel, {
    id: "create-game",
    name: "create-game",
    "class": "fullscreen",
    onCancelInput: handleCancelInput,
    get children() {
      return createComponent(NestedTooltipContext.Provider, {
        value: {
          disabled: true
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
                                  return createComponent(RecommendedChoiceModelContext.Provider, {
                                    value: choiceModel,
                                    get children() {
                                      return createComponent(Popup, {
                                        setPopupContext,
                                        get children() {
                                          return [createComponent(ScreenFlowTab, {
                                            "class": "fullscreen",
                                            get defaultTab() {
                                              return props.screenFlow[0].name;
                                            },
                                            get screens() {
                                              return props.screenFlow;
                                            },
                                            onClose: closeScreen,
                                            onStart: launchGame,
                                            contextRef: (ref) => {
                                              flowContextRef = ref;
                                            },
                                            get children() {
                                              return [createComponent(Tab.Output, {}), createComponent(PersistentPedestalBanner, {}), createComponent(Tab.Item, {
                                                name: "create-game-hub",
                                                title: () => null,
                                                body: () => createComponent(CreateGameHub, {})
                                              }), createComponent(Tab.Item, {
                                                name: "game-setup",
                                                title: () => null,
                                                body: () => createComponent(CreateGameSetup, {})
                                              }), createComponent(Tab.Item, {
                                                name: "civ-select",
                                                title: () => null,
                                                body: () => createComponent(CivSelectScreen, {})
                                              }), createComponent(Tab.Item, {
                                                name: "civ-details",
                                                title: () => null,
                                                body: () => createComponent(CivDetails, {})
                                              }), createComponent(Tab.Item, {
                                                name: "leader-select",
                                                title: () => null,
                                                body: () => createComponent(LeaderSelectScreen, {})
                                              }), createComponent(Tab.Item, {
                                                name: "memento-select",
                                                title: () => null,
                                                body: () => createComponent(MementoSelect, {})
                                              }), createComponent(Popup.Item, {
                                                name: "age-select",
                                                get children() {
                                                  return createComponent(AgeSelectPopup, {});
                                                }
                                              }), createComponent(Popup.Item, {
                                                name: "advanced-options",
                                                get children() {
                                                  return createComponent(AdvancedOptionsScreen, {});
                                                }
                                              }), createComponent(Popup.Item, {
                                                name: "map-select",
                                                get children() {
                                                  return createComponent(MapSelect, {});
                                                }
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
const CreateGameScreen = ComponentRegistry.register("create-game-screen", CreateGameScreenComponent);
defineLegacyComponent("create-game-sp", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(CreateGameScreen, {
    get screenFlow() {
      return [{
        name: "leader-select",
        step: "leader-select",
        type: ScreenFlowStepType.Start
      }, {
        name: "civ-select",
        step: "civ-select"
      }, {
        name: "civ-details",
        step: "civ-select"
      }, {
        name: "game-setup",
        step: "game-setup"
      }, {
        name: "create-game-hub",
        type: ScreenFlowStepType.Hub
      }, {
        name: "memento-select"
      }];
    }
  });
});

export { CreateGameScreen };
//# sourceMappingURL=create-game-screen.js.map
