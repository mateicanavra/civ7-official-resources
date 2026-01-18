import { F as FxsActivatable } from '../components/fxs-activatable.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../input/focus-manager.js';
import '../framework.chunk.js';

const content = "<div class=\"card__bg\"></div>\r\n<div class=\"card__frame\"></div>\r\n<div class=\"card-selection\">\r\n\t<div class=\"card__bg--highlight\"></div>\r\n\t<div class=\"card-selection__frame\">\r\n\t\t<div class=\"card-selection__frame-top\"></div>\r\n\t\t<div class=\"card-selection__frame-bottom\"></div>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/core/ui/save-load/save-load-card.css";

const ActionConfirmEventName = "action-confirm";
class ActionConfirmEvent extends CustomEvent {
  constructor() {
    super("action-confirm", { bubbles: true, cancelable: true });
  }
}
class SaveLoadCard extends FxsActivatable {
  handleDoubleClick = this.onDoubleClick.bind(this);
  handleFocusIn = this.onFocusIn.bind(this);
  onAttach() {
    super.onAttach();
    this.Root.ondblclick = this.handleDoubleClick;
    this.Root.addEventListener("focusin", this.handleFocusIn);
  }
  onDoubleClick() {
    this.Root.dispatchEvent(new ActionConfirmEvent());
  }
  onFocusIn(_event) {
    this.Root.dispatchEvent(new FocusEvent("focus"));
  }
}
Controls.define("save-load-card", {
  createInstance: SaveLoadCard,
  styles: [styles],
  innerHTML: [content]
});

export { ActionConfirmEvent, ActionConfirmEventName };
//# sourceMappingURL=save-load-card.js.map
