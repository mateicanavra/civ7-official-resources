var SocialNotificationIndicatorType = /* @__PURE__ */ ((SocialNotificationIndicatorType2) => {
  SocialNotificationIndicatorType2[SocialNotificationIndicatorType2["MAINMENU_BADGE"] = 0] = "MAINMENU_BADGE";
  SocialNotificationIndicatorType2[SocialNotificationIndicatorType2["SOCIALTAB_BADGE"] = 1] = "SOCIALTAB_BADGE";
  SocialNotificationIndicatorType2[SocialNotificationIndicatorType2["ALL_INDICATORS"] = 2] = "ALL_INDICATORS";
  return SocialNotificationIndicatorType2;
})(SocialNotificationIndicatorType || {});
var SocialNotificationIndicatorReminderType = /* @__PURE__ */ ((SocialNotificationIndicatorReminderType2) => {
  SocialNotificationIndicatorReminderType2[SocialNotificationIndicatorReminderType2["REMIND_NONE"] = 0] = "REMIND_NONE";
  SocialNotificationIndicatorReminderType2[SocialNotificationIndicatorReminderType2["REMIND_VISIBLE"] = 1] = "REMIND_VISIBLE";
  SocialNotificationIndicatorReminderType2[SocialNotificationIndicatorReminderType2["REMIND_INVISIBLE"] = 2] = "REMIND_INVISIBLE";
  return SocialNotificationIndicatorReminderType2;
})(SocialNotificationIndicatorReminderType || {});
class SocialNotificationsManagerSingleton {
  static signletonInstance;
  mainMenuNotificationBadge;
  socialPanelNotificationBadge;
  remindVisibility = 0 /* REMIND_NONE */;
  socialOnFriendRequestReceivedListener = this.socialOnFriendRequestReceived.bind(this);
  socialOnFriendRequestSentListener = this.socialOnFriendRequestSent.bind(this);
  socialOnOnlineSaveDataLoadedListener = this.socialOnOnlineSaveDataLoaded.bind(this);
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!SocialNotificationsManagerSingleton.signletonInstance) {
      SocialNotificationsManagerSingleton.signletonInstance = new SocialNotificationsManagerSingleton();
    }
    return SocialNotificationsManagerSingleton.signletonInstance;
  }
  constructor() {
    engine.on("SocialOnFriendRequestReceived", this.socialOnFriendRequestReceivedListener);
    engine.on("SocialOnFriendRequestSent", this.socialOnFriendRequestSentListener);
    engine.on("SocialOnOnlineSaveDataLoaded", this.socialOnOnlineSaveDataLoadedListener);
  }
  setNotificationItem(indicatorType, indicator) {
    switch (indicatorType) {
      case 0 /* MAINMENU_BADGE */:
        this.mainMenuNotificationBadge = indicator;
        break;
      case 1 /* SOCIALTAB_BADGE */:
        this.socialPanelNotificationBadge = indicator;
        break;
    }
  }
  setTabNotificationVisibilityBasedOnReminder() {
    switch (this.remindVisibility) {
      case 0 /* REMIND_NONE */:
        this.setNotificationVisibility(1 /* SOCIALTAB_BADGE */, false);
        break;
      case 1 /* REMIND_VISIBLE */:
        this.setNotificationVisibility(1 /* SOCIALTAB_BADGE */, true);
        break;
      case 2 /* REMIND_INVISIBLE */:
        this.setNotificationVisibility(1 /* SOCIALTAB_BADGE */, false);
        break;
    }
    this.remindVisibility = 0 /* REMIND_NONE */;
  }
  setNotificationVisibility(indicatorType, visibile) {
    if (visibile) {
      switch (indicatorType) {
        case 0 /* MAINMENU_BADGE */:
          this.mainMenuNotificationBadge?.classList.remove("hidden");
          break;
        case 1 /* SOCIALTAB_BADGE */:
          this.socialPanelNotificationBadge?.classList.remove("hidden");
          break;
        case 2 /* ALL_INDICATORS */:
          this.setNotificationTypeAll(visibile);
          break;
      }
    } else {
      switch (indicatorType) {
        case 0 /* MAINMENU_BADGE */:
          this.mainMenuNotificationBadge?.classList.add("hidden");
          break;
        case 1 /* SOCIALTAB_BADGE */:
          this.socialPanelNotificationBadge?.classList.add("hidden");
          break;
        case 2 /* ALL_INDICATORS */:
          this.setNotificationTypeAll(visibile);
          break;
      }
    }
  }
  setNotificationTypeAll(visibile) {
    const wasTabVisible = this.isNotificationVisible(1 /* SOCIALTAB_BADGE */);
    if (visibile) {
      this.mainMenuNotificationBadge?.classList.remove("hidden");
      if (this.socialPanelNotificationBadge) {
        this.socialPanelNotificationBadge?.classList.remove("hidden");
        this.remindVisibility = 0 /* REMIND_NONE */;
      } else {
        this.remindVisibility = 1 /* REMIND_VISIBLE */;
      }
    } else {
      this.mainMenuNotificationBadge?.classList.add("hidden");
      if (this.socialPanelNotificationBadge) {
        this.socialPanelNotificationBadge?.classList.add("hidden");
        this.remindVisibility = 0 /* REMIND_NONE */;
      } else {
        this.remindVisibility = 2 /* REMIND_INVISIBLE */;
      }
      if (wasTabVisible && !visibile) {
        Online.Social.setReadSocialNotifications();
      }
    }
  }
  isNotificationVisible(indicatorType) {
    switch (indicatorType) {
      case 0 /* MAINMENU_BADGE */:
        return this.mainMenuNotificationBadge?.classList.contains("hidden") ? false : true;
      case 1 /* SOCIALTAB_BADGE */:
        return this.socialPanelNotificationBadge?.classList.contains("hidden") ? false : true;
    }
    return false;
  }
  socialOnFriendRequestReceived() {
    this.setNotificationVisibility(2 /* ALL_INDICATORS */, true);
  }
  // For future reference on updating list based on callback instead update polling
  socialOnFriendRequestSent() {
  }
  socialOnOnlineSaveDataLoaded() {
  }
}
const SocialNotificationsManager = SocialNotificationsManagerSingleton.getInstance();

export { SocialNotificationIndicatorType, SocialNotificationsManager as default };
//# sourceMappingURL=social-notifications-manager.js.map
