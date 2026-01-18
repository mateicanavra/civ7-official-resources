import TooltipManager from '../../../core/ui/tooltips/tooltip-manager.js';
import { RecursiveGetAttribute } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { a as CultureTreeModel, C as CultureTree } from '../culture-tree/model-culture-tree.chunk.js';
import { a as CultureTreeChooserModel, C as CultureTreeChooser } from '../culture-tree-chooser/model-culture-tree-chooser.chunk.js';
import { T as TechTree } from '../tech-tree/model-tech-tree.chunk.js';
import { T as TechTreeChooser } from '../tech-tree-chooser/model-tech-tree-chooser.chunk.js';
import { T as TreeSupport, c as TreeNodesSupport } from '../tree-grid/tree-support.chunk.js';
import { A as AdvisorUtilities } from '../tutorial/tutorial-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../tree-grid/tree-grid.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/graph-layout/layout.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../utilities/utilities-textprovider.chunk.js';
import '../utilities/utilities-tags.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-item.js';
import '../tutorial/tutorial-manager.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../tutorial/tutorial-events.chunk.js';

const getWonderPlayerId = (wonderType) => {
  wonderType = typeof wonderType == "string" ? Database.makeHash(wonderType) : wonderType;
  if (GameInfo.Wonders.lookup(wonderType)?.MaxWorldInstances === 1) {
    const players = Players.getEverAlive();
    for (const player of players) {
      const playerConstructibles = player.Constructibles;
      if (!playerConstructibles) {
        console.error("tech-civic-tooltip: In getWonderPlayerId player.Constructibles was null");
        continue;
      }
      const wonders = playerConstructibles.getWonders(player.id);
      if (!wonders) continue;
      for (const wonder of wonders) {
        const constructible = Constructibles.getByComponentID(wonder);
        if (constructible?.type === wonderType && constructible?.complete) {
          return player.id;
        }
      }
    }
  }
  return null;
};
class TechCivicTooltipType {
  model;
  fragment = document.createDocumentFragment();
  tooltip = null;
  hoveredNodeID = null;
  constructor(model) {
    this.model = model;
  }
  getHTML() {
    this.tooltip = document.createElement("fxs-tooltip");
    this.tooltip.classList.add("tech-civic-tooltip");
    this.tooltip.appendChild(this.fragment);
    return this.tooltip;
  }
  reset() {
    this.fragment = document.createDocumentFragment();
    while (this.tooltip?.hasChildNodes()) {
      this.tooltip.removeChild(this.tooltip.lastChild);
    }
  }
  isUpdateNeeded(target) {
    const nodeIDString = RecursiveGetAttribute(target, "node-id") ?? "";
    if (!nodeIDString) {
      this.hoveredNodeID = null;
      if (!this.fragment) {
        return true;
      }
      return false;
    }
    if (nodeIDString != this.hoveredNodeID || nodeIDString == this.hoveredNodeID && !this.fragment) {
      this.hoveredNodeID = nodeIDString;
      return true;
    }
    return false;
  }
  update() {
    if (!this.hoveredNodeID) {
      console.error(
        "tech-civic-tooltip: Attempting to update Tech/Civic info tooltip, but unable to get selected node"
      );
      return;
    }
    const node = this.model.findNode(this.hoveredNodeID);
    if (!node) {
      console.error(
        "tech-civic-tooltip: Attempting to update Tech/Civic info tooltip, but unable to get selected node"
      );
      return;
    }
    const headerContainer = document.createElement("div");
    headerContainer.classList.add("tech-civic-tooltip__header-container");
    const headerTooltip = document.createElement("div");
    headerTooltip.classList.add("mb-1", "text-secondary", "text-sm", "font-title", "uppercase", "tracking-100");
    headerTooltip.setAttribute("data-l10n-id", node.name);
    headerContainer.appendChild(headerTooltip);
    const unlocksContainer = document.createElement("div");
    unlocksContainer.classList.add("tech-civic-tooltip__unlocks-container");
    node.unlocksByDepth?.forEach((unlockDepth) => {
      if (!unlockDepth.isCurrent) {
        return;
      }
      unlockDepth.unlocks.forEach((unlock) => {
        const unlockItem = document.createElement("div");
        unlockItem.classList.add("unlock-item");
        const unlockItemIcon = document.createElement("div");
        unlockItemIcon.classList.add("unlock-item-icon");
        const unlockItemIconBG = document.createElement("div");
        unlockItemIconBG.classList.add("unlock-item-icon-bg");
        unlockItemIcon.appendChild(unlockItemIconBG);
        const unlockItemIconImg = document.createElement("img");
        unlockItemIconImg.classList.add("unlock-item-icon-img");
        unlockItemIconImg.setAttribute("src", unlock.icon);
        unlockItemIcon.appendChild(unlockItemIconImg);
        const unlockItemContent = document.createElement("div");
        unlockItemContent.classList.add("unlock-item-content", "text-xs", "leading-normal", "mb-3");
        const unlockNameLine = document.createElement("div");
        unlockNameLine.classList.add("flex");
        const unlockItemName = document.createElement("div");
        unlockItemName.classList.add("unlock-item-name");
        unlockItemName.innerHTML = unlock.name;
        unlockNameLine.appendChild(unlockItemName);
        if (unlock.kind === "KIND_CONSTRUCTIBLE") {
          const constructible = GameInfo.Constructibles.lookup(unlock.type);
          if (constructible) {
            if (constructible.ConstructibleClass == "WONDER") {
              const owningPlayerId = getWonderPlayerId(unlock.type);
              if (owningPlayerId != null) {
                const text = owningPlayerId === GameContext.localPlayerID ? "LOC_UI_TREE_WONDER_BUILT_BY_YOU" : "LOC_UI_TREE_WONDER_BUILT_BY_OTHER";
                const unlockItemNamePlayerBuildText = document.createElement("div");
                unlockItemNamePlayerBuildText.classList.add(
                  "ml-2",
                  "text-secondary",
                  "text-uppercase",
                  "text-xs",
                  "font-body",
                  "font-bold",
                  "tracking-25",
                  "flex",
                  "flex-auto"
                );
                unlockItemNamePlayerBuildText.setAttribute("data-l10n-id", text);
                unlockNameLine.appendChild(unlockItemNamePlayerBuildText);
              }
            }
          }
        }
        const unlockItemDesc = document.createElement("div");
        unlockItemDesc.innerHTML = unlock.description;
        unlockItemContent.appendChild(unlockNameLine);
        unlockItemContent.appendChild(unlockItemDesc);
        unlockItem.appendChild(unlockItemIcon);
        unlockItem.appendChild(unlockItemContent);
        unlocksContainer.appendChild(unlockItem);
      });
    });
    const costAmount = node.cost?.toString() || "";
    const costContainer = document.createElement("div");
    let costIcon = "[icon:YIELD_SCIENCE]";
    if (this.model instanceof CultureTreeChooserModel) {
      costIcon = "[icon:YIELD_CULTURE]";
    }
    const yieldType = Locale.stylize("LOC_CARD_COST", `${costAmount}${costIcon}`);
    costContainer.classList.add("ml-2", "text-xs", "font-body", "tracking-25", "flex", "flex-auto", "mb-4");
    costContainer.setAttribute("data-l10n-id", `${yieldType}`);
    unlocksContainer.appendChild(costContainer);
    const gemsContainer = document.createElement("div");
    if (node.recommendations) {
      const headerTooltipDividerGems = document.createElement("div");
      headerTooltipDividerGems.classList.add("subheader__divider--center");
      gemsContainer.appendChild(headerTooltipDividerGems);
      const recommendationTooltipContent = AdvisorUtilities.createAdvisorRecommendationTooltip(
        node.recommendations
      );
      recommendationTooltipContent.classList.add("text-xs");
      gemsContainer.appendChild(recommendationTooltipContent);
    }
    this.fragment.appendChild(headerContainer);
    this.fragment.appendChild(unlocksContainer);
    this.fragment.appendChild(gemsContainer);
  }
  isBlank() {
    return false;
  }
}
class TreeTooltipType {
  model;
  fragment = document.createDocumentFragment();
  tooltip = null;
  hoveredNodeID = null;
  level = null;
  constructor(model) {
    this.model = model;
  }
  getHTML() {
    this.tooltip = document.createElement("fxs-tooltip");
    this.tooltip.classList.add("tech-tree-tooltip");
    this.tooltip.appendChild(this.fragment);
    return this.tooltip;
  }
  reset() {
    this.fragment = document.createDocumentFragment();
    while (this.tooltip?.hasChildNodes()) {
      this.tooltip.removeChild(this.tooltip.lastChild);
    }
  }
  isUpdateNeeded(target) {
    const nodeIDString = target.getAttribute("type");
    const level = target.getAttribute("level");
    let levelNum = 0;
    if (level) {
      levelNum = +level;
    }
    if (!nodeIDString) {
      this.hoveredNodeID = null;
      if (!this.fragment) {
        return true;
      }
      return false;
    }
    if (!level) {
      this.hoveredNodeID = null;
      if (!this.fragment) {
        return true;
      }
      return false;
    }
    if (nodeIDString != this.hoveredNodeID || nodeIDString == this.hoveredNodeID && !this.fragment) {
      this.hoveredNodeID = nodeIDString;
      return true;
    }
    if (levelNum != this.level || levelNum == this.level && !this.fragment) {
      this.level = levelNum;
      return true;
    }
    return false;
  }
  update() {
    if (!this.hoveredNodeID) {
      console.error(
        "tech-tree-tooltip: Attempting to update Tech/Civic info tooltip, but unable to get selected node"
      );
      return;
    }
    const node = this.model.findNode(this.hoveredNodeID);
    if (!node) {
      console.error(
        "tech-tree-tooltip: Attempting to update Tech/Civic info tooltip, but unable to get selected node"
      );
      return;
    }
    if (TreeSupport.isSmallScreen()) {
      return;
    }
    let index = 0;
    if (this.level) {
      index = this.level;
    }
    const headerContainer = document.createElement("div");
    headerContainer.classList.add("tech-tree-tooltip__header-container");
    const headerTooltip = document.createElement("div");
    headerTooltip.classList.add("mb-1", "text-secondary", "text-sm", "font-title", "uppercase", "tracking-100");
    headerTooltip.setAttribute("data-l10n-id", index > 0 ? "LOC_UI_TREE_MASTERY" : node.name);
    const stateText = document.createElement("div");
    stateText.classList.add("mb-1", "text-secondary", "text-xs", "font-body", "tracking-100");
    headerContainer.appendChild(headerTooltip);
    headerContainer.appendChild(stateText);
    const unlocksContainer = document.createElement("div");
    unlocksContainer.classList.add("tech-tree-tooltip__unlocks-container");
    if (!node.unlocksByDepth) {
      console.error("tech-tree-tooltip: No unlocks for node: " + this.hoveredNodeID);
      return;
    }
    const depth = node.unlocksByDepth[index];
    if (depth) {
      stateText.textContent = TreeNodesSupport.getUnlocksByDepthStateText(depth);
      depth.unlocks.forEach((unlock) => {
        const unlockItem = document.createElement("div");
        unlockItem.classList.add("unlock-item");
        const unlockItemIcon = document.createElement("div");
        unlockItemIcon.classList.add("unlock-item-icon");
        const unlockItemIconBG = document.createElement("div");
        unlockItemIconBG.classList.add("unlock-item-icon-bg");
        unlockItemIcon.appendChild(unlockItemIconBG);
        const unlockItemIconImg = document.createElement("img");
        unlockItemIconImg.classList.add("unlock-item-icon-img");
        unlockItemIconImg.setAttribute("src", unlock.icon);
        unlockItemIcon.appendChild(unlockItemIconImg);
        const unlockItemContent = document.createElement("div");
        unlockItemContent.classList.add("unlock-item-content", "text-xs", "leading-normal", "mb-3");
        const unlockNameLine = document.createElement("div");
        unlockNameLine.classList.add("flex");
        const unlockItemName = document.createElement("div");
        unlockItemName.classList.add("unlock-item-name");
        unlockItemName.innerHTML = unlock.name;
        unlockNameLine.appendChild(unlockItemName);
        if (unlock.kind === "KIND_CONSTRUCTIBLE") {
          const constructible = GameInfo.Constructibles.lookup(unlock.type);
          if (constructible) {
            if (constructible.ConstructibleClass == "WONDER") {
              const owningPlayerId = getWonderPlayerId(unlock.type);
              if (owningPlayerId != null) {
                const text = owningPlayerId === GameContext.localPlayerID ? "LOC_UI_TREE_WONDER_BUILT_BY_YOU" : "LOC_UI_TREE_WONDER_BUILT_BY_OTHER";
                const unlockItemNamePlayerBuildText = document.createElement("div");
                unlockItemNamePlayerBuildText.classList.add(
                  "ml-2",
                  "text-secondary",
                  "text-uppercase",
                  "text-xs",
                  "font-body",
                  "font-bold",
                  "tracking-25",
                  "flex",
                  "flex-auto"
                );
                unlockItemNamePlayerBuildText.setAttribute("data-l10n-id", text);
                unlockNameLine.appendChild(unlockItemNamePlayerBuildText);
              }
            }
          }
        }
        const unlockItemDesc = document.createElement("div");
        unlockItemDesc.innerHTML = unlock.description;
        unlockItemContent.appendChild(unlockNameLine);
        unlockItemContent.appendChild(unlockItemDesc);
        unlockItem.appendChild(unlockItemIcon);
        unlockItem.appendChild(unlockItemContent);
        unlocksContainer.appendChild(unlockItem);
      });
    }
    const costAmount = node.cost?.toString() || "";
    const costContainer = document.createElement("div");
    let costIcon = "[icon:YIELD_SCIENCE]";
    if (this.model instanceof CultureTreeModel) {
      costIcon = "[icon:YIELD_CULTURE]";
    }
    const yieldType = Locale.stylize("LOC_CARD_COST", `${costAmount}${costIcon}`);
    costContainer.classList.add("ml-2", "text-xs", "font-body", "tracking-25", "flex", "flex-auto", "mb-4");
    costContainer.setAttribute("data-l10n-id", `${yieldType}`);
    unlocksContainer.appendChild(costContainer);
    this.fragment.appendChild(headerContainer);
    this.fragment.appendChild(unlocksContainer);
  }
  isBlank() {
    return TreeSupport.isSmallScreen();
  }
}
TooltipManager.registerType("tech", new TechCivicTooltipType(TechTreeChooser));
TooltipManager.registerType("culture", new TechCivicTooltipType(CultureTreeChooser));
TooltipManager.registerType("culture-tree", new TreeTooltipType(CultureTree));
TooltipManager.registerType("tech-tree", new TreeTooltipType(TechTree));
//# sourceMappingURL=tech-civic-tooltip.js.map
