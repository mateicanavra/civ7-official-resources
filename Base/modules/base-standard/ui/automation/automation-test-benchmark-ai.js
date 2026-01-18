import { A as AutomationBaseBenchmarkGame } from './automation-base-benchmark-game.chunk.js';
import { S as Shared_OnAutomationEvent, a as StartupObserverCamera } from './automation-test-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

console.log("loading automation-test-benchmark-ai.ts");
class AutomationTestBenchmarkAI extends AutomationBaseBenchmarkGame {
  automationTestBenchmarkAIListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  benchmarkStartedListener = (data) => {
    this.onBenchmarkStarted(data);
  };
  benchmarkUpdatedListener = (data) => {
    this.onBenchmarkUpdated(data);
  };
  TURN_TARGET = 10;
  turnCount = 0;
  constructor() {
    super("BenchmarkGameAI");
  }
  register() {
    engine.on(`Automation-Test-${this.testName}`, this.automationTestBenchmarkAIListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      if (args !== null && args.length > 0 && args[0] == "Restart") {
        this.restart();
      } else {
        this.run("AIBenchmark");
      }
    } else if (command == "PostGameInitialization") {
      engine.on("BenchStarted", this.benchmarkStartedListener);
      engine.on("BenchUpdated", this.benchmarkUpdatedListener);
      this.postGameInitialization(args);
      Autoplay.setTurns(this.TURN_TARGET);
      Autoplay.setReturnAsPlayer(GameContext.localPlayerID);
      Autoplay.setObserveAsPlayer(GameContext.localPlayerID);
      Autoplay.setActive(true);
      Autoplay.setPause(true);
    } else if (command == "GameStarted") {
      StartupObserverCamera(this.observer);
      const startParameters = {
        type: GameBenchmarkType.AI,
        time: 0,
        // 0 will run almost forever, and we must manually cancel the benchmark
        delay: 5
      };
      this.gameStarted(startParameters);
    } else if (command == "Stop") {
      engine.off("BenchUpdated", this.benchmarkUpdatedListener);
      engine.off("BenchStarted", this.benchmarkStartedListener);
      this.stop();
    }
  }
  onBenchmarkStarted(_data) {
    Autoplay.setPause(false);
  }
  onBenchmarkUpdated(_data) {
    this.turnCount++;
    if (this.turnCount >= this.TURN_TARGET) {
      Benchmark.Game.cancel();
    }
  }
}
const automationTestBenchmarkAIHandler = new AutomationTestBenchmarkAI();
automationTestBenchmarkAIHandler.register();
Automation.setScriptHasLoaded("automation-test-benchmark-ai");
//# sourceMappingURL=automation-test-benchmark-ai.js.map
