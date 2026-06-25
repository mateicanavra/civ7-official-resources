import { template, setAttribute, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, For } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { CloseButton } from '../../components/close-button.js';
import { Filigree } from '../../components/filigree.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { usePopupContext } from '../../components/popup.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { SpatialSlot } from '../../components/slot.js';
import { Tab } from '../../components/tab.js';
import { useGameSetupModelContext } from './create-game-setup-model.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './map-select.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 img-unit-panelbox pointer-events-none"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0 overflow-hidden"><img alt=Background class=absolute></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="create-game-setup-bottom-gradient absolute left-0 bottom-0"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 w-full h-full border-2 border-secondary-3"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex-auto flex flex-col justify-center items-center overflow-hidden"><div class="flex-auto flex flex-col justify-start w-full items-center font-base text-center create-game-map-select-button-content"><div class="uppercase text-xl font-title font-black text-tertiary-1 flex flex-col justify-end font-fit-shrink max-w-84"></div><div class=map-select-divider-line></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="img-frame-f1 relative h-full flex flex-row min-w-200 pointer-events-auto create-game-map-select"><div class="img-frame-filigree absolute top-4 left-4 size-64"></div><div class="img-frame-filigree absolute top-4 right-4 size-64 -scale-x-100"></div><div class="flex flex-col items-center justify-center "><div class="flex flex-col items-center justify-center pt-7 mb-6"><div class="flex flex-row items-center justify-center -my-1\\.5"><div class="leader-select-text font-title text-tertiary-1 font-black mx-7 uppercase"></div></div></div></div></div>`);
function MapTypeButton(props) {
  return createComponent(Activatable, {
    get onActivate() {
      return props.onActivate;
    },
    get ["class"]() {
      return props.class ?? "create-game-map-select-box m-2 relative group";
    },
    get children() {
      return [createComponent(Show, {
        get when() {
          return !props.bgImage;
        },
        get children() {
          return _tmpl$();
        }
      }), createComponent(Show, {
        get when() {
          return props.bgImage;
        },
        get children() {
          return [(() => {
            var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
            createRenderEffect((_p$) => {
              var _v$ = props.bgImage, _v$2 = (props.bgImagePositionX || 0) + "px", _v$3 = (props.bgImagePositionY || 0) + "px", _v$4 = Layout.pixels(1347), _v$5 = Layout.pixels(280);
              _v$ !== _p$.e && setAttribute(_el$3, "src", _p$.e = _v$);
              _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$3.style.setProperty("left", _v$2) : _el$3.style.removeProperty("left"));
              _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$3.style.setProperty("top", _v$3) : _el$3.style.removeProperty("top"));
              _v$4 !== _p$.o && ((_p$.o = _v$4) != null ? _el$3.style.setProperty("width", _v$4) : _el$3.style.removeProperty("width"));
              _v$5 !== _p$.i && ((_p$.i = _v$5) != null ? _el$3.style.setProperty("height", _v$5) : _el$3.style.removeProperty("height"));
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0,
              i: void 0
            });
            return _el$2;
          })(), _tmpl$3(), _tmpl$4()];
        }
      }), (() => {
        var _el$6 = _tmpl$5(), _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
        insert(_el$6, createComponent(Icon, {
          get name() {
            return props.icon;
          },
          isUrl: true,
          "class": "create-game-map-select-icon mt-6"
        }), _el$7);
        insert(_el$8, createComponent(L10n.Compose, {
          get text() {
            return props.name;
          }
        }));
        insert(_el$7, createComponent(L10n.Stylize, {
          get text() {
            return props.description;
          },
          "class": "font-body text-accent-2 text-sm"
        }), null);
        createRenderEffect((_p$) => {
          var _v$6 = Layout.pixels(28), _v$7 = Layout.pixels(56);
          _v$6 !== _p$.e && ((_p$.e = _v$6) != null ? _el$8.style.setProperty("line-height", _v$6) : _el$8.style.removeProperty("line-height"));
          _v$7 !== _p$.t && ((_p$.t = _v$7) != null ? _el$8.style.setProperty("min-height", _v$7) : _el$8.style.removeProperty("min-height"));
          return _p$;
        }, {
          e: void 0,
          t: void 0
        });
        return _el$6;
      })(), _tmpl$6()];
    }
  });
}
const MapSelectComponent = () => {
  const gameSetupModel = useGameSetupModelContext();
  const popupContext = usePopupContext();
  function handleSelection(option) {
    gameSetupModel.Map.setValue(option.value);
    popupContext.close("map-select");
  }
  return (() => {
    var _el$11 = _tmpl$7(), _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling, _el$14 = _el$13.nextSibling, _el$15 = _el$14.firstChild, _el$16 = _el$15.firstChild, _el$17 = _el$16.firstChild;
    insert(_el$11, createComponent(Hotkeys, {
      hotkeys: [{
        hotkeyAction: "accept",
        navTrayText: "LOC_GENERIC_SELECT"
      }, {
        hotkeyAction: "cancel",
        navTrayText: "LOC_GENERIC_BACK"
      }]
    }), _el$12);
    insert(_el$11, createComponent(CloseButton, {
      onActivate: () => popupContext.close("map-select"),
      "class": "absolute top-4 right-4"
    }), _el$14);
    insert(_el$17, createComponent(L10n.Compose, {
      text: "LOC_UI_CREATE_GAME_GAME_SETUP_MAP_TYPE"
    }));
    insert(_el$15, createComponent(Filigree.Small, {}), null);
    insert(_el$14, createComponent(ScrollArea, {
      "class": "flex-auto create-game-map-select ",
      reserveSpace: true,
      get children() {
        return createComponent(SpatialSlot, {
          name: "map-options",
          "class": "flex flex-row flex-wrap items-center justify-center create-game-map-select",
          get children() {
            return createComponent(For, {
              get each() {
                return gameSetupModel.Map.options;
              },
              children: (option) => createComponent(Tab.Trigger, {
                name: "game-setup",
                get children() {
                  return createComponent(AudioContextProvider, {
                    segment: "MapSelectPopup",
                    get children() {
                      return createComponent(MapTypeButton, {
                        id: "map-type",
                        "class": "create-game-map-select-box img-unit-panelbox m-2 relative group",
                        get name() {
                          return option.name;
                        },
                        get icon() {
                          return option.icon;
                        },
                        onActivate: () => handleSelection(option),
                        get description() {
                          return option.description;
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
    return _el$11;
  })();
};
const MapSelect = ComponentRegistry.register({
  name: "map-select",
  createInstance: MapSelectComponent,
  styles: [style]
});

export { MapSelect, MapTypeButton };
//# sourceMappingURL=map-select.js.map
