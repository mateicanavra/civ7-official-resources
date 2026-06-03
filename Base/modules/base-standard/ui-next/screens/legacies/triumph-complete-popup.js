import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, createComponent, Show } from '../../../../core/vendor/solid-js/dist/solid.js';
import { FiligreeTitle } from '../../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { OrnatePopupFrame } from '../../components/ornate-popup.js';
import { createLegaciesScreenModel } from './legacies-model.js';
import { TriumphCard } from './triumph-card.js';
import { TriumphCompleteQueueManager } from './triumph-tracking-manager.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute top-0 bottom-0 left-3 right-3 bg-black"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="font-body w-96 text-center mb-3 -mt-3 text-sm"> </div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col items-center"></div>`);
const TriumphCompletePopupComponent = () => {
  const model = createLegaciesScreenModel();
  const buttonProps = {
    onActivate: () => {
      TriumphCompleteQueueManager.closePopup();
    },
    name: "LOC_UI_CITY_CLOSE_YIELDS"
  };
  const triumphData = TriumphCompleteQueueManager.currentTriumphData;
  const triumphAudio = createMemo(() => {
    const triMajor = triumphData?.triumphData.isMajor ? "major" : "minor";
    let triType = triumphData?.triumphData.triumphType;
    triType = triType?.split("_")[2].toLowerCase();
    return "triumph-" + triMajor + "-" + triType;
  });
  onMount(() => {
    UI.sendAudioEvent(triumphAudio());
  });
  return createComponent(Panel, {
    name: "Triumph Complete Popup",
    id: "triumph-complete-popup",
    onCancelInput: () => {
      TriumphCompleteQueueManager.closePopup();
    },
    "class": "relative",
    get children() {
      return [_tmpl$(), createComponent(OrnatePopupFrame, {
        "class": "pb-3",
        buttons: [buttonProps],
        topIconSrc: "url('blp:sub_legacy_color')",
        topIconClass: "size-10 -mt-1",
        get topIconBackgroundTint() {
          return model.playerColor;
        },
        closePopupCallback: () => {
          TriumphCompleteQueueManager.closePopup();
        },
        noClose: true,
        get children() {
          return createComponent(Show, {
            when: triumphData !== null,
            get children() {
              return [(() => {
                var _el$2 = _tmpl$3();
                insert(_el$2, createComponent(FiligreeTitle.H3, {
                  get text() {
                    return Locale.compose("LOC_LEGACIES_COMPLETE_TITLE");
                  },
                  "class": "mt-2 mb-3"
                }), null);
                insert(_el$2, createComponent(Show, {
                  get when() {
                    return triumphData.triumphData.isMajor;
                  },
                  get children() {
                    var _el$3 = _tmpl$2(), _el$4 = _el$3.firstChild;
                    insert(_el$3, createComponent(L10n.Compose, {
                      text: "LOC_LEGACIES_MAJOR_TRIUMPHS_DESC"
                    }), _el$4);
                    return _el$3;
                  }
                }), null);
                return _el$2;
              })(), createComponent(TriumphCard, {
                get triumph() {
                  return triumphData.triumphData;
                }
              })];
            }
          });
        }
      })];
    }
  });
};
const TriumphCompletePopup = ComponentRegistry.register({
  name: "TriumphCompletePopup",
  createInstance: TriumphCompletePopupComponent
});
defineLegacyComponent("triumph-complete-popup", {}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(TriumphCompletePopupComponent, {});
});

export { TriumphCompletePopup };
//# sourceMappingURL=triumph-complete-popup.js.map
