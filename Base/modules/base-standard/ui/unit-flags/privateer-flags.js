import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { s as styles, UnitFlagFactory } from './unit-flag-manager.js';
import { GenericUnitFlag } from './unit-flags.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';

class PrivateerFlagMaker {
  initialize() {
  }
  isMatch(unit, _unitDefinition, _others) {
    return unit.isPrivateer;
  }
  getComponentName() {
    return "privateer-flag";
  }
}
class PrivateerFlag extends GenericUnitFlag {
  kind = "privateerinterface";
  privateerContainer;
  onAttach() {
    super.onAttach();
    this.privateerContainer = document.createElement("div");
    this.privateerContainer.classList.add("unit-flag__privateer-container", "absolute", "h-4", "w-4");
    const unitFlagPrivateerIcon = document.createElement("div");
    unitFlagPrivateerIcon.classList.add(
      "unit-flag__privateer",
      "bg-contain",
      "bg-no-repeat",
      "absolute",
      "inset-0"
    );
    this.privateerContainer.appendChild(unitFlagPrivateerIcon);
    const unitFlagContainer = MustGetElement(".unit-flag__container", this.Root);
    unitFlagContainer.appendChild(this.privateerContainer);
    this.updateHealth();
  }
  updateHealth() {
    super.updateHealth();
    if (this.privateerContainer != void 0 && this.unit.Health) {
      this.privateerContainer.classList.toggle("-top-5", this.unit.Health.damage > 0);
      this.privateerContainer.classList.toggle("-top-1", this.unit.Health.damage == 0);
    }
  }
}
Controls.define("privateer-flag", {
  createInstance: PrivateerFlag,
  description: "Privateer Unit Flag",
  classNames: ["unit-flag", "allowCameraMovement"],
  styles: [styles]
});
UnitFlagFactory.registerStyle(new PrivateerFlagMaker());
//# sourceMappingURL=privateer-flags.js.map
