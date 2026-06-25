import { Audio } from '../../audio-base/audio-support.js';
import { ActionActivateEventName } from '../../components/fxs-activatable.js';
import ContextManager from '../../context-manager/context-manager.js';
import { displayRequestUniqueId } from '../../context-manager/display-handler.js';
import { DisplayQueueManager } from '../../context-manager/display-queue-manager.js';
import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import { GameCreatorOpenedEventName, GameCreatorClosedEventName, StartCampaignEventName, MainMenuReturnEventName, SendCampaignSetupTelemetryEventName, SendCampaignSetupTelemetryEvent } from '../../events/shell-events.js';
import { Focus } from '../../input/focus-support.js';
import { InputEngineEventName, NavigateInputEventName } from '../../input/input-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import '../../options/editors/index.js';
import { giftboxButtonName } from '../../profile-header/profile-header.js';
import { ProfileTabType } from '../../profile-page/screen-profile-page.js';
import RewardsNotificationsManager from '../../rewards-notifications/rewards-notification-manager.js';
import SaveLoadData, { QueryCompleteEventName } from '../../save-load/model-save-load.js';
import { SaveLoadClosedEventName } from '../../save-load/screen-save-load.js';
import { GetCivilizationData } from '../create-panels/age-civ-select-model.js';
import { getLeaderData } from '../create-panels/leader-select-model.js';
import { ScreenCreditsOpenedEventName, ScreenCreditsClosedEventName } from '../credits/screen-credits.js';
import { EventsScreenGoSinglePlayerEventName, EventsScreenGoMultiPlayerEventName, EventsScreenLoadEventName, EventsScreenContinueEventName } from '../events/screen-events.js';
import { mainMenuAssetPreload } from './main-menu-asset-preload.js';
import { PromoCarouselModel } from './main-menu-carousel-model.js';
import { LegalDocsAcceptedEventName, LegalDocsPlacementAcceptName } from '../mp-legal/mp-legal.js';
import MultiplayerShellManager from '../mp-shell-logic/mp-shell-logic.js';
import { MovieScreenOpenedEventName, MovieScreenClosedEventName } from '../screen-movie/screen-movie.js';
import { cancelAllChainedAnimations } from '../../utilities/animations.js';
import { fixupNNBSP } from '../../utilities/utilities-core-textprovider.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { Layout } from '../../utilities/utilities-layout.js';
import { getPlayerCardInfo, updatePlayerProfile } from '../../utilities/utilities-liveops.js';
import { NetworkUtilities } from '../../utilities/utilities-network.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import styles from './main-menu.scss2.js';
import { EditorCalibrateHDROpenedEventName, EditorCalibrateHDRClosedEventName } from '../../options/editors/calibrateHDR/editor-calibrate-hdr.js';
import { DialogBoxAction } from '../../dialog-box/model-dialog-box.js';

const isLiveEventGame = false;
const accountDialogId = displayRequestUniqueId();
const getKickDialogId = displayRequestUniqueId();
class MainMenu extends Component {
  profileHeaderContainer;
  profileHeader;
  odrDownload;
  slot;
  buttonContainer;
  carouselSmallContainer;
  connStatus;
  connIcon;
  accountStatus;
  accountStatusAnim;
  accountStatusNavHelp;
  accountIcon;
  accountIconActivatable;
  motdDisplay = document.createElement("div");
  motdDisplayMessage = document.createElement("div");
  buildInfo;
  promoCarouselSmall;
  movieContainer;
  shroud;
  mainMenuBackground;
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  qrCompletedListener = this.onAccountUpdated.bind(this);
  accountUpdatedListener = this.onAccountUpdated.bind(this);
  accountLoggedOutListener = this.onLogoutResults.bind(this);
  accountUnlinkedListener = this.onAccountUpdated.bind(this);
  accountIconListener = this.onClickedAccount.bind(this);
  creditsOpenedListener = this.onCreditsOpened.bind(this);
  creditsClosedListener = this.onCreditsClosed.bind(this);
  movieScreenOpenedListener = this.onMovieScreenOpened.bind(this);
  movieScreenClosedListener = this.onMovieScreenClosed.bind(this);
  returnToMainMenuListener = this.returnedToMainMenu.bind(this);
  sendCampaignSetupTelemetryListener = this.sendCampaignSetupTelemetry.bind(this);
  calibrateHDROpenedListener = this.onCalibrateHDROpened.bind(this);
  calibrateHDRClosedListener = this.onCalibrateHDRClosed.bind(this);
  eventsGoSinglePlayerListener = this.onEventsGoSP.bind(this);
  eventsGoMultiPlayerListener = this.onEventsGoMP.bind(this);
  eventsGoLoadListener = this.onEventsGoLoad.bind(this);
  eventsGoContinueListener = this.onEventsGoContinue.bind(this);
  gameCreatorOpenedListener = this.onGameCreatorOpened.bind(this);
  gameCreatorClosedListener = this.onGameCreatorClosed.bind(this);
  startNewCampaignListener = this.onNewCampaignStart.bind(this);
  motdCompletedListener = this.gotMOTD.bind(this);
  startGameSectionListener = this.startSection.bind(this);
  spoPCompleteListener = this.onSPoPComplete.bind(this);
  spoPKickPromptCheckListener = this.onSPoPKickPromptCheck.bind(this);
  spopHeartBeatReceivedListener = this.onSPoPHeartBeatReceived.bind(this);
  onLaunchHostMPGameListener = this.onLaunchToHostMPGame.bind(this);
  queryCompleteListener = this.onQueryComplete.bind(this);
  saveLoadClosedListener = this.onSaveLoadClosed.bind(this);
  connectionStatusChangedListener = this.onConnectionStatusChanged.bind(this);
  liveEventsSettingsChangeListener = this.onLiveEventsSettingsChanged.bind(this);
  endStateListener = this.onAccountUpdated.bind(this);
  rewardReceivedListener = this.onRewardRecieved.bind(this);
  ssoRecheckTimeBufferReachedListener = this.onRecheckSSO.bind(this);
  odrDownloadButtonActivateListener = this.onOdrButtonActivate.bind(this);
  continueSave = null;
  MainMenuSceneModels = null;
  static VO_CAMERA_POSITION = { x: -1.834, y: -23.0713, z: 15.2 };
  static VO_CAMERA_TARGET = { x: -2.7588, y: -17.4867, z: 14.8042 };
  static VO_SMALL_SCREEN_CAMERA_POSITION = { x: -1.834, y: -23.0713, z: 15.2 };
  static VO_SMALL_SCREEN_CAMERA_TARGET = { x: -3.7, y: -17.4867, z: 14.8042 };
  currentPreloadingAsset = null;
  hasPreloadingBegun = false;
  preloadAssetNames = [];
  preloadAssetIndex = 0;
  campaignSetupTimestamp = 0;
  campaignSetupId = null;
  areLegalDocsAccepted = false;
  isUserInitiatedLogout = false;
  firstLaunchTutorialPending = false;
  inSubScreen = false;
  leaderModelSetup = false;
  mainMenuActivated = false;
  mainMenuButtons = [];
  needKickDecision = false;
  // Some subscreens requires the profile header while the hdr is not one of them
  hdrCalibrationMenuOpen = false;
  bShowRewardsScreen = false;
  bPendingSSOCheck = false;
  pendingSSODialogBoxID = -1;
  odrDownloadDialogBoxId = -1;
  forceOfflineLegalFlow = false;
  hasShownDNAErrorPopup = false;
  isInLoginFlow = false;
  constructor(root) {
    super(root);
    engine.on("LaunchToHostMPGame", this.onLaunchHostMPGameListener);
  }
  onInitialize() {
    this.render();
    this.slot = MustGetElement("#MainMenuSlot", this.Root);
    this.slot.setAttribute("data-navrule-up", "wrap");
    this.slot.setAttribute("data-navrule-down", "wrap");
    this.carouselSmallContainer = MustGetElement(".carousel-small-container", this.Root);
    this.buttonContainer = MustGetElement(".main-menu-button-container", this.Root);
    this.mainMenuBackground = MustGetElement("main-menu-background", this.Root);
    if (Network.supportsSSO()) {
      this.promoCarouselSmall = document.createElement("promo-carousel-small");
      this.carouselSmallContainer.appendChild(this.promoCarouselSmall);
      this.connStatus = document.createElement("div");
      this.connStatus.role = "status";
      this.connStatus.classList.value = "connection-status hidden absolute flex bottom-8";
      this.Root.appendChild(this.connStatus);
      this.accountStatusNavHelp = document.createElement("fxs-nav-help");
      this.accountStatusNavHelp.setAttribute("action-key", "inline-shell-action-2");
      this.accountStatusNavHelp.classList.add("absolute", "top-2", "left-2");
    }
    this.profileHeaderContainer = MustGetElement(".main-menu__profile-header-container", this.Root);
    this.buildInfo = MustGetElement(".main-menu-build-info", this.Root);
    this.buildInfo.innerHTML = Locale.compose("LOC_SHELL_BUILD_INFO", BuildInfo.version.display);
    this.slot.appendChild(this.buildInfo);
    this.odrDownload = document.createElement("div");
    this.odrDownload.classList.add("ml-2", "relative", "main-menu_odr-download", "hidden");
    const odrDownloadButton = document.createElement("fxs-activatable");
    odrDownloadButton.addEventListener(ActionActivateEventName, this.odrDownloadButtonActivateListener);
    odrDownloadButton.classList.add(
      "main-menu_odr-download-button",
      "img-prof-btn-bg",
      "pointer-events-auto",
      "flow-column",
      "justify-center",
      "items-center",
      "w-16",
      "h-16",
      "transition-transform",
      "hover\\:scale-110",
      "focus\\:scale-110"
    );
    odrDownloadButton.innerHTML = `
			<div class="img-icon-download pointer-events-none w-10 h-10"></div>
			<fxs-nav-help class="absolute -top-3 -right-4" action-key="inline-shell-action-5"></fxs-nav-help>
		`;
    this.odrDownload.appendChild(odrDownloadButton);
    this.profileHeaderContainer.appendChild(this.odrDownload);
    this.updateOdrDownload();
    if (Network.supportsSSO()) {
      this.profileHeader = document.createElement("profile-header");
      this.profileHeader.classList.add("main-menu__profile-header");
      this.profileHeader.setAttribute("profile-for", "main-menu");
      this.profileHeader.setAttribute(
        "hide-giftbox",
        Online.UserProfile.getRewardsEnabledConfiguration() ? "false" : "true"
      );
      this.profileHeaderContainer.appendChild(this.profileHeader);
      this.motdDisplay.classList.value = "motd-box absolute flex bottom-0 l-0 w-full items-center justify-center font-body-sm text-accent-2 text-center";
      this.Root.appendChild(this.motdDisplay);
      this.motdDisplayMessage.role = "paragraph";
      this.motdDisplay.appendChild(this.motdDisplayMessage);
      this.bShowRewardsScreen = Online.UserProfile.getNewlyUnlockedItems().length > 0 && !RewardsNotificationsManager.allNewRewardsAreHidden();
    } else if (Online.Metaprogression.supportsMemento()) {
      this.profileHeader = document.createElement("profile-header");
      this.profileHeader.classList.add("main-menu__profile-header");
      this.profileHeader.setAttribute("profile-for", "main-menu");
      this.profileHeader.setAttribute(
        "hide-progression-header",
        Online.Metaprogression.supportsMemento() ? "false" : "true"
      );
      this.profileHeader.setAttribute("hide-giftbox", "true");
      this.profileHeader.setAttribute("hide-social", "true");
      this.profileHeaderContainer.appendChild(this.profileHeader);
    }
    this.movieContainer = document.createElement("div");
    this.movieContainer.classList.value = "movie-container pointer-events-none absolute inset-0";
    this.Root.appendChild(this.movieContainer);
    this.shroud = document.createElement("div");
    this.shroud.classList.value = "menu-shroud pointer-events-none absolute inset-0 fullscreen-outside-safezone";
    this.Root.appendChild(this.shroud);
  }
  render() {
    this.Root.innerHTML = `
			<main-menu-background></main-menu-background>
			<div class="main-menu-slot-container-outer">
				<div class="flex self-end h-full">
					<div class="main-menu-slot-container flex self-center">
						<fxs-vslot id="MainMenuSlot">
							<div class="flex flex-col mr-48">
								<div class="logo-box bg-center bg-cover bg-no-repeat self-center -mt-6 -mb-4"></div>
								<div class="logo-filigree filigree-divider-h2 mb-2 self-center"></div>
							</div>
							<div class="relative pl-18">
								<div class="flex my-8 main-menu-container-inner">
									<div class="img-frame-filigree main-menu-container-top opacity-70 absolute left-24 top-2 w-128 h-36 -z-1"></div>
									<div class="img-frame-filigree main-menu-container-bottom opacity-70 absolute left-24 -bottom-14 w-128 h-36 -scale-y-100 -z-1"></div>
									<div class="flex items-center carousel-button-container -ml-8">
										<div class="carousel-small-container -ml-10 my-4"></div>
										<div class="main-menu-button-container flex flex-col ml-4 my-2"></div>
									</div>
								</div>
							</div>
							<div
								class="main-menu__profile-header-container flex flex-row flex-row-reverse flex-nowrap items-center self-center mt-8 ml-24"
							></div>
							<div role="paragraph" class="main-menu-build-info font-body-sm text-secondary-2 self-center mt-12 mr-48"></div>
						</fxs-vslot>
					</div>
				</div>
			</div>`;
  }
  onAttach() {
    super.onAttach();
    engine.on("SPoPComplete", this.spoPCompleteListener);
    engine.on("AccountUpdated", this.accountUpdatedListener);
    engine.on("SPoPKickPromptCheck", this.spoPKickPromptCheckListener);
    engine.on("LogoutCompleted", this.accountLoggedOutListener);
    engine.on("SPoPHeartbeatReceived", this.spopHeartBeatReceivedListener);
    engine.on("LiveEventsSettingsChanged", this.liveEventsSettingsChangeListener);
    engine.on("EndStateReached", this.endStateListener);
    engine.on("EntitlementsUpdated", this.rewardReceivedListener);
    engine.call("setSnapshotEnabled", false);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener(NavigateInputEventName, this.navigateInputListener);
    this.leaderModelSetup = false;
    this.preload3DSceneAssets();
    this.queue3DSceneAssetPreloads();
    mainMenuAssetPreload.preload();
    Input.setActiveContext(InputContext.Shell);
    Input.setClipCursorPaused(true);
    let mpAgeTransition = false;
    let ageTransition = false;
    const transitionState = Modding.getTransitionInProgress();
    if (transitionState == TransitionType.Age) {
      ageTransition = true;
      if (Configuration.getGame().isNetworkMultiplayer) {
        mpAgeTransition = true;
      }
    }
    const buttonList = [];
    buttonList.push({
      name: "LOC_MAIN_MENU_CONTINUE",
      audio: "continue",
      buttonListener: () => {
        if (this.canPerformInputs()) this.goContinue();
      },
      extraClass: "continue-item",
      disabled: true,
      separator: true
    });
    buttonList.push({
      name: "LOC_MAIN_MENU_NEW_GAME",
      audio: "create-game",
      buttonListener: () => {
        if (this.canPerformInputs()) this.openCreateGame();
      },
      extraClass: "create-game-item"
    });
    buttonList.push({
      name: "LOC_MAIN_MENU_LOAD_GAME",
      audio: "load-game",
      buttonListener: () => {
        if (this.canPerformInputs()) this.openLoadGame();
      }
    });
    if (Network.supportsSSO()) {
      buttonList.push({
        name: "LOC_MAIN_MENU_EVENTS",
        audio: "events",
        buttonListener: () => {
          if (this.canPerformInputs()) this.openEvents();
        },
        extraClass: "hidden"
      });
    }
    if (UI.isNetworkBuild() && UI.supportsMultiplayer()) {
      buttonList.push({
        name: "LOC_MAIN_MENU_MULTIPLAYER",
        audio: "multiplayer",
        buttonListener: () => {
          if (this.canPerformInputs()) this.openMultiplayer();
        },
        separator: true
      });
    }
    if (UI.supportsDLC() && UI.isNetworkBuild()) {
      buttonList.push({
        name: "LOC_UI_STORE_LAUNCHER_TITLE",
        audio: "store",
        buttonListener: () => {
          if (this.canPerformInputs()) this.openStore();
        },
        disabled: !UI.isNetworkBuild()
      });
    }
    if (UI.shouldShowAdditionalContent()) {
      buttonList.push({
        name: "LOC_MAIN_MENU_ADDITIONAL_CONTENT",
        audio: "additional-content",
        buttonListener: () => {
          if (this.canPerformInputs()) this.openExtras();
        }
      });
    } else {
      buttonList.push({
        name: "LOC_MAIN_MENU_CREDITS",
        audio: "additional-content",
        buttonListener: () => {
          if (this.canPerformInputs()) this.onCredits();
        }
      });
    }
    buttonList.push({
      name: "LOC_MAIN_MENU_OPTIONS",
      audio: "options",
      buttonListener: () => {
        if (this.canPerformInputs()) this.openOptions();
      }
    });
    const toggleTestScene = {
      id: "toggleTestScene",
      category: "Shell",
      caption: "Toggle Test Scene",
      domainType: "iota",
      value: false
    };
    UI.Debug.registerWidget(toggleTestScene);
    engine.on("DebugWidgetUpdated", (id, _value) => {
      if (id == "toggleTestScene") {
        this.build3DScene();
      }
    });
    if (UI.canExitToDesktop()) {
      buttonList.push({
        name: "LOC_MAIN_MENU_EXIT",
        audio: "exit",
        buttonListener: () => {
          if (this.canPerformInputs()) this.exitToDesktop();
        }
      });
    }
    buttonList.forEach((button) => {
      const newButton = document.createElement("fxs-text-button");
      newButton.classList.add("main-menu-text-button", "self-start", "whitespace-nowrap");
      newButton.setAttribute("type", "big");
      newButton.setAttribute("centered", "false");
      newButton.setAttribute("highlight-style", "decorative");
      newButton.setAttribute("caption", Locale.stylize(button.name).toUpperCase());
      newButton.setAttribute("data-tooltip-style", "none");
      newButton.setAttribute("data-audio-group-ref", "main-menu-audio");
      newButton.setAttribute("data-audio-activate-ref", "data-audio-clicked-" + button.audio);
      newButton.addEventListener("action-activate", () => {
        if (this.canPerformInputs()) {
          Telemetry.sendUIMenuAction({
            Menu: TelemetryMenuType.MainMenu,
            MenuAction: TelemetryMenuActionType.Select,
            Item: button.name
          });
        }
      });
      newButton.addEventListener("action-activate", button.buttonListener, {});
      this.buttonContainer.appendChild(newButton);
      if (button.separator) {
        const separator = document.createElement("div");
        separator.classList.add("main-menu-separator", "min-w-96", "my-1");
        this.buttonContainer.appendChild(separator);
      }
      if (button.disabled) {
        newButton.classList.add("disabled");
        newButton.setAttribute("disabled", "true");
      } else {
        this.mainMenuButtons.push(newButton);
      }
      if (button.extraClass) {
        newButton.classList.add(button.extraClass);
      }
    });
    if (ageTransition) {
      this.slot.classList.add("hidden");
    }
    ContextManager.pushElement(this.Root);
    this.checkForError();
    this.checkIfModsWereReset();
    Network.onExitPremium();
    const lastPremiumError = Network.getLastPremiumError();
    Network.clearPremiumError();
    if (lastPremiumError != "") {
      DialogBoxManager.createDialog_Confirm({
        title: "LOC_MP_CANT_PLAY_ONLINE_ERROR_TITLE",
        body: lastPremiumError
      });
    }
    engine.on("SSORecheckTimeBufferReached", this.ssoRecheckTimeBufferReachedListener);
    if (Network.hasProgressedPastLegalDocs()) {
      this.updateAreLegalDocsAccepted();
    } else {
      this.bPendingSSOCheck = true;
      Network.startSSOLoginBufferTimer();
    }
    if (Network.supportsSSO()) {
      this.connIcon = document.createElement("div");
      this.connIcon.classList.add(
        "connection-icon-img",
        "pointer-events-auto",
        "flex",
        "relative",
        "flex-col",
        "justify-center"
      );
      this.connIcon.classList.add("align-center", "bg-contain", "bg-center", "bg-no-repeat", "w-18", "h-18");
      this.setConnectionIcon();
      this.connStatus.appendChild(this.connIcon);
      this.onLiveEventsSettingsChanged();
      this.accountIcon = document.createElement("div");
      this.accountIcon.classList.add("account-icon-img", "pointer-events-none", "flex", "relative", "flex-col");
      this.accountIcon.classList.add(
        "justify-center",
        "align-center",
        "bg-contain",
        "bg-center",
        "bg-no-repeat",
        "w-28",
        "h-28"
      );
      this.accountIcon.setAttribute("data-audio-press-ref", "data-audio-primary-button-press");
      this.accountIconActivatable = document.createElement("fxs-activatable");
      this.accountIconActivatable.classList.add("absolute", "inset-6");
      this.accountIcon.appendChild(this.accountIconActivatable);
      this.accountStatus = document.createElement("div");
      this.accountStatus.classList.value = "account-status hidden absolute flex right-28 bottom-24";
      this.accountStatus.appendChild(this.accountIcon);
      this.accountStatus.appendChild(this.accountStatusNavHelp);
      this.accountStatusAnim = document.createElement("div");
      this.accountStatusAnim.classList.add(
        "connection-anim-container",
        "absolute",
        "hidden",
        "pointer-events-none"
      );
      const statusAnim = document.createElement("fxs-flipbook");
      const atlas = [
        {
          src: "blp:my2k_connecting_anim.png",
          spriteWidth: 128,
          spriteHeight: 128,
          size: 512,
          nFrames: 8
        }
      ];
      const flipbookDefinition = {
        fps: 2,
        preload: true,
        atlas
      };
      statusAnim.classList.add("pointer-events-none");
      statusAnim.setAttribute("data-flipbook-definition", JSON.stringify(flipbookDefinition));
      this.accountStatusAnim.appendChild(statusAnim);
      this.accountStatus.appendChild(this.accountStatusAnim);
      this.Root.appendChild(this.accountStatus);
      this.setAccountIcon(this.isFullAccountLinkedAndConnected());
      this.accountStatusNavHelp.classList.toggle("hidden", Network.isWaitingForValidHeartbeat());
      if (!Network.isWaitingForValidHeartbeat()) {
        this.accountIconActivatable.addEventListener("action-activate", this.accountIconListener);
      } else {
        this.accountIcon.style.backgroundImage = "url('blp:my2k_connecting.png')";
        this.accountIconActivatable.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_UI_WAITING_SPOP_HEARTBEAT_OK")
        );
      }
      if (Network.isConnectedToSSO()) {
        engine.on("QrAccountLinked", this.qrCompletedListener);
        engine.on("AccountUnlinked", this.accountUnlinkedListener);
      }
      engine.on("DNAForceOfflineFromEmptyResponse", this.checkDNAFatalError, this);
      engine.on("RequestPrimaryAccountSelection", this.checkPrimaryAccount, this);
      engine.on("MotDCompleted", this.motdCompletedListener);
    }
    engine.on("ConnectionStatusChanged", this.connectionStatusChangedListener);
    engine.on("FetchedOnlineLegalDocsComplete", this.onRecheckSSO, this);
    engine.on("FetchedOfflineLegalDocsComplete", this.handleOfflineLegalDocFlow, this);
    engine.on("StartGameSection", this.startGameSectionListener);
    engine.on("LiveEventActiveUpdated", this.liveEventsSettingsChangeListener);
    engine.on("EntitlementsUpdated", this.rewardReceivedListener);
    if (ageTransition) {
      this.hideOnlineFeaturesUI();
      if (mpAgeTransition) {
        MultiplayerShellManager.onAgeTransition();
      } else {
        this.buildInfo.classList.add("hidden");
        ContextManager.push("age-transition-civ-select", { singleton: true, createMouseGuard: true });
      }
    } else {
      this.skipToMainMenu();
    }
    UI.lockCursor(false);
    UI.setCursorByType(UIHTMLCursorTypes.Default);
    window.addEventListener(GameCreatorOpenedEventName, this.gameCreatorOpenedListener);
    window.addEventListener(GameCreatorClosedEventName, this.gameCreatorClosedListener);
    window.addEventListener(StartCampaignEventName, this.startNewCampaignListener);
    window.addEventListener(LegalDocsAcceptedEventName, this.onLegalDocsAccepted);
    window.addEventListener(SaveLoadClosedEventName, this.saveLoadClosedListener);
    window.addEventListener(ScreenCreditsOpenedEventName, this.creditsOpenedListener);
    this.Root.listenForWindowEvent(MovieScreenOpenedEventName, this.movieScreenOpenedListener);
    window.addEventListener(EditorCalibrateHDROpenedEventName, this.calibrateHDROpenedListener);
    window.addEventListener(MainMenuReturnEventName, this.returnToMainMenuListener);
    window.addEventListener(SendCampaignSetupTelemetryEventName, this.sendCampaignSetupTelemetryListener);
    this.onSaveLoadClosed();
    if (Network.requireSPoPKickPrompt()) {
      if (!this.checkForLegalDocs()) {
        this.getKickDecision();
      } else {
        this.needKickDecision = true;
      }
    }
    if (Network.checkAndClearDisplaySPoPLogout()) {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_SPOP_LOGOUT_ACCOUNT"),
        title: Locale.compose("LOC_UI_LOGOUT_ACCOUNT_TITLE")
      });
    }
    if (Network.checkAndClearDisplayParentalPermissionChange()) {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_PARENTAL_PERMISSION_REVOKED"),
        title: Locale.compose("LOC_UI_ACCOUNT_TITLE")
      });
    }
    if (Network.checkAndClearDisplayMPUnlink()) {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_KICK_MP_UNLINK"),
        title: Locale.compose("LOC_UI_ACCOUNT_TITLE")
      });
    }
    if (!Network.isConnectedToNetwork() && Network.areLegalDocsCompleted()) {
      waitForLayout(() => engine.trigger("NetworkDisconnected"));
      if (Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER) {
        DialogBoxManager.createDialog_Confirm({
          body: "LOC_UI_MP_LANDING_ERROR_NO_CONNECTION",
          title: "LOC_UI_NO_INTERNET_CONNECTION_TITLE"
        });
      }
    }
    const launchToHostMPGame = this.Root.getAttribute("data-launch-to-host-MP-game") == "true";
    if (launchToHostMPGame) {
      this.onLaunchToHostMPGame();
    }
    if (!Network.requireSPoPKickPrompt() && !Network.isWaitingForValidHeartbeat()) {
      Network.setMainMenuInviteReady(true);
    }
    this.onNewUserLogin();
    if (this.bShowRewardsScreen && !ageTransition && !mpAgeTransition) {
      this.showRewardsScreen();
    }
    if (UI.shouldShowLowMemoryWarning()) {
      DialogBoxManager.createDialog_CustomOptions({
        body: Locale.compose("LOC_APPLE_ARCADE_MIN_SPECS_NOT_MET_BODY"),
        canClose: false,
        custom: false,
        styles: false,
        options: [],
        customOptions: []
      });
    }
  }
  onDetach() {
    this.mainMenuActivated = false;
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.MainMenu, MenuAction: TelemetryMenuActionType.Exit });
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    window.removeEventListener(GameCreatorOpenedEventName, this.gameCreatorOpenedListener);
    window.removeEventListener(GameCreatorClosedEventName, this.gameCreatorClosedListener);
    window.removeEventListener(StartCampaignEventName, this.startNewCampaignListener);
    window.removeEventListener(LegalDocsAcceptedEventName, this.onLegalDocsAccepted);
    window.removeEventListener(SaveLoadClosedEventName, this.saveLoadClosedListener);
    window.removeEventListener(QueryCompleteEventName, this.queryCompleteListener);
    window.removeEventListener(ScreenCreditsOpenedEventName, this.creditsOpenedListener);
    window.removeEventListener(EditorCalibrateHDROpenedEventName, this.calibrateHDROpenedListener);
    window.removeEventListener(MainMenuReturnEventName, this.returnToMainMenuListener);
    window.removeEventListener(SendCampaignSetupTelemetryEventName, this.sendCampaignSetupTelemetry);
    this.clear3DScene();
    super.onDetach();
  }
  onReceiveFocus() {
    NavTray.clear();
    super.onReceiveFocus();
    this.mainMenuBackground.setAttribute("visible", "true");
    this.updateFoundationLevel();
    UI.toggleGameCenterAccessPoint(true, UIGameCenterAccessPointLocation.BottomLeading);
    if (!this.hdrCalibrationMenuOpen) {
      Focus.setContextAwareFocus(this.slot, this.Root);
      this.showOnlineFeaturesUI();
    }
    this.checkPrimaryAccount();
  }
  checkDNAFatalError() {
    if (this.hasShownDNAErrorPopup) {
      return;
    }
    if (!Network.isConnectedToSSO() && Network.isConnectedToNetwork() && Network.isForcedOfflineFromEmptyResponse()) {
      this.hasShownDNAErrorPopup = true;
      if (Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER) {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_NETWORK_CONNECTION_FAILED")
        });
      } else {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_FORCE_OFFLINE_ACCOUNT_BODY"),
          title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
        });
      }
    }
  }
  checkPrimaryAccount() {
    if (Network.isWaitingForPrimaryAccountSelection()) {
      if (Network.isConnectedToSSO() && Network.hasProgressedPastLegalDocs()) {
        waitForLayout(() => {
          ContextManager.push("screen-mp-primary-account-select", {
            singleton: true,
            createMouseGuard: true
          });
        });
      }
    } else {
      this.updateFoundationLevel();
    }
  }
  onNewUserLogin() {
    if (!Network.supportsSSO() || !Network.isFullAccountLinked()) {
      return;
    }
    const { firstPartyName } = getPlayerCardInfo();
    if (firstPartyName == "") {
      updatePlayerProfile({});
    }
  }
  updateFoundationLevel() {
    const { FoundationLevel } = getPlayerCardInfo();
    const leaderData = Online.Metaprogression.getLegendPathsData().find(
      (x) => x.legendPathLoc.includes("FOUNDATION")
    );
    if (leaderData) {
      const { currentLevel } = leaderData;
      if (currentLevel > FoundationLevel) {
        updatePlayerProfile({ FoundationLevel: currentLevel });
      }
    }
  }
  onLoseFocus() {
    UI.toggleGameCenterAccessPoint(false, UIGameCenterAccessPointLocation.BottomLeading);
    this.mainMenuBackground.setAttribute("visible", "false");
    super.onLoseFocus();
  }
  openLoadGame(isFromEvent = false) {
    if (this.checkForLegalDocs()) {
      return;
    }
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: {
        "menu-type": "load",
        "server-type": ServerType.SERVER_TYPE_NONE,
        "save-type": SaveTypes.SINGLE_PLAYER,
        "from-event": isFromEvent
      }
    });
  }
  openMultiplayer() {
    if (ContextManager.hasInstanceOf("screen-mp-landing") || ContextManager.hasInstanceOf("screen-mp-browser")) {
      return;
    }
    if (this.checkForLegalDocs()) {
      return;
    }
    this.inSubScreen = true;
    this.slot.classList.remove("hidden");
    if (UI.isGameCenterNetworkBuild()) {
      MultiplayerShellManager.onGameMode();
      return;
    }
    MultiplayerShellManager.openLanding();
  }
  onCredits() {
    UI.toggleGameCenterAccessPoint(false, UIGameCenterAccessPointLocation.BottomLeading);
    ContextManager.push("screen-credits", { singleton: true, createMouseGuard: false });
    Telemetry.sendUIMenuAction({
      Menu: TelemetryMenuType.AdditionalContent,
      MenuAction: TelemetryMenuActionType.Select,
      Item: "Credits"
    });
    this.onCreditsOpened();
  }
  onCreditsOpened() {
    this.inSubScreen = true;
    this.raiseShroud();
    this.clear3DScene();
    window.addEventListener(ScreenCreditsClosedEventName, this.creditsClosedListener);
    Network.setMainMenuInviteReady(false);
  }
  onCreditsClosed() {
    this.returnedToMainMenu();
    window.removeEventListener(ScreenCreditsClosedEventName, this.creditsClosedListener);
  }
  onMovieScreenOpened() {
    this.inSubScreen = true;
    window.addEventListener(MovieScreenClosedEventName, this.movieScreenClosedListener);
  }
  onMovieScreenClosed() {
    this.inSubScreen = false;
    window.removeEventListener(MovieScreenClosedEventName, this.movieScreenClosedListener);
  }
  onCalibrateHDROpened() {
    this.raiseShroud();
    this.clear3DScene();
    this.inSubScreen = true;
    this.hdrCalibrationMenuOpen = true;
    this.profileHeader?.classList.add("hidden");
    window.addEventListener(EditorCalibrateHDRClosedEventName, this.calibrateHDRClosedListener);
  }
  onCalibrateHDRClosed() {
    this.returnedToMainMenu();
    this.profileHeader?.classList.remove("hidden");
    this.hdrCalibrationMenuOpen = false;
    window.removeEventListener(EditorCalibrateHDRClosedEventName, this.calibrateHDRClosedListener);
    ContextManager.push("screen-options", {
      singleton: true,
      createMouseGuard: true,
      attributes: { "selected-tab": "3" }
    });
  }
  // Updated On-Demand Resource download
  updateOdrDownload() {
    this.odrDownload?.classList.toggle("hidden", !UI.shouldShowHighEndAssetsDownloadOption());
  }
  returnedToMainMenu() {
    UI.toggleGameCenterAccessPoint(true, UIGameCenterAccessPointLocation.BottomLeading);
    Configuration.editGame()?.reset();
    if (ContextManager.getCurrentTarget() == this.Root) {
      FocusManager.get().setFocus(this.slot);
    }
    this.updateOdrDownload();
    this.build3DScene();
    this.Root.classList.remove("create");
    this.Root.classList.remove("hidden");
    this.slot.classList.remove("hidden");
    this.buildInfo.classList.remove("hidden");
    this.Root.classList.add("trigger-nav-help");
    if (Network.supportsSSO()) {
      this.onAccountUpdated();
      this.showOnlineFeaturesUI();
    }
    this.lowerShroud();
    this.inSubScreen = false;
    MultiplayerShellManager.skipToGameCreator = false;
    Sound.onGameplayEvent(GameplayEvent.MainMenu);
    if (this.needKickDecision) {
      this.needKickDecision = false;
      this.getKickDecision();
    }
    if (!Network.requireSPoPKickPrompt() && !Network.isWaitingForValidHeartbeat()) {
      Network.setMainMenuInviteReady(true);
    }
    this.tryShowDownloadAssetsDialogConfirm();
  }
  setConnectionIcon() {
    if (this.connIcon != null) {
      if (Network.isConnectedToNetwork()) {
        this.isInLoginFlow = false;
        this.connIcon.style.backgroundImage = "url('blp:mp_connected.png')";
        if (Network.isAuthenticated()) {
          this.connIcon.setAttribute("data-tooltip-content", "LOC_UI_CONNECTION_OK");
        } else {
          this.connIcon.setAttribute("data-tooltip-content", "LOC_UI_NETWORK_CONNECTION_OK");
        }
      } else {
        this.connIcon.style.backgroundImage = "url('blp:mp_disconnected.png')";
        this.connIcon.setAttribute("data-tooltip-content", "LOC_UI_NETWORK_CONNECTION_FAILED");
      }
    }
  }
  setAccountIcon(status) {
    this.accountIcon?.setAttribute("data-audio-group-ref", "main-menu-audio");
    this.accountIcon?.setAttribute("data-audio-activate-ref", "data-audio-link-account");
    this.accountStatusAnim?.classList.add("hidden");
    if (this.accountIcon && Network.isConnecting()) {
      this.accountStatusAnim?.classList.remove("hidden");
    } else if (this.accountIcon && Network.isConnectedToNetwork() && Network.isConnectedToSSO()) {
      if (status) {
        this.accountIcon.style.backgroundImage = "url('blp:my2k_loggedin.png')";
        this.accountIconActivatable.setAttribute("data-tooltip-content", "LOC_UI_ACCOUNT_OK");
        this.accountStatusAnim?.classList.add("hidden");
      } else {
        if (Network.isAccountLinked() && !Network.isAccountComplete()) {
          this.accountIcon.style.backgroundImage = "url('blp:my2k_incomplete.png')";
          this.accountIconActivatable.setAttribute(
            "data-tooltip-content",
            "LOC_UI_ACCOUNT_LOGGEDIN_INCOMPLETE"
          );
        } else if (Network.isLoggedIn() && !Network.isAccountLinked()) {
          this.accountIcon.style.backgroundImage = "url('blp:my2k_notlinked.png')";
          this.accountIconActivatable.setAttribute("data-tooltip-content", "LOC_UI_ACCOUNT_LOGGEDIN_FAILED");
          this.accountStatusAnim?.classList.add("hidden");
        } else {
          this.accountIcon.style.backgroundImage = "url('blp:my2k_loggedout.png')";
          this.accountIconActivatable.setAttribute("data-tooltip-content", "LOC_UI_ACCOUNT_LINKED_FAILED");
          this.accountStatusAnim?.classList.add("hidden");
        }
      }
    } else if (this.accountIcon) {
      this.accountIcon.style.backgroundImage = "url('blp:my2k_notloggedin.png')";
      this.accountIconActivatable.setAttribute("data-tooltip-content", "LOC_UI_CONNECTION_FAILED");
    }
  }
  enableMainMenuButtonbyName(name, status, msg = "") {
    const resolvedName = Locale.stylize(name).toUpperCase();
    this.mainMenuButtons.forEach((button) => {
      const buttonName = button.getAttribute("caption");
      if (buttonName != null && buttonName == resolvedName) {
        button.setAttribute("disabled", (!status).toString());
        button.setAttribute("data-tooltip-content", msg);
      }
    });
  }
  onRewardRecieved() {
    this.bShowRewardsScreen = !RewardsNotificationsManager.allNewRewardsAreHidden();
  }
  handleOfflineLegalDocFlow() {
    this.forceOfflineLegalFlow = true;
    if (this.pendingSSODialogBoxID != -1) {
      DisplayQueueManager.closeMatching(this.pendingSSODialogBoxID);
      this.pendingSSODialogBoxID = -1;
    }
    this.updateAreLegalDocsAccepted();
    this.tryToHandleLegalDocs();
  }
  onRecheckSSO() {
    const hasProgressedPastLegalDocs = Network.hasProgressedPastLegalDocs();
    if (hasProgressedPastLegalDocs) {
      if (this.pendingSSODialogBoxID != -1) {
        DisplayQueueManager.closeMatching(this.pendingSSODialogBoxID);
        this.pendingSSODialogBoxID = -1;
      }
      if (this.bPendingSSOCheck) {
        this.bPendingSSOCheck = false;
      }
      this.updateAreLegalDocsAccepted();
      this.tryToHandleLegalDocs();
    } else {
      const cancelWaitForSSOCallback = () => {
        this.handleOfflineLegalFlow();
      };
      this.pendingSSODialogBoxID = DialogBoxManager.createDialog_Cancel({
        displayHourGlass: true,
        title: Locale.compose("LOC_UI_SSO_CONNECTING_SUBTITLE"),
        callback: cancelWaitForSSOCallback
      });
    }
  }
  handleOfflineLegalFlow() {
    const retryCallback = () => {
      this.onRecheckSSO();
    };
    const loadOfflineLegalDocs = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Network.loadOfflineLegalDocs();
      }
    };
    const logoutplayOfflineOption = {
      actions: ["accept"],
      label: "LOC_MAIN_MENU_CONTINUE",
      callback: loadOfflineLegalDocs
    };
    const retryOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_UI_SSO_RETRY",
      callback: retryCallback
    };
    this.pendingSSODialogBoxID = DialogBoxManager.createDialog_MultiOption({
      body: "LOC_UI_SSO_PLAY_OFFLINE_BODY",
      title: "LOC_UI_SSO_PLAY_OFFLINE",
      layout: "vertical",
      canClose: false,
      options: [logoutplayOfflineOption, retryOption]
    });
  }
  showRewardsScreen() {
    if (Online.UserProfile.getRewardsAutoPopupEnabledConfiguration()) {
      const popupProperties = { singleton: true, createMouseGuard: true };
      const blockInfo = Network.getBlockedAccessInfo(DNAPermissionType.ANY_ACCESS);
      if (blockInfo.reason === BlockedAccessReason.NONE || blockInfo.reason === BlockedAccessReason.ACCOUNT_NOT_LINKED) {
        if (this.Root.getAttribute("disabled") != "true" && ContextManager.getCurrentTarget() == this.Root && !Network.isWaitingForPrimaryAccountSelection()) {
          FocusManager.get().setFocus(this.slot);
          ContextManager.push(giftboxButtonName, popupProperties);
        }
      }
    }
    this.bShowRewardsScreen = false;
  }
  onAccountUpdated() {
    const NetworkStatus = this.isFullAccountLinkedAndConnected();
    this.setConnectionIcon();
    this.setAccountIcon(NetworkStatus);
    this.onLiveEventsSettingsChanged();
    this.profileHeader?.classList.toggle("disabled", !NetworkStatus);
  }
  onLogoutResults() {
    this.onLiveEventsSettingsChanged();
    this.setConnectionIcon();
    this.setAccountIcon(this.isFullAccountLinkedAndConnected());
    if (!this.isUserInitiatedLogout) {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_SPOP_LOGOUT_ACCOUNT"),
        title: Locale.compose("LOC_UI_LOGOUT_ACCOUNT_TITLE")
      });
    } else {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_USER_LOGOUT_ACCOUNT"),
        title: Locale.compose("LOC_UI_LOGOUT_ACCOUNT_TITLE")
      });
      this.isUserInitiatedLogout = false;
    }
  }
  onClickedAccount() {
    if (!this.canPerformInputs()) {
      return;
    }
    const isUserInput = true;
    const result = Network.triggerNetworkCheck(isUserInput);
    if (result.wasErrorDisplayedOnFirstParty) {
      return;
    }
    const isConnectedToNetwork = result.networkResult == NetworkResult.NETWORKRESULT_OK;
    const isBanned = Network.isBanned();
    if (isConnectedToNetwork && Network.isLoggedIn()) {
      if (Network.isAccountLinked() && Network.isAccountComplete()) {
        const twoKPortalCallBack = (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
          }
        };
        const logoutCallback = (eAction) => {
          if (eAction == DialogBoxAction.Confirm) {
            this.isUserInitiatedLogout = true;
            Network.nonSpopLogout();
          }
        };
        const resetPrimaryCallback = () => {
          DialogBoxManager.createDialog_ConfirmCancel({
            body: "LOC_UI_PRIMARY_ACCOUNT_SELECT_WARNING",
            title: "LOC_GENERIC_RESET_PRIMARY_ACCOUNT",
            canClose: true,
            callback: (eAction) => {
              if (eAction == DialogBoxAction.Confirm) {
                Online.Metaprogression.resetPrimaryAccountSelection();
              }
            }
          });
        };
        const logoutOption = {
          actions: ["accept"],
          label: "LOC_GENERIC_LOGOUT",
          callback: logoutCallback
        };
        const twoKPortalOption = {
          actions: ["shell-action-2"],
          label: "LOC_GENERIC_TWOKPORTAL",
          callback: twoKPortalCallBack
        };
        const resetPrimaryOption = {
          actions: ["shell-action-1"],
          label: "LOC_GENERIC_RESET_PRIMARY_ACCOUNT",
          callback: resetPrimaryCallback
        };
        const cancelOption = {
          actions: ["cancel", "keyboard-escape"],
          label: "LOC_GENERIC_CANCEL"
        };
        const options = [
          logoutOption,
          twoKPortalOption,
          ...Online.Metaprogression.canResetPrimaryAccount() ? [resetPrimaryOption] : [],
          cancelOption
          // always last
        ];
        DialogBoxManager.createDialog_MultiOption({
          body: "LOC_UI_SPOP_CONFIRM_LOGOUT",
          title: "LOC_UI_LINK_ACCOUNT_SUBTITLE",
          layout: "vertical",
          canClose: false,
          options,
          dialogId: accountDialogId
        });
      } else if (!Network.isAccountComplete()) {
        if (Network.canDisplayQRCode()) {
          ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
        }
      } else {
        if (Network.canDisplayQRCode()) {
          ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
        }
      }
    } else if (isBanned) {
      const banInfo = Network.getBanInfo();
      if (banInfo != "") {
        DialogBoxManager.createDialog_Confirm({
          body: banInfo,
          //2K will handle localization
          title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE")
        });
      } else {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_ACCOUNT_BANNED"),
          title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE")
        });
      }
    } else {
      if (!isConnectedToNetwork && !Network.isAuthenticated()) {
        DialogBoxManager.createDialog_Confirm({
          body: Locale.compose("LOC_UI_CONNECTION_FAILED"),
          title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
        });
      } else if (Network.isConnectedToSSO()) {
        const waitForLoginCallback = () => {
          this.isInLoginFlow = false;
        };
        if (!this.isInLoginFlow) {
          this.isInLoginFlow = true;
          DialogBoxManager.createDialog_Confirm({
            body: Locale.compose("LOC_UI_LOGIN_ACCOUNT"),
            title: Locale.compose("LOC_UI_LOGIN_ACCOUNT_TITLE"),
            callback: waitForLoginCallback
          });
          Network.attemptLogin();
        }
      } else {
        Network.tryConnect(true);
      }
    }
  }
  onQueryComplete(event) {
    switch (event.detail.result) {
      case SerializerResult.RESULT_PENDING:
        return;
      case SerializerResult.RESULT_OK:
        for (const save of SaveLoadData.saves) {
          if (this.continueSave == null || this.continueSave.saveTime < save.saveTime) {
            this.continueSave = save;
          }
        }
        const hasMissingMods = this.continueSave ? this.continueSave.missingMods.length > 0 : false;
        const hasUnownedMods = this.continueSave ? this.continueSave.unownedMods.length > 0 : false;
        const continueItem = MustGetElement(".continue-item", this.Root);
        const isDisabled = this.continueSave == null || hasMissingMods || hasUnownedMods;
        continueItem.classList.toggle("disabled", isDisabled);
        continueItem.setAttribute("disabled", isDisabled ? "true" : "false");
        if (this.continueSave) {
          if (!this.inSubScreen) {
            this.build3DScene();
          }
          const save = this.continueSave;
          const tooltip = Locale.stylize(
            "LOC_MAIN_MENU_CONTINUE_INFO",
            save.gameName,
            Locale.unpack(save.hostLeaderName),
            Locale.unpack(save.hostCivilizationName),
            save.currentTurn.toString(),
            Locale.unpack(save.hostAgeName),
            fixupNNBSP(save.displaySaveTime)
          );
          continueItem.setAttribute("data-tooltip-content", tooltip);
        } else {
          continueItem.setAttribute("data-tooltip-content", "");
        }
        if (ContextManager.getCurrentTarget() == this.Root) {
          FocusManager.get().setFocus(this.slot);
        }
        break;
      default:
        break;
    }
    window.removeEventListener(QueryCompleteEventName, this.queryCompleteListener);
    event.preventDefault();
    event.stopPropagation();
  }
  onSaveLoadClosed() {
    if (!this.isShrouded) {
      window.addEventListener(QueryCompleteEventName, this.queryCompleteListener);
      const options = SaveLocationCategories.AUTOSAVE | SaveLocationCategories.NORMAL | SaveLocationCategories.QUICKSAVE | SaveLocationOptions.LOAD_METADATA;
      SaveLoadData.querySaveGameList(
        SaveLocations.LOCAL_STORAGE,
        SaveTypes.SINGLE_PLAYER,
        options,
        SaveFileTypes.GAME_STATE
      );
    }
  }
  onConnectionStatusChanged(data) {
    if (data.server == ServerType.SERVER_TYPE_INTERNET) {
      this.onAccountUpdated();
    }
  }
  onLiveEventsSettingsChanged() {
    const resolvedName = Locale.stylize("LOC_MAIN_MENU_EVENTS").toUpperCase();
    this.mainMenuButtons.forEach((button) => {
      const buttonName = button.getAttribute("caption");
      if (buttonName != null && buttonName == resolvedName) {
        if (Configuration.getGame().isLiveEventAccessEnabled) {
          button.classList.remove("hidden");
        } else {
          button.classList.add("hidden");
        }
      }
    });
    const liveReqs = Online.LiveEvent.isLiveEventActive() && Network.isMetagamingAvailable();
    this.enableMainMenuButtonbyName("LOC_MAIN_MENU_EVENTS", liveReqs, this.getAccountLinkPromptMsg());
  }
  getAccountLinkPromptMsg() {
    return Network.isFullAccountLinked() ? "" : "LOC_UI_ACCOUNT_LINKED_PROMPT";
  }
  goContinue() {
    if (this.continueSave && this.continueSave.missingMods.length == 0 && this.continueSave.unownedMods.length == 0) {
      UI.toggleGameCenterAccessPoint(false, UIGameCenterAccessPointLocation.BottomLeading);
      Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
      SaveLoadData.handleLoadSave(this.continueSave, ServerType.SERVER_TYPE_NONE);
    }
  }
  showLegalDocuments() {
    cancelAllChainedAnimations();
    if (!Automation.isActive) {
      ContextManager.push("screen-mp-legal", {
        singleton: true,
        createMouseGuard: true,
        panelOptions: { viewOnly: false }
      });
    }
  }
  gotMOTD() {
    if (!Network.supportsSSO()) {
      return;
    }
    const titles = Online.MOTD.getAllMOTDHeaders();
    titles.forEach((title) => {
      const msg2 = Online.MOTD.getMOTD(title);
      if (msg2) {
        console.log(title, ": ", msg2);
      }
    });
    const randIndex = Math.floor(Math.random() * titles.length);
    const msg = Online.MOTD.getMOTD(titles[randIndex]);
    if (msg) {
      this.motdDisplayMessage.setAttribute("data-l10n-id", msg);
    }
  }
  onSPoPComplete() {
    this.setConnectionIcon();
    if (Network.isWaitingForValidHeartbeat() && this.accountIcon) {
      this.accountIcon.style.backgroundImage = "url('blp:my2k_connecting.png')";
      this.accountIconActivatable.setAttribute(
        "data-tooltip-content",
        Locale.compose("LOC_UI_WAITING_SPOP_HEARTBEAT_OK")
      );
      this.accountIconActivatable.removeAttribute("action-key");
      this.accountIconActivatable.removeEventListener("action-activate", this.accountIconListener);
    } else {
      this.onAccountUpdated();
    }
  }
  onSPoPHeartBeatReceived() {
    this.onAccountUpdated();
    this.accountStatusNavHelp.classList.toggle("hidden", true);
    this.accountIconActivatable.addEventListener("action-activate", this.accountIconListener);
    if (Network.isConnectedToSSO()) {
      engine.on("QrAccountLinked", this.qrCompletedListener);
      engine.on("AccountUnlinked", this.accountUnlinkedListener);
    }
    if (!Network.requireSPoPKickPrompt() && !Network.isWaitingForValidHeartbeat()) {
      Network.setMainMenuInviteReady(true);
    }
  }
  onSPoPKickPromptCheck() {
    if (Network.requireSPoPKickPrompt()) {
      this.getKickDecision();
    }
  }
  getKickDecision() {
    const kickOtherSessionCallback = () => {
      Network.kickOtherSession();
    };
    const exitCallback = () => {
      Network.spopLogout();
    };
    DialogBoxManager.createDialog_MultiOption({
      body: Locale.compose("LOC_UI_KICK_SESSION_BODY"),
      title: Locale.compose("LOC_UI_KICK_SESSION_TITTLE"),
      canClose: false,
      options: [
        {
          actions: ["accept"],
          label: Locale.compose("LOC_UI_TERMINATE_SESSION"),
          callback: kickOtherSessionCallback
        },
        {
          actions: ["cancel", "keyboard-escape"],
          label: Locale.compose("LOC_UI_SPOP_LOGOUT_GAME"),
          callback: exitCallback
        }
      ],
      dialogId: getKickDialogId
    });
  }
  // Check to see if the modding system is in an error state, and show the error.
  checkForError() {
    const lastError = Modding.getLastLoadError();
    if (lastError != null) {
      let errorTitle = "";
      let errorBody = "";
      if (lastError == LoadErrorCause.MOD_CONTENT) {
        errorTitle = "LOC_LOAD_GAME_ERROR_MOD_CONTENT";
        errorBody = Modding.getLastErrorString();
      } else if (lastError == LoadErrorCause.GAME_ABANDONED) {
        let popupReason = KickReason.KICK_NONE;
        const lastReason = Modding.getLastLoadErrorReason();
        if (lastReason) {
          popupReason = lastReason;
        }
        const abandonPopup = NetworkUtilities.multiplayerAbandonReasonToPopup(popupReason);
        errorTitle = abandonPopup.title;
        errorBody = abandonPopup.body;
      } else if (lastError == LoadErrorCause.REQUIRES_LINKED_ACCOUNT) {
        errorTitle = "LOC_LOAD_GAME_ERROR_LINKED_ACCOUNT";
      } else if (lastError == LoadErrorCause.UNKNOWN_VERSION) {
        errorTitle = "LOC_LOAD_GAME_ERROR_UNKNOWN_VERSION";
      } else if (lastError == LoadErrorCause.BAD_MAPSIZE) {
        errorTitle = "LOC_LOAD_GAME_ERROR_BAD_MAPSIZE_TITLE";
        errorBody = "LOC_LOAD_GAME_ERROR_BAD_MAPSIZE_BODY";
      } else if (lastError == LoadErrorCause.MOD_OWNERSHIP) {
        errorTitle = "LOC_LOAD_GAME_ERROR_MOD_CONFIG";
        errorBody = Locale.compose("LOC_LOAD_GAME_ERROR_MOD_OWNERSHIP");
        const ownershipErrors = Modding.getLastOwnershipCheck();
        const packageIds = [];
        if (ownershipErrors.length > 0) {
          errorBody += "[N][BLIST]";
          for (const entry of ownershipErrors) {
            if (entry.allowance == ModAllowance.None) {
              const packages = Modding.getOwnershipItemPackages(entry.type, entry.key);
              if (packages.length > 0) {
                for (const packageId of packages) {
                  if (packageIds.includes(packageId) == false) {
                    packageIds.push(packageId);
                  }
                }
              } else {
                const displayName = Modding.getOwnershipItemDisplayName(entry.type, entry.key);
                if (displayName && Locale.keyExists(displayName)) {
                  errorBody += "[LI]";
                  errorBody += Locale.compose(displayName);
                }
              }
            }
          }
          const packageNames = [];
          for (const packageId of packageIds) {
            const packageName = Modding.getOwnershipPackageDisplayName(packageId);
            if (packageName) {
              if (packageNames.includes(packageName) == false) {
                packageNames.push(packageName);
                if (Locale.keyExists(packageName)) {
                  errorBody += "[LI]";
                  errorBody += Locale.compose(packageName);
                }
              }
            }
          }
        }
      } else if (lastError == LoadErrorCause.MOD_CONFIG) {
        errorTitle = "LOC_LOAD_GAME_ERROR_MOD_CONFIG";
        errorBody = Modding.getLastErrorString();
      } else if (lastError == LoadErrorCause.SCRIPT_PROCESSING) {
        errorTitle = "LOC_LOAD_GAME_ERROR_SCRIPT_PROCESSING";
        errorBody = Modding.getLastErrorString();
      } else if (lastError == LoadErrorCause.MOD_VALIDATION) {
        errorTitle = "LOC_LOAD_GAME_ERROR_MOD_VALIDATION";
        errorBody = Modding.getLastErrorString();
      } else if (lastError == LoadErrorCause.SYNC_CONFLICT) {
        ContextManager.push("sync-conflict", {
          singleton: true,
          createMouseGuard: true,
          attributes: { "file-name": Modding.getLastErrorString() }
        });
        return;
      } else {
        errorTitle = "LOC_LOAD_GAME_ERROR_UNKNOWN";
        errorBody = lastError.toString();
      }
      DialogBoxManager.createDialog_Confirm({
        title: errorTitle,
        body: errorBody
      });
    }
  }
  checkIfModsWereReset() {
    if (Modding.checkModsResetFlag()) {
      Modding.resetModsResetFlag();
      const confirmOption = {
        actions: ["accept"],
        label: "LOC_GENERIC_OK"
      };
      const addonsCallback = () => {
        this.openExtras(true);
      };
      const addonsOption = {
        actions: ["cancel", "keyboard-escape"],
        label: "LOC_NOTIFICATION_ADDONS_RESET_OPEN_ADDONS",
        callback: addonsCallback
      };
      const options = [confirmOption, addonsOption];
      return DialogBoxManager.createDialog_MultiOption({
        body: "LOC_NOTIFICATION_ADDONS_RESET_DESCRIPTION",
        title: "LOC_NOTIFICATION_ADDONS_RESET_TITLE",
        options,
        canClose: false
      });
    }
  }
  startSection(data) {
    switch (data) {
      case "multiplayer":
        this.openMultiplayer();
        break;
      case "events":
        if (PromoCarouselModel.get().carouselItems.length > 0) {
          ContextManager.push("promo-carousel-expanded", { singleton: true, createMouseGuard: true });
        }
        this.openEvents();
        break;
      case "playNow":
        this.startGame();
        break;
      case "collection":
        this.openStore();
        break;
      case "metaprogression":
        if (Network.isMetagamingAvailable()) {
          this.showProfilePage(ProfileTabType.CHALLENGES);
        } else {
          const blockInfo = Network.getBlockedAccessInfo(DNAPermissionType.PLAY_ONLINE);
          ContextManager.push("screen-mp-account-permissions", {
            singleton: true,
            createMouseGuard: true,
            attributes: {
              "loc-key": blockInfo.locKey,
              "block-reason": blockInfo.reason
            }
          });
        }
        break;
      case "accountLink":
        if (Network.canDisplayQRCode()) {
          ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
        }
        break;
      default:
        console.error("Unknown GameSection to start:" + data);
    }
  }
  canPerformInputs() {
    if (this.movieContainer.children.length > 0) {
      this.trySkipMenuAnimations();
      return false;
    }
    if (this.inSubScreen) {
      return false;
    }
    return true;
  }
  activateMainMenu() {
    if (this.mainMenuActivated) {
      return;
    }
    this.mainMenuActivated = true;
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.MainMenu, MenuAction: TelemetryMenuActionType.Load });
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-main-menu-activated", "main-menu-audio"));
    Sound.onGameplayEvent(GameplayEvent.MainMenu);
    const focusManager = FocusManager.get();
    if (this.slot && (this.Root == focusManager.currentFocus() || focusManager.isWorldFocused())) {
      focusManager.setFocus(this.slot);
    }
    this.motdCompletedListener();
    this.showOnlineFeaturesUI();
    this.setMainMenuButtonsEnabled(true);
    this.checkDNAFatalError();
    this.tryShowDownloadAssetsDialogConfirm();
  }
  trySkipMenuAnimations() {
    this.skipToMainMenu();
  }
  tryShowDownloadAssetsDialogConfirm() {
    if (UI.isShowODRDownloadPrompt() && UI.shouldShowHighEndAssetsDownloadOption()) {
      this.showDownloadAssetsDialogConfirm();
    }
  }
  onEngineInput(inputEvent) {
    if (this.inSubScreen) {
      return;
    }
    if (this.Root.classList.contains("create")) {
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.movieContainer.children.length > 0) {
      switch (inputEvent.detail.name) {
        case "accept":
        case "mousebutton-left":
        case "touch-tap":
        case "shell-action-1":
        case "shell-action-2":
          this.trySkipMenuAnimations();
          inputEvent.preventDefault();
          inputEvent.stopImmediatePropagation();
          return;
      }
    }
    let live = true;
    switch (inputEvent.detail.name) {
      case "accept":
        this.trySkipMenuAnimations();
        live = false;
        break;
      case "mousebutton-left":
      case "touch-tap":
        if (!this.inSubScreen) {
          this.trySkipMenuAnimations();
          live = false;
        }
        break;
      case "shell-action-2":
        if (this.canPerformInputs() && Network.supportsSSO() && !Network.isWaitingForValidHeartbeat()) {
          this.onClickedAccount();
          live = false;
        }
        break;
      case "shell-action-1":
        if (PromoCarouselModel.get().carouselItems.length > 0) {
          ContextManager.push("promo-carousel-expanded", { singleton: true, createMouseGuard: true });
        }
        live = false;
        break;
      case "cancel":
      case "keyboard-escape":
      case "shell-action-5":
        if (!this.canPerformInputs()) {
          live = false;
        } else if (UI.shouldShowHighEndAssetsDownloadOption()) {
          this.showDownloadAssetsDialogConfirm();
          live = false;
        }
        break;
      case "sys-menu":
        if (!this.canPerformInputs()) {
          live = false;
        }
        break;
    }
    if (live && inputEvent.isCancelInput()) {
      if (this.movieContainer.children.length > 0) {
        this.trySkipMenuAnimations();
        live = false;
      }
    }
    if (!live) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    let live = true;
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.SHELL_PREVIOUS:
        if (this.promoCarouselSmall) {
          this.promoCarouselSmall.dispatchEvent(
            new CustomEvent("promo-carousel-small-promo-previous", { bubbles: true })
          );
          live = false;
        }
        break;
      case InputNavigationAction.SHELL_NEXT:
        if (this.promoCarouselSmall) {
          this.promoCarouselSmall.dispatchEvent(
            new CustomEvent("promo-carousel-small-promo-next", { bubbles: true })
          );
          live = false;
        }
        break;
      case InputNavigationAction.NEXT:
        if (!this.canPerformInputs()) {
          live = false;
        }
        break;
    }
    return live;
  }
  onVideoEnded() {
    this.movieContainer.innerHTML = "";
    this.skipToMainMenu();
  }
  skipToMainMenu() {
    if (this.movieContainer.childElementCount > 0) {
      this.onVideoEnded();
    }
    this.tryToHandleLegalDocs();
  }
  tryToHandleLegalDocs() {
    if (!this.bPendingSSOCheck && Network.hasProgressedPastLegalDocs() || this.forceOfflineLegalFlow) {
      this.forceOfflineLegalFlow = false;
      let legalDocsCheck = false;
      const legalDocuments = Network.getLegalDocuments(LegalDocsPlacementAcceptName);
      if (legalDocuments && legalDocuments.length > 0) {
        legalDocsCheck = Network.areAllLegalDocumentsConfirmed();
      } else {
        legalDocsCheck = true;
      }
      if (legalDocsCheck) {
        this.activateMainMenu();
        this.showOnlineFeaturesUI();
        this.lowerShroud();
      }
      if (Network.isConnectedToSSO() && Network.isConnectedToNetwork() && !Network.isAccountComplete() && legalDocsCheck) {
        const isFirstBoot = this.Root.getAttribute("data-is-first-boot");
        if (isFirstBoot == "true") {
          if (Network.canDisplayQRCode()) {
            ContextManager.push("screen-mp-link-account", { singleton: true, createMouseGuard: true });
          }
          this.Root.removeAttribute("data-is-first-boot");
        }
      }
    }
  }
  showOnlineFeaturesUI() {
    if (Online.Metaprogression.supportsMemento()) {
      this.profileHeader?.classList.remove("hidden");
    }
    if (!Network.supportsSSO()) {
      return;
    }
    this.connStatus?.classList.remove("hidden");
    this.accountStatus?.classList.remove("hidden");
    this.motdDisplay.classList.remove("hidden");
    this.profileHeader?.classList.remove("hidden");
  }
  hideOnlineFeaturesUI() {
    if (Online.Metaprogression.supportsMemento()) {
      this.profileHeader?.classList.add("hidden");
    }
    if (!Network.supportsSSO()) {
      return;
    }
    this.connStatus?.classList.add("hidden");
    this.accountStatus?.classList.add("hidden");
    this.motdDisplay.classList.add("hidden");
    this.profileHeader?.classList.add("hidden");
  }
  updateAreLegalDocsAccepted() {
    this.areLegalDocsAccepted = NetworkUtilities.areLegalDocumentsConfirmed(this.showLegalDocuments);
  }
  setMainMenuButtonsEnabled(bEnabled) {
    this.mainMenuButtons.forEach((button) => {
      button.classList.toggle("disabled", !bEnabled);
    });
  }
  initializeCampaignSetupId() {
    this.campaignSetupId = Telemetry.generateGUID();
    const gameConfig = Configuration.editGame();
    if (gameConfig) {
      gameConfig.setCampaignSetupGUID(this.campaignSetupId);
    }
  }
  startGame() {
    if (this.checkForLegalDocs()) {
      return;
    }
    if (Network.supportsSSO()) {
      Online.LiveEvent.clearLiveEventGameFlag();
    }
    const seed = Configuration.getMap().mapSeed;
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    Configuration.editMap()?.setMapSeed(seed);
    this.initializeCampaignSetupId();
    const campaignSetupData = {
      Status: CampaignSetupType.Complete,
      TimeInCampaignSetup: 0,
      CampaignSetupId: this.campaignSetupId
    };
    Telemetry.sendCampaignSetup(campaignSetupData);
    engine.call("startGame");
  }
  openCreateGame() {
    if (this.checkForLegalDocs()) {
      return;
    }
    Configuration.editGame()?.reset(GameModeTypes.SINGLEPLAYER);
    GameSetup.loadCreateGameSettings();
    ContextManager.popUntil("main-menu");
    cancelAllChainedAnimations();
    this.clear3DScene();
    this.raiseShroud();
    this.inSubScreen = true;
    this.Root.classList.add("create");
    this.Root.classList.add("hidden");
    ContextManager.push("create-game-sp", {
      singleton: true,
      createMouseGuard: true,
      attributes: { shouldDarken: false }
    });
    Network.setMainMenuInviteReady(false);
    this.onGameCreatorOpened();
  }
  showProfilePage(profileTabToFocus) {
    cancelAllChainedAnimations();
    ContextManager.push("screen-profile-page", {
      singleton: true,
      createMouseGuard: true,
      panelOptions: { onlyChallenges: false, onlyLeaderboards: false, focusTab: profileTabToFocus }
    });
  }
  onGameCreatorOpened() {
    this.initializeCampaignSetupId();
    const campaignSetupData = {
      Status: CampaignSetupType.Start,
      TimeInCampaignSetup: 0,
      CampaignSetupId: this.campaignSetupId
    };
    Telemetry.sendCampaignSetup(campaignSetupData);
    this.campaignSetupTimestamp = Date.now();
  }
  onGameCreatorClosed() {
    this.returnedToMainMenu();
    if (Network.supportsSSO()) {
      Online.LiveEvent.clearLiveEventGameFlag();
      Online.LiveEvent.clearLiveEventConfigKeys();
    }
    window.dispatchEvent(new SendCampaignSetupTelemetryEvent(CampaignSetupType.Abandon));
  }
  sendCampaignSetupTelemetry(event) {
    if (!this.campaignSetupId) return;
    const timeInCampaignSetup = (Date.now() - this.campaignSetupTimestamp) / 1e3;
    const campaignSetupData = {
      Status: event.detail.event,
      TimeInCampaignSetup: timeInCampaignSetup,
      CampaignSetupId: this.campaignSetupId,
      HumanCount: event.detail.humanCount ? event.detail.humanCount : -1,
      ParticipantCount: event.detail.participantCount ? event.detail.participantCount : -1
    };
    Telemetry.sendCampaignSetup(campaignSetupData);
    this.campaignSetupId = null;
  }
  openEvents() {
    ContextManager.popUntil("main-menu");
    cancelAllChainedAnimations();
    window.addEventListener(EventsScreenGoSinglePlayerEventName, this.eventsGoSinglePlayerListener);
    window.addEventListener(EventsScreenGoMultiPlayerEventName, this.eventsGoMultiPlayerListener);
    window.addEventListener(EventsScreenLoadEventName, this.eventsGoLoadListener);
    window.addEventListener(EventsScreenContinueEventName, this.eventsGoContinueListener);
    this.slot.classList.add("hidden");
    this.clear3DScene();
    ContextManager.push("screen-events", { singleton: true, createMouseGuard: true });
  }
  clearEventsListeners() {
    window.removeEventListener(EventsScreenGoSinglePlayerEventName, this.eventsGoSinglePlayerListener);
    window.removeEventListener(EventsScreenGoMultiPlayerEventName, this.eventsGoMultiPlayerListener);
    window.removeEventListener(EventsScreenLoadEventName, this.eventsGoLoadListener);
    window.removeEventListener(EventsScreenContinueEventName, this.eventsGoContinueListener);
  }
  onEventsGoSP() {
    this.clearEventsListeners();
    if (ContextManager.getCurrentTarget() == this.Root) {
      FocusManager.get().setFocus(this.slot);
    }
    this.openCreateGame();
  }
  onEventsGoLoad() {
    this.clearEventsListeners();
    if (ContextManager.getCurrentTarget() == this.Root) {
      FocusManager.get().setFocus(this.slot);
    }
    this.openLoadGame(true);
  }
  onEventsGoContinue() {
    this.clearEventsListeners();
    if (ContextManager.getCurrentTarget() == this.Root) {
      FocusManager.get().setFocus(this.slot);
    }
    this.goContinue();
  }
  onEventsGoMP() {
    this.returnedToMainMenu();
    if (ContextManager.getCurrentTarget() == this.Root) {
      FocusManager.get().setFocus(this.slot);
    }
    this.openMultiplayer();
  }
  openExtras(openModsContent) {
    ContextManager.popUntil("main-menu");
    cancelAllChainedAnimations();
    if (openModsContent === true) {
      ContextManager.push("screen-extras", {
        singleton: true,
        createMouseGuard: true,
        attributes: { "open-additional-content": "true" }
      });
    } else {
      ContextManager.push("screen-extras", { singleton: true, createMouseGuard: true });
    }
  }
  openStore() {
    const isUserInput = true;
    const result = Network.triggerNetworkCheck(isUserInput);
    if (result.wasErrorDisplayedOnFirstParty) {
      return;
    }
    if (result.networkResult == NetworkResult.NETWORKRESULT_NO_NETWORK) {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_CONNECTION_FAILED"),
        title: Locale.compose("LOC_UI_OFFLINE_ACCOUNT_TITLE")
      });
      return;
    }
    ContextManager.popUntil("main-menu");
    cancelAllChainedAnimations();
    ContextManager.push("screen-store-launcher", { singleton: true, createMouseGuard: true });
  }
  onLegalDocsAccepted = (event) => {
    this.areLegalDocsAccepted = event.detail.accepted;
    if (this.areLegalDocsAccepted && this.firstLaunchTutorialPending) {
      this.firstLaunchTutorialPending = false;
      this.openCreateGame();
    }
  };
  onNewCampaignStart() {
    const timeInCampaignSetup = (Date.now() - this.campaignSetupTimestamp) / 1e3;
    const campaignSetupData = {
      Status: CampaignSetupType.Complete,
      TimeInCampaignSetup: timeInCampaignSetup,
      CampaignSetupId: this.campaignSetupId
    };
    Telemetry.sendCampaignSetup(campaignSetupData);
  }
  openOptions() {
    if (this.checkForLegalDocs()) {
      return;
    }
    cancelAllChainedAnimations();
    ContextManager.push("screen-options", { singleton: true, createMouseGuard: true });
  }
  checkForLegalDocs() {
    if (this.areLegalDocsAccepted) {
      return false;
    }
    this.updateAreLegalDocsAccepted();
    return !this.areLegalDocsAccepted;
  }
  isSmallScreen() {
    return window.innerHeight < Layout.pixelsToScreenPixels(1080);
  }
  build3DScene() {
    if (this.leaderModelSetup) {
      return;
    }
    this.clear3DScene();
    if (this.isSmallScreen()) {
      Camera.pushCamera(
        MainMenu.VO_SMALL_SCREEN_CAMERA_POSITION,
        {
          x: MainMenu.VO_SMALL_SCREEN_CAMERA_TARGET.x,
          y: MainMenu.VO_SMALL_SCREEN_CAMERA_TARGET.y,
          z: MainMenu.VO_SMALL_SCREEN_CAMERA_TARGET.z
        },
        { fovy: 43 }
      );
    } else {
      Camera.pushCamera(MainMenu.VO_CAMERA_POSITION, {
        x: MainMenu.VO_CAMERA_TARGET.x,
        y: MainMenu.VO_CAMERA_TARGET.y,
        z: MainMenu.VO_CAMERA_TARGET.z
      });
    }
    const leaderData = getLeaderData().filter((l) => l.isOwned);
    const civData = GetCivilizationData().filter((l) => l.isOwned);
    this.MainMenuSceneModels = WorldUI.createModelGroup("MainMenuScene");
    let assetName = "";
    let backgroundName = "";
    if (this.continueSave) {
      const lastLeader = this.continueSave.hostLeader;
      assetName = lastLeader + "_GAME_ASSET";
      const lastCiv = this.continueSave.hostCivilization;
      backgroundName = `bg-panel-${lastCiv.replace("CIVILIZATION_", "").toLowerCase()}`;
    }
    let leader = this.MainMenuSceneModels.addModelAtPos(
      assetName,
      { x: 0, y: 0, z: 0 },
      {
        angle: 0,
        foreground: true,
        initialState: "IDLE_CharSelect",
        triggerCallbacks: true,
        seed: UI.randomInt(0, 1e3)
      }
    );
    this.MainMenuSceneModels.addModelAtPos(
      "LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET",
      { x: 0, y: 0, z: 0 },
      { angle: 0, foreground: true }
    );
    const maxAttempts = 3;
    for (let attemptsLeft = maxAttempts; attemptsLeft >= 0; attemptsLeft--) {
      if (leader) break;
      let leaderIndex = leaderData.length > 0 ? UI.randomInt(0, leaderData.length - 1) : -1;
      if (leaderIndex != -1) {
        if (!leaderData[leaderIndex].isLocked && leaderData[leaderIndex].isOwned) {
          assetName = leaderData[leaderIndex].leaderID + "_GAME_ASSET";
        } else if (attemptsLeft > 0) {
          leaderIndex = -1;
          continue;
        }
      } else {
        if (attemptsLeft > 0) {
          continue;
        }
      }
      leader = this.MainMenuSceneModels.addModelAtPos(
        assetName,
        { x: 0, y: 0, z: 0 },
        {
          angle: 0,
          foreground: true,
          initialState: "IDLE_CharSelect",
          triggerCallbacks: true,
          seed: UI.randomInt(0, 1e3)
        }
      );
      if (leader) {
        break;
      }
    }
    if (!leader) {
      assetName = "LEADER_FALLBACK_MAIN_MENU";
      leader = this.MainMenuSceneModels.addModelAtPos(
        assetName,
        { x: 0, y: 0, z: 0 },
        {
          angle: 0,
          foreground: true,
          initialState: "IDLE_CharSelect",
          triggerCallbacks: true,
          seed: UI.randomInt(0, 1e3)
        }
      );
    }
    if (backgroundName == "") {
      const civIndex = civData.length > 0 ? UI.randomInt(0, civData.length - 1) : -1;
      if (civIndex != -1)
        backgroundName = `bg-panel-${civData[civIndex].civID.replace("CIVILIZATION_", "").toLowerCase()}`;
    }
    if (backgroundName == "") {
      backgroundName = "bg-panel-abbasid";
    }
    this.leaderModelSetup = true;
  }
  clear3DScene() {
    if (this.MainMenuSceneModels) {
      this.MainMenuSceneModels.destroy();
      this.MainMenuSceneModels = null;
      WorldUI.clearBackground();
      Camera.popCamera();
      this.leaderModelSetup = false;
    }
  }
  preload3DSceneAssets() {
    WorldUI.loadAsset("LEADER_RANDOMIZED_GAME_ASSET");
    WorldUI.loadAsset("CIVILIZATION_RANDOM_BANNER_GAME_ASSET");
    WorldUI.loadAsset("LEADER_LIGHTING_SCENE_CHAR_SELECT_GAME_ASSET");
    WorldUI.loadAsset("LEADER_SELECTION_PEDESTAL");
  }
  queue3DSceneAssetPreloads() {
    const leaderAssetNames = getLeaderData().map((leader) => leader.leaderID + "_GAME_ASSET");
    const civBannerAssetNames = GetCivilizationData().map(
      (civilization) => civilization.civID + "_BANNER_GAME_ASSET"
    );
    this.preloadAssetNames = Array.from(/* @__PURE__ */ new Set([...leaderAssetNames, ...civBannerAssetNames]));
    this.currentPreloadingAsset = null;
    this.hasPreloadingBegun = false;
    this.preloadAssetIndex = 0;
    this.beginPreloadingForNextAsset(null);
  }
  beginPreloadingForNextAsset(assetToWaitFor) {
    if (this.preloadAssetIndex >= this.preloadAssetNames.length) {
      this.preloadAssetIndex = -1;
      this.hasPreloadingBegun = true;
      return;
    }
    this.hasPreloadingBegun = false;
    this.currentPreloadingAsset = assetToWaitFor;
    window.requestAnimationFrame(() => {
      this.onUpdate();
    });
  }
  preloadQueued3DSceneAsset(index) {
    if (index >= this.preloadAssetNames.length || index < 0) {
      this.preloadAssetIndex = -1;
      this.hasPreloadingBegun = true;
      return;
    }
    const assetName = this.preloadAssetNames[index];
    this.beginPreloadingForNextAsset(WorldUI.loadAsset(assetName));
    this.preloadAssetIndex += 1;
    return;
  }
  onUpdate() {
    if (!this.hasPreloadingBegun) {
      if (this.currentPreloadingAsset == null || WorldUI.isAssetLoaded(this.currentPreloadingAsset)) {
        this.preloadQueued3DSceneAsset(this.preloadAssetIndex);
      } else {
        window.requestAnimationFrame(() => {
          this.onUpdate();
        });
      }
    }
  }
  get isShrouded() {
    return this.slot.classList.contains("hidden");
  }
  // blank out main menu
  raiseShroud() {
    console.log("raiseShroud");
    this.slot.classList.add("hidden");
    this.buildInfo.classList.add("hidden");
    this.promoCarouselSmall?.setAttribute("visible", "false");
    this.hideOnlineFeaturesUI();
    this.clear3DScene();
  }
  // show main menu
  lowerShroud() {
    console.log("lowerShroud");
    this.promoCarouselSmall?.setAttribute("visible", "true");
    this.slot.classList.remove("hidden");
    this.shroud.style.display = "none";
  }
  exitToDesktop() {
    engine.call("exitToDesktop");
  }
  onLaunchToHostMPGame() {
    this.trySkipMenuAnimations();
    if (this.checkForLegalDocs()) {
      return;
    }
    const skipToGameCreator = true;
    MultiplayerShellManager.onGameBrowse(ServerType.SERVER_TYPE_INTERNET, skipToGameCreator);
  }
  isFullAccountLinkedAndConnected() {
    return Network.isConnectedToNetwork() && Network.isLoggedIn() && Network.isFullAccountLinked();
  }
  // Activate On-Demand Resource
  onOdrButtonActivate() {
    if (this.odrDownloadDialogBoxId != -1) {
      return;
    }
    this.showDownloadAssetsDialogConfirm();
  }
  showDownloadAssetsDialogConfirm() {
    this.odrDownloadDialogBoxId = DialogBoxManager.createDialog_MultiOption({
      body: "LOC_UI_HIGH_END_DOWNLOAD_BODY",
      title: "LOC_UI_HIGH_END_DOWNLOAD_TITLE",
      canClose: false,
      options: [
        {
          actions: ["cancel", "keyboard-escape"],
          label: "LOC_GENERIC_CANCEL",
          callback: () => {
            UI.setShowODRDownloadPrompt(0);
            this.odrDownloadDialogBoxId = -1;
          }
        },
        {
          actions: ["accept"],
          label: "LOC_GENERIC_CONFIRM",
          callback: (eAction) => {
            if (eAction == DialogBoxAction.Confirm) {
              UI.startHighEndAssetsDownload();
              this.odrDownloadDialogBoxId = -1;
              ContextManager.push("odr-download", { singleton: true });
            }
          }
        }
      ]
    });
  }
}
Loading.runWhenFinished(() => {
  Automation.start();
});
Controls.define("main-menu", {
  createInstance: MainMenu,
  description: "Main Menu",
  classNames: ["relative", "w-full", "h-full"],
  attributes: [
    {
      name: "data-is-first-boot",
      description: "Whether or not this is the first boot."
    },
    {
      name: "data-launch-to-host-MP-game",
      description: "Whether to launch the host MP flow."
    }
  ],
  styles: [styles],
  tabIndex: -1
});

export { isLiveEventGame };
//# sourceMappingURL=main-menu.js.map
