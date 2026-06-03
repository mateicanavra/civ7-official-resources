import { template, use, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createEffect, createComponent, createRenderEffect, Show, For, createSignal, onMount, onCleanup, untrack, useContext, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { VSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipHorizontalPosition, TooltipVerticalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { drawDashedQuadraticBezier } from '../../../../core/ui-next/utilities/canvas-utilities.js';
import { createPropsRefSignal, createLayoutComplete } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { useVictoriesScreenContext, VictoryTabType } from './victories-screen-model.js';
import { VictoryTabBase, VictoryRow, VictoryHeader } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="text-title uppercase text-secondary mb-1"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=mb-3></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col absolute items-center justify-center h-full pointer-events-auto"><div id=culture-pip-dot class="size-3 mb-1"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center victories-culture-tooltip-body p-1 my-1 w-96 relative"><div class="size-9 bg-contain bg-no-repeat bg-center ml-2"></div><div class="flex flex-col justify-center min-h-11 w-64"><div class="uppercase text-title"></div></div><div class="absolute right-2"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute inset-0 pointer-events-none"><canvas class=size-full></canvas></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute text-xs hidden translate-x-1\\/2"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class=w-full></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="relative ml-2 mt-2\\.5 uppercase fxs-header self-end"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="relative flex flex-col self-start items-center w-full"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex-auto flex flex-row h-32"><div class="flex flex-col justify-center"></div><div class="absolute top-0 bottom-0"></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="size-14 bg-center bg-contain bg-no-repeat -mb-2"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="text-xl text-title"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex flex-row items-center w-full p-1 my-1 relative"><div class="size-9 bg-contain bg-no-repeat bg-center ml-2"></div><div class="flex flex-col justify-center h-11"><div class="uppercase text-title"></div></div><div class="absolute right-2"></div></div>`);
const MIN_ARC_HEIGHT = 1;
const LINEAR_SCALE = 0.38;
const NONLINEAR_SCALE = 0.06;
const MAX_ARC_HEIGHT = 64;
const CultureBarPip = (props) => {
  const model = useVictoriesScreenContext();
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const layoutComplete = createLayoutComplete();
  createEffect(() => {
    if (layoutComplete()) {
      const pipDot = root()?.querySelector("#culture-pip-dot");
      if (!pipDot) {
        return;
      }
      const x = root()?.offsetLeft ?? 0;
      const width = root()?.offsetWidth ?? 0;
      const pipOffset = pipDot.offsetTop + pipDot.offsetHeight / 4;
      const pips = model.data.cultureDetails.playerDetails[props.playerIndex].allCulturePips[props.ageIndex].pips;
      if (props.pipIndex >= pips.length) {
        return;
      }
      pips[props.pipIndex].location = {
        x: x + width / 2,
        y: pipOffset
      };
      props.onMountFunc();
    }
  });
  const onFocus = () => {
    model.focusPlayer(model.data.cultureDetails.playerDetails[props.playerIndex].playerInfo.playerId, VictoryTabType.Cultural);
  };
  const onBlur = () => {
    model.unFocusPlayer(model.data.cultureDetails.playerDetails[props.playerIndex].playerInfo.playerId, VictoryTabType.Cultural);
  };
  return (() => {
    var _el$ = _tmpl$4(), _el$6 = _el$.firstChild;
    use(setRoot, _el$);
    insert(_el$, createComponent(Tooltip, {
      get initialVPosition() {
        return TooltipVerticalPosition.TOP;
      },
      get initialHPosition() {
        return TooltipHorizontalPosition.CENTER;
      },
      get children() {
        return [createComponent(Tooltip.Trigger, {
          get children() {
            return createComponent(Activatable, {
              get ["class"]() {
                return `victories-culture-pip relative bg-contain bg-center bg-no-repeat ${props.pip.sources[0].isBig ? "size-16" : "size-14 mb-1 mt-1"}`;
              },
              get style() {
                return {
                  "background-image": props.pip.sources[0].isBig ? "url(blp:culture_pin_major)" : "url(blp:culture_pin_minor)",
                  // eslint-disable-next-line solid/style-prop
                  "fxs-background-image-tint": props.color
                };
              },
              onFocus,
              onBlur,
              get children() {
                return [(() => {
                  var _el$2 = _tmpl$();
                  _el$2.style.setProperty("border-radius", "50%");
                  createRenderEffect((_p$) => {
                    var _v$ = `absolute bg-no-repeat bg-center ${props.pip.sources[0].isBig ? "size-10 top-1 left-3" : "size-7 top-1\\.5 left-3\\.5"}`, _v$2 = props.pip.sources[0].iconSrc, _v$3 = props.isWonder ? "130% 130%" : "cover";
                    _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
                    _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background-image", _v$2) : _el$2.style.removeProperty("background-image"));
                    _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$2.style.setProperty("background-size", _v$3) : _el$2.style.removeProperty("background-size"));
                    return _p$;
                  }, {
                    e: void 0,
                    t: void 0,
                    a: void 0
                  });
                  return _el$2;
                })(), createComponent(Show, {
                  get when() {
                    return props.pip.sources.length > 1;
                  },
                  get children() {
                    var _el$3 = _tmpl$();
                    _el$3.style.setProperty("background-image", "url(blp:victories_culturePlus)");
                    createRenderEffect(() => className(_el$3, `absolute ${props.pip.sources[0].isBig ? "size-7 bottom-2 right-2" : "size-5 bottom-4 right-3"} bg-contain bg-center bg-no-repeat pointer-events-none`));
                    return _el$3;
                  }
                })];
              }
            });
          }
        }), createComponent(Tooltip.Content, {
          get children() {
            return createComponent(Tooltip.Frame, {
              "class": "relative flex flex-col p-2 items-center justify-center",
              get children() {
                return [(() => {
                  var _el$4 = _tmpl$2();
                  insert(_el$4, createComponent(L10n.Compose, {
                    text: "LOC_VICTORIES_CULTURE_SOURCES"
                  }));
                  return _el$4;
                })(), (() => {
                  var _el$5 = _tmpl$3();
                  insert(_el$5, createComponent(L10n.Compose, {
                    get text() {
                      return props.pip.ageName;
                    }
                  }));
                  return _el$5;
                })(), createComponent(CardFrame, {
                  "class": "mb-3",
                  get children() {
                    return createComponent(For, {
                      get each() {
                        return props.pip.sources;
                      },
                      children: (row, index) => {
                        return [(() => {
                          var _el$7 = _tmpl$5(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$10 = _el$9.firstChild, _el$11 = _el$9.nextSibling;
                          insert(_el$7, createComponent(Divider.Vertical, {
                            margin: 2,
                            length: "13"
                          }), _el$9);
                          insert(_el$10, () => row.typeName);
                          insert(_el$9, createComponent(Show, {
                            get when() {
                              return row.sourceName != void 0;
                            },
                            get children() {
                              return row.sourceName;
                            }
                          }), null);
                          insert(_el$11, () => row.points);
                          createRenderEffect((_$p) => (_$p = row.iconSrc) != null ? _el$8.style.setProperty("background-image", _$p) : _el$8.style.removeProperty("background-image"));
                          return _el$7;
                        })(), createComponent(Show, {
                          get when() {
                            return index() < props.pip.sources.length - 1;
                          },
                          get children() {
                            return createComponent(Divider.Horizontal, {
                              "class": "my-1 ml-2",
                              length: "84"
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
        })];
      }
    }), _el$6);
    _el$6.style.setProperty("border", "2px solid black");
    _el$6.style.setProperty("border-radius", "50%");
    insert(_el$, () => props.pip.points, null);
    createRenderEffect((_p$) => {
      var _v$4 = props.pip.position + "%", _v$5 = props.color;
      _v$4 !== _p$.e && ((_p$.e = _v$4) != null ? _el$.style.setProperty("left", _v$4) : _el$.style.removeProperty("left"));
      _v$5 !== _p$.t && ((_p$.t = _v$5) != null ? _el$6.style.setProperty("background-color", _v$5) : _el$6.style.removeProperty("background-color"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const CultureBarGraph = (props) => {
  const model = useVictoriesScreenContext();
  const [allPipsPlaced, setAllPipsPlaced] = createSignal(false);
  let canvas;
  onMount(() => {
    if (canvas) {
      createEffect(() => {
        if (!allPipsPlaced()) {
          return;
        }
        const canvasRect = canvas.getBoundingClientRect();
        canvas.width = canvasRect.width;
        canvas.height = canvasRect.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barTop = canvas.height * 0.1;
        const barHeight = canvas.height * 0.8;
        const segmentWidth = Math.max(canvas.width * 8e-3, 1);
        props.turnPercentages.forEach((percentage) => {
          const left = percentage / 100 * canvas.width;
          const isHighlighted = props.isCurrentAge && props.currentAgeProgressPercentage === percentage;
          ctx.fillStyle = isHighlighted ? "rgba(120, 139, 179, 0.9)" : "rgba(97, 98, 102, 0.6)";
          ctx.fillRect(left, barTop, segmentWidth, barHeight);
          if (isHighlighted && props.onHighlightedSegmentDrawn) {
            props.onHighlightedSegmentDrawn({
              left: canvasRect.left + left,
              top: canvasRect.top + barTop,
              height: barHeight,
              width: segmentWidth
            });
          }
        });
        ctx.strokeStyle = "#616266";
        ctx.lineWidth = 2;
        props.pipList.pips.forEach((_pip, index) => {
          if (index >= props.pipList.pips.length - 1) {
            return;
          }
          const startLoc = model.data.cultureDetails.playerDetails[props.playerIndex].allCulturePips[props.ageIndex].pips[index].location;
          const endLoc = model.data.cultureDetails.playerDetails[props.playerIndex].allCulturePips[props.ageIndex].pips[index + 1].location;
          const startX = startLoc.x + 6;
          const startY = startLoc.y;
          const endX = endLoc.x - 6;
          const endY = endLoc.y;
          const cpX = (startX + endX) / 2;
          const pipDistance = Math.abs(endX - startX);
          const arcHeight = Math.min(MAX_ARC_HEIGHT, MIN_ARC_HEIGHT + pipDistance * LINEAR_SCALE + Math.sqrt(pipDistance) * NONLINEAR_SCALE);
          const cpY = Math.min(startY, endY) - arcHeight;
          drawDashedQuadraticBezier(ctx, startX, startY, cpX, cpY, endX, endY, 6, 4);
        });
      });
    }
  });
  onCleanup(() => {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  });
  return [(() => {
    var _el$12 = _tmpl$6(), _el$13 = _el$12.firstChild;
    var _ref$ = canvas;
    typeof _ref$ === "function" ? use(_ref$, _el$13) : canvas = _el$13;
    return _el$12;
  })(), createComponent(For, {
    get each() {
      return props.pipList.pips;
    },
    children: (pip, index) => {
      return createComponent(CultureBarPip, {
        get isWonder() {
          return pip.sources[0].isWonder;
        },
        get color() {
          return props.color;
        },
        pip,
        get pipIndex() {
          return index();
        },
        get ageIndex() {
          return props.ageIndex;
        },
        get playerIndex() {
          return props.playerIndex;
        },
        onMountFunc: () => {
          if (index() == props.pipList.pips.length - 1) {
            untrack(() => {
              setAllPipsPlaced(true);
            });
          }
        }
      });
    }
  })];
};
const AgeIndicator = (props) => {
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const layoutComplete = createLayoutComplete();
  createEffect(() => {
    if (props.isCurrentAge() && layoutComplete()) {
      const location = props.currentProgressSegmentLocation();
      if (!location || root() === void 0) {
        return;
      }
      const parentRect = root()?.parentElement?.getBoundingClientRect();
      if (!parentRect) {
        return;
      }
      const scaledOffset = location.height / 12;
      const absoluteTop = location.top - parentRect.top + scaledOffset;
      const absoluteLeft = location.left - parentRect.left + location.width / 2;
      root().style.top = absoluteTop + "px";
      root().style.left = absoluteLeft + "px";
      root().classList.remove("hidden");
    }
  });
  return createComponent(Show, {
    get when() {
      return props.isCurrentAge();
    },
    get children() {
      var _el$14 = _tmpl$7();
      use(setRoot, _el$14);
      insert(_el$14, () => props.currentAgePercent.toString() + "%");
      return _el$14;
    }
  });
};
const CultureVictoryTabComponent = (props) => {
  const model = useVictoriesScreenContext();
  const [isHighlightingAnyone, setIsHighlightingAnyone] = createSignal(false);
  const [isCurrentAge, setIsCurrentAge] = createSignal(true);
  const [currentProgressSegment, setCurrentProgressSegment] = createSignal(void 0);
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    hotkeyContext.registerNavtray("shell-action-2", "LOC_VICTORY_NAV_HELP_AGE_TOOLTIP");
    hotkeyContext.registerNavtray("toggle-tooltip", "LOC_VICTORY_NAV_HELP_RULES");
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("shell-action-2");
    hotkeyContext.unregisterNavtray("toggle-tooltip");
  });
  createEffect(() => {
    setIsCurrentAge(model.data.cultureDetails.ageOptions.selectedValue() == Game.age);
  });
  createEffect(() => {
    setIsHighlightingAnyone(props.playerDetails.some((player) => {
      return player.playerInfo.highlighted() || player.playerInfo.focused();
    }));
  });
  const iterableItems = createMemo(() => {
    const result = [];
    for (const [key, value] of props.ageOptions.items.entries()) {
      result.push({
        name: value.name,
        description: value.description,
        value: key
      });
    }
    return result;
  });
  function onFocus(playerId) {
    model.focusPlayer(playerId, VictoryTabType.Cultural);
  }
  function onBlur(playerId) {
    model.unFocusPlayer(playerId, VictoryTabType.Cultural);
  }
  return (() => {
    var _el$15 = _tmpl$8();
    insert(_el$15, createComponent(VictoryTabBase, {
      get header() {
        return model.data.cultureDetails.headerText;
      },
      get titleColorClass() {
        return model.data.panels[0].titleColor;
      },
      get background() {
        return model.data.panels[0].background;
      },
      get targetScore() {
        return model.data.cultureDetails.targetScore;
      },
      title: "LOC_VICTORY_CULTURE_MODERN_NAME",
      rules: "LOC_VICTORIES_RULES_CULTURE",
      pointsNeededText: "LOC_TOURISM_POINTS_NEEDED_TO_WIN",
      get preScrollContent() {
        return (() => {
          var _el$16 = _tmpl$10();
          insert(_el$16, createComponent(VictoryHeader, {
            get children() {
              var _el$17 = _tmpl$9();
              insert(_el$17, createComponent(Dropdown, {
                get defaultValue() {
                  return props.ageOptions.selectedValue();
                },
                selectedItemTemplate: (value) => createComponent(Tooltip, {
                  get initialHPosition() {
                    return TooltipHorizontalPosition.RIGHT;
                  },
                  get children() {
                    return [createComponent(Tooltip.Trigger, {
                      get children() {
                        return createComponent(L10n.Compose, {
                          get text() {
                            return props.ageOptions.items.get(value)?.name ?? "";
                          }
                        });
                      }
                    }), createComponent(Tooltip.Content, {
                      get children() {
                        return createComponent(Tooltip.Frame, {
                          get children() {
                            return createComponent(L10n.Compose, {
                              get text() {
                                return props.ageOptions.items.get(value)?.description ?? "";
                              }
                            });
                          }
                        });
                      }
                    })];
                  }
                }),
                hotkey: "shell-action-2",
                onItemSelected: (selected) => {
                  props.ageOptions.setSelectedValue(selected);
                },
                get children() {
                  return createComponent(For, {
                    get each() {
                      return iterableItems();
                    },
                    children: (value) => createComponent(Tooltip, {
                      get initialHPosition() {
                        return TooltipHorizontalPosition.RIGHT;
                      },
                      get children() {
                        return [createComponent(Tooltip.Trigger, {
                          get children() {
                            return createComponent(DropdownItem, {
                              get value() {
                                return value.value;
                              },
                              get children() {
                                return createComponent(L10n.Compose, {
                                  get text() {
                                    return value.name;
                                  }
                                });
                              }
                            });
                          }
                        }), createComponent(Tooltip.Content, {
                          get children() {
                            return createComponent(Tooltip.Frame, {
                              get children() {
                                return createComponent(L10n.Compose, {
                                  get text() {
                                    return value.description;
                                  }
                                });
                              }
                            });
                          }
                        })];
                      }
                    })
                  });
                }
              }));
              return _el$17;
            }
          }));
          return _el$16;
        })();
      },
      get children() {
        return createComponent(VSlot, {
          "class": "flex flex-col",
          lockNavigation: true,
          get children() {
            return createComponent(For, {
              get each() {
                return props.playerDetails;
              },
              children: (player, playerIndex) => {
                return createComponent(VSlot, {
                  "class": "transition-opacity duration-150 ease-out victories-cultural-focus",
                  get classList() {
                    return {
                      "opacity-50": isHighlightingAnyone() && player.playerInfo.highlighted() === false && player.playerInfo.focused() === false
                    };
                  },
                  get children() {
                    return createComponent(VictoryRow, {
                      get rowId() {
                        return playerIndex() + 1;
                      },
                      get playerInfo() {
                        return player.playerInfo;
                      },
                      divider: false,
                      get rowType() {
                        return VictoryTabType.Cultural;
                      },
                      showTooltip: false,
                      activateInfo: (playerId) => {
                        if (ActionHandler.isTouchActive) {
                          model.focusPlayer(playerId, VictoryTabType.Cultural);
                          model.onGamepadInspectButton();
                        }
                      },
                      get children() {
                        return [(() => {
                          var _el$18 = _tmpl$11(), _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling;
                          _el$18.addEventListener("mouseleave", () => {
                            player.playerInfo.setHighlighted(false);
                          });
                          _el$18.addEventListener("mouseenter", () => {
                            player.playerInfo.setHighlighted(true);
                          });
                          insert(_el$19, createComponent(Divider.Vertical, {
                            "class": "-translate-x-1\\/2",
                            length: "3\\/4",
                            color: "rgba(255, 255, 255, 0.6)"
                          }));
                          _el$20.style.setProperty("left", "1.5%");
                          _el$20.style.setProperty("right", "2%");
                          insert(_el$20, createComponent(For, {
                            get each() {
                              return player.allCulturePips;
                            },
                            children: (pipList, index) => {
                              return createComponent(Show, {
                                get when() {
                                  return pipList.age == props.ageOptions.selectedValue();
                                },
                                get children() {
                                  return createComponent(CultureBarGraph, {
                                    get ageIndex() {
                                      return index();
                                    },
                                    pipList,
                                    get color() {
                                      return player.playerColor;
                                    },
                                    get playerIndex() {
                                      return playerIndex();
                                    },
                                    get turnPercentages() {
                                      return props.turnPercentages;
                                    },
                                    get currentAgeProgressPercentage() {
                                      return props.currentAgeProgressPercentage;
                                    },
                                    get isCurrentAge() {
                                      return isCurrentAge();
                                    },
                                    get onHighlightedSegmentDrawn() {
                                      return playerIndex() == 0 ? setCurrentProgressSegment : void 0;
                                    }
                                  });
                                }
                              });
                            }
                          }));
                          return _el$18;
                        })(), createComponent(Tooltip, {
                          get initialVPosition() {
                            return TooltipVerticalPosition.TOP;
                          },
                          get initialHPosition() {
                            return TooltipHorizontalPosition.CENTER;
                          },
                          get children() {
                            return [createComponent(Tooltip.Trigger, {
                              get children() {
                                return createComponent(Activatable, {
                                  "class": "victories-focusable-ticket w-22 mt-4 mr-2",
                                  onFocus: () => onFocus(player.playerInfo.playerId),
                                  onBlur: () => onBlur(player.playerInfo.playerId),
                                  get children() {
                                    return createComponent(CardFrame, {
                                      "class": "size-24 flex flex-col items-center justify-center self-center opacity-100",
                                      get children() {
                                        return [(() => {
                                          var _el$21 = _tmpl$12();
                                          _el$21.style.setProperty("background-image", "url(blp:fonticon_greatwork)");
                                          return _el$21;
                                        })(), (() => {
                                          var _el$22 = _tmpl$13();
                                          insert(_el$22, () => player.greatWorksData.pointsTotal);
                                          return _el$22;
                                        })()];
                                      }
                                    });
                                  }
                                });
                              }
                            }), createComponent(Tooltip.Content, {
                              get children() {
                                return createComponent(Tooltip.Frame, {
                                  "class": "relative flex flex-col p-2 items-center justify-center",
                                  get children() {
                                    return [(() => {
                                      var _el$23 = _tmpl$2();
                                      insert(_el$23, createComponent(L10n.Compose, {
                                        text: "LOC_UI_GREAT_WORKS_TITLE"
                                      }));
                                      return _el$23;
                                    })(), createComponent(CardFrame, {
                                      "class": "w-84 mb-3",
                                      get children() {
                                        return createComponent(For, {
                                          get each() {
                                            return player.greatWorksData.sources;
                                          },
                                          children: (source, index) => {
                                            return createComponent(Show, {
                                              get when() {
                                                return source.points > 0;
                                              },
                                              get children() {
                                                return [(() => {
                                                  var _el$24 = _tmpl$14(), _el$25 = _el$24.firstChild, _el$26 = _el$25.nextSibling, _el$27 = _el$26.firstChild, _el$28 = _el$26.nextSibling;
                                                  insert(_el$24, createComponent(Divider.Vertical, {
                                                    margin: 2,
                                                    length: "13"
                                                  }), _el$26);
                                                  insert(_el$27, createComponent(L10n.Compose, {
                                                    get text() {
                                                      return source.typeName;
                                                    }
                                                  }));
                                                  insert(_el$28, () => source.points);
                                                  createRenderEffect((_$p) => (_$p = source.icon) != null ? _el$25.style.setProperty("background-image", _$p) : _el$25.style.removeProperty("background-image"));
                                                  return _el$24;
                                                })(), createComponent(Show, {
                                                  get when() {
                                                    return index() < player.greatWorksData.sources.length - 1;
                                                  },
                                                  get children() {
                                                    return createComponent(Divider.Horizontal, {
                                                      "class": "my-1 ml-2",
                                                      length: "80"
                                                    });
                                                  }
                                                })];
                                              }
                                            });
                                          }
                                        });
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
                });
              }
            });
          }
        });
      }
    }), null);
    insert(_el$15, createComponent(AgeIndicator, {
      get currentAgePercent() {
        return props.currentAgeProgressPercentage;
      },
      isCurrentAge,
      currentProgressSegmentLocation: currentProgressSegment
    }), null);
    return _el$15;
  })();
};
const CultureVictoryTab = ComponentRegistry.register({
  name: "CultureVictoryTab",
  createInstance: CultureVictoryTabComponent
});

export { CultureVictoryTab };
//# sourceMappingURL=culture-victory-tab.js.map
