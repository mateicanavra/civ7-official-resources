import { template, insert } from '../../../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, onMount, onCleanup, createComponent, Show, For } from '../../../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../../../core/ui/context-manager/context-manager.js';
import { Icon } from '../../../../../core/ui/utilities/utilities-image.js';
import ViewManager from '../../../../../core/ui/views/view-manager.js';
import { Button } from '../../../../../core/ui-next/components/button.js';
import { defineLegacyComponent } from '../../../../../core/ui-next/components/fxs-solid-component.js';
import { InnerFrame } from '../../../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../../../core/ui-next/components/l10n.js';
import { ScrollArea } from '../../../../../core/ui-next/components/scroll-area.js';
import { IsControllerActive } from '../../../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../../../core/ui-next/utilities/component-utilities.js';
import { createArraySignal } from '../../../../../core/ui-next/utilities/solid-utilities.js';
import { TreeNodesSupport } from '../../../../ui/tree-grid/tree-support.js';
import { AdvisorUtilities } from '../../../../ui/tutorial/advisor-utilities.js';
import { getNodeName } from '../../../../ui/utilities/utilities-textprovider.js';
import { SidebarChooser } from '../../../components/side-chooser.js';
import { buildUnlockDisplayData, hasUnlockContent } from '../helpers.js';
import { TechChooserItem } from './tech-chooser-item.js';
import style from './tech-chooser.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="tech-tree-currently-studying self-center w-96"><div class="text-accent-4 uppercase mt-1 font-title text-sm tracking-100"></div><div class="filigree-divider-inner-frame w-72 my-1\\.5 self-center"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="mt-4 mb-2\\.5 font-title text-base w-96 self-center uppercase text-center"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="w-full min-h-16 flex justify-center items-center font-body text-sm text-accent-4 text-center"></div>`);
function buildTechNodeData(player, nodeType, isActiveResearch = false) {
  const nodeDef = GameInfo.ProgressionTreeNodes.lookup(nodeType);
  const nodeData = Game.ProgressionTrees.getNode(player.id, nodeType);
  if (!nodeDef || !nodeData) return null;
  const unlocksByDepth = [];
  const treeNodeUnlocks = TreeNodesSupport.getValidNodeUnlocks(nodeData);
  const removableUnlocks = TreeNodesSupport.getRepeatedUniqueUnits(treeNodeUnlocks);
  for (const idx of nodeData.unlockIndices) {
    const unlockInfo = GameInfo.ProgressionTreeNodeUnlocks[idx];
    if (!unlockInfo || unlockInfo.Hidden) continue;
    if (unlockInfo.TargetKind === "KIND_UNIT") {
      const p = Players.get(GameContext.localPlayerID);
      if (p && p.Units?.isBuildPermanentlyDisabled(unlockInfo.TargetType)) continue;
      if (removableUnlocks.includes(unlockInfo.TargetType)) continue;
    }
    const unlockDisplayData = buildUnlockDisplayData(unlockInfo);
    const hasInfo = unlockDisplayData.nameKey.length > 0 || hasUnlockContent(unlockDisplayData.descriptionData);
    if (!hasInfo) continue;
    while (unlocksByDepth.length < unlockInfo.UnlockDepth) {
      const depthIndex = unlocksByDepth.length;
      const isCompleted = depthIndex < nodeData.depthUnlocked;
      const isCurrent = isActiveResearch && depthIndex === nodeData.depthUnlocked;
      unlocksByDepth.push({
        header: "",
        unlocks: [],
        isCompleted,
        isCurrent,
        isLocked: false
      });
    }
    const depthIdx = unlockInfo.UnlockDepth - 1;
    if (unlockDisplayData.icon) {
      unlocksByDepth[depthIdx].unlocks.push(unlockDisplayData);
    }
  }
  const techRecommendations = AdvisorUtilities.getTreeRecommendations(AdvisorySubjectTypes.CHOOSE_TECH);
  const recommendations = AdvisorUtilities.getTreeRecommendationIcons(techRecommendations, nodeType).map((rec) => rec.class);
  const playerTechs = player?.Techs;
  const cost = playerTechs?.getNodeCost(nodeType) ?? -1;
  const turns = playerTechs?.getTurnsForNode(nodeType) ?? -1;
  return {
    id: nodeType,
    name: getNodeName(nodeData, player),
    icon: Icon.getTechIconFromProgressionTreeNodeDefinition(nodeDef),
    turns,
    treeType: nodeDef.ProgressionTree,
    unlocksByDepth,
    recommendations,
    isLocked: false,
    cost,
    progress: nodeData.progress ?? 0,
    currentDepthIndex: nodeData.depthUnlocked
  };
}
function getActiveNodeType(player) {
  const techTreeType = player?.Techs?.getTreeType();
  if (techTreeType === void 0) return void 0;
  const treeObject = Game.ProgressionTrees.getTree(player.id, techTreeType);
  return treeObject?.nodes?.[treeObject.activeNodeIndex]?.nodeType;
}
function getAllTechNodes(player) {
  const out = [];
  const available = player?.Techs?.getAllAvailableNodeTypes?.();
  if (!available) return out;
  const activeNodeType = getActiveNodeType(player);
  for (const nodeType of available) {
    const isActiveResearch = nodeType === activeNodeType;
    const node = buildTechNodeData(player, nodeType, isActiveResearch);
    if (node) out.push(node);
  }
  return out;
}
function chooseTech(nodeId) {
  const nodeIndex = nodeId;
  const args = {
    ProgressionTreeNodeType: nodeIndex
  };
  const result = Game.PlayerOperations.canStart(GameContext.localPlayerID, PlayerOperationTypes.SET_TECH_TREE_NODE, args, false);
  if (result?.Success) {
    Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.SET_TECH_TREE_NODE, args);
  }
}
function openFullTree(defaultNode, treeType) {
  const treeParent = document.querySelector(".fxs-trees") || void 0;
  ContextManager.push("screen-tech-tree", {
    singleton: true,
    createMouseGuard: true,
    targetParent: treeParent
  });
  if (treeType !== void 0) {
    window.dispatchEvent(new CustomEvent("view-tech-progression-tree", {
      detail: {
        treeCSV: treeType,
        targetNode: defaultNode,
        iconCallback: Icon.getTechIconFromProgressionTreeNodeDefinition
      }
    }));
  }
  ContextManager.pop("screen-tech-tree-chooser");
}
const TechTreeChooser = () => {
  let resetInputContext = true;
  const [getClosing, setClosing] = createSignal(false);
  const [allNodes, mutateNodes] = createArraySignal([]);
  const inProgressNode = createMemo(() => {
    const nodes = allNodes();
    for (const node of nodes) {
      const currentDepth = node.unlocksByDepth[node.currentDepthIndex];
      if (currentDepth?.isCurrent) return node;
    }
    return void 0;
  });
  const defaultNode = createMemo(() => inProgressNode()?.id ?? allNodes()[0]?.id);
  const defaultTree = createMemo(() => inProgressNode()?.treeType ?? allNodes()[0]?.treeType);
  function refresh() {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) return;
    const nodes = getAllTechNodes(player);
    mutateNodes((arr) => {
      arr.length = 0;
      arr.push(...nodes);
    });
  }
  function handleSelect(id) {
    chooseTech(id);
    const args = {
      ProgressionTreeNodeType: ProgressionTreeNodeTypes.NO_NODE
    };
    Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE, args);
    setClosing(true);
  }
  function handleOpenFullTree() {
    resetInputContext = false;
    openFullTree(defaultNode(), defaultTree());
  }
  onMount(() => {
    refresh();
    const listener = (data) => {
      if (data?.player !== void 0 && data.player !== GameContext.localPlayerID) return;
      refresh();
    };
    UI.sendAudioEvent("tech-tree-chooser-panel-showing");
    const events = ["ScienceYieldChanged", "TechTreeChanged", "TechTargetChanged", "TechNodeCompleted", "PlayerTurnActivated", "LocalPlayerTurnBegin", "LocalPlayerChanged"];
    for (const e of events) engine.on(e, listener);
    onCleanup(() => {
      for (const e of events) engine.off(e, listener);
      if (resetInputContext) {
        Input.setActiveContext(ViewManager.current.getInputContext());
      }
      UI.sendAudioEvent("culture-tree-chooser-panel-hiding");
    });
  });
  return createComponent(SidebarChooser, {
    context: "screen-tech-tree-chooser",
    title: "LOC_UI_TECH_CHOOSER_TITLE",
    id: "tech-tree-chooser",
    name: "tech-tree-chooser",
    closeButtonAudioGroup: "audio-screen-tech-tree-chooser",
    get closing() {
      return getClosing();
    },
    get children() {
      return [createComponent(InnerFrame, {
        "class": "my-1\\.5",
        get children() {
          var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
          insert(_el$2, createComponent(L10n.Compose, {
            text: "LOC_UI_CURRENT_TECH_HEADER"
          }));
          insert(_el$, createComponent(Show, {
            get when() {
              return inProgressNode();
            },
            get fallback() {
              return (() => {
                var _el$5 = _tmpl$3();
                insert(_el$5, createComponent(L10n.Compose, {
                  text: "LOC_UI_TECH_RESEARCH_EMPTY"
                }));
                return _el$5;
              })();
            },
            children: (node) => createComponent(TechChooserItem, {
              get node() {
                return node();
              },
              onSelect: handleSelect
            })
          }), null);
          return _el$;
        }
      }), (() => {
        var _el$4 = _tmpl$2();
        insert(_el$4, createComponent(L10n.Compose, {
          text: "LOC_UI_TECH_AVAILABLE_HEADER"
        }));
        return _el$4;
      })(), createComponent(ScrollArea, {
        "class": "flex-1",
        get children() {
          return createComponent(For, {
            get each() {
              return allNodes();
            },
            children: (node) => createComponent(TechChooserItem, {
              node,
              onSelect: handleSelect
            })
          });
        }
      }), createComponent(Button, {
        name: "OpenFullTree",
        "class": "mx-8 mt-3 mb-6 uppercase",
        get classList() {
          return {
            hidden: IsControllerActive()
          };
        },
        audio: {
          group: "audio-screen-tech-tree-chooser",
          onFocus: "tech-tree-chooser-focus"
        },
        get disableFocus() {
          return IsControllerActive();
        },
        hotkeyAction: "shell-action-1",
        navTrayText: "LOC_UI_TECH_VIEW_FULL_PROG_TREE",
        onActivate: handleOpenFullTree,
        get children() {
          return createComponent(L10n.Compose, {
            text: "LOC_UI_TECH_VIEW_FULL_PROG_TREE"
          });
        }
      })];
    }
  });
};
window.addEventListener("hotkey-open-techs", () => {
  if (ContextManager.isCurrentClass("screen-tech-tree-chooser")) {
    ContextManager.pop("screen-tech-tree-chooser");
  } else {
    ContextManager.push("screen-tech-tree-chooser", {
      singleton: true
    });
  }
});
defineLegacyComponent("screen-tech-tree-chooser", {
  classNames: ["screen-tech-tree-chooser", "flex"],
  tabIndex: 0
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Shell);
  return createComponent(TechTreeChooser, {});
});
ComponentUtilities.loadStyles(style);
//# sourceMappingURL=tech-chooser.js.map
