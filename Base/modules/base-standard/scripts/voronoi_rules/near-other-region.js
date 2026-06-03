import { Site } from '../../../core/scripts/external/TypeScript-Voronoi-master/src/site.js';
import { VoronoiUtils, WrapType } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  disableDistance: {
    label: "Disable Distance",
    description: "The distance from another continent at which to avoid growing towards it.",
    default: 1,
    min: 0,
    max: 5,
    step: 0.1
  },
  scoreDistance: {
    label: "Score Distance",
    description: "The distance from another continent at which to start scoring it. Distances greater than this will score 0. Higher values are more expensive.",
    default: 10,
    min: 0,
    max: 30,
    step: 0.1
  }
};
class RuleNearOtherRegion extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleNearOtherRegion.getName();
  description = "Scores cells near other regions higher than ones further away.";
  regionConnection = /* @__PURE__ */ new Map();
  regionConnectionLive = /* @__PURE__ */ new Map();
  quadtree;
  static getName() {
    return "Near Other Region";
  }
  static getSchema() {
    return ruleSchema;
  }
  prepare() {
    this.regionConnectionLive.clear();
    for (const [key, value] of this.regionConnection) {
      this.regionConnectionLive.set(key, [...value]);
    }
  }
  score(regionCell, ctx) {
    let score = 0;
    const arr = this.regionConnectionLive.get(ctx.region.id);
    if (!arr || !this.quadtree) return 0;
    const pos = { x: regionCell.cell.site.x, y: regionCell.cell.site.y };
    const maxDist = this.configValues.scoreDistance;
    for (let i = arr.length - 1; i >= 0; i--) {
      const regionIdPos = arr[i];
      const nearestNeighbor = this.quadtree.nearest(
        pos,
        (quadCell) => quadCell.landmassId == regionIdPos.regionId,
        maxDist
      );
      if (!nearestNeighbor.cell) continue;
      const dist = Math.sqrt(nearestNeighbor.distSq);
      if (dist < this.configValues.disableDistance) {
        arr.splice(i, 1);
        if (arr.length == 0) {
          this.regionConnectionLive.delete(ctx.region.id);
        }
      }
      const distScore = VoronoiUtils.clamp(Math.pow((maxDist - dist) / maxDist, 2), 0, 1);
      score = Math.max(distScore, score);
    }
    return score;
  }
  // Builds bi-directional connections between each region and it's neighbors in a Delaunay triangulation of the regions.
  buildFromDelaunayTriangulation(regions, bounds, wrap = WrapType.None) {
    this.regionConnection.clear();
    class RegionSite extends Site {
      regionIdPos = { regionId: 0, pos: { x: 0, y: 0 } };
    }
    const sites = regions.map((value) => {
      return { x: value.pos.x, y: value.pos.y, id: 0, regionIdPos: value };
    });
    const diagram = VoronoiUtils.computeVoronoi(sites, bounds, 0, wrap);
    for (const cell of diagram.cells) {
      for (const neighborId of cell.getNeighborIds()) {
        const neighbor = diagram.cells[neighborId];
        this.addRegionConnection(
          cell.site.regionIdPos.regionId,
          neighbor.site.regionIdPos
        );
      }
    }
  }
  // Causes region 'from' to grow towards region 'to'. Not bi-directional.
  addRegionConnection(from, to) {
    if (!this.regionConnection.has(from)) {
      this.regionConnection.set(from, []);
    }
    const tos = this.regionConnection.get(from);
    if (!tos.find((value) => {
      if (value.regionId == to.regionId) return value;
    })) {
      tos.push(to);
    }
  }
  setQuadTree(quadtree) {
    this.quadtree = quadtree;
  }
}

export { RuleNearOtherRegion };
//# sourceMappingURL=near-other-region.js.map
