import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { mergeProps, createComponent, createMemo, Show, createRenderEffect, untrack, splitProps, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useIsSmallScreen } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { LeaderWithRibbon } from '../../components/leader-with-ribbon.js';
import { useVictoriesScreenContext, VictoryTabType } from './victories-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute -top-14 victories-header"><div class="font-body text-body text-xs self-center"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=self-center></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="victories-military-col-4 font-title text-xl text-white flex flex-row"><div class="h-full w-2"></div><div class="flex-1 self-center"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="victories-military-col-3 font-title text-sm uppercase flex flex-row"><div class="w-full self-center"><div class="self-start ml-2"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row absolute -mt-6 ml-2 w-full victories-point-goal-line"><div><div role=heading></div></div><div class="flex flex-row"><div class=self-center></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="w-full h-4"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-col"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class=self-center>-</div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="victories-military-col-3 font-title text-sm"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex flex-row victories-military-bottom-line h-14 w-full"><div class="victories-military-col-1 font-title text-sm fxs-header uppercase self-center"><div></div></div><div class="victories-military-col-2 self-center"></div><div class="victories-military-col-4 flex flex-row"><div class="w-full font-title text-sm fxs-header uppercase flex flex-row"><div class="self-center w-full text-center font-fit-shrink"></div></div></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class=text-white></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class=text-body></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class=text-negative></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-row"><div><div></div></div><div></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div><div class="h-full w-2"></div><div class="self-center flex-1"><div class="font-title bold text-xl self-center text-white"></div></div></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class=items-center><div></div><div class="font-title text-xs text-secondary uppercase self-center"></div><div class="font-body text-xs text-primary self-center mb-4"></div></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="w-full h-3"></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="relative mx-4 victories-tooltip-divider"></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class=victories-tooltip-spreadsheet-player-id-block role=heading></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="w-full h-2"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div><div class="font-title-sm uppercase self-center fxs-header mb-2"></div></div>`);
const VictoryTabBase = (props) => {
  const isSmallScreen = useIsSmallScreen();
  const mergedProps = mergeProps({
    showPointsNeeded: true
  }, props);
  return createComponent(VSlot, {
    get name() {
      return Locale.compose(props.title);
    },
    "class": "relative bg-cover bg-no-repeat h-full flex flex-col items-center w-full",
    get style() {
      return {
        "background-image": `url(${props.background})`
      };
    },
    get children() {
      return [createComponent(Show, {
        get when() {
          return !isSmallScreen();
        },
        get children() {
          var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
          insert(_el$2, createComponent(L10n.Compose, {
            get text() {
              return props.header;
            }
          }));
          return _el$;
        }
      }), (() => {
        var _el$3 = _tmpl$5(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$13 = _el$4.nextSibling, _el$14 = _el$13.firstChild;
        insert(_el$5, createComponent(L10n.Compose, {
          get text() {
            return props.title;
          }
        }));
        insert(_el$3, createComponent(Show, {
          get when() {
            return mergedProps.showPointsNeeded;
          },
          get fallback() {
            return props.alternatePointsContent;
          },
          get children() {
            return [(() => {
              var _el$6 = _tmpl$3(), _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling;
              insert(_el$8, createComponent(Show, {
                get when() {
                  return props.targetScore != -1;
                },
                get fallback() {
                  return createComponent(Tooltip.Text, {
                    get text() {
                      return Locale.stylize("LOC_VICTORY_NOVICTORIES_TOOLTIP");
                    },
                    get children() {
                      return _tmpl$8();
                    }
                  });
                },
                get children() {
                  var _el$9 = _tmpl$2();
                  insert(_el$9, () => Locale.toNumber(props.targetScore));
                  return _el$9;
                }
              }));
              return _el$6;
            })(), (() => {
              var _el$10 = _tmpl$4(), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild;
              insert(_el$12, createComponent(L10n.Compose, {
                get text() {
                  return props.pointsNeededText ?? "LOC_VICTORY_POINTS_NEEDED_TO_WIN";
                }
              }));
              return _el$10;
            })()];
          }
        }), _el$13);
        insert(_el$14, createComponent(VictoryRulesTooltip, {
          get initialHPosition() {
            return TooltipHorizontalPosition.LEFT;
          },
          get initialVPosition() {
            return TooltipVerticalPosition.TOP;
          },
          "class": "self-center",
          get tooltipText() {
            return props.rules;
          },
          get titleText() {
            return props.title;
          },
          get titleClass() {
            return props.titleColorClass;
          }
        }));
        createRenderEffect(() => className(_el$4, `victories-military-cols-1-and-2 font-title uppercase font-bold ${props.titleColorClass} ${!isSmallScreen() ? "text-lg" : "text-2xl"}`));
        return _el$3;
      })(), _tmpl$6(), createMemo(() => props.preScrollContent), createComponent(ScrollArea, {
        "class": "shrink mb-2 flex-auto w-full",
        useProxy: true,
        reserveSpace: true,
        get children() {
          var _el$16 = _tmpl$7();
          insert(_el$16, () => props.children);
          return _el$16;
        }
      })];
    }
  });
};
const VictoryHeader = (props) => {
  const mergedProps = mergeProps({
    showDividersAroundChildren: true,
    childContainerPosition: "center"
  }, props);
  return (() => {
    var _el$18 = _tmpl$10(), _el$19 = _el$18.firstChild, _el$20 = _el$19.firstChild, _el$21 = _el$19.nextSibling, _el$22 = _el$21.nextSibling, _el$23 = _el$22.firstChild, _el$24 = _el$23.firstChild;
    insert(_el$20, createComponent(L10n.Compose, {
      text: "LOC_GENERIC_RANK"
    }));
    insert(_el$24, createComponent(L10n.Compose, {
      text: "LOC_GENERIC_SCORE"
    }));
    insert(_el$18, createComponent(Show, {
      get when() {
        return !props.skipContentColumn;
      },
      get children() {
        var _el$25 = _tmpl$9();
        insert(_el$25, () => props.children);
        createRenderEffect((_p$) => {
          var _v$ = !!(mergedProps.showDividersAroundChildren && !mergedProps.hideContentColumnDivider), _v$2 = !!(mergedProps.childContainerPosition === "end");
          _v$ !== _p$.e && _el$25.classList.toggle("victories-military-left-line-header", _p$.e = _v$);
          _v$2 !== _p$.t && _el$25.classList.toggle("self-end", _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$25;
      }
    }), null);
    createRenderEffect(() => _el$22.classList.toggle("victories-military-left-line-header", !!mergedProps.showDividersAroundChildren));
    return _el$18;
  })();
};
const VictoryRowPlayerDisplay = (props) => {
  const ctx = useVictoriesScreenContext();
  const onMouseEnter = () => {
    ctx.highlightPlayer(props.playerInfo.playerId, props.rowType);
  };
  const onMouseLeave = () => {
    ctx.unHighlightPlayer(props.playerInfo.playerId, props.rowType);
  };
  const onFocus = () => {
    ctx.focusPlayer(props.playerInfo.playerId, props.rowType);
  };
  const onBlur = () => {
    ctx.unFocusPlayer(props.playerInfo.playerId, props.rowType);
  };
  const columnClass = untrack(() => `victories-${props.columnClassOverride ?? "military"}`);
  return createComponent(Activatable, {
    get ["class"]() {
      return `${columnClass}-cols-1-and-2 victories-row-${props.rowId} relative flex flex-row`;
    },
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    get autoFocus() {
      return props.rowId == 0;
    },
    onActivate: () => props.activateInfo?.(props.playerInfo.playerId),
    audioComponentAlias: "PlayerRow",
    get children() {
      return [(() => {
        var _el$26 = _tmpl$11();
        _el$26.style.setProperty("transition-property", "opacity");
        createRenderEffect((_p$) => {
          var _v$3 = `absolute inset-0 bg-cover bg-no-repeat duration-150 ease-out ${props.playerInfo.highlighted() || props.playerInfo.focused() ? "opacity-60" : "opacity-30"}`, _v$4 = `url(blp:${props.playerInfo.playerIsMet ? props.playerInfo.playerBanner : "bn_deluxe"})`;
          _v$3 !== _p$.e && className(_el$26, _p$.e = _v$3);
          _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$26.style.setProperty("background-image", _v$4) : _el$26.style.removeProperty("background-image"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$26;
      })(), (() => {
        var _el$27 = _tmpl$15(), _el$28 = _el$27.firstChild, _el$29 = _el$28.firstChild, _el$30 = _el$28.nextSibling;
        className(_el$28, `flex flex-row ${columnClass}-col-1 justify-center`);
        insert(_el$29, () => props.rowId);
        className(_el$30, `relative ${columnClass}-col-2 victories-military-left-line`);
        insert(_el$30, createComponent(HSlot, {
          get children() {
            return [(() => {
              var _el$31 = _tmpl$11();
              insert(_el$31, createComponent(LeaderWithRibbon, {
                get leaderId() {
                  return props.playerInfo.playerIsMet ? props.playerInfo.playerId : PlayerIds.NO_PLAYER;
                },
                size: 28,
                omitFullRibbon: true,
                get omitRelationshipIcon() {
                  return props.playerInfo.playerId == GameContext.localPlayerID || !props.showRelationships;
                }
              }));
              createRenderEffect(() => className(_el$31, props.playerInfo.playerId == GameContext.localPlayerID ? "mt-2 mx-2" : "mx-2"));
              return _el$31;
            })(), createComponent(VSlot, {
              "class": "victories-military-player-vslot mt-7 flex-1",
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return Configuration.getGame().isAnyMultiplayer && props.playerInfo.playerName[0] == "[";
                  },
                  get fallback() {
                    return (() => {
                      var _el$36 = _tmpl$12();
                      insert(_el$36, createComponent(L10n.Stylize, {
                        get text() {
                          return `${Locale.compose(props.playerInfo.playerIsMet ? props.playerInfo.playerName : "LOC_UI_UNMET_PLAYER_NAME")} ${Locale.compose(props.playerInfo.playerId == GameContext.localPlayerID ? "LOC_UI_RANKINGS_YOU" : "")}`;
                        }
                      }));
                      return _el$36;
                    })();
                  },
                  get children() {
                    return [(() => {
                      var _el$32 = _tmpl$12();
                      insert(_el$32, createComponent(L10n.Stylize, {
                        get text() {
                          return `${Locale.compose(props.playerInfo.playerIsMet ? props.playerInfo.leaderName : "LOC_UI_UNMET_PLAYER_NAME")}  ${Locale.compose(props.playerInfo.playerId == GameContext.localPlayerID ? "LOC_UI_RANKINGS_YOU" : "")}`;
                        }
                      }));
                      return _el$32;
                    })(), (() => {
                      var _el$33 = _tmpl$12();
                      insert(_el$33, createComponent(L10n.Stylize, {
                        get text() {
                          return `${Locale.compose(props.playerInfo.playerIsMet ? props.playerInfo.playerName : "")}`;
                        }
                      }));
                      return _el$33;
                    })()];
                  }
                }), (() => {
                  var _el$34 = _tmpl$13();
                  insert(_el$34, createComponent(L10n.Compose, {
                    get text() {
                      return props.playerInfo.govType;
                    }
                  }));
                  return _el$34;
                })(), createComponent(Show, {
                  get when() {
                    return props.playerInfo.playerAtWarWith;
                  },
                  get children() {
                    var _el$35 = _tmpl$14();
                    insert(_el$35, createComponent(L10n.Compose, {
                      text: "LOC_TRADE_LENS_ROUTE_TYPE_WAR"
                    }));
                    return _el$35;
                  }
                })];
              }
            })];
          }
        }));
        createRenderEffect(() => className(_el$29, `self-center ${props.playerInfo.playerId == GameContext.localPlayerID ? "text-white" : ""}`));
        return _el$27;
      })()];
    }
  });
};
const VictoryRow = (props) => {
  const mergedProps = mergeProps({
    showTooltip: true
  }, props);
  const [playerDisplayProps] = splitProps(props, ["rowType", "playerInfo", "rowId", "class", "columnClassOverride", "activateInfo"]);
  const columnClass = (
    // this is not used reactively so we don't need the warning
    // eslint-disable-next-line solid/reactivity
    props.columnClassOverride != void 0 ? `victories-${props.columnClassOverride}` : "victories-military"
  );
  const showRelationships = props.rowType == VictoryTabType.Military;
  return createComponent(HSlot, {
    get ["class"]() {
      return `pointer-events-auto min-h-32 ${props.class} ${props.omitBottomLine ? "" : "victories-military-bottom-line"}`;
    },
    get children() {
      return [createComponent(Show, {
        get when() {
          return mergedProps.showTooltip;
        },
        get fallback() {
          return createComponent(VictoryRowPlayerDisplay, mergeProps(playerDisplayProps, {
            showRelationships
          }));
        },
        get children() {
          return createComponent(SpreadsheetTooltip, {
            get data() {
              return props.playerInfo.spreadsheet;
            },
            get children() {
              return createComponent(VictoryRowPlayerDisplay, mergeProps(playerDisplayProps, {
                showRelationships
              }));
            }
          });
        }
      }), (() => {
        var _el$37 = _tmpl$16(), _el$38 = _el$37.firstChild, _el$39 = _el$38.nextSibling, _el$40 = _el$39.firstChild;
        className(_el$37, `flex flex-row ${columnClass}-col-4`);
        insert(_el$40, () => Locale.toNumber(props.playerInfo.score));
        createRenderEffect((_p$) => {
          var _v$5 = props.playerInfo.scoreColor, _v$6 = !!props.playerInfo.dimScore();
          _v$5 !== _p$.e && ((_p$.e = _v$5) != null ? _el$38.style.setProperty("background-color", _v$5) : _el$38.style.removeProperty("background-color"));
          _v$6 !== _p$.t && _el$39.classList.toggle("opacity-30", _p$.t = _v$6);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$37;
      })(), createComponent(Show, {
        get when() {
          return !props.skipContentColumn;
        },
        get fallback() {
          return createComponent(Show, {
            get when() {
              return props.skippedFirstContent;
            },
            get children() {
              return createComponent(HSlot, {
                "class": `${columnClass}-col-3 h-full flex-wrap relative}`,
                get children() {
                  return props.skippedFirstContent;
                }
              });
            }
          });
        },
        get children() {
          return createComponent(HSlot, {
            get ["class"]() {
              return `${columnClass}-col-3 flex-wrap relative  ${props.divider ? "victories-military-left-line" : ""}`;
            },
            get children() {
              return props.children;
            }
          });
        }
      })];
    }
  });
};
const VictoryRulesTooltip = (props) => {
  const model = useVictoriesScreenContext();
  return createComponent(Tooltip, {
    get initialHPosition() {
      return props.initialHPosition;
    },
    get initialVPosition() {
      return props.initialVPosition;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return createComponent(Activatable, {
            get ["class"]() {
              return `size-${props.size ?? 8} bg-no-repeat bg-cover`;
            },
            style: {
              "background-image": "url(blp:icon_info)"
            },
            get disableFocus() {
              return props.disableFocus ? props.disableFocus : !model.tooltipToggle;
            },
            get autoFocus() {
              return model.tooltipToggle;
            }
          });
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              var _el$41 = _tmpl$17(), _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling, _el$44 = _el$43.nextSibling;
              insert(_el$42, createComponent(L10n.Compose, {
                get text() {
                  return props.titleText;
                }
              }));
              insert(_el$43, createComponent(L10n.Compose, {
                text: "LOC_VICTORY_RULES_TOOLTIP_TITLE"
              }));
              insert(_el$44, createComponent(L10n.Compose, {
                text: "LOC_VICTORY_RULES_TOOLTIP_POINTS"
              }));
              insert(_el$41, createComponent(CardFrame, {
                "class": "mb-4 max-w-192",
                get children() {
                  return createComponent(L10n.Stylize, {
                    "class": "mx-4 my-4",
                    get text() {
                      return props.tooltipText;
                    }
                  });
                }
              }), null);
              createRenderEffect(() => className(_el$42, `font-title text-xs uppercase self-center ${props.titleClass}`));
              return _el$41;
            }
          });
        }
      })];
    }
  });
};
const SpreadsheetTooltip = (props) => {
  const [local, _other] = splitProps(props, ["children", "class"]);
  return createComponent(Tooltip, {
    get initialHPosition() {
      return TooltipHorizontalPosition.CENTER;
    },
    get initialVPosition() {
      return TooltipVerticalPosition.TOP;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Show, {
        get when() {
          return props.data.metPlayer;
        },
        get children() {
          return createComponent(Tooltip.Content, {
            get ["class"]() {
              return local.class;
            },
            get children() {
              return createComponent(Tooltip.Frame, {
                get children() {
                  var _el$45 = _tmpl$22(), _el$46 = _el$45.firstChild;
                  insert(_el$46, createComponent(L10n.Compose, {
                    get text() {
                      return props.data.title ? props.data.title : "";
                    }
                  }));
                  insert(_el$45, createComponent(CardFrame, {
                    "class": "mb-4",
                    get children() {
                      return [_tmpl$18(), createComponent(For, {
                        get each() {
                          return props.data.items;
                        },
                        children: (sheetItem, index) => createComponent(VSlot, {
                          get children() {
                            return [createComponent(Show, {
                              get when() {
                                return index() > 0;
                              },
                              get children() {
                                return _tmpl$19();
                              }
                            }), createComponent(HSlot, {
                              "class": "victories-tooltip-spreadsheet-row min-h-8 font-body text-xs text-body ml-4 mr-4 justify-between",
                              get children() {
                                return [(() => {
                                  var _el$56 = _tmpl$20();
                                  insert(_el$56, createComponent(L10n.Compose, {
                                    get text() {
                                      return sheetItem.name;
                                    }
                                  }));
                                  return _el$56;
                                })(), (() => {
                                  var _el$57 = _tmpl$11();
                                  insert(_el$57, () => Locale.toNumber(sheetItem.points));
                                  return _el$57;
                                })()];
                              }
                            })];
                          }
                        })
                      }), createComponent(Show, {
                        get when() {
                          return props.data.showTotal;
                        },
                        get children() {
                          return createComponent(VSlot, {
                            get children() {
                              return [_tmpl$19(), createComponent(HSlot, {
                                "class": "victories-tooltip-spreadsheet-row min-h-8 font-title-sm uppercase fxs-header mx-4 justify-between",
                                get children() {
                                  return [(() => {
                                    var _el$49 = _tmpl$20();
                                    insert(_el$49, createComponent(L10n.Compose, {
                                      text: "LOC_VICTORIES_TOOLTIP_TOTAL"
                                    }));
                                    return _el$49;
                                  })(), (() => {
                                    var _el$50 = _tmpl$11();
                                    insert(_el$50, () => Locale.toNumber(props.data.points));
                                    return _el$50;
                                  })()];
                                }
                              })];
                            }
                          });
                        }
                      })];
                    }
                  }), null);
                  insert(_el$45, createComponent(Show, {
                    get when() {
                      return props.data.showTotal;
                    },
                    get children() {
                      return createComponent(CardFrame, {
                        "class": "mb-4",
                        get children() {
                          return [_tmpl$21(), createComponent(HSlot, {
                            "class": "victories-tooltip-spreadsheet-row min-h-8 font-body text-xs text-body ml-4 mr-4 justify-between",
                            get children() {
                              return [(() => {
                                var _el$52 = _tmpl$20();
                                insert(_el$52, createComponent(L10n.Compose, {
                                  text: "LOC_VICTORIES_TOOLTIP_LAST_TURN"
                                }));
                                return _el$52;
                              })(), createComponent(HSlot, {
                                get children() {
                                  return [(() => {
                                    var _el$53 = _tmpl$11();
                                    insert(_el$53, () => props.data.lastTurnDelta > 0 ? "+" : "");
                                    return _el$53;
                                  })(), (() => {
                                    var _el$54 = _tmpl$11();
                                    insert(_el$54, () => Locale.toNumber(props.data.lastTurnDelta));
                                    return _el$54;
                                  })()];
                                }
                              })];
                            }
                          })];
                        }
                      });
                    }
                  }), null);
                  createRenderEffect(() => className(_el$45, `items-center ${props.data.metPlayer ? "mb-4" : ""}`));
                  return _el$45;
                }
              });
            }
          });
        }
      })];
    }
  });
};

export { SpreadsheetTooltip, VictoryHeader, VictoryRow, VictoryRulesTooltip, VictoryTabBase };
//# sourceMappingURL=victory-tab-base.js.map
