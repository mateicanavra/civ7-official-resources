import { L as LiveEventManager } from '../live-event-logic/live-event-logic.chunk.js';
import { D as DatabaseCache } from '../../utilities/utilities-data.chunk.js';

function GetAgeMap() {
  const ageMap = /* @__PURE__ */ new Map();
  const ageParameter = GameSetup.findGameParameter("Age");
  for (const age of ageParameter?.domain.possibleValues ?? []) {
    const type = age.value?.toString();
    const domain = GameSetup.resolveString(age.originDomain);
    const name = GameSetup.resolveString(age.name);
    if (type && domain && name) {
      ageMap.set(type, { type, name, domain });
    }
  }
  return ageMap;
}
function resolveBonusIcon(bonus) {
  return bonus.Kind === "KIND_QUARTER" ? "CITY_UNIQUE_QUARTER" : bonus.Type;
}
const civilizationData_DatabaseCache = new DatabaseCache("config");
let cachedCivilizationData = null;
function GetCivilizationData(Stylize = true) {
  if (cachedCivilizationData) {
    return cachedCivilizationData;
  }
  queueMicrotask(() => {
    console.debug("wiping cached civilization data.");
    cachedCivilizationData = null;
  });
  const p = UI.beginProfiling("GetCivilizationData");
  console.debug("Constructing Civilization Data (Expensive)");
  const results = [];
  const playerCivilizations = GameSetup.findPlayerParameter(GameContext.localPlayerID, "PlayerCivilization");
  if (playerCivilizations) {
    const civItemData = civilizationData_DatabaseCache.query("select * from CivilizationItems order by SortIndex");
    const civTagData = civilizationData_DatabaseCache.query(
      "select * from CivilizationTags inner join Tags on CivilizationTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
    );
    const civUnlockData = civilizationData_DatabaseCache.query(
      "select * from CivilizationUnlocks order by SortIndex"
    );
    const civBiasData = civilizationData_DatabaseCache.query("select * from LeaderCivilizationBias");
    const civLeaderPairingData = civilizationData_DatabaseCache.query("select * from LeaderCivParings");
    const ageMap = GetAgeMap();
    const leaderParameter = GameSetup.findPlayerParameter(GameContext.localPlayerID, "PlayerLeader");
    const leaderType = leaderParameter ? leaderParameter.value.value : "";
    const leaderDomain = leaderParameter ? GameSetup.resolveString(leaderParameter.value.originDomain) ?? "" : "";
    const leaderUnlocks = civilizationData_DatabaseCache.query("select * from LeaderUnlocks order by SortIndex");
    const prevCivCount = Configuration.getPlayer(GameContext.localPlayerID).previousCivilizationCount;
    const previousCivs = /* @__PURE__ */ new Set();
    for (let i = 0; i < prevCivCount; ++i) {
      previousCivs.add(Configuration.getPlayer(GameContext.localPlayerID).getPreviousCivilization(i));
    }
    const allowedInvalidReasons = /* @__PURE__ */ new Set([
      GameSetupDomainValueInvalidReason.Valid,
      GameSetupDomainValueInvalidReason.NotValidLocked,
      GameSetupDomainValueInvalidReason.NotValidOwnership
    ]);
    for (const civData of playerCivilizations.domain.possibleValues ?? []) {
      const civID = civData.value?.toString();
      if (!civID) {
        continue;
      }
      if (!allowedInvalidReasons.has(civData.invalidReason)) {
        continue;
      }
      const name = GameSetup.resolveString(civData.name);
      if (!name) {
        continue;
      }
      const image = GameSetup.resolveString(civData.icon);
      if (!image) {
        console.error(`age-civ-select-model: DB icon reference for civ ${name} is null`);
        continue;
      }
      const icon = UI.getIconURL(civID == "RANDOM" ? "CIVILIZATION_RANDOM" : civID, "");
      const domain = GameSetup.resolveString(civData.originDomain);
      const description = GameSetup.resolveString(civData.description);
      const valueUnlocks = civUnlockData.filter(
        (unlock) => unlock.CivilizationType == civID && unlock.CivilizationDomain == domain && (unlock.AgeDomain == null || ageMap.get(unlock.AgeType)?.domain == unlock.AgeDomain)
      );
      let civBiasForCivAndLeader = civBiasData.filter(
        (row) => row.CivilizationType == civID && row.CivilizationDomain == domain && row.LeaderType == leaderType && row.LeaderDomain == leaderDomain
      );
      const tags = civTagData.filter(
        (tag) => !tag.HideInDetails && tag.CivilizationType == civID && tag.CivilizationDomain == domain
      ).map((t) => Locale.compose(t.Name));
      valueUnlocks.sort(
        (a, b) => a.AgeType == b.AgeType ? Locale.compare(a.Type, b.Type) : Locale.compare(a.AgeType, b.AgeType)
      );
      const unlocks = valueUnlocks.map((unlock) => {
        const age = unlock.AgeDomain ? ageMap.get(unlock.AgeType) : null;
        return age ? Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM_IN_AGE", unlock.Name, age.name) : Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM", unlock.Name);
      });
      const unlocksByCiv = civUnlockData.filter(
        (unlock) => unlock.Type == civID && (unlock.AgeDomain == null || ageMap.get(unlock.AgeType)?.domain == unlock.AgeDomain)
      ).map((civ) => {
        const civInfo = Database.query(
          "config",
          `select CivilizationName from Civilizations where CivilizationType='${civ.CivilizationType}'`
        )?.[0];
        const civId = Database.makeHash(civ.CivilizationType ?? "");
        return {
          text: Locale.compose("LOC_AGE_TRANSITION_PLAY_AS", civInfo?.CivilizationName ?? ""),
          isUnlocked: previousCivs.has(civId)
        };
      });
      const unlocksByLeader = leaderUnlocks.filter(
        (unlock) => unlock.Type == civID && (unlock.AgeDomain == null || ageMap.get(unlock.AgeType)?.domain == unlock.AgeDomain)
      ).map((unlock) => {
        const leader = Database.query(
          "config",
          `select LeaderName from Leaders where LeaderType='${unlock.LeaderType}'`
        )?.[0];
        return {
          text: Locale.compose("LOC_AGE_TRANSITION_PLAY_AS", leader?.LeaderName ?? ""),
          isUnlocked: leaderType == unlock.LeaderType
        };
      });
      const unlockedBy = [...unlocksByCiv, ...unlocksByLeader];
      const civItems = civItemData.filter(
        (item) => item.CivilizationType == civID && item.CivilizationDomain == domain
      );
      const ability = civItems.find((item) => item.Kind == "KIND_TRAIT");
      const bonusItems = civItems.filter(
        (item) => item.Kind == "KIND_BUILDING" || item.Kind == "KIND_IMPROVEMENT" || item.Kind == "KIND_UNIT" || item.Kind == "KIND_QUARTER" || item.Kind == "KIND_ROUTE"
      ).map((item) => ({
        title: Locale.stylize(item.Name ?? ""),
        icon: resolveBonusIcon(item),
        text: Locale.stylize(item.Description ?? ""),
        description: item.Description ?? "",
        kind: item.Kind ?? ""
      }));
      if (LiveEventManager.restrictToPreferredCivs()) {
        const civLeaderFixed = civLeaderPairingData.filter(
          (row) => row.CivilizationType == civID && row.LeaderType == leaderType
        );
        if (civLeaderFixed.length == 0 && !UI.isMultiplayer())
          continue;
      } else {
        civBiasForCivAndLeader = civBiasForCivAndLeader.filter(
          (row) => row.ReasonType != "LOC_REASON_LIVE_EVENT_DESCRIPTION"
        );
      }
      const isHistoricalChoice = civBiasForCivAndLeader.length > 0;
      const isLocked = civData.invalidReason != GameSetupDomainValueInvalidReason.Valid;
      const isOwned = civData.invalidReason != GameSetupDomainValueInvalidReason.NotValidOwnership;
      const civHistoricalChoiceReason = civBiasForCivAndLeader.filter((row) => row.ReasonType != null).map((row) => Locale.compose(row.ReasonType)).join(", ");
      const civHistoricalChoiceType = civBiasForCivAndLeader.filter((row) => row.ChoiceType != null).map((row) => Locale.compose(row.ChoiceType)).join(", ");
      results.push({
        civID,
        name: Locale.stylize(name),
        description: Stylize ? Locale.stylize(description ?? "") : description ?? "",
        icon: icon ?? "",
        image: image ?? "",
        abilityTitle: Stylize ? Locale.stylize(ability?.Name ?? "") : ability?.Name ?? "",
        abilityText: Stylize ? Locale.stylize(ability?.Description ?? "") : ability?.Description ?? "",
        bonuses: bonusItems,
        tags,
        unlocks,
        unlockedBy,
        historicalChoiceReason: civHistoricalChoiceReason,
        historicalChoiceType: civHistoricalChoiceType,
        isHistoricalChoice,
        isLocked,
        isOwned,
        unlockCondition: "",
        // TODO
        sortIndex: civData.sortIndex
      });
    }
  }
  results.sort((a, b) => {
    if (a.sortIndex != b.sortIndex) {
      return a.sortIndex - b.sortIndex;
    } else {
      return Locale.compare(a.name, b.name);
    }
  });
  UI.endProfiling(p);
  cachedCivilizationData = results;
  return cachedCivilizationData;
}

export { GetCivilizationData as G, GetAgeMap as a };
//# sourceMappingURL=age-civ-select-model.chunk.js.map
