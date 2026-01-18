import { A as AutomationBasePlayGameXR } from './automation-base-play-game-xr.chunk.js';
import { S as Shared_OnAutomationEvent, c as GetFloatParam, d as GetFloat3Param } from './automation-test-support.chunk.js';
import './automation-base-play-game.chunk.js';

console.log("loading automation-test-play-game-fixed-view.ts");
class AutomationTestPlayGameFixedView extends AutomationBasePlayGameXR {
  automationTestPlayGameFixedViewListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-PlayGameFixed", this.automationTestPlayGameFixedViewListener);
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
}
const automationTestPlayGameFixedViewHandler = new AutomationTestPlayGameFixedView();
automationTestPlayGameFixedViewHandler.register();
Automation.setScriptHasLoaded("automation-test-play-game-fixed-view");
//# sourceMappingURL=automation-test-play-game-fixed-view.js.map
