import { template, insert } from '../../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, createEffect, For, createRenderEffect, Show } from '../../../../../core/vendor/solid-js/dist/solid.js';
import LensManager from '../../../../../core/ui/lenses/lens-manager.js';
import { Icon } from '../../../../../core/ui/utilities/utilities-image.js';
import { AudioContextProvider } from '../../../../../core/ui-next/components/audio-context-provider.js';
import { CloseButton } from '../../../../../core/ui-next/components/close-button.js';
import { FiligreeTitle } from '../../../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../../../core/ui-next/components/fxs-solid-component.js';
import { Hotkeys } from '../../../../../core/ui-next/components/hotkeys.js';
import { Icon as Icon$1 } from '../../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../../core/ui-next/components/l10n.js';
import { KBMNavHelp } from '../../../../../core/ui-next/components/nav-help.js';
import { Panel } from '../../../../../core/ui-next/components/panel.js';
import { useAudio } from '../../../../../core/ui-next/services/audio-support.js';
import { IsKeyboardActive, IsMouseActive, IsControllerActive, IsTouchActive } from '../../../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../../../core/ui-next/utilities/component-utilities.js';
import { ToggleGeneralAppealNumbersEvent } from '../../../../ui/lenses/layer/general-appeal-layer.js';
import { TicketSection } from '../../../tooltips/plot-tooltip/components/utility.js';
import styles from '../../../../ui/general-appeal-legend/panel-general-appeal-legend.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="size-12 bg-contain bg-no-repeat img-pc_icon_space mx-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="inset-0 absolute frame-box"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative flex flex-col px-6 w-96 items-stretch max-h-full"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute h-screen"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-row items-center relative min-h-16 mb-2"><div class="absolute general-appeal-legend-hex size-16 bg-contain bg-no-repeat"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="size-2"></div>`);
const APPEAL_DATA = [{
  description: "LOC_UI_GENERAL_APPEAL_LEGEND_BREATHTAKING",
  color: "rgb(8, 88, 13)"
}, {
  description: "LOC_UI_GENERAL_APPEAL_LEGEND_CHARMING",
  color: "rgb(149, 197, 35)"
}, {
  description: "LOC_UI_GENERAL_APPEAL_LEGEND_AVERAGE",
  color: "rgb(205, 189, 189)"
}, {
  description: "LOC_UI_GENERAL_APPEAL_LEGEND_NATURAL_WONDER",
  color: "rgb(100, 40, 250)"
}];
const GeneralAppealPanel = () => {
  const [showDetails, setShowDetails] = createSignal(Configuration.getUser().getValue("ShowAppealValues"));
  const isKBM = createMemo(() => IsKeyboardActive() || IsMouseActive());
  const navHelp = () => {
    const icon = Icon.getIconFromActionName("unit-skip-turn");
    if (icon != "ICON_KEY_SPACE") {
      return createComponent(KBMNavHelp, {
        actionName: "unit-skip-turn",
        "class": "mx-2 size-12"
      });
    } else {
      return _tmpl$();
    }
  };
  createEffect(() => {
    if (IsControllerActive()) {
      Input.setActiveContext(InputContext.Dual);
    } else {
      Input.setActiveContext(InputContext.World);
    }
  });
  createEffect(() => {
    Configuration.getUser().setValue("ShowAppealValues", showDetails());
    window.dispatchEvent(new ToggleGeneralAppealNumbersEvent(showDetails()));
  });
  return (() => {
    var _el$2 = _tmpl$5();
    insert(_el$2, createComponent(Panel, {
      name: "Syncretism Screen",
      id: "screen-syncretism",
      "class": "relative flex-col py-2 pointer-events-auto img-tooltip-bg fxs-subsystem-frame pt-4 mt-10",
      autoFocus: false,
      onCancelInput: () => LensManager.setActiveLens("fxs-default-lens"),
      get children() {
        return [_tmpl$2(), createComponent(Hotkeys, {
          get hotkeys() {
            return [{
              hotkeyAction: "shell-action-1",
              navTrayText: showDetails() ? "LOC_UI_GENERAL_APPEAL_LEGEND_HIDE_NUMBERS" : "LOC_UI_GENERAL_APPEAL_LEGEND_SHOW_NUMBERS",
              onActivate: () => {
                setShowDetails(!showDetails());
                useAudio("AppealLens")(showDetails() ? "open" : "close");
              }
            }, {
              // @ts-expect-error apparently this isn't registered as an option
              hotkeyAction: "touch-tap",
              onActivate: () => {
                setShowDetails(!showDetails());
                useAudio("AppealLens")(showDetails() ? "open" : "close");
              }
            }, {
              // @ts-expect-error apparently this isn't registered as an option
              hotkeyAction: "unit-skip-turn",
              onActivate: () => {
                setShowDetails(!showDetails());
                useAudio("AppealLens")(showDetails() ? "open" : "close");
              }
            }];
          }
        }), (() => {
          var _el$4 = _tmpl$4();
          insert(_el$4, createComponent(FiligreeTitle.H3, {
            "class": "mb-1 flex items-center",
            textClass: "text-base",
            text: "LOC_UI_GENERAL_APPEAL_LEGEND_HEADER"
          }), null);
          insert(_el$4, createComponent(TicketSection, {
            "class": "flex-auto min-h-0 flex flex-col py-4",
            get children() {
              return createComponent(For, {
                each: APPEAL_DATA,
                children: (item) => (() => {
                  var _el$6 = _tmpl$6(), _el$7 = _el$6.firstChild;
                  insert(_el$6, createComponent(L10n.Stylize, {
                    "class": "font-body text-sm ml-16",
                    get text() {
                      return item.description;
                    }
                  }), null);
                  createRenderEffect((_$p) => (_$p = item.color) != null ? _el$7.style.setProperty("fxs-background-image-tint", _$p) : _el$7.style.removeProperty("fxs-background-image-tint"));
                  return _el$6;
                })()
              });
            }
          }), null);
          insert(_el$4, createComponent(AudioContextProvider, {
            segment: "AppealLens",
            get children() {
              return createComponent(Show, {
                get fallback() {
                  return _tmpl$7();
                },
                get when() {
                  return !IsControllerActive();
                },
                get children() {
                  var _el$5 = _tmpl$3();
                  insert(_el$5, createComponent(Show, {
                    get when() {
                      return IsTouchActive();
                    },
                    get children() {
                      return createComponent(Icon$1, {
                        "class": "size-8 m-3",
                        name: `url("blp:handpointer")`,
                        isUrl: true
                      });
                    }
                  }), null);
                  insert(_el$5, createComponent(Show, {
                    get when() {
                      return isKBM();
                    },
                    get children() {
                      return navHelp();
                    }
                  }), null);
                  insert(_el$5, createComponent(L10n.Stylize, {
                    get text() {
                      return showDetails() ? "LOC_UI_GENERAL_APPEAL_LEGEND_HIDE_NUMBERS" : "LOC_UI_GENERAL_APPEAL_LEGEND_SHOW_NUMBERS";
                    },
                    "class": "text-sm font-body uppercase mr-2",
                    style: {
                      "letter-spacing": "-0.5px"
                    },
                    role: "heading"
                  }), null);
                  return _el$5;
                }
              });
            }
          }), null);
          return _el$4;
        })(), createComponent(CloseButton, {
          get ["class"]() {
            return `${IsControllerActive() ? "hidden" : ""} absolute right-1 top-1`;
          },
          onActivate: () => {
            LensManager.setActiveLens("fxs-default-lens");
          },
          hotkeyAction: "cancel",
          navTrayText: "LOC_GENERIC_BACK"
        })];
      }
    }));
    return _el$2;
  })();
};
defineLegacyComponent("panel-general-appeal-legend", {
  classNames: ["absolute"]
}, (_attrs, _element) => {
  return createComponent(GeneralAppealPanel, {});
});
ComponentUtilities.loadStyles(styles);
//# sourceMappingURL=general-appeal-lens-panel.js.map
