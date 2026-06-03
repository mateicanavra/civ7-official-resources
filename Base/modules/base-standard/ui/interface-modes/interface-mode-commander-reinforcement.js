import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { ReinforcementMapDecorationSupport } from './support-reinforcement-map-decoration.js';

class CommanderReinforcementInterfaceMode {
  transitionTo(_oldMode, _newMode) {
  }
  static updateDisplay(unitID, path) {
    if (ComponentID.isValid(unitID) && path) {
      ReinforcementMapDecorationSupport.manager.updateVisualization(path);
    } else {
      console.error("Failed find a unit or path in CommanderReinforcementInterfaceMode.updateDisplay().");
    }
  }
  transitionFrom(_oldMode, _newMode) {
    ReinforcementMapDecorationSupport.manager.deactivate();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_COMMANDER_REINFORCEMENT", new CommanderReinforcementInterfaceMode());

export { CommanderReinforcementInterfaceMode };
//# sourceMappingURL=interface-mode-commander-reinforcement.js.map
