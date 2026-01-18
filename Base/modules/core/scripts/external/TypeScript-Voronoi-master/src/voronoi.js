import { RBTree, RBTreeNode } from './rbtree.js';
import { Vertex } from './vertex.js';
import { Edge } from './edge.js';
import { Cell } from './cell.js';
import { Diagram } from './diagram.js';
import { Halfedge } from './halfedge.js';

class Voronoi {
  constructor() {
    this.vertices = null;
    this.edges = null;
    this.cells = null;
    this.toRecycle = null;
    this.beachsectionJunkyard = [];
    this.circleEventJunkyard = [];
    this.vertexJunkyard = [];
    this.edgeJunkyard = [];
    this.cellJunkyard = [];
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
    let startTime = /* @__PURE__ */ new Date();
    this.reset();
    if (this.toRecycle) {
      this.vertexJunkyard = this.vertexJunkyard.concat(this.toRecycle.vertices);
      this.edgeJunkyard = this.edgeJunkyard.concat(this.toRecycle.edges);
      this.cellJunkyard = this.cellJunkyard.concat(this.toRecycle.cells);
      this.toRecycle = null;
    }
    let siteEvents = sites.slice(0);
    siteEvents.sort(function(a, b) {
      let r = b.y - a.y;
      if (r) {
        return r;
      }
      return b.x - a.x;
    });
    let site = siteEvents.pop(), siteid = 0, xsitex, xsitey, cells = this.cells, circle;
    for (; ; ) {
      circle = this.firstCircleEvent;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== xsitex || site.y !== xsitey) {
          cells[siteid] = this.createCell(site);
          site.id = siteid++;
          this.addBeachsection(site);
          xsitey = site.y;
          xsitex = site.x;
        }
        site = siteEvents.pop();
      } else if (circle) {
        this.removeBeachsection(circle.arc);
      } else {
        break;
      }
    }
    this.clipEdges(bbox);
    this.closeCells(bbox);
    let stopTime = /* @__PURE__ */ new Date();
    let diagram = new Diagram();
    diagram.cells = this.cells;
    diagram.edges = this.edges;
    diagram.vertices = this.vertices;
    diagram.execTime = stopTime.getTime() - startTime.getTime();
    this.reset();
    return diagram;
  }
  //
  // private methods
  //
  sqrt(x) {
    return Math.sqrt(x);
  }
  abs(x) {
    return Math.abs(x);
  }
  eps() {
    return 1e-9;
  }
  inveps() {
    return 1 / this.eps();
  }
  equalWithEpsilon(a, b) {
    return this.abs(a - b) < this.eps();
  }
  greaterThanWithEpsilon(a, b) {
    return a - b > this.eps();
  }
  greaterThanOrEqualWithEpsilon(a, b) {
    return b - a < this.eps();
  }
  lessThanWithEpsilon(a, b) {
    return b - a > this.eps();
  }
  lessThanOrEqualWithEpsilon(a, b) {
    return a - b < this.eps();
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
    let eps = this.eps(), n = sites.length, site;
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
    if (!this.beachline) {
      this.beachline = new RBTree();
    }
    if (this.beachline.root) {
      let beachsection = this.beachline.first(this.beachline.root);
      while (beachsection) {
        this.beachsectionJunkyard.push(beachsection);
        beachsection = beachsection.next;
      }
    }
    this.beachline.root = null;
    if (!this.circleEvents) {
      this.circleEvents = new RBTree();
    }
    this.circleEvents.root = this.firstCircleEvent = null;
    this.vertices = [];
    this.edges = [];
    this.cells = [];
  }
  createCell(site) {
    let cell = this.cellJunkyard.pop();
    if (cell) {
      cell.init(site);
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
    this.cells[lSite.id].halfedges.push(this.createHalfedge(edge, lSite, rSite));
    this.cells[rSite.id].halfedges.push(this.createHalfedge(edge, rSite, lSite));
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
    let beachsection = this.beachsectionJunkyard.pop();
    if (!beachsection) {
      beachsection = new RBTreeNode();
    }
    beachsection.site = site;
    return beachsection;
  }
  // calculate the left break point of a particular beach section,
  // given a particular sweep line
  leftBreakPoint(arc, directrix) {
    let site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) {
      return rfocx;
    }
    let lArc = arc.prev;
    if (!lArc) {
      return -Infinity;
    }
    site = lArc.site;
    let lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) {
      return lfocx;
    }
    let hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) {
      return (-b + this.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    }
    return (rfocx + lfocx) / 2;
  }
  // calculate the right break point of a particular beach section,
  // given a particular directrix
  rightBreakPoint(arc, directrix) {
    let rArc = arc.next;
    if (rArc) {
      return this.leftBreakPoint(rArc, directrix);
    }
    let site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  detachBeachsection(beachsection) {
    this.detachCircleEvent(beachsection);
    this.beachline.removeNode(beachsection);
    this.beachsectionJunkyard.push(beachsection);
  }
  removeBeachsection(beachsection) {
    let circle = beachsection.circleEvent, x = circle.x, y = circle.ycenter, vertex = this.createVertex(x, y), previous = beachsection.prev, next = beachsection.next, disappearingTransitions = [beachsection], abs_fn = Math.abs;
    this.detachBeachsection(beachsection);
    let lArc = previous;
    while (lArc.circleEvent && abs_fn(x - lArc.circleEvent.x) < this.eps() && abs_fn(y - lArc.circleEvent.ycenter) < this.eps()) {
      previous = lArc.prev;
      disappearingTransitions.unshift(lArc);
      this.detachBeachsection(lArc);
      lArc = previous;
    }
    disappearingTransitions.unshift(lArc);
    this.detachCircleEvent(lArc);
    let rArc = next;
    while (rArc.circleEvent && abs_fn(x - rArc.circleEvent.x) < this.eps() && abs_fn(y - rArc.circleEvent.ycenter) < this.eps()) {
      next = rArc.next;
      disappearingTransitions.push(rArc);
      this.detachBeachsection(rArc);
      rArc = next;
    }
    disappearingTransitions.push(rArc);
    this.detachCircleEvent(rArc);
    let nArcs = disappearingTransitions.length, iArc;
    for (iArc = 1; iArc < nArcs; iArc++) {
      rArc = disappearingTransitions[iArc];
      lArc = disappearingTransitions[iArc - 1];
      this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearingTransitions[0];
    rArc = disappearingTransitions[nArcs - 1];
    rArc.edge = this.createEdge(lArc.site, rArc.site, void 0, vertex);
    this.attachCircleEvent(lArc);
    this.attachCircleEvent(rArc);
  }
  addBeachsection(site) {
    let x = site.x, directrix = site.y;
    let lArc, rArc, dxl, dxr, node = this.beachline.root;
    while (node) {
      dxl = this.leftBreakPoint(node, directrix) - x;
      if (dxl > this.eps()) {
        node = node.left;
      } else {
        dxr = x - this.rightBreakPoint(node, directrix);
        if (dxr > this.eps()) {
          if (!node.right) {
            lArc = node;
            break;
          }
          node = node.right;
        } else {
          if (dxl > -this.eps()) {
            lArc = node.prev;
            rArc = node;
          } else if (dxr > -this.eps()) {
            lArc = node;
            rArc = node.next;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    let newArc = this.createBeachsection(site);
    this.beachline.insertSuccessor(lArc, newArc);
    if (!lArc && !rArc) {
      return;
    }
    if (lArc === rArc) {
      this.detachCircleEvent(lArc);
      rArc = this.createBeachsection(lArc.site);
      this.beachline.insertSuccessor(newArc, rArc);
      newArc.edge = rArc.edge = this.createEdge(lArc.site, newArc.site);
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }
    if (lArc && !rArc) {
      newArc.edge = this.createEdge(lArc.site, newArc.site);
      return;
    }
    if (lArc !== rArc) {
      this.detachCircleEvent(lArc);
      this.detachCircleEvent(rArc);
      let lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = this.createVertex((cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay);
      this.setEdgeStartpoint(rArc.edge, lSite, rSite, vertex);
      newArc.edge = this.createEdge(lSite, site, void 0, vertex);
      rArc.edge = this.createEdge(site, rSite, void 0, vertex);
      this.attachCircleEvent(lArc);
      this.attachCircleEvent(rArc);
      return;
    }
  }
  attachCircleEvent(arc) {
    let lArc = arc.prev, rArc = arc.next;
    if (!lArc || !rArc) {
      return;
    }
    let lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) {
      return;
    }
    let bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    let d = 2 * (ax * cy - ay * cx);
    if (d >= -2e-12) {
      return;
    }
    let ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, ycenter = y + by;
    let circleEvent = this.circleEventJunkyard.pop();
    if (!circleEvent) {
      circleEvent = new RBTreeNode();
    }
    circleEvent.arc = arc;
    circleEvent.site = cSite;
    circleEvent.x = x + bx;
    circleEvent.y = ycenter + this.sqrt(x * x + y * y);
    circleEvent.ycenter = ycenter;
    arc.circleEvent = circleEvent;
    let predecessor = null, node = this.circleEvents.root;
    while (node) {
      if (circleEvent.y < node.y || circleEvent.y === node.y && circleEvent.x <= node.x) {
        if (node.left) {
          node = node.left;
        } else {
          predecessor = node.prev;
          break;
        }
      } else {
        if (node.right) {
          node = node.right;
        } else {
          predecessor = node;
          break;
        }
      }
    }
    this.circleEvents.insertSuccessor(predecessor, circleEvent);
    if (!predecessor) {
      this.firstCircleEvent = circleEvent;
    }
  }
  detachCircleEvent(arc) {
    let circleEvent = arc.circleEvent;
    if (circleEvent) {
      if (!circleEvent.prev) {
        this.firstCircleEvent = circleEvent.next;
      }
      this.circleEvents.removeNode(circleEvent);
      this.circleEventJunkyard.push(circleEvent);
      arc.circleEvent = null;
    }
  }
  // connect dangling edges (not if a cursory test tells us
  // it is not going to be visible.
  // return value:
  //   false: the dangling endpoint couldn't be connected
  //   true: the dangling endpoint could be connected
  connectEdge(edge, bbox) {
    let vb = edge.vb;
    if (!!vb) {
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
      if (!this.connectEdge(edge, bbox) || !this.clipEdge(edge, bbox) || abs_fn(edge.va.x - edge.vb.x) < this.eps() && abs_fn(edge.va.y - edge.vb.y) < this.eps()) {
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
        if (abs_fn(va.x - vz.x) >= this.eps() || abs_fn(va.y - vz.y) >= this.eps()) {
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
