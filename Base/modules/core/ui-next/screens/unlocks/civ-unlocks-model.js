import { createSignal, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';

function isBypassCivilizationUnlocksEnabled() {
  const v = Configuration.getGame().getValue("NoCivilizationUnlocks");
  if (v === true) {
    return true;
  } else {
    return false;
  }
}
function createCivUnlocksModel() {
  const player = Players.get(GameContext.localPlayerID);
  if (!player) {
    console.error("legacies-model: Unable to get player object while attempting to populate unlocks data.");
    return {};
  }
  const leaderDef = GameInfo.Leaders.lookup(player.leaderType);
  if (!leaderDef) {
    console.error("legacies-model: Unable to get leader definition for leader type: " + player.leaderType);
    return {};
  }
  const playerCivDef = GameInfo.Civilizations.lookup(player.civilizationType);
  const playerPreviousCivDef = GameInfo.Civilizations.lookup(player.previousAgeCivilizationType);
  const civUnlocks = GameInfo.UnlockRewards.filter((reward) => reward.UnlockRewardKind == "KIND_CIVILIZATION");
  const unlockRewardByType = /* @__PURE__ */ new Map();
  GameInfo.UnlockRewards.forEach((reward) => {
    if (reward.UnlockRewardType) {
      unlockRewardByType.set(reward.UnlockRewardType, reward);
    }
  });
  const unlockRequirementsByType = /* @__PURE__ */ new Map();
  GameInfo.UnlockRequirements.forEach((requirement) => {
    const unlockType = requirement.UnlockType;
    const requirements = unlockRequirementsByType.get(unlockType);
    if (requirements) {
      requirements.push(requirement);
    } else {
      unlockRequirementsByType.set(unlockType, [requirement]);
    }
  });
  const civItemData = Database.query("config", "select * from CivilizationItems order by SortIndex");
  if (!civItemData) {
    console.error("legacies-model: Unable to query CivilizationItems while attempting to populate unlocks data.");
    return {};
  }
  const civTagData = Database.query(
    "config",
    "select * from CivilizationTags inner join Tags on CivilizationTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
  );
  if (!civTagData) {
    console.error("legacies-model: Unable to query CivilizationTags while attempting to populate unlocks data.");
    return {};
  }
  const traditionData = Database.query(
    "config",
    "SELECT Traditions.TraitType, Traditions.Name, Traditions.Description, Traditions.AgeType, ProgressionTreeNodes.Name AS Civic FROM Traditions INNER JOIN ProgressionTreeNodeUnlocks ON Traditions.TraditionType = ProgressionTreeNodeUnlocks.TargetType INNER JOIN ProgressionTreeNodes ON ProgressionTreeNodeUnlocks.ProgressionTreeNodeType = ProgressionTreeNodes.ProgressionTreeNodeType"
  );
  if (!traditionData) {
    console.error("legacies-model: Unable to query Traditions while attempting to populate unlocks data.");
    return {};
  }
  const civItemsByType = /* @__PURE__ */ new Map();
  civItemData.forEach((item) => {
    const civType = item.CivilizationType;
    const items = civItemsByType.get(civType);
    if (items) {
      items.push(item);
    } else {
      civItemsByType.set(civType, [item]);
    }
  });
  const civTagsByType = /* @__PURE__ */ new Map();
  civTagData.forEach((tag) => {
    const civType = tag.CivilizationType;
    const tags = civTagsByType.get(civType);
    if (tags) {
      tags.push(tag);
    } else {
      civTagsByType.set(civType, [tag]);
    }
  });
  const traditionsByTrait = /* @__PURE__ */ new Map();
  traditionData.forEach((row) => {
    const traitType = row.TraitType;
    if (!traitType) {
      return;
    }
    const traditions = traditionsByTrait.get(traitType);
    const tradition = {
      title: row.Name ?? "",
      text: row.Description ?? "",
      civic: row.Civic ?? "",
      age: row.AgeType ?? void 0
    };
    if (traditions) {
      traditions.push(tradition);
    } else {
      traditionsByTrait.set(traitType, [tradition]);
    }
  });
  const civInfos = [];
  const bypassCivUnlocks = isBypassCivilizationUnlocksEnabled();
  civUnlocks.forEach((unlock) => {
    if (!unlock.UnlockRewardType) {
      return;
    }
    const reward = unlockRewardByType.get(unlock.UnlockRewardType);
    if (!reward) {
      console.error("legacies-model: Unable to find reward definition for civ with id: " + unlock.UnlockType);
      return;
    }
    const rewardProgress = Game.Unlocks.getProgressForPlayer(reward.UnlockType, GameContext.localPlayerID);
    const requirements = unlockRequirementsByType.get(reward.UnlockType) ?? [];
    const progressStateByRequirementSetId = /* @__PURE__ */ new Map();
    rewardProgress?.progress.forEach((progress) => {
      progressStateByRequirementSetId.set(progress.requirementSetId, progress.state);
    });
    const unlockedByData = [];
    requirements.forEach((requirement) => {
      const progressState = progressStateByRequirementSetId.get(requirement.RequirementSetId);
      const unlock2 = {
        isUnlocked: progressState == RequirementState.AlwaysMet || progressState == RequirementState.Met,
        text: requirement.Description ?? "",
        isGameplayUnlock: requirement.GameplayUnlock
      };
      unlockedByData.push(unlock2);
    });
    unlockedByData.sort((a, b) => Number(b.isGameplayUnlock) - Number(a.isGameplayUnlock));
    unlockedByData.sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked));
    const civDef = GameInfo.Civilizations.lookup(unlock.UnlockRewardType);
    if (!civDef) {
      return;
    }
    const civTags = civTagsByType.get(civDef.CivilizationType) ?? [];
    const traits = civTags.filter((tag) => !tag.HideInDetails && tag.TagCategoryType == "TAG_CATEGORY_TRAIT").map((t) => t.Name);
    const age = civTags.filter((tag) => tag.HideInDetails && tag.TagCategoryType == "TAG_CATEGORY_APEX_AGE").map((t) => t.TagType?.replace("TAG_APEX_", ""));
    const civItems = civItemsByType.get(civDef.CivilizationType) ?? [];
    const abilityData = civItems.filter((item) => item.Kind == "KIND_TRAIT");
    const perAgeAbilities = abilityData.map((ability) => ({
      abilityTextTag: ability?.Description ?? "",
      abilityTitle: Locale.stylize(ability?.Name ?? ""),
      abilityText: Locale.stylize(ability?.Description ?? ""),
      age: ability?.AgeType
    }));
    const buildings = civItems.filter(
      (item) => item.Kind == "KIND_BUILDING" || item.Kind == "KIND_IMPROVEMENT" || item.Kind == "KIND_QUARTER" || item.Kind == "KIND_ROUTE"
    ).map((item) => ({
      title: Locale.stylize(item.Name ?? ""),
      icon: item.Kind === "KIND_QUARTER" ? "CITY_UNIQUE_QUARTER" : item.Type,
      text: Locale.stylize(item.Description ?? ""),
      description: item.Description ?? "",
      kind: item.Kind ?? "",
      age: item.AgeType ?? void 0
    }));
    const units = civItems.filter((item) => item.Kind == "KIND_UNIT").map((item) => ({
      title: Locale.stylize(item.Name ?? ""),
      icon: item.Kind === "KIND_QUARTER" ? "CITY_UNIQUE_QUARTER" : item.Type,
      text: Locale.stylize(item.Description ?? ""),
      description: item.Description ?? "",
      kind: item.Kind ?? "",
      age: item.AgeType ?? void 0
    }));
    const civTrait = civDef.CivilizationType.replace("CIVILIZATION_", "TRAIT_");
    const traditions = traditionsByTrait.get(civTrait) ?? [];
    const fulltext = Locale.toLower(
      [
        civDef.Name,
        perAgeAbilities.map((b) => `${b.abilityTitle} ${b.abilityText}`).join(" "),
        traits.join(" "),
        GameInfo.Ages.lookup(Game.age)?.Name ?? "",
        buildings.map((b) => `${b.title} ${b.text}`).join(" "),
        units.map((u) => `${u.title} ${u.text}`).join(" "),
        traditions.map((t) => `${t.title} ${t.text}`).join(" ")
      ].join(" ")
    );
    const civInfo = {
      civID: civDef.CivilizationType,
      name: civDef.Name,
      icon: UI.getIcon(civDef.CivilizationType),
      bgImage: `bg-panel-${civDef.CivilizationType.replace("CIVILIZATION_", "").toLowerCase()}`,
      perAgeAbilities,
      traits,
      ageName: GameInfo.Ages.lookup(age[0])?.Name ?? "",
      buildings,
      units,
      traditions,
      isLocked: bypassCivUnlocks ? false : rewardProgress ? rewardProgress.isUnlocked == false : false,
      unlockedBy: unlockedByData,
      isOwned: true,
      apexAge: age[0],
      ageSortIndex: 0,
      colors: UI.Color.getDefaultColors3DAsHex(Database.makeHash(civDef.CivilizationType)),
      unlocks: [],
      fulltext,
      introText: ""
    };
    if (playerCivDef && playerCivDef.CivilizationType == civDef.CivilizationType) {
      civInfo.isCurrentCiv = true;
    } else if (playerPreviousCivDef && playerPreviousCivDef.CivilizationType == civDef.CivilizationType) {
      civInfo.isPreviousCiv = true;
    }
    civInfos.push(civInfo);
  });
  civInfos.sort((a, b) => Number(a.isLocked) - Number(b.isLocked));
  civInfos.sort((a, b) => Number(!a.isCurrentCiv) - Number(!b.isCurrentCiv));
  civInfos.sort((a, b) => Number(!a.isPreviousCiv) - Number(!b.isPreviousCiv));
  const [isViewingDetails, setIsViewingDetails] = createSignal(false);
  return {
    civInfo: civInfos,
    leaderIcon: UI.getIconCSS(leaderDef.LeaderType),
    currentCivType: playerCivDef ? playerCivDef.CivilizationType : "",
    isViewingDetails,
    setIsViewingDetails
  };
}
const CivUnlocksModel = ModelRegistry.register(
  "CivUnlocksModel",
  ModelLifecycle.SharedInstance,
  createCivUnlocksModel
);
const CivUnlocksContext = createContext();
function useCivUnlocksContext() {
  const context = useContext(CivUnlocksContext);
  if (!context) {
    throw new Error("Unable to get unlocks screen context!");
  }
  return context;
}

export { CivUnlocksContext, CivUnlocksModel, createCivUnlocksModel, useCivUnlocksContext };
//# sourceMappingURL=civ-unlocks-model.js.map
