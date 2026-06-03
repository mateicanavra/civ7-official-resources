import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  scaleFactor: {
    label: "Scale Factor %",
    description: "The distance from the region seed as a percentage of map width that represents a score of 0.5. Any cell nearer to the region seed will score between 0.5 and 1.0, and any cell farther away will score between 0.0 and 0.5",
    default: 20,
    min: 0,
    max: 100,
    step: 0.1
  },
  invert: {
    label: "Invert",
    description: "Invert the calculation to prefer tile further away from the region seed.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class RuleNearRegionSeed extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleNearRegionSeed.getName();
  description = "This rule scores cells nearer to the region seed higher than cells farther away.";
  static getName() {
    return "Near Region Seed";
  }
  static getSchema() {
    return ruleSchema;
  }
  score(regionCell, ctx) {
    let distanceToSeed = VoronoiUtils.sqDistance(
      { x: ctx.region.seedLocation.x, y: ctx.region.seedLocation.y },
      { x: regionCell.cell.site.x, y: regionCell.cell.site.y },
      ctx.wrap
    );
    distanceToSeed = Math.sqrt(distanceToSeed);
    let scaleFactor = this.configValues.scaleFactor * 0.01 * ctx.m_worldDims.x;
    scaleFactor *= 0.5;
    let score = distanceToSeed / (distanceToSeed + scaleFactor);
    if (!this.configValues.invert) {
      score = 1 - score;
    }
    return score;
  }
}

export { RuleNearRegionSeed };
//# sourceMappingURL=near-region-seed.js.map
