import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, For, Show, createRenderEffect } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { CheckBox } from '../../components/check-box.js';
import { Header } from '../../components/header.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { Tooltip } from '../../components/tooltip.js';
import { AgeIcon } from './age-icon.js';
import { useAgeSelectModelContext } from './age-select-model.js';
import { AttributeIcon } from './attribute-icon.js';
import { useRecommendedChoiceModelContext } from './recommended-choice-model.js';
import { TicketBox } from './ticket-box.js';
import { TotIcon } from './tot-icon.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './civ-card.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="create-game-civ-card-disabled-bg absolute inset-0"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="create-game-civ-card-locked-tag absolute -left-1\\.5 top-1"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row self-center -top-3\\.5 absolute"><div class=create-game-civ-card-top-filigree></div><div class="create-game-civ-card-top-filigree -scale-x-100 ml-16"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col absolute -top-9 left-0 right-0 items-center justify-center"><div class="size-20 relative"><div class="create-game-civ-card-laurels absolute inset-0"></div><div class="absolute inset-0 flex items-center justify-center pb-2"><div class=create-game-civ-card-leader-hex></div></div><div class="absolute inset-0 flex items-center justify-center pb-2"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute -left-2 top-4"><div class="flex flex-row items-start justify-start relative"><div class="img-icon-checkmark size-8 absolute mt-0\\.5 ml-0\\.5"></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col absolute inset-x-0\\.5 inset-y-1 bg-contain"><div class="create-game-civ-card-info flex-auto mt-16 relative"><div class="absolute flex create-game-civ-card-gradient -top-8 left-1\\/2"></div><div class="absolute inset-0 flex flex-col items-center justify-end mb-10"></div></div><div class="create-game-civ-card-icon-area relative"><div class="create-game-civ-card-icon-gradient absolute top-0 left-0 right-0 bottom-7"></div><div class="absolute inset-0 bottom-10 flex flex-row items-center justify-center pt-1"><div class=mx-4></div><div class="create-game-civ-card-icon-container flex items-center justify-center mx-1"></div><div class="create-game-civ-card-icon-container flex items-center justify-center mx-1"></div></div><div class="create-game-civ-card-inner-filigree absolute -bottom-1\\.5 self-center"></div></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap items-center justify-start"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="uppercase text-secondary-1 text-sm font-title"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="uppercase text-accent-2 text-sm font-body"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="text-secondary uppercase self-center text-xl font-title mt-3"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="h-1 w-full bg-cover mb-2"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="flex flex-row w-full items-center"><div class="flex flex-col"></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap here"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="text-secondary uppercase font-title text-xl mb-2 text-center"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div class="create-game-civ-card-icon-container flex items-center justify-center mx-1"></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-start"><div class="create-game-civ-card-tooltip-icon-container flex items-center justify-center mx-1"></div><div class=uppercase></div></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap here-1"></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap w-full"></div>`);
const CivCardComponent = (props) => {
  const ageContext = useAgeSelectModelContext();
  const choiceContext = useRecommendedChoiceModelContext();
  const activeAbility = createMemo(() => props.perAgeAbilities.find((a) => a.age == ageContext.selectedAge.type) ?? props.perAgeAbilities.find((a) => !a.age));
  const activeRecommendation = createMemo(() => choiceContext.forLeader().get(props.civID));
  const isInGame = UI.isInGame();
  const isChecked = createMemo(() => !isInGame && props.isSelected || isInGame && (props.isCurrentCiv || props.isPreviousCiv));
  return createComponent(Tooltip, {
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return createComponent(Activatable, {
            get onActivate() {
              return props.onSelect;
            },
            get ["class"]() {
              return `create-game-civ-card img-unit-panelbox relative group ${props.class ?? ""}`;
            },
            get classList() {
              return {
                "mt-6": props.isRecommended
              };
            },
            get children() {
              var _el$ = _tmpl$6(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$2.nextSibling, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling, _el$11 = _el$5.nextSibling;
              insert(_el$4, createComponent(Icon, {
                "class": "create-game-civ-card-info-icon",
                get name() {
                  return `url('${props.icon ?? ""}')`;
                },
                isUrl: true
              }), null);
              insert(_el$4, createComponent(Header, {
                "class": "ml-3 uppercase font-black create-game-civ-card-text-gradient text-center text-lg [@media(max-height:1000px)]:text-sm",
                get children() {
                  return props.name;
                }
              }), null);
              insert(_el$7, createComponent(For, {
                get each() {
                  return props.traits;
                },
                children: (attribute) => (() => {
                  var _el$34 = _tmpl$15();
                  insert(_el$34, createComponent(AttributeIcon, {
                    "class": "create-game-civ-card-icon-attribute",
                    attribute
                  }));
                  return _el$34;
                })()
              }), _el$8);
              insert(_el$9, createComponent(AgeIcon, {
                get ageId() {
                  return props.apexAge;
                },
                "class": "create-game-civ-card-icon-age"
              }));
              insert(_el$10, createComponent(TotIcon, {
                get isApexAge() {
                  return props.isApexAgeSelected;
                },
                "class": "create-game-civ-card-icon-tot"
              }));
              insert(_el$, createComponent(Show, {
                get when() {
                  return props.isLocked;
                },
                get children() {
                  return [_tmpl$(), (() => {
                    var _el$13 = _tmpl$2();
                    insert(_el$13, createComponent(Icon, {
                      "class": "size-8 mb-1 mr-3",
                      name: "url('blp:icon_lock')",
                      isUrl: true
                    }));
                    return _el$13;
                  })()];
                }
              }), null);
              insert(_el$, createComponent(Show, {
                get when() {
                  return props.isRecommended;
                },
                get children() {
                  return [(() => {
                    var _el$14 = _tmpl$3(), _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
                    createRenderEffect((_p$) => {
                      var _v$ = !!props.isLocked, _v$2 = !!props.isLocked;
                      _v$ !== _p$.e && _el$15.classList.toggle("opacity-60", _p$.e = _v$);
                      _v$2 !== _p$.t && _el$16.classList.toggle("opacity-60", _p$.t = _v$2);
                      return _p$;
                    }, {
                      e: void 0,
                      t: void 0
                    });
                    return _el$14;
                  })(), (() => {
                    var _el$17 = _tmpl$4(), _el$18 = _el$17.firstChild, _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling, _el$21 = _el$20.nextSibling;
                    insert(_el$21, createComponent(Icon, {
                      get name() {
                        return props.leaderIcon;
                      },
                      "class": "create-game-civ-card-leader"
                    }));
                    createRenderEffect(() => _el$18.classList.toggle("opacity-60", !!props.isLocked));
                    return _el$17;
                  })()];
                }
              }), null);
              insert(_el$, createComponent(Show, {
                get when() {
                  return isChecked();
                },
                get children() {
                  var _el$22 = _tmpl$5(), _el$23 = _el$22.firstChild, _el$24 = _el$23.firstChild;
                  _el$23.style.setProperty("border-image-source", "url('blp:tag_equipped.png')");
                  _el$23.style.setProperty("border-image-slice", "1 6 1 1 fill");
                  _el$23.style.setProperty("border-image-repeat", "stretch");
                  _el$24.style.setProperty("fxs-background-image-tint", "black");
                  createRenderEffect((_p$) => {
                    var _v$3 = Layout.pixels(54), _v$4 = Layout.pixels(43);
                    _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$23.style.setProperty("width", _v$3) : _el$23.style.removeProperty("width"));
                    _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$23.style.setProperty("height", _v$4) : _el$23.style.removeProperty("height"));
                    return _p$;
                  }, {
                    e: void 0,
                    t: void 0
                  });
                  return _el$22;
                }
              }), null);
              createRenderEffect((_$p) => (_$p = `url('blp:${props.bgImage}')`) != null ? _el$.style.setProperty("background-image", _$p) : _el$.style.removeProperty("background-image"));
              return _el$;
            }
          });
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            "class": "flex flex-col relative w-128",
            get children() {
              return [createComponent(Show, {
                get when() {
                  return props.isCivSelect;
                },
                get children() {
                  return [(() => {
                    var _el$25 = _tmpl$7();
                    insert(_el$25, createComponent(For, {
                      get each() {
                        return props.traits;
                      },
                      children: (attribute) => (() => {
                        var _el$35 = _tmpl$16(), _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling;
                        insert(_el$36, createComponent(AttributeIcon, {
                          "class": "size-8",
                          attribute
                        }));
                        insert(_el$37, createComponent(L10n.Compose, {
                          text: attribute
                        }));
                        return _el$35;
                      })()
                    }));
                    return _el$25;
                  })(), createComponent(TicketBox, {
                    "class": "px-6 pt-4 pb-6",
                    get children() {
                      return [(() => {
                        var _el$26 = _tmpl$8();
                        insert(_el$26, createComponent(L10n.Compose, {
                          get text() {
                            return activeAbility()?.abilityTitle ?? "";
                          }
                        }));
                        return _el$26;
                      })(), (() => {
                        var _el$27 = _tmpl$9();
                        insert(_el$27, createComponent(L10n.Compose, {
                          text: "LOC_UI_CREATE_GAME_CIVILIZATION_ABILITY"
                        }));
                        return _el$27;
                      })(), createComponent(L10n.Stylize, {
                        "class": "create-game-markup tight",
                        get text() {
                          return activeAbility()?.abilityText ?? "";
                        }
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return props.isRecommended;
                    },
                    get children() {
                      return createComponent(TicketBox, {
                        "class": "flex flex-row items-center px-6 pt-4 pb-6",
                        get children() {
                          return [createComponent(Icon, {
                            get name() {
                              return props.leaderIcon;
                            },
                            "class": "size-13"
                          }), createComponent(L10n.Stylize, {
                            "class": "flex-auto create-game-markup tight",
                            get text() {
                              return activeRecommendation()?.reason ?? "";
                            }
                          })];
                        }
                      });
                    }
                  })];
                }
              }), createComponent(Show, {
                get when() {
                  return props.isUnlocks;
                },
                get children() {
                  return [(() => {
                    var _el$28 = _tmpl$10();
                    insert(_el$28, createComponent(L10n.Compose, {
                      text: "LOC_LEGACIES_UNLOCKS_TOOLTIP_TITLE",
                      get args() {
                        return [props.name];
                      }
                    }));
                    return _el$28;
                  })(), createComponent(TicketBox, {
                    "class": "flex flex-col justify-start px-6 pt-4 pb-6",
                    get children() {
                      return [(() => {
                        var _el$29 = _tmpl$12(), _el$30 = _el$29.firstChild;
                        insert(_el$30, createComponent(Show, {
                          get when() {
                            return props.isLocked;
                          },
                          get children() {
                            return [createComponent(L10n.Stylize, {
                              "class": "create-game-markup",
                              text: "LOC_LEGACIES_UNLOCKS_PRIMARY_UNLOCK_EXPLANATION",
                              get args() {
                                return [props.name, Locale.compose("LOC_VICTORY_AGE_NAME", props.ageName)];
                              }
                            }), (() => {
                              var _el$31 = _tmpl$11();
                              _el$31.style.setProperty("background-image", "url(blp:shell_line-divider)");
                              return _el$31;
                            })()];
                          }
                        }));
                        return _el$29;
                      })(), createComponent(Show, {
                        get when() {
                          return props.unlockedBy.length > 1 && props.unlockedBy[0].isUnlocked && !props.showAllUnlocks;
                        },
                        get children() {
                          var _el$32 = _tmpl$13();
                          insert(_el$32, createComponent(CheckBox, {
                            "class": "size-6",
                            get isChecked() {
                              return props.unlockedBy[0].isUnlocked;
                            },
                            disabled: true
                          }), null);
                          insert(_el$32, createComponent(L10n.Stylize, {
                            "class": "flex-auto create-game-markup tight",
                            get text() {
                              return props.unlockedBy[0].text;
                            }
                          }), null);
                          return _el$32;
                        }
                      }), createComponent(Show, {
                        get when() {
                          return !props.unlockedBy[0].isUnlocked || props.showAllUnlocks;
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return props.unlockedBy;
                            },
                            children: (unlock) => createComponent(Show, {
                              get when() {
                                return unlock.isGameplayUnlock;
                              },
                              get children() {
                                var _el$38 = _tmpl$17();
                                insert(_el$38, createComponent(CheckBox, {
                                  "class": "size-6",
                                  get isChecked() {
                                    return unlock.isUnlocked;
                                  },
                                  disabled: true
                                }), null);
                                insert(_el$38, createComponent(L10n.Stylize, {
                                  "class": "flex-auto create-game-markup tight",
                                  get text() {
                                    return unlock.text;
                                  }
                                }), null);
                                return _el$38;
                              }
                            })
                          });
                        }
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return props.showAllUnlocks;
                    },
                    get children() {
                      return createComponent(TicketBox, {
                        "class": "flex flex-col justify-start px-6 pt-4 pb-6 mt-3",
                        get children() {
                          return [(() => {
                            var _el$33 = _tmpl$14();
                            insert(_el$33, createComponent(L10n.Compose, {
                              text: "LOC_LEGACIES_UNLOCKS_ADDITIONAL"
                            }));
                            return _el$33;
                          })(), createComponent(For, {
                            get each() {
                              return props.unlockedBy;
                            },
                            children: (unlock) => createComponent(Show, {
                              get when() {
                                return !unlock.isGameplayUnlock;
                              },
                              get children() {
                                var _el$39 = _tmpl$18();
                                insert(_el$39, createComponent(CheckBox, {
                                  "class": "size-6",
                                  get isChecked() {
                                    return unlock.isUnlocked;
                                  }
                                }), null);
                                insert(_el$39, createComponent(L10n.Stylize, {
                                  "class": "flex-auto create-game-markup tight",
                                  get text() {
                                    return unlock.text;
                                  }
                                }), null);
                                return _el$39;
                              }
                            })
                          })];
                        }
                      });
                    }
                  })];
                }
              }), createComponent(Show, {
                get when() {
                  return !props.isUnlocks && props.isLocked && props.unlockedBy.length > 0 && isInGame;
                },
                get children() {
                  return createComponent(TicketBox, {
                    "class": "flex flex-col items-start justify-start px-6 pt-4 pb-6",
                    get children() {
                      return createComponent(For, {
                        get each() {
                          return props.unlockedBy.filter((u) => !u.isUnlocked);
                        },
                        children: (unlock) => createComponent(L10n.Stylize, {
                          "class": "flex-auto create-game-markup tight",
                          get text() {
                            return unlock.text;
                          }
                        })
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
  });
};
const CivCard = ComponentRegistry.register({
  name: "CivCard",
  createInstance: CivCardComponent,
  styles: [style]
});

export { CivCard };
//# sourceMappingURL=civ-card.js.map
