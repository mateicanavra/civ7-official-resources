import { div2s, add2 } from '../../core/scripts/MathHelpers.js';
import { VoronoiUtils, Aabb2, WrapType } from './kd-tree.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/rbtree.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/vertex.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/edge.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/cell.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js';
import './random-pcg-32.js';

var QuadIdx = /* @__PURE__ */ ((QuadIdx2) => {
  QuadIdx2[QuadIdx2["SW"] = 0] = "SW";
  QuadIdx2[QuadIdx2["SE"] = 1] = "SE";
  QuadIdx2[QuadIdx2["NW"] = 2] = "NW";
  QuadIdx2[QuadIdx2["NE"] = 3] = "NE";
  return QuadIdx2;
})(QuadIdx || {});
class QuadTree {
  bounds;
  capacity;
  maxDepth;
  depth;
  getPos;
  items = [];
  children = null;
  constructor(bounds, getPos, capacity = 4, maxDepth = 16, depth = 0) {
    this.bounds = bounds;
    this.getPos = getPos;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
  }
  size() {
    return this.items.length + (this.children ? this.children.reduce((a, c) => a + c.size(), 0) : 0);
  }
  insert(item) {
    if (!this.bounds.contains(this.getPos(item))) return false;
    if (!this.children) {
      if (this.items.length < this.capacity || this.depth >= this.maxDepth) {
        this.items.push(item);
        return true;
      }
      this.subdivide();
      this.items.forEach((item2) => this.insertIntoChild(item2));
      this.items.length = 0;
    }
    return this.insertIntoChild(item);
  }
  nearest(target, filter = void 0, maxDistance = Infinity) {
    const st = { best: null, bestDistSq: maxDistance * maxDistance };
    this.nearestInternal(target.x, target.y, st, filter);
    return { cell: st.best, distSq: st.bestDistSq };
  }
  nearestInternal(x, y, st, filter = void 0) {
    for (const item of this.items) {
      if (!filter || filter(item)) {
        const d = VoronoiUtils.sqDistance(this.getPos(item), { x, y });
        if (d < st.bestDistSq) {
          st.bestDistSq = d;
          st.best = item;
        }
      }
    }
    if (!this.children) {
      return;
    }
    const cx = (this.bounds.min.x + this.bounds.max.x) * 0.5;
    const cy = (this.bounds.min.y + this.bounds.max.y) * 0.5;
    const right = x >= cx ? 1 : 0;
    const top = y >= cy ? 2 : 0;
    const primary = right + top;
    const order = [primary, primary ^ 1, primary ^ 2, primary ^ 3];
    for (const i of order) {
      const child = this.children[i];
      const cb = child.bounds;
      const aabbd2 = cb.distSqToPoint({ x, y });
      if (aabbd2 < st.bestDistSq) {
        child.nearestInternal(x, y, st, filter);
      }
    }
  }
  queryRange(range = this.bounds, out) {
    if (!this.bounds.intersects(range)) return;
    for (const item of this.items) {
      if (range.contains(this.getPos(item))) out.push(item);
    }
    if (this.children) {
      for (const child of this.children) child.queryRange(range, out);
    }
  }
  insertIntoChild(item) {
    this.children[this.childIndex(item)].insert(item);
  }
  subdivide() {
    const childDepth = this.depth + 1;
    const min = this.bounds.min;
    const hDims = div2s(this.bounds.size(), 2);
    const mins = [min, { x: min.x + hDims.x, y: min.y }, { x: min.x, y: min.y + hDims.y }, add2(min, hDims)];
    const maxes = mins.map((v) => add2(v, hDims));
    this.children = [
      new QuadTree(new Aabb2(mins[0], maxes[0]), this.getPos, this.capacity, this.maxDepth, childDepth),
      new QuadTree(new Aabb2(mins[1], maxes[1]), this.getPos, this.capacity, this.maxDepth, childDepth),
      new QuadTree(new Aabb2(mins[2], maxes[2]), this.getPos, this.capacity, this.maxDepth, childDepth),
      new QuadTree(new Aabb2(mins[3], maxes[3]), this.getPos, this.capacity, this.maxDepth, childDepth)
    ];
  }
  childIndex(item) {
    const center = add2(this.bounds.min, div2s(this.bounds.size(), 2));
    const pos = this.getPos(item);
    const east = pos.x >= center.x;
    const north = pos.y >= center.y;
    return north ? east ? 3 /* NE */ : 2 /* NW */ : east ? 1 /* SE */ : 0 /* SW */;
  }
}
class WrappedQuadTree extends QuadTree {
  wrapType = WrapType.WrapX;
  constructor(bounds, getPos, capacity = 4, maxDepth = 16, wrapType) {
    super(bounds, getPos, capacity, maxDepth, 0);
    this.wrapType = wrapType;
  }
  nearest(target, filter = void 0, maxDistance = Infinity) {
    const { pos: wrappedTarget, signedNearest } = this.bounds.getWrappedData(target, this.wrapType);
    const size = this.bounds.size();
    let nearest = super.nearest(wrappedTarget, filter, maxDistance);
    if (nearest.distSq > signedNearest.x * signedNearest.x) {
      const xWrappedTarget = { x: wrappedTarget.x - Math.sign(signedNearest.x) * size.x, y: wrappedTarget.y };
      const xNearest = super.nearest(xWrappedTarget, filter, maxDistance);
      if (xNearest.distSq < nearest.distSq) {
        nearest = xNearest;
      }
    }
    if (nearest.distSq > signedNearest.y * signedNearest.y) {
      const yWrappedTarget = { x: wrappedTarget.x, y: wrappedTarget.y - Math.sign(signedNearest.y) * size.y };
      const yNearest = super.nearest(yWrappedTarget, filter, maxDistance);
      if (yNearest.distSq < nearest.distSq) {
        nearest = yNearest;
      }
    }
    if (this.wrapType === WrapType.WrapXY && nearest.distSq > signedNearest.x * signedNearest.x + signedNearest.y * signedNearest.y) {
      const xyWrappedTarget = {
        x: wrappedTarget.x + Math.sign(signedNearest.x) * size.x,
        y: wrappedTarget.y + Math.sign(signedNearest.y) * size.y
      };
      const xyNearest = super.nearest(xyWrappedTarget, filter, maxDistance);
      if (xyNearest.distSq < nearest.distSq) {
        nearest = xyNearest;
      }
    }
    return nearest;
  }
  queryRange(rangeBounds = this.bounds, out = []) {
    const size = this.bounds.size();
    const min = this.bounds.min;
    const max = this.bounds.max;
    const range = rangeBounds.clone();
    const ranges = [range];
    if (this.wrapType === WrapType.WrapX || this.wrapType === WrapType.WrapXY) {
      if (range.size().x >= size.x) {
        range.min.x = min.x;
        range.max.x = max.x;
      } else {
        const start = min.x + VoronoiUtils.posMod(range.min.x - min.x, size.x);
        const end = start + range.size().x;
        range.min.x = start;
        range.max.x = Math.min(end, max.x);
        if (end > max.x) {
          const wrappedRange = range.clone();
          wrappedRange.min.x = min.x;
          wrappedRange.max.x = min.x + end - max.x;
          ranges.push(wrappedRange);
        }
      }
    }
    if (this.wrapType === WrapType.WrapY || this.wrapType === WrapType.WrapXY) {
      if (range.size().y >= size.y) {
        range.min.y = min.y;
        range.max.y = max.y;
      } else {
        const start = min.y + VoronoiUtils.posMod(range.min.y - min.y, size.y);
        const end = start + range.size().y;
        ranges.forEach((r) => {
          r.min.y = start;
          r.max.y = Math.min(end, max.y);
        });
        if (end > max.y) {
          const tempRange = [...ranges];
          for (const r of tempRange) {
            const wrappedRange = r.clone();
            wrappedRange.min.y = min.y;
            wrappedRange.max.y = min.y + end - max.y;
            ranges.push(wrappedRange);
          }
        }
      }
    }
    ranges.forEach((r) => super.queryRange(r, out));
  }
}

export { QuadTree, WrappedQuadTree };
//# sourceMappingURL=quadtree.js.map
