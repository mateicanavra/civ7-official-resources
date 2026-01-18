import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { a as formatStringArrayAsNewLineText } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { c as TreeNodesSupport } from '../tree-grid/tree-support.chunk.js';
import { A as AdvisorUtilities } from '../tutorial/tutorial-support.chunk.js';
import { c as getNodeName, g as getUnlockTargetName, b as getUnlockTargetIcon, a as getUnlockTargetDescriptions } from '../utilities/utilities-textprovider.chunk.js';

class TechTreeChooserModel {
  _Player = PlayerIds.NO_PLAYER;
  Nodes = [];
  ResearchedNodes = [];
  InProgressNodes = [];
  _subject = new Subject(this);
  techHotkeyListener = () => {
    this.onTechHotkey();
  };
  constructor() {
    engine.whenReady.then(() => {
      this.playerId = GameContext.localPlayerID;
      engine.on("LocalPlayerTurnBegin", () => {
        this.playerId = GameContext.localPlayerID;
      });
      engine.on("LocalPlayerChanged", () => {
        this.playerId = GameContext.localPlayerID;
      });
      const techsUpdatesOrPlayerTurnListener = (data) => {
        if (data && data.player !== GameContext.localPlayerID) return;
        this.update();
      };
      engine.on("ScienceYieldChanged", techsUpdatesOrPlayerTurnListener);
      engine.on("TechTreeChanged", techsUpdatesOrPlayerTurnListener);
      engine.on("TechTargetChanged", techsUpdatesOrPlayerTurnListener);
      engine.on("TechNodeCompleted", techsUpdatesOrPlayerTurnListener);
      engine.on("PlayerTurnActivated", techsUpdatesOrPlayerTurnListener);
      window.addEventListener("hotkey-open-techs", this.techHotkeyListener);
      this.update();
    });
  }
  get subject() {
    return this._subject;
  }
  set playerId(player) {
    if (this._Player != player) {
      this._Player = player;
      this.update();
    }
  }
  get playerId() {
    return this._Player;
  }
  get player() {
    return Players.get(this.playerId);
  }
  get nodes() {
    return this.Nodes ?? [];
  }
  get inProgressNodes() {
    return this.InProgressNodes ?? [];
  }
  get hasCurrentResearch() {
    return this.InProgressNodes.length > 0;
  }
  get currentResearchEmptyTitle() {
    return Locale.compose("LOC_UI_TECH_RESEARCH_EMPTY");
  }
  update() {
    this.Nodes = [];
    this.ResearchedNodes = [];
    this.InProgressNodes = [];
    const player = Players.get(this.playerId);
    if (!player) return;
    let currentResearchIndex;
    const techs = player.Techs;
    if (techs) {
      const techTreeType = techs.getTreeType();
      const treeObject = Game.ProgressionTrees.getTree(player.id, techTreeType);
      if (treeObject) {
        currentResearchIndex = treeObject.nodes[treeObject.activeNodeIndex]?.nodeType;
      }
    }
    const availableNodes = player.Techs?.getAllAvailableNodeTypes();
    if (availableNodes) {
      for (const eNode of availableNodes) {
        const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(eNode);
        if (!nodeInfo) {
          continue;
        }
        const nodeData = Game.ProgressionTrees.getNode(this.playerId, eNode);
        if (!nodeData) {
          continue;
        }
        const uiNodeData = this.buildUINodeInfo(nodeInfo, nodeData);
        this.Nodes.push(uiNodeData);
        if (currentResearchIndex && currentResearchIndex == nodeData.nodeType) {
          this.InProgressNodes.push(uiNodeData);
        }
      }
    }
    const researchedNodes = player.Techs?.getResearched();
    if (researchedNodes) {
      researchedNodes.forEach((eNode) => {
        const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(eNode.type);
        if (nodeInfo) {
          const nodeData = Game.ProgressionTrees.getNode(this.playerId, eNode.type);
          if (nodeData) {
            const uiNodeData = this.buildUINodeInfo(nodeInfo, nodeData);
            this.ResearchedNodes.push(uiNodeData);
          }
        } else {
          console.error(`model-tech-tree-chooser: couldn't get info for node type ${eNode.type}`);
        }
      });
    }
    this._subject.value = this;
  }
  chooseNode(nodeId) {
    const nodeIndex = +nodeId;
    const args = { ProgressionTreeNodeType: nodeIndex };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.SET_TECH_TREE_NODE,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.SET_TECH_TREE_NODE, args);
      const nodeData = Game.ProgressionTrees.getNode(this.playerId, nodeIndex);
      if (nodeData) {
        const node = GameInfo.ProgressionTreeNodes.lookup(
          nodeData.nodeType
        );
        if (node) {
          const event = "tech-tree-activate-" + node.ProgressionTreeNodeType + "_" + nodeData.depthUnlocked;
          UI.sendAudioEvent(event);
        } else {
          Audio.playSound("data-audio-tech-tree-activate", "audio-screen-tech-tree-chooser");
        }
      } else {
        Audio.playSound("data-audio-tech-tree-activate", "audio-screen-tech-tree-chooser");
      }
    }
  }
  buildUINodeInfo(nodeInfo, nodeData) {
    const player = this.player;
    const nodeType = nodeData.nodeType;
    const nodeName = getNodeName(nodeData);
    const nodeDesc = Locale.compose(nodeInfo.Description ?? "");
    const turnsLeft = player ? player.Techs ? player.Techs.getTurnsForNode(nodeType) : -1 : -1;
    const unlocksData = [];
    const unlocksByDepth = [];
    const treeNodeUnlocks = TreeNodesSupport.getValidNodeUnlocks(nodeData);
    const removableUnlocks = TreeNodesSupport.getRepeatedUniqueUnits(treeNodeUnlocks);
    for (const i of nodeData.unlockIndices) {
      const unlockInfo = GameInfo.ProgressionTreeNodeUnlocks[i];
      if (unlockInfo && !unlockInfo.Hidden) {
        if (unlockInfo.TargetKind == "KIND_UNIT") {
          const player2 = Players.get(GameContext.localPlayerID);
          if (player2 && player2.Units?.isBuildPermanentlyDisabled(unlockInfo.TargetType)) {
            continue;
          }
          if (removableUnlocks.includes(unlockInfo.TargetType)) {
            continue;
          }
        }
        const unlockName = getUnlockTargetName(unlockInfo.TargetType, unlockInfo.TargetKind);
        const unlockIcon = getUnlockTargetIcon(unlockInfo.TargetType, unlockInfo.TargetKind);
        const unlockDescriptions = getUnlockTargetDescriptions(
          unlockInfo.TargetType,
          unlockInfo.TargetKind
        );
        const unlockFullDesc = formatStringArrayAsNewLineText(unlockDescriptions);
        const unlockToolTip = unlockName.length ? unlockName : unlockFullDesc;
        if (!unlockFullDesc && !unlockName) {
          continue;
        }
        const nodeUIDisplayData = {
          name: unlockName,
          icon: unlockIcon,
          description: Locale.stylize(unlockFullDesc),
          depth: unlockInfo.UnlockDepth,
          tooltip: unlockToolTip,
          kind: unlockInfo.TargetKind,
          type: unlockInfo.TargetType
        };
        unlocksData.push(nodeUIDisplayData);
        while (unlocksByDepth.length < unlockInfo.UnlockDepth) {
          const currentDepth = Locale.toRomanNumeral(unlocksByDepth.length + 1);
          const isCompleted = unlocksByDepth.length < nodeData.depthUnlocked;
          const isCurrent = unlocksByDepth.length == nodeData.depthUnlocked;
          let unlockHeader;
          if (isCompleted) {
            unlockHeader = Locale.compose("LOC_UI_TECH_TREE_UNLOCK_COMPLETED_HEADER", currentDepth);
          } else if (isCurrent) {
            unlockHeader = Locale.compose("LOC_UI_TECH_TREE_UNLOCK_CURRENT_HEADER", currentDepth);
          } else {
            unlockHeader = Locale.compose("LOC_UI_TECH_TREE_UNLOCK_HEADER", currentDepth);
          }
          const depthLevel = [];
          for (let depth = 0; depth <= unlocksByDepth.length; depth++) {
            depthLevel.push({
              /*empty object for now*/
            });
          }
          const newDepth = {
            header: unlockHeader,
            unlocks: [],
            isCompleted,
            isCurrent,
            depthLevel
          };
          unlocksByDepth.push(newDepth);
        }
        unlocksByDepth[unlockInfo.UnlockDepth - 1].unlocks.push(nodeUIDisplayData);
      }
    }
    if (unlocksByDepth.length == 1) {
      unlocksByDepth[0].header = Locale.compose("LOC_UI_TECH_TREE_UNLOCK_ALL_HEADER");
    }
    const depthInfo = [];
    for (let depth = 0; depth < nodeData.maxDepth; depth++) {
      depthInfo.push(depth < nodeData.depthUnlocked);
    }
    const techRecommendations = AdvisorUtilities.getTreeRecommendations(AdvisorySubjectTypes.CHOOSE_TECH);
    const currentRecommendations = AdvisorUtilities.getTreeRecommendationIcons(
      techRecommendations,
      nodeType
    ).map((rec) => rec.class);
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    const costValue = localPlayer?.Techs?.getNodeCost(nodeType) ?? nodeInfo.Cost;
    const uiNodeData = {
      id: nodeType,
      name: nodeName,
      primaryIcon: Icon.getTechIconFromProgressionTreeNodeDefinition(nodeInfo),
      description: nodeDesc,
      turns: turnsLeft,
      unlocks: unlocksData,
      unlocksByDepth,
      currentDepthUnlocked: nodeData.depthUnlocked,
      maxDepth: nodeData.maxDepth,
      depthSlots: depthInfo,
      percentComplete: nodeData.progress,
      percentCompleteLabel: nodeData.progress.toString() + "%",
      showPercentComplete: nodeData.progress > 0,
      treeType: nodeInfo.ProgressionTree,
      isLocked: false,
      recommendations: currentRecommendations,
      cost: costValue
    };
    return uiNodeData;
  }
  getDefaultTreeToDisplay() {
    if (this.InProgressNodes.length > 0) {
      return this.InProgressNodes[0].treeType;
    } else if (this.Nodes.length > 0) {
      return this.Nodes[0].treeType;
    } else if (this.ResearchedNodes.length > 0) {
      return this.ResearchedNodes[0].treeType;
    }
    return void 0;
  }
  getDefaultNodeToDisplay() {
    if (this.InProgressNodes.length > 0) {
      return this.InProgressNodes[0].id;
    } else if (this.Nodes.length > 0) {
      return this.Nodes[0].id;
    }
    return void 0;
  }
  findNode(id) {
    return this.Nodes.find((node) => node.id == id);
  }
  onTechHotkey() {
    if (ContextManager.isCurrentClass("screen-tech-tree-chooser")) {
      ContextManager.pop("screen-tech-tree-chooser");
    } else {
      ContextManager.push("screen-tech-tree-chooser");
    }
  }
}
const TechTreeChooser = new TechTreeChooserModel();

export { TechTreeChooser as T };
//# sourceMappingURL=model-tech-tree-chooser.chunk.js.map
