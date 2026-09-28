function markerBegin(name) {
  if (typeof engine == "object" && typeof engine.call == "function") {
    engine.call("profileBegin", name);
  }
}
function markerEnd() {
  if (typeof engine == "object" && typeof engine.call == "function") {
    engine.call("profileEnd", 0);
  }
}
class profileScope {
  m_startTime = 0;
  m_name;
  constructor(name) {
    this.m_startTime = Date.now();
    this.m_name = name;
    console.log(`Begin Scope: ${this.m_name}`);
    markerBegin(name);
  }
  end() {
    const duration = Date.now() - this.m_startTime;
    console.log(`Scope end: ${this.m_name}, ${duration} ms`);
    markerEnd();
  }
}
function profileFunction(name, func) {
  const scope = new profileScope(name);
  const ret = func();
  scope.end();
  return ret;
}

export { profileFunction, profileScope };
//# sourceMappingURL=profiling.js.map
