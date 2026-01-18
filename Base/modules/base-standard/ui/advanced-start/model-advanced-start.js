import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class AdvancedStartModel {
  onUpdate;
  _availableCards = [];
  _selectedCards = [];
  _placeableCardEffects = [];
  _filterForCards = CardCategories.CARD_CATEGORY_NONE;
  _preselectIndex = 0;
  _preSelectList = [];
  _cardsToAddOnRemoval = [];
  updateGate = new UpdateGate(() => {
    this.update();
  });
  cardAddedListener = () => {
    this.tryAddCards();
    this.updateGate.call("cardAddedListener");
  };
  cardRemovedListener = () => {
    this.tryAddCards();
    this.updateGate.call("cardRemovedListener");
  };
  effectUsedListener = () => {
    this.updateGate.call("effectUsedListener");
  };
  selectedPlacementEffectID = "";
  // If false we have no cards that can be added so deck is probably full
  canAddCards = true;
  // True if we've confirmed the deck and want to apply effects
  deckConfirmed = false;
  // Tracks the placement complete flag from gamecore
  advancedStartClosed = false;
  constructor() {
    engine.on("AdvancedStartCardAdded", this.cardAddedListener);
    engine.on("AdvancedStartCardRemoved", this.cardRemovedListener);
    engine.on("AdvancedStartEffectUsed", this.effectUsedListener);
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  get playerId() {
    return GameContext.localPlayerID;
  }
  get availableCards() {
    return this._availableCards;
  }
  get filterForCards() {
    return this._filterForCards;
  }
  get filteredCards() {
    return this.filterCards();
  }
  get selectedCards() {
    return this._selectedCards;
  }
  get placeableCardEffects() {
    return this._placeableCardEffects;
  }
  get preSelectList() {
    return this._preSelectList;
  }
  get preSelectLoc() {
    return this.getDeckIdLoc(this._preSelectList[this._preselectIndex].deckID);
  }
  get preSelectIndex() {
    return this._preselectIndex;
  }
  update() {
    if (GameContext.localObserverID == PlayerIds.NO_PLAYER || GameContext.localObserverID == PlayerIds.OBSERVER_ID || Autoplay.isActive) {
      return;
    }
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-advanced-start: Failed to retrieve PlayerLibrary for Player ${GameContext.localPlayerID}`
      );
      return;
    }
    const playerAdvancedStart = localPlayer.AdvancedStart;
    if (!playerAdvancedStart) {
      console.error(
        `model-advanced-start: Failed to retrieve PlayerAdvancedStart for Player ${GameContext.localPlayerID}`
      );
      return;
    }
    const ageDefinition = GameInfo.Ages.lookup(Game.age);
    if (!ageDefinition) {
      console.error(`model-advanced-start: Failed to find ageDefinition for age ID ${Game.age}`);
      return;
    }
    this._preSelectList = [
      {
        deckID: "Custom",
        typeIDs: []
      }
    ];
    const ageStarDeckCardEntries = GameInfo.AdvancedStartDeckCardEntries;
    if (!ageStarDeckCardEntries) {
      console.error(
        `model-advanced-start: Failed to find advanced start definition for deck cards: ${ageStarDeckCardEntries}`
      );
      return;
    }
    for (const deck of ageStarDeckCardEntries) {
      const deckIndex = this._preSelectList.findIndex((preselect) => preselect.deckID === deck.DeckID);
      if (deckIndex >= 0) {
        this._preSelectList[deckIndex].typeIDs.push(deck.CardID);
      } else {
        this._preSelectList.push({
          deckID: deck.DeckID,
          typeIDs: [deck.CardID]
        });
      }
    }
    this._availableCards = [];
    this._selectedCards = [];
    this._placeableCardEffects = [];
    this.advancedStartClosed = playerAdvancedStart.getPlacementComplete();
    if (this.advancedStartClosed) {
      this.deckConfirmed = true;
      if (this.onUpdate) {
        this.onUpdate(this);
      }
      return;
    }
    this.canAddCards = false;
    let sequence = 0;
    for (const cardInfo of playerAdvancedStart.getAvailableCards()) {
      const availableCardEntry = this.makeCardEntryFromAgeCardInfo(cardInfo, playerAdvancedStart);
      if (availableCardEntry.canBeAdded) {
        this.canAddCards = true;
      }
      if (sequence & 1) {
        availableCardEntry.oddCard = true;
      }
      sequence++;
      this._availableCards.push(availableCardEntry);
    }
    const selectedCards = playerAdvancedStart.getCards();
    for (const card of selectedCards) {
      this._selectedCards.push(this.makeCardEntryFromAgeCardInfo(card.info, playerAdvancedStart, true));
    }
    for (const card of this._selectedCards) {
      let instances = 0;
      for (const checkCard of this._selectedCards) {
        if (card.typeID == checkCard.typeID) {
          instances += 1;
        }
      }
      card.numInstances = instances;
      if (card.groupLimit > 0) {
        card.instancesLeft = card.groupLimit - card.numInstances;
      } else if (card.individualLimit > 0) {
        card.instancesLeft = card.individualLimit - card.numInstances;
      } else {
        card.instancesLeft = card.numInstances;
      }
      card.multipleInstancesString = Locale.stylize("LOC_ADVANCED_START_MULTIPLE_LEGACIES", card.numInstances);
      for (const availCard of this._availableCards) {
        if (availCard.typeID == card.typeID) {
          availCard.numInstances = instances;
          availCard.instancesLeft = card.individualLimit - card.numInstances;
          break;
        }
      }
    }
    for (const card of this._selectedCards) {
      for (const effect of card.effectTypes) {
        if (!effect.isPlacementEffect) {
          break;
        }
        if (effect.amount <= 0) {
          break;
        }
        for (let i = 0; i < effect.amount; i++) {
          let display = true;
          if (this._placeableCardEffects.findIndex((effected) => effected.name === effect.name) >= 0) {
            display = false;
          }
          this._placeableCardEffects.push({
            name: effect.name,
            effectID: effect.id,
            description: effect.description,
            numInstances: 0,
            typeIcon: card.typeIcon,
            costs: card.costs,
            display,
            colorClass: card.colorClass
          });
        }
      }
    }
    for (const effect of this._placeableCardEffects) {
      let instances = 0;
      for (const checkEffect of this._placeableCardEffects) {
        if (effect.name == checkEffect.name) {
          instances += 1;
        }
      }
      effect.numInstances = instances;
      effect.multipleInstancesString = Locale.stylize(
        "LOC_ADVANCED_START_MULTIPLE_LEGACIES",
        effect.numInstances
      );
    }
    const duplicateCards = /* @__PURE__ */ new Set();
    this._selectedCards = this._selectedCards.filter((card) => {
      const duplicateCard = duplicateCards.has(card.name);
      duplicateCards.add(card.name);
      return !duplicateCard;
    });
    if (this.deckConfirmed && this._placeableCardEffects.length == 0) {
      this.applyInstanceEffects();
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
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  tryAddCards() {
    this._cardsToAddOnRemoval.forEach((typeID, index) => {
      if (this.addAvailableCard(typeID)) {
        this._cardsToAddOnRemoval.splice(index, 1);
      }
    });
  }
  makeCardEntryFromAgeCardInfo(cardInfo, playerAdvancedStart, selected) {
    const args = { Type: "ADD", ID: cardInfo.id };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.ADVANCED_START_MODIFY_DECK,
      args,
      false
    );
    const canBeAdded = result.Success;
    let hasBeenAdded = false;
    let insufficientFunds = false;
    let cardTooltip = cardInfo.tooltip;
    const costs = this.makeCosts(cardInfo.cost);
    const legacyPointsLeft = playerAdvancedStart.getLegacyPoints();
    costs.forEach((cost) => {
      let pointAvailable = 0;
      const legacyPoints = legacyPointsLeft.find(
        (legacyPoint) => this.getCardCategoryColor(legacyPoint.category) === cost.colorClass && legacyPoint.value > 0
      );
      pointAvailable += legacyPoints?.value || 0;
      const wildPoints = legacyPointsLeft.find(
        (legacyPoint) => this.getCardCategoryColor(legacyPoint.category) === "wild"
      );
      pointAvailable += wildPoints?.value || 0;
      insufficientFunds = +cost.value > pointAvailable;
      if (insufficientFunds) {
        cardTooltip = "LOC_ADVANCED_START_INSUFFICIENT";
      }
    });
    if (selected) {
      hasBeenAdded = true;
      cardTooltip = this.parseCardText(cardInfo.description);
    }
    let icon = UI.getIcon(cardInfo.id);
    if (!icon) {
      icon = cardInfo.iconOverride;
    }
    let colorClass = "";
    const darkAgeCard = costs.find((cost) => cost.colorClass == "dark");
    if (darkAgeCard) {
      colorClass = darkAgeCard.colorClass;
    } else {
      colorClass = costs[0].colorClass;
    }
    return {
      name: this.parseCardText(cardInfo.name),
      description: this.parseCardText(cardInfo.description),
      tooltip: cardTooltip,
      typeID: cardInfo.id,
      typeIcon: icon,
      effectTypes: cardInfo.effects,
      costs,
      canBeAdded,
      cannotBeAdded: !canBeAdded,
      hasBeenAdded,
      numInstances: 0,
      oddCard: false,
      colorClass,
      insufficientFunds,
      groupLimit: cardInfo.groupLimit ?? -1,
      individualLimit: cardInfo.individualLimit,
      instancesLeft: 0
    };
  }
  parseCardText(args) {
    const argsArray = args.split("\\");
    if (argsArray.length > 1) {
      const baseName = argsArray[0];
      argsArray.shift();
      for (let i = 0; i < argsArray.length; ++i) {
        if (argsArray[i].includes("LOC_")) {
          argsArray[i] = Locale.compose(argsArray[i]);
        }
      }
      return Locale.compose(baseName, ...argsArray);
    }
    return Locale.compose(args);
  }
  makeCosts(cost) {
    const output = [];
    for (const instance of cost) {
      const entry = {
        value: instance.value.toString(),
        icon: this.getCardCategoryIconURL(instance.category),
        colorClass: this.getCardCategoryColor(instance.category)
      };
      if (instance.category == CardCategories.CARD_CATEGORY_WILDCARD) {
        output.push(entry);
      } else {
        output.unshift(entry);
      }
    }
    return output;
  }
  getCardCategoryCostShortname(amount, category) {
    let output = "";
    switch (category) {
      case CardCategories.CARD_CATEGORY_MILITARISTIC:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_MILITARISTIC", amount);
        break;
      case CardCategories.CARD_CATEGORY_CULTURAL:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_CULTURAL", amount);
        break;
      case CardCategories.CARD_CATEGORY_ECONOMIC:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_ECONOMIC", amount);
        break;
      case CardCategories.CARD_CATEGORY_SCIENTIFIC:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_SCIENTIFIC", amount);
        break;
      case CardCategories.CARD_CATEGORY_WILDCARD:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_WILDCARD", amount);
        break;
      case CardCategories.CARD_CATEGORY_DARK_AGE:
        output = Locale.compose("LOC_CARD_CATEGORY_SHORT_DARK_AGE", amount);
        break;
      default:
        console.error("model-advanced-start: unknown CardCategory ${category}");
        break;
    }
    return output;
  }
  getCardCategoryIconURL(category) {
    let output = "";
    switch (category) {
      case CardCategories.CARD_CATEGORY_MILITARISTIC:
        output = "fs://game/bonus_militaristic.png";
        break;
      case CardCategories.CARD_CATEGORY_CULTURAL:
        output = "fs://game/bonus_cultural.png";
        break;
      case CardCategories.CARD_CATEGORY_ECONOMIC:
        output = "fs://game/bonus_economic.png";
        break;
      case CardCategories.CARD_CATEGORY_SCIENTIFIC:
        output = "fs://game/bonus_scientific.png";
        break;
      case CardCategories.CARD_CATEGORY_WILDCARD:
        output = "fs://game/bonus_wildcard.png";
        break;
      case CardCategories.CARD_CATEGORY_DARK_AGE:
        output = "fs://game/bonus_dark.png";
        break;
      default:
        console.error("model-advanced-start: unknown CardCategory ${category}");
        break;
    }
    return output;
  }
  // Gets the class name to attach to a card based on its cost category
  getCardCategoryColor(category) {
    let output = "";
    switch (category) {
      case CardCategories.CARD_CATEGORY_MILITARISTIC:
        output = "mili";
        break;
      case CardCategories.CARD_CATEGORY_CULTURAL:
        output = "cult";
        break;
      case CardCategories.CARD_CATEGORY_ECONOMIC:
        output = "econ";
        break;
      case CardCategories.CARD_CATEGORY_SCIENTIFIC:
        output = "scie";
        break;
      case CardCategories.CARD_CATEGORY_WILDCARD:
        output = "wild";
        break;
      case CardCategories.CARD_CATEGORY_DARK_AGE:
        output = "dark";
        break;
      default:
        console.error(`model-advanced-start: unknown CardCategory ${category}`);
        break;
    }
    return output;
  }
  getCardCategoryByColor(colorCategory) {
    let output = CardCategories.CARD_CATEGORY_NONE;
    switch (colorCategory) {
      case "mili":
        output = CardCategories.CARD_CATEGORY_MILITARISTIC;
        break;
      case "cult":
        output = CardCategories.CARD_CATEGORY_CULTURAL;
        break;
      case "econ":
        output = CardCategories.CARD_CATEGORY_ECONOMIC;
        break;
      case "scie":
        output = CardCategories.CARD_CATEGORY_SCIENTIFIC;
        break;
      case "wild":
        output = CardCategories.CARD_CATEGORY_WILDCARD;
        break;
      default:
        console.error("model-advanced-start: unknown CardCategory ${category}");
        break;
    }
    return output;
  }
  getDeckIdLoc(deckId) {
    switch (deckId) {
      case "CulturalExplorationDeck":
      case "CulturalModernDeck":
        return "LOC_ADVANCED_START_PRESET_CULTURE";
      case "EconomicExplorationDeck":
      case "EconomicModernDeck":
        return "LOC_ADVANCED_START_PRESET_ECONOMY";
      case "ExpansionistExplorationDeck":
      case "ExpansionistModernnDeck":
        return "LOC_ADVANCED_START_PRESET_EXPANSION";
      case "MilitaristicExplorationDeck":
      case "MilitaristicModernDeck":
        return "LOC_ADVANCED_START_PRESET_MILITARY";
      case "PoliticalExplorationDeck":
      case "PoliticalModernDeck":
        return "LOC_ADVANCED_START_PRESET_POLITICAL";
      case "ScientificExplorationDeck":
      case "ScientificModernDeck":
        return "LOC_ADVANCED_START_PRESET_SCIENCE";
      case "DefaultModernDeck":
        return "LOC_OPTIONS_DEFAULT";
      default:
        return "LOC_ADVANCED_START_PRESET_CUSTOM";
    }
  }
  addAvailableCard(typeID) {
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
      this.updateGate.call("addAvailableCard");
      success = true;
    }
    return success;
  }
  filterCards() {
    let cardEntry = [];
    if (this._filterForCards === CardCategories.CARD_CATEGORY_NONE) {
      cardEntry = this._availableCards;
    } else {
      const catagoryColor = this.getCardCategoryColor(this._filterForCards);
      cardEntry = this._availableCards.filter((card) => card.colorClass === catagoryColor);
    }
    return cardEntry;
  }
  setFilter(category) {
    this._filterForCards = category;
    this.updateGate.call("filterAvailableCards");
  }
  removeAvailableCard(typeID) {
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
    this.updateGate.call("removeAvailableCard");
  }
  changePresetLegacies(indexShift) {
    if (indexShift + this._preselectIndex >= this._preSelectList.length) {
      this._preselectIndex = 0;
    } else if (indexShift + this._preselectIndex < 0) {
      this._preselectIndex = this._preSelectList.length - 1;
    } else {
      this._preselectIndex = this._preselectIndex + indexShift;
    }
    if (this._selectedCards.length > 0) {
      this._selectedCards.forEach((card) => {
        if (card.numInstances > 1) {
          for (let i = 0; i < card.numInstances; i++) {
            this.removeAvailableCard(card.typeID);
          }
        } else {
          this.removeAvailableCard(card.typeID);
        }
      });
      this._cardsToAddOnRemoval = [];
      this._preSelectList[this._preselectIndex].typeIDs.forEach((typeID) => {
        this._cardsToAddOnRemoval.push(typeID);
      });
    } else {
      this._preSelectList[this._preselectIndex].typeIDs.forEach((typeID) => {
        this.addAvailableCard(typeID);
      });
    }
  }
  autoFillLegacies() {
    const localPlayer = Players.get(GameContext.localPlayerID);
    const availableLegacyPoints = localPlayer?.AdvancedStart?.getLegacyPoints();
    if (!availableLegacyPoints) {
      return;
    }
    this._availableCards.forEach((card) => {
      if (card.insufficientFunds == false && card.canBeAdded && this._selectedCards.findIndex((x) => x.typeID == card.typeID) == -1) {
        let pointAvailable = 0;
        card.costs.forEach((cost) => {
          const legacyPoints = availableLegacyPoints?.find(
            (legacyPoint) => this.getCardCategoryColor(legacyPoint.category) === cost.colorClass && legacyPoint.value > 0
          );
          pointAvailable += legacyPoints?.value || 0;
          const wildPoints = availableLegacyPoints.find(
            (legacyPoint) => this.getCardCategoryColor(legacyPoint.category) === "wild"
          );
          pointAvailable += wildPoints?.value || 0;
          if (pointAvailable && +cost.value <= pointAvailable) {
            if (!this.addAvailableCard(card.typeID)) {
              return;
            }
          }
        });
      }
    });
  }
  confirmDeck() {
    this.deckConfirmed = true;
    this.updateGate.call("confirmDeck");
  }
  unconfirmDeck() {
    this.deckConfirmed = false;
    this.updateGate.call("unconfirmDeck");
  }
  refreshCardList() {
    this.updateGate.call("refreshCards");
  }
  selectPlacementEffect(typeID) {
    this.selectedPlacementEffectID = typeID;
  }
  clearSelectedPlacementEffect() {
    this.selectedPlacementEffectID = "";
  }
  placePlacementEffect(plot) {
    if (this.selectedPlacementEffectID == "") {
      return false;
    }
    const args = { ID: this.selectedPlacementEffectID, X: plot.x, Y: plot.y };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.ADVANCED_START_PLACE_SETTLEMENT,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.ADVANCED_START_PLACE_SETTLEMENT,
        args
      );
      this.updateGate.call("placePlacementEffect");
      this.clearSelectedPlacementEffect();
      return true;
    }
    return false;
  }
  applyInstanceEffects() {
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-advanced-start: Failed to retrieve PlayerLibrary for Player ${GameContext.localPlayerID}`
      );
      return;
    }
    const playerAdvancedStart = localPlayer.AdvancedStart;
    if (!playerAdvancedStart) {
      console.error(`model-advanced-start: Failed to retrieve Resources for Player ${GameContext.localPlayerID}`);
      return;
    }
    const selectedCards = playerAdvancedStart.getCards();
    for (const card of selectedCards) {
      for (const effect of card.info.effects) {
        for (let i = 0; i < effect.amount; i++) {
          const args = { ID: effect.id };
          const result = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.ADVANCED_START_USE_EFFECT,
            args,
            false
          );
          if (result.Success) {
            Game.PlayerOperations.sendRequest(
              GameContext.localPlayerID,
              PlayerOperationTypes.ADVANCED_START_USE_EFFECT,
              args
            );
          } else {
            console.error(`model-advanced-start: Failed to apply effect when confirm deck: ${effect.id}`);
          }
        }
      }
    }
  }
  forceComplete() {
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-advanced-start: Failed to retrieve PlayerLibrary for Player ${GameContext.localPlayerID}`
      );
      return;
    }
    const playerAdvancedStart = localPlayer.AdvancedStart;
    if (!playerAdvancedStart) {
      console.error(`model-advanced-start: Failed to retrieve Resources for Player ${GameContext.localPlayerID}`);
      return;
    }
    this.applyInstanceEffects();
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
    this.updateGate.call("forceComplete");
  }
  isACurrency(text) {
    return text === "mili" || text === "cult" || text === "econ" || text === "scie" || text === "wild";
  }
  convertCurrencyText(currencyText) {
    switch (currencyText) {
      case "mili":
        return "MILITARY";
      case "cult":
        return "CULTURE";
      case "econ":
        return "ECONOMY";
      case "scie":
        return "SCIENCE";
      case "wild":
        return "WILD";
      default:
        return "";
    }
  }
  canNotAffordLegacy(typeID) {
    const cardToCheck = this._availableCards.find((card) => typeID === card.typeID);
    return !!cardToCheck?.insufficientFunds;
  }
  tooltipText(hoverNodeId) {
    if (!hoverNodeId) {
      return null;
    }
    if (this.isACurrency(hoverNodeId)) {
      return {
        locKey: `LOC_ADVANCED_START_PRESET_${this.convertCurrencyText(hoverNodeId)}`
      };
    } else if (this.canNotAffordLegacy(hoverNodeId)) {
      return {
        locKey: `LOC_ADVANCED_START_INSUFFICIENT`
      };
    }
    return null;
  }
}
const AdvancedStart = new AdvancedStartModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AdvancedStart);
  };
  engine.createJSModel("g_AdvancedStartModel", AdvancedStart);
  AdvancedStart.updateCallback = updateModel;
});

export { AdvancedStartModel, AdvancedStart as default };
//# sourceMappingURL=model-advanced-start.js.map
