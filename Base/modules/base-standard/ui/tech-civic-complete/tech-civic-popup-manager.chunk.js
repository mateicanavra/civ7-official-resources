import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { TutorialLevel } from '../tutorial/tutorial-item.js';

var ProgressionTreeTypes = /* @__PURE__ */ ((ProgressionTreeTypes2) => {
  ProgressionTreeTypes2["TECH"] = "TECH";
  ProgressionTreeTypes2["CULTURE"] = "CULTURE";
  return ProgressionTreeTypes2;
})(ProgressionTreeTypes || {});
const TechCivicPopupVisibility = "tech-civic-popup-visibility";
class TechCivicPopupVisibilityEvent extends CustomEvent {
  constructor(visibility) {
    super(TechCivicPopupVisibility, { bubbles: false, detail: { visibility } });
  }
}
class TechCivicPopupManagerClass extends DisplayHandlerBase {
  static instance = null;
  techNodeCompletedListener = this.onTechNodeCompleted.bind(this);
  cultureNodeCompletedListener = this.onCultureNodeCompleted.bind(this);
  currentTechCivicPopupData = null;
  isFirstCivic = true;
  isFirstTech = true;
  constructor() {
    super("TechCivicPopup", 8e3);
    if (TechCivicPopupManagerClass.instance) {
      console.error("Only one instance of the TechCivicPopup manager class can exist at a time!");
    }
    TechCivicPopupManagerClass.instance = this;
    this.initializeListeners();
  }
  initializeListeners() {
    if (!Configuration.getGame().isAnyMultiplayer) {
      engine.on("TechNodeCompleted", this.techNodeCompletedListener);
      engine.on("CultureNodeCompleted", this.cultureNodeCompletedListener);
    }
  }
  isShowing() {
    return ContextManager.hasInstanceOf("screen-tech-civic-complete");
  }
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    window.dispatchEvent(new TechCivicPopupVisibilityEvent(this.isShowing()));
    this.currentTechCivicPopupData = request;
    InterfaceMode.switchToDefault();
    ContextManager.push("screen-tech-civic-complete", { createMouseGuard: true, singleton: true });
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(_request, _options) {
    this.currentTechCivicPopupData = null;
    ContextManager.pop("screen-tech-civic-complete");
    if (DisplayQueueManager.findAll(this.getCategory()).length === 1) {
      this.isFirstCivic = true;
      this.isFirstTech = true;
      this.currentTechCivicPopupData = null;
    }
  }
  closePopup = () => {
    if (this.currentTechCivicPopupData) {
      DisplayQueueManager.close(this.currentTechCivicPopupData);
    }
  };
  setRequestIdAndPriority(request) {
    super.setRequestIdAndPriority(request);
    if (request.treeType == "TECH" /* TECH */) {
      request.subpriority += 1e3;
    }
  }
  onTechNodeCompleted(data) {
    if (ContextManager.shouldShowPopup(data.player)) {
      const node = GameInfo.ProgressionTreeNodes.lookup(data.activeNode);
      if (!node) {
        console.error(
          "tech-civic-popup-manager: Unable to retrieve node definition for tech node " + data.activeNode.toString() + " in tree " + data.tree
        );
        return;
      }
      if (node.ProgressionTreeNodeType == "NODE_TECH_AQ_AGRICULTURE") {
        if (Configuration.getUser().tutorialLevel > TutorialLevel.None && !Online.Metaprogression.isPlayingActiveEvent()) {
          return;
        }
      }
      const techCivicPopupData = {
        category: this.getCategory(),
        node,
        treeType: "TECH" /* TECH */
      };
      this.addDisplayRequest(techCivicPopupData);
    }
  }
  onCultureNodeCompleted(data) {
    if (ContextManager.shouldShowPopup(data.player)) {
      const node = GameInfo.ProgressionTreeNodes.lookup(data.activeNode);
      if (!node) {
        console.error(
          "tech-civic-popup-manager: Unable to retrieve node definition for culture node " + data.activeNode.toString() + " in tree " + data.tree
        );
        return;
      }
      if (node.ProgressionTreeNodeType == "NODE_CIVIC_AQ_MAIN_CHIEFDOM") {
        if (Configuration.getUser().tutorialLevel > TutorialLevel.None && !Online.Metaprogression.isPlayingActiveEvent()) {
          return;
        }
      }
      const techCivicPopupData = {
        category: this.getCategory(),
        node,
        treeType: "CULTURE" /* CULTURE */
      };
      this.addDisplayRequest(techCivicPopupData);
    }
  }
}
const TechCivicPopupManager = new TechCivicPopupManagerClass();
DisplayQueueManager.registerHandler(TechCivicPopupManager);

export { ProgressionTreeTypes as P, TechCivicPopupVisibility as T, TechCivicPopupManager as a };
//# sourceMappingURL=tech-civic-popup-manager.chunk.js.map
