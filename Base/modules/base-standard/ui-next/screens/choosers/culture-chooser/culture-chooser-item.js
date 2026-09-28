import { template, insert, setAttribute } from '../../../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, For, createRenderEffect, Show } from '../../../../../core/vendor/solid-js/dist/solid.js';
import { ChooserItem } from '../../../../../core/ui-next/components/chooser-item.js';
import { TooltipHorizontalPosition, TooltipVerticalPosition } from '../../../../../core/ui-next/components/tooltip.js';
import { AdvisorRecommendationsList } from '../../../components/advisor-recommendation.js';
import { TechCivicTooltip } from '../../../tooltips/tech-civic-tooltip.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col items-stretch pointer-events-none mb-2 relative flex-auto min-w-0"><div class="font-title text-xs mt-2\\.5 mb-1 mr-2 ml-px uppercase tracking-100 truncate"></div><div class="flex flex-row flex-wrap ml-px"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-end justify-end"><div class="flex flex-col grow items-end px-2 pt-2\\.5 pb-1\\.5 justify-between"><div class="flex flex-row justify-end items-center"><div class="tree-chooser-item__turns-clock pointer-events-none size-8 bg-contain bg-no-repeat bg-center"></div><div class="font-title text-sm font-bold"></div></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col items-center justify-end my-2 mx-3"><div class="font-title text-xs"></div><div class="bg-black relative w-11 h-2"><div class="tree-chooser-item__percent-bar-fill absolute h-full"></div></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex items-stretch w-9 h-9 mr-1\\.5 mb-2\\.5"><img class="pointer-events-none w-9 h-9"></div>`);
function CultureChooserItem(props) {
  const pctLabel = createMemo(() => `${props.node.progress ?? 0}%`);
  const currentDepthUnlocks = createMemo(() => {
    const depthIndex = props.node.currentDepthIndex ?? 0;
    return props.node.unlocksByDepth[depthIndex]?.unlocks ?? [];
  });
  return createComponent(TechCivicTooltip, {
    get node() {
      return {
        name: props.node.name,
        unlocksByDepth: props.node.unlocksByDepth,
        cost: props.node.cost,
        recommendations: props.node.recommendations,
        currentDepthIndex: props.node.currentDepthIndex
      };
    },
    isCulture: true,
    get initialVPosition() {
      return TooltipVerticalPosition.CENTER;
    },
    get initialHPosition() {
      return TooltipHorizontalPosition.RIGHT;
    },
    get children() {
      return createComponent(ChooserItem, {
        name: "CultureChooserItem",
        "class": "culture-item self-stretch my-1\\.25 text-accent-2 pointer-events-auto",
        get icon() {
          return props.node.icon;
        },
        selectOnActivate: true,
        audio: {
          group: "audio-screen-culture-tree-chooser",
          onFocus: "data-audio-chooser-focus",
          onActivate: "data-audio-culture-tree-activate"
        },
        onActivate: () => {
          props.onSelect(props.node.id);
          const nodeDef = GameInfo.ProgressionTreeNodes.lookup(props.node.id);
          if (nodeDef) {
            const event = "civic-tree-activate-" + nodeDef.ProgressionTreeNodeType + "_" + props.node.currentDepthIndex;
            UI.sendAudioEvent(event);
          }
        },
        get ["node-tree-type"]() {
          return String(props.node.treeType);
        },
        get ["node-id"]() {
          return String(props.node.id);
        },
        hotkeyAction: "accept",
        get children() {
          return [(() => {
            var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
            insert(_el$2, () => props.node.name);
            insert(_el$3, createComponent(For, {
              get each() {
                return currentDepthUnlocks();
              },
              children: (unlock) => (() => {
                var _el$13 = _tmpl$4(), _el$14 = _el$13.firstChild;
                createRenderEffect(() => setAttribute(_el$14, "src", unlock.icon));
                return _el$13;
              })()
            }));
            return _el$;
          })(), (() => {
            var _el$4 = _tmpl$2(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling;
            insert(_el$8, () => props.node.turns);
            insert(_el$5, createComponent(AdvisorRecommendationsList, {
              get recommendations() {
                return props.node.recommendations;
              },
              direction: "horizontal",
              iconOnly: true
            }), null);
            return _el$4;
          })(), createComponent(Show, {
            get when() {
              return props.node.isLocked;
            },
            get children() {
              var _el$9 = _tmpl$3(), _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling, _el$12 = _el$11.firstChild;
              insert(_el$10, pctLabel);
              createRenderEffect((_$p) => (_$p = `${props.node.progress ?? 0}%`) != null ? _el$12.style.setProperty("width", _$p) : _el$12.style.removeProperty("width"));
              return _el$9;
            }
          })];
        }
      });
    }
  });
}

export { CultureChooserItem };
//# sourceMappingURL=culture-chooser-item.js.map
