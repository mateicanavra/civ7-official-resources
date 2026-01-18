import { A as AutomationBasePlayGame } from './automation-base-play-game.chunk.js';
import { S as Shared_OnAutomationEvent, P as PassTest, F as FailTest, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-test-transition.ts");
class AutomationTestTransition extends AutomationBasePlayGame {
  //Listener for the script itself. Listens for Automation-Test-Transition to be called so that the Event Handler can begin with onAutomationEvent and facilitate the test.
  automationTestTransitionListener = (command) => {
    this.onAutomationEvent(command);
  };
  //Listener for age transition. Listens for GameAgeEnded to call the transitionSave() method.
  autoPlayAgeTransitionListener = () => {
    this.transitionSave();
  };
  register() {
    engine.on("Automation-Test-Transition", this.automationTestTransitionListener);
  }
  onAutomationEvent(command, ...args) {
    Shared_OnAutomationEvent(args);
    if (command === "Run") {
      this.run();
    } else if (command == "PostGameInitialization") {
      this.autoListen();
      this.postGameInitialization(args);
    } else if (command == "GameStarted") {
      Automation.log("GameStart");
      this.gameStarted();
    } else if (command == "Stop") {
      this.quitApplication();
      this.stop();
    }
  }
  //Get the Autosave From X Turns before Transition
  transitionSave() {
    Automation.log("Transition Save Process Started");
    if (Game.turn != null) {
      Automation.copyAutosave(Game.turn - 3, "AutomationTransitionSave.Civ7Save");
      PassTest("");
    } else {
      console.log("Game.turn = " + Game.turn);
      FailTest("");
    }
    Automation.log("Transition Save Process Ended");
  }
  autoListen() {
    engine.on("GameAgeEnded", this.autoPlayAgeTransitionListener);
  }
  quitApplication() {
    Automation.log("Quitting Through quitApplication");
    if (UI.isInGame()) {
      Automation.log("Still in Game");
      engine.call("exitToMainMenu");
    }
    Automation.sendTestComplete("QuitGame");
    Automation.setLocalParameter("QuitApp", true);
    Automation.sendTestComplete("QuitApp");
    engine.call("exitToDesktop");
    Automation.log("Quit Complete");
  }
  stop() {
    engine.off("GameAgeEnded", this.autoPlayAgeTransitionListener);
    RestoreUserConfigOptions();
  }
}
const AutomationTestTransitionHandler = new AutomationTestTransition();
AutomationTestTransitionHandler.register();
Automation.setScriptHasLoaded("automation-test-transition");
//# sourceMappingURL=automation-test-transition.js.map
