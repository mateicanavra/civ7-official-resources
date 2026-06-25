import { template, insert, setAttribute } from '../../../vendor/solid-js/web/dist/web.js';
import { onMount, onCleanup, createComponent, Show, createRenderEffect, For, createMemo } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../context-manager/context-manager.js';
import { PromoCarouselModel } from './main-menu-carousel-model.js';
import { Activatable } from '../../../ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../ui-next/components/audio-context-provider.js';
import { Button } from '../../../ui-next/components/button.js';
import { CloseButton } from '../../../ui-next/components/close-button.js';
import { FiligreeTitle } from '../../../ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../ui-next/components/l10n.js';
import { NavHelp } from '../../../ui-next/components/nav-help.js';
import { Panel } from '../../../ui-next/components/panel.js';
import { RadioButton, RadioButtonSize } from '../../../ui-next/components/radio-button.js';
import { ScrollArea } from '../../../ui-next/components/scroll-area.js';
import { useAudio } from '../../../ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../ui-next/services/input.js';
import style from './main-menu-carousel.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="carousel-image relative w-full bg-contain bg-center bg-no-repeat pointer-events-auto self-center"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=w-full></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="carousel-radio-divider w-full bg-primary-4 mb-1"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full bg-primary-4"><div class="flex justify-center"><div class="w-8 h-10 -mt-2 ml-4"></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="carousel-radio-divider w-full bg-primary-4 mt-1"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="carousel-small-outer-container carousel-outer bg-primary-4 p-4"><div class="carousel-small-container flex flex-col text-accent-2"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex carousel-top-filigree decoration w-full justify-center items-center absolute -top-9"><div class="img-top-filigree-left grow"></div><div class=img-top-filigree-center></div><div class="img-top-filigree-right grow"></div></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex justify-center mb-6 mt-8"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex min-h-full items-center"></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="flex flex-row w-full mt-2 mb-6"></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-auto carousel-expanded-inner"><div class=self-center><img class=carousel-image-expanded></div><div class="flex flex-col flex-auto pl-2"></div></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="carousel-radio-divider w-full bg-primary-4 mb-1 mt-4"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="w-full bg-primary-4"><div class="flex justify-center"><div class="w-8 h-10 -mt-1 mb-1 ml-4"></div></div></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="carousel-radio-divider w-full bg-primary-4 mt-1 mb-2"></div>`);
const PromoCarouselSmallComponent = (props) => {
  const model = PromoCarouselModel.get();
  onMount(() => {
    window.addEventListener("promo-carousel-small-promo-next", onPromoNextEvent);
    window.addEventListener("promo-carousel-small-promo-previous", onPromoPreviousEvent);
  });
  onCleanup(() => {
    window.removeEventListener("promo-carousel-small-promo-next", onPromoNextEvent);
    window.removeEventListener("promo-carousel-small-promo-previous", onPromoPreviousEvent);
  });
  const onPromoNextEvent = () => {
    const changed = model.onNextItem();
    if (IsControllerActive()) {
      useAudio("PromoCarousel/Small/ControllerHack")(changed ? "tab-nav-next" : "pressError");
    }
  };
  const onPromoPreviousEvent = () => {
    const changed = model.onPreviousItem();
    if (IsControllerActive()) {
      useAudio("PromoCarousel/Small/ControllerHack")(changed ? "tab-nav-previous" : "pressError");
    }
  };
  const shouldShow = () => {
    return props.attrs.visible === "true";
  };
  const hasContent = () => {
    return model.carouselItems.length > 0;
  };
  return createComponent(Show, {
    get when() {
      return shouldShow();
    },
    get children() {
      var _el$ = _tmpl$6(), _el$2 = _el$.firstChild;
      insert(_el$2, createComponent(AudioContextProvider, {
        segment: "PromoCarousel/Small",
        get children() {
          return [createComponent(Activatable, {
            "class": "w-full relative carousel-outer",
            onActivate: () => {
              if (model.carouselItems.length > 0) {
                ContextManager.push("promo-carousel-expanded", {
                  singleton: true,
                  createMouseGuard: true
                });
              }
            },
            disableFocus: true,
            audioComponentAlias: "Container",
            get children() {
              return [(() => {
                var _el$3 = _tmpl$();
                createRenderEffect((_$p) => (_$p = `${model.carouselImage}`) != null ? _el$3.style.setProperty("background-image", _$p) : _el$3.style.removeProperty("background-image"));
                return _el$3;
              })(), createComponent(Show, {
                get when() {
                  return hasContent();
                },
                get children() {
                  return createComponent(NavHelp, {
                    "class": "absolute w-0\\.5 -top-4 right-4",
                    actionName: "inline-shell-action-1"
                  });
                }
              })];
            }
          }), createComponent(Show, {
            get when() {
              return hasContent();
            },
            get children() {
              return [(() => {
                var _el$4 = _tmpl$2();
                insert(_el$4, createComponent(L10n.Stylize, {
                  get text() {
                    return model.selectedCarouselItem ? model.selectedCarouselItem.carouselTitle : "";
                  },
                  "class": "carousel-thumb-title mt-2 font-title text-lg text-shadow self-center font-fit-shrink"
                }));
                return _el$4;
              })(), _tmpl$3(), (() => {
                var _el$6 = _tmpl$4(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild;
                insert(_el$7, createComponent(Activatable, {
                  "class": "carousel-bumper bg-no-repeat bg-cover w-8 h-10 -mt-2",
                  onActivate: () => {
                    model.onPreviousItem();
                  },
                  hotkeyAction: "nav-shell-previous",
                  disableFocus: true,
                  audioComponentAlias: "ArrowButton",
                  get children() {
                    return createComponent(NavHelp, {
                      actionName: "inline-nav-shell-previous",
                      "class": "-ml-8 mt-2"
                    });
                  }
                }), _el$8);
                insert(_el$7, createComponent(For, {
                  get each() {
                    return model.carouselItems;
                  },
                  children: (item, index) => createComponent(RadioButton, {
                    "class": "ml-4",
                    get size() {
                      return RadioButtonSize.SMALL;
                    },
                    highRes: true,
                    get isChecked() {
                      return model.selectedCarouselItem ? model.selectedCarouselItem.promoId == item.promoId : false;
                    },
                    onActivate: () => {
                      model.onSetItem(index());
                      model.onCarouselUpdate();
                    },
                    disableFocus: true
                  })
                }), _el$8);
                insert(_el$8, createComponent(Activatable, {
                  "class": "carousel-bumper bg-no-repeat bg-cover w-full h-full -scale-x-100",
                  onActivate: () => {
                    model.onNextItem();
                  },
                  disableFocus: true,
                  hotkeyAction: "nav-shell-next",
                  audioComponentAlias: "ArrowButton",
                  get children() {
                    return createComponent(NavHelp, {
                      "class": "-scale-x-100 -ml-8 mt-2",
                      actionName: "inline-nav-shell-next"
                    });
                  }
                }));
                return _el$6;
              })(), _tmpl$5()];
            }
          })];
        }
      }));
      return _el$;
    }
  });
};
defineLegacyComponent("promo-carousel-small", {
  classNames: ["promo-carousel-small"],
  attrs: {
    visible: "true"
  }
}, (attrs, _element) => {
  return createComponent(PromoCarouselSmall, {
    attrs
  });
});
const PromoCarouselSmall = ComponentRegistry.register({
  name: "PromoCarouselSmall",
  styles: [style],
  createInstance: PromoCarouselSmallComponent,
  images: ["blp:base_component-arrow_highRes"]
});
const PromoCarouselExpandedComponent = () => {
  const model = PromoCarouselModel.get();
  const audioTrigger = useAudio("PromoCarousel/Expanded");
  const showInteractButton = () => {
    return model.selectedCarouselItem?.isInteractable && model.hasPromoInteractivity;
  };
  onMount(() => {
    model.isExpanded = true;
    audioTrigger("popup-open");
    if (model.selectedCarouselItem) {
      model.onTelemetryPromoAction(PromoAction.Interact, model.selectedCarouselItem?.promoId, "Main Menu Carousel", "Expanded Carousel");
    }
  });
  onCleanup(() => {
    model.isExpanded = false;
    audioTrigger("popup-close");
  });
  return createComponent(Panel, {
    name: "Expand Promo Carousel",
    id: "promo-carousel-expanded",
    "class": "img-unit-panelbox text-accent-2 self-center carousel-expanded pb-2",
    get children() {
      return [createComponent(AudioContextProvider, {
        segment: "PromoCarousel/Expanded",
        get children() {
          return [_tmpl$7(), (() => {
            var _el$11 = _tmpl$8();
            insert(_el$11, createComponent(FiligreeTitle.Accent, {
              get text() {
                return model.selectedCarouselItem ? model.selectedCarouselItem.title : "";
              },
              "class": "promo-carousel-text carousel-text carousel-text relative flex self-center text-center font-title text-accent-2"
            }));
            return _el$11;
          })(), (() => {
            var _el$12 = _tmpl$11(), _el$13 = _el$12.firstChild, _el$14 = _el$13.firstChild, _el$15 = _el$13.nextSibling;
            insert(_el$15, createComponent(ScrollArea, {
              "class": "flex-auto pointer-events-auto my-4",
              useProxy: true,
              get children() {
                var _el$16 = _tmpl$9();
                insert(_el$16, createComponent(L10n.Stylize, {
                  get text() {
                    return model.selectedCarouselItem ? model.selectedCarouselItem.content : "";
                  },
                  "class": "carousel-standard-text-content text-accent-2 font-normal"
                }));
                return _el$16;
              }
            }), null);
            insert(_el$15, createComponent(Show, {
              get when() {
                return !IsControllerActive();
              },
              get children() {
                var _el$17 = _tmpl$10();
                insert(_el$17, createComponent(NavHelp, {
                  "class": "carousel-content-help flex absolute w-0\\.5 -top-4 right-4",
                  "action-key": "inline-shell-action-1"
                }), null);
                insert(_el$17, createComponent(Button, {
                  "class": "carousel-back-button mr-8",
                  onActivate: () => {
                    ContextManager.pop(ContextManager.getCurrentTarget());
                  },
                  get children() {
                    return createComponent(L10n.Compose, {
                      text: "LOC_GENERIC_BACK"
                    });
                  }
                }), null);
                insert(_el$17, createComponent(Show, {
                  get when() {
                    return showInteractButton();
                  },
                  get children() {
                    return createComponent(Button, {
                      "class": "carousel-interact-button",
                      onActivate: () => {
                        model.onCarouselInteract();
                      },
                      navTrayText: "LOC_GENERIC_GO",
                      get children() {
                        return createComponent(L10n.Compose, {
                          text: "LOC_GENERIC_GO"
                        });
                      }
                    });
                  }
                }), null);
                return _el$17;
              }
            }), null);
            createRenderEffect(() => setAttribute(_el$14, "src", model.selectedCarouselItem ? model.selectedCarouselItem.modalImageUrl : ""));
            return _el$12;
          })(), _tmpl$12(), (() => {
            var _el$19 = _tmpl$13(), _el$20 = _el$19.firstChild, _el$21 = _el$20.firstChild;
            insert(_el$20, createComponent(Activatable, {
              "class": "carousel-bumper bg-no-repeat bg-cover w-8 h-10 -mt-1 mb-1",
              onActivate: () => {
                model.onPreviousItem();
              },
              disableFocus: true,
              hotkeyAction: "nav-shell-previous",
              audioComponentAlias: "ArrowButton",
              get children() {
                return createComponent(NavHelp, {
                  actionName: "inline-nav-shell-previous",
                  "class": "-ml-8 mt-2"
                });
              }
            }), _el$21);
            insert(_el$20, createComponent(For, {
              get each() {
                return model.carouselItems;
              },
              children: (item, index) => createComponent(RadioButton, {
                "class": "ml-4",
                get size() {
                  return RadioButtonSize.SMALL;
                },
                highRes: true,
                get isChecked() {
                  return model.selectedCarouselItem ? model.selectedCarouselItem.promoId == item.promoId : false;
                },
                onActivate: () => {
                  model.onSetItem(index());
                  model.onCarouselUpdate();
                },
                disableFocus: true
              })
            }), _el$21);
            insert(_el$21, createComponent(Activatable, {
              "class": "carousel-bumper bg-no-repeat bg-cover w-full h-full -scale-x-100",
              onActivate: () => {
                model.onNextItem();
              },
              disableFocus: true,
              hotkeyAction: "nav-shell-next",
              audioComponentAlias: "ArrowButton",
              get children() {
                return createComponent(NavHelp, {
                  "class": "-scale-x-100 -ml-8 mt-2",
                  actionName: "inline-nav-shell-next"
                });
              }
            }));
            return _el$19;
          })(), _tmpl$14()];
        }
      }), createComponent(CloseButton, {
        "class": "carousel-close-button absolute top-1 right-1",
        hotkeyAction: "cancel",
        navTrayText: "LOC_GENERIC_BACK",
        onActivate: () => {
          ContextManager.pop(ContextManager.getCurrentTarget());
        }
      }), createComponent(Show, {
        get when() {
          return createMemo(() => !!IsControllerActive())() && showInteractButton();
        },
        get children() {
          return createComponent(Activatable, {
            hotkeyAction: "accept",
            navTrayText: "LOC_GENERIC_GO",
            disableFocus: true,
            onActivate: () => {
              model.onCarouselInteract();
              audioTrigger("activate");
            }
          });
        }
      })];
    }
  });
};
defineLegacyComponent("promo-carousel-expanded", {
  classNames: ["promo-carousel-expanded", "absolute", "w-full", "h-full", "pointer-events-none"]
}, (_attrs, _element) => {
  return createComponent(PromoCarouselExpanded, {});
});
const PromoCarouselExpanded = ComponentRegistry.register({
  name: "PromoCarouselExpanded",
  styles: [style],
  createInstance: PromoCarouselExpandedComponent,
  images: ["blp:base_component-arrow_highRes"]
});

export { PromoCarouselExpanded, PromoCarouselSmall };
//# sourceMappingURL=main-menu-carousel.js.map
