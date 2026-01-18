/* empty css                        */
/* empty css                                 */
import ContextManager from '../context-manager/context-manager.js';
import '../input/focus-manager.js';
import '../input/action-handler.js';
import '../input/cursor.js';
import '../tooltips/tooltip-manager.js';
import '../tooltips/default-tooltip.js';
import '../spatial/spatial-manager.js';
import { TtsManagerTooltipExtension } from '../accessibility/tts-manager-tooltip-extension.chunk.js';
import { TtsManager } from '../accessibility/tts-manager.js';
import { d as displayRequestUniqueId, D as DialogBoxAction, a as DialogBoxManager } from '../dialog-box/manager-dialog-box.chunk.js';
import { S as SuspendCloseListenerEventName, R as ResumeCloseListenerEventName, M as MainMenuReturnEvent } from '../events/shell-events.chunk.js';
import { M as MultiplayerShellManager } from './mp-shell-logic/mp-shell-logic.chunk.js';
import './live-event-logic/live-event-logic.chunk.js';
import '../context-manager/display-queue-manager.js';
import '../framework.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../input/input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../input/plot-cursor.js';
import '../utilities/utilities-dom.chunk.js';
import '../utilities/utilities-layout.chunk.js';
import '../profile-page/screen-profile-page.js';
import '../components/fxs-dropdown.chunk.js';
import '../components/fxs-activatable.chunk.js';
import '../input/focus-support.chunk.js';
import '../components/fxs-slot.chunk.js';
import '../navigation-tray/model-navigation-tray.chunk.js';
import '../utilities/utilities-image.chunk.js';
import '../utilities/utilities-component-id.chunk.js';
import '../save-load/model-save-load.chunk.js';
import './leader-select/leader-button/leader-button.js';
import '../utilities/utilities-liveops.js';
import '../utilities/utilities-metaprogression.chunk.js';
import '../utilities/utilities-network-constants.chunk.js';
import '../utilities/utilities-network.js';
import './mp-legal/mp-legal.js';

window.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("content-manager");
  if (menu) {
    menu.classList.remove("hidden");
  }
});
window.addEventListener("load", () => {
  const menu = document.getElementById("content-manager");
  if (menu) {
    menu.classList.remove("hidden");
  }
});
const dialogExitId = displayRequestUniqueId();
let isClosingDialogSuspended = false;
let isClosingDialogQueued = false;
let isClosingDialogOpen = false;
engine.whenReady.then(() => {
  CohtmlSpeechAPI.run();
  TtsManager.registerWithContextManager();
  TtsManager.registerExtension(new TtsManagerTooltipExtension());
  UI.registerCursor(UIHTMLCursorTypes.Auto, UICursorTypes.DEFAULT, "fs://game/core/ui/cursors/Pointer.ani");
  UI.registerCursor(UIHTMLCursorTypes.Default, UICursorTypes.DEFAULT, "fs://game/core/ui/cursors/Pointer.ani");
  UI.registerCursor(UIHTMLCursorTypes.Pointer, UICursorTypes.GRAB, "fs://game/core/ui/cursors/handpointer.ani");
  UI.registerCursor(
    UIHTMLCursorTypes.NotAllowed,
    UICursorTypes.CANT_PLACE,
    "fs://game/core/ui/cursors/cantplace.ani"
  );
  UI.registerCursor(UIHTMLCursorTypes.Wait, UICursorTypes.WAIT, "fs://game/core/ui/cursors/loading.ani");
  UI.registerCursor(UIHTMLCursorTypes.Help, UICursorTypes.HELP, "fs://game/core/ui/cursors/info.ani");
  UI.registerCursor(UIHTMLCursorTypes.Place, UICursorTypes.PLACE, "fs://game/core/ui/cursors/place.ani");
  UI.registerCursor(UIHTMLCursorTypes.CantPlace, UICursorTypes.CANT_PLACE, "fs://game/core/ui/cursors/cantplace.ani");
  UI.registerCursor(UIHTMLCursorTypes.Enemy, UICursorTypes.ENEMY, "fs://game/core/ui/cursors/enemy.ani");
  UI.registerCursor(UIHTMLCursorTypes.Attack, UICursorTypes.ATTACK, "fs://game/core/ui/cursors/attack.ani");
  UI.registerCursor(UIHTMLCursorTypes.Ranged, UICursorTypes.RANGED, "fs://game/core/ui/cursors/ranged.ani");
  const userRequestCloseListener = () => {
    if (isClosingDialogSuspended) {
      isClosingDialogQueued = true;
      return;
    }
    if (isClosingDialogOpen) {
      return;
    }
    const dbCallback = (eAction) => {
      isClosingDialogOpen = false;
      if (eAction == DialogBoxAction.Confirm) {
        engine.call("userConfirmedClose");
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      dialogId: dialogExitId,
      body: "LOC_CLOSEMGR_CONFIRM_BODY",
      title: "LOC_CLOSEMGR_CONFIRM_TITLE",
      displayQueue: "SystemMessage",
      addToFront: true,
      canClose: false,
      callback: dbCallback
    });
    isClosingDialogOpen = true;
  };
  const suspendRequestCloseListener = () => {
    isClosingDialogSuspended = true;
  };
  const resumeRequestCloseListener = () => {
    isClosingDialogSuspended = false;
    if (isClosingDialogQueued) {
      isClosingDialogQueued = false;
      userRequestCloseListener();
    }
  };
  engine.on("UserRequestClose", userRequestCloseListener);
  window.addEventListener(SuspendCloseListenerEventName, suspendRequestCloseListener);
  window.addEventListener(ResumeCloseListenerEventName, resumeRequestCloseListener);
  Input.setActiveContext(InputContext.Shell);
  engine.on("NetworkDisconnected", showDisconnectionPopup.bind(undefined));
  engine.on("NetworkReconnected", resetDisconnectionPopup.bind(undefined));
});
Loading.runWhenLoaded(() => {
  const rootElement = document.querySelector("#roots");
  if (rootElement) {
    rootElement.appendChild(document.createElement("oob-experience-manager"));
  }
  ContextManager.registerEngineInputHandler(MultiplayerShellManager);
  if (Automation.isActive && Configuration.getUser().firstTimeTutorialEnabled) {
    Configuration.getUser().setFirstTimeTutorialEnabled(false);
    Configuration.getUser().saveCheckpoint();
  }
});
function showDisconnectionPopup() {
  if (UI.shouldShowDisconnectionPopup()) {
    const gameConfig = Configuration.getGame();
    DialogBoxManager.createDialog_Confirm({
      body: "LOC_UI_NO_INTERNET_CONNECTION",
      title: "LOC_UI_NO_INTERNET_CONNECTION_TITLE",
      callback: (_eAction) => {
        if (!gameConfig.isLocalMultiplayer) {
          ContextManager.popUntil("main-menu");
          window.dispatchEvent(new MainMenuReturnEvent());
        }
      }
    });
    UI.setDisconnectionPopupWasShown(true);
  }
}
function resetDisconnectionPopup() {
  UI.setDisconnectionPopupWasShown(false);
}

const rootShell_html_htmlProxy_inlineCss_index_11 = '';
//# sourceMappingURL=root-shell.js.map
