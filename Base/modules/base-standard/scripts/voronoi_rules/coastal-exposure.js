import { norm2, equal2, sub2, length2, add2, div2, dot2 } from '../../../core/scripts/MathHelpers.js';
import { TerrainType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import { Rule } from './rules-base.js';

const ruleSchema = {
  exposureFactor: {
    label: "Exposure Factor",
    description: "The amount the exposure of the coastline (ie, how surrounded by water it is) effects its score.",
    default: 0.5,
    min: -1,
    max: 1,
    step: 0.01
  },
  alignment: {
    label: "Preferred Alignment",
    description: "Which coastline orientation scores highest relative to the vector field. -1 favors windward-facing coasts, +1 favors leeward coasts, 0 favors coasts parallel to the wind.",
    default: -1,
    min: -1,
    max: 1,
    step: 0.01
  },
  tolerance: {
    label: "Alignment width",
    description: "How tolerant the rule is to deviation from the preferred alignment. Smaller values score only near-perfect matches; larger values score a wider range of orientations.",
    default: 1,
    min: 0,
    max: 2,
    step: 0.01
  },
  invert: {
    label: "invert",
    description: "Inverts the score so 0 becomes 1 and 1 becomes 0. This will score tiles not on a coast at all as 1.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class CoastalExposure {
  m_coastNormal = { x: 1, y: 0 };
  m_exposure = 0;
}
class RuleCoastalExposure extends Rule {
  parameterSpecs = ruleSchema;
  configValues = Rule.createDefaultsFromSpecs(ruleSchema);
  name = RuleCoastalExposure.getName();
  description = `This rule scores a tile based on its coastline compared to a vector field, and how exposed it is along it's coast. Tiles that are not found to be on a coast will score 0. The concept of a "coastline" is dependent on the tile types that are defined to be inside or outside the coast, it doesn't need to be strictly water vs land.`;
  m_inTileTypes = [];
  // anything not in is out.
  m_vectorField;
  init(inTileTypes = [TerrainType.Flat], vectorField) {
    this.m_inTileTypes = inTileTypes;
    this.m_vectorField = vectorField;
  }
  static getName() {
    return "Coastal Exposure";
  }
  static getSchema() {
    return ruleSchema;
  }
  findCoasts(cell, cells) {
    if (!this.m_inTileTypes.includes(cell.terrainType)) {
      return { coasts: [], isIsland: false };
    }
    const neighborIds = cell.cell.getNeighborIds();
    const transitions = [];
    for (let i = 0; i < neighborIds.length; ++i) {
      const neighbor = cells[neighborIds[i]];
      const nextNeighbor = i + 1 == neighborIds.length ? cells[neighborIds[0]] : cells[neighborIds[i + 1]];
      const neighborIn = this.m_inTileTypes.includes(neighbor.terrainType);
      const nextNeighborIn = this.m_inTileTypes.includes(nextNeighbor.terrainType);
      if (neighborIn != nextNeighborIn) {
        transitions.push(i);
      }
    }
    if (transitions.length == 0) {
      const isIsland = !this.m_inTileTypes.includes(cells[neighborIds[0]].terrainType);
      return { coasts: [], isIsland };
    }
    if (!this.m_inTileTypes.includes(cells[neighborIds[transitions[0]]].terrainType)) {
      transitions.push(transitions.shift());
    }
    const coasts = [];
    for (let i = 0; i < transitions.length; i += 2) {
      const startCoastTile = cells[neighborIds[transitions[i]]];
      const startCoastSite = startCoastTile.cell.site;
      const endCoastTile = cells[neighborIds[(transitions[i + 1] + 1) % neighborIds.length]];
      const endCoastSite = endCoastTile.cell.site;
      const cellSite = cell.cell.site;
      const edgeVector = { x: endCoastSite.x - startCoastSite.x, y: endCoastSite.y - startCoastSite.y };
      const startCoastVector = { x: startCoastSite.x - cellSite.x, y: startCoastSite.y - cellSite.y };
      const endCoastVector = { x: endCoastSite.x - cellSite.x, y: endCoastSite.y - cellSite.y };
      const coastalExposure = new CoastalExposure();
      coastalExposure.m_coastNormal = norm2(
        equal2(endCoastSite, startCoastSite) ? sub2(startCoastSite, cellSite) : { x: edgeVector.y, y: -edgeVector.x }
      );
      coastalExposure.m_exposure = length2(add2(startCoastVector, endCoastVector)) / 2;
      coasts.push(coastalExposure);
    }
    return { coasts, isIsland: false };
  }
  score(cell, ctx) {
    const { coasts, isIsland } = this.findCoasts(cell, ctx.cells);
    if (coasts.length == 0) {
      const islandScore = isIsland ? 1 : 0;
      return this.configValues.invert == 0 ? islandScore : 1 - islandScore;
    }
    const cellPos = { x: cell.cell.site.x, y: cell.cell.site.y };
    const normPos = div2(cellPos, ctx.m_worldDims);
    const vector = this.m_vectorField.sampleUV(normPos.x, normPos.y);
    const scaleFactor = Math.sqrt(ctx.m_worldDims.x * ctx.m_worldDims.y / ctx.cells.length);
    let score = 0;
    for (const coast of coasts) {
      const dot = dot2(vector, coast.m_coastNormal);
      const exposureScore = coast.m_exposure * scaleFactor * this.configValues.exposureFactor;
      const exposureFactor = exposureScore / this.configValues.tolerance;
      score += 1 + exposureFactor - Math.abs(dot - this.configValues.alignment) / this.configValues.tolerance;
    }
    return VoronoiUtils.clamp(score, 0, 1);
  }
}

export { RuleCoastalExposure };
//# sourceMappingURL=coastal-exposure.js.map
