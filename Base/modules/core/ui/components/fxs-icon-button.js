import { FxsActivatable } from './fxs-activatable.js';
import '../stateful-icon/index.js';
import { FromElement, IconState } from '../stateful-icon/stateful-icon.js';

class FxsIconButton extends FxsActivatable {
  controller;
  constructor(root) {
    super(root);
    const [, controller] = FromElement(root);
    this.controller = controller;
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "disabled":
        super.onAttributeChanged(name, oldValue, newValue);
        this.controller.disabled = this.disabled;
        break;
      case "data-state":
        if (newValue && this.controller.isValidState(newValue)) {
          this.controller.state = newValue;
          if (newValue === IconState.Disabled) {
            super.onAttributeChanged("disabled", this.Root.getAttribute("disabled"), "true");
          }
        }
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
}
Controls.define("fxs-icon-button", {
  createInstance: FxsIconButton,
  attributes: [
    {
      name: "caption"
    },
    {
      name: "action-key"
    },
    {
      name: "disabled"
    },
    {
      name: "data-state"
    }
  ]
});

export { FxsIconButton };
//# sourceMappingURL=fxs-icon-button.js.map
