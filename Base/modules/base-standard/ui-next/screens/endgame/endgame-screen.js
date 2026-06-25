import { template, insert, className, use } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createEffect, createComponent, Show, createRenderEffect, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { InputEngineEventName } from '../../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { EndgameCinematicManager } from './endgame-cinematics.js';
import { createEndGameContextModel, EndGameScreenContext } from './endgame-model.js';
import { PortraitIconVictory } from './victory-portrait-component.js';
import style from './endgame-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="endgame-icon size-20 bg-contain mr-4"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="endgame-victory-desc mt-8 z-1 text-center whitespace-nowrap"> </div>`), _tmpl$3 = /* @__PURE__ */ template(`<div><div></div><div class="absolute flex justify-center items-center w-full top-0 h-36"><div class="endgame-banner-title tracking-100 font-semibold uppercase text-center font-title fxs-header flex flow-row justify-center items-center"role=heading><div class="endgame-filligree w-96 h-16 bg-no-repeat"></div><div class="endgame-filligree right w-96 h-16 bg-no-repeat"></div></div></div><div class="endgame-banner-bottom-filigree absolute -bottom-1\\.5 h-11 w-full bg-center bg-no-repeat"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex justify-center -mt-14 ml-4"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="endgame-victory-quote-bg absolute bottom-10 left-10 w-194 min-h-44 bg-center bg-no-repeat bg-cover"><div class="absolute flex justify-center h-36 items-center -top-20 w-full pointer-events-none"><div class="endgame-quote-filigree-left w-48 h-16 bg-no-repeat bg-center bg-cover left"></div><div class="endgame-quote-filigree-right w-48 h-16 bg-no-repeat right bg-center bg-cover"></div><div class="endgame-quote-filligree w-9 h-16 bg-no-repeat absolute"></div></div><div class="font-base p-4 text-center text-lg pointer-events-auto"role=heading></div><div class="endgame-victory-quote flex flow-column justify-center items-center "><div class=filigree-shell-small></div><div class="auther flex font-title text-lg mb-6"role=heading><div class=filigree-h4-left></div><div class=filigree-h4-right></div></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute bottom-10 right-10 flex flow-row"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="endgame-movie fullscreen absolute inset-0"></div>`);
const EndGameScreenComponent = () => {
  const [activePage, setActivePage] = createSignal(0);
  const model = createEndGameContextModel();
  let fxsMovie;
  onMount(() => {
    model.refreshEndgameData();
    window.addEventListener(InputEngineEventName, handleWindowEngineInput);
  });
  onCleanup(() => {
    fxsMovie?.removeEventListener("movie-ended", onMovieEnd);
    window.removeEventListener(InputEngineEventName, handleWindowEngineInput);
  });
  const isDomination = model.endgameData.victoryClassType === "VICTORY_CLASS_DOMINATION";
  InterfaceMode.switchTo("INTERFACEMODE_CINEMATIC");
  let lastPage = -1;
  createEffect(() => {
    const currPage = activePage();
    if (lastPage != currPage) {
      EndgameCinematicManager.instance.stop();
      switch (currPage) {
        case 0:
          EndgameCinematicManager.instance.start({
            victoryClass: model.endgameData.victoryClassType,
            isDefeat: model.endgameData.isDefeated
          }, () => {
            nextPage();
          });
          break;
        case 1:
          EndgameCinematicManager.instance.start();
          break;
      }
      lastPage = currPage;
    }
    if (currPage == 0) {
      UI.sendAudioEvent(model.endgameData.victorySound);
    }
    if (currPage == 1) {
      const quote = GameInfo.TypeQuotes.lookup(model.endgameData.leaderQuoteAudioKey);
      if (quote && quote.QuoteAudio) {
        UI.sendAudioEvent(quote.QuoteAudio);
      }
    }
    if (activePage() !== 2 || !fxsMovie) return;
    if (fxsMovie.children.length > 0) return;
    const movie = document.createElement("fxs-movie");
    movie.setAttribute("data-movie-fit-mode", "cover");
    movie.setAttribute("data-movie-id", model.endgameData.movieType);
    movie.classList.add("fullscreen", "absolute", "inset-0");
    movie.addEventListener("movie-ended", onMovieEnd);
    fxsMovie.appendChild(movie);
  });
  const nextPage = () => {
    if (activePage() < 2) {
      if (activePage() == 0 && model.endgameData.isDefeated) {
        setActivePage(2);
      } else {
        setActivePage(activePage() + 1);
      }
    } else {
      progressToVictoriesScreen();
    }
  };
  const onMovieEnd = () => {
    if (fxsMovie) {
      fxsMovie.style.display = "none";
    }
    progressToVictoriesScreen();
  };
  const progressToVictoriesScreen = () => {
    ContextManager.pop("endgame-screen");
    ContextManager.push("screen-victory-progress", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        endGameScreen: "true",
        activeTabId: model.endgameData.victoryTab,
        allowOneMoreTurn: `${model.endgameData.allowOneMoreTurn}`,
        showNextTurnButton: `${model.endgameData.showNextTurnButton}`
      }
    });
  };
  const handleWindowEngineInput = (inputEvent) => {
    if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      switch (inputEvent.detail.name) {
        case "sys-menu":
          nextPage();
          break;
      }
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  return createComponent(Panel, {
    name: "EndGame-Screen",
    id: "endgame-screen",
    "data-name": "EndGameScreen",
    "class": "fullscreen",
    onCancelInput: () => nextPage(),
    get children() {
      return createComponent(EndGameScreenContext.Provider, {
        value: model,
        get children() {
          return [createComponent(Show, {
            get when() {
              return activePage() < 2;
            },
            get children() {
              var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$7 = _el$5.nextSibling, _el$10 = _el$3.nextSibling;
              _el$5.style.setProperty("background-image", "url('blp:age-banner_filligree.png')");
              insert(_el$4, createComponent(Show, {
                get when() {
                  return !!model.endgameData.victoryIconUrl?.trim();
                },
                get children() {
                  var _el$6 = _tmpl$();
                  createRenderEffect((_$p) => (_$p = `${model.endgameData.victoryIconUrl}`) != null ? _el$6.style.setProperty("background-image", _$p) : _el$6.style.removeProperty("background-image"));
                  return _el$6;
                }
              }), _el$7);
              insert(_el$4, () => model.endgameData.victoryName, _el$7);
              _el$7.style.setProperty("background-image", "url('blp:age-banner_filligree.png')");
              insert(_el$, createComponent(Show, {
                get when() {
                  return createMemo(() => model.endgameData.victoryDescription != "")() && activePage() === 0;
                },
                get children() {
                  var _el$8 = _tmpl$2(), _el$9 = _el$8.firstChild;
                  insert(_el$8, createComponent(L10n.Stylize, {
                    get text() {
                      return model.endgameData.victoryDescription;
                    },
                    role: "heading"
                  }), null);
                  return _el$8;
                }
              }), _el$10);
              _el$10.style.setProperty("background-image", "url('blp:popup_paneltop_wide.png')");
              createRenderEffect((_p$) => {
                var _v$ = `endgame-victory-title flex justify-center items-center bg-cover bg-no-repeat relative ${activePage() === 1 ? "h-36" : model.endgameData.victoryDescription !== "" ? "h-48" : "h-40 no-desc"}`, _v$2 = `endgame-banner-border absolute size-full top-0 left-0${activePage() === 1 ? " small" : ""}`, _v$3 = `${model.endgameData.victoryBgUrl}}`;
                _v$ !== _p$.e && className(_el$, _p$.e = _v$);
                _v$2 !== _p$.t && className(_el$2, _p$.t = _v$2);
                _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$2.style.setProperty("border-image-source", _v$3) : _el$2.style.removeProperty("border-image-source"));
                return _p$;
              }, {
                e: void 0,
                t: void 0,
                a: void 0
              });
              return _el$;
            }
          }), createComponent(Show, {
            get when() {
              return activePage() === 0;
            },
            get children() {
              return [(() => {
                var _el$11 = _tmpl$4();
                insert(_el$11, createComponent(PortraitIconVictory, {
                  get playerId() {
                    return model.endgameData.playerId;
                  },
                  size: 52,
                  isVictory: true,
                  isDomination,
                  get isDefeat() {
                    return model.endgameData.isDefeated;
                  }
                }));
                return _el$11;
              })(), createComponent(Button, {
                onActivate: () => {
                  nextPage();
                },
                hotkeyAction: "accept",
                navTrayText: "LOC_GENERIC_CONTINUE",
                "class": "absolute bottom-10 right-10",
                get children() {
                  return createComponent(L10n.Compose, {
                    text: "LOC_GENERIC_CONTINUE"
                  });
                }
              })];
            }
          }), createComponent(Show, {
            get when() {
              return activePage() === 1 && !model.endgameData.isDefeated;
            },
            get children() {
              return [(() => {
                var _el$12 = _tmpl$5(), _el$13 = _el$12.firstChild, _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling, _el$16 = _el$15.nextSibling, _el$17 = _el$13.nextSibling, _el$18 = _el$17.nextSibling, _el$19 = _el$18.firstChild, _el$20 = _el$19.nextSibling, _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling;
                _el$16.style.setProperty("background-image", "url('blp:base_top-filigree_center.png')");
                insert(_el$17, createComponent(L10n.Stylize, {
                  get text() {
                    return model.endgameData.leaderQuote;
                  },
                  role: "article"
                }));
                insert(_el$20, () => model.endgameData.leaderName, _el$22);
                return _el$12;
              })(), (() => {
                var _el$23 = _tmpl$6();
                insert(_el$23, createComponent(Button, {
                  onActivate: () => {
                    setActivePage(0);
                  },
                  "class": "mr-8",
                  hotkeyAction: "shell-action-1",
                  navTrayText: "LOC_END_GAME_REPLAY",
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_END_GAME_REPLAY"
                    });
                  }
                }), null);
                insert(_el$23, createComponent(Button, {
                  onActivate: () => {
                    nextPage();
                  },
                  hotkeyAction: "accept",
                  navTrayText: "LOC_GENERIC_CONTINUE",
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_GENERIC_CONTINUE"
                    });
                  }
                }), null);
                return _el$23;
              })()];
            }
          }), createComponent(Show, {
            get when() {
              return activePage() === 2;
            },
            get children() {
              var _el$24 = _tmpl$7();
              var _ref$ = fxsMovie;
              typeof _ref$ === "function" ? use(_ref$, _el$24) : fxsMovie = _el$24;
              return _el$24;
            }
          })];
        }
      });
    }
  });
};
const EndGameScreen = ComponentRegistry.register({
  name: "EndGameScreen",
  createInstance: EndGameScreenComponent,
  styles: [style]
});
defineLegacyComponent("endgame-screen", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(EndGameScreenComponent, {});
});

export { EndGameScreen, EndGameScreenComponent };
//# sourceMappingURL=endgame-screen.js.map
