import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { F as FocusedAttackBaseInterfaceMode } from './interface-mode-focused-attack-base.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import './interface-mode-choose-plot.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../utilities/utilities-overlay.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import './support-unit-map-decoration.chunk.js';

class FocusedAttackSeaRangedInterfaceMode extends FocusedAttackBaseInterfaceMode {
  initialize() {
    this.commandName = "UNITCOMMAND_FOCUSED_ATTACK_SEA_RANGED";
    return super.initialize();
  }
}
InterfaceMode.addHandler("INTERFACEMODE_FOCUSED_ATTACK_SEA_RANGED", new FocusedAttackSeaRangedInterfaceMode());
//# sourceMappingURL=interface-mode-focused-attack-sea-ranged.js.map
