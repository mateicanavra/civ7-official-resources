import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';
import { S as Shared_OnAutomationEvent, G as GetCurrentTestObserver, F as FailTest, P as PassTest } from './automation-test-support.chunk.js';

console.log("loading automation-test-production.ts");
class AutomationTestProduction extends AutomationBasePlayGame {
  observer = -1;
  produceTag = -1;
  automationTestProductionListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-Production", this.automationTestProductionListener);
    engine.on("PlayerTurnActivated", (data) => {
      this.onPlayerTurnActivated(data);
    });
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      this.run();
    } else if (command == "PostGameInitialization") {
      this.initializeAiBuildingQueue();
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      this.gameStarted();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  initializeAiBuildingQueue() {
    Automation.log("initializeAiBuildingQueue");
    this.observer = GetCurrentTestObserver();
    Automation.log("Observed player: " + this.observer);
    if (this.observer != PlayerIds.NO_PLAYER) {
      const capital = Players.Cities.get(this.observer)?.getCapital();
      let location = null;
      if (capital) {
        location = capital.location;
      } else {
        FailTest("Player doesn't have a capital city???");
        return;
      }
      Automation.log("Capital location: " + JSON.stringify(location));
      const unit = Automation.getParameter("CurrentTest", "Unit");
      const constructible = Automation.getParameter("CurrentTest", "Constructible");
      if (unit !== null) {
        const hash = Database.makeHash(unit);
        Automation.log("Hash for " + unit + ": " + hash.valueOf());
        this.produceTag = Players.AI.get(this.observer)?.requestUnit(hash.valueOf(), location, 1e5);
      } else if (constructible !== null) {
        const hash = Database.makeHash(constructible);
        Automation.log("Hash for " + constructible + ": " + hash.valueOf());
        Automation.log("Id for capital: " + JSON.stringify(capital.id));
        this.produceTag = Players.AI.get(this.observer)?.requestConstructible(
          hash.valueOf(),
          capital.id,
          location,
          1e5
        );
      } else {
        FailTest("No Unit or Constructible set in test");
        return;
      }
      Automation.log("Produce tag: " + this.produceTag);
      if (this.produceTag == null) {
        FailTest("Unable to get observer player object");
      } else if (this.produceTag == -1) {
        FailTest("Request made for an invalid unit type");
      }
    } else {
      FailTest("No observer player to initialize building queue for");
    }
  }
  onPlayerTurnActivated(data) {
    if (data.player === this.observer && this.produceTag != null && this.produceTag != -1) {
      const player = Players.AI.get(this.observer);
      if (player != null) {
        if (player.isRequestFulfilled(this.produceTag)) {
          PassTest();
        } else if (!player.isRequestStillValid(this.produceTag)) {
          FailTest("Building request no longer valid");
        }
      }
    }
  }
  stop() {
    super.stop();
    this.observer = PlayerIds.NO_PLAYER;
    this.produceTag = -1;
  }
}
const automationTestProductionHandler = new AutomationTestProduction();
automationTestProductionHandler.register();
Automation.setScriptHasLoaded("automation-test-production");
//# sourceMappingURL=automation-test-production.js.map
