import { S as Shared_OnAutomationEvent, P as PassTest, F as FailTest } from './automation-test-support.chunk.js';

console.log("automation-test-xr-teleport-zones.ts");
var XRTeleportTestState = /* @__PURE__ */ ((XRTeleportTestState2) => {
  XRTeleportTestState2[XRTeleportTestState2["Teleporting"] = 0] = "Teleporting";
  XRTeleportTestState2[XRTeleportTestState2["ReturningHome"] = 1] = "ReturningHome";
  XRTeleportTestState2[XRTeleportTestState2["Moving"] = 2] = "Moving";
  XRTeleportTestState2[XRTeleportTestState2["Complete"] = 3] = "Complete";
  return XRTeleportTestState2;
})(XRTeleportTestState || {});
class AutomationTestXRTeleportZones {
  testingZoneFromName = "";
  testingZoneToName = "";
  testingOuterIndex = 0;
  testingInnerIndex = 0;
  testingHomeName = "";
  testingShouldReturnHome = false;
  testingIsMovingToNewLocation = false;
  allStartingZones = new Array();
  state = 0 /* Teleporting */;
  automationTestXRTeleportZonesListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-XRTeleportZones", this.automationTestXRTeleportZonesListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    Automation.log("onAutomationEvent command: " + command);
    if (command === "AppInitComplete") {
      this.run();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  initialise() {
    Automation.log("XRTeleportZones - initialise()");
    Automation.log("Collecting Initial Teleport Zones");
    const startingZone = "PLY_Zone_Menu_Center";
    Automation.log(startingZone);
    this.allStartingZones.push(startingZone);
    this.testingHomeName = startingZone;
    const teleportZoneCount = XR.World.getZoneCount();
    for (let i = 0; i < teleportZoneCount; i++) {
      const zoneName = XR.World.getZoneNameByIndex(i);
      Automation.log(zoneName);
      this.allStartingZones.push(zoneName);
    }
  }
  run() {
    Automation.log("XRTeleportZones - run()");
    engine.on("XRTeleportCompleted", this.onTeleportCompleted, this);
    this.initialise();
    this.testSelfTeleportation();
    this.configureNextTeleport();
    this.performNextTeleport();
    Automation.log("XRTeleportZones - end of run()");
  }
  stop() {
    Automation.log("XRTeleportZones - stop()");
    engine.off("XRTeleportCompleted", this.onTeleportCompleted, this);
  }
  onTeleportCompleted(_data) {
    Automation.log("XRTeleportZones - onTeleportCompleted()");
    this.validateTeleport();
    this.updateTestState();
    this.configureNextTeleport();
    this.performNextTeleport();
  }
  updateTestState() {
    Automation.log("XRTeleportZones - updateTestState()");
    switch (this.state) {
      case 0 /* Teleporting */: {
        this.state = 1 /* ReturningHome */;
        break;
      }
      case 1 /* ReturningHome */: {
        this.testingInnerIndex += 1;
        this.testSelfTeleportation();
        this.state = 0 /* Teleporting */;
        if (this.testingInnerIndex == this.allStartingZones.length) {
          this.testingInnerIndex = 0;
          this.testingOuterIndex += 1;
          this.state = 2 /* Moving */;
        }
        if (this.testingOuterIndex == this.allStartingZones.length - 1) {
          this.state = 3 /* Complete */;
          PassTest("All zones tested successfully.");
        }
        break;
      }
      case 2 /* Moving */: {
        this.state = 0 /* Teleporting */;
        break;
      }
      default: {
        break;
      }
    }
  }
  testSelfTeleportation() {
    if (this.testingInnerIndex == this.testingOuterIndex) {
      this.testingInnerIndex += 1;
    }
  }
  configureNextTeleport() {
    Automation.log("XRTeleportZones - configureNextTeleport()");
    switch (this.state) {
      case 0 /* Teleporting */: {
        Automation.log("XRTeleportZones - Configuring to test a teleport zone");
        this.testingZoneToName = this.allStartingZones[this.testingInnerIndex];
        this.testingZoneFromName = this.testingHomeName;
        break;
      }
      case 1 /* ReturningHome */: {
        Automation.log("XRTeleportZones - Configuring to return home");
        this.testingZoneToName = this.testingHomeName;
        this.testingZoneFromName = this.allStartingZones[this.testingInnerIndex];
        break;
      }
      case 2 /* Moving */: {
        Automation.log("XRTeleportZones - Configuring to Move to new Location");
        this.testingHomeName = this.allStartingZones[this.testingOuterIndex];
        this.testingZoneToName = this.testingHomeName;
        this.testingZoneFromName = "N/A";
        break;
      }
      case 3 /* Complete */: {
        Automation.log("XRTeleportZones - Configuring to return to centre location.");
        this.testingHomeName = this.allStartingZones[0];
        this.testingZoneToName = this.testingHomeName;
        this.testingZoneFromName = "N/A";
        break;
      }
      default: {
        break;
      }
    }
    Automation.log("XRTeleportZones - testingZoneToName: " + this.testingZoneToName);
    Automation.log("XRTeleportZones - testingZoneFromName: " + this.testingZoneFromName);
  }
  performNextTeleport() {
    const result = XR.World.teleportToZone(this.testingZoneToName);
    if (!result) FailTest("Attempted to teleport to zone that does not exist");
  }
  // This function asks a bunch of questions about the current state and passes and fails accordingly.
  validateTeleport() {
    switch (this.state) {
      case 0 /* Teleporting */: {
        const activeZones = new Array();
        const activeZoneCount = XR.World.getZoneCount();
        for (let i = 0; i < activeZoneCount; i++) {
          activeZones.push(XR.World.getZoneNameByIndex(i));
        }
        for (let i = 0; i < this.allStartingZones.length; i++) {
          if (i == this.testingInnerIndex) {
            for (let ii = 0; ii < activeZoneCount; ii++) {
              if (this.testingZoneToName == activeZones[ii]) {
                FailTest(
                  "We teleported to a zone, and that zone was still available as a teleport destination: " + this.allStartingZones[i]
                );
                this.state = 3 /* Complete */;
                return;
              }
            }
          } else {
            let foundZone = false;
            for (let ii = 0; ii < activeZoneCount; ii++) {
              if (this.allStartingZones[i] == activeZones[ii]) {
                foundZone = true;
                break;
              }
            }
            if (!foundZone) {
              FailTest(
                "We teleported to a zone, and found that a zone we expected to be avaialble was not: " + this.allStartingZones[i]
              );
              this.state = 3 /* Complete */;
              return;
            }
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  }
}
const automationTestXRTeleportZonesHandler = new AutomationTestXRTeleportZones();
automationTestXRTeleportZonesHandler.register();
Automation.setScriptHasLoaded("automation-test-xr-teleport-zones");

export { AutomationTestXRTeleportZones };
//# sourceMappingURL=automation-test-xr-teleport-zones.js.map
