import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-account-permissions.html.js';
import styles from './mp-account-permissions.scss.js';

class MpAccountPermissions extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  qrCodeImage;
  qrCodeText;
  locKey = "LOC_UI_PERMISSION_CHANGE_REQUIRED";
  customUrl = "https://portal.2k.com/2k/portal/game-permissions";
  blockReason = BlockedAccessReason.NONE;
  constructor(root) {
    super(root);
    this.qrCodeImage = MustGetElement(".qr-code-image", this.Root);
    this.qrCodeText = MustGetElement(".qr-code-text", this.Root);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add(
      "mp-account-permissions",
      "absolute",
      "inset-0",
      "flex",
      "flex-row",
      "justify-center",
      "items-center"
    );
  }
  onAttach() {
    super.onAttach();
    const connStatus = document.querySelector(".connection-status");
    connStatus?.classList.add("no-mouse");
    const frame = MustGetElement(".mp-account-permissions__main-content", this.Root);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const closeButton = document.createElement("fxs-close-button");
    closeButton.classList.add("top-4", "-right-12");
    closeButton.addEventListener("action-activate", () => {
      this.close();
    });
    frame.appendChild(closeButton);
    this.renderContent();
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    const connStatus = document.querySelector(".connection-status");
    if (connStatus) {
      connStatus.classList.remove("no-mouse");
    }
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.get().setFocus(this.Root);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "loc-key":
        this.locKey = newValue && newValue.length > 0 ? newValue : "LOC_UI_PERMISSION_CHANGE_REQUIRED";
        break;
      case "portal-url":
        this.customUrl = newValue && newValue.length > 0 ? newValue : null;
        break;
      case "block-reason": {
        const parsedReason = Number(newValue);
        this.blockReason = Number.isNaN(parsedReason) ? BlockedAccessReason.NONE : parsedReason;
        break;
      }
      default:
        break;
    }
    if (this.Root.isConnected) {
      this.renderContent();
    }
  }
  renderContent() {
    this.renderQrImage();
    this.renderQrLink();
  }
  renderQrImage() {
    if (!this.qrCodeImage) {
      console.error("mp-account-permissions: qr-code-image is missing");
      return;
    }
    if (this.blockReason == BlockedAccessReason.CHILD_PERMISSION_DENIED || this.blockReason == BlockedAccessReason.CHILD_PURCHASE_DENIED) {
      this.qrCodeImage.style.backgroundImage = "";
      this.qrCodeImage.innerHTML = "";
      return;
    }
    const PERMISSIONS_QR_URL = "fs://game/PortalAccountPermissionsQRCode.png";
    const FALLBACK_QR_URL = "fs://game/UnlinkPortalQRCode.png";
    const shouldUseVerificationUrl = NetworkUtilities.requiresAccountValidation(this.blockReason);
    const QRToShow = shouldUseVerificationUrl ? FALLBACK_QR_URL : PERMISSIONS_QR_URL;
    const imgElement = document.createElement("img");
    imgElement.style.width = "100%";
    imgElement.style.height = "100%";
    imgElement.onerror = () => {
      if (imgElement.src.endsWith("UnlinkPortalQRCode.png")) {
        console.error("mp-account-permissions: couldn't load a local QR code image");
        this.qrCodeImage.style.backgroundImage = "";
        this.qrCodeImage.innerHTML = "";
        return;
      }
      imgElement.src = FALLBACK_QR_URL;
    };
    this.qrCodeImage.innerHTML = "";
    this.qrCodeImage.appendChild(imgElement);
    imgElement.src = QRToShow;
  }
  renderQrLink() {
    if (!this.qrCodeText) {
      console.error("mp-account-permissions: qr-code-text is missing");
      return;
    }
    let displayedUrl = this.customUrl;
    if (!displayedUrl || displayedUrl.length == 0) {
      displayedUrl = NetworkUtilities.requiresAccountValidation(this.blockReason) ? Network.getQrVerificationUrl() : Network.getQrTwoKPermissionsUrl();
    }
    if (!displayedUrl || displayedUrl.length == 0) {
      displayedUrl = Locale.compose("LOC_UI_LINK_ACCOUNT_QR_CODE_FETCH_FAILURE");
    }
    const firstPartyType = Network.getLocalHostingPlatform();
    const isPCPlatform = firstPartyType == HostingType.HOSTING_TYPE_STEAM || firstPartyType == HostingType.HOSTING_TYPE_EOS;
    const url = isPCPlatform ? '<span class="clickable-link">' + displayedUrl + "</span>" : displayedUrl;
    if (this.locKey === "LOC_UI_PERMISSION_CHANGE_REQUIRED") {
      this.qrCodeText.innerHTML = Locale.compose("LOC_UI_GO_TO_PORTAL_PERMISSIONS", url);
      this.qrCodeText.addEventListener("click", () => {
        Network.openTwoKPermissionsURL();
      });
    } else {
      this.qrCodeText.innerHTML = Locale.compose(this.locKey);
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
}
Controls.define("screen-mp-account-permissions", {
  createInstance: MpAccountPermissions,
  description: "Screen for account portal permissions messaging.",
  styles: [styles],
  innerHTML: [content],
  attributes: [{ name: "loc-key" }, { name: "portal-url" }, { name: "block-reason" }],
  tabIndex: -1
});
//# sourceMappingURL=mp-account-permissions.js.map
