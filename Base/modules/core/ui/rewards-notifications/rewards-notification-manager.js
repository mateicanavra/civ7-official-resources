class RewardsNotificationsManagerSingleton {
  static singletonInstance;
  rewardsNotificationIndicator;
  rewardsIndicatorIsSet = false;
  rewardReceivedListener = (data) => {
    this.onRewardReceived(data);
  };
  static getInstance() {
    if (!RewardsNotificationsManagerSingleton.singletonInstance) {
      RewardsNotificationsManagerSingleton.singletonInstance = new RewardsNotificationsManagerSingleton();
    }
    return RewardsNotificationsManagerSingleton.singletonInstance;
  }
  constructor() {
    engine.on("EntitlementsUpdated", this.rewardReceivedListener);
  }
  setNotificationItem(indicator) {
    this.rewardsNotificationIndicator = indicator;
    this.rewardsIndicatorIsSet = true;
  }
  setNotificationVisibility(isVisible) {
    if (this.rewardsIndicatorIsSet) {
      if (isVisible) {
        this.rewardsNotificationIndicator.classList.remove("hidden");
      } else {
        this.rewardsNotificationIndicator.classList.add("hidden");
      }
    }
  }
  isNotificationVisible() {
    return this.rewardsIndicatorIsSet ? this.rewardsNotificationIndicator.classList.contains("hidden") : false;
  }
  allNewRewardsAreHidden() {
    const allRewards = Online.UserProfile.getRewardEntries();
    const newItems = Online.UserProfile.getNewlyUnlockedItems();
    let newRewardsCount = 0;
    let hiddenRewardsCount = 0;
    let allRewardsAreHidden = false;
    newItems.forEach((dnaItemID) => {
      const item = allRewards.find((r) => r.dnaItemID === dnaItemID);
      if (item) {
        ++newRewardsCount;
        if (item.disableNotification) {
          ++hiddenRewardsCount;
        }
      }
    });
    allRewardsAreHidden = hiddenRewardsCount === newRewardsCount;
    if (allRewardsAreHidden) {
      Online.UserProfile.clearNewlyUnlockedItems();
    }
    return allRewardsAreHidden;
  }
  onRewardReceived(data) {
    if (data) {
      this.setNotificationVisibility(data.keys.length > 0 && !this.allNewRewardsAreHidden());
    }
  }
}
const RewardsNotificationsManager = RewardsNotificationsManagerSingleton.getInstance();

export { RewardsNotificationsManager as default };
//# sourceMappingURL=rewards-notification-manager.js.map
