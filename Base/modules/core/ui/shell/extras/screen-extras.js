import { ActionActivateEvent } from '../../components/fxs-activatable.js';
import ContextManager from '../../context-manager/context-manager.js';
import ActionHandler from '../../input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../../input/input-events.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './screen-extras.html.js';
import styles from './screen-extras.scss.js';

class ScreenExtras extends Panel {
  title;
  closeButtonListener = () => {
    this.close();
  };
  engineInputListener = this.onEngineInput.bind(this);
  creditsListener = this.onCredits.bind(this);
  legalListener = this.onLegal.bind(this);
  rewatchIntroListener = this.onRewatchIntro.bind(this);
  additionalContentButtonListener = this.onAdditionalContentButtonPressed.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "additional-content-audio");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.title = MustGetElement(".additional-content-header", this.Root);
    const closeButton = MustGetElement(".additional-content-back-button", this.Root);
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    if (ActionHandler.isGamepadActive) {
      closeButton.classList.add("hidden");
    }
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    Telemetry.sendUIMenuAction({
      Menu: TelemetryMenuType.AdditionalContent,
      MenuAction: TelemetryMenuActionType.Load
    });
    const modsButton = MustGetElement(".extras-item-mods", this.Root);
    if (UI.supportsDLC()) {
      modsButton.addEventListener("action-activate", this.additionalContentButtonListener);
    } else {
      modsButton.remove();
    }
    const creditsButton = MustGetElement(".extras-item-credits", this.Root);
    creditsButton.addEventListener("action-activate", this.creditsListener);
    const legalButton = MustGetElement(".extras-item-legal", this.Root);
    legalButton.addEventListener("action-activate", this.legalListener);
    const rewatchIntroButton = MustGetElement(".extras-item-rewatch-intro", this.Root);
    rewatchIntroButton.addEventListener("action-activate", this.rewatchIntroListener);
    const graphicsBenchmarkButton = MustGetElement(".extras-item-benchmark-graphics", this.Root);
    const aiBenchmarkButton = MustGetElement(".extras-item-benchmark-ai", this.Root);
    if (UI.shouldDisplayBenchmarkingTools()) {
      graphicsBenchmarkButton.addEventListener("action-activate", this.onGraphicsBenchmark.bind(this));
      aiBenchmarkButton.addEventListener("action-activate", this.onAiBenchmark.bind(this));
    } else {
      graphicsBenchmarkButton.remove();
      aiBenchmarkButton.remove();
    }
    if (modsButton) {
      const openAdditionalContentOnShow = this.Root.getAttribute("open-additional-content");
      if (openAdditionalContentOnShow !== null && openAdditionalContentOnShow === "true") {
        requestAnimationFrame(() => {
          modsButton.dispatchEvent(new ActionActivateEvent(0, 0));
        });
      }
    }
  }
  onDetach() {
    this.playAnimateOutSound();
    Telemetry.sendUIMenuAction({
      Menu: TelemetryMenuType.AdditionalContent,
      MenuAction: TelemetryMenuActionType.Exit
    });
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    super.onDetach();
  }
  generateOpenCallbacks(callbacks) {
    callbacks["screen-credits"] = this.onCredits;
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const extraMenu = MustGetElement(".extras-menu", this.Root);
    FocusManager.get().setFocus(extraMenu);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  close() {
    ContextManager.popUntil("main-menu");
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "cancel" || inputEvent.detail.name == "sys-menu" || inputEvent.detail.name == "keyboard-escape") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onActiveDeviceTypeChanged(event) {
    const closeButton = MustGetElement(".additional-content-back-button", this.Root);
    closeButton.classList.toggle("hidden", event.detail?.gamepadActive);
  }
  onAdditionalContentButtonPressed(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const buttonID = event.target.getAttribute("button-id");
    if (!buttonID) {
      return;
    }
    this.title.setAttribute("title", "LOC_UI_CONTENT_MGR_TITLE");
    const slotGroup = MustGetElement(".additional-content-slot-group", this.Root);
    const screenModContent = MustGetElement(".mods-content", this.Root);
    slotGroup.setAttribute("selected-slot", buttonID);
    FocusManager.get().setFocus(screenModContent);
  }
  onCredits() {
    ContextManager.popUntil("main-menu");
    ContextManager.push("screen-credits", { singleton: true, createMouseGuard: false });
    Telemetry.sendUIMenuAction({
      Menu: TelemetryMenuType.AdditionalContent,
      MenuAction: TelemetryMenuActionType.Select,
      Item: "Credits"
    });
  }
  onLegal() {
    ContextManager.popUntil("main-menu");
    ContextManager.push("screen-mp-legal", {
      singleton: true,
      createMouseGuard: true,
      panelOptions: { viewOnly: true }
    });
    Telemetry.sendUIMenuAction({
      Menu: TelemetryMenuType.AdditionalContent,
      MenuAction: TelemetryMenuActionType.Select,
      Item: "Legal"
    });
  }
  onRewatchIntro() {
    ContextManager.popUntil("main-menu");
    ContextManager.push("screen-movie", {
      singleton: true,
      createMouseGuard: true,
      panelOptions: { movieId: "MOVIE_BASE_INTRO" }
    });
  }
  onGraphicsBenchmark() {
    Benchmark.Game.setDebugUiVisiblity(false);
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    Benchmark.Automation.start(GameBenchmarkType.GRAPHICS);
  }
  onAiBenchmark() {
    Benchmark.Game.setDebugUiVisiblity(false);
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    Benchmark.Automation.start(GameBenchmarkType.AI);
  }
}
Controls.define("screen-extras", {
  createInstance: ScreenExtras,
  description: "Extras screen.",
  classNames: ["screen-extras", "w-full", "h-full", "flex", "items-center", "justify-center"],
  styles: [styles],
  innerHTML: [content],
  opens: ["screen-credits"],
  skipPostOnAttach: true,
  attributes: [
    {
      name: "open-additional-content",
      description: "Attribute used to open the additional content section of the extras screen when shown."
    }
  ]
});

export { ScreenExtras };
//# sourceMappingURL=screen-extras.js.map
