const DEBUG_LOG_MISSING_IDS = false;
var UnlockableRewardType = /* @__PURE__ */ ((UnlockableRewardType2) => {
  UnlockableRewardType2[UnlockableRewardType2["Badge"] = 3801327255] = "Badge";
  UnlockableRewardType2[UnlockableRewardType2["Banner"] = 2340454002] = "Banner";
  UnlockableRewardType2[UnlockableRewardType2["Border"] = 602451426] = "Border";
  UnlockableRewardType2[UnlockableRewardType2["Title"] = 928356065] = "Title";
  UnlockableRewardType2[UnlockableRewardType2["Memento"] = 4287908646] = "Memento";
  UnlockableRewardType2[UnlockableRewardType2["StrategyCard"] = 456188808] = "StrategyCard";
  UnlockableRewardType2[UnlockableRewardType2["AtrributeNode"] = 2269616578] = "AtrributeNode";
  UnlockableRewardType2[UnlockableRewardType2["Color"] = 2050336355] = "Color";
  UnlockableRewardType2[UnlockableRewardType2["Slot"] = 2901129264] = "Slot";
  return UnlockableRewardType2;
})(UnlockableRewardType || {});
const memoize = (fn) => {
  const cache = /* @__PURE__ */ new Map();
  return (forceUpdate = false, ...args) => {
    const key = JSON.stringify(args);
    if (!forceUpdate && cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
class AuthUpdateListener {
  constructor() {
    engine.on("OwnershipAuthorizationChanged", this.updatePerms, this);
    engine.on("LiveEventActiveUpdated", this.activeLiveEventListener);
    engine.on("ForceUpdateToCachedData", forceCacheUpdate, this);
  }
  updatePerms() {
    UnlockableRewardItems.updatePermissions();
  }
  activeLiveEventListener() {
    UnlockableRewardItems.populateRewardList();
  }
}
const authListener = new AuthUpdateListener();
const memoRewards = memoize(() => Online.UserProfile.getRewardEntries());
const memoMyPlayerProfile = memoize(() => Online.UserProfile.getUserProfileData());
const memoPlayerProfile = memoize(
  (friendId, platformUsername) => Online.UserProfile.getOthersUserProfile(friendId, platformUsername)
);
class RewardItems {
  bannerRewardItems = [];
  badgeRewardItems = [];
  titleRewardItems = [];
  colorRewardItems = [];
  borderRewardItems = [];
  constructor() {
    this.populateRewardList();
  }
  getBadge(id) {
    const badge = this.badgeRewardItems.find((badge2) => badge2.gameItemId === id);
    if (badge) {
      return badge;
    } else {
      if (DEBUG_LOG_MISSING_IDS) console.error(`Badge with id ${id} not found`);
      return this.badgeRewardItems[0];
    }
  }
  getBanner(id) {
    const banner = this.bannerRewardItems.find((banner2) => banner2.gameItemId === id);
    if (banner) {
      return banner;
    } else {
      if (DEBUG_LOG_MISSING_IDS) console.error(`Banner with id ${id} not found`);
      return this.bannerRewardItems[0];
    }
  }
  getTitle(id) {
    const titleItem = this.titleRewardItems.find((title) => title.gameItemId === id);
    if (titleItem) {
      return titleItem;
    } else {
      if (DEBUG_LOG_MISSING_IDS) console.error(`Title with id ${id} not found`);
      return this.titleRewardItems[0];
    }
  }
  getColor(id) {
    const colorItem = this.colorRewardItems.find((color) => color.color === id);
    if (colorItem) {
      return colorItem;
    } else {
      if (DEBUG_LOG_MISSING_IDS) console.error(`Color with id ${id} not found`);
      return this.colorRewardItems[0];
    }
  }
  getBorder(id) {
    const border = this.borderRewardItems.find((border2) => border2.gameItemId === id);
    if (border) {
      return border;
    } else {
      if (DEBUG_LOG_MISSING_IDS) console.error(`Border with id ${id} not found`);
      return this.borderRewardItems[0];
    }
  }
  updatePermissions() {
    const rewards = Online.UserProfile.getRewardEntries();
    const updateRewards = (reward, itemList) => {
      for (const item of itemList) {
        if (item.gameItemId == reward.gameItemID) {
          item.isLocked = reward.isLocked;
        }
      }
    };
    for (const reward of rewards) {
      updateRewards(reward, this.bannerRewardItems);
      updateRewards(reward, this.badgeRewardItems);
      updateRewards(reward, this.titleRewardItems);
      updateRewards(reward, this.colorRewardItems);
      updateRewards(reward, this.borderRewardItems);
    }
  }
  /**
   * Populates the reward list with badge, banner, and title items.
   * This function is called in constructor and should not be called multiple times as it will fetch from remote server.
   */
  populateRewardList() {
    this.bannerRewardItems = [];
    this.badgeRewardItems = [];
    this.titleRewardItems = [];
    this.colorRewardItems = [];
    this.borderRewardItems = [];
    this.badgeRewardItems.push({
      gameItemId: "DEFAULT_BADGE_ID",
      dnaId: "NOT A DNA ITEM",
      url: "fs://game/ba_default",
      description: "",
      unlockCondition: Locale.compose("LOC_METAPROGRESSION_UNLOCK_CONDITION_DEFAULT"),
      isLocked: false
    });
    this.bannerRewardItems.push({
      gameItemId: "DEFAULT_BANNER_ID",
      dnaId: "NOT A DNA ITEM",
      url: "fs://game/bn_default",
      description: "",
      unlockCondition: Locale.compose("LOC_METAPROGRESSION_UNLOCK_CONDITION_DEFAULT"),
      isLocked: false
    });
    this.titleRewardItems.push({
      gameItemId: "DEFAULT_TITLE_ID",
      locKey: "LOC_DEFAULT_TITLE_ID_NAME",
      unlockCondition: Locale.compose("LOC_METAPROGRESSION_UNLOCK_CONDITION_DEFAULT"),
      isLocked: false
    });
    this.borderRewardItems.push({
      gameItemId: "DEFAULT_BORDER_ID",
      name: "LOC_DEFAULT_BORDER_ID_NAME",
      desc1: "LOC_BORDER_DESCRIPTION",
      desc2: "LOC_METAPROGRESSION_UNLOCK_CONDITION_DEFAULT",
      url: "fs://game/port_bor_01",
      id: "defborder",
      unlockCondition: Locale.compose("LOC_METAPROGRESSION_UNLOCK_CONDITION_DEFAULT"),
      new: false,
      isLocked: false
    });
    if (!Network.supportsSSO() && !Online.Metaprogression.supportsMemento()) {
      return;
    }
    const rewards = memoRewards();
    const allLiveEventRewards = getAllLiveEventRewardGameIDs();
    rewards.forEach((reward) => {
      reward.type = reward.type >>> 0;
      if (allLiveEventRewards.includes(reward.gameItemID) || reward.gameItemID.includes("_EVENT_")) {
        return;
      }
      switch (reward.type) {
        case 3801327255 /* Badge */:
          this.badgeRewardItems.push({
            gameItemId: reward.gameItemID,
            dnaId: reward.dnaItemID,
            url: "fs://game/" + reward.iconName,
            description: "",
            unlockCondition: reward.unlockCondition,
            isLocked: reward.isLocked
          });
          break;
        case 2340454002 /* Banner */:
          this.bannerRewardItems.push({
            gameItemId: reward.gameItemID,
            dnaId: reward.dnaItemID,
            url: "fs://game/" + reward.iconName,
            description: "",
            unlockCondition: reward.unlockCondition,
            isLocked: reward.isLocked
          });
          break;
        case 602451426 /* Border */:
          this.borderRewardItems.push({
            gameItemId: reward.gameItemID,
            url: "fs://game/" + reward.iconName,
            desc1: reward.description,
            desc2: "",
            isLocked: reward.isLocked,
            new: true,
            name: reward.name,
            id: reward.dnaItemID,
            unlockCondition: reward.unlockCondition
          });
          break;
        case 928356065 /* Title */:
          reward.locVariants.forEach((locKey) => {
            this.titleRewardItems.push({
              gameItemId: reward.gameItemID,
              locKey: locKey.locKey,
              unlockCondition: reward.unlockCondition,
              isLocked: reward.isLocked
            });
          });
          break;
        case 4287908646 /* Memento */:
          break;
        case 2050336355 /* Color */:
          this.colorRewardItems.push({
            gameItemId: reward.gameItemID,
            name: reward.gameItemID,
            color: reward.rgb,
            unlockCondition: reward.unlockCondition,
            isLocked: reward.isLocked,
            new: true
          });
          break;
        default:
          break;
      }
    });
  }
}
var UnlockableRewardItems = new RewardItems();
function getDefaultPlayerInfo() {
  const defaultPlayerProfile = {
    TitleLocKey: "LOC_DEFAULT_TITLE_ID_NAME",
    BadgeId: "DEFAULT_BADGE_ID",
    twoKName: "",
    twoKId: "",
    firstPartyName: Network.getLocal1PPlayerName(),
    firstPartyType: Network.getLocalHostingPlatform(),
    BannerId: "DEFAULT_BANNER_ID",
    LeaderLevel: 1,
    LeaderID: "",
    FoundationLevel: 1,
    PortraitBorder: "DEFAULT_BORDER_ID",
    BackgroundColor: "",
    BackgroundURL: "fs://game/bn_default",
    InfoIconURL: "fs://game/ba_default",
    Status: "",
    LastSeen: ""
  };
  const currentBadge = UnlockableRewardItems.getBadge(defaultPlayerProfile.BadgeId);
  const currentBackground = UnlockableRewardItems.getBanner(defaultPlayerProfile.BannerId);
  const currentBorder = UnlockableRewardItems.getBorder(defaultPlayerProfile.PortraitBorder);
  const currentBGColor = UnlockableRewardItems.getColor(defaultPlayerProfile.BackgroundColor);
  const playerInfo = {
    ...defaultPlayerProfile,
    BackgroundURL: currentBackground?.url,
    BadgeURL: currentBadge?.url,
    BorderURL: currentBorder?.url,
    BackgroundColor: currentBGColor?.color,
    playerTitle: Locale.compose(defaultPlayerProfile.TitleLocKey),
    FoundationLevel: defaultPlayerProfile.FoundationLevel
  };
  return playerInfo;
}
function getPlayerCardInfo(friendId, platformUsername, updateCache = false) {
  let cachedPlayerProfile = null;
  if (Network.supportsSSO() || Online.Metaprogression.supportsMemento()) {
    if (!friendId) {
      cachedPlayerProfile = memoMyPlayerProfile(updateCache);
    } else {
      cachedPlayerProfile = memoPlayerProfile(
        updateCache,
        friendId,
        platformUsername == void 0 ? "" : platformUsername
      );
    }
  }
  let titleLocKey = "";
  let badgeId = "";
  let bannerId = "";
  let portraitBorder = "";
  let foundationLevel = -1;
  let backgroundColor = "";
  if (cachedPlayerProfile) {
    titleLocKey = cachedPlayerProfile.TitleLocKey;
    badgeId = cachedPlayerProfile.BadgeId;
    bannerId = cachedPlayerProfile.BannerId;
    portraitBorder = cachedPlayerProfile.PortraitBorder;
    foundationLevel = cachedPlayerProfile.FoundationLevel;
    backgroundColor = cachedPlayerProfile.BackgroundColor;
  }
  const currentBadge = UnlockableRewardItems.getBadge(badgeId);
  const currentBackground = UnlockableRewardItems.getBanner(bannerId);
  const currentBorder = UnlockableRewardItems.getBorder(portraitBorder);
  const currentBGColor = UnlockableRewardItems.getColor(backgroundColor);
  const playerInfo = {
    ...cachedPlayerProfile,
    BackgroundURL: currentBackground?.url,
    BadgeURL: currentBadge?.url,
    BorderURL: currentBorder?.url,
    BackgroundColor: currentBGColor?.color,
    playerTitle: Locale.compose(titleLocKey),
    FoundationLevel: foundationLevel
  };
  if (!friendId) {
    playerInfo.firstPartyName = Network.getLocal1PPlayerName();
    playerInfo.firstPartyType = Network.getLocalHostingPlatform();
    if (Network.supportsSSO()) {
      playerInfo.twoKName = Online.UserProfile.getMyDisplayName();
    }
  }
  return playerInfo;
}
function updatePlayerProfile(updatedFields, updateCache = false) {
  let cachedPlayerProfile = memoMyPlayerProfile(updateCache);
  const firstPartyName = Network.getLocal1PPlayerName();
  const twoKName = Online.UserProfile.getMyDisplayName();
  const firstPartyType = Network.getLocalHostingPlatform();
  cachedPlayerProfile = {
    ...cachedPlayerProfile,
    ...updatedFields,
    firstPartyType,
    firstPartyName,
    twoKName
  };
  Online.UserProfile.updateUserProfile(cachedPlayerProfile);
  memoMyPlayerProfile(true);
  window.dispatchEvent(new Event("user-profile-updated"));
}
function forceCacheUpdate() {
  memoRewards(true);
}
function getRewardType(gameItemID) {
  const rewards = memoRewards();
  const rewardType = rewards.find((reward) => reward.gameItemID === gameItemID)?.type;
  return rewardType;
}
function getAllLiveEventRewardGameIDs() {
  const allRewardItems = [];
  const configRewards = Database.query("config", "select * from LiveEventRewards");
  if (configRewards) {
    for (const r of configRewards) {
      allRewardItems.push(r.Reward);
    }
  }
  return allRewardItems;
}
function parseLegalDocument(textField, inputString) {
  let contentString = "";
  let go = true;
  let startIndex = 0;
  const titleDiv = '<div class="font-title text-xl break-words" style="margin-top: 0.25rem">';
  const subTitleDiv = '<div class="font-title text-lg break-words" style="margin-top: 0.25rem">';
  const bodyDiv = '<div class="font-body text-base break-words" style="margin-top: 0.125rem">';
  let original = "";
  while (go) {
    const sonyIndex = inputString.indexOf("Sony", startIndex);
    const psIndex = inputString.indexOf("PlayStation", startIndex);
    const nextIndex = sonyIndex < psIndex && sonyIndex != -1 ? sonyIndex : psIndex;
    const sliceStart = startIndex == 0 ? 0 : startIndex - 1;
    if (nextIndex > 0) {
      const tempString = inputString.slice(sliceStart, nextIndex);
      original = original + tempString + "\n";
      startIndex = nextIndex + 1;
    } else {
      original = original + inputString.slice(sliceStart) + "\n";
      go = false;
    }
  }
  go = true;
  startIndex = 0;
  while (go) {
    const nextIndex = original.indexOf("\n", startIndex);
    if (nextIndex != -1) {
      let tempString = original.slice(startIndex, nextIndex);
      const sectionIndex = tempString.indexOf("****.");
      if (sectionIndex != -1) {
        contentString = contentString + subTitleDiv + tempString.slice(0, sectionIndex) + "</div>";
      } else {
        if (tempString[0] == ">" && tempString[1] == " ") {
          tempString = original.slice(startIndex + 2, nextIndex);
        }
        const section2Index = tempString.indexOf("---");
        if (section2Index == 0) {
          contentString = contentString + titleDiv + tempString.slice(3) + "</div>";
        } else {
          if (tempString.toLocaleUpperCase() == tempString) {
            contentString = contentString + titleDiv + tempString + "</div>";
          } else {
            contentString = contentString + bodyDiv + tempString + "</div>";
          }
        }
      }
      startIndex = nextIndex + 1;
    } else {
      go = false;
    }
  }
  textField.innerHTML = contentString;
}

export { UnlockableRewardItems, UnlockableRewardType, authListener, forceCacheUpdate, getAllLiveEventRewardGameIDs, getDefaultPlayerInfo, getPlayerCardInfo, getRewardType, parseLegalDocument, updatePlayerProfile };
//# sourceMappingURL=utilities-liveops.js.map
