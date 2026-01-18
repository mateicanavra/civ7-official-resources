import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { c as GameCreatorClosedEvent, d as StartCampaignEvent } from '../../events/shell-events.chunk.js';
import { ScreenProfilePageExternalStatus } from '../../profile-page/screen-profile-page.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../input/focus-manager.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../utilities/utilities-dom.chunk.js';
import '../../navigation-tray/model-navigation-tray.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';

var NextCreationAction = /* @__PURE__ */ ((NextCreationAction2) => {
  NextCreationAction2[NextCreationAction2["Continue"] = 0] = "Continue";
  NextCreationAction2[NextCreationAction2["StartGame"] = 1] = "StartGame";
  return NextCreationAction2;
})(NextCreationAction || {});

class CreateGameModelImpl {
  _categories = [];
  openPanel = null;
  currentPanelIndex = 0;
  createGameRoot = null;
  panelList = [];
  currentBackground;
  _isFirstTimeCreateGame = false;
  _gameStartingEvent = new LiteEvent();
  _selectedLeader;
  _selectedAge;
  _selectedCiv;
  get categories() {
    return this._categories;
  }
  get activeCategory() {
    return this.currentPanel.category;
  }
  get currentPanel() {
    return this.panelList[this.currentPanelIndex];
  }
  get selectedLeader() {
    return this._selectedLeader;
  }
  set selectedLeader(value) {
    this._selectedLeader = value;
  }
  get selectedAge() {
    return this._selectedAge;
  }
  set selectedAge(value) {
    this._selectedAge = value;
  }
  get selectedCiv() {
    return this._selectedCiv;
  }
  set selectedCiv(value) {
    this._selectedCiv = value;
  }
  get isLastPanel() {
    return this.currentPanelIndex >= this.panelList.length - 1;
  }
  get nextActionStartsGame() {
    return this.currentPanel != void 0 && this.currentPanel.nextAction == NextCreationAction.StartGame;
  }
  get isFirstTimeCreateGame() {
    return this._isFirstTimeCreateGame;
  }
  set isFirstTimeCreateGame(value) {
    this._isFirstTimeCreateGame = value;
  }
  get gameStartingEvent() {
    return this._gameStartingEvent;
  }
  getAgeBackgroundName(ageId) {
    return `${ageId.toLowerCase().replace("age_", "age-sel_")}_full`;
  }
  getCivBackgroundName(civId) {
    return `bg-panel-${civId.replace("CIVILIZATION_", "").toLowerCase()}`;
  }
  onInviteAccepted() {
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new GameCreatorClosedEvent());
  }
  isCurrentPanel(name) {
    if (this.panelList[this.currentPanelIndex].category === name) {
      return true;
    }
    return false;
  }
  showPanelByName(name) {
    const newIndex = this.panelList.findIndex((p) => p.panel === name);
    if (newIndex >= 0 && newIndex != this.currentPanelIndex) {
      this.popPanel();
      this.currentPanelIndex = newIndex;
      this.showPanel();
    }
  }
  showPanelFor(category) {
    const newIndex = this.panelList.findIndex((p) => p.category === category);
    if (newIndex >= 0 && newIndex != this.currentPanelIndex) {
      this.popPanel();
      this.currentPanelIndex = newIndex;
      this.showPanel();
    }
  }
  showNextPanel = (opts) => {
    this.popPanel();
    if (this.currentPanel.nextAction === NextCreationAction.StartGame) {
      Audio.playSound("data-audio-create-continue", "game-creator-3");
      this.gameStartingEvent.trigger();
    } else {
      if (opts?.skip && this.panelList[this.currentPanelIndex++].panel == opts.skip) {
        this.currentPanelIndex++;
      }
      Audio.playSound("data-audio-create-continue", "game-creator-2");
      this.currentPanelIndex++;
      this.showPanel();
    }
  };
  showPreviousPanel = () => {
    this.popPanel();
    if (this.currentPanelIndex > 0) {
      this.currentPanelIndex--;
      this.showPanel();
    } else {
      ContextManager.popUntil("main-menu");
      window.dispatchEvent(new GameCreatorClosedEvent());
    }
    Audio.playSound("data-audio-back-activate");
  };
  setCreateGameRoot(element) {
    this.createGameRoot = element;
  }
  setPanelList(panelList) {
    this.panelList = panelList;
    this._categories = this.panelList.map((panel) => panel.category).filter((cat, idx, arr) => cat !== void 0 && arr.indexOf(cat) === idx);
  }
  startGame() {
    this.isFirstTimeCreateGame = false;
    ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = false;
    window.dispatchEvent(new StartCampaignEvent());
    engine.call("startGame");
  }
  setBackground(background, forceDisplay) {
    if (background != this.currentBackground || forceDisplay) {
      WorldUI.clearBackground();
      WorldUI.addBackgroundLayer("age_sel_bg_ramp", {});
      if (background) {
        WorldUI.addMaskedBackgroundLayer(background, "age_sel_bg_mask", {
          stretch: StretchMode.UniformFill,
          alignY: AlignMode.Maximum
        });
      }
      this.currentBackground = background;
    }
  }
  launchFirstPanel() {
    if (this.panelList.length === 0) {
      console.error("game-creator: couldn't find a panel to launch");
      return;
    }
    this.currentPanelIndex = 0;
    this.showPanel();
  }
  popPanel() {
    if (this.openPanel) {
      ContextManager.pop(this.openPanel);
      this.openPanel = null;
      ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = false;
    }
  }
  showPanel() {
    const pushPanelOpts = {
      singleton: true,
      createMouseGuard: true,
      attributes: { shouldDarken: false },
      targetParent: this.createGameRoot,
      panelOptions: this.currentPanel.panelOptions
    };
    this.openPanel = ContextManager.push(this.currentPanel.panel, pushPanelOpts);
    ScreenProfilePageExternalStatus.isGameCreationDomainInitialized = true;
  }
}
const CreateGameModel = new CreateGameModelImpl();

export { CreateGameModel, NextCreationAction as N };
//# sourceMappingURL=create-game-model.js.map
