import { FxsActivatable } from '../../../core/ui/components/fxs-activatable.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { CreateElementTable, MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import { BANNER_INVALID_LOCATION, BannerType } from './banner-support.js';
import CityBannerManager from './city-banner-manager.js';
import { RaiseDiplomacyEvent } from '../diplomacy/diplomacy-events.js';
import { ProductionPanelCategory } from '../production-chooser/production-chooser-helpers.js';
import content from './city-banners.html.js';
import styles from './city-banners.scss.js';
import '../../ui-next/screens/city-banners/city-banner-population.js';
import '../../ui-next/screens/city-banners/city-banner-production.js';

const BANNER_ANCHOR_OFFSET = { x: 0, y: 0, z: 42 };
const happinessStages = [];
GameInfo.HappinessStages.forEach((row) => {
  happinessStages.push({
    happinessStage: row.HappinessStageType,
    name: row.HappinessStageType.replace("HAPPINESS_STAGE_", "LOC_UI_CITY_DETAILS_"),
    icon: row.HappinessStageType.replace("HAPPINESS_STAGE_", "YIELD_"),
    textColor: row.HappinessStageType.replace("HAPPINESS_STAGE_", "").toLowerCase() + "-text",
    min: row.StageMinThreshold ?? -Infinity,
    max: row.StageMaxThreshold ?? Infinity
  });
});
class CityBannerComponent extends FxsActivatable {
  _worldAnchorHandle = null;
  inputSelector = ".city-banner__container, .city-banner__queue-container, .city-banner__portrait";
  componentID = ComponentID.getInvalidID();
  isHidden = false;
  location = { x: 0, y: 0 };
  city = null;
  updateNameQueued = false;
  onActivateEventListener = this.onActivate.bind(this);
  elements = CreateElementTable(this.Root, {
    capitalIndicator: ".city-banner__capital-star",
    originalCapitalIndicator: ".city-banner__original-capital-star",
    originalCapitalCurrIndicator: ".city-banner__original-capital-curr-star",
    cityStateColor: ".city-banner__city-state-type",
    container: ".city-banner__container",
    container_bg: ".city-banner__stretch",
    growthQueueContainer: ".city-banner__population-container",
    growthQueue: ".city-banner__population",
    productionQueueContainer: ".city-banner__production-container",
    productionQueue: ".city-banner__production",
    portrait: ".city-banner__portrait",
    portraitIcon: ".city-banner__portrait-img",
    urbanReligionSymbol: ".city-banner__religion-symbol",
    ruralReligionSymbol: ".city-banner__religion-symbol.religion-symbol--right",
    urbanReligionSymbolBackground: ".city-banner__religion-symbol-bg",
    ruralReligionSymbolBackground: ".city-banner__religion-symbol-bg.religion-bg--right",
    statusContainer: ".city-banner__status",
    statusIcon: ".city-banner__status-icon",
    tradeNetworkContainer: ".city-banner__trade-network",
    tradeNetworkIcon: ".city-banner__trade-network-icon",
    portraitImg: ".city-banner__portrait-img",
    cityNameContainer: ".city-banner__name-container",
    cityName: ".city-banner__name",
    civPatternContainer: ".city-banner__pattern-container",
    civPattern: ".city-banner__pattern",
    unrestTurns: ".city-banner__unrest > .city-banner__time-container > .city-banner__time-text",
    razedTurns: ".city-banner__razing > .city-banner__time-container > .city-banner__time-text"
  });
  civSymbols = null;
  civPatternElements = null;
  get bannerLocation() {
    return this.location;
  }
  fullUpdateGate = new UpdateGate(() => {
    this.doFullUpdate();
  });
  fullUpdate(requestor) {
    this.fullUpdateGate.call(requestor);
  }
  doFullUpdate() {
    this.realizeBuilds();
    this.realizeHappiness();
    this.realizeTradeNetwork();
    this.realizePopulation();
    this.realizeReligion();
  }
  queueNameUpdate() {
    if (this.updateNameQueued) return;
    this.updateNameQueued = true;
    requestAnimationFrame(this.doNameUpdate.bind(this));
  }
  // TODO: I don't believe this should be rebuilding the entire banner?
  doNameUpdate() {
    this.buildBanner();
    this.updateNameQueued = false;
  }
  getDebugString() {
    return `'${this.location.x},${this.location.y}' for ${ComponentID.toLogString(this.componentID)}`;
  }
  getKey() {
    return ComponentID.toBitfield(this.componentID);
  }
  getLocation() {
    return this.location;
  }
  /**
   * getDebugLocation parses the data-debug-plot-index attribute on the DOM element and returns a float2 if it is valid.
   * This is used for generating many city banners attached to one city, but in differing plots, for stress testing.
   */
  getDebugLocation() {
    const plotIndexAttr = this.Root.getAttribute("data-debug-plot-index");
    if (!plotIndexAttr) {
      return null;
    }
    const plotIndex = parseFloat(plotIndexAttr);
    if (isNaN(plotIndex)) {
      return null;
    }
    return GameplayMap.getLocationFromIndex(plotIndex);
  }
  onAttach() {
    super.onAttach();
    this.Root.classList.add(
      "-top-9",
      "absolute",
      "flex",
      "flex-row",
      "justify-start",
      "items-center",
      "flex-nowrap",
      "bg-center",
      "whitespace-nowrap",
      "bg-no-repeat",
      "allow-pan"
    );
    engine.on("BeforeUnload", this.onUnload, this);
    this.Root.addEventListener("action-activate", this.onActivateEventListener);
    const attrComponentID = this.Root.getAttribute("city-id");
    const attrX = this.Root.getAttribute("x");
    const attrY = this.Root.getAttribute("y");
    this.componentID = ComponentID.fromString(attrComponentID);
    this.location = this.getDebugLocation() ?? { x: BANNER_INVALID_LOCATION, y: BANNER_INVALID_LOCATION };
    if (attrX !== null && attrY !== null) {
      const x = Number.parseInt(attrX);
      const y = Number.parseInt(attrY);
      if (!isNaN(x) && !isNaN(y)) {
        this.location.x = x;
        this.location.y = y;
      }
    }
    if (ComponentID.isInvalid(this.componentID)) {
      console.error("City banner could not attach to manager because componentID sent was invalid.");
      return;
    }
    const manager = CityBannerManager.instance;
    manager.addChildForTracking(this);
    this.city = Cities.get(this.componentID);
    if (this.location.x == BANNER_INVALID_LOCATION || this.location.y == BANNER_INVALID_LOCATION) {
      if (this.city && this.city.isValid) {
        this.location.x = this.city.location.x;
        this.location.y = this.city.location.y;
      } else {
        console.error(
          `city-banners: Got placeholder location for non-city ${ComponentID.toLogString(this.componentID)}`
        );
      }
    }
    this.makeWorldAnchor(this.location);
    this.setVisibility(this.getVisibility());
    this.buildBanner();
  }
  /** Debug only: (this part of the) DOM is reloading. */
  onUnload() {
    this.cleanup();
  }
  onDetach() {
    this.cleanup();
    super.onDetach();
  }
  cleanup() {
    const manager = CityBannerManager.instance;
    manager.removeChildFromTracking(this);
    engine.off("BeforeUnload", this.onUnload, this);
    this.Root.removeEventListener("action-activate", this.onActivateEventListener);
    this.destroyWorldAnchor();
    this.componentID = ComponentID.getInvalidID();
  }
  onActivate() {
    if (this.componentID.owner == GameContext.localPlayerID) {
      UI.Player.selectCity(this.componentID);
    } else {
      const otherPlayer = Players.get(this.componentID.owner);
      if (!otherPlayer) {
        console.error("city-banners: Invalid player library for owner of clicked city.");
        return;
      }
      if (otherPlayer.isMajor || otherPlayer.isMinor || otherPlayer.isIndependent) {
        if (!Game.Diplomacy.hasMet(GameContext.localPlayerID, this.componentID.owner)) {
          return;
        }
        window.dispatchEvent(new RaiseDiplomacyEvent(this.componentID.owner));
      }
    }
  }
  setVisibility(state) {
    if (this.isHidden) {
      return;
    }
    switch (state) {
      case RevealedStates.HIDDEN:
        this.Root.classList.add("hidden");
        break;
      case RevealedStates.REVEALED:
        this.Root.classList.remove("hidden");
        break;
      case RevealedStates.VISIBLE:
        this.Root.classList.remove("hidden");
        break;
      default:
        console.warn(
          "Unknown visibility reveal type passed to city banner. vis: ",
          state,
          "  cid: ",
          ComponentID.toLogString(this.componentID)
        );
        break;
    }
  }
  getVisibility() {
    return GameplayMap.getRevealedState(GameContext.localObserverID, this.location.x, this.location.y);
  }
  makeWorldAnchor(location) {
    this._worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(
      location,
      BANNER_ANCHOR_OFFSET,
      PlacementMode.TERRAIN
    );
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
  /**
   * Realizes the entire banner.
   */
  buildBanner() {
    const city = this.city;
    const playerID = this.componentID.owner;
    const player = Players.get(playerID);
    if (!player) {
      console.error("Unable to (re)build banner due to not having a valid player: ", playerID);
      return;
    }
    let bannerType = BannerType.village;
    if (city) {
      bannerType = player.isMinor ? BannerType.cityState : city.isTown ? BannerType.town : BannerType.city;
    }
    let bonusDefinition = void 0;
    let civSymbol = "";
    if (bannerType == BannerType.cityState || bannerType == BannerType.village) {
      let cityStateColor = "";
      let cityStateIcon = "";
      const bonusType = Game.CityStates.getBonusType(playerID);
      bonusDefinition = GameInfo.CityStateBonuses.find((t) => t.$hash == bonusType);
      const player2 = Players.get(this.componentID.owner);
      if (player2) {
        let yieldType = "";
        let indCivType = GameInfo.Civilizations.lookup(
          player2.civilizationType
        )?.CivilizationType;
        let imagePath = "";
        GameInfo.Independents.forEach((indDef) => {
          if (player2.civilizationAdjective == indDef.CityStateName) {
            indCivType = indDef.CityStateType;
          }
        });
        switch (indCivType) {
          case "MILITARISTIC":
            cityStateColor = "#AF1B1C";
            cityStateIcon = "url('blp:bonustype_militaristic.png')";
            break;
          case "SCIENTIFIC":
            yieldType = "YIELD_SCIENCE";
            cityStateColor = "#4D7C96";
            cityStateIcon = "url('blp:bonustype_scientific.png')";
            break;
          case "ECONOMIC":
            yieldType = "YIELD_GOLD";
            cityStateColor = "#FFD553";
            cityStateIcon = "url('blp:bonustype_economic.png')";
            break;
          case "CULTURAL":
            yieldType = "YIELD_CULTURE";
            cityStateColor = "#892BB3";
            cityStateIcon = "url('blp:bonustype_cultural.png')";
            break;
          case "DIPLOMATIC":
            yieldType = "YIELD_DIPLOMACY";
            cityStateColor = "#255BE4";
            cityStateIcon = "url('blp:bonustype_diplomatic.png')";
            break;
          case "EXPANSIONIST":
            yieldType = "YIELD_FOOD";
            cityStateColor = "#00A717";
            cityStateIcon = "url('blp:bonustype_expansionist.png')";
            break;
          case "CIVILIZATION_INDEPENDENT":
            cityStateColor = "#AF1B1C";
            cityStateIcon = "url('blp:bonustype_crisis.png')";
            break;
        }
        imagePath = yieldType != "" ? "url(" + UI.getIconURL(yieldType, indCivType == "MILITARISTIC" ? "PLAYER_RELATIONSHIP" : "YIELD") + ")" : "url('blp:Action_Attack.png')";
        civSymbol = imagePath;
      }
      if (!bonusDefinition && bonusType != -1) {
        console.error(`city-banners: couldn't find definition for city-state bonus type ${bonusType}`);
      }
      this.realizeCityStateType(cityStateColor, cityStateIcon);
    } else {
      civSymbol = Icon.getCivSymbolCSSFromPlayer(this.componentID);
    }
    let tooltip = "";
    let icon = "";
    let leaderName = "";
    const leaderType = player.leaderType;
    if (leaderType != -1) {
      icon = Icon.getLeaderPortraitIcon(leaderType);
      const leader = GameInfo.Leaders.lookup(leaderType);
      if (leader) {
        leaderName = Locale.compose(leader.Name);
      } else {
        console.error(`city-banners: Could not find leader object of type '${leaderType}'.`);
        leaderName = Locale.compose("LOC_LEADER_NONE_NAME");
      }
    } else {
      if (bannerType == BannerType.village || (bannerType == BannerType.town || bannerType == BannerType.city) && player.isIndependent) {
        leaderName = Locale.compose(player.name);
      } else {
        if (player.isMinor == false) {
          console.error(`city-banners: Leadertype of '-1' is also not an IP or a minor.`);
        }
        leaderName = Locale.compose("LOC_LEADER_NONE_NAME");
      }
    }
    const civName = Locale.compose(GameplayMap.getOwnerName(this.location.x, this.location.y));
    if (player.isMinor && player.Influence?.hasSuzerain) {
      const suzerain = player.Influence.getSuzerain();
      const suzerainPlayer = Players.get(suzerain);
      if (suzerainPlayer) {
        icon = Icon.getLeaderPortraitIcon(suzerainPlayer.leaderType);
        const suzerainLeaderName = Locale.compose(suzerainPlayer.name);
        tooltip = `<div>${suzerainLeaderName}</div><div>${civName}</div>`;
      }
      if (bonusDefinition?.Name) {
        const bonusDefinitionName = Locale.compose(bonusDefinition.Name);
        tooltip += `<div>${bonusDefinitionName}</div>`;
      }
      this.affinityUpdate();
    } else {
      tooltip = `<div>${leaderName}</div><div>${civName}</div>`;
    }
    let name = "";
    if (city) {
      name = city.name;
    } else {
      if (player == null) {
        name = Locale.compose("LOC_TERM_NONE");
        console.error(
          `city-banners: buildBanner(): couldn't get player for independent with PlayerId ${this.componentID.owner}`
        );
      } else {
        name = Locale.compose(player.civilizationFullName);
      }
    }
    const bannerData = {
      name,
      icon,
      tooltip,
      bannerType
    };
    this.setCityInfo(bannerData);
    if (city) {
      this.realizePopulation();
      this.realizeBuilds();
      this.realizeHappiness();
      this.realizeReligion();
    }
    if (bannerType == BannerType.village) {
      this.affinityUpdate();
    }
    this.realizeTradeNetwork();
    this.realizePlayerColors();
    this.realizeCivHeraldry(civSymbol);
    this.updateConqueredIcon();
  }
  /**
   * Set the static information inside of the city banner.
   * @param {BannerData} data All string data is locale translated.
   */
  setCityInfo(data) {
    const name = data.name ?? "LOC_CITY_NAME_UNSET";
    const icon = data.icon ?? "blp:base-standard/ui/icons/leaders/leader_portrait_unknown.png";
    const {
      capitalIndicator,
      originalCapitalIndicator,
      originalCapitalCurrIndicator,
      container_bg,
      cityName,
      portrait,
      portraitIcon
    } = this.elements;
    cityName.setAttribute("data-l10n-id", name);
    portraitIcon.style.backgroundImage = `url('${icon}')`;
    portrait.setAttribute("data-tooltip-content", data.tooltip);
    this.Root.classList.remove(
      "city-banner--town",
      "city-banner--city",
      "city-banner--city-other",
      "city-banner--citystate"
    );
    if (data.bannerType == BannerType.town) {
      cityName.setAttribute("data-tooltip-content", Locale.compose("LOC_CAPITAL_SELECT_PROMOTION_NONE"));
      container_bg.setAttribute("data-tooltip-content", Locale.compose("LOC_CAPITAL_SELECT_PROMOTION_NONE"));
      this.Root.classList.add("city-banner--town");
      if (this.city && this.city.isValid) {
        originalCapitalIndicator.classList.toggle(
          "hidden",
          !this.city.isOriginalCapital || this.city.isCapital
        );
        originalCapitalIndicator.classList.add("city-banner__town-original-capital-star");
      }
    } else {
      cityName.setAttribute("data-tooltip-content", data.tooltip);
      container_bg.setAttribute("data-tooltip-content", data.tooltip);
      if (data.bannerType == BannerType.cityState) {
        this.Root.classList.add("city-banner--citystate");
      } else if (data.bannerType == BannerType.village) {
        this.Root.classList.add("city-banner--village", "city-banner--town");
      } else {
        const isLocalPlayerCity = this.componentID.owner === GameContext.localObserverID;
        this.Root.classList.toggle("city-banner--city", isLocalPlayerCity);
        this.Root.classList.toggle("city-banner--city-other", !isLocalPlayerCity);
        if (this.city && this.city.isValid) {
          capitalIndicator.classList.toggle("hidden", !this.city.isCapital || this.city.isOriginalCapital);
          originalCapitalIndicator.classList.toggle(
            "hidden",
            !this.city.isOriginalCapital || this.city.isCapital
          );
          originalCapitalCurrIndicator.classList.toggle(
            "hidden",
            !this.city.isCapital || !this.city.isOriginalCapital
          );
          const player = Players.get(this.componentID.owner);
          if (player && player.isIndependent) {
            capitalIndicator.classList.add("hidden");
            originalCapitalCurrIndicator.classList.add("hidden");
          }
        }
      }
    }
  }
  realizePopulation() {
    const showGrowthQueue = this.city && this.city.isValid;
    this.elements.growthQueueContainer.classList.toggle("hidden", !showGrowthQueue);
    if (this.city && this.city.isValid) {
      this.elements.growthQueue.dataset.cityid = JSON.stringify(this.city.id);
      this.elements.growthQueue.dataset.population = this.city.population.toString();
      this.elements.growthQueue.dataset.currentFood = (this.city.Growth?.currentFood ?? 0).toString();
      this.elements.growthQueue.dataset.canGrow = !this.city.isTown || this.city.Growth?.growthType == GrowthTypes.EXPAND ? "true" : "false";
      this.elements.growthQueue.dataset.foodPerTurn = (this.city.Yields?.getNetYield(YieldTypes.YIELD_FOOD) ?? 0).toString();
    }
  }
  realizeCityStateType(color, icon) {
    const iconDiv = MustGetElement(".city-banner__city-state-icon", this.Root);
    iconDiv.style.backgroundImage = icon;
    iconDiv.style.fxsBackgroundImageTint = color;
  }
  realizePlayerColors() {
    let playerColorPri = UI.Player.getPrimaryColorValueAsString(this.componentID.owner);
    const playerColorSec = UI.Player.getSecondaryColorValueAsString(this.componentID.owner);
    if (playerColorPri == playerColorSec) {
      playerColorPri = "rgb(155, 0, 0)";
    }
    this.Root.style.setProperty("--player-color-primary", playerColorPri);
    this.Root.style.setProperty("--player-color-secondary", playerColorSec);
    this.Root.style.display = "flex";
  }
  realizeCivHeraldry(icon) {
    this.civPatternElements ??= this.Root.getElementsByClassName(
      "city-banner__pattern"
    );
    const civPattern = Icon.getCivLineCSSFromPlayer(this.componentID);
    for (let i = 0; i < this.civPatternElements.length; i++) {
      this.civPatternElements[i].style.backgroundImage = civPattern;
    }
    this.civSymbols ??= this.Root.getElementsByClassName("city-banner__symbol");
    for (let i = 0; i < this.civSymbols.length; i++) {
      this.civSymbols[i].style.backgroundImage = icon;
    }
  }
  realizeReligion() {
    if (this.city && this.city.isValid) {
      this.Root.classList.remove("city-banner--has-religion");
      const religion = GameInfo.Religions.find(
        (t) => t.$hash == this.city?.Religion?.majorityReligion
      );
      if (religion) {
        const playerLib = Players.get(
          Game.Religion.getPlayerFromReligion(religion.ReligionType)
        );
        if (!playerLib) {
          console.error(
            `city-banners.ts: realizeReligion - null player library found for religion type ${religion.ReligionType}`
          );
          return;
        }
        const playerRel = playerLib.Religion;
        if (!playerRel) {
          console.error(
            `city-banners.ts: realizeReligion - undefined player religion library for player id ${playerLib.id}`
          );
          return;
        }
        const icon = UI.getIconCSS(religion.ReligionType, "RELIGION");
        this.elements.urbanReligionSymbol.style.backgroundImage = icon;
        this.elements.ruralReligionSymbol.classList.add("hidden");
        this.elements.ruralReligionSymbolBackground.classList.add("hidden");
        this.elements.urbanReligionSymbolBackground.setAttribute(
          "data-tooltip-content",
          playerRel.getReligionName()
        );
        this.elements.cityName.classList.add("city-banner__icons-below-name");
        this.Root.classList.add("city-banner--has-religion");
      } else {
        const urbanReligion = GameInfo.Religions.find(
          (t) => t.$hash == this.city?.Religion?.urbanReligion
        );
        if (urbanReligion) {
          const urbanReligionPlayerLib = Players.get(
            Game.Religion.getPlayerFromReligion(urbanReligion.ReligionType)
          );
          if (!urbanReligionPlayerLib) {
            console.error(
              `city-banners.ts: realizeReligion - null player library found for urban religion type ${urbanReligion.ReligionType}`
            );
            return;
          }
          const urbanPlayerRel = urbanReligionPlayerLib.Religion;
          if (!urbanPlayerRel) {
            console.error(
              `city-banners.ts: realizeReligion - undefined player urban religion library for player id ${urbanReligionPlayerLib.id}`
            );
            return;
          }
          const icon = UI.getIconCSS(urbanReligion.ReligionType, "RELIGION");
          this.elements.urbanReligionSymbol.style.backgroundImage = icon;
          this.elements.cityName.classList.add("city-banner__icons-below-name");
          this.Root.classList.add("city-banner--has-religion");
          this.elements.urbanReligionSymbolBackground.setAttribute(
            "data-tooltip-content",
            Locale.stylize("LOC_DISTRICT_URBAN_NAME") + "[N]" + Locale.stylize(urbanPlayerRel.getReligionName())
          );
        }
        const ruralReligion = GameInfo.Religions.find(
          (t) => t.$hash == this.city?.Religion?.ruralReligion
        );
        if (ruralReligion) {
          const ruralReligionPlayerLib = Players.get(
            Game.Religion.getPlayerFromReligion(ruralReligion.ReligionType)
          );
          if (!ruralReligionPlayerLib) {
            console.error(
              `city-banners.ts: realizeReligion - null player library found for rural religion type ${ruralReligion.ReligionType}`
            );
            return;
          }
          const ruralPlayerRel = ruralReligionPlayerLib.Religion;
          if (!ruralPlayerRel) {
            console.error(
              `city-banners.ts: realizeReligion - undefined player rural religion library for player id ${ruralReligionPlayerLib.id}`
            );
            return;
          }
          const icon = UI.getIconCSS(ruralReligion.ReligionType, "RELIGION");
          this.elements.ruralReligionSymbol.style.backgroundImage = icon;
          this.elements.ruralReligionSymbol.classList.remove("hidden");
          this.elements.ruralReligionSymbolBackground.classList.remove("hidden");
          this.elements.cityName.classList.add("city-banner__icons-below-name");
          this.Root.classList.add("city-banner--has-religion");
          this.elements.ruralReligionSymbolBackground.setAttribute(
            "data-tooltip-content",
            Locale.stylize("LOC_DISTRICT_RURAL_NAME") + "[N]" + Locale.stylize(ruralPlayerRel.getReligionName())
          );
        }
      }
    } else {
      console.error(
        "City Banner missing city object when religion changed. cid: ",
        ComponentID.toLogString(this.componentID)
      );
    }
  }
  realizeBuilds() {
    const { productionQueueContainer, productionQueue } = this.elements;
    if (this.city && this.city.isValid) {
      const isLocalPlayerCity = this.city.owner === GameContext.localObserverID;
      if (!isLocalPlayerCity) {
        productionQueueContainer.classList.toggle("hidden", true);
        return;
      }
      const buildQueue = this.city.BuildQueue;
      const cityProduction = this.city.Production;
      if (buildQueue && cityProduction) {
        if (buildQueue.isEmpty) {
          productionQueueContainer.classList.toggle("hidden", true);
        } else {
          productionQueueContainer.classList.toggle("hidden", false);
          productionQueue.dataset.cityid = JSON.stringify(this.city.id);
          productionQueue.dataset.prodPerTurn = (this.city.Yields?.getNetYield(YieldTypes.YIELD_PRODUCTION) ?? 0).toString();
          productionQueue.dataset.turnsLeft = buildQueue.currentTurnsLeft.toString();
          productionQueue.dataset.percent = buildQueue.getPercentComplete(buildQueue.currentProductionTypeHash).toString();
          this.processBuilds(buildQueue, cityProduction);
        }
      } else {
        productionQueueContainer.classList.toggle("hidden", true);
        console.error("City-banners: RealizeBuilds: city.BuildQueue or city.Production was undefined");
      }
    } else {
      productionQueueContainer.classList.toggle("hidden", true);
      console.error(
        "City Banner missing city object when production changed. cid: ",
        ComponentID.toLogString(this.componentID)
      );
    }
  }
  processBuilds(buildQueue, cityProduction) {
    const { productionQueue } = this.elements;
    const queueData = [];
    const queueNodes = buildQueue.getQueue() ?? [];
    const queueMax = 4;
    if (queueNodes.length > 0) {
      for (let index = 0; index < queueNodes.length; index++) {
        if (index > queueMax) break;
        const queueItem = queueNodes[index];
        switch (queueItem.kind) {
          case ProductionKind.CONSTRUCTIBLE: {
            const buildingInfo = GameInfo.Constructibles.lookup(queueItem.constructibleType);
            if (buildingInfo) {
              queueData.push({
                type: buildingInfo.ConstructibleType,
                name: buildingInfo.Name,
                icon: `url('${Icon.getConstructibleIconFromDefinition(buildingInfo)}')`,
                kind: ProductionPanelCategory.BUILDINGS,
                cost: cityProduction.getConstructibleProductionCost(buildingInfo.ConstructibleType),
                progress: buildQueue.getPercentComplete(queueItem.type),
                turns: buildQueue.getTurnsLeft(queueItem.constructibleType)
              });
            }
            break;
          }
          case ProductionKind.UNIT: {
            const unitInfo = GameInfo.Units.lookup(queueItem.unitType);
            if (unitInfo) {
              queueData.push({
                type: unitInfo.UnitType,
                name: unitInfo.Name,
                icon: `url('${Icon.getUnitIconFromDefinition(unitInfo)}')`,
                kind: ProductionPanelCategory.UNITS,
                cost: cityProduction.getUnitProductionCost(unitInfo.UnitType),
                progress: buildQueue.getPercentComplete(queueItem.type),
                turns: buildQueue.getTurnsLeft(queueItem.unitType)
              });
            }
            break;
          }
          case ProductionKind.PROJECT: {
            const projectInfo = GameInfo.Projects.lookup(queueItem.projectType);
            if (projectInfo) {
              queueData.push({
                type: projectInfo.ProjectType,
                name: projectInfo.Name,
                icon: `url('${Icon.getProjectIconFromDefinition(projectInfo)}')`,
                kind: ProductionPanelCategory.PROJECTS,
                cost: cityProduction.getProjectProductionCost(projectInfo.ProjectType),
                progress: buildQueue.getPercentComplete(queueItem.type),
                turns: buildQueue.getTurnsLeft(queueItem.projectType)
              });
            }
            break;
          }
          default:
            break;
        }
      }
    }
    while (queueData.length <= queueMax) {
      queueData.push({
        type: "",
        name: "",
        icon: "",
        kind: "",
        cost: 0,
        progress: 0,
        turns: 0
      });
    }
    const currentData = queueData.shift();
    productionQueue.dataset.currentProduction = JSON.stringify(currentData);
    productionQueue.dataset.buildQueue = JSON.stringify(queueData);
  }
  realizeTradeNetwork() {
    if (this.city && this.city.isValid && this.city.Trade) {
      const isInNetwork = this.city.Trade.isInTradeNetwork();
      const isLocalPlayerCity = this.city.owner === GameContext.localObserverID;
      this.elements.tradeNetworkIcon.classList.toggle(
        "city-banner__trade-network--hidden",
        !isLocalPlayerCity || isInNetwork
      );
      if (!isInNetwork) {
        const tooltipText = `${Locale.compose("LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED")} ${Locale.compose("LOC_UI_CITY_STATUS_TRADE_NOT_CONNECTED_DESCRIPTION")}`;
        this.elements.tradeNetworkIcon.setAttribute("data-tooltip-content", tooltipText);
      }
    } else {
      this.elements.tradeNetworkIcon.classList.toggle("city-banner__trade-network--hidden", true);
    }
  }
  realizeHappiness() {
    if (this.city && this.city.isValid) {
      const happiness = this.city.Yields?.getYield(YieldTypes.YIELD_HAPPINESS);
      if (happiness == void 0) {
        console.error(
          "city-banners.ts: realizeHappiness() failed to find happiness yield for city cid: ",
          ComponentID.toLogString(this.componentID)
        );
        return;
      }
      if (this.city.isInfected) {
        this.elements.statusIcon.setAttribute("data-tooltip-content", "LOC_UI_CITY_DETAILS_INFECTED");
        const icon = UI.getIconURL("YIELD_PLAGUE", "YIELD");
        this.elements.statusIcon.style.backgroundImage = `url('${icon}')`;
      } else {
        for (const stage of happinessStages) {
          if (happiness >= stage.min && happiness <= stage.max) {
            this.elements.statusIcon.setAttribute("data-tooltip-content", stage.name);
            const icon = UI.getIconURL(stage.icon, "YIELD");
            this.elements.statusIcon.style.backgroundImage = `url('${icon}')`;
            break;
          }
        }
      }
      const isLocalPlayerCity = this.componentID.owner === GameContext.localObserverID;
      this.elements.cityName.classList.toggle("city-banner__status--hidden", !isLocalPlayerCity);
      if (!this.city.Happiness) {
        console.error(
          `city-banners: City happiness is not valid, cid: ${ComponentID.toLogString(this.componentID)}`
        );
      }
      this.Root.classList.toggle("city-banner--unrest", this.city.Happiness?.hasUnrest);
      const unrestTurns = this.city.Happiness?.turnsOfUnrest;
      if (unrestTurns != void 0 && unrestTurns >= 0) {
        const remainingUnrest = Math.max(0, unrestTurns);
        this.elements.unrestTurns.innerHTML = remainingUnrest.toString();
      }
      this.Root.classList.toggle("city-banner--razing", this.city.isBeingRazed);
      const razedTurns = this.city.getTurnsUntilRazed.toString();
      this.elements.razedTurns.innerHTML = razedTurns;
    } else {
      console.error(
        "city-banners.ts: realizeHappiness() failed to have a valid city cid: ",
        ComponentID.toLogString(this.componentID)
      );
    }
  }
  affinityUpdate() {
    const localPlayerID = GameContext.localObserverID;
    if (localPlayerID == PlayerIds.NO_PLAYER && Autoplay.isActive) {
      return;
    }
    const player = Players.get(this.componentID.owner);
    if (player) {
      let relationship = Game.IndependentPowers.getIndependentRelationship(this.componentID.owner, localPlayerID);
      if (player.isMinor) {
        const cityStatePlayer = Players.get(this.componentID.owner);
        const suzerainPlayer = cityStatePlayer?.Influence?.getSuzerain() ? Players.get(cityStatePlayer?.Influence?.getSuzerain()) : null;
        if (suzerainPlayer)
          relationship = Game.IndependentPowers.getIndependentRelationship(suzerainPlayer.id, localPlayerID);
      }
      if (relationship == IndependentRelationship.NOT_APPLICABLE) {
        console.warn("city-banners: Village Banner unable to determine affinity relationship.");
        return;
      }
      const classList = this.Root.classList;
      classList.toggle("city-banner--friendly", relationship == IndependentRelationship.FRIENDLY);
      classList.toggle("city-banner--hostile", relationship == IndependentRelationship.HOSTILE);
      classList.toggle("city-banner--neutral", relationship == IndependentRelationship.NEUTRAL);
    }
  }
  capitalUpdate() {
    const capitalIndicator = MustGetElement(".city-banner__capital-star", this.Root);
    const originalCapitalIndicator = MustGetElement(".city-banner__original-capital-star", this.Root);
    const originalCapitalCurrIndicator = MustGetElement(".city-banner__original-capital-curr-star", this.Root);
    if (this.city && this.city.isValid) {
      capitalIndicator.classList.toggle("hidden", !this.city.isCapital || this.city.isOriginalCapital);
      originalCapitalIndicator.classList.toggle("hidden", !this.city.isOriginalCapital || this.city.isCapital);
      originalCapitalCurrIndicator.classList.toggle(
        "hidden",
        !this.city.isCapital || !this.city.isOriginalCapital
      );
      const player = Players.get(this.componentID.owner);
      if (player && player.isIndependent) {
        capitalIndicator.classList.add("hidden");
        originalCapitalCurrIndicator.classList.add("hidden");
      }
    }
  }
  /**
   * Local player changed (hotseat).
   */
  localPlayerUpdate() {
    const isLocalPlayerCity = this.componentID.owner === GameContext.localObserverID;
    const isMajorCity = this.Root.classList.contains("city-banner--city") || this.Root.classList.contains("city-banner--city-other");
    if (isMajorCity) {
      this.Root.classList.toggle("city-banner--city", isLocalPlayerCity);
      this.Root.classList.toggle("city-banner--city-other", !isLocalPlayerCity);
    }
    this.affinityUpdate();
  }
  updateConqueredIcon() {
    if (this.city && this.city.isValid && this.city.originalOwner != this.city.owner && this.city.mostRecentTranseferType != CityTransferTypes.BY_INCORPORATE_CITY_STATE && this.city.owner == GameContext.localObserverID) {
      const conqueredIcon = this.Root.querySelector(".city-banner__conquered-icon");
      if (!conqueredIcon) {
        console.error("city-banners: Unable to find element with class .city-banner__conquered-icon!");
        return;
      }
      conqueredIcon.setAttribute("data-tooltip-content", Locale.compose("LOC_CITY_BANNER_CONQUERED_TOOLTIP"));
      this.Root.classList.add("city-banner--conquered");
    } else {
      this.Root.classList.remove("city-banner--conquered");
    }
  }
  hide() {
    if (this.isHidden) {
      return;
    }
    this.isHidden = true;
    this.Root.classList.add("hidden");
  }
  show() {
    if (!this.isHidden) {
      return;
    }
    this.isHidden = false;
    this.setVisibility(this.getVisibility());
  }
  disable() {
    this.Root.classList.add("disabled");
    this.Root.removeEventListener("action-activate", this.onActivateEventListener);
    const elements = this.Root.querySelectorAll(this.inputSelector);
    if (elements.length == 0) {
      console.warn(
        `city-banners: disable(): Unable to disable city banner pieces. cid: ${ComponentID.toLogString(this.componentID)}`
      );
      return;
    }
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add("disabled");
    }
  }
  enable() {
    this.Root.classList.remove("disabled");
    this.Root.addEventListener("action-activate", this.onActivateEventListener);
    const elements = this.Root.querySelectorAll(this.inputSelector);
    if (elements.length == 0) {
      console.warn(
        `city-banners: disable(): Unable to disable city banner pieces. cid: ${ComponentID.toLogString(this.componentID)}`
      );
      return;
    }
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("disabled");
    }
  }
  remove() {
    this.Destroy();
  }
}
Controls.define("city-banner", {
  createInstance: CityBannerComponent,
  description: "City Banner",
  classNames: ["city-banner", "allowCameraMovement"],
  styles: [styles],
  innerHTML: [content]
});

export { CityBannerComponent };
//# sourceMappingURL=city-banners.js.map
