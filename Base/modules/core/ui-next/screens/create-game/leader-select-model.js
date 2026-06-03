import { createMemo, createEffect, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { createMutable, modifyMutable, reconcile } from '../../../vendor/solid-js/store/dist/store.js';
import LiveEventManager from '../../../ui/shell/live-event-logic/live-event-logic.js';
import { DatabaseCache } from '../../../ui/utilities/utilities-data.js';
import { AgeSelectModel } from './age-select-model.js';
import { PlayerSetupParametersModel } from './game-parameters-model.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';
import { FullTextSearch } from '../../utilities/search-utils.js';

var OwnershipAction = /* @__PURE__ */ ((OwnershipAction2) => {
  OwnershipAction2[OwnershipAction2["None"] = 0] = "None";
  OwnershipAction2[OwnershipAction2["IncludedWith"] = 1] = "IncludedWith";
  OwnershipAction2[OwnershipAction2["LinkAccount"] = 2] = "LinkAccount";
  return OwnershipAction2;
})(OwnershipAction || {});
function getOwnershipAction(actionName) {
  switch (actionName) {
    case "LOC_LOCKED_INCLUDED_WITH_CONTENT":
      return 1 /* IncludedWith */;
    case "LOC_LOCKED_LINK_ACCOUNT":
      return 2 /* LinkAccount */;
  }
  return 0 /* None */;
}
const leaderData_DatabaseCache = new DatabaseCache("config");
function createLeaderSelectModel() {
  const playerSetupModel = PlayerSetupParametersModel.get();
  const playerLeader = createMemo(() => playerSetupModel.players[GameContext.localPlayerID].PlayerLeader);
  const ageModel = AgeSelectModel.get();
  function getLeaders() {
    const leaders = [];
    if (playerLeader()) {
      const bonusItems = leaderData_DatabaseCache.query("select * from LeaderItems order by SortIndex");
      const tags = leaderData_DatabaseCache.query(
        "select * from LeaderTags inner join Tags on LeaderTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
      );
      const unlocks = leaderData_DatabaseCache.query("select * from LeaderUnlocks order by SortIndex");
      const ownershipConditions = leaderData_DatabaseCache.query("select * from OwnershipConditions");
      const quotes = leaderData_DatabaseCache.query("select * from LeaderQuotes");
      const legendsPaths = Online.Metaprogression.getLegendPathsData();
      const victoryProgress = HallofFame.getLeaderProgress("RULESET_STANDARD");
      const invalidReasonsToInclude = /* @__PURE__ */ new Set([
        GameSetupDomainValueInvalidReason.Valid,
        GameSetupDomainValueInvalidReason.NotValidLocked,
        GameSetupDomainValueInvalidReason.NotValidOwnership
      ]);
      for (const leader of playerLeader().domain.possibleValues ?? []) {
        if (!invalidReasonsToInclude.has(leader.invalidReason)) {
          continue;
        }
        const leaderID = leader.value?.toString();
        const rawName = GameSetup.resolveString(leader.name);
        if (!leaderID || !rawName) {
          continue;
        }
        const leaderIntroText = leaderData_DatabaseCache.query(
          `select LeaderIntroText from Leaders where LeaderType = '${leaderID}'`
        );
        const introText = leaderIntroText.length > 0 ? leaderIntroText[0].LeaderIntroText : "";
        const leaderHash = Database.makeHash(leaderID);
        const name = Locale.stylize(rawName ?? "");
        if (LiveEventManager.restrictToPreferredCivs() && leaderID == "RANDOM") {
          continue;
        }
        const colors = UI.Color.getDefaultColors3DAsHex(leaderHash);
        const domain = GameSetup.resolveString(leader.originDomain);
        const rawDescription = GameSetup.resolveString(leader.description) ?? "";
        const description = Locale.stylize(rawDescription);
        const leaderQuotes = quotes?.filter((q) => q.LeaderType == leaderID);
        const quote = leaderQuotes && leaderQuotes.length > 0 ? leaderQuotes[0].Quote : void 0;
        const valueBonusItems = bonusItems.filter(
          (item) => item.LeaderType == leaderID && item.LeaderDomain == domain
        );
        const valueTags = tags.filter(
          (tag) => !tag.HideInDetails && tag.LeaderType == leaderID && tag.LeaderDomain == domain
        ).map((tag) => tag.Name);
        const valueUnlocks = unlocks.filter(
          (unlock) => unlock.LeaderType == leaderID && unlock.LeaderDomain == domain && (!unlock.AgeDomain || unlock.AgeDomain == ageModel.sortedAges.find((age) => unlock.AgeType == age.type)?.domain)
        );
        const rawAgeUnlocks = [];
        const rawUnlocks = [];
        for (const unlock of valueUnlocks) {
          const age = unlock.AgeDomain ? ageModel.sortedAges.find((age2) => unlock.AgeType == age2.type) : void 0;
          if (age) {
            rawAgeUnlocks.push({ name: unlock.Name ?? "", age: age.name });
          } else {
            rawUnlocks.push(unlock.Name ?? "");
          }
        }
        const formattedAgeUnlocks = rawAgeUnlocks.map(
          (unlock) => Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM_IN_AGE", unlock.name, unlock.age)
        );
        const formattedUnlocks = rawUnlocks.map(
          (unlock) => Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM", unlock)
        );
        const trait = valueBonusItems.find((item) => item.Kind == "KIND_TRAIT");
        const rawAbilityTitle = trait?.Name ?? "";
        const abilityTitle = Locale.stylize(rawAbilityTitle);
        const rawAbilityText = trait?.Description ?? "";
        const abilityText = Locale.stylize(rawAbilityText);
        const progress = victoryProgress.find((p) => p.leaderType == leaderID);
        const playCount = progress ? progress.playCount : 0;
        let icon = GameSetup.resolveString(leader.icon);
        if (!icon) {
          console.error(`leader-select-panel: getLeaderData(): DB icon reference for leader ${name} is null`);
          icon = "fs://game/base-standard/leader_portrait_unknown.png";
        }
        const legendData = legendsPaths.find(
          (item) => item.legendPathName == `${leaderID.replace("LEADER_", "LEGEND_PATH_")}`
        );
        const currentLevel = legendData?.currentLevel ?? 0;
        const nextReward = legendData?.rewards?.find((reward) => reward.level > currentLevel);
        const isLocked = leader.invalidReason != GameSetupDomainValueInvalidReason.Valid;
        const isOwned = leader.invalidReason != GameSetupDomainValueInvalidReason.NotValidOwnership;
        let ownershipData = void 0;
        if (!isOwned) {
          const ownershipEntry = ownershipConditions?.find((o) => o.ItemType == leaderID);
          if (ownershipEntry) {
            ownershipData = {
              reason: ownershipEntry.Action ?? "",
              action: getOwnershipAction(ownershipEntry.Action)
            };
          }
        }
        const fulltext = Locale.toLower(
          [
            name,
            Locale.plainText(rawDescription),
            Locale.plainText(rawAbilityTitle),
            Locale.plainText(rawAbilityText),
            ...rawAgeUnlocks.map((u) => Locale.plainText(u.name)),
            ...rawUnlocks.map((u) => Locale.plainText(u)),
            ...valueTags.map((t) => Locale.plainText(t))
          ].join(" ")
        );
        const model = leaderID == "RANDOM" ? "LEADER_RANDOMIZED_GAME_ASSET" : `${leaderID}_GAME_ASSET`;
        leaders.push({
          leaderID,
          name,
          rawName,
          // Required for composition as an argument
          icon,
          description,
          abilityTextTag: trait?.Description ?? "",
          abilityTitle,
          abilityText,
          ageUnlocks: formattedAgeUnlocks,
          unlocks: formattedUnlocks,
          nextReward,
          playCount,
          level: currentLevel,
          currentXp: Number(legendData?.currentXp ?? 0),
          nextLevelXp: Number(legendData?.nextLevelXp ?? 0),
          prevLevelXp: Number(legendData?.prevLevelXp ?? 0),
          tags: valueTags,
          isLocked,
          isOwned,
          ownershipData,
          sortIndex: leader.sortIndex,
          quote: quote ? Locale.stylize(quote) : "",
          fulltext,
          model,
          colors,
          introText
        });
      }
      leaders.sort((a, b) => a.name.localeCompare(b.name));
      const randomLeaderIndex = leaders.findIndex((leader) => leader.leaderID == "RANDOM");
      if (randomLeaderIndex >= 0) {
        const [randomLeader] = leaders.splice(randomLeaderIndex, 1);
        leaders.unshift(randomLeader);
      }
    }
    return leaders;
  }
  const mutableLeaders = createMutable(getLeaders());
  const selectedLeader = createMemo(() => {
    const leaderId = playerLeader().value.value;
    return mutableLeaders.find((l) => l.leaderID == leaderId) ?? mutableLeaders[0];
  });
  function setSelectedLeader(leader) {
    playerLeader().setValue(leader.leaderID);
  }
  createEffect(() => {
    const updatedLeaders = getLeaders();
    modifyMutable(mutableLeaders, reconcile(updatedLeaders));
  });
  const search = new FullTextSearch("LeaderSelectFilter");
  search.addSearchData(mutableLeaders.map((l) => ({ key: l.leaderID, title: l.name, fullText: l.fulltext })));
  const fulltextSearch = (text) => search.find(text);
  return { leaders: mutableLeaders, selectedLeader, setSelectedLeader, fulltextSearch };
}
const LeaderSelectModel = ModelRegistry.register(
  "LeaderSelectModel",
  ModelLifecycle.SharedInstance,
  createLeaderSelectModel
);
const LeaderSelectModelContext = createContext();
function useLeaderSelectModelContext() {
  const context = useContext(LeaderSelectModelContext);
  if (!context) {
    throw new Error("usLeaderSelectModel: Cannot find context!");
  }
  return context;
}

export { LeaderSelectModel, LeaderSelectModelContext, OwnershipAction, useLeaderSelectModelContext };
//# sourceMappingURL=leader-select-model.js.map
