import { ContextManager } from '../../../core/ui/context-manager/context-manager.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { NetworkUtilities } from '../../../core/ui/utilities/utilities-network.js';
import { LoadingStartCurtainRemoveName } from '../root-game.js';
import '../../ui-next/screens/hotseat/hotseat-curtain.js';

const HtmlIdHotseatCurtain = "hotseat-screen-curtain";
class MultiplayerIngameSingleton {
  mpPauseDialogID;
  multiplayerGameAbandonedListener = (data) => {
    this.onMultiplayerGameAbandoned(data);
  };
  multiplayerGameLastPlayerListener = () => {
    this.onMultiplayerGameLastPlayer();
  };
  localPlayerChangedListener = (data) => {
    this.onLocalPlayerChanged(data);
  };
  loadingStartCurtainRemoveListener = (event) => {
    this.onLoadingStartCurtainRemove(event);
  };
  /**
   * CTOR
   */
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  /**
   * Engine ready, establish callbacks.
   */
  onReady() {
    engine.on("MultiplayerGameAbandoned", this.multiplayerGameAbandonedListener, this);
    engine.on("MultiplayerGameLastPlayer", this.multiplayerGameLastPlayerListener, this);
    engine.on("LocalPlayerChanged", this.localPlayerChangedListener, this);
    if (Configuration.getGame().isHotseat) {
      window.addEventListener(LoadingStartCurtainRemoveName, this.loadingStartCurtainRemoveListener);
    }
  }
  /**
   * Engine Event - multiplayer game has been abandoned (by other players?)
   * @param data
   */
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
  /**
   * Engine Event - Last player in the game.
   */
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
  //===============================================================
  // Dialog Callbacks
  onAbandonedConfirm() {
    engine.call("exitToMainMenu");
  }
  /**
   * Is the hotseat curtain up (attached to the DOM and showing?)
   * @returns true if up, false otherwise.
   */
  isHotseatCurtainUp() {
    const element = document.querySelector(HtmlIdHotseatCurtain);
    if (element) {
      return true;
    }
    return false;
  }
  attachHotseatCurtain() {
    if (!this.canAttachCurtain()) {
      return;
    }
    const curtain = document.createElement("hotseat-curtain");
    curtain.id = HtmlIdHotseatCurtain;
    const popups = document.querySelector(".fxs-popups");
    if (!popups) {
      return;
    }
    popups.parentElement?.insertBefore(curtain, popups);
  }
  canAttachCurtain() {
    return ContextManager.canOpenPauseMenu();
  }
  /**
   * Local player changed; likely handing off game to another player (hotseat).
   */
  onLocalPlayerChanged(_data) {
    if (Configuration.getGame().isHotseat) {
      if (!InterfaceMode.isInDefaultMode()) {
        InterfaceMode.switchToDefault();
      }
      waitForLayout(() => {
        this.attachHotseatCurtain();
      });
    }
  }
  onLoadingStartCurtainRemove(event) {
    if (event.detail.id != "hotseat") {
      return;
    }
    if (Configuration.getGame().isHotseat) {
      if (!this.isHotseatCurtainUp()) {
        this.attachHotseatCurtain();
      }
    }
  }
}
const MultiplayerIngame = new MultiplayerIngameSingleton();

export { MultiplayerIngame as default };
//# sourceMappingURL=mp-ingame-mgr.js.map
