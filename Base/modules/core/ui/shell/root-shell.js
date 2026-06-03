import { TtsManagerTooltipExtension } from '../accessibility/tts-manager-tooltip-extension.js';
import { TtsManager } from '../accessibility/tts-manager.js';
import ContextManager from '../context-manager/context-manager.js';
import { displayRequestUniqueId } from '../context-manager/display-handler.js';
import { DialogBoxManager } from '../dialog-box/manager-dialog-box.js';
import { SuspendCloseListenerEventName, ResumeCloseListenerEventName, MainMenuReturnEvent } from '../events/shell-events.js';
import MultiplayerShellManager from './mp-shell-logic/mp-shell-logic.js';
import '../../ui-next/components/tooltip-compat.js';
import { DialogBoxAction } from '../dialog-box/model-dialog-box.js';

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
//# sourceMappingURL=root-shell.js.map
