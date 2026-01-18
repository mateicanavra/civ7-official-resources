const DEFAULT_EDGE_NAME = "\0";
const GRAPH_NODE = "\0";
const EDGE_KEY_DELIM = "";
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}
function constant(value) {
  return function() {
    return value;
  };
}
class Graph {
  _isDirected;
  _isMultigraph;
  _isCompound;
  _defaultNodeLabelFn;
  _defaultEdgeLabelFn;
  _label;
  _nodes;
  _parent = {};
  _children = {};
  _in;
  _predecessors;
  _successors;
  _out;
  _edgeObjs;
  _edgeLabels;
  _nodeCount = 0;
  _edgeCount = 0;
  constructor(opts) {
    this._isDirected = true;
    this._isMultigraph = false;
    this._isCompound = false;
    if (opts != null) {
      this._isDirected = opts.directed != void 0 ? opts.directed : true;
      this._isMultigraph = opts.multigraph != void 0 ? opts.multigraph : false;
      this._isCompound = opts.compound != void 0 ? opts.compound : false;
    }
    this._label = void 0;
    this._defaultNodeLabelFn = constant(void 0);
    this._defaultEdgeLabelFn = constant(void 0);
    this._nodes = {};
    if (this._isCompound) {
      this._parent = {};
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }
    this._in = {};
    this._predecessors = {};
    this._out = {};
    this._successors = {};
    this._edgeObjs = {};
    this._edgeLabels = {};
  }
  /**
   * A directed graph is one that has no cycles,
   * as those used in Civ7 in Tech, Civics, and promotions
   * @returns Option for directed graph
   */
  isDirected() {
    return this._isDirected;
  }
  /**
   * A multi graph is one that has multiple edges for the same ending node
   * @returns Option for multi graph
   */
  isMultigraph() {
    return this._isMultigraph;
  }
  /**
   * Sets the graph label
   * @returns The graph
   */
  setGraph(label) {
    this._label = label;
    return this;
  }
  graph() {
    return this._label;
  }
  /*==== NODE METHODS ====*/
  /**
   * Sets a label as default for the v node
   * @param labelFn Function that returns a node name
   * @returns The graph
   */
  setDefaultNodeLabel(labelFn) {
    this._defaultNodeLabelFn = labelFn;
    return this;
  }
  /**
   * @returns Number of nodes in the graph
   */
  nodeCount() {
    return this._nodeCount;
  }
  /**
   * @returns The node names
   */
  nodes() {
    return Object.keys(this._nodes);
  }
  /**
   * A source node is the node where the edge starts
   * @returns List of source nodes
   */
  sources() {
    return this.nodes().filter((v) => {
      return isEmpty(this._in[v]);
    });
  }
  /**
   * A sink node is the node where the edge ends
   * @returns List of sink nodes
   */
  sinks() {
    return this.nodes().filter((v) => {
      return this._out[v] == void 0;
    });
  }
  /**
   * Sets a single node
   * @param v Node identifier
   * @param value A label, for computation purposes it may be an object
   * @returns List of sink nodes
   */
  setNode(v, value) {
    if (this._nodes.hasOwnProperty(v)) {
      if (value != void 0) {
        this._nodes[v] = value;
      }
      return this;
    }
    this._nodes[v] = value != void 0 ? value : this._defaultNodeLabelFn(v);
    if (this._isCompound) {
      this._parent[v] = GRAPH_NODE;
      this._children[v] = {};
      this._children[GRAPH_NODE][v] = true;
    }
    this._in[v] = {};
    this._predecessors[v] = {};
    this._out[v] = {};
    this._successors[v] = {};
    ++this._nodeCount;
    return this;
  }
  /**
   * @returns Node label, used to access the rank property
   */
  node(v) {
    return this._nodes[v];
  }
  /**
   * Checks if a node is in the graph
   * @param v Node identifier.
   */
  hasNode(v) {
    return this._nodes[v] != void 0;
  }
  /**
   * Removes a node with the provided identifier
   * @param v Node identifier.
   * @returns The graph.
   */
  removeNode(v) {
    if (this._nodes[v] != void 0) {
      const removeEdge = (e) => {
        this.removeEdge(this._edgeObjs[e]);
      };
      delete this._nodes[v];
      if (this._isCompound) {
        this.removeFromParentsChildList(v);
        delete this._parent[v];
        this.children(v).forEach((child) => {
          this.setParent(child);
        });
        delete this._children[v];
      }
      Object.keys(this._in[v]).forEach((e) => removeEdge(e));
      delete this._in[v];
      delete this._predecessors[v];
      Object.keys(this._out[v]).forEach((e) => removeEdge(e));
      delete this._out[v];
      delete this._successors[v];
      --this._nodeCount;
    }
    return this;
  }
  /**
   * Sets a parent to the provided node.
   * @param v Node identifier.
   * @param parent Parent node identifier.
   * @returns The graph.
   */
  setParent(v, parent) {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }
    if (parent == void 0) {
      parent = GRAPH_NODE;
    } else {
      for (let ancestor = parent; ancestor != void 0; ancestor = this.parent(ancestor)) {
        if (ancestor === v) {
          throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
        }
      }
      this.setNode(parent);
    }
    this.setNode(v);
    this.removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }
  /**
   * Removes a node from the parent.
   * @param v Node identifier.
   */
  removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }
  /**
   * @param v Node identifier.
   * @returns The parent of the node.
   */
  parent(v) {
    if (this._isCompound) {
      const parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
    return void 0;
  }
  /**
   * @param v Node identifier.
   * @returns The children of the node or root.
   */
  children(v) {
    if (v == void 0) {
      v = GRAPH_NODE;
    }
    if (this._isCompound) {
      const children = this._children[v];
      if (children) {
        return Object.keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    }
    return [];
  }
  /**
   * @param v Node identifier.
   * @returns List of node's predecessors ids.
   */
  predecessors(v) {
    const predsV = this._predecessors[v];
    if (predsV) {
      return Object.keys(predsV);
    } else {
      return [];
    }
  }
  /**
   * @param v Node identifier.
   * @returns List of node's successors ids.
   */
  successors(v) {
    const sucsV = this._successors[v];
    if (sucsV) {
      return Object.keys(sucsV);
    }
    return void 0;
  }
  /**
   * @param v Node identifier.
   * @returns List of node's neighbors ids.
   */
  neighbors(v) {
    const neighbors = [];
    const preds = this.predecessors(v);
    if (preds) {
      preds.forEach((p) => neighbors.push(p));
      const succ = this.successors(v);
      if (succ) {
        succ.forEach((s) => neighbors.push(s));
      }
      return neighbors;
    }
    return void 0;
  }
  setDefaultEdgeLabel(label) {
    if (typeof label !== "function") {
      label = constant(label);
    }
    this._defaultEdgeLabelFn = label;
    return this;
  }
  /**
   * @returns Number of edges
   */
  edgeCount() {
    return this._edgeCount;
  }
  /**
   * @returns List of edges
   */
  edges() {
    const edgeValues = Object.values(this._edgeObjs);
    return edgeValues;
  }
  setEdge(v, w, value, name) {
    const arg0 = arguments[0];
    let valueSpecified = false;
    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }
    v = "" + v;
    w = "" + w;
    if (name != void 0) {
      name = "" + name;
    }
    const e = this.edgeArgsToId(this._isDirected, v, w, name);
    if (this._edgeLabels[e] != void 0) {
      if (valueSpecified && value != void 0) {
        this._edgeLabels[e] = value;
      }
      return this;
    }
    if (name != void 0 && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }
    this.setNode(v);
    this.setNode(w);
    this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
    const edgeObj = this.edgeArgsToObj(this._isDirected, v, w, name);
    v = edgeObj.v;
    w = edgeObj.w;
    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    this.incrementOrInitEntry(this._predecessors[w], v);
    this.incrementOrInitEntry(this._successors[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }
  edge(v, w, name) {
    const e = arguments.length === 1 ? this.edgeObjToId(this._isDirected, arguments[0]) : this.edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }
  hasEdge(v, w, name) {
    let e = "";
    if (typeof v == "string" && w) {
      e = this.edgeArgsToId(this._isDirected, v, w, name);
    } else if (typeof v != "string") {
      e = this.edgeObjToId(this._isDirected, v);
    }
    return this._edgeLabels[e] != void 0;
  }
  removeEdge(v, w, name) {
    let e = "";
    if (typeof v != "string") {
      e = this.edgeObjToId(this._isDirected, v);
    } else if (w) {
      e = this.edgeArgsToId(this._isDirected, v, w, name);
    }
    if (!e) {
      throw Error(`edge v: ${v} couldn't be found`);
    }
    const edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      this.decrementOrRemoveEntry(this._predecessors[w], v);
      this.decrementOrRemoveEntry(this._successors[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }
  /**
   * @param v The node identifier
   * @returns A list of edges that are getting in the provided node
   */
  inEdges(v, u) {
    const inV = this._in[v];
    if (inV) {
      const edges = Object.values(inV);
      if (!u) {
        return edges;
      }
      return edges.filter((edge) => edge.v === u);
    }
    return void 0;
  }
  /**
   * @param v The node identifier
   * @returns A list of edges that are getting out the provided node
   */
  outEdges(v, w) {
    const outV = this._out[v];
    if (outV) {
      const edges = Object.values(outV);
      if (!w) {
        return edges;
      }
      return edges.filter((edge) => edge.w === w);
    }
    return void 0;
  }
  /**
   * @param v The node identifier
   * @returns All edges getting in or out the provided node
   */
  nodeEdges(v, w) {
    const inEdges = this.inEdges(v, w);
    if (inEdges) {
      const outEdges = this.outEdges(v, w);
      if (outEdges) {
        return inEdges.concat(outEdges);
      }
    }
    return void 0;
  }
  /**
   * Initializes an entry accumulator with 1 or increases it
   * @param v The node identifier
   * @returns All edges getting in or out the provided node
   */
  incrementOrInitEntry(map, k) {
    if (map[k]) {
      map[k]++;
    } else {
      map[k] = 1;
    }
  }
  /**
   * Deletes an entry accumulator when it it reaches zero or decreases it.
   * @param v The node identifier
   * @returns All edges getting in or out the provided node
   */
  decrementOrRemoveEntry(map, k) {
    if (!--map[k]) {
      delete map[k];
    }
  }
  /**
   * Creates an id for and edge using the params
   * @param isDirected Is used to know the direction of the edge
   * @param v_ Origin node
   * @param w_ End node
   * @param name Edge name
   * @returns Unique id
   */
  edgeArgsToId(isDirected, v_, w_, name) {
    let v = "" + v_;
    let w = "" + w_;
    if (!isDirected && v > w) {
      const tmp = v;
      v = w;
      w = tmp;
    }
    return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name == void 0 ? DEFAULT_EDGE_NAME : name);
  }
  /**
   * Creates an edge object using the params
   * @param isDirected Used to know the direction of the edge
   * @param v_ Origin node
   * @param w_ End node
   * @param name Edge name
   * @returns Unique id
   */
  edgeArgsToObj(isDirected, v_, w_, name) {
    let v = "" + v_;
    let w = "" + w_;
    if (!isDirected && v > w) {
      const tmp = v;
      v = w;
      w = tmp;
    }
    const edgeObj = { v, w };
    if (name) {
      edgeObj.name = name;
    }
    return edgeObj;
  }
  /**
   * Creates and id for and edge using the object
   * @param isDirected Used to know the direction of the edge
   * @param edgeObj Edge object used to grab params
   * @returns Unique id
   */
  edgeObjToId(isDirected, edgeObj) {
    return this.edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
  }
}

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

export { Graph as G, utils as u };
//# sourceMappingURL=utils.chunk.js.map
