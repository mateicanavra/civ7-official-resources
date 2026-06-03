import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { mergeProps, createMemo, createComponent, createRenderEffect, Show, createSignal } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { HSlot, VSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { useIsSmallScreen, useWindowSize, useAspectRatio } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useAdvisorScreenContext } from './advisor-screen-model.js';
import advisorStyles from './advisor-screen.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative flex self-center pb-2"><div class="council-advisor-portrait absolute inset-0 bg-cover bg-no-repeat"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="w-full h-13"><div class="relative w-13 h-13 self-center -top-2"><div class="absolute bg-cover bg-no-repeat w-13 h-13"></div><div class="absolute flex flex-col items-center justify-center self-center -bottom-3 -right-8"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top absolute -top-4 -left-0 bg-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top absolute -top-4 -right-0 -scale-x-100 h-7 bg-center"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="-top-13 absolute flex flex-col items-center justify-center self-center"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="advisor-quote-container relative"data-name=Ornate-Card></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="advisor-quote-frame-top-compact absolute -left-0 bg-center w-full h-4"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="w-full h-full"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div role=menuitem></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-center pointer-events-none"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div><div class="quest-advisor-card-filigree absolute w-full h-20 -top-10"></div><div class="w-full items-center justify-center self-center"></div><div></div></div>`);
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
    var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling;
    insert(_el$4, createComponent(Icon, {
      "class": "council-advisor-type-icon-bg-compact absolute inset-0 bg-cover bg-no-repeat w-21 h-21",
      name: `url("blp:adv_icon_bk_highres")`
    }), _el$5);
    _el$6.style.setProperty("border-radius", "50%");
    insert(_el$6, createComponent(Icon, {
      "class": "bg-no-repeat bg-contain bg-center w-11 h-11",
      get name() {
        return `url(${model.isFollowing(mergedProps.type) ? "blp:advScreen_icon_following_720" : "blp:advScreen_icon_notFollowing_720"})`;
      }
    }));
    createRenderEffect((_$p) => (_$p = UI.getIconCSS("ADVISOR_" + mergedProps.title, "BADGE")) != null ? _el$5.style.setProperty("background-image", _$p) : _el$5.style.removeProperty("background-image"));
    return _el$3;
  })());
};
const AdvisorQuoteContainer = (props) => {
  const mergedProps = mergeProps({
    useScrollProxy: false
  }, props);
  const isSmallScreen = useIsSmallScreen();
  return (() => {
    var _el$7 = _tmpl$6();
    insert(_el$7, createComponent(Show, {
      get when() {
        return !isSmallScreen();
      },
      get fallback() {
        return _tmpl$7();
      },
      get children() {
        return [(() => {
          var _el$8 = _tmpl$3();
          createRenderEffect((_$p) => (_$p = `url(blp:adv_decorleft_${mergedProps.isFollowed ? "following" : "notfollowing"})`) != null ? _el$8.style.setProperty("background-image", _$p) : _el$8.style.removeProperty("background-image"));
          return _el$8;
        })(), (() => {
          var _el$9 = _tmpl$4();
          createRenderEffect((_$p) => (_$p = `url(blp:adv_decorleft_${mergedProps.isFollowed ? "following" : "notfollowing"})`) != null ? _el$9.style.setProperty("background-image", _$p) : _el$9.style.removeProperty("background-image"));
          return _el$9;
        })(), (() => {
          var _el$10 = _tmpl$5();
          _el$10.style.setProperty("border-radius", "50%");
          insert(_el$10, createComponent(Icon, {
            "class": "advisor-quote-follow-icon bg-no-repeat bg-contain bg-center",
            get name() {
              return mergedProps.isFollowed ? "url(blp:advScreen_icon_notFollowing_highres)" : "url(blp:advScreen_icon_following_highres)";
            }
          }));
          return _el$10;
        })()];
      }
    }), null);
    insert(_el$7, createComponent(ScrollArea, {
      "class": `flex justify-center text-2xl flex-auto overflow-hidden my-2`,
      role: "textbox",
      get useProxy() {
        return mergedProps.useScrollProxy;
      },
      get allowGamepadPan() {
        return mergedProps.useScrollProxy;
      },
      get children() {
        return props.children;
      }
    }), null);
    return _el$7;
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
  return (() => {
    var _el$12 = _tmpl$12(), _el$13 = _el$12.firstChild, _el$15 = _el$13.nextSibling, _el$18 = _el$15.nextSibling;
    insert(_el$12, createComponent(Show, {
      get when() {
        return mergedProps.activatable;
      },
      get children() {
        return createComponent(Tab.Trigger, {
          get name() {
            return mergedProps.title;
          },
          get children() {
            return createComponent(AudioContextProvider, {
              segment: "AdvisorCard",
              get vars() {
                return {
                  isPopup: props.isInitialPopup.toString()
                };
              },
              get children() {
                return createComponent(Show, {
                  get when() {
                    return !props.isInitialPopup || IsControllerActive();
                  },
                  get children() {
                    return createComponent(Activatable, {
                      "class": `advisor-card-activatable absolute advisor-card-focusable`,
                      get classList() {
                        return {
                          "advisor-card-opaque": isHovered()
                        };
                      },
                      role: "button",
                      hotkeyAction: "accept",
                      onFocus: () => {
                        model.setSelectedAdvisorCard(mergedProps.type);
                      },
                      onMouseEnter: () => {
                        setIsHovered(true);
                      },
                      onMouseLeave: () => {
                        setIsHovered(false);
                      },
                      tabIndex: -1,
                      get disableTrigger() {
                        return props.isInitialPopup;
                      },
                      onActivate: () => {
                        if (!props.isInitialPopup) {
                          useAudio("AdvisorScreen")("navigate-tab");
                        } else if (IsControllerActive()) {
                          model.clickClosePopup();
                        }
                      },
                      get children() {
                        var _el$14 = _tmpl$8();
                        insert(_el$14, () => `LOC_ADVISOR_${mergedProps.title}_NAME`);
                        return _el$14;
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    }), _el$15);
    insert(_el$15, createComponent(HSlot, {
      "class": "justify-center",
      onMouseEnter: () => {
        setIsHovered(true);
      },
      onMouseLeave: () => {
        setIsHovered(false);
      },
      get children() {
        return createComponent(Tab.Trigger, {
          get name() {
            return mergedProps.title;
          },
          get children() {
            return createComponent(AudioContextProvider, {
              segment: "AdvisorPortrait",
              get vars() {
                return {
                  isPopup: props.isInitialPopup.toString()
                };
              },
              get children() {
                return createComponent(Show, {
                  get when() {
                    return !props.isInitialPopup || IsControllerActive();
                  },
                  get fallback() {
                    return (() => {
                      var _el$20 = _tmpl$9();
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
                    return createComponent(Activatable, {
                      get ["data-l10n-id"]() {
                        return `LOC_ADVISOR_${mergedProps.title}_NAME`;
                      },
                      role: "button",
                      "class": "advisor-portrait-activatable",
                      disableFocus: true,
                      get disableTrigger() {
                        return props.isInitialPopup;
                      },
                      onActivate: () => {
                        if (!props.isInitialPopup && !IsControllerActive()) {
                          useAudio("AdvisorScreen")("navigate-tab");
                        }
                      },
                      get children() {
                        var _el$16 = _tmpl$9();
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
                });
              }
            });
          }
        });
      }
    }), null);
    insert(_el$15, createComponent(HSlot, {
      "class": "justify-center w-full",
      get children() {
        var _el$17 = _tmpl$10();
        insert(_el$17, createComponent(L10n.Stylize, {
          get ["class"]() {
            return `${isSmallScreen() ? "mt-6" : "mt-5 mb-3"} self-center text-center font-fit-shrink`;
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
            return `mt-6 mx-5 text-accent-3 self-center ${isSmallScreen() ? "text-base" : "text-base"}`;
          },
          get text() {
            return advisorQuote();
          }
        });
      }
    }));
    insert(_el$12, createComponent(Show, {
      get when() {
        return !IsControllerActive();
      },
      get children() {
        return createComponent(VSlot, {
          get ["class"]() {
            return `flow-row justify-center align-botto  pb-6 ${isSmallScreen() ? "px-3 pt-2\\.5" : "px-8 pt-1"}`;
          },
          get children() {
            return createComponent(AudioContextProvider, {
              get vars() {
                return {
                  advisorType: mergedProps.title.toLowerCase(),
                  following: (!isFollowing()).toString()
                };
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
                    var _el$19 = _tmpl$11();
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
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `advisor-card flex flex-col justify-end relative flex-1 ${isSmallScreen() || aspectRatio() <= 1.335 ? "mx-1" : "mx-4"}`, _v$2 = !isSmallScreen(), _v$3 = `pt-10 pb-3 flex-1 ${isSmallScreen() ? "px-2" : "px-7"}`;
      _v$ !== _p$.e && className(_el$12, _p$.e = _v$);
      _v$2 !== _p$.t && _el$15.classList.toggle("-mt-21", _p$.t = _v$2);
      _v$3 !== _p$.a && className(_el$18, _p$.a = _v$3);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$12;
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
