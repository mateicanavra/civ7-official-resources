import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { mergeProps, createMemo, createComponent, createRenderEffect, Show, createSignal, untrack } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ActiveDeviceTypeChangedEventName } from '../../../../core/ui/input/input-events.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { HSlot, VSlot } from '../../../../core/ui-next/components/slot.js';
import { useTabContext } from '../../../../core/ui-next/components/tab.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { ViewExperience } from '../../../../core/ui-next/services/view-experience.js';
import { useIsSmallScreen, useWindowSize, useAspectRatio } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useAdvisorScreenContext } from './advisor-screen-model.js';
import advisorStyles from './advisor-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative flex self-center pb-2"><div class="council-advisor-portrait absolute inset-0 bg-cover bg-no-repeat"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="w-full h-13"><div class="relative w-13 h-13 self-center -top-2"><div class="absolute flex flex-col items-center justify-center self-center -bottom-3 -right-8"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top absolute -top-4 -left-0 bg-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top absolute -top-4 -right-0 -scale-x-100 h-7 bg-center"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="-top-13 absolute flex flex-col items-center justify-center self-center"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="advisor-quote-container relative"data-name=Ornate-Card></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top-compact absolute -left-0 bg-center w-full h-4"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="quest-advisor-card-filigree absolute w-full h-20 -top-10"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="advisor-card-focusable absolute"><div class="w-full h-full"></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div role=menuitem></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="w-full items-center justify-center self-center"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-center pointer-events-none"></div>`);
const AdvisorPortraitComponent = (props) => {
  const mergedProps = mergeProps({
    shrink: false
  }, props);
  const model = useAdvisorScreenContext();
  const isSmallScreen = useIsSmallScreen();
  return createMemo(() => createMemo(() => !!(!isSmallScreen() || !mergedProps.shrink))() ? (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$, createComponent(Icon, {
      "class": "council-advisor-bg bg-cover bg-no-repeat",
      name: `url("blp:adv_port_bk_highres")`
    }), _el$2);
    insert(_el$, createComponent(Icon, {
      "class": "council-advisor-type-icon-bg absolute inset-0 bg-cover bg-no-repeat",
      name: `url("blp:adv_icon_bk_highres")`
    }), null);
    insert(_el$, createComponent(Icon, {
      "class": "council-advisor-type-icon absolute inset-0 bg-cover bg-no-repeat",
      get name() {
        return `url("blp:adv_badge_${mergedProps.title.toLowerCase()}_highres")`;
      }
    }), null);
    createRenderEffect((_$p) => (_$p = `url(${model.advisorPortraitURL(mergedProps.type)})`) != null ? _el$2.style.setProperty("background-image", _$p) : _el$2.style.removeProperty("background-image"));
    return _el$;
  })() : (() => {
    var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
    insert(_el$4, createComponent(Icon, {
      "class": "council-advisor-type-icon-bg-compact absolute inset-0 bg-cover bg-no-repeat w-21 h-21",
      name: `url("blp:adv_icon_bk_highres")`
    }), _el$5);
    insert(_el$4, createComponent(Icon, {
      "class": "absolute bg-cover bg-no-repeat w-13 h-13",
      get name() {
        return `url("blp:adv_badge_${mergedProps.title.toLowerCase()}")`;
      }
    }), _el$5);
    _el$5.style.setProperty("border-radius", "50%");
    insert(_el$5, createComponent(Icon, {
      "class": "bg-no-repeat bg-contain bg-center w-11 h-11",
      get name() {
        return `url(${model.isFollowing(mergedProps.type) ? "blp:advScreen_icon_following_720" : "blp:advScreen_icon_notFollowing_720"})`;
      }
    }));
    return _el$3;
  })());
};
const AdvisorQuoteContainer = (props) => {
  const mergedProps = mergeProps({
    useScrollProxy: false
  }, props);
  const isMobile = ViewExperience() == UIViewExperience.Mobile;
  const isSmallScreen = useIsSmallScreen();
  return (() => {
    var _el$6 = _tmpl$6();
    insert(_el$6, createComponent(Show, {
      get when() {
        return !isSmallScreen();
      },
      get fallback() {
        return _tmpl$7();
      },
      get children() {
        return [(() => {
          var _el$7 = _tmpl$3();
          createRenderEffect((_$p) => (_$p = `url(blp:adv_decorleft_${mergedProps.isFollowed ? "following" : "notfollowing"})`) != null ? _el$7.style.setProperty("background-image", _$p) : _el$7.style.removeProperty("background-image"));
          return _el$7;
        })(), (() => {
          var _el$8 = _tmpl$4();
          createRenderEffect((_$p) => (_$p = `url(blp:adv_decorleft_${mergedProps.isFollowed ? "following" : "notfollowing"})`) != null ? _el$8.style.setProperty("background-image", _$p) : _el$8.style.removeProperty("background-image"));
          return _el$8;
        })(), (() => {
          var _el$9 = _tmpl$5();
          _el$9.style.setProperty("border-radius", "50%");
          insert(_el$9, createComponent(Icon, {
            "class": "advisor-quote-follow-icon bg-no-repeat bg-contain bg-center",
            get name() {
              return mergedProps.isFollowed ? "url(blp:advScreen_icon_notFollowing_highres)" : "url(blp:advScreen_icon_following_highres)";
            }
          }));
          return _el$9;
        })()];
      }
    }), null);
    insert(_el$6, createComponent(ScrollArea, {
      "class": `flex justify-center text-2xl flex-auto overflow-hidden ${isMobile ? "my-3" : "my-2"}`,
      role: "textbox",
      get useProxy() {
        return mergedProps.useScrollProxy;
      },
      get allowGamepadPan() {
        return mergedProps.useScrollProxy;
      },
      get reserveSpace() {
        return IsControllerActive();
      },
      get children() {
        return props.children;
      }
    }), null);
    return _el$6;
  })();
};
const AdvisorCardComponent = (props) => {
  const mergedProps = mergeProps({
    activatable: false
  }, props);
  const model = useAdvisorScreenContext();
  const isFollowing = () => model.isFollowing(mergedProps.type);
  const advisorQuote = createMemo(() => mergedProps.isInitialPopup ? model.advisorInitialQuote(props.title) : model.advisorsLastQuote(mergedProps.type));
  const isSelected = createMemo(() => model.getSelectedAdvisorCard() === mergedProps.type);
  const [isHovered, setIsHovered] = createSignal(false);
  const windowHeight = useWindowSize();
  const isSmallScreen = useIsSmallScreen();
  const aspectRatio = useAspectRatio();
  const isMobile = ViewExperience() == UIViewExperience.Mobile;
  let tabContext = void 0;
  const isInitialPopup = untrack(() => props.isInitialPopup);
  if (!isInitialPopup) {
    tabContext = useTabContext();
  }
  window.addEventListener(ActiveDeviceTypeChangedEventName, () => {
    setIsHovered(false);
  });
  return (() => {
    var _el$11 = _tmpl$10();
    insert(_el$11, createComponent(AudioContextProvider, {
      get vars() {
        return {
          advisorType: mergedProps.title.toLowerCase(),
          following: (!isFollowing()).toString()
        };
      },
      get children() {
        return createComponent(Activatable, {
          "class": `w-full h-full absolute`,
          onFocusIn: () => {
            setIsHovered(true);
            model.setSelectedAdvisorCard(mergedProps.type);
          },
          onFocusOut: () => {
            setIsHovered(false);
          },
          onMouseEnter: () => {
            setIsHovered(true);
          },
          onMouseLeave: () => {
            setIsHovered(false);
          },
          onActivate: () => {
            if (props.isInitialPopup) {
              if (IsControllerActive()) {
                model.clickClosePopup();
              } else {
                model.playFollowAudio(mergedProps.type);
                if (!isFollowing()) {
                  model.follow(mergedProps.type);
                } else {
                  model.unfollow(mergedProps.type);
                }
              }
            } else if (tabContext) {
              tabContext.activate(mergedProps.title);
              useAudio("AdvisorScreen")("navigate-tab");
            }
          },
          tabIndex: -1,
          get children() {
            return [_tmpl$8(), createComponent(Show, {
              get when() {
                return mergedProps.activatable;
              },
              get children() {
                var _el$13 = _tmpl$9(), _el$14 = _el$13.firstChild;
                insert(_el$14, () => `LOC_ADVISOR_${mergedProps.title}_NAME`);
                createRenderEffect(() => _el$13.classList.toggle("advisor-card-opaque", !!isHovered()));
                return _el$13;
              }
            }), (() => {
              var _el$15 = _tmpl$12();
              insert(_el$15, createComponent(HSlot, {
                "class": "justify-center",
                get children() {
                  return createComponent(Show, {
                    get when() {
                      return !props.isInitialPopup || IsControllerActive();
                    },
                    get fallback() {
                      return (() => {
                        var _el$20 = _tmpl$10();
                        insert(_el$20, createComponent(AdvisorPortrait, {
                          get title() {
                            return mergedProps.title;
                          },
                          get type() {
                            return mergedProps.type;
                          },
                          shrink: true
                        }));
                        createRenderEffect(() => className(_el$20, `${isSmallScreen() ? "-mt-4" : aspectRatio() <= 1.25 ? "mt-10" : "-mt-6"}`));
                        return _el$20;
                      })();
                    },
                    get children() {
                      var _el$16 = _tmpl$10();
                      insert(_el$16, createComponent(AdvisorPortrait, {
                        get title() {
                          return mergedProps.title;
                        },
                        get type() {
                          return mergedProps.type;
                        },
                        shrink: true
                      }));
                      createRenderEffect(() => className(_el$16, `${isSmallScreen() ? "-mt-4" : aspectRatio() <= 1.25 ? "mt-10" : "-mt-6"}`));
                      return _el$16;
                    }
                  });
                }
              }), null);
              insert(_el$15, createComponent(HSlot, {
                "class": "justify-center w-full",
                get children() {
                  var _el$17 = _tmpl$11();
                  insert(_el$17, createComponent(L10n.Stylize, {
                    get ["class"]() {
                      return `${isSmallScreen() ? isMobile ? "mt-4" : "mt-6" : "mt-5 mb-3"} self-center text-center font-fit-shrink`;
                    },
                    style: {
                      width: "95%"
                    },
                    get text() {
                      return `LOC_ADVISOR_${mergedProps.title}_NAME`;
                    }
                  }));
                  createRenderEffect(() => className(_el$17, `advisor-card-title font-title font-black tracking-100 uppercase w-full ${isSmallScreen() || aspectRatio() <= 1.335 && windowHeight() < 1080 ? "text-sm" : "base"}`));
                  return _el$17;
                }
              }), null);
              createRenderEffect(() => _el$15.classList.toggle("-mt-21", !isSmallScreen()));
              return _el$15;
            })(), (() => {
              var _el$18 = _tmpl$10();
              insert(_el$18, createComponent(AdvisorQuoteContainer, {
                get isFollowed() {
                  return !isFollowing();
                },
                get useScrollProxy() {
                  return isSelected();
                },
                get children() {
                  return createComponent(L10n.Stylize, {
                    get ["class"]() {
                      return `${isMobile && isSmallScreen() ? "my-1 mx-4" : "mt-6 mx-5"} text-accent-3 self-center ${isSmallScreen() ? "text-sm" : "text-base"}`;
                    },
                    get text() {
                      return advisorQuote();
                    }
                  });
                }
              }));
              createRenderEffect(() => className(_el$18, `${isMobile && isSmallScreen() ? "pt-1" : "pt-10"} pb-3 flex-1 ${isSmallScreen() ? "px-2" : "px-7"}`));
              return _el$18;
            })(), createComponent(Show, {
              get when() {
                return !IsControllerActive();
              },
              get children() {
                return createComponent(VSlot, {
                  get ["class"]() {
                    return `flow-row justify-center align-botto  pb-6 ${isSmallScreen() ? "px-3 pt-2\\.5" : "px-8 pt-1"}`;
                  },
                  get children() {
                    return createComponent(Button, {
                      get size() {
                        return isSmallScreen() ? "small" : "standard";
                      },
                      onActivate: () => {
                        if (!isFollowing()) model.follow(mergedProps.type);
                        else model.unfollow(mergedProps.type);
                      },
                      "class": "w-full h-10 text-xs align-bottom",
                      disableFocus: true,
                      get children() {
                        var _el$19 = _tmpl$13();
                        _el$19.style.setProperty("width", "88%");
                        insert(_el$19, createComponent(Icon, {
                          "class": "size-8 bg-no-repeat bg-contain bg-center mx-1 pointer-events-none",
                          get name() {
                            return isFollowing() ? "url(blp:advScreen_button_following_highres)" : "url(blp:advScreen_button_notFollowing_highres)";
                          }
                        }), null);
                        insert(_el$19, createComponent(Show, {
                          get when() {
                            return isFollowing();
                          },
                          get fallback() {
                            return createComponent(L10n.Stylize, {
                              text: "LOC_ADVISOR_COUNCIL_FOLLOW",
                              get ["class"]() {
                                return `font-fit-shrink pointer-events-none ${isSmallScreen() ? "text-2xs" : "text-base"}`;
                              }
                            });
                          },
                          get children() {
                            return createComponent(L10n.Stylize, {
                              text: "LOC_ADVISOR_COUNCIL_UNFOLLOW",
                              get ["class"]() {
                                return `font-fit-shrink pointer-events-none ${isSmallScreen() ? "text-2xs" : "text-base"}`;
                              }
                            });
                          }
                        }), null);
                        return _el$19;
                      }
                    });
                  }
                });
              }
            })];
          }
        });
      }
    }));
    createRenderEffect(() => className(_el$11, `advisor-card flex flex-col justify-end relative flex-1 ${isSmallScreen() || aspectRatio() <= 1.335 ? "mx-1" : "mx-4"}`));
    return _el$11;
  })();
};
const AdvisorPortrait = ComponentRegistry.register({
  name: "AdvisorPortrait",
  createInstance: AdvisorPortraitComponent,
  styles: [advisorStyles]
});
const AdvisorCard = ComponentRegistry.register({
  name: "AdvisorCard",
  createInstance: AdvisorCardComponent,
  styles: [advisorStyles]
});

export { AdvisorCard, AdvisorPortrait, AdvisorQuoteContainer };
//# sourceMappingURL=advisor-card.js.map
