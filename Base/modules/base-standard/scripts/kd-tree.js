import { Aabb2, WrapType } from './voronoi-utils.js';

class kdTree {
  // Structure of Arrays (SoA) layout
  // items[i] stores the data for node i
  items = [];
  // coords[2*i] = x, coords[2*i+1] = y
  coords = new Float32Array(0);
  // No children array needed for implicit tree!
  count = 0;
  getPos;
  constructor(getPos) {
    this.getPos = getPos;
  }
  build(data) {
    this.count = data.length;
    this.items = new Array(this.count);
    this.coords = new Float32Array(this.count * 2);
    const indices = new Int32Array(this.count);
    for (let i = 0; i < this.count; ++i) indices[i] = i;
    this.buildRecursive(indices, data, 0, this.count, 0, 0);
  }
  // Calculate size of the left subtree for a complete binary tree of size n
  getLeftSubtreeSize(n) {
    if (n <= 1) return 0;
    const h = 32 - Math.clz32(n);
    const maxLeaf = 1 << h - 1;
    const lastLevel = n - ((1 << h - 1) - 1);
    const leftLeaf = Math.min(lastLevel, maxLeaf >> 1);
    return (1 << h - 2) - 1 + leftLeaf;
  }
  buildRecursive(indices, sourceData, start, end, depth, implicitIndex) {
    const n = end - start;
    if (n <= 0) return;
    const axis = depth % 2;
    const subarray = indices.subarray(start, end);
    const mid = this.getLeftSubtreeSize(n);
    if (axis === 0) {
      subarray.sort((a, b) => this.getPos(sourceData[a]).x - this.getPos(sourceData[b]).x);
    } else {
      subarray.sort((a, b) => this.getPos(sourceData[a]).y - this.getPos(sourceData[b]).y);
    }
    const dataIdx = subarray[mid];
    const item = sourceData[dataIdx];
    const pos = this.getPos(item);
    this.items[implicitIndex] = item;
    this.coords[implicitIndex * 2] = pos.x;
    this.coords[implicitIndex * 2 + 1] = pos.y;
    this.buildRecursive(indices, sourceData, start, start + mid, depth + 1, 2 * implicitIndex + 1);
    this.buildRecursive(indices, sourceData, start + mid + 1, end, depth + 1, 2 * implicitIndex + 2);
  }
  search(pos) {
    if (this.count === 0) return void 0;
    return this.searchInternal(0, pos, 0, { data: this.items[0], distSq: Infinity });
  }
  searchInternal(nodeIdx, pos, axis, best) {
    if (nodeIdx >= this.count) return best;
    const nx = this.coords[nodeIdx * 2];
    const ny = this.coords[nodeIdx * 2 + 1];
    const dx = pos.x - nx;
    const dy = pos.y - ny;
    const distSq = dx * dx + dy * dy;
    if (distSq < best.distSq) {
      best = { data: this.items[nodeIdx], distSq };
    }
    const diff = axis === 0 ? dx : dy;
    const leftIdx = 2 * nodeIdx + 1;
    const rightIdx = 2 * nodeIdx + 2;
    const nearIdx = diff < 0 ? leftIdx : rightIdx;
    const farIdx = diff < 0 ? rightIdx : leftIdx;
    best = this.searchInternal(nearIdx, pos, (axis + 1) % 2, best);
    if (diff * diff < best.distSq) {
      best = this.searchInternal(farIdx, pos, (axis + 1) % 2, best);
    }
    return best;
  }
  searchMultiple(pos, count) {
    if (this.count === 0) return [];
    return this.searchInternalMultiple(0, pos, 0, [], count).sort((a, b) => a.distSq - b.distSq);
  }
  searchInternalMultiple(nodeIdx, pos, axis, bestList, maxCount) {
    if (nodeIdx >= this.count) return bestList;
    const nx = this.coords[nodeIdx * 2];
    const ny = this.coords[nodeIdx * 2 + 1];
    const dx = pos.x - nx;
    const dy = pos.y - ny;
    const distSq = dx * dx + dy * dy;
    if (bestList.length < maxCount) {
      bestList.push({ data: this.items[nodeIdx], distSq });
    } else {
      let maxDistIdx = 0;
      for (let i = 1; i < bestList.length; ++i) {
        if (bestList[i].distSq > bestList[maxDistIdx].distSq) {
          maxDistIdx = i;
        }
      }
      if (distSq < bestList[maxDistIdx].distSq) {
        bestList[maxDistIdx] = { data: this.items[nodeIdx], distSq };
      }
    }
    const diff = axis === 0 ? dx : dy;
    const leftIdx = 2 * nodeIdx + 1;
    const rightIdx = 2 * nodeIdx + 2;
    const nearIdx = diff < 0 ? leftIdx : rightIdx;
    const farIdx = diff < 0 ? rightIdx : leftIdx;
    this.searchInternalMultiple(nearIdx, pos, (axis + 1) % 2, bestList, maxCount);
    const axisDistSq = diff * diff;
    let worstDistSq = 0;
    if (bestList.length < maxCount) {
      worstDistSq = Infinity;
    } else {
      for (const item of bestList) {
        if (item.distSq > worstDistSq) worstDistSq = item.distSq;
      }
    }
    if (axisDistSq < worstDistSq) {
      this.searchInternalMultiple(farIdx, pos, (axis + 1) % 2, bestList, maxCount);
    }
    return bestList;
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
    if (this.count === 0) return void 0;
    const { pos: wrappedTarget, signedNearest } = this.bounds.getWrappedData(pos, this.wrapType);
    const size = this.bounds.size();
    let nearest = this.searchInternal(0, wrappedTarget, 0, { data: this.items[0], distSq: Infinity });
    if (nearest.distSq > signedNearest.x * signedNearest.x) {
      const xWrappedTarget = { x: wrappedTarget.x - Math.sign(signedNearest.x) * size.x, y: wrappedTarget.y };
      const xNearest = this.searchInternal(0, xWrappedTarget, 0, nearest);
      if (xNearest.distSq < nearest.distSq) {
        nearest = xNearest;
      }
    }
    if (nearest.distSq > signedNearest.y * signedNearest.y) {
      const yWrappedTarget = { x: wrappedTarget.x, y: wrappedTarget.y - Math.sign(signedNearest.y) * size.y };
      const yNearest = this.searchInternal(0, yWrappedTarget, 0, nearest);
      if (yNearest.distSq < nearest.distSq) {
        nearest = yNearest;
      }
    }
    if (this.wrapType === WrapType.WrapXY && nearest.distSq > signedNearest.x * signedNearest.x + signedNearest.y * signedNearest.y) {
      const xyWrappedTarget = {
        x: wrappedTarget.x + Math.sign(signedNearest.x) * size.x,
        y: wrappedTarget.y + Math.sign(signedNearest.y) * size.y
      };
      const xyNearest = this.searchInternal(0, xyWrappedTarget, 0, nearest);
      if (xyNearest.distSq < nearest.distSq) {
        nearest = xyNearest;
      }
    }
    return nearest;
  }
}

export { WrappedKdTree, kdTree };
//# sourceMappingURL=kd-tree.js.map
