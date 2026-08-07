const NIL = -1;
class RBTreeIdx {
  constructor() {
    this.root = NIL;
  }
  insertSuccessor(L, node, successor) {
    const P = L.parent, PV = L.prev, NX = L.next, LF = L.left, RT = L.right, R = L.red;
    let parent;
    if (node !== NIL) {
      PV[successor] = node;
      NX[successor] = NX[node];
      if (NX[node] !== NIL) {
        PV[NX[node]] = successor;
      }
      NX[node] = successor;
      if (RT[node] !== NIL) {
        node = RT[node];
        while (LF[node] !== NIL) {
          node = LF[node];
        }
        LF[node] = successor;
      } else {
        RT[node] = successor;
      }
      parent = node;
    } else if (this.root !== NIL) {
      node = this.first(L, this.root);
      PV[successor] = NIL;
      NX[successor] = node;
      PV[node] = successor;
      LF[node] = successor;
      parent = node;
    } else {
      PV[successor] = NIL;
      NX[successor] = NIL;
      this.root = successor;
      parent = NIL;
    }
    LF[successor] = NIL;
    RT[successor] = NIL;
    P[successor] = parent;
    R[successor] = 1;
    let grandpa, uncle;
    node = successor;
    while (parent !== NIL && R[parent] === 1) {
      grandpa = P[parent];
      if (parent === LF[grandpa]) {
        uncle = RT[grandpa];
        if (uncle !== NIL && R[uncle] === 1) {
          R[parent] = 0;
          R[uncle] = 0;
          R[grandpa] = 1;
          node = grandpa;
        } else {
          if (node === RT[parent]) {
            this.rotateLeft(L, parent);
            node = parent;
            parent = P[node];
          }
          R[parent] = 0;
          R[grandpa] = 1;
          this.rotateRight(L, grandpa);
        }
      } else {
        uncle = LF[grandpa];
        if (uncle !== NIL && R[uncle] === 1) {
          R[parent] = 0;
          R[uncle] = 0;
          R[grandpa] = 1;
          node = grandpa;
        } else {
          if (node === LF[parent]) {
            this.rotateRight(L, parent);
            node = parent;
            parent = P[node];
          }
          R[parent] = 0;
          R[grandpa] = 1;
          this.rotateLeft(L, grandpa);
        }
      }
      parent = P[node];
    }
    R[this.root] = 0;
  }
  removeNode(L, node) {
    const P = L.parent, PV = L.prev, NX = L.next, LF = L.left, RT = L.right, R = L.red;
    if (NX[node] !== NIL) {
      PV[NX[node]] = PV[node];
    }
    if (PV[node] !== NIL) {
      NX[PV[node]] = NX[node];
    }
    NX[node] = NIL;
    PV[node] = NIL;
    let parent = P[node];
    const left = LF[node];
    const right = RT[node];
    let next;
    if (left === NIL) {
      next = right;
    } else if (right === NIL) {
      next = left;
    } else {
      next = this.first(L, right);
    }
    if (parent !== NIL) {
      if (LF[parent] === node) {
        LF[parent] = next;
      } else {
        RT[parent] = next;
      }
    } else {
      this.root = next;
    }
    let isRed;
    if (left !== NIL && right !== NIL) {
      isRed = R[next];
      R[next] = R[node];
      LF[next] = left;
      P[left] = next;
      if (next !== right) {
        parent = P[next];
        P[next] = P[node];
        node = RT[next];
        LF[parent] = node;
        RT[next] = right;
        P[right] = next;
      } else {
        P[next] = parent;
        parent = next;
        node = RT[next];
      }
    } else {
      isRed = R[node];
      node = next;
    }
    if (node !== NIL) {
      P[node] = parent;
    }
    if (isRed === 1) {
      return;
    }
    if (node !== NIL && R[node] === 1) {
      R[node] = 0;
      return;
    }
    let sibling;
    do {
      if (node === this.root) {
        break;
      }
      if (node === LF[parent]) {
        sibling = RT[parent];
        if (R[sibling] === 1) {
          R[sibling] = 0;
          R[parent] = 1;
          this.rotateLeft(L, parent);
          sibling = RT[parent];
        }
        if (LF[sibling] !== NIL && R[LF[sibling]] === 1 || RT[sibling] !== NIL && R[RT[sibling]] === 1) {
          if (RT[sibling] === NIL || R[RT[sibling]] === 0) {
            R[LF[sibling]] = 0;
            R[sibling] = 1;
            this.rotateRight(L, sibling);
            sibling = RT[parent];
          }
          R[sibling] = R[parent];
          R[parent] = 0;
          R[RT[sibling]] = 0;
          this.rotateLeft(L, parent);
          node = this.root;
          break;
        }
      } else {
        sibling = LF[parent];
        if (R[sibling] === 1) {
          R[sibling] = 0;
          R[parent] = 1;
          this.rotateRight(L, parent);
          sibling = LF[parent];
        }
        if (LF[sibling] !== NIL && R[LF[sibling]] === 1 || RT[sibling] !== NIL && R[RT[sibling]] === 1) {
          if (LF[sibling] === NIL || R[LF[sibling]] === 0) {
            R[RT[sibling]] = 0;
            R[sibling] = 1;
            this.rotateLeft(L, sibling);
            sibling = LF[parent];
          }
          R[sibling] = R[parent];
          R[parent] = 0;
          R[LF[sibling]] = 0;
          this.rotateRight(L, parent);
          node = this.root;
          break;
        }
      }
      R[sibling] = 1;
      node = parent;
      parent = P[parent];
    } while (R[node] === 0);
    if (node !== NIL) {
      R[node] = 0;
    }
  }
  rotateLeft(L, node) {
    const P = L.parent, LF = L.left, RT = L.right;
    const p = node;
    const q = RT[p];
    const par = P[p];
    if (par !== NIL) {
      if (LF[par] === p) {
        LF[par] = q;
      } else {
        RT[par] = q;
      }
    } else {
      this.root = q;
    }
    P[q] = par;
    P[p] = q;
    RT[p] = LF[q];
    if (RT[p] !== NIL) {
      P[RT[p]] = p;
    }
    LF[q] = p;
  }
  rotateRight(L, node) {
    const P = L.parent, LF = L.left, RT = L.right;
    const p = node;
    const q = LF[p];
    const par = P[p];
    if (par !== NIL) {
      if (LF[par] === p) {
        LF[par] = q;
      } else {
        RT[par] = q;
      }
    } else {
      this.root = q;
    }
    P[q] = par;
    P[p] = q;
    LF[p] = RT[q];
    if (LF[p] !== NIL) {
      P[LF[p]] = p;
    }
    RT[q] = p;
  }
  first(L, node) {
    const LF = L.left;
    while (LF[node] !== NIL) {
      node = LF[node];
    }
    return node;
  }
  last(L, node) {
    const RT = L.right;
    while (RT[node] !== NIL) {
      node = RT[node];
    }
    return node;
  }
}
class BeachPool {
  constructor(initialCapacity) {
    const cap = Math.max(64, initialCapacity);
    this.capacity = cap;
    this.size = 0;
    this.freeList = new Int32Array(cap);
    this.freeTop = 0;
    this.links = {
      parent: new Int32Array(cap),
      prev: new Int32Array(cap),
      next: new Int32Array(cap),
      left: new Int32Array(cap),
      right: new Int32Array(cap),
      red: new Uint8Array(cap)
    };
    this.siteRef = new Array(cap);
    this.edgeRef = new Array(cap);
    this.circleEventIdx = new Int32Array(cap);
    this.siteX = new Float64Array(cap);
    this.siteY = new Float64Array(cap);
  }
  ensureCapacity(min) {
    while (this.capacity < min) {
      this.grow();
    }
  }
  alloc(site) {
    let idx;
    if (this.freeTop > 0) {
      idx = this.freeList[--this.freeTop];
    } else {
      if (this.size >= this.capacity) {
        this.grow();
      }
      idx = this.size++;
    }
    this.siteRef[idx] = site;
    this.edgeRef[idx] = null;
    this.circleEventIdx[idx] = NIL;
    this.siteX[idx] = site.x;
    this.siteY[idx] = site.y;
    return idx;
  }
  // NOTE: siteRef/edgeRef are intentionally NOT cleared here. removeBeachsection
  // in voronoi.ts reads them on already-detached arcs (matching the original
  // pointer-based junkyard, which left these refs intact until reuse).
  free(idx) {
    this.freeList[this.freeTop++] = idx;
  }
  reset() {
    this.size = 0;
    this.freeTop = 0;
  }
  grow() {
    const newCap = this.capacity * 2;
    const old = this.links;
    this.links = {
      parent: growInt32(old.parent, newCap),
      prev: growInt32(old.prev, newCap),
      next: growInt32(old.next, newCap),
      left: growInt32(old.left, newCap),
      right: growInt32(old.right, newCap),
      red: growUint8(old.red, newCap)
    };
    this.circleEventIdx = growInt32(this.circleEventIdx, newCap);
    this.freeList = growInt32(this.freeList, newCap);
    this.siteX = growFloat64(this.siteX, newCap);
    this.siteY = growFloat64(this.siteY, newCap);
    this.capacity = newCap;
  }
}
function growInt32(src, newCap) {
  const dst = new Int32Array(newCap);
  dst.set(src);
  return dst;
}
function growUint8(src, newCap) {
  const dst = new Uint8Array(newCap);
  dst.set(src);
  return dst;
}
function growFloat64(src, newCap) {
  const dst = new Float64Array(newCap);
  dst.set(src);
  return dst;
}

export { BeachPool, NIL, RBTreeIdx };
//# sourceMappingURL=rbtree-pool.js.map
