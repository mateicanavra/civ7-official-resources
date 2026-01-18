import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-modal-frame\r\n\tclass=\"link-account max-w-full max-h-full\"\r\n\tid=\"screen-link-account\"\r\n>\r\n\t<div\r\n\t\tclass=\"mp-link-account__main-content flex flex-col flex-auto justify-start mt-4\"\r\n\t\tid=\"focus-root\"\r\n\t>\r\n\t\t<div class=\"flex\">\r\n\t\t\t<div class=\"qr-code-image size-48 justify-center self-center ml-6\"></div>\r\n\t\t\t<div\r\n\t\t\t\trole=\"paragraph\"\r\n\t\t\t\tclass=\"qr-code-text font-body pointer-events-auto w-96 px-8 text-accent-2 text-xs\"\r\n\t\t\t></div>\r\n\t\t</div>\r\n\t</div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-link-account/mp-link-account.css";

class MpLinkAccount extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  QrLinkAndImageReadyListener = this.onQrLinkAndImageReady.bind(this);
  QrLinkCompletedListener = this.onQrLinkCompleted.bind(this);
  qrCodeImage;
  qrCodeText;
  constructor(root) {
    super(root);
    this.qrCodeImage = MustGetElement(".qr-code-image", this.Root);
    this.qrCodeText = MustGetElement(".qr-code-text", this.Root);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add(
      "mp-link-account",
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
    const frame = MustGetElement(".mp-link-account__main-content", this.Root);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const closeButton = document.createElement("fxs-close-button");
    closeButton.classList.add("top-4", "-right-12");
    closeButton.addEventListener("action-activate", () => {
      this.close();
    });
    frame.appendChild(closeButton);
    const goToUnlinkPortal = this.isAccountLinked();
    if (goToUnlinkPortal) {
      this.setupQrLinkAndImage(goToUnlinkPortal);
    } else if (Network.isQrCodeAndLinkReady()) {
      Network.sendQrStatusQuery();
      this.setupQrLinkAndImage(goToUnlinkPortal);
    } else {
      this.qrCodeText.innerHTML = Locale.compose("LOC_UI_LINK_ACCOUNT_QR_CODE_FETCH");
      Network.tryFetchQRLinkCode();
      engine.on("QrLinkAndImageReady", this.QrLinkAndImageReadyListener);
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("QrAccountLinked", this.QrLinkCompletedListener);
    engine.off("QrLinkAndImageReady", this.QrLinkAndImageReadyListener);
    const connStatus = document.querySelector(".connection-status");
    if (connStatus) {
      connStatus.classList.remove("no-mouse");
    }
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.Root);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  isAccountLinked() {
    return Network.isLoggedIn() && Network.isAccountComplete() && Network.isFullAccountLinked();
  }
  setupQrLinkAndImage(useUnlink) {
    this.setupQrImage(useUnlink);
    this.setupQrLink(useUnlink);
    if (!useUnlink) {
      engine.on("QrAccountLinked", this.QrLinkCompletedListener);
    }
  }
  setupQrImage(useUnlink) {
    let qrCode = "";
    if (!useUnlink) {
      qrCode = Network.getQrCodeImage();
    } else {
      qrCode = "fs://game/UnlinkPortalQRCode.png";
    }
    if (this.qrCodeImage) {
      if (useUnlink) {
        const imgElement = document.createElement("img");
        imgElement.src = qrCode;
        imgElement.style.width = "100%";
        imgElement.style.height = "100%";
        this.qrCodeImage.innerHTML = "";
        this.qrCodeImage.appendChild(imgElement);
      } else {
        if (qrCode && qrCode.length > 0) {
          const originalText = `<svg`;
          const replacementText = `<svg x="0" y="0" width="100%" height="100%"`;
          this.qrCodeImage.innerHTML = qrCode.replace(originalText, replacementText);
        } else {
          console.error("mp-link-support: couldn't get QR code from server");
          this.qrCodeImage.style.backgroundImage = "";
        }
      }
    } else {
      console.error("mp-link-support: qr-code-image is missing");
    }
  }
  setupQrLink(useUnlink) {
    let verificationUrl = useUnlink ? Network.getQrTwoKPortalUrl() : Network.getQrVerificationUrl();
    const firstPartyType = Network.getLocalHostingPlatform();
    const isPCPlatform = firstPartyType == HostingType.HOSTING_TYPE_STEAM || firstPartyType == HostingType.HOSTING_TYPE_EOS;
    if (this.qrCodeText) {
      if (!verificationUrl || verificationUrl.length == 0) {
        console.error("mp-link-support: couldn't get URL from server");
        verificationUrl = Locale.compose("LOC_UI_LINK_ACCOUNT_QR_CODE_FETCH_FAILURE");
      } else {
        if (isPCPlatform) {
          verificationUrl = '<span class="clickable-link">' + verificationUrl + "</span>";
        }
      }
      if (useUnlink) {
        this.qrCodeText.innerHTML = Locale.compose("LOC_UI_GO_TO_PORTAL", verificationUrl);
      } else {
        if (Network.isLoggedIn()) {
          if (!Network.isAccountLinked()) {
            this.qrCodeText.innerHTML = Locale.compose("LOC_UI_LINK_ACCOUNT_QR_CODE", verificationUrl);
          } else if (!Network.isAccountComplete())
            this.qrCodeText.innerHTML = Locale.compose("LOC_UI_ACCOUNT_INCOMPLETE", verificationUrl);
        } else {
        }
      }
      const firstPartyType2 = Network.getLocalHostingPlatform();
      if (firstPartyType2 == HostingType.HOSTING_TYPE_STEAM || firstPartyType2 == HostingType.HOSTING_TYPE_EOS) {
      }
      this.qrCodeText.addEventListener("click", () => {
        if (useUnlink) {
          Network.openTwoKPortalURL();
        } else {
          Network.openVerificationURL();
        }
      });
    } else {
      console.error("mp-link-support: qr-code-text is missing");
    }
  }
  onQrLinkAndImageReady() {
    engine.off("QrLinkAndImageReady", this.QrLinkAndImageReadyListener);
    this.setupQrLinkAndImage(this.isAccountLinked());
  }
  onQrLinkCompleted() {
    engine.off("QrAccountLinked", this.QrLinkCompletedListener);
    this.close();
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
Controls.define("screen-mp-link-account", {
  createInstance: MpLinkAccount,
  description: "Screen to link your 2K account.",
  styles: [styles],
  innerHTML: [content],
  tabIndex: -1
});

export { MpLinkAccount };
//# sourceMappingURL=mp-link-account.js.map
