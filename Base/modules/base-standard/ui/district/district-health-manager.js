import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { P as PlotCoord } from '../../../core/ui/utilities/utilities-plotcoord.chunk.js';

class DistrictHealthManager extends Component {
  children = /* @__PURE__ */ new Map();
  globalHideListener = this.onGlobalHide.bind(this);
  globalShowListener = this.onGlobalShow.bind(this);
  static _instance = null;
  static get instance() {
    return DistrictHealthManager._instance;
  }
  /**
   * Onetime callback on creation.
   */
  onInitialize() {
    if (DistrictHealthManager._instance == null) {
      DistrictHealthManager._instance = this;
    } else {
      console.error(
        "district-health-manager: Multiple district health managers are attempting to be created, but it's a singleton."
      );
    }
  }
  onAttach() {
    super.onAttach();
    this.createAllDistrictHealth();
    engine.on("DistrictAddedToMap", this.onDistrictAddedToMap, this);
    engine.on("DistrictRemovedFromMap", this.onDistrictRemovedFromMap, this);
    engine.on("DistrictDamageChanged", this.onDistrictDamageChanged, this);
    engine.on("CityTransfered", this.onCityTransfered, this);
    engine.on("DistrictControlChanged", this.onDistrictControlChanged, this);
    engine.on("PlotVisibilityChanged", this.onPlotVisibilityChanged, this);
    window.addEventListener("ui-hide-district-health-bars", this.globalHideListener);
    window.addEventListener("ui-show-district-health-bars", this.globalShowListener);
  }
  onDetach() {
    engine.off("DistrictAddedToMap", this.onDistrictAddedToMap, this);
    engine.off("DistrictRemovedFromMap", this.onDistrictRemovedFromMap, this);
    engine.off("DistrictDamageChanged", this.onDistrictDamageChanged, this);
    engine.off("CityTransfered", this.onCityTransfered, this);
    engine.off("DistrictControlChanged", this.onDistrictControlChanged, this);
    engine.off("PlotVisibilityChanged", this.onPlotVisibilityChanged, this);
    window.removeEventListener("ui-hide-district-health-bars", this.globalHideListener);
    window.removeEventListener("ui-show-district-health-bars", this.globalShowListener);
    super.onDetach();
  }
  onPlotVisibilityChanged(data) {
    const district = Districts.getAtLocation(data.location);
    if (!district) {
      return;
    }
    if (district.cityId) {
      const districtHealth = this.children.get(ComponentID.toBitfield(district.id));
      if (districtHealth) {
        districtHealth.setVisibility(!(data.visibility == RevealedStates.REVEALED));
      }
    }
  }
  createAllDistrictHealth() {
    const playerList = Players.getAlive();
    for (const player of playerList) {
      const playerDistricts = player.Districts;
      if (playerDistricts == void 0) {
        console.warn(
          "district-health-manager: Cannot make district health bars for player with misisng playerDistricts object: ",
          player.name
        );
        continue;
      }
      const districtIDs = playerDistricts.getDistrictIds();
      for (const districtID of districtIDs) {
        if (ComponentID.isInvalid(districtID)) {
          console.warn("district-health-manager: Invalid ComponentID for district. Player id: " + player.id);
          continue;
        }
        const district = Districts.get(districtID);
        if (!district) {
          console.warn("district-health-manager: District not found. id: ", districtID);
          continue;
        }
        this.createDistrictHealth(district.id, district.location);
      }
    }
  }
  createDistrictHealth(id, location) {
    const playerID = GameplayMap.getOwner(location.x, location.y);
    const playerDistricts = Players.Districts.get(playerID);
    const revealedState = GameplayMap.getRevealedState(
      GameContext.localPlayerID,
      location.x,
      location.y
    );
    if (revealedState == RevealedStates.HIDDEN) {
      return null;
    }
    if (!playerDistricts) {
      console.warn("district-health-manager: createDistrictHealth: No districts found for playerID: " + playerID);
      return null;
    }
    const currentHealth = playerDistricts.getDistrictHealth(location);
    const maxHealth = playerDistricts.getDistrictMaxHealth(location);
    const normalizedProgress = Math.min(1, currentHealth / maxHealth);
    if (!DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth)) {
      return null;
    }
    const districtHealth = document.createElement("district-health-bar");
    districtHealth.setAttribute("data-district-location", PlotCoord.toString(location));
    districtHealth.setAttribute("data-district-health", normalizedProgress.toString());
    districtHealth.setAttribute("data-district-id", ComponentID.toString(id));
    districtHealth.setAttribute("data-district-fow", (revealedState == RevealedStates.REVEALED).toString());
    this.Root.appendChild(districtHealth);
    return districtHealth;
  }
  /**
   * Called by an instance of DistrictHealth to register it with the manager
   * @param child Anchor text object
   */
  addChildForTracking(child) {
    const id = child.componentID ?? ComponentID.getInvalidID();
    if (ComponentID.isInvalid(id)) {
      console.error(
        "district-health-manager: Unable to connect a district health to the manager because the unit has an invalid componentID!"
      );
      return;
    }
    if (this.children.has(ComponentID.toBitfield(id))) {
      console.error(
        "district-health-manager: Attempt to add a district health to the manager for tracking but something (itself?) already is added with that id: " + ComponentID.toLogString(id)
      );
      return;
    }
    this.children.set(ComponentID.toBitfield(id), child);
  }
  /**
   * Called by an instance of DistrictHealth to unregister it with the manager
   * @param child Anchor text object
   */
  removeChildFromTracking(child) {
    const id = child.componentID;
    if (ComponentID.isInvalid(id)) {
      console.warn(
        "district-health-manager: Unable to remove a district health from the manager because the unit has an invalid componentID!"
      );
      return;
    }
    const bitfield = ComponentID.toBitfield(id);
    if (!this.children.has(bitfield)) {
      console.warn(
        "district-health-manager: Attempt to remove a district health from the manager for tracking but none exists with that id: " + ComponentID.toLogString(id)
      );
      return;
    }
    this.children.delete(bitfield);
  }
  onDistrictDamageChanged(data) {
    const district = this.children.get(ComponentID.toBitfield(data.id));
    if (district == void 0) {
      this.createDistrictHealth(data.id, data.location);
      return;
    }
    const location = data.location;
    const playerID = GameplayMap.getOwner(location.x, location.y);
    const playerDistricts = Players.Districts.get(playerID);
    const revealedState = GameplayMap.getRevealedState(
      GameContext.localPlayerID,
      location.x,
      location.y
    );
    if (revealedState != RevealedStates.VISIBLE) {
      return;
    }
    if (!playerDistricts) {
      console.warn(
        "district-health-manager: onDistrictDamageChanged: No districts found for playerID: " + playerID
      );
      return;
    }
    const currentHealth = playerDistricts.getDistrictHealth(location);
    const maxHealth = playerDistricts.getDistrictMaxHealth(location);
    const normalizedProgress = Math.min(1, currentHealth / maxHealth);
    if (currentHealth == maxHealth) {
      this.updateCity(data.cityID, false);
    } else {
      district.updateDistrictHealth(normalizedProgress.toString());
    }
  }
  onDistrictControlChanged(data) {
    this.updateCity(data.cityID, false);
  }
  onCityTransfered(data) {
    this.updateCity(data.cityID, true);
  }
  updateCity(cityID, isTransfer) {
    const city = Cities.get(cityID);
    if (city == null) {
      console.warn(
        `Unable to find the city(${ComponentID.toLogString(cityID)}) from DistrictControlChanged event`
      );
      return;
    }
    const districts = city.Districts;
    if (districts == void 0) {
      console.warn("Unable to find the districts from DistrictControlChanged event");
      return;
    }
    for (const districtID of districts.getIds()) {
      const district = Districts.get(districtID);
      if (district == null) {
        console.error(
          "null district building city info. cid: " + ComponentID.toLogString(cityID) + ",  districtID: " + ComponentID.toLogString(districtID)
        );
        continue;
      }
      const districtHealth = this.children.get(ComponentID.toBitfield(district.id));
      if (district.owner != district.controllingPlayer) {
        if (districtHealth) {
          districtHealth.setContested(true, district.controllingPlayer);
        } else {
          const newHealth = this.createDistrictHealth(district.id, district.location);
          if (newHealth) {
            newHealth.setAttribute("data-is-contested", "true");
          }
        }
      } else {
        const playerDistricts = Players.Districts.get(district.owner);
        if (playerDistricts) {
          const currentHealth = playerDistricts.getDistrictHealth(district.location);
          const maxHealth = playerDistricts.getDistrictMaxHealth(district.location);
          if (districtHealth) {
            if (!isTransfer) {
              districtHealth.setContested(false, district.owner);
              if (DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth)) {
                const normalizedProgress = Math.min(1, currentHealth / maxHealth);
                districtHealth.updateDistrictHealth(normalizedProgress.toString());
              } else {
                if (district.cityId) {
                  this.removeDistrictHealth(districtHealth, district.cityId, district.id);
                }
              }
            }
          } else {
            if (DistrictHealthManager.canShowDistrictHealth(currentHealth, maxHealth)) {
              this.createDistrictHealth(district.id, district.location);
            }
          }
        }
      }
    }
  }
  onDistrictAddedToMap(data) {
    const isTracked = this.children.has(ComponentID.toBitfield(data.id));
    if (isTracked) {
      console.error("district-health-manager: onDistrictAddedToMap: Already created. id: " + data.id);
      return;
    }
    this.createDistrictHealth(data.id, data.location);
  }
  onDistrictRemovedFromMap(data) {
    const district = this.children.get(ComponentID.toBitfield(data.id));
    if (district == void 0) {
      console.warn(
        "district-health-manager: Cannot find district for damage change. CityId: " + ComponentID.toLogString(data.cityID) + ", districtID: " + ComponentID.toLogString(data.id)
      );
      return;
    }
    this.removeDistrictHealth(district, data.cityID, data.id);
  }
  removeDistrictHealth(districtHealth, CityId, componentId) {
    const children = this.Root.childNodes;
    let foundChild = void 0;
    for (let i = children.length - 1; i >= 0; i--) {
      const node = children.item(i);
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const id = node.getAttribute("data-district-id");
      const cid = ComponentID.fromString(id);
      if (ComponentID.isMatch(cid, districtHealth.componentID)) {
        foundChild = node;
        break;
      }
    }
    if (!foundChild) {
      console.warn(
        "district-health-manager: Cannot find district for remove change. CityId: " + ComponentID.toLogString(CityId) + ", districtID: " + ComponentID.toLogString(componentId)
      );
      return;
    }
    this.Root.removeChild(foundChild);
  }
  onGlobalHide() {
    this.Root.classList.add("hidden");
  }
  onGlobalShow() {
    this.Root.classList.remove("hidden");
  }
  static canShowDistrictHealth(currentHealth, maxHealth) {
    return !!currentHealth && !!maxHealth && maxHealth > currentHealth && currentHealth > 0;
  }
}
Controls.define("district-health-bars", {
  createInstance: DistrictHealthManager,
  description: "District Health Manager",
  attributes: []
});

export { DistrictHealthManager as default };
//# sourceMappingURL=district-health-manager.js.map
