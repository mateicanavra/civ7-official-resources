import { u as utils, G as Graph } from './utils.chunk.js';

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

var EdgeRelations = /* @__PURE__ */ ((EdgeRelations2) => {
  EdgeRelations2["in"] = "inEdges";
  EdgeRelations2["out"] = "outEdges";
  return EdgeRelations2;
})(EdgeRelations || {});
var order;
((order2) => {
  function run(g) {
    const maxRank = utils.maxRank(g);
    const downLayerGraphs = buildLayerGraphs(g, utils.range(1, maxRank + 1), "inEdges" /* in */);
    const upLayerGraphs = buildLayerGraphs(g, utils.range(maxRank - 1, -1, -1), "outEdges" /* out */);
    let layering = initOrder(g);
    assignOrder(g, layering);
    let bestCC = Number.POSITIVE_INFINITY;
    let best = [];
    for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
      sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
      layering = utils.buildLayerMatrix(g);
      const cc = crossCount(g, layering);
      if (cc < bestCC) {
        lastBest = 0;
        best = utils.cloneSimpleArray(layering);
        bestCC = cc;
      }
      if (cc == bestCC && bestCC == 0) {
        best = utils.cloneSimpleArray(layering);
      }
    }
    assignOrder(g, best);
  }
  order2.run = run;
  function buildLayerGraphs(g, ranks, relationship) {
    return ranks.map(function(rank) {
      return buildLayerGraph(g, rank, relationship);
    });
  }
  function buildLayerGraph(g, rank, relationship) {
    const root = createRootNode(g);
    const result = new Graph({ compound: true }).setGraph({ root }).setDefaultNodeLabel(function(v) {
      return g.node(v);
    });
    g.nodes().forEach(function(v) {
      const node = g.node(v);
      const parent = g.parent(v);
      if (node.rank === rank || node.minRank <= rank && rank <= node.maxRank) {
        result.setNode(v);
        result.setParent(v, parent || root);
        g[relationship](v)?.forEach(function(e) {
          const u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = edge !== void 0 ? edge.weight : 0;
          result.setEdge(u, v, { weight: g.edge(e).weight + weight });
        });
        if (node.hasOwnProperty("minRank")) {
          result.setNode(v, {
            borderLeft: node.borderLeft[rank],
            borderRight: node.borderRight[rank]
          });
        }
      }
    });
    return result;
  }
  function createRootNode(g) {
    let v;
    while (g.hasNode(v = utils.uniqueId("_root"))) ;
    return v;
  }
  function sweepLayerGraphs(layerGraphs, biasRight) {
    const cg = new Graph();
    layerGraphs.forEach(function(lg) {
      const root = lg.graph().root;
      const sorted = sortSubgraph(lg, root, cg, biasRight);
      sorted.vs.forEach(function(v, i) {
        lg.node(v).order = i;
      });
      addSubgraphConstraints(lg, cg, sorted.vs);
    });
  }
  function sortSubgraph(g, v, cg, biasRight) {
    let movable = g.children(v);
    const node = g.node(v);
    const bl = node ? node.borderLeft : void 0;
    const br = node ? node.borderRight : void 0;
    const subgraphs = {};
    if (bl) {
      movable = movable.filter(function(w) {
        return w !== bl && w !== br;
      });
    }
    const barycenters = barycenter(g, movable);
    barycenters.forEach(function(entry) {
      if (g.children(entry.v).length) {
        const subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
        subgraphs[entry.v] = subgraphResult;
        if (subgraphResult.hasOwnProperty("barycenter")) {
          mergeBarycenters(entry, subgraphResult);
        }
      }
    });
    const entries = resolveConflicts(barycenters, cg);
    expandSubgraphs(entries, subgraphs);
    const result = sort(entries, biasRight);
    if (bl) {
      result.vs = utils.flatten([bl, result.vs, br]);
      if (g.predecessors(bl).length) {
        const blPred = g.node(g.predecessors(bl)[0]);
        const brPred = g.node(g.predecessors(br)[0]);
        if (!result.hasOwnProperty("barycenter")) {
          result.barycenter = 0;
          result.weight = 0;
        }
        if (result.barycenter != void 0 && result.weight != void 0) {
          result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
          result.weight += 2;
        }
      }
    }
    return result;
  }
  function addSubgraphConstraints(g, cg, vs) {
    const prev = {};
    let rootPrev;
    vs.forEach(function(v) {
      let child = g.parent(v);
      let parent;
      let prevChild;
      while (child) {
        parent = g.parent(child);
        if (parent) {
          prevChild = prev[parent];
          prev[parent] = child;
        } else {
          prevChild = rootPrev;
          rootPrev = child;
        }
        if (prevChild && prevChild !== child) {
          cg.setEdge(prevChild, child);
          return;
        }
        child = parent;
      }
    });
  }
  function barycenter(g, movable) {
    return movable.map(function(v) {
      const inV = g.inEdges(v);
      if (!inV?.length) {
        return { v };
      } else {
        const result = inV.reduce(
          function(acc, e) {
            const edge = g.edge(e);
            const nodeU = g.node(e.v);
            return {
              sum: acc.sum + edge.weight * nodeU.order,
              weight: acc.weight + edge.weight
            };
          },
          { sum: 0, weight: 0 }
        );
        return {
          v,
          barycenter: result.sum / result.weight,
          weight: result.weight
        };
      }
    });
  }
  function resolveConflicts(entries, cg) {
    const mappedEntries = {};
    entries.forEach(function(entry, i) {
      const tmp = mappedEntries[entry.v] = {
        indegree: 0,
        in: [],
        out: [],
        vs: [entry.v],
        i
      };
      if (entry.barycenter != void 0) {
        tmp.barycenter = entry.barycenter;
        tmp.weight = entry.weight;
      }
    });
    cg.edges().forEach(function(e) {
      const entryV = mappedEntries[e.v];
      const entryW = mappedEntries[e.w];
      if (entryV != void 0 && entryW != void 0) {
        entryW.indegree++;
        entryV.out.push(mappedEntries[e.w]);
      }
    });
    const sourceSet = [];
    for (const entryKey in mappedEntries) {
      const entry = mappedEntries[entryKey];
      if (!entry.indegree) {
        sourceSet.push(entry);
      }
    }
    return doResolveConflicts(sourceSet);
  }
  function doResolveConflicts(sourceSet) {
    const entries = [];
    function handleIn(vEntry) {
      return function(uEntry) {
        if (uEntry.merged) {
          return;
        }
        if (uEntry.barycenter == void 0 || vEntry.barycenter == void 0 || uEntry.barycenter >= vEntry.barycenter) {
          mergeEntries(vEntry, uEntry);
        }
      };
    }
    function handleOut(vEntry) {
      return function(wEntry) {
        wEntry["in"].push(vEntry);
        if (--wEntry.indegree === 0) {
          sourceSet.push(wEntry);
        }
      };
    }
    while (sourceSet.length) {
      const entry = sourceSet.pop();
      if (entry) {
        entries.push(entry);
        entry["in"].reverse().forEach((entry2) => handleIn(entry2));
        entry.out.forEach((entry2) => handleOut(entry2));
      }
    }
    return entries.filter(function(entry) {
      return !entry.merged;
    }).map((entry) => {
      const newEntry = {
        vs: entry.vs,
        i: entry.i
      };
      if (entry.barycenter != void 0 && entry.weight != void 0) {
        newEntry.barycenter = entry.barycenter;
        newEntry.weight = entry.weight;
      }
      return newEntry;
    });
  }
  function expandSubgraphs(entries, subgraphs) {
    entries.forEach(function(entry) {
      entry.vs = utils.flatten(
        entry.vs.map(function(v) {
          if (subgraphs[v]) {
            return subgraphs[v].vs;
          }
          return v;
        })
      );
    });
  }
  function sort(entries, biasRight) {
    const parts = utils.partition(entries, function(entry) {
      return entry.hasOwnProperty("barycenter");
    });
    const sortable = parts.lhs;
    const unsortable = parts.rhs.sort(function(entryA, entryB) {
      return entryB.i - entryA.i;
    });
    const vs = [];
    let sum = 0;
    let weight = 0;
    let vsIndex = 0;
    sortable.sort(compareWithBias(!!biasRight));
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    sortable.forEach(function(entry) {
      vsIndex += entry.vs.length;
      vs.push(entry.vs);
      sum += entry.barycenter * entry.weight;
      weight += entry.weight;
      vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    });
    const result = { vs: utils.flatten(vs) };
    if (weight) {
      result.barycenter = sum / weight;
      result.weight = weight;
    }
    return result;
  }
  function compareWithBias(bias) {
    return function(entryV, entryW) {
      if (entryV.barycenter != void 0 && entryW.barycenter != void 0 && entryV.barycenter < entryW.barycenter) {
        return -1;
      } else if (entryV.barycenter != void 0 && entryW.barycenter != void 0 && entryV.barycenter > entryW.barycenter) {
        return 1;
      }
      return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
    };
  }
  function consumeUnsortable(vs, unsortable, index) {
    let last;
    while (unsortable.length && (last = unsortable[unsortable.length - 1]).i <= index) {
      unsortable.pop();
      vs.push(last.vs);
      index++;
    }
    return index;
  }
  function mergeEntries(target, source) {
    let sum = 0;
    let weight = 0;
    if (target.weight && target.barycenter) {
      sum += target.barycenter * target.weight;
      weight += target.weight;
    }
    if (source.weight && source.barycenter) {
      sum += source.barycenter * source.weight;
      weight += source.weight;
    }
    target.vs = source.vs.concat(target.vs);
    target.barycenter = sum / weight;
    target.weight = weight;
    target.i = Math.min(source.i, target.i);
    source.merged = true;
  }
  function mergeBarycenters(target, other) {
    if (target.barycenter != void 0 && target.weight != void 0 && other.barycenter != void 0 && other.weight != void 0) {
      target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
      target.weight += other.weight;
    } else {
      target.barycenter = other.barycenter;
      target.weight = other.weight;
    }
  }
  function initOrder(g) {
    const visited = {};
    const simpleNodes = g.nodes().filter(function(v) {
      return !g.children(v).length;
    });
    const maxRank = Math.max(
      ...simpleNodes.map(function(v) {
        return g.node(v).rank;
      })
    );
    const layers = utils.range(0, maxRank + 1).map(function() {
      return [];
    });
    function dfs(v) {
      if (visited[v] != void 0) return;
      visited[v] = true;
      const node = g.node(v);
      layers[node.rank].push(v);
      g.successors(v)?.forEach((v2) => dfs(v2));
    }
    const orderedVs = simpleNodes.sort(function(v, w) {
      return g.node(v).rank - g.node(w).rank;
    });
    orderedVs.forEach((v) => dfs(v));
    return layers;
  }
  function assignOrder(g, layering) {
    layering.forEach(function(layer) {
      layer.forEach(function(v, i) {
        g.node(v).order = i;
      });
    });
  }
  function crossCount(g, layering) {
    let cc = 0;
    for (let i = 1; i < layering.length; ++i) {
      cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
    }
    return cc;
  }
  function twoLayerCrossCount(g, northLayer, southLayer) {
    const southPos = utils.zipObject(
      southLayer,
      southLayer.map(function(_v, i) {
        return i;
      })
    );
    const southEntries = utils.flatten(
      northLayer.map(function(v) {
        const posOutEdges = g.outEdges(v)?.map(function(e) {
          return { pos: southPos[e.w], weight: g.edge(e).weight };
        });
        const southEntries2 = posOutEdges?.sort((a, b) => a.pos - b.pos);
        return southEntries2 || [];
      })
    );
    let firstIndex = 1;
    while (firstIndex < southLayer.length) firstIndex <<= 1;
    const treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;
    const tree = new Array(treeSize).fill(0);
    let cc = 0;
    southEntries.forEach(function(entry) {
      let index = entry.pos + firstIndex;
      tree[index] += entry.weight;
      let weightSum = 0;
      while (index > 0) {
        if (index % 2) {
          weightSum += tree[index + 1];
        }
        index = index - 1 >> 1;
        tree[index] += entry.weight;
      }
      cc += entry.weight * weightSum;
    });
    return cc;
  }
})(order || (order = {}));

var graphAlgo;
((graphAlgo2) => {
  function postorder(g, vs) {
    return dfs(g, vs, "post");
  }
  graphAlgo2.postorder = postorder;
  function preorder(g, vs) {
    return dfs(g, vs, "pre");
  }
  graphAlgo2.preorder = preorder;
  function dfs(g, vs, order) {
    if (!Array.isArray(vs)) {
      vs = [vs];
    }
    const navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);
    const acc = [];
    const visited = {};
    vs.forEach((v) => {
      if (!g.hasNode(v)) {
        throw new Error("Graph does not have node: " + v);
      }
      doDfs(g, v, order === "post", visited, navigation, acc);
    });
    return acc;
  }
  function doDfs(g, v, postorder2, visited, navigation, acc) {
    if (visited[v] == void 0) {
      visited[v] = true;
      if (!postorder2) {
        acc.push(v);
      }
      const navigationResult = navigation(v);
      if (navigationResult != void 0) {
        navigationResult.forEach((w) => {
          doDfs(g, w, postorder2, visited, navigation, acc);
        });
      }
      if (postorder2) {
        acc.push(v);
      }
    }
  }
})(graphAlgo || (graphAlgo = {}));

var ranker;
((ranker2) => {
  function networkSimplex(g) {
    g = simplify(g);
    longestPath(g);
    const t = feasibleTree(g);
    initLowLimValues(t);
    initCutValues(t, g);
    let e;
    let f;
    while (e = leaveEdge(t)) {
      f = enterEdge(t, g, e);
      if (f) {
        exchangeEdges(t, g, e, f);
      } else {
        console.error("Couldn't exchange edges");
      }
    }
    return g;
  }
  ranker2.networkSimplex = networkSimplex;
  function simplify(g) {
    const simplified = new Graph().setGraph(g.graph());
    g.nodes().forEach((v) => {
      simplified.setNode(v, g.node(v));
    });
    g.edges().forEach((e) => {
      const simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlength: 1 };
      const label = g.edge(e);
      if (simpleLabel.minlength) {
        simplified.setEdge(e.v, e.w, {
          weight: simpleLabel.weight + label.weight,
          minlength: Math.max(simpleLabel.minlength, label.minlength)
        });
      } else {
        console.error("No minlength for simpleLabel", simpleLabel);
      }
    });
    return simplified;
  }
  function longestPath(g) {
    const visited = {};
    const ranks = {};
    function dfs(v) {
      const label = ranks[v];
      if (visited[v] != void 0) {
        return label.rank;
      }
      visited[v] = true;
      let outEdges = g.outEdges(v);
      if (outEdges == void 0) {
        outEdges = [];
      }
      const mappedEdges = outEdges.map((e) => {
        return dfs(e.w) - g.edge(e).minlength;
      });
      let rank = Math.min(...mappedEdges);
      if (rank === Number.POSITIVE_INFINITY || rank === void 0 || rank === null) {
        rank = 0;
      }
      ranks[v] = { rank };
      return rank;
    }
    g.sources().forEach((s) => dfs(s));
    g.nodes().forEach((v) => {
      const { rank } = ranks[v];
      g.setNode(v, { ...g.node(v), rank });
    });
  }
  function feasibleTree(g) {
    const t = new Graph({ directed: false });
    const start = g.nodes()[0];
    const size = g.nodeCount();
    t.setNode(start, {});
    let edge;
    let delta;
    while (tightTree(t, g) < size) {
      edge = findMinSlackEdge(t, g);
      if (edge) {
        delta = t.hasNode(edge.v) ? slack(g, edge) : -slack(g, edge);
        shiftRanks(t, g, delta);
      } else {
        console.error("The edge is undefined");
        break;
      }
    }
    return t;
  }
  function tightTree(t, g) {
    function dfs(v) {
      const nodeEdges = g.nodeEdges(v);
      if (nodeEdges != void 0) {
        nodeEdges.forEach(function(e) {
          const edgeV = e.v;
          const w = v === edgeV ? e.w : edgeV;
          if (!t.hasNode(w) && !slack(g, e)) {
            t.setNode(w, {});
            t.setEdge(v, w, {});
            dfs(w);
          }
        });
      }
    }
    t.nodes().forEach((v) => dfs(v));
    return t.nodeCount();
  }
  function findMinSlackEdge(t, g) {
    let minSlack = Number.POSITIVE_INFINITY;
    let minSlackEdge = void 0;
    g.edges().forEach((e) => {
      if (t.hasNode(e.v) !== t.hasNode(e.w)) {
        const edgeSlack = slack(g, e);
        if (edgeSlack < minSlack) {
          minSlack = edgeSlack;
          minSlackEdge = e;
        }
      }
    });
    return minSlackEdge;
  }
  function shiftRanks(t, g, delta) {
    t.nodes().forEach((v) => {
      g.node(v).rank += delta;
    });
  }
  function slack(g, e) {
    return g.node(e.w).rank - g.node(e.v).rank - g.edge(e).minlength;
  }
  function initLowLimValues(tree, root) {
    if (!root) {
      root = tree.nodes()[0];
    }
    dfsAssignLowLim(tree, {}, 1, root);
  }
  function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
    const low = nextLim;
    const label = tree.node(v);
    visited[v] = true;
    const neighbors = tree.neighbors(v);
    if (neighbors) {
      neighbors.forEach((w) => {
        if (visited[w] == void 0) {
          nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
        }
      });
    } else {
      console.error("There are no neighbors", neighbors);
    }
    label.low = low;
    label.lim = nextLim++;
    if (parent) {
      label.parent = parent;
    } else {
      delete label.parent;
    }
    return nextLim;
  }
  function initCutValues(t, g) {
    let vs = graphAlgo.postorder(t, t.nodes());
    vs = vs.slice(0, vs.length - 1);
    vs.forEach((v) => {
      assignCutValue(t, g, v);
    });
  }
  function assignCutValue(t, g, child) {
    const childLab = t.node(child);
    const parent = childLab.parent;
    t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
  }
  function calcCutValue(t, g, child) {
    const childLab = t.node(child);
    const parent = childLab.parent;
    let childIsTail = true;
    let graphEdge = g.edge(child, parent);
    let cutValue = 0;
    if (!graphEdge) {
      childIsTail = false;
      graphEdge = g.edge(parent, child);
    }
    cutValue = graphEdge.weight;
    const childEdges = g.nodeEdges(child);
    if (childEdges != void 0) {
      childEdges.forEach((e) => {
        const isOutEdge = e.v === child;
        const other = isOutEdge ? e.w : e.v;
        if (other !== parent) {
          const pointsToHead = isOutEdge === childIsTail;
          const otherWeight = g.edge(e).weight;
          cutValue += pointsToHead ? otherWeight : -otherWeight;
          if (isTreeEdge(t, child, other)) {
            const otherCutValue = t.edge(child, other).cutvalue;
            cutValue += pointsToHead ? -otherCutValue : otherCutValue;
          }
        }
      });
    } else {
      console.error("There are no edges in child: " + child);
    }
    return cutValue;
  }
  function isTreeEdge(tree, u, v) {
    return tree.hasEdge(u, v);
  }
  function leaveEdge(tree) {
    const foundEdge = tree.edges().find((e) => tree.edge(e).cutvalue < 0);
    return foundEdge;
  }
  function enterEdge(t, g, edge) {
    let v = edge.v;
    let w = edge.w;
    if (!g.hasEdge(v, w)) {
      v = edge.w;
      w = edge.v;
    }
    const vLabel = t.node(v);
    const wLabel = t.node(w);
    let tailLabel = vLabel;
    let flip = false;
    if (vLabel.lim > wLabel.lim) {
      tailLabel = wLabel;
      flip = true;
    }
    const candidates = g.edges().filter(function(edge2) {
      return flip === isDescendant(t.node(edge2.v), tailLabel) && flip !== isDescendant(t.node(edge2.w), tailLabel);
    });
    let minSlack = Number.POSITIVE_INFINITY;
    let minSlackEdge = void 0;
    candidates.forEach((edge2) => {
      const edgeSlack = slack(g, edge2);
      if (edgeSlack < minSlack) {
        minSlack = edgeSlack;
        minSlackEdge = edge2;
      }
    });
    return minSlackEdge;
  }
  function exchangeEdges(t, g, e, f) {
    const v = e.v;
    const w = e.w;
    t.removeEdge(v, w);
    t.setEdge(f.v, f.w, {});
    initLowLimValues(t);
    initCutValues(t, g);
    updateRanks(t, g);
  }
  function isDescendant(vLabel, rootLabel) {
    return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
  }
  function updateRanks(t, g) {
    const root = t.nodes().find(function(v) {
      return !g.node(v).parent;
    });
    if (root != void 0) {
      let vs = graphAlgo.preorder(t, [root]);
      vs = vs.slice(1);
      vs.forEach(function(v) {
        const parent = t.node(v).parent;
        let edge = g.edge(v, parent);
        let flipped = false;
        if (!edge) {
          edge = g.edge(parent, v);
          flipped = true;
        }
        g.node(v).rank = g.node(parent).rank + (flipped ? edge.minlength : -edge.minlength);
      });
    } else {
      console.error("Root of updateRanks() tree is undefined");
    }
  }
})(ranker || (ranker = {}));

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

export { GraphLayout as G };
//# sourceMappingURL=layout.chunk.js.map
