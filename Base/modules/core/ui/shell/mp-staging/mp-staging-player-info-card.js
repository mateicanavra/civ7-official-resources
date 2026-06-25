import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import content from './mp-staging-player-info-card.html.js';
import styles from './mp-staging-player-info-card.scss.js';

class MpStagingPlayerInfoCard extends Panel {
  playerData = {
    playerID: "",
    isParticipant: false,
    isHost: false,
    isLocal: false,
    isConnected: false,
    statusIcon: "",
    statusIconTooltip: "",
    isReady: false,
    platformIcon: "",
    platformIconTooltip: "",
    leaderPortrait: "",
    leaderName: "",
    foundationLevel: 1,
    badgeURL: "",
    backgroundURL: "",
    playerTitle: "",
    civName: "",
    gamertag: "",
    firstPartyName: "",
    twoKName: "",
    isHuman: false,
    isDistantHuman: false,
    canEverBeKicked: false,
    canBeKickedNow: false,
    kickTooltip: "",
    isKickVoteTarget: false,
    isMuted: false,
    muteTooltip: "",
    playerInfoDropdown: null,
    civilizationDropdown: null,
    teamDropdown: null,
    leaderDropdown: null,
    mementos: [],
    samePlatformAsLocalPlayer: true
  };
  titleLabel = MustGetElement(".mspic-title", this.Root);
  titleIcon = MustGetElement(".mspic-title-icon", this.Root);
  isConnectedIcon = MustGetElement(".mspic-is-connected-icon", this.Root);
  title2Label = MustGetElement(".mspic-title2", this.Root);
  titleIcon2 = MustGetElement(".mspic-title2-icon", this.Root);
  isConnectedIcon2 = MustGetElement(".mspic-is-connected-icon2", this.Root);
  subtitleLabel = MustGetElement(".mspic-subtitle", this.Root);
  background = MustGetElement(".mspic-bg", this.Root);
  badgeComponent = MustGetElement("progression-badge", this.Root);
  badgeContainer = MustGetElement(".mspic-badge-container", this.Root);
  hostIcon = MustGetElement(".mspic-host-icon", this.Root);
  localPlayerFilligree = MustGetElement(".mspic-local-player-filligree", this.Root);
  displayPlatformIcon = Network.supportsSSO();
  constructor(root) {
    super(root);
    if (!this.displayPlatformIcon) {
      this.subtitleLabel.classList.remove("ml-9");
    }
  }
  onAttach() {
    super.onAttach();
    this.hostIcon.style.backgroundImage = `url('fs://game/core/mpicon_host.png')`;
    this.titleIcon2.style.backgroundImage = `url('fs://game/prof_2k_logo.png')`;
    this.localPlayerFilligree.style.backgroundImage = `url('fs://game/core/mp_player_detail.png')`;
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "data-player-info":
        if (newValue) {
          if (_oldValue !== newValue) {
            this.playerData = JSON.parse(newValue);
            this.refresh();
          }
        }
        break;
    }
  }
  refresh() {
    const isHotseat = Configuration.getGame().isHotseat;
    let firstPlayerName = this.playerData.firstPartyName;
    if (isHotseat || !this.playerData.firstPartyName || this.playerData.firstPartyName === "") {
      firstPlayerName = this.playerData.gamertag;
    }
    this.titleLabel.innerHTML = firstPlayerName;
    this.titleLabel.firstChild?.classList?.add("font-fit-shrink", "whitespace-nowrap");
    this.title2Label.innerHTML = this.playerData.isHuman ? this.playerData.twoKName : this.playerData.gamertag;
    this.title2Label.firstChild?.classList?.add("font-fit-shrink", "whitespace-nowrap");
    const playerTwoKNameIsEmpty = this.playerData.isHuman && this.playerData.twoKName == "";
    let firstConnectionIconShown = false;
    if (!this.playerData.isHuman || !this.playerData.isConnected || !this.playerData.samePlatformAsLocalPlayer) {
      this.titleLabel.classList.toggle("hidden", !playerTwoKNameIsEmpty);
      this.titleIcon.classList.toggle("hidden", true);
      this.isConnectedIcon.classList.toggle("hidden", !playerTwoKNameIsEmpty || isHotseat);
    } else {
      this.titleLabel.classList.toggle("hidden", false);
      this.titleIcon.classList.toggle("hidden", !this.displayPlatformIcon);
      this.isConnectedIcon.classList.toggle("hidden", isHotseat);
      firstConnectionIconShown = true;
    }
    this.title2Label.classList.toggle("hidden", playerTwoKNameIsEmpty);
    this.titleIcon2.classList.toggle("hidden", playerTwoKNameIsEmpty || !this.playerData.isHuman || isHotseat);
    this.isConnectedIcon2.classList.toggle(
      "hidden",
      playerTwoKNameIsEmpty || firstConnectionIconShown || !this.playerData.isHuman
    );
    this.subtitleLabel.classList.toggle(
      "hidden",
      !this.playerData.isHuman || !this.playerData.isConnected || isHotseat
    );
    this.badgeContainer.classList.toggle("mr-6", !this.playerData.isHuman || isHotseat);
    this.badgeComponent.classList.toggle(
      "hidden",
      !this.playerData.isHuman || !this.playerData.isConnected || !Network.isMetagamingAvailable() || isHotseat
    );
    this.badgeComponent.classList.add("ml-1");
    this.hostIcon.classList.toggle("invisible", !this.playerData.isHost);
    if (this.playerData.isHuman) {
      this.subtitleLabel.setAttribute("data-l10n-id", this.playerData.playerTitle);
      this.badgeComponent.setAttribute("data-badge-url", this.playerData.badgeURL);
      this.badgeComponent.setAttribute(
        "data-badge-progression-level",
        this.playerData.foundationLevel.toString()
      );
      this.titleIcon.style.backgroundImage = `url('${this.playerData.platformIcon}')`;
      this.isConnectedIcon.style.backgroundImage = `url('${this.playerData.isConnected ? "fs://game/core/mpicon_playerstatus_green.png" : "fs://game/core/mpicon_playerstatus_red.png"}')`;
      this.isConnectedIcon2.style.backgroundImage = `url('${this.playerData.isConnected ? "fs://game/core/mpicon_playerstatus_green.png" : "fs://game/core/mpicon_playerstatus_red.png"}')`;
    }
    this.background.style.backgroundImage = this.playerData.isHuman && this.playerData.isConnected ? `url('${this.playerData.backgroundURL}')` : "";
    this.background.classList.toggle("bg-primary-5", !this.playerData.isHuman && !this.playerData.isParticipant);
    this.background.classList.toggle("opacity-50", !this.playerData.isHuman && !this.playerData.isParticipant);
    this.background.classList.toggle(
      "img-mp-lobby-ai-background",
      !this.playerData.isHuman && this.playerData.isParticipant || this.playerData.isHuman && !this.playerData.isConnected
    );
    this.setLocalPlayer(this.playerData.isLocal);
  }
  setLocalPlayer(isLocalPlayer) {
    this.localPlayerFilligree.classList.toggle("invisible", !isLocalPlayer);
  }
}
Controls.define("mp-staging-player-info-card", {
  createInstance: MpStagingPlayerInfoCard,
  description: "player info card for the lobby",
  classNames: ["mp-staging-player-info-card", "min-h-24"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "data-player-info"
    }
  ]
});
//# sourceMappingURL=mp-staging-player-info-card.js.map
