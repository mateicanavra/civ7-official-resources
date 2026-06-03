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

export { graphAlgo };
//# sourceMappingURL=graph-algorithms.js.map
