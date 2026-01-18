import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { P as PlotCoord } from '../../../core/ui/utilities/utilities-plotcoord.chunk.js';
import DistrictHealthManager from './district-health-manager.js';

const styles = "fs://game/base-standard/ui/district/district-health.css";

const DISTRICT_BANNER_OFFSET = { x: -30, y: 15, z: 8 };
const CITY_CENTER_BANNER_OFFSET = { x: -20, y: 25, z: 8 };
class DistrictHealthBar extends Component {
  _componentID = ComponentID.getInvalidID();
  _worldAnchorHandle = null;
  progressBar = null;
  progressInk = null;
  civHexInner = null;
  civHexOuter = null;
  hslot = null;
  isCityCenter = false;
  MEDIUM_HEALTH_THRESHHOLD = 0.75;
  // thresholds for health bar color changes
  LOW_HEALTH_THRESHHOLD = 0.5;
  onAttach() {
    super.onAttach();
    const position = this.Root.getAttribute("data-district-location");
    const healthValue = this.Root.getAttribute("data-district-health");
    const id = this.Root.getAttribute("data-district-id");
    const isVisible = this.Root.getAttribute("data-district-fow") === "false";
    this._componentID = ComponentID.fromString(id);
    const location = PlotCoord.fromString(position);
    const player = Players.get(this.componentID.owner);
    if (!player) {
      console.error(
        `district-health.ts: Couldn't find district with ComponentID ${ComponentID.toLogString(this.componentID)}`
      );
      return;
    }
    const districtId = MapCities.getDistrict(location.x, location.y);
    if (!districtId) {
      console.error(`district-health: couldn't find district ID at hex (${location.x}, ${location.y})`);
      return;
    }
    const district = Districts.get(districtId);
    if (!district || !ComponentID.isValid(districtId)) {
      console.error(`district-health: couldn't find any district with the given id: ${districtId}`);
      return;
    }
    this.isCityCenter = district.type == DistrictTypes.CITY_CENTER;
    this.hslot = document.createElement("fxs-hslot");
    this.hslot.classList.add("district-health-hslot", "w-full", "h-9", "allow-pan");
    this.civHexOuter = document.createElement("div");
    this.civHexOuter.classList.add("bg-contain", "bg-center", "bg-no-repeat", "relative", "w-9", "h-9");
    this.civHexOuter.style.backgroundImage = "url('blp:city_hex_base')";
    this.civHexOuter.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(
      this.componentID.owner
    );
    this.civHexInner = document.createElement("div");
    this.civHexInner.classList.add("bg-contain", "bg-center", "bg-no-repeat", "absolute", "inset-1");
    this.civHexInner.style.backgroundImage = "url('blp:city_hex_base')";
    this.civHexInner.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(this.componentID.owner);
    this.civHexOuter.appendChild(this.civHexInner);
    const civIcon = document.createElement("div");
    const iconCSS = Icon.getCivSymbolCSSFromCivilizationType(player.civilizationType);
    civIcon.classList.add(
      "district-health_civ-icon",
      "absolute",
      "inset-2",
      "bg-contain",
      "bg-center",
      "bg-no-repeat"
    );
    civIcon.style.backgroundImage = iconCSS;
    civIcon.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);
    this.civHexOuter.appendChild(civIcon);
    this.hslot.appendChild(this.civHexOuter);
    this.progressBar = document.createElement("div");
    this.progressBar.classList.add("district-health-bar", "relative", "self-center");
    this.progressBar.setAttribute("value", healthValue);
    this.progressInk = document.createElement("div");
    this.progressInk.classList.add("district-health-bar-ink", "absolute", "inset-1");
    const healthAmt = parseFloat(healthValue);
    this.progressInk.style.widthPERCENT = healthAmt * 100;
    if (healthAmt <= this.MEDIUM_HEALTH_THRESHHOLD) {
      if (healthAmt <= this.LOW_HEALTH_THRESHHOLD) {
        this.progressInk.classList.add("district-health-low");
      } else {
        this.progressInk.classList.add("district-health-med");
      }
    }
    this.setVisibility(isVisible);
    this.progressBar.appendChild(this.progressInk);
    this.hslot.appendChild(this.progressBar);
    this.Root.appendChild(this.hslot);
    this.makeWorldAnchor(location);
    const manager = DistrictHealthManager.instance;
    manager.addChildForTracking(this);
  }
  onDetach() {
    this.cleanup();
    super.onDetach();
  }
  cleanup() {
    this.destroyWorldAnchor();
    const manager = DistrictHealthManager.instance;
    manager.removeChildFromTracking(this);
  }
  makeWorldAnchor(location) {
    this.destroyWorldAnchor();
    let worldAnchorHandle = null;
    if (this.isCityCenter) {
      worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, CITY_CENTER_BANNER_OFFSET);
    } else {
      worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(location, DISTRICT_BANNER_OFFSET);
    }
    if (worldAnchorHandle !== null && worldAnchorHandle >= 0) {
      this.Root.setAttribute(
        "data-bind-style-transform2d",
        `{{FixedWorldAnchors.offsetTransforms[${worldAnchorHandle}].value}}`
      );
      this.Root.setAttribute(
        "data-bind-style-opacity",
        `{{FixedWorldAnchors.visibleValues[${worldAnchorHandle}]}}`
      );
    } else {
      console.error(
        `Failed to create WorldAnchorHandle for DistrictHealthBar, District id: ${ComponentID.toLogString(this._componentID)}`
      );
    }
  }
  destroyWorldAnchor() {
    if (this._worldAnchorHandle) {
      this.Root.removeAttribute("data-bind-style-transform2d");
      this.Root.removeAttribute("data-bind-style-opacity");
      WorldAnchors.UnregisterUnitAnchor(this._worldAnchorHandle);
    }
    this._worldAnchorHandle = null;
  }
  setContested(_isContested, controllingPlayer) {
    const player = Players.get(controllingPlayer);
    if (player) {
      if (this.civHexOuter && this.civHexInner) {
        const civIcon = MustGetElement(".district-health_civ-icon", this.civHexOuter);
        const iconCSS = Icon.getCivSymbolCSSFromCivilizationType(player.civilizationType);
        civIcon.style.backgroundImage = iconCSS;
        civIcon.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(controllingPlayer);
        this.civHexInner.style.fxsBackgroundImageTint = UI.Player.getPrimaryColorValueAsString(controllingPlayer);
        this.civHexOuter.style.fxsBackgroundImageTint = UI.Player.getSecondaryColorValueAsString(controllingPlayer);
      }
    } else {
      console.warn(`district-health: couldn't find player ID ${controllingPlayer} in setContested()`);
    }
  }
  // Make the health bar transparent if a district is not visible.
  setVisibility(isVisible) {
    if (this.hslot) {
      if (isVisible) {
        this.hslot.classList.remove("district-health-fow");
      } else {
        this.hslot.classList.add("district-health-fow");
      }
    }
  }
  updateDistrictHealth(value) {
    if (this.progressBar && this.progressInk) {
      const healthAmt = parseFloat(value);
      this.progressInk.style.widthPERCENT = healthAmt * 100;
      this.progressInk.classList.remove("district-health-med");
      this.progressInk.classList.remove("district-health-low");
      if (healthAmt <= this.MEDIUM_HEALTH_THRESHHOLD) {
        if (healthAmt <= this.LOW_HEALTH_THRESHHOLD) {
          this.progressInk.classList.add("district-health-low");
        } else {
          this.progressInk.classList.add("district-health-med");
        }
      }
    }
  }
  get componentID() {
    return this._componentID;
  }
}
Controls.define("district-health-bar", {
  createInstance: DistrictHealthBar,
  description: "District Health Bar",
  classNames: ["district-health-container"],
  styles: [styles]
});

export { DistrictHealthBar };
//# sourceMappingURL=district-health.js.map
