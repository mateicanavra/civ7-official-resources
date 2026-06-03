class FxsDecorativeFrame extends Component {
  onInitialize() {
    super.onInitialize();
    const border = document.createElement("div");
    border.classList.add("fxs-decorative-frame__border");
    this.Root.insertBefore(border, this.Root.firstChild);
  }
}
const FxsDecorativeFrameTagName = "fxs-decorative-frame";
Controls.define(FxsDecorativeFrameTagName, {
  createInstance: FxsDecorativeFrame
});

export { FxsDecorativeFrame };
//# sourceMappingURL=fxs-decorative-frame.js.map
