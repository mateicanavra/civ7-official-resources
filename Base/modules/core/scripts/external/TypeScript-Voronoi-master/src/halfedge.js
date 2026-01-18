class Halfedge {
  constructor(edge, lSite, rSite) {
    this.site = lSite;
    this.edge = edge;
    if (rSite) {
      this.angle = Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x);
    } else {
      let va = edge.va;
      let vb = edge.vb;
      this.angle = edge.lSite === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
    }
  }
  getStartpoint() {
    return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
  }
  getEndpoint() {
    return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
  }
}

export { Halfedge };
//# sourceMappingURL=halfedge.js.map
