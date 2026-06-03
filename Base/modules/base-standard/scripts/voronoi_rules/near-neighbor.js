import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  scaleFactor: {
    label: "Mid Point",
    description: "The distance from a neighboring cell that represents a score of 0.5. Any distance smaller will score between 0.5 and 1.0, and any distance larger will score between 0.0 and 0.5",
    default: 1,
    min: 0,
    max: 5,
    step: 0.1
  },
  min: {
    label: "Min",
    description: "Values at or lower than this are scored 0.",
    default: 0,
    min: 0,
    max: 10,
    step: 0.1
  },
  max: {
    label: "Max",
    description: "Values at or higher than this are scored 1.",
    default: 10,
    min: 0,
    max: 10,
    step: 0.1
  },
  invert: {
    label: "Invert",
    description: "Invert the calculation to score farther cells higher.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class RuleNearNeighbor extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleNearNeighbor.getName();
  description = "This is a simple rule that scores nearby cells higher than cells farther away. This is primary used to add some random variation to the score.";
  m_diff = 1;
  m_invBias = 1;
  static getName() {
    return "Near Neighbor";
  }
  static getSchema() {
    return ruleSchema;
  }
  prepare() {
    this.m_diff = this.configValues.max - this.configValues.min;
    const mid = VoronoiUtils.clamp(this.configValues.scaleFactor, this.configValues.min, this.configValues.max);
    this.m_invBias = 1 / (1 - (mid - this.configValues.min) / this.m_diff);
  }
  score(regionCell, ctx) {
    let minNeighborDistance = Infinity;
    for (const neighborId of regionCell.cell.getNeighborIds()) {
      const neighbor = ctx.cells[neighborId];
      if (ctx.region.getRegionIdForCell(neighbor) == ctx.region.id) {
        const neighborDistance = VoronoiUtils.distanceBetweenSites(
          regionCell.cell.site,
          neighbor.cell.site,
          ctx.wrap
        );
        minNeighborDistance = Math.min(minNeighborDistance, neighborDistance);
      }
    }
    const score = VoronoiUtils.clamp((minNeighborDistance - this.configValues.min) / this.m_diff, 0, 1);
    const scoreBiased = VoronoiUtils.schlickInvBias(score, this.m_invBias);
    return this.configValues.invert > 0 ? 1 - scoreBiased : scoreBiased;
  }
}

export { RuleNearNeighbor };
//# sourceMappingURL=near-neighbor.js.map
