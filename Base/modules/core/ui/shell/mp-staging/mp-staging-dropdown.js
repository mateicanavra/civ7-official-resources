import { IconDropdown } from '../shell-components/icon-dropdown.js';
import '../../components/fxs-dropdown.chunk.js';
import '../../audio-base/audio-support.chunk.js';
import '../../components/fxs-activatable.chunk.js';
import '../../input/focus-manager.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../panel-support.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../input/focus-support.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../context-manager/context-manager.js';
import '../../context-manager/display-queue-manager.js';
import '../../dialog-box/manager-dialog-box.chunk.js';
import '../../utilities/utilities-dom.chunk.js';

class MPStagingDropdown extends IconDropdown {
  hideArrowElement = true;
  onAttributeChanged(name, oldValue, newValue) {
    super.onAttributeChanged(name, oldValue, newValue);
    switch (name) {
      case "disabled":
        this.hideArrowElement = newValue == "true";
        super.updateOpenArrowElement();
        break;
    }
  }
  isArrowElementVisibile() {
    return !this.hideArrowElement && super.isArrowElementVisibile();
  }
}
Controls.define("lobby-dropdown", {
  createInstance: MPStagingDropdown,
  description: "a dropdown specific to the staging screen.",
  tabIndex: -1,
  attributes: [
    {
      name: "dropdown-items",
      description: "The list of items to display in the dropdown."
    },
    {
      name: "selected-item-index",
      description: "The index of the selected item."
    },
    {
      name: "no-selection-caption",
      description: "The text label of the button when there is no valid selection."
    },
    {
      name: "selection-caption",
      description: "The text label of the button that is added at the beginning when there is a valid selection."
    },
    {
      name: "has-border",
      description: "Whether or not the field have a border style (default: 'true')"
    },
    {
      name: "has-background",
      description: "Whether or not the field have a background (default: 'true')"
    },
    {
      name: "container-class"
    },
    {
      name: "bg-class"
    },
    {
      name: "disabled",
      description: "Whether the dropdown is disabled."
    },
    {
      name: "action-key",
      description: "The action key for inline nav help, usually translated to a button icon."
    },
    {
      name: "show-label-on-selected-item",
      description: "Show the label next to the icon on the selected item of the dropdown."
    },
    {
      name: "icon-container-innerhtml"
    }
  ]
});

export { MPStagingDropdown };
//# sourceMappingURL=mp-staging-dropdown.js.map
