import FocusManager from '../../input/focus-manager.js';
import { I as InputEngineEvent } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { s as styles } from './2k-code-redemption.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame\r\n\tclass=\"grow mt-24\"\r\n\tframe-style=\"f1\"\r\n>\r\n\t<div class=\"relative flex flex-row flex-auto dlc-main-container\">\r\n\t\t<div class=\"relative flex flex-col dlc-image\"></div>\r\n\t\t<div class=\"relative flex flex-col flex-auto dlc-content-container w-2\\/3 px-10\">\r\n\t\t\t<fxs-scrollable class=\"dlc-viewer-scrollable\">\r\n\t\t\t\t<div class=\"relative flex flex-col dlc-text-container grow\">\r\n\t\t\t\t\t<fxs-header class=\"dlc-name\"></fxs-header>\r\n\t\t\t\t\t<div class=\"dlc-text relative font-body text-base\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-scrollable>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"relative flex flex-row relative button-container mt-6 flex flow-row-wrap justify-center\"\r\n\t\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"buy hidden mr-2\"\r\n\t\t\t\t\tcaption=\"LOC_UI_STORE_BUY\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tclass=\"cancel\"\r\n\t\t\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</fxs-frame>\r\n";

const bForceShowPromoLoadingSpinner = false;
class PanelDLCViewer extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  backButtonListener = this.close.bind(this);
  owned = true;
  scrollable = null;
  constructor(root) {
    super(root);
  }
  onInitialize() {
    const imageURL = this.Root.getAttribute("imageUrl");
    const dlcImage = MustGetElement(".dlc-image", this.Root);
    if (imageURL && !bForceShowPromoLoadingSpinner) {
      this.hidePromoLoadingSpinner();
    } else {
      this.showPromoLoadingSpinner();
    }
    dlcImage.style.backgroundImage = imageURL ? `url(${imageURL})` : "";
    const contentTitle = this.Root.getAttribute("contentTitle");
    const dlcName = MustGetElement(".dlc-name", this.Root);
    dlcName.setAttribute("title", contentTitle ? contentTitle : "");
    const contentDescription = this.Root.getAttribute("contentDescription");
    const dlcText = MustGetElement(".dlc-text", this.Root);
    dlcText.innerHTML = Locale.stylize(contentDescription);
    const backButton = MustGetElement(".cancel", this.Root);
    backButton.addEventListener("action-activate", this.backButtonListener);
    this.scrollable = MustGetElement(".dlc-viewer-scrollable", this.Root);
    const owned = this.Root.getAttribute("owned");
    if (owned != "true") {
      this.owned = false;
      const buyButton = MustGetElement(".buy", this.Root);
      buyButton.classList.remove("hidden");
      backButton.setAttribute("caption", "LOC_GENERIC_CANCEL");
      buyButton.addEventListener("action-activate", this.buyPromo.bind(this));
    }
  }
  // PROMO_TODO: We will want to make this animated like the one in loading screen. Waiting on UI/UX design and implementation: https://2kfxs.atlassian.net/browse/IGP-103673
  showPromoLoadingSpinner() {
  }
  // PROMO_TODO: We will want to make this animated like the one in loading screen. Waiting on UI/UX design and implementation: https://2kfxs.atlassian.net/browse/IGP-103673
  hidePromoLoadingSpinner() {
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    if (!this.owned) {
      NavTray.addOrUpdateShellAction1("LOC_UI_STORE_BUY");
    }
    FocusManager.setFocus(this.Root);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  close() {
    super.close();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan") {
      this.scrollable?.dispatchEvent(InputEngineEvent.CreateNewEvent(inputEvent));
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "shell-action-1") {
      if (!this.owned) {
        this.buyPromo();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.isCancelInput()) {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  buyPromo() {
    const contentID = this.Root.getAttribute("contentID");
    if (!contentID) {
      console.error("screen-dlc-viewer: onAttach: contentID is not valid");
      return;
    }
    Online.Promo.interactWithPromo(PromoAction.Interact, contentID, "2K Store launcher screen", -1);
  }
}
Controls.define("screen-dlc-viewer", {
  createInstance: PanelDLCViewer,
  description: "Shows the details of the selected DLC",
  classNames: ["dlc-viewer", "absolute", "bottom-0", "h-full", "w-full"],
  styles: [styles],
  innerHTML: [content],
  tabIndex: -1
});
//# sourceMappingURL=screen-dlc-viewer.js.map
