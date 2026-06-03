import { template, insert, setAttribute } from '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show, createRenderEffect } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../../ui/context-manager/context-manager.js';
import { ScreenProfilePageExternalStatus } from '../../../ui/profile-page/screen-profile-page.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { getPlayerCardInfo } from '../../../ui/utilities/utilities-liveops.js';
import { Activatable } from '../../components/activatable.js';
import { Button } from '../../components/button.js';
import { ConfirmationDialog } from '../../components/confirmation-dialog.js';
import { L10n } from '../../components/l10n.js';
import { NavHelp } from '../../components/nav-help.js';
import { BadgeSize, ProgressionBadge } from '../../components/progression-badge.js';
import { Scene3d, Background3d, BackgroundLayer3d } from '../../components/scene-3d.js';
import { useScreenFlowContext } from '../../components/screen-flow.js';
import { AgeSelectModel } from './age-select-model.js';
import { CreateGameBackButtton, CreateGameNavButton } from './create-game-components.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { LayoutModel, useIsSmallScreen } from '../../utilities/layout-utilities.js';
import style from './create-game-stage.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class=filigree-divider-h2></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=fullscreen><div class=create-game-stage-header></div><div class="create-game-stage-body relative"><div class="absolute inset-0\\.5 overflow-hidden"><div class="absolute inset-y-px -left-1 pointer-events-none"></div></div><div class="absolute left-0 right-0 -top-5 flex flex-row items-center justify-center -scale-y-100"></div><div class="absolute inset-y-1 inset-x-0"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="text-tertiary-1 flex flex-row uppercase"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="create-game-badge-container img-prof-btn-bg pointer-events-auto relative group group-pressed\\:scale-110 group-hover\\:scale-110 group-focus\\:scale-110"><div class="absolute inset-0 opacity-30 group-pressed\\:scale-110 group-hover\\:scale-110 group-focus\\:scale-110"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="create-game-stage-header-container pb-6 h-full flex flex-col items-center justify-center relative"><div class=h-5></div><div class=grow></div><div class="flex flex-row items-center justify-center -my-1\\.5"><div class="create-games-stage-header-filigree mt-1"></div><div class="create-game-header-title font-title text-tertiary-1 font-black mx-7 uppercase"></div><div class="create-games-stage-header-filigree mt-1 -scale-x-100"></div></div><div class=grow></div><div class="create-game-header-left-button-area flex flex-row items-center justify-center absolute"></div><div class="create-game-header-right-button-area flex flex-row items-center justify-center absolute"></div></div>`);
var CreateGameStageMode = /* @__PURE__ */ ((CreateGameStageMode2) => {
  CreateGameStageMode2[CreateGameStageMode2["Full"] = 0] = "Full";
  CreateGameStageMode2[CreateGameStageMode2["StageOnly"] = 1] = "StageOnly";
  CreateGameStageMode2[CreateGameStageMode2["HeaderOnly"] = 2] = "HeaderOnly";
  CreateGameStageMode2[CreateGameStageMode2["None"] = 3] = "None";
  return CreateGameStageMode2;
})(CreateGameStageMode || {});
const CreateGameStageComponent = (props) => {
  const layout = LayoutModel.get();
  const ageModel = AgeSelectModel.get();
  const isSmallScreen = useIsSmallScreen();
  const horizScaleFactor = createMemo(() => layout.screenWidth() / 1920);
  const headerHeight = layout.toScaledPixels(130);
  const headerHeightSmall = layout.toScaledPixels(84);
  const footerHeight = layout.toScaledPixels(isSmallScreen() ? 0 : 60);
  const getHeaderHeight = createMemo(() => {
    return isSmallScreen() ? headerHeightSmall() : headerHeight();
  });
  const getBodyHeight = createMemo(() => {
    return layout.screenHeight() - getHeaderHeight() - footerHeight();
  });
  const shadowBottomOffset = createMemo(() => footerHeight() - getHeaderHeight());
  const gradientBaseSize = layout.toScaledPixels(2048);
  const gradientBaseOffset = layout.toScaledPixels(-76);
  const gradientSize = createMemo(() => gradientBaseSize() * horizScaleFactor());
  const gradientOffset = createMemo(() => gradientBaseOffset() * horizScaleFactor());
  const stageGradientWidthBase = layout.toScaledPixels(1800);
  const stageGradientWidth = createMemo(() => stageGradientWidthBase() * horizScaleFactor());
  const headerBgFiligreeWidth = layout.toScaledPixels(990);
  const headerBgFiligreeHeight = layout.toScaledPixels(250);
  const headerBgFiligreeOffsetX = layout.toScaledPixels(6);
  const headerBgFiligreeOffsetY = layout.toScaledPixels(9);
  const dividerLineExtension = layout.toScaledPixels(64);
  const dividerLineWidth = createMemo(() => dividerLineExtension() + layout.screenWidth());
  const dividerLineHeight = layout.toScaledPixels(16);
  const showStage = createMemo(() => props.mode != 2 /* HeaderOnly */ && props.mode != 3 /* None */);
  const showHeader = createMemo(() => props.mode != 1 /* StageOnly */ && props.mode != 3 /* None */);
  const showBg = createMemo(() => props.mode == 0 /* Full */ || !props.mode);
  const defaultAgeBg = createMemo(() => `${ageModel.selectedAge.type.toLowerCase().replace("age_", "shell_")}-select`);
  return [createComponent(Scene3d, {
    name: "create-game-stage",
    get children() {
      return createComponent(Background3d, {
        get children() {
          return [createComponent(Show, {
            get when() {
              return showBg();
            },
            get children() {
              return createComponent(BackgroundLayer3d, {
                name: "bg-gradeint",
                texture: "mm_allgradient",
                get size() {
                  return {
                    x: gradientSize(),
                    y: gradientSize()
                  };
                },
                get offset() {
                  return {
                    x: 0,
                    y: gradientOffset()
                  };
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                get stretch() {
                  return StretchMode.UniformFill;
                }
              });
            }
          }), createComponent(Show, {
            get when() {
              return showHeader();
            },
            get children() {
              return [createComponent(BackgroundLayer3d, {
                name: "header-filigree-left",
                texture: "base_frame-filigree",
                get size() {
                  return {
                    x: headerBgFiligreeWidth(),
                    y: headerBgFiligreeHeight()
                  };
                },
                get alignX() {
                  return AlignMode.Minimum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                get offset() {
                  return {
                    x: headerBgFiligreeOffsetX(),
                    y: headerBgFiligreeOffsetY()
                  };
                },
                borderImageSlice: "140 1 1 140",
                borderImageWidth: "140 1 1 140",
                alpha: 0.15
              }), createComponent(BackgroundLayer3d, {
                name: "header-filigree-right",
                texture: "base_frame-filigree",
                get size() {
                  return {
                    x: headerBgFiligreeWidth(),
                    y: headerBgFiligreeHeight()
                  };
                },
                get alignX() {
                  return AlignMode.Maximum;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                flipX: true,
                get offset() {
                  return {
                    x: headerBgFiligreeOffsetX(),
                    y: headerBgFiligreeOffsetY()
                  };
                },
                borderImageSlice: "140 140 1 1",
                borderImageWidth: "140 140 1 1",
                alpha: 0.15
              }), createComponent(Show, {
                get when() {
                  return !isSmallScreen();
                },
                get children() {
                  return [createComponent(BackgroundLayer3d, {
                    name: "footer-filigree-left",
                    texture: "base_frame-filigree",
                    get size() {
                      return {
                        x: headerBgFiligreeWidth(),
                        y: headerBgFiligreeHeight()
                      };
                    },
                    get alignX() {
                      return AlignMode.Minimum;
                    },
                    get alignY() {
                      return AlignMode.Maximum;
                    },
                    flipY: true,
                    get offset() {
                      return {
                        x: headerBgFiligreeOffsetX(),
                        y: headerBgFiligreeOffsetY()
                      };
                    },
                    borderImageSlice: "1 1 140 140",
                    borderImageWidth: "1 1 140 140",
                    alpha: 0.15
                  }), createComponent(BackgroundLayer3d, {
                    name: "footer-filigree-right",
                    texture: "base_frame-filigree",
                    get size() {
                      return {
                        x: headerBgFiligreeWidth(),
                        y: headerBgFiligreeHeight()
                      };
                    },
                    get alignX() {
                      return AlignMode.Maximum;
                    },
                    get alignY() {
                      return AlignMode.Maximum;
                    },
                    flipY: true,
                    flipX: true,
                    get offset() {
                      return {
                        x: headerBgFiligreeOffsetX(),
                        y: headerBgFiligreeOffsetY()
                      };
                    },
                    borderImageSlice: "1 140 140 1",
                    borderImageWidth: "1 140 140 1",
                    alpha: 0.15
                  })];
                }
              })];
            }
          }), createComponent(Show, {
            get when() {
              return showStage();
            },
            get children() {
              return [createComponent(BackgroundLayer3d, {
                name: "stage-bg-gradient",
                texture: "mm_allgradient",
                get size() {
                  return {
                    x: layout.screenWidth(),
                    y: getBodyHeight()
                  };
                },
                get offset() {
                  return {
                    x: 0,
                    y: getHeaderHeight()
                  };
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                get stretch() {
                  return StretchMode.UniformFill;
                }
              }), createComponent(BackgroundLayer3d, {
                name: "stage-body",
                get texture() {
                  return props.backgroundImage ?? defaultAgeBg();
                },
                get size() {
                  return {
                    x: layout.screenWidth(),
                    y: getBodyHeight()
                  };
                },
                get offset() {
                  return {
                    x: 0,
                    y: getHeaderHeight()
                  };
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                get alpha() {
                  return props.backgroundOpacity ?? 0.15;
                },
                get stretch() {
                  return StretchMode.UniformFill;
                }
              }), createComponent(Show, {
                get when() {
                  return !props.addTextBgGradient;
                },
                get children() {
                  return createComponent(BackgroundLayer3d, {
                    name: "stage-gradient",
                    texture: "create_game_gradient1",
                    get size() {
                      return {
                        x: stageGradientWidth(),
                        y: getBodyHeight()
                      };
                    },
                    get offset() {
                      return {
                        x: 0,
                        y: getHeaderHeight()
                      };
                    },
                    get alignY() {
                      return AlignMode.Minimum;
                    },
                    get alignX() {
                      return AlignMode.Minimum;
                    },
                    alpha: 0.85,
                    get stretch() {
                      return StretchMode.UniformFill;
                    }
                  });
                }
              }), createComponent(BackgroundLayer3d, {
                name: "shadow-top",
                texture: "create_game_gradient3",
                get size() {
                  return {
                    x: layout.screenWidth(),
                    y: getHeaderHeight()
                  };
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                alpha: 0.5
              }), createComponent(Show, {
                get when() {
                  return !isSmallScreen();
                },
                get children() {
                  return createComponent(BackgroundLayer3d, {
                    name: "shadow-bottom",
                    texture: "create_game_gradient3",
                    get size() {
                      return {
                        x: layout.screenWidth(),
                        y: getHeaderHeight()
                      };
                    },
                    get offset() {
                      return {
                        x: 0,
                        y: shadowBottomOffset()
                      };
                    },
                    get alignY() {
                      return AlignMode.Maximum;
                    },
                    flipY: true,
                    alpha: 0.5
                  });
                }
              }), createComponent(BackgroundLayer3d, {
                name: "stage-divider-top",
                texture: "hud_section-line_gold",
                get size() {
                  return {
                    x: dividerLineWidth(),
                    y: dividerLineHeight()
                  };
                },
                get offset() {
                  return {
                    x: 0,
                    y: getHeaderHeight()
                  };
                },
                get alignX() {
                  return AlignMode.Center;
                },
                get alignY() {
                  return AlignMode.Minimum;
                },
                borderImageSlice: "1 40 1 40",
                borderImageWidth: "1 40 1 40"
              }), createComponent(BackgroundLayer3d, {
                name: "stage-divider-bottom",
                texture: "hud_section-line_gold",
                get size() {
                  return {
                    x: dividerLineWidth(),
                    y: dividerLineHeight()
                  };
                },
                get offset() {
                  return {
                    x: 0,
                    y: footerHeight()
                  };
                },
                get alignX() {
                  return AlignMode.Center;
                },
                get alignY() {
                  return AlignMode.Maximum;
                },
                flipY: true,
                borderImageSlice: "1 40 1 40",
                borderImageWidth: "1 40 1 40"
              })];
            }
          })];
        }
      });
    }
  }), (() => {
    var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$4.nextSibling, _el$8 = _el$6.nextSibling;
    insert(_el$2, () => props.header);
    _el$5.style.setProperty("right", "40%");
    insert(_el$6, createComponent(Show, {
      get when() {
        return !props.hideLowerHeaderFiligree;
      },
      get children() {
        return _tmpl$();
      }
    }));
    insert(_el$8, () => props.children);
    createRenderEffect((_p$) => {
      var _v$ = `${getBodyHeight()}px`, _v$2 = !!props.addTextBgGradient;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$3.style.setProperty("height", _v$) : _el$3.style.removeProperty("height"));
      _v$2 !== _p$.t && _el$5.classList.toggle("create-game-text-gradient", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })()];
};
const CreateGameStage = ComponentRegistry.register({
  name: "CreateGameStage",
  createInstance: CreateGameStageComponent,
  styles: [style]
});
var ExitButtonPosition = /* @__PURE__ */ ((ExitButtonPosition2) => {
  ExitButtonPosition2[ExitButtonPosition2["Left"] = 0] = "Left";
  ExitButtonPosition2[ExitButtonPosition2["Right"] = 1] = "Right";
  ExitButtonPosition2[ExitButtonPosition2["None"] = 2] = "None";
  return ExitButtonPosition2;
})(ExitButtonPosition || {});
const CreateGameStageHeaderComponent = (props) => {
  const context = useScreenFlowContext();
  const isSmallScreen = useIsSmallScreen();
  const badgeSize = createMemo(() => isSmallScreen() ? BadgeSize.MICRO : BadgeSize.MINI);
  const playerCardInfo = createMemo(() => getPlayerCardInfo());
  function onProgressionBadge() {
    if (Network.isMetagamingAvailable()) {
      ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = true;
      ContextManager.push("screen-profile-page", {
        singleton: true,
        createMouseGuard: true,
        panelOptions: {
          onlyChallenges: false,
          onlyLeaderboards: false
        }
      });
    }
  }
  const exitHotkey = createMemo(() => props.exitHotkey ?? "shell-action-2");
  return (() => {
    var _el$9 = _tmpl$5(), _el$10 = _el$9.firstChild, _el$12 = _el$10.nextSibling, _el$13 = _el$12.nextSibling, _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling, _el$16 = _el$13.nextSibling, _el$17 = _el$16.nextSibling, _el$18 = _el$17.nextSibling;
    insert(_el$10, createComponent(Show, {
      get when() {
        return props.showSteps;
      },
      get children() {
        var _el$11 = _tmpl$3();
        insert(_el$11, createComponent(L10n.Compose, {
          text: "LOC_UI_CREATE_GAME_STEP_NUM_OF_TOT",
          get args() {
            return [context.currentStep(), context.numSteps()];
          }
        }));
        createRenderEffect((_$p) => (_$p = Layout.pixels(16)) != null ? _el$11.style.setProperty("font-size", _$p) : _el$11.style.removeProperty("font-size"));
        return _el$11;
      }
    }));
    insert(_el$15, createComponent(L10n.Compose, {
      get text() {
        return props.title;
      }
    }));
    insert(_el$9, () => props.children, _el$17);
    insert(_el$17, createComponent(CreateGameBackButtton, {
      get onBack() {
        return props.onBack;
      }
    }), null);
    insert(_el$17, createComponent(Show, {
      get when() {
        return !!props.exitText;
      },
      get children() {
        return createComponent(ConfirmationDialog, {
          name: "exit-to-menu",
          onAccept: () => context.close(),
          get title() {
            return createComponent(L10n.Compose, {
              text: "LOC_UI_CREATE_GAME_EXIT_TO_MENU"
            });
          },
          get children() {
            return createComponent(CreateGameNavButton, {
              "class": "ml-4",
              get hotkeyAction() {
                return exitHotkey();
              },
              get navTrayText() {
                return props.exitText;
              },
              disableFocus: true,
              get children() {
                return createComponent(L10n.Stylize, {
                  "class": "font-fit-shrink",
                  get text() {
                    return props.exitText;
                  }
                });
              }
            });
          }
        });
      }
    }), null);
    insert(_el$18, createComponent(Show, {
      get when() {
        return !!props.hideButtonText;
      },
      get children() {
        return createComponent(Button, {
          onActivate: () => context.close(),
          get hotkeyAction() {
            return exitHotkey();
          },
          get navTrayText() {
            return props.hideButtonText;
          },
          disableFocus: true,
          get children() {
            return props.hideButtonText;
          }
        });
      }
    }));
    insert(_el$9, createComponent(Show, {
      get when() {
        return !UI.isInGame();
      },
      get children() {
        return createComponent(Activatable, {
          "class": "absolute right-6 top-6 create-game-badge-container relative group",
          onActivate: onProgressionBadge,
          disableFocus: true,
          hotkeyAction: "sys-menu",
          get children() {
            return [(() => {
              var _el$19 = _tmpl$4(), _el$20 = _el$19.firstChild;
              insert(_el$19, createComponent(ProgressionBadge, {
                get badgeSize() {
                  return badgeSize();
                },
                get badgeUrl() {
                  return playerCardInfo().BadgeURL;
                },
                get progressionLevel() {
                  return playerCardInfo().FoundationLevel.toString();
                },
                "class": "group-pressed\\:scale-110 group-hover\\:scale-110 group-focus\\:scale-110"
              }), null);
              createRenderEffect((_p$) => {
                var _v$3 = playerCardInfo().twoKName, _v$4 = playerCardInfo().BackgroundColor;
                _v$3 !== _p$.e && setAttribute(_el$19, "data-tooltip-content", _p$.e = _v$3);
                _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$20.style.setProperty("background-color", _v$4) : _el$20.style.removeProperty("background-color"));
                return _p$;
              }, {
                e: void 0,
                t: void 0
              });
              return _el$19;
            })(), createComponent(NavHelp, {
              "class": "absolute -top-4 -right-4",
              actionName: "sys-menu"
            })];
          }
        });
      }
    }), null);
    return _el$9;
  })();
};
const CreateGameStageHeader = ComponentRegistry.register({
  name: "CreateGameStageHeader",
  createInstance: CreateGameStageHeaderComponent,
  styles: [style]
});

export { CreateGameStage, CreateGameStageHeader, CreateGameStageMode, ExitButtonPosition };
//# sourceMappingURL=create-game-stage.js.map
