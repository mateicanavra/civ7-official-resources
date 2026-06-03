import { template, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, For, createRenderEffect, createSignal, createEffect } from '../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { HeroButton2 } from '../../../core/ui-next/components/hero-button.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../core/ui-next/components/scroll-area.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../core/ui-next/services/input.js';
import { SyncItemUpgrade, SyncItemRequires } from './syncretism-card.js';
import { SyncretismScreenModel, getOpFlagString, getCivNameString, getAge, getChoiceTypeShort } from './syncretism-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row mt-5 syncretism-confirm-subtitle-holder pl-4 mr-2 items-center mb-7"><div class="text-accent-1 text-lg flex items-end"></div><div class="p-1 flex flex-row items-end mr-2 font-body-xs uppercase text-accent-2"><div class=px-1\\.5></div><div class=px-1\\.5></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=flex></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="size-full flex flex-col grow relative"data-name=layout-bg><div class="absolute inset-1 bg-cover bg-no-repeat"></div><div class="size-full absolute opacity-30"data-name=layout-bg></div><div data-name=confirm-screen-info><div></div><div data-name=selected-sync-civ-items></div></div><div class="flex w-full flex-auto justify-center items-end mt-4 mb-6"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="syncretism-ticket-shadow absolute inset-0"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class=px-2><div class="w-full p-1 font-bold font-sm text-negative"></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div data-name=confirm-item><div class="relative flex flex-col flex-auto"><div class="flex flex-row flex-auto"><div class="flex flex-auto justify-center flex-col"><div class="font-title fxs-header uppercase tracking-100 text-lg pb-3"></div><div></div></div></div></div></div>`);
const SyncretismConfirmComponent = (props) => {
  const model = SyncretismScreenModel.get();
  return (() => {
    var _el$ = _tmpl$3(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, _el$12 = _el$4.nextSibling;
    _el$3.style.setProperty("background-image", "url('blp:create_game_gradient1')");
    _el$3.style.setProperty("background-size", "cover");
    insert(_el$5, createComponent(L10n.Stylize, {
      "class": "syncretism-confirm-title font-bold font-title text-shadow-subtle text-shadow text-accent-1",
      get args() {
        return [model.selectedCiv.civ, getOpFlagString(model.selectedCiv.flagType), getCivNameString(), getAge()];
      },
      text: "LOC_UI_SYNCRETISM_CONFIRM_DESCRIPTION"
    }));
    insert(_el$6, createComponent(ScrollArea, {
      get ["class"]() {
        return `${props.isSmallScreen ? "" : "justify-center"} size-full`;
      },
      get children() {
        return [createComponent(Show, {
          get when() {
            return !props.isSmallScreen;
          },
          get children() {
            var _el$7 = _tmpl$(), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling, _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling;
            insert(_el$7, createComponent(L10n.Stylize, {
              "class": "font-bold font-title text-2xl mr-3 uppercase tracking-150 fxs-header",
              get text() {
                return model.selectedCiv.civ;
              }
            }), _el$8);
            insert(_el$8, () => Locale.compose(getOpFlagString(model.selectedCiv.flagType)));
            _el$10.style.setProperty("border-right", "1px solid gray");
            insert(_el$10, () => model.selectedCiv.traits[0]);
            insert(_el$11, () => model.selectedCiv.traits[1]);
            return _el$7;
          }
        }), createComponent(For, {
          get each() {
            return model.selectedCiv.itemsAvailable;
          },
          children: (item) => createComponent(ConfirmSyncItem, {
            "class": "flex-col flex-auto flex m-1 px-1 p-3",
            get title() {
              return item.name;
            },
            get icon() {
              return item.icon;
            },
            get description() {
              return item.description;
            },
            get addInfo1() {
              return item.addInfo1;
            },
            get addInfo2() {
              return item.addInfo2;
            }
          })
        })];
      }
    }));
    insert(_el$12, createComponent(Button, {
      "class": "h-13 mr-8",
      name: "SyncreticChoiceCancel",
      get classList() {
        return {
          hidden: IsControllerActive()
        };
      },
      onActivate: () => {
        model.setActiveTab("syncretism-choice");
      },
      get disableFocus() {
        return IsControllerActive();
      },
      navTrayText: "LOC_GENERIC_BACK",
      hotkeyAction: "cancel",
      get children() {
        var _el$13 = _tmpl$2();
        insert(_el$13, createComponent(L10n.Compose, {
          text: "LOC_GENERIC_BACK"
        }));
        return _el$13;
      }
    }), null);
    insert(_el$12, createComponent(AudioContextProvider, {
      segment: "Confirm",
      get vars() {
        return {
          syncChoiceType: getChoiceTypeShort(model.selectedCiv.flagType)
        };
      },
      get children() {
        return createComponent(HeroButton2, {
          "class": "h-13",
          name: "SyncreticChoice",
          get classList() {
            return {
              hidden: IsControllerActive()
            };
          },
          get disableFocus() {
            return IsControllerActive();
          },
          hotkeyAction: "shell-action-1",
          navTrayText: "LOC_GENERIC_SELECT",
          onActivate: () => model.onFinalizeChoice(model.selectedCiv.civDef, model.selectedCiv.flagType),
          get children() {
            var _el$14 = _tmpl$2();
            insert(_el$14, createComponent(L10n.Compose, {
              text: "LOC_GENERIC_SELECT"
            }));
            return _el$14;
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `url('blp:${model.selectedCivBg}')`, _v$2 = `relative flex-auto pb-2 ${props.isSmallScreen ? "pt-4 px-12 w-full" : "w-3\\/4 pr-4 pt-12 pl-24"}`, _v$3 = `flex flex-row p-1 items-end ${props.isSmallScreen ? "mt-5 mb-10" : "mt-10"}`, _v$4 = `flex flex-col flex-auto ${props.isSmallScreen ? "" : "pr-12"} mx-2 mb-2 pt-1 justify-center`;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$2.style.setProperty("background-image", _v$) : _el$2.style.removeProperty("background-image"));
      _v$2 !== _p$.t && className(_el$4, _p$.t = _v$2);
      _v$3 !== _p$.a && className(_el$5, _p$.a = _v$3);
      _v$4 !== _p$.o && className(_el$6, _p$.o = _v$4);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
    return _el$;
  })();
};
const ConfirmSyncItem = (props) => {
  const [locked, setLocked] = createSignal(false);
  createEffect(() => {
    if (props.addInfo2) {
      if (props.addInfo2 != "") {
        setLocked(true);
      }
    }
  });
  return createComponent(Activatable, {
    "class": "flex flex-auto relative",
    get children() {
      return [_tmpl$4(), (() => {
        var _el$16 = _tmpl$6(), _el$17 = _el$16.firstChild, _el$18 = _el$17.firstChild, _el$19 = _el$18.firstChild, _el$20 = _el$19.firstChild, _el$21 = _el$20.nextSibling;
        insert(_el$18, createComponent(Icon, {
          get name() {
            return props.icon ?? "";
          },
          "class": "size-36 mr-3 self-center"
        }), _el$19);
        insert(_el$20, createComponent(L10n.Stylize, {
          get text() {
            return props.title;
          }
        }));
        insert(_el$21, createComponent(L10n.Stylize, {
          get text() {
            return props.description;
          }
        }));
        insert(_el$18, createComponent(Icon, {
          "class": "size-8",
          get name() {
            return `url('${props.pack ?? ""}')`;
          }
        }), null);
        insert(_el$17, createComponent(SyncItemUpgrade, props), null);
        insert(_el$17, createComponent(SyncItemRequires, props), null);
        insert(_el$17, createComponent(Show, {
          get when() {
            return locked();
          },
          get children() {
            var _el$22 = _tmpl$5(), _el$23 = _el$22.firstChild;
            insert(_el$23, () => Locale.stylize("LOC_UI_SYNCRETISM_REQUIRES_TOOLTIP"));
            return _el$22;
          }
        }), null);
        createRenderEffect(() => className(_el$16, props.class));
        return _el$16;
      })()];
    }
  });
};
const SyncretismConfirm = ComponentRegistry.register("SyncretismConfirm", SyncretismConfirmComponent);

export { SyncretismConfirm };
//# sourceMappingURL=syncretism-confirm.js.map
