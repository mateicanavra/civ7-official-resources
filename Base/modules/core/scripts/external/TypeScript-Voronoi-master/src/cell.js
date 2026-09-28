class Cell {
  constructor(site) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    this.neighborIds = [];
  }
  init(site) {
    this.site = site;
    this.halfedges = [];
    this.closeMe = false;
    this.neighborIds.length = 0;
    return this;
  }
  prepareHalfedges() {
    let halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let edge;
    while (iHalfedge--) {
      edge = halfedges[iHalfedge].edge;
      if (!edge.vb || !edge.va) {
        halfedges.splice(iHalfedge, 1);
      }
    }
    halfedges.sort((a, b) => {
      return b.angle - a.angle;
    });
    return halfedges.length;
  }
  // Return a list of the neighbor Ids
  getNeighborIds() {
    if (this.neighborIds.length > 0) {
      return this.neighborIds;
    }
    let iHalfedge = this.halfedges.length;
    let edge;
    while (iHalfedge--) {
      edge = this.halfedges[iHalfedge].edge;
      if (edge.lSite !== null && edge.lSite.id != this.site.id) {
        this.neighborIds.push(edge.lSite.id);
      } else if (edge.rSite !== null && edge.rSite.id != this.site.id) {
        this.neighborIds.push(edge.rSite.id);
      }
    }
    return this.neighborIds;
  }
  // Compute bounding box
  //
  getBbox() {
    let halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    let v, vx, vy;
    while (iHalfedge--) {
      v = halfedges[iHalfedge].getStartpoint();
      vx = v.x;
      vy = v.y;
      if (vx < xmin) {
        xmin = vx;
      }
      if (vy < ymin) {
        ymin = vy;
      }
      if (vx > xmax) {
        xmax = vx;
      }
      if (vy > ymax) {
        ymax = vy;
      }
    }
    return {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin
    };
  }
  // Return whether a point is inside, on, or outside the cell:
  //   -1: point is outside the perimeter of the cell
  //    0: point is on the perimeter of the cell
  //    1: point is inside the perimeter of the cell
  //
  pointIntersection(x, y) {
    let halfedges = this.halfedges;
    let iHalfedge = halfedges.length;
    let halfedge;
    let p0, p1;
    let r;
    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p0 = halfedge.getStartpoint();
      p1 = halfedge.getEndpoint();
      r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);
      if (!r) {
        return 0;
      }
      if (r > 0) {
        return -1;
      }
    }
    return 1;
  }
}

export { Cell };
//# sourceMappingURL=cell.js.map
