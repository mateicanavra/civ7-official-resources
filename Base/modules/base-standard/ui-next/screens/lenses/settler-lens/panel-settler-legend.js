import { template, insert, className, style } from '../../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, onMount, onCleanup, createEffect, For, createRenderEffect, Show } from '../../../../../core/vendor/solid-js/dist/solid.js';
import { InputEngineEventName } from '../../../../../core/ui/input/input-support.js';
import LensManager, { LensLayerEnabledEventName, LensLayerDisabledEventName } from '../../../../../core/ui/lenses/lens-manager.js';
import { ComponentID } from '../../../../../core/ui/utilities/utilities-component-id.js';
import { Icon } from '../../../../../core/ui/utilities/utilities-image.js';
import { AudioContextProvider } from '../../../../../core/ui-next/components/audio-context-provider.js';
import { CloseButton } from '../../../../../core/ui-next/components/close-button.js';
import { FiligreeTitle } from '../../../../../core/ui-next/components/filigree-title.js';
import { defineLegacyComponent } from '../../../../../core/ui-next/components/fxs-solid-component.js';
import { Hotkeys } from '../../../../../core/ui-next/components/hotkeys.js';
import { Icon as Icon$1 } from '../../../../../core/ui-next/components/icon.js';
import { L10n } from '../../../../../core/ui-next/components/l10n.js';
import { KBMNavHelp } from '../../../../../core/ui-next/components/nav-help.js';
import { useAudio } from '../../../../../core/ui-next/services/audio-support.js';
import { IsKeyboardActive, IsMouseActive, IsControllerActive, IsTouchActive } from '../../../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../../../core/ui-next/utilities/component-utilities.js';
import { useIsSmallScreen } from '../../../../../core/ui-next/utilities/layout-utilities.js';
import { UnitMapDecorationSupport } from '../../../../ui/interface-modes/support-unit-map-decoration.js';
import { HideMiniMapEvent } from '../../../../ui/mini-map/panel-mini-map.js';
import { TicketSection } from '../../../tooltips/plot-tooltip/components/utility.js';
import styles from '../../../../ui/settler-legend/panel-settler-legend.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="size-12 bg-contain bg-no-repeat img-pc_icon_space mx-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute h-screen"><div id="panel-settler-legend"class="relative flex-col py-2 pointer-events-auto img-tooltip-bg fxs-subsystem-frame pt-4 mt-3"><div class="inset-0 absolute frame-box"></div><div class="relative flex flex-col px-6 w-96 items-stretch max-h-full"></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row items-center relative min-h-16"><div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="size-2"></div>`);
const SETTLEMENT_DATA = [{
  description: "LOC_UI_SETTLER_LEGEND_BAD",
  class: "settler-legend-hex",
  color: "rgb(105, 9, 9)"
}, {
  description: "LOC_UI_SETTLER_LEGEND_OKAY",
  class: "settler-legend-hex",
  color: "rgb(180, 158, 40)"
}, {
  description: "LOC_UI_SETTLER_LEGEND_GOOD",
  class: "settler-legend-hex",
  color: "rgb(40, 238, 190)"
}, {
  description: "LOC_UI_SETTLER_LEGEND_FLOOD_RISK",
  class: "settler-legend-flood"
}, {
  description: "LOC_UI_SETTLER_LEGEND_ERUPTION_RISK",
  class: "settler-legend-volcano"
}, {
  description: "LOC_UI_SETTLER_LEGEND_RECOMMENDED",
  class: "settler-legend-city-recommend"
}];
const SettlerLegendPanel = () => {
  const [showDetails, setShowDetails] = createSignal(LensManager.isLayerEnabled("fxs-radial-measure-layer"));
  const isUnit = createMemo(() => ComponentID.isValid(UI.Player.getHeadSelectedUnit()));
  const isKBM = createMemo(() => IsKeyboardActive() || IsMouseActive());
  const isSmallScreen = useIsSmallScreen();
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
  onMount(() => {
    window.addEventListener(InputEngineEventName, handleWindowEngineInput);
    window.addEventListener(LensLayerEnabledEventName, handleLensChange);
    window.addEventListener(LensLayerDisabledEventName, handleLensChange);
  });
  onCleanup(() => {
    window.removeEventListener(InputEngineEventName, handleWindowEngineInput);
    window.removeEventListener(LensLayerEnabledEventName, handleLensChange);
    window.removeEventListener(LensLayerDisabledEventName, handleLensChange);
  });
  const triggerRadialToggle = () => {
    LensManager.toggleLayer("fxs-radial-measure-layer");
    useAudio("AppealLens")(showDetails() ? "open" : "close");
  };
  const handleLensChange = (event) => {
    if (event.detail.layer === "fxs-radial-measure-layer") {
      setShowDetails(LensManager.isLayerEnabled("fxs-radial-measure-layer"));
    }
  };
  const handleWindowEngineInput = (inputEvent) => {
    if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      if (inputEvent.isCancelInput() || inputEvent.detail.name == "keyboard-escape") {
        LensManager.disableLayer("fxs-radial-measure-layer");
        if (isUnit()) return;
        LensManager.setActiveLens("fxs-default-lens");
        inputEvent.preventDefault();
        inputEvent.stopImmediatePropagation();
        return;
      }
      switch (inputEvent.detail.name) {
        case "shell-action-1":
        case "notification":
        case "swap-plot-selection":
        case "touch-tap":
        case "unit-skip-turn":
          triggerRadialToggle();
          inputEvent.preventDefault();
          inputEvent.stopImmediatePropagation();
          return;
      }
    }
  };
  createEffect(() => {
    if (isSmallScreen()) {
      window.dispatchEvent(new HideMiniMapEvent(true));
    } else {
      window.dispatchEvent(new HideMiniMapEvent(false));
    }
  });
  createEffect(() => {
    if (IsControllerActive()) {
      Input.setActiveContext(InputContext.Unit);
      if (showDetails()) {
        window.dispatchEvent(new CustomEvent("ui-hide-plot-vfx", {
          bubbles: false
        }));
      } else {
        window.dispatchEvent(new CustomEvent("ui-show-plot-vfx", {
          bubbles: false
        }));
      }
    } else {
      Input.setActiveContext(InputContext.World);
    }
  });
  return (() => {
    var _el$2 = _tmpl$3(), _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling;
    insert(_el$3, createComponent(Hotkeys, {
      get hotkeys() {
        return [{
          hotkeyAction: "shell-action-1",
          navTrayText: showDetails() ? "LOC_UI_SETTLER_LEGEND_HIDE_RULER" : "LOC_UI_SETTLER_LEGEND_SHOW_RULER",
          onActivate: triggerRadialToggle
        }];
      }
    }), _el$5);
    insert(_el$5, createComponent(FiligreeTitle.H3, {
      "class": "mb-1 flex items-center",
      textClass: "text-base",
      text: "LOC_UI_SETTLER_LEGEND_HEADER"
    }), null);
    insert(_el$5, createComponent(TicketSection, {
      "class": "flex-auto min-h-0 flex flex-col py-4 gap-1",
      get children() {
        return createComponent(For, {
          each: SETTLEMENT_DATA,
          children: (item) => (() => {
            var _el$7 = _tmpl$4(), _el$8 = _el$7.firstChild;
            insert(_el$7, createComponent(L10n.Stylize, {
              "class": "font-body text-sm ml-16",
              get text() {
                return item.description;
              }
            }), null);
            createRenderEffect((_p$) => {
              var _v$ = `absolute ${item.class} bg-contain bg-no-repeat`, _v$2 = !!(item.class == "settler-legend-hex"), _v$3 = !!(item.class !== "settler-legend-hex"), _v$4 = !!(item.class !== "settler-legend-hex"), _v$5 = item.color ? {
                "fxs-background-image-tint": item.color
              } : {};
              _v$ !== _p$.e && className(_el$8, _p$.e = _v$);
              _v$2 !== _p$.t && _el$8.classList.toggle("size-16", _p$.t = _v$2);
              _v$3 !== _p$.a && _el$8.classList.toggle("size-12", _p$.a = _v$3);
              _v$4 !== _p$.o && _el$8.classList.toggle("m-2", _p$.o = _v$4);
              _p$.i = style(_el$8, _v$5, _p$.i);
              return _p$;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0,
              i: void 0
            });
            return _el$7;
          })()
        });
      }
    }), null);
    insert(_el$5, createComponent(AudioContextProvider, {
      segment: "AppealLens",
      get children() {
        return createComponent(Show, {
          get fallback() {
            return _tmpl$5();
          },
          get when() {
            return !IsControllerActive();
          },
          get children() {
            var _el$6 = _tmpl$2();
            insert(_el$6, createComponent(Show, {
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
            insert(_el$6, createComponent(Show, {
              get when() {
                return isKBM();
              },
              get children() {
                return navHelp();
              }
            }), null);
            insert(_el$6, createComponent(L10n.Stylize, {
              get text() {
                return showDetails() ? "LOC_UI_SETTLER_LEGEND_HIDE_RULER" : "LOC_UI_SETTLER_LEGEND_SHOW_RULER";
              },
              "class": "text-sm font-body uppercase mr-2",
              style: {
                "letter-spacing": "-0.5px"
              },
              role: "heading"
            }), null);
            return _el$6;
          }
        });
      }
    }), null);
    insert(_el$3, createComponent(CloseButton, {
      get ["class"]() {
        return `${IsControllerActive() ? "hidden" : ""} absolute right-1 top-1`;
      },
      onActivate: () => {
        if (isUnit()) {
          UI.Player.deselectAllUnits();
          UnitMapDecorationSupport.manager.deactivate();
        }
        LensManager.setActiveLens("fxs-default-lens");
      },
      hotkeyAction: "cancel",
      navTrayText: "LOC_GENERIC_BACK"
    }), null);
    return _el$2;
  })();
};
defineLegacyComponent("panel-settler-legend", {
  classNames: ["absolute"]
}, (_attrs, _element) => {
  return createComponent(SettlerLegendPanel, {});
});
ComponentUtilities.loadStyles(styles);
//# sourceMappingURL=panel-settler-legend.js.map
