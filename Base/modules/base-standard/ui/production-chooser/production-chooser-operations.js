const CanUpgradeToCity = (townID) => {
  const result = Game.CityCommands.canStart(
    townID,
    CityCommandTypes.PURCHASE,
    { Directive: OrderTypes.ORDER_TOWN_UPGRADE },
    false
  );
  return result.Success;
};
const CanCityConstruct = (cityID, constructible, isPurchase) => {
  if (isPurchase) {
    return Game.CityCommands.canStart(
      cityID,
      CityCommandTypes.PURCHASE,
      { ConstructibleType: constructible.$index },
      false
    );
  } else {
    return Game.CityOperations.canStart(
      cityID,
      CityOperationTypes.BUILD,
      { ConstructibleType: constructible.$index },
      false
    );
  }
};
const CanConvertToCity = (townID) => {
  return Game.CityCommands.canStart(
    townID,
    CityCommandTypes.PURCHASE,
    { Directive: OrderTypes.ORDER_TOWN_UPGRADE },
    false
  );
};
const ConvertToCity = (townID) => {
  const result = CanConvertToCity(townID);
  if (result.Success) {
    Game.CityCommands.sendRequest(townID, CityCommandTypes.PURCHASE, { Directive: OrderTypes.ORDER_TOWN_UPGRADE });
    UI.sendAudioEvent("city-upgrade-confirm");
    return true;
  }
  return false;
};

export { CanCityConstruct, CanConvertToCity, CanUpgradeToCity, ConvertToCity };
//# sourceMappingURL=production-chooser-operations.js.map
