import { S as Shared_OnAutomationEvent, c as GetFloatParam, d as GetFloat3Param, R as ReadUserConfigOptions, L as LogCurrentPlayers, P as PassTest, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-test-play-game-xr-fixed.ts");
class AutomationTestLoadGameFixedViewXR {
  automationTestLoadGameFixedViewListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-LoadGameFixedXR", this.automationTestLoadGameFixedViewListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      this.run();
    } else if (command == "PostGameInitialization") {
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      const tableZoom = GetFloatParam("TableZoom", 300);
      const cameraPosition = GetFloat3Param(
        "CameraPositionX",
        "CameraPositionY",
        "CameraPositionZ",
        { x: -2.25, y: 0, z: 2 }
      );
      const cameraRotation = GetFloat3Param(
        "CameraRotationX",
        "CameraRotationY",
        "CameraRotationZ",
        { x: 0, y: -60, z: -90 }
      );
      XR.FireTuner.freezeView(tableZoom, cameraPosition, cameraRotation);
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  run() {
    Automation.log("LoadGameFixedViewXR - run()");
    if (UI.isInShell() == false) {
      engine.call("exitToMainMenu");
      return;
    }
    const saveName = Automation.getParameter("CurrentTest", "SaveName");
    if (saveName !== null) {
      const saveDirectory = Automation.getParameter("CurrentTest", "SaveDirectory");
      this.loadGameByName(saveName, saveDirectory);
      return;
    }
  }
  loadGameByName(fileName, fileDirectory) {
    const loadGame = {};
    loadGame.Location = SaveLocations.LOCAL_STORAGE;
    loadGame.Type = SaveTypes.SINGLE_PLAYER;
    loadGame.IsAutosave = false;
    loadGame.IsQuicksave = false;
    loadGame.FileName = fileName ?? Automation.getLastGeneratedSaveName();
    loadGame.Directory = fileDirectory ?? SaveDirectories.DEFAULT;
    ReadUserConfigOptions();
    Automation.log("Attempting to load " + loadGame.FileName);
    const bResult = Network.loadGame(loadGame, ServerType.SERVER_TYPE_NONE);
    if (bResult == false) {
      Automation.log("Failed to load " + loadGame.FileName);
      Automation.sendTestComplete();
      return;
    }
    Automation.log("Load successful");
  }
  postGameInitialization(_bWasLoaded) {
    LogCurrentPlayers();
  }
  gameStarted() {
    Automation.log("LoadGameIdleXR - gameStarted()");
    const idleTime = Automation.getParameter("CurrentTest", "IdleTime");
    if (idleTime !== null) {
      Automation.log("Idling for " + idleTime + " seconds.");
      setTimeout(() => {
        XR.FireTuner.unfreezeView();
        setTimeout(() => {
          Automation.log("Idle time complete.");
          PassTest("");
        }, 1e3);
      }, idleTime * 1e3);
    }
  }
  stop() {
    Automation.log("LoadGameIdleXR - stop()");
    RestoreUserConfigOptions();
  }
}
const automationTestLoadGameFixedViewHandler = new AutomationTestLoadGameFixedViewXR();
automationTestLoadGameFixedViewHandler.register();
Automation.setScriptHasLoaded("automation-test-load-game-xr-fixed");
//# sourceMappingURL=automation-test-load-game-xr-fixed.js.map
