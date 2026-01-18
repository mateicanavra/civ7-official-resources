console.log("loading automation-test-support.ts");
function SharedGame_OnSaveComplete() {
  Automation.log("Save complete. Completing current test.");
  Automation.sendTestComplete("SaveComplete");
}
function SharedGame_OnAutoPlayEnd() {
  Automation.log(
    "The autoplay manager has deactivated. (See autoplay.log) Saving game prior to completing current test. "
  );
  const saveGame = {};
  saveGame.FileName = Automation.generateSaveName();
  saveGame.Location = SaveLocations.LOCAL_STORAGE;
  saveGame.LocationCategories = SaveLocationCategories.NORMAL;
  saveGame.Type = SaveTypes.SINGLE_PLAYER;
  saveGame.ContentType = SaveFileTypes.GAME_STATE;
  return Network.saveGame(saveGame);
}
function LookAtCapital(ePlayer) {
  if (ePlayer !== -1) {
    const pPlayer = Players.get(ePlayer);
    if (pPlayer) {
      const pPlayerCities = pPlayer.Cities;
      if (pPlayerCities) {
        const pCapital = pPlayerCities.getCapital();
        if (pCapital) {
          const loc = pCapital.location;
          Camera.lookAtPlot(loc, { zoom: 1 });
          return true;
        }
      }
    }
  }
  return false;
}
function GetCurrentTestObserver() {
  let observeAs = PlayerIds.NO_PLAYER;
  const param = Automation.getParameter("CurrentTest", "ObserveAs", 0);
  if (param === "OBSERVER") {
    observeAs = PlayerIds.OBSERVER_ID;
  } else if (param === "NONE") {
    observeAs = PlayerIds.NO_PLAYER;
  } else if (param >= 0 && param <= Players.maxPlayers) {
    if (Players.isAlive(param)) {
      observeAs = param;
    } else {
      observeAs = PlayerIds.OBSERVER_ID;
    }
  }
  return observeAs;
}
function StartupObserverCamera(observeAs) {
  let eLookAtPlayer = observeAs;
  if (eLookAtPlayer >= PlayerIds.OBSERVER_ID) {
    eLookAtPlayer = 0;
  }
  if (Players.isValid(eLookAtPlayer)) {
    let bFound = LookAtCapital(eLookAtPlayer);
    if (!bFound) {
      const pPlayer = Players.get(eLookAtPlayer);
      if (pPlayer) {
        const pPlayerUnits = pPlayer.Units;
        if (pPlayerUnits) {
          for (const pUnit of pPlayerUnits.getUnits()) {
            if (pUnit.isDead == false) {
              Camera.lookAtPlot(pUnit.location, { zoom: 1 });
              bFound = true;
              break;
            }
          }
        }
      }
    }
  }
}
function LogCurrentPlayers() {
  Automation.log("Players:");
  const aPlayers = Players.getAliveIds();
  for (const playerId of aPlayers) {
    const pPlayerConfig = Configuration.getPlayer(playerId);
    if (pPlayerConfig !== null) {
      let szName = pPlayerConfig.civilizationName;
      if (!szName || szName === null || szName.length == 0) {
        szName = pPlayerConfig.civilizationTypeName;
      }
      if (!szName || szName === null || szName.length == 0) {
        szName = "${pPlayerConfig.civilizationTypeID}";
      }
      Automation.log(playerId.toString() + ":" + szName);
    }
  }
}
function GetTrueOrFalse(value) {
  if (value !== null) {
    if (typeof value === "string") {
      const asString = value.toUpperCase();
      if (asString == "FALSE") {
        return false;
      } else if (asString == "TRUE") {
        return true;
      }
    } else if (typeof value === "number") {
      if (value >= 0) {
        return true;
      }
    } else if (typeof value === "boolean") {
      return value;
    }
  }
  return false;
}
function GetFloatParam(paramName, defaultValue = 0) {
  return parseFloat(Automation.getParameter("CurrentTest", paramName, defaultValue));
}
function GetFloat3Param(paramX, paramY, paramZ, defaultValue = { x: 0, y: 0, z: 0 }) {
  return {
    x: GetFloatParam(paramX, defaultValue.x),
    y: GetFloatParam(paramY, defaultValue.y),
    z: GetFloatParam(paramZ, defaultValue.z)
  };
}
function ReadUserConfigOptions() {
  const quickMoves = Automation.getParameter("CurrentTest", "QuickMovement");
  if (quickMoves !== null) {
    Configuration.getUser().setLockedValue("QuickMovement", GetTrueOrFalse(quickMoves));
  }
  const quickCombat = Automation.getParameter("CurrentTest", "QuickCombat");
  if (quickCombat !== null) {
    Configuration.getUser().setLockedValue("QuickCombat", GetTrueOrFalse(quickCombat));
  }
}
function RestoreUserConfigOptions() {
  Configuration.getUser().lockValue("QuickMovement", false);
  Configuration.getUser().lockValue("QuickCombat", false);
}
function UpdatePlayerCounts() {
  let defaultPlayers = null;
  if (typeof GameInfo != "undefined") {
    if (GameInfo.Maps != null) {
      const mapSize = Configuration.getMap().mapSize;
      const def = GameInfo.Maps.lookup(mapSize);
      if (def) {
        defaultPlayers = def.DefaultPlayers;
      }
    }
  } else {
    const mapSizeTypeName = Configuration.getMap().mapSizeTypeName;
    if (mapSizeTypeName != null) {
      const q = Database.query(
        "config",
        "SELECT DefaultPlayers from MapSizes where MapSizeType=?",
        Configuration.getMap().mapSizeTypeName
      );
      if (q && q.length > 0 && q[0].DefaultPlayers != null) {
        if (typeof q[0].DefaultPlayers == "number") {
          defaultPlayers = q[0].DefaultPlayers;
        }
      } else {
        Automation.log(`Could not find ${Configuration.getMap().mapSizeTypeName} in config database`);
      }
    } else {
      Automation.log(`MapSizeType is not defined in the configuration`);
    }
  }
  if (defaultPlayers !== null) {
    Automation.log(`Setting players to ${defaultPlayers}`);
    Configuration.editMap().setMaxMajorPlayers(defaultPlayers);
    Configuration.editGame().setParticipatingPlayerCount(
      defaultPlayers + Configuration.getGame().hiddenPlayerCount
    );
  }
}
function GetTestLobbyType() {
  let lobbyType = LobbyTypes.LOBBY_LAN;
  const mpLobbyTypeParam = Automation.getParameter("CurrentTest", "MPLobbyType");
  if (mpLobbyTypeParam !== null) {
    const paramLobbyType = Network.lobbyTypeFromNamedLobbyType(mpLobbyTypeParam);
    if (paramLobbyType !== LobbyTypes.LOBBY_NONE) {
      lobbyType = paramLobbyType;
    }
  }
  return lobbyType;
}
function GetTestServerType() {
  let serverType = ServerType.SERVER_TYPE_LAN;
  const mpLobbyTypeParam = Automation.getParameter("CurrentTest", "MPLobbyType");
  if (mpLobbyTypeParam !== null) {
    const paramServerType = Network.serverTypeFromNamedLobbyType(mpLobbyTypeParam);
    if (paramServerType !== ServerType.SERVER_TYPE_NONE) {
      serverType = paramServerType;
    }
  }
  return serverType;
}
function ApplyHumanPlayersToConfiguration() {
  const humanPlayerCount = Automation.getParameter("CurrentTest", "HumanPlayers");
  if (humanPlayerCount === null || humanPlayerCount == 0) {
    const aHumanIDs = Configuration.getGame().humanPlayerIDs;
    for (const id of aHumanIDs) {
      const playerConfig = Configuration.editPlayer(id);
      playerConfig.setSlotStatus(SlotStatus.SS_COMPUTER);
    }
  } else {
    let neededHumanPlayers = humanPlayerCount - Configuration.getGame().humanPlayerCount;
    if (neededHumanPlayers > 0) {
      const aAvailableIDs = Configuration.getGame().availablePlayerIDs;
      for (const id of aAvailableIDs) {
        const playerConfig = Configuration.editPlayer(id);
        playerConfig.setSlotStatus(SlotStatus.SS_TAKEN);
        neededHumanPlayers = neededHumanPlayers - 1;
        if (neededHumanPlayers == 0) {
          break;
        }
      }
    }
    if (neededHumanPlayers > 0) {
      const aAIIDs = Configuration.getGame().aiPlayerIDs;
      for (const id of aAIIDs) {
        const playerConfig = Configuration.editPlayer(id);
        if (playerConfig.civilizationLevelTypeID == CivilizationLevelTypes.CIVILIZATION_LEVEL_FULL_CIV) {
          playerConfig.setSlotStatus(SlotStatus.SS_TAKEN);
          neededHumanPlayers = neededHumanPlayers - 1;
          if (neededHumanPlayers == 0) {
            break;
          }
        }
      }
    }
  }
}
function ConfigurePlayers() {
  const game = Configuration.getGame();
  for (const id of game.inUsePlayerIDs) {
    const playerConfig = Configuration.editPlayer(id);
    const playerCiv = Automation.getParameter("CurrentTest", "Player" + id + "Civ");
    if (playerCiv !== null) {
      Automation.log("Player " + id + " Civ: " + playerCiv);
      playerConfig.setCivilizationTypeName(playerCiv);
    }
    const playerLeader = Automation.getParameter("CurrentTest", "Player" + id + "Leader");
    if (playerLeader !== null) {
      Automation.log("Player " + id + " Leader: " + playerLeader);
      playerConfig.setLeaderTypeName(playerLeader);
    }
  }
}
function ApplyCommonNewGameParametersToConfiguration() {
  const ruleSet = Automation.getParameter("CurrentTest", "RuleSet");
  if (ruleSet !== null) {
    Automation.log("Ruleset: " + ruleSet);
    Configuration.editGame().setRuleSet(ruleSet);
  }
  const mapScript = Automation.getParameter("CurrentTest", "MapScript");
  if (mapScript !== null) {
    Automation.log("MapScript: " + mapScript);
    Configuration.editMap().setScript(mapScript);
    UpdatePlayerCounts();
  }
  const mapSize = Automation.getParameter("CurrentTest", "MapSize");
  if (mapSize !== null) {
    Automation.log("MapSize: " + mapSize);
    Configuration.editMap().setMapSize(mapSize);
    UpdatePlayerCounts();
  }
  ApplyHumanPlayersToConfiguration();
  ConfigurePlayers();
  let difficulty = Automation.getParameter("CurrentTest", "Difficulty");
  if (difficulty === null) {
    difficulty = Automation.getParameter("CurrentTest", "Handicap");
  }
  if (difficulty !== null) {
    Automation.log("Difficulty: " + difficulty);
    Configuration.editGame().setDifficultyType(difficulty);
  }
  const gameSpeed = Automation.getParameter("CurrentTest", "GameSpeed");
  if (gameSpeed !== null) {
    Automation.log("GameSpeed: " + gameSpeed);
    Configuration.editGame().setGameSpeedType(gameSpeed);
  }
  const mapSeed = Automation.getParameter("CurrentTest", "MapSeed");
  if (mapSeed !== null) {
    Configuration.editMap().setMapSeed(mapSeed);
  }
  const gameSeed = Automation.getParameter("CurrentTest", "GameSeed");
  if (gameSeed !== null) {
    Configuration.editGame().setGameSeed(gameSeed);
  }
  const gameStartAge = Automation.getParameter("CurrentTest", "StartAge");
  if (gameStartAge !== null) {
    Automation.log("StartAge: " + gameStartAge);
    Configuration.editGame().setStartAgeType(gameStartAge);
  }
  const singleAge = Automation.getParameter("CurrentTest", "SingleAge");
  if (singleAge !== null) {
    Automation.log("SingleAge: " + (singleAge ? "true" : "false"));
    Configuration.editGame().setSingleAge(singleAge);
  }
  const maxTurns = Automation.getParameter("CurrentTest", "MaxTurns");
  if (maxTurns !== null && maxTurns >= 1) {
    Configuration.editGame().setMaxTurns(maxTurns);
    Configuration.editGame().setTurnLimitType(TurnLimitType.TURNLIMIT_CUSTOM);
  }
  const participatingPlayers = Automation.getParameter("CurrentTest", "ParticipatingPlayers");
  if (participatingPlayers !== null && participatingPlayers >= 2) {
    Configuration.editGame().setParticipatingPlayerCount(participatingPlayers);
  }
  const gameName = Automation.getParameter("CurrentTest", "GameName");
  if (gameName !== null) {
    Configuration.editGame().setGameName(gameName.toString());
  }
  const maxPlayers = 64;
  for (let i = 0; i <= maxPlayers; ++i) {
    const playerCiv = Automation.getParameter("CurrentTest", "Player" + i + "Civ");
    if (playerCiv !== null) {
      Configuration.editPlayer(i).setCivilizationTypeName(playerCiv);
    }
    const playerLeader = Automation.getParameter("CurrentTest", "Player" + i + "Leader");
    if (playerLeader !== null) {
      Configuration.editPlayer(i).setLeaderTypeName(playerLeader);
    }
  }
  Automation.log("Finished applying new game parameters to configuration");
}
function PassTest(message = "") {
  engine.trigger("AutomationTestPassed", message);
}
function FailTest(message = "") {
  engine.trigger("AutomationTestFailed", message);
}
function Shared_OnAutomationEvent(args) {
  if (args && args == "LoopChild") {
    Automation.setLocalParameter("isCurrentTestLoop", true);
  } else {
    Automation.setLocalParameter("isCurrentTestLoop", false);
  }
}
class AutomationQuitApp {
  automationTestQuitAppListener = (command) => {
    this.onAutomationEvent(command);
  };
  register() {
    engine.on("Automation-Test-QuitApp", this.automationTestQuitAppListener);
  }
  onAutomationEvent(command) {
    if (command === "Run") {
      this.run();
    }
  }
  run() {
    Automation.log("Running QuitApp");
    Automation.setLocalParameter("QuitApp", true);
    Automation.sendTestComplete("QuitApp");
  }
}
const automationQuitAppHandler = new AutomationQuitApp();
automationQuitAppHandler.register();
class AutomationQuitGame {
  automationTestQuitGameListener = (command, option) => {
    this.onAutomationEvent(command, option);
  };
  register() {
    engine.on("Automation-Test-QuitGame", this.automationTestQuitGameListener);
  }
  onAutomationEvent(command, option) {
    if (command === "Run") {
      this.run(option);
    }
  }
  run(option) {
    if (option !== null && option === "Restart") {
      Automation.log("Resuming QuitGame");
    } else {
      Automation.log("Running QuitGame");
    }
    if (UI.isInGame()) {
      Automation.log("Actually Quiting");
      engine.call("exitToMainMenu");
    } else {
      Automation.log("QuitGame complete");
      Automation.sendTestComplete("QuitGame");
    }
  }
}
const automationQuitGameHandler = new AutomationQuitGame();
automationQuitGameHandler.register();
class AutomationTestLoopTests {
  automationTestLoopTestsListener = (command) => {
    this.onAutomationEvent(command);
  };
  register() {
    engine.on("Automation-Test-LoopTests", this.automationTestLoopTestsListener);
  }
  getLoopIndex() {
    return Automation.getLocalParameter("loopIndex", 0);
  }
  getIndexWithinLoop() {
    return Automation.getLocalParameter("indexWithinLoop", 0);
  }
  getHasFinishedLoop() {
    return Automation.getLocalParameter("hasFinishedLoop", false);
  }
  onAutomationEvent(command) {
    const triggerName = "Automation-Test-" + Automation.getParameter("CurrentTest", "Test");
    if (command === "Run") {
      this.run();
    } else {
      engine.trigger(triggerName, command, "LoopChild");
    }
  }
  run() {
    if (this.getHasFinishedLoop()) {
      Automation.setLocalParameter("hasFinishedLoop", false);
      Automation.setLocalParameter("isCurrentTestLoop", false);
      Automation.log("Completed loop!");
      engine.off("Automation-Test-LoopTests", this.automationTestLoopTestsListener);
      Automation.sendTestComplete("LoopTests");
    } else {
      const testsToLoop = Automation.getParameter("CurrentTest", "Tests");
      const numIterations = Automation.getParameter("CurrentTest", "Count");
      const testObject = testsToLoop[this.getIndexWithinLoop()];
      Automation.clearParameterSet("CurrentTest");
      if (typeof testObject === "object") {
        if (testObject) {
          Automation.setParameterSet("CurrentTest", testObject);
        }
      } else {
        if (typeof testObject === "string") {
          Automation.setParameter("CurrentTest", "Test", testObject);
        }
      }
      const curTestName = Automation.getParameter("CurrentTest", "Test");
      const triggerName = "Automation-Test-" + curTestName;
      Automation.log("Loop " + this.getLoopIndex() + " Test " + this.getIndexWithinLoop());
      Automation.log("Looping " + numIterations + " Times!");
      Automation.logDivider();
      Automation.log("Running Test: " + curTestName);
      if (this.getIndexWithinLoop() + 1 >= testsToLoop.length) {
        Automation.setLocalParameter("indexWithinLoop", 0);
        Automation.setLocalParameter("loopIndex", this.getLoopIndex() + 1);
      } else {
        Automation.setLocalParameter("indexWithinLoop", this.getIndexWithinLoop() + 1);
      }
      if (this.getLoopIndex() >= numIterations) {
        Automation.setLocalParameter("hasFinishedLoop", true);
      }
      engine.trigger(triggerName, "Run", "LoopChild");
    }
  }
}
const automationLoopTestsHandler = new AutomationTestLoopTests();
automationLoopTestsHandler.register();
class AutomationPauseGame {
  automationTestPauseGameListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  waitForListener = () => {
    this.onWaitFor();
  };
  waitForListenerHandle = null;
  unpauseListener = () => {
    this.onUnpause();
  };
  onUnpauseListenerHandle = null;
  register() {
    engine.on("Automation-Test-PauseGame", this.automationTestPauseGameListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      this.run();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  run() {
    if (UI.isInShell()) {
      Automation.sendTestComplete("PauseGame");
      return;
    }
    this.clearListeners();
    const pauseOptions = {};
    const pauseTime = Automation.getParameter("CurrentTest", "Time", 0);
    if (pauseTime !== null) {
      Automation.log("Time: " + pauseTime.toString());
      pauseOptions.time = pauseTime;
    }
    Automation.pause(true, pauseOptions);
    this.onUnpauseListenerHandle = engine.on("AutomationUnpaused", this.unpauseListener);
    const waitForEvent = Automation.getParameter("CurrentTest", "WaitForEvent");
    if (waitForEvent !== null) {
      if (typeof waitForEvent === "string") {
        Automation.log("WaitForEvent: " + waitForEvent);
        this.waitForListenerHandle = engine.on(waitForEvent, this.waitForListener);
      }
    }
  }
  stop() {
    this.clearListeners();
  }
  onWaitFor() {
    this.clearListeners();
    if (Automation.isActive && Automation.isPaused == true) {
      Automation.pause(false);
      Automation.sendTestComplete("PauseGame");
    }
  }
  onUnpause() {
    this.clearListeners();
    Automation.sendTestComplete("PauseGame");
  }
  clearListeners() {
    this.waitForListenerHandle?.clear();
    this.onUnpauseListenerHandle?.clear();
  }
}
const automationPauseGameHandler = new AutomationPauseGame();
automationPauseGameHandler.register();
class AutomationEnd {
  automationTestEndListener = (command) => {
    this.onAutomationEvent(command);
  };
  register() {
    engine.on("Automation-Test-End", this.automationTestEndListener);
  }
  onAutomationEvent(command) {
    if (command === "Run") {
      this.run();
    }
  }
  run() {
    Automation.setActive(false);
  }
}
const automationEndHandler = new AutomationEnd();
automationEndHandler.register();
class AutomationTestManager {
  automationRunTestListener = (option) => {
    this.onAutomationRunTest(option);
  };
  automationStopTestListener = () => {
    this.onAutomationStopTest();
  };
  automationGameStartedListener = () => {
    this.onAutomationGameStarted();
  };
  automationPostGameInitializationListener = (bWasLoad) => {
    this.onAutomationPostGameInitialization(bWasLoad);
  };
  automationCompleteListener = () => {
    this.onAutomationComplete();
  };
  automationTestCompleteListener = () => {
    this.onAutomationTestComplete();
  };
  automationTestPassedListener = (message) => {
    this.onAutomationTestPassed(message);
  };
  automationTestFailedListener = (message) => {
    this.onAutomationTestFailed(message);
  };
  automationStartListener = () => {
    this.onAutomationStart();
  };
  automationMainMenuStartedListener = () => {
    this.onAutomationMainMenuStarted();
  };
  automationAppInitCompleteListener = () => {
    this.onAutomationAppInitComplete();
  };
  constructor() {
    Automation.log("AutomationTestManager created");
  }
  register() {
    engine.on("AutomationRunTest", this.automationRunTestListener);
    engine.on("AutomationStopTest", this.automationStopTestListener);
    engine.on("AutomationGameStarted", this.automationGameStartedListener);
    engine.on("AutomationPostGameInitialization", this.automationPostGameInitializationListener);
    engine.on("AutomationComplete", this.automationCompleteListener);
    engine.on("AutomationTestComplete", this.automationTestCompleteListener);
    engine.on("AutomationTestPassed", this.automationTestPassedListener);
    engine.on("AutomationTestFailed", this.automationTestFailedListener);
    engine.on("AutomationStart", this.automationStartListener);
    engine.on("AutomationMainMenuStarted", this.automationMainMenuStartedListener);
    engine.on("AutomationAppInitComplete", this.automationAppInitCompleteListener);
  }
  getTests() {
    const aTests = Automation.getStartupParameter("Tests");
    return aTests;
  }
  // Get the currently running test for logs
  getCurrentTestDisplayName() {
    if (Automation.getLocalParameter("isCurrentTestLoop", false)) {
      return Automation.getParameter("CurrentTest", "Test");
    } else {
      return this.getCurrentTestName();
    }
  }
  // Get the current test name
  getCurrentTestName() {
    const aTests = this.getTests();
    if (aTests) {
      const testIndex = Automation.getLocalParameter("TestIndex", 0);
      if (testIndex < aTests.length) {
        const testParams = aTests[testIndex];
        if (typeof testParams === "object") {
          if (testParams) {
            return testParams.Test;
          }
        } else {
          if (typeof testParams === "string") {
            return testParams;
          }
        }
      }
    } else {
      Automation.log("No tests found.");
    }
    return null;
  }
  // Put the parameters for the current test into the "CurrentTest" parameter set on the C++ side
  storeCurrentTestParameters() {
    const aTests = this.getTests();
    if (aTests) {
      const testIndex = Automation.getLocalParameter("TestIndex", 1);
      if (testIndex < aTests.length) {
        Automation.clearParameterSet("CurrentTest");
        const testParams = aTests[testIndex];
        if (typeof testParams === "object") {
          if (testParams) {
            Automation.setParameterSet("CurrentTest", testParams);
          }
        } else {
          if (typeof testParams === "string") {
            Automation.setParameter("CurrentTest", "Test", testParams);
          }
        }
      }
    }
  }
  // Send a Run to the current test, or send a AutomationComplete event if there are no more tests
  onAutomationRunTest(option) {
    const name = this.getCurrentTestName();
    if (name !== null) {
      if (option === null || option !== "Restart") {
        Automation.logDivider();
        this.storeCurrentTestParameters();
        Automation.log("Running Test: " + name);
      }
      const triggerName = "Automation-Test-" + name;
      engine.trigger(triggerName, "Run", option);
    } else {
      engine.trigger("AutomationComplete");
    }
  }
  // Send a Stop event to the current test
  onAutomationStopTest() {
    Automation.log("Test stopped");
    const name = this.getCurrentTestName();
    if (name !== null) {
      const triggerName = "Automation-Test-" + name;
      engine.trigger(triggerName, "Stop");
    }
  }
  // Send the current test the GameStarted event.
  onAutomationGameStarted() {
    const name = this.getCurrentTestName();
    if (name !== null) {
      const triggerName = "Automation-Test-" + name;
      engine.trigger(triggerName, "GameStarted");
    }
  }
  // Send current test a PostGameInitialization event.
  onAutomationPostGameInitialization(bWasLoad) {
    const name = this.getCurrentTestName();
    if (name !== null) {
      const triggerName = "Automation-Test-" + name;
      engine.trigger(triggerName, "PostGameInitialization", bWasLoad);
    }
  }
  // Handle the AutomationComplete event.
  onAutomationComplete() {
    Automation.log("Handling AutomationComplete event");
    Automation.setActive(false);
    if (Automation.getLocalParameter("QuitApp", false) == true) {
      engine.call("exitToDesktop");
    } else {
      if (UI.isInGame()) {
        engine.call("exitToMainMenu");
      }
    }
  }
  // Handle the AutomationTestComplete event
  onAutomationTestComplete() {
    Automation.log("Test complete");
    this.onAutomationStopTest();
    const testIndex = Automation.getLocalParameter("TestIndex", 1);
    if (!Automation.getLocalParameter("isCurrentTestLoop", false)) {
      Automation.setLocalParameter("TestIndex", testIndex + 1);
    }
    engine.trigger("AutomationRunTest");
  }
  // Handle the AutomationTestPAssed event
  onAutomationTestPassed(message) {
    Automation.log("[PASS] " + this.getCurrentTestDisplayName() + ". " + message);
    this.onAutomationTestComplete();
  }
  // Handle the AutomationTestFailed event
  onAutomationTestFailed(message) {
    Automation.log("[FAIL] " + this.getCurrentTestDisplayName() + ". " + message);
    this.onAutomationTestComplete();
  }
  // Handle the request for automation to start
  onAutomationStart() {
    Automation.log("Handling AutomationStart event");
    engine.trigger("AutomationRunTest");
  }
  // The main menu has started, start any automation.
  onAutomationMainMenuStarted() {
    Automation.log("Handling AutomationMainMenuStarted");
    const bStarted = Automation.getLocalParameter("AutomationStarted", false);
    if (!bStarted) {
      Automation.setLocalParameter("AutomationStarted", true);
      engine.trigger("AutomationStart");
    } else {
      engine.trigger("AutomationRunTest", "Restart");
    }
  }
  onAutomationAppInitComplete() {
    Automation.log("Handling AutomationAppInitComplete");
    const name = this.getCurrentTestName();
    if (name !== null) {
      const triggerName = "Automation-Test-" + name;
      engine.trigger(triggerName, "AppInitComplete");
    }
  }
}
const automationTestManager = new AutomationTestManager();
automationTestManager.register();
Automation.setScriptHasLoaded("automation-test-support");

export { ApplyCommonNewGameParametersToConfiguration as A, FailTest as F, GetCurrentTestObserver as G, LogCurrentPlayers as L, PassTest as P, ReadUserConfigOptions as R, Shared_OnAutomationEvent as S, StartupObserverCamera as a, RestoreUserConfigOptions as b, GetFloatParam as c, GetFloat3Param as d, SharedGame_OnAutoPlayEnd as e, SharedGame_OnSaveComplete as f };
//# sourceMappingURL=automation-test-support.chunk.js.map
