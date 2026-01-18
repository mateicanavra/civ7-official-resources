import { M as MainMenuReturnEvent } from '../../events/shell-events.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { b as InputEngineEventName } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { M as MultiplayerShellManager } from '../mp-shell-logic/mp-shell-logic.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-layout.chunk.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';
import '../../utilities/utilities-network-constants.chunk.js';
import '../../utilities/utilities-network.js';
import '../mp-legal/mp-legal.js';

const content = "<fxs-modal-frame>\r\n\t<fxs-header\r\n\t\ttitle=\"LOC_UI_MP_LANDING_TITLE\"\r\n\t\tclass=\"font-title text-xl text-center uppercase tracking-100\"\r\n\t\tfiligree-style=\"h2\"\r\n\t></fxs-header>\r\n\t<fxs-hslot\r\n\t\tclass=\"mp-landing-new__slot pt-2 pb-6 px-12 justify-center\"\r\n\t\tdisable-focus-allowed=\"true\"\r\n\t>\r\n\t\t<fxs-chooser-item\r\n\t\t\tclass=\"mp-landing-new__internet-button w-72 mx-3\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\tdata-audio-activate=\"mp-landing-internet-selected\"\r\n\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t>\r\n\t\t\t<div class=\"flow-column p-3\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_LANDING_INTERNET\"\r\n\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100 font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t\t<fxs-chooser-item\r\n\t\t\tclass=\"mp-landing-new__local-button w-72 mx-3\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\tdata-audio-activate=\"mp-landing-lan-selected\"\r\n\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t>\r\n\t\t\t<div class=\"flow-column p-3\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_LANDING_LAN\"\r\n\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100 font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t\t<fxs-chooser-item\r\n\t\t\tclass=\"mp-landing-new__wlan-button w-68 mx-3\"\r\n\t\t\tdata-audio-group-ref=\"audio-mp-landing\"\r\n\t\t\tdata-audio-activate=\"mp-landing-wlan-selected\"\r\n\t\t\tselectable-when-disabled=\"true\"\r\n\t\t\tdata-bind-attributes=\"{'select-on-focus':{{g_NavTray.isTrayRequired}}?'true':'false'}\"\r\n\t\t>\r\n\t\t\t<div class=\"flow-column p-3\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\ttitle=\"LOC_UI_MP_LANDING_WIRELESS\"\r\n\t\t\t\t\tclass=\"uppercase text-center font-title text-xl tracking-100 font-fit-shrink whitespace-nowrap\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\tfont-fit-mode=\"shrink\"\r\n\t\t\t\t\twrap=\"nowrap\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"flow-row justify-center -mt-2\">\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-y-100\"></div>\r\n\t\t\t\t\t<div class=\"img-unit-panel-divider -scale-100\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t</fxs-hslot>\r\n\t<div class=\"flow-row justify-center\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"mp-landing-new__close-button\"\r\n\t\t\tcaption=\"LOC_GENERIC_CLOSE\"\r\n\t\t\taction-key=\"inline-cancel\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-landing/mp-landing-new.css";

class PanelMPLanding extends Panel {
  internetButton;
  localButton;
  wlanButton;
  closeButton;
  slotDiv;
  closeButtonListener = this.onClose.bind(this);
  localButtonListener = this.onLocal.bind(this);
  wLanButtonListener = this.onWLan.bind(this);
  internetButtonListener = this.onInternet.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  onInitialize() {
    this.internetButton = MustGetElement(".mp-landing-new__internet-button", this.Root);
    this.localButton = MustGetElement(".mp-landing-new__local-button", this.Root);
    this.wlanButton = MustGetElement(".mp-landing-new__wlan-button", this.Root);
    this.closeButton = MustGetElement(".mp-landing-new__close-button", this.Root);
    this.slotDiv = MustGetElement(".mp-landing-new__slot", this.Root);
    const internetButtonBgImg = document.createElement("div");
    internetButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-buganda");
    waitForLayout(() => this.internetButton.insertAdjacentElement("afterbegin", internetButtonBgImg));
    const localButtonBgImg = document.createElement("div");
    localButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-aksum");
    waitForLayout(() => this.localButton.insertAdjacentElement("afterbegin", localButtonBgImg));
    const wlanButtonBgImg = document.createElement("div");
    wlanButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-aksum");
    waitForLayout(() => this.wlanButton.insertAdjacentElement("afterbegin", wlanButtonBgImg));
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-landing");
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.internetButton.addEventListener("action-activate", this.internetButtonListener);
    this.internetButton.setAttribute("data-audio-group-ref", "audio-mp-landing");
    this.internetButton.setAttribute("data-audio-activate-ref", "data-audio-mp-internet");
    this.localButton.addEventListener("action-activate", this.localButtonListener);
    this.localButton.setAttribute("data-audio-group-ref", "audio-mp-landing");
    this.localButton.setAttribute("data-audio-activate-ref", "data-audio-mp-lan");
    this.wlanButton.addEventListener("action-activate", this.wLanButtonListener);
    this.wlanButton.setAttribute("data-audio-group-ref", "audio-mp-landing");
    this.wlanButton.setAttribute("data-audio-activate-ref", "data-audio-mp-lan");
    const isLANServerTypeSupported = Network.hasCapability(NetworkCapabilityTypes.LANServerType);
    const isWirelessServerTypeSupported = Network.hasCapability(NetworkCapabilityTypes.WirelessServerType);
    if (!isLANServerTypeSupported) {
      this.localButton.classList.add("hidden");
    }
    if (!isWirelessServerTypeSupported) {
      this.wlanButton.classList.add("hidden");
    } else if (Online.LiveEvent.getLiveEventGameFlag()) {
      this.wlanButton.setAttribute("disabled", "true");
      this.wlanButton.setAttribute("data-tooltip-content", "LOC_UI_EVENTS_MULTIPLAYER_NO_WIRELESS");
    }
    this.closeButton.addEventListener("action-activate", this.closeButtonListener);
    this.Root.listenForEngineEvent("ConnectionStatusChanged", this.onConnectionStatusChanged.bind(this));
    if (!Network.isConnectedToMultiplayerService(ServerType.SERVER_TYPE_INTERNET)) {
      this.internetButton.setAttribute("disabled", "true");
      Network.connectToMultiplayerService(ServerType.SERVER_TYPE_INTERNET);
    }
    if (MultiplayerShellManager.skipToGameCreator) {
      this.onInternet();
    }
    if (!isLANServerTypeSupported && !isWirelessServerTypeSupported) {
      this.onInternet();
    }
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    FocusManager.setFocus(this.slotDiv);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onClose() {
    if (Network.supportsSSO() && Online.LiveEvent.getLiveEventGameFlag()) {
      Online.LiveEvent.clearLiveEventGameFlag();
      Online.LiveEvent.clearLiveEventConfigKeys();
    }
    this.close();
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onConnectionStatusChanged(data) {
    if (data.server == ServerType.SERVER_TYPE_INTERNET) {
      const internetButton = this.Root.querySelector(".internet-button");
      if (internetButton) {
        internetButton.setAttribute("disabled", data.connected ? "false" : "true");
      } else {
        console.error("mp-landing: onConnectionStatusChanged(): Missing internet button.");
      }
    }
  }
  onWLan() {
    this.close();
    MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_WIRELESS);
  }
  onInternet() {
    this.close();
    MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_INTERNET);
  }
  onLocal() {
    this.close();
    MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_LAN);
  }
}
Controls.define("screen-mp-landing", {
  createInstance: PanelMPLanding,
  description: "Landing screen for multiplayer.",
  classNames: ["mp-landing"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=mp-landing-new.js.map
