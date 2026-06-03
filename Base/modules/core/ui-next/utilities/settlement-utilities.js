import { getPlayerColorVariants } from '../../ui/utilities/utilities-color.js';
import { Icon } from '../../ui/utilities/utilities-image.js';

function compareSettlementBase(settlementAId, settlementBId, options = { ascending: true }) {
  if (settlementAId === settlementBId) {
    return { value: 0, needsFurtherComparison: false };
  }
  const settlementA = Cities.get(settlementAId);
  const settlementB = Cities.get(settlementBId);
  if (!settlementA) {
    return { value: options.ascending ? 1 : -1, needsFurtherComparison: false };
  }
  if (!settlementB) {
    return { value: options.ascending ? -1 : 1, needsFurtherComparison: false };
  }
  return { value: 0, needsFurtherComparison: true, settlementA, settlementB };
}
function compareSettlementTypes(settlementAId, settlementBId, options = { ascending: true }) {
  const { value, needsFurtherComparison, settlementA, settlementB } = compareSettlementBase(
    settlementAId,
    settlementBId,
    options
  );
  if (!needsFurtherComparison || !settlementA || !settlementB) {
    return value;
  }
  const capitalPoints = 100;
  const cityPoints = 10;
  const townPoints = 1;
  const settlementAPoints = settlementA.isCapital ? capitalPoints : settlementA.isTown ? townPoints : cityPoints;
  const settlementBPoints = settlementB.isCapital ? capitalPoints : settlementB.isTown ? townPoints : cityPoints;
  const pointsDelta = options.ascending ? settlementBPoints - settlementAPoints : settlementAPoints - settlementBPoints;
  if (pointsDelta === 0) {
    return compareSettlementNames(settlementAId, settlementBId, options);
  }
  return options.ascending ? settlementBPoints - settlementAPoints : settlementAPoints - settlementBPoints;
}
function compareSettlementNames(settlementAId, settlementBId, options = { ascending: true }) {
  const { value, needsFurtherComparison, settlementA, settlementB } = compareSettlementBase(
    settlementAId,
    settlementBId,
    options
  );
  if (!needsFurtherComparison || !settlementA || !settlementB) {
    return value;
  }
  const settlementANameString = Locale.compose(settlementA.name);
  const settlementBNameString = Locale.compose(settlementB.name);
  return options.ascending ? Locale.compare(settlementANameString, settlementBNameString) : Locale.compare(settlementBNameString, settlementANameString);
}
function getSettlementIconInfo(cityId) {
  const city = Cities.get(cityId);
  if (!city) {
    return null;
  }
  const player = Players.get(city.owner);
  if (!player) {
    return null;
  }
  const result = {
    color: "white",
    icon: ""
  };
  if (player.isMajor) {
    const variants = getPlayerColorVariants(player.id);
    if (variants) {
      result.color = variants.secondaryColor.mainColor;
    }
    result.icon = Icon.getCivSymbolCSSFromPlayer(cityId);
  } else {
    let civType = GameInfo.Civilizations.lookup(player.civilizationType)?.CivilizationType;
    const civDef = GameInfo.Independents.find((indDef) => {
      return indDef.CityStateName === player.civilizationAdjective;
    });
    if (civDef) {
      civType = civDef.CityStateType;
    }
    switch (civType) {
      case "MILITARISTIC":
        result.color = "#AF1B1C";
        result.icon = "blp:bonustype_militaristic";
        break;
      case "SCIENTIFIC":
        result.color = "#4D7C96";
        result.icon = "blp:bonustype_scientific";
        break;
      case "ECONOMIC":
        result.color = "#FFD553";
        result.icon = "blp:bonustype_economic";
        break;
      case "CULTURAL":
        result.color = "#892BB3";
        result.icon = "blp:bonustype_cultural";
        break;
      case "DIPLOMATIC":
        result.color = "#255BE4";
        result.icon = "blp:bonustype_diplomatic";
        break;
      case "EXPANSIONIST":
        result.color = "#00A717";
        result.icon = "blp:bonustype_expansionist";
        break;
      case "CIVILIZATION_INDEPENDENT":
        result.color = "#AF1B1C";
        result.icon = "blp:bonustype_crisis";
        break;
    }
  }
  return result;
}

export { compareSettlementNames, compareSettlementTypes, getSettlementIconInfo };
//# sourceMappingURL=settlement-utilities.js.map
