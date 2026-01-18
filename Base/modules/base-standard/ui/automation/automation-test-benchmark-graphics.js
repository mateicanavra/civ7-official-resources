import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { A as AutomationBaseBenchmarkGame } from './automation-base-benchmark-game.chunk.js';
import { S as Shared_OnAutomationEvent } from './automation-test-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

console.log("loading automation-test-benchmark-graphics.ts");
var States = /* @__PURE__ */ ((States2) => {
  States2[States2["NONE"] = 0] = "NONE";
  States2[States2["LOOK_AT"] = 1] = "LOOK_AT";
  States2[States2["CINEMATIC"] = 2] = "CINEMATIC";
  return States2;
})(States || {});
class AutomationTestBenchmarkGraphics extends AutomationBaseBenchmarkGame {
  automationTestBenchmarkGraphicsListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  updateFrameListener = (timeStamp) => {
    this.OnUpdate(timeStamp);
  };
  benchmarkStartedListener = (data) => {
    this.onBenchmarkStarted(data);
  };
  FOCUS_DURATION = 2;
  CINEMATIC_DURATION = 12;
  FOCUS_HEIGHT = 10;
  CAMERA_HEIGHT = 30;
  DYNAMIC_CAMERA_PARAMS = {
    focusHeight: this.FOCUS_HEIGHT,
    cameraHeight: this.CAMERA_HEIGHT,
    duration: this.CINEMATIC_DURATION,
    easeInFactor: 1.25,
    easeOutFactor: 2
  };
  totalTime = 0;
  started = false;
  // set to true after the delay
  cities = [];
  currentState = 0 /* NONE */;
  useStaticCamera = false;
  plotCoord = { x: 0, y: 0 };
  constructor() {
    super("BenchmarkGameGraphics");
  }
  register() {
    engine.on(`Automation-Test-${this.testName}`, this.automationTestBenchmarkGraphicsListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      if (args !== null && args.length > 0 && args[0] == "Restart") {
        this.restart();
      } else {
        this.run("GraphicsBenchmark");
      }
    } else if (command == "PostGameInitialization") {
      this.useStaticCamera = Automation.getParameter("CurrentTest", "StaticCamera", false);
      engine.on("UpdateFrame", this.updateFrameListener);
      engine.on("BenchStarted", this.benchmarkStartedListener);
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      const startParameters = {
        type: GameBenchmarkType.GRAPHICS,
        time: 45,
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
  SelectNextPlot() {
    if (this.cities.length > 0) {
      const selection = Benchmark.Game.randomRange(0, this.cities.length - 1);
      this.plotCoord = this.cities[selection];
      this.cities[selection] = this.cities[this.cities.length - 1];
      this.cities.pop();
    }
    if (!this.plotCoord) {
      const Y_PADDING = 5;
      const gridWidth = GameplayMap.getGridWidth();
      const gridHeight = GameplayMap.getGridHeight();
      const x = Benchmark.Game.randomRange(0, gridWidth - 1);
      const y = Benchmark.Game.randomRange(Y_PADDING, gridHeight - Y_PADDING - 1);
      this.plotCoord = { x, y };
    }
  }
  onBenchmarkStarted(_data) {
    this.started = true;
    const MIN_POPULATION = 5;
    this.cities = [];
    const players = Players.getAlive();
    for (const player of players) {
      if (player && player.isMajor) {
        const playerCities = player.Cities;
        if (playerCities) {
          const cities = playerCities.getCities();
          for (const city of cities) {
            if (!city.isTown && city.population >= MIN_POPULATION) {
              this.cities.push(city.location);
            }
          }
        }
      }
    }
    this.SelectNextPlot();
  }
  OnUpdate(timeDelta) {
    if (!Benchmark.Game.isRunning() || !this.started) {
      return;
    }
    if (this.useStaticCamera) {
      return;
    }
    this.totalTime += timeDelta;
    if (this.currentState === 1 /* LOOK_AT */) {
      if (this.totalTime > this.FOCUS_DURATION) {
        this.totalTime -= this.FOCUS_DURATION;
        this.currentState = 0 /* NONE */;
        if (Benchmark.Game.randomRange(0, 2) == 0) {
          this.currentState = 2 /* CINEMATIC */;
          Camera.pushDynamicCamera(this.plotCoord, this.DYNAMIC_CAMERA_PARAMS);
          ViewManager.setCurrentByName("Cinematic");
        }
      }
    }
    if (this.currentState === 2 /* CINEMATIC */) {
      if (this.totalTime > this.CINEMATIC_DURATION) {
        this.totalTime -= this.CINEMATIC_DURATION;
        this.currentState = 0 /* NONE */;
        Camera.popCamera();
        ViewManager.setCurrentByName("Unset");
        ViewManager.switchToEmptyView();
      }
    }
    if (this.currentState === 0 /* NONE */) {
      this.SelectNextPlot();
      Camera.lookAtPlot(this.plotCoord);
      this.currentState = 1 /* LOOK_AT */;
    }
  }
  // TODO: Receive the statistics as frame timings
}
const automationTestBenchmarkGraphicsHandler = new AutomationTestBenchmarkGraphics();
automationTestBenchmarkGraphicsHandler.register();
Automation.setScriptHasLoaded("automation-test-benchmark-graphics");
//# sourceMappingURL=automation-test-benchmark-graphics.js.map
