import { Graph } from './graph.js';
import { normalize } from './layout-normalize.js';
import { order } from './layout-order.js';
import { ranker } from './layout-ranker.js';
import { utils } from './utils.js';

class GraphLayout {
  inputGraph;
  layoutGraph;
  rankedLayoutGraph;
  constructor(graph) {
    this.inputGraph = graph;
    this.layoutGraph = new Graph();
    this.rankedLayoutGraph = new Graph();
  }
  // Auto resolve doesn't need more than the relations between nodes (connectedNodeTypes in our case, adjacency list for more general graphs)
  autoResolve() {
    this.layoutGraph = this.getLayoutGraph();
    this.rankedLayoutGraph = this.rank(utils.asNonCompoundGraph(this.layoutGraph));
    this.removeEmptyRanks(this.rankedLayoutGraph);
    this.normalizeRanks(this.rankedLayoutGraph);
    this.normalize(this.rankedLayoutGraph);
    this.order(this.rankedLayoutGraph);
    return this.rankedLayoutGraph;
  }
  // This will get us a layout graph so we can separate the steps for ranking, normalize and ordering if we want to.
  getLayoutGraph() {
    return this.buildLayoutGraph(this.inputGraph);
  }
  buildLayoutGraph(inputGraph) {
    const g = new Graph({ multigraph: true, compound: true });
    g.setGraph(utils.graphDefaults);
    inputGraph.nodes().forEach((v) => {
      g.setNode(v, utils.nodeDefaults);
      g.setParent(v, inputGraph.parent(v));
    });
    inputGraph.edges().forEach((e) => {
      g.setEdge(e, utils.edgeDefaults);
    });
    return g;
  }
  // Ranking will be private because the treeDepth (rank) is defined by the data and we will not automatically resolve the rank for now
  rank(g) {
    return this.networkSimplexRanker(g);
  }
  networkSimplexRanker(g) {
    return ranker.networkSimplex(g);
  }
  removeEmptyRanks(g) {
    const ranks = g.nodes().map((v) => g.node(v).rank);
    const offset = Math.min(...ranks);
    const layers = [];
    g.nodes().forEach(function(v) {
      const rank = g.node(v).rank - offset;
      if (!layers[rank]) {
        layers[rank] = [];
      }
      layers[rank].push(v);
    });
    let delta = 0;
    const nodeRankFactor = g.graph().nodeRankFactor || 0;
    layers.forEach(function(vs, i) {
      if (vs == void 0 && i % nodeRankFactor != 0) {
        --delta;
      } else if (delta) {
        vs.forEach(function(v) {
          g.node(v).rank += delta;
        });
      }
    });
  }
  /*
   * Adjusts the ranks for all nodes in the graph such that all nodes v have
   * rank(v) >= 0 and at least one node w has rank(w) = 0.
   */
  normalizeRanks(g) {
    const ranks = g.nodes().map((v) => g.node(v).rank);
    const min = Math.min(...ranks);
    g.nodes().forEach(function(v) {
      const node = g.node(v);
      if (node.hasOwnProperty("rank")) {
        node.rank -= min;
      }
    });
  }
  normalize(g) {
    normalize.run(g);
  }
  order(g) {
    order.run(g);
  }
}

export { GraphLayout };
//# sourceMappingURL=layout.js.map
