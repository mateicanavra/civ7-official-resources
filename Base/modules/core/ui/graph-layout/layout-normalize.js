import { utils } from './utils.js';

var normalize;
((normalize2) => {
  function run(g) {
    g.graph().dummyChains = [];
    g.edges().forEach(function(edge) {
      normalizeEdge(g, edge);
    });
  }
  normalize2.run = run;
  function normalizeEdge(g, e) {
    let v = e.v;
    let vRank = g.node(v).rank;
    const w = e.w;
    const wRank = g.node(w).rank;
    const name = e.name;
    const edgeLabel = g.edge(e);
    const labelRank = edgeLabel.labelRank;
    if (wRank === vRank + 1) return;
    g.removeEdge(e);
    let dummy;
    let attrs;
    let i;
    for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
      edgeLabel.points = [];
      attrs = {
        width: 0,
        height: 0,
        edgeLabel,
        edgeObj: e,
        rank: vRank
      };
      dummy = utils.addDummyNode(g, "edge", attrs, "_d");
      if (vRank === labelRank) {
        attrs.width = edgeLabel.width;
        attrs.height = edgeLabel.height;
        attrs.dummy = "edge-label";
        attrs.labelpos = edgeLabel.labelpos;
      }
      g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
      const graphDummyChains = g.graph().dummyChains;
      if (i === 0 && graphDummyChains) {
        graphDummyChains.push(dummy);
      }
      v = dummy;
    }
    g.setEdge(v, w, { weight: edgeLabel.weight }, name);
  }
})(normalize || (normalize = {}));

export { normalize };
//# sourceMappingURL=layout-normalize.js.map
