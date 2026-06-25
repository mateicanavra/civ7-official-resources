import { createSignal, createEffect, createMemo, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { createMutable, modifyMutable, reconcile } from '../../../vendor/solid-js/store/dist/store.js';
import LiveEventManager from '../../../ui/shell/live-event-logic/live-event-logic.js';
import { DatabaseCache } from '../../../ui/utilities/utilities-data.js';
import { AgeSelectModel, useAgeSelectModelContext } from './age-select-model.js';
import { SetupParametersModel, PlayerSetupParametersModel } from './game-parameters-model.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';
import { FullTextSearch } from '../../utilities/search-utils.js';

const cachedCivDatabase = new DatabaseCache("config");
function getTypeDomainKey(type, domain) {
  return `${type}|${domain ?? ""}`;
}
function createCivSelectModel() {
  SetupParametersModel.get().forceRefresh();
  const playerConfig = PlayerSetupParametersModel.get().players[GameContext.localPlayerID];
  const isAgeTransition = UI.isInGame();
  const playerCivilization = isAgeTransition ? playerConfig.AgeTransitionPlayerCivilization : playerConfig.PlayerCivilization;
  const prevCivilization = playerConfig.PlayerCivilization;
  let prevCivInfo = void 0;
  const ages = AgeSelectModel.get();
  const [viewCiv, setViewCiv] = createSignal();
  function resolveBonusIcon(bonus) {
    return bonus.Kind === "KIND_QUARTER" ? "CITY_UNIQUE_QUARTER" : bonus.Type;
  }
  function getCivilizations() {
    const civilizations = [];
    if (playerCivilization) {
      const civItemData = cachedCivDatabase.query(
        "select * from CivilizationItems order by SortIndex"
      );
      const civTagData = cachedCivDatabase.query(
        "select * from CivilizationTags inner join Tags on CivilizationTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
      );
      const civUnlockData = cachedCivDatabase.query(
        "select * from CivilizationUnlocks order by SortIndex"
      );
      const leaderUnlocks = cachedCivDatabase.query(
        "select * from LeaderUnlocks order by SortIndex"
      );
      const civLeaderPairingData = cachedCivDatabase.query(
        "select * from LeaderCivParings"
      );
      const civilizationsData = cachedCivDatabase.query(
        "select CivilizationType, CivilizationName, CivilizationIntroText from Civilizations"
      );
      const leadersData = cachedCivDatabase.query(
        "select LeaderType, LeaderName from Leaders"
      );
      const legacyCivTraitsData = cachedCivDatabase.query(
        "select CivilizationType, TraitType from LegacyCivilizationTraits"
      );
      const traditionsData = cachedCivDatabase.query(
        "SELECT Traditions.TraitType, Traditions.Name, Traditions.Description, Traditions.AgeType, COALESCE(Nodes.Name, IIF(Syncretism.CivilizationType IS NULL, NULL, 'LOC_UI_SYNCRETISM_TITLE')) AS Civic FROM Traditions LEFT JOIN ( SELECT * FROM ProgressionTreeNodeUnlocks INNER JOIN ProgressionTreeNodes ON ProgressionTreeNodeUnlocks.ProgressionTreeNodeType = ProgressionTreeNodes.ProgressionTreeNodeType ) AS Nodes ON Traditions.TraditionType = Nodes.TargetType LEFT JOIN CivSelfSyncretismUnlocks AS Syncretism ON Syncretism.UnlockType = Traditions.TraditionType WHERE Civic IS NOT NULL"
      );
      const civItemsByType = /* @__PURE__ */ new Map();
      for (const item of civItemData) {
        const civType = item.CivilizationType ?? "";
        if (!civType) {
          continue;
        }
        const items = civItemsByType.get(civType);
        if (items) {
          items.push(item);
        } else {
          civItemsByType.set(civType, [item]);
        }
      }
      const civTagsByTypeDomain = /* @__PURE__ */ new Map();
      for (const tag of civTagData) {
        const civType = tag.CivilizationType ?? "";
        const civDomain = tag.CivilizationDomain ?? "";
        if (!civType) {
          continue;
        }
        const key = getTypeDomainKey(civType, civDomain);
        const tags = civTagsByTypeDomain.get(key);
        if (tags) {
          tags.push(tag);
        } else {
          civTagsByTypeDomain.set(key, [tag]);
        }
      }
      const civUnlocksByCivDomain = /* @__PURE__ */ new Map();
      const civUnlocksByType = /* @__PURE__ */ new Map();
      for (const unlock of civUnlockData) {
        const civType = unlock.CivilizationType ?? "";
        const civDomain = unlock.CivilizationDomain ?? "";
        const unlockType = unlock.Type ?? "";
        if (civType) {
          const civDomainKey = getTypeDomainKey(civType, civDomain);
          const civDomainUnlocks = civUnlocksByCivDomain.get(civDomainKey);
          if (civDomainUnlocks) {
            civDomainUnlocks.push(unlock);
          } else {
            civUnlocksByCivDomain.set(civDomainKey, [unlock]);
          }
        }
        if (unlockType) {
          const unlocks = civUnlocksByType.get(unlockType);
          if (unlocks) {
            unlocks.push(unlock);
          } else {
            civUnlocksByType.set(unlockType, [unlock]);
          }
        }
      }
      const leaderUnlocksByType = /* @__PURE__ */ new Map();
      for (const unlock of leaderUnlocks) {
        const unlockType = unlock.Type ?? "";
        if (!unlockType) {
          continue;
        }
        const unlocks = leaderUnlocksByType.get(unlockType);
        if (unlocks) {
          unlocks.push(unlock);
        } else {
          leaderUnlocksByType.set(unlockType, [unlock]);
        }
      }
      const civLeaderPairingSet = /* @__PURE__ */ new Set();
      for (const pairing of civLeaderPairingData) {
        const civType = pairing.CivilizationType ?? "";
        const leaderType2 = pairing.LeaderType ?? "";
        if (!civType || !leaderType2) {
          continue;
        }
        civLeaderPairingSet.add(`${civType}|${leaderType2}`);
      }
      const civTraitByCivType = /* @__PURE__ */ new Map();
      for (const row of legacyCivTraitsData) {
        const civType = row.CivilizationType ?? "";
        const traitType = row.TraitType ?? "";
        if (!civType || !traitType) {
          continue;
        }
        civTraitByCivType.set(civType, traitType);
      }
      const civIntroTextByType = /* @__PURE__ */ new Map();
      const civNameByType = /* @__PURE__ */ new Map();
      for (const civ of civilizationsData) {
        const civType = civ.CivilizationType ?? "";
        if (!civType) {
          continue;
        }
        civIntroTextByType.set(civType, civ.CivilizationIntroText ?? "");
        civNameByType.set(civType, civ.CivilizationName ?? "");
      }
      const leaderNameByType = /* @__PURE__ */ new Map();
      for (const leader of leadersData) {
        const leaderType2 = leader.LeaderType ?? "";
        if (!leaderType2) {
          continue;
        }
        leaderNameByType.set(leaderType2, leader.LeaderName ?? "");
      }
      const traditionsByTrait = /* @__PURE__ */ new Map();
      for (const row of traditionsData) {
        const traitType = row.TraitType ?? "";
        if (!traitType) {
          continue;
        }
        const traditions = traditionsByTrait.get(traitType);
        const tradition = {
          title: row.Name ?? "",
          text: row.Description ?? "",
          plainText: Locale.plainText(row.Description ?? ""),
          civic: row.Civic ?? "",
          age: row.AgeType ?? void 0
        };
        if (traditions) {
          traditions.push(tradition);
        } else {
          traditionsByTrait.set(traitType, [tradition]);
        }
      }
      for (const traditions of traditionsByTrait.values()) {
        traditions.sort((a, b) => {
          if (a.civic == b.civic) return 0;
          if (a.civic == "LOC_UI_SYNCRETISM_TITLE") return 1;
          if (b.civic == "LOC_UI_SYNCRETISM_TITLE") return -1;
          return Locale.compare(a.civic, b.civic);
        });
      }
      const leaderParameter = GameSetup.findPlayerParameter(GameContext.localPlayerID, "PlayerLeader");
      const leaderType = leaderParameter ? leaderParameter.value.value : "";
      const prevCivCount = Configuration.getPlayer(GameContext.localPlayerID).previousCivilizationCount;
      const previousCivs = /* @__PURE__ */ new Set();
      for (let i = 0; i < prevCivCount; ++i) {
        previousCivs.add(Configuration.getPlayer(GameContext.localPlayerID).getPreviousCivilization(i));
      }
      const invalidReasonsToInclude = /* @__PURE__ */ new Set([
        GameSetupDomainValueInvalidReason.Valid,
        GameSetupDomainValueInvalidReason.NotValidLocked,
        GameSetupDomainValueInvalidReason.NotValidOwnership
      ]);
      if (isAgeTransition) {
        invalidReasonsToInclude.add(GameSetupDomainValueInvalidReason.NotValidAgeTransition);
      }
      for (const civData of playerCivilization.domain.possibleValues ?? []) {
        if (!invalidReasonsToInclude.has(civData.invalidReason)) {
          continue;
        }
        const civID = civData.value?.toString();
        if (!civID) {
          continue;
        }
        const civHash = Database.makeHash(civID);
        const rawName = GameSetup.resolveString(civData.name);
        if (!rawName) {
          continue;
        }
        const colors = UI.Color.getDefaultColors3DAsHex(civHash);
        const name = Locale.stylize(rawName ?? "");
        const image = GameSetup.resolveString(civData.icon);
        if (!image) {
          console.error(`age-civ-select-model: DB icon reference for civ ${name} is null`);
          continue;
        }
        const bgImage = `bg-panel-${civID.replace("CIVILIZATION_", "").toLowerCase()}`;
        const icon = UI.getIconURL(civID == "RANDOM" ? "CIVILIZATION_RANDOM" : civID, "");
        const domain = GameSetup.resolveString(civData.originDomain);
        const civTags = civTagsByTypeDomain.get(getTypeDomainKey(civID, domain)) ?? [];
        const traits = civTags.filter((tag) => !tag.HideInDetails && tag.TagCategoryType == "TAG_CATEGORY_TRAIT").map((t) => t.Name);
        const age = civTags.filter((tag) => tag.HideInDetails && tag.TagCategoryType == "TAG_CATEGORY_APEX_AGE").map((t) => t.TagType?.replace("TAG_APEX_", ""));
        const apexAge = age?.length > 0 ? age[0] : "AGE_ANTIQUITY";
        const ageSortIndex = ages.sortedAges.findIndex((age2) => age2.type == apexAge);
        const ageInfo = ages.sortedAges[ageSortIndex];
        const ageID = ageInfo?.type ?? "";
        const ageName = ageInfo?.name ?? "";
        const introText = civIntroTextByType.get(civID) ?? "";
        const valueUnlocks = (civUnlocksByCivDomain.get(getTypeDomainKey(civID, domain)) ?? []).filter(
          (unlock) => unlock.AgeDomain == null || ages.sortedAges.find((age2) => age2.type == unlock.AgeType)?.domain == unlock.AgeDomain
        );
        valueUnlocks.sort(
          (a, b) => a.AgeType == b.AgeType ? Locale.compare(a.Type, b.Type) : Locale.compare(a.AgeType, b.AgeType)
        );
        const unlocks = valueUnlocks.map((unlock) => {
          const ageName2 = unlock.AgeDomain ? ages.getAgeName(unlock.AgeType) : null;
          return ageName2 ? Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM_IN_AGE", unlock.Name, ageName2) : Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM", unlock.Name);
        });
        const civItems = civItemsByType.get(civID) ?? [];
        const abilityData = civItems.filter((item) => item.Kind == "KIND_TRAIT");
        const perAgeAbilities = abilityData.map((ability) => ({
          abilityTextTag: ability?.Description,
          abilityTitle: Locale.stylize(ability?.Name ?? ""),
          abilityText: Locale.stylize(ability?.Description ?? ""),
          abilityPlainText: Locale.plainText(ability?.Description ?? ""),
          age: ability?.AgeType
        }));
        const buildings = civItems.filter(
          (item) => item.Kind == "KIND_BUILDING" || item.Kind == "KIND_IMPROVEMENT" || item.Kind == "KIND_QUARTER" || item.Kind == "KIND_ROUTE"
        ).map((item) => ({
          title: Locale.stylize(item.Name ?? ""),
          icon: resolveBonusIcon(item),
          text: Locale.stylize(item.Description ?? ""),
          plainText: Locale.plainText(item.Description ?? ""),
          description: item.Description ?? "",
          kind: item.Kind ?? "",
          age: item.AgeType ?? void 0
        }));
        const units = civItems.filter((item) => item.Kind == "KIND_UNIT").map((item) => ({
          title: Locale.stylize(item.Name ?? ""),
          icon: resolveBonusIcon(item),
          text: Locale.stylize(item.Description ?? ""),
          plainText: Locale.plainText(item.Description ?? ""),
          description: item.Description ?? "",
          kind: item.Kind ?? "",
          age: item.AgeType ?? void 0
        }));
        if (LiveEventManager.restrictToPreferredCivs()) {
          const hasFixedPairing = civLeaderPairingSet.has(`${civID}|${leaderType}`);
          if (!hasFixedPairing && !UI.isMultiplayer())
            continue;
        }
        const isLocked = civData.invalidReason != GameSetupDomainValueInvalidReason.Valid;
        const isOwned = civData.invalidReason != GameSetupDomainValueInvalidReason.NotValidOwnership;
        const unlocksByCiv = (civUnlocksByType.get(civID) ?? []).filter(
          (unlock) => unlock.AgeDomain == null || ages.sortedAges.find((a) => a.type == unlock.AgeType)?.domain == unlock.AgeDomain
        ).map((civ) => {
          const civId = Database.makeHash(civ.CivilizationType ?? "");
          return {
            text: Locale.compose(
              "LOC_AGE_TRANSITION_PLAY_AS",
              civNameByType.get(civ.CivilizationType ?? "") ?? ""
            ),
            isUnlocked: previousCivs.has(civId)
          };
        });
        const unlocksByLeader = (leaderUnlocksByType.get(civID) ?? []).filter(
          (unlock) => unlock.AgeDomain == null || ages.sortedAges.find((a) => a.type == unlock.AgeType)?.domain == unlock.AgeDomain
        ).map((unlock) => {
          return {
            text: Locale.compose(
              "LOC_AGE_TRANSITION_PLAY_AS",
              leaderNameByType.get(unlock.LeaderType ?? "") ?? ""
            ),
            isUnlocked: leaderType == unlock.LeaderType
          };
        });
        const unlockedBy = [...unlocksByCiv, ...unlocksByLeader];
        const civTrait = civTraitByCivType.get(civID) ?? civID.replace("CIVILIZATION_", "TRAIT_");
        const traditions = civTrait ? traditionsByTrait.get(civTrait) ?? [] : [];
        const fulltext = Locale.toLower(
          [
            name,
            perAgeAbilities.map((b) => `${b.abilityTitle} ${b.abilityPlainText}`).join(" "),
            traits.map((t) => Locale.plainText(t)).join(" "),
            buildings.map((b) => `${b.title} ${b.plainText}`).join(" "),
            units.map((u) => `${u.title} ${u.plainText}`).join(" "),
            traditions.map((t) => `${Locale.plainText(t.title)} ${t.plainText}`).join(" ")
          ].join(" ")
        );
        const civInfo = {
          civID,
          name,
          icon: icon ?? "",
          bgImage,
          perAgeAbilities,
          buildings,
          units,
          traits,
          traditions,
          isLocked,
          isOwned,
          apexAge: ageID,
          ageSortIndex,
          ageName,
          fulltext,
          colors,
          introText,
          unlocks,
          unlockedBy
        };
        if (prevCivilization.value.value == civID) {
          prevCivInfo = civInfo;
        }
        civilizations.push(civInfo);
      }
    }
    return civilizations;
  }
  const civs = getCivilizations();
  const mutableCivs = createMutable(civs);
  createEffect(() => {
    const updatedCivs = getCivilizations();
    modifyMutable(mutableCivs, reconcile(updatedCivs));
  });
  const previousCiv = createMemo(() => prevCivInfo);
  const selectedCiv = createMemo(() => civs.find((c) => c.civID == playerCivilization.value.value) ?? civs[0]);
  function setSelectedCiv(civ) {
    playerCivilization.setValue(civ.civID);
  }
  const selectedIndex = createMemo(() => civs.findIndex((c) => selectedCiv().civID == c.civID));
  const selectNext = () => {
    let newIndex = selectedIndex() + 1;
    if (newIndex >= civs.length) {
      newIndex = 0;
    }
    setSelectedCiv(civs[newIndex]);
  };
  const selectPrev = () => {
    let newIndex = selectedIndex() - 1;
    if (newIndex < 0) {
      newIndex = civs.length - 1;
    }
    setSelectedCiv(civs[newIndex]);
  };
  const randomCiv = mutableCivs.find((c) => c.civID == "RANDOM");
  const search = new FullTextSearch("CivSelectFilter");
  search.addSearchData(civs.map((c) => ({ key: c.civID, title: c.name, fullText: c.fulltext })));
  const fulltextSearch = (text) => search.find(text);
  return {
    civs: mutableCivs,
    randomCiv,
    previousCiv,
    selectedCiv,
    setSelectedCiv,
    selectNext,
    selectPrev,
    viewCiv,
    setViewCiv,
    fulltextSearch
  };
}
const createAgeFilterModel = /* @__PURE__ */ (() => {
  let model = null;
  return function() {
    if (model) return model;
    const ageModel = useAgeSelectModelContext();
    const isAgeTransition = UI.isInGame();
    const options = [
      { ageId: "ALL", name: Locale.compose("LOC_UI_CREATE_GAME_FILTER_ALL_AGES").toUpperCase() },
      ...ageModel.sortedAges.map((a) => ({ ageId: a.type, name: Locale.compose(a.name).toUpperCase() }))
    ];
    const defaultAgeFilter = isAgeTransition ? options.find((a) => a.ageId == ageModel.nextAge.type) ?? options[0] : options[0];
    const [selected, setSelected] = createSignal(defaultAgeFilter);
    function isMatch(ageId) {
      const selectedId = selected().ageId;
      return selectedId == "ALL" || selectedId == ageId;
    }
    function reset() {
      setSelected(defaultAgeFilter);
    }
    model = {
      selected,
      setSelected,
      options,
      isMatch,
      reset
    };
    return model;
  };
})();
const [getFilter, setFilter] = createSignal("LOC_LEGACIES_FILTER_ALL_ATTRIBUTES");
const attrFilter = {
  getFilter,
  setFilter,
  reset: () => setFilter("LOC_LEGACIES_FILTER_ALL_ATTRIBUTES")
};
const CivSelectModel = ModelRegistry.register(
  "CivSelectModel",
  ModelLifecycle.SharedInstance,
  createCivSelectModel
);
const CivSelectModelContext = createContext();
function useCivSelectModelContext() {
  const context = useContext(CivSelectModelContext);
  if (!context) {
    throw new Error("useCivSelectModel: Cannot find context!");
  }
  return context;
}

export { CivSelectModel, CivSelectModelContext, attrFilter, createAgeFilterModel, createCivSelectModel, useCivSelectModelContext };
//# sourceMappingURL=civ-select-model.js.map
