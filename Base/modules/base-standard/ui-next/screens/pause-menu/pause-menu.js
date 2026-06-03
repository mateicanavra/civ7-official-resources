import { template, insert, spread, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createComponent, mergeProps, Show, createRenderEffect, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable, EMPTY_ACTIVATABLE_AUDIO } from '../../../../core/ui-next/components/activatable.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { HeroButton2 } from '../../../../core/ui-next/components/hero-button.js';
import { Hotkeys } from '../../../../core/ui-next/components/hotkeys.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { NavHelp } from '../../../../core/ui-next/components/nav-help.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tooltip } from '../../../../core/ui-next/components/tooltip.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { createPauseMenuModel } from './pause-menu-model.js';
import style from './pause-menu.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-7 h-7 mr-2 mb-2 bg-cover bg-no-repeat"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flow-row items-center"><div class="w-6 h-6 mr-2\\.5 ml-0\\.5 bg-cover bg-no-repeat"></div><div class="flex-auto flow-row items-center"><div class="font-body text-base text-header-4 text-shadow font-fit-shrink whitespace-nowrap"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative w-8 h-8 -bottom-9 bg-contain bg-no-repeat self-center justify-center bottom-8"><div class="font-body text-normal text-sm self-center mt-1"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="pause-menu-progression-border p-1"><div class="bg-cover bg-no-repeat p-1"><div class="relative flex flow-row justify-between"><div class="w-64 flex-auto flex-initial h-full"><div class="flow-column max-w-full"><div class="flow-row items-center"><div class="flex-auto flow-row items-center mb-2"><div class="font-body text-base text-header-4 text-shadow font-fit-shrink whitespace-nowrap flex"></div></div></div><div class="font-body text-sm text-accent-1 mt-1 flex font-fit-shrink whitespace-nowrap"></div></div></div><div class="flex h-full -mt-1\\.5 mr-0\\.5"><div class="flex flex-auto"><div class="w-12 h-12 bg-contain bg-no-repeat self-center"></div></div></div></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute bottom-10 pause-menu-progression-button"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div class="pause-menu-leader-image bg-contain bg-no-repeat"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="pause-menu-map-seed mt-1 flex flex-row font-shrink">: </div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="pause-menu-map-seed ml-8 mt-1 flex flex-row font-shrink">: </div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="pause-menu-build-info-bottom-bar mt-3"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div><div class="font-shrink pause-menu-game-info"></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="text-xl uppercase font-title font-bold text-secondary mt-4 text-shadow"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="pause-menu-leader-level size-11 text-center font-body-sm bg-contain flex flex-row justify-center items-center"><div></div></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-row"><div class="w-40 h-12 bg-contain mr-1"></div><div class="w-40 h-12 bg-contain ml-1"></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="text-lg font-title mt-1 mb-3 uppercase font-bold text-shadow"></div>`), _tmpl$15 = /* @__PURE__ */ template(`<div></div>`), _tmpl$16 = /* @__PURE__ */ template(`<div class="w-full text-secondary text-lg font-title uppercase bold flex flex-row relative mt-3"></div>`), _tmpl$17 = /* @__PURE__ */ template(`<div class="pause-menu-addon-divider w-full h-0\\.5 opacity-50 mt-1 mb-2"></div>`), _tmpl$18 = /* @__PURE__ */ template(`<div class="self-center justify-center flex flex-row w-full mt-10 break-words flex-wrap"></div>`), _tmpl$19 = /* @__PURE__ */ template(`<div class=items-center></div>`), _tmpl$20 = /* @__PURE__ */ template(`<div class="pause-menu-build-info-center absolute bottom-2 w-96 max-h-14 text-center font-fit-shrink"></div>`), _tmpl$21 = /* @__PURE__ */ template(`<div class="pause-menu-addon-divider w-full h-0\\.5 opacity-20"></div>`), _tmpl$22 = /* @__PURE__ */ template(`<div class="absolute fullscreen-outside-safezone pause-menu"></div>`), _tmpl$23 = /* @__PURE__ */ template(`<div class="w-full flex grow relative"><div class="bg-accent-6 opacity-60 bottom-0 absolute fullscreen-top-outside-safezone"></div></div>`), _tmpl$24 = /* @__PURE__ */ template(`<div class="relative w-full h-1"><div class="pause-menu-borders absolute top-0 bottom-0 fullscreen-side-outside-safezone"></div></div>`), _tmpl$25 = /* @__PURE__ */ template(`<div class="pause-menu-corner-filligree size-45 bg-contain opacity-30 absolute top-5 left-5"></div>`), _tmpl$26 = /* @__PURE__ */ template(`<div class="pause-menu-corner-filligree size-45 bg-contain opacity-30 absolute top-5 right-5 rotate-90"></div>`), _tmpl$27 = /* @__PURE__ */ template(`<div class="pause-menu-corner-filligree size-45 bg-contain opacity-30 absolute bottom-5 left-5 -rotate-90"></div>`), _tmpl$28 = /* @__PURE__ */ template(`<div class="pause-menu-corner-filligree size-45 bg-contain opacity-30 absolute bottom-5 right-5 -rotate-180"></div>`), _tmpl$29 = /* @__PURE__ */ template(`<div class="pause-menu-build-info-leader absolute bottom-3 left-9"></div>`), _tmpl$30 = /* @__PURE__ */ template(`<div class="pause-menu-social-button-img size-18 img-social-icon bg-contain bg-no-repeat"></div>`), _tmpl$31 = /* @__PURE__ */ template(`<div class="w-full flex flex-column grow justify-center relative"><div class="bg-accent-6 opacity-60 absolute top-0 fullscreen-bottom-outside-safezone"></div></div>`), _tmpl$32 = /* @__PURE__ */ template(`<div id=clipboard-container class="size-full absolute pointer-events-none opacity-1"></div>`);
const PauseMenuContext = createContext();
function usePauseMenuContext() {
  const context = useContext(PauseMenuContext);
  if (!context) {
    throw new Error("Unable to get pause menu context!");
  }
  return context;
}
const PauseMenuButtonContainer = (props) => {
  const model = usePauseMenuContext();
  return createComponent(VSlot, mergeProps(props, {
    "class": "pause-menu-button-container",
    "data-name": "pause-menu-button-container",
    id: "pause-menu-button-container",
    autoFocus: true,
    get children() {
      return [createComponent(Hotkeys, {
        get hotkeys() {
          return [{
            hotkeyAction: "sys-menu",
            onActivate: model.onClickResume
          }];
        }
      }), createComponent(HeroButton2, {
        id: "pause-menu-resume-button",
        "class": "pause-menu-button bottom-padding",
        get onActivate() {
          return model.onClickResume;
        },
        hotkeyAction: "cancel",
        autoFocus: true,
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_GENERIC_RESUME"
          });
        }
      }), createComponent(Button, {
        "class": "pause-menu-button",
        get onActivate() {
          return model.onClickQuickSave;
        },
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_QUICK_SAVE_NAME"
          });
        }
      }), createComponent(Button, {
        "class": "pause-menu-button",
        get onActivate() {
          return model.onClickSave;
        },
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_PAUSE_MENU_SAVE"
          });
        }
      }), createComponent(Show, {
        get when() {
          return !model.isMultiplayer;
        },
        get children() {
          return [createComponent(Button, {
            "class": "pause-menu-button",
            get onActivate() {
              return model.onClickLoad;
            },
            get children() {
              return createComponent(L10n.Compose, {
                text: "LOC_PAUSE_MENU_LOAD"
              });
            }
          }), createComponent(Show, {
            get when() {
              return model.data.canRestart;
            },
            get fallback() {
              return createComponent(Tooltip.Text, {
                get text() {
                  return model.data.restartButtonDisabledReason;
                },
                get children() {
                  return createComponent(Button, {
                    "class": "pause-menu-button disabled",
                    get children() {
                      return createComponent(L10n.Compose, {
                        text: "LOC_PAUSE_MENU_RESTART"
                      });
                    }
                  });
                }
              });
            },
            get children() {
              return createComponent(Button, {
                "class": "pause-menu-button",
                get onActivate() {
                  return model.onClickRestart;
                },
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_PAUSE_MENU_RESTART"
                  });
                }
              });
            }
          }), createComponent(Show, {
            get when() {
              return model.data.retireButtonString != "LOC_PAUSE_MENU_NOMORETURNS";
            },
            get children() {
              return createComponent(Button, {
                "class": "pause-menu-button",
                get onActivate() {
                  return model.onClickRetire;
                },
                get children() {
                  return createComponent(L10n.Compose, {
                    get text() {
                      return model.data.retireButtonString;
                    }
                  });
                }
              });
            }
          })];
        }
      }), createComponent(Button, {
        "class": "pause-menu-button bottom-padding",
        get onActivate() {
          return model.onClickOptions;
        },
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_PAUSE_MENU_OPTIONS"
          });
        }
      }), createComponent(Show, {
        get when() {
          return model.isMultiplayer && model.shouldShowJoinCode;
        },
        get children() {
          return createComponent(Button, {
            "class": "pause-menu-button",
            get onActivate() {
              return model.onClickJoinCode;
            },
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return model.joinCodeString;
                }
              });
            }
          });
        }
      }), createComponent(Button, {
        "class": "pause-menu-button",
        get onActivate() {
          return model.onClickExitToMain;
        },
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_END_GAME_EXIT"
          });
        }
      }), createComponent(Show, {
        get when() {
          return model.data?.canExitToDesktop;
        },
        get children() {
          return createComponent(Button, {
            "class": "pause-menu-button",
            get onActivate() {
              return model.onClickExitToDesktop;
            },
            get children() {
              return createComponent(L10n.Compose, {
                text: "LOC_PAUSE_MENU_QUIT_TO_DESKTOP"
              });
            }
          });
        }
      })];
    }
  }));
};
const PauseMenuProgressionContainer = (props) => {
  const model = usePauseMenuContext();
  return createComponent(Activatable, mergeProps(props, {
    "class": "relative hover\\:scale-105 transition-transform",
    get onActivate() {
      return model.onClickProgression;
    },
    disableFocus: true,
    hotkeyAction: "shell-action-1",
    style: {
      "transition-duration": "0.1s"
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$8 = _el$6.firstChild, _el$9 = _el$8.firstChild, _el$14 = _el$6.nextSibling, _el$15 = _el$4.nextSibling, _el$16 = _el$15.firstChild, _el$17 = _el$16.firstChild;
        insert(_el$6, createComponent(Show, {
          get when() {
            return model.supportsSSO;
          },
          get children() {
            var _el$7 = _tmpl$();
            createRenderEffect((_$p) => (_$p = `url(${props.firstPartyIcon})`) != null ? _el$7.style.setProperty("background-image", _$p) : _el$7.style.removeProperty("background-image"));
            return _el$7;
          }
        }), _el$8);
        insert(_el$9, () => props.firstPartyName);
        insert(_el$5, createComponent(Show, {
          get when() {
            return model.supportsSSO;
          },
          get children() {
            var _el$10 = _tmpl$2(), _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$12.firstChild;
            _el$11.style.setProperty("background-image", "url(blp:prof_2k_logo)");
            insert(_el$13, () => props.twoKName);
            return _el$10;
          }
        }), _el$14);
        insert(_el$14, createComponent(L10n.Compose, {
          get text() {
            return props.playerTitle;
          }
        }));
        insert(_el$17, createComponent(Show, {
          get when() {
            return model.supportsSSO;
          },
          get children() {
            var _el$18 = _tmpl$3(), _el$19 = _el$18.firstChild;
            _el$18.style.setProperty("background-image", "url(blp:prof_lvl_bk.png)");
            insert(_el$19, () => props.foundationLevel);
            return _el$18;
          }
        }));
        createRenderEffect((_p$) => {
          var _v$ = `url(${props.backgroundImage})`, _v$2 = `url(${props.badgeIcon})`;
          _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$2.style.setProperty("background-image", _v$) : _el$2.style.removeProperty("background-image"));
          _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$17.style.setProperty("background-image", _v$2) : _el$17.style.removeProperty("background-image"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$;
      })(), createComponent(NavHelp, {
        "class": "absolute -right-2 -top-1"
      })];
    }
  }));
};
const PauseMenuLeaderContainer = (props) => {
  const model = usePauseMenuContext();
  return (() => {
    var _el$20 = _tmpl$6(), _el$21 = _el$20.firstChild;
    spread(_el$20, mergeProps(props, {
      "class": "relative pause-menu-leader-container pointer-events-none w-76 flex flex-col justify-center items-center"
    }), false, true);
    insert(_el$20, createComponent(Show, {
      get when() {
        return model.supportsSSO;
      },
      get children() {
        var _el$22 = _tmpl$5();
        insert(_el$22, createComponent(PauseMenuProgressionContainer, mergeProps(() => props.progressionBadgeProps)));
        return _el$22;
      }
    }), null);
    createRenderEffect((_$p) => (_$p = props.leaderImage) != null ? _el$21.style.setProperty("background-image", _$p) : _el$21.style.removeProperty("background-image"));
    return _el$20;
  })();
};
const PauseMenuGameInfoContainer = (props) => {
  const model = usePauseMenuContext();
  return (() => {
    var _el$23 = _tmpl$10(), _el$24 = _el$23.firstChild;
    spread(_el$23, mergeProps(props, {
      "class": "flex text-accent-1 text-accent-1 absolute items-center w-full justify-center flex-col"
    }), false, true);
    insert(_el$24, () => props.gameInfoString);
    insert(_el$23, createComponent(HSlot, {
      get children() {
        return [(() => {
          var _el$25 = _tmpl$7(), _el$26 = _el$25.firstChild;
          insert(_el$25, createComponent(L10n.Compose, {
            text: "LOC_MAPSEED_NAME"
          }), _el$26);
          insert(_el$25, createComponent(Show, {
            get when() {
              return model.isClipboardSupported;
            },
            get children() {
              return createComponent(Activatable, {
                "class": "pause-menu-map-seed-button",
                get onActivate() {
                  return model.onClickMapSeed;
                },
                disableFocus: true,
                get children() {
                  return props.mapSeed;
                }
              });
            }
          }), null);
          insert(_el$25, createComponent(Show, {
            get when() {
              return !model.isClipboardSupported;
            },
            get children() {
              return props.mapSeed;
            }
          }), null);
          return _el$25;
        })(), (() => {
          var _el$27 = _tmpl$8(), _el$28 = _el$27.firstChild;
          insert(_el$27, createComponent(L10n.Compose, {
            text: "LOC_GAMESEED_NAME"
          }), _el$28);
          insert(_el$27, createComponent(Show, {
            get when() {
              return model.isClipboardSupported;
            },
            get children() {
              return createComponent(Activatable, {
                "class": "pause-menu-map-seed-button",
                get onActivate() {
                  return model.onClickGameSeed;
                },
                disableFocus: true,
                get children() {
                  return props.gameSeed;
                }
              });
            }
          }), null);
          insert(_el$27, createComponent(Show, {
            get when() {
              return !model.isClipboardSupported;
            },
            get children() {
              return props.gameSeed;
            }
          }), null);
          return _el$27;
        })()];
      }
    }), null);
    insert(_el$23, createComponent(Show, {
      get when() {
        return model.supportsSSO;
      },
      get children() {
        var _el$29 = _tmpl$9();
        _el$29.style.setProperty("color", "rgba(222, 203, 149, 1)");
        insert(_el$29, () => props.buildInfo);
        return _el$29;
      }
    }), null);
    return _el$23;
  })();
};
const PauseMenuInfoContainer = (props) => {
  const model = usePauseMenuContext();
  const getAddonName = (addon) => {
    if (addon.subscriptionId != null && addon.subscriptionType == "SteamWorkshopContent") {
      return `${Locale.compose(addon.name)} [icon:mod-workshop]`;
    } else {
      return addon.name;
    }
  };
  const openAddonInOverlay = (addon) => {
    if (addon.subscriptionId != null && addon.subscriptionType == "SteamWorkshopContent") {
      Online.Social.activateOverlayToUserGeneratedContent(addon.subscriptionId);
    }
  };
  return createComponent(VSlot, mergeProps(props, {
    "class": "pause-menu-info-container relative items-center",
    "data-name": "pause-menu-info-container",
    get children() {
      return [(() => {
        var _el$30 = _tmpl$11();
        insert(_el$30, () => props.leaderName);
        return _el$30;
      })(), (() => {
        var _el$31 = _tmpl$13(), _el$32 = _el$31.firstChild, _el$35 = _el$32.nextSibling;
        _el$32.style.setProperty("background-image", "url(blp:base_top-filigree_left)");
        insert(_el$31, createComponent(Show, {
          get when() {
            return model.supportsSSO;
          },
          get children() {
            var _el$33 = _tmpl$12(), _el$34 = _el$33.firstChild;
            insert(_el$34, () => props.level);
            return _el$33;
          }
        }), _el$35);
        _el$35.style.setProperty("background-image", "url(blp:base_top-filigree_right)");
        return _el$31;
      })(), (() => {
        var _el$36 = _tmpl$14();
        insert(_el$36, createComponent(L10n.Compose, {
          get text() {
            return props.civName;
          }
        }));
        return _el$36;
      })(), createComponent(Show, {
        get when() {
          return model.supportsSSO;
        },
        get children() {
          return createComponent(HSlot, {
            "class": "pause-menu-addons-container mt-3 py-1 px-3",
            disableFocus: true,
            get children() {
              return createComponent(ScrollArea, {
                "class": "flex-auto pt-3 pb-2",
                useProxy: true,
                get children() {
                  return [createComponent(Show, {
                    get when() {
                      return props.hasActiveMods;
                    },
                    get children() {
                      return [createComponent(Show, {
                        get when() {
                          return props.hasActiveMods && props.hasActiveDLC;
                        },
                        get children() {
                          return createComponent(Activatable, {
                            "class": "w-full text-secondary text-lg font-title uppercase bold flex flex-row relative",
                            get onActivate() {
                              return model.onClickCollapseMods;
                            },
                            get disabled() {
                              return !props.hasActiveDLC;
                            },
                            get children() {
                              return [createComponent(L10n.Compose, {
                                text: "LOC_PAUSE_MENU_MODS_TITLE"
                              }), (() => {
                                var _el$37 = _tmpl$15();
                                _el$37.style.setProperty("background-image", "url(blp:base_component-arrow)");
                                createRenderEffect(() => className(_el$37, `size-10 absolute right-1 -top-3 bg-contain ${!model.isModsCollapsed ? "-rotate-90" : ""}`));
                                return _el$37;
                              })()];
                            }
                          });
                        }
                      }), createComponent(Show, {
                        get when() {
                          return props.hasActiveMods && !props.hasActiveDLC;
                        },
                        get children() {
                          var _el$38 = _tmpl$16();
                          insert(_el$38, createComponent(L10n.Compose, {
                            text: "LOC_PAUSE_MENU_MODS_TITLE"
                          }));
                          return _el$38;
                        }
                      }), _tmpl$17(), createComponent(Show, {
                        get when() {
                          return !model.isModsCollapsed;
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return props.activeMods;
                            },
                            children: (addon) => [createComponent(Activatable, {
                              "class": "w-full font title uppercase mt-2 mb-1",
                              onActivate: () => openAddonInOverlay(addon),
                              get children() {
                                return createComponent(L10n.Stylize, {
                                  get text() {
                                    return getAddonName(addon);
                                  }
                                });
                              }
                            }), _tmpl$21()]
                          });
                        }
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return props.hasActiveDLC;
                    },
                    get children() {
                      return [createComponent(Show, {
                        get when() {
                          return props.hasActiveMods && props.hasActiveDLC;
                        },
                        get children() {
                          return createComponent(Activatable, {
                            "class": "w-full text-secondary text-lg font-title uppercase bold flex flex-row relative mt-3",
                            get onActivate() {
                              return model.onClickCollapseAddons;
                            },
                            get disabled() {
                              return !props.hasActiveMods;
                            },
                            get children() {
                              return [createComponent(L10n.Compose, {
                                text: "LOC_UI_CONTENT_MGR_SUBTITLE"
                              }), (() => {
                                var _el$40 = _tmpl$15();
                                _el$40.style.setProperty("background-image", "url(blp:base_component-arrow)");
                                createRenderEffect(() => className(_el$40, `size-10 absolute right-1 -top-3 bg-contain ${!model.isAddonCollapsed ? "-rotate-90" : ""}`));
                                return _el$40;
                              })()];
                            }
                          });
                        }
                      }), createComponent(Show, {
                        get when() {
                          return !props.hasActiveMods && props.hasActiveDLC;
                        },
                        get children() {
                          var _el$41 = _tmpl$16();
                          insert(_el$41, createComponent(L10n.Compose, {
                            text: "LOC_UI_CONTENT_MGR_SUBTITLE"
                          }));
                          return _el$41;
                        }
                      }), _tmpl$17(), createComponent(Show, {
                        get when() {
                          return !model.isAddonCollapsed;
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return props.activeDLC;
                            },
                            children: (addon) => [createComponent(Activatable, {
                              "class": "w-full font title uppercase mt-2 mb-1",
                              onActivate: () => openAddonInOverlay(addon),
                              audio: EMPTY_ACTIVATABLE_AUDIO,
                              get children() {
                                return createComponent(L10n.Stylize, {
                                  get text() {
                                    return getAddonName(addon);
                                  }
                                });
                              }
                            }), _tmpl$21()]
                          });
                        }
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return !props.hasActiveMods && !props.hasActiveDLC;
                    },
                    get children() {
                      var _el$43 = _tmpl$18();
                      insert(_el$43, createComponent(L10n.Compose, {
                        text: "LOC_PAUSE_MENU_NO_ADDONS"
                      }));
                      return _el$43;
                    }
                  })];
                }
              });
            }
          });
        }
      }), createComponent(Show, {
        get when() {
          return !model.supportsSSO;
        },
        get children() {
          var _el$44 = _tmpl$19();
          insert(_el$44, createComponent(PauseMenuProgressionContainer, mergeProps(() => props.progressionBadgeProps)));
          return _el$44;
        }
      }), createComponent(Button, {
        "class": "pause-menu-button mt-5",
        get onActivate() {
          return model.onClickAdvancedOptions;
        },
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_ADVANCED_OPTIONS_ADVANCED"
          });
        }
      }), createComponent(Show, {
        get when() {
          return !model.supportsSSO;
        },
        get children() {
          var _el$45 = _tmpl$20();
          _el$45.style.setProperty("color", "rgba(222, 203, 149, 1)");
          insert(_el$45, () => model.data.gameInfo.buildInfo);
          return _el$45;
        }
      })];
    }
  }));
};
const PauseMenuComponent = (props) => {
  const model = createPauseMenuModel();
  return createComponent(PauseMenuContext.Provider, {
    value: model,
    get children() {
      return createComponent(Panel, {
        ref(r$) {
          var _ref$ = props.ref;
          typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
        },
        name: "pause-menu",
        "class": "h-full w-full pause-menu-fade-in flex flex-col relative",
        id: "screen-pause-menu",
        get children() {
          return [_tmpl$22(), createComponent(Show, {
            get when() {
              return model && model.data;
            },
            get children() {
              return [_tmpl$23(), _tmpl$24(), createComponent(HSlot, {
                "class": "relative justify-center",
                get children() {
                  return [(() => {
                    var _el$51 = _tmpl$25();
                    _el$51.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                    return _el$51;
                  })(), (() => {
                    var _el$52 = _tmpl$26();
                    _el$52.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                    return _el$52;
                  })(), (() => {
                    var _el$53 = _tmpl$27();
                    _el$53.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                    return _el$53;
                  })(), (() => {
                    var _el$54 = _tmpl$28();
                    _el$54.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                    return _el$54;
                  })(), createComponent(HSlot, {
                    "class": "pause-menu-main-container w-full flex flex-row relative justify-around",
                    "data-name": "pause-menu-main-container",
                    get children() {
                      return [createComponent(PauseMenuLeaderContainer, mergeProps(() => model.data.leaderInfo)), createComponent(PauseMenuInfoContainer, mergeProps(() => model.data.addonInfoSectionProps)), createComponent(PauseMenuButtonContainer, {}), createComponent(Show, {
                        get when() {
                          return model.supportsSSO;
                        },
                        get children() {
                          var _el$55 = _tmpl$29();
                          _el$55.style.setProperty("color", "rgba(222, 203, 149, 1)");
                          insert(_el$55, () => model.data.gameInfo.buildInfo);
                          return _el$55;
                        }
                      }), createComponent(Show, {
                        get when() {
                          return model.supportsSSO;
                        },
                        get children() {
                          return createComponent(Activatable, {
                            "class": "pause-menu-social-button hover\\:scale-110 size-20 transition-transform img-prof-btn-bg flex flex-col items-center justify-center absolute -top-28 right-10 bg-contain bg-no-repeat",
                            get onActivate() {
                              return model.onClickSocialPanel;
                            },
                            disableFocus: true,
                            hotkeyAction: "shell-action-2",
                            style: {
                              "transition-duration": "0.1s"
                            },
                            get children() {
                              return [_tmpl$30(), createComponent(NavHelp, {
                                "class": "absolute -left-6"
                              })];
                            }
                          });
                        }
                      })];
                    }
                  })];
                }
              }), _tmpl$24(), (() => {
                var _el$58 = _tmpl$31(), _el$59 = _el$58.firstChild;
                insert(_el$58, createComponent(PauseMenuGameInfoContainer, mergeProps(() => model.data.gameInfo)), null);
                return _el$58;
              })()];
            }
          }), _tmpl$32()];
        }
      });
    }
  });
};
const PauseMenu = ComponentRegistry.register({
  name: "PauseMenu",
  styles: [style],
  createInstance: PauseMenuComponent
});

export { PauseMenu };
//# sourceMappingURL=pause-menu.js.map
