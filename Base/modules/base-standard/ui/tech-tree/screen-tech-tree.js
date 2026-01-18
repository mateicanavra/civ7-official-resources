import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { T as TechTree } from './model-tech-tree.chunk.js';
import { TreeCardHoveredEventName, TreeCardDehoveredEventName, TreeCardActivatedEventName } from '../tree-grid/tree-card.js';
import { T as TreeSupport, a as TreeGridDirection } from '../tree-grid/tree-support.chunk.js';
import { s as styles } from '../tree-grid/tree-components.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../tree-grid/tree-grid.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/graph-layout/layout.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../utilities/utilities-textprovider.chunk.js';
import '../utilities/utilities-tags.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';

const content = "<fxs-subsystem-frame\r\n\tno-scroll=\"true\"\r\n\tclass=\"items-center justify-center flex-auto\"\r\n\tdata-audio-showing=\"data-audio-window-overlay-open\"\r\n\tdata-audio-shown=\"tech-tree-chooser-panel-shown\"\r\n\tdata-audio-hidden=\"tech-tree-chooser-panel-hidden\"\r\n\tdata-audio-close-ref=\"data-audio-tech-tree-progression-close\"\r\n>\r\n\t<div class=\"flex flex-auto flex-col relative\">\r\n\t\t<fxs-header\r\n\t\t\tdata-slot=\"header\"\r\n\t\t\tclass=\"uppercase text-center tracking-100 mb-2 font-title-xl text-secondary\"\r\n\t\t\ttitle=\"LOC_UI_TECH_TREE_TITLE\"\r\n\t\t\tfiligree-style=\"h3\"\r\n\t\t>\r\n\t\t</fxs-header>\r\n\t\t<div\r\n\t\t\tid=\"tech-tree-content-container\"\r\n\t\t\tclass=\"flex flex-col flex-auto pb-5\"\r\n\t\t></div>\r\n\t</div>\r\n</fxs-subsystem-frame>\r\n";

class ScreenTechTree extends Panel {
  isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
  viewTechProgressionTreeListener = this.onViewProgressionTree.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  closeListener = this.close.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onCardActivateListener = this.onCardActivate.bind(this);
  onCardHoverListener = this.onCardHover.bind(this);
  onCardDehoverListener = this.onCardDehover.bind(this);
  startResearchButtonActivateListener = this.onStartResearchButtonActivate.bind(this);
  selectedNode;
  selectedLevel = 0;
  previousSelectedNode;
  frame;
  cardDetailContainer;
  contentContainer;
  treeDetail;
  startResearchButton;
  cardScaling = null;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    this.Root.setAttribute("data-audio-group-ref", "audio-screen-tech-tree");
    super.onAttach();
    window.addEventListener("view-tech-progression-tree", this.viewTechProgressionTreeListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.frame = MustGetElement("fxs-subsystem-frame", this.Root);
    if (this.isMobileViewExperience) {
      this.frame.setAttribute("box-style", "fullscreen");
      this.frame.setAttribute("outside-safezone-mode", "full");
      waitForLayout(() => this.frame.classList.remove("pb-10"));
    }
    this.contentContainer = MustGetElement("#tech-tree-content-container", this.Root);
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const availableTechTree = player.Techs?.getTreeType();
      if (availableTechTree == void 0) {
        console.error("screen-tech-tree: onAttach(): Error getting progression trees");
      }
    }
    const closebutton = document.querySelector(".tech-tree-hex-grid-close");
    if (closebutton) {
      closebutton.addEventListener("action-activate", this.closeListener);
    }
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.frame.addEventListener("subsystem-frame-close", this.closeListener);
    engine.on("TechTreeChanged", this.onTechUpdated, this);
    engine.on("TechTargetChanged", this.onTechTargetUpdated, this);
    TechTree.updateGate.call("onAttach");
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.realizeFocus();
  }
  realizeFocus() {
    const panelCategoryContainer = this.Root.querySelector("#tech-category-container");
    if (!panelCategoryContainer) {
      console.warn("screen-tech-tree: onReceiveFocus(): No tech category container found, focus is not posible");
      return;
    }
    const selectedElement = this.Root.querySelector(
      `tree-card[type="${this.selectedNode}"]`
    );
    if (selectedElement) {
      Focus.setContextAwareFocus(selectedElement, this.Root);
    } else {
      Focus.setContextAwareFocus(panelCategoryContainer, this.Root);
    }
  }
  onTechUpdated(data) {
    if (data.player && data.player != GameContext.localPlayerID) {
      return;
    }
    TechTree.updateGate.call("onTechUpdated");
  }
  onTechTargetUpdated(data) {
    if (data.player && data.player != GameContext.localPlayerID) {
      return;
    }
    TechTree.updateGate.call("onTechTargetUpdated");
  }
  onDetach() {
    window.removeEventListener("view-tech-progression-tree", this.viewTechProgressionTreeListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("TechTreeChanged", this.onTechUpdated, this);
    engine.off("TechTargetChanged", this.onTechTargetUpdated, this);
    if (this.cardScaling) {
      this.cardScaling.removeListeners();
    }
    super.onDetach();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  cleanPreviousSelectedNode() {
    if (this.previousSelectedNode != void 0) {
      const selectedElement = this.Root.querySelector(
        `tree-card[type="${this.previousSelectedNode}"]`
      );
      if (selectedElement) {
        selectedElement.classList.remove("selected");
      } else {
        console.warn(
          "screen-tech-tree: cleanPreviousSelectedNode(): Previous selected rectangular card not found"
        );
      }
    }
  }
  onViewProgressionTree(event) {
    this.refreshProgressionTree(event.detail.treeCSV, event.detail.targetNode, event.detail.iconCallback);
  }
  refreshProgressionTree(treesCSV, targetNode, iconCallback) {
    if (iconCallback) {
      TechTree.iconCallback = iconCallback;
    }
    TechTree.sourceProgressionTrees = treesCSV;
    while (this.contentContainer.hasChildNodes()) {
      this.contentContainer.removeChild(this.contentContainer.lastChild);
    }
    const panelCategoryContainer = document.createElement("fxs-slot");
    panelCategoryContainer.id = "tech-category-container";
    panelCategoryContainer.classList.add("flex-auto", "items-center", "w-full", "flex", "relative");
    this.createPanelContent(panelCategoryContainer);
    this.contentContainer.appendChild(panelCategoryContainer);
    if (targetNode) {
      this.refreshDetailsPanel(targetNode);
    }
    waitForLayout(() => this.realizeFocus());
  }
  createPanelContent(container) {
    const tree = `g_TechTree.tree`;
    const { scrollable, cardScaling } = TreeSupport.getGridElement(
      tree,
      TreeGridDirection.HORIZONTAL,
      this.createCard.bind(this)
    );
    this.cardScaling = cardScaling;
    if (TreeSupport.isSmallScreen()) {
      scrollable.setAttribute("handle-gamepad-pan", "false");
    }
    this.cardDetailContainer = document.createElement("div");
    this.cardDetailContainer.classList.add(
      `card-detail-container`,
      "p-4",
      "pointer-events-none",
      "items-end",
      "w-96",
      "flex-col",
      "items-center",
      "max-h-full"
    );
    this.cardDetailContainer.classList.toggle("w-128", this.isMobileViewExperience);
    this.cardDetailContainer.classList.toggle("w-96", !this.isMobileViewExperience);
    container.appendChild(scrollable);
    container.appendChild(this.cardDetailContainer);
  }
  createCard(container) {
    const cardElement = document.createElement("tree-card");
    Databind.if(cardElement, "card.hasData");
    Databind.attribute(cardElement, "dummy", "card.isDummy");
    Databind.attribute(cardElement, "type", "card.nodeType");
    Databind.attribute(cardElement, "name", "card.name");
    Databind.attribute(cardElement, "progress", "card.progressPercentage");
    Databind.attribute(cardElement, "turns", "card.turns");
    Databind.attribute(cardElement, "queue-order", "card.queueOrder");
    Databind.attribute(cardElement, "unlocks-by-depth", "card.unlocksByDepthString");
    cardElement.setAttribute("tooltip-type", "tech-tree");
    cardElement.setAttribute("tree-type", "tech");
    cardElement.setAttribute("data-audio-group-ref", "audio-screen-tech-tree-chooser");
    cardElement.setAttribute("data-audio-activate-ref", "none");
    cardElement.setAttribute("data-audio-focus", "tech-tree-full-focus");
    Databind.classToggle(cardElement, "locked", "card.isLocked");
    Databind.classToggle(cardElement, "queued", "card.isQueued");
    cardElement.addEventListener(TreeCardHoveredEventName, this.onCardHoverListener);
    cardElement.addEventListener(TreeCardDehoveredEventName, this.onCardDehoverListener);
    cardElement.addEventListener(TreeCardActivatedEventName, this.onCardActivateListener);
    container.appendChild(cardElement);
  }
  refreshDetailsPanel(nodeId, level = "0") {
    this.previousSelectedNode = this.selectedNode;
    this.selectedNode = nodeId;
    this.selectedLevel = +level;
    this.cleanPreviousSelectedNode();
    this.updateTreeDetail(nodeId, level);
    const selectedElement = this.Root.querySelector(
      `tree-card[type="${this.selectedNode}"]`
    );
    selectedElement?.classList.add("selected");
    this.refreshNavTray();
  }
  updateTreeDetail(nodeId, level) {
    if (!this.treeDetail) {
      if (!this.cardDetailContainer) {
        console.error(
          "screen-tech-tree: refreshDetailsPanel(): detailCardsContainer '.card-detail-container' couldn't be found"
        );
        return;
      }
      this.treeDetail = document.createElement("tree-detail");
      this.treeDetail.classList.add("max-w-full", "w-full", "h-full");
      this.cardDetailContainer.appendChild(this.treeDetail);
      this.startResearchButton = document.createElement("fxs-button");
      this.startResearchButton.classList.add("mt-6");
      this.startResearchButton.setAttribute("caption", "LOC_UI_TREE_START_RESEARCH");
      this.startResearchButton.addEventListener("action-activate", this.startResearchButtonActivateListener);
      this.cardDetailContainer.appendChild(this.startResearchButton);
      waitForLayout(() => {
        const treeDetailScrollable = this.treeDetail?.maybeComponent?.scrollable?.maybeComponent;
        treeDetailScrollable?.setEngineInputProxy(this.Root);
        if (!this.treeDetail?.isConnected && this.cardDetailContainer) {
          this.cardDetailContainer.appendChild(this.treeDetail);
        }
      });
    }
    const node = TechTree.getCard(nodeId);
    if (node == void 0) {
      console.error(
        "screen-tech-tree: updateTreeDetail(): Node with id " + nodeId + " couldn't be found on the grid data"
      );
      return;
    }
    const { isCompleted, isCurrent } = node.unlocksByDepth?.[+level] ?? {};
    this.startResearchButton?.classList.toggle(
      "hidden",
      isCompleted || isCurrent || !ActionHandler.isTouchActive || ActionHandler.isGamepadActive
    );
    this.startResearchButton?.setAttribute("type", nodeId);
    this.startResearchButton?.setAttribute("level", level);
    this.treeDetail.setAttribute("name", node.name);
    this.treeDetail.setAttribute("icon", node.icon);
    this.treeDetail.setAttribute("level", level);
    this.treeDetail.setAttribute("progress", `${node.progressPercentage}`);
    this.treeDetail.setAttribute("turns", `${node.turns}`);
    this.treeDetail.setAttribute("unlocks-by-depth", node.unlocksByDepthString);
  }
  close() {
    super.close();
  }
  refreshNavTray() {
    NavTray.addOrUpdateGenericBack();
    const canActivateItem = this.canActivateItem();
    if (canActivateItem) {
      NavTray.addOrUpdateAccept("LOC_UI_TREE_START_RESEARCH");
    } else {
      NavTray.addOrUpdateAccept("LOC_UI_TREE_START_SELECT");
    }
  }
  canActivateItem() {
    if (this.selectedNode) {
      const nodeIndex = +this.selectedNode;
      const args = { ProgressionTreeNodeType: nodeIndex };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_TECH_TREE_NODE,
        args,
        false
      );
      if (result.Success) {
        return true;
      }
    }
    return false;
  }
  onActivateTechlistItem() {
    if (this.selectedNode) {
      const localPlayer = Players.get(GameContext.localPlayerID);
      if (localPlayer) {
        const targetNode = localPlayer.Techs?.getTargetNode();
        if (targetNode != void 0 && targetNode != ProgressionTreeNodeTypes.NO_NODE) {
          this.onTargetTechlistItem();
          return;
        }
      }
      const nodeIndex = +this.selectedNode;
      const args = { ProgressionTreeNodeType: nodeIndex };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_TECH_TREE_NODE,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.SET_TECH_TREE_NODE,
          args
        );
      }
    }
  }
  onTargetTechlistItem() {
    if (this.selectedNode) {
      const nodeIndex = +this.selectedNode;
      const args = { ProgressionTreeNodeType: nodeIndex };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
        args,
        false
      );
      if (result.Success) {
        if (this.selectedNode != ProgressionTreeNodeTypes.NO_NODE) {
          const result2 = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.SET_TECH_TREE_NODE,
            args,
            false
          );
          if (result2.Success) {
            Game.PlayerOperations.sendRequest(
              GameContext.localPlayerID,
              PlayerOperationTypes.SET_TECH_TREE_NODE,
              args
            );
          }
        }
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
          args
        );
      }
    }
  }
  onActiveDeviceTypeChanged() {
    this.refreshNavTray();
    this.cleanPreviousSelectedNode();
    if (this.selectedNode) {
      this.updateTreeDetail(`${this.selectedNode}`, `${this.selectedLevel}`);
    }
  }
  onCardActivate(event) {
    const { type, level } = event.detail;
    if (ActionHandler.isTouchActive && TreeSupport.isSmallScreen()) {
      this.handleCardHover(type, level);
      this.refreshDetailsPanel(type, level);
      return;
    }
    this.handleCardActivate(type, level);
  }
  handleCardActivate(type, level) {
    if (this.canActivateItem()) {
      this.onActivateTechlistItem();
    } else {
      this.onTargetTechlistItem();
    }
    if (this.selectedNode) {
      const card = TechTree.getCard(this.selectedNode.toString());
      if (card) {
        const node = GameInfo.ProgressionTreeNodes.lookup(card.nodeType);
        if (node) {
          const event = "tech-tree-activate-" + node.ProgressionTreeNodeType + "_" + level;
          UI.sendAudioEvent(event);
        } else {
          Audio.playSound("data-audio-tech-tree-activate", "audio-screen-tech-tree-chooser");
        }
      } else {
        Audio.playSound("data-audio-tech-tree-activate", "audio-screen-tech-tree-chooser");
      }
    }
    this.refreshDetailsPanel(type, level);
  }
  onCardHover(event) {
    this.handleCardHover(event.detail.type, event.detail.level);
  }
  handleCardHover(type, level) {
    this.refreshDetailsPanel(type, level);
    if (this.selectedNode) {
      this.handleCardDehover();
      const nodeIndex = +this.selectedNode;
      const highlightList = TechTree.hoverItems(nodeIndex);
      if (highlightList) {
        Audio.playSound("data-audio-queue-hover", "audio-screen-tech-tree");
        for (let index = 0; index < highlightList.length; index++) {
          const setElement = this.Root.querySelector(
            `tree-card[type="${highlightList[index]}"]`
          );
          setElement?.classList.add("hoverqueued");
        }
      }
    } else {
      this.handleCardDehover();
    }
  }
  onCardDehover(_event) {
    this.handleCardDehover();
  }
  handleCardDehover() {
    const clearList = TechTree.clearHoverItems();
    if (clearList) {
      for (let index = 0; index < clearList.length; index++) {
        const clearElement = this.Root.querySelector(
          `tree-card[type="${clearList[index]}"]`
        );
        clearElement?.classList.remove("hoverqueued");
      }
    }
  }
  onStartResearchButtonActivate({ target }) {
    const nodeId = target.getAttribute("type") ?? "";
    const level = target.getAttribute("level") ?? "0";
    this.handleCardActivate(nodeId, level);
    target.classList.add("hidden");
  }
}
Controls.define("screen-tech-tree", {
  createInstance: ScreenTechTree,
  description: "Grid screen for techs.",
  classNames: ["screen-tech-tree", "screen-tree"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-tech-tree.js.map
