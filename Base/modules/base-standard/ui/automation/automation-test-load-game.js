import { S as Shared_OnAutomationEvent, R as ReadUserConfigOptions, e as SharedGame_OnAutoPlayEnd, F as FailTest, A as ApplyCommonNewGameParametersToConfiguration, L as LogCurrentPlayers, G as GetCurrentTestObserver, P as PassTest, a as StartupObserverCamera, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-base-load-game.ts");
class AutomationTestLoadGame {
  automationTestLoadGameListener = (command) => {
    this.onAutomationEvent(command);
  };
  autoPlayEndListener = () => {
    this.onAutoPlayEnd();
  };
  saveCompleteListener = () => {
    this.onSaveComplete();
  };
  savesRemaining = 0;
  register() {
    engine.on("Automation-Test-LoadGame", this.automationTestLoadGameListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      this.run();
    } else if (command == "PostGameInitialization") {
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  loadLastGame() {
    Automation.setLocalParameter("loadGame_firstRun", false);
    const loadGame = {};
    loadGame.Location = SaveLocations.LOCAL_STORAGE;
    loadGame.Type = SaveTypes.SINGLE_PLAYER;
    loadGame.IsAutosave = false;
    loadGame.IsQuicksave = false;
    loadGame.FileName = Automation.getLastGeneratedSaveName();
    loadGame.Directory = SaveDirectories.DEFAULT;
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
  loadGameByName(fileName, fileDirectory) {
    Automation.setLocalParameter("loadGame_firstRun", false);
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
  onSaveComplete() {
    this.savesRemaining--;
    if (this.savesRemaining <= 0) {
      Automation.log("Save complete, starting load game sequence");
      engine.off("SaveComplete", this.saveCompleteListener);
      this.loadLastGame();
    } else {
      Automation.log("Saves remaining " + this.savesRemaining);
    }
  }
  onAutoPlayEnd() {
    Automation.log("Autoplay complete");
    if (!SharedGame_OnAutoPlayEnd()) {
      FailTest("");
    }
  }
  run() {
    Automation.log("LoadGame - run()");
    if (UI.isInShell() == false) {
      engine.call("exitToMainMenu");
      return;
    }
    const saveName = Automation.getParameter("CurrentTest", "SaveName");
    if (saveName !== null) {
      Automation.setLocalParameter("loadGame_firstRun", false);
      const saveDirectory = Automation.getParameter("CurrentTest", "SaveDirectory");
      this.loadGameByName(saveName, saveDirectory);
      return;
    }
    Automation.setLocalParameter("loadGame_firstRun", true);
    Configuration.editGame().reset();
    Configuration.getUser().setAutoSaveFrequency(1);
    ApplyCommonNewGameParametersToConfiguration();
    ReadUserConfigOptions();
    Automation.log("Starting game");
    Network.hostGame(ServerType.SERVER_TYPE_NONE);
  }
  // Respond to the Post Game Initialization event
  // The game has been initialized (or loaded), but the app
  // side terrain generation, etc. has yet to be performed
  postGameInitialization(_bWasLoaded) {
    Automation.log("Game initialized");
    LogCurrentPlayers();
    if (Automation.getLocalParameter("loadGame_firstRun")) {
      engine.on("AutoplayEnded", this.autoPlayEndListener);
      engine.on("SaveComplete", this.saveCompleteListener);
      const turnCount = Automation.getParameter("CurrentTest", "Turns");
      const observeAs = GetCurrentTestObserver();
      if (turnCount !== null) {
        Automation.log(turnCount + " Turns specified!");
        Autoplay.setTurns(turnCount);
        this.savesRemaining = turnCount + 2;
      } else {
        Automation.log("No Turns specified!");
      }
      Autoplay.setReturnAsPlayer(0);
      Autoplay.setObserveAsPlayer(observeAs);
      Autoplay.setActive(true);
    }
  }
  // Respond to the Game Start event
  gameStarted() {
    Automation.log("Game started");
    if (!Automation.getLocalParameter("loadGame_firstRun")) {
      Automation.log("Load complete, completing current test.");
      PassTest("");
      return;
    }
    const observeAs = GetCurrentTestObserver();
    Autoplay.isActive ? StartupObserverCamera(observeAs) : FailTest("");
  }
  // Respond to a Stop event
  stop() {
    Automation.log("LoadGame test stopped");
    engine.off("AutoplayEnded", this.autoPlayEndListener);
    engine.off("SaveComplete", this.saveCompleteListener);
    Autoplay.setActive(false);
    RestoreUserConfigOptions();
  }
}
const automationLoadGameHandler = new AutomationTestLoadGame();
automationLoadGameHandler.register();
Automation.setScriptHasLoaded("automation-test-load-game");
//# sourceMappingURL=automation-test-load-game.js.map
