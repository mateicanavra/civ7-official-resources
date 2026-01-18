const content = "<div class=\"hex-bord-piece\"></div>\r\n<div class=\"hex-bord-piece hex-2\"></div>\r\n<div class=\"hex-bord-piece hex-3\"></div>\r\n";

const styles = "fs://game/core/ui/parts/hex-border/hex-border.css";

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
