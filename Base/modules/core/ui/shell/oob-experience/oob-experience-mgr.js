import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import { F as FxsSlider } from '../../components/fxs-slider.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { DisplayQueueManager } from '../../context-manager/display-queue-manager.js';
import { a as DialogBoxManager, c as DialogSource, D as DialogBoxAction } from '../../dialog-box/manager-dialog-box.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { b as InputEngineEventName } from '../../input/input-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { CreateGameModel } from '../create-panels/create-game-model.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../utilities/utilities-layout.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/action-handler.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../events/shell-events.chunk.js';
import '../../profile-page/screen-profile-page.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../save-load/model-save-load.chunk.js';
import '../leader-select/leader-button/leader-button.js';
import '../../utilities/utilities-liveops.js';
import '../../utilities/utilities-metaprogression.chunk.js';

const content = "<fxs-vslot>\r\n\t<div class=\"oobe-container relative w-full\">\r\n\t\t<div class=\"oobe-display-container hidden self-center mt-8\">\r\n\t\t\t<fxs-vslot class=\"oobe-press-start-vslot\">\r\n\t\t\t\t<div class=\"oobe-logo-container self-center\">\r\n\t\t\t\t\t<div class=\"oobe-logo-img\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"font-body text-2xl text-white self-center mb-4\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_OOBE_TITLE_DISPLAY\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<fxs-vslot class=\"oobe-display-controls self-center\"></fxs-vslot>\r\n\t\t\t</fxs-vslot>\r\n\t\t</div>\r\n\r\n\t\t<div class=\"oobe-audio-container hidden self-center mt-8\">\r\n\t\t\t<fxs-vslot class=\"oobe-press-start-vslot\">\r\n\t\t\t\t<div class=\"oobe-logo-container self-center\">\r\n\t\t\t\t\t<div class=\"oobe-logo-img\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"font-body text-2xl text-white self-center mb-4\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_OOBE_TITLE_AUDIO\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<fxs-vslot class=\"oobe-audio-controls\"></fxs-vslot>\r\n\t\t\t</fxs-vslot>\r\n\t\t</div>\r\n\r\n\t\t<div\r\n\t\t\tclass=\"oobe-legal-container self-center mt-12 hidden\"\r\n\t\t\tstyle=\"width: 90%\"\r\n\t\t>\r\n\t\t\t<fxs-vslot>\r\n\t\t\t\t<div class=\"oobe-logo-container self-center\">\r\n\t\t\t\t\t<div class=\"oobe-logo-img\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"oobe-legal-text flex text-accent-2 self-center font-body text-xl\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_COPYRIGHT_BLOCK\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"oobe-legal-logos\">\r\n\t\t\t\t\t<fxs-hslot class=\"oobe-legal-logo-hslot self-center mt-12\">\r\n\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\tsrc=\"blp:intel_319x319.png\"\r\n\t\t\t\t\t\t\tclass=\"oob-intel-logo hidden mr-10\"\r\n\t\t\t\t\t\t\tstyle=\"width: 160px; height: 160px\"\r\n\t\t\t\t\t\t/>\r\n\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\tsrc=\"blp:powered_by_wwise.png\"\r\n\t\t\t\t\t\t\tclass=\"max-w-40 max-h-32 mr-10\"\r\n\t\t\t\t\t\t/>\r\n\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\tsrc=\"blp:coherent-gt-white.png\"\r\n\t\t\t\t\t\t\tclass=\"max-w-96 max-h-64 mr-10\"\r\n\t\t\t\t\t\t/>\r\n\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\tsrc=\"blp:oodle_logo.png\"\r\n\t\t\t\t\t\t\tclass=\"max-w-96 max-h-40 mr-10\"\r\n\t\t\t\t\t\t/>\r\n\t\t\t\t\t</fxs-hslot>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-vslot>\r\n\t\t</div>\r\n\r\n\t\t<div class=\"oobe-autosave-container flex flex-row items-center justify-center hidden self-center mt-8\">\r\n\t\t\t<fxs-vslot>\r\n\t\t\t\t<div class=\"oobe-logo-container self-center\">\r\n\t\t\t\t\t<div class=\"oobe-logo-img\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flex flex-col items-center\">\r\n\t\t\t\t\t<div class=\"oobe-autosave-container__content-item\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"font-title text-2xl text-secondary oobe-no-pad-margin\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_SAVE_LOAD_SAVEACTION_AUTO\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"oobe-autosave-container__content-item\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"font-body text-white text-center text-xl oobe-no-pad-margin\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_OOBE_TITLE_AUTOSAVE\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"oobe-autosave-container__content-item\">\r\n\t\t\t\t\t\t<div class=\"oobe-background-container oobe-autosave-container__save-icon\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-vslot>\r\n\t\t</div>\r\n\r\n\t\t<div class=\"intro-movie-container absolute fullscreen-outside-safezone hidden\"></div>\r\n\t</div>\r\n\r\n\t<div class=\"oobe-button-bar flex flex-row justify-center mt-8 hidden\">\r\n\t\t<div class=\"oobe-prev-container\">\r\n\t\t\t<fxs-button\r\n\t\t\t\tclass=\"oobe-prev-subscreen mr-24\"\r\n\t\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t\t></fxs-button>\r\n\t\t</div>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"oobe-next-subscreen\"\r\n\t\t\tcaption=\"LOC_GENERIC_CONTINUE\"\r\n\t\t\tdata-bind-class-toggle=\"hidden:{{g_NavTray.isTrayRequired}}\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-vslot>\r\n";

const styles = "fs://game/core/ui/shell/oob-experience/oob-experience-mgr.css";

const audioDynamicRanges = [
  { label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_WIDE", tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_WIDE_DESCRIPTION" },
  {
    label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_STANDARD",
    tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_STANDARD_DESCRIPTION"
  },
  { label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_NARROW", tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_NARROW_DESCRIPTION" }
];
const a11yItemList = [
  { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_NONE" },
  { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_PROTANOPIA" },
  { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_DEUTERANOPIA" },
  { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_TRITANOPIA" }
];
var SubScreens = /* @__PURE__ */ ((SubScreens2) => {
  SubScreens2[SubScreens2["SUB_SCREEN_LIST_START"] = 0] = "SUB_SCREEN_LIST_START";
  SubScreens2[SubScreens2["SUB_SCREEN_DISPLAY_SETTINGS"] = 0 /* SUB_SCREEN_LIST_START */] = "SUB_SCREEN_DISPLAY_SETTINGS";
  SubScreens2[SubScreens2["SUB_SCREEN_AUDIO_SETTINGS"] = 1] = "SUB_SCREEN_AUDIO_SETTINGS";
  SubScreens2[SubScreens2["SUB_SCREEN_AUTOSAVE"] = 2] = "SUB_SCREEN_AUTOSAVE";
  SubScreens2[SubScreens2["SUB_SCREEN_MOVIES"] = 3] = "SUB_SCREEN_MOVIES";
  SubScreens2[SubScreens2["SUB_SCREEN_LIST_END"] = 3 /* SUB_SCREEN_MOVIES */] = "SUB_SCREEN_LIST_END";
  return SubScreens2;
})(SubScreens || {});
const subscreenList = [".oobe-display-container", ".oobe-audio-container", ".oobe-autosave-container"];
var LogoTrainMovies = /* @__PURE__ */ ((LogoTrainMovies2) => {
  LogoTrainMovies2[LogoTrainMovies2["LOGO_TRAIN_START"] = 0] = "LOGO_TRAIN_START";
  LogoTrainMovies2[LogoTrainMovies2["LOGO_TRAIN_INTEL"] = 1] = "LOGO_TRAIN_INTEL";
  LogoTrainMovies2[LogoTrainMovies2["LOGO_TRAIN_2K_FIRAXIS"] = 2] = "LOGO_TRAIN_2K_FIRAXIS";
  LogoTrainMovies2[LogoTrainMovies2["LOGO_TRAIN_MAIN_INTRO"] = 3] = "LOGO_TRAIN_MAIN_INTRO";
  LogoTrainMovies2[LogoTrainMovies2["LOGO_TRAIN_END"] = 4] = "LOGO_TRAIN_END";
  return LogoTrainMovies2;
})(LogoTrainMovies || {});
class OutOfBoxExperienceManager extends Component {
  engineInputListener = this.onEngineInput.bind(this);
  subScreenInputListener = this.onSubScreenInput.bind(this);
  logoTrainEngineInputListener = this.onEngineInputLogoTrain.bind(this);
  logoTrainVideoEndedListener = this.doNextLogo.bind(this);
  legalTimeoutListener = this.onLegalTimeout.bind(this);
  goToMainMenuListener = this.goToMainMenu.bind(this);
  onLaunchHostMPGameListener = this.onLaunchToHostMPGame.bind(this);
  logoTrainMovie = 0 /* LOGO_TRAIN_START */;
  legalContainer = null;
  isFirstBoot = false;
  isSessionStartup = false;
  isLaunchToHostMP = false;
  currentDocumentId = "";
  currentFocus = this.Root;
  subscreenIndex = -1;
  // illegal value to make the nav tray update not show anything on the initial splash
  installedInputHandler = false;
  pendingSSODialogBoxID = -1;
  notWaitingLegalTimeout = false;
  displayContainer = MustGetElement(".oobe-display-container", this.Root);
  gfxQuality = document.createElement("fxs-dropdown");
  accessibility = document.createElement("fxs-dropdown");
  origSetting = -1;
  ddProfileItems = [];
  hasGraphicsOptions = false;
  isUIReloading = false;
  audioContainer = MustGetElement(".oobe-audio-container", this.Root);
  dynRange = document.createElement("fxs-dropdown");
  subTitles = document.createElement("fxs-checkbox");
  onLaunchToHostMPGame() {
    this.isLaunchToHostMP = true;
    this.goToMainMenu();
  }
  onAttach() {
    super.onAttach();
    engine.on("LaunchToHostMPGame", this.onLaunchHostMPGameListener);
    this.isFirstBoot = UI.isFirstBoot();
    CreateGameModel.isFirstTimeCreateGame = this.isFirstBoot;
    if (this.isFirstBoot) {
      engine.on("FetchedOnlineLegalDocsComplete", this.doPendingLegalDocs, this);
    }
    //! Careful with use of `UI.isSessionStartup()` as it will only return true *once*.
    this.isSessionStartup = UI.isSessionStartup();
    const intelLogo = MustGetElement(".oob-intel-logo", this.Root);
    if (UI.isHostAPC()) {
      intelLogo.classList.remove("hidden");
    }
    this.legalContainer = MustGetElement(".oobe-legal-container", this.Root);
    Input.setActiveContext(InputContext.Shell);
    ContextManager.pushElement(this.Root);
    UI.panelStart("first-boot", "", UIViewChangeMethod.Unknown, true);
    DialogBoxManager.setSource(DialogSource.Shell);
    this.setupDisplaySettings();
    this.setupAudioSettings();
    const prevButton = MustGetElement(".oobe-prev-subscreen", this.Root);
    prevButton.addEventListener("action-activate", this.previousSubScreen.bind(this));
    const nextButton = MustGetElement(".oobe-next-subscreen", this.Root);
    nextButton.addEventListener("action-activate", this.nextSubScreen.bind(this));
    document.body.classList.add("visible");
    document.body.style.opacity = "1";
    if (UI.getOOBEGraphicsRestart()) {
      console.assert(this.isUIReloading == false);
      if (this.subscreenIndex < 0 /* SUB_SCREEN_LIST_START */) {
        this.subscreenIndex = 0 /* SUB_SCREEN_DISPLAY_SETTINGS */;
      }
      this.nextSubScreen();
    } else {
      if (UI.isShowIntroSequences() && this.isSessionStartup && !Automation.isActive) {
        if (this.legalContainer) {
          this.legalContainer.classList.remove("hidden");
          setTimeout(this.legalTimeoutListener, 2e3);
        }
      } else {
        setTimeout(this.goToMainMenuListener, 100);
      }
    }
  }
  onDetach() {
    super.onDetach();
    engine.off("LaunchToHostMPGame");
    if (this.isFirstBoot) {
      engine.off("FetchedOnlineLegalDocsComplete", this.doPendingLegalDocs, this);
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.updateNavTray();
    FocusManager.setFocus(this.currentFocus);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  updateNavTray() {
    NavTray.clear();
    switch (this.subscreenIndex) {
      case 2 /* SUB_SCREEN_AUTOSAVE */:
        NavTray.addOrUpdateCancel("LOC_GENERIC_BACK");
        NavTray.addOrUpdateGenericAccept();
        break;
      case 0 /* SUB_SCREEN_DISPLAY_SETTINGS */:
        NavTray.addOrUpdateShellAction1("LOC_GENERIC_CONTINUE");
        break;
      case 1 /* SUB_SCREEN_AUDIO_SETTINGS */:
        NavTray.addOrUpdateCancel("LOC_GENERIC_BACK");
        NavTray.addOrUpdateShellAction1("LOC_GENERIC_CONTINUE");
        break;
      // no nav tray for movies
      case 3 /* SUB_SCREEN_MOVIES */:
        break;
    }
  }
  onLegalTimeout() {
    this.notWaitingLegalTimeout = true;
    if (this.legalContainer) {
      this.legalContainer.classList.add("hidden");
      this.realiseInitialScreen();
    }
  }
  realiseInitialScreen() {
    if (this.isFirstBoot) {
      if (!UI.shouldDisplayOOBLegal()) {
        this.subscreenIndex = 0 /* SUB_SCREEN_DISPLAY_SETTINGS */;
      } else {
        const buttonBar = MustGetElement(".oobe-button-bar", this.Root);
        buttonBar.classList.remove("hidden");
        this.subscreenIndex = 0 /* SUB_SCREEN_LIST_START */;
      }
      this.launchSubScreen();
    } else {
      this.logoTrainMovie = 0 /* LOGO_TRAIN_START */;
      this.doLogoTrain();
    }
  }
  onEngineInputLogoTrain(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "accept" || inputEvent.detail.name == "shell-action-1" || inputEvent.detail.name == "shell-action-2" || inputEvent.detail.name == "sys-menu" || inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "cancel") {
      this.doNextLogo();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  doLogoTrain() {
    const movieContainer = MustGetElement(".intro-movie-container", this.Root);
    const oobeContainer = MustGetElement(".oobe-container", this.Root);
    oobeContainer.classList.add("h-full");
    while (movieContainer.childNodes.length > 0) {
      movieContainer.removeChild(movieContainer.childNodes[0]);
    }
    if (this.logoTrainMovie == 0 /* LOGO_TRAIN_START */) {
      if (UI.isHostAPC()) {
        this.logoTrainMovie = 1 /* LOGO_TRAIN_INTEL */;
      } else {
        this.logoTrainMovie = 2 /* LOGO_TRAIN_2K_FIRAXIS */;
      }
      this.Root.addEventListener(InputEngineEventName, this.logoTrainEngineInputListener);
    }
    let movieId = "";
    const results = Database.query("config", "SELECT MainMenuTransition FROM Logos ORDER BY Priority DESC LIMIT 1");
    if (results && results.length > 0) {
      const transitionId = results[0].MainMenuTransition;
      if (typeof transitionId == "string") {
        movieId = transitionId;
      }
    }
    if (movieId && !Automation.isActive) {
      const movie = document.createElement("fxs-movie");
      movie.classList.add("absolute", "inset-0");
      if (UI.getViewExperience() == UIViewExperience.Mobile && Layout.isCompact()) {
        movie.setAttribute("data-movie-fit-mode", "cover");
      }
      switch (this.logoTrainMovie) {
        case 1 /* LOGO_TRAIN_INTEL */:
          movie.setAttribute("data-movie-id", "MOVIE_BASE_INTELARC");
          break;
        case 2 /* LOGO_TRAIN_2K_FIRAXIS */:
          movie.setAttribute("data-movie-id", "MOVIE_BASE_LOGOTRAIN");
          break;
        case 3 /* LOGO_TRAIN_MAIN_INTRO */:
          movie.setAttribute("data-movie-id", "MOVIE_BASE_INTRO");
          break;
      }
      movie.addEventListener("movie-ended", this.logoTrainVideoEndedListener);
      movieContainer.appendChild(movie);
      movieContainer.classList.remove("hidden");
    } else {
      this.goToMainMenu();
    }
  }
  doNextLogo() {
    this.logoTrainMovie++;
    if (this.logoTrainMovie >= 4 /* LOGO_TRAIN_END */) {
      this.Root.removeEventListener(InputEngineEventName, this.logoTrainEngineInputListener);
      this.goToMainMenu();
      if (UI.shouldDisableIntroAfterFirstPlay()) {
        UI.SetShowIntroSequences(0);
      }
    } else {
      this.doLogoTrain();
    }
  }
  handleOfflineLegalFlow() {
    const retryCallback = () => {
      this.doPendingLegalDocs();
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
  doPendingLegalDocs() {
    if (this.notWaitingLegalTimeout) {
      if (Network.hasProgressedPastLegalDocs()) {
        if (this.pendingSSODialogBoxID != -1) {
          DisplayQueueManager.closeMatching(this.pendingSSODialogBoxID);
          this.pendingSSODialogBoxID = -1;
        }
        this.subscreenIndex = 0 /* SUB_SCREEN_LIST_START */;
        this.launchSubScreen();
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
  }
  onSubScreenInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
        this.previousSubScreen();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        Audio.playSound("data-audio-primary-button-press");
        break;
      case "shell-action-1":
        if (this.subscreenIndex != 2 /* SUB_SCREEN_AUTOSAVE */) {
          this.nextSubScreen();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
          Audio.playSound("data-audio-primary-button-press");
        }
        break;
      case "accept":
        if (this.subscreenIndex == 2 /* SUB_SCREEN_AUTOSAVE */) {
          this.nextSubScreen();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
          Audio.playSound("data-audio-primary-button-press");
        }
        break;
    }
  }
  setupDisplaySettings() {
    const displayControls = MustGetElement(".oobe-display-controls", this.displayContainer);
    const supportedOptions = GraphicsOptions.getSupportedOptions();
    this.hasGraphicsOptions = supportedOptions.profiles.length > 1;
    while (displayControls.children.length > 0) {
      displayControls.removeChild(displayControls.children[0]);
    }
    if (this.hasGraphicsOptions) {
      for (let i = 0; i < supportedOptions.profiles.length; i++) {
        const profile2 = supportedOptions.profiles[i];
        const name = UI.getGraphicsProfile(profile2);
        const label = "LOC_OPTIONS_GFX_PROFILE_" + name.toUpperCase();
        this.ddProfileItems.push({ label, name, profile: profile2 });
      }
    }
    this.gfxQuality.setAttribute("dropdown-items", JSON.stringify(this.ddProfileItems));
    this.gfxQuality.classList.add("gfx-quality", "h-10", "max-w-0");
    this.gfxQuality.setAttribute("data-tooltip-content", "LOC_OPTIONS_GFX_PROFILE_DESCRIPTION");
    this.gfxQuality.setAttribute("data-tooltip-anchor", "left");
    const profile = UI.getCurrentGraphicsProfile();
    for (let i = 0; i < this.ddProfileItems.length; i++) {
      if (this.ddProfileItems[i].name == profile) {
        this.gfxQuality.setAttribute("selected-item-index", i.toString());
        this.origSetting = i;
        break;
      }
    }
    if (this.origSetting == -1) {
      this.gfxQuality.setAttribute("selected-item-index", "0");
    }
    if (this.hasGraphicsOptions) {
      const qualityContainer = document.createElement("div");
      qualityContainer.classList.add("flex", "flex-row", "justify-between", "items-end", "mb-4");
      const qualityTitle = document.createElement("div");
      qualityTitle.classList.add("font-body", "text-xl", "text-white");
      qualityTitle.innerHTML = Locale.compose("LOC_OPTIONS_GFX_PROFILE");
      qualityContainer.appendChild(qualityTitle);
      qualityContainer.appendChild(this.gfxQuality);
      displayControls.appendChild(qualityContainer);
    }
    const accessibilityContainer = document.createElement("div");
    accessibilityContainer.classList.add("flex", "flex-row", "justify-between", "items-end", "mb-4");
    const accessTitle = document.createElement("div");
    accessTitle.classList.add("font-body", "text-xl", "text-white");
    accessTitle.innerHTML = Locale.compose("LOC_OPTIONS_ACCESSIBILITY_COLORBLIND");
    accessibilityContainer.appendChild(accessTitle);
    this.accessibility.setAttribute("dropdown-items", JSON.stringify(a11yItemList));
    this.accessibility.setAttribute("data-tooltip-content", "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_DESCRIPTION");
    this.accessibility.setAttribute("data-tooltip-anchor", "left");
    this.accessibility.classList.add("gfx-accessibility", "h-10", "max-w-0");
    this.accessibility.setAttribute("selected-item-index", Configuration.getUser().colorblindAdaptation.toString());
    accessibilityContainer.appendChild(this.accessibility);
    displayControls.appendChild(accessibilityContainer);
  }
  doDisplaySettings() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (this.hasGraphicsOptions) {
          this.currentFocus = this.gfxQuality;
        } else {
          this.currentFocus = this.accessibility;
        }
        if (DialogBoxManager.isDialogBoxOpen) {
          return;
        }
        FocusManager.setFocus(this.currentFocus);
        FocusManager.setFocus(this.currentFocus);
      });
    });
  }
  displayContinue() {
    const profSelection = this.gfxQuality.getAttribute("selected-item-index");
    const accessibiltySelection = this.accessibility.getAttribute("selected-item-index");
    if ((profSelection || !this.hasGraphicsOptions) && accessibiltySelection) {
      const accessibilityNumber = parseInt(accessibiltySelection);
      Configuration.getUser().setColorblindAdaptation(accessibilityNumber);
      if (this.hasGraphicsOptions && profSelection) {
        const profSelNumber = parseInt(profSelection);
        if (this.origSetting != profSelNumber) {
          UI.setOOBEGraphicsRestart();
          let graphicsOptions = GraphicsOptions.getCurrentOptions();
          graphicsOptions.profile = this.ddProfileItems[profSelNumber].profile;
          graphicsOptions = GraphicsOptions.fillAdvancedOptions(graphicsOptions);
          GraphicsOptions.applyOptions(graphicsOptions);
          UI.reloadUI();
          this.isUIReloading = true;
        }
      }
      UI.commitApplicationOptions();
    }
  }
  setupAudioSettings() {
    const audioControls = MustGetElement(".oobe-audio-controls", this.audioContainer);
    const dynRangeContainer = document.createElement("div");
    dynRangeContainer.classList.add("flex", "flex-row", "justify-between", "items-end", "mb-4");
    const dynRangeTitle = document.createElement("div");
    dynRangeTitle.classList.add("font-body", "text-xl", "text-white");
    dynRangeTitle.innerHTML = Locale.compose("LOC_OPTIONS_AUDIO_DYNAMIC_RANGE");
    dynRangeContainer.appendChild(dynRangeTitle);
    this.dynRange.setAttribute("dropdown-items", JSON.stringify(audioDynamicRanges));
    this.dynRange.setAttribute("selected-item-index", Sound.getDynamicRangeOption().toString());
    this.dynRange.classList.add("h-10", "max-w-0");
    this.dynRange.setAttribute("data-tooltip-content", "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_DESCRIPTION");
    this.dynRange.setAttribute("data-tooltip-anchor", "left");
    dynRangeContainer.appendChild(this.dynRange);
    audioControls.appendChild(dynRangeContainer);
    const masterVolumeContainer = document.createElement("div");
    masterVolumeContainer.classList.add("flex", "flex-row", "justify-between", "items-end", "mb-4");
    const mVolTitle = document.createElement("div");
    mVolTitle.classList.add("font-body", "text-xl", "text-white");
    mVolTitle.innerHTML = Locale.compose("LOC_OPTIONS_AUDIO_VOLUME_MASTER");
    masterVolumeContainer.appendChild(mVolTitle);
    const masterVolume = document.createElement("fxs-slider");
    masterVolume.setAttribute("value", `${Sound.volumeGetMaster() * 100}`);
    masterVolume.setAttribute("min", `0`);
    masterVolume.setAttribute("max", `100`);
    masterVolume.setAttribute("steps", `20`);
    masterVolume.setAttribute("data-tooltip-content", "LOC_OPTIONS_AUDIO_VOLUME_MASTER_DESCRIPTION");
    masterVolume.setAttribute("data-tooltip-anchor", "left");
    audioControls.appendChild(masterVolume);
    masterVolumeContainer.appendChild(masterVolume);
    audioControls.appendChild(masterVolumeContainer);
    masterVolume.initialize();
    if (masterVolume.component instanceof FxsSlider) {
      masterVolume.component.Root.addEventListener(
        ComponentValueChangeEventName,
        (event) => {
          Sound.volumeSetMaster(event.detail.value / 100);
        }
      );
    }
    const subtitlesContainer = document.createElement("div");
    subtitlesContainer.classList.add("flex", "flex-row", "justify-between", "items-end");
    const subtitlesTitle = document.createElement("div");
    subtitlesTitle.classList.add("font-body", "text-xl", "text-white");
    subtitlesTitle.innerHTML = Locale.compose("LOC_OPTIONS_SUBTITLES");
    subtitlesContainer.appendChild(subtitlesTitle);
    this.subTitles.setAttribute("selected", `${Sound.getSubtitles()}`);
    this.subTitles.setAttribute("data-tooltip-content", "LOC_OPTIONS_SUBTITLES_DESCRIPTION");
    this.subTitles.setAttribute("data-tooltip-anchor", "left");
    subtitlesContainer.appendChild(this.subTitles);
    audioControls.appendChild(subtitlesContainer);
  }
  doAudioSettings() {
    this.currentFocus = this.dynRange;
    FocusManager.setFocus(this.currentFocus);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        FocusManager.setFocus(this.currentFocus);
      });
    });
  }
  audioContinue() {
    const dynRangeSelection = this.dynRange.getAttribute("selected-item-index");
    if (dynRangeSelection) {
      Sound.setDynamicRangeOption(parseInt(dynRangeSelection));
    }
    const subtitlesChecked = this.subTitles.getAttribute("selected");
    Sound.setSubtitles(subtitlesChecked == "true");
    Sound.volumeWriteSettings();
    UI.setApplicationOption("Shell", "FirstBoot", 0);
    UI.commitApplicationOptions();
    Configuration.getUser().saveCheckpoint();
  }
  doAutosaveIndicator() {
    this.currentFocus = this.Root;
    FocusManager.setFocus(this.currentFocus);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        FocusManager.setFocus(this.currentFocus);
      });
    });
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "accept" || inputEvent.detail.name == "shell-action-1" || inputEvent.detail.name == "shell-action-2" || inputEvent.detail.name == "sys-menu" || inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "cancel") {
      this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
      this.goToMainMenu();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  goToMainMenu() {
    if (this.legalContainer) {
      this.legalContainer.classList.add("hidden");
    }
    const rootElement = document.querySelector("#roots");
    if (rootElement) {
      rootElement.removeChild(this.Root);
      ContextManager.pop(this.Root);
      const mainMenu = document.createElement(Configuration.getXR() ? "xr-main-menu" : "main-menu");
      mainMenu.setAttribute("data-is-first-boot", this.isFirstBoot ? "true" : "false");
      if (this.isLaunchToHostMP) {
        mainMenu.setAttribute("data-launch-to-host-MP-game", "true");
      }
      rootElement.appendChild(mainMenu);
    }
  }
  launchSubScreen() {
    const buttonBar = MustGetElement(".oobe-button-bar", this.Root);
    const prevContainer = MustGetElement(".oobe-prev-container", this.Root);
    buttonBar.classList.add("hidden");
    this.updateNavTray();
    if (this.isUIReloading) {
      return;
    }
    if (this.subscreenIndex == 3 /* SUB_SCREEN_MOVIES */) {
      UI.panelDefault();
    } else {
      UI.panelStart("first-boot-options", "", UIViewChangeMethod.Unknown, true);
    }
    switch (this.subscreenIndex) {
      case 0 /* SUB_SCREEN_DISPLAY_SETTINGS */:
        buttonBar.classList.remove("hidden");
        prevContainer.classList.add("hidden");
        this.doDisplaySettings();
        if (!this.installedInputHandler) {
          this.Root.addEventListener(InputEngineEventName, this.subScreenInputListener);
          this.installedInputHandler = true;
        }
        break;
      case 1 /* SUB_SCREEN_AUDIO_SETTINGS */:
        buttonBar.classList.remove("hidden");
        prevContainer.classList.remove("hidden");
        this.doAudioSettings();
        break;
      case 2 /* SUB_SCREEN_AUTOSAVE */:
        buttonBar.classList.remove("hidden");
        this.doAutosaveIndicator();
        break;
      case 3 /* SUB_SCREEN_MOVIES */:
        this.Root.removeEventListener(InputEngineEventName, this.subScreenInputListener);
        this.logoTrainMovie = 0 /* LOGO_TRAIN_START */;
        this.doLogoTrain();
        break;
    }
    subscreenList.forEach((screenClass) => {
      const screen = MustGetElement(screenClass, this.Root);
      if (screenClass == subscreenList[this.subscreenIndex]) {
        screen.classList.remove("hidden");
      } else {
        screen.classList.add("hidden");
      }
    });
  }
  leavingSubScreen() {
    switch (this.subscreenIndex) {
      case 0 /* SUB_SCREEN_DISPLAY_SETTINGS */:
        this.displayContinue();
        break;
      case 1 /* SUB_SCREEN_AUDIO_SETTINGS */:
        this.audioContinue();
        break;
    }
  }
  previousSubScreen() {
    if (this.subscreenIndex > 0 /* SUB_SCREEN_LIST_START */) {
      this.leavingSubScreen();
      this.subscreenIndex--;
      this.launchSubScreen();
    }
  }
  nextSubScreen() {
    if (this.subscreenIndex < 3 /* SUB_SCREEN_LIST_END */) {
      this.leavingSubScreen();
      this.subscreenIndex++;
      this.launchSubScreen();
    }
  }
}
Controls.define("oob-experience-manager", {
  createInstance: OutOfBoxExperienceManager,
  description: "Initial game launch and first-time user setup manager",
  styles: [styles],
  innerHTML: [content],
  images: [
    "blp:shell_logo-full.png",
    "blp:ba_default.png",
    "blp:powered_by_wwise.png",
    "blp:coherent-gt-white.png",
    "blp:oodle_logo.png"
  ],
  tabIndex: -1
});
//# sourceMappingURL=oob-experience-mgr.js.map
