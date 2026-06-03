import { template, spread, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, mergeProps, createComponent, For, Show } from '../../../core/vendor/solid-js/dist/solid.js';
import { getModifierTextByContext, parseConstructibleAdjacencyNameOnly } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ConstructibleHasTagType, getConstructibleTagsFromType } from '../../ui/utilities/utilities-tags.js';
import { PillText } from './pills.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex items-center w-full"><div class=constructible-details__divider-line-left></div><p class="mx-2 font-title text-secondary text-sm uppercase"></p><div class=constructible-details__divider-line-right></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="mb-2 flex flex-wrap"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=mb-2></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="img-shell-line-divider h-1 w-1/2 self-center mb-2"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex items-center"><div class=mr-2></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex mb-2 items-center"><div class=mr-2></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="w-full flex flex-wrap self-center justify-center"></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div></div>`);
const bulletChar = String.fromCodePoint(8226);
const formatStylizedSpacing = (element) => {
  if (!element) {
    return;
  }
  let firstChild = true;
  let prevChildIsList = false;
  for (const node of Array.from(element.children)) {
    const isList = node.innerHTML.includes(bulletChar);
    if (isList) {
      node.classList.add("ml-4");
    }
    if (!firstChild && (!prevChildIsList || !isList)) {
      node.classList.add("mt-2");
    }
    firstChild = false;
    prevChildIsList = isList;
  }
};
const collectYieldChanges = (constructibleType) => {
  if (!constructibleType) {
    return [];
  }
  const results = [];
  for (const entry of GameInfo.Constructible_YieldChanges) {
    if (entry.ConstructibleType === constructibleType) {
      results.push({
        amount: entry.YieldChange,
        yieldType: entry.YieldType
      });
    }
  }
  return results;
};
const collectModifierTexts = (constructibleType) => {
  if (!constructibleType) {
    return [];
  }
  const modifiers = [];
  for (const modifier of GameInfo.ConstructibleModifiers) {
    if (modifier.ConstructibleType === constructibleType) {
      const text = getModifierTextByContext(modifier.ModifierId, "Description");
      if (text) {
        modifiers.push(text);
      }
    }
  }
  return modifiers;
};
const collectUnlockedGreatPeople = (constructibleType, selectedCity) => {
  const unlocksGreatPeople = [];
  if (!constructibleType || !selectedCity) return unlocksGreatPeople;
  const playerID = selectedCity.owner;
  const playerUnits = Players.Units.get(playerID);
  if (!playerUnits) return unlocksGreatPeople;
  GameInfo.GreatPersonClasses.forEach((greatPersonClass) => {
    if (!greatPersonClass.ConstructibleType && !greatPersonClass.ConstructibleTag) return;
    if (greatPersonClass.ConstructibleType) {
      if (greatPersonClass.ConstructibleType !== constructibleType) return;
    }
    if (greatPersonClass.ConstructibleTag) {
      if (!ConstructibleHasTagType(constructibleType, greatPersonClass.ConstructibleTag)) return;
    }
    const greatPersonUnitDef = GameInfo.Units.lookup(greatPersonClass.UnitType);
    if (greatPersonUnitDef && playerUnits.canEverTrain(greatPersonClass.UnitType)) {
      const unitName = greatPersonUnitDef.Description ? `[TIP:${greatPersonUnitDef.Description}]{${greatPersonUnitDef.Name}}[/TIP]` : greatPersonUnitDef.Name;
      unlocksGreatPeople.push(Locale.compose("LOC_UI_PRODUCTION_ALLOWS_TRAINING", greatPersonUnitDef.UnitType, unitName));
    }
  });
  return unlocksGreatPeople;
};
const collectMaintenanceEntries = (constructibleType, selectedCity) => {
  if (!constructibleType || !selectedCity) {
    return [];
  }
  const values = selectedCity.Constructibles?.getMaintenance(constructibleType);
  if (!values || values.length === 0) {
    return [];
  }
  const entries = [];
  for (let index = 0; index < values.length; index += 1) {
    const amount = values[index];
    if (amount > 0) {
      const yieldDefinition = GameInfo.Yields[index];
      if (yieldDefinition) {
        entries.push({
          yieldType: yieldDefinition.YieldType,
          value: amount
        });
      }
    }
  }
  return entries;
};
const buildAdjacencyListMarkup = (entries) => {
  const items = entries.map((definition) => `[LI] ${parseConstructibleAdjacencyNameOnly(definition)}`).join("");
  return `[BLIST]${items}[/BLIST]`;
};
const collectAdjacencyGroups = (constructibleType, selectedCity) => {
  if (!constructibleType) {
    return [];
  }
  const adjacencyDefinitions = [];
  for (const definition of GameInfo.Constructible_Adjacencies) {
    if (definition.ConstructibleType !== constructibleType) {
      continue;
    }
    const yieldChangeDef = GameInfo.Adjacency_YieldChanges.find((entry) => entry.ID === definition.YieldChangeId);
    if (!yieldChangeDef) {
      continue;
    }
    if (definition.RequiresActivation && selectedCity?.Constructibles) {
      if (!selectedCity.Constructibles.isAdjacencyUnlocked(yieldChangeDef.ID)) {
        continue;
      }
    }
    adjacencyDefinitions.push(yieldChangeDef);
  }
  if (adjacencyDefinitions.length === 0) {
    return [];
  }
  const groups = [];
  let counter = 0;
  for (const yieldDefinition of GameInfo.Yields) {
    const perChangeMap = /* @__PURE__ */ new Map();
    for (const changeDefinition of adjacencyDefinitions) {
      if (changeDefinition.YieldType !== yieldDefinition.YieldType) {
        continue;
      }
      const list = perChangeMap.get(changeDefinition.YieldChange);
      if (list) {
        list.push(changeDefinition);
      } else {
        perChangeMap.set(changeDefinition.YieldChange, [changeDefinition]);
      }
    }
    perChangeMap.forEach((definitions, value) => {
      const id = `${yieldDefinition.YieldType}-${value}-${counter}`;
      counter += 1;
      if (definitions.length <= 1) {
        groups.push({
          id,
          textKey: "LOC_UI_ADJACENCY_INFO_OBJECT",
          args: [value, `[icon:${yieldDefinition.YieldType}]`, parseConstructibleAdjacencyNameOnly(definitions[0])]
        });
        return;
      }
      groups.push({
        id,
        textKey: "LOC_UI_ADJACENCY_INFO_GENERIC",
        args: [value, yieldDefinition.YieldType],
        listMarkup: buildAdjacencyListMarkup(definitions)
      });
    });
  }
  return groups;
};
const shouldShowBonus = (value) => value !== void 0 && value !== null && value !== "";
const ConstructibleDetails = (props) => {
  const [local, other] = splitProps(props, ["definition", "isPurchase", "dividerStyle", "warehouseBonus", "adjacencyBonus", "cost", "class"]);
  const selectedCity = createMemo(() => {
    const cityID = UI.Player.getHeadSelectedCity();
    return cityID ? Cities.get(cityID) : null;
  });
  const dividerStyle = createMemo(() => local.dividerStyle ?? "normal");
  const tags = createMemo(() => {
    const type = props.definition.ConstructibleType;
    return type ? getConstructibleTagsFromType(type) : [];
  });
  const baseYields = createMemo(() => collectYieldChanges(props.definition.ConstructibleType));
  const modifierTexts = createMemo(() => collectModifierTexts(props.definition.ConstructibleType));
  const tooltipText = createMemo(() => props.definition.Tooltip ?? "");
  const greatPeopleTexts = createMemo(() => collectUnlockedGreatPeople(props.definition.ConstructibleType, selectedCity()));
  const showTooltip = createMemo(() => !!tooltipText());
  const costIcon = createMemo(() => local.isPurchase ? "YIELD_GOLD" : "YIELD_PRODUCTION");
  const maintenanceEntries = createMemo(() => collectMaintenanceEntries(props.definition.ConstructibleType, selectedCity()));
  const adjacencyGroups = createMemo(() => collectAdjacencyGroups(props.definition.ConstructibleType, selectedCity()));
  const showWarehouseBonus = createMemo(() => shouldShowBonus(local.warehouseBonus));
  const showAdjacencyBonus = createMemo(() => shouldShowBonus(local.adjacencyBonus));
  const showMidSection = createMemo(() => {
    return baseYields().length > 0 || adjacencyGroups().length > 0 || modifierTexts().length > 0 || greatPeopleTexts().length > 0 || showTooltip();
  });
  const showBottomSection = createMemo(() => {
    return local.cost != 0 || maintenanceEntries().length > 0 || showWarehouseBonus() || showAdjacencyBonus();
  });
  return (() => {
    var _el$ = _tmpl$7(), _el$2 = _el$.firstChild;
    spread(_el$, mergeProps({
      get ["class"]() {
        return `mt-10 img-base-ticket-bg-container ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$, createComponent(Icon, {
      "class": "size-20 self-center -mt-16 mb-2\\.5",
      get name() {
        return props.definition.ConstructibleType ?? void 0;
      }
    }), _el$2);
    insert(_el$2, createComponent(For, {
      get each() {
        return tags();
      },
      children: (tag) => createComponent(PillText, {
        "class": "mx-1 mb-2 text-sm",
        text: tag
      })
    }));
    insert(_el$, createComponent(Show, {
      get when() {
        return showMidSection();
      },
      get children() {
        return [createComponent(Show, {
          get when() {
            return dividerStyle() === "text-divider";
          },
          get fallback() {
            return _tmpl$4();
          },
          get children() {
            var _el$3 = _tmpl$(), _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
            insert(_el$5, createComponent(L10n.Compose, {
              text: "LOC_UI_CONTENT_MGR_DETAILS"
            }));
            return _el$3;
          }
        }), createComponent(Show, {
          get when() {
            return baseYields().length > 0;
          },
          get children() {
            var _el$6 = _tmpl$2();
            insert(_el$6, createComponent(For, {
              get each() {
                return baseYields();
              },
              children: (yieldValue) => createComponent(L10n.Stylize, {
                "class": "mr-2",
                text: "LOC_UI_POS_YIELD_ICON_ONLY",
                get args() {
                  return [yieldValue.amount, yieldValue.yieldType];
                }
              })
            }));
            return _el$6;
          }
        }), createComponent(Show, {
          get when() {
            return adjacencyGroups().length > 0;
          },
          get children() {
            var _el$7 = _tmpl$3();
            insert(_el$7, createComponent(For, {
              get each() {
                return adjacencyGroups();
              },
              children: (group, index) => (() => {
                var _el$18 = _tmpl$8();
                insert(_el$18, createComponent(L10n.Stylize, {
                  get ["class"]() {
                    return `block ${index() > 0 ? "mt-2" : ""} ${group.listMarkup ? "mb-2" : ""}`.trim();
                  },
                  get text() {
                    return group.textKey;
                  },
                  get args() {
                    return group.args;
                  }
                }), null);
                insert(_el$18, createComponent(Show, {
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
                return _el$18;
              })()
            }));
            return _el$7;
          }
        }), createComponent(Show, {
          get when() {
            return modifierTexts().length > 0;
          },
          get children() {
            var _el$8 = _tmpl$3();
            insert(_el$8, createComponent(For, {
              get each() {
                return modifierTexts();
              },
              children: (text, index) => createComponent(L10n.Stylize, {
                get ["class"]() {
                  return `block ${index() > 0 ? "mt-1" : ""}`.trim();
                },
                text
              })
            }));
            return _el$8;
          }
        }), createComponent(Show, {
          get when() {
            return showTooltip();
          },
          get children() {
            return createComponent(L10n.Stylize, {
              "class": "mb-2",
              get text() {
                return tooltipText();
              },
              ref: formatStylizedSpacing
            });
          }
        }), createComponent(Show, {
          get when() {
            return greatPeopleTexts().length > 0;
          },
          get children() {
            var _el$9 = _tmpl$3();
            insert(_el$9, createComponent(For, {
              get each() {
                return greatPeopleTexts();
              },
              children: (text, index) => createComponent(L10n.Stylize, {
                get ["class"]() {
                  return `block ${index() > 0 ? "mt-1" : ""}`.trim();
                },
                text
              })
            }));
            return _el$9;
          }
        })];
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return showBottomSection();
      },
      get children() {
        return [_tmpl$4(), createComponent(Show, {
          get when() {
            return local.cost;
          },
          children: (cost) => createComponent(L10n.Stylize, {
            text: "LOC_UI_PRODUCTION_CONSTRUCTIBLE_COST",
            get args() {
              return [cost(), costIcon()];
            }
          })
        }), createComponent(Show, {
          get when() {
            return maintenanceEntries().length > 0;
          },
          get children() {
            var _el$11 = _tmpl$5(), _el$12 = _el$11.firstChild;
            insert(_el$12, createComponent(L10n.Compose, {
              text: "LOC_UI_PRODUCTION_MAINTENANCE"
            }));
            insert(_el$11, createComponent(For, {
              get each() {
                return maintenanceEntries();
              },
              children: (entry) => createComponent(L10n.Stylize, {
                "class": "mr-2",
                text: "LOC_UI_PRODUCTION_MAINTENANCE_NEGATIVE_VALUE",
                get args() {
                  return [entry.value, entry.yieldType];
                }
              })
            }), null);
            return _el$11;
          }
        }), createComponent(Show, {
          get when() {
            return showWarehouseBonus();
          },
          get children() {
            var _el$13 = _tmpl$6(), _el$14 = _el$13.firstChild;
            insert(_el$14, createComponent(L10n.Compose, {
              text: "LOC_BUILDING_PLACEMENT_WAREHOUSE_IMPROVEMENTS"
            }));
            insert(_el$13, createComponent(L10n.Stylize, {
              "class": "mr-2",
              text: "{1_amount} [icon:{2_icon}]",
              get args() {
                return [local.warehouseBonus, "YIELD_WAREHOUSE"];
              }
            }), null);
            return _el$13;
          }
        }), createComponent(Show, {
          get when() {
            return showAdjacencyBonus();
          },
          get children() {
            var _el$15 = _tmpl$6(), _el$16 = _el$15.firstChild;
            insert(_el$16, createComponent(L10n.Compose, {
              text: "LOC_BUILDING_PLACEMENT_HIGHEST_ADJACENCIES"
            }));
            insert(_el$15, createComponent(L10n.Stylize, {
              "class": "mr-2",
              text: "{1_amount} [icon:{2_icon}]",
              get args() {
                return [local.adjacencyBonus, "YIELD_ADJACENCY"];
              }
            }), null);
            return _el$15;
          }
        })];
      }
    }), null);
    return _el$;
  })();
};

export { ConstructibleDetails };
//# sourceMappingURL=constructible-details.js.map
