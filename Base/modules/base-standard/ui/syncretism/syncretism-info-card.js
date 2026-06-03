import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, For, mergeProps, onMount, Show, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { CloseButton } from '../../../core/ui-next/components/close-button.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { useImageCache } from '../../../core/ui-next/components/image-cache.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../core/ui-next/components/slot.js';
import { Tab } from '../../../core/ui-next/components/tab.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { SyncretismPreviewCard } from './syncretism-card.js';
import style from './screen-syncretism.scss.js';
import { SyncretismScreenModel, SyncretismScreenModelContext } from './syncretism-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="size-full flex flex-col flex-auto px-3 py-3"><div class="flex flex-row w-full mt-2 pb-4 pt-2 px-2"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="inset-1 absolute bg-cover bg-no-repeat syncretism-bg-gradient"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative flex flex-auto"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class=text-accent-2></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="uppercase mr-2 text-secondary font-title"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-auto mx-12 p-4 my-2 relative"><div class="bg-center bg-no-repeat absolute inset-0 bg-cover opacity-20"></div><div class="absolute top-1 left-1 rotate-180 size-4 bg-contain opacity-30"></div><div class="absolute top-1 right-1 -rotate-90 size-4 bg-contain opacity-30"></div><div class="absolute bottom-1 left-1 rotate-90 size-4 bg-contain opacity-30"></div><div class="absolute bottom-1 right-1 size-4 bg-center opacity-30"></div><div class="flex flex-row flex-auto"><div class="flex flex-col flex-auto relative items-start justify-center ml-3"></div></div></div>`);
const SyncretismInfoScreen = (props) => {
  const model = SyncretismScreenModel.get();
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
      insert(_el$, createComponent(FiligreeTitle.Accent, {
        get text() {
          return props.name;
        },
        textClass: "text-xl",
        "class": "mb-4 mt-4 p-2 pointer-events-none"
      }), _el$2);
      insert(_el$2, createComponent(AttentionBanner, {
        get syncreticChoiceMade() {
          return model.syncretismChoiceMade;
        }
      }));
      insert(_el$, createComponent(ScrollArea, {
        "class": "relative flex-auto",
        useProxy: true,
        get children() {
          return createComponent(SpatialSlot, {
            name: "syncretism-choices",
            get ["class"]() {
              return `flex flex-auto flex-wrap size-full ${model.isSmallScreen() ? "justify-center" : ""}`;
            },
            get children() {
              return createComponent(For, {
                get each() {
                  return model.data;
                },
                children: (item) => createComponent(SyncretismPreviewCard, mergeProps(item, {
                  get style() {
                    return model.isSmallScreen() ? {
                      width: "95%"
                    } : {
                      width: "31.5%",
                      "margin-left": "0.75%",
                      "margin-right": "0.75%"
                    };
                  },
                  get ["class"]() {
                    return `${model.isSmallScreen() ? "mb-10 mr-5" : "mb-5"} mt-3`;
                  }
                }))
              });
            }
          });
        }
      }), null);
      return _el$;
    }
  });
};
const SyncretismInfoComponent = (props) => {
  const model = SyncretismScreenModel.get();
  const audio = useAudio("SyncretismPreview");
  onMount(() => {
    audio("popup-open");
  });
  return createComponent(Panel, {
    ref(r$) {
      var _ref$ = props.ref;
      typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
    },
    name: "Syncretism Preview Screen",
    id: "syncretism-preview",
    "class": "syncretism-frame",
    onCancelInput: () => {
      model.clickCloseInfoButton();
      audio("popup-back");
    },
    get children() {
      return createComponent(SyncretismScreenModelContext.Provider, {
        value: model,
        get children() {
          return [_tmpl$2(), (() => {
            var _el$4 = _tmpl$3();
            insert(_el$4, createComponent(Tab, {
              "class": "w-full relative flex flex-col flex-auto pointer-events-auto",
              get children() {
                return [createComponent(CloseButton, {
                  get ["class"]() {
                    return `${IsControllerActive() ? "hidden" : ""} absolute right-1\\.5 top-2`;
                  },
                  onActivate: () => {
                    model.clickCloseInfoButton();
                    audio("popup-close");
                  }
                }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                  name: "syncretism-preview",
                  title: () => "Syncretism Preview",
                  body: () => createComponent(SyncretismInfoScreen, {
                    ref(r$) {
                      var _ref$2 = props.ref;
                      typeof _ref$2 === "function" ? _ref$2(r$) : props.ref = r$;
                    },
                    name: "LOC_UI_SYNCRETISM_PREVIEW_TITLE",
                    id: "syncretism-info-card"
                  })
                })];
              }
            }));
            return _el$4;
          })()];
        }
      });
    }
  });
};
const AttentionBannerSymbol = Symbol();
const AttentionBanner = (props) => {
  const images = {
    positiveBannerBaseCSS: "url(blp:positive_banner_base)",
    warningBannerBaseCSS: "url(blp:warning_banner_base)",
    warningBannerImageCSS: "url(blp:warning_banner_image)",
    playerDetailCSS: "url(blp:mp_player_detail)",
    iconWarningCSS: "url(blp:buildicon_warning)",
    iconPositiveCSS: "url(blp:icon_policy_assigned)"
  };
  const cache = useImageCache();
  cache.registerImages(AttentionBannerSymbol, Object.values(images));
  return (() => {
    var _el$5 = _tmpl$6(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling, _el$11 = _el$10.nextSibling, _el$12 = _el$11.firstChild;
    _el$5.style.setProperty("border-image-slice", "22 180 fill");
    _el$5.style.setProperty("border-image-width", "22px 180px");
    insert(_el$11, createComponent(Icon, {
      "class": "size-12",
      get name() {
        return `${props.syncreticChoiceMade ? images.iconPositiveCSS : images.iconWarningCSS}`;
      },
      isUrl: true
    }), _el$12);
    insert(_el$12, createComponent(Show, {
      get when() {
        return !props.syncreticChoiceMade;
      },
      get fallback() {
        return createComponent(L10n.Stylize, {
          text: "LOC_UI_SYNCRETISM_POSTVIEW"
        });
      },
      get children() {
        return [(() => {
          var _el$13 = _tmpl$4();
          insert(_el$13, createComponent(L10n.Stylize, {
            text: "LOC_UI_SYNCRETISM_PREVIEW"
          }));
          return _el$13;
        })(), (() => {
          var _el$14 = _tmpl$5();
          insert(_el$14, createComponent(L10n.Stylize, {
            text: "LOC_UI_SYNCRETISM_PREVIEW_ONLY"
          }));
          return _el$14;
        })()];
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = `${props.syncreticChoiceMade ? images.positiveBannerBaseCSS : images.warningBannerBaseCSS}`, _v$2 = images.warningBannerImageCSS, _v$3 = images.playerDetailCSS, _v$4 = images.playerDetailCSS, _v$5 = images.playerDetailCSS, _v$6 = images.playerDetailCSS;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$5.style.setProperty("border-image-source", _v$) : _el$5.style.removeProperty("border-image-source"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$6.style.setProperty("background-image", _v$2) : _el$6.style.removeProperty("background-image"));
      _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$7.style.setProperty("background-image", _v$3) : _el$7.style.removeProperty("background-image"));
      _v$4 !== _p$.o && ((_p$.o = _v$4) != null ? _el$8.style.setProperty("background-image", _v$4) : _el$8.style.removeProperty("background-image"));
      _v$5 !== _p$.i && ((_p$.i = _v$5) != null ? _el$9.style.setProperty("background-image", _v$5) : _el$9.style.removeProperty("background-image"));
      _v$6 !== _p$.n && ((_p$.n = _v$6) != null ? _el$10.style.setProperty("background-image", _v$6) : _el$10.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0
    });
    return _el$5;
  })();
};
defineLegacyComponent("syncretism-info-card", {
  classNames: ["syncretism-info-card"],
  tabIndex: -0
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(SyncretismInfoCard, {});
});
const SyncretismInfoCard = ComponentRegistry.register({
  name: "SyncretismInfo",
  styles: [style],
  createInstance: SyncretismInfoComponent
});

export { SyncretismInfoCard };
//# sourceMappingURL=syncretism-info-card.js.map
