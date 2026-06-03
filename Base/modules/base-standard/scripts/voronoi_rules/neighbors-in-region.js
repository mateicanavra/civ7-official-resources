import { Rule } from './rules-base.js';

const ruleSchema = {
  preferredNeighborCount: {
    label: "Preferred Neighbor Count",
    description: "The normal distribution used for scoring is centered on this value. Any cells with exactly this number of neighbors will score 1, everything else will be less than that.",
    default: 3,
    min: 0,
    max: 10,
    step: 0.1
  },
  deviation: {
    label: "Preferred Neighbors Deviation",
    description: "The standard deviation for the normal distribution. Higher values will score number near the preferred count higher.",
    default: 1,
    min: 0,
    max: 5,
    step: 0.1
  }
};
class RuleNeighborsInRegion extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleNeighborsInRegion.getName();
  description = "Scores cells based on how many of their neighbors are already in the region";
  static getName() {
    return "Neighbors In Region";
  }
  static getSchema() {
    return ruleSchema;
  }
  // Can be replaced with custom logic.
  inRegionCheck = (ctx, _thisCell, neighborCell) => {
    return ctx.region.getRegionIdForCell(neighborCell) === ctx.region.id;
  };
  score(regionCell, ctx) {
    let neighborCount = 0;
    for (const neighborId of regionCell.cell.getNeighborIds()) {
      const neighbor = ctx.cells[neighborId];
      if (this.inRegionCheck(ctx, regionCell, neighbor)) {
        neighborCount++;
      }
    }
    const x = neighborCount;
    const d = this.configValues.deviation;
    const m = this.configValues.preferredNeighborCount;
    const zScore = (x - m) / d;
    const score = Math.exp(-0.5 * zScore * zScore);
    return score;
  }
}

export { RuleNeighborsInRegion };
//# sourceMappingURL=neighbors-in-region.js.map
