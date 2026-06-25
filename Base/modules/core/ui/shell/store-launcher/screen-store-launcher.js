import ContextManager from '../../context-manager/context-manager.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './screen-store-launcher.html.js';

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
    this.redeemButton.setAttribute("data-audio-focus-ref", "data-audio-focus");
    this.redeemButton.setAttribute("data-audio-press-ref", "data-audio-press");
    this.backButton.addEventListener("action-activate", this.backButtonActivateListener);
    this.backButton.setAttribute("data-audio-group-ref", "collections");
    this.backButton.setAttribute("data-audio-activate-ref", "data-audio-cancel-activate");
    this.backButton.setAttribute("data-audio-focus-ref", "data-audio-focus");
    this.backButton.setAttribute("data-audio-press-ref", "data-audio-press");
  }
  onDetach() {
    super.onDetach();
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.Extras, MenuAction: TelemetryMenuActionType.Exit });
    this.Root.removeEventListener("engine-input", this.engineInputListener);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.get().setFocus(this.collectionContent);
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
