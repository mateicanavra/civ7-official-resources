import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { a as GetAgeMap } from '../create-panels/age-civ-select-model.chunk.js';
import { N as NextCreationAction, CreateGameModel } from '../create-panels/create-game-model.js';
import { G as GameCreationPromoManager } from '../create-panels/game-creation-promo-manager.chunk.js';
import { L as LeaderSelectModelManager } from '../leader-select/leader-select-model-manager.chunk.js';
import { L as LiveEventManager } from '../live-event-logic/live-event-logic.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../utilities/utilities-data.chunk.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../utilities/utilities-dom.chunk.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';

const styles = "fs://game/core/ui/shell/create-game/create-game-sp.css";

const panelList = [
  {
    panel: "leader-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_LEADER_SELECT_CATEGORY"
  },
  {
    panel: "age-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_AGE_CIV_SELECT_CATEGORY"
  },
  {
    panel: "civ-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_AGE_CIV_SELECT_CATEGORY"
  },
  {
    panel: "game-setup-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_GAME_START_CATEGORY"
  },
  {
    panel: "advanced-options-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_GAME_START_CATEGORY"
  }
];
const firstTimeTutorialPanelList = [
  {
    panel: "leader-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_LEADER_SELECT_CATEGORY"
  },
  {
    panel: "civ-select-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_AGE_CIV_SELECT_CATEGORY",
    panelOptions: { noAge: true }
  },
  {
    panel: "game-setup-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_GAME_START_CATEGORY"
  }
];
const fixedAgePanelList = [
  {
    panel: "leader-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_LEADER_SELECT_CATEGORY"
  },
  {
    panel: "civ-select-panel",
    nextAction: NextCreationAction.Continue,
    category: "LOC_CREATE_GAME_AGE_CIV_SELECT_CATEGORY",
    panelOptions: { noAge: true }
  },
  {
    panel: "game-setup-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_GAME_START_CATEGORY"
  },
  {
    panel: "advanced-options-panel",
    nextAction: NextCreationAction.StartGame,
    category: "LOC_CREATE_GAME_GAME_START_CATEGORY"
  }
];
class CreateGameSP extends Component {
  gameStartingEventListener = this.onGameStarting.bind(this);
  onAttach() {
    super.onAttach();
    let panels = panelList;
    if (CreateGameModel.isFirstTimeCreateGame) {
      const ageMap = GetAgeMap();
      GameSetup.setGameParameterValue("Age", "AGE_ANTIQUITY");
      CreateGameModel.selectedAge = ageMap.get("AGE_ANTIQUITY");
      panels = firstTimeTutorialPanelList;
    } else if (Online.Metaprogression.isPlayingActiveEvent()) {
      if (LiveEventManager.skipAgeSelect()) {
        panels = fixedAgePanelList;
      }
    }
    GameCreationPromoManager.refreshPromos();
    CreateGameModel.setCreateGameRoot(this.Root);
    CreateGameModel.setPanelList(panels);
    CreateGameModel.setBackground(void 0, true);
    CreateGameModel.gameStartingEvent.on(this.gameStartingEventListener);
    this.Root.listenForEngineEvent("InviteAccepted", this.onInviteAccepted.bind(this));
    waitForLayout(() => CreateGameModel.launchFirstPanel());
  }
  onDetach() {
    WorldUI.clearBackground();
    LeaderSelectModelManager.clearLeaderModels();
    CreateGameModel.gameStartingEvent.off(this.gameStartingEventListener);
    CreateGameModel.setCreateGameRoot(null);
    CreateGameModel.setPanelList([]);
    GameCreationPromoManager.cancelResolves();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    FocusManager.setFocus(this.Root);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onInviteAccepted() {
    CreateGameModel.onInviteAccepted();
  }
  /**
   * In response to a game starting, neatly as possible clear away the screen.
   */
  onGameStarting() {
    let hasStarted = false;
    const blackout = document.createElement("div");
    blackout.classList.add("game-creator-darken-screen", "absolute", "w-full", "h-full", "bg-black");
    blackout.addEventListener("animationend", (_event) => {
      hasStarted = true;
      CreateGameModel.startGame();
    });
    document.body.appendChild(blackout);
    const framesUntilForceStart = 240;
    delayByFrame(() => {
      if (!hasStarted) {
        console.error("Starting game via safety, the call from the fadeout animationend did not occur.");
        hasStarted = true;
        CreateGameModel.startGame();
      }
    }, framesUntilForceStart);
  }
}
Controls.define("create-game-sp", {
  createInstance: CreateGameSP,
  description: "Create a single-player custom game",
  styles: [styles],
  classNames: ["fullscreen"],
  requires: ["age-select-panel", "leader-select-panel", "civ-select-panel", "game-setup-panel"],
  images: [
    "blp:shell_back-button",
    "blp:shell_back-button-focus",
    "blp:shell_arrow-button",
    "blp:shell_arrow-button-focus",
    "blp:shell_create-tab-bg",
    "blp:shell_create-tab-bg-focus",
    "blp:hud_unit-panel_box-bg"
  ],
  tabIndex: -1
});
//# sourceMappingURL=create-game-sp.js.map
