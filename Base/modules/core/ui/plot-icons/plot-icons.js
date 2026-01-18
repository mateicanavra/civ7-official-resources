import PlotIconsManager from './plot-icons-manager.js';

const styles = "fs://game/core/ui/plot-icons/plot-icons.css";

var IconAnimationState = /* @__PURE__ */ ((IconAnimationState2) => {
  IconAnimationState2[IconAnimationState2["NONE"] = 0] = "NONE";
  IconAnimationState2[IconAnimationState2["FIRST"] = 1] = "FIRST";
  IconAnimationState2[IconAnimationState2["FADE"] = 2] = "FADE";
  return IconAnimationState2;
})(IconAnimationState || {});
const PLOT_ICON_ANCHOR_OFFSET = { x: 0, y: 0, z: 10 };
class PlotIcons extends Component {
  worldAnchorHandle = null;
  location = { x: -1, y: -1 };
  onAttach() {
    super.onAttach();
    this.location = {
      x: parseInt(this.Root.getAttribute("x") ?? "-1"),
      y: parseInt(this.Root.getAttribute("y") ?? "-1")
    };
    if (PlotIconsManager) {
      PlotIconsManager.addStackForTracking(this);
    }
    this.makeWorldAnchor(this.location);
    const revealedState = GameplayMap.getRevealedState(
      GameContext.localPlayerID,
      this.location.x,
      this.location.y
    );
    this.setVisibility(revealedState);
    this.realizeScreenPosition();
    this.Root.classList.add("allow-pan");
  }
  onDetach() {
    this.destroyWorldAnchor();
    super.onDetach();
  }
  makeWorldAnchor(location) {
    if (this.worldAnchorHandle !== null) {
      this.destroyWorldAnchor();
    }
    this.worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, PLOT_ICON_ANCHOR_OFFSET);
    if (this.worldAnchorHandle !== null && this.worldAnchorHandle >= 0) {
      this.Root.setAttribute(
        "data-bind-style-transform2d",
        `{{FixedWorldAnchors.offsetTransforms[${this.worldAnchorHandle}].value}}`
      );
      this.Root.setAttribute(
        "data-bind-style-opacity",
        `{{FixedWorldAnchors.visibleValues[${this.worldAnchorHandle}]}}`
      );
    } else {
      console.error(`Failed to create world anchor.`);
    }
  }
  destroyWorldAnchor() {
    if (this.worldAnchorHandle !== null) {
      this.Root.removeAttribute("data-bind-style-transform2d");
      this.Root.removeAttribute("data-bind-style-opacity");
      WorldAnchors.UnregisterFixedWorldAnchor(this.worldAnchorHandle);
      this.worldAnchorHandle = null;
    }
  }
  realizeScreenPosition() {
  }
  setVisibility(revealedState) {
    this.Root.style.visibility = revealedState == RevealedStates.HIDDEN ? "hidden" : "";
    this.realizeScreenPosition();
  }
  show() {
    const revealedState = GameplayMap.getRevealedState(
      GameContext.localPlayerID,
      this.location.x,
      this.location.y
    );
    this.setVisibility(revealedState);
    this.realizeScreenPosition();
  }
  hide() {
    this.setVisibility(RevealedStates.HIDDEN);
    this.realizeScreenPosition();
  }
}
Controls.define("plot-icons", {
  createInstance: PlotIcons,
  description: "Plot Icons",
  styles: [styles],
  attributes: []
});

export { IconAnimationState, PlotIcons as default, styles as s };
//# sourceMappingURL=plot-icons.js.map
