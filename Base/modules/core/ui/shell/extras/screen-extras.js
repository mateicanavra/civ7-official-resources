import ContextManager from '../../context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../input/action-handler.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame class=\"additional-content-root-frame h-screen\">\r\n\t<fxs-vslot\r\n\t\tclass=\"extras-menu items-center flex-auto\"\r\n\t\ttabindex=\"-1\"\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tfiligree-style=\"none\"\r\n\t\t\tclass=\"additional-content-header relative flex justify-center font-title text-2xl uppercase text-secondary mb-3\"\r\n\t\t\ttitle=\"LOC_MAIN_MENU_ADDITIONAL_CONTENT\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-hslot class=\"additional-content-container w-full flex-auto my-4\">\r\n\t\t\t<fxs-slot-group\r\n\t\t\t\tclass=\"additional-content-slot-group flex-auto relative\"\r\n\t\t\t\tselected-slot=\"main\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-slot\r\n\t\t\t\t\tid=\"main\"\r\n\t\t\t\t\tclass=\"additional-content-main w-full flex-auto relative flex flex-col justify-center items-center\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<fxs-vslot class=\"w-full\">\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"mods\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-mods\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_UI_CONTENT_MGR_SUBTITLE\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_UI_CONTENT_MGR_SUBTITLE_DESCRIPTION\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"benchmark-graphics\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-benchmark-graphics\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_MAIN_MENU_BENCHMARK_GRAPHICS\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_MAIN_MENU_BENCHMARK_GRAPHICS_DESCRIPTION\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"benchmark-ai\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-benchmark-ai\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_MAIN_MENU_BENCHMARK_AI\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_MAIN_MENU_BENCHMARK_AI_DESCRIPTION\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"credits\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-credits\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_MAIN_MENU_CREDITS\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_MAIN_MENU_CREDITS_DESCRIPTION\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"legal\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-legal\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_UI_LEGAL_TITLE\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_UI_LEGAL_TITLE_DESCRIPTION\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t\t<fxs-text-button\r\n\t\t\t\t\t\t\tbutton-id=\"rewatch-intro\"\r\n\t\t\t\t\t\t\ttype=\"big\"\r\n\t\t\t\t\t\t\tclass=\"uppercase extras-item-rewatch-intro\"\r\n\t\t\t\t\t\t\tcaption=\"LOC_UI_REWATCH_INTRO\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\thighlight-style=\"decorative\"\r\n\t\t\t\t\t\t\tdata-tooltip-content=\"LOC_UI_REWATCH_INTRO_DESCRIPTION\"\r\n\t\t\t\t\t\t\tdata-audio-group-ref=\"additional-content-audio\"\r\n\t\t\t\t\t\t\tdata-audio-activate-ref=\"data-audio-clicked-credits\"\r\n\t\t\t\t\t\t></fxs-text-button>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t</fxs-slot>\r\n\t\t\t\t<mods-content\r\n\t\t\t\t\tid=\"mods\"\r\n\t\t\t\t\tclass=\"mods-content flex-auto flow-column\"\r\n\t\t\t\t></mods-content>\r\n\t\t\t\t<fxs-slot\r\n\t\t\t\t\tid=\"credits\"\r\n\t\t\t\t\tclass=\"additional-content-credits flex-auto relative flex flex-col justify-center\"\r\n\t\t\t\t>\r\n\t\t\t\t</fxs-slot>\r\n\t\t\t\t<fxs-slot\r\n\t\t\t\t\tid=\"legal\"\r\n\t\t\t\t\tclass=\"additional-content-legal flex-auto relative flex flex-col justify-center\"\r\n\t\t\t\t>\r\n\t\t\t\t</fxs-slot>\r\n\t\t\t</fxs-slot-group>\r\n\t\t</fxs-hslot>\r\n\t\t<fxs-hslot class=\"self-center\">\r\n\t\t\t<fxs-button\r\n\t\t\t\tclass=\"additional-content-back-button cancel\"\r\n\t\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t\t></fxs-button>\r\n\t\t</fxs-hslot>\r\n\t</fxs-vslot>\r\n</fxs-frame>\r\n";

const styles = "fs://game/core/ui/shell/extras/screen-extras.css";

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
    FocusManager.setFocus(extraMenu);
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
    FocusManager.setFocus(screenModContent);
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
    Benchmark.Automation.start(GameBenchmarkType.GRAPHICS);
  }
  onAiBenchmark() {
    Benchmark.Game.setDebugUiVisiblity(false);
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
  attributes: []
});

export { ScreenExtras };
//# sourceMappingURL=screen-extras.js.map
