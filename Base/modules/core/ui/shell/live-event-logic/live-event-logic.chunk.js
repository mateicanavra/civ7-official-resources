class LiveEventManagerSingleton {
  static _Instance;
  skipAgeSelect() {
    if (!Network.supportsSSO()) {
      return false;
    }
    const keys = Online.LiveEvent.getLiveEventConfigKeys();
    return keys.some((key) => key === "StartAge");
  }
  restrictToPreferredCivs() {
    if (Network.supportsSSO()) {
      const keys = Online.LiveEvent.getLiveEventConfigKeys();
      if (keys.some((key) => key === "EventFilterType")) {
        return Configuration.getGame().getValue("EventFilterType") == Database.makeHash("RESTRICTED_LEADER_CIVS");
      }
    }
    return false;
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!LiveEventManagerSingleton._Instance) {
      LiveEventManagerSingleton._Instance = new LiveEventManagerSingleton();
    }
    return LiveEventManagerSingleton._Instance;
  }
}
const LiveEventManager = LiveEventManagerSingleton.getInstance();

export { LiveEventManager as L };
//# sourceMappingURL=live-event-logic.chunk.js.map
