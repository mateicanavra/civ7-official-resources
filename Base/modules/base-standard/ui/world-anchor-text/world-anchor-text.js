import { P as PlotCoord } from '../../../core/ui/utilities/utilities-plotcoord.chunk.js';
import WorldAnchorTextManager from './world-anchor-text-manager.js';

const styles = "fs://game/base-standard/ui/world-anchor-text/world-anchor-text.css";

class AnchorText extends Component {
  static ANCHOR_OFFSET = { x: 0, y: 0, z: 8 };
  _worldAnchorHandle = null;
  trackingID = -1;
  animationEndListener = this.onAnimationEnd.bind(this);
  getID() {
    return this.trackingID;
  }
  setID(newid) {
    this.trackingID = newid;
  }
  onAttach() {
    super.onAttach();
    const id = this.Root.getAttribute("data-anchor-text-xy");
    const location = PlotCoord.fromString(id);
    const msg = this.Root.getAttribute("data-anchor-text-msg");
    if (!msg) {
      console.error(`AnchorText: No message set on attach. id: ${id}`);
      this.Destroy();
      return;
    }
    const textDiv = document.createElement("div");
    textDiv.classList.add(
      "world-anchor-text",
      "flex",
      "flex-nowrap",
      "font-body",
      "text-lg",
      "text-accent-1",
      "opacity-0",
      "text-shadow"
    );
    const SECONDS_TO_DELAY_PER_MESSAGE = 6;
    const delay = (parseInt(this.Root.getAttribute("data-anchor-text-delay") ?? "0") * SECONDS_TO_DELAY_PER_MESSAGE).toString() + "s";
    textDiv.style.animationDelay = delay;
    textDiv.addEventListener("animationend", this.animationEndListener);
    textDiv.setAttribute("data-l10n-id", msg);
    this.Root.appendChild(textDiv);
    this.makeWorldAnchor(location);
    const manager = WorldAnchorTextManager.instance;
    manager.addChildForTracking(this);
  }
  onDetach() {
    this.destroyWorldAnchor();
    const manager = WorldAnchorTextManager.instance;
    manager.removeChildFromTracking(this);
    this.Root.innerHTML = "";
    super.onDetach();
  }
  onAnimationEnd() {
    const nameDiv = this.Root.querySelector(".world-anchor-text");
    if (nameDiv) {
      nameDiv.removeEventListener("animationend", this.animationEndListener);
    } else {
      console.error("AnchorText: onAnimationEnd(): Missing nameDiv with '.world-anchor-text'");
    }
    this.Destroy();
  }
  makeWorldAnchor(location) {
    this._worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, AnchorText.ANCHOR_OFFSET);
    if (this._worldAnchorHandle !== null && this._worldAnchorHandle >= 0) {
      this.Root.setAttribute(
        "data-bind-style-transform2d",
        `{{FixedWorldAnchors.offsetTransforms[${this._worldAnchorHandle}].value}}`
      );
      this.Root.setAttribute(
        "data-bind-style-opacity",
        `{{FixedWorldAnchors.visibleValues[${this._worldAnchorHandle}]}}`
      );
    } else {
      console.error(`Failed to create world anchor for location`, location);
    }
  }
  destroyWorldAnchor() {
    if (!this._worldAnchorHandle) {
      return;
    }
    this.Root.removeAttribute("data-bind-style-transform2d");
    this.Root.removeAttribute("data-bind-style-opacity");
    WorldAnchors.UnregisterFixedWorldAnchor(this._worldAnchorHandle);
    this._worldAnchorHandle = null;
  }
}
Controls.define("world-anchor-text", {
  createInstance: AnchorText,
  description: "World Anchor Text",
  classNames: ["absolute", "flex", "justify-center", "items-center", "font-body-base", "flex-nowrap"],
  styles: [styles]
});

export { AnchorText };
//# sourceMappingURL=world-anchor-text.js.map
