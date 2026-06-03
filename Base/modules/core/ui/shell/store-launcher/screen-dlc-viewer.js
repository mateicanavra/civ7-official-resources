import { Audio } from '../../audio-base/audio-support.js';
import { InputEngineEvent } from '../../input/input-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import styles from './2k-code-redemption.scss.js';
import content from './screen-dlc-viewer.html.js';

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
    FocusManager.get().setFocus(this.Root);
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
        Audio.playSound("data-audio-primary-button-press");
        this.buyPromo();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.isCancelInput()) {
      Audio.playSound("data-audio-primary-button-press");
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
