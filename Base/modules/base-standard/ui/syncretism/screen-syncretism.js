import { template, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, useContext, onMount, onCleanup, createEffect, createComponent, For, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { CloseButton } from '../../../core/ui-next/components/close-button.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { SpatialSlot } from '../../../core/ui-next/components/slot.js';
import { Tab } from '../../../core/ui-next/components/tab.js';
import { NestedTooltipContext } from '../../../core/ui-next/components/tooltip-compat.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { HotkeyContext } from '../../../core/ui-next/services/hotkey.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { SyncCard } from './syncretism-card.js';
import { SyncretismConfirm } from './syncretism-confirm.js';
import style from './screen-syncretism.scss.js';
import { SyncretismScreenModel, SyncretismScreenModelContext } from './syncretism-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="size-full flex flex-col flex-auto px-3 py-5 relative"><div><div></div></div><div></div><div class="relative flex-auto"><div class="absolute w-full syncretism-body-bg-overlay -top-2 -bottom-2"></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="inset-1 absolute bg-cover bg-no-repeat syncretism-bg opacity-20"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="inset-1 absolute bg-cover bg-no-repeat syncretism-bg-gradient"></div>`);
const SyncretismStartScreen = (props) => {
  const model = SyncretismScreenModel.get();
  const [civName, setCivName] = createSignal("");
  const [civPeopleName, setCivPeopleName] = createSignal("");
  const hotkeyContext = useContext(HotkeyContext);
  const audio = useAudio();
  onMount(() => {
    hotkeyContext.registerNavtray("cancel", "LOC_GENERIC_BACK");
    hotkeyContext.registerNavtray("accept", "LOC_GENERIC_SELECT");
    if (!model.isFirstSeen) {
      model.isFirstSeen = true;
      audio("popup-open");
    }
  });
  onCleanup(() => {
    hotkeyContext.unregisterNavtray("cancel");
    hotkeyContext.unregisterNavtray("accept");
  });
  createEffect(() => {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      return;
    }
    const civDefinition = GameInfo.Civilizations.lookup(player.civilizationType);
    if (!civDefinition) {
      return;
    }
    setCivPeopleName(civDefinition.Adjective);
    setCivName(civDefinition.Name);
  });
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.firstChild;
    insert(_el$, createComponent(FiligreeTitle.Accent, {
      get text() {
        return props.name;
      },
      textClass: "text-2xl",
      "class": "p-2 mt-3 mb-2 pointer-events-none flex-auto max-h-24 font-bold text-shadow-subtle"
    }), _el$2);
    insert(_el$3, createComponent(L10n.Stylize, {
      text: "LOC_UI_SYNCRETISM_INSTRUCTIONS",
      get args() {
        return [civPeopleName(), civName()];
      }
    }));
    insert(_el$4, createComponent(L10n.Compose, {
      text: "LOC_UI_SYNCRETISM_CHOOSE_ONE"
    }));
    insert(_el$5, createComponent(ScrollArea, {
      "class": "relative",
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
              children: (item) => createComponent(AudioContextProvider, {
                segment: "SyncretismCard",
                get children() {
                  return createComponent(Tab.Trigger, {
                    name: "Syncretism-Confirm",
                    get children() {
                      return createComponent(SyncCard, {
                        get style() {
                          return model.isSmallScreen() ? {
                            width: "95%"
                          } : {
                            width: "31.5%",
                            "margin-left": "0.75%",
                            "margin-right": "0.75%"
                          };
                        },
                        get civ() {
                          return item.civ;
                        },
                        get civIcon() {
                          return item.civIcon;
                        },
                        get ["class"]() {
                          return `${model.isSmallScreen() ? "mb-10 mr-5" : "mb-5"} mt-3`;
                        },
                        get itemsAvailable() {
                          return item.itemsAvailable;
                        },
                        get civDef() {
                          return item.civDef;
                        },
                        get flagType() {
                          return item.flagType;
                        },
                        get traits() {
                          return item.traits;
                        },
                        get bgImage() {
                          return item.bgImage;
                        },
                        get isSyncretized() {
                          return item.isSyncretized;
                        },
                        get hasSyncreticChoiceBeenMade() {
                          return item.hasSyncreticChoiceBeenMade;
                        }
                      });
                    }
                  });
                }
              })
            });
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `w-full mt-2 mb-2 ${model.isSmallScreen() ? "px-4" : "px-20"}`, _v$2 = `img-ticket-solid-shadow-container ${model.isSmallScreen() ? "" : "mx-24"} px-6 pt-4 pb-6 text-accent-1 text-center`, _v$3 = `w-full title-font text-center flex items-center tracking-100 justify-center flex-auto font-bold uppercase text-secondary ${model.isSmallScreen() ? "pb-5 pt-1" : "max-h-20 pb-5 pt-4 text-lg"} `;
      _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$3, _p$.t = _v$2);
      _v$3 !== _p$.a && className(_el$4, _p$.a = _v$3);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};
const SyncretismScreenComponent = (props) => {
  const model = SyncretismScreenModel.get();
  const audio = useAudio("SyncretismScreen");
  function handleCancelInput() {
    if (model.activeTab() == "syncretism-confirm") {
      model.setActiveTab("syncretism-choice");
      audio("popup-back");
    } else {
      model.clickCloseButton();
      audio("popup-close");
    }
  }
  return createComponent(NestedTooltipContext.Provider, {
    value: {
      disabled: true
    },
    get children() {
      return createComponent(SyncretismScreenModelContext.Provider, {
        value: model,
        get children() {
          return createComponent(Panel, {
            ref(r$) {
              var _ref$ = props.ref;
              typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
            },
            name: "Syncretism Screen",
            id: "screen-syncretism",
            "class": "absolute syncretism-frame bg-cover bg-no-repeat relative top-8 bottom-2 right-4 left-4",
            onCancelInput: handleCancelInput,
            get children() {
              return createComponent(AudioContextProvider, {
                segment: "SyncretismScreen",
                get children() {
                  return [_tmpl$2(), _tmpl$3(), createComponent(Tab, {
                    get activeTab() {
                      return model.activeTab;
                    },
                    "class": "w-full relative flex flex-col flex-auto pointer-events-auto",
                    get children() {
                      return [createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                        name: "syncretism-choice",
                        title: () => "Syncretism",
                        body: () => createComponent(SyncretismStartScreen, {
                          ref(r$) {
                            var _ref$2 = props.ref;
                            typeof _ref$2 === "function" ? _ref$2(r$) : props.ref = r$;
                          },
                          name: "LOC_UI_SYNCRETISM_TITLE",
                          id: "syncretism-choice"
                        })
                      }), createComponent(Tab.Item, {
                        name: "Syncretism-Confirm",
                        title: () => "Syncretism-Confirm",
                        body: () => createComponent(SyncretismConfirm, {
                          name: "Syncretism-Confirm",
                          screenId: "screen-syncretism-confirm",
                          get selectedCiv() {
                            return model.selectedCiv;
                          },
                          get isSmallScreen() {
                            return model.isSmallScreen();
                          }
                        })
                      }), createComponent(CloseButton, {
                        get ["class"]() {
                          return `${IsControllerActive() ? "hidden" : ""} absolute right-1 top-1`;
                        },
                        onActivate: () => {
                          audio("popup-close");
                          model.clickCloseButton();
                        },
                        hotkeyAction: "cancel",
                        navTrayText: "LOC_GENERIC_BACK"
                      })];
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
defineLegacyComponent("screen-syncretism", {
  classNames: ["screen-syncretism", "fullscreen"],
  tabIndex: -0
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(SyncretismScreenComponent, {});
});
const SyncretismScreen = ComponentRegistry.register({
  name: "SyncretismScreen",
  styles: [style],
  createInstance: SyncretismScreenComponent
});

export { SyncretismScreen };
//# sourceMappingURL=screen-syncretism.js.map
