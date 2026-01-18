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
  onRewardReceived(data) {
    if (data) {
      this.setNotificationVisibility(data.keys.length > 0);
    }
  }
}
const RewardsNotificationsManager = RewardsNotificationsManagerSingleton.getInstance();

export { RewardsNotificationsManager as R };
//# sourceMappingURL=rewards-notification-manager.chunk.js.map
