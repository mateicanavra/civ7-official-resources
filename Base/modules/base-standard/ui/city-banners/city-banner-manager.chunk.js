import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';

var BannerType = /* @__PURE__ */ ((BannerType2) => {
  BannerType2[BannerType2["custom"] = 0] = "custom";
  BannerType2[BannerType2["town"] = 1] = "town";
  BannerType2[BannerType2["city"] = 2] = "city";
  BannerType2[BannerType2["village"] = 3] = "village";
  BannerType2[BannerType2["cityState"] = 4] = "cityState";
  return BannerType2;
})(BannerType || {});
var CityStatusType = /* @__PURE__ */ ((CityStatusType2) => {
  CityStatusType2[CityStatusType2["none"] = 0] = "none";
  CityStatusType2["happy"] = "YIELD_HAPPINESS";
  CityStatusType2["unhappy"] = "YIELD_UNHAPPINESS";
  CityStatusType2["angry"] = "YIELD_ANGRY";
  CityStatusType2["plague"] = "YIELD_PLAGUE";
  return CityStatusType2;
})(CityStatusType || {});
function makeEmptyBannerData() {
  return {
    bannerType: 0 /* custom */,
    tooltip: ""
  };
}
const BANNER_INVALID_LOCATION = -9999;

const enableDebugMessages = false;
class CityBannerManager extends Component {
  citiesNotFullyCreated = /* @__PURE__ */ new Map();
  banners = /* @__PURE__ */ new Map();
  cityIntegratedListener = this.onCityIntegrated.bind(this);
  cityAddedToMapListener = this.onCityAddedToMap.bind(this);
  cityInitializedListener = this.onCityInitialized.bind(this);
  cityNameChangedListener = this.onCityNameChanged.bind(this);
  cityPopulationChangedListener = this.onCityPopulationChanged.bind(this);
  cityProductionChangedListener = this.onCityProductionChanged.bind(this);
  cityProductionQueueChangedListener = this.onCityProductionQueueChanged.bind(this);
  cityYieldChangedListener = this.onCityYieldChanged.bind(this);
  cityProductionUpdatedListener = this.onCityProductionUpdated.bind(this);
  foodQueueOrCityGrowthModeListener = this.onCityFoodQueueUpdated.bind(this);
  cityReligionChangedListener = this.onCityReligionChanged.bind(this);
  urbanReligionChangedListener = this.onUrbanReligionChanged.bind(this);
  ruralReligionChangedListener = this.onRuralReligionChanged.bind(this);
  uiDisableCityBannersListener = this.onDisableBanners.bind(this);
  uiEnableCityBannersListener = this.onEnableBanners.bind(this);
  globalHideListener = this.onGlobalHide.bind(this);
  globalShowListener = this.onGlobalShow.bind(this);
  plotVisibilityChangedListener = this.onPlotVisibilityChanged.bind(this);
  cityRemovedFromMapListener = this.onCityRemovedFromMap.bind(this);
  citySelectionChangedListener = this.onCitySelectionChanged.bind(this);
  cityGovernmentLevelChangedListener = this.onCityGovernmentLevelChanged.bind(this);
  cityStateBonusChosenListener = this.onCityStateBonusChosen.bind(this);
  cityYieldGrantedListener = this.onCityYieldGranted.bind(this);
  capitalCityChangedListener = this.onCapitalCityChanged.bind(this);
  static _instance = null;
  static get instance() {
    return CityBannerManager._instance;
  }
  /**
   * Onetime callback on creation.
   */
  onInitialize() {
    if (CityBannerManager._instance == null) {
      CityBannerManager._instance = this;
    } else {
      console.error("Multiple city banner managers are attempting to be created, but it's a singleton!");
    }
  }
  onAttach() {
    super.onAttach();
    this.createAllBanners();
    window.banners = this.banners;
    engine.on("AffinityLevelChanged", this.onAffinityLevelChanged, this);
    engine.on("CityAddedToMap", this.cityAddedToMapListener);
    engine.on("CityInitialized", this.cityInitializedListener);
    engine.on("CityNameChanged", this.cityNameChangedListener);
    engine.on("CapitalCityChanged", this.capitalCityChangedListener);
    engine.on("CityPopulationChanged", this.cityPopulationChangedListener);
    engine.on("CityProductionChanged", this.cityProductionChangedListener);
    engine.on("CityYieldChanged", this.cityYieldChangedListener);
    engine.on("CityProductionUpdated", this.cityProductionUpdatedListener);
    engine.on("CityProductionQueueChanged", this.cityProductionQueueChangedListener);
    engine.on("CityReligionChanged", this.cityReligionChangedListener);
    engine.on("DiplomacyEventStarted", this.onDiplomacyEventStarted, this);
    engine.on("DiplomacyEventEnded", this.onDiplomacyEventEnded, this);
    engine.on("DiplomacyRelationshipChanged", this.onDiplomacyRelationshipChanged, this);
    engine.on("UrbanReligionChanged", this.urbanReligionChangedListener);
    engine.on("RuralReligionChanged", this.ruralReligionChangedListener);
    engine.on("CityRemovedFromMap", this.cityRemovedFromMapListener);
    engine.on("CitySelectionChanged", this.citySelectionChangedListener);
    engine.on("CityStateBonusChosen", this.cityStateBonusChosenListener);
    engine.on("CityGovernmentLevelChanged", this.cityGovernmentLevelChangedListener);
    engine.on("FoodQueueChanged", this.foodQueueOrCityGrowthModeListener);
    engine.on("CityGrowthModeChanged", this.foodQueueOrCityGrowthModeListener);
    engine.on("CityYieldGranted", this.cityYieldGrantedListener);
    engine.on("PlotVisibilityChanged", this.plotVisibilityChangedListener);
    engine.on("ConqueredSettlementIntegrated", this.cityIntegratedListener);
    engine.on("DistrictAddedToMap", this.onDistrictAddedToMap, this);
    engine.on("DistrictRemovedFromMap", this.onDistrictRemovedFromMap, this);
    engine.on("NotificationAdded", this.onNotificationAdded, this);
    window.addEventListener("ui-disable-city-banners", this.uiDisableCityBannersListener);
    window.addEventListener("ui-enable-city-banners", this.uiEnableCityBannersListener);
    window.addEventListener("ui-hide-city-banners", this.globalHideListener);
    window.addEventListener("ui-show-city-banners", this.globalShowListener);
  }
  onDetach() {
    engine.off("AffinityLevelChanged", this.onAffinityLevelChanged, this);
    engine.off("CityAddedToMap", this.cityAddedToMapListener);
    engine.off("CityInitialized", this.cityInitializedListener);
    engine.off("CityNameChanged", this.cityNameChangedListener);
    engine.off("CityPopulationChanged", this.cityPopulationChangedListener);
    engine.off("CityProductionChanged", this.cityProductionChangedListener);
    engine.off("CityYieldChanged", this.cityYieldChangedListener);
    engine.off("CityProductionUpdated", this.cityProductionUpdatedListener);
    engine.off("CityProductionQueueUpdated", this.cityProductionUpdatedListener);
    engine.off("CityReligionChanged", this.cityReligionChangedListener);
    engine.off("DiplomacyEventStarted", this.onDiplomacyEventStarted, this);
    engine.off("DiplomacyEventEnded", this.onDiplomacyEventEnded, this);
    engine.off("DiplomacyRelationshipChanged", this.onDiplomacyRelationshipChanged, this);
    engine.off("UrbanReligionChanged", this.urbanReligionChangedListener);
    engine.off("RuralReligionChanged", this.ruralReligionChangedListener);
    engine.off("CityRemovedFromMap", this.cityRemovedFromMapListener);
    engine.off("CitySelectionChanged", this.citySelectionChangedListener);
    engine.off("CityStateBonusChosen", this.cityStateBonusChosenListener);
    engine.off("CityGovernmentLevelChanged", this.cityGovernmentLevelChangedListener);
    engine.off("FoodQueueChanged", this.foodQueueOrCityGrowthModeListener);
    engine.off("CityGrowthModeChanged", this.foodQueueOrCityGrowthModeListener);
    engine.off("CityYieldGranted", this.cityYieldGrantedListener);
    engine.off("PlotVisibilityChanged", this.plotVisibilityChangedListener);
    engine.off("ConqueredSettlementIntegrated", this.cityIntegratedListener);
    engine.off("DistrictAddedToMap", this.onDistrictAddedToMap, this);
    engine.off("DistrictRemovedFromMap", this.onDistrictRemovedFromMap, this);
    engine.off("NotificationAdded", this.onNotificationAdded, this);
    window.removeEventListener("ui-disable-city-banners", this.uiDisableCityBannersListener);
    window.removeEventListener("ui-enable-city-banners", this.uiEnableCityBannersListener);
    window.removeEventListener("ui-hide-city-banners", this.globalHideListener);
    window.removeEventListener("ui-show-city-banners", this.globalShowListener);
    super.onDetach();
  }
  /**
   * Determine if a city/town already has a banner associated with it.
   * @param {ComponentID} cityComponentID - An component ID related to a city
   * @returns true if a banner was already created (and still exists), false otherwise.
   */
  isBannerAlreadyCreated(cityComponentID) {
    const children = this.Root.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const node = children.item(i);
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const id = node.getAttribute("data-banner-cid");
      const cid = ComponentID.fromString(id);
      if (ComponentID.isMatch(cid, cityComponentID)) {
        return true;
      }
    }
    return false;
  }
  createAllBanners() {
    const playerList = Players.getAlive();
    for (const player of playerList) {
      const playerCities = player.Cities;
      if (playerCities == void 0) {
        console.warn("Cannot make banners for player with misisng playerCities object: ", player.name);
        continue;
      }
      const cityIDs = playerCities.getCityIds();
      for (const cityID of cityIDs) {
        this.createBanner(cityID, BANNER_INVALID_LOCATION, BANNER_INVALID_LOCATION);
      }
      if (player.isIndependent) {
        const playerConstructibles = player.Constructibles;
        if (!playerConstructibles) {
          console.error(
            "city-banner-manager: createAllBanners - no playerConstructibles found for player " + player.id
          );
          continue;
        }
        for (const construct of playerConstructibles.getConstructibles()) {
          const constructDef = GameInfo.Constructibles.lookup(construct.type);
          if (!constructDef) {
            console.error(
              `city-banner-manager: createAllBanners - No construct def found for constructible of type ${construct.type}`
            );
            return;
          }
          if (constructDef.ConstructibleType == "IMPROVEMENT_VILLAGE" || constructDef.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
            this.createBanner(construct.cityId, construct.location.x, construct.location.y);
          }
        }
      }
    }
  }
  /**
   * Creates the city banner HTML DOM object.
   * @param {ComponentID} cityComponentID - The city's componentID linked to this banner.
   */
  createBanner(cityComponentID, x, y) {
    if (this.isBannerAlreadyCreated(cityComponentID)) {
      console.error(
        "Attempt to create a city banner for a city that already has a banner. cid: " + ComponentID.toLogString(cityComponentID)
      );
      return;
    }
    const banner = document.createElement("city-banner");
    banner.setAttribute("data-banner-cid", ComponentID.toString(cityComponentID));
    banner.setAttribute("x", x.toString());
    banner.setAttribute("y", y.toString());
    banner.setAttribute("city-id", ComponentID.toString(cityComponentID));
    this.Root.appendChild(banner);
  }
  onCityIntegrated(data) {
    if (data.cityID.owner != GameContext.localObserverID) {
      return;
    }
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      console.error(
        "A city was integrated but no associated banner was found. cid: ",
        ComponentID.toLogString(data.cityID)
      );
      return;
    }
    cityBanner.updateConqueredIcon();
  }
  /**
   * Engine Event
   */
  onCityAddedToMap(data) {
    const bitfield = ComponentID.toBitfield(data.cityID);
    const pendingCityID = this.citiesNotFullyCreated.get(bitfield);
    if (pendingCityID != void 0 && !ComponentID.isInvalid(pendingCityID)) {
      return;
    }
    this.citiesNotFullyCreated.set(bitfield, data.cityID);
  }
  /**
   * If a district is added to the map and its a village, then add the village banner (and 3d info)
   * @param {DistrictAddedToMap_EventData} data
   */
  onDistrictAddedToMap(data) {
    if (data.cityID.owner == PlayerIds.NO_PLAYER) {
      return;
    }
    const playerID = GameplayMap.getOwner(data.location.x, data.location.y);
    const player = Players.get(playerID);
    if (player?.isIndependent) {
      const cityComponentID = GameplayMap.getOwningCityFromXY(
        data.location.x,
        data.location.y
      );
      if (!cityComponentID || ComponentID.isInvalid(cityComponentID)) {
        console.error(
          `city-banner-manager: onDistrictAddedToMap - Invalid village at ${data.location.x},${data.location.y}`
        );
        return;
      }
      const constructibles = MapConstructibles.getConstructibles(data.location.x, data.location.y);
      constructibles.some((item) => {
        const instance = Constructibles.getByComponentID(item);
        if (!instance) {
          return;
        }
        const info = GameInfo.Constructibles.lookup(instance.type);
        if (!info) {
          return;
        }
        if (info.ConstructibleType == "IMPROVEMENT_VILLAGE" || info.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
          this.createBanner(cityComponentID, data.location.x, data.location.y);
        }
      });
    }
  }
  /**
   * If a district is removed from the map and its a village, then remove the village banner
   * @param data
   */
  onDistrictRemovedFromMap(data) {
    if (data.cityID.owner == PlayerIds.NO_PLAYER) {
      return;
    }
    const player = Players.get(data.cityID.owner);
    if (player?.isIndependent || player?.isMinor) {
      const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
      if (cityBanner) {
        if (cityBanner.getLocation().x == data.location.x && cityBanner.getLocation().y == data.location.y) {
          cityBanner.remove();
        }
      }
    }
  }
  /**
   * @description An independent power's affinity level with a player changed.  Update banners if it's the local player.
   * @param {AffinityLevelChanged_EventData} data
   */
  onAffinityLevelChanged(data) {
    if (data.player == GameContext.localObserverID) {
      this.banners.forEach((banner, _key) => {
        banner.affinityUpdate();
      });
    }
  }
  /**
   * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
   * @param {DiplomacyEvent} data
   */
  onDiplomacyEventStarted(data) {
    if (data.location == void 0) {
      return;
    }
    this.banners.forEach((banner, _key) => {
      banner.affinityUpdate();
    });
  }
  /**
   * @description Affinities for an independent power are signaled at the end of a diplomacy change, see if thisis related
   * @param {DiplomacyEvent} data
   */
  onDiplomacyEventEnded(data) {
    if (data.location == void 0) {
      return;
    }
    let searching = true;
    this.banners.forEach((banner, _key) => {
      if (searching && banner.bannerLocation.x == data.location.x && banner.bannerLocation.y == data.location.y) {
        searching = false;
        banner.affinityUpdate();
      }
    });
  }
  /**
   * @description A diplo relationship changed.  If it involves the local player, refresh the village banners
   * @param {DiplomacyRelationshipChanged_EventData} data
   */
  onDiplomacyRelationshipChanged(data) {
    if (data.player1 == GameContext.localObserverID || data.player2 == GameContext.localObserverID) {
      this.banners.forEach((banner, _key) => {
        banner.affinityUpdate();
      });
    }
  }
  /**
   * @description Game callback; same as CityAddedToMap (same data payload)
   * but happens at the end of creation so all values are populated.
   * @param {CityAddedToMap_EventData} data - Details about created city.
   */
  onCityInitialized(data) {
    const bitfield = ComponentID.toBitfield(data.cityID);
    const pendingCityID = this.citiesNotFullyCreated.get(bitfield);
    if (pendingCityID != void 0 && !ComponentID.isInvalid(pendingCityID)) {
      this.citiesNotFullyCreated.delete(bitfield);
    } else {
      if (this.isBannerAlreadyCreated(data.cityID)) {
        return;
      }
      console.warn(
        "Creating a city banner at city initialization but a paired onAddedToMap call never occurred! cid: " + ComponentID.toLogString(data.cityID)
      );
    }
    this.createBanner(data.cityID, data.location.x, data.location.y);
  }
  /**
   * City has a new name.
   * @param {City_EventData} data
   */
  onCityNameChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      return;
    }
    cityBanner.queueNameUpdate();
  }
  onCityGovernmentLevelChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      return;
    }
    if (data.governmentlevel == CityGovernmentLevels.CITY) {
      cityBanner.queueNameUpdate();
    }
  }
  onCityRemovedFromMap(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      return;
    }
    cityBanner.remove();
  }
  onCapitalCityChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner) {
      cityBanner.capitalUpdate();
    }
  }
  // TODO: Remove to let world view raise view based on plot selection (or banner from banner activation) not from city selection change.
  onCitySelectionChanged(data) {
    if (!data.selected) {
      return;
    }
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      console.error(
        "A city's selection status changed but no associated banner was found. cid: ",
        ComponentID.toLogString(data.cityID)
      );
      return;
    }
  }
  onCityStateBonusChosen(data) {
    const cityBanner = this.banners.get(
      ComponentID.toBitfield(ComponentID.make(data.cityState, 1, 65536))
    );
    if (cityBanner == void 0) {
      return;
    }
    cityBanner.queueNameUpdate();
  }
  /**
   * @description Called by a city banner to let manager directly access it's instance.
   * When banner is being initalized.
   * @param {CityBanner} child - banner which manager created.
   */
  addChildForTracking(child) {
    const key = child.getKey();
    if (this.banners.has(key)) {
      console.error(
        "Attempt to add a city banner to the manager for tracking but something (itself?) already is added with that key: " + child.getDebugString()
      );
      return;
    }
    child.Root.id = `city-banner-${this.banners.size}`;
    this.banners.set(key, child);
  }
  /**
   * @description Called by a city banner to remove itself from being tracked by the manager
   * @param {CityBanner} child - banner which is being tracked by the manager
   */
  removeChildFromTracking(child) {
    const key = child.getKey();
    if (!this.banners.has(key)) {
      return;
    }
    this.banners.delete(key);
  }
  /// Turns off interactivity with banners
  onDisableBanners() {
    this.banners.forEach((banner) => {
      banner.disable();
    });
  }
  /// Turns on interactivity with banners
  onEnableBanners() {
    this.banners.forEach((banner) => {
      banner.enable();
    });
  }
  checkCityVis(cityID) {
    let result = false;
    const city = Cities.get(cityID);
    if (city) {
      const visibility = GameplayMap.getRevealedState(
        GameContext.localObserverID,
        city.location.x,
        city.location.y
      );
      if (visibility == RevealedStates.REVEALED) {
        result = true;
      }
    }
    return result;
  }
  onCityPopulationChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages) {
        const bitfield = ComponentID.toBitfield(data.cityID);
        const pendingCityID = this.citiesNotFullyCreated.get(bitfield);
        if (pendingCityID == void 0 || ComponentID.isInvalid(pendingCityID)) {
          const player = Players.get(data.cityID.owner);
          if (!player?.isIndependent && this.checkCityVis(data.cityID)) {
            console.error(
              "Unable to set city banner for population change via CityPopulationChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
            );
          }
        }
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onCityReligionChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.realizeReligion();
  }
  onUrbanReligionChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.realizeReligion();
  }
  onRuralReligionChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for religion change via CityReligionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.realizeReligion();
  }
  onCityProductionChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for production change via cityProductionChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onCityProductionQueueChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for production change via CityProductionQueueChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onCityYieldChanged(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      const player = Players.get(data.cityID.owner);
      if (enableDebugMessages && !player?.isIndependent && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for city yields change via CityYieldChanged; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onCityProductionUpdated(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for population change via CityProductioUpdated; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onCityYieldGranted(data) {
    if (data.yield == YieldTypes.YIELD_FOOD || data.yield == YieldTypes.YIELD_PRODUCTION) {
      const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
      if (cityBanner == void 0) {
        if (enableDebugMessages && this.checkCityVis(data.cityID)) {
          console.error(
            "city-banner-manager: Unable to set city banner for granted yield change via onCityYieldGranted; none in manager with id: " + ComponentID.toLogString(data.cityID)
          );
        }
        return;
      }
      cityBanner.queueBuildsUpdate();
    }
  }
  onCityFoodQueueUpdated(data) {
    const cityBanner = this.banners.get(ComponentID.toBitfield(data.cityID));
    if (cityBanner == void 0) {
      if (enableDebugMessages && this.checkCityVis(data.cityID)) {
        console.error(
          "city-banner-manager: Unable to set city banner for food queue change via onCityFoodQueueUpdated; none in manager with id: " + ComponentID.toLogString(data.cityID)
        );
      }
      return;
    }
    cityBanner.queueBuildsUpdate();
  }
  onNotificationAdded(data) {
    const thisNotification = Game.Notifications.find(data.id);
    if (thisNotification) {
      const typeName = Game.Notifications.getTypeName(thisNotification.Type);
      switch (typeName) {
        case "NOTIFICATION_PLAGUE_MAJOR_OUTBREAK":
        case "NOTIFICATION_PLAGUE_MINOR_OUTBREAK":
        case "NOTIFICATION_PLAGUE_SPREADS":
        case "NOTIFICATION_PLAGUE_DISSIPATES":
          if (thisNotification.Target) {
            const cityBanner = this.banners.get(
              ComponentID.toBitfield(thisNotification.Target)
            );
            if (cityBanner) {
              cityBanner.realizeHappiness();
            }
          }
          break;
      }
    }
  }
  onGlobalHide() {
    this.Root.classList.add("hidden");
  }
  onGlobalShow() {
    this.Root.classList.remove("hidden");
    this.banners.forEach((banner) => {
      const vis = banner.getVisibility();
      if (vis != RevealedStates.HIDDEN) {
        banner.setVisibility(RevealedStates.HIDDEN);
        banner.setVisibility(vis);
      }
    });
  }
  // TODO: This is a lot of script search to find a matching city for a given plot.  Add feature of engine for fast lookup?
  onPlotVisibilityChanged(data) {
    const location = data.location;
    const playerID = GameplayMap.getOwner(location.x, location.y);
    if (playerID == PlayerIds.NO_PLAYER) {
      return;
    }
    const player = Players.get(playerID);
    if (!player) {
      return;
    }
    if (player.isIndependent) {
      this.banners.forEach((banner, _key) => {
        if (banner.bannerLocation.x == data.location.x && banner.bannerLocation.y == data.location.y) {
          banner.setVisibility(data.visibility);
          return;
        }
      });
    }
    const playerCities = player.Cities;
    if (playerCities == void 0) {
      console.error("Banner checking plot visibility change; no cities for player: " + player.leaderType);
      return;
    }
    const cityIDs = playerCities.getCityIds();
    for (const cityID of cityIDs) {
      const city = Cities.get(cityID);
      if (city == null) {
        console.error(
          "Banner checking plot visibility change; NULL city. cid: " + ComponentID.toLogString(cityID)
        );
        continue;
      }
      const isCityBannerPlot = city.location.x == location.x && city.location.y == location.y;
      const districtIDs = city.Districts?.getIds();
      if (districtIDs == void 0) {
        console.error(
          "Banner checking plot visibility change; no district IDs for city. cid: " + ComponentID.toLogString(cityID)
        );
        continue;
      }
      for (const districtID of districtIDs) {
        const district = Districts.get(districtID);
        if (!district) {
          console.error(
            "Banner checking plot visibility change; null district.  DistrictID: " + ComponentID.toLogString(districtID) + ", cid: " + ComponentID.toLogString(cityID)
          );
          continue;
        }
        if (district.location.x == location.x && district.location.y == location.y) {
          const cityBanner = this.banners.get(ComponentID.toBitfield(cityID));
          if (cityBanner == void 0) {
            console.error(
              `Unable to change the banner visibility of city's plot ${data.location.x}, ${data.location.y} because no city banner return for id: ${ComponentID.toLogString(cityID)}`
            );
            return;
          }
          if (isCityBannerPlot) {
            cityBanner.setVisibility(data.visibility);
          }
          return;
        }
      }
    }
  }
}
Controls.define("city-banners", {
  createInstance: CityBannerManager,
  description: "City Banners",
  requires: ["city-banner"]
});

export { BANNER_INVALID_LOCATION as B, CityBannerManager as C, BannerType as a, CityStatusType as b };
//# sourceMappingURL=city-banner-manager.chunk.js.map
