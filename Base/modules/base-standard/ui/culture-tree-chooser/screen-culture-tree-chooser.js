import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { C as CultureTreeChooser } from './model-culture-tree-chooser.chunk.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../tree-grid/tree-support.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../tutorial/tutorial-support.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-item.js';
import '../tutorial/tutorial-manager.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../tutorial/tutorial-events.chunk.js';
import '../utilities/utilities-textprovider.chunk.js';
import '../utilities/utilities-tags.chunk.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/shell/mp-staging/mp-friends.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';

const content = "<fxs-subsystem-frame class=\"culture-tree items-center\">\r\n    <fxs-header data-slot=\"header\" class=\"uppercase\" title=\"LOC_UI_CULTURE_CHOOSER_TITLE\" header-bg-glow=\"true\"></fxs-header>\r\n    <fxs-inner-frame class=\"mx-6 my-1\\.5\">\r\n        <div class=\"culture-tree-currently-studying\"></div>\r\n    </fxs-inner-frame>\r\n    <fxs-vslot class=\"culture-tree-list item-list flow-column\"></fxs-vslot>\r\n</fxs-subsystem-frame>";

const styles = "fs://game/base-standard/ui/culture-tree-chooser/screen-culture-tree-chooser.css";

class ScreenCultureTreeChooser extends Panel {
  cultureItemListener = (event) => {
    this.onActivateCultureListItem(event);
  };
  treeRevealItemListener = (event) => {
    this.onTreeProgressListItem(event);
  };
  expandCollapseListener = this.onToggleExpandCollapse.bind(this);
  gridButtonListener = () => {
    this.onHotLinkToFullGrid();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  updateHandler = this.update.bind(this);
  selectedNode;
  selectedTreeType;
  availableTreeTypes;
  cultureList = null;
  currentResearchDivider = null;
  headerAllAvailable = null;
  headerTreeProgressContainer = null;
  currentItems = [];
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    this.inputContext = InputContext.Dual;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    if (ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
  }
  onAttach() {
    super.onAttach();
    window.dispatchEvent(new HideMiniMapEvent(true));
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.updateExpandCollapse();
    CultureTreeChooser.subject.on(this.updateHandler);
  }
  render() {
    this.Root.setAttribute("data-tooltip-anchor", "right");
    const subsystemPanel = MustGetElement("fxs-subsystem-frame", this.Root);
    subsystemPanel.addEventListener("subsystem-frame-close", () => {
      this.requestClose();
    });
    const cultureListTop = MustGetElement(".culture-tree-currently-studying", this.Root);
    this.cultureList = MustGetElement(".culture-tree-list", this.Root);
    this.cultureList.setAttribute("disable-focus-allowed", "true");
    const headerInProgress = document.createElement("div");
    headerInProgress.innerHTML = Locale.compose("LOC_UI_CURRENT_STUDY");
    headerInProgress.classList.add("text-accent-4", "uppercase", "mt-1", "font-title-sm", "tracking-100");
    cultureListTop.appendChild(headerInProgress);
    this.currentResearchDivider = document.createElement("div");
    this.currentResearchDivider.classList.add("filigree-divider-inner-frame", "w-72");
    cultureListTop.appendChild(this.currentResearchDivider);
    this.headerAllAvailable = document.createElement("fxs-header");
    this.headerAllAvailable.setAttribute("title", "LOC_UI_CULTURE_CHOOSE_CIVIC_HEADER");
    this.headerAllAvailable.setAttribute("filigree-style", "h4");
    this.headerAllAvailable.classList.add("mt-4", "mb-2\\.5", "font-title-base", "w-96", "self-center");
    this.cultureList.appendChild(this.headerAllAvailable);
    this.headerTreeProgressContainer = document.createElement("div");
    this.headerTreeProgressContainer.classList.add("flex", "flex-row", "items-center", "justify-center", "hidden");
    this.cultureList.appendChild(this.headerTreeProgressContainer);
    const headerTreeProgress = document.createElement("fxs-header");
    headerTreeProgress.setAttribute("title", "LOC_UI_CULTURE_TREE_LOCKED_CIVICS");
    headerTreeProgress.setAttribute("filigree-style", "h4");
    headerTreeProgress.classList.add("uppercase", "mt-4", "mb-2\\.5", "relative", "font-title-base");
    this.headerTreeProgressContainer.appendChild(headerTreeProgress);
    const headerTreeExpandButton = document.createElement("fxs-activatable");
    headerTreeExpandButton.classList.add("screen-culture-tree-chooser__tree-expand-button");
    headerTreeExpandButton.addEventListener("action-activate", this.expandCollapseListener);
    headerTreeExpandButton.setAttribute("tabindex", "-1");
    this.headerTreeProgressContainer.appendChild(headerTreeExpandButton);
    const showTreeButton = document.createElement("fxs-hero-button");
    Databind.if(showTreeButton, `!{{g_NavTray.isTrayRequired}}`);
    showTreeButton.setAttribute("caption", "LOC_UI_CULTURE_TREE_VIEW_FULL_TREE_BUTTON");
    showTreeButton.classList.add("mx-8", "mt-3", "mb-6", "uppercase");
    showTreeButton.setAttribute("action-key", "inline-shell-action-1");
    showTreeButton.setAttribute("data-slot", "footer");
    showTreeButton.addEventListener("action-activate", this.gridButtonListener);
    subsystemPanel.appendChild(showTreeButton);
  }
  update() {
    for (const itemToRemove of this.currentItems) {
      itemToRemove.remove();
    }
    if (CultureTreeChooser.hasCurrentResearch) {
      for (const inProgreesNode of CultureTreeChooser.inProgressNodes) {
        const inProgress = document.createElement("tree-chooser-item");
        this.createCultureItem(inProgress, inProgreesNode);
        inProgress.classList.add("in-progress", "max-w-full");
        this.currentResearchDivider?.insertAdjacentElement("afterend", inProgress);
        this.currentItems.push(inProgress);
      }
    } else {
      const emptyInProgress = document.createElement("div");
      emptyInProgress.classList.add("culture-current__empty", "font-body-sm", "text-accent-4");
      const emptyCaption = document.createElement("div");
      emptyCaption.innerHTML = CultureTreeChooser.currentResearchEmptyTitle;
      emptyInProgress.appendChild(emptyCaption);
      this.currentResearchDivider?.insertAdjacentElement("afterend", emptyInProgress);
      this.currentItems.push(emptyInProgress);
    }
    for (const node of CultureTreeChooser.nodes) {
      const cultureItem = document.createElement("tree-chooser-item");
      this.createCultureItem(cultureItem, node);
      this.headerAllAvailable?.insertAdjacentElement("afterend", cultureItem);
      this.currentItems.push(cultureItem);
    }
    if (CultureTreeChooser.shouldShowTreeRevealHeader) {
      this.headerTreeProgressContainer?.classList.remove("hidden");
    } else {
      this.headerTreeProgressContainer?.classList.add("hidden");
    }
    for (const lockedNode of CultureTreeChooser.treeRevealData) {
      const lockedItem = document.createElement("tree-chooser-item");
      this.createCultureItem(lockedItem, lockedNode);
      this.headerTreeProgressContainer?.insertAdjacentElement("afterend", lockedItem);
      this.currentItems.push(lockedItem);
    }
  }
  onDetach() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    CultureTreeChooser.subject.off(this.updateHandler);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const cultureList = MustGetElement(".culture-tree-list", this.Root);
    Focus.setContextAwareFocus(cultureList, this.Root);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateGenericSelect();
    NavTray.addOrUpdateShellAction1("LOC_UI_CULTURE_TREE_VIEW_FULL_TREE_BUTTON");
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  createCultureItem(cultureItem, node) {
    cultureItem.whenComponentCreated((chooser) => {
      chooser.treeChooserNode = node;
    });
    cultureItem.classList.add("culture-item", "my-1\\.25", "mx-5");
    if (node.isLocked) {
      cultureItem.classList.add("locked-item");
      cultureItem.addEventListener("action-activate", this.treeRevealItemListener);
      cultureItem.setAttribute("disabled", "true");
    } else {
      cultureItem.setAttribute("data-tooltip-style", "culture");
      cultureItem.addEventListener("action-activate", this.cultureItemListener);
    }
    cultureItem.setAttribute("data-audio-group-ref", "audio-screen-culture-tree-chooser");
    cultureItem.setAttribute("data-audio-activate-ref", "data-audio-culture-tree-activate");
    cultureItem.setAttribute("data-audio-focus-ref", "data-audio-chooser-focus");
  }
  onToggleExpandCollapse() {
    CultureTreeChooser.showLockedCivics = !CultureTreeChooser.showLockedCivics;
    this.updateExpandCollapse();
  }
  updateExpandCollapse() {
    if (CultureTreeChooser.showLockedCivics) {
      this.Root.classList.add("expanded");
      this.Root.classList.remove("collapsed");
    } else {
      this.Root.classList.add("collapsed");
      this.Root.classList.remove("expanded");
    }
  }
  openGridView() {
    if (!this.selectedTreeType) {
      this.selectedTreeType = CultureTreeChooser.getDefaultTreeToDisplay();
    }
    if (!this.availableTreeTypes) {
      const allTreeTypes = CultureTreeChooser.getAllTreesToDisplay();
      if (allTreeTypes) {
        const allTreeTypesCSV = allTreeTypes.join(",");
        this.availableTreeTypes = allTreeTypesCSV;
      }
    }
    this.selectedNode = CultureTreeChooser.getDefaultNodeToDisplay();
    const localPlayer = Players.getEverAlive()[GameContext.localObserverID];
    if (localPlayer) {
      const activeTree = localPlayer.Culture?.getActiveTree();
      if (activeTree) {
        const treeObject = Game.ProgressionTrees.getTree(
          GameContext.localObserverID,
          activeTree
        );
        if (treeObject && treeObject.activeNodeIndex < 0) {
          this.selectedNode = void 0;
        }
      }
    }
    this.openFullCultureTree();
    this.updateTreeView();
  }
  openFullCultureTree() {
    const treeParent = document.querySelector(".fxs-trees") || void 0;
    ContextManager.push("screen-culture-tree", {
      singleton: true,
      createMouseGuard: true,
      targetParent: treeParent
    });
    this.close();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.requestClose(inputEvent);
    } else if (inputEvent.detail.name == "shell-action-1") {
      this.onHotLinkToFullGrid();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  }
  onActivateCultureListItem(event) {
    if (event.target instanceof HTMLElement) {
      this.selectedNode = event.target.getAttribute("node-id") ?? "";
      this.selectedTreeType = event.target.getAttribute("node-tree-type") ?? "";
      this.confirmSelection();
    }
  }
  confirmSelection() {
    if (CultureTreeChooser.isExpanded) {
      this.updateTreeView();
    } else if (this.selectedNode) {
      CultureTreeChooser.chooseNode(this.selectedNode);
      const args = { ProgressionTreeNodeType: ProgressionTreeNodeTypes.NO_NODE };
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
        args
      );
      this.close();
    }
  }
  updateTreeView() {
    if (this.availableTreeTypes) {
      window.dispatchEvent(
        new CustomEvent("view-culture-progression-tree", {
          detail: {
            treeCSV: this.availableTreeTypes,
            targetNode: this.selectedNode,
            iconCallback: Icon.getCultureIconFromProgressionTreeNodeDefinition
          }
        })
      );
    }
  }
  onHotLinkToFullGrid() {
    this.openGridView();
  }
  onTreeProgressListItem(event) {
    if (event.target instanceof HTMLElement) {
      this.playSound("data-audio-activate", "data-audio-activate-ref");
      event.stopPropagation();
      event.preventDefault();
      const targetTree = event.target.getAttribute("node-tree-type") ?? "";
      window.dispatchEvent(
        new CustomEvent("view-culture-progression-tree", {
          detail: {
            treeCSV: targetTree,
            targetNode: null,
            iconCallback: Icon.getCultureIconFromProgressionTreeNodeDefinition
          }
        })
      );
    }
  }
}
Controls.define("screen-culture-tree-chooser", {
  createInstance: ScreenCultureTreeChooser,
  description: "Quick picker list and info window for cultures.",
  classNames: ["screen-culture-tree-chooser"],
  styles: [styles],
  innerHTML: [content],
  images: ["blp:hud_quest_open.png", "blp:hud_quest_close.png"]
});
//# sourceMappingURL=screen-culture-tree-chooser.js.map
