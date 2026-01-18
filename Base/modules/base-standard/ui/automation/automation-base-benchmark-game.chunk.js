import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { R as ReadUserConfigOptions, F as FailTest, P as PassTest, G as GetCurrentTestObserver, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-base-benchmark-game.ts");
class AutomationBaseBenchmarkGame {
  constructor(testName) {
    this.testName = testName;
  }
  autoplayEndListener = () => {
    this.onAutoplayEnd();
  };
  benchmarkCooledListener = (data) => {
    this.onBenchmarkCooled(data);
  };
  benchmarkEndedListener = (data) => {
    this.onBenchmarkEnded(data);
  };
  benchmarkSwappedListener = (data) => {
    this.onBenchmarkSwapped(data);
  };
  benchmarkTerminatedListener = (data) => {
    this.onBenchmarkTerminated(data);
  };
  benchmarkWarmedListener = (data) => {
    this.onBenchmarkWarmed(data);
  };
  observer = -1;
  onAutoplayEnd() {
  }
  /**
   * @param fileName The filename without an extension
   */
  run(fileName) {
    Automation.log(`${this.testName} - run()`);
    if (UI.isInShell() == false) {
      Automation.log("Not in shell, exiting to the main menu to continue");
      engine.call("exitToMainMenu");
      return;
    }
    const includeFileExtension = Automation.getParameter("CurrentTest", "FileExtension", false);
    if (includeFileExtension) {
      fileName += ".Civ7Save";
    }
    const loadParams = {};
    loadParams.Location = SaveLocations.LOCAL_STORAGE;
    loadParams.Type = SaveTypes.SINGLE_PLAYER;
    loadParams.IsAutosave = false;
    loadParams.IsQuicksave = false;
    loadParams.Directory = SaveDirectories.APP_BENCHMARK;
    loadParams.FileName = fileName;
    ReadUserConfigOptions();
    Configuration.getUser().setLockedValue("QuickMovement", true);
    Configuration.getUser().setLockedValue("QuickCombat", true);
    Automation.log("Loading configuration with file '" + fileName + "'");
    const bResult = Network.loadGame(loadParams, ServerType.SERVER_TYPE_NONE);
    if (bResult == false) {
      Automation.log("Failed to load " + loadParams.FileName);
      FailTest("");
      return;
    }
    Automation.log("Starting game");
  }
  // Respond to a restart request.
  // This is usually sent when the the automation system transitions to the main-menu.
  // i.e. we quit the game.  We just want to say that our test is complete, and move on
  restart() {
    Automation.log("BenchmarkGame - restart()");
    if (UI.isInShell()) {
      PassTest("Game Ended");
      Automation.sendTestComplete(this.testName);
    }
  }
  // Respond to the Post Game Initialization event.
  // The game has been initialized (or loaded), but the app
  // side terrain generation, etc. has yet to be performed
  postGameInitialization(_bWasLoaded) {
    engine.on("AutoplayEnded", this.autoplayEndListener);
    engine.on("BenchEnded", this.benchmarkEndedListener);
    engine.on("BenchCooled", this.benchmarkCooledListener);
    engine.on("BenchSwapped", this.benchmarkSwappedListener);
    engine.on("BenchTerminated", this.benchmarkTerminatedListener);
    engine.on("BenchWarmed", this.benchmarkWarmedListener);
    Configuration.editGame().setSaveDisabled(true);
    this.observer = GetCurrentTestObserver();
  }
  // Once we get the go ahead to start the game we can make the request to start benchmarking
  gameStarted(startParameters) {
    Automation.log("BenchmarkGame - gameStarted()");
    Benchmark.Game.start(startParameters);
    ViewManager.isWorldInputAllowed = false;
  }
  stop() {
    Automation.log("BenchmarkGame - stop()");
    engine.off("AutoplayEnded", this.autoplayEndListener);
    engine.off("BenchEnded", this.benchmarkEndedListener);
    engine.off("BenchCooled", this.benchmarkCooledListener);
    engine.off("BenchSwapped", this.benchmarkSwappedListener);
    engine.off("BenchTerminated", this.benchmarkTerminatedListener);
    engine.off("BenchWarmed", this.benchmarkWarmedListener);
    RestoreUserConfigOptions();
    if (typeof Autoplay != "undefined") {
      Autoplay.setActive(false);
      Autoplay.setPause(false);
    }
  }
  // TODO: Receive final statistics
  onBenchmarkEnded(_data) {
  }
  onBenchmarkCooled(_data) {
  }
  onBenchmarkSwapped(_data) {
  }
  onBenchmarkTerminated(_data) {
  }
  onBenchmarkWarmed(_data) {
  }
}

export { AutomationBaseBenchmarkGame as A };
//# sourceMappingURL=automation-base-benchmark-game.chunk.js.map
