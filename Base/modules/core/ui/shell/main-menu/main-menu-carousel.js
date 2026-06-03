import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { onMount, onCleanup, createComponent, Show, For, createRenderEffect, createMemo } from '../../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../context-manager/context-manager.js';
import { PromoCarouselModel } from './main-menu-carousel-model.js';
import { Activatable } from '../../../ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../ui-next/components/audio-context-provider.js';
import { Button } from '../../../ui-next/components/button.js';
import { CloseButton } from '../../../ui-next/components/close-button.js';
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

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute w-12 h-14 right-2 top-1\\/2 -translate-y-1\\/2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="carousel-image relative w-full bg-contain bg-center bg-no-repeat pointer-events-auto self-center"><div class="flex carousel-breadcrumb-bar justify-center absolute bottom-2"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="carousel-thumb-bg carousel-outer w-full bg-primary-4"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="carousel-small-container flex flex-col text-accent-2"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex carousel-top-filigree decoration w-full justify-center items-center absolute -top-9"><div class="img-top-filigree-left grow"></div><div class=img-top-filigree-center></div><div class="img-top-filigree-right grow"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex justify-center"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="filigree-divider-h3 w-80 self-center mb-2"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-auto"><div class="grow bg-no-repeat bg-contain bg-center"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center w-full mt-2"></div>`);
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
      var _el$ = _tmpl$4();
      insert(_el$, createComponent(AudioContextProvider, {
        segment: "PromoCarousel/Small",
        get children() {
          return createComponent(Activatable, {
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
                var _el$2 = _tmpl$2(), _el$4 = _el$2.firstChild;
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return hasContent();
                  },
                  get children() {
                    return [createComponent(Activatable, {
                      "class": "carousel-bumper absolute bg-no-repeat bg-cover w-12 h-14 left-2 top-1\\/2 -translate-y-1\\/2",
                      get classList() {
                        return {
                          "carousel-bumper-disabled": model.selectedCarouselIndex <= 0
                        };
                      },
                      onActivate: () => {
                        model.onPreviousItem();
                      },
                      disableFocus: true,
                      audioComponentAlias: "ArrowButton",
                      get children() {
                        return createComponent(NavHelp, {
                          actionName: "inline-nav-shell-previous"
                        });
                      }
                    }), (() => {
                      var _el$3 = _tmpl$();
                      insert(_el$3, createComponent(Activatable, {
                        "class": "carousel-bumper absolute bg-no-repeat bg-cover w-full h-full -scale-x-100",
                        get classList() {
                          return {
                            "carousel-bumper-disabled": model.selectedCarouselIndex >= model.carouselItems.length - 1
                          };
                        },
                        onActivate: () => {
                          model.onNextItem();
                        },
                        disableFocus: true,
                        audioComponentAlias: "ArrowButton",
                        get children() {
                          return createComponent(NavHelp, {
                            "class": "-scale-x-100",
                            actionName: "inline-nav-shell-next"
                          });
                        }
                      }));
                      return _el$3;
                    })()];
                  }
                }), _el$4);
                insert(_el$4, createComponent(For, {
                  get each() {
                    return model.carouselItems;
                  },
                  children: (item, index) => createComponent(RadioButton, {
                    "class": "ml-2",
                    get size() {
                      return RadioButtonSize.STANDARD;
                    },
                    highRes: true,
                    get isChecked() {
                      return model.selectedCarouselItem ? model.selectedCarouselItem.promoId == item.promoId : false;
                    },
                    onActivate: () => {
                      model.selectedCarouselIndex = index();
                      model.selectedCarouselItem = item;
                      model.onCarouselUpdate();
                    },
                    disableFocus: true
                  })
                }));
                createRenderEffect((_$p) => (_$p = `${model.carouselImage}`) != null ? _el$2.style.setProperty("background-image", _$p) : _el$2.style.removeProperty("background-image"));
                return _el$2;
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
          });
        }
      }), null);
      insert(_el$, createComponent(Show, {
        get when() {
          return hasContent();
        },
        get children() {
          var _el$5 = _tmpl$3();
          insert(_el$5, createComponent(L10n.Stylize, {
            get text() {
              return model.selectedCarouselItem ? model.selectedCarouselItem.carouselTitle : "";
            },
            "class": "carousel-thumb-title mt-2 font-title text-lg text-shadow self-center font-fit-shrink whitespace-nowrap"
          }));
          return _el$5;
        }
      }), null);
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
    "class": "carousel-outer w-full h-full text-accent-2 self-center carousel-expanded pb-4",
    get children() {
      return [createComponent(AudioContextProvider, {
        segment: "PromoCarousel/Expanded",
        get children() {
          return [_tmpl$5(), (() => {
            var _el$7 = _tmpl$6();
            insert(_el$7, createComponent(Activatable, {
              "class": "carousel-expanded-bumper carousel-bumper relative pointer-events-auto align-center bg-no-repeat bg-cover w-12 h-14 self-center",
              get classList() {
                return {
                  "carousel-bumper-disabled": model.selectedCarouselIndex <= 0
                };
              },
              onActivate: () => {
                const changed = model.onPreviousItem();
                audioTrigger(changed ? "tab-nav-previous" : "pressError");
              },
              disableFocus: true,
              hotkeyAction: "nav-shell-previous",
              audioComponentAlias: "ArrowButton",
              get children() {
                return createComponent(NavHelp, {
                  actionName: "inline-nav-shell-previous"
                });
              }
            }), null);
            insert(_el$7, createComponent(L10n.Stylize, {
              get text() {
                return model.selectedCarouselItem ? model.selectedCarouselItem.title : "";
              },
              "class": "carousel-text relative flex self-center text-center font-title text-accent-2"
            }), null);
            insert(_el$7, createComponent(Activatable, {
              "class": "carousel-expanded-bumper carousel-bumper -scale-x-100 relative pointer-events-auto align-center bg-no-repeat bg-cover w-12 h-14 self-center",
              get classList() {
                return {
                  "carousel-bumper-disabled": model.selectedCarouselIndex >= model.carouselItems.length - 1
                };
              },
              onActivate: () => {
                const changed = model.onNextItem();
                audioTrigger(changed ? "tab-nav-next" : "pressError");
              },
              disableFocus: true,
              hotkeyAction: "nav-shell-next",
              audioComponentAlias: "ArrowButton",
              get children() {
                return createComponent(NavHelp, {
                  "class": "-scale-x-100",
                  actionName: "inline-nav-shell-next"
                });
              }
            }), null);
            return _el$7;
          })(), _tmpl$7(), (() => {
            var _el$9 = _tmpl$8(), _el$10 = _el$9.firstChild;
            insert(_el$9, createComponent(ScrollArea, {
              "class": "w-128 pl-2 pointer-events-auto",
              useProxy: true,
              get children() {
                return createComponent(L10n.Stylize, {
                  get text() {
                    return model.selectedCarouselItem ? model.selectedCarouselItem.content : "";
                  },
                  "class": "carousel-standard-text-content text-accent-2 font-normal text-lg"
                });
              }
            }), null);
            createRenderEffect((_$p) => (_$p = `url('${model.selectedCarouselItem?.modalImageUrl}')`) != null ? _el$10.style.setProperty("background-image", _$p) : _el$10.style.removeProperty("background-image"));
            return _el$9;
          })()];
        }
      }), createComponent(Show, {
        get when() {
          return !IsControllerActive();
        },
        get children() {
          var _el$11 = _tmpl$9();
          insert(_el$11, createComponent(NavHelp, {
            "class": "carousel-content-help flex absolute w-0\\.5 -top-4 right-4",
            "action-key": "inline-shell-action-1"
          }), null);
          insert(_el$11, createComponent(Button, {
            "class": "carousel-back-button",
            onActivate: () => {
              ContextManager.pop(ContextManager.getCurrentTarget());
            },
            get children() {
              return createComponent(L10n.Compose, {
                text: "LOC_GENERIC_BACK"
              });
            }
          }), null);
          insert(_el$11, createComponent(Show, {
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
          return _el$11;
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
