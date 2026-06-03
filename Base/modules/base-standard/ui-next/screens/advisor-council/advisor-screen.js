import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, createComponent, createRenderEffect, For, Show, createMemo } from '../../../../core/vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { useIsSmallScreen, useAspectRatio } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { ScreenFrame } from '../../components/screen-frame.js';
import { AdvisorTab } from './advisor-screen-advice-tab.js';
import { CouncilRoom } from './advisor-screen-council-tab.js';
import { createAdvisorCouncilScreenModel, AdvisorCouncilScreenContext } from './advisor-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const AdvisorCouncilComponent = (_props) => {
  const model = createAdvisorCouncilScreenModel();
  const audio = useAudio();
  const [defaultRoomTabId, setDefaultRoomTabId] = createSignal("COUNCIL");
  const [defaultAdviceTabId, setDefaultAdviceTabId] = createSignal(void 0);
  let rootRef;
  onMount(() => {
    const tabId = rootRef.parentElement?.getAttribute("tab-id");
    if (tabId) {
      setDefaultRoomTabId(tabId.replace("advisor-", "").toUpperCase());
    }
    const advicePageId = rootRef.parentElement?.getAttribute("page-id");
    if (advicePageId && advicePageId != "undefined") {
      setDefaultAdviceTabId(advicePageId);
    }
    audio("AdvisorScreen", "popup-open");
  });
  const handleOnClosing = () => {
    audio("AdvisorScreen", "popup-close");
  };
  const isSmallScreen = useIsSmallScreen();
  const aspectRatio = useAspectRatio();
  return createComponent(AdvisorCouncilScreenContext.Provider, {
    value: model,
    get children() {
      return createComponent(ScreenFrame, {
        name: "Advisor-Council",
        panelContext: "screen-advisor-council",
        audioContext: "AdvisorScreen",
        onClosing: handleOnClosing,
        get ornatePanelData() {
          return model.ornatePanelData;
        },
        title: "LOC_UI_RADIAL_MENU_DETAILS_ADVISORS_TITLE",
        ref(r$) {
          var _ref$ = rootRef;
          typeof _ref$ === "function" ? _ref$(r$) : rootRef = r$;
        },
        get children() {
          return createComponent(Tab, {
            "class": "w-full flex flex-col flex-auto pointer-events-auto relative",
            get defaultTab() {
              return defaultRoomTabId();
            },
            get children() {
              return [createComponent(Tab.TabList, {
                get ["class"]() {
                  return `advisor-tab-list self-center text-sm font-base ${isSmallScreen() ? "my-5" : aspectRatio() <= 1.335 ? "mt-20 mb-8" : "my-10"}`;
                },
                nextHotkey: "nav-next",
                previousHotkey: "nav-previous"
              }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                name: "COUNCIL",
                title: () => "LOC_ADVISOR_COUNCIL_TAB",
                body: () => (() => {
                  var _el$ = _tmpl$();
                  insert(_el$, createComponent(CouncilRoom, {
                    isPopup: false
                  }));
                  createRenderEffect(() => className(_el$, `flex-1 ${isSmallScreen() ? "mb-24" : "mb-16"}`));
                  return _el$;
                })()
              }), createComponent(For, {
                get each() {
                  return model.advisorsData;
                },
                children: (advice) => {
                  return createComponent(Show, {
                    get when() {
                      return advice.pages?.length;
                    },
                    get children() {
                      return createComponent(Tab.Item, {
                        get name() {
                          return advice.title;
                        },
                        title: () => `LOC_VICTORY_${advice.title}_MODERN_NAME`,
                        body: () => createComponent(AdvisorTab, {
                          get type() {
                            return advice.type;
                          },
                          get title() {
                            return advice.title;
                          },
                          get pages() {
                            return advice.pages;
                          },
                          get defaultTab() {
                            return createMemo(() => advice.title === defaultRoomTabId())() ? defaultAdviceTabId() : void 0;
                          }
                        })
                      });
                    }
                  });
                }
              })];
            }
          });
        }
      });
    }
  });
};
const AdvisorCouncil = ComponentRegistry.register({
  name: "AdvisorCouncil",
  createInstance: AdvisorCouncilComponent
});
defineLegacyComponent("screen-advisor-council", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(AdvisorCouncilComponent, {});
});

export { AdvisorCouncil };
//# sourceMappingURL=advisor-screen.js.map
