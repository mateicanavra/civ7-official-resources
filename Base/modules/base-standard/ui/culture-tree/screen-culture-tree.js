import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { C as CultureTree } from './model-culture-tree.chunk.js';
import { TreeCardHoveredEventName, TreeCardDehoveredEventName, TreeCardActivatedEventName } from '../tree-grid/tree-card.js';
import { T as TreeSupport, a as TreeGridDirection } from '../tree-grid/tree-support.chunk.js';
import { s as styles } from '../tree-grid/tree-components.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
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

const content = "<fxs-subsystem-frame\r\n\tno-scroll=\"true\"\r\n\tclass=\"items-center justify-center flex-auto\"\r\n\tdata-audio-showing=\"culture-tree-chooser-panel-showing\"\r\n\tdata-audio-shown=\"culture-tree-chooser-panel-shown\"\r\n\tdata-audio-hiding=\"culture-tree-chooser-panel-hiding\"\r\n\tdata-audio-hidden=\"culture-tree-chooser-panel-hidden\"\r\n>\r\n\t<div class=\"flex flex-auto flex-col relative\">\r\n\t\t<fxs-header\r\n\t\t\tdata-slot=\"header\"\r\n\t\t\tclass=\"uppercase text-center tracking-100 mb-2 font-title-xl text-secondary\"\r\n\t\t\ttitle=\"LOC_UI_CULTURE_TREE_TITLE\"\r\n\t\t\tfiligree-style=\"h3\"\r\n\t\t>\r\n\t\t</fxs-header>\r\n\t\t<div\r\n\t\t\tid=\"culture-tree-tab-container\"\r\n\t\t\tclass=\"flex flex-col flex-auto\"\r\n\t\t></div>\r\n\t</div>\r\n</fxs-subsystem-frame>\r\n";

class ScreenCultureTree extends Panel {
  isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
  viewCultureProgressionTreeListener = this.onViewProgressionTree.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  closeListener = this.close.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  onCardActivateListener = this.onCardActivate.bind(this);
  onCardHoverListener = this.onCardHover.bind(this);
  onCardDehoverListener = this.onCardDehover.bind(this);
  startResearchButtonActivateListener = this.onStartResearchButtonActivate.bind(this);
  selectedNode = null;
  selectedLevel = 0;
  frame;
  tabContainer;
  slotGroup;
  treeDetail;
  startResearchButton;
  currentPanelIndex = 0;
  currentPanelID = "";
  hoverLockout = false;
  panelContentElements = /* @__PURE__ */ new Map();
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    this.Root.setAttribute("data-audio-group-ref", "audio-screen-culture-tree-progression");
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    window.addEventListener("view-culture-progression-tree", this.viewCultureProgressionTreeListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.frame = MustGetElement("fxs-subsystem-frame", this.Root);
    if (this.isMobileViewExperience) {
      this.frame.setAttribute("box-style", "fullscreen");
      this.frame.setAttribute("outside-safezone-mode", "full");
      waitForLayout(() => this.frame.classList.remove("pb-10"));
    }
    this.tabContainer = MustGetElement("#culture-tree-tab-container", this.Root);
    const player = Players.get(GameContext.localPlayerID);
    if (player) {
      const availableCultureTree = player.Culture?.getAvailableTrees();
      if (availableCultureTree == void 0) {
        console.error("screen-culture-tree: onAttach(): Error getting progression trees");
      }
    }
    const closebutton = document.querySelector(".culture-tree-hex-grid-close");
    if (closebutton) {
      closebutton.addEventListener("action-activate", this.closeListener);
    }
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.frame.addEventListener("subsystem-frame-close", this.closeListener);
    CultureTree.updateGate.call("onAttach");
    engine.on("CultureTreeChanged", this.onCultureUpdated, this);
    engine.on("CultureTargetChanged", this.onCultureTargetUpdated, this);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.realizeFocus();
  }
  realizeFocus() {
    const selectedElement = this.Root.querySelector(
      `tree-card[type="${this.selectedNode}"]`
    );
    if (selectedElement) {
      Focus.setContextAwareFocus(selectedElement, this.Root);
    } else {
      Focus.setContextAwareFocus(this.slotGroup, this.Root);
    }
  }
  onCultureUpdated(data) {
    if (data.player && data.player != GameContext.localPlayerID) {
      return;
    }
    CultureTree.updateGate.call("onCultureUpdated");
  }
  onCultureTargetUpdated(data) {
    if (data.player && data.player != GameContext.localPlayerID) {
      return;
    }
    CultureTree.updateGate.call("onCultureUpdated");
  }
  onDetach() {
    window.removeEventListener("view-culture-progression-tree", this.viewCultureProgressionTreeListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("CultureTreeChanged", this.onCultureUpdated, this);
    this.panelContentElements.forEach((entry) => {
      if (entry.cardScaling) {
        entry.cardScaling.removeListeners();
      }
    });
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
  onViewProgressionTree(event) {
    this.hoverLockout = true;
    this.refreshProgressionTree(event.detail.treeCSV, event.detail.targetNode, event.detail.iconCallback);
    waitForLayout(() => {
      this.hoverLockout = false;
    });
  }
  refreshProgressionTree(treesCSV, targetNode, iconCallback) {
    if (iconCallback) {
      CultureTree.iconCallback = iconCallback;
    }
    CultureTree.sourceProgressionTrees = treesCSV;
    while (this.tabContainer.hasChildNodes()) {
      this.tabContainer.removeChild(this.tabContainer.lastChild);
    }
    const tabControl = this.createTabControl();
    this.tabContainer.appendChild(tabControl);
    if (targetNode) {
      this.refreshDetailsPanel(targetNode);
    }
    waitForLayout(() => this.realizeFocus());
  }
  /**
   * @returns: A tab control element configured with an array of tab configuration objects
   */
  createTabControl() {
    const configuration = this.getConfigurationTabArray();
    const attributeTabBar = document.createElement("fxs-tab-bar");
    attributeTabBar.classList.add("mx-16");
    attributeTabBar.setAttribute("tab-for", "fxs-subsystem-frame");
    attributeTabBar.setAttribute("tab-items", JSON.stringify(configuration));
    attributeTabBar.setAttribute("data-audio-group-ref", "audio-screen-culture-tree-chooser");
    attributeTabBar.setAttribute("data-audio-tab-selected", "unlocks-tab-select");
    attributeTabBar.addEventListener("tab-selected", this.onTabSelected);
    if (CultureTree.activeTree) {
      attributeTabBar.setAttribute(
        "selected-tab-index",
        `${configuration.findIndex((tab) => tab.id == CultureTree.activeTree)}`
      );
    }
    this.slotGroup = document.createElement("fxs-slot-group");
    this.slotGroup.classList.add("flex", "flex-auto");
    const content2 = document.createElement("fxs-vslot");
    content2.classList.add("flex-auto");
    content2.appendChild(this.slotGroup);
    for (let i = 0; i < configuration.length; i++) {
      const configurationObj = configuration[i];
      const { root } = this.createPanelContent(i, configurationObj.id);
      this.slotGroup.appendChild(root);
    }
    const frag = document.createDocumentFragment();
    frag.appendChild(attributeTabBar);
    frag.appendChild(content2);
    return frag;
  }
  createPanelContent(index, id) {
    let refs = this.panelContentElements.get(index);
    if (refs) {
      return refs;
    }
    const root = document.createElement("fxs-slot");
    root.classList.add(
      "flex-auto",
      "items-center",
      "w-full",
      "relative",
      "pb-6",
      `culture-category-container-${id}`
    );
    root.setAttribute("id", id);
    const tree = `g_CultureTree.trees[${index}]`;
    const { scrollable, cardScaling } = TreeSupport.getGridElement(
      tree,
      TreeGridDirection.HORIZONTAL,
      this.createCard.bind(this)
    );
    if (TreeSupport.isSmallScreen()) {
      scrollable.setAttribute("handle-gamepad-pan", "false");
    }
    const cardDetailContainer = document.createElement("div");
    cardDetailContainer.classList.add(
      `card-detail-container`,
      "p-4",
      "pointer-events-none",
      "items-end",
      "w-96",
      "flex-col",
      "items-center",
      "max-h-full"
    );
    cardDetailContainer.setAttribute("panel-id", id);
    cardDetailContainer.classList.toggle("max-w-128", this.isMobileViewExperience);
    cardDetailContainer.classList.toggle("w-96", !this.isMobileViewExperience);
    root.append(scrollable, cardDetailContainer);
    refs = { root, scrollable, cardDetailContainer, cardScaling };
    this.panelContentElements.set(index, refs);
    return refs;
  }
  createCard(container) {
    const cardElement = document.createElement("tree-card");
    Databind.if(cardElement, "card.hasData");
    Databind.attribute(cardElement, "dummy", "card.isDummy");
    Databind.attribute(cardElement, "type", "card.nodeType");
    Databind.attribute(cardElement, "name", "card.name");
    Databind.attribute(cardElement, "progress", "card.progressPercentage");
    Databind.attribute(cardElement, "turns", "card.turns");
    Databind.attribute(cardElement, "unlocks-by-depth", "card.unlocksByDepthString");
    Databind.attribute(cardElement, "queue-order", "card.queueOrder");
    cardElement.setAttribute("tree-type", "culture");
    cardElement.setAttribute("tooltip-type", "culture-tree");
    cardElement.setAttribute("data-audio-group-ref", "audio-screen-culture-tree-progression");
    cardElement.setAttribute("data-audio-activate-ref", "none");
    cardElement.setAttribute("data-audio-focus-ref", "data-audio-focus");
    Databind.classToggle(cardElement, "locked", "card.isLocked");
    Databind.classToggle(cardElement, "queued", "card.isQueued");
    cardElement.addEventListener(TreeCardHoveredEventName, this.onCardHoverListener);
    cardElement.addEventListener(TreeCardDehoveredEventName, this.onCardDehoverListener);
    cardElement.addEventListener(TreeCardActivatedEventName, this.onCardActivateListener);
    container.appendChild(cardElement);
  }
  /**
   * @returns: An array containing tab configuration object to create tabs in an easier way
   */
  getConfigurationTabArray() {
    const configuration = [];
    for (const tree of CultureTree.trees) {
      const definition = GameInfo.ProgressionTrees.lookup(tree.type);
      const name = definition?.Name ? `${Locale.compose(definition.Name)}` : `[WIP] Civic Tree`;
      configuration.push({
        id: tree.type.toString() || "no_type",
        label: name
      });
    }
    return configuration;
  }
  onTabSelected = (event) => {
    this.currentPanelIndex = event.detail.index;
    this.currentPanelID = event.detail.selectedItem.id;
    this.slotGroup.setAttribute("selected-slot", event.detail.selectedItem.id);
    const panelCategoryContainer = this.Root.querySelector(
      ".culture-category-container-" + this.currentPanelID
    );
    if (!panelCategoryContainer) {
      console.warn(
        "screen-culture-tree: onReceiveFocus(): No culture category container found, focus is not posible"
      );
      return;
    }
    waitForLayout(() => FocusManager.setFocus(this.slotGroup));
    const panelRefs = this.panelContentElements.get(this.currentPanelIndex);
    const panelScroll = panelRefs?.scrollable;
    if (panelRefs?.cardScaling) {
      panelRefs.cardScaling.checkBoundaries();
    }
    if (panelScroll) {
      panelScroll.component.stopPanning();
    }
    this.startResearchButton?.remove();
  };
  refreshDetailsPanel(nodeId, level = "0") {
    this.selectedNode = nodeId;
    this.selectedLevel = +level;
    this.updateTreeDetail(nodeId, level);
    this.refreshNavTray();
  }
  updateTreeDetail(nodeId, level) {
    if (!TreeSupport.isSmallScreen()) {
      return;
    }
    const panelRefs = this.panelContentElements.get(this.currentPanelIndex);
    if (!panelRefs) {
      console.error(
        "screen-attribute-tree: updateTreeDetail(): no panel content references found for current panel index",
        this.currentPanelIndex
      );
      return;
    }
    const { root, cardDetailContainer } = panelRefs;
    if (!this.treeDetail) {
      this.treeDetail = document.createElement("tree-detail");
      this.treeDetail.classList.add("max-w-full", "w-full", "h-full");
    }
    if (!cardDetailContainer.contains(this.treeDetail)) {
      cardDetailContainer.appendChild(this.treeDetail);
      waitForLayout(() => {
        const treeDetailScrollable = this.treeDetail?.maybeComponent?.scrollable?.maybeComponent;
        treeDetailScrollable?.setEngineInputProxy(root);
        if (!this.treeDetail?.isConnected && cardDetailContainer) {
          cardDetailContainer.appendChild(this.treeDetail);
        }
      });
    }
    if (!this.startResearchButton || !cardDetailContainer.contains(this.startResearchButton)) {
      this.startResearchButton = document.createElement("fxs-button");
      this.startResearchButton.classList.add("mt-6");
      this.startResearchButton.setAttribute("caption", "LOC_UI_TREE_START_RESEARCH");
      this.startResearchButton.addEventListener("action-activate", this.startResearchButtonActivateListener);
      cardDetailContainer.appendChild(this.startResearchButton);
    }
    const node = CultureTree.getCard(nodeId);
    if (node == void 0) {
      console.error(
        "screen-culture-tree: updateTreeDetail(): Node with id " + nodeId + " couldn't be found on the grid data"
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
        PlayerOperationTypes.SET_CULTURE_TREE_NODE,
        args,
        false
      );
      if (result.Success) {
        return true;
      }
    }
    return false;
  }
  onActivateCulturelistItem() {
    if (this.selectedNode) {
      const localPlayer = Players.get(GameContext.localPlayerID);
      if (localPlayer) {
        const targetNode = localPlayer.Culture?.getTargetNode();
        if (targetNode != void 0 && targetNode != ProgressionTreeNodeTypes.NO_NODE) {
          this.onTargetCulturelistItem();
          return;
        }
      }
      const nodeIndex = +this.selectedNode;
      const args = { ProgressionTreeNodeType: nodeIndex };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_CULTURE_TREE_NODE,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.SET_CULTURE_TREE_NODE,
          args
        );
      } else {
        this.playSound("data-audio-negative", "data-audio-negative-ref");
      }
    }
  }
  onTargetCulturelistItem() {
    if (this.selectedNode) {
      const nodeIndex = +this.selectedNode;
      const args = { ProgressionTreeNodeType: nodeIndex };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
        args,
        false
      );
      if (result.Success) {
        if (this.selectedNode != ProgressionTreeNodeTypes.NO_NODE) {
          const result2 = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.SET_CULTURE_TREE_NODE,
            args,
            false
          );
          if (result2.Success) {
            Game.PlayerOperations.sendRequest(
              GameContext.localPlayerID,
              PlayerOperationTypes.SET_CULTURE_TREE_NODE,
              args
            );
          }
        }
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
          args
        );
      } else {
        this.playSound("data-audio-negative", "data-audio-negative-ref");
      }
    }
  }
  onActiveDeviceTypeChanged() {
    this.refreshNavTray();
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
      this.onActivateCulturelistItem();
    } else {
      this.onTargetCulturelistItem();
    }
    if (this.selectedNode) {
      const card = CultureTree.getCard(this.selectedNode.toString());
      if (card) {
        const node = GameInfo.ProgressionTreeNodes.lookup(card.nodeType);
        if (node) {
          const event = "civic-tree-activate-" + node.ProgressionTreeNodeType + "_" + level;
          UI.sendAudioEvent(event);
        } else {
          Audio.playSound("data-audio-civic-tree-activate", "audio-screen-culture-tree-chooser");
        }
      } else {
        Audio.playSound("data-audio-civic-tree-activate", "audio-screen-culture-tree-chooser");
      }
    }
    this.refreshDetailsPanel(type, level);
  }
  onCardHover(event) {
    if (this.hoverLockout) {
      return;
    }
    this.handleCardHover(event.detail.type, event.detail.level);
  }
  handleCardHover(type, level) {
    this.refreshDetailsPanel(type, level);
    if (this.selectedNode) {
      this.handleCardDehover();
      const nodeIndex = +this.selectedNode;
      const highlightList = CultureTree.hoverItems(nodeIndex);
      if (highlightList) {
        Audio.playSound("data-audio-queue-hover", "audio-screen-culture-tree-progression");
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
    const clearList = CultureTree.clearHoverItems();
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
Controls.define("screen-culture-tree", {
  createInstance: ScreenCultureTree,
  description: "Grid picker list and info window for civics.",
  classNames: ["screen-culture-tree", "screen-tree"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-culture-tree.js.map
