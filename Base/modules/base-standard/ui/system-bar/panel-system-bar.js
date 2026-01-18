import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';

const content = "<fxs-hslot ignore-focus=\"true\">\r\n\t<div class=\"ps-content-wrapper\">\r\n\t\t<div\r\n\t\t\trole=\"paragraph\"\r\n\t\t\tclass=\"flex mr-10 font-title text-base pointer-events-auto\"\r\n\t\t>\r\n\t\t\t<div class=\"ps-turn-number\"></div>\r\n\t\t\t<div class=\"mx-2\">|</div>\r\n\t\t\t<div class=\"ps-turn-age\"></div>\r\n\t\t</div>\r\n\t\t<div\r\n\t\t\tid=\"ps-clock\"\r\n\t\t\trole=\"paragraph\"\r\n\t\t\tclass=\"font-title-base pointer-events-auto\"\r\n\t\t></div>\r\n\t\t<div\r\n\t\t\tid=\"ps-icons\"\r\n\t\t\tclass=\"ps-icon-container\"\r\n\t\t></div>\r\n\t</div>\r\n</fxs-hslot>\r\n";

const styles = "fs://game/base-standard/ui/system-bar/panel-system-bar.css";

class PanelSystemBar extends Panel {
  joinCode = null;
  civilopediaButtonListener = this.hotLinkToCivilopedia.bind(this);
  pauseButtonListener = this.onShowPauseMenu.bind(this);
  mutiplayerCodeButtonListener = this.toggleShowMultiplayerCode.bind(this);
  onJoinCodeButtonActivatedListener = this.onJoinCodeButtonActivated.bind(this);
  onPlayerTurnActivatedListener = this.onPlayerTurnActivated.bind(this);
  onNetworkConnectionStatusChangedListener = this.onMetagamingStatusChanged.bind(this);
  onSPoPCompleteListener = this.onMetagamingStatusChanged.bind(this);
  onSPoPHeartbeatListener = this.onMetagamingStatusChanged.bind(this);
  onLogoutListener = this.onMetagamingStatusChanged.bind(this);
  joinCodeButton = document.createElement("panel-system-button");
  multiplayerStringCode = "";
  timeoutCallback = this.updateTime.bind(this);
  timeoutID = 0;
  currentTurnTimerDisplay = 0;
  joinCodeShowing = false;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToTopRight;
  }
  onInitialize() {
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    this.Root.classList.toggle("top-0", !isMobileViewExperience);
    this.Root.classList.toggle("top-1\\.5", isMobileViewExperience);
    if (Configuration.getGame().isAnyMultiplayer) {
      const content2 = this.Root.querySelector("fxs-hslot");
      if (!content2) {
        console.error("panel-system-bar: Could not find <fxs-hslot>.");
        return;
      }
      this.joinCode = document.createElement("div");
      this.joinCode.classList.value = "ps-wrapper-multiplayer items-center justify-end";
      this.joinCode.id = "ps-multiplayer-wrapper";
      const backgroundJoinCode = document.createElement("div");
      backgroundJoinCode.classList.add("ps-bg-shape-bg-multiplayer");
      const backgroundOverlayJoinCode = document.createElement("div");
      backgroundOverlayJoinCode.classList.add("ps__bg-overlay-multiplayer");
      backgroundJoinCode.appendChild(backgroundOverlayJoinCode);
      this.joinCode.appendChild(backgroundJoinCode);
      const contentWrapperJoinCode = document.createElement("div");
      contentWrapperJoinCode.classList.add("ps-content-wrapper-multiplayer");
      const iconContainerJoinCode = document.createElement("div");
      iconContainerJoinCode.classList.add("ps-icon-container");
      iconContainerJoinCode.id = "ps-icons-multiplayer";
      iconContainerJoinCode.addEventListener("focus", () => {
        const wrapper = this.Root.querySelector(".ps-content-wrapper-multiplayer");
        if (wrapper) {
          wrapper.classList.add("focused");
        }
      });
      iconContainerJoinCode.addEventListener("blur", () => {
        const wrapper = this.Root.querySelector(".ps-content-wrapper-multiplayer");
        if (wrapper) {
          wrapper.classList.remove("focused");
        }
      });
      const turnInfoJoinCode = document.createElement("div");
      turnInfoJoinCode.classList.value = "ps-turn-info game-code";
      turnInfoJoinCode.id = "ps-code-multiplayer";
      this.joinCodeButton.classList.add(
        "ps-turn-multiplayer-code",
        "font-body",
        "text-xs",
        "flex",
        "items-center",
        "transition-opacity",
        "opacity-0"
      );
      this.joinCodeButton.id = "ps-multiplayer-code";
      this.multiplayerStringCode = Network.getJoinCode();
      this.joinCodeButton.innerHTML = Locale.compose(
        "LOC_UI_MULTIPLAYER_CODE_NUMBER",
        this.multiplayerStringCode
      );
      this.joinCodeButton.setAttribute("caption", Locale.compose("LOC_UI_MULTIPLAYER_CODE_COPY"));
      this.joinCodeButton.setAttribute("data-tooltip-content", Locale.compose("LOC_UI_MULTIPLAYER_CODE_COPY"));
      this.joinCodeButton.addEventListener("action-activate", this.onJoinCodeButtonActivatedListener);
      this.joinCodeButton.setAttribute("radial-tag", "ps-bar-ps-multiplayer-code");
      turnInfoJoinCode.appendChild(this.joinCodeButton);
      contentWrapperJoinCode.appendChild(iconContainerJoinCode);
      contentWrapperJoinCode.appendChild(turnInfoJoinCode);
      this.joinCode.appendChild(contentWrapperJoinCode);
      content2.insertBefore(this.joinCode, content2.firstChild);
      this.addButton(
        "LOC_UI_MULTIPLAYER_CODE",
        "LOC_UI_MULTIPLAYER_CODE",
        "Yield_Population",
        this.mutiplayerCodeButtonListener,
        "multiplayer-code",
        "ps-icons-multiplayer"
      );
    }
    this.onMetagamingStatusChanged();
    this.addButton(
      "LOC_UI_VIEW_CIVILOPEDIA",
      "LOC_UI_CIVILOPEDIA_TOOLTIP",
      "civilopedia_top_bar",
      this.civilopediaButtonListener,
      "civilopedia",
      "ps-icons"
    );
    this.addButton("LOC_UI_PAUSE", "LOC_UI_PAUSE", "System_Pause", this.pauseButtonListener, "pause", "ps-icons");
    this.joinCode = document.getElementById("ps-multiplayer-wrapper");
    const turnTimer = document.getElementById("ps-turntimer");
    if (turnTimer) {
      if (!turnTimer.classList.contains("hidden")) {
        turnTimer.classList.add("hidden");
      }
    }
    this.updateTurnNumber();
    this.updateTime();
  }
  onAttach() {
    super.onAttach();
    engine.on("PlayerTurnActivated", this.onPlayerTurnActivatedListener, this);
    engine.on("ConnectionStatusChanged", this.onNetworkConnectionStatusChangedListener, this);
    engine.on("SPoPComplete", this.onSPoPCompleteListener);
    engine.on("LogoutCompleted", this.onLogoutListener);
    engine.on("SPoPHeartbeatReceived", this.onSPoPHeartbeatListener);
  }
  onDetach() {
    clearTimeout(this.timeoutID);
    engine.off("PlayerTurnActivated", this.onPlayerTurnActivatedListener, this);
    engine.off("ConnectionStatusChanged", this.onNetworkConnectionStatusChangedListener, this);
    engine.off("SPoPComplete", this.onSPoPCompleteListener);
    engine.off("LogoutCompleted", this.onLogoutListener);
    engine.off("SPoPHeartbeatReceived", this.onSPoPHeartbeatListener);
    super.onDetach();
  }
  onMetagamingStatusChanged() {
    if (!Network.supportsSSO()) {
      return;
    }
    const container = document.getElementById("ps-icons");
    if (container) {
      const newConnectionButton = document.createElement("fxs-activatable");
      newConnectionButton.setAttribute("caption", Locale.compose("LOC_UI_METAPROGRESSION"));
      newConnectionButton.setAttribute("radial-tag", "ps-bar-metaprogression");
      newConnectionButton.id = "metaprogression";
      newConnectionButton.classList.add("ml-3", "size-8", "bg-cover", "mt-1");
      if (Network.isMetagamingAvailable()) {
        newConnectionButton.style.backgroundImage = "url('blp:my2k_loggedin')";
        newConnectionButton.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_UI_ENABLED_METAPROGRESSION")
        );
      } else {
        newConnectionButton.style.backgroundImage = "url('blp:my2k_loggedout')";
        newConnectionButton.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_UI_DISABLED_METAPROGRESSION")
        );
      }
      const oldConnectionButton = document.getElementById("metaprogression");
      if (oldConnectionButton) {
        container.replaceChild(newConnectionButton, oldConnectionButton);
      } else {
        container.appendChild(newConnectionButton);
      }
    }
  }
  onPlayerTurnActivated() {
    this.updateTurnNumber();
  }
  //update turn number and year
  updateTurnNumber() {
    const turnNumberElement = MustGetElement(".ps-turn-number", this.Root);
    const turnAgeElement = MustGetElement(".ps-turn-age", this.Root);
    turnNumberElement.textContent = Locale.compose("LOC_ACTION_PANEL_CURRENT_TURN", Game.turn);
    turnAgeElement.textContent = Game.getTurnDate();
  }
  /// Update the clock
  updateTime() {
    this.timeoutID = 0;
    const currentTime = document.getElementById("ps-clock");
    if (!currentTime) {
      console.error("panel-system-bar: Could not set the time due to missing ps-clock <div>.");
      return;
    }
    const isMilitaryTime = false;
    const date = /* @__PURE__ */ new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = isMilitaryTime ? `${hours}:${minutes}` : Locale.compose(
      hours < 12 ? "LOC_ACTION_PANEL_TIME_AMPM_AM" : "LOC_ACTION_PANEL_TIME_AMPM_PM",
      hours % 12 == 0 ? 12 : hours % 12,
      minutes > 9 ? minutes : "0" + minutes
    );
    currentTime.innerHTML = timeString;
    this.timeoutID = setTimeout(this.timeoutCallback, (60 - date.getSeconds()) * 1e3);
  }
  addButton(caption, tooltip, icon, shellButtonListener, classTag, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      const shellButton = document.createElement("panel-system-button");
      shellButton.setAttribute("caption", Locale.compose(caption));
      shellButton.setAttribute("data-icon", icon);
      shellButton.setAttribute("data-tooltip-content", Locale.compose(tooltip));
      shellButton.addEventListener("action-activate", shellButtonListener);
      shellButton.setAttribute("radial-tag", "ps-bar-" + classTag);
      shellButton.setAttribute("data-audio-press-ref", "data-audio-primary-button-press");
      container.appendChild(shellButton);
    }
  }
  onShowPauseMenu() {
    DisplayQueueManager.suspend();
    InterfaceMode.switchTo("INTERFACEMODE_PAUSE_MENU");
  }
  hotLinkToCivilopedia() {
    engine.trigger("open-civilopedia");
  }
  toggleShowMultiplayerCode() {
    if (!this.joinCode) {
      console.error("panel-system-bar: toggleShowMultiplayerCode(): Unable to find joinCode");
      return;
    }
    if (this.joinCodeShowing) {
      this.joinCode.classList.remove("show-multiplayer-code");
      this.joinCode.classList.add("hide-multiplayer-code");
      this.joinCodeButton.classList.add("opacity-0");
      this.joinCodeButton.classList.remove("opacity-100");
    } else {
      this.joinCode.classList.add("show-multiplayer-code");
      this.joinCode.classList.remove("hide-multiplayer-code");
      this.joinCodeButton.classList.remove("opacity-0");
      this.joinCodeButton.classList.add("opacity-100");
    }
    this.joinCodeShowing = !this.joinCodeShowing;
  }
  async onJoinCodeButtonActivated() {
    UI.setClipboardText(Network.getJoinCode());
  }
}
Controls.define("panel-system-bar", {
  createInstance: PanelSystemBar,
  description: "A panel containg system elements, such as pause menu button, clock, etc.",
  classNames: ["panel-system-bar", "system-bar-container", "allowCameraMovement", "absolute", "top-0", "right-0"],
  styles: [styles],
  innerHTML: [content]
});

export { PanelSystemBar };
//# sourceMappingURL=panel-system-bar.js.map
