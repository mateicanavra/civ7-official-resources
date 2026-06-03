import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, createRenderEffect, createSignal, onMount, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Flipbook } from '../../../../core/ui-next/components/flipbook.js';
import { Header } from '../../../../core/ui-next/components/header.js';
import { HeroButton2 } from '../../../../core/ui-next/components/hero-button.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { NavHelp } from '../../../../core/ui-next/components/nav-help.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { NestedTooltipContext } from '../../../../core/ui-next/components/tooltip-compat.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { getCivLoadingInfo } from '../load-screen/load-screen-model.js';
import { useLoadScreenContext } from '../load-screen/load-screen.js';
import style from './age-transition-load-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="age-transition-stage-bg img-unit-panelbox relative flex-auto"><div class="absolute inset-1 bg-center bg-cover bg-no-repeat"></div><div class="absolute inset-1 bg-center bg-cover bg-no-repeat"></div><div class="absolute inset-1 bg-center bg-cover bg-no-repeat"></div><div class="absolute -top-5 left-0 right-0 flex items-center justify-center"><div class="filigree-divider-h2 -scale-y-100"></div></div><div class="absolute -bottom-5 left-0 right-0 flex items-center justify-center"><div class=filigree-divider-h2></div></div><div class="absolute inset-1 flex flex-row relative justify-start"><div class=" w-1\\/4 flex flex-col items-center justify-center"></div><div class="w-1\\/2 flex flex-col items-center justify-center"></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="age-transition-load-screen-bg absolute inset-0"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col items-start justify-center m-4 gap-4"></div>`);
const AgeTransitionStageComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling, _el$7 = _el$6.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
    _el$3.style.setProperty("background", "rgba(7, 7, 7, 0.30)");
    _el$4.style.setProperty("background-image", "url('blp:create_game_gradient1')");
    insert(_el$8, createComponent(Icon, {
      "class": "size-62",
      get name() {
        return `url('${props.icon ?? ""}')`;
      },
      isUrl: true
    }));
    insert(_el$9, () => props.children);
    createRenderEffect((_$p) => (_$p = `url('blp:${props.background}')`) != null ? _el$2.style.setProperty("background-image", _$p) : _el$2.style.removeProperty("background-image"));
    return _el$;
  })();
};
const AgeTransitionStage = ComponentRegistry.register({
  name: "AgeTransitionStage",
  createInstance: AgeTransitionStageComponent
});
const AgeTransitionLoadScreenComponent = (props) => {
  const model = useLoadScreenContext();
  const beginGameSounds = {};
  beginGameSounds.group = "main-menu-audio";
  beginGameSounds.onActivate = "data-audio-begin-game";
  function getAgeHeader(age) {
    return `LOC_LOADING_AGE_TRANSITION_${age.replace("AGE_", "")}_HEADER`;
  }
  function getAgeText(age) {
    return `LOC_LOADING_AGE_TRANSITION_${age.replace("AGE_", "")}`;
  }
  function getAgeBannerName(age) {
    return `LOC_LOADING_AGE_START_${age.replace("AGE_", "")}`;
  }
  function ageBg(ageType) {
    return `${ageType.toLowerCase().replace("age_", "shell_")}-select`;
  }
  const curAge = GameInfo.Ages.lookup(Configuration.getGame().startAgeType);
  const ageName = curAge?.AgeType ?? "";
  const ageHeader = getAgeHeader(ageName);
  const ageText = getAgeText(ageName);
  const ageBannerName = getAgeBannerName(ageName);
  const curAgeBg = ageBg(ageName);
  const curCivLoadInfo = getCivLoadingInfo();
  const curCivIcon = UI.getIconURL(curCivLoadInfo?.CivilizationType ?? "");
  const [activeTab, setActiveTab] = createSignal("age-start");
  const [hasStartButton, setHasStartButton] = createSignal(true);
  onMount(() => {
    setTimeout(() => {
      setActiveTab("age-quote");
    }, 5e3);
  });
  function startGame() {
    setHasStartButton(false);
    model.onBeginGame();
  }
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      return createComponent(Panel, {
        name: "age-transition-load-screen",
        "class": "fullscreen load-screen-fade-in flex flex-col justify-center",
        id: "age-transition-load-screen",
        style: {
          opacity: 0
        },
        ref(r$) {
          var _ref$ = props.ref;
          typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
        },
        get children() {
          return [_tmpl$2(), createComponent(Tab, {
            activeTab,
            get children() {
              return [createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                name: "age-quote",
                title: () => null,
                body: () => createComponent(AgeTransitionStageComponent, {
                  get background() {
                    return curCivLoadInfo?.BackgroundImageHigh ?? "antiquity_domination_victory";
                  },
                  icon: curCivIcon,
                  get children() {
                    var _el$12 = _tmpl$4();
                    insert(_el$12, createComponent(Header, {
                      "class": "uppercase text-xl",
                      get children() {
                        return createComponent(L10n.Compose, {
                          text: ageHeader
                        });
                      }
                    }), null);
                    insert(_el$12, createComponent(L10n.Stylize, {
                      "class": "text-lg",
                      text: ageText
                    }), null);
                    return _el$12;
                  }
                })
              }), createComponent(Tab.Item, {
                name: "age-start",
                title: () => null,
                body: () => createComponent(AgeTransitionStageComponent, {
                  background: curAgeBg,
                  icon: curCivIcon,
                  get children() {
                    return createComponent(Header, {
                      "class": "uppercase flex flex-col items-center justify-center",
                      get children() {
                        return [createComponent(L10n.Stylize, {
                          "class": "age-transition-banner-text-sm text-center",
                          text: "LOC_LOADING_AGE_START_PREFIX"
                        }), createComponent(L10n.Stylize, {
                          "class": "age-transition-banner-text-lg text-center",
                          text: ageBannerName
                        }), createComponent(L10n.Stylize, {
                          "class": "age-transition-banner-text-sm text-center",
                          text: "LOC_LOADING_AGE_START_SUFFIX"
                        })];
                      }
                    });
                  }
                })
              })];
            }
          }), (() => {
            var _el$11 = _tmpl$3();
            insert(_el$11, createComponent(HeroButton2, {
              "class": "mx-3 px-8 mt-10",
              get style() {
                return {
                  visibility: hasStartButton() ? void 0 : "hidden"
                };
              },
              get disabled() {
                return !model.canBeginGame;
              },
              onActivate: () => startGame(),
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
                  text: "LOC_GENERIC_CONTINUE"
                })];
              }
            }));
            return _el$11;
          })(), createComponent(Show, {
            get when() {
              return !model.canBeginGame;
            },
            get children() {
              return createComponent(Flipbook.Hourglass, {
                "class": "absolute top-10 right-10 size-32"
              });
            }
          })];
        }
      });
    }
  });
};
const AgeTransitionLoadScreen = ComponentRegistry.register({
  name: "AgeTransitionLoadScreen",
  createInstance: AgeTransitionLoadScreenComponent,
  styles: [style]
});

export { AgeTransitionLoadScreen, AgeTransitionStage };
//# sourceMappingURL=age-transition-load-screen.js.map
