import { __vitePreload } from '../../core/vendor/vite/preload-helper.js';

await Loading.isInitialized;
const { default: ContextManager } = await __vitePreload(async () => { const { default: ContextManager } = await import('../../core/ui/context-manager/context-manager.js');return { default: ContextManager }},true              ?[]:void 0);
await __vitePreload(() => import('../../core/ui/input/action-handler.js'),true              ?[]:void 0);
await __vitePreload(() => import('../../core/ui-next/components/tooltip-compat.js'),true              ?[]:void 0);
const { TtsManager } = await __vitePreload(async () => { const { TtsManager } = await import('../../core/ui/accessibility/tts-manager.js');return { TtsManager }},true              ?[]:void 0);
const LoadingStartCurtainRemoveName = "loading-start-curtain-removed";
class LoadingStartCurtainRemoveEvent extends CustomEvent {
  constructor(detail) {
    super(LoadingStartCurtainRemoveName, { bubbles: false, cancelable: false, detail });
  }
}
class LoadingInputHandler {
  loadScreen = null;
  handleInput(inputEvent) {
    if (!this.loadScreen) {
      this.loadScreen = document.getElementById("load-screen");
    }
    if (inputEvent.detail.isMouse || inputEvent.detail.isTouch) {
      const hoverTargets = [...document.querySelectorAll(":hover")];
      if (hoverTargets.length > 0) {
        hoverTargets[hoverTargets.length - 1]?.dispatchEvent(inputEvent);
      }
    } else {
      this.loadScreen?.dispatchEvent(inputEvent);
    }
    return false;
  }
  handleNavigation(navigationEvent) {
    if (!this.loadScreen) {
      this.loadScreen = document.getElementById("load-screen");
    }
    this.loadScreen?.dispatchEvent(navigationEvent);
    return false;
  }
}
TtsManager.registerWithContextManager();
const loadingInputHandler = new LoadingInputHandler();
ContextManager.registerEngineInputHandler(loadingInputHandler);
await Loading.whenLoaded;
const { default: CameraController } = await __vitePreload(async () => { const { default: CameraController } = await import('../../core/ui/camera/camera-controller.js');return { default: CameraController }},true              ?[]:void 0);
const {
  default: DialogManager,
  DialogBoxAction,
  DialogSource
} = await __vitePreload(async () => { const {
  default: DialogManager,
  DialogBoxAction,
  DialogSource
} = await import('../../core/ui/dialog-box/manager-dialog-box.js');return {
  default: DialogManager,
  DialogBoxAction,
  DialogSource
}},true              ?[]:void 0);
const { default: HotkeyManager } = await __vitePreload(async () => { const { default: HotkeyManager } = await import('../../core/ui/input/hotkey-manager.js');return { default: HotkeyManager }},true              ?[]:void 0);
const { default: InputFilterManager } = await __vitePreload(async () => { const { default: InputFilterManager } = await import('../../core/ui/input/input-filter.js');return { default: InputFilterManager }},true              ?[]:void 0);
const { default: Cursor } = await __vitePreload(async () => { const { default: Cursor } = await import('../../core/ui/input/cursor.js');return { default: Cursor }},true              ?[]:void 0);
const { PlotCursor } = await __vitePreload(async () => { const { PlotCursor } = await import('../../core/ui/input/plot-cursor.js');return { PlotCursor }},true              ?[]:void 0);
const { default: ViewManager, SwitchViewResult } = await __vitePreload(async () => { const { default: ViewManager, SwitchViewResult } = await import('../../core/ui/views/view-manager.js');return { default: ViewManager, SwitchViewResult }},true              ?[]:void 0);
const { InterfaceMode } = await __vitePreload(async () => { const { InterfaceMode } = await import('../../core/ui/interface-modes/interface-modes.js');return { InterfaceMode }},true              ?[]:void 0);
const { InitDebugWidgets } = await __vitePreload(async () => { const { InitDebugWidgets } = await import('./debug/hud-debug-widgets.js');return { InitDebugWidgets }},true              ?[]:void 0);
const { Icon } = await __vitePreload(async () => { const { Icon } = await import('../../core/ui/utilities/utilities-image.js');return { Icon }},true              ?[]:void 0);
const { default: WorldInput } = await __vitePreload(async () => { const { default: WorldInput } = await import('./world-input/world-input.js');return { default: WorldInput }},true              ?[]:void 0);
const { default: TooltipManager } = await __vitePreload(async () => { const { default: TooltipManager } = await import('../../core/ui/tooltips/tooltip-manager.js');return { default: TooltipManager }},true              ?[]:void 0);
const { default: TutorialManager } = await __vitePreload(async () => { const { default: TutorialManager } = await import('./tutorial/tutorial-manager.js');return { default: TutorialManager }},true              ?[]:void 0);
const { DisplayQueueManager } = await __vitePreload(async () => { const { DisplayQueueManager } = await import('../../core/ui/context-manager/display-queue-manager.js');return { DisplayQueueManager }},true              ?[]:void 0);
const { instance: Civilopedia } = await __vitePreload(async () => { const { instance: Civilopedia } = await import('./civilopedia/model-civilopedia.js');return { instance: Civilopedia }},true              ?[]:void 0);
const { openBenchmarkUi } = await __vitePreload(async () => { const { openBenchmarkUi } = await import('./benchmark/screen-benchmark.js');return { openBenchmarkUi }},true              ?[]:void 0);
const { MustGetElement } = await __vitePreload(async () => { const { MustGetElement } = await import('../../core/ui/utilities/utilities-dom.js');return { MustGetElement }},true              ?[]:void 0);
const { displayRequestUniqueId } = await __vitePreload(async () => { const { displayRequestUniqueId } = await import('../../core/ui/context-manager/display-handler.js');return { displayRequestUniqueId }},true              ?[]:void 0);
const { TtsManagerTooltipExtension } = await __vitePreload(async () => { const { TtsManagerTooltipExtension } = await import('../../core/ui/accessibility/tts-manager-tooltip-extension.js');return { TtsManagerTooltipExtension }},true              ?[]:void 0);
const { InitApp } = await __vitePreload(async () => { const { InitApp } = await import('./app.js');return { InitApp }},true              ?[]:void 0);
const dialogExitId = displayRequestUniqueId();
let isClosingDialogOpen = false;
function openCivilopedia(searchTerm) {
  if (searchTerm) {
    const result = Civilopedia.search(searchTerm, 1);
    if (result.length > 0) {
      Civilopedia.navigateTo(result[0].page);
      ContextManager.push("screen-civilopedia", { singleton: true, createMouseGuard: true });
      return;
    }
  }
  Civilopedia.navigateHome();
  ContextManager.push("screen-civilopedia", { singleton: true, createMouseGuard: true });
}
function openScreenshotView() {
  if (ViewManager.switchToEmptyView() != SwitchViewResult.Error) {
    waitForLayout(() => {
      InterfaceMode.switchTo("INTERFACEMODE_SCREENSHOT");
    });
  }
}
function openTutorialInspector() {
  DialogManager.setSource(DialogSource.Game);
  DisplayQueueManager.resume();
  ContextManager.push("panel-tutorial-inspector", { singleton: true });
}
const userRequestCloseListener = () => {
  if (isClosingDialogOpen) {
    return;
  }
  const dbCallback = (eAction) => {
    isClosingDialogOpen = false;
    if (eAction == DialogBoxAction.Confirm) {
      engine.call("userConfirmedClose");
    }
  };
  DialogManager.createDialog_ConfirmCancel({
    dialogId: dialogExitId,
    body: "LOC_CLOSEMGR_CONFIRM_BODY",
    title: "LOC_CLOSEMGR_CONFIRM_TITLE",
    canClose: false,
    displayQueue: "SystemMessage",
    addToFront: true,
    callback: dbCallback
  });
  isClosingDialogOpen = true;
};
const rootElement = document.querySelector(":root");
if (rootElement) {
  const playerList = Players.getEverAlive();
  for (const p of playerList) {
    rootElement.style.setProperty(`--player${p.id}-color-primary`, UI.Player.getPrimaryColorValueAsString(p.id));
    rootElement.style.setProperty(
      `--player${p.id}-color-secondary`,
      UI.Player.getSecondaryColorValueAsString(p.id)
    );
  }
  const localPlayer = Players.get(GameContext.localObserverID);
  if (localPlayer) {
    rootElement.style.setProperty(
      "--player-pattern",
      Icon.getCivLineCSSFromCivilizationType(localPlayer.civilizationType)
    );
    rootElement.style.setProperty(
      "--player-symbol",
      Icon.getCivSymbolCSSFromCivilizationType(localPlayer.civilizationType)
    );
  }
}
if (Network.supportsSSO()) {
  const tooltips = MustGetElement("#tooltips", document.body);
  tooltips.insertAdjacentElement("beforebegin", document.createElement("live-notice-panel"));
}
engine.on("UserRequestClose", userRequestCloseListener);
engine.on("NetworkDisconnected", showDisconnectionPopup.bind(void 0));
engine.on("NetworkReconnected", resetDisconnectionPopup.bind(void 0));
if (Benchmark.Game.isRunning()) {
  openBenchmarkUi();
}
engine.on("BenchStarted", openBenchmarkUi);
ContextManager.registerEngineInputHandler(InputFilterManager);
ContextManager.registerEngineInputHandler(InterfaceMode);
ContextManager.registerEngineInputHandler(TutorialManager);
ContextManager.registerEngineInputHandler(ViewManager);
ContextManager.registerEngineInputHandler(Cursor);
ContextManager.registerEngineInputHandler(CameraController);
ContextManager.registerEngineInputHandler(PlotCursor);
ContextManager.registerEngineInputHandler(WorldInput);
ContextManager.registerEngineInputHandler(TooltipManager);
ContextManager.registerEngineInputHandler(HotkeyManager);
TtsManager.registerExtension(new TtsManagerTooltipExtension());
engine.on("open-civilopedia", openCivilopedia);
engine.on("open-tutorial-inspector", openTutorialInspector);
engine.on("open-screenshot-view", openScreenshotView);
UI.Control.registerHotkey("open-civilopedia");
const frameLimit = 30;
let framesLeft = frameLimit;
new Promise((resolve, reject) => {
  const checkDOMReady = () => {
    framesLeft--;
    requestAnimationFrame(() => {
      const keyElement = document.querySelector("#world");
      if (keyElement?.isConnected) {
        resolve();
      } else if (framesLeft == 0) {
        console.error(
          `ERROR - Failed to signal UI loaded when inspecting DOM for system bar across ${frameLimit} frames.`
        );
        reject();
      } else {
        checkDOMReady();
      }
    });
  };
  checkDOMReady();
}).finally(() => {
  console.log(`DOMReady with ${framesLeft} frames to spare.`);
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("user-interface-loaded-and-ready", { cancelable: false }));
  }, 1e3);
});
function showDisconnectionPopup() {
  if (UI.shouldShowDisconnectionPopup() && ContextManager.isGameActive()) {
    DialogManager.createDialog_Confirm({
      body: "LOC_UI_NO_INTERNET_CONNECTION",
      title: "LOC_UI_NO_INTERNET_CONNECTION_TITLE"
    });
    UI.setDisconnectionPopupWasShown(true);
  }
}
function resetDisconnectionPopup() {
  UI.setDisconnectionPopupWasShown(false);
}
function showLoadingAnimation() {
  const animButtonContainer = document.getElementById("loading-root");
  if (animButtonContainer) {
    const flipbook = document.createElement("flip-book");
    const flipbookDefinition = {
      fps: 30,
      atlas: [
        ["fs://game/hourglasses01.png", 128, 128, 512],
        ["fs://game/hourglasses02.png", 128, 128, 512],
        ["fs://game/hourglasses03.png", 128, 128, 1024, 13]
      ]
    };
    flipbook.setAttribute("data-flipbook-definition", JSON.stringify(flipbookDefinition));
    animButtonContainer.appendChild(flipbook);
    animButtonContainer.classList.remove("hidden");
  } else {
    console.error("root-game: Unable to find container for loading gif.");
  }
}
function hideLoadingAnimation() {
}
function handleInput(inputEvent) {
  if (inputEvent.type != "engine-input") {
    console.warn(
      "root-game: Attempt to process a non 'engine-input' custom event in the input handler: ",
      inputEvent.type
    );
    return true;
  }
  if (inputEvent.detail.status != InputActionStatuses.FINISH) {
    return true;
  }
  if (inputEvent.detail.name != "sys-menu" && inputEvent.detail.name != "keyboard-escape") {
    return true;
  }
  if (ContextManager.canOpenPauseMenu()) {
    if (!InterfaceMode.isInInterfaceMode("INTERFACEMODE_PAUSE_MENU")) {
      DisplayQueueManager.suspend();
      InterfaceMode.switchTo("INTERFACEMODE_PAUSE_MENU");
    } else {
      return true;
    }
  }
  inputEvent.stopPropagation();
  inputEvent.preventDefault();
  return false;
}
const onPullCurtainImpl = () => {
  ContextManager.unregisterEngineInputHandler(loadingInputHandler);
  const curtain = document.getElementById("loading-curtain");
  if (curtain) {
    curtain.addEventListener("animationend", (event) => {
      if (event.target == curtain) {
        window.requestAnimationFrame(() => {
          document.body.removeChild(curtain);
          document.head.querySelector('link[href$="load-screen.css"]')?.remove();
          document.documentElement.classList.remove("age-transition");
        });
      }
    });
    curtain.classList.add("curtain-opened");
    engine.call("setSnapshotEnabled", false);
    InterfaceMode.startup();
  }
  const userConfig = Configuration.getUser();
  if (userConfig.firstTimeTutorialEnabled) {
    userConfig.setFirstTimeTutorialEnabled(false);
    userConfig.saveCheckpoint();
  }
  const maxSignals = Configuration.getGame().isHotseat ? 2 : 1;
  window.dispatchEvent(new LoadingStartCurtainRemoveEvent({ id: "global", index: 0, max: maxSignals }));
  if (Configuration.getGame().isHotseat) {
    window.dispatchEvent(new LoadingStartCurtainRemoveEvent({ id: "hotseat", index: 1, max: maxSignals }));
  }
  hideLoadingAnimation();
  window.addEventListener("engine-input", handleInput);
};
const onPullCurtain = () => {
  const cameraState = UI.getAgeTransitionCameraState();
  if (cameraState != null && Configuration.getGame().previousAgeCount > 0) {
    const params = { zoom: cameraState.zoomLevel, instantaneous: true };
    Camera.lookAt(cameraState.focusPoint.x, cameraState.focusPoint.y, params);
  }
  setTimeout(onPullCurtainImpl, 1e3);
};
Loading.runWhenFinished(onPullCurtain);
showLoadingAnimation();
engine.whenReady.then(() => {
  if (UI.supports(UISupportedFeature.HUDOffsets)) {
    let value = UI.getOption("user", "Accessibility", "HUDOffset") ?? 0;
    if (typeof value != "number" || value < 0 || value > 100) {
      value = 0;
    }
    value = Math.floor(value);
    document.documentElement.style.setProperty("--hud-offset", value.toString());
  }
  InitDebugWidgets();
  InitApp();
});

export { LoadingStartCurtainRemoveEvent, LoadingStartCurtainRemoveName };
//# sourceMappingURL=root-game.js.map
