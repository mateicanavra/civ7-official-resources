import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement, MustGetElements } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame\r\n\tframe-style=\"f2\"\r\n\tfiligree-class=\"mt-3\"\r\n\ttop-border-style=\"b2\"\r\n\tclass=\"flex items-center flex-col w-full h-full\"\r\n\toverride-styling=\"pt-5 mt-6 relative flex size-full pb-10 px-10\"\r\n\tcontent-class=\"w-full\"\r\n>\r\n\t<fxs-close-button class=\"top-1 right-1\"></fxs-close-button>\r\n\t<fxs-header\r\n\t\ttitle=\"LOC_GLOBAL_YIELDS_TITLE\"\r\n\t\tclass=\"font-title-xl\"\r\n\t></fxs-header>\r\n\t<div class=\"yield-report__header flex items-center justify-between grow max-h-16 w-full\">\r\n\t\t<div class=\"yield-report__header-filler w-72 h-11 ml-10\"></div>\r\n\t\t<div\r\n\t\t\tclass=\"font-body-base text-accent-4 text-center self-center max-w-96\"\r\n\t\t\tdata-l10n-id=\"LOC_GLOBAL_YIELDS_SUBTITLE\"\r\n\t\t></div>\r\n\t\t<fxs-activatable\r\n\t\t\taction-key=\"inline-shell-action-1\"\r\n\t\t\tclass=\"right-0 yield-report__collapse-toggle-button w-72 h-11 mr-10 text-center flex items-center justify-center relative group\"\r\n\t\t>\r\n\t\t\t<div class=\"absolute hud_sidepanel_list-bg inset-0 pointer-events-none\">\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"absolute inset-0 img-list-focus-frame opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity\"\r\n\t\t\t\t></div>\r\n\t\t\t</div>\r\n\r\n\t\t\t<div\r\n\t\t\t\tdata-l10n-id=\"LOC_GLOBAL_YIELDS_COLLAPSE_ALL\"\r\n\t\t\t\tclass=\"yield-report__collapse-toggle-text mx-2 font-title-xl relative\"\r\n\t\t\t></div>\r\n\t\t</fxs-activatable>\r\n\t</div>\r\n\t<fxs-scrollable\r\n\t\tclass=\"yield-report-scrollable flex-auto mr-6\"\r\n\t\thandle-gamepad-pan=\"true\"\r\n\t\ttabindex=\"-1\"\r\n\t>\r\n\t\t<fxs-vslot class=\"yield-report-vslot mr-8 ml-10\">\r\n\t\t\t<div class=\"yield-report__city-container relative grow\">\r\n\t\t\t\t<chooser-item class=\"yield-report__city-collapsible flex justify-between items-center my-1\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_GLOBAL_YIELDS_SETTLEMENT_INCOME\"\r\n\t\t\t\t\t\tclass=\"relative font-title-xl ml-3\"\r\n\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"flex items-center mr-3\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"img-arrow rotate-90 city-collapse-arrow collapse-arrow h-8 w-12 bg-cover bg-center\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</chooser-item>\r\n\t\t\t\t<div class=\"yield-report__city-data flex flex-col\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"yield-report__other-container relative grow\">\r\n\t\t\t\t<chooser-item class=\"yield-report__other-collapsible flex justify-between items-center my-1\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_GLOBAL_YIELDS_OTHER_INCOME\"\r\n\t\t\t\t\t\tclass=\"relative font-title-xl ml-3\"\r\n\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"flex items-center mr-3\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"img-arrow rotate-90 other-collapse-arrow collapse-arrow h-8 w-12 bg-cover bg-center\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</chooser-item>\r\n\t\t\t\t<div class=\"yield-report__other-data flex flex-col\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"yield-report__unit-container relative grow\">\r\n\t\t\t\t<chooser-item class=\"yield-report__unit-collapsible flex justify-between items-center my-1\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_GLOBAL_YIELDS_UNIT_EXPENSE\"\r\n\t\t\t\t\t\tclass=\"relative font-title-xl ml-3\"\r\n\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"flex items-center mr-3 relative\">\r\n\t\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\t\tdata-icon-id=\"YIELD_GOLD\"\r\n\t\t\t\t\t\t\tdata-icon-context=\"DEFAULT\"\r\n\t\t\t\t\t\t\tclass=\"size-8 mr-1\"\r\n\t\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t\t<div class=\"yield-report__unit-gold-total font-body-base\"></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"img-arrow rotate-90 unit-collapse-arrow collapse-arrow h-8 w-12 bg-cover bg-center\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</chooser-item>\r\n\t\t\t\t<div class=\"yield-report__unit-data flex flex-col\"></div>\r\n\t\t\t</div>\r\n\t\t</fxs-vslot>\r\n\t</fxs-scrollable>\r\n\t<div>\r\n\t\t<fxs-header\r\n\t\t\ttitle=\"LOC_GLOBAL_YIELDS_SUMMARY_TITLE\"\r\n\t\t\tclass=\"font-title-xl self-center my-3\"\r\n\t\t\tfiligree-style=\"none\"\r\n\t\t></fxs-header>\r\n\t\t<div class=\"yield-report__summary flex flex-col\"></div>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/player-yields-report/player-yields-report-screen.css";

class ModelYieldsReport {
  _yieldTotalRows = [];
  _yieldCityRows = [];
  _yieldUnitRows = [];
  _yieldSummaryRows = [];
  _yieldOtherRows = [];
  totalYield = this.createBlankMap();
  totalYieldCity = this.createBlankMap();
  _netGoldFromUnits = 0;
  _curGoldBalance = 0;
  _curInfluenceBalance = 0;
  onUpdate;
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  update() {
    this.constructTotalData();
    this.constructCityData();
    this.constructUnitData();
    this.constructOtherData();
    this.constructYieldSummary();
    this.onUpdate?.(this);
  }
  constructTotalData() {
    const player = Players.get(GameContext.localObserverID);
    const playerStats = player?.Stats;
    if (!playerStats) {
      console.error("model-yield-report.ts: constructTotalData - Could not get local player stats!");
      return;
    }
    this._yieldTotalRows = [];
    this.totalYield = this.getYieldMap(playerStats);
    const totalIncomeYieldRow = {
      isTitle: true,
      rowLabel: "LOC_GLOBAL_YIELDS_SUMMARY_TOTAL_INCOME_PER_TURN",
      yieldNumbers: this.totalYield
    };
    this._yieldTotalRows.push(totalIncomeYieldRow);
  }
  constructCityData() {
    const player = Players.get(GameContext.localObserverID);
    const playerCities = player?.Cities;
    if (!playerCities) {
      console.error("model-yield-report.ts: constructCityData - Could not get local player cities!");
      return;
    }
    this._yieldCityRows = [];
    let totalYieldNumbers = this.createBlankMap();
    for (const city of playerCities.getCities()) {
      const cityYields = city.Yields;
      if (!cityYields) {
        console.error(`model-yield-report.ts: constructCityData - No city yields for city ${city.id}`);
        return;
      }
      const cityWorkers = city.Workers;
      if (!cityWorkers) {
        console.error(`model-yield-report.ts: constructCityData - No city workers for city ${city.id}`);
        return;
      }
      const cityConstructibles = city.Constructibles;
      if (!cityConstructibles) {
        console.error(`model-yield-report.ts: constructCityData - No city constructibles for city ${city.id}`);
        return;
      }
      const cityYieldNumbers = this.getYieldMap(cityYields);
      const cityNetYields = {
        isTitle: false,
        rowLabel: city.name,
        rowIcon: "CHAT_BUILDINGS",
        yieldNumbers: cityYieldNumbers
      };
      const cityCenterYields = {
        isTitle: false,
        rowLabel: "LOC_DISTRICT_CITY_CENTER_NAME",
        rowIcon: "CITY_CENTERPIN",
        rowLabelTabbed: true,
        yieldNumbers: this.getCityCenterYields(city)
      };
      const cityUrbanYields = {
        isTitle: false,
        rowLabel: "LOC_GLOBAL_YIELDS_URBAN_DISTRICTS",
        rowIcon: "CITY_URBAN",
        rowLabelTabbed: true,
        yieldNumbers: this.getCityDistrictTypeYields(city, DistrictTypes.URBAN)
      };
      const cityRuralYields = {
        isTitle: false,
        rowLabel: "LOC_GLOBAL_YIELDS_RURAL_DISTRICTS",
        rowIcon: "CITY_RURAL",
        rowLabelTabbed: true,
        yieldNumbers: this.getCityDistrictTypeYields(city, DistrictTypes.RURAL)
      };
      const specialistYieldMap = this.createBlankMap();
      const allWorkerPlacementInfo = cityWorkers.GetAllPlacementInfo();
      for (const workerPlacementInfo of allWorkerPlacementInfo) {
        for (let i = 0; i < workerPlacementInfo.CurrentMaintenance.length; i++) {
          specialistYieldMap[Game.getHash(GameInfo.Yields[i].YieldType)] -= workerPlacementInfo.CurrentMaintenance[i];
        }
        for (let i = 0; i < workerPlacementInfo.CurrentYields.length; i++) {
          specialistYieldMap[Game.getHash(GameInfo.Yields[i].YieldType)] += workerPlacementInfo.CurrentYields[i];
        }
      }
      const citySpecialistYields = {
        isTitle: false,
        rowLabel: "LOC_UI_FOOD_CHOOSER_SPECIALISTS",
        rowIcon: "CITY_SPECIAL_BASE",
        rowLabelTabbed: true,
        yieldNumbers: specialistYieldMap
      };
      const buildingMaintenanceMap = {};
      for (const constructibleId of cityConstructibles.getIds()) {
        const constructible = Constructibles.getByComponentID(constructibleId);
        if (!constructible) {
          console.error(
            `model-yield-report.ts: constructCityData - No constructible found for id ${constructibleId}`
          );
          continue;
        }
        const maintenances = cityConstructibles.getMaintenance(constructible.type);
        for (const maintenanceIndex in maintenances) {
          const maintenanceValue = maintenances[maintenanceIndex];
          if (maintenanceValue == 0) {
            continue;
          }
          const yieldDefinition = GameInfo.Yields[maintenanceIndex];
          const existingValue = buildingMaintenanceMap[yieldDefinition.YieldType];
          if (existingValue) {
            const newValue = existingValue - maintenanceValue;
            buildingMaintenanceMap[yieldDefinition.$hash] = newValue;
          } else {
            buildingMaintenanceMap[yieldDefinition.$hash] = -maintenanceValue;
          }
        }
      }
      const cityBuildingMaintenanceYields = {
        isTitle: false,
        rowLabel: "LOC_ATTR_BUILDING_MAINT",
        rowIcon: "CITY_BUILDING_LIST",
        rowLabelTabbed: true,
        yieldNumbers: buildingMaintenanceMap
      };
      totalYieldNumbers = this.addYieldNumbers(totalYieldNumbers, cityNetYields.yieldNumbers);
      this._yieldCityRows.push(cityNetYields);
      this._yieldCityRows.push(cityCenterYields);
      this._yieldCityRows.push(cityUrbanYields);
      this._yieldCityRows.push(cityRuralYields);
      this._yieldCityRows.push(citySpecialistYields);
      this._yieldCityRows.push(cityBuildingMaintenanceYields);
    }
    this.totalYieldCity = totalYieldNumbers;
    const totalCityYields = {
      isTitle: true,
      rowLabel: "LOC_GLOBAL_YIELDS_TOTAL_FROM_CITIES",
      yieldNumbers: totalYieldNumbers
    };
    this._yieldCityRows.unshift(totalCityYields);
  }
  getCityCenterYields(city) {
    const cityDistricts = city.Districts;
    if (!cityDistricts) {
      console.error(`model-yield-report.ts: getCityCenterYields - No city districts for city ${city.id}`);
      return this.createBlankMap();
    }
    return this.getDistrictYields(cityDistricts.cityCenter, city.owner);
  }
  getCityDistrictTypeYields(city, districtType) {
    let totalNumbers = this.createBlankMap();
    const cityDistricts = city.Districts;
    if (!cityDistricts) {
      console.error(`model-yield-report.ts: getCityDistrictTypeYields - No city districts for city ${city.id}`);
      return totalNumbers;
    }
    const cityUrbanIDs = cityDistricts.getIdsOfType(districtType);
    for (const urbanID of cityUrbanIDs) {
      totalNumbers = this.addYieldNumbers(totalNumbers, this.getDistrictYields(urbanID, city.owner));
    }
    return totalNumbers;
  }
  getDistrictYields(districtID, owner) {
    const cityDistrict = Districts.get(districtID);
    if (!cityDistrict) {
      console.error(`model-yield-report.ts: getDistrictYields - No district found for componentID ${districtID}`);
      return this.createBlankMap();
    }
    const districtYields = GameplayMap.getYields(
      GameplayMap.getIndexFromLocation(cityDistrict.location),
      owner
    );
    const districtYieldsMap = {
      [YieldTypes.YIELD_GOLD]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_GOLD"))?.[1] ?? 0,
      [YieldTypes.YIELD_SCIENCE]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_SCIENCE"))?.[1] ?? 0,
      [YieldTypes.YIELD_DIPLOMACY]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_DIPLOMACY"))?.[1] ?? 0,
      [YieldTypes.YIELD_PRODUCTION]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_PRODUCTION"))?.[1] ?? 0,
      [YieldTypes.YIELD_HAPPINESS]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_HAPPINESS"))?.[1] ?? 0,
      [YieldTypes.YIELD_FOOD]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_FOOD"))?.[1] ?? 0,
      [YieldTypes.YIELD_CULTURE]: districtYields.find((element) => element[0] == Database.makeHash("YIELD_CULTURE"))?.[1] ?? 0
    };
    return districtYieldsMap;
  }
  constructUnitData() {
    this._yieldUnitRows = [];
    const player = Players.get(GameContext.localObserverID);
    const playerUnits = player?.Units;
    if (!playerUnits) {
      console.error("model-yield-report.ts: constructUnitData - Could not get local player units!");
      return;
    }
    const playerStats = player?.Stats;
    if (!playerStats) {
      console.error("model-yield-report.ts: constructUnitData - Could not get local player stats!");
      return;
    }
    const playerTreasury = player?.Treasury;
    if (!playerTreasury) {
      console.error("model-yield-report.ts: constructUnitData - Could not get local player treasury!");
      return;
    }
    const unitsTypesParsed = [];
    let goldTotal = 0;
    for (const unit of playerUnits.getUnits()) {
      if (!unitsTypesParsed.includes(unit.type)) {
        const numUnitsOfType = playerUnits.getNumUnitsOfType(unit.type);
        const unitCost = playerTreasury.getMaintenanceForAllUnitsOfType(unit.type) * -1;
        goldTotal += unitCost;
        const unitRowMap = {
          [YieldTypes.YIELD_GOLD]: unitCost,
          [YieldTypes.NO_YIELD]: numUnitsOfType
        };
        const unitDefinition = GameInfo.Units.lookup(unit.type);
        if (!unitDefinition) {
          console.error(
            `model-yield-report.ts: constructUnitData - Could not unit definition for unit type ${unit.type}!`
          );
          return;
        }
        const unitYieldRow = {
          rowLabel: unit.name,
          rowIcon: unitDefinition.UnitType,
          isTitle: false,
          rowLabelTabbed: true,
          yieldNumbers: unitRowMap
        };
        this._yieldUnitRows.push(unitYieldRow);
        unitsTypesParsed.push(unit.type);
      }
    }
    this._netGoldFromUnits = goldTotal;
  }
  constructYieldSummary() {
    const player = Players.get(GameContext.localObserverID);
    const playerStats = player?.Stats;
    if (!playerStats) {
      console.error("model-yield-report.ts: constructYieldSummary - Could not get local player stats!");
      return;
    }
    const playerTreasury = player?.Treasury;
    if (!playerTreasury) {
      console.error("model-yield-report.ts: constructYieldSummary - Could not get local player treasury!");
      return;
    }
    const playerDiplomacyTreasury = player?.DiplomacyTreasury;
    if (!playerDiplomacyTreasury) {
      console.error(
        "model-yield-report.ts: constructYieldSummary - Could not get local player diplomacy treasury!"
      );
      return;
    }
    this._yieldSummaryRows = [];
    const totalIncomeMap = this.getYieldMap(playerStats);
    const totalIncomeYieldRow = {
      isTitle: true,
      rowLabel: "LOC_GLOBAL_YIELDS_SUMMARY_TOTAL_INCOME_PER_TURN",
      yieldNumbers: totalIncomeMap
    };
    this._curGoldBalance = playerTreasury.goldBalance;
    this._curInfluenceBalance = playerDiplomacyTreasury.diplomacyBalance;
    this._yieldSummaryRows.push(totalIncomeYieldRow);
  }
  constructOtherData() {
    this._yieldOtherRows = [];
    const otherIncomeMap = this.subtractYieldNumbers(this.totalYield, this.totalYieldCity);
    otherIncomeMap[YieldTypes.YIELD_GOLD] -= this._netGoldFromUnits;
    const otherRow = {
      rowLabel: "LOC_GLOBAL_YIELDS_OTHER",
      isTitle: true,
      yieldNumbers: otherIncomeMap
    };
    this._yieldOtherRows.push(otherRow);
  }
  get yieldTotal() {
    return this._yieldTotalRows;
  }
  get yieldSummary() {
    return this._yieldSummaryRows;
  }
  get yieldCity() {
    return this._yieldCityRows;
  }
  get yieldUnits() {
    return this._yieldUnitRows;
  }
  get yieldOther() {
    return this._yieldOtherRows;
  }
  get netUnitGold() {
    return this._netGoldFromUnits;
  }
  get currentGoldBalance() {
    return this._curGoldBalance;
  }
  get currentInfluenceBalance() {
    return this._curInfluenceBalance;
  }
  addYieldNumbers(yields1, yields2) {
    return {
      [YieldTypes.YIELD_GOLD]: yields1[YieldTypes.YIELD_GOLD] + yields2[YieldTypes.YIELD_GOLD],
      [YieldTypes.YIELD_SCIENCE]: yields1[YieldTypes.YIELD_SCIENCE] + yields2[YieldTypes.YIELD_SCIENCE],
      [YieldTypes.YIELD_DIPLOMACY]: yields1[YieldTypes.YIELD_DIPLOMACY] + yields2[YieldTypes.YIELD_DIPLOMACY],
      [YieldTypes.YIELD_PRODUCTION]: yields1[YieldTypes.YIELD_PRODUCTION] + yields2[YieldTypes.YIELD_PRODUCTION],
      [YieldTypes.YIELD_HAPPINESS]: yields1[YieldTypes.YIELD_HAPPINESS] + yields2[YieldTypes.YIELD_HAPPINESS],
      [YieldTypes.YIELD_FOOD]: yields1[YieldTypes.YIELD_FOOD] + yields2[YieldTypes.YIELD_FOOD],
      [YieldTypes.YIELD_CULTURE]: yields1[YieldTypes.YIELD_CULTURE] + yields2[YieldTypes.YIELD_CULTURE]
    };
  }
  subtractYieldNumbers(yields1, yields2) {
    return {
      [YieldTypes.YIELD_GOLD]: yields1[YieldTypes.YIELD_GOLD] - yields2[YieldTypes.YIELD_GOLD],
      [YieldTypes.YIELD_SCIENCE]: yields1[YieldTypes.YIELD_SCIENCE] - yields2[YieldTypes.YIELD_SCIENCE],
      [YieldTypes.YIELD_DIPLOMACY]: yields1[YieldTypes.YIELD_DIPLOMACY] - yields2[YieldTypes.YIELD_DIPLOMACY],
      [YieldTypes.YIELD_PRODUCTION]: yields1[YieldTypes.YIELD_PRODUCTION] - yields2[YieldTypes.YIELD_PRODUCTION],
      [YieldTypes.YIELD_HAPPINESS]: yields1[YieldTypes.YIELD_HAPPINESS] - yields2[YieldTypes.YIELD_HAPPINESS],
      [YieldTypes.YIELD_FOOD]: yields1[YieldTypes.YIELD_FOOD] - yields2[YieldTypes.YIELD_FOOD],
      [YieldTypes.YIELD_CULTURE]: yields1[YieldTypes.YIELD_CULTURE] - yields2[YieldTypes.YIELD_CULTURE]
    };
  }
  createBlankMap() {
    return {
      [YieldTypes.YIELD_GOLD]: 0,
      [YieldTypes.YIELD_SCIENCE]: 0,
      [YieldTypes.YIELD_DIPLOMACY]: 0,
      [YieldTypes.YIELD_PRODUCTION]: 0,
      [YieldTypes.YIELD_HAPPINESS]: 0,
      [YieldTypes.YIELD_FOOD]: 0,
      [YieldTypes.YIELD_CULTURE]: 0
    };
  }
  getYieldMap = (api) => {
    return {
      [YieldTypes.YIELD_GOLD]: api.getNetYield(YieldTypes.YIELD_GOLD),
      [YieldTypes.YIELD_SCIENCE]: api.getNetYield(YieldTypes.YIELD_SCIENCE),
      [YieldTypes.YIELD_DIPLOMACY]: api.getNetYield(YieldTypes.YIELD_DIPLOMACY),
      [YieldTypes.YIELD_PRODUCTION]: api.getNetYield(YieldTypes.YIELD_PRODUCTION),
      [YieldTypes.YIELD_HAPPINESS]: api.getNetYield(YieldTypes.YIELD_HAPPINESS),
      [YieldTypes.YIELD_FOOD]: api.getNetYield(YieldTypes.YIELD_FOOD),
      [YieldTypes.YIELD_CULTURE]: api.getNetYield(YieldTypes.YIELD_CULTURE)
    };
  };
}
const YieldReportData = new ModelYieldsReport();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(YieldReportData);
  };
  engine.createJSModel("g_YieldReport", YieldReportData);
  YieldReportData.updateCallback = updateModel;
});

class PlayerYieldsReportScreen extends Panel {
  collapseToggleActivatedListener = this.onCollapseToggleActivated.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceChangeListener = this.onActiveDeviceChange.bind(this);
  frame;
  closeButton;
  collapseToggleButton;
  yieldReportHeader;
  collapseToggleText;
  yieldReportHeaderFiller;
  cityDataContainer;
  otherDataContainer;
  unitDataContainer;
  onInitialize() {
    this.collapseToggleButton = MustGetElement(".yield-report__collapse-toggle-button", this.Root);
    this.yieldReportHeader = MustGetElement(".yield-report__header", this.Root);
    this.yieldReportHeaderFiller = MustGetElement(".yield-report__header-filler", this.Root);
    this.collapseToggleText = MustGetElement(".yield-report__collapse-toggle-text", this.Root);
    this.cityDataContainer = MustGetElement(".yield-report__city-data", this.Root);
    this.otherDataContainer = MustGetElement(".yield-report__other-data", this.Root);
    this.unitDataContainer = MustGetElement(".yield-report__unit-data", this.Root);
    this.frame = MustGetElement("fxs-frame", this.Root);
    this.closeButton = MustGetElement("fxs-close-button", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-yields-report");
  }
  onAttach() {
    super.onAttach();
    this.closeButton.addEventListener("action-activate", () => {
      this.close();
    });
    YieldReportData.update();
    const isMobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    this.collapseToggleButton.addEventListener("action-activate", this.collapseToggleActivatedListener);
    this.collapseToggleButton.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
    this.Root.listenForWindowEvent(ActiveDeviceTypeChangedEventName, this.activeDeviceChangeListener);
    this.updateCollapseToggleVisibility();
    if (isMobileViewExperience) {
      this.frame.setAttribute("outside-safezone-mode", "full");
      this.frame.removeAttribute("override-styling");
      this.frame.removeAttribute("filigree-class");
      this.frame.removeAttribute("frame-style");
      this.frame.removeAttribute("top-border-style");
      this.closeButton.classList.add("top-14", "right-10");
    }
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.buildCityData();
    this.buildOther();
    this.buildUnitData();
    this.buildSummary();
  }
  onDetach() {
    this.collapseToggleButton.removeEventListener("action-activate", this.collapseToggleActivatedListener);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const yieldSlot = MustGetElement(".yield-report-vslot", this.Root);
    FocusManager.setFocus(yieldSlot);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction2(
      this.allSectionsAreCollapsed() ? "LOC_UI_QUEUE_FILTER_SHOW_ALL" : "LOC_GLOBAL_YIELDS_COLLAPSE_ALL"
    );
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onClickCollapseToggle(container, collapsible) {
    if (container.classList.toggle("hidden")) {
      Audio.playSound("data-audio-dropdown-close", "audio-base");
    } else {
      Audio.playSound("data-audio-dropdown-open", "audio-base");
    }
    const collapsibleArrow = MustGetElement(".img-arrow", collapsible);
    collapsibleArrow.classList.toggle("rotate-90");
    collapsibleArrow.classList.toggle("-rotate-90");
    if (this.allSectionsAreCollapsed()) {
      this.enableExpandAllButton();
    } else {
      this.enableCollapseAllButton();
    }
  }
  onActiveDeviceChange(_event) {
    this.updateCollapseToggleVisibility();
  }
  updateCollapseToggleVisibility() {
    if (ActionHandler.isGamepadActive) {
      this.yieldReportHeaderFiller.classList.add("hidden");
      this.collapseToggleButton.classList.add("hidden");
      this.yieldReportHeader.classList.add("justify-center");
      this.yieldReportHeader.classList.remove("justify-between");
      NavTray.addOrUpdateShellAction2(
        this.allSectionsAreCollapsed() ? "LOC_UI_QUEUE_FILTER_SHOW_ALL" : "LOC_GLOBAL_YIELDS_COLLAPSE_ALL"
      );
    } else {
      this.collapseToggleButton.classList.remove("hidden");
      this.yieldReportHeaderFiller.classList.remove("hidden");
      this.yieldReportHeader.classList.remove("justify-center");
      this.yieldReportHeader.classList.add("justify-between");
      if (this.allSectionsAreCollapsed()) {
        this.enableExpandAllButton();
      } else {
        this.enableCollapseAllButton();
      }
    }
  }
  enableExpandAllButton() {
    this.collapseToggleText.setAttribute("data-l10n-id", "LOC_UI_QUEUE_FILTER_SHOW_ALL");
    this.collapseToggleButton.setAttribute("data-audio-activate-ref", "data-audio-dropdown-open");
  }
  enableCollapseAllButton() {
    this.collapseToggleText.setAttribute("data-l10n-id", "LOC_GLOBAL_YIELDS_COLLAPSE_ALL");
    this.collapseToggleButton.setAttribute("data-audio-activate-ref", "data-audio-dropdown-close");
  }
  buildCityData() {
    const yieldCityData = YieldReportData.yieldCity;
    for (const yieldRow of yieldCityData) {
      this.cityDataContainer.appendChild(this.createStandardRow(yieldRow));
    }
    const collapseButton = MustGetElement(".yield-report__city-collapsible", this.Root);
    collapseButton.addEventListener(
      "action-activate",
      () => this.onClickCollapseToggle(this.cityDataContainer, collapseButton)
    );
    collapseButton.setAttribute("data-audio-group-ref", "audio-yields-report");
    collapseButton.setAttribute("data-audio-activate-ref", "none");
  }
  buildUnitData() {
    const yieldUnitData = YieldReportData.yieldUnits;
    const yieldUnitTitleContainer = document.createElement("div");
    yieldUnitTitleContainer.classList.value = "flex";
    yieldUnitTitleContainer.appendChild(
      this.createCell({
        content: "LOC_GLOBAL_YIELDS_UNIT_NAME",
        className: `bg-primary-3 w-96 items-center mr-1`
      })
    );
    yieldUnitTitleContainer.appendChild(
      this.createCell({
        content: "LOC_GLOBAL_YIELDS_NUMBER_OF_UNITS",
        className: `bg-primary-3 w-44 items-center justify-center mr-1`
      })
    );
    yieldUnitTitleContainer.appendChild(
      this.createCell({
        content: YieldReportData.netUnitGold,
        className: `bg-primary-3 w-44 items-center justify-center`,
        icon: "YIELD_GOLD"
      })
    );
    this.unitDataContainer.appendChild(yieldUnitTitleContainer);
    for (const yieldRow of yieldUnitData) {
      const yieldRowContainer = document.createElement("div");
      yieldRowContainer.classList.value = "flex w-full";
      const yieldRowTitle = this.createCell({
        content: yieldRow.rowLabel,
        tabbed: yieldRow.rowLabelTabbed,
        icon: yieldRow.rowIcon,
        className: `bg-primary-5 w-96 items-center justify-left mr-1`
      });
      yieldRowContainer.appendChild(yieldRowTitle);
      const yieldRowNumUnits = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.NO_YIELD],
        className: `bg-primary-5 w-44 items-center justify-center mr-1`
      });
      yieldRowContainer.appendChild(yieldRowNumUnits);
      const yieldRowNumGold = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_GOLD],
        className: `bg-primary-5 w-44 items-center justify-center`
      });
      yieldRowContainer.appendChild(yieldRowNumGold);
      this.unitDataContainer.appendChild(yieldRowContainer);
    }
    const collapseButton = MustGetElement(".yield-report__unit-collapsible", this.Root);
    collapseButton.addEventListener(
      "action-activate",
      () => this.onClickCollapseToggle(this.unitDataContainer, collapseButton)
    );
    collapseButton.setAttribute("data-audio-group-ref", "audio-yields-report");
    collapseButton.setAttribute("data-audio-activate-ref", "none");
    const goldFromUnitsElement = MustGetElement(".yield-report__unit-gold-total", this.Root);
    goldFromUnitsElement.innerHTML = this.formatNumber(YieldReportData.netUnitGold);
  }
  buildSummary() {
    const summaryContainer = MustGetElement(".yield-report__summary", this.Root);
    const yieldSummaryData = YieldReportData.yieldSummary;
    for (const yieldRow of yieldSummaryData) {
      const yieldRowContainer = document.createElement("div");
      yieldRowContainer.classList.value = "flex w-full";
      const bgColorClass = yieldRow.isTitle ? "bg-primary-3" : "bg-primary-5";
      const yieldRowTitle = this.createCell({
        content: yieldRow.rowLabel,
        className: `${bgColorClass} yield-report-title-cell items-center justify-end mr-1`
      });
      yieldRowContainer.appendChild(yieldRowTitle);
      const yieldRowFood = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_FOOD],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_FOOD" : ""
      });
      yieldRowContainer.appendChild(yieldRowFood);
      const yieldRowProduction = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_PRODUCTION],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_PRODUCTION" : ""
      });
      yieldRowContainer.appendChild(yieldRowProduction);
      const yieldRowGold = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_GOLD],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_GOLD" : ""
      });
      yieldRowContainer.appendChild(yieldRowGold);
      const yieldRowScience = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_SCIENCE],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_SCIENCE" : ""
      });
      yieldRowContainer.appendChild(yieldRowScience);
      const yieldRowCulture = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_CULTURE],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_CULTURE" : ""
      });
      yieldRowContainer.appendChild(yieldRowCulture);
      const yieldRowHappiness = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_HAPPINESS],
        className: `${bgColorClass} grow items-center justify-center mr-1`,
        icon: yieldRow.isTitle ? "YIELD_HAPPINESS" : ""
      });
      yieldRowContainer.appendChild(yieldRowHappiness);
      const yieldRowInfluence = this.createCell({
        content: yieldRow.yieldNumbers[YieldTypes.YIELD_DIPLOMACY],
        className: `${bgColorClass} grow items-center justify-center`,
        icon: yieldRow.isTitle ? "YIELD_DIPLOMACY" : ""
      });
      yieldRowContainer.appendChild(yieldRowInfluence);
      summaryContainer.appendChild(yieldRowContainer);
    }
    const yieldRowTreasuryContainer = document.createElement("div");
    yieldRowTreasuryContainer.classList.value = "flex w-full";
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "LOC_GLOBAL_YIELDS_SUMMARY_SURPLUS",
        className: `bg-primary-5 items-center yield-report-title-cell justify-end mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "",
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "",
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: YieldReportData.currentGoldBalance,
        noPlus: true,
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "",
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "",
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: "",
        className: `bg-primary-5 grow items-center justify-center mr-1`
      })
    );
    yieldRowTreasuryContainer.appendChild(
      this.createCell({
        content: YieldReportData.currentInfluenceBalance,
        noPlus: true,
        className: `bg-primary-5 grow items-center justify-center`
      })
    );
    summaryContainer.appendChild(yieldRowTreasuryContainer);
  }
  buildOther() {
    const yieldOtherData = YieldReportData.yieldOther;
    for (const yieldRow of yieldOtherData) {
      this.otherDataContainer.appendChild(this.createStandardRow(yieldRow));
    }
    const collapseButton = MustGetElement(".yield-report__other-collapsible", this.Root);
    collapseButton.addEventListener(
      "action-activate",
      () => this.onClickCollapseToggle(this.otherDataContainer, collapseButton)
    );
    collapseButton.setAttribute("data-audio-group-ref", "audio-yields-report");
    collapseButton.setAttribute("data-audio-activate-ref", "none");
  }
  createCell(properties) {
    const cell = document.createElement("div");
    cell.classList.value = `${properties.className} h-10 flex relative px-2 py-1`;
    const cellContent = document.createElement("div");
    cellContent.classList.value = "flex items-center absolute grow ml-4 h-full w-full";
    if (properties.tabbed) {
      cellContent.classList.add("pl-4");
    }
    cell.appendChild(cellContent);
    if (properties.icon && properties.icon.length > 0) {
      const cellIcon = document.createElement("fxs-icon");
      cellIcon.setAttribute("data-icon-id", properties.icon);
      cellIcon.setAttribute("data-icon-context", "DEFAULT");
      cellIcon.classList.add("size-8", "mr-1");
      cellContent.appendChild(cellIcon);
    }
    const cellText = document.createElement("div");
    cellText.classList.value = "font-body-base mr-1 flex-auto h-full font-fit-shrink";
    let cellTextContent = "";
    if (typeof properties.content === "number") {
      cellTextContent = properties.noPlus ? Locale.compose("LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS", properties.content) : this.formatNumber(properties.content);
      if (properties.content < 0) {
        cellText.classList.add("text-negative");
      } else {
        cellText.classList.add("text-accent-4");
      }
    } else if (typeof properties.content === "string") {
      cellText.classList.add("text-accent-4");
      cellTextContent = properties.content;
    } else {
      cellText.classList.add("text-accent-4");
      cellTextContent = "0";
    }
    cellText.setAttribute("data-l10n-id", cellTextContent);
    cellContent.appendChild(cellText);
    return cell;
  }
  createStandardRow(yieldRow) {
    const yieldRowContainer = document.createElement("div");
    yieldRowContainer.classList.value = "flex w-full";
    const bgColorClass = yieldRow.isTitle ? "bg-primary-3" : "bg-primary-5";
    const yieldRowTitle = this.createCell({
      content: yieldRow.rowLabel,
      tabbed: yieldRow.rowLabelTabbed,
      className: `${bgColorClass} yield-report-title-cell items-center justify-left mr-1`,
      icon: yieldRow.rowIcon
    });
    const yieldRowFood = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_FOOD],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_FOOD" : ""
    });
    const yieldRowProduction = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_PRODUCTION],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_PRODUCTION" : ""
    });
    const yieldRowGold = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_GOLD],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_GOLD" : ""
    });
    const yieldRowScience = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_SCIENCE],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_SCIENCE" : ""
    });
    const yieldRowCulture = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_CULTURE],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_CULTURE" : ""
    });
    const yieldRowHappiness = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_HAPPINESS],
      className: `${bgColorClass} grow items-center justify-center mr-1`,
      icon: yieldRow.isTitle ? "YIELD_HAPPINESS" : ""
    });
    const yieldRowInfluence = this.createCell({
      content: yieldRow.yieldNumbers[YieldTypes.YIELD_DIPLOMACY],
      className: `${bgColorClass} grow items-center justify-center`,
      icon: yieldRow.isTitle ? "YIELD_DIPLOMACY" : ""
    });
    yieldRowContainer.appendChild(yieldRowTitle);
    yieldRowContainer.appendChild(yieldRowFood);
    yieldRowContainer.appendChild(yieldRowProduction);
    yieldRowContainer.appendChild(yieldRowGold);
    yieldRowContainer.appendChild(yieldRowScience);
    yieldRowContainer.appendChild(yieldRowCulture);
    yieldRowContainer.appendChild(yieldRowHappiness);
    yieldRowContainer.appendChild(yieldRowInfluence);
    return yieldRowContainer;
  }
  onCollapseToggleActivated() {
    const allSectionsCollapsed = this.allSectionsAreCollapsed();
    const collapseArrows = MustGetElements(".collapse-arrow", this.Root);
    for (const arrow of collapseArrows) {
      if (allSectionsCollapsed) {
        arrow.classList.replace("-rotate-90", "rotate-90");
      } else {
        arrow.classList.replace("rotate-90", "-rotate-90");
      }
    }
    if (allSectionsCollapsed) {
      Audio.playSound("data-audio-dropdown-open");
      if (ActionHandler.isGamepadActive) {
        NavTray.addOrUpdateShellAction2("LOC_GLOBAL_YIELDS_COLLAPSE_ALL");
      } else {
        this.enableCollapseAllButton();
      }
    } else {
      Audio.playSound("data-audio-dropdown-close");
      if (ActionHandler.isGamepadActive) {
        NavTray.addOrUpdateShellAction2("LOC_UI_QUEUE_FILTER_SHOW_ALL");
      } else {
        this.enableExpandAllButton();
      }
    }
    this.cityDataContainer.classList.toggle("hidden", !allSectionsCollapsed);
    this.unitDataContainer.classList.toggle("hidden", !allSectionsCollapsed);
    this.otherDataContainer.classList.toggle("hidden", !allSectionsCollapsed);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      super.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.name == "shell-action-2") {
      this.onCollapseToggleActivated();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  formatNumber(num) {
    if (num === void 0 || num === 0) {
      return "0";
    }
    return Locale.compose("LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", num);
  }
  allSectionsAreCollapsed() {
    return this.cityDataContainer.classList.contains("hidden") && this.otherDataContainer.classList.contains("hidden") && this.unitDataContainer.classList.contains("hidden");
  }
}
Controls.define("player-yields-report-screen", {
  createInstance: PlayerYieldsReportScreen,
  description: "Breakdown of each of the yields available in game",
  classNames: ["player-yields-report", "absolute", "flex", "items-center", "justify-center"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=player-yields-report-screen.js.map
