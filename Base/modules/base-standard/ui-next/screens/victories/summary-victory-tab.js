import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, onMount, onCleanup, createComponent, Show, For, splitProps, mergeProps, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { ProgressBar } from '../../../../core/ui-next/components/progress-bar.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { useIsSmallScreen, LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useVictoriesScreenContext } from './victories-screen-model.js';
import { VictoryRulesTooltip } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute left-12 -top-6 victories-header"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="w-full h-full self-center victories-summary-main flex flex-col shrink"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=flex-1></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div role=heading></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="victories-summary-header-lines promotion-header__lines self-center bg-cover bg-no-repeat pointer-events-none flex-auto"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="font-body text-2xs self-center mt-4 mx-6 h-16 opacity-60"><div role=heading></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="h-16 w-8"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="w-full px-4"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="relative h-7 w-full max-w-128 bg-contain bg-no-repeat pointer-events-none"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="size-10 -ml-1 -mt-12 mb-1 victories-trophy"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="font-title text-2xs text-secondary uppercase victories-countdown-title"role=heading></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="font-title text-2xs text-body uppercase"role=heading></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="victories-progress-bar relative mt-1"role=heading><div class="absolute -top-2 bottom-0 -ml-4 mt-1"role=heading></div></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div><div class="absolute top-2 left-2 rotate-180 size-4 bg-contain"></div><div class="absolute top-2 right-2 -rotate-90 size-4 bg-contain"></div><div class="absolute bottom-2 left-2 rotate-90 size-4 bg-contain"></div><div class="absolute bottom-2 right-2 size-4 bg-contain"></div><div class="absolute inset-0"></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="font-title-sm opacity-80 uppercase ml-1"role=heading></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="font-body-sm opacity-80"role=heading></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div><div class="victories-point-goal-line w-full justify-center mx-4"></div></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div data-name=Point-Goal-Panel></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class="font-body text-base"role=heading></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="img-popup-middle-decor size-16"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div class="absolute top-0 bottom-1 left-0 right-0 -ml-6 bg-no-repeat bg-cover"></div>`), _tmpl$23 = /* @__PURE__ */ template(`<div class="mr-2 self-center"></div>`), _tmpl$24 = /* @__PURE__ */ template(`<div class="flex flex-row">. </div>`), _tmpl$25 = /* @__PURE__ */ template(`<div><div class="flex flex-row">/</div></div>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="victories-trophy size-6"></div>`), _tmpl$27 = /* @__PURE__ */ template(`<div role=heading></div>`), _tmpl$28 = /* @__PURE__ */ template(`<div class="absolute inset-0 -top-1 bg-no-repeat bg-cover"></div>`), _tmpl$29 = /* @__PURE__ */ template(`<div class="font-title text-xs text-secondary uppercase self-center mt-2 mb-2"></div>`), _tmpl$30 = /* @__PURE__ */ template(`<div class="font-body text-xs text-white self-center justify-center mb-2 w-128"></div>`), _tmpl$31 = /* @__PURE__ */ template(`<div class=items-center><div class="font-title text-xs text-secondary uppercase self-center mb-4"></div></div>`);
const lockedTooltip = {
  descTitle: "LOC_VICTORY_LOCKED_TITLE",
  description: "LOC_VICTORY_LOCKED_BODY",
  currentVictoryName: "",
  currentVictoryMult: -1,
  currentVictoryPercent: -1,
  nextVictoryName: "",
  nextVictoryMult: -1,
  nextVictoryPercent: -1
};
const VictoriesSummary = () => {
  const model = useVictoriesScreenContext();
  const isSmallScreen = useIsSmallScreen();
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    hotkeyContext.registerNavtray("accept", "LOC_VICTORY_NAV_HELP_SUMMARY_ACCEPT");
    hotkeyContext.registerNavtray("shell-action-3", "LOC_VICTORY_NAV_HELP_RULES");
    model.tabNavStartup(hotkeyContext);
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("accept");
    hotkeyContext.unregisterNavtray("shell-action-3");
    model.tabNavShutdown(hotkeyContext);
  });
  return (() => {
    var _el$ = _tmpl$3();
    insert(_el$, createComponent(Show, {
      get when() {
        return !isSmallScreen();
      },
      get children() {
        var _el$2 = _tmpl$();
        insert(_el$2, createComponent(VSlot, {
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
        return _el$2;
      }
    }), null);
    insert(_el$, createComponent(ScrollArea, {
      "class": "h-full relative",
      useProxy: true,
      get children() {
        var _el$3 = _tmpl$2();
        insert(_el$3, createComponent(VSlot, {
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
        return _el$3;
      }
    }), null);
    return _el$;
  })();
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
      return createComponent(VictoryTooltip, mergeProps({
        "class": "victories-tooltip"
      }, () => props.goals.pointGoal != -1 ? props.goals.tooltipInfo : lockedTooltip, {
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
                var _el$4 = _tmpl$4();
                createRenderEffect(() => className(_el$4, `victories-summary-bg pointer-events-auto absolute inset-0 bg-no-repeat bg-cover opacity-40 ${props.summaryBg}`));
                return _el$4;
              })(), (() => {
                var _el$5 = _tmpl$4();
                insert(_el$5, createComponent(VSlot, {
                  "class": "w-full",
                  get children() {
                    return [(() => {
                      var _el$6 = _tmpl$5(), _el$7 = _el$6.firstChild;
                      insert(_el$7, createComponent(L10n.Compose, {
                        get text() {
                          return props.titleText;
                        }
                      }));
                      createRenderEffect(() => className(_el$6, `uppercase font-bold ${titleFontSizeClass} mt-6 ${props.titleColor}`));
                      return _el$6;
                    })(), _tmpl$6(), (() => {
                      var _el$9 = _tmpl$4();
                      createRenderEffect(() => className(_el$9, `self-center size-8 -mt-6 ${props.victoryLogo}`));
                      return _el$9;
                    })(), (() => {
                      var _el$10 = _tmpl$7(), _el$11 = _el$10.firstChild;
                      insert(_el$11, createComponent(L10n.Compose, {
                        get text() {
                          return props.description;
                        }
                      }));
                      return _el$10;
                    })(), createComponent(PointGoalPanel, mergeProps(() => props.goals, panelProps))];
                  }
                }), null);
                insert(_el$5, createComponent(Show, {
                  get when() {
                    return props.dominantPlayer.length == 1 && !isOneMoreTurn;
                  },
                  get children() {
                    return _tmpl$8();
                  }
                }), null);
                insert(_el$5, createComponent(Show, {
                  when: !isOneMoreTurn,
                  get children() {
                    return createComponent(For, {
                      get each() {
                        return props.dominantPlayer;
                      },
                      children: (player) => (() => {
                        var _el$13 = _tmpl$9();
                        insert(_el$13, createComponent(DominanceCountdownCard, player));
                        return _el$13;
                      })()
                    });
                  }
                }), null);
                return _el$5;
              })()];
            }
          });
        }
      }));
    }
  });
};
const DominanceCountdownCard = (props) => {
  return (() => {
    var _el$14 = _tmpl$15(), _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling, _el$17 = _el$16.nextSibling, _el$18 = _el$17.nextSibling, _el$19 = _el$18.nextSibling;
    _el$15.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$16.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$17.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$18.style.setProperty("background-image", "url(blp:mp_player_detail)");
    insert(_el$19, createComponent(VSlot, {
      "class": "w-full items-center",
      get children() {
        return [(() => {
          var _el$20 = _tmpl$10();
          _el$20.style.setProperty("background-image", "url(blp:cPromo_header)");
          return _el$20;
        })(), _tmpl$11(), (() => {
          var _el$22 = _tmpl$12();
          insert(_el$22, createComponent(L10n.Compose, {
            text: "LOC_VICTORY_PROGRESS_COUNTDOWN"
          }));
          return _el$22;
        })(), (() => {
          var _el$23 = _tmpl$13();
          insert(_el$23, createComponent(L10n.Compose, {
            text: "LOC_VICTORY_PROGRESS_TURNS_REMAINING",
            get args() {
              return [props.turns];
            }
          }));
          return _el$23;
        })(), (() => {
          var _el$24 = _tmpl$14(), _el$25 = _el$24.firstChild;
          insert(_el$24, createComponent(ProgressBar, {
            "class": "relative w-full ",
            get progressPercent() {
              return props.percent;
            }
          }), _el$25);
          insert(_el$25, createComponent(Tooltip.Text, {
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
          createRenderEffect((_$p) => (_$p = props.percent.toString() + "%") != null ? _el$25.style.setProperty("left", _$p) : _el$25.style.removeProperty("left"));
          return _el$24;
        })()];
      }
    }));
    createRenderEffect(() => className(_el$14, `relative img-base-ticket-bg-container self-center w-full px-4 min-h-32 mb-5 ${props.id == -1 ? "opacity-0" : ""}`));
    return _el$14;
  })();
};
const PointGoalPanel = (props) => {
  return (() => {
    var _el$26 = _tmpl$19();
    insert(_el$26, createComponent(VSlot, {
      "class": "px-4 w-full",
      disableFocus: true,
      get children() {
        return [(() => {
          var _el$27 = _tmpl$18(), _el$30 = _el$27.firstChild;
          insert(_el$27, createComponent(HSlot, {
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
                    var _el$28 = _tmpl$16();
                    insert(_el$28, createComponent(L10n.Compose, {
                      text: "LOC_VICTORY_PROGRESS_POINT_GOAL"
                    }));
                    return _el$28;
                  })(), createComponent(Show, {
                    get when() {
                      return props.pointGoal != -1;
                    },
                    get fallback() {
                      return (() => {
                        var _el$31 = _tmpl$20();
                        insert(_el$31, createComponent(Tooltip.Text, {
                          get text() {
                            return Locale.stylize("LOC_VICTORY_NOVICTORIES_TOOLTIP");
                          },
                          children: "-"
                        }));
                        return _el$31;
                      })();
                    },
                    get children() {
                      var _el$29 = _tmpl$17();
                      insert(_el$29, () => Locale.toNumber(props.pointGoal));
                      return _el$29;
                    }
                  })];
                }
              })];
            }
          }), _el$30);
          return _el$27;
        })(), createComponent(For, {
          get each() {
            return props.leaderBoard;
          },
          children: (leader, index) => (() => {
            var _el$32 = _tmpl$18(), _el$44 = _el$32.firstChild;
            insert(_el$32, createComponent(Show, {
              get when() {
                return index() == 3;
              },
              get children() {
                return createComponent(HSlot, {
                  "class": "victories-point-goal-line w-full justify-center mx-4",
                  get children() {
                    return _tmpl$21();
                  }
                });
              }
            }), _el$44);
            insert(_el$32, createComponent(HSlot, {
              "class": "relative w-full",
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return leader.winner;
                  },
                  get children() {
                    var _el$34 = _tmpl$22();
                    _el$34.style.setProperty("background-image", "url(blp:victories_gold_banner)");
                    return _el$34;
                  }
                }), createComponent(HSlot, {
                  "class": "justify-between h-14 my-1 w-full",
                  get children() {
                    return createComponent(HSlot, {
                      "class": "w-full",
                      get children() {
                        return [(() => {
                          var _el$35 = _tmpl$23();
                          insert(_el$35, createComponent(PortraitIcon, {
                            get playerId() {
                              return leader.hasMet ? leader.id : PlayerIds.NO_PLAYER;
                            },
                            size: 12
                          }));
                          return _el$35;
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
                                      var _el$36 = _tmpl$24(), _el$37 = _el$36.firstChild;
                                      insert(_el$36, () => leader.place, _el$37);
                                      return _el$36;
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
                                          var _el$38 = _tmpl$25(), _el$39 = _el$38.firstChild, _el$40 = _el$39.firstChild;
                                          insert(_el$39, () => leader.turnsProgress, _el$40);
                                          insert(_el$39, () => leader.turnsTotal, null);
                                          createRenderEffect(() => className(_el$38, `flex flex-col self-center ${leader.id == GameContext.localPlayerID ? "" : " opacity-60"}`));
                                          return _el$38;
                                        })(), _tmpl$26()];
                                      }
                                    });
                                  }
                                })];
                              }
                            }), (() => {
                              var _el$42 = _tmpl$27();
                              insert(_el$42, () => Locale.toNumber(leader.points));
                              createRenderEffect(() => className(_el$42, `font-body text-2xs self-center mr-2 ${leader.id == GameContext.localPlayerID ? "" : "opacity-60"}`));
                              return _el$42;
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
                    var _el$43 = _tmpl$28();
                    _el$43.style.setProperty("background-image", "url(blp:victories_gold_lines)");
                    return _el$43;
                  }
                })];
              }
            }), _el$44);
            return _el$32;
          })()
        })];
      }
    }));
    createRenderEffect(() => className(_el$26, `${props.class}`));
    return _el$26;
  })();
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
              var _el$45 = _tmpl$31(), _el$46 = _el$45.firstChild;
              insert(_el$46, createComponent(L10n.Compose, {
                text: "LOC_VICTORY_TOOLTIP_TITLE"
              }));
              insert(_el$45, createComponent(CardFrame, {
                "class": "mb-4",
                get children() {
                  return [(() => {
                    var _el$47 = _tmpl$29();
                    insert(_el$47, createComponent(L10n.Compose, {
                      get text() {
                        return props.descTitle;
                      }
                    }));
                    return _el$47;
                  })(), (() => {
                    var _el$48 = _tmpl$30();
                    insert(_el$48, createComponent(L10n.Compose, {
                      get text() {
                        return props.description;
                      }
                    }));
                    return _el$48;
                  })()];
                }
              }), null);
              insert(_el$45, createComponent(Show, {
                get when() {
                  return props.currentVictoryPercent != -1;
                },
                get children() {
                  return createComponent(CardFrame, {
                    "class": "mb-4",
                    get children() {
                      return [(() => {
                        var _el$49 = _tmpl$29();
                        insert(_el$49, createComponent(L10n.Compose, {
                          get text() {
                            return props.currentVictoryName;
                          }
                        }));
                        return _el$49;
                      })(), (() => {
                        var _el$50 = _tmpl$30();
                        insert(_el$50, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_REQUIREMENTS",
                          get args() {
                            return [props.currentVictoryMult, props.currentVictoryPercent];
                          }
                        }));
                        return _el$50;
                      })()];
                    }
                  });
                }
              }), null);
              insert(_el$45, createComponent(Show, {
                get when() {
                  return props.nextVictoryPercent != -1;
                },
                get children() {
                  return createComponent(CardFrame, {
                    "class": "mb-4",
                    get children() {
                      return [(() => {
                        var _el$51 = _tmpl$29();
                        insert(_el$51, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_NEXT",
                          get args() {
                            return [props.nextVictoryName];
                          }
                        }));
                        return _el$51;
                      })(), (() => {
                        var _el$52 = _tmpl$30();
                        insert(_el$52, createComponent(L10n.Compose, {
                          text: "LOC_VICTORY_TOOLTIP_REQUIREMENTS",
                          get args() {
                            return [props.nextVictoryMult, props.nextVictoryPercent];
                          }
                        }));
                        return _el$52;
                      })()];
                    }
                  });
                }
              }), null);
              return _el$45;
            }
          });
        }
      })];
    }
  });
};

export { VictoriesSummary, VictoryTooltip };
//# sourceMappingURL=summary-victory-tab.js.map
