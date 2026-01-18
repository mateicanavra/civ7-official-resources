import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';
import { S as Shared_OnAutomationEvent } from './automation-test-support.chunk.js';

console.log("loading automation-test-play-game.ts");
class AutomationTestPlayGame extends AutomationBasePlayGame {
  automationTestPlayGameListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-PlayGame", this.automationTestPlayGameListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      if (args !== null && args.length > 0 && args[0] == "Restart") {
        this.restart();
      } else {
        this.run();
      }
    } else if (command == "PostGameInitialization") {
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
}
const automationTestPlayGameHandler = new AutomationTestPlayGame();
automationTestPlayGameHandler.register();
Automation.setScriptHasLoaded("automation-test-play-game");
//# sourceMappingURL=automation-test-play-game.js.map
