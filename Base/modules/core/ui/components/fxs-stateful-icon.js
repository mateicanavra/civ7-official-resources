import '../stateful-icon/index.js';
import { FromElement } from '../stateful-icon/stateful-icon.js';

class FxsStatefulIcon extends Component {
  controller;
  constructor(root) {
    super(root);
    const [, controller] = FromElement(root, true);
    this.controller = controller;
  }
  onInitialize() {
    this.Root.classList.add("flex", "items-center");
    for (const iconElement of Object.values(this.controller.elements)) {
      iconElement.classList.add("flex-initial", "max-h-full", "max-w-full", "size-full");
    }
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-state":
        if (this.controller.isValidState(newValue)) {
          this.controller.state = newValue;
        }
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
}
Controls.define("fxs-stateful-icon", {
  createInstance: FxsStatefulIcon,
  attributes: [
    {
      name: "data-state"
    }
  ]
});

export { FxsStatefulIcon };
//# sourceMappingURL=fxs-stateful-icon.js.map
