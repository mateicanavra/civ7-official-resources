import { FxsActivatable } from '../components/fxs-activatable.js';
import content from './save-load-card.html.js';
import styles from './save-load-card.scss.js';

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
