import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  scaleFactor: {
    label: "Mid Point",
    description: "The cell area that represents a score of 0.5. Any cell smaller will score between 0 and 0.5, and any cell larger will score between 0.5 and 1.0",
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
    description: "Invert the calculation to score smaller cells higher.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class RuleCellArea extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleCellArea.getName();
  description = "This is a simple rule that scores larger cells higher than smaller cells. This is primary used to add some random variation to the score.";
  m_diff = 1;
  m_invBias = 1;
  static getName() {
    return "Cell Area";
  }
  static getSchema() {
    return ruleSchema;
  }
  prepare() {
    this.m_diff = this.configValues.max - this.configValues.min;
    const mid = VoronoiUtils.clamp(this.configValues.scaleFactor, this.configValues.min, this.configValues.max);
    this.m_invBias = 1 / (1 - (mid - this.configValues.min) / this.m_diff);
  }
  score(cell, _ctx) {
    const cellArea = VoronoiUtils.calculateCellArea(cell.cell);
    const score = VoronoiUtils.clamp((cellArea - this.configValues.min) / this.m_diff, 0, 1);
    const scoreBiased = VoronoiUtils.schlickInvBias(score, this.m_invBias);
    return this.configValues.invert > 0 ? 1 - scoreBiased : scoreBiased;
  }
}

export { RuleCellArea };
//# sourceMappingURL=cell-area.js.map
