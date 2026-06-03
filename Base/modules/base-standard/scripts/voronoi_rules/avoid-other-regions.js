import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  minDistance: {
    label: "Minimum Separation",
    description: "Cells within this many hexes of another region are excluded.",
    default: 4,
    min: 0,
    max: 10,
    step: 0.1
  },
  distanceFalloff: {
    label: "Distance Falloff",
    description: "The distance from other regions beyond the minimum at which scores will start to be reduced, gently pushing new cells away from other regions.",
    default: 4,
    min: 0,
    max: 10,
    step: 0.1
  },
  falloffCurve: {
    label: "Falloff Curve",
    description: "The power (or steepness) of the curve of the falloff. 1 is linear from the start of the falloff until the margin. Higher values will push cells away from the edges sooner, lower values will reduce the scores more slowly until near the margin.",
    default: 0.25,
    min: 0,
    max: 1,
    step: 0.05
  }
};
class RuleAvoidOtherRegions extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleAvoidOtherRegions.getName();
  description = "This rule is used to avoid other regions within some radius. Cells that are too close will be forcibly disqualified, and scores will be tapered as they get close to this minimum distance. By default any region not in the source region is filtered, but at the code level filters can be added to avoid only specific region types or region ids.";
  quadtree;
  m_filter = (ctx, item) => {
    const regionId = ctx.region.getRegionIdForCell(item);
    return regionId != ctx.region.id && regionId != 0;
  };
  static getName() {
    return "Avoid Other Regions";
  }
  static getSchema() {
    return ruleSchema;
  }
  setFilter(filter) {
    this.m_filter = filter;
  }
  score(regionCell, ctx) {
    const minDistance = this.configValues.minDistance;
    const minDistanceSq = minDistance * minDistance;
    const maxDistance = minDistance + this.configValues.distanceFalloff;
    const maxDistanceSq = maxDistance * maxDistance;
    let closestDistSq = maxDistanceSq;
    const filter = (item) => this.m_filter(ctx, item);
    if (this.quadtree) {
      const nearest = this.quadtree.nearest(regionCell.cell.site, filter, maxDistanceSq);
      if (nearest.cell) {
        closestDistSq = nearest.distSq;
      }
    } else {
      regionCell.ruleConsideration = true;
      const considerList = [regionCell.id];
      const clearList = [regionCell];
      while (considerList.length > 0) {
        const cellId = considerList.pop();
        const cell = ctx.cells[cellId];
        const distanceSq = VoronoiUtils.sqDistanceBetweenSites(
          regionCell.cell.site,
          cell.cell.site,
          ctx.wrap
        );
        if (distanceSq < closestDistSq) {
          if (filter(cell)) {
            closestDistSq = Math.min(distanceSq, closestDistSq);
            if (closestDistSq < minDistanceSq) {
              break;
            }
          } else {
            for (const neighborId of cell.cell.getNeighborIds()) {
              const neighbor = ctx.cells[neighborId];
              if (!neighbor.ruleConsideration) {
                neighbor.ruleConsideration = true;
                clearList.push(neighbor);
                considerList.push(neighborId);
              }
            }
          }
        }
      }
      for (const cell of clearList) {
        cell.ruleConsideration = false;
      }
    }
    if (closestDistSq < minDistanceSq) {
      return -100;
    }
    const closestDist = Math.sqrt(closestDistSq);
    let score = VoronoiUtils.clamp(VoronoiUtils.iLerp(minDistance, maxDistance, closestDist), 0, 1);
    score = Math.pow(score, this.configValues.falloffCurve);
    return score;
  }
  setQuadTree(quadtree) {
    this.quadtree = quadtree;
  }
}

export { RuleAvoidOtherRegions };
//# sourceMappingURL=avoid-other-regions.js.map
