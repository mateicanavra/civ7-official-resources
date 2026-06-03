import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, createComponent, Show, Switch, Match, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { getWarStatusFromPlayerId } from '../../../core/ui/utilities/diplomacy-utilities.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { RelationshipBreakdown } from '../components/relationship-breakdown.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="text-sm font-title"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="font-body text-xs min-w-72"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class=fxs-relationship-tooltip__agenda></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-col justify-center w-full"></div>`);
const RelationshipTooltipComponent = (props) => {
  const [playerName, setPlayerName] = createSignal("");
  const [warStatus, setWarStatus] = createSignal({
    isAtWar: false,
    warSupport: 0
  });
  const [agendaItems, setAgendaItems] = createSignal([]);
  createEffect(() => {
    setWarStatus(getWarStatusFromPlayerId(props.playerId));
    const player = Players.get(props.playerId);
    if (!player) {
      console.error("relationship-tooltip: Attempting to update relationship info screen, but unable to get selected player library");
      return;
    }
    setPlayerName(player.name);
    if (!player.isAI) {
      return;
    }
    const agendaItemList = [];
    const agendaNames = Game.Diplomacy.getAgendaNames(props.playerId);
    const agendaDescriptions = Game.Diplomacy.getAgendaDescriptions(props.playerId);
    for (let i = 0; i < agendaNames.length; i++) {
      agendaItemList.push({
        name: agendaNames[i],
        description: agendaDescriptions[i]
      });
    }
    setAgendaItems(agendaItemList);
  });
  return createComponent(Tooltip, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          var _el$ = _tmpl$();
          insert(_el$, () => props.children);
          return _el$;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "fxs-tooltip fxs-relationship-tooltip",
            "data-name": "Relationship-Tooltip",
            get children() {
              var _el$2 = _tmpl$5();
              insert(_el$2, createComponent(Show, {
                get when() {
                  return warStatus().isAtWar;
                },
                get children() {
                  return [(() => {
                    var _el$3 = _tmpl$2();
                    insert(_el$3, createComponent(L10n.Compose, {
                      text: "LOC_DIPLOMACY_WAR_WEARINESS"
                    }));
                    return _el$3;
                  })(), (() => {
                    var _el$4 = _tmpl$3();
                    insert(_el$4, createComponent(Switch, {
                      get fallback() {
                        return createComponent(L10n.Stylize, {
                          text: "LOC_WAR_TOOLTIP_NO_WAR_WEARINESS"
                        });
                      },
                      get children() {
                        return [createComponent(Match, {
                          get when() {
                            return warStatus().warSupport < 0;
                          },
                          get children() {
                            return createComponent(L10n.Stylize, {
                              text: "LOC_WAR_TOOLTIP_RECEIVING_WAR_WEARINESS",
                              get args() {
                                return [playerName()];
                              }
                            });
                          }
                        }), createComponent(Match, {
                          get when() {
                            return warStatus().warSupport > 0;
                          },
                          get children() {
                            return createComponent(L10n.Stylize, {
                              text: "LOC_WAR_TOOLTIP_GIVING_WAR_WEARINESS",
                              get args() {
                                return [playerName()];
                              }
                            });
                          }
                        })];
                      }
                    }));
                    return _el$4;
                  })()];
                }
              }), null);
              insert(_el$2, createComponent(Show, {
                get when() {
                  return !warStatus().isAtWar;
                },
                get children() {
                  return [createComponent(RelationshipBreakdown, {
                    get playerId() {
                      return props.playerId;
                    }
                  }), (() => {
                    var _el$5 = _tmpl$4();
                    insert(_el$5, createComponent(L10n.Stylize, {
                      "class": "fxs-relationship-tooltip__agenda-title text-sm text-victory-economic self-center",
                      text: "LOC_DIPLOMACY_AGENDA_TITLE"
                    }), null);
                    insert(_el$5, createComponent(For, {
                      get each() {
                        return agendaItems();
                      },
                      children: (agendaItem, index) => (() => {
                        var _el$6 = _tmpl$();
                        insert(_el$6, createComponent(L10n.Stylize, {
                          "class": "fxs-relationship-tooltip__agenda-name text-base self-center",
                          get text() {
                            return agendaItem.name;
                          }
                        }), null);
                        insert(_el$6, createComponent(L10n.Stylize, {
                          "class": "fxs-relationship-tooltip__agenda-description text-sm",
                          get text() {
                            return agendaItem.description;
                          }
                        }), null);
                        createRenderEffect(() => _el$6.classList.toggle("mb-2", !!(index() + 1 < agendaItems().length)));
                        return _el$6;
                      })()
                    }), null);
                    return _el$5;
                  })()];
                }
              }), null);
              return _el$2;
            }
          });
        }
      })];
    }
  });
};
const RelationshipTooltip = ComponentRegistry.register({
  name: "RelationshipTooltip",
  createInstance: RelationshipTooltipComponent
});

export { RelationshipTooltip };
//# sourceMappingURL=relationship-tooltip.js.map
