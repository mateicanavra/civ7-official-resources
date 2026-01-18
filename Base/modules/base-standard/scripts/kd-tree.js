import { Voronoi } from '../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import { sub2, div3s, div2s } from '../../core/scripts/MathHelpers.js';
import { RandomImpl } from './random-pcg-32.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/rbtree.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/vertex.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/edge.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/cell.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js';

class kdNode {
  data;
  pos = { x: 0, y: 0 };
  left;
  right;
  constructor(data) {
    this.data = data;
  }
}
class kdTree {
  rootNode;
  getPos;
  constructor(getPos) {
    this.getPos = getPos;
  }
  build(data) {
    this.rootNode = this.buildInternal([...data]);
  }
  search(pos) {
    return this.rootNode ? this.searchInternal(this.rootNode, pos, 0, { data: this.rootNode.data, distSq: Infinity }) : void 0;
  }
  searchMultiple(pos, count) {
    return this.searchInternalMultiple(this.rootNode, pos, 0, [], count).sort((a, b) => a.distSq - b.distSq);
  }
  buildInternal(data, axis = 0) {
    if (data.length === 0) return void 0;
    data.sort((a, b) => axis === 0 ? this.getPos(a).x - this.getPos(b).x : this.getPos(a).y - this.getPos(b).y);
    const midIndex = Math.floor(data.length / 2);
    const midItem = data[midIndex];
    axis = (axis + 1) % 2;
    const node = new kdNode(midItem);
    node.left = this.buildInternal(data.slice(0, midIndex), axis);
    node.right = this.buildInternal(data.slice(midIndex + 1), axis);
    node.pos = this.getPos(midItem);
    return node;
  }
  searchInternal(node, pos, axis, best) {
    if (!node) return best;
    const distSq = this.distSq(pos, node.pos);
    if (best.distSq > distSq) {
      best = { data: node.data, distSq };
    }
    const diff = axis === 0 ? pos.x - node.pos.x : pos.y - node.pos.y;
    const nearChild = diff < 0 ? node.left : node.right;
    best = this.searchInternal(nearChild, pos, (axis + 1) % 2, best);
    if (diff * diff < best.distSq) {
      const farChild = diff < 0 ? node.right : node.left;
      best = this.searchInternal(farChild, pos, (axis + 1) % 2, best);
    }
    return best;
  }
  searchInternalMultiple(node, pos, axis, bestList, maxCount) {
    if (!node) return bestList;
    const distSq = this.distSq(pos, node.pos);
    if (bestList.length < maxCount) {
      bestList.push({ data: node.data, distSq });
    } else {
      let bestI = 0;
      for (let i = 1; i < bestList.length; ++i) {
        if (bestList[i].distSq > bestList[bestI].distSq) {
          bestI = i;
        }
      }
      if (bestList[bestI].distSq > distSq) {
        bestList[bestI] = { data: node.data, distSq };
      }
    }
    const diff = axis === 0 ? pos.x - node.pos.x : pos.y - node.pos.y;
    const nearChild = diff < 0 ? node.left : node.right;
    bestList = this.searchInternalMultiple(nearChild, pos, (axis + 1) % 2, bestList, maxCount);
    const axisDistSq = diff * diff;
    const furthestDistanceSq = bestList.reduce((max, data) => Math.max(max, data.distSq), 0);
    if (axisDistSq < furthestDistanceSq) {
      const farChild = diff < 0 ? node.right : node.left;
      bestList = this.searchInternalMultiple(farChild, pos, (axis + 1) % 2, bestList, maxCount);
    }
    return bestList;
  }
  distSq(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }
}
class WrappedKdTree extends kdTree {
  bounds;
  wrapType;
  constructor(getPos, bounds = new Aabb2({ x: 0, y: 0 }, { x: 0, y: 0 }), wrapType = WrapType.None) {
    super(getPos);
    this.bounds = bounds;
    this.wrapType = wrapType;
  }
  search(pos) {
    if (!this.rootNode) return void 0;
    const { pos: wrappedTarget, signedNearest } = this.bounds.getWrappedData(pos, this.wrapType);
    const size = this.bounds.size();
    let nearest = this.searchInternal(this.rootNode, pos, 0, { data: this.rootNode.data, distSq: Infinity });
    if (nearest.distSq > signedNearest.x * signedNearest.x) {
      const xWrappedTarget = { x: wrappedTarget.x - Math.sign(signedNearest.x) * size.x, y: wrappedTarget.y };
      const xNearest = this.searchInternal(this.rootNode, xWrappedTarget, 0, nearest);
      if (xNearest.distSq < nearest.distSq) {
        nearest = xNearest;
      }
    }
    if (nearest.distSq > signedNearest.y * signedNearest.y) {
      const yWrappedTarget = { x: wrappedTarget.x, y: wrappedTarget.y - Math.sign(signedNearest.y) * size.y };
      const yNearest = this.searchInternal(this.rootNode, yWrappedTarget, 0, nearest);
      if (yNearest.distSq < nearest.distSq) {
        nearest = yNearest;
      }
    }
    if (this.wrapType === WrapType.WrapXY && nearest.distSq > signedNearest.x * signedNearest.x + signedNearest.y * signedNearest.y) {
      const xyWrappedTarget = {
        x: wrappedTarget.x + Math.sign(signedNearest.x) * size.x,
        y: wrappedTarget.y + Math.sign(signedNearest.y) * size.y
      };
      const xyNearest = this.searchInternal(this.rootNode, xyWrappedTarget, 0, nearest);
      if (xyNearest.distSq < nearest.distSq) {
        nearest = xyNearest;
      }
    }
    return nearest;
  }
}

var MapSize = /* @__PURE__ */ ((MapSize2) => {
  MapSize2[MapSize2["Tiny"] = 0] = "Tiny";
  MapSize2[MapSize2["Small"] = 1] = "Small";
  MapSize2[MapSize2["Standard"] = 2] = "Standard";
  MapSize2[MapSize2["Large"] = 3] = "Large";
  MapSize2[MapSize2["Huge"] = 4] = "Huge";
  return MapSize2;
})(MapSize || {});
const MapDims = {
  [0 /* Tiny */]: { x: 60, y: 38 },
  [1 /* Small */]: { x: 74, y: 46 },
  [2 /* Standard */]: { x: 84, y: 54 },
  [3 /* Large */]: { x: 96, y: 60 },
  [4 /* Huge */]: { x: 106, y: 66 }
};
var RegionType = /* @__PURE__ */ ((RegionType2) => {
  RegionType2[RegionType2["None"] = 0] = "None";
  RegionType2[RegionType2["Ocean"] = 1] = "Ocean";
  RegionType2[RegionType2["Landmass"] = 2] = "Landmass";
  RegionType2[RegionType2["Island"] = 3] = "Island";
  RegionType2[RegionType2["CoastalIsland"] = 4] = "CoastalIsland";
  RegionType2[RegionType2["_Length"] = 5] = "_Length";
  return RegionType2;
})(RegionType || {});
var TerrainType = /* @__PURE__ */ ((TerrainType2) => {
  TerrainType2[TerrainType2["Unknown"] = 0] = "Unknown";
  TerrainType2[TerrainType2["Ocean"] = 1] = "Ocean";
  TerrainType2[TerrainType2["Coast"] = 2] = "Coast";
  TerrainType2[TerrainType2["Flat"] = 3] = "Flat";
  TerrainType2[TerrainType2["Rough"] = 4] = "Rough";
  TerrainType2[TerrainType2["Mountainous"] = 5] = "Mountainous";
  TerrainType2[TerrainType2["Volcano"] = 6] = "Volcano";
  TerrainType2[TerrainType2["NavRiver"] = 7] = "NavRiver";
  TerrainType2[TerrainType2["_Length"] = 8] = "_Length";
  return TerrainType2;
})(TerrainType || {});
var BiomeType = /* @__PURE__ */ ((BiomeType2) => {
  BiomeType2[BiomeType2["Unknown"] = 0] = "Unknown";
  BiomeType2[BiomeType2["Ocean"] = 1] = "Ocean";
  BiomeType2[BiomeType2["Desert"] = 2] = "Desert";
  BiomeType2[BiomeType2["Grassland"] = 3] = "Grassland";
  BiomeType2[BiomeType2["Plains"] = 4] = "Plains";
  BiomeType2[BiomeType2["Tropical"] = 5] = "Tropical";
  BiomeType2[BiomeType2["Tundra"] = 6] = "Tundra";
  BiomeType2[BiomeType2["_Length"] = 7] = "_Length";
  return BiomeType2;
})(BiomeType || {});
var DetailsType = /* @__PURE__ */ ((DetailsType2) => {
  DetailsType2[DetailsType2["None"] = 0] = "None";
  DetailsType2[DetailsType2["MinorRiver"] = 1] = "MinorRiver";
  DetailsType2[DetailsType2["Wet"] = 2] = "Wet";
  DetailsType2[DetailsType2["Vegetated"] = 3] = "Vegetated";
  DetailsType2[DetailsType2["Floodplain"] = 4] = "Floodplain";
  DetailsType2[DetailsType2["Snow"] = 5] = "Snow";
  DetailsType2[DetailsType2["_Length"] = 6] = "_Length";
  return DetailsType2;
})(DetailsType || {});
var WrapType = /* @__PURE__ */ ((WrapType2) => {
  WrapType2[WrapType2["None"] = 0] = "None";
  WrapType2[WrapType2["WrapX"] = 1] = "WrapX";
  WrapType2[WrapType2["WrapY"] = 2] = "WrapY";
  WrapType2[WrapType2["WrapXY"] = 3] = "WrapXY";
  return WrapType2;
})(WrapType || {});
class RegionCell {
  id = 0;
  cell;
  area = 0;
  landmassId = 0;
  landmassOrder = 0;
  plateId = -1;
  plateOrder = 0;
  elevation = 0;
  terrainType = 0 /* Unknown */;
  biomeType = 0 /* Unknown */;
  detailsType = 0 /* None */;
  regionConsiderationBits = 0n;
  // helps avoid a set lookup when on a region's consideration heap during processing.
  ruleConsideration = false;
  // used by individual rules. Rule should clear back to false after each use.
  currentScore = 0;
  // can hold a current score temporarily, but should be zeroed out between operations.
  constructor(cell, id, area) {
    this.cell = cell;
    this.id = id;
    this.area = area;
  }
  reset() {
    this.landmassId = 0;
    this.landmassOrder = 0;
    this.plateId = -1;
    this.plateOrder = 0;
    this.elevation = 0;
    this.terrainType = 0 /* Unknown */;
    this.biomeType = 0 /* Unknown */;
    this.detailsType = 0 /* None */;
  }
}
const RegionCellPosGetter = (cell) => {
  return { x: cell.cell.site.x, y: cell.cell.site.y };
};
class PlateBoundary {
  pos = { x: 0, y: 0 };
  normal = { x: 0, y: 0 };
  plateSubduction = 0;
  plateSliding = 0;
  id1 = 0;
  id2 = 0;
}
const PlateBoundaryPosGetter = (data) => {
  return { x: data.pos.x, y: data.pos.y };
};
class Aabb2 {
  min = { x: 0, y: 0 };
  max = { x: 0, y: 0 };
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
  clone() {
    return new Aabb2({ x: this.min.x, y: this.min.y }, { x: this.max.x, y: this.max.y });
  }
  contains(pos) {
    return pos.x >= this.min.x && pos.x <= this.max.x && pos.y >= this.min.y && pos.y <= this.max.y;
  }
  size() {
    return sub2(this.max, this.min);
  }
  distSqToPoint(p) {
    let x = 0, y = 0;
    if (p.x < this.min.x) x = this.min.x - p.x;
    else if (p.x >= this.max.x) x = p.x - this.max.x;
    if (p.y < this.min.y) y = this.min.y - p.y;
    else if (p.y >= this.max.y) y = p.y - this.max.y;
    return x * x + y * y;
  }
  intersects(other) {
    return !(other.min.x >= this.max.x || other.max.x <= other.min.x || other.min.y >= this.max.y || other.max.y <= other.min.y);
  }
  getWrappedData(pos, wrapType) {
    const wrappedPos = { x: pos.x, y: pos.y };
    const signedNearest = { x: Infinity, y: Infinity };
    const size = this.size();
    const min = this.min;
    const max = this.max;
    if (wrapType === 1 /* WrapX */ || wrapType === 3 /* WrapXY */) {
      wrappedPos.x = min.x + VoronoiUtils.posMod(pos.x - min.x, size.x);
      signedNearest.x = pos.x - min.x <= max.x - pos.x ? -(pos.x - min.x) : max.x - pos.x;
    }
    if (wrapType === 2 /* WrapY */ || wrapType === 3 /* WrapXY */) {
      wrappedPos.y = min.y + VoronoiUtils.posMod(pos.y - min.y, size.y);
      signedNearest.y = pos.y - min.y <= max.y - pos.y ? -(pos.y - min.y) : max.y - pos.y;
    }
    return { pos: wrappedPos, signedNearest };
  }
}
var VoronoiUtils;
((VoronoiUtils2) => {
  const stringColors = [
    "#e57373",
    "#4db6ac",
    "#f06292",
    "#64b5f6",
    "#ba68c8",
    "#81c784",
    "#9575cd",
    "#ffb74d",
    "#7986cb",
    "#aed581",
    "#4fc3f7",
    "#f4511e",
    "#4dd0e1",
    "#dce775",
    "#43a047",
    "#ff8a65",
    "#8e24aa",
    "#c0ca33",
    "#1e88e5",
    "#fb8c00",
    "#00acc1",
    "#fbc02d",
    "#00897b",
    "#ef6c00",
    "#5e35b1",
    "#ffd54f",
    "#3949ab",
    "#d81b60",
    "#90a4ae",
    "#ff7043",
    "#7cb342",
    "#6d4c41"
  ];
  function hexStringToRgb(hexString) {
    const num = Number("0x" + hexString.slice(1));
    return div3s({ x: num >> 16 & 255, y: num >> 8 & 255, z: num & 255 }, 255);
  }
  VoronoiUtils2.hexStringToRgb = hexStringToRgb;
  VoronoiUtils2.numericColors = stringColors.map((v) => hexStringToRgb(v));
  function getRandColor(idx) {
    return VoronoiUtils2.numericColors[idx % VoronoiUtils2.numericColors.length];
  }
  VoronoiUtils2.getRandColor = getRandColor;
  function getRandStringColor(idx) {
    return stringColors[idx % VoronoiUtils2.numericColors.length];
  }
  VoronoiUtils2.getRandStringColor = getRandStringColor;
  function voronoiCellCentroid(cell) {
    let area = 0;
    const c = { x: 0, y: 0 };
    for (const halfedge of cell.halfedges) {
      const p0 = halfedge.getStartpoint();
      const p1 = halfedge.getEndpoint();
      const cross = p0.x * p1.y - p0.y * p1.x;
      area += cross;
      c.x += (p0.x + p1.x) * cross;
      c.y += (p0.y + p1.y) * cross;
    }
    return div2s(c, 3 * area);
  }
  VoronoiUtils2.voronoiCellCentroid = voronoiCellCentroid;
  function lloydRelaxation(cells, strength) {
    return cells.map((cell) => {
      const centerSite = voronoiCellCentroid(cell);
      return {
        id: 0,
        x: cell.site.x + strength * (centerSite.x - cell.site.x),
        y: cell.site.y + strength * (centerSite.y - cell.site.y)
      };
    });
  }
  VoronoiUtils2.lloydRelaxation = lloydRelaxation;
  function computeVoronoi(sites, bbox, relaxationSteps, wrap = 0 /* None */) {
    if (wrap == 2 /* WrapY */ || wrap == 3 /* WrapXY */) {
      console.log("Voronoi currently only supports wrapping in X. Reverting to no wrap.");
      wrap = 0 /* None */;
    }
    const voronoi = new Voronoi();
    const width = bbox.xr - bbox.xl;
    const height = bbox.yb - bbox.yt;
    const density = Math.sqrt(sites.length / (width * height));
    const wrapMargin = Math.min(4 / density, width * 0.5);
    const createDiagram = (sites2) => {
      if (wrap == 1 /* WrapX */) {
        sites2 = sites2.filter((value) => value.x >= bbox.xl && value.x < bbox.xr);
        const marginSites = [];
        for (const site of sites2) {
          if (site.x <= bbox.xl + wrapMargin) {
            marginSites.push({ x: site.x + width, y: site.y, id: 0 });
          } else if (site.x > bbox.xr - wrapMargin) {
            marginSites.push({ x: site.x - width, y: site.y, id: 0 });
          }
        }
        sites2 = sites2.concat(marginSites);
        console.log(`Duplicating ${sites2.length} sites around the voronoi graph margins.`);
        const wrappedBbox = {
          xl: bbox.xl - wrapMargin,
          xr: bbox.xr + wrapMargin,
          yt: bbox.yt,
          yb: bbox.yb
        };
        return voronoi.compute(sites2, wrappedBbox);
      } else {
        return voronoi.compute(sites2, bbox);
      }
    };
    let diagram = createDiagram(sites);
    for (let index = 0; index < relaxationSteps; index++) {
      sites = lloydRelaxation(diagram.cells, 2);
      voronoi.toRecycle = diagram;
      diagram = createDiagram(sites);
    }
    const isInside = (v, bounds) => {
      return v != null && v.x >= bounds.xl && v.x < bounds.xr && v.y >= bounds.yt && v.y < bounds.yb;
    };
    if (wrap == 1 /* WrapX */) {
      const boundedCells = diagram.cells.filter((cell) => isInside(cell.site, bbox));
      const cellKdTree = new kdTree((data) => data.site);
      cellKdTree.build(boundedCells);
      diagram.edges = diagram.edges.filter((edge) => {
        const rInside = isInside(edge.rSite, bbox);
        const lInside = isInside(edge.lSite, bbox);
        if (rInside !== lInside) {
          if (rInside) {
            if (edge.lSite != null) {
              const sitePos = { x: edge.lSite.x, y: edge.lSite.y };
              sitePos.x += sitePos.x < bbox.xr ? width : -width;
              edge.lSite = cellKdTree.search(sitePos).data.site;
            }
          } else {
            if (edge.rSite != null) {
              const sitePos = { x: edge.rSite.x, y: edge.rSite.y };
              sitePos.x += sitePos.x < bbox.xr ? width : -width;
              edge.rSite = cellKdTree.search(sitePos).data.site;
            }
          }
        }
        return rInside || lInside;
      });
      diagram.cells = boundedCells;
      diagram.cells.forEach((cell, index) => {
        cell.site.id = index;
      });
    }
    return diagram;
  }
  VoronoiUtils2.computeVoronoi = computeVoronoi;
  function createRandomSites(count, maxX, maxY) {
    return Array.from({ length: count }, () => ({
      id: 0,
      x: RandomImpl.fRand("Voronoi Site X") * maxX,
      y: RandomImpl.fRand("Voronoi Site Y") * maxY
    }));
  }
  VoronoiUtils2.createRandomSites = createRandomSites;
  function dot(dir1, dir2) {
    return dir1.x * dir2.x + dir1.y * dir2.y;
  }
  VoronoiUtils2.dot = dot;
  function crossZ(dir1, dir2) {
    return dir1.x * dir2.y - dir1.y * dir2.x;
  }
  VoronoiUtils2.crossZ = crossZ;
  function lerp(a, b, t) {
    return a + t * (b - a);
  }
  VoronoiUtils2.lerp = lerp;
  function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / len, y: v.y / len };
  }
  VoronoiUtils2.normalize = normalize;
  function iLerp(a, b, t) {
    return (t - a) / (b - a);
  }
  VoronoiUtils2.iLerp = iLerp;
  function clamp(a, min, max) {
    const lowerClamp = Math.max(a, min);
    return Math.min(lowerClamp, max);
  }
  VoronoiUtils2.clamp = clamp;
  function pointInsideCell(cell, point) {
    for (const halfEdge of cell.halfedges) {
      const ept1 = halfEdge.getStartpoint();
      const ept2 = halfEdge.getEndpoint();
      const edgeDir = { x: ept2.x - ept1.x, y: ept2.y - ept1.y };
      const ptDir = { x: point.x - ept1.x, y: point.y - ept1.y };
      if (crossZ(edgeDir, ptDir) > 0) {
        return false;
      }
    }
    return true;
  }
  VoronoiUtils2.pointInsideCell = pointInsideCell;
  function calculateCellArea(cell) {
    let area = 0;
    for (const halfedge of cell.halfedges) {
      const pt1 = halfedge.getStartpoint();
      const pt2 = halfedge.getEndpoint();
      area += pt1.x * pt2.y - pt2.x * pt1.y;
    }
    return area * -0.5;
  }
  VoronoiUtils2.calculateCellArea = calculateCellArea;
  function wrapDelta(d, P) {
    d = Math.abs(d);
    return d <= P - d ? d : P - d;
  }
  VoronoiUtils2.wrapDelta = wrapDelta;
  function sqDistance(pt1, pt2, opts = { wrap: 0 /* None */ }) {
    let xDiff = pt1.x - pt2.x;
    let yDiff = pt1.y - pt2.y;
    switch (opts.wrap) {
      case 1 /* WrapX */:
        xDiff = wrapDelta(xDiff, opts.width);
        break;
      case 2 /* WrapY */:
        yDiff = wrapDelta(yDiff, opts.height);
        break;
      case 3 /* WrapXY */:
        xDiff = wrapDelta(xDiff, opts.width);
        yDiff = wrapDelta(yDiff, opts.height);
        break;
    }
    return xDiff * xDiff + yDiff * yDiff;
  }
  VoronoiUtils2.sqDistance = sqDistance;
  function sqDistanceBetweenSites(site1, site2, opts = { wrap: 0 /* None */ }) {
    return sqDistance({ x: site1.x, y: site1.y }, { x: site2.x, y: site2.y }, opts);
  }
  VoronoiUtils2.sqDistanceBetweenSites = sqDistanceBetweenSites;
  function distanceBetweenSites(site1, site2, opts = { wrap: 0 /* None */ }) {
    return Math.sqrt(sqDistance({ x: site1.x, y: site1.y }, { x: site2.x, y: site2.y }, opts));
  }
  VoronoiUtils2.distanceBetweenSites = distanceBetweenSites;
  function defaultEnumRecord(e) {
    const obj = {};
    for (const k of Object.values(e)) {
      if (typeof k === "number") obj[k] = {};
    }
    return obj;
  }
  VoronoiUtils2.defaultEnumRecord = defaultEnumRecord;
  function shuffle(arr, count = arr.length) {
    for (let i = 0; i < count; ++i) {
      const idx = RandomImpl.getRandomNumber(arr.length - i, "Shuffle Idx") + i;
      [arr[i], arr[idx]] = [arr[idx], arr[i]];
    }
  }
  VoronoiUtils2.shuffle = shuffle;
  let RegionCellFilterResult;
  ((RegionCellFilterResult2) => {
    RegionCellFilterResult2[RegionCellFilterResult2["Continue"] = 0] = "Continue";
    RegionCellFilterResult2[RegionCellFilterResult2["HaltSuccess"] = 1] = "HaltSuccess";
    RegionCellFilterResult2[RegionCellFilterResult2["HaltFail"] = 2] = "HaltFail";
  })(RegionCellFilterResult = VoronoiUtils2.RegionCellFilterResult || (VoronoiUtils2.RegionCellFilterResult = {}));
  function regionCellAreaFilter(cell, regionCells, maxDistance, filterCallback, distOpts = { wrap: 0 /* None */ }) {
    const consideringList = [cell.id];
    cell.ruleConsideration = true;
    let filterResult = 0 /* Continue */;
    for (let i = 0; i < consideringList.length; ++i) {
      const considerCell = regionCells[consideringList[i]];
      filterResult = filterCallback(considerCell);
      if (filterResult != 0 /* Continue */) {
        break;
      }
      const neighborIds = considerCell.cell.getNeighborIds();
      for (const neighborId of neighborIds) {
        const neighbor = regionCells[neighborId];
        if (!neighbor.ruleConsideration && VoronoiUtils2.distanceBetweenSites(cell.cell.site, neighbor.cell.site, distOpts) < maxDistance) {
          neighbor.ruleConsideration = true;
          consideringList.push(neighborId);
        }
      }
    }
    consideringList.forEach((cellId) => {
      regionCells[cellId].ruleConsideration = false;
    });
    return filterResult;
  }
  VoronoiUtils2.regionCellAreaFilter = regionCellAreaFilter;
  function deepMerge(a, b) {
    for (const key in b) {
      if (b[key] && typeof b[key] === "object" && !Array.isArray(b[key]) && typeof a[key] === "object" && a[key] !== null) {
        deepMerge(a[key], b[key]);
      } else if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        const aArr = a[key];
        const bArr = b[key];
        if (aArr.length < bArr.length && "_defaultChild" in a) {
          while (aArr.length < bArr.length) {
            aArr.push(clone(a["_defaultChild"]));
          }
        }
        aArr.length = bArr.length;
        for (let i = 0; i < bArr.length; ++i) {
          deepMerge(aArr[i], bArr[i]);
        }
      } else if (key in a) {
        a[key] = b[key];
      } else {
        console.log("Warning: key " + key + " not in merged object.");
      }
    }
  }
  VoronoiUtils2.deepMerge = deepMerge;
  async function loadTextFromPath(url) {
    if (typeof fetch == "function") {
      try {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) {
          console.error(`Failed to load ${url}: ${response.statusText}`);
          return null;
        }
        return await response.text();
      } catch (err) {
        console.error(`Error loading ${url}`, err);
        return null;
      }
    } else {
      console.error("Environment does not support fetch().");
      return null;
    }
  }
  VoronoiUtils2.loadTextFromPath = loadTextFromPath;
  async function loadJsonFromPath(url) {
    const text = await loadTextFromPath(url);
    if (text) {
      return JSON.parse(text);
    }
    return null;
  }
  VoronoiUtils2.loadJsonFromPath = loadJsonFromPath;
  async function loadJsFromPath(url) {
    const text = await loadTextFromPath(url);
    if (text) {
      const match = text.match(/export\s+default\s+({[\s\S]*});?\s*$/);
      if (!match) throw new Error("Could not find export default object");
      return JSON.parse(match[1]);
    }
    return null;
  }
  VoronoiUtils2.loadJsFromPath = loadJsFromPath;
  function loadSettingsFromJson(json, map) {
    const configObject = typeof json === "string" ? JSON.parse(json) : json;
    VoronoiUtils2.deepMerge(map.getSettings(), configObject.mapConfig);
    const generator = map.getGenerator();
    generator.resetToDefault();
    VoronoiUtils2.deepMerge(generator.getSettings(), configObject.generatorConfig);
    const rules = generator.getRules();
    for (const [groupKey, groupValue] of Object.entries(configObject.rulesConfig)) {
      const rulesGroup = rules[groupKey];
      for (const [ruleKey, ruleValue] of Object.entries(groupValue)) {
        const ruleKeyParts = ruleKey.split(".");
        for (const rule of rulesGroup) {
          if (rule.name === ruleKeyParts[0]) {
            if (ruleKeyParts[1] === "weight") {
              rule.weight = ruleValue;
            } else if (ruleKeyParts[1] === "isActive") {
              rule.isActive = ruleValue;
            } else {
              rule.configValues[ruleKeyParts[1]] = ruleValue;
            }
            break;
          }
        }
      }
    }
  }
  VoronoiUtils2.loadSettingsFromJson = loadSettingsFromJson;
  function loadSettingsFromJs(jsText, map) {
    const match = jsText.match(/export\s+default\s+({[\s\S]*});?\s*$/);
    if (!match) throw new Error("Could not find export default object");
    return loadSettingsFromJson(match[1], map);
  }
  VoronoiUtils2.loadSettingsFromJs = loadSettingsFromJs;
  function clone(obj) {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    } else {
      return JSON.parse(JSON.stringify(obj));
    }
  }
  VoronoiUtils2.clone = clone;
  function getRoundedString(value, precision) {
    return String(parseFloat(value.toFixed(precision)));
  }
  VoronoiUtils2.getRoundedString = getRoundedString;
  function swapAndPop(arr, indexToRemove) {
    arr[indexToRemove] = arr[arr.length - 1];
    arr.pop();
  }
  VoronoiUtils2.swapAndPop = swapAndPop;
  function performanceMarker(label) {
    if (typeof BuildInfo === "undefined") {
      performance.mark(label);
    } else {
      console.log(label);
    }
  }
  VoronoiUtils2.performanceMarker = performanceMarker;
  function posMod(n, m) {
    return (n % m + m) % m;
  }
  VoronoiUtils2.posMod = posMod;
  function getGeneratorSettingConfigNode(key, settingsConfig) {
    const keyArr = key.split(".");
    let config = settingsConfig;
    let finalNode = void 0;
    for (key of keyArr) {
      const entry = config.find((value) => value.key == key);
      if (entry && !finalNode) {
        if ("children" in entry) {
          config = entry.children.data;
        } else {
          finalNode = entry;
        }
      } else {
        return void 0;
      }
    }
    return finalNode;
  }
  VoronoiUtils2.getGeneratorSettingConfigNode = getGeneratorSettingConfigNode;
  function lockGeneratorSetting(key, settingsConfig) {
    const node = getGeneratorSettingConfigNode(key, settingsConfig);
    if (node) {
      node.locked = true;
    } else {
      console.log(`Unable to lock setting "${key}": not found.`);
    }
  }
  VoronoiUtils2.lockGeneratorSetting = lockGeneratorSetting;
  function unifyGeneratorSetting(key, settingsConfig) {
    const node = getGeneratorSettingConfigNode(key, settingsConfig);
    if (node) {
      node.unified = true;
    } else {
      console.log(`Unable to unify setting "${key}": not found.`);
    }
  }
  VoronoiUtils2.unifyGeneratorSetting = unifyGeneratorSetting;
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; ++i) {
      hash = (hash << 5) + hash ^ str.charCodeAt(i);
    }
    return hash | 0;
  }
  VoronoiUtils2.hashString = hashString;
})(VoronoiUtils || (VoronoiUtils = {}));

export { Aabb2, BiomeType, DetailsType, MapDims, MapSize, PlateBoundary, PlateBoundaryPosGetter, RegionCell, RegionCellPosGetter, RegionType, TerrainType, VoronoiUtils, WrapType, WrappedKdTree, kdTree };
//# sourceMappingURL=kd-tree.js.map
