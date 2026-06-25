import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, onMount, onCleanup, createComponent, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { Dropdown, DropdownItem } from '../../../../core/ui-next/components/dropdown.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { LineGraph } from '../../../../core/ui-next/components/line-graph.js';
import { VSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { VictoriesAltBase } from './victories-alt-base.js';
import { useVictoriesScreenContext, VictoryTabType } from './victories-screen-model.js';
import { VictoryRow } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full h-full relative victories-military-left-line-header"><div class="relative ml-2 mt-2\\.5 uppercase fxs-header self-end"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="h-full absolute inset-2"></div>`);
const EconomicVictoryTab = () => {
  const model = useVictoriesScreenContext();
  const iterableItems = [];
  for (const [key, value] of model.data.economicDetails.ageOptions.items.entries()) {
    iterableItems.push({
      name: value.name,
      description: value.description,
      value: key
    });
  }
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    hotkeyContext.registerNavtray("shell-action-1", "LOC_VICTORY_NAV_HELP_INSPECT");
    hotkeyContext.registerNavtray("shell-action-2", "LOC_VICTORY_NAV_HELP_AGE_TOOLTIP");
    hotkeyContext.registerNavtray("shell-action-3", "LOC_VICTORY_NAV_HELP_RULES");
    model.tabNavStartup(hotkeyContext);
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("shell-action-1");
    hotkeyContext.unregisterNavtray("shell-action-2");
    hotkeyContext.unregisterNavtray("shell-action-3");
    model.tabNavShutdown(hotkeyContext);
  });
  return createComponent(VictoriesAltBase, {
    isScoreTab: false,
    backgroundImage: "url(bg_victory_economic3)",
    backgroundClass: "absolute inset-0 relative bg-cover bg-no-repeat opacity-30 pointer-events-none",
    get headerText() {
      return model.data.economicDetails.headerText;
    },
    victoryName: "LOC_VICTORY_ECONOMIC_MODERN_NAME",
    get titleColorClass() {
      return model.data.panels[1].titleColor;
    },
    get pointGoal() {
      return model.data.panels[1].goals.pointGoal;
    },
    pointGoalLabel: "LOC_VICTORY_GDP_NEEDED_TO_WIN",
    rulesText: "LOC_VICTORIES_RULES_ECONOMIC",
    slotName: "Economic",
    headerContent: () => (() => {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
      insert(_el$2, createComponent(Dropdown, {
        get defaultValue() {
          return model.data.economicDetails.ageOptions.selectedValue();
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
                    return model.data.economicDetails.ageOptions.items.get(value)?.name ?? "";
                  }
                });
              }
            }), createComponent(Tooltip.Content, {
              get children() {
                return createComponent(Tooltip.Frame, {
                  get children() {
                    return createComponent(L10n.Compose, {
                      get text() {
                        return model.data.economicDetails.ageOptions.items.get(value)?.description ?? "";
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
          model.data.economicDetails.ageOptions.setSelectedValue(selected);
        },
        get children() {
          return createComponent(For, {
            each: iterableItems,
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
      return _el$;
    })(),
    scrollAreaClass: "victories-scroll-base w-full victories-econ-cols-1-and-2-and-4",
    rightContent: () => (() => {
      var _el$3 = _tmpl$2();
      insert(_el$3, createComponent(LineGraph, {
        "class": `opacity-100`,
        width: 6,
        get lines() {
          return model.data.economicDetails.currentChart.graphLines;
        },
        get maxX() {
          return model.data.economicDetails.currentChart.maxTurn;
        },
        get maxY() {
          return model.data.economicDetails.currentChart.graphTarget;
        },
        gridColorX: "rgb(255 255 255 / 30%)",
        get axisLabelX() {
          return Locale.compose("LOC_GENERIC_TURN");
        },
        get axisLabelY() {
          return Locale.compose("LOC_VICTORY_ECONOMIC_GRAPH_TITLE");
        },
        axisNumberColor: "#b5b5b6",
        axisLabelColor: "#848486"
      }));
      return _el$3;
    })(),
    get children() {
      return createComponent(VSlot, {
        get children() {
          return createComponent(VSlot, {
            "class": "relative pointer-events-auto victories-economic-focus transition-opacity duration-150 ease-out flex flex-col",
            lockNavigation: true,
            get autoFocus() {
              return !model.tooltipToggle;
            },
            get children() {
              return createComponent(For, {
                get each() {
                  return model.data.economicDetails.playerDetails;
                },
                children: (player, index) => createComponent(VictoryRow, {
                  get rowId() {
                    return index() + 1;
                  },
                  get playerInfo() {
                    return player.playerInfo;
                  },
                  divider: false,
                  get rowType() {
                    return VictoryTabType.Economic;
                  },
                  skipContentColumn: true,
                  columnClassOverride: "econ",
                  omitBottomLine: true,
                  activateInfo: (playerId) => {
                    if (ActionHandler.isTouchActive) {
                      model.focusPlayer(playerId, VictoryTabType.Economic);
                      model.onGamepadInspectButton();
                    }
                  }
                })
              });
            }
          });
        }
      });
    }
  });
};

export { EconomicVictoryTab };
//# sourceMappingURL=economic-victory-tab.js.map
