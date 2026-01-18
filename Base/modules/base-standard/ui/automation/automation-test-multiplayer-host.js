import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';
import { S as Shared_OnAutomationEvent } from './automation-test-support.chunk.js';

console.log("loading automation-test-multiplayer-host.ts");
class AutomationTestPlayGame extends AutomationBasePlayGame {
  startGame = false;
  startGameCount = 0;
  automationTestMultiplayerHostListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  playerInfoChangedListener = () => {
    this.onPlayerInfoChanged();
  };
  register() {
    engine.on("Automation-Test-Multiplayer-Host", this.automationTestMultiplayerHostListener);
    engine.on("PlayerInfoChanged", this.playerInfoChangedListener);
    engine.on("AutomationAppUpdateComplete", () => {
      this.update();
    });
    engine.on("PlayerTurnActivated", (data) => {
      this.onPlayerTurnActivated(data);
    });
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      const joinServerType = Automation.getParameter(
        "CurrentTest",
        "ServerType",
        ServerType.SERVER_TYPE_INTERNET
      );
      this.run(joinServerType);
      Automation.log("Game hosted");
    } else if (command == "PostGameInitialization") {
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  onPlayerInfoChanged() {
    const numPlayers = Network.getNumPlayers();
    const numPlayersRequired = Automation.getParameter("CurrentTest", "Players", 2);
    Automation.log("Players: " + numPlayersRequired);
    if (numPlayers >= numPlayersRequired) {
      engine.off("PlayerInfoChanged", this.playerInfoChangedListener);
      for (let i = 0; i < numPlayersRequired; i++) {
        Configuration.editPlayer(i).setSlotStatus(SlotStatus.SS_COMPUTER);
      }
      this.startGame = true;
    }
  }
  update() {
    if (this.startGame) {
      if (this.startGameCount < 60) {
        this.startGameCount += 1;
      } else {
        this.startGame = false;
        Network.startMultiplayerGame();
      }
    }
  }
  onPlayerTurnActivated(data) {
    Automation.log("Player turn activated: " + data.player);
  }
}
const automationTestPlayGameHandler = new AutomationTestPlayGame();
automationTestPlayGameHandler.register();
Automation.setScriptHasLoaded("automation-test-multiplayer-host");
//# sourceMappingURL=automation-test-multiplayer-host.js.map
