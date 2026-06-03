import { MainMenuReturnEvent } from '../../events/shell-events.js';
import { InputEngineEventName } from '../../input/input-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel, { AnchorType } from '../../panel-support.js';
import MultiplayerShellManager from '../mp-shell-logic/mp-shell-logic.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-landing-new.html.js';
import styles from './mp-landing-new.scss.js';

class PanelMPLanding extends Panel {
  internetButton;
  localButton;
  wlanButton;
  hotseatButton;
  closeButton;
  slotDiv;
  closeButtonListener = this.onClose.bind(this);
  localButtonListener = this.onLocal.bind(this);
  wLanButtonListener = this.onWLan.bind(this);
  internetButtonListener = this.onInternet.bind(this);
  hotseatButtonListener = this.onHotseat.bind(this);
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
    if (UI.supportsHotseat()) {
      this.hotseatButton = MustGetElement(".mp-landing-new__hotseat-button", this.Root);
      this.hotseatButton.classList.remove("hidden");
      const hotseatButtonBgImg = document.createElement("div");
      hotseatButtonBgImg.classList.add("absolute", "inset-0\\.5", "img-bg-card-america");
      const wipLabel = document.createElement("img");
      wipLabel.src = "wip_label2.png";
      Object.assign(wipLabel.style, {
        position: "absolute",
        left: "4px",
        bottom: "4px",
        width: "90%",
        height: "auto",
        zIndex: "10",
        pointerEvents: "none"
      });
      waitForLayout(() => {
        this.hotseatButton.insertAdjacentElement("afterbegin", wipLabel);
        this.hotseatButton.insertAdjacentElement("afterbegin", hotseatButtonBgImg);
      });
    }
    this.enableOpenSound = true;
    this.enableCloseSound = false;
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
    if (UI.supportsHotseat()) {
      this.hotseatButton.addEventListener("action-activate", this.hotseatButtonListener);
      this.hotseatButton.setAttribute("data-audio-group-ref", "audio-mp-landing");
      this.hotseatButton.setAttribute("data-audio-activate-ref", "data-audio-mp-lan");
    }
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
    FocusManager.get().setFocus(this.slotDiv);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onClose() {
    this.enableCloseSound = true;
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
  onHotseat() {
    this.close();
    const skipToGameCreator = true;
    MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_HOTSEAT, skipToGameCreator);
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
