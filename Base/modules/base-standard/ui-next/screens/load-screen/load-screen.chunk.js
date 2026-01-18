import { t as template, k as spread, m as mergeProps, h as createMemo, i as insert, e as createComponent, F as For, S as Show, f as createRenderEffect, g as className, A as Switch, M as Match, x as createContext, y as useContext, P as Panel, B as ComponentUtilities } from '../../../../core/ui-next/components/panel.chunk.js';
import { L as Layout } from '../../../../core/ui/utilities/utilities-layout.chunk.js';
import { F as Filigree, a as HeroButton2 } from '../../../../core/ui-next/components/hero-button.chunk.js';
import { H as Header } from '../../../../core/ui-next/components/header.chunk.js';
import { I as Icon, L as L10n, T as Tab, N as NavHelp } from '../../../../core/ui-next/components/l10n.chunk.js';
import { S as ScrollArea } from '../../../../core/ui-next/components/scroll-area.chunk.js';

const style = "fs://game/base-standard/ui-next/screens/load-screen/load-screen.css";

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<span>&nbsp;|&nbsp;</span>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="text-accent-4 load-screen-markup"><div class="flex flex-row text-primary-1 -mt-3 items-center"></div><div></div><div class="flex flex-row text-primary-1 flex-wrap justify-start items-start"><span class=uppercase></span><span class="uppercase text-accent-2"></span></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class="load-screen-tips-and-hints-inner-rect m-0\\.5 px-3\\.5 pt-2 pb-3\\.5"><span class="text-tertiary-1 leading-normal uppercase"></span><span class="text-tertiary-2 leading-none"></span></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row mb-9 text-accent-4 load-screen-markup"><div class=load-screen-icon-slot><div class="load-screen-unit-icon-bg m-3\\.5 relative"></div></div><div class="flex flex-col ml-6 flex-auto"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class=load-screen-icon-slot></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row mt-1 text-accent-4 load-screen-markup"><div class="flex flex-col ml-6 flex-auto"><div class="flex flex-col"></div></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col ml-3 load-screen-markup text-accent-4"><div class="flex flex-col mb-3 "><div class="flex flex-row mb-1"><span>&nbsp;</span><span class=text-accent-2></span></div><div class="flex flex-row"><div class="flex flex-col ml-6 flex-auto"></div></div></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="text-large font-medium text-tertiary-1"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex flex-row mb-9 text-accent-4 load-screen-markup"><div class=load-screen-icon-slot></div><div class="flex flex-col ml-6 flex-auto justify-center"></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class=load-screen-pagination></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="load-screen-progress-bar-bg absolute left-0 right-0 top-1\\.5"><div class="load-screen-progress-bar-fill transition-transform duration-1000"></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="absolute inset-0 bg-no-repeat bg-cover bg-center"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div data-name=bg-tint class="absolute inset-0 load-screen-bg-tint"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="load-screen-above-stage relative h-22"><div class="load-screen-above-stage-gradient absolute bottom-0 w-full"></div><div class="filigree-inner-frame-top-gold absolute -bottom-3 -left-5 -right-5"></div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div data-name=bg-filigrees class="absolute inset-0 flex flex-col"><div class="load-screen-bg-filigrees-top relative mx-8 mt-8 flex flex-row flex-auto"><div class="load-screen-bg-filigree flex-auto"></div><div class="load-screen-bg-filigree flex-auto -scale-x-100"></div></div><div class="load-screen-bg-filigrees-bottom relative mx-8 mb-8 flex flex-row flex-auto"><div class="load-screen-bg-filigree flex-auto -scale-y-100"></div><div class="load-screen-bg-filigree flex-auto -scale-100"></div></div></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class=pt-3></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="load-screen-stage flex-auto relative bg-no-repeat bg-cover bg-center flex flex-row"><div class="load-screen-stage-tint absolute inset-0"></div><div class="load-screen-stage-fill flex-auto relative"></div><div class="load-screen-centered-content relative h-full"><div class="load-screen-stage-gradient absolute"></div><div class="load-screen-leader-image-area overflow-hidden absolute"><div class="load-screen-leader-image-top-gradient absolute"></div><div class="load-screen-leader-image bg-cover bg-no-repeat relative"></div><div class="load-screen-leader-image-bottom-gradient absolute"></div></div></div><div class=flex-auto></div></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class="load-screen-below-stage relative h-28"><div class="load-screen-below-stage-gradient absolu\`te top-0 w-full"></div><div class="filigree-inner-frame-top-gold absolute top-0 -left-5 -right-5"></div></div>`);
const HorizontalDivider = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `load-screen-divider ${props.class}`;
      }
    }), false, false);
    return _el$;
  })();
};
const VerticalDivider = (props) => {
  return (() => {
    var _el$2 = _tmpl$2();
    spread(_el$2, props, false, true);
    return _el$2;
  })();
};
const CondensedHeader = (props) => {
  const header20PxClass = createMemo(() => Layout.pixelsText(20));
  return (() => {
    var _el$3 = _tmpl$();
    spread(_el$3, mergeProps(props, {
      get ["class"]() {
        return `uppercase fxs-header pointer-events-auto font-title font-medium ${header20PxClass()} ${props.class}`;
      },
      "data-name": "Condensed Header"
    }), false, true);
    insert(_el$3, () => props.children);
    return _el$3;
  })();
};
const LoadScreenInfoSection = (props) => {
  function getAttributeIcon(locStr) {
    return locStr.replace("LOC_TAG_TRAIT_", "ATTRIBUTE_").replace("_NAME", "");
  }
  return (() => {
    var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
    insert(_el$5, createComponent(For, {
      get each() {
        return props.attributes;
      },
      children: (attribute, index) => [createComponent(Icon, {
        "class": "size-8 mr-2",
        get name() {
          return getAttributeIcon(attribute);
        },
        context: "OUTLINE"
      }), createComponent(L10n.Stylize, {
        "class": "uppercase",
        text: attribute
      }), createComponent(Show, {
        get when() {
          return index() < props.attributes.length - 1;
        },
        get children() {
          return createComponent(VerticalDivider, {
            "class": "mx-2"
          });
        }
      })]
    }));
    insert(_el$4, createComponent(HorizontalDivider, {
      "class": "mb-4 mt-3"
    }), _el$6);
    insert(_el$6, createComponent(L10n.Stylize, {
      get text() {
        return props.description;
      }
    }));
    insert(_el$4, createComponent(HorizontalDivider, {
      "class": "my-4"
    }), _el$7);
    insert(_el$8, createComponent(L10n.Compose, {
      get text() {
        return props.abilityType;
      }
    }));
    insert(_el$7, createComponent(VerticalDivider, {
      "class": "mx-2"
    }), _el$9);
    insert(_el$9, createComponent(L10n.Compose, {
      get text() {
        return props.abilityName;
      }
    }));
    insert(_el$4, createComponent(L10n.Stylize, {
      "class": "load-screen-ability-desc",
      get text() {
        return props.abilityDescription;
      }
    }), null);
    return _el$4;
  })();
};
const LoadScreenTipsAndHints = (props) => {
  return (() => {
    var _el$10 = _tmpl$4(), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
    insert(_el$12, createComponent(L10n.Compose, {
      text: "LOC_LOADING_TIPS_AND_HINTS"
    }));
    insert(_el$13, createComponent(L10n.Stylize, {
      get text() {
        return props.text;
      }
    }));
    createRenderEffect(() => className(_el$10, `load-screen-tips-and-hints-outer-rect ${props.class}`));
    return _el$10;
  })();
};
const LoadScreenUnits = (props) => {
  return createComponent(Show, {
    get when() {
      return props.length > 0;
    },
    get fallback() {
      return createComponent(L10n.Compose, {
        text: "LOC_LOADING_UNIQUE_UNITS_EMPTY"
      });
    },
    get children() {
      return createComponent(For, {
        each: props,
        children: (unit, index) => (() => {
          var _el$14 = _tmpl$5(), _el$15 = _el$14.firstChild, _el$16 = _el$15.firstChild, _el$17 = _el$15.nextSibling;
          insert(_el$16, createComponent(Icon, {
            "class": "absolute inset-0",
            get name() {
              return unit.icon;
            },
            isUrl: true
          }));
          insert(_el$17, createComponent(CondensedHeader, {
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return unit.name;
                }
              });
            }
          }), null);
          insert(_el$17, createComponent(L10n.Stylize, {
            get text() {
              return unit.description;
            }
          }), null);
          createRenderEffect(() => _el$14.classList.toggle("mb-9", !!(index() < props.length - 1)));
          return _el$14;
        })()
      });
    }
  });
};
const LoadScreenConstructibles = (props) => {
  return createComponent(Show, {
    get when() {
      return props.length > 0;
    },
    get fallback() {
      return createComponent(L10n.Compose, {
        text: "LOC_LOADING_UNIQUE_BUILDINGS_EMPTY"
      });
    },
    get children() {
      return createComponent(For, {
        each: props,
        children: (constructible, index) => [(() => {
          var _el$18 = _tmpl$7(), _el$20 = _el$18.firstChild, _el$21 = _el$20.firstChild;
          insert(_el$18, createComponent(Show, {
            get when() {
              return constructible.isUniqueQuarter;
            },
            get fallback() {
              return createComponent(Icon, {
                "class": "load-screen-icon",
                get name() {
                  return constructible.icon;
                },
                isUrl: true,
                context: "CIV_BONUS"
              });
            },
            get children() {
              var _el$19 = _tmpl$6();
              insert(_el$19, createComponent(Icon, {
                "class": "m-3\\.5 load-screen-icon",
                get name() {
                  return constructible.icon;
                },
                isUrl: true,
                context: "CIV_BONUS"
              }));
              return _el$19;
            }
          }), _el$20);
          insert(_el$21, createComponent(Show, {
            get when() {
              return constructible.isUniqueQuarter;
            },
            get children() {
              return createComponent(CondensedHeader, {
                "class": "text-accent-2",
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_LOADING_UNIQUE_QUARTER"
                  });
                }
              });
            }
          }), null);
          insert(_el$21, createComponent(CondensedHeader, {
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return constructible.name;
                }
              });
            }
          }), null);
          insert(_el$20, createComponent(L10n.Stylize, {
            get text() {
              return constructible.description;
            }
          }), null);
          createRenderEffect((_p$) => {
            var _v$ = !!(!constructible.isUniqueQuarter && index() < props.length - 1), _v$2 = !constructible.isUniqueQuarter;
            _v$ !== _p$.e && _el$18.classList.toggle("mb-7", _p$.e = _v$);
            _v$2 !== _p$.t && _el$18.classList.toggle("ml-7", _p$.t = _v$2);
            return _p$;
          }, {
            e: void 0,
            t: void 0
          });
          return _el$18;
        })(), createComponent(Show, {
          get when() {
            return constructible.isUniqueQuarter;
          },
          get children() {
            return createComponent(HorizontalDivider, {
              "class": "mt-4 mb-2"
            });
          }
        })]
      });
    }
  });
};
const LoadScreenTraditions = (props) => {
  return createComponent(Show, {
    get when() {
      return props.length > 0;
    },
    get fallback() {
      return createComponent(L10n.Compose, {
        text: "LOC_LOADING_TRADITIONS_EMPTY"
      });
    },
    get children() {
      return createComponent(For, {
        each: props,
        children: (tradition, index) => (() => {
          var _el$22 = _tmpl$8(), _el$23 = _el$22.firstChild, _el$24 = _el$23.firstChild, _el$25 = _el$24.firstChild, _el$26 = _el$25.firstChild, _el$27 = _el$25.nextSibling, _el$28 = _el$24.nextSibling, _el$29 = _el$28.firstChild;
          insert(_el$25, createComponent(L10n.Compose, {
            text: "LOC_LOADING_TRADITION_UNLOCKED_WITH"
          }), _el$26);
          insert(_el$27, createComponent(L10n.Compose, {
            get text() {
              return tradition.civic;
            }
          }));
          insert(_el$28, createComponent(Icon, {
            "class": "load-screen-icon-sm",
            name: 'url("blp:unlock_tradition")',
            isUrl: true
          }), _el$29);
          insert(_el$29, createComponent(CondensedHeader, {
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return tradition.name;
                }
              });
            }
          }), null);
          insert(_el$29, createComponent(L10n.Stylize, {
            get text() {
              return tradition.description;
            }
          }), null);
          createRenderEffect(() => _el$22.classList.toggle("mb-9", !!(index() < props.length - 1)));
          return _el$22;
        })()
      });
    }
  });
};
const LoadScreenMementos = (props) => {
  return createComponent(For, {
    each: props,
    children: (memento, index) => (() => {
      var _el$30 = _tmpl$10(), _el$31 = _el$30.firstChild, _el$32 = _el$31.nextSibling;
      insert(_el$31, createComponent(Show, {
        get when() {
          return memento.isLocked;
        },
        get fallback() {
          return createComponent(Icon, {
            "class": "load-screen-icon m-3\\.5",
            get name() {
              return memento.icon;
            },
            isUrl: true
          });
        },
        get children() {
          return createComponent(Icon, {
            "class": "load-screen-lock-icon",
            name: 'url("blp:shell_memento-maj-lock")',
            isUrl: true
          });
        }
      }));
      insert(_el$32, createComponent(Switch, {
        get fallback() {
          return [createComponent(CondensedHeader, {
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return memento.name ?? "";
                }
              });
            }
          }), createComponent(L10n.Stylize, {
            get text() {
              return memento.description ?? "";
            }
          })];
        },
        get children() {
          return [createComponent(Match, {
            get when() {
              return memento.isLocked;
            },
            get children() {
              var _el$33 = _tmpl$9();
              insert(_el$33, createComponent(L10n.Compose, {
                get text() {
                  return memento.unlockReason ?? "";
                }
              }));
              return _el$33;
            }
          }), createComponent(Match, {
            get when() {
              return memento.isEmpty;
            },
            get children() {
              var _el$34 = _tmpl$9();
              insert(_el$34, createComponent(L10n.Compose, {
                text: "LOC_LOADING_MEMENTO_EMPTY"
              }));
              return _el$34;
            }
          })];
        }
      }));
      createRenderEffect(() => _el$30.classList.toggle("mb-9", !!(index() < props.length - 1)));
      return _el$30;
    })()
  });
};
const Navigation = () => {
  return [createComponent(HorizontalDivider, {}), (() => {
    var _el$35 = _tmpl$11();
    insert(_el$35, createComponent(Tab.TabListPips, {}));
    return _el$35;
  })(), createComponent(HorizontalDivider, {})];
};
const LoadScreenProgressBar = (props) => {
  return (() => {
    var _el$36 = _tmpl$12(), _el$37 = _el$36.firstChild;
    createRenderEffect((_$p) => (_$p = `scaleX(${props.progress})`) != null ? _el$37.style.setProperty("transform", _$p) : _el$37.style.removeProperty("transform"));
    return _el$36;
  })();
};
const LoadScreenContext = createContext();
function useLoadScreenContext() {
  const context = useContext(LoadScreenContext);
  if (!context) {
    throw new Error("Unable to get load screen context!");
  }
  return context;
}
const LoadScreen = (props) => {
  const model = useLoadScreenContext();
  const defaultTab = createMemo(() => model.startOnCivTab ? "civ-info" : "leader-info");
  const beginGameSounds = {};
  beginGameSounds.group = "main-menu-audio";
  beginGameSounds.onActivate = "data-audio-begin-game";
  beginGameSounds.onPress = "data-audio-begin-game-press";
  return createComponent(Panel, {
    ref(r$) {
      var _ref$ = props.ref;
      typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
    },
    name: "load-screen",
    "class": "fullscreen load-screen-fade-in",
    id: "load-screen",
    get children() {
      return createComponent(Show, {
        get when() {
          return model.data;
        },
        get children() {
          return [(() => {
            var _el$38 = _tmpl$13();
            createRenderEffect((_$p) => (_$p = model.data.backgroundImage) != null ? _el$38.style.setProperty("background-image", _$p) : _el$38.style.removeProperty("background-image"));
            return _el$38;
          })(), _tmpl$14(), _tmpl$15(), (() => {
            var _el$41 = _tmpl$16(), _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling;
            insert(_el$41, createComponent(Filigree.H3, {
              "class": "load-screen-filigree-top absolute top-3 left-1\\/2",
              style: {
                transform: "scaleY(-1) translateX(-50%)"
              }
            }), _el$43);
            insert(_el$41, createComponent(Filigree.H3, {
              "class": "load-screen-filigree-bottom absolute bottom-3 left-1\\/2 -translate-x-1\\/2"
            }), null);
            return _el$41;
          })(), (() => {
            var _el$44 = _tmpl$18(), _el$45 = _el$44.firstChild, _el$46 = _el$45.nextSibling, _el$47 = _el$46.nextSibling, _el$48 = _el$47.firstChild, _el$49 = _el$48.nextSibling, _el$50 = _el$49.firstChild, _el$51 = _el$50.nextSibling;
            insert(_el$47, createComponent(Tab, {
              "class": "load-screen-info absolute inset-0 flex flex-col",
              get defaultTab() {
                return defaultTab();
              },
              get onTabChanged() {
                return model.onTabChanged;
              },
              get children() {
                return [createComponent(Header, {
                  "class": "text-2xl font-medium",
                  get children() {
                    return createComponent(Tab.Title, {});
                  }
                }), createComponent(HorizontalDivider, {
                  "class": "mt-1"
                }), createComponent(ScrollArea, {
                  "class": "load-screen-info-scrollable flex-auto pt-3",
                  useProxy: true,
                  reserveSpace: true,
                  get children() {
                    var _el$52 = _tmpl$17();
                    insert(_el$52, createComponent(Tab.Output, {}));
                    return _el$52;
                  }
                }), createComponent(Show, {
                  get when() {
                    return model.data.tipText != "";
                  },
                  get children() {
                    return [createComponent(HorizontalDivider, {
                      "class": "my-1"
                    }), createComponent(LoadScreenTipsAndHints, {
                      get text() {
                        return model.data.tipText;
                      },
                      "class": "my-2"
                    })];
                  }
                }), createComponent(HorizontalDivider, {
                  "class": "my-1"
                }), createComponent(Navigation, {}), createComponent(HorizontalDivider, {
                  "class": "my-1"
                }), createComponent(Filigree.H4, {
                  get ["class"]() {
                    return `load-screen-begin-game-button mt-11 ${model.hideBeginButton ? "hidden" : ""}`;
                  },
                  filigreeClass: "mt-5 mx-5",
                  get children() {
                    return createComponent(HeroButton2, {
                      "class": "mx-3 px-8",
                      get disabled() {
                        return !model.canBeginGame;
                      },
                      get onActivate() {
                        return model.onBeginGame;
                      },
                      audio: beginGameSounds,
                      get classList() {
                        return {
                          hidden: model.hideBeginButton
                        };
                      },
                      get children() {
                        return [createComponent(NavHelp, {
                          "class": "-ml-10 mr-2",
                          get disabled() {
                            return !model.canBeginGame;
                          }
                        }), createComponent(L10n.Compose, {
                          text: "LOC_LOADING_BEGIN_GAME"
                        })];
                      }
                    });
                  }
                }), createComponent(Tab.Item, {
                  name: "leader-info",
                  title: () => createComponent(L10n.Compose, {
                    get text() {
                      return model.data.leaderInfo.name;
                    }
                  }),
                  body: () => createComponent(LoadScreenInfoSection, mergeProps(() => model.data.leaderInfo))
                }), createComponent(Tab.Item, {
                  name: "civ-info",
                  title: () => createComponent(L10n.Compose, {
                    get text() {
                      return model.data.civInfo.name;
                    }
                  }),
                  body: () => createComponent(LoadScreenInfoSection, mergeProps(() => model.data.civInfo))
                }), createComponent(Tab.Item, {
                  name: "constructible-info",
                  title: () => createComponent(L10n.Compose, {
                    text: "LOC_LOADING_UNIQUE_BUILDINGS"
                  }),
                  body: () => createComponent(LoadScreenConstructibles, mergeProps(() => model.data.constructibleInfo))
                }), createComponent(Tab.Item, {
                  name: "unit-info",
                  title: () => createComponent(L10n.Compose, {
                    text: "LOC_LOADING_UNIQUE_UNITS"
                  }),
                  body: () => createComponent(LoadScreenUnits, mergeProps(() => model.data.unitInfo))
                }), createComponent(Tab.Item, {
                  name: "tradition-info",
                  title: () => createComponent(L10n.Compose, {
                    text: "LOC_LOADING_TRADITIONS"
                  }),
                  body: () => createComponent(LoadScreenTraditions, mergeProps(() => model.data.traditionInfo))
                }), createComponent(Tab.Item, {
                  name: "memento-info",
                  title: () => createComponent(L10n.Compose, {
                    text: "LOC_LOADING_EQUIPPED_MEMENTOS"
                  }),
                  body: () => createComponent(LoadScreenMementos, mergeProps(() => model.data.mementoInfo))
                })];
              }
            }), null);
            createRenderEffect((_p$) => {
              var _v$3 = model.data.backgroundImage, _v$4 = model.data.leaderImage;
              _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$44.style.setProperty("background-image", _v$3) : _el$44.style.removeProperty("background-image"));
              _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$51.style.setProperty("background-image", _v$4) : _el$51.style.removeProperty("background-image"));
              return _p$;
            }, {
              e: void 0,
              t: void 0
            });
            return _el$44;
          })(), (() => {
            var _el$53 = _tmpl$19(), _el$54 = _el$53.firstChild, _el$55 = _el$54.nextSibling;
            insert(_el$53, createComponent(LoadScreenProgressBar, {
              get progress() {
                return model.progress;
              }
            }), null);
            return _el$53;
          })()];
        }
      });
    }
  });
};
ComponentUtilities.loadStyles(style);

export { LoadScreenContext as L, LoadScreen as a };
//# sourceMappingURL=load-screen.chunk.js.map
