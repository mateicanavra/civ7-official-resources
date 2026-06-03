import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, For, mergeProps } from '../../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../../ui/utilities/utilities-layout.js';
import { Activatable } from '../../components/activatable.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { Filigree } from '../../components/filigree.js';
import { Hotkeys } from '../../components/hotkeys.js';
import { Icon } from '../../components/icon.js';
import { L10n } from '../../components/l10n.js';
import { usePopupContext } from '../../components/popup.js';
import { useAgeSelectModelContext } from './age-select-model.js';
import { CreateGamePopupFrame } from './create-game-popup-frame.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import style from './age-select-popup.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute -left-2 top-4"><div class="flex flex-row items-start justify-start relative"><div class="img-icon-checkmark size-8 absolute mt-0\\.5 ml-0\\.5"></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-x-0\\.5 inset-y-1 bg-cover bg-right bg-no-repeat"><div class="age-select-popup-gradient absolute left-0 bottom-0"></div><div class="absolute inset-0 flex flex-row"><div class="flex items-center w-1\\/2 age-select-popup-content"><div class="flex items-center justify-center size-36 relative"></div><div class="flex flex-col items-center"><div class="font-title text-xl uppercase font-bold text-secondary"></div><div class="text-accent-2 text-base"></div></div></div></div><div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto m-4 items-center"><div class="text-2xl text-secondary mt-8 uppercase font-title"></div><div class="flex flex-col flex-auto w-full"></div></div>`);
const AgeSelectPopupTileComponent = (props) => {
  return createComponent(Activatable, {
    "class": "img-unit-panelbox relative m-2 group flex-2",
    get onActivate() {
      return props.onActivate;
    },
    get children() {
      var _el$ = _tmpl$2(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, _el$9 = _el$3.nextSibling;
      _el$5.style.setProperty("background-image", "url(blp:hud_sub_circle_dis_128x128)");
      _el$5.style.setProperty("background-repeat", "no-repeat");
      _el$5.style.setProperty("background-size", "cover");
      insert(_el$5, createComponent(Icon, {
        get name() {
          return props.icon;
        },
        "class": "size-22 -bottom-px relative"
      }));
      insert(_el$7, createComponent(L10n.Compose, {
        get text() {
          return props.name;
        }
      }));
      insert(_el$6, createComponent(Filigree.Small, {
        "class": "-mt-2"
      }), _el$8);
      insert(_el$8, createComponent(L10n.Compose, {
        get text() {
          return props.description;
        }
      }));
      insert(_el$, createComponent(Show, {
        get when() {
          return props.isSelected;
        },
        get children() {
          var _el$10 = _tmpl$(), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild;
          _el$11.style.setProperty("border-image-source", "url('blp:tag_equipped.png')");
          _el$11.style.setProperty("border-image-slice", "1 6 1 1 fill");
          _el$11.style.setProperty("border-image-repeat", "stretch");
          _el$12.style.setProperty("fxs-background-image-tint", "black");
          createRenderEffect((_p$) => {
            var _v$ = Layout.pixels(54), _v$2 = Layout.pixels(43);
            _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$11.style.setProperty("width", _v$) : _el$11.style.removeProperty("width"));
            _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$11.style.setProperty("height", _v$2) : _el$11.style.removeProperty("height"));
            return _p$;
          }, {
            e: void 0,
            t: void 0
          });
          return _el$10;
        }
      }), null);
      createRenderEffect((_p$) => {
        var _v$3 = `url('blp:${props.bgImage}')`, _v$4 = Layout.pixels(118), _v$5 = Layout.pixels(118);
        _v$3 !== _p$.e && ((_p$.e = _v$3) != null ? _el$.style.setProperty("background-image", _v$3) : _el$.style.removeProperty("background-image"));
        _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$5.style.setProperty("width", _v$4) : _el$5.style.removeProperty("width"));
        _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$5.style.setProperty("height", _v$5) : _el$5.style.removeProperty("height"));
        return _p$;
      }, {
        e: void 0,
        t: void 0,
        a: void 0
      });
      return _el$;
    }
  });
};
const AgeSelectPopupTile = ComponentRegistry.register({
  name: "AgeSelectPopupTile",
  createInstance: AgeSelectPopupTileComponent,
  styles: [style]
});
const AgeSelectPopupComponent = () => {
  const model = useAgeSelectModelContext();
  const popupContext = usePopupContext();
  function selectAge(age) {
    model.setSelectedAge(age);
    popupContext.close("age-select");
  }
  function ageNameShort(age) {
    const ageName = age.type.replace("AGE_", "").toLowerCase();
    return ageName;
  }
  return createComponent(CreateGamePopupFrame, {
    onClose: () => popupContext.close("age-select"),
    get children() {
      return [createComponent(Hotkeys, {
        hotkeys: [{
          hotkeyAction: "accept",
          navTrayText: "LOC_GENERIC_SELECT"
        }, {
          hotkeyAction: "cancel",
          navTrayText: "LOC_GENERIC_BACK"
        }]
      }), (() => {
        var _el$13 = _tmpl$3(), _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling;
        insert(_el$14, createComponent(L10n.Compose, {
          text: "LOC_UI_CREATE_GAME_CHOOSE_A_STARTING_AGE"
        }));
        insert(_el$13, createComponent(Filigree.Small, {
          "class": "mb-4"
        }), _el$15);
        insert(_el$15, createComponent(For, {
          get each() {
            return model.sortedAges;
          },
          children: (age) => createComponent(AudioContextProvider, {
            segment: "AgeSelectButton",
            get vars() {
              return {
                ageType: ageNameShort(age)
              };
            },
            get children() {
              return createComponent(AgeSelectPopupTile, mergeProps(age, {
                get isSelected() {
                  return age.type == model.selectedAge.type;
                },
                onActivate: () => selectAge(age)
              }));
            }
          })
        }));
        return _el$13;
      })()];
    }
  });
};
const AgeSelectPopup = ComponentRegistry.register("AgeSelectPopup", AgeSelectPopupComponent);

export { AgeSelectPopup, AgeSelectPopupTile };
//# sourceMappingURL=age-select-popup.js.map
