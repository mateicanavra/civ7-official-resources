import { S as Shared_OnAutomationEvent, F as FailTest, P as PassTest } from './automation-test-support.chunk.js';

console.log("loading automation-test-menu-benchmark.ts");
class AutomationTestMenuBenchmark {
  automationTestMenuBenchmarkListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  benchmarkStartedListener = (data) => {
    this.onBenchmarkStarted(data);
  };
  benchmarkCooledListener = (data) => {
    this.onBenchmarkCooled(data);
  };
  benchmarkUpdatedListener = (data) => {
    this.onBenchmarkUpdated(data);
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
  register() {
    engine.on("Automation-Test-MenuBenchmark", this.automationTestMenuBenchmarkListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    Automation.log("Processing Event: " + command);
    if (command === "AppInitComplete") {
      this.initialize();
    } else if (command === "Run") {
      this.run();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  initialize() {
    Automation.log("Initializing Benchmark");
    if (UI.isInShell() == false) {
      Automation.log("Not in shell, exiting to the main menu to continue");
      engine.call("exitToMainMenu");
      return;
    }
    Benchmark.Menu.initialize();
    Automation.log("Finished Initializing");
  }
  run() {
    engine.on("BenchStarted", this.benchmarkStartedListener);
    engine.on("BenchEnded", this.benchmarkEndedListener);
    engine.on("BenchUpdated", this.benchmarkUpdatedListener);
    engine.on("BenchCooled", this.benchmarkCooledListener);
    engine.on("BenchSwapped", this.benchmarkSwappedListener);
    engine.on("BenchTerminated", this.benchmarkTerminatedListener);
    engine.on("BenchWarmed", this.benchmarkWarmedListener);
    const categoryName = Automation.getParameter("CurrentTest", "Category");
    const arrangementName = Automation.getParameter("CurrentTest", "Arrangement");
    const time = Automation.getParameter("CurrentTest", "Time", 10);
    Automation.log(
      "Test Inputs - Category: " + categoryName + ", Arrangement: " + arrangementName + ", Time: " + time
    );
    if (categoryName !== null && arrangementName !== null) {
      const category = CategoryType[categoryName];
      const arrangement = ArrangementType[arrangementName];
      Benchmark.Menu.start({ category, arrangement, time });
      Automation.log("Requesting Start for " + categoryName + " with " + arrangementName + " arrangement");
    } else {
      FailTest("No benchmarking Category given.");
    }
  }
  stop() {
    Automation.log("Stopping Benchmark");
    Benchmark.Menu.cancel();
    engine.off("BenchStarted", this.benchmarkStartedListener);
    engine.off("BenchEnded", this.benchmarkEndedListener);
    engine.off("BenchUpdated", this.benchmarkUpdatedListener);
    engine.off("BenchCooled", this.benchmarkCooledListener);
    engine.off("BenchSwapped", this.benchmarkSwappedListener);
    engine.off("BenchTerminated", this.benchmarkTerminatedListener);
    engine.off("BenchWarmed", this.benchmarkWarmedListener);
  }
  onBenchmarkStarted(data) {
    const information = JSON.stringify(data);
    Automation.log("Benchmark Information: " + information);
  }
  onBenchmarkEnded(_data) {
    PassTest("Benchmark Ended");
  }
  onBenchmarkUpdated(_data) {
  }
  onBenchmarkCooled(data) {
    const information = JSON.stringify(data);
    Automation.log("Benched an asset: " + information);
  }
  onBenchmarkSwapped(_data) {
  }
  onBenchmarkTerminated(_data) {
  }
  onBenchmarkWarmed(_data) {
  }
}
const automationTestMenuBenchmarkHandler = new AutomationTestMenuBenchmark();
automationTestMenuBenchmarkHandler.register();
Automation.setScriptHasLoaded("automation-test-menu-benchmark");
//# sourceMappingURL=automation-test-menu-benchmark.js.map
