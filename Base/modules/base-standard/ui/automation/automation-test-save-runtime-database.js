import { S as Shared_OnAutomationEvent, A as ApplyCommonNewGameParametersToConfiguration, R as ReadUserConfigOptions, b as RestoreUserConfigOptions } from './automation-test-support.chunk.js';

console.log("loading automation-test-save-runtime-database.ts");
class AutomationTestSaveRuntimeDatabase {
  automationTestSaveRuntimeDatabaseListener = (command, ...args) => {
    this.onAutomationEvent(command, args);
  };
  register() {
    engine.on("Automation-Test-SaveRuntimeDatabase", this.automationTestSaveRuntimeDatabaseListener);
  }
  onAutomationEvent(command, ..._args) {
    Shared_OnAutomationEvent(_args);
    if (command === "Run") {
      this.run();
    } else if (command == "Stop") {
      this.stop();
    }
  }
  // Start the game
  run() {
    Automation.log("SaveRuntimeDatabase - run()");
    if (UI.isInShell() == false) {
      Automation.log("Not in shell!");
      Automation.sendTestComplete();
      return;
    }
    Configuration.editGame().reset();
    ApplyCommonNewGameParametersToConfiguration();
    ReadUserConfigOptions();
    Network.prepareConfigurationForHosting(ServerType.SERVER_TYPE_NONE);
    Modding.applyConfiguration();
    Automation.sendTestComplete();
  }
  // Stop handler for "PlayGame"
  stop() {
    Automation.log("PlayGame - stop()");
    RestoreUserConfigOptions();
  }
}
const automationTestSaveRuntimeDatabase = new AutomationTestSaveRuntimeDatabase();
automationTestSaveRuntimeDatabase.register();
Automation.setScriptHasLoaded("automation-test-save-runtime-database");
//# sourceMappingURL=automation-test-save-runtime-database.js.map
