class FullTextSearch {
  constructor(context) {
    this.context = context;
    if (!Search.createContext(context, "[", "]")) {
      Search.clearData(context);
    }
  }
  curKey = 0;
  find(query) {
    const results = Search.search(this.context, query, 32).map((r) => r.type);
    return new Set(results);
  }
  addSearchData(data) {
    Search.beginAddingData();
    for (const item of data) {
      Search.addData(this.context, item.key, item.title, item.fullText, []);
    }
    Search.finishedAddingData();
    Search.optimize(this.context);
  }
}

export { FullTextSearch };
//# sourceMappingURL=search-utils.js.map
