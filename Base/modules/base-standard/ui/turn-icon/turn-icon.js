const content = "<div class=\"turn-hex-line\"></div>\r\n<div class=\"turn-hex-bg\"></div>\r\n<div class=\"turn-img\"></div>\r\n<div class=\"turn-display\"></div>\r\n";

const styles = "fs://game/base-standard/ui/turn-icon/turn-icon.css";

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
