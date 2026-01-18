import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';
import { S as Shared_OnAutomationEvent, F as FailTest } from './automation-test-support.chunk.js';

console.log("loading automation-test-multiplayer-join.ts");
class AutomationTestPlayGame extends AutomationBasePlayGame {
  automationTestMultiplayerJoinListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  mpGameListUpdatedListener = (data) => {
    this.onMultiplayerGameListUpdated(data);
  };
  mpGameListCompleteListener = (data) => {
    this.onMultiplayerGameListComplete(data);
  };
  joinGameName = "";
  register() {
    engine.on("Automation-Test-Multiplayer-Join", this.automationTestMultiplayerJoinListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      let joinCodeStr = "";
      const joinCodeParam = Automation.getParameter("CurrentTest", "JoinCode");
      if (joinCodeParam !== null) {
        joinCodeStr = joinCodeParam.toString();
        const joinServerType = Automation.getParameter(
          "CurrentTest",
          "ServerType",
          ServerType.SERVER_TYPE_INTERNET
        );
        Automation.log(
          "Joining game by Join Code=" + joinCodeStr + ", ServerType=" + joinServerType.toString()
        );
        Network.joinMultiplayerGame(joinCodeStr, joinServerType);
        return;
      }
      const gameNameParam = Automation.getParameter("CurrentTest", "GameName");
      if (gameNameParam != null) {
        this.joinGameName = gameNameParam.toString();
        const browseServerType = Automation.getParameter(
          "CurrentTest",
          "ServerType",
          ServerType.SERVER_TYPE_INTERNET
        );
        Automation.log(
          "Joining game by GameName=" + this.joinGameName + ", ServerType=" + browseServerType.toString()
        );
        engine.on("MultiplayerGameListUpdated", this.mpGameListUpdatedListener);
        engine.on("MultiplayerGameListComplete", this.mpGameListCompleteListener);
        Network.initGameList(browseServerType);
        Network.refreshGameList();
        return;
      }
      FailTest("No Join Method Found!");
    } else if (command == "PostGameInitialization") {
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  onMultiplayerGameListUpdated(data) {
    if (this.joinGameName == "") {
      return;
    }
    const gameListData = Network.getGameListEntry(data.idLobby);
    if (gameListData != null && gameListData.serverNameOriginal == this.joinGameName) {
      Automation.log(
        "GameName=" + this.joinGameName + " Found. RoomID=" + data.idLobby.toString() + " Joining Game..."
      );
      engine.off("MultiplayerGameListUpdated", this.mpGameListUpdatedListener);
      engine.off("MultiplayerGameListComplete", this.mpGameListCompleteListener);
      Network.joinMultiplayerRoom(data.idLobby);
    }
  }
  onMultiplayerGameListComplete(_data) {
    if (this.joinGameName == "") {
      return;
    }
    Automation.log("GameListComplete. GameName=" + this.joinGameName + "Not Found. Refreshing games list...");
    Network.refreshGameList();
  }
}
const automationTestPlayGameHandler = new AutomationTestPlayGame();
automationTestPlayGameHandler.register();
Automation.setScriptHasLoaded("automation-test-multiplayer-join");
//# sourceMappingURL=automation-test-multiplayer-join.js.map
