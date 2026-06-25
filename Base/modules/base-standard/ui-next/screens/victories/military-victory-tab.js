import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, For, Show, useContext, onMount, onCleanup, mergeProps, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CardFrame } from '../../../../core/ui-next/components/card-frame.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { HSlot, VSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useVictoriesScreenContext, VictoryTabType } from './victories-screen-model.js';
import { VictoryTabBase, VictoryRow, VictoryHeader } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title-sm uppercase fxs-header"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="ml-12 font-body text-sm text-white"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=items-center><div class="font-title-base fxs-header uppercase self-center mb-4"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=ml-8></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="size-full flex flex-row"><div class="w-full self-center"><div class="ml-2 uppercase fxs-header"></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="self-center flex flex-row flex-wrap"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="victories-military-item-icon font-body text-lg text-body self-center"></div>`);
const SAME_IDEOLOGY_TINT = "#FFFFFF";
const RIVAL_IDEOLOGY_TINT = "#FF9047";
const MilitaryTooltip = (props) => {
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
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              var _el$ = _tmpl$3(), _el$2 = _el$.firstChild;
              insert(_el$2, createComponent(L10n.Compose, {
                get text() {
                  return props.hasMet ? props.name : "LOC_LEADER_UNMET_NAME";
                }
              }));
              insert(_el$, createComponent(CardFrame, {
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
                          var _el$5 = _tmpl$4();
                          insert(_el$5, createComponent(L10n.Compose, {
                            get text() {
                              return breakdown.name;
                            }
                          }));
                          return _el$5;
                        })(), (() => {
                          var _el$6 = _tmpl$5();
                          insert(_el$6, () => Locale.toNumber(breakdown.points));
                          return _el$6;
                        })()];
                      }
                    })
                  });
                }
              }), null);
              insert(_el$, createComponent(Show, {
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
                            var _el$3 = _tmpl$();
                            insert(_el$3, createComponent(L10n.Compose, {
                              text: "LOC_VICTORIES_TOOLTIP_TOTAL"
                            }));
                            return _el$3;
                          })(), (() => {
                            var _el$4 = _tmpl$2();
                            insert(_el$4, () => Locale.toNumber(props.points));
                            return _el$4;
                          })()];
                        }
                      });
                    }
                  });
                }
              }), null);
              return _el$;
            }
          });
        }
      })];
    }
  });
};
const MilitaryVictoryTab = () => {
  const model = useVictoriesScreenContext();
  const layoutModel = LayoutModel.get();
  const onMilitaryFocus = (playerId) => {
    model.focusPlayer(playerId, VictoryTabType.Military);
  };
  const onMilitaryBlur = (playerId) => {
    model.unFocusPlayer(playerId, VictoryTabType.Military);
  };
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    hotkeyContext.registerNavtray("shell-action-1", "LOC_VICTORY_NAV_HELP_INSPECT");
    hotkeyContext.registerNavtray("shell-action-3", "LOC_VICTORY_NAV_HELP_RULES");
    model.tabNavStartup(hotkeyContext);
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("shell-action-1");
    hotkeyContext.unregisterNavtray("shell-action-3");
    model.tabNavShutdown(hotkeyContext);
  });
  return createComponent(VictoryTabBase, {
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
          var _el$7 = _tmpl$6(), _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild;
          insert(_el$9, createComponent(L10n.Compose, {
            text: "LOC_GENERIC_SETTLEMENTS"
          }));
          return _el$7;
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
                var _el$10 = _tmpl$7();
                insert(_el$10, createComponent(For, {
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
                              var _el$11 = _tmpl$8();
                              insert(_el$11, () => structure.points.toString());
                              return _el$11;
                            }
                          }), (() => {
                            var _el$12 = _tmpl$4();
                            createRenderEffect((_p$) => {
                              var _v$ = `absolute inset-0 victories-structure-icon bg-contain bg-no-repeat ${structure.iconClass} ${player.playerInfo.highlighted() ? "opacity-20" : "opacity-70"}`, _v$2 = structure.iconURL, _v$3 = `${structure.wasConqueredFromIdeologicalOpponent ? RIVAL_IDEOLOGY_TINT : SAME_IDEOLOGY_TINT}`;
                              _v$ !== _p$.e && className(_el$12, _p$.e = _v$);
                              _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$12.style.setProperty("background-image", _v$2) : _el$12.style.removeProperty("background-image"));
                              _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$12.style.setProperty("fxs-background-image-tint", _v$3) : _el$12.style.removeProperty("fxs-background-image-tint"));
                              return _p$;
                            }, {
                              e: void 0,
                              t: void 0,
                              a: void 0
                            });
                            return _el$12;
                          })()];
                        }
                      });
                    }
                  }))
                }));
                return _el$10;
              }
            })
          });
        }
      });
    }
  });
};

export { MilitaryVictoryTab };
//# sourceMappingURL=military-victory-tab.js.map
