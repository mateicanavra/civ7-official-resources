import { Voronoi } from '../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import { sub2, div2s } from '../../core/scripts/MathHelpers.js';
import { kdTree } from './kd-tree.js';
import { RandomImpl } from './random-pcg-32.js';
import { TerrainType, BiomeType, FeatureType, DetailsType, MapSize, MapDims } from './voronoi-types.js';

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
  terrainType = TerrainType.Unknown;
  biomeType = BiomeType.Unknown;
  featureType = FeatureType.None;
  detailsType = DetailsType.None;
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
    this.terrainType = TerrainType.Unknown;
    this.biomeType = BiomeType.Unknown;
    this.featureType = FeatureType.None;
    this.detailsType = DetailsType.None;
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
  get width() {
    return this.max.x - this.min.x;
  }
  get height() {
    return this.max.y - this.min.y;
  }
  size() {
    return sub2(this.max, this.min);
  }
  distSqToPoint(px, py) {
    let x = 0, y = 0;
    if (px < this.min.x) x = this.min.x - px;
    else if (px >= this.max.x) x = px - this.max.x;
    if (py < this.min.y) y = this.min.y - py;
    else if (py >= this.max.y) y = py - this.max.y;
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
function getterSetter(get, set) {
  const listeners = /* @__PURE__ */ new Set();
  return {
    get,
    set: (newValue) => {
      set(newValue);
      listeners.forEach((listener) => listener(newValue));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
function propRef(obj, key) {
  return getterSetter(
    () => obj[key],
    (value) => {
      obj[key] = value;
    }
  );
}
function propArrayRef(arr, key) {
  return getterSetter(
    () => {
      if (arr.length === 0) {
        return 0;
      }
      return arr[0][key];
    },
    (value) => {
      for (const obj of arr) {
        obj[key] = value;
      }
    }
  );
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
  VoronoiUtils2.colors = [];
  function getRandColor(idx) {
    if (VoronoiUtils2.colors.length == 0) {
      VoronoiUtils2.colors.push(...stringColors.map((v) => Color.FromHex(v)));
    }
    return VoronoiUtils2.colors[idx % VoronoiUtils2.colors.length];
  }
  VoronoiUtils2.getRandColor = getRandColor;
  function getRandomMinMax(min, max, strLog) {
    const diff = Math.abs(min - max);
    const range = diff + 1;
    const trueMin = Math.min(min, max);
    return trueMin + RandomImpl.getRandomNumber(range, strLog);
  }
  VoronoiUtils2.getRandomMinMax = getRandomMinMax;
  function getRandomMinMaxFloat(min, max, strLog) {
    const diff = Math.abs(min - max);
    const trueMin = Math.min(min, max);
    return trueMin + RandomImpl.fRand(strLog) * diff;
  }
  VoronoiUtils2.getRandomMinMaxFloat = getRandomMinMaxFloat;
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
      cell.site.x += strength * (centerSite.x - cell.site.x);
      cell.site.y += strength * (centerSite.y - cell.site.y);
      cell.site.id = 0;
      return cell.site;
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
  function createRandomSites(count, maxX, maxY, factory = (x, y) => ({ id: 0, x, y })) {
    return Array.from({ length: count }, () => {
      const x = RandomImpl.fRand("Voronoi Site X") * maxX;
      const y = RandomImpl.fRand("Voronoi Site Y") * maxY;
      return factory(x, y);
    });
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
  function deepMerge(to, from) {
    for (const key in from) {
      if (from[key] && typeof from[key] === "object" && !Array.isArray(from[key]) && typeof to[key] === "object" && to[key] !== null) {
        deepMerge(to[key], from[key]);
      } else if (Array.isArray(to[key]) && Array.isArray(from[key])) {
        const toArr = to[key];
        const fromArr = from[key];
        if (toArr.length < fromArr.length && "_defaultChild" in to) {
          while (toArr.length < fromArr.length) {
            toArr.push(clone(to["_defaultChild"]));
          }
        }
        toArr.length = fromArr.length;
        for (let i = 0; i < fromArr.length; ++i) {
          if (toArr[i] === void 0) {
            toArr[i] = clone(fromArr[i]);
          } else {
            deepMerge(toArr[i], fromArr[i]);
          }
        }
      } else if (key in to) {
        to[key] = from[key];
      } else {
        console.log("Warning: key " + key + " not in merged object.");
      }
    }
  }
  VoronoiUtils2.deepMerge = deepMerge;
  function isPlainObject(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
  }
  VoronoiUtils2.isPlainObject = isPlainObject;
  function explodeConfig(input) {
    const out = {};
    for (const [compoundKey, value] of Object.entries(input)) {
      const keys = compoundKey.split(".").filter(Boolean);
      if (keys.length === 0) continue;
      let context = out;
      for (let i = 0; i < keys.length - 1; ++i) {
        const k = keys[i];
        const existing = context[k];
        if (isPlainObject(existing)) {
          context = existing;
        } else {
          const next = {};
          context[k] = next;
          context = next;
        }
      }
      const leafKey = keys[keys.length - 1];
      if (isPlainObject(value)) {
        context[leafKey] = explodeConfig(value);
      } else {
        context[leafKey] = value;
      }
    }
    return out;
  }
  VoronoiUtils2.explodeConfig = explodeConfig;
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
  function clone(obj) {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    } else {
      return JSON.parse(JSON.stringify(obj));
    }
  }
  VoronoiUtils2.clone = clone;
  function isIndexable(value) {
    return typeof value === "object" && value !== null;
  }
  function isArrayIndexKey(key) {
    if (typeof key === "number") return Number.isInteger(key) && key >= 0;
    return /^d+$/.test(key);
  }
  VoronoiUtils2.isArrayIndexKey = isArrayIndexKey;
  function stringToPath(path) {
    const result = [];
    const segments = path.split(".");
    for (const segment of segments) {
      const parts = segment.match(/([^[\]]+)/g);
      if (!parts) continue;
      for (const part of parts) {
        if (/^\d+$/.test(part)) {
          result.push(Number(part));
        } else {
          result.push(part);
        }
      }
    }
    return result;
  }
  VoronoiUtils2.stringToPath = stringToPath;
  function getPath(obj, path) {
    let cur = obj;
    for (const key of path) {
      if (!isIndexable(cur)) {
        return void 0;
      }
      if (key === "" && Array.isArray(cur)) {
        if (cur.length === 0) return void 0;
        cur = cur[0];
        continue;
      }
      const indexable = cur;
      if (!(key in indexable)) {
        return void 0;
      }
      cur = indexable[key];
    }
    return cur;
  }
  VoronoiUtils2.getPath = getPath;
  function setPath(obj, path, value, createNewNodes = true) {
    if (!isIndexable(obj)) return false;
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      const nextKey = path[i + 1];
      if (key === "" && Array.isArray(cur)) {
        if (i === path.length - 1) return false;
        let success = true;
        const rest = path.slice(i + 1);
        for (const element of cur) {
          success = setPath(element, rest, value, createNewNodes) && success;
        }
        return success;
      }
      let next = key in cur ? cur[key] : void 0;
      if (!isIndexable(next)) {
        if (createNewNodes) {
          next = isArrayIndexKey(nextKey) ? [] : {};
          cur[key] = next;
        } else {
          return false;
        }
      }
      cur = next;
    }
    const finalKey = path[path.length - 1];
    if (finalKey === "" && Array.isArray(cur)) return false;
    cur[finalKey] = value;
    return true;
  }
  VoronoiUtils2.setPath = setPath;
  function getRoundedString(value, precision) {
    return String(parseFloat(value.toFixed(precision)));
  }
  VoronoiUtils2.getRoundedString = getRoundedString;
  function swapAndPop(arr, indexToRemove) {
    const item = arr[indexToRemove];
    arr[indexToRemove] = arr[arr.length - 1];
    arr.pop();
    return item;
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
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; ++i) {
      hash = (hash << 5) + hash ^ str.charCodeAt(i);
    }
    return hash | 0;
  }
  VoronoiUtils2.hashString = hashString;
  function schlickBias(v, b) {
    return b > 0 ? schlickInvBias(v, 1 / b) : 0;
  }
  VoronoiUtils2.schlickBias = schlickBias;
  function schlickInvBias(v, invB) {
    return v > 0 ? v / ((invB - 2) * (1 - v) + 1) : 0;
  }
  VoronoiUtils2.schlickInvBias = schlickInvBias;
  function getMapSizeForDims(hexDims) {
    let closestType = MapSize.Tiny;
    let leastDiff = Infinity;
    for (const key of Object.values(MapDims).filter((v) => typeof v === "number")) {
      const dims = MapDims[key];
      const diff = Math.abs(hexDims.x - dims.x) + Math.abs(hexDims.y - dims.y);
      if (diff < leastDiff) {
        leastDiff = diff;
        closestType = key;
      }
    }
    return closestType;
  }
  VoronoiUtils2.getMapSizeForDims = getMapSizeForDims;
  function gaussian(pos, center, deviation) {
    const offset = pos - center;
    const denom = 2 * deviation * deviation;
    return Math.exp(-(offset * offset) / denom);
  }
  VoronoiUtils2.gaussian = gaussian;
  function distributeTotal(totalSize, minSize, maxSize, count) {
    const sizes = new Array(count);
    let remaining = totalSize;
    for (let i = 0; i < count; ++i) {
      const slotsLeft = count - i;
      let size = 0;
      if (slotsLeft == 1 || remaining === 0) {
        size = remaining;
      } else {
        const low = Math.max(minSize, remaining - maxSize * (slotsLeft - 1));
        const high = Math.min(maxSize, remaining - minSize * (slotsLeft - 1));
        const mean = remaining / slotsLeft;
        const t = VoronoiUtils2.clamp((mean - low) / (high - low), 1e-6, 1 - 1e-6);
        const gamma = 1 / t - 1;
        const uniform = RandomImpl.fRand(`Random distribution ${i + 1}`);
        size = low + (high - low) * Math.pow(uniform, gamma);
      }
      sizes[i] = size;
      remaining = Math.max(0, remaining - size);
    }
    return sizes;
  }
  VoronoiUtils2.distributeTotal = distributeTotal;
  function generateLocationsAroundCircle(count, minDistance, maxDistance) {
    const distances = new Array(count).fill(0).map(() => VoronoiUtils2.getRandomMinMaxFloat(minDistance, maxDistance, "Circle location distance"));
    return generateLocationsAroundCircleWithOffsets(distances);
  }
  VoronoiUtils2.generateLocationsAroundCircle = generateLocationsAroundCircle;
  function generateLocationsAroundCircleWithOffsets(distances) {
    const locations = [];
    const randSpawnOffset = Math.PI * 2 * RandomImpl.fRand("Landmass spawn offset");
    const angleStep = 2 * Math.PI / distances.length;
    for (let i = 0; i < distances.length; ++i) {
      const angle = randSpawnOffset + i * angleStep;
      const distance = VoronoiUtils2.clamp(distances[i], 0, 1) * 0.5;
      locations.push({ x: 0.5 + Math.cos(angle) * distance, y: 0.5 + Math.sin(angle) * distance });
    }
    return locations;
  }
  VoronoiUtils2.generateLocationsAroundCircleWithOffsets = generateLocationsAroundCircleWithOffsets;
  function getPoissonRands(count, label, threshold = 0.25) {
    let prevRand = -1;
    const rands = [];
    for (let i = 0; i < count; ++i) {
      const beforeSpace = Math.max(0, prevRand - threshold);
      const afterSpace = VoronoiUtils2.clamp(1 - (prevRand + threshold), 0, 1);
      const availableSpace = afterSpace + beforeSpace > 0 ? afterSpace + beforeSpace : 1;
      let rand = RandomImpl.fRand(`${label} ${i + 1}`) * availableSpace;
      if (rand > beforeSpace) {
        rand += 1 - availableSpace;
      }
      rands.push(rand);
      prevRand = rand;
    }
    return rands;
  }
  VoronoiUtils2.getPoissonRands = getPoissonRands;
})(VoronoiUtils || (VoronoiUtils = {}));
class Color {
  // Stores colors internally as numbers from 0 to 1.
  r = 0;
  g = 0;
  b = 0;
  a = 1;
  // mostly unused for now
  constructor(r, g, b, a) {
    this.r = VoronoiUtils.clamp(r, 0, 1);
    this.g = VoronoiUtils.clamp(g, 0, 1);
    this.b = VoronoiUtils.clamp(b, 0, 1);
    this.a = a ?? 1;
    this.a = VoronoiUtils.clamp(this.a, 0, 1);
  }
  // returns a string formatted like "#RRGGBB" or #RRGGBBAA
  toHexString() {
    const r = Color.byteToHex(Math.round(this.r * 255));
    const g = Color.byteToHex(Math.round(this.g * 255));
    const b = Color.byteToHex(Math.round(this.b * 255));
    const a = Color.byteToHex(Math.round(this.a * 255));
    return this.a < 1 ? `#${r}${g}${b}${a}` : `#${r}${g}${b}`;
  }
  // returns a string formatted like "rgb(255, 128, 64)" or "rgba(255,128,64,0.5)"
  toRGBString() {
    const r = Math.round(this.r * 255);
    const g = Math.round(this.g * 255);
    const b = Math.round(this.b * 255);
    return this.a < 1 ? `rgba(${r}, ${g}, ${b}, ${this.a})` : `rgb(${r}, ${g}, ${b})`;
  }
  // returns a uint representation of the rgb like 0xRRGGBB or 0xRRGGBBAA
  toUint() {
    const r = Math.round(this.r * 255) & 255;
    const g = Math.round(this.g * 255) & 255;
    const b = Math.round(this.b * 255) & 255;
    const a = Math.round(this.a * 255) & 255;
    if (this.a < 1) {
      return r << 24 | g << 16 | b << 8 | a;
    } else {
      return r << 16 | g << 8 | b;
    }
  }
  toFloat3() {
    return { x: this.r, y: this.g, z: this.b };
  }
  toFloat4() {
    return { x: this.r, y: this.g, z: this.b, w: this.a };
  }
  static byteToHex(v) {
    return (v & 255).toString(16).padStart(2, "0");
  }
  // Expects a string formatted like "#RRGGBB" or "#RRGGBBAA"
  static FromHex(hexString) {
    const num = Number("0x" + hexString.slice(1));
    return this.FromUint(num);
  }
  // Expects a string formatted like "rgb(255, 128, 64)" or "rgba(255,128,64,0.5)"
  static FromRGBString(rgbString) {
    const m = rgbString.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (!m) return new Color(0, 0, 0);
    return new Color(
      Number(m[1]) / 255,
      Number(m[2]) / 255,
      Number(m[3]) / 255,
      m[4] !== void 0 ? Number(m[4]) : 1
    );
  }
  // Expects a uint number like 0xRRGGBB or 0xRRGGBBAA
  static FromUint(uintColor) {
    const hasAlpha = uintColor > 16777215;
    const p1 = (255 & uintColor >>> 24) / 255;
    const p2 = (255 & uintColor >>> 16) / 255;
    const p3 = (255 & uintColor >>> 8) / 255;
    const p4 = (255 & uintColor >>> 0) / 255;
    return hasAlpha ? new Color(p1, p2, p3, p4) : new Color(p2, p3, p4);
  }
  static lerp(c1, c2, t) {
    t = VoronoiUtils.clamp(t, 0, 1);
    const r = VoronoiUtils.lerp(c1.r, c2.r, t);
    const g = VoronoiUtils.lerp(c1.g, c2.g, t);
    const b = VoronoiUtils.lerp(c1.b, c2.b, t);
    const a = VoronoiUtils.lerp(c1.a, c2.a, t);
    return new Color(r, g, b, a);
  }
}

export { Aabb2, Color, PlateBoundary, PlateBoundaryPosGetter, RegionCell, RegionCellPosGetter, VoronoiUtils, WrapType, getterSetter, propArrayRef, propRef };
//# sourceMappingURL=voronoi-utils.js.map
