class FxsIcon extends Component {
  renderQueued = false;
  constructor(root) {
    super(root);
  }
  onAttach() {
    super.onAttach();
    this.render();
  }
  onDetach() {
    super.onDetach();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (_oldValue != newValue) {
      if (name == "data-icon-id" || name == "data-icon-context" || name == "data-icon-size") {
        if (!this.renderQueued) {
          this.renderQueued = true;
          queueMicrotask(this.render.bind(this));
        }
      }
    }
  }
  render() {
    this.renderQueued = false;
    const id = this.Root.getAttribute("data-icon-id");
    const context = this.Root.getAttribute("data-icon-context");
    if (id) {
      const iconUrl = UI.getIconCSS(id, context ? context : void 0);
      this.Root.style.backgroundImage = iconUrl;
    }
  }
}
Controls.define("fxs-icon", {
  createInstance: FxsIcon,
  description: "An icon primitive",
  skipPostOnAttach: true,
  classNames: ["fxs-icon", "icon"],
  attributes: [
    {
      name: "data-icon-id",
      description: "The id of the icon to display."
    },
    {
      name: "data-icon-context",
      description: "A ui-specific context field to determine which type of icon should be shown."
    },
    {
      name: "data-icon-size",
      description: "An optional size field hinting which size the image should be."
    }
  ]
});

export { FxsIcon as F };
//# sourceMappingURL=fxs-icon.chunk.js.map
