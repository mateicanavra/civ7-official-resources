import { template, className, insert, style } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, createRenderEffect, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { CheckBox } from '../../../../core/ui-next/components/check-box.js';
import { Divider } from '../../../../core/ui-next/components/divider.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { MinimalOrnateCard } from '../../../../core/ui-next/components/ornate-card.js';
import { RingMeter } from '../../../../core/ui-next/components/ring-meter.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../../core/ui-next/utilities/component-utilities.js';
import { DedicationCardContents } from './dedication-card-contents.js';
import { getTriumphTrackingManager } from './triumph-tracking-manager.js';
import style$1 from './triumph-card.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-80 pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="absolute w-28 h-9 left-6 -top-1 bg-contain bg-no-repeat bg-center opacity-30"></div><div class="absolute w-28 h-9 right-6 -top-1 bg-contain bg-no-repeat bg-center opacity-30"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="mt-1 font-fit-shrink w-full flex-row justify-center text-xs text-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col grow mt-3 text-center w-full flex-row justify-center items-center relative"><div class="text-center font-fit-shrink w-full flex-row justify-center text-xs"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex mt-2 flex-row uppercase text-sm justify-center items-center"><div class=font-fit-shrink></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="text-negative uppercase font-fit-shrink mt-2 w-full text-center text-sm"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="flex text-secondary uppercase mt-8 w-full flex-row items-center justify-center text-center font-title"></div><div><div class="flex flex-row justify-center items-center mb-6"><div class="dedication-pill px-2 uppercase flex-row justify-center flex flex-row items-center"></div></div></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="size-14 bg-no-repeat bg-contain bg-center absolute"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="size-10 absolute"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="size-9 bg-no-repeat bg-contain bg-center absolute"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="size-10 bg-no-repeat bg-contain bg-center absolute"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="size-19 absolute -top-7 flex flex-col items-center justify-center self-center bg-cover bg-center bg-no-repeat pointer-events-none"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div><div class="flex flex-col mt-3 text-center mt-1 font-fit-shrink w-full flex-row justify-center relative"><div class="flex flex-row items-center justify-center img-popup-header-bk absolute -top-3 -left-3 -right-3 h-11 text-center"></div><div class="mt-9 bg-accent6 w-full text-sm font-fit-shrink"></div></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="text-positive uppercase font-fit-shrink mt-2 w-full text-center text-sm"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="flex flex-col triumph-card my-4 mx-1\\.5 w-84 min-h-96 pointer-events-auto group"></div>`);
const TriumphCardComponent = (props) => {
  const canToggleTracked = () => {
    return props.model !== void 0 && !props.triumph.isFirstOnly && !props.triumph.isTriggered;
  };
  const toggleTracked = () => {
    if (!canToggleTracked()) {
      return;
    }
    getTriumphTrackingManager().onClickTrackTriumph(props.triumph.triumphType);
    props.triumph.isTracked = !props.triumph.isTracked;
  };
  const cardContent = () => createComponent(MinimalOrnateCard, {
    get ["class"]() {
      return `flex flex-col flex-auto items-center opacity-100 ${props.classList ?? ""}`;
    },
    get isBright() {
      return props.triumph.isTriggered;
    },
    get iconElement() {
      return (() => {
        var _el$16 = _tmpl$12();
        _el$16.style.setProperty("background-image", "url(blp:base_triumph_ring)");
        insert(_el$16, createComponent(RingMeter, {
          "class": "size-13 absolute flex justify-center bg-contain bg-center flex-auto items-center",
          min: 0,
          get max() {
            return props.triumph.progressGoal ?? 0;
          },
          get value() {
            return !props.triumph.isFirstOnly ? props.triumph.currentProgress ?? 0 : 0;
          },
          isTopOrigin: true,
          ringImage: `url("blp:progress_ring_triumph")`,
          ringTint: "rgba(73, 209, 130, 1)",
          get progressPips() {
            return props.triumph.progressPips;
          },
          get children() {
            return [(() => {
              var _el$17 = _tmpl$8();
              createRenderEffect((_$p) => (_$p = props.triumph.traitIcon) != null ? _el$17.style.setProperty("background-image", _$p) : _el$17.style.removeProperty("background-image"));
              return _el$17;
            })(), createComponent(Show, {
              get when() {
                return props.triumph.isFirstOnly;
              },
              get children() {
                return [(() => {
                  var _el$18 = _tmpl$9();
                  _el$18.style.setProperty("background-color", "rgba(0,0,0,0.6)");
                  _el$18.style.setProperty("border-radius", "50%");
                  return _el$18;
                })(), (() => {
                  var _el$19 = _tmpl$10();
                  _el$19.style.setProperty("background-image", "url(blp:icon_lock)");
                  return _el$19;
                })()];
              }
            }), createComponent(Show, {
              get when() {
                return props.triumph.isTriggered;
              },
              get children() {
                return [(() => {
                  var _el$20 = _tmpl$9();
                  _el$20.style.setProperty("background-color", "rgba(0,0,0,0.6)");
                  _el$20.style.setProperty("border-radius", "50%");
                  return _el$20;
                })(), (() => {
                  var _el$21 = _tmpl$11();
                  _el$21.style.setProperty("background-image", "url(blp:icon_checkmark)");
                  return _el$21;
                })()];
              }
            })];
          }
        }));
        return _el$16;
      })();
    },
    get children() {
      return [_tmpl$(), (() => {
        var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
        _el$3.style.setProperty("background-image", "url(blp:base_top-filigree_left)");
        _el$4.style.setProperty("background-image", "url(blp:base_top-filigree_right)");
        createRenderEffect((_p$) => {
          var _v$ = `absolute top-1 bottom-0 left-0 right-0 ${props.triumph.isComingSoon ? "opacity-50" : ""}`, _v$2 = props.triumph.bgColor;
          _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
          _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background", _v$2) : _el$2.style.removeProperty("background"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$2;
      })(), (() => {
        var _el$5 = _tmpl$7(), _el$6 = _el$5.firstChild, _el$10 = _el$6.nextSibling, _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild;
        insert(_el$6, createComponent(L10n.Stylize, {
          get text() {
            return props.triumph.triumphName;
          }
        }));
        insert(_el$5, createComponent(Show, {
          get when() {
            return !props.triumph.isFirstOnly;
          },
          get fallback() {
            return (() => {
              var _el$22 = _tmpl$13(), _el$23 = _el$22.firstChild, _el$24 = _el$23.firstChild, _el$25 = _el$24.nextSibling;
              insert(_el$24, createComponent(L10n.Compose, {
                text: "LOC_TRIUMPH_NOT_AVAILABLE"
              }));
              insert(_el$25, createComponent(L10n.Stylize, {
                text: "LOC_TRIUMPH_ALREADY_EARNED",
                get args() {
                  return [props.triumph.raceWinnerName ?? ""];
                }
              }));
              return _el$22;
            })();
          },
          get children() {
            var _el$7 = _tmpl$4(), _el$8 = _el$7.firstChild;
            insert(_el$8, createComponent(Show, {
              get when() {
                return IsControllerActive();
              },
              get fallback() {
                return createComponent(L10n.Stylize, {
                  get text() {
                    return props.triumph.triumphRequirements;
                  }
                });
              },
              get children() {
                return createComponent(L10n.Stylize, {
                  get text() {
                    return props.triumph.triumphRequirements;
                  },
                  args: ["disableTooltips"]
                });
              }
            }));
            insert(_el$7, createComponent(Show, {
              get when() {
                return props.triumph.progressString != void 0;
              },
              get children() {
                var _el$9 = _tmpl$3();
                insert(_el$9, createComponent(L10n.Stylize, {
                  get text() {
                    return props.triumph.progressString;
                  }
                }));
                return _el$9;
              }
            }), null);
            return _el$7;
          }
        }), _el$10);
        insert(_el$11, createComponent(Divider.Vertical, {
          "class": "dedication-divider",
          gradientOverride: "linear-gradient(to right, rgba(51, 48, 54, 0), rgba(51, 48, 54, 1))",
          useGradient: true
        }), _el$12);
        insert(_el$12, createComponent(L10n.Compose, {
          get text() {
            return `${props.triumph.isMajor ? "LOC_LEGACIES_COMMEMORATIVE" : "LOC_LEGACIES_INSTANT"}`;
          }
        }));
        insert(_el$11, createComponent(Divider.Vertical, {
          "class": "dedication-divider",
          useGradient: true,
          gradientOverride: "linear-gradient(to right, rgba(51, 48, 54, 1), rgba(51, 48, 54, 0))"
        }), null);
        insert(_el$10, createComponent(DedicationCardContents, {
          get id() {
            return props.triumph.triumphType;
          },
          get description() {
            return props.triumph.triumphDescription;
          },
          get background() {
            return props.triumph.descriptionBG;
          },
          isDisplayOnly: true
        }), null);
        insert(_el$10, createComponent(Show, {
          get when() {
            return !props.triumph.isComingSoon && !props.triumph.isFirstOnly && !props.triumph.isTriggered;
          },
          get children() {
            return createComponent(Show, {
              get when() {
                return props.model != void 0;
              },
              get children() {
                var _el$13 = _tmpl$5(), _el$14 = _el$13.firstChild;
                insert(_el$14, createComponent(L10n.Compose, {
                  get text() {
                    return props.triumph.isTracked ? "LOC_LEGACIES_UNTRACK" : "LOC_LEGACIES_TRACK";
                  }
                }));
                insert(_el$13, createComponent(CheckBox, {
                  "class": "size-6",
                  disableFocus: true,
                  get isChecked() {
                    return props.triumph.isTracked;
                  },
                  onActivate: () => toggleTracked()
                }), null);
                return _el$13;
              }
            });
          }
        }), null);
        insert(_el$5, createComponent(Show, {
          get when() {
            return props.triumph.isFirstOnly;
          },
          get fallback() {
            return createComponent(Show, {
              get when() {
                return props.triumph.isTriggered;
              },
              get children() {
                var _el$26 = _tmpl$14();
                insert(_el$26, createComponent(L10n.Compose, {
                  text: "LOC_LEGACIES_COMPLETE"
                }));
                return _el$26;
              }
            });
          },
          get children() {
            var _el$15 = _tmpl$6();
            insert(_el$15, createComponent(L10n.Compose, {
              text: "LOC_MEMENTO_LOCKED_NAME"
            }));
            return _el$15;
          }
        }), null);
        createRenderEffect((_p$) => {
          var _v$3 = `flex flex-col flex-auto py-2 px-3 relative items-center justify-between ${props.triumph.isComingSoon ? "opacity-50" : ""}`, _v$4 = `flex flex-col mt-4 grow items-center self-stretch justify-end ${props.triumph.isFirstOnly ? "opacity-50" : ""}`;
          _v$3 !== _p$.e && className(_el$5, _p$.e = _v$3);
          _v$4 !== _p$.t && className(_el$10, _p$.t = _v$4);
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$5;
      })()];
    }
  });
  return createComponent(Show, {
    get when() {
      return props.isActivatable !== false;
    },
    get fallback() {
      return (() => {
        var _el$27 = _tmpl$15();
        insert(_el$27, cardContent);
        createRenderEffect((_$p) => style(_el$27, props.style, _$p));
        return _el$27;
      })();
    },
    get children() {
      return createComponent(Activatable, {
        "use:isFocusable": [true, void 0],
        "class": `flex flex-col triumph-card my-4 mx-1\\.5 w-84 min-h-96 pointer-events-auto group`,
        onActivate: () => {
          if (IsControllerActive() && canToggleTracked()) {
            toggleTracked();
          }
        },
        get style() {
          return props.style;
        },
        get children() {
          return cardContent();
        }
      });
    }
  });
};
ComponentUtilities.loadStyles(style$1);
const TriumphCard = ComponentRegistry.register({
  name: "TriumphCard",
  createInstance: TriumphCardComponent
});

export { TriumphCard };
//# sourceMappingURL=triumph-card.js.map
