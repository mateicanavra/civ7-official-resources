import { template, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { onMount, createComponent, For, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { CloseButton } from '../../../core/ui-next/components/close-button.js';
import { Filigree } from '../../../core/ui-next/components/filigree.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../core/ui-next/components/slot.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { TicketBox } from '../../../core/ui-next/screens/create-game/ticket-box.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { LayoutModel, useIsSmallScreen } from '../../../core/ui-next/utilities/layout-utilities.js';
import { createGovtChooserModel, GovtChooserModelContext } from './government-chooser-model.js';
import { TicketSection } from '../../ui-next/tooltips/plot-tooltip/components/utility.js';
import styles from './screen-government-chooser.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="bg-cover government-frame-bg bg-no-repeat relative max-h-full"><div class="size-64 absolute top-4 left-4 bg-contain bg-no-repeat"></div><div class="size-64 absolute top-4 right-4 bg-contain bg-no-repeat rotate-90"></div><div class="inset-0 absolute government-screen-bg bg-cover bg-no-repeat"></div><div class="relative flex items-center flex-col flex-auto"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute top-0 right-1\\.5 left-0 bottom-2\\.5 gov-chooser-hover"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute -top-1\\.5 -right-0 -left-1 bottom-1 gov-chooser-selected"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute top-0\\.5 right-2\\.5 left-1 bottom-3\\.5 gov-chooser-hover"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="bg-primary-4 border-primary-4 mr-1"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col justify-start mb-6"><div class="government-fade-divider w-full h-1"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-auto flex-col"><div class=relative><div class="absolute bg-glow top-0 right-0 left-0 bottom-2"></div></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col"><div class="flex flex-row p-1 items-center"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex flex-col pb-1"><div class="flex flex-row p-1 items-center"><div class="flex flex-col ml-1 flex-auto text-left"></div></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div></div>`);
const GovernmentChooserComponent = (props) => {
  const model = createGovtChooserModel();
  const audio = useAudio("GovernmentScreen");
  const layout = LayoutModel.get();
  const isSmallScreen = useIsSmallScreen() || layout.screenWidth() / layout.screenHeight() < 1.34;
  function handleOnCancelInput() {
    model.onCloseClicked();
    audio("popup-close");
  }
  onMount(() => {
    audio("popup-open");
  });
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      return createComponent(GovtChooserModelContext.Provider, {
        value: model,
        get children() {
          return createComponent(AudioContextProvider, {
            segment: "GovernmentScreen",
            get children() {
              return createComponent(Panel, {
                ref(r$) {
                  var _ref$ = props.ref;
                  typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
                },
                name: "Government Chooser",
                id: "screen-government-chooser",
                onCancelInput: () => handleOnCancelInput(),
                get children() {
                  var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling;
                  _el$2.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                  _el$2.style.setProperty("opacity", "0.1");
                  _el$3.style.setProperty("background-image", "url(blp:base_frame-filigree)");
                  _el$3.style.setProperty("opacity", "0.1");
                  insert(_el$5, createComponent(Filigree.TitleAccent, {
                    filigreeClass: "mt-5",
                    get children() {
                      return createComponent(L10n.Stylize, {
                        text: "LOC_UI_GOVERNMENT_PICKER_TITLE",
                        get ["class"]() {
                          return `gov-chooser-header items-center justify-center flex mt-4 font-bold fxs-header tracking-100 uppercase ${isSmallScreen() ? "py-1 font-title-lg" : "py-4 font-title-2xl"} text-shadow-subtle`;
                        }
                      });
                    }
                  }), null);
                  insert(_el$5, createComponent(ScrollArea, {
                    "class": "flex-auto p-4",
                    get children() {
                      return createComponent(SpatialSlot, {
                        name: "government-scrollable",
                        get ["class"]() {
                          return `flex w-full ${isSmallScreen() ? "flex-col" : "flex-row"} px-8 pt-2 flex-auto justify-center w-full items-center self-center`;
                        },
                        get children() {
                          return createComponent(For, {
                            get each() {
                              return model.choicesAvailable;
                            },
                            children: (item) => createComponent(GovernmentChooserItem, {
                              get itemName() {
                                return item.governmentName;
                              },
                              get celebrationOptions() {
                                return item.celebrationItems;
                              },
                              get onClick() {
                                return model.onCardClick(item.governmentType);
                              },
                              get isSelected() {
                                return model.currentlySelectedChoice == item.governmentType;
                              },
                              get passiveEffect() {
                                return item.governmentPassive;
                              },
                              get traditionsUnlocked() {
                                return item.traditionsUnlocked;
                              }
                            })
                          });
                        }
                      });
                    }
                  }), null);
                  insert(_el$5, createComponent(CloseButton, {
                    get ["class"]() {
                      return `${IsControllerActive() ? "hidden" : ""} absolute right-1 top-1`;
                    },
                    onActivate: () => {
                      handleOnCancelInput();
                    },
                    hotkeyAction: "cancel",
                    navTrayText: "LOC_GENERIC_BACK"
                  }), null);
                  insert(_el$5, createComponent(Button, {
                    "class": `flex w-72 m-6`,
                    get onActivate() {
                      return model.onConfirmClicked;
                    },
                    get disabled() {
                      return model.currentlySelectedChoice === null;
                    },
                    get classList() {
                      return {
                        hidden: IsControllerActive()
                      };
                    },
                    get disableFocus() {
                      return IsControllerActive();
                    },
                    hotkeyAction: "shell-action-1",
                    navTrayText: "LOC_GENERIC_CONFIRM",
                    get children() {
                      return createComponent(L10n.Compose, {
                        text: "LOC_GENERIC_CONFIRM"
                      });
                    }
                  }), null);
                  return _el$;
                }
              });
            }
          });
        }
      });
    }
  });
};
const GovernmentChooserItem = (props) => {
  const layout = LayoutModel.get();
  const isSmallScreen = useIsSmallScreen() || layout.screenWidth() / layout.screenHeight() < 1.34;
  return createComponent(Activatable, {
    get ["class"]() {
      return `flex gov-chooser-item relative ${isSmallScreen() ? "flex-auto w-full" : "flex-1 h-full mx-2"}`;
    },
    onActivate: () => props.onClick,
    audio: {
      onActivate: "data-audio-government-clicked",
      onFocus: "data-audio-primary-button-focus"
    },
    get children() {
      return createComponent(TicketBox, {
        "class": "relative flex flex-auto flex-col px-8 pb-8 pt-3 mb-4",
        get children() {
          return [_tmpl$2(), createComponent(Show, {
            get when() {
              return props.isSelected;
            },
            get children() {
              return [_tmpl$3(), _tmpl$4()];
            }
          }), (() => {
            var _el$9 = _tmpl$6(), _el$10 = _el$9.firstChild;
            insert(_el$9, createComponent(L10n.Stylize, {
              "class": "font-title-xl py-2 tracking-100 uppercase text-accent-1 flex font-fit-shrink",
              get text() {
                return props.itemName;
              }
            }), _el$10);
            insert(_el$9, createComponent(GovtCardSubHeader, {
              text: "LOC_UI_GOVERNMENT_ABILITY",
              secondaryText: true,
              "class": "mt-4 mb-1"
            }), null);
            insert(_el$9, createComponent(Show, {
              get when() {
                return props.passiveEffect;
              },
              get children() {
                var _el$11 = _tmpl$5();
                insert(_el$11, createComponent(L10n.Stylize, {
                  "class": "font-body-base p-4 flex flex-auto text-accent-3",
                  get text() {
                    return props.passiveEffect ?? "";
                  }
                }));
                return _el$11;
              }
            }), null);
            return _el$9;
          })(), (() => {
            var _el$12 = _tmpl$7(), _el$13 = _el$12.firstChild, _el$14 = _el$13.firstChild;
            insert(_el$12, createComponent(GovtCardSubHeader, {
              secondaryText: true,
              text: "LOC_UI_CELEBRATION_OPTIONS"
            }), _el$13);
            insert(_el$12, createComponent(TicketSection, {
              get children() {
                return createComponent(For, {
                  get each() {
                    return props.celebrationOptions;
                  },
                  children: (item) => (() => {
                    var _el$15 = _tmpl$8(), _el$16 = _el$15.firstChild;
                    insert(_el$16, createComponent(Icon, {
                      "class": "size-8",
                      get name() {
                        return item.image;
                      },
                      isUrl: true
                    }), null);
                    insert(_el$16, createComponent(Divider, {
                      vertical: true
                    }), null);
                    insert(_el$16, createComponent(L10n.Stylize, {
                      "class": "flex flex-auto font-body-sm w-full",
                      get text() {
                        return item.description;
                      }
                    }), null);
                    insert(_el$15, createComponent(Show, {
                      get when() {
                        return item != props.celebrationOptions[props.celebrationOptions.length - 1];
                      },
                      get children() {
                        return createComponent(Divider, {});
                      }
                    }), null);
                    return _el$15;
                  })()
                });
              }
            }), _el$13);
            insert(_el$12, createComponent(GovtCardSubHeader, {
              secondaryText: true,
              "class": "mt-5 mb-1",
              text: "LOC_UI_TRADITIONS_TITLE"
            }), _el$13);
            insert(_el$13, createComponent(TicketBox, {
              "class": "relative -mr-1\\.5 -ml-0\\.5",
              get children() {
                return createComponent(For, {
                  get each() {
                    return props.traditionsUnlocked;
                  },
                  children: (item) => (() => {
                    var _el$17 = _tmpl$9(), _el$18 = _el$17.firstChild, _el$19 = _el$18.firstChild;
                    insert(_el$18, createComponent(Icon, {
                      "class": "size-8",
                      name: `url(blp:unlock_tradition)`,
                      isUrl: true
                    }), _el$19);
                    insert(_el$18, createComponent(Divider, {
                      vertical: true
                    }), _el$19);
                    insert(_el$19, createComponent(L10n.Stylize, {
                      "class": "text-secondary uppercase tracking-100 font-title-sm",
                      get text() {
                        return item.def.Name ?? "";
                      }
                    }), null);
                    insert(_el$19, createComponent(L10n.Stylize, {
                      "class": "font-body-sm flex flex-auto w-full text-accent-3",
                      get text() {
                        return item.unlock;
                      }
                    }), null);
                    insert(_el$19, createComponent(L10n.Stylize, {
                      "class": "font-body-sm flex flex-auto w-full",
                      get text() {
                        return item.def.Description ?? "";
                      }
                    }), null);
                    insert(_el$17, createComponent(Show, {
                      get when() {
                        return item != props.traditionsUnlocked[props.traditionsUnlocked.length - 1];
                      },
                      get children() {
                        return createComponent(Divider, {});
                      }
                    }), null);
                    return _el$17;
                  })()
                });
              }
            }), null);
            return _el$12;
          })()];
        }
      });
    }
  });
};
const GovtCardSubHeader = (props) => {
  return createComponent(L10n.Stylize, {
    get text() {
      return props.text;
    },
    get ["class"]() {
      return `uppercase relative ${props.secondaryText ? "text-secondary-1" : "text-accent-4"} font-title-sm tracking-100 ${props.class}`;
    }
  });
};
const Divider = (props) => {
  return (() => {
    var _el$20 = _tmpl$10();
    createRenderEffect(() => className(_el$20, `${props.vertical ? "h-full w-px mx-2" : "w-full h-px my-2"} flex bg-primary-3`));
    return _el$20;
  })();
};
defineLegacyComponent("screen-government-chooser", {
  classNames: ["fullscreen, screen-government-chooser, flex, justify-center, items-center"]
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(GovernmentChooserComponent, {});
});
const GovernmentChooser = ComponentRegistry.register({
  name: "GovernmentChooser",
  styles: [styles],
  createInstance: GovernmentChooserComponent
});

export { GovernmentChooser, GovernmentChooserItem };
//# sourceMappingURL=screen-government-chooser.js.map
