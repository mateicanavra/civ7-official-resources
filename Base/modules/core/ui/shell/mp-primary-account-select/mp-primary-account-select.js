import { a as DialogBoxManager, D as DialogBoxAction } from '../../dialog-box/manager-dialog-box.chunk.js';
import { F as Focus } from '../../input/focus-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { UnlockableRewardItems } from '../../utilities/utilities-liveops.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../input/focus-manager.js';
import '../../audio-base/audio-support.chunk.js';
import '../../views/view-manager.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../context-manager/context-manager.js';
import '../../input/cursor.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-modal-frame class=\"mp-primary-account-select__frame p-12\">\r\n\t<fxs-header\r\n\t\tclass=\"font-title text-center uppercase tracking-100 fxs-header text-gradient-secondary max-w-full\"\r\n\t\ttitle=\"LOC_UI_PRIMARY_ACCOUNT_SELECT_TITLE\"\r\n\t\tfiligree-style=\"h2\"\r\n\t></fxs-header>\r\n\t<fxs-vslot class=\"mp-primary-account-select__buttons-container mt-6\">\r\n\t\t<fxs-chooser-item class=\"mp-primary-account__current-primary-button w-full\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"mp-primary-account-select__primary-button-contents grow flow-column flex justify-stretch items-center\"\r\n\t\t\t>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"mp-primary-account-select__primary-button-header mt-2 font-title text-accent-1 text-m text-header-4 tracking-100 whitespace-nowrap\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_CURRENT_PRIMARY_ACCOUNT\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"mp-primary-account-select__primary-progression-container mt-3 w-96\">\r\n\t\t\t\t\t<div class=\"mp-primary-account-select__primary-account-info relative w-96\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t\t<fxs-chooser-item class=\"mp-primary-account__current-platform-button w-full mt-2\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"mp-primary-account-select__platform-button-contents grow flow-column flex justify-stretch items-center\"\r\n\t\t\t>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"mp-primary-account-select__platform-button-header mt-2 font-title text-accent-1 text-m text-header-4 tracking-100 whitespace-nowrap\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_CURRENT_PLATFORM_ACCOUNT\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"mp-primary-account-select__platform-progression-container mt-3 w-96\">\r\n\t\t\t\t\t<div class=\"mp-primary-account-select__platform-account-info relative w-96\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</fxs-chooser-item>\r\n\t</fxs-vslot>\r\n</fxs-modal-frame>\r\n";

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
