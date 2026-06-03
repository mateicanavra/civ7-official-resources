import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { onMount, createComponent, Show, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ActiveDeviceTypeChangedEventName } from '../../../../core/ui/input/input-events.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../../core/ui-next/components/button.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { useWindowSize, useIsSmallScreen, useAspectRatio } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { useWindowListener } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { ScreenFrame, ScreenFrameCloseHandler } from '../../components/screen-frame.js';
import { CouncilRoom } from './advisor-screen-council-tab.js';
import { createAdvisorCouncilScreenModel, AdvisorCouncilScreenContext } from './advisor-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full flex flex-col flex-auto"><div class="flex-1 mt-10 mb-8"></div><div role=note></div></div>`);
const AdvisorCouncilPopupComponent = () => {
  const model = createAdvisorCouncilScreenModel();
  const audio = useAudio();
  const onActiveDeviceChanged = () => {
    Input.setActiveContext(InputContext.Shell);
  };
  onMount(() => {
    useWindowListener(ActiveDeviceTypeChangedEventName, onActiveDeviceChanged, true);
    if (IsControllerActive()) {
      Input.setActiveContext(InputContext.Shell);
    }
    audio("AdvisorScreen", "popup-open");
  });
  const handleOnClosing = () => {
    audio("AdvisorScreen", "popup-close");
  };
  const windowSize = useWindowSize();
  const isSmallScreen = useIsSmallScreen();
  const aspectRatio = useAspectRatio();
  return createComponent(AdvisorCouncilScreenContext.Provider, {
    value: model,
    get children() {
      return createComponent(ScreenFrame, {
        name: "Advisor-Council-Popup",
        panelContext: "advisor-council-popup",
        audioContext: "AdvisorScreen",
        onClosing: handleOnClosing,
        get ornatePanelData() {
          return model.ornatePanelData;
        },
        title: "LOC_UI_ADVISORS_CHOOSE",
        get closeHandler() {
          return ScreenFrameCloseHandler.PopupSequencer;
        },
        get children() {
          var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
          insert(_el$2, createComponent(CouncilRoom, {
            isPopup: true
          }));
          insert(_el$3, createComponent(L10n.Compose, {
            text: "LOC_ADVISOR_COUNCIL_NOTE"
          }));
          insert(_el$, createComponent(Show, {
            get when() {
              return !IsControllerActive();
            },
            get children() {
              return createComponent(AudioContextProvider, {
                segment: "Confirm",
                get children() {
                  return createComponent(Button, {
                    get ["class"]() {
                      return `w-96 text-sm self-center ${isSmallScreen() ? "mb-10" : aspectRatio() <= 1.335 && windowSize() < 1080 ? "mb-32" : "mb-10"}`;
                    },
                    onActivate: () => model.clickClosePopup(),
                    get children() {
                      return createComponent(L10n.Compose, {
                        text: "LOC_ADVISOR_COUNCIL_CONFIRM"
                      });
                    }
                  });
                }
              });
            }
          }), null);
          createRenderEffect(() => className(_el$3, `text-center text-base ${IsControllerActive() && isSmallScreen() ? "mb-20" : IsControllerActive() ? "mb-24" : "mb-8"}`));
          return _el$;
        }
      });
    }
  });
};
const AdvisorCouncilPopup = ComponentRegistry.register({
  name: "AdvisorCouncil",
  createInstance: AdvisorCouncilPopupComponent
});
defineLegacyComponent("advisor-council-popup", {
  classNames: ["fullscreen"]
}, () => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(AdvisorCouncilPopupComponent, {});
});

export { AdvisorCouncilPopup };
//# sourceMappingURL=advisor-screen-popup.js.map
