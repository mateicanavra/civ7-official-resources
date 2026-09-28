const GameCreatorOpenedEventName = "game-creator-opened";
class GameCreatorOpenedEvent extends CustomEvent {
  constructor() {
    super(GameCreatorOpenedEventName, { bubbles: false, cancelable: true });
  }
}
const GameCreatorClosedEventName = "game-creator-closed";
class GameCreatorClosedEvent extends CustomEvent {
  constructor() {
    super(GameCreatorClosedEventName, { bubbles: false, cancelable: true });
  }
}
const StartCampaignEventName = "startCampaign";
class StartCampaignEvent extends CustomEvent {
  constructor() {
    super(StartCampaignEventName, { bubbles: false, cancelable: true });
  }
}
const SuspendCloseListenerEventName = "suspend-close-listener";
class SuspendCloseListenerEvent extends CustomEvent {
  constructor() {
    super(SuspendCloseListenerEventName, { bubbles: false, cancelable: true });
  }
}
const ResumeCloseListenerEventName = "resume-close-listener";
class ResumeCloseListenerEvent extends CustomEvent {
  constructor() {
    super(ResumeCloseListenerEventName, { bubbles: false, cancelable: true });
  }
}
const UpdateLiveNoticeEventName = "update-live-notice";
class UpdateLiveNoticeEvent extends CustomEvent {
  constructor() {
    super(UpdateLiveNoticeEventName, { bubbles: false, cancelable: true });
  }
}
const MainMenuReturnEventName = "main-menu-return";
class MainMenuReturnEvent extends CustomEvent {
  constructor() {
    super(MainMenuReturnEventName, { bubbles: false, cancelable: true });
  }
}
const SendCampaignSetupTelemetryEventName = "send-campaign-setup-telemetry";
class SendCampaignSetupTelemetryEvent extends CustomEvent {
  constructor(event, humanCount, participantCount) {
    super(SendCampaignSetupTelemetryEventName, {
      bubbles: false,
      cancelable: true,
      detail: { event, humanCount, participantCount }
    });
  }
}

export { GameCreatorClosedEvent, GameCreatorClosedEventName, GameCreatorOpenedEvent, GameCreatorOpenedEventName, MainMenuReturnEvent, MainMenuReturnEventName, ResumeCloseListenerEvent, ResumeCloseListenerEventName, SendCampaignSetupTelemetryEvent, SendCampaignSetupTelemetryEventName, StartCampaignEvent, StartCampaignEventName, SuspendCloseListenerEvent, SuspendCloseListenerEventName, UpdateLiveNoticeEvent, UpdateLiveNoticeEventName };
//# sourceMappingURL=shell-events.js.map
