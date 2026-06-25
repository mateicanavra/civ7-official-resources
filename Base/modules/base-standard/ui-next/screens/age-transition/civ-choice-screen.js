import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, For, Show, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { Header } from '../../../../core/ui-next/components/header.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { useScreenFlowContext } from '../../../../core/ui-next/components/screen-flow.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { Tooltip, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { AgeIcon } from '../../../../core/ui-next/screens/create-game/age-icon.js';
import { AgeSelectModel } from '../../../../core/ui-next/screens/create-game/age-select-model.js';
import { AttributeIcon } from '../../../../core/ui-next/screens/create-game/attribute-icon.js';
import { CivSelectModel } from '../../../../core/ui-next/screens/create-game/civ-select-model.js';
import { CreateGameHRule } from '../../../../core/ui-next/screens/create-game/create-game-components.js';
import { CreateGameStage, CreateGameStageHeader, CreateGameStageMode } from '../../../../core/ui-next/screens/create-game/create-game-stage.js';
import { LeaderSelectModel } from '../../../../core/ui-next/screens/create-game/leader-select-model.js';
import { RecommendedChoiceModel } from '../../../../core/ui-next/screens/create-game/recommended-choice-model.js';
import { TicketBox } from '../../../../core/ui-next/screens/create-game/ticket-box.js';
import { TotIcon } from '../../../../core/ui-next/screens/create-game/tot-icon.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { ViewExperience } from '../../../../core/ui-next/services/view-experience.js';
import style from './civ-choice-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-start"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="uppercase text-secondary-1 text-sm font-title"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="uppercase text-accent-2 text-sm font-body"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="create-game-civ-card-icon flex items-center justify-center mx-1"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=uppercase></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="civ-choice-card-image flex flex-col bg-cover bg-center"><div class="flex-auto mt-16 relative"><div class="absolute flex civ-choice-card-gradient -top-8 left-1\\/2"></div><div class="absolute inset-0 flex flex-col items-center"></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="civ-choice-card-icon-area relative"><div class="civ-choice-card-icon-gradient absolute top-0 left-0 right-0 bottom-7"></div><div class="absolute inset-0 flex flex-row items-center justify-center pt-1"><div class=mx-4></div><div class="civ-choice-card-icon flex items-center justify-center mx-1"></div><div class="civ-choice-card-icon flex items-center justify-center mx-1"></div></div><div class="flex items-center justify-center absolute -top-2 left-0 right-0"><div class="civ-choice-card-inner-filigree -scale-y-100"></div></div><div class="flex items-center justify-center absolute -bottom-2 left-0 right-0"><div class=civ-choice-card-inner-filigree></div></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto items-center relative"><div class="civ-choice-card-shadow absolute top-0 left-1 right-1"></div><div class="flex-auto flex flex-col items-center justify-center mx-10"><div class="font-title uppercase text-secondary text-center"></div></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="civ-choice-card-top-filigree absolute -mt-6"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="civ-choice-card-laurels-container flex flex-col absolute left-0 right-0 items-center justify-center"><div class="civ-choice-card-laurels relative"><div class="absolute inset-0 flex items-center justify-center pb-2"><div class=civ-choice-card-leader-hex></div></div><div class="absolute inset-0 flex items-center justify-center pb-2"></div></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="civ-choice-card-icon flex items-center justify-center mx-1"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="civ-choice-rec-card relative p-2 mb-1 img-unit-panelbox"><div class="absolute inset-y-1 left-1 right-0\\.5 bg-cover bg-center"></div><div class="absolute inset-y-1 left-1 right-0\\.5 civ-choice-rec-card-overlay"></div><div class="absolute inset-1 bg-cover bg-center"></div><div class="civ-choice-rec-card w-full flex flex-row relative"><div class="civ-choice-rec-card-icon-area flex items-center justify-center"></div><div class="civ-choice-rec-card-text flex flex-col flex-auto justify-center"><div class="uppercase font-title text-xl text-tertiary-1 font-fit-shrink"></div></div><div class="civ-choice-corner-filigree top-left"></div><div class="civ-choice-corner-filigree top-right"></div><div class="civ-choice-corner-filigree bottom-left"></div><div class="civ-choice-corner-filigree bottom-right"></div></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class=civ-choice-rec-area></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto relative mb-2 mb-6 mt-18 mx-20"><div class="civ-choice-rec-area text-sm flex flex-col items-center pb-2 relative"><div class="font-title uppercase text-tertiary-1 mt-2"></div><div class="uppercase text-sm text-accent-3"></div><div class="civ-choice-rec-filigree top-left"></div><div class="civ-choice-rec-filigree top-right"></div></div></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class=civ-choice-card-more-civs-image></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto items-center relative"><div class="civ-choice-card-shadow absolute top-0 left-1 right-1"></div><div class="flex-auto flex flex-col items-center justify-center"><div class="font-title uppercase text-secondary"></div><div><span></span></div></div></div>`);
const CivTooltip = (props) => {
  const ageModel = AgeSelectModel.get();
  const choiceModel = RecommendedChoiceModel.get();
  const civ = createMemo(() => props.civ);
  const activeAbility = createMemo(() => civ()?.perAgeAbilities.find((a) => a.age == ageModel.selectedAge.type) ?? civ()?.perAgeAbilities.find((a) => !a.age));
  const activeRecommendation = createMemo(() => choiceModel.forLeader().get(civ().civID));
  return createComponent(Tooltip.Frame, {
    "class": "flex flex-col relative w-128",
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        insert(_el$, createComponent(For, {
          get each() {
            return civ().traits;
          },
          children: (attribute) => [(() => {
            var _el$4 = _tmpl$4();
            insert(_el$4, createComponent(AttributeIcon, {
              "class": "size-8",
              attribute
            }));
            return _el$4;
          })(), (() => {
            var _el$5 = _tmpl$5();
            insert(_el$5, createComponent(L10n.Compose, {
              text: attribute
            }));
            return _el$5;
          })()]
        }));
        return _el$;
      })(), createComponent(TicketBox, {
        "class": "px-6 pt-4 pb-6",
        get children() {
          return [(() => {
            var _el$2 = _tmpl$2();
            insert(_el$2, createComponent(L10n.Compose, {
              get text() {
                return activeAbility()?.abilityTitle ?? "";
              }
            }));
            return _el$2;
          })(), (() => {
            var _el$3 = _tmpl$3();
            insert(_el$3, createComponent(L10n.Compose, {
              text: "LOC_UI_CREATE_GAME_CIVILIZATION_ABILITY"
            }));
            return _el$3;
          })(), createComponent(L10n.Stylize, {
            "class": "create-game-markup tight",
            get text() {
              return activeAbility()?.abilityText ?? "";
            }
          })];
        }
      }), createComponent(Show, {
        get when() {
          return props.isRecommended;
        },
        get children() {
          return createComponent(TicketBox, {
            "class": "flex flex-row items-center px-6 pt-4 pb-6",
            get children() {
              return [createComponent(Icon, {
                get name() {
                  return props.leaderIcon;
                },
                "class": "size-13"
              }), createComponent(L10n.Stylize, {
                "class": "flex-auto create-game-markup tight",
                get text() {
                  return activeRecommendation()?.reason ?? "";
                }
              })];
            }
          });
        }
      })];
    }
  });
};
const CivChoiceExistingCivCardComponent = () => {
  const ageModel = AgeSelectModel.get();
  const choiceModel = RecommendedChoiceModel.get();
  const leaderModel = LeaderSelectModel.get();
  const model = CivSelectModel.get();
  const civ = model.previousCiv();
  const isApexAge = createMemo(() => ageModel.selectedAge.type == civ.apexAge);
  const activeRecommendation = createMemo(() => choiceModel.forLeader().get(civ.civID));
  const isRecommended = createMemo(() => !!activeRecommendation());
  const leaderIcon = createMemo(() => leaderModel.selectedLeader().icon);
  const chooseSameCiv = createMemo(() => model.setSelectedCiv(civ));
  return createComponent(VSlot, {
    "class": "civ-choice-card-panel img-unit-panelbox mr-6 group relative flex flex-col",
    get children() {
      return [createComponent(Tooltip, {
        get initialHPosition() {
          return TooltipHorizontalPosition.CENTER;
        },
        get children() {
          return [createComponent(Tooltip.Trigger, {
            get children() {
              var _el$6 = _tmpl$6(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
              insert(_el$9, createComponent(Icon, {
                "class": "civ-choice-card-civ-icon",
                get name() {
                  return `url('${civ.icon ?? ""}')`;
                },
                isUrl: true
              }), null);
              insert(_el$9, createComponent(Header, {
                "class": "text-2xl uppercase font-black civ-choice-card-text-gradient",
                get children() {
                  return civ.name;
                }
              }), null);
              createRenderEffect((_$p) => (_$p = `url('blp:${civ.bgImage}')`) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
              return _el$6;
            }
          }), createComponent(Tooltip.Content, {
            get children() {
              return createComponent(CivTooltip, {
                civ,
                get isRecommended() {
                  return isRecommended();
                },
                get leaderIcon() {
                  return leaderIcon();
                }
              });
            }
          })];
        }
      }), (() => {
        var _el$10 = _tmpl$7(), _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling, _el$15 = _el$14.nextSibling;
        insert(_el$12, createComponent(For, {
          get each() {
            return civ.traits;
          },
          children: (attribute) => (() => {
            var _el$25 = _tmpl$11();
            insert(_el$25, createComponent(AttributeIcon, {
              "class": "size-14",
              attribute
            }));
            return _el$25;
          })()
        }), _el$13);
        insert(_el$14, createComponent(AgeIcon, {
          get ageId() {
            return civ.apexAge;
          },
          "class": "size-14"
        }));
        insert(_el$15, createComponent(TotIcon, {
          get isApexAge() {
            return isApexAge();
          },
          "class": "size-14"
        }));
        return _el$10;
      })(), (() => {
        var _el$16 = _tmpl$8(), _el$17 = _el$16.firstChild, _el$18 = _el$17.nextSibling, _el$19 = _el$18.firstChild;
        insert(_el$19, createComponent(L10n.Compose, {
          text: "LOC_UI_AGE_TRANSITION_CURRENT_CIV_SELECTION"
        }));
        insert(_el$18, createComponent(Show, {
          get when() {
            return isApexAge();
          },
          get children() {
            return createComponent(L10n.Compose, {
              text: "LOC_UI_AGE_TRANSITION_APEX_CIV_INFO"
            });
          }
        }), null);
        insert(_el$16, createComponent(Tooltip, {
          get children() {
            return [createComponent(Tooltip.Trigger, {
              get children() {
                return createComponent(AudioContextProvider, {
                  segment: "AgeTransition",
                  get children() {
                    return createComponent(Button, {
                      "class": "civ-choice-card-button mb-6 uppercase",
                      onActivate: () => {
                        chooseSameCiv();
                        useAudio("AgeTransition/SelectCiv")("activate");
                      },
                      get children() {
                        return createComponent(L10n.Compose, {
                          text: "LOC_GENERIC_CONTINUE"
                        });
                      }
                    });
                  }
                });
              }
            }), createComponent(Tooltip.Content, {
              get children() {
                return createComponent(CivTooltip, {
                  civ,
                  get isRecommended() {
                    return isRecommended();
                  },
                  get leaderIcon() {
                    return leaderIcon();
                  }
                });
              }
            })];
          }
        }), null);
        return _el$16;
      })(), _tmpl$9(), (() => {
        var _el$21 = _tmpl$10(), _el$22 = _el$21.firstChild, _el$23 = _el$22.firstChild, _el$24 = _el$23.nextSibling;
        insert(_el$24, createComponent(Icon, {
          get name() {
            return leaderIcon();
          },
          "class": "civ-choice-card-leader"
        }));
        return _el$21;
      })()];
    }
  });
};
const CivChoiceCivCard = (props) => {
  return (() => {
    var _el$26 = _tmpl$12(), _el$27 = _el$26.firstChild, _el$28 = _el$27.nextSibling, _el$29 = _el$28.nextSibling, _el$30 = _el$29.nextSibling, _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling, _el$33 = _el$32.firstChild;
    _el$29.style.setProperty("background-image", "url('blp:create_game_gradient1')");
    insert(_el$31, createComponent(Icon, {
      "class": "civ-choice-rec-card-icon",
      get name() {
        return `url('${props.icon ?? ""}')`;
      },
      isUrl: true
    }));
    insert(_el$33, createComponent(L10n.Compose, {
      get text() {
        return props.name;
      }
    }));
    insert(_el$32, createComponent(CreateGameHRule, {
      "class": "civ-choice-rec-card-text-spacing"
    }), null);
    insert(_el$32, createComponent(L10n.Stylize, {
      "class": "text-base font-body text-accent-3",
      get text() {
        return props.desc;
      }
    }), null);
    createRenderEffect((_$p) => (_$p = `url('blp:${props.bg}')`) != null ? _el$27.style.setProperty("background-image", _$p) : _el$27.style.removeProperty("background-image"));
    return _el$26;
  })();
};
const CivChoiceExistingCivCard = ComponentRegistry.register({
  name: "CivChoiceExistingCivCard",
  createInstance: CivChoiceExistingCivCardComponent
});
const CivChoiceChangeCivCardComponent = () => {
  const model = CivSelectModel.get();
  const ageModel = AgeSelectModel.get();
  const choiceModel = RecommendedChoiceModel.get();
  const leaderModel = LeaderSelectModel.get();
  const flowContext = useScreenFlowContext();
  const numUnlockedCivs = createMemo(() => model.civs.filter((c) => !c.isLocked).length);
  const civRecommendations = createMemo(() => [...choiceModel.historicalCivs(), ...choiceModel.recommendedCivs()].filter((c) => c.apexAge == ageModel.nextAge.type && !c.isLocked));
  function selectCiv(civ) {
    if (!civ.isLocked) {
      model.setSelectedCiv(civ);
    }
    model.setViewCiv(civ);
    flowContext.activate("civ-select");
  }
  const leaderIcon = createMemo(() => leaderModel.selectedLeader().icon);
  return createComponent(VSlot, {
    "class": "civ-choice-card-panel img-unit-panelbox ml-6 flex flex-col relative ",
    get children() {
      return createComponent(AudioContextProvider, {
        segment: "AgeTransition",
        get children() {
          return [(() => {
            var _el$34 = _tmpl$15();
            insert(_el$34, createComponent(Show, {
              get when() {
                return civRecommendations().length > 0;
              },
              get children() {
                var _el$35 = _tmpl$14(), _el$36 = _el$35.firstChild, _el$37 = _el$36.firstChild, _el$38 = _el$37.nextSibling;
                _el$36.style.setProperty("color", "#FFFFFF");
                insert(_el$37, createComponent(L10n.Compose, {
                  text: "LOC_UI_AGE_TRANSITION_RECOMMENDED_CIVILIZATIONS"
                }));
                insert(_el$38, createComponent(L10n.Compose, {
                  text: "LOC_UI_AGE_TRANSITION_FOR_LEADER",
                  get args() {
                    return [leaderModel.selectedLeader().rawName];
                  }
                }));
                insert(_el$35, createComponent(ScrollArea, {
                  "class": "flex-auto -mr-8",
                  reserveSpace: true,
                  useProxy: true,
                  get children() {
                    var _el$39 = _tmpl$13();
                    insert(_el$39, createComponent(For, {
                      get each() {
                        return civRecommendations();
                      },
                      children: (civ) => createComponent(Tooltip, {
                        get children() {
                          return [createComponent(Tooltip.Trigger, {
                            get children() {
                              return createComponent(Tab.Trigger, {
                                name: "civ-details",
                                get children() {
                                  return createComponent(Activatable, {
                                    "class": "group",
                                    onActivate: () => selectCiv(civ),
                                    get children() {
                                      return createComponent(CivChoiceCivCard, {
                                        get name() {
                                          return civ.name;
                                        },
                                        get icon() {
                                          return civ.icon;
                                        },
                                        get desc() {
                                          return choiceModel.forLeader().get(civ.civID)?.reason ?? "";
                                        },
                                        get bg() {
                                          return civ.bgImage;
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          }), createComponent(Tooltip.Content, {
                            get children() {
                              return createComponent(CivTooltip, {
                                civ,
                                isRecommended: true,
                                get leaderIcon() {
                                  return leaderIcon();
                                }
                              });
                            }
                          })];
                        }
                      })
                    }));
                    return _el$39;
                  }
                }), null);
                return _el$35;
              }
            }));
            return _el$34;
          })(), (() => {
            var _el$40 = _tmpl$16(), _el$41 = _el$40.firstChild, _el$42 = _el$41.nextSibling, _el$43 = _el$42.firstChild, _el$44 = _el$43.nextSibling, _el$45 = _el$44.firstChild;
            insert(_el$43, createComponent(L10n.Compose, {
              text: "LOC_UI_AGE_TRANSITION_NEW_CIV_SELECTION"
            }));
            insert(_el$45, createComponent(L10n.Compose, {
              text: "LOC_UI_AGE_TRANSITION_RECOMMENDED_CIVILIZATIONS",
              get args() {
                return [numUnlockedCivs() - 1];
              }
            }));
            insert(_el$40, createComponent(Tab.Trigger, {
              name: "civ-select",
              get children() {
                return createComponent(Button, {
                  "class": "civ-choice-card-button mb-6",
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_UI_AGE_TRANSITION_VIEW_CIVS"
                    });
                  }
                });
              }
            }), null);
            return _el$40;
          })(), _tmpl$9(), (() => {
            var _el$47 = _tmpl$10(), _el$48 = _el$47.firstChild, _el$49 = _el$48.firstChild, _el$50 = _el$49.nextSibling;
            insert(_el$50, createComponent(Icon, {
              get name() {
                return leaderIcon();
              },
              "class": "civ-choice-card-leader"
            }));
            return _el$47;
          })()];
        }
      });
    }
  });
};
const CivChoiceChangeCivCard = ComponentRegistry.register({
  name: "CivChoiceChangeCivCard",
  createInstance: CivChoiceChangeCivCardComponent
});
const CivChoiceScreenComponent = () => {
  return createComponent(CreateGameStage, {
    get mode() {
      return CreateGameStageMode.None;
    },
    get header() {
      return createComponent(CreateGameStageHeader, {
        get showSteps() {
          return createMemo(() => !!!(ViewExperience() == UIViewExperience.Handheld))() && !UI.isInGame();
        },
        title: "LOC_UI_CREATE_GAME_CIVILIZATION_SELECT",
        hideButtonText: "LOC_UI_AGE_TRANSITION_VIEW_MAP"
      });
    },
    hideLowerHeaderFiligree: true,
    get children() {
      return createComponent(HSlot, {
        "class": "flex-auto relative flex flex-row items-center justify-center",
        get children() {
          return [createComponent(Tab.Trigger, {
            name: "memento-select",
            get children() {
              return createComponent(CivChoiceExistingCivCard, {});
            }
          }), createComponent(CivChoiceChangeCivCard, {})];
        }
      });
    }
  });
};
const AgeTransitionCivChoiceScreen = ComponentRegistry.register({
  name: "AgeTransitionCivChoiceScreen",
  createInstance: CivChoiceScreenComponent,
  styles: [style]
});

export { AgeTransitionCivChoiceScreen, CivChoiceChangeCivCard, CivChoiceChangeCivCardComponent, CivChoiceExistingCivCard };
//# sourceMappingURL=civ-choice-screen.js.map
