import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';

const styles = "fs://game/base-standard/ui/unit-flags/unit-flags.css";

function instanceOfUnitFlagType(object) {
  return object != null && "componentID" in object && // TODO: Fix, doesn't match!
  "unit" in object;
}
class UnitFlagFactory {
  static makers = /* @__PURE__ */ new Map();
  // { [componentName: string]: UnitFlagFactoryMaker } = {};
  /**
   * Register a "maker" class that can determine what component should be used	 to make a particulr type of unit flag.
   * @param {UnitFlagFactoryMaker} makerInstance Instance of a "maker" which has the name of HTML component type to instantiate.
   */
  static registerStyle(makerInstance) {
    const componentName = makerInstance.getComponentName();
    if (UnitFlagFactory.makers.has(componentName)) {
      console.warn("Redefining unit flag style '" + componentName + "', is that the intention?");
    }
    UnitFlagFactory.makers.set(componentName, makerInstance);
    makerInstance.initialize();
    if (UnitFlagManager.instance) {
      UnitFlagManager.instance.requestFlagsRebuild();
    }
  }
  static getBestHTMLComponentName(componentID) {
    const defaultHTMLComponent = "unit-flag";
    const unit = Units.get(componentID);
    if (!unit) {
      console.warn(
        "Using default flag; unable to get HTML component name for a unit due to a cid not matching a unit. cid: ",
        ComponentID.toLogString(componentID)
      );
      return defaultHTMLComponent;
    }
    const unitDefinition = GameInfo.Units.lookup(unit.type);
    if (!unitDefinition) {
      console.warn(
        "Using default flag; unable to get HTML component name for a unit due to a missing unit defintion for: ",
        unit.type,
        "  cid: ",
        ComponentID.toLogString(componentID)
      );
      return defaultHTMLComponent;
    }
    const matches = [];
    for (const maker of UnitFlagFactory.makers.values()) {
      if (maker.isMatch(unit, unitDefinition)) {
        matches.push(maker);
      }
    }
    if (matches.length > 0) {
      for (const maker of matches) {
        if (maker.isMatch(unit, unitDefinition, matches)) {
          return maker.getComponentName();
        }
      }
    }
    console.warn(
      "Returning the default unit flag to use because of no matches (including the default!): ",
      unit.type,
      "  cid: ",
      ComponentID.toLogString(componentID)
    );
    return defaultHTMLComponent;
  }
}
class UnitFlagManager extends Component {
  unitFlagZoomScale = 1;
  flags = /* @__PURE__ */ new Map();
  rebuildPending = false;
  /// Should all flags be rebuilt.
  globalHide = false;
  /** Flag set by debug panel to disable all unit flags. */
  systemDisabled = false;
  /** Flag set by debug panel to generate a ton of test units. */
  stressTestUnitsEnabled = false;
  /** Array of generated test units used to remove them when the stress test is disabled. */
  stressTestUnits = [];
  globalHideListener = this.onGlobalHide.bind(this);
  globalShowListener = this.onGlobalShow.bind(this);
  interactUnitShowListener = this.onInteractUnitShow.bind(this);
  interactUnitHideListener = this.onInteractUnitHide.bind(this);
  uiDisableUnitFlagsListener = this.onDisableFlags.bind(this);
  uiEnableUnitFlagsListener = this.onEnableFlags.bind(this);
  zoomLevel = 1;
  styleMap = null;
  opacityStyle = CSS.number(1);
  flagOffsetUpdateGate = new UpdateGate(this.onRecalculateFlagOffsets.bind(this));
  plotIndicesToCheck = /* @__PURE__ */ new Set();
  flagRoots = /* @__PURE__ */ new Map();
  static _instance = null;
  static get instance() {
    return UnitFlagManager._instance;
  }
  /**
   * Onetime callback on creation.
   */
  onInitialize() {
    this.styleMap = this.Root.attributeStyleMap;
    this.styleMap.set("opacity", this.opacityStyle);
    if (UnitFlagManager._instance == null) {
      UnitFlagManager._instance = this;
    } else {
      console.error("Multiple unit flag manager are attempting to be created, but it's a singleton!");
    }
    const disableUnitIcons = {
      id: "disableUnitIcons",
      category: "Systems",
      caption: "Disable Unit Icons",
      domainType: "bool",
      value: false
    };
    const stressTestUnits = {
      id: "stressTestUnitIcons",
      category: "Profiling",
      caption: "Stress Test Unit Icons",
      domainType: "bool",
      value: false
    };
    UI.Debug.registerWidget(disableUnitIcons);
    UI.Debug.registerWidget(stressTestUnits);
    engine.on("DebugWidgetUpdated", (id, value) => {
      if (id == "disableUnitIcons") {
        const systemWasDisabled = this.systemDisabled;
        this.systemDisabled = value;
        if (!systemWasDisabled && value) {
          this.removeAllFlags();
        }
        if (systemWasDisabled && !value) {
          this.requestFlagsRebuild();
        }
      } else if (id == "stressTestUnitIcons") {
        const stressTestUnitsEnabled = this.stressTestUnitsEnabled;
        this.stressTestUnitsEnabled = value;
        if (!stressTestUnitsEnabled && value) {
          this.removeAllFlags();
          this.createStressTestFlags();
        }
        if (stressTestUnitsEnabled && !value) {
          this.removeStressTestUnits();
          this.removeAllFlags();
          this.requestFlagsRebuild();
        }
      }
    });
  }
  onAttach() {
    super.onAttach();
    window.addEventListener("ui-hide-unit-flags", this.globalHideListener);
    window.addEventListener("ui-show-unit-flags", this.globalShowListener);
    window.addEventListener("unit-actions-show", this.interactUnitShowListener);
    window.addEventListener("unit-actions-hide", this.interactUnitHideListener);
    window.addEventListener("ui-disable-unit-flags", this.uiDisableUnitFlagsListener);
    window.addEventListener("ui-enable-unit-flags", this.uiEnableUnitFlagsListener);
    engine.on("CameraChanged", this.onZoomChange, this);
    engine.on("CityInitialized", this.onCityInitialized, this);
    engine.on("UnitDamageChanged", this.onUnitDamageChanged, this);
    engine.on("UnitMovementPointsChanged", this.onUnitMovementPointsChanged, this);
    engine.on("UnitRemovedFromMap", this.onUnitRemovedFromMap, this);
    engine.on("UnitVisibilityChanged", this.onUnitVisibilityChanged, this);
    this.setZoomLevel(Camera.getState().zoomLevel ?? 1);
    window.requestAnimationFrame(() => {
      this.requestFlagsRebuild();
    });
  }
  onDetach() {
    window.removeEventListener("ui-hide-unit-flags", this.globalHideListener);
    window.removeEventListener("ui-show-unit-flags", this.globalShowListener);
    window.removeEventListener("unit-actions-show", this.interactUnitShowListener);
    window.removeEventListener("unit-actions-hide", this.interactUnitHideListener);
    engine.off("CameraChanged", this.onZoomChange, this);
    engine.off("CityInitialized", this.onCityInitialized, this);
    engine.off("UnitDamageChanged", this.onUnitDamageChanged, this);
    engine.off("UnitMovementPointsChanged", this.onUnitMovementPointsChanged, this);
    engine.off("UnitRemovedFromMap", this.onUnitRemovedFromMap, this);
    engine.off("UnitVisibilityChanged", this.onUnitVisibilityChanged, this);
    this.removeAllFlags();
    super.onDetach();
  }
  /**
   * Obtain a root element that contains all unit flags for a given player.
   * This helps partition the flags so that certain changes (add/remove) do not invalidate all flags.
   * @param playerId The player id associated with the unit flag root.
   * @returns
   */
  getFlagRoot(playerId) {
    let root = this.flagRoots.get(playerId);
    if (!root) {
      root = document.createElement("div");
      root.classList.add("fullscreen");
      this.Root.appendChild(root);
      this.flagRoots.set(playerId, root);
    }
    return root;
  }
  getFlag(componentID) {
    const bitfieldID = ComponentID.toBitfield(componentID);
    const unitFlag = this.flags.get(bitfieldID);
    return unitFlag;
  }
  recalculateFlagOffsets(location) {
    const index = GameplayMap.getIndexFromLocation(location);
    this.plotIndicesToCheck.add(index);
    this.flagOffsetUpdateGate.call("recalculateFlagOffsets");
  }
  onRecalculateFlagOffsets() {
    for (const plotIndex of this.plotIndicesToCheck) {
      const location = GameplayMap.getLocationFromIndex(plotIndex);
      const units = MapUnits.getUnits(location.x, location.y);
      for (let u = 0; u < units.length; u++) {
        const unitFlag = UnitFlagManager.instance.getFlag(units[u]);
        if (unitFlag) {
          unitFlag.updateTop(u, units.length);
        }
      }
    }
    this.plotIndicesToCheck.clear();
  }
  onInteractUnitShow(event) {
    const sourceUnit = event.detail.unitId;
    for (const [, flag] of this.flags) {
      const unit = flag.unit;
      if (unit) {
        if (ComponentID.isMatch(sourceUnit, unit.id)) {
          flag.hide();
        }
      }
    }
  }
  onInteractUnitHide(event) {
    const sourceUnit = event.detail.unitId;
    for (const [, flag] of this.flags) {
      const unit = flag.unit;
      if (unit) {
        if (ComponentID.isMatch(sourceUnit, unit.id)) {
          flag.show();
        }
      }
    }
  }
  onDisableFlags() {
    for (const [, flag] of this.flags) {
      flag.disable();
    }
  }
  onEnableFlags() {
    for (const [, flag] of this.flags) {
      flag.enable();
    }
  }
  onUnitDamageChanged(data) {
    const unitFlag = this.getFlag(data.unit);
    if (!unitFlag) {
      return;
    }
    unitFlag.updateHealth();
  }
  onUnitMovementPointsChanged(data) {
    const unitFlag = this.getFlag(data.unit);
    if (!unitFlag) {
      return;
    }
    unitFlag.updateMovement();
  }
  onUnitRemovedFromMap(data) {
    const unitFlag = this.getFlag(data.unit);
    if (!unitFlag) {
      return;
    }
    unitFlag.Destroy();
  }
  onZoomChange(cameraState) {
    const zoomLevel = cameraState.zoomLevel;
    if (this.zoomLevel == zoomLevel || isNaN(zoomLevel)) {
      return;
    }
    this.setZoomLevel(zoomLevel);
  }
  calculateZoom(zoomLevel) {
    const invertedZoom = 1 - zoomLevel;
    const zoomEased = invertedZoom * invertedZoom * invertedZoom;
    return zoomEased;
  }
  setZoomLevel(zoomLevel) {
    this.zoomLevel = zoomLevel;
    const zoomEased = this.calculateZoom(zoomLevel);
    this.unitFlagZoomScale = zoomEased;
    const value = Math.round((1 - zoomEased) / 0.25);
    if (value != this.opacityStyle.value) {
      this.opacityStyle.value = value;
      this.styleMap?.set("opacity", this.opacityStyle);
    }
  }
  /**
   * Engine callback when visibility of a unit changed.
   * Using this instead of UnitAddedToMap because of event race condition in looking up a valid Unit in WorldAnchor.
   * @param {UnitVisibilityChanged_EventData} data
   */
  onUnitVisibilityChanged(data) {
    const componentID = data.unit;
    const bitfieldID = ComponentID.toBitfield(componentID);
    if (!this.flags.has(bitfieldID)) {
      this.createFlag(componentID);
      return;
    }
    const unitFlag = this.flags.get(bitfieldID);
    if (!unitFlag) {
      return;
    }
    unitFlag.setVisibility(data.visibility);
  }
  removeAllFlags() {
    this.Root.innerHTML = "";
    this.flagRoots.clear();
    this.flags = /* @__PURE__ */ new Map();
  }
  removeStressTestUnits() {
    for (const u of this.stressTestUnits) {
      Game.PlayerOperations.sendRequest(u.Owner, "DESTROY_ELEMENT", u);
    }
  }
  createStressTestFlags() {
    const stressTestUnits = this.stressTestUnits;
    function getRandom(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
    function createStressUnit(playerID, unitType, x, y) {
      const plotCoordinate = { x, y };
      const args = {
        Kind: "UNIT",
        Type: unitType,
        Location: plotCoordinate,
        Owner: playerID
      };
      stressTestUnits.push(args);
      Game.PlayerOperations.sendRequest(args.Owner, "CREATE_ELEMENT", args);
    }
    const alivePlayers = Players.getAliveIds();
    const trainableUnits = GameInfo.Units.filter(
      (u) => u.CanTrain && u.FormationClass != "FORMATION_CLASS_COMMAND"
    );
    const landOrAirUnits = trainableUnits.filter((u) => u.Domain == "DOMAIN_LAND" || u.Domain == "DOMAIN_AIR").map((u) => u.UnitType);
    const waterOrAirUnits = trainableUnits.filter((u) => u.Domain == "DOMAIN_SEA" || u.Domain == "DOMAIN_AIR").map((u) => u.UnitType);
    const xlow = 0;
    const xhigh = GameplayMap.getGridWidth();
    const ylow = 0;
    const yhigh = GameplayMap.getGridHeight();
    for (let x = xlow; x <= xhigh; x++) {
      for (let y = ylow; y < yhigh; y++) {
        const terrainType = GameplayMap.getTerrainType(x, y);
        const terrain = GameInfo.Terrains.lookup(terrainType);
        if (terrain) {
          if (terrain.TerrainType == "TERRAIN_HILL" || terrain.TerrainType == "TERRAIN_FLAT") {
            createStressUnit(getRandom(alivePlayers), getRandom(landOrAirUnits), x, y);
          } else if (terrain.TerrainType == "TERRAIN_COAST") {
            createStressUnit(getRandom(alivePlayers), getRandom(waterOrAirUnits), x, y);
          }
        }
      }
    }
  }
  /**
   * Make a request to rebuild all flags next frame.
   * Not necessary initially but found when hotloading, sometimes the flags were
   * being built before all flag handlers were registered.
   */
  requestFlagsRebuild() {
    if (this.rebuildPending || this.systemDisabled) {
      return;
    }
    this.rebuildPending = true;
    window.requestAnimationFrame(() => {
      this.checkFlagRebuild();
    });
  }
  /**
   * Handles kick off creating all flags or waiting if the component isn't built yet.
   */
  checkFlagRebuild() {
    if (this.systemDisabled) {
      return;
    }
    if (!this.rebuildPending) {
      console.warn("unit-flag-manager: Check to rebuild the flags called but no rebuild pending!");
      return;
    }
    if (!this.Root.isConnected) {
      window.requestAnimationFrame(() => {
        this.checkFlagRebuild();
      });
      return;
    }
    this.rebuildPending = false;
    if (this.flags.size > 0) {
      this.removeAllFlags();
    }
    this.createAllFlags();
  }
  /**
   * Create all unit flags.
   * TODO: Evaluate if it this will be removed; one of three things must happen first:
   * 		An equivalent of a playerVisibility( x, y) call exposure is made
   * 		The revealed visibility of a unit can be checked on the unit object
   * 		The UnitVisibilityChanged call is guaranteed to fire for units when they are first created
   */
  createAllFlags() {
    const playerList = Players.getAlive();
    for (const playerLibrary of playerList) {
      const playerUnits = playerLibrary.Units;
      if (playerUnits == void 0) {
        continue;
      }
      const unitIDs = playerUnits.getUnitIds();
      for (const unitID of unitIDs) {
        this.createFlag(unitID);
      }
    }
  }
  /**
   * Create a unit flag associated with a unit ID. External access for panels.
   * @param {ComponentID} unitID The cid that represents the unit.
   */
  createFlagComponent(unitID) {
    const unit = Units.get(unitID);
    if (!unit) {
      console.warn("Cannot create unit flag for null unit object with ID: " + ComponentID.toLogString(unitID));
      return;
    }
    const tagName = UnitFlagFactory.getBestHTMLComponentName(unitID);
    const flag = document.createElement(tagName);
    flag.setAttribute("unit-id", ComponentID.toString(unitID));
    flag.setAttribute("manager-tracked", "false");
    return flag;
  }
  /**
   * Create a unit flag associated with a unit ID.
   * @param {ComponentID} unitID The cid that represents the unit.
   */
  createFlag(unitID) {
    const unit = Units.get(unitID);
    if (!unit) {
      console.warn("Cannot create unit flag for null unit object with ID: " + ComponentID.toLogString(unitID));
      return;
    }
    if (!unit.isOnMap) {
      return;
    }
    const tagName = UnitFlagFactory.getBestHTMLComponentName(unitID);
    const flag = document.createElement(tagName);
    flag.setAttribute("unit-id", ComponentID.toString(unitID));
    const playerRoot = this.getFlagRoot(unit.owner);
    playerRoot?.appendChild(flag);
  }
  /**
   * @description Called by a unit flag to let manager directly access it's instance.
   * @param {UnitFlagType} child - flag which manager created.
   */
  addChildForTracking(child) {
    const id = child.unit?.id ?? ComponentID.getInvalidID();
    if (ComponentID.isInvalid(id)) {
      console.error("Unable to connect a unit flag to the manager because the unit has an invalid componentID!");
      return;
    }
    if (this.flags.has(ComponentID.toBitfield(id))) {
      return;
    }
    this.flags.set(ComponentID.toBitfield(id), child);
  }
  /**
   * @description Called by a unit flag to remove itself from being tracked by the manager
   * @param {UnitFlagType} child - flag which manager created.
   */
  removeChildFromTracking(child) {
    const id = child.componentID;
    if (ComponentID.isInvalid(id)) {
      return;
    }
    const bitfield = ComponentID.toBitfield(id);
    if (!this.flags.has(bitfield)) {
      return;
    }
    this.flags.delete(bitfield);
  }
  /**
   * @description Game callback; same as CityAddedToMap (same data payload)
   * but happens at the end of creation so all values are populated.
   * @param {CityAddedToMap_EventData} data - Details about created city.
   */
  onCityInitialized(data) {
    const player = Players.get(data.player);
    if (player) {
      const playerCities = player.Cities;
      if (playerCities && playerCities.getCities().length == 1) {
        this.requestFlagsRebuild();
      }
    }
  }
  onGlobalHide() {
    if (!this.globalHide) {
      this.Root.classList.add("hidden");
      this.globalHide = true;
    }
  }
  onGlobalShow() {
    if (this.globalHide) {
      this.Root.classList.remove("hidden");
      this.globalHide = false;
    }
  }
}
Controls.define("unit-flags", {
  createInstance: UnitFlagManager,
  description: "Unit flags",
  styles: [styles]
});

export { UnitFlagFactory, UnitFlagManager, instanceOfUnitFlagType, styles as s };
//# sourceMappingURL=unit-flag-manager.js.map
