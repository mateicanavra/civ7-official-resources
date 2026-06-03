import { template, insert, className } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { onCleanup, createComponent, Show, createRenderEffect, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { Activatable } from '../../../../core/ui-next/components/activatable.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { VSlot, HSlot } from '../../../../core/ui-next/components/slot.js';
import { IsControllerActive } from '../../../../core/ui-next/services/input.js';
import { useWindowSize, useIsSmallScreen, useAspectRatio } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { AdvisorCard } from './advisor-card.js';
import { useAdvisorScreenContext } from './advisor-screen-model.js';

var _tmpl$ = /* @__PURE__ */ template(`<div role=heading></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="w-full h-full flex flex-col items-center"></div>`);
const CouncilRoom = (props) => {
  const model = useAdvisorScreenContext();
  const windowHeight = useWindowSize();
  const isSmallScreen = useIsSmallScreen();
  const aspectRatio = useAspectRatio();
  onCleanup(() => {
    model.setSelectedAdvisorCard(AdvisorTypes.NO_ADVISOR);
  });
  return (() => {
    var _el$ = _tmpl$3();
    insert(_el$, createComponent(Show, {
      get when() {
        return !isSmallScreen() || aspectRatio() <= 1.335;
      },
      get children() {
        var _el$2 = _tmpl$();
        insert(_el$2, createComponent(L10n.Compose, {
          text: "LOC_ADVISOR_COUNCIL_SCREEN_DESCRIPTION"
        }));
        createRenderEffect(() => className(_el$2, `advisor-header-intro text-center text-accent-2 text-sm ${aspectRatio() <= 1.335 && windowHeight() >= 1080 ? "mt-10 mb-12" : "my-3"}`));
        return _el$2;
      }
    }), null);
    insert(_el$, createComponent(VSlot, {
      "class": "flex-1 w-full ",
      get children() {
        return [(() => {
          var _el$3 = _tmpl$2();
          insert(_el$3, createComponent(HSlot, {
            "class": "flex flex-row w-full h-full",
            get children() {
              return createComponent(For, {
                get each() {
                  return model.advisorsData;
                },
                children: (advisorsData) => createComponent(AdvisorCard, {
                  get type() {
                    return advisorsData.type;
                  },
                  get title() {
                    return advisorsData.title;
                  },
                  get isInitialPopup() {
                    return props.isPopup;
                  },
                  activatable: true
                })
              });
            }
          }));
          createRenderEffect(() => className(_el$3, `${isSmallScreen() ? aspectRatio() <= 1.335 ? "mt-7 mx-8" : "mt-10 mx-8" : aspectRatio() <= 1.335 ? "mt-14 mx-14" : "mt-32 mx-14"}`));
          return _el$3;
        })(), createComponent(Activatable, {
          hotkeyAction: "shell-action-2",
          get navTrayText() {
            return model.isFollowing(model.getSelectedAdvisorCard()) ? "LOC_UI_ADVISORS_UNFOLLOW" : "LOC_UI_ADVISORS_FOLLOW";
          },
          disableFocus: true,
          onActivate: () => {
            if (IsControllerActive()) {
              model.playFollowAudio(model.getSelectedAdvisorCard());
            }
            if (model.isFollowing(model.getSelectedAdvisorCard())) {
              model.unfollow(model.getSelectedAdvisorCard());
            } else {
              model.follow(model.getSelectedAdvisorCard());
            }
          }
        }), createComponent(Show, {
          get when() {
            return IsControllerActive();
          },
          get children() {
            return createComponent(Activatable, {
              hotkeyAction: "accept",
              get navTrayText() {
                return props.isPopup ? "LOC_ADVISOR_COUNCIL_CONFIRM" : "LOC_UI_ADVISORS_VIEW_PAGE";
              },
              disableFocus: true
            });
          }
        })];
      }
    }), null);
    return _el$;
  })();
};

export { CouncilRoom };
//# sourceMappingURL=advisor-screen-council-tab.js.map
