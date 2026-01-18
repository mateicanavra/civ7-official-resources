import { a as GetAgeMap } from './age-civ-select-model.chunk.js';
import { L as LiveEventManager } from '../live-event-logic/live-event-logic.chunk.js';
import { D as DatabaseCache } from '../../utilities/utilities-data.chunk.js';

var OwnershipAction = /* @__PURE__ */ ((OwnershipAction2) => {
  OwnershipAction2[OwnershipAction2["None"] = 0] = "None";
  OwnershipAction2[OwnershipAction2["IncludedWith"] = 1] = "IncludedWith";
  OwnershipAction2[OwnershipAction2["LinkAccount"] = 2] = "LinkAccount";
  return OwnershipAction2;
})(OwnershipAction || {});
var MementoSlotType = /* @__PURE__ */ ((MementoSlotType2) => {
  MementoSlotType2[MementoSlotType2["Major"] = 0] = "Major";
  MementoSlotType2[MementoSlotType2["Minor"] = 1] = "Minor";
  return MementoSlotType2;
})(MementoSlotType || {});
const funcDescName = GameSetup.findString("FunctionalDescription");
function resolveMemento(value) {
  const funcDescProp = value.additionalProperties?.find((v) => v.name === funcDescName);
  return {
    value: value.value.toString(),
    name: GameSetup.resolveString(value.name),
    description: GameSetup.resolveString(value.description),
    functionalDescription: funcDescProp?.value,
    icon: GameSetup.resolveString(value.icon)
  };
}
function getMementoData() {
  const mementoSlotParameters = GameSetup.getMementoFilteredPlayerParameters(GameContext.localPlayerID);
  const mementoSlotMetadata = Online.Metaprogression.getMementoSlotData();
  const mementoData = [];
  for (const mementoSlotParam of mementoSlotParameters) {
    if (!mementoSlotParam.hidden && mementoSlotParam.invalidReason == GameSetupParameterInvalidReason.Valid) {
      const paramId = GameSetup.resolveString(mementoSlotParam.ID);
      const metadata = mementoSlotMetadata.find((m) => m.mementoTypeId == paramId);
      if (metadata) {
        const isLocked = metadata.displayType == DisplayType.DISPLAY_LOCKED;
        const isMajor = paramId?.startsWith("PlayerMementoMajorSlot");
        const slotData = {
          gameParameter: GameSetup.resolveString(mementoSlotParam.ID) ?? "",
          slotType: isMajor ? 0 /* Major */ : 1 /* Minor */,
          isLocked,
          unlockReason: metadata.unlockTitle,
          currentMemento: resolveMemento(mementoSlotParam.value),
          availableMementos: isLocked ? [] : mementoSlotParam.domain.possibleValues.map(resolveMemento)
        };
        if (slotData.currentMemento.name && slotData.currentMemento.name != "LOC_MEMENTO_NONE_NAME") {
          const mementoName = slotData.currentMemento.name.substring(
            4,
            slotData.currentMemento.name.length - 5
          );
          if (!Online.UserProfile.isRewardUnlocked(mementoName) || isLocked) {
            const noMemento = {
              value: Locale.compose("LOC_MEMENTO_NONE_NAME"),
              name: "LOC_MEMENTO_NONE_NAME",
              description: "LOC_MEMENTO_NONE_DESCRIPTION",
              functionalDescription: null,
              icon: null
            };
            slotData.currentMemento = noMemento;
          }
        }
        mementoData.push(slotData);
      } else {
        console.log(`Unable to find memento slot metadata for ${paramId}`);
      }
    }
  }
  return mementoData;
}
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
let cachedLeaderData = null;
function getLeaderData(Stylize = true) {
  if (cachedLeaderData) {
    return cachedLeaderData;
  }
  queueMicrotask(() => {
    console.debug("Wiping leaderData");
    cachedLeaderData = null;
  });
  const p = UI.beginProfiling("getLeaderData");
  console.debug("Constructing Leader Data (Expensive)");
  const leaderData = [];
  const playerParameter = GameSetup.findPlayerParameter(GameContext.localPlayerID, "PlayerLeader");
  if (playerParameter) {
    const bonusItems = leaderData_DatabaseCache.query("select * from LeaderItems order by SortIndex");
    const tags = leaderData_DatabaseCache.query(
      "select * from LeaderTags inner join Tags on LeaderTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
    );
    const unlocks = leaderData_DatabaseCache.query("select * from LeaderUnlocks order by SortIndex");
    const ownershipConditions = leaderData_DatabaseCache.query("select * from OwnershipConditions");
    const quotes = leaderData_DatabaseCache.query("select * from LeaderQuotes");
    const legendsPaths = Online.Metaprogression.getLegendPathsData();
    const ageMap = GetAgeMap();
    const victoryProgress = HallofFame.getLeaderProgress("RULESET_STANDARD");
    for (const leader of playerParameter.domain.possibleValues ?? []) {
      const leaderID = leader.value?.toString();
      const name = GameSetup.resolveString(leader.name);
      if (!leaderID || !name) {
        continue;
      }
      if (leader.invalidReason == GameSetupDomainValueInvalidReason.NotValid) {
        continue;
      }
      if (LiveEventManager.restrictToPreferredCivs() && leaderID == "RANDOM") {
        continue;
      }
      const domain = GameSetup.resolveString(leader.originDomain);
      const description = GameSetup.resolveString(leader.description) ?? "";
      const leaderQuotes = quotes?.filter((q) => q.LeaderType == leaderID);
      const quote = leaderQuotes && leaderQuotes.length > 0 ? leaderQuotes[0].Quote : void 0;
      const valueBonusItems = bonusItems.filter(
        (item) => item.LeaderType == leaderID && item.LeaderDomain == domain
      );
      const valueTags = tags.filter(
        (tag) => !tag.HideInDetails && tag.LeaderType == leaderID && tag.LeaderDomain == domain
      ).map((tag) => Locale.compose(tag.Name));
      const valueUnlocks = unlocks.filter(
        (unlock) => unlock.LeaderType == leaderID && unlock.LeaderDomain == domain && (!unlock.AgeDomain || unlock.AgeDomain == ageMap.get(unlock.AgeType)?.domain)
      );
      const formattedAgeUnlocks = [];
      const formattedUnlocks = [];
      const ageOrder = Array.from(ageMap.keys());
      valueUnlocks.sort((a, b) => ageOrder.indexOf(a.AgeType) - ageOrder.indexOf(b.AgeType));
      for (const unlock of valueUnlocks) {
        const age = unlock.AgeDomain ? ageMap.get(unlock.AgeType) : void 0;
        if (age) {
          formattedAgeUnlocks.push(
            Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM_IN_AGE", unlock.Name, age.name)
          );
        } else {
          formattedUnlocks.push(Locale.stylize("LOC_CREATE_GAME_UNLOCK_ITEM", unlock.Name));
        }
      }
      const trait = valueBonusItems.find((item) => item.Kind == "KIND_TRAIT");
      const abilityTitle = trait?.Name;
      const abilityText = trait?.Description;
      const progress = victoryProgress.find((p2) => p2.leaderType == leaderID);
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
      leaderData.push({
        leaderID,
        name: Locale.stylize(name),
        icon,
        description: Stylize ? Locale.stylize(description ?? "") : description ?? "",
        abilityTitle: Stylize ? Locale.stylize(abilityTitle ?? "") : abilityTitle ?? "",
        abilityText: Stylize ? Locale.stylize(abilityText ?? "") : abilityText ?? "",
        ageUnlocks: formattedAgeUnlocks,
        unlocks: formattedUnlocks,
        nextReward,
        playCount,
        level: currentLevel,
        currentXp: legendData?.currentXp ?? 0,
        nextLevelXp: legendData?.nextLevelXp ?? 0,
        prevLevelXp: legendData?.prevLevelXp ?? 0,
        tags: valueTags,
        isLocked,
        isOwned,
        ownershipData,
        sortIndex: leader.sortIndex,
        quote: quote ? Locale.stylize(quote) : ""
      });
    }
  }
  leaderData.sort((a, b) => {
    if (a.sortIndex != b.sortIndex) {
      return a.sortIndex - b.sortIndex;
    } else {
      return Locale.compare(a.name, b.name);
    }
  });
  UI.endProfiling(p);
  cachedLeaderData = leaderData;
  return cachedLeaderData;
}

export { MementoSlotType as M, OwnershipAction as O, getMementoData as a, getLeaderData as g };
//# sourceMappingURL=leader-select-model.chunk.js.map
