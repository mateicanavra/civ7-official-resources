import ContextManager from '../../context-manager/context-manager.js';
import { InputEngineEventName } from '../../input/input-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';

class ScreenAdditionalContent extends Panel {
  backButton;
  modsContent;
  backButtonActivateListener = this.onBackButtonActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.innerHTML = this.getContent();
    this.backButton = MustGetElement(".additional-content-back-button", this.Root);
    this.modsContent = MustGetElement(".mods-content", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "collections");
  }
  getContent() {
    return `
			<fxs-frame class="flex-1 flow-column w-full h-full">
				<fxs-header title="LOC_UI_STORE_ADDITIONAL_CONTENT" class="font-title text-2xl text-center uppercase tracking-100 mb-3" filigree-style="none"></fxs-header>
				<mods-content class="mods-content flex-auto flow-column"></mods-content>
				<div class="flow-row min-h-12" data-bind-class-toggle="mt-4:!{{g_NavTray.isTrayRequired}}">
					<fxs-button class="additional-content-back-button mr-3" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}" caption="LOC_GENERIC_BACK"></fxs-button>
				</div>
			</fxs-frame>
		`;
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.backButton.addEventListener("action-activate", this.backButtonActivateListener);
  }
  onDetach() {
    super.onDetach();
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    if (ContextManager.getCurrentTarget() != this.Root) {
      return;
    }
    FocusManager.get().setFocus(this.modsContent);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
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
    }
    return false;
  }
  onBackButtonActivate() {
    this.close();
  }
}
Controls.define("screen-additional-content", {
  createInstance: ScreenAdditionalContent,
  classNames: ["screen-additional-content", "fullscreen", "flow-column", "justify-center", "items-center", "flex-1"],
  attributes: []
});

export { ScreenAdditionalContent };
//# sourceMappingURL=screen-additional-content.js.map
