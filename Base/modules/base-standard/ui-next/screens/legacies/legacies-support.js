function getLegacyCardStyling(legacyType) {
  let tagString = "";
  let comingSoon = false;
  GameInfo.TypeTags.forEach((tag) => {
    if (tag.Type == legacyType) {
      if (tag.Tag == "COMING_SOON") {
        comingSoon = true;
      } else {
        tagString = tag.Tag;
      }
    }
  });
  return { ...getStylingFromTag(tagString), comingSoon };
}
function getStylingFromTag(tagType) {
  let traitIcon = "";
  let bgColor = "";
  let descriptionBG = "";
  switch (tagType) {
    case "CULTURAL":
      traitIcon = "url('blp:victory_cultural')";
      bgColor = "radial-gradient(140% 120% at top, rgba(172, 8, 142, 0.4), rgba(172, 8, 142, 0.35) 10%, rgba(172, 8, 142,0) 35%)";
      descriptionBG = "linear-gradient(to top, #381230 0%, #15061D 100%)";
      break;
    case "ECONOMIC":
      traitIcon = "url('blp:victory_economic')";
      bgColor = "radial-gradient(140% 120%  at top, rgba(192, 93, 22, 0.4), rgba(192, 93, 22, 0.35) 10%, rgba(192, 93, 22,0) 40%)";
      descriptionBG = "linear-gradient(to top, #513019 0%, #1D1506 100%)";
      break;
    case "SCIENTIFIC":
      traitIcon = "url('blp:victory_scientific')";
      bgColor = "radial-gradient(140% 120%  at top, rgba(53, 111, 143, 0.4), rgba(53, 111, 143, 0.35) 10%, rgba(53, 111, 143,0) 40%)";
      descriptionBG = "linear-gradient(to top, #204052 0%, #061016 100%)";
      break;
    case "MILITARISTIC":
      traitIcon = "url('blp:victory_militaristic')";
      bgColor = "radial-gradient(140% 120%  at top, rgba(179, 21, 21, 0.4), rgba(179, 21, 21,0.35) 10%, rgba(179, 21, 21,0) 40%)";
      descriptionBG = "linear-gradient(to top, #44171E 0%, #1D0606 100%)";
      break;
    case "EXPANSIONIST":
      traitIcon = "url('blp:victory_expansionist')";
      bgColor = "radial-gradient(140% 120% at top, rgba(0,167,23, 0.4), rgba(0,167,23, 0.35) 10%, rgba(0,167,23,0) 40%)";
      descriptionBG = "linear-gradient(to top, #1A4120 0%, #101D0F 100%)";
      break;
    case "DIPLOMATIC":
      traitIcon = "url('blp:victory_diplomatic')";
      bgColor = "radial-gradient(140% 120% at top, rgba(37,91,228, 0.4), rgba(37,91,228, 0.35) 10%, rgba(37,91,228,0) 40%)";
      descriptionBG = "linear-gradient(to top, #1D2F5E 0%, #06081D 100%)";
      break;
    case "CRISIS":
      bgColor = "radial-gradient(140% 120% at top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.35) 10%, rgba(0, 0, 0, 0) 40%)";
      traitIcon = "url('blp:bonus_crisis_128')";
      descriptionBG = "linear-gradient(to top, #3d3d3d 0%, #110F1B 100%)";
      break;
    default:
      traitIcon = "url('blp:bonus_wildcard')";
      descriptionBG = "linear-gradient(to top, #38395D 0%, #110F1B 100%)";
  }
  return { tagType, traitIcon, bgColor, descriptionBG };
}
function getLegacyTypeFromCardID(cardID) {
  return cardID.replace("CARD_AT", "LEGACY");
}
function isCrisis(cardInfo) {
  return cardInfo.name.includes("CRISIS") || cardInfo.name.includes("INVASION");
}
function parseCardText(args) {
  const parsedArgs = args.split("\\");
  if (parsedArgs.length <= 1) {
    return Locale.compose(args);
  }
  const [baseName, ...rawFormatArgs] = parsedArgs;
  const resolvedFormatArgs = rawFormatArgs.map((value, index) => {
    if (index == 0) {
      return value;
    }
    const injectionParts = value.split("//");
    if (injectionParts.length > 1) {
      return Locale.compose(parseCardTextArray(injectionParts));
    }
    return value.includes("LOC_") ? Locale.compose(value) : value;
  });
  return Locale.compose(baseName, ...resolvedFormatArgs);
}
function parseCardTextArray(args) {
  const baseName = args[0];
  args.shift();
  for (let i = 0; i < args.length; ++i) {
    if (args[i].includes("LOC_")) {
      args[i] = Locale.compose(args[i]);
    }
  }
  return Locale.compose(baseName, ...args);
}
function addAvailableCard(typeID) {
  let success = false;
  const args = { Type: "ADD", ID: typeID };
  const result = Game.PlayerOperations.canStart(
    GameContext.localPlayerID,
    PlayerOperationTypes.ADVANCED_START_MODIFY_DECK,
    args,
    false
  );
  if (result.Success) {
    Game.PlayerOperations.sendRequest(
      GameContext.localPlayerID,
      PlayerOperationTypes.ADVANCED_START_MODIFY_DECK,
      args
    );
    success = true;
  }
  return success;
}
function removeAvailableCard(typeID) {
  const args = { Type: "REMOVE", ID: typeID };
  const result = Game.PlayerOperations.canStart(
    GameContext.localPlayerID,
    PlayerOperationTypes.ADVANCED_START_MODIFY_DECK,
    args,
    false
  );
  if (result.Success) {
    Game.PlayerOperations.sendRequest(
      GameContext.localPlayerID,
      PlayerOperationTypes.ADVANCED_START_MODIFY_DECK,
      args
    );
  }
}
function markCompletedDeck() {
  const result = Game.PlayerOperations.canStart(
    GameContext.localPlayerID,
    PlayerOperationTypes.ADVANCED_START_MARK_COMPLETED,
    {},
    false
  );
  if (result.Success) {
    Game.PlayerOperations.sendRequest(
      GameContext.localPlayerID,
      PlayerOperationTypes.ADVANCED_START_MARK_COMPLETED,
      {}
    );
  }
}
function selectCapital(cityID, changeName) {
  const shouldChangeName = changeName != void 0 ? changeName : false;
  const args = { Player1: GameContext.localPlayerID, City: cityID.id, Swap: shouldChangeName };
  const result = Game.PlayerOperations.canStart(
    GameContext.localPlayerID,
    PlayerOperationTypes.SELECT_CAPITAL,
    args,
    false
  );
  if (result.Success) {
    Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.SELECT_CAPITAL, args);
  }
}

export { addAvailableCard, getLegacyCardStyling, getLegacyTypeFromCardID, getStylingFromTag, isCrisis, markCompletedDeck, parseCardText, parseCardTextArray, removeAvailableCard, selectCapital };
//# sourceMappingURL=legacies-support.js.map
