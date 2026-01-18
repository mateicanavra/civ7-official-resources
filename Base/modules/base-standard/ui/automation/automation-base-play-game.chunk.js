import { f as SharedGame_OnSaveComplete, e as SharedGame_OnAutoPlayEnd, P as PassTest, F as FailTest, A as ApplyCommonNewGameParametersToConfiguration, R as ReadUserConfigOptions, L as LogCurrentPlayers, G as GetCurrentTestObserver, a as StartupObserverCamera, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-base-play-game.ts");
class AutomationBasePlayGame {
  saveCompleteListener = () => {
    this.onSaveComplete();
  };
  autoplayEndListener = () => {
    this.onAutoplayEnd();
  };
  turnBeginListener = (data) => {
    this.onTurnBegin(data);
  };
  turnEndListener = (data) => {
    this.onTurnEnd(data);
  };
  multiplayerGameLastPlayerListener = () => {
    this.onMultiplayerGameLastPlayer();
  };
  updateFrameListener = (timeStamp) => {
    this.OnUpdate(timeStamp);
  };
  waitForSetupListener = (timeStamp) => {
    this.OnWaitForSetupUpdate(timeStamp);
  };
  runServerType = ServerType.SERVER_TYPE_NONE;
  runStartRevision = 0;
  // CameraDrag vars
  maxCameraDistance = 12;
  direction = 1;
  panSpeed = Configuration.getUser().cameraPanningSpeed / 10;
  totalDistance = 0;
  gameAgeEndedListener = () => {
    this.onGameAgeEndedListener();
  };
  onSaveComplete() {
    SharedGame_OnSaveComplete();
  }
  onAutoplayEnd() {
    engine.on("SaveComplete", this.saveCompleteListener);
    if (SharedGame_OnAutoPlayEnd()) {
      Automation.log("Autoplay complete");
      PassTest("");
    } else {
      FailTest("");
    }
  }
  onTurnBegin(data) {
    const resyncTurn = Automation.getParameter("CurrentTest", "ForceResyncTurn");
    if (resyncTurn !== null) {
      const resyncTurnNumber = resyncTurn;
      if (resyncTurnNumber == data.turn) {
        Network.forceResync();
        Automation.log("ForceResyncTurn Turn Reached: " + data.turn);
      }
    }
  }
  onTurnEnd(data) {
    const turnCount = Automation.getParameter("CurrentTest", "Turns");
    if (turnCount !== null) {
      let turnsRemaining = turnCount;
      turnsRemaining -= 1;
      Automation.setParameter("CurrentTest", "Turns", turnsRemaining);
    }
    Automation.log("Turn Ended: " + data.turn);
  }
  onMultiplayerGameLastPlayer() {
    const quitParam = Automation.getParameter("CurrentTest", "QuitOnLastPlayer");
    if (quitParam == null || quitParam == 1) {
      Automation.log("Completing test due to becoming the last player.");
      PassTest("");
    }
  }
  onGameAgeEndedListener() {
    Automation.log("Completing test as game has ended");
    PassTest("");
  }
  // Start the game
  run(serverType = ServerType.SERVER_TYPE_NONE) {
    Automation.log("PlayGame - run()");
    if (UI.isInShell() == false) {
      const resume = Automation.getParameter("CurrentTest", "Resume");
      if (resume !== null) {
        if (resume === true || resume > 0) {
          this.resumeGame();
          return;
        }
      }
      Automation.log("Not in shell, exiting to the main menu to continue");
      if (serverType !== ServerType.SERVER_TYPE_NONE) {
        Automation.setParameter("CurrentTest", "WantServerType", serverType);
      }
      engine.call("exitToMainMenu");
      return;
    }
    Configuration.editGame().reset();
    const configurationFile = Automation.getParameter("CurrentTest", "LoadConfiguration");
    if (configurationFile !== null) {
      const loadParams = {};
      loadParams.Location = SaveLocations.LOCAL_STORAGE;
      loadParams.Type = SaveTypes.SINGLE_PLAYER;
      loadParams.FileType = SaveFileTypes.GAME_CONFIGURATION;
      loadParams.IsAutosave = false;
      loadParams.IsQuicksave = false;
      loadParams.Directory = SaveDirectories.DEFAULT;
      loadParams.Name = configurationFile;
      const configDirectory = Automation.getParameter("CurrentTest", "ConfigurationDirectory");
      if (configDirectory !== null) {
        loadParams.Directory = configDirectory;
      }
      Automation.log("Loading configuration");
      const bResult = Network.loadGame(loadParams, serverType);
      if (bResult == false) {
        FailTest("");
        return;
      }
    }
    ApplyCommonNewGameParametersToConfiguration();
    ReadUserConfigOptions();
    Automation.log("Starting game");
    Automation.setParameter("CurrentTest", "HasStarted", 1);
    this.runStartRevision = GameSetup.currentRevision;
    this.runServerType = serverType;
    engine.on("UpdateFrame", this.waitForSetupListener);
  }
  // Respond to a restart request.
  // This is usually sent when the the automation system transitions to the main-menu.
  // i.e. we quit the game or we got a request to play a new game, while in game.
  restart() {
    Automation.log("PlayGame - restart()");
    if (UI.isInShell()) {
      Automation.getParameter("CurrentTest", "HasStarted");
      const hasStarted = Automation.getParameter("CurrentTest", "HasStarted");
      if (hasStarted === null || hasStarted == 0) {
        const wantServerType = Automation.getParameter("CurrentTest", "WantServerType");
        if (wantServerType !== null) {
          this.run(wantServerType);
        } else {
          this.run(wantServerType);
        }
      } else {
        PassTest("Game Ended");
        Automation.sendTestComplete("PlayGame");
      }
    } else {
      Automation.log("Resuming game");
      this.resumeGame();
    }
  }
  // Respond to the Post Game Initialization event.
  // The game has been initialized (or loaded), but the app
  // side terrain generation, etc. has yet to be performed
  postGameInitialization(_bWasLoaded) {
    LogCurrentPlayers();
    this.startAutoPlay();
  }
  startAutoPlay() {
    engine.on("AutoplayEnded", this.autoplayEndListener);
    engine.on("TurnEnd", this.turnEndListener);
    engine.on("TurnBegin", this.turnBeginListener);
    engine.on("MultiplayerGameLastPlayer", this.multiplayerGameLastPlayerListener);
    engine.on("GameAgeEnded", this.gameAgeEndedListener);
    const CameraDragEnabled = Automation.getParameter("CurrentTest", "CameraDrag", false);
    if (CameraDragEnabled !== null && CameraDragEnabled) {
      Automation.log("Camera Drag is on");
      engine.on("UpdateFrame", this.updateFrameListener);
    }
    const turnCount = Automation.getParameter("CurrentTest", "Turns");
    const observeAs = GetCurrentTestObserver();
    if (turnCount !== null) {
      Automation.log(turnCount + " Turns specified!");
      Autoplay.setTurns(turnCount);
    } else {
      Automation.log("No Turns specified!");
    }
    Autoplay.setReturnAsPlayer(0);
    Autoplay.setObserveAsPlayer(observeAs);
    Autoplay.setActive(true);
  }
  resumeGame() {
    Automation.log("PlayGame - resumeGame()");
    this.startAutoPlay();
    const observeAs = GetCurrentTestObserver();
    StartupObserverCamera(observeAs);
  }
  // Respond to the Game Start
  // The player will be able to see the map at this time.
  gameStarted() {
    Automation.log("PlayGame - gameStarted()");
    const observeAs = GetCurrentTestObserver();
    if (Autoplay.isActive) {
      StartupObserverCamera(observeAs);
    } else {
      FailTest("");
    }
  }
  // Stop handler for "PlayGame"
  stop() {
    Automation.log("PlayGame - stop()");
    engine.off("AutoplayEnded", this.autoplayEndListener);
    engine.off("TurnEnd", this.turnEndListener);
    engine.off("TurnBegin", this.turnBeginListener);
    engine.off("MultiplayerGameLastPlayer", this.multiplayerGameLastPlayerListener);
    engine.off("SaveComplete", this.saveCompleteListener);
    engine.off("UpdateFrame", this.updateFrameListener);
    engine.off("GameAgeEnded", this.gameAgeEndedListener);
    engine.off("UpdateFrame", this.waitForSetupListener);
    if (typeof Autoplay != "undefined") {
      Autoplay.setActive(false);
    }
    RestoreUserConfigOptions();
  }
  // Frame Update function to handle camera drag
  OnUpdate(timeDelta) {
    this.totalDistance += this.panSpeed * timeDelta * this.direction;
    if (this.totalDistance >= this.maxCameraDistance || this.totalDistance <= -this.maxCameraDistance) {
      this.direction *= -1;
      this.totalDistance = 0;
    }
    const panAmount = { x: this.totalDistance, y: 0 };
    Camera.panFocus(panAmount);
  }
  // Frame Update function while we wait for the game setup integration to update after changing the game configuration
  // in preparation to start an autoplay.
  OnWaitForSetupUpdate(_timeDelta) {
    if (GameSetup.currentRevision != this.runStartRevision) {
      engine.off("UpdateFrame", this.waitForSetupListener);
      Automation.log("Hosting game");
      Network.hostGame(this.runServerType);
    }
  }
}

export { AutomationBasePlayGame as A };
//# sourceMappingURL=automation-base-play-game.chunk.js.map
