import { A as AutomationBaseBenchmarkGame } from './automation-base-benchmark-game.chunk.js';
import { S as Shared_OnAutomationEvent, a as StartupObserverCamera } from './automation-test-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

console.log("loading automation-test-benchmark-ui.ts");
class AutomationTestBenchmarkUI extends AutomationBaseBenchmarkGame {
  automationTestBenchmarkUIListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  updateFrameListener = (timeStamp) => {
    this.OnUpdate(timeStamp);
  };
  benchmarkStartedListener = (data) => {
    this.onBenchmarkStarted(data);
  };
  FOCUS_DURATION = 1;
  totalTime = 0;
  focusTime = -this.FOCUS_DURATION;
  started = false;
  // set to true after the delay
  opened = false;
  constructor() {
    super("BenchmarkGameUI");
  }
  register() {
    engine.on(`Automation-Test-${this.testName}`, this.automationTestBenchmarkUIListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      if (args !== null && args.length > 0 && args[0] == "Restart") {
        this.restart();
      } else {
        this.run("UIBenchmark");
      }
    } else if (command == "PostGameInitialization") {
      engine.on("UpdateFrame", this.updateFrameListener);
      engine.on("BenchStarted", this.benchmarkStartedListener);
      this.postGameInitialization(args);
      Autoplay.setReturnAsPlayer(GameContext.localPlayerID);
      Autoplay.setObserveAsPlayer(GameContext.localObserverID);
      Autoplay.setActive(true);
      Autoplay.setPause(true);
    } else if (command == "GameStarted") {
      const startParameters = {
        type: GameBenchmarkType.UI,
        time: 60,
        delay: 5
      };
      this.gameStarted(startParameters);
      this.started = false;
    } else if (command == "Stop") {
      engine.off("BenchStarted", this.benchmarkStartedListener);
      engine.off("UpdateFrame", this.updateFrameListener);
      this.stop();
    }
  }
  onBenchmarkStarted(_data) {
    StartupObserverCamera(this.observer);
    this.started = true;
  }
  OnUpdate(timeDelta) {
    if (!Benchmark.Game.isRunning() || !this.started) {
      return;
    }
    this.totalTime += timeDelta;
    if (this.totalTime - this.focusTime > this.FOCUS_DURATION) {
      this.focusTime += this.FOCUS_DURATION;
      const className = "screen-civilopedia";
      if (this.opened) {
        engine.trigger(`close-${className}`);
      } else {
        engine.trigger(`open-${className}`);
      }
      this.opened = !this.opened;
    }
  }
}
const automationTestBenchmarkUIHandler = new AutomationTestBenchmarkUI();
automationTestBenchmarkUIHandler.register();
Automation.setScriptHasLoaded("automation-test-benchmark-ui");
//# sourceMappingURL=automation-test-benchmark-ui.js.map
