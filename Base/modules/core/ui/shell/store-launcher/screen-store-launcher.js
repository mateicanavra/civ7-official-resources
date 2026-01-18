import ContextManager from '../../context-manager/context-manager.js';
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
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame class=\"flex-1 flow-column w-full h-full\">\r\n\t<fxs-header\r\n\t\tfiligree-style=\"h3\"\r\n\t\tclass=\"additional-content-header relative flex justify-center font-title text-2xl uppercase text-secondary mb-3\"\r\n\t\ttitle=\"LOC_UI_TOOLTIP_STORE\"\r\n\t></fxs-header>\r\n\t<collection-content class=\"collection-content flex-auto relative flow-column\"></collection-content>\r\n\t<div class=\"flow-row min-h-12\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"collection-cancel-button mr-3\"\r\n\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t\tcaption=\"LOC_GENERIC_CANCEL\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"collection-redeem-button\"\r\n\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t\tcaption=\"LOC_GENERIC_REDEEMCODE\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-frame>\r\n";

class ScreenStoreLauncher extends Panel {
  backButton;
  redeemButton;
  collectionContent;
  backButtonActivateListener = this.onBackButtonActivate.bind(this);
  redeemButtonActivateListener = this.onRedeemButtonActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.backButton = MustGetElement(".collection-cancel-button", this.Root);
    this.redeemButton = MustGetElement(".collection-redeem-button", this.Root);
    this.collectionContent = MustGetElement(".collection-content", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "collections");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.redeemButton.addEventListener("action-activate", this.redeemButtonActivateListener);
    this.redeemButton.setAttribute("data-audio-group-ref", "collections");
    this.redeemButton.setAttribute("data-audio-activate-ref", "data-audio-redeem-activate");
    this.backButton.addEventListener("action-activate", this.backButtonActivateListener);
  }
  onDetach() {
    super.onDetach();
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.Extras, MenuAction: TelemetryMenuActionType.Exit });
    this.Root.removeEventListener("engine-input", this.engineInputListener);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.collectionContent);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction2("LOC_GENERIC_REDEEMCODE");
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  setPanelOptions(_panelOptions) {
    const pendingContentSelection = _panelOptions.selectedContent ?? null;
    this.collectionContent.whenComponentCreated(
      (component) => component.setPendingContentSelection(pendingContentSelection)
    );
  }
  onEngineInput(inputEvent) {
    if (this.handleEngineInput(inputEvent)) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    if (inputEvent.isCancelInput()) {
      this.close();
      return true;
    } else if (inputEvent.detail.name == "shell-action-2") {
      this.onRedeemButtonActivate();
      return true;
    }
    return false;
  }
  onBackButtonActivate() {
    this.close();
  }
  onRedeemButtonActivate() {
    ContextManager.push("screen-twok-code-redemption", { singleton: true, createMouseGuard: true });
  }
}
Controls.define("screen-store-launcher", {
  createInstance: ScreenStoreLauncher,
  classNames: ["screen-store-launcher", "fullscreen", "flow-column", "justify-center", "items-center", "flex-1"],
  innerHTML: [content],
  attributes: []
});

export { ScreenStoreLauncher };
//# sourceMappingURL=screen-store-launcher.js.map
