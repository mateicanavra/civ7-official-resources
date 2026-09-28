import { template, insert, classList } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, onMount, createComponent, Show, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { FiligreeTitle } from '../../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { ScrollArea } from '../../../../core/ui-next/components/scroll-area.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { isMobile } from '../../../../core/ui-next/services/view-experience.js';
import { OrnatePopupFrame } from '../../components/ornate-popup.js';
import { createLegaciesScreenModel } from './legacies-model.js';
import { TriumphCard } from './triumph-card.js';
import { TriumphCompleteQueueManager } from './triumph-complete-queue-manager.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute top-0 bottom-0 left-3 right-3 bg-black"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="font-body text-center mb-3 -mt-3"> </div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col items-center"></div>`);
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
    get ["class"]() {
      return `relative ${isMobile() ? "mt-19 mb-3" : ""}`;
    },
    get children() {
      return [_tmpl$(), createComponent(OrnatePopupFrame, {
        "class": "pb-3 triumph-complete-frame",
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
                  get ["class"]() {
                    return `mb-3 ${isMobile() ? "mt-4" : "mt-2"}`;
                  }
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
                    createRenderEffect((_$p) => classList(_el$3, {
                      "w-96 text-sm": !isMobile(),
                      "w-full px-5 text-base": isMobile()
                    }, _$p));
                    return _el$3;
                  }
                }), null);
                return _el$2;
              })(), createComponent(Show, {
                get when() {
                  return isMobile();
                },
                get fallback() {
                  return createComponent(TriumphCard, {
                    get triumph() {
                      return triumphData.triumphData;
                    }
                  });
                },
                get children() {
                  return createComponent(ScrollArea, {
                    "class": "flex-auto px-8",
                    get children() {
                      return createComponent(TriumphCard, {
                        get triumph() {
                          return triumphData.triumphData;
                        }
                      });
                    }
                  });
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
