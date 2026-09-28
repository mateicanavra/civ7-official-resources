import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';

class TutorialStartInterfaceMode {
  /** Handle a transition from a different mode to the currently registered mode. */
  transitionTo(_oldMode, _newMode) {
  }
  /** Handle a transition going from the currently registered interface mode to a different mode. */
  transitionFrom(_oldMode, _newMode) {
  }
}
InterfaceMode.addHandler("INTERFACEMODE_TUTORIAL_START", new TutorialStartInterfaceMode());
//# sourceMappingURL=interface-mode-tutorial-start.js.map
