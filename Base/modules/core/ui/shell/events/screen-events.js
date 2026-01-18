import ContextManager from '../../context-manager/context-manager.js';
import { M as MainMenuReturnEvent } from '../../events/shell-events.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { UnlockableRewardItems } from '../../utilities/utilities-liveops.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<div class=\"screen-events flow-column relative\">\r\n\t<div\r\n\t\tclass=\"events-content flex-auto flow-column\"\r\n\t\ttabindex=\"-1\"\r\n\t>\r\n\t\t<fxs-hslot class=\"flex-auto\">\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tclass=\"events-menu\"\r\n\t\t\t\ttabindex=\"-1\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"events-menu-top bg-cover bg-no-repeat self-center\"></div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"events-title font-title text-xl text-secondary-1 uppercase self-center mt-2\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_MAIN_MENU_EVENTS\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"events-menu-divider bg-contain bg-no-repeat self-center mt-4\"></div>\r\n\t\t\t\t<!--<fxs-activatable class=\"events-menu-item events-item-continue font-title uppercase text-xl text-accent-2 self-center\"\r\n\t\t\t\t\t\t\t\t data-l10n-id=\"LOC_UI_CONTINUE_EVENTS\" tabindex=\"-1\"></fxs-activatable>\r\n\t\t\t\t<div class=\"events-menu-divider bg-contain bg-no-repeat self-center\"></div>-->\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"events-menu-item events-item-sp font-title uppercase text-xl text-accent-2 self-center\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_EVENTS_SINGLEPLAYER\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-activatable>\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"events-menu-item events-item-load font-title uppercase text-xl text-accent-2 self-center\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_LOAD_EVENTS\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-activatable>\r\n\t\t\t\t<div class=\"events-menu-divider bg-contain bg-no-repeat self-center\"></div>\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"events-menu-item events-item-mp font-title uppercase text-xl text-accent-2 self-center\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_EVENTS_MULTIPLAYER\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-activatable>\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"events-menu-item events-item-exit events-indent font-title uppercase text-xl text-accent-2 self-center\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_EXTRAS_EXIT_TO_MAIN\"\r\n\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t></fxs-activatable>\r\n\t\t\t</fxs-vslot>\r\n\t\t\t<fxs-vslot class=\"events-info h-full\">\r\n\t\t\t\t<div class=\"inset-x-4 inset-y-0 flex-auto flow-column\">\r\n\t\t\t\t\t<fxs-vslot class=\"events-description flex-auto py-6 self-center\">\r\n\t\t\t\t\t\t<!-- Title and divider-->\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"events-desc-title font-title text-secondary-1 text-2xl self-center uppercase mb-2\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div class=\"filigree-divider-h3 bg-no-repeat bg-contain self-center\"></div>\r\n\t\t\t\t\t\t<div class=\"events-banner w-full h-18 bg-cover bg-no-repeat mb-8\"></div>\r\n\t\t\t\t\t\t<!-- scrollable region -->\r\n\t\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\t\tclass=\"events-scrollable flex-auto\"\r\n\t\t\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"events-desc-subtitle font-title text-secondary-1 text-xl self-center uppercase mb-2\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div class=\"filigree-shell-small bg-no-repeat bg-contain self-center mb-2\"></div>\r\n\t\t\t\t\t\t\t<!-- Rewards -->\r\n\t\t\t\t\t\t\t<div class=\"events-reward-container self-center\"></div>\r\n\t\t\t\t\t\t\t<div class=\"events-desc-text font-body text-lg text-accent-2 leading-tight\"></div>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"font-title text-secondary-1 text-xl self-center uppercase mt-6\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_EVENTS_RULES\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<div class=\"filigree-shell-small bg-no-repeat bg-contain self-center mb-2\"></div>\r\n\t\t\t\t\t\t\t<div class=\"events-rules-text font-body text-lg text-accent-2 leading-tight\"></div>\r\n\t\t\t\t\t\t\t<div class=\"font-body text-base text-accent-2 leading-tight\"></div>\r\n\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t</div>\r\n\t\t\t\t<fxs-button\r\n\t\t\t\t\tcaption=\"LOC_GENERIC_BACK\"\r\n\t\t\t\t\tclass=\"event-rules-dismiss\"\r\n\t\t\t\t\taction-key=\"inline-cancel\"\r\n\t\t\t\t></fxs-button>\r\n\t\t\t</fxs-vslot>\r\n\t\t</fxs-hslot>\r\n\t</div>\r\n\t<fxs-close-button class=\"events-close-button absolute\"></fxs-close-button>\r\n</div>\r\n";

const styles = "fs://game/core/ui/shell/events/screen-events.css";

const EventsScreenGoSinglePlayerEventName = "screen-events-sp";
class EventsScreenGoSinglePlayerEvent extends CustomEvent {
  constructor() {
    super(EventsScreenGoSinglePlayerEventName, { bubbles: false, cancelable: true });
  }
}
const EventsScreenLoadEventName = "screen-events-loading";
class EventsScreenLoadEvent extends CustomEvent {
  constructor() {
    super(EventsScreenLoadEventName, { bubbles: false, cancelable: true });
  }
}
const EventsScreenContinueEventName = "screen-events-continue";
class EventsScreenContinueEvent extends CustomEvent {
  constructor() {
    super(EventsScreenContinueEventName, { bubbles: false, cancelable: true });
  }
}
const EventsScreenGoMultiPlayerEventName = "screen-events-mp";
class EventsScreenGoMultiPlayerEvent extends CustomEvent {
  constructor() {
    super(EventsScreenGoMultiPlayerEventName, { bubbles: false, cancelable: true });
  }
}
class ScreenEvents extends Panel {
  closeButtonListener = () => {
    this.close();
  };
  singlePlayerListener = () => {
    this.onSinglePlayer();
  };
  loadListener = () => {
    this.onLoadEvent();
  };
  //private continueListener = () => { this.onContinueEvent(); }
  multiPlayerListener = () => {
    this.onMultiPlayer();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  activeLiveEventListener = this.onActiveLiveEvent.bind(this);
  connIcon = null;
  connStatus = null;
  accountStatus = null;
  carouselMain = null;
  constructor(root) {
    super(root);
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const exitToMain = MustGetElement(".events-item-exit", this.Root);
    exitToMain.addEventListener("action-activate", () => {
      Telemetry.sendUIMenuAction({
        Menu: TelemetryMenuType.EventsPage,
        MenuAction: TelemetryMenuActionType.Select,
        Item: "Exit"
      });
    });
    exitToMain.addEventListener("action-activate", this.closeButtonListener);
    const singlePlayer = MustGetElement(".events-item-sp", this.Root);
    singlePlayer.addEventListener("action-activate", () => {
      Telemetry.sendUIMenuAction({
        Menu: TelemetryMenuType.EventsPage,
        MenuAction: TelemetryMenuActionType.Select,
        Item: "SP"
      });
    });
    singlePlayer.addEventListener("action-activate", this.singlePlayerListener);
    const loadEvent = MustGetElement(".events-item-load", this.Root);
    loadEvent.addEventListener("action-activate", this.loadListener);
    const multiPlayer = MustGetElement(".events-item-mp", this.Root);
    multiPlayer.addEventListener("action-activate", () => {
      Telemetry.sendUIMenuAction({
        Menu: TelemetryMenuType.EventsPage,
        MenuAction: TelemetryMenuActionType.Select,
        Item: "MP"
      });
    });
    multiPlayer.addEventListener("action-activate", this.multiPlayerListener);
    const scrollable = MustGetElement(".events-scrollable", this.Root);
    scrollable.whenComponentCreated((component) => {
      component.setEngineInputProxy(this.Root);
    });
    this.hideMultiplayerStatus();
    engine.on("LiveEventActiveUpdated", this.activeLiveEventListener);
    if (Online.LiveEvent.getCurrentLiveEvent() != "") {
      const currentEventPrefix = "LOC_" + Online.LiveEvent.getCurrentLiveEvent();
      const rewardData = Online.Achievements.getAvaliableRewardsForLiveEvent(
        Online.LiveEvent.getCurrentLiveEvent()
      );
      this.updateText(currentEventPrefix, rewardData);
    }
    const dismissButton = MustGetElement(".event-rules-dismiss", this.Root);
    dismissButton.addEventListener("action-activate", this.closeButtonListener);
    const closeButton = MustGetElement(".events-close-button", this.Root);
    closeButton.addEventListener("action-activate", this.closeButtonListener);
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.EventsPage, MenuAction: TelemetryMenuActionType.Load });
  }
  onDetach() {
    Telemetry.sendUIMenuAction({ Menu: TelemetryMenuType.EventsPage, MenuAction: TelemetryMenuActionType.Exit });
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
    this.showMultiplayerStatus();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateGenericSelect();
    const menu = MustGetElement(".events-menu", this.Root);
    FocusManager.setFocus(menu);
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  close() {
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  onSinglePlayer() {
    Online.LiveEvent.setLiveEventGameFlag();
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new EventsScreenGoSinglePlayerEvent());
  }
  onLoadEvent() {
    Online.LiveEvent.setLiveEventGameFlag();
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new MainMenuReturnEvent());
    window.dispatchEvent(new EventsScreenLoadEvent());
  }
  // TODO: bring back if/when continue added back
  onContinueEvent() {
    Online.LiveEvent.setLiveEventGameFlag();
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new MainMenuReturnEvent());
    window.dispatchEvent(new EventsScreenContinueEvent());
  }
  onActiveLiveEvent() {
    const currentEventPrefix = "LOC_" + Online.LiveEvent.getCurrentLiveEvent();
    const rewardData = Online.Achievements.getAvaliableRewardsForLiveEvent(Online.LiveEvent.getCurrentLiveEvent());
    this.updateText(currentEventPrefix, rewardData);
  }
  onMultiPlayer() {
    Online.LiveEvent.setLiveEventGameFlag();
    ContextManager.popUntil("main-menu");
    window.dispatchEvent(new MainMenuReturnEvent());
    window.dispatchEvent(new EventsScreenGoMultiPlayerEvent());
  }
  updateText(currentEventPrefix, rewardData) {
    const title = MustGetElement(".events-desc-title", this.Root);
    title.setAttribute("data-l10n-id", currentEventPrefix);
    const subTitle = MustGetElement(".events-desc-subtitle", this.Root);
    subTitle.setAttribute("data-l10n-id", currentEventPrefix + "_SHORT_DESC");
    const description = MustGetElement(".events-desc-text", this.Root);
    description.setAttribute("data-l10n-id", currentEventPrefix + "_DESCRIPTION");
    const rules = MustGetElement(".events-rules-text", this.Root);
    rules.setAttribute("data-l10n-id", currentEventPrefix + "_RULES");
    const rewardArea = MustGetElement(".events-reward-container", this.Root);
    while (rewardArea.children.length > 0) {
      rewardArea.removeChild(rewardArea.children[0]);
    }
    for (let i = 0; i < rewardData.length; i++) {
      const reward = rewardData[i];
      const rewardItem = UnlockableRewardItems.badgeRewardItems.find((b) => b.dnaId == reward.dnaID);
      const rewardDescription = rewardItem != void 0 ? rewardItem.unlockCondition : reward.description;
      const rewardDiv = document.createElement("div");
      rewardDiv.innerHTML = `	<fxs-hslot class="mt-2 mb-2">
					<div class="bg-cover bg-no-repeat w-16 h-16" style="background-image: url('fs://game/${reward.reward}')"></div>
					<fxs-vslot class="ml-2">
						<div class="font-title text-lg text-accent-2 uppercase" data-l10n-id="${reward.name}"></div>
						<div class="font-body text-base text-primary-1" data-l10n-id="${rewardDescription}"></div>
					</fxs-vslot>
				</fxs-hslot>
			`;
      rewardArea.appendChild(rewardDiv);
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "cancel" || inputEvent.detail.name == "sys-menu" || inputEvent.detail.name == "keyboard-escape" || inputEvent.detail.name == "mousebutton-right") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  hideMultiplayerStatus() {
    this.connIcon = document.querySelector(".connection-icon-img");
    if (!this.connIcon) {
      console.error("screen-credits: Missing this.connIcon with '.connection-icon-img'");
      return;
    }
    this.connStatus = document.querySelector(".connection-status");
    if (!this.connStatus) {
      console.error("screen-credits: Missing this.connStatus with '.connection-status'");
      return;
    }
    this.accountStatus = document.querySelector(".account-status");
    if (!this.accountStatus) {
      console.error("screen-credits: Missing this.accountStatus with '.account-status'");
      return;
    }
    this.carouselMain = document.querySelector(".carousel");
    if (!this.carouselMain) {
      console.error("screen-credits: Missing this.carouselMain with '.carousel'");
      return;
    }
    this.connIcon.style.display = "none";
    this.connStatus.style.display = "none";
    this.accountStatus.style.display = "none";
    this.carouselMain.style.display = "none";
  }
  showMultiplayerStatus() {
    this.connIcon = document.querySelector(".connection-icon-img");
    if (!this.connIcon) {
      console.error("screen-credits: Missing this.connIcon with '.connection-icon-img'");
      return;
    }
    if (!this.connStatus) {
      console.error("screen-credits: Missing this.connStatus with '.connection-status'");
      return;
    }
    if (!this.accountStatus) {
      console.error("screen-credits: Missing this.accountStatus with '.account-status'");
      return;
    }
    if (!this.carouselMain) {
      console.error("screen-credits: Missing this.carouselMain with '.carousel'");
      return;
    }
    this.connIcon.style.display = "flex";
    this.connStatus.style.display = "flex";
    this.accountStatus.style.display = "flex";
    this.carouselMain.style.display = "flex";
  }
}
Controls.define("screen-events", {
  createInstance: ScreenEvents,
  description: "Events screen.",
  classNames: ["screen-events"],
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});

export { EventsScreenContinueEventName, EventsScreenGoMultiPlayerEventName, EventsScreenGoSinglePlayerEventName, EventsScreenLoadEventName, ScreenEvents };
//# sourceMappingURL=screen-events.js.map
