import { template, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, createMemo, onMount, Show, createRenderEffect, For } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../../ui/context-manager/context-manager.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { getRewardType, UnlockableRewardType } from '../../../ui/utilities/utilities-liveops.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { ForWithSeparator } from '../../components/for-with-separator.js';
import { Header } from '../../components/header.js';
import { HeroButton2 } from '../../components/hero-button.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { Popup } from '../../components/popup.js';
import { RingMeter } from '../../components/ring-meter.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { SpatialSlot } from '../../components/slot.js';
import { Tab } from '../../components/tab.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../components/tooltip.js';
import { useAgeSelectModelContext } from './age-select-model.js';
import { AttributeIcon } from './attribute-icon.js';
import { TraditionItem } from './civ-details.js';
import { useCivSelectModelContext } from './civ-select-model.js';
import { useGameSetupModelContext } from './create-game-setup-model.js';
import { CreateGameStage, CreateGameStageHeader } from './create-game-stage.js';
import { useLeaderSelectModelContext } from './leader-select-model.js';
import { useMementoSelectModelContext } from './memento-select-model.js';
import { useRecommendedChoiceModelContext } from './recommended-choice-model.js';
import { TicketBox } from './ticket-box.js';
import { useAudio } from '../../services/audio-support.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import style from './create-game-hub.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title absolute inset-0"data-name=layout-center></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=h-19 data-name=layout-footer></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute inset-0"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 create-game-hub-random-silhouette"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="font-body create-game-hub-leader-level flex items-center justify-center font-white"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="create-game-hub-leader-level-bg relative flex items-center justify-center mb-9"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col items-center justify-end"><div class="absolute inset-0 -top-0\\.5 img-unit-panelbox pointer-events-none"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex-auto p-3 img-base-ticket-bg"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto ml-5"><div class="text-base font-title uppercase text-tertiary-1 mb-2"></div><div class="text-accent-5 text-sm"></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex flex-col relative justify-center items-center"><div class="uppercase text-tertiary-1 font-title uppercase"></div><div class="flex flex-row flex-wrap items-center justify-start self-start gap-2 my-2"></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center"><div class="text-tertiary-1 font-title flex flex-row uppercase">:</div><div class="text-accent-2 ml-1 flex flex-row uppercase"></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="img-tag-locked absolute left-0 top-5 flex flex-row items-start justify-start"><div class="img-lock2 size-8 mt-0\\.5 ml-0\\.5"></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-col items-center justify-center"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="bg-primary-2 w-full -mr-2 h-0\\.5"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto ml-2"><div class="uppercase text-accent-5 font-title text-base mb-2"></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div><div class="uppercase font-body text-accent-2 text-sm mb-1"></div><div class=relative><div class="absolute bottom-0\\.5 w-full px-0\\.5 flex justify-between"></div></div><div class="flex flex-row items-center justify-center create-game-hub-trait-icon-container"></div></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-start"><div class="create-game-civ-card-icon flex items-center justify-center gap-2"></div><div class="uppercase text-sm"></div></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="flex items-center justify-center size-12 ml-0\\.5"></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col items-center justify-end"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0 bg-cover"></div><div class="absolute inset-0"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="absolute bottom-0\\.5 w-full px-0\\.5 flex justify-between"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center"><div class="uppercase text-tertiary-1 font-title uppercase"></div></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap items-center justify-start gap-2 my-2"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center"><div class="text-base font-title uppercase text-tertiary-1 mb-2"></div></div>`), _tmpl$23 = /* @__PURE__ */ template(`<div><div class="uppercase font-body text-accent-2 text-sm mb-1"></div><div class="flex flex-row items-center justify-center create-game-hub-trait-icon-container"></div></div>`), _tmpl$24 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-start self-center"><div class="create-game-civ-card-icon flex items-center justify-center gap-2"></div><div class="uppercase text-sm"></div></div>`), _tmpl$25 = /* @__PURE__ */ template(`<div class="civ-details-card-divider-h mb-2 -ml-2 -mr-4 relative"></div>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-col items-center justify-end"><div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div><div class="absolute inset-0"></div><div class="create-game-hub-bottom-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div><div class="flex items-center justify-center size-36 relative mb-10"></div></div>`), _tmpl$27 = /* @__PURE__ */ template(`<div><div class="uppercase font-body text-accent-2 text-sm mb-1"></div></div>`), _tmpl$28 = /* @__PURE__ */ template(`<div><div class="uppercase font-body text-accent-2 text-sm mb-1 mx-2"></div><div class="flex flex-row justify-between"></div></div>`), _tmpl$29 = /* @__PURE__ */ template(`<div class="flex items-center justify-center p-1 img-unit-panelbox relative create-game-hub-memento-box"><div class="flex absolute inset-0 create-game-hub-memento-filigree"></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$30 = /* @__PURE__ */ template(`<div class="flex flex-col mx-2 mb-2"></div>`), _tmpl$31 = /* @__PURE__ */ template(`<div class="flex items-center justify-center m-2 p-1 img-unit-panelbox relative create-game-hub-setup-box"><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$32 = /* @__PURE__ */ template(`<div class="flex items-center justify-center m-2 p-1 img-unit-panelbox relative create-game-hub-save-load-box"><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$33 = /* @__PURE__ */ template(`<div><div class="uppercase font-body text-accent-2 text-sm mb-1 ml-2"></div><div class="flex flex-row -mb-0\\.5"><div class="flex flex-col"></div></div></div>`), _tmpl$34 = /* @__PURE__ */ template(`<div class="flex flex-col items-center"><div class=create-game-hub-divider-line></div><div class="flex-auto flex flex-row justify-around items-start create-game-hub-overview"><div class="flex-auto flex flex-col w-fit mr-14 max-w-52"><div class="flex flex-row font-body text-accent-2 text-sm"></div><div class="uppercase font-title font-black text-tertiary-1"></div></div><div class="flex-auto flex flex-col w-fit mr-14 max-w-52"><div class="flex flex-row font-body text-accent-2 text-sm"></div><div class="uppercase font-title font-black text-tertiary-1"></div></div><div class="flex-auto flex flex-row"><div class="flex-auto flex flex-col w-fit mr-14 max-w-52"><div class="flex flex-row font-body text-accent-2 text-sm"></div><div class="uppercase font-title font-black text-tertiary-1 font-fit-shrink"></div></div></div><div class="flex-auto flex flex-col w-fit mr-14 max-w-52"><div class="flex flex-row font-body text-accent-2 text-sm"></div><div class="uppercase font-title font-black text-tertiary-1"></div></div><div class="flex-auto flex flex-col w-fit max-w-52"><div class="flex flex-row font-body text-accent-2 text-sm"></div><div class="uppercase font-title font-black text-tertiary-1"></div></div></div><div class=create-game-hub-divider-line></div></div>`), _tmpl$35 = /* @__PURE__ */ template(`<div class="create-game-hub-divider-half-line w-full my-5"></div>`), _tmpl$36 = /* @__PURE__ */ template(`<div class="flex flex-col relative"><div class=relative><div class=h-20></div></div></div>`), _tmpl$37 = /* @__PURE__ */ template(`<div class="flex flex-row"><div></div><div class="flex flex-col w-fit"><div class="create-game-hub-divider-line top-line relative"></div><div class="flex flex-row"><div class="flex flex-col ml-8 justify-between create-game-hub-options"><div class=flex-auto></div></div></div></div></div>`), _tmpl$38 = /* @__PURE__ */ template(`<div class="flex flex-col relative items-center self-center w-full"><div class="absolute top-0 bg-black opacity-50"></div><div class="relative w-full"><div class=h-20></div></div></div>`), _tmpl$39 = /* @__PURE__ */ template(`<div class="absolute bottom-8 create-game-hub-continue-button-container flex flex-row h-16 items-center justify-center"><div class="filigree-h4-left mt-3"></div><div class="filigree-h4-right mt-3"></div></div>`);
const CreateGameHubLayout = (props) => {
  const flowContext = useScreenFlowContext();
  return createComponent(CreateGameStage, {
    get header() {
      return createComponent(CreateGameStageHeader, {
        showSteps: false,
        title: "LOC_UI_CREATE_GAME_OVERVIEW",
        exitText: "LOC_MAIN_MENU_EXIT",
        onBack: () => {
          flowContext.clearHub();
          flowContext.activatePrev();
        }
      });
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        insert(_el$, () => props.children);
        return _el$;
      })(), _tmpl$2()];
    }
  });
};
const HubLeaderInfo = (props) => {
  const leaderModel = useLeaderSelectModelContext();
  const screenFlow = useScreenFlowContext();
  const leader = createMemo(() => leaderModel.selectedLeader());
  const rewardDesc = createMemo(() => {
    const reward = leader().nextReward;
    if (!reward) {
      return void 0;
    }
    const rewardType = getRewardType(reward.gameItemID);
    return rewardType == UnlockableRewardType.Memento ? `LOC_${reward.gameItemID}_FUNCTIONAL_DESCRIPTION` : void 0;
  });
  const leaderID = createMemo(() => leader().leaderID);
  const leaderImage = createMemo(() => Locale.toLower(leaderID()).replace("leader_", "lsl_"));
  const isAgeTransition = UI.isInGame();
  const selectedLeaderTags = createMemo(() => leader().tags);
  const audio = useAudio("CreateGameHub");
  onMount(() => {
    audio("popup-open");
  });
  return (() => {
    var _el$3 = _tmpl$16(), _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling, _el$24 = _el$5.firstChild, _el$25 = _el$5.nextSibling;
    insert(_el$4, createComponent(L10n.Compose, {
      text: "LOC_CREATE_GAME_LEADER_SELECT_CATEGORY"
    }));
    insert(_el$5, createComponent(Tooltip, {
      get showFiligrees() {
        return leaderID() != "RANDOM";
      },
      get initialHPosition() {
        return leaderID() != "RANDOM" ? TooltipHorizontalPosition.RIGHT : TooltipHorizontalPosition.CENTER;
      },
      get initialVPosition() {
        return leaderID() != "RANDOM" ? TooltipVerticalPosition.CENTER : TooltipVerticalPosition.BOTTOM;
      },
      get children() {
        return [createComponent(Tooltip.Trigger, {
          get children() {
            return createComponent(Activatable, {
              "class": "create-game-hub-banner relative group",
              onActivate: () => screenFlow.activate("leader-select"),
              disabled: isAgeTransition,
              get children() {
                var _el$6 = _tmpl$7(), _el$7 = _el$6.firstChild, _el$12 = _el$7.nextSibling, _el$13 = _el$12.nextSibling, _el$16 = _el$13.nextSibling;
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return leaderID() != "RANDOM";
                  },
                  get children() {
                    return [(() => {
                      var _el$8 = _tmpl$3();
                      _el$8.style.setProperty("background", "url('blp:CG_Leader_BG')");
                      _el$8.style.setProperty("background-size", "cover");
                      _el$8.style.setProperty("background-position", "center center");
                      return _el$8;
                    })(), (() => {
                      var _el$9 = _tmpl$3();
                      _el$9.style.setProperty("background-size", "cover");
                      _el$9.style.setProperty("background-position-x", "50%");
                      createRenderEffect((_$p) => (_$p = `url('blp:${leaderImage()}.png')`) != null ? _el$9.style.setProperty("background-image", _$p) : _el$9.style.removeProperty("background-image"));
                      return _el$9;
                    })()];
                  }
                }), _el$12);
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return leaderID() == "RANDOM";
                  },
                  get children() {
                    return [(() => {
                      var _el$10 = _tmpl$3();
                      _el$10.style.setProperty("background-image", "url('blp:CG_Leader_BG')");
                      _el$10.style.setProperty("background-size", "cover");
                      _el$10.style.setProperty("background-position", "center center");
                      return _el$10;
                    })(), (() => {
                      var _el$11 = _tmpl$4();
                      _el$11.style.setProperty("background-image", "url(blp:shell_leader-silhouette.png)");
                      _el$11.style.setProperty("background-size", "cover");
                      _el$11.style.setProperty("background-position", "center center");
                      return _el$11;
                    })()];
                  }
                }), _el$12);
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return leaderID() != "RANDOM";
                  },
                  get children() {
                    var _el$14 = _tmpl$6();
                    insert(_el$14, createComponent(RingMeter, {
                      "class": "leader-button-xp-ring min-size-28 size-28 m-8",
                      get value() {
                        return leaderModel.selectedLeader().currentXp;
                      },
                      get min() {
                        return leaderModel.selectedLeader().prevLevelXp;
                      },
                      get max() {
                        return leaderModel.selectedLeader().nextLevelXp;
                      },
                      ringImage: 'url("blp:shell_leader-xp-ring.png")',
                      get children() {
                        var _el$15 = _tmpl$5();
                        insert(_el$15, () => leaderModel.selectedLeader().level);
                        return _el$15;
                      }
                    }));
                    return _el$14;
                  }
                }), _el$16);
                insert(_el$6, createComponent(Show, {
                  get when() {
                    return leaderID() == "RANDOM";
                  },
                  get children() {
                    return createComponent(Icon, {
                      "class": "size-22 mb-16 relative create-game-hub-random-icon",
                      name: "LEADER_RANDOM"
                    });
                  }
                }), _el$16);
                return _el$6;
              }
            });
          }
        }), createComponent(Tooltip.Content, {
          get children() {
            return createComponent(Tooltip.Frame, {
              get ["class"]() {
                return "flex flex-col relative p-3 " + (leaderID() != "RANDOM" ? "w-96" : "");
              },
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return leaderID() == "RANDOM";
                  },
                  get children() {
                    var _el$17 = _tmpl$8();
                    insert(_el$17, createComponent(L10n.Compose, {
                      get text() {
                        return leader().name;
                      }
                    }));
                    return _el$17;
                  }
                }), createComponent(Show, {
                  get when() {
                    return leaderID() != "RANDOM";
                  },
                  get children() {
                    var _el$18 = _tmpl$10(), _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling;
                    insert(_el$19, createComponent(L10n.Compose, {
                      text: "LOC_UI_CREATE_GAME_LEADER_ABILITY"
                    }));
                    insert(_el$20, createComponent(For, {
                      get each() {
                        return leader().tags;
                      },
                      children: (attribute) => (() => {
                        var _el$35 = _tmpl$17(), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling;
                        insert(_el$36, createComponent(Icon, {
                          get name() {
                            return attribute.replace("LOC_TAG_TRAIT_", "ATTRIBUTE_").replace("_NAME", "");
                          },
                          "class": `relative size-8`,
                          context: "OUTLINE"
                        }));
                        insert(_el$37, createComponent(L10n.Compose, {
                          text: attribute
                        }));
                        return _el$35;
                      })()
                    }));
                    insert(_el$18, createComponent(TicketBox, {
                      "class": "flex-auto flex flex-row relative mt-1",
                      get children() {
                        var _el$21 = _tmpl$9(), _el$22 = _el$21.firstChild, _el$23 = _el$22.nextSibling;
                        insert(_el$22, createComponent(L10n.Compose, {
                          get text() {
                            return leader().abilityTitle;
                          }
                        }));
                        insert(_el$23, createComponent(L10n.Stylize, {
                          "class": "create-game-markup",
                          get text() {
                            return leader().abilityTextTag;
                          }
                        }));
                        return _el$21;
                      }
                    }), null);
                    return _el$18;
                  }
                })];
              }
            });
          }
        })];
      }
    }), _el$24);
    insert(_el$24, createComponent(For, {
      get each() {
        return selectedLeaderTags();
      },
      children: (item) => (() => {
        var _el$38 = _tmpl$18();
        _el$38.style.setProperty("background-image", "url(blp:hud_sub_circle_dis)");
        _el$38.style.setProperty("background-repeat", "no-repeat");
        _el$38.style.setProperty("background-size", "cover");
        insert(_el$38, createComponent(AttributeIcon, {
          "class": "size-8 relative ml-0\\.5 -mt-0\\.5",
          attribute: item
        }));
        return _el$38;
      })()
    }));
    insert(_el$25, createComponent(Show, {
      get when() {
        return leader().nextReward?.reward;
      },
      get children() {
        return createComponent(Tooltip, {
          get children() {
            return [createComponent(Tooltip.Trigger, {
              get children() {
                return createComponent(AudioContextProvider, {
                  segment: "TraitIcon",
                  get children() {
                    return createComponent(Activatable, {
                      disableFocus: true,
                      get children() {
                        return createComponent(Icon, {
                          "class": "size-9 create-game-hub-trait-icon",
                          get name() {
                            return `url('${leader().nextReward?.reward}')`;
                          }
                        });
                      }
                    });
                  }
                });
              }
            }), createComponent(Tooltip.Content, {
              get children() {
                return createComponent(Tooltip.Frame, {
                  "class": "flex flex-col relative w-128 p-3",
                  get children() {
                    return [(() => {
                      var _el$26 = _tmpl$11(), _el$27 = _el$26.firstChild, _el$28 = _el$27.firstChild, _el$29 = _el$27.nextSibling;
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
                      "class": "flex-auto flex flex-row relative mt-1",
                      get children() {
                        return [_tmpl$12(), (() => {
                          var _el$31 = _tmpl$13();
                          insert(_el$31, createComponent(Icon, {
                            "class": "size-19 m-4",
                            get name() {
                              return `url('${leader().nextReward?.reward}')`;
                            },
                            isUrl: true
                          }));
                          return _el$31;
                        })(), (() => {
                          var _el$32 = _tmpl$15(), _el$33 = _el$32.firstChild;
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
                              return [_tmpl$14(), createComponent(L10n.Stylize, {
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
                });
              }
            })];
          }
        });
      }
    }));
    createRenderEffect(() => className(_el$3, `flex flex-col mx-1 ${props.class ?? ""}`));
    return _el$3;
  })();
};
const HubCivInfo = (props) => {
  const civModel = useCivSelectModelContext();
  const screenFlow = useScreenFlowContext();
  const ageContext = useAgeSelectModelContext();
  const choiceContext = useRecommendedChoiceModelContext();
  const leaderModel = useLeaderSelectModelContext();
  const isSmallScreen = useIsSmallScreen();
  const civID = createMemo(() => civModel.selectedCiv().civID);
  const civImage = createMemo(() => Locale.toLower(civID()).replace("civilization_", "bg_panel_"));
  const bgImage = createMemo(() => UI.getIconBLP(civID(), "BACKGROUND_VERT"));
  const activeAbility = createMemo(() => civModel.selectedCiv().perAgeAbilities.find((a) => a.age == ageContext.selectedAge.type) ?? civModel.selectedCiv().perAgeAbilities.find((a) => !a.age));
  const filteredTraditions = createMemo(() => {
    return civModel.selectedCiv().traditions.filter((t) => t.age == ageContext.selectedAge.type);
  });
  const recommendation = createMemo(() => choiceContext.forLeader().get(civID()));
  const selectedCivTags = createMemo(() => civModel.selectedCiv().traits);
  return (() => {
    var _el$39 = _tmpl$23(), _el$40 = _el$39.firstChild, _el$55 = _el$40.nextSibling;
    insert(_el$40, createComponent(L10n.Compose, {
      text: "LOC_GENERIC_CIVILIZATION"
    }));
    insert(_el$39, createComponent(Tooltip, {
      get showFiligrees() {
        return civID() != "RANDOM";
      },
      get initialHPosition() {
        return civID() != "RANDOM" ? TooltipHorizontalPosition.RIGHT : TooltipHorizontalPosition.CENTER;
      },
      get initialVPosition() {
        return civID() != "RANDOM" ? TooltipVerticalPosition.CENTER : TooltipVerticalPosition.BOTTOM;
      },
      get children() {
        return [createComponent(Tooltip.Trigger, {
          get children() {
            return createComponent(Activatable, {
              "class": "create-game-hub-banner relative group",
              onActivate: () => screenFlow.activate("civ-select"),
              get children() {
                var _el$41 = _tmpl$19(), _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling, _el$44 = _el$43.nextSibling, _el$45 = _el$44.nextSibling, _el$46 = _el$45.nextSibling, _el$47 = _el$46.nextSibling;
                _el$43.style.setProperty("background-position", "center center");
                insert(_el$41, createComponent(Show, {
                  get when() {
                    return civID() != "RANDOM";
                  },
                  get children() {
                    return createComponent(Icon, {
                      "class": "size-36 mb-10 relative",
                      get name() {
                        return `url('${civModel.selectedCiv().icon}')`;
                      }
                    });
                  }
                }), _el$47);
                insert(_el$41, createComponent(Show, {
                  get when() {
                    return civID() == "RANDOM";
                  },
                  get children() {
                    return createComponent(Icon, {
                      "class": "size-22 mb-16 relative create-game-hub-random-icon",
                      name: "LEADER_RANDOM"
                    });
                  }
                }), _el$47);
                insert(_el$47, createComponent(For, {
                  get each() {
                    return selectedCivTags();
                  },
                  children: (item) => (() => {
                    var _el$58 = _tmpl$18();
                    _el$58.style.setProperty("background-image", "url(blp:hud_sub_circle_dis)");
                    _el$58.style.setProperty("background-repeat", "no-repeat");
                    _el$58.style.setProperty("background-size", "cover");
                    insert(_el$58, createComponent(AttributeIcon, {
                      "class": "size-8 relative ml-0\\.5 -mt-0\\.5",
                      attribute: item
                    }));
                    return _el$58;
                  })()
                }));
                createRenderEffect((_p$) => {
                  var _v$ = `url('${bgImage()}')`, _v$2 = `url('blp:${civImage()}.png')`;
                  _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$43.style.setProperty("background-image", _v$) : _el$43.style.removeProperty("background-image"));
                  _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$44.style.setProperty("background", _v$2) : _el$44.style.removeProperty("background"));
                  return _p$;
                }, {
                  e: void 0,
                  t: void 0
                });
                return _el$41;
              }
            });
          }
        }), createComponent(Tooltip.Content, {
          get children() {
            return createComponent(Tooltip.Frame, {
              get ["class"]() {
                return "flex flex-col relative p-3 " + (civID() != "RANDOM" ? "w-96" : "");
              },
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return civID() == "RANDOM";
                  },
                  get children() {
                    var _el$48 = _tmpl$8();
                    insert(_el$48, createComponent(L10n.Compose, {
                      get text() {
                        return civModel.selectedCiv().name;
                      }
                    }));
                    return _el$48;
                  }
                }), createComponent(Show, {
                  get when() {
                    return civID() != "RANDOM";
                  },
                  get children() {
                    return [(() => {
                      var _el$49 = _tmpl$20(), _el$50 = _el$49.firstChild;
                      insert(_el$50, createComponent(L10n.Compose, {
                        text: "LOC_UI_CREATE_GAME_CIVILIZATION_ABILITY"
                      }));
                      return _el$49;
                    })(), (() => {
                      var _el$51 = _tmpl$21();
                      insert(_el$51, createComponent(For, {
                        get each() {
                          return selectedCivTags();
                        },
                        children: (attribute) => (() => {
                          var _el$59 = _tmpl$24(), _el$60 = _el$59.firstChild, _el$61 = _el$60.nextSibling;
                          insert(_el$60, createComponent(Icon, {
                            get name() {
                              return attribute.replace("LOC_TAG_TRAIT_", "ATTRIBUTE_").replace("_NAME", "");
                            },
                            "class": `relative size-8`,
                            context: "OUTLINE"
                          }));
                          insert(_el$61, createComponent(L10n.Compose, {
                            text: attribute
                          }));
                          return _el$59;
                        })()
                      }));
                      return _el$51;
                    })(), createComponent(TicketBox, {
                      "class": "flex-auto flex flex-row relative mt-1",
                      get children() {
                        var _el$52 = _tmpl$9(), _el$53 = _el$52.firstChild, _el$54 = _el$53.nextSibling;
                        insert(_el$53, createComponent(L10n.Compose, {
                          get text() {
                            return activeAbility()?.abilityTitle ?? "";
                          }
                        }));
                        insert(_el$54, createComponent(L10n.Stylize, {
                          "class": "create-game-markup",
                          get text() {
                            return activeAbility()?.abilityText ?? "";
                          }
                        }));
                        return _el$52;
                      }
                    }), createComponent(Show, {
                      get when() {
                        return createMemo(() => !!recommendation()?.reason)() && !isSmallScreen();
                      },
                      get children() {
                        return createComponent(TicketBox, {
                          "class": "flex flex-row items-center px-6 pt-4 pb-6",
                          get children() {
                            return [createComponent(Icon, {
                              get name() {
                                return leaderModel.selectedLeader().icon;
                              },
                              "class": "size-13"
                            }), createComponent(L10n.Stylize, {
                              "class": "flex-auto create-game-markup tight",
                              get text() {
                                return recommendation()?.reason ?? "";
                              }
                            })];
                          }
                        });
                      }
                    })];
                  }
                })];
              }
            });
          }
        })];
      }
    }), _el$55);
    insert(_el$55, createComponent(Show, {
      get when() {
        return filteredTraditions().length > 0;
      },
      get children() {
        return createComponent(Tooltip, {
          get children() {
            return [createComponent(Tooltip.Trigger, {
              get children() {
                return createComponent(AudioContextProvider, {
                  segment: "TraitIcon",
                  get children() {
                    return createComponent(Activatable, {
                      disableFocus: true,
                      get children() {
                        return createComponent(Icon, {
                          name: 'url("blp:unlock_tradition")',
                          "class": "size-9 create-game-hub-trait-icon"
                        });
                      }
                    });
                  }
                });
              }
            }), createComponent(Tooltip.Content, {
              get children() {
                return createComponent(Tooltip.Frame, {
                  "class": "flex flex-col relative w-174 p-3",
                  get children() {
                    return [(() => {
                      var _el$56 = _tmpl$22(), _el$57 = _el$56.firstChild;
                      insert(_el$57, createComponent(L10n.Compose, {
                        text: "LOC_UI_CREATE_GAME_TRADITIONS"
                      }));
                      return _el$56;
                    })(), createComponent(TicketBox, {
                      "class": "flex-auto flex flex-col mt-1",
                      get children() {
                        return createComponent(ForWithSeparator, {
                          get separator() {
                            return _tmpl$25();
                          },
                          get each() {
                            return filteredTraditions();
                          },
                          children: (item) => createComponent(TraditionItem, {
                            icon: "unlock_tradition",
                            get civic() {
                              return item.civic;
                            },
                            get name() {
                              return item.title;
                            },
                            get description() {
                              return item.text;
                            }
                          })
                        });
                      }
                    })];
                  }
                });
              }
            })];
          }
        });
      }
    }));
    createRenderEffect(() => className(_el$39, `flex flex-col mx-1 ${props.class ?? ""}`));
    return _el$39;
  })();
};
const HubAgeInfo = (props) => {
  const ageModel = useAgeSelectModelContext();
  const isAgeTransition = UI.isInGame();
  return (() => {
    var _el$63 = _tmpl$27(), _el$64 = _el$63.firstChild;
    insert(_el$64, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_AGE"
    }));
    insert(_el$63, createComponent(Popup.Trigger, {
      name: "age-select",
      get children() {
        return createComponent(Tooltip.Text, {
          get text() {
            return ageModel.selectedAge.name;
          },
          get children() {
            return createComponent(Activatable, {
              "class": "create-game-hub-banner relative group",
              disabled: isAgeTransition,
              get children() {
                var _el$65 = _tmpl$26(), _el$66 = _el$65.firstChild, _el$67 = _el$66.nextSibling, _el$68 = _el$67.nextSibling, _el$69 = _el$68.nextSibling, _el$70 = _el$69.nextSibling, _el$71 = _el$70.nextSibling;
                _el$67.style.setProperty("background-position", "center center");
                _el$67.style.setProperty("background-size", "cover");
                _el$71.style.setProperty("background-image", "url(blp:hud_sub_circle_dis_128x128)");
                _el$71.style.setProperty("background-repeat", "no-repeat");
                _el$71.style.setProperty("background-size", "cover");
                insert(_el$71, createComponent(Icon, {
                  get name() {
                    return ageModel.selectedAge.icon;
                  },
                  "class": "size-24 -bottom-px relative"
                }));
                createRenderEffect((_p$) => {
                  var _v$3 = `url(${UI.getIconBLP(ageModel.selectedAge.type, "BACKGROUND_VERT")})`, _v$4 = Layout.pixels(132), _v$5 = Layout.pixels(132);
                  _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$67.style.setProperty("background-image", _v$3) : _el$67.style.removeProperty("background-image"));
                  _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$71.style.setProperty("width", _v$4) : _el$71.style.removeProperty("width"));
                  _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$71.style.setProperty("height", _v$5) : _el$71.style.removeProperty("height"));
                  return _p$;
                }, {
                  e: void 0,
                  t: void 0,
                  a: void 0
                });
                return _el$65;
              }
            });
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$63, `flex flex-col mx-1 ${props.class ?? ""}`));
    return _el$63;
  })();
};
const HubMementos = (props) => {
  const mementosModel = useMementoSelectModelContext();
  return (() => {
    var _el$72 = _tmpl$28(), _el$73 = _el$72.firstChild, _el$74 = _el$73.nextSibling;
    insert(_el$73, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_MEMENTOS"
    }));
    insert(_el$74, createComponent(For, {
      get each() {
        return mementosModel.slots;
      },
      children: (slot) => (() => {
        var _el$75 = _tmpl$30();
        insert(_el$75, createComponent(Tab.Trigger, {
          name: "memento-select",
          get children() {
            return createComponent(Tooltip.Text, {
              get text() {
                return slot.currentMemento.name ?? "";
              },
              get children() {
                return createComponent(Activatable, {
                  "class": "flex flex-row group  relative",
                  get children() {
                    var _el$76 = _tmpl$29(), _el$77 = _el$76.firstChild, _el$78 = _el$77.nextSibling;
                    insert(_el$76, createComponent(Icon, {
                      name: `url('blp:memento_slot-base.png')`,
                      "class": "absolute -top-4\\.5 -left-4\\.5 opacity-60 create-game-hub-memento-base"
                    }), _el$77);
                    insert(_el$76, createComponent(Icon, {
                      get name() {
                        return `url('blp:${slot.currentMemento?.icon ?? ""}')`;
                      },
                      isUrl: true,
                      "class": "w-full h-full absolute inset-1"
                    }), _el$78);
                    return _el$76;
                  }
                });
              }
            });
          }
        }));
        return _el$75;
      })()
    }));
    createRenderEffect(() => className(_el$72, `flex flex-col mx-1 ${props.class ?? ""}`));
    return _el$72;
  })();
};
const HubGameSetup = (props) => {
  const screenFlow = useScreenFlowContext();
  const gameConfig = Configuration.getGame();
  let saveType = SaveTypes.SINGLE_PLAYER;
  if (gameConfig.isHotseat) {
    saveType = SaveTypes.HOTSEAT;
  } else if (gameConfig.isInternetMultiplayer) {
    saveType = SaveTypes.NETWORK_MULTIPLAYER;
  }
  function showSaveScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "save_config",
        "server-type": ServerType.SERVER_TYPE_NONE,
        "save-type": saveType
      }
    });
  }
  function showLoadScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "load_config",
        "server-type": ServerType.SERVER_TYPE_NONE,
        "save-type": saveType
      }
    });
  }
  const isAgeTransition = UI.isInGame();
  return (() => {
    var _el$79 = _tmpl$33(), _el$80 = _el$79.firstChild, _el$81 = _el$80.nextSibling, _el$84 = _el$81.firstChild;
    insert(_el$80, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_GAME_SETUP"
    }));
    insert(_el$81, createComponent(Tooltip.Text, {
      get text() {
        return Locale.compose("LOC_UI_CREATE_GAME_ADJUST_GAME_SETTINGS");
      },
      get children() {
        return createComponent(Activatable, {
          "class": "flex flex-row group relative",
          onActivate: () => screenFlow.activate("game-setup"),
          disabled: isAgeTransition,
          get children() {
            var _el$82 = _tmpl$31(), _el$83 = _el$82.firstChild;
            insert(_el$82, createComponent(Icon, {
              "class": "size-28",
              name: `url('blp:settings_adv_option_100x100')`
            }), _el$83);
            return _el$82;
          }
        });
      }
    }), _el$84);
    insert(_el$84, createComponent(Tooltip.Text, {
      get text() {
        return Locale.stylize("LOC_SAVE_LOAD_TITLE_SAVE_CONFIG");
      },
      get children() {
        return createComponent(Activatable, {
          "class": "flex flex-row group relative",
          onActivate: showSaveScreen,
          disabled: isAgeTransition,
          get children() {
            var _el$85 = _tmpl$32(), _el$86 = _el$85.firstChild;
            insert(_el$85, createComponent(Icon, {
              "class": "size-14",
              name: "url('blp:save_config_noborder')"
            }), _el$86);
            return _el$85;
          }
        });
      }
    }), null);
    insert(_el$84, createComponent(Tooltip.Text, {
      get text() {
        return Locale.stylize("LOC_SAVE_LOAD_TITLE_LOAD_CONFIG");
      },
      get children() {
        return createComponent(Activatable, {
          "class": "flex flex-row group relative",
          onActivate: showLoadScreen,
          disabled: isAgeTransition,
          get children() {
            var _el$87 = _tmpl$32(), _el$88 = _el$87.firstChild;
            insert(_el$87, createComponent(Icon, {
              "class": "size-14",
              name: "url('blp:load_config_noborder')"
            }), _el$88);
            return _el$87;
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$79, `flex flex-col mx-1 -mb-2 ${props.class ?? ""}`));
    return _el$79;
  })();
};
const HubGameSetupOverview = () => {
  const gameSetupModel = useGameSetupModelContext();
  return (() => {
    var _el$89 = _tmpl$34(), _el$90 = _el$89.firstChild, _el$91 = _el$90.nextSibling, _el$92 = _el$91.firstChild, _el$93 = _el$92.firstChild, _el$94 = _el$93.nextSibling, _el$95 = _el$92.nextSibling, _el$96 = _el$95.firstChild, _el$97 = _el$96.nextSibling, _el$98 = _el$95.nextSibling, _el$100 = _el$98.firstChild, _el$101 = _el$100.firstChild, _el$102 = _el$101.nextSibling, _el$103 = _el$98.nextSibling, _el$104 = _el$103.firstChild, _el$105 = _el$104.nextSibling, _el$106 = _el$103.nextSibling, _el$107 = _el$106.firstChild, _el$108 = _el$107.nextSibling;
    insert(_el$89, createComponent(Hotkeys, {
      hotkeys: [{
        hotkeyAction: "accept",
        navTrayText: "LOC_GENERIC_SELECT"
      }]
    }), _el$90);
    insert(_el$93, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.Difficulty.name;
      }
    }));
    insert(_el$94, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.Difficulty.selectedOption?.name ?? "";
      }
    }));
    insert(_el$96, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.GameSpeeds.name;
      }
    }));
    insert(_el$97, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.GameSpeeds.selectedOption?.name ?? "";
      }
    }));
    insert(_el$98, createComponent(Show, {
      get when() {
        return gameSetupModel.Map.selectedOption?.icon;
      },
      get children() {
        var _el$99 = _tmpl$13();
        insert(_el$99, createComponent(Icon, {
          "class": "size-9 mr-3\\.5",
          get name() {
            return gameSetupModel.Map.selectedOption?.icon;
          }
        }));
        return _el$99;
      }
    }), _el$100);
    insert(_el$101, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.Map.name;
      }
    }));
    insert(_el$102, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.Map.selectedOption?.name ?? "";
      }
    }));
    insert(_el$104, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.MapSize.name;
      }
    }));
    insert(_el$105, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.MapSize.selectedOption?.name ?? "";
      }
    }));
    insert(_el$107, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.AgeTransitionSetting.name;
      }
    }));
    insert(_el$108, createComponent(L10n.Compose, {
      get text() {
        return gameSetupModel.AgeTransitionSetting.selectedOption?.name ?? "";
      }
    }));
    createRenderEffect((_p$) => {
      var _v$6 = Layout.pixels(20), _v$7 = Layout.pixels(40), _v$8 = Layout.pixels(20), _v$9 = Layout.pixels(40), _v$10 = Layout.pixels(20), _v$11 = Layout.pixels(40), _v$12 = Layout.pixels(24), _v$13 = Layout.pixels(48), _v$14 = Layout.pixels(20), _v$15 = Layout.pixels(40), _v$16 = Layout.pixels(20), _v$17 = Layout.pixels(40), _v$18 = Layout.pixels(24), _v$19 = Layout.pixels(48);
      _v$6 !== _p$.e && ((_p$.e = _v$6) != null ? _el$93.style.setProperty("line-height", _v$6) : _el$93.style.removeProperty("line-height"));
      _v$7 !== _p$.t && ((_p$.t = _v$7) != null ? _el$93.style.setProperty("max-height", _v$7) : _el$93.style.removeProperty("max-height"));
      _v$8 !== _p$.a && ((_p$.a = _v$8) != null ? _el$96.style.setProperty("line-height", _v$8) : _el$96.style.removeProperty("line-height"));
      _v$9 !== _p$.o && ((_p$.o = _v$9) != null ? _el$96.style.setProperty("max-height", _v$9) : _el$96.style.removeProperty("max-height"));
      _v$10 !== _p$.i && ((_p$.i = _v$10) != null ? _el$101.style.setProperty("line-height", _v$10) : _el$101.style.removeProperty("line-height"));
      _v$11 !== _p$.n && ((_p$.n = _v$11) != null ? _el$101.style.setProperty("max-height", _v$11) : _el$101.style.removeProperty("max-height"));
      _v$12 !== _p$.s && ((_p$.s = _v$12) != null ? _el$102.style.setProperty("line-height", _v$12) : _el$102.style.removeProperty("line-height"));
      _v$13 !== _p$.h && ((_p$.h = _v$13) != null ? _el$102.style.setProperty("max-height", _v$13) : _el$102.style.removeProperty("max-height"));
      _v$14 !== _p$.r && ((_p$.r = _v$14) != null ? _el$104.style.setProperty("line-height", _v$14) : _el$104.style.removeProperty("line-height"));
      _v$15 !== _p$.d && ((_p$.d = _v$15) != null ? _el$104.style.setProperty("max-height", _v$15) : _el$104.style.removeProperty("max-height"));
      _v$16 !== _p$.l && ((_p$.l = _v$16) != null ? _el$107.style.setProperty("line-height", _v$16) : _el$107.style.removeProperty("line-height"));
      _v$17 !== _p$.u && ((_p$.u = _v$17) != null ? _el$107.style.setProperty("max-height", _v$17) : _el$107.style.removeProperty("max-height"));
      _v$18 !== _p$.c && ((_p$.c = _v$18) != null ? _el$108.style.setProperty("line-height", _v$18) : _el$108.style.removeProperty("line-height"));
      _v$19 !== _p$.w && ((_p$.w = _v$19) != null ? _el$108.style.setProperty("max-height", _v$19) : _el$108.style.removeProperty("max-height"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0,
      h: void 0,
      r: void 0,
      d: void 0,
      l: void 0,
      u: void 0,
      c: void 0,
      w: void 0
    });
    return _el$89;
  })();
};
const CreateGameHubComponent = () => {
  const ageModel = useAgeSelectModelContext();
  const civModel = useCivSelectModelContext();
  const leaderModel = useLeaderSelectModelContext();
  const flowContext = useScreenFlowContext();
  const isSmallScreen = useIsSmallScreen();
  return createComponent(CreateGameHubLayout, {
    get children() {
      return createComponent(AudioContextProvider, {
        segment: "CreateGameHub",
        get children() {
          return createComponent(SpatialSlot, {
            name: "create-game-hub-slot",
            "class": "flex flex-col absolute inset-0 items-start justify-center",
            get children() {
              return [(() => {
                var _el$109 = _tmpl$37(), _el$110 = _el$109.firstChild, _el$113 = _el$110.nextSibling, _el$114 = _el$113.firstChild, _el$115 = _el$114.nextSibling, _el$116 = _el$115.firstChild, _el$117 = _el$116.firstChild;
                insert(_el$110, createComponent(Show, {
                  get when() {
                    return !isSmallScreen();
                  },
                  get children() {
                    return [createComponent(Header, {
                      "class": "ml-8 create-game-hub-recap-text uppercase font-black text-custom",
                      get children() {
                        return leaderModel.selectedLeader().name;
                      }
                    }), _tmpl$35(), createComponent(Header, {
                      "class": "ml-8 create-game-hub-recap-text uppercase font-black text-custom",
                      get children() {
                        return civModel.selectedCiv().name;
                      }
                    }), _tmpl$35(), createComponent(Header, {
                      "class": "ml-8 create-game-hub-recap-text uppercase font-black text-custom",
                      get children() {
                        return ageModel.selectedAge.name;
                      }
                    })];
                  }
                }));
                insert(_el$115, createComponent(AudioContextProvider, {
                  segment: "HubLeaderInfo",
                  get children() {
                    return createComponent(HubLeaderInfo, {});
                  }
                }), _el$116);
                insert(_el$115, createComponent(AudioContextProvider, {
                  segment: "HubCivInfo",
                  get children() {
                    return createComponent(HubCivInfo, {});
                  }
                }), _el$116);
                insert(_el$115, createComponent(AudioContextProvider, {
                  segment: "HubAgeInfo",
                  get children() {
                    return createComponent(HubAgeInfo, {});
                  }
                }), _el$116);
                insert(_el$116, createComponent(AudioContextProvider, {
                  segment: "HubMementos",
                  get children() {
                    return createComponent(HubMementos, {});
                  }
                }), _el$117);
                insert(_el$116, createComponent(AudioContextProvider, {
                  segment: "HubGameSetup",
                  get children() {
                    return createComponent(HubGameSetup, {});
                  }
                }), null);
                insert(_el$113, createComponent(Show, {
                  get when() {
                    return !isSmallScreen();
                  },
                  get children() {
                    var _el$118 = _tmpl$36(), _el$119 = _el$118.firstChild, _el$120 = _el$119.firstChild;
                    insert(_el$119, createComponent(HubGameSetupOverview, {}), _el$120);
                    return _el$118;
                  }
                }), null);
                createRenderEffect(() => className(_el$110, isSmallScreen() ? "w-14" : "create-game-hub-recap-panel flex flex-col uppercase items-start justify-center w-60"));
                return _el$109;
              })(), createComponent(Show, {
                get when() {
                  return isSmallScreen();
                },
                get children() {
                  var _el$121 = _tmpl$38(), _el$122 = _el$121.firstChild, _el$123 = _el$122.nextSibling, _el$124 = _el$123.firstChild;
                  _el$122.style.setProperty("left", "-100vw");
                  _el$122.style.setProperty("right", "-100vw");
                  _el$122.style.setProperty("bottom", "-100vh");
                  insert(_el$123, createComponent(HubGameSetupOverview, {}), _el$124);
                  return _el$121;
                }
              }), (() => {
                var _el$125 = _tmpl$39(), _el$126 = _el$125.firstChild, _el$127 = _el$126.nextSibling;
                insert(_el$125, createComponent(HeroButton2, {
                  "class": "flex items-center justify-center create-game-hub-continue-button",
                  onActivate: () => flowContext.activateNext(),
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_UI_CREATE_GAME_START_GAME"
                    });
                  }
                }), _el$127);
                return _el$125;
              })()];
            }
          });
        }
      });
    }
  });
};
const CreateGameHub = ComponentRegistry.register({
  name: "CreateGameHub",
  createInstance: CreateGameHubComponent,
  styles: [style]
});

export { CreateGameHub, CreateGameHubComponent, CreateGameHubLayout, HubAgeInfo, HubCivInfo, HubGameSetup, HubGameSetupOverview, HubLeaderInfo, HubMementos };
//# sourceMappingURL=create-game-hub.js.map
