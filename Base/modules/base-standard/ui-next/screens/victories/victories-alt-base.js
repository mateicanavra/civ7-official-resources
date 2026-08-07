import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip, TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../../core/ui-next/components/tooltip.js';
import { useIsSmallScreen, LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { VictoryRulesTooltip, VictoryHeader } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative w-full"><div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute -top-14 victories-header"><div class="font-body text-body text-xs self-center"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class=self-center></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row absolute -mt-6 ml-2 w-full victories-point-goal-line"><div><div role=heading></div></div><div class="victories-military-col-4 flex flex-row"><div class="h-full w-2"></div><div class="font-title text-xl text-white flex-1 self-center"></div></div><div class="victories-military-col-3 font-title text-sm uppercase flex flex-row"><div class="w-full self-center"><div class="self-start ml-2"></div></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div role=heading></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="victories-military-col-4 flex flex-row"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="victories-military-col-3 font-title text-sm uppercase flex flex-row"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="w-full h-4"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="victories-scrollarea shrink mb-2 flex flex-row w-full"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class=self-center>-</div>`);
const VictoriesAltBase = (props) => {
  const isSmallScreen = useIsSmallScreen();
  const layoutModel = LayoutModel.get();
  const scrollAreaClass = () => typeof props.scrollAreaClass === "function" ? props.scrollAreaClass() : props.scrollAreaClass;
  return (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
    insert(_el$, createComponent(Show, {
      get when() {
        return !props.isScoreTab;
      },
      get children() {
        return createComponent(VSlot, {
          get name() {
            return props.slotName;
          },
          get ["class"]() {
            return props.slotClass || "h-full flex flex-col items-center w-full transition-opacity duration-150 ease-out";
          },
          get children() {
            return renderContent();
          }
        });
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.isScoreTab;
      },
      get children() {
        var _el$3 = _tmpl$();
        insert(_el$3, renderContent);
        createRenderEffect(() => className(_el$3, props.slotClass || "h-full flex flex-col items-center w-full"));
        return _el$3;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = props.backgroundClass, _v$2 = props.backgroundImage;
      _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background-image", _v$2) : _el$2.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
  function renderContent() {
    return [createComponent(Show, {
      get when() {
        return !isSmallScreen();
      },
      get children() {
        var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild;
        insert(_el$5, createComponent(L10n.Compose, {
          get text() {
            return props.headerText;
          }
        }));
        return _el$4;
      }
    }), createComponent(Show, {
      get when() {
        return !props.isScoreTab;
      },
      get children() {
        var _el$6 = _tmpl$5(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$7.nextSibling, _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling, _el$13 = _el$9.nextSibling, _el$14 = _el$13.firstChild, _el$15 = _el$14.firstChild;
        insert(_el$8, createComponent(L10n.Compose, {
          get text() {
            return props.victoryName;
          }
        }));
        insert(_el$11, createComponent(Show, {
          get when() {
            return props.pointGoal != null && props.pointGoal != -1;
          },
          get fallback() {
            return createComponent(Tooltip.Text, {
              get text() {
                return Locale.stylize("LOC_VICTORY_NOVICTORIES_TOOLTIP");
              },
              get children() {
                return _tmpl$12();
              }
            });
          },
          get children() {
            var _el$12 = _tmpl$4();
            insert(_el$12, () => Locale.toNumber(props.pointGoal || 0));
            return _el$12;
          }
        }));
        insert(_el$15, createComponent(L10n.Compose, {
          get text() {
            return props.pointGoalLabel || "";
          }
        }));
        insert(_el$6, createComponent(VictoryRulesTooltip, {
          get initialHPosition() {
            return TooltipHorizontalPosition.LEFT;
          },
          get initialVPosition() {
            return TooltipVerticalPosition.TOP;
          },
          "class": "self-center",
          get tooltipText() {
            return props.rulesText || "";
          },
          get titleText() {
            return props.victoryName;
          },
          get titleClass() {
            return props.titleColorClass;
          }
        }), null);
        createRenderEffect(() => className(_el$7, `victories-military-cols-1-and-2 font-title uppercase font-bold ${props.titleColorClass} text-lg`));
        return _el$6;
      }
    }), createComponent(Show, {
      get when() {
        return props.isScoreTab;
      },
      get children() {
        return createComponent(HSlot, {
          "class": "absolute -mt-6 ml-2 pb-1 w-full victories-point-goal-line",
          get children() {
            return [(() => {
              var _el$16 = _tmpl$6(), _el$17 = _el$16.firstChild;
              insert(_el$17, createComponent(L10n.Compose, {
                get text() {
                  return props.victoryName;
                }
              }));
              createRenderEffect(() => className(_el$16, `victories-military-cols-1-and-2 font-title uppercase font-bold ${props.titleColorClass} text-lg`));
              return _el$16;
            })(), _tmpl$7(), _tmpl$8()];
          }
        });
      }
    }), _tmpl$9(), createComponent(VictoryHeader, {
      get ["class"]() {
        return props.isScoreTab ? "w-full" : "";
      },
      hideContentColumnDivider: true,
      get children() {
        return createComponent(props.headerContent, {});
      }
    }), (() => {
      var _el$21 = _tmpl$11();
      insert(_el$21, createComponent(ScrollArea, {
        get ["class"]() {
          return scrollAreaClass();
        },
        useProxy: true,
        get children() {
          return [createComponent(Show, {
            get when() {
              return !props.isScoreTab;
            },
            get children() {
              return props.children;
            }
          }), createComponent(Show, {
            get when() {
              return props.isScoreTab;
            },
            get children() {
              var _el$22 = _tmpl$10();
              insert(_el$22, () => props.children, null);
              insert(_el$22, createComponent(Show, {
                get when() {
                  return layoutModel.screenHeightDownScaled() < 1e3;
                },
                get children() {
                  return createMemo(() => !!props.rightContentSmallScreen)() && createComponent(props.rightContentSmallScreen, {});
                }
              }), null);
              return _el$22;
            }
          })];
        }
      }), null);
      insert(_el$21, createComponent(Show, {
        get when() {
          return !props.isScoreTab;
        },
        get children() {
          var _el$23 = _tmpl$();
          insert(_el$23, createComponent(props.rightContent, {}));
          createRenderEffect(() => className(_el$23, props.rightContentClass || "victories-econ-col-3 victories-economic-graph relative"));
          return _el$23;
        }
      }), null);
      insert(_el$21, createComponent(Show, {
        get when() {
          return createMemo(() => !!props.isScoreTab)() && layoutModel.screenHeightDownScaled() >= 1e3;
        },
        get children() {
          return createComponent(props.rightContent, {});
        }
      }), null);
      return _el$21;
    })()];
  }
};

export { VictoriesAltBase };
//# sourceMappingURL=victories-alt-base.js.map
