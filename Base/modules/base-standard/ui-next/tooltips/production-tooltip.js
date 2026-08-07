import { template, spread, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, mergeProps, createComponent, Show, For, Switch, Match } from '../../../core/vendor/solid-js/dist/solid.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { ProductionPanelCategory, GetTownFocusBlp } from '../../ui/production-chooser/production-chooser-helpers.js';
import { ConstructibleDetails } from '../components/constructible-details.js';
import { AdvisorRecommendationPill, PillText } from '../components/pills.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap items-center justify-center mt-2 -mb-1"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex items-center"><div class=text-negative-light></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class=img-base-ticket-bg-container><div class="img-shell-line-divider h-1 w-1/2 self-center mb-2"></div><div class="img-shell-line-divider h-1 w-1/2 self-center mb-2"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap items-center justify-center mt-4 -mb-1"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div class="flex flex-row items-center self-center"><div class=filigree-shell-small-left></div><div class=filigree-shell-small-right></div></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class=img-base-ticket-bg-container></div>`);
const BULLET_CHAR = String.fromCodePoint(8226);
const normalizeCategory = (value) => {
  if (!value) {
    return ProductionPanelCategory.BUILDINGS;
  }
  switch (value) {
    case ProductionPanelCategory.UNITS:
      return ProductionPanelCategory.UNITS;
    case ProductionPanelCategory.PROJECTS:
      return ProductionPanelCategory.PROJECTS;
    case ProductionPanelCategory.WONDERS:
      return ProductionPanelCategory.WONDERS;
    default:
      return ProductionPanelCategory.BUILDINGS;
  }
};
const parseRecommendations = (values) => values ?? [];
const ProductionConstructibleTooltipContent = (props) => {
  const [local, other] = splitProps(props, ["constructibleType", "name", "description", "recommendations", "warehouseCount", "canGetWarehouseBonuses", "highestAdjacency", "canGetAdjacencyBonuses", "isPurchase", "productionCost", "class"]);
  const definition = createMemo(() => {
    const definition2 = local.constructibleType ? GameInfo.Constructibles.lookup(local.constructibleType) : null;
    if (!definition2) {
      console.error(`No constructible definition found for type: ${local.constructibleType}`);
    }
    return definition2;
  });
  const title = createMemo(() => definition()?.Name ?? local.name ?? "");
  const showWarehouse = () => local.canGetWarehouseBonuses && !!local.warehouseCount;
  const showAdjacency = () => local.canGetAdjacencyBonuses && !!local.highestAdjacency;
  const showCostPill = () => local.productionCost !== void 0;
  const showBottomRow = () => local.recommendations.length > 0 || showCostPill();
  return (() => {
    var _el$ = _tmpl$2();
    spread(_el$, mergeProps({
      get ["class"]() {
        return `flex flex-col font-body text-sm text-accent-2 ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$, createComponent(FiligreeTitle.Small, {
      "class": "mb-1",
      get text() {
        return title();
      },
      bgGlow: true
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return definition();
      },
      children: (definition2) => createComponent(ConstructibleDetails, {
        "class": "mb-1",
        get definition() {
          return definition2();
        },
        get isPurchase() {
          return local.isPurchase;
        },
        get warehouseBonus() {
          return showWarehouse() ? local.warehouseCount ?? "0" : void 0;
        },
        get adjacencyBonus() {
          return showAdjacency() ? local.highestAdjacency ?? "0" : void 0;
        }
      })
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return showBottomRow();
      },
      get children() {
        var _el$2 = _tmpl$();
        insert(_el$2, createComponent(For, {
          get each() {
            return local.recommendations;
          },
          children: (rec, index) => createComponent(AdvisorRecommendationPill, {
            textOverride: "LOC_UI_RECOMMENDATION_DEFAULT",
            get ["class"]() {
              return index() > 0 ? "ml-2 mt-2" : "mt-2";
            },
            recommendation: rec
          })
        }), null);
        insert(_el$2, createComponent(Show, {
          get when() {
            return showCostPill();
          },
          get children() {
            return createComponent(PillText, {
              get ["class"]() {
                return local.recommendations.length > 0 ? "ml-2 mt-2" : "mt-2";
              },
              text: "LOC_CARD_COST",
              get args() {
                return [`${local.productionCost}[icon:${local.isPurchase ? "YIELD_GOLD" : "YIELD_PRODUCTION"}]`];
              }
            });
          }
        }), null);
        return _el$2;
      }
    }), null);
    return _el$;
  })();
};
const ProductionUnitTooltipContent = (props) => {
  const [local, other] = splitProps(props, ["unitType", "name", "description", "recommendations", "isPurchase", "cost", "class"]);
  const definition = createMemo(() => local.unitType ? GameInfo.Units.lookup(local.unitType) : null);
  const title = createMemo(() => definition()?.Name ?? local.name ?? "");
  const descriptionKey = createMemo(() => local.description ?? definition()?.Description ?? "");
  const maintenanceValue = createMemo(() => definition()?.Maintenance ?? 0);
  const maintenanceVisible = () => maintenanceValue() > 0;
  const productionCost = createMemo(() => {
    if (local.isPurchase) {
      return local.cost ? Number(local.cost) : void 0;
    }
    if (!definition()) {
      return void 0;
    }
    const cityID = UI.Player.getHeadSelectedCity();
    if (!cityID) {
      return void 0;
    }
    const city = Cities.get(cityID);
    return city?.Production?.getUnitProductionCost(definition().UnitType);
  });
  const showCostPill = () => productionCost() !== void 0;
  const showBottomRow = () => local.recommendations.length > 0 || showCostPill();
  return (() => {
    var _el$3 = _tmpl$4(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling;
    spread(_el$3, mergeProps({
      get ["class"]() {
        return `flex flex-col font-body text-sm text-accent-2 ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$3, createComponent(FiligreeTitle.Small, {
      "class": "mb-1",
      get text() {
        return title();
      },
      bgGlow: true
    }), _el$4);
    insert(_el$4, createComponent(Show, {
      get when() {
        return descriptionKey();
      },
      get children() {
        return createComponent(L10n.Stylize, {
          "class": "mb-2",
          get text() {
            return descriptionKey() ?? "";
          }
        });
      }
    }), _el$6);
    insert(_el$4, createComponent(Show, {
      get when() {
        return maintenanceVisible();
      },
      get children() {
        var _el$7 = _tmpl$3(), _el$8 = _el$7.firstChild;
        insert(_el$7, createComponent(L10n.Stylize, {
          "class": "mr-2",
          text: "LOC_UI_PRODUCTION_MAINTENANCE"
        }), _el$8);
        insert(_el$7, createComponent(Icon, {
          "class": "size-5 mr-1",
          name: "YIELD_GOLD",
          get ["aria-label"]() {
            return Locale.compose("LOC_YIELD_GOLD");
          }
        }), _el$8);
        insert(_el$8, () => `-${maintenanceValue()}`);
        return _el$7;
      }
    }), null);
    insert(_el$3, createComponent(Show, {
      get when() {
        return showBottomRow();
      },
      get children() {
        var _el$9 = _tmpl$();
        insert(_el$9, createComponent(For, {
          get each() {
            return local.recommendations;
          },
          children: (rec, index) => createComponent(AdvisorRecommendationPill, {
            textOverride: "LOC_UI_RECOMMENDATION_DEFAULT",
            get ["class"]() {
              return index() > 0 ? "ml-2 mt-2" : "mt-2";
            },
            get classList() {
              return {
                "ml-2": index() > 0
              };
            },
            recommendation: rec
          })
        }), null);
        insert(_el$9, createComponent(Show, {
          get when() {
            return showCostPill();
          },
          get children() {
            return createComponent(PillText, {
              get ["class"]() {
                return local.recommendations.length > 0 ? "ml-2 mt-2" : "mt-2";
              },
              text: "LOC_CARD_COST",
              get args() {
                return [`${productionCost()}[icon:${local.isPurchase ? "YIELD_GOLD" : "YIELD_PRODUCTION"}]`];
              }
            });
          }
        }), null);
        return _el$9;
      }
    }), null);
    return _el$3;
  })();
};
const parseProjectTypeHash = (value) => {
  if (!value) {
    return void 0;
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  return Game.getHash(value);
};
const getProjectRequirements = (projectHash) => {
  if (!projectHash) {
    return void 0;
  }
  const project = GameInfo.Projects.lookup(projectHash);
  if (!project) {
    return void 0;
  }
  if (project.PrereqPopulation > 0) {
    return {
      key: "LOC_UI_PRODUCTION_REQUIRES_POPULATION",
      args: [project.PrereqPopulation]
    };
  }
  if (project.PrereqConstructible) {
    const definition = GameInfo.Constructibles.lookup(project.PrereqConstructible);
    if (definition) {
      return {
        key: "LOC_UI_PRODUCTION_REQUIRES_CONSTRUCTIBLE",
        args: [definition.Name ?? ""]
      };
    }
  }
  return void 0;
};
const ProductionProjectTooltipContent = (props) => {
  const [local, other] = splitProps(props, ["projectType", "name", "description", "recommendations", "growthType", "class"]);
  const projectHash = createMemo(() => parseProjectTypeHash(local.projectType));
  const iconUrl = createMemo(() => GetTownFocusBlp(local.growthType ?? null, projectHash() ?? null));
  const iconBackground = createMemo(() => iconUrl() ? `url(${iconUrl()})` : void 0);
  const productionCost = createMemo(() => {
    const hash = projectHash();
    if (!hash) {
      return void 0;
    }
    const cityID = UI.Player.getHeadSelectedCity();
    if (!cityID) {
      return void 0;
    }
    const city = Cities.get(cityID);
    return city?.Production?.getProjectProductionCost(hash);
  });
  const definition = createMemo(() => GameInfo.Projects.lookup(projectHash() ?? ""));
  const requirementsText = createMemo(() => getProjectRequirements(projectHash()));
  const applyDescriptionFormatting = (element) => {
    if (!element) {
      return;
    }
    let firstChild = true;
    let prevChildIsList = false;
    for (const node of Array.from(element.children)) {
      const isList = node.innerHTML.includes(BULLET_CHAR);
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
  const showCostPill = () => productionCost() !== void 0;
  const showBottomRow = () => local.recommendations.length > 0 || showCostPill();
  return (() => {
    var _el$10 = _tmpl$6(), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
    spread(_el$10, mergeProps({
      get ["class"]() {
        return `flex flex-col text-accent-2 font-body text-sm relative ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$10, createComponent(FiligreeTitle.None, {
      get text() {
        return local.name ?? "";
      },
      bgGlow: true
    }), _el$11);
    insert(_el$11, createComponent(Icon, {
      "class": "size-12",
      get name() {
        return iconBackground() ?? "";
      },
      isUrl: true
    }), _el$13);
    insert(_el$10, createComponent(Show, {
      get when() {
        return local.description || definition()?.Description;
      },
      children: (text) => (() => {
        var _el$15 = _tmpl$7();
        insert(_el$15, createComponent(L10n.Stylize, {
          "class": "mt-2",
          get text() {
            return text() ?? "";
          },
          ref: applyDescriptionFormatting
        }));
        return _el$15;
      })()
    }), null);
    insert(_el$10, createComponent(Show, {
      get when() {
        return requirementsText();
      },
      children: (reqData) => createComponent(L10n.Stylize, {
        "class": "flex mt-2 p-2",
        style: {
          "background-color": "rgb(0 0 0 / 0.2)"
        },
        get text() {
          return reqData().key;
        },
        get args() {
          return reqData().args;
        }
      })
    }), null);
    insert(_el$10, createComponent(Show, {
      get when() {
        return showBottomRow();
      },
      get children() {
        var _el$14 = _tmpl$5();
        insert(_el$14, createComponent(For, {
          get each() {
            return local.recommendations;
          },
          children: (rec, index) => createComponent(AdvisorRecommendationPill, {
            textOverride: "LOC_UI_RECOMMENDATION_DEFAULT",
            get ["class"]() {
              return index() > 0 ? "ml-2 mt-2" : "mt-2";
            },
            recommendation: rec
          })
        }), null);
        insert(_el$14, createComponent(Show, {
          get when() {
            return showCostPill();
          },
          get children() {
            return createComponent(PillText, {
              get ["class"]() {
                return local.recommendations.length > 0 ? "ml-2 mt-2" : "mt-2";
              },
              text: "LOC_CARD_COST",
              get args() {
                return [`${productionCost()}[icon:YIELD_PRODUCTION]`];
              }
            });
          }
        }), null);
        return _el$14;
      }
    }), null);
    return _el$10;
  })();
};
const ProductionTooltipComponent = (props) => {
  const [local, other] = splitProps(props, ["category", "children", "class", "type", "name", "description", "tooltipDescription", "recommendations", "isPurchase", "cost", "warehouseCount", "highestAdjacency", "canGetWarehouseBonuses", "canGetAdjacencyBonuses", "projectGrowthType"]);
  const normalizedCategoryValue = createMemo(() => normalizeCategory(local.category));
  const recommendations = createMemo(() => parseRecommendations(local.recommendations));
  const constructibleProductionCost = createMemo(() => {
    if (local.isPurchase) {
      return local.cost ? Number(local.cost) : void 0;
    }
    if (!local.type) {
      return void 0;
    }
    const cityID = UI.Player.getHeadSelectedCity();
    if (!cityID) {
      return void 0;
    }
    const city = Cities.get(cityID);
    return city?.Production?.getConstructibleProductionCost(Game.getHash(local.type));
  });
  const tooltipContentClass = () => `w-128`;
  return createComponent(Tooltip, mergeProps(other, {
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
              return createComponent(Switch, {
                get fallback() {
                  return createComponent(ProductionConstructibleTooltipContent, {
                    get ["class"]() {
                      return tooltipContentClass();
                    },
                    get constructibleType() {
                      return local.type;
                    },
                    get name() {
                      return local.name;
                    },
                    get description() {
                      return local.description;
                    },
                    get recommendations() {
                      return recommendations();
                    },
                    get warehouseCount() {
                      return local.warehouseCount;
                    },
                    get canGetWarehouseBonuses() {
                      return local.canGetWarehouseBonuses;
                    },
                    get highestAdjacency() {
                      return local.highestAdjacency;
                    },
                    get canGetAdjacencyBonuses() {
                      return local.canGetAdjacencyBonuses;
                    },
                    get isPurchase() {
                      return local.isPurchase;
                    },
                    get productionCost() {
                      return constructibleProductionCost();
                    }
                  });
                },
                get children() {
                  return [createComponent(Match, {
                    get when() {
                      return normalizedCategoryValue() === ProductionPanelCategory.UNITS;
                    },
                    get children() {
                      return createComponent(ProductionUnitTooltipContent, {
                        get ["class"]() {
                          return tooltipContentClass();
                        },
                        get unitType() {
                          return local.type;
                        },
                        get name() {
                          return local.name;
                        },
                        get description() {
                          return local.description;
                        },
                        get recommendations() {
                          return recommendations();
                        },
                        get isPurchase() {
                          return local.isPurchase;
                        },
                        get cost() {
                          return local.cost;
                        }
                      });
                    }
                  }), createComponent(Match, {
                    get when() {
                      return normalizedCategoryValue() === ProductionPanelCategory.PROJECTS;
                    },
                    get children() {
                      return createComponent(ProductionProjectTooltipContent, {
                        get ["class"]() {
                          return tooltipContentClass();
                        },
                        get projectType() {
                          return local.type;
                        },
                        get name() {
                          return local.name;
                        },
                        get description() {
                          return local.tooltipDescription ?? local.description;
                        },
                        get recommendations() {
                          return recommendations();
                        },
                        get growthType() {
                          return local.projectGrowthType;
                        }
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
  }));
};
const ProductionTooltip = ComponentRegistry.register({
  name: "ProductionTooltip",
  createInstance: ProductionTooltipComponent,
  images: ["blp:base_ticket-bg", "blp:shell_line-divider"]
});

export { ProductionTooltip, ProductionTooltipComponent };
//# sourceMappingURL=production-tooltip.js.map
