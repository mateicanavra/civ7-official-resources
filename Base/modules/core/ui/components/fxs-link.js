import { FxsActivatable, ActionActivateEventName } from './fxs-activatable.js';

class FxsLink extends FxsActivatable {
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(ActionActivateEventName, () => {
      const key = this.Root.getAttribute("url");
      if (key) {
        Network.openURLFromType(URLType[key]);
      }
    });
  }
}
Controls.define("fxs-link", {
  createInstance: FxsLink,
  description: "An hyperlink",
  attributes: [
    {
      name: "url",
      description: "the predefined possible url"
    }
  ]
});

export { FxsLink };
//# sourceMappingURL=fxs-link.js.map
