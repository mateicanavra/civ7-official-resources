import content from './hex-border.html.js';
import styles from './hex-border.scss.js';

class HexBorder extends Component {
}
Controls.define("hex-bord", {
  createInstance: HexBorder,
  description: "Hex Border",
  classNames: ["hex-bord"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=hex-border.js.map
