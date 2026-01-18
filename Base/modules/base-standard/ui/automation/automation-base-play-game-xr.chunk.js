import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';

console.log("loading automation-base-play-game-xr.ts");
class AutomationBasePlayGameXR extends AutomationBasePlayGame {
  onTurnEnd(data) {
    const autoplayPauseWarmupDurationMs = Automation.getParameter(
      "CurrentTest",
      "EndTurnAutoplayPauseWarmupDurationMS",
      0
    );
    const autoplayPauseDurationMs = Automation.getParameter("CurrentTest", "EndTurnAutoplayPauseDurationMS", 0);
    if (autoplayPauseWarmupDurationMs + autoplayPauseDurationMs > 0) {
      XR.Autoplay.state = AutoplayState.PauseSettling;
      Automation.log("Autoplay pausing");
      setTimeout(() => {
        XR.Autoplay.state = AutoplayState.Paused;
        Automation.log("Autoplay paused");
        setTimeout(() => {
          XR.Autoplay.state = AutoplayState.Playing;
          Automation.log("Autoplay resumed");
        }, autoplayPauseDurationMs);
      }, autoplayPauseWarmupDurationMs);
    }
    super.onTurnEnd(data);
  }
}

export { AutomationBasePlayGameXR as A };
//# sourceMappingURL=automation-base-play-game-xr.chunk.js.map
