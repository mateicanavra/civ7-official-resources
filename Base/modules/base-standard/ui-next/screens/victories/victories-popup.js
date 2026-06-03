import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createContext, onMount, onCleanup, createComponent, Show, For, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import { InputEngineEventName } from '../../../../core/ui/input/input-support.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { PortraitIcon } from '../../../../core/ui-next/components/portrait-icon.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { VictoriesPopupViewModel, VictoriesPopupDataModel } from './victories-popup-model.js';
import style from './victories-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="filigree-title-accent-left opacity-50"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative size-16 -mt-12"><div class="absolute inset-0 bg-no-repeat bg-contain"></div><div class="absolute inset-0 bg-no-repeat bg-contain"></div><div class="absolute inset-0 bg-no-repeat bg-contain"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="filigree-title-accent-right opacity-50 victories-popup-filigree-adjust"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full h-9"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="font-title text-xl text-secondary uppercase"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="filigree-shell-small h-4 my-2 w-full"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class=size-32></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="mb-4 flex flex-col max-w-192"><div class="font-body text-sm"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="font-title text-lg uppercase mb-2 text-center"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class=mb-4></div>`);
const VictoriesPopupContext = createContext();
const VictoriesPopupComponent = (_props) => {
  const model = VictoriesPopupViewModel.get();
  const dataModel = VictoriesPopupDataModel.get();
  dataModel.startTimer();
  onMount(() => {
    window.addEventListener(InputEngineEventName, handleWindowEngineInput);
  });
  onCleanup(() => {
    window.removeEventListener(InputEngineEventName, handleWindowEngineInput);
  });
  const handleWindowEngineInput = (inputEvent) => {
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "keyboard-enter") {
      dataModel.clickCloseButton();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  return createComponent(VictoriesPopupContext.Provider, {
    value: model,
    get children() {
      return createComponent(Panel, {
        name: "Victories-Popup",
        id: "victories-popup",
        get ["class"]() {
          return `h-full w-full ${dataModel.extraClass()}`;
        },
        get children() {
          return createComponent(VSlot, {
            "class": "w-full h-full justify-center",
            get children() {
              return createComponent(HSlot, {
                "class": "victories-popup-main victories-popup-border w-full bg-no-repeat bg-cover items-center justify-center relative",
                get children() {
                  return [createComponent(Show, {
                    get when() {
                      return !model.victoryUnlockBanner;
                    },
                    get children() {
                      return createComponent(PortraitIcon, {
                        get playerId() {
                          return model.players[0].playerId;
                        },
                        size: 32
                      });
                    }
                  }), createComponent(VSlot, {
                    "class": "relative h-auto items-center",
                    get children() {
                      return [(() => {
                        var _el$ = _tmpl$4();
                        insert(_el$, createComponent(HSlot, {
                          "class": "relative self-center victories-popup-trophy-adjust",
                          get children() {
                            return [_tmpl$(), (() => {
                              var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling;
                              _el$4.style.setProperty("background-image", "url(blp:subsystem_panel_header_icon_backing)");
                              _el$4.style.setProperty("filter", "fxs-color-tint(#5b441f)");
                              _el$5.style.setProperty("background-image", "url(blp:pedia_circle_frame)");
                              _el$6.style.setProperty("background-image", "url(blp:sub_agetimer)");
                              return _el$3;
                            })(), _tmpl$3()];
                          }
                        }));
                        return _el$;
                      })(), (() => {
                        var _el$8 = _tmpl$5();
                        insert(_el$8, createComponent(Show, {
                          get when() {
                            return !model.victoryUnlockBanner;
                          },
                          get fallback() {
                            return createComponent(L10n.Compose, {
                              text: "LOC_VICTORIES_POPUP_UNLOCK_TITLE"
                            });
                          },
                          get children() {
                            return createComponent(L10n.Compose, {
                              text: "LOC_VICTORY_POPUP_COUNTDOWN",
                              get args() {
                                return [model.players[0].active[0].victoryName, model.players[0].turnsToVictory()];
                              }
                            });
                          }
                        }));
                        return _el$8;
                      })(), createComponent(Show, {
                        get when() {
                          return model.victoryUnlockBanner;
                        },
                        get children() {
                          return _tmpl$6();
                        }
                      }), createComponent(Show, {
                        get when() {
                          return !model.victoryUnlockBanner;
                        },
                        get fallback() {
                          return (() => {
                            var _el$11 = _tmpl$8(), _el$12 = _el$11.firstChild;
                            insert(_el$11, createComponent(For, {
                              get each() {
                                return model.unlockedVictories;
                              },
                              children: (victory) => (() => {
                                var _el$13 = _tmpl$9();
                                insert(_el$13, createComponent(L10n.Compose, {
                                  text: "LOC_VICTORIES_POPUP_UNLOCK_BODY",
                                  get args() {
                                    return [victory.tierName, victory.multiplier];
                                  }
                                }));
                                return _el$13;
                              })()
                            }), _el$12);
                            insert(_el$12, createComponent(L10n.Compose, {
                              text: "LOC_VICTORIES_POPUP_UNLOCK_FOOTER"
                            }));
                            return _el$11;
                          })();
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return model.players;
                            },
                            children: (player, playerIndex) => createComponent(For, {
                              get each() {
                                return player.active;
                              },
                              children: (victory, victoryIndex) => createComponent(Show, {
                                get when() {
                                  return createMemo(() => victory.turnsLeft != -1)() && (victoryIndex() == 0 || playerIndex() == 0);
                                },
                                get children() {
                                  return [createComponent(L10n.Stylize, {
                                    text: "LOC_VICTORY_POPUP_DETAIL",
                                    get args() {
                                      return [player.playerName, victory.victoryName, victory.turnsLeft];
                                    }
                                  }), createComponent(Show, {
                                    get when() {
                                      return playerIndex() == 0;
                                    },
                                    get children() {
                                      return _tmpl$10();
                                    }
                                  })];
                                }
                              })
                            })
                          });
                        }
                      })];
                    }
                  }), createComponent(Show, {
                    get when() {
                      return !model.victoryUnlockBanner;
                    },
                    get children() {
                      return _tmpl$7();
                    }
                  })];
                }
              });
            }
          });
        }
      });
    }
  });
};
const VictoriesPopup = ComponentRegistry.register({
  name: "VictoriesPopup",
  styles: [style],
  createInstance: VictoriesPopupComponent
});
defineLegacyComponent("screen-victories-popup", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(VictoriesPopup, {});
});

export { VictoriesPopup };
//# sourceMappingURL=victories-popup.js.map
