import content from './turn-icon.html.js';
import styles from './turn-icon.scss.js';

class TurnIcon extends Component {
  constructor(root) {
    super(root);
  }
  onUpdate() {
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    if (name == "turns") {
      this.refreshTurns();
    }
  }
  refreshTurns() {
  }
}
Controls.define("turn-icon", {
  createInstance: TurnIcon,
  description: "Standardized icon/number for indicating how many turns something will take",
  classNames: ["turn-icon"],
  styles: [styles],
  innerHTML: [content],
  attributes: [
    {
      name: "turns",
      required: true
    }
  ]
});
//# sourceMappingURL=turn-icon.js.map
