import { Graph, isEmpty, constant } from './graph.js';

var utils;
((utils2) => {
  utils2.graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
  utils2.graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
  utils2.graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
  utils2.nodeNumAttrs = ["width", "height"];
  utils2.nodeDefaults = { width: 0, height: 0 };
  utils2.edgeNumAttrs = ["minlength", "weight", "width", "height", "labeloffset"];
  utils2.edgeAttrs = ["labelpos"];
  utils2.edgeDefaults = {
    minlength: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  };
  function asNonCompoundGraph(g) {
    const simplified = new Graph({ multigraph: g.isMultigraph() }).setGraph(g.graph());
    g.nodes().forEach((v) => {
      if (!g.children(v).length) {
        simplified.setNode(v, g.node(v));
      }
    });
    g.edges().forEach((e) => {
      simplified.setEdge(e, g.edge(e));
    });
    return simplified;
  }
  utils2.asNonCompoundGraph = asNonCompoundGraph;
  utils2.isEmpty = isEmpty;
  utils2.constant = constant;
  function addDummyNode(g, type, attrs, name) {
    let v;
    do {
      v = uniqueId(name);
    } while (g.hasNode(v));
    attrs.dummy = type;
    g.setNode(v, attrs);
    return v;
  }
  utils2.addDummyNode = addDummyNode;
  let idCounter = 0;
  function uniqueId(prefix) {
    const id = ++idCounter;
    return prefix + id;
  }
  utils2.uniqueId = uniqueId;
  function maxRank(g) {
    const nodeRanks = g.nodes().reduce((results, v) => {
      const rank = g.node(v).rank;
      if (rank != void 0) {
        results.push(rank);
      }
      return results;
    }, []);
    return Math.max(...nodeRanks);
  }
  utils2.maxRank = maxRank;
  function maxOrder(g) {
    const nodeRanks = g.nodes().reduce((results, v) => {
      const order = g.node(v).order;
      if (order != void 0) {
        results.push(order);
      }
      return results;
    }, []);
    return Math.max(...nodeRanks);
  }
  utils2.maxOrder = maxOrder;
  function buildLayerMatrix(g) {
    const layering = range(0, maxRank(g) + 1).map(function() {
      return [];
    });
    g.nodes().forEach(function(v) {
      const node = g.node(v);
      const rank = node.rank;
      const order = node.order;
      if (rank != void 0) {
        layering[rank][order] = v;
      }
    });
    return layering;
  }
  utils2.buildLayerMatrix = buildLayerMatrix;
  function range(start = 0, end, step = 1, fromRight = false) {
    let index = -1, length = Math.max(Math.ceil((end - start) / (step || 1)), 0), result = Array(length);
    while (length--) {
      result[fromRight ? length : ++index] = start;
      start += step;
    }
    return result;
  }
  utils2.range = range;
  function flatten(array) {
    const length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
  }
  utils2.flatten = flatten;
  function baseFlatten(array, depth, isStrict) {
    let index = -1;
    const length = array.length;
    const result = [];
    while (++index < length) {
      const value = array[index];
      if (depth > 0 && Array.isArray(value)) {
        arrayPush(result, value);
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  function arrayPush(array, values) {
    let index = -1;
    const length = values.length;
    const offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  function partition(collection, fn) {
    const result = { lhs: [], rhs: [] };
    collection.forEach(function(value) {
      if (fn(value)) {
        result.lhs.push(value);
      } else {
        result.rhs.push(value);
      }
    });
    return result;
  }
  utils2.partition = partition;
  function zipObject(props, values) {
    return baseZipObject(props || [], values || []);
  }
  utils2.zipObject = zipObject;
  function baseZipObject(props, values) {
    let index = -1;
    const length = props.length;
    const valsLength = values.length;
    const result = {};
    while (++index < length) {
      const value = index < valsLength ? values[index] : void 0;
      result[props[index]] = value;
    }
    return result;
  }
  function cloneSimpleArray(arrayToClone) {
    const clone = [];
    for (let i = 0; i < arrayToClone.length; i++) {
      const value = arrayToClone[i];
      clone.push(value);
    }
    return clone;
  }
  utils2.cloneSimpleArray = cloneSimpleArray;
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  utils2.clamp = clamp;
})(utils || (utils = {}));

export { utils };
//# sourceMappingURL=utils.js.map
