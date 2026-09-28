import { template, insert, style } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show, For, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { AudioContextProvider } from '../../../../core/ui-next/components/audio-context-provider.js';
import { CloseButton } from '../../../../core/ui-next/components/close-button.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { Panel } from '../../../../core/ui-next/components/panel.js';
import { NarrativeRewardButton } from './narrative-reward-button.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative"><div class="img-small-narrative-frame w-full min-h-48 relative flex flex-col max-w-full max-h-full pointer-events-auto"><div class="flex flex-row absolute self-center justify-center items-center w-full -top-14 h-8"><div class="absolute top-2 left-0\\.5 bottom-0 w-1\\/2 h-14 img-small-narrative-header"></div><div class="absolute top-2 right-0 bottom-0 w-1\\/2 rotate-y-180 h-14 img-small-narrative-header"></div><div class="img-small-narrative-top-icon w-8 h-8 top-3 absolute"></div></div><div class="flex px-4 pt-5"><div class="w-full text-center font-body-sm"></div></div></div></div>`);
const AUDIO_GROUP = "small-narrative-event";
const NarrativeEventPanel = (props) => {
  return createComponent(AudioContextProvider, {
    segment: AUDIO_GROUP,
    get children() {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild;
      insert(_el$5, createComponent(Show, {
        get when() {
          return props.titleText && props.titleText.length > 0;
        },
        get children() {
          return createComponent(L10n.Stylize, {
            "class": "pt-2 pb-1 pr-9 pl-4 text-center font-title-lg font-bold tracking-150",
            get text() {
              return props.titleText;
            }
          });
        }
      }), null);
      insert(_el$5, createComponent(L10n.Stylize, {
        "class": "pt-3 pb-2 pr-9 pl-4 text-center",
        get text() {
          return props.bodyText;
        }
      }), null);
      insert(_el$5, createComponent(Panel, {
        autoFocus: true,
        "class": "w-full mt-3 px-3 flex flex-col",
        name: "small-narrative-event",
        get id() {
          return props.panelID;
        },
        get children() {
          return createComponent(For, {
            get each() {
              return props.choices;
            },
            children: (choice) => createComponent(NarrativeRewardButton, {
              get mainText() {
                return choice.mainText;
              },
              get actionText() {
                return choice.actionText;
              },
              get rewardText() {
                return choice.rewardText;
              },
              get icons() {
                return choice.icons;
              },
              get leaderCiv() {
                return props.leaderCiv;
              },
              get storyType() {
                return props.storyType;
              },
              get canAfford() {
                return choice.canAfford;
              },
              audioGroup: AUDIO_GROUP,
              onActivate: () => props.onChoiceSelected(choice)
            })
          });
        }
      }), null);
      insert(_el$, createComponent(CloseButton, {
        "class": "absolute top-1 right-1 z-10",
        "data-audio-group-ref": AUDIO_GROUP,
        get onActivate() {
          return props.onClose;
        }
      }), null);
      createRenderEffect((_$p) => style(_el$2, {
        ...props.backgroundImage ? {
          "background-image": props.backgroundImage
        } : {}
      }, _$p));
      return _el$;
    }
  });
};

export { NarrativeEventPanel };
//# sourceMappingURL=narrative-event-panel.js.map
