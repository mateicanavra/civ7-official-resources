import '../../../core/vendor/solid-js/web/dist/web.js';
import { onMount, onCleanup, createMemo, createComponent, Show } from '../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { Tab } from '../../../core/ui-next/components/tab.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { CrisisPolicies } from './crisis-policies.js';
import { GovernmentOverview } from './government-overview.js';
import { GovtScreenModel, setActivePolicyTab, GovtScreenModelContext, activePolicyTab } from './model-government.js';
import { PoliciesModel, PoliciesModelContext } from './model-policies.js';
import { PoliciesAndTraditions } from './policies-and-traditions.js';
import { ScreenFrame } from '../../ui-next/components/screen-frame.js';
import style from './screen-policies.scss.js';

const GovermentScreenComponent = (_props) => {
  const policiesModel = PoliciesModel.get();
  const model = GovtScreenModel.get();
  const audio = useAudio("GovernmentOverview");
  onMount(() => {
    audio("popup-open");
  });
  onCleanup(() => {
    setActivePolicyTab("gov-overview");
  });
  const handleOnClosing = () => {
    audio("popup-close");
  };
  const ornatePanelData = createMemo(() => {
    return {
      ...model.data.ornatePanelData,
      topIconSrc: "url(blp:fi_celebration_128)"
    };
  });
  return createComponent(GovtScreenModelContext.Provider, {
    value: model,
    get children() {
      return createComponent(PoliciesModelContext.Provider, {
        value: policiesModel,
        get children() {
          return createComponent(ScreenFrame, {
            name: "Government Screen",
            panelContext: "screen-policies",
            audioContext: "GovernmentScreen",
            title: "LOC_UI_MINI_MAP_GOVERNMENT",
            get ornatePanelData() {
              return ornatePanelData();
            },
            onClosing: handleOnClosing,
            doNotStretch: true,
            get children() {
              return createComponent(Tab, {
                activeTab: activePolicyTab,
                "class": "w-full relative flex flex-col flex-auto pointer-events-auto",
                get children() {
                  return [createComponent(Tab.TabList, {
                    "class": "min-w-187 self-center text-base font-base policies__tab-bar",
                    nextHotkey: "nav-next",
                    previousHotkey: "nav-previous"
                  }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
                    name: "gov-overview",
                    title: () => "LOC_UI_POLICIES_OVERVIEW_TAB",
                    body: () => createComponent(GovernmentOverview, {
                      name: "gov-overview",
                      id: "gov-overview",
                      "class": "flex flex-auto"
                    })
                  }), createComponent(Tab.Item, {
                    name: "policies-and-traditions",
                    title: () => "LOC_UI_POLICIES_POLICIES_TAB",
                    body: () => createComponent(PoliciesAndTraditions, {
                      name: "policies-and-traditions",
                      id: "policies-and-traditions",
                      "class": "flex flex-auto"
                    })
                  }), createComponent(Show, {
                    get when() {
                      return model.data.displayCrisisTab();
                    },
                    get children() {
                      return createComponent(Tab.Item, {
                        name: "crisis-policies",
                        title: () => "LOC_UI_POLICIES_CRISIS_TAB",
                        body: () => createComponent(CrisisPolicies, {
                          name: "crisis-policies",
                          id: "crisis-policies",
                          "class": "flex flex-auto"
                        })
                      });
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
window.addEventListener("hotkey-open-traditions", () => {
  if (ContextManager.isCurrentClass("screen-policies")) {
    ContextManager.pop("screen-policies");
  } else {
    ContextManager.push("screen-policies", {
      singleton: true,
      createMouseGuard: true
    });
  }
});
defineLegacyComponent("screen-policies", {
  classNames: ["screen-policies", "fullscreen"]
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(GovermentScreenComponent, {});
});
const PoliciesScreen = ComponentRegistry.register({
  name: "PoliciesScreen",
  styles: [style],
  createInstance: GovermentScreenComponent
});

export { PoliciesScreen };
//# sourceMappingURL=government-hub.js.map
