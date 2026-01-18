import ContextManager from '../context-manager/context-manager.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';
import { U as UpdateGate } from '../utilities/utilities-update-gate.chunk.js';
import { V as ViewManager } from '../views/view-manager.chunk.js';
import { TutorialLevel } from '../../../base-standard/ui/tutorial/tutorial-item.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../input/focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../panel-support.chunk.js';

class RadialMenuModel {
  canUseRadialMenu = false;
  engineInputListener = this.onEngineInput.bind(this);
  interfaceModeChangedListener = this.onInterfaceModeChanged.bind(this);
  onUpdate;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  /**
   * Does the player have at least one city?
   * @returns true if player has 1 or more cities, false otherwise
   */
  isAtLeastOneCity() {
    const player = Players.get(GameContext.localObserverID);
    if (!player) {
      if (!Autoplay.isActive) {
        console.error("model-radial-menu: isAtLeastOneCity(): No local player available.");
      }
      return true;
    }
    const cities = player.Cities?.getCities();
    if (!cities) {
      console.error("model-radial-menu: isAtLeastOneCity(): No cities available for local player.");
      return true;
    }
    return cities.length > 0;
  }
  isTutorialDisabled() {
    return Configuration.getUser().tutorialLevel <= TutorialLevel.WarningsOnly;
  }
  constructor() {
    window.addEventListener(InputEngineEventName, this.engineInputListener);
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    engine.on("update-tutorial-level", this.onUpdateTutorialLevel, this);
    engine.on("CityInitialized", this.onCityInitialized, this);
    this.updateGate.call("init");
  }
  update() {
    this.canUseRadialMenu = this.isAtLeastOneCity() || this.isTutorialDisabled();
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  onEngineInput(inputEvent) {
    if (!this.handleEngineInput(inputEvent)) {
      inputEvent.preventDefault();
      inputEvent.stopImmediatePropagation();
    }
  }
  onCityInitialized() {
    this.updateGate.call("onCityInitialized");
  }
  onUpdateTutorialLevel() {
    this.updateGate.call("onUpdateTutorialLevel");
  }
  onInterfaceModeChanged() {
    if ((!ViewManager.isRadialSelectionAllowed || !this.canUseRadialMenu) && ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (!ViewManager.isRadialSelectionAllowed || !ContextManager.isEmpty || !this.canUseRadialMenu) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "toggle-radial-menu":
        ContextManager.push("panel-radial-menu", { singleton: true, createMouseGuard: true });
        return false;
      default:
        break;
    }
    return true;
  }
}
const RadialMenu = new RadialMenuModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(RadialMenu);
  };
  engine.createJSModel("g_RadialMenu", RadialMenu);
  RadialMenu.updateCallback = updateModel;
  engine.synchronizeModels();
});

export { RadialMenu as default };
//# sourceMappingURL=model-radial-menu.js.map
