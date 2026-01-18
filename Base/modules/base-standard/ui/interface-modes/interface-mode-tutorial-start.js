import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

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
