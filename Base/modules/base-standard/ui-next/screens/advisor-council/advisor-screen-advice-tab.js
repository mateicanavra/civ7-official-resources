import { template, insert, use, className, delegateEvents } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, Show, createRenderEffect, createMemo, createEffect, on, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { Filigree } from '../../../../core/ui-next/components/filigree.js';
import { Icon } from '../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { FocusManager } from '../../../../core/ui-next/services/focus-manager.js';
import { isFocusable } from '../../../../core/ui-next/services/focus.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { useIsSmallScreen } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { AdvisorPortrait, AdvisorQuoteContainer } from './advisor-card.js';
import { useAdvisorScreenContext, AdvicePanelTypes } from './advisor-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full flex items-center justify-center pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="advice-section-focusable absolute"tabindex=-1></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div><div><div></div><div role=columnheader></div><div><div class=flex-1></div></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class="mb-5 ml-2 text-center"role=columnheader><div class="advisor-card-title font-title-lg font-black tracking-100 uppercase"></div></div><div role=textbox></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div class="advice-section-container relative text-accent-2"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div><div class="mb-6 text-center"><div class="font-title font-black tracking-100 uppercase text-center my-0 text-accent-2"role=columnheader></div><div class="w-full filigree-divider-inner-frame white-filigree-divider my-4"></div></div><div role=textbox></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div><div class="advice-section-container relative "></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class=mx-10></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class=size-full></div>`);
const PortraitTab = (props) => {
  const model = useAdvisorScreenContext();
  const isFollowing = () => model.isFollowing(props.type);
  const [isHovered, setIsHovered] = createSignal(false);
  const isSmallScreen = useIsSmallScreen();
  return (() => {
    var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.firstChild;
    insert(_el$3, createComponent(AdvisorPortrait, {
      get title() {
        return props.title;
      },
      get type() {
        return props.type;
      },
      shrink: true
    }));
    insert(_el$4, createComponent(L10n.Stylize, {
      "class": "font-fit-shrink",
      style: {
        width: "95%"
      },
      get text() {
        return `LOC_ADVISOR_${props.title}_NAME`;
      }
    }));
    insert(_el$6, createComponent(AdvisorQuoteContainer, {
      get isFollowed() {
        return !isFollowing();
      },
      get useScrollProxy() {
        return isHovered();
      },
      get children() {
        return createComponent(L10n.Stylize, {
          get ["class"]() {
            return `mt-6 mx-5 text-accent-3 self-center ${isSmallScreen() ? "text-sm" : "text-base"}`;
          },
          get text() {
            return props.quote;
          }
        });
      }
    }));
    insert(_el$5, createComponent(VSlot, {
      "class": "mt-4 mb-8 flow-row justify-center",
      get children() {
        return createComponent(AudioContextProvider, {
          segment: "AdvisorScreen",
          get vars() {
            return {
              advisorType: props.title.toLowerCase(),
              following: (!isFollowing()).toString()
            };
          },
          get children() {
            return createComponent(Button, {
              "class": "w-full",
              onActivate: () => {
                if (!isFollowing()) model.follow(props.type);
                else model.unfollow(props.type);
              },
              hotkeyAction: "shell-action-2",
              get navTrayText() {
                return isFollowing() ? "LOC_UI_ADVISORS_UNFOLLOW" : "LOC_UI_ADVISORS_FOLLOW";
              },
              disableFocus: true,
              get children() {
                var _el$7 = _tmpl$();
                _el$7.style.setProperty("width", "90%");
                insert(_el$7, createComponent(Icon, {
                  "class": "size-8 bg-no-repeat bg-contain bg-center mx-1 pointer-events-none",
                  get name() {
                    return isFollowing() ? "url(blp:advScreen_button_following_highres)" : "url(blp:advScreen_button_notFollowing_highres)";
                  }
                }), null);
                insert(_el$7, createComponent(Show, {
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
                return _el$7;
              }
            });
          }
        });
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return IsControllerActive();
      },
      get children() {
        var _el$8 = _tmpl$2();
        _el$8.$$focusout = () => {
          setIsHovered(false);
        };
        _el$8.$$focusin = () => {
          setIsHovered(true);
          model.setSelectedPanel(AdvicePanelTypes.None);
        };
        use(isFocusable, _el$8, () => [true, void 0]);
        return _el$8;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `advisor-portrait-tab relative ${isSmallScreen() ? "mx-1" : "mx-2"}`, _v$2 = `advice-section-container relative flex flex-col justify-around ${isSmallScreen() ? "px-4" : "px-0"}`, _v$3 = `${isSmallScreen() ? "mt-8" : "mt-6"}`, _v$4 = `font-title font-black tracking-100 uppercase self-center text-center ${isSmallScreen() ? "text-sm my-5" : "text-base mt-8 mb-13"}`, _v$5 = `flex flex-col mt-4 ${isSmallScreen() ? "h-80 px-0" : "h-84  px-7"}`;
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$2, _p$.t = _v$2);
      _v$3 !== _p$.a && className(_el$3, _p$.a = _v$3);
      _v$4 !== _p$.o && className(_el$4, _p$.o = _v$4);
      _v$5 !== _p$.i && className(_el$5, _p$.i = _v$5);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    });
    return _el$;
  })();
};
const MessageTab = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const model = useAdvisorScreenContext();
  const isSmallScreen = useIsSmallScreen();
  return (() => {
    var _el$9 = _tmpl$5(), _el$10 = _el$9.firstChild;
    var _ref$ = props.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$9) : props.ref = _el$9;
    insert(_el$10, createComponent(ScrollArea, {
      "class": "flex-auto h-full py-1",
      get useProxy() {
        return isHovered();
      },
      get allowGamepadPan() {
        return isHovered();
      },
      get children() {
        var _el$11 = _tmpl$4(), _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$12.nextSibling;
        insert(_el$13, createComponent(L10n.Stylize, {
          get text() {
            return props.messageTitle;
          }
        }));
        insert(_el$12, createComponent(Filigree.Small, {
          "class": "self-center"
        }), null);
        insert(_el$14, createComponent(Show, {
          get when() {
            return createMemo(() => !!IsControllerActive())() && model.getSelectedPanel() !== AdvicePanelTypes.Message;
          },
          get fallback() {
            return createComponent(L10n.Stylize, {
              "class": "text-accent-3 text-base",
              get text() {
                return props.messageDescription;
              }
            });
          },
          get children() {
            return createComponent(L10n.Stylize, {
              "class": "text-accent-3 text-base",
              get text() {
                return props.messageDescription;
              },
              args: ["disableTooltips"]
            });
          }
        }));
        createRenderEffect(() => className(_el$11, `advice-section-scroll-area ${isSmallScreen() ? "px-6" : "px-10"}`));
        return _el$11;
      }
    }));
    insert(_el$9, createComponent(Show, {
      get when() {
        return IsControllerActive();
      },
      get children() {
        return createComponent(Activatable, {
          get ["class"]() {
            return `advice-section-focusable ${model.getSelectedPanel() == AdvicePanelTypes.Message ? "inspect-highlight " : ""}grow shrink overflow-hidden self-center pointer-events-none absolute`;
          },
          onFocusIn: () => {
            setIsHovered(true);
            model.setSelectedPanel(AdvicePanelTypes.Quote);
          },
          onFocusOut: () => {
            setIsHovered(false);
          },
          onActivate: () => {
            model.setSelectedPanel(AdvicePanelTypes.Message);
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$9, `relative self-center over overflow-y-hidden ${!isSmallScreen() || !IsControllerActive() ? "advisor-message-tab" : "advisor-message-tab-compact"}  ${isSmallScreen() ? "mx-1" : "mx-2"}`));
    return _el$9;
  })();
};
const NoteTab = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const model = useAdvisorScreenContext();
  const isSmallScreen = useIsSmallScreen();
  return (() => {
    var _el$15 = _tmpl$7(), _el$16 = _el$15.firstChild;
    var _ref$2 = props.ref;
    typeof _ref$2 === "function" ? use(_ref$2, _el$15) : props.ref = _el$15;
    insert(_el$16, createComponent(ScrollArea, {
      "class": "flex-auto h-full py-1",
      get useProxy() {
        return isHovered();
      },
      get allowGamepadPan() {
        return isHovered();
      },
      get children() {
        var _el$17 = _tmpl$6(), _el$18 = _el$17.firstChild, _el$19 = _el$18.firstChild, _el$20 = _el$18.nextSibling;
        insert(_el$19, createComponent(L10n.Stylize, {
          get text() {
            return props.noteTitle;
          }
        }));
        insert(_el$20, createComponent(Show, {
          get when() {
            return createMemo(() => !!IsControllerActive())() && model.getSelectedPanel() !== AdvicePanelTypes.Note;
          },
          get fallback() {
            return createComponent(L10n.Stylize, {
              "class": "text-accent-3 text-base",
              get text() {
                return props.noteDescription;
              }
            });
          },
          get children() {
            return createComponent(L10n.Stylize, {
              "class": "text-accent-3 text-base",
              get text() {
                return props.noteDescription;
              },
              args: ["disableTooltips"]
            });
          }
        }));
        createRenderEffect(() => className(_el$17, `advice-section-scroll-area pt-1 ${isSmallScreen() ? "px-6" : "px-10"}`));
        return _el$17;
      }
    }));
    insert(_el$15, createComponent(Show, {
      get when() {
        return IsControllerActive();
      },
      get children() {
        return createComponent(Activatable, {
          get ["class"]() {
            return `advice-section-focusable ${model.getSelectedPanel() == AdvicePanelTypes.Note ? "inspect-highlight " : ""}pointer-events-none absolute`;
          },
          onFocusIn: () => {
            setIsHovered(true);
            model.setSelectedPanel(AdvicePanelTypes.None);
          },
          onFocusOut: () => {
            setIsHovered(false);
          },
          onActivate: () => {
            model.setSelectedPanel(AdvicePanelTypes.Note);
          },
          get disableFocus() {
            return model.getSelectedPanel() === AdvicePanelTypes.Message;
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$15, `relative overflow-y-hidden ${!isSmallScreen() || !IsControllerActive() ? "advisor-note-tab" : "advisor-note-tab-compact"} ${isSmallScreen() ? "mx-1" : "mx-2"}`));
    return _el$15;
  })();
};
const AdvisorTab = (props) => {
  const defaultAdviceTabId = createMemo(() => {
    return props.defaultTab && props.pages.find((page) => page.id === props.defaultTab) ? props.defaultTab : props.pages[props.pages.length - 1].id;
  });
  const isFollowing = () => model.isFollowing(props.type);
  const model = useAdvisorScreenContext();
  const isSmallScreen = useIsSmallScreen();
  let messageTabRef;
  let noteTabRef;
  createEffect(on([IsControllerActive, model.getSelectedPanel], () => {
    waitForLayout(() => {
      if (IsControllerActive()) {
        let firstTooltip = null;
        if (model.getSelectedPanel() === AdvicePanelTypes.Message) {
          firstTooltip = messageTabRef.querySelector(".tooltip-keyword");
        }
        if (model.getSelectedPanel() === AdvicePanelTypes.Note) {
          firstTooltip = noteTabRef.querySelector(".tooltip-keyword");
        }
        if (firstTooltip instanceof HTMLElement) {
          FocusManager.get().setFocus(firstTooltip);
        }
      }
    });
  }));
  return (() => {
    var _el$21 = _tmpl$9();
    insert(_el$21, createComponent(Tab, {
      "class": "w-full flex flex-col flex-auto pointer-events-auto relative",
      get defaultTab() {
        return defaultAdviceTabId();
      },
      get children() {
        return [createComponent(For, {
          get each() {
            return props.pages;
          },
          children: (page, index) => {
            return createComponent(Tab.Item, {
              get name() {
                return page.id;
              },
              title: () => createComponent(L10n.Compose, {
                get text() {
                  return `${props.title}-advice${index()}`;
                }
              }),
              body: () => createComponent(HSlot, {
                "class": "advisor-tabs-container flex justify-center w-full",
                get children() {
                  return createComponent(Show, {
                    get when() {
                      return model.getSelectedPanel();
                    },
                    get children() {
                      return [createMemo(() => createMemo(() => !!(!isSmallScreen() || !IsControllerActive()))() && createComponent(PortraitTab, {
                        get title() {
                          return props.title;
                        },
                        get quote() {
                          return page.quote;
                        },
                        get type() {
                          return props.type;
                        }
                      })), createComponent(MessageTab, {
                        get messageTitle() {
                          return page.title;
                        },
                        get messageDescription() {
                          return page.message;
                        },
                        ref(r$) {
                          var _ref$3 = messageTabRef;
                          typeof _ref$3 === "function" ? _ref$3(r$) : messageTabRef = r$;
                        }
                      }), createComponent(NoteTab, {
                        get noteTitle() {
                          return page.noteTitle;
                        },
                        get noteDescription() {
                          return page.noteDescription;
                        },
                        ref(r$) {
                          var _ref$4 = noteTabRef;
                          typeof _ref$4 === "function" ? _ref$4(r$) : noteTabRef = r$;
                        }
                      })];
                    }
                  });
                }
              })
            });
          }
        }), createComponent(Tab.Output, {}), createComponent(HSlot, {
          get ["class"]() {
            return `w-full h-1\\/8 flow-col ${isSmallScreen() ? "my-2" : "my-5"} ${IsControllerActive() && isSmallScreen() ? "justify-end" : "justify-center"}`;
          },
          get children() {
            var _el$22 = _tmpl$8();
            insert(_el$22, createComponent(Tab.TabListPips, {
              showPages: true,
              nextHotkey: "nav-shell-next",
              previousHotkey: "nav-shell-previous"
            }));
            return _el$22;
          }
        })];
      }
    }), null);
    insert(_el$21, createComponent(Show, {
      get when() {
        return createMemo(() => model.getSelectedPanel() !== AdvicePanelTypes.Message)() && model.getSelectedPanel() !== AdvicePanelTypes.Note;
      },
      get children() {
        return createComponent(Activatable, {
          hotkeyAction: "accept",
          navTrayText: "LOC_UI_ADVISORS_INSPECT",
          disableFocus: true
        });
      }
    }), null);
    insert(_el$21, createComponent(Show, {
      get when() {
        return model.getSelectedPanel() === AdvicePanelTypes.Message || model.getSelectedPanel() === AdvicePanelTypes.Note;
      },
      get children() {
        return createComponent(Activatable, {
          hotkeyAction: "cancel",
          onActivate: () => {
            if (model) model.setSelectedPanel(AdvicePanelTypes.None);
          },
          disableFocus: true
        });
      }
    }), null);
    insert(_el$21, createComponent(Show, {
      get when() {
        return createMemo(() => !!IsControllerActive())() && isSmallScreen();
      },
      get children() {
        return createComponent(Button, {
          "class": "w-full h-10",
          onActivate: () => {
            if (IsControllerActive()) {
              model.playFollowAudio(props.type);
            }
            if (!isFollowing()) model.follow(props.type);
            else model.unfollow(props.type);
          },
          hotkeyAction: "shell-action-2",
          get navTrayText() {
            return isFollowing() ? "LOC_UI_ADVISORS_UNFOLLOW" : "LOC_UI_ADVISORS_FOLLOW";
          },
          disableFocus: true
        });
      }
    }), null);
    return _el$21;
  })();
};
delegateEvents(["focusin", "focusout"]);

export { AdvisorTab };
//# sourceMappingURL=advisor-screen-advice-tab.js.map
