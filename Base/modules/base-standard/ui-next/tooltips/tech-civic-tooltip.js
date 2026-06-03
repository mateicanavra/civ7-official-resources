import { template, spread, insert, setAttribute, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { mergeProps, splitProps, createMemo, createComponent, Show, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { AdvisorRecommendationPill, PillText } from '../components/pills.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-col mb-1"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=mb-1></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><img class="size-11\\.5 self-center"><div class="w-px min-h-11\\.5 mx-2"></div><div class="flex flex-col flex-auto justify-center"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row justify-between items-center text-sm leading-normal"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col justify-center items-center"><div class="text-secondary text-sm font-title uppercase tracking-100"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap items-center justify-center mt-2"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col"></div>`);
function getWonderPlayerId(wonderType) {
  const wonderInfo = GameInfo.Wonders.lookup(wonderType);
  if (wonderInfo?.MaxWorldInstances === 1) {
    const players = Players.getEverAlive();
    for (const player of players) {
      const playerConstructibles = player?.Constructibles;
      if (!playerConstructibles?.getWonders) continue;
      const wonders = playerConstructibles.getWonders(player.id);
      for (const w of wonders) {
        const constructible = Constructibles.getByComponentID?.(w);
        if (constructible?.type === wonderInfo.$hash && constructible?.complete) {
          return player.id;
        }
      }
    }
  }
  return null;
}
const HorizontalDivider = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    _el$.style.setProperty("background", "linear-gradient(90deg, rgba(77, 83, 102, 0.70) 0%, rgba(77, 83, 102, 0.00) 100%)");
    spread(_el$, mergeProps({
      get ["class"]() {
        return `w-full h-px my-2 ${props.class ?? ""}`;
      }
    }, props), false, false);
    return _el$;
  })();
};
const UnlockItem = (props) => {
  const [local, other] = splitProps(props, ["unlock"]);
  const wonderBuiltByText = createMemo(() => {
    if (!local.unlock || local.unlock.kind !== "KIND_CONSTRUCTIBLE") return null;
    const constructible = GameInfo.Constructibles.lookup?.(local.unlock.type);
    if (constructible?.ConstructibleClass === "WONDER") {
      const owningPlayerId = getWonderPlayerId(local.unlock.type);
      if (owningPlayerId != null) {
        const you = GameContext?.localPlayerID;
        return owningPlayerId === you ? "LOC_UI_TREE_WONDER_BUILT_BY_YOU" : "LOC_UI_TREE_WONDER_BUILT_BY_OTHER";
      }
    }
    return null;
  });
  const descData = createMemo(() => local.unlock.descriptionData);
  const hasYields = createMemo(() => descData().yields.length > 0);
  const hasAdjacencies = createMemo(() => descData().adjacencies.length > 0);
  const hasDescriptions = createMemo(() => descData().descriptionLines.length > 0);
  return (() => {
    var _el$2 = _tmpl$4(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling;
    spread(_el$2, mergeProps(other, {
      get ["class"]() {
        return `flex flex-row img-base-ticket-bg p-2 ${other.class ?? ""}`;
      }
    }), false, true);
    _el$4.style.setProperty("background-color", "rgba(217, 217, 217, .3)");
    insert(_el$5, createComponent(Show, {
      get when() {
        return local.unlock.nameKey;
      },
      get children() {
        return [createComponent(L10n.Stylize, {
          "class": "font-title text-secondary uppercase",
          get text() {
            return local.unlock.nameKey;
          }
        }), createComponent(HorizontalDivider, {})];
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return wonderBuiltByText();
      },
      children: (text) => createComponent(L10n.Stylize, {
        "class": "text-secondary text-uppercase text-sm font-body font-bold tracking-25 flex flex-auto",
        get text() {
          return text();
        }
      })
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return hasYields();
      },
      get children() {
        var _el$6 = _tmpl$2();
        insert(_el$6, createComponent(For, {
          get each() {
            return descData().yields;
          },
          children: (yieldChange) => [(() => {
            var _el$8 = _tmpl$5();
            insert(_el$8, createComponent(L10n.Stylize, {
              "class": "text-accent-4",
              get text() {
                return `LOC_${yieldChange.yieldType}_NAME`;
              }
            }), null);
            insert(_el$8, createComponent(L10n.Stylize, {
              "class": "mr-2",
              text: "LOC_UI_POS_YIELD_ICON_ONLY",
              get args() {
                return [yieldChange.amount, yieldChange.yieldType];
              }
            }), null);
            return _el$8;
          })(), createComponent(HorizontalDivider, {})]
        }));
        return _el$6;
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return hasAdjacencies();
      },
      get children() {
        var _el$7 = _tmpl$3();
        insert(_el$7, createComponent(For, {
          get each() {
            return descData().adjacencies;
          },
          children: (group, index) => (() => {
            var _el$9 = _tmpl$();
            insert(_el$9, createComponent(L10n.Stylize, {
              get ["class"]() {
                return `block ${index() > 0 ? "mt-1" : ""} ${group.listMarkup ? "mb-1" : ""}`;
              },
              get text() {
                return group.textKey;
              },
              get args() {
                return group.args;
              }
            }), null);
            insert(_el$9, createComponent(Show, {
              get when() {
                return group.listMarkup;
              },
              children: (listText) => createComponent(L10n.Stylize, {
                "class": "ml-4",
                get text() {
                  return listText() ?? "";
                }
              })
            }), null);
            return _el$9;
          })()
        }));
        return _el$7;
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return hasDescriptions();
      },
      get children() {
        return createComponent(For, {
          get each() {
            return descData().descriptionLines;
          },
          children: (line, index) => createComponent(L10n.Stylize, {
            get ["class"]() {
              return `${index() > 0 ? "mt-1" : ""}`;
            },
            get text() {
              return line.text;
            }
          })
        });
      }
    }), null);
    createRenderEffect(() => setAttribute(_el$3, "src", local.unlock.icon));
    return _el$2;
  })();
};
const StateText = (props) => {
  const stateText = createMemo(() => {
    if (props.depth.isCompleted) return "LOC_UI_COMPLETED_TREE";
    if (props.depth.isCurrent) return "LOC_UI_RESEARCHING_TREE";
    if (props.depth.isLocked) return "LOC_UI_LOCKED_TREE";
    return "";
  });
  return createComponent(Show, {
    get when() {
      return props.depth.isCompleted || props.depth.isCurrent || props.depth.isLocked;
    },
    get children() {
      var _el$10 = _tmpl$();
      insert(_el$10, createComponent(L10n.Compose, {
        get text() {
          return stateText();
        }
      }));
      createRenderEffect(() => className(_el$10, `flex text-accent-3 text-xs font-body tracking-100 ${props.class ?? ""}`));
      return _el$10;
    }
  });
};
const TechCivicTooltip = (props) => {
  const [local, other] = splitProps(props, ["node", "isCulture", "children", "class"]);
  const costIcon = createMemo(() => local.isCulture ? "[icon:YIELD_CULTURE]" : "[icon:YIELD_SCIENCE]");
  const costAmount = createMemo(() => (local.node.cost ?? "").toString());
  const currentDepth = createMemo(() => {
    const depths = local.node.unlocksByDepth ?? [];
    const depthIndex = local.node.currentDepthIndex ?? 0;
    return depths[depthIndex];
  });
  return createComponent(Tooltip, mergeProps({
    offset: 50
  }, other, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get ["class"]() {
          return `tech-civic-tooltip w-128 ${local.class ?? ""}`;
        },
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              return [(() => {
                var _el$11 = _tmpl$6(), _el$12 = _el$11.firstChild;
                insert(_el$12, () => local.node.name);
                insert(_el$11, createComponent(Show, {
                  get when() {
                    return currentDepth();
                  },
                  children: (depth) => createComponent(StateText, {
                    get depth() {
                      return depth();
                    },
                    "class": "mb-2"
                  })
                }), null);
                return _el$11;
              })(), createComponent(Show, {
                get when() {
                  return currentDepth();
                },
                children: (depth) => (() => {
                  var _el$14 = _tmpl$8();
                  insert(_el$14, createComponent(For, {
                    get each() {
                      return depth().unlocks;
                    },
                    children: (u, j) => createComponent(UnlockItem, {
                      get ["class"]() {
                        return j() != depth().unlocks.length - 1 ? "mb-2" : "";
                      },
                      unlock: u
                    })
                  }));
                  return _el$14;
                })()
              }), (() => {
                var _el$13 = _tmpl$7();
                insert(_el$13, createComponent(For, {
                  get each() {
                    return local.node.recommendations ?? [];
                  },
                  children: (rec, index) => createComponent(AdvisorRecommendationPill, {
                    textOverride: "LOC_UI_RECOMMENDATION_DEFAULT",
                    recommendation: rec,
                    "class": "mt-2",
                    get classList() {
                      return {
                        "ml-2": index() > 0
                      };
                    }
                  })
                }), null);
                insert(_el$13, createComponent(PillText, {
                  "class": "mt-2",
                  get classList() {
                    return {
                      "ml-2": local.node.recommendations && local.node.recommendations.length > 0
                    };
                  },
                  text: "LOC_CARD_COST",
                  get args() {
                    return [`${costAmount()}${costIcon()}`];
                  }
                }), null);
                return _el$13;
              })()];
            }
          });
        }
      })];
    }
  }));
};

export { TechCivicTooltip };
//# sourceMappingURL=tech-civic-tooltip.js.map
