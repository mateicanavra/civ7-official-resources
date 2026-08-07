import { template, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, onMount, onCleanup, createComponent, For } from '../../../../core/vendor/solid-js/dist/solid.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import ActionHandler from '../../../../core/ui/input/action-handler.js';
import { L10n } from '../../../../core/ui-next/components/l10n.js';
import { VSlot } from '../../../../core/ui-next/components/slot.js';
import { HotkeyContext } from '../../../../core/ui-next/services/hotkey.js';
import { LayoutModel } from '../../../../core/ui-next/utilities/layout-utilities.js';
import { VictoriesAltBase } from './victories-alt-base.js';
import { useVictoriesScreenContext, VictoryTabType } from './victories-screen-model.js';
import { VictoryRow } from './victory-tab-base.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full h-full flex flex-row"><div class="w-full self-center"><div class="ml-2 uppercase fxs-header"></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="victories-econ-col-3 victories-economic-graph relative"><div class="ml-8 mt-8 font-title-lg"><div class="fxs-header uppercase"></div><div class="font-body-base text-body"></div><div class="fxs-header mt-4 uppercase"></div><div class="font-body-base text-body"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="victories-econ-col-1-and-2-and-4 h-full relative"></div>`);
const audio = useAudio("VictoryScreen/TabListItem");
const ScoreVictoryTab = () => {
  const model = useVictoriesScreenContext();
  const layoutModel = LayoutModel.get();
  const hotkeyContext = useContext(HotkeyContext);
  onMount(() => {
    model.tabNavStartup(hotkeyContext);
    audio("tab-nav-score");
  });
  onCleanup(() => {
    model.tabNavShutdown(hotkeyContext);
  });
  return createComponent(VictoriesAltBase, {
    isScoreTab: true,
    backgroundImage: "url(bg-panel-iceland)",
    backgroundClass: "absolute top-4 bottom-0 left-0 right-0 relative bg-cover bg-no-repeat opacity-20 pointer-events-none",
    get headerText() {
      return model.data.scoreDetails.headerText;
    },
    victoryName: "LOC_VICTORY_SCORE_NAME",
    titleColorClass: "victories-color-score",
    scrollAreaClass: () => `victories-scroll-base ${layoutModel.screenHeightDownScaled() < 1e3 ? "w-full" : "victories-econ-cols-1-and-2-and-4"}`,
    headerContent: () => (() => {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
      insert(_el$3, createComponent(L10n.Compose, {
        text: "LOC_VICTORY_SCORE_CONTRIBUTORS"
      }));
      return _el$;
    })(),
    rightContent: () => (() => {
      var _el$4 = _tmpl$2(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.nextSibling;
      insert(_el$6, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_HEADER_1"
      }));
      insert(_el$7, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_BODY_1"
      }));
      insert(_el$8, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_HEADER_2"
      }));
      insert(_el$9, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_BODY_2"
      }));
      return _el$4;
    })(),
    rightContentSmallScreen: () => [_tmpl$3(), (() => {
      var _el$11 = _tmpl$2(), _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling, _el$15 = _el$14.nextSibling, _el$16 = _el$15.nextSibling;
      insert(_el$13, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_HEADER_1"
      }));
      insert(_el$14, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_BODY_1"
      }));
      insert(_el$15, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_HEADER_2"
      }));
      insert(_el$16, createComponent(L10n.Stylize, {
        text: "LOC_VICTORIES_RULES_SCORE_BODY_2"
      }));
      return _el$11;
    })()],
    get children() {
      return createComponent(VSlot, {
        "class": "relative pointer-events-auto victories-economic-focus transition-opacity duration-150 ease-out flex flex-col victories-econ-col-1-and-2-and-4",
        lockNavigation: true,
        get autoFocus() {
          return !model.tooltipToggle;
        },
        get children() {
          return createComponent(For, {
            get each() {
              return model.data.scoreDetails.playerDetails;
            },
            children: (player, index) => createComponent(VictoryRow, {
              get rowId() {
                return index() + 1;
              },
              get playerInfo() {
                return player.playerInfo;
              },
              divider: false,
              get rowType() {
                return VictoryTabType.Score;
              },
              skipContentColumn: true,
              columnClassOverride: "econ",
              omitBottomLine: true,
              activateInfo: (playerId) => {
                if (ActionHandler.isTouchActive) {
                  model.focusPlayer(playerId, VictoryTabType.Score);
                  model.onGamepadInspectButton();
                }
              }
            })
          });
        }
      });
    }
  });
};

export { ScoreVictoryTab };
//# sourceMappingURL=score-victory-tab.js.map
