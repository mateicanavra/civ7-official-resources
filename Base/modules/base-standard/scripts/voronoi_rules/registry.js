import { RuleAvoidEdge } from './avoid-edge.js';
import { RuleAvoidOtherRegions } from './avoid-other-regions.js';
import { RuleCellArea } from './cell-area.js';
import { RuleCoastalExposure } from './coastal-exposure.js';
import { RuleNearMapCenter } from './near-map-center.js';
import { RuleNearNeighbor } from './near-neighbor.js';
import { RuleNearOtherRegion } from './near-other-region.js';
import { RuleNearPlateBoundary } from './near-plate-boundary.js';
import { RuleNearRegionSeed } from './near-region-seed.js';
import { RuleNeighborsInRegion } from './neighbors-in-region.js';
import { RulePreferLatitude } from './prefer-latitude.js';

const ruleRegistry = {
  [RuleAvoidEdge.getName()]: [RuleAvoidEdge, RuleAvoidEdge.getSchema()],
  [RuleAvoidOtherRegions.getName()]: [RuleAvoidOtherRegions, RuleAvoidOtherRegions.getSchema()],
  [RuleCellArea.getName()]: [RuleCellArea, RuleCellArea.getSchema()],
  [RuleNearMapCenter.getName()]: [RuleNearMapCenter, RuleNearMapCenter.getSchema()],
  [RuleNearNeighbor.getName()]: [RuleNearNeighbor, RuleNearNeighbor.getSchema()],
  [RuleNearOtherRegion.getName()]: [RuleNearOtherRegion, RuleNearOtherRegion.getSchema()],
  [RuleNearPlateBoundary.getName()]: [RuleNearPlateBoundary, RuleNearPlateBoundary.getSchema()],
  [RuleNearRegionSeed.getName()]: [RuleNearRegionSeed, RuleNearRegionSeed.getSchema()],
  [RuleNeighborsInRegion.getName()]: [RuleNeighborsInRegion, RuleNeighborsInRegion.getSchema()],
  [RulePreferLatitude.getName()]: [RulePreferLatitude, RulePreferLatitude.getSchema()],
  [RuleCoastalExposure.getName()]: [RuleCoastalExposure, RuleCoastalExposure.getSchema()]
};
function RegisterRule(name, ctor, schema) {
  ruleRegistry[name] = [ctor, schema];
}
function ConstructRule(name) {
  if (!(name in ruleRegistry)) throw new Error(`Cannot find rule ${name} in rule registry.`);
  return new ruleRegistry[name][0]();
}
function GetRuleSpec(name) {
  if (!(name in ruleRegistry)) throw new Error(`Cannot find rule ${name} in rule registry.`);
  return ruleRegistry[name][1];
}

export { ConstructRule, GetRuleSpec, RegisterRule };
//# sourceMappingURL=registry.js.map
