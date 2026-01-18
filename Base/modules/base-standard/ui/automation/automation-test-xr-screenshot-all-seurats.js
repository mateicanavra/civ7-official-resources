import { S as Shared_OnAutomationEvent, P as PassTest, A as ApplyCommonNewGameParametersToConfiguration, R as ReadUserConfigOptions, F as FailTest } from './automation-test-support.chunk.js';

console.log("automation-test-xr-screenshot-all-seurats.ts");
var XRScreenshotAllSeuratsScene = /* @__PURE__ */ ((XRScreenshotAllSeuratsScene2) => {
  XRScreenshotAllSeuratsScene2[XRScreenshotAllSeuratsScene2["MainMenu"] = 0] = "MainMenu";
  XRScreenshotAllSeuratsScene2[XRScreenshotAllSeuratsScene2["Gameplay"] = 1] = "Gameplay";
  return XRScreenshotAllSeuratsScene2;
})(XRScreenshotAllSeuratsScene || {});
var XRScreenshotAllSeuratsMenuState = /* @__PURE__ */ ((XRScreenshotAllSeuratsMenuState2) => {
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Initialising"] = 0] = "Initialising";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Teleporting"] = 1] = "Teleporting";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["FreezingView"] = 2] = "FreezingView";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Screenshotting"] = 3] = "Screenshotting";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["UnFreezingView"] = 4] = "UnFreezingView";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Deciding"] = 5] = "Deciding";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Moving"] = 6] = "Moving";
  XRScreenshotAllSeuratsMenuState2[XRScreenshotAllSeuratsMenuState2["Complete"] = 7] = "Complete";
  return XRScreenshotAllSeuratsMenuState2;
})(XRScreenshotAllSeuratsMenuState || {});
var XRScreenshotAllSeuratsGameplayState = /* @__PURE__ */ ((XRScreenshotAllSeuratsGameplayState2) => {
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["GameNotLoaded"] = 0] = "GameNotLoaded";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["GameLoaded"] = 1] = "GameLoaded";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["ChangingVista"] = 2] = "ChangingVista";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["FreezingView"] = 3] = "FreezingView";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["Screenshotting"] = 4] = "Screenshotting";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["UnFreezingView"] = 5] = "UnFreezingView";
  XRScreenshotAllSeuratsGameplayState2[XRScreenshotAllSeuratsGameplayState2["Complete"] = 6] = "Complete";
  return XRScreenshotAllSeuratsGameplayState2;
})(XRScreenshotAllSeuratsGameplayState || {});
var XRScreenshotAllSeuratsCivilisations = /* @__PURE__ */ ((XRScreenshotAllSeuratsCivilisations2) => {
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["AKSUM"] = 0] = "AKSUM";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["EGYPT"] = 1] = "EGYPT";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["GREECE"] = 2] = "GREECE";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["HAN"] = 3] = "HAN";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["KHMER"] = 4] = "KHMER";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["MAURYA"] = 5] = "MAURYA";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["MAYA"] = 6] = "MAYA";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["MISSISSIPPIAN"] = 7] = "MISSISSIPPIAN";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["PERSIA"] = 8] = "PERSIA";
  XRScreenshotAllSeuratsCivilisations2[XRScreenshotAllSeuratsCivilisations2["ROME"] = 9] = "ROME";
  return XRScreenshotAllSeuratsCivilisations2;
})(XRScreenshotAllSeuratsCivilisations || {});
var XRScreenshotAllSeuratsPopulations = /* @__PURE__ */ ((XRScreenshotAllSeuratsPopulations2) => {
  XRScreenshotAllSeuratsPopulations2[XRScreenshotAllSeuratsPopulations2["Low"] = 0] = "Low";
  XRScreenshotAllSeuratsPopulations2[XRScreenshotAllSeuratsPopulations2["Medium"] = 1] = "Medium";
  XRScreenshotAllSeuratsPopulations2[XRScreenshotAllSeuratsPopulations2["High"] = 2] = "High";
  return XRScreenshotAllSeuratsPopulations2;
})(XRScreenshotAllSeuratsPopulations || {});
class AutomationTestXRScreenshotAllSeurats {
  sceneIndex = 0;
  sceneState = 0 /* MainMenu */;
  menuZoneIndex = 0;
  menuZones = new Array();
  menuState = 0 /* Initialising */;
  gameplaySeuratIndex = 0;
  gameplaySeuratPopulation = 0 /* Low */;
  gameplayState = 0 /* GameNotLoaded */;
  orientationIndex = 0;
  orientations = [
    { x: 0, y: -90, z: -90 },
    // Forward
    { x: 90, y: -90, z: -90 },
    // Left
    { x: -90, y: -90, z: -90 },
    // Right
    { x: 180, y: -90, z: -90 },
    // Behind
    { x: 0, y: 0, z: -90 },
    // Floor
    { x: 0, y: -180, z: -90 }
    // Ceiling
  ];
  pauseTimeAny = 0.5;
  pauseTimeStartDelay = 1;
  pauseTimeTeleport = 0.5;
  pauseTimeFreeze = 0.15;
  pauseTimeTakeScreenshot = 0.15;
  pauseTimeGameplayTurnModal = 5;
  pauseTimeChangeVista = 0.2;
  automationTestXRScreenshotAllSeuratsListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-XRScreenshotAllSeurats", this.automationTestXRScreenshotAllSeuratsListener, this);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command == "AppInitComplete") {
      this.run();
    } else if (command == "PostGameInitialization") {
      engine.on("AutomationUnpaused", this.onUnpaused, this);
      this.sceneState = 1 /* Gameplay */;
      this.gameplayState = 1 /* GameLoaded */;
      this.pause(this.pauseTimeStartDelay);
    } else if (command == "Stop") {
      this.stop();
    }
  }
  run() {
    engine.on("AutomationUnpaused", this.onUnpaused, this);
    this.initialise();
    this.pause(this.pauseTimeStartDelay);
  }
  initialise() {
    Automation.log("Initializing");
    Automation.log("Main Menu Zone Names:");
    const startingZone = "PLY_Zone_Menu_Center";
    Automation.log(startingZone);
    this.menuZones.push(startingZone);
    const teleportZoneCount = XR.World.getZoneCount();
    for (let i = 0; i < teleportZoneCount; i++) {
      const zoneName = XR.World.getZoneNameByIndex(i);
      Automation.log(zoneName);
      this.menuZones.push(zoneName);
    }
    this.menuState = 2 /* FreezingView */;
  }
  onUnpaused() {
    switch (this.sceneState) {
      case 0 /* MainMenu */: {
        this.updateMainMenu();
        break;
      }
      case 1 /* Gameplay */: {
        this.updateGameplay();
        break;
      }
    }
  }
  updateMainMenu() {
    switch (this.menuState) {
      case 1 /* Teleporting */: {
        this.teleportToNextLocation();
        this.pause(this.pauseTimeTeleport);
        this.menuState = 2 /* FreezingView */;
        break;
      }
      case 2 /* FreezingView */: {
        Automation.log("Orienting: " + this.orientationIndex);
        this.applyOrientationIndex();
        this.incrementOrientationIndex();
        this.pause(this.pauseTimeFreeze);
        this.menuState = 3 /* Screenshotting */;
        break;
      }
      case 3 /* Screenshotting */: {
        Automation.log("Taking Screenshot");
        XR.World.takeScreenshot();
        this.pause(this.pauseTimeTakeScreenshot);
        this.menuState = 4 /* UnFreezingView */;
        break;
      }
      case 4 /* UnFreezingView */: {
        Automation.log("UnFreezing");
        XR.FireTuner.unfreezeView();
        this.pause(this.pauseTimeFreeze);
        this.menuState = 5 /* Deciding */;
        break;
      }
      case 5 /* Deciding */: {
        Automation.log("Deciding what to do next");
        if (this.orientationIndex < 6) {
          Automation.log("Next Orientation: " + this.orientationIndex);
          this.menuState = 2 /* FreezingView */;
        } else {
          Automation.log("Next Position");
          this.orientationIndex = 0;
          this.menuZoneIndex += 1;
          if (this.menuZoneIndex < 5) {
            this.menuState = 1 /* Teleporting */;
          } else {
            Automation.log("No positions left - We're done!");
            this.menuState = 7 /* Complete */;
          }
        }
        this.pause(this.pauseTimeAny);
        break;
      }
      case 7 /* Complete */: {
        XR.World.teleportToZone(this.menuZones[0]);
        this.sceneState = 1 /* Gameplay */;
        this.pause(this.pauseTimeAny);
        break;
      }
    }
  }
  updateGameplay() {
    switch (this.gameplayState) {
      case 0 /* GameNotLoaded */: {
        Configuration.editGame().reset();
        ApplyCommonNewGameParametersToConfiguration();
        ReadUserConfigOptions();
        Automation.log("Starting game..");
        const serverType = ServerType.SERVER_TYPE_NONE;
        Network.hostGame(serverType);
        engine.off("AutomationUnpause", this.onUnpaused, this);
        break;
      }
      case 1 /* GameLoaded */: {
        this.pause(this.pauseTimeGameplayTurnModal);
        this.gameplayState = 2 /* ChangingVista */;
        break;
      }
      case 2 /* ChangingVista */: {
        XR.World.setVista(this.gameplaySeuratIndex, this.gameplaySeuratPopulation);
        this.pause(this.pauseTimeChangeVista);
        this.gameplayState = 3 /* FreezingView */;
        break;
      }
      case 3 /* FreezingView */: {
        this.applyOrientationIndex();
        this.pause(this.pauseTimeFreeze);
        this.gameplayState = 4 /* Screenshotting */;
        break;
      }
      case 4 /* Screenshotting */: {
        Automation.log("Taking Screenshot");
        Automation.log("Civ: " + XRScreenshotAllSeuratsCivilisations[this.gameplaySeuratIndex]);
        Automation.log("Pop: " + XRScreenshotAllSeuratsPopulations[this.gameplaySeuratPopulation]);
        XR.World.takeScreenshot();
        this.pause(this.pauseTimeTakeScreenshot);
        this.gameplayState = 5 /* UnFreezingView */;
        break;
      }
      case 5 /* UnFreezingView */: {
        XR.FireTuner.unfreezeView();
        if (this.gameplaySeuratPopulation < 2 /* High */) {
          this.gameplaySeuratPopulation += 1;
        } else if (this.gameplaySeuratIndex < 9 /* ROME */) {
          this.gameplaySeuratIndex += 1;
          this.gameplaySeuratPopulation = 0;
        } else {
          PassTest("Finished taking screenshots");
          return;
        }
        this.pause(this.pauseTimeFreeze);
        this.gameplayState = 2 /* ChangingVista */;
        break;
      }
    }
  }
  stop() {
    Automation.log("XRScreenshotAllSeurats - stop()");
  }
  teleportToNextLocation() {
    const result = XR.World.teleportToZone(this.menuZones[this.menuZoneIndex]);
    if (!result) FailTest("Attempted to teleport to zone that does not exist");
  }
  pause(time) {
    const pauseOptions = {};
    pauseOptions.time = time;
    Automation.pause(true, pauseOptions);
  }
  applyOrientationIndex() {
    const tableZoom = 300;
    const playerLocalPosition = XR.World.getPlayerLocalPosition();
    const cameraPosition = { x: playerLocalPosition.x, y: playerLocalPosition.y, z: playerLocalPosition.z + 2 };
    const cameraRotation = this.orientations[this.orientationIndex];
    XR.FireTuner.freezeView(tableZoom, cameraPosition, cameraRotation);
  }
  incrementOrientationIndex() {
    this.orientationIndex += 1;
  }
}
const automationTestXRScreenshotAllSeuratsHandler = new AutomationTestXRScreenshotAllSeurats();
automationTestXRScreenshotAllSeuratsHandler.register();
Automation.setScriptHasLoaded("automation-test-xr-screenshot-all-seurats");

export { AutomationTestXRScreenshotAllSeurats };
//# sourceMappingURL=automation-test-xr-screenshot-all-seurats.js.map
