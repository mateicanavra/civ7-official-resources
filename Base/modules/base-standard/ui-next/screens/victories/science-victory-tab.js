import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, createSignal, createMemo, mergeProps, createRenderEffect, Show, For, Switch, Match, useContext, onMount, onCleanup, createEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { VSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { useVictoriesScreenContext, VictoryTabType, LaunchpadStatus } from './victories-screen-model.js';
import { VictoryCountdownBar } from './victory-countdown-bar.js';
import { VictoryTabBase, VictoryRow, VictoryHeader } from './victory-tab-base.js';
import { ScienceVictoryItemTooltip } from '../../tooltips/science-victory-item-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col items-center w-1 text-accent"><div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="size-6 bg-center bg-contain bg-no-repeat"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute size-6 bg-center bg-contain bg-no-repeat"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute size-6 -translate-x-1\\/2"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="h-12 w-18 -right-1 z-1 absolute pointer-events-none"><div class="size-full bg-center bg-contain bg-no-repeat absolute duration-150 ease-out"></div><div class="size-full bg-center bg-contain bg-no-repeat absolute duration-150 ease-out"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex-auto flex flex-row relative"><div class="flex flex-row absolute inset-0"><div class="flex flex-col justify-center"></div></div><div class=" flex flex-row items-center relative"><div class="flex-auto h-8"></div></div><div class="flex flex-row absolute inset-0 items-center"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex-auto flex flex-col justify-center"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="relative size-full"><div class="size-full bg-center bg-contain bg-no-repeat absolute"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex flex-col items-center justify-center"><div class=size-14></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex-1 font-body text-lg text-white flex flex-col mb-2 items-end"><div class="mr-2 w-full"><div class="uppercase font-title text-lg self-end"></div><div class=self-end></div></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-row"><div class="flex-auto flex flex-row self-end"><div class=w-22></div><div class=w-22></div><div class=w-9></div></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="relative flex flex-col self-start items-center w-full"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class=flex-auto></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex-auto flex flex-row h-32"><div class="flex flex-col justify-center"></div><div class=w-22></div></div>`);
const PointMarkerComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$2, () => props.points);
    insert(_el$, createComponent(Divider.Vertical, {
      length: "2"
    }), null);
    return _el$;
  })();
};
const PointsBarItem = (props) => {
  const model = useVictoriesScreenContext();
  const [starHighlighted, setStarHighlighted] = createSignal(false);
  const starScale = createMemo(() => {
    if (props.starInfo.pointsValue < 5) {
      return 0.5;
    }
    if (props.starInfo.pointsValue < 10) {
      return props.starInfo.pointsValue / 10;
    }
    return 1;
  });
  const getScale = () => {
    return props.playerHighlighted ? 1.5 : 1;
  };
  return (() => {
    var _el$3 = _tmpl$4();
    insert(_el$3, createComponent(ScienceVictoryItemTooltip, mergeProps(() => props.starInfo, {
      get children() {
        return createComponent(Activatable, {
          "class": "duration-150 ease-out",
          get classList() {
            return {
              "opacity-70": props.anyStarHighlighted() && !starHighlighted()
            };
          },
          get style() {
            return {
              transform: `scale(${getScale()})`,
              "transition-property": "transform, opacity"
            };
          },
          onMouseEnter: () => {
            setStarHighlighted(true);
            props.setAnyStarHighlighted(true);
          },
          onMouseLeave: () => {
            setStarHighlighted(false);
            props.setAnyStarHighlighted(false);
          },
          onFocus: () => {
            setStarHighlighted(true);
            props.setAnyStarHighlighted(true);
            model.focusPlayer(props.playerId, VictoryTabType.Scientific);
          },
          onBlur: () => {
            setStarHighlighted(false);
            props.setAnyStarHighlighted(false);
            model.unFocusPlayer(props.playerId, VictoryTabType.Scientific);
          },
          get children() {
            return [(() => {
              var _el$4 = _tmpl$2();
              _el$4.style.setProperty("background-image", "url(blp:victory_science_star01)");
              createRenderEffect((_$p) => (_$p = `scale(${starScale()})`) != null ? _el$4.style.setProperty("transform", _$p) : _el$4.style.removeProperty("transform"));
              return _el$4;
            })(), createComponent(Show, {
              get when() {
                return props.starInfo.pointsValue >= 10;
              },
              get children() {
                var _el$5 = _tmpl$3();
                _el$5.style.setProperty("background-image", "url(blp:victory_science_star02)");
                return _el$5;
              }
            })];
          }
        });
      }
    })));
    createRenderEffect((_$p) => (_$p = `${Math.min(100, props.starInfo.accumulatedPoints)}%`) != null ? _el$3.style.setProperty("left", _$p) : _el$3.style.removeProperty("left"));
    return _el$3;
  })();
};
const PointsBarComponent = (props) => {
  const model = useVictoriesScreenContext();
  const [anyStarHighlighted, setAnyStarHighlighted] = createSignal(false);
  const barPercent = createMemo(() => {
    const launchpadStatus = props.playerDetail.launchpadStatus.status;
    if (props.playerDetail.playerInfo.score >= 100 && launchpadStatus !== LaunchpadStatus.Built && launchpadStatus !== LaunchpadStatus.InUse) {
      return 99.9;
    }
    if (props.playerDetail.playerInfo.score > model.data.scienceDetails.targetScore) {
      return 100;
    }
    if (model.data.scienceDetails.targetScore === 0) {
      return 0;
    }
    return Math.round(props.playerDetail.playerInfo.score / model.data.scienceDetails.targetScore * 100);
  });
  return (() => {
    var _el$6 = _tmpl$6(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$7.nextSibling, _el$10 = _el$9.firstChild, _el$14 = _el$9.nextSibling;
    insert(_el$7, createComponent(For, {
      get each() {
        return props.pointsSectionHeaders;
      },
      children: (_) => (() => {
        var _el$15 = _tmpl$7();
        insert(_el$15, createComponent(Divider.Vertical, {
          "class": "-translate-x-1\\/2",
          length: "3\\/4"
        }));
        return _el$15;
      })()
    }), _el$8);
    insert(_el$8, createComponent(Divider.Vertical, {
      "class": "-translate-x-1\\/2",
      length: "3\\/4",
      color: "white"
    }));
    insert(_el$9, createComponent(Show, {
      get when() {
        return barPercent() !== 100;
      },
      get children() {
        var _el$11 = _tmpl$5(), _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
        _el$12.style.setProperty("background-image", "url(blp:icon_victory_science_rocket)");
        _el$12.style.setProperty("transition-property", "fxs-background-image-tint");
        _el$13.style.setProperty("background-image", "url(blp:icon_victory_science_rocket_stroke)");
        _el$13.style.setProperty("transition-property", "opacity");
        createRenderEffect((_p$) => {
          var _v$ = props.playerDetail.playerInfo.highlighted() ? props.playerDetail.fadedRocketColor : props.playerDetail.rocketColor, _v$2 = !!props.playerDetail.playerInfo.highlighted();
          _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$12.style.setProperty("fxs-background-image-tint", _v$) : _el$12.style.removeProperty("fxs-background-image-tint"));
          _v$2 !== _p$.t && _el$13.classList.toggle("opacity-30", _p$.t = _v$2);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$11;
      }
    }), null);
    insert(_el$14, createComponent(For, {
      get each() {
        return props.playerDetail.starInfo;
      },
      children: (star) => createComponent(Show, {
        get when() {
          return star.accumulatedPoints < model.data.scienceDetails.targetScore;
        },
        get children() {
          return createComponent(PointsBarItem, {
            starInfo: star,
            get playerId() {
              return props.playerDetail.playerInfo.playerId;
            },
            anyStarHighlighted,
            setAnyStarHighlighted,
            get playerHighlighted() {
              return props.playerDetail.playerInfo.highlighted();
            }
          });
        }
      })
    }));
    createRenderEffect((_p$) => {
      var _v$3 = `${barPercent()}%`, _v$4 = !!(barPercent() < 100), _v$5 = props.playerDetail.barColor, _v$6 = barPercent() > 0 ? "solid 2px rgba(127, 127, 127, 0.5)" : "none";
      _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$9.style.setProperty("flex-basis", _v$3) : _el$9.style.removeProperty("flex-basis"));
      _v$4 !== _p$.t && _el$10.classList.toggle("mr-12", _p$.t = _v$4);
      _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$10.style.setProperty("background-color", _v$5) : _el$10.style.removeProperty("background-color"));
      _v$6 !== _p$.o && ((_p$.o = _v$6) != null ? _el$10.style.setProperty("border", _v$6) : _el$10.style.removeProperty("border"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
    return _el$6;
  })();
};
const LaunchpadDisplayComponent = (props) => {
  return (() => {
    var _el$16 = _tmpl$9(), _el$17 = _el$16.firstChild;
    insert(_el$17, createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.PreModern;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad01)",
              isUrl: true
            });
          }
        }), createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.NeedRocketry;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad02)",
              isUrl: true
            });
          }
        }), createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.NotBuilt;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad03)",
              isUrl: true
            });
          }
        }), createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.Built;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad04)",
              isUrl: true
            });
          }
        }), createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.InUse;
          },
          get children() {
            var _el$18 = _tmpl$8(), _el$19 = _el$18.firstChild;
            insert(_el$18, createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad04)",
              isUrl: true
            }), _el$19);
            _el$19.style.setProperty("background-image", "url(blp:victory_science_launchpad05)");
            insert(_el$18, createComponent(Icon, {
              "class": "size-full absolute",
              name: "url(blp:victory_science_launchpad05_stroke)",
              isUrl: true
            }), null);
            createRenderEffect((_$p) => (_$p = props.rocketColor) != null ? _el$19.style.setProperty("fxs-background-image-tint", _$p) : _el$19.style.removeProperty("fxs-background-image-tint"));
            return _el$18;
          }
        }), createComponent(Match, {
          get when() {
            return props.launchpadStatus.status === LaunchpadStatus.Damaged;
          },
          get children() {
            return createComponent(Icon, {
              "class": "size-full",
              name: "url(blp:victory_science_launchpad06)",
              isUrl: true
            });
          }
        })];
      }
    }));
    return _el$16;
  })();
};
const ScienceVictoryTabComponent = (props) => {
  const model = useVictoriesScreenContext();
  const victoryCountdownBarProps = createMemo(() => {
    const victoryBarPlayers = props.playerDetails.map((playerDetail) => ({
      playerInfo: playerDetail.playerInfo,
      countdownProgress: playerDetail.countdownProgress,
      launchpadDamaged: playerDetail.launchpadStatus.status === LaunchpadStatus.Damaged
    }));
    return {
      players: victoryBarPlayers,
      countdownDuration: props.countdownDuration
    };
  });
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    hotkeyContext.registerNavtray("shell-action-3", "LOC_VICTORY_NAV_HELP_RULES");
    model.tabNavStartup(hotkeyContext);
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("shell-action-3");
    model.tabNavShutdown(hotkeyContext);
  });
  const [isHighlightingAnyone, setIsHighlightingAnyone] = createSignal(false);
  createEffect(() => {
    setIsHighlightingAnyone(props.playerDetails.some((player) => {
      return player.playerInfo.highlighted();
    }));
  });
  function onFocus(playerId) {
    model.focusPlayer(playerId, VictoryTabType.Scientific);
  }
  function onBlur(playerId) {
    model.unFocusPlayer(playerId, VictoryTabType.Scientific);
  }
  return createComponent(VictoryTabBase, {
    get header() {
      return model.data.scienceDetails.headerText;
    },
    get titleColorClass() {
      return model.data.panels[3].titleColor;
    },
    get background() {
      return model.data.panels[3].background;
    },
    get targetScore() {
      return model.data.scienceDetails.targetScore;
    },
    title: "LOC_VICTORY_SCIENCE_MODERN_NAME",
    rules: "LOC_VICTORIES_RULES_SCIENTIFIC",
    pointsNeededText: "LOC_INNOVATION_POINTS_NEEDED_TO_WIN",
    get showPointsNeeded() {
      return model.data.scienceDetails.shortestRemainingCountdownDuration >= model.data.scienceDetails.countdownDuration;
    },
    get alternatePointsContent() {
      return (() => {
        var _el$20 = _tmpl$10(), _el$21 = _el$20.firstChild, _el$22 = _el$21.firstChild, _el$23 = _el$22.nextSibling;
        insert(_el$22, createComponent(L10n.Stylize, {
          text: "LOC_VICTORIES_COUNTDOWN_LABEL",
          get args() {
            return [model.data.scienceDetails.shortestRemainingCountdownDuration];
          }
        }));
        insert(_el$23, createComponent(VictoryCountdownBar, mergeProps(victoryCountdownBarProps)));
        return _el$20;
      })();
    },
    get preScrollContent() {
      return (() => {
        var _el$24 = _tmpl$12();
        insert(_el$24, createComponent(VictoryHeader, {
          showDividersAroundChildren: false,
          childContainerPosition: "end",
          get children() {
            var _el$25 = _tmpl$11(), _el$26 = _el$25.firstChild, _el$27 = _el$26.firstChild, _el$28 = _el$27.nextSibling;
            insert(_el$26, createComponent(For, {
              get each() {
                return props.pointsSectionHeaders;
              },
              children: (points) => (() => {
                var _el$29 = _tmpl$13();
                insert(_el$29, createComponent(PointMarkerComponent, {
                  points
                }));
                return _el$29;
              })()
            }), _el$28);
            insert(_el$26, createComponent(PointMarkerComponent, {
              get points() {
                return model.data.scienceDetails.targetScore;
              }
            }), _el$28);
            return _el$25;
          }
        }));
        return _el$24;
      })();
    },
    get children() {
      return createComponent(VSlot, {
        "class": "relative flex flex-col items-start",
        lockNavigation: true,
        get autoFocus() {
          return !model.tooltipToggle;
        },
        get children() {
          return createComponent(For, {
            get each() {
              return props.playerDetails;
            },
            children: (player, index) => {
              const launchpadProps = createMemo(() => ({
                launchpadStatus: player.launchpadStatus,
                rocketColor: player.rocketColor
              }));
              return createComponent(VSlot, {
                "class": "victories-scientific-focus transition-opacity duration-150 ease-out w-full",
                get classList() {
                  return {
                    "opacity-50": isHighlightingAnyone() && player.playerInfo.highlighted() === false
                  };
                },
                get children() {
                  return createComponent(VictoryRow, {
                    get rowId() {
                      return index() + 1;
                    },
                    get playerInfo() {
                      return player.playerInfo;
                    },
                    divider: false,
                    get rowType() {
                      return VictoryTabType.Scientific;
                    },
                    showTooltip: false,
                    activateInfo: (playerId) => {
                      if (ActionHandler.isTouchActive) {
                        model.focusPlayer(playerId, VictoryTabType.Scientific);
                        model.onGamepadInspectButton();
                      }
                    },
                    get children() {
                      return [(() => {
                        var _el$30 = _tmpl$14(), _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling;
                        _el$30.addEventListener("mouseleave", () => {
                          player.playerInfo.setHighlighted(false);
                        });
                        _el$30.addEventListener("mouseenter", () => {
                          player.playerInfo.setHighlighted(true);
                        });
                        insert(_el$31, createComponent(Divider.Vertical, {
                          "class": "-translate-x-1\\/2",
                          length: "3\\/4",
                          color: "rgba(255, 255, 255, 0.6)"
                        }));
                        insert(_el$30, createComponent(PointsBarComponent, {
                          playerDetail: player,
                          get pointsSectionHeaders() {
                            return props.pointsSectionHeaders;
                          }
                        }), null);
                        return _el$30;
                      })(), createComponent(Tooltip.Text, {
                        get header() {
                          return launchpadProps().launchpadStatus.tooltipHeader;
                        },
                        get text() {
                          return launchpadProps().launchpadStatus.tooltipText;
                        },
                        get children() {
                          return createComponent(Activatable, {
                            "class": "victories-focusable-ticket w-23 flex items-center justify-center",
                            onFocus: () => onFocus(player.playerInfo.playerId),
                            onBlur: () => onBlur(player.playerInfo.playerId),
                            get children() {
                              return createComponent(CardFrame, {
                                "class": "size-20 flex items-center justify-center ml-3",
                                get children() {
                                  return createComponent(LaunchpadDisplayComponent, mergeProps(launchpadProps));
                                }
                              });
                            }
                          });
                        }
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
};
const ScienceVictoryTab = ComponentRegistry.register({
  name: "ScienceVictoryTab",
  createInstance: ScienceVictoryTabComponent
});

export { ScienceVictoryTab };
//# sourceMappingURL=science-victory-tab.js.map
