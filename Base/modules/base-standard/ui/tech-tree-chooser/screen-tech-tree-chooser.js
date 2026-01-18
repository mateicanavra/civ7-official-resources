import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import { T as TechTreeChooser } from './model-tech-tree-chooser.chunk.js';
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
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/shell/mp-staging/mp-friends.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../tree-grid/tree-support.chunk.js';
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

const content = "<fxs-subsystem-frame class=\"tech-tree items-center\">\r\n\t<fxs-header\r\n\t\tdata-slot=\"header\"\r\n\t\tclass=\"uppercase\"\r\n\t\ttitle=\"LOC_UI_TECH_CHOOSER_TITLE\"\r\n        header-bg-glow=\"true\"\r\n\t></fxs-header>\r\n\t<fxs-inner-frame class=\"mx-6 my-1\\.5\">\r\n\t\t<div class=\"tech-tree-currently-studying\"></div>\r\n\t</fxs-inner-frame>\r\n\t<fxs-vslot class=\"tech-tree-list item-list flow-column\"></fxs-vslot>\r\n</fxs-subsystem-frame>\r\n";

const styles = "fs://game/base-standard/ui/tech-tree-chooser/screen-tech-tree-chooser.css";

class ScreenTechTreeChooser extends Panel {
  techItemListener = (event) => {
    this.onActivateTechListItem(event);
  };
  gridButtonListener = () => {
    this.onHotLinkToFullGrid();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  updateHandler = this.update.bind(this);
  selectedNode;
  selectedTreeType;
  techList = null;
  currentResearchDivider = null;
  headerAllAvailable = null;
  currentItems = [];
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    this.inputContext = InputContext.Dual;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onInitialize() {
    this.render();
    if (ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    window.dispatchEvent(new HideMiniMapEvent(true));
    TechTreeChooser.subject.on(this.updateHandler);
  }
  render() {
    this.Root.setAttribute("data-tooltip-anchor", "right");
    const subsystemPanel = MustGetElement("fxs-subsystem-frame", this.Root);
    subsystemPanel.setAttribute("data-audio-close-group-ref", "audio-screen-tech-tree-chooser");
    subsystemPanel.addEventListener("subsystem-frame-close", () => {
      this.requestClose();
    });
    const techListTop = MustGetElement(".tech-tree-currently-studying", this.Root);
    this.techList = MustGetElement(".tech-tree-list", this.Root);
    const headerInProgress = document.createElement("div");
    headerInProgress.innerHTML = Locale.compose("LOC_UI_CURRENT_TECH_HEADER");
    headerInProgress.setAttribute("filigree-style", "none");
    headerInProgress.classList.add("text-accent-4", "uppercase", "mt-1", "font-title-sm", "tracking-100");
    techListTop.appendChild(headerInProgress);
    this.currentResearchDivider = document.createElement("div");
    this.currentResearchDivider.classList.add("filigree-divider-inner-frame", "w-72");
    techListTop.appendChild(this.currentResearchDivider);
    this.headerAllAvailable = document.createElement("fxs-header");
    this.headerAllAvailable.setAttribute("title", "LOC_UI_TECH_AVAILABLE_HEADER");
    this.headerAllAvailable.setAttribute("filigree-style", "h4");
    this.headerAllAvailable.classList.add("mt-4", "mb-2\\.5", "font-title-base", "w-96", "self-center");
    this.techList.appendChild(this.headerAllAvailable);
    const showTreeButton = document.createElement("fxs-hero-button");
    Databind.if(showTreeButton, `!{{g_NavTray.isTrayRequired}}`);
    showTreeButton.setAttribute("caption", "LOC_UI_TECH_VIEW_FULL_PROG_TREE");
    showTreeButton.classList.add("mx-8", "mt-3", "mb-6", "uppercase");
    showTreeButton.setAttribute("action-key", "inline-shell-action-1");
    showTreeButton.setAttribute("data-audio-group-ref", "audio-screen-tech-tree-chooser");
    showTreeButton.setAttribute("data-audio-focus", "tech-tree-chooser-focus");
    showTreeButton.setAttribute("data-slot", "footer");
    showTreeButton.addEventListener("action-activate", this.gridButtonListener);
    subsystemPanel.appendChild(showTreeButton);
  }
  update() {
    for (const itemToRemove of this.currentItems) {
      itemToRemove.remove();
    }
    if (TechTreeChooser.hasCurrentResearch) {
      for (const inProgreesNode of TechTreeChooser.inProgressNodes) {
        const inProgress = document.createElement("tree-chooser-item");
        this.createTechItem(inProgress, inProgreesNode);
        inProgress.classList.add("in-progress", "max-w-full");
        this.currentResearchDivider?.insertAdjacentElement("afterend", inProgress);
        this.currentItems.push(inProgress);
      }
    } else {
      const emptyInProgress = document.createElement("div");
      emptyInProgress.classList.add("tech-current__empty", "font-body-sm", "text-accent-4", "text-center");
      const emptyCaption = document.createElement("div");
      emptyCaption.innerHTML = TechTreeChooser.currentResearchEmptyTitle;
      emptyInProgress.appendChild(emptyCaption);
      this.currentResearchDivider?.insertAdjacentElement("afterend", emptyInProgress);
      this.currentItems.push(emptyInProgress);
    }
    for (const node of TechTreeChooser.nodes) {
      const techItem = document.createElement("tree-chooser-item");
      this.createTechItem(techItem, node);
      this.headerAllAvailable?.insertAdjacentElement("afterend", techItem);
      this.currentItems.push(techItem);
    }
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    TechTreeChooser.subject.off(this.updateHandler);
    window.dispatchEvent(new HideMiniMapEvent(false));
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const techList = MustGetElement(".tech-tree-list", this.Root);
    Focus.setContextAwareFocus(techList, this.Root);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateGenericSelect();
    NavTray.addOrUpdateShellAction1("LOC_UI_TECH_VIEW_FULL_PROG_TREE");
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  createTechItem(techItem, node) {
    techItem.whenComponentCreated((chooser) => {
      chooser.treeChooserNode = node;
    });
    techItem.setAttribute("data-tooltip-style", "tech");
    techItem.addEventListener("action-activate", this.techItemListener);
    techItem.setAttribute("data-audio-group-ref", "audio-screen-tech-tree-chooser");
    techItem.setAttribute("data-audio-focus-ref", "data-audio-chooser-focus");
    techItem.setAttribute("data-tut-highlight", "techChooserHighlights");
    techItem.classList.add("tech-item", "my-1\\.25", "mx-5");
  }
  openGridView() {
    if (!this.selectedTreeType) {
      this.selectedTreeType = TechTreeChooser.getDefaultTreeToDisplay();
    }
    this.selectedNode = TechTreeChooser.getDefaultNodeToDisplay();
    this.openFullTechTree();
    this.updateTreeView();
  }
  openFullTechTree() {
    const treeParent = document.querySelector(".fxs-trees") || void 0;
    ContextManager.push("screen-tech-tree", { singleton: true, createMouseGuard: true, targetParent: treeParent });
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
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  close() {
    super.close();
  }
  onActivateTechListItem(event) {
    if (event.target instanceof HTMLElement) {
      this.selectedNode = event.target.getAttribute("node-id") ?? "";
      this.selectedTreeType = event.target.getAttribute("node-tree-type") ?? "";
      this.confirmSelection();
    }
  }
  confirmSelection() {
    if (this.selectedNode) {
      TechTreeChooser.chooseNode(this.selectedNode);
      const args = { ProgressionTreeNodeType: ProgressionTreeNodeTypes.NO_NODE };
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
        args
      );
      this.close();
    }
  }
  updateTreeView() {
    if (this.selectedTreeType) {
      window.dispatchEvent(
        new CustomEvent("view-tech-progression-tree", {
          detail: {
            treeCSV: this.selectedTreeType,
            targetNode: this.selectedNode,
            iconCallback: Icon.getTechIconFromProgressionTreeNodeDefinition
          }
        })
      );
    }
  }
  onHotLinkToFullGrid() {
    this.openGridView();
  }
}
Controls.define("screen-tech-tree-chooser", {
  createInstance: ScreenTechTreeChooser,
  description: "Quick picker list and info window for techs.",
  classNames: ["screen-tech-tree-chooser"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-tech-tree-chooser.js.map
