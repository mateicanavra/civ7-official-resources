class GameCreationPromoManagerImpl {
  promosRetrievalCompleteListener = (data) => {
    this.updateContentPacks(data);
  };
  contentPackLookup = /* @__PURE__ */ new Map();
  pendingResolves = [];
  constructor() {
    engine.on("PromosRetrievalCompleted", this.promosRetrievalCompleteListener);
  }
  refreshPromos() {
    Online.Promo.getPromosForPlacement("2kstore");
  }
  cancelResolves() {
    for (const pendingResolve of this.pendingResolves) {
      pendingResolve.reject();
    }
    this.pendingResolves.length = 0;
  }
  getContentPackTitleFor(contentType) {
    if (this.contentPackLookup.size > 0) {
      const value = this.contentPackLookup.get(contentType);
      return new Promise((resolve) => resolve(value));
    }
    return new Promise((resolve, reject) => this.pendingResolves.push({ contentType, resolve, reject }));
  }
  updateContentPacks(data) {
    if (data.placement != "2kstore") {
      return;
    }
    if (!data.fullRefresh) {
      return;
    }
    for (const promo of data.promos) {
      try {
        const metadata = JSON.parse(promo.metadata);
        const content = metadata.content ?? [];
        for (const contentId of content) {
          this.contentPackLookup.set(contentId, promo.localizedTitle);
        }
      } catch (ex) {
        console.error("game-creation-promo-manager: Unable to parse promo metadata - ", ex);
      }
    }
    for (const pendingResolve of this.pendingResolves) {
      const value = this.contentPackLookup.get(pendingResolve.contentType);
      pendingResolve.resolve(value);
    }
    this.pendingResolves.length = 0;
  }
}
const GameCreationPromoManager = new GameCreationPromoManagerImpl();

export { GameCreationPromoManager as G };
//# sourceMappingURL=game-creation-promo-manager.chunk.js.map
