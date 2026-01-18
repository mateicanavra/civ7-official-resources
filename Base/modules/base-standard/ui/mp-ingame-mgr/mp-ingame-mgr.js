import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { NetworkUtilities } from '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';

class MultiplayerIngameSingleton {
  mpPauseDialogID;
  multiplayerGameAbandonedListener = (data) => {
    this.onMultiplayerGameAbandoned(data);
  };
  multiplayerGameLastPlayerListener = () => {
    this.onMultiplayerGameLastPlayer();
  };
  multiplayerGamePauseStateChangedListener = (data) => {
    this.onMultiplayerPauseStatus(data);
  };
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  //===============================================================
  // UI Object Events
  onReady() {
    engine.on("MultiplayerGameAbandoned", this.multiplayerGameAbandonedListener);
    engine.on("MultiplayerGameLastPlayer", this.multiplayerGameLastPlayerListener);
    engine.on("GamePauseStateChanged", this.multiplayerGamePauseStateChangedListener);
  }
  //===============================================================
  // Engine Events
  onMultiplayerGameAbandoned(data) {
    const abandonPopup = NetworkUtilities.multiplayerAbandonReasonToPopup(
      data.reason
    );
    DialogBoxManager.createDialog_Confirm({
      body: abandonPopup.body,
      title: abandonPopup.title,
      callback: this.onAbandonedConfirm
    });
  }
  onMultiplayerGameLastPlayer() {
    if (ContextManager.getTarget("screen-endgame")) {
      return;
    }
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (localPlayer && !localPlayer.isAlive) {
      return;
    }
    if (!ContextManager.isGameActive()) {
      return;
    }
    DialogBoxManager.createDialog_Confirm({
      body: "TXT_KEY_MP_LAST_PLAYER",
      title: "TXT_KEY_MP_LAST_PLAYER_TITLE"
    });
  }
  onMultiplayerPauseStatus(data) {
    if (ContextManager.getTarget("screen-endgame")) {
      return;
    }
    if (!ContextManager.isGameActive()) {
      return;
    }
    if (data.data == 1) {
      if (this.mpPauseDialogID != void 0) {
        DialogBoxManager.closeDialogBox(this.mpPauseDialogID);
        this.mpPauseDialogID = void 0;
      }
      const pauseNumPlayers = Network.getNumWantPausePlayers();
      const pausePlayerStr = Network.getWantPausePlayerName();
      let bodyText = "";
      if (pauseNumPlayers > 1) {
        bodyText = Locale.stylize("LOC_MP_PAUSE_POPUP_BODY_MULTI_WANT_PAUSE", pauseNumPlayers, pausePlayerStr);
      } else {
        bodyText = Locale.stylize("LOC_MP_PAUSE_POPUP_BODY_SINGLE_WANT_PAUSE", pausePlayerStr);
      }
      const options = [];
      this.mpPauseDialogID = DialogBoxManager.createDialog_MultiOption({
        title: "LOC_MP_PAUSE_POPUP_TITLE",
        body: bodyText,
        options,
        canClose: false,
        displayHourGlass: true
      });
    } else {
      if (this.mpPauseDialogID != void 0) {
        DialogBoxManager.closeDialogBox(this.mpPauseDialogID);
        this.mpPauseDialogID = void 0;
      }
    }
  }
  //===============================================================
  // Dialog Callbacks
  onAbandonedConfirm() {
    engine.call("exitToMainMenu");
  }
}
const MultiplayerIngame = new MultiplayerIngameSingleton();

export { MultiplayerIngame as default };
//# sourceMappingURL=mp-ingame-mgr.js.map
