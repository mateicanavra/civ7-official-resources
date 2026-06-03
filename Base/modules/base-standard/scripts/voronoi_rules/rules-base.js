class Rule {
  description;
  isActive = false;
  weight = 1;
  notifySelectedCell(_cell, _ctx) {
  }
  initialize(config) {
    this.isActive = config.isActive;
    this.weight = config.weight;
    if (config.config) {
      for (const [recordName, recordValue] of Object.entries(config.config)) {
        if (recordName in this.configValues) {
          this.configValues[recordName] = recordValue;
        }
      }
    }
  }
  static createDefaultsFromSpecs(specs) {
    const result = {};
    for (const key in specs) {
      if (!Object.prototype.hasOwnProperty.call(specs, key)) continue;
      const node = specs[key];
      if ("children" in node) {
        result[key] = [];
      } else {
        result[key] = node.default;
      }
    }
    return result;
  }
  prepare() {
  }
  // Optionally overridden
  scoreAllCells(filter, ctx, regionIdGetter, weight = this.weight) {
    this.prepare();
    for (const cell of ctx.cells) {
      if (filter(cell)) {
        ctx.region = regionIdGetter(cell);
        cell.currentScore += this.score(cell, ctx) * weight;
      }
    }
  }
  scoreCells(cells, ctx, regionIdGetter, weight = this.weight) {
    this.prepare();
    for (const cell of cells) {
      ctx.region = regionIdGetter(cell);
      cell.currentScore += this.score(cell, ctx) * weight;
    }
  }
}

export { Rule };
//# sourceMappingURL=rules-base.js.map
