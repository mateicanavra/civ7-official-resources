import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  scaleFactor: {
    label: "Scale Factor",
    description: "The distance from a plate boundary that represents a score of 0.5. Any cell nearer to a plate boundary will score between 0.5 and 1.0, and any cell farther away will score between 0.0 and 0.5",
    default: 4,
    min: 0,
    max: 10,
    step: 0.1
  },
  directionInfluence: {
    label: "Plate Direction Influence",
    description: "How much the direction of plate movement relative to the neighboring plate influences the score.",
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.05
  },
  invert: {
    label: "Invert",
    description: "Invert the calculation, scoring cells farther from plate boundaries higher.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class RuleNearPlateBoundary extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleNearPlateBoundary.getName();
  description = "Scores cells based on the distance from their site to the nearest plate boundary.";
  // This must be provided before the rule can run.
  m_plateBoundaries;
  static getName() {
    return "Near Plate Boundary";
  }
  static getSchema() {
    return ruleSchema;
  }
  init(plateBoundaries) {
    this.m_plateBoundaries = plateBoundaries;
  }
  prepare() {
    if (this.m_plateBoundaries == void 0)
      throw new Error("RuleNearPlateBoundary must be initialized with a kd tree of plate boundaries.");
  }
  score(regionCell, _ctx) {
    const cellPos = { x: regionCell.cell.site.x, y: regionCell.cell.site.y };
    const boundaries = this.m_plateBoundaries.searchMultiple(cellPos, 4);
    const distances = boundaries.map((value) => Math.sqrt(value.distSq));
    const scaled = distances.map((v) => -2 * v);
    const max = Math.max(...scaled);
    let sum = 0;
    const exps = scaled.map((v) => {
      const e = Math.exp(v - max);
      sum += e;
      return e;
    });
    const inv = 1 / sum;
    const weights = exps.map((e) => e * inv);
    const weightedDistance = distances.reduce((acc, v, i) => acc + v * weights[i]);
    const weightedSubduction = boundaries.reduce((acc, v, i) => acc + v.data.plateSubduction * weights[i], 0);
    const dirInfluenceOffset = this.configValues.directionInfluence * 0.5;
    const distanceScore = dirInfluenceOffset + (1 - dirInfluenceOffset) * (1 - weightedDistance / (weightedDistance + this.configValues.scaleFactor));
    const plateMovementScore = distanceScore * (0.5 + weightedSubduction * 0.5);
    const score = VoronoiUtils.clamp(
      VoronoiUtils.lerp(distanceScore, plateMovementScore, this.configValues.directionInfluence),
      0,
      1
    );
    return this.configValues.invert ? 1 - score : score;
  }
}

export { RuleNearPlateBoundary };
//# sourceMappingURL=near-plate-boundary.js.map
