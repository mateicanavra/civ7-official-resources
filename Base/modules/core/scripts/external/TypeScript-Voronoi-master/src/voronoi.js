import { NIL, RBTreeIdx, BeachPool } from './rbtree-pool.js';
import { CircleEventHeap } from './circle-event-heap.js';
import { Vertex } from './vertex.js';
import { Edge } from './edge.js';
import { Cell } from './cell.js';
import { Diagram } from './diagram.js';
import { Halfedge } from './halfedge.js';

const EPSILON = 1e-9;
class Voronoi {
  constructor() {
    this.vertices = null;
    this.edges = null;
    this.cells = null;
    this.toRecycle = null;
    this.beachPool = null;
    this.beachTree = null;
    this.circleHeap = null;
    this.eventArcIdx = null;
    this.eventX = null;
    this.eventYcenter = null;
    this.eventCount = 0;
    this.eventCapacity = 0;
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];
    this.skipHalfedges = false;
    this.caArea = null;
    this.caSumX = null;
    this.caSumY = null;
    this.caEvents = null;
    this.caCapacity = 0;
    this.caLastN = 0;
  }
  //
  // public methods
  //
  // ---------------------------------------------------------------------------
  // Top-level Fortune loop
  // rhill 2011-05-19:
  //   Voronoi sites are kept client-side now, to allow
  //   user to freely modify content. At compute time,
  //   *references* to sites are copied locally.
  compute(sites, bbox) {
    let startTime = Date.now();
    this.runSweepAndClip(sites, bbox);
    this.closeCells(bbox);
    let stopTime = Date.now();
    let diagram = new Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;
    diagram.execTime = stopTime - startTime;
    this.reset();
    return diagram;
  }
  // Lloyd-relaxation fast path: runs the Fortune sweep + edge clipping but
  // skips halfedge construction, halfedge sorting, cell-closing, and the
  // Diagram object. Computes per-cell centroids directly from edge endpoints,
  // using direction-aware shoelace contributions per (lSite, rSite) edge plus
  // CCW bbox-border closure for cells whose edges touch the bbox.
  //
  // `outX`/`outY` are filled at indices matching the cell ids assigned during
  // the sweep (i.e., outX[site.id] is the centroid x of `site`'s cell). For
  // cells with degenerate (≈0) area the site's existing position is written.
  computeCentroids(sites, bbox, outX, outY) {
    this.skipHalfedges = true;
    this.runSweepAndClip(sites, bbox);
    this.accumulateCentroids(bbox, sites, outX, outY);
    this.skipHalfedges = false;
    if (this.cells.length > 0) {
      const synth = new Diagram();
      synth.vertices = this.vertices;
      synth.edges = this.edges;
      synth.cells = this.cells;
      this.toRecycle = synth;
    }
    this.reset();
  }
  runSweepAndClip(sites, bbox) {
    this.reset();
    this.beachPool.ensureCapacity(sites.length * 2);
    this.ensureEventCapacity(sites.length * 3);
    if (this.toRecycle) {
      this.vertexJunkyard.push(...this.toRecycle.vertices);
      this.edgeJunkyard.push(...this.toRecycle.edges);
      this.cellJunkyard.push(...this.toRecycle.cells);
      this.toRecycle = null;
    }
    let siteEvents = sites.slice(0);
    siteEvents.sort((a, b) => b.y - a.y || b.x - a.x);
    const heap = this.circleHeap;
    const eventArcIdx = this.eventArcIdx;
    const beachCircleEventIdx = this.beachPool.circleEventIdx;
    let site = siteEvents.pop(), siteid = 0, xsitex, xsitey, cells = this.cells, circleEv, circleY, circleX;
    for (; ; ) {
      let heapIndices = heap.indices;
      while (heap.size > 0) {
        const ev = heapIndices[0];
        if (beachCircleEventIdx[eventArcIdx[ev]] === ev) break;
        heap.pop();
      }
      if (heap.size > 0) {
        heapIndices = heap.indices;
        circleEv = heapIndices[0];
        circleY = heap.y[0];
        circleX = heap.x[0];
      } else {
        circleEv = NIL;
      }
      if (site && (circleEv === NIL || site.y < circleY || site.y === circleY && site.x < circleX)) {
        if (site.x !== xsitex || site.y !== xsitey) {
          cells[siteid] = this.createCell(site);
          site.id = siteid++;
          this.addBeachsection(site);
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      } else if (circleEv !== NIL) {
        heap.pop();
        this.removeBeachsection(eventArcIdx[circleEv]);
      } else {
        break;
      }
    }
    this.clipEdges(bbox);
  }
  // Walk all (clipped) edges to accumulate per-cell shoelace integrals, then
  // add bbox-border closure contributions for cells whose edges terminate on
  // the bbox. Output is per-cell centroid in outX/outY (cell index = site.id).
  accumulateCentroids(bbox, sites, outX, outY) {
    const xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb;
    const w = xr - xl;
    const h = yb - yt;
    const perim = 2 * (w + h);
    const eps = EPSILON;
    const n = this.cells.length;
    const edges = this.edges;
    if (this.caCapacity < n) {
      let cap = this.caCapacity || 1024;
      while (cap < n) cap *= 2;
      this.caArea = new Float64Array(cap);
      this.caSumX = new Float64Array(cap);
      this.caSumY = new Float64Array(cap);
      this.caEvents = new Array(cap);
      this.caCapacity = cap;
    }
    const cellArea = this.caArea;
    const cellSumX = this.caSumX;
    const cellSumY = this.caSumY;
    const cellEvents = this.caEvents;
    cellArea.fill(0, 0, n);
    cellSumX.fill(0, 0, n);
    cellSumY.fill(0, 0, n);
    const clearLen = n > this.caLastN ? n : this.caLastN;
    for (let i = 0; i < clearLen; i++) {
      const e = cellEvents[i];
      if (e !== void 0) e.length = 0;
    }
    this.caLastN = n;
    for (let i = 0, ne = edges.length; i < ne; i++) {
      const edge = edges[i];
      const lId = edge.lSite.id;
      const rId = edge.rSite.id;
      const va = edge.va;
      const vb = edge.vb;
      const ax = va.x, ay = va.y;
      const bx = vb.x, by = vb.y;
      const cross = ax * by - ay * bx;
      const sx = ax + bx;
      const sy = ay + by;
      cellArea[lId] += cross;
      cellSumX[lId] += sx * cross;
      cellSumY[lId] += sy * cross;
      cellArea[rId] -= cross;
      cellSumX[rId] -= sx * cross;
      cellSumY[rId] -= sy * cross;
      let aPos = -1;
      if (ax - xl < eps && ax - xl > -eps) aPos = ay - yt;
      else if (ay - yb > -eps && ay - yb < eps) aPos = h + (ax - xl);
      else if (ax - xr > -eps && ax - xr < eps) aPos = h + w + (yb - ay);
      else if (ay - yt > -eps && ay - yt < eps) aPos = 2 * h + w + (xr - ax);
      let bPos = -1;
      if (bx - xl < eps && bx - xl > -eps) bPos = by - yt;
      else if (by - yb > -eps && by - yb < eps) bPos = h + (bx - xl);
      else if (bx - xr > -eps && bx - xr < eps) bPos = h + w + (yb - by);
      else if (by - yt > -eps && by - yt < eps) bPos = 2 * h + w + (xr - bx);
      if (aPos >= 0) {
        let evL = cellEvents[lId];
        if (evL === void 0) cellEvents[lId] = evL = [];
        evL.push(aPos, ax, ay, 0);
        let evR = cellEvents[rId];
        if (evR === void 0) cellEvents[rId] = evR = [];
        evR.push(aPos, ax, ay, 1);
      }
      if (bPos >= 0) {
        let evL = cellEvents[lId];
        if (evL === void 0) cellEvents[lId] = evL = [];
        evL.push(bPos, bx, by, 1);
        let evR = cellEvents[rId];
        if (evR === void 0) cellEvents[rId] = evR = [];
        evR.push(bPos, bx, by, 0);
      }
    }
    const cornerXs = [xl, xr, xr, xl];
    const cornerYs = [yb, yb, yt, yt];
    const cornerPoses = [h, h + w, 2 * h + w, perim];
    for (let cellIdx = 0; cellIdx < n; cellIdx++) {
      const ev = cellEvents[cellIdx];
      if (ev === void 0) continue;
      const m = ev.length >>> 2;
      if (m === 0) continue;
      const tuples = new Array(m);
      for (let k = 0; k < m; k++) {
        const o = k << 2;
        tuples[k] = { pos: ev[o], x: ev[o + 1], y: ev[o + 2], isExit: ev[o + 3] };
      }
      tuples.sort((a, b) => a.pos - b.pos || b.isExit - a.isExit);
      for (let k = 0; k < m; k++) {
        if (tuples[k].isExit !== 1) continue;
        const exitT = tuples[k];
        const entryT = tuples[(k + 1) % m];
        const exitPos = exitT.pos;
        let walkLen = entryT.pos - exitPos;
        if (walkLen <= 0) walkLen += perim;
        const walkEnd = exitPos + walkLen;
        let curX = exitT.x;
        let curY = exitT.y;
        for (let pass = 0; pass < 2; pass++) {
          const off = pass === 0 ? 0 : perim;
          let broke = false;
          for (let c = 0; c < 4; c++) {
            const cp = cornerPoses[c] + off;
            if (cp <= exitPos) continue;
            if (cp >= walkEnd) {
              broke = true;
              break;
            }
            const nx2 = cornerXs[c];
            const ny2 = cornerYs[c];
            const cross2 = curX * ny2 - curY * nx2;
            cellArea[cellIdx] += cross2;
            cellSumX[cellIdx] += (curX + nx2) * cross2;
            cellSumY[cellIdx] += (curY + ny2) * cross2;
            curX = nx2;
            curY = ny2;
          }
          if (broke) break;
        }
        const nx = entryT.x;
        const ny = entryT.y;
        const cross = curX * ny - curY * nx;
        cellArea[cellIdx] += cross;
        cellSumX[cellIdx] += (curX + nx) * cross;
        cellSumY[cellIdx] += (curY + ny) * cross;
      }
    }
    for (let i = 0; i < n; i++) {
      const a = cellArea[i];
      const absA = a < 0 ? -a : a;
      if (absA > eps) {
        const inv3a = 1 / (3 * a);
        outX[i] = cellSumX[i] * inv3a;
        outY[i] = cellSumY[i] * inv3a;
      } else {
        const s = this.cells[i].site;
        outX[i] = s.x;
        outY[i] = s.y;
      }
    }
  }
  //
  // private methods
  //
  equalWithEpsilon(a, b) {
    return Math.abs(a - b) < EPSILON;
  }
  greaterThanWithEpsilon(a, b) {
    return a - b > EPSILON;
  }
  greaterThanOrEqualWithEpsilon(a, b) {
    return b - a < EPSILON;
  }
  lessThanWithEpsilon(a, b) {
    return b - a > EPSILON;
  }
  lessThanOrEqualWithEpsilon(a, b) {
    return a - b < EPSILON;
  }
  // ---------------------------------------------------------------------------
  // Helper: Quantize sites
  // rhill 2013-10-12:
  // This is to solve https://github.com/gorhill/Javascript-Voronoi/issues/15
  // Since not all users will end up using the kind of coord values which would
  // cause the issue to arise, I chose to let the user decide whether or not
  // he should sanitize his coord values through this helper. This way, for
  // those users who uses coord values which are known to be fine, no overhead is
  // added.
  quantizeSites(sites) {
    let eps = EPSILON, n = sites.length, site;
    while (n--) {
      site = sites[n];
      site.x = Math.floor(site.x / eps) * eps;
      site.y = Math.floor(site.y / eps) * eps;
    }
  }
  // ---------------------------------------------------------------------------
  // Helper: Recycle diagram: all vertex, edge and cell objects are
  // "surrendered" to the Voronoi object for reuse.
  // TODO: rhill-voronoi-core v2: more performance to be gained
  // when I change the semantic of what is returned.
  recycle(diagram) {
    if (diagram) {
      if (diagram instanceof Diagram) {
        this.toRecycle = diagram;
      } else {
        throw "Voronoi.recycleDiagram() > Need a Diagram object.";
      }
    }
  }
  reset() {
    if (!this.beachTree) {
      this.beachTree = new RBTreeIdx();
      this.beachPool = new BeachPool(1024);
      this.circleHeap = new CircleEventHeap(1024);
      this.eventArcIdx = new Int32Array(1024);
      this.eventX = new Float64Array(1024);
      this.eventYcenter = new Float64Array(1024);
      this.eventCapacity = 1024;
    }
    this.beachPool.reset();
    this.beachTree.root = NIL;
    this.circleHeap.clear();
    this.eventCount = 0;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
  }
  ensureEventCapacity(min) {
    if (this.eventCapacity >= min) return;
    let newCap = this.eventCapacity || 1024;
    while (newCap < min) newCap *= 2;
    const newArc = new Int32Array(newCap);
    const newX = new Float64Array(newCap);
    const newYc = new Float64Array(newCap);
    newArc.set(this.eventArcIdx);
    newX.set(this.eventX);
    newYc.set(this.eventYcenter);
    this.eventArcIdx = newArc;
    this.eventX = newX;
    this.eventYcenter = newYc;
    this.eventCapacity = newCap;
  }
  createCell(site) {
    let cell = this.cellJunkyard.pop();
    if (cell) {
      return cell.init(site);
    }
    return new Cell(site);
  }
  createHalfedge(edge, lSite, rSite) {
    return new Halfedge(edge, lSite, rSite);
  }
  createVertex(x, y) {
    let v = this.vertexJunkyard.pop();
    if (!v) {
      v = new Vertex(x, y);
    } else {
      v.x = x;
      v.y = y;
    }
    this.vertices.push(v);
    return v;
  }
  // this create and add an edge to internal collection, and also create
  // two halfedges which are added to each site's counterclockwise array
  // of halfedges.
  createEdge(lSite, rSite, va = null, vb = null) {
    let edge = this.edgeJunkyard.pop();
    if (!edge) {
      edge = new Edge(lSite, rSite);
    } else {
      edge.lSite = lSite;
      edge.rSite = rSite;
      edge.va = edge.vb = null;
    }
    this.edges.push(edge);
    if (va) {
      this.setEdgeStartpoint(edge, lSite, rSite, va);
    }
    if (vb) {
      this.setEdgeEndpoint(edge, lSite, rSite, vb);
    }
    if (!this.skipHalfedges) {
      this.cells[lSite.id].halfedges.push(this.createHalfedge(edge, lSite, rSite));
      this.cells[rSite.id].halfedges.push(this.createHalfedge(edge, rSite, lSite));
    }
    return edge;
  }
  createBorderEdge(lSite, va, vb) {
    let edge = this.edgeJunkyard.pop();
    if (!edge) {
      edge = new Edge(lSite, null);
    } else {
      edge.lSite = lSite;
      edge.rSite = null;
    }
    edge.va = va;
    edge.vb = vb;
    this.edges.push(edge);
    return edge;
  }
  setEdgeStartpoint(edge, lSite, rSite, vertex) {
    if (!edge.va && !edge.vb) {
      edge.va = vertex;
      edge.lSite = lSite;
      edge.rSite = rSite;
    } else if (edge.lSite === rSite) {
      edge.vb = vertex;
    } else {
      edge.va = vertex;
    }
  }
  setEdgeEndpoint(edge, lSite, rSite, vertex) {
    this.setEdgeStartpoint(edge, rSite, lSite, vertex);
  }
  // rhill 2011-06-02: A lot of Beachsection instanciations
  // occur during the computation of the Voronoi diagram,
  // somewhere between the number of sites and twice the
  // number of sites, while the number of Beachsections on the
  // beachline at any given time is comparatively low. For this
  // reason, we reuse already created Beachsections, in order
  // to avoid new memory allocation. This resulted in a measurable
  // performance gain.
  createBeachsection(site) {
    return this.beachPool.alloc(site);
  }
  // calculate the left break point of a particular beach section,
  // given a particular sweep line
  leftBreakPoint(arc, directrix) {
    const bp = this.beachPool;
    const siteX = bp.siteX;
    const siteY = bp.siteY;
    let rfocx = siteX[arc], rfocy = siteY[arc], pby2 = rfocy - directrix;
    if (!pby2) {
      return rfocx;
    }
    const lArc = bp.links.prev[arc];
    if (lArc === NIL) {
      return -Infinity;
    }
    let lfocx = siteX[lArc], lfocy = siteY[lArc], plby2 = lfocy - directrix;
    if (!plby2) {
      return lfocx;
    }
    let hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) {
      return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    }
    return (rfocx + lfocx) / 2;
  }
  // calculate the right break point of a particular beach section,
  // given a particular directrix
  rightBreakPoint(arc, directrix) {
    const bp = this.beachPool;
    const rArc = bp.links.next[arc];
    if (rArc !== NIL) {
      return this.leftBreakPoint(rArc, directrix);
    }
    const sy = bp.siteY[arc];
    return sy === directrix ? bp.siteX[arc] : Infinity;
  }
  detachBeachsection(beachsection) {
    this.detachCircleEvent(beachsection);
    this.beachTree.removeNode(this.beachPool.links, beachsection);
    this.beachPool.free(beachsection);
  }
  removeBeachsection(beachsection) {
    const bp = this.beachPool;
    const bPrev = bp.links.prev;
    const bNext = bp.links.next;
    const bCircle = bp.circleEventIdx;
    const bSite = bp.siteRef;
    const bEdge = bp.edgeRef;
    const eventX = this.eventX;
    const eventYc = this.eventYcenter;
    const circle = bCircle[beachsection];
    const x = eventX[circle];
    const y = eventYc[circle];
    const vertex = this.createVertex(x, y);
    let previous = bPrev[beachsection];
    let next = bNext[beachsection];
    const disappearingTransitions = [beachsection];
    const abs_fn = Math.abs;
    this.detachBeachsection(beachsection);
    let lArc = previous;
    let lCircle = bCircle[lArc];
    while (lCircle !== NIL && abs_fn(x - eventX[lCircle]) < EPSILON && abs_fn(y - eventYc[lCircle]) < EPSILON) {
      previous = bPrev[lArc];
      disappearingTransitions.unshift(lArc);
      this.detachBeachsection(lArc);
      lArc = previous;
      lCircle = bCircle[lArc];
    }
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);
    let rArc = next;
    let rCircle = bCircle[rArc];
    while (rCircle !== NIL && abs_fn(x - eventX[rCircle]) < EPSILON && abs_fn(y - eventYc[rCircle]) < EPSILON) {
      next = bNext[rArc];
      disappearingTransitions.push(rArc);
      this.detachBeachsection(rArc);
      rArc = next;
      rCircle = bCircle[rArc];
    }
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);
    const nArcs = disappearingTransitions.length;
    let iArc;
    for (iArc = 1; iArc < nArcs; iArc++) {
      rArc = disappearingTransitions[iArc];
      lArc = disappearingTransitions[iArc - 1];
      this.setEdgeStartpoint(bEdge[rArc], bSite[lArc], bSite[rArc], vertex);
    }
    lArc = disappearingTransitions[0];
    rArc = disappearingTransitions[nArcs - 1];
    bEdge[rArc] = this.createEdge(bSite[lArc], bSite[rArc], void 0, vertex);
    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }
  addBeachsection(site) {
    const x = site.x;
    const directrix = site.y;
    const bp = this.beachPool;
    const bLinks = bp.links;
    const bLeft = bLinks.left;
    const bRight = bLinks.right;
    const bPrev = bLinks.prev;
    const bNext = bLinks.next;
    const bSite = bp.siteRef;
    const bEdge = bp.edgeRef;
    let lArc = NIL;
    let rArc = NIL;
    let dxl;
    let dxr;
    let node = this.beachTree.root;
    while (node !== NIL) {
      dxl = this.leftBreakPoint(node, directrix) - x;
      if (dxl > EPSILON) {
        node = bLeft[node];
      } else {
        dxr = x - this.rightBreakPoint(node, directrix);
        if (dxr > EPSILON) {
          if (bRight[node] === NIL) {
            lArc = node;
            break;
          }
          node = bRight[node];
        } else {
          if (dxl > -EPSILON) {
            lArc = bPrev[node];
            rArc = node;
          } else if (dxr > -EPSILON) {
            lArc = node;
            rArc = bNext[node];
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    const newArc = this.createBeachsection(site);
    this.beachTree.insertSuccessor(bLinks, lArc, newArc);
    if (lArc === NIL && rArc === NIL) {
      return;
    }
    if (lArc === rArc) {
      this.detachCircleEvent(lArc);
      rArc = this.createBeachsection(bSite[lArc]);
      this.beachTree.insertSuccessor(bLinks, newArc, rArc);
      const newEdge = this.createEdge(bSite[lArc], site);
      bEdge[newArc] = newEdge;
      bEdge[rArc] = newEdge;
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }
    if (lArc !== NIL && rArc === NIL) {
      bEdge[newArc] = this.createEdge(bSite[lArc], site);
      return;
    }
    if (lArc !== rArc) {
      this.detachCircleEvent(lArc);
      this.detachCircleEvent(rArc);
      const lSite = bSite[lArc];
      const ax = lSite.x;
      const ay = lSite.y;
      const bx = site.x - ax;
      const by = site.y - ay;
      const rSite = bSite[rArc];
      const cx = rSite.x - ax;
      const cy = rSite.y - ay;
      const d = 2 * (bx * cy - by * cx);
      const hb = bx * bx + by * by;
      const hc = cx * cx + cy * cy;
      const vertex = this.createVertex((cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay);
      this.setEdgeStartpoint(bEdge[rArc], lSite, rSite, vertex);
      bEdge[newArc] = this.createEdge(lSite, site, void 0, vertex);
      bEdge[rArc] = this.createEdge(site, rSite, void 0, vertex);
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }
  }
  attachCircleEvent(arc) {
    const bp = this.beachPool;
    const bLinks = bp.links;
    const lArc = bLinks.prev[arc];
    const rArc = bLinks.next[arc];
    if (lArc === NIL || rArc === NIL) {
      return;
    }
    const bSiteRef = bp.siteRef;
    const lSite = bSiteRef[lArc];
    const rSite = bSiteRef[rArc];
    if (lSite === rSite) {
      return;
    }
    const siteX = bp.siteX;
    const siteY = bp.siteY;
    const bx = siteX[arc];
    const by = siteY[arc];
    const ax = siteX[lArc] - bx;
    const ay = siteY[lArc] - by;
    const cx = siteX[rArc] - bx;
    const cy = siteY[rArc] - by;
    const d = 2 * (ax * cy - ay * cx);
    if (d >= -2e-12) {
      return;
    }
    const ha = ax * ax + ay * ay;
    const hc = cx * cx + cy * cy;
    const px = (cy * ha - ay * hc) / d;
    const py = (ax * hc - cx * ha) / d;
    const ycenter = py + by;
    const eventX = px + bx;
    const eventY = ycenter + Math.sqrt(px * px + py * py);
    const ev = this.eventCount++;
    if (ev >= this.eventCapacity) {
      this.ensureEventCapacity(ev + 1);
    }
    this.eventArcIdx[ev] = arc;
    this.eventX[ev] = eventX;
    this.eventYcenter[ev] = ycenter;
    bp.circleEventIdx[arc] = ev;
    this.circleHeap.push(eventY, eventX, ev);
  }
  detachCircleEvent(arc) {
    this.beachPool.circleEventIdx[arc] = NIL;
  }
  // connect dangling edges (not if a cursory test tells us
  // it is not going to be visible.
  // return value:
  //   false: the dangling endpoint couldn't be connected
  //   true: the dangling endpoint could be connected
  connectEdge(edge, bbox) {
    let vb = edge.vb;
    if (vb) {
      return true;
    }
    let va = edge.va, xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb, lSite = edge.lSite, rSite = edge.rSite, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    this.cells[lSite.id].closeMe = true;
    this.cells[rSite.id].closeMe = true;
    if (ry !== ly) {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
    }
    if (fm === void 0) {
      if (fx < xl || fx >= xr) {
        return false;
      }
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex(fx, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex(fx, yb);
      } else {
        if (!va || va.y > yb) {
          va = this.createVertex(fx, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex(fx, yt);
      }
    } else if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!va || va.y < yt) {
          va = this.createVertex((yt - fb) / fm, yt);
        } else if (va.y >= yb) {
          return false;
        }
        vb = this.createVertex((yb - fb) / fm, yb);
      } else {
        if (!va || va.y > yb) {
          va = this.createVertex((yb - fb) / fm, yb);
        } else if (va.y < yt) {
          return false;
        }
        vb = this.createVertex((yt - fb) / fm, yt);
      }
    } else {
      if (ly < ry) {
        if (!va || va.x < xl) {
          va = this.createVertex(xl, fm * xl + fb);
        } else if (va.x >= xr) {
          return false;
        }
        vb = this.createVertex(xr, fm * xr + fb);
      } else {
        if (!va || va.x > xr) {
          va = this.createVertex(xr, fm * xr + fb);
        } else if (va.x < xl) {
          return false;
        }
        vb = this.createVertex(xl, fm * xl + fb);
      }
    }
    edge.va = va;
    edge.vb = vb;
    return true;
  }
  // line-clipping code taken from:
  //   Liang-Barsky function by Daniel White
  //   http://www.skytopia.com/project/articles/compsci/clipping.html
  // Thanks!
  // A bit modified to minimize code paths
  clipEdge(edge, bbox) {
    let ax = edge.va.x, ay = edge.va.y, bx = edge.vb.x, by = edge.vb.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay;
    let q = ax - bbox.xl;
    if (dx === 0 && q < 0) {
      return false;
    }
    let r = -q / dx;
    if (dx < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dx > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }
    q = bbox.xr - ax;
    if (dx === 0 && q < 0) {
      return false;
    }
    r = q / dx;
    if (dx < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dx > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }
    q = ay - bbox.yt;
    if (dy === 0 && q < 0) {
      return false;
    }
    r = -q / dy;
    if (dy < 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    } else if (dy > 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    }
    q = bbox.yb - ay;
    if (dy === 0 && q < 0) {
      return false;
    }
    r = q / dy;
    if (dy < 0) {
      if (r > t1) {
        return false;
      }
      if (r > t0) {
        t0 = r;
      }
    } else if (dy > 0) {
      if (r < t0) {
        return false;
      }
      if (r < t1) {
        t1 = r;
      }
    }
    if (t0 > 0) {
      edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
    }
    if (t1 < 1) {
      edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
    }
    if (t0 > 0 || t1 < 1) {
      this.cells[edge.lSite.id].closeMe = true;
      this.cells[edge.rSite.id].closeMe = true;
    }
    return true;
  }
  // Connect/cut edges at bounding box
  clipEdges(bbox) {
    let edges = this.edges, iEdge = edges.length, edge, abs_fn = Math.abs;
    while (iEdge--) {
      edge = edges[iEdge];
      if (!this.connectEdge(edge, bbox) || !this.clipEdge(edge, bbox) || abs_fn(edge.va.x - edge.vb.x) < EPSILON && abs_fn(edge.va.y - edge.vb.y) < EPSILON) {
        edge.va = edge.vb = null;
        edges.splice(iEdge, 1);
      }
    }
  }
  // Close the cells.
  // The cells are bound by the supplied bounding box.
  // Each cell refers to its associated site, and a list
  // of halfedges ordered counterclockwise.
  closeCells(bbox) {
    let xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb, cells = this.cells, iCell = cells.length, cell, iLeft, halfedges, nHalfedges, edge, va, vb, vz, lastBorderSegment, abs_fn = Math.abs;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell.prepareHalfedges()) {
        continue;
      }
      if (!cell.closeMe) {
        continue;
      }
      halfedges = cell.halfedges;
      nHalfedges = halfedges.length;
      iLeft = 0;
      while (iLeft < nHalfedges) {
        va = halfedges[iLeft].getEndpoint();
        vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
        if (abs_fn(va.x - vz.x) >= EPSILON || abs_fn(va.y - vz.y) >= EPSILON) {
          switch (true) {
            // walk downward along left side
            case (this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb)):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
              vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
            // fall through
            // walk rightward along bottom side
            case (this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr)):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
              vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
            // fall through
            // walk upward along right side
            case (this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt)):
              lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
              vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
            // fall through
            // walk leftward along top side
            case (this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl)):
              lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
              vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
              lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
              vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
              lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
              vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
              va = vb;
              lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
              vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
              edge = this.createBorderEdge(cell.site, va, vb);
              iLeft++;
              halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
              nHalfedges++;
              if (lastBorderSegment) {
                break;
              }
            // fall through
            default:
              throw "Voronoi.closeCells() > this makes no sense!";
          }
        }
        iLeft++;
      }
      cell.closeMe = false;
    }
  }
}

export { Voronoi };
//# sourceMappingURL=voronoi.js.map
