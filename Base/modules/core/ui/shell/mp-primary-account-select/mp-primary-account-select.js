import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import { Focus } from '../../input/focus-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { UnlockableRewardItems } from '../../utilities/utilities-liveops.js';
import content from './mp-primary-account-select.html.js';
import { DialogBoxAction } from '../../dialog-box/model-dialog-box.js';

class MpPrimaryAccountSelect extends Panel {
  //TODO: Have these structures populated with real info
  //private currentPrimaryProfile: Partial<DNAUserCardInfo> = {};
  //private currentPlatformProfile: Partial<DNAUserCardInfo> = {};
  currentPrimaryProfile = null;
  currentPlatformProfile = null;
  currentPrimaryButton;
  currentPlatformButton;
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  profileButtonListener = (useCurrentPrimary) => {
    this.onUserProfileSelected(useCurrentPrimary);
  };
  isClosing = false;
  onInitialize() {
    this.currentPrimaryButton = MustGetElement(".mp-primary-account__current-primary-button", this.Root);
    this.currentPlatformButton = MustGetElement(".mp-primary-account__current-platform-button", this.Root);
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.currentPrimaryButton.addEventListener("action-activate", () => {
      this.profileButtonListener(true);
    });
    this.currentPlatformButton.addEventListener("action-activate", () => {
      this.profileButtonListener(false);
    });
    const profiles = Online.UserProfile.getPlatformUserProfilesData();
    profiles.userProfiles.forEach((profile) => {
      if (profile.Status == "primary") {
        this.currentPrimaryProfile = profile;
      } else if (profile.Status == "platform") {
        this.currentPlatformProfile = profile;
      } else {
        console.warn("No status marked for profile!");
      }
    });
    if (this.currentPrimaryProfile != null) {
      const currentPrimaryAccountButton = MustGetElement(
        ".mp-primary-account-select__primary-account-info",
        this.Root
      );
      currentPrimaryAccountButton.innerHTML = this.buildPlayerCard();
      currentPrimaryAccountButton.appendChild(this.buildLastSeenDateAndTimeHTML());
    }
    if (this.currentPlatformProfile != null) {
      const currentPlatformAccountButton = MustGetElement(
        ".mp-primary-account-select__platform-account-info",
        this.Root
      );
      currentPlatformAccountButton.innerHTML = this.buildPlayerCard(true);
      currentPlatformAccountButton.appendChild(this.buildLastSeenDateAndTimeHTML(true));
    } else {
      this.currentPlatformButton.remove();
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericSelect();
    Focus.setContextAwareFocus(
      MustGetElement(".mp-primary-account-select__buttons-container", this.Root),
      this.Root
    );
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
  }
  buildPlayerCard(isPlatformProfile = false) {
    const accountType = isPlatformProfile ? "platform" : "primary";
    const badgeID = isPlatformProfile ? this.currentPlatformProfile?.BadgeId ?? "" : this.currentPrimaryProfile?.BadgeId ?? "";
    const badgeURL = UnlockableRewardItems.getBadge(badgeID).url;
    const bannerID = isPlatformProfile ? this.currentPlatformProfile?.BannerId ?? "" : this.currentPrimaryProfile?.BannerId ?? "";
    const bannerURL = UnlockableRewardItems.getBanner(bannerID).url;
    const playerTitle = Locale.compose(
      isPlatformProfile ? this.currentPlatformProfile?.TitleLocKey ?? "" : this.currentPrimaryProfile?.TitleLocKey ?? ""
    );
    const platformIconURL = isPlatformProfile ? this.currentPlatformProfile?.InfoIconURL ?? "" : this.currentPrimaryProfile?.InfoIconURL ?? "";
    const platformName = isPlatformProfile ? this.currentPlatformProfile?.firstPartyName ?? "" : this.currentPrimaryProfile?.firstPartyName ?? "";
    const foundationLevel = isPlatformProfile ? this.currentPlatformProfile?.FoundationLevel ?? 1 : this.currentPrimaryProfile?.FoundationLevel ?? 1;
    return '<div class="mp-primary-account-select__' + accountType + '-account-player-card-background-image relative w-full bg-cover bg-no-repeat h-20" style="background-image: url(' + bannerURL + ');"><br/><fxs-hslot class="mp-primary-account-select__' + accountType + '-account-player-card relative w-full h-full flex flex-row justify-between fxs-hslot" tabindex="-1" slot="true"><br/><div class="mp-primary-account-select__' + accountType + '-account-player-card-data-wrapper flex flex-initial grow"><br/><fsx-hslot class="mp-primary-account-select__' + accountType + '-account-player-card-data flex grow fxs-hslot" tabindex="-1" slot="true"><br/><div class="mp-primary-account-select__' + accountType + '-account-player-card-platform-icon bg-cover bg-no-repeat w-8 h-8" style="background-image: url(' + platformIconURL + ');"></div><br/><div class="mp-primary-account-select__' + accountType + '-account-player-card-platform-name font-body text-base text-header-4 flex font-fit-shrink">' + platformName + '</div><br/><div class="mp-primary-account-select__' + accountType + '-account-player-card-title font-body text-sm text-accent-1 flex self-end -mt-2">' + playerTitle + '</div></fsx-hslot></div><br/><div class="mp-primary-account-select__' + accountType + '-account-player-card-badge flex"><br/><progression-badge class="mp-primary-account-select__' + accountType + '-account-player-card-badge relative flex shrink -mt-4 mx-2" badge-size="micro" data-badge-url="' + badgeURL + '" data-badge-progression-level="' + foundationLevel + '"><br/></progression-badge></div></fxs-hslot></div>';
  }
  buildLastSeenDateAndTimeHTML(isPlatformProfile = false) {
    const playerCard = document.createElement("div");
    playerCard.className = isPlatformProfile ? "mp-primary-account-select__last-seen-on-current-platform" : "mp-primary-account-select__last-seen-on-current-primary";
    playerCard.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "mt-1",
      "mb-1",
      "font-body",
      "text-center",
      "text-accent-1",
      "text-xs",
      "font-fit-shrink",
      "tracking-100",
      "whitespace-nowrap"
    );
    playerCard.textContent = isPlatformProfile ? this.currentPlatformProfile?.LastSeen ?? "" : this.currentPrimaryProfile?.LastSeen ?? "";
    return playerCard;
  }
  setNewPrimaryAccount(useCurrentPrimary) {
    Network.completePrimaryAccountSelection(useCurrentPrimary);
  }
  showWarningPopUp(useCurrentPrimary) {
    NavTray.clear();
    if (useCurrentPrimary) {
      this.setNewPrimaryAccount(useCurrentPrimary);
      this.close();
    } else {
      DialogBoxManager.createDialog_ConfirmCancel({
        body: "LOC_UI_PRIMARY_ACCOUNT_SELECT_WARNING",
        title: "LOC_OPTIONS_ARE_YOU_SURE",
        canClose: false,
        callback: (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.setNewPrimaryAccount(useCurrentPrimary);
            this.close();
          }
        }
      });
    }
  }
  onUserProfileSelected(useCurrentPrimary) {
    if (this.isClosing) {
      return;
    }
    this.showWarningPopUp(useCurrentPrimary);
  }
  close() {
    this.isClosing = true;
    super.close();
  }
}
Controls.define("screen-mp-primary-account-select", {
  createInstance: MpPrimaryAccountSelect,
  description: "Screen to select primary account.",
  classNames: ["mp-primary-account-select"],
  innerHTML: [content],
  tabIndex: -1
});
//# sourceMappingURL=mp-primary-account-select.js.map
